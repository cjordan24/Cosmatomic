/**
 * Atmospheric radiation and remote sensing — #/spectral/atmosphere?tab=sky|extinction|landsat   (Phase 10, Gate 10.7)
 *
 *  sky         Rayleigh scattering ∝ λ⁻⁴ applied to sunlight (5772 K model): wl (nm)
 *  extinction  Rayleigh's 1899 molecular extinction and Bouguer's law: z (°, zenith angle), nsrc (maxwell | loschmidt)
 *  landsat     Landsat 8–9 bands over reflected sunlight and the thermal emission of the surface: Ts (K)
 * Physics: src/core/physics/atmosphere/radiation.ts (Rayleigh 1871, 1899; NASA TM-82021; NASA AERONET; USGS).
 */
import { setQuery, useRoute } from '@/shared/router';
import { KV, Panel, ProvenanceBadge } from '@/ui/components';
import { SourceLinks } from '@/ui/SourcesView';
import { RelatedLinks } from '@/ui/RelatedLinks';
import { LinePlot } from '@/ui/plots';
import { wavelengthToColor } from '@/modes/atomic/atoms/spectrum';
import { planckLambda, peakWavelength } from '@/core/physics/thermal/radiation';
import { LANDSAT_89, RAYLEIGH_1899, airMass, loschmidt, molecularDepth, rayleighExtinction, rayleighRelative } from '@/core/physics/atmosphere/radiation';

type Tab = 'sky' | 'extinction' | 'landsat';
const TABS: [Tab, string][] = [['sky', 'Blue sky'], ['extinction', 'Extinction and air mass'], ['landsat', 'Landsat bands']];
const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
const num = (q: URLSearchParams, k: string, d: number, a: number, b: number) => { const v = Number(q.get(k)); return q.has(k) && Number.isFinite(v) ? clamp(v, a, b) : d; };
const R71 = ['rayleigh-scientific-papers-1'], R99 = ['rayleigh-scientific-papers-4'], TM = ['nasa-tm-82021', 'nasa-aeronet-aod'];
const deg = Math.PI / 180;
const VIS = Array.from({ length: 75 }, (_, i) => 380 + i * 5);
function Slider({ k, label, v, min, max, step, unit, aria }: { k: string; label: string; v: number; min: number; max: number; step: number; unit: string; aria: string }) {
  return <label className="slider-row"><span style={{ minWidth: 78 }}>{label}</span><input type="range" min={min} max={max} step={step} value={v} aria-label={aria} onChange={(e) => setQuery({ [k]: e.target.value })} /><span>{v} {unit}</span></label>;
}
const norm = (pts: [number, number][]) => { const m = Math.max(...pts.map((p) => p[1])); return pts.map(([x, y]) => [x, y / m] as [number, number]); };

// ------------------------------------------------------------------ blue sky
function SkyTab() {
  const { query } = useRoute();
  const wl = num(query, 'wl', 450, 380, 750);
  const sun = norm(VIS.map((l) => [l, planckLambda(l * 1e-9, 5772)]));
  const scattered = norm(VIS.map((l) => [l, planckLambda(l * 1e-9, 5772) * rayleighRelative(l * 1e-9)]));
  const peakSc = scattered.reduce((b, p) => (p[1] > b[1] ? p : b))[0];
  return (
    <>
      <Panel id="at-sky-controls" className="left-panel" title="Wavelength">
        <Slider k="wl" label="wavelength" v={wl} min={380} max={750} step={1} unit="nm" aria="Wavelength" />
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Why the sky is blue <ProvenanceBadge cls="derived" title="Rayleigh (1871), Scientific Papers I, Art. 8, p. 91; Sun as a 5772 K black body" /></h1>
          <p className="note">“When light is scattered by particles which are very small compared with any of the wave-lengths, the ratio of the amplitudes of the vibrations of the scattered and incident light varies inversely as the square of the wave-length, and the intensity of the lights themselves as the inverse fourth power” (Rayleigh 1871). Applied to sunlight, modelled here as a 5772 K black body, the scattered light is shifted strongly towards the blue; in 1899 Rayleigh concluded that “the light scattered from the molecules would suffice to give us a blue sky”. <SourceLinks ids={[...R71, ...R99, 'iau-2015-b3']} /></p>
        </div>
        <LinePlot ariaLabel="Sunlight and scattered light" width={600} height={240} xLabel="wavelength (nm)" yLabel="relative intensity" yDomain={[0, 1.05]} legend="tr"
          series={[{ points: sun, color: '#f5c76b', label: 'sunlight (5772 K model)' }, { points: scattered, color: '#7db8ff', label: 'scattered: sunlight × λ⁻⁴' }]} vLines={[{ x: wl, label: '', color: wavelengthToColor(wl) }]} />
        <div style={{ display: 'flex', height: 18, maxWidth: 600, borderRadius: 4, overflow: 'hidden', border: '1px solid var(--line)' }} aria-label="Scattered light by wavelength" role="img">
          {scattered.map(([l, v]) => <div key={l} style={{ flex: 1, background: wavelengthToColor(l), opacity: v }} />)}
        </div>
        <p className="note" style={{ fontSize: 10.5 }}>The strip shows each wavelength with the brightness of the scattered light (a display aid, not a perceived colour).</p>
      </div>
      <Panel id="at-sky-readout" className="right-panel" title="Scattering">
        <dl className="kv" aria-label="Scattering result">
          <KV k="scattering at λ relative to 550 nm" v={rayleighRelative(wl * 1e-9)} sig={4} />
          <KV k="blue 450 nm against red 650 nm" v={rayleighRelative(450e-9) / rayleighRelative(650e-9)} sig={4} />
          <KV k="peak of the scattered spectrum" v={peakSc} unit="nm" sig={3} title="Within 380–750 nm; the model's increase continues into the ultraviolet" />
          <KV k="peak of the sunlight model" v={peakWavelength(5772) * 1e9} unit="nm" sig={4} />
        </dl>
        <RelatedLinks id="instrument:atmosphere" />
      </Panel>
    </>
  );
}

// ------------------------------------------------------------------ extinction
function ExtinctionTab() {
  const { query } = useRoute();
  const z = num(query, 'z', 0, 0, 85), modern = query.get('nsrc') !== 'maxwell';
  const n = modern ? loschmidt() : RAYLEIGH_1899.nMaxwell;
  const m = airMass(z * deg)!;
  const T = (l: number) => Math.exp(-molecularDepth(l * 1e-9, n) * m);
  const trans = VIS.map((l) => [l, T(l)] as [number, number]);
  const sunTop = norm(VIS.map((l) => [l, planckLambda(l * 1e-9, 5772)]));
  const sunGround = sunTop.map(([l, v]) => [l, v * T(l)] as [number, number]);
  const x600 = 1 / rayleighExtinction(6e-7, RAYLEIGH_1899.muMinus1, n);
  return (
    <>
      <Panel id="at-ext-controls" className="left-panel" title="Path">
        <Slider k="z" label="zenith angle z" v={z} min={0} max={85} step={1} unit="°" aria="Zenith angle" />
        <div className="section-title">Molecules per volume n</div>
        <select className="text-input" aria-label="Number density" value={modern ? 'loschmidt' : 'maxwell'} onChange={(e) => setQuery({ nsrc: e.target.value === 'maxwell' ? 'maxwell' : null })} style={{ width: '100%' }}>
          <option value="loschmidt">today: p/kT at 0 °C and 1 atm (CODATA k)</option><option value="maxwell">Maxwell's estimate used by Rayleigh: 19 × 10¹⁸ cm⁻³</option>
        </select>
        <p className="note" style={{ fontSize: 10.5 }}>{z >= 62 ? 'Beyond 62° the secant law is “not strictly true” (TM-82021): refraction and the curvature of the atmosphere matter.' : 'Air mass m = sec z.'}</p>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Extinction by air: Rayleigh's 1899 calculation <ProvenanceBadge cls="derived" title="Rayleigh (1899) eqs. 4, 14, 23, pp. 399–403; NASA TM-82021 §II.A" /></h1>
          <p className="note">A beam crossing a gas of n molecules per unit volume loses energy as E = E₀e^(−hx) with h = 32π³(μ − 1)²/(3nλ⁴) (Rayleigh 1899, eqs. 4, 14). With λ = 6 × 10⁻⁵ cm, μ − 1 = ·0003 and Maxwell's n = 19 × 10¹⁸ per cubic centimetre he found 83 km “as the distance through which light must pass in air at atmospheric pressure before its intensity is reduced in the ratio of 2·7 : 1”. The whole atmosphere above us corresponds to 8·3 km of air at standard pressure, through which Bouguer estimated a transmission of about ·8 for a star at the zenith; Rayleigh found “the actual transmission through 83 kilometres is only about 3 times less than that calculated … from molecular diffraction without any allowance for foreign matter at all”. Away from the zenith the path grows as the air mass m = sec z, and the transmission is e^(−τm) (Bouguer's law, NASA TM-82021; NASA AERONET). <SourceLinks ids={[...R99, ...TM, 'codata-2018']} /></p>
        </div>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 300px', maxWidth: 360 }}><LinePlot ariaLabel="Transmission" width={340} height={220} xLabel="wavelength (nm)" yLabel="transmitted fraction" yDomain={[0, 1]} series={[{ points: trans, color: '#7df9ff' }]} hLines={[{ y: 0.8, label: 'Bouguer ·8 (zenith)', color: '#f5c76b' }]} /></div>
          <div style={{ flex: '1 1 300px', maxWidth: 360 }}><LinePlot ariaLabel="Sunlight above and below the atmosphere" width={340} height={220} xLabel="wavelength (nm)" yLabel="relative" yDomain={[0, 1.05]} legend="br" series={[{ points: sunTop, color: '#f5c76b', label: 'top of atmosphere' }, { points: sunGround, color: '#ff9a5c', label: 'after the path' }]} /></div>
        </div>
      </div>
      <Panel id="at-ext-readout" className="right-panel" title="Transmission">
        <dl className="kv" aria-label="Extinction result">
          <KV k="n" v={n} unit="m⁻³" sig={4} />
          <KV k="attenuation length at 600 nm" v={x600 / 1e3} unit="km" sig={4} title="Rayleigh: 83 km with Maxwell's n" />
          <KV k="air mass m = sec z" v={m} sig={4} />
          <KV k="transmission at 450 nm" v={T(450)} sig={4} />
          <KV k="transmission at 600 nm" v={T(600)} sig={4} />
          <KV k="transmission at 700 nm" v={T(700)} sig={4} />
        </dl>
        <p className="note" style={{ fontSize: 10.5 }}>Molecular scattering only: no dust, aerosols, ozone or water vapour, so these transmissions are upper limits.</p>
        <RelatedLinks id="instrument:atmosphere" />
      </Panel>
    </>
  );
}

// ------------------------------------------------------------------ Landsat
function LandsatTab() {
  const { query } = useRoute();
  const Ts = num(query, 'Ts', 288, 200, 350);
  const lams = Array.from({ length: 300 }, (_, i) => 10 ** (Math.log10(0.3) + ((Math.log10(15) - Math.log10(0.3)) * i) / 299));
  const sun = norm(lams.map((l) => [l, planckLambda(l * 1e-6, 5772)]));
  const earth = norm(lams.map((l) => [l, planckLambda(l * 1e-6, Ts)]));
  return (
    <>
      <Panel id="at-ls-controls" className="left-panel" title="Surface">
        <Slider k="Ts" label="surface T" v={Ts} min={200} max={350} step={1} unit="K" aria="Surface temperature" />
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Remote sensing: the Landsat 8–9 bands <ProvenanceBadge cls="observed" title="USGS band designations" /></h1>
          <p className="note">The Operational Land Imager (OLI) and Thermal Infrared Sensor (TIRS) “images consist of nine spectral bands, and two thermal bands” (USGS). The OLI bands sample reflected sunlight; the two TIRS bands near 11 and 12 µm lie where a surface near room temperature radiates most, by Wien's law λ_m T = b (Planck 1914). Both curves are black-body models normalised to their peaks. <SourceLinks ids={['usgs-landsat-bands', 'planck-1914']} /></p>
        </div>
        <LinePlot ariaLabel="Landsat bands" width={620} height={240} xLog xLabel="wavelength (µm)" yLabel="relative (each curve to its peak)" yDomain={[0, 1.05]} legend="tr"
          series={[{ points: sun, color: '#f5c76b', label: 'sunlight (5772 K)' }, { points: earth, color: '#ff7a90', label: `surface at ${Ts} K` }, ...LANDSAT_89.filter((b) => b.band !== 8).map((b) => ({ points: [[b.lo, 0], [b.lo, 1], [b.hi, 1], [b.hi, 0]] as [number, number][], color: b.sensor === 'TIRS' ? '#ff7a90' : '#7df9ff' }))]} />
        <table className="table-mini" aria-label="Landsat bands table" style={{ maxWidth: 620 }}>
          <thead><tr><th>band</th><th>name</th><th>wavelength (µm)</th><th>resolution (m)</th></tr></thead>
          <tbody>{LANDSAT_89.map((b) => <tr key={b.band}><td>{b.band}</td><td style={{ fontFamily: 'var(--font)' }}>{b.name}</td><td>{b.lo.toFixed(2)} – {b.hi.toFixed(2)}</td><td>{b.res}</td></tr>)}</tbody>
        </table>
        <p className="note" style={{ fontSize: 10.5 }}>As printed by USGS; the thermal bands are acquired at 100 m and resampled to 30 m for Level-1 products. Band 8 (panchromatic, 0.50–0.68 µm) is not drawn.</p>
      </div>
      <Panel id="at-ls-readout" className="right-panel" title="Thermal">
        <dl className="kv" aria-label="Landsat result">
          <KV k="Wien peak of the surface" v={peakWavelength(Ts) * 1e6} unit="µm" sig={4} />
          <KV k="Wien peak of the Sun model" v={peakWavelength(5772) * 1e6} unit="µm" sig={4} />
          <KV k="TIRS bands" v="10.6–11.19 and 11.50–12.51" unit="µm" />
        </dl>
        <RelatedLinks id="instrument:atmosphere" />
      </Panel>
    </>
  );
}

export default function AtmosphereView() {
  const { query } = useRoute();
  const tab: Tab = TABS.find(([t]) => t === query.get('tab'))?.[0] ?? 'sky';
  return (
    <>
      <nav className="view-switch" aria-label="Atmosphere sections">
        {TABS.map(([t, label]) => <button key={t} className={tab === t ? 'active' : ''} onClick={() => setQuery({ tab: t === 'sky' ? null : t })}>{label}</button>)}
      </nav>
      {tab === 'extinction' ? <ExtinctionTab /> : tab === 'landsat' ? <LandsatTab /> : <SkyTab />}
    </>
  );
}
