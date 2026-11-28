/**
 * Scale of life (Phase 11, Gate 11.1) → datasets/biology/life-sizes.json
 *
 *   node --experimental-strip-types scripts/ingestion/curated-life-sizes.ts
 *
 * Transcribed by hand, 2026-11-28. Every report carries its verbatim quote and where it was read.
 *  - nigms-inside-the-cell: NIGMS, Inside the Cell (NIH Pub. 05-1051, 2005). Checked on the archive.org page images
 *    (item ost-biology-inside_the_cell): p. 7 (leaf n8) eukaryote/prokaryote table; p. 11 (n12) size table;
 *    p. 20 (n21) human egg.
 *  - nigms-biobeat-organelles-2021: same size table on the NIGMS Biomedical Beat blog (Machalek, 2021).
 *  - nigms-biobeat-nanoparticles-2023: DNA ≈ 2 nm, haemoglobin ≈ 5.5 nm, hair 80 000–100 000 nm (Bigler, 2023).
 *  - nano-gov-how-small: National Nanotechnology Initiative, “Just How Small Is ‘Nano’?” (DNA 2.5 nm; hair).
 *  - doe-scale-of-things-2006: U.S. DOE Office of Basic Energy Sciences, “The Scale of Things” (v. 05-26-06, PDF on nist.gov):
 *    read on the chart image (rotated): red blood cells, hair, dust mite, ATP synthase, DNA, ant.
 *  - pdb101-virus-structures: RCSB PDB-101 “Virus Structures” flyer (CC BY 4.0): the size range in the text and the two
 *    scale bars of the figure (feline distemper 28.4 nm, PDB 1c8e; mimivirus 520 nm, EMD-5039).
 * Where sources disagree (DNA width 2 nm vs 2.5 nm; hair width) every report is kept and shown.
 * Not found in an allowed source (left out): water and glucose sizes as quoted numbers (the atlas derives them from the
 * bundled 3D structures instead), DNA base-pair rise, bilayer thickness, E. coli dimensions, influenza/SARS-CoV-2 sizes
 * (CDC/NIAID robots.txt answered 403), red-cell thickness, neuron length.
 */
import { writeDataset } from './lib/ingest.ts';

type Category = 'macromolecule' | 'assembly' | 'virus' | 'organelle' | 'cell' | 'organism' | 'reference';
interface Report {
  /** metres: a single value, or [low, high] for a quoted range */
  m: number | [number, number];
  approximate: boolean;
  quote: string;
  where: string;
  source: string;
}
interface LifeSize {
  id: string; label: string; category: Category;
  /** what the length is */
  quantity: string;
  reports: Report[];
  /** in-app links: molecule viewer, protein viewer … */
  links?: { label: string; to: string }[];
}

const nm = 1e-9, um = 1e-6, mm = 1e-3;
const ITC = 'nigms-inside-the-cell', ITC11 = 'p. 11, size table (“actual size (average)”)';

const items: LifeSize[] = [
  { id: 'dna', label: 'DNA double helix', category: 'macromolecule', quantity: 'width (diameter) of the helix',
    reports: [
      { m: 2 * nm, approximate: true, quote: 'DNA is about 2 nanometers wide', where: 'Biomedical Beat, “Zooming In on Nanoparticles”', source: 'nigms-biobeat-nanoparticles-2023' },
      { m: 2.5 * nm, approximate: false, quote: 'A strand of human DNA is 2.5 nanometers in diameter.', where: '“Just How Small Is ‘Nano’?”', source: 'nano-gov-how-small' },
      { m: 2.5 * nm, approximate: true, quote: 'DNA ~2-1/2 nm diameter', where: 'chart, “Things Natural” column', source: 'doe-scale-of-things-2006' },
    ] },
  { id: 'haemoglobin', label: 'Haemoglobin', category: 'macromolecule', quantity: 'width of the molecule',
    reports: [{ m: 5.5 * nm, approximate: true, quote: 'the protein in red blood cells that carries oxygen throughout our bodies is roughly 5.5 nanometers wide', where: 'Biomedical Beat, “Zooming In on Nanoparticles”', source: 'nigms-biobeat-nanoparticles-2023' }] },
  { id: 'actin', label: 'Actin filament', category: 'assembly', quantity: 'width',
    reports: [{ m: [5 * nm, 9 * nm], approximate: false, quote: 'Actin filament width 5–9 nanometers', where: ITC11, source: ITC }] },
  { id: 'intermediate-filament', label: 'Intermediate filament', category: 'assembly', quantity: 'width',
    reports: [{ m: 10 * nm, approximate: false, quote: 'Intermediate filament width 10 nanometers', where: ITC11, source: ITC }] },
  { id: 'atp-synthase', label: 'ATP synthase', category: 'assembly', quantity: 'diameter',
    reports: [{ m: 10 * nm, approximate: true, quote: 'ATP synthase ~10 nm diameter', where: 'chart, “Things Natural” column', source: 'doe-scale-of-things-2006' }] },
  { id: 'ribosome', label: 'Ribosome', category: 'assembly', quantity: 'diameter',
    reports: [
      { m: [20 * nm, 30 * nm], approximate: false, quote: 'Ribosome diameter 20–30 nanometers', where: ITC11, source: ITC },
      { m: [20 * nm, 30 * nm], approximate: false, quote: 'Ribosome diameter 20-30 nanometers', where: 'size table', source: 'nigms-biobeat-organelles-2021' },
    ] },
  { id: 'microtubule', label: 'Microtubule', category: 'assembly', quantity: 'width',
    reports: [{ m: 25 * nm, approximate: false, quote: 'Microtubule width 25 nanometers', where: ITC11, source: ITC }] },
  { id: 'feline-distemper', label: 'Feline distemper virus', category: 'virus', quantity: 'diameter (scale bar of the figure; PDB 1c8e)',
    reports: [{ m: 28.4 * nm, approximate: false, quote: '28.4 nm', where: 'figure scale bar beside “Feline distemper … PDB ID: 1c8e”', source: 'pdb101-virus-structures' }] },
  { id: 'viruses', label: 'Viruses (range in the flyer)', category: 'virus', quantity: 'diameter, smallest to largest shown',
    reports: [{ m: [30 * nm, 500 * nm], approximate: true, quote: 'ranging from less than 30 nanometers to over 500 nanometers in diameter', where: '“Virus Sizes” panel', source: 'pdb101-virus-structures' }] },
  { id: 'mimivirus', label: 'Mimivirus', category: 'virus', quantity: 'size (scale bar of the figure; EMD-5039)',
    reports: [{ m: 520 * nm, approximate: false, quote: '520 nm', where: 'figure scale bar beside “Mimivirus … one of the largest viruses … EMD-5039”', source: 'pdb101-virus-structures' }] },
  { id: 'lysosome', label: 'Lysosome', category: 'organelle', quantity: 'diameter',
    reports: [{ m: [50 * nm, 3000 * nm], approximate: false, quote: 'Lysosome diameter 50–3,000 nanometers', where: ITC11, source: ITC }] },
  { id: 'mitochondrion', label: 'Mitochondrion', category: 'organelle', quantity: 'length (typically 1–2 µm, up to 7 µm)',
    reports: [{ m: [1 * um, 2 * um], approximate: false, quote: 'Mitochondrion length Typically 1–2 micrometers but can be up to 7 micrometers long', where: ITC11, source: ITC }],
    links: [] },
  { id: 'prokaryote', label: 'Prokaryotic cells (most)', category: 'cell', quantity: 'size across',
    reports: [{ m: [1 * um, 10 * um], approximate: false, quote: 'Most are 1–10 micrometers across', where: 'p. 7, table “Eukaryotic cells / Prokaryotic cells”', source: ITC }] },
  { id: 'nucleus', label: 'Cell nucleus', category: 'organelle', quantity: 'diameter',
    reports: [{ m: 5 * um, approximate: false, quote: 'Nucleus diameter 5 micrometers', where: ITC11, source: ITC }] },
  { id: 'red-blood-cell', label: 'Red blood cell', category: 'cell', quantity: 'diameter',
    reports: [{ m: [7 * um, 8 * um], approximate: true, quote: 'Red blood cells (~7-8 µm)', where: 'chart, “Things Natural” column', source: 'doe-scale-of-things-2006' }] },
  { id: 'animal-cell', label: 'Animal cells (most)', category: 'cell', quantity: 'size across',
    reports: [
      { m: [10 * um, 30 * um], approximate: false, quote: 'Most animal cells are 10–30 micrometers across', where: 'p. 7, table “Eukaryotic cells / Prokaryotic cells”', source: ITC },
      { m: 30 * um, approximate: false, quote: 'Cell diameter 30 micrometers', where: `${ITC11} — the booklet’s example cell`, source: ITC },
    ] },
  { id: 'plant-cell', label: 'Plant cells (most)', category: 'cell', quantity: 'size across',
    reports: [{ m: [10 * um, 100 * um], approximate: false, quote: 'most plant cells are 10–100 micrometers across', where: 'p. 7, table “Eukaryotic cells / Prokaryotic cells”', source: ITC }] },
  { id: 'hair', label: 'Human hair', category: 'reference', quantity: 'width',
    reports: [
      { m: [80 * um, 100 * um], approximate: true, quote: 'A human hair is massive in comparison, with a width of about 80,000 to 100,000 nanometers.', where: 'Biomedical Beat, “Zooming In on Nanoparticles”', source: 'nigms-biobeat-nanoparticles-2023' },
      { m: [80 * um, 100 * um], approximate: true, quote: 'A human hair is approximately 80,000–100,000 nanometers wide.', where: '“Just How Small Is ‘Nano’?”', source: 'nano-gov-how-small' },
      { m: [60 * um, 120 * um], approximate: true, quote: 'Human hair ~ 60-120 µm wide', where: 'chart, “Things Natural” column', source: 'doe-scale-of-things-2006' },
    ] },
  { id: 'human-egg', label: 'Human egg cell', category: 'cell', quantity: 'diameter',
    reports: [{ m: 150 * um, approximate: false, quote: 'The largest human cell (by volume) is the egg. Human eggs are 150 micrometers in diameter and you can just barely see one with a naked eye.', where: 'p. 20, caption', source: ITC }] },
  { id: 'dust-mite', label: 'Dust mite', category: 'organism', quantity: 'body length (chart arrow)',
    reports: [{ m: 200 * um, approximate: false, quote: 'Dust mite 200 µm', where: 'chart, “Things Natural” column', source: 'doe-scale-of-things-2006' }] },
  { id: 'ant', label: 'Ant', category: 'organism', quantity: 'body length',
    reports: [{ m: 5 * mm, approximate: true, quote: 'Ant ~ 5 mm', where: 'chart, “Things Natural” column', source: 'doe-scale-of-things-2006' }] },
];

writeDataset('datasets/biology/life-sizes.json', { version: '1.0.0', items }, {
  dataset: 'life-sizes',
  version: '1.0.0',
  records: items.length,
  sources: [
    { institution: 'National Institute of General Medical Sciences (NIH), Inside the Cell (NIH Pub. No. 05-1051, 2005)', url: 'https://archive.org/details/ost-biology-inside_the_cell', license: 'U.S. government work; NIGMS: “Most of the information on this website is not copyrighted so you are free to use it with proper attribution.”', notes: 'cell, organelle and filament sizes; eukaryote/prokaryote table; human egg' },
    { institution: 'NIGMS Biomedical Beat (Machalek 2021; Bigler 2023)', url: 'https://nigms.nih.gov/biobeat/2023/12/science-snippet-zooming-in-on-nanoparticles', notes: 'DNA width, haemoglobin width, hair width; organelle size table' },
    { institution: 'National Nanotechnology Initiative (nano.gov)', url: 'https://www.nano.gov/nanotech-101/what/nano-size', license: '“government-produced materials appearing on this site are not copyright protected”', notes: 'DNA 2.5 nm; hair 80 000–100 000 nm' },
    { institution: 'U.S. Department of Energy, Office of Basic Energy Sciences: The Scale of Things (v. 05-26-06)', url: 'https://www.nist.gov/document/doescaleofthingschartpdf', notes: 'red blood cells, hair, dust mite, ATP synthase, DNA, ant' },
    { institution: 'RCSB Protein Data Bank, PDB-101 “Virus Structures” flyer', url: 'https://pdb101.rcsb.org/learn/flyers-posters-and-calendars/flyer/virus-structures', license: 'CC BY 4.0 (RCSB policies: “PDB-101 content is free for use under a CC-BY-4.0 license”)', notes: 'virus size range; feline distemper 28.4 nm; mimivirus 520 nm' },
  ],
  adapter: 'scripts/ingestion/curated-life-sizes.ts',
  warnings: ['Hand-transcribed from page images and web pages, 2026-11-28.', 'Most values are typical or approximate sizes, flagged per report; ranges are stored as [low, high].', 'Disagreeing sources are all kept (DNA width 2 nm vs 2.5 nm; hair width).'],
});
