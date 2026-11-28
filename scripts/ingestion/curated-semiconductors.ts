/**
 * Semiconductors (Phase 15, Gate 15.2) → datasets/engineering/semiconductors.json
 *
 *   node --experimental-strip-types scripts/ingestion/curated-semiconductors.ts
 *
 * Read 2026-11-28: Shockley (1949) BSTJ 28 pp. 435, 460 (page images, archive.org bstj28-3-435); TU Delft
 * OpenCourseWare, Solar Energy, section 12.1 “Crystalline silicon” (PDF text; course page CC BY-NC-SA 4.0).
 */
import { writeDataset } from './lib/ingest.ts';

const data = {
  version: '1.0.0',
  shockley: {
    source: 'shockley-1949',
    intro: { where: 'p. 435', quote: 'As is well known, silicon and germanium may be either n-type or p-type semiconductors, depending on which of the concentrations N_d of donors or N_a of acceptors, is the larger. If, in a single sample, there is a transition from one type to the other, a rectifying photosensitive p-n junction is formed.' },
    abstract: { where: 'p. 435', quote: 'The currents across the junction are carried by the diffusion of holes in n-type material and electrons in p-type material' },
    transistor: { where: 'p. 435', quote: 'The principles and theory of a p-n-p transistor are described.' },
    eq413: { where: 'p. 460, eq. (4.13)', eq: 'I₀ = I_p0 + I_n0 = (qD)(p_n/L_p + b n_p/L_n)(e^{q v₀/kT} − 1)', note: 'for the direct current per unit area for applied potential v₀', sign: 'The algebraic signs are such that I > 0 corresponds to current from the p-region to the n-region in the specimen; v₀ > 0 corresponds to a plus potential applied to the p-end.' },
  },
  silicon: { source: 'tudelft-ocw-solar', gapEV: 1.12, gapNm: 1107, quote: 'The band gap energy is the difference between those two levels and is equal 1.12 eV, or 1107 nm, when expressed in wavelengths. 1107 nm is in the infrared part of the spectrum of light.', indirect: 'This band gap is an indirect band gap' },
};
writeDataset('datasets/engineering/semiconductors.json', data, { dataset: 'semiconductors', version: '1.0.0', records: 6,
  sources: [{ institution: 'Shockley (1949), Bell System Technical Journal 28, 435', url: 'https://archive.org/details/bstj28-3-435', license: 'free to read (Bell Labs); short quotation only', notes: 'p-n junction equation (page image)' },
    { institution: 'TU Delft OpenCourseWare, Solar Energy, §12.1', url: 'https://ocw.tudelft.nl/courses/solar-energy/', license: 'course page: CC BY-NC-SA 4.0', notes: 'silicon band gap 1.12 eV, 1107 nm' }],
  adapter: 'scripts/ingestion/curated-semiconductors.ts', warnings: ['The compact form I = I_s(e^{qV/kT} − 1) restates Shockley’s (4.13); “I_s” is not his notation.'] });
