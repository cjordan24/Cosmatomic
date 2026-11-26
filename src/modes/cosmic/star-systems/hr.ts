/**
 * Hertzsprung–Russell diagrams — pure science (Gate 5.2).
 *
 *  Observational: absolute G magnitude vs G−RP colour, straight from CNS5 photometry and parallax.
 *  Theoretical:  log L vs T_eff. T_eff comes from the spectral type (dwarf calibration). L comes from
 *                the star's *measured* absolute magnitude, scaled from the calibration row:
 *                  log L = log L_cal − 0.4 (M_obs − M_cal)
 *                i.e. the star is assumed to share the bolometric correction of the mean dwarf of its
 *                type (BC depends mainly on T_eff). The solar M_bol zero point cancels.
 *  The Sun is placed from the IAU 2015 B3 nominal values (T_eff = 5772 K, L = L☉ by definition).
 */
import { CONSTANTS } from '@/core/constants/constants';
import { SIGMA_SB } from '@/core/physics/em/em';
import {
  DWARF_SEQUENCE, absoluteMag, calibrateDwarf, parseSpectralType,
  type Calibration, type CnsStar, type NearbyObject, type ObjectType,
} from './stars';

/** IAU 2015 Resolution B3 nominal solar effective temperature (K). */
export const TEFF_SUN_NOMINAL = 5772;
/** T_eff implied by the IAU nominal L☉ and R☉ through L = 4πR²σT⁴ (≈ 5772 K). */
export const TEFF_SUN_STEFAN = (CONSTANTS.Lsun.value / (4 * Math.PI * CONSTANTS.Rsun.value ** 2 * SIGMA_SB)) ** 0.25;

/** log₁₀(L/L☉) of a sphere of radius R (in R☉) radiating as a blackbody at T: L/L☉ = (R/R☉)²(T/T☉)⁴. */
export const logLForRadius = (rSun: number, teff: number) => 2 * Math.log10(rSun) + 4 * Math.log10(teff / TEFF_SUN_STEFAN);
/** Radius (R☉) from L and T through Stefan–Boltzmann. */
export const radiusFromLT = (logL: number, teff: number) => Math.sqrt(10 ** logL) * (TEFF_SUN_STEFAN / teff) ** 2;
/** Scale the calibration luminosity by the observed–calibrated magnitude difference. */
export const luminosityFromAbsMag = (mObs: number, mCal: number, logLCal: number) => logLCal - 0.4 * (mObs - mCal);

export interface HrStar {
  seq: number; name: string; type: ObjectType; spt: string;
  teff: number; logL: number; band: 'G' | 'V'; absMag: number; calMag: number;
  cal: Calibration; radius: number; flags: string[];
}
/**
 * Theoretical-HR point for a 10 pc object, or a reason why it has none. Measured Gaia G is used
 * first; otherwise Johnson V (so stars too bright for Gaia are placed with their V photometry,
 * never with an estimated or converted G).
 */
export function hrPoint(o: NearbyObject): HrStar | { reason: string } {
  if (o.type === 'exoplanet') return { reason: 'exoplanet' };
  if (o.type === 'white dwarf') return { reason: 'white dwarfs are not covered by the dwarf calibration' };
  const spt = parseSpectralType(o.spt);
  const cal = calibrateDwarf(spt);
  if (!cal || cal.values.Teff === null || cal.values.logL === null) return { reason: !o.spt ? 'no spectral type' : 'spectral type not calibrated' };
  const useG = o.G !== null && (o.gCode === 2 || o.gCode === 3) && cal.values.MG !== null;
  const useV = !useG && o.V !== null && cal.values.Mv !== null;
  if (!useG && !useV) return { reason: 'no measured G or V with a matching calibration' };
  const absMag = absoluteMag(useG ? o.G : o.V, o.plx)!;
  const calMag = (useG ? cal.values.MG : cal.values.Mv)!;
  const logL = luminosityFromAbsMag(absMag, calMag, cal.values.logL);
  const flags: string[] = [];
  if (Math.abs(absMag - calMag) > 1.5) flags.push(`observed M is ${(absMag - calMag).toFixed(1)} mag from the class V mean: unresolved binary, subgiant or wrong type?`);
  if (useV) flags.push('placed with Johnson V (no Gaia G)');
  return { seq: o.seq, name: o.name, type: o.type, spt: o.spt!, teff: cal.values.Teff, logL, band: useG ? 'G' : 'V', absMag, calMag, cal, radius: radiusFromLT(logL, cal.values.Teff), flags };
}

export interface CmdStar { cns5: number; colour: number; absG: number; fGRP: 0 | 1 | 2 | null; plx: number }
/** Observational point: (G−RP, M_G) from CNS5 resulting photometry; null without G or colour. */
export function cmdPoint(c: CnsStar): CmdStar | null {
  if (c.G === null || c.GRP === null) return null;
  return { cns5: c.cns5, colour: c.GRP, absG: absoluteMag(c.G, c.plx)!, fGRP: c.fGRP, plx: c.plx };
}

/**
 * Consistency check for Hipparcos-converted G (CNS5 flag 2): compare with the catalogue V plus the
 * calibrated G−V of the spectral type. Returns the difference (mag) or null when not testable.
 */
export function convertedGCheck(o: NearbyObject, c: CnsStar | undefined): number | null {
  if (!c || c.fGRP !== 2 || c.G === null || o.V === null) return null;
  const gv = calibrateDwarf(parseSpectralType(o.spt))?.values.GV ?? null;
  return gv === null ? null : c.G - (o.V + gv);
}

/** MK classes as covered by the dwarf sequence: T_eff span and mean mass/radius span of class V. */
export interface MkClass { cls: string; teffHot: number; teffCool: number; massHi: number | null; massLo: number | null; rHi: number | null; rLo: number | null; first: string; last: string }
export const MK_CLASSES: MkClass[] = 'OBAFGKMLTY'.split('').map((cls) => {
  const rows = DWARF_SEQUENCE.filter((r) => r.spt.startsWith(cls) && r.Teff !== null);
  const m = rows.map((r) => r.Msun).filter((x): x is number => x !== null), rr = rows.map((r) => r.R).filter((x): x is number => x !== null);
  return {
    cls, teffHot: rows[0].Teff!, teffCool: rows[rows.length - 1].Teff!, first: rows[0].spt, last: rows[rows.length - 1].spt,
    massHi: m.length ? Math.max(...m) : null, massLo: m.length ? Math.min(...m) : null, rHi: rr.length ? Math.max(...rr) : null, rLo: rr.length ? Math.min(...rr) : null,
  };
});
