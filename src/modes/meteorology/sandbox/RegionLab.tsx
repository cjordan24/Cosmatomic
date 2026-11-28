/**
 * Sandbox — the regional lab: one column of air over one place. Reuses the models of Moist air, Storms and Motion:
 *  rain shadow  a parcel crosses a mountain: dry rate to cloud base, moist rate to the crest (its condensed water falls
 *               on the windward side), dry rate down the lee — arriving warmer and drier (illustrative)
 *  comfort      NWS heat index and wind chill for the temperature, humidity and wind you set
 *  cyclone      the formation checklist (sea temperature, distance from the equator, wind shear), as sourced
 */
import { setQuery, useRoute } from '@/shared/router';
import { KV, Panel, ProvenanceBadge } from '@/ui/components';
import { SourceLinks } from '@/ui/SourcesView';
import { LinePlot } from '@/ui/plots';
import { AtDepth, DepthSwitch } from '@/ui/Depth';
import { formatSig } from '@/core/units/units';
import { cloudBase, dewPoint, satVapour } from '@/core/meteorology/atmosphere';
import { heatIndexF, windChillF } from '@/core/meteorology/storms';
import { coriolisParam } from '@/core/meteorology/motion';
import { rainShadow } from '@/core/meteorology/region';
import storms from '@datasets/meteorology/storms.json';
import sandboxData from '@datasets/meteorology/sandbox.json';
import { mixAlbedo } from '@/core/meteorology/sandbox';
import { ASSUMPTIONS } from './shared';

/* eslint-disable @typescript-eslint/no-explicit-any */
const COND = (storms as any).storms[0].conditions as { s: string; q: string }[];
const SB = sandboxData as any;
const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
const num = (q: URLSearchParams, k: string, d: number, a: number, b: number) => { const v = Number(q.get(k)); return q.has(k) && Number.isFinite(v) ? clamp(v, a, b) : d; };
const cToF = (c: number) => c * 1.8 + 32;
const fToC = (f: number) => (f - 32) / 1.8;

function S({ label, k, v, min, max, step, unit, aria }: { label: string; k: string; v: number; min: number; max: number; step: number; unit: string; aria: string }) {
  return <label className="slider-row"><span style={{ minWidth: 96 }}>{label}</span><input type="range" aria-label={aria} min={min} max={max} step={step} value={v} onChange={(e) => setQuery({ [k]: e.target.value })} /><span style={{ minWidth: 64, textAlign: 'right' }}>{v} {unit}</span></label>;
}

export function RegionLab() {
  const { query } = useRoute();
  const T = num(query, 'rt', 20, -30, 45), rh = num(query, 'rh', 70, 5, 100), wind = num(query, 'wind', 10, 0, 60);
  const hill = num(query, 'hill', 3, 0, 8), malr = num(query, 'malr', 6, 3.6, 9.2);
  const sst = num(query, 'sst', 28, 15, 33), lat = num(query, 'lat', 15, 0, 40), shear = num(query, 'shear', 6, 0, 30);
  const Td = dewPoint(T, rh / 100);
  const covers = SB.albedo.covers as { id: string; name: string; a: number; printed: string; s: string }[];
  const frac = covers.map((c) => num(query, `c_${c.id}`, c.id === 'forest' ? 40 : c.id === 'grass' ? 40 : c.id === 'desert' ? 20 : 0, 0, 100));
  const A = mixAlbedo(covers.map((c, i) => ({ frac: frac[i], albedo: c.a }))), Q = 1361 / 4;
  const C = SB.cyclone, RS = SB.rainShadow;
  const r = rainShadow({ T0: T, Td0: Td, hillKm: hill, malr });
  const hi = heatIndexF(cToF(T), rh).hi, wc = windChillF(cToF(T), wind / 1.609344);
  const checks = [
    { ok: sst >= 26.5, label: `Sea surface ${sst} °C`, q: COND[0] },
    { ok: lat >= 5, label: `${lat}° from the equator`, q: COND[1] },
    { ok: shear < 10, label: `Wind shear ${shear} m/s`, q: COND[2] },
  ];
  return (
    <>
      <Panel id="sb-r" className="left-panel" title="Set the place">
        <div className="section-title">Air at the coast</div>
        <S label="temperature" aria="Air temperature" k="rt" v={T} min={-30} max={45} step={0.5} unit="°C" />
        <S label="humidity" aria="Relative humidity" k="rh" v={rh} min={5} max={100} step={1} unit="%" />
        <S label="wind" aria="Wind speed" k="wind" v={wind} min={0} max={60} step={1} unit="km/h" />
        <div className="section-title">Terrain</div>
        <S label="mountain" aria="Mountain height" k="hill" v={hill} min={0} max={8} step={0.1} unit="km" />
        <S label="moist rate" aria="Moist lapse rate" k="malr" v={malr} min={3.6} max={9.2} step={0.1} unit="°C/km" />
        <div className="section-title">Ground cover (%)</div>
        {covers.map((c, i) => <S key={c.id} label={c.name.toLowerCase()} aria={`Cover ${c.name}`} k={`c_${c.id}`} v={frac[i]} min={0} max={100} step={5} unit="%" />)}
        <div className="section-title">Ocean</div>
        <S label="sea surface" aria="Sea surface temperature" k="sst" v={sst} min={15} max={33} step={0.5} unit="°C" />
        <S label="latitude" aria="Latitude" k="lat" v={lat} min={0} max={40} step={1} unit="°" />
        <S label="wind shear" aria="Wind shear" k="shear" v={shear} min={0} max={30} step={1} unit="m/s" />
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>A region: air, a mountain and the sea <ProvenanceBadge cls="illustrative" title="Simple parcel and formula models from NWS, FAA, Penn State and NASA" /><DepthSwitch /></h1></div>
        <div className="section-title">Across the mountain</div>
        <LinePlot ariaLabel="Rain shadow" width={600} height={220} xLabel="distance across (arbitrary)" yLabel="height (km) / °C ÷ 10" series={[
          { points: r.path.map((s) => [s.x, s.z] as [number, number]), color: '#9aa4b2', label: 'ground' },
          { points: r.path.map((s) => [s.x, s.T / 10] as [number, number]), color: '#ff7a90', label: 'parcel temperature ÷ 10' },
        ]} vLines={r.cloudBaseKm < hill ? [{ x: r.cloudX, label: 'cloud base', color: '#82b1ff' }] : []} legend="br" />
        <dl className="kv" aria-label="Rain shadow values" style={{ maxWidth: 600 }}>
          <KV k="Dew point at the coast" v={`${formatSig(Td, 3)} °C`} />
          <KV k="Cloud base (FAA rule)" v={`${formatSig(cloudBase(T, Td) / 1000, 3)} km`} />
          <KV k="Rain on the windward side?" v={r.saturates ? 'yes — the parcel reaches its cloud base below the crest' : 'no — the mountain is lower than the cloud base'} />
          <KV k="Temperature at the crest" v={`${formatSig(r.crestT, 3)} °C`} />
          <KV k="Temperature on the lee side at sea level" v={`${formatSig(r.leeT, 3)} °C (${r.leeT > T ? '+' : ''}${formatSig(r.leeT - T, 2)} °C)`} />
          <KV k="Relative humidity on the lee side" v={`${formatSig(r.leeRH * 100, 3)} %`} title="dew point kept at the crest temperature (pressure effect ignored) — illustrative" />
        </dl>
        <p className="note">Illustrative: all condensed water is assumed to fall on the windward slope. The parcel cools at 9.8 °C/km to its cloud base, at your moist rate above it, and warms at 9.8 °C/km on the way down. <SourceLinks ids={['nws-glossary', 'faa-weather-theory', 'nws-btv-lcl']} /></p>
        <p className="note">Real rain shadows — NPS: “{RS.jotr.q}” <SourceLinks ids={[RS.jotr.s]} /> Olympic Mountains: {RS.olympic.windward[0]}–{RS.olympic.windward[1]} inches a year on the west side; “{RS.olympic.q}” <SourceLinks ids={[RS.olympic.s]} /></p>
        <div className="section-title">Ground cover and sunlight</div>
        <dl className="kv" aria-label="Surface albedo" style={{ maxWidth: 600 }}>
          <KV k="Surface albedo of this mix" v={formatSig(A, 3)} title="area-weighted mean of the cover albedos" />
          <KV k="Sunlight absorbed (of a 340 W/m² average)" v={`${formatSig((1 - A) * Q, 3)} W/m²`} title="1361/4 × (1 − albedo); no atmosphere or clouds" />
        </dl>
        <table className="table-mini" aria-label="Cover albedos" style={{ fontSize: 12 }}><tbody>{covers.map((c) => <tr key={c.id}><td>{c.name}</td><td>{c.a}</td><td>“{c.printed}” <SourceLinks ids={[c.s]} /></td></tr>)}</tbody></table>
        <p className="note">{SB.albedo.clouds} {SB.albedo.licence} Illustrative: plants also change evaporation and roughness, which this mix ignores.</p>
        <div className="section-title">How it feels</div>
        <dl className="kv" aria-label="Comfort values" style={{ maxWidth: 600 }}>
          <KV k="Heat index" v={cToF(T) >= 80 ? `${formatSig(hi, 3)} °F (${formatSig(fToC(hi), 3)} °C)` : '— (defined for 80 °F / 27 °C and above)'} />
          <KV k="Wind chill" v={cToF(T) <= 50 && wind / 1.609344 > 3 ? `${formatSig(wc, 3)} °F (${formatSig(fToC(wc), 3)} °C)` : '— (defined at or below 50 °F with wind above 3 mph)'} />
          <KV k="Saturation vapour pressure" v={`${formatSig(satVapour(T), 3)} hPa`} />
        </dl>
        <p className="note"><SourceLinks ids={['wpc-heat-index', 'nws-epz-windchill', 'nws-epz-vapour']} /></p>
        <div className="section-title">Could a tropical cyclone form here?</div>
        <ul aria-label="Cyclone checklist" style={{ fontSize: 13, paddingLeft: 18 }}>
          {checks.map((c) => <li key={c.label}><b style={{ color: c.ok ? '#5cf2a6' : '#ff7a90' }}>{c.ok ? '✓' : '✗'} {c.label}</b> — “{c.q.q}” <SourceLinks ids={[c.q.s]} /></li>)}
        </ul>
        <p className="note">Spin from the Coriolis parameter at {lat}°: {formatSig(coriolisParam(lat), 3)} s⁻¹. “{COND[3].q}” <SourceLinks ids={[COND[3].s]} /> A checklist of necessary conditions, not a forecast: meeting them does not make a storm.</p>
        <p className="note">Warmer sea, stronger storms? GFDL: “{C.gfdl.q}” <SourceLinks ids={[C.gfdl.s]} /> {C.bases} “{C.gfdl2.q}” <SourceLinks ids={[C.gfdl2.s]} /></p>
        <AtDepth level="understand">
          <ul aria-label="Region model relations" style={{ fontSize: 12, paddingLeft: 18 }}>{ASSUMPTIONS.region.map(([a, s]) => <li key={a}>{a} <SourceLinks ids={s} /></li>)}</ul>
        </AtDepth>
      </div>
      <Panel id="sb-rdetail" className="right-panel" title="Limits of this model">
        <ul style={{ fontSize: 12, paddingLeft: 18 }}>
          <li>One parcel, no mixing with the surrounding air.</li>
          <li>All condensed water falls out on the windward side.</li>
          <li>The moist rate is held constant (in reality it changes with temperature).</li>
          <li>Heat index and wind chill are only defined in their stated ranges.</li>
          <li>The cyclone checklist covers three of several necessary conditions.</li>
        </ul>
      </Panel>
    </>
  );
}
