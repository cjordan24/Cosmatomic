/**
 * Phase 26 — reference checks for the Meteorology models. Each check recomputes a value with the app's own code and
 * compares it with a value printed by the source. `expect: 'agree'` checks must fall within tolerance; `expect:
 * 'finding'` checks record a known disagreement in the sources themselves (they must NOT agree, or the finding is
 * stale). Run in the browser by #/meteorology/validation and by tests/science/meteorology-validation.test.ts.
 */
import physical from '@datasets/astronomical/planet-physical.json';
import radiation from '@datasets/astronomical/planet-radiation.json';
import worlds from '@datasets/meteorology/planets.json';
import human from '@datasets/meteorology/human.json';
import oceans from '@datasets/meteorology/oceans.json';
import { standardAtmosphere } from '@/core/meteorology/atmosphere';
import { acidityIncrease, ols } from '@/core/meteorology/ocean';
import { budgetImbalance, cementProcessCO2, heatFlux, molarMass } from '@/core/meteorology/human';
import { atmosphereMass, dailyInsolation, effectiveTempInt, equatorialGravity, irradiance, layeredSurfaceTemp, scaleHeightKm } from '@/core/meteorology/sandbox';
import { f2c, m2ft } from '@/core/meteorology/future';

/* eslint-disable @typescript-eslint/no-explicit-any */
const PH = physical as any, RAD = (radiation as any).bodies as any[], W = (worlds as any).worlds as any[], H = human as any, O = oceans as any;
const rad = (id: string) => RAD.find((b) => b.id === id);
const AU_KM = 149597870.7;
const aw = (s: 'C' | 'O' | 'Ca') => H.atomicWeights[s] as number;

export interface Check {
  id: string; area: string; what: string; unit: string;
  app: () => number; printed: number; printedText: string;
  /** tolerance: relative (fraction) unless abs is set */
  tol: number; abs?: boolean;
  expect: 'agree' | 'finding';
  sources: string[]; route: string;
}

const gravity = (id: string, name: string): Check => ({
  id: `g-${id}`, area: 'Planets', what: `${name}: equatorial gravity GM/R² − ω²R`, unit: 'm/s²',
  app: () => equatorialGravity(PH[id].massKg, PH[id].diameterKm / 2, PH[id].rotationPeriodH), printed: PH[id].gravityMs2, printedText: `${PH[id].gravityMs2} (NSSDCA)`,
  tol: 0.03, expect: 'agree', sources: ['nssdc-factsheet', 'nssdc-planetfact-notes'], route: '/meteorology/sandbox',
});
const sun = (id: string, name: string): Check => ({
  id: `s-${id}`, area: 'Planets', what: `${name}: sunlight 1361 × (1 au/d)²`, unit: 'W/m²',
  app: () => irradiance(PH[id].meanDistanceKm / AU_KM), printed: rad(id).solarIrradianceWm2, printedText: `${rad(id).solarIrradianceWm2} (NSSDCA)`,
  tol: 0.02, expect: 'agree', sources: ['nssdc-factsheet', 'nasa-gsfc-tsi'], route: '/meteorology/sandbox',
});
const bb = (id: string, name: string, expect: Check['expect'] = 'agree'): Check => ({
  id: `t-${id}`, area: 'Energy balance', what: `${name}: black-body temperature σT⁴ = S(1 − A)/4`, unit: 'K',
  app: () => effectiveTempInt(rad(id).solarIrradianceWm2, rad(id).bondAlbedo), printed: rad(id).blackBodyTemperatureK, printedText: `${rad(id).blackBodyTemperatureK} (NSSDCA)`,
  tol: 0.01, expect, sources: ['nssdc-factsheet', 'planck-1914'], route: '/meteorology/radiation',
});
const sh = (id: string, name: string): Check => {
  const w = W.find((x) => x.id === id);
  return { id: `h-${id}`, area: 'Atmospheres', what: `${name}: scale height R*T/(M g)`, unit: 'km', app: () => scaleHeightKm(w.tK, w.mmw, PH[id].gravityMs2), printed: w.H, printedText: `${w.H} (NSSDCA)`, tol: 0.06, expect: 'agree', sources: ['nssdc-factsheet'], route: '/meteorology/planets' };
};

export const CHECKS: Check[] = [
  { id: 'ussa-11', area: 'Atmospheres', what: 'US Standard Atmosphere: temperature at the tropopause (11 km geopotential)', unit: 'K', app: () => standardAtmosphere(11019.1).T, printed: 216.65, printedText: '216.65 K (USSA 1976)', tol: 0.05, abs: true, expect: 'agree', sources: ['ussa-1976'], route: '/meteorology' },
  { id: 'ussa-0', area: 'Atmospheres', what: 'US Standard Atmosphere: sea-level pressure', unit: 'Pa', app: () => standardAtmosphere(0).P, printed: 101325, printedText: '101,325 Pa (USSA 1976)', tol: 0.5, abs: true, expect: 'agree', sources: ['ussa-1976'], route: '/meteorology' },
  gravity('venus', 'Venus'), gravity('earth', 'Earth'), gravity('mars', 'Mars'), gravity('jupiter', 'Jupiter'), gravity('pluto', 'Pluto'),
  sun('venus', 'Venus'), sun('mars', 'Mars'), sun('jupiter', 'Jupiter'), sun('pluto', 'Pluto'),
  bb('venus', 'Venus'), bb('earth', 'Earth'), bb('mars', 'Mars'), bb('jupiter', 'Jupiter'), bb('pluto', 'Pluto', 'finding'),
  sh('venus', 'Venus'), sh('earth', 'Earth'), sh('mars', 'Mars'),
  { id: 'atm-mass', area: 'Atmospheres', what: 'Earth: mass of the atmosphere 4πR² p/g', unit: 'kg', app: () => atmosphereMass(1.014, PH.earth.gravityMs2, PH.earth.diameterKm / 2), printed: 5.1e18, printedText: '5.1 × 10¹⁸ (NSSDCA)', tol: 0.06, expect: 'agree', sources: ['nssdc-factsheet'], route: '/meteorology/sandbox' },
  { id: 'rose-303', area: 'Greenhouse', what: 'One grey layer: 2^¼ × 255 K', unit: 'K', app: () => layeredSurfaceTemp(255, 1), printed: 303, printedText: '303 K (Rose)', tol: 0.5, abs: true, expect: 'agree', sources: ['rose-climlab-greenhouse'], route: '/meteorology/sandbox' },
  { id: 'insol-mean', area: 'Sunlight', what: 'Zero tilt: area-weighted daily insolation = S₀/4', unit: 'W/m²', app: () => { let s = 0, w = 0; for (let l = -89.5; l < 90; l += 1) { const c = Math.cos((l * Math.PI) / 180); s += dailyInsolation(l, 0, 1361) * c; w += c; } return s / w; }, printed: 340.25, printedText: '1361/4 (NASA: “one-fourth of the total solar irradiance”)', tol: 0.005, expect: 'agree', sources: ['rose-climlab-insolation', 'nasa-earth-energy-budget'], route: '/meteorology/sandbox' },
  { id: 'gcb-close', area: 'Human activities', what: 'Global Carbon Budget 2015–2024: sources − sinks', unit: 'GtC/yr', app: () => { const d = H.budget.decade; return budgetImbalance({ fossil: d.fossil.v, luc: d.luc.v, atm: d.atm.v, ocean: d.ocean.v, land: d.land.v }); }, printed: 0, printedText: 'balanced (11.2 emitted)', tol: 0.05, abs: true, expect: 'agree', sources: ['gcb-2025'], route: '/meteorology/human' },
  { id: 'edgar-sum', area: 'Human activities', what: 'EDGAR 2026: eight sector totals summed', unit: 'Gt CO₂eq', app: () => H.sectors.rows.reduce((a: number, r: any) => a + r.mt, 0) / 1000, printed: 54.1, printedText: '54.1 Gt CO₂eq (EDGAR)', tol: 0.05, abs: true, expect: 'agree', sources: ['edgar-2026'], route: '/meteorology/human?tab=sectors' },
  { id: 'waste-heat', area: 'Human activities', what: '595 EJ/yr spread over the globe', unit: 'W/m²', app: () => heatFlux(595, 510e12), printed: 0.04, printedText: '0.04 W/m² (Kleidon et al.)', tol: 0.005, abs: true, expect: 'agree', sources: ['kleidon-2023'], route: '/meteorology/human?tab=heat' },
  { id: 'cement', area: 'Human activities', what: 'Calcination CO₂ per tonne of clinker, CaO 0.646', unit: 't', app: () => cementProcessCO2({ mrCO2: molarMass([[aw('C'), 1], [aw('O'), 2]]), mrCaO: molarMass([[aw('Ca'), 1], [aw('O'), 1]]), fCaO: 0.646, clinkerRatio: 1, mCement: 1 }), printed: 0.52, printedText: '0.52 (IPCC default, via Andrew 2019)', tol: 0.03, expect: 'agree', sources: ['andrew-2019', 'iupac-ciaaw'], route: '/meteorology/human?tab=electricity' },
  { id: 'pmel', area: 'Oceans', what: 'A 0.11 pH drop as more hydrogen ions', unit: '%', app: () => acidityIncrease(0.11) * 100, printed: 30, printedText: '“approximately a 30%” (PMEL)', tol: 1.5, abs: true, expect: 'agree', sources: ['noaa-pmel-ph'], route: '/meteorology/oceans?tab=change' },
  { id: 'seaice', area: 'Oceans', what: 'Arctic September minimum: our trend vs 1981–2010 mean', unit: '% per decade', app: () => { const r = O.ice.rows as number[][]; const f = ols(r.map((x) => x[0]), r.map((x) => x[3])); const b = r.filter((x) => x[0] >= 1981 && x[0] <= 2010).map((x) => x[3]); return -(f.slope * 10) / (b.reduce((a, c) => a + c, 0) / b.length) * 100; }, printed: 12.2, printedText: '12.2 % (NASA); NSIDC 11.8 %', tol: 1.0, abs: true, expect: 'agree', sources: ['nasa-arctic-sea-ice', 'nsidc-sea-ice-science'], route: '/meteorology/oceans?tab=ice' },
  { id: 'nca5-f', area: 'Future', what: 'NCA5 4.4–5.6 °F → °C (lower bound)', unit: '°C', app: () => f2c(4.4), printed: 2.4, printedText: '2.4 °C (NCA5)', tol: 0.05, abs: true, expect: 'agree', sources: ['nca5-ch2'], route: '/meteorology/future' },
  { id: 'sweet-ft', area: 'Future', what: 'Sweet et al.: High scenario 2.0 m in feet', unit: 'ft', app: () => m2ft(2.0), printed: 6.5, printedText: '“2 m [6.5 feet]”', tol: 0.15, abs: true, expect: 'agree', sources: ['nca5-app3'], route: '/meteorology/future?tab=sea' },
];

export function run(c: Check) {
  const v = c.app(), diff = c.abs ? Math.abs(v - c.printed) : Math.abs(v / c.printed - 1);
  const within = diff <= c.tol;
  return { value: v, diff, within, ok: c.expect === 'agree' ? within : !within };
}
