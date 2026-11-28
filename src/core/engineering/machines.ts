/**
 * Mechanical and electrical engineering (Phase 17): pure functions behind #/engineering/machines.
 *
 *  Circuits     Ohm's law V = IR; series and parallel resistance; Kirchhoff's current law at a node; a resistor
 *               divider; RC charging V(t) = V₀(1 − e^{−t/RC}); RL current rise; power P = VI = I²R.
 *  Mechanics    torque τ = rF; power P = τω; ideal gear trains (speed falls by the tooth ratio, torque rises by it);
 *               lever mechanical advantage = effort arm / load arm.
 *  Heat engines Carnot/Rankine limit (T₁ − T₂)/T₁; ideal Otto cycle 1 − r^(1−γ), derived from NASA Glenn's
 *               isentropic relation T₃/T₂ = r^(γ−1).
 *  Induction    EMF of a coil rotating in a uniform field: ε(t) = N B A ω sin ωt (Faraday's law in modern form).
 */
export const ohmCurrent = (V: number, R: number) => V / R;
export const series = (...R: number[]) => R.reduce((s, r) => s + r, 0);
export const parallel = (...R: number[]) => 1 / R.reduce((s, r) => s + 1 / r, 0);
export const divider = (Vin: number, R1: number, R2: number) => (Vin * R2) / (R1 + R2);
export const rcCharge = (V0: number, R: number, C: number, t: number) => V0 * (1 - Math.exp(-t / (R * C)));
export const rlCurrent = (V: number, R: number, L: number, t: number) => (V / R) * (1 - Math.exp(-(R * t) / L));
export const power = (V: number, I: number) => V * I;

export const torque = (r: number, F: number) => r * F;
export const shaftPower = (tau: number, omega: number) => tau * omega;
export const rpmToRadS = (rpm: number) => (rpm * 2 * Math.PI) / 60;
/** Ideal gear pair: driver teeth n1, driven n2. */
export const gearPair = (n1: number, n2: number, rpmIn: number, torqueIn: number) => ({ rpmOut: (rpmIn * n1) / n2, torqueOut: (torqueIn * n2) / n1, ratio: n2 / n1 });
export const leverAdvantage = (effortArm: number, loadArm: number) => effortArm / loadArm;

export const carnot = (Th: number, Tc: number) => 1 - Tc / Th;
export const otto = (r: number, gamma = 1.4) => 1 - r ** (1 - gamma);

export const coilEmf = (N: number, B: number, A: number, omega: number, t: number) => N * B * A * omega * Math.sin(omega * t);
export const coilEmfPeak = (N: number, B: number, A: number, omega: number) => N * B * A * omega;
