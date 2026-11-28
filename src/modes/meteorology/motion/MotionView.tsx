/**
 * Moving air, clouds and water — #/meteorology/motion?tab=coriolis|convection|clouds|rain|water|circulation  (Gate 20.4)
 *
 *  coriolis     a puck on a turntable (straight in space, curved to the turning observer); Humphreys' a = 2ωv sin φ
 *  convection   Rayleigh's 1916 threshold for a heated layer (his air values), Koschmieder's 1708; rolls if unstable
 *  clouds       the ten genera at their NWS base heights, NWS definitions and Howard's (1803/1865) originals
 *  rain         droplet to raindrop; Lull's drop sizes and fall speeds (USGS); coalescence and the ice-crystal process
 *  water        where Earth's water is (USGS after Shiklomanov) and how fast it cycles (NASA EO)
 *  circulation  Hadley, Ferrel and polar cells, the jet streams, and winds around highs and lows (NWS)
 */
import { useMemo } from 'react';
import { navigate, setQuery, useRoute } from '@/shared/router';
import { KV, Panel, ProvenanceBadge } from '@/ui/components';
import { SourceLinks } from '@/ui/SourcesView';
import { RelatedLinks } from '@/ui/RelatedLinks';
import { AtDepth, DepthSwitch } from '@/ui/Depth';
import { formatSig } from '@/core/units/units';
import { coriolisAccel, coriolisParam, dropletsPerDrop, fallTime, inertialRadius, OMEGA, RAYLEIGH_FREE, rayleighThreshold, turntablePath } from '@/core/meteorology/motion';
import data from '@datasets/meteorology/motion.json';

/* eslint-disable @typescript-eslint/no-explicit-any */
const D = data as any;
const ON = '#82b1ff';
const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
const num = (q: URLSearchParams, k: string, d: number, a: number, b: number) => { const v = Number(q.get(k)); return q.has(k) && Number.isFinite(v) ? clamp(v, a, b) : d; };
const Slider = ({ k, label, v, min, max, step, unit, aria, show }: { k: string; label: string; v: number; min: number; max: number; step: number; unit: string; aria: string; show?: string }) => (
  <label className="slider-row"><span style={{ minWidth: 96 }}>{label}</span><input type="range" min={min} max={max} step={step} value={v} aria-label={aria} onChange={(e) => setQuery({ [k]: e.target.value })} /><span>{show ?? v} {unit}</span></label>
);
const Related = ({ children }: { children?: React.ReactNode }) => <Panel id="mo-detail" className="right-panel" title="Related">{children}<RelatedLinks id="instrument:air-motion" limit={3} /></Panel>;

function Coriolis() {
  const { query } = useRoute();
  const spin = num(query, 'spin', 0.6, -1.5, 1.5), lat = num(query, 'lat', 45, -90, 90), v = num(query, 'v', 10, 1, 60);
  const path = useMemo(() => turntablePath(1, spin, 1.6, 120), [spin]);
  const C = D.coriolis, H = C.humphreys;
  const sc = 100, R = 165;
  const f = coriolisParam(lat), a = coriolisAccel(v, lat);
  return (
    <>
      <Panel id="c-controls" className="left-panel" title="A turning world">
        <Slider k="spin" label="turntable spin" v={spin} min={-1.5} max={1.5} step={0.05} unit="rad/s" aria="Turntable spin" />
        <p className="note">Positive spins anticlockwise (like the Northern Hemisphere seen from above the North Pole); negative, clockwise (like the Southern).</p>
        <Slider k="lat" label="latitude" v={lat} min={-90} max={90} step={1} unit="°" aria="Latitude" />
        <Slider k="v" label="wind speed" v={v} min={1} max={60} step={1} unit="m/s" aria="Wind speed" />
        <dl className="kv" aria-label="Coriolis values">
          <KV k="ω = 2π/86,164 s" v={OMEGA} unit="s⁻¹" sig={5} title="computed from Humphreys' sidereal day" />
          <KV k="2ω sin φ" v={f} unit="s⁻¹" sig={3} />
          <KV k="Acceleration 2ωv sin φ" v={Math.abs(a)} unit="m/s²" sig={3} />
          <KV k="Turns to the" v={lat > 0 ? 'right' : lat < 0 ? 'left' : '— (none at the equator)'} />
          <KV k="Inertial circle radius v/f" v={lat !== 0 ? inertialRadius(v, lat) / 1000 : Infinity} unit="km" sig={3} title="if nothing but the Coriolis force acted (derived)" />
        </dl>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>The Coriolis effect <ProvenanceBadge cls="illustrative" title="Turntable: exact kinematics of straight-line motion seen from a rotating frame" /><DepthSwitch /></h1>
          <p className="note">A puck slides straight out from the centre of a spinning table. Seen from the room it moves in a straight line; seen by someone riding the table, its track bends. Air moving over the turning Earth does the same.</p></div>
        <svg viewBox="-180 -180 360 360" role="img" aria-label="Turntable path" style={{ width: '100%', maxWidth: 360 }}>
          <circle r={R} fill="none" stroke="var(--line)" /><circle r={3} fill="var(--text-dim)" />
          <line x1={0} y1={0} x2={1.6 * sc} y2={0} stroke="#9aa6c8" strokeDasharray="5 4" />
          <polyline points={path.map(([x, y]) => `${x * sc},${-y * sc}`).join(' ')} fill="none" stroke={ON} strokeWidth={2.5} />
          <text x={-170} y={172} fontSize={11} fill="#9aa6c8">dashed: path seen from the room</text>
          <text x={-170} y={-160} fontSize={11} fill={ON}>solid: path seen riding the table</text>
          <text x={170} y={-160} textAnchor="end" fontSize={11} fill="var(--text-dim)">{spin > 0 ? 'table turns anticlockwise ↺' : spin < 0 ? 'table turns clockwise ↻' : 'table still'}</text>
        </svg>
        <p className="note">NOAA: “{C.nos.quote}” <SourceLinks ids={[C.nos.source]} /> NWS: a Coriolis force is “{C.glossary.force}” <SourceLinks ids={[C.glossary.source]} /></p>
        <AtDepth level="understand">
          <p className="note">Understand — high up, pressure differences push air from high to low and the Coriolis force turns it until it flows along the isobars. NWS: “{C.zhu.balance}” “{C.zhu.speed}” <SourceLinks ids={[C.zhu.source]} /> The geostrophic wind “{C.glossary.geostrophic}” <SourceLinks ids={[C.glossary.source]} /></p>
        </AtDepth>
        <AtDepth level="research">
          <p className="note">Research — Humphreys (1920), {H.where}: “{H.quote}” and “{H.omega}” <SourceLinks ids={[H.source]} /> Finding: 2π/86,164 s is 15° 2′ 28″ per hour, not the printed 15° 2′ 26″. The value 7.292 × 10⁻⁵ s⁻¹ shown here is computed from his sidereal day.</p>
        </AtDepth>
      </div>
      <Related><button className="chip" onClick={() => setQuery({ tab: 'circulation' })}>Global winds →</button><button className="chip" onClick={() => navigate('/cosmic/sandbox')}>Gravity and orbits →</button></Related>
    </>
  );
}

function Convection() {
  const { query } = useRoute();
  const zeta = num(query, 'zeta', 1, 0.2, 5), dT = num(query, 'dT', 12, 0, 40), T = 283;
  const C = D.convection, R = C.rayleigh, K = C.koschmieder;
  const need = rayleighThreshold(zeta), have = dT / T;   // ideal gas at constant pressure: Δρ/ρ ≈ ΔT/T (our step)
  const unstable = have > need;
  return (
    <>
      <Panel id="cv-controls" className="left-panel" title="Heat a thin layer of air">
        <Slider k="zeta" label="layer depth ζ" v={zeta} min={0.2} max={5} step={0.05} unit="cm" aria="Layer depth" />
        <Slider k="dT" label="hotter below by" v={dT} min={0} max={40} step={0.5} unit="°C" aria="Temperature difference" />
        <dl className="kv" aria-label="Convection values">
          <KV k="Rayleigh's threshold Δρ/ρ" v={need} sig={3} />
          <KV k="This layer's Δρ/ρ ≈ ΔT/T" v={have} sig={3} title="ideal gas at constant pressure, T = 283 K (our step)" />
          <KV k="Threshold as a temperature" v={need * T} unit="°C" sig={3} />
          <KV k="Convection?" v={unstable ? 'yes — overturning cells' : 'no — heat only conducts'} />
        </dl>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Convection <ProvenanceBadge cls="derived" title="Rayleigh's 1916 criterion with his own air values; cells drawn schematically" /><DepthSwitch /></h1>
          <p className="note">Warm air below cold air is top-heavy, but viscosity and heat conduction resist overturning. Past a threshold the layer breaks into rolls: warm air rises, cool air sinks.</p></div>
        <svg viewBox="0 0 560 170" role="img" aria-label="Convection cells" style={{ width: '100%', maxWidth: 560 }}>
          <rect x={10} y={20} width={540} height={110} fill="url(#cvg)" stroke="var(--line)" />
          <defs><linearGradient id="cvg" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#ff7a90" stopOpacity={0.35} /><stop offset="1" stopColor={ON} stopOpacity={0.25} /></linearGradient></defs>
          {unstable ? Array.from({ length: 6 }, (_, i) => { const cx = 55 + i * 90, dir = i % 2 ? 1 : 0; return <ellipse key={i} cx={cx} cy={75} rx={38} ry={40} fill="none" stroke={ON} strokeWidth={2} strokeDasharray={dir ? '6 4' : undefined} />; }) : <text x={280} y={80} textAnchor="middle" fontSize={13} fill="var(--text-dim)">still — below the threshold</text>}
          <text x={14} y={150} fontSize={11} fill="#ff7a90">hot plate</text><text x={14} y={14} fontSize={11} fill={ON}>cold plate</text>
          <text x={546} y={162} textAnchor="end" fontSize={10} fill="var(--text-dim)">schematic rolls (alternate rolls turn opposite ways)</text>
        </svg>
        <p className="note">Rayleigh (1916), {R.where}: instability when {R.eq}. “{R.stable}” “{R.example}” <SourceLinks ids={[R.source]} /> NWS: convection “{C.glossary.quote}” <SourceLinks ids={[C.glossary.source]} /></p>
        <AtDepth level="understand">
          <p className="note">Understand — in the sky, convection makes cumulus towers. NWS: an updraft is “{C.glossary.updraft}” “{C.anvil.quote}” <SourceLinks ids={[C.glossary.source, C.anvil.source]} /></p>
        </AtDepth>
        <AtDepth level="research">
          <p className="note">Research — Rayleigh's air: ν = ·14 cm²/s, κ = 5ν/2, g = 980 (CGS). His boundaries are free (no horizontal force); 27π⁴/4 = {formatSig(RAYLEIGH_FREE, 4)} (computed, not printed). Between plates, Koschmieder: {K.eq}; “{K.quote}” <SourceLinks ids={[K.source]} /> Converting Δρ/ρ to °C with T = 283 K is our ideal-gas step; Rayleigh's own “one-thirtieth part … about 9° C.” uses the same idea.</p>
        </AtDepth>
      </div>
      <Related><button className="chip" onClick={() => navigate('/meteorology/air?tab=stability')}>Stability of rising air →</button><button className="chip" onClick={() => navigate('/spectral/thermal')}>Heat transfer by radiation →</button></Related>
    </>
  );
}

const LVL_COL: Record<string, string> = { high: '#d6e4ff', middle: '#82b1ff', low: '#9aa6c8', vertical: '#f5c76b' };
function Clouds() {
  const { query } = useRoute();
  const G = D.clouds.genera as { g: string; lvl: string; base: [number, number]; def: string }[];
  const sel = G.find((x) => x.g === query.get('cloud')) ?? G[8];
  const Ho = D.clouds.howard, Z = D.clouds.zhu;
  const how = Ho.defs.find(([n]: [string, string]) => sel.g.toLowerCase().includes(n.toLowerCase()) && (n !== 'Cumulus' || !sel.g.startsWith('Cumulonimbus')));
  const W = 600, H = 300, y = (ft: number) => H - 30 - (ft / 36000) * (H - 50);
  return (
    <>
      <Panel id="cl-list" className="left-panel" title="Ten kinds of cloud">
        <div role="listbox" aria-label="Cloud genera" style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {G.map((x) => <button key={x.g} role="option" aria-selected={x.g === sel.g} className={`chip ${x.g === sel.g ? 'active' : ''}`} style={{ textAlign: 'left' }} onClick={() => setQuery({ cloud: x.g })}>{x.g} <span style={{ opacity: 0.7, fontSize: 11 }}>{x.lvl}</span></button>)}
        </div>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Clouds <ProvenanceBadge cls="observed" title="Base heights: NWS (approximate, mid-latitudes)" /><DepthSwitch /></h1>
          <p className="note">NWS: a cloud is “{D.clouds.cloudDef}” <SourceLinks ids={['nws-glossary']} /> Bars show each genus's typical base height. “{Z.note}” <SourceLinks ids={[Z.source]} /></p></div>
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Cloud base heights" style={{ width: '100%', maxWidth: W }}>
          {[0, 10000, 20000, 30000].map((ft) => <g key={ft}><line x1={60} x2={W - 10} y1={y(ft)} y2={y(ft)} stroke="var(--line)" /><text x={54} y={y(ft) + 4} textAnchor="end" fontSize={10} fill="var(--text-dim)">{ft.toLocaleString('en-US')} ft</text></g>)}
          {G.map((x, i) => { const cx = 80 + i * 51; return <g key={x.g} style={{ cursor: 'pointer' }} onClick={() => setQuery({ cloud: x.g })}><rect x={cx} y={y(x.base[1])} width={34} height={Math.max(3, y(x.base[0]) - y(x.base[1]))} rx={8} fill={LVL_COL[x.lvl]} opacity={x.g === sel.g ? 0.9 : 0.4} /><text x={cx + 17} y={H - 12} textAnchor="middle" fontSize={9} fill="var(--text)" transform={`rotate(-25 ${cx + 17} ${H - 12})`}>{x.g}</text></g>; })}
        </svg>
        <p className="note"><b>{sel.g}</b> (NWS): “{sel.def}” Base about {sel.base[0].toLocaleString('en-US')}–{sel.base[1].toLocaleString('en-US')} ft. <SourceLinks ids={['nws-glossary', Z.source]} /></p>
        {how ? <p className="note">Howard ({Ho.where}): <i>{how[0]}</i> — “{how[1]}” <SourceLinks ids={[Ho.source]} /></p> : null}
        <AtDepth level="understand"><p className="note">Understand — “{Z.history}” Howard: “{Ho.intro}” <SourceLinks ids={[Z.source, Ho.source]} /></p></AtDepth>
        <AtDepth level="research"><p className="note">Research — the NWS pages disagree on level boundaries: {D.clouds.levelsDisagree} The bars use the Houston/Galveston table: “{Z.levels}”.</p></AtDepth>
      </div>
      <Related><button className="chip" onClick={() => navigate('/meteorology/air')}>Dew point and cloud base →</button><button className="chip" onClick={() => setQuery({ tab: 'rain' })}>How rain forms →</button></Related>
    </>
  );
}

function Rain() {
  const { query } = useRoute();
  const h = num(query, 'h', 1500, 100, 6000);
  const Z = D.rain.zhu, Gl = D.rain.glossary, U = D.rain.usgs;
  return (
    <>
      <Panel id="r-controls" className="left-panel" title="From droplet to raindrop">
        <Slider k="h" label="cloud base" v={h} min={100} max={6000} step={50} unit="m" aria="Cloud base height" />
        <dl className="kv" aria-label="Fall times">
          <KV k="A cloud droplet (1.3 cm/s)" v={fallTime(h, Z.vDroplet) / 3600} unit="hours" sig={3} />
          {U.rows.slice(2).map((r: [string, number, number, number, number]) => <KV key={r[0]} k={`${r[0]} (${r[2]} mm, ${r[3]} m/s)`} v={fallTime(h, r[3]) / 60} unit="min" sig={3} />)}
          <KV k="Droplets in one 2 mm drop" v={dropletsPerDrop(2, 0.02)} sig={3} />
        </dl>
        <p className="note">Fall times are height ÷ terminal speed (our arithmetic; still air, no evaporation).</p>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>How rain forms <ProvenanceBadge cls="observed" title="Drop sizes and fall speeds after Lull (1959), via USGS" /><DepthSwitch /></h1>
          <p className="note">“{Z.droplet}” “{Z.fall}” “{Z.million}” <SourceLinks ids={[Z.source]} /></p></div>
        <table className="table-mini" aria-label="Precipitation size and speed">
          <thead><tr><th>intensity</th><th>cm/h</th><th>median diameter (mm)</th><th>fall speed (m/s)</th><th>drops per m² per s</th></tr></thead>
          <tbody>{U.rows.map((r: [string, number, number, number, number]) => <tr key={r[0]}><td>{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td><td>{r[3]}</td><td>{r[4].toLocaleString('en-US')}</td></tr>)}</tbody>
        </table>
        <p className="note">USGS, after {U.table}. “{U.quote}” <SourceLinks ids={[U.source]} /></p>
        <AtDepth level="understand">
          <p className="note">Understand — two ways to grow: collision and coalescence (“{Gl.coalescence}”; “{Z.coalesce}”), and the ice-crystal or Bergeron process (“{Gl.bergeron}”; “{Z.bergeron}”). “{Z.supercool}” <SourceLinks ids={[Gl.source, Z.source]} /></p>
        </AtDepth>
        <AtDepth level="research">
          <p className="note">Research — findings: {U.drizzleFinding} The Houston/Galveston page calls 0.02 mm a droplet's radius in one sentence and its diameter in another; the “million” works only for diameters, (2/0.02)³ = 10⁶. NWS: rain is “{Gl.rain}” drizzle “{Gl.drizzle}” <SourceLinks ids={[Gl.source]} /></p>
        </AtDepth>
      </div>
      <Related><button className="chip" onClick={() => setQuery({ tab: 'clouds' })}>Cloud types →</button><button className="chip" onClick={() => navigate('/meteorology/radiation?tab=aerosols')}>Condensation nuclei →</button></Related>
    </>
  );
}

function Water() {
  const W = D.water, U = W.usgs, N = W.nasa;
  const days = (N.atm / N.flux) * 365.25;
  const max = Math.log10(U.rows[0][1]);
  return (
    <>
      <Panel id="w-list" className="left-panel" title="Water on the move">
        <dl className="kv" aria-label="Water cycle values">
          <KV k="In the air at any moment" v={N.atm} unit="km³" />
          <KV k="Cycled through the air each year" v={N.flux} unit="km³" />
          <KV k="Average stay in the air" v={days} unit="days" sig={3} title="12,900 ÷ 495,000 per year (derived)" />
          <KV k="USGS" v="about 10 days" />
        </dl>
        <p className="note">NASA: “{N.quote}” “{N.depth}” <SourceLinks ids={[N.source]} /> USGS: “{W.evap.quote}” “{W.evap.days}” <SourceLinks ids={[W.evap.source]} /></p>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Where Earth's water is <ProvenanceBadge cls="observed" title="An estimate (Shiklomanov 1993) via USGS" /><DepthSwitch /></h1>
          <p className="note">“{U.quote}” Bars are on a logarithmic scale — each step is ten times more. <SourceLinks ids={[U.source]} /></p></div>
        <svg viewBox="0 0 600 300" role="img" aria-label="Water reservoirs" style={{ width: '100%', maxWidth: 600 }}>
          {U.rows.map((r: [string, number, number], i: number) => <g key={r[0]}><text x={210} y={22 + i * 27} textAnchor="end" fontSize={11} fill="var(--text)">{r[0]}</text><rect x={218} y={10 + i * 27} width={(Math.log10(r[1]) / max) * 300} height={16} fill={r[0] === 'Atmosphere' ? '#f5c76b' : ON} opacity={0.75} /><text x={224 + (Math.log10(r[1]) / max) * 300} y={22 + i * 27} fontSize={10} fill="var(--text-dim)">{r[1].toLocaleString('en-US')} km³ ({r[2]} %)</text></g>)}
        </svg>
        <p className="note">USGS table after {U.table}. <SourceLinks ids={[U.source]} /></p>
        <AtDepth level="understand"><p className="note">Understand — NASA: “{N.balance}” <SourceLinks ids={[N.source]} /></p></AtDepth>
        <AtDepth level="research"><p className="note">Research — the two agencies differ slightly: USGS says “About 71 percent” of the surface is water-covered, NASA “{N.cover}”; total water 332.5 vs 331 million cubic miles. The residence time from NASA's numbers, {formatSig(days, 2)} days, agrees with the USGS's “about 10 days”.</p></AtDepth>
      </div>
      <Related><button className="chip" onClick={() => navigate('/atomic/molecules')}>The water molecule →</button><button className="chip" onClick={() => navigate('/meteorology/air')}>Evaporation and humidity →</button></Related>
    </>
  );
}

function Circulation() {
  const { query } = useRoute();
  const south = query.get('hemi') === 'south';
  const Z = D.circulation.zhu, Gl = D.circulation.glossary;
  const W = 600, H = 260, x = (lat: number) => 40 + (lat / 90) * (W - 80);
  const cells: [string, number, number, boolean][] = [['Hadley', 0, 30, true], ['Ferrel', 30, 60, false], ['Polar', 60, 90, true]];
  return (
    <>
      <Panel id="ci-controls" className="left-panel" title="Highs and lows">
        <div role="radiogroup" aria-label="Hemisphere" className="chip-row" style={{ gap: 4 }}>
          {[['north', 'Northern'], ['south', 'Southern']].map(([k, l]) => <button key={k} role="radio" aria-checked={(k === 'south') === south} className={`chip ${(k === 'south') === south ? 'active' : ''}`} onClick={() => setQuery({ hemi: k === 'south' ? 'south' : null })}>{l}</button>)}
        </div>
        <svg viewBox="0 0 260 130" role="img" aria-label="Winds around a low and a high" style={{ width: '100%' }}>
          {[['L', 65, south ? 1 : 0], ['H', 195, south ? 0 : 1]].map(([t, cx, cw]) => <g key={t as string}><circle cx={cx as number} cy={62} r={42} fill="none" stroke={t === 'L' ? '#ff7a90' : ON} strokeWidth={2} /><path d={`M ${(cx as number) + 42} 62 a 42 42 0 0 ${cw} -16 -38`} fill="none" stroke={t === 'L' ? '#ff7a90' : ON} strokeWidth={4} /><polygon points={cw ? `${(cx as number) + 22},${24} ${(cx as number) + 30},${16} ${(cx as number) + 32},${28}` : `${(cx as number) + 22},${100} ${(cx as number) + 30},${108} ${(cx as number) + 32},${96}`} fill={t === 'L' ? '#ff7a90' : ON} /><text x={cx as number} y={68} textAnchor="middle" fontSize={18} fill="var(--text)">{t as string}</text></g>)}
          <text x={130} y={125} textAnchor="middle" fontSize={10} fill="var(--text-dim)">{south ? 'low clockwise, high anticlockwise' : 'low anticlockwise, high clockwise'}</text>
        </svg>
        <p className="note">NWS: a cyclone is “{Gl.cyclone}”; an anticyclone “{Gl.anticyclone}”. <SourceLinks ids={[Gl.source]} /></p>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>The global circulation <ProvenanceBadge cls="illustrative" title="Three-cell picture from NWS training material; a simplification of the real circulation" /><DepthSwitch /></h1>
          <p className="note">“{Z.winds}” <SourceLinks ids={[Z.source]} /></p></div>
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Three-cell circulation" style={{ width: '100%', maxWidth: W }}>
          <rect x={40} y={200} width={W - 80} height={14} fill="#3b5a3a" opacity={0.6} />
          {cells.map(([n, a, b, direct]) => { const cx = (x(a) + x(b)) / 2, rx = (x(b) - x(a)) / 2 - 6; return <g key={n}><ellipse cx={cx} cy={140} rx={rx} ry={52} fill="none" stroke={direct ? '#ff7a90' : ON} strokeWidth={2} /><text x={cx} y={144} textAnchor="middle" fontSize={13} fill="var(--text)">{n}</text></g>; })}
          {[0, 30, 60, 90].map((l) => <g key={l}><line x1={x(l)} x2={x(l)} y1={70} y2={214} stroke="var(--line)" strokeDasharray="3 3" /><text x={x(l)} y={232} textAnchor="middle" fontSize={11} fill="var(--text-dim)">{l}°</text></g>)}
          <text x={x(15)} y={250} textAnchor="middle" fontSize={11} fill={ON}>trade winds</text><text x={x(45)} y={250} textAnchor="middle" fontSize={11} fill={ON}>westerlies</text><text x={x(75)} y={250} textAnchor="middle" fontSize={11} fill={ON}>polar easterlies</text>
          <text x={x(30)} y={60} textAnchor="middle" fontSize={11} fill="#f5c76b">subtropical jet</text><text x={x(60)} y={60} textAnchor="middle" fontSize={11} fill="#f5c76b">polar jet</text>
          <text x={W - 40} y={18} textAnchor="end" fontSize={10} fill="var(--text-dim)">latitude (one hemisphere); heights not to scale</text>
        </svg>
        <p className="note">Hadley cell: “{Z.hadley}” Ferrel cell: “{Z.ferrel}” Polar cell: “{Z.polar}” <SourceLinks ids={[Z.source]} /></p>
        <AtDepth level="understand"><p className="note">Understand — jet streams: “{Z.jet}” “{Z.jetSpeed}” “{Z.jetDir}”. The subtropical jet “{Gl.stj}” <SourceLinks ids={[Z.source, Gl.source]} /></p></AtDepth>
        <AtDepth level="research"><p className="note">Research — near the ground friction breaks the balance: “{Z.friction}” “{Z.frictionDepth}” Under a high: “{D.circulation.sinking.quote}” <SourceLinks ids={[Z.source, D.circulation.sinking.source]} /> The jet labels mark the cell boundaries where the NWS places them only approximately.</p></AtDepth>
      </div>
      <Related><button className="chip" onClick={() => setQuery({ tab: 'coriolis' })}>The Coriolis effect →</button><button className="chip" onClick={() => navigate('/meteorology/radiation')}>What drives it: sunlight →</button></Related>
    </>
  );
}

const TABS: [string, string][] = [['coriolis', 'Coriolis'], ['convection', 'Convection'], ['clouds', 'Clouds'], ['rain', 'Rain'], ['water', 'Water cycle'], ['circulation', 'Circulation']];
export default function MotionView() {
  const { query } = useRoute();
  const tab = TABS.find(([t]) => t === query.get('tab'))?.[0] ?? 'coriolis';
  return (
    <>
      <nav className="view-switch" aria-label="Motion sections">{TABS.map(([t, l]) => <button key={t} className={tab === t ? 'active' : ''} onClick={() => setQuery({ tab: t === 'coriolis' ? null : t })}>{l}</button>)}</nav>
      {tab === 'convection' ? <Convection /> : tab === 'clouds' ? <Clouds /> : tab === 'rain' ? <Rain /> : tab === 'water' ? <Water /> : tab === 'circulation' ? <Circulation /> : <Coriolis />}
    </>
  );
}
