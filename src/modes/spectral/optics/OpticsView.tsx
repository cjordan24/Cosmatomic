/**
 * Geometric optics — #/spectral/optics?tab=refraction|lens|mirror|prism   (Phase 10, Gate 10.1)
 *
 *  refraction  a ray meets the boundary of two media: m1, m2 (material ids or "air"), a (incidence, °), wl (nm)
 *  lens        exact ray trace through a spherical lens: mat, r1, r2, d (thickness), D (diameter) in mm, e (object distance, mm), wl
 *  mirror      concave spherical mirror: R (radius, mm), D (aperture, mm), e (object distance, mm)
 *  prism       dispersion by a prism: mat, A (apex angle, °), a (incidence, °)
 * Physics: src/core/physics/optics/geometric.ts (Drude 1902; Southall 1910). Indices n(λ) from the materials dataset.
 */
import { useMemo } from 'react';
import { setQuery, useRoute } from '@/shared/router';
import { KV, Panel, ProvenanceBadge } from '@/ui/components';
import { SourceLinks } from '@/ui/SourcesView';
import { RelatedLinks } from '@/ui/RelatedLinks';
import { formatSig } from '@/core/units/units';
import { MATERIALS, refractiveIndex, type Material } from '@/modes/atomic/materials/materials';
import { wavelengthToColor } from '@/modes/atomic/atoms/spectrum';
import {
  criticalAngle, lensmakerFocal, minimumDeviation, mirrorFocal, mirrorImage, prismDeviation, refractAngle, thinLensImage,
  traceLens, traceMirror, tracePrism, tracedFocus, tracedImage, type Lens, type Vec2,
} from '@/core/physics/optics/geometric';

type Tab = 'refraction' | 'lens' | 'mirror' | 'prism';
const TABS: [Tab, string][] = [['refraction', 'Refraction'], ['lens', 'Lens'], ['mirror', 'Mirror'], ['prism', 'Prism']];
const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
const num = (q: URLSearchParams, k: string, d: number, a: number, b: number) => { const v = Number(q.get(k)); return q.has(k) && Number.isFinite(v) ? clamp(v, a, b) : d; };
const deg = Math.PI / 180;
const DRUDE = ['drude-1902'], SOUTH = ['southall-1910'];
const OPTICAL: Material[] = MATERIALS.filter((m) => m.refractiveIndex);
const AIR = 'air';
/** Index of a medium at λ (µm); "air" is Drude's reference medium, n = 1. Null outside the source's range. */
function indexOf(id: string, um: number): number | null {
  if (id === AIR) return 1;
  const m = OPTICAL.find((x) => x.id === id);
  return m ? refractiveIndex(m.refractiveIndex!, um) : null;
}
const nameOf = (id: string) => (id === AIR ? 'air (n = 1)' : OPTICAL.find((x) => x.id === id)?.refractiveIndex?.label ?? id);
const srcOf = (id: string) => (id === AIR ? DRUDE : OPTICAL.find((x) => x.id === id)?.refractiveIndex?.sources ?? []);
function MediumSelect({ k, value, label, air = true }: { k: string; value: string; label: string; air?: boolean }) {
  return (
    <select className="text-input" aria-label={label} value={value} onChange={(e) => setQuery({ [k]: e.target.value })} style={{ width: '100%' }}>
      {air && <option value={AIR}>air (n = 1)</option>}
      {OPTICAL.map((m) => <option key={m.id} value={m.id}>{m.refractiveIndex!.label} ({m.refractiveIndex!.rangeUm?.map((x) => x).join('–')} µm)</option>)}
    </select>
  );
}
function Slider({ k, label, v, min, max, step, unit, aria }: { k: string; label: string; v: number; min: number; max: number; step: number; unit: string; aria: string }) {
  return <label className="slider-row"><span style={{ minWidth: 78 }}>{label}</span><input type="range" min={min} max={max} step={step} value={v} aria-label={aria} onChange={(e) => setQuery({ [k]: e.target.value })} /><span>{v} {unit}</span></label>;
}
const poly = (pts: Vec2[], sx: (x: number) => number, sy: (y: number) => number) => pts.map((p) => `${sx(p[0]).toFixed(1)},${sy(p[1]).toFixed(1)}`).join(' ');

// ------------------------------------------------------------------ refraction
function RefractionTab() {
  const { query } = useRoute();
  const m1 = query.get('m1') ?? 'water', m2 = query.get('m2') ?? AIR;
  const a = num(query, 'a', 40, 0, 89.9), wl = num(query, 'wl', 589, 380, 750);
  const n1 = indexOf(m1, wl / 1000), n2 = indexOf(m2, wl / 1000);
  const b = n1 !== null && n2 !== null ? refractAngle(n1, n2, a * deg) : null;
  const crit = n1 !== null && n2 !== null ? criticalAngle(n1, n2) : null;
  const W = 520, H = 360, cx = W / 2, cy = H / 2, R = 160, col = wavelengthToColor(wl);
  const inc: Vec2 = [cx - R * Math.sin(a * deg), cy - R * Math.cos(a * deg)];
  const refl: Vec2 = [cx + R * Math.sin(a * deg), cy - R * Math.cos(a * deg)];
  const refr: Vec2 | null = b !== null ? [cx + R * Math.sin(b), cy + R * Math.cos(b)] : null;
  return (
    <>
      <Panel id="op-refr-controls" className="left-panel" title="Boundary">
        <div className="section-title">Light travels in</div><MediumSelect k="m1" value={m1} label="First medium" />
        <div className="section-title">and meets</div><MediumSelect k="m2" value={m2} label="Second medium" />
        <Slider k="a" label="incidence φ" v={a} min={0} max={89.9} step={0.1} unit="°" aria="Angle of incidence" />
        <Slider k="wl" label="wavelength" v={wl} min={380} max={750} step={1} unit="nm" aria="Wavelength" />
        <button className="chip" onClick={() => setQuery({ m1: 'water', m2: AIR, a: crit ? (crit / deg + 1).toFixed(1) : '50' })}>Water → air beyond the critical angle</button>
        <button className="chip" onClick={() => setQuery({ m1: 'diamond', m2: AIR, a: '30' })}>Diamond → air</button>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Reflection and refraction <ProvenanceBadge cls="derived" title="Drude, Theory of Optics, Pt I ch. I §1, eqs. 1, 3, 6" /></h1>
          <p className="note">“The reflected and refracted rays both lie in the plane of incidence. The angle of reflection … is equal to the angle of incidence”, and the angle of refraction follows n_a sin φ_a = n_b sin φ_b. Going into a less refractive medium, a ray is totally reflected when sin φ_a &gt; n_b/n_a. The index depends on the colour of the light: dispersion (Drude §1). <SourceLinks ids={DRUDE} /></p>
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Ray diagram at the boundary" style={{ width: '100%', maxWidth: W, background: '#03050c', borderRadius: 10, border: '1px solid var(--line)' }}>
          <rect x={0} y={cy} width={W} height={H - cy} fill="#7df9ff" opacity={0.08 + 0.12 * Math.max(0, ((n2 ?? 1) - 1))} />
          <rect x={0} y={0} width={W} height={cy} fill="#7df9ff" opacity={0.08 + 0.12 * Math.max(0, ((n1 ?? 1) - 1))} />
          <line x1={0} y1={cy} x2={W} y2={cy} stroke="var(--line)" />
          <line x1={cx} y1={20} x2={cx} y2={H - 20} stroke="#888" strokeDasharray="4 4" />
          <line x1={inc[0]} y1={inc[1]} x2={cx} y2={cy} stroke={col} strokeWidth={3} />
          <line x1={cx} y1={cy} x2={refl[0]} y2={refl[1]} stroke={col} strokeWidth={b === null ? 3 : 1.5} strokeOpacity={b === null ? 1 : 0.5} />
          {refr && <line x1={cx} y1={cy} x2={refr[0]} y2={refr[1]} stroke={col} strokeWidth={3} />}
          <text x={10} y={18} style={{ fill: '#ccc', fontSize: 11 }}>{nameOf(m1)}, n = {n1 !== null ? n1.toFixed(4) : 'unknown'}</text>
          <text x={10} y={H - 8} style={{ fill: '#ccc', fontSize: 11 }}>{nameOf(m2)}, n = {n2 !== null ? n2.toFixed(4) : 'unknown'}</text>
          {b === null && n1 !== null && n2 !== null && <text x={cx + 10} y={cy + 24} style={{ fill: '#ff7a90', fontSize: 12 }}>total reflection</text>}
        </svg>
      </div>
      <Panel id="op-refr-readout" className="right-panel" title="Angles">
        <dl className="kv" aria-label="Refraction result">
          <KV k="n₁ at λ" v={n1} sig={6} title="Outside the source's wavelength range: unknown" />
          <KV k="n₂ at λ" v={n2} sig={6} />
          <KV k="angle of reflection" v={a} unit="°" sig={4} />
          <KV k="angle of refraction" v={b !== null ? b / deg : n1 !== null && n2 !== null ? 'none (total reflection)' : null} unit={b !== null ? '°' : undefined} sig={5} />
          <KV k="critical angle" v={crit !== null ? crit / deg : 'none (n₁ ≤ n₂)'} unit={crit !== null ? '°' : undefined} sig={5} />
        </dl>
        <p className="note" style={{ fontSize: 10.5 }}>Indices from the dispersion formulas of the materials dataset <SourceLinks ids={[...new Set([...srcOf(m1), ...srcOf(m2)])]} />; air is the reference medium with n = 1, as in Drude.</p>
        <RelatedLinks id="instrument:geometric-optics" />
      </Panel>
    </>
  );
}

// ------------------------------------------------------------------ lens
const WLS = [450, 550, 650];
function LensTab() {
  const { query } = useRoute();
  const mat = query.get('mat') ?? 'fused-silica';
  const r1 = num(query, 'r1', 50, -500, 500), r2 = num(query, 'r2', -50, -500, 500), d = num(query, 'd', 4, 0.1, 40), D = num(query, 'D', 30, 2, 80);
  const e = num(query, 'e', 150, 10, 1000), wl = num(query, 'wl', 589, 380, 750);
  const n = indexOf(mat, wl / 1000);
  const L: Lens | null = n !== null ? { r1: r1 === 0 ? Infinity : r1, r2: r2 === 0 ? Infinity : r2, thickness: d, diameter: D, n } : null;
  const fThin = n !== null ? lensmakerFocal(n, L!.r1, L!.r2) : null;
  const par = L ? tracedFocus(L, D * 0.005) : null, marg = L ? tracedFocus(L, D * 0.45) : null;
  const imgThin = fThin !== null ? thinLensImage(fThin, e) : null, imgTraced = L ? tracedImage(L, e) : null;
  const chroma = WLS.map((w) => { const nn = indexOf(mat, w / 1000); return { w, n: nn, f: nn !== null && L ? tracedFocus({ ...L, n: nn }, D * 0.005).efl : null }; });
  const span = Math.max(120, Math.min(1200, 1.6 * Math.max(Math.abs(fThin ?? 100), 60)));
  const W = 680, H = 300, x0 = -span * 0.45, x1 = span, sx = (x: number) => ((x - x0) / (x1 - x0)) * W, sc = W / (x1 - x0), sy = (y: number) => H / 2 - y * Math.max(sc, 2.5);
  const rays = L ? Array.from({ length: 11 }, (_, i) => { const h = ((i - 5) / 5) * D * 0.45; const t = traceLens({ p: [x0, h], u: [1, 0] }, L); return t.out ? [...t.path, [t.out.p[0] + t.out.u[0] * (x1 - t.out.p[0]) / Math.max(1e-9, t.out.u[0]), t.out.p[1] + t.out.u[1] * (x1 - t.out.p[0]) / Math.max(1e-9, t.out.u[0])] as Vec2] : t.path; }) : [];
  const outline = useMemo(() => {
    if (!L) return '';
    const pts: Vec2[] = [];
    const sag = (r: number, y: number) => (Number.isFinite(r) ? r - Math.sign(r) * Math.sqrt(Math.max(0, r * r - y * y)) : 0);
    for (let i = 0; i <= 30; i++) { const y = -D / 2 + (D * i) / 30; pts.push([sag(L.r1, y), y]); }
    for (let i = 30; i >= 0; i--) { const y = -D / 2 + (D * i) / 30; pts.push([d + sag(L.r2, y), y]); }
    return poly(pts, sx, sy);
  }, [L?.r1, L?.r2, d, D, span]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <>
      <Panel id="op-lens-controls" className="left-panel" title="Lens">
        <MediumSelect k="mat" value={mat} label="Lens material" air={false} />
        <Slider k="r1" label="r₁" v={r1} min={-500} max={500} step={1} unit="mm" aria="Radius of the first surface" />
        <Slider k="r2" label="r₂" v={r2} min={-500} max={500} step={1} unit="mm" aria="Radius of the second surface" />
        <Slider k="d" label="thickness" v={d} min={0.1} max={40} step={0.1} unit="mm" aria="Lens thickness" />
        <Slider k="D" label="diameter" v={D} min={2} max={80} step={1} unit="mm" aria="Lens diameter" />
        <Slider k="e" label="object at" v={e} min={10} max={1000} step={1} unit="mm" aria="Object distance" />
        <Slider k="wl" label="wavelength" v={wl} min={380} max={750} step={1} unit="nm" aria="Wavelength" />
        <p className="note" style={{ fontSize: 10.5 }}>r = 0 stands for a plane surface. Double-convex: r₁ &gt; 0, r₂ &lt; 0 (Drude).</p>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Lens: thin-lens formulas and exact ray trace <ProvenanceBadge cls="derived" title="Drude eqs. 22 and 25; exact trace by the law of refraction at each surface" /></h1>
          <p className="note">For a thin lens Drude gives 1/f = (n − 1)(1/r₁ − 1/r₂) and, for an object at distance e in front, an image at e′ behind with 1/e + 1/e′ = 1/f. The rays drawn here are traced exactly, applying the law of refraction at each spherical surface: rays far from the axis cross it short of the paraxial focus (spherical aberration), and because n depends on colour, blue and red focus at different distances (chromatic aberration). <SourceLinks ids={DRUDE} /></p>
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Lens ray trace" style={{ width: '100%', maxWidth: W, background: '#03050c', borderRadius: 10, border: '1px solid var(--line)' }}>
          <line x1={0} y1={H / 2} x2={W} y2={H / 2} stroke="#555" strokeDasharray="3 4" />
          {outline && <polygon points={outline} fill="#7df9ff" fillOpacity={0.18} stroke="#7df9ff" />}
          {rays.map((p, i) => <polyline key={i} points={poly(p, sx, sy)} fill="none" stroke={wavelengthToColor(wl)} strokeOpacity={0.85} />)}
          {fThin !== null && fThin > 0 && <g><line x1={sx(d / 2 + fThin)} y1={H / 2 - 6} x2={sx(d / 2 + fThin)} y2={H / 2 + 6} stroke="#f5c76b" strokeWidth={2} /><text x={sx(d / 2 + fThin) + 4} y={H / 2 + 18} style={{ fill: '#f5c76b', fontSize: 10 }}>thin-lens F</text></g>}
        </svg>
      </div>
      <Panel id="op-lens-readout" className="right-panel" title="Focus and image">
        <dl className="kv" aria-label="Lens result">
          <KV k="n at λ" v={n} sig={6} />
          <KV k="thin-lens focal length f" v={fThin} unit="mm" sig={5} title="Drude eq. 22" />
          <KV k="traced focal length (paraxial)" v={par?.efl ?? null} unit="mm" sig={5} title="h / tan θ for a ray at 0.5 % of the half-aperture" />
          <KV k="back focus, paraxial ray" v={par?.backFocus ?? null} unit="mm" sig={5} />
          <KV k="back focus, marginal ray" v={marg?.backFocus ?? null} unit="mm" sig={5} />
          <KV k="image distance e′ (thin lens)" v={imgThin} unit="mm" sig={5} title="Drude eq. 25; negative = virtual image in front" />
          <KV k="image distance e′ (traced, from 2nd vertex)" v={imgTraced} unit="mm" sig={5} />
        </dl>
        <table className="table-mini" aria-label="Chromatic aberration"><thead><tr><th>λ (nm)</th><th>n</th><th>traced f (mm)</th></tr></thead>
          <tbody>{chroma.map((c) => <tr key={c.w}><td style={{ color: wavelengthToColor(c.w) }}>{c.w}</td><td>{c.n !== null ? c.n.toFixed(5) : 'unknown'}</td><td>{c.f !== null ? formatSig(c.f, 5) : 'unknown'}</td></tr>)}</tbody></table>
        <p className="note" style={{ fontSize: 10.5 }}>Meridional rays in air; the back focus is measured from the first vertex.{sc < 2.5 ? ' The drawing’s vertical scale is stretched so the lens stays visible.' : ''} <SourceLinks ids={srcOf(mat)} /></p>
        <RelatedLinks id="instrument:geometric-optics" />
      </Panel>
    </>
  );
}

// ------------------------------------------------------------------ mirror
function MirrorTab() {
  const { query } = useRoute();
  const Rr = num(query, 'R', 200, 20, 2000), D = num(query, 'D', 120, 4, 400), e = num(query, 'e', 300, 10, 3000);
  const r = -Rr, f = mirrorFocal(r), img = mirrorImage(r, e);
  const W = 680, H = 320, x0 = -1.3 * Rr, x1 = 0.15 * Rr, sx = (x: number) => ((x - x0) / (x1 - x0)) * W, s = W / (x1 - x0), sy = (y: number) => H / 2 - y * s;
  const rays = Array.from({ length: 13 }, (_, i) => traceMirror(r, ((i - 6) / 6) * (D / 2) * 0.999, D / 2)).filter(Boolean) as NonNullable<ReturnType<typeof traceMirror>>[];
  const marg = traceMirror(r, (D / 2) * 0.999, D / 2), par = traceMirror(r, D * 0.0005, D / 2);
  const arc: Vec2[] = Array.from({ length: 41 }, (_, i) => { const y = -D / 2 + (D * i) / 40; return [r - Math.sign(r) * Math.sqrt(Math.max(0, r * r - y * y)), y] as Vec2; });
  return (
    <>
      <Panel id="op-mirror-controls" className="left-panel" title="Concave mirror">
        <Slider k="R" label="radius R" v={Rr} min={20} max={2000} step={5} unit="mm" aria="Radius of curvature" />
        <Slider k="D" label="aperture" v={D} min={4} max={Math.min(400, 1.9 * Rr)} step={1} unit="mm" aria="Mirror aperture" />
        <Slider k="e" label="object at" v={e} min={10} max={3000} step={5} unit="mm" aria="Object distance" />
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Spherical mirror <ProvenanceBadge cls="derived" title="Drude eqs. 12–13; exact trace by the law of reflection" /></h1>
          <p className="note">A concave spherical mirror of radius R has focal length f = R/2, and an object at distance e forms its image where −1/e + 1/e′ = 2/r (r = −R; e′ &lt; 0 is a real image in front of the mirror). Traced exactly with the law of reflection, rays far from the axis cross it between the focus and the mirror: a sphere is not a perfect mirror for parallel light. <SourceLinks ids={DRUDE} /></p>
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Mirror ray trace" style={{ width: '100%', maxWidth: W, background: '#03050c', borderRadius: 10, border: '1px solid var(--line)' }}>
          <line x1={0} y1={H / 2} x2={W} y2={H / 2} stroke="#555" strokeDasharray="3 4" />
          <polyline points={poly(arc, sx, sy)} fill="none" stroke="#c9d4e8" strokeWidth={3} />
          {rays.map((ry, i) => { const end: Vec2 = [x0, ry.hit[1] + ((x0 - ry.hit[0]) * ry.u[1]) / ry.u[0]]; return <polyline key={i} points={poly([[x0, ry.hit[1]], ry.hit, end], sx, sy)} fill="none" stroke="#f5c76b" strokeOpacity={0.8} />; })}
          <line x1={sx(-f)} y1={H / 2 - 6} x2={sx(-f)} y2={H / 2 + 6} stroke="#7df9ff" strokeWidth={2} /><text x={sx(-f) + 4} y={H / 2 + 18} style={{ fill: '#7df9ff', fontSize: 10 }}>F</text>
          <line x1={sx(r)} y1={H / 2 - 6} x2={sx(r)} y2={H / 2 + 6} stroke="#b18cff" strokeWidth={2} /><text x={sx(r) + 4} y={H / 2 + 18} style={{ fill: '#b18cff', fontSize: 10 }}>C</text>
        </svg>
      </div>
      <Panel id="op-mirror-readout" className="right-panel" title="Focus and image">
        <dl className="kv" aria-label="Mirror result">
          <KV k="focal length f = R/2" v={f} unit="mm" sig={5} />
          <KV k="paraxial crossing (traced)" v={par?.crossing !== null && par ? -par.crossing! : null} unit="mm in front" sig={6} />
          <KV k="marginal crossing (traced)" v={marg?.crossing !== null && marg ? -marg.crossing! : null} unit="mm in front" sig={5} />
          <KV k="image distance e′" v={img} unit="mm" sig={5} title="Drude eq. 12; negative = in front (real)" />
        </dl>
        <RelatedLinks id="instrument:geometric-optics" />
      </Panel>
    </>
  );
}

// ------------------------------------------------------------------ prism
const PRISM_WLS = [400, 450, 500, 550, 600, 650, 700];
function PrismTab() {
  const { query } = useRoute();
  const mat = query.get('mat') ?? 'fused-silica';
  const A = num(query, 'A', 60, 10, 80), a = num(query, 'a', 50, 0, 89);
  const rows = PRISM_WLS.map((w) => { const n = indexOf(mat, w / 1000); return { w, n, dev: n !== null ? prismDeviation(n, A * deg, a * deg) : null, min: n !== null ? minimumDeviation(n, A * deg) : null }; });
  const W = 560, H = 360, S = 150, ox = W * 0.42, oy = 90, sx = (x: number) => ox + x * S, sy = (y: number) => oy - y * S;
  const depth = 1.4, half = (A * deg) / 2;
  const tri: Vec2[] = [[0, 0], [-depth * Math.tan(half), -depth], [depth * Math.tan(half), -depth]];
  const n589 = indexOf(mat, 0.589);
  return (
    <>
      <Panel id="op-prism-controls" className="left-panel" title="Prism">
        <MediumSelect k="mat" value={mat} label="Prism material" air={false} />
        <Slider k="A" label="apex angle" v={A} min={10} max={80} step={0.5} unit="°" aria="Apex angle" />
        <Slider k="a" label="incidence α₁" v={a} min={0} max={89} step={0.1} unit="°" aria="Angle of incidence" />
        <button className="chip" onClick={() => { const e0 = n589 !== null ? minimumDeviation(n589, A * deg) : null; if (e0 !== null) setQuery({ a: ((e0 / deg + A) / 2).toFixed(2) }); }}>Set minimum deviation at 589 nm</button>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Prism dispersion <ProvenanceBadge cls="derived" title="Southall eqs. 25 and 27; indices n(λ) from the materials dataset" /></h1>
          <p className="note">A ray entering a prism of apex angle β at incidence α₁ is refracted at both faces; its deviation is ε = α₁ − α′₂ − β with sin α₁ = n sin α′₁, α′₁ − α₂ = β and n sin α₂ = sin α′₂ (Southall §70). The deviation is smallest when the ray passes symmetrically, and then n = sin((β + ε₀)/2)/sin(β/2) (§71). Since n depends on colour, each colour leaves at its own angle. <SourceLinks ids={[...SOUTH, ...DRUDE]} /></p>
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Prism ray trace" style={{ width: '100%', maxWidth: W, background: '#03050c', borderRadius: 10, border: '1px solid var(--line)' }}>
          <polygon points={poly(tri, sx, sy)} fill="#7df9ff" fillOpacity={0.15} stroke="#7df9ff" />
          {rows.map((r) => { if (r.n === null) return null; const t = tracePrism(r.n, A * deg, a * deg, depth); return <polyline key={r.w} points={poly(t.path, sx, sy)} fill="none" stroke={wavelengthToColor(r.w)} strokeWidth={1.6} />; })}
        </svg>
      </div>
      <Panel id="op-prism-readout" className="right-panel" title="Deviation">
        <table className="table-mini" aria-label="Prism deviation"><thead><tr><th>λ (nm)</th><th>n</th><th>ε (°)</th><th>ε₀ (°)</th></tr></thead>
          <tbody>{rows.map((r) => <tr key={r.w}><td style={{ color: wavelengthToColor(r.w) }}>{r.w}</td><td>{r.n !== null ? r.n.toFixed(5) : 'unknown'}</td><td>{r.dev !== null ? (r.dev / deg).toFixed(3) : r.n !== null ? 'no exit' : 'unknown'}</td><td>{r.min !== null ? (r.min / deg).toFixed(3) : 'unknown'}</td></tr>)}</tbody></table>
        <dl className="kv" aria-label="Prism result">
          <KV k="n at 589 nm" v={n589} sig={6} />
          <KV k="minimum deviation at 589 nm" v={n589 !== null && minimumDeviation(n589, A * deg) !== null ? minimumDeviation(n589, A * deg)! / deg : null} unit="°" sig={5} />
          <KV k="spread 400–700 nm at this incidence" v={rows[0].dev !== null && rows[6].dev !== null ? (rows[0].dev! - rows[6].dev!) / deg : null} unit="°" sig={4} />
        </dl>
        <p className="note" style={{ fontSize: 10.5 }}>“No exit”: the ray is totally reflected at the second face. <SourceLinks ids={srcOf(mat)} /></p>
        <RelatedLinks id="instrument:geometric-optics" />
      </Panel>
    </>
  );
}

export default function OpticsView() {
  const { query } = useRoute();
  const tab: Tab = TABS.find(([t]) => t === query.get('tab'))?.[0] ?? 'refraction';
  return (
    <>
      <nav className="view-switch" aria-label="Geometric optics sections">
        {TABS.map(([t, label]) => <button key={t} className={tab === t ? 'active' : ''} onClick={() => setQuery({ tab: t === 'refraction' ? null : t })}>{label}</button>)}
      </nav>
      {tab === 'lens' ? <LensTab /> : tab === 'mirror' ? <MirrorTab /> : tab === 'prism' ? <PrismTab /> : <RefractionTab />}
    </>
  );
}
