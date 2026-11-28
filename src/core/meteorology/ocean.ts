/**
 * Oceans and ice (Phase 23, Gate 23.3): ENSO episodes from a seasonal index by NOAA's rule (≥ 5 consecutive
 * overlapping seasons at ≥ +0.5 °C or ≤ −0.5 °C), least-squares trends, and the hydrogen-ion change of a pH drop
 * (pH = −log[H⁺], so a drop ΔpH multiplies [H⁺] by 10^ΔpH).
 */
export type Season = { year: number; s: number; v: number };
/** Flatten [year, 12 seasonal values] rows into a chronological list (missing values dropped). */
export const flatten = (rows: (number | null)[][]): Season[] => rows.flatMap((r) => r.slice(1).map((v, s) => ({ year: r[0] as number, s, v: v as number })).filter((x) => x.v != null));
export interface Episode { kind: 'El Niño' | 'La Niña'; start: Season; end: Season; length: number; peak: number }
export function ensoEpisodes(seq: Season[], thr = 0.5, minLen = 5): Episode[] {
  const out: Episode[] = []; let i = 0;
  while (i < seq.length) {
    const sign = seq[i].v >= thr ? 1 : seq[i].v <= -thr ? -1 : 0;
    if (!sign) { i++; continue; }
    let j = i; while (j + 1 < seq.length && (sign > 0 ? seq[j + 1].v >= thr : seq[j + 1].v <= -thr)) j++;
    const run = seq.slice(i, j + 1);
    if (run.length >= minLen) out.push({ kind: sign > 0 ? 'El Niño' : 'La Niña', start: seq[i], end: seq[j], length: run.length, peak: sign > 0 ? Math.max(...run.map((x) => x.v)) : Math.min(...run.map((x) => x.v)) });
    i = j + 1;
  }
  return out;
}
/** Ordinary least-squares slope and intercept. */
export function ols(xs: number[], ys: number[]) {
  const n = xs.length, mx = xs.reduce((a, b) => a + b, 0) / n, my = ys.reduce((a, b) => a + b, 0) / n;
  let sxy = 0, sxx = 0; for (let i = 0; i < n; i++) { sxy += (xs[i] - mx) * (ys[i] - my); sxx += (xs[i] - mx) ** 2; }
  const slope = sxy / sxx; return { slope, intercept: my - slope * mx };
}
/** Fractional increase in hydrogen-ion concentration for a pH decrease dpH (> 0). */
export const acidityIncrease = (dpH: number) => 10 ** dpH - 1;
