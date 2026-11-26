/**
 * Molecular 3D renderer. Coordinates are used exactly as stored (Å, 1 Å = 1 scene unit);
 * only atom/bond *drawing radii* depend on the display mode.
 */
import { useMemo } from 'react';
import { OrbitControls } from '@react-three/drei';
import { TextSprite } from '@/rendering/labels';
import * as THREE from 'three';
import { cpkColor } from '@/rendering/colors';
import { ELEMENTS } from '../atoms/elements';
import { centroid, type MoleculeRecord } from './molecules';

export type MolDisplay = 'ball-stick' | 'space-fill' | 'stick' | 'wireframe';

const vdwAngstrom = (Z: number) => (ELEMENTS[Z - 1].vanDerWaalsRadiusPm ?? 170) / 100;

function Bond({ a, b, order, radius, colorA, colorB, wire }: { a: THREE.Vector3; b: THREE.Vector3; order: number; radius: number; colorA: string; colorB: string; wire: boolean }) {
  const dir = new THREE.Vector3().subVectors(b, a);
  const len = dir.length();
  const mid = new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
  // perpendicular offset for multiple bonds
  const perp = new THREE.Vector3().crossVectors(dir, Math.abs(dir.y) < 0.9 * len ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0)).normalize();
  const offsets = order === 1 ? [0] : order === 2 ? [-1, 1] : [-1.6, 0, 1.6];
  const r = order === 1 ? radius : radius * 0.62;
  if (wire) {
    return (
      <>
        {offsets.map((o, i) => {
          const off = perp.clone().multiplyScalar(o * radius * 1.6);
          const g = new THREE.BufferGeometry().setFromPoints([a.clone().add(off), mid.clone().add(off), b.clone().add(off)]);
          g.setAttribute('color', new THREE.Float32BufferAttribute([...new THREE.Color(colorA).toArray(), ...new THREE.Color(colorA).toArray(), ...new THREE.Color(colorB).toArray()], 3));
          return <primitive key={i} object={new THREE.Line(g, new THREE.LineBasicMaterial({ vertexColors: true }))} />;
        })}
      </>
    );
  }
  return (
    <>
      {offsets.map((o, i) => {
        const off = perp.clone().multiplyScalar(o * radius * 1.25);
        const half = len / 2;
        return (
          <group key={i}>
            <mesh position={new THREE.Vector3().addVectors(a, dir.clone().multiplyScalar(0.25)).add(off)} quaternion={q}>
              <cylinderGeometry args={[r, r, half, 14]} /><meshStandardMaterial color={colorA} roughness={0.4} />
            </mesh>
            <mesh position={new THREE.Vector3().addVectors(a, dir.clone().multiplyScalar(0.75)).add(off)} quaternion={q}>
              <cylinderGeometry args={[r, r, half, 14]} /><meshStandardMaterial color={colorB} roughness={0.4} />
            </mesh>
          </group>
        );
      })}
    </>
  );
}

export function MoleculeSceneContents({ mol, display, selected, onPick, showLabels }: { mol: MoleculeRecord; display: MolDisplay; selected: number[]; onPick: (i: number) => void; showLabels: boolean }) {
  const c = useMemo(() => centroid(mol), [mol]);
  const pts = useMemo(() => mol.atoms.map((a) => new THREE.Vector3(a.x - c[0], a.y - c[1], a.z - c[2])), [mol, c]);
  const extent = useMemo(() => Math.max(1.5, ...pts.map((p) => p.length())), [pts]);
  const atomRadius = (Z: number) => display === 'space-fill' ? vdwAngstrom(Z) : display === 'ball-stick' ? vdwAngstrom(Z) * 0.24 : display === 'stick' ? 0.14 : 0.05;
  const bondRadius = display === 'stick' ? 0.14 : 0.075;
  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[5, 8, 6]} intensity={2.2} />
      <directionalLight position={[-6, -3, -4]} intensity={0.6} color="#7df9ff" />
      <group>
        {display !== 'space-fill' && mol.bonds.map((b, i) => (
          <Bond key={i} a={pts[b.a]} b={pts[b.b]} order={b.order} radius={bondRadius} colorA={cpkColor(mol.atoms[b.a].Z)} colorB={cpkColor(mol.atoms[b.b].Z)} wire={display === 'wireframe'} />
        ))}
        {mol.atoms.map((a, i) => (
          <mesh key={i} position={pts[i]} onClick={(e) => { e.stopPropagation(); onPick(i); }} onPointerOver={() => (document.body.style.cursor = 'pointer')} onPointerOut={() => (document.body.style.cursor = '')}>
            <sphereGeometry args={[atomRadius(a.Z), display === 'space-fill' ? 40 : 24, display === 'space-fill' ? 40 : 24]} />
            <meshStandardMaterial color={cpkColor(a.Z)} roughness={0.35} metalness={0.05} emissive={selected.includes(i) ? '#7df9ff' : '#000000'} emissiveIntensity={selected.includes(i) ? 0.7 : 0} />
            {(showLabels || selected.includes(i)) && (
              <TextSprite text={`${ELEMENTS[a.Z - 1].symbol}${selected.includes(i) ? ` #${i + 1}` : ''}${a.charge ? (a.charge > 0 ? '⁺' : '⁻') : ''}`} position={[atomRadius(a.Z) + 0.15, atomRadius(a.Z) + 0.1, 0]} height={0.26 + extent * 0.02} color={selected.includes(i) ? '#7df9ff' : '#e6ecff'} />
            )}
          </mesh>
        ))}
      </group>
      <OrbitControls enableDamping makeDefault minDistance={1} maxDistance={extent * 8} />
    </>
  );
}

export const cameraDistanceFor = (mol: MoleculeRecord) => {
  const c = centroid(mol);
  return Math.max(4, 3.2 * Math.max(...mol.atoms.map((a) => Math.hypot(a.x - c[0], a.y - c[1], a.z - c[2]))) + 3);
};
