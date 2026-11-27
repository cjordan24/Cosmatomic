/**
 * Label primitives (replace drei <Html>, whose DOM teardown raced with Canvas
 * unmounting under React 19 and threw "removeChild" errors).
 *
 *  TextSprite   — static in-scene text rendered to a CanvasTexture (atomic & molecular views).
 *  LabelLayer   — clickable DOM labels positioned by projecting 3D anchors every frame.
 *                 The DOM lives OUTSIDE the Canvas, so React owns it normally.
 */
import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ------------------------------------------------------------------ TextSprite
export function TextSprite({ text, position = [0, 0, 0], height = 0.22, color = '#e6ecff' }: { text: string; position?: [number, number, number]; height?: number; color?: string }) {
  const { texture, aspect } = useMemo(() => {
    const px = 64, pad = 12;
    const c = document.createElement('canvas');
    const g = c.getContext('2d')!;
    g.font = `500 ${px}px Inter, system-ui, sans-serif`;
    const w = Math.ceil(g.measureText(text).width) + pad * 2;
    c.width = w; c.height = px + pad * 2;
    g.font = `500 ${px}px Inter, system-ui, sans-serif`;
    g.textBaseline = 'middle';
    g.shadowColor = 'rgba(0,0,0,0.9)'; g.shadowBlur = 10;
    g.fillStyle = color;
    g.fillText(text, pad, c.height / 2);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return { texture: t, aspect: c.width / c.height };
  }, [text, color]);
  useEffect(() => () => texture.dispose(), [texture]);
  return (
    <sprite position={position} scale={[height * aspect, height, 1]} renderOrder={10}>
      <spriteMaterial map={texture} transparent depthTest={false} depthWrite={false} />
    </sprite>
  );
}

// ------------------------------------------------------------------ projected DOM labels
export class LabelLayer {
  anchors = new Map<string, THREE.Object3D>();
  elements = new Map<string, HTMLElement>();
  /** extra visibility predicate set by the scene (decluttering) */
  hidden = new Set<string>();
  /** when true, a label that would overlap one already placed this frame is hidden (labels are placed in insertion order) */
  declutter = false;
  /** label placed before all others (e.g. the selected object) */
  first: string | null = null;
}

/** Place inside the Canvas: projects every registered anchor to screen space each frame. */
export function LabelProjector({ layer }: { layer: LabelLayer }) {
  const v = useMemo(() => new THREE.Vector3(), []);
  useFrame(({ camera, size }) => {
    const placed: [number, number, number, number][] = [];
    const order = layer.first && layer.elements.has(layer.first) ? [[layer.first, layer.elements.get(layer.first)!] as const, ...[...layer.elements].filter(([k]) => k !== layer.first)] : layer.elements;
    for (const [id, el] of order) {
      const obj = layer.anchors.get(id);
      if (!obj) { el.style.display = 'none'; continue; }
      obj.getWorldPosition(v);
      v.project(camera);
      const onScreen = v.z > -1 && v.z < 1 && Math.abs(v.x) < 1.1 && Math.abs(v.y) < 1.1;
      if (!onScreen || layer.hidden.has(id)) { el.style.display = 'none'; continue; }
      const x = ((v.x + 1) / 2) * size.width, y = ((1 - v.y) / 2) * size.height;
      if (layer.declutter) {
        const w = el.offsetWidth || 8 * (el.textContent?.length ?? 4), h = 14;
        if (placed.some(([a, b, c, d]) => x < c && x + w > a && y - h / 2 < d && y + h / 2 > b)) { el.style.display = 'none'; continue; }
        placed.push([x - 4, y - h / 2 - 2, x + w + 4, y + h / 2 + 2]);
      }
      el.style.display = 'flex';
      el.style.transform = `translate(${x}px, ${y}px)`;
    }
  });
  return null;
}

/** Invisible 3D anchor registered with the layer. */
export function LabelAnchor({ layer, id }: { layer: LabelLayer; id: string }) {
  const ref = useRef<THREE.Object3D>(null);
  useEffect(() => {
    const o = ref.current;
    if (o) layer.anchors.set(id, o);
    return () => { layer.anchors.delete(id); };
  }, [layer, id]);
  return <object3D ref={ref} />;
}

/** Overlay rendered next to (not inside) the Canvas. */
export function LabelOverlay({ layer, labels }: { layer: LabelLayer; labels: { id: string; content: React.ReactNode; className?: string; style?: React.CSSProperties; onClick?: () => void }[] }) {
  return (
    <div
      className="label-overlay"
      aria-hidden="false"
      onWheel={(e) => {
        // labels sit above the canvas: forward wheel so zooming works with the cursor over a label
        const canvas = (e.currentTarget.parentElement ?? document).querySelector('canvas');
        canvas?.dispatchEvent(new WheelEvent('wheel', { deltaX: e.deltaX, deltaY: e.deltaY, deltaMode: e.deltaMode, clientX: e.clientX, clientY: e.clientY, bubbles: true, cancelable: true }));
      }}
    >
      {labels.map((l) => (
        <div
          key={l.id}
          ref={(el) => { if (el) layer.elements.set(l.id, el); else layer.elements.delete(l.id); }}
          className={`label3d ${l.className ?? ''}`}
          style={{ ...l.style, display: 'none' }}
          onClick={l.onClick}
          role={l.onClick ? 'button' : undefined}
        >
          {l.content}
        </div>
      ))}
    </div>
  );
}
