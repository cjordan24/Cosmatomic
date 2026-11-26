/**
 * VGFF-1 validation: analytic gradients, invariances, convergence, and reproduction of
 * EXPERIMENTAL gas-phase geometries from crude builder starting guesses.
 * Reference values: CRC Handbook / NIST CCCBDB experimental structures.
 */
import { describe, expect, it } from 'vitest';
import { MOLECULES } from '@/modes/atomic/molecules/molecules';
import { buildForceField, energyGradient, optimise, perceiveAromatic } from '@/modes/atomic/laboratory/forcefield';
import { EMPTY, addAtom, addBondedAtom, addHydrogens, toggleBond, neighbours, type Structure } from '@/modes/atomic/laboratory/builder';
import { mulberry32 } from '@/core/simulation/random';

const lib = (name: string): Structure => { const m = MOLECULES.find((x) => x.name === name)!; return { atoms: m.atoms.map((a) => ({ ...a })), bonds: m.bonds.map((b) => ({ ...b })) }; };
const d = (s: Structure, i: number, j: number) => Math.hypot(s.atoms[i].x - s.atoms[j].x, s.atoms[i].y - s.atoms[j].y, s.atoms[i].z - s.atoms[j].z);
const ang = (s: Structure, i: number, j: number, k: number) => {
  const u = [0, 1, 2].map((t) => [s.atoms[i].x, s.atoms[i].y, s.atoms[i].z][t] - [s.atoms[j].x, s.atoms[j].y, s.atoms[j].z][t]);
  const v = [0, 1, 2].map((t) => [s.atoms[k].x, s.atoms[k].y, s.atoms[k].z][t] - [s.atoms[j].x, s.atoms[j].y, s.atoms[j].z][t]);
  return (Math.acos((u[0] * v[0] + u[1] * v[1] + u[2] * v[2]) / (Math.hypot(...u) * Math.hypot(...v))) * 180) / Math.PI;
};
const flat = (s: Structure) => new Float64Array(s.atoms.flatMap((a) => [a.x, a.y, a.z]));

describe('VGFF-1 analytic gradient', () => {
  it('matches central finite differences (rel. err < 1e-5) on randomly perturbed molecules', () => {
    const rand = mulberry32(99);
    for (const name of ['Ethanol', 'Benzene', 'Acetic acid', 'Glycine', 'Butane', 'Acetonitrile', 'Caffeine']) {
      const s = lib(name);
      const ff = buildForceField(s);
      const x = flat(s).map((v) => v + (rand() - 0.5) * 0.2);
      const g = new Float64Array(x.length);
      energyGradient(ff, x, g);
      const h = 1e-6;
      let num2 = 0, err2 = 0;
      for (let i = 0; i < x.length; i++) {
        const xp = Float64Array.from(x), xm = Float64Array.from(x);
        xp[i] += h; xm[i] -= h;
        const fd = (energyGradient(ff, xp) - energyGradient(ff, xm)) / (2 * h);
        num2 += fd * fd; err2 += (fd - g[i]) ** 2;
      }
      expect(Math.sqrt(err2 / num2), name).toBeLessThan(1e-5);
    }
  });
  it('energy is invariant under rigid translation and rotation (1e-9 rel.)', () => {
    const s = lib('Caffeine');
    const ff = buildForceField(s);
    const x = flat(s);
    const E = energyGradient(ff, x);
    const c = Math.cos(0.7), sn = Math.sin(0.7);
    const y = new Float64Array(x.length);
    for (let i = 0; i < x.length; i += 3) { y[i] = c * x[i] - sn * x[i + 1] + 5; y[i + 1] = sn * x[i] + c * x[i + 1] - 2; y[i + 2] = x[i + 2] + 1; }
    expect(Math.abs(energyGradient(ff, y) / E - 1)).toBeLessThan(1e-9);
  });
});

describe('VGFF-1 reproduces experimental geometries from builder starting guesses', () => {
  const build = (heavy: [number, number?, number?][]) => {
    let s = addAtom(EMPTY, heavy[0][0], [0, 0, 0]);
    for (let k = 1; k < heavy.length; k++) s = addBondedAtom(s, heavy[k][1] ?? k - 1, heavy[k][0]);
    return s;
  };
  it('water: O–H 0.958 Å (±0.02), H–O–H 104.5° (±1°)', () => {
    const r = optimise(addHydrogens(build([[8]]))).structure;
    expect(Math.abs(d(r, 0, 1) - 0.958)).toBeLessThan(0.02);
    expect(Math.abs(ang(r, 1, 0, 2) - 104.5)).toBeLessThan(1);
  });
  it('ammonia: H–N–H 106.7° (±1.5°); methane: H–C–H 109.47° (±0.5°), C–H 1.087 (±0.03)', () => {
    const nh3 = optimise(addHydrogens(build([[7]]))).structure;
    expect(Math.abs(ang(nh3, 1, 0, 2) - 106.7)).toBeLessThan(1.5);
    const ch4 = optimise(addHydrogens(build([[6]]))).structure;
    for (const [i, k] of [[1, 2], [1, 3], [2, 4]]) expect(Math.abs(ang(ch4, i, 0, k) - 109.47)).toBeLessThan(0.5);
    expect(Math.abs(d(ch4, 0, 1) - 1.087)).toBeLessThan(0.03);
  });
  it('ethane C–C 1.535 Å (±0.03); ethylene C=C 1.339 Å (±0.04), planar; acetylene C≡C 1.203 Å (±0.03), linear', () => {
    const ethane = optimise(addHydrogens(build([[6], [6]]))).structure;
    expect(Math.abs(d(ethane, 0, 1) - 1.535)).toBeLessThan(0.03);
    const ethylene = optimise(addHydrogens(toggleBond(build([[6], [6]]), 0, 1))).structure;
    expect(Math.abs(d(ethylene, 0, 1) - 1.339)).toBeLessThan(0.04);
    const hs = [...neighbours(ethylene, 0), ...neighbours(ethylene, 1)].filter((i) => ethylene.atoms[i].Z === 1);
    // planarity: all 6 atoms within 0.02 Å of the best plane through C=C and one H
    const P = (i: number) => [ethylene.atoms[i].x, ethylene.atoms[i].y, ethylene.atoms[i].z];
    const a = P(0), b = P(1), c = P(hs[0]);
    const u = b.map((v, t) => v - a[t]), v = c.map((w, t) => w - a[t]);
    const nrm = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
    const nl = Math.hypot(...nrm);
    for (const h of hs) expect(Math.abs(P(h).reduce((t, w, q) => t + (w - a[q]) * nrm[q], 0) / nl)).toBeLessThan(0.02);
    const acetylene = optimise(addHydrogens(toggleBond(toggleBond(build([[6], [6]]), 0, 1), 0, 1))).structure;
    expect(Math.abs(d(acetylene, 0, 1) - 1.203)).toBeLessThan(0.03);
    expect(Math.abs(ang(acetylene, 2, 0, 1) - 180)).toBeLessThan(1);
  });
  // CALIBRATION CHECK (not independent validation): the single resonance constant n = 1.25 was chosen on these two molecules.
  it('resonance calibration: formamide C–N 1.352 Å and formic acid C–OH 1.343 Å (experimental) within 0.025 Å', () => {
    const fa = optimise(lib('Formamide')).structure;
    const fm = MOLECULES.find((m) => m.name === 'Formamide')!;
    const cn = fm.bonds.find((b) => [fm.atoms[b.a].Z, fm.atoms[b.b].Z].sort().join() === '6,7')!;
    expect(Math.abs(d(fa, cn.a, cn.b) - 1.352)).toBeLessThan(0.025);
    const fo = optimise(lib('Formic acid')).structure;
    const fx = MOLECULES.find((m) => m.name === 'Formic acid')!;
    const co = fx.bonds.find((b) => b.order === 1 && [fx.atoms[b.a].Z, fx.atoms[b.b].Z].sort().join() === '6,8')!;
    expect(Math.abs(d(fo, co.a, co.b) - 1.343)).toBeLessThan(0.025);
  });
  it('benzene from a Kekulé structure: aromatic perception → six equal C–C bonds 1.397 Å (±0.02, spread < 0.005)', () => {
    let s = build([[6], [6], [6], [6], [6], [6]]);
    s = toggleBond(s, 5, 0); // close ring
    for (const [i, j] of [[0, 1], [2, 3], [4, 5]]) s = toggleBond(s, i, j); // alternate doubles
    s = addHydrogens(s);
    expect(perceiveAromatic(s).size).toBe(6);
    const r = optimise(s, { maxIter: 4000 }).structure;
    const cc = [0, 1, 2, 3, 4, 5].map((i) => d(r, i, (i + 1) % 6));
    for (const x of cc) expect(Math.abs(x - 1.397)).toBeLessThan(0.02);
    expect(Math.max(...cc) - Math.min(...cc)).toBeLessThan(0.005);
  });
});

describe('VGFF-1 optimiser behaviour', () => {
  it('converges (RMS gradient ≤ 1e-3) with monotonically non-increasing energy', () => {
    const r = optimise(lib('Glucose'));
    expect(r.converged).toBe(true);
    for (let i = 1; i < r.history.length; i++) expect(r.history[i]).toBeLessThanOrEqual(r.history[i - 1] + 1e-9);
  });
  it('PubChem (MMFF94s) conformers stay close: bond-length RMS change < 0.04 Å for ≥ 90 % of organic library molecules', () => {
    const organic = MOLECULES.filter((m) => m.atoms.every((a) => [1, 6, 7, 8, 9, 15, 16, 17, 35, 53].includes(a.Z)) && m.atoms.length <= 60 && m.atoms.every((a) => a.charge === 0));
    let good = 0;
    for (const m of organic) {
      const s = { atoms: m.atoms, bonds: m.bonds };
      const r = optimise(s, { maxIter: 600 }).structure;
      const rmsd = Math.sqrt(m.bonds.reduce((t, b) => t + (d(r, b.a, b.b) - d(s, b.a, b.b)) ** 2, 0) / m.bonds.length);
      if (rmsd < 0.04) good++;
    }
    expect(good / organic.length).toBeGreaterThanOrEqual(0.9);
  }, 30_000); // compute-bound; parallel Phase 6 workers can push it past the 5 s default
});
