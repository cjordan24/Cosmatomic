/**
 * Earth weather atlas — #/meteorology/atlas?layer=<id>&m=<0–11>&view=map|globe&wind=none|10|250&p=<lat>,<lon>  (Gate 21.2)
 *
 * Nineteen global layers for 2024 (observations, satellite products and reanalysis, each labelled) plus 1991–2020
 * pressure and wind climatologies, drawn on a 2D map or a 3D globe from the same texture. A month timeline, wind
 * arrows that can be laid over any layer, a point inspector, the global mean and a latitude profile.
 * Data: NOAA PSL (OISST, GPCP, CPC OLR, GHCN_CAMS, NCEP/NCAR R1), NASA GIBS (MODIS, MERRA-2), Natural Earth.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from '@react-three/drei';
import { setQuery, navigate, useRoute } from '@/shared/router';
import { KV, Panel, ProvenanceBadge } from '@/ui/components';
import { SourceLinks } from '@/ui/SourcesView';
import { RelatedLinks } from '@/ui/RelatedLinks';
import { LinePlot } from '@/ui/plots';
import { AtDepth, DepthSwitch } from '@/ui/Depth';
import { Viewport } from '@/rendering/Viewport';
import { formatSig } from '@/core/units/units';
import { areaMean, colour, decodeMonth, sample, SCALE_CSS, type Scale } from '@/core/meteorology/grid';
import atlas from '@datasets/meteorology/atlas.json';

/* eslint-disable @typescript-eslint/no-explicit-any */
const A = atlas as any;
const META: Record<string, any> = Object.fromEntries(A.layers.map((l: any) => [l.id, l]));
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
/** Display ranges and colour scales (choices for legibility; the data range is shown beside them). */
const SHOW: Record<string, { lo: number; hi: number; scale: Scale }> = {
  sst: { lo: -2, hi: 32, scale: 'viridis' }, seaice: { lo: 0, hi: 100, scale: 'viridis' }, airtemp: { lo: -40, hi: 40, scale: 'diverging' }, lst: { lo: -40, hi: 60, scale: 'diverging' },
  precip: { lo: 0, hi: 15, scale: 'viridis' }, olr: { lo: 150, hi: 320, scale: 'viridis' }, clouds: { lo: 0, hi: 100, scale: 'viridis' }, pwat: { lo: 0, hi: 60, scale: 'viridis' },
  netrad: { lo: -150, hi: 150, scale: 'diverging' }, ndvi: { lo: 0, hi: 1, scale: 'viridis' }, snow: { lo: 0, hi: 100, scale: 'viridis' }, aod: { lo: 0, hi: 0.9, scale: 'viridis' },
  albedo: { lo: 0, hi: 0.8, scale: 'viridis' }, slp: { lo: 985, hi: 1035, scale: 'diverging' }, wind10: { lo: 0, hi: 12, scale: 'viridis' }, wind250: { lo: 0, hi: 70, scale: 'viridis' }, topo: { lo: 0, hi: 5000, scale: 'viridis' },
};
const GROUPS: [string, [string, string][]][] = [
  ['Temperature', [['sst', 'Sea surface'], ['airtemp', 'Air over land'], ['lst', 'Land surface (day)']]],
  ['Water', [['precip', 'Precipitation'], ['pwat', 'Water vapour'], ['clouds', 'Cloud cover'], ['snow', 'Snow cover'], ['seaice', 'Sea ice']]],
  ['Radiation', [['olr', 'Outgoing infrared'], ['netrad', 'Net radiation (top)'], ['albedo', 'Surface albedo'], ['aod', 'Aerosols']]],
  ['Air flow', [['slp', 'Sea-level pressure'], ['wind10', 'Surface wind'], ['wind250', 'Jet-level wind']]],
  ['Land', [['ndvi', 'Vegetation'], ['topo', 'Model terrain']]],
];
const WIND: Record<string, [string, string]> = { wind10: ['u10', 'v10'], wind250: ['u250', 'v250'] };

const cache = new Map<string, Promise<Uint8Array>>();
const fetchLayer = (id: string) => { if (!cache.has(id)) cache.set(id, fetch(META[id].file).then((r) => r.arrayBuffer()).then((b) => new Uint8Array(b))); return cache.get(id)!; };
let coastPromise: Promise<number[][][]> | null = null;
const fetchCoast = () => (coastPromise ??= fetch(A.coastline.file).then((r) => r.json()));

interface Field { vals: Float32Array; meta: { w: number; h: number; res: number }; u?: Float32Array; v?: Float32Array }
function useField(layer: string, month: number): Field | null {
  const [f, setF] = useState<Field | null>(null);
  useEffect(() => {
    let live = true;
    if (!WIND[layer] && !META[layer]) { setF(null); return; }
    const ids = WIND[layer] ?? [layer];
    Promise.all(ids.map(fetchLayer)).then((bs) => {
      if (!live) return;
      const ms = ids.map((id) => META[id]);
      const ds = bs.map((b, i) => decodeMonth(b, ms[i], month));
      if (WIND[layer]) { const [u, v] = ds; setF({ vals: u.map((x, i) => Math.hypot(x, v[i])), meta: ms[0], u, v }); }
      else setF({ vals: ds[0], meta: ms[0] });
    });
    return () => { live = false; };
  }, [layer, month]);
  return f;
}
function useWind(kind: string, month: number) { return useField(kind === '10' ? 'wind10' : kind === '250' ? 'wind250' : 'none-placeholder', month); }

/** Paint the field (and coastlines, wind arrows) onto a 1440 × 720 equirectangular canvas. */
function paint(cv: HTMLCanvasElement, f: Field, show: { lo: number; hi: number; scale: Scale }, coast: number[][][] | null, wind: Field | null) {
  const W = 1440, H = 720, ctx = cv.getContext('2d')!;
  const img = new ImageData(f.meta.w, f.meta.h);
  for (let i = 0; i < f.vals.length; i++) {
    const v = f.vals[i];
    if (Number.isNaN(v)) { img.data[i * 4] = 28; img.data[i * 4 + 1] = 32; img.data[i * 4 + 2] = 42; img.data[i * 4 + 3] = 255; continue; }
    const [r, g, b] = colour((v - show.lo) / (show.hi - show.lo), show.scale);
    img.data[i * 4] = r; img.data[i * 4 + 1] = g; img.data[i * 4 + 2] = b; img.data[i * 4 + 3] = 255;
  }
  const tmp = document.createElement('canvas'); tmp.width = f.meta.w; tmp.height = f.meta.h; tmp.getContext('2d')!.putImageData(img, 0, 0);
  ctx.imageSmoothingEnabled = false; ctx.clearRect(0, 0, W, H); ctx.drawImage(tmp, 0, 0, W, H);
  const X = (lon: number) => ((lon + 180) / 360) * W, Y = (lat: number) => ((90 - lat) / 180) * H;
  if (coast) { ctx.strokeStyle = 'rgba(255,255,255,0.75)'; ctx.lineWidth = 1.4; for (const line of coast) { ctx.beginPath(); line.forEach(([x, y], i) => (i ? ctx.lineTo(X(x), Y(y)) : ctx.moveTo(X(x), Y(y)))); ctx.stroke(); } }
  if (wind?.u && wind.v) {
    const m = wind.meta, maxS = Math.max(1, ...Array.from(wind.vals).filter((x) => !Number.isNaN(x)));
    ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 1.3;
    for (let r = 2; r < m.h; r += 5) for (let c = 2; c < m.w; c += 5) {
      const i = r * m.w + c, u = wind.u[i], v = wind.v[i]; if (Number.isNaN(u)) continue;
      const lat = 90 - m.res / 2 - r * m.res, lon = -180 + m.res / 2 + c * m.res, s = Math.hypot(u, v), L = 6 + 22 * (s / maxS);
      const x0 = X(lon), y0 = Y(lat), x1 = x0 + (u / (s || 1)) * L, y1 = y0 - (v / (s || 1)) * L;
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); ctx.beginPath(); ctx.arc(x1, y1, 1.8, 0, 2 * Math.PI); ctx.fill();
    }
  }
}

function Globe({ canvas, version, p }: { canvas: HTMLCanvasElement; version: number; p: [number, number] | null }) {
  const tex = useMemo(() => { const t = new THREE.CanvasTexture(canvas); t.colorSpace = THREE.SRGBColorSpace; return t; }, [canvas]);
  useEffect(() => { tex.needsUpdate = true; }, [tex, version]);
  const mark = p ? (() => { const [lat, lon] = p, la = (lat * Math.PI) / 180, lo = (lon * Math.PI) / 180; return new THREE.Vector3(Math.cos(la) * Math.cos(lo), Math.sin(la), -Math.cos(la) * Math.sin(lo)).multiplyScalar(1.01); })() : null;
  return (
    <>
      <ambientLight intensity={1.2} />
      <mesh><sphereGeometry args={[1, 96, 64]} /><meshBasicMaterial map={tex} toneMapped={false} /></mesh>
      {mark ? <mesh position={mark}><sphereGeometry args={[0.018, 12, 12]} /><meshBasicMaterial color="#ff7a90" /></mesh> : null}
      <OrbitControls makeDefault enablePan={false} minDistance={1.4} maxDistance={5} />
    </>
  );
}

export default function AtlasView() {
  const { query } = useRoute();
  const layer = META[query.get('layer') ?? ''] || WIND[query.get('layer') ?? ''] ? (query.get('layer') as string) : 'sst';
  const month = Math.min(11, Math.max(0, Number(query.get('m') ?? 0) || 0));
  const view = query.get('view') === 'globe' ? 'globe' : 'map', wind = query.get('wind') ?? 'none';
  const pq = query.get('p')?.split(',').map(Number);
  const p: [number, number] | null = pq && pq.length === 2 && pq.every(Number.isFinite) ? [pq[0], pq[1]] : null;
  const field = useField(layer, month), windField = useWind(wind, month);
  const [coast, setCoast] = useState<number[][][] | null>(null);
  useEffect(() => { fetchCoast().then(setCoast); }, []);
  const canvas = useMemo(() => { const c = document.createElement('canvas'); c.width = 1440; c.height = 720; return c; }, []);
  const [version, setVersion] = useState(0);
  const shownRef = useRef<HTMLCanvasElement>(null);
  const show = SHOW[layer];
  useEffect(() => {
    if (!field) return;
    paint(canvas, field, show, coast, wind !== 'none' ? windField : null);
    setVersion((v) => v + 1);
    const out = shownRef.current; if (out) { const c = out.getContext('2d')!; c.clearRect(0, 0, out.width, out.height); c.drawImage(canvas, 0, 0, out.width, out.height); }
  }, [field, coast, windField, wind, canvas, show, view]);
  // timeline playback: steps a month at a time while playing (no CSS animation)
  const [playing, setPlaying] = useState(false);
  useEffect(() => { if (!playing) return; const h = setInterval(() => setQuery({ m: String((month + 1) % 12) }), 900); return () => clearInterval(h); }, [playing, month]);

  const meta = WIND[layer] ? { ...META[WIND[layer][0]], title: layer === 'wind10' ? 'Wind speed at 10 m (1991–2020 mean)' : 'Wind speed at 250 hPa (1991–2020 mean)', unit: 'm/s', note: 'Speed √(u² + v²) from the eastward and northward components (our step).' } : META[layer];
  const here = field && p ? sample(field.vals, field.meta, p[0], p[1]) : NaN;
  const mean = field ? areaMean(field.vals, field.meta) : NaN;
  const zonal = useMemo(() => {
    if (!field) return [] as [number, number][];
    const { w, h, res } = field.meta, out: [number, number][] = [];
    for (let r = 0; r < h; r++) { let s = 0, n = 0; for (let c = 0; c < w; c++) { const v = field.vals[r * w + c]; if (!Number.isNaN(v)) { s += v; n++; } } if (n > w * 0.1) out.push([90 - res / 2 - r * res, s / n]); }
    return out;
  }, [field]);
  const pick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect(), lon = ((e.clientX - r.left) / r.width) * 360 - 180, lat = 90 - ((e.clientY - r.top) / r.height) * 180;
    setQuery({ p: `${lat.toFixed(1)},${lon.toFixed(1)}` });
  };
  const fmt = (v: number) => (Number.isNaN(v) ? 'no data' : `${formatSig(v, 3)} ${meta.unit}`);
  return (
    <>
      <Panel id="at-layers" className="left-panel" title="Layers">
        {GROUPS.map(([g, items]) => (
          <div key={g}><div className="section-title">{g}</div>
            <div role="radiogroup" aria-label={`${g} layers`} className="chip-row" style={{ flexWrap: 'wrap', gap: 4 }}>
              {items.map(([id, l]) => <button key={id} role="radio" aria-checked={id === layer} className={`chip ${id === layer ? 'active' : ''}`} onClick={() => setQuery({ layer: id })}>{l}</button>)}
            </div></div>))}
        <div className="section-title">Overlay wind arrows</div>
        <div role="radiogroup" aria-label="Wind overlay" className="chip-row" style={{ gap: 4 }}>
          {[['none', 'None'], ['10', 'Surface'], ['250', 'Jet level']].map(([k, l]) => <button key={k} role="radio" aria-checked={wind === k} className={`chip ${wind === k ? 'active' : ''}`} onClick={() => setQuery({ wind: k === 'none' ? null : k })}>{l}</button>)}
        </div>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Earth weather atlas <ProvenanceBadge cls={/reanalysis/.test(meta.kind) ? 'derived' : 'observed'} title={meta.kind} /><DepthSwitch /></h1>
          <p className="note"><b>{meta.title}</b> · {MONTHS[month]} {meta.period?.startsWith('2024') ? '2024' : meta.period === 'static' ? '' : '(1991–2020 average)'} · <i>{meta.kind}</i></p></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
          <div role="radiogroup" aria-label="Projection" className="chip-row" style={{ gap: 4 }}>
            {[['map', '2D map'], ['globe', '3D globe']].map(([k, l]) => <button key={k} role="radio" aria-checked={view === k} className={`chip ${view === k ? 'active' : ''}`} onClick={() => setQuery({ view: k === 'map' ? null : k })}>{l}</button>)}
          </div>
          <button className="chip" aria-label={playing ? 'Pause' : 'Play months'} onClick={() => setPlaying((x) => !x)}>{playing ? '❚❚ pause' : '▶ play'}</button>
          <label className="slider-row" style={{ flex: 1, minWidth: 240 }}><span>month</span><input type="range" min={0} max={11} step={1} value={month} aria-label="Month" onChange={(e) => { setPlaying(false); setQuery({ m: e.target.value }); }} /><span>{MONTHS[month]}</span></label>
        </div>
        {view === 'map'
          ? <canvas ref={shownRef} width={720} height={360} role="img" aria-label="Atlas map" onClick={pick} style={{ width: '100%', maxWidth: 720, cursor: 'crosshair', borderRadius: 6 }} />
          : <div style={{ height: 380, maxWidth: 720, position: 'relative' }}><Viewport className="atlas-globe" camera={{ position: [0, 0.6, 2.6], fov: 45 }}><Globe canvas={canvas} version={version} p={p} /></Viewport></div>}
        <div aria-label="Legend" style={{ maxWidth: 720, marginTop: 6 }}>
          <div style={{ height: 12, borderRadius: 3, background: SCALE_CSS(show.scale) }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-dim)' }}><span>{show.lo} {meta.unit}</span><span>{(show.lo + show.hi) / 2} {meta.unit}</span><span>{show.hi} {meta.unit}</span></div>
          <p className="note">Colours: {show.scale === 'viridis' ? 'viridis (dark purple low → yellow high)' : 'blue (low) → white → red (high)'}; grey: no data. White lines: coastlines (Natural Earth). {wind !== 'none' ? 'Arrows: wind direction, length grows with speed.' : ''} Click the map to inspect a point.</p>
        </div>
        <AtDepth level="understand"><p className="note">Understand — {meta.note} Data range this year: {formatSig(meta.min, 3)} to {formatSig(meta.max, 3)} {meta.unit}; colours clip outside the legend range.</p></AtDepth>
        <AtDepth level="research"><p className="note">Research — grid {meta.res}° ({meta.w} × {meta.h}), resampled by nearest neighbour and stored at one byte per cell: steps of {formatSig(meta.step, 2)} {meta.unit}. NASA NEO, the brief's suggested source, was decommissioned in September 2026; these layers come from NOAA PSL and NASA GIBS instead. <SourceLinks ids={['ncep-r1', 'nasa-gibs']} /></p></AtDepth>
      </div>
      <Panel id="at-inspect" className="right-panel" title="Inspect">
        <dl className="kv" aria-label="Atlas values">
          <KV k="Point" v={p ? `${p[0].toFixed(1)}°, ${p[1].toFixed(1)}°` : '— click the map'} />
          <KV k="Value there" v={p ? fmt(here) : '—'} />
          <KV k="Global area-weighted mean" v={fmt(mean)} title="mean over cells with data, weighted by cos latitude" />
        </dl>
        <LinePlot ariaLabel="Average by latitude" width={300} height={200} xLabel="latitude (°)" yLabel={meta.unit || 'value'} series={[{ points: zonal, color: '#82b1ff', label: 'average along each latitude' }]} markers={p && !Number.isNaN(here) ? [{ x: p[0], y: here, color: '#ff7a90' }] : []} />
        <p className="note">Source: <SourceLinks ids={meta.sources ?? ['ncep-r1']} /> Coastlines: <SourceLinks ids={['natural-earth']} /></p>
        <button className="chip" onClick={() => navigate('/meteorology/motion?tab=circulation')}>Why winds blow this way →</button>
        <button className="chip" onClick={() => navigate('/meteorology/radiation')}>The energy budget →</button>
        <RelatedLinks id="instrument:atlas" limit={3} />
      </Panel>
    </>
  );
}
