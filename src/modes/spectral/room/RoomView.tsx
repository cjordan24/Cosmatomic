/**
 * 3D communications room — #/spectral/room   (Phase 9, Gate 9.3)
 *
 * Query: f (Hz), PT (dBm), N (max reflections 0–3), tx, rx ("x,y,z" in m), dims ("L,W,H" in m),
 * s (surfaces "face:Material:thickness_cm|…"), z (map height = receiver height).
 * A half-wave dipole transmits inside a rectangular room whose six surfaces are ITU-R P.2040-4 materials. The received
 * power of a half-wave dipole is computed by the image method with TE/TM reflection coefficients
 * (src/core/physics/em/room.ts): over a plane (Web Worker) and, with every ray listed, at the receiver.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Line, OrbitControls } from '@react-three/drei';
import { navigate, setQuery, useRoute } from '@/shared/router';
import { Panel, ProvenanceBadge } from '@/ui/components';
import { SourceLinks } from '@/ui/SourcesView';
import { RelatedLinks } from '@/ui/RelatedLinks';
import { LinePlot } from '@/ui/plots';
import { Probe } from '@/ui/instruments';
import { Viewport } from '@/rendering/Viewport';
import { formatSig } from '@/core/units/units';
import {
  FACES, FACE_LABEL, cabs, delaySpread, interfaceR, materialAt, permittivity, receivedPower, roomContext, slabRT, traceRays,
  type Face, type Ray, type Room, type Surface,
} from '@/core/physics/em/room';
import type { RoomMapRequest } from '@/workers/room.worker';

const MATERIAL_CHOICES = ['Concrete', 'Brick', 'Plasterboard', 'Wood', 'Glass', 'Ceiling board', 'Chipboard', 'Plywood', 'Marble', 'Floorboard', 'Vinyl tile', 'Carpet tile', 'Metal', 'Vacuum (≈ air)'];
const DEFAULT_SURFACES: Record<Face, Surface> = {
  x0: { material: 'Concrete', thickness: 0.2 }, x1: { material: 'Glass', thickness: 0.006 },
  y0: { material: 'Plasterboard', thickness: 0.013 }, y1: { material: 'Plasterboard', thickness: 0.013 },
  z0: { material: 'Concrete', thickness: 0.2 }, z1: { material: 'Ceiling board', thickness: 0.02 },
};
const PRESET_F: [number, string][] = [[2.45e9, '2.45 GHz (ISM)'], [5.8e9, '5.8 GHz (ISM)'], [24.125e9, '24.125 GHz (ISM)'], [61.25e9, '61.25 GHz (ISM)']];
const MAT_COLOR: Record<string, string> = { Concrete: '#9aa0a6', Brick: '#c8664a', Plasterboard: '#e6e0d0', Wood: '#b07a45', Glass: '#7fd3ff', 'Ceiling board': '#f2efe6', Chipboard: '#c9a46b', Plywood: '#d8b27a', Marble: '#f0f0f5', Floorboard: '#a5703c', 'Vinyl tile': '#8fbf9f', 'Carpet tile': '#8c6fb0', Metal: '#d0d6e0', 'Vacuum (≈ air)': '#000000' };
const ORDER_COLOR = ['#ffffff', '#f5c76b', '#7df9ff', '#ff7ad9'];
const SHORT_FACE: Record<Face, string> = { x0: 'W wall', x1: 'E wall', y0: 'S wall', y1: 'N wall', z0: 'floor', z1: 'ceiling' };
const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
const num = (q: URLSearchParams, k: string, d: number, a: number, b: number) => { const v = Number(q.get(k)); return q.has(k) && Number.isFinite(v) ? clamp(v, a, b) : d; };
const vec = (q: URLSearchParams, k: string, d: [number, number, number]): [number, number, number] => { const p = (q.get(k) ?? '').split(',').map(Number); return p.length === 3 && p.every(Number.isFinite) ? [p[0], p[1], p[2]] : d; };
const fmtV = (v: number[]) => v.map((x) => Number(x.toFixed(2))).join(',');

function parseSurfaces(s: string | null): Record<Face, Surface> {
  const out = { ...DEFAULT_SURFACES };
  for (const part of (s ?? '').split('|')) {
    const [face, mat, cm] = part.split(':');
    if ((FACES as string[]).includes(face) && MATERIAL_CHOICES.includes(mat)) out[face as Face] = { material: mat, thickness: clamp(Number(cm) / 100 || 0, 0, 1) };
  }
  return out;
}
const serializeSurfaces = (s: Record<Face, Surface>) => FACES.map((f) => `${f}:${s[f].material}:${Number((s[f].thickness * 100).toFixed(2))}`).join('|');

// ------------------------------------------------------------------ worker-backed coverage map
let worker: Worker | null = null;
let seq = 0;
function useCoverage(room: Room, f: number, PT: number, tx: [number, number, number], z: number, order: number) {
  const [res, setRes] = useState<{ coherent: Float32Array; direct: Float32Array; nx: number; ny: number; rowsDone: number } | null>(null);
  const key = JSON.stringify([room, f, PT, tx, z, order]);
  useEffect(() => {
    worker ??= new Worker(new URL('../../../workers/room.worker.ts', import.meta.url), { type: 'module' });
    const id = ++seq;
    const nx = order >= 3 ? 72 : 120, ny = Math.max(8, Math.round((nx * room.W) / room.L));
    const onMsg = (ev: MessageEvent) => { if (ev.data.id === id) setRes(ev.data); };
    worker.addEventListener('message', onMsg);
    worker.postMessage({ id, room, f, PT, tx, z, nx, ny, order } satisfies RoomMapRequest);
    return () => worker?.removeEventListener('message', onMsg);
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps
  return res;
}

type RGB = [number, number, number];
/** Perceptual-ish ramp from dark blue (weak) through teal and yellow to white (strong). */
function ramp(u: number): RGB {
  const stops: [number, RGB][] = [[0, [10, 14, 40]], [0.35, [30, 90, 160]], [0.6, [40, 190, 170]], [0.82, [245, 199, 107]], [1, [255, 255, 240]]];
  for (let i = 1; i < stops.length; i++) if (u <= stops[i][0]) { const [a, ca] = stops[i - 1], [b, cb] = stops[i]; const t = (u - a) / (b - a); return [ca[0] + (cb[0] - ca[0]) * t, ca[1] + (cb[1] - ca[1]) * t, ca[2] + (cb[2] - ca[2]) * t]; }
  return stops[stops.length - 1][1];
}
function mapImage(values: Float32Array, nx: number, ny: number, lo: number, hi: number): ImageData {
  const img = new ImageData(nx, ny);
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    const v = values[j * nx + i];
    const [r, g, b] = Number.isFinite(v) && v !== 0 ? ramp(clamp((v - lo) / (hi - lo), 0, 1)) : [0, 0, 0];
    const o = 4 * ((ny - 1 - j) * nx + i);   // row 0 of the image = largest y (north at the top)
    img.data[o] = r; img.data[o + 1] = g; img.data[o + 2] = b; img.data[o + 3] = 255;
  }
  return img;
}

function TopMap({ cov, room, tx, rx, show, range, onPick }: { cov: NonNullable<ReturnType<typeof useCoverage>>; room: Room; tx: number[]; rx: number[]; show: 'coherent' | 'direct'; range: [number, number]; onPick: (x: number, y: number) => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const S = 460, H = Math.round((S * room.W) / room.L);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const g = cv.getContext('2d')!;
    const off = document.createElement('canvas'); off.width = cov.nx; off.height = cov.ny;
    off.getContext('2d')!.putImageData(mapImage(show === 'coherent' ? cov.coherent : cov.direct, cov.nx, cov.ny, range[0], range[1]), 0, 0);
    g.imageSmoothingEnabled = false; g.clearRect(0, 0, S, H); g.drawImage(off, 0, 0, S, H);
    const px = (x: number) => (x / room.L) * S, py = (y: number) => H - (y / room.W) * H;
    g.fillStyle = '#ff5a5a'; g.beginPath(); g.arc(px(tx[0]), py(tx[1]), 6, 0, 2 * Math.PI); g.fill();
    g.strokeStyle = '#5cf2a6'; g.lineWidth = 2.5; g.beginPath(); g.arc(px(rx[0]), py(rx[1]), 7, 0, 2 * Math.PI); g.stroke();
    g.strokeStyle = 'rgba(255,255,255,0.5)'; g.setLineDash([4, 4]); g.beginPath(); g.moveTo(0, py(rx[1])); g.lineTo(S, py(rx[1])); g.stroke(); g.setLineDash([]);
  }, [cov, room, tx, rx, show, range, H]);
  return <canvas ref={ref} width={S} height={H} aria-label="Received power map (top view)" className="wave-canvas" style={{ maxWidth: S, cursor: 'crosshair' }}
    onClick={(e) => { const r = (e.target as HTMLCanvasElement).getBoundingClientRect(); onPick(((e.clientX - r.left) / r.width) * room.L, (1 - (e.clientY - r.top) / r.height) * room.W); }} />;
}

// ------------------------------------------------------------------ 3D scene
function RoomScene({ room, tx, rx, rays, cov, range }: { room: Room; tx: number[]; rx: number[]; rays: Ray[]; cov: ReturnType<typeof useCoverage>; range: [number, number] }) {
  // three.js: x → x, y (up) → room z, z → −room y
  const P = (p: number[]) => new THREE.Vector3(p[0] - room.L / 2, p[2], -(p[1] - room.W / 2));
  const tex = useMemo(() => {
    if (!cov) return null;
    const img = mapImage(cov.coherent, cov.nx, cov.ny, range[0], range[1]);
    const t = new THREE.DataTexture(new Uint8Array(img.data.buffer), cov.nx, cov.ny, THREE.RGBAFormat);
    t.flipY = true; t.needsUpdate = true; t.magFilter = THREE.NearestFilter; t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, [cov, range]);
  const faces: [Face, THREE.Vector3, [number, number, number], [number, number]][] = [
    ['x0', new THREE.Vector3(-room.L / 2, room.H / 2, 0), [0, Math.PI / 2, 0], [room.W, room.H]],
    ['x1', new THREE.Vector3(room.L / 2, room.H / 2, 0), [0, -Math.PI / 2, 0], [room.W, room.H]],
    ['y0', new THREE.Vector3(0, room.H / 2, room.W / 2), [0, Math.PI, 0], [room.L, room.H]],
    ['y1', new THREE.Vector3(0, room.H / 2, -room.W / 2), [0, 0, 0], [room.L, room.H]],
    ['z0', new THREE.Vector3(0, 0, 0), [-Math.PI / 2, 0, 0], [room.L, room.W]],
    ['z1', new THREE.Vector3(0, room.H, 0), [Math.PI / 2, 0, 0], [room.L, room.W]],
  ];
  return (
    <>
      <ambientLight intensity={0.8} />
      {faces.map(([f, pos, rot, size]) => room.surfaces[f].material !== 'Vacuum (≈ air)' && (
        <mesh key={f} position={pos} rotation={rot}><planeGeometry args={size} /><meshBasicMaterial color={MAT_COLOR[room.surfaces[f].material] ?? '#888'} transparent opacity={f === 'z0' ? 0.25 : 0.1} side={THREE.DoubleSide} depthWrite={false} /></mesh>
      ))}
      <lineSegments position={[0, room.H / 2, 0]}><edgesGeometry args={[new THREE.BoxGeometry(room.L, room.H, room.W)]} /><lineBasicMaterial color="#8899aa" /></lineSegments>
      {tex && <mesh position={[0, rx[2], 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[room.L, room.W]} /><meshBasicMaterial map={tex} transparent opacity={0.85} side={THREE.DoubleSide} /></mesh>}
      {rays.slice(0, 16).map((r, i) => <Line key={i} points={r.points.map(P)} color={ORDER_COLOR[Math.min(3, r.order)]} lineWidth={r.order === 0 ? 2.2 : 1.3} transparent opacity={0.9} />)}
      <mesh position={P(tx)}><cylinderGeometry args={[0.025, 0.025, 0.4, 8]} /><meshBasicMaterial color="#ff5a5a" /></mesh>
      <mesh position={P(rx)}><cylinderGeometry args={[0.025, 0.025, 0.4, 8]} /><meshBasicMaterial color="#5cf2a6" /></mesh>
      <OrbitControls enablePan={false} target={[0, room.H / 2, 0]} />
    </>
  );
}

// ------------------------------------------------------------------ view
export default function RoomView() {
  const { query } = useRoute();
  const f = num(query, 'f', 2.45e9, 0.9e9, 100e9), PTdbm = num(query, 'PT', 20, -30, 40), N = Math.round(num(query, 'N', 2, 0, 3));
  const [L, W, H] = vec(query, 'dims', [6, 5, 3]).map((v, i) => clamp(v, 1, i === 2 ? 6 : 20));
  const surfaces = parseSurfaces(query.get('s'));
  const room: Room = useMemo(() => ({ L, W, H, surfaces }), [L, W, H, query.get('s')]); // eslint-disable-line react-hooks/exhaustive-deps
  const tx = vec(query, 'tx', [1.2, 1.5, 2.2]).map((v, i) => clamp(v, 0.05, [L, W, H][i] - 0.05)) as [number, number, number];
  const rx = vec(query, 'rx', [4.5, 3.2, 1.2]).map((v, i) => clamp(v, 0.05, [L, W, H][i] - 0.05)) as [number, number, number];
  const [show, setShow] = useState<'coherent' | 'direct'>('coherent');
  const PT = 1e-3 * 10 ** (PTdbm / 10), lam = 299_792_458 / f, fGHz = f / 1e9;
  const cov = useCoverage(room, f, PT, tx, rx[2], N);
  const ctx = useMemo(() => roomContext(room, f, PT), [room, f, PT]);
  const rays = useMemo(() => traceRays(ctx, tx, rx, N), [ctx, tx.join(), rx.join(), N]); // eslint-disable-line react-hooks/exhaustive-deps
  const pw = receivedPower(ctx, rays);
  const ds = delaySpread(rays);
  const dbm = (w: number) => 10 * Math.log10(w / 1e-3);
  const range: [number, number] = useMemo(() => {
    if (!cov || cov.rowsDone < cov.ny) return [dbm(pw.direct) - 30, dbm(pw.direct) + 15];
    const v = Array.from(cov.coherent).filter(Number.isFinite).sort((a, b) => a - b);
    return [v[Math.floor(v.length * 0.02)], v[Math.floor(v.length * 0.995)]];
  }, [cov]); // eslint-disable-line react-hooks/exhaustive-deps
  const cut = useMemo(() => {
    const n = 140, coh: [number, number][] = [], dir: [number, number][] = [];
    for (let i = 0; i < n; i++) { const x = ((i + 0.5) / n) * L; const p = receivedPower(ctx, traceRays(ctx, tx, [x, rx[1], rx[2]], N)); coh.push([x, dbm(p.coherent)]); dir.push([x, dbm(p.direct)]); }
    return { coh, dir };
  }, [ctx, tx.join(), rx[1], rx[2], N, L]); // eslint-disable-line react-hooks/exhaustive-deps
  const setSurface = (face: Face, patch: Partial<Surface>) => setQuery({ s: serializeSurfaces({ ...surfaces, [face]: { ...surfaces[face], ...patch } }) });
  const PosSliders = ({ k, p, label }: { k: 'tx' | 'rx'; p: number[]; label: string }) => (
    <>{(['x', 'y', 'z'] as const).map((ax, i) => (
      <label key={ax} className="slider-row"><span style={{ minWidth: 70 }}>{label} {ax}</span><input type="range" min={0.05} max={[L, W, H][i] - 0.05} step={0.01} value={p[i]} aria-label={`${label} ${ax}`}
        onChange={(e) => { const v = [...p]; v[i] = Number(e.target.value); setQuery({ [k]: fmtV(v) }); }} /><span>{p[i].toFixed(2)} m</span></label>
    ))}</>
  );
  const outOfRange = FACES.filter((fc) => surfaces[fc].material !== 'Vacuum (≈ air)' && !materialAt(surfaces[fc].material, fGHz)?.inRange);
  return (
    <>
      <Panel id="room-controls" className="left-panel" title="Room">
        <div className="chip-row" style={{ gap: 4, marginBottom: 4 }}>{PRESET_F.map(([v, l]) => <button key={v} className={`chip ${Math.abs(f - v) < 1 ? 'active' : ''}`} style={{ fontSize: 10.5 }} onClick={() => setQuery({ f: v })}>{l}</button>)}</div>
        <label className="slider-row"><span style={{ minWidth: 70 }}>frequency</span><input type="range" min={Math.log10(0.9e9)} max={11} step={0.001} value={Math.log10(f)} aria-label="Frequency" onChange={(e) => setQuery({ f: Number((10 ** Number(e.target.value)).toPrecision(4)) })} /><span>{formatSig(fGHz, 4)} GHz</span></label>
        <label className="slider-row"><span style={{ minWidth: 70 }}>power</span><input type="range" min={-30} max={40} step={0.5} value={PTdbm} aria-label="Transmit power in dBm" onChange={(e) => setQuery({ PT: e.target.value })} /><span>{PTdbm} dBm</span></label>
        <label className="slider-row"><span style={{ minWidth: 70 }}>reflections</span><input type="range" min={0} max={3} step={1} value={N} aria-label="Maximum number of reflections" onChange={(e) => setQuery({ N: e.target.value })} /><span>≤ {N}</span></label>
        <div className="section-title">Transmitter (red) · receiver (green)</div>
        <PosSliders k="tx" p={tx} label="TX" /><PosSliders k="rx" p={rx} label="RX" />
        <div className="section-title">Surfaces (ITU-R P.2040-4)</div>
        <table className="table-mini" aria-label="Surfaces">
          <tbody>{FACES.map((fc) => (
            <tr key={fc}><td style={{ fontSize: 10.5 }}>{FACE_LABEL[fc]}</td>
              <td><select className="text-input" aria-label={`Material of the ${FACE_LABEL[fc]}`} value={surfaces[fc].material} onChange={(e) => setSurface(fc, { material: e.target.value })} style={{ height: 24, fontSize: 11, width: 108 }}>{MATERIAL_CHOICES.map((m) => <option key={m}>{m}</option>)}</select></td>
              <td><input className="text-input" aria-label={`Thickness of the ${FACE_LABEL[fc]} in cm`} type="number" min={0} max={100} step={0.1} value={Number((surfaces[fc].thickness * 100).toFixed(2))} onChange={(e) => setSurface(fc, { thickness: clamp(Number(e.target.value) / 100, 0, 1) })} style={{ height: 24, fontSize: 11, width: 52 }} /> cm</td></tr>
          ))}</tbody>
        </table>
        <p className="note" style={{ fontSize: 10.5 }}>Thickness 0 treats a surface as a thick half-space (one interface); otherwise it is a single slab in air. Thicknesses and the layout are your inputs (hypothetical). Room {L} × {W} × {H} m.</p>
        {outOfRange.length > 0 && <p className="note" role="status" style={{ color: 'var(--warn)', fontSize: 11 }}>Outside the frequency range of the P.2040 fit at {formatSig(fGHz, 4)} GHz: {outOfRange.map((fc) => `${surfaces[fc].material} (${FACE_LABEL[fc]})`).join(', ')}. The nearest row is used.</p>}
      </Panel>
      <div className="center-stage">
        <div className="stage-head"><h1>A radio link in a room <ProvenanceBadge cls="simulated" title="Image-method ray model with ITU-R P.2040 materials; geometry and powers are user inputs" /></h1>
          <p className="note">Two vertical half-wave dipoles in an empty room. Every specular path with up to {N} reflection{N === 1 ? '' : 's'} is traced by the image method; at each wall the field is split into TE and TM parts and multiplied by the wall's reflection coefficient (ITU-R P.2040-4), then all paths add with their phases. Where they arrive in step the signal is strong; where they cancel it fades within a fraction of a wavelength (λ = {formatSig(lam * 100, 3)} cm). <SourceLinks ids={['itu-r-p2040-4', 'ellingson-2020-vol2']} /></p>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div>
            <div className="chip-row" role="radiogroup" aria-label="Map" style={{ marginBottom: 4 }}>
              <button role="radio" aria-checked={show === 'coherent'} className={`chip ${show === 'coherent' ? 'active' : ''}`} onClick={() => setShow('coherent')}>All paths</button>
              <button role="radio" aria-checked={show === 'direct'} className={`chip ${show === 'direct' ? 'active' : ''}`} onClick={() => setShow('direct')}>Direct path only</button>
              <span className="note" style={{ fontSize: 10.5 }}>{cov ? (cov.rowsDone < cov.ny ? `computing ${Math.round((100 * cov.rowsDone) / cov.ny)} %…` : `${cov.nx} × ${cov.ny} points at z = ${rx[2].toFixed(2)} m`) : 'computing…'}</span>
            </div>
            {cov ? <TopMap cov={cov} room={room} tx={tx} rx={rx} show={show} range={range} onPick={(x, y) => setQuery({ rx: fmtV([x, y, rx[2]]) })} /> : <div className="wave-canvas" style={{ width: 460, height: 380 }} />}
            <div className="note" style={{ fontSize: 10.5, display: 'flex', alignItems: 'center', gap: 6 }}>{formatSig(range[0], 3)} dBm<span style={{ display: 'inline-block', width: 160, height: 8, background: `linear-gradient(90deg, ${[0, 0.35, 0.6, 0.82, 1].map((u) => `rgb(${ramp(u).map(Math.round).join(',')})`).join(',')})` }} />{formatSig(range[1], 3)} dBm · top view, north up · click to move the receiver</div>
          </div>
          <div style={{ position: 'relative', flex: 1, minWidth: 280, height: 380, borderRadius: 12, overflow: 'hidden', border: '1px solid var(--line)' }} role="img" aria-label="3D room with rays">
            <Viewport camera={{ position: [L * 0.9, H * 1.9, W * 1.3], fov: 50 }}><RoomScene room={room} tx={tx} rx={rx} rays={rays} cov={cov} range={range} /></Viewport>
            <div className="note" style={{ position: 'absolute', left: 8, bottom: 6, fontSize: 10.5 }}>strongest 16 rays: {ORDER_COLOR.slice(0, N + 1).map((c, i) => <span key={i} style={{ color: c }}>■ {i} refl. </span>)}</div>
          </div>
        </div>
        <LinePlot ariaLabel="Received power along a line through the receiver" width={720} height={210} xLabel={`x along y = ${rx[1].toFixed(2)} m, z = ${rx[2].toFixed(2)} m (m)`} yLabel="received power (dBm)" legend="br"
          series={[{ points: cut.coh, color: '#7df9ff', label: `all paths (≤ ${N} reflections)` }, { points: cut.dir, color: '#f5c76b', dashed: true, label: 'direct path only (free space)' }]}
          vLines={[{ x: rx[0], label: 'RX', color: '#5cf2a6' }, { x: tx[0], label: 'TX x', color: '#ff5a5a' }]} />
        <p className="note" style={{ fontSize: 10.5 }}>Along this line the coherent sum swings above and below the direct-path value (for scale, λ/2 = {formatSig(lam * 50, 3)} cm).</p>
      </div>
      <Panel id="room-readout" className="right-panel" title="Receiver">
        <Probe title="Received power" ariaLabel="Received power at the receiver" provenance="simulated"
          where={[{ label: 'receiver at', value: `${rx.map((v) => v.toFixed(2)).join(', ')} m` }, { label: 'paths traced', value: rays.length }]}
          rows={[
            { label: 'all paths (coherent)', value: dbm(pw.coherent), unit: 'dBm', sig: 4 },
            { label: 'direct path only', value: dbm(pw.direct), unit: 'dBm', sig: 4 },
            { label: 'power sum of the paths', value: dbm(pw.incoherent), unit: 'dBm', sig: 4, title: 'Sum of the path powers, ignoring phase' },
            { label: 'fading vs free space', value: dbm(pw.coherent) - dbm(pw.direct), unit: 'dB', sig: 3 },
            { label: 'mean delay', value: ds.mean * 1e9, unit: 'ns', sig: 4 },
            { label: 'RMS delay spread', value: ds.rms * 1e9, unit: 'ns', sig: 3 },
          ]}
          note={<>Received by a matched, lossless half-wave dipole: P = |Σ E·l_e|²/8R_rad (Ellingson eqs. 10.113–10.114). <SourceLinks ids={['ellingson-2020-vol2']} /></>} />
        <div className="section-title">Strongest paths</div>
        <table className="table-mini" aria-label="Paths">
          <thead><tr><th>refl.</th><th>via</th><th>delay</th><th>power</th></tr></thead>
          <tbody>{rays.slice(0, 10).map((r, i) => <tr key={i}><td>{r.order}</td><td style={{ fontSize: 10, fontFamily: 'var(--font)' }}>{r.bounces.length ? r.bounces.map((b) => SHORT_FACE[b.face]).join(' → ') : 'direct'}</td><td>{formatSig(r.delayS * 1e9, 3)} ns</td><td>{formatSig(dbm(r.powerW), 3)} dBm</td></tr>)}</tbody>
        </table>
        {(() => {
          const shown = rays.filter((r) => r.powerW > 0).slice(0, 40), floor = Math.min(...shown.map((r) => dbm(r.powerW))) - 5;
          return <LinePlot ariaLabel="Power delay profile" width={380} height={170} xLabel="delay (ns)" yLabel="path power (dBm)" yDomain={[floor, Math.max(...shown.map((r) => dbm(r.powerW))) + 3]}
            series={shown.map((r) => ({ points: [[r.delayS * 1e9, floor], [r.delayS * 1e9, dbm(r.powerW)]] as [number, number][], color: ORDER_COLOR[Math.min(3, r.order)], width: 2 }))} />;
        })()}
        <div className="section-title">Surfaces at {formatSig(fGHz, 4)} GHz</div>
        <table className="table-mini" aria-label="Surface properties">
          <thead><tr><th>surface</th><th>ε′</th><th>σ (S/m)</th><th>|R| at 0°</th><th>|R| at 60° TE/TM</th></tr></thead>
          <tbody>{FACES.map((fc) => {
            const mm = materialAt(surfaces[fc].material, fGHz); if (!mm) return null;
            const p = permittivity(mm.m, fGHz), t = surfaces[fc].thickness;
            const R = (th: number, pol: 'TE' | 'TM') => cabs(t > 0 ? slabRT(p.epsRc, t, lam, th, pol).R : interfaceR(p.epsRc, th, pol));
            return <tr key={fc}><td style={{ fontSize: 10, fontFamily: 'var(--font)' }}>{surfaces[fc].material}{mm.inRange ? '' : ' ⚠'}</td><td>{formatSig(p.epsReal, 3)}</td><td>{formatSig(p.sigma, 2)}</td><td>{formatSig(R(0, 'TE'), 2)}</td><td>{formatSig(R(Math.PI / 3, 'TE'), 2)}/{formatSig(R(Math.PI / 3, 'TM'), 2)}</td></tr>;
          })}</tbody>
        </table>
        <p className="note" style={{ fontSize: 10.5 }}>ε′ = a f^b, σ = c f^d (P.2040-4 Table 3, f in GHz); ⚠ = outside the fitted range. <SourceLinks ids={['itu-r-p2040-4']} /></p>
        <div className="section-title">Validity</div>
        <ul className="note" style={{ paddingLeft: 16, fontSize: 10.5 }}><li>Geometric optics: specular reflection only; no diffraction, scattering, furniture or people</li><li>Plane-wave reflection coefficients applied to spherical waves; smooth, homogeneous walls</li><li>Far field of both dipoles; paths beyond {N} reflections are dropped</li></ul>
        <button className="link-btn" onClick={() => navigate('/spectral/rf?sel=ism-2450')}>2.45 GHz in the RF atlas →</button>
        <RelatedLinks id="instrument:comms-room" />
      </Panel>
    </>
  );
}
