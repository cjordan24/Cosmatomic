/**
 * Phase 17 — circuit, mechanism, heat-engine and induction formulas: exact identities.
 */
import { describe, expect, it } from 'vitest';
import { carnot, coilEmfPeak, divider, gearPair, leverAdvantage, ohmCurrent, otto, parallel, power, rcCharge, rlCurrent, rpmToRadS, series, shaftPower } from '@/core/engineering/machines';

describe('circuits', () => {
  it('Ohm: 12 V across 4 Ω drives 3 A, dissipating 36 W', () => { expect(ohmCurrent(12, 4)).toBe(3); expect(power(12, 3)).toBe(36); });
  it('series adds; two equal resistors in parallel halve', () => { expect(series(100, 220, 330)).toBe(650); expect(parallel(100, 100)).toBeCloseTo(50, 12); });
  it('Kirchhoff’s current law: currents through parallel branches sum to the source current', () => {
    const V = 9, R = [100, 220, 470], branch = R.map((r) => V / r);
    expect(branch.reduce((a, b) => a + b, 0)).toBeCloseTo(V / parallel(...R), 12);
  });
  it('divider: 5 V across 1 k / 2 k gives 3.333 V', () => { expect(divider(5, 1000, 2000)).toBeCloseTo(3.3333, 4); });
  it('RC reaches 63.2 % at one time constant, 99.3 % at five', () => {
    expect(rcCharge(1, 1000, 1e-3, 1)).toBeCloseTo(0.6321, 4); expect(rcCharge(1, 1000, 1e-3, 5)).toBeCloseTo(0.9933, 4);
  });
  it('RL current approaches V/R with time constant L/R', () => { expect(rlCurrent(10, 5, 0.5, 0.1)).toBeCloseTo(2 * 0.6321, 4); });
});

describe('mechanisms', () => {
  it('a 12:36 gear pair turns 3000 rpm into 1000 rpm and triples torque; power is conserved', () => {
    const g = gearPair(12, 36, 3000, 10);
    expect(g.rpmOut).toBe(1000); expect(g.torqueOut).toBe(30);
    expect(shaftPower(10, rpmToRadS(3000))).toBeCloseTo(shaftPower(30, rpmToRadS(1000)), 9);
  });
  it('a lever with a 2 m effort arm and 0.5 m load arm has advantage 4', () => { expect(leverAdvantage(2, 0.5)).toBe(4); });
});

describe('heat engines', () => {
  it('Carnot between 800 K and 300 K: 62.5 %', () => { expect(carnot(800, 300)).toBeCloseTo(0.625, 12); });
  it('ideal Otto at r = 10, γ = 1.4: 60.2 % — equal to a Carnot engine between T₃ and T₂ when T₃/T₂ = r^(γ−1)', () => {
    expect(otto(10)).toBeCloseTo(0.6019, 4);
    expect(carnot(10 ** 0.4, 1)).toBeCloseTo(otto(10), 12);
  });
});

describe('induction', () => {
  it('peak EMF N B A ω: 100 turns, 0.5 T, 0.01 m², 50 Hz → 157 V', () => { expect(coilEmfPeak(100, 0.5, 0.01, 2 * Math.PI * 50)).toBeCloseTo(157.08, 2); });
});
