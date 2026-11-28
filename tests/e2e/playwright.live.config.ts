import base from './playwright.config';
import { defineConfig } from '@playwright/test';
/** Run the browser suite against production (no local server): npx playwright test --config tests/e2e/playwright.live.config.ts */
export default defineConfig({ ...base, use: { ...base.use, baseURL: 'https://voyager-ventures.vercel.app' }, webServer: undefined });
