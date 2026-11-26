/**
 * Gate 4.4 — phase behaviour and the Lennard-Jones fluid.
 * References: IAPWS SR1-86(1992), IAPWS R14-08(2011) triple points, NIST WebBook (IAPWS-95,
 * Span–Wagner) coexistence tables, ITS-90.
 */
import { describe, expect, it } from 'vitest';
import { PHASE_DATA, classify, iceIhMeltingPressure, waterMeltingBranches, co2SublimationPressure, co2VaporPressure, criticalPoint, saturationState, triplePoint, waterMeltingPressure, waterSublimationPressure, waterVaporPressure } from '@/modes/atomic/phases/phase';
import { ARGON, advance, createLJ, densityGcc, ljPotential, momentum, msd, pressure, rdf, step, tauPs, temperature, totalEnergy } from '@/modes/atomic/phases/lj';

describe('water phase boundaries (IAPWS)', () => {
  it('normal boiling point: p_sat(373.124 K) = 101.325 kPa (ITS-90 value, IAPWS-95)', () => {
    expect(Math.abs(waterVaporPressure(373.124)! / 101325 - 1)).toBeLessThan(2e-4);
  });
  it('auxiliary equation agrees with the WebBook IAPWS-95 table across 273.2–646.9 K (< 0.05 %)', () => {
    let worst = 0;
    for (const r of PHASE_DATA.water.saturationTable.rows) worst = Math.max(worst, Math.abs(waterVaporPressure(r.T)! / (r.pMPa * 1e6) - 1));
    expect(worst).toBeLessThan(5e-4);
  });
  it('curves meet at the triple point (273.16 K, 611.657 Pa) and end at the critical point', () => {
    expect(waterVaporPressure(273.16)!).toBeCloseTo(611.657, 0);
    expect(waterSublimationPressure(273.16)!).toBeCloseTo(611.657, 6);
    expect(iceIhMeltingPressure(273.16)!).toBeCloseTo(611.657, 6);
    expect(waterVaporPressure(647.096)!).toBeCloseTo(22.064e6, -1);
    expect(waterVaporPressure(700)).toBeNull();
  });
  it('melting branches join at the IAPWS ice triple points (Table 1) and Ih coexists in T with III/V', () => {
    expect(Math.abs(iceIhMeltingPressure(251.165)! / 208.566e6 - 1)).toBeLessThan(0.01); // stated 0.64 %
    const at = (T: number) => waterMeltingBranches(T).map((b) => [b.ice, b.p / 1e6] as const);
    expect(at(251.165).find((b) => b[0] === 'ice III')![1]).toBeCloseTo(208.566, 2);
    for (const [T, p, a, b] of [[256.164, 350.1, 'ice III', 'ice V'], [273.31, 632.4, 'ice V', 'ice VI'], [355, 2216, 'ice VI', 'ice VII']] as const) {
      expect(at(T).find((x) => x[0] === a)![1]).toBeCloseTo(p, 0);
      expect(at(T).find((x) => x[0] === b)![1]).toBeCloseTo(p, 0);
    }
    expect(at(260).map((b) => b[0])).toEqual(['ice Ih', 'ice V']); // two branches at the same T
    expect(waterMeltingPressure(300)!.ice).toBe('ice VI');
  });
  it('Clausius–Clapeyron: d ln p / d(1/T) ≈ −ΔvapH/R at 373 K, within 3 % (non-ideal vapour)', () => {
    const T = 373.124, h = 0.01;
    const slope = (Math.log(waterVaporPressure(T + h)!) - Math.log(waterVaporPressure(T - h)!)) / (1 / (T + h) - 1 / (T - h));
    const s = saturationState('water', T)!;
    const dH = (s.hV - s.hL) * 18.015268; // kJ/kg × g/mol → J/mol
    expect(Math.abs(-slope * 8.314462618 / dH - 1)).toBeLessThan(0.03);
  });
  it('classification: 1 atm → ice Ih / liquid / vapour; supercritical; ice VI at 300 K, 1.5 GPa', () => {
    expect(classify('water', 263.15, 101325).phase).toBe('ice Ih');
    expect(classify('water', 298.15, 101325).phase).toBe('liquid');
    expect(classify('water', 373.5, 101325).phase).toBe('vapour');
    expect(classify('water', 700, 30e6).phase).toBe('supercritical fluid');
    expect(classify('water', 300, 1.5e9).phase).toBe('ice VI');
    expect(classify('water', 260, 150e6).phase).toBe('liquid'); // pressure-melted ice
    expect(classify('water', 260, 500e6).phase).toBe('ice V');
  });
});

describe('CO₂ phase boundaries', () => {
  it('Span–Wagner table spans triple (216.59 K, 0.518 MPa) → critical (304.13 K, 7.377 MPa)', () => {
    expect(triplePoint('co2').T).toBeCloseTo(216.59, 2);
    expect(criticalPoint('co2').p).toBeCloseTo(7.3773e6, -2);
    expect(PHASE_DATA.co2.tripleMeasured!.T).toBeCloseTo(216.58, 2); // independent TRC evaluation
  });
  it('dry ice sublimes at 1 atm near 194.7 K (Antoine fit to Giauque & Egan 1937, within 1 %)', () => {
    expect(Math.abs(co2SublimationPressure(194.686)! / 101325 - 1)).toBeLessThan(0.01);
    expect(co2SublimationPressure(205)).toBeNull(); // outside the fit range: no extrapolation
  });
  it('classification: gas at room conditions; solid at 190 K, 1 atm; liquid only above 5.18 bar', () => {
    expect(classify('co2', 298.15, 101325).phase).toBe('vapour');
    expect(classify('co2', 190, 101325).phase).toBe('solid');
    expect(classify('co2', 250, 5e6).phase).toBe('liquid');
    expect(classify('co2', 250, 5e6).certain).toBe(false); // melting curve not bundled
    expect(co2VaporPressure(298.15)! / 1e6).toBeCloseTo(6.43, 1);
  });
});

describe('Lennard-Jones fluid (reduced units)', () => {
  it('potential minimum −ε at r = 2^(1/6) σ, zero at σ', () => {
    expect(ljPotential(2 ** (1 / 6))).toBeCloseTo(-1, 12);
    expect(ljPotential(1)).toBe(0);
  });
  it('NVE: momentum conserved; energy fluctuates without secular drift', () => {
    const s = createLJ(3, 0.8, 1.0, 7);
    for (let i = 0; i < 200; i++) step(s, 0.004); // equilibrate a little
    const E0 = totalEnergy(s);
    const es: number[] = [];
    for (let i = 0; i < 1500; i++) { step(s, 0.004); if (i % 100 === 0) es.push(totalEnergy(s)); }
    expect(Math.max(...es.map((e) => Math.abs(e - E0))) / s.N).toBeLessThan(5e-3);
    for (const p of momentum(s)) expect(Math.abs(p)).toBeLessThan(1e-9);
  });
  it('Berendsen thermostat holds T* and the trajectory is independent of call chunking (frame-rate independence)', () => {
    const a = createLJ(3, 0.8, 1.5, 3), b = createLJ(3, 0.8, 1.5, 3);
    advance(a, 2.0, 0.005, 1.0);
    for (let k = 0; k < 37; k++) advance(b, 2.0 / 37, 0.005, 1.0);
    expect(Math.abs(a.t - b.t)).toBeLessThan(1e-9);
    expect(a.x[5]).toBeCloseTo(b.x[5], 9);
    expect(Math.abs(temperature(a) - 1.0)).toBeLessThan(0.15);
  });
  it('states: liquid (ρ*=0.8, T*=1.0) diffuses and has g(r) peak near 1.1σ; solid (ρ*=1.1, T*=0.5) stays put', () => {
    const liq = createLJ(3, 0.8, 1.0, 11);
    advance(liq, 6, 0.005, 1.0);
    const g = rdf(liq, 50);
    const peak = g.reduce((m, p) => (p[1] > m[1] ? p : m));
    expect(peak[0]).toBeGreaterThan(1.0); expect(peak[0]).toBeLessThan(1.2);
    expect(msd(liq)).toBeGreaterThan(0.5);
    const sol = createLJ(3, 1.1, 0.5, 11);
    advance(sol, 6, 0.005, 0.5);
    expect(msd(sol)).toBeLessThan(0.1);
    expect(Number.isFinite(pressure(sol))).toBe(true);
  });
  it('argon units: τ ≈ 2.16 ps; ρ* = 0.8 ↔ 1.35 g/cm³; LJ triple T* ≈ 0.69 maps near argon’s ITS-90 triple point 83.8 K (order-of-magnitude check only)', () => {
    expect(tauPs()).toBeCloseTo(2.16, 1);
    expect(densityGcc(0.8)).toBeCloseTo(1.35, 1);
    expect(Math.abs(0.69 * ARGON.epsK - PHASE_DATA.lennardJonesArgon.tripleK_ITS90) / 83.8).toBeLessThan(0.05);
  });
});
