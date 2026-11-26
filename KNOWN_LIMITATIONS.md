# Known limitations and bugs (Phase 1)

## Scientific
* **Multi-electron atoms** use hydrogenic orbitals with Slater Z_eff — qualitative only (no Hartree–Fock/DFT, no relativistic effects for heavy elements, principal n instead of Slater n*). Labelled in the UI.
* **Spectra** are computed only for one-electron systems; NIST ASD lines for other elements are not yet ingested (link shown instead).
* **Ion configurations** use the "remove highest-n first / Madelung for anions" rule; a few real ions differ.
* **Cosmic abundances**: only 28 elements (Asplund 2009) were transcribed; others show "no data". Values are manually transcribed and should be re-verified against the publication table by an automated adapter.
* **Molecule geometries** are MMFF94s conformers (e.g. CO₂ C=O 1.197 Å vs 1.160 Å experimental); H₂, NO and C₆₀ use experimental bond lengths. Bond orders are Kekulé. NO₂, SF₆ and stearic acid are absent (PubChem has no 3D conformer). 140 curated records.
* **PubChem search** needs network access and returns only compounds with a PubChem3D conformer (salts, metals, radicals and very large/flexible molecules are refused with an explanation). Interstellar-detection flags are a curated subset of the McGuire (2022) census, not an automated cross-match.
* **VGFF-1 optimiser:** approximate generic force field (no electrostatics, no dispersion attraction, no conformer search — finds the nearest local minimum). Poor for homonuclear diatomics, peroxides, P/S oxoacids, fused aromatics, fullerenes and transition-metal species; > 4-coordinate centres get no angle terms. Energies are relative strain only.
* **Builder:** no aromatic bond type (Kekulé only); no stereo editing (stereo is whatever the 3D placement implies); valence rules cover main-group elements only; identity lookup needs network access.
* **RDKit-JS** adds a ~7.4 MB one-time download when the Laboratory first opens.
* **File import:** XYZ/PDB-without-CONECT get single bonds only (no bond-order perception until the Phase 2.2 validator); MOL V3000 and aromatic bond type 4 are not supported.
* **Planet ephemeris** is JPL Table 1 (errors up to ~9′ for Saturn); the timeline is clamped to its 1800–2050 validity.
* **Moons and dwarf planets** use two-body propagation of 2025 osculating elements: phases drift by degrees per decade far from 2025. Inside Voyager encounter windows Horizons data replaces them.
* **Voyager trajectories**: Horizons uses *patched-conic mission-design* arcs before 1981-01-01 (V1) and 1989-08-29 (V2) — "rough accuracy". As a result the Voyager 2–Neptune closest approach appears at ≈33 700 km instead of ≈29 240 km (+15 %), Uranus −4.4 %. A ≈6 700 km jump exists in the source at the V2 1989-08-29 arc splice. Post-1992 positions are JPL predictions (no two-way tracking since).
* **UTC before 1972** uses a fixed TDB−UTC offset (display may be off by up to ~45 s).
* Spacecraft attitude is simplified (HGA pointed at Earth; roll arbitrary).
* No asteroid belt, Kuiper belt, comets, Trojans, other spacecraft or Oort-cloud model yet; nothing is fabricated in their place.

## Visual / UX
* Planets use flat colours and illustrative banding (no imagery/textures yet). No starfield background — catalog stars arrive with Gaia in Phase 5.
* Saturn's rings are uniform-opacity annuli per ring (no radial optical-depth profile); no Uranian/Neptunian rings.
* With true scale (default) most bodies are sub-pixel in the overview; labels mark them. Moon labels are decluttered by apparent separation.
* Mobile: the element diagrams open via a "Diagrams" button; cosmic scene options are reduced.
* Wireframe molecule mode creates line objects per render (fine for ≤ 100 atoms; to be memoised for large structures).

## Engineering
* Ingestion tools are TypeScript, not Python (no Python interpreter in the build environment); RDKit/Astropy-based tooling is deferred to Phase 2 with an optional backend.
* No git repository was initialised: the machine has no git (Xcode Command Line Tools not installed). Run `xcode-select --install`, then `git init`.
* IndexedDB experiment storage is not implemented yet (settings and timeline bookmarks use localStorage).
* Headless screenshots use SwiftShader software WebGL; real-GPU frame rates are not measured in this report.
* Cosmic labels live in a DOM overlay above the canvas; wheel events over labels are forwarded to the canvas so zoom still works.
* drei `<Html>` caused "removeChild" errors on canvas teardown under React 19 and was replaced by `src/rendering/labels.tsx`; avoid reintroducing it.
* Console shows a `THREE.Clock` deprecation warning originating inside @react-three/fiber (harmless).
