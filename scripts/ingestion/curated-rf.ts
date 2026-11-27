/**
 * Curated radio-frequency atlas (Phase 9, Gate 9.2) → datasets/spectral/rf-allocations.json
 *
 *   node --experimental-strip-types scripts/ingestion/curated-rf.ts
 *
 * Transcribed by hand from public primary documents, each read on 2026-11-27; every entry keeps a short
 * verbatim quote of the text it was read from.
 *  - ecfr-47-cfr: Title 47 of the U.S. Code of Federal Regulations on www.ecfr.gov (FCC rules; public domain):
 *    §73.14 (AM broadcast band), §73.201 (FM channels), §18.301 (ISM frequencies), §15.247 and §15.407
 *    (unlicensed bands). robots.txt allows /current/ pages; 2 s between requests.
 *  - is-gps-200n (§3.3.1.1, Table 3-Va) and is-gps-705j (§3.3.1.1, Table 3-III): GPS carrier frequencies and the
 *    minimum received power; gps-gov-space-segment: the ≈ 20,200 km orbital altitude.
 *  - ludwig-taylor-2002 (JPL DESCANSO Design and Performance Summary Series, Article 4, Voyager
 *    Telecommunications): uplink/downlink frequencies (§2.1.1, Table 2-1, §2.2.1) and the design control
 *    tables of the Voyager 2 S-band uplink (Table 5-2) and X-band downlink (Table 5-3) at DSS-43, 1996-01-01.
 */
import { writeDataset } from './lib/ingest.ts';

type Group = 'broadcast' | 'ism' | 'unlicensed' | 'navigation' | 'deep-space';
interface RfEntry {
  id: string; name: string; group: Group; kind: 'band' | 'carrier' | 'channels';
  /** band edges (Hz) */ fLo?: number; fHi?: number;
  /** carrier or centre frequency (Hz) */ f?: number;
  /** for channelised bands: first and last carrier and step (Hz) */ channels?: { first: number; last: number; step: number; count: number };
  tolerance?: number;
  ref: string; quote: string; source: string; note?: string;
}

const MHz = 1e6, kHz = 1e3, GHz = 1e9;
/** Verbatim sentences of 47 CFR §15.407(a) that name each band. */
const U_NII_QUOTES: Record<number, string> = {
  5.15: 'For an indoor access point operating in the band 5.15-5.25 GHz, the maximum conducted output power over the frequency band of operation shall not exceed 1 W provided the maximum antenna gain does not exceed 6 dBi.',
  5.25: 'For the 5.25-5.35 GHz and 5.47-5.725 GHz bands, the maximum conducted output power over the frequency bands of operation shall not exceed the lesser of 250 mW or 11 dBm + 10 log B, where B is the 26 dB emission bandwidth in megahertz.',
  5.47: 'For the 5.25-5.35 GHz and 5.47-5.725 GHz bands, the maximum conducted output power over the frequency bands of operation shall not exceed the lesser of 250 mW or 11 dBm + 10 log B, where B is the 26 dB emission bandwidth in megahertz.',
  5.725: 'For the band 5.725-5.850 GHz, the maximum conducted output power over the frequency band of operation shall not exceed 1 W.',
  5.925: 'For an indoor access point operating in the 5.925-7.125 GHz band, the maximum power spectral density must not exceed 5 dBm e.i.r.p. in any 1-megahertz band. In addition, the maximum e.i.r.p. over the frequency band of operation must not exceed 30 dBm.',
};
const entries: RfEntry[] = [
  { id: 'am-broadcast', name: 'AM broadcast band', group: 'broadcast', kind: 'channels', fLo: 535 * kHz, fHi: 1705 * kHz, channels: { first: 540 * kHz, last: 1700 * kHz, step: 10 * kHz, count: 117 },
    ref: '47 CFR §73.14', source: 'ecfr-47-cfr', quote: 'AM broadcast band. The band of frequencies extending from 535 to 1705 kHz. … The 117 carrier frequencies assigned to AM broadcast stations begin at 540 kHz and progress in 10 kHz steps to 1700 kHz.' },
  { id: 'fm-broadcast', name: 'FM broadcast band', group: 'broadcast', kind: 'channels', fLo: 88 * MHz, fHi: 108 * MHz, channels: { first: 88.1 * MHz, last: 107.9 * MHz, step: 200 * kHz, count: 100 },
    ref: '47 CFR §73.201', source: 'ecfr-47-cfr', quote: 'The FM broadcast band consists of that portion of the radio frequency spectrum between 88 MHz and 108 MHz. It is divided into 100 channels of 200 kHz each.', note: 'Channel 201 is 88.1 MHz and channel 300 is 107.9 MHz (table in §73.201).' },
  ...([[6.78, 15.0e-3], [13.56, 7.0e-3], [27.12, 163.0e-3], [40.68, 20.0e-3], [915, 13.0], [2450, 50.0], [5800, 75.0], [24125, 125.0], [61250, 250.0], [122500, 500.0], [245000, 1000.0]] as [number, number][]).map(([f, tol]): RfEntry => ({
    id: `ism-${f}`, name: `ISM ${f >= 1000 ? `${f / 1000} GHz` : `${f} MHz`}`, group: 'ism', kind: 'band', f: f * MHz, tolerance: tol * MHz, fLo: (f - tol) * MHz, fHi: (f + tol) * MHz,
    ref: '47 CFR §18.301, Table 1', source: 'ecfr-47-cfr',
    quote: 'The following frequency bands, in accordance with § 2.106 of the rules, are designated for use by ISM equipment', note: `Designated for ISM equipment (47 CFR Part 18). Tolerance ±${tol >= 1 ? `${tol} MHz` : `${tol * 1000} kHz`}.` })),
  ...([[902, 928], [2400, 2483.5], [5725, 5850]] as [number, number][]).map(([lo, hi]): RfEntry => ({
    id: `part15-247-${lo}`, name: `Unlicensed ${lo}–${hi} MHz`, group: 'unlicensed', kind: 'band', fLo: lo * MHz, fHi: hi * MHz,
    ref: '47 CFR §15.247(b)(3)', source: 'ecfr-47-cfr', quote: 'For systems using digital modulation in the 902-928 MHz, 2400-2483.5 MHz, and 5725-5850 MHz bands: 1 Watt.', note: 'Maximum conducted output power 1 W for digitally modulated transmitters.' })),
  ...([[5.15, 5.25], [5.25, 5.35], [5.47, 5.725], [5.725, 5.85], [5.925, 7.125]] as [number, number][]).map(([lo, hi]): RfEntry => ({
    id: `part15-407-${lo}`, name: `Unlicensed (U-NII) ${lo}–${hi} GHz`, group: 'unlicensed', kind: 'band', fLo: lo * GHz, fHi: hi * GHz,
    ref: '47 CFR §15.407(a)', source: 'ecfr-47-cfr', quote: U_NII_QUOTES[lo],
    note: 'Band named in the §15.407 power limits; the limits differ by band and device class.' })),
  { id: 'gps-l1', name: 'GPS L1', group: 'navigation', kind: 'carrier', f: 1575.42 * MHz, ref: 'IS-GPS-200N §3.3.1.1', source: 'is-gps-200n', quote: 'The nominal carrier frequencies (f0) shall be 1575.42 MHz, and 1227.6 MHz for L1 and L2, respectively.', note: 'Minimum received power of the L1 C/A signal −158.5 dBW at a 3 dBi linearly polarised antenna near the ground, satellite above 5° elevation (Table 3-Va).' },
  { id: 'gps-l2', name: 'GPS L2', group: 'navigation', kind: 'carrier', f: 1227.6 * MHz, ref: 'IS-GPS-200N §3.3.1.1', source: 'is-gps-200n', quote: 'The nominal carrier frequencies (f0) shall be 1575.42 MHz, and 1227.6 MHz for L1 and L2, respectively.' },
  { id: 'gps-l5', name: 'GPS L5', group: 'navigation', kind: 'carrier', f: 1176.45 * MHz, ref: 'IS-GPS-705J §3.3.1.1', source: 'is-gps-705j', quote: 'The nominal carrier frequency (f0) -- as it appears to an observer on the ground - shall be 1176.45 MHz, or 115 times', note: 'Minimum received power −157.9 dBW (Block IIF, Table 3-III).' },
  { id: 'voyager-uplink', name: 'Voyager S-band uplink', group: 'deep-space', kind: 'carrier', f: 2113.3125 * MHz, ref: 'Ludwig & Taylor (2002) §2.1.1', source: 'ludwig-taylor-2002', quote: 'The Deep Space Station (DSS) transmits an uplink carrier frequency of 2114.676697 MHz to Voyager 1 and 2113.312500 MHz to Voyager 2.', note: 'Voyager 2 (DSN channel 14); Voyager 1 uses 2114.676697 MHz (channel 18).' },
  { id: 'voyager-x-downlink', name: 'Voyager X-band downlink', group: 'deep-space', kind: 'carrier', f: 8415 * MHz, ref: 'Ludwig & Taylor (2002) Table 2-1', source: 'ludwig-taylor-2002', quote: 'X-band refers to a downlink frequency of about 8415 MHz.', note: 'Voyager 2 coherent downlink 8415.000000 MHz (channel 14); Voyager 1 8420.432097 MHz (channel 18). Coherent ratio X-band/uplink = 880/221 (§2.2.1).' },
  { id: 'voyager-s-downlink', name: 'Voyager S-band downlink', group: 'deep-space', kind: 'carrier', f: 2295 * MHz, ref: 'Ludwig & Taylor (2002) Table 2-1', source: 'ludwig-taylor-2002', quote: 'S-band refers to an uplink frequency of about 2115 MHz and a downlink frequency of about 2295 MHz.', note: 'Voyager 2 coherent S-band downlink 2295.000000 MHz; no longer used (§2).' },
];

/** Design control tables (link budgets) as published: design values, dB/dBm/dBi. */
const links = [
  { id: 'voyager2-x-downlink-1996', name: 'Voyager 2 → DSS-43 (Canberra, 70 m), X-band downlink carrier, 1996-01-01', source: 'ludwig-taylor-2002', ref: 'Table 5-3',
    f: 8415 * MHz, rangeKm: 7.273e9, rangeAu: 48.62,
    items: [
      { label: 'RF power to antenna', value: 40.9, unit: 'dBm' },
      { label: 'Spacecraft antenna gain (3.66 m HGA)', value: 48.2, unit: 'dBi' },
      { label: 'Pointing error', value: -0.1, unit: 'dB' },
      { label: 'Space loss', value: -308.19, unit: 'dB' },
      { label: 'Atmospheric attenuation', value: -0.04, unit: 'dB' },
      { label: 'Polarization loss', value: -0.08, unit: 'dB' },
      { label: 'Ground antenna gain (70 m)', value: 74.01, unit: 'dBi' },
      { label: 'Pointing loss', value: -0.2, unit: 'dB' },
    ],
    receivedDbm: -145.5, noiseDbmHz: -185.35, systemTempK: 21.12, ptN0: 39.9 },
  { id: 'voyager2-s-uplink-1996', name: 'DSS-43 (Canberra, 70 m, 18 kW) → Voyager 2, S-band uplink carrier, 1996-01-01', source: 'ludwig-taylor-2002', ref: 'Table 5-2',
    f: 2113.31 * MHz, rangeKm: 7.273e9, rangeAu: 48.62,
    items: [
      { label: 'RF power (18.0 kW)', value: 72.55, unit: 'dBm' },
      { label: 'Ground antenna gain (70 m)', value: 62.1, unit: 'dBi' },
      { label: 'Pointing loss', value: -0.03, unit: 'dB' },
      { label: 'Space loss', value: -296.18, unit: 'dB' },
      { label: 'Atmospheric attenuation', value: -0.04, unit: 'dB' },
      { label: 'Polarization loss', value: -0.12, unit: 'dB' },
      { label: 'Spacecraft antenna gain (HGA)', value: 34.6, unit: 'dBi' },
      { label: 'Pointing error', value: -0.1, unit: 'dB' },
    ],
    receivedDbm: -127.4, noiseDbmHz: -166.71, systemTempK: 1545, ptN0: 39.2 },
];

const gps = { altitudeKm: 20200, approximate: true, source: 'gps-gov-space-segment', quote: 'GPS satellites fly in medium Earth orbit (MEO) at an altitude of approximately 20,200 km (12,550 miles).',
  minReceivedDbw: { L1CA: -158.5, L5: -157.9 }, receiveAntennaDbi: 3, receiveAntennaNote: 'measured at the output of a 3 dBi linearly polarized user receiving antenna (located near ground) at worst normal orientation, when the SV is above a 5-degree elevation angle', sources: ['is-gps-200n', 'is-gps-705j'] };

writeDataset('datasets/spectral/rf-allocations.json', { version: '1.0.0', retrieved: '2026-11-27', entries, links, gps }, {
  dataset: 'rf-allocations',
  version: '1.0.0',
  records: entries.length + links.length,
  sources: [
    { institution: 'Code of Federal Regulations, Title 47 (FCC), eCFR (Office of the Federal Register / GPO)', url: 'https://www.ecfr.gov/current/title-47', license: 'U.S. Government work (public domain)', notes: '§73.14, §73.201, §18.301, §15.247, §15.407' },
    { institution: 'IS-GPS-200N and IS-GPS-705J (U.S. Space Force, Space Systems Command), gps.gov', url: 'https://www.gps.gov/interface-control-documents-icds-interface-specifications-iss', license: 'Distribution Statement A: approved for public release', notes: 'L1, L2, L5 carrier frequencies; minimum received power' },
    { institution: 'Ludwig & Taylor (2002), Voyager Telecommunications, JPL DESCANSO Article 4', url: 'https://descanso.jpl.nasa.gov/DPSummary/Descanso4--Voyager_new.pdf', notes: 'frequencies and Voyager 2 design control tables' },
  ],
  adapter: 'scripts/ingestion/curated-rf.ts',
  warnings: ['Hand-transcribed; U.S. (FCC) rules only — other countries allocate differently.', 'Link budgets are 1996 predictions (design values), not measurements.'],
});
