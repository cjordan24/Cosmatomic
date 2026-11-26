/**
 * Crystals and materials (Phase 4, Gate 4.3)
 *   → datasets/materials/crystals.json   (unit cells: transcribed, flagged)
 *   → datasets/materials/materials.json  (condition-tagged property records + models)
 *
 *   node --experimental-strip-types scripts/ingestion/materials.ts
 *
 * Sources
 *  - Lattice constants and NBS X-ray densities: transcribed from NBS Circular 539 (Swanson et al.,
 *    1953–1955; scanned PDFs at nvlpubs.nist.gov, read from their OCR text layer), and the CODATA 2018
 *    silicon lattice parameter (fetched from physics.nist.gov). Atomic positions are the standard
 *    Wyckoff positions of each structure type (International Tables for Crystallography, Vol. A);
 *    the rutile O parameter is from Abrahams & Bernstein (1971).
 *  - Heat capacity and entropy vs T: NIST-JANAF Thermochemical Tables (Chase 1998), text tables.
 *  - Refractive index dispersion formulas: refractiveindex.info database (CC0), each traced to the
 *    primary paper quoted in its file.
 *  - Fluids at 1 atm (density, Cp, speed of sound, viscosity, thermal conductivity): NIST WebBook
 *    "Thermophysical Properties of Fluid Systems" (reference equations of state, e.g. IAPWS-95).
 *  - Reference standards: IACS copper resistivity (IEC 60028); water permittivity equation of
 *    Malmberg & Maryott (1956), verified in the NBS paper's text.
 * Crystallography-database scraping was avoided (COD robots.txt disallows; AMCSD blocks automated access).
 */
import { fetchText, writeDataset } from './lib/ingest.ts';

// ---------------------------------------------------------------- crystals
interface Site { el: string; xyz: [number, number, number] }
interface Crystal {
  id: string; name: string; formula: string; structureType: string;
  system: 'cubic' | 'hexagonal' | 'tetragonal' | 'trigonal';
  spaceGroup: string; spaceGroupNumber: number;
  a: number; c?: number; temperatureC: number;
  /** full basis of the conventional cell (fractional), generated from Wyckoff positions */
  sites: Site[];
  xrayDensityNBS: number | null; // g/cm³ as stated by NBS (computed from their lattice constant)
  latticeSource: string; positionsSource: string;
  sources: string[]; transcribed: true; materialId: string;
}

const FCC: [number, number, number][] = [[0, 0, 0], [0, 0.5, 0.5], [0.5, 0, 0.5], [0.5, 0.5, 0]];
const add = (p: number[], q: number[]) => p.map((x, i) => (((x + q[i]) % 1) + 1) % 1) as [number, number, number];
const fccOf = (el: string, base: [number, number, number]) => FCC.map((t) => ({ el, xyz: add(base, t) }));

const NBS1 = 'Swanson, H. E. & Tatge, E. (1953) NBS Circular 539, Vol. I';
const NBS2 = 'Swanson, H. E. & Fuyat, R. K. (1953) NBS Circular 539, Vol. II';
const NBS4 = 'Swanson, H. E., Fuyat, R. K. & Ugrinic, G. M. (1955) NBS Circular 539, Vol. IV';
const ITA = 'Standard Wyckoff positions of the structure type (International Tables for Crystallography, Vol. A)';

const uRutile = 0.30479; // O x-parameter, Abrahams & Bernstein (1971) J. Chem. Phys. 55, 3206
const CRYSTALS: Crystal[] = [
  { id: 'nacl', name: 'Sodium chloride (halite)', formula: 'NaCl', structureType: 'rock salt (B1)', system: 'cubic', spaceGroup: 'Fm-3m', spaceGroupNumber: 225, a: 5.6402, temperatureC: 26,
    sites: [...fccOf('Na', [0, 0, 0]), ...fccOf('Cl', [0.5, 0.5, 0.5])], xrayDensityNBS: 2.164, latticeSource: NBS2, positionsSource: ITA, sources: ['nbs-circular-539', 'itc-vol-a'], transcribed: true, materialId: 'nacl' },
  { id: 'cscl', name: 'Caesium chloride', formula: 'CsCl', structureType: 'CsCl (B2)', system: 'cubic', spaceGroup: 'Pm-3m', spaceGroupNumber: 221, a: 4.123, temperatureC: 25,
    sites: [{ el: 'Cs', xyz: [0, 0, 0] }, { el: 'Cl', xyz: [0.5, 0.5, 0.5] }], xrayDensityNBS: 3.988, latticeSource: NBS2, positionsSource: ITA, sources: ['nbs-circular-539', 'itc-vol-a'], transcribed: true, materialId: 'cscl' },
  { id: 'diamond', name: 'Diamond', formula: 'C', structureType: 'diamond (A4)', system: 'cubic', spaceGroup: 'Fd-3m', spaceGroupNumber: 227, a: 3.5667, temperatureC: 26,
    sites: [...fccOf('C', [0, 0, 0]), ...fccOf('C', [0.25, 0.25, 0.25])], xrayDensityNBS: 3.515, latticeSource: NBS2, positionsSource: ITA, sources: ['nbs-circular-539', 'itc-vol-a'], transcribed: true, materialId: 'diamond' },
  { id: 'silicon', name: 'Silicon', formula: 'Si', structureType: 'diamond (A4)', system: 'cubic', spaceGroup: 'Fd-3m', spaceGroupNumber: 227, a: 5.431020511, temperatureC: 22.5,
    sites: [...fccOf('Si', [0, 0, 0]), ...fccOf('Si', [0.25, 0.25, 0.25])], xrayDensityNBS: null, latticeSource: 'CODATA 2018 lattice parameter of silicon, a = 5.431 020 511(89) × 10⁻¹⁰ m at 22.5 °C in vacuum (NIST)', positionsSource: ITA, sources: ['codata-2018', 'itc-vol-a'], transcribed: true, materialId: 'silicon' },
  { id: 'copper', name: 'Copper', formula: 'Cu', structureType: 'face-centred cubic (A1)', system: 'cubic', spaceGroup: 'Fm-3m', spaceGroupNumber: 225, a: 3.6150, temperatureC: 25,
    sites: fccOf('Cu', [0, 0, 0]), xrayDensityNBS: 8.932, latticeSource: NBS1, positionsSource: ITA, sources: ['nbs-circular-539', 'itc-vol-a'], transcribed: true, materialId: 'copper' },
  { id: 'aluminium', name: 'Aluminium', formula: 'Al', structureType: 'face-centred cubic (A1)', system: 'cubic', spaceGroup: 'Fm-3m', spaceGroupNumber: 225, a: 4.0495, temperatureC: 25,
    sites: fccOf('Al', [0, 0, 0]), xrayDensityNBS: 2.697, latticeSource: NBS1, positionsSource: ITA, sources: ['nbs-circular-539', 'itc-vol-a'], transcribed: true, materialId: 'aluminium' },
  { id: 'alpha-iron', name: 'α-Iron (ferrite)', formula: 'Fe', structureType: 'body-centred cubic (A2)', system: 'cubic', spaceGroup: 'Im-3m', spaceGroupNumber: 229, a: 2.8664, temperatureC: 25,
    sites: [{ el: 'Fe', xyz: [0, 0, 0] }, { el: 'Fe', xyz: [0.5, 0.5, 0.5] }], xrayDensityNBS: null, latticeSource: NBS4, positionsSource: ITA, sources: ['nbs-circular-539', 'itc-vol-a'], transcribed: true, materialId: 'iron' },
  { id: 'tungsten', name: 'Tungsten', formula: 'W', structureType: 'body-centred cubic (A2)', system: 'cubic', spaceGroup: 'Im-3m', spaceGroupNumber: 229, a: 3.1648, temperatureC: 25,
    sites: [{ el: 'W', xyz: [0, 0, 0] }, { el: 'W', xyz: [0.5, 0.5, 0.5] }], xrayDensityNBS: 19.265, latticeSource: NBS1, positionsSource: ITA, sources: ['nbs-circular-539', 'itc-vol-a'], transcribed: true, materialId: 'tungsten' },
  { id: 'magnesium', name: 'Magnesium', formula: 'Mg', structureType: 'hexagonal close-packed (A3)', system: 'hexagonal', spaceGroup: 'P6₃/mmc', spaceGroupNumber: 194, a: 3.2094, c: 5.2103, temperatureC: 26,
    sites: [{ el: 'Mg', xyz: [1 / 3, 2 / 3, 0.25] }, { el: 'Mg', xyz: [2 / 3, 1 / 3, 0.75] }], xrayDensityNBS: 1.737, latticeSource: NBS1, positionsSource: ITA, sources: ['nbs-circular-539', 'itc-vol-a'], transcribed: true, materialId: 'magnesium' },
  { id: 'rutile', name: 'Titanium dioxide (rutile)', formula: 'TiO2', structureType: 'rutile (C4)', system: 'tetragonal', spaceGroup: 'P4₂/mnm', spaceGroupNumber: 136, a: 4.594, c: 2.958, temperatureC: 26,
    sites: [{ el: 'Ti', xyz: [0, 0, 0] }, { el: 'Ti', xyz: [0.5, 0.5, 0.5] },
      { el: 'O', xyz: [uRutile, uRutile, 0] }, { el: 'O', xyz: [1 - uRutile, 1 - uRutile, 0] }, { el: 'O', xyz: [0.5 + uRutile, 0.5 - uRutile, 0.5] }, { el: 'O', xyz: [0.5 - uRutile, 0.5 + uRutile, 0.5] }],
    xrayDensityNBS: 4.250, latticeSource: NBS1, positionsSource: 'Ti 2a, O 4f (x, x, 0) with x = 0.30479 — Abrahams & Bernstein (1971)', sources: ['nbs-circular-539', 'abrahams-bernstein-1971', 'itc-vol-a'], transcribed: true, materialId: 'rutile' },
];

// ---------------------------------------------------------------- JANAF
interface JanafRow { T: number; Cp: number; S: number; HmH298: number }
const JANAF_TARGETS: { materialId: string; index: string; formula: string; state: string; name?: RegExp }[] = [
  { materialId: 'copper', index: 'Cu', formula: 'Cu', state: 'ref' },
  { materialId: 'aluminium', index: 'Al', formula: 'Al', state: 'ref' },
  { materialId: 'iron', index: 'Fe', formula: 'Fe', state: 'ref' },
  { materialId: 'tungsten', index: 'W', formula: 'W', state: 'ref' },
  { materialId: 'magnesium', index: 'Mg', formula: 'Mg', state: 'ref' },
  { materialId: 'silicon', index: 'Si', formula: 'Si', state: 'ref' },
  { materialId: 'graphite', index: 'C', formula: 'C', state: 'ref' },
  { materialId: 'nacl', index: 'Na', formula: 'ClNa', state: 'cr' },
  { materialId: 'rutile', index: 'Ti', formula: 'O2Ti', state: 'cr', name: /rutile/i },
  { materialId: 'alpha-quartz', index: 'Si', formula: 'O2Si', state: 'cr', name: /quartz/i },
];

async function janaf() {
  const out: Record<string, { table: string; url: string; name: string; rows: JanafRow[] }> = {};
  const indexCache = new Map<string, string>();
  for (const t of JANAF_TARGETS) {
    if (!indexCache.has(t.index)) indexCache.set(t.index, await fetchText(`https://janaf.nist.gov/tables/${t.index}-index.html`, { minIntervalMs: 1500, cacheKey: `janaf/${t.index}-index.html` }));
    const rows = [...indexCache.get(t.index)!.matchAll(/<tr><td>[^<]*<\/td><td>([^<]*)<\/td><td>([^<]*)<\/td><td>([^<]*)<\/td><td><a href="([^"]+)\.html">/g)]
      .filter((m) => m[1] === t.formula && m[3] === t.state && (!t.name || t.name.test(m[2])));
    if (rows.length !== 1) { console.warn(`  JANAF: ${rows.length} matches for ${t.formula}(${t.state}) — skipped`); continue; }
    const id = rows[0][4];
    const url = `https://janaf.nist.gov/tables/${id}.txt`;
    const txt = await fetchText(url, { minIntervalMs: 1500, cacheKey: `janaf/${id}.txt` });
    const data: JanafRow[] = [];
    for (const line of txt.split('\n').slice(2)) {
      const c = line.split('\t');
      const T = Number(c[0]), Cp = Number(c[1]), S = Number(c[2]), H = Number(c[4]);
      if (!Number.isFinite(T) || !Number.isFinite(Cp) || T > 3000 || T === 0) continue;
      if (/TRANSITION/i.test(line)) continue;
      data.push({ T, Cp, S, HmH298: H });
    }
    out[t.materialId] = { table: id, url, name: `${rows[0][2]} (${t.state})`, rows: data };
    console.log(`  JANAF ${t.materialId.padEnd(13)} ${id}  ${data.length} rows; Cp(298.15) = ${data.find((r) => r.T === 298.15)?.Cp}`);
  }
  return out;
}

// ---------------------------------------------------------------- refractive index
const RI: { materialId: string; path: string; label: string }[] = [
  { materialId: 'fused-silica', path: 'SiO2/nk/Malitson.yml', label: 'fused silica' },
  { materialId: 'alpha-quartz', path: 'SiO2/nk/Ghosh-o.yml', label: 'crystalline quartz, ordinary ray' },
  { materialId: 'diamond', path: 'C/nk/Peter.yml', label: 'diamond' },
  { materialId: 'nacl', path: 'NaCl/nk/Li.yml', label: 'sodium chloride' },
  { materialId: 'cscl', path: 'CsCl/nk/Li.yml', label: 'caesium chloride' },
  { materialId: 'sapphire', path: 'Al2O3/nk/Malitson-o.yml', label: 'sapphire (α-Al₂O₃), ordinary ray' },
  { materialId: 'rutile', path: 'TiO2/nk/Devore-o.yml', label: 'rutile, ordinary ray' },
  { materialId: 'fluorite', path: 'CaF2/nk/Malitson.yml', label: 'calcium fluoride' },
  { materialId: 'water', path: 'H2O/nk/Daimon-20.0C.yml', label: 'liquid water, 20 °C' },
];

function parseRiYaml(y: string) {
  const refs = (y.match(/REFERENCES: \|\n([\s\S]*?)\n[A-Z]+:/)?.[1] ?? '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  const doi = y.match(/doi\.org\/([^"\s]+)"/)?.[1] ?? null;
  const comments = (y.match(/COMMENTS: \|?\n?\s*([^\n]+)/)?.[1] ?? '').trim();
  const type = y.match(/- type: (formula \d|tabulated n|tabulated nk)/)?.[1] ?? null;
  const range = y.match(/wavelength_range: ([\d.]+) ([\d.]+)/);
  const coeff = y.match(/coefficients: ([^\n]+)/)?.[1].trim().split(/\s+/).map(Number) ?? null;
  const T = y.match(/temperature: ([\d.]+)/)?.[1];
  let table: [number, number][] | null = null;
  if (type?.startsWith('tabulated')) {
    const block = y.split(/data: \|/)[1] ?? '';
    table = block.split('\n').map((l) => l.trim().split(/\s+/).map(Number)).filter((r) => r.length >= 2 && r.every(Number.isFinite)).map((r) => [r[0], r[1]]);
  }
  return { references: refs, doi, comments, type, rangeUm: range ? [Number(range[1]), Number(range[2])] : table ? [table[0][0], table[table.length - 1][0]] : null, coefficients: coeff, temperatureK: T ? Number(T) : null, table };
}

async function refractive() {
  const out: Record<string, unknown> = {};
  for (const r of RI) {
    const url = `https://raw.githubusercontent.com/polyanskiy/refractiveindex.info-database/master/database/data/main/${r.path}`;
    const y = await fetchText(url, { minIntervalMs: 500, cacheKey: `refractiveindex/${r.path.replace(/\//g, '_')}` });
    const p = parseRiYaml(y);
    if (!p.type) { console.warn(`  RI: no data block in ${r.path}`); continue; }
    out[r.materialId] = { ...p, label: r.label, file: r.path, url: `https://refractiveindex.info/?shelf=main&book=${r.path.split('/')[0]}&page=${r.path.split('/').pop()!.replace('.yml', '')}`, license: 'CC0 1.0 (refractiveindex.info database)' };
    console.log(`  RI ${r.materialId.padEnd(13)} ${p.type} ${p.rangeUm?.join('–')} µm  doi:${p.doi}`);
  }
  return out;
}

// ---------------------------------------------------------------- fluids (1 atm isobars)
const FLUIDS: { materialId: string; id: string; name: string; TLow: number; THigh: number; TInc: number }[] = [
  { materialId: 'water', id: 'C7732185', name: 'Water', TLow: 275, THigh: 370, TInc: 5 },
  { materialId: 'nitrogen', id: 'C7727379', name: 'Nitrogen', TLow: 200, THigh: 600, TInc: 10 },
  { materialId: 'oxygen', id: 'C7782447', name: 'Oxygen', TLow: 200, THigh: 600, TInc: 10 },
  { materialId: 'argon', id: 'C7440371', name: 'Argon', TLow: 200, THigh: 600, TInc: 10 },
  { materialId: 'carbon-dioxide', id: 'C124389', name: 'Carbon dioxide', TLow: 200, THigh: 600, TInc: 10 },
  { materialId: 'helium', id: 'C7440597', name: 'Helium', TLow: 200, THigh: 600, TInc: 10 },
];
async function fluids() {
  const out: Record<string, unknown> = {};
  for (const f of FLUIDS) {
    const q = `Action=Data&Wide=on&ID=${f.id}&Type=IsoBar&Digits=6&P=0.101325&THigh=${f.THigh}&TLow=${f.TLow}&TInc=${f.TInc}&RefState=DEF&TUnit=K&PUnit=MPa&DUnit=kg%2Fm3&HUnit=kJ%2Fkg&WUnit=m%2Fs&VisUnit=Pa*s&STUnit=N%2Fm`;
    const url = `https://webbook.nist.gov/cgi/fluid.cgi?${q}`;
    const txt = await fetchText(url, { minIntervalMs: 5000, cacheKey: `webbook-fluid/${f.id}-isobar.tsv` });
    const lines = txt.trim().split('\n');
    const head = lines[0].split('\t');
    const col = (re: RegExp) => head.findIndex((h) => re.test(h));
    const iT = col(/^Temperature/), iD = col(/^Density/), iCp = col(/^Cp/), iW = col(/^Sound/), iV = col(/^Viscosity/), iK = col(/^Therm/), iPh = col(/^Phase/);
    const rows = lines.slice(1).map((l) => l.split('\t')).map((c) => ({ T: Number(c[iT]), density: Number(c[iD]), cp: Number(c[iCp]) * 1000, soundSpeed: Number(c[iW]), viscosity: Number(c[iV]), thermalConductivity: Number(c[iK]), phase: c[iPh] }))
      .filter((r) => Number.isFinite(r.T) && Number.isFinite(r.soundSpeed));
    out[f.materialId] = { name: f.name, pressurePa: 101325, url: `https://webbook.nist.gov/cgi/fluid.cgi?${q.replace('Action=Data', 'Action=Load')}`, units: { T: 'K', density: 'kg/m³', cp: 'J/(kg·K)', soundSpeed: 'm/s', viscosity: 'Pa·s', thermalConductivity: 'W/(m·K)' }, rows };
    console.log(`  fluid ${f.materialId.padEnd(15)} ${rows.length} rows, c(${rows[0]?.T} K) = ${rows[0]?.soundSpeed} m/s`);
  }
  return out;
}

// ---------------------------------------------------------------- materials
const cr = await janaf();
const ri = await refractive();
const fl = await fluids();

const MATERIALS: { id: string; name: string; formula: string; category: string; crystalId?: string; elementZ?: number; moleculeId?: string; phaseAt298: string }[] = [
  { id: 'nacl', name: 'Sodium chloride (halite)', formula: 'NaCl', category: 'ionic crystal', crystalId: 'nacl', phaseAt298: 'solid' },
  { id: 'cscl', name: 'Caesium chloride', formula: 'CsCl', category: 'ionic crystal', crystalId: 'cscl', phaseAt298: 'solid' },
  { id: 'diamond', name: 'Diamond', formula: 'C', category: 'covalent crystal', crystalId: 'diamond', elementZ: 6, phaseAt298: 'solid' },
  { id: 'graphite', name: 'Graphite', formula: 'C', category: 'layered solid', elementZ: 6, phaseAt298: 'solid' },
  { id: 'silicon', name: 'Silicon', formula: 'Si', category: 'semiconductor', crystalId: 'silicon', elementZ: 14, phaseAt298: 'solid' },
  { id: 'copper', name: 'Copper', formula: 'Cu', category: 'metal', crystalId: 'copper', elementZ: 29, phaseAt298: 'solid' },
  { id: 'aluminium', name: 'Aluminium', formula: 'Al', category: 'metal', crystalId: 'aluminium', elementZ: 13, phaseAt298: 'solid' },
  { id: 'iron', name: 'Iron (α, ferrite)', formula: 'Fe', category: 'metal', crystalId: 'alpha-iron', elementZ: 26, phaseAt298: 'solid' },
  { id: 'tungsten', name: 'Tungsten', formula: 'W', category: 'metal', crystalId: 'tungsten', elementZ: 74, phaseAt298: 'solid' },
  { id: 'magnesium', name: 'Magnesium', formula: 'Mg', category: 'metal', crystalId: 'magnesium', elementZ: 12, phaseAt298: 'solid' },
  { id: 'rutile', name: 'Titanium dioxide (rutile)', formula: 'TiO2', category: 'oxide', crystalId: 'rutile', phaseAt298: 'solid' },
  { id: 'alpha-quartz', name: 'α-Quartz', formula: 'SiO2', category: 'oxide', phaseAt298: 'solid' },
  { id: 'fused-silica', name: 'Fused silica (glass)', formula: 'SiO2', category: 'glass', phaseAt298: 'solid' },
  { id: 'sapphire', name: 'Sapphire (α-Al₂O₃)', formula: 'Al2O3', category: 'oxide', phaseAt298: 'solid' },
  { id: 'fluorite', name: 'Calcium fluoride (fluorite)', formula: 'CaF2', category: 'ionic crystal', phaseAt298: 'solid' },
  { id: 'water', name: 'Water', formula: 'H2O', category: 'liquid', moleculeId: 'pubchem-962', phaseAt298: 'liquid' },
  { id: 'nitrogen', name: 'Nitrogen', formula: 'N2', category: 'gas', moleculeId: 'pubchem-947', phaseAt298: 'gas' },
  { id: 'oxygen', name: 'Oxygen', formula: 'O2', category: 'gas', moleculeId: 'pubchem-977', phaseAt298: 'gas' },
  { id: 'argon', name: 'Argon', formula: 'Ar', category: 'gas', elementZ: 18, phaseAt298: 'gas' },
  { id: 'carbon-dioxide', name: 'Carbon dioxide', formula: 'CO2', category: 'gas', moleculeId: 'pubchem-280', phaseAt298: 'gas' },
  { id: 'helium', name: 'Helium', formula: 'He', category: 'gas', elementZ: 2, phaseAt298: 'gas' },
];

/** Point values with explicit conditions (only where a primary standard/paper gives them). */
const POINT: Record<string, unknown[]> = {
  copper: [{ property: 'electrical-resistivity', value: 1 / 58 * 1e-6, unit: 'Ω·m', conditions: { temperatureK: 293.15 }, uncertainty: null, provenance: 'observed', definition: 'International Annealed Copper Standard (100 % IACS): 1/58 Ω·mm²/m at 20 °C — a defined reference value, not a specific sample', sources: ['iec-60028'] }],
  water: [{ property: 'relative-permittivity', model: { kind: 'polynomial-celsius', coefficients: [87.740, -0.40008, 9.398e-4, -1.410e-6], validC: [0, 100] }, unit: '1', conditions: { frequencyHz: 'static (≤ 100 kHz)', pressurePa: 101325 }, uncertainty: null, provenance: 'observed', definition: 'ε_r(t) = 87.740 − 0.40008 t + 9.398×10⁻⁴ t² − 1.410×10⁻⁶ t³ (t in °C); 78.30 at 25 °C', sources: ['malmberg-maryott-1956'] }],
  vacuum: [],
};

const materials = MATERIALS.map((m) => ({
  ...m,
  heatCapacity: cr[m.id] ? { ...cr[m.id], units: { T: 'K', Cp: 'J/(mol·K)', S: 'J/(mol·K)', HmH298: 'kJ/mol' }, sources: ['nist-janaf'] } : null,
  refractiveIndex: ri[m.id] ? { ...(ri[m.id] as object), sources: ['refractiveindex-info'] } : null,
  fluid: fl[m.id] ? { ...(fl[m.id] as object), sources: ['nist-webbook-fluids'] } : null,
  properties: POINT[m.id] ?? [],
}));

writeDataset('datasets/materials/crystals.json', { version: '1.0.0', units: { length: 'Å', density: 'g/cm³' }, transcriptionNote: 'Lattice constants and NBS X-ray densities transcribed from NBS Circular 539 OCR text and checked by recomputing density (tests/science/materials.test.ts).', crystals: CRYSTALS }, {
  dataset: 'crystals', version: '1.0.0', records: CRYSTALS.length,
  sources: [
    { institution: 'NBS Circular 539, Standard X-ray Diffraction Powder Patterns (Swanson et al., National Bureau of Standards, 1953–1955)', url: 'https://nvlpubs.nist.gov/nistpubs/Legacy/circ/nbscircular539v1.pdf', license: 'U.S. Government work (public domain)', notes: 'transcribed lattice constants and X-ray densities' },
    { institution: 'CODATA 2018 — lattice parameter of silicon (NIST)', url: 'https://physics.nist.gov/cgi-bin/cuu/Value?asil' },
    { institution: 'Abrahams & Bernstein (1971) J. Chem. Phys. 55, 3206 — rutile', url: 'https://doi.org/10.1063/1.1676569' },
  ],
  adapter: 'scripts/ingestion/materials.ts', warnings: ['Manually transcribed values (flagged in the UI); verified by density recomputation tests.'],
});

writeDataset('datasets/materials/materials.json', { version: '1.0.0', materials }, {
  dataset: 'materials', version: '1.0.0', records: materials.length,
  sources: [
    { institution: 'NIST-JANAF Thermochemical Tables (Chase 1998)', url: 'https://janaf.nist.gov/', license: 'NIST Standard Reference Data', notes: `${Object.keys(cr).length} heat-capacity/entropy tables` },
    { institution: 'refractiveindex.info database (Polyanskiy), primary papers cited per file', url: 'https://github.com/polyanskiy/refractiveindex.info-database', license: 'CC0 1.0', notes: `${Object.keys(ri).length} dispersion formulas` },
    { institution: 'NIST Chemistry WebBook — Thermophysical Properties of Fluid Systems', url: 'https://webbook.nist.gov/chemistry/fluid/', license: 'NIST Standard Reference Data', notes: `${Object.keys(fl).length} fluids at 101.325 kPa` },
    { institution: 'IEC 60028 International standard of resistance for copper (IACS)', url: 'https://webstore.iec.ch/en/publication/41', notes: 'defined value' },
    { institution: 'Malmberg & Maryott (1956) J. Res. NBS 56, 1', url: 'https://nvlpubs.nist.gov/nistpubs/jres/56/jresv56n1p1_A1b.pdf', notes: 'equation verified in the paper text' },
  ],
  adapter: 'scripts/ingestion/materials.ts',
  warnings: MATERIALS.filter((m) => !cr[m.id] && !ri[m.id] && !fl[m.id] && !POINT[m.id]).map((m) => `${m.id}: no property data bundled`),
});
