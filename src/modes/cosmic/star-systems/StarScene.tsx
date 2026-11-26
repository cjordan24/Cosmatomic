/**
 * 3D map of the solar neighbourhood (1 scene unit = 1 parsec, Sun at the origin). Rendering only:
 * positions come from catalogue parallaxes and coordinates via stars.ts; point sizes and colours
 * are Illustrative. The reference frame is ICRS (equatorial) or galactic (Hipparcos matrix).
 */
import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { Billboard, OrbitControls } from '@react-three/drei';
import { useThree, type ThreeEvent } from '@react-three/fiber';
import { LabelAnchor, LabelProjector, type LabelLayer } from '@/rendering/labels';
import type { Vec3 } from './stars';

export type StarFrame = 'galactic' | 'icrs';
export interface ScenePoint { key: string; pos: Vec3; color: [number, number, number]; size: number }

const vertex = /* glsl */ `
  attribute vec3 color; attribute float size;
  varying vec3 vColor;
  void main() {
    vColor = color;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = clamp(size * (260.0 / -mv.z), 2.0, 26.0);
    gl_Position = projectionMatrix * mv;
  }`;
const fragment = /* glsl */ `
  varying vec3 vColor; uniform float uOpacity;
  void main() {
    vec2 c = gl_PointCoord - 0.5; float d = dot(c, c);
    if (d > 0.25) discard;
    float core = smoothstep(0.25, 0.0, d);
    gl_FragColor = vec4(vColor, (0.35 + 0.65 * core) * uOpacity);
  }`;

function StarPoints({ points, opacity, onPick }: { points: ScenePoint[]; opacity: number; onPick?: (key: string) => void }) {
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(points.flatMap((p) => p.pos)), 3));
    g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(points.flatMap((p) => p.color)), 3));
    g.setAttribute('size', new THREE.BufferAttribute(new Float32Array(points.map((p) => p.size)), 1));
    g.computeBoundingSphere();
    return g;
  }, [points]);
  const material = useMemo(() => new THREE.ShaderMaterial({ vertexShader: vertex, fragmentShader: fragment, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { uOpacity: { value: opacity } } }), []); // eslint-disable-line react-hooks/exhaustive-deps
  material.uniforms.uOpacity.value = opacity;
  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => material.dispose(), [material]);
  const pick = (e: ThreeEvent<PointerEvent>) => {
    if (!onPick || e.index === undefined) return;
    e.stopPropagation();
    onPick(points[e.index].key);
  };
  return <points geometry={geometry} material={material} onClick={onPick ? (pick as never) : undefined} frustumCulled={false} />;
}

function Rings({ radii }: { radii: number[] }) {
  const geometry = useMemo(() => {
    const pts: number[] = [];
    for (const r of radii) for (let i = 0; i < 128; i++) {
      const a0 = (i / 128) * 2 * Math.PI, a1 = ((i + 1) / 128) * 2 * Math.PI;
      pts.push(r * Math.cos(a0), r * Math.sin(a0), 0, r * Math.cos(a1), r * Math.sin(a1), 0);
    }
    // two axis lines across the plane
    const R = Math.max(...radii);
    pts.push(-R, 0, 0, R, 0, 0, 0, -R, 0, 0, R, 0);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pts), 3));
    return g;
  }, [radii]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return <lineSegments geometry={geometry}><lineBasicMaterial color="#6d5aa8" transparent opacity={0.45} /></lineSegments>;
}

function DropLines({ points }: { points: ScenePoint[] }) {
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(points.flatMap((p) => [p.pos[0], p.pos[1], p.pos[2], p.pos[0], p.pos[1], 0])), 3));
    return g;
  }, [points]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return <lineSegments geometry={geometry}><lineBasicMaterial color="#b18cff" transparent opacity={0.1} /></lineSegments>;
}

function Selection({ pos }: { pos: Vec3 }) {
  return (
    <Billboard position={pos}>
      <mesh renderOrder={5}>
        <ringGeometry args={[0.32, 0.4, 40]} />
        <meshBasicMaterial color="#f5c76b" side={THREE.DoubleSide} transparent opacity={0.95} depthTest={false} />
      </mesh>
    </Billboard>
  );
}

function CameraSetup() {
  const { camera } = useThree();
  useEffect(() => { camera.up.set(0, 0, 1); camera.lookAt(0, 0, 0); }, [camera]);
  return null;
}

export function StarScene({ points, background, selected, showDrop, ringRadii, labels, labelAnchors, onPick }: {
  points: ScenePoint[]; background: ScenePoint[]; selected: Vec3 | null; showDrop: boolean; ringRadii: number[];
  labels: LabelLayer; labelAnchors: { id: string; pos: Vec3 }[]; onPick: (key: string) => void;
}) {
  return (
    <>
      <CameraSetup />
      <Rings radii={ringRadii} />
      {showDrop && <DropLines points={points} />}
      {background.length > 0 && <StarPoints points={background} opacity={0.45} />}
      <StarPoints points={points} opacity={1} onPick={onPick} />
      <mesh><sphereGeometry args={[0.12, 16, 16]} /><meshBasicMaterial color="#fff3c4" /></mesh>
      {selected && <Selection pos={selected} />}
      {labelAnchors.map((a) => <group key={a.id} position={a.pos}><LabelAnchor layer={labels} id={a.id} /></group>)}
      <LabelProjector layer={labels} />
      <OrbitControls makeDefault enableDamping minDistance={1} maxDistance={120} />
    </>
  );
}
