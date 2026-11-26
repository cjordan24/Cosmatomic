/**
 * Chemical equations: parsing, conservation checks, and analysis of user input.
 *
 * Scientific rule (master spec): the engine NEVER invents products. Balancing only finds
 * coefficients for species the user supplied; a balanced equation is *stoichiometrically possible*,
 * not evidence that the reaction occurs. Reactions that are not in the curated library are
 * reported as unverified; reactant-only input is "unsupported" unless it matches curated entries.
 */
import { balance, type BalanceOutcome } from './balance';
import { FormulaError, hillKey, parseSpecies, type ParsedSpecies } from './formula';

export interface Term { coef: number; species: ParsedSpecies }
export interface Equation { reactants: Term[]; products: Term[]; reversible: boolean }

const ARROWS = /\s*(<=>|⇌|<->|->|→|=)\s*/;

/** Parse "2 H2 + O2 -> 2 H2O". Species are separated by " + " (spaces required, so charges like Na^+ stay intact). */
export function parseEquation(text: string): Equation {
  const m = text.match(ARROWS);
  if (!m) throw new FormulaError('No reaction arrow found (use ->, →, = or ⇌)');
  const [lhs, rhs] = [text.slice(0, m.index), text.slice(m.index! + m[0].length)];
  const reversible = m[1] === '<=>' || m[1] === '⇌' || m[1] === '<->';
  const side = (s: string): Term[] =>
    s.trim() === '' ? [] : s.split(/\s\+\s/).map((tok) => {
      const t = tok.trim();
      const cm = t.match(/^(\d+(?:\/\d+)?)\s*(?=[A-Za-zhν(\[])/);
      let coef = 1;
      let body = t;
      if (cm) {
        const [a, b] = cm[1].split('/').map(Number);
        coef = b ? a / b : a;
        body = t.slice(cm[0].length);
      }
      return { coef, species: parseSpecies(body) };
    });
  return { reactants: side(lhs), products: side(rhs), reversible };
}

export interface Conservation {
  /** per element: atoms on the reactant side and on the product side */
  elements: { el: string; left: number; right: number }[];
  chargeLeft: number;
  chargeRight: number;
  atomsBalanced: boolean;
  chargeBalanced: boolean;
}

const EPS = 1e-9;

export function conservation(eq: Equation): Conservation {
  const tally = (terms: Term[]) => {
    const m = new Map<string, number>();
    let q = 0;
    for (const { coef, species } of terms) {
      for (const [el, n] of species.atoms) m.set(el, (m.get(el) ?? 0) + coef * n);
      q += coef * species.charge;
    }
    return { m, q };
  };
  const L = tally(eq.reactants), Rr = tally(eq.products);
  const els = [...new Set([...L.m.keys(), ...Rr.m.keys()])].sort((a, b) => (a === 'C' ? -1 : b === 'C' ? 1 : a === 'H' ? -1 : b === 'H' ? 1 : a.localeCompare(b)));
  const elements = els.map((el) => ({ el, left: L.m.get(el) ?? 0, right: Rr.m.get(el) ?? 0 }));
  return {
    elements, chargeLeft: L.q, chargeRight: Rr.q,
    atomsBalanced: elements.every((e) => Math.abs(e.left - e.right) < EPS),
    chargeBalanced: Math.abs(L.q - Rr.q) < EPS,
  };
}

/** Balance the species of an equation (coefficients the user typed are ignored). Photons and third bodies keep coefficient 1. */
export function balanceEquation(eq: Equation): { outcome: BalanceOutcome; balanced: Equation | null } {
  const all = [...eq.reactants.map((t) => ({ t, side: 1 as const })), ...eq.products.map((t) => ({ t, side: -1 as const }))];
  const active = all.filter(({ t }) => t.species.kind === 'chemical' || t.species.kind === 'electron');
  const cols = active.map(({ t }) => { const m = new Map(t.species.atoms); if (t.species.charge) m.set('⊕', t.species.charge); return m; });
  const outcome = balance(cols, active.map((a) => a.side));
  if (outcome.kind !== 'balanced') return { outcome, balanced: null };
  const coefOf = new Map(active.map((a, i) => [a.t, outcome.coefficients[i]]));
  const remap = (terms: Term[]) => terms.map((t) => ({ coef: coefOf.get(t) ?? 1, species: t.species }));
  return { outcome, balanced: { reactants: remap(eq.reactants), products: remap(eq.products), reversible: eq.reversible } };
}

export function formatEquation(eq: Equation, pretty: (raw: string) => string = (s) => s): string {
  const side = (ts: Term[]) => ts.map((t) => `${t.coef === 1 ? '' : `${t.coef} `}${pretty(t.species.raw.trim())}`).join(' + ');
  return `${side(eq.reactants)} ${eq.reversible ? '⇌' : '→'} ${side(eq.products)}`;
}

/** Order-independent identity of the species set (phases ignored, Hill formulas compared). */
export function speciesSignature(eq: Equation): string {
  const key = (ts: Term[]) => ts.map((t) => hillKey(t.species)).sort().join('+');
  return `${key(eq.reactants)}>${key(eq.products)}`;
}
