/**
 * Integrated systems — #/engineering/systems?tab=spacecraft|datacentre|ev|map   (Phase 19)
 *
 * Assemble a machine from parts met earlier and follow the energy (and, for the spacecraft, the information) through
 * it. Every stage uses a sourced value or relation; chaining them is ours and labelled.
 *  spacecraft  power source + transmitter + antenna + destination + ground dish → watts, received power, bits per second
 *  datacentre  prompts × energy per prompt → facility → IT and infrastructure (PUE) → power-plant output (T&D losses)
 *  ev          battery volume × energy density → wheels (DOE share) and losses
 *  map         the eight systems of the brief, the views that hold their parts, and what flows through each
 */
import { navigate, setQuery, useRoute } from '@/shared/router';
import { KV, Panel, ProvenanceBadge } from '@/ui/components';
import { SourceLinks } from '@/ui/SourcesView';
import { RelatedLinks } from '@/ui/RelatedLinks';
import { formatSig } from '@/core/units/units';
import { CONSTANTS } from '@/core/constants/constants';
import { lightTime } from '@/core/engineering/spaceflight';
import { ARRAY_W_PER_M2_1AU, dataCentreChain, etaFromVoyager, evChain, link, rtgObservedW, rtgW, solarArrayW, YUEN } from '@/core/engineering/systems';
import space from '@datasets/engineering/space.json';
import dc from '@datasets/engineering/datacentres.json';
import ai from '@datasets/engineering/ai.json';
import machines from '@datasets/engineering/machines.json';

/* eslint-disable @typescript-eslint/no-explicit-any */
const S = space as any, DC = dc as any, AI = ai as any, M = machines as any;
const AU = CONSTANTS.au.value;
const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
const num = (q: URLSearchParams, k: string, d: number, a: number, b: number) => { const v = Number(q.get(k)); return q.has(k) && Number.isFinite(v) ? clamp(v, a, b) : d; };
const ON = '#ff8a65';
const Slider = ({ k, label, v, min, max, step, unit, aria, show }: { k: string; label: string; v: number; min: number; max: number; step: number; unit: string; aria: string; show?: string }) => (
  <label className="slider-row"><span style={{ minWidth: 96 }}>{label}</span><input type="range" min={min} max={max} step={step} value={v} aria-label={aria} onChange={(e) => setQuery({ [k]: e.target.value })} /><span>{show ?? v} {unit}</span></label>
);
const Chips = ({ k, value, options, aria }: { k: string; value: string; options: [string, string][]; aria: string }) => (
  <div role="radiogroup" aria-label={aria} className="chip-row" style={{ flexWrap: 'wrap', gap: 4, marginBottom: 6 }}>
    {options.map(([v, l]) => <button key={v} role="radio" aria-checked={v === value} className={`chip ${v === value ? 'active' : ''}`} onClick={() => setQuery({ [k]: v })}>{l}</button>)}
  </div>
);

/** A left-to-right flow: each stage a bar whose height is proportional to what passes through it; losses drop out below. */
function Flow({ stages, unit, aria }: { stages: { label: string; value: number; loss?: string }[]; unit: string; aria: string }) {
  const max = Math.max(...stages.map((s) => s.value)), W = 600, H = 220, bw = 64, gap = (W - 40 - bw * stages.length) / Math.max(1, stages.length - 1);
  const h = (v: number) => Math.max(2, (v / max) * (H - 80));
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={aria} style={{ width: '100%', maxWidth: W }}>
      {stages.map((s, i) => { const x = 20 + i * (bw + gap), y = 30 + (H - 80 - h(s.value)) / 2; const next = stages[i + 1]; return (
        <g key={s.label}>
          {next ? <path d={`M ${x + bw} ${y} L ${x + bw + gap} ${30 + (H - 80 - h(next.value)) / 2} L ${x + bw + gap} ${30 + (H - 80 + h(next.value)) / 2} L ${x + bw} ${y + h(s.value)} Z`} fill={ON} opacity={0.18} /> : null}
          {next && next.loss ? <text x={x + bw + gap / 2} y={H - 28} textAnchor="middle" fontSize={10.5} fill="#ff7a90">−{formatSig(s.value - next.value, 3)} {unit}</text> : null}
          {next && next.loss ? <text x={x + bw + gap / 2} y={H - 14} textAnchor="middle" fontSize={10} fill="var(--text-dim)">{next.loss}</text> : null}
          <rect x={x} y={y} width={bw} height={h(s.value)} rx={3} fill={ON} opacity={0.85} />
          <text x={x + bw / 2} y={18} textAnchor="middle" fontSize={11} fill="var(--text)">{s.label}</text>
          <text x={x + bw / 2} y={y + h(s.value) + 14} textAnchor="middle" fontSize={11} fill="#f5c76b">{formatSig(s.value, 3)}</text>
        </g>); })}
      <text x={W - 6} y={H - 2} textAnchor="end" fontSize={10} fill="var(--text-dim)">{unit}</text>
    </svg>
  );
}

// distance from Earth in AU, distance from the Sun in AU
const DEST: [string, string, number, number][] = [
  ['jupiter', 'Jupiter (6.8 × 10¹¹ m, Yuen)', 6.8e11 / CONSTANTS.au.value, 5.2],
  ['saturn', 'Saturn (~9.5 AU)', 9.537, 9.537],
  ['pluto', 'Pluto, 2016 (4.5 light-hours)', (4.5 * 3600 * 299_792_458) / CONSTANTS.au.value, (4.5 * 3600 * 299_792_458) / CONSTANTS.au.value],
  ['v1', 'Voyager 1, 2024 (164.7 AU)', 164.7, 164.7],
];
function Spacecraft() {
  const { query } = useRoute();
  const src = query.get('pow') === 'solar' ? 'solar' : 'rtg';
  const nR = Math.round(num(query, 'n', 3, 1, 6)), area = num(query, 'area', 37, 1, 200), years = num(query, 'yr', 0, 0, 50);
  const pt = num(query, 'pt', 20, 1, 100), dTx = num(query, 'hga', 3.7, 0.5, 6), dRx = Number(query.get('dsn') ?? 70) === 34 ? 34 : 70;
  const dest = DEST.find(([k]) => k === query.get('to')) ?? DEST[0];
  const distAu = dest[2], dist = distAu * AU;
  const sunDist = dest[3];   // Jupiter: Juno's “five times farther from the sun than Earth”
  const power = src === 'solar' ? solarArrayW(area, sunDist) : rtgObservedW(nR, years);
  const L = link({ ptW: pt, dTx, dRx, distM: dist });
  const gb = 6.25, days = (gb * 8e9) / L.bps / 86400;
  const ok = pt <= power;
  return (
    <>
      <Panel id="s-build" className="left-panel" title="Build a spacecraft">
        <p className="note">Destination</p>
        <Chips k="to" value={dest[0]} options={DEST.map(([k, l]) => [k, l] as [string, string])} aria="Destination" />
        <p className="note">Power</p>
        <Chips k="pow" value={src} options={[['rtg', 'RTGs'], ['solar', 'Solar arrays']]} aria="Power source" />
        {src === 'rtg' ? <><Slider k="n" label="RTGs" v={nR} min={1} max={6} step={1} unit="× 158 W" aria="Number of RTGs" /><Slider k="yr" label="years flown" v={years} min={0} max={50} step={1} unit="y" aria="Years since launch" /></>
          : <Slider k="area" label="array area" v={area} min={1} max={200} step={1} unit="m²" aria="Array area" />}
        <p className="note">Radio</p>
        <Slider k="pt" label="transmitter" v={pt} min={1} max={100} step={1} unit="W" aria="Transmitter power" />
        <Slider k="hga" label="spacecraft dish" v={dTx} min={0.5} max={6} step={0.1} unit="m" aria="Spacecraft dish" />
        <Chips k="dsn" value={String(dRx)} options={[['70', 'DSN 70 m'], ['34', 'DSN 34 m']]} aria="Ground antenna" />
        <dl className="kv" aria-label="Spacecraft budget">
          <KV k="Electrical power" v={power} unit="W" sig={3} />
          <KV k="Received at Earth" v={L.pr} unit="W" sig={3} />
          <KV k="Data rate" v={L.bps >= 1000 ? `${formatSig(L.bps / 1000, 3)} kbit/s` : `${formatSig(L.bps, 3)} bit/s`} />
          <KV k="Light time" v={lightTime(dist) / 3600} unit="h" sig={3} />
          <KV k="6.25 GB takes" v={days} unit="days" sig={3} title="New Horizons' Pluto data volume" />
        </dl>
        {!ok ? <p className="note" style={{ color: '#ff7a90' }}>The transmitter alone needs more than the supply provides — energy has to come from somewhere.</p> : null}
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>A spacecraft, end to end <ProvenanceBadge cls="derived" title="Sourced parts chained together; the chain is ours" /></h1>
          <p className="note">Energy in, bits out. Watts from the Sun or plutonium, a few of them radiated as radio, almost all of that spread over a sphere the size of the distance, and a dish on Earth catching a sliver.</p></div>
        <Flow aria="Power to the ground" unit="W" stages={[{ label: 'supply', value: power }, { label: 'radio', value: pt, loss: 'other loads' }]} />
        <dl className="kv" aria-label="Link chain" style={{ maxWidth: 600 }}>
          <KV k="Spacecraft dish gain" v={`${formatSig(10 * Math.log10(L.gt), 3)} dBi`} title={`η = ${formatSig(etaFromVoyager(), 2)}, implied by Yuen's 6.5 × 10⁴ for Voyager's 3.7 m dish`} />
          <KV k="Ground dish gain" v={`${formatSig(10 * Math.log10(L.gr), 3)} dBi`} title="η = 0.42 (Yuen's 64 m example)" />
          <KV k="Signal ÷ noise density P_R L/N₀" v={L.ratio} unit="Hz" sig={3} />
          <KV k="Noise density N₀ = kT" v={L.n0} unit="W/Hz" sig={4} />
        </dl>
        <p className="note">How it is chained: supply from {src === 'solar' ? <>an array giving Hubble's output per square metre ({formatSig(ARRAY_W_PER_M2_1AU, 3)} W/m², from “about 5,500 watts” on 2 × 2.44 × 7.54 m) scaled by 1/d² <SourceLinks ids={['nasa-hubble-about', 'nasa-gsfc-tsi']} /></> : <>RTGs of 158 We each at launch, fading along one exponential through Voyager's 474 W (1977) and 225 W (2023) — faster than plutonium decay alone ({formatSig(rtgW(nR, years), 3)} W) <SourceLinks ids={['nasa-voyager-1', 'nasa-voyager-spacecraft']} /></>}; received power by Yuen's equations with his loss L = {YUEN.L} and noise temperature {YUEN.T} K; {dest[0] === 'saturn' ? <>Saturn's distance is its semi-major axis <SourceLinks ids={['jpl-approx-planets']} />; </> : null}bits per second from his statement that Voyager's coding “requires a received signal-power-to-noise-spectral-density ratio of 2.05 × 10⁵ Hz for a data rate of 115.2 kilobits per second” <SourceLinks ids={['yuen-1982']} />.</p>
        <p className="note">Check against reality: Voyager 1 at 164.7 AU with three RTGs after 47 years, 20 W and a 70 m dish → {formatSig(link({ ptW: 20, dTx: 3.7, dRx: 70, distM: 164.7 * AU }).bps, 3)} bit/s by this chain; NASA: “{S.link.voyager.quote.split('. ')[0]}.” — 160 bit/s. <SourceLinks ids={['nasa-voyager-spacecraft']} /> (The transmitter power used is Basics of Space Flight's “no more than 20 W”.)</p>
      </div>
      <Panel id="s-detail" className="right-panel" title="The parts">
        <button className="chip" onClick={() => navigate('/engineering/space?tab=power')}>Power sources →</button>
        <button className="chip" onClick={() => navigate('/engineering/space?tab=link')}>The radio link →</button>
        <button className="chip" onClick={() => navigate('/engineering/network')}>Shannon's limit →</button>
        <button className="chip" onClick={() => navigate('/cosmic/map?sel=voyager-1')}>Where Voyager is →</button>
        <RelatedLinks id="instrument:eng-systems" limit={3} />
      </Panel>
    </>
  );
}

function DataCentre() {
  const { query } = useRoute();
  const E = AI.energy, est = query.get('est') === 'jegham' ? 'jegham' : 'google';
  const wh = est === 'jegham' ? E.jegham.wh : E.google.whPerPrompt;
  const lp = num(query, 'lp', 9, 6, 11), prompts = 10 ** lp;
  const pue = num(query, 'pue', DC.pue.ai.y2024, 1, 2.5);
  const c = dataCentreChain(prompts, wh, pue, 0.05);
  const yearTWh = (c.generation * 365) / 1e9;
  return (
    <>
      <Panel id="d-build" className="left-panel" title="Run a chatbot service">
        <Slider k="lp" label="prompts a day" v={lp} min={6} max={11} step={0.1} unit="" aria="Prompts per day (log)" show={`${formatSig(prompts, 2)}`} />
        <p className="note">Energy per prompt</p>
        <Chips k="est" value={est} options={[['google', `Google, ${E.google.whPerPrompt} Wh`], ['jegham', `Jegham et al., ${E.jegham.wh} Wh`]]} aria="Energy estimate" />
        <Slider k="pue" label="PUE" v={pue} min={1} max={2.5} step={0.005} unit="" aria="Power usage effectiveness" show={pue.toFixed(3)} />
        <dl className="kv" aria-label="Data centre budget">
          <KV k="Generated" v={c.generation} unit="kWh/day" sig={3} />
          <KV k="Lost in the grid (5 %)" v={c.lines} unit="kWh/day" sig={3} />
          <KV k="Cooling and power distribution" v={c.infrastructure} unit="kWh/day" sig={3} />
          <KV k="Computers (IT)" v={c.it} unit="kWh/day" sig={3} />
          <KV k="Per year" v={yearTWh} unit="TWh" sig={3} />
          <KV k="Share of U.S. data centres, 2024" v={`${formatSig((yearTWh / DC.y2024.twh) * 100, 3)} %`} />
        </dl>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>From power plant to prompt <ProvenanceBadge cls="derived" title="Per-prompt estimates, LBNL's PUE and EIA's losses chained together" /></h1>
          <p className="note">The same kilowatt-hour passes through generators, transmission lines, transformers, cooling and chips.</p></div>
        <Flow aria="Energy from plant to computers" unit="kWh per day" stages={[{ label: 'power plants', value: c.generation }, { label: 'facility', value: c.facility, loss: 'grid losses' }, { label: 'computers', value: c.it, loss: 'cooling etc.' }]} />
        <p className="note">Per prompt — Google: “{E.google.quote}” ({E.google.scope}) <SourceLinks ids={[E.google.source]} />; Jegham et al.: “{E.jegham.quote}” <SourceLinks ids={[E.jegham.source]} /> Each source defines its own scope; both are treated here as whole-facility energy. Jegham's 0.42 vs 0.37 Wh implies an overhead of {formatSig(0.42 / 0.37, 3)}, close to LBNL's AI-facility PUE of {DC.pue.ai.y2024} (derived).</p>
        <p className="note">LBNL: {DC.pue.definition} “{DC.pue.ai.quote}” <SourceLinks ids={['lbnl-2025-datacentre']} /> EIA: “{M.grid.losses.quote}” <SourceLinks ids={[M.grid.losses.source]} /></p>
      </div>
      <Panel id="d-detail" className="right-panel" title="The parts">
        <button className="chip" onClick={() => navigate('/engineering/ai?tab=energy')}>AI energy →</button>
        <button className="chip" onClick={() => navigate('/engineering/datacentres')}>Data centres →</button>
        <button className="chip" onClick={() => navigate('/engineering/machines?tab=grid')}>The grid →</button>
        <RelatedLinks id="instrument:eng-systems" limit={3} />
      </Panel>
    </>
  );
}

function Ev() {
  const { query } = useRoute();
  const B = M.batteries.density, V = M.vehicles;
  const yr = query.get('cell') === '2008' ? 2008 : 2020, whl = yr === 2008 ? B.y2008 : B.y2020;
  const litres = num(query, 'L', 150, 20, 400), share = num(query, 'w', 0.67, 0.65, 0.69);
  const e = evChain(litres, whl, share);
  return (
    <>
      <Panel id="e-build" className="left-panel" title="Build an electric car">
        <p className="note">Cells</p>
        <Chips k="cell" value={String(yr)} options={[['2020', `2020 lithium-ion (${B.y2020} Wh/L)`], ['2008', `2008 lithium-ion (${B.y2008} Wh/L)`]]} aria="Cell generation" />
        <Slider k="L" label="cell volume" v={litres} min={20} max={400} step={5} unit="L" aria="Battery volume" />
        <Slider k="w" label="to the wheels" v={share} min={0.65} max={0.69} step={0.01} unit="" aria="Share to the wheels" show={`${Math.round(share * 100)} %`} />
        <dl className="kv" aria-label="EV budget">
          <KV k="Stored" v={e.battery} unit="kWh" sig={3} />
          <KV k="Delivered to the wheels" v={e.wheels} unit="kWh" sig={3} />
          <KV k="Lost on the way" v={e.losses} unit="kWh" sig={3} />
        </dl>
        <p className="note">Cell volume only — packs add cooling, wiring and structure (not modelled). No driving range is given: that needs the car's energy use per kilometre, which no source here provides.</p>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Battery to wheels <ProvenanceBadge cls="derived" title="DOE energy density and efficiency chained" /></h1>
          <p className="note">Chemical energy in the cell becomes electricity, the motor turns it into motion, and braking runs the motor as a generator to send some back.</p></div>
        <Flow aria="Energy from battery to wheels" unit="kWh" stages={[{ label: 'battery', value: e.battery }, { label: 'wheels', value: e.wheels, loss: 'motor, electronics…' }]} />
        <p className="note">DOE: “{B.quote}” <SourceLinks ids={[B.source]} /> “{V.doe.wheels}” “{V.doe.quote}” <SourceLinks ids={[V.doe.source]} /> AFDC: “{V.regen.quote}” <SourceLinks ids={[V.regen.source]} /></p>
        <p className="note">With 2008 cells the same {litres} L would hold {formatSig((litres * B.y2008) / 1000, 3)} kWh instead of {formatSig((litres * B.y2020) / 1000, 3)} kWh — {formatSig(B.y2020 / B.y2008, 3)} times less.</p>
      </div>
      <Panel id="e-detail" className="right-panel" title="The parts">
        <button className="chip" onClick={() => navigate('/engineering/machines?tab=storage')}>Batteries & EVs →</button>
        <button className="chip" onClick={() => navigate('/engineering/machines?tab=grid')}>Motors and generators →</button>
        <button className="chip" onClick={() => navigate('/atomic/element/3')}>Lithium →</button>
        <RelatedLinks id="instrument:eng-systems" limit={3} />
      </Panel>
    </>
  );
}

const FLOWS = ['energy', 'matter', 'information', 'electricity', 'heat', 'force', 'light & radio'] as const;
const MAP: { name: string; parts: [string, string][]; flows: (typeof FLOWS)[number][] }[] = [
  { name: 'A functional computer', parts: [['Logic gates and an adder', '/engineering/logic'], ['Transistors', '/engineering/semiconductors'], ['Von Neumann architecture', '/engineering/architecture']], flows: ['information', 'electricity', 'heat'] },
  { name: 'A neural network', parts: [['Train one', '/engineering/ai?tab=learning'], ['Attention', '/engineering/ai?tab=attention']], flows: ['information', 'electricity', 'heat'] },
  { name: 'An electrical circuit', parts: [['Ohm and Kirchhoff', '/engineering/machines'], ['p-n junction', '/engineering/semiconductors']], flows: ['energy', 'electricity', 'heat'] },
  { name: 'An electric vehicle', parts: [['Build one', '/engineering/systems?tab=ev'], ['Batteries & EVs', '/engineering/machines?tab=storage'], ['Gears', '/engineering/machines?tab=mechanisms']], flows: ['energy', 'matter', 'electricity', 'heat', 'force'] },
  { name: 'A robotic system', parts: [['Feedback (Maxwell)', '/engineering/machines?tab=control'], ['Agents', '/engineering/ai?tab=agents'], ['Levers and gears', '/engineering/machines?tab=mechanisms']], flows: ['information', 'electricity', 'force'] },
  { name: 'A satellite', parts: [['Build one', '/engineering/systems?tab=spacecraft'], ['Orbits', '/engineering/space?tab=orbits'], ['GPS', '/spectral/rf']], flows: ['energy', 'information', 'electricity', 'heat', 'force', 'light & radio'] },
  { name: 'A scientific spacecraft', parts: [['Spacecraft', '/engineering/space'], ['Instruments to archive', '/engineering/space?tab=chain'], ['Spectroscopy', '/spectral/spectroscopy']], flows: ['energy', 'matter', 'information', 'electricity', 'heat', 'force', 'light & radio'] },
  { name: 'A data centre', parts: [['Run one', '/engineering/systems?tab=datacentre'], ['Data centres', '/engineering/datacentres'], ['Heat and radiation', '/spectral/thermal']], flows: ['energy', 'information', 'electricity', 'heat'] },
];
function SystemsMap() {
  return (
    <div className="center-stage hr-stage" style={{ left: 24, right: 24 }}>
      <div className="stage-head"><h1>Eight systems, their parts, what flows through them</h1>
        <p className="note">Each machine reuses parts built earlier in the Engineering pillar — and the physics, chemistry and astronomy beneath them. The flow marks are our classification.</p></div>
      <table className="table-mini" aria-label="Systems map" style={{ maxWidth: 1100 }}>
        <thead><tr><th>System</th><th>Parts</th>{FLOWS.map((f) => <th key={f}>{f}</th>)}</tr></thead>
        <tbody>{MAP.map((m) => <tr key={m.name}><td>{m.name}</td><td>{m.parts.map(([l, to]) => <button key={to} className="chip" style={{ marginRight: 4 }} onClick={() => navigate(to)}>{l}</button>)}</td>{FLOWS.map((f) => <td key={f} style={{ textAlign: 'center', color: ON }}>{m.flows.includes(f) ? '●' : ''}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

const TABS: [string, string][] = [['spacecraft', 'Spacecraft'], ['datacentre', 'Data centre'], ['ev', 'Electric car'], ['map', 'All systems']];
export default function SystemsView() {
  const { query } = useRoute();
  const tab = TABS.find(([t]) => t === query.get('tab'))?.[0] ?? 'spacecraft';
  return (
    <>
      <nav className="view-switch" aria-label="Systems sections">
        {TABS.map(([t, l]) => <button key={t} className={tab === t ? 'active' : ''} onClick={() => setQuery({ tab: t === 'spacecraft' ? null : t })}>{l}</button>)}
      </nav>
      {tab === 'datacentre' ? <DataCentre /> : tab === 'ev' ? <Ev /> : tab === 'map' ? <SystemsMap /> : <Spacecraft />}
    </>
  );
}
