/**
 * Curated nebulae (Phase 6, Gate 6.5) → datasets/astronomical/nebulae.json
 *
 *   node --experimental-strip-types scripts/ingestion/curated-nebulae.ts
 *
 * Transcribed by hand. Each statement cites where it was read:
 *  - menten-2007: Orion Nebula Cluster distance 414 ± 7 pc (VLBA trigonometric parallax; arXiv PDF).
 *  - nasa-apod (1998 Aug 28, “Hydrogen Trifid”): at visible wavelengths the strongest emission line of recombining
 *    hydrogen “is in the red part of the spectrum and is known as "Hydrogen-alpha"”; (2000 Nov 22) the Orion Nebula's red
 *    light is emitted by its hydrogen gas. iau-oae-glossary (Nebula): massive stars make the surrounding gas emit
 *    reddish light, “nebulae of hot and ionized hydrogen gas which are called HII regions”. henney-2006: the
 *    equilibrium temperature of an H II region “is ≃ 9000 K”.
 *  - nasa-hubble-ring-1999 (Hubble Heritage, filters F469N He II, F501N [O III], F658N [N II]): blue = very hot helium
 *    close to the star, green = ionized oxygen farther out, red = ionized nitrogen “radiated from the coolest gas,
 *    located farthest from the star”. odell-2013: the same zones from calibrated HST images; distance 740 (+400/−200) pc.
 *    esa-hubble-images (heic1310): “thought to lie just over 2000 light-years from Earth”; the name of planetary nebulae
 *    comes from “their roughly circular appearance through low-magnification telescopes”. nasa-hubble-ring-2013: a red
 *    giant expels its outer layers, exposing its hot core, whose ultraviolet light makes the material glow.
 *  (These replaced OpenStax Astronomy 2e on 2026-11-27: OpenStax forbids AI ingestion.)
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
    lines: [{ spectrum: 'H I', label: 'Hα 656 nm', context: 'the nebula’s red light comes from its hydrogen gas; Hα is the strongest visible line of recombining hydrogen', source: 'nasa-apod' }],
    notes: [{ text: 'The intense radiation of massive young stars makes the surrounding gas glow with a reddish light: nebulae of hot, ionized hydrogen called H II regions.', source: 'iau-oae-glossary' }, { text: 'The gas of an H II region settles at an equilibrium temperature of about 9000 K.', source: 'henney-2006' }] },
  { id: 'ring', name: 'Ring Nebula', aliases: ['Messier 57', 'M57', 'NGC 6720'], type: 'planetary nebula', typeSource: 'esa-hubble-images',
    distance: { value: 2000, unit: 'ly', approximate: true, method: 'ESA/Hubble heic1310: “its precise distance is not known, but it is thought to lie just over 2000 light-years”; the image page lists 2500 ly and O’Dell et al. (2013) 740 (+400/−200) pc', source: 'esa-hubble-images' },
    image: 'heic1310a',
    lines: [
      { spectrum: 'N II', label: '[N II] 658 nm', context: 'red in the Hubble image: ionized nitrogen, radiated from the coolest gas, farthest from the star (F658N filter)', source: 'nasa-hubble-ring-1999' },
      { spectrum: 'O III', label: '[O III] 501 nm', context: 'green in the Hubble image: ionized oxygen, farther from the star than the helium and closer than the nitrogen (F501N filter)', source: 'nasa-hubble-ring-1999' },
    ],
    notes: [{ text: 'A red giant expels its outer layers and exposes its hot core; ultraviolet light from the core makes the discarded material glow.', source: 'nasa-hubble-ring-2013' }, { text: 'Planetary nebulae take their name from their roughly circular appearance through low-magnification telescopes; they have nothing to do with planets.', source: 'esa-hubble-images' }] },
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
    { institution: 'NASA APOD and Hubble pages; IAU OAE Glossary (CC BY 4.0); Henney (2006); O’Dell et al. (2013)', url: 'https://science.nasa.gov/asset/hubble/the-ring-nebula-m57/', notes: 'H II regions, Hα, planetary nebulae, Ring Nebula emission (replaced OpenStax Astronomy 2e, 2026-11-27)' },
    { institution: 'ESA/Hubble and ESA/Webb image pages', url: 'https://esahubble.org/copyright/', license: 'CC BY 4.0', notes: 'object types, approximate distances, Webb caption' },
  ],
  adapter: 'scripts/ingestion/curated-nebulae.ts',
  warnings: ['Hand-transcribed; approximate distances are flagged as such.'],
});
