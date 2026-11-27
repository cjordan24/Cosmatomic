/**
 * Phase 7, Gate 7.3 — cosmic microwave background → datasets/astronomical/cmb.json
 *
 *   node --experimental-strip-types scripts/ingestion/cmb.ts
 *
 * 1. FIRAS monopole spectrum. NASA LAMBDA file firas_monopole_spec_v1.txt (robots.txt empty: all agents
 *    allowed; NASA data). Its columns 1, 3, 4 and 5 are Table 4 of Fixsen et al. (1996) ApJ 473, 576
 *    (arXiv:astro-ph/9605054, checked row by row against the PDF text: 43/43 rows identical). Column 2
 *    is LAMBDA's own "2.725 K BB spectrum + residual" and is kept only for reference.
 * 2. Planck 2018 TT power spectrum. Planck Legacy Archive products from the IRSA mirror
 *    (irsa.ipac.caltech.edu/data/Planck/release_3/ancillary-data/cosmoparams/; robots.txt disallows
 *    only listed paths and binary formats, not these .txt files):
 *      COM_PowerSpect_CMB-TT-full_R3.01.txt      ℓ = 2–29 rows used (Commander, asymmetric errors)
 *      COM_PowerSpect_CMB-TT-binned_R3.01.txt    83 bins, ℓ ≥ 30 (Plik, Δℓ = 30, with the best fit)
 *      COM_PowerSpect_CMB-base-plikHM-TTTEEE-lowl-lowE-lensing-minimum-theory_R3.01.txt  best-fit TT
 *    D_ℓ = ℓ(ℓ+1)C_ℓ/2π in µK² (Planck 2018 V, Fig. 2 and Fig. 57 captions; axis "Dℓ [µK2]").
 *    Licence: data in the ESA Space Science Archives are CC BY-NC 3.0 IGO, credit "ESA, Planck
 *    Collaboration" (ESDC Terms and Conditions, read 2026-11-27).
 *    wiki.cosmos.esa.int (the Planck explanatory supplement) disallows all agents in robots.txt and is
 *    NOT used.
 * 3. T(z) measurements, transcribed by hand from the arXiv PDF text:
 *      Noterdaeme et al. (2011) A&A 526, L7, Table 1 (CO excitation temperatures) and the abstract (β);
 *      Muller et al. (2013) A&A 551, A109, abstract (T = 5.08 ± 0.10 K at 68 % CL) and §2 (z = 0.88582).
 *
 * Integrity checks (throw on failure): FIRAS row count and monotone frequency; Planck ℓ coverage; the
 * binned ℓ_b equal the ℓ(ℓ+1)-weighted mean multipole of each bin (Planck 2018 V eq. 22); the binned
 * best-fit column equals the theory spectrum binned with the same weights.
 */
import { fetchText, writeDataset } from './lib/ingest.ts';

const rows = (text: string) => text.split('\n').filter((l) => l.trim() && !l.trim().startsWith('#')).map((l) => l.trim().split(/\s+/).map(Number));

// ---------------------------------------------------------------- 1. FIRAS
const firasText = await fetchText('https://lambda.gsfc.nasa.gov/data/cobe/firas/monopole_spec/firas_monopole_spec_v1.txt',
  { minIntervalMs: 3000, cacheKey: 'cmb/firas_monopole_spec_v1.txt', maxBytes: 100_000 });
const firasRows = rows(firasText);
if (firasRows.length !== 43 || firasRows.some((r) => r.length !== 5 || r.some((x) => !Number.isFinite(x)))) throw new Error('FIRAS: expected 43 rows × 5 columns');
firasRows.forEach((r, i) => { if (i && r[0] <= firasRows[i - 1][0]) throw new Error('FIRAS: frequencies not increasing'); });

const firas = {
  source: 'fixsen-1996', dataSource: 'lambda-firas',
  columns: ['ν (cm⁻¹)', 'LAMBDA: 2.725 K blackbody + residual (MJy/sr)', 'residual (kJy/sr)', 'σ (kJy/sr, 1σ)', 'Galaxy model at the Galactic poles (kJy/sr)'],
  referenceT: 2.725,
  referenceTNote: 'LAMBDA computes column 2 as a 2.725 K blackbody plus the Table 4 residual (file header). The residuals are relative to FIRAS’s own best fit; in Fixsen et al. (1996) that fit is 2.728 K, “determined by our choice of frequency and thermometry scales”.',
  rows: firasRows,
  fit1996: { T: 2.728, sigma: 0.004, interval: '95 % CL', note: 'absolute temperature of Fixsen et al. (1996), abstract' },
  chi2: { value: 46, dof: 40, note: 'formal χ² of the fit, §6.1' },
  rmsPpm: { value: 50, note: 'weighted rms deviation from a blackbody, 2–21 cm⁻¹, in parts per million of the peak brightness (§6.1)' },
  distortions: [
    { key: 'mu', label: 'chemical potential |μ|', limit: 9e-5, measured: '−1 ± 4 × 10⁻⁵', interval: '95 % CL upper limit', epoch: 'energy release at 10⁵ < z < 3 × 10⁶ (Bose–Einstein distortion), §6.2' },
    { key: 'y', label: 'Compton |y|', limit: 15e-6, measured: '−1 ± 6 × 10⁻⁶', interval: '95 % CL upper limit (includes 4 × 10⁻⁶ systematic)', epoch: 'energy release at z < 10⁵ (Comptonized spectrum), §6.3' },
  ],
  quote: { text: 'The FIRAS measures the difference between the cosmic microwave background and a precise blackbody spectrum.', where: 'Fixsen et al. (1996), abstract' },
};

// ---------------------------------------------------------------- 2. Planck TT
const IRSA = 'https://irsa.ipac.caltech.edu/data/Planck/release_3/ancillary-data/cosmoparams/';
const pla = (f: string) => fetchText(IRSA + f, { minIntervalMs: 3000, cacheKey: `cmb/${f}`, maxBytes: 1_000_000 });
const full = rows(await pla('COM_PowerSpect_CMB-TT-full_R3.01.txt'));
const binned = rows(await pla('COM_PowerSpect_CMB-TT-binned_R3.01.txt'));
const theory = rows(await pla('COM_PowerSpect_CMB-base-plikHM-TTTEEE-lowl-lowE-lensing-minimum-theory_R3.01.txt'));

const lowEll = full.filter((r) => r[0] >= 2 && r[0] <= 29).map(([l, D, dm, dp]) => [l, +D.toPrecision(6), +dm.toPrecision(5), +dp.toPrecision(5)]);
if (lowEll.length !== 28 || lowEll[0][0] !== 2) throw new Error('Planck low-ℓ: expected ℓ = 2–29');
if (binned.length !== 83 || binned.some((r) => r.length !== 5)) throw new Error('Planck binned TT: expected 83 rows × 5 columns');
binned.forEach((r) => { if (r[2] !== r[3]) throw new Error(`binned errors not symmetric at ℓ = ${r[0]}`); });
const th = new Map(theory.map((r) => [r[0], r[1]]));
if (th.get(2) === undefined || th.get(2508) === undefined) throw new Error('theory spectrum: expected ℓ = 2–2508');

// bins: Δℓ = 30 from ℓ = 30; the last bin ends at ℓ_max = 2508 (theory and unbinned data end there)
const checks: string[] = [];
let maxLb = 0, maxBf = 0;
binned.forEach((r, i) => {
  const lo = 30 + 30 * i, hi = i === binned.length - 1 ? 2508 : lo + 29;
  let sw = 0, swl = 0, swc = 0;
  for (let l = lo; l <= hi; l++) { const w = l * (l + 1); sw += w; swl += w * l; swc += w * ((2 * Math.PI * th.get(l)!) / w); }
  const lb = swl / sw, Cb = swc / sw, Db = (lb * (lb + 1) * Cb) / (2 * Math.PI);
  maxLb = Math.max(maxLb, Math.abs(lb - r[0]));
  maxBf = Math.max(maxBf, Math.abs(Db - r[4]) / r[4]);
});
if (maxLb > 0.01) throw new Error(`ℓ_b do not match the ℓ(ℓ+1)-weighted bin means (max Δ = ${maxLb})`);
checks.push(`binned ℓ_b reproduce the ℓ(ℓ+1)-weighted mean multipole of each Δℓ = 30 bin (Planck 2018 V eq. 22) to ${maxLb.toExponential(1)}`);
checks.push(`the binned best-fit column equals the theory spectrum binned with the same weights to a relative difference of at most ${maxBf.toExponential(1)}`);
if (maxBf > 0.01) throw new Error(`binned best fit differs from the binned theory by ${(maxBf * 100).toFixed(2)} %`);

// theory curve thinned for the bundle: every ℓ to 60, every 4th to 2508
const theoryThin = theory.filter((r) => r[0] <= 60 || r[0] % 4 === 0 || r[0] === 2508).map(([l, D]) => [l, +D.toPrecision(6)]);

const power = {
  source: 'planck-2018-v', dataSource: 'planck-pla',
  units: 'D_ℓ = ℓ(ℓ+1)C_ℓ/2π in µK²',
  lowEll: { columns: ['ℓ', 'D_ℓ', '−σ', '+σ'], rows: lowEll, method: 'Commander component separation, 86 % of the sky, ℓ = 2–29; asymmetric 68 % errors' },
  binned: { columns: ['ℓ_b', 'D_ℓ', 'σ', 'best fit (binned)'], rows: binned.map(([l, D, d, , bf]) => [+l.toFixed(3), +D.toPrecision(6), +d.toPrecision(5), +bf.toPrecision(6)]), method: 'Plik cross-half-mission spectrum, frequency-coadded, ℓ ≥ 30, bins of Δℓ = 30 weighted by ℓ(ℓ+1); foreground and nuisance parameters fixed to the base-ΛCDM best fit' },
  theory: { rows: theoryThin, model: 'base ΛCDM best fit to Planck TT,TE,EE+lowl+lowE+lensing (no BAO)', thinned: 'every ℓ up to 60, then every fourth ℓ' },
  errorNote: 'Error bars are ±1σ diagonal uncertainties including cosmic variance (approximated as Gaussian), not including foreground-model uncertainties at ℓ ≥ 30 (Planck 2018 V, Fig. 57 caption). Covariances between bins are not bundled.',
  credit: 'ESA, Planck Collaboration',
  checks,
};

// ---------------------------------------------------------------- 3. T(z)
const N11 = '1σ (implied: the paper’s figures show 1σ contours; no level is attached to Table 1)';
const tz = {
  relation: { text: 'T_CMB(z) = T₀ (1 + z)^(1−β), with β = 0 for adiabatic expansion', source: 'noterdaeme-2011' },
  beta: { value: -0.007, sigma: 0.027, interval: N11, source: 'noterdaeme-2011', note: 'fit to CO, atomic-carbon and S-Z measurements combined (abstract)' },
  measurements: [
    { id: 'J0857+1855', object: 'SDSS J085726+185524', z: 1.7293, T: 7.5, lo: 1.2, hi: 1.6, interval: N11, method: 'CO rotational excitation (quasar absorption)', source: 'noterdaeme-2011', note: 'Table 1, this work' },
    { id: 'J1047+2057', object: 'SDSS J104705+205734', z: 1.7738, T: 7.8, lo: 0.6, hi: 0.7, interval: N11, method: 'CO rotational excitation (quasar absorption)', source: 'noterdaeme-2011', note: 'Table 1, this work' },
    { id: 'J1705+3543', object: 'SDSS J170542+354340', z: 2.0377, T: 8.6, lo: 1.0, hi: 1.1, interval: N11, method: 'CO rotational excitation (quasar absorption)', source: 'noterdaeme-2011', note: 'Table 1, this work' },
    { id: 'J1439+1117', object: 'SDSS J143912+111740', z: 2.4184, T: 9.15, lo: 0.7, hi: 0.7, interval: N11, method: 'CO rotational excitation (quasar absorption)', source: 'noterdaeme-2011', note: 'Table 1, quoted from Srianand et al. (2008)' },
    { id: 'J1237+0647', object: 'SDSS J123714+064759', z: 2.6896, T: 10.5, lo: 0.6, hi: 0.8, interval: N11, method: 'CO rotational excitation (quasar absorption)', source: 'noterdaeme-2011', note: 'Table 1, quoted from Noterdaeme et al. (2010)' },
    { id: 'PKS1830-211', object: 'PKS 1830−211 (lensing galaxy)', z: 0.88582, T: 5.08, lo: 0.10, hi: 0.10, interval: '68 % CL', method: 'non-LTE excitation of 10 molecular species (millimetre absorption)', source: 'muller-2013', note: 'abstract; the paper quotes 5.14 K predicted for adiabatic expansion' },
  ],
  quotes: [
    { text: 'This relation, which is a theoretical consequence of the adiabatic expansion of the Universe, needs to be verified by direct measurements.', where: 'Noterdaeme et al. (2011), §1', source: 'noterdaeme-2011' },
    { text: 'Since decoupling, the CMB photons have cooled down with the expansion of the Universe.', where: 'Muller et al. (2013), §1.1', source: 'muller-2013' },
  ],
};

const t0 = { value: 2.72548, sigma: 0.00057, interval: '1σ (implied: no probability level stated)', source: 'fixsen-2009', note: 'FIRAS recalibrated against WMAP (abstract)' };

writeDataset('datasets/astronomical/cmb.json', { version: '1.0.0', t0, firas, tz, power }, {
  dataset: 'cmb',
  version: '1.0.0',
  records: firasRows.length + lowEll.length + binned.length + tz.measurements.length,
  sources: [
    { institution: 'NASA LAMBDA (Legacy Archive for Microwave Background Data Analysis), GSFC', url: 'https://lambda.gsfc.nasa.gov/product/cobe/firas_monopole_get.html', license: 'NASA data (generally not subject to U.S. copyright; acknowledge NASA)', notes: 'firas_monopole_spec_v1.txt = Fixsen et al. (1996) Table 4' },
    { institution: 'Fixsen et al. (1996), ApJ 473, 576', url: 'https://doi.org/10.1086/178173', notes: 'Table 4 (checked against the LAMBDA file), §6 (χ², rms, μ and y limits)' },
    { institution: 'ESA Planck Legacy Archive (IRSA mirror), Planck 2018 release R3.01', url: IRSA, license: 'CC BY-NC 3.0 IGO (ESA Space Science Archives terms); credit “ESA, Planck Collaboration”', notes: 'TT low-ℓ (ℓ = 2–29), TT binned (83 bins), best-fit theory TT' },
    { institution: 'Planck Collaboration (2020), A&A 641, A5', url: 'https://doi.org/10.1051/0004-6361/201936386', notes: 'definition of D_ℓ and units, binning (eq. 22), error bars (Fig. 57)' },
    { institution: 'Noterdaeme et al. (2011), A&A 526, L7', url: 'https://doi.org/10.1051/0004-6361/201016140', notes: 'Table 1 (5 CO excitation temperatures), β' },
    { institution: 'Muller et al. (2013), A&A 551, A109', url: 'https://doi.org/10.1051/0004-6361/201220613', notes: 'T_CMB at z = 0.89' },
    { institution: 'Fixsen (2009), ApJ 707, 916', url: 'https://doi.org/10.1088/0004-637X/707/2/916', notes: 'T₀ = 2.72548 ± 0.00057 K' },
  ],
  adapter: 'scripts/ingestion/cmb.ts',
  warnings: [
    'FIRAS: the per-point σ do not include the absolute temperature-scale uncertainty, and correlations between frequencies are not bundled.',
    'FIRAS: LAMBDA column 2 differs from a 2.725 K blackbody (2019 SI constants) plus the residual by up to 7.6 kJy/sr; it is reproduced to ≤ 0.8 kJy/sr with CODATA 1986 constants. The view rebuilds the intensity from the Table 4 residual with the bundled constants.',
    'Planck: diagonal errors only; covariances not bundled. The theory curve is thinned (every ℓ to 60, then every fourth).',
    'Noterdaeme et al. (2011) Table 1 attaches no probability level; stored as 1σ (implied).',
    ...checks,
  ],
});
