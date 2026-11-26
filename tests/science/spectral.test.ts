/**
 * Gate 4.6 — Spectral Mode: vacuum relations, photon energy, plane-wave E/B geometry, polarisation,
 * band mapping per convention, blackbody laws, and frequency-dependent material data.
 */
import { describe, expect, it } from 'vitest';
import { CONSTANTS } from '@/core/constants/constants';
import { MU0, POLARISATIONS, SIGMA_SB, WIEN_B, WIEN_B_FREQ, classify, cross, dot, inMedium, intensity, norm, peakFrequency, peakWavelength, photon, planckLambda, planckNu, planeB, planeE, poynting, type Polarisation } from '@/core/physics/em/em';
import { CONVENTIONS, EXAMPLES, annihilationEV, bandsAt, bandWavelengthsM, exampleWavelengthsM, getConvention, lymanAlphaNm } from '@/modes/spectral/atlas/bands';
import { getSource } from '@/shared/sources/sources';
import { MATERIALS, refractiveIndex } from '@/modes/atomic/materials/materials';

const c = CONSTANTS.c.value;
const names = (convId: string, lambdaM: number) => bandsAt(getConvention(convId)!, lambdaM).map((h) => h.band.symbol ?? h.band.name);

describe('vacuum relations and photon energy (CODATA, exact SI constants)', () => {
  it('λ = c/f in vacuum', () => {
    expect(photon('frequency', 1e9).lambda).toBeCloseTo(0.299792458, 12);
    expect(photon('wavelength', 500e-9).f).toBeCloseTo(5.99584916e14, -3);
    expect(photon('frequency', c).lambda).toBe(1);
  });
  it('E = hf = hc/λ: 1 eV ↔ 1239.841984 nm and 8.065543937×10⁵ m⁻¹ (CODATA listed values)', () => {
    const p = photon('energy', 1);
    expect(p.lambda * 1e9).toBeCloseTo(1239.841984, 5);
    expect(1 / p.lambda).toBeCloseTo(8.065543937e5, 2);
    expect(p.energyJ).toBeCloseTo(CONSTANTS.e.value, 30);
    const q = photon('wavelength', 532e-9);
    expect(q.energyJ).toBeCloseTo((CONSTANTS.h.value * c) / 532e-9, 30);
    expect(q.energyEV).toBeCloseTo(1239.841984 / 532, 6);
  });
  it('the three inputs round-trip', () => {
    for (const lam of [1e-12, 121.567e-9, 589e-9, 10.6e-6, 0.21, 3000]) {
      const a = photon('wavelength', lam), b = photon('frequency', a.f), d = photon('energy', a.energyEV);
      expect(b.lambda / lam).toBeCloseTo(1, 12);
      expect(d.lambda / lam).toBeCloseTo(1, 12);
    }
  });
  it('rejects non-physical inputs', () => {
    expect(() => photon('frequency', 0)).toThrow();
    expect(() => photon('wavelength', -1)).toThrow();
  });
  it('derived examples are computed, not stored: m_e c² = 510 998.95 eV; Lyman-α in the ISO 21348 Lyman-α category', () => {
    for (const id of ['annihilation', 'lyman-alpha']) expect(EXAMPLES.find((e) => e.id === id)!.value).toBeNull();
    expect(annihilationEV()).toBeCloseTo(510998.95, 1);                                  // CODATA 2018 m_e c² = 0.510 998 950 00 MeV
    const ly = lymanAlphaNm();
    expect(ly).toBeGreaterThan(121); expect(ly).toBeLessThan(122);
    expect(names('iso-21348', ly * 1e-9)).toContain('H Lyman-α');
    const ann = exampleWavelengthsM(EXAMPLES.find((e) => e.id === 'annihilation')!)[0];
    expect(ann).toBeCloseTo(CONSTANTS.h.value / (CONSTANTS.me.value * c), 22);          // Compton wavelength 2.43 pm
    expect(names('iso-21348', ann)).toEqual(['X-rays (hard)']);                   // ISO 21348 classifies by λ only: “gamma” by origin, hard X-ray by wavelength
  });
  it('every example maps to a finite vacuum wavelength inside its stated region', () => {
    const region: Record<string, string[]> = { radio: ['Radio'], microwave: ['Microwave'], infrared: ['IR'], visible: ['VIS'], ultraviolet: ['UV'], gamma: ['Gamma-rays'] };
    for (const ex of EXAMPLES.filter((e) => e.id !== 'annihilation')) {   // annihilation: see the convention-mismatch test above
      const [a, b] = exampleWavelengthsM(ex);
      expect(Number.isFinite(a) && b >= a, ex.id).toBe(true);
      for (const l of [a, b]) expect(names('iso-21348', l).some((n) => region[ex.region].includes(n)), `${ex.id} at ${l} m`).toBe(true);
    }
  });
});

describe('vacuum plane wave: E ⊥ B ⊥ k, |B| = |E|/c', () => {
  const f = 5e14, E0 = 100;
  const pols: Polarisation[] = [...Object.values(POLARISATIONS), { Ex0: 0.3, Ey0: 0.9, delta: 1.1 }];
  it('holds at every sampled point for every polarisation', () => {
    for (const p of pols) for (let i = 0; i < 40; i++) {
      const z = i * 37e-9, t = i * 1.3e-16;
      const E = planeE(p, E0, f, z, t), B = planeB(E);
      const k: [number, number, number] = [0, 0, 1];
      expect(dot(E, B)).toBeCloseTo(0, 18);
      expect(dot(E, k)).toBe(0);
      expect(dot(B, k)).toBe(0);
      expect(norm(B) * c).toBeCloseTo(norm(E), 9);
      const S = poynting(E, B);
      if (norm(E) > 1e-6) { expect(S[0]).toBeCloseTo(0, 6); expect(S[1]).toBeCloseTo(0, 6); expect(S[2]).toBeGreaterThan(0); }
    }
  });
  it('time-averaged Poynting flux equals ½cε₀E₀² (μ₀ = 1/ε₀c²)', () => {
    const p = POLARISATIONS['linear-x'], N = 2000, T = 1 / f;
    let s = 0;
    for (let i = 0; i < N; i++) { const E = planeE(p, E0, f, 0, (i * T) / N); s += poynting(E, planeB(E))[2]; }
    expect(s / N / intensity(p, E0)).toBeCloseTo(1, 6);
    expect(intensity(p, E0)).toBeCloseTo(0.5 * c * CONSTANTS.eps0.value * E0 * E0, 9);
    expect(MU0).toBeCloseTo(1.25663706212e-6, 15);
  });
  it('E advances along +z at c: the field at (z, t) equals the field at (z + cΔt, t + Δt)', () => {
    const p = POLARISATIONS['elliptical'], dt = 3.7e-16;
    const a = planeE(p, E0, f, 1e-7, 2e-15), b = planeE(p, E0, f, 1e-7 + c * dt, 2e-15 + dt);
    for (let i = 0; i < 3; i++) expect(b[i]).toBeCloseTo(a[i], 8);
  });
});

describe('polarisation classification and CIE handedness', () => {
  /** Sense of rotation seen by the receiver (looking back along −z): z-component of E(t) × E(t+dt) > 0 means anticlockwise from +z. */
  const senseFromReceiver = (p: Polarisation) => {
    const f = 1e14, E1 = planeE(p, 1, f, 0, 0), E2 = planeE(p, 1, f, 0, 1e-17);
    return cross(E1, E2)[2] > 0 ? 'anticlockwise' : 'clockwise';
  };
  it('linear, circular and elliptical states are identified', () => {
    expect(classify(POLARISATIONS['linear-x']).kind).toBe('linear');
    expect(classify(POLARISATIONS['linear-45']).kind).toBe('linear');
    expect(classify(POLARISATIONS['circular-right']).kind).toBe('circular');
    expect(classify(POLARISATIONS['circular-left']).kind).toBe('circular');
    expect(classify(POLARISATIONS['elliptical']).kind).toBe('elliptical');
  });
  it('right-handed = clockwise as seen by the receiver (CIE 17-21-018)', () => {
    expect(classify(POLARISATIONS['circular-right']).handedness).toBe('right');
    expect(senseFromReceiver(POLARISATIONS['circular-right'])).toBe('clockwise');
    expect(classify(POLARISATIONS['circular-left']).handedness).toBe('left');
    expect(senseFromReceiver(POLARISATIONS['circular-left'])).toBe('anticlockwise');
    expect(senseFromReceiver(POLARISATIONS['elliptical'])).toBe(classify(POLARISATIONS['elliptical']).handedness === 'right' ? 'clockwise' : 'anticlockwise');
  });
  it('circular polarisation has constant |E|; elliptical |E| varies at twice the frequency', () => {
    const f = 1e14, T = 1 / f;
    const mags = (p: Polarisation) => Array.from({ length: 200 }, (_, i) => norm(planeE(p, 1, f, 0, (i * T) / 200)));
    const circ = mags(POLARISATIONS['circular-right']);
    expect(Math.max(...circ) - Math.min(...circ)).toBeLessThan(1e-12);
    const ell = mags(POLARISATIONS['elliptical']);
    expect(Math.max(...ell) - Math.min(...ell)).toBeGreaterThan(0.1);
    // period of |E| is T/2: sample i and i + 100 (half a period) agree
    for (let i = 0; i < 100; i += 7) expect(ell[i]).toBeCloseTo(ell[i + 100], 9);
  });
});

describe('band conventions (transcribed from the source documents)', () => {
  it('every convention cites indexed sources, except the one marked not available', () => {
    for (const cv of CONVENTIONS) {
      if (cv.status === 'not-available') { expect(cv.bands).toBeNull(); continue; }
      expect(cv.sources.length, cv.id).toBeGreaterThan(0);
      for (const id of cv.sources) expect(getSource(id), `${cv.id} → ${id}`).toBeDefined();
      for (const b of cv.bands!) expect(b.hi, b.id).toBeGreaterThan(b.lo);
    }
    for (const ex of EXAMPLES) for (const id of ex.sources) expect(getSource(id), `${ex.id} → ${id}`).toBeDefined();
  });
  it('ITU-R V.431: 17 contiguous decade bands 0.03 Hz – 3000 THz; band N = 0.3·10^N … 3·10^N Hz', () => {
    const itu = getConvention('itu-r-v431')!;
    expect(itu.bands!.length).toBe(17);
    itu.bands!.forEach((b, i) => {
      const N = i - 1;
      expect(b.lo / (0.3 * 10 ** N)).toBeCloseTo(1, 12);
      expect(b.hi / (3 * 10 ** N)).toBeCloseTo(1, 12);
      if (i > 0) expect(b.lo).toBe(itu.bands![i - 1].hi);
    });
    expect(itu.bands!.filter((b) => b.symbol).map((b) => b.symbol)).toEqual(['TLF', 'ELF', 'SLF', 'ULF', 'VLF', 'LF', 'MF', 'HF', 'VHF', 'UHF', 'SHF', 'EHF', 'THF']);
  });
  it('ITU-R edges: lower limit exclusive, upper inclusive (in frequency)', () => {
    const lam = (f: number) => c / f;
    expect(names('itu-r-v431', lam(30e6))).toEqual(['HF']);   // 30 MHz is the top of HF
    expect(names('itu-r-v431', lam(30.000001e6))).toEqual(['VHF']);
    expect(names('itu-r-v431', lam(100e6))).toEqual(['VHF']);                           // FM radio
    expect(names('itu-r-v431', lam(2.45e9))).toEqual(['UHF']);
    expect(names('itu-r-v431', lam(10e9))).toEqual(['SHF']);
    expect(names('itu-r-v431', lam(50))).toEqual(['SLF']);                            // mains frequency
    expect(names('itu-r-v431', lam(10))).toEqual(['ELF']);
    expect(names('itu-r-v431', lam(1e16))).toEqual([]);                                 // beyond band 15
  });
  it('ISO 21348 edges: lower inclusive, upper exclusive (in wavelength); overlapping sub-categories', () => {
    expect(names('iso-21348', 280e-9)).toEqual(['UV', 'MUV', 'UVB']);
    expect(names('iso-21348', 279.999e-9)).toEqual(['UV', 'UVC', 'MUV']);
    expect(names('iso-21348', 121.567e-9)).toEqual(['UV', 'VUV', 'H Lyman-α', 'UVC']);
    expect(names('iso-21348', 5e-12)).toEqual(['X-rays (hard)']);
    expect(names('iso-21348', 1e-13)).toEqual(['Gamma-rays']);
    expect(names('iso-21348', 1e-9)).toEqual(['XUV']);
    expect(names('iso-21348', 550e-9)).toEqual(['VIS', 'green']);
    expect(names('iso-21348', 770e-9)).toEqual(['IR', 'IR-A']);                          // ISO IR starts at 760 nm …
    expect(names('cie-s017', 770e-9)).toEqual([]);                                       // … CIE IR-A at 780 nm
  });
  it('CIE ILV: UV-A/B/C and IR-A/B/C; an exact edge is flagged because the source does not state inclusivity', () => {
    expect(names('cie-s017', 300e-9)).toEqual(['UV-B']);
    expect(names('cie-s017', 254e-9)).toEqual(['UV-C']);
    expect(names('cie-s017', 1e-6)).toEqual(['IR-A']);
    expect(names('cie-s017', 10e-6)).toEqual(['IR-C']);
    const edge = bandsAt(getConvention('cie-s017')!, 315e-9);
    expect(edge.map((h) => h.band.symbol)).toEqual(['UV-B', 'UV-A']);
    expect(edge.every((h) => h.onEdge)).toBe(true);
  });
  it('detector IR scheme (Rogalski & Chrzanowski 2014): contiguous 0.78–1000 µm', () => {
    const rc = getConvention('rogalski-ir')!;
    expect(rc.bands!.map((b) => b.symbol)).toEqual(['NIR', 'SWIR', 'MWIR', 'LWIR', 'VLWIR', 'FIR', 'SubMM']);
    rc.bands!.forEach((b, i) => { if (i) expect(b.lo).toBe(rc.bands![i - 1].hi); });
    expect(names('rogalski-ir', 4e-6)).toEqual(['MWIR']);
    expect(names('rogalski-ir', 10e-6)).toEqual(['LWIR']);
  });
  it('ISO 20473 is listed as not available rather than filled in', () => {
    const iso = getConvention('iso-20473')!;
    expect(iso.status).toBe('not-available');
    expect(bandsAt(iso, 1e-6)).toEqual([]);
  });
  it('band wavelength spans are ordered short → long for frequency- and wavelength-defined conventions', () => {
    for (const cv of CONVENTIONS) for (const b of cv.bands ?? []) { const [a, z] = bandWavelengthsM(cv, b); expect(z).toBeGreaterThan(a); }
  });
});

describe('blackbody (Planck) and Wien displacement', () => {
  it('Wien constants derived from h, c, k match the CODATA listed values', () => {
    expect(WIEN_B).toBeCloseTo(2.897771955e-3, 12);
    expect(WIEN_B_FREQ / 5.878925757e10).toBeCloseTo(1, 9);
  });
  it('Stefan–Boltzmann σ derived from h, c, k = 5.670374419×10⁻⁸ W m⁻² K⁻⁴ (CODATA)', () => {
    expect(SIGMA_SB / 5.670374419e-8).toBeCloseTo(1, 9);
  });
  it('B_λ peaks at b/T and B_ν at x₃kT/h (they are different wavelengths)', () => {
    for (const T of [2.72548, 300, 5772]) {
      const lp = peakWavelength(T);
      expect(planckLambda(lp, T)).toBeGreaterThan(planckLambda(lp * 1.01, T));
      expect(planckLambda(lp, T)).toBeGreaterThan(planckLambda(lp * 0.99, T));
      const np = peakFrequency(T);
      expect(planckNu(np, T)).toBeGreaterThan(planckNu(np * 1.01, T));
      expect(planckNu(np, T)).toBeGreaterThan(planckNu(np * 0.99, T));
      expect(c / np).toBeGreaterThan(lp * 1.7);
    }
    expect(peakWavelength(5772) * 1e9).toBeCloseTo(502.04, 1);       // IAU nominal Sun
    expect(peakFrequency(2.72548) / 1e9).toBeCloseTo(160.23, 1);       // CMB (Fixsen 2009)
  });
  it('∫B_λ dλ · π = σT⁴ (numerical quadrature)', () => {
    const T = 1000; let s = 0;
    const a = Math.log(1e-7), b = Math.log(1e-2), N = 20000;
    for (let i = 0; i < N; i++) { const l = Math.exp(a + ((i + 0.5) * (b - a)) / N); s += planckLambda(l, T) * l * ((b - a) / N); }
    expect((Math.PI * s) / (SIGMA_SB * T ** 4)).toBeCloseTo(1, 4);
  });
});

describe('frequency-dependent material data (refractiveindex.info records)', () => {
  const silica = MATERIALS.find((m) => m.id === 'fused-silica')!;
  it('frequency is invariant across a boundary; λ and v scale by 1/n(λ₀)', () => {
    const lam0 = 589.3e-9, f = c / lam0, n = refractiveIndex(silica.refractiveIndex!, lam0 * 1e6)!;
    expect(n).toBeGreaterThan(1.45); expect(n).toBeLessThan(1.47);
    const m = inMedium(f, n);
    expect(m.f).toBe(f);
    expect(m.lambda).toBeCloseTo(lam0 / n, 18);
    expect(m.vPhase).toBeCloseTo(c / n, 3);
  });
  it('normal dispersion in the visible (n_blue > n_red) and null outside the validity range', () => {
    for (const id of ['fused-silica', 'sapphire', 'water', 'diamond']) {
      const ri = MATERIALS.find((x) => x.id === id)!.refractiveIndex!;
      expect(refractiveIndex(ri, 0.45)!, id).toBeGreaterThan(refractiveIndex(ri, 0.65)!);
    }
    expect(refractiveIndex(silica.refractiveIndex!, 0.1)).toBeNull();
    expect(refractiveIndex(silica.refractiveIndex!, 50)).toBeNull();
  });
});
