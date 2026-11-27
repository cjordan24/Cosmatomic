/**
 * Positions for the universe map (Phase 10, Gate 10.8) → datasets/astronomical/universe-map.json
 *
 *   node --experimental-strip-types scripts/ingestion/universe-map.ts
 *
 * Sources (all through the official VizieR mirror at the Harvard–Smithsonian Center for Astrophysics; the CDS site
 * itself answers scripts with a “Page unavailable” page, so it is not used; the mirror has no robots.txt):
 *  - McConnachie, A. W. (2012) AJ 144, 4 — galaxies in and around the Local Group (VizieR J/AJ/144/4): J2000 position,
 *    Galactic l and b, heliocentric distance D (kpc) with its errors, morphological type, subgroup.
 *  - SIMBAD positions (Wenger et al. 2000) resolved by name through Sesame on the same mirror, one request per second:
 *    the SPARC galaxies (using the SIMBAD names that VizieR attaches to Lelli et al. 2016, J/AJ/152/157), the bundled
 *    nebulae, three compact objects with distances, and NGC 4258. Each position keeps SIMBAD's reference (refPos).
 * Distances are NOT taken from SIMBAD: the map uses the distances already bundled (SPARC, nebulae, compact objects,
 * distance ladder) or McConnachie's.
 */
import { fetchText, writeDataset } from './lib/ingest.ts';

const MIRROR = 'https://vizier.cfa.harvard.edu/viz-bin';
const OPTS = { minIntervalMs: 1000 };

function parseTsv(txt: string): Record<string, string>[] {
  const lines = txt.split('\n').filter((l) => l && !l.startsWith('#'));
  const head = lines[0].split('\t').map((s) => s.trim());
  return lines.slice(3).map((l) => { const c = l.split('\t'); return Object.fromEntries(head.map((h, i) => [h, (c[i] ?? '').trim()])); }).filter((r) => Object.values(r).some(Boolean));
}
const sexRa = (s: string) => { const [h, m, x] = s.split(/\s+/).map(Number); return 15 * (h + m / 60 + x / 3600); };
const sexDec = (s: string) => { const neg = s.trim().startsWith('-'); const [d, m, x] = s.replace('-', '').replace('+', '').split(/\s+/).map(Number); return (neg ? -1 : 1) * (d + m / 60 + x / 3600); };
const num = (s: string | undefined) => (s === undefined || s === '' ? null : Number(s));

// ---------------------------------------------------------------- McConnachie (2012)
const lgUrl = `${MIRROR}/asu-tsv?-source=J/AJ/144/4/catalog&-out.max=unlimited&-out=SubG,n_Name,Name,OName,MType,RAJ2000,DEJ2000,GLON,GLAT,D,E_D,e_D,u_D`;
const lg = parseTsv(await fetchText(lgUrl, { ...OPTS, cacheKey: 'vizier/mcconnachie2012-catalog.tsv' })).map((r) => ({
  name: r.Name, otherName: r.OName || null, type: r.MType || null, subgroup: r.SubG || null, association: r.n_Name || null,
  ra: r.RAJ2000 ? sexRa(r.RAJ2000) : null, dec: r.DEJ2000 ? sexDec(r.DEJ2000) : null, l: num(r.GLON), b: num(r.GLAT),
  distanceKpc: num(r.D), errPlus: num(r.E_D), errMinus: num(r.e_D), distanceFlag: r.u_D || null,
})).filter((g) => g.name);
console.log(`  McConnachie 2012: ${lg.length} galaxies, ${lg.filter((g) => g.distanceKpc !== null).length} with distances`);

// ---------------------------------------------------------------- Sesame (SIMBAD) positions
async function sesame(name: string) {
  const xml = await fetchText(`${MIRROR}/nph-sesame/-oxp/S?${encodeURIComponent(name)}`, { ...OPTS, cacheKey: `sesame/${name.replace(/[^A-Za-z0-9+.-]/g, '_')}.xml` });
  const ra = xml.match(/<jradeg>([-\d.]+)<\/jradeg>/)?.[1], dec = xml.match(/<jdedeg>([-\d.]+)<\/jdedeg>/)?.[1];
  if (!ra || !dec) return null;
  return { ra: Number(ra), dec: Number(dec), refPos: xml.match(/<refPos>([^<]+)<\/refPos>/)?.[1]?.replace(/&amp;/g, '&') ?? null, otype: xml.match(/<otype>([^<]+)<\/otype>/)?.[1] ?? null, simbadName: xml.match(/<oname>([^<]+)<\/oname>/)?.[1]?.replace(/\s+/g, ' ').trim() ?? name };
}

const sparcUrl = `${MIRROR}/asu-tsv?-source=J/AJ/152/157/table1&-out.max=unlimited&-out=Name,SimbadName`;
const sparcNames = parseTsv(await fetchText(sparcUrl, { ...OPTS, cacheKey: 'vizier/sparc-simbadnames.tsv' }));
const sparc: Record<string, unknown> = {};
let miss = 0;
for (const r of sparcNames) {
  const q = r.SimbadName || r.Name;
  const p = (await sesame(q)) ?? (q !== r.Name ? await sesame(r.Name) : null);
  if (!p) { miss++; console.warn(`  SPARC ${r.Name}: not resolved`); continue; }
  sparc[r.Name] = { query: q, ...p };
}
console.log(`  SPARC: ${Object.keys(sparc).length}/${sparcNames.length} resolved`);

const NAMED: Record<string, string> = { orion: 'M42', ring: 'M57', crab: 'M1', eagle: 'M16', 'carina-ngc3324': 'NGC 3324', 'sgr-a-star': 'Sgr A*', 'm87-star': 'M87', 'cyg-x1': 'Cyg X-1', ngc4258: 'NGC 4258' };
const named: Record<string, unknown> = {};
for (const [id, q] of Object.entries(NAMED)) { const p = await sesame(q); if (!p) throw new Error(`${id}: ${q} not resolved`); named[id] = { query: q, ...p }; console.log(`  ${id.padEnd(15)} ${q.padEnd(10)} ${p.ra.toFixed(4)} ${p.dec.toFixed(4)} (${p.refPos})`); }

writeDataset('datasets/astronomical/universe-map.json', { version: '1.0.0', frame: 'ICRS J2000 (degrees); McConnachie also gives Galactic l, b', localGroup: lg, sparc, named }, {
  dataset: 'universe-map', version: '1.0.0', records: lg.length + Object.keys(sparc).length + Object.keys(named).length,
  sources: [
    { institution: 'McConnachie (2012) AJ 144, 4, via VizieR J/AJ/144/4 (CfA mirror)', url: 'https://vizier.cfa.harvard.edu/viz-bin/VizieR?-source=J/AJ/144/4', notes: 'positions, Galactic coordinates and heliocentric distances of galaxies in and around the Local Group' },
    { institution: 'SIMBAD (Wenger et al. 2000) via the Sesame name resolver on the VizieR CfA mirror', url: 'https://vizier.cfa.harvard.edu/viz-bin/nph-sesame', notes: 'J2000 positions with SIMBAD’s reference for each; SPARC SIMBAD names from VizieR J/AJ/152/157' },
  ],
  adapter: 'scripts/ingestion/universe-map.ts',
  warnings: [...(miss ? [`${miss} SPARC galaxies not resolved by Sesame`] : []), 'Distances are not taken from SIMBAD; each map object uses a distance already bundled with its own source.'],
});
