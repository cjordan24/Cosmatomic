/**
 * Scientific validation — atomic data & models.
 * Tolerances and assumptions are stated per test. Nothing here depends on rendering.
 */
import { describe, expect, it } from 'vitest';
import nuclidesJson from '@datasets/atomic/nuclides.json';
import { ELEMENTS, tablePosition, periodOf } from '@/modes/atomic/atoms/elements';
import { parseConfiguration, totalElectrons, shellOccupancy, ionConfiguration, formatConfiguration, valenceElectrons, slaterZeff, orbitalBoxes } from '@/modes/atomic/atoms/configuration';
import { defaultIsotope, neutronCount, type ElementNuclides } from '@/modes/atomic/atoms/isotopes';
import { transitionLine, levelEnergyEV } from '@/modes/atomic/atoms/spectrum';
import { radial, realYlm, meanRadius, sampleOrbitals } from '@/modes/atomic/orbitals/hydrogenic';
import { mulberry32 } from '@/core/simulation/random';

const NUC = nuclidesJson as unknown as Record<string, ElementNuclides>;

describe('Periodic table dataset', () => {
  it('contains exactly the 118 recognised elements, Z = 1…118 in order', () => {
    expect(ELEMENTS).toHaveLength(118);
    ELEMENTS.forEach((e, i) => expect(e.Z).toBe(i + 1));
    expect(new Set(ELEMENTS.map((e) => e.symbol)).size).toBe(118);
  });

  it('proton count equals atomic number; neutral electron count equals proton count (config sums to Z) for all 118', () => {
    for (const e of ELEMENTS) {
      const protons = e.Z;
      expect(totalElectrons(parseConfiguration(e.electronConfiguration)), `${e.symbol}: ${e.electronConfiguration}`).toBe(protons);
    }
  });

  it('electron configurations respect subshell capacities (s≤2, p≤6, d≤10, f≤14)', () => {
    const cap = [2, 6, 10, 14];
    for (const e of ELEMENTS) for (const s of parseConfiguration(e.electronConfiguration)) expect(s.electrons).toBeLessThanOrEqual(cap[s.l]);
  });

  it('highest occupied principal shell equals the period (layout derived from Z) and matches PubChem period', () => {
    for (const e of ELEMENTS) {
      const maxN = Math.max(...parseConfiguration(e.electronConfiguration).map((s) => s.n));
      // Pd ([Kr]4d10) is the one ground-state exception: no 5s electron, period 5.
      if (e.symbol !== 'Pd') expect(maxN, e.symbol).toBe(periodOf(e.Z));
      if (e.period !== null) expect(e.period, e.symbol).toBe(periodOf(e.Z));
    }
  });

  it('layout: each (row, col) cell is unique and groups match known anchors', () => {
    const cells = new Set(ELEMENTS.map((e) => { const p = tablePosition(e.Z); return `${p.row},${p.col}`; }));
    expect(cells.size).toBe(118);
    expect(tablePosition(26).group).toBe(8); // Fe
    expect(tablePosition(79).group).toBe(11); // Au
    expect(tablePosition(54).group).toBe(18); // Xe
    expect(tablePosition(72).group).toBe(4); // Hf
    expect(tablePosition(92).block).toBe('f'); // U
    expect(tablePosition(118).group).toBe(18); // Og
  });

  it('known experimental ground-state exceptions are preserved from source data', () => {
    expect(formatConfiguration(parseConfiguration(ELEMENTS[23].electronConfiguration))).toBe('[Ar] 3d⁵ 4s¹'); // Cr
    expect(formatConfiguration(parseConfiguration(ELEMENTS[28].electronConfiguration))).toBe('[Ar] 3d¹⁰ 4s¹'); // Cu
  });
});

describe('Shells, valence, ions, Slater', () => {
  it('Bohr shell occupancy: Na = 2,8,1; Fe = 2,8,14,2', () => {
    expect(shellOccupancy(parseConfiguration(ELEMENTS[10].electronConfiguration))).toEqual([2, 8, 1]);
    expect(shellOccupancy(parseConfiguration(ELEMENTS[25].electronConfiguration))).toEqual([2, 8, 14, 2]);
  });
  it('valence electrons: C=4, O=6, Cl=7, Ne=8, He=2; f-block = null (no single definition)', () => {
    const v = (Z: number) => valenceElectrons(parseConfiguration(ELEMENTS[Z - 1].electronConfiguration), tablePosition(Z).block);
    expect([v(6), v(8), v(17), v(10), v(2)]).toEqual([4, 6, 7, 8, 2]);
    expect(v(92)).toBeNull();
  });
  it('ion configurations: Fe²⁺ = [Ar]3d⁶ (4s removed first), Cl⁻ = [Ar], Na⁺ = [Ne]; electron counts = Z − q', () => {
    const fe2 = ionConfiguration(parseConfiguration(ELEMENTS[25].electronConfiguration), 2);
    expect(formatConfiguration(fe2)).toBe('[Ar] 3d⁶');
    expect(totalElectrons(fe2)).toBe(24);
    const cl = ionConfiguration(parseConfiguration(ELEMENTS[16].electronConfiguration), -1);
    expect(totalElectrons(cl)).toBe(18);
    expect(formatConfiguration(cl, false)).toBe('1s² 2s² 2p⁶ 3s² 3p⁶');
    expect(formatConfiguration(ionConfiguration(parseConfiguration(ELEMENTS[10].electronConfiguration), 1), false)).toBe('1s² 2s² 2p⁶'); // isoelectronic with Ne
  });
  it("Slater Z_eff matches textbook values (tolerance 0.01): C 2p = 3.25, Na 3s = 2.20, Zn 3d = 8.85, Zn 4s = 4.35", () => {
    const z = (Z: number, n: number, l: 0 | 1 | 2) => slaterZeff(Z, parseConfiguration(ELEMENTS[Z - 1].electronConfiguration), { n, l });
    expect(z(6, 2, 1)).toBeCloseTo(3.25, 2);
    expect(z(11, 3, 0)).toBeCloseTo(2.2, 2);
    expect(z(30, 3, 2)).toBeCloseTo(8.85, 2);
    expect(z(30, 4, 0)).toBeCloseTo(4.35, 2);
  });
  it("Hund's rule boxes: N 2p³ = three unpaired; O 2p⁴ = one pair + two unpaired", () => {
    expect(orbitalBoxes({ n: 2, l: 1, electrons: 3 })).toEqual(['up', 'up', 'up']);
    expect(orbitalBoxes({ n: 2, l: 1, electrons: 4 })).toEqual(['pair', 'up', 'up']);
  });
});

describe('Isotopes (IUPAC CIAAW + AMDC NUBASE)', () => {
  it('neutron count = A − Z: ¹²C → 6, ⁵⁶Fe → 30, ²³⁸U → 146', () => {
    expect(neutronCount(6, 12)).toBe(6);
    expect(neutronCount(26, 56)).toBe(30);
    expect(neutronCount(92, 238)).toBe(146);
  });
  it('default isotope is the most abundant natural isotope — NOT the rounded atomic weight', () => {
    expect(defaultIsotope(NUC[26])!.A).toBe(56);
    // Tellurium: standard atomic weight 127.60 rounds to 128, but ¹³⁰Te is most abundant (34.08 %)
    expect(Math.round(ELEMENTS[51].atomicWeight!)).toBe(128);
    expect(defaultIsotope(NUC[52])!.A).toBe(130);
    // Chlorine: 35.45 → ³⁵Cl
    expect(defaultIsotope(NUC[17])!.A).toBe(35);
  });
  it('elements with no stable isotope are exactly Tc, Pm and Z ≥ 83', () => {
    const unstable = ELEMENTS.filter((e) => !e.hasStableIsotope).map((e) => e.Z);
    expect(unstable).toEqual([43, 61, ...Array.from({ length: 36 }, (_, i) => 83 + i)]);
  });
  it('radioactive-only elements default to the longest-lived isotope: Tc → 97, Pu → 244', () => {
    expect(defaultIsotope(NUC[43])).toMatchObject({ A: 97, reason: 'longest-lived' });
    expect(defaultIsotope(NUC[94])).toMatchObject({ A: 244, reason: 'longest-lived' });
  });
  it('natural abundances sum to 1 within 0.002 (point values) — interval elements: Σlo ≤ 1 ≤ Σhi', () => {
    for (const [Z, en] of Object.entries(NUC)) {
      if (en.natural.some((n) => n.abundanceInterval)) {
        const lo = en.natural.reduce((t, n) => t + (n.abundanceInterval?.[0] ?? n.abundance ?? 0), 0);
        const hi = en.natural.reduce((t, n) => t + (n.abundanceInterval?.[1] ?? n.abundance ?? 0), 0);
        expect(lo, `Z=${Z}`).toBeLessThanOrEqual(1 + 1e-9); expect(hi, `Z=${Z}`).toBeGreaterThanOrEqual(1 - 1e-9);
        continue;
      }
      const ab = en.natural.map((n) => n.abundance);
      if (!ab.length || ab.some((a) => a === null)) continue;
      const s = ab.reduce<number>((t, a) => t + (a ?? 0), 0);
      if (s > 0) expect(Math.abs(s - 1), `Z=${Z} sum=${s}`).toBeLessThan(0.002);
    }
  });
  it('nuclide table has no duplicate (A, isomer) entries; isomers are labelled (²³⁵ᵐU = 25.7 min IT)', () => {
    for (const [Z, en] of Object.entries(NUC)) {
      const keys = en.nuclides.map((n) => `${n.A}${n.isomer ?? ''}`);
      expect(new Set(keys).size, `Z=${Z}`).toBe(keys.length);
    }
    const u235m = NUC[92].nuclides.find((n) => n.A === 235 && n.isomer === 'm')!;
    expect(u235m.halfLife).toMatch(/^25\.7 m/);
    expect(NUC[92].nuclides.find((n) => n.A === 235 && n.isomer === null)!.halfLife).toMatch(/^704 My/);
  });
  it('isotope masses are within 0.5 u of their mass number (binding-energy sanity check)', () => {
    for (const en of Object.values(NUC)) for (const n of en.natural) expect(Math.abs(n.mass - n.A)).toBeLessThan(0.5);
  });
});

describe('Hydrogen-like quantum model', () => {
  it('H ground-state energy = −13.598 eV with reduced-mass correction (NIST ionisation energy 13.598434 eV; tol 0.001 eV)', () => {
    expect(levelEnergyEV(1, 1, 1.007276)).toBeCloseTo(-13.5984, 3);
  });
  it('Balmer Hα vacuum wavelength = 656.47 nm (Bohr model; NIST 656.461 nm incl. fine structure; tol 0.02 nm)', () => {
    expect(Math.abs(transitionLine(3, 2, 1, 1.007276).wavelengthNm - 656.461)).toBeLessThan(0.02);
  });
  it('Lyman-α vacuum wavelength = 121.567 nm (tol 0.005 nm)', () => {
    expect(Math.abs(transitionLine(2, 1, 1, 1.007276).wavelengthNm - 121.567)).toBeLessThan(0.005);
  });
  it('radial functions are normalised: ∫R²r²dr = 1 (tol 1e-4) for n ≤ 5', () => {
    for (let n = 1; n <= 5; n++) for (let l = 0; l < n; l++) {
      let s = 0; const dr = 0.005;
      for (let r = dr / 2; r < 150; r += dr) s += radial(n, l, 1, r) ** 2 * r * r * dr;
      expect(Math.abs(s - 1), `n=${n} l=${l}`).toBeLessThan(1e-4);
    }
  });
  it('real spherical harmonics are normalised on the sphere (Monte-Carlo, tol 2%)', () => {
    const rand = mulberry32(7);
    for (let l = 0; l <= 3; l++) for (let m = -l; m <= l; m++) {
      let s = 0; const N = 60000;
      for (let k = 0; k < N; k++) {
        const z = 2 * rand() - 1, ph = 2 * Math.PI * rand(), q = Math.sqrt(1 - z * z);
        s += realYlm(l, m, q * Math.cos(ph), q * Math.sin(ph), z) ** 2;
      }
      expect(Math.abs((s / N) * 4 * Math.PI - 1), `l=${l} m=${m}`).toBeLessThan(0.02);
    }
  });
  it('sampled cloud reproduces ⟨r⟩ = 1.5 a₀ for 1s and 5 a₀ for 2p (tol 2%), deterministically by seed', () => {
    const mean = (n: number, l: 0 | 1, m: number) => {
      const { positions } = sampleOrbitals({ orbitals: [{ o: { n, l, m }, Z: 1, weight: 1 }], count: 40000, seed: 42 }, mulberry32(42));
      let s = 0; for (let i = 0; i < positions.length; i += 3) s += Math.hypot(positions[i], positions[i + 1], positions[i + 2]);
      return s / (positions.length / 3);
    };
    expect(Math.abs(mean(1, 0, 0) / meanRadius(1, 0, 1) - 1)).toBeLessThan(0.02);
    expect(Math.abs(mean(2, 1, 0) / meanRadius(2, 1, 1) - 1)).toBeLessThan(0.02);
    const a = sampleOrbitals({ orbitals: [{ o: { n: 2, l: 1, m: 0 }, Z: 1, weight: 1 }], count: 100, seed: 1 }, mulberry32(1));
    const b = sampleOrbitals({ orbitals: [{ o: { n: 2, l: 1, m: 0 }, Z: 1, weight: 1 }], count: 100, seed: 1 }, mulberry32(1));
    expect(Array.from(a.positions)).toEqual(Array.from(b.positions));
  });
});

describe('NIST ASD spectra (measured) vs models', async () => {
  const nist = (await import('@datasets/atomic/spectra-nist.json')).default as unknown as import('@/modes/atomic/atoms/nistSpectra').NistSpectra;
  const { blendCentroid } = await import('@/modes/atomic/atoms/nistSpectra');
  const has = (sp: string, wl: number, tol: number) => nist.spectra[sp].lines.some((l) => Math.abs(l.wl - wl) < tol);
  it('contains ≥ 20 spectra including the classic lines (vacuum nm): Na D 589.158/589.756, Ca II K/H 393.477/396.959, He I 587.725, [O III] 500.824, [O I] 557.889', () => {
    expect(Object.keys(nist.spectra).length).toBeGreaterThanOrEqual(20);
    expect(has('Na I', 589.1583, 0.001) && has('Na I', 589.7558, 0.001)).toBe(true);
    expect(has('Ca II', 393.477, 0.002) && has('Ca II', 396.959, 0.002)).toBe(true);
    expect(has('He I', 587.725, 0.002)).toBe(true);
    expect(has('O III', 500.824, 0.002)).toBe(true);
    expect(has('O I', 557.889, 0.002)).toBe(true);
  });
  it('Bohr/Rydberg model vs NIST H I Balmer lines (A-weighted fine-structure centroids): Hα, Hβ, Hγ within 0.01 nm', () => {
    for (const [nu, ref] of [[3, 656.47], [4, 486.27], [5, 434.17]] as const) {
      const model = transitionLine(nu, 2, 1, 1.007276).wavelengthNm;
      const meas = blendCentroid(nist.spectra['H I'].lines, ref, 0.06)!;
      expect(Math.abs(model - meas), `n=${nu}`).toBeLessThan(0.01);
    }
  });
  it('He II Pickering/Paschen-α line 468.6 nm (n = 4 → 3, Z = 2) matches NIST within 0.02 nm', () => {
    const model = transitionLine(4, 3, 2, 4.001506).wavelengthNm;
    expect(Math.abs(model - blendCentroid(nist.spectra['He II'].lines, 468.7, 0.1)!)).toBeLessThan(0.02);
  });
  it('H–D isotope shift of Hα: reduced-mass model reproduces NIST (≈ 0.179 nm) within 0.002 nm', () => {
    const shiftModel = transitionLine(3, 2, 1, 1.007276).wavelengthNm - transitionLine(3, 2, 1, 2.013553).wavelengthNm;
    const shiftNist = blendCentroid(nist.spectra['H I'].lines, 656.47, 0.06)! - blendCentroid(nist.spectra['D I'].lines, 656.29, 0.06)!;
    expect(shiftNist).toBeGreaterThan(0.17);
    expect(Math.abs(shiftModel - shiftNist)).toBeLessThan(0.002);
  });
});
