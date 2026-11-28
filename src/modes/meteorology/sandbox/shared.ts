/** Sandbox: stored experiments and the list of model relations with their sources (shown in the view). */

export interface Saved { name: string; query: string; at: number }
export const SAVED_KEY = 'vv.sandbox.experiments';
export const loadSaved = (): Saved[] => { try { return JSON.parse(localStorage.getItem(SAVED_KEY) ?? '[]') as Saved[]; } catch { return []; } };

export const ASSUMPTIONS: { planet: [string, string[]][]; region: [string, string[]][]; limits: string[] } = {
  planet: [
    ['Gravity g = GM/R² (G from CODATA); NSSDCA’s tabulated value is at the equator including rotation, GM/R² − ω²R.', ['codata-2018', 'nssdc-planetfact-notes']],
    ['Escape velocity √(2GM/R) — Moulton’s V² = 2gR.', ['moulton-1914']],
    ['Sunlight S = 1361 W/m² × (1 au / d)²; perihelion a(1 − e), aphelion a(1 + e).', ['nasa-gsfc-tsi', 'moulton-1914']],
    ['Emission temperature σT⁴ = S(1 − A)/4 + internal heat (Stefan–Boltzmann; a quarter of the sunlight on average).', ['planck-1914', 'nasa-earth-energy-budget']],
    ['Scale height H = R*T/(M g); pressure p₀e^(−z/H) for an isothermal layer.', ['ussa-1976', 'nssdc-factsheet']],
    ['Air above each square metre = p/g (hydrostatic balance); whole atmosphere = 4πR² p/g.', ['ussa-1976']],
    ['Coriolis parameter f = 2Ω sin φ.', ['nws-zhu-winds']],
    ['CO₂ forcing 5.35 ln(C/C₀), scaled by Earth’s likely sensitivity 2.5–4.0 °C per doubling.', ['noaa-aggi', 'nca5-ch3']],
  ],
  region: [
    ['Saturation vapour pressure e_s = 6.11 × 10^(7.5T/(237.3 + T)); relative humidity e/e_s.', ['nws-epz-vapour']],
    ['A rising parcel cools at the dry rate, 9.8 °C/km, until it saturates (the lifting condensation level).', ['nws-glossary', 'nws-btv-lcl']],
    ['Cloud base ≈ (T − T_d in °F) ÷ 4.4 × 1,000 ft (FAA).', ['faa-weather-theory']],
    ['Above cloud base it cools at a moist rate, 1.1–2.8 °C per 1,000 ft (3.6–9.2 °C/km).', ['faa-weather-theory']],
    ['Heat index: the NWS Rothfusz regression; wind chill: the NWS 2001 formula.', ['wpc-heat-index', 'nws-epz-windchill']],
    ['Tropical cyclone formation conditions (sea temperature, latitude, wind shear) as listed by Penn State and NASA.', ['psu-meteo3', 'nasa-eo-hurricanes']],
  ],
  limits: [
    'The energy balance is one global number; the seasonal chart is sunlight at the top of the atmosphere only (no weather, no heat transport).',
    'Grey layers are perfectly opaque and isothermal; the N-layer rule extends a printed 1- and 2-layer pattern.',
    'Albedo is whatever you set; clouds, ice and plants do not respond to temperature.',
    'Greenhouse warming is shown only where a measured temperature exists; changing the planet removes it.',
    'The CO₂ response uses Earth’s sensitivity and applies only to an Earth-like world.',
    'Pressure profile assumes one temperature at all heights.',
    'Not a climate model: no circulation, chemistry, oceans or ice sheets are simulated.',
  ],
};
