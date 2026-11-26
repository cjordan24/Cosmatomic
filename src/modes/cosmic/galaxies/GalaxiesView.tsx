/**
 * Galaxies — #/cosmic/galaxies?tab=curves|mw&g=<SPARC name>&yd=&yb=&halo=0|1
 * SPARC rotation curves against the baryons-only Newtonian model and a fitted NFW halo, and the Milky
 * Way's measured circular-velocity curve and structural parameters. Gate 6.4.
 */
import { useEffect, useMemo, useState } from 'react';
import { navigate, setQuery, useRoute } from '@/shared/router';
import { KV, Loading, Panel, ProvenanceBadge } from '@/ui/components';
import { LinePlot, type Series } from '@/ui/plots';
import { RelatedLinks } from '@/ui/RelatedLinks';
import { SourceLinks } from '@/ui/SourcesView';
import {
  DISTANCE_METHOD, H0_KMS_MPC, HUBBLE_TYPE, MW, UPSILON_DEFAULT, chi2Baryons, fitNFW, keplerV, loadSparc, mwParam, vBar, vNFW, type CurvePoint, type Sparc,
} from './galaxies';

type Tab = 'curves' | 'mw';
const COL = { obs: '#ffffff', gas: '#5cf2a6', disk: '#7df9ff', bul: '#ff7a90', bar: '#f5c76b', halo: '#b18cff' };
const fmtE = (x: number) => { const e = Math.floor(Math.log10(x)); return `${(x / 10 ** e).toFixed(2)} × 10${String(e).split('').map((c) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(c)]).join('')}`; };
const sgnSqrt = (x: number) => Math.sign(x) * Math.sqrt(Math.abs(x));

function CurvesTab({ sparc }: { sparc: Sparc }) {
  const { query } = useRoute();
  const name = sparc.curves[query.get('g') ?? ''] ? query.get('g')! : 'NGC3198';
  const yd = Math.max(0.1, Math.min(1.5, Number(query.get('yd') ?? UPSILON_DEFAULT.disk)));
  const yb = Math.max(0.1, Math.min(2, Number(query.get('yb') ?? UPSILON_DEFAULT.bul)));
  const halo = query.get('halo') !== '0';
  const [filter, setFilter] = useState('');
  const [quality, setQuality] = useState<number>(3);
  const g = sparc.galaxies.find((x) => x.name === name)!;
  const curve = sparc.curves[name];
  const fit = useMemo(() => (halo ? fitNFW(curve, yd, yb) : null), [curve, yd, yb, halo]);
  const bChi = chi2Baryons(curve, yd, yb);
  const Rmax = Math.max(...curve.map((p) => p[0])) * 1.05;
  const rs = Array.from({ length: 160 }, (_, i) => (Rmax * (i + 0.5)) / 160);
  // interpolate tabulated components onto the fine grid for smooth lines (within the measured range only)
  const at = (r: number, k: 3 | 4 | 5) => {
    if (r < curve[0][0] || r > curve[curve.length - 1][0]) return NaN;
    const j = curve.findIndex((p) => p[0] >= r);
    if (j <= 0) return curve[0][k];
    const a = curve[j - 1], b = curve[j], t = (r - a[0]) / (b[0] - a[0]);
    return a[k] + t * (b[k] - a[k]);
  };
  const series: Series[] = [
    { points: curve.map((p) => [p[0], p[3]] as [number, number]), color: COL.gas, dashed: true, label: 'gas (incl. helium)' },
    { points: curve.map((p) => [p[0], sgnSqrt(yd * Math.abs(p[4]) * p[4])] as [number, number]), color: COL.disk, dashed: true, label: `stellar disc, Υ = ${yd.toFixed(2)}` },
    ...(curve.some((p) => p[5] !== 0) ? [{ points: curve.map((p) => [p[0], sgnSqrt(yb * Math.abs(p[5]) * p[5])] as [number, number]), color: COL.bul, dashed: true, label: `bulge, Υ = ${yb.toFixed(2)}` }] : []),
    { points: curve.map((p) => [p[0], vBar(p, yd, yb)] as [number, number]), color: COL.bar, width: 2.2, label: 'all baryons, Newtonian' },
    ...(fit ? [
      { points: rs.map((r) => [r, vNFW(r, fit.V200, fit.c)] as [number, number]), color: COL.halo, dashed: true, label: 'NFW halo (fit)' },
      { points: rs.map((r) => { const v = at(r, 3), d = at(r, 4), b = at(r, 5); return [r, sgnSqrt(Math.abs(v) * v + yd * Math.abs(d) * d + yb * Math.abs(b) * b + vNFW(r, fit.V200, fit.c) ** 2)] as [number, number]; }), color: COL.halo, width: 2.2, label: 'baryons + NFW halo' },
    ] : []),
  ];
  const vmax = Math.max(...curve.map((p) => p[1] + p[2]), ...series.flatMap((s) => s.points.map((q) => q[1])).filter(Number.isFinite)) * 1.08;
  const list = sparc.galaxies.filter((x) => x.Q <= quality && x.name.toLowerCase().includes(filter.toLowerCase().replace(/\s+/g, '')));
  return (
    <>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>{name} <ProvenanceBadge cls="observed" title="rotation curve and mass models from SPARC" /> {fit && <ProvenanceBadge cls="simulated" title="NFW halo fitted by least squares" />}</h1>
          <p className="note">The measured rotation speed (white points) against what the visible matter alone would produce under Newtonian gravity (yellow). In most disc galaxies the outer parts rotate faster than the gas and stars can explain. A dark-matter halo (violet) is one model that closes the gap; it is fitted here, not observed.</p></div>
        <LinePlot ariaLabel="Rotation curve" width={680} height={380} xDomain={[0, Rmax]} yDomain={[Math.min(0, ...series.flatMap((s) => s.points.map((q) => q[1])).filter(Number.isFinite)), vmax]}
          xLabel="radius R (kpc)" yLabel="circular velocity V (km/s)" legend="br" series={series}
          errorBars={curve.map((p: CurvePoint) => ({ x: p[0], y: p[1], lo: p[2], hi: p[2], color: COL.obs, title: `R = ${p[0]} kpc: ${p[1]} ± ${p[2]} km/s` }))} />
        <p className="note" style={{ fontSize: 10.5 }}>Error bars are SPARC’s random errors (non-circular motions, asymmetries); inclination systematics are not included. Gas, disc and bulge velocities are SPARC’s Newtonian mass models; V_bar² = |V_gas|V_gas + Υ_disk|V_disk|V_disk + Υ_bul|V_bul|V_bul <SourceLinks ids={['lelli-2016-sparc']} />. Halo: NFW circular velocity <SourceLinks ids={['nfw-1997']} /> with H₀ = {H0_KMS_MPC} km/s/Mpc, the value SPARC uses for Hubble-flow distances.</p>
      </div>
      <Panel id="gal-controls" className="left-panel" title="SPARC galaxies">
        <input className="text-input" placeholder="Filter, e.g. NGC 3198" value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filter galaxies" style={{ width: '100%' }} />
        <label className="slider-row"><span>quality ≤</span><select value={quality} onChange={(e) => setQuality(Number(e.target.value))} aria-label="Maximum quality flag"><option value={1}>1 (high)</option><option value={2}>2 (medium)</option><option value={3}>3 (all)</option></select><span>{list.length} galaxies</span></label>
        <div className="mol-list" role="listbox" aria-label="Galaxies" style={{ maxHeight: 260, overflow: 'auto' }}>
          {list.map((x) => <button key={x.name} role="option" aria-selected={x.name === name} className={x.name === name ? 'active' : ''} onClick={() => setQuery({ g: x.name })}><span>{x.name}</span><span className="f">{HUBBLE_TYPE[x.T]} · Q{x.Q}</span></button>)}
        </div>
        <div className="section-title">Model</div>
        <label className="slider-row"><span>Υ disc (M☉/L☉)</span><input type="range" min={0.1} max={1.5} step={0.05} value={yd} onChange={(e) => setQuery({ yd: e.target.value })} aria-label="Disc mass-to-light ratio" /><span>{yd.toFixed(2)}</span></label>
        <label className="slider-row"><span>Υ bulge (M☉/L☉)</span><input type="range" min={0.1} max={2} step={0.05} value={yb} onChange={(e) => setQuery({ yb: e.target.value })} aria-label="Bulge mass-to-light ratio" /><span>{yb.toFixed(2)}</span></label>
        <label className="toggle-row"><span>Fit an NFW dark-matter halo</span><input type="checkbox" checked={halo} onChange={(e) => setQuery({ halo: e.target.checked ? null : 0 })} aria-label="Fit an NFW halo" /></label>
        <p className="note" style={{ fontSize: 10.5 }}>Υ is the stellar mass-to-light ratio at 3.6 µm; SPARC’s mass models use Υ_disk = 0.5 and Υ_bul = 0.7 M☉/L☉ as reference values <SourceLinks ids={['lelli-2016-sparc']} />. Higher Υ (a “maximum disc”) leaves less room for dark matter.</p>
      </Panel>
      <Panel id="gal-info" className="right-panel" title="Galaxy">
        <h2 style={{ margin: '0 0 2px', fontWeight: 400 }}>{name}</h2>
        <div className="note">Hubble type {HUBBLE_TYPE[g.T]} · quality {g.Q} ({['', 'high', 'medium', 'low'][g.Q]})</div>
        <div className="section-title">SPARC Table 1 <ProvenanceBadge cls="observed" /></div>
        <dl className="kv" aria-label="Galaxy properties">
          <KV k="Distance" v={`${g.D} ± ${g.eD} Mpc`} />
          <KV k="Distance method" v={DISTANCE_METHOD[g.fD]} />
          <KV k="Inclination" v={`${g.inc}° ± ${g.eInc}°`} />
          <KV k="Luminosity at 3.6 µm" v={`${g.L36} × 10⁹ L☉`} />
          <KV k="H I mass" v={`${g.MHI} × 10⁹ M☉`} />
          <KV k="Disc scale length" v={g.Rdisk} unit="kpc" />
          <KV k="Flat rotation speed V_flat" v={g.Vflat !== null ? `${g.Vflat} ± ${g.eVflat} km/s` : null} />
        </dl>
        <p className="note" style={{ fontSize: 10.5 }}>Rotation-curve data: {g.refs.map((k, i) => <span key={k}>{i > 0 && '; '}{sparc.references[k] ?? `${k} (key not in the SPARC legend)`}</span>)}. Compiled by <SourceLinks ids={['lelli-2016-sparc']} />.</p>
        <div className="section-title">Model comparison <ProvenanceBadge cls="simulated" /></div>
        <dl className="kv" aria-label="Model comparison">
          <KV k="Baryons only: χ²/N" v={bChi.chi2 / bChi.dof} sig={3} />
          {fit && <>
            <KV k="Baryons + NFW: χ²/(N − 2)" v={fit.chi2 / fit.dof} sig={3} />
            <KV k="Halo V₂₀₀" v={fit.V200} unit="km/s" sig={3} />
            <KV k="Concentration c" v={fit.c} sig={3} />
            <KV k="r₂₀₀ / r_s" v={`${fit.r200.toFixed(0)} kpc / ${fit.rs.toFixed(1)} kpc`} />
            <KV k="Halo mass M₂₀₀" v={`${fmtE(fit.m200)} M☉`} />
          </>}
        </dl>
        {fit?.atEdge && <p className="note warn">The best fit lies on the edge of the allowed range (V₂₀₀ 10–500 km/s, c 1–50): the data do not constrain this halo, so its parameters are not meaningful.</p>}
        <p className="note" style={{ fontSize: 10.5 }}>A good fit shows the NFW form is consistent with the data, not that dark matter has been detected. V₂₀₀, c and Υ are partly degenerate, and the fit uses random errors only.</p>
      </Panel>
    </>
  );
}

function MilkyWayTab() {
  const rows = MW.rotationCurve.rows;
  const R0 = mwParam('R0').value!, Th = mwParam('Theta0').value!, Ms = mwParam('Mstar').value!;
  const rs = Array.from({ length: 120 }, (_, i) => 4 + i * 0.18);
  return (
    <>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>The Milky Way <ProvenanceBadge cls="observed" /></h1>
          <p className="note">Our Galaxy’s circular speed, measured from 23 000 red-giant stars between 5 and 25 kpc from the centre, declines only gently. If the stars’ mass were all the gravitating mass, the speed would fall much faster; the dashed curve shows the extreme case where all of it sits at the centre.</p></div>
        <LinePlot ariaLabel="Milky Way circular velocity curve" width={680} height={380} xDomain={[4, 26]} yDomain={[0, 280]} xLabel="Galactocentric radius R (kpc)" yLabel="circular velocity v_c (km/s)" legend="bl"
          errorBars={rows.map(([R, v, a, b]) => ({ x: R, y: v, lo: a, hi: b, color: '#ffffff', title: `R = ${R} kpc: ${v} −${a} +${b} km/s` }))}
          series={[{ points: rs.map((r) => [r, keplerV(Ms[0], r)] as [number, number]), color: COL.bar, dashed: true, label: `stars only, all at the centre (M⋆ = 5 × 10¹⁰ M☉)` }]}
          markers={[{ x: R0[0], y: Th[0], label: `Θ₀ = ${Th[0]} ± ${Th[1]} km/s at R₀`, color: COL.halo }]}
          vLines={[{ x: R0[0], label: 'Sun', color: '#fff3c4' }]} />
        <p className="note" style={{ fontSize: 10.5 }}>Points: Eilers et al. (2019) Table 1, from the Jeans equation for an axisymmetric Galaxy with R⊙ = 8.122 kpc; the inner 5 kpc is excluded because of the bar <SourceLinks ids={['eilers-2019']} />. Θ₀, R₀ and M⋆: <SourceLinks ids={['bland-hawthorn-gerhard-2016']} />. The dashed Keplerian curve √(GM⋆/R) is an illustration of a lower bound (a point mass, stars only, no gas); it is not a model of the Galaxy.</p>
        <table className="table-mini" aria-label="Milky Way parameters" style={{ width: '100%' }}>
          <thead><tr><th>Quantity</th><th>Value</th><th>Note</th></tr></thead>
          <tbody>{MW.parameters.map((p) => <tr key={p.key}><td>{p.label}</td><td>{p.value ? `${p.value[0] >= 1e5 ? fmtE(p.value[0]) : p.value[0]} ± ${p.value[0] >= 1e5 ? fmtE(p.value[1]) : p.value[1]} ${p.unit}` : p.range ? `${fmtE(p.range[0])} – ${fmtE(p.range[1])} ${p.unit}` : 'unknown'}</td><td style={{ fontSize: 10.5 }}>{p.note}</td></tr>)}</tbody>
        </table>
        <p className="note" style={{ fontSize: 10.5 }}>Best estimates adopted in the review by Bland-Hawthorn &amp; Gerhard <SourceLinks ids={['bland-hawthorn-gerhard-2016']} />. Manually transcribed.</p>
      </div>
      <Panel id="mw-info" className="right-panel" title="Milky Way">
        <h2 style={{ margin: '0 0 2px', fontWeight: 400 }}>Milky Way</h2>
        <dl className="kv" aria-label="Milky Way summary">
          <KV k="v_c at the Sun (Eilers et al.)" v={`${MW.rotationCurve.vcSun[0]} ± ${MW.rotationCurve.vcSun[1]} km/s (systematic ${MW.rotationCurve.vcSunSystematic})`} />
          <KV k="Slope 5–25 kpc" v={`${MW.rotationCurve.slope[0]} ± ${MW.rotationCurve.slope[1]} km/s/kpc`} />
          <KV k="Stellar mass" v={`${fmtE(Ms[0])} M☉`} />
          <KV k="M₂₀₀" v={`${fmtE(mwParam('M200').value![0])} M☉`} />
          <KV k="Ratio M₂₀₀ / M⋆" v={mwParam('M200').value![0] / Ms[0]} sig={2} />
        </dl>
        <p className="note">The total mass inside r₂₀₀ is about twenty times the mass in stars; that difference is what dark-matter models account for.</p>
        <button className="chip" onClick={() => navigate('/cosmic/compact?sel=sgr-a-star')}>Sagittarius A*, the central black hole →</button>
        <RelatedLinks id="galaxy:milky-way" />
      </Panel>
    </>
  );
}

export default function GalaxiesView() {
  const { query } = useRoute();
  const tab: Tab = query.get('tab') === 'mw' ? 'mw' : 'curves';
  const [sparc, setSparc] = useState<Sparc | null>(null);
  useEffect(() => { loadSparc().then(setSparc); }, []);
  return (
    <>
      <nav className="view-switch" aria-label="Galaxy sections">
        <button className={tab === 'curves' ? 'active' : ''} onClick={() => setQuery({ tab: null })}>Rotation curves (SPARC)</button>
        <button className={tab === 'mw' ? 'active' : ''} onClick={() => setQuery({ tab: 'mw' })}>Milky Way</button>
      </nav>
      {tab === 'mw' ? <MilkyWayTab /> : sparc ? <CurvesTab sparc={sparc} /> : <Loading label="Loading SPARC rotation curves" />}
    </>
  );
}
