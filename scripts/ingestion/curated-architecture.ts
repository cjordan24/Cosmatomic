/**
 * Stored-program architecture (Phase 15, Gate 15.4) → datasets/engineering/architecture.json
 *
 *   node --experimental-strip-types scripts/ingestion/curated-architecture.ts
 *
 * Read 2026-11-28 on the page images: von Neumann, First Draft of a Report on the EDVAC (Moore School, 30 June 1945;
 * archive.org 20200901-vN_First_Draft_Report_EDVAC_Moore_Sch_1945, Public Domain Mark; leaf = printed page + 7):
 * pp. 3, 6, 7, 85.
 */
import { writeDataset } from './lib/ingest.ts';

const data = {
  version: '1.0.0',
  source: 'vonneumann-edvac-1945',
  parts: [
    { id: 'CA', where: 'p. 3', quote: 'At any rate a central arithmetical part of the device will probably have to exist, and this constitutes the first specific part: CA.' },
    { id: 'CC', where: 'p. 3', quote: 'The logical control of the device, that is the proper sequencing of its operations can be most efficiently carried out by a central control organ.' },
    { id: 'M', where: 'p. 6', quote: 'At any rate the total memory constitutes the third specific part of the device: M.' },
    { id: 'I', where: 'p. 7', quote: 'The device must have organs to transfer (numerical or other) information from R into its specific parts C and M. These organs form its input, the fourth specific part: I.' },
    { id: 'O', where: 'p. 7', quote: 'The device must have organs to transfer (presumably only numerical information) from its specific parts C and M into R. These organs form its output, the fifth specific part: O.' },
  ],
  stored: { where: 'p. 85', quote: 'The orders which are received by C come from M, i.e. from the same place where the numerical material is stored.', mark: 'each minor cycle must contain a distinguishing mark, which indicates whether its is a standard number or an order.' },
  outputFromM: { where: 'p. 7', quote: 'It will be seen that it is again best to make all transfers from M (by O) into R, and never directly from C' },
  nerves: { where: 'p. 6', quote: 'The three specific parts CA, CC (together C) and M correspond to the associative neurons in the human nervous system.' },
  classes: { where: 'p. 85', quote: 'The orders which CC receives fall naturally into these four classes: (a) Orders for CC to instruct CA to carry out one of its ten specific operations (cf. 11.4). (b) Orders for CC to cause the transfer of a standard number from one place to another. (c) Orders for CC to transfer its own connection with M to a different point in M, with the purpose of getting its next order from there. (d) Orders controlling the operation of the input and the output of the device' },
};
writeDataset('datasets/engineering/architecture.json', data, { dataset: 'architecture', version: '1.0.0', records: 8,
  sources: [{ institution: 'von Neumann, First Draft of a Report on the EDVAC (Moore School, University of Pennsylvania, 1945)', url: 'https://archive.org/details/20200901-vN_First_Draft_Report_EDVAC_Moore_Sch_1945', license: 'archive.org Public Domain Mark; no copyright notice on the 1945 title page', notes: 'pp. 3, 6, 7, 85 read on the page images' }],
  adapter: 'scripts/ingestion/curated-architecture.ts', warnings: [] });
