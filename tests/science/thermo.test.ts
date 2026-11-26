/**
 * Gate 4.2 — thermochemistry. Reference values: CODATA Key Values (Cox, Wagman & Medvedev 1989)
 * and textbook/NIST combustion enthalpies, compared within the stated uncertainties.
 */
import { describe, expect, it } from 'vitest';
import { REACTIONS, getReaction, toEquation } from '@/modes/atomic/reactions/library';
import { parseEquation } from '@/modes/atomic/reactions/equation';
import { R_GAS, THERMO, equilibriumK, gibbs, reactionThermo, thermoFor } from '@/modes/atomic/reactions/thermo';
import { energyLedger, type EnergyTransfer } from '@/core/physics/energy/energy';

const rt = (id: string) => reactionThermo(toEquation(getReaction(id)!));

describe('thermochemistry dataset', () => {
  it('reproduces CODATA key values exactly (ingestion check)', () => {
    expect(thermoFor('H2O(l)')!.dfH!.value).toBe(-285.83);
    expect(thermoFor('H2O(l)')!.S!.value).toBe(69.95);
    expect(thermoFor('CO2(g)')!.dfH!.value).toBe(-393.51);
    expect(thermoFor('O2(g)')!.S!.value).toBe(205.152);
    expect(thermoFor('C(s)')!.dfH!.value).toBe(0);
  });
  it('elements in reference states have ΔfH° = 0; every value names its source', () => {
    for (const k of ['H2(g)', 'O2(g)', 'N2(g)', 'C(s)', 'Fe(s)']) expect(thermoFor(k)!.dfH!.value, k).toBe(0);
    for (const s of THERMO) for (const v of [s.dfH, s.S]) if (v) expect(v.source.length, s.key).toBeGreaterThan(10);
  });
  it('the CHO formation enthalpy derived from combustion (glucose) matches NIST’s own derivation', () => {
    const g = thermoFor('C6H12O6(s)')!.dfH!;
    expect(g.derived).toBe(true);
    expect(Math.abs(g.value - -1271.1)).toBeLessThan(0.2);
  });
  it('R = N_A·k_B (exact SI)', () => expect(R_GAS).toBeCloseTo(8.314462618, 8));
});

describe('reaction enthalpy, entropy, Gibbs energy', () => {
  it('CH₄ combustion ΔrH° = −890.6 kJ/mol (to H₂O(l)) within uncertainty', () => {
    const r = rt('methane-combustion');
    expect(Math.abs(r.dH.value! - -890.6)).toBeLessThan(Math.max(0.5, 2 * r.dH.uncertainty!));
  });
  it('H₂ combustion: 2 × ΔfH°(H₂O, l); liquid vs gas differs by 2 × ΔvapH° = 88.0 kJ (Hess)', () => {
    expect(rt('hydrogen-combustion').dH.value).toBeCloseTo(-571.66, 6);
    expect(rt('hydrogen-combustion-gas').dH.value! - rt('hydrogen-combustion').dH.value!).toBeCloseTo(88.008, 3);
  });
  it('Hess’s law cycle closes: C → CO → CO₂ equals C → CO₂', () => {
    const a = rt('graphite-partial-oxidation').dH.value!; // 2C + O2 → 2CO
    const b = rt('co-oxidation').dH.value!;               // 2CO + O2 → 2CO2
    const c = rt('graphite-combustion').dH.value!;        // C + O2 → CO2
    expect(a + b).toBeCloseTo(2 * c, 9);
    expect(c).toBeCloseTo(-393.51, 9);
  });
  it('neutralisation H⁺ + OH⁻ → H₂O: −55.8 kJ/mol', () => {
    expect(rt('neutralisation-net-ionic').dH.value).toBeCloseTo(-55.815, 3);
  });
  it('Haber–Bosch: ΔrH° = −91.9 kJ, ΔrS° ≈ −198.1 J/K, K(298) ≫ 1 but ΔrG° > 0 above ~464 K', () => {
    const r = rt('haber-bosch');
    expect(r.dH.value).toBeCloseTo(-91.88, 2);
    expect(r.dS.value!).toBeCloseTo(-198.1, 0);
    const g298 = gibbs(r, 298.15)!;
    expect(g298).toBeCloseTo(-32.8, 0);
    expect(equilibriumK(g298, 298.15)).toBeGreaterThan(1e5);
    const Tcross = (r.dH.value! * 1000) / r.dS.value!;
    expect(Tcross).toBeGreaterThan(450); expect(Tcross).toBeLessThan(480);
  });
  it('water liquid ⇌ vapour: ΔrG°(T) crosses 0 near 373 K (ΔCp=0 approximation within 2 %)', () => {
    const r = reactionThermo(parseEquation('H2O(l) -> H2O(g)'));
    const Tb = (r.dH.value! * 1000) / r.dS.value!;
    expect(Math.abs(Tb - 373.12) / 373.12).toBeLessThan(0.02);
  });
  it('K = 1 exactly when ΔrG° = 0, and ln K is linear in ΔrG°', () => {
    expect(equilibriumK(0, 500)).toBe(1);
    expect(Math.log(equilibriumK(-10, 300))).toBeCloseTo(10000 / (R_GAS * 300), 10);
  });
  it('missing data → unknown, never estimated', () => {
    const r = rt('baso4-precipitation');
    expect(r.dH.value).toBeNull();
    expect(r.missingH.length).toBeGreaterThan(0);
  });
  it('at least half of the curated reactions have a fully sourced ΔrH°', () => {
    const known = REACTIONS.filter((x) => rt(x.id).dH.value !== null).length;
    expect(known).toBeGreaterThanOrEqual(REACTIONS.length / 2);
  });
});

describe('energy ledger (conservation interface)', () => {
  it('heat released at constant pressure balances the enthalpy change', () => {
    const r = rt('methane-combustion');
    const q: EnergyTransfer = { id: 'q', mechanism: 'chemical', from: 'reacting system', to: 'surroundings', amount: { value: -r.dH.value!, unit: 'kJ/mol', uncertainty: r.dH.uncertainty, provenance: 'derived', basis: 'q_p = −ΔrH°' }, model: 'constant-pressure calorimetry', validity: [] };
    const led = energyLedger('surroundings', [q], { value: -r.dH.value!, unit: 'kJ/mol', uncertainty: 0, provenance: 'derived', basis: 'surroundings gain' });
    expect(led.known && led.conserved).toBe(true);
    const broken = energyLedger('surroundings', [q], { value: 100, unit: 'kJ/mol', uncertainty: 0, provenance: 'derived', basis: '' });
    expect(broken.known && broken.conserved).toBe(false);
  });
});
