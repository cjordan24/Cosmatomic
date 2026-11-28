/**
 * Vision, hearing and the ECG (Phase 13, Gates 13.1–13.3) → datasets/biology/senses.json
 *
 *   node --experimental-strip-types scripts/ingestion/curated-senses.ts
 *
 * Read on page images (2026-11-28): Helmholtz, Treatise on Physiological Optics vol. 1 (tr. Southall, OSA 1924;
 * archive.org helmholtzs-treatise-on-physiological-optics-vol-1, Public Domain Mark; a Google-digitized scan, so only
 * the public-domain text is quoted, no images): pp. 95, 96, 178, 196, 355. Fletcher & Munson (1933) BSTJ 12, 377
 * (archive.org bstj12-4-377): pp. 380–381. Waller (1887) J. Physiol. 8, 229. Einthoven (1912) Lancet, pp. 854, 859.
 * CVRL (cvrl.org, UCL): peak wavelengths located in its own files (Stockman & Sharpe 2000 cone fundamentals, quantal
 * units; CIE 1924 V(λ); CIE 1951 V′(λ)) — only the peaks are kept: CVRL states no licence for redistribution.
 * Quoted text: NEI “How the Eyes Work”, NIDCD “How Do We Hear?” and noise page, NHLBI “Heart Tests” (public domain).
 */
import { writeDataset } from './lib/ingest.ts';

const data = {
  version: '1.0.0',
  eye: {
    nei: { source: 'nei-how-eyes-work', url: 'https://www.nei.nih.gov/eye-health-information/healthy-vision/how-eyes-work', lines: [
      'First, light passes through the cornea (the clear front layer of the eye).',
      'Some of this light enters the eye through an opening called the pupil (PYOO-pul).',
      'The iris (the colored part of the eye) controls how much light the pupil lets in.',
      'Next, light passes through the lens (a clear inner part of the eye).',
      'The lens works together with the cornea to focus light correctly on the retina.',
      'When light hits the retina (a light-sensitive layer of tissue at the back of the eye), special cells called photoreceptors turn the light into electrical signals.',
      'These electrical signals travel from the retina through the optic nerve to the brain.',
    ] },
    helmholtz: {
      source: 'helmholtz-1924',
      gullstrand: { where: 'p. 355', quote: 'A reduced eye corresponding to the exact schematic eye and having an index of refraction of 4/3 would have a radius of curvature of 5.7 mm.', n: 4 / 3, rMm: 5.7 },
      listing: { where: 'pp. 95–96', focal1: 15.0072, focal2: 20.0746, indexHumour: '103/77', radiusPrinted: 5.1248, principalMm: 2.3448, nodalBeforeLensBackMm: 0.4764,
        quote: 'The radius of curvature of such a surface would be 5.1248 mm.' },
      pupil: { where: 'p. 178', quote: 'Taking 4 mm, the mean pupillary diameter in normal eyes', meanMm: 4 },
      blur: { where: 'p. 196', quote: 'Let d denote the diameter of the aperture, r its distance from the image, and l the wave-length of the light; then by both theory and experiment it is found that the diameter of the central bright circle is δ = 2.440 lr/d.', lMm: 0.0005, rMm: 20, minPupilMm: 2, deltaMm: 0.0122, angle: '2′6″' },
    },
  },
  colour: {
    source: 'cvrl', cones: { L: 566, M: 541, S: 441, units: 'quantal', note: 'maxima of the Stockman & Sharpe (2000) 2-deg cone fundamentals in CVRL’s 1-nm file', paper: 'stockman-sharpe-2000' },
    photopic: { peak: 555, note: 'CIE 1924 V(λ), CVRL table (from Wyszecki and Stiles 1982)' },
    scotopic: { peak: 506, note: 'CIE 1951 V′(λ), maximum of CVRL’s 1-nm file (its 5-nm table: 505 nm 0.998, 510 nm 0.997)', quote: 'is considered to represent observers under the age of 30' },
    neiCones: { quote: 'only 5 percent of the retina\'s photoreceptors are cones', source: 'nei-rods-news' },
  },
  hearing: {
    nidcd: { source: 'nidcd-how-we-hear', url: 'https://www.nidcd.nih.gov/health/how-do-we-hear', lines: [
      'Sound waves enter the outer ear and travel through a narrow passageway called the ear canal, which leads to the eardrum.',
      'The eardrum vibrates from the incoming sound waves and sends these vibrations to three tiny bones in the middle ear. These bones are called the malleus, incus, and stapes.',
      'The bones in the middle ear amplify, or increase, the sound vibrations and send them to the cochlea, a snail-shaped structure filled with fluid, in the inner ear.',
      'Once the vibrations cause the fluid inside the cochlea to ripple, a traveling wave forms along the basilar membrane. Hair cells—sensory cells sitting on top of the basilar membrane—ride the wave.',
      'Hair cells near the wide end of the snail-shaped cochlea detect higher-pitched sounds, such as an infant crying. Those closer to the center detect lower-pitched sounds, such as a large dog barking.',
      'The auditory nerve carries this electrical signal to the brain, which turns it into a sound that we recognize and understand.',
    ] },
    noise: { source: 'nidcd-noise', quote: 'Sounds at or below 70 A-weighted decibels (dBA), even after long exposure, are unlikely to cause hearing loss. However, long or repeated exposure to sounds at or above 85 dBA can cause hearing loss.', safe: 70, risk: 85 },
    fletcher: { source: 'fletcher-munson-1933', where: 'p. 381', eq: 'β = 10 log J + 100', reference: 'an intensity of the reference tone in air of 10⁻¹⁶ watts per square centimeter was chosen as the reference intensity', unitsNote: 'J in microwatts per square centimeter', referenceTone: '1000-cycle tone' },
  },
  ecg: {
    nhlbi: { source: 'nhlbi', quote: 'An electrocardiogram, also called an ECG or EKG, is a simple, painless test that detects and records your heart’s electrical activity. An EKG can show how fast your heart is beating, whether the rhythm of your heartbeats is steady or irregular, and the strength and timing of the electrical impulses passing through each part of your heart.', url: 'https://www.nhlbi.nih.gov/health/heart-tests' },
    waller: { source: 'waller-1887', where: 'p. 229', quote: 'Each beat of the heart is seen to be accompanied by an electrical variation.' },
    einthoven: { source: 'einthoven-1912', leads: '(1) from the two hands, across the body; (2) from the right hand and left foot, obliquely; (3) from the left hand and left foot, lengthwise.', relation: 'lead II − lead I = lead III', relationQuote: 'The difference between the electrical tensions of leads I and II must be equal to the electrical tension of lead III.', calibration: '1 cm. shall exactly represent 1 millivolt', figure: 'Schema of the equilateral triangle. R corresponds to the right hand, L to the left hand, and F to both feet. The heart, H, is in the centre.', angles: [76, 40, 0] },
  },
};

writeDataset('datasets/biology/senses.json', data, {
  dataset: 'senses',
  version: '1.0.0',
  records: 12,
  sources: [
    { institution: 'Helmholtz, Treatise on Physiological Optics vol. 1, tr. J. P. C. Southall (OSA, 1924)', url: 'https://archive.org/details/helmholtzs-treatise-on-physiological-optics-vol-1', notes: 'reduced eyes, pupil, diffraction blur (page images)' },
    { institution: 'Colour & Vision Research Laboratory (UCL), cvrl.org', url: 'http://www.cvrl.org/', notes: 'peak wavelengths only (no licence for the tables)' },
    { institution: 'Fletcher, H. and Munson, W. A. (1933) Bell System Technical Journal 12, 377', url: 'https://archive.org/details/bstj12-4-377', notes: 'intensity level, eq. (4)' },
    { institution: 'Waller (1887); Einthoven (1912)', url: 'https://doi.org/10.1016/s0140-6736(00)50560-1', notes: 'first human ECG; Einthoven’s leads and relation (page images)' },
    { institution: 'NEI, NIDCD, NHLBI', url: 'https://www.nidcd.nih.gov/health/how-do-we-hear', license: 'public domain (NEI, NIDCD policies)', notes: 'how the eye and ear work; noise; the EKG' },
  ],
  adapter: 'scripts/ingestion/curated-senses.ts',
  warnings: ['Equations read on page images.', 'CVRL peaks located in its files; the spectra are not bundled.', 'The ECG view projects a dipole onto Einthoven’s leads: educational, not a heart model.'],
});
