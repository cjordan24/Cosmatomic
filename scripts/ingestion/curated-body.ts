/**
 * Human body (Phase 12, Gate 12.1) → datasets/biology/body.json
 *
 *   node --experimental-strip-types scripts/ingestion/curated-body.ts <BodyParts3D partof OBJ directory>
 *
 *  - The organ meshes (public/models/body-organs.glb) are built by scripts/blender/build_body.py from BodyParts3D 4.0
 *    (DBCLS; CC BY 4.0 since 2025-02-27) with the part lists in scripts/ingestion/data/bp3d-organs.json:
 *    each organ is an FMA concept's element files from partof_element_parts.txt, except the skeleton, which is every
 *    file whose English name is a bone (202 files; the FMA “skeletal system” part list holds eye parts and no leg bones).
 *    The lungs' part lists hold the bronchial trees and segmental vessels only (no lung-tissue surface in this set).
 *  - Sizes and volumes come from the full-resolution OBJ headers (“Bounds(mm)”, “Volume(cm3)”), not the decimated mesh.
 *  - Facts are quoted verbatim (checked against the saved pages): NCI SEER Training Modules (“all text … is free of
 *    copyright”), NHLBI (public domain), NIDDK (“copyright free”).
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, writeDataset } from './lib/ingest.ts';

const objDir = process.argv[2];
if (!objDir) throw new Error('usage: curated-body.ts <obj dir>');
const organs: Record<string, string[]> = JSON.parse(readFileSync(join(ROOT, 'scripts/ingestion/data/bp3d-organs.json'), 'utf8'));
const build: Record<string, { trianglesFull: number; trianglesDecimated: number; parts: number }> = JSON.parse(readFileSync(join(ROOT, 'scripts/ingestion/data/bp3d-build-meta.json'), 'utf8'));
const have = new Set(readdirSync(objDir));

function header(file: string) {
  const text = readFileSync(join(objDir, `${file}.obj`), 'utf8').split('\n').filter((l) => l.startsWith('#')).join('\n');
  const b = text.match(/# Bounds\(mm\): \(([-\d.]+),([-\d.]+),([-\d.]+)\)-\(([-\d.]+),([-\d.]+),([-\d.]+)\)/)!.slice(1).map(Number);
  const v = Number(text.match(/# Volume\(cm3\): ([\d.]+)/)?.[1] ?? 0);
  const name = text.match(/# English name : (.*)/)?.[1].trim() ?? file;
  return { b, v, name };
}

const SEER = 'seer-training', NHLBI = 'nhlbi', NIDDK = 'niddk';
const Q = (text: string, source: string, url: string) => ({ text, source, url });
const S = (p: string) => `https://training.seer.cancer.gov${p}`;
const FACTS: Record<string, { label: string; system: string; note?: string; facts: ReturnType<typeof Q>[] }> = {
  skeleton: { label: 'Skeleton', system: 'Skeletal', note: 'All 202 bone files of BodyParts3D 4.0 (the set lacks a few small bones).', facts: [
    Q('The adult human skeleton usually consists of 206 named bones. These bones can be grouped in two divisions: axial skeleton and appendicular skeleton.', SEER, S('/anatomy/skeletal/divisions/')),
    Q('Axial Skeleton (80 bones) · Appendicular Skeleton (126 bones)', SEER, S('/anatomy/skeletal/divisions/')),
  ] },
  heart: { label: 'Heart', system: 'Cardiovascular', facts: [
    Q('It has four hollow chambers surrounded by muscle and other heart tissue.', NHLBI, 'https://www.nhlbi.nih.gov/health/heart/anatomy'),
    Q('The normal adult heart pumps about 5 liters of blood every minute throughout life.', SEER, S('/anatomy/cardiovascular/heart/')),
    Q('At rest, a heart rate of 60 to 100 beats per minute is normal.', NHLBI, 'https://www.nhlbi.nih.gov/health/heart/heart-beats'),
  ] },
  'right-lung': { label: 'Right lung (airways and vessels)', system: 'Respiratory', note: 'This BodyParts3D set models the lungs’ bronchial trees and segmental arteries and veins, not the lung tissue itself.', facts: [
    Q('Your lungs have about 150 million alveoli.', NHLBI, 'https://www.nhlbi.nih.gov/health/lungs/respiratory-system'),
    Q('Under normal conditions, the average adult takes 12 to 15 breaths a minute.', SEER, S('/anatomy/respiratory/capacity.html')),
  ] },
  'left-lung': { label: 'Left lung (airways and vessels)', system: 'Respiratory', note: 'Bronchial tree and segmental vessels only, as for the right lung.', facts: [
    Q('Your lungs have about 150 million alveoli.', NHLBI, 'https://www.nhlbi.nih.gov/health/lungs/respiratory-system'),
  ] },
  brain: { label: 'Brain', system: 'Nervous', facts: [] },
  liver: { label: 'Liver', system: 'Digestive', facts: [Q('It is the largest gland in the body.', SEER, S('/anatomy/digestive/regions/accessory.html'))] },
  stomach: { label: 'Stomach', system: 'Digestive', facts: [Q('The long continuous tube that is the digestive tract is about 9 meters in length.', SEER, S('/anatomy/digestive/structure.html'))] },
  'small-intestine': { label: 'Small intestine', system: 'Digestive', facts: [Q('The long continuous tube that is the digestive tract is about 9 meters in length.', SEER, S('/anatomy/digestive/structure.html'))] },
  'large-intestine': { label: 'Large intestine', system: 'Digestive', facts: [Q('The long continuous tube that is the digestive tract is about 9 meters in length.', SEER, S('/anatomy/digestive/structure.html'))] },
  'right-kidney': { label: 'Right kidney', system: 'Urinary', facts: [
    Q('In the adult, each kidney is approximately 3 cm thick, 6 cm wide, and 12 cm long.', SEER, S('/anatomy/urinary/components/kidney.html')),
    Q('Each of your kidneys is made up of about a million filtering units called nephrons.', NIDDK, 'https://www.niddk.nih.gov/health-information/kidney-disease/kidneys-how-they-work'),
    Q('In a single day, your kidneys filter about 150 quarts of blood.', NIDDK, 'https://www.niddk.nih.gov/health-information/kidney-disease/kidneys-how-they-work'),
  ] },
  'left-kidney': { label: 'Left kidney', system: 'Urinary', facts: [
    Q('In the adult, each kidney is approximately 3 cm thick, 6 cm wide, and 12 cm long.', SEER, S('/anatomy/urinary/components/kidney.html')),
    Q('Only 1 to 2 quarts become urine.', NIDDK, 'https://www.niddk.nih.gov/health-information/kidney-disease/kidneys-how-they-work'),
  ] },
};

const out = Object.entries(organs).map(([id, files]) => {
  const hs = files.filter((f) => have.has(`${f}.obj`)).map(header);
  const lo = [0, 1, 2].map((i) => Math.min(...hs.map((h) => h.b[i]))), hi = [0, 1, 2].map((i) => Math.max(...hs.map((h) => h.b[3 + i])));
  const f = FACTS[id];
  return {
    id, label: f.label, system: f.system, note: f.note ?? null, facts: f.facts,
    model: { files: hs.length, volumeCm3: Math.round(hs.reduce((a, h) => a + h.v, 0) * 10) / 10, boundsMm: { min: lo, max: hi }, extentMm: [0, 1, 2].map((i) => Math.round((hi[i] - lo[i]) * 10) / 10),
      trianglesFull: build[id].trianglesFull, trianglesDecimated: build[id].trianglesDecimated },
  };
});

const systems = { quote: 'Ten major systems compose the human body:', list: ['Skeletal', 'Muscular', 'Nervous', 'Endocrine', 'Cardiovascular', 'Lymphatic', 'Respiratory', 'Digestive', 'Urinary', 'Reproductive'], source: SEER, url: S('/anatomy/body/') };

writeDataset('datasets/biology/body.json', { version: '1.0.0', systems, organs: out, model: { file: 'public/models/body-organs.glb', units: 'm', axes: 'glTF +Y up (BodyParts3D +Z up, mm)', version: 'BodyParts3D 4.0 partof (BP3D_4.0_obj_99)' } }, {
  dataset: 'body',
  version: '1.0.0',
  records: out.length + 1,
  sources: [
    { institution: 'BodyParts3D 4.0, Database Center for Life Science (DBCLS), Japan', url: 'https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html', license: 'CC BY 4.0 — “BodyParts3D, © The Database Center for Life Science licensed under CC Attribution 4.0 International”', notes: 'organ meshes (decimated) and their full-resolution bounds and volumes' },
    { institution: 'NCI SEER Training Modules', url: 'https://training.seer.cancer.gov/', license: 'NCI: “all text within National Cancer Institute (NCI) products is free of copyright and may be reused without our permission”', notes: 'organ systems, bones, heart, kidney, digestive tract, breathing' },
    { institution: 'National Heart, Lung, and Blood Institute', url: 'https://www.nhlbi.nih.gov/health/heart', license: 'NHLBI: information on the website is in the public domain unless noted otherwise', notes: 'heart chambers, heart rate, alveoli' },
    { institution: 'National Institute of Diabetes and Digestive and Kidney Diseases', url: 'https://www.niddk.nih.gov/health-information/kidney-disease/kidneys-how-they-work', license: 'NIDDK: “The majority of information on this site is copyright free”', notes: 'nephrons, filtration, urine' },
  ],
  adapter: 'scripts/ingestion/curated-body.ts',
  warnings: ['Lungs: airways and vessels only.', 'Skeleton chosen by bone names (202 files).', 'Volumes are sums of the model’s part volumes as stated in the OBJ headers.'],
});
