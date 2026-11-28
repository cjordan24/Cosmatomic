/**
 * Gate 12.4 — the Hodgkin–Huxley (1952) model, checked against what the paper itself states.
 */
import { describe, expect, it } from 'vitest';
import { HH_TABLE3, alphaM, alphaN, betaH, conductionVelocity, ionicCurrents, phi, restingState, simulateMembrane } from '@/core/biology/hodgkinHuxley';

describe('Hodgkin & Huxley (1952)', () => {
  it('Table 3 footnote: V_l = −10·613 makes the total ionic current (nearly) zero at rest — exactly zero needs −10·599', () => {
    const c = ionicCurrents(restingState());
    expect(Math.abs(c.total)).toBeLessThan(0.005);                 // 0.0042 µA/cm², about 0.1 % of I_K at rest
    const exactVl = (c.INa + c.IK) / HH_TABLE3.gl;                // I_l = ḡ_l(0 − V_l) must cancel I_Na + I_K
    expect(exactVl).toBeCloseTo(-10.599, 3);                       // printed −10·613: 0.014 mV apart (finding, documented)
  });
  it('the removable singularities of eqs. (12) and (20) take their limits', () => {
    expect(alphaN(-10)).toBeCloseTo(0.1, 12);
    expect(alphaM(-25)).toBeCloseTo(1, 12);
    expect(alphaN(-10 + 1e-6)).toBeCloseTo(0.1, 6);
    expect(betaH(-30)).toBeCloseTo(0.5, 12);
  });
  it('φ = 3^((T − 6·3)/10): 1 at 6·3 °C, 3 at 16·3 °C (p. 523)', () => {
    expect(phi(6.3)).toBe(1);
    expect(phi(16.3)).toBeCloseTo(3, 12);
  });
  it('a 15 mV depolarisation (V0 = −15) at 6·3 °C fires a full action potential; a 2 mV one does not', () => {
    const big = simulateMembrane({ tMax: 20, V0: -15 });
    const peak = Math.min(...big.V);
    expect(peak).toBeLessThan(-90);     // overshoot towards V_Na = −115 (depolarisation negative)
    expect(peak).toBeGreaterThan(-115); // never beyond V_Na
    const small = simulateMembrane({ tMax: 20, V0: -2 });
    expect(Math.min(...small.V)).toBeGreaterThan(-5);
  });
  it('the spike repolarises past rest (positive V, after-hyperpolarisation) towards V_K = +12', () => {
    const tr = simulateMembrane({ tMax: 25, V0: -15 });
    const after = Math.max(...tr.V.slice(tr.V.indexOf(Math.min(...tr.V))));
    expect(after).toBeGreaterThan(0); expect(after).toBeLessThan(12);
  });
  it('warmer membranes give faster spikes (Q10 = 3): the peak comes sooner at 18·5 °C than at 6·3 °C', () => {
    const tPeak = (tempC: number) => { const tr = simulateMembrane({ tMax: 15, V0: -15, tempC, dt: 0.005 }); return tr.t[tr.V.indexOf(Math.min(...tr.V))]; };
    expect(tPeak(18.5)).toBeLessThan(tPeak(6.3) / 2);
  });
  it('eq. (34): K = 10·47 msec⁻¹, a = 238 µ, R₂ = 35·4 Ω cm, C_M = 1 µF/cm² give 18·8 m/sec (measured 21·2)', () => {
    expect(conductionVelocity(10.47, 0.0238, 35.4, HH_TABLE3.CM)).toBeCloseTo(18.8, 1);
  });
});
