/**
 * Gate 12.4 — the nerves dataset agrees with the model it is shown beside.
 */
import { describe, expect, it } from 'vitest';
import { HH_TABLE3, conductionVelocity, simulateMembrane } from '@/core/biology/hodgkinHuxley';
import data from '@datasets/biology/nerves.json';

const N = data as unknown as { hh: { table3: { rows: { constant: string; chosen: string }[] }; propagation: { K: number; aCm: number; R2: number; CM: number; calculated: number } }; hursh: { factor: number }; neurons: { count: { neurons: number; sd: number } } };
const val = (s: string) => Number(s.replace('·', '.').replace('−', '-').replace('*', '').replace('+', ''));

describe('nerves dataset', () => {
  it('Table 3 as transcribed equals the constants the simulator uses', () => {
    const r = Object.fromEntries(N.hh.table3.rows.map((x) => [x.constant.split(' ')[0], val(x.chosen)]));
    expect([r.C_M, r.V_Na, r.V_K, r.V_l, r['ḡ_Na'], r['ḡ_K'], r['ḡ_l']]).toEqual([HH_TABLE3.CM, HH_TABLE3.VNa, HH_TABLE3.VK, HH_TABLE3.Vl, HH_TABLE3.gNa, HH_TABLE3.gK, HH_TABLE3.gl]);
  });
  it('the printed fibre gives the printed 18·8 m/sec', () => {
    const p = N.hh.propagation;
    expect(Math.round(conductionVelocity(p.K, p.aCm, p.R2, p.CM) * 10) / 10).toBe(p.calculated);
  });
  it('the view’s default run (15 mV at 6·3 °C) fires; with ḡ_Na = 0 it cannot', () => {
    const fire = simulateMembrane({ tMax: 22, V0: -15 });
    expect(Math.max(...fire.V.map((v) => -v))).toBeGreaterThan(90);
    const blocked = simulateMembrane({ tMax: 22, V0: -15, params: { ...HH_TABLE3, gNa: 0 } });
    expect(Math.max(...blocked.V.map((v) => -v))).toBeLessThanOrEqual(15.0001);
  });
  it('Hursh 6.0 m/s per µm; Azevedo 86.1 ± 8.1 billion neurons', () => {
    expect(N.hursh.factor * 10).toBe(60);
    expect(N.neurons.count.neurons).toBe(86.1e9); expect(N.neurons.count.sd).toBe(8.1e9);
  });
});
