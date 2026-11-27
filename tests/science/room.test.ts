/**
 * Phase 9, Gate 9.3 — radio waves in a room. ITU-R P.2040-4 materials and reflection coefficients; image-method rays;
 * dipole transmit/receive (Ellingson 2020). Checks: textbook limits, energy conservation, Friis, image theory.
 */
import { describe, expect, it } from 'vitest';
import {
  FACES, HWD_GAIN, HWD_RRAD, hwdFilamentCheck, MATERIALS_P2040, cabs, csqrt, delaySpread, interfaceR, materialAt, permittivity, receivedPower, roomContext, slabRT, traceRays,
  type Face, type Room, type Surface,
} from '@/core/physics/em/room';
import { friis } from '@/core/physics/em/antennas';
import { CONSTANTS } from '@/core/constants/constants';

const air: Surface = { material: 'Vacuum (≈ air)', thickness: 0 };
const roomOf = (surfaces: Partial<Record<Face, Surface>>, L = 6, W = 5, H = 3): Room => ({ L, W, H, surfaces: Object.fromEntries(FACES.map((f) => [f, surfaces[f] ?? air])) as Record<Face, Surface> });
const C = CONSTANTS.c.value;

describe('ITU-R P.2040-4 materials (Table 3, eqs. 57–59)', () => {
  it('38 rows; concrete at 1 GHz: ε′ = 5.24, σ = 0.0462 S/m, ε″ = 17.98σ/f', () => {
    expect(MATERIALS_P2040).toHaveLength(38);
    const c = materialAt('Concrete', 1)!;
    expect(c.inRange).toBe(true);
    const p = permittivity(c.m, 1);
    expect(p.epsReal).toBe(5.24); expect(p.sigma).toBeCloseTo(0.0462, 6); expect(p.epsImag).toBeCloseTo(17.98 * 0.0462, 6);
  });
  it('selects the row whose range contains f, and flags frequencies outside every range', () => {
    expect(materialAt('Concrete', 200)!.m.fLoGHz).toBe(110);
    expect(materialAt('Brick', 60)!.inRange).toBe(false);
  });
  it('ε″ = 17.98σ/f is σ/(ωε₀) with f in GHz (eq. 11)', () => {
    const f = 2.4, s = 0.1;
    expect((17.98 * s) / f).toBeCloseTo(s / (2 * Math.PI * f * 1e9 * CONSTANTS.eps0.value), 2);
  });
});

describe('reflection and transmission (eqs. 37, 43, 44)', () => {
  it('complex square root: principal branch', () => {
    const r = csqrt([-4, 0]); expect(r[0]).toBeCloseTo(0, 12); expect(r[1]).toBeCloseTo(2, 12);
    const z = csqrt([3, -4]); expect(z[0]).toBeCloseTo(2, 12); expect(z[1]).toBeCloseTo(-1, 12);
  });
  it('normal incidence: R_TE = (1 − √ε)/(1 + √ε) (Ellingson Γ for air → glass εr = 2.1 is −0.183) and R_TM = −R_TE', () => {
    const te = interfaceR([2.1, 0], 0, 'TE'), tm = interfaceR([2.1, 0], 0, 'TM');
    expect(te[0]).toBeCloseTo((1 - Math.sqrt(2.1)) / (1 + Math.sqrt(2.1)), 12);
    expect(te[0]).toBeCloseTo(-0.183, 3);
    expect(tm[0]).toBeCloseTo(-te[0], 12);
  });
  it('TM reflection vanishes at the Brewster angle tan θ = √ε (lossless)', () => {
    expect(cabs(interfaceR([4, 0], Math.atan(2), 'TM'))).toBeLessThan(1e-12);
    expect(cabs(interfaceR([4, 0], Math.atan(2), 'TE'))).toBeGreaterThan(0.3);
  });
  it('metal (σ = 10⁷ S/m) reflects almost everything', () => {
    const m = permittivity(materialAt('Metal', 2.4)!.m, 2.4);
    for (const th of [0, 0.7, 1.4]) { expect(cabs(interfaceR(m.epsRc, th, 'TE'))).toBeGreaterThan(0.999); expect(cabs(interfaceR(m.epsRc, th, 'TM'))).toBeGreaterThan(0.99); }
  });
  it('lossless slab conserves energy |R|² + |T|² = 1; a half-wave-thick slab is transparent at normal incidence', () => {
    for (const th of [0, 0.5, 1.2]) for (const pol of ['TE', 'TM'] as const) {
      const { R, T } = slabRT([4, 0], 0.037, 0.125, th, pol);
      expect(cabs(R) ** 2 + cabs(T) ** 2).toBeCloseTo(1, 10);
    }
    const lam = 0.1, d = lam / (2 * Math.sqrt(4));
    expect(cabs(slabRT([4, 0], d, lam, 0, 'TE').R)).toBeLessThan(1e-12);
  });
  it('a lossy concrete slab absorbs: |R|² + |T|² < 1', () => {
    const p = permittivity(materialAt('Concrete', 2.4)!.m, 2.4);
    const { R, T } = slabRT(p.epsRc, 0.2, C / 2.4e9, 0.3, 'TE');
    expect(cabs(R) ** 2 + cabs(T) ** 2).toBeLessThan(0.9);
  });
});

describe('rays in a room (image method)', () => {
  const f = 2.4e9, PT = 0.1;
  const tx: [number, number, number] = [1.5, 2, 1.5], rx: [number, number, number] = [4.2, 3.1, 1.2];
  it('with transparent walls only the direct ray carries power, and it equals Friis with two half-wave dipoles', () => {
    const ctx = roomContext(roomOf({}), f, PT);
    const rays = traceRays(ctx, tx, rx, 2);
    const direct = rays.find((r) => r.order === 0)!;
    const R = Math.hypot(rx[0] - tx[0], rx[1] - tx[1], rx[2] - tx[2]);
    const th = Math.acos((rx[2] - tx[2]) / R);
    const F2 = (Math.cos((Math.PI / 2) * Math.cos(th)) / Math.sin(th)) ** 2;
    const G = HWD_GAIN * F2;   // gain in this direction
    expect(direct.powerW / friis(PT, G, G, R, C / f)).toBeCloseTo(1, 3);
    expect(receivedPower(ctx, rays).coherent / direct.powerW).toBeCloseTo(1, 9);
    expect(HWD_RRAD).toBeCloseTo(73.08, 1);
  });
  it('first-order rays: one per surface, specular (equal angles), length = image distance', () => {
    const ctx = roomOf({}); const c = roomContext(ctx, f, PT);
    const first = traceRays(c, tx, rx, 1).filter((r) => r.order === 1);
    expect(first.map((r) => r.bounces[0].face).sort()).toEqual([...FACES].sort());
    for (const r of first) {
      const [a, p, b] = r.points;
      const L = Math.hypot(p[0] - a[0], p[1] - a[1], p[2] - a[2]) + Math.hypot(b[0] - p[0], b[1] - p[1], b[2] - p[2]);
      expect(L).toBeCloseTo(r.length, 9);
      const axis = 'xyz'.indexOf(r.bounces[0].face[0]);
      const in1 = Math.abs(p[axis] - a[axis]) / Math.hypot(p[0] - a[0], p[1] - a[1], p[2] - a[2]);
      const out1 = Math.abs(b[axis] - p[axis]) / Math.hypot(b[0] - p[0], b[1] - p[1], b[2] - p[2]);
      expect(in1).toBeCloseTo(out1, 9);
    }
  });
  it('the receiving dipole’s closed-form current integral (eq. 9.101) equals the numerical one of Gate 9.1', () => {
    for (const th of [0.3, 1.0, Math.PI / 2, 2.4]) { const [a, b] = hwdFilamentCheck(th); expect(a / b).toBeCloseTo(1, 6); }
  });
  it('ray counts: 1, 7, 25, 63 paths for up to 0–3 reflections', () => {
    const c = roomContext(roomOf({}), f, PT);
    expect([0, 1, 2, 3].map((n) => traceRays(c, tx, rx, n).length)).toEqual([1, 7, 25, 63]);
  });
  it('over a metal floor the two rays match image theory (a co-directed image dipole below the floor)', () => {
    const c = roomContext(roomOf({ z0: { material: 'Metal', thickness: 0 } }), f, PT);
    const all = traceRays(c, tx, rx, 1); const rays = all.filter((r) => r.powerW > 1e-12 * all[0].powerW);
    expect(rays).toHaveLength(2);
    // image theory: field of the real dipole + field of an identical vertical dipole at (x, y, −z), received by the same dipole
    const recv = (src: [number, number, number]) => {
      const d = [rx[0] - src[0], rx[1] - src[1], rx[2] - src[2]], R = Math.hypot(d[0], d[1], d[2]), cos = d[2] / R, s = Math.sqrt(1 - cos * cos);
      const F = Math.cos((Math.PI / 2) * cos) / s, lam = C / f, beta = (2 * Math.PI) / lam;
      const mag = ((376.730313 * c.I0) / (2 * Math.PI)) * F / R * (lam / Math.PI) * F;   // |E| · l_e, both along θ̂
      return [mag * Math.cos(-beta * R), mag * Math.sin(-beta * R)];
    };
    const a = recv(tx), b = recv([tx[0], tx[1], -tx[2]]);
    const expected = ((a[0] + b[0]) ** 2 + (a[1] + b[1]) ** 2) / (8 * HWD_RRAD);
    expect(receivedPower(c, rays).coherent / expected).toBeCloseTo(1, 2);
  });
  it('delay spread is zero for one ray and positive with reflections', () => {
    const c = roomContext(roomOf({ x0: { material: 'Concrete', thickness: 0.2 }, x1: { material: 'Glass', thickness: 0.006 } }), f, PT);
    const rays = traceRays(c, tx, rx, 2);
    expect(delaySpread(rays.filter((r) => r.order === 0)).rms).toBeCloseTo(0, 15);
    expect(delaySpread(rays).rms).toBeGreaterThan(0);
  });
});
