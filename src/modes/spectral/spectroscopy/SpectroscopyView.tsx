/**
 * Spectroscopy — #/spectral/spectroscopy?tab=hydrogen|widths|molecules   (Phase 10, Gate 10.4)
 *
 *  hydrogen   one-electron atoms against the bundled NIST lines: atom (h | d | he2), ni (lower level 1–5)
 *  widths     Doppler and Lorentzian line shapes: sp (NIST spectrum), wl (nm, line), T (K)
 *  molecules  diatomic levels and rotation lines from Huber–Herzberg constants: mol, v
 * Physics: src/core/physics/optics/spectroscopy.ts (NIST Atomic Spectroscopy Compendium; Bohr 1913; NIST Diatomic
 * Spectral Database). Data: datasets/atomic/spectra-nist.json, datasets/molecular/diatomic.json, datasets/atomic/nuclides.json.
 */
import { useEffect, useState } from 'react';
import { setQuery, useRoute } from '@/shared/router';
import { KV, Panel, ProvenanceBadge } from '@/ui/components';
import { SourceLinks } from '@/ui/SourcesView';
import { RelatedLinks } from '@/ui/RelatedLinks';
import { LinePlot } from '@/ui/plots';
import { formatSig } from '@/core/units/units';
import { CONSTANTS } from '@/core/constants/constants';
import { wavelengthToColor, SERIES } from '@/modes/atomic/atoms/spectrum';
import { loadNistSpectra, type NistSpectra } from '@/modes/atomic/atoms/nistSpectra';
import { elementBySymbol } from '@/modes/atomic/atoms/elements';
import {
  bohrFrequency, dopplerFwhm, gaussian, hydrogenicWavelength, lorentzian, reducedMass, rotationLine, rotationalConstant, rotationalTerm,
  rydbergM, vibrationalTerm, wavenumberToHz, wavenumberToM, type DiatomicConstants,
} from '@/core/physics/optics/spectroscopy';
import dia from '@datasets/molecular/diatomic.json';
import nuc from '@datasets/atomic/nuclides.json';

type Tab = 'hydrogen' | 'widths' | 'molecules';
const TABS: [Tab, string][] = [['hydrogen', 'Hydrogen-like atoms'], ['widths', 'Line widths'], ['molecules', 'Diatomic molecules']];
const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
const num = (q: URLSearchParams, k: string, d: number, a: number, b: number) => { const v = Number(q.get(k)); return q.has(k) && Number.isFinite(v) ? clamp(v, a, b) : d; };
const COMP = ['nist-atomic-spectroscopy-compendium'], ASD = ['nist-asd'];
const u = CONSTANTS.u.value, me = CONSTANTS.me.value;
const atomMassU = (Z: number, A: number) => (nuc as unknown as Record<string, { natural: { A: number; mass: number }[] }>)[String(Z)]?.natural.find((x) => x.A === A)?.mass ?? null;
const nucleusKg = (Z: number, A: number) => { const m = atomMassU(Z, A); return m === null ? null : m * u - Z * me; };
function useNist() { const [d, setD] = useState<NistSpectra | null>(null); useEffect(() => { loadNistSpectra().then(setD).catch(() => setD(null)); }, []); return d; }
function Slider({ k, label, v, min, max, step, unit, aria }: { k: string; label: string; v: number; min: number; max: number; step: number; unit: string; aria: string }) {
  return <label className="slider-row"><span style={{ minWidth: 78 }}>{label}</span><input type="range" min={min} max={max} step={step} value={v} aria-label={aria} onChange={(e) => setQuery({ [k]: e.target.value })} /><span>{v} {unit}</span></label>;
}

// ------------------------------------------------------------------ hydrogen-like
const ATOMS = { h: { label: 'hydrogen ¹H (H I)', sp: 'H I', Z: 1, A: 1 }, d: { label: 'deuterium ²H (D I)', sp: 'D I', Z: 1, A: 2 }, he2: { label: 'ionised helium ⁴He⁺ (He II)', sp: 'He II', Z: 2, A: 4 } } as const;
function HydrogenTab() {
  const { query } = useRoute();
  const key = (query.get('atom') ?? 'h') as keyof typeof ATOMS, at = ATOMS[key] ?? ATOMS.h;
  const ni = Math.round(num(query, 'ni', 2, 1, 5));
  const M = nucleusKg(at.Z, at.A);
  const nist = useNist();
  const lines = M === null ? [] : Array.from({ length: 8 }, (_, i) => { const nk = ni + 1 + i; return { nk, wl: hydrogenicWavelength(at.Z, M, ni, nk) * 1e9 }; });
  const obs = (wl: number) => {
    const L = (nist?.spectra[at.sp]?.lines ?? []).filter((l) => Math.abs(l.wl - wl) < 0.6 && l.intensity !== null && l.intensity > 0);
    if (!L.length) return null;
    const w = L.reduce((s, l) => s + (l.intensity ?? 0), 0);
    return L.reduce((s, l) => s + l.wl * (l.intensity ?? 0), 0) / w;
  };
  const rows = lines.map((l) => ({ ...l, obs: obs(l.wl) }));
  const range = nist ? [nist.range_nm.low, nist.range_nm.high] : [200, 1000];
  const inRange = rows.filter((r) => r.wl >= range[0] && r.wl <= range[1]).map((r) => r.wl);
  return (
    <>
      <Panel id="sp-h-controls" className="left-panel" title="Atom">
        <select className="text-input" aria-label="Atom or ion" value={key in ATOMS ? key : 'h'} onChange={(e) => setQuery({ atom: e.target.value })} style={{ width: '100%' }}>{Object.entries(ATOMS).map(([k, a]) => <option key={k} value={k}>{a.label}</option>)}</select>
        <Slider k="ni" label="lower level nᵢ" v={ni} min={1} max={5} step={1} unit={SERIES[ni] ? `(${at.Z === 1 ? SERIES[ni] : 'series'})` : ''} aria="Lower level" />
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Hydrogen-like spectra <ProvenanceBadge cls="derived" title="NIST Atomic Spectroscopy Compendium eqs. 1, 2, 10, 30; Bohr 1913 eq. 4" /></h1>
          <p className="note">The levels of a one-electron atom are E_n = −Z²/n² in units of R_M, the Rydberg for the nucleus' mass M: R_M = R∞ M/(M + m_e). A transition from n_k to n_i gives ΔE = R_M hc Z²(1/n_i² − 1/n_k²) = hc/λ_vac (NIST Compendium eqs. 1, 2, 10, 30). Bohr found this law in 1913: with τ₂ = 2 it gives “the ordinary Balmer series”, with τ₂ = 3 the infrared series observed by Paschen. The heavier deuteron makes R_M slightly larger, so deuterium's lines lie a little to the blue (the isotope shift). Computed vacuum wavelengths are compared with the NIST lines bundled for this spectrum (intensity-weighted mean of the lines within 0.6 nm, which blends the fine structure; NIST gives the blended Hα line to two decimals only). <SourceLinks ids={[...COMP, 'bohr-1913', ...ASD, 'codata-2018']} /></p>
        </div>
        <LinePlot ariaLabel="Computed and NIST lines" width={600} height={160} xLabel="vacuum wavelength (nm)" yLabel="" yDomain={[0, 1.2]} xDomain={inRange.length ? [Math.min(...inRange) - 0.04 * (Math.max(...inRange) - Math.min(...inRange) + 10), Math.max(...inRange) + 0.04 * (Math.max(...inRange) - Math.min(...inRange) + 10)] : undefined}
          series={rows.filter((r) => r.wl >= range[0] && r.wl <= range[1]).flatMap((r) => [{ points: [[r.wl, 0], [r.wl, 1]] as [number, number][], color: wavelengthToColor(r.wl) }, ...(r.obs !== null ? [{ points: [[r.obs, 0], [r.obs, 0.7]] as [number, number][], color: '#ffffff', dashed: true }] : [])])} />
        <p className="note" style={{ fontSize: 10.5 }}>Coloured: computed. White dashed: NIST. Only lines inside the bundled {range[0]}–{range[1]} nm range are drawn.</p>
        <table className="table-mini" aria-label="Line comparison" style={{ maxWidth: 600 }}>
          <thead><tr><th>n_k → n_i</th><th>computed λ (nm)</th><th>NIST λ (nm)</th><th>difference (pm)</th></tr></thead>
          <tbody>{rows.map((r) => <tr key={r.nk}><td>{r.nk} → {ni}</td><td>{r.wl.toFixed(4)}</td><td>{r.obs !== null ? r.obs.toFixed(4) : <span className="unknown">{nist ? 'not in the bundled range' : 'loading…'}</span>}</td><td>{r.obs !== null ? ((r.obs - r.wl) * 1000).toFixed(1) : ''}</td></tr>)}</tbody>
        </table>
      </div>
      <Panel id="sp-h-readout" className="right-panel" title="Constants">
        <dl className="kv" aria-label="Hydrogen result">
          <KV k="R∞" v={CONSTANTS.Rinf.value} unit="m⁻¹" sig={12} title="CODATA 2018" />
          <KV k="R_M for this nucleus" v={M !== null ? rydbergM(M) : null} unit="m⁻¹" sig={10} />
          <KV k="Bohr's factor 2π²me⁴/h³ = R∞c" v={bohrFrequency(1, Infinity)} unit="Hz" sig={5} title="Bohr's observed value: 3·290 × 10¹⁵" />
          {key !== 'he2' && M !== null && nucleusKg(1, at.A === 1 ? 2 : 1) !== null && <KV k={`Hα isotope shift (${at.A === 1 ? 'D' : 'H'} − this)`} v={(hydrogenicWavelength(1, nucleusKg(1, at.A === 1 ? 2 : 1)!, 2, 3) - hydrogenicWavelength(1, M, 2, 3)) * 1e12} unit="pm" sig={4} />}
        </dl>
        <p className="note" style={{ fontSize: 10.5 }}>Nuclear masses: NUBASE2020 atomic masses minus the electrons. No fine structure, Lamb shift or hyperfine splitting. <SourceLinks ids={['nubase2020']} /></p>
        <RelatedLinks id="instrument:spectroscopy" />
      </Panel>
    </>
  );
}

// ------------------------------------------------------------------ widths
function WidthsTab() {
  const { query } = useRoute();
  const nist = useNist();
  const sp = query.get('sp') ?? 'H I';
  const T = num(query, 'T', 10000, 10, 100000);
  const sym = sp.split(' ')[0], el = elementBySymbol(sym === 'D' ? 'H' : sym);
  const M = sym === 'D' ? atomMassU(1, 2) : el?.atomicWeight ?? null;
  const strong = (nist?.spectra[sp]?.lines ?? []).filter((l) => l.intensity !== null && l.intensity > 0 && l.wl >= 380 && l.wl <= 750).sort((a, b) => (b.intensity ?? 0) - (a.intensity ?? 0)).slice(0, 12).sort((a, b) => a.wl - b.wl);
  const strongest = strong.reduce<typeof strong[number] | null>((b, l) => (!b || (l.intensity ?? 0) > (b.intensity ?? 0) ? l : b), null);
  const wl = num(query, 'wl', strongest?.wl ?? 656.46, 200, 1000);
  const line = strong.reduce<typeof strong[number] | null>((b, l) => (!b || Math.abs(l.wl - wl) < Math.abs(b.wl - wl) ? l : b), null);
  const lam = line?.wl ?? wl;
  const fw = M !== null ? dopplerFwhm(lam, T, M) : null;           // nm
  const span = fw !== null ? 4 * fw : 0.05;
  const xs = Array.from({ length: 401 }, (_, i) => lam - span + (2 * span * i) / 400);
  return (
    <>
      <Panel id="sp-w-controls" className="left-panel" title="Line">
        <select className="text-input" aria-label="Spectrum" value={sp} onChange={(e) => setQuery({ sp: e.target.value, wl: null })} style={{ width: '100%' }}>{Object.keys(nist?.spectra ?? { 'H I': 0 }).map((s) => <option key={s} value={s}>{s}</option>)}</select>
        <select className="text-input" aria-label="Line" value={line?.wl ?? ''} onChange={(e) => setQuery({ wl: e.target.value })} style={{ width: '100%', marginTop: 6 }}>{strong.map((l) => <option key={l.wl} value={l.wl}>{l.wl.toFixed(3)} nm ({l.lower} – {l.upper})</option>)}</select>
        <Slider k="T" label="temperature" v={T} min={10} max={100000} step={10} unit="K" aria="Temperature" />
        <button className="chip" onClick={() => setQuery({ T: '5772' })}>Sun’s effective temperature (5772 K)</button>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Line widths <ProvenanceBadge cls="derived" title="NIST Atomic Spectroscopy Compendium §20, eq. 40" /></h1>
          <p className="note">“Doppler broadening is due to the thermal motion of the emitting atoms or ions. For a Maxwellian velocity distribution, the line shape is Gaussian”, with full width at half maximum Δλ = 7.16 × 10⁻⁷ λ (T/M)^½, T in kelvins and M the atomic weight (NIST Compendium eq. 40). Pressure-broadened lines are “often approximately Lorentzian”, I ∝ 1/(1 + [(λ − λ₀)/Δλ½]²); for comparison the dashed curve is a Lorentzian with the same full width, whose wings fall off far more slowly. <SourceLinks ids={[...COMP, ...ASD]} /></p>
        </div>
        {fw !== null && <LinePlot ariaLabel="Line profile" width={600} height={240} xLabel="vacuum wavelength (nm)" yLabel="relative intensity" yDomain={[0, 1.05]} legend="tr"
          series={[{ points: xs.map((x) => [x, gaussian(x, lam, fw)] as [number, number]), color: wavelengthToColor(lam), label: 'Doppler (Gaussian)' }, { points: xs.map((x) => [x, lorentzian(x, lam, fw / 2)] as [number, number]), color: '#bbbbbb', dashed: true, label: 'Lorentzian, same FWHM' }]} />}
      </div>
      <Panel id="sp-w-readout" className="right-panel" title="Width">
        <dl className="kv" aria-label="Width result">
          <KV k="line (NIST, vacuum)" v={lam} unit="nm" sig={7} />
          <KV k="atomic weight M" v={M} unit="u" sig={6} />
          <KV k="Doppler FWHM" v={fw !== null ? fw * 1000 : null} unit="pm" sig={4} />
          <KV k="FWHM in frequency" v={fw !== null ? (CONSTANTS.c.value * fw * 1e-9) / (lam * 1e-9) ** 2 : null} unit="Hz" sig={4} title="|dν| = c dλ/λ²" />
        </dl>
        <RelatedLinks id="instrument:spectroscopy" />
      </Panel>
    </>
  );
}

// ------------------------------------------------------------------ molecules
interface Mol { id: string; formula: string; caption: string; atoms: { symbol: string; Z: number; A: number }[]; constants: DiatomicConstants & { state: string; re: number | null }; url: string }
const MOLS = (dia as unknown as { molecules: Mol[] }).molecules;
function MoleculesTab() {
  const { query } = useRoute();
  const m = MOLS.find((x) => x.id === query.get('mol')) ?? MOLS.find((x) => x.id === 'co')!;
  const v = Math.round(num(query, 'v', 0, 0, 5));
  const c = m.constants;
  const levels = Array.from({ length: 6 }, (_, i) => ({ v: i, G: vibrationalTerm(c, i), B: rotationalConstant(c, i) }));
  const rot = Array.from({ length: 15 }, (_, i) => { const J = i + 1, s = rotationLine(c, v, J); return { J, s, f: wavenumberToHz(s), lam: wavenumberToM(s) }; });
  const mu = (() => { const a = atomMassU(m.atoms[0].Z, m.atoms[0].A), b = atomMassU(m.atoms[1].Z, m.atoms[1].A); return a !== null && b !== null ? reducedMass(a, b) : null; })();
  const W = 360, H = 300, Gmax = levels[5].G + rotationalTerm(c, 5, 12);
  return (
    <>
      <Panel id="sp-m-controls" className="left-panel" title="Molecule">
        <select className="text-input" aria-label="Molecule" value={m.id} onChange={(e) => setQuery({ mol: e.target.value })} style={{ width: '100%' }}>{MOLS.map((x) => <option key={x.id} value={x.id}>{x.formula} ({x.constants.state})</option>)}</select>
        <Slider k="v" label="vibration v" v={v} min={0} max={5} step={1} unit="" aria="Vibrational level" />
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Diatomic molecules: vibration and rotation <ProvenanceBadge cls="derived" title="NIST Diatomic Spectral Database eqs. 2–8; Huber & Herzberg constants" /></h1>
          <p className="note">A diatomic molecule's energy is a sum over vibration and rotation (Dunham), whose leading coefficients are the spectroscopic constants: G(v) = ω_e(v + ½) − ω_e x_e(v + ½)² and F_v(J) = B_v J(J + 1) − D_e J²(J + 1)² with B_v = B_e − α_e(v + ½). Pure-rotation lines (ΔJ = +1) fall at ν = 2B_v J′ − 4D_v J′³, almost evenly spaced (NIST Diatomic Spectral Database, eqs. 1–8). Constants of the ground state from Huber & Herzberg via the NIST WebBook. <SourceLinks ids={['nist-diatomic-database', 'nist-webbook', 'huber-herzberg-1979']} /></p>
        </div>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Energy levels" style={{ width: W, background: '#03050c', borderRadius: 10, border: '1px solid var(--line)' }}>
            {levels.map((L) => { const y = (G: number) => H - 14 - ((H - 28) * G) / Gmax; return <g key={L.v}>
              <line x1={30} x2={130} y1={y(L.G)} y2={y(L.G)} stroke={L.v === v ? '#f5c76b' : '#7df9ff'} strokeWidth={2} />
              <text x={4} y={y(L.G) + 4} style={{ fill: '#ccc', fontSize: 10 }}>v={L.v}</text>
              {Array.from({ length: 12 }, (_, J) => <line key={J} x1={150 + J * 16} x2={162 + J * 16} y1={y(L.G + rotationalTerm(c, L.v, J))} y2={y(L.G + rotationalTerm(c, L.v, J))} stroke={L.v === v ? '#f5c76b' : '#557'} />)}
            </g>; })}
            <text x={150} y={12} style={{ fill: '#888', fontSize: 10 }}>J = 0 … 11 (to scale)</text>
          </svg>
        </div>
        <LinePlot ariaLabel="Rotation lines" width={600} height={160} xLabel={`frequency (GHz), lines J′ ← J′ − 1 in v = ${v}`} yLabel="" yDomain={[0, 1.2]} xDomain={[0, rot[rot.length - 1].f / 1e9 * 1.05]}
          series={rot.map((r) => ({ points: [[r.f / 1e9, 0], [r.f / 1e9, 1]] as [number, number][], color: '#f5c76b' }))} />
        <p className="note" style={{ fontSize: 10.5 }}>Line positions only; their strengths depend on the populations of the levels and are not modelled.</p>
      </div>
      <Panel id="sp-m-readout" className="right-panel" title="Constants">
        <dl className="kv" aria-label="Molecule result">
          <KV k="state" v={c.state} />
          <KV k="ω_e" v={c.we} unit="cm⁻¹" sig={8} />
          <KV k="ω_e x_e" v={c.wexe} unit="cm⁻¹" sig={6} />
          <KV k="B_e" v={c.Be} unit="cm⁻¹" sig={8} />
          <KV k="zero-point energy G(0)" v={levels[0].G} unit="cm⁻¹" sig={6} />
          <KV k="fundamental G(1) − G(0)" v={levels[1].G - levels[0].G} unit="cm⁻¹" sig={6} />
          <KV k={`J = 1 ← 0 in v = ${v}`} v={rot[0].f / 1e9} unit="GHz" sig={7} />
          <KV k="wavelength of that line" v={rot[0].lam * 1e3} unit="mm" sig={5} />
          <KV k="reduced mass μ" v={mu} unit="u" sig={7} title="μ = M₁M₂/(M₁ + M₂), NUBASE2020 masses" />
        </dl>
        <table className="table-mini" aria-label="Vibrational levels"><thead><tr><th>v</th><th>G(v) (cm⁻¹)</th><th>B_v (cm⁻¹)</th></tr></thead>
          <tbody>{levels.map((L) => <tr key={L.v} className={L.v === v ? 'sel' : ''}><td>{L.v}</td><td>{formatSig(L.G, 7)}</td><td>{formatSig(L.B, 6)}</td></tr>)}</tbody></table>
        <RelatedLinks id="instrument:spectroscopy" />
      </Panel>
    </>
  );
}

export default function SpectroscopyView() {
  const { query } = useRoute();
  const tab: Tab = TABS.find(([t]) => t === query.get('tab'))?.[0] ?? 'hydrogen';
  return (
    <>
      <nav className="view-switch" aria-label="Spectroscopy sections">
        {TABS.map(([t, label]) => <button key={t} className={tab === t ? 'active' : ''} onClick={() => setQuery({ tab: t === 'hydrogen' ? null : t })}>{label}</button>)}
      </nav>
      {tab === 'widths' ? <WidthsTab /> : tab === 'molecules' ? <MoleculesTab /> : <HydrogenTab />}
    </>
  );
}
