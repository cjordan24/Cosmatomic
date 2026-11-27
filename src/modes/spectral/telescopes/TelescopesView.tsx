/**
 * Telescopes and cameras — #/spectral/telescopes?tab=airy|resolve|instruments   (Phase 10, Gate 10.6)
 *
 *  airy         Airy's pattern of a circular aperture: D (m), wl (nm)
 *  resolve      two equal stars: D (m), wl (nm), sep (in units of the first dark ring)
 *  instruments  Hubble and JWST: wl (µm)
 * Physics: src/core/physics/optics/telescopes.ts (Airy 1835; Rayleigh, Scientific Papers I; STScI documentation).
 */
import { useCallback, useEffect, useRef } from 'react';
import { setQuery, useRoute } from '@/shared/router';
import { KV, Panel, ProvenanceBadge } from '@/ui/components';
import { SourceLinks } from '@/ui/SourcesView';
import { RelatedLinks } from '@/ui/RelatedLinks';
import { LinePlot } from '@/ui/plots';
import { formatSig } from '@/core/units/units';
import { wavelengthToColor } from '@/modes/atomic/atoms/spectrum';
import {
  airyAngle, airyFirstRing, airyHalfLight, airyIntensity, airyIntensityFast, airyRadiusFocal, airyZero, doubleStar, focalLength, plateScaleArcsecPerMm,
  slitPairMidpoint, toArcsec,
} from '@/core/physics/optics/telescopes';

type Tab = 'airy' | 'resolve' | 'instruments';
const TABS: [Tab, string][] = [['airy', 'Airy pattern'], ['resolve', 'Resolving two stars'], ['instruments', 'Hubble and JWST']];
const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
const num = (q: URLSearchParams, k: string, d: number, a: number, b: number) => { const v = Number(q.get(k)); return q.has(k) && Number.isFinite(v) ? clamp(v, a, b) : d; };
const AIRY = ['airy-1835'], RAY = ['rayleigh-scientific-papers-1'];
function Slider({ k, label, v, min, max, step, unit, aria }: { k: string; label: string; v: number; min: number; max: number; step: number; unit: string; aria: string }) {
  return <label className="slider-row"><span style={{ minWidth: 78 }}>{label}</span><input type="range" min={min} max={max} step={step} value={v} aria-label={aria} onChange={(e) => setQuery({ [k]: e.target.value })} /><span>{v} {unit}</span></label>;
}
/** A 2-D image of an intensity function of angle, coloured with the light (log brightness so the rings show). */
function Image2D({ f, extent, color, label }: { f: (x: number, y: number) => number; extent: number; color: string; label: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const N = 220, g = cv.getContext('2d')!, img = g.createImageData(N, N);
    const r = parseInt(color.slice(1, 3), 16), gg = parseInt(color.slice(3, 5), 16), b = parseInt(color.slice(5, 7), 16);
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
      const x = ((i + 0.5) / N - 0.5) * 2 * extent, y = ((j + 0.5) / N - 0.5) * 2 * extent;
      const v = Math.max(0, 1 + Math.log10(Math.max(f(x, y), 1e-4)) / 4), o = 4 * (j * N + i);
      img.data[o] = r * v; img.data[o + 1] = gg * v; img.data[o + 2] = b * v; img.data[o + 3] = 255;
    }
    cv.width = N; cv.height = N; g.putImageData(img, 0, 0);
  }, [f, extent, color]);
  return <canvas ref={ref} aria-label={label} style={{ width: 260, height: 260, borderRadius: 8, border: '1px solid var(--line)', imageRendering: 'auto' }} />;
}

// ------------------------------------------------------------------ Airy pattern
function AiryTab() {
  const { query } = useRoute();
  const D = num(query, 'D', 0.1, 0.005, 10), wl = num(query, 'wl', 550, 380, 750), lam = wl * 1e-9;
  const th1 = airyAngle(lam, D);
  const ns = Array.from({ length: 400 }, (_, i) => (i / 399) * 12);
  const ring = airyFirstRing();
  const airyImage = useCallback((x: number, y: number) => airyIntensityFast(Math.hypot(x, y)), []);
  return (
    <>
      <Panel id="ts-airy-controls" className="left-panel" title="Aperture">
        <Slider k="D" label="diameter D" v={D} min={0.005} max={10} step={0.005} unit="m" aria="Aperture diameter" />
        <Slider k="wl" label="wavelength" v={wl} min={380} max={750} step={1} unit="nm" aria="Wavelength" />
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>The image of a star: Airy's pattern <ProvenanceBadge cls="derived" title="Airy (1835) pp. 286–287; Rayleigh, Scientific Papers I, Art. 62 §1" /></h1>
          <p className="note">“The image of a star will not be a point but a bright circle surrounded by a series of bright rings”, whose size “will depend on nothing but the aperture of the telescope, and will be inversely as the aperture” (Airy 1835). Airy expressed the light in terms of n = (2π/λ)(ba/f), a being the radius of the object-glass and b/f the angle from the axis, as the square of ∫√(1 − w²) cos nw dw; he found the central spot at half light for n = 1·616, a black ring at 3·832 and the first bright ring at 5·12 with about 1/57 of the central intensity. In terms of the diameter the first dark ring lies at θ = 1·2197 λ/2R (Rayleigh). The curve and image are computed from Airy's integral; the image uses a log brightness scale so the faint rings show. <SourceLinks ids={[...AIRY, ...RAY]} /></p>
        </div>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <Image2D f={airyImage} extent={12} color={wavelengthToColor(wl)} label="Airy pattern (log brightness)" />
          <div style={{ flex: '1 1 340px', maxWidth: 380 }}><LinePlot ariaLabel="Airy intensity" width={360} height={240} xLabel="Airy's n = (2π/λ) a sin θ" yLabel="intensity / centre" yLog yDomain={[1e-4, 1.2]} series={[{ points: ns.map((n) => [n, Math.max(airyIntensity(n), 1e-5)] as [number, number]), color: wavelengthToColor(wl) }]}
            vLines={[{ x: 3.832, label: '3·832', color: '#888' }, { x: 7.14, label: '', color: '#ff7a90' }, { x: airyZero(2), label: '7.016 / Airy 7·14', color: '#7df9ff' }]} /></div>
        </div>
        <p className="note" style={{ fontSize: 10.5 }}>Airy's own table puts the second black ring at n = 7·14; his integral, computed here, vanishes at n = 7.016 (both marked). His third black ring, 10·17, agrees with the integral.</p>
      </div>
      <Panel id="ts-airy-readout" className="right-panel" title="Rings">
        <dl className="kv" aria-label="Airy result">
          <KV k="half light (computed / Airy)" v={`${airyHalfLight().toFixed(4)} / 1.616`} />
          <KV k="first black ring (computed / Airy)" v={`${airyZero(1).toFixed(4)} / 3.832`} />
          <KV k="first bright ring (computed / Airy)" v={`${ring.n.toFixed(3)} / 5.12`} />
          <KV k="its intensity (computed / Airy)" v={`1/${(1 / ring.intensity).toFixed(1)} / about 1/57`} />
          <KV k="first dark ring θ = 1.2197 λ/D" v={toArcsec(th1)} unit="″" sig={4} />
          <KV k="the same in degrees" v={(th1 * 180) / Math.PI} unit="°" sig={4} />
        </dl>
        <RelatedLinks id="instrument:telescopes" />
      </Panel>
    </>
  );
}

// ------------------------------------------------------------------ two stars
function ResolveTab() {
  const { query } = useRoute();
  const D = num(query, 'D', 0.1, 0.005, 10), wl = num(query, 'wl', 550, 380, 750), sep = num(query, 'sep', 1, 0.2, 3), lam = wl * 1e-9;
  const th = airyAngle(lam, D), dTh = sep * th;
  const xs = Array.from({ length: 401 }, (_, i) => (-2.5 + (5 * i) / 400) * th);
  const prof = xs.map((x) => doubleStar(lam, D, dTh, x));
  const peak = Math.max(...prof), mid = doubleStar(lam, D, dTh, 0);
  const z1 = airyZero(1);
  const f = useCallback((x: number, y: number) => (airyIntensityFast(Math.hypot(x - (sep * z1) / 2, y)) + airyIntensityFast(Math.hypot(x + (sep * z1) / 2, y))) / Math.max(peak, 1e-9), [sep, z1, peak]);
  return (
    <>
      <Panel id="ts-res-controls" className="left-panel" title="Double star">
        <Slider k="D" label="diameter D" v={D} min={0.005} max={10} step={0.005} unit="m" aria="Aperture diameter" />
        <Slider k="wl" label="wavelength" v={wl} min={380} max={750} step={1} unit="nm" aria="Wavelength" />
        <Slider k="sep" label="separation" v={sep} min={0.2} max={3} step={0.01} unit="× θ₁" aria="Separation in units of the first dark ring" />
        <button className="chip" onClick={() => setQuery({ sep: '1' })}>Centre of one on the first dark ring of the other</button>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Resolving two stars <ProvenanceBadge cls="derived" title="Rayleigh, Scientific Papers I, Art. 62 §§1–2 and Art. 67; Airy's integral" /></h1>
          <p className="note">Two stars of equal brightness give two Airy patterns whose intensities add. Rayleigh took as “about the limit of closeness at which there could be any decided appearance of resolution” the separation at which “the central line in the image of one coincides with the first zero of brightness in the image of the other”; for a slit-shaped aperture the brightness midway between the two centres is then ·8106 of that at the centres (Art. 62 §2). For a circular aperture the first zero lies at 1·2197 λ/D, and Rayleigh found by observation that a circular aperture “must be about a tenth part wider than the slit” for equal resolving power (Art. 67). <SourceLinks ids={[...RAY, ...AIRY]} /></p>
        </div>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <Image2D f={f} extent={9} color={wavelengthToColor(wl)} label="Two stars (log brightness)" />
          <div style={{ flex: '1 1 340px', maxWidth: 380 }}><LinePlot ariaLabel="Profile through both stars" width={360} height={240} xLabel="angle along the pair (″)" yLabel="relative intensity" yDomain={[0, 1.05]} series={[{ points: xs.map((x, i) => [toArcsec(x), prof[i] / peak] as [number, number]), color: wavelengthToColor(wl) }]} /></div>
        </div>
      </div>
      <Panel id="ts-res-readout" className="right-panel" title="Resolution">
        <dl className="kv" aria-label="Resolution result">
          <KV k="first dark ring θ₁" v={toArcsec(th)} unit="″" sig={4} />
          <KV k="separation" v={toArcsec(dTh)} unit="″" sig={4} />
          <KV k="midpoint brightness / peak" v={mid / peak} sig={4} />
          <KV k="Rayleigh's slit case (computed)" v={slitPairMidpoint()} sig={4} title="Two (sin u/u)² images on each other's first zero" />
        </dl>
        <RelatedLinks id="instrument:telescopes" />
      </Panel>
    </>
  );
}

// ------------------------------------------------------------------ instruments
const SCOPES = [
  { id: 'hst', name: 'Hubble Space Telescope', D: 2.4, N: 24, F: null, source: 'stsci-hst-primer', range: [0.09, 3], note: 'Ritchey–Chrétien Cassegrain; wavelength coverage 90 nm to ~3 µm; plate scale 3.58″/mm and PSF FWHM 0.043″ at 5000 Å (Primer).' },
  { id: 'jwst', name: 'James Webb Space Telescope', D: 6.5, N: 20, F: 131.4, source: 'stsci-jwst-jdox', range: [0.6, 28], note: '18 hexagonal segments of ~1.4 m acting as one ~6.5 m mirror; unobscured collecting area 25.4 m²; effective focal length 131.4 m; gold coating from 0.6 to just beyond 28 µm (JDox).' },
] as const;
function InstrumentsTab() {
  const { query } = useRoute();
  const wl = num(query, 'wl', 1, 0.1, 28);
  const lams = Array.from({ length: 200 }, (_, i) => 10 ** (Math.log10(0.09) + ((Math.log10(28) - Math.log10(0.09)) * i) / 199));
  return (
    <>
      <Panel id="ts-ins-controls" className="left-panel" title="Wavelength">
        <Slider k="wl" label="wavelength" v={wl} min={0.1} max={28} step={0.01} unit="µm" aria="Wavelength in micrometres" />
        <button className="chip" onClick={() => setQuery({ wl: '0.5' })}>0.5 µm (Hubble's PSF figure)</button>
        <button className="chip" onClick={() => setQuery({ wl: '2' })}>2 µm (near infrared)</button>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Hubble and JWST <ProvenanceBadge cls="derived" title="STScI HST Primer and JWST JDox parameters; Airy/Rayleigh diffraction limit" /></h1>
          <p className="note">A telescope of aperture D and focal ratio N has focal length F = N·D (JWST's documentation states its effective focal length, 131.4 m, which is used directly), so one millimetre in its focal plane spans 1/F radians: the plate scale. Diffraction sets the smallest detail it can show, the first dark ring at 1·2197 λ/D (Airy, Rayleigh), which grows with the wavelength and shrinks with the aperture: at the same wavelength the 6.5 m JWST resolves detail 2.7 times finer than the 2.4 m Hubble. Real telescopes have central obstructions and support struts, so their images are close to but not exactly Airy patterns (Hubble's measured FWHM at 500 nm, 0.043″, is a little narrower than an unobstructed aperture's 0.044″). <SourceLinks ids={['stsci-hst-primer', 'stsci-jwst-jdox', ...AIRY, ...RAY]} /></p>
        </div>
        <LinePlot ariaLabel="Diffraction limit against wavelength" width={600} height={240} xLog yLog xLabel="wavelength (µm)" yLabel="first dark ring (″)" legend="tl"
          series={SCOPES.map((s, i) => ({ points: lams.filter((l) => l >= s.range[0] && l <= s.range[1]).map((l) => [l, toArcsec(airyAngle(l * 1e-6, s.D))] as [number, number]), color: i ? '#f5c76b' : '#7df9ff', label: `${s.name} (${s.D} m)` }))} vLines={[{ x: wl, label: 'λ', color: '#888' }]} />
        <table className="table-mini" aria-label="Telescopes" style={{ maxWidth: 640 }}>
          <thead><tr><th>telescope</th><th>D (m)</th><th>f/</th><th>F (m)</th><th>plate scale (″/mm)</th><th>θ₁ at λ (″)</th><th>ring radius at λ (µm)</th></tr></thead>
          <tbody>{SCOPES.map((s) => { const inR = wl >= s.range[0] && wl <= s.range[1]; return <tr key={s.id}><td style={{ fontFamily: 'var(--font)' }}>{s.name}</td><td>{s.D}</td><td>{s.N}</td><td>{formatSig(s.F ?? focalLength(s.N, s.D), 4)}{s.F ? ' (stated)' : ''}</td><td>{formatSig(plateScaleArcsecPerMm(s.F ?? focalLength(s.N, s.D)), 3)}</td><td>{inR ? formatSig(toArcsec(airyAngle(wl * 1e-6, s.D)), 3) : <span className="unknown">outside its range</span>}</td><td>{inR ? formatSig(airyRadiusFocal(wl * 1e-6, s.N) * 1e6, 3) : ''}</td></tr>; })}</tbody>
        </table>
        {SCOPES.map((s) => <p key={s.id} className="note" style={{ fontSize: 10.5 }}>{s.name}: {s.note} <SourceLinks ids={[s.source]} /></p>)}
      </div>
      <Panel id="ts-ins-readout" className="right-panel" title="Checks">
        <dl className="kv" aria-label="Instrument result">
          <KV k="Hubble plate scale, computed / Primer" v={`${plateScaleArcsecPerMm(57.6).toFixed(3)} / 3.58`} unit="″/mm" />
          <KV k="Hubble FWHM at 500 nm, unobstructed / Primer" v={`${toArcsec((2 * airyHalfLight() * 500e-9) / (Math.PI * 2.4)).toFixed(4)} / 0.043`} unit="″" />
          <KV k="JWST aperture implied by 131.4 m at f/20" v={131.4 / 20} unit="m" sig={3} />
          <KV k="JWST/Hubble aperture ratio" v={6.5 / 2.4} sig={3} />
        </dl>
        <RelatedLinks id="instrument:telescopes" />
      </Panel>
    </>
  );
}

export default function TelescopesView() {
  const { query } = useRoute();
  const tab: Tab = TABS.find(([t]) => t === query.get('tab'))?.[0] ?? 'airy';
  return (
    <>
      <nav className="view-switch" aria-label="Telescope sections">
        {TABS.map(([t, label]) => <button key={t} className={tab === t ? 'active' : ''} onClick={() => setQuery({ tab: t === 'airy' ? null : t })}>{label}</button>)}
      </nav>
      {tab === 'resolve' ? <ResolveTab /> : tab === 'instruments' ? <InstrumentsTab /> : <AiryTab />}
    </>
  );
}
