/**
 * Gravitational lensing — #/cosmic/lensing?tab=plane|curve|astrometry&lens=<preset>&bx=&by=&rs=&umin=&tE=
 * Point-mass lens plane rendered by inverse ray shooting, microlensing light curves and the astrometric
 * deflection measured for Stein 2051 B. Gate 6.3.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { setQuery, useRoute, navigate } from '@/shared/router';
import { CONSTANTS, PARSEC_M } from '@/core/constants/constants';
import {
  MAS, centroidShift, deltaMag, einsteinRadius, einsteinRadiusMas, einsteinTime, imageMagnifications, imagePositions, lightCurve,
  majorImageShift, sourcePlanePoint, totalMagnification,
} from '@/core/physics/lensing';
import type { ProvenanceClass } from '@/core/provenance/provenance';
import { KV, Panel, ProvenanceBadge } from '@/ui/components';
import { LinePlot } from '@/ui/plots';
import { RelatedLinks } from '@/ui/RelatedLinks';
import { SourceLinks } from '@/ui/SourcesView';
import { compactById } from '@/modes/cosmic/compact/compact';
import { loadTenParsec } from '@/modes/cosmic/star-systems/stars';

type Tab = 'plane' | 'curve' | 'astrometry';
const TABS: [Tab, string][] = [['plane', 'Lens plane'], ['curve', 'Microlensing light curve'], ['astrometry', 'Stein 2051 B deflection']];

interface LensPreset { id: string; label: string; provenance: ProvenanceClass; thetaE: number /* rad */; mass: number; Dd: number | null; note: string; sources: string[] }

const STEIN = compactById('stein-2051-b')!;
const steinM = (q: string) => STEIN.measurements.find((x) => x.quantity.startsWith(q))!.value!;
const STEIN_PIREL = steinM('parallax of Stein 2051 B')[0] - steinM('parallax of the background star')[0];
const kpc = 1e3 * PARSEC_M;

const PRESETS: LensPreset[] = [
  { id: 'stein', label: 'Stein 2051 B (white dwarf, 5.5 pc)', provenance: 'observed', thetaE: steinM('Einstein ring radius')[0] * MAS, mass: STEIN.mass[0], Dd: 1000 / steinM('parallax of Stein 2051 B')[0] * PARSEC_M,
    note: `Measured θ_E = ${steinM('Einstein ring radius')[0]} ± ${steinM('Einstein ring radius')[1]} mas (HST astrometry of a background star).`, sources: ['sahu-2017'] },
  { id: 'bulge', label: '0.3 M☉ star at 4 kpc, source at 8 kpc', provenance: 'hypothetical', thetaE: einsteinRadius(0.3 * CONSTANTS.GMsun.value, 4 * kpc, 8 * kpc)!, mass: 0.3, Dd: 4 * kpc,
    note: 'A typical Galactic microlensing geometry, chosen for illustration (lens halfway to a bulge source).', sources: ['narayan-bartelmann-1996'] },
  { id: 'galaxy', label: '10¹¹ M☉ galaxy, effective distance 1 Gpc', provenance: 'hypothetical', thetaE: einsteinRadius(1e11 * CONSTANTS.GMsun.value, 1e6 * kpc, 1e40)!, mass: 1e11, Dd: null,
    note: 'Narayan & Bartelmann’s order-of-magnitude example (θ_E ≈ 0.″9). A real galaxy is not a point mass; distances are angular-diameter distances.', sources: ['narayan-bartelmann-1996'] },
];

const fmtAngle = (rad: number) => { const mas = rad / MAS; return mas >= 1000 ? `${(mas / 1000).toPrecision(4)}″` : mas >= 1 ? `${mas.toPrecision(4)} mas` : `${(mas * 1000).toPrecision(4)} µas`; };

function useParams() {
  const { query } = useRoute();
  const tab = (TABS.find(([t]) => t === query.get('tab'))?.[0] ?? 'plane') as Tab;
  const lens = PRESETS.find((p) => p.id === query.get('lens')) ?? PRESETS[0];
  const bx = Number(query.get('bx') ?? 0.6), by = Number(query.get('by') ?? 0.25);
  const rs = Math.max(0.01, Math.min(0.6, Number(query.get('rs') ?? 0.12)));
  const umin = Math.max(0.01, Math.min(1.5, Number(query.get('umin') ?? 0.3)));
  const v = Math.max(10, Math.min(1000, Number(query.get('v') ?? 200)));
  return { tab, lens, bx, by, rs, umin, v };
}

/** Image plane of a circular source behind a point lens, by inverse ray shooting (β = θ − θ/|θ|²). */
function LensPlane({ bx, by, rs }: { bx: number; by: number; rs: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const N = 420, EXT = 2.6; // half-width in θ_E
  const toPix = (x: number) => ((x + EXT) / (2 * EXT)) * N;
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext('2d'); if (!ctx) return;
    const img = ctx.createImageData(N, N);
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
      const x = -EXT + ((i + 0.5) / N) * 2 * EXT, y = EXT - ((j + 0.5) / N) * 2 * EXT;
      const [b1, b2] = sourcePlanePoint(x, y);
      const d = Math.hypot(b1 - bx, b2 - by) / rs;
      const k = (j * N + i) * 4;
      if (d < 1) { const limb = Math.sqrt(1 - d * d); img.data[k] = 255; img.data[k + 1] = 190 + 50 * limb; img.data[k + 2] = 110 + 120 * limb; img.data[k + 3] = 255; }
      else { img.data[k] = 6; img.data[k + 1] = 8; img.data[k + 2] = 18; img.data[k + 3] = 255; }
    }
    ctx.putImageData(img, 0, 0);
  }, [bx, by, rs]);
  const onPointer = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.type === 'pointermove' && e.buttons !== 1) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 2 * EXT - EXT, y = EXT - ((e.clientY - r.top) / r.height) * 2 * EXT;
    setQuery({ bx: x.toFixed(3), by: y.toFixed(3) });
  };
  const u = Math.hypot(bx, by);
  const [tp, tm] = u > 0 ? imagePositions(u) : [1, -1];
  const dir = u > 0 ? [bx / u, by / u] : [1, 0];
  return (
    <div style={{ position: 'relative', width: N, maxWidth: '100%', aspectRatio: '1', touchAction: 'none', cursor: 'crosshair' }} onPointerDown={onPointer} onPointerMove={onPointer} role="img" aria-label="Lens plane: lensed image of a circular source">
      <canvas ref={ref} width={N} height={N} style={{ width: '100%', height: '100%', borderRadius: 6, border: '1px solid var(--line)' }} />
      <svg viewBox={`0 0 ${N} ${N}`} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
        <circle cx={toPix(0)} cy={toPix(0)} r={(N / (2 * EXT))} fill="none" stroke="#7df9ff" strokeDasharray="5 4" />
        <circle cx={toPix(bx)} cy={toPix(-by)} r={(rs * N) / (2 * EXT)} fill="none" stroke="#ffffff" strokeDasharray="3 3" opacity={0.8} />
        <circle cx={toPix(0)} cy={toPix(0)} r={4} fill="#ff7a90" />
        {u > 0 && [tp, tm].map((t, i) => <circle key={i} cx={toPix(t * dir[0])} cy={toPix(-t * dir[1])} r={3} fill="none" stroke="#5cf2a6" strokeWidth={1.5} />)}
        <text x={8} y={16} style={{ fill: '#7df9ff', fontSize: 11 }}>- - Einstein ring θ_E</text>
        <text x={8} y={30} style={{ fill: '#ffffff', fontSize: 11 }}>- - true source position</text>
        <text x={8} y={44} style={{ fill: '#5cf2a6', fontSize: 11 }}>○ point-source images θ±</text>
        <text x={8} y={N - 8} style={{ fill: 'var(--text-dim)', fontSize: 11 }}>{(2 * EXT).toFixed(1)} θ_E across · drag to move the source</text>
      </svg>
    </div>
  );
}

function CurveTab({ umin, lens, v }: { umin: number; lens: LensPreset; v: number }) {
  const tE = lens.Dd ? einsteinTime(lens.thetaE, lens.Dd, v * 1e3) / 86400 : null;
  const ts = Array.from({ length: 401 }, (_, i) => -2 + i * 0.01);
  const family = [0.1, 0.3, 0.5, 0.7, 0.9, 1.1];
  return (
    <>
      <LinePlot ariaLabel="Microlensing light curves" width={640} height={300} xDomain={[-2, 2]} yDomain={[1, 11]} yLog
        xLabel="time from peak (t − t_peak)/t_E" yLabel="magnification µ (log scale)" legend="tr"
        series={[...family.map((u0) => ({ points: ts.map((t) => [t, lightCurve(t, u0, 0, 1)] as [number, number]), color: 'rgba(125,249,255,0.35)', width: 1 })),
          { points: ts.map((t) => [t, lightCurve(t, umin, 0, 1)] as [number, number]), color: '#f5c76b', width: 2.2, label: `u_min = ${umin.toFixed(2)}` }]}
        hLines={[{ y: 1.34, label: 'µ = 1.34 (u = 1)', color: '#b18cff' }]} />
      <p className="note">Peak magnification µ = {totalMagnification(umin).toFixed(3)} ({deltaMag(totalMagnification(umin)).toFixed(2)} mag) when the source passes {umin.toFixed(2)} θ_E from the lens. Thin curves: u_min = 0.1, 0.3, … 1.1, as in Narayan &amp; Bartelmann’s Fig. 9. The light curve is symmetric and achromatic, which distinguishes lensing from intrinsic variability <SourceLinks ids={['narayan-bartelmann-1996']} />.</p>
      <dl className="kv" aria-label="Einstein time">
        <KV k="Einstein time t_E = D_d θ_E / v" v={tE} unit="days" sig={4} />
      </dl>
      {tE !== null && <p className="note" style={{ fontSize: 10.5 }}>At the speed you chose ({v} km/s) <ProvenanceBadge cls="hypothetical" />; θ_E and the lens distance come from the selected lens.</p>}
      {tE === null && <p className="note">No lens distance for this preset, so no time scale.</p>}
      <p className="note" style={{ fontSize: 10.5 }}>Straight-line relative motion: u(t) = √(u_min² + ((t − t_peak)/t_E)²). Point source and point lens; a finite source smooths the peak when u_min is comparable to its angular size.</p>
    </>
  );
}

function AstrometryTab() {
  const thE = steinM('Einstein ring radius')[0];
  const seps = Array.from({ length: 200 }, (_, i) => 10 ** (Math.log10(100) + (i / 199) * (Math.log10(5000) - Math.log10(100))));
  return (
    <>
      <LinePlot ariaLabel="Astrometric deflection by Stein 2051 B" width={640} height={300} xLog yLog xDomain={[100, 5000]} yDomain={[0.1, 20]}
        xLabel="lens–source separation (mas, log scale)" yLabel="apparent shift of the background star (mas)" legend="tr"
        series={[{ points: seps.map((s) => [s, majorImageShift(s / thE, thE)] as [number, number]), color: '#f5c76b', label: 'major image ½(√(u²+4) − u) θ_E' },
          { points: seps.map((s) => [s, centroidShift(s / thE, thE)] as [number, number]), color: '#7df9ff', dashed: true, label: 'light centroid θ_E u/(u²+2)' }]}
        vLines={[{ x: 203, label: 'closest epoch 203 mas', color: '#b18cff' }, { x: 450, label: '~450 mas', color: '#5cf2a6' }]}
        markers={[{ x: 500, y: majorImageShift(500 / thE, thE), label: `${majorImageShift(500 / thE, thE).toFixed(2)} mas at 0.″5`, color: '#f5c76b' }]} />
      <p className="note">In 2014 the white dwarf Stein 2051 B passed in front of a faint background star. HST measured the star’s displacement at separations from 203 to 3897 mas (usable beyond about 450 mas, outside the white dwarf’s glare). The fit gave θ_E = {thE} ± {steinM('Einstein ring radius')[1]} mas, so with the lens–source parallax of {STEIN_PIREL.toFixed(2)} mas the mass is M = θ_E²/(κπ_rel) = {STEIN.mass[0]} ± {STEIN.mass[1]} M☉ <SourceLinks ids={['sahu-2017']} />. The major-image shift is their eq. 2; the centroid curve applies when both images blend.</p>
      <dl className="kv" aria-label="Stein 2051 B lensing">
        <KV k="Einstein radius (measured)" v={`${thE} ± ${steinM('Einstein ring radius')[1]} mas`} />
        <KV k="Relative parallax π_rel" v={STEIN_PIREL} unit="mas" sig={5} />
        <KV k="θ_E predicted from the published mass" v={einsteinRadiusMas(STEIN.mass[0], STEIN_PIREL)} unit="mas" sig={4} />
      </dl>
      <button className="chip" onClick={() => navigate('/cosmic/compact?sel=stein-2051-b')}>Stein 2051 B among the compact objects →</button>
    </>
  );
}

export default function LensingView() {
  const { tab, lens, bx, by, rs, umin, v } = useParams();
  const [, setLoaded] = useState(false);
  useEffect(() => { loadTenParsec().then(() => setLoaded(true)); }, []);
  const u = Math.hypot(bx, by);
  const pos = u > 0 ? imagePositions(u) : null;
  const mags = u > 0 ? imageMagnifications(u) : null;
  const total = u > 0 ? totalMagnification(u) : null;
  const thE = lens.thetaE;
  const sel = useMemo(() => ({ total, mags, pos }), [total, mags, pos]);
  return (
    <>
      <nav className="view-switch" aria-label="Lensing sections">
        {TABS.map(([t, label]) => <button key={t} className={tab === t ? 'active' : ''} onClick={() => setQuery({ tab: t === 'plane' ? null : t })}>{label}</button>)}
      </nav>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>{TABS.find(([t]) => t === tab)![1]} <ProvenanceBadge cls={tab === 'astrometry' ? 'observed' : 'simulated'} /></h1>
          {tab === 'plane' && <p className="note">A mass bends light passing near it by 4GM/(c²b). Seen from behind a point mass, a background source appears as two images, one outside and one inside the Einstein ring, stretched into arcs. When source, lens and observer line up exactly, the image is a ring of radius θ_E. Drag the source.</p>}
          {tab === 'curve' && <p className="note">Stellar lenses usually make images too close together to resolve, but as lens and source move the total brightness rises and falls: microlensing.</p>}
          {tab === 'astrometry' && <p className="note">Lensing also shifts the apparent position of the background star. For a lens only 5.5 pc away, the Einstein radius is tens of milliarcseconds, so the shift is measurable.</p>}
        </div>
        {tab === 'plane' && <LensPlane bx={bx} by={by} rs={rs} />}
        {tab === 'plane' && <p className="note" style={{ fontSize: 10.5 }}>Inverse ray shooting: each pixel θ is mapped to the source plane with the lens equation β = θ − θ_E²θ/|θ|² and lit if it lands inside the source disc. Units are θ_E, so the picture is the same for every point lens. Source brightness and colour are illustrative. Lens equation, images and magnifications: <SourceLinks ids={['narayan-bartelmann-1996']} />.</p>}
        {tab === 'curve' && <CurveTab umin={umin} lens={lens} v={v} />}
        {tab === 'astrometry' && <AstrometryTab />}
      </div>
      <Panel id="lens-controls" className="left-panel" title="Lens">
        <div role="radiogroup" aria-label="Lens">
          {PRESETS.map((p) => <label key={p.id} className="toggle-row"><span>{p.label} <ProvenanceBadge cls={p.provenance} /></span><input type="radio" name="lens" checked={p.id === lens.id} onChange={() => setQuery({ lens: p.id === 'stein' ? null : p.id })} aria-label={p.label} /></label>)}
        </div>
        <p className="note" style={{ fontSize: 10.5 }}>{lens.note} <SourceLinks ids={lens.sources} /></p>
        {tab === 'plane' && <>
          <label className="slider-row"><span>source radius (θ_E)</span><input type="range" min={0.01} max={0.6} step={0.01} value={rs} onChange={(e) => setQuery({ rs: e.target.value })} aria-label="Source radius in Einstein radii" /><span>{rs.toFixed(2)}</span></label>
          <label className="slider-row"><span>source offset x (θ_E)</span><input type="range" min={-2} max={2} step={0.005} value={bx} onChange={(e) => setQuery({ bx: e.target.value })} aria-label="Source offset x" /><span>{bx.toFixed(3)}</span></label>
          <label className="slider-row"><span>source offset y (θ_E)</span><input type="range" min={-2} max={2} step={0.005} value={by} onChange={(e) => setQuery({ by: e.target.value })} aria-label="Source offset y" /><span>{by.toFixed(3)}</span></label>
          <button className="chip" onClick={() => setQuery({ bx: 0, by: 0 })}>Align: Einstein ring</button>
        </>}
        {tab === 'curve' && <>
          <label className="slider-row"><span>u_min (θ_E)</span><input type="range" min={0.01} max={1.5} step={0.01} value={umin} onChange={(e) => setQuery({ umin: e.target.value })} aria-label="Minimum separation in Einstein radii" /><span>{umin.toFixed(2)}</span></label>
          <label className="slider-row"><span>relative speed (km/s)</span><input type="range" min={10} max={1000} step={5} value={v} onChange={(e) => setQuery({ v: e.target.value })} aria-label="Relative transverse speed" /><span>{v}</span></label>
        </>}
        <div className="section-title">Model limits</div>
        <ul className="note" style={{ paddingLeft: 16, fontSize: 10.5 }}>
          <li>Single point mass; thin lens; weak field (impact parameter ≫ r_s)</li>
          <li>Geometric optics: no wave effects; achromatic</li>
          <li>Euclidean distances inside the Galaxy; cosmological lenses need angular-diameter distances</li>
          <li>No binary lenses, caustics, or extended mass distributions</li>
        </ul>
      </Panel>
      <Panel id="lens-info" className="right-panel" title="Lensing quantities">
        <h2 style={{ margin: '0 0 2px', fontWeight: 400 }}>{lens.label}</h2>
        <dl className="kv" aria-label="Lens values">
          <KV k="Lens mass" v={lens.mass} unit="M☉" sig={4} />
          <KV k="Einstein radius θ_E" v={fmtAngle(thE)} />
          {lens.Dd && <KV k="… at the lens distance" v={`${(thE * lens.Dd / CONSTANTS.au.value).toPrecision(3)} au`} />}
        </dl>
        {tab === 'plane' && <>
          <div className="section-title">Source at u = {u.toFixed(3)} θ_E <ProvenanceBadge cls="simulated" /></div>
          {u === 0 ? <p className="note">Perfect alignment: the point source is imaged as the Einstein ring, with formally infinite magnification. A real source has finite size, so the magnification stays finite.</p> :
            <dl className="kv" aria-label="Images">
              <KV k="Outer image θ+" v={`${sel.pos![0].toFixed(4)} θ_E = ${fmtAngle(sel.pos![0] * thE)}`} />
              <KV k="Inner image θ− (mirror-reversed)" v={`${sel.pos![1].toFixed(4)} θ_E = ${fmtAngle(Math.abs(sel.pos![1]) * thE)}`} />
              <KV k="Magnifications µ+ / µ−" v={`${sel.mags![0].toFixed(4)} / ${sel.mags![1].toFixed(4)}`} />
              <KV k="Total magnification" v={sel.total!} sig={5} />
              <KV k="Brightening" v={deltaMag(sel.total!)} unit="mag" sig={3} />
              <KV k="Image separation" v={fmtAngle((sel.pos![0] - sel.pos![1]) * thE)} />
              <KV k="Light-centroid shift" v={fmtAngle(centroidShift(u, thE))} />
            </dl>}
          <p className="note" style={{ fontSize: 10.5 }}>Point-source values (N&amp;B eqs. 24, 27, 28); the picture uses the extended source.</p>
        </>}
        <RelatedLinks id="context:gravitational-lensing" />
      </Panel>
    </>
  );
}
