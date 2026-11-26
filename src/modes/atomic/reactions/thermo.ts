/**
 * Reaction thermochemistry from standard-state formation data (Gate 4.2).
 *
 *   ΔrX° = Σ ν ΔfX°(products) − Σ ν ΔfX°(reactants)   (X = H; S uses absolute S°)
 *   ΔrG°(T) ≈ ΔrH°(298.15) − T·ΔrS°(298.15)          (ΔrCp° = 0 approximation)
 *   K(T) = exp(−ΔrG°(T) / RT)
 *
 * Uncertainties are combined in quadrature (treating tabulated values as independent; CODATA values
 * are in fact correlated, so the combined figure is indicative). Any species without data makes the
 * corresponding result unknown (null) — values are never estimated.
 * Photons (hν) and third bodies (M) carry no formation enthalpy: for photochemical steps ΔrH° is the
 * enthalpy the photon must supply (at least), not a property of light.
 */
import data from '@datasets/chemistry/thermochemistry.json';
import { CONSTANTS } from '@/core/constants/constants';
import type { Equation } from './equation';
import type { EnergyQuantity, Measurement } from '@/core/physics/energy/energy';

export const R_GAS = CONSTANTS.NA.value * CONSTANTS.kB.value; // J mol⁻¹ K⁻¹, exact (2019 SI)
export const T_STD = 298.15;

interface V { value: number; uncertainty: number | null; source: string; method?: string; reference?: string; derived?: boolean }
export interface ThermoSpecies { key: string; name?: string; dfH?: V; S?: V; H298mH0?: V; source: 'CODATA' | 'NIST WebBook'; url: string }

export const THERMO: ThermoSpecies[] = (data as { species: ThermoSpecies[] }).species;
const BY_KEY = new Map(THERMO.map((s) => [s.key, s]));
export const thermoFor = (key: string) => BY_KEY.get(key.trim());

export interface ReactionThermo {
  dH: EnergyQuantity;            // kJ/mol
  dS: EnergyQuantity;            // J/(mol·K)
  missingH: string[];
  missingS: string[];
  /** per-species values used (for the table/sources panel) */
  terms: { key: string; nu: number; data: ThermoSpecies | undefined }[];
  photochemical: boolean;
}

const sumTerms = (terms: { nu: number; v: V | undefined }[]) => {
  let value = 0; let var2 = 0; let unc = true;
  for (const { nu, v } of terms) {
    value += nu * v!.value;
    if (v!.uncertainty === null) unc = false; else var2 += (nu * v!.uncertainty) ** 2;
  }
  return { value, uncertainty: unc ? Math.sqrt(var2) : null };
};

export function reactionThermo(eq: Equation): ReactionThermo {
  const terms = [
    ...eq.reactants.map((t) => ({ key: t.species.raw.trim(), nu: -t.coef, kind: t.species.kind })),
    ...eq.products.map((t) => ({ key: t.species.raw.trim(), nu: t.coef, kind: t.species.kind })),
  ];
  const chem = terms.filter((t) => t.kind === 'chemical' || t.kind === 'electron');
  const withData = chem.map((t) => ({ ...t, data: thermoFor(t.key) }));
  const missingH = withData.filter((t) => !t.data?.dfH).map((t) => t.key);
  const missingS = withData.filter((t) => !t.data?.S).map((t) => t.key);
  const src = [...new Set(withData.flatMap((t) => (t.data ? [t.data.source] : [])))].join(' + ');
  const anyDerived = withData.some((t) => t.data?.dfH?.derived);
  const H = missingH.length ? null : sumTerms(withData.map((t) => ({ nu: t.nu, v: t.data!.dfH })));
  const S = missingS.length ? null : sumTerms(withData.map((t) => ({ nu: t.nu, v: t.data!.S })));
  return {
    dH: { value: H?.value ?? null, unit: 'kJ/mol', uncertainty: H?.uncertainty ?? null, provenance: 'derived', basis: `Σν ΔfH°(products) − Σν ΔfH°(reactants) at 298.15 K, 1 bar; data: ${src || '—'}${anyDerived ? ' (includes ΔfH° derived from combustion calorimetry)' : ''}` },
    dS: { value: S?.value ?? null, unit: 'J/(mol·K)', uncertainty: S?.uncertainty ?? null, provenance: 'derived', basis: `Σν S°(products) − Σν S°(reactants) at 298.15 K, 1 bar; data: ${src || '—'}` },
    missingH, missingS,
    terms: withData.map((t) => ({ key: t.key, nu: t.nu, data: t.data })),
    photochemical: terms.some((t) => t.kind === 'photon'),
  };
}

/** ΔrG° (kJ/mol) at temperature T with the ΔrCp° = 0 approximation. */
export function gibbs(rt: ReactionThermo, T: number): number | null {
  if (rt.dH.value === null || rt.dS.value === null) return null;
  return rt.dH.value - (T * rt.dS.value) / 1000;
}

/** Equilibrium constant (standard states as written) from ΔrG° in kJ/mol. */
export const equilibriumK = (dGkJ: number, T: number) => Math.exp((-dGkJ * 1000) / (R_GAS * T));

/** |T − 298.15| beyond which the constant-ΔH/ΔS approximation is flagged in the UI. */
export const DCP_WARNING_K = 100;

export function thermoMeasurements(rt: ReactionThermo, T: number): Measurement[] {
  const dG = gibbs(rt, T);
  const validity = ['Standard states (1 bar; aqueous species at unit molality)', 'Phases fixed as written in the equation', ...(Math.abs(T - T_STD) > DCP_WARNING_K ? [`ΔrCp° = 0 assumed: |T − 298.15 K| = ${Math.abs(T - T_STD).toFixed(0)} K, so results are approximate`] : [])];
  return [
    { quantity: 'standard reaction enthalpy', symbol: 'ΔrH°', value: rt.dH.value, unit: 'kJ/mol', uncertainty: rt.dH.uncertainty, provenance: 'derived', conditions: { temperatureK: T_STD, pressurePa: 1e5 }, model: 'Hess’s law from formation enthalpies', validity },
    { quantity: 'standard reaction entropy', symbol: 'ΔrS°', value: rt.dS.value, unit: 'J/(mol·K)', uncertainty: rt.dS.uncertainty, provenance: 'derived', conditions: { temperatureK: T_STD, pressurePa: 1e5 }, model: 'Third-law entropies', validity },
    { quantity: 'standard reaction Gibbs energy', symbol: 'ΔrG°', value: dG, unit: 'kJ/mol', uncertainty: null, provenance: 'derived', conditions: { temperatureK: T, pressurePa: 1e5 }, model: 'ΔrH° − TΔrS° (ΔrCp° = 0)', validity },
  ];
}
