/**
 * Physiology relations (Phase 12, Gates 12.2–12.3).
 *
 * Hill (1938), Proc. R. Soc. B 126, p. 161, eq. (1): (P + a) v = b (P₀ − P), i.e. v = b (P₀ − P)/(P + a); eq. (2) the
 * same hyperbola (P + a)(v + b) = (P₀ + a) b. In units of P₀ and with k = a/P₀: v/(b/k) = (1 − p)/(1 + p/k)·… —
 * here written directly: v(p) = (b/l)·(1 − p)/(p + k) lengths per second for p = P/P₀ (b scaled by the muscle length l).
 * Unloaded speed v(0) = (b/l)/k; mechanical power p·v is greatest at p* = √(k² + k) − k (set d(p·v)/dp = 0).
 *
 * Poiseuille (1840), Comptes rendus 11, p. 1046: Q = k″ P D⁴ / L (flow through narrow tubes): at fixed pressure and
 * length the flow goes as D⁴ — doubling the diameter passes 16 times as much liquid.
 *
 * Heart: cardiac output = rate × stroke volume, so SEER's “about 5 liters of blood every minute” at a given rate
 * implies a stroke volume of output/rate (derived, not quoted).
 *
 * Blood pressure: NHLBI's adult categories applied exactly as printed, most severe first.
 */

/** Hill's shortening speed in muscle lengths per second for relative load p = P/P₀, k = a/P₀ and b/l (per second). */
export const hillVelocity = (p: number, k: number, bOverL: number) => (p >= 1 ? 0 : (bOverL * (1 - p)) / (p + k));
/** Relative power p·v (P₀·lengths/s). */
export const hillPower = (p: number, k: number, bOverL: number) => p * hillVelocity(p, k, bOverL);
/** Load (fraction of P₀) giving the greatest power: √(k² + k) − k. */
export const hillOptimalLoad = (k: number) => Math.sqrt(k * k + k) - k;
/** Check of eq. (2): (P + a)(v + b) is the same constant for every load. */
export const hillInvariant = (p: number, k: number, bOverL: number) => (p + k) * (hillVelocity(p, k, bOverL) + bOverL);

/** Poiseuille's flow, in his units, Q = k″PD⁴/L. */
export const poiseuilleFlow = (k: number, P: number, D: number, L: number) => (k * P * D ** 4) / L;
/** Flow ratio for two diameters at the same pressure and length. */
export const poiseuilleRatio = (D1: number, D2: number) => (D1 / D2) ** 4;

/** Stroke volume (mL) implied by an output (L/min) and a rate (beats/min). */
export const strokeVolumeMl = (litresPerMinute: number, beatsPerMinute: number) => (litresPerMinute * 1000) / beatsPerMinute;
/** Cardiac cycle length (s) at a heart rate. */
export const cycleSeconds = (beatsPerMinute: number) => 60 / beatsPerMinute;

export type BPCategory = 'normal' | 'elevated' | 'stage1' | 'stage2' | 'crisis';
/** NHLBI adult categories (Diagnosis page, updated June 26, 2025), applied as printed, most severe first. */
export function classifyBloodPressure(systolic: number, diastolic: number): BPCategory {
  if (systolic > 180 || diastolic > 120) return 'crisis';
  if (systolic >= 140 || diastolic >= 90) return 'stage2';
  if ((systolic >= 130 && systolic <= 139) || (diastolic >= 80 && diastolic <= 89)) return 'stage1';
  if (systolic >= 120 && systolic <= 129 && diastolic < 80) return 'elevated';
  return 'normal';
}
