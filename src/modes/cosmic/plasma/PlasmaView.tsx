/**
 * Plasma — #/cosmic/plasma?n=<log cm⁻³>&T=<log eV>&B=<log gauss>   (Phase 14, Gate 14.4)
 *
 * The NRL Plasma Formulary's fundamental parameters for any density, temperature and field, computed from CODATA
 * constants (the formulary's practical coefficients are reproduced in the tests); presets for the solar wind near
 * 1 AU (Divine 1973), the night-time ionosphere (NRL p. 42) and the formulary's typical plasmas (p. 40).
 */
import { useMemo } from 'react';
import { navigate, setQuery, useRoute } from '@/shared/router';
import { KV, Panel, ProvenanceBadge } from '@/ui/components';
import { SourceLinks } from '@/ui/SourcesView';
import { RelatedLinks } from '@/ui/RelatedLinks';
import { ScatterPlot } from '@/ui/plots';
import { formatSig } from '@/core/units/units';
import { EV_K, alfvenSpeed, debyeLengthM, debyeNumber, gyroFrequencyHz, plasmaBeta, plasmaFrequencyHz, thermalSpeed, ELECTRON_MASS } from '@/core/physics/plasma';
import data from '@datasets/astronomical/advanced.json';

const P = (data as unknown as { plasma: {
  nrl: { units: string; formulas: { q: string; f: string }[] };
  typical: { rows: { name: string; n: number; T: number }[] };
  ionosphere: { quote: string; E: { alt: string; n: number[] }; F: { alt: string; n: number[] }; B0: number };
  solarWind: { n: number; nRange: number[]; v: number; vRange: number[]; Tp: number; Te: number; B: number; BRange: number[]; footnote: string };
  swpc: { quotes: string[] };
} }).plasma;
const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
const num = (q: URLSearchParams, k: string, d: number, a: number, b: number) => { const v = Number(q.get(k)); return q.has(k) && Number.isFinite(v) ? clamp(v, a, b) : d; };
const fmtHz = (f: number) => (f >= 1e9 ? `${formatSig(f / 1e9, 3)} GHz` : f >= 1e6 ? `${formatSig(f / 1e6, 3)} MHz` : f >= 1e3 ? `${formatSig(f / 1e3, 3)} kHz` : `${formatSig(f, 3)} Hz`);
const fmtLen = (m: number) => (m >= 1e3 ? `${formatSig(m / 1e3, 3)} km` : m >= 1 ? `${formatSig(m, 3)} m` : m >= 1e-3 ? `${formatSig(m * 1e3, 3)} mm` : `${formatSig(m * 1e6, 3)} µm`);
const NRL = ['nrl-formulary-2009'];

export default function PlasmaView() {
  const { query } = useRoute();
  const sw = P.solarWind;
  const ln = num(query, 'n', Math.log10(sw.n), -1, 22), lT = num(query, 'T', Math.log10(sw.Te / EV_K), -2, 5), lB = num(query, 'B', Math.log10(sw.B * 1e-5), -7, 5);
  const nCm = 10 ** ln, TeV = 10 ** lT, Bg = 10 ** lB, n = nCm * 1e6, B = Bg * 1e-4;
  const vals = { fpe: plasmaFrequencyHz(n), ld: debyeLengthM(n, TeV), fce: gyroFrequencyHz(B), vA: alfvenSpeed(B, n), beta: plasmaBeta(n, TeV, B), ND: debyeNumber(n, TeV), vte: thermalSpeed(TeV, ELECTRON_MASS) };
  const presets: [string, number, number, number][] = [
    ['Solar wind at 1 AU (Divine 1973)', sw.n, sw.Te / EV_K, sw.B * 1e-5],
    ['Ionosphere F region, night (NRL)', P.ionosphere.F.n[1] / 1e6, TeV, P.ionosphere.B0 * 1e4],
    ...P.typical.rows.map((r) => [`${r.name} (NRL p. 40)`, r.n, r.T, Bg] as [string, number, number, number]),
  ];
  const pts = useMemo(() => P.typical.rows.map((r) => ({ key: r.name, x: Math.log10(r.n), y: Math.log10(r.T), color: '#f5c76b', r: 4, title: `${r.name}: n = ${r.n} cm⁻³, T = ${r.T} eV` })), []);
  return (
    <>
      <Panel id="plasma-controls" className="left-panel" title="A plasma">
        <label className="slider-row"><span style={{ minWidth: 80 }}>density n</span><input type="range" min={-1} max={22} step={0.05} value={ln} aria-label="Electron density (log)" onChange={(e) => setQuery({ n: e.target.value })} /><span>{formatSig(nCm, 2)} cm⁻³</span></label>
        <label className="slider-row"><span style={{ minWidth: 80 }}>temperature</span><input type="range" min={-2} max={5} step={0.05} value={lT} aria-label="Electron temperature (log)" onChange={(e) => setQuery({ T: e.target.value })} /><span>{formatSig(TeV, 2)} eV</span></label>
        <label className="slider-row"><span style={{ minWidth: 80 }}>field B</span><input type="range" min={-7} max={5} step={0.05} value={lB} aria-label="Magnetic field (log)" onChange={(e) => setQuery({ B: e.target.value })} /><span>{formatSig(Bg, 2)} G</span></label>
        <ol className="life-list" aria-label="Plasma presets">{presets.map(([l, nn, t, b]) => <li key={l}><button className="link-btn" onClick={() => setQuery({ n: Math.log10(nn).toFixed(3), T: Math.log10(t).toFixed(3), B: Math.log10(b).toFixed(3) })}>{l}</button></li>)}</ol>
        <p className="note">1 eV = {formatSig(EV_K, 5)} K; 1 G = 10⁻⁴ T = 10⁵ nT.</p>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Plasma: the fourth state <ProvenanceBadge cls="derived" title="NRL Plasma Formulary formulas, computed from CODATA constants" /></h1>
          <p className="note">NOAA: “{P.swpc.quotes[0]}” <SourceLinks ids={['noaa-swpc-solar-wind']} /></p></div>
        <dl className="kv" aria-label="Plasma values" style={{ maxWidth: 520 }}>
          <KV k="Electron plasma frequency f_pe" v={fmtHz(vals.fpe)} title="8.98 × 10³ n^½ Hz" />
          <KV k="Debye length λ_D" v={fmtLen(vals.ld)} title="7.43 × 10² T^½ n^−½ cm" />
          <KV k="Electrons in a Debye sphere" v={vals.ND} sig={3} title="1.72 × 10⁹ T^{3/2} n^−½" />
          <KV k="Electron gyrofrequency f_ce" v={fmtHz(vals.fce)} title="2.80 × 10⁶ B Hz" />
          <KV k="Alfvén speed v_A (protons)" v={vals.vA / 1e3} unit="km/s" sig={3} title="2.18 × 10¹¹ μ^−½ n^−½ B cm/s" />
          <KV k="Electron thermal speed" v={vals.vte / 1e3} unit="km/s" sig={3} title="(kT/m)^½" />
          <KV k="Plasma beta β" v={vals.beta} sig={3} title="4.03 × 10⁻¹¹ n T B⁻²" />
        </dl>
        <ScatterPlot ariaLabel="Typical plasmas by density and temperature" width={560} height={300} xLabel="log₁₀ electron density (cm⁻³)" yLabel="log₁₀ temperature (eV)" points={[...pts, { key: 'now', x: ln, y: lT, color: '#5cf2a6', r: 6, ring: true, title: 'this plasma' }]} labels={P.typical.rows.filter((r) => r.name !== 'Gaseous nebula').map((r) => ({ x: Math.log10(r.n) + (r.n > 1e18 ? -0.3 : 0.3), y: Math.log10(r.T) + 0.25, text: r.name, anchor: (r.n > 1e18 ? 'end' : 'start') as 'end' | 'start' }))} xDomain={[-1, 22]} yDomain={[-2, 5]} />
        <p className="note">“{P.nrl.units}” — the formulary's forms, used as written: {P.nrl.formulas.map((f) => f.f).join('; ')}. <SourceLinks ids={NRL} /> The values above are computed in SI from CODATA constants and agree with these coefficients to their printed three figures (tested).</p>
      </div>
      <Panel id="plasma-detail" className="right-panel" title="The solar wind at 1 AU">
        <dl className="kv" aria-label="Solar wind values">
          <KV k="Density" v={`${sw.n} (${sw.nRange[0]}–${sw.nRange[1]})`} unit="cm⁻³" />
          <KV k="Speed" v={`${sw.v} (${sw.vRange[0]}–${sw.vRange[1]})`} unit="km/s" />
          <KV k="Proton temperature" v={sw.Tp} unit="K" sig={2} />
          <KV k="Electron temperature" v={sw.Te} unit="K" sig={2} />
          <KV k="Field" v={`${sw.B} (${sw.BRange[0]}–${sw.BRange[1]})`} unit="nT" />
        </dl>
        <p className="note">Divine (1973), Table 1: “{sw.footnote}” <SourceLinks ids={['divine-1973']} /> NOAA: “{P.swpc.quotes[2]}” “{P.swpc.quotes[1]}” <SourceLinks ids={['noaa-swpc-solar-wind']} /></p>
        <p className="note">Night-time ionosphere (NRL p. 42): E region {P.ionosphere.E.alt}, {formatSig(P.ionosphere.E.n[0], 2)}–{formatSig(P.ionosphere.E.n[1], 2)} m⁻³; F region {P.ionosphere.F.alt}, {formatSig(P.ionosphere.F.n[0], 2)}–{formatSig(P.ionosphere.F.n[1], 2)} m⁻³. <SourceLinks ids={NRL} /></p>
        <button className="chip" onClick={() => navigate('/cosmic/sun')}>The Sun →</button>
        <button className="chip" onClick={() => navigate('/spectral/rf')}>Radio propagation →</button>
        <RelatedLinks id="instrument:plasma" limit={3} />
      </Panel>
    </>
  );
}
