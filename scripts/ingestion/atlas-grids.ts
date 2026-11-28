/**
 * Earth weather atlas grids (Phase 21, Gate 21.2) → public/data/atlas/<layer>.bin + datasets/meteorology/atlas.json
 *
 *   node --experimental-strip-types scripts/ingestion/atlas-grids.ts /tmp/vv-research/p21/a/grids
 *
 * Inputs: CSV grids prepared from NOAA PSL OPeNDAP (OISST v2.1, GPCP v2.3, CPC Blended OLR, GHCN_CAMS, NCEP/NCAR R1)
 * and NASA GIBS imagery inverted through its published colour tables (MODIS LST, NDVI, snow; MERRA-2 AOD, albedo);
 * notes: research/SOURCE_NOTES_PHASE21A.md. NASA NEO was decommissioned in September 2026.
 * Each layer is resampled (nearest neighbour) to a regular grid, rows north → south, columns west (−180°) → east,
 * then quantised to one byte per cell: 0–254 span [min, max] linearly, 255 = no data. Months are concatenated.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { writeDataset } from './lib/ingest.ts';

const ROOT = process.argv[2] ?? '/tmp/vv-research/p21/a/grids';
type Grid = { lats: number[]; lons: number[]; v: Float64Array };
function readCsv(path: string): Grid {
  const lines = readFileSync(path, 'utf8').trim().split('\n');
  const lons = lines[0].split(',').slice(1).map(Number);
  const lats: number[] = [], vals: number[] = [];
  for (const l of lines.slice(1)) { const p = l.split(','); lats.push(Number(p[0])); for (const x of p.slice(1)) vals.push(Number(x)); }
  return { lats, lons, v: Float64Array.from(vals) };
}
const nearest = (arr: number[], x: number, circ = false) => {
  let best = 0, bd = Infinity;
  for (let i = 0; i < arr.length; i++) { let d = Math.abs(arr[i] - x); if (circ) d = Math.min(d, 360 - d); if (d < bd) { bd = d; best = i; } }
  return best;
};
function resample(g: Grid, res: number): Float64Array {
  const W = 360 / res, H = 180 / res, out = new Float64Array(W * H);
  const lons360 = g.lons.map((l) => ((l % 360) + 360) % 360);
  const li = Array.from({ length: H }, (_, r) => nearest(g.lats, 90 - res / 2 - r * res));
  const lo = Array.from({ length: W }, (_, c) => nearest(lons360, ((-180 + res / 2 + c * res) % 360 + 360) % 360, true));
  for (let r = 0; r < H; r++) for (let c = 0; c < W; c++) out[r * W + c] = g.v[li[r] * g.lons.length + lo[c]];
  return out;
}
const MONTHS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
const FILL = 99999;

interface Spec { id: string; dir: string | string[]; res: number; title: string; unit: string; kind: string; sources: string[]; ltm?: boolean; static?: boolean; clean?: (v: number, lat: number, lon: number) => number; combine?: (vals: number[]) => number; note?: string }
const SPECS: Spec[] = [
  { id: 'sst', dir: 'oisst_v21_sst_degC_1deg', res: 1, title: 'Sea surface temperature', unit: '°C', kind: 'observation-based analysis', sources: ['noaa-oisst'] },
  { id: 'seaice', dir: 'oisst_v21_icec_frac_1deg', res: 1, title: 'Sea ice concentration', unit: '%', kind: 'observation-based analysis', sources: ['noaa-oisst'], clean: (v) => v * 100, note: 'The file labels the variable “percent” but stores fractions 0–1; multiplied by 100 here.' },
  { id: 'airtemp', dir: 'ghcncams_air_2m_degC_1deg', res: 1, title: 'Air temperature over land (2 m)', unit: '°C', kind: 'observation (station analysis)', sources: ['cpc-ghcn-cams'], clean: (v) => (v > 50 ? FILL : v), note: 'Cells above 50 °C (an artefact over southern Colombia in the source, 51–57 °C every month) are masked. No Antarctica.' },
  { id: 'lst', dir: 'gibs_modis_terra_lst_day_K', res: 1, title: 'Land surface temperature, daytime (MODIS)', unit: '°C', kind: 'observation (satellite)', sources: ['nasa-gibs'], clean: (v) => (v < 200 ? FILL : v - 273.15), note: 'Decoded from GIBS imagery through its colour table: values are bin midpoints (0.6 K bins). The lowest bin, [0.02, 200) K, has no meaningful midpoint and is shown as no data (below −73 °C).' },
  { id: 'precip', dir: 'gpcp_v23_precip_mm_per_day', res: 2, title: 'Precipitation', unit: 'mm/day', kind: 'observation (satellite–gauge merge; 2024 interim)', sources: ['noaa-gpcp'], note: 'GPCP v2.3 at 2.5°; 2024 data are interim.' },
  { id: 'olr', dir: 'cbo_olr_monthly_from_daily', res: 1, title: 'Outgoing longwave radiation', unit: 'W/m²', kind: 'observation (satellite)', sources: ['noaa-cpc-olr'], note: 'Monthly means of the daily CPC Blended OLR.' },
  { id: 'clouds', dir: 'ncep_r1_tcdc_pct', res: 2, title: 'Cloud cover', unit: '%', kind: 'reanalysis (model output)', sources: ['ncep-r1'] },
  { id: 'pwat', dir: 'ncep_r1_pr_wtr_kg_m2', res: 2, title: 'Water vapour (precipitable water)', unit: 'mm', kind: 'reanalysis', sources: ['ncep-r1'], clean: (v) => Math.max(0, v), note: 'Small negative model values clipped to 0.' },
  { id: 'netrad', dir: ['ncep_r1_dswrf_ntat_W_m2', 'ncep_r1_uswrf_ntat_W_m2', 'ncep_r1_ulwrf_ntat_W_m2'], res: 2, title: 'Net radiation at the top of the atmosphere', unit: 'W/m²', kind: 'reanalysis (model output)', sources: ['ncep-r1'], combine: ([d, u, l]) => d - u - l, note: 'Incoming solar − reflected solar − outgoing longwave, from three reanalysis fields (our subtraction).' },
  { id: 'ndvi', dir: 'gibs_modis_terra_ndvi', res: 1, title: 'Vegetation (NDVI, MODIS)', unit: '', kind: 'observation (satellite)', sources: ['nasa-gibs'], note: 'Bin midpoints (0.005); water and bare ground (NDVI ≲ 0) come out as no data.' },
  { id: 'snow', dir: 'gibs_modis_terra_snow_pct', res: 1, title: 'Snow cover (MODIS)', unit: '%', kind: 'observation (satellite)', sources: ['nasa-gibs'], note: '0 % snow is transparent in the imagery, so it shows as no data.' },
  { id: 'aod', dir: 'gibs_merra2_aod550', res: 1, title: 'Aerosol optical depth, 550 nm (MERRA-2)', unit: '', kind: 'reanalysis', sources: ['nasa-gibs', 'merra2'], note: 'Bin midpoints (0.005); 0.9 and above shown as 0.9.' },
  { id: 'albedo', dir: 'gibs_merra2_sfc_albedo', res: 1, title: 'Surface albedo (MERRA-2)', unit: '', kind: 'reanalysis', sources: ['nasa-gibs', 'merra2'], note: 'Bin midpoints (0.005); 0.8 and above shown as 0.8.' },
  { id: 'slp', dir: 'ncep_r1_slp_hPa_ltm', res: 2, title: 'Sea-level pressure (1991–2020 mean)', unit: 'hPa', kind: 'reanalysis climatology', sources: ['ncep-r1'], ltm: true },
  { id: 'u10', dir: 'ncep_r1_uwnd_10m_m_s_ltm', res: 2, title: 'Wind at 10 m, eastward (1991–2020 mean)', unit: 'm/s', kind: 'reanalysis climatology', sources: ['ncep-r1'], ltm: true },
  { id: 'v10', dir: 'ncep_r1_vwnd_10m_m_s_ltm', res: 2, title: 'Wind at 10 m, northward (1991–2020 mean)', unit: 'm/s', kind: 'reanalysis climatology', sources: ['ncep-r1'], ltm: true },
  { id: 'u250', dir: 'ncep_r1_uwnd_250hPa_m_s_ltm', res: 2, title: 'Wind at 250 hPa (jet level), eastward (1991–2020 mean)', unit: 'm/s', kind: 'reanalysis climatology', sources: ['ncep-r1'], ltm: true },
  { id: 'v250', dir: 'ncep_r1_vwnd_250hPa_m_s_ltm', res: 2, title: 'Wind at 250 hPa, northward (1991–2020 mean)', unit: 'm/s', kind: 'reanalysis climatology', sources: ['ncep-r1'], ltm: true },
  { id: 'topo', dir: 'ncep_r1_hgt_sfc_m', res: 2, title: 'Model surface height', unit: 'm', kind: 'reanalysis model field (smoothed)', sources: ['ncep-r1'], static: true, note: 'Spectral model orography, not real topography.' },
];

const files = (s: Spec, m: string) => s.static ? 'static.csv' : s.ltm ? `ltm1991-2020-${m}.csv` : `2024-${m}.csv`;
const layers: Record<string, unknown>[] = [];
for (const s of SPECS) {
  const dirs = Array.isArray(s.dir) ? s.dir : [s.dir];
  const months = s.static ? ['01'] : MONTHS;
  const all: Float64Array[] = [];
  for (const m of months) {
    const gs = dirs.map((d) => readCsv(join(ROOT, d, files(s, m))));
    const rs = gs.map((g) => resample(g, s.res));
    const W = 360 / s.res, out = new Float64Array(rs[0].length);
    for (let i = 0; i < out.length; i++) {
      const vals = rs.map((r) => r[i]);
      if (vals.some((x) => x === FILL || !Number.isFinite(x))) { out[i] = FILL; continue; }
      let v = s.combine ? s.combine(vals) : vals[0];
      if (s.clean) v = s.clean(v, 90 - s.res / 2 - Math.floor(i / W) * s.res, -180 + s.res / 2 + (i % W) * s.res);
      out[i] = v;
    }
    all.push(out);
  }
  let min = Infinity, max = -Infinity, n = 0;
  for (const a of all) for (const v of a) if (v !== FILL) { if (v < min) min = v; if (v > max) max = v; n++; }
  const bytes = new Uint8Array(all.length * all[0].length);
  all.forEach((a, k) => a.forEach((v, i) => { bytes[k * a.length + i] = v === FILL ? 255 : Math.round(((v - min) / (max - min || 1)) * 254); }));
  writeFileSync(`public/data/atlas/${s.id}.bin`, bytes);
  layers.push({ id: s.id, title: s.title, unit: s.unit, kind: s.kind, sources: s.sources, res: s.res, w: 360 / s.res, h: 180 / s.res, months: all.length, period: s.static ? 'static' : s.ltm ? '1991–2020 monthly means' : '2024 monthly means', min, max, step: (max - min) / 254, valid: n, note: s.note ?? '', file: `/data/atlas/${s.id}.bin` });
  console.log(s.id, all.length, min.toFixed(2), max.toFixed(2));
}
// Natural Earth 110 m coastline, simplified to lon/lat pairs rounded to 0.1°
const coast = JSON.parse(readFileSync(join(ROOT, '../naturalearth/ne_110m_coastline.geojson'), 'utf8')) as { features: { geometry: { type: string; coordinates: number[][] | number[][][] } }[] };
const lines: number[][][] = [];
for (const f of coast.features) { const g = f.geometry; const parts = g.type === 'MultiLineString' ? (g.coordinates as number[][][]) : [g.coordinates as number[][]]; for (const p of parts) lines.push(p.map(([x, y]) => [Math.round(x * 10) / 10, Math.round(y * 10) / 10])); }
writeFileSync('public/data/atlas/coastline.json', JSON.stringify(lines));

writeDataset('datasets/meteorology/atlas.json', { version: '1.0.0', layers, coastline: { file: '/data/atlas/coastline.json', source: 'natural-earth', note: 'Natural Earth 110 m coastline (public domain), version 5.2.0-pre.' } }, { dataset: 'atlas', version: '1.0.0', records: layers.length,
  sources: [{ institution: 'NOAA PSL (OISST v2.1, GPCP v2.3, CPC Blended OLR, GHCN_CAMS, NCEP/NCAR Reanalysis 1)', url: 'https://psl.noaa.gov', license: 'NOAA PSL: acknowledgement requested', notes: '2024 monthly means; 1991–2020 long-term means for pressure and wind' },
    { institution: 'NASA GIBS (MODIS Terra LST, NDVI, snow; MERRA-2 AOD and albedo)', url: 'https://gibs.earthdata.nasa.gov', license: 'no fees, no access constraints (WMS capabilities)', notes: 'imagery decoded through published colour tables' },
    { institution: 'Natural Earth', url: 'https://www.naturalearthdata.com', license: 'public domain', notes: '110 m coastline' }],
  adapter: 'scripts/ingestion/atlas-grids.ts', warnings: ['NASA NEO was decommissioned in September 2026; replacement layers used.', 'GHCN_CAMS 51–57 °C artefact over southern Colombia masked.', 'OISST sea ice labelled percent but stored as fraction.', 'R1 precipitable water negative values clipped.', 'GIBS-decoded layers are bin midpoints.', 'GPCP 2024 interim.', 'Cloud cover, water vapour, net radiation, pressure and wind are reanalysis, not observations.'] });
