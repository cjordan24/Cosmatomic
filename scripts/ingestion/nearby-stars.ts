/**
 * Phase 5, Gate 5.1 — nearby stars.
 *
 *  1. The 10 parsec sample in the Gaia era (Reylé et al. 2021, A&A 650, A201; catalogue update of
 *     25 Aug 2023, Reylé et al. 2023, Cool Stars 21). VizieR J/A+A/650/A201/tablea1. Every
 *     parallax, proper motion, radial velocity and spectral type carries its own bibcode.
 *  2. The Fifth Catalogue of Nearby Stars (Golovin et al. 2023, A&A 670, A19), VizieR
 *     J/A+A/670/A19/cns5, restricted to parallax ≥ 50 mas (d ≤ 20 pc). Its "resulting" G and G−RP
 *     (deblended Gaia EDR3, uncorrected EDR3, or converted from Hipparcos; flag kept) feed the
 *     observational HR diagram.
 *  3. E. Mamajek, "A Modern Mean Dwarf Stellar Color and Effective Temperature Sequence"
 *     (version 2022.04.16; much of it published as Table 5 of Pecaut & Mamajek 2013, ApJS 208, 9):
 *     spectral type → T_eff, log L, radius, M_G, colours and mass for luminosity class V.
 *
 * Access: the CDS Strasbourg servers were offline (cybersecurity incident notice, Nov 2026), so
 * VizieR is queried through the official CDS mirror at the Harvard–Smithsonian CfA
 * (vizier.cfa.harvard.edu, listed on cds.unistra.fr; no robots.txt restrictions), one request every
 * 2 s. VizieR rules of usage: free for scientific use with citation of the original authors and
 * publisher; both A&A papers are CC BY 4.0 (Crossref licence field). The Rochester table is a public
 * text file (robots.txt: no restrictions).
 *
 * Nothing is computed here: derived quantities (distance, absolute magnitude, Cartesian positions,
 * tangential velocity, calibrated T_eff) are computed at run time in src/modes/cosmic/star-systems.
 */
import { fetchText, writeDataset } from './lib/ingest.ts';

const MIRROR = 'https://vizier.cfa.harvard.edu/viz-bin/asu-tsv';
const OPTS = { minIntervalMs: 2000 };

function parseTsv(text: string): Record<string, string>[] {
  const lines = text.split('\n').filter((l) => l.length && !l.startsWith('#'));
  const head = lines[0].split('\t').map((s) => s.trim());
  // lines[1] = units, lines[2] = dashes
  return lines.slice(3).filter((l) => l.trim()).map((l) => {
    const cells = l.split('\t');
    return Object.fromEntries(head.map((h, i) => [h, (cells[i] ?? '').trim()]));
  });
}
const num = (s: string | undefined) => (s === undefined || s === '' ? null : Number.isFinite(Number(s)) ? Number(s) : null);
const str = (s: string | undefined) => (s === undefined || s === '' ? null : s);

// ------------------------------------------------------------------ 1. 10 pc sample
const tenUrl = `${MIRROR}?-source=J/A%2bA/650/A201/tablea1&-out.max=unlimited&-out.all`;
const tenRaw = parseTsv(await fetchText(tenUrl, { ...OPTS, cacheKey: 'vizier/reyle2021-tablea1.tsv' }));
const TYPE: Record<string, string> = { '*': 'star', LM: 'low-mass star', BD: 'brown dwarf', WD: 'white dwarf', Planet: 'exoplanet' };
const warnings10: string[] = [];
const ten = tenRaw.map((r) => {
  const t = r.ObjType.replace('?', '');
  if (!TYPE[t]) warnings10.push(`unknown ObjType “${r.ObjType}” for ${r.ObjName}`);
  return {
    seq: num(r.Seq), sys: num(r.Sys), system: r.Name, name: r.ObjName,
    type: TYPE[t] ?? 'unknown', typeUncertain: r.ObjType.endsWith('?'),
    ra: num(r.RAICRS), dec: num(r.DEICRS), epoch: num(r.Epoch),
    plx: num(r.plx), ePlx: num(r.e_plx), rPlx: str(r.r_plx),
    pmra: num(r.pmRA), ePmra: num(r.e_pmRA), pmdec: num(r.pmDE), ePmdec: num(r.e_pmDE), rPm: str(r.r_pmDE),
    rv: num(r.RV), eRv: num(r.e_RV), rRv: str(r.r_RV),
    spt: str(r.SpType), rSpt: str(r.r_SpType), sptMethod: str(r.SpMethod),
    gCode: num(r.GCode), G: num(r.Gmag), Gest: num(r.Gest), BP: num(r.GBPmag), RP: num(r.GRPmag),
    V: num(r.Vmag), J: num(r.Jmag), H: num(r.Hmag), Ks: num(r.Ksmag),
    rSys: str(r.r_Sys), nPlanets: num(r.Nexopl),
    gaia: str(r.GaiaEDR3), simbad: str(r.SIMBAD), common: str(r.Common), gj: str(r.GJ), hd: str(r.HD), hip: str(r.HIP),
    comment: str(r.Com),
  };
});
const counts = Object.entries(ten.reduce<Record<string, number>>((a, s) => ((a[s.type] = (a[s.type] ?? 0) + 1), a), {})).map(([k, v]) => `${k}: ${v}`).join(', ');
warnings10.push(`Object counts in this catalogue version: ${counts}.`);
warnings10.push('G_ESTIMATE (gCode 10/20) values are estimates the authors say should not be used for scientific purposes; they are shown as estimates and excluded from diagrams.');
warnings10.push('Planets inherit the host position and parallax (r_plx = “FROM:host”).');

writeDataset('datasets/astronomical/nearby-stars-10pc.json', { catalogue: 'J/A+A/650/A201/tablea1', version: 'update of 25 Aug 2023', objects: ten }, {
  dataset: 'nearby-stars-10pc', version: '2023-08-25', records: ten.length,
  sources: [
    { institution: 'Reylé, C. et al. (2021) A&A 650, A201 — The 10 parsec sample in the Gaia era', url: 'https://doi.org/10.1051/0004-6361/202140985', license: 'CC BY 4.0', notes: 'catalogue Table A.1, update of 25 Aug 2023 (Reylé et al. 2023, Cool Stars 21)' },
    { institution: 'CDS VizieR (mirror at Harvard–Smithsonian CfA)', url: tenUrl, license: 'VizieR rules of usage: free for scientific use with citation' },
  ],
  adapter: 'scripts/ingestion/nearby-stars.ts', warnings: warnings10,
});

// ------------------------------------------------------------------ 2. CNS5 within 20 pc
const COLS = 'CNS5,GJ,Comp,NComp,GaiaDR3,HIP,RAJ2000,DEJ2000,Epoch,plx,e_plx,r_plx,pmRA,pmDE,RV,Gmagr,e_Gmagr,(G-RP)r,e_(G-RP)r,f_(G-RP)r';
const cnsUrl = `${MIRROR}?-source=J/A%2bA/670/A19/cns5&plx=%3E%3D50&-out.max=unlimited&-out=${COLS}`;
const cnsRaw = parseTsv(await fetchText(cnsUrl, { ...OPTS, cacheKey: 'vizier/cns5-plx50.tsv' }));
const FIELDS = ['cns5', 'gj', 'comp', 'gaia', 'hip', 'ra', 'dec', 'epoch', 'plx', 'ePlx', 'rPlx', 'pmra', 'pmdec', 'rv', 'G', 'eG', 'GRP', 'eGRP', 'fGRP'] as const;
const cns = cnsRaw.map((r) => [
  num(r.CNS5), str(r.GJ), str(r.Comp), str(r.GaiaDR3), str(r.HIP), num(r.RAJ2000), num(r.DEJ2000), num(r.Epoch),
  num(r.plx), num(r.e_plx), str(r.r_plx), num(r.pmRA), num(r.pmDE), num(r.RV), num(r.Gmagr), num(r.e_Gmagr), num(r['(G-RP)r']), num(r['e_(G-RP)r']), num(r['f_(G-RP)r']),
]);
const minPlx = Math.min(...cns.map((c) => c[8] as number));
writeDataset('datasets/astronomical/cns5-20pc.json', { catalogue: 'J/A+A/670/A19/cns5', selection: 'plx >= 50 mas', fields: FIELDS, rows: cns }, {
  dataset: 'cns5-20pc', version: 'corrected version 13-Dec-2023', records: cns.length,
  sources: [
    { institution: 'Golovin, A. et al. (2023) A&A 670, A19 — The Fifth Catalogue of Nearby Stars (CNS5)', url: 'https://doi.org/10.1051/0004-6361/202244250', license: 'CC BY 4.0' },
    { institution: 'CDS VizieR (mirror at Harvard–Smithsonian CfA)', url: cnsUrl, license: 'VizieR rules of usage: free for scientific use with citation' },
  ],
  adapter: 'scripts/ingestion/nearby-stars.ts',
  warnings: [
    `Selection: parallax ≥ 50 mas (smallest kept ${minPlx} mas). Objects near 20 pc may scatter across the boundary within their parallax errors.`,
    'fGRP: 0 = deblended Gaia EDR3 G−RP, 1 = uncorrected EDR3 value, 2 = converted from Hipparcos (Golovin et al. 2023, Table 3 note a).',
    'Objects without Gaia or Hipparcos photometry (mostly cool brown dwarfs) have no resulting G and are absent from the colour–magnitude diagram.',
  ],
});

// ------------------------------------------------------------------ 3. Mamajek dwarf sequence
const mamUrl = 'https://www.pas.rochester.edu/~emamajek/EEM_dwarf_UBVIJHK_colors_Teff.txt';
const mamText = await fetchText(mamUrl, { minIntervalMs: 2000, cacheKey: 'mamajek/EEM_dwarf_UBVIJHK_colors_Teff.txt' });
const version = mamText.match(/Version\s+([\d.]+)/)?.[1] ?? 'unknown';
const lines = mamText.split('\n');
const h0 = lines.findIndex((l) => l.startsWith('#SpT'));
const h1 = lines.findIndex((l, i) => i > h0 && l.startsWith('#SpT'));
const header = lines[h0].replace(/^#/, '').trim().split(/\s+/);
const prelim: string[] = [];
const mv = (s: string, spt: string, col: string) => {
  if (!s || /^\.+$/.test(s)) return null;
  if (s.includes('*')) prelim.push(`${spt} ${col}`);
  const v = Number(s.replace('*', ''));
  return Number.isFinite(v) ? v : null;
};
const seq = lines.slice(h0 + 1, h1).filter((l) => l.trim() && !l.startsWith('#')).map((l) => {
  const c = l.trim().split(/\s+/);
  const n0 = prelim.length;
  const get = (col: string) => mv(c[header.indexOf(col)], c[0], col);
  const row = { spt: c[0], Teff: get('Teff'), logL: get('logL'), R: get('R_Rsun'), Mv: get('Mv'), BpRp: get('Bp-Rp'), GRp: get('G-Rp'), MG: get('M_G'), Msun: get('Msun') };
  return { ...row, preliminary: prelim.slice(n0).map((x) => x.split(' ')[1]) };
});
writeDataset('datasets/astronomical/mamajek-dwarf-sequence.json', { version, luminosityClass: 'V', rows: seq }, {
  dataset: 'mamajek-dwarf-sequence', version, records: seq.length,
  sources: [
    { institution: 'E. Mamajek, A Modern Mean Dwarf Stellar Color and Effective Temperature Sequence (University of Rochester)', url: mamUrl, notes: `version ${version}` },
    { institution: 'Pecaut, M. J. & Mamajek, E. E. (2013) ApJS 208, 9', url: 'https://doi.org/10.1088/0067-0049/208/1/9', notes: 'the published reference the table asks to be cited' },
  ],
  adapter: 'scripts/ingestion/nearby-stars.ts',
  warnings: [
    'Mean values for luminosity class V (dwarfs) only; giants, subgiants and white dwarfs are not covered.',
    ...(prelim.length ? [`Values marked * (very preliminary per the author) kept but flagged: ${prelim.join(', ')}`] : []),
  ],
});
