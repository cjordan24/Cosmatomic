/**
 * Curated reaction library + analysis of user-entered equations.
 * Data: datasets/chemistry/reactions.json (scripts/ingestion/curated-reactions.ts).
 */
import data from '@datasets/chemistry/reactions.json';
import { balanceEquation, conservation, parseEquation, speciesSignature, type Conservation, type Equation } from './equation';
import { FormulaError, hillKey, parseSpecies } from './formula';

export interface CuratedSpecies { c: number; s: string; name?: string; mol?: string }
export interface CuratedReaction {
  id: string; name: string;
  reactants: CuratedSpecies[]; products: CuratedSpecies[];
  reversible?: boolean; contexts: string[]; net: boolean; elementary?: boolean;
  conditions?: string; description: string; caveats?: string[]; relationships?: string[]; citation: string; sources: string[];
}

export const REACTIONS: CuratedReaction[] = (data as { reactions: CuratedReaction[] }).reactions;
export const getReaction = (id: string) => REACTIONS.find((r) => r.id === id);

export function toEquation(r: CuratedReaction): Equation {
  const terms = (xs: CuratedSpecies[]) => xs.map((x) => ({ coef: x.c, species: parseSpecies(x.s) }));
  return { reactants: terms(r.reactants), products: terms(r.products), reversible: !!r.reversible };
}

const SIGNATURES = new Map(REACTIONS.map((r) => [speciesSignature(toEquation(r)), r]));

/** Reactions that involve a given library molecule (for the molecule viewer). */
export const reactionsForMolecule = (molId: string) => REACTIONS.filter((r) => [...r.reactants, ...r.products].some((s) => s.mol === molId));

export type AnalysisStatus = 'parse-error' | 'curated' | 'balanced-unverified' | 'unbalanceable' | 'ambiguous' | 'infeasible' | 'unsupported';

export interface Analysis {
  status: AnalysisStatus;
  message: string;
  input?: Equation;
  /** conservation check of the coefficients exactly as entered */
  asEntered?: Conservation;
  /** smallest-integer balanced form (when one exists and is unique) */
  balanced?: Equation;
  match?: CuratedReaction;
  /** curated reactions containing all supplied reactants (lookup only, never a prediction) */
  candidates?: CuratedReaction[];
}

export function analyseInput(text: string): Analysis {
  let eq: Equation;
  try { eq = parseEquation(text); }
  catch (e) {
    if (e instanceof FormulaError && /No reaction arrow/.test(e.message)) {
      // reactants only, no arrow: treat as "what happens?" — which we do not predict
      try { eq = parseEquation(`${text} ->`); }
      catch (e2) { return { status: 'parse-error', message: (e2 as Error).message }; }
    } else return { status: 'parse-error', message: (e as Error).message };
  }
  if (eq.reactants.length === 0) return { status: 'parse-error', message: 'No reactants given.' };
  if (eq.products.length === 0) {
    const want = eq.reactants.map((t) => hillKey(t.species));
    const candidates = REACTIONS.filter((r) => { const have = toEquation(r).reactants.map((t) => hillKey(t.species)); return want.every((w) => have.includes(w)); });
    return {
      status: 'unsupported', input: eq, candidates,
      message: 'Product prediction is not supported. Voyager does not guess what reactants turn into — real outcomes depend on conditions, kinetics and mechanisms that a conservation engine cannot know. ' +
        (candidates.length ? `${candidates.length} curated reaction(s) contain these reactants:` : 'No curated reaction contains these reactants.'),
    };
  }
  const asEntered = conservation(eq);
  const { outcome, balanced } = balanceEquation(eq);
  const match = SIGNATURES.get(speciesSignature(eq));
  if (outcome.kind === 'unbalanceable') return { status: 'unbalanceable', input: eq, asEntered, message: 'No set of positive coefficients conserves every element and the net charge with these species. Check the formulas — a species is missing or wrong.' };
  if (outcome.kind === 'ambiguous') return { status: 'ambiguous', input: eq, asEntered, message: `Conservation alone does not fix the coefficients (${outcome.nullity} independent balanced combinations exist). This usually means two or more reactions are written as one; extra chemical information is needed.` };
  if (outcome.kind === 'infeasible') return { status: 'infeasible', input: eq, asEntered, message: 'The only conserving combination needs a negative coefficient — at least one species is on the wrong side of the arrow.' };
  if (match) return { status: 'curated', input: eq, asEntered, balanced: balanced!, match, message: `Matches the curated reaction “${match.name}”.` };
  return {
    status: 'balanced-unverified', input: eq, asEntered, balanced: balanced!,
    message: 'Balanced (atoms and charge conserved), but this reaction is not in the curated library: Voyager cannot say whether it actually occurs, under which conditions, or how fast.',
  };
}
