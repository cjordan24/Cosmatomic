Handoff — Voyager Ventures, start of Phase 7 (Cosmology & Observable Universe)

Written 2026-11-26 at the end of Phase 6. Read this first, then DEVELOPMENT_ROADMAP.md, ARCHITECTURE.md, SCIENTIFIC_MODELS.md (§17–21 are Phase 6), DATA_SOURCES.md, KNOWN_LIMITATIONS.md (Phase 6 section), SCIENTIFIC_RELATIONSHIPS.md, FIELDS_ARCHITECTURE.md and the tail of BUILD_LOG.md. HANDOFF_PHASE6.md and earlier handoffs keep the older history; the essentials are repeated here.

▶ RESUME HERE

State: Phases 1–6 are complete. Phase 6 is Gates 6.1–6.5. Each gate was committed, pushed and deployed, then checked against production with the full browser suite. Two gates needed more than one run; see the table below and BUILD_LOG.md. Phase 7 has not started. The user reviews each phase before the next begins: do not start Phase 7 until they say so.

Counts at the end of Phase 6: 439 science tests (Vitest), 57 browser tests (Playwright), 27 dataset manifests, 100 Source-index entries.

What Phase 6 added (where to look)

Route	What	Code
#/cosmic/relativity?tab=radii|orbits|light|tests&m=&r=&L=&b=&beta=	Schwarzschild radii, static and orbital clocks, redshift, effective potentials, RK4 null geodesics, weak-field tests (Mercury 42.98″/cy, 1.751″), Lorentz factor; presets include every measured compact object	src/core/physics/relativity.ts, src/modes/cosmic/relativity/
#/cosmic/compact?sel=	4 white dwarfs of the 10 pc sample, 3 neutron stars, 4 black holes with published values and interval types; Sirius B redshift and EHT shadow checks; EHT images	src/modes/cosmic/compact/, datasets/astronomical/compact-objects.json
#/cosmic/lensing?tab=plane|curve|astrometry&lens=&bx=&by=&rs=&umin=&v=	point-lens plane by inverse ray shooting, microlensing light curves, Stein 2051 B astrometric deflection (Sahu et al. 2017)	src/core/physics/lensing.ts, src/modes/cosmic/lensing/
#/cosmic/galaxies?tab=curves|mw&g=&yd=&yb=&halo=	SPARC rotation curves (175 galaxies) vs Newtonian baryons and a fitted NFW halo (labelled a model); Milky Way parameters and rotation curve	src/modes/cosmic/galaxies/, datasets/astronomical/{sparc-galaxies,milky-way}.json
#/cosmic/nebulae?sel=	7 CC BY 4.0 images (ESA/Hubble, ESA/Webb, ESO/EHT) with verbatim credits and SHA-256; 5 nebula records; Hα, [N II], [O III] links into the Spectral atlas	src/modes/cosmic/nebulae/, datasets/astronomical/{gallery,nebulae}.json, public/images/gallery/

Navigation: the Cosmic chips are now Solar system · Stars ▾ (Nearby stars, HR diagram, Exoplanets) · Gravity ▾ (Relativity, Black holes, Lensing) · Galaxies · Nebulae · Sandbox (ChipMenu in src/ui/TopBar.tsx; COSMIC_SECTIONS lists the non-body sub-routes). The scale ladder's Galaxies level is now interactive.

Registry additions: compact-object:* (neutron stars and black holes only, because the white dwarfs stay star:<seq>), context:gravitational-lensing, galaxy:milky-way, nebula:*. Edges: Sirius B → H I (redshifted Hα), Stein 2051 B → lensing, Sun and Sgr A* → Milky Way, nebulae → spectra and → Milky Way.

Live verification per gate

Gate	Production result
6.1	53/53
6.2	52/52 (Phases 1–5); tests 59–60 failed only because phase6.spec.ts was edited mid-run, and passed 2/2 when re-run with the committed spec
6.3	55/55
6.4	56/56
6.5	57/57 (final run, whole suite)

Landing page: four portals (carry forward)

ATOMIC · COSMIC · SPECTRAL are live. CELLULAR stays greyed out with "Coming soon" until Biologic Mode (Phase 11). Phase 6 views live inside COSMIC, so the landing page is unchanged. Every future environment gets a matching portal; sub-views do not.

Standing user rules (unchanged)

	1.	Source Index: every new value needs an entry in src/shared/sources/sources.ts (rendered at #/sources) with a link and a verified author note (authorBio: null if unverified; never guess). Add datasets: [...] for each manifest and sources: [ids] on records. Check DOIs with Crossref and read affiliations from the paper's first page (arXiv PDF + Swift PDFKit). tests/science/sources.test.ts now also checks every SourceLinks id used anywhere in src/.
	2.	Never invent scientific values. Unknown shows as "unknown". Every value carries a provenance class; models state validity limits (src/core/physics/modules.ts). Explanatory sentences are sourced (OpenStax text checked before use). Store each published value with its interval type (1σ / 68 % / 90 %).
	3.	Standing authorisation: after each gate, commit to main, push, vercel deploy --prod, then run the browser suite against production. Report at each phase boundary and stop for review.
	4.	Respect robots.txt, bot walls and rate limits.
	    •	Off-limits: COD, AMCSD, iso.org, the SIMBAD CfA mirror, the NASA Exoplanet Archive (disallows Anthropic agents by name), export.arxiv.org (robots.txt disallows all; four API searches were made before this was checked and it has not been used since), and Springer link.springer.com PDFs (JavaScript bot wall).
	    •	Fine: arxiv.org /abs and /pdf (crawl-delay 15 s), Crossref API, VizieR CfA mirror, exoplanet.eu, OpenStax, SPARC (astroweb.case.edu), esahubble.org, esawebb.org and eso.org/public (no robots restrictions for these paths).
	5.	No API keys in client code; no paid infrastructure or new external services without approval. Never fabricate screenshots or images; images only with a stated reuse licence and visible credit.
	6.	New relationships go through the registry (sourced edges, both directions). New fields go through FieldLayer.

Environment and commands

export PATH=~/.local/node/bin:$PATH        # Node 24
cd "/Users/chrisjordan/Desktop/Voyager Ventures"
npm run dev | typecheck | test | build | test:e2e | data:validate

	•	Adapters run with node --experimental-strip-types scripts/ingestion/<x>.ts. Phase 6 added sparc.ts, gallery-images.ts (binary downloads, cached in datasets/.cache/gallery) and the curated writers curated-{compact-objects,milky-way,nebulae}.ts. Re-running an adapter rewrites retrievedAt; revert timestamp-only manifest changes.
	•	npm run build typechecks scripts/ and tests/ too. Science tests are typed without Node types: use import.meta.glob (?raw / ?inline) instead of node:fs.
	•	PDFs: swift pdftext.swift file.pdf [from] [to] (PDFKit page(at:).string; the script is not in the repo, so recreate it: 8 lines).
	•	Deploy: npx vercel deploy --prod --yes --project voyager-ventures. Live test: build tests/e2e/playwright.live.config.ts with sed (base URL → https://voyager-ventures.vercel.app, delete the webServer block), run it (about 10 min, in the background), then delete it and git checkout -- screenshots.
	•	**Do not edit any *.spec.ts while a live run is in progress.** Playwright workers load spec files lazily, so an edited spec runs against the old site. New tests can go in a temporary new spec file and be merged afterwards.
	•	Full e2e runs regenerate earlier phases' screenshots: git checkout -- screenshots/phase-0{1,2,3,4,5} before committing.
	•	The VGFF conformer test has an explicit 30 s timeout. Parallel Phase 6 tests pushed it past the 5 s default.
	•	Commit trailer:

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_012kk9KUmhZje176cLaiTwHQ

Phase 7 — proposed gates (re-assess before starting)

Roadmap scope: clusters, large-scale structure, distances, CMB, dark-matter evidence explorer, dark energy, expansion history, GWOSC observations. The FLRW module (src/core/physics/cosmology.ts) and its tests already exist; src/modes/cosmic/universe/ is the reserved folder.

	1.	7.1 Expansion and distances: visualise the existing ΛCDM integrals (comoving, luminosity, angular-diameter distance, lookback time) with parameters from a cited Planck release (check its licence and text). Connect lensing's angular-diameter distances (Gate 6.3 currently uses Euclidean distances).
	2.	7.2 Distance ladder: parallax (links to the 10 pc sample), Cepheids, TRGB and SNe Ia from cited tables. SPARC's distance methods already name these.
	3.	7.3 CMB: the FIRAS blackbody (Fixsen 2009 is already in the Source index; the Spectral atlas has the 2.72548 K curve) and a published power spectrum if the licence allows.
	4.	7.4 Dark-matter evidence explorer: rotation curves (6.4), lensing (6.3), cluster dynamics and the CMB, with models clearly separated from observations.
	5.	7.5 Gravitational waves: GWOSC event parameters (check terms and robots); GW150914 is already a compact-object record.

Open caveats carried forward

See KNOWN_LIMITATIONS.md (Phase 6 section). Notable:
	•	Everything relativistic is Schwarzschild (no spin), and lensing uses point lenses with Euclidean distances.
	•	Only 4 of the 21 white dwarfs within 10 pc have masses.
	•	The NFW fit holds Υ fixed and uses random errors only.
	•	The Crab, Eagle and NGC 3324 distances are ESA's approximate figures.
	•	The GPS relativity check was not added (source behind a bot wall).

Older caveats: Voyager 2 at Neptune ~15 % too far; VGFF-1 qualitative; FIELDS layers analytic only; star positions not propagated in time.
