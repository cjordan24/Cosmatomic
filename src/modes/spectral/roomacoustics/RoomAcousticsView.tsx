/**
 * Room acoustics & resonance — #/spectral/roomacoustics?tab=modes|reverb|fdtd   (Phase 9, Gate 9.7)
 *
 *  modes   normal modes of a rigid rectangular room (Rayleigh §267): dims "L,W,H" (m), T (K), sel = "p,q,r", fmax (Hz)
 *  reverb  Sabine's reverberation time t = 0.164 V/a with his measured absorption coefficients (512 vibrations/s)
 *  fdtd    2-D finite-difference pressure field in the floor plan; a probe's spectrum against the analytic modes
 * Physics: src/core/physics/waves/roomAcoustics.ts; speed of sound from the ideal-gas air model.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { navigate, setQuery, useRoute } from '@/shared/router';
import { KV, Panel, ProvenanceBadge } from '@/ui/components';
import { SourceLinks } from '@/ui/SourcesView';
import { RelatedLinks } from '@/ui/RelatedLinks';
import { LinePlot } from '@/ui/plots';
import { formatSig } from '@/core/units/units';
import { getMedium } from '@/core/physics/waves/media';
import { amplitudeSpectrum } from '@/core/physics/signals/dsp';
import { SABINE_COEFFICIENTS, SABINE_K, absorbingPower, addPulse, createFdtd, modeShape, roomModes, sabineTime, sampleAt, stepFdtd, type Mode, type RoomDims } from '@/core/physics/waves/roomAcoustics';
import { audioSampleRate, playSamples } from '@/ui/audio';

type Tab = 'modes' | 'reverb' | 'fdtd';
const TABS: [Tab, string][] = [['modes', 'Room modes'], ['reverb', 'Reverberation'], ['fdtd', 'Wave simulation']];
const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
const num = (q: URLSearchParams, k: string, d: number, a: number, b: number) => { const v = Number(q.get(k)); return q.has(k) && Number.isFinite(v) ? clamp(v, a, b) : d; };
const R = ['rayleigh-1896'], S = ['sabine-1922'];
const KIND_COLOR = { axial: '#f5c76b', tangential: '#7df9ff', oblique: '#b18cff' } as const;

function useRoom() {
  const { query } = useRoute();
  const parts = (query.get('dims') ?? '').split(',').map(Number);
  const d: RoomDims = parts.length === 3 && parts.every(Number.isFinite) ? { L: clamp(parts[0], 1, 40), W: clamp(parts[1], 1, 40), H: clamp(parts[2], 1, 15) } : { L: 6, W: 5, H: 3 };
  const T = num(query, 'T', 293, 250, 330);
  const c = getMedium('air').speed({ temperatureK: T, tensionN: 0, linearDensity: 0 })!;
  return { d, T, c, query };
}
function DimsControls({ d, T }: { d: RoomDims; T: number }) {
  const set = (k: keyof RoomDims, v: number) => setQuery({ dims: [k === 'L' ? v : d.L, k === 'W' ? v : d.W, k === 'H' ? v : d.H].map((x) => Number(x.toFixed(2))).join(',') });
  return (
    <>
      {(['L', 'W', 'H'] as const).map((k) => <label key={k} className="slider-row"><span style={{ minWidth: 70 }}>{k === 'L' ? 'length' : k === 'W' ? 'width' : 'height'}</span><input type="range" min={1} max={k === 'H' ? 15 : 40} step={0.05} value={d[k]} aria-label={`Room ${k === 'L' ? 'length' : k === 'W' ? 'width' : 'height'}`} onChange={(e) => set(k, Number(e.target.value))} /><span>{d[k].toFixed(2)} m</span></label>)}
      <label className="slider-row"><span style={{ minWidth: 70 }}>air T</span><input type="range" min={250} max={330} step={1} value={T} aria-label="Air temperature" onChange={(e) => setQuery({ T: e.target.value })} /><span>{T} K</span></label>
    </>
  );
}

// ------------------------------------------------------------------ modes
function ModesTab() {
  const { d, T, c, query } = useRoom();
  const fmax = num(query, 'fmax', 200, 30, 500);
  const modes = useMemo(() => roomModes(d, c, fmax), [d.L, d.W, d.H, c, fmax]); // eslint-disable-line react-hooks/exhaustive-deps
  const selKey = query.get('sel') ?? '1,0,0';
  const sel: Mode = modes.find((m) => `${m.p},${m.q},${m.r}` === selKey) ?? modes[0];
  const z = num(query, 'z', 1.2, 0, d.H);
  const N = 60, SZ = 360, H = Math.round((SZ * d.W) / d.L);
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current; if (!cv || !sel) return;
    const g = cv.getContext('2d')!, ny = Math.max(4, Math.round((N * d.W) / d.L)), img = g.createImageData(N, ny);
    for (let j = 0; j < ny; j++) for (let i = 0; i < N; i++) {
      const v = modeShape(d, sel, ((i + 0.5) / N) * d.L, ((ny - 1 - j + 0.5) / ny) * d.W, z), o = 4 * (j * N + i);
      img.data[o] = v > 0 ? 255 * v : 30; img.data[o + 1] = 40; img.data[o + 2] = v < 0 ? -255 * v : 30; img.data[o + 3] = 255;
    }
    const off = document.createElement('canvas'); off.width = N; off.height = ny; off.getContext('2d')!.putImageData(img, 0, 0);
    g.imageSmoothingEnabled = true; g.drawImage(off, 0, 0, SZ, H);
  }, [sel, d, z, H]);
  const counts = { axial: modes.filter((m) => m.kind === 'axial').length, tangential: modes.filter((m) => m.kind === 'tangential').length, oblique: modes.filter((m) => m.kind === 'oblique').length };
  return (
    <>
      <Panel id="ra-modes-controls" className="left-panel" title="Room">
        <DimsControls d={d} T={T} />
        <label className="slider-row"><span style={{ minWidth: 70 }}>up to</span><input type="range" min={30} max={500} step={5} value={fmax} aria-label="Highest frequency listed" onChange={(e) => setQuery({ fmax: e.target.value })} /><span>{fmax} Hz</span></label>
        <label className="slider-row"><span style={{ minWidth: 70 }}>slice z</span><input type="range" min={0} max={d.H} step={0.05} value={z} aria-label="Height of the slice" onChange={(e) => setQuery({ z: e.target.value })} /><span>{z.toFixed(2)} m</span></label>
        <dl className="kv" aria-label="Room">
          <KV k="speed of sound" v={c} unit="m/s" sig={4} title="Ideal-gas dry air (wave engine)" />
          <KV k="volume" v={d.L * d.W * d.H} unit="m³" sig={4} />
          <KV k="modes below the limit" v={`${modes.length} (${counts.axial} axial, ${counts.tangential} tangential, ${counts.oblique} oblique)`} />
        </dl>
        <button className="chip" onClick={() => navigate(`/spectral/room?dims=${d.L},${d.W},${d.H}`)}>Same room for radio waves →</button>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Normal modes of a room <ProvenanceBadge cls="derived" title="Rayleigh, Theory of Sound Vol. II §267" /></h1>
          <p className="note">In a closed rectangular box with rigid walls the air can vibrate only at frequencies f = (c/2)√((p/L)² + (q/W)² + (r/H)²) with whole numbers p, q, r; the pressure pattern of each is a product of cosines, with the walls always at pressure maxima. The gravest mode runs along the longest edge (Rayleigh §267). <SourceLinks ids={R} /></p>
        </div>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div><div className="section-title">Mode ({sel?.p}, {sel?.q}, {sel?.r}) at z = {z.toFixed(2)} m, {formatSig(sel?.f ?? NaN, 4)} Hz</div>
            <canvas ref={ref} width={SZ} height={H} aria-label="Mode pressure pattern (top view)" style={{ borderRadius: 8, border: '1px solid var(--line)' }} />
            <p className="note" style={{ fontSize: 10.5 }}>Red and blue: pressure above and below ambient at one instant (they swap every half period); dark lines: nodes.</p></div>
          <div style={{ flex: '1 1 300px', maxWidth: 380 }}>
            <LinePlot ariaLabel="Mode frequencies" width={380} height={220} xLabel="frequency (Hz)" yLabel="mode number" legend="br" series={(['axial', 'tangential', 'oblique'] as const).map((k) => ({ points: modes.map((m, i) => [m.f, m.kind === k ? i + 1 : NaN] as [number, number]).filter((p) => Number.isFinite(p[1])), color: KIND_COLOR[k], label: k }))} />
            <p className="note" style={{ fontSize: 10.5 }}>Modes crowd together as the frequency rises.</p>
          </div>
        </div>
      </div>
      <Panel id="ra-modes-list" className="right-panel" title="Modes">
        <table className="table-mini" aria-label="Room modes"><thead><tr><th>(p,q,r)</th><th>type</th><th>f (Hz)</th></tr></thead>
          <tbody>{modes.slice(0, 40).map((m) => { const k = `${m.p},${m.q},${m.r}`; return <tr key={k} className={sel && k === `${sel.p},${sel.q},${sel.r}` ? 'sel' : ''} style={{ cursor: 'pointer' }} onClick={() => setQuery({ sel: k })}><td>({k})</td><td style={{ color: KIND_COLOR[m.kind], fontFamily: 'var(--font)' }}>{m.kind}</td><td>{formatSig(m.f, 4)}</td></tr>; })}</tbody></table>
        <button className="chip" style={{ marginTop: 6 }} onClick={() => { if (!sel) return; const fs = audioSampleRate(), n = fs * 2, o = new Float32Array(n); for (let i = 0; i < n; i++) o[i] = Math.sin(2 * Math.PI * sel.f * i / fs); playSamples(o, fs); }}>🔊 Play this mode's frequency</button>
        <RelatedLinks id="instrument:room-acoustics" />
      </Panel>
    </>
  );
}

// ------------------------------------------------------------------ reverberation
const FACES = ['floor', 'ceiling', 'walls'] as const;
function ReverbTab() {
  const { d, T, query } = useRoom();
  const pick = (k: string, def: string) => SABINE_COEFFICIENTS.find((x) => x.id === query.get(k) && x.per === 'm²') ?? SABINE_COEFFICIENTS.find((x) => x.id === def)!;
  const floor = pick('floor', 'wood-sheathing'), ceiling = pick('ceiling', 'plaster-wire-lath'), walls = pick('walls', 'plaster-wood-lath');
  const people = Math.round(num(query, 'people', 0, 0, 2000)), win = num(query, 'win', 0, 0, 200);
  const Af = d.L * d.W, Aw = 2 * (d.L + d.W) * d.H, V = d.L * d.W * d.H;
  const surfaces = [
    { label: `floor: ${floor.label}`, area: Af, coefficient: floor.value },
    { label: `ceiling: ${ceiling.label}`, area: Af, coefficient: ceiling.value },
    { label: `walls: ${walls.label}`, area: Math.max(0, Aw - win), coefficient: walls.value },
    { label: 'open windows', area: win, coefficient: 1 },
    { label: 'audience', area: people, coefficient: SABINE_COEFFICIENTS.find((x) => x.id === 'audience-person')!.value },
  ];
  const a = absorbingPower(surfaces), t = sabineTime(V, a);
  const curve = Array.from({ length: 101 }, (_, i) => { const tt = (i / 100) * Math.min(3 * t, 30); return [tt, -60 * (tt / t)] as [number, number]; });
  const Sel = ({ k, v }: { k: typeof FACES[number]; v: typeof floor }) => <select className="text-input" aria-label={`Material of the ${k}`} value={v.id} onChange={(e) => setQuery({ [k]: e.target.value })} style={{ width: '100%' }}>{SABINE_COEFFICIENTS.filter((x) => x.per === 'm²').map((x) => <option key={x.id} value={x.id}>{x.label} ({x.value})</option>)}</select>;
  return (
    <>
      <Panel id="ra-reverb-controls" className="left-panel" title="Room and surfaces">
        <DimsControls d={d} T={T} />
        {FACES.map((k) => <div key={k}><div className="section-title">{k}</div><Sel k={k} v={k === 'floor' ? floor : k === 'ceiling' ? ceiling : walls} /></div>)}
        <label className="slider-row"><span style={{ minWidth: 90 }}>audience</span><input type="range" min={0} max={500} step={1} value={people} aria-label="Number of people" onChange={(e) => setQuery({ people: e.target.value })} /><span>{people}</span></label>
        <label className="slider-row"><span style={{ minWidth: 90 }}>open windows</span><input type="range" min={0} max={Math.min(200, Aw)} step={0.5} value={win} aria-label="Open window area" onChange={(e) => setQuery({ win: e.target.value })} /><span>{win} m²</span></label>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Reverberation time <ProvenanceBadge cls="derived" title="Sabine, Collected Papers on Acoustics (1922): t = 0.164 V/a" /></h1>
          <p className="note">Sabine measured how long sound stays audible in a room after a source producing 10⁶ times the minimum audible intensity stops (a 60 dB decay) and found t = {SABINE_K} V/a, with V the volume in m³ and a the absorbing power: each surface's area times its coefficient, in units of one square metre of open window (Sabine, Collected Papers on Acoustics). His coefficients were measured at 512 vibrations per second. <SourceLinks ids={S} /></p>
        </div>
        <LinePlot ariaLabel="Sound level decay" width={720} height={240} xLabel="time after the source stops (s)" yLabel="level relative to start (dB)" yDomain={[-80, 2]} hLines={[{ y: -60, label: '−60 dB (10⁶ in intensity)' }]} series={[{ points: curve, color: '#7df9ff', label: 'steady decay, 60 dB in t' }]} vLines={[{ x: t, label: `t = ${formatSig(t, 3)} s` }]} />
        <table className="table-mini" aria-label="Absorbing power" style={{ maxWidth: 640 }}><thead><tr><th>surface</th><th>area or count</th><th>coefficient</th><th>absorbing power</th></tr></thead>
          <tbody>{surfaces.map((s) => <tr key={s.label}><td style={{ fontFamily: 'var(--font)' }}>{s.label}</td><td>{formatSig(s.area, 4)}</td><td>{s.coefficient}</td><td>{formatSig(s.area * s.coefficient, 3)}</td></tr>)}</tbody></table>
      </div>
      <Panel id="ra-reverb-readout" className="right-panel" title="Result">
        <dl className="kv" aria-label="Reverberation">
          <KV k="volume V" v={V} unit="m³" sig={4} />
          <KV k="absorbing power a" v={a} unit="m² (open window)" sig={4} />
          <KV k="reverberation time" v={t} unit="s" sig={3} />
        </dl>
        <p className="note" style={{ fontSize: 10.5 }}>Sabine's tables (as printed): open window 1.000; hard-pine sheathing .061; plaster on wood lath .034; on wire lath .033; glass .027; plaster on tile .025; brick in Portland cement .025; an audience .44 per person. <SourceLinks ids={S} /></p>
        <div className="section-title">Validity</div>
        <ul className="note" style={{ paddingLeft: 16, fontSize: 10.5 }}><li>Diffuse sound field; all coefficients at one pitch (512 vibrations per second)</li><li>Only Sabine's formula is included; other reverberation formulas are not</li><li>Air absorption is not included</li></ul>
        <RelatedLinks id="instrument:room-acoustics" />
      </Panel>
    </>
  );
}

// ------------------------------------------------------------------ FDTD
function FdtdTab() {
  const { d, T, c } = useRoom();
  const ref = useRef<HTMLCanvasElement>(null);
  const [run, setRun] = useState(0);
  const [spec, setSpec] = useState<{ f: number[]; amp: number[] } | null>(null);
  const nx = 72, SZ = 420, Hc = Math.round((SZ * d.W) / d.L);
  const modes2d = useMemo(() => roomModes({ L: d.L, W: d.W, H: 1e-9 }, c, 400).filter((m) => m.r === 0).slice(0, 12), [d.L, d.W, c]);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const s = createFdtd(d.L, d.W, nx, c, 0.5);
    addPulse(s, d.L * 0.23, d.W * 0.31, Math.min(d.L, d.W) / 25);
    const probe = [d.L * 0.87, d.W * 0.83];
    const nRec = 8192, rec = new Float64Array(nRec);
    const fTop = (modes2d[modes2d.length - 1]?.f ?? 100) * 1.1;
    let k = 0, raf = 0;
    const g = cv.getContext('2d')!, img = g.createImageData(s.nx, s.ny), off = document.createElement('canvas'); off.width = s.nx; off.height = s.ny;
    const draw = () => {
      let m = 1e-9; for (const v of s.p) m = Math.max(m, Math.abs(v));
      for (let j = 0; j < s.ny; j++) for (let i = 0; i < s.nx; i++) { const v = s.p[j * s.nx + i] / m, o = 4 * ((s.ny - 1 - j) * s.nx + i); img.data[o] = v > 0 ? 255 * Math.sqrt(v) : 10; img.data[o + 1] = 20; img.data[o + 2] = v < 0 ? 255 * Math.sqrt(-v) : 10; img.data[o + 3] = 255; }
      off.getContext('2d')!.putImageData(img, 0, 0); g.imageSmoothingEnabled = true; g.drawImage(off, 0, 0, SZ, Hc);
      g.strokeStyle = '#5cf2a6'; g.lineWidth = 2; g.beginPath(); g.arc((probe[0] / d.L) * SZ, Hc - (probe[1] / d.W) * Hc, 6, 0, 2 * Math.PI); g.stroke();
    };
    const loop = () => {
      for (let n = 0; n < 400 && k < nRec; n++, k++) { stepFdtd(s); rec[k] = sampleAt(s, probe[0], probe[1]); }
      draw();
      if (k < nRec) raf = requestAnimationFrame(loop);
      else { const sp = amplitudeSpectrum(rec, 1 / s.dt, 'hann'); const f: number[] = [], amp: number[] = []; for (let i = 1; i < sp.f.length && sp.f[i] <= fTop; i++) { f.push(sp.f[i]); amp.push(20 * Math.log10(sp.amp[i] + 1e-12)); } setSpec({ f, amp }); }
    };
    setSpec(null); raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [d.L, d.W, c, run, Hc, modes2d]);
  return (
    <>
      <Panel id="ra-fdtd-controls" className="left-panel" title="Simulation">
        <DimsControls d={d} T={T} />
        <button className="chip" onClick={() => setRun((r) => r + 1)}>↻ Clap again</button>
        <p className="note" style={{ fontSize: 10.5 }}>A short pressure pulse (a “clap”) in the floor plan of the room, solved with an explicit finite-difference scheme at Courant number 0.5, {nx} cells along the length, rigid walls (zero normal pressure gradient, Rayleigh's wall condition). 8192 time steps are recorded at the green probe.</p>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Sound bouncing in a room <ProvenanceBadge cls="simulated" title="Numerical solution of the 2-D wave equation; compared with the analytic modes" /></h1>
          <p className="note">The pulse spreads, reflects from the walls and settles into a mixture of the room's modes. The spectrum of the probe signal peaks at the analytic mode frequencies of the floor plan (r = 0 modes of Rayleigh §267), a check of the numerical solver. <SourceLinks ids={R} /></p>
        </div>
        <canvas ref={ref} width={SZ} height={Hc} aria-label="Pressure field (top view)" style={{ borderRadius: 8, border: '1px solid var(--line)' }} />
        {spec ? <LinePlot ariaLabel="Probe spectrum and analytic modes" width={720} height={220} xLabel="frequency (Hz)" yLabel="probe spectrum (dB)" series={[{ points: spec.f.map((f, i) => [f, spec.amp[i]] as [number, number]), color: '#7df9ff', width: 1.2 }]} vLines={modes2d.map((m) => ({ x: m.f, label: `${m.p},${m.q}`, color: KIND_COLOR[m.kind] }))} />
          : <p className="note" role="status">Simulating…</p>}
      </div>
      <Panel id="ra-fdtd-readout" className="right-panel" title="Floor-plan modes">
        <table className="table-mini" aria-label="Floor-plan modes"><thead><tr><th>(p,q)</th><th>f (Hz)</th></tr></thead><tbody>{modes2d.map((m) => <tr key={`${m.p},${m.q}`}><td>({m.p},{m.q})</td><td>{formatSig(m.f, 4)}</td></tr>)}</tbody></table>
        <p className="note" style={{ fontSize: 10.5 }}>Two-dimensional, lossless and rigid: the field never decays here, unlike a real room. Small differences between the peaks and the lines come from the finite grid.</p>
        <RelatedLinks id="instrument:room-acoustics" />
      </Panel>
    </>
  );
}

export default function RoomAcousticsView() {
  const { query } = useRoute();
  const tab: Tab = TABS.find(([t]) => t === query.get('tab'))?.[0] ?? 'modes';
  return (
    <>
      <nav className="view-switch" aria-label="Room acoustics sections">
        {TABS.map(([t, label]) => <button key={t} className={tab === t ? 'active' : ''} onClick={() => setQuery({ tab: t === 'modes' ? null : t })}>{label}</button>)}
      </nav>
      {tab === 'reverb' ? <ReverbTab /> : tab === 'fdtd' ? <FdtdTab /> : <ModesTab />}
    </>
  );
}
