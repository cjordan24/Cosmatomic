/**
 * 3D atomic representations. All are driven by AtomState (shared data).
 *   shell   — EDUCATIONAL shell model (animated; electrons are NOT on trajectories)
 *   cloud   — probability density of every occupied subshell (hydrogenic + Slater Z_eff approximation)
 *   orbital — a single analytic ψ_nlm with phase colouring; excitation/emission for one-electron systems
 *   nucleus — schematic nucleon packing, R = r₀A^(1/3), r₀ = 1.2 fm
 *   size    — comparative van der Waals radii
 */
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { TextSprite } from '@/rendering/labels';
import * as THREE from 'three';
import { PointCloud } from '@/rendering/PointCloud';
import { cpkColor, PHASE_NEG, PHASE_POS } from '@/rendering/colors';
import { mulberry32, seedFromString } from '@/core/simulation/random';
import { useVoyager } from '@/shared/store';
import { radiusEnclosing, type OrbitalId } from '../orbitals/hydrogenic';
import { useOrbitalSamples } from '../orbitals/useOrbitalSamples';
import { L_LETTER, subshellLabel } from './configuration';
import { ELEMENTS } from './elements';
import type { AtomState } from './useAtomState';

export type AtomView = 'shell' | 'cloud' | 'orbital' | 'nucleus' | 'size';

const L_COLORS: [number, number, number][] = [[0.45, 0.95, 1.0], [0.35, 0.6, 1.0], [0.35, 1.0, 0.75], [1.0, 0.55, 0.9]];

// ------------------------------------------------------------------ shell model (educational)
function ShellModel({ st }: { st: AtomState }) {
  const reduced = useVoyager((s) => s.settings.reducedMotion);
  const group = useRef<THREE.Group>(null);
  const electrons = useMemo(() => st.shells.flatMap((count, i) => Array.from({ length: count }, (_, k) => ({ shell: i, phase: (k / count) * Math.PI * 2, tilt: (i * 0.7) % Math.PI }))), [st.shells]);
  const radius = (i: number) => 0.9 + i * 0.75;
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  useFrame(({ clock }) => {
    const t = reduced ? 0 : clock.elapsedTime;
    electrons.forEach((e, i) => {
      const m = refs.current[i];
      if (!m) return;
      const w = 0.6 / Math.sqrt(e.shell + 1);
      const a = e.phase + t * w;
      m.position.set(radius(e.shell) * Math.cos(a), 0, radius(e.shell) * Math.sin(a));
    });
    if (group.current && !reduced) group.current.rotation.y = t * 0.05;
  });
  return (
    <group ref={group} rotation={[0.45, 0, 0]}>
      <mesh><sphereGeometry args={[0.32, 32, 32]} /><meshStandardMaterial color="#ff9a6b" emissive="#ff6b3d" emissiveIntensity={0.6} /></mesh>
      <TextSprite text={`${st.protons}p⁺ ${st.neutrons ?? '?'}n`} position={[0, -0.55, 0]} height={0.2} />
      {st.shells.map((count, i) => (
        <group key={i}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[radius(i) - 0.006, radius(i) + 0.006, 128]} /><meshBasicMaterial color="#3aa8ff" transparent opacity={0.5} side={THREE.DoubleSide} /></mesh>
          <TextSprite text={`n=${i + 1}: ${count}e⁻`} position={[radius(i) * 0.7071, 0.12, radius(i) * 0.7071]} height={0.17} color="#9aa6c8" />
        </group>
      ))}
      {electrons.map((_, i) => (
        <mesh key={i} ref={(m) => { refs.current[i] = m; }}><sphereGeometry args={[0.07, 16, 16]} /><meshBasicMaterial color="#7df9ff" /></mesh>
      ))}
    </group>
  );
}

// ------------------------------------------------------------------ probability cloud (approximate)
function cloudRequest(st: AtomState, seed: number) {
  const orbitals: { o: OrbitalId; Z: number; weight: number }[] = [];
  for (const s of st.config) {
    const z = st.electrons === 1 ? st.protons : st.zeff.get(`${s.n},${s.l}`) ?? 1;
    for (let m = -s.l; m <= s.l; m++) orbitals.push({ o: { n: s.n, l: s.l, m }, Z: z, weight: s.electrons / (2 * s.l + 1) });
  }
  return { orbitals, count: Math.min(60000, 14000 + st.electrons * 500), seed };
}

export function ProbabilityCloud({ st, opacity, crossSection }: { st: AtomState; opacity: number; crossSection: boolean }) {
  const req = useMemo(() => (st.electrons > 0 ? cloudRequest(st, seedFromString(`${st.element.symbol}${st.charge}`)) : null), [st]);
  const res = useOrbitalSamples(req);
  const fit = useMemo(() => {
    if (!req) return 1;
    const rMax = Math.max(...req.orbitals.map(({ o, Z }) => radiusEnclosing(o.n, o.l, Z, 0.95)));
    return 3 / rMax;
  }, [req]);
  const data = useMemo(() => {
    if (!res || !req) return null;
    const n = res.phase.length;
    const pos: number[] = [], col: number[] = [];
    for (let i = 0; i < n; i++) {
      const y = res.positions[3 * i + 1] * fit;
      if (crossSection && Math.abs(y) > 0.12) continue;
      pos.push(res.positions[3 * i], res.positions[3 * i + 1], res.positions[3 * i + 2]);
      col.push(...L_COLORS[req.orbitals[res.source[i]].o.l]);
    }
    return { positions: new Float32Array(pos), colors: new Float32Array(col) };
  }, [res, req, fit, crossSection]);
  if (!st.electrons || !data) return null; // status text is shown in the DOM overlay (ElementView)
  return (
    <group>
      <PointCloud positions={data.positions} colors={data.colors} size={crossSection ? 0.09 : 0.06} opacity={opacity} scale={fit} />
      <mesh><sphereGeometry args={[0.035, 12, 12]} /><meshBasicMaterial color="#ffffff" /></mesh>
    </group>
  );
}

// ------------------------------------------------------------------ single orbital (analytic)
export function OrbitalCloud({ orbital, Z, opacity, crossSection, photon }: { orbital: OrbitalId; Z: number; opacity: number; crossSection: boolean; photon: { color: string; key: number; absorb: boolean } | null }) {
  const req = useMemo(() => ({ orbitals: [{ o: orbital, Z, weight: 1 }], count: 45000, seed: seedFromString(`${orbital.n}${orbital.l}${orbital.m}`) }), [orbital, Z]);
  const res = useOrbitalSamples(req);
  const fit = useMemo(() => 3 / radiusEnclosing(orbital.n, orbital.l, Z, 0.95), [orbital, Z]);
  const data = useMemo(() => {
    if (!res) return null;
    const pos: number[] = [], col: number[] = [];
    for (let i = 0; i < res.phase.length; i++) {
      if (crossSection && Math.abs(res.positions[3 * i + 2] * fit) > 0.1) continue;
      pos.push(res.positions[3 * i], res.positions[3 * i + 1], res.positions[3 * i + 2]);
      col.push(...(res.phase[i] > 0 ? PHASE_POS : PHASE_NEG));
    }
    return { positions: new Float32Array(pos), colors: new Float32Array(col) };
  }, [res, fit, crossSection]);
  return (
    <group>
      {data && <PointCloud positions={data.positions} colors={data.colors} size={crossSection ? 0.1 : 0.065} opacity={opacity} scale={fit} />}
      <mesh><sphereGeometry args={[0.035, 12, 12]} /><meshBasicMaterial color="#ffffff" /></mesh>
      <axesHelper args={[3.6]} />
      {photon && <Photon key={photon.key} color={photon.color} absorb={photon.absorb} />}
    </group>
  );
}

/** Photon wave packet travelling to (absorption) or away from (emission) the atom. Illustrative. */
function Photon({ color, absorb }: { color: string; absorb: boolean }) {
  const start = useRef<number | null>(null);
  const line = useMemo(() => {
    const pts = Array.from({ length: 120 }, (_, i) => new THREE.Vector3(i * 0.025, 0.12 * Math.sin(i * 0.55) * Math.exp(-(((i - 60) / 30) ** 2)), 0));
    return new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color, transparent: true }));
  }, [color]);
  useEffect(() => () => { line.geometry.dispose(); (line.material as THREE.Material).dispose(); }, [line]);
  useFrame(({ clock }) => {
    start.current ??= clock.elapsedTime;
    const t = Math.min(1, (clock.elapsedTime - start.current) / 1.6);
    const x = absorb ? 6 - t * 6 : t * 6;
    line.position.set(x - 1.5, 0.6, 0);
    (line.material as THREE.LineBasicMaterial).opacity = absorb ? 1 - t * 0.8 : 1 - t * 0.6;
  });
  return <primitive object={line} />;
}

// ------------------------------------------------------------------ nucleus (schematic)
export function NucleusModel({ st }: { st: AtomState }) {
  const A = st.A ?? Math.round(st.element.atomicWeight ?? st.protons * 2);
  const Z = st.protons;
  const R = 1.2 * Math.cbrt(A); // fm
  const { protons, neutrons } = useMemo(() => {
    const rand = mulberry32(seedFromString(`${Z}-${A}`));
    const golden = Math.PI * (3 - Math.sqrt(5));
    const pts: [number, number, number][] = [];
    for (let i = 0; i < A; i++) {
      const r = R * Math.cbrt((i + 0.5) / A) * 0.92;
      const y = 1 - (2 * (i + 0.5)) / A;
      const q = Math.sqrt(1 - y * y), th = golden * i * 7.3;
      pts.push([r * q * Math.cos(th), r * y, r * q * Math.sin(th)]);
    }
    const idx = pts.map((_, i) => i);
    for (let i = idx.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
    return { protons: idx.slice(0, Z).map((i) => pts[i]), neutrons: idx.slice(Z).map((i) => pts[i]) };
  }, [A, Z, R]);
  const s = 2.6 / Math.max(R, 1.5);
  return (
    <group scale={s}>
      <Instanced points={protons} color="#ff6b5c" radius={0.86} />
      <Instanced points={neutrons} color="#9fb3d9" radius={0.86} />
      <mesh><sphereGeometry args={[R, 48, 48]} /><meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.05} /></mesh>
    </group>
  );
}

function Instanced({ points, color, radius }: { points: [number, number, number][]; color: string; radius: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const m = ref.current; if (!m) return;
    const d = new THREE.Object3D();
    points.forEach((p, i) => { d.position.set(...p); d.updateMatrix(); m.setMatrixAt(i, d.matrix); });
    m.instanceMatrix.needsUpdate = true;
  }, [points]);
  if (!points.length) return null;
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, points.length]} key={points.length}>
      <sphereGeometry args={[radius, 18, 18]} />
      <meshStandardMaterial color={color} roughness={0.45} metalness={0.05} />
    </instancedMesh>
  );
}

// ------------------------------------------------------------------ comparative size
export function SizeComparison({ st }: { st: AtomState }) {
  const refs = [1, 6, 11, 26, 55, 92].filter((z) => z !== st.protons);
  const list = [st.protons, ...refs].map((z) => ELEMENTS[z - 1]).filter((e) => e.vanDerWaalsRadiusPm);
  const maxR = Math.max(...list.map((e) => e.vanDerWaalsRadiusPm!));
  const k = 1.1 / maxR;
  let x = 0;
  const items = list.map((e, i) => {
    const r = e.vanDerWaalsRadiusPm! * k;
    const pos = x + r;
    x += 2 * r + 0.25;
    return { e, r, pos, main: i === 0 };
  });
  const offset = x / 2;
  if (!st.element.vanDerWaalsRadiusPm) return null; // explained in the DOM model label
  return (
    <group>
      {items.map(({ e, r, pos, main }) => (
        <group key={e.Z} position={[pos - offset, 0, 0]}>
          <mesh><sphereGeometry args={[r, 48, 48]} /><meshStandardMaterial color={cpkColor(e.Z)} transparent opacity={main ? 0.95 : 0.55} roughness={0.5} /></mesh>
          <TextSprite text={`${e.symbol} · ${e.vanDerWaalsRadiusPm} pm`} position={[0, -r - 0.2, 0]} height={0.17} color={main ? '#7df9ff' : '#c9d1e8'} />
        </group>
      ))}
    </group>
  );
}

// ------------------------------------------------------------------ scene wrapper
export function AtomSceneContents({ st, view, opacity, crossSection, orbital, orbitalZ, photon }: {
  st: AtomState; view: AtomView; opacity: number; crossSection: boolean; orbital: OrbitalId; orbitalZ: number; photon: { color: string; key: number; absorb: boolean } | null;
}) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 6, 5]} intensity={1.6} />
      <pointLight position={[-5, -3, -4]} intensity={20} color="#3aa8ff" />
      {view === 'shell' && <ShellModel st={st} />}
      {view === 'cloud' && <ProbabilityCloud st={st} opacity={opacity} crossSection={crossSection} />}
      {view === 'orbital' && <OrbitalCloud orbital={orbital} Z={orbitalZ} opacity={opacity} crossSection={crossSection} photon={photon} />}
      {view === 'nucleus' && <NucleusModel st={st} />}
      {view === 'size' && <SizeComparison st={st} />}
      <OrbitControls enableDamping makeDefault minDistance={1.5} maxDistance={30} />
    </>
  );
}

export const subshellColor = (l: number) => `rgb(${L_COLORS[l].map((v) => Math.round(v * 255)).join(',')})`;
export const orbitalLabel = (o: OrbitalId) => `${subshellLabel(o)}${o.l > 0 ? ` (m=${o.m})` : ''}`;
export { L_LETTER };
