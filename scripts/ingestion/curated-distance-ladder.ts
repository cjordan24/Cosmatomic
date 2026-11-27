/**
 * Curated distance ladder (Phase 7, Gate 7.2) → datasets/astronomical/distance-ladder.json
 *
 *   node --experimental-strip-types scripts/ingestion/curated-distance-ladder.ts
 *
 * Transcribed by hand from the arXiv PDF text (read with PDFKit) of:
 *  - Riess, A. G. et al. (2022) ApJL 934, L7 (arXiv:2112.04510v3), "SH0ES 2022": eq. 1 (Leavitt law),
 *    eq. 5 (H₀ from M_B and a_B), Table 5 row 1 (baseline fit), Table 6 (42 calibrator SNe Ia in 37
 *    Cepheid hosts, copied row by row from the PDF text below), §4.1–4.3 (anchors), §5 (baseline H₀).
 *  - Freedman, W. L. (2021) ApJ 919, 16 (arXiv:2106.15656v1): Table 3 (TRGB zero point) and the abstract.
 *  - Freedman, W. L. et al. (2025) ApJ 985, 203 (arXiv:2408.06153v3): abstract. An erratum exists
 *    (ApJ 993, 252; Crossref 10.3847/1538-4357/ae146d). Its text was NOT read: iopscience.iop.org's
 *    robots.txt disallows all automated agents. The record carries that flag.
 *  - Pietrzyński, G. et al. (2019) Nature 567, 200 (arXiv:1903.08096): LMC distance from 20 DEBs.
 *  - Reid, M. J., Pesce, D. W. & Riess, A. G. (2019) ApJL 886, L27 (arXiv:1908.05625v2): NGC 4258.
 *
 * Interval types: none of these papers attaches a probability level to "±"; they report significances
 * in σ (R22 §5, Fig. 15; F21 §5 "1σ uncertainties … 16th and 84th percentiles"), so ± is read as 1σ
 * (68 %) and every record says so ('1σ (implied)'). Statistical and systematic parts are kept apart.
 */
import { writeDataset } from './lib/ingest.ts';

const IMPLIED = '1σ (implied: “±” with significances quoted in σ)';

// ---------------------------------------------------------------- anchors (geometric distances)
const anchors = [
  { id: 'lmc', name: 'Large Magellanic Cloud', method: 'detached eclipsing binaries (20 systems; surface-brightness–colour relation)',
    distance: { value: 49.59, stat: 0.09, sys: 0.54, unit: 'kpc' }, interval: IMPLIED, source: 'pietrzynski-2019',
    adoptedMu: { value: 18.477, sigma: 0.0263, source: 'riess-2022', note: 'distance modulus adopted by SH0ES 2022 from Pietrzyński et al. (2019), §4.3' } },
  { id: 'ngc4258', name: 'NGC 4258', method: 'water megamaser disc orbiting the central black hole (VLBI positions, velocities and accelerations)',
    distance: { value: 7.576, stat: 0.082, sys: 0.076, unit: 'Mpc' }, interval: IMPLIED, source: 'reid-2019', adoptedMu: null },
  { id: 'mw', name: 'Milky Way Cepheids', method: 'Gaia EDR3 trigonometric parallaxes of Milky Way Cepheids',
    distance: null, interval: null, source: 'riess-2022', adoptedMu: null,
    meanParallaxUas: 650, note: 'SH0ES 2022 §4.1: the Gaia EDR3 calibration is 1 % in the zero point; the 6 µas uncertainty of the Gaia parallax offset gives 0.9 % “due to its mean 650 micro-arcsecond parallax”.' },
];

// ---------------------------------------------------------------- Cepheid Leavitt law (R22 eq. 1, Table 5 row 1)
const leavitt = {
  source: 'riess-2022', equation: 'm_H^W = μ₀ + M_H,1^W + b_W (log P − 1) + Z_W [O/H]', band: 'Wesenheit H (F160W with F555W, F814W colour term)',
  MW1: { value: -5.894, sigma: 0.017 }, bW: { value: -3.299, sigma: 0.015 }, ZW: { value: -0.217, sigma: 0.046 }, interval: IMPLIED,
  periodRangeDays: [5, 120], periodNote: 'period range of the host P–L fits in §4.6 (5 < P < 120 d)',
  lmcOH: { value: -0.29, sigma: 0.02, note: 'mean spectroscopic [O/H] adopted for the LMC Cepheids (§4.3)' },
  intrinsicScatter: 0.07, scatterNote: 'width of the instability strip in m_H^W set from the LMC Cepheids (§4.3)',
  nCepheidsN4258: 443, nCepheidsLMC: 70,
};

// ---------------------------------------------------------------- TRGB zero point (F21 Table 3)
const T = (object: string, M: number, stat: number, sys: number, reference: string, note: string, adopted = false) => ({ object, M, stat, sys, reference, note, adopted });
const trgb = {
  source: 'freedman-2021', band: 'HST ACS F814W', interval: IMPLIED,
  calibrations: [
    T('NGC 4258', -4.050, 0.028, 0.048, 'Jang et al. (2021)', 'H₂O megamaser distance calibration'),
    T('Milky Way globular clusters', -4.063, 0.07, 0.11, 'Cerny et al. (2020)', 'ω Cen DEB calibration; transformed from M_I'),
    T('LMC', -4.045, 0.012, 0.034, 'Hoyt (2021)', 'LMC DEB calibration; transformed from M_I'),
    T('SMC', -4.057, 0.030, 0.040, 'Hoyt (2021)', 'transformed from M_I'),
    T('Sculptor', -4.08, 0.06, 0.11, 'Tran et al. (2021)', 'transformed from M_I'),
    T('Fornax', -4.05, 0.04, 0.11, 'Oakes et al. (2021)', 'transformed from M_I'),
    T('LMC globular clusters', -4.085, 0.05, 0.10, 'Freedman (2021)', ''),
    T('Adopted value (MW, NGC 4258, LMC, SMC)', -4.049, 0.015, 0.035, 'Freedman (2021) §2.6', 'used for H₀', true),
  ],
  transformNote: 'M_F814W = M_I − 0.0068 mag (Table 3 note c, following Freedman et al. 2019)',
};

// ---------------------------------------------------------------- SNe Ia (R22 Table 6 and Table 5 row 1)
// Copied from the PDF text of Table 6: N, host, SN, m⁰_B,i, σ, µ_Ceph(a), σ, M⁰_B,i, σ, µ_host(b), σ, R(c)
const TABLE6 = `1 M101 2011fe 9.7800 0.115 29.193 0.039 -19.413 0.122 29.178 0.041 0.44
2 M1337 2006D 13.655 0.106 32.922 0.124 -19.267 0.163 32.920 0.123 0.43
3 N0105 2007A 15.250 0.133 34.531 0.253 -19.281 0.286 34.527 0.250 0.37
4 N0691 2005W 13.602 0.139 32.846 0.109 -19.244 0.177 32.830 0.109 0.42
5 N0976 1999dq 14.250 0.103 33.719 0.151 -19.468 0.183 33.709 0.149 0.30
6 N1015 2009ig 13.350 0.094 32.570 0.075 -19.220 0.120 32.563 0.074 0.46
7 N1309 2002fk 13.209 0.082 32.546 0.060 -19.337 0.102 32.541 0.059 0.38
8 N1365 2012fr 11.900 0.092 31.379 0.057 -19.479 0.108 31.378 0.056 0.46
9 N1448 2001el 12.254 0.136 31.290 0.037 -19.036 0.141 31.287 0.037 0.41
10 N1448 2021pit 11.752 0.200 31.290 0.037 -19.538 0.203 31.287 0.037 0.41
11 N1559 2005df 12.141 0.086 31.501 0.062 -19.360 0.106 31.491 0.061 0.35
12 N2442 2015F 12.234 0.082 31.457 0.065 -19.223 0.105 31.450 0.064 0.36
13 N2525 2018gv 12.728 0.074 32.067 0.100 -19.339 0.124 32.051 0.099 0.39
14 N2608 2001bg 13.443 0.166 32.629 0.155 -19.186 0.227 32.612 0.154 0.39
15 N3021 1995al 13.114 0.116 32.474 0.160 -19.360 0.198 32.464 0.158 0.34
16 N3147 2021hpr 13.843 0.159 33.044 0.165 -19.201 0.229 33.014 0.165 0.45
17 N3147 1997bq 13.821 0.141 33.044 0.165 -19.223 0.217 33.014 0.165 0.45
18 N3147 2008fv 13.936 0.200 33.044 0.165 -19.108 0.260 33.014 0.165 0.45
19 N3254 2019np 13.201 0.074 32.332 0.077 -19.130 0.107 32.331 0.076 0.52
20 N3370 1994ae 12.937 0.082 32.123 0.052 -19.186 0.097 32.120 0.051 0.33
21 N3447 2012ht 12.736 0.089 31.939 0.035 -19.203 0.096 31.936 0.034 0.40
22 N3583 ASASSN-15so 13.509 0.093 32.808 0.081 -19.299 0.123 32.804 0.080 0.34
23 N3972 2011by 12.548 0.094 31.644 0.090 -19.096 0.130 31.635 0.089 0.46
24 N3982 1998aq 12.252 0.078 31.724 0.072 -19.472 0.106 31.722 0.071 0.36
25 N4038 2007sr 12.409 0.106 31.615 0.117 -19.206 0.158 31.603 0.116 0.57
26 N4424 2012cg 11.487 0.192 30.856 0.130 -19.369 0.232 30.844 0.128 0.87
27 N4536 1981B 11.551 0.133 30.838 0.051 -19.287 0.142 30.835 0.050 0.49
28 N4639 1990N 12.454 0.124 31.818 0.085 -19.364 0.150 31.812 0.084 0.48
29 N4680 1997bp 13.173 0.205 32.606 0.208 -19.433 0.292 32.599 0.205 0.48
30 N5468 1999cp 13.880 0.080 33.120 0.075 -19.240 0.110 33.116 0.074 0.39
31 N5468 2002cr 13.993 0.072 33.120 0.075 -19.127 0.104 33.116 0.074 0.39
32 N5584 2007af 12.804 0.079 31.775 0.053 -18.971 0.095 31.772 0.052 0.36
33 N5643 2013aa 11.252 0.079 30.569 0.050 -19.317 0.093 30.546 0.052 0.39
34 N5643 2017cbv 11.208 0.074 30.569 0.050 -19.362 0.089 30.546 0.052 0.39
35 N5728 2009Y 13.514 0.115 33.116 0.207 -19.602 0.236 33.094 0.205 0.58
36 N5861 2017erp 12.945 0.107 32.232 0.101 -19.287 0.147 32.223 0.099 0.33
37 N5917 2005cf 13.079 0.095 32.363 0.122 -19.284 0.154 32.363 0.120 0.47
38 N7250 2013dy 12.283 0.178 31.628 0.126 -19.345 0.218 31.628 0.125 0.49
39 N7329 2006bh 14.030 0.079 33.274 0.116 -19.244 0.140 33.246 0.117 0.39
40 N7541 1998dh 13.418 0.128 32.504 0.121 -19.086 0.176 32.500 0.119 0.30
41 N7678 2002dp 14.090 0.093 33.196 0.155 -19.106 0.181 33.187 0.153 0.39
42 U9391 2003du 13.525 0.084 32.849 0.068 -19.324 0.108 32.848 0.067 0.44`;

const calibrators = TABLE6.split('\n').map((line) => {
  const f = line.trim().split(/\s+/);
  if (f.length !== 12) throw new Error(`Table 6 row has ${f.length} fields: ${line}`);
  const n = f.slice(3).map(Number);
  if (n.some((x) => !Number.isFinite(x))) throw new Error(`non-numeric field: ${line}`);
  const [mB, eMB, muCeph, eMuCeph, MB, eMBabs, muHost, eMuHost, R] = n;
  // Transcription check: M⁰_B,i ≈ m⁰_B,i − µ_Ceph (rounding of the published columns only).
  if (Math.abs(mB - muCeph - MB) > 0.002) throw new Error(`row ${f[0]}: m − µ = ${(mB - muCeph).toFixed(3)} ≠ M = ${MB}`);
  return { n: Number(f[0]), host: f[1], sn: f[2], mB, eMB, muCeph, eMuCeph, MB, eMBabs, muHost, eMuHost, R };
});
if (calibrators.length !== 42) throw new Error(`expected 42 calibrators, got ${calibrators.length}`);

const sne = {
  source: 'riess-2022', equation: 'log H₀ = 0.2 M⁰_B + a_B + 5 (eq. 5)',
  MB: { value: -19.253, sigma: 0.027, interval: IMPLIED, note: 'fiducial SN Ia absolute magnitude for the Pantheon+ standardization (§5)' },
  aB: { value: 0.714158, sigma: null, note: 'Hubble-diagram intercept, Table 5 row 1 (no uncertainty printed in the table)' },
  hubbleFlow: { zMin: 0.0233, zMax: 0.15, n: 277, q0: -0.55, note: '277 Pantheon+ SNe Ia in late-type hosts; a_B uses eq. 4 with q₀ = −0.55 (§5.2)' },
  calibratorDispersion: 0.130, hubbleFlowDispersion: 0.135,
  columns: 'm⁰_B,i (standardized peak magnitude, simple survey average) ± eMB; µ_Ceph from Cepheids without that host’s SNe ± eMuCeph; M⁰_B,i ± eMBabs; µ_host from Cepheids without any SN ± eMuHost; R host reddening ratio',
  calibrators,
};

// ---------------------------------------------------------------- H₀ measurements (local); Planck is read from planck-2018-params
const H = (id: string, label: string, method: string, value: number, parts: { label: string; sigma: number }[], source: string, extra: Record<string, unknown> = {}) =>
  ({ id, label, method, value, parts, interval: IMPLIED, unit: 'km/s/Mpc', source, ...extra });
const h0 = [
  H('sh0es-2022', 'SH0ES 2022 (baseline)', 'Cepheids → SNe Ia; anchors: Gaia EDR3 parallaxes, NGC 4258 masers, LMC eclipsing binaries', 73.04, [{ label: 'total, with systematics', sigma: 1.04 }], 'riess-2022',
    { note: 'eq. 10; the fit alone gives ± 1.01, slightly asymmetric (−0.98, +1.03)' }),
  H('sh0es-2022-trgb', 'SH0ES 2022 (Cepheids + TRGB)', 'Cepheids and HST TRGB together → SNe Ia', 72.53, [{ label: 'total', sigma: 0.99 }], 'riess-2022', { note: 'abstract' }),
  H('cchp-2021', 'CCHP TRGB 2021', 'TRGB (HST) → Carnegie Supernova Project SNe Ia; four geometric zero points', 69.8, [{ label: 'stat', sigma: 0.6 }, { label: 'sys', sigma: 1.6 }], 'freedman-2021', { note: 'abstract' }),
  H('cchp-2025', 'CCHP 2025 (HST + JWST TRGB)', 'TRGB from HST and JWST, 24 SN Ia calibrators; zero point NGC 4258', 70.39, [{ label: 'stat', sigma: 1.22 }, { label: 'sys', sigma: 1.33 }, { label: 'σ_SN', sigma: 0.70 }], 'freedman-2025',
    { note: 'abstract of arXiv:2408.06153v3', erratum: 'An erratum was published (ApJ 993, 252, 2025). Its content could not be checked (the publisher’s site disallows automated access), so this value may have been corrected.' }),
];

// ---------------------------------------------------------------- the authors' own statements (verbatim)
const statements = [
  { source: 'riess-2022', where: 'abstract', text: 'We find a 5σ difference with the prediction of H0 from Planck CMB observations under ΛCDM, with no indication that the discrepancy arises from measurement uncertainties or analysis variations considered to date.' },
  { source: 'riess-2022', where: '§5', text: 'The full difference from the Planck+ΛCDM prediction of H0 = 67.4 ±0.5 (Planck Collaboration et al. 2020) in units of ∆5 log H0 is 0.176 ±0.035 mag (errors in quadrature), a difference of 5.0σ (one in 3.5 million).' },
  { source: 'freedman-2021', where: 'abstract', text: 'No statistically significant difference is found between the value of H0 based on the TRGB and that determined from measurements of the cosmic microwave background.' },
  { source: 'freedman-2025', where: 'abstract', text: 'Our results are consistent with the current standard ΛCDM model, without the need for the inclusion of additional new physics.' },
];

writeDataset('datasets/astronomical/distance-ladder.json', {
  version: '1.0.0',
  anchors, leavitt, trgb, sne, h0, statements,
  planckReference: { dataset: 'planck-2018-params', sh0esComparedWith: { value: 67.4, sigma: 0.5, note: 'the Planck value SH0ES 2022 compares against (§5); Planck 2018 eq. 14 gives 67.36 ± 0.54 without BAO' } },
}, {
  dataset: 'distance-ladder',
  version: '1.0.0',
  records: anchors.length + trgb.calibrations.length + calibrators.length + h0.length,
  sources: [
    { institution: 'Riess et al. (2022), ApJL 934, L7', url: 'https://doi.org/10.3847/2041-8213/ac5c5b', notes: 'SH0ES: eq. 1, eq. 5, Table 5 row 1, Table 6 (42 calibrators), anchors §4, baseline H₀ §5' },
    { institution: 'Freedman (2021), ApJ 919, 16', url: 'https://doi.org/10.3847/1538-4357/ac0e95', notes: 'CCHP: TRGB zero point, Table 3; H₀ (abstract)' },
    { institution: 'Freedman et al. (2025), ApJ 985, 203', url: 'https://doi.org/10.3847/1538-4357/adce78', notes: 'CCHP HST + JWST: H₀ (abstract, arXiv v3). Erratum ApJ 993, 252 not read' },
    { institution: 'Pietrzyński et al. (2019), Nature 567, 200', url: 'https://doi.org/10.1038/s41586-019-0999-4', notes: 'LMC distance, 20 detached eclipsing binaries' },
    { institution: 'Reid, Pesce & Riess (2019), ApJL 886, L27', url: 'https://doi.org/10.3847/2041-8213/ab552d', notes: 'NGC 4258 maser distance' },
  ],
  adapter: 'scripts/ingestion/curated-distance-ladder.ts',
  warnings: [
    'Hand-transcribed (manually transcribed values; Table 6 copied from the arXiv PDF text and checked row by row: m − µ = M to 0.002 mag).',
    '“±” is read as 1σ: the papers quote significances in σ but do not attach a probability level to each interval.',
    'CCHP 2025: an erratum (ApJ 993, 252) exists and was not read (iopscience.iop.org robots.txt disallows automated agents).',
    'The 277 Hubble-flow SNe Ia (Pantheon+) are not bundled; only the fitted intercept a_B is.',
  ],
});
