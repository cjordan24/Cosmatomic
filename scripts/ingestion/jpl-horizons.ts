/**
 * Adapter: NASA/JPL solar-system data.
 *
 *  1. JPL SSD "Approximate Positions of the Planets", Table 1 (Standish & Williams)
 *     https://ssd.jpl.nasa.gov/planets/approx_pos.html  — Keplerian elements + rates, 1800–2050
 *  2. JPL Horizons API  https://ssd-api.jpl.nasa.gov/doc/horizons.html
 *     - osculating elements for major moons (planet-centred) and dwarf planets (heliocentric)
 *     - reference state vectors used ONLY by the validation test-suite
 *  3. JPL SSD planetary satellite physical parameters  https://ssd.jpl.nasa.gov/sats/phys_par/
 *  4. NASA NSSDC Planetary Fact Sheet  https://nssdc.gsfc.nasa.gov/planetary/factsheet/
 *     (public-domain HTML table; path permitted by robots.txt; no structured API exists)
 *
 * Horizons is queried at <= 1 request/second.
 * Outputs datasets/astronomical/{planet-elements,small-body-elements,planet-physical,moon-physical,horizons-reference-vectors}.json
 */
import { fetchText, writeDataset } from './lib/ingest.ts';

const H = 'https://ssd.jpl.nasa.gov/api/horizons.api';
const SLOW = { minIntervalMs: 1000 };
const EPOCH = '2025-01-01';

const strip = (s: string) => s.replace(/<[^>]*>/g, ' ').replace(/&[a-z]+;/g, ' ').replace(/\s+/g, ' ').trim();
function tableRows(html: string): string[][] {
  // Flatten each <tr> into its *direct* text cells. Nested markup is flattened to text.
  return [...html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/g)].map((m) =>
    [...m[1].matchAll(/<t[hd][^>]*>([\s\S]*?)(?=<t[hd][\s>]|$)/g)].map((c) => strip(c[1])),
  );
}

// ---------------------------------------------------------------- 1. planet elements
async function planetElements() {
  const html = await fetchText('https://ssd.jpl.nasa.gov/planets/approx_pos.html', { ...SLOW, cacheKey: 'jpl/approx_pos.html' });
  const pre = html.split('<h4>Table 1</h4>')[1].match(/<pre>([\s\S]*?)<\/pre>/)![1];
  const lines = pre.split('\n');
  const ids: Record<string, string> = { Mercury: 'mercury', Venus: 'venus', 'EM Bary': 'earth-moon-barycenter', Mars: 'mars', Jupiter: 'jupiter', Saturn: 'saturn', Uranus: 'uranus', Neptune: 'neptune' };
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    const name = lines[i].slice(0, 9).trim();
    if (!ids[name]) continue;
    const v = lines[i].slice(9).trim().split(/\s+/).map(Number);
    const r = (lines[i + 1] ?? '').trim().split(/\s+/).map(Number);
    if (v.length !== 6 || r.length !== 6 || [...v, ...r].some((x) => !Number.isFinite(x))) throw new Error(`Unexpected Table 1 rows near: ${lines[i]}`);
    out.push({ id: ids[name], a: v[0], e: v[1], I: v[2], L: v[3], varpi: v[4], Omega: v[5], aDot: r[0], eDot: r[1], IDot: r[2], LDot: r[3], varpiDot: r[4], OmegaDot: r[5] });
  }
  if (out.length !== 8) throw new Error(`Expected 8 rows in Table 1, got ${out.length}`);
  writeDataset('datasets/astronomical/planet-elements.json', { frame: 'mean ecliptic and equinox of J2000', units: { a: 'au', angles: 'deg', rates: 'per Julian century (TDB)' }, validFrom: '1800-01-01', validTo: '2050-12-31', elements: out }, {
    dataset: 'planet-elements', version: '1', records: out.length, adapter: 'scripts/ingestion/jpl-horizons.ts', warnings: [],
    sources: [{ institution: 'NASA JPL Solar System Dynamics', url: 'https://ssd.jpl.nasa.gov/planets/approx_pos.html', notes: 'Table 1: Keplerian elements and rates, valid 1800 AD – 2050 AD (E. M. Standish).' }],
  });
}

// ---------------------------------------------------------------- 2. Horizons osculating elements
const MOONS: [string, string, string][] = [
  // [id, Horizons command, centre body code]
  ['moon', '301', '399'], ['phobos', '401', '499'], ['deimos', '402', '499'],
  ['io', '501', '599'], ['europa', '502', '599'], ['ganymede', '503', '599'], ['callisto', '504', '599'],
  ['mimas', '601', '699'], ['enceladus', '602', '699'], ['tethys', '603', '699'], ['dione', '604', '699'], ['rhea', '605', '699'], ['titan', '606', '699'], ['iapetus', '608', '699'],
  ['ariel', '701', '799'], ['umbriel', '702', '799'], ['titania', '703', '799'], ['oberon', '704', '799'], ['miranda', '705', '799'],
  ['triton', '801', '899'], ['proteus', '808', '899'],
  ['charon', '901', '999'],
];
const DWARFS: [string, string][] = [['pluto', '999'], ['ceres', "'1;'"], ['eris', "'136199;'"], ['haumea', "'136108;'"], ['makemake', "'136472;'"]];

function horizonsUrl(params: Record<string, string>) {
  const q = Object.entries({ format: 'json', OBJ_DATA: 'NO', MAKE_EPHEM: 'YES', CSV_FORMAT: 'YES', ...params })
    .map(([k, v]) => `${k}=${encodeURIComponent(k === 'format' || v.startsWith("'") ? v : `'${v}'`)}`).join('&');
  return `${H}?${q}`;
}

function parseCsvBlock(result: string): string[][] {
  const block = result.split('$$SOE')[1]?.split('$$EOE')[0];
  if (!block) throw new Error(`Horizons returned no ephemeris block:\n${result.slice(0, 600)}`);
  return block.trim().split('\n').map((l) => l.split(',').map((s) => s.trim()).filter((s) => s !== ''));
}

async function elements(command: string, center: string, units: 'KM-S' | 'AU-D') {
  const res = JSON.parse(await fetchText(horizonsUrl({
    COMMAND: command, EPHEM_TYPE: 'ELEMENTS', CENTER: `500@${center}`, START_TIME: EPOCH, STOP_TIME: '2025-01-02', STEP_SIZE: '1d', REF_PLANE: 'ECLIPTIC', REF_SYSTEM: 'ICRF', OUT_UNITS: units,
  }), { ...SLOW, cacheKey: `jpl/el-${command.replace(/\W/g, '')}-${center}.json` })) as { result: string };
  const gm = Number(res.result.match(/Keplerian GM\s*:\s*([\d.E+-]+)/)?.[1]);
  const name = res.result.match(/Target body name:\s*(.+?)\s{2,}/)?.[1] ?? command;
  const [row] = parseCsvBlock(res.result);
  // JDTDB, Cal, EC, QR, IN, OM, W, Tp, N, MA, TA, A, AD, PR
  const n = row.map(Number);
  return { horizonsName: name, epochJD: n[0], e: n[2], i: n[4], Omega: n[5], omega: n[6], meanMotion: n[8], M: n[9], a: n[11], period: n[13], centralGM: gm };
}

async function smallBodyElements() {
  const moons = [];
  for (const [id, cmd, center] of MOONS) {
    process.stdout.write(`\r  moon ${id.padEnd(12)}`);
    moons.push({ id, parent: center, ...(await elements(cmd, center, 'KM-S')) });
  }
  const dwarfs = [];
  for (const [id, cmd] of DWARFS) {
    process.stdout.write(`\r  dwarf ${id.padEnd(12)}`);
    dwarfs.push({ id, ...(await elements(cmd, '10', 'AU-D')) });
  }
  process.stdout.write('\n');
  writeDataset('datasets/astronomical/small-body-elements.json', {
    frame: 'ecliptic of J2000 (ICRF)', epoch: `${EPOCH} 00:00 TDB`,
    units: { moons: { a: 'km', angles: 'deg', meanMotion: 'deg/s', period: 's', centralGM: 'km^3/s^2' }, dwarfs: { a: 'au', angles: 'deg', meanMotion: 'deg/day', period: 'day', centralGM: 'au^3/day^2' } },
    moons, dwarfs,
  }, {
    dataset: 'small-body-elements', version: '1', records: moons.length + dwarfs.length, adapter: 'scripts/ingestion/jpl-horizons.ts', warnings: [],
    sources: [{ institution: 'NASA JPL Horizons', url: 'https://ssd.jpl.nasa.gov/horizons/', notes: `Geometric osculating elements at ${EPOCH} TDB. Two-body propagation of these elements degrades with distance from epoch.` }],
  });
}

// ---------------------------------------------------------------- 3. reference vectors (validation only)
const REF_DATES = ['1900-01-01', '1950-06-15', '2000-01-01 12:00', '2025-06-15', '2049-12-31'];
const REF_BODIES: [string, string][] = [['mercury', '199'], ['venus', '299'], ['earth-moon-barycenter', '3'], ['mars', '499'], ['jupiter', '5'], ['saturn', '6'], ['uranus', '7'], ['neptune', '8']];

async function referenceVectors() {
  const out: Record<string, { jd: number; x: number; y: number; z: number }[]> = {};
  const tlist = REF_DATES.map((d) => `'${d}'`).join(' ');
  for (const [id, cmd] of [...REF_BODIES, ['moon', '301'] as [string, string]]) {
    process.stdout.write(`\r  vectors ${id.padEnd(24)}`);
    const center = id === 'moon' ? '399' : '10';
    const res = JSON.parse(await fetchText(horizonsUrl({
      COMMAND: cmd, EPHEM_TYPE: 'VECTORS', CENTER: `500@${center}`, TLIST: tlist, TLIST_TYPE: 'CAL', TIME_TYPE: 'TDB', REF_PLANE: 'ECLIPTIC', REF_SYSTEM: 'ICRF', OUT_UNITS: 'AU-D', VEC_TABLE: '1',
    }), { ...SLOW, cacheKey: `jpl/vec-${cmd}-${center}.json` })) as { result: string };
    out[id] = parseCsvBlock(res.result).map((r) => ({ jd: Number(r[0]), x: Number(r[2]), y: Number(r[3]), z: Number(r[4]) }));
  }
  process.stdout.write('\n');
  writeDataset('datasets/astronomical/horizons-reference-vectors.json', { frame: 'ecliptic of J2000 (ICRF)', units: 'au', centre: 'Sun body centre (Moon: Earth centre)', timeScale: 'TDB', vectors: out }, {
    dataset: 'horizons-reference-vectors', version: '1', records: Object.keys(out).length, adapter: 'scripts/ingestion/jpl-horizons.ts', warnings: [],
    sources: [{ institution: 'NASA JPL Horizons (DE440/DE441)', url: 'https://ssd.jpl.nasa.gov/horizons/', notes: 'Used exclusively as ground truth by tests/science/ephemeris.test.ts.' }],
  });
}

// ---------------------------------------------------------------- 4. physical parameters
async function moonPhysical() {
  const html = await fetchText('https://ssd.jpl.nasa.gov/sats/phys_par/', { ...SLOW, cacheKey: 'jpl/sats_phys_par.html' });
  const out: Record<string, unknown> = {};
  const warnings: string[] = [];
  /** Each quantity occupies three cells: value, sigma, reference. */
  const pick = (row: string[], at: number) => {
    const v = row[at] ?? '', s = row[at + 1] ?? '';
    const value = Number(v);
    return v !== '' && Number.isFinite(value) ? { value, sigma: s !== '' && Number.isFinite(Number(s)) ? Number(s) : null, ref: row[at + 2] || null } : null;
  };
  for (const row of tableRows(html)) {
    // rows are [planet?, satellite, code, GM..., radius..., density..., albedo...]; planet column may be omitted (rowspan)
    const k = row.findIndex((c) => /^\d{3}$/.test(c));
    if (k < 1) continue;
    const code = row[k];
    const id = MOONS.find(([, c]) => c === code)?.[0];
    if (!id) continue;
    out[id] = { name: row[k - 1], code, gmKm3s2: pick(row, k + 1), meanRadiusKm: pick(row, k + 4), densityGcm3: pick(row, k + 7), geometricAlbedo: pick(row, k + 10) };
  }
  for (const [id] of MOONS) if (!out[id]) warnings.push(`no physical parameters parsed for ${id}`);
  writeDataset('datasets/astronomical/moon-physical.json', out, {
    dataset: 'moon-physical', version: '1', records: Object.keys(out).length, adapter: 'scripts/ingestion/jpl-horizons.ts', warnings,
    sources: [{ institution: 'NASA JPL Solar System Dynamics', url: 'https://ssd.jpl.nasa.gov/sats/phys_par/', notes: 'GM, mean radius, density, geometric albedo with 1σ uncertainties.' }],
  });
}

async function planetPhysical() {
  const html = await fetchText('https://nssdc.gsfc.nasa.gov/planetary/factsheet/', { ...SLOW, cacheKey: 'nssdc/factsheet.html' });
  const rows = tableRows(html).filter((r) => r.length >= 11);
  const header = rows.find((r) => r.includes('MERCURY'))!;
  const bodies = header.slice(1, 11).map((s) => s.toLowerCase());
  const fieldMap: [RegExp, string, number][] = [
    [/^Mass/, 'massKg', 1e24], [/^Diameter/, 'diameterKm', 1], [/^Density/, 'densityKgM3', 1], [/^Gravity/, 'gravityMs2', 1],
    [/^Escape Velocity/, 'escapeVelocityKms', 1], [/^Rotation Period/, 'rotationPeriodH', 1], [/^Length of Day/, 'dayLengthH', 1],
    [/^Distance from Sun/, 'meanDistanceKm', 1e6], [/^Perihelion/, 'perihelionKm', 1e6], [/^Aphelion/, 'aphelionKm', 1e6],
    [/^Orbital Period/, 'orbitalPeriodDays', 1], [/^Orbital Velocity/, 'orbitalVelocityKms', 1], [/^Orbital Inclination/, 'inclinationDeg', 1],
    [/^Orbital Eccentricity/, 'eccentricity', 1], [/^Obliquity/, 'obliquityDeg', 1], [/^Mean Temperature/, 'meanTemperatureC', 1],
    [/^Surface Pressure/, 'surfacePressureBar', 1], [/^Number of Moons/, 'knownMoons', 1], [/^Ring System/, 'rings', 0], [/^Global Magnetic/, 'globalMagneticField', 0],
  ];
  const out: Record<string, Record<string, number | boolean | string | null>> = Object.fromEntries(bodies.map((b) => [b, {}]));
  for (const row of rows) {
    const f = fieldMap.find(([re]) => re.test(row[0]));
    if (!f) continue;
    bodies.forEach((b, j) => {
      const raw = row[j + 1].replace(/,/g, '').replace('*', '').trim();
      if (f[2] === 0) out[b][f[1]] = raw === 'Yes' ? true : raw === 'No' ? false : null;
      else out[b][f[1]] = /unknown/i.test(raw) || raw === '' ? null : Number(raw) * f[2];
      if (row[j + 1].includes('*')) out[b][`${f[1]}Note`] = 'see NSSDC footnote (value relative to Earth for the Moon, or no surface for giant planets)';
    });
  }
  writeDataset('datasets/astronomical/planet-physical.json', out, {
    dataset: 'planet-physical', version: '1', records: bodies.length, adapter: 'scripts/ingestion/jpl-horizons.ts', warnings: [],
    sources: [{ institution: 'NASA Goddard NSSDC', url: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/', license: 'US Government work (public domain)', notes: 'Values are rounded as published (typically 3 significant figures).' }],
  });
}

// ---------------------------------------------------------------- 5. SBDB physical parameters (dwarf planets except Pluto)
async function dwarfPhysical() {
  const ids: [string, string][] = [['ceres', '1'], ['eris', '136199'], ['haumea', '136108'], ['makemake', '136472']];
  const out: Record<string, unknown> = {};
  for (const [id, sstr] of ids) {
    const j = JSON.parse(await fetchText(`https://ssd-api.jpl.nasa.gov/sbdb.api?sstr=${sstr}&phys-par=1`, { ...SLOW, cacheKey: `jpl/sbdb-${sstr}.json` })) as
      { object: { fullname: string; orbit_class: { name: string } }; phys_par?: { name: string; value: string; sigma: string | null; units: string | null; ref: string | null }[] };
    out[id] = { fullname: j.object.fullname, orbitClass: j.object.orbit_class.name,
      params: Object.fromEntries((j.phys_par ?? []).map((p) => [p.name, { value: Number(p.value), sigma: p.sigma === null ? null : Number(p.sigma), units: p.units, ref: p.ref }])) };
  }
  writeDataset('datasets/astronomical/dwarf-physical.json', out, {
    dataset: 'dwarf-physical', version: '1', records: ids.length, adapter: 'scripts/ingestion/jpl-horizons.ts', warnings: [],
    sources: [{ institution: 'NASA JPL Small-Body Database', url: 'https://ssd-api.jpl.nasa.gov/doc/sbdb.html', notes: 'Physical parameters as published by SBDB (coverage varies; missing values remain unknown).' }],
  });
}

// ---------------------------------------------------------------- 6. spacecraft trajectories (Voyager 1 & 2)
/**
 * Position + velocity samples for cubic Hermite interpolation in the app.
 * Dense windows (2 h; 20 min within ±2 d; 5 min within ±1 d of closest approach) around each planetary encounter; 10-day cruise steps to 1990, 30-day after.
 */
const CRAFT: { id: string; cmd: string; name: string; launch: string; encounters: [string, string][] }[] = [
  { id: 'voyager-1', cmd: '-31', name: 'Voyager 1', launch: '1977-09-06', encounters: [['Jupiter', '1979-03-05'], ['Saturn', '1980-11-12']] },
  { id: 'voyager-2', cmd: '-32', name: 'Voyager 2', launch: '1977-08-21', encounters: [['Jupiter', '1979-07-09'], ['Saturn', '1981-08-26'], ['Uranus', '1986-01-24'], ['Neptune', '1989-08-25']] },
];
const addDays = (d: string, n: number) => new Date(Date.parse(d + 'T00:00:00Z') + n * 86400000).toISOString().slice(0, 10);

async function vectorsRange(cmd: string, start: string, stop: string, step: string) {
  const res = JSON.parse(await fetchText(horizonsUrl({
    COMMAND: cmd, EPHEM_TYPE: 'VECTORS', CENTER: '500@10', START_TIME: start, STOP_TIME: stop, STEP_SIZE: step, REF_PLANE: 'ECLIPTIC', REF_SYSTEM: 'ICRF', OUT_UNITS: 'KM-S', VEC_TABLE: '2', TIME_TYPE: 'TDB',
  }), { ...SLOW, cacheKey: `jpl/craft${cmd}-${start}-${stop}-${step.replace(/\W/g, '')}.json` })) as { result: string };
  return parseCsvBlock(res.result).map((r) => r.slice(0, 1).concat(r.slice(2, 8)).map(Number));
}

/** Parse the "SPACECRAFT TRAJECTORY" section list from the Horizons object header (machine-read, not transcribed). */
async function trajectorySections(cmd: string) {
  const res = JSON.parse(await fetchText(horizonsUrl({ COMMAND: cmd, OBJ_DATA: 'YES', MAKE_EPHEM: 'NO' }), { ...SLOW, cacheKey: `jpl/craft${cmd}-objdata.json` })) as { result: string };
  const block = res.result.split('SPACECRAFT TRAJECTORY:')[1] ?? '';
  const MON: Record<string, string> = { Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06', Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12' };
  const iso = (d: string) => { const [y, m, dd] = d.split('-'); return `${y}-${MON[m]}-${dd.padStart(2, '0')}`; };
  const parts = [...block.matchAll(/#\d\)\s*(\d{4}-\w{3}-\d{1,2})\s+to\s+(\d{4}-\w{3}-\d{1,2}):?\s*([\s\S]*?)(?=#\d\)|\n\s*\n\s*[A-Z][A-Za-z ]+:|$)/g)];
  if (!parts.length) throw new Error(`No trajectory sections parsed for ${cmd}`);
  return parts.map((m) => ({ from: iso(m[1]), to: iso(m[2]), description: m[3].replace(/\s+/g, ' ').trim() }));
}

async function spacecraft() {
  const out: Record<string, unknown> = {};
  for (const c of CRAFT) {
    process.stdout.write(`\r  spacecraft ${c.name}        `);
    const segs: number[][] = [];
    segs.push(...await vectorsRange(c.cmd, c.launch, addDays(c.launch, 30), '6h'));
    segs.push(...await vectorsRange(c.cmd, addDays(c.launch, 30), '1990-01-01', '10d'));
    segs.push(...await vectorsRange(c.cmd, '1990-01-01', '2050-12-30', '30d'));
    for (const [, d] of c.encounters) {
      segs.push(...await vectorsRange(c.cmd, addDays(d, -10), addDays(d, 10), '2h'));
      segs.push(...await vectorsRange(c.cmd, addDays(d, -2), addDays(d, 2), '20m')); // closest-approach curvature
      segs.push(...await vectorsRange(c.cmd, addDays(d, -1), addDays(d, 1), '5m')); // e.g. Neptune flyby 4 950 km above cloud tops
    }
    const byJd = new Map<number, number[]>();
    for (const r of segs) byJd.set(r[0], r);
    const samples = [...byJd.values()].sort((a, b) => a[0] - b[0])
      .map((r) => [r[0], ...r.slice(1, 4).map((v) => Math.round(v)), ...r.slice(4, 7).map((v) => Math.round(v * 1e4) / 1e4)]);
    const sections = await trajectorySections(c.cmd);
    out[c.id] = { name: c.name, horizonsId: c.cmd, launch: c.launch, encounters: c.encounters, sections, columns: ['jdTDB', 'x_km', 'y_km', 'z_km', 'vx_kms', 'vy_kms', 'vz_kms'], samples };
  }
  process.stdout.write('\n');
  writeDataset('datasets/astronomical/spacecraft-voyager.json', { frame: 'ecliptic of J2000 (ICRF), heliocentric (Sun body centre)', timeScale: 'TDB', craft: out }, {
    dataset: 'spacecraft-voyager', version: '1', records: CRAFT.length, adapter: 'scripts/ingestion/jpl-horizons.ts', warnings: [],
    sources: [{ institution: 'NASA JPL Horizons (Voyager_1/2_ST+refit2022_m)', url: 'https://ssd.jpl.nasa.gov/horizons/', notes: 'Merged sections per Horizons: patched-conic mission-design arc (rough accuracy), then a 2022 fit to tracking data through 1992, then JPL prediction. Section list stored per craft. Positions rounded to 1 km, velocities to 0.1 m/s.' }],
  });
}

// ---------------------------------------------------------------- 7. encounter-window ephemerides (planets + major moons)
/**
 * The app's planet model (JPL Table 1) errs by 10⁵–10⁶ km and moons are propagated from 2025 elements,
 * so Voyager flybys would be misplaced. For each encounter we ingest Horizons vectors of the planet
 * (heliocentric; same dense sampling as the craft) and of its major moons (planet-centred, hourly, ±3 d).
 */
const PLANET_CODE: Record<string, string> = { Jupiter: '599', Saturn: '699', Uranus: '799', Neptune: '899' };
async function vectorsRangeCentre(cmd: string, centre: string, start: string, stop: string, step: string) {
  const res = JSON.parse(await fetchText(horizonsUrl({
    COMMAND: cmd, EPHEM_TYPE: 'VECTORS', CENTER: `500@${centre}`, START_TIME: start, STOP_TIME: stop, STEP_SIZE: step, REF_PLANE: 'ECLIPTIC', REF_SYSTEM: 'ICRF', OUT_UNITS: 'KM-S', VEC_TABLE: '2', TIME_TYPE: 'TDB',
  }), { ...SLOW, cacheKey: `jpl/enc${cmd}@${centre}-${start}-${stop}-${step.replace(/\W/g, '')}.json` })) as { result: string };
  return parseCsvBlock(res.result).map((r) => r.slice(0, 1).concat(r.slice(2, 8)).map(Number));
}
const pack = (rows: number[][]) => {
  const m = new Map<number, number[]>();
  for (const r of rows) m.set(r[0], r);
  return [...m.values()].sort((a, b) => a[0] - b[0]).map((r) => [r[0], ...r.slice(1, 4).map((v) => Math.round(v)), ...r.slice(4, 7).map((v) => Math.round(v * 1e4) / 1e4)]);
};
async function encounters() {
  const windows: unknown[] = [];
  for (const c of CRAFT) {
    for (const [planet, d] of c.encounters) {
      process.stdout.write(`\r  encounter ${c.name} ${planet}          `);
      const code = PLANET_CODE[planet];
      const rows = [
        ...await vectorsRangeCentre(code, '10', addDays(d, -10), addDays(d, 10), '2h'),
        ...await vectorsRangeCentre(code, '10', addDays(d, -2), addDays(d, 2), '20m'),
        ...await vectorsRangeCentre(code, '10', addDays(d, -1), addDays(d, 1), '5m'),
      ];
      const moons: Record<string, number[][]> = {};
      for (const [id, mcmd, centre] of MOONS) {
        if (centre !== code) continue;
        moons[id] = pack(await vectorsRangeCentre(mcmd, code, addDays(d, -3), addDays(d, 3), '1h'));
      }
      windows.push({ craft: c.id, planet: planet.toLowerCase(), date: d, planetSamples: pack(rows), moons });
    }
  }
  process.stdout.write('\n');
  writeDataset('datasets/astronomical/encounter-ephemerides.json', { frame: 'ecliptic of J2000 (ICRF); planets heliocentric, moons planet-centred', timeScale: 'TDB', columns: ['jdTDB', 'x_km', 'y_km', 'z_km', 'vx_kms', 'vy_kms', 'vz_kms'], windows }, {
    dataset: 'encounter-ephemerides', version: '1', records: windows.length, adapter: 'scripts/ingestion/jpl-horizons.ts', warnings: [],
    sources: [{ institution: 'NASA JPL Horizons (DE440 + satellite ephemerides)', url: 'https://ssd.jpl.nasa.gov/horizons/', notes: 'Planet ±10 d (2 h / 20 min / 5 min), major moons ±3 d hourly, around each Voyager encounter. Loaded lazily by the app.' }],
  }, 8 * 1024 * 1024);
}

async function main() {
  await encounters();
  await spacecraft();
  await dwarfPhysical();
  await planetElements();
  await planetPhysical();
  await moonPhysical();
  await smallBodyElements();
  await referenceVectors();
}
main().catch((e) => { console.error(e); process.exit(1); });
