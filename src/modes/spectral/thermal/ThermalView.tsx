/**
 * Thermal radiation and energy transfer — #/spectral/thermal?tab=blackbody|grey|planets   (Phase 10, Gate 10.5)
 *
 *  blackbody  Planck curves at up to three temperatures: T1, T2, T3 (K)
 *  grey       a grey surface facing black surroundings: e (emissivity), T (K), T0 (K)
 *  planets    radiative equilibrium of the planets: body, A (albedo override), e (emissivity)
 * Physics: src/core/physics/thermal/radiation.ts (Planck 1914; NASA Earth Observatory). Data: NSSDCA fact sheets.
 */
import { setQuery, useRoute } from '@/shared/router';
import { KV, Panel, ProvenanceBadge } from '@/ui/components';
import { SourceLinks } from '@/ui/SourcesView';
import { RelatedLinks } from '@/ui/RelatedLinks';
import { LinePlot } from '@/ui/plots';
import { formatSig } from '@/core/units/units';
import { SIGMA_SB, WIEN_B, WIEN_B_1914, blackFlux, equilibriumTemperature, greyFlux, meanInsolation, netExchange, peakWavelength, planckLambda } from '@/core/physics/thermal/radiation';
import rad from '@datasets/astronomical/planet-radiation.json';
import phys from '@datasets/astronomical/planet-physical.json';

type Tab = 'blackbody' | 'grey' | 'planets';
const TABS: [Tab, string][] = [['blackbody', 'Black bodies'], ['grey', 'Grey bodies'], ['planets', 'Planetary balance']];
const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
const num = (q: URLSearchParams, k: string, d: number, a: number, b: number) => { const v = Number(q.get(k)); return q.has(k) && Number.isFinite(v) ? clamp(v, a, b) : d; };
const PLANCK = ['planck-1914'];
const COLORS = ['#ff7a90', '#f5c76b', '#7df9ff'];
interface Body { id: string; bondAlbedo: number; solarIrradianceWm2: number; blackBodyTemperatureK: number; updated: string | null; url: string }
const BODIES = (rad as unknown as { bodies: Body[] }).bodies;
const meanC = (id: string) => (phys as unknown as Record<string, { meanTemperatureC?: number | null }>)[id]?.meanTemperatureC ?? null;
const name = (id: string) => id[0].toUpperCase() + id.slice(1);
function Slider({ k, label, v, min, max, step, unit, aria }: { k: string; label: string; v: number; min: number; max: number; step: number; unit: string; aria: string }) {
  return <label className="slider-row"><span style={{ minWidth: 78 }}>{label}</span><input type="range" min={min} max={max} step={step} value={v} aria-label={aria} onChange={(e) => setQuery({ [k]: e.target.value })} /><span>{v} {unit}</span></label>;
}

// ------------------------------------------------------------------ black bodies
function BlackbodyTab() {
  const { query } = useRoute();
  const Ts = [num(query, 'T1', 5772, 50, 50000), num(query, 'T2', 3000, 50, 50000), num(query, 'T3', 1000, 50, 50000)];
  const lo = Math.log10(WIEN_B / Math.max(...Ts) / 5), hi = Math.log10(WIEN_B / Math.min(...Ts) * 20);
  const xs = Array.from({ length: 500 }, (_, i) => 10 ** (lo + ((hi - lo) * i) / 499));
  return (
    <>
      <Panel id="th-bb-controls" className="left-panel" title="Temperatures">
        {Ts.map((T, i) => <Slider key={i} k={`T${i + 1}`} label={`T${i + 1}`} v={T} min={50} max={50000} step={1} unit="K" aria={`Temperature ${i + 1}`} />)}
        <button className="chip" onClick={() => setQuery({ T1: '5772', T2: '3000', T3: '1000' })}>Sun, a red dwarf, a hot plate</button>
        <button className="chip" onClick={() => setQuery({ T1: '310', T2: '288', T3: '255' })}>A person, Earth's surface, Earth's balance temperature</button>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Black-body radiation <ProvenanceBadge cls="derived" title="Planck, Theory of Heat Radiation (1914) eqs. 75–76, 109–111, 276; CODATA constants" /></h1>
          <p className="note">Planck's law gives the spectrum of black radiation, E_λ = (c²h/λ⁵)/(e^(ch/kλT) − 1) for each polarisation (Planck eq. 276; the curves show the radiance of unpolarised light, twice this). Two laws follow. The total radiation grows as “the fourth power of the absolute temperature” (Stefan–Boltzmann, eqs. 75–76): a black surface emits σT⁴. And λ_m T = b: “with increasing temperature the maximum of radiation is therefore displaced in the direction of the shorter wave lengths” (Wien, eq. 109), while the maximum itself grows as T⁵ (eq. 111). <SourceLinks ids={[...PLANCK, 'codata-2018']} /></p>
        </div>
        <LinePlot ariaLabel="Planck curves" width={620} height={280} xLog yLog xLabel="wavelength (µm)" yLabel="spectral radiance B_λ (W m⁻² sr⁻¹ m⁻¹)" legend="tr"
          series={Ts.map((T, i) => ({ points: xs.map((x) => [x * 1e6, planckLambda(x, T)] as [number, number]).filter((p) => p[1] > planckLambda(peakWavelength(T), T) * 1e-6), color: COLORS[i], label: `${T} K` }))}
          vLines={Ts.map((T, i) => ({ x: peakWavelength(T) * 1e6, label: '', color: COLORS[i] }))} />
      </div>
      <Panel id="th-bb-readout" className="right-panel" title="Laws">
        <table className="table-mini" aria-label="Black-body values"><thead><tr><th>T (K)</th><th>λ_m (µm)</th><th>σT⁴ (W/m²)</th></tr></thead>
          <tbody>{Ts.map((T, i) => <tr key={i}><td style={{ color: COLORS[i] }}>{T}</td><td>{formatSig(peakWavelength(T) * 1e6, 4)}</td><td>{formatSig(blackFlux(T), 4)}</td></tr>)}</tbody></table>
        <dl className="kv" aria-label="Black-body constants">
          <KV k="σ (CODATA)" v={SIGMA_SB} unit="W m⁻² K⁻⁴" sig={7} />
          <KV k="b (CODATA)" v={WIEN_B * 1e3} unit="mm·K" sig={6} />
          <KV k="b, Lummer & Pringsheim, quoted by Planck" v={WIEN_B_1914 * 1e3} unit="mm·K" sig={3} title="0.294 cm·degree (Planck eq. 110)" />
        </dl>
        <RelatedLinks id="instrument:thermal-radiation" />
      </Panel>
    </>
  );
}

// ------------------------------------------------------------------ grey bodies
function GreyTab() {
  const { query } = useRoute();
  const e = num(query, 'e', 0.9, 0, 1), T = num(query, 'T', 350, 3, 3000), T0 = num(query, 'T0', 293, 3, 3000);
  const q = netExchange(e, T, T0);
  const Tsweep = Array.from({ length: 200 }, (_, i) => 3 + (i / 199) * Math.max(T, T0) * 1.5);
  return (
    <>
      <Panel id="th-grey-controls" className="left-panel" title="Surface">
        <Slider k="e" label="emissivity ε" v={e} min={0} max={1} step={0.01} unit="" aria="Emissivity" />
        <Slider k="T" label="surface T" v={T} min={3} max={3000} step={1} unit="K" aria="Surface temperature" />
        <Slider k="T0" label="surroundings T₀" v={T0} min={3} max={3000} step={1} unit="K" aria="Surroundings temperature" />
        <p className="note" style={{ fontSize: 10.5 }}>The emissivity is your choice: no measured emissivities are bundled.</p>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Grey bodies and radiative exchange <ProvenanceBadge cls="derived" title="Kirchhoff's law (Planck §§44–45, eq. 48) with Stefan–Boltzmann" /></h1>
          <p className="note">Kirchhoff's law: “the ratio of the emissive power to the absorbing power of any body is independent of the nature of the body”, and for a black body, which absorbs all incident radiation, the absorbing power is 1 (Planck §§44–45). So a surface that absorbs a fraction ε of the radiation falling on it emits ε times the black-body radiation at its temperature, εσT⁴ (a grey body, ε the same at all wavelengths). Facing black surroundings at T₀ it also absorbs εσT₀⁴, so its net loss is εσ(T⁴ − T₀⁴), and it vanishes when the temperatures are equal. <SourceLinks ids={PLANCK} /></p>
        </div>
        <LinePlot ariaLabel="Net radiative loss" width={600} height={240} xLabel="surface temperature T (K)" yLabel="net loss εσ(T⁴ − T₀⁴) (W/m²)" series={[{ points: Tsweep.map((t) => [t, netExchange(e, t, T0)] as [number, number]), color: '#f5c76b' }]} vLines={[{ x: T0, label: 'T = T₀', color: '#7df9ff' }, { x: T, label: 'T', color: '#888' }]} hLines={[{ y: 0, label: '', color: '#555' }]} />
      </div>
      <Panel id="th-grey-readout" className="right-panel" title="Fluxes">
        <dl className="kv" aria-label="Grey-body result">
          <KV k="emitted εσT⁴" v={greyFlux(e, T)} unit="W/m²" sig={4} />
          <KV k="absorbed from surroundings εσT₀⁴" v={greyFlux(e, T0)} unit="W/m²" sig={4} />
          <KV k="net loss" v={q} unit="W/m²" sig={4} />
          <KV k="black body at T (ε = 1)" v={blackFlux(T)} unit="W/m²" sig={4} />
        </dl>
        <RelatedLinks id="instrument:thermal-radiation" />
      </Panel>
    </>
  );
}

// ------------------------------------------------------------------ planets
function PlanetsTab() {
  const { query } = useRoute();
  const b = BODIES.find((x) => x.id === query.get('body')) ?? BODIES.find((x) => x.id === 'earth')!;
  const A = num(query, 'A', b.bondAlbedo, 0, 0.99), e = num(query, 'e', 1, 0.1, 1);
  const T = equilibriumTemperature(b.solarIrradianceWm2, A, e), Tlisted = equilibriumTemperature(b.solarIrradianceWm2, b.bondAlbedo);
  const surf = meanC(b.id);
  const rows = BODIES.map((x) => ({ ...x, T: equilibriumTemperature(x.solarIrradianceWm2, x.bondAlbedo), surf: meanC(x.id) }));
  const ins = meanInsolation(b.solarIrradianceWm2);
  return (
    <>
      <Panel id="th-pl-controls" className="left-panel" title="Body">
        <select className="text-input" aria-label="Body" value={b.id} onChange={(ev) => setQuery({ body: ev.target.value, A: null })} style={{ width: '100%' }}>{BODIES.map((x) => <option key={x.id} value={x.id}>{name(x.id)}</option>)}</select>
        <Slider k="A" label="Bond albedo" v={Number(A.toFixed(3))} min={0} max={0.99} step={0.001} unit="" aria="Bond albedo" />
        <Slider k="e" label="emissivity" v={e} min={0.1} max={1} step={0.01} unit="" aria="Emissivity" />
        <button className="chip" onClick={() => setQuery({ A: null, e: null })}>Use the fact-sheet albedo, ε = 1</button>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Planetary radiative balance <ProvenanceBadge cls="derived" title="Stefan–Boltzmann (Planck eq. 76) with the NASA energy budget's one-fourth rule; NSSDCA data" /></h1>
          <p className="note">“Averaged over the entire planet, the amount of sunlight arriving at the top of Earth's atmosphere is only one-fourth of the total solar irradiance, or approximately 340 watts per square meter”; about 29 % is reflected and Earth absorbs about 240 W/m² (NASA Earth Observatory). A body in balance radiates what it absorbs: S(1 − A)/4 = εσT⁴, so T = [S(1 − A)/(4εσ)]^¼. The fact sheets list each body's irradiance, Bond albedo and black-body temperature. The balance model has no atmosphere and no internal heat, so it is not the same thing as a body's mean temperature, which the table lists for comparison. <SourceLinks ids={['nasa-earth-energy-budget', 'nssdc-factsheet', ...PLANCK]} /></p>
        </div>
        <table className="table-mini" aria-label="Planet temperatures" style={{ maxWidth: 680 }}>
          <thead><tr><th>body</th><th>S (W/m²)</th><th>A</th><th>T balance (K)</th><th>T_bb fact sheet (K)</th><th>mean temperature (K)</th></tr></thead>
          <tbody>{rows.map((r) => <tr key={r.id} className={r.id === b.id ? 'sel' : ''} style={{ cursor: 'pointer' }} onClick={() => setQuery({ body: r.id, A: null })}><td style={{ fontFamily: 'var(--font)' }}>{name(r.id)}</td><td>{formatSig(r.solarIrradianceWm2, 5)}</td><td>{r.bondAlbedo}</td><td>{r.T.toFixed(1)}</td><td>{r.blackBodyTemperatureK}</td><td>{r.surf !== null ? (r.surf + 273.15).toFixed(0) : <span className="unknown">unknown</span>}</td></tr>)}</tbody>
        </table>
        <p className="note" style={{ fontSize: 10.5 }}>The balance temperature reproduces the fact-sheet value within 0.1 K except for Earth (255.1 against 254.0 K: the printed value matches an albedo of 0.306) and Pluto (32.2 against 37.5 K: the printed value matches an albedo of 0.486). Mean temperatures: the NSSDCA planetary fact-sheet table, as bundled in the solar-system data.</p>
      </div>
      <Panel id="th-pl-readout" className="right-panel" title="Balance">
        <dl className="kv" aria-label="Balance result">
          <KV k="solar irradiance S" v={b.solarIrradianceWm2} unit="W/m²" sig={6} />
          <KV k="planet-averaged S/4" v={ins} unit="W/m²" sig={5} />
          <KV k="reflected" v={ins * A} unit="W/m²" sig={4} />
          <KV k="absorbed" v={ins * (1 - A)} unit="W/m²" sig={4} />
          <KV k="balance temperature" v={T} unit="K" sig={4} />
          <KV k="with the fact-sheet albedo and ε = 1" v={Tlisted} unit="K" sig={4} />
          <KV k="fact-sheet black-body temperature" v={b.blackBodyTemperatureK} unit="K" sig={4} />
          <KV k="mean temperature (fact-sheet table)" v={surf !== null ? surf + 273.15 : null} unit="K" sig={3} />
        </dl>
        <p className="note" style={{ fontSize: 10.5 }}>Fact sheet updated {b.updated ?? 'unknown'}. <SourceLinks ids={['nssdc-factsheet']} /></p>
        <RelatedLinks id="instrument:thermal-radiation" />
      </Panel>
    </>
  );
}

export default function ThermalView() {
  const { query } = useRoute();
  const tab: Tab = TABS.find(([t]) => t === query.get('tab'))?.[0] ?? 'blackbody';
  return (
    <>
      <nav className="view-switch" aria-label="Thermal radiation sections">
        {TABS.map(([t, label]) => <button key={t} className={tab === t ? 'active' : ''} onClick={() => setQuery({ tab: t === 'blackbody' ? null : t })}>{label}</button>)}
      </nav>
      {tab === 'grey' ? <GreyTab /> : tab === 'planets' ? <PlanetsTab /> : <BlackbodyTab />}
    </>
  );
}
