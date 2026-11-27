/**
 * Phase 7, Gate 7.1: expansion and distances. Analytic limits (Hogg 1999 eqs 15–21, 30; Carroll 1997
 * ch. 8), the Planck 2018 parameter transcription, and two checks of the integrals against numbers
 * Planck publishes from its own Boltzmann-code background: the age (13.787 ± 0.020 Gyr) and
 * D_M(z∗) = r∗/θ∗.
 */
import { describe, expect, it } from 'vitest';
import {
  PLANCK18, E, Ok, accelerationOnsetZ, ageGyr, angularDiameterDistanceBetweenMpc, angularDiameterDistanceMpc, comovingDistanceMpc, decelerationParameter,
  densityParameters, distanceModulus, hubbleDistanceMpc, hubbleTimeGyr, kpcPerArcsec, lensDistancesMpc, lookbackTimeGyr, luminosityDistanceMpc,
  matterDarkEnergyEqualityZ, particleHorizonMpc, redshiftAtAge, transverseComovingMpc, type Cosmology,
} from '@/core/physics/cosmology';
import { einsteinRadius, einsteinRadiusD } from '@/core/physics/lensing';
import { CONSTANTS } from '@/core/constants/constants';
import { PLANCK, PRESETS, planckParam } from '@/modes/cosmic/universe/universe';
import { getEntity, relationshipsFrom, relationshipsTo } from '@/shared/scientific-relationships/registry';

const rel = (a: number, b: number) => Math.abs(a / b - 1);
const EdS: Cosmology = { name: 'EdS', H0: 70, Om: 1, Ode: 0 };
const milne: Cosmology = { name: 'Milne', H0: 70, Om: 0, Ode: 0 };
const deSitter: Cosmology = { name: 'de Sitter', H0: 70, Om: 0, Ode: 1 };

describe('Planck 2018 parameters (Table 2, TT,TE,EE+lowE+lensing+BAO)', () => {
  it('transcription matches the PDF values and interval type', () => {
    const v = (k: string) => [planckParam(k).value, planckParam(k).sigma];
    expect(v('H0')).toEqual([67.66, 0.42]);
    expect(v('Om')).toEqual([0.3111, 0.0056]);
    expect(v('OL')).toEqual([0.6889, 0.0056]);
    expect(v('age')).toEqual([13.787, 0.020]);
    expect(v('zstar')).toEqual([1089.80, 0.21]);
    expect(v('rstar')).toEqual([144.57, 0.22]);
    expect(v('theta_star')).toEqual([1.04119, 0.00029]);
    expect(v('zeq')).toEqual([3387, 21]);
    expect(PLANCK.parameters.filter((p) => p.sigma !== null).every((p) => p.interval === '68 %')).toBe(true);
    expect(PLANCK.source).toBe('planck-2018-vi');
  });
  it('the PLANCK18 model uses those values; Ω_Λ = 1 − Ω_m − Ω_r agrees with the tabulated 0.6889 ± 0.0056', () => {
    expect(PLANCK18.H0).toBe(planckParam('H0').value);
    expect(PLANCK18.Om).toBe(planckParam('Om').value);
    expect(PLANCK18.Or).toBeCloseTo(planckParam('Om').value / (1 + planckParam('zeq').value), 12);
    expect(Math.abs(PLANCK18.Ode - planckParam('OL').value)).toBeLessThan(planckParam('OL').sigma!);
    expect(Math.abs(Ok(PLANCK18))).toBeLessThan(1e-12);
  });
  it('Ω_m h² is consistent with the tabulated 0.14240 ± 0.00087', () => {
    expect(Math.abs(PLANCK18.Om * (PLANCK18.H0 / 100) ** 2 - planckParam('omh2').value)).toBeLessThan(planckParam('omh2').sigma!);
  });
  it('Ω_r from z_eq equals photons (T₀ = 2.7255 K, CODATA σ) × (1 + 0.2271 N_eff) to 1 % (independent check of the radiation term)', () => {
    const { c, sigma, G } = { c: CONSTANTS.c.value, sigma: 5.670374419e-8, G: CONSTANTS.G.value };
    const H = (PLANCK18.H0 * 1e3) / 3.0856775814913673e22;
    const rhoCrit = (3 * H * H) / (8 * Math.PI * G);
    const omGamma = (4 * sigma * planckParam('T0').value ** 4) / c ** 3 / rhoCrit;
    const expected = omGamma * (1 + (7 / 8) * (4 / 11) ** (4 / 3) * planckParam('Neff').value);
    expect(rel(PLANCK18.Or!, expected)).toBeLessThan(0.01);
  });
});

describe('analytic limits (Hogg 1999; Carroll 1997 ch. 8)', () => {
  it('Einstein–de Sitter: D_C = 2D_H(1 − 1/√(1+z)) to z = 1000; age 2/(3H₀); t(z) = t₀(1+z)^−1.5', () => {
    for (const z of [0.1, 1, 10, 1000]) expect(rel(comovingDistanceMpc(z, EdS), 2 * hubbleDistanceMpc(EdS) * (1 - 1 / Math.sqrt(1 + z)))).toBeLessThan(1e-7);
    expect(rel(ageGyr(0, EdS), (2 / 3) * hubbleTimeGyr(EdS))).toBeLessThan(1e-6);
    expect(rel(ageGyr(3, EdS), (2 / 3) * hubbleTimeGyr(EdS) * 4 ** -1.5)).toBeLessThan(1e-6);
    expect(rel(lookbackTimeGyr(3, EdS) + ageGyr(3, EdS), ageGyr(0, EdS))).toBeLessThan(1e-7);
  });
  it('Milne (empty, open): D_C = D_H ln(1+z), D_L = D_H z(1 + z/2) through the sinh branch of eq. 16', () => {
    for (const z of [0.5, 2, 8]) {
      expect(rel(comovingDistanceMpc(z, milne), hubbleDistanceMpc(milne) * Math.log1p(z))).toBeLessThan(1e-8);
      expect(rel(luminosityDistanceMpc(z, milne), hubbleDistanceMpc(milne) * z * (1 + z / 2))).toBeLessThan(1e-8);
    }
  });
  it('Ω_Λ = 0 open model matches Hogg’s closed form eq. 17 (Ω_m = 0.05)', () => {
    const c: Cosmology = { name: 'open', H0: 70, Om: 0.05, Ode: 0 };
    for (const z of [0.5, 3, 20]) {
      const exact = (hubbleDistanceMpc(c) * 2 * (2 - c.Om * (1 - z) - (2 - c.Om) * Math.sqrt(1 + c.Om * z))) / (c.Om ** 2 * (1 + z));
      expect(rel(transverseComovingMpc(z, c), exact)).toBeLessThan(1e-7);
    }
  });
  it('de Sitter: D_C = D_H z; q = −1. EdS: q = ½. Radiation only: q = 1', () => {
    expect(rel(comovingDistanceMpc(2, deSitter), 2 * hubbleDistanceMpc(deSitter))).toBeLessThan(1e-9);
    expect(decelerationParameter(1, deSitter)).toBeCloseTo(-1, 12);
    expect(decelerationParameter(5, EdS)).toBeCloseTo(0.5, 12);
    expect(decelerationParameter(0, { name: 'rad', H0: 70, Om: 0, Ode: 0, Or: 1 })).toBeCloseTo(1, 12);
  });
  it('distance duality D_L = (1+z)² D_A (eq. 21) and μ = 5 log₁₀(D_L/10 pc) (eq. 25)', () => {
    for (const z of [0.01, 1, 5]) {
      expect(rel(luminosityDistanceMpc(z, PLANCK18), (1 + z) ** 2 * angularDiameterDistanceMpc(z, PLANCK18))).toBeLessThan(1e-12);
      expect(distanceModulus(z, PLANCK18)).toBeCloseTo(5 * Math.log10(luminosityDistanceMpc(z, PLANCK18) * 1e6 / 10), 10);
    }
  });
  it('low-z Hubble law D ≈ cz/H₀ (z = 0.001, tol 0.1 %); density parameters sum to 1 at every z', () => {
    expect(rel(comovingDistanceMpc(0.001, PLANCK18), (299792.458 * 0.001) / PLANCK18.H0)).toBeLessThan(1e-3);
    for (const z of [0, 1, 1000]) { const d = densityParameters(z, PLANCK18); expect(d.m + d.r + d.de + d.k).toBeCloseTo(1, 12); }
    expect(E(0, PLANCK18)).toBeCloseTo(1, 12);
  });
});

describe('Planck 2018 cross-checks (background integrals against Planck’s own derived values)', () => {
  it('age today 13.786 Gyr vs Planck 13.787 ± 0.020 Gyr (within 1σ)', () => {
    expect(Math.abs(ageGyr(0, PLANCK18) - planckParam('age').value)).toBeLessThan(planckParam('age').sigma!);
  });
  it('D_M(z∗) = r∗/θ∗ = 13 885 Mpc: our integral to z = 1089.8 agrees within 0.1 % (θ∗ alone is known to 0.03 %, r∗ to 0.15 %)', () => {
    const target = planckParam('rstar').value / (planckParam('theta_star').value / 100);
    expect(rel(transverseComovingMpc(planckParam('zstar').value, PLANCK18), target)).toBeLessThan(1e-3);
  });
  it('without radiation the age shifts by ≈ +5.6 Myr and D_M(z∗) by ≈ +0.5 %, ten times the Planck mismatch: the Ω_r term is needed at high z only', () => {
    const noRad: Cosmology = { ...PLANCK18, Or: 0, Ode: 1 - PLANCK18.Om };
    const target = planckParam('rstar').value / (planckParam('theta_star').value / 100), zs = planckParam('zstar').value;
    expect(ageGyr(0, noRad) - ageGyr(0, PLANCK18)).toBeGreaterThan(0.004);
    expect(ageGyr(0, noRad) - ageGyr(0, PLANCK18)).toBeLessThan(0.008);
    expect(rel(comovingDistanceMpc(2, noRad), comovingDistanceMpc(2, PLANCK18))).toBeLessThan(5e-4);
    expect(rel(transverseComovingMpc(zs, noRad), target)).toBeGreaterThan(0.003);
    expect(rel(transverseComovingMpc(zs, noRad), target)).toBeGreaterThan(5 * rel(transverseComovingMpc(zs, PLANCK18), target));
  });
  it('derived landmarks: acceleration began at z ≈ 0.64, Ω_m = Ω_Λ at z ≈ 0.30, observable radius ≈ 14.2 Gpc (46 Gly)', () => {
    const za = accelerationOnsetZ(PLANCK18)!;
    expect(za).toBeGreaterThan(0.6); expect(za).toBeLessThan(0.66);
    expect(rel(za, Math.cbrt((2 * PLANCK18.Ode) / PLANCK18.Om) - 1)).toBeLessThan(1e-3); // radiation negligible at z < 1
    expect(matterDarkEnergyEqualityZ(PLANCK18)!).toBeCloseTo(0.303, 2);
    expect(particleHorizonMpc(PLANCK18)).toBeGreaterThan(14100); expect(particleHorizonMpc(PLANCK18)).toBeLessThan(14250);
  });
  it('redshiftAtAge inverts ageGyr; 1 arcsec ≈ 8.6 kpc at z = 1.6 (near the D_A maximum)', () => {
    const z = redshiftAtAge(1, PLANCK18)!;
    expect(ageGyr(z, PLANCK18)).toBeCloseTo(1, 6);
    expect(redshiftAtAge(20, PLANCK18)).toBeNull();
    expect(kpcPerArcsec(1.6, PLANCK18)).toBeGreaterThan(8.4); expect(kpcPerArcsec(1.6, PLANCK18)).toBeLessThan(8.8);
  });
});

describe('lensing distances (Hogg eq. 19) and cosmological Einstein radii', () => {
  it('flat: D_A12 = (D_M2 − D_M1)/(1+z₂); z₁ → 0 gives D_A(z₂); open: eq. 19 with z₁ = 0 also gives D_A(z₂)', () => {
    const dm = (z: number) => transverseComovingMpc(z, PLANCK18);
    expect(rel(angularDiameterDistanceBetweenMpc(0.5, 2, PLANCK18)!, (dm(2) - dm(0.5)) / 3)).toBeLessThan(1e-10);
    expect(rel(angularDiameterDistanceBetweenMpc(0, 2, PLANCK18)!, angularDiameterDistanceMpc(2, PLANCK18))).toBeLessThan(1e-10);
    expect(rel(angularDiameterDistanceBetweenMpc(0, 2, milne)!, angularDiameterDistanceMpc(2, milne))).toBeLessThan(1e-10);
  });
  it('D_A12 is not D_A2 − D_A1, and closed models are refused (eq. 19 is invalid for Ω_k < 0)', () => {
    const d = lensDistancesMpc(0.5, 2, PLANCK18)!;
    expect(d.Dds).toBeGreaterThan(d.Ds - d.Dd + 500);
    expect(angularDiameterDistanceBetweenMpc(0.5, 2, { name: 'closed', H0: 70, Om: 1.5, Ode: 0 })).toBeNull();
  });
  it('einsteinRadiusD reduces to the Euclidean form when D_ds = D_s − D_d; at low z both agree to < 0.1 %', () => {
    const gm = 1e11 * CONSTANTS.GMsun.value, Mpc = 3.0856775814913673e22;
    expect(einsteinRadiusD(gm, 1000 * Mpc, 2000 * Mpc, 1000 * Mpc)).toBeCloseTo(einsteinRadius(gm, 1000 * Mpc, 2000 * Mpc)!, 18);
    const d = lensDistancesMpc(0.001, 0.002, PLANCK18)!;
    expect(rel(einsteinRadiusD(gm, d.Dd * Mpc, d.Ds * Mpc, d.Dds * Mpc)!, einsteinRadius(gm, d.Dd * Mpc, d.Ds * Mpc)!)).toBeLessThan(1e-3);
  });
  it('10¹¹ M☉ at z_l = 0.5, z_s = 2 (Planck 2018): θ_E ≈ 0.63″; subtracting angular-diameter distances would underestimate it', () => {
    const d = lensDistancesMpc(0.5, 2, PLANCK18)!, Mpc = 3.0856775814913673e22, gm = 1e11 * CONSTANTS.GMsun.value;
    const th = einsteinRadiusD(gm, d.Dd * Mpc, d.Ds * Mpc, d.Dds * Mpc)!;
    expect(th / (Math.PI / 180 / 3600)).toBeGreaterThan(0.6); expect(th / (Math.PI / 180 / 3600)).toBeLessThan(0.66);
    const naive = einsteinRadius(gm, d.Dd * Mpc, d.Ds * Mpc)!;
    expect(th / naive).toBeCloseTo(Math.sqrt(d.Dds / (d.Ds - d.Dd)), 10);
    expect(th / naive).toBeGreaterThan(1.3);
  });
});

describe('presets and registry', () => {
  it('only the Planck preset is labelled derived; the others are hypothetical comparison models', () => {
    expect(PRESETS.filter((p) => p.provenance === 'derived').map((p) => p.id)).toEqual(['planck18']);
  });
  it('context:cosmic-expansion routes to the view and explains cosmological lensing (both directions)', () => {
    expect(getEntity('context:cosmic-expansion')?.route).toBe('#/cosmic/universe');
    expect(relationshipsFrom('context:cosmic-expansion').some((r) => r.to === 'context:gravitational-lensing' && r.source === 'hogg-1999')).toBe(true);
    expect(relationshipsTo('context:gravitational-lensing').some((r) => r.from === 'context:cosmic-expansion')).toBe(true);
  });
});
