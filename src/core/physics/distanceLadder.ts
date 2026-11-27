/**
 * Distance ladder (Phase 7, Gate 7.2) — pure functions, no React.
 *
 * Each rung converts a measured quantity into a distance modulus μ = m − M = 5 log₁₀(D / 10 pc),
 * which is the same as μ = 5 log₁₀(D / Mpc) + 25 (Riess et al. 2022 §2.1). The relations:
 *  - parallax: D [pc] = 1 / ϖ [arcsec] (geometric);
 *  - Cepheids (Leavitt law, Riess et al. 2022 eq. 1): m_H^W = μ₀ + M_H,1^W + b_W (log P − 1) + Z_W [O/H];
 *  - tip of the red giant branch: μ = m_tip − M_TRGB (Freedman 2021, F814W zero point);
 *  - type Ia supernovae: m⁰_B = μ₀ + M⁰_B (eq. 3), and H₀ from log H₀ = 0.2 M⁰_B + a_B + 5 (eq. 5).
 * Extinction is not modelled: magnitudes are taken as already dereddened (the "0" subscript).
 */

/** Distance modulus of a distance in parsecs. */
export const muFromPc = (dPc: number) => 5 * Math.log10(dPc) - 5;
/** Distance in parsecs from a distance modulus. */
export const pcFromMu = (mu: number) => 10 ** (mu / 5 + 1);
/** Distance modulus from a distance in Mpc: 5 log₁₀(D/Mpc) + 25. */
export const muFromMpc = (dMpc: number) => 5 * Math.log10(dMpc) + 25;
/** Distance in Mpc from a distance modulus. */
export const mpcFromMu = (mu: number) => 10 ** ((mu - 25) / 5);
/** Parallax distance in pc for a parallax in milliarcseconds; null for ϖ ≤ 0. */
export const pcFromParallaxMas = (plxMas: number) => (plxMas > 0 ? 1000 / plxMas : null);
/** Linear error propagation of a parallax error into the distance modulus: σ_μ = (5 / ln 10) σϖ/ϖ. */
export const sigmaMuFromParallax = (plx: number, ePlx: number) => (5 / Math.LN10) * (ePlx / plx);
/** σ of a distance modulus from a fractional distance error: σ_μ = (5 / ln 10) σ_D/D. */
export const sigmaMuFromFraction = (frac: number) => (5 / Math.LN10) * frac;

export interface LeavittLaw { MW1: number; bW: number; ZW: number }
/** Absolute Wesenheit-H magnitude of a Cepheid with period P (days) and metallicity [O/H] (dex, relative to solar). */
export const leavittAbsMag = (periodDays: number, oh: number, L: LeavittLaw) => L.MW1 + L.bW * (Math.log10(periodDays) - 1) + L.ZW * oh;
/** Distance modulus of a Cepheid from its dereddened apparent magnitude. */
export const cepheidMu = (mW: number, periodDays: number, oh: number, L: LeavittLaw) => mW - leavittAbsMag(periodDays, oh, L);
/** Distance modulus from the apparent magnitude of the red-giant-branch tip. */
export const trgbMu = (mTip: number, Mtrgb: number) => mTip - Mtrgb;

/** H₀ (km/s/Mpc) from the SN Ia absolute magnitude and the Hubble-diagram intercept (Riess et al. 2022 eq. 5). */
export const h0FromMB = (MB: number, aB: number) => 10 ** (0.2 * MB + aB + 5);
/** The M⁰_B that gives a chosen H₀ with the same intercept (eq. 5 inverted). */
export const mbForH0 = (H0: number, aB: number) => 5 * (Math.log10(H0) - aB - 5);
/** Magnitude difference between two H₀ values, Δ(5 log₁₀ H₀): the offset of every Hubble-flow distance modulus. */
export const muOffsetForH0 = (Ha: number, Hb: number) => 5 * Math.log10(Ha / Hb);
/** Low-redshift Hubble-diagram intercept a_B = log₁₀(cz) − 0.2 m (eq. 4 at z → 0), cz in km/s. */
export const aBLowZ = (czKms: number, m: number) => Math.log10(czKms) - 0.2 * m;

/** Combine independent error components in quadrature. */
export const quadrature = (parts: number[]) => Math.sqrt(parts.reduce((s, x) => s + x * x, 0));
/**
 * Difference of two measurements in units of their combined σ, assuming independent Gaussian errors.
 * This is a simplification: it ignores shared systematics and non-Gaussian tails.
 */
export const tensionSigma = (a: number, sa: number, b: number, sb: number) => Math.abs(a - b) / Math.hypot(sa, sb);

/** Inverse-variance weighted mean and its σ. */
export function weightedMean(values: number[], sigmas: number[]): { mean: number; sigma: number } {
  let sw = 0, swx = 0;
  values.forEach((v, i) => { const w = 1 / sigmas[i] ** 2; sw += w; swx += w * v; });
  return { mean: swx / sw, sigma: 1 / Math.sqrt(sw) };
}
