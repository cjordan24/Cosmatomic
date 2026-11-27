/**
 * Curated Planck 2018 base-ΛCDM parameters (Phase 7, Gate 7.1) → datasets/astronomical/planck-2018-params.json
 *
 *   node --experimental-strip-types scripts/ingestion/curated-planck-2018.ts
 *
 * Transcribed by hand from the arXiv PDF text (arXiv:1807.06209v4, read with PDFKit) of:
 *  - Planck Collaboration (2020) Planck 2018 results. VI. Cosmological parameters. A&A 641, A6.
 *    Table 2, last column "TT,TE,EE+lowE+lensing+BAO", 68 % intervals (all symmetric in that column).
 *    Base model assumptions stated in the paper: spatially flat ΛCDM, N_eff = 3.046, one massive
 *    neutrino with m_ν = 0.06 eV (included in Ω_m), T₀ = 2.7255 K (footnote 14, from Fixsen 2009).
 */
import { writeDataset } from './lib/ingest.ts';

const P = (key: string, label: string, value: number, sigma: number | null, unit: string, kind: 'base' | 'derived' | 'assumed', note = '') =>
  ({ key, label, value, sigma, interval: sigma === null ? null : '68 %', unit, kind, note });

const parameters = [
  P('ombh2', 'Physical baryon density Ω_b h²', 0.02242, 0.00014, '', 'base'),
  P('omch2', 'Physical cold-dark-matter density Ω_c h²', 0.11933, 0.00091, '', 'base'),
  P('theta_mc', 'Approximate acoustic angle 100 θ_MC', 1.04101, 0.00029, '', 'base'),
  P('tau', 'Reionization optical depth τ', 0.0561, 0.0071, '', 'base'),
  P('ln_As', 'Primordial amplitude ln(10¹⁰ A_s)', 3.047, 0.014, '', 'base'),
  P('ns', 'Scalar spectral index n_s', 0.9665, 0.0038, '', 'base'),
  P('H0', 'Hubble constant H₀', 67.66, 0.42, 'km/s/Mpc', 'derived'),
  P('OL', 'Dark-energy density Ω_Λ', 0.6889, 0.0056, '', 'derived'),
  P('Om', 'Matter density Ω_m', 0.3111, 0.0056, '', 'derived', 'includes one neutrino of mass 0.06 eV'),
  P('omh2', 'Physical matter density Ω_m h²', 0.14240, 0.00087, '', 'derived'),
  P('sigma8', 'Fluctuation amplitude σ₈', 0.8102, 0.0060, '', 'derived'),
  P('zre', 'Reionization mid-point redshift z_re', 7.82, 0.71, '', 'derived', 'simple tanh reionization model'),
  P('age', 'Age of the Universe', 13.787, 0.020, 'Gyr', 'derived'),
  P('zstar', 'Redshift of last scattering z∗', 1089.80, 0.21, '', 'derived'),
  P('rstar', 'Comoving sound horizon at z∗, r∗', 144.57, 0.22, 'Mpc', 'derived'),
  P('theta_star', 'Acoustic angular scale 100 θ∗', 1.04119, 0.00029, '', 'derived', 'θ∗ = r∗ / D_M(z∗)'),
  P('zdrag', 'Baryon-drag redshift z_drag', 1060.01, 0.29, '', 'derived'),
  P('rdrag', 'Sound horizon at z_drag, r_drag', 147.21, 0.23, 'Mpc', 'derived'),
  P('zeq', 'Matter–radiation equality redshift z_eq', 3387, 21, '', 'derived'),
  P('T0', 'CMB temperature today T₀', 2.7255, null, 'K', 'assumed', 'taken from Fixsen (2009) (footnote 14); the ±0.0006 K error has negligible impact'),
  P('Neff', 'Effective number of neutrino species N_eff', 3.046, null, '', 'assumed', 'Standard Model value assumed in the base model'),
  P('mnu', 'Sum of neutrino masses Σm_ν', 0.06, null, 'eV', 'assumed', 'one massive neutrino, minimal mass, in the base model'),
];

writeDataset('datasets/astronomical/planck-2018-params.json', {
  version: '1.0.0',
  source: 'planck-2018-vi',
  likelihood: 'Planck TT,TE,EE+lowE+lensing+BAO',
  table: 'Table 2, last column (68 % intervals)',
  model: 'base ΛCDM: spatially flat, cosmological constant (w = −1), N_eff = 3.046, Σm_ν = 0.06 eV',
  baselineH0: { value: 67.36, sigma: 0.54, likelihood: 'TT,TE,EE+lowE+lensing (without BAO), eq. 14' },
  parameters,
}, {
  dataset: 'planck-2018-params',
  version: '1.0.0',
  records: parameters.length,
  sources: [
    { institution: 'Planck Collaboration (2020), A&A 641, A6', url: 'https://doi.org/10.1051/0004-6361/201833910', notes: 'Planck 2018 results VI, Table 2 (TT,TE,EE+lowE+lensing+BAO)' },
  ],
  adapter: 'scripts/ingestion/curated-planck-2018.ts',
  warnings: ['Hand-transcribed (manually transcribed values; checked against the arXiv v4 PDF text).', 'Values are model-dependent: they assume base ΛCDM.'],
});
