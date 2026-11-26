/**
 * Gravitational module — Newtonian N-body foundation (Phase 1 provides the solver
 * and conservation diagnostics; the interactive sandbox arrives in Phase 3).
 *
 * Integrator: kick-drift-kick leapfrog (velocity Verlet). Symplectic and
 * time-reversible, so energy error stays bounded for fixed dt in isolated systems.
 * Validity: v << c and separations >> Schwarzschild radii; no collisions; point masses.
 */
import { CONSTANTS } from '../constants/constants';
import { type Vec3, add, cross, norm, scale, sub } from '../mathematics/vec3';

export interface Body { id: string; mass: number; r: Vec3; v: Vec3 }
export interface NBodyState { bodies: Body[]; t: number }

export const NBODY_SOLVER = { module: 'gravitational', solver: 'leapfrog-kdk', version: '1.0.0' } as const;

function accelerations(bodies: Body[], G: number, softening: number): Vec3[] {
  const acc: Vec3[] = bodies.map(() => [0, 0, 0]);
  const eps2 = softening * softening;
  for (let i = 0; i < bodies.length; i++) {
    for (let j = i + 1; j < bodies.length; j++) {
      const d = sub(bodies[j].r, bodies[i].r);
      const r2 = d[0] * d[0] + d[1] * d[1] + d[2] * d[2] + eps2;
      const inv = 1 / (r2 * Math.sqrt(r2));
      acc[i] = add(acc[i], scale(d, G * bodies[j].mass * inv));
      acc[j] = add(acc[j], scale(d, -G * bodies[i].mass * inv));
    }
  }
  return acc;
}

/** One leapfrog step of size dt (seconds). Returns a new state (pure). */
export function leapfrogStep(state: NBodyState, dt: number, G = CONSTANTS.G.value, softening = 0): NBodyState {
  const a0 = accelerations(state.bodies, G, softening);
  const half = state.bodies.map((b, i) => ({ ...b, v: add(b.v, scale(a0[i], dt / 2)) }));
  const drifted = half.map((b) => ({ ...b, r: add(b.r, scale(b.v, dt)) }));
  const a1 = accelerations(drifted, G, softening);
  return { bodies: drifted.map((b, i) => ({ ...b, v: add(b.v, scale(a1[i], dt / 2)) })), t: state.t + dt };
}

export interface Diagnostics { kinetic: number; potential: number; total: number; momentum: Vec3; angularMomentum: Vec3 }

export function diagnostics(state: NBodyState, G = CONSTANTS.G.value): Diagnostics {
  let kinetic = 0, potential = 0;
  let momentum: Vec3 = [0, 0, 0], L: Vec3 = [0, 0, 0];
  const bs = state.bodies;
  for (let i = 0; i < bs.length; i++) {
    const b = bs[i];
    kinetic += 0.5 * b.mass * (b.v[0] ** 2 + b.v[1] ** 2 + b.v[2] ** 2);
    momentum = add(momentum, scale(b.v, b.mass));
    L = add(L, scale(cross(b.r, b.v), b.mass));
    for (let j = i + 1; j < bs.length; j++) potential -= (G * b.mass * bs[j].mass) / norm(sub(bs[j].r, b.r));
  }
  return { kinetic, potential, total: kinetic + potential, momentum, angularMomentum: L };
}

/** Escape velocity from distance r (m) of mass parameter GM. */
export const escapeVelocity = (GM: number, r: number) => Math.sqrt((2 * GM) / r);
/** Surface gravitational acceleration. */
export const surfaceGravity = (GM: number, r: number) => GM / (r * r);
