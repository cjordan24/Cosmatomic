/**
 * Integrated circuits (Phase 15, Gate 15.3) → datasets/engineering/chips.json
 *
 *   node --experimental-strip-types scripts/ingestion/curated-chips.ts
 *
 * Read 2026-11-28 on the USPTO page images (image-ppubs.uspto.gov; robots.txt absent; U.S. patents are public
 * domain): Kilby US 3,138,743 (filed 6 Feb 1959) col. 1–2 and sheet 4; Noyce US 2,981,877 (filed 30 July 1959)
 * col. 1–2 and sheet 1. The two drawing sheets are reproduced in public/images/patents/ (downscaled, unaltered).
 */
import { writeDataset } from './lib/ingest.ts';

const data = {
  version: '1.0.0',
  kilby: { source: 'kilby-us3138743', number: '3,138,743', title: 'Miniaturized Electronic Circuits', filed: '1959-02-06', granted: '1964-06-23', assignee: 'Texas Instruments', image: '/images/patents/kilby-3138743-sheet4.jpg', imageCaption: 'Sheet 4 (Figs. 8a–8c), as filed',
    quotes: [
      'This invention relates to miniature electronic circuits, and more particularly to unique integrated electronic circuits fabricated from semiconductor material.',
      'It is, therefore, a principal object of this invention to provide a novel miniaturized electronic circuit fabricated from a body of semiconductor material containing a diffused p-n junction wherein all components of the electronic circuit are completely integrated into the body of semiconductor material.',
      'In accordance with the principles of the invention, the ultimate in circuit miniaturization is attained using only one material for all circuit elements and a limited number of compatible process steps for the production thereof.',
    ] },
  noyce: { source: 'noyce-us2981877', number: '2,981,877', title: 'Semiconductor Device-and-Lead Structure', filed: '1959-07-30', granted: '1961-04-25', assignee: 'Fairchild Semiconductor', image: '/images/patents/noyce-2981877-sheet1.jpg', imageCaption: 'Sheet 1 (Figs. 1 and 2: plan view and section), as filed',
    quotes: [
      'to make unitary circuit structures more compact and more easily fabricated in small sizes than has heretofore been feasible; and to facilitate the inclusion of numerous semiconductor devices within a single body of material.',
      'In brief, the present invention utilizes dished junctions extending to the surface of a body of extrinsic semiconductor, an insulating surface layer consisting essentially of oxide of the same semiconductor extending across the junctions, and leads in the form of vacuum-deposited or otherwise formed metal strips extending over and adherent to the insulating oxide layer for making electrical connections to and between various regions of the semiconductor body without shorting the junctions.',
    ],
    steps: [
      { title: 'Diffuse and oxidise', quote: 'During diffusion of the donor and acceptor impurities into the semiconductor, at elevated temperature in an oxidizing atmosphere, the surface of the silicon oxidizes and forms an oxide layer 5, often one micron or more in thickness, congenitally united with and covering surface 2.' },
      { title: 'An insulator', quote: 'the oxide surface layer is durable and firmly adherent to the semiconductor body, and furthermore it is a good electrical insulator.' },
      { title: 'Open windows by photoengraving', quote: 'A convenient and highly accurate way to remove only selected portions of the oxide film is to use photoengraving techniques.' },
      { title: 'Leads over the oxide', quote: 'Electrical connections to this emitter contact are made through a metal strip 7 extending over and adherent to oxide layer 5.' },
    ],
    scale: { quote: 'The thickness of the emitter and base layers has been exaggerated in the drawings: in actual practice each of these layers is but a few microns thick.' } },
};
writeDataset('datasets/engineering/chips.json', data, { dataset: 'chips', version: '1.0.0', records: 11,
  sources: [{ institution: 'United States Patent and Trademark Office: US 3,138,743 (Kilby) and US 2,981,877 (Noyce)', url: 'https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/3138743', license: 'U.S. patents: public domain', notes: 'text and drawings read on the page images' }],
  adapter: 'scripts/ingestion/curated-chips.ts', warnings: ['Moore (1965) is not used: Intel’s terms of use forbid automated access and no other open copy was found.'] });
