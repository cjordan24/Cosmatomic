/**
 * Audio synthesis & FFT — #/spectral/audio?tab=synth|sampling|spectrogram   (Phase 9, Gate 9.6)
 *
 *  synth        Fourier synthesis of a periodic waveform (Johnson §4.3): shape, f0 (Hz), n (harmonics); playback, one period,
 *               harmonic amplitudes, FFT spectrum (§5.9, Hanning window §5.10)
 *  sampling     a sinusoid of frequency f sampled at fs: samples, the apparent (alias) frequency, Nyquist frequency (§5.3);
 *               playback of the original and of the samples
 *  spectrogram  overlapping Hanning-windowed FFT frames (§5.10) of a chirp, a frequency step, a synthesized square wave or a
 *               3 s microphone recording (local only, never stored or sent)
 * Audio: src/ui/audio.ts (Web Audio API).
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { setQuery, useRoute } from '@/shared/router';
import { KV, Panel, ProvenanceBadge } from '@/ui/components';
import { SourceLinks } from '@/ui/SourcesView';
import { RelatedLinks } from '@/ui/RelatedLinks';
import { LinePlot } from '@/ui/plots';
import { formatSig } from '@/core/units/units';
import { aliasFrequency, amplitudeSpectrum, spectrogram } from '@/core/physics/signals/dsp';
import { SHAPE_LABEL, fourierCoefficients, harmonicAmplitude, partialSum, shapeValue, synthesize, type Shape } from '@/core/physics/signals/synthesis';
import { audioContext, audioSampleRate, playSamples, stopAudio } from '@/ui/audio';

type Tab = 'synth' | 'sampling' | 'spectrogram';
const TABS: [Tab, string][] = [['synth', 'Fourier synthesis'], ['sampling', 'Sampling & aliasing'], ['spectrogram', 'Spectrogram']];
const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
const num = (q: URLSearchParams, k: string, d: number, a: number, b: number) => { const v = Number(q.get(k)); return q.has(k) && Number.isFinite(v) ? clamp(v, a, b) : d; };
const J = ['johnson-fundamentals-ee'];
const SHAPES: Shape[] = ['sine', 'square', 'sawtooth', 'triangle', 'half-rectified'];
const dB = (x: number) => 20 * Math.log10(Math.max(x, 1e-9));

function PlayButton({ make, label = 'Play', rate }: { make: () => Float32Array; label?: string; rate?: number }) {
  const [on, setOn] = useState(false);
  const [msg, setMsg] = useState('');
  useEffect(() => () => stopAudio(), []);
  return (
    <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
      <button className="chip" aria-label={on ? `Stop ${label}` : label} onClick={() => { if (on) { stopAudio(); setOn(false); return; } const s = make(); const ok = playSamples(s, rate ?? audioSampleRate(), 0.15, () => setOn(false)); setOn(ok); setMsg(ok ? '' : 'Audio is not available in this browser.'); }}>{on ? '■ Stop' : `🔊 ${label}`}</button>
      {msg && <span className="note" role="status">{msg}</span>}
    </span>
  );
}

// ------------------------------------------------------------------ synthesis
function SynthTab() {
  const { query } = useRoute();
  const shape = (SHAPES.find((s) => s === query.get('shape')) ?? 'square') as Shape;
  const f0 = num(query, 'f0', 220, 55, 1760), n = Math.round(num(query, 'n', 9, 1, 60));
  const coeffs = useMemo(() => fourierCoefficients(shape, 60), [shape]);
  const period = useMemo(() => Array.from({ length: 401 }, (_, i) => { const u = i / 400; return { u, ideal: shapeValue(shape, u), sum: partialSum(coeffs, n, u) }; }), [coeffs, shape, n]);
  const fsA = 48000;
  const spec = useMemo(() => { const { samples } = synthesize(coeffs, n, f0, fsA, 32768 / fsA); return amplitudeSpectrum(samples, fsA, 'hann'); }, [coeffs, n, f0]);
  const specPts = useMemo(() => { const out: [number, number][] = []; for (let k = 1; k < spec.f.length && spec.f[k] <= Math.min(20000, f0 * (n + 2)); k++) out.push([spec.f[k], dB(spec.amp[k])]); return out; }, [spec, f0, n]);
  const overshoot = Math.max(...period.map((p) => p.sum)) - Math.max(...period.map((p) => p.ideal));
  const nyquistCut = Math.floor((48000 / 2) / f0);
  return (
    <>
      <Panel id="audio-synth-controls" className="left-panel" title="Waveform">
        <div className="chip-row" role="radiogroup" aria-label="Shape" style={{ marginBottom: 6, gap: 4 }}>
          {SHAPES.map((s) => <button key={s} role="radio" aria-checked={shape === s} className={`chip ${shape === s ? 'active' : ''}`} style={{ fontSize: 10.5 }} onClick={() => setQuery({ shape: s === 'square' ? null : s })}>{SHAPE_LABEL[s]}</button>)}
        </div>
        <label className="slider-row"><span style={{ minWidth: 80 }}>fundamental</span><input type="range" min={Math.log10(55)} max={Math.log10(1760)} step={0.001} value={Math.log10(f0)} aria-label="Fundamental frequency" onChange={(e) => setQuery({ f0: Number((10 ** Number(e.target.value)).toPrecision(4)) })} /><span>{formatSig(f0, 4)} Hz</span></label>
        <label className="slider-row"><span style={{ minWidth: 80 }}>harmonics</span><input type="range" min={1} max={60} step={1} value={n} aria-label="Number of harmonics" onChange={(e) => setQuery({ n: e.target.value })} /><span>1…{n}</span></label>
        <PlayButton make={() => synthesize(coeffs, n, f0, audioSampleRate(), 2).samples} label="Play 2 s" />
        <dl className="kv" aria-label="Synthesis" style={{ marginTop: 8 }}>
          <KV k="highest harmonic" v={n * f0} unit="Hz" sig={4} />
          <KV k="harmonics below 24 kHz (Nyquist at 48 kHz)" v={Math.min(n, nyquistCut)} title="Harmonics at or above half the output sample rate are left out when playing: they would alias (Johnson §5.3)" />
          <KV k="peak of the partial sum − peak of the waveform" v={overshoot} sig={3} title="Overshoot next to a jump, measured on the curve" />
        </dl>
        <p className="note" style={{ fontSize: 10.5 }}>Coefficients a_k, b_k = (2/T)∫ s(t) cos/sin(2πkt/T) dt (Johnson §4.3), integrated numerically for each shape; the square wave's closed form b_k = 4/(πk), odd k, checks them. <SourceLinks ids={J} /></p>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Fourier synthesis <ProvenanceBadge cls="derived" title="Classic Fourier series (Johnson §4.3), spectrum by FFT (§5.9)" /></h1>
          <p className="note">Any periodic signal is a sum of sinusoids at multiples of its fundamental frequency. Adding harmonics one by one builds the {SHAPE_LABEL[shape].toLowerCase()} wave; the spectrum below is the FFT of exactly what you hear. <SourceLinks ids={J} /></p>
        </div>
        <LinePlot ariaLabel="One period of the waveform and its partial sum" width={720} height={220} xLabel="time t/T" yLabel="amplitude" legend="tr"
          series={[{ points: period.map((p) => [p.u, p.ideal] as [number, number]), color: '#f5c76b', dashed: true, label: 'waveform' }, { points: period.map((p) => [p.u, p.sum] as [number, number]), color: '#7df9ff', label: `sum of ${n} harmonic${n > 1 ? 's' : ''}` }]} />
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 300px', maxWidth: 360 }}><LinePlot ariaLabel="Harmonic amplitudes" width={360} height={200} xDomain={[0, Math.min(n, 30) + 1]} yDomain={[0, 1.4]} xLabel="harmonic k" yLabel="amplitude √(a_k² + b_k²)"
            series={Array.from({ length: Math.min(n, 30) }, (_, i) => ({ points: [[i + 1, 0], [i + 1, harmonicAmplitude(coeffs, i + 1)]] as [number, number][], color: '#7df9ff', width: 4 }))} /></div>
          <div style={{ flex: '1 1 300px', maxWidth: 360 }}><LinePlot ariaLabel="Spectrum of the synthesized sound" width={360} height={200} xLog xLabel="frequency (Hz)" yLabel="amplitude (dB)" yDomain={[-90, 3]}
            series={[{ points: specPts, color: '#b18cff', width: 1 }]} /></div>
        </div>
      </div>
      <Panel id="audio-synth-readout" className="right-panel" title="Coefficients">
        <table className="table-mini" aria-label="Fourier coefficients"><thead><tr><th>k</th><th>f (Hz)</th><th>a_k</th><th>b_k</th></tr></thead>
          <tbody>{Array.from({ length: Math.min(n, 12) }, (_, i) => i + 1).map((k) => <tr key={k}><td>{k}</td><td>{formatSig(k * f0, 4)}</td><td>{formatSig(Math.abs(coeffs.a[k]) < 1e-9 ? 0 : coeffs.a[k], 4)}</td><td>{formatSig(Math.abs(coeffs.b[k]) < 1e-9 ? 0 : coeffs.b[k], 4)}</td></tr>)}</tbody></table>
        <p className="note" style={{ fontSize: 10.5 }}>a₀ (mean) = {formatSig(Math.abs(coeffs.a0) < 1e-9 ? 0 : coeffs.a0, 4)}. Values below 10⁻⁹ are shown as 0.</p>
        <RelatedLinks id="instrument:audio-lab" />
      </Panel>
    </>
  );
}

// ------------------------------------------------------------------ sampling
function SamplingTab() {
  const { query } = useRoute();
  const f = num(query, 'f', 3000, 50, 20000), fs = num(query, 'fs', 8000, 3000, 48000);
  const alias = aliasFrequency(f, fs), nyq = fs / 2;
  const span = Math.max(4 / Math.max(alias, 1), 3 / f) * 1000;   // ms
  const cont = useMemo(() => Array.from({ length: 1201 }, (_, i) => { const t = (i / 1200) * span / 1000; return [t * 1000, Math.sin(2 * Math.PI * f * t)] as [number, number]; }), [f, span]);
  const apparent = useMemo(() => Array.from({ length: 1201 }, (_, i) => { const t = (i / 1200) * span / 1000; const r = ((f % fs) + fs) % fs; const sign = r > fs / 2 ? -1 : 1; return [t * 1000, sign * Math.sin(2 * Math.PI * alias * t)] as [number, number]; }), [f, fs, alias, span]);
  const samples = useMemo(() => { const n = Math.floor((span / 1000) * fs); return Array.from({ length: n + 1 }, (_, k) => ({ x: (k / fs) * 1000, y: Math.sin(2 * Math.PI * f * (k / fs)), color: '#f5c76b' })); }, [f, fs, span]);
  return (
    <>
      <Panel id="audio-sampling-controls" className="left-panel" title="Sampling">
        <label className="slider-row"><span style={{ minWidth: 90 }}>signal f</span><input type="range" min={Math.log10(50)} max={Math.log10(20000)} step={0.001} value={Math.log10(f)} aria-label="Signal frequency" onChange={(e) => setQuery({ f: Number((10 ** Number(e.target.value)).toPrecision(4)) })} /><span>{formatSig(f, 4)} Hz</span></label>
        <label className="slider-row"><span style={{ minWidth: 90 }}>sample rate</span><input type="range" min={3000} max={48000} step={100} value={fs} aria-label="Sample rate" onChange={(e) => setQuery({ fs: e.target.value })} /><span>{formatSig(fs, 4)} Hz</span></label>
        <div className="chip-row" style={{ gap: 6 }}>
          <PlayButton make={() => { const r = audioSampleRate(), N = r * 2, o = new Float32Array(N); for (let i = 0; i < N; i++) o[i] = Math.sin(2 * Math.PI * f * i / r); return o; }} label="Original" />
          <PlayButton make={() => { const N = fs * 2, o = new Float32Array(N); for (let i = 0; i < N; i++) o[i] = Math.sin(2 * Math.PI * f * i / fs); return o; }} label="As sampled" rate={fs} />
        </div>
        <p className="note" style={{ fontSize: 10.5 }}>“As sampled” hands the browser the samples taken at {formatSig(fs, 4)} Hz; it rebuilds a smooth signal from them, so above the Nyquist frequency you hear the alias, not the original.</p>
        <dl className="kv" aria-label="Sampling result">
          <KV k="Nyquist frequency f_s/2" v={nyq} unit="Hz" sig={5} />
          <KV k="samples per period" v={fs / f} sig={3} />
          <KV k="apparent frequency" v={alias} unit="Hz" sig={5} />
          <KV k="aliased?" v={f > nyq ? 'yes: above the Nyquist frequency' : 'no'} />
        </dl>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Sampling and aliasing <ProvenanceBadge cls="derived" title="Sampling theorem (Johnson §5.3)" /></h1>
          <p className="note">The Sampling Theorem says a signal can be recovered exactly from its samples if it contains no energy above the Nyquist frequency 1/2T_s. A sinusoid above it gives the same samples as a lower-frequency one, its alias (Johnson §5.3). <SourceLinks ids={J} /></p>
        </div>
        <LinePlot ariaLabel="Signal, samples and the apparent sinusoid" width={720} height={260} xLabel="time (ms)" yLabel="amplitude" legend="tr" yDomain={[-1.3, 1.3]}
          series={[{ points: cont, color: 'rgba(125,249,255,0.6)', width: 1, label: `signal ${formatSig(f, 4)} Hz` }, { points: apparent, color: '#ff7a90', dashed: true, label: `apparent ${formatSig(alias, 4)} Hz` }]} markers={samples} />
        <p className="note" style={{ fontSize: 10.5 }}>Gold dots: the samples. They fit both the original (cyan) and the dashed apparent sinusoid; below the Nyquist frequency the two coincide. <SourceLinks ids={J} /></p>
      </div>
      <Panel id="audio-sampling-readout" className="right-panel" title="Johnson §5.3">
        <p className="note" style={{ fontSize: 11 }}>Johnson notes that sound cards sample at rates such as 44.1 kHz, whose Nyquist frequency is 22.05 kHz, and that many have no anti-aliasing filter. <SourceLinks ids={J} /></p>
        <button className="chip" onClick={() => setQuery({ f: 20000, fs: 22050 })}>f = 20 kHz at 22.05 kHz</button>
        <RelatedLinks id="instrument:audio-lab" />
      </Panel>
    </>
  );
}

// ------------------------------------------------------------------ spectrogram
type Sig = 'chirp' | 'step' | 'square' | 'mic';
function makeSignal(sig: Exclude<Sig, 'mic'>, fs: number): Float32Array {
  const d = 2, N = Math.round(fs * d), out = new Float32Array(N);
  if (sig === 'chirp') { let ph = 0; for (let i = 0; i < N; i++) { const t = i / fs, fi = 100 + (3900 * t) / d; ph += (2 * Math.PI * fi) / fs; out[i] = Math.sin(ph); } }
  else if (sig === 'step') for (let i = 0; i < N; i++) out[i] = Math.sin(2 * Math.PI * (i < N / 2 ? 440 : 880) * (i / fs));
  else { const c = fourierCoefficients('square', 20); const s = synthesize(c, 20, 220, fs, d).samples; out.set(s); }
  return out;
}
function SpectrogramTab() {
  const { query } = useRoute();
  const sig = (['chirp', 'step', 'square', 'mic'].find((s) => s === query.get('sig')) ?? 'chirp') as Sig;
  const fs = 16000;
  const [mic, setMic] = useState<Float32Array | null>(null);
  const [micMsg, setMicMsg] = useState('');
  const data = useMemo(() => (sig === 'mic' ? mic : makeSignal(sig, fs)), [sig, mic]);
  const sg = useMemo(() => (data ? spectrogram(data, fs, 512, 256, 'hann') : null), [data]);
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current; if (!cv || !sg) return;
    const g = cv.getContext('2d')!, W = cv.width, H = cv.height, cols = sg.db.length, rows = sg.f.length;
    const fMax = 4000, kMax = Math.min(rows - 1, Math.round((fMax / (fs / 2)) * (rows - 1)));
    const img = g.createImageData(cols, kMax);
    for (let c = 0; c < cols; c++) for (let k = 0; k < kMax; k++) {
      const v = clamp((sg.db[c][k] + 90) / 90, 0, 1), o = 4 * ((kMax - 1 - k) * cols + c);
      img.data[o] = 255 * Math.min(1, v * 1.6); img.data[o + 1] = 255 * Math.max(0, v * 1.4 - 0.4); img.data[o + 2] = 120 * (1 - v) + 60; img.data[o + 3] = 255;
    }
    const off = document.createElement('canvas'); off.width = cols; off.height = kMax; off.getContext('2d')!.putImageData(img, 0, 0);
    g.imageSmoothingEnabled = false; g.drawImage(off, 0, 0, W, H);
  }, [sg]);
  const record = async () => {
    setMicMsg('');
    try {
      const ac = audioContext(); if (!ac || !navigator.mediaDevices?.getUserMedia) { setMicMsg('Microphone input is not available in this browser.'); return; }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream), chunks: Blob[] = [];
      rec.ondataavailable = (e) => chunks.push(e.data);
      rec.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const buf = await ac.decodeAudioData(await new Blob(chunks).arrayBuffer());
        const src = buf.getChannelData(0), ratio = buf.sampleRate / fs, out = new Float32Array(Math.floor(src.length / ratio));
        for (let i = 0; i < out.length; i++) out[i] = src[Math.floor(i * ratio)];   // decimation (no anti-alias filter: content above 8 kHz aliases)
        setMic(out); setMicMsg('Recorded 3 s. The recording stays in this page and is discarded when you leave.');
      };
      rec.start(); setMicMsg('Recording 3 s…'); setTimeout(() => rec.stop(), 3000);
    } catch { setMicMsg('Microphone permission was refused or no microphone was found.'); }
  };
  return (
    <>
      <Panel id="audio-sg-controls" className="left-panel" title="Signal">
        <div className="chip-row" role="radiogroup" aria-label="Signal" style={{ gap: 4 }}>
          {([['chirp', 'Chirp 100 → 4000 Hz'], ['step', '440 → 880 Hz step'], ['square', 'Square wave 220 Hz'], ['mic', 'Microphone (3 s)']] as [Sig, string][]).map(([k, l]) => <button key={k} role="radio" aria-checked={sig === k} className={`chip ${sig === k ? 'active' : ''}`} style={{ fontSize: 10.5 }} onClick={() => setQuery({ sig: k === 'chirp' ? null : k })}>{l}</button>)}
        </div>
        {sig === 'mic' && <><button className="chip" style={{ marginTop: 6 }} onClick={record}>● Record 3 s</button><p className="note" role="status" style={{ fontSize: 10.5 }}>{micMsg || 'Uses your microphone only after you press Record and grant permission. Nothing is uploaded or saved.'}</p></>}
        {data && <PlayButton make={() => data} rate={fs} label="Play" />}
        <dl className="kv" aria-label="Spectrogram settings" style={{ marginTop: 8 }}>
          <KV k="sample rate" v={fs} unit="Hz" />
          <KV k="frame" v="512 samples (32 ms), Hanning window" />
          <KV k="hop" v="256 samples (half-frame overlap)" />
          <KV k="frequency resolution" v={fs / 512} unit="Hz" sig={3} />
          <KV k="frames" v={sg?.db.length ?? null} />
        </dl>
      </Panel>
      <div className="center-stage hr-stage">
        <div className="stage-head"><h1>Spectrogram <ProvenanceBadge cls="derived" title="Short-time FFT with half-overlapping Hanning-windowed frames (Johnson §5.10)" /></h1>
          <p className="note">The signal is cut into overlapping frames, each multiplied by a Hanning window and transformed; frequency runs up, time to the right and colour shows the level (Johnson §5.10). <SourceLinks ids={J} /></p>
        </div>
        {sg ? <canvas ref={ref} width={720} height={320} aria-label="Spectrogram" style={{ width: '100%', maxWidth: 720, borderRadius: 10, border: '1px solid var(--line)' }} /> : <p className="note">Press Record to capture 3 s from your microphone.</p>}
        <p className="note" style={{ fontSize: 10.5 }}>0–4 kHz shown; 0 to −90 dB colour range; 2 s of signal at 16 kHz.</p>
      </div>
      <Panel id="audio-sg-readout" className="right-panel" title="Reading it">
        <p className="note" style={{ fontSize: 11 }}>{sig === 'chirp' ? 'A chirp rises linearly in frequency, a straight sloping line.' : sig === 'step' ? 'The tone jumps an octave halfway; the transition frame contains both frequencies.' : sig === 'square' ? 'A square wave shows its odd harmonics as horizontal lines at 220, 660, 1100 … Hz.' : 'Your recording, frame by frame (decimated to 16 kHz without an anti-aliasing filter, so content above 8 kHz folds down).'}</p>
        <RelatedLinks id="instrument:audio-lab" />
      </Panel>
    </>
  );
}

export default function AudioView() {
  const { query } = useRoute();
  const tab: Tab = TABS.find(([t]) => t === query.get('tab'))?.[0] ?? 'synth';
  return (
    <>
      <nav className="view-switch" aria-label="Audio sections">
        {TABS.map(([t, label]) => <button key={t} className={tab === t ? 'active' : ''} onClick={() => setQuery({ tab: t === 'synth' ? null : t })}>{label}</button>)}
      </nav>
      {tab === 'sampling' ? <SamplingTab /> : tab === 'spectrogram' ? <SpectrogramTab /> : <SynthTab />}
    </>
  );
}
