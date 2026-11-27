/**
 * Planetary radiation data (Phase 10, Gate 10.5) → datasets/astronomical/planet-radiation.json
 *
 *   node --experimental-strip-types scripts/ingestion/planet-radiation.ts
 *
 * Source: NASA NSSDCA planetary fact sheets (D. R. Williams, NASA Goddard), one page per body
 * (https://nssdc.gsfc.nasa.gov/planetary/factsheet/<body>fact.html; robots.txt allows /planetary). For each body the
 * first value after the label is the body's own (the pages also list Earth and the ratio). Fields: Bond albedo, solar
 * irradiance (W/m²) and black-body temperature (K) as printed.
 */
import { fetchText, writeDataset } from './lib/ingest.ts';

const BODIES = ['mercury', 'venus', 'earth', 'moon', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];
const field = (txt: string, label: RegExp): number | null => {
  // Earth's page is preformatted text, the others are tables (label in <th>, the body's value in the first <td>):
  // strip the tags and take the first number after the label.
  const flat = txt.replace(/<[^>]+>/g, '');
  const m = label.exec(flat);
  if (!m) return null;
  const n = flat.slice(m.index + m[0].length).match(/-?\d+(\.\d+)?/);
  return n ? Number(n[0]) : null;
};

const out = [];
for (const b of BODIES) {
  const url = `https://nssdc.gsfc.nasa.gov/planetary/factsheet/${b}fact.html`;
  const txt = await fetchText(url, { minIntervalMs: 2000, cacheKey: `nssdc-factsheet/${b}.html` });
  const rec = {
    id: b,
    bondAlbedo: field(txt, /Bond albedo/i),
    solarIrradianceWm2: field(txt, /Solar irradiance \(W\/m2\)/i),
    blackBodyTemperatureK: field(txt, /Black-body temperature \(K\)/i),
    updated: txt.match(/Last Updated:\s*([^<\n]+)/i)?.[1].trim() ?? null,
    url,
  };
  if (rec.bondAlbedo === null || rec.solarIrradianceWm2 === null || rec.blackBodyTemperatureK === null) console.warn(`  ${b}: missing field`, rec);
  out.push(rec);
  console.log(`  ${b.padEnd(8)} A = ${rec.bondAlbedo}  S = ${rec.solarIrradianceWm2} W/m²  T_bb = ${rec.blackBodyTemperatureK} K  (${rec.updated})`);
}

writeDataset('datasets/astronomical/planet-radiation.json', { version: '1.0.0', units: { solarIrradiance: 'W/m²', blackBodyTemperature: 'K' }, bodies: out }, {
  dataset: 'planet-radiation', version: '1.0.0', records: out.length,
  sources: [{ institution: 'NASA Space Science Data Coordinated Archive (NSSDCA), planetary fact sheets (D. R. Williams, NASA GSFC)', url: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/', notes: 'Bond albedo, solar irradiance and black-body temperature per body, as printed' }],
  adapter: 'scripts/ingestion/planet-radiation.ts',
  warnings: out.filter((r) => r.bondAlbedo === null || r.solarIrradianceWm2 === null || r.blackBodyTemperatureK === null).map((r) => `${r.id}: a field is missing on the fact sheet`),
});
