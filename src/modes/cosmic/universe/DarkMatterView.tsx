/**
 * Dark-matter evidence — #/cosmic/darkmatter?tab=overview|galaxies|lensing|clusters|cosmic
 *   galaxies: &yd=&yb=&q=&g=   lensing: &c=<component>&ml=   clusters: &a=<α>&r=<kpc>   cosmic: &rate=emp
 *
 * Every line of evidence is shown the same way: what was measured (Observed, gold), what the visible
 * matter alone would do under Newtonian gravity (green), and a model that adds dark matter (violet).
 * Data: SPARC and the Milky Way (Gate 6.4), Clowe et al. 2006 (Bullet Cluster), Łokas & Mamon 2003
 * (Coma), Cooke et al. 2018 (BBN) and Planck 2018 (Gates 7.1, 7.3). Gate 7.4.
 */
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { navigate, setQuery, useRoute } from '@/shared/router';
import { enclosedMassFromV2, massDiscrepancy, skyOffsetArcsec } from '@/core/physics/darkMatter';
import { kpcPerArcsec, PLANCK18 } from '@/core/physics/cosmology';
import { KV, Loading, Panel, ProvenanceBadge } from '@/ui/components';
import { LinePlot, ScatterPlot } from '@/ui/plots';
import { RelatedLinks } from '@/ui/RelatedLinks';
import { SourceLinks } from '@/ui/SourcesView';
import { HUBBLE_TYPE, MW, UPSILON_DEFAULT, keplerV, loadSparc, mwParam, vBar2, type Sparc } from '@/modes/cosmic/galaxies/galaxies';
import { CMB } from './cmb';
import {
  BBN, BULLET, COMA, coma, comaDispersion, comaFit, comaTotalVirialRadius, cosmicBudget, outerDiscrepancy, quantile, radialAccelerations, type Quote,
} from './darkmatter';
import { fmtE, logGrid } from './universe';

type Tab = 'overview' | 'galaxies' | 'lensing' | 'clusters' | 'cosmic';
const TABS: [Tab, string][] = [['overview', 'Overview'], ['galaxies', 'Galaxies'], ['lensing', 'Lensing'], ['clusters', 'Clusters'], ['cosmic', 'Cosmic']];
/** obs = measured; vis = visible matter with Newtonian gravity; dm = model with dark matter */
const COL = { obs: '#f5c76b', vis: '#5cf2a6', dm: '#b18cff', gas: '#2fb37a', star: '#b8fadb', pub: '#ffffff', dim: '#9aa4b2' };
const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
const num = (q: URLSearchParams, k: string, d: number, a: number, b: number) => { const v = Number(q.get(k)); return q.has(k) && Number.isFinite(v) ? clamp(v, a, b) : d; };
const fmtM = (m: number) => `${fmtE(m, 2)} M☉`;
const pct = (x: number, d = 1) => `${(100 * x).toFixed(d)} %`;

function Legend() {
  return (
    <p className="dm-legend note" aria-label="Colour key">
      <span><i style={{ background: COL.obs }} /> Observed</span>
      <span><i style={{ background: COL.vis }} /> Visible matter only, Newtonian gravity</span>
      <span><i style={{ background: COL.dm }} /> Model with dark matter</span>
    </p>
  );
}
function Quotes({ quotes, source }: { quotes: Quote[]; source: string }) {
  return <>{quotes.map((q) => <blockquote key={q.text} className="dm-quote">“{q.text}” <span className="f">({q.where})</span> <SourceLinks ids={[source]} /></blockquote>)}</>;
}

// ------------------------------------------------------------------ overview
function OverviewTab() {
  const [sparc, setSparc] = useState<Sparc | null>(null);
  useEffect(() => { loadSparc().then(setSparc); }, []);
  const gal = useMemo(() => {
    if (!sparc) return null;
    const d = sparc.galaxies.filter((g) => g.Q <= 2).map((g) => outerDiscrepancy(sparc.curves[g.name], UPSILON_DEFAULT.disk, UPSILON_DEFAULT.bul)).filter((x): x is number => x !== null);
    return { n: d.length, median: quantile(d, 0.5), p10: quantile(d, 0.1), p90: quantile(d, 0.9) };
  }, [sparc]);
  const mwRow = MW.rotationCurve.rows.reduce((a, b) => (Math.abs(b[0] - 20) < Math.abs(a[0] - 20) ? b : a));
  const Ms = mwParam('Mstar').value!, M200 = mwParam('M200').value!;
  const vKep = keplerV(Ms[0], mwRow[0]);
  const [mb, mp, sb, sp] = BULLET.components;
  const m = coma(0), sig = comaDispersion(0, [1000]);
  const fb = m.baryons(m.rv) / m.total(m.rv);
  const cb = cosmicBudget();
  const rows: { probe: string; tab: Tab; obs: ReactNode; vis: ReactNode; dm: ReactNode; src: string[] }[] = [
    { probe: 'Spiral galaxies (SPARC)', tab: 'galaxies', src: ['lelli-2016-sparc'],
      obs: <>Rotation speeds of {sparc ? sparc.galaxies.length : 175} galaxies out to their last measured radius</>,
      vis: gal ? <>Stars and gas give too little gravity: median V_obs²/V_bar² = <strong>{gal.median.toFixed(1)}</strong> at the outermost point (10–90 %: {gal.p10.toFixed(1)}–{gal.p90.toFixed(1)}; {gal.n} galaxies, quality 1–2, Υ = {UPSILON_DEFAULT.disk}/{UPSILON_DEFAULT.bul})</> : 'loading SPARC…',
      dm: <>An NFW halo fitted per galaxy (Galaxies view); here, how much extra mass the outer speeds need</> },
    { probe: 'Milky Way', tab: 'galaxies', src: ['eilers-2019', 'bland-hawthorn-gerhard-2016'],
      obs: <>v_c = {mwRow[1].toFixed(0)} km/s at R = {mwRow[0]} kpc</>,
      vis: <>Stars only, as a point mass M⋆ = {fmtE(Ms[0], 0)} M☉: √(GM⋆/R) = <strong>{vKep.toFixed(0)} km/s</strong> (illustrative, not a fit; gas not included)</>,
      dm: <>M₂₀₀ = ({(M200[0] / 1e12).toFixed(1)} ± {(M200[1] / 1e12).toFixed(1)}) × 10¹² M☉, {(M200[0] / Ms[0]).toFixed(0)}× the stellar mass</> },
    { probe: 'Bullet Cluster (lensing)', tab: 'lensing', src: [BULLET.source],
      obs: <>Lensing κ̄ = {sb.kappa[0].toFixed(2)} at the subcluster galaxies, {sp.kappa[0].toFixed(2)} at its X-ray gas (κ ∝ surface mass in Newtonian gravity)</>,
      vis: <>The gas outweighs the galaxies: {(sp.MX[0] + sp.Mstar[0]).toFixed(1)} against {(sb.MX[0] + sb.Mstar[0]).toFixed(1)} × 10¹² M☉ (main cluster {(mp.MX[0] + mp.Mstar[0]).toFixed(1)} against {(mb.MX[0] + mb.Mstar[0]).toFixed(1)}), so κ should peak on the gas</>,
      dm: <>Collisionless dark matter stays with the galaxies; the mass peaks are offset from the gas at {BULLET.offsetSignificance} (quoted)</> },
    { probe: 'Coma cluster (galaxy speeds)', tab: 'clusters', src: [COMA.source],
      obs: <>Velocities of {COMA.sample.es0} early-type member galaxies (dispersion profile published as a figure)</>,
      vis: <>Stars + gas would hold galaxies moving at σ_los ≈ <strong>{sig.baryons[0].toFixed(0)} km/s</strong> at 1 Mpc</>,
      dm: <>The fitted model gives {sig.total[0].toFixed(0)} km/s there; baryons are {pct(fb, 0)} of the mass inside r_v</> },
    { probe: 'Cosmic census (BBN + CMB)', tab: 'cosmic', src: [BBN.source, 'planck-2018-vi'],
      obs: <>Primordial deuterium D/H = ({BBN.dh.value} ± {BBN.dh.sigma}) × 10⁻⁵ and the Planck CMB power spectra</>,
      vis: <>Baryons from BBN: Ω_b h² = {cb.bbn.value.toFixed(5)}</>,
      dm: <>Base ΛCDM fitted to Planck: Ω_m h² = {cb.planck.omh2.value}, so baryons are {pct(cb.baryonFractionBbn)} of the matter (BBN baryons / Planck matter)</> },
  ];
  return (
    <>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Evidence for dark matter <ProvenanceBadge cls="observed" title="observations, with the visible-matter expectation and the dark-matter model kept apart" /></h1>
          <p className="note">“{BULLET.quotes.find((q) => q.text.startsWith('We have known since 1937'))!.text}” <SourceLinks ids={[BULLET.source]} /> Each row puts a measurement beside what the visible matter (stars and gas) would do under Newtonian gravity, and beside a model that adds unseen matter. Open a row to see the data.</p></div>
        <Legend />
        <div className="table-scroll">
          <table className="table-mini dm-table" aria-label="Lines of evidence">
            <thead><tr><th>Probe</th><th style={{ color: COL.obs }}>Observed</th><th style={{ color: COL.vis }}>Visible matter only</th><th style={{ color: COL.dm }}>With dark matter</th><th /></tr></thead>
            <tbody>{rows.map((r) => <tr key={r.probe}>
              <td><strong>{r.probe}</strong> <SourceLinks ids={r.src} /></td><td>{r.obs}</td><td>{r.vis}</td><td>{r.dm}</td>
              <td><button className="chip" onClick={() => setQuery({ tab: r.tab })} aria-label={`Open ${r.probe}`}>Open →</button></td></tr>)}</tbody>
          </table>
        </div>
        <p className="note" style={{ fontSize: 10.5 }}>Green and violet entries are computed here from the bundled data <ProvenanceBadge cls="derived" title="computed in this view" />, except where marked quoted. The Milky Way stellar mass and M₂₀₀ are Bland-Hawthorn &amp; Gerhard (2016) best estimates; v_c is Eilers et al. (2019) Table 1. The Coma speeds come from the Jeans equation applied to Łokas &amp; Mamon’s published mass model.</p>
      </div>
      <Panel id="dm-ov-controls" className="left-panel" title="Lines of evidence">
        {rows.map((r) => <button key={r.probe} className="chip" style={{ display: 'block', width: '100%', textAlign: 'left', marginBottom: 4 }} onClick={() => setQuery({ tab: r.tab })}>{r.probe} →</button>)}
        <div className="section-title">Underlying tools</div>
        <div className="chip-row" style={{ flexWrap: 'wrap', gap: 4 }}>
          <button className="chip" onClick={() => navigate('/cosmic/galaxies')}>Rotation curves →</button>
          <button className="chip" onClick={() => navigate('/cosmic/lensing')}>Lensing →</button>
          <button className="chip" onClick={() => navigate('/cosmic/cmb?tab=power')}>CMB power spectrum →</button>
        </div>
      </Panel>
      <Panel id="dm-ov-info" className="right-panel" title="Reading the evidence">
        <dl className="kv" aria-label="Provenance classes">
          <KV k={<><ProvenanceBadge cls="observed" /> Observed</>} v="measured and published" />
          <KV k={<><ProvenanceBadge cls="derived" /> Derived</>} v="computed here from published inputs" />
          <KV k={<><ProvenanceBadge cls="simulated" /> Model</>} v="a fit with stated assumptions" />
        </dl>
        <p className="note" style={{ fontSize: 10.5 }}>The visible-matter column assumes Newtonian gravity throughout. Clowe et al. on what the Bullet Cluster does and does not settle: “{BULLET.quotes.find((q) => q.text.startsWith('While the existence'))!.text}” <SourceLinks ids={[BULLET.source]} /></p>
        <p className="note warn" style={{ fontSize: 10.5 }}>Modified-gravity fits (MOND, the radial acceleration relation) are not modelled here; a comparison is planned for Phase 14.6. No dark-matter particle has been detected in a laboratory; nothing in this view identifies what dark matter is.</p>
        <RelatedLinks id="context:dark-matter" />
      </Panel>
    </>
  );
}

// ------------------------------------------------------------------ galaxies
function GalaxiesTab({ sparc }: { sparc: Sparc }) {
  const { query } = useRoute();
  const yd = num(query, 'yd', UPSILON_DEFAULT.disk, 0.1, 1.5), yb = num(query, 'yb', UPSILON_DEFAULT.bul, 0.1, 2);
  const maxQ = Math.round(num(query, 'q', 3, 1, 3));
  const name = sparc.curves[query.get('g') ?? ''] ? query.get('g')! : 'NGC3198';
  const pts = useMemo(() => radialAccelerations(sparc, yd, yb, maxQ), [sparc, yd, yb, maxQ]);
  const above = pts.filter((p) => p.gObs > p.gBar).length;
  const outer = useMemo(() => sparc.galaxies.filter((g) => g.Q <= maxQ).map((g) => outerDiscrepancy(sparc.curves[g.name], yd, yb)).filter((x): x is number => x !== null), [sparc, yd, yb, maxQ]);
  const g = sparc.galaxies.find((x) => x.name === name)!;
  const curve = sparc.curves[name];
  const disc = curve.map((p) => { const b2 = vBar2(p, yd, yb); const d = massDiscrepancy(p[1], b2); return { R: p[0], d, err: d === null ? 0 : (2 * p[1] * p[2]) / b2 }; }).filter((x) => x.d !== null) as { R: number; d: number; err: number }[];
  const last = curve[curve.length - 1], lastB2 = vBar2(last, yd, yb);
  const names = sparc.galaxies.filter((x) => x.Q <= maxQ).map((x) => x.name);
  const line: [number, number][] = [[1e-13, 1e-13], [1e-7, 1e-7]];
  return (
    <>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Galaxies: more gravity than the visible matter supplies <ProvenanceBadge cls="derived" title="accelerations computed from SPARC Table 2" /></h1>
          <p className="note">At every measured radius, the acceleration that keeps gas and stars in orbit, g_obs = V_obs²/R, against the Newtonian acceleration of the stars and gas, g_bar = V_bar²/R, from SPARC’s mass models <SourceLinks ids={['lelli-2016-sparc']} />. If the visible matter were all there is, the points would lie on the green line.</p></div>
        <Legend />
        <ScatterPlot ariaLabel="Observed against baryonic acceleration for SPARC galaxies" width={680} height={400} xLog yLog xDomain={[1e-12, 1e-8]} yDomain={[1e-12, 1e-8]}
          xLabel="baryonic (Newtonian) acceleration g_bar (m/s²)" yLabel="observed acceleration g_obs (m/s²)"
          lines={[{ points: line, color: COL.vis, width: 1.6, label: 'visible matter only: g_obs = g_bar' }]}
          points={pts.map((p, i) => ({ key: `${p.name}-${i}`, x: p.gBar, y: p.gObs, color: p.name === name ? '#ffffff' : COL.obs, r: p.name === name ? 2.6 : 1.3, title: `${p.name}, R = ${p.R} kpc` }))} />
        <p className="note" style={{ fontSize: 10.5 }}>{pts.length} radii in {new Set(pts.map((p) => p.name)).size} galaxies (quality ≤ {maxQ}; radii where V_bar² ≤ 0 are left out). White: {name}. No relation is fitted to these points. Υ_disk = {yd.toFixed(2)}, Υ_bul = {yb.toFixed(2)} M☉/L☉ at 3.6 µm.</p>
        <LinePlot ariaLabel="Mass discrepancy along the selected rotation curve" width={680} height={220} xDomain={[0, last[0] * 1.05]} yDomain={[0, Math.max(4, ...disc.map((x) => x.d + x.err)) * 1.05]} xLabel="radius R (kpc)" yLabel="V_obs² / V_bar²"
          series={[{ points: [[0, 1], [last[0] * 1.05, 1]], color: COL.vis, width: 1.4, label: 'visible matter only (= 1)' }]} legend="tl"
          errorBars={disc.map((x) => ({ x: x.R, y: x.d, lo: x.err, hi: x.err, color: COL.obs, title: `R = ${x.R} kpc: ${x.d.toFixed(2)} ± ${x.err.toFixed(2)}` }))} />
        <p className="note" style={{ fontSize: 10.5 }}>{name}: the ratio of the gravity measured to the gravity of the visible matter along the curve; error bars propagate SPARC’s random errors on V_obs only (2V_obs e_V / V_bar²).</p>
      </div>
      <Panel id="dm-gal-controls" className="left-panel" title="SPARC sample">
        <label className="slider-row"><span>galaxy</span><select value={name} onChange={(e) => setQuery({ g: e.target.value })} aria-label="Galaxy">{names.includes(name) ? null : <option value={name}>{name}</option>}{names.map((n) => <option key={n} value={n}>{n}</option>)}</select></label>
        <label className="slider-row"><span>quality ≤</span><select value={maxQ} onChange={(e) => setQuery({ q: e.target.value === '3' ? null : e.target.value })} aria-label="Maximum quality flag"><option value={1}>1 (high)</option><option value={2}>2 (medium)</option><option value={3}>3 (all)</option></select></label>
        <label className="slider-row"><span>Υ disc</span><input type="range" min={0.1} max={1.5} step={0.05} value={yd} onChange={(e) => setQuery({ yd: e.target.value })} aria-label="Disc mass-to-light ratio" /><span>{yd.toFixed(2)}</span></label>
        <label className="slider-row"><span>Υ bulge</span><input type="range" min={0.1} max={2} step={0.05} value={yb} onChange={(e) => setQuery({ yb: e.target.value })} aria-label="Bulge mass-to-light ratio" /><span>{yb.toFixed(2)}</span></label>
        <p className="note" style={{ fontSize: 10.5 }}>A heavier stellar population (higher Υ) moves points toward the line but cannot remove the excess at low acceleration, where gas dominates. SPARC’s reference values are Υ_disk = 0.5 and Υ_bul = 0.7 <SourceLinks ids={['lelli-2016-sparc']} />.</p>
        <button className="chip" onClick={() => navigate(`/cosmic/galaxies?g=${name}${query.has('yd') ? `&yd=${yd}` : ''}${query.has('yb') ? `&yb=${yb}` : ''}`)}>Rotation curve and NFW fit of {name} →</button>
      </Panel>
      <Panel id="dm-gal-info" className="right-panel" title="Missing mass">
        <dl className="kv" aria-label="Sample statistics">
          <KV k="Radii with g_obs > g_bar" v={`${above} of ${pts.length} (${pct(above / pts.length)})`} />
          <KV k="V_obs²/V_bar² at the last radius, median" v={quantile(outer, 0.5)} sig={3} />
          <KV k="… 10th–90th percentile" v={`${quantile(outer, 0.1).toFixed(2)} – ${quantile(outer, 0.9).toFixed(2)}`} />
          <KV k="Galaxies" v={outer.length} />
        </dl>
        <div className="section-title">{name} ({HUBBLE_TYPE[g.T]}, Q{g.Q}, D = {g.D} Mpc)</div>
        <dl className="kv" aria-label="Selected galaxy">
          <KV k="Last measured radius" v={`${last[0]} kpc`} />
          <KV k="V_obs there" v={`${last[1]} ± ${last[2]} km/s`} />
          <KV k="V_bar there (visible matter)" v={`${Math.sqrt(Math.max(0, lastB2)).toFixed(1)} km/s`} />
          <KV k="V_obs² / V_bar²" v={massDiscrepancy(last[1], lastB2)} sig={3} />
          <KV k="Mass implied by V_obs, V²R/G" v={fmtM(enclosedMassFromV2(last[1] ** 2, last[0]))} title="spherical approximation" />
          <KV k="Visible mass implied, V_bar²R/G" v={lastB2 > 0 ? fmtM(enclosedMassFromV2(lastB2, last[0])) : '—'} title="spherical approximation" />
        </dl>
        <p className="note" style={{ fontSize: 10.5 }}>V²R/G is the mass a spherical distribution needs; for a thin disc the factor differs by order unity, so read the two masses as a ratio, which equals V_obs²/V_bar² <ProvenanceBadge cls="derived" title="computed here" />.</p>
        <RelatedLinks id="context:dark-matter" />
      </Panel>
    </>
  );
}

// ------------------------------------------------------------------ lensing: the Bullet Cluster
const north0 = (pos: { c: { id: string }; north: number }[]) => pos.find((p) => p.c.id === 'sub-bcg')!.north;
function BulletMap({ sel, ml }: { sel: string; ml: number }) {
  const base = BULLET.components[0];
  const pos = BULLET.components.map((c) => ({ c, ...skyOffsetArcsec(base, c) }));
  const peak = BULLET.peaks.find((p) => p.from)!;
  const from = pos.find((p) => p.c.id === peak.from)!;
  const pk = { east: from.east + peak.east!, north: from.north + peak.north! };
  const W = 680, H = 300, cx = W / 2, cy = H / 2 + 20, s = 2.2; // px per arcsec
  const midE = (Math.min(...pos.map((p) => p.east)) + Math.max(...pos.map((p) => p.east))) / 2, midN = 15;
  const X = (e: number) => cx - (e - midE) * s, Y = (n: number) => cy - (n - midN) * s;
  const rAp = BULLET.apertureKpc / BULLET.cosmology.kpcPerArcsec;
  const bar = 200 / BULLET.cosmology.kpcPerArcsec;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="plot" role="img" aria-label="Bullet Cluster aperture positions">
      <rect x={0} y={0} width={W} height={H} fill="rgba(255,255,255,0.02)" stroke="var(--line)" />
      {pos.map(({ c, east, north }) => {
        const plasma = c.id.endsWith('plasma'), col = plasma ? COL.gas : COL.star, active = c.id === sel;
        const bary = c.MX[0] + c.Mstar[0] * (ml / BULLET.stellarMassToLight.value);
        return <g key={c.id} onClick={() => setQuery({ c: c.id })} style={{ cursor: 'pointer' }}>
          <circle cx={X(east)} cy={Y(north)} r={rAp * s} fill={col} fillOpacity={active ? 0.22 : 0.1} stroke={col} strokeWidth={active ? 2 : 1} />
          <circle cx={X(east)} cy={Y(north)} r={2} fill={col} />
          <text x={X(east)} y={Y(north) - rAp * s - 18} textAnchor="middle" style={{ fill: col }}>{c.label}</text>
          <text x={X(east)} y={Y(north) - rAp * s - 6} textAnchor="middle" style={{ fill: 'var(--text)' }}>baryons {bary.toFixed(1)} · κ̄ {c.kappa[0].toFixed(2)}</text>
          <title>{`${c.label}: RA ${c.ra}, Dec ${c.dec}; M_X = ${c.MX[0]} ± ${c.MX[1]}, M∗ = ${c.Mstar[0]} ± ${c.Mstar[1]} (× 10¹² M☉); κ̄ = ${c.kappa[0]} ± ${c.kappa[1]}`}</title>
        </g>;
      })}
      <g aria-label="Subcluster lensing peak">
        <line x1={X(pk.east) - 7} x2={X(pk.east) + 7} y1={Y(pk.north)} y2={Y(pk.north)} stroke={COL.obs} strokeWidth={2.5} />
        <line x1={X(pk.east)} x2={X(pk.east)} y1={Y(pk.north) - 7} y2={Y(pk.north) + 7} stroke={COL.obs} strokeWidth={2.5} />
        <text x={X(pk.east)} y={Y(north0(pos)) + rAp * s + 16} textAnchor="middle" style={{ fill: COL.obs }}>+ lensing peak ({peak.significance})</text>
      </g>
      <g transform={`translate(${W - 20 - bar * s} ${H - 18})`}><line x1={0} x2={bar * s} y1={0} y2={0} stroke="var(--text)" strokeWidth={2} /><text x={bar * s / 2} y={-5} textAnchor="middle">200 kpc ({bar.toFixed(1)}″)</text></g>
      <g transform={`translate(28 ${H - 20})`}><line x1={0} x2={0} y1={0} y2={-24} stroke="var(--text)" /><text x={0} y={-28} textAnchor="middle">N</text><line x1={0} x2={-0} y1={0} y2={0} /><line x1={0} x2={22} y1={0} y2={0} stroke="var(--text)" /><text x={30} y={4}>W</text></g>
      <text x={10} y={16} style={{ fill: 'var(--text-dim)' }}>positions from Table 2 (schematic, not an image); east is to the left</text>
    </svg>
  );
}

function LensingTab() {
  const { query } = useRoute();
  const comps = BULLET.components;
  const sel = comps.find((c) => c.id === query.get('c')) ?? comps[2];
  const ml = num(query, 'ml', BULLET.stellarMassToLight.value, 0.5, 3);
  const scaleM = ml / BULLET.stellarMassToLight.value;
  const bary = (c: typeof sel) => c.MX[0] + c.Mstar[0] * scaleM;
  const maxB = Math.max(...comps.map(bary)), maxK = Math.max(...comps.map((c) => c.kappa[0] + c.kappa[1]));
  const ratio = (a: string, b: string) => { const A = comps.find((c) => c.id === a)!, B = comps.find((c) => c.id === b)!; return { bary: bary(A) / bary(B), kappa: A.kappa[0] / B.kappa[0] }; };
  const sub = ratio('sub-plasma', 'sub-bcg'), main = ratio('main-plasma', 'main-bcg');
  const sep = skyOffsetArcsec(comps[0], comps[2]);
  const sepKpc = Math.hypot(sep.east, sep.north) * BULLET.cosmology.kpcPerArcsec;
  const ours = kpcPerArcsec(BULLET.z, { name: 'Clowe et al.', H0: BULLET.cosmology.H0, Om: BULLET.cosmology.Om, Ode: BULLET.cosmology.Ode });
  const planck = kpcPerArcsec(BULLET.z, PLANCK18);
  const q = (start: string) => BULLET.quotes.find((x) => x.text.startsWith(start))!;
  return (
    <>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Lensing: the Bullet Cluster <ProvenanceBadge cls="observed" title="Clowe et al. (2006) Table 2" /></h1>
          <p className="note">Two galaxy clusters collided about {BULLET.merger.passageMyr} Myr ago. The galaxies passed through each other; the hot X-ray gas, which holds most of the visible mass, was slowed and left behind. “{q('In the absence of dark matter').text}” <SourceLinks ids={[BULLET.source]} /></p></div>
        <Legend />
        <BulletMap sel={sel.id} ml={ml} />
        <p className="note" style={{ fontSize: 10.5 }}>Circles: the four 100 kpc apertures of Table 2 (radius {(BULLET.apertureKpc / BULLET.cosmology.kpcPerArcsec).toFixed(1)}″ at {BULLET.cosmology.kpcPerArcsec} kpc/″), light green at the brightest cluster galaxies (BCGs), dark green at the X-ray gas peaks. Baryons = M_X + M∗ in 10¹² M☉. Gold cross: the subcluster’s lensing (κ) peak, an observation, {BULLET.peaks[0].note}. The main-cluster peak is not drawn: {BULLET.peaks[1].note.split('; ')[1]} <SourceLinks ids={[BULLET.source]} /></p>
        <div className="dm-bars" role="table" aria-label="Visible mass against lensing in each aperture">
          <div role="row" className="dm-bars-head"><span role="columnheader">Aperture</span><span role="columnheader" style={{ color: COL.vis }}>Visible mass: gas + stars (10¹² M☉)</span><span role="columnheader" style={{ color: COL.obs }}>Lensing κ̄ (∝ total mass)</span></div>
          {comps.map((c) => <div role="row" key={c.id} className={c.id === sel.id ? 'active' : ''} onClick={() => setQuery({ c: c.id })}>
            <span role="cell">{c.label}</span>
            <span role="cell"><i className="bar" style={{ width: `${(c.MX[0] / maxB) * 100}%`, background: COL.gas }} title={`gas M_X = ${c.MX[0]} ± ${c.MX[1]}`} /><i className="bar" style={{ width: `${(c.Mstar[0] * scaleM / maxB) * 100}%`, background: COL.star }} title={`stars M∗ = ${(c.Mstar[0] * scaleM).toFixed(2)}`} /><b>{bary(c).toFixed(2)}</b></span>
            <span role="cell"><i className="bar" style={{ width: `${(Math.max(0, c.kappa[0]) / maxK) * 100}%`, background: COL.obs }} /><b>{c.kappa[0].toFixed(2)} ± {c.kappa[1].toFixed(2)}</b></span>
          </div>)}
        </div>
        <p className="note" style={{ fontSize: 10.5 }}>Dark green: X-ray gas (plasma) mass; light green: stellar mass at M/L_I = {ml.toFixed(1)}{scaleM !== 1 ? ` (Table 2 uses ${BULLET.stellarMassToLight.value}; rescaled here)` : ''}. {BULLET.tableNote} Errors: {BULLET.interval}. “{q('Note that both').text}” <SourceLinks ids={[BULLET.source]} /></p>
      </div>
      <Panel id="dm-lens-controls" className="left-panel" title="Apertures">
        {comps.map((c) => <label key={c.id} className="toggle-row"><span>{c.label}</span><input type="radio" name="dm-ap" checked={c.id === sel.id} onChange={() => setQuery({ c: c.id })} aria-label={c.label} /></label>)}
        <div className="section-title">Stellar mass-to-light ratio</div>
        <label className="slider-row"><span>M/L_I</span><input type="range" min={0.5} max={3} step={0.1} value={ml} onChange={(e) => setQuery({ ml: e.target.value === '2' ? null : e.target.value })} aria-label="Stellar mass-to-light ratio" /><span>{ml.toFixed(1)}</span></label>
        <p className="note" style={{ fontSize: 10.5 }}>“{q('The assumed mass-to-light').text}” <SourceLinks ids={[BULLET.source]} /></p>
        <button className="chip" onClick={() => navigate('/cosmic/lensing')}>How lensing works: the point-lens view →</button>
      </Panel>
      <Panel id="dm-lens-info" className="right-panel" title={sel.label}>
        <dl className="kv" aria-label="Selected aperture">
          <KV k="Position (J2000)" v={`${sel.ra}, ${sel.dec}`} />
          <KV k="X-ray gas M_X" v={`${sel.MX[0]} ± ${sel.MX[1]} × 10¹² M☉`} />
          <KV k={`Stars M∗ (M/L_I = ${ml.toFixed(1)})`} v={`${(sel.Mstar[0] * scaleM).toFixed(2)} × 10¹² M☉`} />
          <KV k="Mean convergence κ̄" v={`${sel.kappa[0].toFixed(2)} ± ${sel.kappa[1].toFixed(2)}`} />
        </dl>
        <div className="section-title">Where the mass is <ProvenanceBadge cls="derived" title="ratios computed here from Table 2" /></div>
        <dl className="kv" aria-label="Gas against galaxies">
          <KV k="Subcluster: visible mass, gas / galaxies" v={`${sub.bary.toFixed(2)}×`} />
          <KV k="Subcluster: lensing κ̄, gas / galaxies" v={`${sub.kappa.toFixed(2)}×`} />
          <KV k="Main cluster: visible mass, gas / galaxies" v={`${main.bary.toFixed(2)}×`} />
          <KV k="Main cluster: lensing κ̄, gas / galaxies" v={`${main.kappa.toFixed(2)}×`} />
          <KV k="Gas share of κ (main, sub; quoted)" v={BULLET.plasmaKappaShare.map((p) => `${p.value} +${p.plus}/−${p.minus} %`).join(', ')} />
        </dl>
        <p className="note" style={{ fontSize: 10.5 }}>The visible mass is larger at the gas, but lensing is weaker there. The gas κ̄ are what is left after subtracting profiles centred on the galaxies, and κ in the peaks is a lower bound: “{q('This method does').text}” <SourceLinks ids={[BULLET.source]} /></p>
        <div className="section-title">Distances</div>
        <dl className="kv" aria-label="Bullet Cluster distances">
          <KV k={`kpc per arcsec at z = ${BULLET.z} (paper)`} v={BULLET.cosmology.kpcPerArcsec} />
          <KV k="… recomputed (H₀ = 70, Ω_m = 0.3, Ω_Λ = 0.7)" v={ours.toFixed(4)} />
          <KV k="… with Planck 2018" v={planck.toFixed(3)} />
          <KV k="Main BCG to subcluster BCG" v={`${sepKpc.toFixed(0)} kpc`} title={`stated: ${BULLET.merger.separationMpc} Mpc`} />
        </dl>
        <p className="note" style={{ fontSize: 10.5 }}>Distances from the Expansion model <SourceLinks ids={['hogg-1999']} />; absolute masses scale with the cosmology, the ratios do not. {BULLET.merger.note} <SourceLinks ids={[BULLET.source]} /></p>
        <Quotes quotes={[q('An 8σ significance')]} source={BULLET.source} />
        <RelatedLinks id="context:dark-matter" />
      </Panel>
    </>
  );
}

// ------------------------------------------------------------------ clusters: Coma
function ClustersTab() {
  const { query } = useRoute();
  const alpha = [0, 0.5, 1, 1.5].includes(Number(query.get('a'))) ? Number(query.get('a')) : 0;
  const fit = comaFit(alpha), m = coma(alpha);
  const rTot = useMemo(() => comaTotalVirialRadius(m), [m]);
  const r = num(query, 'r', 1000, 30, 4000);
  const rs = useMemo(() => logGrid(30, 4000, 90), []);
  const Rs = useMemo(() => logGrid(30, COMA.sample.innerRadiusArcmin * m.kpcPerArcmin, 40), [m]);
  const disp = useMemo(() => comaDispersion(alpha, Rs), [alpha, Rs]);
  const atR = useMemo(() => comaDispersion(alpha, [r]), [alpha, r]);
  const cb = cosmicBudget();
  const P = COMA.published;
  const ser = (f: (x: number) => number) => rs.map((x) => [x / 1000, f(x)] as [number, number]);
  const fbAt = (x: number) => m.baryons(x) / m.total(x);
  return (
    <>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Clusters: the Coma cluster <ProvenanceBadge cls="simulated" title="Łokas & Mamon (2003) mass model, fitted to galaxy velocities" /></h1>
          <p className="note">Galaxies in a cluster move too fast to be held by the cluster’s stars and hot gas. Łokas &amp; Mamon modelled the velocities of {COMA.sample.es0} early-type galaxies in Coma with the Jeans equation, using stars (from the galaxies’ light), X-ray gas and a dark-matter halo. “{COMA.quotes[0].text}” <SourceLinks ids={[COMA.source]} /></p></div>
        <Legend />
        <LinePlot ariaLabel="Coma enclosed mass by component" width={680} height={300} xLog yLog xDomain={[0.03, 4]} yDomain={[1e11, 3e15]} xLabel="radius r (Mpc, log)" yLabel="mass inside r (M☉, log)" legend="br"
          series={[
            { points: ser(m.stars), color: COL.star, dashed: true, width: 1.2, label: 'stars (light × Υ)' },
            { points: ser(m.gas), color: COL.gas, dashed: true, width: 1.2, label: 'X-ray gas' },
            { points: ser(m.baryons), color: COL.vis, width: 1.8, label: 'visible matter: stars + gas' },
            { points: ser(m.dark), color: COL.dm, dashed: true, width: 1.2, label: `dark matter (α = ${alpha}, c = ${fit.c})` },
            { points: ser(m.total), color: COL.dm, width: 1.8, label: 'total (model)' },
          ]}
          vLines={[{ x: m.rv / 1000, label: 'r_v (dark)', color: COL.dim }, { x: r / 1000, label: `r = ${(r / 1000).toFixed(2)} Mpc`, color: '#ffffff' }]}
          errorBars={[{ x: P.M36.at, y: P.M36.value, lo: P.M36.sigma, hi: P.M36.sigma, color: COL.pub, title: `published: (${P.M36.value / 1e15} ± ${P.M36.sigma / 1e15}) × 10¹⁵ M☉ within ${P.M36.at} Mpc (extrapolated)` }]} />
        <p className="note" style={{ fontSize: 10.5 }}>Stars: the fitted luminosity profile of all member galaxies × Υ_G = {COMA.stars.upsilon} M☉/L☉ (blue band). Gas: the isothermal β-model fitted to ROSAT images (Briel, Henry &amp; Böhringer 1992). Dark matter: Table 1 fit with α = {alpha}. White point: the published mass inside 3.6 Mpc, extrapolated by the authors <SourceLinks ids={[COMA.source]} />. Recomputed here from their equations <ProvenanceBadge cls="derived" title="eqs. 2, 5 and 12 evaluated in this view" />.</p>
        <LinePlot ariaLabel="Coma line-of-sight velocity dispersion: visible matter against the full model" width={680} height={240} xDomain={[0, Rs[Rs.length - 1] / 1000]} yDomain={[0, 1300]} xLabel="projected radius R (Mpc)" yLabel="σ_los (km/s)" legend="br"
          series={[
            { points: Rs.map((R, i) => [R / 1000, disp.total[i]] as [number, number]), color: COL.dm, width: 1.8, label: 'stars + gas + dark matter (model)' },
            { points: Rs.map((R, i) => [R / 1000, disp.baryons[i]] as [number, number]), color: COL.vis, width: 1.8, label: 'stars + gas only' },
          ]} vLines={[{ x: r / 1000, label: '', color: '#ffffff' }]} />
        <p className="note" style={{ fontSize: 10.5 }}>Line-of-sight velocity dispersion of the early-type galaxies predicted by the spherical Jeans equation (eqs. 15–16, constant β = {fit.beta}) out to {COMA.sample.innerRadiusArcmin}′ <ProvenanceBadge cls="derived" title="Jeans equation solved here" />. The measured profile ({COMA.sample.innerBins} bins of {COMA.sample.perBin} galaxies, ±{COMA.sample.sigmaError * 100} % each) is published only as a figure and is not bundled; the authors write: “{COMA.quotes[2].text}” <SourceLinks ids={[COMA.source]} /></p>
      </div>
      <Panel id="dm-coma-controls" className="left-panel" title="Coma model">
        <label className="slider-row"><span>r (Mpc)</span><input type="range" min={Math.log10(30)} max={Math.log10(4000)} step={0.005} value={Math.log10(r)} onChange={(e) => setQuery({ r: String(Math.round(10 ** Number(e.target.value))) })} aria-label="Radius" /><span>{(r / 1000).toFixed(2)}</span></label>
        <div className="chip-row" style={{ flexWrap: 'wrap', gap: 4 }}>
          <button className={`chip ${Math.abs(r - m.rv) < 5 ? 'active' : ''}`} onClick={() => setQuery({ r: String(Math.round(m.rv)) })}>r_v (dark)</button>
          <button className={`chip ${Math.abs(r - rTot) < 5 ? 'active' : ''}`} onClick={() => setQuery({ r: String(Math.round(rTot)) })}>r_v (total)</button>
          <button className={`chip ${r === 3600 ? 'active' : ''}`} onClick={() => setQuery({ r: '3600' })}>3.6 Mpc</button>
        </div>
        <div className="section-title">Inner slope of the dark matter (Table 1)</div>
        <table className="table-mini" aria-label="Coma model fits" style={{ width: '100%' }}>
          <thead><tr><th>α</th><th>c</th><th>β</th><th>χ²</th></tr></thead>
          <tbody>{COMA.dark.fits.map((f) => <tr key={f.alpha} className={f.alpha === alpha ? 'active' : ''} onClick={() => setQuery({ a: f.alpha === 0 ? null : String(f.alpha) })} style={{ cursor: 'pointer' }}><td>{f.alpha}</td><td>{f.c}</td><td>{f.beta}</td><td>{f.chi2}</td></tr>)}</tbody>
        </table>
        <div className="chip-row" style={{ flexWrap: 'wrap', gap: 4 }}>
          {COMA.dark.fits.map((f) => <button key={f.alpha} className={`chip ${f.alpha === alpha ? 'active' : ''}`} onClick={() => setQuery({ a: f.alpha === 0 ? null : String(f.alpha) })}>α = {f.alpha}</button>)}
        </div>
        <p className="note" style={{ fontSize: 10.5 }}>{COMA.dark.fitsNote}. M_v = {COMA.dark.Mv.value} ± {COMA.dark.Mv.sigma} × 10¹⁵ M☉ ({COMA.dark.Mv.interval}). α = 1 is the NFW profile. The fits are nearly equally good: the data do not fix the inner slope <SourceLinks ids={[COMA.source]} />.</p>
      </Panel>
      <Panel id="dm-coma-info" className="right-panel" title={`Inside r = ${(r / 1000).toFixed(2)} Mpc`}>
        <dl className="kv" aria-label="Coma mass inside the chosen radius">
          <KV k="Stars" v={fmtM(m.stars(r))} />
          <KV k="X-ray gas" v={fmtM(m.gas(r))} />
          <KV k="Dark matter (model)" v={fmtM(m.dark(r))} />
          <KV k="Total" v={fmtM(m.total(r))} />
          <KV k="Baryon fraction (stars + gas)" v={pct(fbAt(r))} />
          <KV k="Mass-to-light ratio M/L_B" v={`${(m.total(r) / m.light(r)).toFixed(0)} M☉/L☉`} />
          <KV k="σ_los at R = r, full model" v={`${atR.total[0].toFixed(0)} km/s`} />
          <KV k="σ_los at R = r, stars + gas only" v={`${atR.baryons[0].toFixed(0)} km/s`} />
        </dl>
        <div className="section-title">Recomputed against the paper</div>
        <table className="table-mini" aria-label="Coma model against published values" style={{ width: '100%' }}>
          <thead><tr><th>Quantity</th><th>Here</th><th>Paper</th></tr></thead>
          <tbody>
            <tr><td>r_v (dark)</td><td>{(m.rv / 1000).toFixed(2)} Mpc</td><td>{P.rvDarkMpc} Mpc ({P.rvDarkArcmin}′)</td></tr>
            <tr><td>total mass at r_v</td><td>{fmtE(m.total(m.rv), 2)}</td><td>{fmtE(P.Mtot.value, 1)} ({P.Mtot.accuracy})</td></tr>
            <tr><td>galaxies / gas / dark</td><td>{pct(m.stars(m.rv) / m.total(m.rv), 1)} / {pct(m.gas(m.rv) / m.total(m.rv), 1)} / {pct(m.dark(m.rv) / m.total(m.rv), 1)}</td><td>{P.fractions.galaxies} / {P.fractions.gas} / {P.fractions.dark} %</td></tr>
            <tr><td>r_v (total)</td><td>{(rTot / 1000).toFixed(2)} Mpc</td><td>{P.rvTotalMpc} Mpc ({P.rvTotalArcmin}′)</td></tr>
            <tr><td>M/L_B at 2.9 Mpc</td><td>{(m.total(2900) / m.light(2900)).toFixed(0)}</td><td>≈ {P.MtoL.value}</td></tr>
            <tr><td>mass inside 3.6 Mpc</td><td>{fmtE(m.total(3600), 2)}</td><td>({P.M36.value / 1e15} ± {P.M36.sigma / 1e15}) × 10¹⁵</td></tr>
          </tbody>
        </table>
        <p className="note" style={{ fontSize: 10.5 }}>Cosmic baryon fraction for comparison: Ω_b/Ω_m = {pct(cb.baryonFractionPlanck)} (Planck 2018) <SourceLinks ids={['planck-2018-vi']} />. H₀ = {COMA.H0}; distance {COMA.distanceMpc} Mpc, 1′ = {m.kpcPerArcmin.toFixed(2)} kpc. “{COMA.quotes[3].text}” <SourceLinks ids={[COMA.source]} /></p>
        <RelatedLinks id="context:dark-matter" />
      </Panel>
    </>
  );
}

// ------------------------------------------------------------------ cosmic census
function CosmicTab() {
  const { query } = useRoute();
  const emp = query.get('rate') === 'emp';
  const cb = cosmicBudget();
  const bbnRec = emp ? BBN.ombh2Empirical : BBN.ombh2;
  const bbn = bbnRec.value / bbnRec.scale, bbnSig = Math.hypot(bbnRec.measurement, bbnRec.theory) / bbnRec.scale;
  const { ombh2: b, omch2: c, omh2: mm } = cb.planck;
  const rest = mm.value - b.value - c.value;
  const tension = Math.abs(b.value - bbn) / Math.hypot(b.sigma!, bbnSig);
  const share = (x: number) => `${(100 * x / mm.value).toFixed(1)}%`;
  const P = CMB.power;
  const cm = coma(0), fbComa = cm.baryons(cm.rv) / cm.total(cm.rv);
  return (
    <>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>The cosmic census: baryons are about a sixth of the matter <ProvenanceBadge cls="observed" title="BBN deuterium (Cooke et al. 2018) and Planck 2018" /></h1>
          <p className="note">Two independent routes to the density of ordinary (baryonic) matter: the deuterium left over from the first minutes (big-bang nucleosynthesis, BBN) and the CMB. The total matter density comes from fitting the base-ΛCDM model to the Planck spectra. “{BBN.quotes[0].text}” <SourceLinks ids={[BBN.source]} /></p></div>
        <Legend />
        <div className="dm-stack" role="img" aria-label={`Matter budget: baryons ${share(b.value)}, cold dark matter ${share(c.value)}`}>
          <div style={{ width: share(b.value), background: COL.vis }} title={`baryons Ω_b h² = ${b.value}`}>baryons {share(b.value)}</div>
          <div style={{ width: share(c.value), background: COL.dm }} title={`cold dark matter Ω_c h² = ${c.value}`}>cold dark matter {share(c.value)}</div>
          <div style={{ width: share(rest), background: COL.dim }} title="remainder: the 0.06 eV neutrino of the base model" />
        </div>
        <p className="note" style={{ fontSize: 10.5 }}>Shares of Ω_m h² = {mm.value} ± {mm.sigma} (Planck 2018 Table 2, TT,TE,EE+lowE+lensing+BAO, 68 %) <SourceLinks ids={['planck-2018-vi']} />: Ω_b h² = {b.value} ± {b.sigma} and Ω_c h² = {c.value} ± {c.sigma}. The thin grey remainder ({rest.toFixed(5)}) is the 0.06 eV neutrino that the base model counts as matter. These are model parameters <ProvenanceBadge cls="simulated" title="base ΛCDM fitted to the CMB" />, not direct measurements.</p>
        <table className="table-mini" aria-label="Baryon density from BBN and from the CMB" style={{ width: '100%' }}>
          <thead><tr><th>Route</th><th>Ω_b h²</th><th>Interval</th><th>Baryons / matter</th></tr></thead>
          <tbody>
            <tr><td style={{ color: COL.obs }}>Deuterium + BBN (Cooke et al. 2018, eq. {emp ? 14 : 12})</td><td>{bbn.toFixed(5)} ± {bbnSig.toFixed(5)}</td><td>1σ (implied)</td><td>{pct(bbn / mm.value)}</td></tr>
            <tr><td>CMB, base ΛCDM (Planck 2018)</td><td>{b.value} ± {b.sigma}</td><td>{b.interval}</td><td>{pct(cb.baryonFractionPlanck)}</td></tr>
            <tr><td>Coma cluster inside r_v (model)</td><td>—</td><td>30 % on the mass</td><td>{pct(fbComa)}</td></tr>
          </tbody>
        </table>
        <p className="note" style={{ fontSize: 10.5 }}>BBN ± combines the measurement and BBN-calculation errors in quadrature. Baryons / matter divides each Ω_b h² by Planck’s Ω_m h² <ProvenanceBadge cls="derived" title="computed here" />. Difference between the BBN and Planck baryon densities: {tension.toFixed(1)}σ (independent Gaussian errors). Cooke et al. compared with Planck 2015 (100 Ω_b h² = 2.226 ± 0.023) and found 2σ; Planck 2018’s smaller error makes the same gap larger <SourceLinks ids={[BBN.source, 'planck-2018-vi']} />.</p>
        <LinePlot ariaLabel="Planck temperature power spectrum with the best-fit ΛCDM model" width={680} height={220} xLog xDomain={[2, 2510]} yDomain={[0, 6600]} xLabel="multipole ℓ (log)" yLabel="D_ℓ^TT (µK²)" legend="tl"
          series={[{ points: P.theory.rows.map((r) => [r[0], r[1]] as [number, number]), color: COL.dm, width: 1.4, label: 'best-fit ΛCDM (includes dark matter)' }]}
          errorBars={[...P.lowEll.rows.map((r) => ({ x: r[0], y: r[1], lo: r[2], hi: r[3], color: COL.obs })), ...P.binned.rows.map((r) => ({ x: r[0], y: r[1], lo: r[2], hi: r[2], color: COL.obs }))]} />
        <p className="note" style={{ fontSize: 10.5 }}>The CMB measures Ω_c h² only through a model: base ΛCDM is fitted to spectra such as this one. No visible-matter-only spectrum is drawn, because no Boltzmann solver is bundled to compute one. Data: {P.credit} (CC BY-NC 3.0 IGO) <SourceLinks ids={['planck-2018-v', 'planck-pla']} />.</p>
      </div>
      <Panel id="dm-cosmic-controls" className="left-panel" title="BBN input">
        <label className="toggle-row"><span>d(p,γ)³He rate: measured (eq. 14)</span><input type="checkbox" checked={emp} onChange={(e) => setQuery({ rate: e.target.checked ? 'emp' : null })} aria-label="Use the empirical reaction rate" /></label>
        <p className="note" style={{ fontSize: 10.5 }}>{BBN.ombh2.note}. With the empirically measured cross-section instead: {BBN.ombh2Empirical.note.split(', with')[0]} gives 100 Ω_b h² = {BBN.ombh2Empirical.value} ± {BBN.ombh2Empirical.measurement} ± {BBN.ombh2Empirical.theory} <SourceLinks ids={[BBN.source]} />.</p>
        <button className="chip" onClick={() => navigate('/cosmic/cmb?tab=power')}>The Planck power spectrum →</button>
        <button className="chip" onClick={() => navigate('/cosmic/universe')}>Ω_m in the expansion history →</button>
      </Panel>
      <Panel id="dm-cosmic-info" className="right-panel" title="Census">
        <dl className="kv" aria-label="Cosmic densities">
          <KV k="Ω_c / Ω_b (Planck)" v={cb.darkToBaryon} sig={3} />
          <KV k="Ω_b / Ω_m (Planck)" v={pct(cb.baryonFractionPlanck)} />
          <KV k={`Ω_b / Ω_m (BBN baryons, Planck matter)`} v={pct(bbn / mm.value)} />
          <KV k="Primordial D/H" v={`(${BBN.dh.value} ± ${BBN.dh.sigma}) × 10⁻⁵`} />
          <KV k="Baryon-to-photon ratio η₁₀" v={`${BBN.eta10.value} ± ${BBN.eta10.sigma}`} />
          <KV k="BBN vs Planck Ω_b h²" v={`${tension.toFixed(1)}σ`} title="derived: independent Gaussian errors" />
        </dl>
        <p className="note" style={{ fontSize: 10.5 }}>{BBN.dh.note}; {BBN.eta10.note} <SourceLinks ids={[BBN.source]} />.</p>
        <RelatedLinks id="context:dark-matter" />
      </Panel>
    </>
  );
}

export default function DarkMatterView() {
  const { query } = useRoute();
  const tab: Tab = (TABS.find(([t]) => t === query.get('tab'))?.[0]) ?? 'overview';
  const [sparc, setSparc] = useState<Sparc | null>(null);
  useEffect(() => { if (tab === 'galaxies') loadSparc().then(setSparc); }, [tab]);
  return (
    <>
      <nav className="view-switch" aria-label="Dark-matter sections">
        {TABS.map(([t, label]) => <button key={t} className={tab === t ? 'active' : ''} onClick={() => setQuery({ tab: t === 'overview' ? null : t })}>{label}</button>)}
      </nav>
      {tab === 'galaxies' ? (sparc ? <GalaxiesTab sparc={sparc} /> : <Loading label="Loading SPARC rotation curves" />)
        : tab === 'lensing' ? <LensingTab /> : tab === 'clusters' ? <ClustersTab /> : tab === 'cosmic' ? <CosmicTab /> : <OverviewTab />}
    </>
  );
}
