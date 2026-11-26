/**
 * 3D crystal renderer: n×n×n supercell (instanced spheres per element, Å = scene units),
 * unit-cell edges, nearest-neighbour bonds, and an (hkl) plane through the first cell.
 * Drawing radii are a fraction of the nearest-neighbour distance (visual only).
 */
import { useEffect, useMemo, useRef } from 'react';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { cpkColor } from '@/rendering/colors';
import { atomicNumber, coordination, latticeVectors, planePolygon, toCartesian, type Crystal, type V3 } from './crystal';

function Atoms({ positions, color, radius }: { positions: V3[]; color: string; radius: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useEffect(() => {
    const m = ref.current; if (!m) return;
    const o = new THREE.Object3D();
    positions.forEach((p, i) => { o.position.set(...p); o.updateMatrix(); m.setMatrixAt(i, o.matrix); });
    m.instanceMatrix.needsUpdate = true;
  }, [positions]);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, positions.length]} key={positions.length}>
      <sphereGeometry args={[radius, 20, 14]} />
      <meshStandardMaterial color={color} roughness={0.45} metalness={0.1} />
    </instancedMesh>
  );
}

export function CrystalScene({ x, n, showCell, showBonds, hkl }: { x: Crystal; n: number; showCell: boolean; showBonds: boolean; hkl: [number, number, number] | null }) {
  const [A, B, C] = latticeVectors(x);
  const centre = useMemo(() => [0, 1, 2].map((k) => (n * (A[k] + B[k] + C[k])) / 2) as V3, [x, n]); // eslint-disable-line react-hooks/exhaustive-deps
  const byEl = useMemo(() => {
    const m = new Map<string, V3[]>();
    for (let u = 0; u < n; u++) for (let v = 0; v < n; v++) for (let w = 0; w < n; w++) for (const s of x.sites) {
      const p = toCartesian(x, [s.xyz[0] + u, s.xyz[1] + v, s.xyz[2] + w]);
      (m.get(s.el) ?? m.set(s.el, []).get(s.el)!).push(p.map((t, k) => t - centre[k]) as V3);
    }
    return m;
  }, [x, n, centre]);
  const dnn = useMemo(() => coordination(x, 0).d, [x]);
  const bonds = useMemo(() => {
    if (!showBonds) return null;
    const all = [...byEl.values()].flat();
    const pts: number[] = [];
    for (let i = 0; i < all.length; i++) for (let j = i + 1; j < all.length; j++) {
      const d = Math.hypot(all[i][0] - all[j][0], all[i][1] - all[j][1], all[i][2] - all[j][2]);
      if (d <= dnn * 1.03) pts.push(...all[i], ...all[j]);
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3)); return g;
  }, [byEl, dnn, showBonds]);
  const cell = useMemo(() => {
    const o = centre.map((t) => -t) as V3;
    const P = (a: number, b: number, c: number): V3 => [0, 1, 2].map((k) => o[k] + a * A[k] + b * B[k] + c * C[k]) as V3;
    const e: [V3, V3][] = [];
    for (const [a, b, c] of [[0, 0, 0], [1, 0, 0], [0, 1, 0], [0, 0, 1], [1, 1, 0], [1, 0, 1], [0, 1, 1]] as V3[]) {
      if (!a) e.push([P(a, b, c), P(1, b, c)]); if (!b) e.push([P(a, b, c), P(a, 1, c)]); if (!c) e.push([P(a, b, c), P(a, b, 1)]);
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(e.flat(2), 3)); return g;
  }, [x, centre]); // eslint-disable-line react-hooks/exhaustive-deps
  const plane = useMemo(() => {
    if (!hkl) return null;
    const poly = planePolygon(x, ...hkl).map((p) => p.map((t, k) => t - centre[k]) as V3);
    if (poly.length < 3) return null;
    const pos: number[] = [];
    for (let i = 1; i + 1 < poly.length; i++) pos.push(...poly[0], ...poly[i], ...poly[i + 1]);
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.computeVertexNormals(); return g;
  }, [x, hkl, centre]);
  useEffect(() => () => { bonds?.dispose(); cell.dispose(); plane?.dispose(); }, [bonds, cell, plane]);
  const radiusFor = (el: string) => dnn * (x.sites.every((s) => s.el === el) ? 0.32 : atomicNumber(el) > 10 ? 0.36 : 0.26);
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[8, 10, 6]} intensity={1.6} />
      <directionalLight position={[-6, -4, -8]} intensity={0.5} />
      {[...byEl.entries()].map(([el, ps]) => <Atoms key={`${el}-${n}`} positions={ps} color={cpkColor(atomicNumber(el))} radius={radiusFor(el)} />)}
      {showCell && <lineSegments geometry={cell}><lineBasicMaterial color="#f5c76b" /></lineSegments>}
      {bonds && <lineSegments geometry={bonds}><lineBasicMaterial color="#9aa6c8" transparent opacity={0.6} /></lineSegments>}
      {plane && <mesh geometry={plane}><meshBasicMaterial color="#7df9ff" transparent opacity={0.28} side={THREE.DoubleSide} depthWrite={false} /></mesh>}
      <OrbitControls makeDefault enableDamping />
    </>
  );
}
