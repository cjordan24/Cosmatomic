/** Phase 3 browser verification (Physics Sandbox). Screenshots → screenshots/phase-03/. */
import { test, expect, type Page } from '@playwright/test';
import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '../../screenshots/phase-03');
mkdirSync(OUT, { recursive: true });
const INDEX = join(OUT, 'captures.json');
const log: Record<string, string> = existsSync(INDEX) ? JSON.parse(readFileSync(INDEX, 'utf8')) : {};
async function shot(page: Page, name: string, description: string) {
  await page.waitForTimeout(500);
  await page.screenshot({ path: join(OUT, `${name}.png`) });
  log[`${name}.png`] = description;
  writeFileSync(INDEX, JSON.stringify(log, null, 2));
}
const errors: string[] = [];
test.beforeEach(({ page }) => { page.on('pageerror', (e) => errors.push(e.message)); });
test.afterEach(() => { expect(errors, errors.join(' | ')).toEqual([]); });

/** Read a numeric value from the diagnostics key/value list. */
async function kv(page: Page, key: string): Promise<number> {
  const dd = page.locator('.right-panel dt', { hasText: key }).locator('xpath=following-sibling::dd[1]');
  const t = (await dd.innerText()).replace(/,/g, '').replace(/ × 10([⁻⁰¹²³⁴⁵⁶⁷⁸⁹]+)/, (_, e: string) => 'e' + e.replace('⁻', '-').split('').map((c) => '⁰¹²³⁴⁵⁶⁷⁸⁹'.indexOf(c) >= 0 ? String('⁰¹²³⁴⁵⁶⁷⁸⁹'.indexOf(c)) : c).join(''));
  return Number.parseFloat(t);
}

test('31 experiment: real inner solar system integrated with Yoshida-4, energy conserved', async ({ page }) => {
  await page.goto('/#/cosmic');
  await page.waitForTimeout(1500);
  await page.getByRole('button', { name: /Experiment/ }).click();
  await expect(page).toHaveURL(/cosmic\/sandbox/);
  await page.getByLabel('Simulated days per second').fill('400');
  await page.getByRole('button', { name: 'Run simulation' }).click();
  await page.waitForTimeout(6000);
  await page.getByRole('button', { name: 'Pause simulation' }).click();
  expect(await kv(page, 'Simulated time')).toBeGreaterThan(1);
  expect(Math.abs(await kv(page, 'Relative energy error'))).toBeLessThan(1e-6);
  await shot(page, '31-sandbox-inner-solar-system', 'Experiment environment: Sun, Mercury–Mars and Jupiter seeded from today’s validated ephemeris (Derived), integrated with the Yoshida 4th-order symplectic integrator; orbit trails, energy-error plot (bounded, < 10⁻⁶) and angular-momentum conservation.');
});

test('32 compare: tenfold Jupiter mass diverges from the reference ephemeris', async ({ page }) => {
  await page.goto('/#/cosmic/sandbox?preset=inner&mode=compare');
  await page.waitForTimeout(1500);
  await page.locator('.left-panel .mol-list').getByRole('button', { name: /Jupiter/ }).click();
  await page.getByRole('button', { name: '×10', exact: true }).click();
  await expect(page.locator('.left-panel')).toContainText('Hypothetical');
  await page.getByLabel('Simulated days per second').fill('600');
  await page.getByRole('button', { name: 'Run simulation' }).click();
  await page.waitForTimeout(7000);
  await page.getByRole('button', { name: 'Pause simulation' }).click();
  await expect(page.locator('.right-panel')).toContainText('Divergence from the Explore ephemeris');
  await expect(page.locator('.right-panel')).toContainText('Jupiter mass ×10');
  await shot(page, '32-compare-heavy-jupiter', 'Compare environment: Jupiter’s mass ×10 (now labelled Hypothetical). White wireframes = reference JPL-element positions; the table quantifies how far each planet’s simulated orbit departs from reality.');
});

test('33 Lagrange points and Trojan stability', async ({ page }) => {
  await page.goto('/#/cosmic/sandbox?preset=trojans');
  await page.waitForTimeout(1200);
  await page.getByText(/Show Lagrange points/).click();
  await page.getByLabel('Simulated days per second').fill('2000');
  await page.getByRole('button', { name: 'Run simulation' }).click();
  await page.waitForTimeout(6000);
  await page.getByRole('button', { name: 'Pause simulation' }).click();
  await page.locator('.left-panel .mol-list').getByRole('button', { name: /L4 Trojan/ }).click();
  await expect(page.locator('.right-panel')).toContainText('Escape velocity from Sun here');
  await shot(page, '33-trojans-lagrange', 'Sun–Jupiter Lagrange points L1–L5 (CR3BP, violet markers) with Trojan bodies held at L4/L5 and a displaced Trojan librating — tadpole stability verified in tests over 20 Jupiter years. Instruments show speed, distance and escape velocities.');
});

test('34 figure-eight three-body choreography and a circumbinary planet', async ({ page }) => {
  await page.goto('/#/cosmic/sandbox?preset=figure-eight');
  await page.waitForTimeout(1200);
  await page.getByLabel('Simulated days per second').fill('300');
  await page.getByRole('button', { name: 'Run simulation' }).click();
  await page.waitForTimeout(5000);
  await page.getByRole('button', { name: 'Pause simulation' }).click();
  await shot(page, '34-figure-eight', 'Chenciner–Montgomery figure-eight: three equal solar masses on one shared orbit (periodicity verified in tests to 10⁻³ au after one period). Hypothetical configuration.');
  await page.getByLabel('Initial conditions').selectOption('binary');
  await page.waitForTimeout(800);
  await page.getByLabel('New body name').fill('Outer world');
  await page.getByLabel('Distance from primary in au').fill('5');
  await page.getByRole('button', { name: /Add around/ }).click();
  await expect(page.locator('.right-panel')).toContainText('added Outer world');
  await page.getByLabel('Simulated days per second').fill('500');
  await page.getByRole('button', { name: 'Run simulation' }).click();
  await page.waitForTimeout(5000);
  await page.getByRole('button', { name: 'Pause simulation' }).click();
  await shot(page, '34b-binary-added-planet', 'Binary star (2 × 1 M☉, 0.5 au) with a circumbinary planet and a user-added world at 5 au (circular velocity computed about the primary, logged in the event list).');
});

test('35 edits re-centre on the barycentre (net momentum stays ≈ 0)', async ({ page }) => {
  await page.goto('/#/cosmic/sandbox?preset=inner');
  await page.waitForTimeout(1200);
  await page.locator('.left-panel .mol-list').getByRole('button', { name: /Jupiter/ }).click();
  await page.getByRole('button', { name: '×10', exact: true }).click();
  await expect(page.locator('.right-panel')).toContainText('re-centred on the new barycentre');
  const p = await kv(page, 'Total momentum');
  expect(p).toBeLessThan(1e20); // vs ~2e29 without re-centring (Jupiter's momentum ~ 2.5e30 kg·km/s)
});

test('36 molecular dynamics: thermostatted ethanol at 500 K', async ({ page }) => {
  await page.goto('/#/atomic/molecules/pubchem-702?md=1');
  await expect(page.locator('.right-panel')).toContainText('Classical MD · VGFF-1 · qualitative', { timeout: 30_000 });
  await page.getByLabel('Target temperature in kelvin').fill('500');
  await page.getByRole('button', { name: /Re-initialise at 500 K/ }).click();
  await page.waitForTimeout(6000);
  const t = await kv(page, 'Simulated time');
  expect(t).toBeGreaterThan(0.05); // ps
  const T = await kv(page, 'Mean T');
  expect(T).toBeGreaterThan(300); expect(T).toBeLessThan(700);
  await shot(page, '36-md-ethanol-500K', 'Molecular dynamics (velocity Verlet on VGFF-1) of ethanol, Berendsen thermostat at 500 K: atoms vibrate in real time; instantaneous/mean temperature, kinetic and strain energy, and temperature/energy traces. Labelled Simulated and qualitative.');
  await page.getByLabel('Ensemble').selectOption('nve');
  await page.waitForTimeout(3000);
  await shot(page, '36b-md-ethanol-nve', 'Same molecule in the NVE ensemble: total energy fluctuates (∝ dt²) around a constant value instead of being thermostatted.');
});
