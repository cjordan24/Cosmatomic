/**
 * Phase 5, Gate 5.3 — orbital and physical elements of the exoplanets within 10 pc.
 *
 * The census is the 10 pc sample (Reylé et al. 2021, 2023 update: objects of type "Planet"). Their
 * elements come from The Extrasolar Planets Encyclopaedia, exoplanet.eu (Schneider et al. 2011,
 * A&A 532, A79; Observatoire de Paris), full catalogue CSV (https://exoplanet.eu/catalog/csv/).
 * Site content is CC BY 4.0; exoplanet.eu has no robots.txt restrictions. One request.
 *
 * NASA Exoplanet Archive was not used: its robots.txt disallows Anthropic agents (ClaudeBot,
 * anthropic-ai, Claude-Web) by name, and this adapter is written and run by an AI agent.
 *
 * Units as documented by exoplanet.eu: mass, m sin i in Jupiter masses; radius in Jupiter radii;
 * period in days; semi-major axis in au; angles in degrees; times in JD; K in m/s; star mass in M☉.
 * Uncertainties are stored as published (error_min, error_max), i.e. as [value, −σ, +σ].
 * Nothing is computed here.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, fetchText, writeDataset } from './lib/ingest.ts';

const CSV_URL = 'https://exoplanet.eu/catalog/csv/';

function parseCsv(t: string): string[][] {
  const rows: string[][] = []; let r: string[] = [], f = '', q = false;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (q) { if (c === '"') { if (t[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; }
    else if (c === '"') q = true;
    else if (c === ',') { r.push(f); f = ''; }
    else if (c === '\n') { r.push(f); rows.push(r); r = []; f = ''; }
    else if (c !== '\r') f += c;
  }
  if (f || r.length) { r.push(f); rows.push(r); }
  return rows;
}

const text = await fetchText(CSV_URL, { minIntervalMs: 3000, cacheKey: 'exoplanet-eu/catalog.csv', maxBytes: 30 * 1024 * 1024 });
const rows = parseCsv(text);
const head = rows[0];
const eu = rows.slice(1).filter((r) => r.length === head.length).map((r) => Object.fromEntries(head.map((h, i) => [h, r[i]])) as Record<string, string>);

interface TenObj { seq: number; sys: number; system: string; name: string; type: string; simbad: string | null; common: string | null; gj: string | null; hd: string | null; hip: string | null; rSys: string | null }
const ten = (JSON.parse(readFileSync(join(ROOT, 'datasets/astronomical/nearby-stars-10pc.json'), 'utf8')) as { objects: TenObj[] }).objects;
const planets = ten.filter((o) => o.type === 'exoplanet');

const norm = (s: string) => s.toLowerCase().replace(/centauri/g, 'cen').replace(/eridani/g, 'eri').replace(/'s( star)?/g, '').replace(/[^a-z0-9+-]/g, '');
const byPlanetName = new Map<string, Record<string, string>>();
for (const p of eu) for (const n of [p.name, ...(p.alternate_names ?? '').split(',')]) if (n.trim()) byPlanetName.set(norm(n), p);
const byHost = new Map<string, Record<string, string>[]>();
for (const p of eu) for (const n of [p.star_name, ...(p.star_alternate_names ?? '').split(',')]) if (n.trim()) byHost.set(norm(n), [...(byHost.get(norm(n)) ?? []), p]);
const letter = (s: string) => s.trim().split(/\s+/).pop()!.toLowerCase();

const num = (s: string | undefined) => (s === undefined || s.trim() === '' ? null : Number.isFinite(Number(s)) ? Number(s) : null);
const withErr = (p: Record<string, string>, k: string): [number, number | null, number | null] | null => {
  const v = num(p[k]);
  return v === null ? null : [v, num(p[`${k}_error_min`]), num(p[`${k}_error_max`])];
};

const warnings: string[] = [];
const out = planets.map((pl) => {
  let m = [pl.name, pl.simbad, pl.common].filter((x): x is string => !!x).map((c) => byPlanetName.get(norm(c))).find(Boolean);
  let how = m ? 'planet name' : null;
  if (!m) {
    const hosts = ten.filter((o) => o.sys === pl.sys && o.type !== 'exoplanet');
    const ids = hosts.flatMap((h) => [h.name, h.common, h.simbad, h.gj, h.hd, h.hip, h.system]).filter((x): x is string => !!x);
    const cands = ids.flatMap((id) => byHost.get(norm(id)) ?? []);
    m = cands.find((c) => letter(c.name) === letter(pl.name));
    if (m) how = 'host identifier + planet letter';
  }
  if (!m) warnings.push(`${pl.name}: not found in exoplanet.eu (shown with catalogue data only)`);
  else if (how !== 'planet name') warnings.push(`${pl.name} matched to exoplanet.eu “${m.name}” by ${how}`);
  return {
    seq: pl.seq, sys: pl.sys, name: pl.name, systemRef: pl.rSys,
    eu: m ? {
      name: m.name, url: `https://exoplanet.eu/catalog/?f=%22${encodeURIComponent(m.name)}%22+in+name`, matchedBy: how,
      status: m.planet_status, discovered: num(m.discovered), updated: m.updated || null, detection: m.detection_type || null,
      massType: m.mass_measurement_type || null, radiusType: m.radius_measurement_type || null,
      P: withErr(m, 'orbital_period'), a: withErr(m, 'semi_major_axis'), e: withErr(m, 'eccentricity'), i: withErr(m, 'inclination'),
      omega: withErr(m, 'omega'), tperi: withErr(m, 'tperi'), K: withErr(m, 'k'),
      mass: withErr(m, 'mass'), msini: withErr(m, 'mass_sini'), radius: withErr(m, 'radius'),
      starName: m.star_name, starMass: withErr(m, 'star_mass'), starDistance: withErr(m, 'star_distance'),
    } : null,
  };
});

writeDataset('datasets/astronomical/exoplanets-10pc.json', { census: 'nearby-stars-10pc (type exoplanet)', elements: 'exoplanet.eu catalogue CSV', planets: out }, {
  dataset: 'exoplanets-10pc', version: new Date().toISOString().slice(0, 10), records: out.length,
  sources: [
    { institution: 'The Extrasolar Planets Encyclopaedia (exoplanet.eu), Observatoire de Paris — Schneider et al. (2011) A&A 532, A79', url: CSV_URL, license: 'CC BY 4.0 (site content)', notes: `${eu.length} planets in the catalogue at retrieval; per-field references on each planet page` },
    { institution: 'Reylé, C. et al. (2021) A&A 650, A201 — 10 pc census of planets', url: 'https://doi.org/10.1051/0004-6361/202140985', license: 'CC BY 4.0' },
  ],
  adapter: 'scripts/ingestion/exoplanets.ts',
  warnings: [
    'Units: M_Jup, R_Jup, days, au, degrees, JD, m/s, M☉ (exoplanet.eu API documentation). Uncertainties stored as [value, error_min, error_max].',
    'Elements are as compiled by exoplanet.eu; values for one planet may come from different papers (see the planet page).',
    ...warnings,
  ],
});
