/**
 * Phase 24.2 — future climate: the stored projections are internally consistent and every helper keeps
 * printed and derived values apart.
 */
import { describe, expect, it } from 'vitest';
import { f2c, hydrogenRatio, m2ft, parseProb, usWarmingF } from '@/core/meteorology/future';
import future from '@datasets/meteorology/future.json';

/* eslint-disable @typescript-eslint/no-explicit-any */
const F = future as any;

describe('sea-level scenarios (Sweet et al. 2022, Table 2.3)', () => {
  it('scenarios are named by their 2100 global mean: 0.3, 0.5, 1.0, 1.5, 2.0 m', () => {
    expect(F.sea.scenarios.map((s: any) => s.gmsl[1])).toEqual([0.3, 0.5, 1.0, 1.5, 2.0]);
  });
  it('every scenario rises through 2050 → 2100 → 2150, and higher scenarios are higher in every year', () => {
    for (const reg of ['gmsl', 'conus']) {
      for (const s of F.sea.scenarios) { expect(s[reg][1]).toBeGreaterThan(s[reg][0]); expect(s[reg][2]).toBeGreaterThan(s[reg][1]); }
      for (let i = 1; i < F.sea.scenarios.length; i++) for (let j = 0; j < 3; j++) expect(F.sea.scenarios[i][reg][j]).toBeGreaterThan(F.sea.scenarios[i - 1][reg][j]);
    }
  });
  it('the observed-acceleration extrapolation (0.24 m by 2050, 0.69 m by 2100) lies between the Intermediate-Low and Intermediate scenarios in 2100', () => {
    expect(F.sea.extrap.y2100).toBeGreaterThan(0.5); expect(F.sea.extrap.y2100).toBeLessThan(1.0);
  });
  it('exceedance probabilities fall with the scenario and rise with warming (NCA5 Table A3.1)', () => {
    const ids = F.sea.scenarios.map((s: any) => s.id);
    for (let c = 0; c < 5; c++) for (let i = 1; i < ids.length; i++) expect(parseProb(F.sea.exceed[ids[i]][c]).lo).toBeLessThanOrEqual(parseProb(F.sea.exceed[ids[i - 1]][c]).hi);
    for (const id of ids) for (let c = 1; c < 5; c++) expect(parseProb(F.sea.exceed[id][c]).hi).toBeGreaterThanOrEqual(parseProb(F.sea.exceed[id][c - 1]).lo);
  });
  it('the 2 °C AR6 median (0.5 m) is “consistent with the Intermediate-Low scenario”', () => {
    const it2 = F.warming.byLevel.find((b: any) => b.gwl === 2 && b.topic.startsWith('Global sea level'));
    expect(it2.v).toContain('0.5 m'); expect(F.sea.scenarios[1].gmsl[1]).toBe(0.5);
  });
});

describe('warming levels (NCA5 Ch. 2)', () => {
  it('US warming at 2 °C is the printed 4.4–5.6 °F; above 2 °C it is flagged derived; below, not stated', () => {
    expect(usWarmingF(2, F.warming.us2)).toEqual({ lo: 4.4, hi: 5.6, derived: false });
    const r3 = usWarmingF(3, F.warming.us2)!; expect(r3.derived).toBe(true); expect(r3.lo).toBeCloseTo(6.9, 5); expect(r3.hi).toBeCloseTo(8.1, 5);
    expect(usWarmingF(1.5, F.warming.us2)).toBeNull();
  });
  it('NCA5’s °C conversion of 4.4–5.6 °F (2.4–3.1 °C) matches ours', () => {
    expect(f2c(4.4)).toBeCloseTo(2.4, 1); expect(f2c(5.6)).toBeCloseTo(3.1, 1);
  });
  it('the 2 °C window under SSP5-8.5 contains its mean year, and current policies give a range containing 2.6 °C', () => {
    const c = F.warming.cross2; expect(c.mean).toBeGreaterThan(c.from); expect(c.mean).toBeLessThan(c.to);
    const p = F.warming.policy2100; expect(p.mid).toBeGreaterThan(p.lo); expect(p.mid).toBeLessThan(p.hi);
  });
  it('every by-level statement carries its quote, and its level appears in the quote', () => {
    for (const b of F.warming.byLevel) { expect(b.q.length).toBeGreaterThan(40); expect([`${b.gwl}°C`, `${b.gwl.toFixed(1)}°C`].some((t) => b.q.includes(t)), b.topic).toBe(true); }
  });
});

describe('climate sensitivity', () => {
  it('both NCA5 likely ranges sit inside the very likely range and above the 1.5 °C floor; °F and °C agree', () => {
    const E = F.ecs;
    for (const r of [E.likely, E.ch2Likely]) { expect(r[0]).toBeGreaterThanOrEqual(E.ch2VeryLikely[0]); expect(r[1]).toBeLessThanOrEqual(E.ch2VeryLikely[1]); expect(r[0]).toBeGreaterThan(E.floor); }
    expect(f2c(4.5)).toBeCloseTo(2.5, 5); expect(f2c(7.2)).toBeCloseTo(4.0, 5);
  });
});

describe('ocean pH and units', () => {
  it('8.16 → 8.01 is 1.41 times the hydrogen ions (the page rounds to “about 1.5 times”)', () => {
    expect(hydrogenRatio(8.16, 8.01)).toBeCloseTo(1.41, 2);
    expect(hydrogenRatio(8.16, 7.67)).toBeCloseTo(3.09, 2);
  });
  it('Sweet’s 2100 scenario names in feet (1, 1.5, 3, 5, 6.5 ft) match the metres within rounding', () => {
    const ft = [1, 1.5, 3, 5, 6.5];
    F.sea.scenarios.forEach((s: any, i: number) => expect(Math.abs(m2ft(s.gmsl[1]) - ft[i])).toBeLessThan(0.35));
  });
  it('NSIDC: 7.4 m is 24.3 ft (the page prints both 23 and 24 ft)', () => { expect(m2ft(7.4)).toBeCloseTo(24.3, 1); });
});
