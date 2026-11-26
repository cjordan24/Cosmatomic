/** Gravitational sandbox: integrator order, conservation, collisions, Lagrange points, real-system fidelity. */
import { describe, expect, it } from 'vitest';
import { step, diagnostics, cloneState, lagrangePoints, escapeVelocity, resolveCollisions, G_KM, type SimState, type Integrator } from '@/modes/cosmic/sandbox/nbody';
import { PRESETS } from '@/modes/cosmic/sandbox/presets';
import { heliocentric } from '@/modes/cosmic/solar-system/ephemeris';
import { getBody } from '@/modes/cosmic/solar-system/bodies';

const JD = 2_460_676.5; // 2025-01-01 TDB
const preset = (id: string) => PRESETS.find((p) => p.id === id)!.build(JD);
const run = (s0: SimState, dt: number, n: number, integ: Integrator) => { const s = cloneState(s0); for (let i = 0; i < n; i++) step(s, dt, integ); return s; };
const relE = (s0: SimState, s: SimState) => Math.abs(diagnostics(s.bodies).E / diagnostics(s0.bodies).E - 1);

describe('Integrators', () => {
  it('convergence order: halving dt cuts the 1-yr energy error ≈4× (leapfrog, 2nd order) and ≈16× (Yoshida, 4th order)', () => {
    const s0 = preset('inner');
    const year = 365.25 * 86400;
    // max |ΔE/E| over the run (symplectic errors oscillate; the envelope scales as dt^p)
    const maxErr = (dt: number, integ: Integrator) => { const s = cloneState(s0); let m = 0; for (let t = 0; t < year; t += dt) { step(s, dt, integ); m = Math.max(m, relE(s0, s)); } return m; };
    const lf = maxErr(86400, 'leapfrog') / maxErr(43200, 'leapfrog');
    const y4 = maxErr(86400, 'yoshida4') / maxErr(43200, 'yoshida4');
    expect(lf).toBeGreaterThan(3.2); expect(lf).toBeLessThan(4.8);
    expect(y4).toBeGreaterThan(11); expect(y4).toBeLessThan(22);
  });
  it('100-year solar-system run (Yoshida, dt = 1 d): |ΔE/E| < 1e-8, |ΔL/L| < 1e-12, momentum stays ≈ 0', () => {
    const s0 = preset('solar-system');
    const s = run(s0, 86400, 36525, 'yoshida4');
    expect(relE(s0, s)).toBeLessThan(1e-8);
    const L0 = diagnostics(s0.bodies).L, L1 = diagnostics(s.bodies).L;
    expect(Math.hypot(L1[0] - L0[0], L1[1] - L0[1], L1[2] - L0[2]) / Math.hypot(...L0)).toBeLessThan(1e-12);
    const p = diagnostics(s.bodies).p, scale = s.bodies.reduce((t, b) => t + b.mass * Math.hypot(...b.v), 0);
    expect(Math.hypot(...p) / scale).toBeLessThan(1e-12);
  });
});

describe('Fidelity to the real solar system', () => {
  it('Newtonian N-body from today’s ephemeris stays within 0.002 au of the JPL-element ephemeris after 1 year (Earth, Mars, Jupiter)', () => {
    const s0 = preset('solar-system');
    const s = run(s0, 3600 * 6, 4 * 365, 'yoshida4');
    const sun = s.bodies.find((b) => b.id === 'sun')!;
    for (const id of ['earth', 'mars', 'jupiter']) {
      const b = s.bodies.find((x) => x.id === id)!;
      const sim = b.x.map((x, k) => x - sun.x[k]);
      const ref = heliocentric(id, JD + 365);
      const err = Math.hypot(sim[0] - ref[0], sim[1] - ref[1], sim[2] - ref[2]) / 149_597_870.7;
      expect(err, id).toBeLessThan(0.002);
    }
  });
});

describe('Lagrange points and escape velocity', () => {
  // L-point distances scale with the instantaneous Sun–Earth distance R (0.983 au on 1 January), so test L/R:
  // CR3BP with μ = 3.04e-6 gives r(L1)/R = 0.00997, r(L2)/R = 0.01004.
  it('Sun–Earth L1/L2 at 0.00997 R and 0.01004 R from Earth (±1 %); L4/L5 equidistant (R) from Sun and Earth', () => {
    const s = preset('solar-system');
    const sun = s.bodies.find((b) => b.id === 'sun')!, earth = s.bodies.find((b) => b.id === 'earth')!;
    const L = lagrangePoints(sun, earth);
    const dE = (n: string) => Math.hypot(...L.find((p) => p.name === n)!.x.map((x, k) => x - earth.x[k]));
    const R = Math.hypot(...earth.x.map((x, k) => x - sun.x[k]));
    expect(Math.abs(dE('L1') / R / 0.00997 - 1)).toBeLessThan(0.01);
    expect(Math.abs(dE('L2') / R / 0.01004 - 1)).toBeLessThan(0.01);
    for (const n of ['L4', 'L5']) {
      const p = L.find((q) => q.name === n)!.x;
      expect(Math.abs(Math.hypot(...p.map((x, k) => x - sun.x[k])) / R - 1)).toBeLessThan(0.01);
      expect(Math.abs(Math.hypot(...p.map((x, k) => x - earth.x[k])) / R - 1)).toBeLessThan(0.01);
    }
  });
  it('Trojans placed at L4/L5 stay within 0.05 au of their points after 20 Jupiter years (tadpole stability)', () => {
    const s0 = preset('trojans');
    const s = run(s0, 86400 * 2, Math.round((20 * 11.86 * 365.25) / 2), 'yoshida4');
    const sun = s.bodies.find((b) => b.id === 'sun')!, jup = s.bodies.find((b) => b.id === 'jup')!;
    const L = lagrangePoints(sun, jup);
    for (const [id, n] of [['L4 Trojan', 'L4'], ['L5 Trojan', 'L5']]) {
      const b = s.bodies.find((x) => x.id === id)!;
      const p = L.find((q) => q.name === n)!.x;
      expect(Math.hypot(...b.x.map((x, k) => x - p[k])) / 149_597_870.7, id).toBeLessThan(0.05);
    }
  });
  it('escape velocity at Earth’s surface = 11.19 km/s (±0.02)', () => {
    expect(Math.abs(escapeVelocity(getBody('earth')!.massKg!, 6371) - 11.19)).toBeLessThan(0.02);
  });
});

describe('Collisions and special solutions', () => {
  it('inelastic merger conserves mass and momentum exactly and records dissipated energy > 0', () => {
    const s: SimState = { t: 0, dissipated: 0, events: [], bodies: [
      { id: 'a', name: 'A', mass: 6e24, radius: 6000, color: '', x: [0, 0, 0], v: [1, 0, 0] },
      { id: 'b', name: 'B', mass: 3e24, radius: 6000, color: '', x: [10000, 0, 0], v: [-2, 0.5, 0] },
    ] };
    const p0 = diagnostics(s.bodies).p;
    resolveCollisions(s);
    expect(s.bodies).toHaveLength(1);
    expect(Math.abs(s.bodies[0].mass / 9e24 - 1)).toBeLessThan(1e-15);
    const p1 = diagnostics(s.bodies).p;
    const pScale = 6e24 * 1 + 3e24 * Math.hypot(2, 0.5); // Σ|m v| — total momentum here is ~0 in x, so scale by magnitudes
    for (let k = 0; k < 3; k++) expect(Math.abs(p1[k] - p0[k]) / pScale).toBeLessThan(1e-12);
    expect(s.dissipated).toBeGreaterThan(0);
    expect(s.events[0]).toMatch(/merged/);
  });
  it('figure-eight choreography returns to its initial configuration after one period (T ≈ 6.3259 in G = m = 1 units) within 1e-3 au', () => {
    const s0 = preset('figure-eight');
    const L = 149_597_870.7, M = getBody('sun')!.massKg!;
    const T = 6.32591398 * Math.sqrt(L ** 3 / (G_KM * M));
    const n = 20000;
    const s = run(s0, T / n, n, 'yoshida4');
    for (let i = 0; i < 3; i++) expect(Math.hypot(...s.bodies[i].x.map((x, k) => x - s0.bodies[i].x[k])) / L).toBeLessThan(1e-3);
  });
});

describe('Reproducibility (notebook restore)', () => {
  it('re-running from stored initial conditions with the same solver settings reproduces the saved state bit-for-bit', () => {
    const s0 = preset('inner');
    const stored = JSON.parse(JSON.stringify(s0)) as SimState; // what IndexedDB stores (structured clone ≈ JSON here)
    const a = run(s0, 3 * 3600, 2000, 'yoshida4');
    const b = run(stored, 3 * 3600, 2000, 'yoshida4');
    expect(b.bodies.map((x) => x.x)).toEqual(a.bodies.map((x) => x.x));
  });
});
