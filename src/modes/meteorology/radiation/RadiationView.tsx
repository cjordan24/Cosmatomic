/**
 * Sunlight, heat and the greenhouse effect — #/meteorology/radiation?tab=budget|bands|forcing|ozone|aerosols   (Gate 20.3)
 *
 *  budget    NASA's global energy budget (W/m², My NASA Data after Loeb 2009 / Trenberth 2009), checked to add up;
 *            an effective-temperature calculator (Stefan–Boltzmann) against the NASA fact sheet's 254.0 K
 *  bands     NASA TN D-1850's infrared bands of H₂O, O₃ and CO₂ under the 288 K surface's Planck curve
 *  forcing   CO₂ forcing: Penn State's 5.35 ln(C/C₀) and NOAA's AR6 expression; NOAA's 2025 AGGI by gas
 *  ozone     how ozone forms (WMO/NOAA), Dobson units, UV bands
 *  aerosols  what aerosols do (NASA Earth Observatory)
 */
import { useMemo } from 'react';
import { navigate, setQuery, useRoute } from '@/shared/router';
import { KV, Panel, ProvenanceBadge } from '@/ui/components';
import { SourceLinks } from '@/ui/SourcesView';
import { RelatedLinks } from '@/ui/RelatedLinks';
import { AtDepth, DepthSwitch } from '@/ui/Depth';
import { formatSig } from '@/core/units/units';
import { planckLambda } from '@/core/physics/em/em';
import { co2ForcingAR6, co2ForcingSimple, duToMm, duToMolecules, effectiveTemp } from '@/core/meteorology/atmosphere';
import data from '@datasets/meteorology/atmosphere.json';

/* eslint-disable @typescript-eslint/no-explicit-any */
const D = data as any;
const ON = '#82b1ff', SUN = '#f5c76b', IR = '#ff7a90';
const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
const num = (q: URLSearchParams, k: string, d: number, a: number, b: number) => { const v = Number(q.get(k)); return q.has(k) && Number.isFinite(v) ? clamp(v, a, b) : d; };
const Related = ({ children }: { children?: React.ReactNode }) => <Panel id="r-detail" className="right-panel" title="Related">{children}<RelatedLinks id="instrument:radiation-budget" limit={3} /></Panel>;

function Arrow({ x, y1, y2, w, color, label, v, side = 1, ly }: { x: number; y1: number; y2: number; w: number; color: string; label: string; v: number; side?: number; ly?: number }) {
  const up = y2 < y1, hw = Math.max(2, w / 2);
  return (
    <g>
      <rect x={x - hw} y={Math.min(y1, y2) + (up ? 10 : 0)} width={hw * 2} height={Math.abs(y2 - y1) - 10} fill={color} opacity={0.55} />
      <polygon points={up ? `${x - hw - 4},${y2 + 10} ${x + hw + 4},${y2 + 10} ${x},${y2}` : `${x - hw - 4},${y2 - 10} ${x + hw + 4},${y2 - 10} ${x},${y2}`} fill={color} opacity={0.8} />
      <text x={x + side * (hw + 6)} y={ly ?? (y1 + y2) / 2} textAnchor={side > 0 ? 'start' : 'end'} fontSize={11} fill="var(--text)">{v}</text>
      <text x={x + side * (hw + 6)} y={(ly ?? (y1 + y2) / 2) + 13} textAnchor={side > 0 ? 'start' : 'end'} fontSize={9.5} fill="var(--text-dim)">{label}</text>
    </g>
  );
}

function Budget() {
  const { query } = useRoute();
  const a = num(query, 'albedo', D.fact.albedo, 0.05, 0.9), S = D.fact.tsi;
  const B = D.budget, v = B.v, Te = effectiveTemp(S, a);
  const sc = 0.12, top = 30, atm = 150, sfc = 270;
  const sumTop = v.incoming - v.reflected - v.olr, sumSfc = v.absSurf + v.back - v.surfEmit - v.thermals - v.latent;
  return (
    <>
      <Panel id="b-controls" className="left-panel" title="A planet's temperature">
        <label className="slider-row"><span style={{ minWidth: 60 }}>albedo</span><input type="range" min={0.05} max={0.9} step={0.001} value={a} aria-label="Albedo" onChange={(e) => setQuery({ albedo: e.target.value })} /><span>{a.toFixed(3)}</span></label>
        <dl className="kv" aria-label="Balance values">
          <KV k="Sunlight at Earth (S)" v={S} unit="W/m²" />
          <KV k="Absorbed, averaged S(1 − α)/4" v={(S * (1 - a)) / 4} unit="W/m²" sig={4} />
          <KV k="Effective temperature" v={Te} unit="K" sig={4} />
          <KV k="NASA fact sheet (α 0.294)" v={D.fact.tbb} unit="K" />
        </dl>
        <p className="note">The effective temperature is the blackbody temperature that radiates away exactly the sunlight absorbed (Stefan–Boltzmann; our calculation). NASA: “{D.eo.greenhouse}” <SourceLinks ids={[D.eo.source, D.fact.source]} /></p>
        <AtDepth level="research"><p className="note">Finding: [1361 × (1 − 0.294)/(4σ)]^¼ = {formatSig(effectiveTemp(S, 0.294), 4)} K; the fact sheet prints 254.0 K (its method is not stated). σ from the NASA glossary. <SourceLinks ids={['nasa-glossary']} /></p></AtDepth>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Earth's energy budget <ProvenanceBadge cls="observed" title="Ten-year averages from CERES satellites with reanalysis (NASA after Loeb 2009, Trenberth 2009)" /><DepthSwitch /></h1>
          <p className="note">Arrow widths are proportional to the flows, in watts per square metre averaged over the whole planet. Yellow: sunlight; red: infrared heat; blue: heat carried up by rising air and evaporation.</p></div>
        <svg viewBox="0 0 720 300" role="img" aria-label="Energy budget diagram" style={{ width: '100%', maxWidth: 720 }}>
          <line x1={0} x2={720} y1={top} y2={top} stroke="var(--line)" strokeDasharray="4 4" /><text x={4} y={top - 6} fontSize={10} fill="var(--text-dim)">top of atmosphere</text>
          <rect x={0} y={atm - 40} width={720} height={80} fill={ON} opacity={0.06} /><text x={4} y={atm - 28} fontSize={10} fill="var(--text-dim)">atmosphere</text>
          <rect x={0} y={sfc} width={720} height={30} fill="#3b5a3a" opacity={0.5} /><text x={4} y={sfc + 18} fontSize={10} fill="var(--text-dim)">surface</text>
          <Arrow x={50} y1={top - 25} y2={sfc} w={v.incoming * sc} color={SUN} label="incoming sunlight" v={v.incoming} ly={215} />
          <Arrow x={140} y1={atm} y2={top - 25} w={v.reflAtm * sc} color={SUN} label="reflected by clouds, air" v={v.reflAtm} ly={88} />
          <Arrow x={225} y1={sfc} y2={top - 25} w={v.reflSurf * sc} color={SUN} label="reflected by surface" v={v.reflSurf} ly={150} />
          <Arrow x={330} y1={sfc} y2={atm} w={v.latent * sc} color={ON} label="latent heat" v={v.latent} ly={220} />
          <Arrow x={400} y1={sfc} y2={atm} w={v.thermals * sc} color={ON} label="thermals" v={v.thermals} ly={250} />
          <Arrow x={480} y1={sfc} y2={atm + 30} w={v.surfEmit * sc} color={IR} label="surface infrared" v={v.surfEmit} ly={205} />
          <Arrow x={620} y1={atm + 30} y2={sfc} w={v.back * sc} color={IR} label="back radiation" v={v.back} side={-1} ly={252} />
          <Arrow x={680} y1={atm} y2={top - 25} w={v.olr * sc} color={IR} label="outgoing infrared" v={v.olr} side={-1} ly={80} />
        </svg>
        <p className="note">NASA (My NASA Data): “{B.caption}” Credit: {B.credit}. “{B.balance}” <SourceLinks ids={[B.source]} /></p>
        <AtDepth level="understand">
          <p className="note">Understand — the books balance. Top: {v.incoming} − {v.reflected} − {v.olr} = {formatSig(sumTop, 2)} W/m² kept; surface: {v.absSurf} + {v.back} − {v.surfEmit} − {v.thermals} − {v.latent} = {formatSig(sumSfc, 2)}. The outgoing {v.olr} is {v.emAtm} from the air, {v.emCloud} from clouds and {v.window} straight through the window. NASA: “{D.eo.quarter}” <SourceLinks ids={[D.eo.source]} /></p>
        </AtDepth>
        <AtDepth level="research">
          <p className="note">Research — the diagram's 0.6 W/m² net differs from Earth Observatory's (2009) “{D.eo.imbalance}” — different periods and estimates. <SourceLinks ids={[D.eo.source]} /></p>
        </AtDepth>
      </div>
      <Related><button className="chip" onClick={() => navigate('/spectral/thermal')}>Planck, Wien, Stefan–Boltzmann →</button><button className="chip" onClick={() => setQuery({ tab: 'bands' })}>Which gases absorb →</button></Related>
    </>
  );
}

const GAS_COL: Record<string, string> = { 'H₂O': '#7df9ff', 'O₃': '#b18cff', 'CO₂': '#ff7a90', 'H₂O continuum': '#55607a' };
function Bands() {
  const B = D.bands;
  const planck = useMemo(() => Array.from({ length: 200 }, (_, i) => { const um = 3 + i * 0.25; return [um, planckLambda(um * 1e-6, 288) * 1e-6] as [number, number]; }), []);
  const max = Math.max(...planck.map((p) => p[1]));
  const W = 600, H = 220, x = (um: number) => 40 + ((Math.log(um) - Math.log(3)) / (Math.log(60) - Math.log(3))) * (W - 60), y = (v: number) => H - 30 - (v / max) * (H - 60);
  return (
    <>
      <Panel id="bd-list" className="left-panel" title="Bands (NASA TN D-1850)">
        <table className="table-mini" aria-label="Absorption bands">
          <thead><tr><th>µm</th><th>major</th><th>secondary</th></tr></thead>
          <tbody>{B.rows.map((r: [number, number, string, string]) => <tr key={r[0]}><td>{r[0]}–{r[1]}</td><td style={{ color: GAS_COL[r[2]] }}>{r[2]}</td><td>{r[3]}</td></tr>)}</tbody>
        </table>
        <p className="note">“{B.quote}” “{B.gaps}” <SourceLinks ids={[B.source]} /></p>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Which gases trap heat <ProvenanceBadge cls="derived" title="Band intervals from NASA TN D-1850 (1963 model study); Planck curve computed" /><DepthSwitch /></h1>
          <p className="note">The ground glows in infrared (curve: a 288 K blackbody). Shaded bands are absorbed by water vapour, ozone and carbon dioxide; the gap near 10 µm is the window through which heat escapes to space.</p></div>
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Infrared absorption bands" style={{ width: '100%', maxWidth: W }}>
          {B.rows.map((r: [number, number, string, string]) => <rect key={r[0]} x={x(r[0])} y={20} width={Math.max(2, x(Math.min(60, r[1])) - x(r[0]))} height={H - 50} fill={GAS_COL[r[2]]} opacity={r[2] === 'H₂O continuum' ? 0.15 : 0.28} />)}
          {B.rows.map((r: [number, number, string, string]) => <text key={`t${r[0]}`} x={x(r[0]) + 3} y={34} fontSize={10.5} fill={GAS_COL[r[2]]}>{r[2] === 'H₂O continuum' ? 'window' : r[2]}</text>)}
          <polyline points={planck.map(([u, b]) => `${x(u)},${y(b)}`).join(' ')} fill="none" stroke={SUN} strokeWidth={2} />
          {[3, 5, 10, 15, 20, 30, 60].map((u) => <text key={u} x={x(u)} y={H - 12} textAnchor="middle" fontSize={10} fill="var(--text-dim)">{u}</text>)}
          <text x={W - 10} y={H - 1} textAnchor="end" fontSize={10} fill="var(--text-dim)">wavelength (µm, log)</text>
        </svg>
        <p className="note">NASA Earth Observatory: “{D.eo.transparent}” “{D.eo.window}” “{D.eo.co2}” <SourceLinks ids={[D.eo.source]} /></p>
        <AtDepth level="research"><p className="note">Research — TN D-1850 is a 1963 radiative-transfer model study (intervals chosen for calculation), not a line-by-line spectrum; CO₂'s 4.3 µm and methane's 7.7 µm bands are not covered by the sources read.</p></AtDepth>
      </div>
      <Related><button className="chip" onClick={() => navigate('/spectral/spectroscopy')}>Molecular spectra →</button><button className="chip" onClick={() => navigate('/atomic/molecules')}>CO₂ and H₂O molecules →</button><button className="chip" onClick={() => setQuery({ tab: 'forcing' })}>More CO₂ →</button></Related>
    </>
  );
}

function Forcing() {
  const { query } = useRoute();
  const C = num(query, 'co2', 425.62, 180, 1000);
  const A = D.forcing.aggi, P = D.forcing.psu, M = D.forcing.gml;
  const ar6 = co2ForcingAR6(C, A.n2oppb, A.c0), simple = co2ForcingSimple(C, 280);
  const gases: [string, number][] = [['CO₂', A.co2], ['CH₄', A.ch4], ['N₂O', A.n2o], ['CFCs', A.cfc], ['HCFCs', A.hcfc], ['HFCs', A.hfc]];
  return (
    <>
      <Panel id="f-controls" className="left-panel" title="Add or remove CO₂">
        <label className="slider-row"><span style={{ minWidth: 50 }}>CO₂</span><input type="range" min={180} max={1000} step={0.5} value={C} aria-label="CO2 concentration" onChange={(e) => setQuery({ co2: e.target.value })} /><span>{formatSig(C, 5)} ppm</span></label>
        <div className="chip-row" style={{ flexWrap: 'wrap', gap: 4 }}>
          <button className="chip" onClick={() => setQuery({ co2: String(A.c0) })}>Pre-industrial ({A.c0})</button>
          <button className="chip" onClick={() => setQuery({ co2: String(A.co2ppm) })}>2025 ({A.co2ppm})</button>
          <button className="chip" onClick={() => setQuery({ co2: '560' })}>Double 280</button>
        </div>
        <dl className="kv" aria-label="Forcing values">
          <KV k="AR6 expression (NOAA), vs 278.3 ppm" v={ar6} unit="W/m²" sig={3} />
          <KV k="5.35 ln(C/280) (Penn State)" v={simple} unit="W/m²" sig={3} />
        </dl>
        <p className="note">Latest monthly means (NOAA, preliminary): global {M.global} ppm ({M.globalMonth}); Mauna Loa {M.mlo} ppm ({M.mloMonth}). <SourceLinks ids={[M.source]} /></p>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Greenhouse forcing <ProvenanceBadge cls="observed" title="Concentrations measured by NOAA; forcing computed from them with IPCC AR6 expressions" /><DepthSwitch /></h1>
          <p className="note">NOAA: in 2025 these gases meant “an additional 3.59 W m-2 of heat being retained by Earth's climate system relative to preindustrial times.” <SourceLinks ids={['noaa-aggi']} /> In both formulas below the forcing grows with the logarithm of the concentration, so each doubling adds about the same amount.</p></div>
        <svg viewBox="0 0 560 200" role="img" aria-label="Forcing by gas, 2025" style={{ width: '100%', maxWidth: 560 }}>
          {gases.map(([g, f], i) => <g key={g}><text x={60} y={28 + i * 28} textAnchor="end" fontSize={12} fill="var(--text)">{g}</text><rect x={70} y={16 + i * 28} width={(f / A.co2) * 400} height={18} fill={ON} opacity={0.75} /><text x={76 + (f / A.co2) * 400} y={30 + i * 28} fontSize={11} fill="var(--text-dim)">{f} W/m²</text></g>)}
        </svg>
        <p className="note">NOAA AGGI, 2025: total {A.total} W/m². “{A.quote}” “{A.share}” <SourceLinks ids={[A.source]} /></p>
        <AtDepth level="understand">
          <p className="note">Understand — Penn State: {P.eq}. “{P.doubling}” <SourceLinks ids={[P.source]} /> NOAA: CO₂ “{A.pre}” <SourceLinks ids={[A.source]} /></p>
        </AtDepth>
        <AtDepth level="research">
          <p className="note">Research — NOAA's Table 1 (IPCC AR6, Meinshausen et al. 2020): ΔF = (α′ + c₁√N) ln(C/C₀) e₁, α′ = d₁ + a₁(C − C₀)² + b₁(C − C₀), with d₁ 5.2488, a₁ −2.48 × 10⁻⁷, b₁ 7.59 × 10⁻⁴, c₁ −2.15 × 10⁻³, e₁ 1.05, C₀ 278.3 ppm, N = N₂O ({A.n2oppb} ppb, 2025, held fixed here). At 425.62 ppm it gives {formatSig(co2ForcingAR6(425.62, A.n2oppb, A.c0), 4)} W/m² against NOAA's printed {A.co2}. Values far beyond today's are extrapolations. Finding: {A.captionFinding} Penn State takes C₀ = 280 ppm; NOAA 278.3.</p>
        </AtDepth>
      </div>
      <Related><button className="chip" onClick={() => setQuery({ tab: 'bands' })}>Why CO₂ absorbs →</button><button className="chip" onClick={() => navigate('/atomic/molecules')}>The molecules →</button></Related>
    </>
  );
}

function Ozone() {
  const { query } = useRoute();
  const du = num(query, 'du', 300, 100, 500), O = D.ozone;
  return (
    <>
      <Panel id="o-controls" className="left-panel" title="A column of ozone">
        <label className="slider-row"><span style={{ minWidth: 50 }}>column</span><input type="range" min={100} max={500} step={1} value={du} aria-label="Total ozone column" onChange={(e) => setQuery({ du: e.target.value })} /><span>{du} DU</span></label>
        <dl className="kv" aria-label="Ozone values">
          <KV k="Molecules over each cm²" v={duToMolecules(du)} sig={4} />
          <KV k="As pure ozone at the surface" v={duToMm(du)} unit="mm" sig={3} />
          <KV k="Inside the ozone-hole contour?" v={du < 220 ? 'yes (below 220 DU)' : 'no'} />
        </dl>
        <p className="note">“{O.du}” “{O.thickness}” 1 DU = 2.687 × 10¹⁶ molecules/cm². <SourceLinks ids={[O.source]} /></p>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>The ozone layer <ProvenanceBadge cls="observed" title="WMO/NOAA assessment, 2022" /><DepthSwitch /></h1>
          <p className="note">“{O.make}” <SourceLinks ids={[O.source]} /></p></div>
        <svg viewBox="0 0 560 110" role="img" aria-label="Ultraviolet bands" style={{ width: '100%', maxWidth: 560 }}>
          {[[100, 280, 'UV-C', 1], [280, 315, 'UV-B', 0.75], [315, 400, 'UV-A (not stated)', 0]].map(([a, b, l, abs]) => { const x = (n: number) => 20 + ((n as number) - 100) / 300 * 520; return <g key={l as string}><rect x={x(a as number)} y={20} width={x(b as number) - x(a as number)} height={40} fill="#b18cff" opacity={0.15 + 0.6 * (abs as number)} /><text x={(x(a as number) + x(b as number)) / 2} y={45} textAnchor="middle" fontSize={12} fill="var(--text)">{l as string}</text><text x={x(a as number)} y={78} fontSize={10} fill="var(--text-dim)">{a as number} nm</text></g>; })}
          <text x={540} y={78} textAnchor="end" fontSize={10} fill="var(--text-dim)">400 nm</text>
          <text x={20} y={100} fontSize={10} fill="var(--text-dim)">shading: UV-C “entirely absorbed”, UV-B “most” absorbed (qualitative); UV-A not stated</text>
        </svg>
        <p className="note">“{O.uv}” “{O.uvAbs}” “{O.where}” <SourceLinks ids={[O.source]} /></p>
        <AtDepth level="understand"><p className="note">Understand — the Antarctic ozone hole: “{O.hole}” <SourceLinks ids={[O.source]} /></p></AtDepth>
      </div>
      <Related><button className="chip" onClick={() => navigate('/spectral')}>Ultraviolet on the spectrum →</button><button className="chip" onClick={() => navigate('/meteorology?z=25000')}>25 km up →</button></Related>
    </>
  );
}

function Aerosols() {
  const A = D.aerosols;
  return (
    <>
      <Panel id="a-list" className="left-panel" title="Aerosols">
        <p className="note">“{A.size}” “{A.groups}” “{A.life}” <SourceLinks ids={[A.source]} /></p>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Aerosols: dust, smoke, salt and sulfate <ProvenanceBadge cls="observed" title="NASA Earth Observatory synthesis; one statement is model output (labelled)" /><DepthSwitch /></h1>
          <p className="note">“{A.effect}” <SourceLinks ids={[A.source]} /></p></div>
        <p className="note">Seeds for clouds: “{A.ccn}” <SourceLinks ids={[A.source]} /></p>
        <AtDepth level="understand"><p className="note">Understand — single-scattering albedo: “{A.ssa}” <SourceLinks ids={[A.source]} /></p></AtDepth>
        <AtDepth level="research"><p className="note">Research — model output (labelled as such by NASA): “{A.model}” <SourceLinks ids={[A.source]} /></p></AtDepth>
      </div>
      <Related><button className="chip" onClick={() => navigate('/spectral/atmosphere')}>Aerosol optical depth →</button><button className="chip" onClick={() => navigate('/meteorology/air')}>Clouds and humidity →</button></Related>
    </>
  );
}

const TABS: [string, string][] = [['budget', 'Energy budget'], ['bands', 'Absorption'], ['forcing', 'Greenhouse forcing'], ['ozone', 'Ozone'], ['aerosols', 'Aerosols']];
export default function RadiationView() {
  const { query } = useRoute();
  const tab = TABS.find(([t]) => t === query.get('tab'))?.[0] ?? 'budget';
  return (
    <>
      <nav className="view-switch" aria-label="Radiation sections">{TABS.map(([t, l]) => <button key={t} className={tab === t ? 'active' : ''} onClick={() => setQuery({ tab: t === 'budget' ? null : t })}>{l}</button>)}</nav>
      {tab === 'bands' ? <Bands /> : tab === 'forcing' ? <Forcing /> : tab === 'ozone' ? <Ozone /> : tab === 'aerosols' ? <Aerosols /> : <Budget />}
    </>
  );
}
