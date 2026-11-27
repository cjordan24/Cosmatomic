/**
 * Voyager Physics Engine — radio waves in a rectangular room (Phase 9, Gate 9.3). SI units; phasors e^{+jωt}.
 *
 * Materials (Recommendation ITU-R P.2040-4, §3, Table 3; datasets/spectral/building-materials.json):
 *   ε′ = a f^b, σ = c f^d (f in GHz), ε″ = 17.98 σ/f, complex relative permittivity ε_rc = ε′ − jε″   (eqs. 57–59, 10)
 * Reflection of a plane wave incident from air at angle θ (P.2040 eqs. 37a, 37b):
 *   R_TE = (cos θ − √(ε_rc − sin²θ)) / (cos θ + √(ε_rc − sin²θ))
 *   R_TM = (ε_rc cos θ − √(ε_rc − sin²θ)) / (ε_rc cos θ + √(ε_rc − sin²θ))
 * Single-layer slab of thickness d in air (eqs. 43a, 43b, 44):
 *   R = R′(1 − e^{−j2q}) / (1 − R′² e^{−j2q}),  T = (1 − R′²) e^{−jq} / (1 − R′² e^{−j2q}),  q = (2πd/λ) √(ε_rc − sin²θ)
 * Ray geometry: the image method for a box. Specular paths with up to N reflections are straight lines from an image
 *   of the transmitter to the receiver in “unfolded” space; the reflection points are where that line crosses the
 *   wall planes, folded back into the room. Every reflection off the same pair of walls has the same angle.
 * Fields: the transmitter is a z-directed half-wave dipole, E_θ = jη₀I₀/(2π) cos[(π/2)cosθ]/sinθ e^{−jβr}/r (Ellingson eq. 9.102),
 *   with I₀ set by P_T = ½|I₀|²R_rad. The field vector is carried along each ray: at every wall it is split into
 *   the TE part (⊥ to the plane of incidence) and the TM part, multiplied by R_TE and R_TM and recombined; the
 *   amplitude falls as 1/(total path length). The receiver is a z-directed half-wave dipole: V = Σ E·l_e with
 *   l_e = θ̂ λ·[(1/λ)∫I(z′)e^{jβz′cosθ}dz′/I₀]·sinθ (Ellingson eqs. 10.113–10.114), received power |V|²/(8R_rad).
 * Validity: geometric optics (specular reflection only, no diffraction or scattering), plane-wave coefficients applied
 *   to spherical waves, smooth homogeneous walls, an empty room, far field of both dipoles; transmission through
 *   the walls is computed for information but nothing outside the room is modelled.
 */
import { CONSTANTS } from '@/core/constants/constants';
import { ETA0, HWD, filamentIntegral, patternStats, dipolePattern } from './antennas';
import data from '@datasets/spectral/building-materials.json';

// ---------------------------------------------------------------- complex numbers and complex 3-vectors
export type Cx = [number, number];
export const cx = (re: number, im = 0): Cx => [re, im];
export const cadd = (a: Cx, b: Cx): Cx => [a[0] + b[0], a[1] + b[1]];
export const csub = (a: Cx, b: Cx): Cx => [a[0] - b[0], a[1] - b[1]];
export const cmul = (a: Cx, b: Cx): Cx => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
export const cdiv = (a: Cx, b: Cx): Cx => { const d = b[0] * b[0] + b[1] * b[1]; return [(a[0] * b[0] + a[1] * b[1]) / d, (a[1] * b[0] - a[0] * b[1]) / d]; };
export const cabs = (a: Cx) => Math.hypot(a[0], a[1]);
export const cexpj = (ph: number): Cx => [Math.cos(ph), Math.sin(ph)];
/** Principal square root (non-negative real part), so evanescent/lossy waves decay. */
export function csqrt(a: Cx): Cx {
  const r = cabs(a);
  const re = Math.sqrt(Math.max(0, (r + a[0]) / 2)), im = Math.sqrt(Math.max(0, (r - a[0]) / 2));
  return [re, a[1] < 0 ? -im : im];
}
type V3 = [number, number, number];
type CV3 = [Cx, Cx, Cx];
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a: V3) => Math.hypot(a[0], a[1], a[2]);
const unit = (a: V3): V3 => { const n = norm(a); return [a[0] / n, a[1] / n, a[2] / n]; };
/** Complex vector · real vector. */
const cdotr = (E: CV3, v: V3): Cx => [E[0][0] * v[0] + E[1][0] * v[1] + E[2][0] * v[2], E[0][1] * v[0] + E[1][1] * v[1] + E[2][1] * v[2]];
const scaleV = (s: Cx, v: V3): CV3 => [cmul(s, [v[0], 0]), cmul(s, [v[1], 0]), cmul(s, [v[2], 0])];
const addCV = (a: CV3, b: CV3): CV3 => [cadd(a[0], b[0]), cadd(a[1], b[1]), cadd(a[2], b[2])];

// ---------------------------------------------------------------- materials (ITU-R P.2040-4 Table 3)
export interface Material { id: string; name: string; a: number; b: number; c: number; d: number; fLoGHz: number; fHiGHz: number; row: number; strictRange: boolean }
export const MATERIALS_P2040 = (data as unknown as { materials: Material[] }).materials;
export const getP2040 = (id: string) => MATERIALS_P2040.find((m) => m.id === id);
/** The Table 3 row of a material class whose frequency range contains f (GHz), else the nearest range. */
export function materialAt(name: string, fGHz: number): { m: Material; inRange: boolean } | null {
  const rows = MATERIALS_P2040.filter((m) => m.name === name);
  if (!rows.length) return null;
  const inside = rows.find((m) => fGHz >= m.fLoGHz && fGHz <= m.fHiGHz);
  if (inside) return { m: inside, inRange: true };
  const dist = (m: Material) => (fGHz < m.fLoGHz ? m.fLoGHz / fGHz : fGHz / m.fHiGHz);
  return { m: rows.reduce((best, m) => (dist(m) < dist(best) ? m : best)), inRange: false };
}
export interface Permittivity { epsReal: number; sigma: number; epsImag: number; epsRc: Cx }
export function permittivity(m: Material, fGHz: number): Permittivity {
  const epsReal = m.a * fGHz ** m.b, sigma = m.c * fGHz ** m.d, epsImag = (17.98 * sigma) / fGHz;
  return { epsReal, sigma, epsImag, epsRc: [epsReal, -epsImag] };
}

// ---------------------------------------------------------------- reflection and transmission
export type Pol = 'TE' | 'TM';
/** Interface air → material (eqs. 37a, 37b). */
export function interfaceR(epsRc: Cx, theta: number, pol: Pol): Cx {
  const c = Math.cos(theta), s2 = Math.sin(theta) ** 2;
  const root = csqrt(csub(epsRc, [s2, 0]));
  if (pol === 'TE') return cdiv(csub([c, 0], root), cadd([c, 0], root));
  const ec = cmul(epsRc, [c, 0]);
  return cdiv(csub(ec, root), cadd(ec, root));
}
/** Single-layer slab of thickness d (m) in air (eqs. 43a, 43b, 44). */
export function slabRT(epsRc: Cx, d: number, lambda: number, theta: number, pol: Pol): { R: Cx; T: Cx } {
  const Rp = interfaceR(epsRc, theta, pol);
  const q = cmul([(2 * Math.PI * d) / lambda, 0], csqrt(csub(epsRc, [Math.sin(theta) ** 2, 0])));
  // e^{−jq} for complex q = qr + j qi: e^{qi} · e^{−j qr}
  const e1: Cx = cmul([Math.exp(q[1]), 0], cexpj(-q[0]));
  const e2 = cmul(e1, e1);
  const Rp2 = cmul(Rp, Rp);
  const den = csub([1, 0], cmul(Rp2, e2));
  return { R: cdiv(cmul(Rp, csub([1, 0], e2)), den), T: cdiv(cmul(csub([1, 0], Rp2), e1), den) };
}

// ---------------------------------------------------------------- room geometry and rays
export type Face = 'x0' | 'x1' | 'y0' | 'y1' | 'z0' | 'z1';
export const FACES: Face[] = ['x0', 'x1', 'y0', 'y1', 'z0', 'z1'];
export const FACE_LABEL: Record<Face, string> = { x0: 'west wall (x = 0)', x1: 'east wall (x = L)', y0: 'south wall (y = 0)', y1: 'north wall (y = W)', z0: 'floor', z1: 'ceiling' };
export interface Surface { material: string; /** thickness (m); 0 = treat as a half-space (interface only) */ thickness: number }
export interface Room { L: number; W: number; H: number; surfaces: Record<Face, Surface> }
export interface Bounce { face: Face; point: V3; theta: number; R: { TE: Cx; TM: Cx } }
export interface Ray { order: number; points: V3[]; length: number; bounces: Bounce[]; /** complex received voltage contribution (V) */ V: Cx; powerW: number; delayS: number }

/** Coordinate of the image of s in unfolded cell i along an axis of length L. */
const imageCoord = (s: number, i: number, L: number) => i * L + (i % 2 === 0 ? s : L - s);
/** Fold an unfolded coordinate back into [0, L]. */
function fold(u: number, L: number): number { const k = Math.floor(u / L); const r = u - k * L; return k % 2 === 0 ? r : L - r; }

export interface Link { f: number; PT: number; tx: V3; rx: V3 }
export interface RoomContext { room: Room; f: number; lambda: number; eps: Record<Face, Permittivity>; coeffs: (face: Face, theta: number) => { TE: Cx; TM: Cx }; I0: number; Rrad: number }

const HWD_STATS = patternStats(dipolePattern(HWD));
/** Radiation resistance of the half-wave dipole by numerical integration (≈ 73.08 Ω, Gate 9.1). */
export const HWD_RRAD = HWD_STATS.Rrad;

export function roomContext(room: Room, f: number, PT: number): RoomContext {
  const fGHz = f / 1e9, lambda = CONSTANTS.c.value / f;
  const eps = {} as Record<Face, Permittivity>;
  for (const face of FACES) { const mm = materialAt(room.surfaces[face].material, fGHz); eps[face] = mm ? permittivity(mm.m, fGHz) : { epsReal: 1, sigma: 0, epsImag: 0, epsRc: [1, 0] }; }
  const coeffs = (face: Face, theta: number) => {
    const sf = room.surfaces[face], e = eps[face].epsRc;
    return sf.thickness > 0
      ? { TE: slabRT(e, sf.thickness, lambda, theta, 'TE').R, TM: slabRT(e, sf.thickness, lambda, theta, 'TM').R }
      : { TE: interfaceR(e, theta, 'TE'), TM: interfaceR(e, theta, 'TM') };
  };
  return { room, f, lambda, eps, coeffs, I0: Math.sqrt((2 * PT) / HWD_RRAD), Rrad: HWD_RRAD };
}

/** HWD pattern factor F(θ) = cos[(π/2)cosθ]/sinθ (0 on the axis). */
const hwdF = (cosT: number) => { const s = Math.sqrt(Math.max(0, 1 - cosT * cosT)); return s < 1e-9 ? 0 : Math.cos((Math.PI / 2) * cosT) / s; };
/** θ̂ for a z-directed dipole and propagation direction k̂ (unit). */
function thetaHat(k: V3): V3 {
  const s = Math.hypot(k[0], k[1]);
  if (s < 1e-12) return [1, 0, 0];
  return [(k[2] * k[0]) / s, (k[2] * k[1]) / s, -s];
}

/** Every specular path from tx to rx with at most `maxOrder` reflections, with its received voltage. */
export function traceRays(ctx: RoomContext, tx: V3, rx: V3, maxOrder: number): Ray[] {
  const { room, lambda } = ctx;
  const dims: V3 = [room.L, room.W, room.H];
  const beta = (2 * Math.PI) / lambda;
  const rays: Ray[] = [];
  for (let i = -maxOrder; i <= maxOrder; i++) for (let j = -maxOrder + Math.abs(i); j <= maxOrder - Math.abs(i); j++) {
    const kmax = maxOrder - Math.abs(i) - Math.abs(j);
    for (let k = -kmax; k <= kmax; k++) {
      const cell: V3 = [i, j, k];
      const S: V3 = [imageCoord(tx[0], i, dims[0]), imageCoord(tx[1], j, dims[1]), imageCoord(tx[2], k, dims[2])];
      const d: V3 = [rx[0] - S[0], rx[1] - S[1], rx[2] - S[2]];
      const length = norm(d);
      if (length < 1e-9) continue;
      // wall crossings of the unfolded segment S → rx, sorted by the parameter t ∈ (0, 1)
      const events: { t: number; axis: number; plane: number }[] = [];
      for (let a = 0; a < 3; a++) {
        const n = cell[a];
        if (n === 0) continue;
        const planes = n > 0 ? Array.from({ length: n }, (_, m) => m + 1) : Array.from({ length: -n }, (_, m) => -m);
        // planes between cell n and cell 0, in unfolded coordinates p·L
        for (const p of planes) events.push({ t: (p * dims[a] - S[a]) / d[a], axis: a, plane: p });
      }
      events.sort((x, y) => x.t - y.t);
      const pts: V3[] = [[fold(S[0], dims[0]), fold(S[1], dims[1]), fold(S[2], dims[2])]];
      const bounces: Bounce[] = [];
      for (const ev of events) {
        const u: V3 = [S[0] + ev.t * d[0], S[1] + ev.t * d[1], S[2] + ev.t * d[2]];
        const p: V3 = [fold(u[0], dims[0]), fold(u[1], dims[1]), fold(u[2], dims[2])];
        p[ev.axis] = ev.plane % 2 === 0 ? 0 : dims[ev.axis];
        const face = (['x', 'y', 'z'][ev.axis] + (ev.plane % 2 === 0 ? '0' : '1')) as Face;
        const theta = Math.acos(Math.min(1, Math.abs(d[ev.axis]) / length));
        pts.push(p);
        bounces.push({ face, point: p, theta, R: ctx.coeffs(face, theta) });
      }
      pts.push(rx);
      // carry the field vector along the real (folded) path
      let k0 = unit([pts[1][0] - pts[0][0], pts[1][1] - pts[0][1], pts[1][2] - pts[0][2]]);
      const amp: Cx = cmul([0, (ETA0 * ctx.I0) / (2 * Math.PI) * hwdF(k0[2])], [1, 0]);   // jη I₀/(2π) F(θ)
      let E: CV3 = scaleV(amp, thetaHat(k0));
      for (let b = 0; b < bounces.length; b++) {
        const k1 = unit([pts[b + 2][0] - pts[b + 1][0], pts[b + 2][1] - pts[b + 1][1], pts[b + 2][2] - pts[b + 1][2]]);
        const axis = 'xyz'.indexOf(bounces[b].face[0]);
        const nrm: V3 = [0, 0, 0]; nrm[axis] = 1;
        let s = cross(k0, nrm);
        if (norm(s) < 1e-9) s = Math.abs(k0[0]) < 0.9 ? cross(k0, [1, 0, 0]) : cross(k0, [0, 1, 0]);
        s = unit(s);
        const pIn = cross(s, k0), pOut = cross(s, k1);
        const R = bounces[b].R;
        E = addCV(scaleV(cmul(R.TE, cdotr(E, s)), s), scaleV(cmul(R.TM, cdotr(E, pIn)), pOut));
        k0 = k1;
      }
      // spreading and phase over the total (unfolded) length, then the receiving dipole: V = E · l_e
      const prop = cmul(cexpj(-beta * length), [1 / length, 0]);
      const kIn = k0;                                   // arrival direction at rx
      const toSrc: V3 = [-kIn[0], -kIn[1], -kIn[2]];   // direction from rx back along the ray
      const le = lambda * cabsFilament(toSrc[2]) * Math.sqrt(Math.max(0, 1 - toSrc[2] ** 2));
      const V = cmul(cmul(cdotr(E, thetaHat(toSrc)), prop), [le, 0]);
      const Vm = cabs(V);
      rays.push({ order: events.length, points: pts, length, bounces, V, powerW: (Vm * Vm) / (8 * ctx.Rrad), delayS: length / CONSTANTS.c.value });
    }
  }
  return rays.sort((a, b) => b.powerW - a.powerW);
}
/** (1/λ)∫I(z′)e^{jβz′cosθ}dz′/I₀ of the half-wave dipole = cos[(π/2)cosθ]/(π sin²θ) (Ellingson eq. 9.101), for eq. 10.113. */
function cabsFilament(cosT: number): number { const s2 = Math.max(0, 1 - cosT * cosT); return s2 < 1e-18 ? 0 : Math.abs(Math.cos((Math.PI / 2) * cosT)) / (Math.PI * s2); }
/** The closed form above equals the numerical filament integral of Gate 9.1 (checked in tests). */
export const hwdFilamentCheck = (theta: number) => [cabsFilament(Math.cos(theta)), Math.hypot(...filamentIntegral(HWD, theta, 256))] as const;

/** Coherent received power (W) of all rays; the incoherent sum and the direct ray alone for comparison. */
export function receivedPower(ctx: RoomContext, rays: Ray[]) {
  let V: Cx = [0, 0], inc = 0;
  for (const r of rays) { V = cadd(V, r.V); inc += r.powerW; }
  const m = cabs(V);
  return { coherent: (m * m) / (8 * ctx.Rrad), incoherent: inc, direct: rays.find((r) => r.order === 0)?.powerW ?? 0 };
}
/** Power-weighted mean delay and RMS delay spread of a set of rays. */
export function delaySpread(rays: Ray[]) {
  const P = rays.reduce((s, r) => s + r.powerW, 0);
  if (!(P > 0)) return { mean: NaN, rms: NaN };
  const mean = rays.reduce((s, r) => s + r.powerW * r.delayS, 0) / P;
  const m2 = rays.reduce((s, r) => s + r.powerW * r.delayS ** 2, 0) / P;
  return { mean, rms: Math.sqrt(Math.max(0, m2 - mean * mean)) };
}
export const HWD_GAIN = HWD_STATS.Dmax;
