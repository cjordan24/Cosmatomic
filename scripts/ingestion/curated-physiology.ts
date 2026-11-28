/**
 * Movement, circulation and breathing (Phase 12, Gates 12.2–12.3) → datasets/biology/physiology.json
 *
 *   node --experimental-strip-types scripts/ingestion/curated-physiology.ts
 *
 * Quotes checked verbatim against the saved pages (2026-11-28); equations and numbers read on page images:
 *  - seer-training: skeletal divisions and bone classification; muscle types; heart physiology; blood vessels and
 *    circulation; blood; breathing.
 *  - nhlbi: blood flow through the heart; heart rate; blood-pressure categories (Diagnosis page, updated
 *    June 26, 2025); alveoli.
 *  - hill-1938: Proc. R. Soc. B 126, 136–195, archive.org dli.ernet.534464, p. 161 (leaf n181): equations (1), (2), the
 *    hyperbola's asymptotes, “b/l was about 0·33/sec” (frog sartorius, 0 °C), and heat “approximately equal to P₀x/4”
 *    in shortening x, i.e. a/P₀ ≈ 1/4 (p. 160: “the mean value of a/P₀ was about 0·25”). Copyright likely subsists
 *    (Hill d. 1977): only equations and short phrases are used.
 *  - poiseuille-1840: Comptes rendus 11 (1840), archive.org comptesrendusheb11acad (public domain), p. 1046 (n1055):
 *    Q = k″PD⁴/L, the seven tubes' k″ and their printed mean, and the water formula.
 */
import { writeDataset } from './lib/ingest.ts';

const SEER = 'seer-training', NHLBI = 'nhlbi';
const S = (p: string) => `https://training.seer.cancer.gov${p}`;
const data = {
  version: '1.0.0',
  bones: {
    divisions: { quote: 'The adult human skeleton usually consists of 206 named bones. These bones can be grouped in two divisions: axial skeleton and appendicular skeleton.', axial: 80, appendicular: 126, total: 206, source: SEER, url: S('/anatomy/skeletal/divisions/') },
    types: [
      { id: 'long', quote: 'Long bones include bones of the thigh, leg, arm, and forearm.' },
      { id: 'short', quote: 'Short bones are roughly cube shaped with vertical and horizontal dimensions approximately equal.' },
      { id: 'flat', quote: 'Flat bones are thin, flattened, and usually curved.' },
      { id: 'irregular', quote: 'Bones that are not in any of the above three categories are classified as irregular bones. They are primarily spongy bone that is covered with a thin layer of compact bone. The vertebrae and some of the bones in the skull are irregular bones.' },
    ],
    typesIntro: 'The four principal types of bones are long, short, flat and irregular.', typesUrl: S('/anatomy/skeletal/classification.html'),
  },
  muscle: {
    types: { quote: 'In the body, there are three types of muscle: skeletal (striated), smooth, and cardiac.', url: S('/anatomy/muscular/types.html') },
    heat: { quote: 'Nearly 85 percent of the heat produced in the body is the result of muscle contraction.', url: S('/anatomy/muscular/') },
    hill: {
      source: 'hill-1938', where: 'p. 161', eq1: '(P + a) v = b (P₀ − P)', eq2: '(P + a)(v + b) = (P₀ + a) b = const',
      asymptotes: 'a rectangular hyperbola with asymptotes at P = −a, v = −b',
      aOverP0: 0.25, aOverP0Where: 'p. 160 (“the mean value of a/P₀ was about 0·25”) and p. 161 (heat “approximately equal to P₀x/4”)',
      bOverL: 0.33, bOverLWhere: 'p. 161: “At 0° C in the frog’s sartorius the mean value of b/l was about 0·33/sec”',
      animal: 'frog sartorius, 0 °C',
    },
  },
  heart: {
    output: { quote: 'The normal adult heart pumps about 5 liters of blood every minute throughout life.', litresPerMinute: 5, source: SEER, url: S('/anatomy/cardiovascular/heart/') },
    sinoatrial: { quote: 'Without any neural stimulation, the sinoatrial node rhythmically initiates impulses 70 to 80 times per minute.', low: 70, high: 80, source: SEER, url: S('/anatomy/cardiovascular/heart/physiology.html') },
    cycle: { quote: 'At a normal heart rate, one cardiac cycle lasts for 0.8 second.', seconds: 0.8, source: SEER, url: S('/anatomy/cardiovascular/heart/physiology.html') },
    phases: { quote: 'Systole is the contraction phase of the cardiac cycle, and diastole is the relaxation phase.', source: SEER, url: S('/anatomy/cardiovascular/heart/physiology.html') },
    restingRate: { quote: 'At rest, a heart rate of 60 to 100 beats per minute is normal.', low: 60, high: 100, source: NHLBI, url: 'https://www.nhlbi.nih.gov/health/heart/heart-beats' },
    valves: [
      { quote: 'The tricuspid valve separates the right atrium and right ventricle.', source: NHLBI, url: 'https://www.nhlbi.nih.gov/health/heart/blood-flow' },
      { quote: 'The mitral valve separates the left atrium and left ventricle.', source: NHLBI, url: 'https://www.nhlbi.nih.gov/health/heart/blood-flow' },
    ],
    pathQuotes: [
      { quote: 'Oxygen-poor blood from the body enters your heart through two large veins called the superior and inferior vena cava.', source: NHLBI, url: 'https://www.nhlbi.nih.gov/health/heart/blood-flow' },
      { quote: 'The pulmonary artery then carries the oxygen-poor blood from your heart to the lungs. Your lungs add oxygen to your blood. The oxygen-rich blood returns to your heart through the pulmonary veins.', source: NHLBI, url: 'https://www.nhlbi.nih.gov/health/heart/blood-flow' },
    ],
    path: ['vena cava', 'right atrium', 'right ventricle', 'pulmonary artery', 'lungs', 'pulmonary veins', 'left atrium', 'left ventricle', 'aorta'],
  },
  bloodPressure: {
    source: NHLBI, url: 'https://www.nhlbi.nih.gov/health/high-blood-pressure/diagnosis', updated: 'June 26, 2025',
    categories: [
      { id: 'normal', label: 'Normal', text: 'Less than 120 systolic pressure AND Less than 80 diastolic pressure' },
      { id: 'elevated', label: 'Elevated', text: '120 to 129 systolic pressure AND Less than 80 diastolic pressure' },
      { id: 'stage1', label: 'High Blood Pressure Stage 1', text: '130 to 139 systolic pressure OR 80 to 89 diastolic pressure' },
      { id: 'stage2', label: 'High Blood Pressure Stage 2', text: '140 or higher systolic pressure OR 90 or higher diastolic pressure' },
      { id: 'crisis', label: 'Hypertensive Crisis', text: 'Higher than 180 systolic pressure OR Higher than 120 diastolic pressure' },
    ],
  },
  blood: {
    volume: { quote: 'In an adult human, blood volume measures about five liters and accounts for eight percent (8%) of the body weight.', source: SEER, url: S('/hematopoietic1/intro-to-blood.html') },
    plasma: { quote: 'The light yellow fluid at the top is plasma, which makes up about 55% of blood volume.', fraction: 0.55, source: SEER, url: S('/hematopoietic1/intro-to-blood.html') },
    distribution: [
      { id: 'arteries', label: 'systemic arteries', share: 0.10, quote: 'About 10 percent of the total blood volume is in the systemic arterial system at any given time.' },
      { id: 'capillaries', label: 'systemic capillaries', share: 0.05, quote: 'About 5 percent of the total blood volume is in the systemic capillaries at any given time.' },
      { id: 'lungs', label: 'lungs', share: 0.10, quote: 'Another 10 percent is in the lungs.' },
      { id: 'veins', label: 'veins', share: 0.70, quote: 'Almost 70 percent of the total blood volume is in the veins at any given time.' },
    ],
    distributionUrl: S('/anatomy/cardiovascular/blood/classification.html'),
    velocity: { quote: 'The rate, or velocity, of blood flow varies inversely with the total cross-sectional area of the blood vessels.', url: S('/anatomy/cardiovascular/blood/physiology.html') },
    resistance: { quote: 'In blood vessels, most of the resistance is due to vessel diameter.', url: S('/anatomy/cardiovascular/blood/physiology.html') },
  },
  lungs: {
    alveoli: { quote: 'Your lungs have about 150 million alveoli.', count: 150e6, source: NHLBI, url: 'https://www.nhlbi.nih.gov/health/lungs/respiratory-system' },
    breathing: { quote: 'Under normal conditions, the average adult takes 12 to 15 breaths a minute.', low: 12, high: 15, source: SEER, url: S('/anatomy/respiratory/capacity.html') },
  },
  poiseuille: {
    source: 'poiseuille-1840', where: 'p. 1046',
    law: 'Q = k″ PD⁴/L',
    lawQuote: 'Q = k″ PD⁴/L, k″ étant un coefficient constant pour la même température et la même intensité de la pesanteur.',
    conclusion: 'les produits, toutes choses égales d’ailleurs, sont entre eux comme les quatrièmes puissances des diamètres.',
    tubes: [['M', 2495.50], ['E', 2496.00], ['D', 2494.42], ['C', 2497.77], ['B', 2496.20], ['A', 2492.67], ['F', 2495.00]],
    printedMean: 2495.224, tC: 10,
    water: { k: 183.783, quote: 'Si la pression, au lieu d’être déterminée, comme nous venons de le faire, par une charge de mercure, l’était par une charge d’eau distillée, la formule deviendrait, toujours à 10° c., Q = 183,783 PD⁴/L.' },
    units: 'Units as printed on the page: volumes in cubic millimetres (“mm.c.”), flow time taken as 1″, pressure as a head of mercury (or of distilled water); the length units of D and L are not restated on this page',
  },
};

writeDataset('datasets/biology/physiology.json', data, {
  dataset: 'physiology',
  version: '1.0.0',
  records: 4 + 1 + 3 + 6 + 5 + 7 + 2,
  sources: [
    { institution: 'NCI SEER Training Modules', url: 'https://training.seer.cancer.gov/', notes: 'bones, muscle, heart, circulation, blood, breathing' },
    { institution: 'NHLBI', url: 'https://www.nhlbi.nih.gov/health/high-blood-pressure/diagnosis', notes: 'heart valves and rate, blood-pressure categories, alveoli' },
    { institution: 'Hill, A. V. (1938) Proc. R. Soc. B 126, 136', url: 'https://doi.org/10.1098/rspb.1938.0050', notes: 'force–velocity equations and frog-sartorius constants (page images)' },
    { institution: 'Poiseuille, J. L. M. (1840) Comptes rendus 11, 1041', url: 'https://archive.org/details/comptesrendusheb11acad', notes: 'Q = k″PD⁴/L and coefficients at 10 °C (page images)' },
  ],
  adapter: 'scripts/ingestion/curated-physiology.ts',
  warnings: ['Quotes verbatim; equations transcribed from page images.', 'Hill’s constants are for frog muscle at 0 °C, not human muscle.', 'Poiseuille’s printed mean k″ (2495,224) differs from the mean of his seven printed values (2495,37); both are kept.'],
});
