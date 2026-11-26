/**
 * Voyager Ventures — shared scientific ingestion library.
 *
 * Every adapter goes through this module so that rate limiting, retry/backoff,
 * caching, storage budgets, integrity hashes and provenance manifests are
 * handled identically.
 *
 * Runs on Node >= 22 with `--experimental-strip-types` (no build step).
 */
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
export const CACHE_DIR = join(ROOT, 'datasets', '.cache');
export const MANIFEST_DIR = join(ROOT, 'datasets', 'manifests');

/** Generic client name. No personal details are ever sent to data providers. */
const USER_AGENT = 'VoyagerVentures-DataIngestion/0.1 (open scientific education project)';

export interface FetchOptions {
  /** Minimum milliseconds between requests to the same host. */
  minIntervalMs: number;
  maxRetries?: number;
  /** Cache key; if set, the response body is cached on disk and reused. */
  cacheKey?: string;
  /** Refuse responses larger than this (storage budget per response). */
  maxBytes?: number;
}

const lastRequestAt = new Map<string, number>();

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Fetch text with per-host rate limiting, exponential backoff on 429/5xx and
 * network errors, an on-disk cache, and a response-size budget.
 */
export async function fetchText(url: string, opts: FetchOptions): Promise<string> {
  const maxRetries = opts.maxRetries ?? 5;
  const maxBytes = opts.maxBytes ?? 20 * 1024 * 1024;
  if (opts.cacheKey) {
    const p = join(CACHE_DIR, opts.cacheKey);
    if (existsSync(p)) return readFileSync(p, 'utf8');
  }
  const host = new URL(url).host;
  for (let attempt = 0; ; attempt++) {
    const wait = (lastRequestAt.get(host) ?? 0) + opts.minIntervalMs - Date.now();
    if (wait > 0) await sleep(wait);
    lastRequestAt.set(host, Date.now());
    try {
      const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
      if (res.status === 429 || res.status >= 500) throw new RetryableError(`HTTP ${res.status}`);
      if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
      const body = await res.text();
      if (body.length > maxBytes) throw new Error(`Response exceeds storage budget (${body.length} > ${maxBytes} bytes): ${url}`);
      if (opts.cacheKey) {
        const p = join(CACHE_DIR, opts.cacheKey);
        mkdirSync(dirname(p), { recursive: true });
        writeFileSync(p, body);
      }
      return body;
    } catch (err) {
      const retryable = err instanceof RetryableError || (err as Error).name === 'TypeError';
      if (!retryable || attempt >= maxRetries) throw err;
      const backoff = Math.min(30_000, 500 * 2 ** attempt) + Math.random() * 250;
      console.warn(`  retry ${attempt + 1}/${maxRetries} in ${Math.round(backoff)} ms (${(err as Error).message})`);
      await sleep(backoff);
    }
  }
}

class RetryableError extends Error {}

export async function fetchJson<T = unknown>(url: string, opts: FetchOptions): Promise<T> {
  return JSON.parse(await fetchText(url, opts)) as T;
}

export function sha256(text: string): string {
  return createHash('sha256').update(text).digest('hex');
}

export interface ManifestSource {
  institution: string;
  url: string;
  license?: string;
  notes?: string;
}

export interface DatasetManifest {
  dataset: string;
  output: string;
  version: string;
  retrievedAt: string;
  records: number;
  bytes: number;
  sha256: string;
  sources: ManifestSource[];
  adapter: string;
  warnings: string[];
}

/**
 * Write a dataset (pretty-stable JSON) plus a manifest recording provenance and
 * an integrity hash. Refuses to write beyond the storage budget.
 */
export function writeDataset(
  relOutput: string,
  data: unknown,
  meta: Omit<DatasetManifest, 'output' | 'retrievedAt' | 'bytes' | 'sha256'>,
  maxBytes = 5 * 1024 * 1024,
): DatasetManifest {
  const text = JSON.stringify(data) + '\n';
  if (text.length > maxBytes) throw new Error(`${relOutput} exceeds storage budget (${text.length} > ${maxBytes})`);
  const out = join(ROOT, relOutput);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, text);
  const manifest: DatasetManifest = {
    ...meta,
    output: relOutput,
    retrievedAt: new Date().toISOString(),
    bytes: statSync(out).size,
    sha256: sha256(text),
  };
  mkdirSync(MANIFEST_DIR, { recursive: true });
  writeFileSync(join(MANIFEST_DIR, `${meta.dataset}.manifest.json`), JSON.stringify(manifest, null, 2) + '\n');
  console.log(`✔ wrote ${relOutput} (${manifest.records} records, ${(manifest.bytes / 1024).toFixed(1)} KiB)`);
  if (meta.warnings.length) console.log(`  ${meta.warnings.length} warning(s); see manifest`);
  return manifest;
}

/** Parse a value like "55.934 936(2)" → { value, uncertainty } (uncertainty in last digits). */
export function parseUncertain(raw: string | undefined): { value: number; uncertainty: number | null } | null {
  if (!raw) return null;
  const s = raw.replace(/\s+/g, '').replace(/[\[\]]/g, '');
  const m = s.match(/^([+-]?\d*\.?\d+)(?:\((\d+)\))?/);
  if (!m) return null;
  const value = Number(m[1]);
  if (!Number.isFinite(value)) return null;
  let uncertainty: number | null = null;
  if (m[2]) {
    const decimals = (m[1].split('.')[1] ?? '').length;
    uncertainty = Number(m[2]) * 10 ** -decimals;
  }
  return { value, uncertainty };
}
