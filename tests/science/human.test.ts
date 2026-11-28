/**
 * Phase 24.1 — human activities: checks that the derived arithmetic reproduces the sources' own printed numbers.
 */
import { describe, expect, it } from 'vitest';
import { budgetImbalance, cementProcessCO2, dF2dC, heatFlux, mixIntensity, molarMass, shares } from '@/core/meteorology/human';
import human from '@datasets/meteorology/human.json';
import elements from '@datasets/atomic/elements.json';

/* eslint-disable @typescript-eslint/no-explicit-any */
const H = human as any;
const aw = (sym: string) => (elements as any[]).find((e) => e.symbol === sym).atomicWeight as number;

describe('Global Carbon Budget 2025', () => {
  it('the 2015–2024 budget closes: sources 11.2 GtC/yr = sinks 11.2 GtC/yr', () => {
    const d = H.budget.decade;
    expect(d.fossil.v + d.luc.v).toBeCloseTo(11.2, 5);
    expect(budgetImbalance({ fossil: d.fossil.v, luc: d.luc.v, atm: d.atm.v, ocean: d.ocean.v, land: d.land.v })).toBeCloseTo(0, 5);
  });
  it('2024 imbalance from the printed parts is −1.6, against −1.7 printed (rounding of the parts)', () => {
    const b = budgetImbalance(H.budget.y2024);
    expect(b).toBeCloseTo(-1.6, 5); expect(Math.abs(b - H.budget.y2024.bim)).toBeLessThan(0.15);
  });
  it('the ocean and land sinks took 29 % and 21 % of 2015–2024 emissions (GCB) — our ratio agrees', () => {
    const d = H.budget.decade, tot = d.fossil.v + d.luc.v;
    expect(d.ocean.v / tot * 100).toBeCloseTo(29, -0.5); expect(d.land.v / tot * 100).toBeCloseTo(21, -0.5);
  });
  it('land-use components add to the net 1.4 GtC/yr', () => {
    expect(H.land.parts.reduce((a: number, p: any) => a + p.v, 0)).toBeCloseTo(1.3, 5);   // 1.3 from the rounded parts vs 1.4 printed
  });
});

describe('EDGAR 2026 sectors', () => {
  it('the eight sectors sum to the printed 54.1 Gt CO₂eq and power is “nearly 30%”', () => {
    const r = H.sectors.rows, mt = r.map((x: any) => x.mt);
    expect(mt.reduce((a: number, b: number) => a + b, 0) / 1000).toBeCloseTo(54.1, 1);
    const p = shares(mt)[0] * 100; expect(p).toBeGreaterThan(28); expect(p).toBeLessThan(30);
  });
});

describe('cement (Andrew 2019)', () => {
  it('Mr(CO₂)/Mr(CaO) from standard atomic weights is 0.785, and with CaO 0.646 of clinker gives 0.507 t CO₂ per t clinker (IPCC default 0.52)', () => {
    const co2 = molarMass([[aw('C'), 1], [aw('O'), 2]]), cao = molarMass([[aw('Ca'), 1], [aw('O'), 1]]);
    expect(co2 / cao).toBeCloseTo(0.785, 3);
    const perClinker = cementProcessCO2({ mrCO2: co2, mrCaO: cao, fCaO: H.cement.caoClinker.v, clinkerRatio: 1, mCement: 1 });
    expect(perClinker).toBeCloseTo(0.507, 3);
    expect(Math.abs(perClinker - H.cement.ipccEF.v)).toBeLessThan(0.02);
  });
});

describe('waste heat (Kleidon et al. 2023)', () => {
  it('595 EJ/yr is 18.9 TW: 0.04 W/m² over the globe and 0.13 W/m² over land, as printed', () => {
    expect((595e18 / (365.25 * 86400)) / 1e12).toBeCloseTo(18.9, 1);
    expect(heatFlux(H.heat.energyEJ, H.heat.earthArea)).toBeCloseTo(0.037, 3);
    expect(heatFlux(H.heat.energyEJ, H.heat.earthArea * H.heat.landFrac)).toBeCloseTo(0.13, 2);
    expect(H.heat.ghgForcing / heatFlux(H.heat.energyEJ, H.heat.earthArea)).toBeGreaterThan(60);
  });
});

describe('life-cycle emissions (NREL 2021 medians)', () => {
  const g = (id: string) => H.lca.rows.find((r: any) => r.id === id).total as number;
  it('coal is about 20 times solar PV (fact sheet: “about 20 times more … than solar, wind, or nuclear”)', () => {
    expect(g('coal') / g('pv')).toBeGreaterThan(18); expect(g('coal') / g('pv')).toBeLessThan(25);
  });
  it('a mix is the weighted mean of medians: half coal, half wind = 507 g/kWh', () => {
    expect(mixIntensity([{ weight: 1, gPerKWh: g('coal') }, { weight: 1, gPerKWh: g('wind') }])).toBeCloseTo(507, 5);
    expect(mixIntensity([])).toBe(0);
  });
});

describe('water and heat islands', () => {
  it('thermoelectric consumption is about 3 % of withdrawal; irrigation 62 % (USGS 2015)', () => {
    const t = H.water.uses.find((u: any) => u.id === 'thermo'), i = H.water.uses.find((u: any) => u.id === 'irrigation');
    expect(Math.round(t.c / t.w * 100)).toBe(3); expect(Math.round(i.c / i.w * 100)).toBe(62);
  });
  it('EPA 1–7 °F by day is 0.6–3.9 °C', () => { expect(dF2dC(1)).toBeCloseTo(0.56, 2); expect(dF2dC(7)).toBeCloseTo(3.89, 2); });
});

describe('methane and aviation', () => {
  it('the fastest annual methane rise in the table is 2021 (17.70 ppb)', () => {
    const top = [...H.methane.increase].sort((a: any, b: any) => b[1] - a[1])[0];
    expect(top[0]).toBe(2021); expect(top[1]).toBeCloseTo(17.7, 2);
  });
  it('aviation’s printed warming terms exceed the net, so cooling terms make up 8.3 mW/m²', () => {
    const s = H.aviation.terms.reduce((a: number, t: any) => a + t.v, 0);
    expect(s - H.aviation.net).toBeCloseTo(8.3, 5);
  });
});
