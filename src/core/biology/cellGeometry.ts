/**
 * Cell geometry (Phase 11, Gate 11.4). Pure geometry, no biology: a cell is idealised as a sphere of diameter d.
 *   surface area  A = π d²        volume  V = π d³ / 6        A / V = 6 / d
 * So the surface grows as d², the volume as d³, and the surface available per unit volume falls as 1/d.
 * 1 µm³ = 1 fL (femtolitre). Real cells are not spheres (red blood cells are discs, neurons have long fibres);
 * the view says so wherever a quoted size is placed on these curves.
 */
export const sphereArea = (d: number) => Math.PI * d * d;
export const sphereVolume = (d: number) => (Math.PI * d ** 3) / 6;
export const surfaceToVolume = (d: number) => 6 / d;
/** Diameter of the sphere with the given volume. */
export const diameterForVolume = (v: number) => Math.cbrt((6 * v) / Math.PI);
/** Ratio of volumes of two spheres: (d₁/d₂)³. */
export const volumeRatio = (d1: number, d2: number) => (d1 / d2) ** 3;
