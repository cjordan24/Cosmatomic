/**
 * Landing page: four portals (three live, one coming soon).
 *  ATOMIC   — a real hydrogen 3d(z²) probability cloud sampled from ψ_nlm.
 *  COSMIC   — the planets at their actual heliocentric longitudes today (JPL elements),
 *             with radial distances log-compressed for the thumbnail (labelled).
 *  SPECTRAL — the analytic vacuum plane wave (planeE/planeB from em.ts): E ⊥ B ⊥ k, |B| = |E|/c.
 *  CELLULAR — Biologic Mode (Phase 11): greyed out, not interactive, "Coming soon" under the title.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Viewport } from '@/rendering/Viewport';
import { PointCloud } from '@/rendering/PointCloud';
import { sampleOrbitals } from '@/modes/atomic/orbitals/hydrogenic';
import { mulberry32 } from '@/core/simulation/random';
import { heliocentric, AU_KM } from '@/modes/cosmic/solar-system/ephemeris';
import { jdFromDate } from '@/core/simulation/clock';
import { BODIES } from '@/modes/cosmic/solar-system/bodies';
import { navigate } from '@/shared/router';
import { useVoyager } from '@/shared/store';
import { Logo } from '@/ui/components';
import { planeB, planeE, POLARISATIONS } from '@/core/physics/em/em';
import { CONSTANTS } from '@/core/constants/constants';

function Spin({ children, speed = 0.08 }: { children: React.ReactNode; speed?: number }) {
  const ref = useRef<THREE.Group>(null);
  const reduced = useVoyager((s) => s.settings.reducedMotion);
  useFrame((_, dt) => { if (ref.current && !reduced) ref.current.rotation.y += dt * speed; });
  return <group ref={ref}>{children}</group>;
}

function AtomPortalScene() {
  const { positions, colors } = useMemo(() => {
    const res = sampleOrbitals({ orbitals: [{ o: { n: 3, l: 2, m: 0 }, Z: 1, weight: 1 }], count: 26000, seed: 2026 }, mulberry32(2026));
    const col = new Float32Array(res.phase.length * 3);
    for (let i = 0; i < res.phase.length; i++) {
      const c = res.phase[i] > 0 ? [0.35, 0.95, 1.0] : [0.2, 0.55, 1.0];
      col.set(c, i * 3);
    }
    return { positions: res.positions, colors: col };
  }, []);
  return (
    <group position={[1.1, 0.15, 0]}><Spin speed={0.12}>
      <group rotation={[0.35, 0, 0.2]}>
        <PointCloud positions={positions} colors={colors} size={0.045} opacity={0.5} scale={0.11} />
        <mesh><sphereGeometry args={[0.06, 16, 16]} /><meshBasicMaterial color="#ffffff" /></mesh>
      </group>
    </Spin></group>
  );
}

function CosmicPortalScene() {
  const planets = useMemo(() => {
    const jd = jdFromDate(new Date());
    return ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'].map((id) => {
      const p = heliocentric(id, jd);
      const rAu = Math.hypot(p[0], p[1]) / AU_KM;
      const rr = 0.9 + Math.log10(1 + rAu * 3) * 2.4; // log-compressed display radius
      const lon = Math.atan2(p[1], p[0]);
      return { id, rr, x: rr * Math.cos(lon), z: -rr * Math.sin(lon), color: BODIES.find((b) => b.id === id)!.color };
    });
  }, []);
  return (
    <Spin speed={0.05}>
      <group rotation={[0.5, 0, 0]}>
        <mesh><sphereGeometry args={[0.32, 32, 32]} /><meshBasicMaterial color="#ffd27a" /></mesh>
        <pointLight intensity={30} distance={0} decay={1.4} color="#fff2d8" />
        {planets.map((p) => (
          <group key={p.id}>
            <mesh rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[p.rr - 0.004, p.rr + 0.004, 128]} /><meshBasicMaterial color="#8f7ad8" transparent opacity={0.35} side={THREE.DoubleSide} /></mesh>
            <mesh position={[p.x, 0, p.z]}><sphereGeometry args={[p.id === 'jupiter' || p.id === 'saturn' ? 0.12 : 0.07, 24, 24]} /><meshStandardMaterial color={p.color} emissive={p.color} emissiveIntensity={0.25} /></mesh>
          </group>
        ))}
      </group>
    </Spin>
  );
}

/** Linear-polarised vacuum plane wave, two wavelengths across the card. B is drawn ×c so it shares E's scale. */
function SpectralPortalScene() {
  const NS = 120, L = 7, A = 1.1, f = 1, c = CONSTANTS.c.value, lambda = c / f;
  const geo = useMemo(() => {
    const mk = () => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(NS * 6), 3)); return g; };
    return { e: mk(), b: mk() };
  }, []);
  useEffect(() => () => { geo.e.dispose(); geo.b.dispose(); }, [geo]);
  const phase = useRef(0);
  const reduced = useVoyager((s) => s.settings.reducedMotion);
  useFrame((_, dt) => {
    if (!reduced) phase.current += Math.min(dt, 0.1) * Math.PI * 0.6; // playback: one period per ~3.3 s
    const t = phase.current / (2 * Math.PI * f);
    const pe = geo.e.getAttribute('position') as THREE.BufferAttribute, pb = geo.b.getAttribute('position') as THREE.BufferAttribute;
    for (let i = 0; i < NS; i++) {
      const u = i / (NS - 1), X = -L / 2 + u * L;
      const E = planeE(POLARISATIONS['linear-x'], 1, f, u * 2 * lambda, t), B = planeB(E);
      // physics (x, y, z) → scene (y, z, x)
      pe.setXYZ(2 * i, X, 0, 0); pe.setXYZ(2 * i + 1, X, A * E[0], A * E[1]);
      pb.setXYZ(2 * i, X, 0, 0); pb.setXYZ(2 * i + 1, X, A * B[0] * c, A * B[1] * c);
    }
    pe.needsUpdate = true; pb.needsUpdate = true;
  });
  return (
    <group position={[1.3, 0.45, 0]} rotation={[0.42, -0.62, 0]}>
      <lineSegments geometry={geo.e}><lineBasicMaterial color="#ff8a6b" /></lineSegments>
      <lineSegments geometry={geo.b}><lineBasicMaterial color="#ffd27a" transparent opacity={0.8} /></lineSegments>
      <arrowHelper args={[new THREE.Vector3(1, 0, 0), new THREE.Vector3(-L / 2, 0, 0), L + 0.6, 0xf5c76b, 0.3, 0.16]} />
    </group>
  );
}

type Live = 'atomic' | 'cosmic' | 'spectral';

export default function Landing() {
  const [leaving, setLeaving] = useState<Live | null>(null);
  const reduced = useVoyager((s) => s.settings.reducedMotion);
  const enter = (m: Live) => {
    if (reduced) return navigate(`/${m}`);
    setLeaving(m);
    setTimeout(() => navigate(`/${m}`), 750);
  };
  return (
    <div className="landing">
      <div className="landing-title">
        <h1 style={{ display: 'inline-flex', alignItems: 'center', gap: 14 }}><span style={{ width: 28, height: 28, display: 'inline-block' }}><Logo /></span>VOYAGER VENTURES</h1>
        <p>A SCIENTIFIC SANDBOX FROM ATOMIC NUCLEI TO THE SOLAR SYSTEM</p>
      </div>
      <button className={`portal atomic ${leaving === 'atomic' ? 'zoom' : leaving ? 'fade' : ''}`} onClick={() => enter('atomic')} aria-label="Enter Atomic mode">
        <Viewport className="portal-canvas" camera={{ position: [0, 0, 5.2], fov: 45 }}><AtomPortalScene /></Viewport>
        <div className="portal-text">
          <h2>ATOMIC</h2>
          <p>Explore the building blocks of existence.</p>
          <span className="cta">ENTER →</span>
        </div>
      </button>
      <button className={`portal cosmic ${leaving === 'cosmic' ? 'zoom' : leaving ? 'fade' : ''}`} onClick={() => enter('cosmic')} aria-label="Enter Cosmic mode">
        <Viewport className="portal-canvas" camera={{ position: [0, 3.2, 8.5], fov: 45 }}><CosmicPortalScene /></Viewport>
        <div className="portal-text">
          <h2>COSMIC</h2>
          <p>Explore the structure of the universe.</p>
          <span className="cta">ENTER →</span>
        </div>
      </button>
      <button className={`portal spectral ${leaving === 'spectral' ? 'zoom' : leaving ? 'fade' : ''}`} onClick={() => enter('spectral')} aria-label="Enter Spectral mode">
        <Viewport className="portal-canvas" camera={{ position: [0, 0, 6.2], fov: 45 }}><SpectralPortalScene /></Viewport>
        <div className="portal-text">
          <h2>SPECTRAL</h2>
          <p>Waves, frequencies, radiation and energy.</p>
          <span className="cta">ENTER →</span>
        </div>
      </button>
      <div className={`portal cellular disabled ${leaving ? 'fade' : ''}`} role="group" aria-disabled="true" aria-label="Cellular mode, coming soon">
        <div className="portal-text">
          <h2>CELLULAR</h2>
          <p className="soon">Coming soon</p>
        </div>
      </div>
      <div className="landing-foot">Atomic: hydrogen 3d<sub>z²</sub> probability density (analytic ψ). Cosmic: planets at today's heliocentric longitudes (JPL elements), distances log-compressed. Spectral: analytic vacuum plane wave, E ⊥ B ⊥ k, |B| = |E|/c.</div>
    </div>
  );
}
