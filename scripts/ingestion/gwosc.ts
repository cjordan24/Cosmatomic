/**
 * Phase 7, Gate 7.5 — gravitational waves → datasets/astronomical/gravitational-waves.json
 *
 *   node --experimental-strip-types scripts/ingestion/gwosc.ts
 *
 * 1. Event parameters. One request to the GWOSC Event Portal API for the cumulative Gravitational-Wave
 *    Transient Catalog: https://gwosc.org/eventapi/jsonfull/GWTC/ (latest version of every confident event).
 *    gwosc.org/robots.txt (read 2026-11-27) disallows /catalog/, /archive/, /timelinejson/ and the per-event
 *    data directories, NOT /eventapi/. Data licence CC BY 4.0 (gwosc.org/acknowledge); GWOSC asks users to
 *    cite its open-data papers. GWOSC API documentation: "_lower and _upper counterparts for the lower and
 *    upper limits of the 90% confidence error bar". The bulk-strain URLs are dropped.
 *    Values were checked by hand against the printed tables of the catalog papers (arXiv PDFs read with
 *    PDFKit): GW150914 (GWTC-1 Table III vs the GWTC-2.1 update), GW170817 (GWTC-1 Table III),
 *    GW250114_082203, GW240413_022019, GW240414_054515, GW240420_175625 (GWTC-5.0 results, Table 3).
 *    All masses, distances and redshifts agree; GWOSC's SNR is a different quantity (see warnings).
 * 2. GW150914 read off the strain data: the order-of-magnitude values of the LIGO/Virgo paper “The basic
 *    physics of the binary black hole merger GW150914” (Ann. Phys. 529, 1600209; arXiv:1608.01940, CC BY 4.0),
 *    §2–§5 and eqs. 2–23, transcribed from the PDF text.
 * 3. Curated GW170817 multi-messenger values, transcribed from the arXiv PDF text of
 *      Abbott et al. (2017) ApJL 848, L13 (arXiv:1710.05834): abstract, §2 and §4.1 (time delay, distance
 *      used, emission-time assumption, speed-of-gravity bounds);
 *      Abbott et al. (2017) Nature 551, 85 (arXiv:1710.05835v1): GW distance, Hubble-flow velocity, H₀ and
 *      the Planck 2015 and SH0ES 2016 values it compares with.
 *
 * Integrity checks (throw on failure): expected releases; every physical parameter with a value has both
 * bounds, lower ≤ 0 ≤ upper, except GW170817's final mass, which GWTC-1 Table III prints as an upper bound
 * (≤ 2.8 M☉) and is stored as one; median m₁ ≥ median m₂ and median M_f ≤ median M (both hold sample by
 * sample, so they hold for the quantiles); the catalog redshift equals z(d_L) in the catalog's own cosmology
 * (medians commute with the monotone map d_L → z) within the rounding of the printed values.
 */
import { fetchText, writeDataset } from './lib/ingest.ts';

const URL_GWTC = 'https://gwosc.org/eventapi/jsonfull/GWTC/';
const raw = JSON.parse(await fetchText(URL_GWTC, { minIntervalMs: 3000, cacheKey: 'gwosc/eventapi-jsonfull-GWTC.json', maxBytes: 8_000_000 })) as { events: Record<string, Record<string, unknown>> };

/** Release keys used by GWOSC → display label, observing run(s) and our Source-index id. */
const RELEASES = [
  { key: 'GWTC-1-confident', label: 'GWTC-1', runs: 'O1–O2', source: 'gwtc-1', note: 'Only GW170817 remains at this version: the GWTC-1 binary black holes were re-analysed in GWTC-2.1.' },
  { key: 'GWTC-2.1-confident', label: 'GWTC-2.1', runs: 'O3a (+ O1–O2 re-analysis)', source: 'gwtc-2.1', note: 'Confident O3a events and updated source properties for the binary black holes first reported in GWTC-1 (GWOSC catalog description).' },
  { key: 'GWTC-3-confident', label: 'GWTC-3', runs: 'O3b', source: 'gwtc-3', note: 'Confident O3b events (GWOSC catalog description).' },
  { key: 'GWTC-4.1', label: 'GWTC-4.1', runs: 'O4a', source: 'gwtc-5', note: 'Confident O4a events, as described in the GWTC-5.0 catalog paper (GWOSC catalog description).' },
  { key: 'GWTC-5.0', label: 'GWTC-5.0', runs: 'O4b', source: 'gwtc-5', note: 'Confident O4b events (GWOSC catalog description).' },
] as const;
const RELEASE_KEYS = new Set<string>(RELEASES.map((r) => r.key));

/** [GWOSC field, short key, unit] for the physical parameters (median with 90 % bounds). */
const PHYS = [
  ['mass_1_source', 'm1', 'M☉'], ['mass_2_source', 'm2', 'M☉'], ['total_mass_source', 'M', 'M☉'], ['chirp_mass_source', 'Mc', 'M☉'],
  ['final_mass_source', 'Mf', 'M☉'], ['luminosity_distance', 'dL', 'Mpc'], ['redshift', 'z', ''], ['chi_eff', 'chi', ''],
] as const;

type Triple = [number, number, number] | null;
interface Ev {
  /** full name GWYYMMDD[_hhmmss] (from the API key); cn: the shorter common name where it differs */
  n: string; cn?: string; v: number; r: string; gps: number;
  m1: Triple; m2: Triple; M: Triple; Mc: Triple; Mf: Triple; dL: Triple; z: Triple; chi: Triple;
  /** GWTC-1 prints GW170817's final mass as an upper bound */
  MfMax?: number;
  snr: number | null; far: number | null; pa: number | null;
}

const num = (x: unknown): number | null => (typeof x === 'number' && Number.isFinite(x) ? x : null);
const events: Ev[] = [];
for (const [key, e] of Object.entries(raw.events)) {
  const r = String(e['catalog.shortName']);
  if (!RELEASE_KEYS.has(r)) throw new Error(`${key}: unexpected release ${r}`);
  const full = key.replace(/-v\d+$/, ''), common = String(e.commonName);
  const ev: Ev = { n: full, ...(common !== full ? { cn: common } : {}), v: Number(e.version), r, gps: Number(e.GPS), m1: null, m2: null, M: null, Mc: null, Mf: null, dL: null, z: null, chi: null, snr: num(e.network_matched_filter_snr), far: num(e.far), pa: num(e.p_astro) };
  if (key !== `${full}-v${ev.v}` || !full.startsWith(common)) throw new Error(`${key}: key does not match name ${common} and version ${ev.v}`);
  for (const [f, k, unit] of PHYS) {
    const val = num(e[f]), lo = num(e[`${f}_lower`]), hi = num(e[`${f}_upper`]);
    if (val === null) continue;
    const u = e[`${f}_unit`];
    if (unit === 'M☉' && u !== 'M_sun') throw new Error(`${key} ${f}: unit ${u}`);
    if (unit === 'Mpc' && u !== 'Mpc') throw new Error(`${key} ${f}: unit ${u}`);
    if (lo === null || hi === null) {
      if (ev.n === 'GW170817' && f === 'final_mass_source' && val === 2.8) { ev.MfMax = val; continue; }
      throw new Error(`${key} ${f}: value without 90 % bounds`);
    }
    if (lo > 0 || hi < 0) throw new Error(`${key} ${f}: bounds ${lo}, ${hi} do not bracket the median`);
    ev[k] = [val, Math.abs(lo), hi];
  }
  const farUnit = e.far_unit;
  if (ev.far !== null && farUnit !== '1/yr' && farUnit !== 'yr^-1') throw new Error(`${key}: FAR unit ${farUnit}`);
  events.push(ev);
}
events.sort((a, b) => a.gps - b.gps);

// ---------------------------------------------------------------- checks
const checks: string[] = [];
const byName = new Map(events.map((e) => [e.n, e]));
for (const r of RELEASES) if (!events.some((e) => e.r === r.key)) throw new Error(`no events in ${r.key}`);
for (const e of events) {
  if (e.m1 && e.m2 && e.m1[0] < e.m2[0]) throw new Error(`${e.n}: median m1 < median m2`);
  if (e.M && e.Mf && e.Mf[0] > e.M[0]) throw new Error(`${e.n}: median final mass above median total mass`);
  if (!/^GW\d{6}(_\d{6})?$/.test(e.n)) throw new Error(`${e.n}: name not in the GWYYMMDD[_hhmmss] format`);
}

// z(d_L) in the catalog cosmology: flat ΛCDM, H0 = 67.9 km/s/Mpc, Ωm = 0.3065, ΩΛ = 1 − Ωm (no radiation),
// GWTC-5.0 introduction §; the same values in GWTC-1 App. B, GWTC-2.1 §, GWTC-3 §.
const C_KMS = 299792.458, H0 = 67.9, OM = 0.3065;
const dLflat = (z: number) => {
  const n = 400; let s = 0; // Simpson on [0, z]
  for (let i = 0; i <= n; i++) { const x = (z * i) / n, w = i === 0 || i === n ? 1 : i % 2 ? 4 : 2; s += w / Math.sqrt(OM * (1 + x) ** 3 + 1 - OM); }
  return (1 + z) * (C_KMS / H0) * (s * z) / (3 * n);
};
const zOfDl = (d: number) => { let a = 0, b = 20; for (let i = 0; i < 80; i++) { const m = (a + b) / 2; if (dLflat(m) < d) a = m; else b = m; } return (a + b) / 2; };
let maxDz = 0, worst = '', nz = 0;
for (const e of events) {
  if (!e.dL || !e.z) continue;
  if (e.n === 'GW170817') continue; // GWTC-1 used the redshift of NGC 4993 (Table III caption), not z(d_L)
  // printed z has 2 decimals (±0.005) and d_L as few as 2 significant figures (±2.5 %): allow both roundings
  const dz = Math.abs(zOfDl(e.dL[0]) - e.z[0]);
  const zTol = 0.005 + (zOfDl(e.dL[0] * 1.025) - zOfDl(e.dL[0] * 0.975)) / 2;
  nz++;
  if (dz > maxDz) { maxDz = dz; worst = e.n; }
  if (dz > zTol) throw new Error(`${e.n}: catalog z = ${e.z[0]} but z(d_L = ${e.dL[0]} Mpc) = ${zOfDl(e.dL[0]).toFixed(4)}`);
}
checks.push(`catalog redshift reproduced from the median d_L in flat ΛCDM (H₀ = 67.9, Ωm = 0.3065) for ${nz} events; largest difference ${maxDz.toFixed(4)} (${worst}), within the rounding of the printed values`);

// chirp mass from the median component masses vs the median chirp mass (not expected to agree exactly)
const mc = (a: number, b: number) => (a * b) ** 0.6 / (a + b) ** 0.2;
const rel = events.filter((e) => e.m1 && e.m2 && e.Mc).map((e) => ({ n: e.n, d: (mc(e.m1![0], e.m2![0]) - e.Mc![0]) / e.Mc![0] }));
const relMax = rel.reduce((a, b) => (Math.abs(b.d) > Math.abs(a.d) ? b : a));
const relMed = [...rel.map((x) => Math.abs(x.d))].sort((a, b) => a - b)[Math.floor(rel.length / 2)];
checks.push(`chirp mass recomputed from the median m₁ and m₂ differs from the catalog median chirp mass by a median ${(relMed * 100).toFixed(1)} % (largest ${(relMax.d * 100).toFixed(1)} %, ${relMax.n}); medians of different parameters are not related by the formula exactly`);

// hand checks against the printed tables (values copied from the PDFs)
const hand: [string, keyof Ev, [number, number, number]][] = [
  ['GW250114_082203', 'M', [66.0, 1.2, 1.1]], ['GW250114_082203', 'Mc', [28.71, 0.51, 0.5]], ['GW250114_082203', 'm1', [33.76, 0.9, 1.28]], ['GW250114_082203', 'm2', [32.26, 1.47, 0.95]], ['GW250114_082203', 'Mf', [62.9, 1.1, 1.0]], ['GW250114_082203', 'z', [0.09, 0.01, 0.02]],
  ['GW240413_022019', 'm1', [7.9, 1.2, 2.8]], ['GW240414_054515', 'Mc', [27.1, 2.8, 3.6]], ['GW240420_175625', 'Mf', [56.0, 8.3, 9.8]],
  ['GW170817', 'm1', [1.46, 0.10, 0.12]], ['GW170817', 'm2', [1.27, 0.09, 0.09]], ['GW170817', 'Mc', [1.186, 0.001, 0.001]], ['GW170817', 'dL', [40, 15, 7]],
];
for (const [n, k, t] of hand) {
  const v = byName.get(n)?.[k] as Triple | undefined;
  if (!v || v.some((x, i) => Math.abs(x - t[i]) > 1e-9)) throw new Error(`${n} ${String(k)}: GWOSC ${JSON.stringify(v)} differs from the printed table ${JSON.stringify(t)}`);
}
checks.push(`${hand.length} values checked against the printed tables of GWTC-1 (Table III) and GWTC-5.0 (Table 3): all identical`);
if (byName.get('GW170817')?.MfMax !== 2.8) throw new Error('GW170817 final-mass bound missing');

// ---------------------------------------------------------------- GW170817 multi-messenger (curated)
const gw170817 = {
  grb: {
    source: 'abbott-2017-grb',
    delay: { value: 1.74, sigma: 0.05, unit: 's', interval: '68 % (“In this Letter all derived gamma-ray results use 68% confidence levels.”)', note: 'start of the gamma-ray emission relative to the GW merger time (§2)' },
    distanceUsed: { value: 26, unit: 'Mpc', note: '“we conservatively use here D = 26 Mpc, the lower bound of the 90% credible interval on luminosity distance derived from the GW signal” (§4.1)' },
    emissionLagAssumed: { value: 10, unit: 's', note: 'for the lower bound “we assume the SGRB signal was emitted 10 s after the GW signal” (§4.1)' },
    bounds: { lower: -3e-15, upper: 7e-16, note: 'Δv/v_EM between −3 × 10⁻¹⁵ and +7 × 10⁻¹⁶ (abstract, eq. 1)' },
    relation: '“the fractional speed difference during the trip can be written Δv/v_EM ≈ v_EM Δt/D, where Δv = v_GW − v_EM” (§4.1)',
    chance: { value: 5.0e-8, note: 'probability of the near-simultaneous temporal and spatial observation occurring by chance (abstract)' },
    quotes: [
      { where: 'abstract', text: 'We therefore confirm binary neutron star mergers as a progenitor of short GRBs.' },
      { where: '§4.2', text: 'Standard EM theory minimally coupled to general relativity predicts that GWs and light propagate with identical speeds.' },
    ],
  },
  siren: {
    source: 'abbott-2017-h0',
    distance: { value: 43.8, minus: 6.9, plus: 2.9, unit: 'Mpc', interval: '68.3 % (maximum posterior value with the minimal-width credible interval)', note: 'GW data alone, sky position fixed to the optical counterpart' },
    tullyFisher: { value: 41.1, sigma: 5.8, unit: 'Mpc', note: 'distance to NGC 4993 from the Tully–Fisher relation, as quoted (Sakai et al. 2000; Freedman et al. 2001)' },
    groupVelocity: { value: 3327, sigma: 72, unit: 'km/s', note: 'CMB-frame recession velocity of the ESO-508 group (Crook et al. 2007), as quoted' },
    bulkFlow: { value: 310, sigma: 150, unit: 'km/s', note: 'coherent bulk-flow correction; standard error 69 km/s, but the more conservative 150 km/s is adopted' },
    hubbleVelocity: { value: 3017, sigma: 166, unit: 'km/s', interval: '68.3 %' },
    H0: { value: 70.0, minus: 8.0, plus: 12.0, unit: 'km/s/Mpc', interval: '68.3 % (maximum a posteriori and minimal credible interval)', note: 'Bayesian posterior marginalised over inclination and velocities' },
    compared: [
      { label: 'Planck 2015 (TT,TE,EE+lowP+lensing+ext)', value: 67.74, sigma: 0.46, note: 'as quoted' },
      { label: 'SH0ES 2016 (Riess et al. 2016)', value: 73.24, sigma: 1.74, note: 'as quoted' },
    ],
    cosIota: { lo: -1.0, hi: -0.81, interval: '68.3 %', note: 'inclination 144–180°' },
    quotes: [
      { where: 'abstract', text: 'This approach does not require any form of cosmic “distance ladder”; the gravitational-wave (GW) analysis can be used to estimate the luminosity distance out to cosmological scales directly, without the use of intermediate astronomical distance measurements.' },
      { where: 'p. 2', text: 'As vH/c∼1% for GW170817 we do not distinguish between them.' },
    ],
  },
};

// ---------------------------------------------------------------- GW150914 read off the data (curated)
// abbott-2017-basic-physics (Ann. Phys. 529, 1600209; arXiv:1608.01940), CC BY 4.0. Order-of-magnitude
// values the paper derives from the strain data with Newtonian physics; quoted, not fitted.
const basicPhysics = {
  source: 'abbott-2017-basic-physics',
  band: { lo: 35, hi: 350, unit: 'Hz', note: 'band-pass of the plotted strain data (§2)' },
  visibleDuration: { value: 0.15, unit: 's', note: '“The entire visible part of the signal lasts for around 0.15s.” (§2)' },
  inspiralBand: { lo: 30, hi: 150, unit: 'Hz', note: 'GW frequencies while the inspiral is visible (§2)' },
  fMax: { value: 150, unit: 'Hz', note: 'GW frequency at maximum strain amplitude, a “conservative (low) value” (eq. 2)' },
  chirpMass: { value: 30, unit: 'M☉', note: 'detector frame, adopted from f and ḟ (eq. 7) “for simplicity”; the implied value “remains constant to within 35%” over 30–150 Hz (§2)' },
  chirpMassFit: { value: 37, unit: 'M☉', note: 'from the slope of a linear fit to f^(−8/3)(t) from zero-crossings (Fig. 3 caption, eq. 8)' },
  equalMass: { value: 35, unit: 'M☉', note: 'm₁ = m₂ = 2^(1/5) 𝓜 (§3)' },
  separation: { value: 350, unit: 'km', note: 'Keplerian separation at f_max for M = 70 M☉ (eq. 9)' },
  compactness: { value: 1.7, note: '350 km / 206 km (§3)' },
  hMax: { value: 1e-21, note: 'peak measured strain (§5)' },
  distance: { value: 300, unit: 'Mpc', note: 'd_L ∼ 45 Gpc (Hz/f_max)(10⁻²¹/h_max) (eq. 22)' },
  energy: { value: 3, unit: 'M☉c²', note: 'E_GW ∼ GMμ/2R down to R = 350 km, a lower-bound estimate (eq. 23)' },
  quotes: [
    { where: 'abstract', text: 'The GW150914 signal was strong enough to be apparent, without using any waveform model, in the filtered detector strain data.' },
    { where: '§2', text: 'Note that the characteristic mass scale of the radiating system is obtained by direct inspection of the time-frequency behavior of the observational data.' },
  ],
};

const releaseCounts = Object.fromEntries(RELEASES.map((r) => [r.key, events.filter((e) => e.r === r.key).length]));
const withParams = events.filter((e) => e.m1).length;
writeDataset('datasets/astronomical/gravitational-waves.json', {
  version: '1.0.0',
  dataSource: 'gwosc',
  endpoint: URL_GWTC,
  interval: '90 % credible interval: median with the lower and upper limits of the 90 % interval (GWOSC API documentation; the catalog papers give symmetric 90 % credible intervals)',
  format: '[median, minus, plus]; null = not released in the event API (shown as unknown)',
  releases: RELEASES.map((r) => ({ ...r, count: releaseCounts[r.key] })),
  cosmology: { H0, Om: OM, Ode: 1 - OM, source: 'gwtc-5-intro', note: 'flat ΛCDM of Ade et al. (2016, Planck 2015, TT+lowP+lensing+ext), used by every release to convert d_L to z and detector-frame to source-frame masses' },
  fields: {
    m1: 'primary (heavier) mass, source frame', m2: 'secondary mass, source frame', M: 'total mass, source frame', Mc: 'chirp mass, source frame',
    Mf: 'final (remnant) mass, source frame', dL: 'luminosity distance (Mpc)', z: 'redshift', chi: 'effective inspiral spin χ_eff',
    snr: 'network matched-filter SNR as shown by the GWOSC event portal (default parameter-estimation result, or the highest search SNR)',
    far: 'false-alarm rate (per year), lowest across search pipelines', pa: 'probability of astrophysical origin, highest across search pipelines',
  },
  events,
  basicPhysics,
  gw170817,
  checks,
}, {
  dataset: 'gravitational-waves',
  version: '1.0.0',
  records: events.length,
  sources: [
    { institution: 'Gravitational Wave Open Science Center (GWOSC), Event Portal API', url: URL_GWTC, license: 'CC BY 4.0 (gwosc.org/acknowledge); cite the LIGO/Virgo/KAGRA open-data papers', notes: `cumulative GWTC, latest version of each event: ${events.length} events, ${withParams} with parameters (${Object.entries(releaseCounts).map(([k, n]) => `${k} ${n}`).join(', ')})` },
    { institution: 'LIGO, Virgo and KAGRA Collaborations: Open Data through the Second Part of O4 (arXiv:2605.27090)', url: 'https://arxiv.org/abs/2605.27090', notes: 'citation requested by GWOSC' },
    { institution: 'Abbott et al. (2019), PRX 9, 031040 (GWTC-1)', url: 'https://doi.org/10.1103/PhysRevX.9.031040', notes: 'Table III (GW170817 row; final mass ≤ 2.8 M☉), App. B cosmology' },
    { institution: 'Abbott et al. (2024), PRD 109, 022001 (GWTC-2.1)', url: 'https://doi.org/10.1103/PhysRevD.109.022001', notes: 'release of the O3a events and the O1–O2 re-analysis' },
    { institution: 'Abbott et al. (2023), PRX 13, 041039 (GWTC-3)', url: 'https://doi.org/10.1103/PhysRevX.13.041039', notes: 'O3b events; naming GWYYMMDD_hhmmss (Table I caption)' },
    { institution: 'LIGO, Virgo and KAGRA Collaborations (2026), GWTC-5.0 results (arXiv:2605.27225)', url: 'https://arxiv.org/abs/2605.27225', notes: 'O4a (GWTC-4.1) and O4b (GWTC-5.0) events; Table 3 checked against GWOSC' },
    { institution: 'LIGO, Virgo and KAGRA Collaborations (2026), GWTC-5.0 introduction (arXiv:2605.27223)', url: 'https://arxiv.org/abs/2605.27223', notes: 'flat ΛCDM: H₀ = 67.9 km/s/Mpc, Ωm = 0.3065' },
    { institution: 'LIGO and Virgo Collaborations (2017), Ann. Phys. 529, 1600209', url: 'https://doi.org/10.1002/andp.201600209', license: 'CC BY 4.0', notes: 'GW150914 read off the strain data: f_max, chirp mass, separation, distance and energy estimates (eqs. 2–23)' },
    { institution: 'Abbott et al. (2017), ApJL 848, L13', url: 'https://doi.org/10.3847/2041-8213/aa920c', license: 'CC BY 3.0', notes: 'GW170817–GRB 170817A delay and speed-of-gravity bounds' },
    { institution: 'Abbott et al. (2017), Nature 551, 85', url: 'https://doi.org/10.1038/nature24471', notes: 'GW170817 standard-siren H₀ (arXiv:1710.05835v1)' },
  ],
  adapter: 'scripts/ingestion/gwosc.ts',
  warnings: [
    `${events.length - withParams} of ${events.length} events have no parameters in the event API (GWOSC releases them only for the events in each paper’s source-properties table); they are listed with “unknown” values.`,
    'GWOSC’s network SNR differs from the SNR column of GWTC-5.0 Table 3 (e.g. GW250114_082203: 78.6 vs 76.9; GW240413_022019: 18.1 vs 17.3). GWOSC describes its value as the default parameter-estimation SNR or the highest search SNR; it is shown labelled as GWOSC’s, not as the paper’s.',
    'GW240420_175625: χ_eff is missing from the event API although GWTC-5.0 Table 3 prints 0.00 +0.23 −0.25; shown as unknown.',
    'GW170817: GWTC-1 Table III gives the final mass only as an upper bound (≤ 2.8 M☉); the event API returns 2.8 without bounds, stored here as the bound. Its redshift is that of NGC 4993, not z(d_L).',
    'Medians of different parameters are not related exactly by the physical formulas (e.g. chirp mass from median m₁ and m₂, or M − M_f as radiated energy).',
    ...checks,
  ],
});
