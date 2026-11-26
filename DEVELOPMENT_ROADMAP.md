# Development roadmap

The master specification (8 phases) is the long-term product plan. Status after Phase 1:

| Phase | Scope | Status |
|---|---|---|
| **1 Foundations** | architecture, VPE core, landing, periodic table, atomic diagrams & 3D models, orbitals, molecule viewer, solar system, time controls, data adapters, screenshots | **Complete** (+ Voyager 1/2 with Blender model, encounter ephemerides) |
| 2 Molecular Laboratory | builder, validation, geometry optimisation, 100-molecule library, PubChem search, import/export, comparison, expanded isotopes/orbitals | **Gate 2.1 done** (library 140, search, formats, comparison) · **Gate 2.2 done** (builder + two validators + identity) · **Gate 2.3 done** (VGFF-1 optimisation) · **Gate 2.4 done** (NIST spectra, isotope chart) — **Phase 2 complete** · 2.3 optimisation · 2.4 NIST spectra |
| 3 Physics Sandbox | interactive N-body, editable systems, MD foundations, instruments, experiment manager (IndexedDB) | **Gate 3.1 done** (gravitational sandbox: Explore/Experiment/Compare) · 3.2 molecular dynamics · 3.3 instruments · 3.4 experiment notebook |
| 4 Chemical & Material Science | curated reactions (unsupported → explicit state), thermodynamics, lattices, phases | Planned |
| 5 Beyond the Solar System | nearby stars, Gaia, Exoplanet Archive, HR diagram, Milky Way | Planned (scale ladder entries reserved) |
| 6 Deep Space | nebulae, compact objects, galaxies, JWST/Hubble galleries, relativistic visuals | Planned |
| 7 Observable Universe | catalog streaming, cosmic web, redshift distances (FLRW module + tests exist) | Foundations in place |
| 8 Unified Scale Explorer | continuous multiscale navigation, spectroscopy, nucleosynthesis | Cross-links (Sun→H, atmosphere→molecules) already working |

## Implemented vs planned (Phase 1 detail)

**Implemented:** constants registry & dimension-checked units · TDB clock with leap seconds · seeded RNG · snapshots/replay · leapfrog N-body + conservation diagnostics · FLRW distances · module registry with validity limits · provenance classes · 16-level scale navigator · landing portals with zoom transition · universal search · settings (reduced motion, high contrast) · keyboard navigation · 118-element table, 13 colour schemes with legends/units/no-data hatching, filters · isotopes (CIAAW + NUBASE) and ion states · 5 3D atom views · 8 2D diagrams · excitation/emission (one-electron) · 49 molecules: 4 display modes, measurement, XYZ/JSON/PNG export · solar system: Sun, 8 planets, 5 dwarf planets, 22 moons, Voyager 1 & 2 · IAU orientations · Saturn rings · orbit paths · Hill-sphere overlay · two reference frames · size exaggeration (disclosed) · distance & light-time tool · timeline (play/reverse/rate/step/date/now/slider/bookmarks) · cross-mode links · 11 data adapters + validator · 73 scientific tests · 18 browser tests / 33 screenshots.

**Planned (not in Phase 1):** molecular builder & reactions · NIST spectra · asteroid/Kuiper belts, comets, Trojans, Oort-cloud population model, further spacecraft · planetary imagery/textures · experiment notebook (IndexedDB) · stars, galaxies, cosmology visualisation · WebGPU path · optional Python/RDKit backend.

---

## Recommended implementation prompt for Phase 2

> **Voyager Ventures — Phase 2: Molecular Laboratory.**
> Continue the existing repository (read ARCHITECTURE.md, SCIENTIFIC_MODELS.md, KNOWN_LIMITATIONS.md first; do not rewrite working systems; keep science / data / rendering separation and the provenance rules).
>
> 1. **Library to ≥ 100 validated molecules:** extend `scripts/ingestion/pubchem-molecules.ts` (amino acids ×20, nucleobases/nucleotides, fatty acids, ATP/NADH, common minerals' formula units, interstellar molecules from a cited ISM census). Add experimental geometries where available (NIST CCCBDB) and keep computed-vs-experimental badges. Add C₆₀ from an experimental structure source with citation.
> 2. **On-demand PubChem search** (name/formula/SMILES → CID → 3D record) with caching in IndexedDB, rate limiting ≤ 5 req/s, and an explicit "no 3D conformer available" state.
> 3. **Molecular builder** in `src/modes/atomic/laboratory/`: place atoms from the periodic table, bond/unbond, bond orders 1–3 + aromatic, formal charges, delete/replace, move/duplicate fragments, bond rotation; live Hill formula & mass; undo/redo.
> 4. **Validation:** valence/charge rules with clear warnings; a clearly labelled *Hypothetical* sandbox for disallowed structures. Evaluate RDKit-JS (WASM) for sanitisation/SMILES/InChI; if adopted, document size and load lazily.
> 5. **Geometry optimisation:** implement UFF (or MMFF94 via RDKit-JS) in a Web Worker with convergence criteria, energy reporting and validity limits; label results *Simulated*.
> 6. **Import/export:** XYZ, MOL/SDF V2000, PDB (small molecules), SMILES; round-trip tests.
> 7. **Comparison view:** two molecules side by side with bond-length/angle tables.
> 8. **Expanded atomic models:** ingest NIST ASD lines for ≥ 20 elements and show real emission/absorption spectra; add isotope comparison charts.
> 9. **Tests:** extend `tests/science` (valence validation, optimiser reproduces water/methane/benzene geometries within stated tolerances, format round-trips) and `tests/e2e` with screenshots to `screenshots/phase-02/`.
> 10. Update all docs, BUILD_LOG.md and KNOWN_LIMITATIONS.md; return screenshots, validation results and a Phase 3 prompt.
