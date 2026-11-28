/**
 * Plasma parameters (Phase 14, Gate 14.4), SI with CODATA constants; the NRL Plasma Formulary's practical forms
 * (n in cm⁻³, T in eV, B in gauss) follow from these and are checked in the tests.
 *
 *   electron plasma frequency  ω_pe = √(n e²/ε₀ mₑ)
 *   Debye length               λ_D = √(ε₀ k T / n e²)       (T the electron temperature)
 *   electron gyrofrequency     ω_ce = eB/mₑ
 *   Alfvén speed               v_A = B/√(μ₀ ρ),  ρ = n mᵢ
 *   plasma beta                β = n k T / (B²/2μ₀)
 *   thermal speed              v_th = √(kT/m)
 */
import { CONSTANTS } from '@/core/constants/constants';

const { e, me, mp, eps0, kB, c } = { e: CONSTANTS.e.value, me: CONSTANTS.me.value, mp: CONSTANTS.mp.value, eps0: CONSTANTS.eps0.value, kB: CONSTANTS.kB.value, c: CONSTANTS.c.value };
export const MU0 = 1 / (eps0 * c * c);
/** eV → kelvin. */
export const EV_K = e / kB;

/** n in m⁻³ → electron plasma frequency f_pe (Hz). */
export const plasmaFrequencyHz = (n: number) => Math.sqrt((n * e * e) / (eps0 * me)) / (2 * Math.PI);
/** Debye length (m) for n (m⁻³) and electron temperature T (eV). */
export const debyeLengthM = (n: number, TeV: number) => Math.sqrt((eps0 * TeV * e) / (n * e * e));
/** Electron gyrofrequency f_ce (Hz) for B (tesla). */
export const gyroFrequencyHz = (B: number) => (e * B) / me / (2 * Math.PI);
/** Alfvén speed (m/s), B in tesla, ion density n (m⁻³), ion mass in proton masses. */
export const alfvenSpeed = (B: number, n: number, mu = 1) => B / Math.sqrt(MU0 * n * mu * mp);
/** Plasma beta for one species (n m⁻³, T eV, B tesla). */
export const plasmaBeta = (n: number, TeV: number, B: number) => (n * TeV * e) / ((B * B) / (2 * MU0));
/** Thermal speed √(kT/m) (m/s), T in eV, mass in kg. */
export const thermalSpeed = (TeV: number, m: number) => Math.sqrt((TeV * e) / m);
/** Electrons in a Debye sphere: (4π/3) n λ_D³. */
export const debyeNumber = (n: number, TeV: number) => (4 * Math.PI / 3) * n * debyeLengthM(n, TeV) ** 3;
export const ELECTRON_MASS = me, PROTON_MASS = mp;
