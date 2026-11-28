/**
 * Plants and photosynthesis (Phase 11, Gate 11.7) → datasets/biology/plants.json
 *
 *   node --experimental-strip-types scripts/ingestion/curated-plants.ts
 *
 *  - omlc-photochemcad: S. Prahl, OMLC pages for chlorophyll a and b in diethyl ether (PhotochemCAD 2.1a data, 2017):
 *    the stated scaling values (111,700 cm⁻¹/M at 427.8 nm, Strain 1963; 159,100 cm⁻¹/M at 453.0 nm, Vernon 1966)
 *    and fluorescence quantum yields (0.32 and 0.117, Weber 1957). The red-band maxima (660.06 nm, 85,265; 643.0 nm,
 *    57,050) were located in the data files and are marked as read from the data, not stated on the pages.
 *    OMLC gives no licence, so the spectra themselves are NOT bundled — only these points.
 *  - nasa-carbon-cycle-2011: H. Riebeek, “The Carbon Cycle”, NASA Earth Observatory (16 June 2011), the
 *    photosynthesis and respiration equations as printed.
 */
import { writeDataset } from './lib/ingest.ts';

const chlorophyll = [
  { id: 'chl-a', name: 'Chlorophyll a', solvent: 'diethyl ether', url: 'https://omlc.org/spectra/PhotochemCAD/html/123.html',
    peaks: [
      { nm: 427.8, epsilon: 111700, stated: true, quote: 'These measurements were scaled to make the molar extinction coefficient match the value of 111,700cm-1/M at 427.8nm (Strain, 1963).' },
      { nm: 660.06, epsilon: 85265, stated: false, quote: 'red-band maximum located in the OMLC data file 123-abs.txt' },
    ], quantumYield: { value: 0.32, quote: 'The quantum yield of this molecule is 0.32 (Weber, 1957).' } },
  { id: 'chl-b', name: 'Chlorophyll b', solvent: 'diethyl ether', url: 'https://omlc.org/spectra/PhotochemCAD/html/125.html',
    peaks: [
      { nm: 453.0, epsilon: 159100, stated: true, quote: 'These measurements were scaled to make the molar extinction coefficient match the value of 159,100cm-1/M at 453.0nm (Vernon, 1966).' },
      { nm: 643.0, epsilon: 57050, stated: false, quote: 'red-band maximum located in the OMLC data file 125-abs.txt' },
    ], quantumYield: { value: 0.117, quote: 'The quantum yield of this molecule is 0.117 (Weber, 1957).' } },
];
const photosynthesis = {
  source: 'nasa-carbon-cycle-2011',
  quote: 'Using energy from the Sun, both plants and plankton combine carbon dioxide (CO2) and water to form sugar (CH2O) and oxygen. The chemical reaction looks like this:',
  equation: 'CO2 + H2O + energy = CH2O + O2',
  reverse: { quote: 'CH2O + O2 = CO2 + H2O + energy', note: 'respiration and decay, as printed on the same page' },
  fuel: 'During photosynthesis, plants absorb carbon dioxide and sunlight to create fuel—glucose and other sugars—for building plant structures.',
};

writeDataset('datasets/biology/plants.json', { version: '1.0.0', chlorophyll, photosynthesis }, {
  dataset: 'plants',
  version: '1.0.0',
  records: chlorophyll.length * 2 + 1,
  sources: [
    { institution: 'Oregon Medical Laser Center (S. Prahl), PhotochemCAD 2.1a data; Du et al. (1998); Dixon et al. (2005)', url: 'https://omlc.org/spectra/PhotochemCAD/', notes: 'chlorophyll a and b absorption maxima and quantum yields (points only; no licence stated, spectra not bundled)' },
    { institution: 'NASA Earth Observatory (H. Riebeek, 2011)', url: 'https://science.nasa.gov/earth/earth-observatory/the-carbon-cycle/', notes: 'photosynthesis and respiration equations' },
  ],
  adapter: 'scripts/ingestion/curated-plants.ts',
  warnings: ['Red-band maxima read from the data files (not stated on the pages).', 'Measured in diethyl ether solution; the environment inside a leaf is not represented.'],
});
