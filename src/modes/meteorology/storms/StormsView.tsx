/**
 * Storm laboratory — #/meteorology/storms?storm=hurricane|thunderstorm|tornado|midlatitude|winter|heat|monsoon   (Gate 21.1)
 *
 * For each storm: what it is, what it needs, its structure (schematic), its life cycle, adjustable variables with the
 * official scale or index, an observed historical case, where and when it happens, how it ends, and the sources —
 * the nine items of the Meteorology brief §4. Every sentence is quoted from NOAA (NHC, NSSL, NWS, WPC), NASA or
 * Penn State; calculators use the official scales and formulas.
 */
import { setQuery, navigate, useRoute } from '@/shared/router';
import { KV, Panel, ProvenanceBadge } from '@/ui/components';
import { SourceLinks } from '@/ui/SourcesView';
import { RelatedLinks } from '@/ui/RelatedLinks';
import { AtDepth, DepthSwitch } from '@/ui/Depth';
import { efScale, heatIndexF, isBlizzard, ktToMph, saffirSimpson, windChillF } from '@/core/meteorology/storms';
import data from '@datasets/meteorology/storms.json';

/* eslint-disable @typescript-eslint/no-explicit-any */
const D = data as any;
const ON = '#82b1ff', WARM = '#ff7a90';
const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
const num = (q: URLSearchParams, k: string, d: number, a: number, b: number) => { const v = Number(q.get(k)); return q.has(k) && Number.isFinite(v) ? clamp(v, a, b) : d; };
const Slider = ({ k, label, v, min, max, step, unit, aria }: { k: string; label: string; v: number; min: number; max: number; step: number; unit: string; aria: string }) => (
  <label className="slider-row"><span style={{ minWidth: 92 }}>{label}</span><input type="range" min={min} max={max} step={step} value={v} aria-label={aria} onChange={(e) => setQuery({ [k]: e.target.value })} /><span>{v} {unit}</span></label>
);
const Q = ({ x }: { x: { s: string; q: string } | null | undefined }) => (x ? <>“{x.q}” <SourceLinks ids={[x.s]} /> </> : null);

/** Schematic structure drawings (illustrative; labelled with the quoted parts). */
function Structure({ id, stage }: { id: string; stage: number }) {
  if (id === 'hurricane') return (
    <svg viewBox="0 0 560 200" role="img" aria-label="Hurricane cross-section" style={{ width: '100%', maxWidth: 560 }}>
      <rect x={0} y={170} width={560} height={30} fill="#1d3b5a" />
      {[-1, 1].map((sgn) => <g key={sgn}>
        <path d={`M ${280 + sgn * 30} 170 C ${280 + sgn * 30} 80 ${280 + sgn * 50} 40 ${280 + sgn * 70} 30 L ${280 + sgn * 90} 40 C ${280 + sgn * 80} 80 ${280 + sgn * 75} 120 ${280 + sgn * 70} 170 Z`} fill={ON} opacity={0.7} />
        {[150, 200, 245].map((d, i) => <path key={d} d={`M ${280 + sgn * d} 170 Q ${280 + sgn * (d + 10)} ${110 + i * 12} ${280 + sgn * (d + 25)} ${120 + i * 10} L ${280 + sgn * (d + 30)} 170 Z`} fill={ON} opacity={0.35} />)}
      </g>)}
      <path d="M 210 30 Q 280 10 350 30" fill="none" stroke={ON} opacity={0.4} />
      <text x={280} y={110} textAnchor="middle" fontSize={11} fill="var(--text)">eye</text>
      <text x={370} y={20} fontSize={11} fill="var(--text-dim)">eyewall</text><text x={490} y={110} fontSize={11} fill="var(--text-dim)">rain bands</text>
      <text x={8} y={190} fontSize={10} fill="var(--text-dim)">warm ocean</text>
      <text x={552} y={196} textAnchor="end" fontSize={9.5} fill="var(--text-dim)">schematic, not to scale</text>
    </svg>);
  if (id === 'thunderstorm' || id === 'tornado' || id === 'monsoon') {
    const st = id === 'thunderstorm' ? stage : 1, h = [70, 150, 120][st] ?? 150, anvil = st >= 1;
    return (
      <svg viewBox="0 0 560 200" role="img" aria-label="Thunderstorm cell" style={{ width: '100%', maxWidth: 560 }}>
        <rect x={0} y={180} width={560} height={20} fill="#3b5a3a" opacity={0.6} />
        <path d={`M 230 180 C 220 ${180 - h * 0.6} 250 ${180 - h} 280 ${180 - h} C 310 ${180 - h} 340 ${180 - h * 0.6} 330 180 Z`} fill={ON} opacity={st === 2 ? 0.35 : 0.7} />
        {anvil ? <path d={`M 200 ${180 - h} L 400 ${180 - h - 6} L 410 ${180 - h + 8} L 210 ${180 - h + 10} Z`} fill={ON} opacity={st === 2 ? 0.3 : 0.55} /> : null}
        <line x1={260} x2={260} y1={175} y2={190 - h} stroke={WARM} strokeWidth={3} opacity={st === 2 ? 0.25 : 0.9} /><text x={248} y={196 - h} textAnchor="end" fontSize={10} fill={WARM}>updraft</text>
        {st >= 1 ? <><line x1={310} x2={310} y1={60} y2={178} stroke={ON} strokeWidth={3} /><text x={318} y={160} fontSize={10} fill={ON}>downdraft, rain</text></> : null}
        {id === 'tornado' ? <><path d="M 255 150 L 265 150 L 262 180 L 258 180 Z" fill="var(--text-dim)" /><text x={210} y={146} fontSize={10} fill="var(--text-dim)">wall cloud, funnel</text></> : null}
        {st === 2 ? <text x={400} y={170} fontSize={10} fill="var(--text-dim)">gust front spreads out →</text> : null}
        <text x={552} y={196} textAnchor="end" fontSize={9.5} fill="var(--text-dim)">schematic, not to scale</text>
      </svg>);
  }
  if (id === 'midlatitude') {
    const occl = stage >= 2;
    return (
      <svg viewBox="0 0 560 200" role="img" aria-label="Mid-latitude cyclone map" style={{ width: '100%', maxWidth: 560 }}>
        <text x={280} y={95} textAnchor="middle" fontSize={20} fill={WARM}>L</text>
        {stage === 0 ? <><line x1={60} x2={500} y1={100} y2={100} stroke={ON} strokeWidth={3} strokeDasharray="12 6" /><text x={70} y={92} fontSize={10} fill="var(--text-dim)">stationary front</text></> : <>
          <path d="M 290 100 Q 380 110 470 140" fill="none" stroke={WARM} strokeWidth={3} /><text x={400} y={150} fontSize={10} fill={WARM}>warm front</text>
          <path d={occl ? 'M 290 100 Q 300 140 270 190' : 'M 290 100 Q 230 140 180 190'} fill="none" stroke={ON} strokeWidth={3} /><text x={occl ? 280 : 150} y={182} fontSize={10} fill={ON}>cold front</text>
          {occl ? <><path d="M 290 100 Q 330 70 360 60" fill="none" stroke="#b18cff" strokeWidth={3} /><text x={340} y={52} fontSize={10} fill="#b18cff">occluded front</text></> : <text x={360} y={180} fontSize={10} fill="var(--text-dim)">warm sector</text>}
        </>}
        {stage === 3 ? <text x={280} y={130} textAnchor="middle" fontSize={11} fill="var(--text-dim)">weakening</text> : null}
        <text x={552} y={196} textAnchor="end" fontSize={9.5} fill="var(--text-dim)">schematic map, Northern Hemisphere</text>
      </svg>);
  }
  if (id === 'winter') {
    const types: [string, number[]][] = [['snow', [-6, -4, -2, -3]], ['sleet', [-6, 2, -5, -6]], ['freezing rain', [-6, 4, 3, -2]], ['rain', [-4, 2, 4, 5]]];
    return (
      <svg viewBox="0 0 560 200" role="img" aria-label="Temperature profiles" style={{ width: '100%', maxWidth: 560 }}>
        {types.map(([n, t], i) => { const x0 = 30 + i * 135, x = (c: number) => x0 + 60 + c * 6; return <g key={n}><line x1={x(0)} x2={x(0)} y1={20} y2={170} stroke="var(--line)" strokeDasharray="3 3" /><polyline points={t.map((c, j) => `${x(c)},${30 + j * 45}`).join(' ')} fill="none" stroke={ON} strokeWidth={2.5} /><text x={x0 + 60} y={190} textAnchor="middle" fontSize={11} fill="var(--text)">{n}</text></g>; })}
        <text x={8} y={14} fontSize={10} fill="var(--text-dim)">temperature with height (cloud at top, ground at bottom); dashed line 0 °C — illustrative profiles</text>
      </svg>);
  }
  return null;
}

function Lab({ id }: { id: string }) {
  const { query } = useRoute();
  if (id === 'hurricane') {
    const kt = num(query, 'kt', 100, 10, 180), sst = num(query, 'sst', 28, 20, 32), lat = num(query, 'lat', 15, 0, 40), shear = num(query, 'shear', 5, 0, 30);
    const s = saffirSimpson(kt);
    return (
      <>
        <Slider k="kt" label="max wind" v={kt} min={10} max={180} step={1} unit="kt" aria="Maximum sustained wind" />
        <dl className="kv" aria-label="Hurricane category"><KV k="NHC class" v={s.label} /><KV k="in mph" v={ktToMph(kt)} sig={3} /></dl>
        <Slider k="sst" label="sea surface" v={sst} min={20} max={32} step={0.5} unit="°C" aria="Sea-surface temperature" />
        <Slider k="lat" label="latitude" v={lat} min={0} max={40} step={0.5} unit="°" aria="Latitude" />
        <Slider k="shear" label="wind shear" v={shear} min={0} max={30} step={1} unit="m/s" aria="Vertical wind shear" />
        <dl className="kv" aria-label="Ingredients">
          <KV k="Sea ≥ 26.5 °C" v={sst >= 26.5 ? '✓' : '✗'} /><KV k="≥ 5° from the equator (Penn State)" v={lat >= 5 ? '✓' : '✗'} /><KV k="≥ 8° (NASA EO)" v={lat >= 8 ? '✓' : '✗'} /><KV k="Shear < 10 m/s" v={shear < 10 ? '✓' : '✗'} />
        </dl>
      </>);
  }
  if (id === 'thunderstorm') {
    const hail = num(query, 'hail', 0.5, 0, 4), gust = num(query, 'gust', 40, 0, 120);
    const severe = hail >= 1 || gust > 57.5;
    return (
      <>
        <Slider k="hail" label="largest hail" v={hail} min={0} max={4} step={0.25} unit="in" aria="Hail size" />
        <Slider k="gust" label="strongest gust" v={gust} min={0} max={120} step={1} unit="mph" aria="Wind gust" />
        <dl className="kv" aria-label="Severe check"><KV k="Severe (NSSL)?" v={severe ? 'yes' : 'no'} /></dl>
        <p className="note">{D.storms[1].severe.q} <SourceLinks ids={[D.storms[1].severe.s]} /></p>
      </>);
  }
  if (id === 'tornado') {
    const g = num(query, 'gust', 120, 40, 320);
    return (
      <>
        <Slider k="gust" label="3-second gust" v={g} min={40} max={320} step={1} unit="mph" aria="Estimated gust" />
        <dl className="kv" aria-label="EF rating"><KV k="Enhanced Fujita" v={efScale(g)} /></dl>
        <table className="table-mini" aria-label="EF scale"><tbody>{D.ef.rows.map(([e, r]: [string, string]) => <tr key={e} className={efScale(g) === e ? 'sel' : ''}><td>{e}</td><td>{r} mph</td></tr>)}</tbody></table>
        <p className="note">“{D.ef.q}” <SourceLinks ids={[D.ef.s]} /></p>
      </>);
  }
  if (id === 'winter') {
    const T = num(query, 'tf', 10, -40, 40), V = num(query, 'v', 25, 3, 60), vis = num(query, 'vis', 0.25, 0, 2), hrs = num(query, 'hrs', 4, 0, 24);
    return (
      <>
        <Slider k="tf" label="temperature" v={T} min={-40} max={40} step={1} unit="°F" aria="Air temperature" />
        <Slider k="v" label="wind" v={V} min={3} max={60} step={1} unit="mph" aria="Wind speed" />
        <Slider k="vis" label="visibility" v={vis} min={0} max={2} step={0.05} unit="mi" aria="Visibility" />
        <Slider k="hrs" label="lasting" v={hrs} min={0} max={24} step={1} unit="h" aria="Duration" />
        <dl className="kv" aria-label="Winter values"><KV k="Wind chill (NWS)" v={windChillF(T, V)} unit="°F" sig={3} /><KV k="Blizzard (NWS criteria)?" v={isBlizzard(V, vis, hrs) ? 'yes' : 'no'} /></dl>
        <p className="note">{D.windChill.eq} <SourceLinks ids={[D.windChill.s]} /></p>
      </>);
  }
  if (id === 'heat') {
    const T = num(query, 'tf', 95, 70, 115), RH = num(query, 'rh', 50, 5, 100), h = heatIndexF(T, RH);
    return (
      <>
        <Slider k="tf" label="temperature" v={T} min={70} max={115} step={1} unit="°F" aria="Air temperature" />
        <Slider k="rh" label="humidity" v={RH} min={5} max={100} step={1} unit="%" aria="Relative humidity" />
        <dl className="kv" aria-label="Heat index"><KV k="Heat index (NWS)" v={h.hi} unit="°F" sig={3} /><KV k="method" v={h.method === 'regression' ? 'Rothfusz regression' : 'simple formula'} /></dl>
        <AtDepth level="research"><p className="note">{D.heatIndex.eq}. “{D.heatIndex.valid}” <SourceLinks ids={[D.heatIndex.s]} /></p></AtDepth>
      </>);
  }
  return <p className="note">No calculator for this storm type.</p>;
}

export default function StormsView() {
  const { query } = useRoute();
  const S = D.storms as any[];
  const st = S.find((x) => x.id === query.get('storm')) ?? S[0];
  const stage = Math.round(num(query, 'stage', 1, 0, Math.max(0, st.stages.length - 1)));
  return (
    <>
      <Panel id="st-list" className="left-panel" title="Storm laboratory">
        <div role="listbox" aria-label="Storm types" style={{ display: 'flex', flexDirection: 'column', gap: 3, marginBottom: 8 }}>
          {S.map((x) => <button key={x.id} role="option" aria-selected={x.id === st.id} className={`chip ${x.id === st.id ? 'active' : ''}`} style={{ textAlign: 'left' }} onClick={() => setQuery({ storm: x.id, stage: null })}>{x.name}</button>)}
        </div>
        <div className="section-title">Adjust</div>
        <Lab id={st.id} />
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>{st.name} <ProvenanceBadge cls="observed" title="Definitions and observed cases from NOAA, NASA and Penn State; drawings are schematic" /><DepthSwitch /></h1>
          <p className="note"><Q x={st.intro} /></p></div>
        <Structure id={st.id} stage={stage} />
        {st.stages.length ? (
          <>
            <ol aria-label="Life cycle" style={{ display: 'flex', gap: 6, flexWrap: 'wrap', listStyle: 'none', padding: 0, margin: '6px 0' }}>
              {st.stages.map(([n]: [string, string], i: number) => <li key={n}><button className={`chip ${i === stage ? 'active' : ''}`} onClick={() => setQuery({ stage: String(i) })}>{i + 1}. {n}{i < st.stages.length - 1 ? ' →' : ''}</button></li>)}
            </ol>
            <p className="note" aria-label="Stage">“{st.stages[stage][1]}” <SourceLinks ids={[st.stagesSource]} /></p>
          </>) : st.stagesNote ? <p className="note">{st.stagesNote}</p> : null}
        <p className="note"><b>What it needs:</b> {st.conditions.map((c: any, i: number) => <Q key={i} x={c} />)}</p>
        {st.conditionsFinding ? <p className="note">Finding: {st.conditionsFinding}</p> : null}
        <AtDepth level="understand">
          <p className="note"><b>Structure:</b> {st.structure.map((c: any, i: number) => <Q key={i} x={c} />)}</p>
          {st.dissipation ? <p className="note"><b>How it ends:</b> <Q x={st.dissipation} /></p> : null}
        </AtDepth>
        <AtDepth level="research">
          {st.id === 'hurricane' ? <table className="table-mini" aria-label="Saffir-Simpson scale"><thead><tr><th>Cat</th><th>mph</th><th>kt</th><th>damage</th></tr></thead><tbody>{D.sshws.rows.map((r: any[]) => <tr key={r[0]}><td>{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td><td>{r[3]}</td></tr>)}</tbody></table> : null}
          {st.id === 'hurricane' ? <p className="note">“{D.sshws.q}” <SourceLinks ids={[D.sshws.s]} /> Finding: {D.sshws.oldFinding}</p> : null}
          {st.id === 'winter' ? <p className="note">NWS: “{st.blizzard.q}” <SourceLinks ids={[st.blizzard.s]} /></p> : null}
        </AtDepth>
      </div>
      <Panel id="st-detail" className="right-panel" title="When, where and when it happened">
        {st.season ? <p className="note"><b>Where and when:</b> “{st.season.q}” {st.season.q2 ? <>“{st.season.q2}” </> : null}<SourceLinks ids={[st.season.s]} /></p> : null}
        {st.history.map((h: any) => (
          <div key={h.name} style={{ marginTop: 8 }}>
            <div className="section-title">{h.name}</div>
            <dl className="kv" aria-label={`Observed: ${h.name}`}>{h.facts.map(([k, v]: [string, string]) => <KV key={k} k={k} v={v} />)}</dl>
            {h.timeline ? <AtDepth level="understand"><ol className="life-reports" style={{ fontSize: 12, paddingLeft: 18 }}>{h.timeline.map(([t, e]: [string, string]) => <li key={t}>{t}: {e}</li>)}</ol></AtDepth> : null}
            <p className="note">“{h.q}” <SourceLinks ids={h.s2 ? [h.s, h.s2] : [h.s]} /></p>
            {h.finding ? <p className="note">Finding: {h.finding}</p> : null}
          </div>))}
        <button className="chip" onClick={() => navigate('/meteorology/air?tab=stability')}>Unstable air →</button>
        <button className="chip" onClick={() => navigate('/meteorology/motion?tab=circulation')}>Highs, lows and fronts →</button>
        <RelatedLinks id="instrument:storms" limit={3} />
      </Panel>
    </>
  );
}
