/**
 * Gravitational sandbox physics (Newtonian N-body), SI-consistent units:
 *   length km, time s, mass kg; G in km³ kg⁻¹ s⁻².
 *
 * Integrators (both symplectic, time-reversible, fixed step):
 *   - 'leapfrog'  kick-drift-kick, 2nd order
 *   - 'yoshida4'  Yoshida (1990) 4th-order composition of leapfrog steps
 *                 w1 = 1/(2 − 2^(1/3)), w0 = −2^(1/3)/(2 − 2^(1/3))
 * Collisions: bodies whose separation < sum of radii merge in a perfectly inelastic collision
 * (mass and linear momentum conserved; the lost kinetic energy is recorded, not hidden).
 * Validity: v ≪ c, separations ≫ Schwarzschild radii, point masses (no tides, no GR).
 */
import { CONSTANTS } from '@/core/constants/constants';

export const G_KM = CONSTANTS.G.value * 1e-9; // km³ kg⁻¹ s⁻²

export interface SBody { id: string; name: string; mass: number; radius: number; color: string; x: number[]; v: number[] }
export interface SimState { t: number; bodies: SBody[]; dissipated: number; events: string[] }
export type Integrator = 'leapfrog' | 'yoshida4';

export function accelerations(bodies: SBody[]): number[][] {
  const n = bodies.length;
  const a = bodies.map(() => [0, 0, 0]);
  for (let i = 0; i < n; i++) {
    const bi = bodies[i];
    for (let j = i + 1; j < n; j++) {
      const bj = bodies[j];
      const dx = bj.x[0] - bi.x[0], dy = bj.x[1] - bi.x[1], dz = bj.x[2] - bi.x[2];
      const r2 = dx * dx + dy * dy + dz * dz;
      const inv = 1 / (r2 * Math.sqrt(r2));
      const fi = G_KM * bj.mass * inv, fj = G_KM * bi.mass * inv;
      a[i][0] += dx * fi; a[i][1] += dy * fi; a[i][2] += dz * fi;
      a[j][0] -= dx * fj; a[j][1] -= dy * fj; a[j][2] -= dz * fj;
    }
  }
  return a;
}

function kdk(bodies: SBody[], dt: number): void {
  let a = accelerations(bodies);
  for (let i = 0; i < bodies.length; i++) for (let k = 0; k < 3; k++) bodies[i].v[k] += 0.5 * dt * a[i][k];
  for (const b of bodies) for (let k = 0; k < 3; k++) b.x[k] += dt * b.v[k];
  a = accelerations(bodies);
  for (let i = 0; i < bodies.length; i++) for (let k = 0; k < 3; k++) bodies[i].v[k] += 0.5 * dt * a[i][k];
}

const CBRT2 = Math.cbrt(2);
const W1 = 1 / (2 - CBRT2), W0 = -CBRT2 / (2 - CBRT2);

/** Advance in place by one step of size dt (s). */
export function step(state: SimState, dt: number, integrator: Integrator): void {
  if (integrator === 'leapfrog') kdk(state.bodies, dt);
  else { kdk(state.bodies, W1 * dt); kdk(state.bodies, W0 * dt); kdk(state.bodies, W1 * dt); }
  state.t += dt;
  resolveCollisions(state);
}

/** Perfectly inelastic mergers; records dissipated kinetic energy (J-scale in kg·km²/s² → ×1e6 for J). */
export function resolveCollisions(state: SimState): void {
  const bs = state.bodies;
  for (let i = 0; i < bs.length; i++) for (let j = i + 1; j < bs.length; j++) {
    const a = bs[i], b = bs[j];
    const d = Math.hypot(a.x[0] - b.x[0], a.x[1] - b.x[1], a.x[2] - b.x[2]);
    if (d >= a.radius + b.radius) continue;
    const M = a.mass + b.mass;
    const v = [0, 1, 2].map((k) => (a.mass * a.v[k] + b.mass * b.v[k]) / M);
    const x = [0, 1, 2].map((k) => (a.mass * a.x[k] + b.mass * b.x[k]) / M);
    const keBefore = 0.5 * a.mass * (a.v[0] ** 2 + a.v[1] ** 2 + a.v[2] ** 2) + 0.5 * b.mass * (b.v[0] ** 2 + b.v[1] ** 2 + b.v[2] ** 2);
    const keAfter = 0.5 * M * (v[0] ** 2 + v[1] ** 2 + v[2] ** 2);
    state.dissipated += keBefore - keAfter;
    const big = a.mass >= b.mass ? a : b;
    // merged radius conserves volume (equal-density assumption)
    const merged: SBody = { ...big, mass: M, radius: Math.cbrt(a.radius ** 3 + b.radius ** 3), x, v, name: `${big.name}`, id: big.id };
    state.events.push(`t = ${(state.t / 86400).toFixed(2)} d: ${a.name} and ${b.name} collided and merged (inelastic).`);
    bs.splice(j, 1); bs.splice(i, 1, merged);
    j = i; // re-check the merged body against the rest
  }
}

export interface Diag { E: number; K: number; U: number; p: number[]; L: number[]; com: number[] }
export function diagnostics(bodies: SBody[]): Diag {
  let K = 0, U = 0, M = 0;
  const p = [0, 0, 0], L = [0, 0, 0], com = [0, 0, 0];
  for (let i = 0; i < bodies.length; i++) {
    const b = bodies[i];
    K += 0.5 * b.mass * (b.v[0] ** 2 + b.v[1] ** 2 + b.v[2] ** 2);
    for (let k = 0; k < 3; k++) { p[k] += b.mass * b.v[k]; com[k] += b.mass * b.x[k]; }
    L[0] += b.mass * (b.x[1] * b.v[2] - b.x[2] * b.v[1]);
    L[1] += b.mass * (b.x[2] * b.v[0] - b.x[0] * b.v[2]);
    L[2] += b.mass * (b.x[0] * b.v[1] - b.x[1] * b.v[0]);
    M += b.mass;
    for (let j = i + 1; j < bodies.length; j++) {
      const c = bodies[j];
      U -= (G_KM * b.mass * c.mass) / Math.hypot(b.x[0] - c.x[0], b.x[1] - c.x[1], b.x[2] - c.x[2]);
    }
  }
  return { E: K + U, K, U, p, L, com: com.map((c) => c / M) };
}

/** Shift to the barycentric frame (zero total momentum, centre of mass at origin). */
export function toBarycentric(bodies: SBody[]): SBody[] {
  const M = bodies.reduce((t, b) => t + b.mass, 0);
  const vc = [0, 1, 2].map((k) => bodies.reduce((t, b) => t + b.mass * b.v[k], 0) / M);
  const xc = [0, 1, 2].map((k) => bodies.reduce((t, b) => t + b.mass * b.x[k], 0) / M);
  return bodies.map((b) => ({ ...b, x: b.x.map((x, k) => x - xc[k]), v: b.v.map((v, k) => v - vc[k]) }));
}

/** Suggested step: fraction η of the shortest pairwise dynamical time √(r³ / G(m₁+m₂)). */
export function suggestDt(bodies: SBody[], eta = 0.002): number {
  let tmin = Infinity;
  for (let i = 0; i < bodies.length; i++) for (let j = i + 1; j < bodies.length; j++) {
    const r = Math.hypot(bodies[i].x[0] - bodies[j].x[0], bodies[i].x[1] - bodies[j].x[1], bodies[i].x[2] - bodies[j].x[2]);
    tmin = Math.min(tmin, Math.sqrt(r ** 3 / (G_KM * (bodies[i].mass + bodies[j].mass))));
  }
  return Number.isFinite(tmin) ? eta * 2 * Math.PI * tmin : 3600;
}

export const escapeVelocity = (mass: number, rKm: number) => Math.sqrt((2 * G_KM * mass) / rKm); // km/s

/**
 * Lagrange points of a primary–secondary pair (circular restricted three-body approximation),
 * returned in the instantaneous co-rotating geometry (positions in km, same frame as the inputs).
 * L1–L3 solve the collinear equilibrium by Newton iteration; L4/L5 lead/trail by 60°.
 */
export function lagrangePoints(primary: SBody, secondary: SBody): { name: string; x: number[] }[] {
  const M1 = primary.mass, M2 = secondary.mass, mu = M2 / (M1 + M2);
  const d = secondary.x.map((x, k) => x - primary.x[k]);
  const R = Math.hypot(d[0], d[1], d[2]);
  const ex = d.map((c) => c / R);
  const rv = secondary.v.map((v, k) => v - primary.v[k]);
  let h = [ex[1] * rv[2] - ex[2] * rv[1], ex[2] * rv[0] - ex[0] * rv[2], ex[0] * rv[1] - ex[1] * rv[0]];
  const hn = Math.hypot(h[0], h[1], h[2]) || 1;
  h = h.map((c) => c / hn);
  const ey = [h[1] * ex[2] - h[2] * ex[1], h[2] * ex[0] - h[0] * ex[2], h[0] * ex[1] - h[1] * ex[0]];
  const bary = primary.x.map((x, k) => x + mu * d[k]); // barycentre
  // dimensionless collinear equation along x (origin at barycentre, primary at −μ, secondary at 1−μ)
  const f = (x: number) => x - ((1 - mu) * (x + mu)) / Math.abs(x + mu) ** 3 - (mu * (x - 1 + mu)) / Math.abs(x - 1 + mu) ** 3;
  const solve = (x0: number) => { let x = x0; for (let i = 0; i < 100; i++) { const hh = 1e-7; const dx = f(x) / ((f(x + hh) - f(x - hh)) / (2 * hh)); x -= dx; if (Math.abs(dx) < 1e-14) break; } return x; };
  const rH = Math.cbrt(mu / 3);
  const pts: [string, number, number][] = [
    ['L1', solve(1 - mu - rH), 0], ['L2', solve(1 - mu + rH), 0], ['L3', solve(-1 - (5 / 12) * mu), 0],
    ['L4', 0.5 - mu, Math.sqrt(3) / 2], ['L5', 0.5 - mu, -Math.sqrt(3) / 2],
  ];
  return pts.map(([name, u, w]) => ({ name, x: [0, 1, 2].map((k) => bary[k] + R * (u * ex[k] + w * ey[k])) }));
}

export const cloneState = (s: SimState): SimState => ({ t: s.t, dissipated: s.dissipated, events: [...s.events], bodies: s.bodies.map((b) => ({ ...b, x: [...b.x], v: [...b.v] })) });
