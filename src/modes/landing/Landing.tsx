/**
 * Landing page: five portals.
 *  ATOMIC   — a real hydrogen 3d(z²) probability cloud sampled from ψ_nlm.
 *  COSMIC   — the planets at their actual heliocentric longitudes today (JPL elements),
 *             with radial distances log-compressed for the thumbnail (labelled).
 *  SPECTRAL — the analytic vacuum plane wave (planeE/planeB from em.ts): E ⊥ B ⊥ k, |B| = |E|/c.
 *  BIOLOGIC — the 486 atoms of the B-DNA dodecamer 1BNA (Drew et al. 1981; PDB, CC0), coloured by element.
 *             Until Gate 11.1 this was a greyed-out "CELLULAR — Coming soon" placeholder.
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
import dna from '@datasets/biology/pdb/1BNA.json';
import { principalExtents } from '@/core/biology/structure';
import { standardAtmosphere } from '@/core/meteorology/atmosphere';
import { rippleAdd } from '@/core/computing/logic';

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

/** B-DNA dodecamer 1BNA: every non-water atom from the PDB file, coloured by element (P gold, O red, N blue, C green). */
function BiologicPortalScene() {
  const { positions, colors } = useMemo(() => {
    const d = dna as unknown as { cols: { xyz: number[]; el: string[] } };
    const n = d.cols.el.length;
    const pos = new Float32Array(d.cols.xyz);
    let cx = 0, cy = 0, cz = 0;
    for (let i = 0; i < n; i++) { cx += pos[3 * i]; cy += pos[3 * i + 1]; cz += pos[3 * i + 2]; }
    cx /= n; cy /= n; cz /= n;
    // turn the helix axis (the longest principal axis) to the vertical so it spins about its own axis
    const [ax, b2, b3] = principalExtents(d.cols.xyz).axes;
    for (let i = 0; i < n; i++) {
      const v = [pos[3 * i] - cx, pos[3 * i + 1] - cy, pos[3 * i + 2] - cz];
      pos[3 * i] = v[0] * b2[0] + v[1] * b2[1] + v[2] * b2[2];
      pos[3 * i + 1] = v[0] * ax[0] + v[1] * ax[1] + v[2] * ax[2];
      pos[3 * i + 2] = v[0] * b3[0] + v[1] * b3[1] + v[2] * b3[2];
    }
    const palette: Record<string, [number, number, number]> = { P: [1, 0.78, 0.35], O: [1, 0.45, 0.45], N: [0.45, 0.6, 1], C: [0.36, 0.95, 0.65] };
    const col = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) col.set(palette[d.cols.el[i]] ?? [0.8, 0.8, 0.8], i * 3);
    return { positions: pos, colors: col };
  }, []);
  return (
    <group position={[2.3, 0.85, 0]} rotation={[0.15, 0, -0.3]}><Spin speed={0.3}>
      <PointCloud positions={positions} colors={colors} size={0.13} opacity={0.9} scale={0.075} />
    </Spin></group>
  );
}

/** ENGINEERING — a 5-bit ripple-carry adder evaluated gate by gate (rippleAdd), adding today's day of the month
 *  and month number: every 1 bit lit is a real output of the logic. Drawn in SVG, no 3D. */
function EngineeringPortalScene() {
  const now = new Date(), x = now.getDate(), y = now.getMonth() + 1, n = 5;
  const r = rippleAdd(x, y, n);
  const col = (on: number) => (on ? '#ff8a65' : 'rgba(255,138,101,0.18)');
  const W = 600, H = 300, cx = (i: number) => W - 70 - i * 95;
  return (
    <svg className="portal-canvas" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMaxYMin meet" aria-hidden="true">
      {r.stages.map((s, i) => (
        <g key={i}>
          <circle cx={cx(i) - 14} cy={34} r={8} fill={col(s.a)} /><circle cx={cx(i) + 14} cy={34} r={8} fill={col(s.b)} />
          <line x1={cx(i) - 14} x2={cx(i) - 14} y1={42} y2={64} stroke={col(s.a)} strokeWidth={2} />
          <line x1={cx(i) + 14} x2={cx(i) + 14} y1={42} y2={64} stroke={col(s.b)} strokeWidth={2} />
          <rect x={cx(i) - 30} y={64} width={60} height={52} rx={8} fill="none" stroke={col(1)} strokeOpacity={0.55} />
          <text x={cx(i)} y={95} textAnchor="middle" fontSize={13} fill="#ff8a65" opacity={0.7}>FA</text>
          <line x1={cx(i)} x2={cx(i)} y1={116} y2={136} stroke={col(s.sum)} strokeWidth={2} /><circle cx={cx(i)} cy={146} r={10} fill={col(s.sum)} />
          {i < n - 1 && <line x1={cx(i) - 30} x2={cx(i + 1) + 30} y1={90} y2={90} stroke={col(s.cout)} strokeWidth={2} />}
        </g>
      ))}
      <text x={W - 34} y={38} fontSize={11} fill="#ff8a65" opacity={0.6} textAnchor="end" transform={`translate(0 -16)`}>{x} + {y}</text>
      <text x={W - 34} y={176} fontSize={11} fill="#ff8a65" opacity={0.6} textAnchor="end">= {r.total}</text>
    </svg>
  );
}

/** METEOROLOGY — the U.S. Standard Atmosphere 1976 temperature profile, 0–86 km, with its layer boundaries: every
 *  point is computed from the standard's layer table. Drawn in SVG, no 3D. */
function MeteorologyPortalScene() {
  const W = 600, H = 300, x = (T: number) => 330 + (T - 186) * 2.2, y = (z: number) => H - 20 - (z / 86000) * (H - 40);
  const pts = Array.from({ length: 173 }, (_, i) => { const z = i * 500, s = standardAtmosphere(z); return `${x(s.T)},${y(z)}`; }).join(' ');
  return (
    <svg className="portal-canvas" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMaxYMin meet" aria-hidden="true">
      {[11000, 20000, 47000, 51000, 71000].map((h) => <line key={h} x1={300} x2={W - 10} y1={y(h)} y2={y(h)} stroke="#82b1ff" strokeOpacity={0.15} />)}
      <polyline points={pts} fill="none" stroke="#82b1ff" strokeWidth={2.5} />
      {[[5000, 'troposphere'], [32000, 'stratosphere'], [62000, 'mesosphere']].map(([h, l]) => <text key={l} x={W - 14} y={y(h as number)} textAnchor="end" fontSize={11} fill="#82b1ff" opacity={0.55}>{l}</text>)}
    </svg>
  );
}

type Live = 'atomic' | 'cosmic' | 'spectral' | 'biologic' | 'engineering' | 'meteorology';

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
        <p>A SCIENTIFIC SANDBOX FROM ATOMS TO GALAXIES, LIVING CELLS AND THE MACHINES WE BUILD</p>
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
      <button className={`portal biologic ${leaving === 'biologic' ? 'zoom' : leaving ? 'fade' : ''}`} onClick={() => enter('biologic')} aria-label="Enter Biologic mode">
        <Viewport className="portal-canvas" camera={{ position: [0, 0, 6.2], fov: 45 }}><BiologicPortalScene /></Viewport>
        <div className="portal-text">
          <h2>BIOLOGIC</h2>
          <p>Molecules, cells and the machinery of life.</p>
          <span className="cta">ENTER →</span>
        </div>
      </button>
      <button className={`portal engineering ${leaving === 'engineering' ? 'zoom' : leaving ? 'fade' : ''}`} onClick={() => enter('engineering')} aria-label="Enter Engineering mode">
        <EngineeringPortalScene />
        <div className="portal-text">
          <h2>ENGINEERING</h2>
          <p>Logic, computers and the machines built on science.</p>
          <span className="cta">ENTER →</span>
        </div>
      </button>
      <button className={`portal meteorology ${leaving === 'meteorology' ? 'zoom' : leaving ? 'fade' : ''}`} onClick={() => enter('meteorology')} aria-label="Enter Meteorology mode">
        <MeteorologyPortalScene />
        <div className="portal-text">
          <h2>METEOROLOGY</h2>
          <p>Air, weather and the climates of worlds.</p>
          <span className="cta">ENTER →</span>
        </div>
      </button>
      <div className="landing-foot">Atomic: hydrogen 3d<sub>z²</sub> probability density (analytic ψ). Cosmic: planets at today's heliocentric longitudes (JPL elements), distances log-compressed. Spectral: analytic vacuum plane wave, E ⊥ B ⊥ k, |B| = |E|/c. Biologic: atoms of the B-DNA dodecamer 1BNA (Drew et al. 1981, Protein Data Bank). Engineering: a 5-bit ripple-carry adder evaluated gate by gate, adding today’s day and month. Meteorology: temperature against height in the U.S. Standard Atmosphere, 1976.</div>
    </div>
  );
}
