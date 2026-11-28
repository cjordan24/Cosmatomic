/**
 * Integrated systems (Phase 19): energy and information flowing through an assembled machine. Each stage uses a
 * sourced relation or value from earlier phases; the combinations are ours and labelled as such in the view.
 *
 *  - spacecraft: power from sunlight (Hubble-derived array output per m², scaled 1/d²) or RTGs (158 We each, Pu-238
 *    decay); radio link by Yuen (1982): P_R = P_T G_T G_R (λ/4πr)², loss L, N₀ = kT, and Voyager's requirement of
 *    P_R L/N₀ = 2.05 × 10⁵ Hz for 115.2 kbit/s (eq. 1.1-7 and text, p. 5).
 *  - data centre: prompts × energy per prompt → facility energy; ÷ PUE → IT; ÷ (1 − T&D loss) → generation.
 *  - electric vehicle: battery volume × energy density; DOE's share delivered to the wheels and regenerative braking.
 */
import { CONSTANTS } from '@/core/constants/constants';
import { decay, friis } from './spaceflight';

export const C_LIGHT = 299_792_458;
/** Hubble: about 5,500 W in sunlight from two 2.44 × 7.54 m panels (NASA). */
export const HUBBLE_ARRAY_W = 5500, HUBBLE_ARRAY_M2 = 2 * 2.44 * 7.54;
export const ARRAY_W_PER_M2_1AU = HUBBLE_ARRAY_W / HUBBLE_ARRAY_M2;
export const solarArrayW = (areaM2: number, dAu: number) => (areaM2 * ARRAY_W_PER_M2_1AU) / (dAu * dAu);
/** RTGs: 158 We each at launch (Voyager MHW-RTG), decaying with Pu-238 (87.7 y) — an upper bound. */
export const rtgW = (n: number, years: number, perRtg = 158, halfLife = 87.7) => decay(n * perRtg, years, halfLife);
/** Voyager's observed fade: 474 W (1977) → 225 W (2023), as one exponential through both points. */
export const rtgObservedW = (n: number, years: number) => n * 158 * (225 / 474) ** (years / 46);

/** Yuen's numbers: noise temperature 28.5 K, link loss 0.7, ground efficiency 0.42; Voyager HGA 6.5 × 10⁴ at 3.7 m. */
export const YUEN = { T: 28.5, L: 0.7, etaGround: 0.42, gtVoyager: 6.5e4, dVoyager: 3.7, f: 8.4e9, needHz: 2.05e5, needBps: 115.2e3 };
export const etaFromVoyager = () => { const lam = C_LIGHT / YUEN.f; return YUEN.gtVoyager / ((Math.PI * YUEN.dVoyager) / lam) ** 2; };

export function link(opts: { ptW: number; dTx: number; dRx: number; distM: number; f?: number }) {
  const f = opts.f ?? YUEN.f, lam = C_LIGHT / f, eta = etaFromVoyager();
  const gt = eta * ((Math.PI * opts.dTx) / lam) ** 2, gr = YUEN.etaGround * ((Math.PI * opts.dRx) / lam) ** 2;
  const pr = friis(opts.ptW, gt, gr, lam, opts.distM);
  const n0 = CONSTANTS.kB.value * YUEN.T;
  const ratio = (pr * YUEN.L) / n0;                         // P_R L / N₀, Hz
  const bps = ratio / (YUEN.needHz / YUEN.needBps);         // at Voyager's required ratio per bit
  return { gt, gr, pr, n0, ratio, bps };
}

/** Data centre chain, energies in kWh per day. */
export function dataCentreChain(promptsPerDay: number, whPerPrompt: number, pue: number, tdLoss = 0.05) {
  const facility = (promptsPerDay * whPerPrompt) / 1000;
  const it = facility / pue;
  const generation = facility / (1 - tdLoss);
  return { generation, lines: generation - facility, facility, infrastructure: facility - it, it };
}

/** Electric vehicle: battery energy (kWh) and the DOE share to the wheels. */
export function evChain(litres: number, whPerL: number, toWheels: number) {
  const battery = (litres * whPerL) / 1000;
  return { battery, wheels: battery * toWheels, losses: battery * (1 - toWheels) };
}
