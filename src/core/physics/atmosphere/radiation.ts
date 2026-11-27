/**
 * Voyager Physics Engine — atmospheric radiation and remote sensing (Phase 10, Gate 10.7). SI units.
 *
 * Rayleigh, Scientific Papers vol. 1, Art. 8 (1871), p. 91: “When light is scattered by particles which are very small
 *   compared with any of the wave-lengths, the ratio of the amplitudes of the vibrations of the scattered and incident light
 *   varies inversely as the square of the wave-length, and the intensity of the lights themselves as the inverse fourth power.”
 * Rayleigh, Scientific Papers vol. 4, Art. 247 (1899), pp. 399–403 (page images read): E = E₀e^{−hx} (eq. 4) with, “on
 *   either theory”, h = 32π³(μ − 1)²/(3nλ⁴) (eq. 14), μ the refractive index of the gas and n the number of molecules per unit
 *   volume. With λ = 6 × 10⁻⁵ cm and μ − 1 = ·0003, x = 1/h = 4·4 × 10⁻¹³ × n cm (eq. 23); with Maxwell's n = 19 × 10¹⁸ per
 *   cm³, x = 83 km. “Bouguer and others estimate about ·8 for the transmission of light through the entire atmosphere from a
 *   star in the zenith. This corresponds to 8·3 kilometres of air at standard pressure.”
 * Mecherikunnel & Richmond, NASA TM-82021 (1980), §II.A, p. 7: Bouguer's law E_λ = E°_λ e^{−(c₁ + c₂ + c₃)m}; “The air mass
 *   is equal to the secant of the solar zenith angle, z. This relationship is not strictly true for large values of solar
 *   zenith angles (z ≥ 62°)”. NASA AERONET: V = V₀d² exp(−τ m), the Beer–Lambert–Bouguer law with optical depth τ.
 * Validity: molecular (Rayleigh) scattering only — no aerosols, ozone or water-vapour absorption; μ − 1 independent of λ
 *   (Rayleigh's value); plane-parallel atmosphere (air mass = sec z, below 62°).
 */
import { CONSTANTS } from '@/core/constants/constants';

/** Relative scattered intensity ∝ λ⁻⁴ (Rayleigh 1871), normalised at λ₀. */
export const rayleighRelative = (lambda: number, lambda0 = 550e-9) => (lambda0 / lambda) ** 4;
/** Rayleigh's extinction coefficient h = 32π³(μ − 1)²/(3nλ⁴) (1899 eq. 14), per metre; n per m³, λ in m. */
export const rayleighExtinction = (lambda: number, muMinus1: number, n: number) => (32 * Math.PI ** 3 * muMinus1 ** 2) / (3 * n * lambda ** 4);

/** Rayleigh's 1899 inputs. */
export const RAYLEIGH_1899 = { lambda: 6e-7, muMinus1: 0.0003, nMaxwell: 19e18 * 1e6, homogeneousAtmosphere: 8.3e3, bouguerZenith: 0.8 } as const;
/** Molecules per m³ in an ideal gas at 101.325 kPa and 273.15 K, p/kT (CODATA k). */
export const loschmidt = () => 101_325 / (CONSTANTS.kB.value * 273.15);

/** Air mass m = sec z (TM-82021); null at or beyond 90°, flagged by the caller beyond 62°. */
export const airMass = (zenith: number) => (zenith < Math.PI / 2 ? 1 / Math.cos(zenith) : null);
/** Bouguer's law: transmitted fraction exp(−τ m). */
export const bouguer = (tau: number, m: number) => Math.exp(-tau * m);
/** Molecular optical depth of the whole atmosphere at the zenith: h × Rayleigh's 8.3 km of air at standard pressure. */
export const molecularDepth = (lambda: number, n: number, muMinus1: number = RAYLEIGH_1899.muMinus1, H: number = RAYLEIGH_1899.homogeneousAtmosphere) =>
  rayleighExtinction(lambda, muMinus1, n) * H;

/** Landsat 8–9 bands (USGS, “What are the band designations for the Landsat satellites?”), µm and metres, as printed. */
export const LANDSAT_89: { band: number; name: string; lo: number; hi: number; res: string; sensor: 'OLI' | 'TIRS' }[] = [
  { band: 1, name: 'Coastal aerosol', lo: 0.43, hi: 0.45, res: '30', sensor: 'OLI' },
  { band: 2, name: 'Blue', lo: 0.45, hi: 0.51, res: '30', sensor: 'OLI' },
  { band: 3, name: 'Green', lo: 0.53, hi: 0.59, res: '30', sensor: 'OLI' },
  { band: 4, name: 'Red', lo: 0.64, hi: 0.67, res: '30', sensor: 'OLI' },
  { band: 5, name: 'Near Infrared (NIR)', lo: 0.85, hi: 0.88, res: '30', sensor: 'OLI' },
  { band: 6, name: 'Shortwave Infrared (SWIR) 1', lo: 1.57, hi: 1.65, res: '30', sensor: 'OLI' },
  { band: 7, name: 'Shortwave Infrared (SWIR) 2', lo: 2.11, hi: 2.29, res: '30', sensor: 'OLI' },
  { band: 8, name: 'Panchromatic', lo: 0.50, hi: 0.68, res: '15', sensor: 'OLI' },
  { band: 9, name: 'Cirrus', lo: 1.36, hi: 1.38, res: '30', sensor: 'OLI' },
  { band: 10, name: 'Thermal Infrared (TIRS) 1', lo: 10.6, hi: 11.19, res: '100 (resampled to 30)', sensor: 'TIRS' },
  { band: 11, name: 'Thermal Infrared (TIRS) 2', lo: 11.50, hi: 12.51, res: '100 (resampled to 30)', sensor: 'TIRS' },
];
