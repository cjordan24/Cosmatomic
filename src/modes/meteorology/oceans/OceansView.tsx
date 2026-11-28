/**
 * Oceans, ice and living landscapes — #/meteorology/oceans?tab=circulation|enso|change|ice|biomes   (Gate 23.3)
 *
 *  circulation  the global conveyor belt step by step, gyres, upwelling and the Ekman layer (NOAA Ocean Service)
 *  enso         NOAA CPC ONI and RONI (ERSSTv6), 1950–2026, with episodes found by NOAA's own rule
 *  change       ocean heat (NASA) and acidification (PMEL; Hawaii Ocean Time-series pH, 1988–2024)
 *  ice          Arctic September minimum 1979–2026 (NASA/NSIDC), albedo of water, ice and snow, permafrost
 *  biomes       NASA's seven biomes with an example climate each; change one variable and see the Köppen class move
 */
import { useMemo } from 'react';
import { navigate, setQuery, useRoute } from '@/shared/router';
import { KV, Panel, ProvenanceBadge } from '@/ui/components';
import { SourceLinks } from '@/ui/SourcesView';
import { RelatedLinks } from '@/ui/RelatedLinks';
import { LinePlot } from '@/ui/plots';
import { AtDepth, DepthSwitch } from '@/ui/Depth';
import { formatSig } from '@/core/units/units';
import { acidityIncrease, ensoEpisodes, flatten, ols } from '@/core/meteorology/ocean';
import { koppen } from '@/core/meteorology/koppen';
import data from '@datasets/meteorology/oceans.json';

/* eslint-disable @typescript-eslint/no-explicit-any */
const D = data as any;
const ON = '#82b1ff';
const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
const num = (q: URLSearchParams, k: string, d: number, a: number, b: number) => { const v = Number(q.get(k)); return q.has(k) && Number.isFinite(v) ? clamp(v, a, b) : d; };
const Related = ({ children }: { children?: React.ReactNode }) => <Panel id="oc-detail" className="right-panel" title="Related">{children}<RelatedLinks id="instrument:oceans" limit={3} /></Panel>;

function Circulation() {
  const { query } = useRoute();
  const C = D.circulation, step = Math.round(num(query, 'step', 0, 0, C.conveyor.route.length - 1));
  const pts: [number, number][] = [[470, 60], [430, 170], [300, 235], [150, 200], [360, 110]];
  return (
    <>
      <Panel id="oc-c" className="left-panel" title="Follow a parcel of water">
        <ol aria-label="Conveyor steps" style={{ listStyle: 'none', padding: 0 }}>
          {C.conveyor.route.map((r: string, i: number) => <li key={i}><button className={`chip ${i === step ? 'active' : ''}`} style={{ width: '100%', textAlign: 'left', marginBottom: 3, whiteSpace: 'normal' }} onClick={() => setQuery({ step: String(i) })}>{i + 1}. {r.split(' ').slice(0, 7).join(' ')}…</button></li>)}
        </ol>
        <p className="note">“{C.conveyor.q}” <SourceLinks ids={[C.conveyor.s]} /></p>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Ocean circulation <ProvenanceBadge cls="illustrative" title="Schematic route after NOAA's conveyor-belt description" /><DepthSwitch /></h1>
          <p className="note">“{C.thc.q[0]}” <SourceLinks ids={[C.thc.s]} /></p></div>
        <svg viewBox="0 0 600 280" role="img" aria-label="Conveyor belt schematic" style={{ width: '100%', maxWidth: 600 }}>
          <rect x={0} y={0} width={600} height={280} fill="#0b1a33" rx={6} />
          <path d="M 470 60 C 520 120 470 160 430 170 C 380 220 330 240 300 235 C 230 230 180 220 150 200 C 120 160 200 110 260 110 C 300 110 330 108 360 110 C 420 112 450 80 470 60" fill="none" stroke={ON} strokeWidth={3} strokeDasharray="8 6" opacity={0.7} />
          {pts.map(([x, y], i) => <g key={i}><circle cx={x} cy={y} r={i === step ? 9 : 5} fill={i === step ? '#f5c76b' : ON} /><text x={x + 12} y={y + 4} fontSize={11} fill="var(--text)">{i + 1}</text></g>)}
          <text x={10} y={270} fontSize={10} fill="var(--text-dim)">schematic — not a map; numbers follow NOAA's five steps</text>
        </svg>
        <p className="note" aria-label="Conveyor step">“{C.conveyor.route[step]}” <SourceLinks ids={[C.conveyor.s]} /></p>
        <AtDepth level="understand">
          <p className="note">Sinking: “{C.thc.q[1]}” <SourceLinks ids={[C.thc.s]} /> AMOC: “{C.amoc.q}” “{C.amoc.q2}” <SourceLinks ids={[C.amoc.s]} /></p>
          <p className="note">Surface: “{C.gyres.q}” <SourceLinks ids={[C.gyres.s]} /> “{C.upwelling.q}” “{C.upwelling.q2}” <SourceLinks ids={[C.upwelling.s]} /></p>
        </AtDepth>
        <AtDepth level="research"><p className="note">Wind stress — NOAA: “{C.ekman.q}” <SourceLinks ids={[C.ekman.s]} /></p></AtDepth>
      </div>
      <Related><button className="chip" onClick={() => navigate('/meteorology/atlas?layer=sst')}>Sea-surface temperature map →</button><button className="chip" onClick={() => navigate('/meteorology/motion?tab=coriolis')}>The Coriolis effect →</button></Related>
    </>
  );
}

function Enso() {
  const { query } = useRoute();
  const which = query.get('index') === 'oni' ? 'oni' : 'roni';
  const E = D.enso, seq = useMemo(() => flatten(E[which]), [which]);
  const eps = useMemo(() => ensoEpisodes(seq), [seq]);
  const pts = seq.map((x) => [x.year + (x.s + 1) / 12, x.v] as [number, number]);
  const last = seq[seq.length - 1];
  const defIds = which === 'oni' ? [E.oniS] : [E.pnsS, E.roniS];
  return (
    <>
      <Panel id="oc-e" className="left-panel" title="Episodes">
        <div role="radiogroup" aria-label="ENSO index" className="chip-row" style={{ gap: 4 }}>
          {[['roni', 'RONI (official since Feb 2026)'], ['oni', 'ONI']].map(([k, l]) => <button key={k} role="radio" aria-checked={which === k} className={`chip ${which === k ? 'active' : ''}`} onClick={() => setQuery({ index: k === 'roni' ? null : k })}>{l}</button>)}
        </div>
        <dl className="kv" aria-label="ENSO summary"><KV k="El Niño episodes" v={eps.filter((e) => e.kind === 'El Niño').length} /><KV k="La Niña episodes" v={eps.filter((e) => e.kind === 'La Niña').length} /><KV k={`Latest (${E.seasons[last.s]} ${last.year})`} v={`${last.v > 0 ? '+' : ''}${last.v} °C`} /></dl>
        <ol className="life-reports" aria-label="Strongest episodes" style={{ paddingLeft: 18, fontSize: 12 }}>{[...eps].sort((a, b) => Math.abs(b.peak) - Math.abs(a.peak)).slice(0, 8).map((e) => <li key={`${e.kind}${e.start.year}${e.start.s}`}>{e.kind} {e.start.year}–{e.end.year}: peak {e.peak > 0 ? '+' : ''}{e.peak} °C, {e.length} seasons{e.end === last ? ' (ongoing; provisional)' : ''}</li>)}</ol>
        <p className="note">Episodes found here with NOAA's rule (our application of it).</p>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>El Niño and La Niña <ProvenanceBadge cls="observed" title="NOAA CPC indices from reconstructed sea-surface temperatures (ERSSTv6), as retrieved 2026-11-28; recent values provisional" /><DepthSwitch /></h1>
          <p className="note">“{E.elnino}” “{E.lanina}” <SourceLinks ids={[E.cgS]} /></p></div>
        <LinePlot ariaLabel="ENSO index" width={640} height={260} xLabel="year" yLabel="°C" series={[{ points: pts, color: ON, label: which.toUpperCase() }]} hLines={[{ y: 0.5, label: '+0.5', color: '#ff7a90' }, { y: -0.5, label: '−0.5', color: '#82b1ff' }]} />
        <p className="note">“{which === 'oni' ? E.oniDef : E.pns}” <SourceLinks ids={defIds} /> {which === 'oni' ? <>“{E.rule}”</> : null}</p>
        <AtDepth level="understand"><p className="note">Why the change — NWS (2026): the relative index “{E.pnsWhy}” <SourceLinks ids={[E.pnsS]} /> “{E.timing}” <SourceLinks ids={[E.faqS]} /></p></AtDepth>
        <AtDepth level="research"><p className="note">Findings: {E.freqFinding} {E.typo} Values are revisable for two months and the ONI base period is updated every five years.</p></AtDepth>
      </div>
      <Related><button className="chip" onClick={() => navigate('/meteorology/atlas?layer=sst&m=11')}>December sea temperatures →</button><button className="chip" onClick={() => navigate('/meteorology/records')}>Warmest years →</button></Related>
    </>
  );
}

function Change() {
  const { query } = useRoute();
  const dpH = num(query, 'dph', 0.11, 0, 0.5);
  const A = D.acid, H = D.heat, rows = A.hot.rows as [number, number][];
  const fit = useMemo(() => ols(rows.map((r) => r[0]), rows.map((r) => r[1])), [rows]);
  return (
    <>
      <Panel id="oc-ch" className="left-panel" title="A drop in pH">
        <label className="slider-row"><span style={{ minWidth: 60 }}>pH drop</span><input type="range" min={0} max={0.5} step={0.01} value={dpH} aria-label="pH drop" onChange={(e) => setQuery({ dph: e.target.value })} /><span>{dpH}</span></label>
        <dl className="kv" aria-label="Acidity values"><KV k="More hydrogen ions" v={`${formatSig(acidityIncrease(dpH) * 100, 3)} %`} title="10^ΔpH − 1" /></dl>
        <p className="note">PMEL: “{A.log}” <SourceLinks ids={[A.s]} /></p>
        <p className="note">{A.share.map(([s, q]: [string, string]) => <span key={s}>“{q}” <SourceLinks ids={[s]} /> </span>)} The two NOAA offices frame the share differently (all emissions so far vs each year).</p>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>A warming, souring ocean <ProvenanceBadge cls="observed" title="Shipboard measurements at Station ALOHA; trend line our fit" /><DepthSwitch /></h1>
          <p className="note">NASA: “{H.q}” Latest: {H.zj} ({H.zjDate}). <SourceLinks ids={[H.s]} /> PMEL: “{A.q}” <SourceLinks ids={[A.s]} /></p></div>
        <LinePlot ariaLabel="Surface ocean pH at Station ALOHA" width={620} height={240} xLabel="year" yLabel="pH (total scale)" series={[{ points: rows, color: ON, label: 'each cruise' }, { points: [[1988.8, fit.intercept + fit.slope * 1988.8], [2025, fit.intercept + fit.slope * 2025]], color: '#f5c76b', label: `fit: ${formatSig(fit.slope * 10, 2)} per decade` }]} />
        <p className="note">Hawaii Ocean Time-series: {A.hot.col} 346 cruises, October 1988 – December 2024. <SourceLinks ids={[A.hot.s]} /></p>
        <AtDepth level="understand"><p className="note">“{H.q2}” “{H.q3}” <SourceLinks ids={[H.s]} /> PMEL: a 0.11 drop is “{A.exact}” <SourceLinks ids={[A.s]} /></p></AtDepth>
      </div>
      <Related><button className="chip" onClick={() => navigate('/atomic/reactions')}>Acids and bases →</button><button className="chip" onClick={() => navigate('/meteorology/radiation?tab=forcing')}>Rising CO₂ →</button></Related>
    </>
  );
}

function Ice() {
  const { query } = useRoute();
  const frac = num(query, 'ice', 50, 0, 100) / 100;
  const I = D.ice, rows = I.rows as number[][];
  const absorbed = (1 - frac) * (1 - 0.06) + frac * (1 - 0.6);
  return (
    <>
      <Panel id="oc-i" className="left-panel" title="Ice and sunlight">
        <label className="slider-row"><span style={{ minWidth: 70 }}>ice cover</span><input type="range" min={0} max={100} step={1} value={frac * 100} aria-label="Ice cover" onChange={(e) => setQuery({ ice: e.target.value })} /><span>{Math.round(frac * 100)} %</span></label>
        <dl className="kv" aria-label="Albedo values"><KV k="Sunlight absorbed" v={`${formatSig(absorbed * 100, 3)} %`} title="ocean albedo 0.06, bare ice 0.6 (mid of NSIDC's 0.5–0.7) — our mix" /></dl>
        <p className="note">NSIDC: “{I.albedo.q}” “{I.albedo.q2}” <SourceLinks ids={[I.albedo.s]} /> Less ice means more absorbed sunlight — an illustrative mix of the two albedos.</p>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Ice <ProvenanceBadge cls="observed" title="Satellite observations (NSIDC/NASA)" /><DepthSwitch /></h1>
          <p className="note">NSIDC: “{I.nsidc.q}” “{I.nsidc.q2}” <SourceLinks ids={[I.nsidc.s]} /></p></div>
        <LinePlot ariaLabel="Arctic sea ice minimum" width={620} height={240} xLabel="year" yLabel="million km²" series={[{ points: rows.map((r) => [r[0], r[3]] as [number, number]), color: ON, label: 'Arctic minimum extent' }]} />
        <p className="note">Data: NASA Earth indicator, credit NSIDC/NASA. <SourceLinks ids={[I.s]} /></p>
        <AtDepth level="understand"><p className="note">Permafrost: “{I.permafrost.q}” “{I.permafrost.q2}” <SourceLinks ids={[I.permafrost.s]} /> Ice sheets: “{I.sheets.q}” <SourceLinks ids={[I.sheets.s]} /> “{I.loss.q}” <SourceLinks ids={[I.loss.s]} /></p></AtDepth>
        <AtDepth level="research"><p className="note">“{I.nsidc.caveat}” <SourceLinks ids={[I.nsidc.s]} /> Findings: {I.trendFinding} {I.loss.finding}</p></AtDepth>
      </div>
      <Related><button className="chip" onClick={() => navigate('/meteorology/atlas?layer=seaice&m=8')}>Sea-ice map →</button><button className="chip" onClick={() => navigate('/meteorology/radiation')}>The energy budget →</button></Related>
    </>
  );
}

function Biomes() {
  const { query } = useRoute();
  const B = D.biomes, b = B.list.find((x: any) => x.id === query.get('biome')) ?? B.list[0];
  const dT = num(query, 'dT', 0, -10, 10), pp = num(query, 'pp', 100, 10, 300);
  const k0 = koppen(b.t, b.p), k1 = koppen(b.t.map((t: number) => t + dT), b.p.map((p: number) => (p * pp) / 100));
  return (
    <>
      <Panel id="oc-b" className="left-panel" title="Biomes (NASA)">
        <div role="listbox" aria-label="Biomes" style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {B.list.map((x: any) => <button key={x.id} role="option" aria-selected={x.id === b.id} className={`chip ${x.id === b.id ? 'active' : ''}`} style={{ textAlign: 'left' }} onClick={() => setQuery({ biome: x.id })}>{x.name}</button>)}
        </div>
        <div className="section-title">Change one variable</div>
        <label className="slider-row"><span style={{ minWidth: 70 }}>warmer by</span><input type="range" min={-10} max={10} step={0.5} value={dT} aria-label="Biome temperature shift" onChange={(e) => setQuery({ dT: e.target.value })} /><span>{dT} °C</span></label>
        <label className="slider-row"><span style={{ minWidth: 70 }}>rain ×</span><input type="range" min={10} max={300} step={5} value={pp} aria-label="Biome rain scale" onChange={(e) => setQuery({ pp: e.target.value })} /><span>{pp} %</span></label>
        <dl className="kv" aria-label="Biome class"><KV k="Köppen class now" v={k0.code} /><KV k="After the change" v={k1.code} /></dl>
        <p className="note">Illustrative: the classification moves; real ecosystems respond in many more ways. <SourceLinks ids={['peel-2007']} /></p>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>{b.name} <ProvenanceBadge cls="observed" title="NASA Mission: Biomes descriptions; example climate from WorldClim 1970–2000 as printed" /><DepthSwitch /></h1></div>
        <dl className="kv" aria-label="Biome values" style={{ maxWidth: 620 }}><KV k="Temperature" v={b.temp} /><KV k="Precipitation" v={b.precip} /><KV k="Vegetation" v={b.veg} /><KV k="Example" v={`${b.example} — ${Math.round(b.p.reduce((a: number, c: number) => a + c, 0))} mm a year`} /></dl>
        <LinePlot ariaLabel="Biome example climate" width={560} height={200} xLabel="month" yLabel="°C / mm÷10" series={[{ points: b.t.map((t: number, i: number) => [i + 1, t] as [number, number]), color: '#ff7a90', label: 'temperature (°C)' }, { points: b.p.map((p: number, i: number) => [i + 1, p / 10] as [number, number]), color: ON, label: 'precipitation (mm ÷ 10)' }]} />
        <p className="note">{B.note} <SourceLinks ids={[B.s]} /></p>
        <AtDepth level="understand"><p className="note">Plants and air — USGS: “{B.et.q}” “{B.et.q2}” <SourceLinks ids={[B.et.s]} /> NASA: “{B.carbon.q}” <SourceLinks ids={[B.carbon.s]} /> Wetlands — NOAA: “{B.wetland.q}” <SourceLinks ids={[B.wetland.s]} /></p></AtDepth>
        <AtDepth level="research"><p className="note">Soil — SMAP Handbook: “{B.soil.q}” <SourceLinks ids={[B.soil.s]} /></p></AtDepth>
      </div>
      <Related><button className="chip" onClick={() => navigate('/biologic/plants')}>Plants and photosynthesis →</button><button className="chip" onClick={() => navigate('/meteorology/climates')}>Station climates →</button></Related>
    </>
  );
}

const TABS: [string, string][] = [['circulation', 'Circulation'], ['enso', 'El Niño'], ['change', 'Heat & acidity'], ['ice', 'Ice'], ['biomes', 'Biomes']];
export default function OceansView() {
  const { query } = useRoute();
  const tab = TABS.find(([t]) => t === query.get('tab'))?.[0] ?? 'circulation';
  return (
    <>
      <nav className="view-switch" aria-label="Earth systems sections">{TABS.map(([t, l]) => <button key={t} className={tab === t ? 'active' : ''} onClick={() => setQuery({ tab: t === 'circulation' ? null : t })}>{l}</button>)}</nav>
      {tab === 'enso' ? <Enso /> : tab === 'change' ? <Change /> : tab === 'ice' ? <Ice /> : tab === 'biomes' ? <Biomes /> : <Circulation />}
    </>
  );
}
