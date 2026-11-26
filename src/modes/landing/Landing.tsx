/**
 * Landing page: two interactive portals.
 *  ATOMIC — a real hydrogen 3d(z²)+2p probability cloud sampled from ψ_nlm.
 *  COSMIC — the planets at their actual heliocentric longitudes today (JPL elements),
 *           with radial distances log-compressed for the thumbnail (labelled).
 */
import { useMemo, useRef, useState } from 'react';
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
    <Spin speed={0.12}>
      <group rotation={[0.35, 0, 0.2]}>
        <PointCloud positions={positions} colors={colors} size={0.045} opacity={0.5} scale={0.11} />
        <mesh><sphereGeometry args={[0.06, 16, 16]} /><meshBasicMaterial color="#ffffff" /></mesh>
      </group>
    </Spin>
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

export default function Landing() {
  const [leaving, setLeaving] = useState<'atomic' | 'cosmic' | null>(null);
  const reduced = useVoyager((s) => s.settings.reducedMotion);
  const enter = (m: 'atomic' | 'cosmic') => {
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
      <div className="landing-foot">Left: hydrogen 3d<sub>z²</sub> probability density (analytic ψ). Right: planets at today's heliocentric longitudes (JPL elements), distances log-compressed for display.</div>
    </div>
  );
}
