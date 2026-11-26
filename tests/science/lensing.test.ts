/**
 * Phase 6, Gate 6.3 — point-mass gravitational lensing. Checks against the worked numbers of
 * Narayan & Bartelmann (1996) and the Stein 2051 B measurement of Sahu et al. (2017).
 */
import { describe, expect, it } from 'vitest';
import { CONSTANTS, PARSEC_M } from '@/core/constants/constants';
import {
  KAPPA_MAS, MAS, centroidShift, deltaMag, einsteinRadius, einsteinRadiusMas, einsteinTime, imageMagnifications, imagePositions,
  lightCurve, majorImageShift, massFromEinstein, sourcePlanePoint, totalMagnification, uOfT,
} from '@/core/physics/lensing';
import { compactById } from '@/modes/cosmic/compact/compact';

const GM = CONSTANTS.GMsun.value;
const kpc = 1e3 * PARSEC_M;

describe('Einstein radius', () => {
  it('N&B eq. 22: a solar-mass lens at an effective distance of 10 kpc gives 0.9 mas; 10¹¹ M☉ at 1 Gpc gives 0.″9', () => {
    // D = D_d D_s / D_ds; with D_s → ∞, D = D_d
    expect(einsteinRadius(GM, 10 * kpc, 1e30)! / MAS).toBeCloseTo(0.902, 2);
    expect(einsteinRadius(1e11 * GM, 1e6 * kpc, 1e40)! / (MAS * 1e3)).toBeCloseTo(0.902, 2);
  });
  it('κ = 4GM☉/(c² au) = 8.144 mas per M☉ per mas of relative parallax; agrees with the distance form', () => {
    expect(KAPPA_MAS).toBeCloseTo(8.144, 3);
    const Dd = 4 * kpc, Ds = 8 * kpc, piRel = 1e3 * (1 / 4000 - 1 / 8000); // mas (parallax = 1000 / d[pc])
    expect(einsteinRadiusMas(0.5, piRel)!).toBeCloseTo(einsteinRadius(0.5 * GM, Dd, Ds)! / MAS, 6);
  });
  it('refuses a source in front of the lens', () => {
    expect(einsteinRadius(GM, 8 * kpc, 4 * kpc)).toBeNull();
    expect(einsteinRadiusMas(1, -3)).toBeNull();
  });
});

describe('images and magnification (point lens)', () => {
  it('both images satisfy the lens equation u = θ − 1/θ (units of θ_E)', () => {
    for (const u of [0.01, 0.3, 1, 2.5, 10]) for (const th of imagePositions(u)) expect(th - 1 / th).toBeCloseTo(u, 10);
  });
  it('N&B eq. 29: at u = 1 the magnifications are 1.17 and 0.17, total 1.34, i.e. 0.32 mag brighter', () => {
    const [p, m] = imageMagnifications(1);
    expect(p).toBeCloseTo(1.17, 2);
    expect(Math.abs(m)).toBeCloseTo(0.17, 2);
    expect(totalMagnification(1)).toBeCloseTo(1.342, 3);
    expect(deltaMag(totalMagnification(1))).toBeCloseTo(-0.32, 2);
  });
  it('µ± from the area ratio (θ/β)(dθ/dβ) agree with eq. 27; µ+ + µ− = 1; inner image has negative parity', () => {
    for (const u of [0.1, 0.5, 1, 3]) {
      const h = 1e-6;
      const [tp, tm] = imagePositions(u), [tp2, tm2] = imagePositions(u + h);
      const [mp, mm] = imageMagnifications(u);
      expect((tp / u) * ((tp2 - tp) / h)).toBeCloseTo(mp, 4);
      expect((tm / u) * ((tm2 - tm) / h)).toBeCloseTo(mm, 4);
      expect(mp + mm).toBeCloseTo(1, 12);
      expect(mm).toBeLessThan(0);
      expect(mp - mm).toBeCloseTo(totalMagnification(u), 12);
    }
  });
  it('centroid shift of the unresolved pair θ_E u/(u² + 2) follows from the image positions and fluxes', () => {
    for (const u of [0.2, 1, 4]) {
      const [tp, tm] = imagePositions(u), [mp, mm] = imageMagnifications(u);
      const centroid = (mp * tp + Math.abs(mm) * tm) / (mp + Math.abs(mm));
      expect(centroid - u).toBeCloseTo(centroidShift(u, 1), 12);
    }
  });
  it('inverse ray shooting: the Einstein ring maps to the lens axis; the images map back to the source', () => {
    for (const a of [0, 1, 2.5]) {
      const [bx, by] = sourcePlanePoint(Math.cos(a), Math.sin(a));
      expect(Math.hypot(bx, by)).toBeLessThan(1e-12);
    }
    const u = 0.7, [tp, tm] = imagePositions(u);
    expect(sourcePlanePoint(tp, 0)[0]).toBeCloseTo(u, 12);
    expect(sourcePlanePoint(tm, 0)[0]).toBeCloseTo(u, 12);
  });
});

describe('microlensing light curve', () => {
  it('symmetric about the peak, maximum µ(u_min), and µ → 1 far away', () => {
    expect(lightCurve(5, 0.3, 5, 20)).toBeCloseTo(totalMagnification(0.3), 12);
    expect(lightCurve(-7, 0.3, 3, 20)).toBeCloseTo(lightCurve(13, 0.3, 3, 20), 12);
    expect(lightCurve(1e4, 0.3, 0, 20)).toBeCloseTo(1, 6);
    expect(uOfT(20, 0, 0, 20)).toBe(1);
  });
  it('N&B eq. 30: t₀ = 0.214 yr for 1 M☉ at 10 kpc moving at 200 km/s', () => {
    const thE = einsteinRadius(GM, 10 * kpc, 1e30)!;
    expect(einsteinTime(thE, 10 * kpc, 2e5) / CONSTANTS.julianYear.value).toBeCloseTo(0.214, 3);
  });
});

describe('Stein 2051 B (Sahu et al. 2017)', () => {
  const s = compactById('stein-2051-b')!;
  const m = (q: string) => s.measurements.find((x) => x.quantity.startsWith(q))!.value!;
  const thetaE = m('Einstein ring radius')[0];
  const piRel = m('parallax of Stein 2051 B')[0] - m('parallax of the background star')[0];
  it('the measured Einstein radius and relative parallax give the published mass 0.675 M☉', () => {
    expect(massFromEinstein(thetaE, piRel)).toBeCloseTo(s.mass[0], 2);
    expect(einsteinRadiusMas(s.mass[0], piRel)!).toBeCloseTo(thetaE, 1);
  });
  it('“at a separation of 0.″5 the background star would be displaced by ~2 mas”', () => {
    expect(majorImageShift(500 / thetaE, thetaE)).toBeCloseTo(2, 0);
  });
  it('the 10 pc catalogue parallax of GJ 169.1 B is consistent with the HST lens parallax', () => {
    expect(Math.abs(181.273 - m('parallax of Stein 2051 B')[0])).toBeLessThan(1.5);
  });
});
