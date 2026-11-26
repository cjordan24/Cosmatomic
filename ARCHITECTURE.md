# Architecture

## Principles
1. **Science, data and presentation are separate layers.** Physics lives in `src/core` and `src/modes/*/(atoms|orbitals|molecules|solar-system)/*.ts` as pure TypeScript (no React, no three.js). Rendering code only *reads* physical state.
2. **Physical coordinates ≠ rendering coordinates.** Physics uses float64 SI-derived units (km, Å, a₀); rendering converts at the boundary. Visual exaggeration (size slider) changes drawing radii only.
3. **One dataset → many views.** All 118 atomic views, 8 diagrams and 5 3D representations derive from a single `AtomState` built from the element/nuclide datasets.
4. **Specialised solvers, common interfaces.** Each physics module declares status, solvers, validity limits and version in `src/core/physics/modules.ts`, surfaced in Settings → Engine status.

## Stack
React 19 · TypeScript 5.9 · Vite 8 · three.js 0.187 via @react-three/fiber 9 / drei 10 · Zustand 5 · Web Workers · Vitest 5 · Playwright 1.65 · Blender 4.5 (asset build only).
Ingestion is TypeScript on Node (`--experimental-strip-types`) rather than Python because no Python interpreter was available in the build environment; adapters are dependency-free and share one library (`scripts/ingestion/lib/ingest.ts`).

## Module map

```
src/
├── core/                         ← Voyager Physics Engine (VPE)
│   ├── constants/constants.ts      CODATA 2018 + IAU constants with units & uncertainties
│   ├── units/{dimensions,units}.ts dimension vectors, unit registry, checked conversion (fm…Mpc, eV, u, M☉ …)
│   ├── mathematics/{vec3,kepler}.ts float64 vectors, frame rotations, Kepler solver
│   ├── simulation/                 clock (TDB JD, leap seconds), seeded PRNG, snapshots & replay
│   ├── physics/                    gravity (leapfrog N-body + diagnostics), cosmology (FLRW), module registry
│   ├── provenance/provenance.ts    five reliability classes + record metadata
│   └── scale/scale.ts              16-level logarithmic scale ladder
├── modes/
│   ├── landing/                    two live portals
│   ├── atomic/
│   │   ├── periodic-table/         layout + 13 colour schemes
│   │   ├── atoms/                  elements, configuration engine, isotopes, spectra, AtomState, 3D scene, diagrams
│   │   ├── orbitals/               analytic ψ_nlm, exact |ψ|² sampler, worker hook
│   │   ├── molecules/              records, formats (XYZ/MOL/SDF/PDB), PubChem client, user library, viewer, comparison
│   │   └── laboratory/             builder operations, valence model, RDKit-JS bridge, lab scene + view
│   └── cosmic/
│       ├── solar-system/           ephemerides, catalogue, live clock, scene, timeline, view
│       └── sandbox/                N-body physics, presets, instruments, Experiment/Compare view
├── rendering/                      Viewport (adaptive DPR, log depth), PointCloud shader, labels, colours
├── workers/orbital.worker.ts       Monte-Carlo sampling off the UI thread
├── shared/{router,store}.ts        hash router (deep links) + Zustand store
└── ui/                             top bar, search, scale navigator, settings, panels, theme
```

Reserved (empty) folders from the master spec — `modes/atomic/{reactions,laboratory}`, `modes/cosmic/{star-systems,galaxies,nebulae,black-holes,universe}` — are the extension points for Phases 2–7.

## Data flow

```
PubChem / JPL / NASA ──(scripts/ingestion, rate-limited, cached)──▶ datasets/*.json + manifests (sha256, provenance)
                                                                        │  static JSON imports (lazy where large)
                                                                        ▼
                         pure science modules (ephemeris, configuration, hydrogenic, molecules …)
                                                                        │  derived state (AtomState, positions)
                                                                        ▼
                               React views ── R3F scenes ── DOM panels (read-only consumers)
```

Large datasets are code-split: nuclides (847 KiB) load on the first element view; Voyager encounter ephemerides (641 KiB) load in Cosmic mode.

## Multiscale rendering
* **Atomic:** scene units = Bohr radii (orbitals), femtometres (nucleus), ångström (molecules) — each view rescales from physical units at the boundary.
* **Cosmic:** physics in float64 km, heliocentric ecliptic J2000. Every frame a **floating origin** (the focused body, or the Sun) is subtracted in float64 before conversion to float32 scene units (1 unit = 1000 km), giving sub-km precision near the camera across 10¹⁰ km. A **logarithmic depth buffer** plus a **dynamic near plane** (2×10⁻⁴ × camera distance) let a 3.7 m spacecraft and 250 au trajectories share one frustum. Focus changes interpolate the origin in float64 and the camera distance logarithmically.
* **Clock:** the render loop advances a float64 `live.jd` every frame (deterministic `advance()`), publishing to the store at 10 Hz so panels do not re-render at 60 Hz.

## Performance
Single-draw-call point clouds (custom shader, additive blending); InstancedMesh nucleons; orbit paths recomputed only when the date moves > 5 days; worker sampling; adaptive DPR via `PerformanceMonitor`; lazy route chunks; R3F automatic disposal plus explicit disposal of manually created geometries/textures.

## Extension interfaces
* New physics module → add to `PHYSICS_MODULES`, put the solver in `src/core/physics`, write a `tests/science` file with explicit tolerances.
* New dataset → adapter in `scripts/ingestion` using `fetchText/writeDataset` (gets caching, retries, storage budget, manifest + hash for free); `npm run data:validate` checks it.
* New celestial body → ephemeris function + `CelestialBody` record with provenance; the scene, labels, search and panels pick it up automatically.
* New 3D asset → Blender script in `scripts/blender`, exported to `public/models`, source `.blend` in `assets/blender`.
