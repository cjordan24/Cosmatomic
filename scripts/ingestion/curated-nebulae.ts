/**
 * Curated nebulae (Phase 6, Gate 6.5) → datasets/astronomical/nebulae.json
 *
 *   node --experimental-strip-types scripts/ingestion/curated-nebulae.ts
 *
 * Transcribed by hand. Each statement cites where it was read:
 *  - menten-2007: Orion Nebula Cluster distance 414 ± 7 pc (VLBA trigonometric parallax; arXiv PDF).
 *  - openstax-astronomy-2e §20.2: “The red glow that pervades the great Orion Nebula is produced by the
 *    first line in the Balmer series of hydrogen”; “A cloud of ionized hydrogen is called an H II region”.
 *  - openstax-astronomy-2e §22.4: the Ring Nebula “located about 2000 light-years away”; red = ionized
 *    nitrogen (coolest gas, farthest from the star), green = oxygen emission (intermediate), blue = very
 *    hot helium; planetary nebulae imaged in once-ionized nitrogen and twice-ionized oxygen.
 *  - esa-hubble-images / esa-webb-images: object type and the approximate distance printed on the image
 *    page ("About the Object"), and the Webb caption for NGC 3324.
 * Line links point to spectra already bundled from NIST (H I 656.45 nm Hα; [N II] 658.53 nm; [O III]
 * 500.82 nm, vacuum wavelengths).
 */
import { writeDataset } from './lib/ingest.ts';

type Val = [number, number, number];
interface LineLink { spectrum: string; label: string; context: string; source: string }
interface Nebula {
  id: string; name: string; aliases: string[]; type: string; typeSource: string;
  distance: { value: Val | number; unit: 'pc' | 'ly'; approximate: boolean; method: string; source: string } | null;
  image: string; lines: LineLink[]; notes: { text: string; source: string }[];
}

const nebulae: Nebula[] = [
  { id: 'orion', name: 'Orion Nebula', aliases: ['Messier 42', 'M42'], type: 'H II region (star-forming)', typeSource: 'esa-hubble-images',
    distance: { value: [414, 7, 7], unit: 'pc', approximate: false, method: 'VLBA trigonometric parallax of Orion Nebula Cluster stars', source: 'menten-2007' },
    image: 'heic0601a',
    lines: [{ spectrum: 'H I', label: 'Hα 656 nm', context: 'the red glow of the nebula is the first Balmer line of hydrogen', source: 'openstax-astronomy-2e' }],
    notes: [{ text: 'A cloud of ionized hydrogen is called an H II region; the red hydrogen line is generally the strongest, which is why H II regions look red. Their gas is at about 10 000 K.', source: 'openstax-astronomy-2e' }] },
  { id: 'ring', name: 'Ring Nebula', aliases: ['Messier 57', 'M57', 'NGC 6720'], type: 'planetary nebula', typeSource: 'esa-hubble-images',
    distance: { value: 2000, unit: 'ly', approximate: true, method: 'as stated in the textbook (“about 2000 light-years”); the ESA/Hubble image page lists 2500 ly', source: 'openstax-astronomy-2e' },
    image: 'heic1310a',
    lines: [
      { spectrum: 'N II', label: '[N II] 658 nm', context: 'ionized nitrogen, radiated by the coolest gas farthest from the star', source: 'openstax-astronomy-2e' },
      { spectrum: 'O III', label: '[O III] 501 nm', context: 'oxygen emission from gas at intermediate temperature and distance; the same section shows planetary nebulae imaged in twice-ionized oxygen', source: 'openstax-astronomy-2e' },
    ],
    notes: [{ text: 'A planetary nebula is the shed outer layers of a red giant, heated, ionized and set aglow by the hot exposed core; the name comes from the planet-like round shape some show in small telescopes.', source: 'openstax-astronomy-2e' }] },
  { id: 'crab', name: 'Crab Nebula', aliases: ['Messier 1', 'M1'], type: 'supernova remnant', typeSource: 'esa-hubble-images',
    distance: { value: 6500, unit: 'ly', approximate: true, method: 'approximate distance printed on the ESA/Hubble image page', source: 'esa-hubble-images' },
    image: 'heic0515a', lines: [], notes: [] },
  { id: 'eagle', name: 'Pillars of Creation (Eagle Nebula)', aliases: ['Messier 16', 'M16'], type: 'star-forming region', typeSource: 'esa-hubble-images',
    distance: { value: 7000, unit: 'ly', approximate: true, method: 'approximate distance printed on the ESA/Hubble image page', source: 'esa-hubble-images' },
    image: 'heic1501a', lines: [], notes: [] },
  { id: 'carina-ngc3324', name: 'Cosmic Cliffs, NGC 3324 (Carina)', aliases: ['NGC 3324'], type: 'star-forming region (edge of a gaseous cavity)', typeSource: 'esa-webb-images',
    distance: { value: 7600, unit: 'ly', approximate: true, method: '“roughly 7,600 light-years away” (ESA/Webb caption)', source: 'esa-webb-images' },
    image: 'weic2205a', lines: [],
    notes: [{ text: 'The “steam” rising from the cliffs is hot, ionised gas and hot dust streaming away from the nebula under intense ultraviolet radiation.', source: 'esa-webb-images' }] },
];

writeDataset('datasets/astronomical/nebulae.json', { version: '1.0.0', nebulae }, {
  dataset: 'nebulae',
  version: '1.0.0',
  records: nebulae.length,
  sources: [
    { institution: 'Menten, Reid, Forbrich & Brunthaler (2007), A&A 474, 515', url: 'https://doi.org/10.1051/0004-6361:20078247', notes: 'Orion Nebula Cluster distance' },
    { institution: 'OpenStax Astronomy 2e §20.2 and §22.4', url: 'https://openstax.org/books/astronomy-2e/pages/22-4-further-evolution-of-stars', license: 'CC BY-NC-SA 4.0', notes: 'H II regions, Hα, planetary nebulae, Ring Nebula emission' },
    { institution: 'ESA/Hubble and ESA/Webb image pages', url: 'https://esahubble.org/copyright/', license: 'CC BY 4.0', notes: 'object types, approximate distances, Webb caption' },
  ],
  adapter: 'scripts/ingestion/curated-nebulae.ts',
  warnings: ['Hand-transcribed; approximate distances are flagged as such.'],
});
