/**
 * Phase 6, Gate 6.4 — SPARC rotation curves and Newtonian mass models of 175 disc galaxies.
 *
 *   node --experimental-strip-types scripts/ingestion/sparc.ts
 *
 * Source: Lelli, F., McGaugh, S. S. and Schombert, J. M. (2016) SPARC: mass models for 175 disk galaxies
 * with Spitzer photometry and accurate rotation curves. AJ 152, 157. Files from the SPARC website
 * (https://astroweb.case.edu/SPARC/; robots.txt only disallows /VirgoSurvey/). The website asks users
 * to cite the master paper; original rotation-curve references are kept per galaxy (Table 1 "Ref.").
 *
 *   SPARC_Lelli2016c.mrt      Table 1: galaxy sample (type, distance, inclination, L[3.6], Vflat, quality …)
 *   MassModels_Lelli2016c.mrt Table 2: R, Vobs, e_Vobs, Vgas, Vdisk, Vbul per radius
 *
 * Both are "machine-readable tables" (MRT) whose rows split cleanly on whitespace. Vgas includes the factor 1.33 for helium; Vdisk and Vbul are for M/L = 1 at 3.6 µm (Table 2
 * notes). Nothing is computed here.
 */
import { fetchText, writeDataset } from './lib/ingest.ts';

const BASE = 'https://astroweb.case.edu/SPARC/';
const opts = (f: string) => ({ minIntervalMs: 3000, cacheKey: `sparc/${f}`, maxBytes: 5 * 1024 * 1024 });

/**
 * Parse an MRT data block by whitespace. The rows are not aligned exactly to the byte ranges in the
 * headers (first attempt misread them), but no field contains spaces (galaxy names and reference
 * lists are single tokens), so each row must split into exactly cols.length tokens; anything else throws.
 */
function parseMrt(text: string, cols: [string, 'A' | 'F' | 'I'][]) {
  const lines = text.split('\n');
  let start = 0;
  lines.forEach((l, i) => { if (/^-{20,}/.test(l)) start = i + 1; });
  return lines.slice(start).filter((l) => l.trim()).map((l) => {
    const tok = l.trim().split(/\s+/);
    if (tok.length !== cols.length) throw new Error(`expected ${cols.length} fields, got ${tok.length}: ${l}`);
    return Object.fromEntries(cols.map(([k, t], i) => [k, t === 'A' ? tok[i] : Number(tok[i])])) as Record<string, string | number | null>;
  });
}

const t1 = await fetchText(BASE + 'SPARC_Lelli2016c.mrt', opts('SPARC_Lelli2016c.mrt'));
const t2 = await fetchText(BASE + 'MassModels_Lelli2016c.mrt', opts('MassModels_Lelli2016c.mrt'));

const gal = parseMrt(t1, [
  ['name', 'A'], ['T', 'I'], ['D', 'F'], ['eD', 'F'], ['fD', 'I'], ['inc', 'F'], ['eInc', 'F'],
  ['L36', 'F'], ['eL36', 'F'], ['Reff', 'F'], ['SBeff', 'F'], ['Rdisk', 'F'], ['SBdisk', 'F'],
  ['MHI', 'F'], ['RHI', 'F'], ['Vflat', 'F'], ['eVflat', 'F'], ['Q', 'I'], ['ref', 'A'],
]);
const pts = parseMrt(t2, [
  ['name', 'A'], ['D', 'F'], ['R', 'F'], ['Vobs', 'F'], ['eV', 'F'], ['Vgas', 'F'], ['Vdisk', 'F'], ['Vbul', 'F'], ['SBdisk', 'F'], ['SBbul', 'F'],
]);

// reference key → citation, from the Table 1 notes
const refNotes = Object.fromEntries([...t1.matchAll(/^ (\w{4}) = (.+)$/gm)].map((m) => [m[1], m[2].trim()]));

const warnings: string[] = ['Vflat = 0 in Table 1 means no flat part was measured; stored as null.'];
type Galaxy = Record<string, string | number | null | string[]> & { name: string; D: number; refs: string[] };
const galaxies: Galaxy[] = gal.map(({ ref, ...g }) => ({
  ...g, name: String(g.name), D: Number(g.D),
  Vflat: g.Vflat === 0 ? null : g.Vflat, eVflat: g.Vflat === 0 ? null : g.eVflat,
  refs: String(ref).split(',').map((k) => k.trim()).filter(Boolean),
}));
const curves: Record<string, number[][]> = {};
for (const p of pts) (curves[p.name as string] ??= []).push([p.R, p.Vobs, p.eV, p.Vgas, p.Vdisk, p.Vbul] as number[]);

// integrity: every galaxy has a curve, distances agree between the tables
for (const g of galaxies) {
  if (!curves[g.name as string]) throw new Error(`no mass model for ${g.name}`);
  const d = pts.find((p) => p.name === g.name)!.D as number;
  if (Math.abs(d - (g.D as number)) > 0.011) warnings.push(`${g.name}: distance ${d} in Table 2 vs ${g.D} in Table 1`);
}
if (galaxies.length !== 175) throw new Error(`expected 175 galaxies, got ${galaxies.length}`);
const missingRefs = new Set(galaxies.flatMap((g) => g.refs).filter((k) => !refNotes[k]));
if (missingRefs.size) warnings.push(`reference keys without a note: ${[...missingRefs].join(', ')}`);

writeDataset('datasets/astronomical/sparc-galaxies.json', {
  version: 'SPARC (Lelli, McGaugh & Schombert 2016)',
  curveColumns: ['R (kpc)', 'Vobs (km/s)', 'e_Vobs (km/s)', 'Vgas (km/s)', 'Vdisk (km/s, M/L = 1)', 'Vbul (km/s, M/L = 1)'],
  notes: {
    T: '0 = S0, 1 = Sa, 2 = Sab, 3 = Sb, 4 = Sbc, 5 = Sc, 6 = Scd, 7 = Sd, 8 = Sdm, 9 = Sm, 10 = Im, 11 = BCD',
    fD: '1 = Hubble flow (H0 = 73 km/s/Mpc, Virgo-centric infall corrected), 2 = TRGB, 3 = Cepheids, 4 = Ursa Major cluster, 5 = supernovae',
    Q: '1 = high, 2 = medium, 3 = low',
    eV: 'random error from non-circular motions and asymmetries; excludes inclination systematics',
    Vgas: 'includes a factor 1.33 for helium',
    units: 'D Mpc; inc deg; L36 10^9 L☉; Reff, Rdisk, RHI kpc; SB L☉/pc²; MHI 10^9 M☉; Vflat km/s',
  },
  references: refNotes,
  galaxies,
  curves,
}, {
  dataset: 'sparc-galaxies',
  version: '2016',
  records: galaxies.length,
  sources: [{ institution: 'SPARC (Lelli, McGaugh & Schombert 2016, AJ 152, 157), Case Western Reserve University', url: 'https://astroweb.case.edu/SPARC/', license: 'Free to use with citation of the SPARC master paper (website)', notes: 'Table 1 (galaxy sample) and Table 2 (Newtonian mass models)' }],
  adapter: 'scripts/ingestion/sparc.ts',
  warnings,
});
