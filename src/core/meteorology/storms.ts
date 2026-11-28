/**
 * Storm scales and indices (Phase 21): NHC Saffir-Simpson categories (kt), NWS Enhanced Fujita (3-s gust, mph),
 * NWS wind chill (°F, mph), NWS/WPC heat index (Rothfusz regression with adjustments), NWS blizzard criteria.
 */
/** Saffir-Simpson category from maximum sustained wind in knots (NHC), with the NHC stage names below hurricane strength. */
export function saffirSimpson(kt: number): { cat: number; label: string } {
  if (kt >= 137) return { cat: 5, label: 'Category 5 (major)' };
  if (kt >= 113) return { cat: 4, label: 'Category 4 (major)' };
  if (kt >= 96) return { cat: 3, label: 'Category 3 (major)' };
  if (kt >= 83) return { cat: 2, label: 'Category 2' };
  if (kt >= 64) return { cat: 1, label: 'Category 1' };
  if (kt >= 34) return { cat: 0, label: 'Tropical storm' };
  return { cat: -1, label: 'Tropical depression' };
}
export const ktToMph = (kt: number) => kt * 1.150779;
export const mphToKt = (mph: number) => mph / 1.150779;

/** Enhanced Fujita rating from an estimated 3-second gust (mph), NWS. */
export function efScale(mph: number): string {
  if (mph > 200) return 'EF5'; if (mph >= 166) return 'EF4'; if (mph >= 136) return 'EF3';
  if (mph >= 111) return 'EF2'; if (mph >= 86) return 'EF1'; if (mph >= 65) return 'EF0';
  return 'below EF0';
}

/** NWS wind chill (°F) from air temperature (°F) and wind (mph). */
export const windChillF = (T: number, V: number) => 35.74 + 0.6215 * T - 35.75 * V ** 0.16 + 0.4275 * T * V ** 0.16;

/** NWS heat index (°F) from temperature (°F) and relative humidity (%) — WPC procedure. */
export function heatIndexF(T: number, RH: number) {
  const simple = 0.5 * (T + 61.0 + (T - 68.0) * 1.2 + RH * 0.094);
  if ((simple + T) / 2 < 80) return { hi: (simple + T) / 2, method: 'simple' as const };
  let hi = -42.379 + 2.04901523 * T + 10.14333127 * RH - 0.22475541 * T * RH - 0.00683783 * T * T - 0.05481717 * RH * RH
    + 0.00122874 * T * T * RH + 0.00085282 * T * RH * RH - 0.00000199 * T * T * RH * RH;
  if (RH < 13 && T >= 80 && T <= 112) hi -= ((13 - RH) / 4) * Math.sqrt((17 - Math.abs(T - 95)) / 17);
  else if (RH > 85 && T >= 80 && T <= 87) hi += ((RH - 85) / 10) * ((87 - T) / 5);
  return { hi, method: 'regression' as const };
}

/** NWS blizzard: sustained wind or frequent gusts ≥ 35 mph, visibility frequently < ¼ mile, for ≥ 3 hours. */
export const isBlizzard = (windMph: number, visMi: number, hours: number) => windMph >= 35 && visMi <= 0.25 && hours >= 3;
