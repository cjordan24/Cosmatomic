/**
 * Interactive 3D builder scene. Clicks are interpreted by the active tool; dragging uses a
 * camera-facing work plane through the grabbed atom. Coordinates are Å (1 Å = 1 scene unit)
 * and are NOT re-centred, so what you click is exactly where atoms go.
 */
import { useRef, useState } from 'react';
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { cpkColor } from '@/rendering/colors';
import { TextSprite } from '@/rendering/labels';
import { ELEMENTS } from '../atoms/elements';
import { Bond, vdwAngstrom } from '../molecules/MoleculeScene';
import { addAtom, addBondedAtom, centroidOf, cycleCharge, deleteAtom, deleteBond, duplicateFragment, fragmentOf, moveAtom, replaceElement, toggleBond, translateAtoms, bondInRing, type Structure } from './builder';
import { useLab } from './store';
import type { Vec3 } from '@/core/mathematics/vec3';

const v3 = (a: { x: number; y: number; z: number }) => new THREE.Vector3(a.x, a.y, a.z);

/** Invisible camera-facing plane used to turn screen clicks/drags into 3D points. */
function WorkPlane({ onPick, onMove, onUp, anchor }: { onPick: (p: Vec3) => void; onMove: (p: Vec3) => void; onUp: () => void; anchor: THREE.Vector3 }) {
  const ref = useRef<THREE.Mesh>(null);
  const { camera } = useThree();
  useFrame(() => { if (ref.current) { ref.current.position.copy(anchor); ref.current.quaternion.copy(camera.quaternion); } });
  const pt = (e: ThreeEvent<PointerEvent | MouseEvent>): Vec3 => [e.point.x, e.point.y, e.point.z];
  return (
    <mesh ref={ref} onClick={(e) => { if (e.delta < 4) onPick(pt(e)); }} onPointerMove={(e) => onMove(pt(e))} onPointerUp={onUp}>
      <planeGeometry args={[400, 400]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} side={THREE.DoubleSide} />
    </mesh>
  );
}

export function LabScene() {
  const { s, tool, Z, pendingAtom, selectedBond } = useLab();
  const lab = useLab.getState;
  const controls = useThree((st) => st.controls) as unknown as { enabled: boolean } | null;
  const drag = useRef<{ idx: number[]; from: Structure; start: Vec3 } | null>(null);
  const [anchor, setAnchor] = useState(() => new THREE.Vector3(...centroidOf(s)));
  const bondTool = tool === 'bond' || tool === 'delete' || tool === 'rotate';

  const onAtom = (i: number, e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (e.delta > 4) return; // it was an orbit drag
    const st = lab();
    switch (tool) {
      case 'grow': st.apply(addBondedAtom(st.s, i, Z), `add ${ELEMENTS[Z - 1].symbol}`); break;
      case 'bond':
        if (st.pendingAtom === null) st.set({ pendingAtom: i, notice: 'Now click the second atom (click a bonded pair again to cycle 1 → 2 → 3).' });
        else { if (st.pendingAtom !== i) st.apply(toggleBond(st.s, st.pendingAtom, i), 'bond'); st.set({ pendingAtom: null }); }
        break;
      case 'charge': st.apply(cycleCharge(st.s, i), 'charge'); break;
      case 'replace': st.apply(replaceElement(st.s, i, Z), `replace with ${ELEMENTS[Z - 1].symbol}`); break;
      case 'delete': st.apply(deleteAtom(st.s, i), 'delete'); break;
      case 'duplicate': st.apply(duplicateFragment(st.s, i, [3.5, 0, 0]), 'duplicate'); break;
      default: break;
    }
  };

  const onAtomDown = (i: number, e: ThreeEvent<PointerEvent>) => {
    if (tool !== 'move' && tool !== 'move-fragment') return;
    e.stopPropagation();
    const st = lab();
    const a = st.s.atoms[i];
    setAnchor(new THREE.Vector3(a.x, a.y, a.z));
    drag.current = { idx: tool === 'move' ? [i] : fragmentOf(st.s, i), from: st.s, start: [a.x, a.y, a.z] };
    if (controls) controls.enabled = false;
  };
  const onMove = (p: Vec3) => {
    const d = drag.current;
    if (!d) return;
    const delta: Vec3 = [p[0] - d.start[0], p[1] - d.start[1], p[2] - d.start[2]];
    lab().preview(d.idx.length === 1 ? moveAtom(d.from, d.idx[0], [d.start[0] + delta[0], d.start[1] + delta[1], d.start[2] + delta[2]]) : translateAtoms(d.from, d.idx, delta));
  };
  const onUp = () => {
    const d = drag.current;
    if (!d) return;
    drag.current = null;
    if (controls) controls.enabled = true;
    lab().commit(d.from);
  };
  const onBackground = (p: Vec3) => {
    const st = lab();
    if (tool === 'grow' || st.s.atoms.length === 0) st.apply(addAtom(st.s, Z, p), `place ${ELEMENTS[Z - 1].symbol}`);
    st.set({ pendingAtom: null, selectedBond: null });
  };
  const onBond = (k: number, e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (e.delta > 4) return;
    const st = lab();
    if (tool === 'delete') st.apply(deleteBond(st.s, k), 'delete bond');
    else if (tool === 'bond') { const b = st.s.bonds[k]; st.apply(toggleBond(st.s, b.a, b.b), 'bond order'); }
    else if (tool === 'rotate') {
      if (bondInRing(st.s, k)) st.set({ notice: 'Ring bonds cannot be rotated.', selectedBond: null });
      else st.set({ selectedBond: k, notice: null });
    }
  };

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 8, 6]} intensity={2.1} />
      <directionalLight position={[-6, -3, -4]} intensity={0.6} color="#7df9ff" />
      <WorkPlane anchor={anchor} onPick={onBackground} onMove={onMove} onUp={onUp} />
      {s.bonds.map((b, k) => {
        const pa = v3(s.atoms[b.a]), pb = v3(s.atoms[b.b]);
        const mid = pa.clone().add(pb).multiplyScalar(0.5);
        const len = pa.distanceTo(pb);
        const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), pb.clone().sub(pa).normalize());
        return (
          <group key={`b${k}`}>
            <Bond a={pa} b={pb} order={b.order} radius={0.08} colorA={k === selectedBond ? '#7df9ff' : cpkColor(s.atoms[b.a].Z)} colorB={k === selectedBond ? '#7df9ff' : cpkColor(s.atoms[b.b].Z)} wire={false} />
            {/* fat invisible hit target so thin bonds are easy to click — ONLY for bond-level tools,
                otherwise it would intercept clicks meant for atoms behind it */}
            {bondTool && <mesh position={mid} quaternion={q} onClick={(e) => onBond(k, e)}>
              <cylinderGeometry args={[0.22, 0.22, Math.max(0.1, len - 0.6), 8]} />
              <meshBasicMaterial transparent opacity={0} depthWrite={false} />
            </mesh>}
          </group>
        );
      })}
      {s.atoms.map((a, i) => {
        const r = vdwAngstrom(a.Z) * 0.26;
        const hl = i === pendingAtom;
        return (
          <group key={`a${i}`} position={[a.x, a.y, a.z]}>
            <mesh onClick={(e) => onAtom(i, e)} onPointerDown={(e) => onAtomDown(i, e)} onPointerUp={onUp}>
              <sphereGeometry args={[r, 28, 28]} />
              <meshStandardMaterial color={cpkColor(a.Z)} roughness={0.35} emissive={hl ? '#7df9ff' : '#000'} emissiveIntensity={hl ? 0.8 : 0} />
            </mesh>
            {(a.Z !== 1 || a.charge !== 0) && (
              <TextSprite text={`${ELEMENTS[a.Z - 1].symbol}${a.charge ? (a.charge > 0 ? '⁺' : '⁻') : ''}`} position={[r + 0.12, r + 0.08, 0]} height={0.3} color={a.charge ? '#f5c76b' : '#e6ecff'} />
            )}
          </group>
        );
      })}
      <gridHelper args={[20, 20, '#1c2a4a', '#111a30']} position={[0, -4, 0]} />
      <OrbitControls makeDefault enableDamping />
    </>
  );
}
