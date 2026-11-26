# Development roadmap

**Mission:** an interactive, scientifically grounded representation of matter, energy, space, waves, fields and life, so users can explore the connected physical processes that shape reality.

Four environments share one set of records, data services, renderers and solvers: **ATOMIC** (cyan) · **COSMIC** (violet) · **SPECTRAL** (amber) · **BIOLOGIC** (emerald). A fifth system, **FIELDS**, is contextual and is not a separate mode. Focused specifications: [SPECTRAL_MODE_SPEC](SPECTRAL_MODE_SPEC.md) · [FIELDS_ARCHITECTURE](FIELDS_ARCHITECTURE.md) · [BIOLOGIC_MODE_SPEC](BIOLOGIC_MODE_SPEC.md) · [SCIENTIFIC_RELATIONSHIPS](SCIENTIFIC_RELATIONSHIPS.md).

Treat each phase below as a proposal. Re-assess numerical methods, dataset access and compute cost before starting it. A feature listed here does not exist until its gate is marked done.

## Status

| Phase | Scope | Status |
|---|---|---|
| **1 Foundations** | architecture, physics core, landing, periodic table, atomic models, orbitals, molecule viewer, solar system, timeline, data adapters | **Complete** |
| **2 Molecular Laboratory** | builder, two validators, VGFF-1 optimisation, 140-molecule library, PubChem search, formats, comparison, NIST spectra | **Complete** |
| **3 Physics Sandbox** | N-body Explore/Experiment/Compare, molecular dynamics, instruments, IndexedDB notebook | **Complete** |
| **4 Matter, Materials, Energy & Wave Foundations** | 4.1 reactions · 4.2 thermochemistry · 4.3 crystals & materials · 4.4 phases · 4.5 wave engine · 4.6 Spectral Mode · 4.7 FIELDS + cross-mode links | **In progress**: Gates 4.1–4.5 done |
| 5 Interstellar & Stellar | nearby stars, exoplanets, Gaia, stellar classes, HR diagram, stellar spectroscopy and thermal radiation, links to composition | Planned |
| 6 Deep Space & Invisible Gravity | nebulae, galaxies, compact objects, black holes, relativity foundations, lensing, JWST/Hubble galleries, rotation curves, first dark-matter halo models | Planned |
| 7 Cosmology & Observable Universe | clusters, large-scale structure, distances, CMB, dark-matter evidence explorer, dark energy, expansion history, GWOSC observations | Planned (FLRW module + tests exist) |
| 8 Unified Scale & Relationships | universal scale navigation, relationship registry UI, integrated spectroscopy, shared instruments, unified notebook, pathways | Planned (registry started in 4.1) |
| 9 Applied Waves & Communications | 9.1 EM fields & antennas · 9.2 RF/wireless atlas · 9.3 3D communications room · 9.4 modulation lab · 9.5 acoustic lab · 9.6 audio synthesis/FFT · 9.7 room acoustics & resonance | Planned |
| 10 Optics, Radiation & Energy | 10.1 geometric optics · 10.2 wave optics · 10.3 polarisation & optical materials · 10.4 atomic/molecular spectroscopy · 10.5 thermal radiation & energy transfer · 10.6 camera/telescope instruments · 10.7 atmospheric radiation & remote sensing | Planned |
| 11 Biologic Foundations | 11.1 bio data infrastructure & atlas · 11.2 biomolecular encyclopedia · 11.3 protein structures · 11.4 cells · 11.5 organelles & membranes · 11.6 transport & biochemistry · 11.7 plant cells & microorganisms | Planned |
| 12 Human Anatomy & Physiology | 12.1 reference model · 12.2 skeletal/muscular · 12.3 cardiovascular/respiratory · 12.4 nervous system & electrophysiology · 12.5 digestive/urinary/endocrine · 12.6 immune/reproductive/integumentary · 12.7 organ-to-cell navigation | Planned |
| 13 Waves, Life & Imaging | 13.1 vision · 13.2 hearing · 13.3 bioelectricity · 13.4 EM–tissue interactions · 13.5 optical & electron microscopy · 13.6 ultrasound/X-ray/MRI · 13.7 integrated visualisations | Planned |
| 14 Advanced Foundations | 14.1 Standard Model atlas · 14.2 quantum lab · 14.3 nuclear physics & nucleosynthesis · 14.4 plasma/MHD · 14.5 advanced relativity · 14.6 cosmology & dark-matter model comparison · 14.7 unified pathways | Planned |

The astronomy roadmap (Phases 5–8) keeps its place. It is not postponed until every new field is finished.

## Phase 4 gates (expanded)

| Gate | Deliverable | Status |
|---|---|---|
| 4.1 | Curated reaction library (52 cited equations), atom/charge conservation, exact stoichiometry solver, explicit *unsupported* state, molecule-viewer links, reaction → biology/atmosphere relationships | **Done** |
| 4.2 | Standard-state thermochemistry (CODATA Key Values + NIST WebBook), ΔrH°/ΔrS°/ΔrG°(T)/K, Hess's law, energy diagrams, reusable energy-transfer interfaces | **Done** |
| 4.3 | Crystal lattices (unit cells, supercells, coordination, packing, density, Bragg spacings); material records with condition-tagged optical/electrical/thermal/acoustic properties | **Done** |
| 4.4 | H₂O and CO₂ phase diagrams (IAPWS / Span–Wagner), intermolecular forces, qualitative Lennard-Jones fluid; phase ↔ wave-propagation links | **Done** |
| 4.5 | Shared wave-physics engine and Wave Laboratory (`#/spectral/lab`) | **Done** |
| 4.6 | Spectral Mode: EM spectrum atlas, photon energy, plane-wave visualisation, atomic spectroscopy link | Planned |
| 4.7 | FIELDS foundation (gravity, point charge, plane wave, temperature) and three cross-mode relationships; landing page with four environments; Biologic architecture documents only | Planned |

If a gate turns out much larger than planned, it is split into documented sub-gates. Scientific quality is not reduced to make it fit.
