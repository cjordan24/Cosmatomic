/**
 * Waves and tissue, microscopy and medical imaging (Phase 13, Gates 13.4–13.6). Formulas read on page images or in
 * the source's own published text; constants from CODATA via src/core/constants.
 *
 * Tissue as a dielectric — Gabriel's four-dispersion Cole–Cole model as published by IFAC-CNR (Andreuccetti, Fossi &
 * Petrucci), eq. (3): ε̂(ω) = ε∞ + Σₙ Δεₙ / (1 + (jωτₙ)^(1−αₙ)) + σᵢ/(jωε₀). With ε̂ = ε′ − jε″ the conductivity is
 * σ = ωε₀ε″ (stated on the same page). Skin depth and SAR from the USAF Radiofrequency Radiation Dosimetry Handbook,
 * 4th ed. (Durney, Massoudi & Iskander 1986), Table 3.4: δ = (67.52/f)[√(ε′² + ε″²) − ε′]^(−1/2) with f in MHz and δ
 * in metres; SAR = σ|E|²/ρₘ (|E| rms, V/m; ρₘ in kg/m³).
 *
 * X-rays — Hubbell & Seltzer (NIST SRD 126), §2, eq. 1: I/I₀ = exp[−(μ/ρ)x], x = ρt the mass thickness.
 *
 * Ultrasound — Rayleigh, Theory of Sound II (1896) §270 eq. (23), normal incidence:
 * φ″ : φ′ = (ρ₁/ρ − V/V₁) : (ρ₁/ρ + V/V₁). Multiplying through by ρV₁ gives (ρ₁V₁ − ρV)/(ρ₁V₁ + ρV): with
 * Z = ρV this is (Z₁ − Z)/(Z₁ + Z) — a rearrangement, not printed by Rayleigh. The intensity ratio is its square
 * (his p. 82: “the ratio of intensities, which is as the square of the amplitudes”).
 *
 * MRI — CODATA 2022 shielded proton gyromagnetic ratio γ′ₚ/2π = 42.576 385 43 MHz T⁻¹ (NIST): the unit itself says
 * the precession frequency per tesla, f = (γ′ₚ/2π)B.
 *
 * Microscopy — Abbe (1873) §19, pp. 455–456: the smallest resolvable distance is the wavelength divided by the sine
 * of half the aperture angle for central illumination, and exactly half that for the most oblique illumination.
 * Electron wavelength — de Broglie & Flint (1930) p. 97, eq. (24): λ = h/√(2meP(1 + eP/2mc²)); (25) drops the
 * second-order term “always small”. The form is the same in SI with P in volts.
 */
import { CONSTANTS } from '@/core/constants/constants';

const { h, c, e, me, eps0 } = { h: CONSTANTS.h.value, c: CONSTANTS.c.value, e: CONSTANTS.e.value, me: CONSTANTS.me.value, eps0: CONSTANTS.eps0.value };

// ---------------- dielectric tissue (Gabriel / IFAC; USAF handbook) ----------------
/** One tissue row: ε∞, σᵢ (S/m), then four (Δε, τ in s, α). */
export interface ColeCole { epsInf: number; sigmaI: number; terms: [number, number, number][] }
/** Complex permittivity ε′ − jε″ at frequency f (Hz). */
export function gabriel(p: ColeCole, f: number): { epsR: number; epsI: number; sigma: number } {
  const w = 2 * Math.PI * f;
  let re = p.epsInf, im = 0;   // ε̂ = re + j·im
  for (const [d, tau, a] of p.terms) {
    if (d === 0) continue;
    // (jωτ)^(1−α) = (ωτ)^(1−α) · e^{jπ(1−α)/2}
    const m = (w * tau) ** (1 - a), ph = (Math.PI / 2) * (1 - a);
    const dr = 1 + m * Math.cos(ph), di = m * Math.sin(ph), den = dr * dr + di * di;
    re += (d * dr) / den; im += (-d * di) / den;
  }
  im += -p.sigmaI / (w * eps0);   // σᵢ/(jωε₀) = −j σᵢ/(ωε₀)
  const epsI = -im;
  return { epsR: re, epsI, sigma: w * eps0 * epsI };
}
/** USAF handbook Table 3.4: skin depth (m), f in MHz. */
export const skinDepthM = (epsR: number, epsI: number, fMHz: number) => (67.52 / fMHz) * (Math.hypot(epsR, epsI) - epsR) ** -0.5;
/** USAF handbook Table 3.4: SAR = σ|E|²/ρₘ (W/kg). */
export const sar = (sigma: number, Erms: number, rhoKgM3: number) => (sigma * Erms * Erms) / rhoKgM3;

// ---------------- X-rays (NIST SRD 126) ----------------
export const transmission = (muRho: number, rhoGcm3: number, tCm: number) => Math.exp(-muRho * rhoGcm3 * tCm);
export const halfValueLayerCm = (muRho: number, rhoGcm3: number) => Math.LN2 / (muRho * rhoGcm3);
/** Photon wavelength (m) for an energy in keV: λ = hc/E. */
export const photonWavelengthM = (keV: number) => (h * c) / (keV * 1e3 * e);

// ---------------- ultrasound (Rayleigh 1896) ----------------
/** Rayleigh eq. (23): amplitude ratio of the reflected wave, wave going from medium (ρ, V) into (ρ₁, V₁). */
export const rayleighAmplitude = (rho: number, V: number, rho1: number, V1: number) => (rho1 / rho - V / V1) / (rho1 / rho + V / V1);
export const reflectedIntensity = (rho: number, V: number, rho1: number, V1: number) => rayleighAmplitude(rho, V, rho1, V1) ** 2;
/** Round-trip echo time (s) from a reflector at depth d (m) in a medium of speed V (m/s). */
export const echoTimeS = (dM: number, V: number) => (2 * dM) / V;
/** FDA's derating: 0.3 dB cm⁻¹ MHz⁻¹, one way. */
export const fdaDeratingDb = (fMHz: number, dCm: number) => 0.3 * fMHz * dCm;

// ---------------- MRI (CODATA 2022) ----------------
export const GAMMA_P_SHIELDED_MHZ_T = 42.57638543;
export const GAMMA_P_MHZ_T = 42.577478461;
export const larmorMHz = (B: number, gamma = GAMMA_P_SHIELDED_MHZ_T) => gamma * B;

// ---------------- microscopy ----------------
/** Abbe (1873): smallest resolvable distance for central (λ/sin u) or most oblique (λ/2 sin u) illumination. */
export const abbeLimit = (lambda: number, halfAngleDeg: number, oblique: boolean) => lambda / (Math.sin((halfAngleDeg * Math.PI) / 180) * (oblique ? 2 : 1));
/** de Broglie & Flint eq. (24), SI, P in volts → λ in metres. */
export const electronWavelengthM = (P: number) => h / Math.sqrt(2 * me * e * P * (1 + (e * P) / (2 * me * c * c)));
/** Eq. (25): the first-order approximation. */
export const electronWavelengthApproxM = (P: number) => (h / Math.sqrt(2 * me * e * P)) * (1 - (e * P) / (4 * me * c * c));
/** Without relativity: h/√(2meP). */
export const electronWavelengthClassicalM = (P: number) => h / Math.sqrt(2 * me * e * P);
/** The term eP/2mc² that de Broglie & Flint call “always small”. */
export const relativisticTerm = (P: number) => (e * P) / (2 * me * c * c);
