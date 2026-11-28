/**
 * Gate 15.7 — PUE arithmetic against LBNL's own numbers.
 */
import { describe, expect, it } from 'vitest';
import { annualTWh, averageGW, facilityPowerMW, infrastructureShare } from '@/core/computing/datacentre';

describe('PUE (LBNL 2025 Update)', () => {
  it('LBNL’s two statements agree: PUE 1.55 ↔ infrastructure 35.5 % (“36%”), PUE 1.45 ↔ 31.0 % (“31%”)', () => {
    expect(infrastructureShare(1.55) * 100).toBeCloseTo(35.48, 2);
    expect(infrastructureShare(1.45) * 100).toBeCloseTo(31.03, 2);
  });
  it('a 10 MW IT load at PUE 1.45 draws 14.5 MW and uses 0.127 TWh a year', () => {
    expect(facilityPowerMW(10, 1.45)).toBeCloseTo(14.5, 12);
    expect(annualTWh(14.5)).toBeCloseTo(0.12702, 5);
  });
  it('192 TWh in 2024 is an average of 21.9 GW; 649 TWh in 2030 would be 74.1 GW', () => {
    expect(averageGW(192)).toBeCloseTo(21.92, 2);
    expect(averageGW(649)).toBeCloseTo(74.09, 2);
  });
  it('192 TWh at 4.7 % implies total U.S. use of about 4,090 TWh (derived)', () => {
    expect(192 / 0.047).toBeCloseTo(4085, -1);
  });
});
