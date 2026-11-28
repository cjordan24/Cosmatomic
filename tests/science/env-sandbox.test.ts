/**
 * Phase 25 — environmental sandbox: the planet builder's dependencies reproduce the printed NSSDCA values for
 * real worlds (validation against reference examples), and its derived quantities move the right way.
 */
import { describe, expect, it } from 'vitest';
import { co2Warming, columnMass, derive, equatorialGravity, effectiveTempInt, escapeVelocity, irradiance, irradianceRange, mixAlbedo, scaleHeightKm, surfaceGravity, coriolisAt } from '@/core/meteorology/sandbox';
import { PRESETS, presetById } from '@/modes/meteorology/sandbox/presets';
import physical from '@datasets/astronomical/planet-physical.json';
import radiation from '@datasets/astronomical/planet-radiation.json';
import worlds from '@datasets/meteorology/planets.json';

/* eslint-disable @typescript-eslint/no-explicit-any */
const PH = physical as any, RAD = (radiation as any).bodies as any[], W = (worlds as any).worlds as any[];
const IDS = ['venus', 'earth', 'mars', 'jupiter', 'pluto'];

describe('gravity from mass and radius (NSSDCA)', () => {
  it.each(IDS)('%s: GM/R² − ω²R (NSSDCA: “at the equator … including the effects of rotation”) within 3 % of the fact sheet', (id) => {
    const p = PH[id]; expect(Math.abs(equatorialGravity(p.massKg, p.diameterKm / 2, p.rotationPeriodH) / p.gravityMs2 - 1)).toBeLessThan(0.03);
  });
  it('finding: for Jupiter, GM/R² alone is 7 % above the printed 23.1 m/s² — rotation matters for a fast-spinning giant', () => {
    const p = PH.jupiter, g0 = surfaceGravity(p.massKg, p.diameterKm / 2);
    expect(g0 / p.gravityMs2).toBeGreaterThan(1.05); expect(g0 - equatorialGravity(p.massKg, p.diameterKm / 2, p.rotationPeriodH)).toBeCloseTo(2.2, 1);
  });
  it.each(IDS)('%s: √(2GM/R) within 3 % of the fact sheet’s escape velocity', (id) => {
    const p = PH[id]; expect(Math.abs(escapeVelocity(p.massKg, p.diameterKm / 2) / 1000 / p.escapeVelocityKms - 1)).toBeLessThan(0.03);
  });
  it('a theoretical override replaces the derived gravity only when switched on', () => {
    const e = presetById('earth').planet;
    expect(derive(e).overridden).toBe(false); expect(derive({ ...e, gOverride: 20 }).g).toBe(20); expect(derive({ ...e, gOverride: 20 }).gDerived).toBeCloseTo(derive(e).g, 6);
  });
});

describe('sunlight by distance (inverse square from 1361 W/m² at 1 au)', () => {
  it.each(IDS)('%s: within 2 % of the fact sheet’s solar irradiance', (id) => {
    const d = PH[id].meanDistanceKm / 149597870.7, r = RAD.find((b) => b.id === id);
    expect(Math.abs(irradiance(d) / r.solarIrradianceWm2 - 1)).toBeLessThan(0.02);
  });
  it('eccentricity: Mars gets ((1 + e)/(1 − e))² ≈ 1.45 times more sunlight at perihelion than aphelion', () => {
    const r = irradianceRange(1.52, PH.mars.eccentricity); expect(r.peri / r.aph).toBeCloseTo(((1 + 0.094) / (1 - 0.094)) ** 2, 6); expect(r.peri / r.aph).toBeCloseTo(1.458, 2);
  });
});

describe('energy balance', () => {
  it('finding: NSSDCA’s Pluto black-body temperature (37.5 K) does not follow from its own irradiance and albedo (32.2 K)', () => {
    const r = RAD.find((b) => b.id === 'pluto'); expect(effectiveTempInt(r.solarIrradianceWm2, r.bondAlbedo)).toBeCloseTo(32.2, 1); expect(r.blackBodyTemperatureK).toBe(37.5);
  });
  it.each(IDS.filter((x) => x !== 'pluto'))('%s: σT⁴ = S(1 − A)/4 reproduces the fact sheet’s black-body temperature within 1 %', (id) => {
    const r = RAD.find((b) => b.id === id); expect(Math.abs(effectiveTempInt(r.solarIrradianceWm2, r.bondAlbedo) / r.blackBodyTemperatureK - 1)).toBeLessThan(0.01);
  });
  it('internal heat raises the emission temperature; Jupiter’s 113 % gives (2.13)^¼ = 1.21 × its sunlight-only value', () => {
    const j = presetById('jupiter').planet, d0 = effectiveTempInt(irradiance(j.distanceAu), j.bondAlbedo), d1 = derive(j).Te;
    expect(d1 / d0).toBeCloseTo(2.13 ** 0.25, 2);
  });
  it('greenhouse warming of the presets: Venus ≫ Earth > Mars ≈ small', () => {
    const gh = (id: string) => derive(presetById(id).planet).greenhouseK!;
    expect(gh('venus')).toBeGreaterThan(400); expect(gh('earth')).toBeGreaterThan(25); expect(gh('earth')).toBeLessThan(40); expect(gh('mars')).toBeLessThan(15);
  });
});

describe('atmosphere', () => {
  it.each(['venus', 'earth', 'mars'])('%s: R*T/(M g) within 6 % of the fact sheet’s scale height', (id) => {
    const w = W.find((x) => x.id === id), g = PH[id].gravityMs2; expect(Math.abs(scaleHeightKm(w.tK, w.mmw, g) / w.H - 1)).toBeLessThan(0.06);
  });
  it('Earth’s column of air is about 10 tonnes per square metre, and its atmosphere about 5 × 10¹⁸ kg (NSSDCA 5.1 × 10¹⁸)', () => {
    const e = presetById('earth').planet, d = derive(e);
    expect(columnMass(1.014, 9.8)).toBeCloseTo(10347, -1); expect(d.atmMass / 5.1e18).toBeGreaterThan(0.95); expect(d.atmMass / 5.1e18).toBeLessThan(1.06);
  });
  it('Coriolis parameter at 45° for Earth is 1.03 × 10⁻⁴ s⁻¹; a 10× slower spin gives 10× less', () => {
    expect(coriolisAt(23.9345, 45)).toBeCloseTo(1.031e-4, 6); expect(coriolisAt(239.345, 45) / coriolisAt(23.9345, 45)).toBeCloseTo(0.1, 6);
  });
});

describe('surface and CO₂', () => {
  it('mixed albedo is the area-weighted mean', () => { expect(mixAlbedo([{ frac: 0.7, albedo: 0.06 }, { frac: 0.3, albedo: 0.6 }])).toBeCloseTo(0.222, 6); });
  it('doubling CO₂ gives exactly the sensitivity range; 280 → 420 ppm gives 0.585 of it', () => {
    const d = co2Warming(560, 280, [2.5, 4.0]); expect(d.lo).toBeCloseTo(2.5, 6); expect(d.hi).toBeCloseTo(4.0, 6); expect(d.forcing).toBeCloseTo(3.708, 3);
    const n = co2Warming(420, 280, [2.5, 4.0]); expect(n.lo / 2.5).toBeCloseTo(Math.log(1.5) / Math.log(2), 6);
  });
  it('every preset has the variables the builder needs, and any placeholder is declared', () => {
    for (const p of PRESETS) {
      for (const k of ['massKg', 'radiusKm', 'distanceAu', 'bondAlbedo', 'pBar', 'mmw'] as const) expect(Number.isFinite(p.planet[k]), `${p.id}.${k}`).toBe(true);
      if (p.id === 'titan') expect(p.missing.length).toBeGreaterThan(0);
    }
  });
});

import { rainShadow, DALR } from '@/core/meteorology/region';
import { ASSUMPTIONS } from '@/modes/meteorology/sandbox/shared';
import { getSource } from '@/shared/sources/sources';
import { dewPoint } from '@/core/meteorology/atmosphere';

describe('rain shadow (regional lab)', () => {
  it('a mountain below cloud base changes nothing: the parcel returns to the coast temperature (dry up, dry down)', () => {
    const r = rainShadow({ T0: 20, Td0: 5, hillKm: 1, malr: 6 });
    expect(r.saturates).toBe(false); expect(r.leeT).toBeCloseTo(20, 9);
  });
  it('above cloud base the lee side is warmer by (9.8 − moist rate) × (crest − cloud base), and drier', () => {
    const T0 = 20, Td0 = dewPoint(20, 0.7), r = rainShadow({ T0, Td0, hillKm: 3, malr: 6 });
    expect(r.saturates).toBe(true);
    expect(r.leeT - T0).toBeCloseTo((DALR - 6) * (3 - r.lclKm), 9);
    expect(r.leeRH).toBeLessThan(0.7);
  });
  it('a moist rate equal to the dry rate gives no lee warming (no latent heat released)', () => {
    const r = rainShadow({ T0: 25, Td0: 20, hillKm: 4, malr: DALR }); expect(r.leeT).toBeCloseTo(25, 9);
  });
});

describe('sandbox citations', () => {
  it('every relation listed in the sandbox cites indexed sources', () => {
    for (const [, ids] of [...ASSUMPTIONS.planet, ...ASSUMPTIONS.region]) for (const id of ids) expect(getSource(id), id).toBeDefined();
  });
});
