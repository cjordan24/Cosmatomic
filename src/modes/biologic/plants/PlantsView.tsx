/**
 * Plants and microorganisms — #/biologic/plants?tab=photosynthesis|microbes&sel=   (Phase 11, Gate 11.7)
 *
 *  photosynthesis  NASA's equation and the balanced net reaction (×6); chlorophyll a and b absorption maxima
 *                  (OMLC/PhotochemCAD; points only) over the 5772 K black-body model of sunlight (Planck); photon
 *                  energies hc/λ at the maxima
 *  microbes        viruses, bacteria (prokaryotes), yeast-sized and plant cells on one log scale from the bundled
 *                  sizes, with NIGMS and NHGRI definitions
 */
import { navigate, setQuery, useRoute } from '@/shared/router';
import { KV, Panel, ProvenanceBadge } from '@/ui/components';
import { SourceLinks } from '@/ui/SourcesView';
import { RelatedLinks } from '@/ui/RelatedLinks';
import { LinePlot } from '@/ui/plots';
import { CONSTANTS } from '@/core/constants/constants';
import { formatSig } from '@/core/units/units';
import { planckLambda, peakWavelength } from '@/core/physics/thermal/radiation';
import { CATEGORY_COLOR, formatReport, lifeSize, reportSpan } from '@/modes/biologic/atlas/lifeSizes';
import plants from '@datasets/biology/plants.json';
import cells from '@datasets/biology/cells.json';

interface Peak { nm: number; epsilon: number; stated: boolean; quote: string }
interface Chl { id: string; name: string; solvent: string; url: string; peaks: Peak[]; quantumYield: { value: number; quote: string } }
const P = plants as unknown as { chlorophyll: Chl[]; photosynthesis: { quote: string; equation: string; reverse: { quote: string; note: string }; fuel: string } };
const C = cells as unknown as { nigms: { term: string; text: string }[]; nhgri: { term: string; text: string }[] };
const nigms = (t: string) => C.nigms.find((d) => d.term === t)!.text;
const nhgri = (t: string) => C.nhgri.find((d) => d.term === t)!.text;
const COLORS: Record<string, string> = { 'chl-a': '#5cf2a6', 'chl-b': '#f5c76b' };
/** Photon energy at wavelength λ (m): E = hc/λ, in eV and kJ/mol. */
export const photonEnergyEV = (lam: number) => (CONSTANTS.h.value * CONSTANTS.c.value) / lam / CONSTANTS.e.value;
export const photonEnergyKJmol = (lam: number) => (CONSTANTS.h.value * CONSTANTS.c.value * CONSTANTS.NA.value) / lam / 1000;

function PhotosynthesisTab() {
  const ph = P.photosynthesis;
  const lams = Array.from({ length: 200 }, (_, i) => 350e-9 + (i / 199) * 400e-9);
  const sun = lams.map((l) => [l * 1e9, planckLambda(l, 5772) / planckLambda(peakWavelength(5772), 5772)] as [number, number]);
  const peaks = P.chlorophyll.flatMap((c) => c.peaks.map((p) => ({ c, p })));
  return (
    <>
      <Panel id="ps-panel" className="left-panel" title="Photosynthesis">
        <blockquote className="quote">“{nigms('Photosynthesis')}” <span className="note" style={{ fontStyle: 'normal' }}>— NIGMS glossary <SourceLinks ids={['nigms-glossary']} /></span></blockquote>
        <blockquote className="quote">“{ph.quote}” <strong className="mono" style={{ fontStyle: 'normal' }}>{ph.equation}</strong> <span className="note" style={{ fontStyle: 'normal' }}>— NASA Earth Observatory <SourceLinks ids={['nasa-carbon-cycle-2011']} /></span></blockquote>
        <p className="note">Six times NASA's equation is the balanced net reaction 6 CO₂ + 6 H₂O → C₆H₁₂O₆ + 6 O₂ (glucose is C₆H₁₂O₆ = 6 × CH₂O). The reverse, “{ph.reverse.quote}”, is respiration and decay on the same page.</p>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <button className="chip" onClick={() => navigate('/atomic/reactions/photosynthesis-net')}>The net reaction, balanced →</button>
          <button className="chip" onClick={() => navigate('/biologic/molecules?tab=carbs&sel=pubchem-5793')}>Glucose →</button>
          <button className="chip" onClick={() => navigate('/spectral/thermal')}>Sunlight as a black body →</button>
        </div>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head">
          <h1>Chlorophyll and sunlight <ProvenanceBadge cls="observed" title="Absorption maxima from OMLC (PhotochemCAD); sunlight is a 5772 K black-body model" /></h1>
          <p className="note">Where chlorophyll a and b absorb most strongly, drawn over the shape of sunlight modelled as a 5772 K black body (Planck; normalised to its peak). Only the absorption maxima are shown: the full spectra are on the OMLC site, which states no licence for reuse. <SourceLinks ids={['omlc-photochemcad', 'planck-1914']} /></p>
        </div>
        <div style={{ flex: '1 1 340px', maxWidth: 520 }}>
          <LinePlot ariaLabel="Chlorophyll absorption maxima over sunlight" width={520} height={260} xLabel="wavelength (nm)" yLabel="relative" yDomain={[0, 1.05]} legend="tr"
            series={[{ points: sun, color: '#ffe2a8', label: '5772 K black body (model)' }]}
            vLines={peaks.map(({ c, p }) => ({ x: p.nm, label: '', color: COLORS[c.id] }))} />
          <p className="note" style={{ margin: '2px 0 0' }}>Dashed lines: <span style={{ color: COLORS['chl-a'] }}>chlorophyll a</span> (427.8, 660 nm) · <span style={{ color: COLORS['chl-b'] }}>chlorophyll b</span> (453, 643 nm).</p>
        </div>
        <table className="table-mini" aria-label="Chlorophyll maxima">
          <thead><tr><th>pigment (in ether)</th><th>λ (nm)</th><th>ε (M⁻¹ cm⁻¹)</th><th>photon energy</th><th></th></tr></thead>
          <tbody>{peaks.map(({ c, p }) => (
            <tr key={`${c.id}-${p.nm}`}><td style={{ color: COLORS[c.id] }}>{c.name}</td><td>{p.nm}</td><td>{p.epsilon.toLocaleString('en-GB')}</td>
              <td>{formatSig(photonEnergyEV(p.nm * 1e-9), 3)} eV · {formatSig(photonEnergyKJmol(p.nm * 1e-9), 3)} kJ/mol</td>
              <td className="note">{p.stated ? 'stated on the page' : 'read from the data file'}</td></tr>
          ))}</tbody>
        </table>
        <p className="note">Photon energy E = hc/λ (CODATA), per photon and per mole of photons. <SourceLinks ids={['codata-2018']} /></p>
      </div>
      <Panel id="ps-detail" className="right-panel" title="Chlorophyll">
        {P.chlorophyll.map((c) => (
          <div key={c.id} style={{ marginBottom: 10 }}>
            <h4 style={{ margin: '4px 0', color: COLORS[c.id] }}>{c.name}</h4>
            <blockquote className="quote">“{c.peaks[0].quote}”</blockquote>
            <dl className="kv"><KV k="Fluorescence quantum yield" v={c.quantumYield.value} title={c.quantumYield.quote} /></dl>
          </div>
        ))}
        <p className="note">OMLC, S. Prahl, from PhotochemCAD 2.1a (Du et al. 1998; Dixon et al. 2005). <SourceLinks ids={['omlc-photochemcad']} /></p>
        <RelatedLinks id="process:photosynthesis" limit={5} />
      </Panel>
    </>
  );
}

const MICROBES: { id: string; label: string; def: [string, 'nigms' | 'nhgri'][] }[] = [
  { id: 'feline-distemper', label: 'A small virus', def: [['Virus', 'nigms'], ['Virus', 'nhgri']] },
  { id: 'mimivirus', label: 'A giant virus', def: [['Virus', 'nigms']] },
  { id: 'prokaryote', label: 'Bacteria (prokaryotes)', def: [['Bacterium', 'nigms'], ['Bacteria', 'nhgri']] },
  { id: 'red-blood-cell', label: 'A human red blood cell', def: [] },
  { id: 'plant-cell', label: 'Plant cells', def: [['Photosynthesis', 'nigms']] },
];
function MicrobesTab() {
  const { query } = useRoute();
  const sel = MICROBES.find((m) => m.id === query.get('sel')) ?? MICROBES[2];
  const lo = -8, hi = -3.7, W = 620, x = (m: number) => 20 + ((Math.log10(m) - lo) / (hi - lo)) * (W - 40);
  return (
    <>
      <Panel id="mic-list" className="left-panel" title="Microorganisms">
        <ol className="life-list" aria-label="Microbe list">{MICROBES.map((m) => <li key={m.id}><button className={`link-btn ${m.id === sel.id ? 'active' : ''}`} onClick={() => setQuery({ sel: m.id })}>{m.label}</button> <span className="note">{formatReport(lifeSize(m.id)!.reports[0])}</span></li>)}</ol>
        <blockquote className="quote">“{nigms('Microorganism')}” <span className="note" style={{ fontStyle: 'normal' }}>— NIGMS <SourceLinks ids={['nigms-glossary']} /></span></blockquote>
        <blockquote className="quote">“{nigms('Microbe')}” <span className="note" style={{ fontStyle: 'normal' }}>— NIGMS</span></blockquote>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Viruses, bacteria and cells <ProvenanceBadge cls="observed" title="Sizes quoted from PDB-101, NIGMS Inside the Cell and the U.S. DOE chart" /></h1>
          <p className="note">Sizes from the scale of life, on one logarithmic axis. A virus “is neither a cell nor a living organism because it can't reproduce on its own” (NIGMS). <SourceLinks ids={['nigms-glossary', 'pdb101-virus-structures', 'nigms-inside-the-cell']} /></p></div>
        <svg viewBox={`0 0 ${W} 200`} role="img" aria-label="Microbe sizes on a log axis" style={{ width: '100%', maxWidth: W }}>
          {[-8, -7, -6, -5, -4].map((d) => <g key={d}><line x1={x(10 ** d)} x2={x(10 ** d)} y1={20} y2={170} stroke="var(--line)" /><text x={x(10 ** d)} y={188} textAnchor="middle" fontSize={11} fill="var(--text-dim)">{['10 nm', '100 nm', '1 µm', '10 µm', '100 µm'][d + 8]}</text></g>)}
          {MICROBES.map((m, i) => {
            const it = lifeSize(m.id)!, [a, b] = reportSpan(it.reports[0]), y = 34 + i * 28, col = CATEGORY_COLOR[it.category];
            return (
              <g key={m.id} role="button" tabIndex={0} aria-label={m.label} style={{ cursor: 'pointer' }} onClick={() => setQuery({ sel: m.id })}>
                {a === b ? <circle cx={x(a)} cy={y} r={m.id === sel.id ? 6 : 4.5} fill={col} /> : <rect x={x(a)} y={y - 4} width={x(b) - x(a)} height={8} rx={4} fill={col} opacity={m.id === sel.id ? 1 : 0.75} />}
                {x(b) + 8 + m.label.length * 6.5 > W ? <text x={x(a) - 8} y={y + 4} textAnchor="end" fontSize={11.5} fontWeight={m.id === sel.id ? 700 : 400} fill="var(--text)">{m.label}</text>
                  : <text x={x(b) + 8} y={y + 4} fontSize={11.5} fontWeight={m.id === sel.id ? 700 : 400} fill="var(--text)">{m.label}</text>}
              </g>
            );
          })}
        </svg>
      </div>
      <Panel id="mic-detail" className="right-panel" title={sel.label}>
        <p style={{ margin: '0 0 6px' }}><strong>{formatReport(lifeSize(sel.id)!.reports[0])}</strong> — “{lifeSize(sel.id)!.reports[0].quote}” <SourceLinks ids={[lifeSize(sel.id)!.reports[0].source]} /></p>
        {sel.def.map(([t, src]) => <blockquote key={`${src}-${t}`} className="quote">“{src === 'nigms' ? nigms(t) : nhgri(t)}” <span className="note" style={{ fontStyle: 'normal' }}>— {src === 'nigms' ? 'NIGMS' : 'NHGRI'}, <em>{t}</em> <SourceLinks ids={[src === 'nigms' ? 'nigms-glossary' : 'nhgri-glossary']} /></span></blockquote>)}
        <button className="chip" onClick={() => navigate(`/biologic?sel=${sel.id}`)}>On the scale of life →</button>
        {sel.id === 'feline-distemper' && <button className="chip" onClick={() => navigate('/biologic/proteins')}>Protein structures →</button>}
        <RelatedLinks id="instrument:plants" limit={4} />
      </Panel>
    </>
  );
}

export default function PlantsView() {
  const { query } = useRoute();
  const tab = query.get('tab') === 'microbes' ? 'microbes' : 'photosynthesis';
  return (
    <>
      <nav className="view-switch" aria-label="Plants and microbes sections">
        <button className={tab === 'photosynthesis' ? 'active' : ''} onClick={() => setQuery({ tab: null, sel: null })}>Photosynthesis</button>
        <button className={tab === 'microbes' ? 'active' : ''} onClick={() => setQuery({ tab: 'microbes' })}>Microorganisms</button>
      </nav>
      {tab === 'microbes' ? <MicrobesTab /> : <PhotosynthesisTab />}
    </>
  );
}
