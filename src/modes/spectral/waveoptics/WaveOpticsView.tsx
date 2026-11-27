/**
 * Wave optics — #/spectral/waveoptics?tab=two|slit|grating|film   (Phase 10, Gate 10.2)
 *
 *  two      two coherent sources (Fresnel's mirrors / Young): wl (nm), d (mm, separation), a (m, distance to screen)
 *  slit     single slit: wl (nm), w (µm, width)
 *  grating  m slits: N (number of lines), p (µm, spacing), w (µm, slit width), src (na | hg | mono), wl (nm, mono), h (order)
 *  film     thin film in air: mat, t (nm, thickness), phi (°, incidence)
 * Physics: src/core/physics/optics/wave.ts (Drude 1902, Pt II Sec. I). Doublets from the bundled NIST lines.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { setQuery, useRoute } from '@/shared/router';
import { KV, Panel, ProvenanceBadge } from '@/ui/components';
import { SourceLinks } from '@/ui/SourcesView';
import { RelatedLinks } from '@/ui/RelatedLinks';
import { LinePlot } from '@/ui/plots';
import { formatSig } from '@/core/units/units';
import { wavelengthToColor } from '@/modes/atomic/atoms/spectrum';
import { loadNistSpectra, type NistSpectra } from '@/modes/atomic/atoms/nistSpectra';
import { MATERIALS, refractiveIndex } from '@/modes/atomic/materials/materials';
import {
  filmMinimaDispersive, filmReflectance, fringeSpacing, gratingIntensity, linesToResolve, orderAngle, pathDifference, resolves, resolvingPower,
  slitFirstZero, slitIntensity, twoSourceIntensity,
} from '@/core/physics/optics/wave';

type Tab = 'two' | 'slit' | 'grating' | 'film';
const TABS: [Tab, string][] = [['two', 'Two sources'], ['slit', 'Single slit'], ['grating', 'Grating'], ['film', 'Thin film']];
const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
const num = (q: URLSearchParams, k: string, d: number, a: number, b: number) => { const v = Number(q.get(k)); return q.has(k) && Number.isFinite(v) ? clamp(v, a, b) : d; };
const deg = Math.PI / 180;
const DRUDE = ['drude-1902'];
function Slider({ k, label, v, min, max, step, unit, aria }: { k: string; label: string; v: number; min: number; max: number; step: number; unit: string; aria: string }) {
  return <label className="slider-row"><span style={{ minWidth: 78 }}>{label}</span><input type="range" min={min} max={max} step={step} value={v} aria-label={aria} onChange={(e) => setQuery({ [k]: e.target.value })} /><span>{v} {unit}</span></label>;
}
/** A strip showing intensity along one axis in the colour of the light (display aid). */
function Strip({ values, color, label }: { values: number[]; color: string; label: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const g = cv.getContext('2d')!, W = cv.width, H = cv.height;
    const r = parseInt(color.slice(1, 3), 16), gg = parseInt(color.slice(3, 5), 16), b = parseInt(color.slice(5, 7), 16);
    const max = Math.max(...values, 1e-30);
    for (let i = 0; i < W; i++) { const v = values[Math.floor((i / W) * values.length)] / max; g.fillStyle = `rgb(${r * v},${gg * v},${b * v})`; g.fillRect(i, 0, 1, H); }
  }, [values, color]);
  return <canvas ref={ref} width={600} height={46} aria-label={label} style={{ width: '100%', maxWidth: 600, borderRadius: 6, border: '1px solid var(--line)' }} />;
}

// ------------------------------------------------------------------ two sources
function TwoTab() {
  const { query } = useRoute();
  const wl = num(query, 'wl', 589, 380, 750), d = num(query, 'd', 0.5, 0.05, 5), a = num(query, 'a', 1, 0.1, 5);
  const lam = wl * 1e-9, dm = d * 1e-3, s = fringeSpacing(a, lam, dm);
  const half = 4 * s, N = 1200;
  const xs = Array.from({ length: N }, (_, i) => -half + (2 * half * i) / (N - 1));
  const I = xs.map((p) => twoSourceIntensity(1, 1, pathDifference(p, dm, a), lam));
  // first dark fringe from the exact pattern
  let lo = 0, hi = s;
  for (let i = 0; i < 60; i++) { const mid = (lo + hi) / 2; if (Math.abs(pathDifference(mid, dm, a)) < lam / 2) lo = mid; else hi = mid; }
  const col = wavelengthToColor(wl);
  return (
    <>
      <Panel id="wo-two-controls" className="left-panel" title="Sources">
        <Slider k="wl" label="wavelength" v={wl} min={380} max={750} step={1} unit="nm" aria="Wavelength" />
        <Slider k="d" label="separation d" v={d} min={0.05} max={5} step={0.01} unit="mm" aria="Source separation" />
        <Slider k="a" label="screen at a" v={a} min={0.1} max={5} step={0.05} unit="m" aria="Distance to the screen" />
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Interference of two sources <ProvenanceBadge cls="derived" title="Drude Pt II Sec. I ch. II §3, eqs. 11–13" /></h1>
          <p className="note">Two coherent sources of amplitudes A₁ and A₂ give at any point the intensity J = A₁² + A₂² + 2A₁A₂ cos 2π(r₁ − r₂)/λ, which depends only on the difference of the paths r₁ − r₂. On a screen at distance a from sources d apart, bright and dark fringes alternate with spacing aλ/d (Drude §3, Fresnel's mirrors). The pattern here uses the exact path difference; the equal amplitudes make the dark fringes fully dark. <SourceLinks ids={DRUDE} /></p>
        </div>
        <Strip values={I} color={col} label="Fringes on the screen" />
        <LinePlot ariaLabel="Intensity on the screen" width={600} height={200} xLabel="position on the screen (mm)" yLabel="J / A²" series={[{ points: xs.map((x, i) => [x * 1e3, I[i]] as [number, number]), color: col }]} yDomain={[0, 4.2]} />
      </div>
      <Panel id="wo-two-readout" className="right-panel" title="Fringes">
        <dl className="kv" aria-label="Fringe result">
          <KV k="fringe spacing aλ/d" v={s * 1e3} unit="mm" sig={5} title="Drude eq. 13" />
          <KV k="first dark fringe (exact path difference λ/2)" v={lo * 1e3} unit="mm" sig={5} />
          <KV k="ratio to s/2" v={lo / (s / 2)} sig={6} />
        </dl>
        <RelatedLinks id="instrument:wave-optics" />
      </Panel>
    </>
  );
}

// ------------------------------------------------------------------ single slit
function SlitTab() {
  const { query } = useRoute();
  const wl = num(query, 'wl', 550, 380, 750), w = num(query, 'w', 5, 0.5, 200);
  const lam = wl * 1e-9, a = w * 1e-6, z = slitFirstZero(a, lam);
  const smax = Math.min(1, 4 * (lam / a)), N = 1000;
  const ss = Array.from({ length: N }, (_, i) => -smax + (2 * smax * i) / (N - 1));
  const I = ss.map((s) => slitIntensity(a, lam, Math.asin(s)));
  const col = wavelengthToColor(wl);
  return (
    <>
      <Panel id="wo-slit-controls" className="left-panel" title="Slit">
        <Slider k="wl" label="wavelength" v={wl} min={380} max={750} step={1} unit="nm" aria="Wavelength" />
        <Slider k="w" label="width a" v={w} min={0.5} max={200} step={0.5} unit="µm" aria="Slit width" />
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Diffraction by a slit <ProvenanceBadge cls="derived" title="Drude Pt II Sec. I ch. IV §11, eq. 78" /></h1>
          <p className="note">By Huygens' principle every point of the opening sends out elementary waves (Drude ch. III §1). Summed far away, a slit of width a gives J = J′[sin(μa/2)/(μa/2)]² with μ = (2π/λ) sin φ (§11): a bright centre, dark where μa/2 = π, 2π, … (sin φ = λ/a, 2λ/a, …), and weak side bands. The narrower the slit, the wider the pattern. <SourceLinks ids={DRUDE} /></p>
        </div>
        <Strip values={I.map((v) => Math.sqrt(v))} color={col} label="Diffraction pattern (brightness ∝ √J, to show the weak bands)" />
        <LinePlot ariaLabel="Slit intensity" width={600} height={200} xLabel="sin φ" yLabel="J / J′" series={[{ points: ss.map((s, i) => [s, I[i]] as [number, number]), color: col }]} yDomain={[0, 1.05]} />
        <p className="note" style={{ fontSize: 10.5 }}>The strip shows √J so that the side bands (under 5 % of the centre) are visible.</p>
      </div>
      <Panel id="wo-slit-readout" className="right-panel" title="Pattern">
        <dl className="kv" aria-label="Slit result">
          <KV k="first dark direction sin φ = λ/a" v={z !== null ? Math.sin(z) : 'none (λ ≥ a)'} sig={5} />
          <KV k="angle of the first dark band" v={z !== null ? z / deg : null} unit="°" sig={5} />
          <KV k="width of the central band (between zeros)" v={z !== null ? (2 * z) / deg : null} unit="°" sig={5} />
        </dl>
        <RelatedLinks id="instrument:wave-optics" />
      </Panel>
    </>
  );
}

// ------------------------------------------------------------------ grating
function useDoublets(): { na: [number, number] | null; hg: [number, number] | null } {
  const [d, setD] = useState<NistSpectra | null>(null);
  useEffect(() => { loadNistSpectra().then(setD).catch(() => setD(null)); }, []);
  return useMemo(() => {
    if (!d) return { na: null, hg: null };
    const pick = (sp: string, lo: number, hi: number): [number, number] | null => {
      const L = (d.spectra[sp]?.lines ?? []).filter((l) => l.wl > lo && l.wl < hi && (l.intensity ?? 0) > 0).sort((a, b) => (b.intensity ?? 0) - (a.intensity ?? 0)).slice(0, 2).map((l) => l.wl).sort((a, b) => a - b);
      return L.length === 2 ? [L[0], L[1]] : null;
    };
    return { na: pick('Na I', 588, 591), hg: pick('Hg I', 576, 580) };
  }, [d]);
}
function GratingTab() {
  const { query } = useRoute();
  const N = Math.round(num(query, 'N', 400, 2, 5000)), p = num(query, 'p', 2, 0.8, 50), w = num(query, 'w', 0.8, 0.1, 50), h = Math.round(num(query, 'h', 1, 1, 5));
  const src = query.get('src') ?? 'na', wlMono = num(query, 'wl', 550, 380, 750);
  const dbl = useDoublets();
  const lines: number[] = src === 'mono' ? [wlMono] : (src === 'hg' ? dbl.hg : dbl.na) ?? [];
  const d = p * 1e-6, a = Math.min(w, p) * 1e-6;
  const mean = lines.length ? lines.reduce((s, x) => s + x, 0) / lines.length : wlMono;
  const centre = orderAngle(h, mean * 1e-9, d);
  const dl = lines.length === 2 ? (lines[1] - lines[0]) * 1e-9 : null;
  // zoom on the order: window wide enough for both lines and a few line widths
  const sc = centre !== null ? Math.sin(centre) : null;
  const halfWin = sc !== null ? Math.max(dl !== null ? 3 * (h * dl) / d : 0, 6 * (mean * 1e-9) / (N * d)) : 0;
  const S = 1200;
  const curve = (lw: number) => (sc === null ? [] : Array.from({ length: S }, (_, i) => { const s = sc - halfWin + (2 * halfWin * i) / (S - 1); return [s, Math.abs(s) <= 1 ? gratingIntensity(N, d, a, lw * 1e-9, Math.asin(s)) : 0] as [number, number]; }));
  const sum = useMemo(() => { if (sc === null) return []; const cs = lines.map(curve); return cs.length ? cs[0].map(([s], i) => [s, cs.reduce((t, c) => t + c[i][1], 0)] as [number, number]) : []; }, [N, d, a, h, src, wlMono, lines.join(), sc, halfWin]); // eslint-disable-line react-hooks/exhaustive-deps
  const overview = useMemo(() => Array.from({ length: 1600 }, (_, i) => { const s = -0.999 + (1.998 * i) / 1599; return [s, gratingIntensity(Math.min(N, 40), d, a, mean * 1e-9, Math.asin(s))] as [number, number]; }), [N, d, a, mean]);
  const ok = dl !== null ? resolves(lines[0] * 1e-9, dl, h, N) : null;
  return (
    <>
      <Panel id="wo-grating-controls" className="left-panel" title="Grating">
        <div className="section-title">Light</div>
        <select className="text-input" aria-label="Light source" value={src} onChange={(e) => setQuery({ src: e.target.value })} style={{ width: '100%' }}>
          <option value="na">sodium D lines (NIST Na I)</option><option value="hg">mercury yellow lines (NIST Hg I)</option><option value="mono">one wavelength</option>
        </select>
        {src === 'mono' && <Slider k="wl" label="wavelength" v={wlMono} min={380} max={750} step={1} unit="nm" aria="Wavelength" />}
        <Slider k="N" label="lines m" v={N} min={2} max={5000} step={1} unit="" aria="Number of lines" />
        <Slider k="p" label="spacing d" v={p} min={0.8} max={50} step={0.1} unit="µm" aria="Line spacing" />
        <Slider k="w" label="slit width a" v={w} min={0.1} max={50} step={0.1} unit="µm" aria="Slit width" />
        <Slider k="h" label="order h" v={h} min={1} max={5} step={1} unit="" aria="Diffraction order" />
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Diffraction grating <ProvenanceBadge cls="derived" title="Drude Pt II Sec. I ch. IV §§15, 18, eqs. 85, 86, 88" /></h1>
          <p className="note">A grating of m slits of width a and spacing d gives J = J₁′[sin²(μa/2)/(μa/2)²][sin²(mμd/2)/sin²(μd/2)]: sharp principal maxima where sin φ = hλ/d, the order h, under the single-slit envelope (Drude §15). The maxima narrow as m grows, so two lines λ and λ + dλ separate when dλ/λ &gt; 1/(hm); the resolving power is proportional to the number of lines and to the order (§18). The doublets are the NIST wavelengths (vacuum). <SourceLinks ids={[...DRUDE, 'nist-asd']} /></p>
        </div>
        <LinePlot ariaLabel="Grating overview" width={600} height={150} xLabel="sin φ" yLabel="J (m ≤ 40 shown)" series={[{ points: overview, color: wavelengthToColor(mean) }]} />
        {sc !== null ? <LinePlot ariaLabel="Order profile" width={600} height={200} xLabel={`sin φ near order ${h}`} yLabel="J (sum of lines)" series={[...lines.map((lw) => ({ points: curve(lw), color: wavelengthToColor(lw), dashed: true })), { points: sum, color: '#ffffff', label: 'sum' }]} />
          : <p className="note unknown">Order {h} does not exist for this spacing (hλ/d &gt; 1).</p>}
      </div>
      <Panel id="wo-grating-readout" className="right-panel" title="Resolution">
        <dl className="kv" aria-label="Grating result">
          <KV k="lines" v={lines.length ? lines.map((x) => x.toFixed(4)).join(' and ') : 'loading NIST lines…'} unit="nm" />
          <KV k={`order ${h} direction`} v={centre !== null ? centre / deg : 'none (hλ/d > 1)'} unit={centre !== null ? '°' : undefined} sig={5} />
          <KV k="resolving power hm" v={resolvingPower(h, N)} sig={6} />
          {dl !== null && <KV k="needed λ/dλ" v={lines[0] / (lines[1] - lines[0])} sig={5} />}
          {dl !== null && <KV k="resolved" v={ok ? 'yes' : 'no'} />}
          {dl !== null && <KV k={`fewest lines to resolve in order ${h}`} v={linesToResolve(lines[0] * 1e-9, dl, h)} sig={6} />}
        </dl>
        <RelatedLinks id="instrument:wave-optics" />
      </Panel>
    </>
  );
}

// ------------------------------------------------------------------ thin film
const FILM_MATS = MATERIALS.filter((m) => m.refractiveIndex);
function FilmTab() {
  const { query } = useRoute();
  const mat = query.get('mat') ?? 'water', t = num(query, 't', 500, 10, 3000), phi = num(query, 'phi', 0, 0, 80);
  const m = FILM_MATS.find((x) => x.id === mat) ?? FILM_MATS[0];
  const nAt = (nm: number) => refractiveIndex(m.refractiveIndex!, nm / 1000);
  const pts = Array.from({ length: 371 }, (_, i) => { const nm = 380 + i; const n = nAt(nm); return [nm, n !== null ? filmReflectance(t * 1e-9, n, nm * 1e-9, phi * deg) : NaN] as [number, number]; }).filter((p) => Number.isFinite(p[1]));
  const n550 = nAt(550);
  const minima = filmMinimaDispersive(t * 1e-9, (l) => nAt(l * 1e9), phi * deg, 380e-9, 750e-9);
  // a strip of thickness 0 → 1500 nm at three wavelengths, coloured with the light (display aid)
  const strips = [450, 550, 650].map((nm) => { const n = nAt(nm); return { nm, v: Array.from({ length: 300 }, (_, i) => (n !== null ? filmReflectance((i / 299) * 1500e-9, n, nm * 1e-9, phi * deg) : 0)) }; });
  return (
    <>
      <Panel id="wo-film-controls" className="left-panel" title="Film">
        <select className="text-input" aria-label="Film material" value={m.id} onChange={(e) => setQuery({ mat: e.target.value })} style={{ width: '100%' }}>
          {FILM_MATS.map((x) => <option key={x.id} value={x.id}>{x.refractiveIndex!.label}</option>)}
        </select>
        <Slider k="t" label="thickness" v={t} min={10} max={3000} step={5} unit="nm" aria="Film thickness" />
        <Slider k="phi" label="incidence" v={phi} min={0} max={80} step={1} unit="°" aria="Angle of incidence" />
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Colours of thin films <ProvenanceBadge cls="derived" title="Drude Pt II Sec. I ch. II §5, eqs. 14–17" /></h1>
          <p className="note">“Sufficiently thin films of all transparent bodies show brilliant colors.” Light reflected from the two faces of a film of thickness d differs in phase by Δ = 2π(2d/λ′) cos χ + Δ′, where λ′ = λ/n is the wavelength in the film, χ the angle inside it and Δ′ = ±π the reversal at one of the faces; the reflected light is weakest when (2d/λ′) cos χ = 0, 1, 2, … (Drude §5). Each wavelength is cancelled at its own thicknesses, which colours the film. <SourceLinks ids={[...DRUDE, ...(m.refractiveIndex!.sources)]} /></p>
        </div>
        <LinePlot ariaLabel="Film reflection spectrum" width={600} height={200} xLabel="wavelength (nm)" yLabel="reflected / maximum" series={[{ points: pts, color: '#f5c76b' }]} yDomain={[0, 1.05]} vLines={minima.map((x) => ({ x: x.lambda * 1e9, label: `k = ${x.k}`, color: '#7df9ff' }))} />
        <div className="section-title">Reflected light against thickness, 0–1500 nm</div>
        {strips.map((s) => <Strip key={s.nm} values={s.v} color={wavelengthToColor(s.nm)} label={`Reflection at ${s.nm} nm against thickness`} />)}
        <p className="note" style={{ fontSize: 10.5 }}>Two beams of equal amplitude: the bright and dark wavelengths are placed correctly, not the absolute reflectance (Fresnel amplitudes come in Gate 10.3). Strip colours are a display aid.</p>
      </div>
      <Panel id="wo-film-readout" className="right-panel" title="Minima">
        <dl className="kv" aria-label="Film result">
          <KV k="n at 550 nm" v={n550} sig={5} />
          <KV k="optical path 2nd cos χ (550 nm)" v={n550 !== null ? 2 * t * n550 * Math.cos(Math.asin(Math.sin(phi * deg) / n550)) : null} unit="nm" sig={5} />
          <KV k="dark wavelengths in 380–750 nm" v={minima.length ? minima.map((x) => `${formatSig(x.lambda * 1e9, 4)} (k = ${x.k})`).join(', ') : 'none'} unit={minima.length ? 'nm' : undefined} />
        </dl>
        <RelatedLinks id="instrument:wave-optics" />
      </Panel>
    </>
  );
}

export default function WaveOpticsView() {
  const { query } = useRoute();
  const tab: Tab = TABS.find(([t]) => t === query.get('tab'))?.[0] ?? 'two';
  return (
    <>
      <nav className="view-switch" aria-label="Wave optics sections">
        {TABS.map(([t, label]) => <button key={t} className={tab === t ? 'active' : ''} onClick={() => setQuery({ tab: t === 'two' ? null : t })}>{label}</button>)}
      </nav>
      {tab === 'slit' ? <SlitTab /> : tab === 'grating' ? <GratingTab /> : tab === 'film' ? <FilmTab /> : <TwoTab />}
    </>
  );
}
