/**
 * Electromagnetic band conventions (Phase 4, Gate 4.6) → datasets/spectral/em-bands.json
 *
 *   node --experimental-strip-types scripts/ingestion/em-bands.ts
 *
 * Every band edge below was transcribed by hand from the source document itself (read 2026-11-26):
 *
 *  ITU-R V.431-9 (10/2025) "Nomenclature of the frequency and wavelength bands used in
 *    telecommunications", Tables 1 and 2 (official .docx/.pdf from itu.int/rec/R-REC-V.431).
 *    Band N spans 0.3·10^N … 3·10^N Hz, lower limit EXCLUSIVE, upper limit INCLUSIVE (Table 1 header).
 *    Bands −1…2 come from Table 2 ("may be extended", Note 3); 3…15 from Table 1.
 *  CIE S 017:2020 International Lighting Vocabulary, terms 17-21-003 … 17-21-011 (free e-ILV,
 *    cie.co.at/eilvterm/…): IR-A/B/C, UV-A/B/C; the visible range has no precise limits.
 *    The CIE text says "covering the range from … to …" without stating which edge is inclusive.
 *  ISO 21348:2007 solar irradiance spectral categories — summary table published by Space
 *    Environment Technologies (spacewx.com/pdf/SET_21348_2004.pdf; Internet Archive copy of
 *    2016-03-04, sha256 95563f76…); rendered and read as an image. Wavelengths in nm,
 *    lower limit INCLUSIVE, upper limit EXCLUSIVE ("a ≤ λ < b").
 *  Rogalski & Chrzanowski (2014) Metrol. Meas. Syst. 21(4) 565–618, Table 1 "Division of infrared
 *    radiation" (NIR/SWIR/MWIR/LWIR/VLWIR/FIR/SubMM) — the detector-based scheme "used by the
 *    military community"; edges in µm, inclusivity not stated.
 *  ISO 20473:2007 (IR-A… near/mid/far infrared): NOT transcribed. The standard is sold by ISO and
 *    iso.org blocks automated access (Cloudflare challenge); values are not copied from secondary
 *    sources, so the convention is listed with bands = null and shown as "not available".
 *
 * Representative examples are either computed at run time from constants (Derived: value null,
 * `compute` names the calculation) or point to a sourced record
 * already in the app (NIST ASD lines, IAU nominal Sun temperature, Fixsen 2009 CMB temperature,
 * ITU-R V.431 Table 3 broadcasting band II, the Rogalski & Chrzanowski atmospheric windows).
 */
import { writeDataset } from './lib/ingest.ts';

type Q = 'frequency' | 'wavelength';
interface Band { id: string; symbol: string | null; name: string; lo: number; hi: number; level: number; number?: number; note?: string }
interface Convention {
  id: string; name: string; short: string; quantity: Q; unit: 'Hz' | 'nm';
  /** which edges belong to the band: '(]' lower exclusive / upper inclusive; '[)' the reverse; 'unstated' = the source does not say */
  edges: '(]' | '[)' | 'unstated';
  scope: string; sources: string[]; url: string; transcription: string; status: 'verified' | 'not-available';
  bands: Band[] | null; notes: string[];
}

// ---------------------------------------------------------------- ITU-R V.431-9
const ITU_NAMES: Record<number, [string | null, string | null, string, 1 | 2]> = {
  [-1]: [null, null, 'gigametric waves', 2],
  0: ['TLF', 'Tremendously low frequency', 'sub-gigametric waves', 2],
  1: ['ELF', 'Extremely low frequency', 'super-megametric waves', 2],
  2: ['SLF', 'Super low frequency', 'megametric waves', 2],
  3: ['ULF', 'Ultra low frequency', 'sub-megametric waves', 1],
  4: ['VLF', 'Very low frequency', 'super-kilometric waves', 1],
  5: ['LF', 'Low frequency', 'kilometric waves', 1],
  6: ['MF', 'Medium frequency', 'hectometric waves', 1],
  7: ['HF', 'High frequency', 'decametric waves', 1],
  8: ['VHF', 'Very high frequency', 'metric waves', 1],
  9: ['UHF', 'Ultra high frequency', 'decimetric waves', 1],
  10: ['SHF', 'Super high frequency', 'centimetric waves', 1],
  11: ['EHF', 'Extremely high frequency', 'millimetric waves', 1],
  12: ['THF', 'Tremendously high frequency', 'sub-millimetric waves', 1],
  13: [null, null, 'super-micrometric waves', 1],
  14: [null, null, 'micrometric waves', 1],
  15: [null, null, 'sub-micrometric waves', 1],
};
const itu: Band[] = [];
for (let N = -1; N <= 15; N++) {
  const [sym, name, metric, table] = ITU_NAMES[N];
  // 0.3·10^N and 3·10^N written as exact decimal products to avoid 0.30000000000000004
  itu.push({ id: `itu-${N}`, symbol: sym, name: name ?? `Band ${N}`, lo: 3 * 10 ** (N - 1), hi: 3 * 10 ** N, level: 0, number: N, note: `${metric}; Table ${table}${table === 2 ? ' (extension, Note 3)' : ''}` });
}

// ---------------------------------------------------------------- CIE S 017:2020
const cie: Band[] = [
  { id: 'cie-uv-c', symbol: 'UV-C', name: 'UV-C', lo: 100, hi: 280, level: 1, note: 'term 17-21-011' },
  { id: 'cie-uv-b', symbol: 'UV-B', name: 'UV-B', lo: 280, hi: 315, level: 1, note: 'term 17-21-010' },
  { id: 'cie-uv-a', symbol: 'UV-A', name: 'UV-A', lo: 315, hi: 400, level: 1, note: 'term 17-21-009' },
  { id: 'cie-ir-a', symbol: 'IR-A', name: 'IR-A', lo: 780, hi: 1400, level: 1, note: 'term 17-21-005' },
  { id: 'cie-ir-b', symbol: 'IR-B', name: 'IR-B', lo: 1400, hi: 3000, level: 1, note: 'term 17-21-006' },
  { id: 'cie-ir-c', symbol: 'IR-C', name: 'IR-C', lo: 3000, hi: 1e6, level: 1, note: 'term 17-21-007' },
];

// ---------------------------------------------------------------- ISO 21348 (SET summary table)
const iso: Band[] = [
  { id: 'iso-gamma', symbol: null, name: 'Gamma-rays', lo: 1e-5, hi: 1e-3, level: 0 },
  { id: 'iso-xray', symbol: null, name: 'X-rays (hard)', lo: 1e-3, hi: 0.1, level: 0, note: 'listed as the X-ray category, “Hard X-rays”' },
  { id: 'iso-xuv', symbol: 'XUV', name: 'Soft X-rays', lo: 0.1, hi: 10, level: 1 },
  { id: 'iso-uv', symbol: 'UV', name: 'Ultraviolet', lo: 100, hi: 400, level: 0 },
  { id: 'iso-vuv', symbol: 'VUV', name: 'Vacuum ultraviolet', lo: 10, hi: 200, level: 1 },
  { id: 'iso-euv', symbol: 'EUV', name: 'Extreme ultraviolet', lo: 10, hi: 121, level: 1 },
  { id: 'iso-lya', symbol: 'H Lyman-α', name: 'Hydrogen Lyman-alpha', lo: 121, hi: 122, level: 1 },
  { id: 'iso-fuv', symbol: 'FUV', name: 'Far ultraviolet', lo: 122, hi: 200, level: 1 },
  { id: 'iso-uvc', symbol: 'UVC', name: 'Ultraviolet C', lo: 100, hi: 280, level: 1 },
  { id: 'iso-muv', symbol: 'MUV', name: 'Middle ultraviolet', lo: 200, hi: 300, level: 1 },
  { id: 'iso-uvb', symbol: 'UVB', name: 'Ultraviolet B', lo: 280, hi: 315, level: 1 },
  { id: 'iso-nuv', symbol: 'NUV', name: 'Near ultraviolet', lo: 300, hi: 400, level: 1 },
  { id: 'iso-uva', symbol: 'UVA', name: 'Ultraviolet A', lo: 315, hi: 400, level: 1 },
  { id: 'iso-vis', symbol: 'VIS', name: 'Visible (“optical”)', lo: 380, hi: 760, level: 0 },
  { id: 'iso-purple', symbol: null, name: 'purple', lo: 360, hi: 450, level: 2 },
  { id: 'iso-blue', symbol: null, name: 'blue', lo: 450, hi: 500, level: 2 },
  { id: 'iso-green', symbol: null, name: 'green', lo: 500, hi: 570, level: 2 },
  { id: 'iso-yellow', symbol: null, name: 'yellow', lo: 570, hi: 591, level: 2 },
  { id: 'iso-orange', symbol: null, name: 'orange', lo: 591, hi: 610, level: 2 },
  { id: 'iso-red', symbol: null, name: 'red', lo: 610, hi: 760, level: 2 },
  { id: 'iso-ir', symbol: 'IR', name: 'Infrared', lo: 760, hi: 1e6, level: 0 },
  { id: 'iso-ir-a', symbol: 'IR-A', name: 'Near infrared', lo: 760, hi: 1400, level: 1 },
  { id: 'iso-ir-b', symbol: 'IR-B', name: 'Middle infrared', lo: 1400, hi: 3000, level: 1 },
  { id: 'iso-ir-c', symbol: 'IR-C', name: 'Far infrared', lo: 3000, hi: 1e6, level: 1 },
  { id: 'iso-microwave', symbol: null, name: 'Microwave', lo: 1e6, hi: 1.5e7, level: 0 },
  { id: 'iso-radio', symbol: null, name: 'Radio', lo: 1e5, hi: 1e11, level: 0, note: 'as published, the radio category (0.1 mm – 100 m) overlaps the microwave category' },
  { id: 'iso-ehf', symbol: 'EHF', name: 'Extremely high frequency', lo: 1e6, hi: 1e7, level: 1 },
  { id: 'iso-shf', symbol: 'SHF', name: 'Super-high frequency', lo: 1e7, hi: 1e8, level: 1 },
  { id: 'iso-uhf', symbol: 'UHF', name: 'Ultra-high frequency', lo: 1e8, hi: 1e9, level: 1 },
  { id: 'iso-vhf', symbol: 'VHF', name: 'Very-high frequency', lo: 1e9, hi: 1e10, level: 1 },
  { id: 'iso-hf', symbol: 'HF', name: 'High frequency', lo: 1e10, hi: 1e11, level: 1 },
];

// ---------------------------------------------------------------- Rogalski & Chrzanowski (2014) Table 1
const um = (x: number) => x * 1000;
const rog: Band[] = [
  { id: 'rc-nir', symbol: 'NIR', name: 'Near infrared', lo: um(0.78), hi: um(1), level: 0 },
  { id: 'rc-swir', symbol: 'SWIR', name: 'Short-wavelength IR', lo: um(1), hi: um(3), level: 0 },
  { id: 'rc-mwir', symbol: 'MWIR', name: 'Medium-wavelength IR', lo: um(3), hi: um(6), level: 0 },
  { id: 'rc-lwir', symbol: 'LWIR', name: 'Long-wavelength IR', lo: um(6), hi: um(15), level: 0 },
  { id: 'rc-vlwir', symbol: 'VLWIR', name: 'Very-long-wavelength IR', lo: um(15), hi: um(30), level: 0 },
  { id: 'rc-fir', symbol: 'FIR', name: 'Far infrared', lo: um(30), hi: um(100), level: 0 },
  { id: 'rc-submm', symbol: 'SubMM', name: 'Submillimetre', lo: um(100), hi: um(1000), level: 0 },
];

const conventions: Convention[] = [
  { id: 'itu-r-v431', name: 'ITU-R V.431-9 radio bands', short: 'ITU-R V.431', quantity: 'frequency', unit: 'Hz', edges: '(]', scope: 'Telecommunications frequency bands, 0.03 Hz – 3000 THz',
    sources: ['itu-r-v431'], url: 'https://www.itu.int/rec/R-REC-V.431-9-202510-I/en', transcription: 'Tables 1–2 of the official Recommendation (docx text), 2026-11-26', status: 'verified', bands: itu,
    notes: ['Band N extends from 0.3·10^N to 3·10^N Hz (Note 1).', 'Bands −1 to 2 are the Table 2 extension; bands 13–15 have no symbol.', 'Metric names (e.g. “metric waves”) use the nominal c ≈ 3×10⁸ m/s; the wavelengths shown here use exact c, so 300 MHz is 0.9993 m.'] },
  { id: 'cie-s017', name: 'CIE S 017:2020 (ILV) UV and IR', short: 'CIE ILV', quantity: 'wavelength', unit: 'nm', edges: 'unstated', scope: 'Optical radiation: ultraviolet and infrared subdivisions',
    sources: ['cie-s017-2020'], url: 'https://cie.co.at/eilvterm/17-21-004', transcription: 'e-ILV terms 17-21-003 … 17-21-011, 2026-11-26', status: 'verified', bands: cie,
    notes: ['Visible radiation has no precise limits: the lower limit is generally taken between 360 and 400 nm and the upper between 760 and 830 nm (17-21-003, Note 1).', 'Optical radiation spans the transition to X-rays (λ ≈ 1 nm) to the transition to radio waves (λ ≈ 1 mm) (17-21-002).', 'CIE notes that “near/middle/far” infrared and ultraviolet borders vary with the application.'] },
  { id: 'iso-21348', name: 'ISO 21348 solar irradiance spectral categories', short: 'ISO 21348', quantity: 'wavelength', unit: 'nm', edges: '[)', scope: 'Gamma-rays to radio, defined for solar irradiance work',
    sources: ['iso-21348'], url: 'https://web.archive.org/web/20160304091835/http://www.spacewx.com/pdf/SET_21348_2004.pdf', transcription: 'SET summary table, page 1, read as a rendered image, 2026-11-26', status: 'verified', bands: iso,
    notes: ['Sub-categories overlap by design (e.g. UVC 100–280 nm and MUV 200–300 nm).', 'Its infrared starts at 760 nm, while CIE IR-A starts at 780 nm: conventions differ.', 'The microwave letter bands (W … P) of the same table are not bundled.'] },
  { id: 'rogalski-ir', name: 'Detector-based IR scheme (NIR / SWIR / MWIR / LWIR)', short: 'NIR–LWIR', quantity: 'wavelength', unit: 'nm', edges: 'unstated', scope: 'Infrared imaging/detector industry usage',
    sources: ['rogalski-chrzanowski-2014'], url: 'https://doi.org/10.2478/mms-2014-0057', transcription: 'Table 1 of the article PDF text, 2026-11-26', status: 'verified', bands: rog,
    notes: ['The edges follow common detector cut-offs: Si (1 µm), PbS/InGaAs (3 µm), InSb/PbSe/PtSi (6 µm), HgCdTe (15 µm).', 'Atmospheric windows used in thermal imaging: 3–5 µm and 8–14 µm.'] },
  { id: 'iso-20473', name: 'ISO 20473 infrared (near / mid / far)', short: 'ISO 20473', quantity: 'wavelength', unit: 'nm', edges: 'unstated', scope: 'Optics and photonics spectral bands',
    sources: [], url: 'https://www.iso.org/search.html?q=20473', transcription: 'not transcribed', status: 'not-available', bands: null,
    notes: ['The standard is sold by ISO and iso.org blocks automated access, so its band edges could not be read from the document. They are not copied from secondary sources, so nothing is shown.'] },
];

// ---------------------------------------------------------------- representative examples
interface Example { id: string; label: string; kind: 'line' | 'band' | 'blackbody-peak' | 'derived'; region: string; value: number | null; compute?: 'lyman-alpha' | 'annihilation'; unit: 'nm' | 'Hz' | 'eV' | 'K'; hi?: number; detail: string; sources: string[]; provenance: 'observed' | 'derived' }
const examples: Example[] = [
  { id: 'fm-band-ii', label: 'FM broadcasting (band II, Region 2)', kind: 'band', region: 'radio', value: 88e6, hi: 108e6, unit: 'Hz', detail: 'ITU-R V.431-9 Table 3: 87.5–108 MHz in Region 1, 88–108 MHz in Region 2, 87–108 MHz in Region 3', sources: ['itu-r-v431'], provenance: 'observed' },
  { id: 'cmb-peak', label: 'Cosmic microwave background (peak, per frequency)', kind: 'blackbody-peak', region: 'microwave', value: 2.72548, unit: 'K', detail: 'T = 2.72548 ± 0.00057 K (Fixsen 2009); peak from Wien’s frequency law ν = 2.8214 kT/h', sources: ['fixsen-2009', 'codata-2018'], provenance: 'derived' },
  { id: 'ir-window-mwir', label: 'Atmospheric window 3–5 µm', kind: 'band', region: 'infrared', value: 3000, hi: 5000, unit: 'nm', detail: 'Rogalski & Chrzanowski (2014): MWIR thermal-imaging window', sources: ['rogalski-chrzanowski-2014'], provenance: 'observed' },
  { id: 'ir-window-lwir', label: 'Atmospheric window 8–14 µm', kind: 'band', region: 'infrared', value: 8000, hi: 14000, unit: 'nm', detail: 'Rogalski & Chrzanowski (2014): LWIR thermal-imaging window', sources: ['rogalski-chrzanowski-2014'], provenance: 'observed' },
  { id: 'sun-peak', label: 'Sun, 5772 K blackbody (peak, per wavelength)', kind: 'blackbody-peak', region: 'visible', value: 5772, unit: 'K', detail: 'IAU 2015 B3 nominal T_eff; peak from Wien’s law λ = b/T. The real solar spectrum is not a perfect blackbody.', sources: ['iau-2015-b3', 'codata-2018'], provenance: 'derived' },
  { id: 'na-d', label: 'Sodium D lines (Na I)', kind: 'line', region: 'visible', value: 589.1583264, hi: 589.7558147, unit: 'nm', detail: 'NIST ASD vacuum wavelengths 589.158 and 589.756 nm', sources: ['nist-asd'], provenance: 'observed' },
  { id: 'hg-254', label: 'Mercury 254 nm line (Hg I)', kind: 'line', region: 'ultraviolet', value: 253.7283, unit: 'nm', detail: 'NIST ASD vacuum wavelength 253.7283 nm (6s² ¹S₀ – 6s6p ³P₁), the germicidal-lamp line', sources: ['nist-asd'], provenance: 'observed' },
  { id: 'lyman-alpha', label: 'Hydrogen Lyman-α', kind: 'derived', region: 'ultraviolet', value: null, compute: 'lyman-alpha', unit: 'nm', detail: 'Computed from the reduced-mass Rydberg constant (n = 2 → 1, fine structure neglected); ISO 21348 gives it its own category, 121–122 nm', sources: ['codata-2018', 'iso-21348'], provenance: 'derived' },
  { id: 'annihilation', label: 'Electron–positron annihilation photon', kind: 'derived', region: 'gamma', value: null, compute: 'annihilation', unit: 'eV', detail: 'E = m_e c² (CODATA) for each of the two photons when the pair annihilates at rest. Physicists call it a gamma ray because of its origin, but ISO 21348 classifies by wavelength alone, and this photon (λ = h/m_e c, the Compton wavelength) falls in its hard X-ray category (1 pm – 0.1 nm)', sources: ['codata-2018'], provenance: 'derived' },
];

writeDataset('datasets/spectral/em-bands.json', { version: 1, conventions, examples }, {
  dataset: 'em-bands', version: '1.0.0', records: conventions.length + examples.length,
  sources: [
    { institution: 'ITU Radiocommunication Sector — Recommendation ITU-R V.431-9 (10/2025)', url: 'https://www.itu.int/rec/R-REC-V.431-9-202510-I/en', license: '© ITU 2025; band edges are facts, transcribed with citation', notes: 'Tables 1–3 read from the official .docx text' },
    { institution: 'CIE S 017:2020 International Lighting Vocabulary (e-ILV)', url: 'https://cie.co.at/e-ilv', notes: 'terms 17-21-002 … 17-21-011, free online access' },
    { institution: 'ISO 21348:2007 spectral categories — Space Environment Technologies summary table', url: 'https://web.archive.org/web/20160304091835/http://www.spacewx.com/pdf/SET_21348_2004.pdf', notes: 'sha256 95563f76362a3a0b7ceb32fa55d30da0ea5bf0866045a0631f3bde2a1cacd83d; read as an image' },
    { institution: 'Rogalski & Chrzanowski (2014) Metrology and Measurement Systems 21(4), 565–618', url: 'https://doi.org/10.2478/mms-2014-0057', license: 'CC BY-NC-ND 3.0', notes: 'Table 1 and §1 text' },
    { institution: 'Fixsen (2009) ApJ 707, 916 — CMB temperature', url: 'https://doi.org/10.1088/0004-637X/707/2/916' },
  ],
  adapter: 'scripts/ingestion/em-bands.ts',
  warnings: ['Band edges transcribed by hand from the source documents (see adapter header); tests check edge continuity and the published band counts.', 'ISO 20473 not available (iso.org blocks automated access); shown as not available, not filled from secondary sources.', 'ISO 21348 microwave letter bands not bundled.'],
});
