/**
 * Membranes and the membrane potential (Phase 11, Gate 11.5) → datasets/biology/membranes.json
 *
 *   node --experimental-strip-types scripts/ingestion/curated-membranes.ts
 *
 * Transcribed by hand from the page images, 2026-11-28:
 *  - hodgkin-katz-1949: A. L. Hodgkin and B. Katz (1949) J. Physiol. 108, 37–77, read on archive.org
 *    (sim_journal-of-physiology_the-journal-of-physiology_1949_108, leaves n83–n84 = pp. 66–67).
 *    p. 66: equation (4); “E is the potential difference across the membrane (outside − inside) in the absence of
 *    any net ionic current”; the internal concentrations (K)ᵢ = 345, (Na)ᵢ = 72, (Cl)ᵢ = 61 mM.
 *    p. 67: Table 7 in full (nine test solutions × three states of the nerve; observed and calculated changes;
 *    permeability coefficients; potentials in sea water) and its footnote (artificial sea water 10 K, 455 Na,
 *    587 Cl mM for solutions A–C; sea water approximately 10 K, 455 Na, 540 Cl mM for D–I).
 *  - nigms-biobeat-membranes-2021: A. Bigler, “Science Snippet: The Marvels of Membranes” (NIGMS, 2021).
 */
import { writeDataset } from './lib/ingest.ts';

const solutions = [
  { id: 'A', K: 0, Na: 465, Cl: 587, reference: 'artificial' }, { id: 'B', K: 15, Na: 450, Cl: 587, reference: 'artificial' }, { id: 'C', K: 20, Na: 445, Cl: 587, reference: 'artificial' },
  { id: 'D', K: 7, Na: 324, Cl: 384, reference: 'sea' }, { id: 'E', K: 5, Na: 227, Cl: 270, reference: 'sea' }, { id: 'F', K: 3, Na: 152, Cl: 180, reference: 'sea' },
  { id: 'G', K: 2, Na: 91, Cl: 108, reference: 'sea' }, { id: 'H', K: 10, Na: 573, Cl: 658, reference: 'sea' }, { id: 'I', K: 10, Na: 711, Cl: 796, reference: 'sea' },
];
// observed / calculated change in membrane potential (mV) for solutions A–I
const states = [
  { id: 'rest', label: 'Resting', P: { K: 1, Na: 0.04, Cl: 0.45 }, observed: [3, -2, -4, 0, 2, 2, 4, 1, -2], calculated: [5, -2, -4, 1, 2, 2, 3, 0, 0] },
  { id: 'active', label: 'Active (peak of spike)', P: { K: 1, Na: 20, Cl: 0.45 }, observed: [-1, 1, 5, 9, 21, 44, 59, -3, -9], calculated: [-1, 0, 1, 8, 16, 25, 38, -5, -10] },
  { id: 'refractory', label: 'Refractory (maximum of positive phase)', P: { K: 1.8, Na: 0, Cl: 0.45 }, observed: [13, -6, -10, 1, 4, 4, 0, 1, 0], calculated: [12, -5, -9, 1, 2, 3, 3, 1, 3] },
];
const seaWater = [
  { id: 'rest', label: 'Membrane potential at rest in sea water', observed: '+48+J', calculated: 59 },
  { id: 'active', label: 'Membrane potential at height of activity in sea water', observed: '−40+J', calculated: -38 },
  { id: 'refractory', label: 'Membrane potential at maximum of positive phase', observed: '+62+J', calculated: 74 },
  { id: 'ap', label: 'Action potential in sea water', observed: '88', calculated: 97 },
  { id: 'pos', label: 'Positive phase in sea water', observed: '14', calculated: 15 },
];

const data = {
  version: '1.0.0',
  hodgkinKatz: {
    source: 'hodgkin-katz-1949',
    equation: { where: 'p. 66, equation (4)', text: 'E = (RT/F) logₑ [ (P_K (K)ᵢ + P_Na (Na)ᵢ + P_Cl (Cl)ₒ) / (P_K (K)ₒ + P_Na (Na)ₒ + P_Cl (Cl)ᵢ) ]' },
    signConvention: 'E is the potential difference across the membrane (outside − inside) in the absence of any net ionic current.',
    limit: 'it reduces to the thermodynamically correct forms when any one permeability constant is made large compared to the others.',
    caution: 'equation 4 cannot be regarded as more than a rough approximation.',
    internal: { K: 345, Na: 72, Cl: 61, where: 'p. 66 (from Steinbach & Spiegelman 1943; Steinbach 1941)' },
    seaWaterSolution: { K: 10, Na: 455, Cl: 540, approximate: true, where: 'p. 67, Table 7 footnote' },
    artificialSeaWater: { K: 10, Na: 455, Cl: 587, where: 'p. 67, Table 7 footnote' },
    junctionNote: 'J is the liquid junction potential between the axoplasm and the sea water in the microelectrode.',
    solutions, states, seaWater,
  },
  membraneText: [
    { quote: 'The lipids that compose membranes are primarily phospholipids. (Cholesterol is another lipid often present in membranes that helps regulate their stiffness.) Phospholipids have hydrophilic (water-loving) “heads” and hydrophobic (water-fearing) “tails.” Within the human body, a water-loving environment, they line up so that their tails face one another and their heads point outward. In membranes, this alignment makes a bilayer barrier that is two lipid molecules deep.', source: 'nigms-biobeat-membranes-2021' },
    { quote: 'Although many small molecules and gases can pass freely across the lipid bilayer, tunnel-like proteins of the membrane must transport large or charged molecules. Along with importing and exporting nutrients and toxins, these transmembrane proteins are tasked with an important role of pumping ions into or out of the cell. The transfer results in ion gradients—more ions on one side of the membrane than the other—which are necessary for energy production and nerve signaling.', source: 'nigms-biobeat-membranes-2021' },
    { quote: 'Scientists estimate that between 20 and 30 percent of the proteins that our cells make are found within membranes.', source: 'nigms-biobeat-membranes-2021' },
  ],
};

writeDataset('datasets/biology/membranes.json', data, {
  dataset: 'membranes',
  version: '1.0.0',
  records: solutions.length * states.length + seaWater.length + 3,
  sources: [
    { institution: 'Hodgkin, A. L. and Katz, B. (1949) J. Physiol. 108, 37–77', url: 'https://doi.org/10.1113/jphysiol.1949.sp004310', notes: 'equation (4), internal concentrations, Table 7 (read on archive.org page images, pp. 66–67)' },
    { institution: 'NIGMS Biomedical Beat (Bigler 2021)', url: 'https://nigms.nih.gov/biobeat/2021/12/science-snippet-the-marvels-of-membranes', license: 'NIGMS: “Most of the information on this website is not copyrighted so you are free to use it with proper attribution.”', notes: 'phospholipid bilayer, ion gradients, membrane proteins' },
  ],
  adapter: 'scripts/ingestion/curated-membranes.ts',
  warnings: ['Hand-transcribed from page images.', 'Squid giant axon only: no mammalian ion concentrations were found in an allowed source.', 'Concentrations stand in for activities, as in the paper’s calculation.'],
});
