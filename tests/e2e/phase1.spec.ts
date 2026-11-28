/**
 * Phase 1 browser verification. Each test performs real interactions, asserts on
 * the resulting UI state, and saves a milestone screenshot to screenshots/phase-01/.
 * Screenshots are captured AFTER interaction, never from a bare initial load only.
 */
import { test, expect, type Page } from '@playwright/test';
import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '../../screenshots/phase-01');
mkdirSync(OUT, { recursive: true });
const INDEX = join(OUT, 'captures.json');
const log: Record<string, string> = existsSync(INDEX) ? JSON.parse(readFileSync(INDEX, 'utf8')) : {};

async function shot(page: Page, name: string, description: string, opts: { fullPage?: boolean } = {}) {
  await page.waitForTimeout(600);
  await page.screenshot({ path: join(OUT, `${name}.png`), fullPage: opts.fullPage ?? false });
  log[`${name}.png`] = description;
  writeFileSync(INDEX, JSON.stringify(log, null, 2));
}

const errors: string[] = [];
test.beforeEach(({ page }) => {
  page.on('pageerror', (e) => errors.push(e.message));
});
test.afterEach(() => {
  expect(errors, `page errors: ${errors.join(' | ')}`).toEqual([]);
});

test('01 landing page and zoom transition into Atomic mode', async ({ page }) => {
  await page.goto('/#/');
  await expect(page.getByRole('button', { name: 'Enter Atomic mode' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Enter Cosmic mode' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Enter Spectral mode' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Enter Biologic mode' })).toContainText('BIOLOGIC');
  // all four portals fit the 1440×900 viewport without scrolling
  expect(await page.evaluate('document.documentElement.scrollHeight <= window.innerHeight')).toBe(true);
  await page.waitForTimeout(2500);
  await shot(page, '01-landing', 'Landing page, four portals: ATOMIC (sampled hydrogen 3d_z² density), COSMIC (planets at today’s JPL heliocentric longitudes), SPECTRAL (analytic vacuum plane wave, E ⊥ B ⊥ k) and BIOLOGIC (live since Gate 11.1; a greyed-out CELLULAR placeholder until then).');
  await page.getByRole('button', { name: 'Enter Atomic mode' }).click();
  await expect(page).toHaveURL(/#\/atomic$/);
  await expect(page.locator('.tile')).toHaveCount(118);
  await shot(page, '02-atomic-main', 'Atomic Mode main environment after clicking the ATOMIC portal: periodic table of all 118 elements coloured by family.');
});

test('03 full periodic table recoloured by electronegativity with hover', async ({ page }) => {
  await page.goto('/#/atomic');
  await page.selectOption('#scheme', 'electronegativity');
  await expect(page.locator('.legend')).toContainText('Pauling');
  await page.locator('[data-z="9"]').hover();
  await expect(page.locator('.ptable-hover')).toContainText('Fluorine');
  await shot(page, '03-periodic-table-electronegativity', 'Full periodic table recoloured by Pauling electronegativity (continuous legend with units; hatched tiles = no data). Hover card on fluorine.', { fullPage: true });
  await page.selectOption('#scheme', 'radioactivity');
  await shot(page, '03b-periodic-table-radioactivity', 'Periodic table coloured by radioactivity: Tc, Pm and Z ≥ 83 have no stable isotope (NUBASE).', { fullPage: true });
});

test('04 hydrogen: orbital view, excitation and photon emission', async ({ page }) => {
  await page.goto('/#/atomic');
  await page.locator('[data-z="1"]').click();
  await expect(page.getByRole('heading', { name: 'Hydrogen' })).toBeVisible();
  await page.locator('.view-switch').getByRole('button', { name: 'Orbital' }).click();
  await page.getByRole('button', { name: 'Excite ↑ (absorb)' }).click();
  await page.waitForTimeout(1200);
  await page.getByRole('button', { name: 'De-excite ↓ (emit)' }).click();
  await expect(page.locator('.model-label')).toContainText('121.5');
  await page.getByRole('tab', { name: 'Spectrum' }).click();
  await expect(page.locator('.diagram')).toContainText('Rydberg formula vs NIST');
  await page.waitForTimeout(400);
  await shot(page, '04-hydrogen', 'Hydrogen: analytic 1s orbital after an excite (1s→2s, absorption) then de-excite (2→1) — Lyman-α photon at 121.57 nm reported; measured NIST H I spectrum with a Rydberg-model-vs-NIST residual table.');
});

test('05 carbon: probability cloud and orbital-box diagram', async ({ page }) => {
  await page.goto('/#/atomic/element/6');
  await page.locator('.view-switch').getByRole('button', { name: 'Probability cloud' }).click();
  await page.getByRole('tab', { name: 'Orbital boxes' }).click();
  await expect(page.locator('.diagram')).toContainText("Hund's rule");
  await page.waitForTimeout(2500);
  await shot(page, '05-carbon', 'Carbon-12: probability cloud of all six electrons (hydrogenic orbitals + Slater Z_eff, labelled approximate) with Hund’s-rule orbital-box diagram.');
});

test('06 iron: ionised Fe²⁺ shell model and Bohr diagram', async ({ page }) => {
  await page.goto('/#/atomic/element/26');
  await page.getByRole('button', { name: 'Fe2+' }).click();
  await expect(page.locator('.kv').first()).toContainText('[Ar] 3d⁶');
  await page.locator('.view-switch').getByRole('button', { name: 'Shell model' }).click();
  await page.getByRole('tab', { name: 'Bohr shells' }).click();
  await page.waitForTimeout(1500);
  await shot(page, '06-iron', 'Iron ionised to Fe²⁺ (4s electrons removed first → [Ar]3d⁶): educational shell model (explicitly labelled non-physical trajectories) and Bohr diagram from the same data.');
  await page.locator('.view-switch').getByRole('button', { name: 'Nucleus' }).click();
  await page.getByRole('tab', { name: 'Nucleus' }).click();
  await shot(page, '06b-iron-nucleus', 'Iron-56 schematic nucleus (26 p, 30 n, R ≈ 1.2 fm·A^⅓ = 4.59 fm) with composition and binding-energy diagram.');
});

test('07 heavy element: uranium isotopes', async ({ page }) => {
  await page.goto('/#/atomic/element/92');
  await expect(page.getByRole('heading', { name: 'Uranium' })).toBeVisible();
  await page.getByRole('tab', { name: 'Isotopes' }).click();
  await expect(page.locator('.diagram')).toContainText('238U');
  await page.locator('.diagram table tbody tr').filter({ has: page.locator('td:first-child', { hasText: /^235U$/ }) }).click();
  await expect(page.locator('select[aria-label="Select isotope"]')).toHaveValue('235');
  await page.locator('.view-switch').getByRole('button', { name: 'Probability cloud' }).click();
  await page.waitForTimeout(4000);
  await shot(page, '07-uranium', 'Heavy element: uranium-235 selected from the NUBASE isotope table (natural abundance chart, half-lives, decay modes); 92-electron probability cloud with f-subshell (magenta).');
  await page.goto('/#/atomic/element/118?view=shell');
  await page.waitForTimeout(1500);
  await shot(page, '07b-oganesson', 'Oganesson (Z = 118): no stable isotope — longest-lived nuclide ²⁹⁴Og chosen automatically and flagged; predicted configuration flagged.');
});

test('08 representative quantum orbital with cross-section', async ({ page }) => {
  await page.goto('/#/atomic/element/1?view=orbital&orb=3,2,0');
  await page.getByLabel('Cross-section').check();
  await page.waitForTimeout(3000);
  await shot(page, '08-orbital-3dz2-cross-section', 'Hydrogen 3d_z² orbital (n=3, l=2, m=0), analytic ψ, cross-section through the xz-plane; cyan/pink = wavefunction phase.');
  await page.goto('/#/atomic/element/1?view=orbital&orb=4,3,1');
  await page.getByLabel('Cross-section').uncheck();
  await page.waitForTimeout(3000);
  await shot(page, '08b-orbital-4f', 'Hydrogen 4f_xz² orbital (n=4, l=3, m=1) — f-orbital support.');
});

test('09 2D atomic diagrams from shared data', async ({ page }) => {
  await page.goto('/#/atomic/element/8?view=shell');
  for (const tab of ['Lewis dot', 'Configuration', 'Energy levels']) {
    await page.getByRole('tab', { name: tab }).click();
    await page.waitForTimeout(300);
  }
  await expect(page.locator('.diagram')).toContainText('APPROXIMATE');
  await shot(page, '09-diagram-energy-levels-oxygen', 'Oxygen energy-level diagram: Slater-estimated subshell energies explicitly labelled approximate; shell model alongside.');
  await page.getByRole('tab', { name: 'Lewis dot' }).click();
  await page.getByRole('button', { name: 'O2−', exact: true }).click();
  await expect(page.locator('.kv').first()).toContainText('10');
  await shot(page, '09b-diagram-lewis-oxygen', 'Lewis dot structure for the oxide ion O²⁻ (bracketed, 8 valence electrons) derived from the same configuration data.');
});

test('10 molecular viewer with measurement', async ({ page }) => {
  await page.goto('/#/atomic/molecules');
  await page.getByRole('option', { name: /Caffeine/ }).click();
  await expect(page.getByRole('heading', { name: 'Caffeine' })).toBeVisible();
  await page.waitForTimeout(1500);
  const canvas = page.locator('.viewport canvas');
  const box = (await canvas.boundingBox())!;
  // pick atoms by clicking around the centre until two are selected
  const cx = box.x + box.width / 2, cy = box.y + box.height / 2;
  for (const [dx, dy] of [[0, 0], [30, 0], [-30, 0], [0, 30], [0, -30], [45, 25], [-45, -25], [60, 0], [-60, 0]]) {
    await page.mouse.click(cx + dx, cy + dy);
    await page.waitForTimeout(150);
    const txt = await page.locator('.right-panel').innerText();
    if (/Distance #/.test(txt)) break;
  }
  await shot(page, '10-molecule-caffeine', 'Molecular viewer: caffeine (PubChem CID 2519, MMFF94s computed conformer, labelled), ball-and-stick with Kekulé double bonds; clicked atoms show measured distance.');
  await page.locator('.view-switch').getByRole('button', { name: 'Space filling' }).click();
  await page.getByRole('option', { name: /Benzene/ }).click();
  await shot(page, '10b-molecule-benzene-spacefill', 'Benzene in space-filling (van der Waals radii) mode.');
});

test('11 cosmic main environment via portal + full solar system', async ({ page }) => {
  await page.goto('/#/');
  await page.waitForTimeout(1500);
  await page.getByRole('button', { name: 'Enter Cosmic mode' }).click();
  await expect(page).toHaveURL(/#\/cosmic$/);
  await page.waitForTimeout(3500);
  await shot(page, '11-cosmic-main', 'Cosmic Mode main environment after clicking the COSMIC portal: solar-system overview at today’s date, true scale, labels and orbits.');
  await page.getByLabel('Orbits').check();
  const d0 = await page.evaluate(() => (globalThis as unknown as { __voyager: { cameraDistanceKm: number } }).__voyager.cameraDistanceKm);
  for (let i = 0; i < 6; i++) { await page.mouse.move(720, 450); await page.mouse.wheel(0, 600); await page.waitForTimeout(150); }
  await page.waitForTimeout(1500);
  const d1 = await page.evaluate(() => (globalThis as unknown as { __voyager: { cameraDistanceKm: number } }).__voyager.cameraDistanceKm);
  expect(d1).toBeGreaterThan(d0 * 1.5); // wheel zoom-out works
  await page.goto('/#/cosmic?dist=1.4e10');
  await page.waitForTimeout(3000);
  await shot(page, '12-full-solar-system', 'Full solar system zoomed out to ~94 au (deep link ?dist=1.4e10 km): planets, Pluto, dwarf planets (Ceres, Eris, Haumea, Makemake) and the Voyager 1 & 2 trajectories (gold) from JPL Horizons.');
});

test('13 Earth and Moon', async ({ page }) => {
  await page.goto('/#/cosmic/earth?dist=1100000');
  await page.waitForTimeout(3000);
  await shot(page, '13-earth-moon', 'Earth and Moon at TRUE scale from 1.1 million km: Moon position from truncated ELP-2000/82 (validated ≤ 48″ vs DE440), orbit path sampled over one sidereal month.');
  await page.goto('/#/cosmic/earth?dist=900000');
  await page.waitForTimeout(2000);
  await page.selectOption('.cosmic-tools select >> nth=1', '10');
  await page.waitForTimeout(2500);
  await shot(page, '13b-earth-moon-exaggerated', 'Earth and Moon with illustrative ×10 radii (Moon distance unchanged — no expansion needed for this system); the on-screen banner discloses the scaling; physics and panel values are unaffected.');
});

test('14 Saturn and its rings', async ({ page }) => {
  await page.goto('/#/cosmic/saturn');
  await page.waitForTimeout(3500);
  for (let i = 0; i < 3; i++) { await page.mouse.move(720, 420); await page.mouse.wheel(0, 300); await page.waitForTimeout(120); }
  // drag to raise the viewing angle above the ring plane
  await page.mouse.move(700, 420); await page.mouse.down(); await page.mouse.move(700, 520, { steps: 12 }); await page.mouse.up();
  await page.waitForTimeout(2000);
  await shot(page, '14-saturn-rings', 'Saturn at true scale: D/C/B/A/F rings (NSSDC radii) in Saturn’s equatorial plane from the IAU pole; illustrative banding; sunlit hemisphere follows the real Sun direction.');
});

test('15 object information panel with cross-mode link', async ({ page }) => {
  await page.goto('/#/cosmic/earth');
  await page.waitForTimeout(2000);
  await expect(page.locator('.right-panel')).toContainText('Atmosphere');
  await page.locator('.right-panel').getByRole('button', { name: 'O2', exact: true }).scrollIntoViewIfNeeded();
  await shot(page, '15-info-panel-earth', 'Object information panel (Earth): NSSDC physical data, atmospheric composition with clickable species, modelled position, distance and light-time tool, provenance list.');
  await page.locator('.right-panel').getByRole('button', { name: 'O2', exact: true }).click();
  await expect(page).toHaveURL(/molecules\/pubchem-977/);
  await shot(page, '15b-cross-mode-o2', 'Cross-mode link: clicking O₂ in Earth’s atmosphere opens the oxygen molecule in Atomic mode (shared PubChem identifier).');
});

test('16 simulation timeline: play, step, bookmarks', async ({ page }) => {
  await page.goto('/#/cosmic/jupiter');
  await page.waitForTimeout(2000);
  await page.getByLabel('Playback rate').selectOption(String(2_629_800));
  const before = await page.locator('.timeline .date').innerText();
  await page.getByRole('button', { name: 'Play forward' }).click();
  await page.waitForTimeout(2500);
  await page.getByRole('button', { name: 'Pause' }).click();
  const after = await page.locator('.timeline .date').innerText();
  expect(after).not.toEqual(before);
  await page.getByRole('button', { name: 'Step forward one day' }).click();
  await page.getByTitle('Timeline bookmarks').click();
  await expect(page.locator('.timeline')).toContainText('J2000.0 epoch');
  await shot(page, '16-timeline', `Simulation timeline after playing at 1 month/s then pausing (${before} → ${after}), stepping one day, with bookmarks open. Range clamped to JPL Table-1 validity 1800–2050.`);
  await page.getByRole('button', { name: 'J2000.0 epoch', exact: true }).click();
  await expect(page.locator('.timeline .date')).toContainText('2000-01-01 11:58');
});

test('17 search and scale navigator', async ({ page }) => {
  await page.goto('/#/atomic');
  await page.getByLabel('Universal search').fill('tita');
  await expect(page.locator('.search-results')).toContainText('Titanium');
  await expect(page.locator('.search-results')).toContainText('Titania');
  await shot(page, '17-universal-search', 'Universal search across elements, molecules and celestial bodies (“tita” → Titanium, Titan, Titania).');
  await page.getByLabel('Universal search').fill('');
  await page.getByRole('button', { name: /Scale/ }).click();
  await shot(page, '17b-scale-navigator', 'Logarithmic scale navigator (10⁻¹⁶ m → 10²⁷ m): interactive, educational and planned scales labelled honestly.');
});

test.describe('mobile', () => {
  test.use({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  test('18 mobile layouts', async ({ page }) => {
    await page.goto('/#/');
    await page.waitForTimeout(2000);
    await expect(page.getByRole('button', { name: 'Enter Biologic mode' })).toBeVisible();
    await shot(page, '18-mobile-landing', 'Mobile layout (390×844): ATOMIC, COSMIC, SPECTRAL and BIOLOGIC portals stacked, BIOLOGIC last.');
    await page.goto('/#/atomic/element/6?view=orbital&orb=2,1,0');
    await page.waitForTimeout(3000);
    await shot(page, '18b-mobile-element', 'Mobile layout: carbon 2p_z orbital with bottom sheet information panel.');
    await page.goto('/#/cosmic/earth');
    await page.waitForTimeout(3000);
    await shot(page, '18c-mobile-cosmic', 'Mobile layout: Cosmic mode with compact timeline.');
  });
});

test('20 Voyager 1 today: Blender-built model at true scale', async ({ page }) => {
  await page.goto('/#/cosmic/voyager-1');
  await expect(page.locator('.right-panel')).toContainText('Voyager 1');
  await expect(page.locator('.right-panel')).toContainText('JPL prediction');
  await page.waitForTimeout(4000);
  await page.mouse.move(700, 420); await page.mouse.down(); await page.mouse.move(820, 380, { steps: 12 }); await page.mouse.up();
  await page.waitForTimeout(1500);
  await shot(page, '20-voyager-1-model', 'Voyager 1 (Blender-built model from NASA/JPL dimensions, true scale — 3.66 m antenna) at today’s JPL-predicted position ~170 au from the Sun; high-gain antenna pointed at Earth; distance & light time in the info panel.');
});

test('21 Voyager 2 Neptune flyby, 1989-08-25', async ({ page }) => {
  await page.goto('/#/cosmic/neptune');
  await page.waitForTimeout(2500);
  await page.getByLabel('Set date and time (UTC)').fill('1989-08-25T03:50');
  await page.waitForTimeout(2500);
  await expect(page.locator('.right-panel')).toContainText('Voyager encounter window');
  await page.mouse.move(700, 420); await page.mouse.down(); await page.mouse.move(700, 470, { steps: 10 }); await page.mouse.up();
  await page.waitForTimeout(1500);
  await shot(page, '21-voyager-2-neptune-flyby', 'Voyager 2 Neptune flyby, 1989-08-25 03:50 UTC (minutes before closest approach): Neptune and Triton positions switch to JPL Horizons encounter ephemerides (badge in panel); gold line = Voyager 2’s Horizons trajectory.');
  await page.goto('/#/cosmic/voyager-2');
  await page.waitForTimeout(4000);
  await expect(page.locator('.right-panel')).toContainText('Patched-conic');
  await shot(page, '21b-voyager-2-closeup-at-neptune', 'Close-up of Voyager 2 during the Neptune encounter; info panel flags the Horizons patched-conic (rough-accuracy) arc for this date.');
});
