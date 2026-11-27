/**
 * Relativity foundations — #/cosmic/relativity?tab=radii|orbits|light|tests&m=<preset>&logm=&r=&L=&b=
 * Schwarzschild exterior quantities (horizon, photon sphere, ISCO, clocks, redshift), effective
 * potentials, numerically integrated light paths and weak-field checks. Gate 6.1.
 */
import { useMemo } from 'react';
import { setQuery, useRoute } from '@/shared/router';
import { CONSTANTS, SOLAR_MASS_KG } from '@/core/constants/constants';
import { PHYSICS_MODULES } from '@/core/physics/modules';
import {
  circularOrbit, compactness, criticalImpactParameter, fieldRegime, iscoRadius, lorentzFactor, perihelionAdvancePerOrbit, photonPath,
  photonSphereRadius, redshiftToInfinity, schwarzschildRadius, staticTimeRate, weakDeflection, type FieldRegime,
} from '@/core/physics/relativity';
import { KV, Panel, ProvenanceBadge } from '@/ui/components';
import { LinePlot } from '@/ui/plots';
import { SourceLinks } from '@/ui/SourcesView';
import planetElements from '@datasets/astronomical/planet-elements.json';
import { MASS_PRESETS, type MassPreset } from './presets';

type Tab = 'radii' | 'orbits' | 'light' | 'tests';
const TABS: [Tab, string][] = [['radii', 'Radii & clocks'], ['orbits', 'Orbits'], ['light', 'Light paths'], ['tests', 'Weak-field tests']];
const ARCSEC = Math.PI / 180 / 3600;
const C = CONSTANTS.c.value;
const REGIME_TEXT: Record<FieldRegime, string> = {
  'inside-horizon': 'inside the horizon: no static observers; values refused',
  strong: 'strong field (r_s/r > 0.1): Newtonian gravity is invalid here',
  moderate: 'moderate field (10⁻⁴ < r_s/r ≤ 0.1): relativistic corrections matter',
  weak: 'weak field (r_s/r ≤ 10⁻⁴): Newtonian gravity is an excellent approximation',
};

/** Format a length given in metres with a sensible unit. */
export function fmtLength(m: number): string {
  const a = Math.abs(m);
  if (a >= 0.1 * 9.4607e15) return `${(m / 9.4607304725808e15).toPrecision(4)} ly`;
  if (a >= 1e9) return `${(m / CONSTANTS.au.value).toPrecision(4)} au`;
  if (a >= 1e3) return `${(m / 1e3).toPrecision(4)} km`;
  if (a >= 1) return `${m.toPrecision(4)} m`;
  return `${(m * 1e3).toPrecision(4)} mm`;
}

function useParams() {
  const { query } = useRoute();
  const tab = (TABS.find(([t]) => t === query.get('tab'))?.[0] ?? 'radii') as Tab;
  const preset = MASS_PRESETS.find((p) => p.id === query.get('m')) ?? MASS_PRESETS[0];
  const logm = Number(query.get('logm') ?? 1);
  const gm = preset.id === 'custom' ? 10 ** Math.min(10.5, Math.max(-7, logm)) * CONSTANTS.GMsun.value : preset.gm;
  const rRel = Math.max(1.01, Math.min(1e6, Number(query.get('r') ?? 4)));
  const L = Math.max(0, Math.min(8, Number(query.get('L') ?? 4)));
  const b = Math.max(0.2, Math.min(30, Number(query.get('b') ?? 3)));
  return { tab, preset, logm, gm, rRel, L, b };
}

/** To-scale cross-section: horizon, photon sphere, ISCO, probe radius and (if in range) the body's surface. */
function RadiiSchematic({ gm, rRel, preset }: { gm: number; rRel: number; preset: MassPreset }) {
  const rs = schwarzschildRadius(gm);
  const surf = preset.surfaceRadius ? preset.surfaceRadius / rs : null;
  const extent = Math.max(4, Math.min(rRel * 1.15, 30));
  const S = 150 / extent; // px per r_s
  const ring = (r: number, color: string, dash?: string, fill = 'none') => r * S <= 160 ? <circle cx={170} cy={170} r={r * S} fill={fill} stroke={color} strokeDasharray={dash} strokeWidth={1.5} /> : null;
  return (
    <svg viewBox="0 0 340 340" width={340} height={340} role="img" aria-label="Characteristic radii to scale" className="plot" style={{ maxWidth: '100%', height: 'auto' }}>
      <rect x={0} y={0} width={340} height={340} fill="rgba(255,255,255,0.02)" stroke="var(--line)" />
      {surf !== null && surf * S > 160 && <text x={8} y={16} style={{ fill: '#f5c76b' }}>surface at {surf.toExponential(2)} r_s (off scale): no horizon exists</text>}
      {surf !== null && surf * S <= 160 && ring(surf, '#f5c76b', undefined, 'rgba(245,199,107,0.08)')}
      {surf === null && ring(1, '#000', undefined, '#000')}
      {ring(1, '#ff7a90', surf !== null ? '3 3' : undefined)}
      {ring(1.5, '#7df9ff', '5 4')}
      {ring(3, '#b18cff', '5 4')}
      {ring(rRel, '#5cf2a6', '2 3')}
      <g style={{ fontSize: 10 }}>
        <text x={8} y={300} style={{ fill: '#ff7a90' }}>— r_s{surf !== null ? ' (inside the body: not a horizon)' : ' event horizon'}</text>
        <text x={8} y={312} style={{ fill: '#7df9ff' }}>- - photon sphere 1.5 r_s</text>
        <text x={8} y={324} style={{ fill: '#b18cff' }}>- - ISCO 3 r_s</text>
        <text x={8} y={336} style={{ fill: '#5cf2a6' }}>··· probe radius {rRel.toPrecision(3)} r_s</text>
        <text x={332} y={336} textAnchor="end" style={{ fill: 'var(--text-dim)' }}>{(extent * 2).toPrecision(2)} r_s across</text>
      </g>
    </svg>
  );
}

function RadiiTab({ gm, rRel }: { gm: number; rRel: number }) {
  const xs = Array.from({ length: 240 }, (_, i) => 10 ** (Math.log10(1.0005) + (i / 239) * (Math.log10(100) - Math.log10(1.0005))));
  const rs = schwarzschildRadius(gm);
  const stat = xs.map((x) => [x, staticTimeRate(gm, x * rs) ?? NaN] as [number, number]);
  const orb = xs.filter((x) => x > 1.5).map((x) => [x, circularOrbit(gm, x * rs)?.dTauDt ?? NaN] as [number, number]);
  const z = xs.map((x) => [x, redshiftToInfinity(gm, x * rs) ?? NaN] as [number, number]);
  const probe = staticTimeRate(gm, rRel * rs);
  return (
    <>
      <LinePlot ariaLabel="Clock rates near a non-rotating mass" width={620} height={250} xLog xDomain={[1, 100]} yDomain={[0, 1.02]}
        xLabel="radius r / r_s (log scale)" yLabel="clock rate dτ/dt (vs. far away)" legend="br"
        series={[{ points: stat, color: '#7df9ff', label: 'static clock √(1 − r_s/r)' }, { points: orb, color: '#b18cff', label: 'clock on a circular orbit √(1 − 1.5 r_s/r)', dashed: true }]}
        vLines={[{ x: 1.5, label: 'photon sphere', color: '#7df9ff' }, { x: 3, label: 'ISCO', color: '#b18cff' }]}
        markers={probe !== null ? [{ x: rRel, y: probe, label: `${probe.toFixed(4)}`, color: '#5cf2a6' }] : []} />
      <LinePlot ariaLabel="Gravitational redshift to infinity" width={620} height={220} xLog yLog xDomain={[1, 100]} yDomain={[1e-3, 50]}
        xLabel="radius of emission r / r_s (log scale)" yLabel="redshift z (log scale)" legend="tr"
        series={[{ points: z, color: '#ff7a90', label: '1 + z = (1 − r_s/r)^−½' }, { points: xs.map((x) => [x, 1 / (2 * x)] as [number, number]), color: '#f5c76b', dashed: true, label: 'weak-field approximation GM/(rc²)' }]}
        vLines={[{ x: 1.5, label: '1.5', color: '#7df9ff' }, { x: 3, label: '3', color: '#b18cff' }]} />
      <p className="note" style={{ fontSize: 10.5 }}>All curves are universal in units of r_s: a 10 M☉ hole and the Sun’s mass give the same shapes. The weak-field line departs from the exact curve as r approaches r_s. Formulas: <SourceLinks ids={['carroll-1997']} /> (static clocks 7.58, frequency shift 7.61–7.62). The orbit clock rate √(1 − 3GM/rc²) follows from the conserved energy of a circular geodesic (same chapter, 7.43–7.48).</p>
    </>
  );
}

function OrbitsTab({ L }: { L: number }) {
  // geometric units: r in GM/c², L̃ in GM/c
  const xs = Array.from({ length: 400 }, (_, i) => 2.05 + i * 0.12);
  const Vgr = (r: number) => -1 / r + (L * L) / (2 * r * r) - (L * L) / (r * r * r);
  const Vn = (r: number) => -1 / r + (L * L) / (2 * r * r);
  const disc = L * L - 12;
  const circ = disc >= 0 ? [(L * L - L * Math.sqrt(disc)) / 2, (L * L + L * Math.sqrt(disc)) / 2] : [];
  const photon = xs.map((r) => [r, (1 - 2 / r) / (2 * r * r)] as [number, number]);
  return (
    <>
      <LinePlot ariaLabel="Effective potential for a massive particle" width={620} height={270} xDomain={[2, 50]} yDomain={[-0.08, 0.06]}
        xLabel="radius r (units of GM/c²)" yLabel="V(r) − ½ (units of c²)" legend="br"
        series={[{ points: xs.map((r) => [r, Vgr(r)]), color: '#b18cff', label: `general relativity, L̃ = ${L.toFixed(2)} GM/c` }, { points: xs.map((r) => [r, Vn(r)]), color: '#f5c76b', dashed: true, label: 'Newtonian (no r⁻³ term)' }]}
        vLines={[{ x: 6, label: 'ISCO 6', color: '#b18cff' }, { x: 3, label: '3', color: '#7df9ff' }]}
        markers={circ.map((r, i) => ({ x: r, y: Vgr(r), label: i === 0 ? 'unstable' : 'stable', color: i === 0 ? '#ff7a90' : '#5cf2a6' }))} />
      <p className="note">{disc < 0 ? `With L̃ = ${L.toFixed(2)} GM/c < √12 ≈ 3.46 there is no circular orbit at all: every particle that falls in reaches the horizon. In Newtonian gravity the centrifugal barrier would always stop it.` : `Circular orbits at r = ${circ[0].toFixed(2)} GM/c² (unstable, potential maximum) and ${circ[1].toFixed(2)} GM/c² (stable, minimum). They merge at the ISCO, r = 6GM/c², when L̃ = √12 GM/c.`}</p>
      <LinePlot ariaLabel="Effective potential for light" width={620} height={200} xDomain={[2, 20]} yDomain={[0, 0.022]}
        xLabel="radius r (units of GM/c²)" yLabel="V(r)/L̃² for photons" legend="tr"
        series={[{ points: photon.filter(([r]) => r <= 20), color: '#7df9ff', label: '(1 − 2GM/rc²)/(2r²)' }]}
        hLines={[{ y: 1 / 54, label: 'peak 1/54 at r = 3GM/c²', color: '#7df9ff' }]} vLines={[{ x: 3, label: 'photon sphere', color: '#7df9ff' }]} />
      <p className="note" style={{ fontSize: 10.5 }}>Effective potential V(r) = ε/2 − εGM/r + L̃²/2r² − GML̃²/r³ (ε = 1 for matter, 0 for light), in geometric units, from <SourceLinks ids={['carroll-1997']} /> eq. 7.48. The last term is what general relativity adds; it pulls the potential down near the mass, so the centrifugal barrier has a top and orbits inside 6GM/c² are unstable (7.55). Light has a single unstable orbit at 3GM/c² (7.51).</p>
    </>
  );
}

function LightTab({ b }: { b: number }) {
  const bc = (3 * Math.sqrt(3)) / 2;
  const fan = [1.5, 2.2, bc * 0.999, bc * 1.002, 3.2, 4.5, 7, 11];
  const paths = useMemo(() => fan.map((bb) => ({ b: bb, p: photonPath(bb) })), []); // eslint-disable-line react-hooks/exhaustive-deps
  const sel = useMemo(() => photonPath(b), [b]);
  const E = 14, S = 300 / (2 * E);
  const tx = (x: number) => 320 + x * S, ty = (y: number) => 320 - y * S;
  const pathD = (pts: [number, number][]) => pts.filter(([x, y]) => Math.abs(x) < 400 && Math.abs(y) < 400).map(([x, y], i) => `${i ? 'L' : 'M'}${tx(x).toFixed(1)},${ty(y).toFixed(1)}`).join('');
  return (
    <>
      <svg viewBox="20 20 600 600" width={560} height={560} role="img" aria-label="Light paths around a non-rotating black hole" className="plot" style={{ maxWidth: '100%', height: 'auto' }}>
        <defs><clipPath id="lp-clip"><rect x={20} y={20} width={600} height={600} /></clipPath></defs>
        <rect x={20} y={20} width={600} height={600} fill="rgba(255,255,255,0.02)" stroke="var(--line)" />
        <g clipPath="url(#lp-clip)">
          {paths.map(({ b: bb, p }) => <path key={bb} d={pathD(p.points)} fill="none" stroke={p.outcome === 'captured' ? 'rgba(255,122,144,0.55)' : 'rgba(125,249,255,0.45)'} strokeWidth={1} />)}
          <path d={pathD(sel.points)} fill="none" stroke="#f5c76b" strokeWidth={2.2} />
          <circle cx={tx(0)} cy={ty(0)} r={1.5 * S} fill="none" stroke="#7df9ff" strokeDasharray="4 3" />
          <circle cx={tx(0)} cy={ty(0)} r={S} fill="#000" stroke="#ff7a90" />
        </g>
        <text x={30} y={40} style={{ fill: 'var(--text-dim)' }}>light enters from the right at impact parameter b (scale: {2 * E} r_s across)</text>
        <text x={30} y={600} style={{ fill: '#ff7a90' }}>● horizon r_s</text>
        <text x={130} y={600} style={{ fill: '#7df9ff' }}>- - photon sphere 1.5 r_s</text>
        <text x={300} y={600} style={{ fill: '#f5c76b' }}>— selected ray, b = {b.toFixed(3)} r_s</text>
      </svg>
      <p className="note" style={{ fontSize: 10.5 }}>Each ray is a null geodesic of the Schwarzschild metric, integrated numerically (RK4 in φ on u″ = −u + 3GMu²/c², u = 1/r, from Carroll eqs. 7.44 and 7.46 with ε = 0) <SourceLinks ids={['carroll-1997']} />. Rays with b below the critical value 3√3 GM/c² ≈ 2.598 r_s are captured (red); those just above it wind around the photon sphere before escaping. <ProvenanceBadge cls="simulated" /></p>
    </>
  );
}

function TestsTab() {
  const gm = CONSTANTS.GMsun.value;
  const mer = (planetElements as { elements: { id: string; a: number; e: number; LDot: number }[] }).elements.find((p) => p.id === 'mercury')!;
  const perOrbit = perihelionAdvancePerOrbit(gm, mer.a * CONSTANTS.au.value, mer.e);
  const perCentury = (perOrbit * (mer.LDot / 360)) / ARCSEC;
  const defl = weakDeflection(gm, CONSTANTS.Rsun.value) / ARCSEC;
  const zSun = redshiftToInfinity(gm, CONSTANTS.Rsun.value)!;
  const earth = 1 - staticTimeRate(CONSTANTS.GMearth.value, CONSTANTS.ReEarth.value)!;
  return (
    <>
      <table className="table-mini" aria-label="Weak-field tests" style={{ width: '100%' }}>
        <thead><tr><th>Effect</th><th>This model</th><th>Comparison</th><th>Inputs</th></tr></thead>
        <tbody>
          <tr><td>Perihelion advance of Mercury (relativistic part)</td><td>{perCentury.toFixed(2)}″ per century <ProvenanceBadge cls="derived" /></td><td>43″ per century left after equinox precession (5025″) and planetary perturbations (532″) are removed from the observed 5601″, as quoted by Carroll <SourceLinks ids={['carroll-1997']} /></td><td>Δφ = 6πGM☉/(c²a(1−e²)) per orbit; a, e and mean motion from JPL <SourceLinks ids={['jpl-approx-planets']} />; GM☉ <SourceLinks ids={['iau-2015-b3']} /></td></tr>
          <tr><td>Deflection of starlight grazing the Sun</td><td>{defl.toFixed(3)}″ <ProvenanceBadge cls="derived" /></td><td>1.″7 in Narayan &amp; Bartelmann’s worked example <SourceLinks ids={['narayan-bartelmann-1996']} /></td><td>α̂ = 4GM/(c²b) with b = R☉ (nominal)</td></tr>
          <tr><td>Gravitational redshift of light leaving the solar surface</td><td>z = {zSun.toExponential(3)} (cz = {(zSun * C).toFixed(0)} m/s) <ProvenanceBadge cls="derived" /></td><td className="unknown">no measured value bundled</td><td>exact formula at r = R☉; the Sun’s rotation and convective shifts are ignored</td></tr>
          <tr><td>Clock on Earth’s surface vs. far away</td><td>slower by {(earth * 1e10).toFixed(3)} × 10⁻¹⁰ ({(earth * 86400 * 1e6).toFixed(1)} µs per day) <ProvenanceBadge cls="derived" /></td><td className="unknown">no measured value bundled</td><td>non-rotating Earth with nominal GM⊕ and equatorial radius; rotation and the Sun’s potential ignored</td></tr>
        </tbody>
      </table>
      <p className="note">Weak-field effects are small because r_s is tiny compared with the Sun’s radius (r_s/R☉ = {compactness(gm, CONSTANTS.Rsun.value).toExponential(2)}). The deflection is observable in the weak field and so does not test the exact Schwarzschild form; the perihelion advance was historically the first test of general relativity <SourceLinks ids={['carroll-1997']} />.</p>
      <LorentzCalc />
    </>
  );
}

function LorentzCalc() {
  const { query } = useRoute();
  const beta = Math.max(0, Math.min(0.9999, Number(query.get('beta') ?? 0.6)));
  const g = lorentzFactor(beta * C)!;
  return (
    <>
      <div className="section-title">Special relativity: moving clocks <ProvenanceBadge cls="hypothetical" title="speed chosen by you" /></div>
      <label className="slider-row"><span>speed v/c</span><input type="range" min={0} max={0.9999} step={0.0001} value={beta} onChange={(e) => setQuery({ beta: e.target.value })} aria-label="Speed as a fraction of c" /><span>{beta.toFixed(4)}</span></label>
      <dl className="kv" aria-label="Lorentz factor">
        <KV k="Lorentz factor γ = 1/√(1 − v²/c²)" v={g} sig={6} />
        <KV k="One hour on the moving clock lasts, for you" v={g * 60} unit="min" sig={5} />
      </dl>
      <p className="note" style={{ fontSize: 10.5 }}>The proper time Δτ is measured by the clock that moves with the events; any other observer measures the longer interval Δt = γΔτ: in Einstein’s words the moving clock “is slow by 1 − √(1 − v²/c²) seconds per second” <SourceLinks ids={['einstein-1905']} />.</p>
    </>
  );
}

export default function RelativityView() {
  const { tab, preset, logm, gm, rRel, L, b } = useParams();
  const rs = schwarzschildRadius(gm);
  const r = rRel * rs;
  const insideBody = preset.surfaceRadius !== null && r < preset.surfaceRadius;
  const orbit = circularOrbit(gm, r);
  const regime = fieldRegime(gm, r);
  const module = PHYSICS_MODULES.find((m) => m.id === 'relativistic')!;
  const massKg = gm / CONSTANTS.G.value;
  const sel = tab === 'light' ? photonPath(b) : null;
  return (
    <>
      <nav className="view-switch" aria-label="Relativity sections">
        {TABS.map(([t, label]) => <button key={t} className={tab === t ? 'active' : ''} onClick={() => setQuery({ tab: t === 'radii' ? null : t })}>{label}</button>)}
      </nav>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>{TABS.find(([t]) => t === tab)![1]} <ProvenanceBadge cls={tab === 'light' ? 'simulated' : 'derived'} /></h1>
          {tab === 'radii' && <p className="note">Around any non-rotating, uncharged mass, spacetime outside the body is described by the Schwarzschild solution. Its scale is r_s = 2GM/c². Clocks closer to the mass run slower, light climbing out is redshifted, and inside 3 r_s no stable circular orbit exists.</p>}
          {tab === 'orbits' && <p className="note">The radial motion of a particle behaves like a ball rolling in an effective potential. Change the angular momentum L̃ to see the stable and unstable circular orbits appear, merge at the ISCO and vanish.</p>}
          {tab === 'light' && <p className="note">Light passing a black hole is bent; inside a critical impact parameter it is captured. The pattern is universal in units of r_s.</p>}
          {tab === 'tests' && <p className="note">Far from the Sun the same geometry reduces to tiny corrections to Newtonian gravity, which can be computed and compared with classic observations.</p>}
        </div>
        {tab === 'radii' && <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-start' }}><div style={{ flex: '1 1 560px' }}><RadiiTab gm={gm} rRel={rRel} /></div><RadiiSchematic gm={gm} rRel={rRel} preset={preset} /></div>}
        {tab === 'orbits' && <OrbitsTab L={L} />}
        {tab === 'light' && <LightTab b={b} />}
        {tab === 'tests' && <TestsTab />}
      </div>
      <Panel id="rel-controls" className="left-panel" title="Mass">
        <div role="radiogroup" aria-label="Central mass">
          {MASS_PRESETS.map((p) => (
            <label key={p.id} className="toggle-row"><span>{p.label} <ProvenanceBadge cls={p.provenance} /></span>
              <input type="radio" name="mass" checked={p.id === preset.id} onChange={() => setQuery({ m: p.id === MASS_PRESETS[0].id ? null : p.id })} aria-label={p.label} /></label>
          ))}
        </div>
        {preset.id === 'custom' && <label className="slider-row"><span>log₁₀(M/M☉)</span><input type="range" min={-7} max={10.5} step={0.05} value={logm} onChange={(e) => setQuery({ logm: e.target.value })} aria-label="Mass, log10 solar masses" /><span>{logm.toFixed(2)}</span></label>}
        <p className="note" style={{ fontSize: 10.5 }}>{preset.note} {preset.sources.length > 0 && <SourceLinks ids={preset.sources} />}</p>
        {tab === 'radii' && <label className="slider-row"><span>probe r/r_s</span><input type="range" min={0.0043} max={6} step={0.001} value={Math.log10(rRel)} onChange={(e) => setQuery({ r: Number((10 ** Number(e.target.value)).toPrecision(4)) })} aria-label="Probe radius, log10 of r over r_s" /><span>{rRel.toPrecision(4)}</span></label>}
        {tab === 'orbits' && <label className="slider-row"><span>L̃ (GM/c)</span><input type="range" min={0} max={8} step={0.01} value={L} onChange={(e) => setQuery({ L: e.target.value })} aria-label="Specific angular momentum" /><span>{L.toFixed(2)}</span></label>}
        {tab === 'light' && <label className="slider-row"><span>b (r_s)</span><input type="range" min={0.2} max={30} step={0.001} value={b} onChange={(e) => setQuery({ b: e.target.value })} aria-label="Impact parameter in units of r_s" /><span>{b.toFixed(3)}</span></label>}
        <div className="section-title">Model limits</div>
        <ul className="note" style={{ paddingLeft: 16, fontSize: 10.5 }}>{module.validity.map((v) => <li key={v}>{v}</li>)}</ul>
      </Panel>
      <Panel id="rel-info" className="right-panel" title="Schwarzschild quantities">
        <h2 style={{ margin: '0 0 2px', fontWeight: 400 }}>{preset.id === 'custom' ? `${(10 ** logm).toPrecision(3)} M☉ (your choice)` : preset.label}</h2>
        <dl className="kv" aria-label="Characteristic radii">
          <KV k="Mass" v={`${(massKg / SOLAR_MASS_KG).toPrecision(4)} M☉ (${massKg.toExponential(3)} kg)`} />
          <KV k="Schwarzschild radius r_s = 2GM/c²" v={fmtLength(rs)} />
          <KV k="Photon sphere 3GM/c²" v={fmtLength(photonSphereRadius(gm))} />
          <KV k="Innermost stable circular orbit 6GM/c²" v={fmtLength(iscoRadius(gm))} />
          <KV k="Critical impact parameter 3√3 GM/c²" v={fmtLength(criticalImpactParameter(gm))} />
          {preset.surfaceRadius !== null && <KV k="Surface radius / r_s" v={preset.surfaceRadius / rs} sig={4} />}
        </dl>
        {preset.surfaceRadius !== null && preset.surfaceRadius > rs && <p className="note warn">This body is much larger than its Schwarzschild radius, so it has no horizon, photon sphere or ISCO: those radii lie inside it, where the vacuum solution does not apply. They show what a black hole of the same mass would have.</p>}
        {tab === 'radii' && <>
          <div className="section-title">At the probe radius r = {rRel.toPrecision(4)} r_s ({fmtLength(r)})</div>
          {insideBody ? <p className="note warn">This radius lies inside the body. The exterior (vacuum) solution does not apply here, so no values are shown.</p> : <>
            <dl className="kv" aria-label="Probe values">
              <KV k="Static clock rate dτ/dt" v={staticTimeRate(gm, r)} sig={8} />
              <KV k="Redshift to infinity z" v={redshiftToInfinity(gm, r)} sig={5} />
              <KV k="Circular orbit" v={orbit ? (orbit.stable ? 'stable' : 'unstable') : 'none (r ≤ 1.5 r_s)'} />
              {orbit && <KV k="Orbit clock rate dτ/dt" v={orbit.dTauDt} sig={8} />}
              {orbit && <KV k="Orbital period (far-away clock)" v={2 * Math.PI / orbit.omega} unit="s" sig={4} />}
            </dl>
            <p className={`note ${regime === 'weak' ? '' : 'warn'}`}>Field: {REGIME_TEXT[regime]}.</p>
          </>}
        </>}
        {tab === 'light' && sel && <dl className="kv" aria-label="Selected ray">
          <KV k="Impact parameter b" v={`${b.toFixed(3)} r_s = ${fmtLength(b * rs)}`} />
          <KV k="Outcome" v={sel.outcome} />
          <KV k="Closest approach" v={sel.outcome === 'escaped' ? sel.rMin : null} unit="r_s" sig={4} />
          <KV k="Deflection (numerical)" v={sel.deflection !== null ? (sel.deflection * 180) / Math.PI : null} unit="°" sig={5} />
          <KV k="Weak-field 4GM/(c²b)" v={(2 / b) * 180 / Math.PI} unit="°" sig={5} />
        </dl>}
        <p className="note" style={{ fontSize: 10.5 }}>Constants: <SourceLinks ids={['codata-2018', 'iau-2015-b3']} />. Geometry: <SourceLinks ids={['carroll-1997']} />.</p>
      </Panel>
    </>
  );
}

