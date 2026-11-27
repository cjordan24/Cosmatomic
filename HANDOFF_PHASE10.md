# Handoff — Voyager Ventures, Phase 10 (Optics, Radiation & Energy)

Written 2026-11-27 at the end of Phase 10. Read this first, then `DEVELOPMENT_ROADMAP.md` (Phase 10 gates table), `SCIENTIFIC_MODELS.md` §§40–46, `KNOWN_LIMITATIONS.md` (Phase 10 section) and the end of `BUILD_LOG.md`. `HANDOFF_PHASE9.md` and `HANDOFF_PHASE8.md` hold the older history; the standing rules are repeated below.

## ▶ RESUME HERE

**State (2026-11-27, end of Phase 10; see the last commit on `main`):**
- **Phase 10 is complete:** 10.1 geometric optics `#/spectral/optics` · 10.2 wave optics `#/spectral/waveoptics` · 10.3 polarisation `#/spectral/polarisation` · 10.4 spectroscopy `#/spectral/spectroscopy` · 10.5 thermal radiation `#/spectral/thermal` · 10.6 telescopes `#/spectral/telescopes` · 10.7 atmosphere & remote sensing `#/spectral/atmosphere`. All are in the **Light ▾** menu of the Spectral bar, which also holds Compare spectra (the old Compare chip). **Stopped at the Phase 10 boundary for the user's review.** Do not start Phase 11 (Biologic Foundations) without approval.
- **OpenStax replaced** (commit 96f2a6b) at the user's request: all six OpenStax books are gone from the Source index. Never fetch openstax.org or LibreTexts copies of OpenStax books.
- **Deploys:** the user deployed Phase 9 on 2026-11-27 (live suite 78/79; the failure was the notebook export reading “commit unknown” because the Vercel CLI build has no `.git`; `vite.config.ts` now falls back to `VERCEL_GIT_COMMIT_SHA`, untested until the next deploy). **Phase 10 and the OpenStax replacement are not deployed.** Ask before deploying; give the user
  `! export PATH=~/.local/node/bin:$PATH && cd "/Users/chrisjordan/Desktop/Voyager Ventures" && npx vercel deploy --prod --yes --project voyager-ventures`
  (the auto-mode classifier blocks `vercel deploy` from Claude Code). After a deploy, run the browser suite against production with a temporary config whose `baseURL` is `https://voyager-ventures.vercel.app` and no `webServer` (see BUILD_LOG “Production deploy and live verification (Phase 9)”).

**Counts:** 787 science tests (Vitest, 52 files), 86 browser tests (Playwright, 10 spec files; next test number is 93), 41 dataset manifests, 179 Source-index entries. Registry: 455 entities, 205 edges.

## What Phase 10 added

| Gate | What | Code | Tests |
|---|---|---|---|
| 10.1 | Refraction and total reflection between dataset materials at any λ; exact 2-D ray traces through spherical lenses, concave mirrors and prisms; thin-lens, mirror and prism formulas | `src/core/physics/optics/geometric.ts`, `src/modes/spectral/optics/` | `geometricOptics.test.ts` (14); e2e 86 |
| 10.2 | Two-source fringes, slit, m-slit grating and its resolving power on the NIST Na/Hg doublets, thin-film minima with n(λ) | `optics/wave.ts`, `src/modes/spectral/waveoptics/` | `waveOptics.test.ts` (8); e2e 87 |
| 10.3 | Fresnel s/p reflectance, polarizing angle, cos² α after two reflections, uniaxial crystals (new dataset `materials/birefringence.json`) | `optics/polarisation.ts`, `scripts/ingestion/birefringence.ts`, `src/modes/spectral/polarisation/` | `polarisation.test.ts` (9); e2e 88 |
| 10.4 | Hydrogen-like series (H, D, He⁺) against NIST lines, Doppler/Lorentz widths, diatomic levels and rotation lines (new dataset `molecular/diatomic.json`, NIST WebBook) | `optics/spectroscopy.ts`, `scripts/ingestion/diatomic.ts`, `src/modes/spectral/spectroscopy/` | `spectroscopy.test.ts` (11); e2e 89 |
| 10.5 | Planck/Wien/Stefan–Boltzmann, grey bodies by Kirchhoff, planetary radiative balance (new dataset `astronomical/planet-radiation.json`, NSSDCA) | `src/core/physics/thermal/radiation.ts`, `scripts/ingestion/planet-radiation.ts`, `src/modes/spectral/thermal/` | `thermalRadiation.test.ts` (6); e2e 90 |
| 10.6 | Airy's pattern from his integral against his table, Rayleigh's two-star criterion, Hubble and JWST plate scales and diffraction limits | `optics/telescopes.ts`, `src/modes/spectral/telescopes/` | `telescopes.test.ts` (10); e2e 91 |
| 10.7 | λ⁻⁴ scattering, Rayleigh's 1899 extinction (83 km), air mass and Bouguer's law, Landsat 8–9 bands | `src/core/physics/atmosphere/radiation.ts`, `src/modes/spectral/atmosphere/` | `atmosphere.test.ts` (6); e2e 92 |

**Findings worth keeping:**
- Airy's 1835 table puts the second dark ring at n = 7·14; his own integral vanishes at 7.016 (page 287 read on the image). Shown in the view.
- NSSDCA black-body temperatures: Earth's 254.0 K implies an albedo of 0.306 (listed 0.294); Pluto's 37.5 K implies 0.486 (listed 0.72). The other eight agree within 0.1 K.
- JWST: f/20 × 6.5 m = 130 m, but JDox states 131.4 m; the view uses the stated focal length.

**Sources used (all public domain or U.S. government unless noted):** Drude, *Theory of Optics* (1902, UC scan `theooptics00drudrich`; the 1933 reprint is “all rights reserved” — avoid it); Southall (1910); Huygens (tr. 1912); Bohr (1913); NIST Atomic Spectroscopy Compendium; NIST Diatomic Spectral Database; NIST WebBook (Huber & Herzberg); Planck, *Theory of Heat Radiation* (tr. 1914); NASA Earth Observatory; NSSDCA fact sheets; Airy (1835); Rayleigh, *Scientific Papers* I and IV; STScI HST Primer and JWST JDox (STScI: “freely used as in the public domain”); NASA TM-82021; NASA AERONET; USGS Landsat; refractiveindex.info (CC0).

**Lessons from this phase:**
- **Open optics textbooks are scarce:** OpenStax forbids AI ingestion and Peatross & Ware is all rights reserved, but the 1900s classics (Drude, Planck, Rayleigh, Airy, Southall) cover the physics and are public domain. Read formulas on the page images (`https://archive.org/download/<id>/page/n<N>_w800.jpg`), never only the OCR; avoid scans whose identifiers end in `goog` (Google usage terms).
- **Off-limits found this phase:** kinetics.nist.gov (JANAF online), nemi.gov and the EPA snapshot site, ccrma.stanford.edu, nap.nationalacademies.org, IUPAC Gold Book, webb.nasa.gov, adsabs.harvard.edu `/abs` and `/full`; NCBI Bookshelf and PMC serve a reCAPTCHA; NLR/NREL's ASTM G173 solar spectra are not openly licensed. webbook.nist.gov: crawl-delay 5 s, `ai-input=yes`.
- **Not found openly (left out and documented):** P/R branch formulas of vibration–rotation bands, natural line widths, Fourier's law and convection coefficients, tissue acoustic impedances, measured spectral emissivities.
- **Layout:** a `LinePlot` placed beside another element in a wrapping flex row stretches to the full width when it wraps; give it a box with `flex: '1 1 340px', maxWidth: 380`.
- **JSX text:** a `{…}` inside JSX text is parsed as an expression and a bare `>` is an error; write formulas without braces or escape them.

## Next

Phase 10 needs the user's review first. Then:
- Deploy only if the user asks (Phase 10 and the OpenStax replacement are not live).
- Phase 11 needs explicit approval: Biologic Foundations — 11.1 bio data infrastructure & atlas · 11.2 biomolecular encyclopedia · 11.3 protein structures · 11.4 cells · 11.5 organelles & membranes · 11.6 transport & biochemistry · 11.7 plant cells & microorganisms.
- Open threads: P/R bands and IR spectra; conduction/convection; measured emissivities; a measured solar spectrum with an open licence; skew-ray tracing and lens aberration theory; the open threads of Phase 9 (ITU-R P.676 absorption, Helmholtz resonator, QAM, dipole layer in the Fields explorer).

## Standing user rules (unchanged)

1. **Source index.** Every new value needs an entry in `src/shared/sources/sources.ts` (rendered at `#/sources`) with a link and a verified author note (`authorBio: null` if unverified; never guess). Add `datasets: [...]` per manifest and `sources: [ids]` on records. Check DOIs with Crossref; read affiliations from the source itself.
2. **Never invent scientific values.** Unknown values show as “unknown”. Every value carries a provenance class; every model states its validity limits (`src/core/physics/modules.ts`). Explanatory text must be sourced.
3. **Gate routine:** commit to `main`, push, ask the user about deploying, report at the phase boundary and stop for review.
4. **Respect robots.txt, bot walls, rate limits and publisher AI restrictions** (lists above and in `HANDOFF_PHASE8.md`/`HANDOFF_PHASE9.md`). OpenStax, Jefferson Lab and ams.org are off-limits.
5. **No secrets, paid services or fabricated images.**
6. **Shared mechanisms.** New relationships go through the registry (sourced edges). New fields go through `FieldLayer`.
7. **Encyclopedia:** verbatim cited excerpts only; open sources preferred; no Wikipedia.

## Environment and commands

`export PATH=~/.local/node/bin:$PATH`; `npm run dev | typecheck | test | build | test:e2e | data:validate`. The science suite is reliable with `npx vitest run --maxWorkers=4`. A full local e2e run takes about 15 min; run it in the background and do not edit `*.spec.ts` or run a build meanwhile. Afterwards `git checkout -- screenshots/phase-0{1,2,3,4,5,6,7,8,9}` (Phase 10 screenshots are committed). New ingestion scripts: `node --experimental-strip-types scripts/ingestion/{birefringence,diatomic,planet-radiation}.ts` (cached in `datasets/.cache`).

**Commit trailer:**

```
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_012kk9KUmhZje176cLaiTwHQ
```
