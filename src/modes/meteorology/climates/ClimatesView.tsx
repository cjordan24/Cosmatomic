/**
 * Why places have different climates — #/meteorology/climates?a=<station>&b=<station>&cause=<id>&units=metric|us  (Gate 21.3)
 *
 * NOAA 1991–2020 normals for 16 U.S. stations drawn as climographs, classified with the Köppen–Geiger criteria of
 * Peel et al. (2007) step by step, compared in pairs chosen to show one cause at a time (latitude, oceans, rain
 * shadows, subtropical highs, Mediterranean summers, monsoons, height, cities), with each cause quoted from NOAA,
 * USGS, NASA, EPA or the National Park Service. A what-if panel shifts the temperatures and rainfall and reclassifies.
 */
import { useEffect, useState } from 'react';
import { navigate, setQuery, useRoute } from '@/shared/router';
import { KV, Panel, ProvenanceBadge } from '@/ui/components';
import { SourceLinks } from '@/ui/SourcesView';
import { RelatedLinks } from '@/ui/RelatedLinks';
import { AtDepth, DepthSwitch } from '@/ui/Depth';
import { formatSig } from '@/core/units/units';
import { fToC, inToMm, koppen } from '@/core/meteorology/koppen';
import data from '@datasets/meteorology/climates.json';

/* eslint-disable @typescript-eslint/no-explicit-any */
const D = data as any;
const ST = D.stations as any[];
const MON = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
const CLASS_COL: Record<string, string> = { A: '#5cf2a6', B: '#f5c76b', C: '#82b1ff', D: '#b18cff', E: '#d6e4ff' };
const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
const num = (q: URLSearchParams, k: string, d: number, a: number, b: number) => { const v = Number(q.get(k)); return q.has(k) && Number.isFinite(v) ? clamp(v, a, b) : d; };
const short = (n: string) => n.replace(/ INTL AP| AP| AIR TERMINAL| STATE| SKY HARBOR| HARTSFIELD| TACOMA| OHARE| POST ROGERS| MCCARRAN| DWTN/g, '').replace(/, [A-Z]{2} US$/, '').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

function Climograph({ s, metric, T, P, label }: { s: any; metric: boolean; T: number[]; P: number[]; label: string }) {
  const W = 300, H = 200, x = (i: number) => 34 + i * 20, pMax = metric ? 400 : 16, tLo = metric ? -30 : -20, tHi = metric ? 35 : 95;
  const pv = P.map((p) => (metric ? p : p / 25.4)), tv = T.map((t) => (metric ? t : t * 1.8 + 32));
  const yP = (p: number) => H - 24 - (Math.min(p, pMax) / pMax) * (H - 44), yT = (t: number) => H - 24 - ((t - tLo) / (tHi - tLo)) * (H - 44);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label} style={{ width: '100%', maxWidth: W }}>
      <text x={4} y={12} fontSize={11} fill="var(--text)">{short(s.name)} · {s.elevM} m</text>
      {pv.map((p, i) => <rect key={i} x={x(i) - 7} y={yP(p)} width={14} height={H - 24 - yP(p)} fill="#82b1ff" opacity={0.7} />)}
      {pv.some((p) => p > pMax) ? <text x={W - 4} y={28} textAnchor="end" fontSize={9} fill="var(--text-dim)">bars capped at {pMax} {metric ? 'mm' : 'in'}</text> : null}
      <polyline points={tv.map((t, i) => `${x(i)},${yT(t)}`).join(' ')} fill="none" stroke="#ff7a90" strokeWidth={2.5} />
      <line x1={26} x2={W - 26} y1={yT(metric ? 0 : 32)} y2={yT(metric ? 0 : 32)} stroke="var(--line)" strokeDasharray="3 3" />
      {MON.map((m, i) => <text key={i} x={x(i)} y={H - 10} textAnchor="middle" fontSize={9} fill="var(--text-dim)">{m}</text>)}
      <text x={4} y={H - 28} fontSize={9} fill="#82b1ff">{metric ? 'mm' : 'in'}</text><text x={W - 4} y={H - 28} textAnchor="end" fontSize={9} fill="#ff7a90">{metric ? '°C' : '°F'}</text>
      <text x={W - 4} y={yT(metric ? 0 : 32) - 3} textAnchor="end" fontSize={8.5} fill="var(--text-dim)">{metric ? '0 °C' : '32 °F'}</text>
    </svg>
  );
}

let coastP: Promise<number[][][]> | null = null;
function MiniMap({ a, b }: { a: string; b: string }) {
  const [coast, setCoast] = useState<number[][][] | null>(null);
  useEffect(() => { (coastP ??= fetch('/data/atlas/coastline.json').then((r) => r.json())).then(setCoast); }, []);
  const W = 300, H = 170, X = (lon: number) => ((lon + 170) / 110) * W, Y = (lat: number) => ((75 - lat) / 60) * H;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Station map" style={{ width: '100%', background: 'rgba(255,255,255,0.02)', borderRadius: 6 }}>
      {coast?.map((l, i) => <polyline key={i} points={l.filter(([x, y]) => x > -175 && x < -55 && y > 10).map(([x, y]) => `${X(x)},${Y(y)}`).join(' ')} fill="none" stroke="var(--line)" />)}
      {ST.map((s) => { const k = koppen(s.tavgF.map(fToC), s.prcpIn.map(inToMm)).code; const on = s.id === a || s.id === b; return <circle key={s.id} cx={X(s.lon)} cy={Y(s.lat)} r={on ? 5 : 3.2} fill={CLASS_COL[k[0]]} stroke={on ? '#fff' : 'none'} style={{ cursor: 'pointer' }} onClick={() => setQuery({ a: s.id })}><title>{short(s.name)} {k}</title></circle>; })}
    </svg>
  );
}

export default function ClimatesView() {
  const { query } = useRoute();
  const C = D.causes as any[];
  const cause = C.find((c) => c.id === query.get('cause')) ?? null;
  const aId = query.get('a') ?? cause?.stations[0] ?? 'USW00094240', bId = query.get('b') ?? cause?.stations[cause.stations.length - 1] ?? 'USW00024243';
  const A = ST.find((s) => s.id === aId) ?? ST[0], B = ST.find((s) => s.id === bId) ?? null;
  const metric = query.get('units') !== 'us';
  const dT = num(query, 'dT', 0, -10, 10), pPct = num(query, 'pp', 100, 10, 300);
  const conv = (s: any) => ({ T: s.tavgF.map(fToC) as number[], P: s.prcpIn.map(inToMm) as number[] });
  const a = conv(A), b = B ? conv(B) : null;
  const ka = koppen(a.T, a.P), kb = b ? koppen(b.T, b.P) : null;
  const wT = a.T.map((t) => t + dT), wP = a.P.map((p) => (p * pPct) / 100), kw = koppen(wT, wP);
  const K = D.koppen, N = D.normals;
  const stat = (s: any, k: any) => [<KV key="k" k="Köppen–Geiger" v={k.code} />, <KV key="t" k="Range, warmest − coldest month" v={`${formatSig((k.v.Thot - k.v.Tcold) * (metric ? 1 : 1.8), 3)} ${metric ? '°C' : '°F'}`} />, <KV key="p" k="Precipitation a year" v={metric ? `${formatSig(k.v.MAP, 4)} mm` : `${s.annual.prcpIn} in`} />];
  return (
    <>
      <Panel id="cl-pick" className="left-panel" title="Stations (NOAA 1991–2020)">
        <MiniMap a={A.id} b={B?.id ?? ''} />
        <label className="slider-row"><span style={{ minWidth: 20 }}>A</span><select className="text-input" aria-label="Station A" value={A.id} onChange={(e) => setQuery({ a: e.target.value })}>{ST.map((s) => <option key={s.id} value={s.id}>{short(s.name)} — {s.role}</option>)}</select></label>
        <label className="slider-row"><span style={{ minWidth: 20 }}>B</span><select className="text-input" aria-label="Station B" value={B?.id ?? ''} onChange={(e) => setQuery({ b: e.target.value })}>{ST.map((s) => <option key={s.id} value={s.id}>{short(s.name)} — {s.role}</option>)}</select></label>
        <div role="radiogroup" aria-label="Units" className="chip-row" style={{ gap: 4, margin: '6px 0' }}>
          {[['metric', '°C, mm'], ['us', '°F, in']].map(([k, l]) => <button key={k} role="radio" aria-checked={(k === 'metric') === metric} className={`chip ${(k === 'metric') === metric ? 'active' : ''}`} onClick={() => setQuery({ units: k === 'metric' ? null : 'us' })}>{l}</button>)}
        </div>
        <div className="section-title">Why they differ</div>
        <div role="radiogroup" aria-label="Causes" className="chip-row" style={{ flexWrap: 'wrap', gap: 4 }}>
          {C.map((c) => <button key={c.id} role="radio" aria-checked={cause?.id === c.id} className={`chip ${cause?.id === c.id ? 'active' : ''}`} onClick={() => setQuery({ cause: c.id, a: c.stations[0] ?? null, b: c.stations[c.stations.length - 1] ?? null })}>{c.title}</button>)}
        </div>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Why places have different climates <ProvenanceBadge cls="observed" title="NOAA 1991–2020 station normals (observations); Köppen classes computed from them" /><DepthSwitch /></h1>
          <p className="note">Bars: monthly precipitation; line: monthly mean temperature. NOAA: “{N.quote}” <SourceLinks ids={[N.source]} /></p></div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 280px' }}><Climograph s={A} metric={metric} T={a.T} P={a.P} label="Climograph A" /><dl className="kv" aria-label="Station A values">{stat(A, ka)}</dl></div>
          {B && b && kb ? <div style={{ flex: '1 1 280px' }}><Climograph s={B} metric={metric} T={b.T} P={b.P} label="Climograph B" /><dl className="kv" aria-label="Station B values">{stat(B, kb)}</dl></div> : null}
        </div>
        {cause ? <p className="note" aria-label="Cause"><b>{cause.title}.</b> {cause.q.map((q: string, i: number) => <span key={i}>“{q}” </span>)}<SourceLinks ids={[cause.s]} />{cause.q2 ? <> “{cause.q2}” <SourceLinks ids={[cause.s2]} /></> : null}</p>
          : <p className="note">Pick a cause on the left to load a telling pair of stations, or choose any two.</p>}
        <AtDepth level="understand">
          <p className="note" aria-label="Classification steps"><b>{short(A.name)} → {ka.code}</b> (Peel et al. 2007, Table 1): {ka.steps.join('; ')}. <SourceLinks ids={[K.source]} /></p>
          {A.id === 'USW00023174' ? <p className="note">Finding: by Peel's criteria Los Angeles airport is just arid (BSk: 310.6 mm against a threshold of 351.3 mm); the National Park Service calls coastal southern California Mediterranean (Cs). <SourceLinks ids={['nps-goga-weather']} /></p> : null}
        </AtDepth>
        <AtDepth level="research">
          <p className="note">Research — “{K.first}” Peel's worked example: “{K.example}” Thresholds use °C and mm; summer is the warmer half-year of ONDJFM and AMJJAS. {N.note} <SourceLinks ids={[K.source, N.source, 'arguez-2012']} /></p>
        </AtDepth>
      </div>
      <Panel id="cl-whatif" className="right-panel" title="What if? (station A)">
        <label className="slider-row"><span style={{ minWidth: 86 }}>warmer by</span><input type="range" min={-10} max={10} step={0.5} value={dT} aria-label="Temperature shift" onChange={(e) => setQuery({ dT: e.target.value })} /><span>{dT} °C</span></label>
        <label className="slider-row"><span style={{ minWidth: 86 }}>rain ×</span><input type="range" min={10} max={300} step={5} value={pPct} aria-label="Precipitation scale" onChange={(e) => setQuery({ pp: e.target.value })} /><span>{pPct} %</span></label>
        <dl className="kv" aria-label="What-if class"><KV k="Observed" v={ka.code} /><KV k="With these changes" v={kw.code} /></dl>
        <p className="note">An illustrative experiment on the classification only — not a climate projection.</p>
        <div className="section-title">The five main classes</div>
        <ul className="life-reports" style={{ paddingLeft: 16, fontSize: 12 }}>{Object.entries(K.classes).map(([k, v]) => <li key={k}><span style={{ color: CLASS_COL[k] }}>●</span> {k} — {v as string}</li>)}</ul>
        <p className="note">“{K.shares}” <SourceLinks ids={[K.source]} /></p>
        <button className="chip" onClick={() => navigate('/meteorology/atlas?layer=precip')}>Global rainfall map →</button>
        <button className="chip" onClick={() => navigate('/meteorology/air?tab=stability')}>Rising air and clouds →</button>
        <RelatedLinks id="instrument:climates" limit={3} />
      </Panel>
    </>
  );
}
