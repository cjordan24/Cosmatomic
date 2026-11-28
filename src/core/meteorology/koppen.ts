/**
 * Köppen–Geiger classification after Peel, Finlayson & McMahon (2007), Table 1 (HESS 11, 1633–1644). Monthly mean
 * temperature (°C) and precipitation (mm), January first. Summer = the warmer six-month half of ONDJFM / AMJJAS.
 * B is tested first (“all locations that satisfy the B climate criteria will also satisfy one of the other … criteria”).
 */
export interface KoppenResult { code: string; steps: string[]; v: Record<string, number> }

export function koppen(T: number[], P: number[]): KoppenResult {
  const sum = (a: number[]) => a.reduce((s, x) => s + x, 0);
  const MAT = sum(T) / 12, MAP = sum(P), Thot = Math.max(...T), Tcold = Math.min(...T), Tmon10 = T.filter((t) => t > 10).length, Pdry = Math.min(...P);
  const AMJJAS = [3, 4, 5, 6, 7, 8], ONDJFM = [9, 10, 11, 0, 1, 2];
  const warmFirst = sum(AMJJAS.map((i) => T[i])) >= sum(ONDJFM.map((i) => T[i]));
  const S = warmFirst ? AMJJAS : ONDJFM, W = warmFirst ? ONDJFM : AMJJAS;
  const Ps = S.map((i) => P[i]), Pw = W.map((i) => P[i]);
  const Psdry = Math.min(...Ps), Pswet = Math.max(...Ps), Pwdry = Math.min(...Pw), Pwwet = Math.max(...Pw);
  const share = { s: sum(Ps) / MAP, w: sum(Pw) / MAP };
  const Pth = share.w >= 0.7 ? 2 * MAT : share.s >= 0.7 ? 2 * MAT + 28 : 2 * MAT + 14;
  const v = { MAT, MAP, Thot, Tcold, Tmon10, Pdry, Psdry, Pswet, Pwdry, Pwwet, Pthreshold: Pth };
  const f1 = (x: number) => (Math.round(x * 10) / 10).toString();
  const steps: string[] = [];
  if (MAP < 10 * Pth) {
    steps.push(`B (arid): MAP ${f1(MAP)} mm < 10 × Pthreshold = ${f1(10 * Pth)} mm`);
    const two = MAP < 5 * Pth ? 'W' : 'S'; steps.push(two === 'W' ? `W (desert): MAP < 5 × Pthreshold = ${f1(5 * Pth)}` : `S (steppe): MAP ≥ 5 × Pthreshold = ${f1(5 * Pth)}`);
    const three = MAT >= 18 ? 'h' : 'k'; steps.push(three === 'h' ? `h (hot): MAT ${f1(MAT)} ≥ 18` : `k (cold): MAT ${f1(MAT)} < 18`);
    return { code: 'B' + two + three, steps, v };
  }
  steps.push(`not B: MAP ${f1(MAP)} mm ≥ 10 × Pthreshold = ${f1(10 * Pth)} mm`);
  if (Tcold >= 18) {
    steps.push(`A (tropical): Tcold ${f1(Tcold)} ≥ 18`);
    if (Pdry >= 60) { steps.push(`f (rainforest): Pdry ${f1(Pdry)} ≥ 60`); return { code: 'Af', steps, v }; }
    if (Pdry >= 100 - MAP / 25) { steps.push(`m (monsoon): Pdry ${f1(Pdry)} ≥ 100 − MAP/25 = ${f1(100 - MAP / 25)}`); return { code: 'Am', steps, v }; }
    steps.push(`w (savannah): Pdry ${f1(Pdry)} < 100 − MAP/25`); return { code: 'Aw', steps, v };
  }
  if (Thot < 10) {
    steps.push(`E (polar): Thot ${f1(Thot)} < 10`);
    return Thot > 0 ? (steps.push(`T (tundra): Thot > 0`), { code: 'ET', steps, v }) : (steps.push('F (frost): Thot ≤ 0'), { code: 'EF', steps, v });
  }
  const first = Tcold > 0 ? 'C' : 'D';
  steps.push(first === 'C' ? `C (temperate): Thot ${f1(Thot)} > 10 and 0 < Tcold ${f1(Tcold)} < 18` : `D (cold): Thot ${f1(Thot)} > 10 and Tcold ${f1(Tcold)} ≤ 0`);
  let two = 'f';
  if (Psdry < 40 && Psdry < Pwwet / 3) { two = 's'; steps.push(`s (dry summer): Psdry ${f1(Psdry)} < 40 and < Pwwet/3 = ${f1(Pwwet / 3)}`); }
  else if (Pwdry < Pswet / 10) { two = 'w'; steps.push(`w (dry winter): Pwdry ${f1(Pwdry)} < Pswet/10 = ${f1(Pswet / 10)}`); }
  else steps.push('f (no dry season)');
  let three: string;
  if (Thot >= 22) { three = 'a'; steps.push(`a (hot summer): Thot ${f1(Thot)} ≥ 22`); }
  else if (Tmon10 >= 4) { three = 'b'; steps.push(`b (warm summer): ${Tmon10} months above 10 °C`); }
  else if (first === 'D' && Tcold < -38) { three = 'd'; steps.push(`d (very cold winter): Tcold < −38`); }
  else { three = 'c'; steps.push(`c (cold summer): ${Tmon10} months above 10 °C`); }
  return { code: first + two + three, steps, v };
}
export const fToC = (f: number) => (f - 32) / 1.8;
export const inToMm = (i: number) => i * 25.4;
