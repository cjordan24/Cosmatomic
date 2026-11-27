/**
 * Gate 10.8 — universe map: coordinate transforms checked against catalogue Galactic coordinates (McConnachie 2012),
 * the Galactic Centre direction (Sgr A*), the disc model's parameters and the last-scattering distance.
 */
import { describe, expect, it } from 'vitest';
import { LAST_SCATTERING, MILKY_WAY, PC, catalogueObjects, eclipticToGalactic, fromRaDec, galacticCoords, sampleDisc, solarSystem } from '@/modes/cosmic/universe-map/mapData';
import um from '@datasets/astronomical/universe-map.json';

const lg = (um as unknown as { localGroup: { name: string; ra: number | null; dec: number | null; l: number | null; b: number | null }[] }).localGroup;
const angle = (l1: number, b1: number, l2: number, b2: number) => {
  const r = Math.PI / 180;
  return Math.acos(Math.min(1, Math.sin(b1 * r) * Math.sin(b2 * r) + Math.cos(b1 * r) * Math.cos(b2 * r) * Math.cos((l1 - l2) * r))) / r;
};

describe('Galactic frame', () => {
  it('RA/Dec → Galactic reproduces McConnachie’s listed l, b (rounded to 0.1°) for every Local Group galaxy within 0.1°, except Leo IV, whose listed l, b disagree with its own RA/Dec by 1.05°', () => {
    let n = 0;
    for (const g of lg) {
      if (g.ra === null || g.dec === null || g.l === null || g.b === null) continue;
      const { l, b } = galacticCoords(fromRaDec(g.ra, g.dec, 1));
      if (g.name === 'Leo IV') { expect(angle(l, b, g.l, g.b)).toBeCloseTo(1.05, 1); continue; }
      expect(angle(l, b, g.l, g.b), g.name).toBeLessThan(0.1);
      n++;
    }
    expect(n).toBeGreaterThan(90);
  });
  it('Sgr A* lies within 0.1° of l = 0, b = 0 at 8.28 kpc', () => {
    const gc = catalogueObjects().find((o) => o.kind === 'galactic-centre')!;
    const { l, b } = galacticCoords(gc.pos);
    expect(angle(l, b, 0, 0)).toBeLessThan(0.1);
    expect(gc.distance / PC / 1e3).toBeCloseTo(8.277, 2);
  });
  it('the ecliptic is tilted about 60° to the Galactic plane: Earth stays within 61° of b = 0', () => {
    for (let jd = 2461000; jd < 2461365; jd += 30) {
      const e = solarSystem(jd).find((o) => o.id === 'earth')!;
      expect(Math.abs(galacticCoords(e.pos).b)).toBeLessThan(61);
      expect(e.distance / 1.495978707e11).toBeGreaterThan(0.98);
      expect(e.distance / 1.495978707e11).toBeLessThan(1.02);
    }
    // the ecliptic north pole (ecliptic z axis) maps to b ≈ +29.8°
    expect(galacticCoords(eclipticToGalactic([0, 0, 1])).b).toBeCloseTo(29.81, 1);
  });
});

describe('catalogue objects and models', () => {
  it('175 SPARC galaxies, 101 Local Group galaxies (the Milky Way’s own row has no distance), 5 nebulae, NGC 4258 at 7.58 Mpc', () => {
    const objs = catalogueObjects();
    expect(objs.filter((o) => o.id.startsWith('sparc-'))).toHaveLength(175);
    expect(objs.filter((o) => o.kind === 'local-group')).toHaveLength(101);
    expect(objs.filter((o) => o.kind === 'nebula')).toHaveLength(5);
    expect(objs.find((o) => o.id === 'ladder-ngc4258')!.distance / PC / 1e6).toBeCloseTo(7.576, 3);
  });
  it('the disc sample is centred on the Galactic Centre R₀ away with mean |z| ≈ z_d', () => {
    const s = sampleDisc(20000);
    let mx = 0, mz = 0;
    for (let i = 0; i < 20000; i++) { mx += s[3 * i]; mz += Math.abs(s[3 * i + 2] + MILKY_WAY.z0); }
    expect(mx / 20000 / MILKY_WAY.R0).toBeCloseTo(1, 1);
    expect(mz / 20000 / MILKY_WAY.zd).toBeCloseTo(1, 1);
  });
  it('the last-scattering surface (z∗ = 1089.8) is 13.9 Gpc away today (comoving, Planck 2018)', () => {
    expect(LAST_SCATTERING.radius / PC / 1e9).toBeCloseTo(13.9, 1);
  });
});
