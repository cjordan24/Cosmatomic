# Voyager Ventures

An interactive, scientifically grounded sandbox for exploring the physical universe — from atomic nuclei to the outer solar system.

| Mode | What you can do in Phase 1 |
|---|---|
| **ATOMIC** — *explore the building blocks of existence* | **Phase 4:** curated reaction library with exact balancing and conservation checks (`#/atomic/reactions`), with standard-state thermochemistry (CODATA + NIST: ΔrH°, ΔrS°, ΔrG°(T), K, energy diagrams) · materials and crystal lattices (`#/atomic/materials`: 3D supercells, densities, coordination, Bragg reflections, sourced optical/thermal/acoustic properties) · phase diagrams of water and CO₂ (IAPWS, Span–Wagner) with a state probe, and a live Lennard-Jones fluid (`#/atomic/phases`) · 118-element periodic table with 13 data colour schemes · per-element atomic models driven by one validated dataset (shell model, \|ψ\|² clouds, analytic s/p/d/f orbitals, nucleus, size) · 8 linked 2D diagrams · isotope & ion switching · excitation/emission for one-electron atoms · 49-molecule 3D viewer with measurement and export |
| **SPECTRAL** — *waves, frequencies, radiation and energy* | Wave laboratory (`#/spectral/lab`): travelling transverse/longitudinal waves, superposition and interference, beats, standing waves, dispersion, a Courant-checked numerical pulse, two-source interference, Doppler; speeds from sourced media; save to the notebook |
| **COSMIC** — *explore the structure of the universe* | Navigable solar system (Sun, 8 planets, Pluto + 4 dwarf planets, 22 major moons, Voyager 1 & 2) at true scale with floating-origin rendering · JPL-validated positions 1800–2050 · Horizons encounter ephemerides for the Voyager flybys · info panels with provenance · universal timeline with reverse playback, stepping and bookmarks |

A **Source Index** (`#/sources`) lists every source with its link, institution and a verified note on its authors. Every value is traceable to a source and a reliability class (**Observed · Derived · Simulated · Illustrative · Hypothetical**). Missing data is shown as *unknown* — never invented.

---

## Quick start

Requirements: **Node.js ≥ 22** (developed on 24.22.3 LTS). No API keys are needed.

```bash
npm install
npm run dev          # http://localhost:5173
```

| Command | Purpose |
|---|---|
| `npm run dev` | Vite dev server with HMR |
| `npm run build` | Type-check (`tsc -b`) + production build to `dist/` |
| `npm run preview` | Serve the production build at http://localhost:4173 |
| `npm test` | **Scientific validation suite** (Vitest) |
| `npm run test:e2e` | Browser verification + milestone screenshots (Playwright; run `npx playwright install chromium` once) |
| `npm run data:all` | Re-ingest all datasets from PubChem / JPL / NASA (rate-limited, cached in `datasets/.cache/`) |
| `npm run data:validate` | Verify every dataset against its manifest (SHA-256, size, JSON) |
| `npm run models:build` | Rebuild the Voyager 3D model in Blender (headless) → `public/models/voyager.glb` |

The built app is fully static — the curated datasets ship with it, so it works offline.

### Deep links
`#/atomic/element/26?view=cloud&q=2` · `#/atomic/element/1?view=orbital&orb=3,2,0` · `#/atomic/molecules/pubchem-2519` · `#/cosmic/saturn` · `#/cosmic/voyager-1`

### Keyboard
`/` search · arrow keys move through the periodic table · `Space` play/pause time · `,` / `.` step a day · all panels collapsible.

---

## Deployment

The app is a static site (`dist/`). A `vercel.json` is included (`npm run build`, output `dist`, immutable asset caching). Any static host works (Netlify, GitHub Pages with a relative base, S3/CloudFront).
Production: https://voyager-ventures.vercel.app (Vercel Hobby, deployed after each gate).

Environment variables: none required. See `.env.example` for the optional (server-side only) NASA API key placeholder for future adapters.

Browser support: current Chrome/Edge, Firefox, Safari 17+ (WebGL 2, ES2022 modules, module Web Workers). The UI is responsive down to 390 px wide.

---

## Project layout (summary — see ARCHITECTURE.md)

```
src/core/         Voyager Physics Engine: constants, units, maths, simulation, physics modules, provenance, scale
src/modes/atomic/ periodic table, atoms (+ diagrams), orbitals, molecules
src/modes/cosmic/ solar system: ephemerides, catalogue, scene, timeline
src/rendering/    shared 3D infrastructure (viewport, point clouds, labels, colours)
src/workers/      orbital Monte-Carlo sampling worker
datasets/         ingested data + manifests (provenance, hashes) + curated transcriptions
scripts/          ingestion adapters (TypeScript), validation, Blender model builder
tests/science     scientific validation   ·   tests/e2e  browser verification
assets/blender    Blender source files      ·   public/models  exported GLB
screenshots/      milestone screenshots (phase-01/INDEX.md)
```

Documentation: [ARCHITECTURE](ARCHITECTURE.md) · [SCIENTIFIC_MODELS](SCIENTIFIC_MODELS.md) · [DATA_SOURCES](DATA_SOURCES.md) · [KNOWN_LIMITATIONS](KNOWN_LIMITATIONS.md) · [DEVELOPMENT_ROADMAP](DEVELOPMENT_ROADMAP.md) · [BUILD_LOG](BUILD_LOG.md)

Voyager Ventures is an independent project with no dependency on any other studio codebase. Scientific data belongs to the cited institutions; see DATA_SOURCES.md for attribution and usage terms.
