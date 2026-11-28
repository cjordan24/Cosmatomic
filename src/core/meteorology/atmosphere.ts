/**
 * Earth's atmosphere (Phase 20): the U.S. Standard Atmosphere, 1976 to 86 km (layer table, hydrostatic pressure,
 * ideal-gas density), scale height, and humidity relations (saturation vapour pressure, dew point, cloud-base
 * estimate). Constants are those of the 1976 standard; sources are cited in the view and SCIENTIFIC_MODELS.md §77.
 */
export const USSA = {
  g0: 9.80665,            // m/s²
  M0: 0.0289644,          // kg/mol, mean molar mass of air below 86 km
  Rstar: 8.31432,         // J/(mol·K), the 1976 standard's gas constant
  r0: 6356766,            // m, Earth radius used for geopotential altitude
  T0: 288.15, P0: 101325,
  /** base geopotential altitude (m) and lapse rate (K/m) of each layer */
  layers: [[0, -0.0065], [11000, 0], [20000, 0.001], [32000, 0.0028], [47000, 0], [51000, -0.0028], [71000, -0.002]] as [number, number][],
  topH: 84852,
};
export const LAYER_NAMES = ['troposphere', 'tropopause', 'stratosphere', 'stratosphere', 'stratopause', 'mesosphere', 'mesosphere'];

/** Geometric altitude z (m) → geopotential altitude H (m). */
export const geopotential = (z: number) => (USSA.r0 * z) / (USSA.r0 + z);

/** Base temperature and pressure of every layer, built by integrating the hydrostatic equation layer by layer. */
const BASES = (() => {
  const out: { H: number; L: number; T: number; P: number }[] = [];
  let T = USSA.T0, P = USSA.P0;
  const k = (USSA.g0 * USSA.M0) / USSA.Rstar;
  USSA.layers.forEach(([H, L], i) => {
    out.push({ H, L, T, P });
    const next = USSA.layers[i + 1]?.[0] ?? USSA.topH, dH = next - H;
    if (L === 0) P = P * Math.exp((-k * dH) / T);
    else P = P * (T / (T + L * dH)) ** (k / L);
    T = T + L * dH;
  });
  return out;
})();

/** Temperature (K), pressure (Pa), density (kg/m³), layer index at geometric altitude z (m), 0 ≤ z ≤ 86 km. */
export function standardAtmosphere(z: number) {
  const H = Math.min(geopotential(Math.max(0, z)), USSA.topH);
  let i = BASES.length - 1;
  while (i > 0 && H < BASES[i].H) i--;
  const b = BASES[i], dH = H - b.H, T = b.T + b.L * dH, k = (USSA.g0 * USSA.M0) / USSA.Rstar;
  const P = b.L === 0 ? b.P * Math.exp((-k * dH) / b.T) : b.P * (b.T / T) ** (k / b.L);
  const rho = (P * USSA.M0) / (USSA.Rstar * T);
  return { T, P, rho, layer: i, H };
}
export const layerBases = () => BASES.map((b) => ({ ...b }));

/** Scale height H = R*T/(M g) in metres. */
export const scaleHeight = (T: number, g = USSA.g0, M = USSA.M0) => (USSA.Rstar * T) / (M * g);
/** Dry adiabatic lapse rate g/cp (K/m). */
export const dryLapse = (g = USSA.g0, cp = 1004) => g / cp;

/** Saturation vapour pressure over water (hPa), NWS: e_s = 6.11 × 10^(7.5 T / (237.3 + T)), T in °C. */
export const satVapour = (tC: number) => 6.11 * 10 ** ((7.5 * tC) / (237.3 + tC));
/** Dew point (°C) from temperature (°C) and relative humidity (0–1), inverting the same formula. */
export function dewPoint(tC: number, rh: number) {
  const g = Math.log10((Math.max(1e-6, rh) * satVapour(tC)) / 6.11);
  return (237.3 * g) / (7.5 - g);
}
/** Relative humidity (0–1) from temperature and dew point (°C): e / e_s. */
export const relHumidity = (tC: number, tdC: number) => satVapour(tdC) / satVapour(tC);
/** Cloud-base estimate, FAA/NWS: spread in °F ÷ 4.4 × 1,000 ft. Returns metres (converted). */
export const cloudBaseFt = (tC: number, tdC: number) => ((Math.max(0, tC - tdC) * 1.8) / 4.4) * 1000;
export const cloudBase = (tC: number, tdC: number) => cloudBaseFt(tC, tdC) * 0.3048;

// ---------------- radiation (Gate 20.3) ----------------
/** Effective (emission) temperature of a planet: [S(1 − α) / (4σ)]^¼. */
export const effectiveTemp = (S: number, albedo: number, sigma = 5.670374419e-8) => ((S * (1 - albedo)) / (4 * sigma)) ** 0.25;
/** Simplified CO₂ forcing (Penn State METEO 469, after Myhre et al. 1998): 5.35 ln(C/C₀) W/m². */
export const co2ForcingSimple = (C: number, C0 = 280) => 5.35 * Math.log(C / C0);
/** CO₂ effective radiative forcing as printed in NOAA AGGI Table 1 (IPCC AR6 / Meinshausen et al. 2020):
 *  ΔF = (α′ + c1√N) ln(C/C₀) e1, α′ = d1 + a1(C − C₀)² + b1(C − C₀). */
export function co2ForcingAR6(C: number, N = 338.86, C0 = 278.3) {
  const d1 = 5.2488, a1 = -2.48e-7, b1 = 7.59e-4, c1 = -2.15e-3, e1 = 1.05, dC = C - C0;
  const alpha = d1 + a1 * dC * dC + b1 * dC;
  return (alpha + c1 * Math.sqrt(N)) * Math.log(C / C0) * e1;
}
/** Total-column ozone: molecules per cm² (1 DU = 2.687 × 10¹⁶) and pure-ozone thickness at the surface (300 DU = 3 mm). */
export const duToMolecules = (du: number) => du * 2.687e16;
export const duToMm = (du: number) => du * 0.01;
