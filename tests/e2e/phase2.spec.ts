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
// Tests 22 and 25 call the LIVE PubChem service (not mocked). PubChem occasionally runs at high load
// (X-Throttling-Control "Service status: Yellow/Red"), so this file allows retries; Playwright reports any
// retried test as "flaky" in its summary rather than silently passing it.
test.describe.configure({ retries: 2 });
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

test('25 laboratory: build methanol, validate with RDKit, identify via PubChem InChIKey', async ({ page }) => {
  await page.goto('/#/atomic/lab');
  await page.evaluate(() => localStorage.removeItem('vv.lab.structure'));
  await page.reload();
  await page.waitForTimeout(2500); // lazy chunk + first WebGL frame
  const canvas = page.locator('.viewport canvas');
  const box = (await canvas.boundingBox())!;
  const cx = box.x + box.width / 2, cy = box.y + box.height / 2;
  await page.getByRole('group', { name: 'Element palette' }).getByRole('button', { name: 'C', exact: true }).click();
  await page.mouse.click(cx, cy); // place C at the work-plane origin
  await page.waitForTimeout(400);
  await page.getByRole('group', { name: 'Element palette' }).getByRole('button', { name: 'O', exact: true }).click();
  await page.mouse.click(cx, cy); // click the C → grow a bonded O
  await page.waitForTimeout(400);
  await page.getByRole('button', { name: 'Add hydrogens' }).click();
  const info = page.locator('.right-panel');
  await expect(info).toContainText('CH₄O');
  await expect(info).toContainText('Sanitised by RDKit', { timeout: 60_000 });
  await expect(info).toContainText('OKKJLVBELUTLKV-UHFFFAOYSA-N');
  await expect(info).toContainText('Methanol', { timeout: 30_000 });
  await expect(info).toContainText('passes both validators');
  await page.waitForTimeout(1000);
  await shot(page, '25-lab-methanol', 'Laboratory: methanol built by clicking (place C, grow O, add hydrogens). In-house valence rules ✓, RDKit sanitisation ✓, canonical SMILES/InChIKey, identified live in PubChem by InChIKey (CID 887).');

  // strict mode refuses a 5th bond on carbon
  await page.getByRole('group', { name: 'Element palette' }).getByRole('button', { name: 'H', exact: true }).click();
  await page.mouse.click(cx, cy);
  await expect(page.locator('.left-panel [role=alert]')).toContainText(/exceeds maximum valence [14]/);
  await expect(info).toContainText('CH₄O');
  // sandbox allows it, labelled hypothetical
  await page.getByLabel(/Experimental sandbox/).check();
  await page.mouse.click(cx, cy);
  await expect(info).toContainText('CH₅O');
  await expect(info).toContainText('fails validation — hypothetical');
  await expect(info).toContainText('could not sanitise');
  await page.waitForTimeout(800);
  await shot(page, '26-lab-sandbox-hypothetical', 'Experimental sandbox: an over-valent atom (CH₅O) is allowed only in the sandbox; both validators flag it and the structure is labelled hypothetical. Strict mode refused the same edit.');
  await page.getByRole('button', { name: 'Undo' }).click();
  await expect(info).toContainText('passes both validators');
});

test('27 laboratory: VGFF-1 geometry optimisation of a builder structure', async ({ page }) => {
  await page.goto('/#/atomic/lab');
  // crude starting guess: ethanol heavy atoms only, deliberately distorted
  await page.evaluate(() => localStorage.setItem('vv.lab.structure', JSON.stringify({
    atoms: [{ Z: 6, x: -1.2, y: 0.3, z: 0, charge: 0 }, { Z: 6, x: 0.4, y: -0.2, z: 0.4, charge: 0 }, { Z: 8, x: 1.1, y: 1.4, z: -0.3, charge: 0 }],
    bonds: [{ a: 0, b: 1, order: 1 }, { a: 1, b: 2, order: 1 }],
  })));
  await page.reload();
  await page.waitForTimeout(2500);
  await page.getByRole('button', { name: 'Add hydrogens' }).click();
  await page.getByRole('button', { name: /Optimise geometry/ }).click();
  const tools = page.locator('.left-panel');
  await expect(tools).toContainText('yes (≤ 1e-3)', { timeout: 60_000 });
  await expect(page.locator('.right-panel')).toContainText('VGFF-1.0 optimised');
  await expect(page.locator('.right-panel')).toContainText('Ethanol', { timeout: 30_000 });
  await page.waitForTimeout(1200);
  await shot(page, '27-lab-optimised-ethanol', 'VGFF-1 optimisation in a Web Worker: a distorted ethanol starting guess relaxes (L-BFGS, converged, energy-vs-iteration plot); geometry now labelled Simulated; identity confirmed as ethanol.');
});

test('28 spectroscopy: measured NIST spectra (Na D lines; [O III] nebular lines) and nuclide chart', async ({ page }) => {
  await page.goto('/#/atomic/element/11?diagram=spectrum');
  const diagram = page.locator('.diagram');
  await expect(diagram).toContainText('Na I', { timeout: 30_000 });
  await expect(diagram).toContainText('589.158');
  await page.waitForTimeout(800);
  await shot(page, '28-spectrum-sodium', 'Sodium: measured NIST ASD emission spectrum (vacuum wavelengths) with the Na D doublet 589.158 / 589.756 nm, transitions (3s ²S → 3p ²P°), Einstein A values and accuracy grades.');
  await page.goto('/#/atomic/element/8?diagram=spectrum');
  await page.getByRole('button', { name: 'O3+', exact: true }).waitFor({ timeout: 30_000 }).catch(() => {});
  await page.getByRole('button', { name: 'O2+', exact: true }).click();
  await expect(diagram).toContainText('O III');
  await expect(diagram).toContainText('500.824');
  await expect(diagram).toContainText('[M1]');
  await page.getByRole('button', { name: 'Absorption' }).click();
  await page.getByRole('button', { name: 'Emission' }).click();
  await page.waitForTimeout(800);
  await shot(page, '28b-spectrum-oiii-nebular', 'Doubly ionised oxygen (O III, selectable because NIST has its spectrum): forbidden nebular lines [O III] 495.9 / 500.7 nm (Ritz wavelengths, magnetic-dipole) that make planetary nebulae glow green.');
  await page.goto('/#/atomic/element/92?diagram=isotopes');
  await expect(diagram).toContainText('half-life vs neutron number');
  await page.getByText('Isotope comparison · half-life vs neutron number').scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);
  await shot(page, '28c-nuclide-chart-uranium', 'Isotope comparison: half-life vs neutron number for all uranium ground-state nuclides (NUBASE), coloured by decay mode, with the age of the Universe marked — ²³⁸U and ²³⁵U survive from stellar nucleosynthesis.');
});
