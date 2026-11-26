/**
 * Centralised scientific constants registry (SI).
 *
 * Sources:
 *  - CODATA 2018 recommended values (NIST, https://physics.nist.gov/cuu/Constants/) — the 2019 SI
 *    redefinition makes c, h, e, k_B, N_A exact.
 *  - IAU 2012 Resolution B2 (astronomical unit, exact) and IAU 2015 Resolutions B2/B3 (nominal values).
 *
 * Every constant carries units and relative standard uncertainty (0 = exact by definition).
 */
import type { DimensionVector } from '../units/dimensions';
import { DIM } from '../units/dimensions';

export interface PhysicalConstant {
  symbol: string;
  name: string;
  value: number;
  unit: string;
  dimension: DimensionVector;
  /** relative standard uncertainty; 0 means exact by definition */
  relUncertainty: number;
  source: string;
}

const CODATA = 'CODATA 2018';
const c = (symbol: string, name: string, value: number, unit: string, dimension: DimensionVector, relUncertainty: number, source = CODATA): PhysicalConstant =>
  ({ symbol, name, value, unit, dimension, relUncertainty, source });

export const CONSTANTS = {
  c: c('c', 'speed of light in vacuum', 299_792_458, 'm s⁻¹', DIM.velocity, 0),
  h: c('h', 'Planck constant', 6.626_070_15e-34, 'J s', DIM.action, 0),
  hbar: c('ħ', 'reduced Planck constant', 6.626_070_15e-34 / (2 * Math.PI), 'J s', DIM.action, 0),
  e: c('e', 'elementary charge', 1.602_176_634e-19, 'C', DIM.charge, 0),
  kB: c('k_B', 'Boltzmann constant', 1.380_649e-23, 'J K⁻¹', DIM.entropy, 0),
  NA: c('N_A', 'Avogadro constant', 6.022_140_76e23, 'mol⁻¹', DIM.perAmount, 0),
  G: c('G', 'Newtonian constant of gravitation', 6.674_30e-11, 'm³ kg⁻¹ s⁻²', DIM.gravitational, 2.2e-5),
  me: c('m_e', 'electron mass', 9.109_383_7015e-31, 'kg', DIM.mass, 3.0e-10),
  mp: c('m_p', 'proton mass', 1.672_621_923_69e-27, 'kg', DIM.mass, 3.1e-10),
  mn: c('m_n', 'neutron mass', 1.674_927_498_04e-27, 'kg', DIM.mass, 5.7e-10),
  u: c('u', 'atomic mass constant (dalton)', 1.660_539_066_60e-27, 'kg', DIM.mass, 3.0e-10),
  a0: c('a₀', 'Bohr radius', 5.291_772_109_03e-11, 'm', DIM.length, 1.5e-10),
  Rinf: c('R∞', 'Rydberg constant', 10_973_731.568_160, 'm⁻¹', DIM.wavenumber, 1.9e-12),
  RyEV: c('R∞hc', 'Rydberg energy', 13.605_693_122_994, 'eV', DIM.energy, 1.9e-12),
  alpha: c('α', 'fine-structure constant', 7.297_352_5693e-3, '1', DIM.dimensionless, 1.5e-10),
  eps0: c('ε₀', 'vacuum electric permittivity', 8.854_187_8128e-12, 'F m⁻¹', DIM.permittivity, 1.5e-10),
  // ---- astronomy (IAU) ----
  au: c('au', 'astronomical unit', 149_597_870_700, 'm', DIM.length, 0, 'IAU 2012 Resolution B2'),
  julianYear: c('a', 'Julian year', 365.25 * 86_400, 's', DIM.time, 0, 'IAU (definition)'),
  GMsun: c('GM☉', 'nominal solar mass parameter', 1.327_124_4e20, 'm³ s⁻²', DIM.gravParam, 0, 'IAU 2015 Resolution B3 (nominal)'),
  Rsun: c('R☉', 'nominal solar radius', 6.957e8, 'm', DIM.length, 0, 'IAU 2015 Resolution B3 (nominal)'),
  Lsun: c('L☉', 'nominal solar luminosity', 3.828e26, 'W', DIM.power, 0, 'IAU 2015 Resolution B3 (nominal)'),
  GMearth: c('GM⊕', 'nominal terrestrial mass parameter', 3.986_004e14, 'm³ s⁻²', DIM.gravParam, 0, 'IAU 2015 Resolution B3 (nominal)'),
  GMjup: c('GM_J', 'nominal jovian mass parameter', 1.266_865_3e17, 'm³ s⁻²', DIM.gravParam, 0, 'IAU 2015 Resolution B3 (nominal)'),
  ReEarth: c('R_eE', 'nominal terrestrial equatorial radius', 6.3781e6, 'm', DIM.length, 0, 'IAU 2015 Resolution B3 (nominal)'),
  ReJup: c('R_eJ', 'nominal jovian equatorial radius', 7.1492e7, 'm', DIM.length, 0, 'IAU 2015 Resolution B3 (nominal)'),
} as const satisfies Record<string, PhysicalConstant>;

/** Derived astronomical lengths. */
export const LIGHT_YEAR_M = CONSTANTS.c.value * CONSTANTS.julianYear.value; // exact by IAU convention
export const PARSEC_M = CONSTANTS.au.value * (648_000 / Math.PI); // exact by IAU 2015 B2
/** Solar mass derived from nominal GM☉ and CODATA G (uncertainty dominated by G). */
export const SOLAR_MASS_KG = CONSTANTS.GMsun.value / CONSTANTS.G.value;
export const EV_J = CONSTANTS.e.value;
export const SECONDS_PER_DAY = 86_400;
export const JD_J2000 = 2_451_545.0;
export const DAYS_PER_JULIAN_CENTURY = 36_525;

export type ConstantKey = keyof typeof CONSTANTS;
export const constantList = (): PhysicalConstant[] => Object.values(CONSTANTS);
