/**
 * Human activities (Gate 24.1): pure arithmetic on published values. Nothing here invents data — each function
 * combines numbers that the view takes from datasets/meteorology/human.json and labels as derived.
 */

/** Carbon budget imbalance B_IM = E_FOS + E_LUC − (G_ATM + S_OCEAN + S_LAND), GtC/yr (GCB definition). */
export function budgetImbalance(b: { fossil: number; luc: number; atm: number; ocean: number; land: number }): number {
  return b.fossil + b.luc - (b.atm + b.ocean + b.land);
}

/** Shares (fractions summing to 1) of a list of positive values. */
export function shares(values: number[]): number[] {
  const t = values.reduce((a, b) => a + b, 0);
  return t > 0 ? values.map((v) => v / t) : values.map(() => 0);
}

/**
 * Grid-average life-cycle intensity of an electricity mix, g CO₂e/kWh: the weighted mean of technology medians.
 * Weights need not sum to 1 (they are normalised). Illustrative: a mean of medians is not itself a median.
 */
export function mixIntensity(mix: { weight: number; gPerKWh: number }[]): number {
  const w = mix.reduce((a, m) => a + Math.max(0, m.weight), 0);
  return w > 0 ? mix.reduce((a, m) => a + Math.max(0, m.weight) * m.gPerKWh, 0) / w : 0;
}

/** Molar masses from standard atomic weights. */
export const molarMass = (atoms: [number, number][]) => atoms.reduce((a, [w, n]) => a + w * n, 0);

/**
 * Andrew (2019) eq. 1: process CO₂ from cement, E = (Mr_CO2 / Mr_CaO) · f_CaO,clinker · f_clinker,cement · M_cement.
 * Same unit as mCement.
 */
export function cementProcessCO2(o: { mrCO2: number; mrCaO: number; fCaO: number; clinkerRatio: number; mCement: number }): number {
  return (o.mrCO2 / o.mrCaO) * o.fCaO * o.clinkerRatio * o.mCement;
}

/** Mean heat flux (W/m²) of a yearly energy use (EJ) spread over an area (m²). Year = 365.25 d. */
export function heatFlux(ej: number, area: number): number {
  return (ej * 1e18) / (365.25 * 86400) / area;
}

/** °F temperature difference → °C difference. */
export const dF2dC = (dF: number) => (dF * 5) / 9;
