/**
 * Spacecraft and space systems — #/engineering/space?tab=fleet|rocket|orbits|power|link|attitude|chain   (Phase 18)
 *
 *  fleet     twelve spacecraft from NASA, USGS and GPS.gov pages (launch, mass, power, where, instruments)
 *  rocket    NASA Glenn's ideal rocket equation and specific impulse; its worked example (printed MR 10; inputs 9.2)
 *  orbits    NASA Glenn's circular-orbit speed; Moulton (1914) escape speed and vis-viva; a Hohmann transfer derived
 *  power     RTGs (NASA RPS; DOE half-life 87.7 y) and Voyager's real decline; sunlight falling with distance
 *  link      Yuen (1982): flux, space loss and dish gain; Voyager's downlink; the Deep Space Network
 *  attitude  Hubble's reaction wheels and gyros; NASA's heat balance and an illustrative radiator temperature
 *  chain     from a photon on a detector to an archive, quoted step by step; an instrument encyclopedia
 */
import { useMemo } from 'react';
import { navigate, setQuery, useRoute } from '@/shared/router';
import { KV, Panel, ProvenanceBadge } from '@/ui/components';
import { SourceLinks } from '@/ui/SourcesView';
import { RelatedLinks } from '@/ui/RelatedLinks';
import { LinePlot } from '@/ui/plots';
import { formatSig } from '@/core/units/units';
import { CONSTANTS } from '@/core/constants/constants';
import { circularSpeed, decay, deltaV, dishGain, escapeSpeed, friis, G0, hohmann, lightTime, period, sunlightAt, toDb } from '@/core/engineering/spaceflight';
import data from '@datasets/engineering/space.json';

/* eslint-disable @typescript-eslint/no-explicit-any */
const D = data as any;
const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
const num = (q: URLSearchParams, k: string, d: number, a: number, b: number) => { const v = Number(q.get(k)); return q.has(k) && Number.isFinite(v) ? clamp(v, a, b) : d; };
const ON = '#ff8a65';
const AU = CONSTANTS.au.value, MU_E = CONSTANTS.GMearth.value, MU_S = CONSTANTS.GMsun.value, RE = CONSTANTS.ReEarth.value;
const Slider = ({ k, label, v, min, max, step, unit, aria, show }: { k: string; label: string; v: number; min: number; max: number; step: number; unit: string; aria: string; show?: string }) => (
  <label className="slider-row"><span style={{ minWidth: 90 }}>{label}</span><input type="range" min={min} max={max} step={step} value={v} aria-label={aria} onChange={(e) => setQuery({ [k]: e.target.value })} /><span>{show ?? v} {unit}</span></label>
);
const Related = ({ children }: { children?: React.ReactNode }) => (
  <Panel id="sp-detail" className="right-panel" title="Related">{children}<RelatedLinks id="instrument:space" limit={4} /></Panel>
);

interface Craft { id: string; name: string; src: string; launch: string; massKg: number | null; massNote?: string; power: string; powerKind: string; where: string; desc: string; status?: string; kit: string[]; map?: string; link?: string; disagree?: string; numbers?: string; instrumentStatus?: string; distAu?: number; distDate?: string }

function Fleet() {
  const { query } = useRoute();
  const F = D.fleet as Craft[];
  const c = F.find((x) => x.id === query.get('craft')) ?? F[0];
  return (
    <>
      <Panel id="f-list" className="left-panel" title="Spacecraft">
        <div role="listbox" aria-label="Spacecraft" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {F.map((x) => <button key={x.id} role="option" aria-selected={x.id === c.id} className={`chip ${x.id === c.id ? 'active' : ''}`} style={{ textAlign: 'left' }} onClick={() => setQuery({ craft: x.id })}>{x.name} <span style={{ marginLeft: 6, opacity: 0.7, fontSize: 11 }}>{x.powerKind === 'RTG' ? 'nuclear' : 'solar'}</span></button>)}
        </div>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>{c.name} <ProvenanceBadge cls="observed" title="Mission facts quoted from NASA, USGS and GPS.gov pages" /></h1>
          <p className="note">“{c.desc}” <SourceLinks ids={[c.src]} /></p></div>
        <dl className="kv" aria-label="Spacecraft facts" style={{ maxWidth: 640 }}>
          <KV k="Launch" v={c.launch} />
          <KV k="Mass" v={c.massKg ? `${c.massKg.toLocaleString('en-US')} kg` : 'not given on the source page'} title={c.massNote} />
          <KV k="Power" v={c.powerKind === 'RTG' ? 'radioisotope (RTG)' : 'solar arrays'} />
        </dl>
        <p className="note"><b>Power:</b> “{c.power}”</p>
        <p className="note"><b>Where:</b> “{c.where}”{c.status ? <> “{c.status}”</> : null}</p>
        {c.numbers ? <p className="note">{c.numbers}</p> : null}
        <p className="note"><b>Instruments and systems:</b> {c.kit.join(' · ')}</p>
        {c.instrumentStatus ? <p className="note">Finding: {c.instrumentStatus}</p> : null}
        {c.disagree ? <p className="note">Finding: {c.disagree}</p> : null}
        {c.massNote ? <p className="note">Mass: “{c.massNote}”.</p> : null}
        {c.distAu ? <p className="note">At {c.distAu} AU ({c.distDate}), light takes {formatSig(lightTime(c.distAu * AU) / 3600, 3)} hours to arrive (derived).</p> : null}
      </div>
      <Related>
        {c.map ? <button className="chip" onClick={() => navigate(`/cosmic/map?sel=${c.id}`)}>{c.name} on the universe map →</button> : null}
        {c.link ? <button className="chip" onClick={() => navigate(c.link!)}>GPS signals →</button> : null}
        <button className="chip" onClick={() => setQuery({ tab: 'power' })}>{c.powerKind === 'RTG' ? 'How RTGs fade →' : 'Sunlight and distance →'}</button>
      </Related>
    </>
  );
}

function Rocket() {
  const { query } = useRoute();
  const isp = num(query, 'isp', 350, 100, 1000), mr = num(query, 'mr', 9.2, 1.1, 30);
  const ve = isp * G0, du = deltaV(ve, mr, 1);
  const R = D.rocket, ex = R.example, exMR = Math.exp(ex.duFtS / (ex.isp * ex.g0FtS2));
  const pts = useMemo(() => Array.from({ length: 60 }, (_, i) => { const m = 1.1 + i * 0.5; return [m, deltaV(ve, m, 1) / 1000] as [number, number]; }), [ve]);
  return (
    <>
      <Panel id="r-controls" className="left-panel" title="An ideal rocket">
        <Slider k="isp" label="Isp" v={isp} min={100} max={1000} step={5} unit="s" aria="Specific impulse" />
        <Slider k="mr" label="mass ratio" v={mr} min={1.1} max={30} step={0.1} unit="" aria="Mass ratio" />
        <dl className="kv" aria-label="Rocket values">
          <KV k="Exhaust speed Veq = Isp·g0" v={ve / 1000} unit="km/s" sig={4} />
          <KV k="Δu" v={du / 1000} unit="km/s" sig={4} />
          <KV k="Propellant share" v={`${formatSig((1 - 1 / mr) * 100, 3)} %`} />
          <KV k="Low Earth orbit (400 km) needs" v={circularSpeed(MU_E, RE + 400e3) / 1000} unit="km/s" sig={3} title="before gravity and drag losses" />
        </dl>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>The rocket equation <ProvenanceBadge cls="derived" title="NASA Glenn's ideal rocket equation evaluated" /></h1>
          <p className="note">NASA Glenn: {R.eq}, Isp = Veq/g0. “{R.note}” “{R.ispWhy}” <SourceLinks ids={[R.source]} /> (On this page m<sub>f</sub> is the <i>full</i> mass and m<sub>e</sub> the empty mass.)</p></div>
        <LinePlot ariaLabel="Delta-v against mass ratio" width={560} height={240} xLabel="mass ratio full/empty" yLabel="Δu (km/s)" series={[{ points: pts, color: ON, label: `Isp ${isp} s` }]} markers={[{ x: mr, y: du / 1000, color: '#f5c76b' }]} />
        <p className="note">NASA's worked example: Isp {ex.isp} s, Δu {ex.duFtS.toLocaleString('en-US')} ft/s, g0 {ex.g0FtS2} ft/s². “{ex.quote}” Finding: those inputs give MR = e^(25,000/(350 × 32.2)) = {formatSig(exMR, 3)}, which the page rounds to {ex.printedMR}; propellant {formatSig((1 - 1 / exMR) * 100, 3)} % rather than 90 %.</p>
        <p className="note">“{R.gravity}”</p>
      </div>
      <Related><button className="chip" onClick={() => setQuery({ tab: 'orbits' })}>How fast is orbit? →</button><button className="chip" onClick={() => navigate('/engineering/machines?tab=engines')}>Heat engines →</button></Related>
    </>
  );
}

const PLANETS: [string, number][] = [['Mercury', 0.387], ['Venus', 0.723], ['Earth', 1], ['Mars', 1.524], ['Jupiter', 5.203], ['Saturn', 9.537]];
function Orbits() {
  const { query } = useRoute();
  const h = num(query, 'h', 400, 150, 36000), from = query.get('from') ?? 'Earth', to = query.get('to') ?? 'Mars';
  const r1 = (PLANETS.find((p) => p[0] === from)?.[1] ?? 1) * AU, r2 = (PLANETS.find((p) => p[0] === to)?.[1] ?? 1.524) * AU;
  const v = circularSpeed(MU_E, RE + h * 1000), T = period(MU_E, RE + h * 1000), ho = hohmann(MU_S, r1, r2);
  const O = D.orbit, M = O.moulton, c = O.check;
  const glenn = Math.sqrt((c.g0FtS2 / 5280) * c.ReMi ** 2 / (c.ReMi + c.hMi)) * 3600;
  return (
    <>
      <Panel id="o-controls" className="left-panel" title="Around the Earth">
        <Slider k="h" label="altitude" v={h} min={150} max={36000} step={50} unit="km" aria="Orbit altitude" />
        <dl className="kv" aria-label="Orbit values">
          <KV k="Circular speed" v={v / 1000} unit="km/s" sig={4} /><KV k="Period" v={T / 60} unit="min" sig={4} />
          <KV k="Escape speed there" v={escapeSpeed(MU_E, RE + h * 1000) / 1000} unit="km/s" sig={4} />
        </dl>
        <div className="chip-row" style={{ flexWrap: 'wrap', gap: 4 }}>
          <button className="chip" onClick={() => setQuery({ h: '400' })}>Space station (~90 min)</button>
          <button className="chip" onClick={() => setQuery({ h: '705' })}>Landsat 9 (705 km)</button>
          <button className="chip" onClick={() => setQuery({ h: '20200' })}>GPS (20,200 km)</button>
        </div>
        <p className="note">Between planets (circular, coplanar orbits — a simplification):</p>
        <label className="slider-row"><span style={{ minWidth: 40 }}>from</span><select className="text-input" aria-label="From planet" value={from} onChange={(e) => setQuery({ from: e.target.value })}>{PLANETS.map(([p]) => <option key={p}>{p}</option>)}</select></label>
        <label className="slider-row"><span style={{ minWidth: 40 }}>to</span><select className="text-input" aria-label="To planet" value={to} onChange={(e) => setQuery({ to: e.target.value })}>{PLANETS.map(([p]) => <option key={p}>{p}</option>)}</select></label>
        <dl className="kv" aria-label="Transfer values">
          <KV k="First burn" v={ho.dv1 / 1000} unit="km/s" sig={3} /><KV k="Second burn" v={ho.dv2 / 1000} unit="km/s" sig={3} />
          <KV k="Total" v={ho.total / 1000} unit="km/s" sig={3} /><KV k="Transfer time" v={ho.time / 86400} unit="days" sig={3} />
        </dl>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Orbits and transfers <ProvenanceBadge cls="derived" title="NASA Glenn and Moulton (1914) relations; the transfer is derived" /></h1>
          <p className="note">NASA Glenn: {O.eq}. “{O.quote}” Check: at {c.hMi} miles the page gives {c.mph.toLocaleString('en-US')} mph; the formula with its own numbers gives {formatSig(glenn, 6)} mph. <SourceLinks ids={[O.source]} /></p>
          <p className="note">Moulton (1914), {M.escapeWhere}: {M.escape} — “{M.escapeQuote}” ({M.visvivaWhere}) {M.visviva}, so a parabolic (escaping) speed is {M.ratio} times the circular one; and “{M.kepler}” <SourceLinks ids={[M.source]} /></p></div>
        <svg viewBox="-160 -160 320 320" role="img" aria-label="Hohmann transfer" style={{ width: '100%', maxWidth: 340 }}>
          {(() => { const s = 140 / Math.max(r1, r2), a = ((r1 + r2) / 2) * s, b = Math.sqrt(r1 * r2) * s; return <>
            <circle r={4} fill="#f5c76b" /><circle r={r1 * s} fill="none" stroke="var(--line)" /><circle r={r2 * s} fill="none" stroke="var(--line)" />
            {r1 !== r2 ? <path d={`M ${r1 * s} 0 A ${a} ${b} 0 0 0 ${-r2 * s} 0`} fill="none" stroke={ON} strokeWidth={2} strokeDasharray="5 4" /> : null}
            <circle cx={r1 * s} cy={0} r={5} fill="#7df9ff" /><text x={r1 * s + 6} y={14} fontSize={11} fill="var(--text)">{from}</text>
            <circle cx={-r2 * s} cy={0} r={5} fill={ON} /><text x={-r2 * s + 8} y={-8} fontSize={11} fill="var(--text)">{to}</text></>; })()}
        </svg>
        <p className="note">Basics of Space Flight: “{O.hohmann.quote}” “{O.hohmann.window}” <SourceLinks ids={[O.hohmann.source]} /> The burns are derived from Moulton's vis-viva equation (speed on the transfer ellipse minus circular speed at each end) — our calculation, not a quoted formula.</p>
      </div>
      <Related><button className="chip" onClick={() => navigate('/cosmic')}>The solar system →</button><button className="chip" onClick={() => navigate('/cosmic/sandbox')}>Gravity sandbox →</button></Related>
    </>
  );
}

function Power() {
  const { query } = useRoute();
  const d = num(query, 'd', 5.2, 0.3, 40);
  const P = D.power, V = P.voyager, hl = P.halfLife.years;
  const pts = useMemo(() => Array.from({ length: 61 }, (_, i) => [1977 + i, decay(V.launchW, i, hl)] as [number, number]), [V.launchW, hl]);
  const solar = useMemo(() => Array.from({ length: 80 }, (_, i) => { const x = 0.3 * 1.07 ** i; return [x, sunlightAt(P.solar.tsi, x)] as [number, number]; }), [P.solar.tsi]);
  return (
    <>
      <Panel id="p-controls" className="left-panel" title="Sunlight against distance">
        <Slider k="d" label="distance" v={d} min={0.3} max={40} step={0.1} unit="AU" aria="Distance from the Sun" />
        <dl className="kv" aria-label="Sunlight values"><KV k="Sunlight" v={sunlightAt(P.solar.tsi, d)} unit="W/m²" sig={3} /><KV k="Compared with Earth" v={`1/${formatSig(d * d, 3)}`} /></dl>
        <p className="note">NASA Goddard: “{P.solar.quote}” <SourceLinks ids={[P.solar.source]} /> Juno: “{P.solar.juno}” <SourceLinks ids={[P.solar.junoSource]} /></p>
        <LinePlot ariaLabel="Sunlight against distance" width={300} height={180} xLog yLog xLabel="AU" yLabel="W/m²" series={[{ points: solar, color: '#f5c76b', label: '1361/d²' }]} markers={[{ x: d, y: sunlightAt(P.solar.tsi, d), color: ON }]} />
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Power far from the Sun <ProvenanceBadge cls="derived" title="NASA and DOE values; decay curve computed" /></h1>
          <p className="note">NASA: “{P.rtg.quote}” <SourceLinks ids={[P.rtg.source]} /> DOE: “{P.halfLife.quote}” <SourceLinks ids={[P.halfLife.source]} /> (NASA's RPS pages round it to {P.rtg.nasaHalfLife} years.)</p></div>
        <LinePlot ariaLabel="Voyager power against year" width={560} height={240} xLabel="year" yLabel="electrical power (W)" yDomain={[0, 500]} series={[{ points: pts, color: ON, label: `Pu-238 decay alone (T½ ${hl} y)` }]} markers={[{ x: 1977, y: V.launchW, color: '#7df9ff' }, { x: 2023, y: V.w2023, color: '#f5c76b' }]} />
        <dl className="kv" aria-label="Voyager power values" style={{ maxWidth: 560 }}>
          <KV k="At launch (3 × 158 We)" v={V.launchW} unit="W" /><KV k="2023 (NASA)" v={V.w2023} unit="W" />
          <KV k="2023 if only the plutonium decayed" v={decay(V.launchW, 46, hl)} unit="W" sig={3} />
        </dl>
        <p className="note">“{V.quote2023}” “{V.loads}” <SourceLinks ids={[V.source]} /> “{V.rate}” <SourceLinks ids={[V.rateSource]} /></p>
        <p className="note">Finding: decay alone would leave about {formatSig(decay(V.launchW, 46, hl), 3)} W in 2023, more than NASA's 225 W, and 474 → 225 W over 46 years averages {formatSig((V.launchW - V.w2023) / 46, 2)} W a year rather than 4. NASA's pages do not explain the gap.</p>
      </div>
      <Related><button className="chip" onClick={() => navigate('/atomic/nuclei')}>Nuclei and decay →</button><button className="chip" onClick={() => navigate('/engineering/semiconductors')}>Junctions →</button></Related>
    </>
  );
}

function Link() {
  const { query } = useRoute();
  const L = D.link, ex = L.example;
  const dAu = num(query, 'd', 4.55, 0.5, 200), dish = num(query, 'dish', 70, 10, 70), eff = 0.42;
  const lam = 299_792_458 / L.voyager.f, gt = ex.gt;
  const gr = eff * (4 * Math.PI / lam ** 2) * Math.PI * (dish / 2) ** 2;
  const pr = friis(ex.pt, gt, gr, lam, dAu * AU);
  const rhoEx = (ex.pt * ex.gt) / (4 * Math.PI * ex.r ** 2), prEx = rhoEx * ex.eff * ex.area;
  return (
    <>
      <Panel id="l-controls" className="left-panel" title="Voyager's downlink">
        <Slider k="d" label="distance" v={dAu} min={0.5} max={200} step={0.05} unit="AU" aria="Distance" />
        <Slider k="dish" label="dish" v={dish} min={10} max={70} step={1} unit="m" aria="Ground dish diameter" />
        <dl className="kv" aria-label="Link values">
          <KV k="Space loss (λ/4πr)²" v={`${formatSig(toDb((lam / (4 * Math.PI * dAu * AU)) ** 2), 4)} dB`} />
          <KV k="Ground dish gain" v={`${formatSig(toDb(gr), 3)} dBi`} title="η = 0.42, Yuen's 64 m example" />
          <KV k="Received power" v={pr} unit="W" sig={3} />
          <KV k="One-way light time" v={lightTime(dAu * AU) / 3600} unit="h" sig={3} />
        </dl>
        <p className="note">Inputs from Yuen's example (P_T 21.3 W, G_T 6.5 × 10⁴, 8.4 GHz, efficiency 42 %); the ground gain uses his G = η(4π/λ²)A. The spacecraft gain is held fixed. Spacecraft antenna gain: 6.5 × 10⁴ = {formatSig(toDb(6.5e4), 3)} dBi in Yuen; Basics of Space Flight: “{L.bsfGain}” <SourceLinks ids={['nasa-bsf']} /> For Voyager's 3.7 m dish, (πD/λ)² = {formatSig(dishGain(3.7, lam, 1), 3)}, so these gains imply efficiencies of {formatSig(6.5e4 / dishGain(3.7, lam, 1), 2)} and {formatSig(10 ** 4.7 / dishGain(3.7, lam, 1), 2)} (derived).</p>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Talking across the solar system <ProvenanceBadge cls="derived" title="Yuen (1982) link equations evaluated" /></h1>
          <p className="note">Yuen (1982): “{L.quote}” {L.flux}; space loss {L.space}; gain {L.gain}. <SourceLinks ids={[L.source]} /></p></div>
        <dl className="kv" aria-label="Yuen example" style={{ maxWidth: 560 }}>
          <KV k="Voyager at Jupiter: flux ρ" v={rhoEx} unit="W/m²" sig={4} title={`printed ${ex.rho}`} />
          <KV k="Received by a 64 m dish (computed)" v={prEx} unit="W" sig={3} />
          <KV k="Received (printed by Yuen)" v={ex.printedPr} unit="W" sig={3} />
        </dl>
        <p className="note">Finding: Yuen's flux 2.383 × 10⁻¹⁹ W/m² checks, but flux × 0.42 × 3.2 × 10³ m² is {formatSig(prEx, 3)} W, not the printed 3.05 × 10⁻¹⁶ W — about 5 % lower.</p>
        <p className="note">Voyager: “{L.voyager.quote}” <SourceLinks ids={[L.voyager.source]} /> DSN: “{L.dsn.quote}” <SourceLinks ids={[L.dsn.source]} /></p>
        <p className="note">How weak? Two NASA pages: “{L.weak[0].quote}” <SourceLinks ids={[L.weak[0].source]} /> and “{L.weak[1].quote}” (10⁻²² W) <SourceLinks ids={[L.weak[1].source]} /> — a millionfold apart; neither gives the distance it refers to.</p>
      </div>
      <Related><button className="chip" onClick={() => navigate('/spectral/antennas')}>Antennas →</button><button className="chip" onClick={() => navigate('/engineering/information')}>Information and bits →</button><button className="chip" onClick={() => navigate('/engineering/network')}>Shannon capacity →</button></Related>
    </>
  );
}

function Attitude() {
  const { query } = useRoute();
  const a = num(query, 'a', 0.3, 0.05, 1), e = num(query, 'e', 0.8, 0.05, 1), dAu = num(query, 'd', 1, 0.3, 10);
  const T = D.attitude, H = D.thermal, sigma = H.sb.sigma;
  const S = sunlightAt(D.power.solar.tsi, dAu), Tplate = ((a * S) / (e * sigma)) ** 0.25;
  return (
    <>
      <Panel id="a-controls" className="left-panel" title="A sunlit plate">
        <Slider k="a" label="absorptivity" v={a} min={0.05} max={1} step={0.01} unit="" aria="Solar absorptivity" />
        <Slider k="e" label="IR emissivity" v={e} min={0.05} max={1} step={0.01} unit="" aria="Infrared emissivity" />
        <Slider k="d" label="distance" v={dAu} min={0.3} max={10} step={0.1} unit="AU" aria="Plate distance" />
        <dl className="kv" aria-label="Plate values"><KV k="Equilibrium temperature" v={Tplate} unit="K" sig={3} /><KV k="in °C" v={Tplate - 273.15} sig={3} /></dl>
        <p className="note">Illustrative: one face to the Sun, radiating from that face only, nothing else — α S = ε σ T⁴. Combining NASA's balance with the Stefan–Boltzmann law is our step, not a quoted formula.</p>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Pointing and keeping warm <ProvenanceBadge cls="illustrative" title="NASA descriptions; the plate model is illustrative" /></h1>
          <p className="note">Hubble: “{T.wheels}” “{T.newton}” “{T.gyro}” “{T.slow}” <SourceLinks ids={[T.source]} /></p>
          <p className="note">Basics of Space Flight on reaction wheels: “{T.bsf}” <SourceLinks ids={['nasa-bsf']} /></p></div>
        <p className="note">NASA: “{H.quote}” {H.balance}. “{H.radiator}” <SourceLinks ids={[H.source]} /></p>
        <p className="note">Stefan–Boltzmann: “{H.sb.quote}” <SourceLinks ids={[H.sb.source]} /></p>
        <p className="note">Louvers — Basics of Space Flight: “{H.louvers}” <SourceLinks ids={['nasa-bsf']} /> A white radiator (low α, high ε) runs cold; a gold or bare metal surface (low ε) runs hot — try it on the left.</p>
      </div>
      <Related><button className="chip" onClick={() => navigate('/spectral/thermal')}>Thermal radiation →</button><button className="chip" onClick={() => navigate('/engineering/machines?tab=control')}>Feedback control →</button></Related>
    </>
  );
}

function Chain() {
  const { query } = useRoute();
  const step = Math.round(num(query, 'step', 0, 0, D.chain.length - 1));
  const B = D.bottleneck, hours = (B.gb * 8e9) / 1500 / 3600;
  return (
    <>
      <Panel id="c-instruments" className="left-panel" title="Instrument encyclopedia">
        <ul className="life-reports" aria-label="Instruments" style={{ paddingLeft: 16 }}>
          {D.instruments.map((x: { k: string; q: string; s: string; to: string }) => <li key={x.k} style={{ marginBottom: 6 }}><b>{x.k}.</b> “{x.q}” <SourceLinks ids={[x.s]} /> <button className="chip" onClick={() => navigate(x.to)}>→</button></li>)}
        </ul>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>From a photon to a paper <ProvenanceBadge cls="observed" title="Each step quoted from NASA and USGS" /></h1>
          <p className="note">Follow one measurement from the instrument to the archive. Click a step.</p></div>
        <ol aria-label="Signal chain" style={{ display: 'flex', flexWrap: 'wrap', gap: 6, listStyle: 'none', padding: 0 }}>
          {D.chain.map((c: { step: string }, i: number) => <li key={c.step}><button className={`chip ${i === step ? 'active' : ''}`} onClick={() => setQuery({ step: String(i) })}>{i + 1}. {c.step}{i < D.chain.length - 1 ? ' →' : ''}</button></li>)}
        </ol>
        <p className="note" aria-label="Chain step" style={{ fontSize: 15, maxWidth: 620 }}>“{D.chain[step].q}” <SourceLinks ids={[D.chain[step].s]} /></p>
        <p className="note">The bottleneck is the radio link. New Horizons: “{B.q}” <SourceLinks ids={[B.s]} /> At 1.5 kbit/s, 6.25 GB is {formatSig(hours / 24, 3)} days of continuous transmission (derived).</p>
      </div>
      <Related><button className="chip" onClick={() => setQuery({ tab: 'link' })}>The radio link →</button><button className="chip" onClick={() => navigate('/engineering/information')}>Bits and encoding →</button></Related>
    </>
  );
}

const TABS: [string, string][] = [['fleet', 'Spacecraft'], ['rocket', 'Rockets'], ['orbits', 'Orbits'], ['power', 'Power'], ['link', 'Radio'], ['attitude', 'Pointing'], ['chain', 'Data']];
export default function SpaceView() {
  const { query } = useRoute();
  const tab = TABS.find(([t]) => t === query.get('tab'))?.[0] ?? 'fleet';
  return (
    <>
      <nav className="view-switch" aria-label="Space sections">
        {TABS.map(([t, l]) => <button key={t} className={tab === t ? 'active' : ''} onClick={() => setQuery({ tab: t === 'fleet' ? null : t })}>{l}</button>)}
      </nav>
      {tab === 'rocket' ? <Rocket /> : tab === 'orbits' ? <Orbits /> : tab === 'power' ? <Power /> : tab === 'link' ? <Link /> : tab === 'attitude' ? <Attitude /> : tab === 'chain' ? <Chain /> : <Fleet />}
    </>
  );
}
