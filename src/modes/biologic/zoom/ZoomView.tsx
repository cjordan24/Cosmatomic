/**
 * From the body to a molecule — #/biologic/zoom?z=<log10 of the view width in metres>   (Phase 12, Gate 12.7)
 *
 * One continuous zoom along a path inside the body: the BodyParts3D body (1.71 m tall) → a kidney (SEER, 12 × 6 cm)
 * → a cell (Inside the Cell's 30 µm example cell) → its nucleus (5 µm) and a mitochondrion (1–2 µm long) → a
 * ribosome (20–30 nm) → the DNA double helix (about 2 nm wide, NIGMS) → a water molecule (its conformer, derived).
 * Every object is drawn at its quoted size in one linear scale for the current view (sizes to scale); positions and
 * shapes are schematic: the main chain (body, kidney, cell, nucleus, DNA, water) is nested at the centre; the
 * mitochondrion and ribosome sit in the cytoplasm beside the nucleus, and choosing one moves the view there (c=). The log-scaled view radius is the universe map's technique (Gate 10.8).
 */
import { useEffect, useRef, useState } from 'react';
import { navigate, setQuery, useRoute } from '@/shared/router';
import { Panel, ProvenanceBadge } from '@/ui/components';
import { SourceLinks } from '@/ui/SourcesView';
import { RelatedLinks } from '@/ui/RelatedLinks';
import { useVoyager } from '@/shared/store';
import { formatLen, lifeSize, reportSpan } from '@/modes/biologic/atlas/lifeSizes';
import { ORGANS } from '@/modes/biologic/body/BodyView';

interface Stop { id: string; label: string; w: number; h: number; size: number; pos: [number, number]; shape: 'rect' | 'ellipse'; color: string; quote: string; source: string; to: string }
const skel = ORGANS.find((o) => o.id === 'skeleton')!.model.extentMm, mito = reportSpan(lifeSize('mitochondrion')!.reports[0]), ribo = reportSpan(lifeSize('ribosome')!.reports[0]);
const water = lifeSize('mol-pubchem-962')!.reports[0].m as number;
/** The path, largest first; w × h in metres. */
export const STOPS: Stop[] = [
  { id: 'body', size: skel[2] / 1000, pos: [0, 0], label: 'Human body (BodyParts3D model)', w: skel[0] / 1000, h: skel[2] / 1000, shape: 'rect', color: '#e8e2d0', quote: `the skeleton of the BodyParts3D model is ${(skel[2] / 1000).toFixed(2)} m tall`, source: 'bodyparts3d', to: '/biologic/body' },
  { id: 'kidney', size: 0.12, pos: [0, 0], label: 'Kidney', w: 0.06, h: 0.12, shape: 'ellipse', color: '#b18cff', quote: 'In the adult, each kidney is approximately 3 cm thick, 6 cm wide, and 12 cm long.', source: 'seer-training', to: '/biologic/body?sel=right-kidney&iso=1' },
  { id: 'cell', size: 30e-6, pos: [0, 0], label: 'A cell (30 µm example)', w: 30e-6, h: 30e-6, shape: 'ellipse', color: '#c9b4ff', quote: 'Cell diameter 30 micrometers', source: 'nigms-inside-the-cell', to: '/biologic/cells' },
  { id: 'nucleus', size: 5e-6, pos: [0, 0], label: 'Nucleus', w: 5e-6, h: 5e-6, shape: 'ellipse', color: '#b18cff', quote: 'Nucleus diameter 5 micrometers', source: 'nigms-inside-the-cell', to: '/biologic/cells?part=nucleus' },
  { id: 'mitochondrion', size: Math.sqrt(mito[0] * mito[1]), pos: [8e-6, 6e-6], label: 'Mitochondrion', w: Math.sqrt(mito[0] * mito[1]), h: Math.sqrt(mito[0] * mito[1]) / 3, shape: 'ellipse', color: '#ff7a90', quote: 'Mitochondrion length Typically 1–2 micrometers but can be up to 7 micrometers long', source: 'nigms-inside-the-cell', to: '/biologic/cells?part=mitochondrion' },
  { id: 'ribosome', size: Math.sqrt(ribo[0] * ribo[1]), pos: [-7e-6, 7e-6], label: 'Ribosome', w: Math.sqrt(ribo[0] * ribo[1]), h: Math.sqrt(ribo[0] * ribo[1]), shape: 'ellipse', color: '#b6f7d6', quote: 'Ribosome diameter 20–30 nanometers', source: 'nigms-inside-the-cell', to: '/biologic/molecules?tab=code' },
  { id: 'dna', size: 2e-9, pos: [0, 0], label: 'DNA double helix (width)', w: 2e-9, h: 20e-9, shape: 'rect', color: '#5cf2a6', quote: 'DNA is about 2 nanometers wide', source: 'nigms-biobeat-nanoparticles-2023', to: '/biologic/proteins?id=1BNA' },
  { id: 'water', size: water, pos: [0, 0], label: 'Water molecule', w: water, h: water, shape: 'ellipse', color: '#7df9ff', quote: 'largest nucleus-to-nucleus distance in its PubChem3D conformer (derived)', source: 'pubchem', to: '/atomic/molecules/pubchem-962' },
];
export const Z_MAX = Math.log10(2.4), Z_MIN = Math.log10(4e-10);
const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));

export default function ZoomView() {
  const { query } = useRoute();
  const z = clamp(Number(query.get('z') ?? Z_MAX) || Z_MAX, Z_MIN, Z_MAX);
  const centre = STOPS.find((s) => s.id === query.get('c'))?.pos ?? [0, 0];
  const reduced = useVoyager((s) => s.settings.reducedMotion);
  const [playing, setPlaying] = useState(false);
  const zRef = useRef(z); zRef.current = z;
  useEffect(() => {
    if (!playing || reduced) return;
    let raf = 0, last = performance.now();
    const loop = (now: number) => {
      const next = zRef.current - ((now - last) / 1000) * 0.8; last = now;   // 0.8 decades per second
      if (next <= Z_MIN) { setQuery({ z: Z_MIN.toFixed(2) }); setPlaying(false); return; }
      setQuery({ z: next.toFixed(3) }); raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [playing, reduced]);
  const W = 10 ** z, VB = 640, H = 480, px = (m: number) => (m / W) * VB * 0.8;
  const X = (m: number) => px(m - centre[0]), Y = (m: number) => -px(m - centre[1]);
  const visible = STOPS.filter((s) => px(Math.max(s.w, s.h)) > 2 && px(Math.min(s.w, s.h)) < VB * 6 && Math.abs(X(s.pos[0])) < VB && Math.abs(Y(s.pos[1])) < H);
  const onChain = (s: Stop) => (centre[0] === 0 && centre[1] === 0 ? s.pos[0] === 0 && s.pos[1] === 0 : s.pos === centre);
  const focus = [...STOPS].reverse().find((s) => onChain(s) && px(s.size) > VB * 0.15) ?? STOPS.find((s) => s.pos === centre) ?? STOPS[STOPS.length - 1];
  const bar = 10 ** Math.floor(Math.log10(W / 4));
  return (
    <>
      <Panel id="zoom-controls" className="left-panel" title="Zoom">
        <label className="slider-row"><span style={{ minWidth: 70 }}>view width</span><input type="range" min={Z_MIN} max={Z_MAX} step={0.01} value={z} aria-label="Zoom (log view width)" onChange={(e) => { setPlaying(false); setQuery({ z: e.target.value }); }} /><span>{formatLen(W)}</span></label>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', margin: '6px 0' }}>
          <button className="chip" aria-pressed={playing} disabled={reduced} onClick={() => { setQuery({ c: null, ...(z <= Z_MIN + 0.01 ? { z: Z_MAX.toFixed(2) } : {}) }); setPlaying((p) => !p); }}>{playing ? '❚❚ Pause' : '▶ Zoom in'}</button>
          <button className="chip" onClick={() => { setPlaying(false); setQuery({ z: null, c: null }); }}>Reset</button>
        </div>
        <ol className="life-list" aria-label="Zoom path">
          {STOPS.map((s) => <li key={s.id}><button className={`link-btn ${s.id === focus.id ? 'active' : ''}`} onClick={() => { setPlaying(false); setQuery({ z: Math.log10(Math.max(s.w, s.h) / 0.6).toFixed(2), c: s.pos[0] || s.pos[1] ? s.id : null }); }}>{s.label}</button> <span className="note">{formatLen(s.size)}</span></li>)}
        </ol>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head">
          <h1>From the body to a molecule <ProvenanceBadge cls="illustrative" title="Sizes to scale from their sources; positions and shapes schematic" /></h1>
          <p className="note">Nine powers of ten in one zoom. Each object is drawn at its quoted size against the same ruler; the main chain is nested at the centre only for the drawing — a kidney is not in the middle of the body. The mitochondrion and ribosome sit beside the nucleus, in the cell's cytoplasm.</p>
        </div>
        <svg viewBox={`${-VB / 2} ${-H / 2} ${VB} ${H}`} role="img" aria-label="Nested sizes from the body to a molecule" style={{ width: '100%', maxWidth: VB, background: 'rgba(0,0,0,0.25)', borderRadius: 12 }}>
          {visible.map((s) => {
            const w = px(s.w), h = px(s.h), op = Math.min(1, px(Math.max(s.w, s.h)) / 30);
            return (
              <g key={s.id} opacity={op} data-stop={s.id}>
                {s.shape === 'rect' ? <rect x={X(s.pos[0]) - w / 2} y={Y(s.pos[1]) - h / 2} width={w} height={h} rx={Math.min(w, h) * 0.2} fill="none" stroke={s.color} strokeWidth={1.6} /> : <ellipse cx={X(s.pos[0])} cy={Y(s.pos[1])} rx={w / 2} ry={h / 2} fill="none" stroke={s.color} strokeWidth={1.6} />}
                {w < VB * 1.6 && <text x={Math.min(X(s.pos[0]) + w / 2 + 6, VB / 2 - 150)} y={Math.max(Y(s.pos[1]) - h / 2, -H / 2 + 14) + 12} fontSize={12} fill={s.color}>{s.label}</text>}
              </g>
            );
          })}
          <line x1={-VB / 2 + 20} x2={-VB / 2 + 20 + px(bar)} y1={H / 2 - 20} y2={H / 2 - 20} stroke="var(--text)" strokeWidth={2} />
          <text x={-VB / 2 + 20} y={H / 2 - 28} fontSize={11} fill="var(--text)">{formatLen(bar)}</text>
        </svg>
      </div>
      <Panel id="zoom-detail" className="right-panel" title={focus.label}>
        <p style={{ margin: '0 0 6px' }}><strong>{formatLen(focus.size)}</strong></p>
        <blockquote className="quote">“{focus.quote}” <SourceLinks ids={[focus.source]} /></blockquote>
        <button className="chip" onClick={() => navigate(focus.to)}>Open it →</button>
        <button className="chip" onClick={() => navigate(`/scale?z=${z.toFixed(1)}`)}>Same width in the scale navigator →</button>
        <RelatedLinks id="instrument:zoom" limit={3} />
      </Panel>
    </>
  );
}
