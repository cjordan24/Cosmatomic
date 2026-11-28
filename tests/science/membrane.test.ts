/**
 * Gate 11.5 — membrane potential. Hodgkin & Katz (1949) equation (4) with their concentrations reproduces Table 7.
 */
import { describe, expect, it } from 'vitest';
import { FARADAY, R_GAS, celsiusToKelvin, hodgkinKatzE, membranePotential, nernst, thermalVoltage, type Ions } from '@/core/biology/membrane';
import data from '@datasets/biology/membranes.json';

interface Sol { id: string; K: number; Na: number; Cl: number; reference: 'sea' | 'artificial' }
const HK = (data as unknown as { hodgkinKatz: { internal: Ions; seaWaterSolution: Ions; artificialSeaWater: Ions; solutions: Sol[]; states: { id: string; P: Ions; calculated: number[] }[]; seaWater: { id: string; calculated: number }[] } }).hodgkinKatz;

function maxDeviation(tC: number) {
  const T = celsiusToKelvin(tC);
  let m = 0;
  const E = (P: Ions, o: Ions) => hodgkinKatzE(P, HK.internal, o, T) * 1000;
  for (const st of HK.states) {
    HK.solutions.forEach((s, k) => {
      const ref = s.reference === 'sea' ? HK.seaWaterSolution : HK.artificialSeaWater;
      m = Math.max(m, Math.abs(E(st.P, s) - E(st.P, ref) - st.calculated[k]));
    });
    m = Math.max(m, Math.abs(E(st.P, HK.seaWaterSolution) - HK.seaWater.find((r) => r.id === st.id)!.calculated));
  }
  return m;
}

describe('Hodgkin & Katz (1949) equation (4)', () => {
  it('R and F from the exact SI constants match CODATA', () => {
    expect(R_GAS).toBeCloseTo(8.314462618, 8);
    expect(FARADAY).toBeCloseTo(96485.33212, 4);
    expect(thermalVoltage(298.15) * 1000).toBeCloseTo(25.693, 3);
  });
  it('resting axon in sea water: E = +59 mV as printed (paper sign, outside − inside); V_m = −59 mV', () => {
    const T = celsiusToKelvin(18);
    const rest = HK.states.find((s) => s.id === 'rest')!.P;
    expect(hodgkinKatzE(rest, HK.internal, HK.seaWaterSolution, T) * 1000).toBeCloseTo(59, -0.5);
    expect(membranePotential(rest, HK.internal, HK.seaWaterSolution, T)).toBeCloseTo(-hodgkinKatzE(rest, HK.internal, HK.seaWaterSolution, T), 15);
  });
  it('reproduces all 27 calculated changes of Table 7 and the three sea-water potentials within 1 mV at 18 °C', () => {
    expect(maxDeviation(18)).toBeLessThan(1);
  });
  it('the agreement holds from 14.6 to 21.5 °C and fails outside it (paper temperature not read)', () => {
    expect(maxDeviation(14.6)).toBeLessThanOrEqual(1);
    expect(maxDeviation(21.5)).toBeLessThanOrEqual(1);
    expect(maxDeviation(12)).toBeGreaterThan(1);
    expect(maxDeviation(25)).toBeGreaterThan(1);
  });
  it('action potential 97 mV and positive phase 15 mV as printed', () => {
    const T = celsiusToKelvin(18), E = (id: string) => hodgkinKatzE(HK.states.find((s) => s.id === id)!.P, HK.internal, HK.seaWaterSolution, T) * 1000;
    expect(Math.round(E('rest') - E('active'))).toBe(97);
    expect(Math.round(E('refractory') - E('rest'))).toBe(15);
  });
  it('“reduces to the thermodynamically correct forms when any one permeability constant is made large”', () => {
    const T = 291.15, ins = HK.internal, out = HK.seaWaterSolution;
    expect(membranePotential({ K: 1e9, Na: 1, Cl: 1 }, ins, out, T)).toBeCloseTo(nernst(1, ins.K, out.K, T), 6);
    expect(membranePotential({ K: 1, Na: 1e9, Cl: 1 }, ins, out, T)).toBeCloseTo(nernst(1, ins.Na, out.Na, T), 6);
    expect(membranePotential({ K: 1, Na: 1, Cl: 1e9 }, ins, out, T)).toBeCloseTo(nernst(-1, ins.Cl, out.Cl, T), 6);
    expect(nernst(1, ins.K, out.K, T)).toBeLessThan(0);   // K is richer inside: inside negative
    expect(nernst(1, ins.Na, out.Na, T)).toBeGreaterThan(0);
  });
  it('Table 7 transcription: nine solutions, three states, permeability ratios as printed', () => {
    expect(HK.solutions.map((s) => s.id).join('')).toBe('ABCDEFGHI');
    expect(HK.states.map((s) => `${s.P.K}:${s.P.Na}:${s.P.Cl}`)).toEqual(['1:0.04:0.45', '1:20:0.45', '1.8:0:0.45']);
    expect(HK.internal).toMatchObject({ K: 345, Na: 72, Cl: 61 });
  });
});
