/**
 * Regional sandbox models (Phase 25). Rain shadow: a parcel forced over a mountain.
 *   below cloud base: dry rate 9.8 °C/km (NWS); cloud base from the FAA rule (T − T_d in °F) ÷ 4.4 × 1000 ft;
 *   above cloud base: a constant moist rate (FAA range 1.1–2.8 °C per 1,000 ft); all condensate falls windward;
 *   down the lee: dry rate. Lee humidity: the parcel's dew point is taken as the crest temperature (pressure effect on
 *   dew point ignored) — illustrative.
 */
import { cloudBase, satVapour } from './atmosphere';

export const DALR = 9.8;   // °C per km, NWS glossary

export interface ShadowStep { x: number; z: number; T: number }
export function rainShadow(o: { T0: number; Td0: number; hillKm: number; malr: number }) {
  const lcl = cloudBase(o.T0, o.Td0) / 1000, h = Math.max(0, o.hillKm);
  const Tup = (z: number) => (z <= lcl ? o.T0 - DALR * z : o.T0 - DALR * lcl - o.malr * (z - lcl));
  const crestT = Tup(h), saturates = lcl < h;
  const leeT = crestT + DALR * h;
  const dewLee = saturates ? crestT : o.Td0;
  const leeRH = Math.min(1, satVapour(dewLee) / satVapour(leeT));
  const path: ShadowStep[] = [];
  const n = 20;
  for (let i = 0; i <= n; i++) { const z = (h * i) / n; path.push({ x: i, z, T: Tup(z) }); }
  for (let i = 1; i <= n; i++) { const z = h - (h * i) / n; path.push({ x: n + i, z, T: crestT + DALR * (h - z) }); }
  return { lclKm: lcl, cloudBaseKm: lcl, cloudX: h > 0 ? (Math.min(lcl, h) / h) * n : 0, crestT, leeT, leeRH, saturates, path };
}
