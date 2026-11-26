/**
 * Spectral Mode — electromagnetic atlas, #/spectral?lambda=<m>&tab=spectrum|wave|blackbody|lines  (Gate 4.6)
 *
 * The URL holds the state: `lambda` is the vacuum wavelength in metres (the single source of truth);
 * frequency and photon energy are derived from it with exact SI constants. Band names come from the
 * transcribed conventions in datasets/spectral/em-bands.json, each shown under its own name — no
 * convention is presented as "the" definition. Colours drawn for visible wavelengths are
 * ILLUSTRATIVE: a perceived colour is not a single wavelength.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { Viewport } from '@/rendering/Viewport';
import { navigate, setQuery, useRoute } from '@/shared/router';
import { KV, Panel, ProvenanceBadge } from '@/ui/components';
import { LinePlot } from '@/ui/plots';
import { SourceLinks } from '@/ui/SourcesView';
import { formatSig } from '@/core/units/units';
import { CONSTANTS } from '@/core/constants/constants';
import { POLARISATIONS, SIGMA_SB, classify, inMedium, intensity, peakFrequency, peakWavelength, photon, planckLambda, planeB, planeE, type Polarisation, type QuantityKind } from '@/core/physics/em/em';
import { CONVENTIONS, EXAMPLES, bandsAt, bandWavelengthsM, exampleWavelengthsM, type Band, type Convention } from './bands';
import { MATERIALS, refractiveIndex } from '@/modes/atomic/materials/materials';
import { wavelengthToColor } from '@/modes/atomic/atoms/spectrum';
import { isForbidden, loadNistSpectra, type NistSpectra } from '@/modes/atomic/atoms/nistSpectra';
import { elementBySymbol } from '@/modes/atomic/atoms/elements';

const C = CONSTANTS.c.value;
type Tab = 'spectrum' | 'wave' | 'blackbody' | 'lines';
const TABS: { id: Tab; label: string }[] = [
  { id: 'spectrum', label: 'Spectrum & bands' }, { id: 'wave', label: 'Plane wave (E, B, k)' }, { id: 'blackbody', label: 'Blackbody' }, { id: 'lines', label: 'Atomic lines' },
];
type PolId = keyof typeof POLARISATIONS;
const POL_LABEL: Record<PolId, string> = { 'linear-x': 'linear (x)', 'linear-45': 'linear (45°)', 'circular-right': 'circular, right', 'circular-left': 'circular, left', 'elliptical': 'elliptical' };

const UNITS: Record<QuantityKind, { u: string; s: number }[]> = {
  frequency: [{ u: 'Hz', s: 1 }, { u: 'kHz', s: 1e3 }, { u: 'MHz', s: 1e6 }, { u: 'GHz', s: 1e9 }, { u: 'THz', s: 1e12 }, { u: 'PHz', s: 1e15 }, { u: 'EHz', s: 1e18 }],
  wavelength: [{ u: 'fm', s: 1e-15 }, { u: 'pm', s: 1e-12 }, { u: 'nm', s: 1e-9 }, { u: 'µm', s: 1e-6 }, { u: 'mm', s: 1e-3 }, { u: 'm', s: 1 }, { u: 'km', s: 1e3 }],
  energy: [{ u: 'µeV', s: 1e-6 }, { u: 'meV', s: 1e-3 }, { u: 'eV', s: 1 }, { u: 'keV', s: 1e3 }, { u: 'MeV', s: 1e6 }],
};
/** Pick the unit that shows the value between 1 and 1000. */
function autoUnit(kind: QuantityKind, v: number) {
  const us = UNITS[kind];
  let best = us[0];
  for (const u of us) if (v / u.s >= 1) best = u;
  return best;
}
export function fmtQ(kind: QuantityKind, v: number, sig = 5) { const u = autoUnit(kind, v); return `${formatSig(v / u.s, sig)} ${u.u}`; }

// log axis of the atlas: vacuum wavelength 1 fm … 100 km
const LMIN = -15, LMAX = 5, W = 640;
const xOf = (lambda: number) => ((Math.log10(lambda) - LMIN) / (LMAX - LMIN)) * W;
const lambdaOf = (x: number) => 10 ** (LMIN + (x / W) * (LMAX - LMIN));

function useNist() {
  const [d, setD] = useState<NistSpectra | null>(null);
  useEffect(() => { let alive = true; loadNistSpectra().then((x) => alive && setD(x)); return () => { alive = false; }; }, []);
  return d;
}

export default function SpectralAtlas() {
  const { query } = useRoute();
  const lambda = (() => { const v = Number(query.get('lambda')); return query.get('lambda') && v > 0 && Number.isFinite(v) ? v : 550e-9; })();
  const tab = (TABS.some((t) => t.id === query.get('tab')) ? query.get('tab') : 'spectrum') as Tab;
  const pol = (query.get('pol') && query.get('pol')! in POLARISATIONS ? query.get('pol') : 'linear-x') as PolId;
  const T = (() => { const v = Number(query.get('T')); return v > 0 && Number.isFinite(v) ? v : 5772; })();
  const ph = useMemo(() => photon('wavelength', lambda), [lambda]);
  const setLambda = (l: number) => setQuery({ lambda: Number(l.toPrecision(9)) });
  const [mat, setMat] = useState('fused-silica');
  const [E0, setE0] = useState(100);

  return (
    <>
      <Panel id="spectral-input" className="left-panel" title="Electromagnetic atlas">
        <QuantityInput ph={ph} onChange={setLambda} />
        <div className="slider-row"><span style={{ minWidth: 60 }}>log₁₀ λ</span>
          <input type="range" min={LMIN} max={LMAX} step={0.01} value={Math.log10(lambda)} onChange={(e) => setLambda(10 ** Number(e.target.value))} aria-label="Vacuum wavelength (log scale)" />
          <span style={{ fontFamily: 'var(--mono)', fontSize: 11 }}>{Math.log10(lambda).toFixed(2)}</span></div>
        <div className="section-title">Representative examples</div>
        <div className="mol-list" role="listbox" aria-label="Spectral examples">
          {EXAMPLES.map((ex) => {
            const [a, b] = exampleWavelengthsM(ex);
            const mid = Math.sqrt(a * b);
            return <button key={ex.id} role="option" aria-selected={Math.abs(Math.log10(mid / lambda)) < 1e-6} title={ex.detail} onClick={() => setLambda(mid)}>
              <span>{ex.label}</span><span className="f">{a === b ? fmtQ('wavelength', a, 4) : `${fmtQ('wavelength', a, 3)} – ${fmtQ('wavelength', b, 3)}`}</span></button>;
          })}
        </div>
        <p className="note" style={{ fontSize: 10.5 }}>Each example cites its source (hover for details). Lyman-α, the 511 keV line and the blackbody peaks are computed here from CODATA constants, never typed in.</p>
      </Panel>

      <div className="center-stage">
        <div className="stage-head"><h1>Electromagnetic spectrum</h1><p className="note">One vacuum wavelength, every convention. λ = c/f and E = hf = hc/λ with exact SI constants.</p></div>
        <nav className="chip-row" aria-label="Atlas views" style={{ marginBottom: 8 }}>
          {TABS.map((t) => <button key={t.id} className={`chip ${tab === t.id ? 'active' : ''}`} onClick={() => setQuery({ tab: t.id === 'spectrum' ? null : t.id })}>{t.label}</button>)}
        </nav>
        {tab === 'spectrum' && <SpectrumTab lambda={lambda} onPick={setLambda} />}
        {tab === 'wave' && <WaveTab ph={ph} pol={pol} E0={E0} setE0={setE0} />}
        {tab === 'blackbody' && <BlackbodyTab T={T} lambda={lambda} onPick={setLambda} />}
        {tab === 'lines' && <LinesTab lambda={lambda} onPick={setLambda} spec={query.get('spec') ?? 'H I'} />}
      </div>

      <Panel id="spectral-readout" className="right-panel" title="Quantities & band names">
        <div className="section-title">Photon <ProvenanceBadge cls="derived" title="Computed from the vacuum wavelength with exact SI constants (CODATA)" /></div>
        <dl className="kv" aria-label="Photon quantities">
          <KV k="vacuum wavelength λ" v={fmtQ('wavelength', ph.lambda, 6)} />
          <KV k="frequency f = c/λ" v={fmtQ('frequency', ph.f, 6)} />
          <KV k="photon energy E = hf" v={fmtQ('energy', ph.energyEV, 6)} />
          <KV k="photon energy" v={ph.energyJ} unit="J" sig={5} />
          <KV k="wavenumber 1/λ" v={ph.wavenumberPerCm} unit="cm⁻¹" sig={5} />
          <KV k="angular frequency ω" v={ph.omega} unit="rad/s" sig={5} />
          <KV k="period 1/f" v={1 / ph.f} unit="s" sig={5} />
        </dl>
        <p className="note" style={{ fontSize: 10.5 }}><SourceLinks ids={['codata-2018']} /></p>

        <div className="section-title">Band name by convention</div>
        <div aria-label="Band names by convention">
          {CONVENTIONS.map((cv) => <ConventionRow key={cv.id} cv={cv} lambda={lambda} />)}
        </div>
        {lambda >= 360e-9 && lambda <= 830e-9 && (
          <div className="note" style={{ display: 'flex', gap: 8, alignItems: 'center', margin: '8px 0' }}>
            <span style={{ width: 28, height: 18, borderRadius: 4, background: wavelengthToColor(lambda * 1e9), border: '1px solid var(--line)' }} />
            <span>Display colour <ProvenanceBadge cls="illustrative" title="Approximate sRGB rendering of a single wavelength" /> — a monitor can only approximate a pure spectral colour, and most colours we see are mixtures of many wavelengths.</span>
          </div>
        )}

        <div className="section-title">In a material <ProvenanceBadge cls="derived" title="n(λ) from the cited dispersion formula; f is unchanged in the medium" /></div>
        <select className="text-input" aria-label="Optical material" value={mat} onChange={(e) => setMat(e.target.value)}>
          {MATERIALS.filter((m) => m.refractiveIndex).map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
        <MediumReadout matId={mat} ph={ph} />
      </Panel>
    </>
  );
}

function QuantityInput({ ph, onChange }: { ph: ReturnType<typeof photon>; onChange: (lambda: number) => void }) {
  const [kind, setKind] = useState<QuantityKind>('wavelength');
  const current = kind === 'frequency' ? ph.f : kind === 'wavelength' ? ph.lambda : ph.energyEV;
  const [unit, setUnit] = useState(() => autoUnit(kind, current).u);
  const scale = UNITS[kind].find((u) => u.u === unit)?.s ?? 1;
  const [txt, setTxt] = useState('');
  useEffect(() => { setTxt(String(Number((current / scale).toPrecision(7)))); }, [current, scale]);
  const commit = () => {
    const v = Number(txt) * scale;
    if (!(v > 0) || !Number.isFinite(v)) return;
    onChange(photon(kind, v).lambda);
  };
  return (
    <div>
      <div className="chip-row" role="radiogroup" aria-label="Input quantity" style={{ marginBottom: 6 }}>
        {(['wavelength', 'frequency', 'energy'] as const).map((k) => <button key={k} role="radio" aria-checked={kind === k} className={`chip ${kind === k ? 'active' : ''}`} onClick={() => { setKind(k); setUnit(autoUnit(k, k === 'frequency' ? ph.f : k === 'wavelength' ? ph.lambda : ph.energyEV).u); }}>{k}</button>)}
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        <input className="text-input" aria-label={`Enter ${kind}`} value={txt} onChange={(e) => setTxt(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && commit()} onBlur={commit} style={{ flex: 1 }} />
        <select className="text-input" aria-label={`${kind} unit`} value={unit} onChange={(e) => setUnit(e.target.value)} style={{ width: 76 }}>
          {UNITS[kind].map((u) => <option key={u.u}>{u.u}</option>)}
        </select>
      </div>
      <p className="note" style={{ fontSize: 10.5 }}>Wavelengths are vacuum wavelengths. In air or glass the frequency stays the same and the wavelength shrinks by n.</p>
    </div>
  );
}

function ConventionRow({ cv, lambda }: { cv: Convention; lambda: number }) {
  const hits = bandsAt(cv, lambda);
  const edge = cv.edges === '(]' ? 'lower limit exclusive, upper inclusive (frequency)' : cv.edges === '[)' ? 'lower limit inclusive, upper exclusive (wavelength)' : 'the source does not say which edge is inclusive';
  return (
    <div className="convention-row" style={{ borderTop: '1px solid var(--line)', padding: '5px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 6 }}><strong style={{ fontSize: 12 }}>{cv.short}</strong>{cv.sources.length > 0 && <SourceLinks ids={cv.sources} />}</div>
      {cv.status === 'not-available'
        ? <p className="note" style={{ margin: '2px 0', fontSize: 11 }}>Not available. {cv.notes[0]}</p>
        : hits.length === 0
          ? <p className="note" style={{ margin: '2px 0', fontSize: 11 }}>No band at this wavelength (outside {cv.scope.toLowerCase()}).</p>
          : <p style={{ margin: '2px 0', fontSize: 12 }}>{hits.map((h) => `${h.band.symbol ?? h.band.name}${h.band.symbol && h.band.name !== h.band.symbol && !h.band.name.startsWith(h.band.symbol) ? ` (${h.band.name})` : ''}${h.band.number !== undefined && h.band.symbol ? ` · band ${h.band.number}` : ''}`).join(' › ')}
            {hits.some((h) => h.onEdge) && <span className="note warn" style={{ display: 'block', fontSize: 10.5 }}>Exactly on a band edge. The source does not say which band owns it, so both are listed.</span>}</p>}
      {cv.status !== 'not-available' && <p className="note" style={{ margin: 0, fontSize: 10 }} title={cv.notes.join(' ')}>Edges: {edge}.</p>}
    </div>
  );
}

function MediumReadout({ matId, ph }: { matId: string; ph: ReturnType<typeof photon> }) {
  const m = MATERIALS.find((x) => x.id === matId);
  const ri = m?.refractiveIndex;
  if (!m || !ri) return null;
  const n = refractiveIndex(ri, ph.lambda * 1e6);
  const med = n ? inMedium(ph.f, n) : null;
  return (
    <>
      <dl className="kv" aria-label="Propagation in the material">
        <KV k={`n(λ) of ${m.name}`} v={n} sig={6} title={ri.label} />
        <KV k="wavelength in the material λ₀/n" v={med ? fmtQ('wavelength', med.lambda, 5) : null} />
        <KV k="phase speed c/n" v={med?.vPhase ?? null} unit="m/s" sig={6} />
        <KV k="frequency (unchanged)" v={fmtQ('frequency', ph.f, 6)} />
      </dl>
      {n === null && <p className="note warn" style={{ fontSize: 10.5 }}>Unknown: the cited dispersion formula is valid only from {ri.rangeUm?.[0]} to {ri.rangeUm?.[1]} µm and is not extrapolated.</p>}
      <p className="note" style={{ fontSize: 10.5 }}>{ri.references.slice(0, 140)}{ri.references.length > 140 ? '…' : ''} <SourceLinks ids={ri.sources} /> · <button className="link-btn" onClick={() => navigate(`/atomic/materials/${m.id}`)}>material card</button></p>
    </>
  );
}

// ---------------------------------------------------------------- spectrum & bands
function lanes(bands: Band[]): { band: Band; lane: number }[] {
  const out: { band: Band; lane: number }[] = [];
  const ends: number[] = [];
  for (const b of [...bands].sort((a, z) => a.lo - z.lo)) {
    let lane = ends.findIndex((e) => e <= b.lo * (1 + 1e-12));
    if (lane < 0) { lane = ends.length; ends.push(0); }
    ends[lane] = b.hi;
    out.push({ band: b, lane });
  }
  return out;
}
const BAND_COLORS = ['#7df9ff', '#f5c76b', '#b48cff', '#7dffa8', '#ff9a7a'];

function SpectrumTab({ lambda, onPick }: { lambda: number; onPick: (l: number) => void }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const convs = CONVENTIONS.filter((c) => c.bands);
  // rows: one group per convention, one sub-row per (level, lane)
  const rows: { cv: Convention; items: { band: Band; lane: number }[]; level: number; lanesN: number }[] = [];
  for (const cv of convs) {
    const levels = [...new Set(cv.bands!.map((b) => b.level))].sort();
    for (const lv of levels) { const items = lanes(cv.bands!.filter((b) => b.level === lv)); rows.push({ cv, items, level: lv, lanesN: Math.max(...items.map((i) => i.lane)) + 1 }); }
  }
  const rowH = (lv: number) => (lv === 0 ? 20 : 13);
  let y = 46;
  const placed = rows.map((r, i) => { const top = y; y += r.lanesN * rowH(r.level) + 4; if (rows[i + 1]?.cv !== r.cv) y += 12; return { ...r, top }; });
  const H = y + 30;
  const pick = (e: React.MouseEvent) => {
    const svg = svgRef.current; if (!svg) return;
    const r = svg.getBoundingClientRect();
    onPick(lambdaOf(((e.clientX - r.left) / r.width) * W));
  };
  const decades = Array.from({ length: LMAX - LMIN + 1 }, (_, i) => LMIN + i);
  const lamLabel = (d: number) => ({ [-12]: '1 pm', [-9]: '1 nm', [-6]: '1 µm', [-3]: '1 mm', 0: '1 m', 3: '1 km' } as Record<number, string>)[d] ?? '';
  const fLabel = (d: number) => { const f = C / 10 ** d; const u = autoUnit('frequency', f); return `${formatSig(f / u.s, 2)} ${u.u}`; };
  const eLabel = (d: number) => fmtQ('energy', photon('wavelength', 10 ** d).energyEV, 2);
  const mx = xOf(lambda);
  return (
    <div>
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="atlas-svg" role="img" aria-label="Electromagnetic spectrum with band conventions" onClick={pick} style={{ width: '100%', cursor: 'crosshair', userSelect: 'none' }}>
        <rect x={0} y={0} width={W} height={H} fill="rgba(255,255,255,0.02)" />
        {decades.map((d) => <g key={d}>
          <line x1={xOf(10 ** d)} x2={xOf(10 ** d)} y1={30} y2={H - 26} stroke="var(--line)" />
          {lamLabel(d) && <text x={xOf(10 ** d)} y={12} fontSize="10" textAnchor="middle" fill="var(--text-dim)">{lamLabel(d)}</text>}
          {d % 3 === 1 && xOf(10 ** d) > 30 && xOf(10 ** d) < W - 30 && <text x={xOf(10 ** d)} y={26} fontSize="9" textAnchor="middle" fill="var(--text-faint)">{fLabel(d)}</text>}
          {d % 3 === 2 && xOf(10 ** d) > 30 && xOf(10 ** d) < W - 30 && <text x={xOf(10 ** d)} y={H - 12} fontSize="9" textAnchor="middle" fill="var(--text-faint)">{eLabel(d)}</text>}
        </g>)}
        <text x={4} y={12} fontSize="9" fill="var(--text-faint)">λ (vacuum)</text>
        <text x={4} y={26} fontSize="9" fill="var(--text-faint)">f</text>
        <text x={4} y={H - 12} fontSize="9" fill="var(--text-faint)">E</text>
        <defs><linearGradient id="atlas-vis">{[380, 420, 460, 500, 540, 580, 620, 660, 700, 750].map((nm) => <stop key={nm} offset={`${((nm - 380) / 370) * 100}%`} stopColor={wavelengthToColor(nm)} />)}</linearGradient></defs>
        <rect x={xOf(380e-9)} y={32} width={xOf(750e-9) - xOf(380e-9)} height={8} fill="url(#atlas-vis)" />
        {placed.map((r, ri) => {
          const ci = convs.indexOf(r.cv);
          return <g key={`${r.cv.id}-${r.level}`}>
            {(ri === 0 || placed[ri - 1].cv !== r.cv) && <text x={W - 4} y={r.top - 3} fontSize="9.5" textAnchor="end" fill="var(--text-dim)">{r.cv.short}</text>}
            {r.items.map(({ band, lane }) => {
              const [a, b] = bandWavelengthsM(r.cv, band);
              const x0 = Math.max(0, xOf(a)), x1 = Math.min(W, xOf(b));
              if (x1 <= 0 || x0 >= W) return null;
              const yy = r.top + lane * rowH(r.level), h = rowH(r.level) - 2;
              const label = band.symbol ?? band.name;
              const hit = lambda >= a && lambda <= b;
              return <g key={band.id}><title>{`${r.cv.short}: ${band.symbol ? `${band.symbol} – ` : ''}${band.name}${band.note ? ` (${band.note})` : ''}`}</title>
                <rect x={x0} y={yy} width={Math.max(0.5, x1 - x0)} height={h} rx={2} fill={BAND_COLORS[ci % BAND_COLORS.length]} opacity={hit ? 0.55 : 0.16 + 0.06 * (lane % 2)} stroke={BAND_COLORS[ci % BAND_COLORS.length]} strokeOpacity={0.5} strokeWidth={0.6} />
                {x1 - x0 > label.length * (r.level === 0 ? 5.4 : 4.6) + 4 && <text x={(x0 + x1) / 2} y={yy + h / 2 + 3.2} fontSize={r.level === 0 ? 9.5 : 8} textAnchor="middle" fill="var(--text)">{label}</text>}
              </g>;
            })}
          </g>;
        })}
        {EXAMPLES.map((ex) => { const [a, b] = exampleWavelengthsM(ex); const x = xOf(Math.sqrt(a * b)); return <g key={ex.id}><title>{ex.label}</title><path d={`M${x - 3.5},${H - 26} L${x + 3.5},${H - 26} L${x},${H - 32} Z`} fill="var(--warn)" /></g>; })}
        <line x1={mx} x2={mx} y1={30} y2={H - 24} stroke="#fff" strokeWidth={1.4} />
        <circle cx={mx} cy={30} r={3} fill="#fff" />
      </svg>
      <p className="note" style={{ fontSize: 10.5 }}>Click anywhere to choose a wavelength. Each row is one convention under its own name: ITU-R V.431 (radio, frequency-defined), CIE S 017 (UV and IR), ISO 21348 (overlapping sub-categories stacked) and the detector IR scheme. ISO 20473 is not drawn because its text could not be consulted. Triangles mark the examples.</p>
      <VisibleStrip lambda={lambda} onPick={onPick} />
    </div>
  );
}

function VisibleStrip({ lambda, onPick }: { lambda: number; onPick: (l: number) => void }) {
  const lo = 350, hi = 850, w = 640, x = (nm: number) => ((nm - lo) / (hi - lo)) * w;
  const iso = CONVENTIONS.find((c) => c.id === 'iso-21348')!.bands!.filter((b) => b.level === 2);
  const nm = lambda * 1e9;
  const ref = useRef<SVGSVGElement>(null);
  return (
    <div style={{ marginTop: 10 }}>
      <div className="section-title">Visible range — colour comparison <ProvenanceBadge cls="illustrative" title="sRGB approximation of spectral colours" /></div>
      <svg ref={ref} viewBox={`0 0 ${w} 92`} style={{ width: '100%', cursor: 'crosshair' }} role="img" aria-label="Visible spectrum colour comparison" onClick={(e) => { const r = ref.current!.getBoundingClientRect(); onPick((lo + ((e.clientX - r.left) / r.width) * (hi - lo)) * 1e-9); }}>
        <defs><linearGradient id="vis-strip">{Array.from({ length: 26 }, (_, i) => lo + (i * (hi - lo)) / 25).map((n) => <stop key={n} offset={`${((n - lo) / (hi - lo)) * 100}%`} stopColor={n < 380 || n > 780 ? '#000' : wavelengthToColor(n)} />)}</linearGradient></defs>
        <rect x={0} y={20} width={w} height={26} fill="url(#vis-strip)" />
        {iso.map((b) => <g key={b.id}><line x1={x(b.lo)} x2={x(b.lo)} y1={14} y2={20} stroke="var(--text-dim)" /><text x={(x(b.lo) + x(b.hi)) / 2} y={13} fontSize="10" textAnchor="middle" fill="var(--text-dim)">{b.name}</text></g>)}
        <rect x={x(360)} y={50} width={x(400) - x(360)} height={6} fill="var(--warn)" opacity={0.6} /><rect x={x(760)} y={50} width={x(830) - x(760)} height={6} fill="var(--warn)" opacity={0.6} />
        <text x={x(400) + 4} y={56} fontSize="9" fill="var(--warn)">CIE: lower limit 360–400 nm</text>
        <text x={x(760) - 4} y={56} fontSize="9" fill="var(--warn)" textAnchor="end">upper limit 760–830 nm</text>
        {[400, 500, 600, 700, 800].map((n) => <text key={n} x={x(n)} y={74} fontSize="10" textAnchor="middle" fill="var(--text-faint)">{n} nm</text>)}
        {nm >= lo && nm <= hi && <line x1={x(nm)} x2={x(nm)} y1={16} y2={50} stroke="#fff" strokeWidth={2} />}
      </svg>
      <p className="note" style={{ fontSize: 10.5 }}>Colour names and ranges above the strip are ISO 21348’s. The CIE says visible radiation has <em>no precise limits</em> (orange bars). The strip’s colours are an sRGB approximation. Perceived colour depends on the whole spectrum and the observer, so a colour is generally not one wavelength: yellow light can be 580 nm, or red plus green.</p>
    </div>
  );
}

// ---------------------------------------------------------------- plane wave
const NS = 48;
function PlaneWaveScene({ ph, p, reduced }: { ph: ReturnType<typeof photon>; p: Polarisation; reduced: boolean }) {
  const eGeo = useMemo(() => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(NS * 6), 3)); return g; }, []);
  const bGeo = useMemo(() => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(NS * 6), 3)); return g; }, []);
  const eTip = useMemo(() => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(NS * 3), 3)); return g; }, []);
  const tipLine = useMemo(() => new THREE.Line(eTip, new THREE.LineBasicMaterial({ color: '#ffb3b3' })), [eTip]);
  useEffect(() => () => { eGeo.dispose(); bGeo.dispose(); eTip.dispose(); (tipLine.material as THREE.Material).dispose(); }, [eGeo, bGeo, eTip, tipLine]);
  const phase = useRef(0);
  const L = 8, A = 1.2; // scene: 2 wavelengths over 8 units along +x (physics +z)
  useFrame((_, dt) => {
    if (!reduced) phase.current += Math.min(dt, 0.1) * Math.PI;           // playback: one optical period per 2 s of wall time
    const t = phase.current / ph.omega;                                    // simulated time (s)
    const pe = eGeo.getAttribute('position') as THREE.BufferAttribute, pb = bGeo.getAttribute('position') as THREE.BufferAttribute, pt = eTip.getAttribute('position') as THREE.BufferAttribute;
    for (let i = 0; i < NS; i++) {
      const s = i / (NS - 1), X = -L / 2 + s * L, z = s * 2 * ph.lambda;
      const E = planeE(p, 1, ph.f, z, t), B = planeB(E);
      // physics (x, y, z) → scene (y, z, x); B drawn ×c so it has the same length scale as E
      pe.setXYZ(2 * i, X, 0, 0); pe.setXYZ(2 * i + 1, X, A * E[0], A * E[1]);
      pb.setXYZ(2 * i, X, 0, 0); pb.setXYZ(2 * i + 1, X, A * B[0] * C, A * B[1] * C);
      pt.setXYZ(i, X, A * E[0], A * E[1]);
    }
    pe.needsUpdate = true; pb.needsUpdate = true; pt.needsUpdate = true;
  });
  return (
    <>
      <lineSegments geometry={eGeo}><lineBasicMaterial color="#ff6b6b" /></lineSegments>
      <lineSegments geometry={bGeo}><lineBasicMaterial color="#5fb8ff" /></lineSegments>
      <primitive object={tipLine} />
      <arrowHelper args={[new THREE.Vector3(1, 0, 0), new THREE.Vector3(-L / 2, 0, 0), L + 0.8, 0xf5c76b, 0.35, 0.18]} />
      <arrowHelper args={[new THREE.Vector3(0, 1, 0), new THREE.Vector3(-L / 2 - 0.6, 0, 0), 1.5, 0xff6b6b, 0.2, 0.1]} />
      <arrowHelper args={[new THREE.Vector3(0, 0, 1), new THREE.Vector3(-L / 2 - 0.6, 0, 0), 1.5, 0x5fb8ff, 0.2, 0.1]} />
      <OrbitControls enablePan={false} />
    </>
  );
}

function WaveTab({ ph, pol, E0, setE0 }: { ph: ReturnType<typeof photon>; pol: PolId; E0: number; setE0: (v: number) => void }) {
  const p = POLARISATIONS[pol];
  const cls = classify(p);
  const reduced = typeof document !== 'undefined' && document.querySelector('.app.reduced-motion') !== null;
  const I = intensity(p, E0);
  return (
    <div>
      <div className="chip-row" role="radiogroup" aria-label="Polarisation" style={{ marginBottom: 6 }}>
        {(Object.keys(POLARISATIONS) as PolId[]).map((k) => <button key={k} role="radio" aria-checked={pol === k} className={`chip ${pol === k ? 'active' : ''}`} onClick={() => setQuery({ pol: k === 'linear-x' ? null : k })}>{POL_LABEL[k]}</button>)}
      </div>
      <div style={{ position: 'relative', height: 300, borderRadius: 12, overflow: 'hidden', border: '1px solid var(--line)' }}>
        <Viewport camera={{ position: [3.2, 2.6, 6.2], fov: 50 }}><ambientLight /><PlaneWaveScene ph={ph} p={p} reduced={reduced} /></Viewport>
        <div className="note" style={{ position: 'absolute', left: 10, bottom: 8, fontSize: 11 }}><span style={{ color: '#ff6b6b' }}>■ E</span> · <span style={{ color: '#5fb8ff' }}>■ c·B</span> · <span style={{ color: '#f5c76b' }}>→ k (propagation)</span></div>
      </div>
      <dl className="kv" aria-label="Plane wave quantities" style={{ marginTop: 8 }}>
        <KV k="polarisation" v={`${cls.kind}${cls.handedness ? `, ${cls.handedness}-handed` : ''}`} title="Handedness per CIE S 017 17-21-018/019: right-handed = clockwise as seen by an observer receiving the radiation" />
        <KV k="shown length (2 wavelengths)" v={fmtQ('wavelength', 2 * ph.lambda, 4)} />
        <KV k="peak field E₀" v={E0} unit="V/m" sig={4} />
        <KV k="peak flux density B₀ = E₀/c" v={E0 / C} unit="T" sig={5} />
        <KV k="time-averaged intensity ½cε₀E₀²" v={I} unit="W/m²" sig={5} />
      </dl>
      <div className="slider-row"><span style={{ minWidth: 90 }}>E₀ (V/m)</span><input type="range" min={-3} max={6} step={0.01} value={Math.log10(E0)} onChange={(e) => setE0(Number((10 ** Number(e.target.value)).toPrecision(3)))} aria-label="Peak electric field (log)" /></div>
      <p className="note" style={{ fontSize: 10.5 }}>Analytic vacuum plane wave travelling along k. At every point and instant E ⊥ B ⊥ k and |B| = |E|/c (B is drawn ×c so both fit on one scale). Playback: one optical period every 2 s, about {formatSig(2 * ph.f, 2)} times slower than reality. Polarisation definitions follow CIE S 017:2020 (17-21-017 to 17-21-020). <SourceLinks ids={['cie-s017-2020', 'codata-2018']} /></p>
      <ProvenanceBadge cls="derived" title="Maxwell plane-wave solution in vacuum; E₀ is a user value" />
    </div>
  );
}

// ---------------------------------------------------------------- blackbody
function BlackbodyTab({ T, lambda, onPick }: { T: number; lambda: number; onPick: (l: number) => void }) {
  const lp = peakWavelength(T), np = peakFrequency(T);
  // plot unit: W sr⁻¹ m⁻² nm⁻¹ with an SI prefix chosen so the peak lies in [1, 1000)
  const peakSI = planckLambda(lp, T) * 1e-9;
  const PREFIX: [number, string][] = [[1e-18, 'a'], [1e-15, 'f'], [1e-12, 'p'], [1e-9, 'n'], [1e-6, 'µ'], [1e-3, 'm'], [1, ''], [1e3, 'k'], [1e6, 'M'], [1e9, 'G'], [1e12, 'T']];
  const [pf, pn] = PREFIX.reduce((best, cur) => (peakSI / cur[0] >= 1 ? cur : best), PREFIX[0]);
  const pts = useMemo(() => Array.from({ length: 240 }, (_, i) => { const l = lp * 10 ** (-0.9 + (i * 2.6) / 239); return [l * 1e6, (planckLambda(l, T) * 1e-9) / pf] as [number, number]; }), [T, lp, pf]);
  const presets = [{ T: 5772, label: 'Sun, IAU nominal T_eff 5772 K', src: 'iau-2015-b3' }, { T: 2.72548, label: 'CMB, 2.72548 K (Fixsen 2009)', src: 'fixsen-2009' }];
  const [txt, setTxt] = useState(String(T));
  useEffect(() => setTxt(String(T)), [T]);
  const yMax = peakSI / pf;
  const inView = lambda >= pts[0][0] * 1e-6 && lambda <= pts[pts.length - 1][0] * 1e-6;
  return (
    <div>
      <div className="chip-row" style={{ marginBottom: 6 }}>
        {presets.map((p) => <button key={p.T} className={`chip ${T === p.T ? 'active' : ''}`} onClick={() => setQuery({ tab: 'blackbody', T: p.T })}>{p.label}</button>)}
        <label className="note" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>T = <input className="text-input" aria-label="Blackbody temperature in kelvin" value={txt} onChange={(e) => setTxt(e.target.value)} onBlur={() => { const v = Number(txt); if (v > 0 && v < 1e9) setQuery({ T: v }); else setTxt(String(T)); }} style={{ width: 80, height: 26 }} /> K</label>
      </div>
      <LinePlot ariaLabel="Planck spectral radiance versus wavelength" width={720} height={280} xLog
        series={[{ points: pts, color: '#f5c76b' }]} xLabel="vacuum wavelength λ (µm)" yLabel={`spectral radiance B_λ (${pn}W sr⁻¹ m⁻² nm⁻¹)`} yDomain={[0, yMax * 1.08]}
        markers={[{ x: lp * 1e6, y: yMax, label: `peak ${fmtQ('wavelength', lp, 4)}` }]}
        vLines={inView ? [{ x: lambda * 1e6, label: 'selected λ', color: '#ffffff' }] : []} />
      <dl className="kv" aria-label="Blackbody quantities">
        <KV k="temperature T" v={T} unit="K" sig={6} />
        <KV k="peak per wavelength λ_max = b/T" v={fmtQ('wavelength', lp, 5)} />
        <KV k="peak per frequency ν_max" v={fmtQ('frequency', np, 5)} title="Wien frequency law ν_max = 2.821 kT/h. It is NOT c/λ_max, because the two distributions are densities in different variables" />
        <KV k="c/ν_max (≠ λ_max)" v={fmtQ('wavelength', C / np, 5)} />
        <KV k="radiant exitance σT⁴" v={SIGMA_SB * T ** 4} unit="W/m²" sig={5} />
      </dl>
      <div className="chip-row"><button className="chip" onClick={() => onPick(lp)}>Select λ_max</button><button className="chip" onClick={() => onPick(C / np)}>Select c/ν_max</button></div>
      <p className="note" style={{ fontSize: 10.5 }}>Planck’s law for an ideal blackbody, with b and σ derived from h, c and k (they match the CODATA listed values exactly). Real bodies are not perfect blackbodies. The Sun’s spectrum has absorption lines and departs from a single 5772 K curve, so this is a model, not the observed solar spectrum. <SourceLinks ids={['codata-2018', 'iau-2015-b3', 'fixsen-2009']} /></p>
      <ProvenanceBadge cls={T === 5772 || T === 2.72548 ? 'derived' : 'hypothetical'} title={T === 5772 || T === 2.72548 ? 'Planck law at a sourced temperature' : 'Planck law at a user-chosen temperature'} />
    </div>
  );
}

// ---------------------------------------------------------------- NIST lines
function LinesTab({ lambda, onPick, spec }: { lambda: number; onPick: (l: number) => void; spec: string }) {
  const nist = useNist();
  if (!nist) return <p className="note">Loading NIST spectra…</p>;
  const data = nist.spectra[spec];
  const keys = Object.keys(nist.spectra);
  const lo = nist.range_nm.low, hi = nist.range_nm.high, w = 640, x = (nm: number) => ((nm - lo) / (hi - lo)) * w;
  const sym = spec.split(' ')[0];
  const el = elementBySymbol(sym === 'D' ? 'H' : sym);
  const lines = data?.lines ?? [];
  const strongest = [...lines].filter((l) => !isForbidden(l)).sort((a, b) => (b.intensity ?? 0) - (a.intensity ?? 0) || (b.A ?? 0) - (a.A ?? 0)).slice(0, 8).sort((a, b) => a.wl - b.wl);
  const nm = lambda * 1e9;
  return (
    <div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
        <select className="text-input" aria-label="NIST spectrum" value={spec} onChange={(e) => setQuery({ tab: 'lines', spec: e.target.value })} style={{ width: 110 }}>
          {keys.map((k) => <option key={k}>{k}</option>)}
        </select>
        {el && <button className="link-btn" onClick={() => navigate(`/atomic/element/${el.Z}?diagram=spectrum`)}>Open {el.name} in Atomic mode →</button>}
      </div>
      {!data ? <p className="note">No bundled lines for {spec}.</p> : (<>
        <svg viewBox={`0 0 ${w} 96`} style={{ width: '100%' }} role="img" aria-label={`NIST lines of ${spec} on the spectrum`}>
          <defs><linearGradient id="lines-vis">{[lo, 380, 420, 460, 500, 540, 580, 620, 660, 700, 750, hi].map((n) => <stop key={n} offset={`${((n - lo) / (hi - lo)) * 100}%`} stopColor={n < 380 || n > 750 ? '#111' : wavelengthToColor(n)} />)}</linearGradient></defs>
          <rect x={0} y={6} width={w} height={8} fill="url(#lines-vis)" />
          <rect x={0} y={16} width={w} height={50} fill="#020308" />
          {lines.map((l, i) => { const s = l.intensity && l.intensity > 0 ? Math.min(1, Math.log10(l.intensity) / 5) : 0.25; const col = l.wl >= 380 && l.wl <= 750 ? wavelengthToColor(l.wl) : l.wl < 380 ? '#a48cff' : '#ff8a7a';
            return <rect key={i} x={x(l.wl) - 1} y={66 - 6 - 44 * s} width={2} height={6 + 44 * s} fill={col} style={{ cursor: 'pointer' }} onClick={() => onPick(l.wl * 1e-9)}><title>{`${l.wl.toFixed(4)} nm (vacuum)  ${l.lower} → ${l.upper}`}</title></rect>; })}
          {[200, 300, 400, 500, 600, 700, 800, 900, 1000].filter((n) => n >= lo && n <= hi).map((n) => <text key={n} x={Math.min(w - 14, Math.max(14, x(n)))} y={82} fontSize="10" textAnchor="middle" fill="var(--text-faint)">{n}</text>)}
          <text x={w / 2} y={94} fontSize="9.5" textAnchor="middle" fill="var(--text-faint)">vacuum wavelength (nm)</text>
          {nm >= lo && nm <= hi && <line x1={x(nm)} x2={x(nm)} y1={4} y2={68} stroke="#fff" strokeWidth={1.4} strokeDasharray="3 2" />}
        </svg>
        <table className="table-mini">
          <thead><tr><th>λ vac (nm)</th><th>Transition</th><th>CIE</th><th>ISO 21348</th><th /></tr></thead>
          <tbody>{strongest.map((l, i) => {
            const cie = bandsAt(CONVENTIONS.find((c) => c.id === 'cie-s017')!, l.wl * 1e-9).map((h) => h.band.symbol).join(', ') || '—';
            const iso = bandsAt(CONVENTIONS.find((c) => c.id === 'iso-21348')!, l.wl * 1e-9).filter((h) => h.band.level > 0).map((h) => h.band.symbol ?? h.band.name).join(', ');
            return <tr key={i}><td>{l.wl.toFixed(3)}{l.ritz ? ' ᴿ' : ''}</td><td style={{ fontSize: 10.5 }}>{l.lower} → {l.upper}</td><td>{cie}</td><td>{iso}</td><td><button className="link-btn" onClick={() => onPick(l.wl * 1e-9)} aria-label={`Select ${l.wl.toFixed(3)} nm`}>select</button></td></tr>;
          })}</tbody>
        </table>
        <p className="note" style={{ fontSize: 10.5 }}>{lines.length} of {data.totalInRange} NIST ASD lines in {lo}–{hi} nm (vacuum wavelengths; ᴿ = Ritz). Bar heights use the source’s relative intensities, which are not comparable between spectra. <SourceLinks ids={['nist-asd']} /></p>
        <ProvenanceBadge cls="observed" title="Measured/evaluated lines from the NIST Atomic Spectra Database" />
      </>)}
    </div>
  );
}
