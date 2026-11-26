/**
 * Phase 5 — nearby stars (Gate 5.1). Tolerances are explicit; reference values are from the cited
 * papers (Liu et al. 2011 for the galactic pole, the catalogues themselves for star data).
 */
import { describe, expect, it } from 'vitest';
import ten from '@datasets/astronomical/nearby-stars-10pc.json';
import cnsRaw from '@datasets/astronomical/cns5-20pc.json';
import {
  DWARF_SEQUENCE, KAPPA_KMS, N_HIP, PC_IN_LY, absoluteMag, calibrateDwarf, crossMatch, distancePc, distanceRangePc, galacticLB,
  icrsCartesian, icrsToGalactic, parseSpectralType, tangentialVelocity, totalPm, type CnsStar, type NearbyObject,
} from '@/modes/cosmic/star-systems/stars';

const OBJ = (ten as unknown as { objects: NearbyObject[] }).objects;
const CNS = (cnsRaw as unknown as { fields: string[]; rows: unknown[][] });
const CNS_ROWS = CNS.rows.map((r) => Object.fromEntries(CNS.fields.map((f, i) => [f, r[i]])) as unknown as CnsStar);
const byName = (n: string) => OBJ.find((o) => o.name === n)!;
const deg = (h: number, m: number, s: number) => (h + m / 60 + s / 3600) * 15;
const dms = (d: number, m: number, s: number) => d + m / 60 + s / 3600;

describe('astrometric relations', () => {
  it('κ = 1 au per Julian year = 4.74047 km/s', () => {
    expect(KAPPA_KMS).toBeCloseTo(4.740470464, 8);
  });
  it('parsec ↔ light-year conversion (IAU definitions)', () => {
    expect(PC_IN_LY).toBeCloseTo(3.261563777, 8);
  });
  it('distance, 1σ interval and absolute magnitude', () => {
    expect(distancePc(100)).toBe(10);
    expect(distancePc(0)).toBeNull();
    expect(distancePc(null)).toBeNull();
    const r = distanceRangePc(100, 10)!;
    expect(r[0]).toBeCloseTo(1000 / 110, 12);
    expect(r[1]).toBeCloseTo(1000 / 90, 12);
    expect(distanceRangePc(10, 12)).toBeNull(); // σ > ϖ: no finite upper bound
    expect(absoluteMag(5, 100)).toBeCloseTo(5, 12); // at 10 pc M = m
    expect(absoluteMag(5, 1000)).toBeCloseTo(10, 12); // at 1 pc M = m + 5
    expect(absoluteMag(null, 100)).toBeNull();
  });
  it('tangential velocity: 1 arcsec/yr at 1 pc is κ km/s', () => {
    expect(tangentialVelocity(1000, 1000)).toBeCloseTo(KAPPA_KMS, 12);
    expect(tangentialVelocity(totalPm(3, 4), 1)).toBeCloseTo(5 * KAPPA_KMS, 12);
    expect(tangentialVelocity(null, 10)).toBeNull();
  });
});

describe('galactic coordinates (Hipparcos matrix)', () => {
  it('N_Hip is a proper rotation to 1e-9', () => {
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
      const dot = N_HIP[i][0] * N_HIP[j][0] + N_HIP[i][1] * N_HIP[j][1] + N_HIP[i][2] * N_HIP[j][2];
      expect(dot).toBeCloseTo(i === j ? 1 : 0, 9);
    }
    const [a, b, c] = N_HIP;
    const det = a[0] * (b[1] * c[2] - b[2] * c[1]) - a[1] * (b[0] * c[2] - b[2] * c[0]) + a[2] * (b[0] * c[1] - b[1] * c[0]);
    expect(det).toBeCloseTo(1, 9);
  });
  it('the north Galactic pole (α 12h51m26.2755s, δ +27°07′41.704″; Liu et al. 2011) maps to b = +90°', () => {
    const v = icrsCartesian(deg(12, 51, 26.27549), dms(27, 7, 41.7043), 1);
    expect(galacticLB(v).b).toBeCloseTo(90, 4);
  });
  it('the Galactic centre direction (17h45m37.199s, −28°56′10.2″) maps to l ≈ 0°, b ≈ 0°', () => {
    const v = icrsCartesian(deg(17, 45, 37.1991), -dms(28, 56, 10.22), 1);
    const { l, b } = galacticLB(v);
    expect(Math.min(l, 360 - l)).toBeLessThan(2e-3);
    expect(Math.abs(b)).toBeLessThan(2e-3);
  });
  it('rotation preserves distance', () => {
    const v = icrsCartesian(123.4, -56.7, 8.9);
    expect(Math.hypot(...icrsToGalactic(v))).toBeCloseTo(8.9, 8); // matrix is orthonormal to ~1e-10
  });
});

describe('10 pc catalogue (Reylé et al. 2021, 2023 update)', () => {
  it('has every object category and the published count of systems is plausible', () => {
    const types = new Set(OBJ.map((o) => o.type));
    for (const t of ['star', 'low-mass star', 'white dwarf', 'brown dwarf', 'exoplanet']) expect(types.has(t as never), t).toBe(true);
    expect(types.has('unknown')).toBe(false);
    const systems = new Set(OBJ.map((o) => o.sys)).size;
    expect(systems).toBeGreaterThan(330); // 336 systems in the Feb 2023 update; later additions only add
  });
  it('every non-candidate object lies within 10 pc; candidates (seq ≥ 1001) are within 1σ of it', () => {
    for (const o of OBJ) {
      expect(o.plx, o.name).not.toBeNull();
      if (o.seq < 1001) expect(o.plx!, o.name).toBeGreaterThanOrEqual(100);
      else expect(o.plx! + (o.ePlx ?? 0), o.name).toBeGreaterThanOrEqual(100);
    }
  });
  it('Proxima Centauri is the nearest star: 1.302 pc, M_G ≈ 13.41, v_t ≈ 23.8 km/s', () => {
    const p = byName('Proxima Cen');
    const nearest = OBJ.filter((o) => o.type !== 'exoplanet').sort((a, b) => b.plx! - a.plx!)[0];
    expect(nearest.name).toBe('Proxima Cen');
    expect(distancePc(p.plx)).toBeCloseTo(1.30197, 4);
    expect(absoluteMag(p.G, p.plx)).toBeCloseTo(13.41, 2);
    expect(tangentialVelocity(totalPm(p.pmra, p.pmdec), p.plx)).toBeCloseTo(23.8, 1);
  });
  it('estimated G (gCode 10/20) is never stored as a measured G', () => {
    for (const o of OBJ) if (o.gCode === 10 || o.gCode === 20) expect(o.G, o.name).toBeNull();
  });
  it('per-value references are present for every Gaia-era parallax', () => {
    const withPlx = OBJ.filter((o) => o.type !== 'exoplanet');
    expect(withPlx.every((o) => !!o.rPlx)).toBe(true);
  });
  it('fractional parallax error is ≤ 0.011 for Gaia parallaxes (documented validity)', () => {
    const gaia = OBJ.filter((o) => o.type !== 'exoplanet' && o.ePlx !== null && /yCat\.1350/.test(o.rPlx ?? ''));
    expect(gaia.length).toBeGreaterThan(250);
    for (const o of gaia) expect(o.ePlx! / o.plx!, o.name).toBeLessThanOrEqual(0.011);
  });
});

describe('CNS5 within 20 pc (Golovin et al. 2023)', () => {
  it('selection is parallax ≥ 50 mas and includes the 10 pc stars', () => {
    expect(CNS_ROWS.length).toBeGreaterThan(2500);
    for (const c of CNS_ROWS) expect(c.plx).toBeGreaterThanOrEqual(50);
    const m = crossMatch(OBJ, CNS_ROWS);
    expect(m.size).toBeGreaterThan(300);
    expect(m.get(byName('Proxima Cen').seq)).toBeDefined(); // Gaia id match
    const sirius = m.get(byName('alf CMa A').seq);             // Hipparcos match: too bright for Gaia
    expect(sirius?.fGRP).toBe(2);
    expect(m.get(byName('alf Cen A').seq)).toBeUndefined();   // CNS5 lists α Cen AB combined: a component must not inherit it
  });
  it('cross-matched parallaxes agree to 3σ (or 1 mas)', () => {
    const m = crossMatch(OBJ, CNS_ROWS);
    let n = 0;
    for (const [seq, c] of m) {
      const o = OBJ.find((x) => x.seq === seq)!;
      const sig = Math.hypot(o.ePlx ?? 0, c.ePlx ?? 0);
      if (Math.abs(o.plx! - c.plx) > Math.max(3 * sig, 1)) n++;
    }
    expect(n / m.size).toBeLessThan(0.05); // a few re-measured binaries differ; most agree
  });
  it('colour flags are 0, 1, 2 or null', () => {
    for (const c of CNS_ROWS) expect([0, 1, 2, null]).toContain(c.fGRP);
  });
});

describe('spectral types and the dwarf calibration (Pecaut & Mamajek)', () => {
  it('parses MK, white-dwarf, subdwarf and bound types', () => {
    expect(parseSpectralType('M5.5')).toMatchObject({ kind: 'mk', cls: 'M', sub: 5.5 });
    expect(parseSpectralType('K7.5e')).toMatchObject({ kind: 'mk', cls: 'K', sub: 7.5, emission: true });
    expect(parseSpectralType('DA2.0')).toMatchObject({ kind: 'white-dwarf', cls: 'DA', sub: 2 });
    expect(parseSpectralType('sdM1')).toMatchObject({ kind: 'mk', subdwarf: true });
    expect(parseSpectralType('>Y4')).toMatchObject({ limit: true, cls: 'Y' });
    expect(parseSpectralType('T6pec')).toMatchObject({ peculiar: true });
    expect(parseSpectralType(null)).toBeNull();
  });
  it('sequence is ordered and covers O3–Y4', () => {
    expect(DWARF_SEQUENCE[0].spt).toBe('O3V');
    expect(DWARF_SEQUENCE[DWARF_SEQUENCE.length - 1].spt).toBe('Y4V');
    for (let i = 1; i < DWARF_SEQUENCE.length; i++) expect(DWARF_SEQUENCE[i].index).toBeGreaterThan(DWARF_SEQUENCE[i - 1].index);
  });
  it('table rows are returned exactly: G2V T_eff 5770 K, M5.5V 2930 K', () => {
    expect(calibrateDwarf(parseSpectralType('G2'))!.values.Teff).toBe(5770);
    expect(calibrateDwarf(parseSpectralType('G2'))!.exact).toBe(true);
    expect(calibrateDwarf(parseSpectralType('M5.5'))!.values.Teff).toBe(2930);
  });
  it('interpolates between neighbouring rows and stays between them', () => {
    const k = calibrateDwarf(parseSpectralType('K2.5'))!;
    const k2 = DWARF_SEQUENCE.find((r) => r.spt === 'K2V')!, k3 = DWARF_SEQUENCE.find((r) => r.spt === 'K3V')!;
    expect(k.exact).toBe(false);
    expect(k.between).toEqual(['K2V', 'K3V']);
    expect(k.values.Teff!).toBeCloseTo((k2.Teff! + k3.Teff!) / 2, 9);
  });
  it('refuses what it cannot calibrate (white dwarfs, subdwarfs, bounds, no subtype)', () => {
    for (const s of ['DA2.0', 'DC', 'sdM1', '>Y4', 'M']) expect(calibrateDwarf(parseSpectralType(s)), s).toBeNull();
  });
  it('the Sun-like G2 dwarf is close to the IAU nominal Sun (5772 K, log L = 0)', () => {
    const g2 = calibrateDwarf(parseSpectralType('G2'))!.values;
    expect(Math.abs(g2.Teff! - 5772)).toBeLessThan(10);
    expect(Math.abs(g2.logL!)).toBeLessThan(0.05);
  });
  it('calibrated M_G agrees with observed M_G for most single Gaia dwarfs within 1.5 mag', () => {
    const sample = OBJ.filter((o) => o.G !== null && (o.type === 'low-mass star' || o.type === 'star') && !o.comment?.match(/binary|unresolved/i));
    let ok = 0, n = 0;
    for (const o of sample) {
      const cal = calibrateDwarf(parseSpectralType(o.spt));
      if (!cal?.values.MG) continue;
      n++;
      if (Math.abs(cal.values.MG - absoluteMag(o.G, o.plx)!) < 1.5) ok++;
    }
    expect(n).toBeGreaterThan(150);
    expect(ok / n).toBeGreaterThan(0.85);
  });
});

// ---------------------------------------------------------------- Gate 5.2: HR diagrams
import { MK_CLASSES, TEFF_SUN_NOMINAL, TEFF_SUN_STEFAN, cmdPoint, convertedGCheck, hrPoint, logLForRadius, luminosityFromAbsMag, radiusFromLT, type HrStar } from '@/modes/cosmic/star-systems/hr';

describe('HR diagram relations', () => {
  it('IAU nominal L☉, R☉ and CODATA σ give T_eff☉ = 5772 K (B3 nominal) to < 1 K', () => {
    expect(Math.abs(TEFF_SUN_STEFAN - TEFF_SUN_NOMINAL)).toBeLessThan(1);
  });
  it('constant-radius lines: R = 1 R☉ passes through the Sun; L ∝ R² at fixed T, ∝ T⁴ at fixed R', () => {
    expect(logLForRadius(1, TEFF_SUN_STEFAN)).toBeCloseTo(0, 12);
    expect(logLForRadius(10, 5000) - logLForRadius(1, 5000)).toBeCloseTo(2, 12);
    expect(logLForRadius(1, 2 * 5000) - logLForRadius(1, 5000)).toBeCloseTo(4 * Math.log10(2), 12);
    expect(radiusFromLT(logLForRadius(0.3, 3100), 3100)).toBeCloseTo(0.3, 12);
  });
  it('luminosity scaling returns the calibration row for a star exactly on it; 2.5 mag fainter = 0.1×', () => {
    expect(luminosityFromAbsMag(4.635, 4.635, 0.01)).toBeCloseTo(0.01, 12);
    expect(luminosityFromAbsMag(7.135, 4.635, 0.01)).toBeCloseTo(-0.99, 12);
  });
  it('Proxima: log L ≈ −2.81 (L ≈ 0.0015 L☉), R ≈ 0.15 R☉', () => {
    const h = hrPoint(byName('Proxima Cen')) as HrStar;
    expect(h.band).toBe('G');
    expect(h.logL).toBeCloseTo(-2.81, 2);
    expect(h.radius).toBeGreaterThan(0.13);
    expect(h.radius).toBeLessThan(0.17);
  });
  it('Sirius A (too bright for Gaia) is placed with Johnson V: log L ≈ 1.39', () => {
    const h = hrPoint(byName('alf CMa A')) as HrStar;
    expect(h.band).toBe('V');
    expect(h.logL).toBeCloseTo(1.39, 1);
  });
  it('white dwarfs, planets and untyped objects are refused with a reason', () => {
    expect(hrPoint(OBJ.find((o) => o.type === 'white dwarf')!)).toHaveProperty('reason');
    expect(hrPoint(OBJ.find((o) => o.type === 'exoplanet')!)).toHaveProperty('reason');
    expect(hrPoint(OBJ.find((o) => o.type !== 'exoplanet' && !o.spt)!)).toHaveProperty('reason');
  });
  it('the theoretical diagram places most 10 pc stars (>= 300) and its main sequence is monotonic in the mean', () => {
    const pts = OBJ.map(hrPoint).filter((h): h is HrStar => !('reason' in h));
    expect(pts.length).toBeGreaterThanOrEqual(300);
    const hot = pts.filter((p) => p.teff > 5000), cool = pts.filter((p) => p.teff < 3500);
    const mean = (a: HrStar[]) => a.reduce((s, p) => s + p.logL, 0) / a.length;
    expect(mean(hot)).toBeGreaterThan(mean(cool) + 1.5);
  });
  it('CMD: white dwarfs are > 5 mag below main-sequence stars of the same colour', () => {
    const m = crossMatch(OBJ, CNS_ROWS);
    const wd = OBJ.filter((o) => o.type === 'white dwarf').map((o) => m.get(o.seq)).filter(Boolean).map((c) => cmdPoint(c!)).filter((p) => p !== null);
    expect(wd.length).toBeGreaterThan(10);
    for (const p of wd) {
      const ms = DWARF_SEQUENCE.filter((r) => r.GRp !== null && r.MG !== null).reduce((b, r) => (Math.abs(r.GRp! - p!.colour) < Math.abs(b.GRp! - p!.colour) ? r : b));
      if (p!.colour > 0.1 && p!.colour < 0.9) expect(p!.absG - ms.MG!, `G−RP ${p!.colour}`).toBeGreaterThan(5);
    }
  });
  it('the Hipparcos-converted G of Sirius A is flagged against V + (G−V)_A1V (about +0.4 mag)', () => {
    const m = crossMatch(OBJ, CNS_ROWS);
    const s = byName('alf CMa A');
    const d = convertedGCheck(s, m.get(s.seq))!;
    expect(d).toBeGreaterThan(0.3);
    expect(d).toBeLessThan(0.5);
  });
  it('MK class table: temperatures decrease O → Y and every class has rows', () => {
    expect(MK_CLASSES.map((k) => k.cls).join('')).toBe('OBAFGKMLTY');
    for (let i = 1; i < MK_CLASSES.length; i++) expect(MK_CLASSES[i].teffHot).toBeLessThan(MK_CLASSES[i - 1].teffCool + 1);
  });
});

// ---------------------------------------------------------------- Gate 5.3: exoplanets
import exoRaw from '@datasets/astronomical/exoplanets-10pc.json';
import { MJUP_IN_MEARTH, RJUP_IN_REARTH, apastron, bestMass, elementIssues, keplerA, keplerCheck, orbitPath, periastron, plausibleJd, type Exoplanet } from '@/modes/cosmic/star-systems/exoplanets';
const EXO = (exoRaw as unknown as { planets: Exoplanet[] }).planets;

describe('exoplanets within 10 pc', () => {
  it('IAU nominal ratios: M_J/M_E = 317.83, R_eJ/R_eE = 11.209', () => {
    expect(MJUP_IN_MEARTH).toBeCloseTo(317.83, 2);
    expect(RJUP_IN_REARTH).toBeCloseTo(11.209, 3);
  });
  it('Kepler’s third law: Earth (1 yr, 1 M☉) at 1 au to 1e-4; 8 × P² at fixed M gives 4 × a', () => {
    expect(keplerA(365.256363, 1)).toBeCloseTo(1, 4);
    expect(keplerA(8 * 100, 0.5) / keplerA(100, 0.5)).toBeCloseTo(4, 12);
  });
  it('the census matches the 10 pc catalogue planets and most have exoplanet.eu elements', () => {
    expect(EXO.length).toBe(OBJ.filter((o) => o.type === 'exoplanet').length);
    expect(EXO.filter((p) => p.eu).length).toBeGreaterThanOrEqual(80);
  });
  it('published a agrees with Kepler’s law (P, M★) within 15 % for ≥ 90 % of planets', () => {
    const checks = EXO.filter((p) => p.eu).map((p) => keplerCheck(p.eu!)).filter((x): x is number => x !== null);
    expect(checks.length).toBeGreaterThan(70);
    expect(checks.filter((k) => Math.abs(k) <= 0.15).length / checks.length).toBeGreaterThan(0.9);
  });
  it('Proxima b: P = 11.19 d, a ≈ 0.0486 au, m sin i ≈ 1.07 M⊕ (minimum mass)', () => {
    const p = EXO.find((x) => x.name === 'Proxima Cen b')!.eu!;
    expect(p.P![0]).toBeCloseTo(11.19, 2);
    expect(p.a![0]).toBeCloseTo(0.0486, 3);
    const m = bestMass(p)!;
    expect(m.minimum).toBe(true);
    expect(m.mEarth).toBeCloseTo(1.07, 1);
  });
  it('implausible periastron times are flagged, valid ones are not', () => {
    expect(plausibleJd(2_458_135.5)).toBe(true);
    expect(plausibleJd(245_813.5)).toBe(false);
    const prox = EXO.find((x) => x.name === 'Proxima Cen b')!.eu!;
    expect(elementIssues(prox).map((i) => i.field)).toContain('tperi');
  });
  it('every eccentricity is in [0, 1) and every inclination in [0°, 180°]', () => {
    for (const p of EXO) if (p.eu) for (const i of elementIssues(p.eu)) expect(['tperi', 'a'], `${p.name}: ${i.message}`).toContain(i.field);
  });
  it('orbit geometry: closed ellipse, star at focus, peri/apo distances, ω rotates periastron', () => {
    const pts = orbitPath(2, 0.5, 90, 360);
    expect(pts[0][0]).toBeCloseTo(0, 12);
    expect(pts[0][1]).toBeCloseTo(periastron(2, 0.5), 12); // periastron along +y for ω = 90°
    expect(Math.hypot(...pts[180])).toBeCloseTo(apastron(2, 0.5), 12);
    expect(pts[360][0]).toBeCloseTo(pts[0][0], 12);
    const r = pts.map(([x, y]) => Math.hypot(x, y));
    expect(Math.min(...r)).toBeCloseTo(1, 9);
    expect(Math.max(...r)).toBeCloseTo(3, 9);
  });
});

// ---------------------------------------------------------------- Gate 5.4: stellar spectra and relationships
import { registerStars, modelTeff, blackbodyId } from '@/modes/cosmic/star-systems/starRegistry';
import { CLASS_LINES, NIST_SPECTRA, allEntities, allRelationships, getEntity, relationshipsFrom, relationshipsTo, spectrumId } from '@/shared/scientific-relationships/registry';
import { getSource } from '@/shared/sources/sources';
import { peakWavelength } from '@/core/physics/em/em';

describe('stellar spectra and cross-links (Gate 5.4)', () => {
  registerStars(OBJ);
  it('class → line edges only point at bundled NIST spectra and follow O→He II, B→He I, A→H I', () => {
    for (const { spectra } of Object.values(CLASS_LINES)) for (const s of spectra) expect(NIST_SPECTRA, s).toContain(s);
    expect(relationshipsFrom('stellar-class:O').map((r) => r.to)).toEqual([spectrumId('He II')]);
    expect(relationshipsFrom('stellar-class:B').map((r) => r.to)).toEqual([spectrumId('He I')]);
    expect(relationshipsFrom('stellar-class:A').map((r) => r.to)).toEqual([spectrumId('H I')]);
    expect(relationshipsFrom('stellar-class:M').filter((r) => r.type === 'absorbs')).toHaveLength(0); // TiO bands: no data, no edge
  });
  it('every star with a calibrated T_eff links to a Planck model at that temperature, and back', () => {
    const prox = byName('Proxima Cen');
    const T = modelTeff(prox)!;
    expect(T).toBe(2930);
    const r = relationshipsFrom(`star:${prox.seq}`).find((x) => x.type === 'has-spectrum')!;
    expect(r.to).toBe(blackbodyId(2930));
    expect(getEntity(r.to)!.route).toMatch(/#\/spectral\?tab=blackbody&T=2930/);
    expect(relationshipsTo(blackbodyId(2930)).some((x) => x.from === `star:${prox.seq}`)).toBe(true);
    expect(relationshipsFrom(`star:${prox.seq}`).some((x) => x.to === 'stellar-class:M')).toBe(true);
    // a Proxima-like 2930 K blackbody peaks in the near infrared (≈ 989 nm), not in the visible
    expect(peakWavelength(T) * 1e9).toBeCloseTo(989, 0);
  });
  it('white dwarfs and planets get no blackbody model; stars of class G reach Ca II through their class', () => {
    expect(modelTeff(OBJ.find((o) => o.type === 'white dwarf')!)).toBeNull();
    expect(modelTeff(OBJ.find((o) => o.type === 'exoplanet')!)).toBeNull();
    const gStar = OBJ.find((o) => o.spt?.startsWith('G2'))!;
    expect(relationshipsFrom(`star:${gStar.seq}`).some((r) => r.to === 'stellar-class:G')).toBe(true);
    expect(relationshipsTo(spectrumId('Ca II')).some((r) => r.from === 'stellar-class:G')).toBe(true);
  });
  it('after star registration every edge is sourced, both ends exist and available entities have routes', () => {
    for (const r of allRelationships()) {
      expect(getEntity(r.from), r.from).toBeDefined();
      expect(getEntity(r.to), `${r.from} → ${r.to}`).toBeDefined();
      if (!r.from.startsWith('reaction:')) expect(getSource(r.source), `${r.from} → ${r.to}: ${r.source}`).toBeDefined();
    }
    for (const e of allEntities()) expect(e.status === 'available' ? !!e.route : e.route === null, e.id).toBe(true);
    expect(allEntities().filter((e) => e.kind === 'star').length).toBeGreaterThan(450);
  });
});

// ---------------------------------------------------------------- Gate 5.5: the Sun among the stars
import { SOLAR_LOG_EPS } from '@/shared/scientific-relationships/registry';
describe('Sun cross-links (Gate 5.5)', () => {
  it('the Sun is linked to class G (OpenStax: “G2”) and to every transcribed photospheric element', () => {
    expect(relationshipsFrom('body:sun').find((r) => r.to === 'stellar-class:G')?.context).toBe('G2');
    const comp = relationshipsFrom('body:sun').filter((r) => r.context === 'photospheric abundance');
    expect(comp.length).toBe(Object.keys(SOLAR_LOG_EPS).length);
    expect(comp.every((r) => r.source === 'asplund-2009')).toBe(true);
    expect(relationshipsTo('element:26').some((r) => r.from === 'body:sun')).toBe(true); // iron, log ε = 7.50
    expect(SOLAR_LOG_EPS.Fe).toBe(7.5);
  });
  it('class G now reaches both the Sun and 10 pc G stars', () => {
    const into = relationshipsTo('stellar-class:G').map((r) => r.from);
    expect(into).toContain('body:sun');
    expect(into.filter((x) => x.startsWith('star:')).length).toBeGreaterThan(10);
  });
});
