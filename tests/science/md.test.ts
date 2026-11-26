/** Molecular dynamics (velocity Verlet on VGFF-1): units, conservation, thermostat. */
import { describe, expect, it } from 'vitest';
import { MOLECULES } from '@/modes/atomic/molecules/molecules';
import { initMD, mdStep, temperature, totalEnergy, kineticEnergy, ACC, type MDState } from '@/modes/atomic/laboratory/md';
import { optimise } from '@/modes/atomic/laboratory/forcefield';
import { ELEMENTS } from '@/modes/atomic/atoms/elements';
import type { Structure } from '@/modes/atomic/laboratory/builder';

const lib = (name: string): Structure => { const m = MOLECULES.find((x) => x.name === name)!; return optimise({ atoms: m.atoms, bonds: m.bonds }).structure; };
const mom = (st: MDState) => [0, 1, 2].map((k) => { let p = 0; for (let i = k; i < st.v.length; i += 3) p += st.m[i] * st.v[i]; return p; });

describe('Molecular dynamics', () => {
  it('unit conversion: a two-atom C–O "molecule" oscillates with the analytic period T = 2π√(μ/(2k)) (VGFF E = k(r−r₀)², k = 700) within 0.5 %', () => {
    const r0 = 1.1;
    const s: Structure = { atoms: [{ Z: 6, x: 0, y: 0, z: 0, charge: 0 }, { Z: 8, x: r0 + 0.05, y: 0, z: 0, charge: 0 }], bonds: [{ a: 0, b: 1, order: 3 }] };
    const st = initMD(s, 0);
    const rEq = st.ff.bonds[0].r0;
    // displace 0.02 Å from the force-field equilibrium, start at rest
    st.x[3] = rEq + 0.02; st.v.fill(0);
    const mC = ELEMENTS[5].atomicWeight!, mO = ELEMENTS[7].atomicWeight!;
    const mu = (mC * mO) / (mC + mO);
    const Tanalytic = 2 * Math.PI * Math.sqrt(mu / (2 * 700 * ACC)); // fs
    // measure period from successive maxima of the bond length
    const dt = 0.01; let prev = 0, prev2 = 0; const peaks: number[] = [];
    for (let i = 0; i < 20000 && peaks.length < 4; i++) {
      mdStep(st, dt);
      const r = st.x[3] - st.x[0];
      if (i > 2 && prev > prev2 && prev > r) peaks.push(st.t - dt);
      prev2 = prev; prev = r;
    }
    const Tsim = (peaks[3] - peaks[0]) / 3;
    expect(Math.abs(Tsim / Tanalytic - 1)).toBeLessThan(0.005);
  });
  // Velocity Verlet is symplectic: energy FLUCTUATES with amplitude ∝ dt² (≈ (ω·dt)² for the fastest C–H
  // vibration, ~10⁻³ of K at 0.2 fs) but does not DRIFT. Test both properties rather than an arbitrary threshold.
  it('NVE (ethanol, 300 K): energy fluctuation scales as dt² (halving dt → 3–5× smaller), no secular drift, net momentum ≈ 0', () => {
    const run = (dt: number, steps: number) => {
      const st = initMD(lib('Ethanol'), 300, 7);
      const E0 = totalEnergy(st), K0 = kineticEnergy(st);
      let maxDev = 0; const Es: number[] = [];
      for (let i = 0; i < steps; i++) { mdStep(st, dt); const e = totalEnergy(st); Es.push(e); maxDev = Math.max(maxDev, Math.abs(e - E0)); }
      const q = Math.floor(steps / 4);
      const mean = (xs: number[]) => xs.reduce((t, x) => t + x, 0) / xs.length;
      return { fluct: maxDev / K0, drift: Math.abs(mean(Es.slice(-q)) - mean(Es.slice(0, q))) / K0, st };
    };
    const coarse = run(0.2, 20000), fine = run(0.1, 40000); // same simulated time, 4 ps
    const ratio = coarse.fluct / fine.fluct;
    expect(ratio).toBeGreaterThan(3); expect(ratio).toBeLessThan(5);
    expect(coarse.drift).toBeLessThan(5e-4);
    expect(Math.hypot(...mom(coarse.st))).toBeLessThan(1e-9);
  });
  it('initial velocities reproduce the requested temperature exactly; Berendsen holds ⟨T⟩ within 5 % of 500 K (glycine)', () => {
    const st = initMD(lib('Glycine'), 500, 3);
    expect(Math.abs(temperature(st) - 500)).toBeLessThan(1e-6);
    let sum = 0, n = 0;
    for (let i = 0; i < 30000; i++) { mdStep(st, 0.25, { kind: 'berendsen', T: 500, tauFs: 100 }); if (i > 10000) { sum += temperature(st); n++; } }
    expect(Math.abs(sum / n / 500 - 1)).toBeLessThan(0.05);
  });
  it('deterministic: the same seed gives bit-identical trajectories', () => {
    const a = initMD(lib('Water'), 300, 42), b = initMD(lib('Water'), 300, 42);
    for (let i = 0; i < 500; i++) { mdStep(a, 0.5); mdStep(b, 0.5); }
    expect(Array.from(a.x)).toEqual(Array.from(b.x));
  });
});
