/** Minimal float64 3-vector algebra for physics code (kept separate from three.js float32 rendering types). */
export type Vec3 = [number, number, number];

export const v3 = (x = 0, y = 0, z = 0): Vec3 => [x, y, z];
export const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const scale = (a: Vec3, s: number): Vec3 => [a[0] * s, a[1] * s, a[2] * s];
export const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const cross = (a: Vec3, b: Vec3): Vec3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
export const norm = (a: Vec3) => Math.hypot(a[0], a[1], a[2]);
export const normalize = (a: Vec3): Vec3 => { const n = norm(a); return n === 0 ? [0, 0, 0] : scale(a, 1 / n); };
export const dist = (a: Vec3, b: Vec3) => norm(sub(a, b));
/** Angle between two vectors in radians (numerically stable atan2 form). */
export const angleBetween = (a: Vec3, b: Vec3) => Math.atan2(norm(cross(a, b)), dot(a, b));

export const DEG = Math.PI / 180;
export const wrap360 = (deg: number) => ((deg % 360) + 360) % 360;
export const wrap180 = (deg: number) => { const w = wrap360(deg); return w > 180 ? w - 360 : w; };

/** Rotate about the x axis by angle (rad). */
export const rotX = (v: Vec3, a: number): Vec3 => { const c = Math.cos(a), s = Math.sin(a); return [v[0], c * v[1] - s * v[2], s * v[1] + c * v[2]]; };
export const rotZ = (v: Vec3, a: number): Vec3 => { const c = Math.cos(a), s = Math.sin(a); return [c * v[0] - s * v[1], s * v[0] + c * v[1], v[2]]; };

/** Mean obliquity of the ecliptic at J2000 (IAU 2006): 84381.406″. */
export const OBLIQUITY_J2000_RAD = (84381.406 / 3600) * DEG;

/** Equatorial (ICRF) unit vector for right ascension / declination (deg) → ecliptic J2000 frame. */
export function raDecToEcliptic(raDeg: number, decDeg: number): Vec3 {
  const ra = raDeg * DEG, dec = decDeg * DEG;
  const eq: Vec3 = [Math.cos(dec) * Math.cos(ra), Math.cos(dec) * Math.sin(ra), Math.sin(dec)];
  return rotX(eq, -OBLIQUITY_J2000_RAD);
}
