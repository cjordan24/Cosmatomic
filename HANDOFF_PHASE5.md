# Handoff — Voyager Ventures, start of Phase 5 (Interstellar & Stellar)

Written 2026-11-26 at the end of Phase 4. Read this first, then `DEVELOPMENT_ROADMAP.md`, `ARCHITECTURE.md`, `SCIENTIFIC_MODELS.md`, `DATA_SOURCES.md`, `KNOWN_LIMITATIONS.md`, `SCIENTIFIC_RELATIONSHIPS.md`, `FIELDS_ARCHITECTURE.md` and the tail of `BUILD_LOG.md`. `HANDOFF_PHASE4.md` keeps the full history of conventions; the essentials are repeated here.

## ▶ RESUME HERE

**State:** Phases 1–4 are complete (Phase 4 = Gates 4.1–4.7; Gate 4.7 is commit 54ddae8, deployed, 47/47 browser tests passed against production). **Phase 5 has not started. The user asked to review Phase 4 before Phase 5 begins: do not start Phase 5 until they say so.**

**Counts at the end of Phase 4:** 323 science tests (Vitest), 47 browser tests (Playwright), 18 dataset manifests, 67 Source-index entries.

## Landing page: four portals (carry forward, user decision 2026-11-26)

The landing page has four portals; CELLULAR stays greyed out with "Coming soon" under its title until Biologic Mode is built (Phase 11). At that point it becomes a live portal like the others (live scene, tagline, ENTER, transition, route, e2e test, screenshot). Every future environment must also get a matching intro portal.

Details: `src/modes/landing/Landing.tsx`; CELLULAR is a `<div class="portal cellular disabled" role="group" aria-disabled="true" aria-label="Cellular mode, coming soon">`, not a button or link. Tests: `phase1.spec.ts` 01 and 18, `phase4.spec.ts` 50 and 53. See `BIOLOGIC_MODE_SPEC.md`.

## Standing user rules

1. **Source Index:** every new value needs an entry in `src/shared/sources/sources.ts` (rendered at `#/sources`) with a link and a verified author note (`authorBio: null` if unverified; never guess). Add `datasets: [...]` for each manifest and `sources: [ids]` on records. Check DOIs with `curl https://api.crossref.org/works/<doi>` and fetch every URL. `tests/science/sources.test.ts` enforces coverage.
2. **Never invent scientific values.** Unknown shows as "unknown". Every value carries a provenance class (Observed / Derived / Simulated / Illustrative / Hypothetical) and models state their validity limits (`src/core/physics/modules.ts`).
3. **Standing authorisation:** after each gate, commit to `main`, push, `vercel deploy --prod`, run the browser suite against production. Report to the user at each phase boundary and stop for review.
4. Respect robots.txt, bot walls and rate limits. Off-limits for scraping: COD (robots disallow), AMCSD (bot wall), iso.org (Cloudflare wall). NIST WebBook (crawl-delay 5), CODATA (3), JANAF, IAPWS and refractiveindex.info are fine.
5. No API keys in client code; no paid infrastructure or new external services without explicit approval (Vercel Hobby and GitHub are approved). Never fabricate screenshots. No dependency on "Lodestar Digital Studio".
6. New relationships go through the registry (`SCIENTIFIC_RELATIONSHIPS.md`): sourced edges, `RelatedLinks` for both directions, planned entities have no route. New fields go through the `FieldLayer` interface (`FIELDS_ARCHITECTURE.md`).

## Environment and commands

```bash
export PATH=~/.local/node/bin:$PATH        # Node 24; `node` is NOT on the default PATH
cd "/Users/chrisjordan/Desktop/Voyager Ventures"
npm run dev | typecheck | test | build | test:e2e | data:validate
```

- No Python: write ingestion adapters in TypeScript under `scripts/ingestion/`, run with `node --experimental-strip-types`, using `scripts/ingestion/lib/ingest.ts` (`fetchText` with rate limits and cache; `writeDataset` writes the manifest + sha256).
- Scanned PDFs: no poppler; use Swift PDFKit (`PDFDocument(url:).page(at:).string`, or render a page to PNG and read it).
- Git: cjordan24 / cjordan24@users.noreply.github.com; `GIT_TERMINAL_PROMPT=0 git push origin main`. Commit trailer:
  ```
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_012kk9KUmhZje176cLaiTwHQ
  ```
- Deploy: `npx vercel deploy --prod --yes --project voyager-ventures`. Live test: build a `playwright.live.config.ts` with `sed` (base URL → https://voyager-ventures.vercel.app, delete the whole `webServer` block), run it, delete it, then `git checkout -- screenshots`.
- Full e2e runs regenerate earlier phases' screenshots: `git checkout -- screenshots/phase-01 screenshots/phase-02 screenshots/phase-03 screenshots/phase-04` before committing, keeping only the new phase's folder (unless a gate deliberately changes older screenshots, as 4.7 did for 01/18).
- Playwright: elements with `aria-disabled="true"` need `click({ force: true })`. `tests/e2e` has no DOM lib: pass `page.evaluate` a string or cast element types.

## Stack gotchas (unchanged)

React 19, TS 5.9, Vite 8, three 0.187, R3F 9, drei 10, Zustand 5, Vitest 5, Playwright 1.65 (SwiftShader). Don't use drei `<Html>` (use `src/rendering/labels.tsx`). Hash routes in `src/shared/router.ts`, lazy views in `src/App.tsx`, chips in `src/ui/TopBar.tsx`. New views use `center-stage` between `left-panel` and `right-panel` (never nest a right panel in the stage). Plots use `src/ui/plots` `LinePlot` with quantity + unit axis labels. Simulations step in simulated time with a carried remainder and have chunking-independence tests. Don't use perl with `|` delimiters on code containing `|`; never write `*/` inside a block comment; complex code edits are safest with the Edit tool or a node script file (not inline `node -e` with nested quotes).

## Phase 5 — proposed gates (re-assess before starting)

Placeholders already exist under `src/modes/cosmic/` (star-systems, galaxies, nebulae, black-holes, universe).

1. **5.1 Nearby-star catalogue:** stars within ~20 pc with positions, proper motions, parallaxes, spectral types and magnitudes. Candidate sources: Gaia DR3 via the ESA Gaia Archive TAP (check terms and rate limits first), the RECONS/CNS5 nearby-star lists (check licence). Route e.g. `#/cosmic/stars`, its own frame and scale level.
2. **5.2 Stellar classes and the HR diagram:** MK classes with cited temperature/luminosity calibrations; an interactive HR diagram from the catalogue; the Sun placed from IAU 2015 nominal values.
3. **5.3 Exoplanets:** NASA Exoplanet Archive (TAP, public) for nearby systems; orbits drawn only from published elements, with uncertainties.
4. **5.4 Stellar spectra and thermal radiation:** reuse `em.ts` Planck and the atlas; link each star to its blackbody model (registry edge star → spectrum, like the Sun) and to element lines; state that real stellar spectra are not blackbodies.
5. **5.5 Cross-links and portal check:** star ↔ element composition, star ↔ Spectral; no new landing portal (stars live inside COSMIC).

## Open caveats carried forward

See `KNOWN_LIMITATIONS.md`. Notable: Voyager 2 at Neptune comes ~15 % too far out (JPL coarse trajectory); VGFF-1 is qualitative; RDKit is ~7 MB; ISO 20473 not available; FIELDS layers are analytic only; the heat layer ignores convection.
