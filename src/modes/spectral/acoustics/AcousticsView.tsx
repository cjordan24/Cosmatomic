/**
 * Acoustic lab — #/spectral/acoustics?tab=level|boundary|moving   (Phase 9, Gate 9.5)
 *
 *  level    sound level from up to three point sources on a 20 m × 20 m floor (incoherent sum), listener probe:
 *           s = "x,y,P|…" (m, m, W), lx, ly (listener), med (medium id), T (K)
 *  boundary two media → acoustic impedances and the intensity reflection coefficient: m1, m2, T
 *  moving   a moving source: wavefronts, Mach cone, Doppler shifts: M (Mach number), f (Hz), T
 * Physics: src/core/physics/waves/acoustics.ts (Rayleigh, Theory of Sound; NASA Glenn; NIOSH 98-126; Homick, NASA RP-1045).
 */
import { useMemo } from 'react';
import { setQuery, useRoute } from '@/shared/router';
import { KV, Panel, ProvenanceBadge } from '@/ui/components';
import { SourceLinks } from '@/ui/SourcesView';
import { RelatedLinks } from '@/ui/RelatedLinks';
import { Probe } from '@/ui/instruments';
import { formatSig } from '@/core/units/units';
import { acousticMedia, coneAngle, dopplerShift, intensityAt, levelDb, pressureAmplitude, reflectedFraction, type AcousticMedium } from '@/core/physics/waves/acoustics';

type Tab = 'level' | 'boundary' | 'moving';
const TABS: [Tab, string][] = [['level', 'Sound level'], ['boundary', 'Impedance & boundaries'], ['moving', 'Moving sources']];
const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
const num = (q: URLSearchParams, k: string, d: number, a: number, b: number) => { const v = Number(q.get(k)); return q.has(k) && Number.isFinite(v) ? clamp(v, a, b) : d; };
const SPREAD = ['rayleigh-1896', 'homick-1979', 'niosh-98-126'], HOMICK = ['homick-1979'], RAY = ['rayleigh-1896'], GLENN = ['nasa-glenn-bga'];
/** Sound pressure levels of familiar sources, Homick (NASA RP-1045, 1979), p. 114, as printed (dB re 20 µPa). */
const HOMICK_SPL: [number, string][] = [[50, 'A business office'], [65, 'Speech at 0.9 meter (3 feet)'], [95, 'Subway at 6.1 meters (20 feet)'], [130, 'Jet aircraft at 10.7 meters (35 feet)'], [150, 'Atlas launch at 45.7 meters (150 feet)'], [172, 'On gantry during Saturn V launch']];
const P_REF = 2e-5;   // Pa, reference pressure of the sound pressure level (Homick: 2 × 10⁻⁵ N/m²)

function useMedia(T: number) { return useMemo(() => acousticMedia(T), [T]); }

// ------------------------------------------------------------------ level
const ROOM = 20;
function parseSources(s: string | null): [number, number, number][] {
  const out = (s ?? '').split('|').map((p) => p.split(',').map(Number)).filter((v) => v.length === 3 && v.every(Number.isFinite)).map(([x, y, P]) => [clamp(x, 0, ROOM), clamp(y, 0, ROOM), clamp(P, 1e-9, 100)] as [number, number, number]);
  return out.length ? out.slice(0, 3) : [[6, 10, 0.01]];
}
function LevelTab() {
  const { query } = useRoute();
  const T = num(query, 'T', 293, 250, 350);
  const media = useMedia(T);
  const med = media.find((m) => m.id === query.get('med')) ?? media[0];
  const srcs = parseSources(query.get('s'));
  const lx = num(query, 'lx', 14, 0, ROOM), ly = num(query, 'ly', 10, 0, ROOM);
  const levelAt = (x: number, y: number) => levelDb(srcs.reduce((s, [sx, sy, P]) => s + intensityAt(P, Math.max(0.05, Math.hypot(x - sx, y - sy))), 0));
  const N = 80, S = 420;
  const grid = useMemo(() => { const g: number[] = []; for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) g.push(levelAt(((i + 0.5) / N) * ROOM, ROOM - ((j + 0.5) / N) * ROOM)); return g; }, [query.get('s')]); // eslint-disable-line react-hooks/exhaustive-deps
  const L = levelAt(lx, ly), I = 1e-12 * 10 ** (L / 10);
  const dp = med.rho && med.v ? pressureAmplitude(I, med.rho, med.v) : null;
  const lo = Math.floor(Math.min(...grid) / 5) * 5, hi = Math.ceil(Math.max(...grid) / 5) * 5;
  const color = (b: number) => { const u = clamp((b - lo) / (hi - lo || 1), 0, 1); return `hsl(${240 - 240 * u}, 80%, ${25 + 35 * u}%)`; };
  const setSrc = (i: number, v: [number, number, number] | null) => { const n = [...srcs]; if (v) n[i] = v; else n.splice(i, 1); setQuery({ s: n.map((p) => p.map((x) => Number(x.toPrecision(4))).join(',')).join('|') }); };
  const spl = dp !== null ? 20 * Math.log10(dp / Math.SQRT2 / P_REF) : null;   // rms pressure of a sinusoid = Δp/√2
  const nearest = HOMICK_SPL.reduce((b, r) => (Math.abs(r[0] - (spl ?? L)) < Math.abs(b[0] - (spl ?? L)) ? r : b));
  return (
    <>
      <Panel id="ac-level-controls" className="left-panel" title="Sources">
        {srcs.map(([x, y, P], i) => (
          <div key={i} style={{ borderTop: '1px solid var(--line)', padding: '4px 0' }}>
            <div className="section-title">Source {i + 1} {srcs.length > 1 && <button className="link-btn" aria-label={`Remove source ${i + 1}`} onClick={() => setSrc(i, null)}>✕</button>}</div>
            <label className="slider-row"><span style={{ minWidth: 70 }}>power</span><input type="range" min={-6} max={1} step={0.1} value={Math.log10(P)} aria-label={`Acoustic power of source ${i + 1}`} onChange={(e) => setSrc(i, [x, y, 10 ** Number(e.target.value)])} /><span>{formatSig(P, 2)} W</span></label>
            <label className="slider-row"><span style={{ minWidth: 70 }}>x</span><input type="range" min={0} max={ROOM} step={0.1} value={x} aria-label={`x of source ${i + 1}`} onChange={(e) => setSrc(i, [Number(e.target.value), y, P])} /><span>{x.toFixed(1)} m</span></label>
            <label className="slider-row"><span style={{ minWidth: 70 }}>y</span><input type="range" min={0} max={ROOM} step={0.1} value={y} aria-label={`y of source ${i + 1}`} onChange={(e) => setSrc(i, [x, Number(e.target.value), P])} /><span>{y.toFixed(1)} m</span></label>
          </div>
        ))}
        {srcs.length < 3 && <button className="chip" onClick={() => setQuery({ s: [...srcs, [14, 4, 0.01]].map((p) => p.join(',')).join('|') })}>+ Add a source</button>}
        <div className="section-title">Medium (for the pressure amplitude)</div>
        <select className="text-input" aria-label="Medium" value={med.id} onChange={(e) => setQuery({ med: e.target.value })} style={{ width: '100%' }}>{media.filter((m) => m.Z).map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}</select>
        <label className="slider-row"><span style={{ minWidth: 70 }}>T</span><input type="range" min={250} max={350} step={1} value={T} aria-label="Temperature" onChange={(e) => setQuery({ T: e.target.value })} /><span>{T} K</span></label>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Sound level <ProvenanceBadge cls="derived" title="Inverse-square spreading of point sources; levels from I₀ = 10⁻¹² W/m²" /></h1>
          <p className="note">A point source spreads its sound equally in all directions, with amplitude falling inversely as the distance; the intensity, which goes as the square of the amplitude, falls as P/(4πr²), the inverse square law (Rayleigh §§245, 276; Homick). Doubling the distance quarters the intensity, 10 log₁₀ 4 = 6.0 dB lower. Levels are β = 10 log₁₀(I/I₀) with I₀ = 1 pW/m² = 10⁻¹² W/m² (NIOSH). In this model the sources are independent (incoherent), so their intensities add. Click the map to move the listener. <SourceLinks ids={SPREAD} /></p>
        </div>
        <svg viewBox={`0 0 ${S} ${S}`} role="img" aria-label="Sound level map" style={{ width: S, maxWidth: '100%', cursor: 'crosshair', borderRadius: 10 }}
          onClick={(e) => { const r = (e.currentTarget as SVGSVGElement).getBoundingClientRect(); setQuery({ lx: (((e.clientX - r.left) / r.width) * ROOM).toFixed(2), ly: ((1 - (e.clientY - r.top) / r.height) * ROOM).toFixed(2) }); }}>
          {grid.map((b, k) => <rect key={k} x={(k % N) * (S / N)} y={Math.floor(k / N) * (S / N)} width={S / N + 0.5} height={S / N + 0.5} fill={color(b)} />)}
          {srcs.map(([x, y], i) => <g key={i}><circle cx={(x / ROOM) * S} cy={S - (y / ROOM) * S} r={6} fill="#fff" /><text x={(x / ROOM) * S + 8} y={S - (y / ROOM) * S - 6} style={{ fill: '#fff', fontSize: 11 }}>{i + 1}</text></g>)}
          <circle cx={(lx / ROOM) * S} cy={S - (ly / ROOM) * S} r={7} fill="none" stroke="#5cf2a6" strokeWidth={2.5} />
        </svg>
        <div className="note" style={{ fontSize: 10.5, display: 'flex', gap: 6, alignItems: 'center' }}>{lo} dB<span style={{ display: 'inline-block', width: 180, height: 8, background: `linear-gradient(90deg, ${[0, 0.25, 0.5, 0.75, 1].map((u) => color(lo + (hi - lo) * u)).join(',')})` }} />{hi} dB · {ROOM} m × {ROOM} m, no walls or absorption</div>
      </div>
      <Panel id="ac-level-readout" className="right-panel" title="Listener">
        <Probe title="At the listener" ariaLabel="Sound at the listener" provenance="derived"
          where={[{ label: 'position', value: `${lx.toFixed(2)}, ${ly.toFixed(2)} m` }]}
          rows={[
            { label: 'sound level β', value: L, unit: 'dB', sig: 4 },
            { label: 'intensity I', value: I, unit: 'W/m²', sig: 3 },
            { label: `pressure amplitude in ${med.name}`, value: dp, unit: 'Pa', sig: 3, title: 'Δp_max = √(2ρvI), from Rayleigh §§244–245' },
            { label: 'sound pressure level (re 20 µPa, rms)', value: spl, unit: 'dB', sig: 4, title: 'SPL = 20 log₁₀(p_rms/p₀), p₀ = 2 × 10⁻⁵ N/m² (Homick), in the selected medium' },
            ...srcs.map(([x, y, P], i) => ({ label: `source ${i + 1} alone (${formatSig(Math.hypot(lx - x, ly - y), 3)} m)`, value: levelDb(intensityAt(P, Math.max(0.05, Math.hypot(lx - x, ly - y)))), unit: 'dB', sig: 4 })),
          ]}
          note={<>Closest sound pressure level in Homick’s list: {nearest[0]} dB, “{nearest[1]}”. <SourceLinks ids={HOMICK} /></>} />
        <details style={{ fontSize: 11 }}><summary>Sound pressure levels of familiar sources</summary>
          <table className="table-mini" aria-label="Familiar sound levels"><tbody>{HOMICK_SPL.map(([b, ex]) => <tr key={b} className={b === nearest[0] ? 'sel' : ''}><td>{b} dB</td><td style={{ fontFamily: 'var(--font)', textAlign: 'left' }}>{ex}</td></tr>)}</tbody></table>
          <p className="note">Homick (1979), NASA RP-1045, p. 114, as printed; sound pressure levels re 2 × 10⁻⁵ N/m². <SourceLinks ids={HOMICK} /></p></details>
        <RelatedLinks id="instrument:acoustic-lab" />
      </Panel>
    </>
  );
}

// ------------------------------------------------------------------ boundary
function BoundaryTab() {
  const { query } = useRoute();
  const T = num(query, 'T', 293, 250, 350);
  const media = useMedia(T).filter((m) => m.Z);
  const m1 = media.find((m) => m.id === query.get('m1')) ?? media.find((m) => m.id === 'air-ideal')!;
  const m2 = media.find((m) => m.id === query.get('m2')) ?? media.find((m) => m.id === 'water') ?? media[1];
  const a = reflectedFraction(m1.Z!, m2.Z!);
  const Sel = ({ k, m }: { k: 'm1' | 'm2'; m: AcousticMedium }) => <select className="text-input" aria-label={k === 'm1' ? 'First medium' : 'Second medium'} value={m.id} onChange={(e) => setQuery({ [k]: e.target.value })} style={{ width: '100%' }}>{media.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select>;
  const bar = (v: number, c: string) => <div style={{ height: 14, width: `${Math.max(0.5, v * 100)}%`, background: c, borderRadius: 3 }} />;
  return (
    <>
      <Panel id="ac-bound-controls" className="left-panel" title="Boundary">
        <div className="section-title">Sound arrives from</div><Sel k="m1" m={m1} />
        <div className="section-title">and meets</div><Sel k="m2" m={m2} />
        <label className="slider-row"><span style={{ minWidth: 60 }}>T</span><input type="range" min={250} max={350} step={1} value={T} aria-label="Temperature" onChange={(e) => setQuery({ T: e.target.value })} /><span>{T} K</span></label>
        <button className="chip" onClick={() => setQuery({ m1: 'air-ideal', m2: 'water' })}>Air → water</button>
        <button className="chip" onClick={() => setQuery({ m1: 'helium', m2: 'air-ideal' })}>Helium → air</button>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Acoustic impedance and reflection <ProvenanceBadge cls="derived" title="Normal-incidence reflection between two fluids (Rayleigh §270, eq. 23), written with Z = ρv" /></h1>
          <p className="note">When sound meets the boundary of a second fluid head-on, Rayleigh’s result for the reflected amplitude is (ρ₁/ρ − V/V₁) : (ρ₁/ρ + V/V₁), “so that there is no reflection, if ρ₁ : ρ = V : V₁” (§270). Written with the product Z = ρV of each medium (its acoustic impedance), the amplitude ratio is (Z₂ − Z₁)/(Z₂ + Z₁), and since intensity goes as the square of the amplitude the fraction reflected is a = (Z₂ − Z₁)²/(Z₁ + Z₂)²; the rest is transmitted. For air and water Rayleigh found the reflection “sensibly perfect”. <SourceLinks ids={RAY} /></p>
        </div>
        <table className="table-mini" aria-label="Media" style={{ maxWidth: 640 }}>
          <thead><tr><th>medium</th><th>ρ (kg/m³)</th><th>v (m/s)</th><th>Z (kg m⁻² s⁻¹)</th><th>source</th></tr></thead>
          <tbody>{[m1, m2].map((m, i) => <tr key={i}><td style={{ fontFamily: 'var(--font)' }}>{m.name}</td><td>{formatSig(m.rho!, 4)}</td><td>{formatSig(m.v!, 4)}</td><td>{formatSig(m.Z!, 4)}</td><td><SourceLinks ids={[m.source]} /></td></tr>)}</tbody>
        </table>
        <div style={{ maxWidth: 640, marginTop: 12 }} aria-label="Reflected and transmitted intensity" role="img">
          <div className="note">reflected {formatSig(a * 100, 4)} %</div>{bar(a, '#ff7a90')}
          <div className="note" style={{ marginTop: 6 }}>transmitted {formatSig((1 - a) * 100, 4)} %</div>{bar(1 - a, '#7df9ff')}
        </div>
        <p className="note" style={{ fontSize: 10.5 }}>{[m1, m2].map((m) => `${m.name}: ${m.note}`).join(' · ')}</p>
      </div>
      <Panel id="ac-bound-readout" className="right-panel" title="Result">
        <dl className="kv" aria-label="Boundary result">
          <KV k="Z₁" v={m1.Z} unit="kg/(m²·s)" sig={4} />
          <KV k="Z₂" v={m2.Z} unit="kg/(m²·s)" sig={4} />
          <KV k="impedance ratio Z₂/Z₁" v={m2.Z! / m1.Z!} sig={4} />
          <KV k="reflected fraction a" v={a} sig={4} />
          <KV k="transmitted fraction 1 − a" v={1 - a} sig={4} />
          <KV k="transmission loss" v={-10 * Math.log10(1 - a)} unit="dB" sig={3} />
        </dl>
        <p className="note" style={{ fontSize: 10.5 }}>Normal incidence on a flat boundary between two large media; no absorption. Fluids are NIST data at 1 atm; air is the ideal-gas model. <SourceLinks ids={[...RAY, 'nist-webbook-fluids']} /></p>
        <RelatedLinks id="instrument:acoustic-lab" />
      </Panel>
    </>
  );
}

// ------------------------------------------------------------------ moving sources
function MovingTab() {
  const { query } = useRoute();
  const T = num(query, 'T', 293, 200, 400), M = num(query, 'M', 0.5, 0, 3), f = num(query, 'f', 440, 20, 5000);
  const media = useMedia(T);
  const v = media.find((m) => m.id === 'air-ideal')!.v!;
  const vs = M * v;
  const ahead = dopplerShift(f, v, vs, 0), behind = dopplerShift(f, v, -vs, 0);
  const cone = coneAngle(M);
  const W = 680, H = 300, scale = 18;   // pixels per unit of v·Δt
  const n = 9, sx = W * 0.72;
  return (
    <>
      <Panel id="ac-moving-controls" className="left-panel" title="Source">
        <label className="slider-row"><span style={{ minWidth: 80 }}>Mach M</span><input type="range" min={0} max={3} step={0.01} value={M} aria-label="Mach number" onChange={(e) => setQuery({ M: e.target.value })} /><span>{M.toFixed(2)}</span></label>
        <label className="slider-row"><span style={{ minWidth: 80 }}>emitted f</span><input type="range" min={20} max={5000} step={1} value={f} aria-label="Emitted frequency" onChange={(e) => setQuery({ f: e.target.value })} /><span>{f} Hz</span></label>
        <label className="slider-row"><span style={{ minWidth: 80 }}>air T</span><input type="range" min={200} max={400} step={1} value={T} aria-label="Air temperature" onChange={(e) => setQuery({ T: e.target.value })} /><span>{T} K</span></label>
        <p className="note" style={{ fontSize: 10.5 }}>Speed of sound from the ideal-gas air model of the wave engine, a² = γRT with γ = 1.4. The SR-71 was designed to cruise at Mach 3.2. <SourceLinks ids={[...GLENN, 'nasa-dfrc-sr71']} /></p>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Moving sources and shock waves <ProvenanceBadge cls="derived" title="Doppler shift of a moving source and Mach angle sin μ = 1/M (NASA Glenn)" /></h1>
          <p className="note">A source moving at speed v_s emits each wavefront from a new position. Ahead of it the fronts crowd together and the frequency heard is f a/(a − u); behind it they spread out, f a/(a + u) (NASA Glenn). Faster than sound (M = v_s/v &gt; 1) the fronts lie inside a cone whose half-angle θ obeys sin θ = 1/M. That shock cone extends to the ground; as it spreads along the flight path it makes a continuous sonic boom along the full width of its base (NASA Dryden). <SourceLinks ids={[...GLENN, 'nasa-dfrc-sonic-booms']} /></p>
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Wavefronts of a moving source" style={{ width: '100%', maxWidth: W, background: '#03050c', borderRadius: 10, border: '1px solid var(--line)' }}>
          {Array.from({ length: n }, (_, k) => { const age = n - k; const x = sx - M * age * scale; return <circle key={k} cx={x} cy={H / 2} r={age * scale} fill="none" stroke="#7df9ff" strokeOpacity={0.25 + 0.75 * (k / n)} />; })}
          {cone && <><line x1={sx} y1={H / 2} x2={sx - 600 * Math.cos(cone)} y2={H / 2 - 600 * Math.sin(cone)} stroke="#ff7a90" strokeWidth={2} /><line x1={sx} y1={H / 2} x2={sx - 600 * Math.cos(cone)} y2={H / 2 + 600 * Math.sin(cone)} stroke="#ff7a90" strokeWidth={2} /></>}
          <circle cx={sx} cy={H / 2} r={5} fill="#f5c76b" />
          <text x={sx + 10} y={H / 2 - 8} style={{ fill: '#f5c76b', fontSize: 11 }}>source → v_s</text>
        </svg>
      </div>
      <Panel id="ac-moving-readout" className="right-panel" title="Shifts">
        <dl className="kv" aria-label="Moving source">
          <KV k="speed of sound v" v={v} unit="m/s" sig={4} />
          <KV k="source speed v_s" v={vs} unit="m/s" sig={4} />
          <KV k="heard ahead (approaching)" v={ahead} unit="Hz" sig={5} />
          <KV k="heard behind (receding)" v={behind} unit="Hz" sig={5} />
          <KV k="Mach-cone half-angle θ" v={cone !== null ? (cone * 180) / Math.PI : 'no cone (M ≤ 1)'} unit={cone !== null ? '°' : undefined} sig={4} />
        </dl>
        <p className="note" style={{ fontSize: 10.5 }}>f_o = f_s v/(v ∓ v_s) for a stationary observer; at or above the speed of sound the formula has no finite value ahead of the source, so it shows “unknown”. <SourceLinks ids={GLENN} /></p>
        <RelatedLinks id="instrument:acoustic-lab" />
      </Panel>
    </>
  );
}

export default function AcousticsView() {
  const { query } = useRoute();
  const tab: Tab = TABS.find(([t]) => t === query.get('tab'))?.[0] ?? 'level';
  return (
    <>
      <nav className="view-switch" aria-label="Acoustic lab sections">
        {TABS.map(([t, label]) => <button key={t} className={tab === t ? 'active' : ''} onClick={() => setQuery({ tab: t === 'level' ? null : t })}>{label}</button>)}
      </nav>
      {tab === 'boundary' ? <BoundaryTab /> : tab === 'moving' ? <MovingTab /> : <LevelTab />}
    </>
  );
}
