/**
 * Fields explorer — #/spectral/fields?frame=lab|system&layers=coulomb,wave,heat  (Gate 4.7)
 *
 * Draws registered FIELDS layers (src/core/fields/fields.ts) on a 2-D slice of one frame. Each layer
 * is sampled on its own grid, mapped through its declared display transform and composited with a
 * user-set opacity. Layers belonging to another frame are listed but cannot be drawn here (their
 * coordinates would be meaningless on this slice). Everything is recomputed only when an input
 * changes; nothing animates, so the view is cheap on software renderers.
 */
import { Probe } from '@/ui/instruments';
import { ruler } from '@/shared/instruments/instruments';
import { useEffect, useMemo, useRef, useState } from 'react';
import { setQuery, useRoute } from '@/shared/router';
import { KV, Panel, ProvenanceBadge } from '@/ui/components';
import { SourceLinks } from '@/ui/SourcesView';
import { RelatedLinks } from '@/ui/RelatedLinks';
import { formatSig } from '@/core/units/units';
import {
  COULOMB_K, COULOMB_LAYER, DEFAULT_POL, FRAMES, GRAVITY_LAYER, HEAT_LAYER, PLANE_WAVE_LAYER, THERMAL_MATERIALS,
  diffusionLength, normalise, sampleGrid, thermalProps,
  type CoulombCtx, type Extent, type FieldLayer, type Frame, type GravityCtx, type HeatCtx, type PlaneWaveCtx,
} from '@/core/fields/fields';
import { heliocentric } from '@/modes/cosmic/solar-system/ephemeris';
import { getBody } from '@/modes/cosmic/solar-system/bodies';
import { jdFromDate } from '@/core/simulation/clock';

type LayerKey = 'gravity' | 'coulomb' | 'wave' | 'heat';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const LAYERS: Record<LayerKey, FieldLayer<any>> = { gravity: GRAVITY_LAYER, coulomb: COULOMB_LAYER, wave: PLANE_WAVE_LAYER, heat: HEAT_LAYER };
const FRAME_LAYERS: Record<'lab' | 'system', LayerKey[]> = { lab: ['coulomb', 'wave', 'heat'], system: ['gravity'] };
const FIDELITY_LABEL = { 'exact-analytic': 'exact analytic solution', 'analytic-idealised': 'analytic solution of an idealised model', numerical: 'numerical', illustrative: 'illustrative' } as const;

type RGB = [number, number, number];
const lerp = (a: RGB, b: RGB, t: number): RGB => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const diverging = (u: number): [RGB, number] => (u < 0.5 ? [lerp([70, 140, 255], [20, 30, 60], u * 2), 0.25 + 1.4 * (0.5 - u)] : [lerp([20, 30, 60], [255, 90, 90], (u - 0.5) * 2), 0.25 + 1.4 * (u - 0.5)]);
const COLORMAP: Record<LayerKey, (u: number) => [RGB, number]> = {
  gravity: (u) => [lerp([30, 20, 70], [190, 80, 220], u), 0.25 + 0.6 * u],
  coulomb: diverging,
  wave: diverging,
  heat: (u) => [u < 0.5 ? lerp([120, 20, 10], [255, 120, 20], u * 2) : lerp([255, 120, 20], [255, 240, 160], (u - 0.5) * 2), Math.min(1, u * 1.2)],
};
const LEGEND_CSS: Record<LayerKey, string> = {
  gravity: 'linear-gradient(90deg, rgb(30,20,70), rgb(190,80,220))',
  coulomb: 'linear-gradient(90deg, rgb(70,140,255), rgb(20,30,60), rgb(255,90,90))',
  wave: 'linear-gradient(90deg, rgb(70,140,255), rgb(20,30,60), rgb(255,90,90))',
  heat: 'linear-gradient(90deg, rgba(120,20,10,0.1), rgb(255,120,20), rgb(255,240,160))',
};

/** length in frame units, formatted */
function fmtLen(m: number, frame: Frame) {
  if (frame.unit === 'au') return `${formatSig(m / frame.scale, 3)} au`;
  const a = Math.abs(m);
  if (a === 0) return `0 ${frame.unit}`;
  return a >= 1 ? `${formatSig(m, 3)} m` : a >= 1e-2 ? `${formatSig(m * 100, 3)} cm` : a >= 1e-3 ? `${formatSig(m * 1e3, 3)} mm` : `${formatSig(m * 1e6, 3)} µm`;
}

const CHARGE_SETS: Record<string, { label: string; charges: (d: number) => CoulombCtx['charges'] }> = {
  dipole: { label: 'dipole (+1 nC, −1 nC)', charges: (d) => [{ x: -d, y: 0, q: 1e-9 }, { x: d, y: 0, q: -1e-9 }] },
  like: { label: 'two like charges (+1 nC, +1 nC)', charges: (d) => [{ x: -d, y: 0, q: 1e-9 }, { x: d, y: 0, q: 1e-9 }] },
  single: { label: 'single charge (+1 nC)', charges: () => [{ x: 0, y: 0, q: 1e-9 }] },
};

export default function FieldsView() {
  const { query } = useRoute();
  const frameId = query.get('frame') === 'system' ? 'system' : 'lab';
  const frame = FRAMES[frameId];
  const available = FRAME_LAYERS[frameId];
  const enabled: LayerKey[] = (() => {
    const q = query.get('layers');
    if (q === null) return frameId === 'lab' ? ['coulomb'] : ['gravity'];
    return q.split(',').filter((k): k is LayerKey => (available as string[]).includes(k));
  })();
  const toggle = (k: LayerKey) => setQuery({ layers: (enabled.includes(k) ? enabled.filter((x) => x !== k) : [...enabled, k]).join(',') });
  const [opacity, setOpacity] = useState<Record<LayerKey, number>>({ gravity: 1, coulomb: 0.9, wave: 0.6, heat: 0.85 });

  // --- view extent (half-width, metres)
  const [halfLab, setHalfLab] = useState(0.05);
  const [halfSys, setHalfSys] = useState(6);
  const half = frameId === 'lab' ? halfLab : halfSys * frame.scale;
  const ext: Extent = { xmin: -half, xmax: half, ymin: -half, ymax: half };

  // --- layer inputs
  const [chargeSet, setChargeSet] = useState('dipole');
  const [sep, setSep] = useState(0.02);
  const [lambdaW, setLambdaW] = useState(0.05);
  const [phase, setPhase] = useState(0);
  const [mat, setMat] = useState('water');
  const [Q, setQ] = useState(100);
  const [tHeat, setTHeat] = useState(600);
  const T0 = 298.15;

  const jd = useMemo(() => jdFromDate(new Date()), []);
  const ctx = useMemo(() => {
    const gravity: GravityCtx = {
      masses: ['sun', 'mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'].map((id) => { const p = heliocentric(id, jd); return { x: p[0] * 1e3, y: p[1] * 1e3, z: p[2] * 1e3, massKg: getBody(id)!.massKg ?? 0 }; }),
      soft: half * 0.01,
    };
    const coulomb: CoulombCtx = { charges: CHARGE_SETS[chargeSet].charges(sep / 2) };
    const f = 299_792_458 / lambdaW;
    const wave: PlaneWaveCtx = { lambda: lambdaW, E0: 100, t: phase / (2 * Math.PI * f), pol: DEFAULT_POL };
    const props = thermalProps(mat, T0);
    const heat: HeatCtx | null = props ? { props, Q, t: tHeat } : null;
    return { gravity, coulomb, wave, heat } as const;
  }, [jd, half, chargeSet, sep, lambdaW, phase, mat, Q, tHeat]);
  const ctxOf = (k: LayerKey) => ctx[k];

  const grids = useMemo(() => {
    const out: Partial<Record<LayerKey, ReturnType<typeof sampleGrid>>> = {};
    for (const k of enabled) { const c = ctxOf(k); if (c) out[k] = sampleGrid(LAYERS[k], c, ext, k === 'wave' ? 200 : LAYERS[k].resolution); }
    return out;
  }, [enabled.join(','), ctx, half]); // eslint-disable-line react-hooks/exhaustive-deps

  // --- draw
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const S = 560;
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const g = cv.getContext('2d')!;
    g.fillStyle = '#05070d'; g.fillRect(0, 0, S, S);
    const order: LayerKey[] = ['gravity', 'wave', 'heat', 'coulomb'];
    for (const k of order) {
      const grid = grids[k];
      if (!grid || !enabled.includes(k)) continue;
      const layer = LAYERS[k];
      const off = document.createElement('canvas'); off.width = grid.n; off.height = grid.n;
      const og = off.getContext('2d')!;
      const img = og.createImageData(grid.n, grid.n);
      // heat: colour the rise above T0; coulomb: symlog scale tied to the field 1 view-width from a charge
      const symScale = k === 'coulomb' ? (Math.abs(ctx.coulomb.charges[0].q) * COULOMB_K) / half : undefined;
      for (let p = 0; p < grid.n * grid.n; p++) {
        const v = grid.values[p];
        const u = k === 'heat' ? normalise('linear', v, T0, grid.max) : normalise(layer.transform, v, grid.min, grid.max, symScale);
        const [rgb, a] = COLORMAP[k](Math.max(0, Math.min(1, u)));
        const band = k === 'gravity' && (Math.log10(-v) * 4) % 1 < 0.06 ? 60 : 0; // contours every 0.25 dex
        img.data[4 * p] = rgb[0] + band; img.data[4 * p + 1] = rgb[1] + band; img.data[4 * p + 2] = rgb[2] + band; img.data[4 * p + 3] = 255 * Math.min(1, a);
      }
      og.putImageData(img, 0, 0);
      g.save(); g.globalAlpha = opacity[k]; g.imageSmoothingEnabled = true; g.drawImage(off, 0, 0, S, S); g.restore();
      if (k === 'coulomb') drawArrows(g, ctx.coulomb, ext, S, opacity[k]);
      if (k === 'coulomb') for (const c of ctx.coulomb.charges) { const [px, py] = toPx(c.x, c.y, ext, S); g.fillStyle = c.q > 0 ? '#ff6b6b' : '#5fb8ff'; g.beginPath(); g.arc(px, py, 7, 0, 7); g.fill(); g.fillStyle = '#05070d'; g.font = 'bold 11px sans-serif'; g.textAlign = 'center'; g.fillText(c.q > 0 ? '+' : '−', px, py + 4); }
      if (k === 'gravity') for (const m of ctx.gravity.masses) { const [px, py] = toPx(m.x, m.y, ext, S); if (px < 0 || py < 0 || px > S || py > S) continue; g.fillStyle = '#ffffffcc'; g.beginPath(); g.arc(px, py, 2.5, 0, 7); g.fill(); }
    }
    // frame axes
    g.strokeStyle = 'rgba(255,255,255,0.18)'; g.lineWidth = 1; g.beginPath(); g.moveTo(S / 2, 0); g.lineTo(S / 2, S); g.moveTo(0, S / 2); g.lineTo(S, S / 2); g.stroke();
    // scale bar = one quarter of the view
    g.strokeStyle = '#e8edf7'; g.lineWidth = 2; g.beginPath(); g.moveTo(16, S - 18); g.lineTo(16 + S / 4, S - 18); g.stroke();
    g.fillStyle = '#e8edf7'; g.font = '12px sans-serif'; g.textAlign = 'left'; g.fillText(fmtLen(half / 2, frame), 16, S - 26);
  }, [grids, opacity, ctx, half, frame, enabled.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps

  // --- cursor readout
  const [cursor, setCursor] = useState<[number, number] | null>(null);
  const onMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const u = (e.clientX - r.left) / r.width, v = (e.clientY - r.top) / r.height;
    setCursor([ext.xmin + u * (ext.xmax - ext.xmin), ext.ymax - v * (ext.ymax - ext.ymin)]);
  };
  const probe: [number, number] = cursor ?? (frameId === 'lab' ? [0, half / 2] : [half / 2, 0]);
  // ruler: click pins a point; the readout gives the distance from it to the probe
  const [pinned, setPinned] = useState<[number, number] | null>(null);
  useEffect(() => setPinned(null), [frameId]);

  const heatProps = ctx.heat?.props ?? null;

  return (
    <>
      <Panel id="fields-layers" className="left-panel" title="Field layers">
        <div className="section-title">Frame</div>
        <div className="chip-row" role="radiogroup" aria-label="Frame">
          {(['lab', 'system'] as const).map((f) => <button key={f} role="radio" aria-checked={frameId === f} className={`chip ${frameId === f ? 'active' : ''}`} onClick={() => setQuery({ frame: f === 'lab' ? null : f, layers: null })}>{FRAMES[f].label}</button>)}
        </div>
        <p className="note" style={{ fontSize: 10.5 }}>{frame.description}.</p>
        <div className="slider-row"><span style={{ minWidth: 60 }}>view ±</span>
          {frameId === 'lab'
            ? <input type="range" min={-3} max={0} step={0.01} value={Math.log10(halfLab)} onChange={(e) => setHalfLab(10 ** Number(e.target.value))} aria-label="View half-width (log scale)" />
            : <input type="range" min={-0.5} max={1.6} step={0.01} value={Math.log10(halfSys)} onChange={(e) => setHalfSys(10 ** Number(e.target.value))} aria-label="View half-width (log scale)" />}
          <span style={{ fontFamily: 'var(--mono)', fontSize: 11 }}>{fmtLen(half, frame)}</span></div>

        <div className="section-title">Layers</div>
        {(Object.keys(LAYERS) as LayerKey[]).map((k) => {
          const L = LAYERS[k];
          const here = available.includes(k);
          return (
            <div key={k} className="field-layer" style={{ borderBottom: '1px solid var(--line)', padding: '6px 0', opacity: here ? 1 : 0.5 }}>
              <label className="toggle-row" style={{ borderBottom: 0, padding: 0 }}>
                <span>{L.label} <span style={{ color: 'var(--text-faint)' }}>({L.symbol}, {L.units})</span></span>
                <input type="checkbox" disabled={!here} checked={here && enabled.includes(k)} onChange={() => toggle(k)} aria-label={`Show ${L.label} layer`} />
              </label>
              {!here && <p className="note" style={{ fontSize: 10.5, margin: 0 }}>Belongs to the {L.frame.label.toLowerCase()}; switch frame to draw it.</p>}
              {here && enabled.includes(k) && (
                <>
                  <div className="slider-row"><span style={{ minWidth: 60 }}>opacity</span><input type="range" min={0.05} max={1} step={0.05} value={opacity[k]} onChange={(e) => setOpacity((o) => ({ ...o, [k]: Number(e.target.value) }))} aria-label={`${L.label} opacity`} /><span style={{ fontFamily: 'var(--mono)', fontSize: 11 }}>{Math.round(opacity[k] * 100)}%</span></div>
                  {k === 'coulomb' && <>
                    <select className="text-input" aria-label="Charge configuration" value={chargeSet} onChange={(e) => setChargeSet(e.target.value)}>{Object.entries(CHARGE_SETS).map(([id, c]) => <option key={id} value={id}>{c.label}</option>)}</select>
                    {chargeSet !== 'single' && <div className="slider-row"><span style={{ minWidth: 60 }}>separation</span><input type="range" min={-3} max={0} step={0.01} value={Math.log10(sep)} onChange={(e) => setSep(10 ** Number(e.target.value))} aria-label="Charge separation (log scale)" /><span style={{ fontFamily: 'var(--mono)', fontSize: 11 }}>{fmtLen(sep, frame)}</span></div>}
                  </>}
                  {k === 'wave' && <>
                    <div className="slider-row"><span style={{ minWidth: 60 }}>λ</span><input type="range" min={-3} max={0} step={0.01} value={Math.log10(lambdaW)} onChange={(e) => setLambdaW(10 ** Number(e.target.value))} aria-label="Plane-wave wavelength (log scale)" /><span style={{ fontFamily: 'var(--mono)', fontSize: 11 }}>{fmtLen(lambdaW, frame)}</span></div>
                    <div className="slider-row"><span style={{ minWidth: 60 }}>phase ωt</span><input type="range" min={0} max={6.283} step={0.01} value={phase} onChange={(e) => setPhase(Number(e.target.value))} aria-label="Plane-wave phase" /><span style={{ fontFamily: 'var(--mono)', fontSize: 11 }}>{phase.toFixed(2)} rad</span></div>
                  </>}
                  {k === 'heat' && <>
                    <select className="text-input" aria-label="Medium for heat diffusion" value={mat} onChange={(e) => setMat(e.target.value)}>{THERMAL_MATERIALS.map((id) => { const p = thermalProps(id, T0); return p ? <option key={id} value={id}>{p.name}</option> : null; })}</select>
                    <div className="slider-row"><span style={{ minWidth: 60 }}>heat Q</span><input type="range" min={-1} max={4} step={0.01} value={Math.log10(Q)} onChange={(e) => setQ(10 ** Number(e.target.value))} aria-label="Heat released (log scale)" /><span style={{ fontFamily: 'var(--mono)', fontSize: 11 }}>{formatSig(Q, 3)} J</span></div>
                    <div className="slider-row"><span style={{ minWidth: 60 }}>time t</span><input type="range" min={-1} max={4} step={0.01} value={Math.log10(tHeat)} onChange={(e) => setTHeat(10 ** Number(e.target.value))} aria-label="Time since release (log scale)" /><span style={{ fontFamily: 'var(--mono)', fontSize: 11 }}>{formatSig(tHeat, 3)} s</span></div>
                  </>}
                </>
              )}
            </div>
          );
        })}
        <p className="note" style={{ fontSize: 10.5 }}>Charges, amplitudes, Q and t are your inputs (hypothetical set-ups). The physics that turns them into fields uses CODATA constants and, for heat, NIST fluid properties.</p>
      </Panel>

      <div className="center-stage">
        <div className="stage-head"><h1>Fields</h1><p className="note">One interface for every field: quantity, units, frame, resolution, sources, transform, fidelity, validity and provenance travel with each layer.</p></div>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <canvas ref={canvasRef} width={S} height={S} className="field-canvas" aria-label={`Field map: ${enabled.map((k) => LAYERS[k].label).join(', ') || 'no layers'}`}
            style={{ width: 'min(100%, 560px)', aspectRatio: '1', borderRadius: 8, border: '1px solid var(--line)', cursor: 'crosshair', touchAction: 'none' }}
            onPointerMove={onMove} onPointerLeave={() => setCursor(null)} onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); const u = (e.clientX - r.left) / r.width, v = (e.clientY - r.top) / r.height; setPinned([ext.xmin + u * (ext.xmax - ext.xmin), ext.ymax - v * (ext.ymax - ext.ymin)]); }} />
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, justifyContent: 'center', marginTop: 8 }} aria-label="Colour legends">
          {enabled.map((k) => { const gr = grids[k]; const L = LAYERS[k]; if (!gr) return null; return (
            <div key={k} className="note" style={{ fontSize: 10.5, minWidth: 160 }}>
              <div>{L.symbol} ({L.units}), {k === 'heat' ? 'linear, rise above T₀' : L.transform === 'log10-magnitude' ? 'log₁₀ |Φ|, contours 0.25 dex' : L.transform}</div>
              <div style={{ height: 8, borderRadius: 4, background: LEGEND_CSS[k], margin: '2px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--mono)' }}><span>{formatSig(k === 'heat' ? T0 : gr.min, 3)}</span><span>{formatSig(gr.max, 3)}</span></div>
            </div>); })}
        </div>
      </div>

      <Panel id="fields-readout" className="right-panel" title="Readout & layer metadata">
        <Probe title={`At ${cursor ? 'cursor' : 'probe point'}`} ariaLabel="Field values at the probe point"
          where={[{ label: 'x', value: probe[0], unit: 'm', sig: 4 }, { label: 'y', value: probe[1], unit: 'm', sig: 4 }]}
          rows={[
            ...enabled.map((k) => { const c = ctxOf(k); const L = LAYERS[k]; return { label: `${L.symbol} (${L.label.toLowerCase()})`, value: c ? L.sample(c, probe[0], probe[1]) : null, unit: L.units, sig: 5 }; }),
            ...(enabled.includes('coulomb') ? [(() => { const e = COULOMB_LAYER.vector!(ctx.coulomb, probe[0], probe[1]); return { label: '|E| (electric field)', value: Math.hypot(e[0], e[1]), unit: 'V/m', sig: 4 }; })()] : []),
            ...(pinned ? [{ label: '📏 distance from pinned point', value: ruler({ x: [probe[0], probe[1], 0] }, { x: [pinned[0], pinned[1], 0] }, 'm').distance, unit: 'm', sig: 5 }] : []),
          ]}
          note={pinned ? <>Pinned at ({fmtLen(pinned[0], frame)}, {fmtLen(pinned[1], frame)}). <button className="link-btn" onClick={() => setPinned(null)}>Unpin</button></> : 'Click the map to pin a point; the probe then also measures its distance from it.'} />
        {enabled.includes('heat') && heatProps && ctx.heat && (
          <>
            <div className="section-title">Medium at T₀ = {T0} K, 1 atm <ProvenanceBadge cls="derived" title="Interpolated from NIST WebBook isobar rows" /></div>
            <dl className="kv" aria-label="Thermal properties">
              <KV k="thermal conductivity k" v={heatProps.k} unit="W/(m·K)" sig={4} />
              <KV k="density ρ" v={heatProps.rho} unit="kg/m³" sig={5} />
              <KV k="specific heat cₚ" v={heatProps.cp} unit="J/(kg·K)" sig={5} />
              <KV k="diffusivity α = k/(ρcₚ)" v={heatProps.alpha} unit="m²/s" sig={4} />
              <KV k="diffusion length √(4αt)" v={fmtLen(diffusionLength(ctx.heat), frame)} />
              <KV k="peak rise at the source" v={HEAT_LAYER.sample(ctx.heat, 0, 0) - T0} unit="K" sig={3} />
            </dl>
          </>
        )}
        {enabled.length === 0 && <p className="note">No layer is switched on.</p>}
        {enabled.map((k) => { const L = LAYERS[k]; return (
          <div key={k} className="layer-meta" data-layer={L.id} style={{ borderTop: '1px solid var(--line)', marginTop: 8, paddingTop: 6 }}>
            <div className="section-title" style={{ marginTop: 0 }}>{L.label} <ProvenanceBadge cls={L.provenance} /></div>
            <dl className="kv">
              <KV k="quantity" v={L.quantity} />
              <KV k="units" v={L.units} />
              <KV k="frame" v={L.frame.label} />
              <KV k="resolution" v={`${k === 'wave' ? 200 : L.resolution} × ${k === 'wave' ? 200 : L.resolution} samples`} />
              <KV k="transform" v={L.transform} />
              <KV k="fidelity" v={FIDELITY_LABEL[L.fidelity]} />
            </dl>
            <ul className="note" style={{ fontSize: 10.5, paddingLeft: 16, margin: '4px 0' }}>{L.validity.map((v) => <li key={v}>{v}</li>)}</ul>
            <p className="note" style={{ fontSize: 10.5, margin: 0 }}><SourceLinks ids={k === 'heat' && heatProps ? [...new Set([...L.sources, ...heatProps.sources])] : L.sources} /></p>
            <RelatedLinks id={`field:${L.id}`} title={null} />
          </div>); })}
      </Panel>
    </>
  );
}

function toPx(x: number, y: number, ext: Extent, S: number): [number, number] {
  return [((x - ext.xmin) / (ext.xmax - ext.xmin)) * S, ((ext.ymax - y) / (ext.ymax - ext.ymin)) * S];
}

/** E-field direction arrows on a coarse grid; length log-compressed (directions exact). */
function drawArrows(g: CanvasRenderingContext2D, ctx: CoulombCtx, ext: Extent, S: number, alpha: number) {
  const n = 18, cell = S / n;
  const vals: { px: number; py: number; ex: number; ey: number; m: number }[] = [];
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
    const px = (i + 0.5) * cell, py = (j + 0.5) * cell;
    const x = ext.xmin + (px / S) * (ext.xmax - ext.xmin), y = ext.ymax - (py / S) * (ext.ymax - ext.ymin);
    const [ex, ey] = COULOMB_LAYER.vector!(ctx, x, y);
    const m = Math.hypot(ex, ey);
    if (m > 0 && Number.isFinite(m)) vals.push({ px, py, ex, ey, m });
  }
  if (!vals.length) return;
  const lmax = Math.max(...vals.map((v) => Math.log10(v.m))), lmin = lmax - 3;
  g.save(); g.globalAlpha = Math.min(1, alpha + 0.1); g.strokeStyle = '#e8edf7'; g.fillStyle = '#e8edf7'; g.lineWidth = 1.2;
  for (const v of vals) {
    const len = cell * (0.25 + 0.6 * Math.max(0, (Math.log10(v.m) - lmin) / (lmax - lmin)));
    const ux = v.ex / v.m, uy = -v.ey / v.m; // canvas y points down
    const x0 = v.px - (ux * len) / 2, y0 = v.py - (uy * len) / 2, x1 = v.px + (ux * len) / 2, y1 = v.py + (uy * len) / 2;
    g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
    g.beginPath(); g.moveTo(x1, y1); g.lineTo(x1 - 4 * ux + 2.5 * uy, y1 - 4 * uy - 2.5 * ux); g.lineTo(x1 - 4 * ux - 2.5 * uy, y1 - 4 * uy + 2.5 * ux); g.closePath(); g.fill();
  }
  g.restore();
}
