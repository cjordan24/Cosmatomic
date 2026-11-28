/**
 * Atlas grids (Gate 21.2): one byte per cell, 0–254 spanning [min, max], 255 = no data; rows north → south from
 * 90° − res/2, columns west → east from −180° + res/2; months concatenated. Colour scales for display.
 */
export interface LayerMeta { id: string; w: number; h: number; res: number; months: number; min: number; max: number }

/** Decode one month to physical values (NaN where no data). */
export function decodeMonth(bytes: Uint8Array, m: LayerMeta, month: number): Float32Array {
  const n = m.w * m.h, k = Math.min(month, m.months - 1), out = new Float32Array(n), span = (m.max - m.min) / 254;
  for (let i = 0; i < n; i++) { const b = bytes[k * n + i]; out[i] = b === 255 ? NaN : m.min + b * span; }
  return out;
}
/** Value at latitude/longitude (nearest cell). */
export function sample(vals: Float32Array, m: Pick<LayerMeta, 'w' | 'h' | 'res'>, lat: number, lon: number) {
  const r = Math.min(m.h - 1, Math.max(0, Math.floor((90 - lat) / m.res)));
  const c = ((Math.floor((lon + 180) / m.res) % m.w) + m.w) % m.w;
  return vals[r * m.w + c];
}
/** Area-weighted mean over valid cells (cos latitude). */
export function areaMean(vals: Float32Array, m: Pick<LayerMeta, 'w' | 'h' | 'res'>) {
  let s = 0, wsum = 0;
  for (let r = 0; r < m.h; r++) { const w = Math.cos(((90 - m.res / 2 - r * m.res) * Math.PI) / 180); for (let c = 0; c < m.w; c++) { const v = vals[r * m.w + c]; if (!Number.isNaN(v)) { s += v * w; wsum += w; } } }
  return wsum ? s / wsum : NaN;
}

// Colour scales: matplotlib's viridis (CC0) at 10 stops; a blue–white–red diverging scale (ColorBrewer RdBu, 11 classes).
const VIRIDIS = ['#440154', '#482878', '#3e4989', '#31688e', '#26828e', '#1f9e89', '#35b779', '#6ece58', '#b5de2b', '#fde725'];
const RDBU = ['#053061', '#2166ac', '#4393c3', '#92c5de', '#d1e5f0', '#f7f7f7', '#fddbc7', '#f4a582', '#d6604d', '#b2182b', '#67001f'];
const hex = (h: string) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const STOPS = { viridis: VIRIDIS.map(hex), diverging: RDBU.map(hex) };
export type Scale = keyof typeof STOPS;
/** Colour for t in [0, 1] on a scale, linear between stops. */
export function colour(t: number, scale: Scale = 'viridis'): [number, number, number] {
  const s = STOPS[scale], x = Math.min(1, Math.max(0, t)) * (s.length - 1), i = Math.min(s.length - 2, Math.floor(x)), f = x - i;
  return [0, 1, 2].map((k) => Math.round(s[i][k] + (s[i + 1][k] - s[i][k]) * f)) as [number, number, number];
}
export const SCALE_CSS = (scale: Scale) => `linear-gradient(90deg, ${(scale === 'viridis' ? VIRIDIS : RDBU).join(', ')})`;
