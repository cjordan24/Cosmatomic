/**
 * Data-centre energy (Phase 15, Gate 15.7).
 *  PUE, as LBNL (2025 Update, p. 24) defines it: “the ratio of total facility energy use (including cooling and power
 *  distribution) to IT equipment energy use (excluding facility infrastructure)”. So facility = IT × PUE and the
 *  share of electricity going to infrastructure is 1 − 1/PUE.
 */
export const HOURS_PER_YEAR = 8760;
export const facilityPowerMW = (itMW: number, pue: number) => itMW * pue;
export const infrastructureShare = (pue: number) => 1 - 1 / pue;
/** Annual energy (TWh) of a constant load in MW. */
export const annualTWh = (MW: number) => (MW * HOURS_PER_YEAR) / 1e6;
/** Average power (GW) of an annual energy in TWh. */
export const averageGW = (TWh: number) => (TWh * 1e3) / HOURS_PER_YEAR;
