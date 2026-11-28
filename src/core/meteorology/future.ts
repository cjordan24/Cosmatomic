/**
 * Future climate (Gate 24.2): small helpers that keep projections tied to their conditions.
 * No function here produces a new projection; each restates or rearranges a printed one and says which.
 */

export interface Range { lo: number; hi: number; derived: boolean }

/**
 * Projected US average warming (°F) at a global warming level, from NCA5 Ch. 2: “very likely” 4.4–5.6 °F at 2 °C and
 * “around 2.5°F” for “every additional 1°C”. Printed at 2 °C; above 2 °C our extrapolation of that rule (derived);
 * below 2 °C the rule says nothing, so null.
 */
export function usWarmingF(gwl: number, at2: { lo: number; hi: number; perC: number }): Range | null {
  if (gwl < 2) return null;
  if (gwl === 2) return { lo: at2.lo, hi: at2.hi, derived: false };
  const add = at2.perC * (gwl - 2);
  return { lo: at2.lo + add, hi: at2.hi + add, derived: true };
}

export const m2ft = (m: number) => m / 0.3048;
export const f2c = (dF: number) => (dF * 5) / 9;

/** Ratio of hydrogen-ion concentrations between two pH values (10^(pH₁ − pH₂)). */
export const hydrogenRatio = (from: number, to: number) => 10 ** (from - to);

/** Parse a printed probability like “>99%”, “<1%” or “37%” into bounds (0–1). */
export function parseProb(p: string): { lo: number; hi: number } {
  const v = Number(p.replace(/[<>%\s]/g, '')) / 100;
  if (p.trim().startsWith('>')) return { lo: v, hi: 1 };
  if (p.trim().startsWith('<')) return { lo: 0, hi: v };
  return { lo: v, hi: v };
}
