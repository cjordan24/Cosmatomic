/**
 * Voyager Physics Engine — geometric optics (Phase 10, Gate 10.1). Lengths in any consistent unit, angles in radians.
 *
 * Drude, The Theory of Optics (tr. Mann & Millikan, 1902; page images checked):
 *   Pt I ch. I §1, p. 3: “The reflected and refracted rays both lie in the plane of incidence. The angle of reflection …
 *     is equal to the angle of incidence”; sin φ / sin φ′ = n (eq. 1), n being “the index of refraction of the body
 *     with reference to the surrounding medium” (air unless stated); n_a sin φ_a = n_b sin φ_b (eq. 3).
 *   p. 5: total reflection when sin φ_a > n_b/n_a (eq. 6); “The refractive index depends on the color” (dispersion).
 *   Pt I ch. III §4, p. 42: thin lens 1/f = (n − 1)(1/r₁ − 1/r₂) (eq. 22), double-convex lenses have r₁ > 0, r₂ < 0;
 *     §5, p. 44: 1/e + 1/e′ = 1/f (eq. 25), e in front of the lens, e′ behind it.
 *   Pt I ch. III §2, p. 37: spherical mirror −1/e + 1/e′ = 2/r (eq. 12), f = −½r (eq. 13).
 * Southall, The Principles and Methods of Geometrical Optics (1910), ch. IV §70 eq. 25, p. 80: sin α₁ = n sin α₁′,
 *   n sin α₂ = sin α₂′, α₁′ − α₂ = β, deviation ε = α₁ − α₂′ − β; §71 eq. 27, p. 83: minimum deviation
 *   n = sin((β + ε₀)/2)/sin(β/2).
 * Exact ray tracing (derived): straight rays between surfaces; at each surface the law of refraction (or reflection) is
 *   applied in vector form, which is the same law written with the unit surface normal.
 * Conventions: the optical axis is x, light travels towards +x; a radius is positive when the centre of curvature lies
 *   on the +x side of the vertex (Drude's sign rule for r₁, r₂). The surrounding medium is air with n = 1, Drude's
 *   reference medium.
 * Validity: rays only (no diffraction or interference: Gate 10.2); meridional (2-D) rays; homogeneous isotropic media.
 */
export type Vec2 = [number, number];

/** Snell's law n_a sin φ_a = n_b sin φ_b. Returns φ_b, or null for total reflection (sin φ_a > n_b/n_a). */
export function refractAngle(na: number, nb: number, phiA: number): number | null {
  const s = (na / nb) * Math.sin(phiA);
  return Math.abs(s) > 1 ? null : Math.asin(s);
}
/** Critical angle of total reflection, sin φ_c = n_b/n_a; null unless n_a > n_b. */
export const criticalAngle = (na: number, nb: number): number | null => (na > nb ? Math.asin(nb / na) : null);

/** Thin lens (Drude eq. 22): focal length from the radii; null for a lens of zero power. */
export function lensmakerFocal(n: number, r1: number, r2: number): number | null {
  const p = (n - 1) * (1 / r1 - 1 / r2);
  return p === 0 ? null : 1 / p;
}
/** Thin-lens image distance from 1/e + 1/e′ = 1/f (Drude eq. 25); e′ < 0 is a virtual image in front of the lens. */
export function thinLensImage(f: number, e: number): number | null {
  const d = 1 / f - 1 / e;
  return d === 0 ? null : 1 / d;
}
/** Spherical mirror (Drude eqs. 12–13): f = −r/2; image distance e′ from −1/e + 1/e′ = 2/r (e′ < 0: real image in front). */
export const mirrorFocal = (r: number) => -r / 2;
export function mirrorImage(r: number, e: number): number | null {
  const d = 2 / r + 1 / e;
  return d === 0 ? null : 1 / d;
}

/** Prism deviation for incidence α₁ (Southall eq. 25, angles measured from the face normals); null if the ray is totally reflected at the second face. */
export function prismDeviation(n: number, beta: number, alpha1: number): number | null {
  const a1p = Math.asin(Math.sin(alpha1) / n);
  const a2 = a1p - beta;
  const s = n * Math.sin(a2);
  if (Math.abs(s) > 1) return null;
  const a2p = Math.asin(s);
  return alpha1 - a2p - beta;
}
/** Minimum deviation ε₀ from n = sin((β + ε₀)/2)/sin(β/2) (Southall eq. 27); null if no ray emerges at minimum deviation. */
export function minimumDeviation(n: number, beta: number): number | null {
  const s = n * Math.sin(beta / 2);
  return s > 1 ? null : 2 * Math.asin(s) - beta;
}

// ---------------------------------------------------------------- exact 2-D ray tracing
export interface Ray { p: Vec2; u: Vec2 }   // point and unit direction
const dot = (a: Vec2, b: Vec2) => a[0] * b[0] + a[1] * b[1];
const unit = (a: Vec2): Vec2 => { const l = Math.hypot(a[0], a[1]); return [a[0] / l, a[1] / l]; };

/** Vector form of the law of refraction: incident unit direction u, unit normal nrm (either orientation), η = n₁/n₂. Null = total reflection. */
export function refractVec(u: Vec2, nrm: Vec2, eta: number): Vec2 | null {
  let N = nrm, c = -dot(N, u);
  if (c < 0) { N = [-N[0], -N[1]]; c = -c; }
  const k = 1 - eta * eta * (1 - c * c);
  if (k < 0) return null;
  const a = eta * c - Math.sqrt(k);
  return unit([eta * u[0] + a * N[0], eta * u[1] + a * N[1]]);
}
/** Vector form of the law of reflection (angle of reflection = angle of incidence, in the plane of incidence). */
export function reflectVec(u: Vec2, nrm: Vec2): Vec2 {
  const d = 2 * dot(u, nrm);
  return unit([u[0] - d * nrm[0], u[1] - d * nrm[1]]);
}

/** A spherical (circle in 2-D) or plane (r = ±Infinity) surface with its vertex on the axis at x = vx. */
export interface Surface { vx: number; r: number; halfAperture: number }
/** Where a ray meets a surface (the intersection nearest the vertex), with the unit normal there; null if it misses or falls outside the aperture. */
export function hitSurface(ray: Ray, s: Surface): { p: Vec2; nrm: Vec2; t: number } | null {
  const { p, u } = ray;
  if (!Number.isFinite(s.r)) {
    if (Math.abs(u[0]) < 1e-15) return null;
    const t = (s.vx - p[0]) / u[0];
    if (t <= 1e-12) return null;
    const q: Vec2 = [s.vx, p[1] + t * u[1]];
    return Math.abs(q[1]) <= s.halfAperture ? { p: q, nrm: [-1, 0], t } : null;
  }
  const c: Vec2 = [s.vx + s.r, 0];
  const m: Vec2 = [p[0] - c[0], p[1] - c[1]];
  const b = dot(m, u), cc = dot(m, m) - s.r * s.r, disc = b * b - cc;
  if (disc < 0) return null;
  const sq = Math.sqrt(disc);
  const cands = [-b - sq, -b + sq].filter((t) => t > 1e-12).map((t) => ({ t, q: [p[0] + t * u[0], p[1] + t * u[1]] as Vec2 }));
  if (!cands.length) return null;
  // the cap of the sphere that contains the vertex: the intersection on the vertex side of the centre
  const best = cands.filter(({ q }) => Math.sign(q[0] - c[0]) === Math.sign(s.vx - c[0]) || Math.abs(q[0] - c[0]) < 1e-12).sort((a, b2) => a.t - b2.t)[0];
  if (!best || Math.abs(best.q[1]) > s.halfAperture) return null;
  return { p: best.q, nrm: unit([(best.q[0] - c[0]) / s.r, (best.q[1] - c[1]) / s.r]), t: best.t };
}

export interface Lens { r1: number; r2: number; thickness: number; diameter: number; n: number }
/** Trace one ray through a lens in air. Returns the polyline points and the ray leaving the second surface (null if blocked or totally reflected). */
export function traceLens(ray: Ray, L: Lens): { path: Vec2[]; out: Ray | null } {
  const h = L.diameter / 2;
  const s1: Surface = { vx: 0, r: L.r1, halfAperture: h }, s2: Surface = { vx: L.thickness, r: L.r2, halfAperture: h };
  const path: Vec2[] = [ray.p];
  const a = hitSurface(ray, s1);
  if (!a) return { path, out: null };
  path.push(a.p);
  const u1 = refractVec(ray.u, a.nrm, 1 / L.n);
  if (!u1) return { path, out: null };
  const b = hitSurface({ p: a.p, u: u1 }, s2);
  if (!b) return { path, out: null };
  path.push(b.p);
  const u2 = refractVec(u1, b.nrm, L.n);
  if (!u2) return { path, out: null };
  return { path, out: { p: b.p, u: u2 } };
}
/** x where a ray crosses the axis (y = 0); null if it is parallel to the axis. */
export const axisCrossing = (r: Ray): number | null => (Math.abs(r.u[1]) < 1e-15 ? null : r.p[0] - (r.p[1] * r.u[0]) / r.u[1]);

/** Focal points of a traced lens for a ray parallel to the axis at height h: the axis crossing (back focus) and the effective focal length h/tan θ. */
export function tracedFocus(L: Lens, h: number): { backFocus: number | null; efl: number | null } {
  const { out } = traceLens({ p: [-10 * Math.max(1, L.diameter), h], u: [1, 0] }, L);
  if (!out) return { backFocus: null, efl: null };
  return { backFocus: axisCrossing(out), efl: Math.abs(out.u[1]) < 1e-15 ? null : (-h * out.u[0]) / out.u[1] };
}
/** Image of an axial object point at distance e in front of the first vertex, from a near-axis traced ray; distance measured from the second vertex. */
export function tracedImage(L: Lens, e: number): number | null {
  const ang = Math.min(1e-4, (0.05 * L.diameter) / Math.max(e, 1e-9));
  const { out } = traceLens({ p: [-e, 0], u: unit([1, Math.tan(ang)]) }, L);
  if (!out) return null;
  const x = axisCrossing(out);
  return x === null ? null : x - L.thickness;
}

/** Concave spherical mirror (vertex at x = 0, centre of curvature at x = r < 0): a ray parallel to the axis at height h is reflected; returns the reflection point, direction and axis crossing. */
export function traceMirror(r: number, h: number, halfAperture: number): { hit: Vec2; u: Vec2; crossing: number | null } | null {
  const s: Surface = { vx: 0, r, halfAperture };
  const a = hitSurface({ p: [10 * r, h], u: [1, 0] }, s);
  if (!a) return null;
  const u = reflectVec([1, 0], a.nrm);
  return { hit: a.p, u, crossing: axisCrossing({ p: a.p, u }) };
}

/** Prism with apex at the origin pointing +y, apex angle β, faces symmetric about the y axis. Traces a ray hitting the first face at its midpoint (height −depth/2) with incidence α₁; returns the polyline and the deviation. */
export function tracePrism(n: number, beta: number, alpha1: number, depth = 1): { path: Vec2[]; deviation: number | null } {
  const half = beta / 2;
  const n1: Vec2 = [-Math.cos(half), Math.sin(half)];           // outward normal of the left face
  const n2: Vec2 = [Math.cos(half), Math.sin(half)];            // outward normal of the right face
  const m1: Vec2 = [-(depth / 2) * Math.tan(half), -depth / 2]; // midpoint of the left face
  // incoming direction makes angle α₁ with the inward normal −n1, rotated towards the apex side; the prism bends it towards the base
  const inward: Vec2 = [-n1[0], -n1[1]];
  const ca = Math.cos(alpha1), sa = Math.sin(alpha1);
  const uIn: Vec2 = unit([inward[0] * ca - inward[1] * sa, inward[0] * sa + inward[1] * ca]);
  const start: Vec2 = [m1[0] - uIn[0] * depth, m1[1] - uIn[1] * depth];
  const u1 = refractVec(uIn, n1, 1 / n);
  if (!u1) return { path: [start, m1], deviation: null };
  // second face: points q with dot(q, n2) = 0 (it passes through the apex)
  const t = -dot(m1, n2) / dot(u1, n2);
  const q: Vec2 = [m1[0] + t * u1[0], m1[1] + t * u1[1]];
  if (!(t > 0) || q[1] < -depth || q[1] > 0) return { path: [start, m1], deviation: null };
  const u2 = refractVec(u1, n2, n);
  if (!u2) return { path: [start, m1, q], deviation: null };
  const end: Vec2 = [q[0] + u2[0] * depth, q[1] + u2[1] * depth];
  const dev = Math.acos(Math.max(-1, Math.min(1, dot(uIn, u2))));
  return { path: [start, m1, q, end], deviation: dev };
}
