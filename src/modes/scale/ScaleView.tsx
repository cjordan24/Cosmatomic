/**
 * Universal scale navigator — #/scale?z=<log10 window width in m>&sel=<reference id>   (Gate 8.1)
 *
 * A powers-of-ten zoom from 10⁻¹⁶ m to 10²⁷·⁵ m. The drawing window is 10^z metres wide; every reference
 * object whose length falls in the window is drawn to the same linear scale (circles and squares for sizes,
 * bars for distances), so the ratios on screen are the real ratios. Lengths come from bundled datasets
 * (src/modes/scale/references.ts), each with its interval, provenance class and sources.
 */
import { useEffect, useMemo, useRef } from 'react';
import { navigate, setQuery, useRoute } from '@/shared/router';
import { PROVENANCE_LABEL } from '@/core/provenance/provenance';
import { SCALE_LEVELS } from '@/core/scale/scale';
import { Panel, ProvenanceBadge } from '@/ui/components';
import { SourceLinks } from '@/ui/SourcesView';
import { LOG_MAX, LOG_MIN, SCALE_REFS, formatLength, type ScaleRef } from './references';

const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
const DEFAULT_Z = -9.3;
const VB_W = 1000, X0 = 40, SPAN = 900, BASE = 420, TOP = 24;
/** smallest drawn length in px; anything smaller is listed as "below one pixel" */
const MIN_PX = 1.5;

const LABEL_PX = 16;
interface Label { r: ScaleRef; x: number; y: number; text: string }
/** Places labels without overlap: flips to the left near the right edge, then nudges vertically to the nearest free row. */
function placeLabels(items: Label[]): (Label & { anchor: 'start' | 'end' })[] {
  const placed: { x1: number; x2: number; y: number }[] = [];
  const out: (Label & { anchor: 'start' | 'end' })[] = [];
  for (const it of items) {
    const w = it.text.length * LABEL_PX * 0.52;
    const anchor: 'start' | 'end' = it.x + w > X0 + SPAN + 30 ? 'end' : 'start';
    const x1 = anchor === 'start' ? it.x : it.x - w, x2 = anchor === 'start' ? it.x + w : it.x;
    const clampY = (v: number) => Math.min(BASE - 4, Math.max(TOP + LABEL_PX, v));
    const free = (v: number) => !placed.some((p) => p.x1 < x2 && x1 < p.x2 && Math.abs(p.y - v) < LABEL_PX + 1);
    let y = clampY(it.y);
    for (let k = 1; k < 60 && !free(y); k++) y = clampY(it.y + (k % 2 ? -1 : 1) * Math.ceil(k / 2) * (LABEL_PX + 2));
    if (!free(y)) for (let k = 1; k < 30 && !free(y); k++) y = clampY(BASE - 4 - k * (LABEL_PX + 2));
    placed.push({ x1, x2, y });
    out.push({ ...it, x: it.x, y, anchor });
  }
  return out;
}

const sup = (n: number) => String(n).replace(/-/g, '⁻').replace(/\d/g, (d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(d)]);
const pow10 = (x: number) => `10${sup(Math.round(x * 10) / 10)}`;

function interval(r: ScaleRef) {
  if (r.lo === null || r.hi === null) return r.interval ? ` (${r.interval})` : '';
  const same = Math.abs(r.lo - r.hi) <= 1e-9 * Math.max(r.lo, r.hi);
  return same ? ` ± ${formatLength(r.lo, 2)}${r.interval ? ` (${r.interval})` : ''}` : ` +${formatLength(r.hi, 2)} / −${formatLength(r.lo, 2)}${r.interval ? ` (${r.interval})` : ''}`;
}

function Stage({ z, sel, onSelect }: { z: number; sel: string | null; onSelect: (id: string) => void }) {
  const W = 10 ** z;
  const px = (m: number) => (m / W) * SPAN;
  const shapes = SCALE_REFS.filter((r) => r.shape !== 'bar' && px(r.m) >= MIN_PX && px(r.m) <= SPAN * 60);
  const bars = SCALE_REFS.filter((r) => r.shape === 'bar' && px(r.m) >= MIN_PX && px(r.m) <= SPAN * 60);
  const below = SCALE_REFS.filter((r) => px(r.m) < MIN_PX);
  const ticks = [0, 0.25, 0.5, 0.75, 1];
  // larger shapes first so smaller ones are drawn on top and stay clickable
  const ordered = [...shapes].sort((a, b) => b.m - a.m);
  return (
    <svg viewBox={`0 0 ${VB_W} ${BASE + 58}`} role="img" aria-label={`Scale window ${formatLength(W)} wide`} style={{ width: '100%', maxWidth: 980, display: 'block' }}>
      <defs><clipPath id="scale-clip"><rect x={X0} y={TOP} width={SPAN + 40} height={BASE - TOP} /></clipPath></defs>
      <rect x={X0} y={TOP} width={SPAN} height={BASE - TOP} fill="rgba(255,255,255,0.015)" stroke="rgba(255,255,255,0.06)" />
      <g clipPath="url(#scale-clip)">
        {ordered.map((r) => {
          const d = px(r.m), col = PROVENANCE_LABEL[r.provenance].color, on = r.id === sel;
          const common = { fill: on ? `${col}33` : `${col}12`, stroke: col, strokeWidth: on ? 2 : 1, style: { cursor: 'pointer' }, onClick: () => onSelect(r.id) };
          return r.shape === 'circle'
            ? <circle key={r.id} cx={X0 + d / 2} cy={BASE - d / 2} r={d / 2} {...common}><title>{`${r.label}: ${formatLength(r.m)} (${r.quantity})`}</title></circle>
            : <rect key={r.id} x={X0} y={BASE - d} width={d} height={d} {...common}><title>{`${r.label}: ${formatLength(r.m)} (${r.quantity})`}</title></rect>;
        })}
        {bars.map((r, i) => {
          const d = px(r.m), y = TOP + 18 + i * 22, col = PROVENANCE_LABEL[r.provenance].color, on = r.id === sel;
          return (
            <g key={r.id} style={{ cursor: 'pointer' }} onClick={() => onSelect(r.id)}>
              <title>{`${r.label}: ${formatLength(r.m)} (${r.quantity})`}</title>
              <line x1={X0} x2={X0 + Math.min(d, SPAN + 30)} y1={y} y2={y} stroke={col} strokeWidth={on ? 4 : 2.5} />
              <line x1={X0} x2={X0} y1={y - 5} y2={y + 5} stroke={col} />
              {d <= SPAN && <line x1={X0 + d} x2={X0 + d} y1={y - 5} y2={y + 5} stroke={col} />}
            </g>
          );
        })}
      </g>
      {placeLabels([
        ...bars.map((r, i) => { const d = px(r.m); return { r, x: Math.min(X0 + d + 6, X0 + SPAN - 4), y: TOP + 18 + i * 22 - 5, text: `${r.label} · ${formatLength(r.m)}${d > SPAN ? ' →' : ''}` }; }),
        ...ordered.filter((r) => px(r.m) >= 10).map((r) => { const d = px(r.m); return d <= SPAN
          ? { r, x: X0 + d + 5, y: BASE - Math.min(d / 2, (BASE - TOP) / 2) + 5, text: `${r.label} · ${formatLength(r.m)}` }
          : { r, x: X0 + SPAN - 4, y: BASE - 10, text: `${r.label} (larger than the window)` }; }),
      ]).map((l) => (
        <text key={`l-${l.r.id}`} x={l.x} y={l.y} fontSize={LABEL_PX} textAnchor={l.anchor} fill={l.r.id === sel ? '#ffffff' : 'var(--text-dim)'} style={{ pointerEvents: 'none' }}>{l.text}</text>
      ))}
      {/* scale bar */}
      <line x1={X0} x2={X0 + SPAN} y1={BASE + 10} y2={BASE + 10} stroke="var(--text-faint)" />
      {ticks.map((t) => (
        <g key={t}>
          <line x1={X0 + t * SPAN} x2={X0 + t * SPAN} y1={BASE + 6} y2={BASE + 14} stroke="var(--text-faint)" />
          <text x={X0 + t * SPAN} y={BASE + 30} fontSize={15} textAnchor={t === 0 ? 'start' : t === 1 ? 'end' : 'middle'} fill="var(--text-dim)">{t === 0 ? '0' : formatLength(t * W)}</text>
        </g>
      ))}
      {below.length > 0 && <text x={X0} y={BASE + 52} fontSize={14} fill="var(--text-faint)">{below.length} smaller object{below.length > 1 ? 's' : ''} below one pixel at this zoom (largest: {below[below.length - 1].label}, {formatLength(below[below.length - 1].m)})</text>}
    </svg>
  );
}

/** The whole range, LOG_MIN … LOG_MAX, with the current window and every reference marked. Click to jump. */
function Ruler({ z, onZ }: { z: number; onZ: (z: number) => void }) {
  const W = 1000, H = 92, L = 40, R = 960;
  const x = (lg: number) => L + ((lg - LOG_MIN) / (LOG_MAX - LOG_MIN)) * (R - L);
  const decades = Array.from({ length: Math.floor(LOG_MAX) - LOG_MIN + 1 }, (_, i) => LOG_MIN + i);
  const ref = useRef<SVGSVGElement>(null);
  return (
    <svg ref={ref} viewBox={`0 0 ${W} ${H}`} role="slider" aria-label="Position on the scale of the universe" aria-valuemin={LOG_MIN} aria-valuemax={LOG_MAX} aria-valuenow={z}
      style={{ width: '100%', maxWidth: 980, display: 'block', cursor: 'pointer' }}
      onClick={(e) => {
        const box = ref.current!.getBoundingClientRect();
        const lg = LOG_MIN + (((e.clientX - box.left) / box.width) * W - L) / (R - L) * (LOG_MAX - LOG_MIN);
        onZ(clamp(lg + 0.5, LOG_MIN, LOG_MAX));
      }}>
      <rect x={x(z - 3)} y={8} width={Math.max(2, x(z) - x(z - 3))} height={34} fill="rgba(125,249,255,0.12)" stroke="var(--accent)" />
      <line x1={L} x2={R} y1={42} y2={42} stroke="var(--text-faint)" />
      {decades.map((d) => (
        <g key={d}>
          <line x1={x(d)} x2={x(d)} y1={d % 4 === 0 ? 34 : 38} y2={42} stroke="var(--text-faint)" />
          {d % 4 === 0 && <text x={x(d)} y={62} fontSize={15} textAnchor="middle" fill="var(--text-dim)">{pow10(d)} m</text>}
        </g>
      ))}
      {SCALE_REFS.map((r) => <line key={r.id} x1={x(Math.log10(r.m))} x2={x(Math.log10(r.m))} y1={14} y2={30} stroke={PROVENANCE_LABEL[r.provenance].color} strokeWidth={1.2}><title>{`${r.label}: ${formatLength(r.m)}`}</title></line>)}
      {SCALE_LEVELS.map((l) => <circle key={l.id} cx={x(l.log10m)} cy={80} r={4} fill={l.support === 'planned' ? 'var(--text-faint)' : 'var(--accent-3)'}><title>{`${l.label} (${l.support})`}</title></circle>)}
    </svg>
  );
}

export default function ScaleView() {
  const { query } = useRoute();
  const zq = Number(query.get('z'));
  const z = query.has('z') && Number.isFinite(zq) ? clamp(zq, LOG_MIN, LOG_MAX) : DEFAULT_Z;
  const sel = SCALE_REFS.find((r) => r.id === query.get('sel')) ?? null;
  const setZ = (v: number) => setQuery({ z: (Math.round(clamp(v, LOG_MIN, LOG_MAX) * 100) / 100).toString() });
  const W = 10 ** z;
  const inView = useMemo(() => SCALE_REFS.filter((r) => r.m >= W / 600 && r.m <= W * 60), [W]);
  const level = SCALE_LEVELS.reduce((b, l) => (Math.abs(l.log10m - (z - 1)) < Math.abs(b.log10m - (z - 1)) ? l : b));

  // wheel zoom on the stage (non-passive so the page does not scroll at the same time)
  const stageRef = useRef<HTMLDivElement>(null);
  const zRef = useRef(z); zRef.current = z;
  useEffect(() => {
    const el = stageRef.current; if (!el) return;
    const onWheel = (e: WheelEvent) => { e.preventDefault(); setZ(zRef.current + e.deltaY * 0.0025); };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  return (
    <>
      <div className="center-stage">
        <div className="stage-head">
          <h1>Scale of the universe</h1>
          <p className="note">The window is <strong>{formatLength(W)}</strong> wide ({pow10(z)} m). Everything drawn uses the same linear scale, so sizes on screen compare directly. Circles and squares are sizes; bars are lengths and distances. Colour is the provenance class. Scroll on the drawing, use the slider or click the ruler to zoom.</p>
        </div>
        <div ref={stageRef}><Stage z={z} sel={sel?.id ?? null} onSelect={(id) => setQuery({ sel: id })} /></div>
        <Ruler z={z} onZ={setZ} />
        <p className="note" style={{ fontSize: 10.5 }}>Ruler: the whole range from {pow10(LOG_MIN)} m to {pow10(LOG_MAX)} m on a log scale; the box is the current window (three decades), coloured ticks are the reference objects and dots are the scale levels (green: a Voyager view serves it; grey: planned).</p>
      </div>

      <Panel id="scale-zoom" className="left-panel" title="Zoom">
        <label className="slider-row"><span>log₁₀ m</span>
          <input type="range" min={LOG_MIN} max={LOG_MAX} step={0.01} value={z} onChange={(e) => setZ(Number(e.target.value))} aria-label="Window width (log10 metres)" />
          <span style={{ minWidth: 44, textAlign: 'right' }}>{z.toFixed(2)}</span></label>
        <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
          <button className="chip" onClick={() => setZ(z - 1)} aria-label="Zoom in ten times">÷ 10</button>
          <button className="chip" onClick={() => setZ(z + 1)} aria-label="Zoom out ten times">× 10</button>
          {sel && <button className="chip" onClick={() => setZ(Math.log10(sel.m) + 0.12)}>Fit {sel.label}</button>}
        </div>
        <label className="slider-row"><span>Level</span>
          <select aria-label="Jump to a scale level" value={level.id} onChange={(e) => { const l = SCALE_LEVELS.find((x) => x.id === e.target.value)!; setZ(l.log10m + 1); }}>
            {SCALE_LEVELS.map((l) => <option key={l.id} value={l.id}>{l.label}{l.support === 'planned' ? ' (planned)' : ''}</option>)}
          </select></label>
        <p className="note">{level.example}{level.route && <> · <button className="link-btn" onClick={() => navigate(level.route!)}>open the {level.label.toLowerCase()} view →</button></>}</p>
        <h3 style={{ fontSize: 12, margin: '12px 0 6px', color: 'var(--text-dim)' }}>Near this window ({inView.length})</h3>
        <ul className="scale-list" aria-label="Reference objects near this window" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {inView.map((r) => (
            <li key={r.id}>
              <button className={`link-btn ${sel?.id === r.id ? 'active' : ''}`} onClick={() => setQuery({ sel: r.id })} style={{ display: 'flex', justifyContent: 'space-between', width: '100%', gap: 8, padding: '3px 0' }}>
                <span><span style={{ color: PROVENANCE_LABEL[r.provenance].color }}>●</span> {r.label}</span><span style={{ color: 'var(--text-faint)' }}>{formatLength(r.m)}</span>
              </button>
            </li>
          ))}
          {inView.length === 0 && <li className="note">No bundled reference object has a length within a few decades of this window.</li>}
        </ul>
        <h3 style={{ fontSize: 12, margin: '12px 0 6px', color: 'var(--text-dim)' }}>All references ({SCALE_REFS.length})</h3>
        <select aria-label="All reference objects" value={sel?.id ?? ''} onChange={(e) => { const r = SCALE_REFS.find((x) => x.id === e.target.value); if (r) setQuery({ sel: r.id, z: (Math.round((Math.log10(r.m) + 0.12) * 100) / 100).toString() }); }} style={{ width: '100%' }}>
          <option value="" disabled>Choose an object…</option>
          {SCALE_REFS.map((r) => <option key={r.id} value={r.id}>{formatLength(r.m)} · {r.label}</option>)}
        </select>
      </Panel>

      <Panel id="scale-object" className="right-panel" title={sel ? sel.label : 'Reference object'}>
        {sel ? (
          <>
            <dl className="kv" aria-label="Reference length">
              <dt>{sel.quantity}</dt><dd>{formatLength(sel.m, 5)}{interval(sel)}</dd>
              <dt>In metres</dt><dd>{sel.m.toExponential(4)} m</dd>
              <dt>Window that fits it</dt><dd>{pow10(Math.log10(sel.m) + 0.12)} m</dd>
            </dl>
            <p style={{ margin: '8px 0' }}><ProvenanceBadge cls={sel.provenance} /> <span className="note">{sel.note}</span></p>
            <p className="note">Source: <SourceLinks ids={sel.sources} /></p>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <button className="chip" onClick={() => setZ(Math.log10(sel.m) + 0.12)}>Zoom to fit</button>
              {sel.route && <button className="chip" onClick={() => navigate(sel.route!)}>Open its view →</button>}
            </div>
          </>
        ) : <p className="note">Select an object in the drawing or the list to see its value, interval, provenance and source.</p>}
        <p className="note" style={{ marginTop: 14, fontSize: 10.5 }}>Lengths are as published, converted with the IAU parsec and au and the CODATA ångström. Molecule sizes are the largest nucleus-to-nucleus distance in the bundled 3D structure, without the electron cloud. The horizon sizes assume non-rotating holes. Levels with no bundled reference object (nanostructures, microscopic, human scale, cosmic web) stay planned.</p>
      </Panel>
    </>
  );
}
