/**
 * Membranes — #/biologic/membranes?tab=potential|bilayer&state=&pk=&pna=&pcl=&t=&out=   (Phase 11, Gate 11.5)
 *
 *  potential  the squid giant axon after Hodgkin & Katz (1949): equation (4) with the paper's internal
 *             concentrations, the outside solution chosen from Table 7, permeability ratios (presets: resting, active,
 *             refractory) and temperature. Shows E (the paper's outside − inside) and V_m = −E, the single-ion limits,
 *             and Table 7 recomputed beside the printed values.
 *  bilayer    the lipid bilayer, quoted from NIGMS, as a labelled schematic.
 */
import { navigate, setQuery, useRoute } from '@/shared/router';
import { KV, Panel, ProvenanceBadge } from '@/ui/components';
import { SourceLinks } from '@/ui/SourcesView';
import { RelatedLinks } from '@/ui/RelatedLinks';
import { LinePlot } from '@/ui/plots';
import { celsiusToKelvin, hodgkinKatzE, nernst, thermalVoltage, type Ions } from '@/core/biology/membrane';
import data from '@datasets/biology/membranes.json';

interface Sol { id: string; K: number; Na: number; Cl: number; reference: 'sea' | 'artificial' }
interface State { id: string; label: string; P: Ions; observed: number[]; calculated: number[] }
const HK = (data as unknown as { hodgkinKatz: { equation: { text: string; where: string }; signConvention: string; limit: string; caution: string; internal: Ions; seaWaterSolution: Ions; artificialSeaWater: Ions; junctionNote: string; solutions: Sol[]; states: State[]; seaWater: { id: string; label: string; observed: string; calculated: number }[] } }).hodgkinKatz;
const TEXT = (data as unknown as { membraneText: { quote: string; source: string }[] }).membraneText;
const SRC = ['hodgkin-katz-1949'];
const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
const num = (q: URLSearchParams, k: string, d: number, a: number, b: number) => { const v = Number(q.get(k)); return q.has(k) && Number.isFinite(v) ? clamp(v, a, b) : d; };
const mv = (v: number) => v * 1000;
const fmt = (x: number, d = 1) => `${x > 0 ? '+' : ''}${x.toFixed(d)}`;
const OUTSIDES: { id: string; label: string; ions: Ions }[] = [
  { id: 'sea', label: 'sea water (≈10 K, 455 Na, 540 Cl mM)', ions: HK.seaWaterSolution },
  { id: 'artificial', label: 'artificial sea water (10 K, 455 Na, 587 Cl)', ions: HK.artificialSeaWater },
  ...HK.solutions.map((s) => ({ id: s.id, label: `solution ${s.id} (${s.K} K, ${s.Na} Na, ${s.Cl} Cl)`, ions: { K: s.K, Na: s.Na, Cl: s.Cl } })),
];

/** A vertical voltage scale (inside − outside) with the single-ion potentials and V_m. */
function VoltageScale({ vm, vk, vna, vcl }: { vm: number; vk: number; vna: number; vcl: number }) {
  const lo = -110, hi = 70, H = 300, W = 230, y = (v: number) => 14 + ((hi - v) / (hi - lo)) * (H - 28);
  const marks = [{ v: vna, l: 'V_Na', c: '#ff7a90' }, { v: vk, l: 'V_K', c: '#7df9ff' }, { v: vcl, l: 'V_Cl', c: '#f5c76b' }];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Membrane potential and single-ion potentials" style={{ width: W }}>
      <line x1={60} x2={60} y1={y(hi)} y2={y(lo)} stroke="var(--line-strong)" />
      {[-100, -50, 0, 50].map((v) => <g key={v}><line x1={55} x2={65} y1={y(v)} y2={y(v)} stroke="var(--text-faint)" /><text x={50} y={y(v) + 4} textAnchor="end" fontSize={10} fill="var(--text-dim)">{v}</text></g>)}
      <text x={4} y={10} fontSize={10} fill="var(--text-faint)">mV, inside − outside</text>
      {marks.map((m) => <g key={m.l}><line x1={60} x2={110} y1={y(clamp(m.v, lo, hi))} y2={y(clamp(m.v, lo, hi))} stroke={m.c} strokeDasharray="4 3" /><text x={114} y={y(clamp(m.v, lo, hi)) + 4} fontSize={11} fill={m.c}>{m.l} {fmt(m.v)}</text></g>)}
      <circle cx={60} cy={y(clamp(vm, lo, hi))} r={7} fill="#5cf2a6" />
      {(() => {
        const yv = y(clamp(vm, lo, hi));
        const taken = marks.map((m) => y(clamp(m.v, lo, hi)) + 4);
        const free = (ty: number) => taken.every((t) => Math.abs(t - ty) > 15);
        const ty = [yv - 10, yv + 22, yv - 26, yv + 38].find(free) ?? yv - 10;
        return <text x={74} y={ty} fontSize={12} fontWeight={600} fill="#5cf2a6">V_m {fmt(vm)}</text>;
      })()}
    </svg>
  );
}

function PotentialTab() {
  const { query } = useRoute();
  const preset = HK.states.find((s) => s.id === query.get('state')) ?? HK.states[0];
  const P: Ions = { K: num(query, 'pk', preset.P.K, 0.05, 5), Na: num(query, 'pna', preset.P.Na, 0, 50), Cl: num(query, 'pcl', preset.P.Cl, 0, 5) };
  const tC = num(query, 't', 18, 0, 30), T = celsiusToKelvin(tC);
  const out = OUTSIDES.find((o) => o.id === query.get('out')) ?? OUTSIDES[0];
  const ins = HK.internal;
  const E = hodgkinKatzE(P, ins, out.ions, T), vm = -E;
  const vk = nernst(1, ins.K, out.ions.K || 1e-9, T), vna = nernst(1, ins.Na, out.ions.Na, T), vcl = nernst(-1, ins.Cl, out.ions.Cl, T);
  const ratios = Array.from({ length: 160 }, (_, i) => 10 ** (-3 + (i / 159) * 5));
  const curve = ratios.map((r) => [r, mv(-hodgkinKatzE({ K: P.K, Na: r * P.K, Cl: P.Cl }, ins, out.ions, T))] as [number, number]);
  const ref = (s: Sol) => (s.reference === 'sea' ? HK.seaWaterSolution : HK.artificialSeaWater);
  const st = HK.states.find((s) => s.id === preset.id)!;
  const E0 = (sid: string) => hodgkinKatzE(HK.states.find((s) => s.id === sid)!.P, ins, HK.seaWaterSolution, T);
  return (
    <>
      <Panel id="mp-controls" className="left-panel" title="Squid giant axon">
        <div role="group" aria-label="State of the nerve" style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
          {HK.states.map((s) => <button key={s.id} className={`chip ${preset.id === s.id && !query.has('pna') && !query.has('pk') && !query.has('pcl') ? 'active' : ''}`} onClick={() => setQuery({ state: s.id === 'rest' ? null : s.id, pk: null, pna: null, pcl: null })}>{s.label.split(' (')[0]}</button>)}
        </div>
        <label className="slider-row"><span style={{ minWidth: 60 }}>P_K</span><input type="range" min={0.05} max={5} step={0.05} value={P.K} aria-label="Potassium permeability" onChange={(e) => setQuery({ pk: e.target.value })} /><span>{P.K}</span></label>
        <label className="slider-row"><span style={{ minWidth: 60 }}>P_Na</span><input type="range" min={0} max={50} step={0.01} value={P.Na} aria-label="Sodium permeability" onChange={(e) => setQuery({ pna: e.target.value })} /><span>{P.Na}</span></label>
        <label className="slider-row"><span style={{ minWidth: 60 }}>P_Cl</span><input type="range" min={0} max={5} step={0.05} value={P.Cl} aria-label="Chloride permeability" onChange={(e) => setQuery({ pcl: e.target.value })} /><span>{P.Cl}</span></label>
        <label className="slider-row"><span style={{ minWidth: 60 }}>T</span><input type="range" min={0} max={30} step={0.5} value={tC} aria-label="Temperature" onChange={(e) => setQuery({ t: e.target.value })} /><span>{tC} °C</span></label>
        <label className="note" htmlFor="out-sel">Outside solution (Table 7)</label>
        <select id="out-sel" aria-label="Outside solution" value={out.id} onChange={(e) => setQuery({ out: e.target.value === 'sea' ? null : e.target.value })} style={{ width: '100%', background: 'rgba(0,0,0,0.3)', color: 'var(--text)', border: '1px solid var(--line)', borderRadius: 8, padding: 4 }}>
          {OUTSIDES.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
        </select>
        <p className="note">Inside the axon (fixed, p. 66): K {ins.K}, Na {ins.Na}, Cl {ins.Cl} mM. The paper's temperature was not read; equation (4) reproduces every calculated value of Table 7 within 1 mV for any temperature from 14.6 to 21.5 °C, so 18 °C is the default.</p>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head">
          <h1>Membrane potential <ProvenanceBadge cls="derived" title="Hodgkin & Katz (1949) equation (4) with their concentrations" /></h1>
          <p className="note">Hodgkin and Katz (1949), equation (4): <span className="mono">{HK.equation.text}</span>. “{HK.signConvention}” Below, V_m = −E is the modern inside-minus-outside potential. The equation “{HK.limit}” <SourceLinks ids={SRC} /></p>
        </div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <VoltageScale vm={mv(vm)} vk={mv(vk)} vna={mv(vna)} vcl={mv(vcl)} />
          <div style={{ flex: '1 1 340px', maxWidth: 400 }}>
            <LinePlot ariaLabel="Membrane potential against the sodium to potassium permeability ratio" width={400} height={260} xLog xLabel="P_Na / P_K" yLabel="V_m (mV)"
              series={[{ points: curve, color: '#5cf2a6', label: 'equation (4)' }]}
              hLines={[{ y: mv(vk), label: 'V_K', color: '#7df9ff' }, { y: mv(vna), label: 'V_Na', color: '#ff7a90' }]}
              markers={[{ x: Math.max(1e-3, P.Na / P.K), y: mv(vm), label: 'now', color: '#f5c76b' }]} />
          </div>
        </div>
        <h3 style={{ margin: '10px 0 4px' }}>Table 7, {st.label.toLowerCase()} (P_K : P_Na : P_Cl = {st.P.K} : {st.P.Na} : {st.P.Cl})</h3>
        <table className="table-mini" aria-label="Table 7 recomputed">
          <thead><tr><th>solution</th><th>K · Na · Cl (mM)</th><th>observed (mV)</th><th>printed calc.</th><th>this calc. at {tC} °C</th></tr></thead>
          <tbody>{HK.solutions.map((s, k) => {
            const d = mv(hodgkinKatzE(st.P, ins, { K: s.K, Na: s.Na, Cl: s.Cl }, T) - hodgkinKatzE(st.P, ins, ref(s), T));
            return <tr key={s.id}><td>{s.id}</td><td>{s.K} · {s.Na} · {s.Cl}</td><td>{fmt(st.observed[k], 0)}</td><td>{fmt(st.calculated[k], 0)}</td><td>{fmt(d)}</td></tr>;
          })}</tbody>
        </table>
        <p className="note">The change in E (paper's sign) on replacing sea water (D–I) or artificial sea water (A–C) by the test solution. “{HK.caution}” <SourceLinks ids={SRC} /></p>
      </div>
      <Panel id="mp-readout" className="right-panel" title="Potentials">
        <dl className="kv" aria-label="Potential values">
          <KV k="E, outside − inside (paper)" v={fmt(mv(E))} unit="mV" />
          <KV k="V_m, inside − outside" v={fmt(mv(vm))} unit="mV" />
          <KV k="V_K (K alone)" v={out.ions.K > 0 ? fmt(mv(vk)) : '— (no K outside)'} unit={out.ions.K > 0 ? 'mV' : ''} />
          <KV k="V_Na (Na alone)" v={fmt(mv(vna))} unit="mV" />
          <KV k="V_Cl (Cl alone)" v={fmt(mv(vcl))} unit="mV" />
          <KV k="RT/F" v={mv(thermalVoltage(T))} unit="mV" sig={4} />
        </dl>
        <h4 style={{ margin: '10px 0 4px' }}>In sea water, against the paper</h4>
        <table className="table-mini" aria-label="Potentials in sea water"><thead><tr><th></th><th>observed</th><th>printed</th><th>here</th></tr></thead>
          <tbody>
            {[['rest', E0('rest')], ['active', E0('active')], ['refractory', E0('refractory')], ['ap', E0('rest') - E0('active')], ['pos', E0('refractory') - E0('rest')]].map(([id, v]) => {
              const row = HK.seaWater.find((r) => r.id === id)!;
              return <tr key={id as string}><td>{row.label.replace('Membrane potential ', '').replace(' in sea water', '')}</td><td>{row.observed}</td><td>{row.calculated}</td><td>{mv(v as number).toFixed(1)}</td></tr>;
            })}
          </tbody></table>
        <p className="note">{HK.junctionNote} Squid values only: no open source for mammalian ion concentrations was found.</p>
        <RelatedLinks id="instrument:membranes" limit={4} />
      </Panel>
    </>
  );
}

function BilayerTab() {
  const W = 560, H = 230, n = 14, dx = W / n;
  return (
    <>
      <Panel id="bl-panel" className="left-panel" title="Membranes">
        <p className="note">The lipids of a membrane are bundled as molecules:</p>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <button className="chip" onClick={() => navigate('/biologic/molecules?tab=lipids&sel=pubchem-985')}>Palmitic acid →</button>
          <button className="chip" onClick={() => navigate('/biologic/molecules?tab=lipids&sel=pubchem-445639')}>Oleic acid →</button>
          <button className="chip" onClick={() => navigate('/biologic/molecules?tab=lipids&sel=pubchem-5997')}>Cholesterol →</button>
          <button className="chip" onClick={() => navigate('/biologic/cells?part=membrane')}>The cell membrane →</button>
        </div>
        <p className="note">Phospholipids themselves are not bundled (PubChem now refuses automated requests from this project).</p>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>The lipid bilayer <ProvenanceBadge cls="illustrative" title="Schematic after the NIGMS description; not to scale" /></h1></div>
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Schematic lipid bilayer" style={{ width: '100%', maxWidth: W }}>
          <text x={6} y={16} fontSize={11} fill="var(--text-dim)">outside (water)</text>
          <text x={6} y={H - 6} fontSize={11} fill="var(--text-dim)">inside (water)</text>
          {Array.from({ length: n }, (_, i) => {
            const x = dx / 2 + i * dx;
            return (
              <g key={i}>
                {[[40, 1], [H - 40, -1]].map(([y0, s]) => (
                  <g key={y0}>
                    <circle cx={x} cy={y0} r={9} fill="#7df9ff" opacity={0.85} />
                    <path d={`M ${x - 3} ${y0 + s * 9} q ${-4} ${s * 18} 0 ${s * 32} q 4 ${s * 12} 0 ${s * 22}`} stroke="#f5c76b" strokeWidth={2} fill="none" />
                    <path d={`M ${x + 3} ${y0 + s * 9} q 4 ${s * 18} 0 ${s * 32} q -4 ${s * 12} 0 ${s * 22}`} stroke="#f5c76b" strokeWidth={2} fill="none" />
                  </g>
                ))}
              </g>
            );
          })}
          <rect x={W * 0.62} y={20} width={44} height={H - 40} rx={18} fill="rgba(92,242,166,0.45)" stroke="#5cf2a6" />
          <text x={W * 0.62 + 22} y={H / 2 + 4} textAnchor="middle" fontSize={10} fill="var(--text)">protein</text>
        </svg>
        <p className="note"><span style={{ color: '#7df9ff' }}>●</span> hydrophilic heads <span style={{ color: '#f5c76b' }}>⌇</span> hydrophobic tails <span style={{ color: '#5cf2a6' }}>▮</span> a transmembrane protein. Schematic, not to scale (no bilayer thickness was found in an allowed source).</p>
        {TEXT.map((t, i) => <blockquote key={i} className="quote">“{t.quote}” <span className="note" style={{ fontStyle: 'normal' }}>— NIGMS Biomedical Beat <SourceLinks ids={[t.source]} /></span></blockquote>)}
      </div>
      <Panel id="bl-detail" className="right-panel" title="Related">
        <button className="chip" onClick={() => setQuery({ tab: null })}>Ion gradients make a voltage: membrane potential →</button>
        <RelatedLinks id="instrument:membranes" limit={5} />
      </Panel>
    </>
  );
}

export default function MembranesView() {
  const { query } = useRoute();
  const tab = query.get('tab') === 'bilayer' ? 'bilayer' : 'potential';
  return (
    <>
      <nav className="view-switch" aria-label="Membrane sections">
        <button className={tab === 'potential' ? 'active' : ''} onClick={() => setQuery({ tab: null })}>Membrane potential</button>
        <button className={tab === 'bilayer' ? 'active' : ''} onClick={() => setQuery({ tab: 'bilayer' })}>Lipid bilayer</button>
      </nav>
      {tab === 'bilayer' ? <BilayerTab /> : <PotentialTab />}
    </>
  );
}
