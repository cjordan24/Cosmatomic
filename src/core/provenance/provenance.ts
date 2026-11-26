/**
 * Scientific provenance system. Every value shown to the user can be traced to
 * one of five reliability classes plus its source.
 */
export type ProvenanceClass = 'observed' | 'derived' | 'simulated' | 'illustrative' | 'hypothetical';

export interface Provenance {
  class: ProvenanceClass;
  institution: string;
  url?: string;
  catalogId?: string;
  retrievedAt?: string;
  datasetVersion?: string;
  units?: string;
  uncertainty?: string;
  referenceFrame?: string;
  license?: string;
  assumptions?: string[];
  /** true when the value was transcribed by hand from a publication rather than ingested by an adapter */
  transcribed?: boolean;
}

export const PROVENANCE_LABEL: Record<ProvenanceClass, { label: string; description: string; color: string }> = {
  observed: { label: 'Observed', description: 'Directly supported by measurements or observational records.', color: '#5cf2a6' },
  derived: { label: 'Derived', description: 'Calculated from observations using a documented method.', color: '#7df9ff' },
  simulated: { label: 'Simulated', description: 'Produced by an identified physical model.', color: '#b18cff' },
  illustrative: { label: 'Illustrative', description: 'Educational or artistic representation — not a measurement.', color: '#f5c76b' },
  hypothetical: { label: 'Hypothetical', description: 'User-created or speculative system.', color: '#ff7a90' },
};

/** A value that may legitimately be unknown. Never fill with an invented number. */
export interface Measured<T = number> {
  value: T | null;
  unit?: string;
  uncertainty?: number | null;
  provenance: Provenance;
}
