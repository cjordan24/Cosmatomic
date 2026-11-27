/**
 * Phase 8, Gate 8.5 — unified notebook. Snapshot records (route, parameters, readings, provenance, sources,
 * version), migration of stored records, and the CSV / Markdown exports with citations.
 */
import { describe, expect, it } from 'vitest';
import { migrateExperiment, type GravitationalExperiment, type WaveExperiment } from '@/shared/notebook';
import { APP, SNAPSHOT_SCHEMA, citeSource, entryCSV, entryMarkdown, makeSnapshot, parseRoute, unify } from '@/shared/snapshot';
import { getSource } from '@/shared/sources/sources';

const captured = {
  route: '#/spectral/compare?L=a.H-I%2Cbb.sun&x=6.5646e-7&ax=frequency',
  title: 'Spectra on one axis',
  provenance: ['Observed', 'derived', 'derived', 'nonsense'],
  sources: ['nist-asd', 'iau-2015-b3', 'nist-asd'],
  readings: [{ label: 'wavelength', value: '656.46 nm' }, { label: 'wavelength', value: '656.46 nm' }, { label: 'frequency', value: '456.68 THz' }, { label: '', value: 'x' }],
  series: [{ title: 'Probe y(t)', x: { name: 'time', unit: 's' }, y: { name: 'y', unit: 'm' }, provenance: 'derived', method: 'analytic', points: [[0, 0], [0.5, 1e-3]] as [number, number][] }],
  screenshot: null,
};
const snap = makeSnapshot(captured, '', 'Hα on the frequency axis', new Date('2026-11-27T10:00:00Z'));

describe('snapshot records', () => {
  it('parse a hash route into path and parameters', () => {
    expect(parseRoute('#/spectral/compare?L=a.H-I%2Cbb.sun&x=6.5e-7')).toEqual({ path: ['spectral', 'compare'], params: { L: 'a.H-I,bb.sun', x: '6.5e-7' } });
    expect(parseRoute('#/')).toEqual({ path: [], params: {} });
  });
  it('keep route, parameters, title, version and notes; de-duplicate readings and sources; keep only real provenance classes', () => {
    expect(snap.kind).toBe('snapshot');
    expect(snap.schema).toBe(SNAPSHOT_SCHEMA);
    expect(snap.route).toBe(captured.route);
    expect(snap.params).toEqual({ L: 'a.H-I,bb.sun', x: '6.5646e-7', ax: 'frequency' });
    expect(snap.name).toBe('Spectra on one axis · 2026-11-27 10:00');
    expect(snap.app).toEqual(APP);
    expect(snap.app.version).toMatch(/^\d+\.\d+\.\d+$/);
    expect(snap.provenance).toEqual(['observed', 'derived']);
    expect(snap.sources).toEqual(['nist-asd', 'iau-2015-b3']);
    expect(snap.readings).toEqual([{ label: 'wavelength', value: '656.46 nm' }, { label: 'frequency', value: '456.68 THz' }]);
    expect(snap.notes).toBe('Hα on the frequency axis');
  });
  it('survive a storage round trip through migrateExperiment; unknown shapes are dropped', () => {
    expect(migrateExperiment(JSON.parse(JSON.stringify(snap)))).toEqual(snap);
    expect(migrateExperiment({ id: 'x', kind: 'snapshot', mode: 'view-snapshot' })).toBeNull();   // no route
    expect(migrateExperiment({ id: 'x', kind: 'mystery' })).toBeNull();
  });
});

describe('older experiments read in the same shape (migration without rewriting)', () => {
  const grav = { id: 'exp-1', name: 'Binary', mode: 'gravitational-sandbox', createdAt: '2026-01-01T00:00:00Z', solver: { module: 'gravitational', integrator: 'yoshida4', dt: 3600, version: 'VPE-gravity 1.1' }, presetId: 'binary', epochJd: 2460000.5, provenance: 'hypothetical', initial: { t: 0, bodies: [], events: [] }, saved: { t: 0, bodies: [], events: [] }, events: [], notes: 'n', observations: { simYears: 1.5, relEnergyError: 1e-10, relAngMomError: 2e-12, bodies: 3 }, graphs: { energyDrift: [0, 1e-11, -2e-11] }, screenshot: null, dataSources: ['Textbook configuration (hypothetical)'] };
  const wave = { kind: 'wave', id: 'wave-1', name: 'String', mode: 'wave-lab', createdAt: '2026-01-02T00:00:00Z', model: 'travelling-sinusoid', solver: { version: 'VPE-waves 1.0', dt: null, courant: null }, params: { demo: 'traveling', f: '25' }, units: { 'wavelength λ': 'm' }, medium: { id: 'string', name: 'Stretched string', speed: 100, model: 'v = √(T/μ)', sources: ['ling-2016'] }, provenance: 'derived', simulatedTime: 0.5, observations: { 'wavelength λ': 4 }, notes: '', screenshot: null, dataSources: ['user parameters'], randomSeed: null };
  it('a legacy sandbox record (no kind) unifies with its restore route, readings and energy series', () => {
    const g = migrateExperiment(grav) as GravitationalExperiment;
    const u = unify(g);
    expect(u.kind).toBe('gravitational');
    expect(u.route).toBe('#/cosmic/sandbox?exp=exp-1');
    expect(u.readings.find((r) => r.label === 'relative energy error ΔE/E₀')!.value).toBe('1e-10');
    expect(u.series[0].points).toEqual([[0, 0], [1, 1e-11], [2, -2e-11]]);
    expect(u.app).toBeNull();
  });
  it('a wave-lab record unifies with the lab URL that restores it', () => {
    const u = unify(migrateExperiment(wave) as WaveExperiment);
    expect(u.route).toBe('#/spectral/lab?demo=traveling&f=25');
    expect(u.readings).toContainEqual({ label: 'wavelength λ', value: '4 m' });
    expect(u.sourceNotes).toContain('ling-2016');
  });
});

describe('exports', () => {
  const u = unify(snap);
  it('CSV: commented metadata, readings and each series with full precision', () => {
    const csv = entryCSV(u);
    expect(csv.split('\n')[0]).toBe(`# ${snap.name}`);
    expect(csv).toContain(`# route: ${captured.route}`);
    expect(csv).toContain(`# app: ${APP.version} (${APP.commit})`);
    expect(csv).toContain('# sources: nist-asd; iau-2015-b3');
    expect(csv).toContain('reading,value\nwavelength,656.46 nm\nfrequency,456.68 THz');
    expect(csv).toContain('time (s),y (m)\n0,0\n0.5,0.001');
  });
  it('Markdown: link to the view, version, readings table and numbered full citations from the Source index', () => {
    const mdx = entryMarkdown(u, getSource);
    expect(mdx).toContain(`- **View:** [${captured.route}](https://voyager-ventures.vercel.app/${captured.route})`);
    expect(mdx).toContain('| wavelength | 656.46 nm |');
    expect(mdx).toContain('## Sources');
    expect(mdx).toContain(`1. ${citeSource(getSource('nist-asd')!)}`);
    expect(mdx).toContain(`2. ${citeSource(getSource('iau-2015-b3')!)}`);
    expect(mdx).toContain('## Notes\n\nHα on the frequency axis');
  });
  it('citations use the DOI when there is one, else the URL, and add the licence', () => {
    const s = getSource('chebi')!;
    expect(citeSource(s)).toBe(`${s.citation} https://doi.org/10.1093/nar/gkaf1271 (licence: ${s.license})`);
  });
});
