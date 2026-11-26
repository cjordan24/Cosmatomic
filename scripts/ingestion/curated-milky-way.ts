/**
 * Curated Milky Way structure and rotation curve (Phase 6, Gate 6.4) → datasets/astronomical/milky-way.json
 *
 *   node --experimental-strip-types scripts/ingestion/curated-milky-way.ts
 *
 * Transcribed by hand from the arXiv PDF text (read with PDFKit) of:
 *  - Bland-Hawthorn, J. and Gerhard, O. (2016) The Galaxy in Context: structural, kinematic and
 *    integrated properties. ARA&A 54, 529 (arXiv:1602.07702): the adopted "best estimates" printed in
 *    the review's margin summaries and text (§3.2, §5, §6).
 *  - Eilers, A.-C., Hogg, D. W., Rix, H.-W. and Ness, M. K. (2019) The circular velocity curve of the
 *    Milky Way from 5 to 25 kpc. ApJ 871, 120 (arXiv:1810.09466): Table 1, all 38 rows, with the
 *    published asymmetric errors. They assume R⊙ = 8.122 kpc (GRAVITY 2018).
 */
import { writeDataset } from './lib/ingest.ts';

type Val = [number, number, number];
const P = (key: string, label: string, value: Val | null, unit: string, note: string, range?: [number, number]) => ({ key, label, value, range: range ?? null, unit, note, source: 'bland-hawthorn-gerhard-2016' });

const parameters = [
  P('R0', 'Distance of the Sun from the Galactic Centre R₀', [8.2, 0.1, 0.1], 'kpc', 'overall best estimate from recent determinations (§3.2.4)'),
  P('z0', 'Height of the Sun above the Galactic plane z₀', [25, 5, 5], 'pc', 'adopted from the SDSS photometric survey (Jurić et al. 2008)'),
  P('Theta0', 'Circular speed at the Sun Θ₀', [238, 15, 15], 'km/s', 'adopted best estimate (§6.4)'),
  P('Rt', 'Thin-disc scale length', [2.6, 0.5, 0.5], 'kpc', 'includes the highest (GLIMPSE) value; 2.5 ± 0.4 kpc without it'),
  P('zt', 'Thin-disc scale height', [300, 60, 60], 'pc', '≈ 300 pc “to within 20 %” (the ±60 pc is that 20 %)'),
  P('zT', 'Thick-disc scale height', [900, 180, 180], 'pc', '≈ 900 pc, with a similar 20 % uncertainty'),
  P('Mstar', 'Total stellar mass M⋆', [5e10, 1e10, 1e10], 'M☉', 'combined estimate (§6.4)'),
  P('Mhalo_stars', 'Stellar-halo mass', null, 'M☉', 'given as a range, 4–7 × 10⁸ M☉', [4e8, 7e8]),
  P('M200', 'Total mass within r₂₀₀ (200 × critical density) M₂₀₀', [1.1e12, 0.3e12, 0.3e12], 'M☉', 'straight average of halo-star kinematic estimates (§6.3)'),
  P('Mvir', 'Virial mass M_vir', [1.3e12, 0.3e12, 0.3e12], 'M☉', 'equivalent to the M₂₀₀ estimate (§6.3)'),
];

// Eilers et al. (2019) Table 1: R [kpc], v_c [km/s], σ−, σ+ [km/s]
const curve: [number, number, number, number][] = [
  [5.27, 226.83, 1.91, 1.90], [5.74, 230.80, 1.43, 1.35], [6.23, 231.20, 1.70, 1.10], [6.73, 229.88, 1.44, 1.32], [7.22, 229.61, 1.37, 1.11],
  [7.82, 229.91, 0.92, 0.88], [8.19, 228.86, 0.80, 0.67], [8.78, 226.50, 1.07, 0.95], [9.27, 226.20, 0.72, 0.62], [9.76, 225.94, 0.42, 0.52],
  [10.26, 225.68, 0.44, 0.40], [10.75, 224.73, 0.38, 0.41], [11.25, 224.02, 0.33, 0.54], [11.75, 223.86, 0.40, 0.39], [12.25, 222.23, 0.51, 0.37],
  [12.74, 220.77, 0.54, 0.46], [13.23, 220.92, 0.57, 0.40], [13.74, 217.47, 0.64, 0.51], [14.24, 217.31, 0.77, 0.66], [14.74, 217.60, 0.65, 0.68],
  [15.22, 217.07, 1.06, 0.80], [15.74, 217.38, 0.84, 1.07], [16.24, 216.14, 1.20, 1.48], [16.74, 212.52, 1.39, 1.43], [17.25, 216.41, 1.44, 1.85],
  [17.75, 213.70, 2.22, 1.65], [18.24, 207.89, 1.76, 1.88], [18.74, 209.60, 2.31, 2.77], [19.22, 206.45, 2.54, 2.36], [19.71, 201.91, 2.99, 2.26],
  [20.27, 199.84, 3.15, 2.89], [20.78, 198.14, 3.33, 3.37], [21.24, 195.30, 5.99, 6.50], [21.80, 213.67, 15.38, 12.18], [22.14, 176.97, 28.58, 18.57],
  [22.73, 193.11, 27.64, 19.05], [23.66, 176.63, 18.67, 16.74], [24.82, 198.42, 6.50, 6.12],
];

writeDataset('datasets/astronomical/milky-way.json', {
  version: '1.0.0',
  parameters,
  rotationCurve: {
    source: 'eilers-2019',
    columns: ['R (kpc)', 'v_c (km/s)', 'σ− (km/s)', 'σ+ (km/s)'],
    assumptions: 'Jeans equation for an axisymmetric potential; R⊙ = 8.122 ± 0.031 kpc (GRAVITY Collaboration 2018); inner 5 kpc excluded because of the bar',
    vcSun: [229.0, 0.2, 0.2], vcSunSystematic: '2–5 %', slope: [-1.7, 0.1, 0.1], slopeSystematic: 0.46,
    rows: curve,
  },
}, {
  dataset: 'milky-way',
  version: '1.0.0',
  records: parameters.length + curve.length,
  sources: [
    { institution: 'Bland-Hawthorn & Gerhard (2016), ARA&A 54, 529', url: 'https://doi.org/10.1146/annurev-astro-081915-023441', notes: 'adopted Galactic parameters' },
    { institution: 'Eilers, Hogg, Rix & Ness (2019), ApJ 871, 120', url: 'https://doi.org/10.3847/1538-4357/aaf648', notes: 'circular velocity curve 5–25 kpc (Table 1)' },
  ],
  adapter: 'scripts/ingestion/curated-milky-way.ts',
  warnings: ['Hand-transcribed (manually transcribed values; checked against the PDF text).', 'The two papers assume slightly different R₀ (8.2 vs 8.122 kpc).'],
});
