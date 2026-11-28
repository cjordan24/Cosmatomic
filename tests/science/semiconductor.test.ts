/**
 * Gate 15.2 — Shockley's junction equation and the silicon band gap.
 */
import { describe, expect, it } from 'vitest';
import { cutoffWavelengthNm, diodeCurrent, diodeVoltage, thermalVoltage } from '@/core/computing/semiconductor';

describe('the p-n junction (Shockley 1949, eq. 4.13)', () => {
  it('kT/q = 25.85 mV at 300 K', () => { expect(thermalVoltage(300) * 1000).toBeCloseTo(25.852, 3); });
  it('reverse bias saturates at −I_s; forward current grows e-fold every 25.85 mV', () => {
    expect(diodeCurrent(-1, 1e-12)).toBeCloseTo(-1e-12, 20);
    expect(diodeCurrent(0.6, 1e-12) / diodeCurrent(0.6 - thermalVoltage(300), 1e-12)).toBeCloseTo(Math.E, 6);
  });
  it('rectification: with I_s = 1 pA, +0.6 V passes 12.0 mA while −0.6 V passes 1 pA', () => {
    expect(diodeCurrent(0.6, 1e-12) * 1000).toBeCloseTo(12.01, 2);
  });
  it('the voltage for 1 mA with I_s = 1 pA is 0.536 V; inverse of the current law', () => {
    expect(diodeVoltage(1e-3, 1e-12)).toBeCloseTo(0.5357, 4);
    expect(diodeCurrent(diodeVoltage(1e-3, 1e-12), 1e-12)).toBeCloseTo(1e-3, 12);
  });
});

describe('silicon band gap (TU Delft OCW: 1.12 eV, 1107 nm)', () => {
  it('hc/1.12 eV = 1107 nm — the course’s two numbers agree', () => { expect(cutoffWavelengthNm(1.12)).toBeCloseTo(1107.0, 0); });
});
