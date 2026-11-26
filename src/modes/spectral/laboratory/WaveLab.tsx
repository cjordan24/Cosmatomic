/**
 * Wave Laboratory — #/spectral/lab?demo=…  (Gate 4.5)
 *
 * Every visual is computed from the shared wave engine (src/core/physics/waves). The URL query holds
 * the complete configuration (deep-linkable, restorable from the notebook). Physical propagation
 * speed comes from the selected MEDIUM; the "time scale" only changes playback (simulated seconds per
 * wall-clock second) — the physics advances by simulated time, independent of frame rate.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { Viewport } from '@/rendering/Viewport';
import { setQuery, useRoute } from '@/shared/router';
import { KV, Panel, ProvenanceBadge } from '@/ui/components';
import { LinePlot } from '@/ui/plots';
import { SourceLinks } from '@/ui/SourcesView';
import { formatSig } from '@/core/units/units';
import { saveExperiment, WAVE_SOLVER_VERSION, type WaveExperiment } from '@/shared/notebook';
import { MEDIA, getMedium } from '@/core/physics/waves/media';
import { TAU, advanceFD, attenuated, beatFrequency, courant, createFD, deepWater, doppler, kinematics, modeFrequency, nonDispersive, packet, sinusoid, standingWave, twoSourceField, velocities, type Boundary, type FDString } from '@/core/physics/waves/waves';

type Demo = 'traveling' | 'superposition' | 'beats' | 'standing' | 'packet' | 'pulse' | 'interference' | 'doppler' | 'attenuation';
const DEMOS: { id: Demo; label: string; model: string }[] = [
  { id: 'traveling', label: 'Travelling wave', model: 'travelling sinusoid y = A sin(kx − ωt + φ)' },
  { id: 'superposition', label: 'Superposition & interference', model: 'sum of two sinusoids (linear medium)' },
  { id: 'beats', label: 'Beats', model: 'two close frequencies, f_beat = |f₁ − f₂|' },
  { id: 'standing', label: 'Standing waves & harmonics', model: 'normal modes for the chosen boundary conditions' },
  { id: 'packet', label: 'Wave packet & dispersion', model: 'Gaussian packet; ω(k) linear or deep-water ω² = gk' },
  { id: 'pulse', label: 'Pulse & reflection (numerical)', model: 'explicit finite differences, Courant ≤ 1' },
  { id: 'interference', label: 'Two-source interference', model: 'two coherent point sources in a plane' },
  { id: 'doppler', label: 'Doppler shift', model: 'moving source, medium at rest' },
  { id: 'attenuation', label: 'Attenuation', model: 'exponential amplitude decay A₀e^(−αx)' },
];

const num = (q: URLSearchParams, k: string, d: number) => { const v = Number(q.get(k)); return q.get(k) !== null && Number.isFinite(v) ? v : d; };

export interface LabConfig {
  demo: Demo; wave: 'transverse' | 'longitudinal'; medium: string; f: number; A: number; phi: number;
  T: number; tension: number; mu: number; f2: number; A2: number; phi2: number; dir2: 1 | -1;
  view: 'field' | 'intensity'; bc: Boundary; n: number; L: number; disp: 'linear' | 'deep-water'; fdbc: 'fixed' | 'free'; vs: number; alpha: number; ts: number; d: number;
}
function readConfig(q: URLSearchParams): LabConfig {
  const demo = (DEMOS.some((d) => d.id === q.get('demo')) ? q.get('demo') : 'traveling') as Demo;
  const medium = q.get('medium') ?? (demo === 'traveling' || demo === 'superposition' || demo === 'standing' || demo === 'pulse' ? 'string' : 'air');
  return {
    demo, medium, wave: q.get('wave') === 'longitudinal' ? 'longitudinal' : 'transverse',
    f: num(q, 'f', medium === 'string' ? 25 : 440), A: num(q, 'A', medium === 'string' ? 0.005 : 1e-6), phi: num(q, 'phi', 0),
    T: num(q, 'T', 293.15), tension: num(q, 'tension', 100), mu: num(q, 'mu', 0.01),
    f2: num(q, 'f2', demo === 'beats' ? 444 : medium === 'string' ? 25 : 440), A2: num(q, 'A2', medium === 'string' ? 0.005 : 1e-6), phi2: num(q, 'phi2', 0), dir2: q.get('dir2') === '-1' ? -1 : 1,
    view: q.get('view') === 'intensity' ? 'intensity' : 'field',
    bc: (['fixed-fixed', 'open-open', 'open-closed'].includes(q.get('bc') ?? '') ? q.get('bc') : 'fixed-fixed') as Boundary,
    n: Math.max(1, Math.round(num(q, 'n', 3))), L: num(q, 'L', 1.2), disp: q.get('disp') === 'deep-water' ? 'deep-water' : 'linear',
    fdbc: q.get('fdbc') === 'free' ? 'free' : 'fixed', vs: num(q, 'vs', 60), alpha: num(q, 'alpha', 0.5), ts: num(q, 'ts', NaN), d: num(q, 'd', 3),
  };
}

/** Physical setup derived from the configuration: speeds, frequencies, view window. */
function useSetup(c: LabConfig) {
  return useMemo(() => {
    const med = getMedium(c.medium);
    const v = med.speed({ temperatureK: c.T, tensionN: c.tension, linearDensity: c.mu });
    const f = c.demo === 'standing' && v ? modeFrequency(c.bc, c.n, c.L, v) : c.f;
    const kin = v ? kinematics(f, v) : null;
    const lambda = kin?.lambda ?? 1;
    const view = c.demo === 'standing' ? c.L : c.demo === 'pulse' ? c.L : c.demo === 'packet' ? 30 * lambda : c.demo === 'attenuation' ? Math.max(3 * lambda, 4 / c.alpha) : 3 * lambda;
    // default playback: show ~0.5 visual oscillations per second
    const ts = Number.isFinite(c.ts) ? c.ts : Math.min(1, 0.5 / f);
    return { med, v, f, kin, lambda, view, ts };
  }, [c]);
}

type Setup = ReturnType<typeof useSetup>;

/** Field value (displacement, m) at x and simulated time t for the 1D analytic demos. */
function field(c: LabConfig, s: Setup, x: number, t: number, fd: FDString | null): number {
  const v = s.v; if (!v) return 0;
  const w1 = { A: c.A, f: s.f, v, phi: c.phi, dir: 1 as const };
  switch (c.demo) {
    case 'traveling': return sinusoid(w1, x, t);
    case 'superposition': case 'beats': return sinusoid(w1, x, t) + sinusoid({ A: c.A2, f: c.f2, v, phi: c.phi2, dir: c.dir2 }, x, t);
    case 'standing': return standingWave(c.bc, c.n, c.L, v, c.A, x, t);
    case 'packet': { const k0 = TAU / s.lambda; return packet({ A: c.A, k0, sigmaK: k0 * 0.08, omega: c.disp === 'deep-water' ? deepWater() : nonDispersive(v), x0: s.view * 0.2 }, x, t); }
    case 'attenuation': return attenuated(c.A, c.alpha, x) * Math.sin(TAU * (x / s.lambda) - TAU * s.f * t + c.phi);
    case 'pulse': { if (!fd) return 0; const i = Math.max(0, Math.min(fd.N - 1, Math.round(x / fd.dx))); return fd.y[i]; }
    default: return 0;
  }
}

const NP = 121;
const NPL = 61, ROWS = 7; // longitudinal particle grid (columns × rows)
function Line1D({ c, s, tRef, fdRef }: { c: LabConfig; s: Setup; tRef: React.MutableRefObject<number>; fdRef: React.MutableRefObject<FDString | null> }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const line = useRef<THREE.Line>(null);
  const o = useMemo(() => new THREE.Object3D(), []);
  const col = useMemo(() => new THREE.Color(), []);
  const W = 10; // scene width for the view window
  const Amax = Math.max(1e-30, c.demo === 'superposition' || c.demo === 'beats' ? c.A + c.A2 : c.demo === 'standing' ? 2 * c.A : c.demo === 'pulse' ? 1 : c.A);
  const longitudinal = c.demo === 'traveling' && c.wave === 'longitudinal' || s.med.waveType === 'longitudinal' && c.demo !== 'packet';
  const gainT = (W * 0.15) / Amax;               // transverse display gain (scene units per metre)
  const spacing = W / (NPL - 1);
  const gainL = (spacing * 0.45) / Amax;         // longitudinal display gain
  const geom = useMemo(() => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(NP * 3), 3)); return g; }, []);
  useEffect(() => () => geom.dispose(), [geom]);
  useFrame(() => {
    const t = tRef.current, fd = fdRef.current;
    const pos = geom.getAttribute('position') as THREE.BufferAttribute;
    if (longitudinal) {
      const h = s.view / (NPL - 1);
      for (let i = 0; i < NPL; i++) {
        const x = i * h;
        const xi = field(c, s, x, t, fd);
        const strain = -(field(c, s, x + h / 2, t, fd) - field(c, s, x - h / 2, t, fd)) / h; // compression > 0
        const kA = (TAU / s.lambda) * Amax || 1;
        col.setHSL(0.58 - 0.5 * Math.max(-1, Math.min(1, strain / kA)) * 0.5, 0.85, 0.6);
        for (let r = 0; r < ROWS; r++) {
          o.position.set(-W / 2 + i * spacing + xi * gainL, (r - (ROWS - 1) / 2) * 0.32, 0);
          o.scale.setScalar(0.75); o.updateMatrix();
          mesh.current?.setMatrixAt(i * ROWS + r, o.matrix); mesh.current?.setColorAt(i * ROWS + r, col);
        }
      }
      if (mesh.current) { mesh.current.instanceMatrix.needsUpdate = true; if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true; }
      return;
    }
    for (let i = 0; i < NP; i++) {
      const x = (i / (NP - 1)) * s.view;
      const y = field(c, s, x, t, fd);
      const X = -W / 2 + (i / (NP - 1)) * W;
      if (longitudinal) {
        // particles displaced ALONG x; colour shows compression (−∂ξ/∂x)
        const dy = field(c, s, x + s.view / (NP - 1) / 2, t, fd) - field(c, s, x - s.view / (NP - 1) / 2, t, fd);
        const strain = -dy / (s.view / (NP - 1));
        o.position.set(X + y * gainL, 0, 0);
        col.setHSL(0.6 - Math.max(-0.12, Math.min(0.12, strain * (s.lambda / (Amax * TAU)) * 0.12)), 0.9, 0.6);
        pos.setXYZ(i, X + y * gainL, -0.9, 0);
      } else {
        o.position.set(X, y * gainT, 0);
        col.set('#f5c76b');
        pos.setXYZ(i, X, y * gainT, 0);
      }
      o.scale.setScalar(longitudinal ? 1 : 0.7);
      o.updateMatrix();
      mesh.current?.setMatrixAt(i, o.matrix);
      mesh.current?.setColorAt(i, col);
    }
    if (mesh.current) { mesh.current.instanceMatrix.needsUpdate = true; if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true; }
    pos.needsUpdate = true;
  });
  return (
    <>
      <ambientLight intensity={0.7} /><directionalLight position={[3, 5, 6]} intensity={1.2} />
      <instancedMesh ref={mesh} args={[undefined, undefined, longitudinal ? NPL * ROWS : NP]} key={longitudinal ? 'L' : 'T'}><sphereGeometry args={[0.07, 12, 8]} /><meshStandardMaterial vertexColors={false} roughness={0.4} /></instancedMesh>
      {!longitudinal && <primitive object={new THREE.Line(geom, new THREE.LineBasicMaterial({ color: '#f5c76b', transparent: true, opacity: 0.5 }))} ref={line} />}
      <mesh position={[0, -1.6, 0]}><boxGeometry args={[W, 0.01, 0.01]} /><meshBasicMaterial color="#66708f" /></mesh>
      <OrbitControls makeDefault enableRotate={false} />
    </>
  );
}

/** 2D canvas demos: two-source interference and Doppler wavefronts. */
function Canvas2D({ c, s, tRef }: { c: LabConfig; s: Setup; tRef: React.MutableRefObject<number> }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    let raf = 0; let last = 0;
    const draw = (now: number) => {
      raf = requestAnimationFrame(draw);
      if (now - last < 33) return; last = now;
      const cv = ref.current; if (!cv || !s.v) return;
      const ctx = cv.getContext('2d')!; const W = cv.width, H = cv.height;
      const t = tRef.current;
      if (c.demo === 'interference') {
        const span = 10 * s.lambda, k = TAU / s.lambda, om = TAU * s.f;
        const img = ctx.createImageData(W, H);
        const s1: [number, number] = [-c.d * s.lambda / 2, 0], s2: [number, number] = [c.d * s.lambda / 2, 0];
        for (let py = 0; py < H; py++) for (let px = 0; px < W; px++) {
          const x = (px / W - 0.5) * span, y = (0.5 - py / H) * span * (H / W);
          const i = 4 * (py * W + px);
          if (c.view === 'intensity') {
            // time-averaged intensity of the sum: I/I₁ = 2 + 2 cos(k Δr)  → 0 (dark fringe) … 4 (bright)
            const dr = Math.hypot(x - s1[0], y - s1[1]) - Math.hypot(x - s2[0], y - s2[1]);
            const I = (2 + 2 * Math.cos(k * dr)) / 4;
            img.data[i] = 245 * I; img.data[i + 1] = 199 * I; img.data[i + 2] = 107 * I; img.data[i + 3] = 255;
          } else {
            const val = twoSourceField(x, y, t, s1, s2, k, om) / 2;
            img.data[i] = val > 0 ? 245 * val : 0; img.data[i + 1] = val > 0 ? 199 * val : 0; img.data[i + 2] = val < 0 ? -255 * val : 0; img.data[i + 3] = 255;
          }
        }
        ctx.putImageData(img, 0, 0);
        ctx.fillStyle = '#fff'; for (const sp of [s1, s2]) { ctx.beginPath(); ctx.arc(W / 2 + (sp[0] / span) * W, H / 2, 4, 0, TAU); ctx.fill(); }
      } else {
        // Doppler: wavefronts emitted every period by a source moving at vs (m/s) along +x
        ctx.fillStyle = '#03050c'; ctx.fillRect(0, 0, W, H);
        const span = 14 * s.lambda, scale = W / span, Tp = 1 / s.f;
        const sx = (t * c.vs) % (span * 0.6) - span * 0.3;
        ctx.strokeStyle = '#f5c76b'; ctx.lineWidth = 1.2;
        const tStart = t - ((sx + span * 0.3) / Math.max(c.vs, 1e-9));
        for (let te = Math.ceil(Math.max(0, tStart) / Tp) * Tp; te <= t; te += Tp) {
          const xe = sx - c.vs * (t - te), r = s.v * (t - te);
          ctx.beginPath(); ctx.arc(W / 2 + xe * scale, H / 2, r * scale, 0, TAU); ctx.stroke();
        }
        ctx.fillStyle = '#ff7a90'; ctx.beginPath(); ctx.arc(W / 2 + sx * scale, H / 2, 6, 0, TAU); ctx.fill();
        ctx.fillStyle = '#9aa6c8'; ctx.font = '12px sans-serif'; ctx.fillText('observer ahead →', W - 130, H / 2 - 10); ctx.fillText('← observer behind', 10, H / 2 - 10);
      }
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [c, s, tRef]);
  return <canvas ref={ref} width={560} height={360} className="wave-canvas" aria-label={c.demo === 'interference' ? 'Two-source interference field' : 'Doppler wavefronts'} />;
}

export default function WaveLab() {
  const { query } = useRoute();
  const c = useMemo(() => readConfig(query), [query]);
  const s = useSetup(c);
  const tRef = useRef(0);
  const fdRef = useRef<FDString | null>(null);
  const [running, setRunning] = useState(true);
  const [tick, setTick] = useState(0);
  const hist = useRef<[number, number][]>([]);
  const [name, setName] = useState(''); const [notes, setNotes] = useState(''); const [msg, setMsg] = useState<string | null>(null);
  const demo = DEMOS.find((d) => d.id === c.demo)!;

  // (re)initialise the numerical solver when its configuration changes
  const fdError = useMemo(() => {
    tRef.current = 0; hist.current = [];
    if (c.demo !== 'pulse' || !s.v) { fdRef.current = null; return null; }
    const N = 301, dx = c.L / (N - 1), dt = (0.8 * dx) / s.v;
    try { fdRef.current = createFD(c.L, N, s.v, dt, (x) => Math.exp(-(((x - c.L * 0.3) / (c.L * 0.03)) ** 2)), c.fdbc, c.fdbc); return null; }
    catch (e) { fdRef.current = null; return (e as Error).message; }
  }, [c, s.v]);

  // simulation clock: simulated time advances by wall-clock × time scale (independent of frame rate)
  useEffect(() => {
    let raf = 0, last = performance.now();
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dtw = Math.min(0.1, (now - last) / 1000); last = now;
      if (!running) return;
      const dts = dtw * s.ts;
      tRef.current += dts;
      if (fdRef.current) advanceFD(fdRef.current, dts);
      const xp = s.view / 3;
      hist.current.push([tRef.current, field(c, s, xp, tRef.current, fdRef.current)]);
      if (hist.current.length > 400) hist.current.shift();
    };
    raf = requestAnimationFrame(loop);
    const id = setInterval(() => setTick((k) => k + 1), 150);
    return () => { cancelAnimationFrame(raf); clearInterval(id); };
  }, [running, c, s]);

  const stepOnce = () => { const dts = c.demo === 'pulse' && fdRef.current ? fdRef.current.dt * 10 : 1 / s.f / 20; tRef.current += dts; if (fdRef.current) advanceFD(fdRef.current, dts); setTick((k) => k + 1); };
  const reset = () => { tRef.current = 0; hist.current = []; if (fdRef.current && s.v) { const N = fdRef.current.N, dx = fdRef.current.dx; fdRef.current = createFD(c.L, N, s.v, (0.8 * dx) / s.v, (x) => Math.exp(-(((x - c.L * 0.3) / (c.L * 0.03)) ** 2)), c.fdbc, c.fdbc); } setTick((k) => k + 1); };

  const snapshot = useMemo(() => Array.from({ length: 200 }, (_, i) => { const x = (i / 199) * s.view; return [x, field(c, s, x, tRef.current, fdRef.current)] as [number, number]; }), [tick]); // eslint-disable-line react-hooks/exhaustive-deps
  const is2D = c.demo === 'interference' || c.demo === 'doppler';
  const set = (k: string, v: string | number | null) => setQuery({ [k]: v });
  const fb = c.demo === 'beats' ? beatFrequency(s.f, c.f2) : null;
  const fd = fdRef.current;
  const vel = s.v && c.demo === 'packet' ? velocities(c.disp === 'deep-water' ? deepWater() : nonDispersive(s.v), TAU / s.lambda) : null;
  const dopAhead = s.v && c.demo === 'doppler' ? doppler(s.f, s.v, c.vs, 0) : null;
  const dopBehind = s.v && c.demo === 'doppler' ? doppler(s.f, s.v, -c.vs, 0) : null;
  const userParams = c.medium === 'string' || c.demo === 'attenuation' || c.demo === 'interference';

  const save = async () => {
    const shot = (document.querySelector<HTMLCanvasElement>('.viewport canvas, canvas.wave-canvas'))?.toDataURL('image/jpeg', 0.7) ?? null;
    const e: WaveExperiment = {
      kind: 'wave', id: `wave-${Date.now().toString(36)}`, name: name.trim() || `${demo.label} · ${s.med.name}`, mode: 'wave-lab', createdAt: new Date().toISOString(),
      model: demo.model, solver: { version: WAVE_SOLVER_VERSION, dt: fd?.dt ?? null, courant: fd ? courant(fd.v, fd.dt, fd.dx) : null },
      params: Object.fromEntries(query.entries()), units: { f: 'Hz', A: 'm', phi: 'rad', T: 'K', tension: 'N', mu: 'kg/m', L: 'm', vs: 'm/s', alpha: 'Np/m', ts: 's/s' },
      medium: { id: s.med.id, name: s.med.name, speed: s.v, model: s.med.model, sources: s.med.sources },
      provenance: userParams ? 'hypothetical' : 'derived', simulatedTime: tRef.current,
      observations: { 'frequency (Hz)': s.f, 'wavelength (m)': s.kin?.lambda ?? null, 'speed (m/s)': s.v, ...(fb !== null ? { 'beat frequency (Hz)': fb } : {}) },
      notes, screenshot: shot, dataSources: s.med.sources, randomSeed: null,
    };
    await saveExperiment(e);
    setMsg(`Saved “${e.name}” to the notebook.`);
  };

  return (
    <>
      <Panel id="wave-demos" className="left-panel" title="Wave laboratory">
        <div className="mol-list" role="listbox" aria-label="Wave demonstrations">
          {DEMOS.map((d) => <button key={d.id} role="option" aria-selected={d.id === c.demo} className={d.id === c.demo ? 'active' : ''} onClick={() => setQuery({ demo: d.id, medium: null, f: null, f2: null, A: null, A2: null, ts: null })}><span>{d.label}</span></button>)}
        </div>
        <div className="section-title">Medium</div>
        <select aria-label="Propagation medium" value={c.medium} onChange={(e) => set('medium', e.target.value)} className="text-input">
          {MEDIA.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
        <p className="note" style={{ fontSize: 10.5 }}>{s.med.model}. <SourceLinks ids={s.med.sources} /></p>
        {s.med.validity.map((v) => <p key={v} className="note" style={{ fontSize: 10.5, margin: '2px 0' }}>• {v}</p>)}
      </Panel>

      <div className="center-stage">
        <div className="stage-head"><h1>{demo.label}</h1><p className="note">{demo.model}</p></div>
        {!s.v ? (
          <div className="no-propagation" role="status">
            <strong>No propagation.</strong> {s.med.kind === 'vacuum' ? 'A vacuum has no particles to compress, so mechanical (sound) waves cannot travel. Electromagnetic waves can (Spectral → EM atlas).' : `The medium model has no sourced speed at ${c.T.toFixed(1)} K (outside ${s.med.TrangeK?.join('–')} K). Unknown, not extrapolated.`}
          </div>
        ) : is2D ? (<>
          <Canvas2D c={c} s={s} tRef={tRef} />
          {c.demo === 'interference' && <div className="chip-row" style={{ marginTop: 8 }}><button className={`chip ${c.view === 'field' ? 'active' : ''}`} onClick={() => set('view', null)}>instantaneous field</button><button className={`chip ${c.view === 'intensity' ? 'active' : ''}`} onClick={() => set('view', 'intensity')}>time-averaged intensity</button></div>}
          <p className="note" style={{ fontSize: 10.5 }}>{c.demo === 'interference' ? (c.view === 'intensity' ? 'Brightness = time-averaged intensity relative to one source (0 at dark fringes where Δr = (m + ½)λ, 4 at bright fringes where Δr = mλ). Spreading loss is ignored, so this shows the pattern only.' : 'Colour = instantaneous summed displacement: gold positive, blue negative. Dark radial bands are the nodal lines.') : 'Circles are wavefronts emitted one period apart. They bunch up ahead of the moving source (higher frequency) and spread out behind it (lower).'}</p>
        </>) : (
          <div style={{ position: 'relative', height: 260, borderRadius: 12, overflow: 'hidden', border: '1px solid var(--line)' }}>
            <Viewport camera={{ position: [0, 0, 4.9], fov: 50 }} key={`${c.demo}-${c.wave}-${c.medium}`}><Line1D c={c} s={s} tRef={tRef} fdRef={fdRef} /></Viewport>
          </div>
        )}
        {s.v && !is2D && (
          <div className="stage-grid">
            <div>
              <div className="section-title">Snapshot y(x, t = {formatSig(tRef.current, 4)} s)</div>
              <LinePlot ariaLabel="Displacement versus position" series={[{ points: snapshot, color: '#f5c76b' }]} xLabel="position x (m)" yLabel={c.demo === 'standing' && c.bc !== 'fixed-fixed' ? 'pressure (arb., ∝ p′)' : c.demo === 'pulse' ? 'displacement (arb.)' : 'displacement y (m)'} yDomain={c.demo === 'pulse' ? [-1, 1] : undefined} vLines={[{ x: s.view / 3, label: 'probe' }]} />
            </div>
            <div>
              <div className="section-title">Probe y(t) at x = {formatSig(s.view / 3, 3)} m</div>
              <LinePlot ariaLabel="Displacement versus time at the probe" series={[{ points: hist.current.slice(), color: '#7df9ff' }]} xLabel="simulated time t (s)" yLabel="displacement y (m)" />
            </div>
          </div>
        )}
        {!is2D && s.v && <p className="note" style={{ fontSize: 10.5 }}>{(c.demo === 'traveling' && c.wave === 'longitudinal') || s.med.waveType === 'longitudinal' ? 'Longitudinal: particles move back and forth ALONG the direction of travel. Colour shows compression (warm) and rarefaction (cool).' : 'Transverse: particles move perpendicular to the direction of travel.'} Displacements are exaggerated for display. The plotted values are the true ones.</p>}
      </div>

      <Panel id="wave-params" className="right-panel" title="Parameters & measurements">
        <div className="chip-row" style={{ marginBottom: 6 }}>
          <button className="icon-btn" onClick={() => setRunning((r) => !r)} aria-label={running ? 'Pause wave simulation' : 'Run wave simulation'}>{running ? '❚❚ Pause' : '▶ Run'}</button>
          <button className="icon-btn" onClick={stepOnce} aria-label="Step simulation">Step</button>
          <button className="icon-btn" onClick={reset} aria-label="Reset simulation">Reset</button>
        </div>
        <div className="slider-row"><span>time scale</span><input type="range" min={-6} max={0} step={0.05} value={Math.log10(s.ts)} onChange={(e) => set('ts', Number((10 ** Number(e.target.value)).toPrecision(3)))} aria-label="Playback time scale (log)" /><span style={{ fontFamily: 'var(--mono)', fontSize: 11 }}>{formatSig(s.ts, 2)}×</span></div>
        <p className="note" style={{ fontSize: 10.5, margin: 0 }}>1 s on screen = {formatSig(s.ts, 3)} s simulated (slow motion). The physical speed is set by the medium.</p>
        {c.demo === 'traveling' && <div className="chip-row" style={{ margin: '6px 0' }}>{(['transverse', 'longitudinal'] as const).map((w) => <button key={w} className={`chip ${c.wave === w ? 'active' : ''}`} onClick={() => set('wave', w)} disabled={(w === 'transverse' && s.med.waveType === 'longitudinal') || (w === 'longitudinal' && s.med.waveType === 'transverse')}>{w}</button>)}</div>}
        {c.demo !== 'standing' && <ParamSlider label="frequency f" unit="Hz" value={c.f} min={0.1} max={20000} log onChange={(v) => set('f', v)} aria="Frequency in hertz" />}
        {c.demo === 'standing' && <><ParamSlider label="mode n" unit="" value={c.n} min={1} max={8} step={1} onChange={(v) => set('n', v)} aria="Mode number" /><ParamSlider label="length L" unit="m" value={c.L} min={0.1} max={5} onChange={(v) => set('L', v)} aria="Length in metres" />
          <div className="chip-row" style={{ margin: '6px 0' }}>{(['fixed-fixed', 'open-open', 'open-closed'] as const).map((b) => <button key={b} className={`chip ${c.bc === b ? 'active' : ''}`} onClick={() => set('bc', b)}>{b}</button>)}</div></>}
        <ParamSlider label="amplitude A" unit="m" value={c.A} min={1e-9} max={0.1} log onChange={(v) => set('A', v)} aria="Amplitude in metres" />
        {['traveling', 'superposition', 'attenuation'].includes(c.demo) && <ParamSlider label="phase φ" unit="rad" value={c.phi} min={0} max={TAU} onChange={(v) => set('phi', v)} aria="Phase in radians" />}
        {(c.demo === 'superposition' || c.demo === 'beats') && <>
          <div className="section-title">Second wave</div>
          <ParamSlider label="f₂" unit="Hz" value={c.f2} min={0.1} max={20000} log onChange={(v) => set('f2', v)} aria="Second frequency in hertz" />
          <ParamSlider label="A₂" unit="m" value={c.A2} min={1e-9} max={0.1} log onChange={(v) => set('A2', v)} aria="Second amplitude in metres" />
          <ParamSlider label="φ₂" unit="rad" value={c.phi2} min={0} max={TAU} onChange={(v) => set('phi2', v)} aria="Second phase in radians" />
          <div className="chip-row"><button className={`chip ${c.dir2 === 1 ? 'active' : ''}`} onClick={() => set('dir2', 1)}>same direction</button><button className={`chip ${c.dir2 === -1 ? 'active' : ''}`} onClick={() => set('dir2', -1)}>opposite</button></div>
        </>}
        {c.medium === 'string' && <><ParamSlider label="tension" unit="N" value={c.tension} min={1} max={1000} log onChange={(v) => set('tension', v)} aria="String tension in newtons" /><ParamSlider label="linear density μ" unit="kg/m" value={c.mu} min={1e-4} max={0.1} log onChange={(v) => set('mu', v)} aria="Linear density" /></>}
        {c.medium !== 'string' && c.medium !== 'vacuum' && <ParamSlider label="temperature" unit="K" value={c.T} min={200} max={600} onChange={(v) => set('T', v)} aria="Medium temperature in kelvin" />}
        {c.demo === 'packet' && <div className="chip-row" style={{ margin: '6px 0' }}><button className={`chip ${c.disp === 'linear' ? 'active' : ''}`} onClick={() => set('disp', 'linear')}>non-dispersive ω = vk</button><button className={`chip ${c.disp === 'deep-water' ? 'active' : ''}`} onClick={() => set('disp', 'deep-water')}>deep water ω² = gk</button></div>}
        {c.demo === 'pulse' && <><ParamSlider label="string length" unit="m" value={c.L} min={0.2} max={5} onChange={(v) => set('L', v)} aria="String length in metres" /><div className="chip-row" style={{ margin: '6px 0' }}><button className={`chip ${c.fdbc === 'fixed' ? 'active' : ''}`} onClick={() => set('fdbc', 'fixed')}>fixed ends</button><button className={`chip ${c.fdbc === 'free' ? 'active' : ''}`} onClick={() => set('fdbc', 'free')}>free ends</button></div></>}
        {c.demo === 'doppler' && <ParamSlider label="source speed" unit="m/s" value={c.vs} min={0} max={Math.max(1, (s.v ?? 340) * 0.95)} onChange={(v) => set('vs', v)} aria="Source speed in metres per second" />}
        {c.demo === 'attenuation' && <ParamSlider label="attenuation α" unit="Np/m" value={c.alpha} min={0.01} max={10} log onChange={(v) => set('alpha', v)} aria="Attenuation coefficient" />}
        {c.demo === 'interference' && <ParamSlider label="source separation" unit="λ" value={c.d} min={0.5} max={8} onChange={(v) => set('d', v)} aria="Source separation in wavelengths" />}

        <div className="section-title">Derived quantities <ProvenanceBadge cls="derived" title="From the selected medium and frequency" /></div>
        <dl className="kv" aria-label="Wave quantities">
          <KV k="propagation speed v" v={s.v} unit="m/s" sig={5} title={s.med.model} />
          <KV k="frequency f" v={s.v ? s.f : null} unit="Hz" sig={6} />
          <KV k="period T = 1/f" v={s.kin?.T ?? null} unit="s" sig={5} />
          <KV k="wavelength λ = v/f" v={s.kin?.lambda ?? null} unit="m" sig={5} />
          <KV k="angular frequency ω" v={s.kin?.omega ?? null} unit="rad/s" sig={5} />
          <KV k="wavenumber k" v={s.kin?.k ?? null} unit="rad/m" sig={5} />
          {fb !== null && <KV k="beat frequency |f₁ − f₂|" v={fb} unit="Hz" sig={4} />}
          {c.demo === 'standing' && s.v && <KV k="fundamental f₁" v={modeFrequency(c.bc, 1, c.L, s.v)} unit="Hz" sig={5} />}
          {vel && <><KV k="phase velocity" v={vel.phase} unit="m/s" sig={4} /><KV k="group velocity" v={vel.group} unit="m/s" sig={4} /></>}
          {fd && <KV k="Courant number C = vΔt/Δx" v={courant(fd.v, fd.dt, fd.dx)} sig={3} title="Explicit scheme is stable only for C ≤ 1" />}
          {c.demo === 'doppler' && <><KV k="heard ahead of source" v={dopAhead} unit="Hz" sig={5} /><KV k="heard behind source" v={dopBehind} unit="Hz" sig={5} /></>}
          {c.demo === 'attenuation' && <KV k="amplitude half-distance ln2/α" v={Math.LN2 / c.alpha} unit="m" sig={4} />}
        </dl>
        {fdError && <p className="note warn" role="alert">{fdError}</p>}
        {c.demo === 'attenuation' && <p className="note warn">α is a user-chosen illustrative value. Real absorption depends on frequency, humidity and the material, and none of it is bundled yet.</p>}
        {c.demo === 'standing' && c.bc !== 'fixed-fixed' && <p className="note">Pipes: the plot shows the PRESSURE standing wave. Open ends are pressure nodes, and a closed end is a pressure antinode, so only odd harmonics exist for open–closed.</p>}
        {(c.demo === 'standing' || c.demo === 'traveling') && <p className="note" style={{ fontSize: 10.5 }}>λ is not an independent control. It follows from v = fλ for the chosen medium. To change λ, change f or the medium (tension, density or temperature).</p>}

        <div className="section-title">Save to notebook</div>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Experiment name" aria-label="Wave experiment name" className="text-input" style={{ marginBottom: 6 }} />
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Observations" aria-label="Wave experiment notes" rows={2} className="text-input" style={{ height: 'auto', padding: 8 }} />
        <button className="icon-btn" style={{ marginTop: 6 }} onClick={save}>Save wave experiment</button>
        {msg && <p className="note" role="status">{msg}</p>}
      </Panel>
    </>
  );
}

function ParamSlider({ label, unit, value, min, max, step, log, onChange, aria }: { label: string; unit: string; value: number; min: number; max: number; step?: number; log?: boolean; onChange: (v: number) => void; aria: string }) {
  const [txt, setTxt] = useState(String(value));
  useEffect(() => setTxt(String(value)), [value]);
  const toS = (v: number) => (log ? Math.log10(v) : v), fromS = (v: number) => (log ? 10 ** v : v);
  return (
    <div className="slider-row">
      <span style={{ minWidth: 90 }}>{label}</span>
      <input type="range" min={toS(min)} max={toS(max)} step={step ?? (log ? 0.01 : (max - min) / 200)} value={toS(Math.min(max, Math.max(min, value)))} onChange={(e) => onChange(Number(fromS(Number(e.target.value)).toPrecision(4)))} aria-label={aria} />
      <input value={txt} onChange={(e) => setTxt(e.target.value)} onBlur={() => { const v = Number(txt); if (Number.isFinite(v) && v >= min && v <= max) onChange(v); else setTxt(String(value)); }} aria-label={`${aria} (exact)`} style={{ width: 64, height: 24, borderRadius: 6, border: '1px solid var(--line)', background: 'rgba(255,255,255,0.05)', color: 'var(--text)', padding: '0 4px', fontFamily: 'var(--mono)', fontSize: 11 }} />
      <span style={{ fontSize: 10.5, minWidth: 30 }}>{unit}</span>
    </div>
  );
}
