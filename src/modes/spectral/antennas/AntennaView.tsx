/**
 * EM fields & antennas — #/spectral/antennas?tab=field|pattern|array|link   (Phase 9, Gate 9.1)
 *
 *  field    the exact field of a Hertzian dipole (FIELDS layer `hertzian-dipole`): f (Hz), m = IΔl (A·m), w = half-width (λ),
 *           px, py = probe point (λ)
 *  pattern  far-field patterns of the electrically short dipole (ant=esd, L = length/λ) and the half-wave dipole (ant=hwd)
 *  array    N identical elements along x: el=iso|esd|hwd, N, d (λ), a = progressive phase (degrees)
 *  link     Friis transmission: f (Hz), R (m), PT (dBm), GT, GR (dBi)
 * Physics: src/core/physics/em/antennas.ts (Ellingson, Electromagnetics Vol. 2, 2020).
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from '@react-three/drei';
import { setQuery, useRoute } from '@/shared/router';
import { KV, Panel, ProvenanceBadge } from '@/ui/components';
import { SourceLinks } from '@/ui/SourcesView';
import { RelatedLinks } from '@/ui/RelatedLinks';
import { LinePlot, PolarPlot } from '@/ui/plots';
import { Probe } from '@/ui/instruments';
import { Viewport } from '@/rendering/Viewport';
import { formatSig } from '@/core/units/units';
import { DIPOLE_LAYER, normalise, sampleGrid, type DipoleCtx } from '@/core/fields/fields';
import {
  ETA0, HWD, TEXTBOOK, arrayMainLobes, arrayPattern, cabs, dB, dbmToW, dipolePattern, effectiveAperture, freeSpacePathLoss, fromDb, hertzianPhasors,
  nearFarCrossover, patternStats, wavelength, type ArraySpec, type Dipole, type Pattern,
} from '@/core/physics/em/antennas';

type Tab = 'field' | 'pattern' | 'array' | 'link';
const TABS: [Tab, string][] = [['field', 'Near & far field'], ['pattern', 'Dipole patterns'], ['array', 'Arrays'], ['link', 'Radio link']];
const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
const num = (q: URLSearchParams, k: string, d: number, a: number, b: number) => { const v = Number(q.get(k)); return q.has(k) && Number.isFinite(v) ? clamp(v, a, b) : d; };
const SRC = ['ellingson-2020-vol2'];
const DEG = Math.PI / 180;

function fmtHz(f: number) { return f >= 1e9 ? `${formatSig(f / 1e9, 4)} GHz` : f >= 1e6 ? `${formatSig(f / 1e6, 4)} MHz` : `${formatSig(f / 1e3, 4)} kHz`; }
function fmtLen(m: number) { const a = Math.abs(m); return a >= 1000 ? `${formatSig(m / 1000, 4)} km` : a >= 1 ? `${formatSig(m, 4)} m` : a >= 0.01 ? `${formatSig(m * 100, 4)} cm` : `${formatSig(m * 1000, 4)} mm`; }

/** Log-scale frequency slider (Hz) shared by the tabs. */
function FreqSlider({ f, min = 1e5, max = 1e11 }: { f: number; min?: number; max?: number }) {
  return (
    <label className="slider-row"><span style={{ minWidth: 80 }}>frequency</span>
      <input type="range" min={Math.log10(min)} max={Math.log10(max)} step={0.001} value={Math.log10(f)} aria-label="Frequency"
        onChange={(e) => setQuery({ f: Number((10 ** Number(e.target.value)).toPrecision(4)) })} />
      <span>{fmtHz(f)}</span></label>
  );
}

// ------------------------------------------------------------------ near & far field
type RGB = [number, number, number];
const lerp = (a: RGB, b: RGB, t: number): RGB => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const diverging = (u: number): RGB => (u < 0.5 ? lerp([70, 140, 255], [12, 16, 32], u * 2) : lerp([12, 16, 32], [255, 90, 90], (u - 0.5) * 2));

function FieldCanvas({ ctx, half, probe, onPick, playing }: { ctx: Omit<DipoleCtx, 't'>; half: number; probe: [number, number] | null; onPick: (x: number, y: number) => void; playing: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const tRef = useRef(0);
  const lam = wavelength(ctx.f);
  const scale = useMemo(() => cabs(hertzianPhasors(ctx, half / 2, Math.PI / 2).Hphi), [ctx, half]);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const g = cv.getContext('2d')!;
    const N = 140, S = cv.width, ext = { xmin: -half, xmax: half, ymin: -half, ymax: half };
    const img = g.createImageData(N, N);
    const off = document.createElement('canvas'); off.width = N; off.height = N;
    let raf = 0, last = performance.now();
    const draw = () => {
      const t = tRef.current;
      const grid = sampleGrid(DIPOLE_LAYER, { ...ctx, t }, ext, N);
      for (let i = 0; i < N * N; i++) {
        const v = grid.values[i];
        const u = Number.isFinite(v) ? normalise('symlog', v, -scale * 50, scale * 50, scale / 4) : 0.5;
        const [r, gg, b] = diverging(u);
        img.data[4 * i] = r; img.data[4 * i + 1] = gg; img.data[4 * i + 2] = b; img.data[4 * i + 3] = 255;
      }
      off.getContext('2d')!.putImageData(img, 0, 0);
      g.imageSmoothingEnabled = true;
      g.drawImage(off, 0, 0, S, S);
      // E arrows (direction only)
      const M = 15;
      g.strokeStyle = 'rgba(245,199,107,0.85)'; g.lineWidth = 1.2;
      for (let j = 0; j < M; j++) for (let i = 0; i < M; i++) {
        const x = -half + ((i + 0.5) / M) * 2 * half, y = half - ((j + 0.5) / M) * 2 * half;
        const [ex, ey] = DIPOLE_LAYER.vector!({ ...ctx, t }, x, y);
        const m = Math.hypot(ex, ey); if (!(m > 0)) continue;
        const px = ((x + half) / (2 * half)) * S, py = ((half - y) / (2 * half)) * S, L = (S / M) * 0.38;
        const dx = (ex / m) * L, dy = (-ey / m) * L;
        g.beginPath(); g.moveTo(px - dx, py - dy); g.lineTo(px + dx, py + dy); g.stroke();
        g.beginPath(); g.arc(px + dx, py + dy, 1.6, 0, 2 * Math.PI); g.fillStyle = 'rgba(245,199,107,0.9)'; g.fill();
      }
      // crossover circle r = λ/2π and the dipole
      const rc = (nearFarCrossover(ctx.f) / (2 * half)) * S;
      g.setLineDash([5, 4]); g.strokeStyle = 'rgba(255,255,255,0.7)'; g.beginPath(); g.arc(S / 2, S / 2, rc, 0, 2 * Math.PI); g.stroke(); g.setLineDash([]);
      g.fillStyle = '#fff'; g.fillRect(S / 2 - 2, S / 2 - 9, 4, 18);
      if (probe) { const px = ((probe[0] * lam + half) / (2 * half)) * S, py = ((half - probe[1] * lam) / (2 * half)) * S; g.strokeStyle = '#5cf2a6'; g.lineWidth = 2; g.beginPath(); g.arc(px, py, 6, 0, 2 * Math.PI); g.stroke(); }
    };
    const loop = (now: number) => {
      tRef.current += ((now - last) / 1000) * (1 / ctx.f) / 2;   // one period every 2 s of wall time
      last = now; draw(); raf = requestAnimationFrame(loop);
    };
    draw();
    if (playing) raf = requestAnimationFrame((n) => { last = n; loop(n); });
    return () => cancelAnimationFrame(raf);
  }, [ctx, half, scale, probe, playing, lam]);
  return (
    <canvas ref={ref} width={520} height={520} aria-label="Field of a Hertzian dipole" className="wave-canvas" style={{ width: '100%', maxWidth: 520, cursor: 'crosshair', borderRadius: 10 }}
      onClick={(e) => { const r = (e.target as HTMLCanvasElement).getBoundingClientRect(); onPick(((e.clientX - r.left) / r.width * 2 - 1) * half, (1 - (e.clientY - r.top) / r.height * 2) * half); }} />
  );
}

function FieldTab() {
  const { query } = useRoute();
  const f = num(query, 'f', 100e6, 1e5, 1e11), m = num(query, 'm', 0.01, 1e-6, 10), w = num(query, 'w', 1.5, 0.1, 6);
  const lam = wavelength(f), half = w * lam;
  const probe: [number, number] | null = query.has('px') ? [num(query, 'px', 0, -w, w), num(query, 'py', 0, -w, w)] : null;
  const reduced = typeof document !== 'undefined' && document.querySelector('.app.reduced-motion') !== null;
  const [playing, setPlaying] = useState(!reduced);
  const ctx = useMemo(() => ({ IdL: m, f }), [m, f]);
  const pr = useMemo(() => {
    if (!probe) return null;
    const x = probe[0] * lam, y = probe[1] * lam, r = Math.hypot(x, y);
    if (!(r > 0)) return null;
    const th = Math.atan2(Math.abs(x), y), p = hertzianPhasors(ctx, r, th);
    return { r, th, Er: cabs(p.Er), Et: cabs(p.Etheta), H: cabs(p.Hphi), Z: Math.hypot(cabs(p.Er), cabs(p.Etheta)) / cabs(p.Hphi), S: 0.5 * cabs(p.Etheta) * cabs(p.Hphi) };
  }, [probe, lam, ctx]);
  return (
    <>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>A radiating dipole <ProvenanceBadge cls="derived" title="Exact fields of an ideal current moment (Ellingson eqs. 9.61, 9.65)" /></h1>
          <p className="note">An oscillating current element IΔl along the vertical axis. Colour: the magnetic field H at this instant (out of the plane red, into the plane blue, symmetric-log scale). Arrows: direction of the electric field E. The dashed circle marks r = λ/2π, where the near-field and radiating parts of H are equal. <SourceLinks ids={SRC} /></p>
        </div>
        <FieldCanvas ctx={ctx} half={half} probe={probe} playing={playing} onPick={(x, y) => setQuery({ px: (x / lam).toFixed(3), py: (y / lam).toFixed(3) })} />
        <DipoleLegend />
      </div>
      <Panel id="antenna-field-controls" className="left-panel" title="Dipole">
        <FreqSlider f={f} />
        <label className="slider-row"><span style={{ minWidth: 80 }}>IΔl</span><input type="range" min={-4} max={0} step={0.01} value={Math.log10(m)} aria-label="Current moment" onChange={(e) => setQuery({ m: Number((10 ** Number(e.target.value)).toPrecision(3)) })} /><span>{formatSig(m, 3)} A·m</span></label>
        <label className="slider-row"><span style={{ minWidth: 80 }}>view</span><input type="range" min={0.1} max={6} step={0.05} value={w} aria-label="View half-width in wavelengths" onChange={(e) => setQuery({ w: e.target.value })} /><span>±{formatSig(w, 3)} λ</span></label>
        <button className="chip" onClick={() => setPlaying((p) => !p)} aria-pressed={playing}>{playing ? '⏸ Pause' : '▶ Play'}</button>
        <span className="note" style={{ marginLeft: 8, fontSize: 10.5 }}>one period every 2 s</span>
        <dl className="kv" aria-label="Dipole quantities" style={{ marginTop: 10 }}>
          <KV k="wavelength λ = c/f" v={fmtLen(lam)} />
          <KV k="crossover r = λ/2π" v={fmtLen(nearFarCrossover(f))} />
          <KV k="shown half-width" v={fmtLen(half)} />
        </dl>
        <p className="note" style={{ fontSize: 10.5 }}>Close to the dipole the 1/r² and 1/r³ terms dominate: E is mostly the quasi-static field of an oscillating charge pair and has a radial part. Beyond a few wavelengths only the 1/r terms remain: E and H are transverse, in phase and |E|/|H| → η₀ = μ₀c ≈ {formatSig(ETA0, 4)} Ω, a locally plane wave (Ellingson §9.4). Click the map to probe.</p>
      </Panel>
      <Panel id="antenna-field-readout" className="right-panel" title="Probe">
        {pr ? <Probe title="Field at the probe point" ariaLabel="Field at the probe point" provenance="derived"
          where={[{ label: 'distance r', value: pr.r, unit: 'm', sig: 4 }, { label: 'r / λ', value: pr.r / lam, sig: 4 }, { label: 'angle from the axis θ', value: pr.th / DEG, unit: '°', sig: 4 }]}
          rows={[
            { label: '|E_r| (amplitude)', value: pr.Er, unit: 'V/m', sig: 4 },
            { label: '|E_θ| (amplitude)', value: pr.Et, unit: 'V/m', sig: 4 },
            { label: '|H_φ| (amplitude)', value: pr.H, unit: 'A/m', sig: 4 },
            { label: '|E|/|H|', value: pr.Z, unit: 'Ω', sig: 4, title: 'Tends to η₀ = μ₀c in the far zone' },
            { label: 'zone', value: pr.r < nearFarCrossover(f) ? 'near-field terms dominate' : pr.r < 3 * lam ? 'transition' : 'radiating terms dominate' },
          ]}
          note={<>Phasor amplitudes from Ellingson eq. 9.61 (H) and E = ∇×H/jωε₀ (eq. 9.65). <SourceLinks ids={SRC} /></>} />
          : <p className="note">Click the field map to probe E and H at a point.</p>}
        <div className="section-title">Model</div>
        <ul className="note" style={{ paddingLeft: 16, fontSize: 10.5 }}>{DIPOLE_LAYER.validity.map((v) => <li key={v}>{v}</li>)}</ul>
        <RelatedLinks id="field:hertzian-dipole" />
      </Panel>
    </>
  );
}
function DipoleLegend() {
  return <p className="note" style={{ fontSize: 10.5 }}><span style={{ color: 'rgb(255,90,90)' }}>■</span> H out of the plane · <span style={{ color: 'rgb(70,140,255)' }}>■</span> H into the plane · <span style={{ color: '#f5c76b' }}>—•</span> E direction (length not to scale) · ▮ dipole (not to scale) · <span style={{ color: '#5cf2a6' }}>○</span> probe</p>;
}

// ------------------------------------------------------------------ 3D pattern
function PatternSurface({ U, nT = 72, nP = 96 }: { U: Pattern; nT?: number; nP?: number }) {
  const geo = useMemo(() => {
    let max = 0;
    const vals: number[] = [];
    for (let i = 0; i <= nT; i++) for (let j = 0; j <= nP; j++) { const v = U((i / nT) * Math.PI, (j / nP) * 2 * Math.PI); vals.push(v); if (v > max) max = v; }
    const pos: number[] = [], col: number[] = [], idx: number[] = [];
    const c = new THREE.Color();
    for (let i = 0; i <= nT; i++) for (let j = 0; j <= nP; j++) {
      const th = (i / nT) * Math.PI, ph = (j / nP) * 2 * Math.PI, f = Math.sqrt(vals[i * (nP + 1) + j] / max) * 1.6;
      // dipole axis = three.js y; array axis = three.js x
      pos.push(f * Math.sin(th) * Math.cos(ph), f * Math.cos(th), -f * Math.sin(th) * Math.sin(ph));
      c.setHSL(0.6 - 0.6 * (f / 1.6), 0.85, 0.55); col.push(c.r, c.g, c.b);
    }
    for (let i = 0; i < nT; i++) for (let j = 0; j < nP; j++) { const a = i * (nP + 1) + j, b = a + nP + 1; idx.push(a, b, a + 1, b, b + 1, a + 1); }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    g.setIndex(idx); g.computeVertexNormals();
    return g;
  }, [U, nT, nP]);
  return (
    <>
      <mesh geometry={geo}><meshStandardMaterial vertexColors side={THREE.DoubleSide} roughness={0.5} transparent opacity={0.9} /></mesh>
      <mesh><cylinderGeometry args={[0.02, 0.02, 0.9, 8]} /><meshStandardMaterial color="#ffffff" /></mesh>
      <axesHelper args={[2]} />
      <OrbitControls enablePan={false} />
    </>
  );
}
function Pattern3D({ U, label }: { U: Pattern; label: string }) {
  return (
    <div style={{ position: 'relative', height: 280, borderRadius: 12, overflow: 'hidden', border: '1px solid var(--line)' }} aria-label={label} role="img">
      <Viewport camera={{ position: [2.6, 1.8, 3.2], fov: 45 }}><ambientLight intensity={0.6} /><directionalLight position={[3, 5, 4]} intensity={1.1} /><PatternSurface U={U} /></Viewport>
      <div className="note" style={{ position: 'absolute', left: 10, bottom: 6, fontSize: 10.5 }}>radius ∝ |E| (field pattern) · white: dipole axis · <span style={{ color: '#ff5555' }}>x</span> array axis · <span style={{ color: '#55ff55' }}>y</span> dipole axis</div>
    </div>
  );
}

// ------------------------------------------------------------------ dipole patterns
const ePlane = (U: Pattern, phi = 0, n = 360): [number, number][] => Array.from({ length: n + 1 }, (_, i) => { const a = (i / n) * 2 * Math.PI; const th = a <= Math.PI ? a : 2 * Math.PI - a; return [a, U(th, a <= Math.PI ? phi : phi + Math.PI)]; });
const hPlane = (U: Pattern, n = 360): [number, number][] => Array.from({ length: n + 1 }, (_, i) => { const a = (i / n) * 2 * Math.PI; return [a, U(Math.PI / 2, Math.PI / 2 - a)]; });

function PatternTab() {
  const { query } = useRoute();
  const kind = query.get('ant') === 'esd' ? 'esd' : 'hwd';
  const L = num(query, 'L', 0.05, 0.005, 0.1);
  const dip: Dipole = kind === 'esd' ? { kind: 'esd', lengthL: L } : HWD;
  const U = useMemo(() => dipolePattern(dip), [kind, L]); // eslint-disable-line react-hooks/exhaustive-deps
  const other = useMemo(() => dipolePattern(kind === 'esd' ? HWD : { kind: 'esd', lengthL: 0.05 }), [kind]);
  const s = useMemo(() => patternStats(U), [U]);
  const tb = kind === 'esd' ? { D: TEXTBOOK.esd.Dmax, R: TEXTBOOK.esd.RradPerL2 * L * L, Ae: TEXTBOOK.esd.AeMaxLambda2 } : { D: null, R: TEXTBOOK.hwd.Rrad, Ae: TEXTBOOK.hwd.AeMaxLambda2 };
  return (
    <>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Dipole radiation patterns <ProvenanceBadge cls="derived" title="Far field of a thin filament (Ellingson eq. 9.96), integrated numerically" /></h1>
          <p className="note">The far field of a thin straight wire follows from its current distribution (Ellingson eq. 9.96). An electrically short dipole (length ≪ λ/2) carries a triangular current; a half-wave dipole a cosine current that vanishes at its ends (eq. 9.97). Directivity, radiation resistance and effective aperture below are integrated numerically from the pattern and compared with the values the textbook derives. <SourceLinks ids={SRC} /></p>
        </div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div><div className="section-title">E-plane (contains the dipole axis)</div>
            <PolarPlot ariaLabel="E-plane radiation pattern" angleLabel="θ from the dipole axis" series={[{ points: ePlane(U), color: '#7df9ff', label: kind === 'hwd' ? 'half-wave' : 'short dipole' }, { points: ePlane(other), color: '#f5c76b', dashed: true, label: kind === 'hwd' ? 'short dipole' : 'half-wave' }]}
              marks={s.hpbwDeg ? [{ angle: Math.PI / 2 - (s.hpbwDeg / 2) * DEG, label: 'half power' }, { angle: Math.PI / 2 + (s.hpbwDeg / 2) * DEG, label: 'half power' }] : []} /></div>
          <div><div className="section-title">H-plane (perpendicular to the axis)</div>
            <PolarPlot ariaLabel="H-plane radiation pattern" angleLabel="φ around the axis" series={[{ points: hPlane(U), color: '#7df9ff' }]} />
            <p className="note" style={{ fontSize: 10.5, maxWidth: 280 }}>A straight dipole radiates equally in every direction around its axis: the H-plane pattern is a circle.</p></div>
        </div>
        <Pattern3D U={U} label="3D radiation pattern" />
      </div>
      <Panel id="antenna-pattern-controls" className="left-panel" title="Antenna">
        <div className="chip-row" role="radiogroup" aria-label="Antenna" style={{ marginBottom: 8 }}>
          <button role="radio" aria-checked={kind === 'hwd'} className={`chip ${kind === 'hwd' ? 'active' : ''}`} onClick={() => setQuery({ ant: null })}>Half-wave dipole</button>
          <button role="radio" aria-checked={kind === 'esd'} className={`chip ${kind === 'esd' ? 'active' : ''}`} onClick={() => setQuery({ ant: 'esd' })}>Electrically short dipole</button>
        </div>
        {kind === 'esd' && <label className="slider-row"><span style={{ minWidth: 80 }}>length L</span><input type="range" min={0.005} max={0.1} step={0.005} value={L} aria-label="Dipole length in wavelengths" onChange={(e) => setQuery({ L: e.target.value })} /><span>{formatSig(L, 3)} λ</span></label>}
      </Panel>
      <Panel id="antenna-pattern-readout" className="right-panel" title="Antenna figures">
        <table className="table-mini" aria-label="Antenna figures">
          <thead><tr><th></th><th>numerical</th><th>Ellingson</th></tr></thead>
          <tbody>
            <tr><td>max directivity D</td><td data-reading="D numerical">{formatSig(s.Dmax, 4)} ({formatSig(s.DmaxDbi, 3)} dBi)</td><td>{tb.D !== null ? `${tb.D} (1.76 dBi)` : <span className="note" title="Ellingson gives A_e ≈ 0.131λ²; D = 4πA_e/λ² follows">via A_e: {formatSig(4 * Math.PI * tb.Ae, 3)}</span>}</td></tr>
            <tr><td>radiation resistance R_rad</td><td data-reading="Rrad numerical">{formatSig(s.Rrad, 4)} Ω</td><td>{kind === 'esd' ? `20π²(L/λ)² = ${formatSig(tb.R, 4)} Ω` : '≅ 73 Ω'}</td></tr>
            <tr><td>max effective aperture A_e</td><td data-reading="Ae numerical">{formatSig(s.AeMaxLambda2, 4)} λ²</td><td>≈ {tb.Ae} λ²</td></tr>
            <tr><td>half-power beamwidth</td><td>{s.hpbwDeg !== null ? `${formatSig(s.hpbwDeg, 3)}°` : '—'}</td><td className="note">not quoted</td></tr>
          </tbody>
        </table>
        <p className="note" style={{ fontSize: 10.5 }}>R_rad = 2P_rad/|I₀|² (eq. 10.38), D = 4πU_max/P_rad (eq. 10.48), A_e = Dλ²/4π (eq. 10.160): a lossless, conjugate-matched antenna in free space. The isotropic reference has A_e = λ²/4π ≈ 0.080λ². <SourceLinks ids={SRC} /></p>
        <div className="section-title">Validity</div>
        <ul className="note" style={{ paddingLeft: 16, fontSize: 10.5 }}><li>Far field only (r ≫ λ and r ≫ L)</li><li>Thin, lossless wire in free space; no ground, feed line or mismatch</li>{kind === 'esd' && <li>Triangular current assumes L ≪ λ/2 (here ≤ 0.1 λ)</li>}</ul>
        <RelatedLinks id="instrument:antennas" />
      </Panel>
    </>
  );
}

// ------------------------------------------------------------------ arrays
function ArrayTab() {
  const { query } = useRoute();
  const el = (['iso', 'esd', 'hwd'] as const).find((k) => k === query.get('el')) ?? 'hwd';
  const N = Math.round(num(query, 'N', 4, 1, 16)), d = num(query, 'd', 0.5, 0.05, 2), aDeg = num(query, 'a', 0, -180, 180);
  const spec: ArraySpec = { element: el === 'iso' ? 'isotropic' : el === 'esd' ? { kind: 'esd', lengthL: 0.05 } : HWD, N, d, alpha: aDeg * DEG };
  const U = useMemo(() => arrayPattern(spec), [el, N, d, aDeg]); // eslint-disable-line react-hooks/exhaustive-deps
  const s = useMemo(() => patternStats(U, 180, 360), [U]);
  const lobes = arrayMainLobes(spec).filter((p) => p <= Math.PI + 1e-9);
  const grating = lobes.length > 1;
  return (
    <>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Antenna arrays <ProvenanceBadge cls="derived" title="Superposition of the element far fields (no mutual coupling)" /></h1>
          <p className="note">{N} identical vertical elements spaced {formatSig(d, 3)} λ apart along x, each fed {formatSig(aDeg, 3)}° later than the one before. Far fields add, so the pattern is the element pattern times the array factor |Σ e^{'{'}jn(βd sinθ cosφ + α){'}'}|². Changing the phase steers the beam; spacings near or above λ let extra full-strength lobes (grating lobes) into view. <SourceLinks ids={SRC} /></p>
        </div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div><div className="section-title">Horizontal plane (θ = 90°)</div>
            <PolarPlot ariaLabel="Array pattern in the horizontal plane" angleLabel="array axis x points right (0° = broadside)" series={[{ points: hPlane(U), color: '#7df9ff' }]}
              marks={lobes.map((p) => ({ angle: Math.PI / 2 - p, label: `array-factor maximum at φ = ${formatSig(p / DEG, 3)}°` }))} /></div>
          <div style={{ flex: 1, minWidth: 280 }}><Pattern3D U={U} label="3D array pattern" /></div>
        </div>
      </div>
      <Panel id="antenna-array-controls" className="left-panel" title="Array">
        <div className="chip-row" role="radiogroup" aria-label="Array element" style={{ marginBottom: 6 }}>
          {([['hwd', 'Half-wave dipoles'], ['esd', 'Short dipoles'], ['iso', 'Isotropic (reference)']] as const).map(([k, l]) => <button key={k} role="radio" aria-checked={el === k} className={`chip ${el === k ? 'active' : ''}`} onClick={() => setQuery({ el: k === 'hwd' ? null : k })}>{l}</button>)}
        </div>
        <label className="slider-row"><span style={{ minWidth: 110 }}>elements N</span><input type="range" min={1} max={16} step={1} value={N} aria-label="Number of elements" onChange={(e) => setQuery({ N: e.target.value })} /><span>{N}</span></label>
        <label className="slider-row"><span style={{ minWidth: 110 }}>spacing d</span><input type="range" min={0.05} max={2} step={0.05} value={d} aria-label="Element spacing in wavelengths" onChange={(e) => setQuery({ d: e.target.value })} /><span>{formatSig(d, 3)} λ</span></label>
        <label className="slider-row"><span style={{ minWidth: 110 }}>phase step α</span><input type="range" min={-180} max={180} step={1} value={aDeg} aria-label="Progressive phase in degrees" onChange={(e) => setQuery({ a: e.target.value })} /><span>{aDeg}°</span></label>
      </Panel>
      <Panel id="antenna-array-readout" className="right-panel" title="Array figures">
        <dl className="kv" aria-label="Array quantities">
          <KV k="max directivity D" v={`${formatSig(s.Dmax, 4)} (${formatSig(s.DmaxDbi, 3)} dBi)`} />
          <KV k="array length (N − 1)d" v={`${formatSig((N - 1) * d, 3)} λ`} />
          <KV k="array-factor maxima (φ)" v={lobes.length ? lobes.map((p) => `${formatSig(p / DEG, 3)}°`).join(', ') : 'none in view'} />
          <KV k="beam peak (θ, φ)" v={`${formatSig(s.thetaMax / DEG, 3)}°, ${formatSig(s.phiMax / DEG, 3)}°`} />
        </dl>
        {grating && <p className="note" style={{ color: 'var(--warn)', fontSize: 11 }} role="status">Grating lobes: {lobes.length} full-strength array-factor maxima are in view (spacing too large for this phase).</p>}
        <p className="note" style={{ fontSize: 10.5 }}>Maxima where βd cosφ + α = 2πm (θ = 90°). D is integrated numerically over the sphere (180 × 360 cells). <SourceLinks ids={SRC} /></p>
        <div className="section-title">Validity</div>
        <ul className="note" style={{ paddingLeft: 16, fontSize: 10.5 }}><li>Pattern multiplication by superposition of far fields; mutual coupling between elements, which Ellingson notes is significant in dense arrays, is neglected</li><li>Equal amplitudes, uniform spacing; elements in free space</li></ul>
      </Panel>
    </>
  );
}

// ------------------------------------------------------------------ link (Friis)
function LinkTab() {
  const { query } = useRoute();
  const f = num(query, 'f', 2.4e9, 1e5, 1e11), R = num(query, 'R', 100, 0.1, 1e12), PT = num(query, 'PT', 20, -60, 90), GT = num(query, 'GT', 2.15, -10, 80), GR = num(query, 'GR', 2.15, -10, 80);
  const lam = wavelength(f), Lp = freeSpacePathLoss(R, lam), PRdbm = PT + GT + GR - dB(Lp);
  const ex = () => setQuery({ f: 6e9, R: 30e3, PT: -36.5, GT: 27, GR: 27 });
  const presets: [string, number][] = [['isotropic', 0], ['short dipole', patternStats(dipolePattern({ kind: 'esd', lengthL: 0.05 })).DmaxDbi], ['half-wave dipole', patternStats(dipolePattern(HWD)).DmaxDbi]];
  const curve = useMemo(() => Array.from({ length: 81 }, (_, i) => { const r = R * 10 ** (-2 + i / 20); return [r, PT + GT + GR - dB(freeSpacePathLoss(r, lam))] as [number, number]; }), [R, PT, GT, GR, lam]);
  const G = ({ k, v, label }: { k: 'GT' | 'GR'; v: number; label: string }) => (
    <div style={{ marginBottom: 6 }}>
      <label className="slider-row"><span style={{ minWidth: 110 }}>{label}</span><input type="range" min={-10} max={80} step={0.01} value={v} aria-label={label} onChange={(e) => setQuery({ [k]: Number(Number(e.target.value).toFixed(2)) })} /><span>{formatSig(v, 4)} dBi</span></label>
      <div className="chip-row" style={{ gap: 4 }}>{presets.map(([l, g]) => <button key={l} className="chip" style={{ fontSize: 10.5 }} onClick={() => setQuery({ [k]: Number(g.toFixed(2)) })}>{l}</button>)}</div>
    </div>
  );
  return (
    <>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>A radio link: the Friis equation <ProvenanceBadge cls="derived" title="Friis transmission equation, free space (Ellingson eq. 10.166)" /></h1>
          <p className="note">P_R = P_T G_T (λ/4πR)² G_R for co-polarised, conjugate-matched antennas in free space. The free-space path loss (4πR/λ)² grows with frequency only because a receiving antenna of given gain has an effective aperture proportional to λ²; spreading between two ranges does not depend on frequency (Ellingson §10.14). <SourceLinks ids={SRC} /></p>
        </div>
        <LinePlot ariaLabel="Received power against range" width={640} height={240} xLog xLabel="range R (m)" yLabel="received power (dBm)" legend="tr" series={[{ points: curve, color: '#7df9ff', label: 'free space' }]} markers={[{ x: R, y: PRdbm, label: `${formatSig(PRdbm, 4)} dBm` }]} />
      </div>
      <Panel id="antenna-link-controls" className="left-panel" title="Link">
        <FreqSlider f={f} />
        <label className="slider-row"><span style={{ minWidth: 110 }}>range R</span><input type="range" min={-1} max={12} step={0.001} value={Math.log10(R)} aria-label="Range" onChange={(e) => setQuery({ R: Number((10 ** Number(e.target.value)).toPrecision(4)) })} /><span>{fmtLen(R)}</span></label>
        <label className="slider-row"><span style={{ minWidth: 110 }}>transmit power</span><input type="range" min={-60} max={90} step={0.1} value={PT} aria-label="Transmit power in dBm" onChange={(e) => setQuery({ PT: e.target.value })} /><span>{formatSig(PT, 4)} dBm ({formatSig(dbmToW(PT), 3)} W)</span></label>
        <G k="GT" v={GT} label="transmit gain" /><G k="GR" v={GR} label="receive gain" />
        <button className="chip" onClick={ex}>Ellingson Example 10.11: 6 GHz, 30 km, 27 dBi dishes</button>
      </Panel>
      <Panel id="antenna-link-readout" className="right-panel" title="Link budget">
        <dl className="kv" aria-label="Link quantities">
          <KV k="wavelength λ" v={fmtLen(lam)} />
          <KV k="free-space path loss" v={dB(Lp)} unit="dB" sig={5} />
          <KV k="received power" v={PRdbm} unit="dBm" sig={5} />
          <KV k="received power" v={dbmToW(PRdbm)} unit="W" sig={4} />
          <KV k="receive aperture A_e = G_Rλ²/4π" v={effectiveAperture(fromDb(GR), lam)} unit="m²" sig={4} />
        </dl>
        <p className="note" style={{ fontSize: 10.5 }}>In Example 10.11 Ellingson finds that a −120 dBm receiver needs P_T ≥ 2.26 × 10⁻⁷ W ≅ −36.5 dBm (using c ≈ 3 × 10⁸ m/s); the preset sets that power and the exact c used here gives {formatSig(-36.5 + 27 + 27 - dB(freeSpacePathLoss(30e3, wavelength(6e9))), 4)} dBm at the receiver. <SourceLinks ids={SRC} /></p>
        <div className="section-title">Validity</div>
        <ul className="note" style={{ paddingLeft: 16, fontSize: 10.5 }}><li>Free space: no absorption, reflection, terrain or atmosphere</li><li>Both antennas in each other's far field, co-polarised and conjugate-matched</li><li>Gains include antenna losses but not mismatch</li></ul>
      </Panel>
    </>
  );
}

export default function AntennaView() {
  const { query } = useRoute();
  const tab: Tab = TABS.find(([t]) => t === query.get('tab'))?.[0] ?? 'field';
  return (
    <>
      <nav className="view-switch" aria-label="Antenna sections">
        {TABS.map(([t, label]) => <button key={t} className={tab === t ? 'active' : ''} onClick={() => setQuery({ tab: t === 'field' ? null : t })}>{label}</button>)}
      </nav>
      {tab === 'pattern' ? <PatternTab /> : tab === 'array' ? <ArrayTab /> : tab === 'link' ? <LinkTab /> : <FieldTab />}
    </>
  );
}
