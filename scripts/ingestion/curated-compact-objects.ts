/**
 * Curated compact objects (Phase 6, Gate 6.2) → datasets/astronomical/compact-objects.json
 *
 *   node --experimental-strip-types scripts/ingestion/curated-compact-objects.ts
 *
 * Every value was transcribed by hand from the text or tables of the cited paper (arXiv PDF text read
 * with PDFKit; DOIs checked against Crossref). Nothing is fetched here; the script exists so the
 * dataset gets the same manifest + SHA-256 treatment as ingested data.
 *
 * Values are stored as published: [value, minus, plus] with the paper's interval type. White-dwarf
 * radii are published in solar radii; the app converts them with the IAU 2015 nominal R☉.
 */
import { writeDataset } from './lib/ingest.ts';

type Val = [number, number, number];
type Interval = '1σ' | '68%' | '90%';
interface Measurement { quantity: string; value: Val | null; unit: string; interval: Interval | null; method: string; source: string; note?: string }
interface Obj {
  id: string; name: string; kind: 'white-dwarf' | 'neutron-star' | 'black-hole';
  mass: Val; massInterval: Interval; massMethod: string; massSource: string;
  radius: Val | null; radiusUnit: 'R☉' | 'km' | null; radiusInterval: Interval | null; radiusMethod: string | null; radiusSource: string | null;
  distance: Val | null; distanceUnit: 'pc' | null; distanceSource: string | null;
  /** mass used to predict the shadow size, when it should be independent of the ring measurement */
  shadowMass: Val | null; shadowMassMethod: string | null;
  measurements: Measurement[];
  starSeq: number | null;
  caveats: string[];
  sources: string[];
}

const BBB = 'bond-bergeron-bedard-2017';
const objects: Obj[] = [
  // ---------------- white dwarfs in the 10 pc sample (Bond, Bergeron & Bédard 2017, Table 1) ----------------
  { id: 'sirius-b', name: 'Sirius B', kind: 'white-dwarf', starSeq: 14,
    mass: [1.018, 0.011, 0.011], massInterval: '1σ', massMethod: 'dynamical mass from the visual-binary orbit (HST and ground-based astrometry)', massSource: 'bond-2017-sirius',
    radius: [0.008098, 0.000046, 0.000046], radiusUnit: 'R☉', radiusInterval: '1σ', radiusMethod: 'from flux and parallax (as tabulated)', radiusSource: BBB,
    distance: null, distanceUnit: null, distanceSource: null, shadowMass: null, shadowMassMethod: null,
    measurements: [{ quantity: 'gravitational redshift of Hα (as a velocity)', value: [80.65, 0.77, 0.77], unit: 'km/s', interval: '1σ', method: 'HST/STIS Hα of Sirius B measured relative to Sirius A in the same orbit', source: 'joyce-2018', note: 'The authors infer 1.017 ± 0.025 M☉ from it, matching the dynamical mass.' }],
    caveats: [], sources: ['bond-2017-sirius', BBB, 'joyce-2018'] },
  { id: 'procyon-b', name: 'Procyon B', kind: 'white-dwarf', starSeq: 32,
    mass: [0.592, 0.006, 0.006], massInterval: '1σ', massMethod: 'dynamical mass from the visual-binary orbit (HST astrometry)', massSource: 'bond-2015-procyon',
    radius: [0.01232, 0.00032, 0.00032], radiusUnit: 'R☉', radiusInterval: '1σ', radiusMethod: 'model-atmosphere radius of Provencal et al. (2002) adjusted to the adopted parallax', radiusSource: 'bond-2015-procyon',
    distance: null, distanceUnit: null, distanceSource: null, shadowMass: null, shadowMassMethod: null,
    measurements: [], caveats: [], sources: ['bond-2015-procyon', BBB] },
  { id: '40-eri-b', name: '40 Eridani B', kind: 'white-dwarf', starSeq: 110,
    mass: [0.573, 0.018, 0.018], massInterval: '1σ', massMethod: 'dynamical mass from the 40 Eri BC orbit (Mason et al. 2017, USNO), as quoted', massSource: BBB,
    radius: [0.01308, 0.00020, 0.00020], radiusUnit: 'R☉', radiusInterval: '1σ', radiusMethod: 'model-atmosphere analysis with the measured flux and parallax', radiusSource: BBB,
    distance: null, distanceUnit: null, distanceSource: null, shadowMass: null, shadowMassMethod: null,
    measurements: [], caveats: [], sources: [BBB] },
  { id: 'stein-2051-b', name: 'Stein 2051 B', kind: 'white-dwarf', starSeq: 129,
    mass: [0.675, 0.051, 0.051], massInterval: '1σ', massMethod: 'relativistic deflection of a background star’s image measured with HST (astrometric microlensing)', massSource: 'sahu-2017',
    radius: [0.0114, 0.0004, 0.0004], radiusUnit: 'R☉', radiusInterval: '1σ', radiusMethod: 'from broad-band photometry, model atmospheres and the parallax', radiusSource: 'sahu-2017',
    distance: null, distanceUnit: null, distanceSource: null, shadowMass: null, shadowMassMethod: null,
    measurements: [
      { quantity: 'Einstein ring radius θ_E', value: [31.53, 1.20, 1.20], unit: 'mas', interval: '1σ', method: 'fit to the deflected positions of the background star at four HST epochs', source: 'sahu-2017' },
      { quantity: 'parallax of Stein 2051 B relative to the reference frame', value: [180.7, 1.0, 1.0], unit: 'mas', interval: '1σ', method: 'HST astrometry, eight epochs', source: 'sahu-2017' },
      { quantity: 'parallax of the background star relative to the reference frame', value: [0.25, 0.1, 0.1], unit: 'mas', interval: '1σ', method: 'same model fit', source: 'sahu-2017' },
    ],
    caveats: ['The mass comes from gravitational lensing, the effect modelled in the Lensing view.'], sources: ['sahu-2017', BBB] },
  // ---------------- neutron stars ----------------
  { id: 'psr-j0740', name: 'PSR J0740+6620', kind: 'neutron-star', starSeq: null,
    mass: [2.08, 0.07, 0.07], massInterval: '68%', massMethod: 'Shapiro delay in radio timing of the binary pulsar (68.3 % credibility)', massSource: 'fonseca-2021',
    radius: [13.7, 1.5, 2.6], radiusUnit: 'km', radiusInterval: '68%', radiusMethod: 'equatorial circumferential radius from NICER and XMM-Newton pulse-profile modelling', radiusSource: 'miller-2021',
    distance: null, distanceUnit: null, distanceSource: null, shadowMass: null, shadowMassMethod: null,
    measurements: [],
    caveats: ['A rapidly spinning millisecond pulsar: the star is oblate and its exterior is only approximately Schwarzschild.', 'An independent analysis of the same X-ray data (Riley et al. 2021) gives a different radius; only Miller et al. is bundled.'],
    sources: ['fonseca-2021', 'miller-2021'] },
  { id: 'psr-j0030', name: 'PSR J0030+0451', kind: 'neutron-star', starSeq: null,
    mass: [1.34, 0.16, 0.15], massInterval: '68%', massMethod: 'NICER pulse-profile modelling (16 % and 84 % quantiles)', massSource: 'riley-2019',
    radius: [12.71, 1.19, 1.14], radiusUnit: 'km', radiusInterval: '68%', radiusMethod: 'equatorial radius from the same NICER analysis', radiusSource: 'riley-2019',
    distance: null, distanceUnit: null, distanceSource: null, shadowMass: null, shadowMassMethod: null,
    measurements: [{ quantity: 'compactness GM/(R_eq c²)', value: [0.156, 0.010, 0.008], unit: '', interval: '68%', method: 'constrained directly by the pulse profile, more tightly than M and R separately', source: 'riley-2019' }],
    caveats: ['A millisecond pulsar: rotation makes the star oblate; the analysis uses an oblate-star exterior, not pure Schwarzschild.'],
    sources: ['riley-2019'] },
  { id: 'psr-b1913', name: 'PSR B1913+16 (Hulse–Taylor pulsar)', kind: 'neutron-star', starSeq: null,
    mass: [1.438, 0.001, 0.001], massInterval: '1σ', massMethod: 'relativistic periastron advance and time dilation measured by 35 years of pulsar timing', massSource: 'weisberg-huang-2016',
    radius: null, radiusUnit: null, radiusInterval: null, radiusMethod: null, radiusSource: null,
    distance: null, distanceUnit: null, distanceSource: null, shadowMass: null, shadowMassMethod: null,
    measurements: [
      { quantity: 'companion neutron-star mass', value: [1.390, 0.001, 0.001], unit: 'M☉', interval: '1σ', method: 'same timing solution', source: 'weisberg-huang-2016' },
      { quantity: 'observed / predicted orbital decay from gravitational waves', value: [0.9983, 0.0016, 0.0016], unit: '', interval: '1σ', method: 'period derivative corrected by a kinematic term', source: 'weisberg-huang-2016' },
    ],
    caveats: ['No radius is measured.'], sources: ['weisberg-huang-2016'] },
  // ---------------- black holes ----------------
  { id: 'sgr-a-star', name: 'Sagittarius A*', kind: 'black-hole', starSeq: null,
    mass: [4.297e6, 0.013e6, 0.013e6], massInterval: '68%', massMethod: 'stellar orbits around Sgr A* (VLTI/GRAVITY Collaboration 2022), as tabulated by the EHT', massSource: 'eht-2022-sgra-1',
    radius: null, radiusUnit: null, radiusInterval: null, radiusMethod: null, radiusSource: null,
    distance: [8277, 34, 34], distanceUnit: 'pc', distanceSource: 'eht-2022-sgra-1',
    shadowMass: [4.297e6, 0.013e6, 0.013e6], shadowMassMethod: 'stellar orbits (independent of the EHT image)',
    measurements: [
      { quantity: 'emission-ring diameter', value: [51.8, 2.3, 2.3], unit: 'µas', interval: '68%', method: 'EHT 1.3 mm VLBI image', source: 'eht-2022-sgra-1' },
      { quantity: 'angular shadow diameter', value: [48.7, 7.0, 7.0], unit: 'µas', interval: '68%', method: 'from the ring with a calibration factor from simulations', source: 'eht-2022-sgra-1' },
      { quantity: 'shadow deviation δ from Schwarzschild (VLTI prior)', value: [-0.08, 0.09, 0.09], unit: '', interval: '68%', method: 'shadow diameter compared with the stellar-orbit θ_g', source: 'eht-2022-sgra-1' },
      { quantity: 'mass from the EHT image alone', value: [4.0e6, 0.6e6, 1.1e6], unit: 'M☉', interval: '68%', method: 'angular gravitational radius with a maser distance', source: 'eht-2022-sgra-1' },
    ],
    caveats: ['Distance uncertainty combines the published statistical (9 pc) and systematic (33 pc) errors in quadrature.', 'Spin is not modelled; for a Kerr hole the shadow is 0–8 % smaller (−0.08 ≤ δ ≤ 0, EHT).'],
    sources: ['eht-2022-sgra-1'] },
  { id: 'm87-star', name: 'M87*', kind: 'black-hole', starSeq: null,
    mass: [6.5e9, 0.7e9, 0.7e9], massInterval: '68%', massMethod: 'EHT ring size calibrated with GRMHD and geometric models (assumes general relativity)', massSource: 'eht-2019-m87-1',
    radius: null, radiusUnit: null, radiusInterval: null, radiusMethod: null, radiusSource: null,
    distance: [16.8e6, 0.8e6, 0.8e6], distanceUnit: 'pc', distanceSource: 'eht-2019-m87-1',
    shadowMass: [6.2e9, 0.6e9, 1.1e9], shadowMassMethod: 'stellar dynamics (Gebhardt et al. 2011, re-derived by the EHT), independent of the image',
    measurements: [
      { quantity: 'emission-ring diameter', value: [42, 3, 3], unit: 'µas', interval: '68%', method: 'EHT 1.3 mm VLBI images (all methods combined)', source: 'eht-2019-m87-1' },
      { quantity: 'mass from gas dynamics', value: [3.5e9, 0.3e9, 0.9e9], unit: 'M☉', interval: '68%', method: 'kinematics of the gas disc (Walsh et al. 2013), as quoted', source: 'eht-2019-m87-1', note: 'Predicts a much smaller shadow (21.3 µas, EHT) than observed.' },
    ],
    caveats: ['The EHT mass is derived from the ring itself, so only the stellar-dynamics mass gives an independent prediction.', 'Spin changes the shadow by up to 4 % (EHT Paper I).'],
    sources: ['eht-2019-m87-1'] },
  { id: 'cyg-x1', name: 'Cygnus X-1', kind: 'black-hole', starSeq: null,
    mass: [21.2, 2.2, 2.2], massInterval: '1σ', massMethod: 'radio-astrometric distance combined with optical orbital data of the binary', massSource: 'miller-jones-2021',
    radius: null, radiusUnit: null, radiusInterval: null, radiusMethod: null, radiusSource: null,
    distance: [2220, 170, 180], distanceUnit: 'pc', distanceSource: 'miller-jones-2021', shadowMass: null, shadowMassMethod: null,
    measurements: [], caveats: ['Spin is not modelled (Schwarzschild values only).', 'Too distant and small for its shadow to be imaged; no angular comparison.'], sources: ['miller-jones-2021'] },
  { id: 'gw150914-final', name: 'GW150914 remnant', kind: 'black-hole', starSeq: null,
    mass: [62, 4, 4], massInterval: '90%', massMethod: 'gravitational waveform of a binary black-hole merger (source frame)', massSource: 'abbott-2016-gw150914',
    radius: null, radiusUnit: null, radiusInterval: null, radiusMethod: null, radiusSource: null,
    distance: null, distanceUnit: null, distanceSource: null, shadowMass: null, shadowMassMethod: null,
    measurements: [
      { quantity: 'primary black-hole mass', value: [36, 4, 5], unit: 'M☉', interval: '90%', method: 'waveform', source: 'abbott-2016-gw150914' },
      { quantity: 'secondary black-hole mass', value: [29, 4, 4], unit: 'M☉', interval: '90%', method: 'waveform', source: 'abbott-2016-gw150914' },
      { quantity: 'energy radiated in gravitational waves', value: [3.0, 0.5, 0.5], unit: 'M☉c²', interval: '90%', method: 'waveform', source: 'abbott-2016-gw150914' },
      { quantity: 'final spin (dimensionless)', value: [0.67, 0.07, 0.05], unit: '', interval: '90%', method: 'waveform', source: 'abbott-2016-gw150914' },
      { quantity: 'luminosity distance', value: [410, 180, 160], unit: 'Mpc', interval: '90%', method: 'waveform amplitude', source: 'abbott-2016-gw150914' },
    ],
    caveats: ['Uncertainties are 90 % credible intervals, not 1σ.', 'The remnant spins (a ≈ 0.67): its horizon and ISCO differ from the Schwarzschild values shown.'],
    sources: ['abbott-2016-gw150914'] },
];

writeDataset('datasets/astronomical/compact-objects.json', { version: '1.0.0', valueFormat: '[value, minus, plus] with the interval type given per value', objects }, {
  dataset: 'compact-objects',
  version: '1.0.0',
  records: objects.length,
  sources: [
    { institution: 'Bond et al. (2015, 2017); Bond, Bergeron & Bédard (2017); Joyce et al. (2018)', url: 'https://doi.org/10.3847/1538-4357/aa8a63', notes: 'white-dwarf dynamical masses, radii and the Sirius B gravitational redshift' },
    { institution: 'Sahu et al. (2017) Science 356, 1046', url: 'https://doi.org/10.1126/science.aal2879', notes: 'Stein 2051 B lensing mass, Einstein radius and parallaxes' },
    { institution: 'Fonseca et al. (2021); Miller et al. (2021); Riley et al. (2019); Weisberg & Huang (2016)', url: 'https://doi.org/10.3847/2041-8213/ac03b8', notes: 'neutron-star masses and radii' },
    { institution: 'Event Horizon Telescope Collaboration (2019, 2022)', url: 'https://doi.org/10.3847/2041-8213/ab0ec7', license: 'M87 Paper I: CC BY 3.0 (as stated in the article)', notes: 'M87* and Sgr A* ring diameters, masses and distances' },
    { institution: 'Miller-Jones et al. (2021); LIGO Scientific and Virgo Collaborations (Abbott et al. 2016)', url: 'https://doi.org/10.1103/PhysRevLett.116.061102', notes: 'stellar-mass black holes' },
  ],
  adapter: 'scripts/ingestion/curated-compact-objects.ts',
  warnings: ['Hand-transcribed from the papers (manually transcribed values; checked against the PDF text).', 'Interval types differ between papers (1σ, 68 % or 90 % credible) and are stored per value.'],
});
