/**
 * Hodgkin–Huxley (1952) membrane model (Phase 12, Gate 12.4).
 *
 * A. L. Hodgkin and A. F. Huxley (1952) J. Physiol. 117, 500–544, read on the page images (archive.org
 * sim_journal-of-physiology_the-journal-of-physiology_1952_117; leaf = page + 21):
 *  p. 505  “V is the displacement of the membrane potential from its resting value (depolarization negative)”;
 *          “I is the total membrane current density (inward current positive)”.
 *  p. 518  (26) I = C_M dV/dt + ḡ_K n⁴(V − V_K) + ḡ_Na m³h(V − V_Na) + ḡ_l(V − V_l);
 *          (7) dn/dt = α_n(1 − n) − β_n n, (15) dm/dt = α_m(1 − m) − β_m m, (16) dh/dt = α_h(1 − h) − β_h h.
 *  p. 519  (12) α_n = 0·01(V + 10)/(exp((V + 10)/10) − 1), (13) β_n = 0·125 exp(V/80),
 *          (20) α_m = 0·1(V + 25)/(exp((V + 25)/10) − 1), (21) β_m = 4 exp(V/18),
 *          (23) α_h = 0·07 exp(V/20), (24) β_h = 1/(exp((V + 30)/10) + 1);
 *          mV, µA/cm², m.mho/cm², µF/cm², msec; “appropriate to a temperature of 6·3° C; for other temperatures
 *          they must be scaled with a Q10 of 3.”
 *  p. 520  Table 3: C_M 1·0, V_Na −115, V_K +12, V_l −10·613 (“Exact value chosen to make the total ionic current
 *          zero at the resting potential (V = 0)”), ḡ_Na 120, ḡ_K 36, ḡ_l 0·3.
 *  p. 523  φ = 3^((T′ − 6·3)/10).
 *  p. 528  propagated action potential at 18·5 °C: K = 10·47 msec⁻¹ (eqn. 31), θ = √(Ka/2R₂C_M) (34), a = 238 µ,
 *          R₂ = 35·4 Ω cm: calculated 18·8 m/sec, measured 21·2 m/sec.
 *
 * This module works in the paper's convention (V = displacement, depolarisation negative). The modern membrane
 * potential relative to rest is −V; views convert. Integration: 4th-order Runge–Kutta (the paper used a
 * hand-computing method; any accurate integrator gives the same solution of the same equations).
 * The singular points of (12) and (20) at V = −10 and −25 are handled by their limits (0·1 and 1).
 */
export interface HHParams { CM: number; VNa: number; VK: number; Vl: number; gNa: number; gK: number; gl: number }
export const HH_TABLE3: HHParams = { CM: 1.0, VNa: -115, VK: 12, Vl: -10.613, gNa: 120, gK: 36, gl: 0.3 };
export const HH_REFERENCE_TEMPERATURE = 6.3;

/** x/(exp(x/10) − 1) with its limit 10 at x = 0. */
const xOverExpm1 = (x: number) => (Math.abs(x) < 1e-7 ? 10 : x / (Math.exp(x / 10) - 1));
export const alphaN = (V: number) => 0.01 * xOverExpm1(V + 10);
export const betaN = (V: number) => 0.125 * Math.exp(V / 80);
export const alphaM = (V: number) => 0.1 * xOverExpm1(V + 25);
export const betaM = (V: number) => 4 * Math.exp(V / 18);
export const alphaH = (V: number) => 0.07 * Math.exp(V / 20);
export const betaH = (V: number) => 1 / (Math.exp((V + 30) / 10) + 1);
/** Temperature factor φ = 3^((T − 6.3)/10) (p. 523). */
export const phi = (tC: number) => 3 ** ((tC - HH_REFERENCE_TEMPERATURE) / 10);

export const nInf = (V: number) => alphaN(V) / (alphaN(V) + betaN(V));
export const mInf = (V: number) => alphaM(V) / (alphaM(V) + betaM(V));
export const hInf = (V: number) => alphaH(V) / (alphaH(V) + betaH(V));

export interface HHState { V: number; n: number; m: number; h: number }
export const restingState = (): HHState => ({ V: 0, n: nInf(0), m: mInf(0), h: hInf(0) });

/** Ionic current density (µA/cm²), the last three terms of eq. (26); inward positive as in the paper. */
export function ionicCurrents(s: HHState, p: HHParams = HH_TABLE3) {
  const INa = p.gNa * s.m ** 3 * s.h * (s.V - p.VNa), IK = p.gK * s.n ** 4 * (s.V - p.VK), Il = p.gl * (s.V - p.Vl);
  return { INa, IK, Il, total: INa + IK + Il, gNa: p.gNa * s.m ** 3 * s.h, gK: p.gK * s.n ** 4 };
}

/** Time derivatives for a membrane (space-clamped) action potential with applied current I (µA/cm², inward +). */
function deriv(s: HHState, I: number, f: number, p: HHParams): HHState {
  const ion = ionicCurrents(s, p).total;
  return {
    V: (I - ion) / p.CM,
    n: f * (alphaN(s.V) * (1 - s.n) - betaN(s.V) * s.n),
    m: f * (alphaM(s.V) * (1 - s.m) - betaM(s.V) * s.m),
    h: f * (alphaH(s.V) * (1 - s.h) - betaH(s.V) * s.h),
  };
}
const add = (a: HHState, b: HHState, k: number): HHState => ({ V: a.V + k * b.V, n: a.n + k * b.n, m: a.m + k * b.m, h: a.h + k * b.h });

export interface HHTrace { t: number[]; V: number[]; n: number[]; m: number[]; h: number[]; INa: number[]; IK: number[] }
/**
 * Membrane action potential: start at rest, apply a stimulus (displacement V0 at t = 0, the paper's method for
 * Fig. 12, or a current pulse), integrate eq. (26) with I = applied current by RK4.
 */
export function simulateMembrane(opts: { tMax: number; dt?: number; tempC?: number; V0?: number; pulse?: { start: number; duration: number; I: number }; params?: HHParams }): HHTrace {
  const dt = opts.dt ?? 0.01, f = phi(opts.tempC ?? HH_REFERENCE_TEMPERATURE), p = opts.params ?? HH_TABLE3;
  let s = { ...restingState(), V: opts.V0 ?? 0 };
  const out: HHTrace = { t: [], V: [], n: [], m: [], h: [], INa: [], IK: [] };
  const steps = Math.round(opts.tMax / dt);
  for (let k = 0; k <= steps; k++) {
    const t = k * dt;
    const c = ionicCurrents(s, p);
    out.t.push(t); out.V.push(s.V); out.n.push(s.n); out.m.push(s.m); out.h.push(s.h); out.INa.push(c.INa); out.IK.push(c.IK);
    const I = (tt: number) => (opts.pulse && tt >= opts.pulse.start && tt < opts.pulse.start + opts.pulse.duration ? opts.pulse.I : 0);
    const k1 = deriv(s, I(t), f, p), k2 = deriv(add(s, k1, dt / 2), I(t + dt / 2), f, p), k3 = deriv(add(s, k2, dt / 2), I(t + dt / 2), f, p), k4 = deriv(add(s, k3, dt), I(t + dt), f, p);
    s = { V: s.V + (dt / 6) * (k1.V + 2 * k2.V + 2 * k3.V + k4.V), n: s.n + (dt / 6) * (k1.n + 2 * k2.n + 2 * k3.n + k4.n), m: s.m + (dt / 6) * (k1.m + 2 * k2.m + 2 * k3.m + k4.m), h: s.h + (dt / 6) * (k1.h + 2 * k2.h + 2 * k3.h + k4.h) };
  }
  return out;
}

/** Conduction velocity of eq. (34), θ = √(K a / (2 R₂ C_M)), in m/s from K (ms⁻¹), a (cm), R₂ (Ω cm), C_M (µF/cm²). */
export function conductionVelocity(K: number, aCm: number, R2: number, CM = 1): number {
  // K in s⁻¹ and C_M in F/cm² give cm/s
  return Math.sqrt((K * 1e3 * aCm) / (2 * R2 * CM * 1e-6)) / 100;
}
