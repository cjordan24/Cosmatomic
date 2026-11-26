/**
 * Phase 2 browser verification (Molecular Laboratory). Screenshots → screenshots/phase-02/.
 * Note: test "22" performs a LIVE PubChem request (real integration, not mocked).
 */
import { test, expect, type Page } from '@playwright/test';
import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '../../screenshots/phase-02');
mkdirSync(OUT, { recursive: true });
const INDEX = join(OUT, 'captures.json');
const log: Record<string, string> = existsSync(INDEX) ? JSON.parse(readFileSync(INDEX, 'utf8')) : {};
async function shot(page: Page, name: string, description: string) {
  await page.waitForTimeout(600);
  await page.screenshot({ path: join(OUT, `${name}.png`) });
  log[`${name}.png`] = description;
  writeFileSync(INDEX, JSON.stringify(log, null, 2));
}
const errors: string[] = [];
test.beforeEach(({ page }) => { page.on('pageerror', (e) => errors.push(e.message)); });
test.afterEach(() => { expect(errors, errors.join(' | ')).toEqual([]); });

test('21 expanded library (≥100 records) with C60 from experimental bond lengths', async ({ page }) => {
  await page.goto('/#/atomic/molecules/exp-c60');
  await expect(page.locator('.left-panel .title')).toContainText(/library · (1\d\d|[2-9]\d\d) records/);
  await expect(page.getByRole('heading', { name: 'Buckminsterfullerene' })).toBeVisible();
  await expect(page.locator('.right-panel')).toContainText('experimental geometry');
  await expect(page.locator('.right-panel')).toContainText('123591'); // identifiers must never be rounded
  await page.getByRole('button', { name: 'biomolecules' }).click();
  await expect(page.getByRole('option', { name: /L-tryptophan/i })).toBeVisible();
  await page.waitForTimeout(1500);
  await shot(page, '21-library-c60', 'Expanded library (≥100 records, biomolecules filter shown): C₆₀ built from gas-phase electron-diffraction bond lengths (1.401 / 1.458 Å) — observed provenance.');
});

test('22 live PubChem search → 3D record saved to my library', async ({ page }) => {
  await page.goto('/#/atomic/molecules');
  await page.getByLabel('Search PubChem').fill('vanillin');
  await page.getByRole('button', { name: 'Search', exact: true }).click();
  const results = page.getByRole('listbox', { name: 'PubChem results' });
  await expect(results).toContainText('Vanillin', { timeout: 30_000 });
  await results.getByRole('option').first().click();
  await expect(page.getByRole('heading', { name: 'Vanillin' })).toBeVisible({ timeout: 30_000 });
  await expect(page).toHaveURL(/pubchem-1183/);
  await page.getByRole('button', { name: 'my library', exact: true }).click();
  await expect(page.getByRole('option', { name: /Vanillin/ })).toBeVisible();
  await page.waitForTimeout(1500);
  await shot(page, '22-pubchem-search-vanillin', 'On-demand PubChem search: “vanillin” → CID 1183 fetched live (properties + PubChem3D conformer), cached in IndexedDB and saved to “my library”.');
  await page.reload();
  await page.getByRole('button', { name: 'my library', exact: true }).click();
  await expect(page.getByRole('option', { name: /Vanillin/ })).toBeVisible(); // persisted across reload
});

test('23 import an XYZ file and export MOL', async ({ page }) => {
  await page.goto('/#/atomic/molecules');
  const xyz = '3\nwater from file\nO 0.000000 0.000000 0.117300\nH 0.000000 0.757200 -0.469200\nH 0.000000 -0.757200 -0.469200\n';
  await page.locator('input[type=file]').setInputFiles({ name: 'water.xyz', mimeType: 'chemical/x-xyz', buffer: Buffer.from(xyz) });
  await expect(page.getByRole('heading', { name: 'water from file' })).toBeVisible();
  await expect(page.locator('.right-panel')).toContainText('user-supplied, unverified');
  await expect(page.locator('.left-panel')).toContainText('2 single bonds inferred');
  const dl = page.waitForEvent('download');
  await page.locator('.right-panel').getByRole('button', { name: 'MOL', exact: true }).click();
  const file = await dl;
  const text = readFileSync((await file.path())!, 'utf8');
  expect(text).toContain('V2000');
  expect(text).toMatch(/\n\s+3\s+2\s+0/); // 3 atoms, 2 bonds
  await page.waitForTimeout(1200);
  await shot(page, '23-import-xyz', 'Imported XYZ file: connectivity inferred from covalent radii (stated), provenance “user-supplied, unverified”; exported back to MDL MOL V2000.');
});

test('24 comparison view: structural isomers', async ({ page }) => {
  await page.goto('/#/atomic/molecules/pubchem-702');
  await page.getByRole('button', { name: 'Compare…' }).click();
  await expect(page.getByRole('table').first()).toContainText('C2H6O');
  await expect(page.getByRole('table').nth(1)).toContainText('C–O');
  await page.waitForTimeout(2500);
  await shot(page, '24-compare-isomers', 'Comparison view: ethanol vs dimethyl ether (both C₂H₆O) — side-by-side 3D models, descriptors (XLogP3, TPSA, H-bond donors) and bond-length statistics by element pair.');
});
