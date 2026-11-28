/**
 * Paleoclimate series helpers (Phase 23): linear interpolation of an [age, value] series (ages ascending) and the
 * Pearson correlation of two series sampled on a common age grid.
 */
export function interp(rows: [number, number][], age: number): number {
  if (age <= rows[0][0]) return rows[0][1];
  if (age >= rows[rows.length - 1][0]) return rows[rows.length - 1][1];
  let lo = 0, hi = rows.length - 1;
  while (hi - lo > 1) { const m = (lo + hi) >> 1; if (rows[m][0] <= age) lo = m; else hi = m; }
  const [a0, v0] = rows[lo], [a1, v1] = rows[hi];
  return v0 + ((v1 - v0) * (age - a0)) / (a1 - a0);
}
export function pearson(x: number[], y: number[]) {
  const n = x.length, mx = x.reduce((s, v) => s + v, 0) / n, my = y.reduce((s, v) => s + v, 0) / n;
  let sxy = 0, sxx = 0, syy = 0;
  for (let i = 0; i < n; i++) { const dx = x[i] - mx, dy = y[i] - my; sxy += dx * dy; sxx += dx * dx; syy += dy * dy; }
  return sxy / Math.sqrt(sxx * syy);
}
/** Sample two series every `step` years over [from, to]. */
export function onGrid(a: [number, number][], b: [number, number][], from: number, to: number, step: number) {
  const xs: number[] = [], ys: number[] = [];
  for (let t = from; t <= to; t += step) { xs.push(interp(a, t)); ys.push(interp(b, t)); }
  return { xs, ys };
}
