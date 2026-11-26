/**
 * Molecular dynamics view (Phase 3.2). Positions live in a mutable MD state and are pushed to
 * three.js objects every frame — React re-renders only the ~8 Hz readouts.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { Viewport } from '@/rendering/Viewport';
import { cpkColor } from '@/rendering/colors';
import { KV, Panel, ProvenanceBadge } from '@/ui/components';
import { optimise } from '../laboratory/forcefield';
import { initMD, kineticEnergy, mdStep, temperature, totalEnergy, type MDState, type Thermostat } from '../laboratory/md';
import { vdwAngstrom } from './MoleculeScene';
import { centroid, type MoleculeRecord } from './molecules';

function MDScene({ mol, md, running, dt, fsPerSec, thermostat, onTick }: { mol: MoleculeRecord; md: React.MutableRefObject<MDState>; running: boolean; dt: number; fsPerSec: number; thermostat: Thermostat; onTick: () => void }) {
  const atoms = useRef<(THREE.Mesh | null)[]>([]);
  const bonds = useRef<(THREE.Mesh | null)[]>([]);
  const carry = useRef(0), last = useRef(0);
  const c = useMemo(() => centroid(mol), [mol]);
  const up = useMemo(() => new THREE.Vector3(0, 1, 0), []);
  const tmpA = useMemo(() => new THREE.Vector3(), []), tmpB = useMemo(() => new THREE.Vector3(), []);
  useFrame((_, delta) => {
    const st = md.current;
    if (running) {
      carry.current += fsPerSec * Math.min(delta, 0.1);
      let n = Math.floor(carry.current / dt);
      carry.current -= n * dt;
      n = Math.min(n, 3000);
      for (let k = 0; k < n; k++) mdStep(st, dt, thermostat);
    }
    const x = st.x;
    atoms.current.forEach((m, i) => m?.position.set(x[3 * i] - c[0], x[3 * i + 1] - c[1], x[3 * i + 2] - c[2]));
    mol.bonds.forEach((b, k) => {
      const m = bonds.current[k];
      if (!m) return;
      tmpA.set(x[3 * b.a] - c[0], x[3 * b.a + 1] - c[1], x[3 * b.a + 2] - c[2]);
      tmpB.set(x[3 * b.b] - c[0], x[3 * b.b + 1] - c[1], x[3 * b.b + 2] - c[2]);
      m.position.copy(tmpA).add(tmpB).multiplyScalar(0.5);
      const d = tmpB.sub(tmpA);
      m.scale.set(1, d.length(), 1);
      m.quaternion.setFromUnitVectors(up, d.normalize());
    });
    const now = performance.now();
    if (now - last.current > 120) { last.current = now; onTick(); }
  });
  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[5, 8, 6]} intensity={2.2} />
      {mol.atoms.map((a, i) => (
        <mesh key={i} ref={(m) => { atoms.current[i] = m; }}>
          <sphereGeometry args={[vdwAngstrom(a.Z) * 0.24, 20, 20]} />
          <meshStandardMaterial color={cpkColor(a.Z)} roughness={0.35} />
        </mesh>
      ))}
      {mol.bonds.map((_, k) => (
        <mesh key={k} ref={(m) => { bonds.current[k] = m; }}>
          <cylinderGeometry args={[0.07, 0.07, 1, 10]} />
          <meshStandardMaterial color="#9aa6c8" roughness={0.4} />
        </mesh>
      ))}
      <OrbitControls makeDefault enableDamping />
    </>
  );
}

function Trace({ data, color, label }: { data: number[]; color: string; label: string }) {
  if (data.length < 2) return null;
  const w = 380, h = 54, lo = Math.min(...data), hi = Math.max(...data), span = hi - lo || 1;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} role="img" aria-label={label} style={{ width: '100%' }}>
      <polyline fill="none" stroke={color} strokeWidth={1.4} points={data.map((d, i) => `${((i / (data.length - 1)) * w).toFixed(1)},${(h - 4 - ((d - lo) / span) * (h - 14)).toFixed(1)}`).join(' ')} />
      <text x={4} y={10} fontSize="9" opacity="0.75">{label}: {lo.toPrecision(4)} – {hi.toPrecision(4)}</text>
    </svg>
  );
}

export default function MoleculeDynamics({ mol }: { mol: MoleculeRecord }) {
  const [T, setT] = useState(300);
  const [ensemble, setEnsemble] = useState<'nve' | 'berendsen'>('berendsen');
  const [dt, setDt] = useState(0.25);
  const [fsPerSec, setFsPerSec] = useState(40);
  const [running, setRunning] = useState(true);
  const [, setTick] = useState(0);
  // start from the VGFF-1 minimum so the run begins at equilibrium of the SAME potential
  const relaxed = useMemo(() => optimise({ atoms: mol.atoms, bonds: mol.bonds }, { maxIter: 1500 }).structure, [mol]);
  const md = useRef<MDState>(initMD(relaxed, T, 1));
  const E0 = useRef(totalEnergy(md.current));
  const traces = useRef<{ T: number[]; E: number[] }>({ T: [], E: [] });
  const reset = (temp = T) => { md.current = initMD(relaxed, temp, 1); E0.current = totalEnergy(md.current); traces.current = { T: [], E: [] }; };
  useEffect(() => { reset(); }, [relaxed]); // eslint-disable-line react-hooks/exhaustive-deps
  const thermostat: Thermostat = ensemble === 'nve' ? { kind: 'none' } : { kind: 'berendsen', T, tauFs: 100 };
  const st = md.current;
  const onTick = () => {
    const tr = traces.current;
    tr.T.push(temperature(md.current)); tr.E.push(totalEnergy(md.current));
    if (tr.T.length > 300) { tr.T.shift(); tr.E.shift(); }
    setTick((x) => x + 1);
  };
  const meanT = traces.current.T.length ? traces.current.T.reduce((t, x) => t + x, 0) / traces.current.T.length : null;

  return (
    <>
      <Viewport key={`md-${mol.id}`} camera={{ position: [0, 0, 9], fov: 40 }}>
        <MDScene mol={mol} md={md} running={running} dt={dt} fsPerSec={fsPerSec} thermostat={thermostat} onTick={onTick} />
      </Viewport>
      <Panel id="md-panel" className="right-panel" title="Molecular dynamics">
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
          <ProvenanceBadge cls="simulated" title="Output of an identified physical model" />
          <span className="badge" style={{ color: '#f5c76b' }}>Classical MD · VGFF-1 · qualitative</span>
        </div>
        <h2 style={{ margin: '0 0 6px', fontWeight: 400 }}>{mol.name}</h2>
        <div className="chip-row" style={{ marginBottom: 8 }}>
          <button className="chip active" onClick={() => setRunning((r) => !r)} aria-label={running ? 'Pause dynamics' : 'Run dynamics'}>{running ? '❚❚ Pause' : '▶ Run'}</button>
          <button className="chip" onClick={() => reset()}>Re-initialise at {T} K</button>
        </div>
        <div className="slider-row"><span>Target T</span><input type="range" min={10} max={2000} step={10} value={T} onChange={(e) => setT(Number(e.target.value))} aria-label="Target temperature in kelvin" /><span className="mono">{T} K</span></div>
        <div className="slider-row"><span>Playback</span><input type="range" min={2} max={400} step={2} value={fsPerSec} onChange={(e) => setFsPerSec(Number(e.target.value))} aria-label="Femtoseconds simulated per second" /><span className="mono">{fsPerSec} fs/s</span></div>
        <dl className="kv">
          <dt>Ensemble</dt><dd><select value={ensemble} onChange={(e) => setEnsemble(e.target.value as 'nve' | 'berendsen')} aria-label="Ensemble"><option value="berendsen">Berendsen thermostat (τ 100 fs)</option><option value="nve">NVE (energy conserving)</option></select></dd>
          <dt>Time step</dt><dd><select value={dt} onChange={(e) => setDt(Number(e.target.value))} aria-label="MD time step"><option value={0.1}>0.1 fs</option><option value={0.25}>0.25 fs</option><option value={0.5}>0.5 fs</option><option value={1}>1.0 fs (too large for X–H)</option></select></dd>
          <KV k="Simulated time" v={st.t / 1000} unit="ps" sig={4} />
          <KV k="Instantaneous T" v={temperature(st)} unit="K" sig={4} />
          <KV k="Mean T (window)" v={meanT} unit="K" sig={4} />
          <KV k="Kinetic energy" v={kineticEnergy(st)} unit="kcal/mol" sig={4} />
          <KV k="Potential (strain) energy" v={st.Epot} unit="kcal/mol" sig={4} />
          <KV k={ensemble === 'nve' ? 'Total energy change' : 'Total energy (thermostatted)'} v={totalEnergy(st) - E0.current} unit="kcal/mol" sig={3} />
          <KV k="Degrees of freedom" v={st.dof} />
        </dl>
        <Trace data={traces.current.T} color="#f5c76b" label="Temperature (K)" />
        <Trace data={traces.current.E} color="#b18cff" label="Total energy (kcal/mol)" />
        <p className="note">Velocity Verlet on the VGFF-1 potential, Maxwell–Boltzmann start (seeded), centre-of-mass motion removed. Temperature from equipartition over 3N − 6 degrees of freedom. VGFF-1 force constants are not fitted to vibrational spectra, so frequencies and amplitudes are qualitative; Berendsen coupling does not sample an exact canonical ensemble. In NVE the energy fluctuates (∝ dt²) but does not drift.</p>
      </Panel>
    </>
  );
}
