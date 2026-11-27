# Handoff — Voyager Ventures, Phase 8 (Unified Scale & Relationships)

Written 2026-11-27 after Gate 8.2. Read this first, then `DEVELOPMENT_ROADMAP.md` (Phase 8 gates table), `SCIENTIFIC_MODELS.md` §27–§28, `SCIENTIFIC_RELATIONSHIPS.md`, `KNOWN_LIMITATIONS.md` (Phase 8 section) and the end of `BUILD_LOG.md`. `HANDOFF_PHASE7_REVIEW.md` holds the older history; the essentials are repeated below.

## ▶ RESUME HERE

**State (2026-11-27, end of Phase 8; see the last commit on `main`):**
- **Phase 8 is complete:** 8.1 scale navigator · 8.2 relationship explorer · 8.3 integrated spectroscopy `#/spectral/compare` · 8.4 shared instruments · E.2 encyclopedia (celestial objects, elements, molecules) · 8.5 unified notebook (📓 → Snapshot this view) · 8.6 pathways `#/relations?tab=pathways`. **Stopped at the Phase 8 boundary for the user's review.** Do not start Phase 9 without approval.
- The user said “Don't deploy, just continue working”, and later “Continue through the next gates on auto mode, don't wait to write handoffs”. **Nothing since Gate 7.5 is deployed:** production still serves `index-Qc9NTZFA.js`. Ask before deploying.
- **Deploy blocker diagnosed:** the Vercel CLI is logged in (`lodestar404`). Claude Code's auto-mode classifier blocks production deploys because no permission rule allows them. Fix, with the user's consent: add `Bash(npx vercel deploy --prod --yes --project voyager-ventures)` to `.claude/settings.local.json`. Until then, give the user the command below:
  `! export PATH=~/.local/node/bin:$PATH && cd "/Users/chrisjordan/Desktop/Voyager Ventures" && npx vercel deploy --prod --yes --project voyager-ventures`
  Then compare production's `index-*.js` with `dist/assets`, run the live suite and record it in `BUILD_LOG.md`.

**Counts:** 636 science tests (Vitest, 36 files), 72 browser tests (Playwright, 8 spec files; next test number is 79), 36 dataset manifests, 131 Source-index entries. Registry: 436 entities, 140 edges.

## What Phase 8 added

| Gate | What | Code | Tests |
|---|---|---|---|
| 8.1 | `#/scale?z=<log10 m>&sel=<id>`: powers-of-ten zoom from 10⁻¹⁶ to 10²⁷·⁵ m; 29 reference lengths drawn to one linear scale, each read from bundled data with interval, provenance class and sources; log ruler; *Galaxy clusters* scale level now interactive (Coma) | `src/modes/scale/{references.ts,ScaleView.tsx}`; “Open the scale explorer →” in the Scale navigator | `tests/science/scale.test.ts` (15); e2e 72 |
| 8.2 | `#/relations?tab=map\|path\|links\|planned&e=&depth=&from=&to=&types=&q=&stars=1`: neighbourhood map, shortest chain of sourced edges, all-links table, planned entities; registry stats (199 entities, 140 edges, 27 groups, 45 unlinked) | `src/modes/relations/RelationsView.tsx`, `src/shared/scientific-relationships/graph.ts`; 🔗 in the top bar and ☰ menu; “map ↗” in `RelatedLinks` | `tests/science/relations.test.ts` (10); e2e 73 |
| 8.3 | `#/spectral/compare?ax=&lo=&hi=&L=&z=&x=&sel=`: NIST lines, nebula lines at NIST rest λ, blackbodies (Sun, class V dwarfs, CMB), 43 FIRAS points, n(λ) of 9 materials on one λ/ν/E log axis; continuum as λB_λ = νB_ν; observed/model labels; (1 + z) transformation of line and stellar layers only; molecular IR listed as not bundled | `src/modes/spectral/compare/{layers.ts,CompareView.tsx}`; *Compare* Spectral chip; Spectral sections in phone ☰ | `compare.test.ts` (21); e2e 74 |
| 8.4 | Shared instruments: `UnitValue`, `Probe`, `Ruler`, `TimeSeriesView` (stats, CSV), `UnitConverter` (in the Scale navigator) across Sandbox, Cosmic, Wave lab (`px` probe) and Fields (pin a point); unit choice per dimension shared (localStorage); new units incl. Hz, V, V/m, J/kg, gₙ | `src/shared/instruments/instruments.ts`, `src/ui/instruments.tsx`, `src/core/units/*` | `instruments.test.ts` (11); e2e 75 |
| E.2 | Encyclopedia: 12 bodies (NASA Facts pages), 118 elements (LANL, with its reuse notice), 129 molecules (PubChem text from ChEBI data, CC BY 4.0); About sections in Cosmic/element/molecule panels; elements and molecules lazy-loaded; bodies, elements, molecules registered (436 entities) | `scripts/ingestion/encyclopedia-{nasa-solar-system,lanl-elements,molecules}.ts`, `datasets/encyclopedia/*.json`, `src/shared/encyclopedia/encyclopedia.ts` (`useEncyclopedia`, `EntityBio`) | `encyclopedia.test.ts` (17); e2e 76, 66 updated |
| 8.5 | Unified notebook: 📓 menu → *Snapshot this view* (route, params, `dl`/`data-reading` readouts, provenance badges, `data-source` ids, live series, canvas screenshot, `__APP_VERSION__`/`__APP_COMMIT__`); JSON/CSV/Markdown for every entry; old experiments read via `unify` (not rewritten) | `src/shared/snapshot.ts`, `src/ui/Snapshot.tsx`, `src/ui/NotebookView.tsx`, `src/shared/instruments/liveSeries.ts`, `vite.config.ts` define | `snapshot.test.ts` (8); e2e 77, 38 updated |
| 8.6 | Pathways `#/relations?tab=pathways&p=&s=`: 5 curated walks; every step an existing sourced edge; stop shows incoming edge + encyclopedia entry; broken links reported | `src/shared/pathways/pathways.ts`, Pathways tab in `RelationsView.tsx` | `pathways.test.ts` (5); e2e 78 |

**Lessons from this phase:**
- NIST’s CODATA pages (`physics.nist.gov/cgi-bin/cuu/Value?…`) now serve **CODATA 2022**, not 2018. Check the edition before citing; `codata-2022` is in the Source index (the proton radius uses it; the rest of `constants.ts` is still CODATA 2018).
- **Top-bar width:** at 1440 px the rightmost top-bar element must be ≤ 1440 (tests 17 and 58). With six icon buttons, Cosmic mode sits at 1427 px. Crowded bars use 6 px gaps and 7 px padding (`theme.css`, the `many-chips` media rule), and search is at most 306 px. Adding another top-bar button will overflow, so put new entry points in menus instead.
- `RelatedLinks` buttons are matched by substring in older e2e tests, so the “map ↗” button’s accessible name is just “Relationship map” (no entity label).
- **Sources checked this phase:** education.jlab.org disallows ClaudeBot and anthropic-ai, so don't use Jefferson Lab text, even through PubChem. The old LANL periodic table (periodic.lanl.gov) is gone; the current pages are at lanl.gov/science-engineering/periodic-table/element/<name> (robots allow; the reuse notice must go with every copy). NASA Science Facts pages and the ChEBI licence (CC BY 4.0) are fine. PubChem's ChEBI link can name the wrong entity (an atom or a class), so reject those.
- **The 📓 top-bar button is now a menu.** Tests open the notebook via `menu 'Notebook' → menuitem 'Open notebook'`.
- **Committing gates separately:** when work on two gates overlaps in the tree, stage one gate's files, run `git stash push --keep-index -u`, typecheck, then `git stash pop`. Don't edit `*.spec.ts` or run a build while the e2e suite runs.

## Next

Phase 8 needs the user's review first. Then:
- Deploy only if the user asks (see the blocker note above).
- Phase 9 needs explicit approval: Applied Waves & Communications, 9.1 EM fields & antennas · 9.2 RF/wireless atlas · 9.3 3D communications room · 9.4 modulation lab · 9.5 acoustic lab · 9.6 audio synthesis/FFT · 9.7 room acoustics & resonance (`DEVELOPMENT_ROADMAP.md`).
- Open threads: pathways are limited to the 140 registered edges, and the E.2 entities have none; molecular IR data is not bundled; a snapshot reopens only URL-held state.

## Standing user rules (unchanged)

1. **Source index.** Every new value needs an entry in `src/shared/sources/sources.ts` (rendered at `#/sources`) with a link and a verified author note (`authorBio: null` if unverified; never guess). Add `datasets: [...]` per manifest and `sources: [ids]` on records. Check DOIs with Crossref; read affiliations from the paper’s first page.
2. **Never invent scientific values.** Unknown values show as “unknown”. Every value carries a provenance class (observed / derived / simulated / illustrative / hypothetical); every model states its validity limits (`src/core/physics/modules.ts`). Explanatory text must be sourced. Store each published value with its interval type.
3. **Gate routine:** commit to `main`, push, ask the user about deploying (see above), report at the phase boundary and stop for review.
4. **Respect robots.txt, bot walls and rate limits.**
   - Off-limits: iopscience.iop.org; wiki.cosmos.esa.int; COD, AMCSD, iso.org and the SIMBAD CfA mirror; the NASA Exoplanet Archive; export.arxiv.org; Springer link.springer.com PDFs; gwosc.org `/catalog/`, `/archive/` and the per-event data directories.
   - Fine: arxiv.org `/abs` and `/pdf` (crawl-delay 15 s), the Crossref API, the VizieR CfA mirror, exoplanet.eu, OpenStax, SPARC, esahubble.org, esawebb.org, eso.org/public, lambda.gsfc.nasa.gov, www.cosmos.esa.int, irsa.ipac.caltech.edu `.txt` files, science.nasa.gov and nasa.gov, gwosc.org `/eventapi/`, and physics.nist.gov (no robots.txt).
5. **No secrets, paid services or fabricated images.** Images only with a stated reuse licence and visible credit.
6. **Shared mechanisms.** New relationships go through the registry (sourced edges, both directions). New fields go through `FieldLayer`.
7. **Encyclopedia:** verbatim cited excerpts only, never text written by Claude; open sources preferred; no Wikipedia.

## Environment and commands

```bash
export PATH=~/.local/node/bin:$PATH        # Node 24
cd "/Users/chrisjordan/Desktop/Voyager Ventures"
npm run dev | typecheck | test | build | test:e2e | data:validate
npx playwright test --config tests/e2e/playwright.config.ts tests/e2e/phase8.spec.ts   # one spec
```

- A full local e2e run takes about 10 min; run it in the background. While it runs, don’t edit `*.spec.ts` or run `npm run build`. Afterwards run `git checkout -- screenshots/phase-0{1,2,3,4,5,6,7}` before committing (Phase 8 screenshots are committed).
- To look at a view: `npx vite preview --port 4174` after `npm run build`, then a scratch Playwright `.cjs` in the scratchpad run with `NODE_PATH=$(pwd)/node_modules node …`. Check 1440 × 900 and 390 × 844 (scroll width must stay 390).
- `npm run build` also typechecks `scripts/` and `tests/`. Science tests have no Node types; import JSON through `@datasets/...`. E2E specs have no DOM types.
- Live test against production: build `tests/e2e/playwright.live.config.ts` with sed (base URL `https://voyager-ventures.vercel.app`, delete the `webServer` block), run it in the background, then delete the config and `git checkout -- screenshots`.

**Commit trailer:**

```
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_012kk9KUmhZje176cLaiTwHQ
```
