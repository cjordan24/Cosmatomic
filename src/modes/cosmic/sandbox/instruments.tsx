/**
 * Virtual instruments for the gravitational sandbox. Every overlay is computed from the live
 * simulation state (never drawn freehand):
 *   - VectorField: velocity (cyan) and gravitational acceleration (gold) arrows per body
 *   - PotentialMap: Newtonian potential Φ = −Σ G mᵢ/|r − rᵢ| sampled on the reference plane,
 *     log-scaled colour with contour bands every 0.25 dex
 */
import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { accelerations, G_KM, type SimState } from './nbody';

const AU = 149_597_870.7;

export function VectorField({ getSim, extentAu }: { getSim: () => SimState; extentAu: number }) {
  const group = useRef<THREE.Group>(null);
  const arrows = useRef(new Map<string, { v: THREE.ArrowHelper; a: THREE.ArrowHelper }>());
  useEffect(() => () => { for (const { v, a } of arrows.current.values()) { v.dispose(); a.dispose(); } arrows.current.clear(); }, []);
  useFrame(() => {
    const g = group.current;
    if (!g) return;
    const bodies = getSim().bodies;
    const acc = accelerations(bodies);
    const live = new Set(bodies.map((b) => b.id));
    for (const [id, pair] of arrows.current) if (!live.has(id)) { g.remove(pair.v, pair.a); pair.v.dispose(); pair.a.dispose(); arrows.current.delete(id); }
    const vmax = Math.max(1e-12, ...bodies.map((b) => Math.hypot(...b.v)));
    const amax = Math.max(1e-30, ...acc.map((a) => Math.hypot(...a)));
    bodies.forEach((b, i) => {
      let pair = arrows.current.get(b.id);
      if (!pair) {
        pair = { v: new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(), 1, 0x7df9ff), a: new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(), 1, 0xf5c76b) };
        g.add(pair.v, pair.a);
        arrows.current.set(b.id, pair);
      }
      const origin = new THREE.Vector3(b.x[0] / AU, b.x[2] / AU, -b.x[1] / AU);
      const vs = Math.hypot(...b.v), as = Math.hypot(...acc[i]);
      // lengths: log-compressed relative to the largest in the system (directions are exact)
      const L = (x: number, max: number) => extentAu * 0.12 * (0.25 + 0.75 * Math.max(0, 1 + Math.log10(x / max) / 4));
      pair.v.position.copy(origin); pair.a.position.copy(origin);
      if (vs > 0) { pair.v.setDirection(new THREE.Vector3(b.v[0], b.v[2], -b.v[1]).normalize()); const l = L(vs, vmax); pair.v.setLength(l, l * 0.25, l * 0.12); }
      if (as > 0) { pair.a.setDirection(new THREE.Vector3(acc[i][0], acc[i][2], -acc[i][1]).normalize()); const l = L(as, amax); pair.a.setLength(l, l * 0.25, l * 0.12); }
    });
  });
  return <group ref={group} />;
}

export function PotentialMap({ getSim, extentAu }: { getSim: () => SimState; extentAu: number }) {
  const N = 160;
  const half = extentAu * 1.6;
  const { canvas, texture } = useMemo(() => {
    const c = document.createElement('canvas'); c.width = N; c.height = N;
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.magFilter = THREE.LinearFilter;
    return { canvas: c, texture: t };
  }, []);
  useEffect(() => () => texture.dispose(), [texture]);
  const last = useRef(0);
  useFrame(() => {
    const now = performance.now();
    if (now - last.current < 400) return;
    last.current = now;
    const g = canvas.getContext('2d')!;
    const img = g.createImageData(N, N);
    const bodies = getSim().bodies;
    const soft = (extentAu * 0.01 * AU) ** 2;
    const vals = new Float32Array(N * N);
    let lo = Infinity, hi = -Infinity;
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
      // plane through the centre of mass (z = 0); scene x = phys x, scene −z = phys y
      const x = ((i + 0.5) / N * 2 - 1) * half * AU, y = (1 - (j + 0.5) / N * 2) * half * AU;
      let phi = 0;
      for (const b of bodies) phi -= (G_KM * b.mass) / Math.sqrt((x - b.x[0]) ** 2 + (y - b.x[1]) ** 2 + b.x[2] ** 2 + soft);
      const v = Math.log10(-phi);
      vals[j * N + i] = v; lo = Math.min(lo, v); hi = Math.max(hi, v);
    }
    for (let k = 0; k < N * N; k++) {
      const t = (vals[k] - lo) / (hi - lo || 1);
      const band = (vals[k] * 4) % 1 < 0.06 ? 1 : 0; // contour every 0.25 dex
      img.data[4 * k] = 30 + 160 * t + 60 * band; img.data[4 * k + 1] = 20 + 60 * t + 60 * band; img.data[4 * k + 2] = 70 + 150 * t + 60 * band;
      img.data[4 * k + 3] = 40 + 150 * t;
    }
    g.putImageData(img, 0, 0);
    texture.needsUpdate = true;
  });
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.001, 0]}>
      <planeGeometry args={[half * 2, half * 2]} />
      <meshBasicMaterial map={texture} transparent depthWrite={false} />
    </mesh>
  );
}
