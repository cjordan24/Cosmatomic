/**
 * Adapter: NIST Atomic Spectra Database (ASD) — lines.
 *   https://physics.nist.gov/PhysRefData/ASD/lines_form.html  (CGI: /cgi-bin/ASD/lines1.pl, CSV output)
 * Kramida, A., Ralchenko, Yu., Reader, J., and NIST ASD Team, NIST Atomic Spectra Database.
 * US Government work (public domain). No robots.txt restrictions; queried at 1 request / 2 s.
 *
 * Range 200–1000 nm, VACUUM wavelengths (consistent with the app's computed hydrogen spectra).
 * Strongest MAX_LINES lines per spectrum + all forbidden M1/E2 lines from levels below 50 000 cm⁻¹.
 * Observed wavelength preferred; Ritz (from energy levels) used when no observed value exists
 * (e.g. the forbidden [O III] 495.9/500.7 nm nebular lines) — flagged per line.
 * NIST relative intensities depend on the light source and are NOT comparable between spectra.
 * Output: datasets/atomic/spectra-nist.json
 */
import { fetchText, writeDataset } from './lib/ingest.ts';

const SPECTRA = [
  'H I', 'D I', 'He I', 'He II', 'Li I', 'C I', 'C II', 'N I', 'N II', 'O I', 'O III', 'Ne I', 'Na I', 'Mg I', 'Mg II', 'Al I', 'Si I', 'S I',
  'Ar I', 'K I', 'Ca I', 'Ca II', 'Ti I', 'Fe I', 'Fe II', 'Ni I', 'Cu I', 'Zn I', 'Sr I', 'Ba I', 'Kr I', 'Xe I', 'Hg I',
];
const MAX_LINES = 150;
const RANGE = { low: 200, high: 1000 };

const url = (sp: string) => `https://physics.nist.gov/cgi-bin/ASD/lines1.pl?spectra=${encodeURIComponent(sp).replace(/%20/g, '+')}&low_w=${RANGE.low}&upp_w=${RANGE.high}&unit=1&format=2&line_out=0&en_unit=0&output=0&show_obs_wl=1&show_calc_wl=1&show_av=1&A_out=0&intens_out=on&allowed_out=1&forbid_out=1&enrg_out=on&conf_out=on&term_out=on&J_out=on`;

/** NIST CSV cells look like ="589.158" — strip the Excel formula wrapper. */
const cell = (s: string | undefined) => (s ?? '').replace(/^"?=?"*|"*$/g, '').replace(/""/g, '"').trim();
function splitCsv(line: string): string[] {
  const out: string[] = []; let cur = '', q = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') { if (q && line[i + 1] === '"') { cur += '"'; i++; } else q = !q; }
    else if (ch === ',' && !q) { out.push(cur); cur = ''; }
    else cur += ch;
  }
  out.push(cur);
  return out.map(cell);
}
const num = (s: string) => { const m = s.match(/^[+-]?\d*\.?\d+(e[+-]?\d+)?/i); return m ? Number(m[0]) : null; };

export interface NistLine {
  wl: number; ritz: boolean; intensity: number | null; intensityRaw: string; A: number | null; acc: string;
  Ei: number | null; Ek: number | null; lower: string; upper: string; type: string;
}

async function main() {
  const warnings: string[] = [];
  const spectra: Record<string, { lines: NistLine[]; totalInRange: number }> = {};
  for (const sp of SPECTRA) {
    process.stdout.write(`\r  ${sp.padEnd(8)}`);
    const text = await fetchText(url(sp), { minIntervalMs: 2000, cacheKey: `nist/asd-${sp.replace(' ', '_')}-${RANGE.low}-${RANGE.high}.csv`, maxBytes: 8 * 1024 * 1024 });
    if (text.trimStart().startsWith('<')) { warnings.push(`${sp}: ASD returned no CSV (no lines or input error)`); continue; }
    const rows = text.split('\n').filter(Boolean);
    const head = splitCsv(rows[0]);
    const ix = (name: string) => head.findIndex((h) => h.startsWith(name));
    const [iObs, iRitz, iInt, iA, iAcc, iEi, iEk, iCi, iTi, iJi, iCk, iTk, iJk, iType] =
      ['obs_wl_vac', 'ritz_wl_vac', 'intens', 'Aki', 'Acc', 'Ei', 'Ek', 'conf_i', 'term_i', 'J_i', 'conf_k', 'term_k', 'J_k', 'Type'].map(ix);
    if (iObs < 0 || iRitz < 0) throw new Error(`${sp}: unexpected header ${head.join(',')}`);
    const lines: NistLine[] = [];
    for (const r of rows.slice(1)) {
      const c = splitCsv(r);
      const obs = num(c[iObs] ?? ''), ritz = num(c[iRitz] ?? '');
      const wl = obs ?? ritz;
      if (wl === null) continue;
      lines.push({
        wl, ritz: obs === null, intensity: num(c[iInt] ?? ''), intensityRaw: c[iInt] ?? '', A: num(c[iA] ?? ''), acc: c[iAcc] ?? '',
        Ei: num(c[iEi] ?? ''), Ek: num(c[iEk] ?? ''),
        lower: [c[iCi], c[iTi], c[iJi]].filter(Boolean).join(' '), upper: [c[iCk], c[iTk], c[iJk]].filter(Boolean).join(' '), type: c[iType] ?? '',
      });
    }
    // keep the strongest lines: by NIST relative intensity, then by transition probability
    const ranked = [...lines].sort((a, b) => (b.intensity ?? -1) - (a.intensity ?? -1) || (b.A ?? -1) - (a.A ?? -1));
    // Forbidden (M1/E2) lines from low-lying metastable levels have tiny A and no lab intensity, yet they are the
    // diagnostic nebular/auroral lines of astrophysics ([O III] 495.9/500.7, [N II] 654.8/658.3 nm) — always keep them.
    const forbidden = lines.filter((l) => /M1|E2/.test(l.type) && (l.Ek ?? Infinity) < 50_000);
    const keep = [...new Set([...ranked.slice(0, MAX_LINES), ...forbidden])].sort((a, b) => a.wl - b.wl);
    spectra[sp] = { lines: keep, totalInRange: lines.length };
  }
  process.stdout.write('\n');
  writeDataset('datasets/atomic/spectra-nist.json', { range_nm: RANGE, wavelengths: 'vacuum', note: 'Relative intensities are source-dependent and not comparable between spectra.', spectra }, {
    dataset: 'spectra-nist', version: '1', records: Object.keys(spectra).length, adapter: 'scripts/ingestion/nist-asd.ts', warnings,
    sources: [{ institution: 'NIST Atomic Spectra Database (ver. 5.x) — Kramida, Ralchenko, Reader & NIST ASD Team', url: 'https://physics.nist.gov/asd', license: 'US Government work (public domain)', notes: `Lines ${RANGE.low}–${RANGE.high} nm (vacuum), strongest ${MAX_LINES} per spectrum by relative intensity then A_ki. Ritz wavelengths used when no observed value exists.` }],
  }, 6 * 1024 * 1024);
}

main().catch((e) => { console.error(e); process.exit(1); });
