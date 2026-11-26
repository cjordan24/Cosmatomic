/**
 * Solar-system renderer.
 *
 * Coordinates: physics in float64 km (ecliptic J2000, heliocentric). Rendering uses a
 * FLOATING ORIGIN — every frame the origin is the focused body (or the Sun), and
 * objects are placed at (r − origin) / 1000 km in float32. This keeps sub-km precision
 * near the camera across a 10¹⁰ km scene. A logarithmic depth buffer handles the range.
 * Visual size exaggeration changes drawing radii only — never physical positions.
 */
import { Suspense, useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import { LabelAnchor, LabelProjector, type LabelLayer } from '@/rendering/labels';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { type Vec3, add, scale, sub, norm } from '@/core/mathematics/vec3';
import { useVoyager } from '@/shared/store';
import { navigate } from '@/shared/router';
import { BODIES, SATURN_RINGS, type CelestialBody } from './bodies';
import { bodyOrientation, heliocentric, orbitPath, AU_KM } from './ephemeris';
import { live, tick } from './liveClock';

export const KM_PER_UNIT = 1000;
const toScene = (v: Vec3, out = new THREE.Vector3()) => out.set(v[0] / KM_PER_UNIT, v[2] / KM_PER_UNIT, -v[1] / KM_PER_UNIT);

export type Frame = 'focus' | 'heliocentric';

/**
 * Default viewing direction for a body: from its sunward side, rotated ~40° in azimuth and raised ~22°,
 * so the lit hemisphere (and a spacecraft's Earth-facing antenna) faces the viewer. Presentation only.
 */
function sunwardViewDir(id: string, jd: number): THREE.Vector3 {
  const p = heliocentric(id, jd);
  if (id === 'sun' || !Number.isFinite(p[0])) return new THREE.Vector3(0.35, 0.6, 1).normalize();
  const toSun = toScene([-p[0], -p[1], -p[2]], new THREE.Vector3()).normalize();
  return toSun.applyAxisAngle(new THREE.Vector3(0, 1, 0), THREE.MathUtils.degToRad(40)).add(new THREE.Vector3(0, 0.4, 0)).normalize();
}

/** Display radius (km) after visual exaggeration. The Sun is capped so it never swallows Mercury. */
export function displayRadiusKm(b: CelestialBody, k: number): number {
  const r = b.radiusKm ?? 300; // unknown radius: drawn as a small marker (flagged in the UI)
  return b.kind === 'star' ? r * Math.min(k, 20) : r * k;
}
/**
 * Per-system moon-distance expansion used ONLY when radii are exaggerated: the smallest factor that keeps the
 * innermost listed moon at ≥ 1.6 enlarged planet radii. Preserves the relative layout within each system.
 */
export function moonSystemScale(parentId: string, k: number): number {
  if (k <= 1) return 1;
  const parent = BODIES.find((b) => b.id === parentId);
  const moons = BODIES.filter((b) => b.parent === parentId);
  if (!parent?.radiusKm || !moons.length) return 1;
  const aMin = Math.min(...moons.map((m) => norm(relativeOffsetAtEpoch(m.id))));
  return Math.max(1, (1.6 * k * parent.radiusKm) / aMin);
}
const epochOffsets = new Map<string, number>();
function relativeOffsetAtEpoch(id: string): Vec3 {
  if (!epochOffsets.has(id)) {
    const b = BODIES.find((x) => x.id === id)!;
    epochOffsets.set(id, norm(sub(heliocentric(id, 2_460_676.5), heliocentric(b.parent!, 2_460_676.5))));
  }
  return [epochOffsets.get(id)!, 0, 0];
}

/** Positions of all bodies (km, heliocentric) including visual moon-offset scaling. */
export function scenePositions(jd: number, k: number): Map<string, Vec3> {
  const m = new Map<string, Vec3>();
  for (const b of BODIES) {
    if (b.kind === 'moon' && b.parent) {
      const parent = heliocentric(b.parent, jd);
      const rel = sub(heliocentric(b.id, jd), parent);
      m.set(b.id, add(parent, scale(rel, moonSystemScale(b.parent, k))));
    } else m.set(b.id, heliocentric(b.id, jd));
  }
  return m;
}

/** Illustrative banded texture for giant planets (NOT imagery). */
function bandTexture(base: string, seed: number) {
  const c = document.createElement('canvas');
  c.width = 4; c.height = 256;
  const g = c.getContext('2d')!;
  const col = new THREE.Color(base);
  for (let y = 0; y < 256; y++) {
    const v = 0.82 + 0.18 * Math.sin(y * 0.19 + seed) * Math.sin(y * 0.047 + seed * 2) + 0.06 * Math.sin(y * 0.9 + seed);
    g.fillStyle = `#${col.clone().multiplyScalar(v).getHexString()}`;
    g.fillRect(0, y, 4, 1);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

const VOYAGER_GLB = `${import.meta.env.BASE_URL}models/voyager.glb`;
useGLTF.preload(VOYAGER_GLB);

/** Blender-built Voyager model (metres) → scene units (1 unit = 1000 km ⇒ 1 m = 1e-6 units). */
function SpacecraftModel({ k }: { k: number }) {
  const { scene } = useGLTF(VOYAGER_GLB);
  const model = useMemo(() => scene.clone(true), [scene]);
  return <primitive object={model} scale={1e-6 * k} />;
}

function BodyMesh({ body, k, focused }: { body: CelestialBody; k: number; focused: boolean }) {
  if (body.kind === 'spacecraft') {
    return (
      <group>
        <Suspense fallback={null}><SpacecraftModel k={k} /></Suspense>
      </group>
    );
  }
  return <NaturalBodyMesh body={body} k={k} focused={focused} />;
}

function NaturalBodyMesh({ body, k, focused }: { body: CelestialBody; k: number; focused: boolean }) {
  const r = displayRadiusKm(body, k) / KM_PER_UNIT;
  const tex = useMemo(() => (['jupiter', 'saturn', 'uranus', 'neptune'].includes(body.id) ? bandTexture(body.color, body.id.length) : null), [body]);
  useEffect(() => () => tex?.dispose(), [tex]);
  if (body.kind === 'star') {
    return (
      <group>
        <mesh><sphereGeometry args={[r, 64, 64]} /><meshBasicMaterial color="#ffe2a0" toneMapped={false} /></mesh>
        <mesh><sphereGeometry args={[r * 1.25, 48, 48]} /><meshBasicMaterial color="#ffb347" transparent opacity={0.12} depthWrite={false} toneMapped={false} /></mesh>
      </group>
    );
  }
  return (
    <mesh>
      <sphereGeometry args={[r, focused ? 96 : 40, focused ? 64 : 28]} />
      <meshStandardMaterial color={tex ? '#ffffff' : body.color} map={tex} roughness={0.85} metalness={0} />
    </mesh>
  );
}

function SaturnRings({ k }: { k: number }) {
  const rings = SATURN_RINGS.rings.filter((r) => !('gap' in r && r.gap));
  return (
    <group>
      {rings.map((ring) => (
        <mesh key={ring.name}>
          <ringGeometry args={[(ring.inner * k) / KM_PER_UNIT, (ring.outer * k) / KM_PER_UNIT, 160, 1]} />
          <meshStandardMaterial color={ring.name === 'B' ? '#e8d6a8' : ring.name === 'A' ? '#cdbb92' : '#9c8e70'} transparent opacity={ring.name === 'B' ? 0.85 : ring.name === 'D' || ring.name === 'F' ? 0.25 : 0.55} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

function OrbitLine({ points, color, opacity }: { points: Float32Array; color: string; opacity: number }) {
  const line = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(points, 3));
    return new THREE.Line(g, new THREE.LineBasicMaterial({ color, transparent: true, opacity, depthWrite: false }));
  }, [points, color, opacity]);
  useEffect(() => () => { line.geometry.dispose(); (line.material as THREE.Material).dispose(); }, [line]);
  return <primitive object={line} frustumCulled={false} />;
}

export function SolarScene({ focusId, frame, overview, showHill, labels, onSelect, distanceKm }: { focusId: string; frame: Frame; overview: boolean; showHill: boolean; labels: LabelLayer; onSelect?: (id: string) => void; distanceKm?: number | null }) {
  const { showLabels, showOrbits, sizeExaggeration: k, reducedMotion } = useVoyager((s) => s.settings);
  const jdStore = useVoyager((s) => s.clock.jd);
  const { camera } = useThree();
  const controls = useRef<OrbitControlsImpl>(null);
  const groups = useRef(new Map<string, THREE.Group>());
  const orbitGroups = useRef(new Map<string, THREE.Group>());
  const originRef = useRef<Vec3>(heliocentric(focusId, live.jd));
  const transition = useRef<{ from: string; to: string; t0: number; d0: number; d1: number; dir0: THREE.Vector3; dir1: THREE.Vector3 } | null>(null);
  const prevFocus = useRef(focusId);
  const focusBody = BODIES.find((b) => b.id === focusId)!;

  // Orbit paths: recomputed only when the date moves by > 5 days (paths change slowly).
  const orbitEpoch = Math.round(jdStore / 5) * 5;
  const orbits = useMemo(() => {
    const out = new Map<string, Float32Array>();
    for (const b of BODIES) {
      if (b.kind === 'star') continue;
      const pts = orbitPath(b.id, orbitEpoch, b.kind === 'moon' ? 180 : 360);
      const s = b.kind === 'moon' && b.parent ? moonSystemScale(b.parent, k) : 1;
      const arr = new Float32Array(pts.length * 3);
      pts.forEach((p, i) => { arr[3 * i] = (p[0] * s) / KM_PER_UNIT; arr[3 * i + 1] = (p[2] * s) / KM_PER_UNIT; arr[3 * i + 2] = (-p[1] * s) / KM_PER_UNIT; });
      out.set(b.id, arr);
    }
    return out;
  }, [orbitEpoch, k]);

  const viewDistance = (id: string) => {
    if (distanceKm && distanceKm > 0) return distanceKm / KM_PER_UNIT; // deep-linked view (?dist=km)
    if (overview && id === 'sun') return 40 * AU_KM / KM_PER_UNIT;
    const b = BODIES.find((x) => x.id === id)!;
    return (displayRadiusKm(b, k) / KM_PER_UNIT) * (b.kind === 'star' ? 6 : 5);
  };

  // Start a smooth transition on focus change.
  useEffect(() => {
    const d0 = camera.position.length();
    const d1 = viewDistance(focusId);
    if (prevFocus.current !== focusId || overview) {
      const dir1 = overview ? new THREE.Vector3(0.35, 0.6, 1).normalize() : sunwardViewDir(focusId, live.jd);
      transition.current = reducedMotion ? null : { from: prevFocus.current, to: focusId, t0: performance.now(), d0, d1, dir0: camera.position.clone().normalize(), dir1 };
      if (reducedMotion) camera.position.copy(dir1).multiplyScalar(d1);
      prevFocus.current = focusId;
    }
  }, [focusId, overview]); // eslint-disable-line react-hooks/exhaustive-deps

  // initial camera
  useEffect(() => {
    const d = viewDistance(focusId);
    camera.position.copy(overview ? new THREE.Vector3(0.35, 0.6, 1).normalize() : sunwardViewDir(focusId, live.jd)).multiplyScalar(d);
    camera.lookAt(0, 0, 0);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const tmp = useMemo(() => new THREE.Vector3(), []);
  useFrame((_, dt) => {
    tick(dt, performance.now());
    // read-only diagnostics for browser tests / debugging
    (window as unknown as { __voyager?: Record<string, unknown> }).__voyager = { cameraDistanceKm: camera.position.length() * KM_PER_UNIT, focus: focusId, jd: live.jd };
    const jd = live.jd;
    const pos = scenePositions(jd, k);
    // ---- floating origin (float64) with eased transition between bodies
    let origin: Vec3;
    const tr = transition.current;
    const target = frame === 'heliocentric' ? [0, 0, 0] as Vec3 : pos.get(focusId)!;
    if (tr) {
      const u = Math.min(1, (performance.now() - tr.t0) / 1800);
      const e = u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
      const from = frame === 'heliocentric' ? [0, 0, 0] as Vec3 : pos.get(tr.from) ?? target;
      origin = add(from, scale(sub(target, from), e));
      const d = Math.exp(Math.log(tr.d0) + (Math.log(tr.d1) - Math.log(tr.d0)) * e);
      camera.position.copy(tr.dir0.clone().lerp(tr.dir1, e).normalize()).multiplyScalar(d);
      if (u >= 1) transition.current = null;
    } else origin = target;
    originRef.current = origin;

    // ---- place bodies
    for (const b of BODIES) {
      const g = groups.current.get(b.id);
      if (!g) continue;
      const p = pos.get(b.id)!;
      g.visible = Number.isFinite(p[0]);
      if (!g.visible) continue;
      toScene(sub(p, origin), g.position);
      if (b.kind === 'spacecraft') {
        // high-gain antenna (+Y of the glTF model) points at Earth, as in flight
        const toEarth = toScene(sub(pos.get('earth')!, p), new THREE.Vector3()).normalize();
        (g.children[0] as THREE.Object3D | undefined)?.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), toEarth);
        continue;
      }
      const o = bodyOrientation(b.id, jd);
      const mesh = g.children[0] as THREE.Object3D | undefined;
      if (o && mesh) {
        // local +Y → spin axis; local +X → prime meridian (both in scene coords)
        const yAxis = new THREE.Vector3(o.spin[0], o.spin[2], -o.spin[1]).normalize();
        const xAxis = new THREE.Vector3(o.prime[0], o.prime[2], -o.prime[1]);
        xAxis.sub(yAxis.clone().multiplyScalar(xAxis.dot(yAxis))).normalize();
        const zAxis = new THREE.Vector3().crossVectors(xAxis, yAxis);
        mesh.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(xAxis, yAxis, zAxis));
      }
      if (b.id === 'saturn' && o) {
        const rings = g.children[1];
        if (rings) rings.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), new THREE.Vector3(o.pole[0], o.pole[2], -o.pole[1]).normalize());
      }
    }
    // ---- orbit groups follow their parent
    for (const [id, g] of orbitGroups.current) {
      const b = BODIES.find((x) => x.id === id)!;
      const parentPos: Vec3 = b.kind === 'moon' && b.parent ? pos.get(b.parent)! : [0, 0, 0];
      toScene(sub(parentPos, origin), g.position);
    }
    // ---- label decluttering: hide moon labels when their system is tiny on screen
    const camDist = camera.position.length() * KM_PER_UNIT;
    // dynamic near plane: keeps metre-scale spacecraft and 10⁹-km distances in one log-depth frustum
    const near = Math.max(1e-9, camera.position.length() * 2e-4);
    if (Math.abs((camera as THREE.PerspectiveCamera).near / near - 1) > 0.25) { (camera as THREE.PerspectiveCamera).near = near; camera.updateProjectionMatrix(); }
    for (const b of BODIES) {
      let visible = showLabels && Number.isFinite(pos.get(b.id)![0]);
      if (b.kind === 'moon' && b.parent) {
        const sep = norm(sub(pos.get(b.id)!, pos.get(b.parent)!));
        const parentDist = norm(sub(pos.get(b.parent)!, origin)) + camDist;
        visible &&= sep / parentDist > 0.012;
      }
      if (b.kind === 'dwarf-planet' && b.id !== focusId) visible &&= camDist > 2 * AU_KM || norm(sub(pos.get(b.id)!, origin)) < 5 * AU_KM;
      if (visible) labels.hidden.delete(b.id); else labels.hidden.add(b.id);
    }
    void tmp;
  });

  // Hill sphere of the focused body (derived): r_H ≈ a(1−e)·(m / 3M_parent)^(1/3)
  const hill = useMemo(() => {
    if (!showHill || focusBody.kind === 'star' || focusBody.kind === 'spacecraft' || !focusBody.massKg) return null;
    const parent = focusBody.parent ? BODIES.find((b) => b.id === focusBody.parent) : BODIES[0];
    if (!parent?.massKg) return null;
    const rel = norm(sub(heliocentric(focusId, jdStore), focusBody.parent ? heliocentric(focusBody.parent, jdStore) : [0, 0, 0]));
    return rel * Math.cbrt(focusBody.massKg / (3 * parent.massKg));
  }, [showHill, focusBody, focusId, jdStore]);

  return (
    <>
      <ambientLight intensity={0.04} />
      <SunLight groups={groups} />
      {BODIES.map((b) => (
        <group key={b.id} ref={(g) => { if (g) groups.current.set(b.id, g); else groups.current.delete(b.id); }}>
          <group onClick={(e) => { e.stopPropagation(); onSelect ? onSelect(b.id) : navigate(`/cosmic/${b.id}`); }}>
            <BodyMesh body={b} k={k} focused={b.id === focusId} />
          </group>
          {b.id === 'saturn' && <group><SaturnRings k={k} /></group>}
          {b.id === focusId && hill && (
            <mesh><sphereGeometry args={[hill / KM_PER_UNIT, 48, 32]} /><meshBasicMaterial color="#b18cff" wireframe transparent opacity={0.12} /></mesh>
          )}
          <LabelAnchor layer={labels} id={b.id} />
        </group>
      ))}
      {showOrbits && BODIES.filter((b) => b.kind !== 'star').map((b) => (
        <group key={`orbit-${b.id}`} ref={(g) => { if (g) orbitGroups.current.set(b.id, g); else orbitGroups.current.delete(b.id); }}>
          <OrbitLine points={orbits.get(b.id)!} color={b.kind === 'spacecraft' ? '#f5c76b' : b.kind === 'moon' ? '#8f9bc2' : b.kind === 'dwarf-planet' ? '#8a7a6a' : '#9a86ff'} opacity={b.id === focusId ? 0.9 : b.kind === 'moon' ? 0.35 : 0.45} />
        </group>
      ))}
      <LabelProjector layer={labels} />
      <OrbitControls ref={controls} makeDefault enableDamping dampingFactor={0.08} enablePan={false} minDistance={(displayRadiusKm(focusBody, k) / KM_PER_UNIT) * 1.15} maxDistance={2.5e7} zoomSpeed={3} />
    </>
  );
}

/** Point light that always sits on the Sun (floating origin moves it every frame). */
function SunLight({ groups }: { groups: React.MutableRefObject<Map<string, THREE.Group>> }) {
  const light = useRef<THREE.PointLight>(null);
  useFrame(() => { const s = groups.current.get('sun'); if (s && light.current) light.current.position.copy(s.position); });
  return <pointLight ref={light} intensity={3.2} decay={0} distance={0} color="#fff4e0" />;
}
