/**
 * Phase 6, Gate 6.4 — galaxies and rotation curves. SPARC integrity, the baryonic sum (Lelli et al.
 * 2016 eq. 2), the NFW circular velocity (NFW 1997 eq. 3) and its definitions, the halo fit, and the
 * Milky Way data (Bland-Hawthorn & Gerhard 2016; Eilers et al. 2019).
 */
import { describe, expect, it } from 'vitest';
import sparc from '@datasets/astronomical/sparc-galaxies.json';
import { MW, G_KPC, H0_KMS_MPC, UPSILON_DEFAULT, chi2Baryons, fitNFW, keplerV, m200, mwParam, r200, vBar, vBar2, vNFW, vModel, type CurvePoint, type Sparc } from '@/modes/cosmic/galaxies/galaxies';
import { getEntity, relationshipsTo } from '@/shared/scientific-relationships/registry';

const S = sparc as unknown as Sparc;

describe('SPARC data', () => {
  it('175 galaxies, each with a mass model; 3391 points; per-galaxy references resolve', () => {
    expect(S.galaxies.length).toBe(175);
    expect(Object.values(S.curves).reduce((n, c) => n + c.length, 0)).toBe(3391);
    for (const g of S.galaxies) {
      expect(S.curves[g.name]?.length, g.name).toBeGreaterThan(0);
      expect([1, 2, 3]).toContain(g.Q);
      expect(g.T).toBeGreaterThanOrEqual(0); expect(g.T).toBeLessThanOrEqual(11);
    }
    const unresolved = new Set(S.galaxies.flatMap((g) => g.refs).filter((k) => !S.references[k]));
    expect([...unresolved].sort()).toEqual(['Ba06', 'Bm05', 'Fr02', 'VB99', 'VdH93']); // keys missing from the published legend (listed in the manifest)
  });
  it('NGC 3198 matches Table 1: T = 5 (Sc), D = 13.8 Mpc (Cepheids), V_flat = 150.1 km/s, 43 radii', () => {
    const g = S.galaxies.find((x) => x.name === 'NGC3198')!;
    expect([g.T, g.D, g.fD, g.Vflat, g.Q]).toEqual([5, 13.8, 3, 150.1, 1]);
    expect(S.curves.NGC3198.length).toBe(43);
  });
});

describe('baryonic rotation curve (Lelli et al. eq. 2)', () => {
  it('signed squares add; Υ scales only the stellar terms; negative gas terms are kept', () => {
    const p: CurvePoint = [1, 50, 2, 10, 40, 30];
    expect(vBar2(p, 1, 1)).toBeCloseTo(100 + 1600 + 900, 10);
    expect(vBar2(p, 0.5, 0.7)).toBeCloseTo(100 + 800 + 630, 10);
    const q: CurvePoint = [0.2, 10, 2, -20, 10, 0];
    expect(vBar2(q, 1, 0)).toBeCloseTo(-400 + 100, 10);
    expect(vBar(q, 1, 0)).toBeLessThan(0);
  });
  it('baryons alone fall short of the observed outer rotation of NGC 3198 (the classic missing-mass result)', () => {
    const c = S.curves.NGC3198, last = c[c.length - 1];
    expect(vBar(last, UPSILON_DEFAULT.disk, UPSILON_DEFAULT.bul)).toBeLessThan(0.7 * last[1]);
  });
});

describe('NFW halo (NFW 1997 eq. 3)', () => {
  it('G = 4.30 × 10⁻⁶ kpc (km/s)²/M☉', () => {
    expect(G_KPC / 1e-6).toBeCloseTo(4.301, 2);
  });
  it('V(r₂₀₀) = V₂₀₀ for any c; r₂₀₀ encloses 200 ρ_crit', () => {
    for (const c of [3, 10, 30]) expect(vNFW(r200(150), 150, c)).toBeCloseTo(150, 10);
    const H = H0_KMS_MPC / 1000; // km/s/kpc
    const rhoCrit = (3 * H * H) / (8 * Math.PI * G_KPC);
    const meanDensity = m200(150) / ((4 / 3) * Math.PI * r200(150) ** 3);
    expect(meanDensity / rhoCrit).toBeCloseTo(200, 8);
  });
  it('the circular velocity peaks at r ≈ 2.163 r_s', () => {
    const V = 150, c = 10, rs = r200(V) / c;
    const h = 1e-4 * rs;
    expect((vNFW(2.163 * rs + h, V, c) - vNFW(2.163 * rs - h, V, c)) / h).toBeCloseTo(0, 3);
  });
  it('the density profile integrates to the velocity: M(<r) = V²r/G matches ∫4πr²ρ dr', () => {
    const V = 120, c = 8, R = r200(V), rs = R / c;
    const f = (y: number) => Math.log(1 + y) - y / (1 + y);
    const rho0 = m200(V) / (4 * Math.PI * rs ** 3 * f(c)); // ρ = ρ0 / ((r/rs)(1+r/rs)²)
    const r = 0.37 * R, n = 20000;
    let M = 0;
    for (let i = 0; i < n; i++) { const x = ((i + 0.5) / n) * r; M += 4 * Math.PI * x * x * (rho0 / ((x / rs) * (1 + x / rs) ** 2)) * (r / n); }
    expect(M / ((vNFW(r, V, c) ** 2 * r) / G_KPC)).toBeCloseTo(1, 5);
  });
  it('the fit recovers a known halo from synthetic data', () => {
    const base = S.curves.NGC3198;
    const synth = base.map((p) => { const v = Math.sqrt(vBar2(p, 0.5, 0.7) + vNFW(p[0], 140, 9) ** 2); return [p[0], v, 2, p[3], p[4], p[5]] as CurvePoint; });
    const f = fitNFW(synth, 0.5, 0.7)!;
    expect(f.V200 / 140).toBeCloseTo(1, 2);
    expect(f.c / 9).toBeCloseTo(1, 1);
    expect(f.chi2).toBeLessThan(0.1); // grid resolution limits the exact minimum
  });
  it('NGC 3198: baryons + NFW fit the data far better than baryons alone (χ²/dof)', () => {
    const c = S.curves.NGC3198;
    const b = chi2Baryons(c, 0.5, 0.7), f = fitNFW(c, 0.5, 0.7)!;
    expect(b.chi2 / b.dof).toBeGreaterThan(20 * (f.chi2 / f.dof));
    expect(f.atEdge).toBe(false);
    for (const p of c.slice(-5)) expect(Math.abs(vModel(p, 0.5, 0.7, f) - p[1])).toBeLessThan(4 * p[2] + 5);
  });
});

describe('Milky Way', () => {
  const rows = MW.rotationCurve.rows;
  it('Eilers et al. Table 1: 38 radii from 5.27 to 24.82 kpc, errors positive', () => {
    expect(rows.length).toBe(38);
    expect(rows[0][0]).toBe(5.27); expect(rows[37][0]).toBe(24.82);
    for (const r of rows) { expect(r[2]).toBeGreaterThan(0); expect(r[3]).toBeGreaterThan(0); }
  });
  it('a weighted straight line through 5–20 kpc declines by about −1.7 km/s per kpc (their fit)', () => {
    const sel = rows.filter((r) => r[0] <= 20);
    let sw = 0, sx = 0, sy = 0, sxx = 0, sxy = 0;
    for (const [x, y, a, b] of sel) { const w = 1 / ((a + b) / 2) ** 2; sw += w; sx += w * x; sy += w * y; sxx += w * x * x; sxy += w * x * y; }
    const slope = (sw * sxy - sx * sy) / (sw * sxx - sx * sx);
    expect(slope).toBeGreaterThan(-1.7 - 0.5);
    expect(slope).toBeLessThan(-1.7 + 0.5);
  });
  it('v_c near the Sun (8.19 kpc: 228.9 km/s) agrees with Θ₀ = 238 ± 15 km/s', () => {
    const at = rows.find((r) => r[0] === 8.19)!;
    const th = mwParam('Theta0').value!;
    expect(Math.abs(at[1] - th[0])).toBeLessThan(th[1]);
  });
  it('the stellar mass alone, even concentrated at the centre, cannot hold the measured speed at 20 kpc', () => {
    const M = mwParam('Mstar').value![0] + mwParam('Mstar').value![2]; // upper end
    const v20 = rows.find((r) => r[0] === 20.27)!;
    expect(keplerV(M, v20[0])).toBeLessThan(0.6 * v20[1]);
  });
  it('the Milky Way is a registry entity containing the Sun and Sgr A*', () => {
    expect(getEntity('galaxy:milky-way')?.route).toBe('#/cosmic/galaxies?tab=mw');
    const into = relationshipsTo('galaxy:milky-way').map((r) => r.from);
    expect(into).toContain('body:sun');
    expect(into).toContain('compact-object:sgr-a-star');
  });
});
