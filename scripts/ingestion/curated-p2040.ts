/**
 * Building-material electrical properties (Phase 9, Gate 9.3) → datasets/spectral/building-materials.json
 *
 *   node --experimental-strip-types scripts/ingestion/curated-p2040.ts
 *
 * Transcribed by hand from Recommendation ITU-R P.2040-4 (09/2025), §3, Table 3 “Examples of material properties”
 * (PDF read from www.itu.int/dms_pubrec/…, a path robots.txt allows). Model (eqs. 57–59): ε′ = a·f^b and σ = c·f^d with
 * f in GHz and σ in S/m; ε″ = 17.98 σ/f. Every row of the table is kept with its frequency range, which the
 * Recommendation calls indicative, except for the three ground types (1–10 GHz “must not be exceeded”).
 */
import { writeDataset } from './lib/ingest.ts';

/** [material, a, b, c, d, fLo GHz, fHi GHz, upper-limit inclusive?] — row order as printed. */
const rows: [string, number, number, number, number, number, number][] = [
  ['Vacuum (≈ air)', 1, 0, 0, 0, 0.001, 100],
  ['Concrete', 5.24, 0, 0.0462, 0.7822, 1, 100],
  ['Concrete', 5.17, 0, 0.0145, 1.09, 110, 330],
  ['Brick', 3.91, 0, 0.0238, 0.16, 1, 40],
  ['Brick', 4.15, 0, 0.0006, 1.5712, 110, 330],
  ['Plasterboard', 2.73, 0, 0.0085, 0.9395, 1, 100],
  ['Plasterboard', 2.56, 0, 0.0001, 1.7799, 110, 330],
  ['Plasterboard', 2.65, 0, 0.0002, 1.598, 100, 400],
  ['Wood', 1.99, 0, 0.0047, 1.0718, 0.001, 100],
  ['Wood', 1.82, 0, 0.004, 1.0761, 110, 330],
  ['Wood', 2.1183, 0, 0.0055, 1.1113, 100, 400],
  ['Glass', 6.31, 0, 0.0036, 1.3394, 0.1, 100],
  ['Glass', 5.79, 0, 0.0004, 1.658, 220, 450],
  ['Glass', 6.5767, 0, 0.0012, 1.4697, 100, 400],
  ['Clear Acrylic', 2.58, 0, 0.0001, 1.6524, 110, 330],
  ['Ceiling board', 1.48, 0, 0.0011, 1.075, 1, 100],
  ['Ceiling board', 1.52, 0, 0.0029, 1.029, 220, 450],
  ['Ceiling board', 1.2567, 0, 0.00013, 1.454, 100, 400],
  ['Chipboard', 2.58, 0, 0.0217, 0.78, 1, 100],
  ['Chipboard', 2.16, 0, 0.0023, 1.359, 100, 200],
  ['Plywood', 2.71, 0, 0.33, 0, 1, 40],
  ['Plywood', 1.94, 0, 0.0067, 0.9982, 110, 330],
  ['Plywood', 2.17, 0, 0.0063, 1.045, 100, 400],
  ['Marble', 7.074, 0, 0.0055, 0.9262, 1, 60],
  ['Marble', 7.94, 0, 0.0001, 1.733, 110, 330],
  ['Marble', 8.62, 0, 0.0027, 1.15, 100, 400],
  ['Floorboard', 3.66, 0, 0.0044, 1.3515, 50, 100],
  ['Floorboard', 5.27, 0, 2.22e-17, 7.3413, 220, 300],
  ['Floorboard', 5.27, 0, 0.0003, 2.0298, 300, 400],
  ['Floorboard', 5.27, 0, 49.8726, 0, 400, 450],
  ['Floorboard', 3.1575, 0, 0.001675, 1.32775, 100, 400],
  ['Vinyl tile', 3.62, 0, 0.0051, 0.8422, 1, 40],
  ['Carpet tile', 2.08, 0, 0.0009, 0.82, 1, 40],
  ['Asphalt concrete', 4.83, 0, 0.0108, 1.3969, 1, 40],
  ['Metal', 1, 0, 1e7, 0, 1, 100],
  ['Very dry ground', 3, 0, 0.00015, 2.52, 1, 10],
  ['Medium dry ground', 15, -0.1, 0.035, 1.63, 1, 10],
  ['Wet ground', 30, -0.4, 0.15, 1.3, 1, 10],
];
const strict = new Set(['Very dry ground', 'Medium dry ground', 'Wet ground']);
const materials = rows.map(([name, a, b, c, d, fLo, fHi], i) => ({
  id: `${name.toLowerCase().replace(/[^a-z]+/g, '-').replace(/-+$/, '')}-${fLo}-${fHi}`, name, a, b, c, d, fLoGHz: fLo, fHiGHz: fHi, row: i + 1, strictRange: strict.has(name),
}));

writeDataset('datasets/spectral/building-materials.json', {
  version: '1.0.0', retrieved: '2026-11-27', model: 'ε′ = a·f^b, σ = c·f^d (f in GHz, σ in S/m); ε″ = 17.98·σ/f (ITU-R P.2040-4 eqs. 57–59)',
  notes: ['Frequency ranges are indicative of the measurements behind each fit, except the three ground types (must not exceed 1–10 GHz).', 'Metal: σ = 10⁷ S/m (the PDF text layer reads “107” because the superscript is lost; checked against the rendered table)'],
  materials,
}, {
  dataset: 'building-materials',
  version: '1.0.0',
  records: materials.length,
  sources: [{ institution: 'Recommendation ITU-R P.2040-4 (09/2025), Table 3', url: 'https://www.itu.int/rec/R-REC-P.2040/en', notes: 'Effects of building materials and structures on radiowave propagation above about 100 MHz' }],
  adapter: 'scripts/ingestion/curated-p2040.ts',
  warnings: ['Hand-transcribed from the PDF text layer and checked against the printed table.'],
});
