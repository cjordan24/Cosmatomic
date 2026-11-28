/**
 * Transport and biochemistry — #/biologic/transport?tab=diffusion|osmosis|enzymes   (Phase 11, Gate 11.6)
 *
 *  diffusion  diffusion times t = x²/2D (Einstein eq. 11) for the sugars of the International Critical Tables over
 *             distances from a ribosome to a centimetre; a 1-D Fick solver beside a random walk of particles
 *             (mol=, x=, t=)
 *  osmosis    van 't Hoff's PV = RT for dilute solutions: π = cRT (c=, tc=)
 *  enzymes    Michaelis & Menten (1913): V = [S]/([S] + k) on a log [S] axis like their figures (k=, s=)
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { navigate, setQuery, useRoute } from '@/shared/router';
import { KV, Panel, ProvenanceBadge } from '@/ui/components';
import { SourceLinks } from '@/ui/SourcesView';
import { RelatedLinks } from '@/ui/RelatedLinks';
import { LinePlot } from '@/ui/plots';
import { formatSig } from '@/core/units/units';
import { useVoyager } from '@/shared/store';
import { R_GAS, celsiusToKelvin } from '@/core/biology/membrane';
import { diffusionTime, fickStep, gaussianProfile, michaelisMenten, osmoticPressure, randomWalk, rmsDisplacement, stokesEinsteinD } from '@/core/biology/transport';
import data from '@datasets/biology/transport.json';

interface Dif { id: string; name: string; formula: string; molecule: string | null; tC: number; e5: number; reliability: string; where: string }
const T6 = data as unknown as {
  fick: { law: { quote: string; where: string }; equation2: { text: string; note: string; where: string } };
  einstein: { eq11: { text: string; quote: string; where: string }; stokes: { text: string }; example: { quote: string }; supplement1906: { quote: string; thovertCm2PerDay: number; sugarRadiusMm: number } };
  vantHoff: { quote: string; where: string; numbers: { P: number; Vvalue: number; T: number; R: number; units: string }; summary: string };
  michaelisMenten: { eq3: string; eq4: string; definitions: string; proportional: string; fig4aLogK: number; fig4aWhere: string; where: string };
  diffusion: Dif[];
};
const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
const num = (q: URLSearchParams, k: string, d: number, a: number, b: number) => { const v = Number(q.get(k)); return q.has(k) && Number.isFinite(v) ? clamp(v, a, b) : d; };
const DIST: { label: string; m: number; note: string }[] = [
  { label: 'a ribosome (25 nm)', m: 25e-9, note: 'Inside the Cell p. 11: 20–30 nm' },
  { label: 'a mitochondrion (1.5 µm)', m: 1.5e-6, note: 'p. 11: 1–2 µm' },
  { label: 'an animal cell (30 µm)', m: 30e-6, note: 'p. 11' },
  { label: 'a human egg (150 µm)', m: 150e-6, note: 'p. 20' },
  { label: '1 mm', m: 1e-3, note: '' },
  { label: '1 cm', m: 1e-2, note: '' },
];
function fmtTime(s: number) {
  if (s < 1e-3) return `${formatSig(s * 1e6, 3)} µs`;
  if (s < 1) return `${formatSig(s * 1e3, 3)} ms`;
  if (s < 120) return `${formatSig(s, 3)} s`;
  if (s < 7200) return `${formatSig(s / 60, 3)} min`;
  if (s < 172800) return `${formatSig(s / 3600, 3)} h`;
  return `${formatSig(s / 86400, 3)} days`;
}

/** 1-D diffusion from a thin layer: Fick's equation (curve) and random walkers (dots), side by side in time. */
function DiffusionAnimation({ D }: { D: number }) {
  const reduced = useVoyager((s) => s.settings.reducedMotion);
  const L = 60e-6, n = 121, dx = (2 * L) / (n - 1), dt = 0.4 * dx * dx / D; // r = 0.4
  const tMax = (L / 3) ** 2 / (2 * D); // until the rms spread is a third of the half-width
  const [t, setT] = useState(tMax * 0.5);
  const [playing, setPlaying] = useState(false);
  const ref = useRef(t);
  ref.current = t;
  useEffect(() => {
    if (!playing || reduced) return;
    let raf = 0, last = performance.now();
    const loop = (now: number) => { const next = ref.current + ((now - last) / 1000) * (tMax / 6); last = now; if (next >= tMax) { setT(tMax); setPlaying(false); return; } setT(next); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [playing, reduced, tMax]);
  const profile = useMemo(() => {
    let c: Float64Array = new Float64Array(n); c[(n - 1) / 2] = 1 / dx; // unit amount in the middle cell
    const steps = Math.max(1, Math.round(t / dt));
    for (let k = 0; k < steps; k++) c = fickStep(c, D, dx, dt);
    return c;
  }, [t, D, dx, dt]);
  const walkers = useMemo(() => randomWalk(300, D, t / 20, 20, 7), [t, D]);
  const W = 520, H = 180, px = (x: number) => 10 + ((x + L) / (2 * L)) * (W - 20);
  const peak = 1 / Math.sqrt(4 * Math.PI * D * (tMax * 0.05));
  const py = (c: number) => H - 40 - (c / peak) * (H - 60);
  return (
    <div>
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', maxWidth: W }}>
      <button className="chip" onClick={() => { if (t >= tMax) setT(dt); setPlaying((p) => !p); }} aria-pressed={playing}>{playing ? '❚❚ Pause' : '▶ Play'}</button>
      <input type="range" min={dt} max={tMax} step={tMax / 200} value={t} aria-label="Diffusion time" onChange={(e) => { setPlaying(false); setT(Number(e.target.value)); }} style={{ flex: 1 }} />
    </div>
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Diffusion from a thin layer" style={{ width: '100%', maxWidth: W }}>
      <path d={Array.from(profile, (c, i) => `${i ? 'L' : 'M'} ${px(-L + i * dx)} ${py(c)}`).join(' ')} fill="none" stroke="#5cf2a6" strokeWidth={2} />
      <path d={Array.from({ length: 121 }, (_, i) => { const x = -L + i * dx; return `${i ? 'L' : 'M'} ${px(x)} ${py(gaussianProfile(1, D, Math.max(t, dt), x))}`; }).join(' ')} fill="none" stroke="#f5c76b" strokeDasharray="4 4" />
      {Array.from(walkers, (x, i) => <circle key={i} cx={px(clamp(x, -L, L))} cy={H - 24 + ((i * 37) % 13)} r={1.6} fill="#7df9ff" opacity={0.7} />)}
      <line x1={10} x2={W - 10} y1={H - 30} y2={H - 30} stroke="var(--line)" />
      <text x={10} y={14} fontSize={11} fill="var(--text-dim)">t = {fmtTime(t)} · rms spread √(2Dt) = {formatSig(rmsDisplacement(D, t) * 1e6, 3)} µm</text>
      <text x={W - 10} y={14} textAnchor="end" fontSize={10} fill="var(--text-faint)">width ±60 µm</text>
    </svg>
    </div>
  );
}

function DiffusionTab() {
  const { query } = useRoute();
  const sel = T6.diffusion.find((d) => d.id === query.get('mol')) ?? T6.diffusion[0];
  const D = sel.e5 * 1e-5 * 1e-4; // cm²/s → m²/s
  const xs = Array.from({ length: 120 }, (_, i) => 10 ** (-8 + (i / 119) * 6));
  const thovert = T6.einstein.supplement1906.thovertCm2PerDay;
  const sucroseIct = T6.diffusion.find((d) => d.id === 'sucrose')!.e5 * 1e-5 * 86400;
  return (
    <>
      <Panel id="dif-list" className="left-panel" title="Diffusing molecule">
        <ol className="life-list" aria-label="Diffusion coefficients at 15 °C">
          {T6.diffusion.map((d) => (
            <li key={d.id}><button className={`link-btn ${d.id === sel.id ? 'active' : ''}`} onClick={() => setQuery({ mol: d.id === 'glucose' ? null : d.id })}>{d.name}</button>
              <span className="note"> {d.e5} × 10⁻⁵ cm²/s ({d.reliability})</span></li>
          ))}
        </ol>
        <p className="note">International Critical Tables V (1929), p. 71: 15 °C, very dilute solution; the letter is the probable error (C 5 %, D 7 %, E 10 %). <SourceLinks ids={['ict-1929']} /></p>
        {sel.molecule && <button className="chip" onClick={() => navigate(`/atomic/molecules/${sel.molecule}`)}>{sel.name.split(' (')[0]} in 3D →</button>}
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head">
          <h1>Diffusion <ProvenanceBadge cls="derived" title="Einstein eq. (11) and Fick eq. (2) with ICT coefficients" /></h1>
          <p className="note">Fick (1855): the transfer “must be, ceteris paribus, directly proportional to the difference of concentration, and inversely proportional to the distance of the elements from one another” — his equation (2) is {T6.fick.equation2.text} ({T6.fick.equation2.note}). <SourceLinks ids={['fick-1855', 'ict-1929']} /> Einstein (1905): {T6.einstein.eq11.text}; “{T6.einstein.eq11.quote}” <SourceLinks ids={['einstein-brownian-1926']} /></p>
        </div>
        <DiffusionAnimation D={D} />
        <p className="note"><span style={{ color: '#5cf2a6' }}>—</span> Fick's equation solved step by step from a thin layer, <span style={{ color: '#f5c76b' }}>- -</span> its exact spreading-Gaussian solution, <span style={{ color: '#7df9ff' }}>●</span> 300 random walkers with Gaussian steps of variance 2DΔt. Same D for all three.</p>
        <div style={{ flex: '1 1 340px', maxWidth: 440 }}>
          <LinePlot ariaLabel="Diffusion time against distance" width={440} height={240} xLog yLog xLabel="distance x (m)" yLabel="time t = x²/2D (s)"
            series={[{ points: xs.map((x) => [x, diffusionTime(D, x)] as [number, number]), color: '#5cf2a6', label: sel.name.split(' (')[0] }]}
            markers={DIST.map((d) => ({ x: d.m, y: diffusionTime(D, d.m), color: '#f5c76b' }))} />
        </div>
      </div>
      <Panel id="dif-detail" className="right-panel" title={sel.name}>
        <table className="table-mini" aria-label="Diffusion times"><thead><tr><th>across</th><th>time x²/2D</th></tr></thead>
          <tbody>{DIST.map((d) => <tr key={d.label}><td>{d.label}</td><td>{fmtTime(diffusionTime(D, d.m))}</td></tr>)}</tbody></table>
        <p className="note">Distances from <em>Inside the Cell</em> <SourceLinks ids={['nigms-inside-the-cell']} />. Time for the rms displacement along one axis to reach x; real cells are crowded, so these are lower limits.</p>
        <h4 style={{ margin: '10px 0 4px' }}>Cross-checks</h4>
        <p className="note">Sucrose: ICT 0.38 × 10⁻⁵ cm²/s = {formatSig(sucroseIct, 3)} cm²/day at 15 °C; Thovert's value quoted by Einstein (1906) is {thovert} cm²/day at 18.5 °C. From such data Einstein found a sugar-molecule radius of {T6.einstein.supplement1906.sugarRadiusMm * 1e6} × 10⁻⁶ mm, i.e. {formatSig(T6.einstein.supplement1906.sugarRadiusMm * 1e6, 2)} nm. <SourceLinks ids={['einstein-brownian-1926']} /></p>
        <dl className="kv" aria-label="Einstein example"><KV k="Einstein's example, λx in 1 s" v={rmsDisplacement(stokesEinsteinD(290.15, 1.35e-3, 0.5e-6, 6e23), 1) * 1e6} unit="µm" sig={3} title="N = 6·10²³, water at 17 °C (k = 1.35·10⁻² poise), diameter 0.001 mm; he gives 0.8 µ" /></dl>
        <RelatedLinks id="instrument:transport" limit={4} />
      </Panel>
    </>
  );
}

function OsmosisTab() {
  const { query } = useRoute();
  const c = num(query, 'c', 300, 1, 1500), tC = num(query, 'tc', 25, 0, 40), T = celsiusToKelvin(tC);
  const pi = osmoticPressure(c, T);
  const vh = T6.vantHoff.numbers, rFromNumbers = (vh.P * vh.Vvalue) / vh.T;
  return (
    <>
      <Panel id="osm-controls" className="left-panel" title="Solution">
        <label className="slider-row"><span style={{ minWidth: 90 }}>solute particles</span><input type="range" min={1} max={1500} step={1} value={c} aria-label="Solute concentration" onChange={(e) => setQuery({ c: e.target.value })} /><span>{c} mmol/L</span></label>
        <label className="slider-row"><span style={{ minWidth: 90 }}>temperature</span><input type="range" min={0} max={40} step={0.5} value={tC} aria-label="Osmosis temperature" onChange={(e) => setQuery({ tc: e.target.value })} /><span>{tC} °C</span></label>
        <button className="chip" onClick={() => setQuery({ c: '1005', tc: '18' })}>Hodgkin & Katz's sea water ions (10 + 455 + 540 mM)</button>
        <p className="note">c counts every dissolved particle (each ion separately). Sea water is far from dilute, so its ideal value is only an upper-limit illustration.</p>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head">
          <h1>Osmotic pressure <ProvenanceBadge cls="derived" title="van 't Hoff (1887): PV = RT for dilute solutions" /></h1>
          <blockquote className="quote" lang="de">“{T6.vantHoff.quote}” <span className="note" style={{ fontStyle: 'normal' }}>— van 't Hoff (1887), {T6.vantHoff.where} <SourceLinks ids={['van-t-hoff-1887']} /></span></blockquote>
          <p className="note">In English: the gas law PV = RT also holds for solutions when P is the osmotic pressure, with the same restriction as for gases: the dilution must be great enough to neglect the mutual action and the volume of the dissolved particles. For c moles of particles per litre this is π = cRT.</p>
        </div>
        <div style={{ flex: '1 1 340px', maxWidth: 440 }}>
          <LinePlot ariaLabel="Osmotic pressure against concentration" width={440} height={240} xLabel="c (mmol/L)" yLabel="π (kPa)"
            series={[{ points: Array.from({ length: 60 }, (_, i) => { const x = 1 + (i / 59) * 1499; return [x, osmoticPressure(x, T) / 1000] as [number, number]; }), color: '#5cf2a6', label: `π = cRT at ${tC} °C` }]}
            markers={[{ x: c, y: pi / 1000, color: '#f5c76b' }]} />
        </div>
      </div>
      <Panel id="osm-readout" className="right-panel" title="Ideal osmotic pressure">
        <dl className="kv" aria-label="Osmotic pressure values">
          <KV k="π" v={pi / 1000} unit="kPa" sig={4} />
          <KV k="π" v={pi / 101325} unit="atm" sig={4} />
          <KV k="height of water held up" v={pi / (1000 * 9.80665)} unit="m" sig={3} title="π / (ρg), ρ = 1000 kg/m³, standard gravity" />
        </dl>
        <h4 style={{ margin: '10px 0 4px' }}>van 't Hoff's gas constant</h4>
        <p className="note">He took P = {vh.P}, V = 2/0·08956, T = {vh.T} and printed R = {vh.R} ({vh.units}). His own numbers give PV/T = {formatSig(rFromNumbers, 6)}; in SI, {vh.R} kgf·m = {formatSig(vh.R * 9.80665 / 1000, 4)} J mol⁻¹ K⁻¹ against today's {formatSig(R_GAS, 6)}. Both are shown; the calculation uses today's R. <SourceLinks ids={['van-t-hoff-1887', 'codata-2018']} /></p>
        <RelatedLinks id="instrument:transport" limit={4} />
      </Panel>
    </>
  );
}

function EnzymesTab() {
  const { query } = useRoute();
  const logK = num(query, 'lk', T6.michaelisMenten.fig4aLogK, -6, 0), k = 10 ** logK;
  const logS = num(query, 'ls', -1.5, -6, 1), S = 10 ** logS;
  const ss = Array.from({ length: 160 }, (_, i) => 10 ** (-6 + (i / 159) * 7));
  return (
    <>
      <Panel id="mm-controls" className="left-panel" title="Enzyme and substrate">
        <label className="slider-row"><span style={{ minWidth: 60 }}>log₁₀ k</span><input type="range" min={-6} max={0} step={0.01} value={logK} aria-label="Dissociation constant (log)" onChange={(e) => setQuery({ lk: e.target.value })} /><span>{logK}</span></label>
        <label className="slider-row"><span style={{ minWidth: 60 }}>log₁₀ [S]</span><input type="range" min={-6} max={1} step={0.01} value={logS} aria-label="Substrate concentration (log)" onChange={(e) => setQuery({ ls: e.target.value })} /><span>{logS}</span></label>
        <button className="chip" onClick={() => setQuery({ lk: null })}>Invertase on sucrose: log k = −1.78 (Fig. 4a)</button>
        <p className="note">Concentrations in mol/L. The value −1.78 is read from the abscissa of their Fig. 4a.</p>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head">
          <h1>Enzyme kinetics <ProvenanceBadge cls="derived" title="Michaelis & Menten (1913), eqs. (2)–(4)" /></h1>
          <p className="note">Michaelis and Menten (1913) assume, after Henri, that invertase forms a very labile compound with sucrose. With φ the bound enzyme, Φ the total, [S] the sugar and “k ist die Dissoziationskonstante”, the bound share is (2) φ = Φ·[S]/([S] + k), and “Dieser Menge muß also die Anfangsgeschwindigkeit, v, der Inversion immer proportional sein”: (3) {T6.michaelisMenten.eq3}, or normalised (4) {T6.michaelisMenten.eq4}. <SourceLinks ids={['michaelis-menten-1913']} /> Like their figures, the plot uses a logarithmic [S] axis.</p>
        </div>
        <div style={{ flex: '1 1 340px', maxWidth: 460 }}>
          <LinePlot ariaLabel="Michaelis–Menten rate against substrate concentration" width={460} height={260} xLog xLabel="[S] (mol/L)" yLabel="V = v / CΦ"
            series={[{ points: ss.map((x) => [x, michaelisMenten(x, k)] as [number, number]), color: '#5cf2a6', label: 'V = [S]/([S] + k)' }]}
            hLines={[{ y: 0.5, label: 'half rate', color: '#9aa6c8' }]} vLines={[{ x: k, label: 'k', color: '#f5c76b' }]} markers={[{ x: S, y: michaelisMenten(S, k), color: '#ff7a90' }]} />
        </div>
      </div>
      <Panel id="mm-readout" className="right-panel" title="Rate">
        <dl className="kv" aria-label="Enzyme rate">
          <KV k="k" v={k} unit="mol/L" sig={3} />
          <KV k="[S]" v={S} unit="mol/L" sig={3} />
          <KV k="V = [S]/([S] + k)" v={michaelisMenten(S, k)} sig={3} />
          <KV k="share of enzyme bound φ/Φ" v={michaelisMenten(S, k)} sig={3} />
        </dl>
        <p className="note">At [S] = k half the enzyme is bound and the rate is half its maximum; far above k the rate stops growing. <button className="link-btn" onClick={() => navigate('/biologic/molecules?tab=carbs&sel=pubchem-5988')}>Sucrose →</button></p>
        <RelatedLinks id="instrument:transport" limit={4} />
      </Panel>
    </>
  );
}

export default function TransportView() {
  const { query } = useRoute();
  const tab = query.get('tab') === 'osmosis' ? 'osmosis' : query.get('tab') === 'enzymes' ? 'enzymes' : 'diffusion';
  return (
    <>
      <nav className="view-switch" aria-label="Transport sections">
        <button className={tab === 'diffusion' ? 'active' : ''} onClick={() => setQuery({ tab: null })}>Diffusion</button>
        <button className={tab === 'osmosis' ? 'active' : ''} onClick={() => setQuery({ tab: 'osmosis' })}>Osmosis</button>
        <button className={tab === 'enzymes' ? 'active' : ''} onClick={() => setQuery({ tab: 'enzymes' })}>Enzyme kinetics</button>
      </nav>
      {tab === 'osmosis' ? <OsmosisTab /> : tab === 'enzymes' ? <EnzymesTab /> : <DiffusionTab />}
    </>
  );
}
