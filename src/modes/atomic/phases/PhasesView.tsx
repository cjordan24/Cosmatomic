/**
 * Phase behaviour — #/atomic/phases[/lj]?s=water|co2&T=&p=
 *  Diagram tab: IAPWS / Span–Wagner boundaries on log-pressure axes, click to probe (T, p).
 *  Forces tab: Lennard-Jones potential and a live qualitative LJ fluid (argon units).
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { Viewport } from '@/rendering/Viewport';
import { navigate, setQuery, useRoute } from '@/shared/router';
import { KV, Panel, ProvenanceBadge } from '@/ui/components';
import { LinePlot, fmtTick } from '@/ui/plots';
import { SourceLinks } from '@/ui/SourcesView';
import { formatSig } from '@/core/units/units';
import { getMaterial, soundSpeed } from '../materials/materials';
import { PHASE_DATA, vaporPressure, classify, co2SublimationPressure, co2VaporPressure, criticalPoint, iceIhMeltingPressure, saturationState, triplePoint, waterMeltingBranches, waterSublimationPressure, waterVaporPressure, type Substance } from './phase';
import { ARGON, advance, createLJ, densityGcc, ljPotential, msd, pressure, rdf, tauPs, temperature, type LJState } from './lj';

const RANGE: Record<Substance, { T: [number, number]; lp: [number, number] }> = { water: { T: [200, 720], lp: [-1, 10.6] }, co2: { T: [150, 340], lp: [2, 8.3] } };

function PhaseDiagram({ s, probe, onProbe }: { s: Substance; probe: { T: number; p: number } | null; onProbe: (T: number, p: number) => void }) {
  const W = 620, H = 420, pad = { l: 62, r: 14, t: 14, b: 40 };
  const { T: [T0, T1], lp: [L0, L1] } = RANGE[s];
  const sx = (T: number) => pad.l + ((T - T0) / (T1 - T0)) * (W - pad.l - pad.r);
  const sy = (p: number) => pad.t + (1 - (Math.log10(p) - L0) / (L1 - L0)) * (H - pad.t - pad.b);
  const path = (f: (T: number) => number | null, a: number, b: number, n = 240) => {
    const pts: string[] = [];
    for (let i = 0; i <= n; i++) { const T = a + ((b - a) * i) / n; const p = f(T); if (p && p > 0) pts.push(`${sx(T).toFixed(1)},${sy(p).toFixed(1)}`); }
    return pts.join(' ');
  };
  const tp = triplePoint(s), cp = criticalPoint(s);
  const curves: { pts: string; color: string; label: string }[] = s === 'water' ? [
    { pts: path(waterSublimationPressure, T0, 273.16), color: '#7df9ff', label: 'sublimation (IAPWS R14-08)' },
    { pts: path(waterVaporPressure, 273.16, 647.096), color: '#5cf2a6', label: 'vaporisation (IAPWS SR1-86)' },
    { pts: path(iceIhMeltingPressure, 251.165, 273.16, 80), color: '#f5c76b', label: 'melting ice Ih' },
    ...['ice III', 'ice V', 'ice VI', 'ice VII'].map((ice) => { const seg = PHASE_DATA.water.melting.find((m) => m.phase === ice)!; return { pts: path((T) => waterMeltingBranches(T).find((b) => b.ice === ice)?.p ?? null, seg.validK[0], Math.min(seg.validK[1], T1)), color: '#f5c76b', label: `melting ${ice}` }; }),
  ] : [
    { pts: path(co2SublimationPressure, PHASE_DATA.co2.sublimation.validK[0], PHASE_DATA.co2.sublimation.validK[1]), color: '#7df9ff', label: 'sublimation (Antoine, Giauque & Egan data)' },
    { pts: path(co2VaporPressure, tp.T, cp.T), color: '#5cf2a6', label: 'vaporisation (Span–Wagner EOS)' },
  ];
  const regions = s === 'water'
    ? [{ T: 225, p: 1e5, t: 'ICE Ih' }, { T: 330, p: 3e6, t: 'LIQUID' }, { T: 450, p: 50, t: 'VAPOUR' }, { T: 690, p: 2e8, t: 'SUPERCRITICAL' }, { T: 480, p: 8e9, t: 'ICE VII' }, { T: 300, p: 1.4e9, t: 'VI' }]
    : [{ T: 175, p: 3e6, t: 'SOLID' }, { T: 265, p: 2e7, t: 'LIQUID' }, { T: 290, p: 3e4, t: 'VAPOUR' }, { T: 325, p: 1.5e8, t: 'SUPERCRITICAL' }];
  const ticksY = Array.from({ length: Math.floor(L1) - Math.ceil(L0) + 1 }, (_, i) => Math.ceil(L0) + i);
  const ticksT = Array.from({ length: 12 }, (_, i) => Math.ceil(T0 / 50) * 50 + i * 50).filter((t) => t <= T1);
  const svg = useRef<SVGSVGElement>(null);
  const click = (e: React.MouseEvent) => {
    const r = svg.current!.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * W, y = ((e.clientY - r.top) / r.height) * H;
    const T = T0 + ((x - pad.l) / (W - pad.l - pad.r)) * (T1 - T0);
    const lp = L0 + (1 - (y - pad.t) / (H - pad.t - pad.b)) * (L1 - L0);
    if (T >= T0 && T <= T1 && lp >= L0 && lp <= L1) onProbe(Number(T.toFixed(2)), Number((10 ** lp).toPrecision(4)));
  };
  return (
    <svg ref={svg} viewBox={`0 0 ${W} ${H}`} className="plot" role="img" aria-label={`Phase diagram of ${s === 'water' ? 'water' : 'carbon dioxide'}`} onClick={click} style={{ cursor: 'crosshair' }}>
      <rect x={pad.l} y={pad.t} width={W - pad.l - pad.r} height={H - pad.t - pad.b} fill="rgba(255,255,255,0.02)" stroke="var(--line)" />
      {ticksY.map((k) => <g key={k}><line x1={pad.l} x2={W - pad.r} y1={sy(10 ** k)} y2={sy(10 ** k)} stroke="var(--line)" /><text x={pad.l - 4} y={sy(10 ** k) + 3} textAnchor="end">10{String(k).replace(/-?\d/g, (d) => '⁻⁰¹²³⁴⁵⁶⁷⁸⁹'[d === '-' ? 0 : Number(d) + 1])}</text></g>)}
      {ticksT.map((t) => <g key={t}><line x1={sx(t)} x2={sx(t)} y1={pad.t} y2={H - pad.b} stroke="var(--line)" /><text x={sx(t)} y={H - pad.b + 13} textAnchor="middle">{t}</text></g>)}
      <line x1={pad.l} x2={W - pad.r} y1={sy(101325)} y2={sy(101325)} stroke="var(--text-dim)" strokeDasharray="3 4" /><text x={W - pad.r - 4} y={sy(101325) - 4} textAnchor="end">1 atm</text>
      {regions.map((r) => <text key={r.t} x={sx(r.T)} y={sy(r.p)} textAnchor="middle" style={{ fill: 'var(--text-faint)', letterSpacing: '0.15em', fontSize: 11 }}>{r.t}</text>)}
      {curves.map((c) => <polyline key={c.label} points={c.pts} fill="none" stroke={c.color} strokeWidth={2}><title>{c.label}</title></polyline>)}
      <circle cx={sx(tp.T)} cy={sy(tp.p)} r={4.5} fill="#fff" /><text x={sx(tp.T) + 7} y={sy(tp.p) + 14}>triple point</text>
      <circle cx={sx(cp.T)} cy={sy(cp.p)} r={4.5} fill="#ff7a90" /><text x={sx(cp.T) - 6} y={sy(cp.p) - 8} textAnchor="end">critical point</text>
      {s === 'co2' && <text x={sx(tp.T) + 8} y={sy(tp.p) - 28} style={{ fill: 'var(--warn)' }}>melting curve not bundled ↑</text>}
      {s === 'co2' && <line x1={sx(PHASE_DATA.co2.sublimation.validK[1])} x2={sx(tp.T)} y1={sy(co2SublimationPressure(PHASE_DATA.co2.sublimation.validK[1])!)} y2={sy(tp.p)} stroke="#7df9ff" strokeDasharray="2 4" opacity={0.5}><title>gap: no bundled sublimation data 195.9–216.6 K (not interpolated)</title></line>}
      {probe && <g><circle cx={sx(probe.T)} cy={sy(probe.p)} r={6} fill="none" stroke="var(--accent)" strokeWidth={2} /><line x1={sx(probe.T)} x2={sx(probe.T)} y1={pad.t} y2={H - pad.b} stroke="var(--accent)" opacity={0.3} /></g>}
      <text x={(pad.l + W - pad.r) / 2} y={H - 6} textAnchor="middle" style={{ fill: 'var(--text)' }}>temperature T (K)</text>
      <text transform={`translate(13 ${(pad.t + H - pad.b) / 2}) rotate(-90)`} textAnchor="middle" style={{ fill: 'var(--text)' }}>pressure p (Pa, log scale)</text>
    </svg>
  );
}

function Probe({ s, T, p }: { s: Substance; T: number; p: number }) {
  const v = classify(s, T, p);
  const sat = saturationState(s, T);
  const mat = getMaterial(s === 'water' ? 'water' : 'carbon-dioxide')!;
  const atm = Math.abs(p / 101325 - 1) < 0.15 ? soundSpeed(mat, T) : null;
  return (
    <div aria-label="Phase probe">
      <div className="section-title">Probe: T = {T} K, p = {fmtTick(p)} Pa</div>
      <p style={{ margin: '4px 0', fontSize: 16 }}><strong style={{ color: 'var(--accent)' }}>{v.phase}</strong> {!v.certain && <span className="badge" style={{ color: 'var(--warn)' }}>uncertain</span>}</p>
      {v.note && <p className="note">{v.note}</p>}
      {sat && (
        <>
          <div className="section-title">Coexisting phases at {T} K (saturation pressure {formatSig(vaporPressure(s, T) ?? sat.pMPa * 1e6, 6)} Pa) <ProvenanceBadge cls="derived" title="Reference equation of state" /></div>
          <table className="table-mini" aria-label="Coexisting liquid and vapour">
            <thead><tr><th /><th>liquid</th><th>vapour</th></tr></thead>
            <tbody>
              <tr><td>density (kg/m³)</td><td>{formatSig(sat.rhoL, 5)}</td><td>{formatSig(sat.rhoV, 4)}</td></tr>
              <tr><td>speed of sound (m/s)</td><td>{formatSig(sat.cL, 5)}</td><td>{formatSig(sat.cV, 4)}</td></tr>
              <tr><td>enthalpy (kJ/kg)</td><td>{formatSig(sat.hL, 5)}</td><td>{formatSig(sat.hV, 5)}</td></tr>
            </tbody>
          </table>
          <p className="note">Latent heat of vaporisation ΔvapH = {formatSig(sat.hV - sat.hL, 4)} kJ/kg. Sound is {formatSig(sat.cL / sat.cV, 3)}× faster in the liquid at the same temperature, because the liquid is far stiffer even though it is denser.</p>
        </>
      )}
      {atm !== null && <p className="note">At 1 atm and {T} K the reference equation of state gives a speed of sound of <strong>{formatSig(atm, 5)} m/s</strong>.</p>}
    </div>
  );
}

function LJParticles({ sim, running, speed, target }: { sim: React.MutableRefObject<LJState>; running: boolean; speed: number; target: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const o = useMemo(() => new THREE.Object3D(), []);
  useFrame((_, dt) => {
    const s = sim.current;
    if (running) advance(s, Math.min(dt, 0.1) * speed, 0.004, target);
    const m = ref.current; if (!m) return;
    for (let i = 0; i < s.N; i++) { o.position.set(s.x[3 * i] - s.L / 2, s.x[3 * i + 1] - s.L / 2, s.x[3 * i + 2] - s.L / 2); o.updateMatrix(); m.setMatrixAt(i, o.matrix); }
    m.instanceMatrix.needsUpdate = true;
  });
  const L = sim.current.L;
  return (
    <>
      <ambientLight intensity={0.6} /><directionalLight position={[5, 8, 6]} intensity={1.4} />
      <instancedMesh ref={ref} args={[undefined, undefined, sim.current.N]} key={sim.current.N}><sphereGeometry args={[0.42, 14, 10]} /><meshStandardMaterial color="#7df9ff" roughness={0.4} /></instancedMesh>
      <lineSegments><edgesGeometry args={[new THREE.BoxGeometry(L, L, L)]} /><lineBasicMaterial color="#f5c76b" /></lineSegments>
      <OrbitControls makeDefault />
    </>
  );
}

const PRESETS = { solid: { rho: 1.1, T: 0.5 }, liquid: { rho: 0.8, T: 1.0 }, gas: { rho: 0.05, T: 2.0 } } as const;

function ForcesTab() {
  const { query } = useRoute();
  const preset = (query.get('state') as keyof typeof PRESETS) ?? 'liquid';
  const cfg = PRESETS[preset] ?? PRESETS.liquid;
  const [target, setTarget] = useState<number>(cfg.T);
  const [running, setRunning] = useState(true);
  const [speed, setSpeed] = useState(2);
  const sim = useRef<LJState>(createLJ(4, cfg.rho, cfg.T, 42));
  const [tick, setTick] = useState(0);
  useEffect(() => { sim.current = createLJ(4, cfg.rho, cfg.T, 42); setTarget(cfg.T); setTick((t) => t + 1); }, [preset]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { const id = setInterval(() => setTick((t) => t + 1), 500); return () => clearInterval(id); }, []);
  const s = sim.current;
  const g = useMemo(() => rdf(s, 50), [tick]); // eslint-disable-line react-hooks/exhaustive-deps
  const Vpts = useMemo(() => Array.from({ length: 160 }, (_, i) => { const r = 0.9 + i * 0.0125; return [r * ARGON.sigmaA, ljPotential(r) * ARGON.epsK] as [number, number]; }), []);
  return (
    <>
      <div className="center-stage">
      <div style={{ position: 'relative', height: 360, borderRadius: 12, overflow: 'hidden', border: '1px solid var(--line)' }}>
        <Viewport camera={{ position: [s.L * 1.3, s.L * 0.9, s.L * 1.5], fov: 40 }} key={`${preset}-${s.N}`}><LJParticles sim={sim} running={running} speed={speed} target={target} /></Viewport>
      </div>
      <div className="stage-grid">
        <div>
          <div className="section-title">Radial distribution g(r) <ProvenanceBadge cls="simulated" /></div>
          <LinePlot ariaLabel="Radial distribution function" series={[{ points: g.map(([r, v]) => [r * ARGON.sigmaA, v]), color: '#7df9ff' }]} xLabel="separation r (Å)" yLabel="g(r)" hLines={[{ y: 1, label: 'ideal gas', color: 'var(--text-dim)' }]} />
          <p className="note" style={{ fontSize: 10.5 }}>Sharp, repeating peaks mean crystalline order. A first peak with decaying ripples means a liquid. g ≈ 1 everywhere means a gas.</p>
        </div>
        <div>
          <div className="section-title">Lennard-Jones potential (argon) <ProvenanceBadge cls="derived" title="Parameters: Rahman 1964" /></div>
          <LinePlot ariaLabel="Lennard-Jones potential" series={[{ points: Vpts, color: '#f5c76b' }]} xLabel="separation r (Å)" yLabel="V(r)/k_B (K)" yDomain={[-140, 200]} hLines={[{ y: 0, label: '', color: 'var(--text-dim)' }]} vLines={[{ x: 2 ** (1 / 6) * ARGON.sigmaA, label: 'r_min = 2^{1/6}σ' }]} />
          <p className="note" style={{ fontSize: 10.5 }}>V = 4ε[(σ/r)¹² − (σ/r)⁶], with ε/k_B = 120 K and σ = 3.4 Å (<SourceLinks ids={['rahman-1964']} />). The r⁻⁶ term is the London dispersion attraction. The r⁻¹² repulsion is an empirical choice (Pauli repulsion is closer to exponential). There is no dipole or hydrogen-bond term, so this model fits noble gases, not water.</p>
        </div>
      </div>
      <span hidden>{tick}</span>
      </div>
      <LJControls preset={preset} target={target} setTarget={setTarget} running={running} setRunning={setRunning} speed={speed} setSpeed={setSpeed} s={s} />
    </>
  );
}

function LJControls({ preset, target, setTarget, running, setRunning, speed, setSpeed, s }: { preset: string; target: number; setTarget: (v: number) => void; running: boolean; setRunning: (f: (r: boolean) => boolean) => void; speed: number; setSpeed: (v: number) => void; s: LJState }) {
  return (
    <Panel id="lj-controls" className="right-panel" title="Lennard-Jones fluid">
      <div className="chip-row">{(['solid', 'liquid', 'gas'] as const).map((k) => <button key={k} className={`chip ${preset === k ? 'active' : ''}`} onClick={() => setQuery({ state: k })}>{k}</button>)}</div>
      <div className="slider-row"><span>T</span><input type="range" min={0.3} max={3} step={0.05} value={target} onChange={(e) => setTarget(Number(e.target.value))} aria-label="Thermostat temperature (reduced)" /><span style={{ fontFamily: 'var(--mono)' }}>{(target * ARGON.epsK).toFixed(0)} K</span></div>
      <div className="slider-row"><span>speed</span><input type="range" min={0.5} max={6} step={0.5} value={speed} onChange={(e) => setSpeed(Number(e.target.value))} aria-label="Simulated time per second" /><span style={{ fontFamily: 'var(--mono)' }}>{(speed * tauPs()).toFixed(1)} ps/s</span></div>
      <button className="icon-btn" onClick={() => setRunning((r) => !r)} aria-label={running ? 'Pause LJ simulation' : 'Run LJ simulation'}>{running ? '❚❚ Pause' : '▶ Run'}</button>
      <div className="section-title">Live observables (argon units) <ProvenanceBadge cls="simulated" /></div>
      <dl className="kv">
        <KV k="Particles" v={s.N} />
        <KV k="Simulated time" v={s.t * tauPs()} unit="ps" sig={4} />
        <KV k="Temperature" v={temperature(s) * ARGON.epsK} unit="K" sig={4} />
        <KV k="Density" v={densityGcc(s.N / s.L ** 3)} unit="g/cm³" sig={3} />
        <KV k="Reduced pressure P*" v={pressure(s)} sig={3} />
        <KV k="Mean-squared displacement" v={msd(s) * ARGON.sigmaA ** 2} unit="Å²" sig={3} />
      </dl>
      <p className="note warn">Qualitative model: {s.N} atoms, a 2.5σ cut-off and a Berendsen thermostat. It shows how dispersion forces produce solid, liquid and gas, but it does not predict real phase boundaries, sound speeds, refractive indices or thermal emission.</p>
      <p className="note">Playback speed only changes how fast you watch. Physics advances in fixed 0.004 τ steps of simulated time (τ = {tauPs().toFixed(2)} ps), whatever the frame rate.</p>
    </Panel>
  );
}

export default function PhasesView({ tab }: { tab: string | null }) {
  const { query } = useRoute();
  const s = (query.get('s') as Substance) === 'co2' ? 'co2' : 'water';
  const T = Number(query.get('T')), p = Number(query.get('p'));
  const probe = Number.isFinite(T) && T > 0 && Number.isFinite(p) && p > 0 ? { T, p } : null;
  const D = PHASE_DATA[s];
  return (
    <>
      <Panel id="phase-nav" className="left-panel" title="Phase behaviour">
        <div className="chip-row" style={{ marginBottom: 8 }}>
          <button className={`chip ${tab !== 'lj' ? 'active' : ''}`} onClick={() => navigate(`/atomic/phases?s=${s}`)}>Phase diagrams</button>
          <button className={`chip ${tab === 'lj' ? 'active' : ''}`} onClick={() => navigate('/atomic/phases/lj')}>Intermolecular forces</button>
        </div>
        {tab !== 'lj' && (
          <>
            <div className="mol-list" role="listbox" aria-label="Substance">
              {(['water', 'co2'] as const).map((k) => <button key={k} role="option" aria-selected={s === k} className={s === k ? 'active' : ''} onClick={() => setQuery({ s: k, T: null, p: null })}><span>{PHASE_DATA[k].name}</span></button>)}
            </div>
            <div className="section-title">Fixed points</div>
            <dl className="kv">
              <KV k="Triple point T" v={D.triple.T} unit="K" sig={6} />
              <KV k="Triple point p" v={D.triple.pPa} unit="Pa" sig={6} />
              <KV k="Critical point T" v={D.critical.T} unit="K" sig={6} />
              <KV k="Critical point p" v={D.critical.pMPa} unit="MPa" sig={5} />
              {s === 'co2' && PHASE_DATA.co2.tripleMeasured && <KV k="Triple point (TRC, measured)" v={`${PHASE_DATA.co2.tripleMeasured.T} K, ${formatSig(PHASE_DATA.co2.tripleMeasured.pPa, 4)} Pa`} />}
            </dl>
            <div className="section-title">Sources</div>
            <p className="note" style={{ fontSize: 10.5 }}>
              {s === 'water' ? <>Vaporisation: IAPWS SR1-86(1992). Melting and sublimation: IAPWS R14-08(2011), coefficients transcribed from the releases. Coexistence properties: IAPWS-95 via the NIST WebBook. <SourceLinks ids={['iapws-sr1-86', 'iapws-r14-08', 'wagner-pruss-2002', 'nist-webbook-fluids']} /></>
                : <>Vaporisation: Span–Wagner (1996) EOS via the NIST WebBook. Sublimation: Antoine fit (NIST) to Giauque & Egan (1937), {PHASE_DATA.co2.sublimation.validK.join('–')} K only. {PHASE_DATA.co2.meltingNote} <SourceLinks ids={['span-wagner-1996', 'nist-webbook-fluids', 'giauque-egan-1937']} /></>}
            </p>
            <p className="note" style={{ fontSize: 10.5 }}>Each curve is drawn only inside its stated validity range. Gaps stay gaps.</p>
          </>
        )}
        {tab === 'lj' && <p className="note">Atoms attract at long range (dispersion) and repel strongly at short range. Temperature sets how much kinetic energy competes with that attraction, so the same potential gives a crystal, a liquid or a gas.</p>}
      </Panel>
      {tab === 'lj' ? <ForcesTab /> : (
      <div className="center-stage">
          <>
            <div className="stage-head"><h1>Phase diagram — {D.name}</h1><p className="note">Click anywhere on the diagram to probe a temperature and pressure.</p></div>
            <PhaseDiagram s={s} probe={probe} onProbe={(t, pp) => setQuery({ T: t, p: pp })} />
          </>
      </div>
      )}
      {tab !== 'lj' && (
        <Panel id="phase-probe" className="right-panel" title="State">
          {probe ? <Probe s={s} T={probe.T} p={probe.p} /> : <p className="note">Click the diagram to probe a state.</p>}
          <p className="note" style={{ marginTop: 10 }}>This connects to wave propagation: the speed of sound jumps across a phase boundary, as the coexisting-phase table shows. Gate 4.5's wave laboratory uses these sourced sound speeds.</p>
        </Panel>
      )}
    </>
  );
}
