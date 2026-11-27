/**
 * Modulation lab — #/spectral/modulation?tab=analog|digital|capacity   (Phase 9, Gate 9.4)
 *
 *  analog   AM (Johnson §6.11) or FM (47 CFR §73.310; lines J_n(β), DLMF 10.12.1) with a tone message:
 *           kind=am|fm, fc, fm (Hz), m (AM index), dev (FM peak deviation, Hz)
 *  digital  BPSK or FSK through white noise, correlation receiver, measured vs theoretical bit-error rate
 *           (Johnson §§6.14–6.18): sch=bpsk|fsk, eb (E_b/N₀ dB), n (bits)
 *  capacity C = W log₂(1 + SNR) (Johnson §6.31): W (Hz), snr (dB)
 * Signals are computed in src/core/physics/signals/modulation.ts; spectra with the FFT of dsp.ts.
 */
import { useMemo, useState } from 'react';
import { setQuery, useRoute } from '@/shared/router';
import { KV, Panel, ProvenanceBadge } from '@/ui/components';
import { SourceLinks } from '@/ui/SourcesView';
import { RelatedLinks } from '@/ui/RelatedLinks';
import { LinePlot } from '@/ui/plots';
import { formatSig } from '@/core/units/units';
import { amplitudeSpectrum } from '@/core/physics/signals/dsp';
import { amSignal, capacity, fmBandwidth, fmLines, fmSignal, simulate, theoreticalBer, type Scheme } from '@/core/physics/signals/modulation';

type Tab = 'analog' | 'digital' | 'capacity';
const TABS: [Tab, string][] = [['analog', 'AM & FM'], ['digital', 'Digital (BPSK, FSK)'], ['capacity', 'Channel capacity']];
const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
const num = (q: URLSearchParams, k: string, d: number, a: number, b: number) => { const v = Number(q.get(k)); return q.has(k) && Number.isFinite(v) ? clamp(v, a, b) : d; };
const J = ['johnson-fundamentals-ee'];
const dB = (x: number) => 20 * Math.log10(Math.max(x, 1e-9));

// ------------------------------------------------------------------ analog
function AnalogTab() {
  const { query } = useRoute();
  const kind = query.get('kind') === 'fm' ? 'fm' : 'am';
  const fc = num(query, 'fc', 10000, 2000, 30000), fm = num(query, 'fm', 500, 50, 3000);
  const m = num(query, 'm', 0.6, 0, 1.5), dev = num(query, 'dev', 1000, 0, 20000);
  const beta = dev / fm;
  const fs = 131072, N = 65536;
  const sig = useMemo(() => {
    const f = kind === 'am' ? amSignal(1, (t) => m * Math.cos(2 * Math.PI * fm * t), fc) : fmSignal(1, fc, fm, dev);
    return Float64Array.from({ length: N }, (_, i) => f(i / fs));
  }, [kind, fc, fm, m, dev]);
  const spec = useMemo(() => amplitudeSpectrum(sig, fs, 'hann'), [sig]);
  const span = kind === 'am' ? Math.max(4 * fm, 1500) : Math.max(1.6 * (dev + 3 * fm), 2000);
  const lo = Math.max(0, fc - span), hi = fc + span;
  const specPts = useMemo(() => { const out: [number, number][] = []; for (let k = 0; k < spec.f.length; k++) if (spec.f[k] >= lo && spec.f[k] <= hi) out.push([spec.f[k] / 1000, dB(spec.amp[k])]); return out; }, [spec, lo, hi]);
  const periods = 3 / fm;
  const wave = useMemo(() => { const out: [number, number][] = [], msg: [number, number][] = []; const n = Math.min(N, Math.round(periods * fs)); const step = Math.max(1, Math.floor(n / 1600)); for (let i = 0; i < n; i += step) { out.push([(i / fs) * 1000, sig[i]]); msg.push([(i / fs) * 1000, kind === 'am' ? 1 + m * Math.cos(2 * Math.PI * fm * (i / fs)) : Math.sin(2 * Math.PI * fm * (i / fs))]); } return { out, msg }; }, [sig, periods, kind, m, fm]);
  const lines = kind === 'fm' ? fmLines(beta, 30).filter((l) => Math.abs(l.amp) > 1e-3) : [];
  const bw = kind === 'fm' ? fmBandwidth(beta, fm) : null;
  const sidebandShare = (m * m / 2) / (1 + m * m / 2);
  return (
    <>
      <Panel id="mod-analog-controls" className="left-panel" title="Modulation">
        <div className="chip-row" role="radiogroup" aria-label="Modulation type" style={{ marginBottom: 6 }}>
          <button role="radio" aria-checked={kind === 'am'} className={`chip ${kind === 'am' ? 'active' : ''}`} onClick={() => setQuery({ kind: null })}>AM</button>
          <button role="radio" aria-checked={kind === 'fm'} className={`chip ${kind === 'fm' ? 'active' : ''}`} onClick={() => setQuery({ kind: 'fm' })}>FM</button>
        </div>
        <label className="slider-row"><span style={{ minWidth: 90 }}>carrier f_c</span><input type="range" min={2000} max={30000} step={100} value={fc} aria-label="Carrier frequency" onChange={(e) => setQuery({ fc: e.target.value })} /><span>{formatSig(fc / 1000, 3)} kHz</span></label>
        <label className="slider-row"><span style={{ minWidth: 90 }}>message f_m</span><input type="range" min={50} max={3000} step={10} value={fm} aria-label="Message frequency" onChange={(e) => setQuery({ fm: e.target.value })} /><span>{fm} Hz</span></label>
        {kind === 'am'
          ? <label className="slider-row"><span style={{ minWidth: 90 }}>index m</span><input type="range" min={0} max={1.5} step={0.01} value={m} aria-label="Modulation index" onChange={(e) => setQuery({ m: e.target.value })} /><span>{m.toFixed(2)}</span></label>
          : <label className="slider-row"><span style={{ minWidth: 90 }}>deviation Δf</span><input type="range" min={0} max={20000} step={10} value={dev} aria-label="Peak frequency deviation" onChange={(e) => setQuery({ dev: e.target.value })} /><span>{formatSig(dev, 4)} Hz</span></label>}
        {kind === 'am' && m >= 1 && <p className="note" role="status" style={{ color: 'var(--warn)', fontSize: 11 }}>m ≥ 1: the envelope 1 + m cos 2πf_m t reaches zero or goes negative, breaking the condition |m(t)| &lt; 1 that Johnson states for AM (over-modulation).</p>}
        <p className="note" style={{ fontSize: 10.5 }}>Frequencies are scaled to audio-like values so every cycle can be drawn; the spectra have the same shape at radio frequencies, shifted to the carrier.</p>
        <dl className="kv" aria-label="Modulation quantities">
          {kind === 'am' ? <>
            <KV k="occupied band (tone)" v={`${formatSig((fc - fm) / 1000, 4)} – ${formatSig((fc + fm) / 1000, 4)} kHz`} />
            <KV k="sideband amplitude A_c m/2" v={m / 2} sig={3} />
            <KV k="power in the sidebands" v={sidebandShare * 100} unit="%" sig={3} title="(m²/2)/(1 + m²/2) for a tone of index m" />
          </> : <>
            <KV k="modulation index β = Δf/f_m" v={beta} sig={4} />
            <KV k="carrier line |J₀(β)|" v={Math.abs(lines.find((l) => l.n === 0)?.amp ?? 0)} sig={4} />
            <KV k="99 % power bandwidth" v={bw!.bandwidth} unit="Hz" sig={4} title="Smallest band f_c ± K f_m holding 99 % of the power (Σ J_n² = 1, DLMF 10.23.3)" />
            <KV k="sideband pairs inside it" v={bw!.K} />
          </>}
        </dl>
        {kind === 'fm' && <button className="chip" onClick={() => setQuery({ dev: 15000, fm: 3000 })}>β = 5 (like ±75 kHz on a 15 kHz tone)</button>}
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>{kind === 'am' ? 'Amplitude modulation' : 'Frequency modulation'} <ProvenanceBadge cls="derived" title="Signals computed from the cited definitions; spectra by FFT" /></h1>
          {kind === 'am'
            ? <p className="note">x(t) = A_c(1 + m(t)) cos 2πf_c t: the message rides on the carrier's amplitude. Its spectrum sits at f_c ± W, the message bandwidth, and a coherent receiver recovers (A_c/2)(1 + m(t)) by multiplying by the carrier and low-pass filtering (Johnson §6.11). <SourceLinks ids={J} /></p>
            : <p className="note">In FM “the instantaneous radio frequency varies in proportion to the instantaneous amplitude of the modulating signal” (47 CFR §73.310). For a tone the phase is β sin 2πf_m t, and e^{'{'}iβ sin θ{'}'} = Σ J_n(β) e^{'{'}inθ{'}'} (DLMF 10.12.1) puts spectral lines at f_c + n f_m with amplitudes J_n(β): many sidebands, not two. U.S. FM broadcasting defines ±75 kHz of deviation as 100 % modulation. <SourceLinks ids={['ecfr-47-cfr', 'nist-dlmf']} /></p>}
        </div>
        <LinePlot ariaLabel="Modulated waveform" width={720} height={190} xLabel="time (ms)" yLabel={kind === 'am' ? 'x(t) / A_c' : 'x(t) / A_c'} legend="tr"
          series={[{ points: wave.out, color: '#7df9ff', width: 1, label: 'modulated signal' }, { points: kind === 'am' ? wave.msg : wave.msg.map(([t, v]) => [t, v * 1.25] as [number, number]), color: '#f5c76b', dashed: true, label: kind === 'am' ? 'envelope 1 + m(t)' : 'message (scaled)' }]} />
        <LinePlot ariaLabel="Spectrum of the modulated signal" width={720} height={240} xLabel="frequency (kHz)" yLabel="amplitude (dB re A_c)" yDomain={[-80, 3]} legend="tr"
          series={[{ points: specPts, color: '#7df9ff', width: 1.2, label: 'FFT (65 536 points, Hanning window)' }]}
          markers={kind === 'fm' ? lines.map((l) => ({ x: (fc + l.n * fm) / 1000, y: dB(Math.abs(l.amp)), color: '#f5c76b' })) : [{ x: fc / 1000, y: 0, color: '#f5c76b' }, { x: (fc - fm) / 1000, y: dB(m / 2), color: '#f5c76b' }, { x: (fc + fm) / 1000, y: dB(m / 2), color: '#f5c76b' }]} />
        <p className="note" style={{ fontSize: 10.5 }}>Gold dots: the predicted lines ({kind === 'am' ? 'carrier and two sidebands of A_c m/2' : '|J_n(β)| at f_c + n f_m'}); cyan: the FFT of the computed signal (Johnson §5.9, Hanning window §5.10). The floor around the lines is the window's leakage, not noise. <SourceLinks ids={J} /></p>
      </div>
      <Panel id="mod-analog-readout" className="right-panel" title={kind === 'fm' ? 'FM sidebands' : 'AM spectrum'}>
        {kind === 'fm'
          ? <table className="table-mini" aria-label="FM lines"><thead><tr><th>n</th><th>f (kHz)</th><th>J_n(β)</th><th>dB</th></tr></thead>
              <tbody>{lines.filter((l) => l.n >= 0).slice(0, 14).map((l) => <tr key={l.n}><td>{l.n === 0 ? '0 (carrier)' : `±${l.n}`}</td><td>{formatSig((fc + l.n * fm) / 1000, 5)}</td><td>{formatSig(l.amp, 4)}</td><td>{formatSig(dB(Math.abs(l.amp)), 3)}</td></tr>)}</tbody></table>
          : <table className="table-mini" aria-label="AM lines"><thead><tr><th>line</th><th>f (kHz)</th><th>amplitude</th></tr></thead>
              <tbody><tr><td>lower sideband</td><td>{formatSig((fc - fm) / 1000, 5)}</td><td>{formatSig(m / 2, 3)}</td></tr><tr><td>carrier</td><td>{formatSig(fc / 1000, 5)}</td><td>1</td></tr><tr><td>upper sideband</td><td>{formatSig((fc + fm) / 1000, 5)}</td><td>{formatSig(m / 2, 3)}</td></tr></tbody></table>}
        <p className="note" style={{ fontSize: 10.5 }}>{kind === 'fm' ? 'Negative n have the same magnitude: J_{−n} = (−1)ⁿ J_n (DLMF 10.4.1). When J₀(β) is near zero the carrier line nearly vanishes and the power is in the sidebands.' : 'Expanding (1 + m cos 2πf_m t) cos 2πf_c t gives the carrier plus two lines of amplitude m/2 at f_c ± f_m.'} <SourceLinks ids={kind === 'fm' ? ['nist-dlmf'] : J} /></p>
        <RelatedLinks id="instrument:modulation-lab" />
      </Panel>
    </>
  );
}

// ------------------------------------------------------------------ digital
function DigitalTab() {
  const { query } = useRoute();
  const sch: Scheme = query.get('sch') === 'fsk' ? 'fsk' : 'bpsk';
  const eb = num(query, 'eb', 4, -4, 14), n = Math.round(num(query, 'n', 20000, 1000, 200000));
  const cfg = useMemo(() => ({ scheme: sch, spb: 32, k: 2, A: 1 }), [sch]);
  const sim = useMemo(() => simulate(cfg, eb, n, 7), [cfg, eb, n]);
  const [curve, setCurve] = useState<{ sch: Scheme; pts: [number, number][] } | null>(null);
  const measureCurve = () => { const pts: [number, number][] = []; for (let e = -2; e <= 10; e += 2) { const s = simulate(cfg, e, 50000, 100 + e); if (s.errors > 0) pts.push([e, s.ber]); } setCurve({ sch, pts }); };
  const theory = (s: Scheme) => Array.from({ length: 81 }, (_, i) => { const e = -4 + i * 0.2; return [e, theoreticalBer(s, e)] as [number, number]; });
  const sd = Math.sqrt((sim.theory * (1 - sim.theory)) / n);
  const hist = useMemo(() => {
    const bins = 60, lo = -3, hi = 3, h0 = new Array(bins).fill(0), h1 = new Array(bins).fill(0);
    for (const s of sim.stats) { const i = Math.floor(((s.d - lo) / (hi - lo)) * bins); if (i >= 0 && i < bins) (s.bit ? h1 : h0)[i]++; }
    const toPts = (h: number[]) => h.map((c, i) => [lo + ((i + 0.5) * (hi - lo)) / bins, c] as [number, number]);
    return { h0: toPts(h0), h1: toPts(h1) };
  }, [sim]);
  const T = (i: number) => i / cfg.spb;
  return (
    <>
      <Panel id="mod-digital-controls" className="left-panel" title="Digital link">
        <div className="chip-row" role="radiogroup" aria-label="Signal set" style={{ marginBottom: 6 }}>
          <button role="radio" aria-checked={sch === 'bpsk'} className={`chip ${sch === 'bpsk' ? 'active' : ''}`} onClick={() => setQuery({ sch: null })}>BPSK</button>
          <button role="radio" aria-checked={sch === 'fsk'} className={`chip ${sch === 'fsk' ? 'active' : ''}`} onClick={() => setQuery({ sch: 'fsk' })}>FSK</button>
        </div>
        <label className="slider-row"><span style={{ minWidth: 80 }}>E_b/N₀</span><input type="range" min={-4} max={14} step={0.5} value={eb} aria-label="Energy per bit over noise density in dB" onChange={(e) => setQuery({ eb: e.target.value })} /><span>{eb} dB</span></label>
        <label className="slider-row"><span style={{ minWidth: 80 }}>bits sent</span><input type="range" min={3} max={5.3} step={0.1} value={Math.log10(n)} aria-label="Number of bits" onChange={(e) => setQuery({ n: Math.round(10 ** Number(e.target.value)) })} /><span>{n.toLocaleString('en-US')}</span></label>
        <p className="note" style={{ fontSize: 10.5 }}>{sch === 'bpsk' ? 'BPSK: bit 0 is A sin(2πkt/T), bit 1 its negative (Johnson §6.14).' : 'FSK: bit 0 at f₀ = k₀/T, bit 1 at f₁ = (k₀ + 1)/T (Johnson §6.15).'} Here k = {cfg.k} carrier cycles per bit and {cfg.spb} samples per bit. The receiver correlates each bit interval with both signals and picks the larger (Johnson §6.16). Noise is white Gaussian with power spectrum N₀/2, from a seeded generator so runs repeat. <SourceLinks ids={J} /></p>
        <dl className="kv" aria-label="Bit errors">
          <KV k="bit errors" v={`${sim.errors} of ${n.toLocaleString('en-US')}`} />
          <KV k="measured bit-error rate" v={sim.ber} sig={3} />
          <KV k="theory" v={sim.theory} sig={3} title={sch === 'bpsk' ? 'Q(√(2E_b/N₀)), Johnson §6.17' : 'Q(√(E_b/N₀)), Johnson §6.18'} />
          <KV k="expected scatter (1σ)" v={sd} sig={2} />
        </dl>
        <button className="chip" onClick={measureCurve}>Measure the error curve (7 points × 50 000 bits)</button>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Digital communication in noise <ProvenanceBadge cls="simulated" title="Monte-Carlo simulation against the closed-form error probability" /></h1>
          <p className="note">Bits are sent as {sch === 'bpsk' ? 'opposite-sign' : 'two-frequency'} pulses, white noise is added, and a correlation receiver decides each bit. The error probability is p_e = Q(√(∫(s₁ − s₀)²dt / 2N₀)): for BPSK s₁ − s₀ = −2s₀, twice the difference energy of FSK's two orthogonal tones, so BPSK needs half the E_b/N₀ (3 dB less) for the same error rate (Johnson §§6.17–6.18). <SourceLinks ids={J} /></p>
        </div>
        <LinePlot ariaLabel="Transmitted and received waveform" width={720} height={180} xLabel="time (bit intervals T)" yLabel="signal (A)" legend="tr"
          series={[{ points: Array.from(sim.rx, (v, i) => [T(i), v] as [number, number]), color: 'rgba(125,249,255,0.55)', width: 0.8, label: 'received r(t) = s(t) + noise' }, { points: Array.from(sim.tx, (v, i) => [T(i), v] as [number, number]), color: '#f5c76b', width: 1.4, label: `sent: ${sim.sentBits.join('')}` }]} />
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 300px', maxWidth: 360 }}><LinePlot ariaLabel="Decision statistic histogram" width={350} height={220} xLabel="c₀ − c₁ (decision statistic)" yLabel="number of bits" legend="tr" vLines={[{ x: 0, label: 'threshold', color: '#ff7a90' }]}
            series={[{ points: hist.h0, color: '#7df9ff', label: 'bit 0 sent' }, { points: hist.h1, color: '#f5c76b', label: 'bit 1 sent' }]} /></div>
          <div style={{ flex: '1 1 300px', maxWidth: 360 }}><LinePlot ariaLabel="Bit-error rate against Eb/N0" width={350} height={220} yLog yDomain={[1e-6, 0.5]} xLabel="E_b/N₀ (dB)" yLabel="bit-error rate" legend="bl"
            series={[{ points: theory('bpsk'), color: '#7df9ff', label: 'BPSK theory' }, { points: theory('fsk'), color: '#b18cff', dashed: true, label: 'FSK theory' }]}
            markers={[...(sim.errors > 0 ? [{ x: eb, y: sim.ber, color: '#f5c76b', label: 'this run' }] : []), ...(curve?.sch === sch ? curve.pts.map(([x, y]) => ({ x, y, color: '#5cf2a6' })) : [])]} /></div>
        </div>
        <p className="note" style={{ fontSize: 10.5 }}>The decision statistic of each bit (correlation with s₀ minus correlation with s₁) forms two noisy clusters; errors are the bits that land on the wrong side of zero. Green points: measured error rates. Q(x) = ½ erfc(x/√2) (DLMF 7.2.2). <SourceLinks ids={['nist-dlmf']} /></p>
      </div>
      <Panel id="mod-digital-readout" className="right-panel" title="Validity">
        <ul className="note" style={{ paddingLeft: 16, fontSize: 10.5 }}><li>Additive white Gaussian noise only; no fading, interference or timing error (α = 1)</li><li>Coherent receiver that knows the carrier phase and bit timing</li><li>Discrete-time simulation with {cfg.spb} samples per bit; a run's error rate scatters around the theory by about √(p(1 − p)/n)</li><li>Not modelled: QAM and other multi-level signal sets, channel coding</li></ul>
        <RelatedLinks id="instrument:modulation-lab" />
      </Panel>
    </>
  );
}

// ------------------------------------------------------------------ capacity
function CapacityTab() {
  const { query } = useRoute();
  const W = num(query, 'W', 3000, 100, 1e9), snrDb = num(query, 'snr', 30, -10, 60);
  const C = capacity(W, 10 ** (snrDb / 10));
  const curve = Array.from({ length: 141 }, (_, i) => { const s = -10 + i * 0.5; return [s, capacity(W, 10 ** (s / 10)) / W] as [number, number]; });
  return (
    <>
      <Panel id="mod-cap-controls" className="left-panel" title="Channel">
        <label className="slider-row"><span style={{ minWidth: 80 }}>bandwidth W</span><input type="range" min={2} max={9} step={0.01} value={Math.log10(W)} aria-label="Bandwidth" onChange={(e) => setQuery({ W: Number((10 ** Number(e.target.value)).toPrecision(4)) })} /><span>{formatSig(W, 4)} Hz</span></label>
        <label className="slider-row"><span style={{ minWidth: 80 }}>SNR</span><input type="range" min={-10} max={60} step={0.5} value={snrDb} aria-label="Signal-to-noise ratio in dB" onChange={(e) => setQuery({ snr: e.target.value })} /><span>{snrDb} dB</span></label>
        <button className="chip" onClick={() => setQuery({ W: 3000, snr: 30 })}>Johnson's telephone channel (3 kHz, 30 dB)</button>
        <dl className="kv" aria-label="Capacity">
          <KV k="capacity C" v={C} unit="bit/s" sig={5} />
          <KV k="spectral efficiency C/W" v={C / W} unit="bit/s/Hz" sig={4} />
        </dl>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Channel capacity <ProvenanceBadge cls="derived" title="Shannon's capacity formula as given by Johnson §6.31" /></h1>
          <p className="note">Shannon showed that a channel of bandwidth W with additive white noise can carry data with arbitrarily few errors at any rate below C = W log₂(1 + SNR) bits per second, and at no rate above it. Johnson's example: a 3 kHz telephone line at 30 dB allows about 29.9 kbit/s, which is why “33 kbps” modems sat right at the limit (§6.31). <SourceLinks ids={J} /></p>
        </div>
        <LinePlot ariaLabel="Capacity per hertz against SNR" width={720} height={280} xLabel="signal-to-noise ratio (dB)" yLabel="C / W (bit/s per Hz)" series={[{ points: curve, color: '#7df9ff', label: 'W log₂(1 + SNR) / W' }]} markers={[{ x: snrDb, y: C / W, label: `${formatSig(C / W, 3)} bit/s/Hz`, color: '#f5c76b' }]} />
        <p className="note" style={{ fontSize: 10.5 }}>Above 0 dB the capacity exceeds the bandwidth (more than one bit per second per hertz), which needs multi-level signal sets; BPSK and FSK carry less than one bit per second per hertz (Johnson §6.31). <SourceLinks ids={J} /></p>
      </div>
    </>
  );
}

export default function ModulationView() {
  const { query } = useRoute();
  const tab: Tab = TABS.find(([t]) => t === query.get('tab'))?.[0] ?? 'analog';
  return (
    <>
      <nav className="view-switch" aria-label="Modulation sections">
        {TABS.map(([t, label]) => <button key={t} className={tab === t ? 'active' : ''} onClick={() => setQuery({ tab: t === 'analog' ? null : t })}>{label}</button>)}
      </nav>
      {tab === 'digital' ? <DigitalTab /> : tab === 'capacity' ? <CapacityTab /> : <AnalogTab />}
    </>
  );
}
