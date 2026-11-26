/**
 * Phase 6, Gate 6.5 — licensed image gallery → public/images/gallery/*.jpg + datasets/astronomical/gallery.json
 *
 *   node --experimental-strip-types scripts/ingestion/gallery-images.ts
 *
 * Only images whose publisher states a licence that allows reuse with credit:
 *  - ESA/Hubble (esahubble.org/copyright): "released under the Creative Commons Attribution 4.0
 *    International license … provided they are clearly and visibly credited".
 *  - ESA/Webb (esawebb.org/copyright): the same CC BY 4.0 terms.
 *  - ESO (eso.org/public/copyright): images and captions CC BY 4.0 unless noted (EHT images are published there).
 * None of the three sites restricts these paths in robots.txt (esahubble.org and esawebb.org have none).
 * The 700-px-wide "thumb700x" renditions are downloaded, 3 s apart, cached in datasets/.cache/gallery.
 * Credit lines are copied verbatim from each image page and must be shown visibly next to the image.
 */
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, writeDataset } from './lib/ingest.ts';

interface Img { id: string; title: string; object: string; credit: string; publisher: 'ESA/Hubble' | 'ESA/Webb' | 'ESO'; telescope: string; page: string; file: string; colours: string | null }

const H = (id: string) => ({ page: `https://esahubble.org/images/${id}/`, file: `https://cdn.esahubble.org/archives/images/thumb700x/${id}.jpg` });
const W = (id: string) => ({ page: `https://esawebb.org/images/${id}/`, file: `https://cdn.esawebb.org/archives/images/thumb700x/${id}.jpg` });
const O = (id: string) => ({ page: `https://www.eso.org/public/images/${id}/`, file: `https://cdn.eso.org/images/thumb700x/${id}.jpg` });

const IMAGES: Img[] = [
  { id: 'heic0601a', title: 'Hubble’s sharpest view of the Orion Nebula', object: 'orion', credit: 'NASA, ESA, M. Robberto (Space Telescope Science Institute/ESA) and the Hubble Space Telescope Orion Treasury Project Team', publisher: 'ESA/Hubble', telescope: 'Hubble Space Telescope', ...H('heic0601a'), colours: null },
  { id: 'heic0515a', title: 'Most detailed image of the Crab Nebula', object: 'crab', credit: 'NASA, ESA and Allison Loll/Jeff Hester (Arizona State University). Acknowledgement: Davide De Martin (ESA/Hubble)', publisher: 'ESA/Hubble', telescope: 'Hubble Space Telescope', ...H('heic0515a'), colours: null },
  { id: 'heic1310a', title: 'Hubble image of the Ring Nebula (Messier 57)', object: 'ring', credit: 'NASA, ESA, and C. Robert O’Dell (Vanderbilt University)', publisher: 'ESA/Hubble', telescope: 'Hubble Space Telescope', ...H('heic1310a'), colours: null },
  { id: 'heic1501a', title: 'New view of the Pillars of Creation — visible', object: 'eagle', credit: 'NASA, ESA/Hubble and the Hubble Heritage Team', publisher: 'ESA/Hubble', telescope: 'Hubble Space Telescope', ...H('heic1501a'), colours: null },
  { id: 'weic2205a', title: 'NIRCam Image of the “Cosmic Cliffs” in Carina', object: 'carina-ngc3324', credit: 'NASA, ESA, CSA, and STScI', publisher: 'ESA/Webb', telescope: 'James Webb Space Telescope (NIRCam)', ...W('weic2205a'), colours: 'Infrared filters shown in visible colours; the publisher’s caption lists yellow as molecular hydrogen.' },
  { id: 'eso1907a', title: 'First Image of a Black Hole', object: 'm87-star', credit: 'EHT Collaboration', publisher: 'ESO', telescope: 'Event Horizon Telescope (1.3 mm VLBI)', ...O('eso1907a'), colours: 'Radio brightness at 1.3 mm shown in false colour.' },
  { id: 'eso2208-eht-mwa', title: 'First image of our black hole', object: 'sgr-a-star', credit: 'EHT Collaboration', publisher: 'ESO', telescope: 'Event Horizon Telescope (1.3 mm VLBI)', ...O('eso2208-eht-mwa'), colours: 'Radio brightness at 1.3 mm shown in false colour.' },
];

const LICENCE: Record<Img['publisher'], { name: string; url: string; terms: string }> = {
  'ESA/Hubble': { name: 'CC BY 4.0', url: 'https://esahubble.org/copyright/', terms: 'Creative Commons Attribution 4.0 International; must be clearly and visibly credited' },
  'ESA/Webb': { name: 'CC BY 4.0', url: 'https://esawebb.org/copyright/', terms: 'Creative Commons Attribution 4.0 International; must be clearly and visibly credited' },
  ESO: { name: 'CC BY 4.0', url: 'https://www.eso.org/public/copyright/', terms: 'Creative Commons Attribution 4.0 International (ESO usage policy), credit required' },
};

const CACHE = join(ROOT, 'datasets/.cache/gallery');
const OUT = join(ROOT, 'public/images/gallery');
mkdirSync(CACHE, { recursive: true }); mkdirSync(OUT, { recursive: true });
let last = 0;
async function getBinary(url: string, cacheName: string): Promise<Buffer> {
  const c = join(CACHE, cacheName);
  if (existsSync(c)) return readFileSync(c);
  const wait = last + 3000 - Date.now();
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  last = Date.now();
  const res = await fetch(url, { headers: { 'User-Agent': 'VoyagerVentures-DataIngestion/0.1 (open scientific education project)' } });
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
  if (!(res.headers.get('content-type') ?? '').startsWith('image/jpeg')) throw new Error(`${url}: not a JPEG (${res.headers.get('content-type')})`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length > 1.5 * 1024 * 1024) throw new Error(`${url}: ${buf.length} bytes exceeds the 1.5 MB budget`);
  writeFileSync(c, buf);
  return buf;
}

const records = [];
for (const im of IMAGES) {
  const buf = await getBinary(im.file, `${im.id}.jpg`);
  writeFileSync(join(OUT, `${im.id}.jpg`), buf);
  records.push({ ...im, path: `/images/gallery/${im.id}.jpg`, bytes: buf.length, sha256: createHash('sha256').update(buf).digest('hex'), licence: LICENCE[im.publisher] });
  console.log(`  ${im.id}.jpg ${(buf.length / 1024).toFixed(0)} KiB`);
}

writeDataset('datasets/astronomical/gallery.json', { version: '1.0.0', note: 'Processed colour images; colours are assigned by the publisher and are not what the eye would see.', images: records }, {
  dataset: 'gallery-images',
  version: '1.0.0',
  records: records.length,
  sources: [
    { institution: 'ESA/Hubble', url: 'https://esahubble.org/copyright/', license: 'CC BY 4.0', notes: 'Orion Nebula, Crab Nebula, Ring Nebula, Pillars of Creation' },
    { institution: 'ESA/Webb', url: 'https://esawebb.org/copyright/', license: 'CC BY 4.0', notes: 'Cosmic Cliffs in Carina (NGC 3324)' },
    { institution: 'ESO / EHT Collaboration', url: 'https://www.eso.org/public/copyright/', license: 'CC BY 4.0', notes: 'M87* and Sgr A* images' },
  ],
  adapter: 'scripts/ingestion/gallery-images.ts',
  warnings: ['Images are stored under public/images/gallery with their SHA-256 in this dataset; credit lines are verbatim from the image pages and are displayed with every image.'],
});
