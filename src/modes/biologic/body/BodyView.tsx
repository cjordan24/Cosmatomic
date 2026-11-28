/**
 * The human body — #/biologic/body?sel=<organ>&hide=<organ,…>&iso=1   (Phase 12, Gate 12.1)
 *
 * Eleven organs and the skeleton from BodyParts3D 4.0 (DBCLS, CC BY 4.0), decimated in Blender and loaded lazily
 * (public/models/body-organs.glb, ~3 MB). Click an organ to select it; hide or isolate organs; the panel gives the
 * organ's quoted facts (NCI SEER, NHLBI, NIDDK) and the model's own size and volume from the full-resolution files.
 * The ten organ systems are listed as SEER names them.
 */
import { Suspense, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls, useGLTF } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { navigate, setQuery, useRoute } from '@/shared/router';
import { KV, Panel, ProvenanceBadge } from '@/ui/components';
import { SourceLinks } from '@/ui/SourcesView';
import { RelatedLinks } from '@/ui/RelatedLinks';
import { Viewport } from '@/rendering/Viewport';
import data from '@datasets/biology/body.json';

interface Fact { text: string; source: string; url: string }
interface Organ { id: string; label: string; system: string; note: string | null; facts: Fact[]; model: { files: number; volumeCm3: number; extentMm: number[]; boundsMm: { min: number[]; max: number[] }; trianglesFull: number; trianglesDecimated: number } }
const B = data as unknown as { systems: { quote: string; list: string[]; source: string; url: string }; organs: Organ[] };
export const ORGANS = B.organs;
const GLB = `${import.meta.env.BASE_URL}models/body-organs.glb`;
export const SYSTEM_COLOR: Record<string, string> = {
  Skeletal: '#e8e2d0', Cardiovascular: '#ff5a6e', Respiratory: '#7df9ff', Nervous: '#f5c76b', Digestive: '#c99a6b', Urinary: '#b18cff',
};
/** Organ links into other views (Gates 12.2–12.7 add more). */
const LINKS: Record<string, { label: string; to: string }[]> = {
  heart: [{ label: 'Haemoglobin, the oxygen carrier', to: '/biologic/proteins?id=4HHB' }],
  brain: [{ label: 'Nerve cells and the membrane potential', to: '/biologic/membranes' }],
  'right-kidney': [{ label: 'Osmosis', to: '/biologic/transport?tab=osmosis' }],
  'left-kidney': [{ label: 'Osmosis', to: '/biologic/transport?tab=osmosis' }],
  liver: [{ label: 'Glucose', to: '/biologic/molecules?tab=carbs&sel=pubchem-5793' }],
};

function BodyModel({ sel, hidden, iso }: { sel: string | null; hidden: Set<string>; iso: boolean }) {
  const { scene } = useGLTF(GLB);
  const model = useMemo(() => {
    const root = scene.clone(true);
    const box = new THREE.Box3().setFromObject(root);
    const c = box.getCenter(new THREE.Vector3());
    root.position.sub(c);
    root.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      const organ = ORGANS.find((x) => x.id === m.name || x.id === m.parent?.name);
      m.userData.organ = organ?.id ?? m.name;
      m.material = new THREE.MeshStandardMaterial({ color: SYSTEM_COLOR[organ?.system ?? 'Skeletal'] ?? '#cccccc', roughness: 0.55, metalness: 0.05, transparent: true });
    });
    return root;
  }, [scene]);
  useEffect(() => {
    model.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      const id = m.userData.organ as string, mat = m.material as THREE.MeshStandardMaterial;
      m.visible = !hidden.has(id) && (!iso || !sel || id === sel);
      const selected = id === sel;
      mat.emissive.set(selected ? '#5cf2a6' : '#000000');
      mat.emissiveIntensity = selected ? 0.35 : 0;
      mat.opacity = id === 'skeleton' && sel && sel !== 'skeleton' ? 0.25 : 1;
      mat.depthWrite = mat.opacity === 1;
    });
  }, [model, sel, hidden, iso]);
  useEffect(() => () => { model.traverse((o) => { const m = o as THREE.Mesh; if (m.isMesh) (m.material as THREE.Material).dispose(); }); }, [model]);
  // frame the isolated organ (or the whole body) with the camera
  const { camera, controls } = useThree() as unknown as { camera: THREE.PerspectiveCamera; controls: { target: THREE.Vector3; update: () => void } | null };
  useEffect(() => {
    const box = new THREE.Box3();
    model.updateMatrixWorld(true);
    model.traverse((o) => { const m = o as THREE.Mesh; if (m.isMesh && m.visible) box.expandByObject(m); });
    if (box.isEmpty()) return;
    const c = box.getCenter(new THREE.Vector3()), r = box.getSize(new THREE.Vector3()).length() / 2;
    const dist = r / Math.sin(((camera.fov / 2) * Math.PI) / 180) * 1.1;
    const dir = camera.position.clone().sub(controls?.target ?? new THREE.Vector3()).normalize();
    camera.position.copy(c.clone().add(dir.multiplyScalar(dist)));
    controls?.target.copy(c); controls?.update();
  }, [model, iso, sel, hidden, camera, controls]);
  return (
    <primitive object={model} onClick={(e: { stopPropagation: () => void; object: THREE.Object3D }) => { e.stopPropagation(); const id = e.object.userData.organ as string; if (id) setQuery({ sel: id }); }} />
  );
}

export default function BodyView() {
  const { query } = useRoute();
  const sel = ORGANS.some((o) => o.id === query.get('sel')) ? query.get('sel') : null;
  const hidden = new Set((query.get('hide') ?? '').split(',').filter(Boolean));
  const iso = query.get('iso') === '1';
  const o = sel ? ORGANS.find((x) => x.id === sel)! : null;
  const toggle = (id: string) => { const h = new Set(hidden); h.has(id) ? h.delete(id) : h.add(id); setQuery({ hide: h.size ? [...h].join(',') : null }); };
  return (
    <>
      <Panel id="body-list" className="left-panel" title="Organs">
        <ol className="life-list" aria-label="Organ list">
          {ORGANS.map((x) => (
            <li key={x.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input type="checkbox" checked={!hidden.has(x.id)} aria-label={`Show ${x.label}`} onChange={() => toggle(x.id)} />
              <span style={{ color: SYSTEM_COLOR[x.system] }}>●</span>
              <button className={`link-btn ${x.id === sel ? 'active' : ''}`} onClick={() => setQuery({ sel: x.id })}>{x.label}</button>
            </li>
          ))}
        </ol>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
          <button className={`chip ${iso ? 'active' : ''}`} aria-pressed={iso} disabled={!sel} onClick={() => setQuery({ iso: iso ? null : '1' })}>Isolate selected</button>
          <button className="chip" onClick={() => setQuery({ sel: null, hide: null, iso: null })}>Reset</button>
        </div>
        <h4 style={{ margin: '12px 0 4px' }}>Organ systems</h4>
        <p className="note" style={{ margin: 0 }}>“{B.systems.quote}” {B.systems.list.join(' · ')} <SourceLinks ids={['seer-training']} /></p>
        <p className="note">Shown here: {[...new Set(ORGANS.map((x) => x.system))].join(', ')}. Muscles, glands, vessels and the reproductive and lymphatic organs are not in this model.</p>
      </Panel>
      <div className="center-stage" style={{ padding: 0 }}>
        <div style={{ position: 'absolute', inset: 0 }} aria-label="3D human body" data-ready="1">
          <Viewport camera={{ position: [0, 0.15, 2.8], fov: 40 }}>
            <ambientLight intensity={0.55} /><directionalLight position={[2, 3, 4]} intensity={1.6} /><directionalLight position={[-3, -1, -2]} intensity={0.5} />
            <Suspense fallback={null}><BodyModel sel={sel} hidden={hidden} iso={iso} /></Suspense>
            <OrbitControls makeDefault enablePan target={[0, 0.15, 0]} minDistance={0.3} maxDistance={6} />
          </Viewport>
        </div>
        <div className="stage-head" style={{ position: 'absolute', left: 16, top: 12, right: 16, pointerEvents: 'none' }}>
          <h1>The human body <ProvenanceBadge cls="observed" title="BodyParts3D 4.0 anatomical models (DBCLS), decimated for display" /></h1>
          <p className="note" style={{ maxWidth: 560 }}>Organs from BodyParts3D, © The Database Center for Life Science, CC BY 4.0 (decimated). Drag to rotate, scroll to zoom, click an organ. <SourceLinks ids={['bodyparts3d']} /></p>
        </div>
      </div>
      <Panel id="body-detail" className="right-panel" title={o ? o.label : 'Select an organ'}>
        {o ? (
          <>
            <p className="note" style={{ marginTop: 0 }}><span style={{ color: SYSTEM_COLOR[o.system] }}>●</span> {o.system} system</p>
            {o.facts.map((f, i) => <blockquote key={i} className="quote">“{f.text}” <SourceLinks ids={[f.source]} /></blockquote>)}
            {o.note && <p className="note warn-note">{o.note}</p>}
            <h4 style={{ margin: '10px 0 4px' }}>This model <ProvenanceBadge cls="observed" title="From the full-resolution BodyParts3D OBJ headers" /></h4>
            <dl className="kv" aria-label="Model measurements">
              <KV k="Size (x · y · z)" v={o.model.extentMm.map((x) => (x / 10).toFixed(1)).join(' × ')} unit="cm" title="Bounding box of the full-resolution parts; z is head-to-foot" />
              <KV k="Volume of its parts" v={o.model.volumeCm3} unit="cm³" sig={4} />
              <KV k="Files joined" v={o.model.files} />
              <KV k="Triangles (full → shown)" v={`${o.model.trianglesFull.toLocaleString('en-GB')} → ${o.model.trianglesDecimated.toLocaleString('en-GB')}`} />
            </dl>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{LINKS[o.id]?.map((l) => <button key={l.to} className="chip" onClick={() => navigate(l.to)}>{l.label} →</button>)}</div>
            <RelatedLinks id={`structure:organ-${o.id}`} limit={4} />
          </>
        ) : <p className="note">Click an organ in the model or the list. Sizes shown are this model's, not population averages.</p>}
      </Panel>
    </>
  );
}
