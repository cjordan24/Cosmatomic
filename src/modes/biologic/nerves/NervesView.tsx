/**
 * Nerves — #/biologic/nerves?tab=spike|conduction   (Phase 12, Gate 12.4)
 *
 *  spike       the Hodgkin–Huxley (1952) membrane action potential, integrated live (RK4) from their equations and
 *              Table 3: stimulus (an initial depolarisation, as in their Fig. 12), temperature (Q10 = 3), ḡ_Na and ḡ_K;
 *              potential (plotted as −V, depolarisation upward), gates n, m, h and the Na and K currents
 *  conduction  their eq. (34) θ = √(Ka/2R₂C_M) with the fibre of p. 528 (18·8 calculated, 21·2 m/sec measured);
 *              Hursh (1939): velocity in m/s = 6.0 × diameter in µm (cat); neurons and myelin (SEER, NIGMS); neuron
 *              count (Azevedo et al. 2009)
 */
import { useMemo } from 'react';
import { setQuery, useRoute } from '@/shared/router';
import { KV, Panel, ProvenanceBadge } from '@/ui/components';
import { SourceLinks } from '@/ui/SourcesView';
import { RelatedLinks } from '@/ui/RelatedLinks';
import { LinePlot } from '@/ui/plots';
import { formatSig } from '@/core/units/units';
import { HH_TABLE3, conductionVelocity, phi, simulateMembrane } from '@/core/biology/hodgkinHuxley';
import data from '@datasets/biology/nerves.json';

const N = data as unknown as {
  hh: { convention: { quote: string }; units: { quote: string }; table3: { rows: { constant: string; chosen: string; mean: string; range: string }[]; footnote: string }; propagation: { K: number; tempC: number; aCm: number; R2: number; CM: number; calculated: number; measured: number; quote: string } };
  hursh: { factor: number; animal: string; quote: string };
  neurons: { count: { quote: string }; text: { quote: string; source: string; subject?: string }[] };
};
const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
const num = (q: URLSearchParams, k: string, d: number, a: number, b: number) => { const v = Number(q.get(k)); return q.has(k) && Number.isFinite(v) ? clamp(v, a, b) : d; };
const HH = ['hodgkin-huxley-1952'];

function Slider({ k, label, v, min, max, step, unit, aria }: { k: string; label: string; v: number; min: number; max: number; step: number; unit: string; aria: string }) {
  return <label className="slider-row"><span style={{ minWidth: 92 }}>{label}</span><input type="range" min={min} max={max} step={step} value={v} aria-label={aria} onChange={(e) => setQuery({ [k]: e.target.value })} /><span>{v} {unit}</span></label>;
}

function SpikeTab() {
  const { query } = useRoute();
  const stim = num(query, 'stim', 15, 0, 40), tC = num(query, 't', 6.3, 0, 30);
  const gNa = num(query, 'gna', HH_TABLE3.gNa, 0, 200), gK = num(query, 'gk', HH_TABLE3.gK, 0, 80);
  const tMax = 20 / Math.max(0.5, phi(tC)) + 2;
  const tr = useMemo(() => simulateMembrane({ tMax, dt: 0.01, tempC: tC, V0: -stim, params: { ...HH_TABLE3, gNa, gK } }), [tMax, tC, stim, gNa, gK]);
  const dep = tr.V.map((v) => -v); // depolarisation upward
  const every = (arr: number[]) => arr.map((y, i) => [tr.t[i], y] as [number, number]).filter((_, i) => i % 5 === 0);
  const peak = Math.max(...dep), iPeak = dep.indexOf(peak);
  const fired = peak > 50;
  return (
    <>
      <Panel id="spike-controls" className="left-panel" title="Squid giant axon">
        <Slider k="stim" label="stimulus" v={stim} min={0} max={40} step={0.5} unit="mV" aria="Initial depolarisation" />
        <Slider k="t" label="temperature" v={tC} min={0} max={30} step={0.1} unit="°C" aria="Axon temperature" />
        <Slider k="gna" label="ḡ_Na" v={gNa} min={0} max={200} step={1} unit="m.mho/cm²" aria="Sodium conductance" />
        <Slider k="gk" label="ḡ_K" v={gK} min={0} max={80} step={1} unit="m.mho/cm²" aria="Potassium conductance" />
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <button className="chip" onClick={() => setQuery({ stim: null, t: null, gna: null, gk: null })}>Table 3 at 6·3 °C</button>
          <button className="chip" onClick={() => setQuery({ stim: '5' })}>Below threshold (5 mV)</button>
          <button className="chip" onClick={() => setQuery({ t: '18.5' })}>18·5 °C</button>
        </div>
        <p className="note">The stimulus is an initial displacement of the membrane potential, as in their membrane action potentials. Rate constants are multiplied by φ = 3^((T − 6·3)/10) (p. 523).</p>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head">
          <h1>The action potential <ProvenanceBadge cls="simulated" title="Hodgkin & Huxley (1952) equations (26), (7), (15), (16) with Table 3, integrated by 4th-order Runge–Kutta" /></h1>
          <p className="note">Hodgkin and Huxley's equations for the squid giant axon, solved here step by step. “{N.hh.convention.quote}” — the plots show −V, so a depolarisation goes up. <SourceLinks ids={HH} /></p>
        </div>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 340px', maxWidth: 420 }}>
            <LinePlot ariaLabel="Membrane potential" width={420} height={230} xLabel="time (ms)" yLabel="−V, depolarisation (mV)"
              series={[{ points: every(dep), color: '#5cf2a6', label: '−V' }]} hLines={[{ y: -HH_TABLE3.VNa, label: 'V_Na', color: '#ff7a90' }, { y: -HH_TABLE3.VK, label: 'V_K', color: '#7df9ff' }]} />
          </div>
          <div style={{ flex: '1 1 340px', maxWidth: 420 }}>
            <LinePlot ariaLabel="Gating variables" width={420} height={230} xLabel="time (ms)" yLabel="n, m, h" yDomain={[0, 1]} legend="tr"
              series={[{ points: every(tr.m), color: '#ff7a90', label: 'm (Na activation)' }, { points: every(tr.h), color: '#f5c76b', label: 'h (Na inactivation)' }, { points: every(tr.n), color: '#7df9ff', label: 'n (K activation)' }]} />
          </div>
          <div style={{ flex: '1 1 340px', maxWidth: 420 }}>
            <LinePlot ariaLabel="Ionic currents" width={420} height={230} xLabel="time (ms)" yLabel="current (µA/cm², inward +)"
              series={[{ points: every(tr.INa), color: '#ff7a90', label: 'I_Na' }, { points: every(tr.IK), color: '#7df9ff', label: 'I_K' }]} />
          </div>
        </div>
      </div>
      <Panel id="spike-readout" className="right-panel" title="This run">
        <dl className="kv" aria-label="Spike values">
          <KV k="Result" v={fired ? 'action potential' : 'no action potential'} />
          <KV k="Peak depolarisation" v={peak} unit="mV" sig={3} />
          <KV k="Time to peak" v={tr.t[iPeak]} unit="ms" sig={3} />
          <KV k="Rate factor φ" v={phi(tC)} sig={3} />
        </dl>
        <table className="table-mini" aria-label="Table 3" style={{ marginTop: 8 }}>
          <thead><tr><th>constant</th><th>chosen</th><th>exp. mean</th></tr></thead>
          <tbody>{N.hh.table3.rows.map((r) => <tr key={r.constant}><td style={{ textAlign: 'left' }}>{r.constant}</td><td>{r.chosen}</td><td>{r.mean}</td></tr>)}</tbody>
        </table>
        <p className="note">{N.hh.table3.footnote} With these equations exact zero needs −10·599 mV; the printed value leaves 0.004 µA/cm² at rest. <SourceLinks ids={HH} /></p>
        <RelatedLinks id="instrument:nerves" limit={4} />
      </Panel>
    </>
  );
}

function ConductionTab() {
  const { query } = useRoute();
  const p = N.hh.propagation;
  const aUm = num(query, 'a', p.aCm * 1e4, 10, 500), R2 = num(query, 'r2', p.R2, 10, 100);
  const theta = conductionVelocity(p.K, aUm * 1e-4, R2, p.CM);
  const ds = Array.from({ length: 50 }, (_, i) => 1 + (i / 49) * 19);
  return (
    <>
      <Panel id="cond-controls" className="left-panel" title="Fibre">
        <label className="slider-row"><span style={{ minWidth: 92 }}>axon radius a</span><input type="range" min={10} max={500} step={1} value={aUm} aria-label="Axon radius" onChange={(e) => setQuery({ a: e.target.value })} /><span>{aUm} µm</span></label>
        <label className="slider-row"><span style={{ minWidth: 92 }}>axoplasm R₂</span><input type="range" min={10} max={100} step={0.1} value={R2} aria-label="Axoplasm resistivity" onChange={(e) => setQuery({ r2: e.target.value })} /><span>{R2} Ω cm</span></label>
        <button className="chip" onClick={() => setQuery({ a: null, r2: null })}>Their fibre: a = 238 µ, R₂ = 35·4 Ω cm</button>
        <dl className="kv" aria-label="Conduction velocity"><KV k="θ = √(Ka/2R₂C_M)" v={theta} unit="m/s" sig={3} /></dl>
        <p className="note">K = {p.K} msec⁻¹ at {p.tempC} °C and C_M = 1·0 µF/cm² held fixed. Velocity grows as the square root of the radius.</p>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head">
          <h1>Conduction velocity <ProvenanceBadge cls="derived" title="Hodgkin & Huxley (1952) eq. (34); Hursh (1939)" /></h1>
          <blockquote className="quote">“{p.quote}” <span className="note" style={{ fontStyle: 'normal' }}>— Hodgkin & Huxley (1952), p. 528 <SourceLinks ids={HH} /></span></blockquote>
          <blockquote className="quote">“{N.hursh.quote}” <span className="note" style={{ fontStyle: 'normal' }}>— Hursh (1939), p. 136, {N.hursh.animal} <SourceLinks ids={['hursh-1939']} /></span></blockquote>
        </div>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 340px', maxWidth: 420 }}>
            <LinePlot ariaLabel="Squid axon velocity against radius" width={420} height={230} xLabel="squid axon radius (µm)" yLabel="θ (m/s)"
              series={[{ points: Array.from({ length: 60 }, (_, i) => { const a = 10 + i * 8; return [a, conductionVelocity(p.K, a * 1e-4, R2, p.CM)] as [number, number]; }), color: '#5cf2a6', label: 'eq. (34)' }]}
              markers={[{ x: aUm, y: theta, color: '#f5c76b' }, { x: 238, y: p.measured, color: '#ff7a90', label: 'measured 21·2' }]} />
          </div>
          <div style={{ flex: '1 1 340px', maxWidth: 420 }}>
            <LinePlot ariaLabel="Myelinated fibre velocity against diameter" width={420} height={230} xLabel="cat fibre diameter (µm)" yLabel="velocity (m/s)"
              series={[{ points: ds.map((d) => [d, N.hursh.factor * d] as [number, number]), color: '#f5c76b', label: 'Hursh: 6.0 × diameter' }]} />
          </div>
        </div>
        <p className="note">Two kinds of fibre, two shapes: for the squid axon eq. (34) makes speed grow as the square root of the radius; for the cat nerve fibres Hursh measured, speed grows in proportion to the diameter (his data were “not compatible” with square-root or square laws, p. 136).</p>
      </div>
      <Panel id="cond-detail" className="right-panel" title="Nerve cells">
        <blockquote className="quote">“{N.neurons.count.quote}” <SourceLinks ids={['azevedo-2009']} /></blockquote>
        {N.neurons.text.map((t, i) => <blockquote key={i} className="quote">{t.subject && <strong style={{ fontStyle: 'normal' }}>{t.subject}: </strong>}“{t.quote}” <SourceLinks ids={[t.source]} /></blockquote>)}
        <RelatedLinks id="instrument:nerves" limit={4} />
        <p className="note">Calculated here: {formatSig(conductionVelocity(p.K, p.aCm, p.R2, p.CM), 3)} m/s for their fibre (they print {p.calculated}).</p>
      </Panel>
    </>
  );
}

export default function NervesView() {
  const { query } = useRoute();
  const tab = query.get('tab') === 'conduction' ? 'conduction' : 'spike';
  return (
    <>
      <nav className="view-switch" aria-label="Nerve sections">
        <button className={tab === 'spike' ? 'active' : ''} onClick={() => setQuery({ tab: null })}>Action potential</button>
        <button className={tab === 'conduction' ? 'active' : ''} onClick={() => setQuery({ tab: 'conduction' })}>Conduction</button>
      </nav>
      {tab === 'conduction' ? <ConductionTab /> : <SpikeTab />}
    </>
  );
}
