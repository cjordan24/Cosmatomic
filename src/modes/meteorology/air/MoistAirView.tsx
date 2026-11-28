/**
 * Moist air, clouds and stability — #/meteorology/air?tab=humidity|stability   (Phase 20, Gate 20.2)
 *
 *  humidity   NWS saturation vapour pressure, relative humidity and dew point; the FAA/NWS cloud-base rule
 *  stability  a parcel lifted at the NWS dry rate (9.8 °C/km) to its cloud base, then at a moist rate in the FAA's
 *             range, against an environment lapse rate — classified by the NWS glossary's definitions
 */
import { useMemo } from 'react';
import { navigate, setQuery, useRoute } from '@/shared/router';
import { KV, Panel, ProvenanceBadge } from '@/ui/components';
import { SourceLinks } from '@/ui/SourcesView';
import { RelatedLinks } from '@/ui/RelatedLinks';
import { LinePlot } from '@/ui/plots';
import { AtDepth, DepthSwitch } from '@/ui/Depth';
import { formatSig } from '@/core/units/units';
import { cloudBase, cloudBaseFt, dewPoint, satVapour } from '@/core/meteorology/atmosphere';
import data from '@datasets/meteorology/atmosphere.json';

/* eslint-disable @typescript-eslint/no-explicit-any */
const D = data as any;
const ON = '#82b1ff';
const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
const num = (q: URLSearchParams, k: string, d: number, a: number, b: number) => { const v = Number(q.get(k)); return q.has(k) && Number.isFinite(v) ? clamp(v, a, b) : d; };
const Slider = ({ k, label, v, min, max, step, unit, aria }: { k: string; label: string; v: number; min: number; max: number; step: number; unit: string; aria: string }) => (
  <label className="slider-row"><span style={{ minWidth: 100 }}>{label}</span><input type="range" min={min} max={max} step={step} value={v} aria-label={aria} onChange={(e) => setQuery({ [k]: e.target.value })} /><span>{v} {unit}</span></label>
);
const DALR = 9.8;   // °C per km, NWS glossary

function Humidity() {
  const { query } = useRoute();
  const T = num(query, 't', 25, -30, 45), rh = num(query, 'rh', 60, 1, 100) / 100;
  const es = satVapour(T), e = rh * es, td = dewPoint(T, rh);
  const curve = useMemo(() => Array.from({ length: 76 }, (_, i) => { const t = -30 + i; return [t, satVapour(t)] as [number, number]; }), []);
  const G = D.glossary, V = D.nwsVapour, F = D.faa, ex = F.example;
  const exFt = (((ex.t - 32) / 1.8 - (ex.td - 32) / 1.8) * 1.8 / 4.4) * 1000;
  const perK = (satVapour(T + 1) / es - 1) * 100;
  const tDouble = T + 20 / 1.8;
  return (
    <>
      <Panel id="h-controls" className="left-panel" title="A parcel of air">
        <Slider k="t" label="temperature" v={T} min={-30} max={45} step={0.5} unit="°C" aria="Air temperature" />
        <Slider k="rh" label="relative humidity" v={Math.round(rh * 100)} min={1} max={100} step={1} unit="%" aria="Relative humidity" />
        <dl className="kv" aria-label="Moisture values">
          <KV k="Saturation vapour pressure e_s" v={es} unit="hPa" sig={4} />
          <KV k="Vapour pressure e = rh × e_s" v={e} unit="hPa" sig={4} />
          <KV k="Dew point" v={td} unit="°C" sig={3} />
          <KV k="Dew-point depression" v={T - td} unit="°C" sig={3} />
          <KV k="Cloud base if lifted (FAA rule)" v={`${formatSig(cloudBaseFt(T, td), 3)} ft (${formatSig(cloudBase(T, td), 3)} m)`} />
          <KV k="e_s rise for +1 °C" v={`${formatSig(perK, 2)} %`} title="from the NWS formula (derived)" />
        </dl>
        <p className="note">NWS: dew point “{G.dewPoint}” Relative humidity is “{G.rh}” “{G.rhCaveat}” <SourceLinks ids={[G.source]} /></p>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Water in the air <ProvenanceBadge cls="derived" title="NWS formulas evaluated" /><DepthSwitch /></h1>
          <p className="note">Warm air can hold far more water vapour before it saturates. Cool a parcel to its dew point and the vapour starts to condense — that is where clouds begin.</p></div>
        <LinePlot ariaLabel="Saturation vapour pressure against temperature" width={560} height={260} xLabel="temperature (°C)" yLabel="saturation vapour pressure (hPa)" series={[{ points: curve, color: ON, label: 'e_s (NWS)' }]} markers={[{ x: T, y: es, color: '#f5c76b' }, { x: td, y: e, color: '#5cf2a6' }]} />
        <p className="note">Yellow: the air's saturation point; green: its actual vapour, which saturates at the dew point.</p>
        <AtDepth level="understand">
          <p className="note">Understand — NWS: {V.es}, {V.e}, {V.rh}. “{V.units}” <SourceLinks ids={[V.source]} /> FAA: “{F.base}” So cloud base ≈ (T − T_d in °F) ÷ 4.4 × 1,000 ft. <SourceLinks ids={[F.source]} /> NWS Burlington: “{D.lcl.quote}” <SourceLinks ids={[D.lcl.source]} /></p>
        </AtDepth>
        <AtDepth level="research">
          <p className="note">Research — the FAA's worked example (85 °F, dew point 71 °F) prints 3,180 ft; the rule gives {formatSig(exFt, 4)} ft. FAA: “Every 20 °F increase in temperature doubles the amount of moisture the air can hold” — the NWS formula gives ×{formatSig(satVapour(tDouble) / es, 3)} for {formatSig(T, 3)} → {formatSig(tDouble, 3)} °C. <SourceLinks ids={[F.source, V.source]} /> The rise per °C here, {formatSig(perK, 2)} %, is the Clausius–Clapeyron behaviour of saturation; the formula itself is an empirical fit (Magnus/Tetens type). Bolton's (1980) version was not read (the AMS site refused access).</p>
        </AtDepth>
      </div>
      <Panel id="h-detail" className="right-panel" title="Related">
        <button className="chip" onClick={() => setQuery({ tab: 'stability' })}>Rising air and stability →</button>
        <button className="chip" onClick={() => navigate('/atomic/phases')}>Evaporation and phases →</button>
        <RelatedLinks id="instrument:moist-air" limit={3} />
      </Panel>
    </>
  );
}

function Stability() {
  const { query } = useRoute();
  const T0 = num(query, 't', 25, -10, 40), Td0 = Math.min(T0, num(query, 'td', 15, -20, 35)), env = num(query, 'env', 6.5, 0, 12), malr = num(query, 'malr', 6.0, 3.6, 9.2);
  const lcl = cloudBase(T0, Td0) / 1000;
  const parcel = (zk: number) => (zk <= lcl ? T0 - DALR * zk : T0 - DALR * lcl - malr * (zk - lcl));
  const pts = Array.from({ length: 61 }, (_, i) => i * 0.2);
  const cls = env > DALR ? 'absUnstable' : env < malr ? 'absStable' : env === DALR || env === malr ? 'neutral' : 'condUnstable';
  const label: Record<string, string> = { absUnstable: 'Absolutely unstable', absStable: 'Absolutely stable', condUnstable: 'Conditionally unstable', neutral: 'Neutral' };
  const G = D.glossary, F = D.faa, H = D.humphreys;
  const free = pts.find((z) => z > lcl && parcel(z) > T0 - env * z);
  return (
    <>
      <Panel id="s-controls" className="left-panel" title="Lift a parcel">
        <Slider k="t" label="surface temperature" v={T0} min={-10} max={40} step={0.5} unit="°C" aria="Surface temperature" />
        <Slider k="td" label="surface dew point" v={Td0} min={-20} max={35} step={0.5} unit="°C" aria="Surface dew point" />
        <Slider k="env" label="environment lapse" v={env} min={0} max={12} step={0.1} unit="°C/km" aria="Environmental lapse rate" />
        <Slider k="malr" label="moist lapse" v={malr} min={3.6} max={9.2} step={0.1} unit="°C/km" aria="Moist lapse rate" />
        <dl className="kv" aria-label="Stability values">
          <KV k="Class (NWS)" v={label[cls]} />
          <KV k="Cloud base" v={lcl} unit="km" sig={3} title="FAA rule" />
          <KV k="Parcel warmer than its surroundings above" v={free !== undefined ? `${formatSig(free, 2)} km` : '— (never, below 12 km)'} />
        </dl>
        <p className="note">The moist rate is not one number — NWS: “{G.malr}” The slider spans the FAA's range: “{F.moist}” (= 3.6–9.2 °C/km). <SourceLinks ids={[G.source, F.source]} /></p>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Stability: will rising air keep rising? <ProvenanceBadge cls="illustrative" title="Straight-line lapse rates; a teaching model, not a sounding" /><DepthSwitch /></h1>
          <p className="note">A lifted parcel cools as it expands — fast while dry, slower once it is cloudy. If it stays warmer than the air around it, it keeps rising and towers grow; if it ends up colder, it sinks back.</p></div>
        <LinePlot ariaLabel="Parcel and environment temperature against height" width={560} height={300} xLabel="temperature (°C)" yLabel="height (km)" series={[{ points: pts.map((z) => [T0 - env * z, z] as [number, number]), color: '#9aa6c8', label: 'environment' }, { points: pts.map((z) => [parcel(z), z] as [number, number]), color: ON, label: 'lifted parcel' }]} markers={[{ x: parcel(lcl), y: lcl, color: '#f5c76b' }]} />
        <p className="note">“{G[cls]}” <SourceLinks ids={[G.source]} /> FAA: “{F.stability}” <SourceLinks ids={[F.source]} /></p>
        <AtDepth level="understand">
          <p className="note">Understand — NWS: adiabatic means “{G.adiabatic}” “{G.dalr}” Above cloud base the condensing vapour releases heat — Humphreys (1920): “{H.moist}” <SourceLinks ids={[G.source, H.source]} /></p>
        </AtDepth>
        <AtDepth level="research">
          <p className="note">Research — Humphreys: “{H.rate}” (1 °C per 102.93 m = {formatSig(1000 / 102.93, 3)} °C/km against the NWS 9.8). <SourceLinks ids={[H.source]} /> The model here uses constant rates and a cloud base from the FAA rule; real soundings and moist rates vary with temperature and pressure.</p>
        </AtDepth>
      </div>
      <Panel id="s-detail" className="right-panel" title="Related">
        <button className="chip" onClick={() => setQuery({ tab: 'humidity' })}>Humidity and dew point →</button>
        <button className="chip" onClick={() => navigate('/meteorology')}>The standard atmosphere →</button>
        <RelatedLinks id="instrument:moist-air" limit={3} />
      </Panel>
    </>
  );
}

const TABS: [string, string][] = [['humidity', 'Humidity'], ['stability', 'Stability']];
export default function MoistAirView() {
  const { query } = useRoute();
  const tab = TABS.find(([t]) => t === query.get('tab'))?.[0] ?? 'humidity';
  return (
    <>
      <nav className="view-switch" aria-label="Moist air sections">{TABS.map(([t, l]) => <button key={t} className={tab === t ? 'active' : ''} onClick={() => setQuery({ tab: t === 'humidity' ? null : t })}>{l}</button>)}</nav>
      {tab === 'stability' ? <Stability /> : <Humidity />}
    </>
  );
}
