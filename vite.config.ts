import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

// Gate 8.5: every notebook snapshot records the app version and the commit it was built from.
const pkgVersion = (JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as { version: string }).version;
let commit = 'unknown';
try { commit = execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim(); } catch { /* not a git checkout */ }

export default defineConfig({
  plugins: [react()],
  define: { __APP_VERSION__: JSON.stringify(pkgVersion), __APP_COMMIT__: JSON.stringify(commit) },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@datasets': fileURLToPath(new URL('./datasets', import.meta.url)),
    },
  },
  worker: { format: 'es' },
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/three')) return 'three';
          if (id.includes('@react-three')) return 'r3f';
          if (id.includes('datasets/atomic/nuclides')) return 'nuclides';
        },
      },
    },
  },
  test: {
    include: ['tests/science/**/*.test.ts'],
    environment: 'node',
  },
});
