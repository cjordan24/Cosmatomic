/**
 * Nuclei — #/atomic/nuclei?tab=binding|chart|decay|stars   (Phase 14, Gate 14.3)
 *
 *  binding  binding energy per nucleon of every nuclide with a NUBASE2020 mass; the liquid-drop formula fitted to
 *           the measured ones; the five terms for a chosen nuclide
 *  chart    the chart of nuclides (N against Z), stable ones marked, coloured by half-life
 *  decay    a decay series, step by step, with NUBASE half-lives
 *  stars    hydrogen burning (proton–proton chain, CNO cycle) with energy releases from the same masses
 */
import { useMemo } from 'react';
import { navigate, setQuery, useRoute } from '@/shared/router';
import { KV, Panel, ProvenanceBadge } from '@/ui/components';
import { SourceLinks } from '@/ui/SourcesView';
import { RelatedLinks } from '@/ui/RelatedLinks';
import { ScatterPlot } from '@/ui/plots';
import { qValueMeV, rmsResidual, semf, semfTerms } from '@/core/physics/nuclear';
import nuclideMasses from '@datasets/atomic/nuclides.json';
import { FIT, NUCS, findNuc, nucLabel } from './bindingData';
import data from '@datasets/atomic/nuclear.json';

const ND = data as unknown as {
  semf: { source: string; formula: string; formulaQuote: string; printed: { source: string; label: string; av: number; as: number; ac: number; aa: number; ap: number; pairing: string; coulomb: string }[] };
  chains: { id: string; label: string; source: string; quote?: string; note?: string; steps: { Z: number; A: number; mode: string }[] }[];
  stars: { nasa: { source: string; quote: string }; pdg: { source: string; quote: string }; cnoNeutrinos: string };
};
const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
const num = (q: URLSearchParams, k: string, d: number, a: number, b: number) => { const v = Number(q.get(k)); return q.has(k) && Number.isFinite(v) ? clamp(v, a, b) : d; };
const NUBASE = ['nubase2020'];

function hlColor(n: { stable: boolean; halfLifeS: number | null }) {
  if (n.stable) return '#f5f5f5';
  const s = n.halfLifeS;
  if (s === null) return '#55607a';
  const l = Math.log10(s);
  return l > 9 ? '#5cf2a6' : l > 3 ? '#7df9ff' : l > 0 ? '#f5c76b' : l > -3 ? '#ff9a5c' : '#ff5a6e';
}

function BindingTab() {
  const { query } = useRoute();
  const Z = Math.round(num(query, 'z', 26, 1, 118)), A = Math.round(num(query, 'a', 56, 2, 300));
  const sel = findNuc(Z, A) ?? findNuc(26, 56)!;
  const terms = semfTerms(sel.Z, sel.A, FIT);
  const pts = useMemo(() => NUCS.filter((n) => n.perA > 0).map((n) => ({ key: `${n.Z}-${n.A}`, x: n.A, y: n.perA, color: n.stable ? '#f5f5f5' : n.measured ? '#5cf2a6' : '#55607a', r: n.stable ? 2.4 : 1.4, title: `${nucLabel(n)}: ${n.perA.toFixed(3)} MeV per nucleon` })), []);
  const fitLine = useMemo(() => {
    const out: [number, number][] = [];
    for (let a = 16; a <= 270; a += 2) { const best = NUCS.filter((n) => n.A === a && n.measured).sort((p, q) => q.perA - p.perA)[0]; if (best) out.push([a, semf(best.Z, a, FIT) / a]); }
    return out;
  }, []);
  const rms = rmsResidual(NUCS.filter((n) => n.measured), FIT);
  return (
    <>
      <Panel id="bind-controls" className="left-panel" title="A nucleus">
        <p style={{ margin: '0 0 6px' }}><strong>{nucLabel(sel)}</strong> — {sel.Z} protons, {sel.N} neutrons · {sel.stable ? 'stable' : `half-life ${sel.halfLife}`}</p>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {[[1, 2], [2, 4], [6, 12], [26, 56], [28, 62], [82, 208], [92, 235], [92, 238]].map(([z, a]) => <button key={`${z}-${a}`} className={`chip ${z === sel.Z && a === sel.A ? 'active' : ''}`} onClick={() => setQuery({ z: String(z), a: String(a) })}>{nucLabel({ Z: z, A: a })}</button>)}
        </div>
        <dl className="kv" aria-label="Binding values">
          <KV k="Binding energy B" v={sel.B} unit="MeV" sig={6} title="[Z·M(¹H) + N·mₙ − M]c², NUBASE2020 masses" />
          <KV k="Per nucleon B/A" v={sel.perA} unit="MeV" sig={5} />
          <KV k="Liquid-drop fit" v={semf(sel.Z, sel.A, FIT)} unit="MeV" sig={5} />
        </dl>
        <h3 style={{ margin: '10px 0 4px' }}>Liquid-drop terms (fit)</h3>
        <dl className="kv" aria-label="Liquid-drop terms">
          <KV k="Volume" v={terms.volume} unit="MeV" sig={4} /><KV k="Surface" v={terms.surface} unit="MeV" sig={4} />
          <KV k="Coulomb" v={terms.coulomb} unit="MeV" sig={4} /><KV k="Asymmetry" v={terms.asymmetry} unit="MeV" sig={4} /><KV k="Pairing" v={terms.pairing} unit="MeV" sig={3} />
        </dl>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>What holds a nucleus together <ProvenanceBadge cls="derived" title="Binding energies from NUBASE2020 masses; liquid-drop coefficients fitted here" /></h1>
          <p className="note">A nucleus weighs less than its protons and neutrons apart; the difference, times c², is its binding energy. From the {NUCS.length.toLocaleString('en-US')} ground-state masses in NUBASE2020: the most tightly bound nucleus per nucleon is ⁶²Ni (8.7945 MeV), then ⁵⁸Fe and ⁵⁶Fe. <SourceLinks ids={NUBASE} /></p></div>
        <ScatterPlot ariaLabel="Binding energy per nucleon against mass number" width={640} height={380} points={pts} selected={`${sel.Z}-${sel.A}`} onPick={(k) => { const [z, a] = k.split('-'); setQuery({ z, a }); }} xLabel="mass number A" yLabel="B/A (MeV)" yDomain={[0, 9.2]} lines={[{ points: fitLine, color: '#f5c76b', label: 'liquid-drop fit' }]} />
        <p className="note">White: stable; green: measured (half-life ≥ 1 s, used in the fit); grey: short-lived or not used. The fit to {NUCS.filter((n) => n.measured).length.toLocaleString('en-US')} nuclides gives a_v = {FIT.av.toFixed(2)}, a_s = {FIT.as.toFixed(2)}, a_c = {FIT.ac.toFixed(3)}, a_a = {FIT.aa.toFixed(2)}, a_p = {FIT.ap.toFixed(1)} MeV, rms error {rms.toFixed(2)} MeV (derived).</p>
        <p className="note">Wing (1964) writes the formula as {ND.semf.formula}: “{ND.semf.formulaQuote}” He tabulates 21 published coefficient sets; three of them, applied to the same {NUCS.filter((n) => n.measured).length.toLocaleString('en-US')} nuclides (with their Z² Coulomb term):</p>
        <table className="table-mini" aria-label="Published coefficients">
          <thead><tr><th>Coefficients</th><th>a_v</th><th>a_s</th><th>a_c</th><th>a_a</th><th>pairing</th><th>rms error (MeV)</th></tr></thead>
          <tbody>
            {ND.semf.printed.map((p) => <tr key={p.label}><td>{p.label}</td><td>{p.av}</td><td>{p.as}</td><td>{p.ac}</td><td>{p.aa}</td><td>{p.pairing}</td><td>{rmsResidual(NUCS.filter((n) => n.measured), { ...p, coulombZ2: true }).toFixed(2)}</td></tr>)}
            <tr><td>Fitted here (Z(Z − 1) Coulomb term)</td><td>{FIT.av.toFixed(3)}</td><td>{FIT.as.toFixed(3)}</td><td>{FIT.ac.toFixed(3)}</td><td>{FIT.aa.toFixed(3)}</td><td>{FIT.ap.toFixed(1)}/A^½</td><td>{rms.toFixed(2)}</td></tr>
          </tbody>
        </table>
        <p className="note"><SourceLinks ids={[ND.semf.source]} /> The 1936 set predates the modern masses it is tested against here.</p>
      </div>
      <Panel id="bind-detail" className="right-panel" title="Related">
        <button className="chip" onClick={() => navigate(`/atomic/element/${sel.Z}`)}>Element {sel.Z} →</button>
        <button className="chip" onClick={() => setQuery({ tab: 'stars' })}>Fusion in the Sun →</button>
        <RelatedLinks id="instrument:nuclei" limit={4} />
      </Panel>
    </>
  );
}

function ChartTab() {
  const { query } = useRoute();
  const Z = Math.round(num(query, 'z', 26, 1, 118)), A = Math.round(num(query, 'a', 56, 2, 300));
  const sel = findNuc(Z, A) ?? findNuc(26, 56)!;
  const pts = useMemo(() => NUCS.map((n) => ({ key: `${n.Z}-${n.A}`, x: n.N, y: n.Z, color: hlColor(n), r: n.stable ? 2.6 : 1.6, title: `${nucLabel(n)}: ${n.stable ? 'stable' : n.halfLife}` })), []);
  return (
    <>
      <Panel id="chart-controls" className="left-panel" title="Chart of nuclides">
        <p style={{ margin: '0 0 6px' }}><strong>{nucLabel(sel)}</strong> · {sel.stable ? 'stable' : `half-life ${sel.halfLife}`}</p>
        <p className="note">Decay modes (NUBASE2020): {sel.decay || '—'}</p>
        <ul className="life-reports" aria-label="Half-life colours">
          {[['#f5f5f5', 'stable'], ['#5cf2a6', 'over 30 years (10⁹ s)'], ['#7df9ff', '17 min – 30 yr'], ['#f5c76b', '1 s – 17 min'], ['#ff9a5c', '1 ms – 1 s'], ['#ff5a6e', 'under 1 ms'], ['#55607a', 'not specified']].map(([c, l]) => <li key={l}><span style={{ color: c }}>●</span> {l}</li>)}
        </ul>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Every known nucleus <ProvenanceBadge cls="observed" title="NUBASE2020 ground states" /></h1>
          <p className="note">Protons up, neutrons across: {NUCS.length.toLocaleString('en-US')} ground states with masses, {NUCS.filter((n) => n.stable).length} of them stable. <SourceLinks ids={NUBASE} /></p></div>
        <ScatterPlot ariaLabel="Chart of nuclides" width={640} height={460} points={pts} selected={`${sel.Z}-${sel.A}`} onPick={(k) => { const [z, a] = k.split('-'); setQuery({ z, a }); }} xLabel="neutrons N" yLabel="protons Z" lines={[{ points: [[0, 0], [120, 120]], color: '#55607a', label: 'N = Z', dashed: true }]} />
      </div>
      <Panel id="chart-detail" className="right-panel" title="Related"><RelatedLinks id="instrument:nuclei" limit={4} /></Panel>
    </>
  );
}

function DecayTab() {
  const { query } = useRoute();
  const chain = ND.chains.find((c) => c.id === query.get('chain')) ?? ND.chains[0];
  if (!chain) return <div className="center-stage"><p className="note">No decay series with an open source was found.</p></div>;
  return (
    <>
      <Panel id="decay-controls" className="left-panel" title="Decay series">
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{ND.chains.map((c) => <button key={c.id} className={`chip ${c.id === chain.id ? 'active' : ''}`} onClick={() => setQuery({ chain: c.id })}>{c.label}</button>)}</div>
        {chain.quote && <p className="note">“{chain.quote}” <SourceLinks ids={[chain.source]} /></p>}
        {chain.note && <p className="note">{chain.note}</p>}
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>{chain.label} <ProvenanceBadge cls="observed" title="Series from its source; half-lives from NUBASE2020" /></h1></div>
        <ol className="life-list" aria-label="Decay steps">
          {chain.steps.map((s, i) => { const n = findNuc(s.Z, s.A); return <li key={i}><button className="link-btn" onClick={() => setQuery({ tab: 'chart', z: String(s.Z), a: String(s.A) })}>{nucLabel(s)}</button> <span className="note">{n ? (n.stable ? 'stable' : n.halfLife) : '—'}{i < chain.steps.length - 1 ? ` → ${s.mode}` : ''}</span></li>; })}
        </ol>
        <p className="note">Half-lives: NUBASE2020. <SourceLinks ids={[chain.source, ...NUBASE]} /></p>
      </div>
      <Panel id="decay-detail" className="right-panel" title="Related">
        <button className="chip" onClick={() => navigate('/atomic/quantum?tab=tunnel')}>Tunnelling →</button>
        <RelatedLinks id="instrument:nuclei" limit={4} />
      </Panel>
    </>
  );
}

const NM = nuclideMasses as unknown as Record<string, { nuclides: { A: number; isomer: string | null; mass: number | null }[] }>;
const am = (Z: number, A: number) => NM[String(Z)].nuclides.find((n) => n.A === A && !n.isomer)!.mass!;
export const PP_STEPS = (() => {
  const H = am(1, 1), D = am(1, 2), He3 = am(2, 3), He4 = am(2, 4);
  return [
    { label: 'p + p → d + e⁺ + ν', q: qValueMeV([H, H], [D]), note: 'including the positron’s annihilation; the neutrino carries part away' },
    { label: 'p + d → ³He + γ', q: qValueMeV([H, D], [He3]), note: '' },
    { label: '³He + ³He → ⁴He + 2p', q: qValueMeV([He3, He3], [He4, H, H]), note: '' },
    { label: 'overall: 4p → ⁴He (+ 2e⁺ + 2ν)', q: qValueMeV([H, H, H, H], [He4]), note: 'steps 1 and 2 happen twice' },
  ];
})();

function StarsTab() {
  const s = ND.stars;
  return (
    <>
      <Panel id="stars-list" className="left-panel" title="The pp chain">
        <dl className="kv" aria-label="pp chain energies">{PP_STEPS.map((p) => <KV key={p.label} k={p.label} v={p.q} unit="MeV" sig={4} title={p.note} />)}</dl>
        <p className="note">Energies from the NUBASE2020 atomic masses (derived): Q = (masses in − masses out) c². Using atomic masses counts the positron’s annihilation with an electron.</p>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Fusion in the Sun <ProvenanceBadge cls="derived" title="Reactions from NASA and PDG; energies from NUBASE2020 masses" /></h1>
          <p className="note">NASA: “{s.nasa.quote}” <SourceLinks ids={[s.nasa.source]} /></p>
          <p className="note">PDG: “{s.pdg.quote}” <SourceLinks ids={[s.pdg.source]} /> From the masses, 4 × M(¹H) − M(⁴He) = {PP_STEPS[3].q.toFixed(3)} MeV.</p></div>
        <svg viewBox="0 0 600 110" role="img" aria-label="pp chain steps" style={{ width: '100%', maxWidth: 600 }}>
          {PP_STEPS.slice(0, 3).map((p, i) => <g key={p.label}><rect x={10 + i * 200} y={30} width={180} height={70} rx={10} fill="none" stroke="#f5c76b" /><text x={100 + i * 200} y={60} textAnchor="middle" fontSize={13} fill="var(--text)">{p.label}</text><text x={100 + i * 200} y={84} textAnchor="middle" fontSize={12} fill="#f5c76b">{p.q.toFixed(3)} MeV</text>{i < 2 && <text x={195 + i * 200} y={70} textAnchor="middle" fontSize={16} fill="var(--text-dim)">→</text>}</g>)}
          <text x={10} y={20} fontSize={11} fill="var(--text-dim)">step 1 (twice)</text><text x={210} y={20} fontSize={11} fill="var(--text-dim)">step 2 (twice)</text><text x={410} y={20} fontSize={11} fill="var(--text-dim)">step 3</text>
        </svg>
        <p className="note">The CNO cycle is not drawn: no open source listing all its steps was found. PDG names its neutrino sources: “{s.cnoNeutrinos}” <SourceLinks ids={['pdg-2025']} /></p>
      </div>
      <Panel id="stars-detail" className="right-panel" title="Related">
        <button className="chip" onClick={() => navigate('/cosmic/stars/hr')}>Stars on the HR diagram →</button>
        <button className="chip" onClick={() => navigate('/atomic/particles?sel=nue')}>The neutrino →</button>
        <RelatedLinks id="instrument:nuclei" limit={4} />
      </Panel>
    </>
  );
}

const TABS: [string, string][] = [['binding', 'Binding energy'], ['chart', 'Chart of nuclides'], ['decay', 'Decay series'], ['stars', 'Fusion in stars']];
export default function NucleiView() {
  const { query } = useRoute();
  const tab = TABS.find(([t]) => t === query.get('tab'))?.[0] ?? 'binding';
  return (
    <>
      <nav className="view-switch" aria-label="Nuclei sections">
        {TABS.map(([t, l]) => <button key={t} className={tab === t ? 'active' : ''} onClick={() => setQuery({ tab: t === 'binding' ? null : t })}>{l}</button>)}
      </nav>
      {tab === 'chart' ? <ChartTab /> : tab === 'decay' ? <DecayTab /> : tab === 'stars' ? <StarsTab /> : <BindingTab />}
    </>
  );
}
