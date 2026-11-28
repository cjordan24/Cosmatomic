/**
 * Binding energies of every nuclide in the bundled NUBASE2020 table (ground states with a mass), and the liquid-drop
 * fit to the measured ones (A ≥ 16, stable or half-life ≥ 1 s) — Gate 14.3.
 */
import { bindingEnergyMeV, fitSemf, type Semf } from '@/core/physics/nuclear';
import nuclides from '@datasets/atomic/nuclides.json';
import elements from '@datasets/atomic/elements.json';

type N = { A: number; isomer: string | null; mass: number | null; stable: boolean; halfLifeS: number | null; halfLife: string; decay: string };
const D = nuclides as unknown as Record<string, { nuclides: N[] }>;
export const SYMBOL: Record<number, string> = Object.fromEntries((elements as unknown as { Z: number; symbol: string }[]).map((e) => [e.Z, e.symbol]));
const mH = D['1'].nuclides.find((n) => n.A === 1)!.mass!;

export interface Nuc { Z: number; A: number; N: number; B: number; perA: number; stable: boolean; halfLife: string; halfLifeS: number | null; decay: string; measured: boolean }
export const NUCS: Nuc[] = Object.entries(D).flatMap(([z, v]) => v.nuclides.filter((n) => !n.isomer && n.mass && n.A > 1).map((n) => {
  const Z = Number(z), B = bindingEnergyMeV(Z, n.A, n.mass!, mH);
  return { Z, A: n.A, N: n.A - Z, B, perA: B / n.A, stable: n.stable, halfLife: n.halfLife, halfLifeS: n.halfLifeS, decay: n.decay, measured: n.A >= 16 && (n.stable || (n.halfLifeS ?? 0) >= 1) };
}));
export const FIT: Semf = fitSemf(NUCS.filter((n) => n.measured));
export const nucLabel = (n: { Z: number; A: number }) => `${SYMBOL[n.Z] ?? '?'}-${n.A}`;
export const findNuc = (Z: number, A: number) => NUCS.find((n) => n.Z === Z && n.A === A);
