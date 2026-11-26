/**
 * Shared energy-transfer and measurement interfaces (Gate 4.2).
 *
 * Every energy quantity in Voyager — reaction enthalpies now; radiative, acoustic, conductive and
 * biological energy flows in later phases — is expressed as an EnergyQuantity (value + unit +
 * uncertainty + provenance + basis), and every flow between two parts of a system as an
 * EnergyTransfer with an explicit mechanism and model. An EnergyLedger checks conservation:
 * Σ transfers into a closed system equals its change in stored energy, within uncertainty.
 *
 * Sign convention (IUPAC): a transfer is positive when energy enters the `to` system.
 */
import type { ProvenanceClass } from '@/core/provenance/provenance';

export type EnergyUnit = 'J' | 'kJ' | 'J/mol' | 'kJ/mol' | 'eV' | 'W' | 'W/m²' | 'W/(m²·sr·m)' | 'J/(mol·K)';

export type EnergyMechanism =
  | 'chemical'          // change in chemical (bond) enthalpy
  | 'heat-conduction'   // Fourier conduction
  | 'convection'
  | 'radiation'         // photon emission/absorption
  | 'mechanical-work' | 'electrical-work'
  | 'acoustic'
  | 'phase-change'      // latent heat
  | 'biological';       // e.g. ATP turnover (Biologic Mode)

export interface EnergyQuantity {
  value: number | null;   // null = unknown (never estimated)
  unit: EnergyUnit;
  uncertainty: number | null;
  provenance: ProvenanceClass;
  /** how the number was obtained, e.g. "Σν ΔfH°(products) − Σν ΔfH°(reactants), CODATA 1989" */
  basis: string;
}

export interface MeasurementConditions {
  temperatureK?: number;
  pressurePa?: number;
  medium?: string;
  frequencyHz?: number;
  wavelengthM?: number;
  notes?: string;
}

/** A value reported by a virtual instrument or model — the interface instruments in later phases implement. */
export interface Measurement {
  quantity: string;     // physical quantity name, e.g. "standard reaction enthalpy"
  symbol: string;       // e.g. "ΔrH°"
  value: number | null;
  unit: string;
  uncertainty: number | null;
  provenance: ProvenanceClass;
  conditions: MeasurementConditions;
  /** model or instrument that produced it */
  model: string;
  validity: string[];
}

export interface EnergyTransfer {
  id: string;
  mechanism: EnergyMechanism;
  from: string;
  to: string;
  amount: EnergyQuantity;
  model: string;
  validity: string[];
}

/** Conservation bookkeeping for a closed system. */
export function energyLedger(system: string, transfers: EnergyTransfer[], storedChange: EnergyQuantity) {
  let net = 0; let var2 = 0; let known = true;
  for (const t of transfers) {
    if (t.amount.value === null) { known = false; continue; }
    const s = t.to === system ? 1 : t.from === system ? -1 : 0;
    net += s * t.amount.value;
    var2 += (t.amount.uncertainty ?? 0) ** 2;
  }
  if (!known || storedChange.value === null) return { known: false as const };
  var2 += (storedChange.uncertainty ?? 0) ** 2;
  const residual = net - storedChange.value;
  const tolerance = Math.max(1e-9 * Math.abs(storedChange.value), 2 * Math.sqrt(var2));
  return { known: true as const, netIn: net, residual, conserved: Math.abs(residual) <= tolerance, tolerance };
}
