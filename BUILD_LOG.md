# Build log

## 2026-11-25/26 — Phase 1

**Environment.** Bare macOS (Intel) with no Node, Python or git (Xcode CLT absent). Installed official Node.js 24.22.3 LTS to `~/.local/node` (SHA-256 verified against nodejs.org SHASUMS256). Playwright Chromium installed. Blender 4.5.17 LTS (installed by the user mid-build) used headless for 3D assets. Ingestion written in TypeScript (no Python available).

**Data.** Probed and wrote adapters for PubChem (periodic table, PUG View, PUG REST), JPL SSD, JPL Horizons, JPL SBDB, NASA NSSDC. Bugs found and fixed during ingestion:
- `URL.pathname` percent-encoded the space in the project path → switched to `fileURLToPath`.
- `Infinity` serialises to `null` in JSON and `/stable/` matched "p-Unstable" → explicit `stable` flag.
- CIAAW interval abundances (e.g. Li `[0.019, 0.078]`) were parsed as their lower bound → stored as interval + midpoint.
- Nuclide label "235Um" parsed with symbol "Um" (greedy regex) → isomers lost, 123 duplicate ground states → match the known symbol; ingestion now fails on duplicates; regression test added.
- Horizons `format` must not be quoted; JPL Table-1 parser rewritten to pair rows explicitly; satellite table column offsets corrected.

**Validation-driven fixes.**
- Fixed TDB−UTC offset was wrong before 2017 → IERS leap-second table.
- IAU 2015 Mars pole requires periodic terms → IAU 2009 secular pole.
- Uranus obliquity off by 180°−2×97.8° → spin axis = sign(Ẇ)·IAU pole (retrograde rotators).
- Voyager flybys were misplaced by 10⁵–10⁶ km because planets come from Table-1 elements → ingested Horizons encounter ephemerides (planets + moons), blended in; Jupiter/Saturn flybys now within 1 % of NASA values.
- Horizons trajectory sections parsed automatically; UI labels patched-conic / tracking-fit / prediction segments; 1989-08-29 splice documented.
- Hermite sampling densified (5 min) around closest approaches after leave-one-out tests exposed 3 000 km errors at 4-hour spacing.

**UI.** drei `<Html>` threw `removeChild` on Canvas teardown → replaced by sprite labels and a projected DOM label layer. Landing canvases had zero size; toolbars overlapped panels; default camera looked at night sides → sunward default view. Wheel zoom (≈6 %/notch) too slow for 10 decades → zoomSpeed 3 plus `?dist=<km>` deep links; labels swallowed wheel events → forwarded. Global moon-distance exaggeration replaced by a per-system minimal expansion.

**3D assets.** `scripts/blender/build_voyager.py` builds a 2 281-face Voyager from published dimensions → `public/models/voyager.glb` + `assets/blender/voyager.blend` + Eevee preview render.

**Results.** `npm test`: 73/73 scientific tests pass. `npm run test:e2e`: 18/18 browser tests pass with zero page errors; 32 browser screenshots + 1 Blender render in `screenshots/phase-01/` (see INDEX.md). `npm run build`: type-check clean, build < 1 s. `npm run data:validate`: 11/11 datasets verified.

## 2026-11-26 — Deployment + Phase 2, Gate 2.1 (library, search, formats, comparison)

**Deployed Phase 1** to Vercel (team scope "Lodestar", project `voyager-ventures`): https://voyager-ventures.vercel.app — browser smoke test against the live URL passed (all routes render, lazy chunks load, no errors/4xx).

**Library:** curated list → 137 PubChem records (+ H₂, NO, C₆₀ = 140), all 20 amino acids, nucleobases, sugars, lipids, neurochemicals, vitamins, drugs, 30+ interstellar species (McGuire 2022 census). PubChem computed descriptors added. C₆₀ constructed exactly from gas-phase electron-diffraction bond lengths.
**Formats:** XYZ / MOL / SDF / PDB import + export; covalent-radius connectivity inference.
**Search:** in-browser PubChem client (CORS verified), rate-limited, throttling-aware, IndexedDB cache; user library persisted in IndexedDB.
**Comparison view:** side-by-side 3D + descriptors + bond statistics.
**Bugs caught by validation/screenshots:** Hill formula ignored net charge (acetylcholine⁺); MW tolerance must follow PubChem's reported precision; numeric formatter rounded PubChem CIDs (123591 → "123,600"); adapter cache key ignored the property list (stale responses without descriptors).
**RDKit-JS evaluation:** BSD-3, 7.4 MB WASM; provides sanitisation/SMILES/InChI/molblock but **no** 3D embedding or force fields → adopt (lazy) for validation in Gate 2.2; write own force field for Gate 2.3.
