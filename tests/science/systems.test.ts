/**
 * Phase 19 — integrated systems.
 */
import { describe, expect, it } from 'vitest';
import { ARRAY_W_PER_M2_1AU, dataCentreChain, etaFromVoyager, evChain, link, rtgObservedW, rtgW, solarArrayW, YUEN } from '@/core/engineering/systems';

describe('spacecraft', () => {
  it('Hubble-derived array output is about 149 W/m² at 1 AU, 25 times less at 5 AU', () => {
    expect(ARRAY_W_PER_M2_1AU).toBeCloseTo(149.5, 0);
    expect(solarArrayW(10, 1) / solarArrayW(10, 5)).toBeCloseTo(25, 12);
  });
  it('three RTGs: 474 W at launch; observed curve passes 225 W at 46 years', () => {
    expect(rtgW(3, 0)).toBe(474);
    expect(rtgObservedW(3, 46)).toBeCloseTo(225, 9);
  });
  it('Voyager-implied antenna efficiency is about 0.61', () => { expect(etaFromVoyager()).toBeCloseTo(0.61, 2); });
  it('reproduces Yuen: Voyager at Jupiter with a 64 m dish gives P_R L/N₀ ≈ 5.6e5 Hz and about 115 kbit/s or more', () => {
    const l = link({ ptW: 21.3, dTx: 3.7, dRx: 64, distM: 6.8e11 });
    expect(l.n0).toBeCloseTo(3.933e-22, 24);
    expect(l.ratio / 5.428e5).toBeGreaterThan(1); expect(l.ratio / 5.428e5).toBeLessThan(1.1);
    expect(l.bps).toBeGreaterThan(YUEN.needBps);
  });
  it('data rate falls as 1/r²', () => {
    const a = link({ ptW: 20, dTx: 3.7, dRx: 70, distM: 1e12 }).bps, b = link({ ptW: 20, dTx: 3.7, dRx: 70, distM: 2e12 }).bps;
    expect(a / b).toBeCloseTo(4, 9);
  });
});
describe('data centre and EV chains', () => {
  it('stages add up', () => {
    const c = dataCentreChain(1e9, 0.24, 1.145);
    expect(c.facility).toBeCloseTo(240000, 6);
    expect(c.it + c.infrastructure).toBeCloseTo(c.facility, 9);
    expect(c.facility + c.lines).toBeCloseTo(c.generation, 9);
  });
  it('EV: 100 L at 450 Wh/L is 45 kWh', () => { const e = evChain(100, 450, 0.67); expect(e.battery).toBe(45); expect(e.wheels + e.losses).toBeCloseTo(45, 12); });
});
