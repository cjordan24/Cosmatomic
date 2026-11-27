/**
 * Integrated spectroscopy — #/spectral/compare?ax=wavelength|frequency|energy&lo=&hi=&L=<layers>&z=&x=&sel=   (Gate 8.3)
 *
 * Bundled spectra on one axis: NIST atomic lines, nebula emission lines, blackbody models, the FIRAS CMB
 * spectrum and refractive-index curves. `lo`/`hi` are log₁₀ of the vacuum wavelength (m) at the axis ends,
 * `x` the selected wavelength (m), `L` the comma-separated layer ids (layers.ts), `z` the optional redshift.
 * Every layer is labelled observed or model and carries its provenance class and sources.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { navigate, setQuery, useRoute } from '@/shared/router';
import { Panel, ProvenanceBadge } from '@/ui/components';
import { SourceLinks } from '@/ui/SourcesView';
import { RelatedLinks } from '@/ui/RelatedLinks';
import { getEntity } from '@/shared/scientific-relationships/registry';
import { CMB, FIRAS } from '@/modes/cosmic/universe/cmb';
import { getMaterial, refractiveIndex } from '@/modes/atomic/materials/materials';
import { wavelengthToColor } from '@/modes/atomic/atoms/spectrum';
import { loadNistSpectra, type NistSpectra } from '@/modes/atomic/atoms/nistSpectra';
import { formatSig } from '@/core/units/units';
import {
  AXIS_LABEL, DEFAULT_RANGE, LOG_LAMBDA_MAX, LOG_LAMBDA_MIN, NOT_BUNDLED, RANGE_PRESETS, atomicBars, axisPosition, axisValue, blackbodyPerLog, catalogue,
  decadeTicks, firasPerLog, formatAxis, lambdaAtPosition, lambdaOfAxis, nebulaBars, parseLayers, redshifted, sampleBlackbody, sampleIndex, serializeLayers,
  type AxisKind, type LayerDef,
} from './layers';

const CATALOGUE = catalogue(CMB.t0.value, CMB.t0.source);
const BY_ID = new Map(CATALOGUE.map((l) => [l.id, l]));
const KNOWN = new Set(BY_ID.keys());
const COLORS = ['#7df9ff', '#f5c76b', '#ff9a7a', '#b48cff', '#7dffa8', '#ff7ad9', '#9ec1ff', '#e6e66b'];
const AXES: AxisKind[] = ['wavelength', 'frequency', 'energy'];
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const MIN_SPAN = 0.05;

const VB_W = 720, X0 = 62, SPAN = 646, STRIP_H = 10, CONT_H = 200, LINE_H = 58, INDEX_H = 66, GAP = 12, AXIS_H = 42;

function useNist() {
  const [d, setD] = useState<NistSpectra | null>(null);
  useEffect(() => { let alive = true; loadNistSpectra().then((x) => alive && setD(x)); return () => { alive = false; }; }, []);
  return d;
}

interface Track { kind: 'continuum' | 'lines' | 'index'; layers: LayerDef[]; top: number; h: number }

export default function CompareView() {
  const { query } = useRoute();
  const ax = (AXES.includes(query.get('ax') as AxisKind) ? query.get('ax') : 'wavelength') as AxisKind;
  const [lo, hi] = (() => {
    const a = Number(query.get('lo')), b = Number(query.get('hi'));
    if (query.has('lo') && query.has('hi') && Number.isFinite(a) && Number.isFinite(b)) {
      const l = clamp(Math.min(a, b), LOG_LAMBDA_MIN, LOG_LAMBDA_MAX - MIN_SPAN), u = clamp(Math.max(a, b), l + MIN_SPAN, LOG_LAMBDA_MAX);
      return [l, u];
    }
    return DEFAULT_RANGE;
  })();
  const layers = parseLayers(query.get('L'), KNOWN);
  const zq = Number(query.get('z'));
  const z = query.has('z') && Number.isFinite(zq) ? clamp(zq, 0, 20) : 0;
  const xq = Number(query.get('x'));
  const cursor = query.has('x') && xq > 0 && Number.isFinite(xq) ? xq : null;
  const sel = BY_ID.get(query.get('sel') ?? '') ?? (layers[0] ? BY_ID.get(layers[0])! : null);
  const nist = useNist();
  const needsNist = layers.some((id) => id.startsWith('a.') || id.startsWith('neb.'));

  const setRange = (a: number, b: number) => {
    const l = clamp(Math.min(a, b), LOG_LAMBDA_MIN, LOG_LAMBDA_MAX - MIN_SPAN), u = clamp(Math.max(a, b), l + MIN_SPAN, LOG_LAMBDA_MAX);
    setQuery({ lo: Number(l.toFixed(3)), hi: Number(u.toFixed(3)) });
  };
  const zoom = (f: number) => {
    const mid = cursor && Math.log10(cursor) > lo && Math.log10(cursor) < hi ? Math.log10(cursor) : (lo + hi) / 2;
    const half = ((hi - lo) / 2) * f;
    let a = mid - half, b = mid + half;
    if (a < LOG_LAMBDA_MIN) { b += LOG_LAMBDA_MIN - a; a = LOG_LAMBDA_MIN; }
    if (b > LOG_LAMBDA_MAX) { a -= b - LOG_LAMBDA_MAX; b = LOG_LAMBDA_MAX; }
    setRange(a, b);
  };
  const setLayers = (ids: string[]) => setQuery({ L: serializeLayers(ids) });
  const addLayer = (id: string) => { if (id && !layers.includes(id)) setQuery({ L: serializeLayers([...layers, id]), sel: id }); };
  const removeLayer = (id: string) => setQuery({ L: serializeLayers(layers.filter((x) => x !== id)), sel: query.get('sel') === id ? null : query.get('sel') });

  const colorOf = (id: string) => COLORS[layers.indexOf(id) % COLORS.length];
  const preset = RANGE_PRESETS.find((p) => Math.abs(p.lo - lo) < 1e-3 && Math.abs(p.hi - hi) < 1e-3);

  return (
    <>
      <Panel id="compare-layers" className="left-panel" title="Spectra">
        <p className="note" style={{ fontSize: 10.5 }}>Add any bundled spectrum. <ProvenanceBadge cls="observed" title="Measured data" /> layers are measurements; <em>model</em> layers are computed from a cited law or formula.</p>
        <AddSelect label="Atomic lines (NIST ASD)" group="atomic" layers={layers} onAdd={addLayer} />
        <AddSelect label="Nebula emission lines" group="nebula" layers={layers} onAdd={addLayer} />
        <AddSelect label="Blackbody models" group="blackbody" layers={layers} onAdd={addLayer} />
        <AddSelect label="Observed CMB" group="cmb" layers={layers} onAdd={addLayer} />
        <AddSelect label="Refractive index n(λ)" group="index" layers={layers} onAdd={addLayer} />
        <div className="section-title">On the axis ({layers.length})</div>
        <ul aria-label="Layers on the axis" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {layers.map((id) => { const l = BY_ID.get(id)!; return (
            <li key={id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '3px 0', borderTop: '1px solid var(--line)' }}>
              <span style={{ color: colorOf(id) }} aria-hidden>{l.nature === 'model' ? '┄' : '●'}</span>
              <button className={`link-btn ${sel?.id === id ? 'active' : ''}`} style={{ flex: 1, textAlign: 'left' }} onClick={() => setQuery({ sel: id })}>{l.label}</button>
              <span className="note" style={{ fontSize: 10 }}>{l.nature}</span>
              <button className="link-btn" aria-label={`Remove ${l.label}`} onClick={() => removeLayer(id)}>✕</button>
            </li>); })}
          {layers.length === 0 && <li className="note">No spectra on the axis. Add one above.</li>}
        </ul>
        {layers.length > 0 && <button className="chip" style={{ marginTop: 6 }} onClick={() => setLayers([])}>Clear all</button>}
        <div className="section-title">Not bundled</div>
        <ul className="note" aria-label="Spectra not bundled" style={{ paddingLeft: 16, fontSize: 10.5 }}>
          {NOT_BUNDLED.map((n) => <li key={n.label}><strong>{n.label}</strong>: unknown. {n.why}</li>)}
        </ul>
      </Panel>

      <div className="center-stage">
        <div className="stage-head">
          <h1>Spectra on one axis</h1>
          <p className="note">Atomic lines, nebulae, blackbodies, the cosmic microwave background and optical materials on one {ax} axis (log scale). Click the plot to read every layer at one {ax}.</p>
        </div>
        <div className="chip-row" role="radiogroup" aria-label="Axis quantity" style={{ marginBottom: 6 }}>
          {AXES.map((k) => <button key={k} role="radio" aria-checked={ax === k} className={`chip ${ax === k ? 'active' : ''}`} onClick={() => setQuery({ ax: k === 'wavelength' ? null : k })}>{k}</button>)}
          <select className="text-input" aria-label="Axis range" value={preset?.id ?? ''} onChange={(e) => { const p = RANGE_PRESETS.find((x) => x.id === e.target.value); if (p) setRange(p.lo, p.hi); }} style={{ width: 'auto', height: 28 }}>
            {!preset && <option value="">Custom: {formatAxis('wavelength', 10 ** lo, 3)} – {formatAxis('wavelength', 10 ** hi, 3)}</option>}
            {RANGE_PRESETS.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
          </select>
          <button className="chip" onClick={() => zoom(0.5)} aria-label="Zoom in">＋</button>
          <button className="chip" onClick={() => zoom(2)} aria-label="Zoom out">－</button>
        </div>
        <Redshift z={z} />
        {needsNist && !nist && <p className="note">Loading NIST spectra…</p>}
        <div className="chip-row" aria-label="Legend" style={{ gap: 10, margin: '6px 0 2px', fontSize: 11.5 }}>
          {layers.map((id) => { const l = BY_ID.get(id)!; return <span key={id} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><span style={{ color: colorOf(id), fontWeight: 700 }} aria-hidden>{l.nature === 'model' ? '╌╌' : l.group === 'cmb' ? '●' : '┃'}</span>{l.label} <span className="note">· {l.nature}{z > 0 ? (l.shiftable ? ' · shifted' : ' · not shifted') : ''}</span></span>; })}
        </div>
        <Plot ax={ax} lo={lo} hi={hi} layers={layers.map((id) => BY_ID.get(id)!)} z={z} nist={nist} cursor={cursor} colorOf={colorOf}
          onPick={(l) => setQuery({ x: Number(l.toPrecision(7)) })} />
        <p className="note" style={{ fontSize: 10.5 }}>
          Continuum track: radiance per logarithmic interval, λB_λ = νB_ν (W m⁻² sr⁻¹), the same number on all three axes, so curves and points share one log scale. Blackbodies are the <em>surface</em> radiance of an ideal emitter, not the brightness seen from Earth. Its peak lies at λ = hc/(3.92 kT), between the per-wavelength and per-frequency Wien peaks. Line tracks: bar height is the NIST relative intensity on a log scale (not comparable between spectra). n(λ) is drawn only where its formula is valid. The colour strip is an illustrative sRGB rendering. <SourceLinks ids={['codata-2018']} />
        </p>
      </div>

      <Panel id="compare-readout" className="right-panel" title="Readout">
        <Readout ax={ax} cursor={cursor} layers={layers.map((id) => BY_ID.get(id)!)} z={z} nist={nist} />
        {sel && <LayerCard l={sel} z={z} />}
      </Panel>
    </>
  );
}

function AddSelect({ label, group, layers, onAdd }: { label: string; group: LayerDef['group']; layers: string[]; onAdd: (id: string) => void }) {
  const opts = CATALOGUE.filter((l) => l.group === group);
  return (
    <label style={{ display: 'block', marginBottom: 6 }}>
      <span className="note" style={{ fontSize: 11 }}>{label}</span>
      <select className="text-input" aria-label={`Add ${label}`} value="" onChange={(e) => onAdd(e.target.value)} style={{ width: '100%' }}>
        <option value="">Add…</option>
        {opts.map((o) => <option key={o.id} value={o.id} disabled={layers.includes(o.id)}>{o.label}</option>)}
      </select>
    </label>
  );
}

function Redshift({ z }: { z: number }) {
  const [txt, setTxt] = useState(String(z));
  useEffect(() => setTxt(String(z)), [z]);
  const set = (v: number) => setQuery({ z: v > 0 ? Number(v.toPrecision(5)) : null });
  return (
    <div className="slider-row" style={{ alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
      <span style={{ minWidth: 70 }}>redshift z</span>
      <input type="range" min={0} max={3} step={0.001} value={Math.min(z, 3)} onChange={(e) => set(Number(e.target.value))} aria-label="Redshift z" style={{ maxWidth: 200 }} />
      <input className="text-input" aria-label="Redshift value" value={txt} onChange={(e) => setTxt(e.target.value)} onBlur={() => { const v = Number(txt); if (v >= 0 && v <= 20) set(v); else setTxt(String(z)); }} onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()} style={{ width: 70, height: 26 }} />
      {z > 0 && <button className="chip" onClick={() => set(0)}>Rest frame</button>}
      <span className="badge" style={{ color: 'var(--warn)' }} title="A transformation applied to the drawing, not a measurement">{z > 0 ? `transformation: λ_obs = λ_rest × ${formatSig(1 + z, 5)}` : 'rest frame (z = 0)'}</span>
    </div>
  );
}

function Plot({ ax, lo, hi, layers, z, nist, cursor, colorOf, onPick }: {
  ax: AxisKind; lo: number; hi: number; layers: LayerDef[]; z: number; nist: NistSpectra | null; cursor: number | null; colorOf: (id: string) => string; onPick: (lambda: number) => void;
}) {
  const ref = useRef<SVGSVGElement>(null);
  const px = (lambda: number) => X0 + axisPosition(ax, lambda, lo, hi) * SPAN;
  const inRange = (lambda: number) => lambda >= 10 ** lo && lambda <= 10 ** hi;
  const shift = (l: LayerDef, lambda: number) => (l.shiftable && z > 0 ? redshifted(lambda, z) : lambda);

  // tracks: one shared continuum track, then one per line or index layer
  const tracks: Track[] = [];
  let y = 4 + STRIP_H + 8;
  const cont = layers.filter((l) => l.group === 'blackbody' || l.group === 'cmb');
  if (cont.length) { tracks.push({ kind: 'continuum', layers: cont, top: y, h: CONT_H }); y += CONT_H + GAP; }
  for (const l of layers) {
    if (l.group === 'atomic' || l.group === 'nebula') { tracks.push({ kind: 'lines', layers: [l], top: y, h: LINE_H }); y += LINE_H + GAP; }
    else if (l.group === 'index') { tracks.push({ kind: 'index', layers: [l], top: y, h: INDEX_H }); y += INDEX_H + GAP; }
  }
  const axisY = y;
  const H = axisY + AXIS_H;

  // continuum data (observed frame), with a shared log y range
  const contData = useMemo(() => cont.map((l) => {
    if (l.group === 'cmb') {
      const pts = FIRAS.map((p) => firasPerLog(p, CMB.firas.referenceT));
      return { l, curve: [] as [number, number][], points: pts.filter((p) => inRange(p.lambda)) };
    }
    const k = l.shiftable && z > 0 ? 1 + z : 1;
    const curve = sampleBlackbody(l.T!, 10 ** lo / k, 10 ** hi / k).map(([lam, v]) => [lam * k, v] as [number, number]);
    return { l, curve, points: [] as ReturnType<typeof firasPerLog>[] };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [cont.map((l) => l.id).join(), lo, hi, z]);
  const ys = contData.flatMap((d) => [...d.curve.map((p) => p[1]), ...d.points.map((p) => p.y)]).filter((v) => v > 0);
  const peaks = contData.map((d) => Math.max(0, ...d.curve.map((p) => p[1]), ...d.points.map((p) => p.y))).filter((v) => v > 0);
  const yTop = ys.length ? Math.ceil(Math.log10(Math.max(...ys)) + 0.2) : 0;
  const yBot = ys.length ? Math.max(yTop - 22, Math.floor(Math.log10(Math.min(...peaks)) - 3)) : -1;

  const pick = (e: React.MouseEvent) => {
    const box = ref.current!.getBoundingClientRect();
    const p = (((e.clientX - box.left) / box.width) * VB_W - X0) / SPAN;
    if (p >= 0 && p <= 1) onPick(lambdaAtPosition(ax, p, lo, hi));
  };
  const ticks = decadeTicks(ax, lo, hi);
  const minorTicks = ticks.length < 3 ? subTicks(ax, lo, hi) : [];
  const visLo = 380e-9, visHi = 750e-9;

  return (
    <svg ref={ref} viewBox={`0 0 ${VB_W} ${H}`} role="img" aria-label={`Spectra on one ${ax} axis`} onClick={pick} style={{ width: '100%', maxWidth: 1100, display: 'block', cursor: 'crosshair' }} className="compare-plot">
      <defs>
        <clipPath id="cmp-clip"><rect x={X0} y={0} width={SPAN} height={H} /></clipPath>
        <linearGradient id="cmp-vis" x1={px(visLo)} x2={px(visHi)} gradientUnits="userSpaceOnUse">
          {[380, 420, 460, 500, 540, 580, 620, 660, 700, 750].map((n) => <stop key={n} offset={`${(Math.log10(n / 380) / Math.log10(750 / 380)) * 100}%`} stopColor={wavelengthToColor(n)} />)}
        </linearGradient>
      </defs>
      {/* visible strip (illustrative) */}
      <rect x={X0} y={4} width={SPAN} height={STRIP_H} fill="#05060c" stroke="var(--line)" />
      <g clipPath="url(#cmp-clip)">
        {(inRange(visLo) || inRange(visHi) || (10 ** lo > visLo && 10 ** hi < visHi)) && (
          <rect x={Math.min(px(visLo), px(visHi))} y={4} width={Math.abs(px(visHi) - px(visLo))} height={STRIP_H} fill="url(#cmp-vis)"><title>Visible light: illustrative sRGB colours</title></rect>
        )}
      </g>
      <text x={X0 - 6} y={4 + STRIP_H - 2} fontSize={11} textAnchor="end" fill="var(--text-faint)">visible</text>

      {/* grid */}
      {ticks.map((t) => <line key={`g${t.value}`} x1={px(t.lambda)} x2={px(t.lambda)} y1={4 + STRIP_H + 4} y2={axisY} stroke="var(--line)" />)}

      {tracks.map((tr, i) => (
        <g key={i}>
          <rect x={X0} y={tr.top} width={SPAN} height={tr.h} fill="rgba(255,255,255,0.02)" stroke="var(--line)" />
          {tr.kind === 'continuum' && <ContinuumTrack tr={tr} data={contData} yTop={yTop} yBot={yBot} px={px} colorOf={colorOf} />}
          {tr.kind === 'lines' && <LinesTrack tr={tr} nist={nist} px={px} inRange={inRange} shift={shift} color={colorOf(tr.layers[0].id)} z={z} />}
          {tr.kind === 'index' && <IndexTrack tr={tr} lo={lo} hi={hi} px={px} color={colorOf(tr.layers[0].id)} />}
        </g>
      ))}
      {tracks.length === 0 && <text x={X0 + SPAN / 2} y={axisY - 20} textAnchor="middle" fontSize={14} fill="var(--text-faint)">Add a spectrum from the list on the left.</text>}

      {/* axis */}
      <line x1={X0} x2={X0 + SPAN} y1={axisY} y2={axisY} stroke="var(--text-faint)" />
      {ticks.map((t) => (
        <g key={`t${t.value}`}>
          <line x1={px(t.lambda)} x2={px(t.lambda)} y1={axisY} y2={axisY + 6} stroke="var(--text-faint)" />
          <text x={px(t.lambda)} y={axisY + 19} fontSize={12} textAnchor="middle" fill="var(--text-dim)">{formatAxis(ax, t.value, 3)}</text>
        </g>
      ))}
      {minorTicks.map((t) => <text key={`m${t.value}`} x={px(t.lambda)} y={axisY + 19} fontSize={12} textAnchor="middle" fill="var(--text-faint)">{formatAxis(ax, t.value, 3)}</text>)}
      <text x={X0 + SPAN / 2} y={axisY + 38} fontSize={12} textAnchor="middle" fill="var(--text)">{AXIS_LABEL[ax]} (log scale){ax !== 'wavelength' ? ', increasing to the right' : ''}</text>

      {cursor !== null && inRange(cursor) && <line x1={px(cursor)} x2={px(cursor)} y1={2} y2={axisY} stroke="#ffffff" strokeWidth={1.2} strokeDasharray="4 3" pointerEvents="none" />}
    </svg>
  );
}

/** When the range is under a decade, label 2× and 5× steps as well. */
function subTicks(ax: AxisKind, lo: number, hi: number) {
  const a = axisValue(ax, 10 ** lo), b = axisValue(ax, 10 ** hi);
  const [vmin, vmax] = a < b ? [a, b] : [b, a];
  const out: { value: number; lambda: number }[] = [];
  for (let k = Math.floor(Math.log10(vmin)); k <= Math.ceil(Math.log10(vmax)); k++) for (const m of [2, 3, 5]) {
    const v = m * 10 ** k;
    if (v > vmin && v < vmax) out.push({ value: v, lambda: lambdaOfAxis(ax, v) });
  }
  return out.length > 8 ? out.filter((t) => /^[25]/.test(String(t.value / 10 ** Math.floor(Math.log10(t.value))))) : out;
}

function ContinuumTrack({ tr, data, yTop, yBot, px, colorOf }: { tr: Track; data: { l: LayerDef; curve: [number, number][]; points: ReturnType<typeof firasPerLog>[] }[]; yTop: number; yBot: number; px: (l: number) => number; colorOf: (id: string) => string }) {
  const sy = (v: number) => tr.top + tr.h - ((Math.log10(v) - yBot) / (yTop - yBot)) * tr.h;
  const step = Math.max(1, Math.ceil((yTop - yBot) / 8));
  const decs: number[] = [];
  for (let d = yBot; d <= yTop; d += step) decs.push(d);
  return (
    <g>
      {decs.map((d) => <g key={d}><line x1={X0} x2={X0 + SPAN} y1={sy(10 ** d)} y2={sy(10 ** d)} stroke="var(--line)" strokeDasharray="2 4" />
        <text x={X0 - 6} y={sy(10 ** d) + 4} fontSize={12} textAnchor="end" fill="var(--text-dim)">{`10${String(d).replace('-', '⁻').replace(/\d/g, (x) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(x)])}`}</text></g>)}
      <text transform={`translate(12 ${tr.top + tr.h / 2}) rotate(-90)`} fontSize={11} textAnchor="middle" fill="var(--text)">λB_λ = νB_ν (W m⁻² sr⁻¹)</text>
      <g clipPath="url(#cmp-clip)">
        {data.map(({ l, curve, points }) => (
          <g key={l.id}>
            {curve.length > 1 && <polyline fill="none" stroke={colorOf(l.id)} strokeWidth={1.8} strokeDasharray="6 4" points={curve.filter(([, v]) => Math.log10(v) >= yBot - 1).map(([lam, v]) => `${px(lam).toFixed(1)},${Math.min(tr.top + tr.h + 4, sy(v)).toFixed(1)}`).join(' ')}><title>{`${l.label} (model)`}</title></polyline>}
            {points.map((p, i) => <g key={i}><line x1={px(p.lambda)} x2={px(p.lambda)} y1={sy(p.y + p.sigma)} y2={sy(Math.max(p.y - p.sigma, p.y * 1e-3))} stroke={colorOf(l.id)} /><circle cx={px(p.lambda)} cy={sy(p.y)} r={3} fill={colorOf(l.id)}><title>{`FIRAS ${formatSig(p.nu / 1e9, 4)} GHz: νI_ν = ${formatSig(p.y, 4)} ± ${formatSig(p.sigma, 2)} W m⁻² sr⁻¹ (1σ)`}</title></circle></g>)}
          </g>
        ))}
      </g>
    </g>
  );
}

function LinesTrack({ tr, nist, px, inRange, shift, color, z }: { tr: Track; nist: NistSpectra | null; px: (l: number) => number; inRange: (l: number) => boolean; shift: (l: LayerDef, lam: number) => number; color: string; z: number }) {
  const l = tr.layers[0];
  const base = tr.top + tr.h - 4, full = tr.h - 22;
  let body: React.ReactNode = null, count = '';
  if (!nist) body = <text x={X0 + SPAN / 2} y={base - 14} fontSize={12} textAnchor="middle" fill="var(--text-faint)">loading…</text>;
  else if (l.group === 'atomic') {
    const spec = l.id.slice(2).replace('-', ' ');
    const bars = atomicBars(nist, spec).map((b) => ({ ...b, obs: shift(l, b.lambda) })).filter((b) => inRange(b.obs));
    count = ` · ${bars.length} lines in view`;
    body = bars.map((b, i) => <line key={i} x1={px(b.obs)} x2={px(b.obs)} y1={base} y2={base - full * b.s} stroke={color} strokeWidth={1.4}><title>{`${spec} ${b.line.wl.toFixed(4)} nm (vacuum, rest${b.line.ritz ? ', Ritz' : ''})${z > 0 ? ` → ${formatSig(b.obs * 1e9, 7)} nm at z = ${z}` : ''}  ${b.line.lower} → ${b.line.upper}`}</title></line>);
  } else {
    const { placed } = nebulaBars(nist, l.id.slice(4));
    const bars = placed.map((b) => ({ ...b, obs: shift(l, b.lambda) })).filter((b) => inRange(b.obs));
    count = ` · ${bars.length} of ${placed.length} lines in view`;
    body = bars.map((b, i) => <g key={i}><line x1={px(b.obs)} x2={px(b.obs)} y1={base} y2={base - full * 0.8} stroke={color} strokeWidth={2} /><text x={px(b.obs) + 3} y={base - full * 0.8 + 9 + (i % 2) * 12} fontSize={11.5} fill={color}>{b.label}<title>{`${b.label}: NIST ${b.line.wl} nm (vacuum, rest) · ${b.context}`}</title></text></g>);
  }
  return (
    <g>
      <text x={X0 + 6} y={tr.top + 13} fontSize={12} fill="var(--text-dim)">{l.label} · {l.nature}{z > 0 ? ` · shifted ×${formatSig(1 + z, 4)}` : ''}{count}</text>
      <text x={X0 - 6} y={tr.top + tr.h / 2 + 4} fontSize={11} textAnchor="end" fill="var(--text-faint)">{l.group === 'atomic' ? 'rel. int.' : 'lines'}</text>
      <g clipPath="url(#cmp-clip)">{body}</g>
    </g>
  );
}

function IndexTrack({ tr, lo, hi, px, color }: { tr: Track; lo: number; hi: number; px: (l: number) => number; color: string }) {
  const l = tr.layers[0];
  const m = getMaterial(l.id.slice(2))!;
  const pts = sampleIndex(m, 10 ** lo, 10 ** hi);
  const ri = m.refractiveIndex!;
  if (!pts.length) return <g><text x={X0 + 6} y={tr.top + 13} fontSize={12} fill="var(--text-dim)">{l.label} · model</text><text x={X0 + SPAN / 2} y={tr.top + tr.h / 2 + 8} textAnchor="middle" fontSize={12} fill="var(--text-faint)">unknown here: the formula is valid only {ri.rangeUm?.join('–')} µm</text></g>;
  const nMin = Math.min(...pts.map((p) => p[1])), nMax = Math.max(...pts.map((p) => p[1]));
  const pad = (nMax - nMin) * 0.1 || 0.01;
  const sy = (v: number) => tr.top + tr.h - 6 - ((v - (nMin - pad)) / (nMax - nMin + 2 * pad)) * (tr.h - 24);
  return (
    <g>
      <text x={X0 + 6} y={tr.top + 13} fontSize={12} fill="var(--text-dim)">{l.label} · model · valid {ri.rangeUm?.join('–')} µm</text>
      <text x={X0 - 6} y={sy(nMax) + 4} fontSize={11} textAnchor="end" fill="var(--text-dim)">{nMax.toFixed(4)}</text>
      <text x={X0 - 6} y={sy(nMin) + 4} fontSize={11} textAnchor="end" fill="var(--text-dim)">{nMin.toFixed(4)}</text>
      <text x={8} y={tr.top + tr.h / 2 + 4} fontSize={12} textAnchor="start" fill="var(--text-faint)">n</text>
      <g clipPath="url(#cmp-clip)"><polyline fill="none" stroke={color} strokeWidth={1.8} strokeDasharray="6 4" points={pts.map(([lam, v]) => `${px(lam).toFixed(1)},${sy(v).toFixed(1)}`).join(' ')} /></g>
    </g>
  );
}

function Readout({ ax, cursor, layers, z, nist }: { ax: AxisKind; cursor: number | null; layers: LayerDef[]; z: number; nist: NistSpectra | null }) {
  if (cursor === null) return <p className="note">Click the plot to read every layer at one {ax}.</p>;
  const rows = layers.map((l) => {
    const rest = l.shiftable && z > 0 ? cursor / (1 + z) : cursor;
    let v: string;
    if (l.group === 'blackbody') { const y = blackbodyPerLog(rest, l.T!); v = y > 0 ? `λB_λ = ${formatSig(y, 4)} W m⁻² sr⁻¹` : 'λB_λ ≈ 0 (Wien tail)'; }
    else if (l.group === 'cmb') {
      const pts = FIRAS.map((p) => firasPerLog(p, CMB.firas.referenceT));
      const near = pts.reduce((a, b) => (Math.abs(Math.log(b.lambda / cursor)) < Math.abs(Math.log(a.lambda / cursor)) ? b : a));
      v = Math.abs(Math.log(near.lambda / cursor)) < 0.04 ? `νI_ν = ${formatSig(near.y, 4)} ± ${formatSig(near.sigma, 2)} W m⁻² sr⁻¹ at ${formatSig(near.nu / 1e9, 4)} GHz (nearest point)` : 'no FIRAS point here (measured 68–640 GHz)';
    } else if (l.group === 'index') { const m = getMaterial(l.id.slice(2))!; const n = refractiveIndex(m.refractiveIndex!, rest * 1e6); v = n === null ? `unknown (formula valid ${m.refractiveIndex!.rangeUm?.join('–')} µm)` : `n = ${n.toFixed(5)}`; }
    else if (!nist) v = 'loading…';
    else {
      const cands = l.group === 'atomic' ? atomicBars(nist, l.id.slice(2).replace('-', ' ')).map((b) => ({ lambda: b.lambda, text: `${b.line.lower} → ${b.line.upper}` })) : nebulaBars(nist, l.id.slice(4)).placed.map((b) => ({ lambda: b.lambda, text: b.label }));
      const near = cands.length ? cands.reduce((a, b) => (Math.abs(b.lambda - rest) < Math.abs(a.lambda - rest) ? b : a)) : null;
      v = near && Math.abs(near.lambda / rest - 1) < 0.005 ? `nearest line ${formatSig(near.lambda * 1e9, 8)} nm rest: ${near.text}` : 'no line within 0.5 %';
    }
    return { l, v, rest };
  });
  return (
    <>
      <div className="section-title">Selected <ProvenanceBadge cls="derived" title="λ, ν and E converted with exact SI constants" /></div>
      <dl className="kv" aria-label="Selected position">
        <dt>wavelength</dt><dd>{formatAxis('wavelength', cursor, 6)}</dd>
        <dt>frequency</dt><dd>{formatAxis('frequency', axisValue('frequency', cursor), 6)}</dd>
        <dt>photon energy</dt><dd>{formatAxis('energy', axisValue('energy', cursor), 6)}</dd>
        {z > 0 && <><dt>rest wavelength (z = {z})</dt><dd>{formatAxis('wavelength', cursor / (1 + z), 6)}</dd></>}
      </dl>
      <button className="link-btn" onClick={() => navigate(`/spectral?lambda=${Number(cursor.toPrecision(7))}`)}>Band names in the atlas →</button>
      {rows.length > 0 && <>
        <div className="section-title">Layers here</div>
        <ul aria-label="Layer values at the selected position" style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 11.5 }}>
          {rows.map(({ l, v }) => <li key={l.id} data-reading={`${l.label} (${l.nature})`} style={{ borderTop: '1px solid var(--line)', padding: '4px 0' }}><strong>{l.label}</strong> <span className="note">({l.nature})</span><br /><span data-value>{v}</span></li>)}
        </ul>
      </>}
    </>
  );
}

function LayerCard({ l, z }: { l: LayerDef; z: number }) {
  const ent = l.entity ? getEntity(l.entity) : null;
  return (
    <>
      <div className="section-title">{l.label}</div>
      <p style={{ margin: '4px 0' }}><span className="badge" style={{ color: l.nature === 'observed' ? '#5cf2a6' : '#7df9ff' }}>{l.nature === 'observed' ? 'observed data' : 'model'}</span>{l.provenance !== 'observed' && <> <ProvenanceBadge cls={l.provenance} /></>}</p>
      <p className="note" style={{ fontSize: 11 }}>{l.note}</p>
      {z > 0 && <p className="note warn" style={{ fontSize: 10.5 }}>{l.shiftable ? `Drawn redshifted by (1 + z) = ${formatSig(1 + z, 5)}: a transformation of the rest-frame layer, not an observation. Intensities are not transformed.` : 'Not redshifted.'}</p>}
      <p className="note" style={{ fontSize: 10.5 }}>Sources: <SourceLinks ids={l.sources} /></p>
      {ent?.route && <button className="link-btn" onClick={() => navigate(ent.route!.replace(/^#/, ''))}>Open {ent.label} →</button>}
      {l.entity && <RelatedLinks id={l.entity} limit={5} />}
    </>
  );
}
