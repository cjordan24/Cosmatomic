/**
 * Isotope and nuclide data (IUPAC CIAAW natural composition + IAEA AMDC NUBASE).
 * Loaded lazily — the nuclide table is ~800 KiB and only needed in the element view.
 */
/** abundance: amount fraction; when CIAAW publishes an interval, abundance = midpoint and abundanceInterval = [lo, hi]. */
export interface NaturalIsotope { A: number; mass: number; massUnc: number | null; abundance: number | null; abundanceUnc: number | null; abundanceInterval: [number, number] | null; source: string }
export interface Nuclide { A: number; isomer: string | null; mass: number | null; stable: boolean; halfLife: string; halfLifeS: number | null; decay: string; year: number | null }
export interface ElementNuclides { natural: NaturalIsotope[]; nuclides: Nuclide[] }

let cache: Record<string, ElementNuclides> | null = null;
let pending: Promise<Record<string, ElementNuclides>> | null = null;

export function loadNuclides(): Promise<Record<string, ElementNuclides>> {
  if (cache) return Promise.resolve(cache);
  pending ??= import('@datasets/atomic/nuclides.json').then((m) => (cache = (m.default ?? m) as unknown as Record<string, ElementNuclides>));
  return pending;
}
export const nuclidesSync = () => cache;

/** Ground-state nuclides only (isomers excluded), for isotope selection. */
export const groundStates = (en: ElementNuclides) => en.nuclides.filter((n) => n.isomer === null);

/**
 * Default isotope for an element:
 *  1. the most abundant naturally occurring isotope, else
 *  2. the longest-lived ground-state nuclide (e.g. Tc-97/98, Og-294 …).
 * Never "round the atomic weight": e.g. Te (127.60) → most abundant is ¹³⁰Te, not ¹²⁸Te.
 */
export function defaultIsotope(en: ElementNuclides): { A: number; reason: 'most-abundant' | 'longest-lived' } | null {
  const nat = en.natural.filter((n) => (n.abundance ?? 0) > 0);
  if (nat.length) return { A: nat.reduce((a, b) => ((b.abundance ?? 0) > (a.abundance ?? 0) ? b : a)).A, reason: 'most-abundant' };
  const gs = groundStates(en);
  if (!gs.length) return null;
  const best = gs.reduce((a, b) => (halfLifeRank(b) > halfLifeRank(a) ? b : a));
  return { A: best.A, reason: 'longest-lived' };
}

const halfLifeRank = (n: Nuclide) => (n.stable ? Infinity : n.halfLifeS ?? -1);

export function longestLivedA(en: ElementNuclides): number | null {
  const gs = groundStates(en);
  if (!gs.length) return null;
  return gs.reduce((a, b) => (halfLifeRank(b) > halfLifeRank(a) ? b : a)).A;
}

export const neutronCount = (Z: number, A: number) => A - Z;

/** Human-readable decay-mode list from NUBASE strings like "β-=100" or "ec β+=96.1 (3); IT=3.9 (3)". */
export function decayModes(decay: string): { mode: string; percent: string | null }[] {
  if (!decay) return [];
  return decay.split(';').map((p) => p.trim()).filter((p) => p && !p.startsWith('IS=')).map((p) => {
    const [mode, pct] = p.split('=');
    return { mode: mode.trim(), percent: pct ? pct.trim() : null };
  });
}

/** Natural isotopic abundance from the IS= field (percent) for ground states. */
export function formatHalfLife(n: Nuclide): string {
  if (n.stable) return n.halfLife.length > 6 ? `stable ${n.halfLife.slice(6).trim()}` : 'stable';
  return n.halfLife.replace(/\s*\(\d+(\.\d+)?\)/, '').trim() || 'unknown';
}
