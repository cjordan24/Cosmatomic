/**
 * Distance ladder — #/cosmic/ladder?tab=overview|parallax|cepheids|trgb|sne|h0&sel=&P=&oh=&m=&at=&tip=&MB=&sn=
 * Geometric anchors (parallax, eclipsing binaries, masers) calibrate Cepheids and the TRGB, which
 * calibrate type Ia supernovae, which measure H₀ in the Hubble flow. Every value is from a cited table;
 * calculators only apply the published relations. Gate 7.2.
 */
import { useEffect, useMemo, useState } from 'react';
import { navigate, setQuery, useRoute } from '@/shared/router';
import {
  cepheidMu, h0FromMB, leavittAbsMag, mbForH0, muFromMpc, muFromPc, muOffsetForH0, pcFromMu, quadrature, sigmaMuFromFraction, sigmaMuFromParallax, tensionSigma, trgbMu, weightedMean,
} from '@/core/physics/distanceLadder';
import { PLANCK18, luminosityDistanceMpc, transverseComovingMpc, type Cosmology } from '@/core/physics/cosmology';
import { loadTenParsec, type NearbyObject } from '@/modes/cosmic/star-systems/stars';
import { KV, Panel, ProvenanceBadge } from '@/ui/components';
import { LinePlot, ScatterPlot } from '@/ui/plots';
import { RelatedLinks } from '@/ui/RelatedLinks';
import { SourceLinks } from '@/ui/SourcesView';
import { ALL_H0, LADDER, PLANCK_H0, adoptedTrgb, anchor, anchorPc, h0Sigma, type H0Measurement } from './ladder';
import { logGrid, planckParam } from './universe';

type Tab = 'overview' | 'parallax' | 'cepheids' | 'trgb' | 'sne' | 'h0';
const TABS: [Tab, string][] = [['overview', 'Overview'], ['parallax', 'Parallax'], ['cepheids', 'Cepheids'], ['trgb', 'TRGB'], ['sne', 'Supernovae'], ['h0', 'H₀']];
const COL = { geo: '#5cf2a6', ceph: '#f5c76b', trgb: '#ff7a90', sn: '#7df9ff', flow: '#b18cff', cmb: '#9aa4b2', sh0es: '#f5c76b', cchp: '#ff7a90', planck: '#7df9ff' };
const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
const num = (q: URLSearchParams, k: string, d: number, a: number, b: number) => { const v = Number(q.get(k)); return q.has(k) && Number.isFinite(v) ? clamp(v, a, b) : d; };
const fmtPc = (pc: number) => (pc < 1e3 ? `${pc.toPrecision(4)} pc` : pc < 1e6 ? `${(pc / 1e3).toPrecision(4)} kpc` : pc < 1e9 ? `${(pc / 1e6).toPrecision(4)} Mpc` : `${(pc / 1e9).toPrecision(4)} Gpc`);
const pm = (v: number, s: number, d = 2) => `${v.toFixed(d)} ± ${s.toFixed(d)}`;
const LMC = anchor('lmc'), N4258 = anchor('ngc4258'), MW = anchor('mw');
const L = { MW1: LADDER.leavitt.MW1.value, bW: LADDER.leavitt.bW.value, ZW: LADDER.leavitt.ZW.value };
const SN = LADDER.sne;
const SH0ES = LADDER.h0.find((h) => h.id === 'sh0es-2022')!;
/** Planck ΛCDM with SH0ES's H₀: used only to turn the Hubble-flow redshift range into distances. */
const LCDM_SH0ES: Cosmology = { ...PLANCK18, name: 'Planck Ω, H₀ = 73.04', H0: SH0ES.value };

function useTenParsec() {
  const [ten, setTen] = useState<NearbyObject[] | null>(null);
  useEffect(() => { let alive = true; loadTenParsec().then((x) => alive && setTen(x)); return () => { alive = false; }; }, []);
  return ten;
}

/** Places a source at the distance of a known object: the apparent magnitude follows from μ (derived). */
const PLACES = [
  { id: 'lmc', label: 'LMC', mu: () => LMC.adoptedMu!.value, note: 'μ adopted by SH0ES from the eclipsing binaries', source: 'riess-2022' },
  { id: 'n4258', label: 'NGC 4258', mu: () => muFromMpc(N4258.distance!.value), note: 'μ from the maser distance', source: 'reid-2019' },
  { id: 'm101', label: 'M101 (SN 2011fe)', mu: () => SN.calibrators.find((c) => c.sn === '2011fe')!.muCeph, note: 'Cepheid μ from SH0ES Table 6', source: 'riess-2022' },
  { id: 'n0105', label: 'NGC 105 (SN 2007A)', mu: () => SN.calibrators.find((c) => c.sn === '2007A')!.muCeph, note: 'the farthest calibrator in Table 6', source: 'riess-2022' },
];

// ------------------------------------------------------------------ overview
function Overview() {
  const ten = useTenParsec();
  const tenRange = useMemo(() => {
    if (!ten) return null;
    const d = ten.filter((o) => o.type !== 'exoplanet' && o.plx && o.plx > 0).map((o) => 1000 / o.plx!);
    return [Math.min(...d), Math.max(...d)] as [number, number];
  }, [ten]);
  const lmc = anchorPc(LMC)!, n4258 = anchorPc(N4258)!;
  const hostPc = SN.calibrators.map((c) => pcFromMu(c.muCeph));
  const flow: [number, number] = [luminosityDistanceMpc(SN.hubbleFlow.zMin, LCDM_SH0ES) * 1e6, luminosityDistanceMpc(SN.hubbleFlow.zMax, LCDM_SH0ES) * 1e6];
  const cmbPc = transverseComovingMpc(planckParam('zstar').value, PLANCK18) * 1e6;
  const mwPc = 1e6 / MW.meanParallaxUas!;
  const rungs: { tab: Tab; label: string; sub: string; range: [number, number]; color: string; points?: { pc: number; label: string }[]; dashed?: boolean }[] = [
    { tab: 'parallax', label: 'Parallax', sub: tenRange ? `10 pc sample (${tenRange[0].toFixed(2)}–${tenRange[1].toFixed(1)} pc); Milky Way Cepheids, mean ϖ = ${MW.meanParallaxUas} µas` : 'loading the 10 pc sample…', range: [tenRange?.[0] ?? 1.3, mwPc], color: COL.geo, points: [{ pc: mwPc, label: 'MW Cepheids' }] },
    { tab: 'parallax', label: 'Geometric anchors', sub: 'eclipsing binaries (LMC), water masers (NGC 4258)', range: [lmc.pc, n4258.pc], color: COL.geo, points: [{ pc: lmc.pc, label: 'LMC' }, { pc: n4258.pc, label: 'NGC 4258' }] },
    { tab: 'cepheids', label: 'Cepheids', sub: `anchors → ${SN.calibrators.length} SN Ia hosts (SH0ES)`, range: [lmc.pc, Math.max(...hostPc)], color: COL.ceph },
    { tab: 'trgb', label: 'Tip of the red giant branch', sub: 'zero point from the same anchors (CCHP); TRGB host distances not bundled', range: [lmc.pc, n4258.pc], color: COL.trgb },
    { tab: 'sne', label: 'SNe Ia: calibrators', sub: `${SN.calibrators.length} SNe in Cepheid hosts, ${fmtPc(Math.min(...hostPc))}–${fmtPc(Math.max(...hostPc))}`, range: [Math.min(...hostPc), Math.max(...hostPc)], color: COL.sn },
    { tab: 'sne', label: 'SNe Ia: Hubble flow', sub: `${SN.hubbleFlow.n} SNe at ${SN.hubbleFlow.zMin} < z < ${SN.hubbleFlow.zMax} → H₀ (D_L shown for H₀ = ${SH0ES.value})`, range: flow, color: COL.flow },
    { tab: 'h0', label: 'CMB (not a rung)', sub: `Planck infers H₀ from the early universe in ΛCDM; last scattering at D_M = ${fmtPc(cmbPc)}`, range: [cmbPc, cmbPc], color: COL.cmb, dashed: true, points: [{ pc: cmbPc, label: 'z∗' }] },
  ];
  const W = 680, pad = 10, lx0 = 0, lx1 = 10.5; // log10(pc)
  const sx = (pc: number) => pad + ((Math.log10(pc) - lx0) / (lx1 - lx0)) * (W - 2 * pad);
  const decades = [1, 10, 100, 1e3, 1e4, 1e5, 1e6, 1e7, 1e8, 1e9, 1e10];
  const axisLabels = [1, 100, 1e4, 1e6, 1e8, 1e10];
  return (
    <>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>The distance ladder <ProvenanceBadge cls="observed" title="ranges from published distances; the Hubble-flow range is converted from redshift with ΛCDM" /></h1>
          <p className="note">Geometric distances (parallaxes, eclipsing binaries, masers) calibrate the luminosities of Cepheids and of red giants at the tip of their branch; those calibrate type Ia supernovae; and supernovae far enough away to follow the expansion give H₀ <SourceLinks ids={['riess-2022', 'freedman-2021']} />. Click a rung to open it.</p></div>
        <div className="ladder-rungs" role="group" aria-label="Distance ladder: ranges of each method">
          {rungs.map((r) => {
            const x0 = sx(r.range[0]), x1 = Math.max(sx(r.range[1]), x0 + 4);
            return (
              <button key={r.label} className="ladder-rung" onClick={() => setQuery({ tab: r.tab })} aria-label={`${r.label}: ${r.sub}. Open.`}>
                <span className="ladder-rung-label" style={{ color: r.color }}>{r.label}</span> <span className="ladder-rung-sub">{r.sub}</span>
                <svg viewBox={`0 0 ${W} 16`} aria-hidden="true">
                  {decades.map((t) => <line key={t} x1={sx(t)} x2={sx(t)} y1={0} y2={16} stroke="var(--line)" />)}
                  <rect x={x0} y={4} width={x1 - x0} height={8} rx={4} fill={r.color} fillOpacity={r.dashed ? 0.25 : 0.6} stroke={r.color} strokeDasharray={r.dashed ? '3 3' : undefined} />
                  {r.points?.map((p) => <circle key={p.label} cx={sx(p.pc)} cy={8} r={4} fill="#fff"><title>{p.label}</title></circle>)}
                </svg>
              </button>
            );
          })}
          <svg viewBox={`0 0 ${W} 22`} className="ladder-axis" aria-hidden="true">
            {decades.map((t) => <line key={t} x1={sx(t)} x2={sx(t)} y1={0} y2={5} stroke="var(--text-dim)" />)}
            {axisLabels.map((t) => <text key={t} x={sx(t)} y={19} textAnchor={t === 1 ? 'start' : t === 1e10 ? 'end' : 'middle'}>{fmtPc(t).replace('.000', '')}</text>)}
          </svg>
        </div>
        <p className="note" style={{ fontSize: 10.5 }}>Distances on a logarithmic axis. Anchors: LMC {LMC.distance!.value} ± {LMC.distance!.stat} (stat) ± {LMC.distance!.sys} (sys) kpc <SourceLinks ids={['pietrzynski-2019']} />; NGC 4258 {N4258.distance!.value} ± {N4258.distance!.stat} (stat) ± {N4258.distance!.sys} (sys) Mpc <SourceLinks ids={['reid-2019']} />. Host distances: Cepheid distance moduli of SH0ES Table 6 <SourceLinks ids={['riess-2022']} />. The Hubble-flow range is a redshift range; it is drawn as luminosity distance in Planck’s ΛCDM shape with H₀ = {SH0ES.value} km/s/Mpc, and would be {((SH0ES.value / PLANCK18.H0 - 1) * 100).toFixed(1)} % farther with Planck’s H₀ <SourceLinks ids={['hogg-1999', 'planck-2018-vi']} />.</p>
      </div>
      <Panel id="ladder-info" className="right-panel" title="How the rungs connect">
        <div className="section-title">Distance modulus</div>
        <p className="note">Every rung is expressed as a distance modulus μ = m − M = 5 log₁₀(D/Mpc) + 25, where m is the apparent and M the absolute magnitude, both corrected for dust <SourceLinks ids={['riess-2022']} />. A geometric distance gives μ; with μ, a measured m gives M for a class of star; with M, another m gives a new μ.</p>
        <dl className="kv" aria-label="Anchor distance moduli">
          <KV k="LMC (derived from 49.59 kpc)" v={`${muFromPc(anchorPc(LMC)!.pc).toFixed(3)} mag`} />
          <KV k="LMC (adopted by SH0ES)" v={`${pm(LMC.adoptedMu!.value, LMC.adoptedMu!.sigma, 4)} mag`} />
          <KV k="NGC 4258 (derived from 7.576 Mpc)" v={`${pm(muFromMpc(N4258.distance!.value), sigmaMuFromFraction(anchorPc(N4258)!.sigmaPc / anchorPc(N4258)!.pc), 3)} mag`} />
        </dl>
        <div className="section-title">Steps to H₀ (SH0ES 2022)</div>
        <ol className="note" style={{ paddingLeft: 18, fontSize: 11 }}>
          <li>Anchors fix the Cepheid zero point M_H,1^W = {pm(L.MW1, LADDER.leavitt.MW1.sigma, 3)} mag.</li>
          <li>Cepheids give distances to {new Set(SN.calibrators.map((c) => c.host)).size} galaxies that hosted {SN.calibrators.length} SNe Ia.</li>
          <li>Those SNe fix M⁰_B = {pm(SN.MB.value, SN.MB.sigma, 3)} mag.</li>
          <li>{SN.hubbleFlow.n} SNe at {SN.hubbleFlow.zMin} &lt; z &lt; {SN.hubbleFlow.zMax} give the intercept a_B = {SN.aB.value}.</li>
          <li>log H₀ = 0.2 M⁰_B + a_B + 5 → H₀ = {h0FromMB(SN.MB.value, SN.aB.value).toFixed(2)} km/s/Mpc (published: {SH0ES.value} ± {h0Sigma(SH0ES)}) <SourceLinks ids={['riess-2022']} /></li>
        </ol>
        <RelatedLinks id="context:distance-ladder" />
      </Panel>
    </>
  );
}

// ------------------------------------------------------------------ parallax and anchors
function ParallaxTab() {
  const { query } = useRoute();
  const ten = useTenParsec();
  const stars = useMemo(() => (ten ?? []).filter((o) => o.type !== 'exoplanet' && o.plx && o.plx > 0 && o.ePlx !== null && o.ePlx > 0 && !o.rPlx?.startsWith('FROM:')), [ten]);
  const sel = stars.find((o) => String(o.seq) === query.get('sel')) ?? stars.find((o) => o.name === 'Proxima Cen') ?? null;
  const fracs = stars.map((o) => o.ePlx! / o.plx!);
  return (
    <>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Parallax and geometric anchors <ProvenanceBadge cls="observed" /></h1>
          <p className="note">A parsec is the distance at which 1 au subtends one arcsecond, so a parallax ϖ in arcseconds gives d = 1/ϖ parsecs <SourceLinks ids={['iau-2015-b3']} />. Below: every star and brown dwarf of the 10 pc sample with a parallax error. The fractional error grows with distance; the Milky Way Cepheids that SH0ES uses have a mean parallax of {MW.meanParallaxUas} µas <SourceLinks ids={['riess-2022']} />.</p></div>
        {!ten ? <p className="note">Loading the 10 pc sample…</p> :
          <ScatterPlot ariaLabel="Parallax precision against distance, 10 pc sample" width={680} height={360} xLog yLog xDomain={[1, 12]} yDomain={[Math.max(1e-6, Math.min(...fracs) * 0.7), Math.max(...fracs) * 1.4]}
            xLabel="distance d = 1/ϖ (pc)" yLabel="fractional parallax error σϖ/ϖ" selected={sel ? String(sel.seq) : null} onPick={(k) => setQuery({ sel: k })}
            points={stars.map((o) => ({ key: String(o.seq), x: 1000 / o.plx!, y: o.ePlx! / o.plx!, color: o.rPlx?.includes('1350') ? COL.geo : COL.ceph, title: `${o.name}: ϖ = ${o.plx} ± ${o.ePlx} mas` }))}
            hLines={[{ y: 0.1, label: '10 %: 1/ϖ becomes biased', color: 'var(--warn)' }]} />}
        <p className="note" style={{ fontSize: 10.5 }}>Green: parallax from Gaia EDR3; amber: other sources (ground-based, Hipparcos, Spitzer), as listed per star in the catalogue <SourceLinks ids={['reyle-2021', 'gaia-edr3']} />. Click a point to select it.</p>
        <table className="table-mini" aria-label="Geometric anchors" style={{ width: '100%' }}>
          <thead><tr><th>Anchor</th><th>Method</th><th>Distance (1σ implied)</th><th>μ (derived)</th></tr></thead>
          <tbody>
            {[LMC, N4258].map((a) => { const d = anchorPc(a)!; return <tr key={a.id}><td>{a.name}</td><td style={{ fontSize: 10.5 }}>{a.method}</td><td>{a.distance!.value} ± {a.distance!.stat} (stat) ± {a.distance!.sys} (sys) {a.distance!.unit} <SourceLinks ids={[a.source]} /></td><td>{pm(muFromPc(d.pc), sigmaMuFromFraction(d.sigmaPc / d.pc), 3)}</td></tr>; })}
            <tr><td>{MW.name}</td><td style={{ fontSize: 10.5 }}>{MW.method}</td><td>mean ϖ = {MW.meanParallaxUas} µas (≈ {fmtPc(1e6 / MW.meanParallaxUas!)}) <SourceLinks ids={['riess-2022']} /></td><td>—</td></tr>
          </tbody>
        </table>
        <p className="note" style={{ fontSize: 10.5 }}>Eclipsing binaries made of late-type stars give the most precise distance to the LMC; the result rests on a surface-brightness–colour relation calibrated to 0.8 % <SourceLinks ids={['pietrzynski-2019']} />. In NGC 4258, water masers orbit the central black hole; VLBI positions, velocities and accelerations are modelled to give a geometric angular-diameter distance <SourceLinks ids={['reid-2019']} />. μ is computed here from the published distance with stat and sys in quadrature; SH0ES adopts μ_LMC = {LMC.adoptedMu!.value} ± {LMC.adoptedMu!.sigma} <SourceLinks ids={['riess-2022']} />. {MW.note}</p>
      </div>
      <Panel id="ladder-plx-info" className="right-panel" title={sel ? sel.name : 'Parallax'}>
        {sel ? <>
          <dl className="kv" aria-label="Parallax of the selected star">
            <KV k="Parallax ϖ" v={`${sel.plx} ± ${sel.ePlx} mas`} />
            <KV k="Distance 1/ϖ" v={1000 / sel.plx!} unit="pc" sig={5} />
            <KV k="Fractional error σϖ/ϖ" v={`${((sel.ePlx! / sel.plx!) * 100).toPrecision(2)} %`} />
            <KV k="Distance modulus μ" v={`${pm(muFromPc(1000 / sel.plx!), sigmaMuFromParallax(sel.plx!, sel.ePlx!), 4)} mag`} />
            <KV k="Parallax reference" v={sel.rPlx} />
          </dl>
          <p className="note" style={{ fontSize: 10.5 }}>σ_μ = (5/ln 10)·σϖ/ϖ, linear propagation, valid while σϖ/ϖ is small. The same star at the LMC would have a parallax of {(1e3 / anchorPc(LMC)!.pc * 1e3).toFixed(1)} µas.</p>
          <button className="chip" onClick={() => navigate(`/cosmic/stars?sel=${sel.seq}`)}>Open {sel.name} in Nearby stars →</button>
        </> : <p className="note">Select a star.</p>}
        <RelatedLinks id="context:distance-ladder" />
      </Panel>
    </>
  );
}

// ------------------------------------------------------------------ Cepheids
function CepheidsTab() {
  const { query } = useRoute();
  const [p0, p1] = LADDER.leavitt.periodRangeDays;
  const P = num(query, 'P', 30, p0, p1), oh = num(query, 'oh', 0, -0.6, 0.6);
  const place = PLACES.find((x) => x.id === query.get('at')) ?? null;
  const M = leavittAbsMag(P, oh, L);
  const m = place ? place.mu() + M : num(query, 'm', 24, 8, 32);
  const mu = cepheidMu(m, P, oh, L);
  const lp = Math.log10(P) - 1;
  const sigM = quadrature([LADDER.leavitt.MW1.sigma, lp * LADDER.leavitt.bW.sigma, oh * LADDER.leavitt.ZW.sigma]);
  const logP = useMemo(() => Array.from({ length: 60 }, (_, i) => Math.log10(p0) + (i / 59) * (Math.log10(p1) - Math.log10(p0))), [p0, p1]);
  const line = (o: number, off = 0) => logP.map((x) => [x, leavittAbsMag(10 ** x, o, L) + off] as [number, number]);
  const sc = LADDER.leavitt.intrinsicScatter;
  return (
    <>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Cepheids: the Leavitt law <ProvenanceBadge cls="derived" title="published relation; the period, metallicity and magnitude are your choice" /></h1>
          <p className="note">Cepheids are very luminous, are easy to identify by their periodicity, and obey a tight period–luminosity relation (the Leavitt law) that gives distances to about 3 % per star <SourceLinks ids={['riess-2022']} />. Longer-period Cepheids are brighter: the absolute magnitude falls by {Math.abs(L.bW).toFixed(2)} mag per factor of ten in period.</p></div>
        <LinePlot ariaLabel="Cepheid period–luminosity relation" width={680} height={340} xDomain={[Math.log10(p0), Math.log10(p1)]} xLabel="log₁₀ period (days)" yLabel="absolute magnitude M_H^W (brighter is lower)" legend="tr"
          series={[
            { points: line(0), color: COL.ceph, width: 2, label: 'solar metallicity, [O/H] = 0' },
            { points: line(LADDER.leavitt.lmcOH.value), color: COL.geo, width: 1.6, label: `LMC, [O/H] = ${LADDER.leavitt.lmcOH.value}` },
            { points: line(0, sc), color: COL.ceph, dashed: true, width: 1, label: `± ${sc} mag instability-strip width` },
            { points: line(0, -sc), color: COL.ceph, dashed: true, width: 1 },
          ]}
          markers={[{ x: Math.log10(P), y: M, label: `P = ${P.toFixed(1)} d`, color: '#ffffff' }]} vLines={[{ x: 1, label: 'P = 10 d (fiducial)', color: '#9aa4b2' }]} />
        <p className="note" style={{ fontSize: 10.5 }}>m_H^W = μ₀ + M_H,1^W + b_W(log P − 1) + Z_W[O/H] (eq. 1) with the baseline fit M_H,1^W = {pm(L.MW1, LADDER.leavitt.MW1.sigma, 3)}, b_W = {pm(L.bW, LADDER.leavitt.bW.sigma, 3)} mag/dex, Z_W = {pm(L.ZW, LADDER.leavitt.ZW.sigma, 3)} mag/dex (Table 5, {LADDER.leavitt.interval}) <SourceLinks ids={['riess-2022']} />. The y axis is plotted with brighter (more negative) magnitudes lower. m_H^W is a “Wesenheit” magnitude: H-band (F160W) light with a colour term that removes dust extinction. Drawn over the period range of the host fits, {p0}–{p1} d ({LADDER.leavitt.periodNote}).</p>
      </div>
      <Panel id="ladder-ceph-controls" className="left-panel" title="A Cepheid">
        <label className="slider-row"><span>period P (days)</span><input type="range" min={Math.log10(p0)} max={Math.log10(p1)} step={0.005} value={Math.log10(P)} onChange={(e) => setQuery({ P: (10 ** Number(e.target.value)).toFixed(1) })} aria-label="Cepheid period" /><span>{P.toFixed(1)}</span></label>
        <label className="slider-row"><span>metallicity [O/H] (dex)</span><input type="range" min={-0.6} max={0.6} step={0.01} value={oh} onChange={(e) => setQuery({ oh: e.target.value })} aria-label="Cepheid metallicity" /><span>{oh.toFixed(2)}</span></label>
        <label className="slider-row"><span>apparent m_H^W (mag)</span><input type="range" min={8} max={32} step={0.01} value={m} onChange={(e) => setQuery({ m: e.target.value, at: null })} aria-label="Apparent Wesenheit magnitude" /><span>{m.toFixed(2)}</span></label>
        <div className="section-title">Place it at</div>
        <div className="chip-row" style={{ flexWrap: 'wrap', gap: 4 }}>
          {PLACES.map((p) => <button key={p.id} className={`chip ${place?.id === p.id ? 'active' : ''}`} onClick={() => setQuery({ at: p.id, m: null })} title={p.note}>{p.label}</button>)}
        </div>
        <p className="note" style={{ fontSize: 10.5 }}>Placing it sets m = μ + M for that galaxy’s published distance modulus. Real Cepheids scatter by ± {sc} mag around the line.</p>
      </Panel>
      <Panel id="ladder-ceph-info" className="right-panel" title="Distance from the Leavitt law">
        <dl className="kv" aria-label="Cepheid distance">
          <KV k="Absolute magnitude M_H^W" v={`${pm(M, sigM, 3)} mag`} title="σ from the fit parameters only" />
          <KV k="Distance modulus μ = m − M" v={`${mu.toFixed(3)} mag`} />
          <KV k="Distance" v={fmtPc(pcFromMu(mu))} />
          <KV k="σ_μ from the relation" v={`${sigM.toFixed(3)} mag (${((sigM * Math.LN10) / 5 * 100).toFixed(1)} % in distance)`} />
          <KV k="σ_μ with the strip width" v={`${quadrature([sigM, sc]).toFixed(3)} mag (${((quadrature([sigM, sc]) * Math.LN10) / 5 * 100).toFixed(1)} %)`} />
        </dl>
        {place && <p className="note" style={{ fontSize: 10.5 }}>{place.label}: {place.note}, μ = {place.mu().toFixed(3)} <SourceLinks ids={[place.source]} />.</p>}
        <p className="note" style={{ fontSize: 10.5 }}>The anchors that fix the zero point: {LADDER.leavitt.nCepheidsN4258} Cepheids in NGC 4258, {LADDER.leavitt.nCepheidsLMC} in the LMC and Milky Way Cepheids with Gaia parallaxes <SourceLinks ids={['riess-2022']} />. Dust is assumed already removed (the Wesenheit magnitude); no extinction is applied here.</p>
        <RelatedLinks id="context:distance-ladder" />
      </Panel>
    </>
  );
}

// ------------------------------------------------------------------ TRGB
function TrgbTab() {
  const { query } = useRoute();
  const ad = adoptedTrgb();
  const sigAd = quadrature([ad.stat, ad.sys]);
  const place = PLACES.find((x) => x.id === query.get('at')) ?? null;
  const tip = place ? place.mu() + ad.M : num(query, 'tip', 25.4, 10, 32);
  const mu = trgbMu(tip, ad.M);
  const cals = LADDER.trgb.calibrations;
  const bars = cals.flatMap((c, i) => [
    { x: i + 1, y: c.M, lo: quadrature([c.stat, c.sys]), hi: quadrature([c.stat, c.sys]), color: c.adopted ? '#ffffff' : '#9aa4b2', title: `${c.object}: total σ` },
    { x: i + 1, y: c.M, lo: c.stat, hi: c.stat, color: c.adopted ? '#ffffff' : COL.trgb, title: `${c.object}: ${c.M} ± ${c.stat} (stat) ± ${c.sys} (sys)` },
  ]);
  return (
    <>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Tip of the red giant branch <ProvenanceBadge cls="observed" title="published zero-point calibrations" /></h1>
          <p className="note">Low-mass stars climb the red giant branch while their degenerate helium core grows. At about 0.5 M☉, independent of the star’s initial mass, helium ignites in a runaway (the core helium flash) and the star drops to a lower luminosity. The result is a sharp edge at the top of the branch, an excellent standard candle in the I band <SourceLinks ids={['freedman-2025']} />. Its advantages are simple underlying physics and small systematic effects from extinction, metallicity and crowding <SourceLinks ids={['freedman-2021']} />.</p></div>
        <LinePlot ariaLabel="TRGB zero-point calibrations" width={680} height={320} xDomain={[0.4, cals.length + 0.6]} yDomain={[-4.32, -3.82]} xLabel="calibration (numbered as in the table below)" yLabel="M_TRGB in F814W (mag)"
          series={[]} errorBars={bars} hLines={[{ y: ad.M, label: `adopted ${ad.M}`, color: '#ffffff' }]} />
        <table className="table-mini" aria-label="TRGB calibrations" style={{ width: '100%' }}>
          <thead><tr><th>#</th><th>Calibrator</th><th>M_F814W</th><th>σ stat</th><th>σ sys</th><th>Reference (as cited)</th></tr></thead>
          <tbody>{cals.map((c, i) => <tr key={c.object} style={c.adopted ? { fontWeight: 600 } : undefined}><td>{i + 1}</td><td>{c.object}{c.note ? <span className="f" style={{ fontSize: 10 }}> · {c.note}</span> : null}</td><td>{c.M.toFixed(3)}</td><td>{c.stat}</td><td>{c.sys}</td><td style={{ fontSize: 10.5 }}>{c.reference}</td></tr>)}</tbody>
        </table>
        <p className="note" style={{ fontSize: 10.5 }}>Freedman (2021) Table 3; error bars: coloured = statistical, grey = statistical and systematic in quadrature ({LADDER.trgb.interval}). {LADDER.trgb.transformNote}. The calibrations by other authors are quoted from that table, not from their papers <SourceLinks ids={['freedman-2021']} />.</p>
      </div>
      <Panel id="ladder-trgb-controls" className="left-panel" title="A red-giant tip">
        <label className="slider-row"><span>apparent tip m_F814W (mag)</span><input type="range" min={10} max={32} step={0.01} value={tip} onChange={(e) => setQuery({ tip: e.target.value, at: null })} aria-label="Apparent TRGB magnitude" /><span>{tip.toFixed(2)}</span></label>
        <div className="section-title">Place it at</div>
        <div className="chip-row" style={{ flexWrap: 'wrap', gap: 4 }}>
          {PLACES.map((p) => <button key={p.id} className={`chip ${place?.id === p.id ? 'active' : ''}`} onClick={() => setQuery({ at: p.id, tip: null })} title={p.note}>{p.label}</button>)}
        </div>
      </Panel>
      <Panel id="ladder-trgb-info" className="right-panel" title="Distance from the TRGB">
        <dl className="kv" aria-label="TRGB distance">
          <KV k="Adopted M_TRGB" v={`${ad.M} ± ${ad.stat} (stat) ± ${ad.sys} (sys)`} />
          <KV k="μ = m_tip − M_TRGB" v={`${pm(mu, sigAd, 3)} mag`} title="σ from the zero point only" />
          <KV k="Distance" v={fmtPc(pcFromMu(mu))} />
          <KV k="Zero-point σ in distance" v={`${((sigAd * Math.LN10) / 5 * 100).toFixed(1)} %`} />
        </dl>
        <p className="note" style={{ fontSize: 10.5 }}>Only the zero-point uncertainty is propagated; measuring the tip itself adds its own error. No extinction or colour correction is applied.</p>
        <RelatedLinks id="context:distance-ladder" />
      </Panel>
    </>
  );
}

// ------------------------------------------------------------------ supernovae
function SupernovaeTab() {
  const { query } = useRoute();
  const MB = num(query, 'MB', SN.MB.value, -19.8, -18.8);
  const sel = SN.calibrators.find((c) => c.sn === query.get('sn')) ?? SN.calibrators[0];
  const H0 = h0FromMB(MB, SN.aB.value);
  const wm = weightedMean(SN.calibrators.map((c) => c.MB), SN.calibrators.map((c) => c.eMBabs));
  const mbPlanck = mbForH0(PLANCK18.H0, SN.aB.value);
  const muGrid = [29, 35];
  const zs = useMemo(() => logGrid(0.01, 0.2, 80), []);
  const flowLine = (H: number, M: number) => zs.map((z) => [z, M + muFromMpc(luminosityDistanceMpc(z, { ...PLANCK18, H0: H }))] as [number, number]);
  return (
    <>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Type Ia supernovae: calibrating and measuring H₀ <ProvenanceBadge cls="observed" title="SH0ES Table 6; H₀ from the published equation" /></h1>
          <p className="note">Supernovae of type Ia are used to measure the expansion because each gives a distance to about 5 %, they are common, and they are bright enough to be seen far away, where local motions matter less <SourceLinks ids={['riess-2022']} />. Step one: in galaxies with Cepheid distances, a supernova’s peak magnitude m⁰_B and the host’s μ give its absolute magnitude, m⁰_B = μ₀ + M⁰_B (eq. 3).</p></div>
        <ScatterPlot ariaLabel="SN Ia peak magnitude against Cepheid distance modulus" width={680} height={330} xDomain={[muGrid[0], muGrid[1]]} yDomain={[9, 16]}
          xLabel="Cepheid distance modulus of the host μ_Ceph (mag)" yLabel="standardized SN peak magnitude m⁰_B (mag)" selected={sel.sn} onPick={(k) => setQuery({ sn: k })}
          points={SN.calibrators.map((c) => ({ key: c.sn, x: c.muCeph, y: c.mB, color: COL.sn, r: 3, title: `SN ${c.sn} in ${c.host}: m = ${c.mB} ± ${c.eMB}, μ = ${c.muCeph} ± ${c.eMuCeph}` }))}
          lines={[{ points: muGrid.map((x) => [x, x + SN.MB.value] as [number, number]), color: '#ffffff', label: `m = μ + M⁰_B, M⁰_B = ${SN.MB.value} (fit)` },
            ...(Math.abs(MB - SN.MB.value) > 1e-6 ? [{ points: muGrid.map((x) => [x, x + MB] as [number, number]), color: COL.flow, dashed: true, label: `your M⁰_B = ${MB.toFixed(3)}` }] : [])]} />
        <p className="note" style={{ fontSize: 10.5 }}>{SN.calibrators.length} calibrator SNe Ia in {new Set(SN.calibrators.map((c) => c.host)).size} Cepheid hosts (Table 6). μ_Ceph is each host’s Cepheid distance derived without its own supernovae; m⁰_B is a simple average over surveys, an approximation to the global fit <SourceLinks ids={['riess-2022']} />. Their scatter about the line is {SN.calibratorDispersion} mag.</p>
        <LinePlot ariaLabel="Hubble diagram of the supernova Hubble flow" width={680} height={260} xLog xDomain={[0.01, 0.2]} xLabel="redshift z (log)" yLabel="expected peak magnitude m⁰_B (mag)" legend="tl"
          series={[
            { points: flowLine(H0, MB), color: COL.flow, width: 2, label: `H₀ = ${H0.toFixed(2)} with your M⁰_B` },
            { points: flowLine(PLANCK18.H0, SN.MB.value), color: COL.planck, dashed: true, label: `H₀ = ${PLANCK18.H0} (Planck) with M⁰_B = ${SN.MB.value}` },
          ]}
          vLines={[{ x: SN.hubbleFlow.zMin, label: `z = ${SN.hubbleFlow.zMin}`, color: '#9aa4b2' }, { x: SN.hubbleFlow.zMax, label: `z = ${SN.hubbleFlow.zMax}`, color: '#9aa4b2' }]} />
        <p className="note" style={{ fontSize: 10.5 }}>Step two: {SN.hubbleFlow.n} supernovae between the dashed lines fix the intercept a_B of the magnitude–redshift relation. The {SN.hubbleFlow.n} measured points are not bundled; the curves are model predictions m = M⁰_B + 5 log₁₀(D_L/Mpc) + 25 with D_L in Planck’s flat ΛCDM shape <SourceLinks ids={['hogg-1999', 'planck-2018-vi']} />. SH0ES itself uses a deceleration parameter q₀ = {SN.hubbleFlow.q0} (eq. 4), not ΛCDM <SourceLinks ids={['riess-2022']} />. At fixed M⁰_B the two H₀ values differ by {muOffsetForH0(SH0ES.value, PLANCK18.H0).toFixed(3)} mag in every Hubble-flow distance modulus.</p>
      </div>
      <Panel id="ladder-sn-controls" className="left-panel" title="Calibrate and measure">
        <label className="slider-row"><span>SN Ia absolute magnitude M⁰_B</span><input type="range" min={-19.8} max={-18.8} step={0.001} value={MB} onChange={(e) => setQuery({ MB: e.target.value })} aria-label="Supernova absolute magnitude" /><span>{MB.toFixed(3)}</span></label>
        <div className="chip-row" style={{ flexWrap: 'wrap', gap: 4 }}>
          <button className={`chip ${Math.abs(MB - SN.MB.value) < 1e-6 ? 'active' : ''}`} onClick={() => setQuery({ MB: null })}>SH0ES fit {SN.MB.value}</button>
          <button className={`chip ${Math.abs(MB - mbPlanck) < 5e-4 ? 'active' : ''}`} onClick={() => setQuery({ MB: mbPlanck.toFixed(4) })}>value that gives Planck’s H₀</button>
        </div>
        <dl className="kv" aria-label="H0 from the supernova calibration">
          <KV k="Intercept a_B (fixed)" v={SN.aB.value} sig={6} />
          <KV k="H₀ = 10^(0.2 M⁰_B + a_B + 5)" v={H0} unit="km/s/Mpc" sig={4} />
          <KV k="M⁰_B for Planck’s H₀" v={`${mbPlanck.toFixed(3)} mag (${(SN.MB.value - mbPlanck).toFixed(3)} mag brighter)`} />
        </dl>
        <p className="note" style={{ fontSize: 10.5 }}>log H₀ = 0.2 M⁰_B + a_B + 5 (eq. 5); M⁰_B = {pm(SN.MB.value, SN.MB.sigma, 3)} ({SN.MB.interval}); a_B from Table 5 row 1 ({SN.aB.note}) <SourceLinks ids={['riess-2022']} />. With the published values this gives {h0FromMB(SN.MB.value, SN.aB.value).toFixed(2)}, against the published {SH0ES.value}.</p>
      </Panel>
      <Panel id="ladder-sn-info" className="right-panel" title={`SN ${sel.sn}`}>
        <dl className="kv" aria-label="Selected supernova">
          <KV k="Host galaxy" v={sel.host} />
          <KV k="Peak magnitude m⁰_B" v={pm(sel.mB, sel.eMB, 3)} />
          <KV k="Host μ_Ceph" v={`${pm(sel.muCeph, sel.eMuCeph, 3)} → ${fmtPc(pcFromMu(sel.muCeph))}`} />
          <KV k="M⁰_B,i = m − μ" v={pm(sel.MB, sel.eMBabs, 3)} />
          <KV k="Host μ without any SN" v={pm(sel.muHost, sel.eMuHost, 3)} />
        </dl>
        <div className="section-title">All {SN.calibrators.length} calibrators <ProvenanceBadge cls="derived" title="computed here from Table 6" /></div>
        <dl className="kv" aria-label="Calibrator summary">
          <KV k="Weighted mean of M⁰_B,i" v={`${pm(wm.mean, wm.sigma, 3)} mag`} />
          <KV k="Global-fit M⁰_B (SH0ES)" v={`${pm(SN.MB.value, SN.MB.sigma, 3)} mag`} />
        </dl>
        <p className="note" style={{ fontSize: 10.5 }}>The simple weighted mean ignores the covariances the global fit includes (shared hosts, shared Cepheid systematics), so it need not equal the published M⁰_B <SourceLinks ids={['riess-2022']} />.</p>
        <RelatedLinks id="context:distance-ladder" />
      </Panel>
    </>
  );
}

// ------------------------------------------------------------------ H₀ comparison
function ForestPlot({ items, refId }: { items: H0Measurement[]; refId: string }) {
  const W = 680, rowH = 34, padL = 230, padR = 20, top = 16, H = top + items.length * rowH + 44;
  const x0 = 64, x1 = 76;
  const sx = (v: number) => padL + ((v - x0) / (x1 - x0)) * (W - padL - padR);
  const ref = items.find((i) => i.id === refId)!;
  const color = (m: H0Measurement) => (m.source.startsWith('planck') ? COL.planck : m.source.startsWith('riess') ? COL.sh0es : COL.cchp);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="plot" role="img" aria-label="H0 measurements compared">
      <rect x={sx(ref.value - h0Sigma(ref))} y={top - 6} width={sx(ref.value + h0Sigma(ref)) - sx(ref.value - h0Sigma(ref))} height={items.length * rowH + 4} fill={COL.planck} fillOpacity={0.08} />
      {Array.from({ length: x1 - x0 + 1 }, (_, i) => x0 + i).map((t) => <g key={t}><line x1={sx(t)} x2={sx(t)} y1={top - 6} y2={H - 38} stroke="var(--line)" /><text x={sx(t)} y={H - 26} textAnchor="middle">{t}</text></g>)}
      {items.map((m, i) => {
        const y = top + i * rowH + 12, s = h0Sigma(m), c = color(m);
        const stat = m.parts.find((p) => p.label === 'stat');
        return (
          <g key={m.id} aria-label={`${m.label}: ${m.value} ± ${s.toFixed(2)}`}>
            <text x={8} y={y + 4} style={{ fill: c }}>{m.label}{m.erratum ? ' *' : ''}</text>
            <line x1={sx(m.value - s)} x2={sx(m.value + s)} y1={y} y2={y} stroke={c} strokeWidth={1.5} />
            {stat && <line x1={sx(m.value - stat.sigma)} x2={sx(m.value + stat.sigma)} y1={y} y2={y} stroke={c} strokeWidth={4} strokeOpacity={0.6} />}
            <circle cx={sx(m.value)} cy={y} r={4} fill={c} />
            <text x={sx(m.value)} y={y - 7} textAnchor="middle" style={{ fill: 'var(--text-dim)', fontSize: 10 }}>{m.value} ± {s.toFixed(2)}</text>
          </g>
        );
      })}
      <text x={padL + (W - padL - padR) / 2} y={H - 6} textAnchor="middle" style={{ fill: 'var(--text)' }}>H₀ (km/s/Mpc)</text>
    </svg>
  );
}

function H0Tab() {
  const { query } = useRoute();
  const refId = PLANCK_H0.some((p) => p.id === query.get('ref')) ? query.get('ref')! : 'planck-2018-bao';
  const ref = PLANCK_H0.find((p) => p.id === refId)!;
  const cmp = LADDER.planckReference.sh0esComparedWith;
  return (
    <>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Local H₀ against Planck <ProvenanceBadge cls="observed" title="published values; tensions computed here are labelled as derived" /></h1>
          <p className="note">The distance ladder measures today’s expansion rate directly. Planck infers it from the cosmic microwave background, and that inference assumes a model, base ΛCDM <SourceLinks ids={['planck-2018-vi', 'riess-2022']} />. The SH0ES team report a 5σ difference from Planck; the CCHP team find no statistically significant difference with the TRGB. Their own words are quoted below.</p></div>
        <ForestPlot items={ALL_H0} refId={refId} />
        <p className="note" style={{ fontSize: 10.5 }}>Thin bars: total uncertainty (components in quadrature); thick bars: statistical part where published separately. Shaded: ±1σ of the selected Planck value. Planck: 68 % intervals; local values: “±” as published, read as 1σ. * see the note on CCHP 2025. <SourceLinks ids={['planck-2018-vi', 'riess-2022', 'freedman-2021', 'freedman-2025']} /></p>
        <div className="section-title">In the authors’ words</div>
        {LADDER.statements.map((s) => (
          <figure key={s.text} style={{ margin: '6px 0' }}>
            <blockquote className="enc-quote">“{s.text}”</blockquote>
            <figcaption className="note" style={{ fontSize: 10.5 }}>— {s.where}, <SourceLinks ids={[s.source]} /></figcaption>
          </figure>
        ))}
      </div>
      <Panel id="ladder-h0-controls" className="left-panel" title="Compare with">
        {PLANCK_H0.map((p) => <label key={p.id} className="toggle-row"><span>{p.label}: {p.value} ± {p.parts[0].sigma}</span>
          <input type="radio" name="h0-ref" checked={p.id === refId} onChange={() => setQuery({ ref: p.id === 'planck-2018-bao' ? null : p.id })} aria-label={p.label} /></label>)}
        <p className="note" style={{ fontSize: 10.5 }}>{ref.note} <SourceLinks ids={['planck-2018-vi']} />. SH0ES 2022 compares with {cmp.value} ± {cmp.sigma}, the rounded no-BAO value.</p>
        <button className="chip" onClick={() => navigate(`/cosmic/universe?m=custom&H0=${SH0ES.value}&om=${PLANCK18.Om}&ol=${PLANCK18.Ode}`)}>Expansion with H₀ = {SH0ES.value} →</button>
      </Panel>
      <Panel id="ladder-h0-info" className="right-panel" title="Difference from Planck">
        <table className="table-mini" aria-label="Differences from Planck" style={{ width: '100%' }}>
          <thead><tr><th>Measurement</th><th>ΔH₀</th><th>Δ / σ <ProvenanceBadge cls="derived" title="computed here assuming independent Gaussian errors" /></th></tr></thead>
          <tbody>{LADDER.h0.map((m) => <tr key={m.id}><td>{m.label}{m.erratum ? ' *' : ''}</td><td>{(m.value - ref.value).toFixed(2)}</td><td>{tensionSigma(m.value, h0Sigma(m), ref.value, h0Sigma(ref)).toFixed(1)}σ</td></tr>)}</tbody>
        </table>
        <p className="note" style={{ fontSize: 10.5 }}>Δ/σ = |ΔH₀| / √(σ₁² + σ₂²), computed here. It assumes independent Gaussian errors and ignores shared systematics, so it is a rough guide, not the authors’ result. SH0ES quote their own difference in 5 log H₀: 0.176 ± 0.035 mag, 5.0σ (see quotes) <SourceLinks ids={['riess-2022']} />.</p>
        <dl className="kv" aria-label="Magnitude offset">
          <KV k="5 log₁₀(73.04 / Planck H₀)" v={`${muOffsetForH0(SH0ES.value, ref.value).toFixed(3)} mag`} />
          <KV k="Same, as a distance ratio" v={`${((ref.value / SH0ES.value - 1) * -100).toFixed(1)} % nearer with SH0ES H₀`} />
        </dl>
        {LADDER.h0.filter((m) => m.erratum).map((m) => <p key={m.id} className="note warn" style={{ fontSize: 10.5 }}>* {m.label}: {m.erratum}</p>)}
        <RelatedLinks id="context:distance-ladder" />
      </Panel>
    </>
  );
}

export default function LadderView() {
  const { query } = useRoute();
  const tab: Tab = (TABS.find(([t]) => t === query.get('tab'))?.[0]) ?? 'overview';
  return (
    <>
      <nav className="view-switch" aria-label="Distance ladder sections">
        {TABS.map(([t, label]) => <button key={t} className={tab === t ? 'active' : ''} onClick={() => setQuery({ tab: t === 'overview' ? null : t })}>{label}</button>)}
      </nav>
      {tab === 'parallax' ? <ParallaxTab /> : tab === 'cepheids' ? <CepheidsTab /> : tab === 'trgb' ? <TrgbTab /> : tab === 'sne' ? <SupernovaeTab /> : tab === 'h0' ? <H0Tab /> : <Overview />}
    </>
  );
}

