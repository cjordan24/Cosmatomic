/**
 * Uniaxial crystals: ordinary and extraordinary refractive-index dispersion (Phase 10, Gate 10.3)
 * → datasets/materials/birefringence.json
 *
 *   node --experimental-strip-types scripts/ingestion/birefringence.ts
 *
 * Source: the refractiveindex.info database (Polyanskiy, CC0 1.0), files on GitHub, each traced to its primary
 * measurement: Ghosh (1999) for calcite and α-quartz, Malitson & Dodge (1972) / Dodge (1986) for sapphire,
 * DeVore (1951) for rutile. The formula types are those of the database (evaluated by refractiveIndex() in
 * src/modes/atomic/materials/materials.ts).
 */
import { fetchText, writeDataset } from './lib/ingest.ts';

const CRYSTALS: { id: string; name: string; o: string; e: string; sources: string[]; sign: string }[] = [
  { id: 'calcite', name: 'calcite (Iceland spar, CaCO₃)', o: 'CaCO3/nk/Ghosh-o.yml', e: 'CaCO3/nk/Ghosh-e.yml', sources: ['ghosh-1999'], sign: 'negative' },
  { id: 'alpha-quartz', name: 'crystalline quartz (α-SiO₂)', o: 'SiO2/nk/Ghosh-o.yml', e: 'SiO2/nk/Ghosh-e.yml', sources: ['ghosh-1999'], sign: 'positive' },
  { id: 'sapphire', name: 'sapphire (α-Al₂O₃)', o: 'Al2O3/nk/Malitson-o.yml', e: 'Al2O3/nk/Malitson-e.yml', sources: ['malitson-dodge-1972'], sign: 'negative' },
  { id: 'rutile', name: 'rutile (TiO₂)', o: 'TiO2/nk/Devore-o.yml', e: 'TiO2/nk/Devore-e.yml', sources: ['devore-1951'], sign: 'positive' },
];

function parse(y: string, path: string) {
  const type = y.match(/- type: (formula \d)/)?.[1] ?? null;
  const range = y.match(/wavelength_range: ([\d.]+) ([\d.]+)/);
  const coefficients = y.match(/coefficients: ([^\n]+)/)?.[1].trim().split(/\s+/).map(Number) ?? null;
  const direction = y.match(/direction: ([oe])/)?.[1] ?? null;
  const references = (y.match(/REFERENCES: \|\n([\s\S]*?)\n[A-Z]+:/)?.[1] ?? '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  const comments = (y.match(/COMMENTS: \|?\n?\s*([^\n]+)/)?.[1] ?? '').trim();
  if (!type || !range || !coefficients) throw new Error(`no formula in ${path}`);
  return {
    label: comments, type, coefficients, rangeUm: [Number(range[1]), Number(range[2])] as [number, number], table: null, temperatureK: null,
    references, doi: null, comments, direction, file: path,
    url: `https://refractiveindex.info/?shelf=main&book=${path.split('/')[0]}&page=${path.split('/').pop()!.replace('.yml', '')}`, license: 'CC0 1.0 (refractiveindex.info)',
  };
}

const out = [];
for (const c of CRYSTALS) {
  const get = async (p: string) => parse(await fetchText(`https://raw.githubusercontent.com/polyanskiy/refractiveindex.info-database/master/database/data/main/${p}`, { minIntervalMs: 500, cacheKey: `refractiveindex/${p.replace(/\//g, '_')}` }), p);
  const o = await get(c.o), e = await get(c.e);
  if (o.direction !== 'o' || e.direction !== 'e') throw new Error(`${c.id}: direction tags ${o.direction}/${e.direction}`);
  out.push({ id: c.id, name: c.name, opticSign: c.sign, ordinary: { ...o, sources: ['refractiveindex-info', ...c.sources] }, extraordinary: { ...e, sources: ['refractiveindex-info', ...c.sources] } });
  console.log(`  ${c.id.padEnd(13)} o ${o.type} ${o.rangeUm.join('–')} µm · e ${e.type} ${e.rangeUm.join('–')} µm`);
}

writeDataset('datasets/materials/birefringence.json', { version: '1.0.0', crystals: out }, {
  dataset: 'birefringence', version: '1.0.0', records: out.length,
  sources: [
    { institution: 'refractiveindex.info database (Polyanskiy), primary papers cited per file', url: 'https://github.com/polyanskiy/refractiveindex.info-database', license: 'CC0 1.0', notes: 'ordinary and extraordinary dispersion formulas of four uniaxial crystals' },
    { institution: 'Ghosh (1999) Optics Communications 163, 95 — calcite and quartz', url: 'https://doi.org/10.1016/S0030-4018(99)00091-7' },
    { institution: 'Malitson & Dodge (1972); Dodge (1986) — sapphire', url: 'https://refractiveindex.info/?shelf=main&book=Al2O3&page=Malitson-e' },
    { institution: 'DeVore (1951) J. Opt. Soc. Am. 41, 416 — rutile', url: 'https://doi.org/10.1364/JOSA.41.000416' },
  ],
  adapter: 'scripts/ingestion/birefringence.ts',
  warnings: ['The optic sign (positive: n_e > n_o) is checked against the formulas by tests/science/polarisation.test.ts; Drude (1902) p. 324 states “Quartz is positively, calc-spar negatively, uniaxial.”'],
});
