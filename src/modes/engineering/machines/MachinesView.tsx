/**
 * Machines and electricity — #/engineering/machines?tab=circuits|mechanisms|engines|grid|storage|control   (Phase 17)
 *
 *  circuits    Ohm (1827) and Kirchhoff (1845): a source with three resistors in parallel, a divider, a balanced bridge,
 *              RC charging
 *  mechanisms  Archimedes' lever and Rankine's gear rule; P = τω
 *  engines     Carnot (1824) and Rankine (1859): the efficiency limit; NASA Glenn's ideal Otto cycle
 *  grid        a coil turning in a field (Faraday); EIA's 2025 U.S. generation mix and transmission losses
 *  storage     DOE on lithium-ion cells and energy density; DOE and EPA on electric-vehicle efficiency
 *  control     Maxwell's governor (1868): disturbances that grow, die away or oscillate, decided by the roots
 */
import { useMemo } from 'react';
import { navigate, setQuery, useRoute } from '@/shared/router';
import { KV, Panel, ProvenanceBadge } from '@/ui/components';
import { SourceLinks } from '@/ui/SourcesView';
import { RelatedLinks } from '@/ui/RelatedLinks';
import { LinePlot } from '@/ui/plots';
import { formatSig } from '@/core/units/units';
import { carnot, coilEmf, coilEmfPeak, divider, gearPair, leverAdvantage, otto, parallel, rcCharge, rpmToRadS, shaftPower } from '@/core/engineering/machines';
import data from '@datasets/engineering/machines.json';

/* eslint-disable @typescript-eslint/no-explicit-any */
const D = data as any;
const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
const num = (q: URLSearchParams, k: string, d: number, a: number, b: number) => { const v = Number(q.get(k)); return q.has(k) && Number.isFinite(v) ? clamp(v, a, b) : d; };
const ON = '#ff8a65';
const Slider = ({ k, label, v, min, max, step, unit, aria }: { k: string; label: string; v: number; min: number; max: number; step: number; unit: string; aria: string }) => (
  <label className="slider-row"><span style={{ minWidth: 90 }}>{label}</span><input type="range" min={min} max={max} step={step} value={v} aria-label={aria} onChange={(e) => setQuery({ [k]: e.target.value })} /><span>{v} {unit}</span></label>
);

function Circuits() {
  const { query } = useRoute();
  const V = num(query, 'V', 9, 1, 24), R1 = num(query, 'r1', 100, 10, 1000), R2 = num(query, 'r2', 220, 10, 1000), R3 = num(query, 'r3', 470, 10, 1000);
  const I = [R1, R2, R3].map((r) => V / r), Rp = parallel(R1, R2, R3), tau = R1 * 1e-3;
  return (
    <>
      <Panel id="c-controls" className="left-panel" title="A battery and three resistors">
        <Slider k="V" label="voltage" v={V} min={1} max={24} step={0.5} unit="V" aria="Source voltage" />
        <Slider k="r1" label="R₁" v={R1} min={10} max={1000} step={10} unit="Ω" aria="Resistor 1" />
        <Slider k="r2" label="R₂" v={R2} min={10} max={1000} step={10} unit="Ω" aria="Resistor 2" />
        <Slider k="r3" label="R₃" v={R3} min={10} max={1000} step={10} unit="Ω" aria="Resistor 3" />
        <dl className="kv" aria-label="Circuit values">
          {I.map((x, i) => <KV key={i} k={`I${i + 1} = V/R${i + 1}`} v={x * 1000} unit="mA" sig={3} />)}
          <KV k="Total from the battery" v={(V / Rp) * 1000} unit="mA" sig={3} title="I₁ + I₂ + I₃ (Kirchhoff)" />
          <KV k="Combined resistance" v={Rp} unit="Ω" sig={3} />
          <KV k="Divider R₁–R₂ output" v={divider(V, R1, R2)} unit="V" sig={3} />
        </dl>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Circuits <ProvenanceBadge cls="derived" title="Ohm's and Kirchhoff's laws evaluated" /></h1>
          <p className="note">Ohm (1827), {D.ohm.where}: {D.ohm.eq}. „{D.ohm.de}“ — {D.ohm.en}. <SourceLinks ids={[D.ohm.source]} /></p>
          <p className="note">Kirchhoff (1845), {D.kirchhoff.where}: at a junction {D.kirchhoff.junction}; around a closed loop {D.kirchhoff.loop} {D.kirchhoff.loopEn}. „{D.kirchhoff.why}“ — {D.kirchhoff.whyEn}. <SourceLinks ids={[D.kirchhoff.source]} /></p></div>
        <svg viewBox="0 0 560 200" role="img" aria-label="Parallel circuit" style={{ width: '100%', maxWidth: 560 }}>
          <line x1={40} x2={40} y1={40} y2={170} stroke={ON} /><text x={14} y={110} fontSize={13} fill={ON}>{V} V</text>
          <line x1={40} x2={500} y1={40} y2={40} stroke={ON} /><line x1={40} x2={500} y1={170} y2={170} stroke={ON} />
          {I.map((x, i) => { const cx = 170 + i * 150; return <g key={i}><line x1={cx} x2={cx} y1={40} y2={80} stroke={ON} /><rect x={cx - 12} y={80} width={24} height={50} fill="none" stroke={ON} /><line x1={cx} x2={cx} y1={130} y2={170} stroke={ON} /><text x={cx + 18} y={100} fontSize={12} fill="var(--text)">R{i + 1} {[R1, R2, R3][i]} Ω</text><text x={cx + 18} y={118} fontSize={12} fill="#f5c76b">{formatSig(x * 1000, 3)} mA</text></g>; })}
        </svg>
        <p className="note">The three branch currents add up to what leaves the battery — Kirchhoff's first law. Charging a capacitor through R₁ with C = 1 mF: {formatSig(rcCharge(1, R1, 1e-3, tau) * 100, 3)} % after one time constant RC = {formatSig(tau, 3)} s.</p>
        <p className="note">Kirchhoff also gives the balance of a bridge: {D.kirchhoff.bridge} when no current flows through the meter between C and D.</p>
      </div>
      <Panel id="c-detail" className="right-panel" title="Related">
        <button className="chip" onClick={() => navigate('/engineering/semiconductors')}>Semiconductor junction →</button>
        <button className="chip" onClick={() => navigate('/spectral/fields')}>Electric fields →</button>
        <RelatedLinks id="instrument:machines" limit={3} />
      </Panel>
    </>
  );
}

function Mechanisms() {
  const { query } = useRoute();
  const t1 = Math.round(num(query, 't1', 12, 6, 80)), t2 = Math.round(num(query, 't2', 36, 6, 80)), rpm = num(query, 'rpm', 3000, 100, 8000), tq = num(query, 'tq', 10, 1, 500);
  const ea = num(query, 'ea', 2, 0.1, 5), la = num(query, 'la', 0.5, 0.1, 5);
  const g = gearPair(t1, t2, rpm, tq);
  return (
    <>
      <Panel id="m-controls" className="left-panel" title="Gears and a lever">
        <Slider k="t1" label="driver teeth" v={t1} min={6} max={80} step={1} unit="" aria="Driver teeth" />
        <Slider k="t2" label="driven teeth" v={t2} min={6} max={80} step={1} unit="" aria="Driven teeth" />
        <Slider k="rpm" label="input speed" v={rpm} min={100} max={8000} step={50} unit="rpm" aria="Input speed" />
        <Slider k="tq" label="input torque" v={tq} min={1} max={500} step={1} unit="N·m" aria="Input torque" />
        <dl className="kv" aria-label="Gear values">
          <KV k="Output speed" v={g.rpmOut} unit="rpm" sig={4} /><KV k="Output torque (ideal)" v={g.torqueOut} unit="N·m" sig={4} />
          <KV k="Power in = power out" v={shaftPower(tq, rpmToRadS(rpm)) / 1000} unit="kW" sig={4} title="P = τω" />
        </dl>
        <Slider k="ea" label="effort arm" v={ea} min={0.1} max={5} step={0.1} unit="m" aria="Effort arm" />
        <Slider k="la" label="load arm" v={la} min={0.1} max={5} step={0.1} unit="m" aria="Load arm" />
        <dl className="kv" aria-label="Lever values"><KV k="Mechanical advantage" v={leverAdvantage(ea, la)} sig={3} /></dl>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Levers, gears and power <ProvenanceBadge cls="derived" title="Ideal mechanisms: no friction or losses" /></h1>
          <p className="note">Archimedes (tr. Heath), {D.lever.where}: “{D.lever.quote}” <SourceLinks ids={[D.lever.source]} /></p>
          <p className="note">Rankine (1869), {D.gears.where}: “{D.gears.quote}” and ({D.gears.powerWhere}) “{D.gears.power}” <SourceLinks ids={[D.gears.source]} /></p></div>
        <svg viewBox="0 0 560 220" role="img" aria-label="Gear pair" style={{ width: '100%', maxWidth: 560 }}>
          {[[t1, 170, '#f5c76b'], [t2, 170 + (t1 + t2) * 2.2, ON]].map(([n, cx, col], i) => { const r = (n as number) * 2.2; return <g key={i}><circle cx={cx as number} cy={110} r={r} fill="none" stroke={col as string} strokeWidth={2} />{Array.from({ length: n as number }, (_, k) => { const a = (2 * Math.PI * k) / (n as number); return <line key={k} x1={(cx as number) + r * Math.cos(a)} y1={110 + r * Math.sin(a)} x2={(cx as number) + (r + 6) * Math.cos(a)} y2={110 + (r + 6) * Math.sin(a)} stroke={col as string} strokeWidth={2} />; })}<text x={cx as number} y={114} textAnchor="middle" fontSize={12} fill="var(--text)">{n} teeth</text></g>; })}
        </svg>
        <p className="note">Same tooth size on both wheels (Rankine: “the pitch should be the same in each”), so the radii are in the ratio of the teeth. Ideal gears trade speed for torque and keep the power: {formatSig(g.ratio, 3)} times slower, {formatSig(g.ratio, 3)} times the torque.</p>
      </div>
      <Panel id="m-detail" className="right-panel" title="Related">
        <button className="chip" onClick={() => setQuery({ tab: 'engines' })}>Engines →</button>
        <RelatedLinks id="instrument:machines" limit={3} />
      </Panel>
    </>
  );
}

function Engines() {
  const { query } = useRoute();
  const Th = num(query, 'th', 800, 300, 2500), Tc = num(query, 'tc', 300, 200, 1000), r = num(query, 'r', 10, 2, 25), gamma = num(query, 'g', 1.4, 1.1, 1.67);
  const eC = carnot(Th, Math.min(Tc, Th - 1)), eO = otto(r, gamma);
  return (
    <>
      <Panel id="e-controls" className="left-panel" title="Two temperatures, one cycle">
        <Slider k="th" label="hot T₁" v={Th} min={300} max={2500} step={10} unit="K" aria="Hot temperature" />
        <Slider k="tc" label="cold T₂" v={Tc} min={200} max={1000} step={10} unit="K" aria="Cold temperature" />
        <dl className="kv" aria-label="Engine values"><KV k="Limit (T₁ − T₂)/T₁" v={`${formatSig(eC * 100, 3)} %`} /></dl>
        <Slider k="r" label="compression r" v={r} min={2} max={25} step={0.5} unit="" aria="Compression ratio" />
        <Slider k="g" label="γ" v={gamma} min={1.1} max={1.67} step={0.01} unit="" aria="Ratio of specific heats" />
        <dl className="kv" aria-label="Otto values"><KV k="Ideal Otto efficiency" v={`${formatSig(eO * 100, 3)} %`} title="1 − r^(1−γ), derived" /><KV k="T₃/T₂ = r^(γ−1)" v={r ** (gamma - 1)} sig={3} /></dl>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Heat engines <ProvenanceBadge cls="derived" title="Carnot's principle; Rankine's formula; NASA's Otto relations" /></h1>
          <p className="note">Carnot (1824), {D.carnot.where}: „{D.carnot.fr}“ — {D.carnot.en} <SourceLinks ids={[D.carnot.source]} /></p>
          <p className="note">Rankine (1859), {D.rankine.where}: {D.rankine.eq} — “{D.rankine.law}” <SourceLinks ids={[D.rankine.source]} /></p></div>
        <LinePlot ariaLabel="Efficiency against compression ratio" width={560} height={240} xLabel="compression ratio r" yLabel="ideal Otto efficiency (%)" series={[{ points: Array.from({ length: 47 }, (_, i) => { const x = 2 + i * 0.5; return [x, otto(x, gamma) * 100] as [number, number]; }), color: ON, label: `γ = ${gamma}` }]} markers={[{ x: r, y: eO * 100, color: '#f5c76b' }]} />
        <p className="note">NASA Glenn: “{D.nasaOtto.compress}” Heating at constant volume and expanding by the same ratio gives efficiency 1 − r^(1−γ) (derived from those relations) — exactly the limit for an engine working between T₃ and T₂. “{D.nasaOtto.real}” <SourceLinks ids={[D.nasaOtto.source]} /></p>
        <p className="note">Finding: Rankine adds 461·2 to Fahrenheit degrees to get absolute temperature; today's value is 459.67.</p>
      </div>
      <Panel id="e-detail" className="right-panel" title="Related">
        <button className="chip" onClick={() => navigate('/spectral/thermal')}>Heat and radiation →</button>
        <button className="chip" onClick={() => navigate('/atomic/phases')}>Phases of matter →</button>
        <RelatedLinks id="instrument:machines" limit={3} />
      </Panel>
    </>
  );
}

function Grid() {
  const { query } = useRoute();
  const N = Math.round(num(query, 'N', 100, 1, 1000)), B = num(query, 'B', 0.5, 0.01, 2), A = num(query, 'A', 0.01, 0.001, 0.1), f = num(query, 'f', 50, 1, 120);
  const w = 2 * Math.PI * f, pk = coilEmfPeak(N, B, A, w);
  const pts = useMemo(() => Array.from({ length: 200 }, (_, i) => { const t = (i / 199) * (2 / f); return [t * 1000, coilEmf(N, B, A, w, t)] as [number, number]; }), [N, B, A, w, f]);
  const G = D.grid;
  return (
    <>
      <Panel id="g-controls" className="left-panel" title="A coil turning in a field">
        <Slider k="N" label="turns N" v={N} min={1} max={1000} step={1} unit="" aria="Turns" />
        <Slider k="B" label="field B" v={B} min={0.01} max={2} step={0.01} unit="T" aria="Magnetic field" />
        <Slider k="A" label="coil area" v={A} min={0.001} max={0.1} step={0.001} unit="m²" aria="Coil area" />
        <Slider k="f" label="turns per second" v={f} min={1} max={120} step={1} unit="Hz" aria="Rotation frequency" />
        <dl className="kv" aria-label="Generator values"><KV k="Peak voltage N B A ω" v={pk} unit="V" sig={4} /><KV k="rms" v={pk / Math.SQRT2} unit="V" sig={4} /></dl>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Generators and the grid <ProvenanceBadge cls="derived" title="Faraday's law in modern form; EIA data" /></h1>
          <p className="note">Faraday (1852, {D.faraday.where}): “{D.faraday.quote}” — “{D.faraday.curves}”. <SourceLinks ids={[D.faraday.source, D.faraday.curvesSource]} /> A coil turning steadily cuts the lines at a rate that rises and falls with the angle: ε = N B A ω sin ωt (modern form).</p></div>
        <LinePlot ariaLabel="Generator voltage against time" width={560} height={200} xLabel="time (ms)" yLabel="voltage (V)" series={[{ points: pts, color: ON, label: 'ε(t)' }]} />
        <p className="note">EIA: “{G.generator.quote}” <SourceLinks ids={[G.generator.source]} /></p>
        <div role="list" aria-label="U.S. generation by source" style={{ display: 'flex', height: 30, borderRadius: 6, overflow: 'hidden', margin: '6px 0' }}>
          {G.mix.map((m: { s: string; p: number }, i: number) => <div key={m.s} role="listitem" title={`${m.s} ${m.p}%`} style={{ width: `${m.p}%`, background: ['#9aa6c8', '#b18cff', '#55607a', '#7df9ff', '#f5c76b', '#5cf2a6', '#e8e2d0', '#ff7a90'][i] }} />)}
        </div>
        <p className="note">{G.mix.map((m: { s: string; p: number }) => `${m.s} about ${m.p}%`).join(' · ')}. {G.note} “{G.quote}” <SourceLinks ids={['eia-generation']} /></p>
      </div>
      <Panel id="g-detail" className="right-panel" title="Getting it to you">
        <p className="note">“{G.transformer.quote}” “{G.transformer.why}” <SourceLinks ids={[G.transformer.source]} /></p>
        <p className="note">“{G.losses.quote}” <SourceLinks ids={[G.losses.source]} /> Of {G.totalTWh.toLocaleString('en-US')} TWh, about 5 % is roughly {formatSig(G.totalTWh * 0.05, 2)} TWh (derived, applying the 2018–2022 average to 2025).</p>
        <button className="chip" onClick={() => navigate('/engineering/datacentres')}>Data centres' share →</button>
        <RelatedLinks id="instrument:machines" limit={3} />
      </Panel>
    </>
  );
}

function Storage() {
  const B = D.batteries, V = D.vehicles;
  return (
    <>
      <Panel id="s-list" className="left-panel" title="Batteries">
        <dl className="kv" aria-label="Battery values"><KV k="Li-ion 2008" v={B.density.y2008} unit="Wh/L" /><KV k="Li-ion 2020" v={B.density.y2020} unit="Wh/L" /><KV k="Increase" v={`${formatSig(B.density.y2020 / B.density.y2008, 3)}×`} /></dl>
        <p className="note">“{B.density.quote}” <SourceLinks ids={[B.density.source]} /></p>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Batteries and electric vehicles <ProvenanceBadge cls="observed" title="U.S. DOE and EPA" /></h1>
          <p className="note">DOE: “{B.explains.quote}” <SourceLinks ids={[B.explains.source]} /> Lithium-ion cells: “{B.lib.quote}” “{B.lib.separator}” <SourceLinks ids={[B.lib.source]} /></p></div>
        <table className="table-mini" aria-label="Vehicle efficiency">
          <thead><tr><th>Source</th><th>Electric vehicle</th><th>Gasoline vehicle</th></tr></thead>
          <tbody><tr><td>DOE Fact of the Week #1360 (2024)</td><td>87–91 %</td><td>about 30 %</td></tr><tr><td>EPA, Electric Vehicle Myths (2026)</td><td>about 87–91 %</td><td>about 16–25 %</td></tr></tbody>
        </table>
        <p className="note">DOE: “{V.doe.quote}” “{V.doe.wheels}” <SourceLinks ids={[V.doe.source]} /> EPA: “{V.epa.quote}” <SourceLinks ids={[V.epa.source]} /> The two agencies' gasoline figures differ (about 30 % against 16–25 %); both are shown. Regenerative braking — AFDC: “{V.regen.quote}” <SourceLinks ids={[V.regen.source]} /></p>
      </div>
      <Panel id="s-detail" className="right-panel" title="Related">
        <button className="chip" onClick={() => navigate('/atomic/element/3')}>Lithium →</button>
        <button className="chip" onClick={() => setQuery({ tab: 'grid' })}>Generators →</button>
        <RelatedLinks id="instrument:machines" limit={3} />
      </Panel>
    </>
  );
}

function Control() {
  const { query } = useRoute();
  const c = num(query, 'c', 0.6, -1, 4), k = num(query, 'k', 4, -2, 10);
  // x'' + c x' + k x = 0 — an illustrative governed disturbance
  const disc = c * c - 4 * k, re = -c / 2, im = disc < 0 ? Math.sqrt(-disc) / 2 : 0;
  const roots = disc >= 0 ? [(-c + Math.sqrt(disc)) / 2, (-c - Math.sqrt(disc)) / 2] : null;
  const maxRe = roots ? Math.max(...roots) : re;
  const kind = disc >= 0 ? (maxRe > 0 ? 0 : 1) : (re > 0 ? 2 : 3);
  const pts = useMemo(() => { let x = 1, v = 0; const out: [number, number][] = []; const dt = 0.01; for (let i = 0; i <= 1000; i++) { out.push([i * dt, clamp(x, -50, 50)]); const a = -c * v - k * x; v += a * dt; x += v * dt; } return out; }, [c, k]);
  const M = D.maxwell;
  return (
    <>
      <Panel id="ct-controls" className="left-panel" title="A governed machine">
        <Slider k="c" label="damping c" v={c} min={-1} max={4} step={0.05} unit="" aria="Damping" />
        <Slider k="k" label="restoring k" v={k} min={-2} max={10} step={0.1} unit="" aria="Restoring strength" />
        <dl className="kv" aria-label="Root values">
          <KV k="Roots" v={roots ? roots.map((r) => formatSig(r, 3)).join(', ') : `${formatSig(re, 3)} ± ${formatSig(im, 3)}i`} />
          <KV k="Maxwell's kind" v={`${kind + 1}. ${M.kinds[kind]}`} />
          <KV k="Stable?" v={kind === 1 || kind === 3 ? 'yes' : 'no'} />
        </dl>
        <p className="note">The model, x″ + c x′ + k x = 0, is illustrative — a disturbance x of the speed, pulled back by the governor (k) and damped (c). Its characteristic equation is λ² + cλ + k = 0.</p>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Feedback: Maxwell's governor <ProvenanceBadge cls="illustrative" title="A second-order model classified by Maxwell's four kinds" /></h1>
          <p className="note">Maxwell (1868), {M.where}: “{M.def}” “{M.watt}” <SourceLinks ids={[M.source]} /></p></div>
        <LinePlot ariaLabel="Disturbance against time" width={560} height={240} xLabel="time (s)" yLabel="disturbance" yDomain={[-3, 3]} series={[{ points: pts, color: ON, label: 'x(t)' }]} />
        <ol className="life-reports" aria-label="Maxwell's four kinds">{M.kinds.map((t: string, i: number) => <li key={i} style={{ color: i === kind ? ON : undefined }}>{t}</li>)}</ol>
        <p className="note">“{M.stable}” Here: the roots of λ² + cλ + k = 0 must all have negative real parts. <SourceLinks ids={[M.source]} /></p>
      </div>
      <Panel id="ct-detail" className="right-panel" title="Related">
        <button className="chip" onClick={() => navigate('/biologic/nerves')}>Nerves →</button>
        <RelatedLinks id="instrument:machines" limit={3} />
      </Panel>
    </>
  );
}

const TABS: [string, string][] = [['circuits', 'Circuits'], ['mechanisms', 'Mechanisms'], ['engines', 'Engines'], ['grid', 'Grid'], ['storage', 'Batteries & EVs'], ['control', 'Control']];
export default function MachinesView() {
  const { query } = useRoute();
  const tab = TABS.find(([t]) => t === query.get('tab'))?.[0] ?? 'circuits';
  return (
    <>
      <nav className="view-switch" aria-label="Machines sections">
        {TABS.map(([t, l]) => <button key={t} className={tab === t ? 'active' : ''} onClick={() => setQuery({ tab: t === 'circuits' ? null : t })}>{l}</button>)}
      </nav>
      {tab === 'mechanisms' ? <Mechanisms /> : tab === 'engines' ? <Engines /> : tab === 'grid' ? <Grid /> : tab === 'storage' ? <Storage /> : tab === 'control' ? <Control /> : <Circuits />}
    </>
  );
}
