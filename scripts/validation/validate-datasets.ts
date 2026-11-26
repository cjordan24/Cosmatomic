/**
 * Dataset integrity verification: every manifest's output file must exist, match its
 * SHA-256 and byte size, and parse as JSON. Exit code 1 on any mismatch.
 *   npm run data:validate
 */
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { MANIFEST_DIR, ROOT, sha256, type DatasetManifest } from '../ingestion/lib/ingest.ts';

let failures = 0;
for (const f of readdirSync(MANIFEST_DIR).filter((x) => x.endsWith('.manifest.json'))) {
  const m = JSON.parse(readFileSync(join(MANIFEST_DIR, f), 'utf8')) as DatasetManifest;
  const p = join(ROOT, m.output);
  const problems: string[] = [];
  if (!existsSync(p)) problems.push('missing file');
  else {
    const text = readFileSync(p, 'utf8');
    if (sha256(text) !== m.sha256) problems.push('sha256 mismatch');
    if (statSync(p).size !== m.bytes) problems.push(`size ${statSync(p).size} ≠ ${m.bytes}`);
    try { JSON.parse(text); } catch { problems.push('invalid JSON'); }
  }
  if (problems.length) failures++;
  console.log(`${problems.length ? '✘' : '✔'} ${m.dataset.padEnd(28)} ${String(m.records).padStart(4)} records  ${(m.bytes / 1024).toFixed(1).padStart(7)} KiB  retrieved ${m.retrievedAt.slice(0, 10)}  ${problems.join(', ')}`);
}
process.exit(failures ? 1 : 0);
