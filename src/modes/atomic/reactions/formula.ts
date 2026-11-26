/**
 * Chemical species parser.
 *
 *   formula[^charge][(phase)]
 *     CH4(g)  Ca(OH)2(aq)  CuSO4·5H2O(s)  Fe^3+(aq)  SO4^2-  e^-  CH3COO^-(aq)
 *   hν / hv   → photon (no atoms, no charge)
 *   M         → unspecified third body in a termolecular step (no atoms, no charge)
 *
 * Element symbols are validated against the 118-element table, so a typo such as "Xx" is an error,
 * never silently accepted.
 */
const SYMBOLS = new Set(('H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar K Ca Sc Ti V Cr Mn Fe Co Ni Cu Zn Ga Ge As Se Br Kr Rb Sr Y Zr Nb Mo Tc Ru Rh Pd Ag Cd In Sn Sb Te I Xe ' +
  'Cs Ba La Ce Pr Nd Pm Sm Eu Gd Tb Dy Ho Er Tm Yb Lu Hf Ta W Re Os Ir Pt Au Hg Tl Pb Bi Po At Rn Fr Ra Ac Th Pa U Np Pu Am Cm Bk Cf Es Fm Md No Lr Rf Db Sg Bh Hs Mt Ds Rg Cn Nh Fl Mc Lv Ts Og').split(' '));

export type Phase = 's' | 'l' | 'g' | 'aq' | 'cr';
export type SpeciesKind = 'chemical' | 'photon' | 'third-body' | 'electron';

export interface ParsedSpecies {
  raw: string;
  /** formula without charge or phase */
  formula: string;
  kind: SpeciesKind;
  atoms: Map<string, number>;
  charge: number;
  phase: Phase | null;
}

export class FormulaError extends Error {}

/** Parse a bare formula (no charge/phase) into element counts. Supports (), [], hydrate dots and nested groups. */
export function parseFormulaCounts(f: string): Map<string, number> {
  const parts = f.split(/[·•*.]/).filter(Boolean);
  const total = new Map<string, number>();
  for (const part of parts) {
    const m = part.match(/^(\d+)(.*)$/);
    const mult = m ? Number(m[1]) : 1;
    const counts = parseGroup(m ? m[2] : part);
    for (const [el, n] of counts) total.set(el, (total.get(el) ?? 0) + n * mult);
  }
  if (total.size === 0) throw new FormulaError(`Empty formula “${f}”`);
  return total;
}

function parseGroup(s: string): Map<string, number> {
  let i = 0;
  const stack: Map<string, number>[] = [new Map()];
  const add = (m: Map<string, number>, el: string, n: number) => m.set(el, (m.get(el) ?? 0) + n);
  const readNum = () => { const m = s.slice(i).match(/^\d+/); if (!m) return 1; i += m[0].length; return Number(m[0]); };
  while (i < s.length) {
    const ch = s[i];
    if (ch === '(' || ch === '[') { stack.push(new Map()); i++; continue; }
    if (ch === ')' || ch === ']') {
      if (stack.length < 2) throw new FormulaError(`Unbalanced bracket in “${s}”`);
      i++;
      const n = readNum();
      const g = stack.pop()!;
      for (const [el, c] of g) add(stack[stack.length - 1], el, c * n);
      continue;
    }
    const m = s.slice(i).match(/^[A-Z][a-z]?/);
    if (!m) throw new FormulaError(`Unexpected “${ch}” in formula “${s}”`);
    // prefer a two-letter symbol only if it exists (e.g. "Co" vs "CO" is handled by case already)
    let sym = m[0];
    if (sym.length === 2 && !SYMBOLS.has(sym)) sym = sym[0];
    if (!SYMBOLS.has(sym)) throw new FormulaError(`Unknown element symbol “${sym}” in “${s}”`);
    i += sym.length;
    add(stack[stack.length - 1], sym, readNum());
  }
  if (stack.length !== 1) throw new FormulaError(`Unbalanced bracket in “${s}”`);
  return stack[0];
}

/** Parse a species token. */
export function parseSpecies(raw: string): ParsedSpecies {
  let s = raw.trim();
  if (!s) throw new FormulaError('Empty species');
  if (s === 'hν' || s === 'hv' || s === 'hnu') return { raw, formula: 'hν', kind: 'photon', atoms: new Map(), charge: 0, phase: null };
  if (s === 'M') return { raw, formula: 'M', kind: 'third-body', atoms: new Map(), charge: 0, phase: null };
  let phase: Phase | null = null;
  const pm = s.match(/\((s|l|g|aq|cr)\)$/);
  if (pm) { phase = pm[1] as Phase; s = s.slice(0, -pm[0].length); }
  let charge = 0;
  const cm = s.match(/\^(\d*)([+-])$/);
  if (cm) { charge = (cm[1] ? Number(cm[1]) : 1) * (cm[2] === '+' ? 1 : -1); s = s.slice(0, -cm[0].length); }
  else if (/[+-]$/.test(s) && s !== 'e-') throw new FormulaError(`Write charges with a caret, e.g. “Fe^3+” or “Cl^-” (got “${raw}”)`);
  if (s === 'e' || s === 'e-') {
    if (s === 'e-') charge = -1;
    if (charge !== -1) throw new FormulaError('An electron must be written e^-');
    return { raw, formula: 'e', kind: 'electron', atoms: new Map(), charge: -1, phase: null };
  }
  return { raw, formula: s, kind: 'chemical', atoms: parseFormulaCounts(s), charge, phase };
}

/** Hill-ordered formula string for comparing species regardless of how they were written (CH3COOH ≡ C2H4O2). */
export function hillKey(sp: ParsedSpecies): string {
  if (sp.kind !== 'chemical') return sp.formula;
  const keys = [...sp.atoms.keys()].sort();
  const order = sp.atoms.has('C') ? ['C', ...(sp.atoms.has('H') ? ['H'] : []), ...keys.filter((k) => k !== 'C' && k !== 'H')] : keys;
  const q = sp.charge === 0 ? '' : `^${Math.abs(sp.charge) > 1 ? Math.abs(sp.charge) : ''}${sp.charge > 0 ? '+' : '-'}`;
  return order.map((k) => `${k}${sp.atoms.get(k)! > 1 ? sp.atoms.get(k) : ''}`).join('') + q;
}

const SUB = '₀₁₂₃₄₅₆₇₈₉';
const SUP: Record<string, string> = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '+': '⁺', '-': '⁻' };

/** Display string with subscripts and superscript charge: "SO4^2-(aq)" → "SO₄²⁻(aq)". */
export function prettySpecies(raw: string, withPhase = true): string {
  let s = raw.trim();
  let phase = '';
  const pm = s.match(/\((s|l|g|aq|cr)\)$/);
  if (pm) { phase = pm[0]; s = s.slice(0, -pm[0].length); }
  let charge = '';
  const cm = s.match(/\^(\d*[+-])$/);
  if (cm) { charge = cm[1].split('').map((c) => SUP[c] ?? c).join(''); s = s.slice(0, -cm[0].length); }
  // subscript digits that follow an element symbol or closing bracket (not hydrate multipliers after '·')
  const body = s.replace(/([A-Za-z)\]])(\d+)/g, (_, a: string, d: string) => a + d.split('').map((x) => SUB[Number(x)]).join(''));
  return body + charge + (withPhase ? phase : '');
}
