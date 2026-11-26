/**
 * Single source of derived atomic state for the element view. Every 2D diagram
 * and 3D representation consumes this object, so they can never disagree.
 */
import { useEffect, useMemo, useState } from 'react';
import { getElement, tablePosition, type ElementRecord, type TablePosition } from './elements';
import { ionConfiguration, parseConfiguration, shellOccupancy, slaterZeff, totalElectrons, valenceElectrons, type Subshell } from './configuration';
import { defaultIsotope, groundStates, loadNuclides, nuclidesSync, type ElementNuclides, type Nuclide, type NaturalIsotope } from './isotopes';
import { loadNistSpectra, nistSpectraSync, type NistSpectra } from './nistSpectra';

const ROMAN_INDEX: Record<string, number> = { I: 0, II: 1, III: 2, IV: 3, V: 4, VI: 5 };
/** Ionisation stages with a bundled NIST spectrum for this element (spectroscopy is physics, not chemistry). */
function spectroscopicCharges(nist: NistSpectra | null, symbol: string): number[] {
  if (!nist) return [];
  return Object.keys(nist.spectra).filter((k) => k.split(' ')[0] === symbol).map((k) => ROMAN_INDEX[k.split(' ')[1]]).filter((q) => q !== undefined && q > 0);
}

export interface AtomState {
  element: ElementRecord;
  position: TablePosition;
  nuclides: ElementNuclides | null;
  A: number | null;
  isotopeReason: 'most-abundant' | 'longest-lived' | 'user' | null;
  nuclide: Nuclide | null;
  natural: NaturalIsotope | null;
  charge: number;
  protons: number;
  neutrons: number | null;
  electrons: number;
  neutralConfig: Subshell[];
  config: Subshell[];
  shells: number[];
  valence: number | null;
  /** Slater Z_eff per occupied subshell key "n,l" */
  zeff: Map<string, number>;
  allowedCharges: number[];
  /** nucleus mass in u (atomic mass minus electron masses ≈ use atomic mass; error < 0.06 %) */
  nuclearMassU: number;
}

export function useAtomState(Z: number, Aq: number | null, chargeQ: number): AtomState | null {
  const element = getElement(Z);
  const [nuc, setNuc] = useState<Record<string, ElementNuclides> | null>(nuclidesSync());
  useEffect(() => { if (!nuc) loadNuclides().then(setNuc); }, [nuc]);
  const [nist, setNist] = useState<NistSpectra | null>(nistSpectraSync());
  useEffect(() => { if (!nist) loadNistSpectra().then(setNist); }, [nist]);

  return useMemo(() => {
    if (!element) return null;
    const nuclides = nuc?.[Z] ?? null;
    const def = nuclides ? defaultIsotope(nuclides) : null;
    const gs = nuclides ? groundStates(nuclides) : [];
    const A = Aq && gs.some((n) => n.A === Aq) ? Aq : def?.A ?? null;
    const nuclide = gs.find((n) => n.A === A) ?? null;
    const natural = nuclides?.natural.find((n) => n.A === A) ?? null;
    const neutralConfig = parseConfiguration(element.electronConfiguration);
    // supported charge states: neutral + documented oxidation states that leave ≥ 0 electrons, plus full ionisation for H/He
    const allowed = Array.from(new Set([0, ...element.oxidationStates.filter((q) => q !== 0 && Z - q >= 0 && Math.abs(q) <= 8), ...(Z <= 2 ? [Z] : []), ...spectroscopicCharges(nist, element.symbol)])).sort((a, b) => a - b);
    const charge = allowed.includes(chargeQ) ? chargeQ : 0;
    const config = ionConfiguration(neutralConfig, charge);
    const position = tablePosition(Z);
    const zeff = new Map(config.map((s) => [`${s.n},${s.l}`, slaterZeff(Z, config, s)]));
    return {
      element, position, nuclides, A,
      isotopeReason: Aq && A === Aq ? 'user' : def?.reason ?? null,
      nuclide, natural, charge,
      protons: Z, neutrons: A !== null ? A - Z : null, electrons: totalElectrons(config),
      neutralConfig, config, shells: shellOccupancy(config),
      valence: charge === 0 ? valenceElectrons(neutralConfig, position.block) : null,
      zeff, allowedCharges: allowed,
      nuclearMassU: natural?.mass ?? nuclide?.mass ?? element.atomicWeight ?? Z * 2,
    } satisfies AtomState;
  }, [element, nuc, nist, Z, Aq, chargeQ]);
}
