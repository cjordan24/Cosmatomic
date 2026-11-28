/**
 * Phase 18 — spaceflight relations.
 */
import { describe, expect, it } from 'vitest';
import { circularSpeed, decay, deltaV, dishGain, escapeSpeed, exhaustFromIsp, friis, hohmann, period, propellantFraction, sunlightAt, toDb } from '@/core/engineering/spaceflight';
import { CONSTANTS } from '@/core/constants/constants';

const muE = CONSTANTS.GMearth.value, muS = CONSTANTS.GMsun.value, R = CONSTANTS.ReEarth.value, AU = CONSTANTS.au.value;
describe('rocket equation', () => {
  it('Δv = v_e ln(m0/mf); mass ratio e gives Δv = v_e', () => { expect(deltaV(3000, Math.E, 1)).toBeCloseTo(3000, 9); });
  it('propellant fraction inverts the rocket equation', () => { const ve = exhaustFromIsp(300); expect(deltaV(ve, 1, 1 - propellantFraction(9000, ve))).toBeCloseTo(9000, 6); });
});
describe('orbits', () => {
  it('low Earth orbit at 400 km is about 7.67 km/s and 92.6 minutes', () => {
    expect(circularSpeed(muE, R + 400e3) / 1000).toBeCloseTo(7.67, 2);
    expect(period(muE, R + 400e3) / 60).toBeCloseTo(92.56, 1);
  });
  it('escape speed is √2 times circular speed; 11.2 km/s at the surface', () => {
    expect(escapeSpeed(muE, R) / circularSpeed(muE, R)).toBeCloseTo(Math.SQRT2, 12);
    expect(escapeSpeed(muE, R) / 1000).toBeCloseTo(11.18, 2);
  });
  it('one year at 1 au', () => { expect(period(muS, AU) / 86400).toBeCloseTo(365.25, 0); });
  it('Earth → Mars Hohmann: about 5.6 km/s in total and about 259 days', () => {
    const h = hohmann(muS, AU, 1.524 * AU);
    expect(h.total / 1000).toBeCloseTo(5.59, 1);
    expect(h.time / 86400).toBeCloseTo(259, -1);
  });
});
describe('power and links', () => {
  it('a half-life halves the power', () => { expect(decay(470, 87.7, 87.7)).toBeCloseTo(235, 9); });
  it('sunlight falls as 1/d²', () => { expect(sunlightAt(1361, 5.2)).toBeCloseTo(1361 / 27.04, 9); });
  it('Friis: doubling the distance costs 6.02 dB', () => {
    const a = friis(20, 1e5, 1e7, 0.0357, 1e12), b = friis(20, 1e5, 1e7, 0.0357, 2e12);
    expect(toDb(a / b)).toBeCloseTo(6.0206, 3);
  });
  it('dish gain grows as D²', () => { expect(dishGain(70, 0.0357) / dishGain(35, 0.0357)).toBeCloseTo(4, 12); });
});
