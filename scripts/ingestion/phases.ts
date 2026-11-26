/**
 * Phase diagrams (Phase 4, Gate 4.4) → datasets/materials/phase-diagrams.json
 *
 *   node --experimental-strip-types scripts/ingestion/phases.ts
 *
 * H₂O
 *  - Vapour pressure: IAPWS SR1-86(1992) "Saturation properties of ordinary water substance",
 *    Eq. (1); Tc, pc and a1…a6 transcribed from the release PDF (page 3, read as an image).
 *  - Melting (ice Ih, III, V, VI, VII) and sublimation: IAPWS R14-08(2011) "Revised Release on the
 *    Pressure along the Melting and Sublimation Curves", Eqs. (1)–(6); transcribed from the PDF text.
 *  - Coexistence table (liquid & vapour properties, triple → critical): NIST WebBook fluid tool
 *    (IAPWS-95) — used for display AND as an independent check of the auxiliary equations.
 * CO₂
 *  - Liquid–vapour coexistence table (Span–Wagner EOS) from the NIST WebBook fluid tool.
 *  - Sublimation: Antoine parameters from the WebBook phase-change page (Giauque & Egan 1937 data,
 *    154.26–195.89 K) — used only inside that range.
 *  - Triple point (TRC evaluation) from the WebBook phase-change page, for comparison.
 *  - Melting curve: no openly available reference equation was found → NOT bundled (unknown).
 * Lennard-Jones argon: ε/k_B = 120 K, σ = 3.4 Å (Rahman 1964, Phys. Rev. 136, A405), m = 39.948 u.
 */
import { fetchText, writeDataset } from './lib/ingest.ts';

const FLUID = (id: string) => `https://webbook.nist.gov/cgi/fluid.cgi?Action=Data&Wide=on&ID=${id}&Type=SatP&Digits=6&RefState=DEF&TUnit=K&PUnit=MPa&DUnit=kg%2Fm3&HUnit=kJ%2Fkg&WUnit=m%2Fs&VisUnit=Pa*s&STUnit=N%2Fm`;

async function saturation(id: string) {
  const txt = await fetchText(FLUID(id), { minIntervalMs: 5000, cacheKey: `webbook-fluid/${id}-satp.tsv` });
  const [head, ...lines] = txt.trim().split('\n');
  const h = head.split('\t');
  const col = (s: string) => h.indexOf(s);
  const c = { T: col('Temperature (K)'), p: col('Pressure (MPa)'), rl: col('Density (l, kg/m3)'), rv: col('Density (v, kg/m3)'), hl: col('Enthalpy (l, kJ/kg)'), hv: col('Enthalpy (v, kJ/kg)'), wl: col('Sound Spd. (l, m/s)'), wv: col('Sound Spd. (v, m/s)') };
  if (Object.values(c).some((i) => i < 0)) throw new Error(`unexpected columns for ${id}: ${head}`);
  const rows = lines.map((l) => l.split('\t')).map((r) => ({
    T: Number(r[c.T]), pMPa: Number(r[c.p]), rhoL: Number(r[c.rl]), rhoV: Number(r[c.rv]),
    hL: Number(r[c.hl]), hV: Number(r[c.hv]), cL: Number(r[c.wl]), cV: Number(r[c.wv]),
  })).filter((r) => Object.values(r).every(Number.isFinite)).sort((a, b) => a.T - b.T);
  const all = lines.map((l) => l.split("\t")).map((r) => ({ T: Number(r[c.T]), pMPa: Number(r[c.p]) })).filter((r) => Number.isFinite(r.T) && Number.isFinite(r.pMPa));
  const crit = all.reduce((m, r) => (r.T > m.T ? r : m));
  const trip = all.reduce((m, r) => (r.T < m.T ? r : m));
  return { url: FLUID(id).replace("Action=Data", "Action=Load"), critical: crit, triple: trip, units: { T: 'K', p: 'MPa', rho: 'kg/m³', h: 'kJ/kg', c: 'm/s' }, rows };
}

async function webbookPhase(id: string) {
  const html = await fetchText(`https://webbook.nist.gov/cgi/cbook.cgi?ID=${id}&Units=SI&Mask=4`, { minIntervalMs: 5000, cacheKey: `webbook/${id}-4.html` });
  const flat = html.replace(/<[^>]+>/g, "|").replace(/\|[\s|]*/g, "|").replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ');
  const first = (q: string) => { const m = flat.match(new RegExp(`\\|${q}\\|\\s*\\|?([\\d.]+)\\s*\\|\\s*(K|bar)\\s*\\|[^|]*\\|\\s*([^|]+?)\\s*\\|\\s*([^|]*)`)); return m ? { value: Number(m[1]), unit: m[2], reference: m[3].trim(), comment: m[4].trim() } : null; };
  const ant = [...html.matchAll(/<tr[^>]*>\s*<td[^>]*>\s*([\d.]+)\s*(?:-|to)\s*([\d.]+)\s*<\/td>\s*<td[^>]*>\s*([\d.-]+)\s*<\/td>\s*<td[^>]*>\s*([\d.-]+)\s*<\/td>\s*<td[^>]*>\s*([\d.-]+)\s*<\/td>\s*<td[^>]*>([\s\S]*?)<\/td>/g)]
    .map((m) => ({ TminK: Number(m[1]), TmaxK: Number(m[2]), A: Number(m[3]), B: Number(m[4]), C: Number(m[5]), reference: m[6].replace(/<[^>]+>/g, '').trim() }));
  return { Ttriple: first('T\\|triple'), Ptriple: first('P\\|triple'), antoine: ant, url: `https://webbook.nist.gov/cgi/cbook.cgi?ID=${id}&Units=SI&Mask=4` };
}

const waterSat = await saturation('C7732185');
const co2Sat = await saturation('C124389');
const co2Phase = await webbookPhase('C124389');
console.log(`water sat ${waterSat.rows.length} rows ${waterSat.rows[0].T}–${waterSat.rows.at(-1)!.T} K; CO2 sat ${co2Sat.rows.length} rows ${co2Sat.rows[0].T}–${co2Sat.rows.at(-1)!.T} K`);
console.log('CO2 triple (TRC):', co2Phase.Ttriple, co2Phase.Ptriple);
console.log('CO2 Antoine:', JSON.stringify(co2Phase.antoine));
const sub = co2Phase.antoine.find((a) => a.TmaxK < 216.58);
if (!sub) throw new Error('CO2 sublimation Antoine row not found');

const data = {
  version: '1.0.0',
  water: {
    name: 'Water (H₂O)',
    critical: { T: 647.096, pMPa: 22.064, rho: 322, source: 'IAPWS SR1-86(1992)' },
    triple: { T: 273.16, pPa: 611.657, source: 'IAPWS R14-08(2011)' },
    vaporPressure: { equation: 'ln(p/pc) = (Tc/T)[a1τ + a2τ^1.5 + a3τ^3 + a4τ^3.5 + a5τ^4 + a6τ^7.5], τ = 1 − T/Tc', a: [-7.85951783, 1.84408259, -11.7866497, 22.6807411, -15.9618719, 1.80122502], exponents: [1, 1.5, 3, 3.5, 4, 7.5], validK: [273.16, 647.096], source: 'IAPWS SR1-86(1992) Eq. (1)', sources: ['iapws-sr1-86'], transcribed: true },
    melting: [
      { phase: 'ice Ih', form: 'sum', Tstar: 273.16, pstarMPa: 611.657e-6, a: [0.119539337e7, 0.808183159e5, 0.333826860e4], b: [0.300000e1, 0.257500e2, 0.103750e3], validK: [251.165, 273.16], uncertainty: '2 %', eq: 'Eq. (1)' },
      { phase: 'ice III', form: 'single', Tstar: 251.165, pstarMPa: 208.566, a: [-0.299948], b: [60], validK: [251.165, 256.164], uncertainty: '3 %', eq: 'Eq. (2)' },
      { phase: 'ice V', form: 'single', Tstar: 256.164, pstarMPa: 350.1, a: [-1.18721], b: [8], validK: [256.164, 273.31], uncertainty: '3 %', eq: 'Eq. (3)' },
      { phase: 'ice VI', form: 'single', Tstar: 273.31, pstarMPa: 632.4, a: [-1.07476], b: [4.6], validK: [273.31, 355], uncertainty: '3 %', eq: 'Eq. (4)' },
      { phase: 'ice VII', form: 'log', Tstar: 355, pstarMPa: 2216, a: [0.173683e1, -0.544606e-1, 0.806106e-7], b: [-1, 5, 22], validK: [355, 715], uncertainty: '7 %', eq: 'Eq. (5)' },
    ],
    meltingSource: 'IAPWS R14-08(2011)', meltingSources: ['iapws-r14-08'],
    sublimation: { a: [-0.212144006e2, 0.273203819e2, -0.610598130e1], b: [0.333333333e-2, 0.120666667e1, 0.170333333e1], Tstar: 273.16, pstarPa: 611.657, validK: [50, 273.16], equation: 'ln(p/pt) = (Tt/T) Σ ai θ^bi', source: 'IAPWS R14-08(2011) Eq. (6)', sources: ['iapws-r14-08'], transcribed: true },
    saturationTable: { ...waterSat, source: 'NIST WebBook fluid tool, IAPWS-95', sources: ['nist-webbook-fluids', 'wagner-pruss-2002'] },
  },
  co2: {
    name: 'Carbon dioxide (CO₂)',
    critical: { T: co2Sat.critical.T, pMPa: co2Sat.critical.pMPa, source: "critical end point of the Span–Wagner coexistence table (NIST WebBook)" },
    triple: { T: co2Sat.triple.T, pPa: co2Sat.triple.pMPa * 1e6, source: 'start point of the Span–Wagner coexistence table (NIST WebBook)' },
    tripleMeasured: co2Phase.Ttriple && co2Phase.Ptriple ? { T: co2Phase.Ttriple.value, pPa: Math.round(co2Phase.Ptriple.value * 1e5), reference: `${co2Phase.Ttriple.reference}; ${co2Phase.Ptriple.reference} (TRC evaluation)`, url: co2Phase.url } : null,
    sublimation: { form: 'antoine-log10-bar', A: sub.A, B: sub.B, C: sub.C, validK: [sub.TminK, sub.TmaxK], reference: sub.reference, url: co2Phase.url, sources: ['nist-webbook', 'giauque-egan-1937'] },
    melting: null,
    meltingNote: 'No openly available reference melting equation was found; the solid–liquid boundary above the triple point is not drawn.',
    saturationTable: { ...co2Sat, source: 'NIST WebBook fluid tool, Span–Wagner (1996) EOS', sources: ['nist-webbook-fluids', 'span-wagner-1996'] },
  },
  lennardJonesArgon: { epsilonOverK: 120, sigmaAngstrom: 3.4, massU: 39.948, source: 'Rahman (1964) Phys. Rev. 136, A405', sources: ['rahman-1964'], tripleK_ITS90: 83.8058, tripleSource: 'ITS-90 defining fixed point (Preston-Thomas 1990)' },
};

writeDataset('datasets/materials/phase-diagrams.json', data, {
  dataset: 'phase-diagrams', version: '1.0.0', records: 2,
  sources: [
    { institution: 'IAPWS SR1-86(1992) Saturation properties of ordinary water substance', url: 'https://iapws.org/technical-guidance/release/Supp-sat', notes: 'coefficients transcribed from the PDF' },
    { institution: 'IAPWS R14-08(2011) Melting and sublimation curves', url: 'https://iapws.org/technical-guidance/release/MeltSub', notes: 'coefficients transcribed from the PDF text' },
    { institution: 'NIST WebBook — fluid saturation tables (IAPWS-95, Span–Wagner)', url: 'https://webbook.nist.gov/chemistry/fluid/', license: 'NIST SRD' },
    { institution: 'NIST WebBook phase-change data for CO₂ (TRC triple point; Antoine fit to Giauque & Egan 1937)', url: co2Phase.url },
    { institution: 'Rahman (1964) Phys. Rev. 136, A405', url: 'https://doi.org/10.1103/PhysRev.136.A405' },
  ],
  adapter: 'scripts/ingestion/phases.ts',
  warnings: ['IAPWS coefficients transcribed by hand (verified by tests against the WebBook IAPWS-95 table and triple points).', 'CO₂ melting curve not bundled.'],
});
