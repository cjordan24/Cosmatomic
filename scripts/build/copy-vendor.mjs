// Copies RDKit-JS (BSD-3-Clause) runtime files into public/vendor/rdkit so they are served as static assets
// and loaded lazily (only in the Laboratory). Runs automatically before `dev` and `build`.
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = join(dirname(fileURLToPath(import.meta.url)), '../..');
const src = join(root, 'node_modules/@rdkit/rdkit/dist');
const out = join(root, 'public/vendor/rdkit');
mkdirSync(out, { recursive: true });
for (const f of ['RDKit_minimal.js', 'RDKit_minimal.wasm']) copyFileSync(join(src, f), join(out, f));
const { version } = JSON.parse(readFileSync(join(root, 'node_modules/@rdkit/rdkit/package.json'), 'utf8'));
writeFileSync(join(out, 'VERSION.json'), JSON.stringify({ package: '@rdkit/rdkit', version, license: 'BSD-3-Clause' }) + '\n');
console.log(`vendor: RDKit-JS ${version} → public/vendor/rdkit`);
