# Handoff — Voyager Ventures after Phase 14 (2026-11-28)

**Read this first.** Phases 11–14 (Biologic Foundations; Human Anatomy & Physiology; Waves, Life & Imaging; Advanced Foundations) are built, tested, committed and pushed to `main`. **Nothing from Phases 11–14 is deployed yet**: production still serves the 2026-11-27 build. The user deploys (the auto-mode classifier blocks `vercel deploy` from Claude):

```
! export PATH=~/.local/node/bin:$PATH && cd "/Users/chrisjordan/Desktop/Voyager Ventures" && npx vercel deploy --prod --yes --project voyager-ventures
```

After the deploy: run the browser suite against production and log it in `BUILD_LOG.md`.

## What comes next (user's instructions, 2026-11-28)

1. **Phases 15–19 Computing & Engineering** — `COMPUTING_ENGINEERING_BRIEF.md` (verbatim). The user said: build it once Phase 14 is complete, *no confirmation needed*; they will correct it afterwards.
2. **Phases 20+ Meteorology & Climate** — `METEOROLOGY_EXPANSION_BRIEF.md` (verbatim), after Phase 19.
3. **Keep `STATUS_REPORT.md` current** every gate: it is the user's index of everything built and the list of permissions denied by timeout. A permission prompt unanswered for 5 minutes counts as denied: use another route within the instructions and log it there.

## Phase 14 commits

| Gate | Commit | Address |
|---|---|---|
| 14.1–14.3 particles, quantum lab, nuclei | 5bbcab5 | `#/atomic/particles`, `#/atomic/quantum`, `#/atomic/nuclei` (Atomic → Subatomic ▾) |
| 14.4–14.6 plasma, tests of relativity, model comparison | 977106d | `#/cosmic/plasma`, `#/cosmic/grtests`, `#/cosmic/models` |
| 14.7 unified pathways | be18cbc | `#/relations?tab=pathways` (five new pathways) |

Phase 13: 3595906 (senses), bd99d1f (imaging). Phases 11–12: see `HANDOFF_PHASES_11_14.md`.

## Menus changed to keep the 1440 px top bar fitting

- Atomic: Elements · Chemistry ▾ (Molecules, Reactions) · Matter ▾ (Materials, Phases) · Laboratory · Subatomic ▾ (Particles, Quantum lab, Nuclei).
- Cosmic: Solar system · Map · Stars ▾ (+ Plasma & solar wind) · Gravity ▾ (+ Tests of relativity) · Galaxies ▾ (Galaxies, Nebulae) · Universe ▾ (+ Dark matter or modified gravity?).
- Biologic: … · Waves & life ▾ (Senses & signals, Imaging the body) · Body ▾.

## End-of-Phase-14 browser suite

109/109 (two stale expectations updated: tests 59 and 73).

## Counts (end of Phase 14)

95 commits · 260 Source-index entries · 59 dataset manifests · 944 science tests in 72 files · 109 browser tests in 14 spec files (numbered to 115).

## Findings (printed numbers that disagree with their own data — both values shown in the app)

- Helmholtz (1924) Listing's reduced-eye radius 5.1248 mm vs 5.0674 mm from his focal lengths; his diffraction blur 0.0122 mm reproduced exactly.
- USAF RF Dosimetry Handbook (1986) 67.52 assumes c = 3 × 10⁸ m/s (67.48 exact).
- de Broglie (1930): the “always small” term eP/2mc² is 0.29 at 300 kV.
- Rayleigh (1896) ·3402 is a truncated ·3403.
- Condon & Morse (1929) eq. (68.5): sign misprint.
- Mott (1930): 1-cm, 20-V example prints 3·2 × 10⁻⁷ V; his formula gives 5.5 × 10⁻⁷ V.
- Einstein (1916): 43″ reproduced as 42.98″ with today's elements; “1,7″” is 1.751″.
- SPARC + McGaugh et al. (2016): 2,696 vs 2,693 points; g† 1.16 vs 1.20 × 10⁻¹⁰ m s⁻².

## Left out (no allowed open source) — details in `KNOWN_LIMITATIONS.md`

Kerr ISCO formula (Bardeen et al. 1972: ADS bot challenge, IOP off-limits); full CNO cycle and per-step neutrino energies; a public-domain “three generations” statement; Milgrom 1983; 1540 m/s scanner convention; bone sound speed (OCR only); typical MRI field strengths; Fletcher–Munson contours; ECG intervals; 20 Hz–20 kHz hearing range.

## Licensing notes for the user

- NIST SRD 126 (X-ray tables) is a copyrighted compilation: 42 values used with NIST's required notice.
- arXiv non-exclusive papers (RAR, MOND review): equations and short quotations only.
- Public domain in the US only (1928–1930 books: Schrödinger, Mott, de Broglie).

## New off-limits found (in memory)

nibib.nih.gov (robots disallow all), fcc.gov and apps.dtic.mil (403), ecfr.gov (CAPTCHA; govinfo used), www.nrl.navy.mil (Akamai 403; DTIC copy on archive.org used), fnal.gov (Cloudflare), ADS (scixplorer bot challenge), NASA SPDF/OMNI (robots blocks Claude). CVRL serves no HTTPS (documented exception in the source test).

## Test-suite notes

- Phase 14 screenshots wait for the stage heading and use `animations: 'disabled'`: `.panel`/`.center-stage` have a finite `vv-fade-in`, and SwiftShader can take seconds to draw the first frame after a 3D view is left.
- Rebuild before e2e (it serves `dist/`). Restore unrelated regenerated screenshots after full runs.
