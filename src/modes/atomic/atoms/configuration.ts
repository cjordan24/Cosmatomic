/**
 * Electron configuration engine.
 *
 * Ground-state configurations come from the dataset (PubChem/NIST, including
 * the experimentally established exceptions such as Cr [Ar]4s1 3d5 and Cu
 * [Ar]4s1 3d10). From those we derive shells, valence counts, ion
 * configurations and Slater effective nuclear charges.
 */
export type L = 0 | 1 | 2 | 3;
export const L_LETTER = ['s', 'p', 'd', 'f'] as const;
export const SUBSHELL_CAPACITY = [2, 6, 10, 14] as const;

export interface Subshell { n: number; l: L; electrons: number }

const NOBLE_CORES: Record<string, string> = {
  He: '1s2',
  Ne: '1s2 2s2 2p6',
  Ar: '1s2 2s2 2p6 3s2 3p6',
  Kr: '1s2 2s2 2p6 3s2 3p6 3d10 4s2 4p6',
  Xe: '1s2 2s2 2p6 3s2 3p6 3d10 4s2 4p6 4d10 5s2 5p6',
  Rn: '1s2 2s2 2p6 3s2 3p6 3d10 4s2 4p6 4d10 5s2 5p6 4f14 5d10 6s2 6p6',
};

/** Parse "[Ar]4s2 3d6" (or with spaces/superscripts stripped) into subshells, sorted by (n, l). */
export function parseConfiguration(config: string): Subshell[] {
  let s = config.trim();
  const core = s.match(/^\[([A-Z][a-z]?)\]/);
  if (core) {
    const expansion = NOBLE_CORES[core[1]];
    if (!expansion) throw new Error(`Unknown noble-gas core [${core[1]}]`);
    s = `${expansion} ${s.slice(core[0].length)}`;
  }
  const out = new Map<string, Subshell>();
  for (const m of s.matchAll(/(\d)([spdf])(\d{1,2})/g)) {
    const n = Number(m[1]);
    const l = L_LETTER.indexOf(m[2] as (typeof L_LETTER)[number]) as L;
    const key = `${n}${l}`;
    const prev = out.get(key)?.electrons ?? 0;
    out.set(key, { n, l, electrons: prev + Number(m[3]) });
  }
  return sortSubshells([...out.values()]);
}

export const sortSubshells = (ss: Subshell[]) => [...ss].sort((a, b) => a.n - b.n || a.l - b.l);
export const totalElectrons = (ss: Subshell[]) => ss.reduce((t, s) => t + s.electrons, 0);
export const subshellLabel = (s: { n: number; l: L }) => `${s.n}${L_LETTER[s.l]}`;

/** Electrons per principal shell n (Bohr-diagram counts). */
export function shellOccupancy(ss: Subshell[]): number[] {
  const maxN = Math.max(0, ...ss.map((s) => s.n));
  const shells = new Array(maxN).fill(0);
  for (const s of ss) shells[s.n - 1] += s.electrons;
  return shells;
}

/** Madelung (n + l, then n) filling order — used only for adding electrons to anions. */
export const MADELUNG: { n: number; l: L }[] = (() => {
  const list: { n: number; l: L }[] = [];
  for (let n = 1; n <= 8; n++) for (let l = 0; l <= Math.min(3, n - 1); l++) list.push({ n, l: l as L });
  return list.sort((a, b) => a.n + a.l - (b.n + b.l) || a.n - b.n);
})();

/**
 * Configuration of an ion with net `charge` (positive = cation).
 * Cations: electrons are removed from the subshell with the highest n, then
 * highest l (so transition metals lose ns before (n−1)d — e.g. Fe²⁺ = [Ar]3d6).
 * Anions: electrons are added following Madelung order.
 * This is a standard textbook approximation; some ions deviate experimentally.
 */
export function ionConfiguration(neutral: Subshell[], charge: number): Subshell[] {
  const ss = neutral.map((s) => ({ ...s }));
  if (charge > 0) {
    let remove = charge;
    while (remove > 0) {
      const occupied = ss.filter((s) => s.electrons > 0);
      if (!occupied.length) throw new RangeError('Cannot remove more electrons than present');
      const target = occupied.reduce((a, b) => (b.n > a.n || (b.n === a.n && b.l > a.l) ? b : a));
      target.electrons--;
      remove--;
    }
  } else if (charge < 0) {
    let add = -charge;
    for (const slot of MADELUNG) {
      if (add === 0) break;
      let s = ss.find((x) => x.n === slot.n && x.l === slot.l);
      if (!s) { s = { ...slot, electrons: 0 }; ss.push(s); }
      const room = SUBSHELL_CAPACITY[s.l] - s.electrons;
      const k = Math.min(room, add);
      s.electrons += k;
      add -= k;
    }
  }
  return sortSubshells(ss.filter((s) => s.electrons > 0));
}

export function formatConfiguration(ss: Subshell[], useNobleCore = true): string {
  const sorted = sortSubshells(ss);
  if (useNobleCore) {
    for (const core of ['Rn', 'Xe', 'Kr', 'Ar', 'Ne', 'He']) {
      const coreSs = parseConfiguration(NOBLE_CORES[core]);
      const contains = coreSs.every((c) => sorted.some((s) => s.n === c.n && s.l === c.l && s.electrons >= c.electrons));
      if (contains && totalElectrons(sorted) > totalElectrons(coreSs)) {
        const rest = sorted
          .map((s) => { const c = coreSs.find((x) => x.n === s.n && x.l === s.l); return { ...s, electrons: s.electrons - (c?.electrons ?? 0) }; })
          .filter((s) => s.electrons > 0);
        return `[${core}] ${rest.map((s) => `${subshellLabel(s)}${sup(s.electrons)}`).join(' ')}`;
      }
    }
  }
  return sorted.map((s) => `${subshellLabel(s)}${sup(s.electrons)}`).join(' ');
}
const SUPS = '⁰¹²³⁴⁵⁶⁷⁸⁹';
const sup = (k: number) => String(k).split('').map((d) => SUPS[Number(d)]).join('');

/**
 * Valence electrons by convention:
 *  - s/p-block: electrons in the outermost shell (ns + np); He = 2.
 *  - d-block: ns + (n−1)d electrons (conventional; chemically ambiguous).
 *  - f-block: null — no single accepted definition.
 */
export function valenceElectrons(ss: Subshell[], block: 's' | 'p' | 'd' | 'f'): number | null {
  if (block === 'f') return null;
  const maxN = Math.max(...ss.map((s) => s.n));
  const outer = ss.filter((s) => s.n === maxN).reduce((t, s) => t + s.electrons, 0);
  if (block === 'd') return outer + ss.filter((s) => s.n === maxN - 1 && s.l === 2).reduce((t, s) => t + s.electrons, 0);
  return outer;
}

/**
 * Slater's rules (J. C. Slater, Phys. Rev. 36, 57 (1930)) effective nuclear charge
 * Z_eff = Z − σ for one electron in subshell (n, l).
 */
export function slaterZeff(Z: number, ss: Subshell[], target: { n: number; l: L }): number {
  const isSP = target.l <= 1;
  let sigma = 0;
  for (const s of ss) {
    let k = s.electrons;
    if (s.n === target.n && s.l === target.l) k -= 1; // exclude the electron itself
    if (k <= 0) continue;
    const sameGroup = isSP ? s.n === target.n && s.l <= 1 : s.n === target.n && s.l === target.l;
    if (sameGroup) { sigma += k * (target.n === 1 ? 0.3 : 0.35); continue; }
    if (isSP) {
      if (s.n === target.n - 1) sigma += k * 0.85;
      else if (s.n < target.n - 1) sigma += k * 1.0;
      // same-n d/f electrons lie "to the right" and do not shield s/p
    } else {
      const left = s.n < target.n || (s.n === target.n && s.l < target.l);
      if (left) sigma += k * 1.0;
    }
  }
  return Math.max(1, Z - sigma);
}

/** Count unpaired electrons per subshell by Hund's rule (orbital-box diagram). */
export function orbitalBoxes(s: Subshell): ('up' | 'pair' | 'empty')[] {
  const orbitals = 2 * s.l + 1;
  const boxes: ('up' | 'pair' | 'empty')[] = new Array(orbitals).fill('empty');
  for (let e = 0; e < s.electrons; e++) {
    const i = e % orbitals;
    boxes[i] = e < orbitals ? 'up' : 'pair';
  }
  return boxes;
}
