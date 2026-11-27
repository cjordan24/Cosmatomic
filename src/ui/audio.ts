/**
 * Web Audio playback (Phase 9, Gate 9.6). Plays sample buffers computed by the physics modules; nothing is recorded or
 * stored. One shared AudioContext is created on the first user gesture (browsers block audio before one). A short
 * fade in/out avoids clicks; the gain is kept low because synthesized waveforms are full scale.
 */
let ctx: AudioContext | null = null;
let current: { src: AudioBufferSourceNode; gain: GainNode } | null = null;

export function audioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  ctx ??= new AC();
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}
export const audioSampleRate = () => audioContext()?.sampleRate ?? 48000;

/** Play mono samples recorded at `rate` (the browser resamples to the output rate). Returns false when audio is unavailable. */
export function playSamples(samples: Float32Array, rate: number, volume = 0.15, onEnd?: () => void): boolean {
  const ac = audioContext();
  if (!ac || samples.length === 0) return false;
  stopAudio();
  const buf = ac.createBuffer(1, samples.length, Math.max(3000, Math.min(768000, rate)));
  buf.copyToChannel(new Float32Array(samples), 0);
  const src = ac.createBufferSource(), gain = ac.createGain();
  src.buffer = buf;
  const t0 = ac.currentTime, dur = samples.length / buf.sampleRate, fade = Math.min(0.02, dur / 4);
  gain.gain.setValueAtTime(0, t0);
  gain.gain.linearRampToValueAtTime(volume, t0 + fade);
  gain.gain.setValueAtTime(volume, t0 + dur - fade);
  gain.gain.linearRampToValueAtTime(0, t0 + dur);
  src.connect(gain).connect(ac.destination);
  src.onended = () => { if (current?.src === src) current = null; onEnd?.(); };
  src.start();
  current = { src, gain };
  return true;
}
export function stopAudio() {
  if (!current) return;
  try { current.src.stop(); } catch { /* already stopped */ }
  current = null;
}
