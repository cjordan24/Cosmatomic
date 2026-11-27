/**
 * Expansion and distances — #/cosmic/universe?tab=distances|history|lensing&m=<preset>&H0=&om=&ol=&z=&M=&zl=&zs=
 * ΛCDM distance measures, lookback time and expansion history with Planck 2018 parameters, and the
 * angular-diameter distances that cosmological lenses need. Gate 7.1.
 */
import { useMemo } from 'react';
import { navigate, setQuery, useRoute } from '@/shared/router';
import {
  PLANCK18, E, Ok, accelerationOnsetZ, ageGyr, angularDiameterDistanceBetweenMpc, angularDiameterDistanceMpc, comovingDistanceMpc, decelerationParameter,
  densityParameters, distanceModulus, dmFromDc, hubbleParameter, kpcPerArcsec, lensDistancesMpc, lookbackTimeGyr, luminosityDistanceMpc, matterDarkEnergyEqualityZ,
  particleHorizonMpc, transverseComovingMpc, type Cosmology,
} from '@/core/physics/cosmology';
import { CONSTANTS, PARSEC_M } from '@/core/constants/constants';
import { einsteinRadius, einsteinRadiusD } from '@/core/physics/lensing';
import { KV, Panel, ProvenanceBadge } from '@/ui/components';
import { LinePlot, type Series } from '@/ui/plots';
import { RelatedLinks } from '@/ui/RelatedLinks';
import { SourceLinks } from '@/ui/SourcesView';
import { EPOCHS, PLANCK, PRESETS, fmtE, logGrid, planckParam, type ModelPreset } from './universe';

type Tab = 'distances' | 'history' | 'lensing';
const TABS: [Tab, string][] = [['distances', 'Distances'], ['history', 'Expansion history'], ['lensing', 'Cosmological lensing']];
const COL = { dc: '#7df9ff', dl: '#f5c76b', da: '#5cf2a6', lt: '#b18cff', m: '#7df9ff', r: '#ff7a90', de: '#b18cff', k: '#9aa4b2', ref: '#9aa4b2' };
const MPC_M = 1e6 * PARSEC_M;
const GLY_PER_MPC = 3.261563777e-3; // 1 Mpc = 3.2616 Mly (IAU parsec, Julian light-year)
const ARCSEC = Math.PI / 180 / 3600;
const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
const num = (q: URLSearchParams, k: string, d: number, a: number, b: number) => { const v = Number(q.get(k)); return q.has(k) && Number.isFinite(v) ? clamp(v, a, b) : d; };
const gpc = (mpc: number) => `${(mpc / 1000).toPrecision(4)} Gpc (${(mpc * GLY_PER_MPC).toPrecision(4)} Gly)`;

/** The model selected in the URL: a preset, or custom (H₀, Ω_m, Ω_Λ) with Planck's radiation density. */
function useModel(): { preset: ModelPreset; c: Cosmology } {
  const { query } = useRoute();
  const preset = PRESETS.find((p) => p.id === query.get('m')) ?? PRESETS[0];
  if (preset.id !== 'custom') return { preset, c: preset.cosmology };
  const c: Cosmology = { name: 'Custom', H0: num(query, 'H0', PLANCK18.H0, 40, 100), Om: num(query, 'om', PLANCK18.Om, 0, 2), Ode: num(query, 'ol', PLANCK18.Ode, 0, 2), Or: PLANCK18.Or };
  return { preset, c };
}

function ModelPanel({ preset, c }: { preset: ModelPreset; c: Cosmology }) {
  const custom = (patch: Record<string, string>) => setQuery({ m: 'custom', H0: c.H0, om: c.Om, ol: c.Ode, ...patch });
  const ok = Ok(c);
  return (
    <>
      <div className="section-title">Model</div>
      {PRESETS.map((p) => <label key={p.id} className="toggle-row"><span>{p.label} <ProvenanceBadge cls={p.provenance} /></span>
        <input type="radio" name="cosmo-model" checked={p.id === preset.id} onChange={() => (p.id === 'custom' ? custom({}) : setQuery({ m: p.id === 'planck18' ? null : p.id, H0: null, om: null, ol: null }))} aria-label={p.label} /></label>)}
      <label className="slider-row"><span>H₀ (km/s/Mpc)</span><input type="range" min={50} max={80} step={0.1} value={c.H0} onChange={(e) => custom({ H0: e.target.value })} aria-label="Hubble constant" /><span>{c.H0.toFixed(2)}</span></label>
      <label className="slider-row"><span>Ω_m (matter)</span><input type="range" min={0} max={1.5} step={0.005} value={c.Om} onChange={(e) => custom({ om: e.target.value })} aria-label="Matter density parameter" /><span>{c.Om.toFixed(4)}</span></label>
      <label className="slider-row"><span>Ω_Λ (dark energy)</span><input type="range" min={0} max={1.5} step={0.005} value={c.Ode} onChange={(e) => custom({ ol: e.target.value })} aria-label="Dark-energy density parameter" /><span>{c.Ode.toFixed(4)}</span></label>
      <p className="note" style={{ fontSize: 10.5 }}>{preset.note}. Ω_r = {fmtE(c.Or ?? 0, 2)}; curvature Ω_k = 1 − Ω_m − Ω_Λ − Ω_r = {Math.abs(ok) < 1e-9 ? '0 (flat)' : ok.toFixed(4) + (ok > 0 ? ' (open)' : ' (closed)')}.
        {preset.id === 'custom' && ' Radiation is kept at the Planck value in custom models.'}</p>
      {ok < -1e-10 && <p className="note warn">Closed model: the lensing distance between two redshifts (Hogg eq. 19) is not valid here and is not shown.</p>}
      <div className="section-title">Model limits</div>
      <ul className="note" style={{ paddingLeft: 16, fontSize: 10.5 }}>
        <li>Homogeneous, isotropic FLRW background; no structure or peculiar velocities</li>
        <li>Dark energy is a cosmological constant (w = −1)</li>
        <li>Radiation massless at all z; Planck’s 0.06 eV neutrino is counted as matter at all z</li>
        <li>No recombination or reionization physics; epochs are Planck’s fitted values</li>
      </ul>
    </>
  );
}

function DistancesTab({ preset, c }: { preset: ModelPreset; c: Cosmology }) {
  const { query } = useRoute();
  const z = num(query, 'z', 1, 0.001, 1100);
  const zs = useMemo(() => logGrid(0.01, 1100, 160), []);
  const curves = useMemo(() => {
    const dc = zs.map((x) => comovingDistanceMpc(x, c));
    const dm = dc.map((d) => dmFromDc(d, c));
    return {
      dc: zs.map((x, i) => [x, dc[i] / 1000] as [number, number]),
      dl: zs.map((x, i) => [x, ((1 + x) * dm[i]) / 1000] as [number, number]),
      da: zs.map((x, i) => [x, dm[i] / (1 + x) / 1000] as [number, number]),
      lt: zs.map((x) => [x, lookbackTimeGyr(x, c) / GLY_PER_MPC / 1000] as [number, number]),
    };
  }, [c, zs]);
  const ref = useMemo(() => (preset.id === 'planck18' ? null : zs.map((x) => [x, luminosityDistanceMpc(x, PLANCK18) / 1000] as [number, number])), [preset.id, zs]);
  const series: Series[] = [
    { points: curves.dl, color: COL.dl, width: 2, label: 'luminosity distance D_L' },
    { points: curves.dc, color: COL.dc, width: 2, label: 'comoving distance D_C' },
    { points: curves.lt, color: COL.lt, label: 'light-travel distance c·t_L' },
    { points: curves.da, color: COL.da, width: 2, label: 'angular-diameter distance D_A' },
    ...(ref ? [{ points: ref, color: COL.ref, dashed: true, label: 'D_L, Planck 2018 (reference)' }] : []),
  ];
  const daMax = useMemo(() => { let best = [0, 0]; for (const x of logGrid(0.1, 10, 400)) { const d = angularDiameterDistanceMpc(x, c); if (d > best[1]) best = [x, d]; } return best; }, [c]);
  const dc = comovingDistanceMpc(z, c), dm = transverseComovingMpc(z, c);
  const sliderPos = Math.log10(z);
  return (
    <>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Cosmic distances <ProvenanceBadge cls={preset.provenance} title={preset.note} /></h1>
          <p className="note">In an expanding universe there is no single “distance” to a far galaxy. Each measure answers a different question: the comoving distance stays fixed for objects moving with the expansion; the luminosity distance is the one that makes the inverse-square law hold for the light we receive; the angular-diameter distance converts an angular size into a physical size and, beyond z ≈ {daMax[0].toFixed(1)}, falls again, so more distant objects look larger <SourceLinks ids={['hogg-1999']} />.</p></div>
        <LinePlot ariaLabel="Distance measures against redshift" width={680} height={380} xLog yLog xDomain={[0.01, 1100]} yDomain={[0.01, 3e4]}
          xLabel="redshift z" yLabel="distance (Gpc)" legend="tl" series={series}
          vLines={[{ x: z, label: `z = ${z < 10 ? z.toPrecision(3) : z.toFixed(0)}`, color: '#ffffff' }, { x: planckParam('zstar').value, label: 'CMB', color: COL.r }]} />
        <p className="note" style={{ fontSize: 10.5 }}>D_C = D_H ∫dz/E(z), D_M from D_C with curvature, D_A = D_M/(1+z), D_L = (1+z)D_M, t_L = t_H ∫dz/((1+z)E) (Hogg eqs. 14–21, 30) <SourceLinks ids={['hogg-1999']} />, with E(z)² = Ω_r(1+z)⁴ + Ω_m(1+z)³ + Ω_k(1+z)² + Ω_Λ; the radiation term scales as a⁻⁴ <SourceLinks ids={['carroll-1997']} />. Parameters: Planck 2018 <SourceLinks ids={['planck-2018-vi']} />. Integrated numerically (Simpson’s rule in ln(1+z)).</p>
      </div>
      <Panel id="uni-controls" className="left-panel" title="Expansion model">
        <label className="slider-row"><span>redshift z</span><input type="range" min={-3} max={Math.log10(1100)} step={0.005} value={sliderPos} onChange={(e) => setQuery({ z: Number((10 ** Number(e.target.value)).toPrecision(4)) })} aria-label="Redshift" /><span>{z < 10 ? z.toPrecision(3) : z.toFixed(0)}</span></label>
        <div className="chip-row" style={{ flexWrap: 'wrap', gap: 4 }}>
          {[0.1, 1, 3, 7.82, 1089.8].map((x) => <button key={x} className={`chip ${Math.abs(z - x) < 1e-6 ? 'active' : ''}`} onClick={() => setQuery({ z: x })}>{x === 7.82 ? 'z_re' : x === 1089.8 ? 'z∗ (CMB)' : `z = ${x}`}</button>)}
        </div>
        <ModelPanel preset={preset} c={c} />
      </Panel>
      <Panel id="uni-info" className="right-panel" title={`At z = ${z < 10 ? z.toPrecision(4) : z.toFixed(1)}`}>
        <div className="section-title">Distances <ProvenanceBadge cls={preset.provenance} /></div>
        <dl className="kv" aria-label="Distances at the selected redshift">
          <KV k="Comoving D_C" v={gpc(dc)} />
          {Math.abs(Ok(c)) > 1e-9 && <KV k="Transverse comoving D_M" v={gpc(dm)} />}
          <KV k="Luminosity D_L" v={gpc((1 + z) * dm)} />
          <KV k="Angular-diameter D_A" v={gpc(dm / (1 + z))} />
          <KV k="Distance modulus μ" v={distanceModulus(z, c)} unit="mag" sig={5} />
          <KV k="Scale" v={`${kpcPerArcsec(z, c).toPrecision(3)} kpc per arcsec`} />
        </dl>
        <div className="section-title">Time</div>
        <dl className="kv" aria-label="Times at the selected redshift">
          <KV k="Lookback time" v={lookbackTimeGyr(z, c)} unit="Gyr" sig={4} />
          <KV k="Age of the universe then" v={ageGyr(z, c) >= 0.01 ? `${ageGyr(z, c).toPrecision(4)} Gyr` : `${(ageGyr(z, c) * 1e6).toPrecision(4)} kyr`} />
          <KV k="Age today" v={ageGyr(0, c)} unit="Gyr" sig={5} />
          <KV k="Hubble parameter H(z)" v={hubbleParameter(z, c)} unit="km/s/Mpc" sig={4} />
          <KV k="Scale factor a = 1/(1+z)" v={1 / (1 + z)} sig={4} />
        </dl>
        {preset.id === 'planck18' && <p className="note" style={{ fontSize: 10.5 }}>Check: the model age today, {ageGyr(0, c).toFixed(3)} Gyr, against Planck’s own {planckParam('age').value} ± {planckParam('age').sigma} Gyr (68 %); and D_M(z∗) = {transverseComovingMpc(planckParam('zstar').value, c).toFixed(0)} Mpc against r∗/θ∗ = {(planckParam('rstar').value / (planckParam('theta_star').value / 100)).toFixed(0)} Mpc <SourceLinks ids={['planck-2018-vi']} />.</p>}
        <p className="note" style={{ fontSize: 10.5 }}>Flux and size: a source of luminosity L gives flux L/(4πD_L²); an object of size ℓ subtends ℓ/D_A <SourceLinks ids={['hogg-1999']} />. Observed magnitudes also need a k-correction, which depends on the spectrum and is not applied.</p>
        <RelatedLinks id="context:cosmic-expansion" />
      </Panel>
    </>
  );
}

function HistoryTab({ preset, c }: { preset: ModelPreset; c: Cosmology }) {
  const at = useMemo(() => {
    const as = logGrid(1e-3, 3, 180);
    return as.map((a) => [ageGyr(1 / a - 1, c), a] as [number, number]);
  }, [c]);
  const planckAt = useMemo(() => (preset.id === 'planck18' ? null : logGrid(1e-3, 3, 120).map((a) => [ageGyr(1 / a - 1, PLANCK18), a] as [number, number])), [preset.id]);
  const onePlusZ = useMemo(() => logGrid(1, 1e5, 200), []);
  const dens = onePlusZ.map((x) => densityParameters(x - 1, c));
  const zLin = useMemo(() => Array.from({ length: 160 }, (_, i) => (i * 5) / 159), []);
  const adot = zLin.map((x) => [x, E(x, c) / (1 + x)] as [number, number]);
  const t0 = ageGyr(0, c), zAcc = accelerationOnsetZ(c), zEq = matterDarkEnergyEqualityZ(c);
  const tMax = Math.max(...at.map((p) => p[0]).filter(Number.isFinite));
  return (
    <>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Expansion history <ProvenanceBadge cls={preset.provenance} title={preset.note} /></h1>
          <p className="note">The density of radiation falls as a⁻⁴, matter as a⁻³, and a cosmological constant not at all. So radiation dominated the early universe, matter came next, and dark energy dominates today. Matter slows the expansion and a cosmological constant speeds it up <SourceLinks ids={['carroll-1997']} />.</p></div>
        <LinePlot ariaLabel="Scale factor against cosmic time" width={680} height={250} xDomain={[0, Math.min(tMax, 45)]} yDomain={[0, 3]} xLabel="time since the Big Bang t (Gyr)" yLabel="scale factor a" legend="tl"
          series={[{ points: at, color: COL.dc, width: 2, label: preset.label }, ...(planckAt ? [{ points: planckAt, color: COL.ref, dashed: true, label: 'Planck 2018 (reference)' }] : [])]}
          markers={[{ x: t0, y: 1, label: `today, t₀ = ${t0.toFixed(2)} Gyr`, color: '#ffffff' }]} />
        <LinePlot ariaLabel="Density parameters against redshift" width={680} height={230} xLog xDomain={[1, 1e5]} yDomain={[0, 1.3]} xLabel="1 + z (log; the past is to the right)" yLabel="fraction of total density Ω_i(z)" legend="tr"
          series={[
            { points: onePlusZ.map((x, i) => [x, dens[i].m] as [number, number]), color: COL.m, width: 2, label: 'matter' },
            { points: onePlusZ.map((x, i) => [x, dens[i].r] as [number, number]), color: COL.r, width: 2, label: 'radiation' },
            { points: onePlusZ.map((x, i) => [x, dens[i].de] as [number, number]), color: COL.de, width: 2, label: 'dark energy (Λ)' },
            ...(Math.abs(Ok(c)) > 1e-9 ? [{ points: onePlusZ.map((x, i) => [x, Math.abs(dens[i].k)] as [number, number]), color: COL.k, dashed: true, label: '|curvature|' }] : []),
          ]}
          vLines={EPOCHS.map((e) => ({ x: 1 + planckParam(e.key).value, label: e.key === 'zeq' ? 'z_eq' : e.key === 'zstar' ? 'z∗' : 'z_re', color: '#9aa4b2' }))} />
        <LinePlot ariaLabel="Expansion speed against redshift" width={680} height={210} xDomain={[0, 5]} xLabel="redshift z" yLabel="ȧ / H₀ = E(z)/(1+z)" legend="br"
          series={[{ points: adot, color: COL.dl, width: 2, label: 'expansion speed ȧ (H₀ = 1)' }]}
          vLines={zAcc !== null ? [{ x: zAcc, label: `q = 0 at z = ${zAcc.toFixed(2)}`, color: COL.de }] : []} />
        <p className="note" style={{ fontSize: 10.5 }}>ȧ is how fast a fixed comoving separation grows. Where it falls towards the left, the expansion is accelerating (q &lt; 0). q = Σ Ω_i(z)(1 + 3w_i)/2 with w = 0, ⅓, −1 follows from the acceleration equation (Carroll 8.33, 8.38) <SourceLinks ids={['carroll-1997']} />. Epoch lines are Planck 2018 fitted values <SourceLinks ids={['planck-2018-vi']} />.</p>
        <table className="table-mini" aria-label="Planck 2018 parameters" style={{ width: '100%' }}>
          <thead><tr><th>Planck 2018 parameter</th><th>Value (68 %)</th><th>Type</th></tr></thead>
          <tbody>{PLANCK.parameters.map((p) => <tr key={p.key}><td>{p.label}</td><td>{p.value}{p.sigma !== null ? ` ± ${p.sigma}` : ''} {p.unit}</td><td style={{ fontSize: 10.5 }}>{p.kind === 'assumed' ? 'assumed' : p.kind === 'base' ? 'fitted' : 'derived'}{p.note ? `: ${p.note}` : ''}</td></tr>)}</tbody>
        </table>
        <p className="note" style={{ fontSize: 10.5 }}>{PLANCK.table}, likelihood {PLANCK.likelihood}; model: {PLANCK.model}. These values depend on that model. Without BAO, Planck’s baseline gives H₀ = {PLANCK.baselineH0.value} ± {PLANCK.baselineH0.sigma} km/s/Mpc <SourceLinks ids={['planck-2018-vi']} />. Manually transcribed.</p>
      </div>
      <Panel id="uni-hist-controls" className="left-panel" title="Expansion model">
        <ModelPanel preset={preset} c={c} />
      </Panel>
      <Panel id="uni-hist-info" className="right-panel" title="Epochs">
        <div className="section-title">Planck 2018 fitted epochs <ProvenanceBadge cls="derived" title="fitted to Planck CMB data in base ΛCDM" /></div>
        <table className="table-mini" aria-label="Cosmic epochs" style={{ width: '100%' }}>
          <thead><tr><th>Epoch</th><th>z (68 %)</th><th>age then</th></tr></thead>
          <tbody>
            {[...EPOCHS, { key: 'zdrag', label: 'baryon drag' } as const].sort((a, b) => planckParam(b.key).value - planckParam(a.key).value).map((e) => { const p = planckParam(e.key); const t = ageGyr(p.value, c); return <tr key={e.key}><td>{e.label}</td><td>{p.value} ± {p.sigma}</td><td>{t < 0.01 ? `${(t * 1e6).toFixed(0)} kyr` : `${(t * 1000).toFixed(0)} Myr`}</td></tr>; })}
          </tbody>
        </table>
        <p className="note" style={{ fontSize: 10.5 }}>Ages computed from the selected model; redshifts from Planck Table 2 <SourceLinks ids={['planck-2018-vi']} />.</p>
        <div className="section-title">From the model <ProvenanceBadge cls={preset.provenance} /></div>
        <dl className="kv" aria-label="Model landmarks">
          <KV k="Age today" v={t0} unit="Gyr" sig={5} />
          <KV k="Deceleration q₀ today" v={decelerationParameter(0, c)} sig={3} />
          <KV k="Acceleration began (q = 0)" v={zAcc === null ? 'never (in z < 20)' : `z = ${zAcc.toFixed(3)}, ${(t0 - lookbackTimeGyr(zAcc, c)).toFixed(2)} Gyr after the Big Bang`} />
          <KV k="Matter = dark energy" v={zEq === null ? 'never' : zEq < 0 ? 'in the future' : `z = ${zEq.toFixed(3)}`} />
          <KV k="Observable universe (comoving radius)" v={gpc(particleHorizonMpc(c))} />
        </dl>
        <p className="note" style={{ fontSize: 10.5 }}>The comoving radius of the observable universe is the comoving distance to z → ∞ (Hogg eq. 15) <SourceLinks ids={['hogg-1999']} />. It is a model quantity, not a measurement.</p>
        <RelatedLinks id="context:cosmic-expansion" />
      </Panel>
    </>
  );
}

function LensingTab({ preset, c }: { preset: ModelPreset; c: Cosmology }) {
  const { query } = useRoute();
  const logM = num(query, 'M', 11, 8, 15);
  const zl = num(query, 'zl', 0.5, 0.01, 3);
  const zs = Math.max(num(query, 'zs', 2, 0.02, 8), zl + 0.01);
  const d = lensDistancesMpc(zl, zs, c);
  const gm = 10 ** logM * CONSTANTS.GMsun.value;
  const zg = useMemo(() => logGrid(0.01, 8, 160), []);
  const da = zg.map((x) => [x, angularDiameterDistanceMpc(x, c) / 1000] as [number, number]);
  const dds = zg.filter((x) => x > zl).map((x) => [x, (angularDiameterDistanceBetweenMpc(zl, x, c) ?? NaN) / 1000] as [number, number]);
  const naiveCurve = zg.filter((x) => x > zl).map((x) => [x, (angularDiameterDistanceMpc(x, c) - angularDiameterDistanceMpc(zl, c)) / 1000] as [number, number]);
  const th = d ? einsteinRadiusD(gm, d.Dd * MPC_M, d.Ds * MPC_M, d.Dds * MPC_M) : null;
  const thNaive = d && d.Ds > d.Dd ? einsteinRadius(gm, d.Dd * MPC_M, d.Ds * MPC_M) : null;
  const fmtTh = (x: number | null) => (x === null ? null : x / ARCSEC >= 0.1 ? `${(x / ARCSEC).toPrecision(4)}″` : `${(x / ARCSEC * 1000).toPrecision(4)} mas`);
  return (
    <>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Cosmological lensing distances <ProvenanceBadge cls="hypothetical" title="lens mass and redshifts are your choice; distances follow from the model" /></h1>
          <p className="note">The Einstein radius depends on D_ds/(D_d D_s). Inside the Galaxy D_ds is simply D_s − D_d. Across cosmological distances the distance from lens to source has to be computed for the expanding universe: it is not the difference of the two angular-diameter distances <SourceLinks ids={['hogg-1999']} />.</p></div>
        <LinePlot ariaLabel="Angular-diameter distances for lensing" width={680} height={360} xLog xDomain={[0.01, 8]} yDomain={[0, Math.max(...da.map((p) => p[1])) * 1.15]} xLabel="redshift z" yLabel="angular-diameter distance (Gpc)" legend="tl"
          series={[
            { points: da, color: COL.da, width: 2, label: 'D_A(z) from the observer' },
            { points: dds, color: COL.dl, width: 2, label: `D_A(z_l, z) from the lens (Hogg eq. 19)` },
            { points: naiveCurve, color: COL.ref, dashed: true, label: 'D_A(z) − D_A(z_l) (wrong)' },
          ]}
          markers={d ? [{ x: zl, y: d.Dd / 1000, label: 'lens', color: '#ffffff' }, { x: zs, y: d.Ds / 1000, label: 'source', color: '#ffffff' }, { x: zs, y: d.Dds / 1000, label: 'D_ds', color: COL.dl }] : []} />
        <p className="note" style={{ fontSize: 10.5 }}>θ_E = √(4GM/c² · D_ds/(D_d D_s)) for a point mass <SourceLinks ids={['narayan-bartelmann-1996']} />; distances from the selected model <SourceLinks ids={['hogg-1999', 'planck-2018-vi']} />. A real galaxy is an extended mass, so this gives the order of magnitude of the ring, not a fit to any observed lens.</p>
      </div>
      <Panel id="uni-lens-controls" className="left-panel" title="Lens and source">
        <label className="slider-row"><span>lens mass log₁₀(M/M☉)</span><input type="range" min={8} max={15} step={0.05} value={logM} onChange={(e) => setQuery({ M: e.target.value })} aria-label="Lens mass" /><span>{logM.toFixed(2)}</span></label>
        <label className="slider-row"><span>lens redshift z_l</span><input type="range" min={0.01} max={3} step={0.01} value={zl} onChange={(e) => setQuery({ zl: e.target.value, zs: Math.max(zs, Number(e.target.value) + 0.01).toFixed(2) })} aria-label="Lens redshift" /><span>{zl.toFixed(2)}</span></label>
        <label className="slider-row"><span>source redshift z_s</span><input type="range" min={0.02} max={8} step={0.01} value={zs} onChange={(e) => setQuery({ zs: e.target.value })} aria-label="Source redshift" /><span>{zs.toFixed(2)}</span></label>
        <ModelPanel preset={preset} c={c} />
      </Panel>
      <Panel id="uni-lens-info" className="right-panel" title="Lens geometry">
        {!d ? <p className="note warn">Not available for a closed model (Hogg eq. 19 holds only for Ω_k ≥ 0).</p> : <>
          <dl className="kv" aria-label="Lensing distances">
            <KV k="D_d (observer → lens)" v={gpc(d.Dd)} />
            <KV k="D_s (observer → source)" v={gpc(d.Ds)} />
            <KV k="D_ds (lens → source)" v={gpc(d.Dds)} />
            <KV k="D_s − D_d (not used)" v={gpc(d.Ds - d.Dd)} />
          </dl>
          <div className="section-title">Point-mass Einstein radius</div>
          <dl className="kv" aria-label="Einstein radius">
            <KV k="θ_E (cosmological distances)" v={fmtTh(th)} />
            <KV k="θ_E if D_ds = D_s − D_d" v={fmtTh(thNaive)} />
            {th && thNaive && <KV k="Ratio" v={th / thNaive} sig={4} />}
            {th && <KV k="Ring radius at the lens" v={`${(th * d.Dd * 1e3).toPrecision(3)} kpc`} />}
            <KV k="Lookback time to lens / source" v={`${lookbackTimeGyr(zl, c).toFixed(2)} / ${lookbackTimeGyr(zs, c).toFixed(2)} Gyr`} />
          </dl>
        </>}
        <button className="chip" onClick={() => navigate('/cosmic/lensing?lens=cosmo')}>Lens plane for 10¹¹ M☉ at z = 0.5 →</button>
        <RelatedLinks id="context:cosmic-expansion" />
      </Panel>
    </>
  );
}

export default function UniverseView() {
  const { query } = useRoute();
  const tab: Tab = (TABS.find(([t]) => t === query.get('tab'))?.[0]) ?? 'distances';
  const { preset, c } = useModel();
  return (
    <>
      <nav className="view-switch" aria-label="Expansion sections">
        {TABS.map(([t, label]) => <button key={t} className={tab === t ? 'active' : ''} onClick={() => setQuery({ tab: t === 'distances' ? null : t })}>{label}</button>)}
      </nav>
      {tab === 'history' ? <HistoryTab preset={preset} c={c} /> : tab === 'lensing' ? <LensingTab preset={preset} c={c} /> : <DistancesTab preset={preset} c={c} />}
    </>
  );
}
