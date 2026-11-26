/**
 * Phase boundaries (Gate 4.4). Pressures in Pa, temperatures in K.
 *  Water: IAPWS SR1-86 vapour pressure; IAPWS R14-08 melting (ice Ih/III/V/VI/VII) and sublimation.
 *  CO₂: Span–Wagner coexistence table (interpolated); Antoine sublimation in its stated range only;
 *       melting curve not bundled.
 * Every boundary function returns null outside its validity range.
 */
import data from '@datasets/materials/phase-diagrams.json';

type Row = { T: number; pMPa: number; rhoL: number; rhoV: number; hL: number; hV: number; cL: number; cV: number };
export type Substance = 'water' | 'co2';
const D = data as unknown as {
  water: { name: string; critical: { T: number; pMPa: number }; triple: { T: number; pPa: number }; vaporPressure: { a: number[]; exponents: number[]; validK: [number, number] };
    melting: { phase: string; form: 'sum' | 'single' | 'log'; Tstar: number; pstarMPa: number; a: number[]; b: number[]; validK: [number, number]; uncertainty: string; eq: string }[];
    sublimation: { a: number[]; b: number[]; Tstar: number; pstarPa: number; validK: [number, number] }; saturationTable: { rows: Row[]; url: string } };
  co2: { name: string; critical: { T: number; pMPa: number }; triple: { T: number; pPa: number }; tripleMeasured: { T: number; pPa: number; reference: string } | null;
    sublimation: { A: number; B: number; C: number; validK: [number, number]; reference: string }; meltingNote: string; saturationTable: { rows: Row[]; url: string } };
  lennardJonesArgon: { epsilonOverK: number; sigmaAngstrom: number; massU: number; tripleK_ITS90: number };
};
export const PHASE_DATA = D;

const W = D.water;
/** IAPWS SR1-86 vapour pressure of water (Pa). */
export function waterVaporPressure(T: number): number | null {
  const [lo, hi] = W.vaporPressure.validK;
  if (T < lo - 1e-9 || T > hi + 1e-9) return null;
  const tau = 1 - T / W.critical.T;
  const s = W.vaporPressure.a.reduce((acc, a, i) => acc + a * tau ** W.vaporPressure.exponents[i], 0);
  return W.critical.pMPa * 1e6 * Math.exp((W.critical.T / T) * s);
}

/**
 * IAPWS R14-08 melting branches at temperature T. The melting curve is NOT single-valued in T:
 * between 251.165 K and 273.16 K the ice Ih branch (low pressure) coexists in temperature with the
 * ice III / ice V branches (high pressure). Returns every branch valid at T, lowest pressure first.
 */
export function waterMeltingBranches(T: number): { p: number; ice: string }[] {
  return W.melting.filter((m) => T >= m.validK[0] - 1e-9 && T <= m.validK[1] + 1e-9).map((seg) => {
    const th = T / seg.Tstar;
    let pi: number;
    if (seg.form === 'sum') pi = 1 + seg.a.reduce((s, a, i) => s + a * (1 - th ** seg.b[i]), 0);
    else if (seg.form === 'single') pi = 1 + seg.a[0] * (1 - th ** seg.b[0]);
    else pi = Math.exp(seg.a.reduce((s, a, i) => s + a * (1 - th ** seg.b[i]), 0));
    return { p: pi * seg.pstarMPa * 1e6, ice: seg.phase };
  }).sort((a, b) => a.p - b.p);
}
/** Melting pressure of the high-pressure ice branch at T (ice III/V/VI/VII), or ice Ih where it is the only branch. */
export function waterMeltingPressure(T: number): { p: number; ice: string } | null {
  const b = waterMeltingBranches(T);
  return b.length ? b[b.length - 1] : null;
}
/** Ice Ih melting pressure (Pa), 251.165–273.16 K. */
export function iceIhMeltingPressure(T: number): number | null {
  return waterMeltingBranches(T).find((b) => b.ice === 'ice Ih')?.p ?? null;
}

/** IAPWS R14-08 sublimation pressure of ice Ih (Pa). */
export function waterSublimationPressure(T: number): number | null {
  const s = W.sublimation;
  if (T < s.validK[0] || T > s.validK[1] + 1e-9) return null;
  const th = T / s.Tstar;
  return s.pstarPa * Math.exp((1 / th) * s.a.reduce((acc, a, i) => acc + a * th ** s.b[i], 0));
}

function interpRow(rows: Row[], T: number): Row | null {
  if (T < rows[0].T || T > rows[rows.length - 1].T) return null;
  for (let i = 0; i + 1 < rows.length; i++) if (T >= rows[i].T && T <= rows[i + 1].T) {
    const a = rows[i], b = rows[i + 1], u = (T - a.T) / (b.T - a.T || 1);
    const out = {} as Row;
    for (const k of Object.keys(a) as (keyof Row)[]) out[k] = k === 'pMPa' ? Math.exp(Math.log(a.pMPa) + u * (Math.log(b.pMPa) - Math.log(a.pMPa))) : a[k] + u * (b[k] - a[k]);
    return out;
  }
  return null;
}
/** Coexisting liquid/vapour properties from the reference-EOS table (interpolated; ln p interpolated). */
export const saturationState = (s: Substance, T: number) => interpRow(D[s].saturationTable.rows, T);

/** CO₂ vapour pressure along liquid–vapour coexistence (Pa), from the Span–Wagner table. */
export const co2VaporPressure = (T: number) => { const r = interpRow(D.co2.saturationTable.rows, T); return r ? r.pMPa * 1e6 : (Math.abs(T - D.co2.critical.T) < 1e-9 ? D.co2.critical.pMPa * 1e6 : null); };

/** CO₂ sublimation pressure from the Antoine fit (Pa), only inside its stated range. */
export function co2SublimationPressure(T: number): number | null {
  const s = D.co2.sublimation;
  if (T < s.validK[0] || T > s.validK[1]) return null;
  return 10 ** (s.A - s.B / (T + s.C)) * 1e5;
}

export const vaporPressure = (s: Substance, T: number) => (s === 'water' ? waterVaporPressure(T) : co2VaporPressure(T));
export const sublimationPressure = (s: Substance, T: number) => (s === 'water' ? waterSublimationPressure(T) : co2SublimationPressure(T));
export const criticalPoint = (s: Substance) => ({ T: D[s].critical.T, p: D[s].critical.pMPa * 1e6 });
export const triplePoint = (s: Substance) => ({ T: D[s].triple.T, p: D[s].triple.pPa });

export interface PhaseVerdict { phase: string; certain: boolean; note?: string }

/** Classify (T, p) using only the bundled boundaries. Ambiguous regions are reported, not guessed. */
export function classify(s: Substance, T: number, p: number): PhaseVerdict {
  const tp = triplePoint(s), cp = criticalPoint(s);
  const pv = T >= tp.T && T < cp.T ? vaporPressure(s, T) : null;
  if (pv && Math.abs(p / pv - 1) < 2e-3) return { phase: 'liquid + vapour (on the coexistence curve)', certain: true, note: `Within 0.2 % of the saturation pressure ${pv.toPrecision(6)} Pa: both phases can coexist; heat added goes into vaporisation, not temperature.` };
  if (T >= cp.T && p >= cp.p) return { phase: 'supercritical fluid', certain: true, note: 'Above both Tc and pc. Liquid and gas are no longer distinct phases.' };
  if (s === 'water') {
    const m = waterMeltingPressure(T);
    if (T < tp.T) {
      const ps = waterSublimationPressure(T);
      if (ps === null) return { phase: 'unknown', certain: false, note: 'Outside the validity of the bundled sublimation equation (50–273.16 K).' };
      if (p < ps) return { phase: 'vapour', certain: true };
      const pIh = iceIhMeltingPressure(T);
      if (pIh === null) return { phase: 'ice (polymorph not resolved)', certain: false, note: 'Below 251.165 K the boundaries between solid ice polymorphs (Ih, II, III …) are not bundled.' };
      if (p <= pIh) return { phase: 'ice Ih', certain: true };
      const hp = waterMeltingBranches(T).find((b) => b.ice !== 'ice Ih');
      if (hp && p >= hp.p) return { phase: hp.ice, certain: true, note: 'Above the high-pressure melting branch.' };
      return { phase: 'liquid', certain: true, note: 'Pressure-melted ice: liquid between the ice Ih and high-pressure ice melting branches.' };
    }
    if (m && p >= m.p) return { phase: m.ice, certain: true, note: 'Above the melting curve.' };
    if (T < cp.T) { const pv = waterVaporPressure(T)!; return { phase: p >= pv ? 'liquid' : 'vapour', certain: Math.abs(p / pv - 1) > 1e-6 }; }
    return { phase: 'gas (above Tc, below pc)', certain: true };
  }
  // CO₂
  if (T < tp.T) {
    const ps = co2SublimationPressure(T);
    if (ps === null) return { phase: 'solid or vapour', certain: false, note: `No bundled sublimation equation at ${T.toFixed(1)} K (Antoine fit covers ${D.co2.sublimation.validK.join('–')} K).` };
    return { phase: p < ps ? 'vapour' : 'solid', certain: true };
  }
  if (T < cp.T) {
    const pv = co2VaporPressure(T)!;
    if (p < pv) return { phase: 'vapour', certain: true };
    return { phase: 'liquid', certain: false, note: 'Liquid, provided the pressure is below the solid–liquid (melting) curve, which is not bundled.' };
  }
  return { phase: 'gas (above Tc, below pc)', certain: true };
}
