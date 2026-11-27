/**
 * Voyager Physics Engine — atomic and molecular spectroscopy (Phase 10, Gate 10.4).
 *
 * NIST, Atomic Spectroscopy — A Compendium of Basic Ideas, Notation, Data, and Formulas (W. C. Martin and W. L. Wiese):
 *   §2 eq. 1: ΔE = hν = hcσ = hc/λ_vac; eq. 2: R_M = M(M + m_e)⁻¹ R∞ for nuclear mass M;
 *   §13 eq. 10: hydrogenic levels E_n = −Z²/n² in units of R_M; §19 eq. 30: (ΔE)_Z = R_M hc Z²(1/n_i² − 1/n_k²);
 *   §20 eq. 40: Doppler (Gaussian) FWHM Δλ = 7.16 × 10⁻⁷ λ (T/M)^½ (T in K, M in u; Δλ in the unit of λ);
 *   pressure-broadened shapes are “often approximately Lorentzian, I(λ) ∝ {1 + [(λ − λ₀)/Δλ½]²}⁻¹”.
 * Bohr (1913), Phil. Mag. 26, 1, §2 eq. 4: ν = (2π²me⁴/h³)(1/τ₂² − 1/τ₁²), τ₂ = 2 giving the Balmer series and τ₂ = 3
 *   Paschen's (fixed nucleus; the reduced-mass factor is the Compendium's eq. 2).
 * NIST Diatomic Spectral Database (¹Σ ground-state molecules, §2a): Dunham energies with Y₁₀ ≅ ω_e, Y₂₀ ≅ −ω_e x_e,
 *   Y₀₁ ≅ B_e, Y₁₁ ≅ −α_e, Y₀₂ ≅ −D_e; reduced mass μ = M₁M₂/(M₁ + M₂) (eq. 5); pure-rotation lines with ΔJ = +1,
 *   ν = 2B_v J′ − 4D_v J′³ (eq. 7); B_v = B_e − α_e(v + ½) (eq. 8). Constants from Huber & Herzberg via the NIST WebBook.
 * Validity: hydrogenic lines without fine structure, Lamb shift or hyperfine structure; Doppler widths for a Maxwellian
 *   gas only; diatomic levels to the terms listed (no higher Dunham terms), ground electronic state only.
 */
import { CONSTANTS } from '@/core/constants/constants';

// ---------------------------------------------------------------- hydrogen-like atoms
/** R_M = R∞ M/(M + m_e) (Compendium eq. 2), M the nuclear mass in kg. Returns m⁻¹. */
export const rydbergM = (nuclearMassKg: number) => (CONSTANTS.Rinf.value * nuclearMassKg) / (nuclearMassKg + CONSTANTS.me.value);
/** Vacuum wavelength (m) of the n_k → n_i transition of a one-electron atom (Compendium eq. 30 with eq. 1). */
export function hydrogenicWavelength(Z: number, nuclearMassKg: number, ni: number, nk: number): number {
  return 1 / (rydbergM(nuclearMassKg) * Z * Z * (1 / (ni * ni) - 1 / (nk * nk)));
}
/** Bohr's 1913 frequency for a fixed nucleus, ν = R∞c(1/τ₂² − 1/τ₁²) — 2π²me⁴/h³ is R∞c in today's SI notation. */
export const bohrFrequency = (tau2: number, tau1: number) => CONSTANTS.Rinf.value * CONSTANTS.c.value * (1 / (tau2 * tau2) - 1 / (tau1 * tau1));

// ---------------------------------------------------------------- line shapes
/** Doppler FWHM (Compendium eq. 40): λ and the result in the same length unit, T in K, M in u. */
export const dopplerFwhm = (lambda: number, T: number, M: number) => 7.16e-7 * lambda * Math.sqrt(T / M);
/** Gaussian profile with that FWHM, peak 1. */
export const gaussian = (x: number, x0: number, fwhm: number) => Math.exp((-4 * Math.LN2 * (x - x0) ** 2) / (fwhm * fwhm));
/** Lorentzian {1 + [(λ − λ₀)/Δλ½]²}⁻¹ (Compendium §20), Δλ½ the half width at half maximum; peak 1. */
export const lorentzian = (x: number, x0: number, hwhm: number) => 1 / (1 + ((x - x0) / hwhm) ** 2);

// ---------------------------------------------------------------- diatomic molecules
export interface DiatomicConstants { we: number; wexe: number; Be: number; alphae: number | null; De: number | null }
/** Vibrational term G(v) = ω_e(v + ½) − ω_e x_e(v + ½)² (Dunham Y₁₀, Y₂₀), cm⁻¹. */
export const vibrationalTerm = (c: DiatomicConstants, v: number) => c.we * (v + 0.5) - c.wexe * (v + 0.5) ** 2;
/** B_v = B_e − α_e(v + ½) (eq. 8). */
export const rotationalConstant = (c: DiatomicConstants, v: number) => c.Be - (c.alphae ?? 0) * (v + 0.5);
/** Rotational term F_v(J) = B_v J(J + 1) − D J²(J + 1)² (Dunham Y₀₁, Y₁₁, Y₀₂), cm⁻¹. */
export const rotationalTerm = (c: DiatomicConstants, v: number, J: number) => rotationalConstant(c, v) * J * (J + 1) - (c.De ?? 0) * (J * (J + 1)) ** 2;
/** Pure-rotation line J′ − 1 → J′ in state v (eq. 7), cm⁻¹. */
export const rotationLine = (c: DiatomicConstants, v: number, Jup: number) => 2 * rotationalConstant(c, v) * Jup - 4 * (c.De ?? 0) * Jup ** 3;
/** Reduced mass μ = M₁M₂/(M₁ + M₂) (eq. 5), in the unit of the masses. */
export const reducedMass = (m1: number, m2: number) => (m1 * m2) / (m1 + m2);
/** Wavenumber (cm⁻¹) → frequency (Hz) and wavelength (m) by eq. 1. */
export const wavenumberToHz = (sigma: number) => sigma * 100 * CONSTANTS.c.value;
export const wavenumberToM = (sigma: number) => 1 / (sigma * 100);
