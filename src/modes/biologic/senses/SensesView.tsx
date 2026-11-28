/**
 * Senses and signals — #/biologic/senses?tab=eye|colour|hearing|ecg   (Phase 13, Gates 13.1–13.3)
 *
 *  eye      NEI's path of light; Gullstrand's reduced eye (n = 4/3, r = 5.7 mm) → retinal image size of an object;
 *           Helmholtz's diffraction blur δ = 2.440 lr/d against pupil diameter; Listing's numbers and their mismatch
 *  colour   cone peaks (Stockman & Sharpe 2000, CVRL) and the photopic and scotopic peaks on the visible spectrum
 *  hearing  NIDCD's path of sound; Fletcher & Munson's intensity level β = 10 log J + 100 (J in µW/cm²); NIDCD's
 *           70 and 85 dBA statements
 *  ecg      Waller (1887), Einthoven's leads (1912): a dipole at angle α projected onto leads I, II, III, with
 *           II − I = III; NHLBI's description of the test
 */
import { navigate, setQuery, useRoute } from '@/shared/router';
import { KV, Panel, ProvenanceBadge } from '@/ui/components';
import { SourceLinks } from '@/ui/SourcesView';
import { RelatedLinks } from '@/ui/RelatedLinks';
import { LinePlot } from '@/ui/plots';
import { formatSig } from '@/core/units/units';
import { GULLSTRAND_REDUCED, einthovenLeads, helmholtzBlurMm, intensityFromLevel, intensityLevel, microWcm2ToWm2, reducedFocal, retinalImageMm } from '@/core/biology/senses';
import data from '@datasets/biology/senses.json';

const D = data as unknown as {
  eye: { nei: { lines: string[] }; helmholtz: { gullstrand: { quote: string }; listing: { focal1: number; focal2: number; radiusPrinted: number; principalMm: number; nodalBeforeLensBackMm: number; quote: string }; pupil: { quote: string }; blur: { quote: string; lMm: number; rMm: number } } };
  colour: { cones: { L: number; M: number; S: number }; photopic: { peak: number }; scotopic: { peak: number; quote: string }; neiCones: { quote: string } };
  hearing: { nidcd: { lines: string[] }; noise: { quote: string; safe: number; risk: number }; fletcher: { eq: string; reference: string } };
  ecg: { nhlbi: { quote: string }; waller: { quote: string }; einthoven: { leads: string; relation: string; relationQuote: string; calibration: string; figure: string; angles: number[] } };
};
const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
const num = (q: URLSearchParams, k: string, d: number, a: number, b: number) => { const v = Number(q.get(k)); return q.has(k) && Number.isFinite(v) ? clamp(v, a, b) : d; };
const H = ['helmholtz-1924'];

function EyeTab() {
  const { query } = useRoute();
  const h = num(query, 'h', 1.7, 0.001, 100), d = num(query, 'd', 10, 0.1, 10000), pupil = num(query, 'p', 4, 1, 9);
  const f = reducedFocal(GULLSTRAND_REDUCED.n, GULLSTRAND_REDUCED.rMm);
  const img = retinalImageMm(h, d);
  const blur = helmholtzBlurMm(D.eye.helmholtz.blur.lMm, D.eye.helmholtz.blur.rMm, pupil);
  const L = D.eye.helmholtz.listing;
  return (
    <>
      <Panel id="eye-controls" className="left-panel" title="Looking at something">
        <label className="slider-row"><span style={{ minWidth: 80 }}>object size</span><input type="range" min={-3} max={2} step={0.01} value={Math.log10(h)} aria-label="Object size (log)" onChange={(e) => setQuery({ h: (10 ** Number(e.target.value)).toPrecision(3) })} /><span>{formatSig(h, 3)} m</span></label>
        <label className="slider-row"><span style={{ minWidth: 80 }}>distance</span><input type="range" min={-1} max={4} step={0.01} value={Math.log10(d)} aria-label="Object distance (log)" onChange={(e) => setQuery({ d: (10 ** Number(e.target.value)).toPrecision(3) })} /><span>{formatSig(d, 3)} m</span></label>
        <label className="slider-row"><span style={{ minWidth: 80 }}>pupil</span><input type="range" min={1} max={9} step={0.1} value={pupil} aria-label="Pupil diameter" onChange={(e) => setQuery({ p: e.target.value })} /><span>{pupil} mm</span></label>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <button className="chip" onClick={() => setQuery({ h: '1.7', d: '10' })}>A person 10 m away</button>
          <button className="chip" onClick={() => setQuery({ p: '2' })}>Helmholtz's smallest pupil (2 mm)</button>
        </div>
        <dl className="kv" aria-label="Eye values">
          <KV k="Image on the retina" v={img * 1000} unit="µm" sig={3} title="(f₂ − r) × angular size" />
          <KV k="Diffraction blur δ" v={blur * 1000} unit="µm" sig={3} title="δ = 2.440 lr/d, l = 0.0005 mm, r = 20 mm" />
          <KV k="Reduced eye power" v={f.powerD} unit="dioptres" sig={3} />
        </dl>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>The eye as an optical instrument <ProvenanceBadge cls="derived" title="Helmholtz (tr. 1924): Gullstrand's reduced eye and the diffraction circle" /></h1>
          <p className="note">{D.eye.nei.lines.map((l) => `“${l}”`).join(' ')} <SourceLinks ids={['nei-how-eyes-work']} /></p>
          <p className="note">“{D.eye.helmholtz.gullstrand.quote}” (p. 355) So the eye behaves like one curved surface: focal lengths {formatSig(f.f1, 3)} and {formatSig(f.f2, 3)} mm, and the image lies {formatSig(f.f2 - GULLSTRAND_REDUCED.rMm, 3)} mm behind the nodal point. “{D.eye.helmholtz.blur.quote}” (p. 196) <SourceLinks ids={H} /></p></div>
        <div style={{ flex: '1 1 340px', maxWidth: 440 }}>
          <LinePlot ariaLabel="Diffraction blur against pupil diameter" width={440} height={230} xLabel="pupil diameter d (mm)" yLabel="blur δ (µm)"
            series={[{ points: Array.from({ length: 80 }, (_, i) => { const p = 1 + i * 0.1; return [p, helmholtzBlurMm(0.0005, 20, p) * 1000] as [number, number]; }), color: '#5cf2a6', label: 'δ = 2.440 lr/d' }]}
            markers={[{ x: pupil, y: blur * 1000, color: '#f5c76b' }]} vLines={[{ x: 4, label: 'mean 4 mm', color: '#9aa6c8' }]} />
        </div>
        <p className="note">“{D.eye.helmholtz.pupil.quote}” (p. 178). Larger pupils shrink the diffraction circle, but this curve leaves out the eye's own aberrations. <button className="link-btn" onClick={() => navigate('/spectral/telescopes')}>The same Airy disc in telescopes →</button></p>
      </div>
      <Panel id="eye-detail" className="right-panel" title="Listing's reduced eye">
        <dl className="kv" aria-label="Listing values">
          <KV k="Focal lengths (printed)" v={`${L.focal1} · ${L.focal2}`} unit="mm" />
          <KV k="f₂ / f₁" v={L.focal2 / L.focal1} sig={6} title="equals the humour index 103/77 = 1.33766" />
          <KV k="f₂ − f₁ (one surface)" v={L.focal2 - L.focal1} unit="mm" sig={5} />
          <KV k="Radius printed" v={String(L.radiusPrinted)} unit="mm" />
        </dl>
        <p className="note">For a single refracting surface the radius should be f₂ − f₁ = 5.0674 mm; Helmholtz prints “{L.quote}” The printed principal and nodal points put them about 5.18 mm apart. All three are shown; the calculations above use Gullstrand's reduced eye instead. <SourceLinks ids={H} /></p>
        <RelatedLinks id="instrument:senses" limit={4} />
      </Panel>
    </>
  );
}

function ColourTab() {
  const c = D.colour;
  const W = 600, x = (nm: number) => ((nm - 380) / (720 - 380)) * W;
  const marks = [{ nm: c.cones.S, l: 'S cones', col: '#7f8cff' }, { nm: c.scotopic.peak, l: 'night vision V′(λ)', col: '#9aa6c8' }, { nm: c.cones.M, l: 'M cones', col: '#5cf2a6' }, { nm: c.photopic.peak, l: 'day vision V(λ)', col: '#f5c76b' }, { nm: c.cones.L, l: 'L cones', col: '#ff7a90' }];
  return (
    <>
      <Panel id="colour-panel" className="left-panel" title="Colour vision">
        <p className="note">“{c.neiCones.quote}” <SourceLinks ids={['nei-rods-news']} /></p>
        <button className="chip" onClick={() => navigate('/spectral')}>The visible band in the spectral atlas →</button>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Where the eye is most sensitive <ProvenanceBadge cls="observed" title="Peak wavelengths of CVRL's tabulated functions" /></h1>
          <p className="note">Peaks of the three cone sensitivities (Stockman & Sharpe 2000, quantal units) and of the CIE luminosity functions for day (1924) and night (1951) vision, located in the tables of the Colour & Vision Research Laboratory. The night-vision function “{c.scotopic.quote}”. Only the peaks are drawn: CVRL gives no licence to republish the curves. <SourceLinks ids={['cvrl', 'stockman-sharpe-2000']} /></p></div>
        <svg viewBox={`0 0 ${W} 200`} role="img" aria-label="Sensitivity peaks on the visible spectrum" style={{ width: '100%', maxWidth: W }}>
          <defs><linearGradient id="vis" x1="0" x2="1"><stop offset="0" stopColor="#5a3cff" /><stop offset="0.25" stopColor="#2f6bff" /><stop offset="0.42" stopColor="#21d0ff" /><stop offset="0.52" stopColor="#3cff7a" /><stop offset="0.62" stopColor="#f5ff3c" /><stop offset="0.75" stopColor="#ff9a2e" /><stop offset="1" stopColor="#ff2e2e" /></linearGradient></defs>
          <rect x={0} y={150} width={W} height={20} fill="url(#vis)" opacity={0.85} />
          {[400, 450, 500, 550, 600, 650, 700].map((n) => <text key={n} x={x(n)} y={190} textAnchor="middle" fontSize={11} fill="var(--text-dim)">{n} nm</text>)}
          {marks.map((m, i) => <g key={m.l}><line x1={x(m.nm)} x2={x(m.nm)} y1={20 + i * 24} y2={150} stroke={m.col} strokeWidth={2} /><text x={x(m.nm) + 5} y={30 + i * 24} fontSize={12} fill={m.col}>{m.l} {m.nm} nm</text></g>)}
          <text x={W} y={145} textAnchor="end" fontSize={10} fill="var(--text-faint)">colour band illustrative</text>
        </svg>
      </div>
      <Panel id="colour-detail" className="right-panel" title="Peaks">
        <dl className="kv" aria-label="Peak wavelengths"><KV k="L cones" v={c.cones.L} unit="nm" /><KV k="M cones" v={c.cones.M} unit="nm" /><KV k="S cones" v={c.cones.S} unit="nm" /><KV k="Day vision V(λ)" v={c.photopic.peak} unit="nm" /><KV k="Night vision V′(λ)" v={c.scotopic.peak} unit="nm" /></dl>
        <p className="note">CVRL's 1-nm night-vision table peaks at 506 nm (its 5-nm table: 505 nm 0.998, 510 nm 0.997).</p>
      </Panel>
    </>
  );
}

function HearingTab() {
  const { query } = useRoute();
  const beta = num(query, 'b', 60, -10, 140), J = intensityFromLevel(beta);
  const n = D.hearing.noise;
  return (
    <>
      <Panel id="hear-controls" className="left-panel" title="Sound level">
        <label className="slider-row"><span style={{ minWidth: 70 }}>level β</span><input type="range" min={-10} max={140} step={1} value={beta} aria-label="Intensity level" onChange={(e) => setQuery({ b: e.target.value })} /><span>{beta} dB</span></label>
        <dl className="kv" aria-label="Sound values">
          <KV k="Intensity J" v={J} unit="µW/cm²" sig={3} />
          <KV k="Intensity" v={microWcm2ToWm2(J)} unit="W/m²" sig={3} />
          <KV k="Back to β = 10 log J + 100" v={intensityLevel(J)} unit="dB" sig={4} />
        </dl>
        <p className="note">Each 10 dB is ten times the intensity. NIDCD's thresholds are in A-weighted decibels (dBA), not the same scale as this intensity level.</p>
        <button className="chip" onClick={() => navigate('/spectral/acoustics')}>Sound waves in the acoustic lab →</button>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Hearing <ProvenanceBadge cls="observed" title="NIDCD (public domain); Fletcher & Munson (1933)" /></h1>
          <p className="note">{D.hearing.nidcd.lines.map((l) => `“${l}”`).join(' ')} <SourceLinks ids={['nidcd-how-we-hear']} /></p>
          <p className="note">Fletcher and Munson (1933): “{D.hearing.fletcher.reference}”. They wrote the intensity level as {D.hearing.fletcher.eq}, with J in microwatts per square centimetre (p. 381). <SourceLinks ids={['fletcher-munson-1933']} /></p></div>
        <blockquote className="quote">“{n.quote}” <SourceLinks ids={['nidcd-noise']} /></blockquote>
      </div>
      <Panel id="hear-detail" className="right-panel" title="Related"><RelatedLinks id="instrument:senses" limit={4} /></Panel>
    </>
  );
}

function EcgTab() {
  const { query } = useRoute();
  const alpha = num(query, 'a', 60, -90, 180), M = 1;
  const L = einthovenLeads(M, alpha);
  const e = D.ecg.einthoven;
  const S = 120, cx = 160, cy = 120, R = [cx - S, cy - S * 0.58], Lp = [cx + S, cy - S * 0.58], F = [cx, cy + S * 1.15];
  const ax = Math.cos((alpha * Math.PI) / 180) * 70, ay = Math.sin((alpha * Math.PI) / 180) * 70;
  return (
    <>
      <Panel id="ecg-controls" className="left-panel" title="Heart vector">
        <label className="slider-row"><span style={{ minWidth: 70 }}>angle α</span><input type="range" min={-90} max={180} step={1} value={alpha} aria-label="Heart vector angle" onChange={(e2) => setQuery({ a: e2.target.value })} /><span>{alpha}°</span></label>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{e.angles.map((a) => <button key={a} className="chip" onClick={() => setQuery({ a: String(a) })}>Einthoven's α = {a}°</button>)}</div>
        <dl className="kv" aria-label="Lead values">
          <KV k="Lead I" v={L.I} sig={3} /><KV k="Lead II" v={L.II} sig={3} /><KV k="Lead III" v={L.III} sig={3} />
          <KV k="II − I" v={L.II - L.I} sig={3} title="equals lead III" />
        </dl>
        <p className="note">Relative units for a dipole of size 1. Einthoven calibrated his records so that “{e.calibration}”.</p>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>The electrocardiogram <ProvenanceBadge cls="illustrative" title="A dipole projected onto Einthoven's three leads: educational, not a model of the heart" /></h1>
          <p className="note">Waller (1887): “{D.ecg.waller.quote}” <SourceLinks ids={['waller-1887']} /> Einthoven (1912) recorded three leads: “{e.leads}” “{e.relationQuote} This may be formulated: {e.relation}.” <SourceLinks ids={['einthoven-1912']} /></p></div>
        <svg viewBox="0 0 320 285" role="img" aria-label="Einthoven triangle" style={{ width: '100%', maxWidth: 360 }}>
          <polygon points={`${R.join(',')} ${Lp.join(',')} ${F.join(',')}`} fill="none" stroke="var(--line-strong)" />
          {[['R', R], ['L', Lp], ['F', F]].map(([n2, p]) => <text key={n2 as string} x={(p as number[])[0] + ((n2 as string) === 'L' ? 6 : (n2 as string) === 'R' ? -16 : -4)} y={(p as number[])[1] + ((n2 as string) === 'F' ? 16 : -4)} fontSize={14} fill="var(--text)">{n2 as string}</text>)}
          <text x={cx - 30} y={R[1] - 6} fontSize={11} fill="var(--text-dim)">I: {formatSig(L.I, 2)}</text>
          <text x={(R[0] + F[0]) / 2 - 58} y={(R[1] + F[1]) / 2} fontSize={11} fill="var(--text-dim)">II: {formatSig(L.II, 2)}</text>
          <text x={(Lp[0] + F[0]) / 2 + 8} y={(Lp[1] + F[1]) / 2} fontSize={11} fill="var(--text-dim)">III: {formatSig(L.III, 2)}</text>
          <circle cx={cx} cy={cy} r={4} fill="#ff5a6e" />
          <line x1={cx - ax} y1={cy - ay} x2={cx + ax} y2={cy + ay} stroke="#5cf2a6" strokeWidth={3} markerEnd="url(#arr)" />
          <defs><marker id="arr" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#5cf2a6" /></marker></defs>
        </svg>
        <p className="note">Einthoven's Fig. 26: “{e.figure}” The arrow is the direction of the potential difference in the heart, at angle α from the line R–L; each lead reads its projection. NHLBI: “{D.ecg.nhlbi.quote}” <SourceLinks ids={['nhlbi']} /></p>
      </div>
      <Panel id="ecg-detail" className="right-panel" title="Related">
        <button className="chip" onClick={() => navigate('/biologic/nerves')}>Where the electrical impulses come from →</button>
        <button className="chip" onClick={() => navigate('/biologic/circulation')}>The heart's cycle →</button>
        <RelatedLinks id="instrument:senses" limit={3} />
      </Panel>
    </>
  );
}

export default function SensesView() {
  const { query } = useRoute();
  const tab = (['colour', 'hearing', 'ecg'] as const).find((t) => t === query.get('tab')) ?? 'eye';
  return (
    <>
      <nav className="view-switch" aria-label="Senses sections">
        {([['eye', 'The eye'], ['colour', 'Colour'], ['hearing', 'Hearing'], ['ecg', 'Heart signals']] as const).map(([t, l]) => <button key={t} className={tab === t ? 'active' : ''} onClick={() => setQuery({ tab: t === 'eye' ? null : t })}>{l}</button>)}
      </nav>
      {tab === 'colour' ? <ColourTab /> : tab === 'hearing' ? <HearingTab /> : tab === 'ecg' ? <EcgTab /> : <EyeTab />}
    </>
  );
}
