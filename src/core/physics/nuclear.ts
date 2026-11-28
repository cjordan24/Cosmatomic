/**
 * Nuclear binding (Phase 14, Gate 14.3).
 *
 *  - Binding energy from atomic masses: B(Z, A) = [Z·M(¹H) + N·mₙ − M(Z, A)]·c², with atomic masses (electrons
 *    included on both sides, so their masses cancel up to the small electron binding energies, neglected) from the
 *    bundled NUBASE2020 table, mₙ and the dalton from CODATA.
 *  - The semi-empirical (liquid-drop) mass formula with volume, surface, Coulomb, asymmetry and pairing terms:
 *      B = a_v A − a_s A^(2/3) − a_c Z(Z − 1)/A^(1/3) − a_a (A − 2Z)²/A + δ,   δ = ±a_p/A^(1/2) (even–even +,
 *    odd–odd −, odd A 0). Its coefficients are fitted here by linear least squares to the bundled masses (labelled
 *    derived); published coefficient sets are shown beside the fit where a source prints them.
 */
import { CONSTANTS } from '@/core/constants/constants';

/** Energy of one dalton in MeV (u c² / e). */
export const U_MEV = (CONSTANTS.u.value * CONSTANTS.c.value ** 2) / CONSTANTS.e.value / 1e6;
/** Neutron mass in daltons. */
export const MN_U = CONSTANTS.mn.value / CONSTANTS.u.value;

/** Binding energy (MeV) from the atomic mass (u); mH is the ¹H atomic mass (u). */
export const bindingEnergyMeV = (Z: number, A: number, massU: number, mH: number) => (Z * mH + (A - Z) * MN_U - massU) * U_MEV;

export interface Semf { av: number; as: number; ac: number; aa: number; ap: number; coulombZ2?: boolean }
const pairingSign = (Z: number, A: number) => (A % 2 === 1 ? 0 : Z % 2 === 0 ? 1 : -1);
/** The five terms (MeV) for (Z, A). */
export function semfTerms(Z: number, A: number, c: Semf) {
  return {
    volume: c.av * A,
    surface: -c.as * A ** (2 / 3),
    coulomb: (-c.ac * Z * (c.coulombZ2 ? Z : Z - 1)) / A ** (1 / 3),
    asymmetry: (-c.aa * (A - 2 * Z) ** 2) / A,
    pairing: (pairingSign(Z, A) * c.ap) / Math.sqrt(A),
  };
}
export const semf = (Z: number, A: number, c: Semf) => Object.values(semfTerms(Z, A, c)).reduce((s, v) => s + v, 0);

/** Least-squares fit of the five coefficients to measured binding energies. */
export function fitSemf(points: { Z: number; A: number; B: number }[]): Semf {
  const rows = points.map(({ Z, A }) => [A, -(A ** (2 / 3)), -(Z * (Z - 1)) / A ** (1 / 3), -((A - 2 * Z) ** 2) / A, pairingSign(Z, A) / Math.sqrt(A)]);
  const n = 5, M = Array.from({ length: n }, () => new Array(n + 1).fill(0));
  rows.forEach((r, k) => { for (let i = 0; i < n; i++) { for (let j = 0; j < n; j++) M[i][j] += r[i] * r[j]; M[i][n] += r[i] * points[k].B; } });
  // Gaussian elimination with partial pivoting
  for (let i = 0; i < n; i++) {
    let p = i; for (let r = i + 1; r < n; r++) if (Math.abs(M[r][i]) > Math.abs(M[p][i])) p = r;
    [M[i], M[p]] = [M[p], M[i]];
    for (let r = 0; r < n; r++) if (r !== i) { const f = M[r][i] / M[i][i]; for (let c = i; c <= n; c++) M[r][c] -= f * M[i][c]; }
  }
  const x = M.map((row, i) => row[n] / row[i]);
  return { av: x[0], as: x[1], ac: x[2], aa: x[3], ap: x[4] };
}

/** Root-mean-square residual (MeV). */
export const rmsResidual = (points: { Z: number; A: number; B: number }[], c: Semf) => Math.sqrt(points.reduce((s, p) => s + (p.B - semf(p.Z, p.A, c)) ** 2, 0) / points.length);

/** Q value (MeV) of a reaction from atomic masses (u): Σ inputs − Σ outputs. Using atomic masses, a β⁺ step's
 *  positron and the electron it annihilates with are included automatically (Q counts the annihilation energy). */
export const qValueMeV = (inputs: number[], outputs: number[]) => (inputs.reduce((s, m) => s + m, 0) - outputs.reduce((s, m) => s + m, 0)) * U_MEV;
