/**
 * Standard-state thermochemistry (Phase 4, Gate 4.2) → datasets/chemistry/thermochemistry.json
 *
 *   node --experimental-strip-types scripts/ingestion/thermochemistry.ts
 *
 * Priority 1 — CODATA Key Values for Thermodynamics (Cox, Wagman & Medvedev 1989), the
 *   internationally agreed, internally consistent set: ΔfH°(298.15 K), S°(298.15 K) and
 *   H°(298.15) − H°(0), each with its stated uncertainty. One page, crawl-delay 3 s honoured.
 * Priority 2 — NIST Chemistry WebBook (SRD 69) for species absent from CODATA. Selection rule
 *   (deterministic, recorded per value): the first row whose method is "Review" and that states an
 *   uncertainty; else the first "Review" row; else the first row. The cited reference and method are
 *   stored with each value. Crawl-delay 5 s honoured (robots.txt), cached on disk.
 *
 * Standard state: p° = 1 bar (100 000 Pa), T = 298.15 K, for both sources. Ions are aqueous at
 * unit molality with the convention ΔfH°(H⁺, aq) = 0 and S°(H⁺, aq) = 0.
 * Missing values are omitted (never estimated): the app shows them as unknown.
 */
import { fetchText, writeDataset } from './lib/ingest.ts';

interface Value { value: number; uncertainty: number | null }
interface SpeciesRecord {
  key: string; // species syntax of the reaction library, e.g. "H2O(l)", "SO4^2-(aq)"
  name?: string;
  dfH?: Value & { source: string; method?: string; reference?: string; derived?: boolean };
  S?: Value & { source: string; method?: string; reference?: string };
  H298mH0?: Value & { source: string };
  source: 'CODATA' | 'NIST WebBook';
  url: string;
}

const strip = (s: string) => s.replace(/<SUB>(.*?)<\/SUB>/gi, '$1').replace(/<SUP>(.*?)<\/SUP>/gi, '^$1').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
function parsePm(s: string): Value | null {
  const t = s.replace(/&plusmn;|±/g, '±').replace(/&minus;|−/g, '-').replace(/\s+/g, '');
  if (!t) return null;
  const m = t.match(/^([+-]?\d+(?:\.\d*)?)(?:±(\d+(?:\.\d*)?))?/);
  return m ? { value: Number(m[1]), uncertainty: m[2] ? Number(m[2]) : null } : null;
}
const CODATA_PHASE: Record<string, string> = { cr: 's', g: 'g', l: 'l', aq: 'aq' };

/** CODATA formula + charge → reaction-library key. CODATA writes charges as superscripts (e.g. "SO4^2-"). */
function codataKey(formula: string, state: string): string | null {
  // qualified states: "cr,graphite", "cr,alpha quartz", "aq,undissoc." → base state (qualifier kept as the name)
  const ph = CODATA_PHASE[state.split(',')[0].trim()];
  if (!ph) return null;
  let f = formula.replace(/\s+/g, '');
  if (!f.includes('^') && /[a-z0-9)][+-]$/.test(f)) f = f.slice(0, -1) + '^' + f.slice(-1); // "HS-" → "HS^-"
  if (f.includes('^')) {
    // CODATA writes the sign first ("+2", "-"); the library writes magnitude first ("2+", "-")
    const m = f.match(/\^([+-])(\d*)$/);
    if (!m) return null; // unexpected notation: skip rather than guess
    const n = m[2] === '1' ? '' : m[2];
    f = f.replace(/\^.*$/, '') + `^${n}${m[1]}`;
  } else if (/[+-]$/.test(f)) return null;
  return `${f}(${ph})`;
}

async function codata(): Promise<SpeciesRecord[]> {
  const url = 'https://www.codata.info/resources/databases/key1.html';
  const html = await fetchText(url, { minIntervalMs: 3000, cacheKey: 'codata/key1.html' });
  const rows = [...html.matchAll(/<TR[^>]*>([\s\S]*?)<\/TR>/gi)].map((r) => [...r[1].matchAll(/<TD[^>]*>([\s\S]*?)<\/TD>/gi)].map((c) => c[1]));
  const out: SpeciesRecord[] = [];
  for (const cells of rows) {
    if (cells.length < 4) continue;
    const formula = strip(cells[0]);
    const state = strip(cells[1]);
    const dfH = parsePm(strip(cells[2]));
    const S = parsePm(strip(cells[3]));
    if (!formula || !state || !dfH || !/^[A-Z]/.test(formula)) continue;
    const key = codataKey(formula, state);
    if (!key) { console.warn(`  skip CODATA ${formula} (${state})`); continue; }
    const src = 'CODATA Key Values for Thermodynamics (Cox, Wagman & Medvedev 1989)';
    const H = cells[4] ? parsePm(strip(cells[4])) : null;
    const qual = state.includes(',') ? state.split(',').slice(1).join(',').trim() : '';
    out.push({ key, ...(qual ? { name: qual } : {}), dfH: { ...dfH, source: src },...(S ? { S: { ...S, source: src } } : {}), ...(H ? { H298mH0: { ...H, source: src } } : {}), source: 'CODATA', url });
  }
  return out;
}

/** WebBook species not covered by CODATA (CAS-number pages). */
const WEBBOOK: { key: string; name: string; id: string; phase: 'gas' | 'liquid' | 'solid' }[] = [
  { key: 'CH4(g)', name: 'methane', id: 'C74828', phase: 'gas' },
  { key: 'C2H6(g)', name: 'ethane', id: 'C74840', phase: 'gas' },
  { key: 'C3H8(g)', name: 'propane', id: 'C74986', phase: 'gas' },
  { key: 'C2H2(g)', name: 'acetylene', id: 'C74862', phase: 'gas' },
  { key: 'C8H18(l)', name: 'n-octane', id: 'C111659', phase: 'liquid' },
  { key: 'C2H5OH(l)', name: 'ethanol', id: 'C64175', phase: 'liquid' },
  { key: 'CH3OH(l)', name: 'methanol', id: 'C67561', phase: 'liquid' },
  { key: 'CH3OH(g)', name: 'methanol', id: 'C67561', phase: 'gas' },
  { key: 'C6H12O6(s)', name: 'α-D-glucose', id: 'C492626', phase: 'solid' },
  { key: 'O3(g)', name: 'ozone', id: 'C10028156', phase: 'gas' },
  { key: 'O(g)', name: 'atomic oxygen', id: 'C17778802', phase: 'gas' },
  { key: 'NO(g)', name: 'nitric oxide', id: 'C10102439', phase: 'gas' },
  { key: 'NO2(g)', name: 'nitrogen dioxide', id: 'C10102440', phase: 'gas' },
  { key: 'SO3(g)', name: 'sulfur trioxide', id: 'C7446119', phase: 'gas' },
  { key: 'H2SO4(l)', name: 'sulfuric acid', id: 'C7664939', phase: 'liquid' },
  { key: 'OH(g)', name: 'hydroxyl radical', id: 'C3352576', phase: 'gas' },
  { key: 'CH3(g)', name: 'methyl radical', id: 'C2229074', phase: 'gas' },
  { key: 'Cl(g)', name: 'chlorine atom', id: 'C22537151', phase: 'gas' },
  { key: 'ClO(g)', name: 'chlorine monoxide', id: 'C14989301', phase: 'gas' },
  { key: 'H(g)', name: 'hydrogen atom', id: 'C12385136', phase: 'gas' },
  { key: 'CaCO3(s)', name: 'calcite', id: 'C471341', phase: 'solid' },
  { key: 'CaO(s)', name: 'calcium oxide', id: 'C1305788', phase: 'solid' },
  { key: 'Fe2O3(s)', name: 'hematite', id: 'C1309371', phase: 'solid' },
  { key: 'Al2O3(s)', name: 'corundum', id: 'C1344281', phase: 'solid' },
  { key: 'NaCl(s)', name: 'sodium chloride', id: 'C7647145', phase: 'solid' },
  { key: 'Fe(s)', name: 'iron', id: 'C7439896', phase: 'solid' },
];

interface Row { quantity: string; value: Value; method: string; reference: string }
// When the reference column says "N/A" (e.g. NIST averages) the comment column names the basis ("Average of 6 values").
const refOf = (cells: string[]) => (cells[4] && cells[4] !== "N/A" ? cells[4] : `NIST: ${cells[5] ?? "N/A"}`.replace(/;.*$/, ""));

function webbookRows(html: string): Row[] {
  const out: Row[] = [];
  for (const tr of html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)) {
    const cells = [...tr[1].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)].map((c) => c[1].replace(/<[^>]+>/g, '').replace(/&#916;|&Delta;/g, 'Δ').replace(/&deg;/g, '°').replace(/&plusmn;/g, '±').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim());
    if (cells.length < 5) continue;
    const v = parsePm(cells[1]);
    if (!v || !/kJ\/mol|J\/mol\*K/.test(cells[2])) continue;
    out.push({ quantity: cells[0], value: v, method: cells[3], reference: refOf(cells) });
  }
  return out;
}

function pick(rows: Row[], re: RegExp): Row | null {
  const rs = rows.filter((r) => re.test(r.quantity));
  return rs.find((r) => /Review/.test(r.method) && r.value.uncertainty !== null) ?? rs.find((r) => /Review/.test(r.method)) ?? rs[0] ?? null;
}

async function webbook(ref: Map<string, SpeciesRecord>): Promise<SpeciesRecord[]> {
  const out: SpeciesRecord[] = [];
  const co2 = ref.get('CO2(g)')!.dfH!, h2o = ref.get('H2O(l)')!.dfH!;
  for (const s of WEBBOOK) {
    const mask = s.phase === 'gas' ? 1 : 2;
    const url = `https://webbook.nist.gov/cgi/cbook.cgi?ID=${s.id}&Units=SI&Mask=${mask}`;
    const html = await fetchText(url, { minIntervalMs: 5000, cacheKey: `webbook/${s.id}-${mask}.html` });
    const rows = webbookRows(html);
    const ph = s.phase;
    const H = pick(rows, new RegExp(`^ΔfH°${ph}$`));
    const S = pick(rows, s.phase === 'gas' ? /^S°gas(,1 bar)?$/ : new RegExp(`^S°${ph}(,1 bar)?$`));
    const src = (r: Row) => `NIST Chemistry WebBook (SRD 69): ${r.reference}`;
    let dfH: SpeciesRecord["dfH"] | undefined = H ? { ...H.value, source: src(H), method: H.method, reference: H.reference } : undefined;
    // CHO compounds without a ΔfH° row: derive it from the measured ΔcH° (products CO2(g) + H2O(l), CODATA values).
    const c = s.key.replace(/\(.*\)$/, '').match(/^C(\d*)H(\d*)O?(\d*)$/);
    if (!dfH && c) {
      const C = pick(rows, new RegExp(`^ΔcH°${ph}$`));
      if (C) {
        const nC = Number(c[1] || 1), nH = Number(c[2] || 1);
        const value = nC * co2.value + (nH / 2) * h2o.value - C.value.value;
        const u = C.value.uncertainty === null ? null : Math.sqrt(C.value.uncertainty ** 2 + (nC * (co2.uncertainty ?? 0)) ** 2 + ((nH / 2) * (h2o.uncertainty ?? 0)) ** 2);
        dfH = { value: Math.round(value * 100) / 100, uncertainty: u === null ? null : Math.round(u * 100) / 100, source: `Derived: ΔfH° = ${nC}·ΔfH°(CO₂,g) + ${nH / 2}·ΔfH°(H₂O,l) − ΔcH°; ΔcH° = ${C.value.value} ± ${C.value.uncertainty ?? '—'} kJ/mol (NIST WebBook: ${C.reference}); product values CODATA`, method: 'derived from ΔcH°', reference: C.reference, derived: true };
      }
    }
    if (!dfH && !S) { console.warn(`  no thermochemistry rows for ${s.key}`); continue; }
    out.push({ key: s.key, name: s.name, source: 'NIST WebBook', url, ...(dfH ? { dfH } : {}), ...(S ? { S: { ...S.value, source: src(S), method: S.method, reference: S.reference } } : {}) });
    console.log(`  ${s.key.padEnd(12)} ΔfH ${dfH ? `${dfH.value} ± ${dfH.uncertainty ?? '—'} (${dfH.reference}${dfH.derived ? ', derived' : ''})` : '—'} · S ${S ? `${S.value.value} (${S.reference})` : '—'}`);
  }
  return out;
}

/** Elements in their reference state: ΔfH° = 0 by definition (no entropy is invented). */
const REFERENCE_ELEMENTS = ['Fe(s)'];

const cod = await codata();
console.log(`CODATA: ${cod.length} species`);
const have = new Map(cod.map((r) => [r.key, r]));
const wb = (await webbook(have)).filter((r) => !have.has(r.key));
const defs: SpeciesRecord[] = REFERENCE_ELEMENTS.filter((k) => !have.has(k) && !wb.some((r) => r.key === k)).map((key) => ({ key, name: 'element in its reference state', dfH: { value: 0, uncertainty: 0, source: 'Definition: ΔfH° = 0 for an element in its reference state (IUPAC)' }, source: 'CODATA', url: 'https://goldbook.iupac.org/terms/view/S05925' }));
const species = [...cod, ...wb, ...defs].sort((a, b) => a.key.localeCompare(b.key));

writeDataset('datasets/chemistry/thermochemistry.json', {
  version: '1.0.0',
  standardState: { temperatureK: 298.15, pressurePa: 100000, ionConvention: 'ΔfH°(H⁺,aq) = 0, S°(H⁺,aq) = 0, unit molality' },
  units: { dfH: 'kJ/mol', S: 'J/(mol·K)', H298mH0: 'kJ/mol' },
  uncertaintyNote: 'CODATA uncertainties are the evaluators’ stated limits; WebBook uncertainties are those of the selected reference (missing = not stated).',
  species,
}, {
  dataset: 'thermochemistry',
  version: '1.0.0',
  records: species.length,
  sources: [
    { institution: 'CODATA Key Values for Thermodynamics (Cox, Wagman & Medvedev, Hemisphere 1989)', url: 'https://www.codata.info/resources/databases/key1.html', license: 'Published reference values; cite CODATA', notes: 'priority source' },
    { institution: 'NIST Chemistry WebBook, SRD 69 (Linstrom & Mallard, eds.)', url: 'https://webbook.nist.gov/chemistry/', license: 'NIST Standard Reference Data; cite per value', notes: `${wb.length} species absent from CODATA; per-value reference stored` },
  ],
  adapter: 'scripts/ingestion/thermochemistry.ts',
  warnings: wb.filter((r) => !r.dfH || !r.S).map((r) => `${r.key}: ${!r.dfH ? 'ΔfH°' : 'S°'} not available — shown as unknown`),
});
