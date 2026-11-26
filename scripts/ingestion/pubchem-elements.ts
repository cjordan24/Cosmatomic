/**
 * Adapter: PubChem periodic table + PUG View element records.
 *
 * Sources (verified 2026-11):
 *   https://pubchem.ncbi.nlm.nih.gov/rest/pug/periodictable/JSON
 *   https://pubchem.ncbi.nlm.nih.gov/rest/pug_view/data/element/{Z}/JSON
 * PubChem usage policy: <= 5 requests/second; we use 1 request / 300 ms.
 *
 * Outputs:
 *   datasets/atomic/elements.json  — core properties for all 118 elements
 *   datasets/atomic/nuclides.json  — natural isotopes + AMDC/NUBASE nuclides per element
 */
import { fetchJson, parseUncertain, writeDataset } from './lib/ingest.ts';

const PT_URL = 'https://pubchem.ncbi.nlm.nih.gov/rest/pug/periodictable/JSON';
const VIEW_URL = (z: number) => `https://pubchem.ncbi.nlm.nih.gov/rest/pug_view/data/element/${z}/JSON`;
const RATE = { minIntervalMs: 300 };

interface PtResponse { Table: { Columns: { Column: string[] }; Row: { Cell: string[] }[] } }
interface Section { TOCHeading: string; Section?: Section[]; Information?: Info[] }
interface Info { ReferenceNumber: number; Name?: string; Value?: { StringWithMarkup?: { String: string }[]; Number?: number[] } }
interface Ref { ReferenceNumber: number; SourceName: string; URL?: string; LicenseURL?: string }

const num = (s: string | undefined): number | null => {
  if (s === undefined || s.trim() === '') return null;
  const v = Number(s);
  return Number.isFinite(v) ? v : null;
};

function findSections(root: Section, heading: string, out: Section[] = []): Section[] {
  if (root.TOCHeading === heading) out.push(root);
  for (const s of root.Section ?? []) findSections(s, heading, out);
  return out;
}
const strings = (i: Info | undefined) => i?.Value?.StringWithMarkup?.map((s) => s.String.trim()) ?? [];

/** "5.63×104 milligrams per kilogram" (superscript flattened) → 5.63e4 */
function parseAbundance(raw: string): number | null {
  const m = raw.match(/^([\d.]+)\s*(?:×\s*10(-?\d+))?\s*milligrams? per kilogram/);
  if (!m) return null;
  return Number(m[1]) * 10 ** Number(m[2] ?? 0);
}

/**
 * Parse a nuclide label such as "56Fe", "235Um" or "47Fem" → mass number + isomer flag.
 * The element symbol must be matched explicitly: a greedy [A-Z][a-z]? would read "235Um" as symbol "Um".
 */
function parseNuclide(label: string, symbol: string): { A: number; isomer: string | null } | null {
  const t = label.trim();
  const m = t.match(/^(\d+)(.*)$/);
  if (!m || !m[2].startsWith(symbol)) return null;
  const rest = m[2].slice(symbol.length);
  if (rest !== '' && !/^[a-z]+\d*$/.test(rest)) return null;
  return { A: Number(m[1]), isomer: rest || null };
}

/** Convert a NUBASE half-life string to seconds when it is a finite measured value. */
const UNIT_S: Record<string, number> = {
  ys: 1e-24, zs: 1e-21, as: 1e-18, fs: 1e-15, ps: 1e-12, ns: 1e-9, us: 1e-6, 'μs': 1e-6, ms: 1e-3, s: 1,
  m: 60, h: 3600, d: 86400, y: 31_557_600, ky: 3.15576e10, My: 3.15576e13, Gy: 3.15576e16, Ty: 3.15576e19,
  Py: 3.15576e22, Ey: 3.15576e25, Zy: 3.15576e28, Yy: 3.15576e31,
};
/** Observationally stable per NUBASE ("Stable" or "Stable (>lower bound)"). "p-Unstable" is NOT stable. */
const isStable = (raw: string) => /^stable/i.test(raw.trim());
/** Finite half-life in seconds, or null (stable, unknown, or only a bound). */
function halfLifeSeconds(raw: string): number | null {
  if (isStable(raw) || /not-specified|unstable/i.test(raw)) return null;
  const m = raw.replace(/[<>~#]/g, '').trim().match(/^([\d.]+)(?:\(\d+\))?\s*([a-zA-Zμ]+)/);
  if (!m) return null;
  const f = UNIT_S[m[2]];
  return f ? Number(m[1]) * f : null;
}

async function main() {
  const warnings: string[] = [];
  const pt = await fetchJson<PtResponse>(PT_URL, { ...RATE, cacheKey: 'pubchem/periodictable.json' });
  const cols = pt.Table.Columns.Column;
  const idx = (c: string) => cols.indexOf(c);
  if (pt.Table.Row.length !== 118) throw new Error(`Expected 118 elements, got ${pt.Table.Row.length}`);

  const elements = [];
  const nuclides: Record<string, unknown> = {};

  for (const row of pt.Table.Row) {
    const c = row.Cell;
    const Z = Number(c[idx('AtomicNumber')]);
    process.stdout.write(`\r  element ${Z}/118`);
    const view = await fetchJson<{ Record: Section & { Reference: Ref[] } }>(VIEW_URL(Z), {
      ...RATE,
      cacheKey: `pubchem/element-${Z}.json`,
    });
    const rec = view.Record;
    const refs = new Map(rec.Reference.map((r) => [r.ReferenceNumber, r]));
    const first = (h: string) => strings(findSections(rec, h)[0]?.Information?.[0])[0];

    // --- Natural isotopic composition (prefer IUPAC CIAAW, fall back to NIST) ---
    const natural: { A: number; mass: number; massUnc: number | null; abundance: number | null; abundanceUnc: number | null; abundanceInterval: [number, number] | null; source: string }[] = [];
    const isoSec = findSections(rec, 'Isotope Mass and Abundance')[0];
    if (isoSec?.Information) {
      const byRef = new Map<number, Info[]>();
      for (const i of isoSec.Information) byRef.set(i.ReferenceNumber, [...(byRef.get(i.ReferenceNumber) ?? []), i]);
      const ordered = [...byRef.entries()].sort(([a], [b]) => {
        const rank = (n: number) => (/CIAAW/.test(refs.get(n)?.SourceName ?? '') ? 0 : 1);
        return rank(a) - rank(b);
      });
      const [refNo, infos] = ordered[0];
      const col = (re: RegExp) => strings(infos.find((i) => re.test(i.Name ?? '')));
      const labels = col(/^Isotope/), masses = col(/Mass/), abund = col(/Abundance/);
      labels.forEach((l, k) => {
        const n = parseNuclide(l, c[idx('Symbol')]);
        const m = parseUncertain(masses[k]);
        if (!n || !m) return;
        // CIAAW gives an INTERVAL "[lo, hi]" for elements with variable terrestrial composition (H, Li, B, C, N, O, …)
        const interval = (abund[k] ?? '').replace(/\s+/g, '').match(/^\[([\d.]+),([\d.]+)\]$/);
        const a = interval ? null : parseUncertain(abund[k]);
        const range = interval ? [Number(interval[1]), Number(interval[2])] as [number, number] : null;
        natural.push({ A: n.A, mass: m.value, massUnc: m.uncertainty,
          abundance: range ? (range[0] + range[1]) / 2 : a?.value ?? null,
          abundanceUnc: range ? (range[1] - range[0]) / 2 : a?.uncertainty ?? null,
          abundanceInterval: range,
          source: refs.get(refNo)?.SourceName ?? 'unknown' });
      });
    }

    // --- Nuclide table from AMDC (NUBASE) ---
    const nucSec = findSections(rec, 'Atomic Mass, Half Life, and Decay')[0];
    const nucList: { A: number; isomer: string | null; mass: number | null; stable: boolean; halfLife: string; halfLifeS: number | null; decay: string; year: number | null }[] = [];
    if (nucSec?.Information) {
      const col = (re: RegExp) => strings(nucSec.Information!.find((i) => re.test(i.Name ?? '')));
      const labels = col(/^Nuclide/), masses = col(/Atomic Mass/), hl = col(/Half Life/), yr = col(/Discovery/), dm = col(/Decay/);
      labels.forEach((l, k) => {
        const n = parseNuclide(l, c[idx('Symbol')]);
        if (!n) { warnings.push(`Z=${Z}: unparsed nuclide label "${l}"`); return; }
        nucList.push({ A: n.A, isomer: n.isomer, mass: parseUncertain(masses[k])?.value ?? null, stable: isStable(hl[k] ?? ''), halfLife: hl[k] ?? '', halfLifeS: halfLifeSeconds(hl[k] ?? ''), decay: dm[k] ?? '', year: num(yr[k]) });
      });
    }
    const dupes = nucList.filter((n, i) => nucList.findIndex((x) => x.A === n.A && x.isomer === n.isomer) !== i);
    if (dupes.length) throw new Error(`Z=${Z}: duplicate nuclide entries ${dupes.map((d) => d.A + (d.isomer ?? '')).join(', ')}`);
    nuclides[Z] = { natural, nuclides: nucList };

    const crustRaw = first('Estimated Crustal Abundance');
    const crust = crustRaw ? parseAbundance(crustRaw) : null;
    if (crustRaw && crust === null && !/not applicable/i.test(crustRaw)) warnings.push(`Z=${Z}: unparsed crustal abundance "${crustRaw}"`);

    const weightRaw = c[idx('AtomicWeight')];
    const configRaw = c[idx('ElectronConfiguration')];
    elements.push({
      Z,
      symbol: c[idx('Symbol')],
      name: c[idx('Name')],
      atomicWeight: num(weightRaw),
      /** at least one isotope has a measured terrestrial abundance (a standard atomic weight applies) */
      hasNaturalAbundance: natural.some((n) => n.abundance !== null && n.abundance > 0),
      /** at least one ground-state nuclide is observationally stable (NUBASE) */
      hasStableIsotope: nucList.some((n) => n.stable && n.isomer === null),
      cpkHex: c[idx('CPKHexColor')] || null,
      electronConfiguration: configRaw.replace(/\s*\(.*\)\s*$/, ''),
      configurationPredicted: /predicted|calculated/i.test(configRaw),
      electronegativityPauling: num(c[idx('Electronegativity')]),
      vanDerWaalsRadiusPm: num(c[idx('AtomicRadius')]),
      ionizationEnergyEV: num(c[idx('IonizationEnergy')]),
      electronAffinityEV: num(c[idx('ElectronAffinity')]),
      oxidationStates: c[idx('OxidationStates')].split(',').map((s) => s.trim()).filter(Boolean).map(Number).filter(Number.isFinite),
      standardState: c[idx('StandardState')] || null,
      meltingPointK: num(c[idx('MeltingPoint')]),
      boilingPointK: num(c[idx('BoilingPoint')]),
      densityGcm3: num(c[idx('Density')]),
      groupBlock: c[idx('GroupBlock')],
      yearDiscovered: c[idx('YearDiscovered')] || null,
      group: num(first('Element Group Number')),
      period: num(first('Element Period Number')),
      crustalAbundanceMgKg: crust,
      groundLevel: first('Ground Level') ?? null,
      description: first('Description') ?? null,
      nistSpectraUrl: findSections(rec, 'Atomic Spectra')[0]?.Information?.find((i) => /lines/i.test(strings(i)[0] ?? ''))
        ? `https://physics.nist.gov/cgi-bin/ASD/lines_hold.pl?el=${c[idx('Symbol')]}` : null,
    });
  }
  process.stdout.write('\n');

  const sources = [
    { institution: 'PubChem (NCBI/NLM)', url: PT_URL, license: 'https://www.ncbi.nlm.nih.gov/home/about/policies/', notes: 'Periodic table summary properties' },
    { institution: 'IUPAC CIAAW via PubChem', url: 'https://www.ciaaw.org/', notes: 'Isotopic masses and natural abundances' },
    { institution: 'IAEA Atomic Mass Data Center (NUBASE) via PubChem', url: 'https://www-nds.iaea.org/relnsd/nubase/nubase_min.html', license: 'https://www-nds.iaea.org/disclaimer.html', notes: 'Nuclide masses, half-lives, decay modes' },
    { institution: 'CRC Handbook via PubChem', url: 'https://pubchem.ncbi.nlm.nih.gov/', notes: 'Estimated crustal abundance' },
  ];
  writeDataset('datasets/atomic/elements.json', elements, { dataset: 'elements', version: '1', records: elements.length, sources, adapter: 'scripts/ingestion/pubchem-elements.ts', warnings });
  writeDataset('datasets/atomic/nuclides.json', nuclides, { dataset: 'nuclides', version: '1', records: Object.keys(nuclides).length, sources: sources.slice(1, 3), adapter: 'scripts/ingestion/pubchem-elements.ts', warnings: [] });
}

main().catch((e) => { console.error(e); process.exit(1); });
