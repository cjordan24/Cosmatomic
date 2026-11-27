/**
 * Phase 7, Gate 7.5 — gravitational waves. The leading-order formulas of the LIGO/Virgo “basic physics of
 * GW150914” paper checked against the numbers that paper prints and against each other; the GWOSC catalog
 * (90 % intervals, release coverage, z(d_L) in the catalog cosmology); GW170817’s speed-of-gravity bounds
 * and standard-siren inputs.
 */
import { describe, expect, it } from 'vitest';
import {
  MPC_M, TSUN, chirpMass, chirpMassFromFfdot, compactnessRatio, cyclesBetween, detectorFrame, distanceEstimateMpc, energyRadiatedTo, fdot, frequencyAtTime,
  inspiralWaveform, iscoFrequency, luminosityAt, massesFromChirp, phaseToCoalescence, pnParameter, separationAt, speedDifference, strainAmplitude, timeToCoalescence,
} from '@/core/physics/gravitationalWaves';
import { iscoRadius, schwarzschildRadius } from '@/core/physics/relativity';
import { PLANCK18, luminosityDistanceMpc, redshiftAtLuminosityDistance } from '@/core/physics/cosmology';
import { CONSTANTS } from '@/core/constants/constants';
import { EVENTS, GW, GW150914_2016, GWTC_COSMOLOGY, WITH_PARAMS, eventByName, nameDate } from '@/modes/cosmic/universe/gw';
import { PHYSICS_MODULES } from '@/core/physics/modules';
import { getSource } from '@/shared/sources/sources';
import { getEntity, relationshipsFrom, relationshipsTo } from '@/shared/scientific-relationships/registry';

const GMSUN = CONSTANTS.GMsun.value, C = CONSTANTS.c.value, G = CONSTANTS.G.value;
const rel = (a: number, b: number) => Math.abs(a - b) / Math.abs(b);

describe('chirp mass and component masses (eqs. 6 and 10)', () => {
  it('equal masses: m = 2^(1/5) 𝓜, so 𝓜 = 30 M☉ gives 34.5 M☉ each (the paper rounds to 35)', () => {
    expect(chirpMass(35, 35)).toBeCloseTo(35 * 2 ** -0.2, 12);
    const { m1, m2 } = massesFromChirp(30, 1);
    expect(m1).toBeCloseTo(34.46, 2);
    expect(m2).toBeCloseTo(m1, 12);
    expect(Math.abs(m1 - GW.basicPhysics.equalMass.value)).toBeLessThan(1); // 34.46, printed as “35”
  });
  it('round trip 𝓜, q → m₁, m₂ → 𝓜 for q = 1.5 and 10, and M = 𝓜(1+q)^(6/5) q^(−3/5)', () => {
    for (const q of [1.5, 10]) {
      const { m1, m2 } = massesFromChirp(28, q);
      expect(m1 / m2).toBeCloseTo(q, 10);
      expect(chirpMass(m1, m2)).toBeCloseTo(28, 10);
      expect(m1 + m2).toBeCloseTo(28 * (1 + q) ** 1.2 * q ** -0.6, 9);
    }
  });
});

describe('frequency evolution (eqs. 7 and 8)', () => {
  it('eq. 7 inverts ḟ(𝓜, f) and eq. 8 inverts t_c − t(f)', () => {
    for (const [mc, f] of [[30, 35], [1.2, 100], [60, 20]]) {
      expect(chirpMassFromFfdot(f, fdot(mc, f))).toBeCloseTo(mc, 9);
      expect(frequencyAtTime(mc, timeToCoalescence(mc, f))).toBeCloseTo(f, 9);
    }
  });
  it('ḟ = (3/8) f / (t_c − t), the derivative of f ∝ (t_c − t)^(−3/8)', () => {
    const mc = 30, f = 80, tau = timeToCoalescence(mc, f);
    expect(fdot(mc, f)).toBeCloseTo((3 / 8) * (f / tau), 6);
  });
  it('the phase is 2π∫f dt: numerical integral of eq. 8 matches the closed form', () => {
    const mc = 25, t1 = 0.01, t2 = 0.3, n = 20000;
    let s = 0;
    for (let i = 0; i < n; i++) { const t = t1 + ((i + 0.5) * (t2 - t1)) / n; s += frequencyAtTime(mc, t); }
    const numeric = (2 * Math.PI * s * (t2 - t1)) / n;
    expect(rel(phaseToCoalescence(mc, t2) - phaseToCoalescence(mc, t1), numeric)).toBeLessThan(1e-6);
  });
  it('GW150914: 𝓜 = 30 M☉ takes ≈ 0.17 s from 35 Hz to coalescence; the paper sees ≈ 0.15 s of signal', () => {
    const B = GW.basicPhysics;
    const t = timeToCoalescence(B.chirpMass.value, B.band.lo);
    expect(t).toBeCloseTo(0.170, 3);
    expect(Math.abs(t - B.visibleDuration.value)).toBeLessThan(0.03);
  });
  it('cycles between two frequencies are additive and positive', () => {
    expect(cyclesBetween(30, 20, 60) + cyclesBetween(30, 60, 150)).toBeCloseTo(cyclesBetween(30, 20, 150), 9);
    expect(cyclesBetween(1.2, 20, 1500)).toBeGreaterThan(5000); // a neutron-star binary sweeps thousands of cycles
  });
});

describe('Keplerian orbit and compactness (eqs. 9–11)', () => {
  const B = GW.basicPhysics, M = 2 * massesFromChirp(B.chirpMass.value, 1).m1;
  it('separation at f_max = 150 Hz for M ≈ 70 M☉ is ≈ 350 km (eq. 9) and 1.7 Schwarzschild sums (§3)', () => {
    expect(separationAt(70, B.fMax.value) / 1000).toBeCloseTo(347, 0);
    expect(Math.abs(separationAt(M, B.fMax.value) / 1000 - B.separation.value)).toBeLessThan(10);
    expect(compactnessRatio(M, B.fMax.value)).toBeCloseTo(B.compactness.value, 1);
    expect(schwarzschildRadius(35 * GMSUN) / 1000).toBeCloseTo(103.4, 1); // “a Schwarzschild radius of 103 km”
  });
  it('eq. 11: compactness ≈ 3.0 q^(2/5)/(1+q)^(4/5) for 𝓜 = 30 M☉ and 150 Hz (coefficient rounded in the paper)', () => {
    for (const q of [1, 2, 5, 13]) {
      const { m1, m2 } = massesFromChirp(30, q);
      expect(rel(compactnessRatio(m1 + m2, 150), (3.0 * q ** 0.4) / (1 + q) ** 0.8)).toBeLessThan(0.03);
    }
  });
  it('the ISCO frequency puts the Keplerian separation exactly at 6GM/c² (relativity module)', () => {
    for (const M of [2.8, 70, 150]) expect(separationAt(M, iscoFrequency(M)) / iscoRadius(M * GMSUN)).toBeCloseTo(1, 10);
    expect(pnParameter(70, iscoFrequency(70))).toBeCloseTo(1 / 6, 10);
  });
});

describe('strain, luminosity, energy and distance (eqs. 4, A3, A4, 22, 23)', () => {
  it('h = 4(G𝓜)^(5/3)(πf)^(2/3)/(c⁴d_L) equals 4Gμr²ω²/(c⁴d_L) with Kepler’s law', () => {
    const m1 = 36, m2 = 29, f = 120, d = 410, M = m1 + m2, mu = (m1 * m2) / M, w = Math.PI * f, r = separationAt(M, f);
    const direct = (4 * G * ((mu * GMSUN) / G) * r * r * w * w) / (C ** 4 * d * MPC_M);
    expect(rel(strainAmplitude(chirpMass(m1, m2), f, d), direct)).toBeLessThan(1e-12);
  });
  it('GW150914 at 410 Mpc: the face-on amplitude at 150 Hz (the largest any orientation gives) exceeds the measured peak h ∼ 10⁻²¹, same order', () => {
    const h = strainAmplitude(detectorFrame(chirpMass(36, 29), 0.09), 150, 410);
    expect(h).toBeGreaterThan(GW.basicPhysics.hMax.value);
    expect(h).toBeLessThan(10 * GW.basicPhysics.hMax.value);
  });
  it('eq. A4 luminosity equals (32/5)(c⁵/G)(G𝓜ω/c³)^(10/3)', () => {
    const m1 = 20, m2 = 10, f = 200, w = Math.PI * f;
    expect(rel(luminosityAt(m1, m2, f), (32 / 5) * (C ** 5 / G) * (chirpMass(m1, m2) * TSUN * w) ** (10 / 3))).toBeLessThan(1e-9);
  });
  it('eq. 23: ≈ 2.6 M☉c² radiated down to 350 km for 35 + 35 M☉ (paper: ∼3 M☉c², a lower bound)', () => {
    const E = energyRadiatedTo(35, 35, 150);
    expect(E).toBeCloseTo(2.6, 1);
    expect(E).toBeLessThan(GW.basicPhysics.energy.value);
  });
  it('eq. 22: 150 Hz and h = 10⁻²¹ give ∼300 Mpc', () => {
    expect(distanceEstimateMpc(GW.basicPhysics.fMax.value, GW.basicPhysics.hMax.value)).toBeCloseTo(GW.basicPhysics.distance.value, 9);
  });
  it('the sampled waveform rises in frequency and amplitude and ends at the requested frequency', () => {
    const w = inspiralWaveform(30, 400, 35, 150, 500);
    expect(w).toHaveLength(500);
    expect(w[0].f).toBeCloseTo(35, 6);
    expect(w[499].f).toBeCloseTo(150, 6);
    expect(w.every((p, i) => i === 0 || p.f > w[i - 1].f)).toBe(true);
    expect(inspiralWaveform(30, 400, 50, 40)).toEqual([]);
  });
});

describe('GWOSC catalog', () => {
  it('391 events in five releases; 282 with parameters; medians with 90 % intervals', () => {
    expect(EVENTS).toHaveLength(391);
    expect(WITH_PARAMS).toHaveLength(282);
    expect(GW.releases.map((r) => r.key)).toEqual(['GWTC-1-confident', 'GWTC-2.1-confident', 'GWTC-3-confident', 'GWTC-4.1', 'GWTC-5.0']);
    expect(GW.releases.reduce((s, r) => s + r.count, 0)).toBe(391);
    expect(GW.interval).toMatch(/90 %/);
    for (const e of WITH_PARAMS) for (const k of ['m1', 'm2', 'Mc', 'dL', 'z'] as const) { const t = e[k]!; expect(t[1]).toBeGreaterThanOrEqual(0); expect(t[2]).toBeGreaterThanOrEqual(0); }
  });
  it('GW150914 is the GWTC-2.1 re-analysis (34.6, 30.0 → 61.5 M☉, 470 Mpc), inside the 2016 intervals', () => {
    const e = eventByName('GW150914')!;
    expect(e.r).toBe('GWTC-2.1-confident');
    expect(e.m1).toEqual([34.6, 2.6, 4.4]);
    expect(e.Mf).toEqual([61.5, 2.9, 3.4]);
    expect(e.dL).toEqual([470, 160, 140]);
    expect(GW150914_2016.m1).toEqual([36, 4, 5]);
    expect(GW150914_2016.source).toBe('abbott-2016-gw150914');
  });
  it('GW170817 keeps its GWTC-1 values: 1.186 M☉ chirp mass and a remnant ≤ 2.8 M☉ (upper bound)', () => {
    const e = eventByName('GW170817')!;
    expect(e.Mc).toEqual([1.186, 0.001, 0.001]);
    expect(e.Mf).toBeNull();
    expect(e.MfMax).toBe(2.8);
  });
  it('short common names resolve (GW190814 → GW190814_211039)', () => {
    expect(eventByName('GW190814')!.n).toBe('GW190814_211039');
    expect(eventByName('GW190814_211039')!.cn).toBe('GW190814');
  });
  it('every catalog z is z(median d_L) in flat ΛCDM with H₀ = 67.9, Ωm = 0.3065, within the printed rounding', () => {
    let n = 0;
    for (const e of WITH_PARAMS) {
      if (!e.dL || !e.z || e.n === 'GW170817') continue;
      const z = redshiftAtLuminosityDistance(e.dL[0], GWTC_COSMOLOGY)!;
      const tol = 0.005 + (redshiftAtLuminosityDistance(e.dL[0] * 1.025, GWTC_COSMOLOGY)! - redshiftAtLuminosityDistance(e.dL[0] * 0.975, GWTC_COSMOLOGY)!) / 2;
      expect(Math.abs(z - e.z[0]), e.n).toBeLessThanOrEqual(tol);
      n++;
    }
    expect(n).toBe(281);
  }, 60_000);
  it('redshiftAtLuminosityDistance inverts d_L(z)', () => {
    for (const z of [0.01, 0.3, 2]) expect(redshiftAtLuminosityDistance(luminosityDistanceMpc(z, PLANCK18), PLANCK18)).toBeCloseTo(z, 8);
    expect(redshiftAtLuminosityDistance(0, PLANCK18)).toBe(0);
    expect(redshiftAtLuminosityDistance(-1, PLANCK18)).toBeNull();
  });
  it('dates come from the names: GW200112_155838 is 2020-01-12 15:58:38 UTC (GWTC-3 Table I caption)', () => {
    expect(nameDate('GW200112_155838').iso).toBe('2020-01-12 15:58:38');
    expect(nameDate('GW150914').iso).toBe('2015-09-14');
    const years = EVENTS.map((e) => nameDate(e.n).year);
    expect(years.every((y, i) => i === 0 || y >= years[i - 1])).toBe(true); // GPS order = name order
  });
});

describe('GW170817 with light', () => {
  const Gr = GW.gw170817.grb, S = GW.gw170817.siren;
  it('reproduces the published speed bounds: +7 × 10⁻¹⁶ (simultaneous) and −3 × 10⁻¹⁵ (gamma rays 10 s later), D = 26 Mpc', () => {
    const up = speedDifference(Gr.delay.value + Gr.delay.sigma, Gr.distanceUsed.value);
    const lo = speedDifference(Gr.delay.value - Gr.delay.sigma - Gr.emissionLagAssumed.value, Gr.distanceUsed.value);
    expect(up).toBeCloseTo(6.69e-16, 18);
    expect(lo).toBeCloseTo(-3.11e-15, 17);
    expect(Number(up.toPrecision(1))).toBe(Gr.bounds.upper);
    expect(Number(lo.toPrecision(1))).toBe(Gr.bounds.lower);
    expect(Gr.delay.interval).toMatch(/^68 %/);
  });
  it('standard siren: v_H/d = 3017/43.8 = 68.9 km/s/Mpc against the posterior 70.0 +12.0/−8.0 (68.3 %)', () => {
    expect(S.hubbleVelocity.value / S.distance.value).toBeCloseTo(68.88, 2);
    expect(S.H0).toMatchObject({ value: 70.0, minus: 8.0, plus: 12.0 });
    expect(S.groupVelocity.value - S.bulkFlow.value).toBe(S.hubbleVelocity.value);
  });
});

describe('sources, registry and model module', () => {
  it('every source used by the gate is in the Source index with a verified author note', () => {
    for (const id of ['gwosc', 'gwtc-1', 'gwtc-2.1', 'gwtc-3', 'gwtc-5', 'gwtc-5-intro', 'abbott-2017-basic-physics', 'abbott-2017-grb', 'abbott-2017-h0', 'abbott-2016-gw150914']) {
      const s = getSource(id);
      expect(s, id).toBeDefined();
      expect(s!.authorBio, id).toBeTruthy();
      expect(s!.datasets, id).toContain('gravitational-waves');
    }
    for (const r of GW.releases) expect(getSource(r.source), r.key).toBeDefined();
    expect(getSource(GW.cosmology.source)).toBeDefined();
  });
  it('context:gravitational-waves is linked both ways with sourced edges', () => {
    expect(getEntity('context:gravitational-waves')?.route).toBe('#/cosmic/gw');
    const edges = [...relationshipsFrom('context:gravitational-waves'), ...relationshipsTo('context:gravitational-waves')];
    expect(edges.length).toBeGreaterThanOrEqual(5);
    for (const e of edges) expect(getSource(e.source), e.source).toBeDefined();
    expect(relationshipsTo('compact-object:psr-b1913').some((r) => r.from === 'context:gravitational-waves')).toBe(true);
  });
  it('the relativistic module lists the GW solvers and their validity limits', () => {
    const m = PHYSICS_MODULES.find((x) => x.id === 'relativistic')!;
    expect(m.version).toBe('1.1.0');
    expect(m.solvers.some((s) => s.includes('Gravitational waves'))).toBe(true);
    expect(m.validity.some((s) => s.includes('merger and ringdown are not modelled'))).toBe(true);
  });
});
