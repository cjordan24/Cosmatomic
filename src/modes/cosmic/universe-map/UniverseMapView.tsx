/**
 * Universe map — #/cosmic/map?z=<log₁₀ view radius in metres>&sel=<object id>   (Phase 10, Gate 10.8)
 *
 * A Sun-centred 3D map in the Galactic frame that zooms continuously from the planets' orbits to the last-scattering
 * surface. Everything is placed at its catalogue position in metres; the scene is one group scaled by 1/R (R the view
 * radius), so the camera only orbits and the wheel changes R logarithmically. Layers fade in and out with the scale.
 * Data and sources: mapData.ts. Point sizes, colours and the sampled Milky Way disc are illustrative; positions are not.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { navigate, setQuery, useRoute } from '@/shared/router';
import { Viewport } from '@/rendering/Viewport';
import { LabelAnchor, LabelLayer, LabelOverlay, LabelProjector } from '@/rendering/labels';
import { KV, Panel, ProvenanceBadge } from '@/ui/components';
import { SourceLinks } from '@/ui/SourcesView';
import { formatSig } from '@/core/units/units';
import { useVoyager } from '@/shared/store';
import { loadCns5, loadTenParsec, type Vec3 } from '@/modes/cosmic/star-systems/stars';
import { orbitPath } from '@/modes/cosmic/solar-system/ephemeris';
import { AU, LAST_SCATTERING, LY, MILKY_WAY, PC, catalogueObjects, eclipticToGalactic, galacticCoords, sampleDisc, solarSystem, starObjects, type Kind, type MapObject } from './mapData';

const Z_MIN = 10.6, Z_MAX = 27.2;
/** Visible range of each layer in log₁₀(R / m): fully visible between b and c, fading over a–b and c–d. */
const LAYERS: Record<string, { label: string; range: [number, number, number, number]; color: string; size: number }> = {
  solar: { label: 'Sun, planets, Voyagers', range: [0, 0, 14.8, 16.2], color: '#f5c76b', size: 7 },
  star: { label: 'Stars within 20 pc (Gaia)', range: [14.6, 15.4, 18.4, 19.6], color: '#cfe3ff', size: 4 },
  nebula: { label: 'Nebulae and compact objects', range: [17.3, 18.0, 21.2, 22.2], color: '#ff7a90', size: 7 },
  disc: { label: 'Milky Way disc (model)', range: [18.4, 19.6, 22.6, 23.8], color: '#9fb8ff', size: 1.4 },
  'local-group': { label: 'Local Group (McConnachie 2012)', range: [20.3, 21.0, 23.6, 24.6], color: '#b18cff', size: 5 },
  galaxy: { label: 'SPARC galaxies and NGC 4258', range: [22.3, 23.0, 26.0, 26.8], color: '#7df9ff', size: 5 },
  cmb: { label: 'Last-scattering surface (z = 1089.8)', range: [24.8, 25.6, 30, 30], color: '#ff9a5c', size: 0 },
};
const layerOf = (k: Kind): string => (k === 'sun' || k === 'planet' || k === 'spacecraft' ? 'solar' : k === 'star' ? 'star' : k === 'nebula' || k === 'compact' || k === 'galactic-centre' ? 'nebula' : k === 'local-group' ? 'local-group' : k === 'galaxy' ? 'galaxy' : 'cmb');
const fade = (z: number, [a, b, c, d]: [number, number, number, number]) => (z < a || z > d ? 0 : z < b ? (z - a) / (b - a) : z > c ? (d - z) / (d - c) : 1);
const PRESETS: [string, number][] = [['Inner planets', 11.6], ['Outer planets', 12.9], ['Voyager 1', 13.6], ['Nearest stars', 17.0], ['Orion Nebula', 19.3], ['Milky Way', 20.9], ['Local Group', 22.6], ['Nearby galaxies', 24.5], ['Observable universe', 26.75]];
const LABELLED_ORDER = ['sun', 'mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'voyager-1', 'voyager-2', 'compact-sgr-a-star', 'compact-m87-star', 'compact-cyg-x1', 'ladder-ngc4258',
  'lg-Andromeda', 'lg-Triangulum', 'lg-LMC', 'lg-SMC', 'lg-Sagittarius dSph', 'lg-Fornax', 'lg-Sculptor', 'lg-NGC 205', 'lg-M32', 'lg-IC 1613', 'lg-NGC 6822', 'lg-Leo I', 'lg-Carina', 'lg-Draco', 'lg-WLM (Wolf-Lundmark-Melotte)', 'lg-NGC 300', 'lg-NGC 3109', 'lg-NGC 55',
  'sparc-NGC3198', 'sparc-UGC02885', 'sparc-NGC2403', 'sparc-NGC7331', 'sparc-NGC5055', 'sparc-NGC6503', 'sparc-DDO154', 'sparc-NGC0891', 'sparc-NGC2841', 'sparc-UGC12591'];
const LABELLED = new Set(LABELLED_ORDER);
const labelRank = (id: string) => { const i = LABELLED_ORDER.indexOf(id); return i < 0 ? 999 : i; };

let NEAR_STARS = new Set<string>();
const isLabelled = (o: MapObject) => LABELLED.has(o.id) || o.kind === 'nebula' || o.kind === 'galactic-centre' || o.kind === 'cmb' || NEAR_STARS.has(o.id);
/** Human-readable distance. */
export function fmtDistance(m: number): string {
  if (m === 0) return '0';
  if (m < 0.5 * LY) return `${formatSig(m / AU, 3)} AU`;
  if (m < 1e3 * LY) return `${formatSig(m / LY, 3)} ly (${formatSig(m / PC, 3)} pc)`;
  if (m < 1e6 * LY) return `${formatSig(m / LY / 1e3, 3)} thousand ly (${formatSig(m / PC / 1e3, 3)} kpc)`;
  if (m < 1e9 * LY) return `${formatSig(m / LY / 1e6, 3)} million ly (${formatSig(m / PC / 1e6, 3)} Mpc)`;
  return `${formatSig(m / LY / 1e9, 3)} billion ly (${formatSig(m / PC / 1e9, 3)} Gpc)`;
}

// ------------------------------------------------------------------ point layer shader
// Positions are in metres: divide by the view radius before taking a length, or |position|² overflows 32-bit floats.
const vertex = /* glsl */ `
  attribute vec3 color; uniform float uSize; uniform float uR; varying vec3 vColor; varying float vFade;
  void main() { vColor = color; vFade = 1.0 - smoothstep(1.2, 3.0, length(position / uR)); vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_PointSize = uSize; gl_Position = projectionMatrix * mv; }`;
const fragment = /* glsl */ `
  varying vec3 vColor; varying float vFade; uniform float uOpacity;
  void main() { vec2 c = gl_PointCoord - 0.5; float d = dot(c, c); if (d > 0.25 || vFade <= 0.0) discard; float a = smoothstep(0.25, 0.0, d); gl_FragColor = vec4(vColor * (0.6 + 0.8 * a), a * uOpacity * vFade); }`;
function makeMaterial(size: number) {
  return new THREE.ShaderMaterial({ vertexShader: vertex, fragmentShader: fragment, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { uOpacity: { value: 1 }, uSize: { value: size }, uR: { value: 1 } } });
}
function pointsGeometry(positions: Float32Array, color: string, jitter = 0) {
  const g = new THREE.BufferGeometry(), c = new THREE.Color(color), n = positions.length / 3, cols = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { const k = 1 - jitter * ((i * 2654435761) % 1000) / 1000; cols[3 * i] = c.r * k; cols[3 * i + 1] = c.g * k; cols[3 * i + 2] = c.b * k; }
  g.setAttribute('position', new THREE.BufferAttribute(positions, 3)); g.setAttribute('color', new THREE.BufferAttribute(cols, 3));
  g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e30);
  return g;
}
const flat = (objs: MapObject[]) => { const a = new Float32Array(objs.length * 3); objs.forEach((o, i) => { a[3 * i] = o.pos[0]; a[3 * i + 1] = o.pos[1]; a[3 * i + 2] = o.pos[2]; }); return a; };

// ------------------------------------------------------------------ scene
function MapScene({ zRef, objects, orbits, labelLayer, visible, selected }: { zRef: React.MutableRefObject<number>; objects: MapObject[]; orbits: Float32Array[]; labelLayer: LabelLayer; visible: Record<string, boolean>; selected: MapObject | null }) {
  const group = useRef<THREE.Group>(null);
  const layers = useMemo(() => {
    const byLayer: Record<string, MapObject[]> = {};
    for (const o of objects) (byLayer[layerOf(o.kind)] ??= []).push(o);
    return Object.entries(byLayer).filter(([k]) => k !== 'cmb').map(([k, objs]) => ({ key: k, geom: pointsGeometry(flat(objs), LAYERS[k].color, 0.3), mat: makeMaterial(LAYERS[k].size) }));
  }, [objects]);
  const disc = useMemo(() => ({ geom: pointsGeometry(sampleDisc(40000), LAYERS.disc.color, 0.6), mat: makeMaterial(LAYERS.disc.size) }), []);
  const orbitMat = useMemo(() => new THREE.LineBasicMaterial({ color: '#f5c76b', transparent: true, opacity: 0.35, depthWrite: false }), []);
  const orbitLines = useMemo(() => orbits.map((pts) => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pts, 3)); g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e30); const l = new THREE.Line(g, orbitMat); l.frustumCulled = false; return l; }), [orbits, orbitMat]);
  const cmbMat = useMemo(() => new THREE.MeshBasicMaterial({ color: LAYERS.cmb.color, wireframe: true, transparent: true, opacity: 0.12, depthWrite: false }), []);
  const ringMat = useMemo(() => new THREE.LineBasicMaterial({ color: '#557', transparent: true, opacity: 0.5, depthWrite: false }), []);
  const ring = useMemo(() => { const g = new THREE.BufferGeometry(), n = 128, a = new Float32Array((n + 1) * 3); for (let i = 0; i <= n; i++) { a[3 * i] = Math.cos((2 * Math.PI * i) / n); a[3 * i + 1] = Math.sin((2 * Math.PI * i) / n); } g.setAttribute('position', new THREE.BufferAttribute(a, 3)); return g; }, []);
  const ringRef = useRef<THREE.LineLoop>(null), cmbRef = useRef<THREE.Mesh>(null), selRef = useRef<THREE.Mesh>(null);
  useFrame(({ camera }) => {
    const z = zRef.current, R = 10 ** z, s = 1 / R;
    if (group.current) group.current.scale.setScalar(s);
    for (const l of layers) { l.mat.uniforms.uOpacity.value = visible[l.key] === false ? 0 : fade(z, LAYERS[l.key].range); l.mat.uniforms.uR.value = R; }
    disc.mat.uniforms.uR.value = R * 4;
    disc.mat.uniforms.uOpacity.value = visible.disc === false ? 0 : 0.55 * fade(z, LAYERS.disc.range);
    orbitMat.opacity = visible.solar === false ? 0 : 0.35 * fade(z, LAYERS.solar.range);
    cmbMat.opacity = visible.cmb === false ? 0 : 0.12 * fade(z, LAYERS.cmb.range);
    // scale ring: the power of ten just inside the view radius
    if (ringRef.current) { const r = 10 ** Math.floor(z - 0.15); ringRef.current.scale.setScalar(r); }
    if (selRef.current) { selRef.current.visible = !!selected; if (selected) { selRef.current.position.set(...selected.pos); selRef.current.scale.setScalar(0.05 * R); selRef.current.quaternion.copy(camera.quaternion); } }
    // labels: only objects in a visible layer and at a readable scale
    labelLayer.hidden.clear();
    for (const o of objects) {
      if (!labelLayer.anchors.has(o.id)) continue;
      const op = visible[layerOf(o.kind)] === false ? 0 : fade(z, LAYERS[layerOf(o.kind)].range);
      const rel = o.distance / R;
      if (o.kind === 'sun') continue;
      if (op < 0.35 || rel < 0.04 || rel > 1.6) labelLayer.hidden.add(o.id);
    }
  });
  return (
    <group ref={group}>
      {layers.map((l) => <points key={l.key} geometry={l.geom} material={l.mat} frustumCulled={false} />)}
      <points geometry={disc.geom} material={disc.mat} frustumCulled={false} />
      {orbitLines.map((l, i) => <primitive key={i} object={l} />)}
      <mesh ref={cmbRef} material={cmbMat} scale={LAST_SCATTERING.radius} frustumCulled={false}><sphereGeometry args={[1, 24, 12]} /></mesh>
      <lineLoop ref={ringRef} geometry={ring} material={ringMat} frustumCulled={false} />
      <mesh ref={selRef} frustumCulled={false}><ringGeometry args={[0.7, 1, 48]} /><meshBasicMaterial color="#5cf2a6" transparent opacity={1} side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending} /></mesh>
      {objects.filter((o) => isLabelled(o)).map((o) => <group key={o.id} position={o.pos}><LabelAnchor layer={labelLayer} id={o.id} /></group>)}
    </group>
  );
}

// ------------------------------------------------------------------ view
export default function UniverseMapView() {
  const { query } = useRoute();
  const jd = useVoyager((s) => s.clock.jd);
  const z0 = Number(query.get('z'));
  const zRef = useRef(Number.isFinite(z0) && query.has('z') ? Math.min(Z_MAX, Math.max(Z_MIN, z0)) : 12.9);
  const target = useRef<number | null>(null);
  const [z, setZ] = useState(zRef.current);
  const [stars, setStars] = useState<MapObject[]>([]);
  const [visible, setVisible] = useState<Record<string, boolean>>({});
  const labelLayer = useMemo(() => { const l = new LabelLayer(); l.declutter = true; return l; }, []);
  useEffect(() => {
    Promise.all([loadTenParsec(), loadCns5()]).then(([ten, cns]) => {
      const named = ten.filter((t) => t.type !== 'exoplanet').map((t) => ({ id: `t${t.seq}`, name: t.name, ra: t.ra, dec: t.dec, plx: t.plx }));
      const far = cns.filter((c) => c.ra !== null && c.dec !== null && 1000 / c.plx > 10).map((c) => ({ id: `c${c.cns5}`, name: c.gj ? `GJ ${c.gj}` : `CNS5 ${c.cns5}`, ra: c.ra!, dec: c.dec!, plx: c.plx }));
      const st = starObjects([...named, ...far] as never);
      NEAR_STARS = new Set(st.filter((x) => !/^(CNS5|GJ) /.test(x.name)).sort((p, q) => p.distance - q.distance).filter((x, i, arr) => arr.findIndex((y) => y.name.split(' ')[0] === x.name.split(' ')[0] && Math.abs(y.distance - x.distance) < 0.05 * PC) === i).slice(0, 14).map((x) => x.id));
      setStars(st);
    }).catch(() => setStars([]));
  }, []);
  const solar = useMemo(() => solarSystem(jd), [Math.round(jd)]); // eslint-disable-line react-hooks/exhaustive-deps
  const orbits = useMemo(() => ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'].map((id) => {
    try { const pts = orbitPath(id, jd, 256).map((p) => eclipticToGalactic([p[0] * 1000, p[1] * 1000, p[2] * 1000] as Vec3)); return new Float32Array(pts.flat()); } catch { return new Float32Array(0); }
  }).filter((a) => a.length), [Math.round(jd / 30)]); // eslint-disable-line react-hooks/exhaustive-deps
  const catalogue = useMemo(() => [...catalogueObjects(), { id: 'cmb', name: 'Last-scattering surface (cosmic microwave background)', kind: 'cmb' as const, pos: [0, 0, LAST_SCATTERING.radius] as Vec3, distance: LAST_SCATTERING.radius, note: `comoving distance today to z∗ = ${LAST_SCATTERING.z} in the Planck 2018 cosmology, computed with the expansion model of the Expansion view`, sources: ['planck-2018-vi'], route: '#/cosmic/cmb' }], []);
  const objects = useMemo(() => [...solar, ...stars, ...catalogue], [solar, stars, catalogue]);
  const sel = objects.find((o) => o.id === query.get('sel')) ?? null;
  labelLayer.first = sel?.id ?? null;
  // wheel zoom on the canvas; animated flights to presets
  useEffect(() => {
    let raf = 0, lastPush = 0, lastT = 0;
    const loop = (t: number) => {
      const dt = lastT ? Math.min(0.5, (t - lastT) / 1000) : 1 / 60; lastT = t;
      if (target.current !== null) {
        const d = target.current - zRef.current;
        // time-based easing (τ ≈ 0.2 s; was 8 % per frame, which crawled at low frame rates)
        zRef.current += Math.abs(d) < 0.01 ? d : d * (1 - Math.exp(-dt / 0.2));
        if (Math.abs(d) < 0.01) target.current = null;
      }
      if (t - lastPush > 80) { lastPush = t; setZ((old) => (Math.abs(old - zRef.current) > 0.005 ? zRef.current : old)); }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
  useEffect(() => { const h = setTimeout(() => setQuery({ z: z.toFixed(2) }), 400); return () => clearTimeout(h); }, [z]);
  // follow the URL when it changes from outside (links, history): fly to the requested scale
  const qz = Number(query.get('z'));
  useEffect(() => { if (query.has('z') && Number.isFinite(qz) && Math.abs(qz - zRef.current) > 0.05 && target.current === null) flyTo(qz); }, [qz]); // eslint-disable-line react-hooks/exhaustive-deps
  const onWheel = (e: React.WheelEvent) => { target.current = null; zRef.current = Math.min(Z_MAX, Math.max(Z_MIN, zRef.current + e.deltaY * 0.0016)); };
  const flyTo = (zz: number) => { target.current = Math.min(Z_MAX, Math.max(Z_MIN, zz)); };
  const select = (o: MapObject) => { setQuery({ sel: o.id }); if (o.distance > 0) flyTo(Math.log10(o.distance * 2.2)); };
  const R = 10 ** z;
  const RANK: Record<string, number> = { sun: 0, 'galactic-centre': 1, planet: 2, spacecraft: 3, cmb: 3, nebula: 4, compact: 4, 'local-group': 5, galaxy: 6, star: 7 };
  const labelItems = useMemo(() => objects.filter((o) => isLabelled(o)).sort((a, b) => (RANK[a.kind] ?? 9) - (RANK[b.kind] ?? 9) || labelRank(a.id) - labelRank(b.id) || a.distance - b.distance).map((o) => ({ id: o.id, content: <span>{o.kind === 'galactic-centre' ? 'Galactic Centre (Sgr A*)' : o.kind === 'sun' ? '☉ Sun — you are here' : o.name}</span>, className: `map-label map-${layerOf(o.kind)}`, onClick: () => select(o) })), [objects]); // eslint-disable-line react-hooks/exhaustive-deps
  const searchList = useMemo(() => [...objects].filter((o) => o.kind !== 'star' || o.name.indexOf('CNS5') !== 0).sort((a, b) => a.distance - b.distance), [objects]);
  return (
    <>
      <div className="map-stage" onWheel={onWheel} style={{ position: 'absolute', inset: 0 }}>
        <Viewport camera={{ fov: 50, near: 0.001, far: 100, position: [0.4, -2.2, 1.3] }}>
          <color attach="background" args={['#02030a']} />
          <MapScene zRef={zRef} objects={objects} orbits={orbits} labelLayer={labelLayer} visible={visible} selected={sel} />
          <OrbitControls enableZoom={false} enablePan={false} rotateSpeed={0.6} />
          <LabelProjector layer={labelLayer} />
        </Viewport>
        <LabelOverlay layer={labelLayer} labels={labelItems} />
      </div>
      <Panel id="map-controls" className="left-panel" title="Scale">
        <dl className="kv" aria-label="Map scale">
          <KV k="view radius" v={fmtDistance(R)} />
          <KV k="ring in the Galactic plane" v={fmtDistance(10 ** Math.floor(z - 0.15))} title="A power of ten of metres just inside the view radius" />
          <KV k="light-travel time across it" v={R / 2.99792458e8 < 3.2e7 ? `${formatSig(R / 2.99792458e8 / 86400, 3)} days` : `${formatSig(R / 2.99792458e8 / 3.15576e7, 3)} years`} title="R / c" />
        </dl>
        <label className="slider-row"><span style={{ minWidth: 50 }}>zoom</span><input type="range" min={Z_MIN} max={Z_MAX} step={0.01} value={z} aria-label="Zoom (log view radius)" onChange={(e) => { target.current = null; zRef.current = Number(e.target.value); }} /></label>
        <div className="section-title">Go to</div>
        <div className="chip-row" style={{ flexWrap: 'wrap', gap: 4 }}>{PRESETS.map(([l, zz]) => <button key={l} className="chip" onClick={() => flyTo(zz)}>{l}</button>)}</div>
        <div className="section-title">Find an object</div>
        <select className="text-input" aria-label="Find an object" value={sel?.id ?? ''} onChange={(e) => { const o = objects.find((x) => x.id === e.target.value); if (o) select(o); }} style={{ width: '100%' }}>
          <option value="">— choose —</option>
          {searchList.map((o) => <option key={o.id} value={o.id}>{o.name} · {fmtDistance(o.distance)}</option>)}
        </select>
        <div className="section-title">Layers</div>
        {Object.entries(LAYERS).map(([k, l]) => <label key={k} className="check-row" style={{ display: 'flex', gap: 6, fontSize: 11.5, alignItems: 'center' }}><input type="checkbox" checked={visible[k] !== false} onChange={(e) => setVisible((v) => ({ ...v, [k]: e.target.checked }))} /><span style={{ color: l.color }}>●</span> {l.label}</label>)}
        <p className="note" style={{ fontSize: 10.5 }}>Scroll to zoom, drag to turn. Galactic frame: the Galactic Centre lies along +x. Point sizes and colours are illustrative; the disc is a model sampled from its measured scale length and height.</p>
      </Panel>
      <Panel id="map-info" className="right-panel" title={sel ? sel.name : 'Universe map'}>
        {sel ? <>
          <div className="stage-head" style={{ margin: 0 }}><ProvenanceBadge cls={sel.kind === 'star' || sel.kind === 'planet' || sel.kind === 'spacecraft' ? 'observed' : 'derived'} title="Catalogue position and distance" /></div>
          <dl className="kv" aria-label="Map object">
            <KV k="distance from the Sun" v={fmtDistance(sel.distance)} />
            <KV k="light-travel time" v={sel.distance / 2.99792458e8 < 3.15576e7 ? `${formatSig(sel.distance / 2.99792458e8 / 3600, 3)} hours` : `${formatSig(sel.distance / 2.99792458e8 / 3.15576e7, 3)} years`} />
            {sel.distance > 0 && <KV k="Galactic longitude l" v={galacticCoords(sel.pos).l} unit="°" sig={4} />}
            {sel.distance > 0 && <KV k="Galactic latitude b" v={galacticCoords(sel.pos).b} unit="°" sig={3} />}
          </dl>
          <p className="note" style={{ fontSize: 10.5 }}>{sel.note}. <SourceLinks ids={sel.sources} /></p>
          {sel.route && <button className="chip" onClick={() => navigate(sel.route!.replace(/^#/, ''))}>Open its page →</button>}
          <button className="chip" onClick={() => setQuery({ sel: null })}>Clear selection</button>
        </> : <>
          <p className="note">From the planets to the edge of the observable universe, every object sits at its catalogue position, centred on the Sun. Scroll out: the planets give way to the nearest stars, the Milky Way's disc (the Sun is {formatSig(MILKY_WAY.R0 / PC / 1e3, 2)} kpc from its centre), the Local Group and galaxies tens of millions of light years away, and finally the last-scattering surface of the cosmic microwave background, {fmtDistance(LAST_SCATTERING.radius)} away today (comoving).</p>
          <p className="note" style={{ fontSize: 10.5 }}><SourceLinks ids={['jpl-approx-planets', 'golovin-2023-cns5', 'bland-hawthorn-gerhard-2016', 'mcconnachie-2012', 'lelli-2016-sparc', 'simbad', 'planck-2018-vi']} /></p>
        </>}
      </Panel>
    </>
  );
}
