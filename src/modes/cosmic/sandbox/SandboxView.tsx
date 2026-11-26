/**
 * Cosmic Experiment / Compare environments: an editable Newtonian N-body sandbox that never
 * touches the real (Explore) universe. Scene unit = 1 au (float32-safe to ~10⁻⁷ au ≈ 15 km).
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { Viewport } from '@/rendering/Viewport';
import { TextSprite } from '@/rendering/labels';
import { KV, Panel, ProvenanceBadge } from '@/ui/components';
import { navigate, setQuery, useRoute } from '@/shared/router';
import { useVoyager } from '@/shared/store';
import { formatJdUtc } from '@/core/simulation/clock';
import { heliocentric } from '../solar-system/ephemeris';
import { PRESETS } from './presets';
import { VectorField, PotentialMap } from './instruments';
import { stateToElements } from '@/core/mathematics/kepler';
import { listExperiments, saveExperiment, SANDBOX_SOLVER_VERSION, type Experiment } from '@/shared/notebook';
import { CONSTANTS } from '@/core/constants/constants';
import { cloneState, diagnostics, escapeVelocity, G_KM, lagrangePoints, step, suggestDt, toBarycentric, type Integrator, type SimState } from './nbody';

const AU = 149_597_870.7;
const TRAIL = 600;

interface Live { sim: SimState; initial: SimState; E0: number; L0: number; trails: Map<string, Float32Array>; trailN: Map<string, number>; drift: number[]; modified: boolean; extentAu: number; trailEvery: number; sinceTrail: number }

function makeLive(sim: SimState): Live {
  const d = diagnostics(sim.bodies);
  const extentAu = Math.max(0.05, ...sim.bodies.map((b) => Math.hypot(...b.x.map((x, k) => x - d.com[k])) / AU));
  // trail sampling in SIMULATED time: ~60 samples per shortest orbit, independent of frame rate
  const trailEvery = suggestDt(sim.bodies, 0.002) / 0.002 / 60;
  return { sim, initial: cloneState(sim), E0: d.E, L0: Math.hypot(...d.L), trails: new Map(), trailN: new Map(), drift: [0], modified: false, extentAu, trailEvery, sinceTrail: 0 };
}

function pushTrails(L: Live) {
  for (const b of L.sim.bodies) {
    let tr = L.trails.get(b.id);
    if (!tr) { tr = new Float32Array(TRAIL * 3); L.trails.set(b.id, tr); L.trailN.set(b.id, 0); }
    const n = L.trailN.get(b.id)!;
    const p = [b.x[0] / AU, b.x[2] / AU, -b.x[1] / AU];
    if (n < TRAIL) { tr.set(p, n * 3); L.trailN.set(b.id, n + 1); } else { tr.copyWithin(0, 3); tr.set(p, (TRAIL - 1) * 3); }
  }
}

const MAX_STEPS_PER_FRAME = 4000;

function SimScene({ live, running, dt, speedDaysPerSec, integrator, showL, lPair, compare, jd0, onTick, achieved, showVectors, showField }: {
  live: React.MutableRefObject<Live>; running: boolean; dt: number; speedDaysPerSec: number; integrator: Integrator; showL: boolean; lPair: [string, string] | null; compare: boolean; jd0: number; onTick: () => void; showVectors: boolean; showField: boolean;
  achieved: React.MutableRefObject<{ rate: number; capped: boolean }>;
}) {
  const groups = useRef(new Map<string, THREE.Group>());
  const lines = useRef(new Map<string, THREE.Line>());
  const ghosts = useRef(new Map<string, THREE.Mesh>());
  const lMarkers = useRef<THREE.Group>(null);
  const last = useRef(0);
  const [, force] = useState(0);
  const ids = live.current.sim.bodies.map((b) => b.id).join('|');

  const carry = useRef(0);
  useFrame((_, delta) => {
    const L = live.current;
    if (running) {
      // honour wall-clock time: simulated seconds owed this frame, integrated in whole fixed steps
      carry.current += speedDaysPerSec * 86400 * Math.min(delta, 0.25);
      let n = Math.floor(carry.current / dt);
      const capped = n > MAX_STEPS_PER_FRAME;
      if (capped) { n = MAX_STEPS_PER_FRAME; carry.current = 0; } else carry.current -= n * dt;
      for (let k = 0; k < n; k++) {
        step(L.sim, dt, integrator);
        L.sinceTrail += dt;
        if (L.sinceTrail >= L.trailEvery) { L.sinceTrail = 0; pushTrails(L); }
      }
      achieved.current = { rate: delta > 0 ? (n * dt) / 86400 / delta : 0, capped };
      const d = diagnostics(L.sim.bodies);
      L.drift.push((d.E - L.E0) / Math.abs(L.E0));
      if (L.drift.length > 400) L.drift.shift();
    }
    // place bodies (y-up scene: physics z → scene y)
    for (const b of L.sim.bodies) {
      const g = groups.current.get(b.id);
      if (g) g.position.set(b.x[0] / AU, b.x[2] / AU, -b.x[1] / AU);
      const line = lines.current.get(b.id);
      const tr = L.trails.get(b.id);
      if (line && tr) {
        const attr = line.geometry.getAttribute('position') as THREE.BufferAttribute;
        (attr.array as Float32Array).set(tr);
        attr.needsUpdate = true;
        line.geometry.setDrawRange(0, L.trailN.get(b.id) ?? 0);
      }
      const gh = ghosts.current.get(b.id);
      if (gh) {
        gh.visible = compare;
        if (compare) {
          // reference: Explore ephemeris at the same simulated time, shifted to the simulated Sun (heliocentric comparison)
          const sun = L.sim.bodies.find((x) => x.id === 'sun');
          const ref = heliocentric(b.id === 'earth' ? 'earth' : b.id, jd0 + L.sim.t / 86400);
          const o = sun ? sun.x : [0, 0, 0];
          gh.position.set((ref[0] + o[0]) / AU, (ref[2] + o[2]) / AU, -(ref[1] + o[1]) / AU);
        }
      }
    }
    if (lMarkers.current) {
      lMarkers.current.visible = showL && !!lPair;
      if (showL && lPair) {
        const p = L.sim.bodies.find((b) => b.id === lPair[0]), s = L.sim.bodies.find((b) => b.id === lPair[1]);
        if (p && s) lagrangePoints(p, s).forEach((pt, i) => lMarkers.current!.children[i]?.position.set(pt.x[0] / AU, pt.x[2] / AU, -pt.x[1] / AU));
      }
    }
    const now = performance.now();
    if (now - last.current > 120) { last.current = now; onTick(); }
  });

  useEffect(() => { force((x) => x + 1); }, [ids]);
  const bodies = live.current.sim.bodies;
  const ext = live.current.extentAu;
  const size = (m: number) => ext * (m > 1e29 ? 0.03 : m > 1e26 ? 0.018 : m > 1e23 ? 0.012 : 0.007);
  // one trail line per body, rebuilt only when the set of bodies changes; GPU buffers disposed on change
  const trailObjs = useMemo(() => {
    const m = new Map<string, THREE.Line>();
    for (const b of bodies) {
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(TRAIL * 3), 3));
      const l = new THREE.Line(g, new THREE.LineBasicMaterial({ color: b.color || '#888', transparent: true, opacity: 0.55 }));
      l.frustumCulled = false;
      m.set(b.id, l);
    }
    lines.current = m;
    return m;
  }, [ids]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => { for (const l of trailObjs.values()) { l.geometry.dispose(); (l.material as THREE.Material).dispose(); } }, [trailObjs]);
  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[0, 0, 0]} intensity={2} decay={0} />
      <gridHelper args={[Math.ceil(ext * 3) * 2, Math.ceil(ext * 3) * 2, '#1c2a4a', '#0e1630']} />
      <FrameCamera extent={ext} />
      {showVectors && <VectorField getSim={() => live.current.sim} extentAu={ext} />}
      {showField && <PotentialMap getSim={() => live.current.sim} extentAu={ext} />}
      {bodies.map((b) => (
        <group key={b.id}>
          <group ref={(g) => { if (g) groups.current.set(b.id, g); else groups.current.delete(b.id); }}>
            <mesh><sphereGeometry args={[size(b.mass), 20, 20]} /><meshBasicMaterial color={b.color || '#ccc'} /></mesh>
            <TextSprite text={b.name} position={[ext * 0.025, ext * 0.025, 0]} height={ext * 0.035} color="#c9d1e8" />
          </group>
          {trailObjs.get(b.id) && <primitive object={trailObjs.get(b.id)!} />}
          {b.id !== 'sun' && (
            <mesh ref={(m) => { if (m) ghosts.current.set(b.id, m); else ghosts.current.delete(b.id); }} visible={false}>
              <sphereGeometry args={[ext * 0.016, 12, 12]} /><meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.6} />
            </mesh>
          )}
        </group>
      ))}
      <group ref={lMarkers} visible={false}>
        {['L1', 'L2', 'L3', 'L4', 'L5'].map((n) => (
          <group key={n}><mesh><octahedronGeometry args={[ext * 0.018]} /><meshBasicMaterial color="#b18cff" /></mesh><TextSprite text={n} position={[ext * 0.03, ext * 0.03, 0]} height={ext * 0.04} color="#b18cff" /></group>
        ))}
      </group>
      <OrbitControls makeDefault enableDamping />
    </>
  );
}

/** Re-frame the camera whenever the system (and therefore its extent) changes. */
function FrameCamera({ extent }: { extent: number }) {
  const { camera } = useThree();
  useEffect(() => { camera.position.set(0, extent * 2.2, extent * 1.4); camera.lookAt(0, 0, 0); }, [extent, camera]);
  return null;
}

function DriftPlot({ drift }: { drift: number[] }) {
  if (drift.length < 2) return null;
  const w = 380, h = 60, m = Math.max(1e-16, ...drift.map(Math.abs));
  return (
    <svg viewBox={`0 0 ${w} ${h}`} role="img" aria-label="Relative energy error over recent steps" style={{ width: '100%' }}>
      <line x1={0} x2={w} y1={h / 2} y2={h / 2} stroke="rgba(255,255,255,0.15)" />
      <polyline fill="none" stroke="#b18cff" strokeWidth={1.5} points={drift.map((d, i) => `${((i / (drift.length - 1)) * w).toFixed(1)},${(h / 2 - (d / m) * (h / 2 - 4)).toFixed(1)}`).join(' ')} />
      <text x={4} y={11} fontSize="9" opacity="0.7">ΔE/E (±{m.toExponential(1)})</text>
    </svg>
  );
}

export default function SandboxView() {
  const { query } = useRoute();
  const compare = query.get('mode') === 'compare';
  const jdNow = useVoyager((s) => s.clock.jd);
  const [presetId, setPresetId] = useState(query.get('preset') ?? 'inner');
  const preset = PRESETS.find((p) => p.id === presetId) ?? PRESETS[0];
  const [jd0, setJd0] = useState(jdNow);
  const live = useRef<Live>(makeLive(preset.build(jdNow)));
  const [running, setRunning] = useState(false);
  const [integrator, setIntegrator] = useState<Integrator>('yoshida4');
  const [dt, setDt] = useState(() => suggestDt(live.current.sim.bodies));
  const [speed, setSpeed] = useState(30); // simulated days per real second (approx)
  const [showL, setShowL] = useState(false);
  const [lPair, setLPair] = useState<[string, string] | null>(null);
  const [, setTick] = useState(0);
  const [sel, setSel] = useState<string | null>(null);
  const [form, setForm] = useState({ name: 'New planet', massEarths: 1, au: 1.5, circular: true });
  const [showVectors, setShowVectors] = useState(false);
  const [showField, setShowField] = useState(false);
  const [measureB, setMeasureB] = useState<string>('');
  const [expName, setExpName] = useState('');
  const [expNotes, setExpNotes] = useState('');
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const expId = query.get('exp');

  const reset = (id = presetId) => {
    const p = PRESETS.find((x) => x.id === id)!;
    const sim = p.build(jdNow);
    live.current = makeLive(sim);
    setJd0(jdNow); setDt(suggestDt(sim.bodies)); setRunning(false); setSel(null);
    const bodies = sim.bodies;
    setLPair(bodies.length >= 2 ? [bodies.reduce((a, b) => (b.mass > a.mass ? b : a)).id, bodies.filter((b) => b.mass < bodies.reduce((x, y) => Math.max(x, y.mass), 0)).sort((a, b) => b.mass - a.mass)[0]?.id ?? bodies[1].id] : null);
  };
  useEffect(() => { if (!expId) reset(presetId); }, [presetId]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!expId) return;
    listExperiments().then((all) => {
      const e = all.find((x) => x.id === expId);
      if (!e) return;
      live.current = makeLive(cloneState(e.saved));
      live.current.initial = cloneState(e.initial);
      live.current.modified = e.provenance === 'hypothetical';
      setPresetId(e.presetId); setJd0(e.epochJd); setDt(e.solver.dt); setIntegrator(e.solver.integrator as Integrator); setRunning(false);
      setExpName(e.name); setExpNotes(e.notes);
      setSavedMsg(`Restored “${e.name}” at t = ${(e.saved.t / 86400 / 365.25).toFixed(3)} yr. “Restart from initial conditions” re-runs it reproducibly.`);
    });
  }, [expId]); // eslint-disable-line react-hooks/exhaustive-deps
  const restartFromInitial = () => { const init = cloneState(live.current.initial); const mod = live.current.modified; live.current = makeLive(init); live.current.initial = cloneState(init); live.current.modified = mod; setRunning(false); setTick((t) => t + 1); };
  const saveExp = async () => {
    const Ld = live.current, dd = diagnostics(Ld.sim.bodies);
    const canvas = document.querySelector<HTMLCanvasElement>('.viewport canvas');
    const e: Experiment = {
      id: `exp-${Date.now().toString(36)}`, name: expName.trim() || `${preset.name} @ ${(Ld.sim.t / 86400 / 365.25).toFixed(2)} yr`, mode: 'gravitational-sandbox', createdAt: new Date().toISOString(),
      solver: { module: 'gravitational', integrator, dt, version: SANDBOX_SOLVER_VERSION }, presetId, epochJd: jd0,
      provenance: Ld.modified || preset.provenance === 'hypothetical' ? 'hypothetical' : 'derived',
      initial: cloneState(Ld.initial), saved: cloneState(Ld.sim), events: [...Ld.sim.events], notes: expNotes,
      observations: { simYears: Ld.sim.t / 86400 / 365.25, relEnergyError: (dd.E - Ld.E0) / Math.abs(Ld.E0), relAngMomError: Math.hypot(...dd.L) / Ld.L0 - 1, bodies: Ld.sim.bodies.length },
      graphs: { energyDrift: [...Ld.drift] }, screenshot: canvas ? canvas.toDataURL('image/png') : null,
      dataSources: preset.provenance === 'derived' ? ['JPL Keplerian elements (Table 1) / ELP-2000 lunar theory via the Explore ephemerides', 'NASA NSSDC & JPL SSD physical data (masses)'] : ['Textbook configuration (hypothetical)'],
    };
    await saveExperiment(e);
    setSavedMsg(`Saved “${e.name}” to the notebook.`);
  };

  const L = live.current;
  const d = diagnostics(L.sim.bodies);
  const achieved = useRef({ rate: 0, capped: false });
  const relE = (d.E - L.E0) / Math.abs(L.E0);
  const relL = Math.hypot(...d.L) / L.L0 - 1;
  const selected = L.sim.bodies.find((b) => b.id === sel) ?? null;
  /**
   * After any edit: re-centre on the barycentre (an instantaneous mass change or insertion is not a physical
   * process and would otherwise give the whole system a net drift), then restart the conservation baselines.
   */
  const markModified = () => {
    L.sim.bodies = toBarycentric(L.sim.bodies);
    L.sim.events.push(`t = ${(L.sim.t / 86400).toFixed(1)} d: frame re-centred on the new barycentre; conservation baselines reset.`);
    L.modified = true; L.E0 = diagnostics(L.sim.bodies).E; L.L0 = Math.hypot(...diagnostics(L.sim.bodies).L) || 1; L.drift = [0];
    L.trails.clear(); L.trailN.clear();
    // every edit becomes the new initial-conditions checkpoint, so a restart reproduces the edited run exactly
    L.initial = cloneState(L.sim);
  };
  const primary = L.sim.bodies.reduce((a, b) => (b.mass > a.mass ? b : a), L.sim.bodies[0]);
  const divergence = useMemo(() => compare && preset.provenance === 'derived' ? L.sim.bodies.filter((b) => b.id !== 'sun').map((b) => {
    const sun = L.sim.bodies.find((x) => x.id === 'sun');
    if (!sun) return null;
    const ref = heliocentric(b.id, jd0 + L.sim.t / 86400);
    const sim = b.x.map((x, k) => x - sun.x[k]);
    return { name: b.name, au: Math.hypot(sim[0] - ref[0], sim[1] - ref[1], sim[2] - ref[2]) / AU };
  }).filter(Boolean) as { name: string; au: number }[] : [], [compare, preset.provenance, L.sim.t, L.sim.bodies, jd0]);

  const addBody = () => {
    // deterministic placement: golden-angle sequence by body count (reproducible; logged)
    const r = form.au * AU, ang = (L.sim.bodies.length * 2.399963229728653) % (2 * Math.PI);
    const x = [primary.x[0] + r * Math.cos(ang), primary.x[1] + r * Math.sin(ang), primary.x[2]];
    const vc = form.circular ? Math.sqrt((G_KM * primary.mass) / r) : 0;
    const v = [primary.v[0] - vc * Math.sin(ang), primary.v[1] + vc * Math.cos(ang), primary.v[2]];
    L.sim.bodies.push({ id: `user-${Date.now().toString(36)}`, name: form.name, mass: form.massEarths * 5.972e24, radius: 6371 * Math.cbrt(form.massEarths), color: '#ff7a90', x, v });
    L.sim.events.push(`t = ${(L.sim.t / 86400).toFixed(1)} d: added ${form.name} (${form.massEarths} M⊕) at ${form.au} au, ${form.circular ? 'circular orbit' : 'at rest'} around ${primary.name}, angle ${(ang * 180 / Math.PI).toFixed(0)}°.`);
    markModified(); setTick((t) => t + 1);
  };

  return (
    <>
      <Viewport camera={{ position: [0, 9, 6], fov: 45, near: 0.001, far: 2000 }}>
        <color attach="background" args={['#020309']} />
        <SimScene live={live} running={running} dt={dt} speedDaysPerSec={speed} achieved={achieved} integrator={integrator} showL={showL} lPair={lPair} compare={compare} jd0={jd0} onTick={() => setTick((t) => t + 1)} showVectors={showVectors} showField={showField} />
      </Viewport>

      <nav className="view-switch" aria-label="Cosmic environment">
        <button onClick={() => navigate('/cosmic')}>Explore</button>
        <button className={!compare ? 'active' : ''} onClick={() => setQuery({ mode: null })}>Experiment</button>
        <button className={compare ? 'active' : ''} onClick={() => setQuery({ mode: 'compare' })}>Compare</button>
      </nav>

      <Panel id="sandbox-setup" className="left-panel" title="Gravitational sandbox">
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
          <ProvenanceBadge cls={L.modified || preset.provenance === 'hypothetical' ? 'hypothetical' : 'derived'} title={L.modified ? 'Modified by you — no longer the real solar system' : preset.description} />
          <span className="badge" style={{ color: 'var(--text-dim)' }}>Newtonian N-body · never alters Explore</span>
        </div>
        <label className="note" htmlFor="preset">Initial conditions</label>
        <select id="preset" value={presetId} onChange={(e) => { setPresetId(e.target.value); setQuery({ preset: e.target.value }); }} style={{ width: '100%' }}>
          {PRESETS.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <p className="note">{preset.description}{preset.provenance === 'derived' && ` Epoch ${formatJdUtc(jd0)}.`}</p>

        <div className="chip-row" style={{ margin: '8px 0' }}>
          <button className="chip active" onClick={() => setRunning((r) => !r)} aria-label={running ? 'Pause simulation' : 'Run simulation'}>{running ? '❚❚ Pause' : '▶ Run'}</button>
          <button className="chip" onClick={() => { for (let k = 0; k < 10; k++) step(L.sim, dt, integrator); setTick((t) => t + 1); }}>Step ×10</button>
          <button className="chip" onClick={() => reset()}>Reset</button>
        </div>
        <div className="slider-row"><span>Speed</span><input type="range" min={1} max={2000} step={1} value={speed} onChange={(e) => setSpeed(Number(e.target.value))} aria-label="Simulated days per second" /><span className="mono">{speed} d/s</span></div>
        <dl className="kv">
          <dt>Integrator</dt><dd><select value={integrator} onChange={(e) => setIntegrator(e.target.value as Integrator)} aria-label="Integrator"><option value="yoshida4">Yoshida 4th-order (symplectic)</option><option value="leapfrog">Leapfrog KDK (symplectic, 2nd)</option></select></dd>
          <dt>Time step</dt><dd><input type="number" value={(dt / 3600).toFixed(3)} step={0.5} min={0.001} onChange={(e) => setDt(Math.max(1, Number(e.target.value) * 3600))} aria-label="Time step in hours" style={{ width: 90 }} /> h</dd>
          <KV k="Suggested step" v={suggestDt(L.sim.bodies) / 3600} unit="h" sig={3} title="0.2 % of the shortest pairwise orbital period" />
          <KV k="Achieved rate" v={running ? `${achieved.current.rate.toFixed(0)} d/s${achieved.current.capped ? ' (capped by computation budget)' : ''}` : '—'} />
        </dl>

        <div className="section-title">Bodies ({L.sim.bodies.length})</div>
        <div className="mol-list">
          {L.sim.bodies.map((b) => (
            <button key={b.id} className={b.id === sel ? 'active' : ''} onClick={() => setSel(b.id)}>
              <span><span style={{ color: b.color }}>●</span> {b.name}</span><span className="f">{(b.mass / 5.972e24).toPrecision(3)} M⊕</span>
            </button>
          ))}
        </div>
        {selected && (
          <div style={{ marginTop: 8 }}>
            <div className="slider-row"><span>Mass ×</span>
              {[0.1, 0.5, 2, 10].map((f) => <button key={f} className="chip" onClick={() => { selected.mass *= f; L.sim.events.push(`t = ${(L.sim.t / 86400).toFixed(1)} d: ${selected.name} mass ×${f}.`); markModified(); setTick((t) => t + 1); }}>×{f}</button>)}
            </div>
            <div className="chip-row">
              <button className="chip" onClick={() => { L.sim.bodies = L.sim.bodies.filter((b) => b.id !== selected.id); L.sim.events.push(`t = ${(L.sim.t / 86400).toFixed(1)} d: removed ${selected.name}.`); markModified(); setSel(null); }}>Remove {selected.name}</button>
              {selected.id !== primary.id && <button className="chip" onClick={() => { setLPair([primary.id, selected.id]); setShowL(true); }}>Lagrange points with {primary.name}</button>}
            </div>
          </div>
        )}
        <div className="section-title">Add a body</div>
        <div className="kv" style={{ gridTemplateColumns: 'auto 1fr' }}>
          <dt>Name</dt><dd><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} aria-label="New body name" style={{ width: 140 }} /></dd>
          <dt>Mass (M⊕)</dt><dd><input type="number" value={form.massEarths} min={0.0001} step={0.5} onChange={(e) => setForm({ ...form, massEarths: Number(e.target.value) })} aria-label="New body mass in Earth masses" style={{ width: 90 }} /></dd>
          <dt>Distance (au)</dt><dd><input type="number" value={form.au} min={0.05} step={0.1} onChange={(e) => setForm({ ...form, au: Number(e.target.value) })} aria-label="Distance from primary in au" style={{ width: 90 }} /></dd>
          <dt>Circular orbit</dt><dd><input type="checkbox" checked={form.circular} onChange={(e) => setForm({ ...form, circular: e.target.checked })} /></dd>
        </div>
        <button className="icon-btn" onClick={addBody} style={{ marginTop: 6 }}>+ Add around {primary?.name}</button>

        <div className="section-title">Notebook</div>
        <input value={expName} onChange={(e) => setExpName(e.target.value)} placeholder="Experiment name" aria-label="Experiment name" style={{ width: '100%', height: 28, marginBottom: 6, padding: '0 8px', borderRadius: 8, border: '1px solid var(--line)', background: 'rgba(255,255,255,0.05)', color: 'var(--text)' }} />
        <textarea value={expNotes} onChange={(e) => setExpNotes(e.target.value)} placeholder="Notes and observations" aria-label="Experiment notes" rows={3} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid var(--line)', background: 'rgba(255,255,255,0.05)', color: 'var(--text)', font: 'inherit', fontSize: 12 }} />
        <div className="chip-row" style={{ marginTop: 6 }}>
          <button className="chip" onClick={saveExp}>Save experiment</button>
          <button className="chip" onClick={restartFromInitial} title="Re-run from the stored initial conditions (deterministic)">Restart from initial conditions</button>
          <button className="chip" onClick={() => navigate('/notebook')}>Open notebook →</button>
        </div>
        {savedMsg && <p className="note" role="status">{savedMsg}</p>}
      </Panel>

      <Panel id="sandbox-diag" className="right-panel" title={compare ? 'Compare · reference vs simulation' : 'Conservation & instruments'}>
        <dl className="kv">
          <KV k="Simulated time" v={L.sim.t / 86400 / 365.25} unit="yr" sig={5} />
          <KV k="Relative energy error ΔE/E" v={relE} sig={3} />
          <KV k="Angular momentum error ΔL/L" v={relL} sig={3} />
          <KV k="Total momentum |p|" v={Math.hypot(...d.p)} unit="kg·km/s" sig={3} />
          <KV k="Collision energy dissipated" v={L.sim.dissipated * 1e6} unit="J" sig={3} />
        </dl>
        <DriftPlot drift={L.drift} />
        <p className="note">Symplectic integrators keep energy error bounded and oscillating (no secular drift) for fixed steps; a growing error means the step is too large for a close encounter.</p>

        {selected && (
          <>
            <div className="section-title">Instruments · {selected.name}</div>
            <dl className="kv">
              <KV k="Speed (barycentric)" v={Math.hypot(...selected.v)} unit="km/s" sig={4} />
              <KV k="Distance from primary" v={Math.hypot(...selected.x.map((x, k) => x - primary.x[k])) / AU} unit="au" sig={5} />
              <KV k="Surface escape velocity" v={escapeVelocity(selected.mass, selected.radius)} unit="km/s" sig={4} />
              {selected.id !== primary.id && <KV k={`Escape velocity from ${primary.name} here`} v={escapeVelocity(primary.mass, Math.hypot(...selected.x.map((x, k) => x - primary.x[k])))} unit="km/s" sig={4} />}
            </dl>
          </>
        )}
        {selected && selected.id !== primary.id && (() => {
          const r = selected.x.map((x, k) => x - primary.x[k]) as [number, number, number];
          const v = selected.v.map((x, k) => x - primary.v[k]) as [number, number, number];
          const el = stateToElements(r, v, G_KM * (primary.mass + selected.mass));
          return (
            <>
              <div className="section-title">Orbital analyser · {selected.name} about {primary.name}</div>
              <dl className="kv">
                <KV k="Semi-major axis" v={el.e < 1 ? el.a / AU : null} unit="au" sig={6} />
                <KV k="Eccentricity" v={el.e} sig={4} />
                <KV k="Inclination (to sim frame)" v={el.i} unit="°" sig={4} />
                <KV k="Period" v={el.period ? el.period / 86400 : null} unit="d" sig={6} />
                <KV k="Periapsis / apoapsis" v={`${(el.rPeri / AU).toFixed(4)} / ${el.rApo ? (el.rApo / AU).toFixed(4) : '∞ (unbound)'}`} unit="au" />
                <KV k="Specific orbital energy" v={el.energy} unit="km²/s²" sig={4} />
              </dl>
              <p className="note">Osculating two-body elements from the instantaneous state vector (μ = G(M + m)); they evolve as other bodies perturb the orbit.</p>
            </>
          );
        })()}
        {selected && (
          <>
            <div className="section-title">Measure</div>
            <label className="note" style={{ display: 'flex', gap: 6, alignItems: 'center' }}>{selected.name} ↔
              <select value={measureB} onChange={(e) => setMeasureB(e.target.value)} aria-label="Second body to measure to">
                <option value="">choose…</option>
                {L.sim.bodies.filter((b) => b.id !== selected.id).map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </label>
            {(() => { const B = L.sim.bodies.find((b) => b.id === measureB); if (!B) return null; const dKm = Math.hypot(...selected.x.map((x, k) => x - B.x[k])); return (
              <dl className="kv">
                <KV k="Distance" v={dKm / AU} unit="au" sig={6} />
                <KV k="Relative speed" v={Math.hypot(...selected.v.map((x, k) => x - B.v[k]))} unit="km/s" sig={5} />
                <KV k="Light time" v={(dKm * 1000) / CONSTANTS.c.value / 60} unit="min" sig={4} />
              </dl>
            ); })()}
          </>
        )}
        <div className="section-title">Overlays</div>
        <label className="toggle-row" style={{ borderBottom: 0 }}><span>Velocity (cyan) & acceleration (gold) vectors</span><input type="checkbox" checked={showVectors} onChange={(e) => setShowVectors(e.target.checked)} aria-label="Show vectors" /></label>
        <label className="toggle-row" style={{ borderBottom: 0 }}><span>Gravitational potential map (log Φ, contours 0.25 dex)</span><input type="checkbox" checked={showField} onChange={(e) => setShowField(e.target.checked)} aria-label="Show potential map" /></label>
        <label className="toggle-row" style={{ borderBottom: 0 }}><span>Show Lagrange points{lPair ? ` (${L.sim.bodies.find((b) => b.id === lPair[0])?.name}–${L.sim.bodies.find((b) => b.id === lPair[1])?.name})` : ''}</span><input type="checkbox" checked={showL} onChange={(e) => setShowL(e.target.checked)} /></label>

        {compare && (
          <>
            <div className="section-title">Divergence from the Explore ephemeris</div>
            {preset.provenance !== 'derived' ? <p className="note">This preset is hypothetical — there is no real reference to compare against.</p> : (
              <>
                <table className="table-mini"><thead><tr><th>Body</th><th>|sim − reference| (au)</th></tr></thead>
                  <tbody>{divergence.map((r) => <tr key={r.name}><td>{r.name}</td><td>{r.au.toExponential(2)}</td></tr>)}</tbody></table>
                <p className="note">White wireframe markers show where the reference (JPL-element) model places each body. {L.modified ? 'Your modifications make the simulation diverge — that is the experiment.' : 'Unmodified, the two agree to ~10⁻³ au over years (the residual is the difference between Newtonian N-body and the JPL fitted elements).'}</p>
              </>
            )}
          </>
        )}

        <div className="section-title">Event log</div>
        <ul className="note" style={{ paddingLeft: 16, margin: 0, maxHeight: 120, overflow: 'auto' }}>
          {L.sim.events.length ? L.sim.events.slice(-12).map((e, i) => <li key={i}>{e}</li>) : <li>No events yet.</li>}
        </ul>
        <p className="note" style={{ marginTop: 8 }}>Model: Newtonian point masses (G = CODATA 2018); collisions = perfectly inelastic mergers. Not valid near compact objects or at relativistic speeds.</p>
      </Panel>
    </>
  );
}
