/**
 * Nerves (Phase 12, Gate 12.4) → datasets/biology/nerves.json
 *
 *   node --experimental-strip-types scripts/ingestion/curated-nerves.ts
 *
 * Read on page images (2026-11-28):
 *  - hodgkin-huxley-1952: J. Physiol. 117, 500–544 (archive.org sim_journal-of-physiology_the-journal-of-physiology_1952_117,
 *    leaf = page + 21): pp. 505, 518–520 (equations, Table 3), 523 (φ), 528 (propagated action potential, eq. 34).
 *    Equations are in src/core/biology/hodgkinHuxley.ts; this file keeps the statements and numbers shown in the view.
 *  - hursh-1939: Am. J. Physiol. 127, 131–139 (archive.org sim_american-journal-of-physiology_1939-08-01_127_1), p. 136.
 * Quoted from text: azevedo-2009 (abstract, from its Crossref record); nigms-biobeat-nerve-2022; seer-training (nerve tissue,
 * CNS organisation).
 */
import { writeDataset } from './lib/ingest.ts';

const data = {
  version: '1.0.0',
  hh: {
    source: 'hodgkin-huxley-1952',
    convention: { where: 'p. 505', quote: 'V is the displacement of the membrane potential from its resting value (depolarization negative)' },
    units: { where: 'p. 519', quote: 'Potentials are given in mV, current density in µA/cm², conductances in m.mho/cm², capacity in µF/cm², and time in msec. The expressions for the α’s and β’s are appropriate to a temperature of 6·3° C; for other temperatures they must be scaled with a Q10 of 3.' },
    table3: { where: 'p. 520, Table 3', rows: [
      { constant: 'C_M (µF/cm²)', chosen: '1·0', mean: '0·91', range: '0·8 to 1·5' },
      { constant: 'V_Na (mV)', chosen: '−115', mean: '−109', range: '−95 to −119' },
      { constant: 'V_K (mV)', chosen: '+12', mean: '+11', range: '+9 to +14' },
      { constant: 'V_l (mV)', chosen: '−10·613*', mean: '−11', range: '−4 to −22' },
      { constant: 'ḡ_Na (m.mho/cm²)', chosen: '120', mean: '80 / 160', range: '65 to 90 / 120 to 260' },
      { constant: 'ḡ_K (m.mho/cm²)', chosen: '36', mean: '34', range: '26 to 49' },
      { constant: 'ḡ_l (m.mho/cm²)', chosen: '0·3', mean: '0·26', range: '0·13 to 0·50' },
    ], footnote: '* Exact value chosen to make the total ionic current zero at the resting potential (V = 0).' },
    propagation: { where: 'p. 528', K: 10.47, tempC: 18.5, aCm: 0.0238, R2: 35.4, CM: 1.0, calculated: 18.8, measured: 21.2,
      quote: 'The values of a and R₂ were 238 µ and 35·4 Ω. cm respectively. Hence the calculated conduction velocity is (10470 × 0·0238/2 × 35·4 × 10⁻⁶)½ cm/sec = 18·8 m/sec. The velocity found experimentally in this fibre was 21·2 m/sec.' },
  },
  hursh: { source: 'hursh-1939', where: 'p. 136', factor: 6.0, animal: 'cat (adults and kittens)',
    quote: 'It has a slope of 6.0, which means that the velocity in meters per second can be obtained by multiplying the diameter in micra by this factor.' },
  neurons: {
    count: { source: 'azevedo-2009', quote: 'We find that the adult male human brain contains on average 86.1 ± 8.1 billion NeuN‐positive cells (“neurons”) and 84.6 ± 9.8 billion NeuN‐negative (“nonneuronal”) cells.', neurons: 86.1e9, sd: 8.1e9, nonNeuronal: 84.6e9 },
    text: [
      { quote: 'The human body contains billions of interconnected nerve cells that carry information to, within, and from the brain.', source: 'nigms-biobeat-nerve-2022' },
      { quote: 'Once the electrical impulse reaches the end of the axon, it triggers the release of neurotransmitters into the small gap, or synapse, between the axon and a neighboring cell’s dendrites.', source: 'nigms-biobeat-nerve-2022' },
      { quote: 'It is the "conducting" cell that transmits impulses and the structural unit of the nervous system.', source: 'seer-training', subject: 'The neuron' },
      { quote: 'In the peripheral nervous system, the myelin is produced by Schwann cells.', source: 'seer-training' },
      { quote: 'The unmyelinated regions between the myelin segments are called the nodes of Ranvier.', source: 'seer-training' },
      { quote: 'They are far more numerous than neurons and, unlike neurons, are capable of mitosis.', source: 'seer-training', subject: 'Neuroglia' },
      { quote: 'The spinal cord is divided into 31 segments with each segment giving rise to a pair of spinal nerves.', source: 'seer-training' },
    ],
  },
};

writeDataset('datasets/biology/nerves.json', data, {
  dataset: 'nerves',
  version: '1.0.0',
  records: 7 + 1 + 1 + 1 + 7,
  sources: [
    { institution: 'Hodgkin, A. L. and Huxley, A. F. (1952) J. Physiol. 117, 500–544', url: 'https://doi.org/10.1113/jphysiol.1952.sp004764', notes: 'equations, Table 3, propagation (page images)' },
    { institution: 'Hursh, J. B. (1939) Am. J. Physiol. 127, 131–139', url: 'https://doi.org/10.1152/ajplegacy.1939.127.1.131', notes: 'velocity = 6.0 × diameter (cat), p. 136 (page image)' },
    { institution: 'Azevedo, F. A. C. et al. (2009) J. Comp. Neurol. 513, 532–541', url: 'https://doi.org/10.1002/cne.21974', notes: 'neuron count (abstract, via Crossref)' },
    { institution: 'NIGMS Biomedical Beat; NCI SEER Training Modules', url: 'https://training.seer.cancer.gov/anatomy/nervous/tissue.html', notes: 'neurons, synapse, myelin, neuroglia, spinal cord' },
  ],
  adapter: 'scripts/ingestion/curated-nerves.ts',
  warnings: ['Squid giant axon (Hodgkin–Huxley) and cat nerves (Hursh): neither is human.', 'Hodgkin–Huxley sign convention kept in the data; the view plots −V (depolarisation upward).'],
});
