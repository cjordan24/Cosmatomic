/**
 * Cosmic microwave background (Phase 7, Gate 7.3) — pure functions, no React.
 *
 *  - Blackbody intensity per unit frequency, B_ν (Planck's law, em.ts), expressed per wavenumber
 *    ν̃ [cm⁻¹] → ν = c ν̃ and in MJy/sr (1 MJy/sr = 10⁻²⁰ W m⁻² Hz⁻¹ sr⁻¹), the units of the FIRAS
 *    spectrum (Fixsen et al. 1996).
 *  - Residuals and χ² of the FIRAS monopole against a blackbody of temperature T, with the published
 *    diagonal 1σ errors (correlations not modelled), and the χ²-minimising temperature.
 *  - Temperature–redshift relation T(z) = T₀(1 + z)^(1−β), β = 0 for adiabatic expansion
 *    (Noterdaeme et al. 2011 §1, after Lima et al. 2000).
 *  - Angular power spectrum conversions: C_ℓ = 2π D_ℓ / [ℓ(ℓ+1)] (Planck 2018 V).
 *
 * Validity: Planck's law for an ideal blackbody; FIRAS per-point errors exclude the absolute temperature
 * scale, so χ² against an absolute T₀ measures the scale offset as much as the shape.
 */
import { CONSTANTS } from '../constants/constants';
import { peakFrequency, planckNu } from './em/em';

const C = CONSTANTS.c.value;
/** 1 MJy/sr in W m⁻² Hz⁻¹ sr⁻¹. */
export const MJY_SR = 1e-20;
/** Frequency in Hz of a wavenumber in cm⁻¹. */
export const hzFromWavenumber = (perCm: number) => C * 100 * perCm;
/** Frequency in GHz of a wavenumber in cm⁻¹. */
export const ghzFromWavenumber = (perCm: number) => hzFromWavenumber(perCm) / 1e9;
/** Blackbody intensity B_ν (MJy/sr) at a wavenumber (cm⁻¹) and temperature (K). */
export const blackbodyMJy = (perCm: number, T: number) => planckNu(hzFromWavenumber(perCm), T) / MJY_SR;

export interface FirasPoint { nu: number; resid: number; sigma: number }
/** FIRAS rows [ν cm⁻¹, LAMBDA col 2, residual kJy/sr, σ kJy/sr, Galaxy kJy/sr] → points. */
export const firasPoints = (rows: number[][]): FirasPoint[] => rows.map((r) => ({ nu: r[0], resid: r[2], sigma: r[3] }));
/** Observed intensity (MJy/sr) rebuilt from the published residual about the reference blackbody. */
export const firasIntensity = (p: FirasPoint, Tref: number) => blackbodyMJy(p.nu, Tref) + p.resid / 1000;
/** Residual (kJy/sr) of a FIRAS point about a blackbody of temperature T. */
export const residualAbout = (p: FirasPoint, Tref: number, T: number) => (firasIntensity(p, Tref) - blackbodyMJy(p.nu, T)) * 1000;
/** χ² of the FIRAS points about a blackbody of temperature T, diagonal errors. */
export const chi2About = (pts: FirasPoint[], Tref: number, T: number) => pts.reduce((s, p) => s + (residualAbout(p, Tref, T) / p.sigma) ** 2, 0);

/** Temperature that minimises χ² (golden-section search on [lo, hi]). */
export function bestFitT(pts: FirasPoint[], Tref: number, lo = 2.6, hi = 2.85): number {
  const g = (Math.sqrt(5) - 1) / 2;
  let a = lo, b = hi, c = b - g * (b - a), d = a + g * (b - a);
  for (let i = 0; i < 100; i++) {
    if (chi2About(pts, Tref, c) < chi2About(pts, Tref, d)) b = d; else a = c;
    c = b - g * (b - a); d = a + g * (b - a);
  }
  return (a + b) / 2;
}

/** CMB temperature at redshift z: T₀(1 + z)^(1−β); β = 0 is adiabatic expansion. */
export const cmbTemperature = (z: number, T0: number, beta = 0) => T0 * (1 + z) ** (1 - beta);
/** Redshift at which the CMB had temperature T (β = 0). */
export const redshiftAtTemperature = (T: number, T0: number) => T / T0 - 1;
/** Frequency of the B_ν peak (GHz) of the CMB at redshift z. */
export const cmbPeakGHz = (z: number, T0: number) => peakFrequency(cmbTemperature(z, T0)) / 1e9;

/** C_ℓ (µK²) from D_ℓ = ℓ(ℓ+1)C_ℓ/2π. */
export const clFromDl = (l: number, Dl: number) => (2 * Math.PI * Dl) / (l * (l + 1));
/** Local maxima of a sampled spectrum [[ℓ, D]] above a minimum ℓ (sorted by ℓ). */
export function localMaxima(rows: number[][], lMin = 0): { l: number; D: number }[] {
  const out: { l: number; D: number }[] = [];
  for (let i = 1; i < rows.length - 1; i++) if (rows[i][0] >= lMin && rows[i][1] > rows[i - 1][1] && rows[i][1] >= rows[i + 1][1]) out.push({ l: rows[i][0], D: rows[i][1] });
  return out;
}
/** Number of standard deviations between a measurement and a prediction (asymmetric errors: the side towards the prediction). */
export function pullSigma(value: number, lo: number, hi: number, predicted: number): number {
  const s = predicted >= value ? hi : lo;
  return (predicted - value) / s;
}
