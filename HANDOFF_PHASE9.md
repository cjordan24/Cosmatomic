# Handoff — Voyager Ventures, Phase 9 (Applied Waves & Communications)

Written 2026-11-27 at the end of Phase 9. Read this first, then `DEVELOPMENT_ROADMAP.md` (Phase 9 gates table), `SCIENTIFIC_MODELS.md` §§33–39, `KNOWN_LIMITATIONS.md` (Phase 9 section) and the end of `BUILD_LOG.md`. `HANDOFF_PHASE8.md` holds the older history; its standing rules are repeated below.

## ▶ RESUME HERE

**State (2026-11-27, end of Phase 9; see the last commit on `main`):**
- **Phase 9 is complete:** 9.1 antennas `#/spectral/antennas` · 9.2 RF atlas `#/spectral/rf` · 9.3 communications room `#/spectral/room` · 9.4 modulation lab `#/spectral/modulation` · 9.5 acoustic lab `#/spectral/acoustics` · 9.6 audio & FFT `#/spectral/audio` · 9.7 room acoustics `#/spectral/roomacoustics`. **Stopped at the Phase 9 boundary for the user's review.** Do not start Phase 10 (Optics, Radiation & Energy) without approval.
- **Not deployed.** Production still serves the Gate 7.5 build (`index-Qc9NTZFA.js`). Ask before deploying. The deploy blocker and the command are unchanged (see `HANDOFF_PHASE8.md`): with the user's OK add `Bash(npx vercel deploy --prod --yes --project voyager-ventures)` to `.claude/settings.local.json` (the file does not exist yet), or give the user
  `! export PATH=~/.local/node/bin:$PATH && cd "/Users/chrisjordan/Desktop/Voyager Ventures" && npx vercel deploy --prod --yes --project voyager-ventures`
- **Decision needed from the user — OpenStax:** OpenStax book pages now say the book “may not be used in the training of large language models or otherwise be ingested into large language models or generative AI offerings without OpenStax's prior written permission.” Earlier phases cite several OpenStax books (University Physics 1–3, Astronomy 2e, Chemistry 2e) and Gate 9.5 read four pages before the notice was seen. No further OpenStax pages were fetched. Ask the user whether to keep the OpenStax citations or replace them with other open sources.

**Counts:** 718 science tests (Vitest, 44 files), 79 browser tests (Playwright, 9 spec files; next test number is 86), 38 dataset manifests, 143 Source-index entries. Registry: 448 entities, 162 edges.

## What Phase 9 added

| Gate | What | Code | Tests |
|---|---|---|---|
| 9.1 | Exact Hertzian-dipole fields (FIELDS layer `hertzian-dipole`), short/half-wave dipole patterns by numerical integration, D, R_rad, A_e checked against Ellingson (1.5; 73.08 Ω vs ≅ 73 Ω; 0.1306λ² vs 0.131λ²), arrays, Friis | `src/core/physics/em/antennas.ts`, `src/modes/spectral/antennas/AntennaView.tsx`, `PolarPlot` in `src/ui/plots.tsx` | `antennas.test.ts` (16); e2e 79 |
| 9.2 | 47 CFR allocations, GPS L1/L2/L5, Voyager links with verbatim quotes on the ITU bands; Voyager 2 link budgets re-derived with Friis | `datasets/spectral/rf-allocations.json`, `scripts/ingestion/curated-rf.ts`, `src/modes/spectral/rf/` | `rf.test.ts` (11); e2e 80 |
| 9.3 | ITU-R P.2040-4 materials, TE/TM and slab reflection, image-method rays with polarisation tracking between half-wave dipoles; coverage map in a worker, 3D rays, delay spread | `datasets/spectral/building-materials.json`, `src/core/physics/em/room.ts`, `src/workers/room.worker.ts`, `src/modes/spectral/room/` | `room.test.ts` (15); e2e 81 |
| 9.4 | Shared DSP (FFT, Hanning, spectra, spectrogram); AM, FM (J_n(β) lines), BPSK/FSK in noise vs theory, capacity | `src/core/physics/signals/{dsp,modulation}.ts`, `src/modes/spectral/modulation/` | `dsp.test.ts` (9), `modulation.test.ts` (10); e2e 82 |
| 9.5 | Sound level, impedance and reflection, Doppler and Mach cone | `src/core/physics/waves/acoustics.ts`, `src/modes/spectral/acoustics/` | `acoustics.test.ts` (9); e2e 83 |
| 9.6 | Fourier synthesis with playback, sampling/aliasing, spectrograms (optional microphone), Wave lab *Listen* | `src/core/physics/signals/synthesis.ts`, `src/ui/audio.ts`, `src/modes/spectral/audio/` | `synthesis.test.ts` (5); e2e 84 |
| 9.7 | Rayleigh room modes, Sabine reverberation with his 1900 coefficients, 2-D FDTD room checked against the modes | `src/core/physics/waves/roomAcoustics.ts`, `src/modes/spectral/roomacoustics/` | `roomAcoustics.test.ts` (7); e2e 85 |

**Navigation:** the Spectral bar now reads Atlas · Waves ▾ (Wave lab, Acoustic lab, Audio & FFT, Room acoustics) · Radio ▾ (Antennas & fields, RF atlas, Comms room (3D), Modulation lab) · Fields · Compare, in the compact `many-chips` style; rightmost top-bar element at 1426 px at 1440 px width. The phone ☰ menu lists every Spectral view. Browser test 25 (phase 4) opens the Wave lab through the Waves menu.

**Lessons from this phase:**
- **Sources checked this phase:** fine: VTechWorks (`/server/api/core/bitstreams/<id>/content`, crawl-delay 2 s), eCFR `/current/` pages (the API paths are disallowed), gps.gov `/sites/default/files/…` PDFs, descanso.jpl.nasa.gov (no robots.txt), itu.int `/dms_pubrec/…` PDFs, LibreTexts book pages (crawl-delay 5 s; `/@api` is disallowed, so follow the “next page” links), dlmf.nist.gov, archive.org `/download/`, people.math.harvard.edu. **Off-limits:** ams.org (robots.txt disallows ClaudeBot and anthropic-ai), so Cooley & Tukey (1965) was not read. **Flagged:** OpenStax's LLM-ingestion notice (above).
- **Check scans against the page image.** OCR text layers drop superscripts and decimal points (P.2040's metal conductivity reads “107” for 10⁷; Sabine's tables read “061” for .061) and lose equations (Rayleigh eq. 4). Render the page (`pypdf` → one-page PDF → `sips -s format png`) and read it.
- **Published numbers can be rounded or truncated:** Johnson's 29.901 kbit/s is 29.9017 truncated; the Voyager tables print received power as the mean of toleranced items, not the sum of design values.
- **Committing gates separately while later gates are in the tree:** back up the shared files, remove the later gates' parts with a small script, stage, `git stash push --keep-index -u`, typecheck and run the science suite, `git stash pop`, commit, then restore the backups. In zsh, list the files explicitly (a `$FILES` variable is not word-split).
- **Browser suite at the end of Phase 9:** 79/79 (13.1 min) with Gates 9.6–9.7 in the tree.
- **Science suite under load:** a molecular-dynamics test can hit its 5 s timeout when the machine is busy with other apps; `npx vitest run --maxWorkers=4` is reliable.

## Next

Phase 9 needs the user's review first. Then:
- Deploy only if the user asks.
- The OpenStax decision (above).
- Phase 10 needs explicit approval: Optics, Radiation & Energy — 10.1 geometric optics · 10.2 wave optics · 10.3 polarisation & optical materials · 10.4 atomic/molecular spectroscopy · 10.5 thermal radiation & energy transfer · 10.6 camera/telescope instruments · 10.7 atmospheric radiation & remote sensing.
- Open threads from Phase 9: atmospheric absorption (ITU-R P.676) not bundled; Helmholtz resonator and Eyring's formula left out of 9.7; QAM, PM and Carson's rule left out of 9.4; the dipole field is not yet a layer of the Fields explorer.

## Standing user rules (unchanged)

1. **Source index.** Every new value needs an entry in `src/shared/sources/sources.ts` (rendered at `#/sources`) with a link and a verified author note (`authorBio: null` if unverified; never guess). Add `datasets: [...]` per manifest and `sources: [ids]` on records. Check DOIs with Crossref; read affiliations from the source itself.
2. **Never invent scientific values.** Unknown values show as “unknown”. Every value carries a provenance class; every model states its validity limits (`src/core/physics/modules.ts`). Explanatory text must be sourced.
3. **Gate routine:** commit to `main`, push, ask the user about deploying, report at the phase boundary and stop for review.
4. **Respect robots.txt, bot walls and rate limits** (lists in `HANDOFF_PHASE8.md` and above). Jefferson Lab (education.jlab.org) and ams.org are off-limits.
5. **No secrets, paid services or fabricated images.**
6. **Shared mechanisms.** New relationships go through the registry (sourced edges). New fields go through `FieldLayer`.
7. **Encyclopedia:** verbatim cited excerpts only; open sources preferred; no Wikipedia.

## Environment and commands

As in `HANDOFF_PHASE8.md`: `export PATH=~/.local/node/bin:$PATH`; `npm run dev | typecheck | test | build | test:e2e | data:validate`. A full local e2e run now takes about 14 min; run it in the background and do not edit `*.spec.ts` or run a build meanwhile. Afterwards `git checkout -- screenshots/phase-0{1,2,3,4,5,6,7,8}` (Phase 9 screenshots are committed).

**Commit trailer:**

```
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_012kk9KUmhZje176cLaiTwHQ
```
