/**
 * Planetary atmospheres (Phase 22): scale height R*T/(M g) from a world's printed temperature, mean molecular weight
 * and gravity (a check on the fact sheets' own scale heights); greenhouse warming = mean surface temperature −
 * black-body temperature; giant-planet emitted ÷ absorbed = 1 + internal ÷ absorbed; pressure falling as e^(−z/H).
 */
const R = 8.314462618;
/** Scale height in km. */
export const scaleHeightKm = (T: number, mmw: number, g: number) => (R * T) / ((mmw / 1000) * g) / 1000;
export const greenhouseK = (tMean: number, tBlackBody: number) => tMean - tBlackBody;
export const emittedOverAbsorbed = (internalOverAbsorbed: number) => 1 + internalOverAbsorbed;
/** Pressure at height z (km) for an isothermal layer of scale height H (km). */
export const pressureAt = (p0: number, z: number, H: number) => p0 * Math.exp(-z / H);
