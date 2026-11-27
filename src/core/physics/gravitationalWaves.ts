/**
 * Gravitational waves from compact binaries (Phase 7, Gate 7.5) — pure functions, no React.
 *
 * Leading order ("0PN": Newtonian orbits + Einstein's quadrupole formula), as in the LIGO/Virgo
 * Collaborations' "The basic physics of the binary black hole merger GW150914" (abbott-2017-basic-physics):
 *  - chirp mass  𝓜 = (m₁m₂)^(3/5) / (m₁ + m₂)^(1/5)                                    (eq. 6)
 *  - 𝓜 = (c³/G) [ (5/96) π^(−8/3) f^(−11/3) ḟ ]^(3/5)                                  (eq. 7; PRL eq. 1)
 *  - f^(−8/3)(t) = (8π)^(8/3)/5 · (G𝓜/c³)^(5/3) · (t_c − t)                              (eq. 8)
 *  - Keplerian separation R = (GM/ω²)^(1/3), orbital ω = 2π f_orb = π f_GW                (eqs. 3, 9)
 *  - masses from 𝓜 and q = m₁/m₂ ≥ 1: m₁ = 𝓜(1+q)^(1/5) q^(2/5), m₂ = 𝓜(1+q)^(1/5) q^(−3/5)   (eq. 10)
 *  - compactness ratio R / [r_s(m₁) + r_s(m₂)]                                            (§3, eq. 11)
 *  - strain hᵢⱼ = (2G/c⁴d_L) d²Qᵢⱼ/dt² (eq. 4) with Qᵢⱼ = ½μr²Iᵢⱼ for a circular orbit (eq. A3):
 *    for an observer on the orbital axis the amplitude is h = 4Gμr²ω²/(c⁴d_L)
 *    = 4 (G𝓜)^(5/3) (π f)^(2/3) / (c⁴ d_L)                                                (derived here)
 *  - luminosity dE/dt = (32/5)(G/c⁵) μ² r⁴ ω⁶                                              (eq. A4)
 *  - energy radiated down to separation r: G M μ / (2r)                                    (eq. 23)
 *  - distance estimate d_L ∼ 45 Gpc · (Hz / f_max) · (10⁻²¹ / h_max)                       (eq. 22)
 * Cosmological redshift: the waveform depends on (1 + z)·mass (detector frame) — "Masses are given in the
 * source frame; to convert to the detector frame multiply by (1 + z)" (abbott-2016-gw150914 Table I).
 * The innermost stable circular orbit 6GM/c² (relativity.ts, Carroll 1997) gives the test-particle
 * estimate f_GW,ISCO = c³ / (6^(3/2) π G M), where the inspiral formulas stop.
 *
 * Speed of gravity: Δv/v_EM ≈ v_EM Δt / D (abbott-2017-grb §4.1).
 *
 * Validity: circular, non-spinning point masses; Newtonian dynamics, so frequencies and times are good only
 * well before merger (PN parameter x = GM/(c²r) ≪ 1); merger and ringdown are not modelled; amplitude for an
 * optimally placed observer on the orbital axis with no detector response.
 */
import { CONSTANTS, PARSEC_M } from '../constants/constants';

const C = CONSTANTS.c.value;
const GMSUN = CONSTANTS.GMsun.value;
/** G M☉ / c³ in seconds (nominal solar mass parameter, IAU 2015 B3). */
export const TSUN = GMSUN / C ** 3;
export const MPC_M = PARSEC_M * 1e6;

/** Chirp mass (same units as the inputs), eq. 6. */
export const chirpMass = (m1: number, m2: number) => (m1 * m2) ** 0.6 / (m1 + m2) ** 0.2;
/** Symmetric mass ratio μ/M (≤ 1/4). */
export const symmetricMassRatio = (m1: number, m2: number) => (m1 * m2) / (m1 + m2) ** 2;
/** Component masses from the chirp mass and q = m₁/m₂ ≥ 1, eq. 10. */
export function massesFromChirp(mc: number, q: number): { m1: number; m2: number } {
  const k = mc * (1 + q) ** 0.2;
  return { m1: k * q ** 0.4, m2: k * q ** -0.6 };
}

/** ḟ (Hz/s) of the GW frequency f (Hz) for chirp mass 𝓜 (M☉, detector frame): eq. 7 solved for ḟ. */
export const fdot = (mcSolar: number, f: number) => (96 / 5) * Math.PI ** (8 / 3) * (mcSolar * TSUN) ** (5 / 3) * f ** (11 / 3);
/** Chirp mass (M☉) from f and ḟ, eq. 7. */
export const chirpMassFromFfdot = (f: number, fd: number) => (((5 / 96) * Math.PI ** (-8 / 3) * f ** (-11 / 3) * fd) ** 0.6) / TSUN;
/** Time to coalescence t_c − t (s) from GW frequency f (Hz), eq. 8. */
export const timeToCoalescence = (mcSolar: number, f: number) => (5 * f ** (-8 / 3)) / ((8 * Math.PI) ** (8 / 3) * (mcSolar * TSUN) ** (5 / 3));
/** GW frequency (Hz) at time τ = t_c − t (s) before coalescence, eq. 8. */
export const frequencyAtTime = (mcSolar: number, tau: number) => (((8 * Math.PI) ** (8 / 3) / 5) * (mcSolar * TSUN) ** (5 / 3) * tau) ** (-3 / 8);
/**
 * GW phase accumulated from τ to coalescence (radians): Φ(τ) = 2π ∫₀^τ f dτ′ with eq. 8,
 * = 2π · (8/5) · A^(−3/8) τ^(5/8), A = (8π)^(8/3)/5 · (G𝓜/c³)^(5/3).
 */
export function phaseToCoalescence(mcSolar: number, tau: number): number {
  const A = ((8 * Math.PI) ** (8 / 3) / 5) * (mcSolar * TSUN) ** (5 / 3);
  return 2 * Math.PI * 1.6 * A ** -0.375 * tau ** 0.625;
}
/** Number of GW cycles between frequencies f1 < f2. */
export const cyclesBetween = (mcSolar: number, f1: number, f2: number) =>
  (phaseToCoalescence(mcSolar, timeToCoalescence(mcSolar, f1)) - phaseToCoalescence(mcSolar, timeToCoalescence(mcSolar, f2))) / (2 * Math.PI);

/** Keplerian separation (m) for total mass M (M☉) at GW frequency f (Hz), eq. 9 with ω = π f. */
export const separationAt = (mSolar: number, f: number) => Math.cbrt((mSolar * GMSUN) / (Math.PI * f) ** 2);
/** Separation over the sum of the Schwarzschild radii 2GM/c² (§3). */
export const compactnessRatio = (mSolar: number, f: number) => separationAt(mSolar, f) / ((2 * mSolar * GMSUN) / C ** 2);
/** Post-Newtonian parameter x = GM/(c² r) = (v/c)² at GW frequency f (§4.4). */
export const pnParameter = (mSolar: number, f: number) => (mSolar * GMSUN) / (C ** 2 * separationAt(mSolar, f));
/** GW frequency (Hz) at the test-particle ISCO r = 6GM/c²: c³ / (6^(3/2) π G M). */
export const iscoFrequency = (mSolar: number) => 1 / (6 ** 1.5 * Math.PI * mSolar * TSUN);
/** Orbital speed v/c at GW frequency f: (π G M f / c³)^(1/3). */
export const orbitalSpeedOverC = (mSolar: number, f: number) => Math.cbrt(Math.PI * mSolar * TSUN * f);

/** Strain amplitude (dimensionless) for an observer on the orbital axis; 𝓜 in M☉ (detector frame), d_L in Mpc. */
export const strainAmplitude = (mcSolar: number, f: number, dLMpc: number) =>
  (4 * C * (mcSolar * TSUN) ** (5 / 3) * (Math.PI * f) ** (2 / 3)) / (dLMpc * MPC_M);
/** GW luminosity (W) at GW frequency f, eq. A4 with Kepler's law; masses in M☉ (any frame used consistently). */
export function luminosityAt(m1: number, m2: number, f: number): number {
  const M = m1 + m2, mu = (m1 * m2) / M, r = separationAt(M, f), w = Math.PI * f;
  const muKg = (mu * GMSUN) / CONSTANTS.G.value;
  return (32 / 5) * (CONSTANTS.G.value / C ** 5) * muKg ** 2 * r ** 4 * w ** 6;
}
/** Planck luminosity c⁵/G (W), eq. 19. */
export const PLANCK_LUMINOSITY = C ** 5 / CONSTANTS.G.value;
/** Orbital energy released (M☉c²) between infinity and the separation at GW frequency f, eq. 23. */
export const energyRadiatedTo = (m1: number, m2: number, f: number) => {
  const M = m1 + m2, mu = (m1 * m2) / M;
  return ((M * GMSUN) / C ** 2) * mu / (2 * separationAt(M, f));
};
/** Order-of-magnitude distance (Mpc) from the peak frequency and strain, eq. 22. */
export const distanceEstimateMpc = (fMax: number, hMax: number) => 45e3 * (1 / fMax) * (1e-21 / hMax);

/** Detector-frame mass from a source-frame mass. */
export const detectorFrame = (mSource: number, z: number) => mSource * (1 + z);

/**
 * Leading-order inspiral waveform h(t) = h(f(τ)) cos Φ(τ), sampled from frequency fLow up to fHigh (Hz).
 * Times are t − t_c (negative). Returns at most n points.
 */
export function inspiralWaveform(mcSolar: number, dLMpc: number, fLow: number, fHigh: number, n = 2000): { t: number; h: number; f: number }[] {
  if (!(fHigh > fLow) || !(fLow > 0)) return [];
  const t0 = timeToCoalescence(mcSolar, fLow), t1 = timeToCoalescence(mcSolar, fHigh);
  const out: { t: number; h: number; f: number }[] = [];
  for (let i = 0; i < n; i++) {
    const tau = t0 - ((t0 - t1) * i) / (n - 1);
    const f = frequencyAtTime(mcSolar, tau);
    out.push({ t: -tau, h: strainAmplitude(mcSolar, f, dLMpc) * Math.cos(phaseToCoalescence(mcSolar, tau)), f });
  }
  return out;
}

/** Fractional speed difference Δv/v_EM ≈ c Δt / D for a delay Δt (s) over D (Mpc), abbott-2017-grb §4.1. */
export const speedDifference = (dtSeconds: number, dMpc: number) => (C * dtSeconds) / (dMpc * MPC_M);
/** Light travel time (s) across D (Mpc). */
export const lightTravelSeconds = (dMpc: number) => (dMpc * MPC_M) / C;
