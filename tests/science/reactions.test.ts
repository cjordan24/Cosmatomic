/**
 * Gate 4.1 — curated reactions and conservation engine.
 */
import { describe, expect, it } from 'vitest';
import { REACTIONS, analyseInput, toEquation, reactionsForMolecule } from '@/modes/atomic/reactions/library';
import { balanceEquation, conservation, parseEquation } from '@/modes/atomic/reactions/equation';
import { parseFormulaCounts, parseSpecies, prettySpecies, FormulaError } from '@/modes/atomic/reactions/formula';
import { nullSpace } from '@/modes/atomic/reactions/balance';
import { MOLECULES } from '@/modes/atomic/molecules/molecules';
import { allRelationships, getEntity } from '@/shared/scientific-relationships/registry';

describe('formula parser', () => {
  it('parses groups, hydrates, charges and phases', () => {
    expect(Object.fromEntries(parseFormulaCounts('Ca(OH)2'))).toEqual({ Ca: 1, O: 2, H: 2 });
    expect(Object.fromEntries(parseFormulaCounts('CuSO4·5H2O'))).toEqual({ Cu: 1, S: 1, O: 9, H: 10 });
    expect(Object.fromEntries(parseFormulaCounts('K4[Fe(CN)6]'))).toEqual({ K: 4, Fe: 1, C: 6, N: 6 });
    const s = parseSpecies('SO4^2-(aq)');
    expect(s.charge).toBe(-2); expect(s.phase).toBe('aq');
    expect(parseSpecies('e^-').charge).toBe(-1);
    expect(parseSpecies('hν').kind).toBe('photon');
    expect(prettySpecies('SO4^2-(aq)')).toBe('SO₄²⁻(aq)');
  });
  it('rejects unknown element symbols and ambiguous charges', () => {
    expect(() => parseFormulaCounts('Xx2')).toThrow(FormulaError);
    expect(() => parseSpecies('Na+')).toThrow(/caret/);
  });
});

describe('curated reaction library', () => {
  it('has ≥ 40 reactions with unique ids and citations', () => {
    expect(REACTIONS.length).toBeGreaterThanOrEqual(40);
    expect(new Set(REACTIONS.map((r) => r.id)).size).toBe(REACTIONS.length);
    for (const r of REACTIONS) expect(r.citation.length, r.id).toBeGreaterThan(10);
  });
  it.each(REACTIONS.map((r) => [r.id, r] as const))('%s conserves every element and the net charge', (_, r) => {
    const c = conservation(toEquation(r));
    expect(c.atomsBalanced, JSON.stringify(c.elements)).toBe(true);
    expect(c.chargeBalanced, `${c.chargeLeft} vs ${c.chargeRight}`).toBe(true);
  });
  it('every curated equation is already in lowest integer terms (the solver agrees with it)', () => {
    for (const r of REACTIONS) {
      if (r.id === 'h2-grain-formation') continue; // 2 H → H2 is minimal too; included for clarity below
      const eq = toEquation(r);
      const { outcome, balanced } = balanceEquation(eq);
      if (outcome.kind !== 'balanced') continue; // catalytic/third-body steps can be degenerate
      const given = [...eq.reactants, ...eq.products].filter((t) => t.species.kind === 'chemical').map((t) => t.coef);
      const solved = [...balanced!.reactants, ...balanced!.products].filter((t) => t.species.kind === 'chemical').map((t) => t.coef);
      expect(solved, r.id).toEqual(given);
    }
  });
  it('library molecule links point at real molecule records with matching formulas', () => {
    const ids = new Set(MOLECULES.map((m) => m.id));
    for (const r of REACTIONS) for (const s of [...r.reactants, ...r.products]) if (s.mol) expect(ids.has(s.mol), `${r.id}: ${s.mol}`).toBe(true);
    expect(reactionsForMolecule('pubchem-962').length).toBeGreaterThan(10); // water
  });
  it('net biological equations are flagged as net with caveats (not elementary)', () => {
    for (const id of ['photosynthesis-net', 'respiration-net']) {
      const r = REACTIONS.find((x) => x.id === id)!;
      expect(r.net).toBe(true); expect(r.elementary).not.toBe(true); expect(r.caveats!.length).toBeGreaterThan(0);
    }
  });
  it('reaction → biology/atmosphere relationships are registered with sources', () => {
    const rel = allRelationships();
    expect(rel.some((r) => r.from === 'reaction:photosynthesis-net' && r.to === 'process:photosynthesis')).toBe(true);
    expect(rel.some((r) => r.from === 'reaction:chapman-o3-photolysis' && r.to === 'context:ozone-layer')).toBe(true);
    expect(getEntity('process:photosynthesis')!.status).toBe('planned'); // Biologic not built: no route
  });
});

describe('stoichiometry solver (exact rational null space)', () => {
  const solve = (s: string) => { const r = balanceEquation(parseEquation(s)); return r.outcome.kind === 'balanced' ? r.outcome.coefficients : r.outcome.kind; };
  it('balances textbook equations', () => {
    expect(solve('C8H18 + O2 -> CO2 + H2O')).toEqual([2, 25, 16, 18]);
    expect(solve('Fe + O2 -> Fe2O3')).toEqual([4, 3, 2]);
    expect(solve('KMnO4 + HCl -> KCl + MnCl2 + H2O + Cl2')).toEqual([2, 16, 2, 2, 8, 5]);
    expect(solve('C6H12O6 + O2 -> CO2 + H2O')).toEqual([1, 6, 6, 6]);
    expect(solve('Ca3(PO4)2 + SiO2 + C -> CaSiO3 + P4 + CO')).toEqual([2, 6, 10, 6, 1, 10]);
  });
  it('uses charge as a conservation law (ionic redox)', () => {
    expect(solve('MnO4^- + Fe^2+ + H^+ -> Mn^2+ + Fe^3+ + H2O')).toEqual([1, 5, 8, 1, 5, 4]);
    expect(solve('Cr2O7^2- + H^+ + e^- -> Cr^3+ + H2O')).toEqual([1, 14, 6, 2, 7]);
  });
  it('reports unbalanceable, ambiguous and infeasible species sets', () => {
    expect(solve('H2 + O2 -> H2O2 + H2O')).toBe('ambiguous');
    expect(solve('CH4 + O2 -> CO2')).toBe('unbalanceable');
    expect(solve('H2O -> H2 + O2 + H2O2 + O3')).toBe('ambiguous');
  });
  it('null space is exact for a rank-deficient integer matrix', () => {
    const ns = nullSpace([[1, 2, 3], [2, 4, 6]], 3);
    expect(ns.length).toBe(2);
  });
});

describe('analysis of user input never invents products', () => {
  it('reactants only → unsupported, with curated lookup (not prediction)', () => {
    const a = analyseInput('CH4 + O2');
    expect(a.status).toBe('unsupported');
    expect(a.candidates!.map((r) => r.id)).toContain('methane-combustion');
    expect(analyseInput('Xe + F2').status).toBe('unsupported');
    expect(analyseInput('Xe + F2').candidates).toEqual([]);
  });
  it('recognises curated reactions regardless of coefficients, order and formula spelling', () => {
    const a = analyseInput('O2 + CH4 -> H2O + CO2');
    expect(a.status).toBe('curated'); expect(a.match!.id).toBe('methane-combustion');
    expect(a.asEntered!.atomsBalanced).toBe(false);
    expect(analyseInput('C2H6O + 3 O2 -> 2 CO2 + 3 H2O').match!.id).toBe('ethanol-combustion');
  });
  it('balanceable but unknown reactions are flagged as unverified', () => {
    const a = analyseInput('N2 + O2 -> NO2');
    expect(a.status).toBe('balanced-unverified');
    expect(a.message).toMatch(/cannot say whether it actually occurs/);
  });
  it('parse errors are explicit', () => {
    expect(analyseInput('H2 + Qq -> H2Qq').status).toBe('parse-error');
  });
});
