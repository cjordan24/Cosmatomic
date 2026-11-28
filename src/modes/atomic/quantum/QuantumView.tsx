/**
 * Quantum lab — #/atomic/quantum?pot=box|oscillator|double|finite&tab=states|tunnel   (Phase 14, Gate 14.2)
 *
 *  states  an electron in a one-dimensional potential: the time-independent Schrödinger equation solved on a grid
 *          (finite differences, Sturm bisection); the lowest levels and wavefunctions drawn in the well, with the
 *          exact energies beside the numerical ones where they exist (box: n²h²/8mL²; oscillator: (n + ½)hν)
 *  tunnel  transmission through a rectangular barrier against energy (transfer matrices = closed form)
 */
import { useMemo } from 'react';
import { navigate, setQuery, useRoute } from '@/shared/router';
import { KV, Panel, ProvenanceBadge } from '@/ui/components';
import { SourceLinks } from '@/ui/SourcesView';
import { RelatedLinks } from '@/ui/RelatedLinks';
import { LinePlot } from '@/ui/plots';
import { formatSig } from '@/core/units/units';
import { HB2M, barrierTransmission, boxEnergyEV, grid, oscillatorEnergyEV, oscillatorPotentialEV, solve1D } from '@/core/physics/quantum';
import data from '@datasets/atomic/quantum.json';

const Q = data as unknown as { schrodinger: { source: string; quote: string; where: string }; box: { source: string; quote: string; example: { quote: string } }; oscillator: { source: string; quote: string }; tunnel: { source: string; quote: string }; condonMorse: { source: string; transmitted: string; resonance: string; erratum: string }; alpha: { source: string; quote: string } };
const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
const num = (q: URLSearchParams, k: string, d: number, a: number, b: number) => { const v = Number(q.get(k)); return q.has(k) && Number.isFinite(v) ? clamp(v, a, b) : d; };
const POTS = [['box', 'Box'], ['oscillator', 'Spring (oscillator)'], ['double', 'Double well'], ['finite', 'Finite well']] as const;
type Pot = (typeof POTS)[number][0];
const COL = ['#7df9ff', '#5cf2a6', '#f5c76b', '#ff7a90', '#b18cff'];

function potential(p: Pot, x: number, L: number, depth: number, hw: number): number {
  if (p === 'oscillator') return oscillatorPotentialEV(x, hw);
  if (p === 'double') return Math.abs(x) < 0.1 * L ? depth : 0;          // a bump of height `depth` in the middle of a box
  if (p === 'finite') return Math.abs(x) < L / 2 ? 0 : depth;             // a well of depth `depth` inside a wider box
  return 0;
}

function StatesTab() {
  const { query } = useRoute();
  const pot = (POTS.find(([k]) => k === query.get('pot'))?.[0] ?? 'box') as Pot;
  const L = num(query, 'L', 1, 0.2, 5), depth = num(query, 'V', 1, 0.05, 10), hw = num(query, 'hw', 0.5, 0.05, 3);
  const half = pot === 'oscillator' ? 1.6 * Math.sqrt(4 * HB2M * 5 * hw) / hw : pot === 'finite' ? L : L / 2;   // 1.6 × the n = 5 turning point
  const g = useMemo(() => grid(-half, half, 500), [half]);
  const V = useMemo(() => g.x.map((x) => potential(pot, x, L, depth, hw)), [g, pot, L, depth, hw]);
  const { E, psi } = useMemo(() => solve1D(V, g.dx, 4), [V, g.dx]);
  const levelSrc = [pot === 'oscillator' ? Q.oscillator.source : Q.box.source];
  const exact = (n: number) => (pot === 'box' ? boxEnergyEV(n + 1, L) : pot === 'oscillator' ? oscillatorEnergyEV(n, hw) : null);
  const Emax = Math.max(E[3] * 1.15, pot === 'finite' || pot === 'double' ? depth * 1.1 : 0);
  const scale = (E[1] - E[0]) * 0.4;
  const series = [
    { points: g.x.map((x, i) => [x, Math.min(V[i], Emax)] as [number, number]), color: '#9aa6c8', label: 'potential V(x)', width: 2 },
    ...psi.map((p, n) => ({ points: g.x.map((x, i) => [x, E[n] + p[i] * scale / Math.max(...p.map(Math.abs))] as [number, number]), color: COL[n], label: `n = ${n + 1}` })),
  ];
  return (
    <>
      <Panel id="q-controls" className="left-panel" title="An electron in a well">
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{POTS.map(([k, l]) => <button key={k} className={`chip ${k === pot ? 'active' : ''}`} aria-pressed={k === pot} onClick={() => setQuery({ pot: k === 'box' ? null : k })}>{l}</button>)}</div>
        {pot !== 'oscillator' && <label className="slider-row"><span style={{ minWidth: 70 }}>width L</span><input type="range" min={0.2} max={5} step={0.05} value={L} aria-label="Well width" onChange={(e) => setQuery({ L: e.target.value })} /><span>{L} nm</span></label>}
        {(pot === 'double' || pot === 'finite') && <label className="slider-row"><span style={{ minWidth: 70 }}>{pot === 'double' ? 'barrier' : 'depth'}</span><input type="range" min={0.05} max={10} step={0.05} value={depth} aria-label="Barrier height" onChange={(e) => setQuery({ V: e.target.value })} /><span>{depth} eV</span></label>}
        {pot === 'oscillator' && <label className="slider-row"><span style={{ minWidth: 70 }}>ħω</span><input type="range" min={0.05} max={3} step={0.05} value={hw} aria-label="Oscillator quantum" onChange={(e) => setQuery({ hw: e.target.value })} /><span>{hw} eV</span></label>}
        <dl className="kv" aria-label="Energy levels">
          {E.map((Ei, n) => <KV key={n} k={`E${n + 1}`} v={`${formatSig(Ei, 5)}${exact(n) !== null ? ` (exact ${formatSig(exact(n)!, 5)})` : ''}`} unit="eV" />)}
        </dl>
        <p className="note">Numerical: 500 grid points, walls at the edges of the plot. {pot === 'double' ? 'The two lowest levels pair up as the barrier rises: the electron tunnels between the halves.' : pot === 'finite' ? 'Levels above the rim are not bound: here the outer walls still hold them.' : ''}</p>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Quantum states <ProvenanceBadge cls="derived" title="Schrödinger's equation solved numerically; exact levels where known" /></h1>
          <p className="note">{Q.schrodinger.quote} <SourceLinks ids={[Q.schrodinger.source, 'condon-morse-1929']} /></p></div>
        <LinePlot ariaLabel="Wavefunctions in the potential" width={620} height={340} xLabel="position x (nm)" yLabel="energy (eV); ψ drawn at its level" yDomain={[Math.min(0, ...V) - 0.05 * Emax, Emax]} series={series} legend="tr" />
        <p className="note">Each wavefunction is drawn on the line of its energy; its height is not to scale. {pot === 'oscillator' ? Q.oscillator.quote : Q.box.quote} <SourceLinks ids={levelSrc} /></p>
        {pot === 'box' && <p className="note">Finding: Mott adds “{Q.box.example.quote}” His own formula gives {formatSig((2 * Math.sqrt(20 / boxEnergyEV(1, 1e7)) + 1) * boxEnergyEV(1, 1e7), 2)} V for that box — both are shown.</p>}
      </div>
      <Panel id="q-detail" className="right-panel" title="Related">
        <button className="chip" onClick={() => navigate('/atomic/element/1')}>The hydrogen atom's orbitals →</button>
        <button className="chip" onClick={() => setQuery({ tab: 'tunnel' })}>Tunnelling through a barrier →</button>
        <RelatedLinks id="instrument:quantum" limit={4} />
      </Panel>
    </>
  );
}

function TunnelTab() {
  const { query } = useRoute();
  const V0 = num(query, 'V0', 1, 0.1, 10), a = num(query, 'a', 0.5, 0.05, 3), E = num(query, 'E', 0.5, 0.01, 20);
  const T = barrierTransmission(E, V0, a);
  const pts = Array.from({ length: 300 }, (_, i) => { const e = (i + 1) * (3 * V0) / 300; return [e, barrierTransmission(e, V0, a)] as [number, number]; });
  return (
    <>
      <Panel id="t-controls" className="left-panel" title="A barrier">
        <label className="slider-row"><span style={{ minWidth: 70 }}>height V₀</span><input type="range" min={0.1} max={10} step={0.1} value={V0} aria-label="Barrier height" onChange={(e) => setQuery({ V0: e.target.value })} /><span>{V0} eV</span></label>
        <label className="slider-row"><span style={{ minWidth: 70 }}>width a</span><input type="range" min={0.05} max={3} step={0.05} value={a} aria-label="Barrier width" onChange={(e) => setQuery({ a: e.target.value })} /><span>{a} nm</span></label>
        <label className="slider-row"><span style={{ minWidth: 70 }}>energy E</span><input type="range" min={0.01} max={Math.min(20, 3 * V0)} step={0.01} value={Math.min(E, 3 * V0)} aria-label="Electron energy" onChange={(e) => setQuery({ E: e.target.value })} /><span>{E} eV</span></label>
        <dl className="kv" aria-label="Tunnelling values"><KV k="Transmission T" v={T} sig={4} /><KV k="Reflection 1 − T" v={1 - T} sig={4} /></dl>
        <p className="note">{E < V0 ? 'Below the top: classically nothing gets through.' : 'Above the top: classically everything gets through, yet some is reflected.'}</p>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Tunnelling <ProvenanceBadge cls="derived" title="Exact transmission of a rectangular barrier (checked against transfer matrices)" /></h1>
          <p className="note">{Q.tunnel.quote} <SourceLinks ids={[Q.tunnel.source]} /></p>
          <p className="note">Condon & Morse (1929) solve the rectangular barrier exactly: “{Q.condonMorse.transmitted}” <SourceLinks ids={[Q.condonMorse.source]} /></p></div>
        <LinePlot ariaLabel="Transmission against energy" width={620} height={300} xLabel="electron energy E (eV)" yLabel="transmission T" yDomain={[0, 1.02]} series={[{ points: pts, color: '#5cf2a6', label: 'T(E)' }]} markers={[{ x: E, y: T, color: '#f5c76b' }]} vLines={[{ x: V0, label: 'top of barrier', color: '#9aa6c8' }]} />
        <p className="note">Above the top, “{Q.condonMorse.resonance}” Finding: {Q.condonMorse.erratum} Gurney & Condon on alpha decay: {Q.alpha.quote} <SourceLinks ids={[Q.alpha.source]} /></p>
      </div>
      <Panel id="t-detail" className="right-panel" title="Related">
        <button className="chip" onClick={() => navigate('/atomic/nuclei?tab=decay')}>Alpha decay is tunnelling →</button>
        <RelatedLinks id="instrument:quantum" limit={4} />
      </Panel>
    </>
  );
}

export default function QuantumView() {
  const { query } = useRoute();
  const tab = query.get('tab') === 'tunnel' ? 'tunnel' : 'states';
  return (
    <>
      <nav className="view-switch" aria-label="Quantum sections">
        <button className={tab === 'states' ? 'active' : ''} onClick={() => setQuery({ tab: null })}>Bound states</button>
        <button className={tab === 'tunnel' ? 'active' : ''} onClick={() => setQuery({ tab: 'tunnel' })}>Tunnelling</button>
      </nav>
      {tab === 'tunnel' ? <TunnelTab /> : <StatesTab />}
    </>
  );
}
