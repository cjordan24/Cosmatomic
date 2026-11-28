# Handoff — Voyager Ventures, Phases 11–14 (autonomous run)

Written 2026-11-28, before the context is cleared. **Read this file first and work from it.** Then skim `DEVELOPMENT_ROADMAP.md` (status table), `BIOLOGIC_MODE_SPEC.md`, the end of `BUILD_LOG.md`, `KNOWN_LIMITATIONS.md` and `research/SOURCE_NOTES_2026-11.md` (verified page/equation references from Phases 9–10). `HANDOFF_PHASE10.md` describes the state at the end of Phase 10; older handoffs hold earlier history.

## ▶ THE INSTRUCTION

On 2026-11-28 the user said: **“Go ahead and continue through the remaining phases, continue work and don't stop to publish until phase 14 is completely done.”**

So:
- Build **all of Phases 11, 12, 13 and 14** (7 gates each, 28 gates) **without stopping for review between phases**.
- Keep the gate routine: one commit per gate on `main`, push after each gate, docs and tests per gate.
- **Do not deploy and do not ask about deploying** until Phase 14 is complete. Then: run the full browser suite, update this handoff (or write `HANDOFF_PHASE14.md`), report to the user, and give them the deploy command (below).
- Only stop early if something genuinely needs the user (a decision that is theirs, a blocked permission). Otherwise keep going.
- The standing rules below still apply in full. Quality is not to be traded for speed: if a gate has no open source for some content, leave that content out and document it, as in Phases 9–10.

## ▶ PROGRESS LOG (update as gates land)

- **Phase 11 complete (2026-11-28):** 11.1 0487514 · 11.2 4e52562 · 11.3 b9ef5e5 · 11.4 d9f0b3b · 11.5 081aecf · 11.6 f4f7b6c · 11.7 d4050c5 (+ fix 0e3f379). 854 science tests, browser tests 94–100, 49 manifests, 208 sources. Biologic routes: `#/biologic` (scale of life), `/molecules`, `/proteins`, `/cells`, `/membranes`, `/transport`, `/plants`; top bar: Scale of life · Molecules ▾ · Cell biology ▾ · Plants & microbes (room for one more chip or menu at 1440 px — use a menu for Phase 12, e.g. **Body ▾**).
- **Phase 12 complete (2026-11-28):** 12.1 49ed0b9 · 12.2–12.3 4056d97 · 12.4 2654619 · 12.5–12.7 970207c. 888 science tests, browser tests 101–106, 53 manifests, 219 sources. Body ▾ menu (Human body, Movement, Circulation & breathing, Nerves, Organ systems, From body to molecule). BodyParts3D organs built by `scripts/blender/build_body.py` (needs the BP3D OBJ zip unpacked; part lists in `scripts/ingestion/data/`). Research notes: `research/SOURCE_NOTES_PHASE12.md`. Phase 13 research agents launched; full e2e run in background.
- **Phase 13 complete (2026-11-28):** 13.1–13.3 senses 3595906 · 13.4–13.7 imaging (next commit). Browser tests 107–108. End-of-Phase-12 full suite: 100/100.
- **New off-limits (found in Phase 11):** pubchem.ncbi.nlm.nih.gov (robots disallows ClaudeBot since 2026-10-29: keep bundled data, never fetch), book.bionumbers.org, europepmc.org, biodiversitylibrary.org, jbc.org (robots); cdc.gov, niaid.nih.gov, rupress.org, photochemcad.com, nih.gov (robots 403); nobelprize.org (terms); data.rcsb.org/rest (use files.rcsb.org). Research notes: `research/SOURCE_NOTES_PHASE11.md`.
- **Queued after Phase 14 (user, 2026-11-28):** **Phases 15–19 Computing & Engineering** (`COMPUTING_ENGINEERING_BRIEF.md`, verbatim; begin once Phase 14 is complete, no confirmation needed), then the **Meteorology & Climate** expansion (`METEOROLOGY_EXPANSION_BRIEF.md`, Phases 20+).
- **User away (2026-11-28):** a permission prompt unanswered for 5 minutes counts as denied — choose another solution within the instructions and log it in `STATUS_REPORT.md` (the running status report and full index for the user; keep it updated at every gate).
- **Commit trailer** now uses `Claude-Session: https://claude.ai/code/session_012kk9KVTjrcZt1kBsRpDRu1`.
- **Lesson:** check the test result before committing (one commit went in with failing tests; fixed in 0e3f379).

## ▶ CURRENT STATE (2026-11-28, before Phase 11)

- Last commit on `main`: `b001485` (everything pushed). **Production = `main`** (deployed 2026-11-27, live suite 87/87).
- Phases 1–10 complete, plus Gate 10.8 (universe map, `#/cosmic/map`) and an interface pass (glass UI, Spectral wheel, space-age Cosmic, atomic backdrop, fades).
- Counts: **793 science tests** (Vitest, 53 files), **87 browser tests** (Playwright, 10 spec files; the next test number is **94**), **42 dataset manifests**, **181 Source-index entries**, registry 455+ entities.
- Phase 11 has **not started**. The Biologic mode does not exist yet (only the greyed-out “CELLULAR — Coming soon” landing portal).

## Standing user rules (all phases)

1. **Source index.** Every value and every explanatory sentence cites an entry in `src/shared/sources/sources.ts` (rendered at `#/sources`) with a link and an author note read from the source itself (`authorBio: null` if not verified; never guess). Add `datasets: ['<manifest id>']` on the entry for every manifest it feeds (tests/science/sources.test.ts checks every manifest maps to a source). Check DOIs on Crossref (`curl -s https://api.crossref.org/works/<doi>`).
2. **Never invent scientific values.** Unknowns show as “unknown”. Every value carries a provenance class (observed / derived / simulated / model…); every model lists validity limits in `src/core/physics/modules.ts`. Illustrative visuals are labelled as such.
3. **Respect robots.txt, bot walls, rate limits and publisher AI restrictions.** Fetch `/robots.txt` in a separate step before using a site. **Off-limits:** openstax.org and LibreTexts copies of OpenStax books; Wikipedia; education.jlab.org; ams.org; iopscience.iop.org; export.arxiv.org; Springer link PDFs; wiki.cosmos.esa.int; kinetics.nist.gov; nemi.gov and the EPA snapshot site; ccrma.stanford.edu; nap.nationalacademies.org; IUPAC Gold Book; webb.nasa.gov; adsabs.harvard.edu `/abs` and `/full`; the CDS site itself (cds.unistra.fr answers scripts with “Page unavailable” — use the **VizieR mirror at vizier.cfa.harvard.edu**, including Sesame at `/viz-bin/nph-sesame/-oxp/S?<name>`); Peatross & Ware optics (all rights reserved: may be cited, never quoted). NCBI Bookshelf and PMC serve a reCAPTCHA to scripts. webbook.nist.gov: crawl-delay 5 s (`ai-input=yes`). archive.org is fine (`/download/<id>/page/n<N>_w800.jpg` page images); avoid scans whose identifier ends in `goog` (Google usage terms).
4. **No secrets, paid services or fabricated images.**
5. **Shared mechanisms:** new relationships go through the registry (`src/shared/scientific-relationships/registry.ts`, sourced edges only); new fields go through `FieldLayer`.
6. **Encyclopedia:** verbatim cited excerpts only; open sources preferred; no Wikipedia.
7. **Read formulas on page images**, not OCR, for scanned books (OCR drops symbols and decimals). Quote verbatim. If a published number disagrees with its own formula or catalogue, show both and document it (examples: Airy's 7·14, NSSDCA Earth/Pluto, McConnachie Leo IV).

## How a gate is built (the routine that worked in Phases 9–10)

1. **Research first.** Spawn 1–2 research agents (general-purpose) per phase or per gate with strict rules (robots first, verbatim quotes, page/equation numbers, licences verbatim, “not found” rather than guess, the off-limits list above). Save what they find into `research/SOURCE_NOTES_<phase>.md` immediately (context may be summarised). Verify the key formulas yourself on page images when the view will quote them.
2. **Data** (if any): an ingestion script in `scripts/ingestion/<name>.ts` using `fetchText(url, { minIntervalMs, cacheKey })` and `writeDataset(path, data, manifest)` from `scripts/ingestion/lib/ingest.ts`; run with `node --experimental-strip-types scripts/ingestion/<name>.ts`; output under `datasets/<area>/` with a manifest in `datasets/manifests/`. Then `npm run data:validate`.
3. **Physics/biology module** in `src/core/...` with a header comment that cites every formula (source, section, equation, page) and states validity limits.
4. **Science tests** in `tests/science/<name>.test.ts`: reproduce published numbers, check formula limits, check dataset values against their source.
5. **View** in `src/modes/<mode>/<view>/<View>.tsx`, tabbed via `?tab=`, using `Panel` (left-panel / right-panel), `KV`, `ProvenanceBadge`, `SourceLinks`, `RelatedLinks`, `LinePlot` from `src/ui/...`. URL query holds state (`setQuery`). Copy patterns from `src/modes/spectral/telescopes/TelescopesView.tsx` or `src/modes/spectral/thermal/ThermalView.tsx`.
6. **Wire it:** lazy route in `src/App.tsx`; navigation in `src/ui/TopBar.tsx` (keep the 1440 px top bar from overflowing — use chip menus; Spectral items live in `src/ui/navItems.ts`); add the section name to the mode's section list (e.g. `SPECTRAL_SECTIONS`, `COSMIC_SECTIONS`) and to `COSMIC_VIEWS` in App.tsx for Cosmic (fade key).
7. **Sources** in `sources.ts` (insert before `  { id: 'southall-1910',` or another anchor; the array ends with `\n];` — the last entry has no following `  { id:`). **Registry**: `registerEntity(E('instrument:<id>', name, route, description))` + sourced `registerRelationship` calls, inserted before `\nexport const getEntity`.
8. **Docs:** `SCIENTIFIC_MODELS.md` (next section number after §47), `KNOWN_LIMITATIONS.md` (a Phase N section), `SCIENTIFIC_RELATIONSHIPS.md`, `DEVELOPMENT_ROADMAP.md` (add a “Phase N gates” table when the phase starts; mark each gate Done), `BUILD_LOG.md` (one entry per gate: view, physics, data, checks/findings, sources and counts, tests), `src/core/physics/modules.ts` (solvers + validity).
9. **Browser test** in `tests/e2e/phaseNN.spec.ts` (copy the header of `phase10.spec.ts`: `shot()` writes `screenshots/phase-NN/` + `INDEX.md` + `captures.json`); one numbered test per gate (next: 94). Check real values, not just visibility. Look at the screenshots yourself (Read the PNG) — several real bugs were only visible there.
10. **Verify:** `npm run typecheck`, `npx vitest run --maxWorkers=4`, `npm run build`, the new e2e test (`npx playwright test --config tests/e2e/playwright.config.ts phaseNN -g "NN "`). Then `git checkout -- screenshots/phase-0{1..9}` (restore older screenshots the run rewrote; keep the current phase's). Commit with the trailer, push.
11. Run the **full** browser suite (`npm run test:e2e`, ~16 min, background) at least at the end of each phase and before the final report; don't edit `*.spec.ts` or build while it runs.

## Lessons that cost time (don't repeat)

- **No perpetual CSS animations** (twinkles, drifting backgrounds): under software rendering (the test browser) they repaint blurred glass every frame and time out 3D views. One-off fades are fine.
- **Top bar z-index must stay 20.** Lowering it put pages over the drop-down menus. Blur on the top bar lives on `.topbar::before` (a blurred element becomes the backdrop root of its children).
- **JSX text:** `{…}` is an expression and a bare `>` is an error — write `&gt;` or avoid braces in formulas.
- **GLSL:** never put `//` comments inside one-line shader strings (it comments out the rest of `main`). Don't take `length()` of metre-scale positions in 32-bit floats — divide by the view scale first.
- **LinePlot** beside another element in a wrapping flex row stretches to full width when it wraps: wrap it in `<div style={{ flex: '1 1 340px', maxWidth: 380 }}>`.
- `<line>` in R3F JSX collides with SVG typing: create `new THREE.Line(...)` and render `<primitive object={...} />`.
- `getByLabel('X')` is strict: a Panel titled “X” also has aria-label “X”. Give inputs distinct labels.
- Expected values in e2e tests: compute them first (a throw-away `tests/science/zz-*.test.ts` with `--reporter=verbose` and `console.log`, deleted afterwards) rather than guessing digits; `formatSig` drops trailing zeros.
- `stars.ts galacticLB()` takes an **ICRS** vector (it converts internally); for vectors already Galactic use `galacticCoords` in `universe-map/mapData.ts`.
- The scratchpad directory from earlier sessions is gone; use `/tmp/vv-research/` for throw-away files and `research/` (committed) for notes worth keeping.
- `gh` is not installed. GitHub public API via curl works.

## Environment and commands

- `export PATH=~/.local/node/bin:$PATH` before npm/npx (Node is not on the default PATH).
- `npm run dev | typecheck | test | build | test:e2e | data:validate`; science suite: `npx vitest run --maxWorkers=4`.
- **Commit trailer:**

```
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_012kk9KUmhZje176cLaiTwHQ
```

- **Deploy (only after Phase 14; the user runs it — the auto-mode classifier blocks `vercel deploy` from Claude):**
  `! export PATH=~/.local/node/bin:$PATH && cd "/Users/chrisjordan/Desktop/Voyager Ventures" && npx vercel deploy --prod --yes --project voyager-ventures`
  (It must start with `!` and include the PATH export, or `npx` is not found.) Afterwards run the suite against production with a temporary config: copy `tests/e2e/playwright.config.ts` to `tests/e2e/.live.config.ts`, set `baseURL: 'https://voyager-ventures.vercel.app'`, absolute `testDir`, remove `webServer`; delete it afterwards and restore screenshots.

## Phase 11 — Biologic Foundations (plan; re-assess sources before each gate)

**Mode setup (do in 11.1):** a fourth mode **BIOLOGIC** (accent emerald, e.g. `--accent: #5cf2a6`) at `#/biologic`:
- Landing: turn the greyed CELLULAR portal (`src/modes/landing/Landing.tsx`, line ~151, `portal cellular disabled`) into a live portal like the other three (scene, tagline, ENTER, transition, route). **Update e2e test 50** (it currently asserts the portal is NOT a link) and the landing screenshot. Decide the name: the spec calls the portal “CELLULAR” and the roadmap the mode “BIOLOGIC”; keep the route `#/biologic` and title the portal BIOLOGIC (or keep CELLULAR as the portal title if it reads better — note it in BUILD_LOG).
- TopBar: add BIOLOGIC to the mode switch (`nav.mode-switch`, ~line 238) and a Biologic chip row. **Check the 1440 px width**: the top bar is nearly full; use chip menus.
- Theme: `.mode-biologic` variables in `theme.css` (emerald), a backdrop in `theme-glass.css` if wanted (static only).
- App.tsx: `mode === 'biologic'` routing; document title.
- Already registered as planned entities: `process:photosynthesis`, `process:cellular-respiration`, `process:glycolysis`, `structure:mitochondrion` (Phase 11); `process:muscle-contraction`, `process:blood-co2-transport` (Phase 12). Curated reactions point to them; give them routes when their views exist.

**Gates (scope proposals — adjust to what the sources support):**
- **11.1 Bio data infrastructure & atlas** — the mode itself + a “scale of life” atlas: measured sizes from water molecule to cells and tissues on one log axis, linked to the Scale navigator (`#/scale`) and the molecule viewer. Data candidates: BioNumbers (check terms), NIH/NIGMS public-domain pages, NHGRI Talking Glossary (U.S. government, public domain), RCSB PDB sizes.
- **11.2 Biomolecular encyclopedia** — amino acids, nucleotides, sugars, lipids from PubChem (already integrated, `scripts/ingestion/pubchem-molecules.ts`) and ChEBI definitions (CC BY 4.0; already a source); the genetic code table (NCBI “The Genetic Codes” if robots allows). Reuse the molecule viewer.
- **11.3 Protein structures** — RCSB PDB / wwPDB files (check licence, expected CC0, and robots for files.rcsb.org): myoglobin (1MBN or 1A6M), haemoglobin (4HHB), insulin, GFP (1EMA), lysozyme, a DNA duplex; C-alpha trace / secondary structure from HELIX/SHEET records; UniProt sequences (check licence). 3D in R3F (reuse `src/rendering/Viewport.tsx`).
- **11.4 Cells** — prokaryote vs eukaryote, measured cell sizes and volumes; surface-to-volume scaling (derived). Text sources: NIGMS “Inside the Cell” (NIH booklet; check public-domain status), NHGRI glossary, Kimball's Biology Pages (CC BY 3.0, if verified and not an OpenStax copy).
- **11.5 Organelles & membranes** — organelle sizes and counts; lipid bilayer thickness; membrane potential from the Nernst and Goldman equations (physics already sourced? find an open source: e.g. a public-domain physiology text or NIH material) with ion concentrations from an open source.
- **11.6 Transport & biochemistry** — diffusion (Fick; diffusion time ~ x²/2D), osmotic pressure (van 't Hoff), Michaelis–Menten kinetics (check the original 1913 paper's availability or an open translation), ATP yield accounting of glycolysis/respiration linked to the curated reactions (`datasets/chemistry/reactions.json`, `berg-biochemistry-2019` is cited but not open — prefer open sources) and thermochemistry (Gate 4.2).
- **11.7 Plant cells & microorganisms** — photosynthesis (link the existing `process:photosynthesis`), chlorophyll a/b absorption spectra as open data (PhotochemCAD: check terms), the solar spectrum overlap (reuse Planck 5772 K model from Phase 10), sizes of bacteria and viruses from CDC/NIH pages.

## Phase 12 — Human Anatomy & Physiology (plan)

- **12.1 Reference model** — an open 3D human reference (candidates to check: BodyParts3D (Database Center for Life Science, Japan, CC BY-SA 2.1 JP) — verify licence and download terms; NIH 3D Print Exchange models with open licences; Z-Anatomy (CC BY-SA, based on BodyParts3D)). Organ-level navigation with sourced descriptions. **No fabricated anatomy**: if no open model is usable, use a schematic labelled “schematic”.
- **12.2 Skeletal / muscular** — lever mechanics of joints (physics), muscle force–length/force–velocity (Hill 1938, check availability; A. V. Hill papers may be in copyright — find open sources), bone counts and properties.
- **12.3 Cardiovascular / respiratory** — Poiseuille flow (Poiseuille's work public domain), cardiac output, blood pressure; gas exchange; links to `process:blood-co2-transport` and the CO₂ curated reaction.
- **12.4 Nervous system & electrophysiology** — Hodgkin–Huxley model (1952 J. Physiol.; check open access — J Physiol articles from 1952 are free on the Wiley/PMC site? verify) simulated with a numerical solver; action-potential propagation.
- **12.5 Digestive / urinary / endocrine**, **12.6 Immune / reproductive / integumentary** — keep to quantitative, sourced content (e.g. glomerular filtration, hormone half-lives) from U.S. government sources (NIH, NIDDK, NCI SEER training modules — check terms) and open texts. Expect gaps; document them.
- **12.7 Organ-to-cell navigation** — a zoom path organ → tissue → cell → organelle → molecule, reusing the Phase 11 atlas and the universe-map zoom technique (log-scaled view radius).

## Phase 13 — Waves, Life & Imaging (plan)

- **13.1 Vision** — eye optics (reduced eye; reuse Phase 10 lens code), photoreceptor spectral sensitivities (CIE or CVRL data — check licences; CVRL (cvrl.org) data terms), diffraction limit of the pupil (reuse Airy).
- **13.2 Hearing** — the ear as transducer, frequency range, equal-loudness (ISO 226 is paid — find an open source or leave out), cochlear tonotopy (Greenwood 1990 function — check open access).
- **13.3 Bioelectricity** — reuse Hodgkin–Huxley/Nernst from 12.4; ECG basics (dipole) with open sources.
- **13.4 EM–tissue interactions** — SAR, penetration depth from tissue dielectric data (IT'IS Foundation tissue database: check licence; Gabriel 1996 parametric models — open data from FCC/IFAC? check), photon attenuation (NIST XCOM / XRAY coefficients, U.S. government).
- **13.5 Optical & electron microscopy** — Abbe limit (Abbe 1873, public domain), numerical aperture, electron wavelength (de Broglie, CODATA), reuse Airy/Rayleigh.
- **13.6 Ultrasound / X-ray / MRI** — acoustic impedance of tissues (the earlier gap: find an open source), Beer–Lambert with NIST mass attenuation coefficients, Larmor frequency (CODATA γ_p).
- **13.7 Integrated visualisations** — cross-mode pathways using the relationship registry and the notebook.

## Phase 14 — Advanced Foundations (plan)

- **14.1 Standard Model atlas** — particle masses and properties from the Particle Data Group (pdg.lbl.gov; check licence/robots — PDG content is CC BY 4.0 per their site? verify) and CODATA.
- **14.2 Quantum lab** — 1D Schrödinger solver (finite differences), particle in a box, harmonic oscillator, tunnelling; hydrogen already exists (Phase 1).
- **14.3 Nuclear physics & nucleosynthesis** — binding energy (semi-empirical mass formula) against NUBASE2020/AME masses (already bundled), decay chains, pp-chain/CNO; BBN already in Gate 7.4.
- **14.4 Plasma / MHD** — Debye length, plasma frequency, Alfvén speed; solar-wind values from NASA/NOAA.
- **14.5 Advanced relativity** — extend Gate 6.1 (geodesics, Kerr ISCO from Bardeen–Press–Teukolsky 1972 if open, frame dragging).
- **14.6 Cosmology & dark-matter model comparison** — extend Gates 7.1/7.4 (MOND vs NFW on SPARC, parameter fits).
- **14.7 Unified pathways** — final cross-mode pathways and the encyclopedia; then the full suite, a final handoff and the report.

## After Phase 14

1. Full local browser suite (expect ~20 min with new tests); fix failures.
2. Update `DEVELOPMENT_ROADMAP.md` (all phases complete), write `HANDOFF_PHASE14.md`, update memory.
3. Report to the user with counts, findings, gaps left out, and the deploy command. Wait for them to deploy, then run the production suite and log it.
