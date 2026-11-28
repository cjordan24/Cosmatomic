/**
 * Environmental sandbox — #/meteorology/sandbox?tab=planet|region|saved   (Phase 25)
 *
 *  planet  start from Earth, Venus, Mars, Titan, Jupiter or Pluto (NSSDCA/JPL/NASA values) and change mass, radius,
 *          distance, eccentricity, tilt, rotation, albedo, internal heat, pressure, molecular weight and CO₂; every
 *          dependent quantity is recomputed (gravity from mass and radius unless the theoretical override is on)
 *  region  a column of air over one place: temperature, humidity, a mountain, sea temperature, wind — rain shadow,
 *          cloud base, heat index and wind chill from the models used elsewhere in Meteorology
 *  saved   save, reset and compare experiments (stored in this browser)
 *
 * A teaching sandbox, not a climate model: single global numbers, no dynamics, no feedbacks unless stated.
 */
import { useMemo, useState } from 'react';
import { navigate, setQuery, useRoute } from '@/shared/router';
import { KV, Panel, ProvenanceBadge } from '@/ui/components';
import { SourceLinks } from '@/ui/SourcesView';
import { RelatedLinks } from '@/ui/RelatedLinks';
import { LinePlot } from '@/ui/plots';
import { AtDepth, DepthSwitch } from '@/ui/Depth';
import { formatSig } from '@/core/units/units';
import { co2Warming, derive, type Planet } from '@/core/meteorology/sandbox';
import { pressureAt } from '@/core/meteorology/planets';
import { PRESETS, presetById } from './presets';
import { RegionLab } from './RegionLab';
import { ASSUMPTIONS, SAVED_KEY, loadSaved, type Saved } from './shared';

/* eslint-disable @typescript-eslint/no-explicit-any */
const EARTH_MASS = presetById('earth').planet.massKg;
const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
const num = (q: URLSearchParams, k: string, d: number, a: number, b: number) => { const v = Number(q.get(k)); return q.has(k) && Number.isFinite(v) ? clamp(v, a, b) : d; };

/** The planet described by the URL: a preset plus any changed variables. */
export function planetFromQuery(q: URLSearchParams): { preset: ReturnType<typeof presetById>; planet: Planet; changed: string[]; co2: number } {
  const preset = presetById(q.get('preset') ?? 'earth'), b = preset.planet;
  const p: Planet = {
    ...b,
    massKg: num(q, 'm', b.massKg / EARTH_MASS, 1e-4, 1000) * EARTH_MASS,
    radiusKm: num(q, 'r', b.radiusKm, 100, 100000),
    gOverride: q.has('g') ? num(q, 'g', 9.8, 0.1, 100) : null,
    distanceAu: num(q, 'd', b.distanceAu, 0.05, 60),
    eccentricity: num(q, 'e', b.eccentricity, 0, 0.9),
    tiltDeg: num(q, 'tilt', b.tiltDeg, 0, 180),
    rotationH: num(q, 'rot', b.rotationH, -6000, 6000) || b.rotationH,
    bondAlbedo: num(q, 'A', b.bondAlbedo, 0, 0.99),
    internalWm2: num(q, 'int', b.internalWm2, 0, 1000),
    pBar: num(q, 'p', b.pBar, 0, 200),
    mmw: num(q, 'mmw', b.mmw, 2, 100),
  };
  const changed = ['m', 'r', 'g', 'd', 'e', 'tilt', 'rot', 'A', 'int', 'p', 'mmw'].filter((k) => q.has(k));
  // A measured temperature belongs only to the unmodified world.
  if (changed.some((k) => ['m', 'r', 'g', 'd', 'A', 'int', 'p', 'mmw'].includes(k))) p.tObsK = null;
  return { preset, planet: p, changed, co2: num(q, 'co2', 280, 100, 5000) };
}

function Slider({ label, k, v, min, max, step, log, fmt, aria }: { label: string; k: string; v: number; min: number; max: number; step?: number; log?: boolean; fmt: (v: number) => string; aria: string }) {
  const toS = (x: number) => (log ? Math.log10(x) : x), fromS = (s: number) => (log ? 10 ** s : s);
  return (
    <label className="slider-row"><span style={{ minWidth: 92 }}>{label}</span>
      <input type="range" aria-label={aria} min={toS(min)} max={toS(max)} step={log ? 0.01 : step ?? (max - min) / 100} value={toS(v)} onChange={(e) => setQuery({ [k]: String(Number(fromS(Number(e.target.value)).toPrecision(4))) })} />
      <span style={{ minWidth: 70, textAlign: 'right' }}>{fmt(v)}</span></label>
  );
}

function PlanetTab() {
  const { query } = useRoute();
  const { preset, planet: p, changed, co2 } = planetFromQuery(query);
  const d = derive(p), d0 = derive(preset.planet);
  const ecs: [number, number] = [2.5, 4.0];
  const cw = co2Warming(co2, 280, ecs);
  const profile = d.H ? Array.from({ length: 41 }, (_, i) => { const z = (i / 40) * 5 * d.H!; return [pressureAt(p.pBar, z, d.H!), z] as [number, number]; }) : [];
  const delta = (a: number, b: number) => (Math.abs(a / b - 1) < 1e-6 ? '' : ` (${a > b ? '+' : '−'}${formatSig(Math.abs(a / b - 1) * 100, 2)} %)`);
  return (
    <>
      <Panel id="sb-p" className="left-panel" title="Build a planet">
        <div role="radiogroup" aria-label="Preset" className="chip-row" style={{ gap: 4, flexWrap: 'wrap' }}>
          {PRESETS.map((x) => <button key={x.id} role="radio" aria-checked={preset.id === x.id} className={`chip ${preset.id === x.id ? 'active' : ''}`} onClick={() => navigate(`/meteorology/sandbox${x.id === 'earth' ? '' : `?preset=${x.id}`}`, { replace: true })}>{x.planet.name}</button>)}
        </div>
        <div className="section-title">Body</div>
        <Slider label="mass" aria="Mass" k="m" v={p.massKg / EARTH_MASS} min={1e-4} max={1000} log fmt={(v) => `${formatSig(v, 3)} M⊕`} />
        <Slider label="radius" aria="Radius" k="r" v={p.radiusKm} min={100} max={100000} log fmt={(v) => `${formatSig(v, 4)} km`} />
        <label className="slider-row" style={{ fontSize: 12 }}><input type="checkbox" aria-label="Theoretical gravity override" checked={p.gOverride !== null} onChange={(e) => setQuery({ g: e.target.checked ? String(Number(d.gDerived.toPrecision(3))) : null })} /> theoretical override of gravity</label>
        {p.gOverride !== null ? <Slider label="gravity" aria="Gravity override" k="g" v={p.gOverride} min={0.1} max={100} log fmt={(v) => `${formatSig(v, 3)} m/s²`} /> : null}
        <div className="section-title">Orbit and spin</div>
        <Slider label="distance" aria="Distance from the star" k="d" v={p.distanceAu} min={0.05} max={60} log fmt={(v) => `${formatSig(v, 3)} au`} />
        <Slider label="eccentricity" aria="Eccentricity" k="e" v={p.eccentricity} min={0} max={0.9} step={0.001} fmt={(v) => formatSig(v, 3)} />
        <Slider label="axial tilt" aria="Axial tilt" k="tilt" v={p.tiltDeg} min={0} max={180} step={0.1} fmt={(v) => `${formatSig(v, 3)}°`} />
        <Slider label="rotation" aria="Rotation period" k="rot" v={Math.abs(p.rotationH)} min={1} max={6000} log fmt={(v) => `${formatSig(v, 3)} h${p.rotationH < 0 ? ' (retrograde)' : ''}`} />
        <div className="section-title">Surface and air</div>
        <Slider label="Bond albedo" aria="Bond albedo" k="A" v={p.bondAlbedo} min={0} max={0.99} step={0.005} fmt={(v) => formatSig(v, 3)} />
        <Slider label="internal heat" aria="Internal heat" k="int" v={p.internalWm2} min={0} max={1000} step={0.1} fmt={(v) => `${formatSig(v, 3)} W/m²`} />
        <Slider label="pressure" aria="Surface pressure" k="p" v={Math.max(p.pBar, 1e-6)} min={1e-6} max={200} log fmt={(v) => `${formatSig(v, 3)} bar`} />
        <Slider label="mol. weight" aria="Mean molecular weight" k="mmw" v={p.mmw} min={2} max={100} step={0.01} fmt={(v) => `${formatSig(v, 4)} g/mol`} />
        <button className="chip" onClick={() => navigate(`/meteorology/sandbox${preset.id === 'earth' ? '' : `?preset=${preset.id}`}`, { replace: true })}>Reset to {preset.planet.name}</button>
        {preset.missing.length ? <p className="note" style={{ color: '#ff7a90' }}>Hypothetical placeholders: {preset.missing.join('; ')}.</p> : null}
        <p className="note">{preset.notes.join(' ')} <SourceLinks ids={preset.sources} /></p>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>{changed.length ? `A modified ${p.name}` : p.name} <ProvenanceBadge cls={changed.length ? 'hypothetical' : 'derived'} title={changed.length ? 'User-modified world: derived from your inputs' : 'Derived from NSSDCA/JPL values'} /><DepthSwitch /></h1>
          <p className="note">{changed.length ? `Changed: ${changed.join(', ')}. Every number below is recomputed from your inputs.` : 'Unmodified preset — derived values are checked against the fact sheets in the tests.'}</p></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, maxWidth: 680 }}>
          <dl className="kv" aria-label="Gravity">
            <KV k="Surface gravity" v={`${formatSig(d.g, 3)} m/s²${d.overridden ? ' (override)' : ''}${delta(d.g, d0.g)}`} title="GM/R² unless overridden" />
            <KV k="At the equator, with spin" v={`${formatSig(d.gEquator, 3)} m/s²`} title="GM/R² − ω²R, as NSSDCA tabulates" />
            <KV k="Escape velocity" v={`${formatSig(d.vEsc / 1000, 3)} km/s`} />
          </dl>
          <dl className="kv" aria-label="Sunlight">
            <KV k="Sunlight at mean distance" v={`${formatSig(d.S, 4)} W/m²${delta(d.S, d0.S)}`} />
            <KV k="Perihelion ÷ aphelion" v={`${formatSig(d.range.peri / d.range.aph, 3)} ×`} title="((1 + e)/(1 − e))²" />
            <KV k="Coriolis parameter at 45°" v={`${formatSig(d.f45, 3)} s⁻¹`} />
          </dl>
          <dl className="kv" aria-label="Energy balance">
            <KV k="Emission temperature" v={`${formatSig(d.Te, 4)} K`} title={`σT⁴ = S(1 − A)/4 + internal = ${formatSig(d.Te - 273.15, 3)} °C`} />
            <KV k="Measured mean temperature" v={p.tObsK !== null ? `${p.tObsK} K` : '— (your world has none)'} />
            <KV k="Greenhouse warming (measured − emission)" v={d.greenhouseK !== null ? `${formatSig(d.greenhouseK, 3)} K` : '—'} />
          </dl>
          <dl className="kv" aria-label="Atmosphere">
            <KV k="Scale height" v={d.H ? `${formatSig(d.H, 3)} km` : '—'} title={`R*T/(M g) at ${p.tObsK !== null ? 'the measured' : 'the emission'} temperature`} />
            <KV k="Air above each m²" v={`${formatSig(d.column, 3)} kg`} title="p/g" />
            <KV k="Whole atmosphere" v={`${formatSig(d.atmMass, 3)} kg`} title="4πR² p/g (thin shell)" />
          </dl>
        </div>
        {profile.length ? <LinePlot ariaLabel="Pressure with height" width={560} height={200} xLabel="pressure (bar)" yLabel="height (km)" series={[{ points: profile, color: '#82b1ff', label: 'isothermal p₀ e^(−z/H)' }]} /> : null}
        <div className="section-title">Change the CO₂ (Earth-calibrated)</div>
        <Slider label="CO₂" aria="CO2 concentration" k="co2" v={co2} min={100} max={5000} log fmt={(v) => `${Math.round(v)} ppm`} />
        <dl className="kv" aria-label="CO2 response" style={{ maxWidth: 560 }}>
          <KV k="Forcing vs 280 ppm" v={`${formatSig(cw.forcing, 3)} W/m²`} title="5.35 ln(C/280)" />
          <KV k="Eventual warming (equilibrium)" v={`${formatSig(cw.lo, 2)} to ${formatSig(cw.hi, 2)} °C`} title="NCA5 likely sensitivity 2.5–4.0 °C per doubling, scaled by forcing — illustrative" />
        </dl>
        <p className="note">Illustrative: Earth’s assessed sensitivity (likely 2.5–4.0 °C per doubling) scaled by the simple CO₂ forcing; it says nothing about other worlds or about how fast warming happens. <SourceLinks ids={['noaa-aggi', 'nca5-ch3']} /></p>
        <AtDepth level="understand">
          <ul aria-label="Model relations" style={{ fontSize: 12, paddingLeft: 18 }}>{ASSUMPTIONS.planet.map(([a, s]) => <li key={a}>{a} <SourceLinks ids={s} /></li>)}</ul>
        </AtDepth>
        <AtDepth level="research">
          <p className="note">Validation (science tests): equatorial gravity, irradiance and black-body temperature reproduce NSSDCA’s values within 1–3 % for Venus, Earth, Mars and Jupiter; scale heights within 6 %. Findings: NSSDCA’s Pluto black-body temperature (37.5 K) does not follow from its irradiance and albedo (32.2 K); for Jupiter, rotation lowers equatorial gravity by about 2.2 m/s². <SourceLinks ids={['nssdc-planetfact-notes', 'nssdc-factsheet']} /></p>
        </AtDepth>
      </div>
      <Panel id="sb-detail" className="right-panel" title="Limits of this model">
        <ul style={{ fontSize: 12, paddingLeft: 18 }} aria-label="Limitations">{ASSUMPTIONS.limits.map((l) => <li key={l}>{l}</li>)}</ul>
        <RelatedLinks id="instrument:sandbox" limit={3} />
      </Panel>
    </>
  );
}

function SavedTab() {
  const [saved, setSaved] = useState<Saved[]>(loadSaved);
  const [a, setA] = useState(0), [b, setB] = useState(1);
  const rows = useMemo(() => saved.map((s) => ({ s, ...planetFromQuery(new URLSearchParams(s.query)) })), [saved]);
  const remove = (i: number) => { const n = saved.filter((_, k) => k !== i); localStorage.setItem(SAVED_KEY, JSON.stringify(n)); setSaved(n); };
  const A = rows[a], B = rows[b];
  const line = (r: typeof A) => { const d = derive(r.planet); return [r.planet.name, `${formatSig(d.g, 3)} m/s²`, `${formatSig(d.S, 4)} W/m²`, `${formatSig(d.Te, 4)} K`, d.H ? `${formatSig(d.H, 3)} km` : '—', `${formatSig(d.column, 3)} kg/m²`, `${formatSig(r.planet.tiltDeg, 3)}°`, `${formatSig(Math.abs(r.planet.rotationH), 3)} h`]; };
  const heads = ['World', 'Gravity', 'Sunlight', 'Emission T', 'Scale height', 'Air per m²', 'Tilt', 'Rotation'];
  return (
    <>
      <Panel id="sb-s" className="left-panel" title="Saved experiments">
        {saved.length === 0 ? <p className="note">Nothing saved yet — use “Save this experiment” on the Planet or Region tab.</p> : null}
        <ol aria-label="Saved experiments" style={{ paddingLeft: 18, fontSize: 12 }}>
          {saved.map((s, i) => <li key={s.at}><button className="chip" onClick={() => navigate(`/meteorology/sandbox?${s.query}`)}>{s.name}</button> <span className="note">{new Date(s.at).toLocaleString()}</span> <button className="chip" aria-label={`Delete ${s.name}`} onClick={() => remove(i)}>✕</button></li>)}
        </ol>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Compare experiments <ProvenanceBadge cls="hypothetical" title="Your saved worlds, recomputed" /><DepthSwitch /></h1></div>
        {rows.length >= 2 ? (
          <>
            <div className="chip-row" style={{ gap: 6 }}>
              <label>A <select aria-label="Experiment A" value={a} onChange={(e) => setA(Number(e.target.value))}>{saved.map((s, i) => <option key={s.at} value={i}>{s.name}</option>)}</select></label>
              <label>B <select aria-label="Experiment B" value={b} onChange={(e) => setB(Number(e.target.value))}>{saved.map((s, i) => <option key={s.at} value={i}>{s.name}</option>)}</select></label>
            </div>
            <table className="table-mini" aria-label="Comparison" style={{ fontSize: 12 }}>
              <thead><tr><th></th>{heads.map((h) => <th key={h}>{h}</th>)}</tr></thead>
              <tbody>{[A, B].map((r, i) => r ? <tr key={i}><td>{i ? 'B' : 'A'}: {r.s.name}</td>{line(r).map((c, j) => <td key={j}>{c}</td>)}</tr> : null)}</tbody>
            </table>
          </>
        ) : <p className="note">Save at least two experiments to compare them side by side.</p>}
      </div>
    </>
  );
}

const TABS: [string, string][] = [['planet', 'Planet'], ['region', 'Region'], ['saved', 'Saved & compare']];
export default function SandboxView() {
  const { query } = useRoute();
  const tab = TABS.find(([t]) => t === query.get('tab'))?.[0] ?? 'planet';
  const save = () => {
    const name = window.prompt('Name this experiment', `${tab === 'region' ? 'Region' : planetFromQuery(query).planet.name} ${new Date().toLocaleTimeString()}`);
    if (!name) return;
    const list = loadSaved(); list.push({ name, query: query.toString(), at: Date.now() });
    localStorage.setItem(SAVED_KEY, JSON.stringify(list));
  };
  return (
    <>
      <nav className="view-switch" aria-label="Sandbox sections">
        {TABS.map(([t, l]) => <button key={t} className={tab === t ? 'active' : ''} onClick={() => setQuery({ tab: t === 'planet' ? null : t })}>{l}</button>)}
        {tab !== 'saved' ? <button onClick={save}>💾 Save this experiment</button> : null}
      </nav>
      {tab === 'region' ? <RegionLab /> : tab === 'saved' ? <SavedTab /> : <PlanetTab />}
    </>
  );
}
