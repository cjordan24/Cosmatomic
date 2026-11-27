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
| **4 Matter, Materials, Energy & Wave Foundations** | 4.1 reactions · 4.2 thermochemistry · 4.3 crystals & materials · 4.4 phases · 4.5 wave engine · 4.6 Spectral Mode · 4.7 FIELDS + cross-mode links | **Complete** (Gates 4.1–4.7) |
| **5 Interstellar & Stellar** | 5.1 nearby stars · 5.2 stellar classes & HR diagram · 5.3 exoplanets · 5.4 stellar spectra & thermal radiation · 5.5 cross-links | **Complete** (Gates 5.1–5.5) |
| **6 Deep Space & Invisible Gravity** | 6.1 relativity foundations · 6.2 compact objects & black holes · 6.3 gravitational lensing · 6.4 galaxies & rotation curves · 6.5 nebulae & image galleries | **Complete** (Gates 6.1–6.5) |
| **7 Cosmology & Observable Universe** | 7.1 expansion & distances · 7.2 distance ladder · 7.3 CMB · 7.4 dark-matter evidence explorer · 7.5 gravitational waves (GWOSC) | **Complete** (Gates 7.1–7.5) |
| **8 Unified Scale & Relationships** | 8.1 universal scale navigator · 8.2 relationship explorer · 8.3 integrated spectroscopy · 8.4 shared instruments · 8.5 unified notebook · 8.6 pathways | **In progress** (Gates 8.1–8.4 done; approved 2026-11-27) |
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
| 4.6 | Spectral Mode: EM spectrum atlas (`#/spectral`) with named band conventions (ITU-R V.431, CIE S 017, ISO 21348, detector IR), photon energy, 3D plane wave with polarisation, blackbody, NIST lines linked from the element view | **Done** |
| 4.7 | FIELDS foundation (gravity, point charge, plane wave, temperature) and three cross-mode relationships; landing page with four portals (ATOMIC · COSMIC · SPECTRAL live; CELLULAR greyed out, “Coming soon”); Biologic architecture documents | **Done** |

## Phase 5 gates

| Gate | Deliverable | Status |
|---|---|---|
| 5.1 | Nearby-star catalogue: 10 pc sample (Reylé et al. 2021/2023) with per-value references, CNS5 to 20 pc, 3D map in galactic/ICRS frames (`#/cosmic/stars`), derived distance, M, v_t, dwarf calibrations, stellar scale level | **Done** |
| 5.2 | Stellar classes and HR diagrams (`#/cosmic/stars/hr`): observed CMD to 20 pc, luminosity–temperature with constant-radius lines, Sun from IAU 2015 B3, MK class table, converted-photometry check | **Done** |
| 5.3 | Exoplanets within 10 pc (`#/cosmic/stars/planets`): exoplanet.eu elements with uncertainties, face-on orbits with ±1σ bands, mass–period diagram with the Solar System, Kepler/JD/range checks | **Done** |
| 5.4 | Stellar spectra and thermal radiation: Planck model per star at its class mean T_eff, class ↔ NIST line spectra (OpenStax §17.3), star ↔ blackbody links shown in both directions in the Spectral atlas | **Done** |
| 5.5 | Cross-links: Sun ↔ class G (OpenStax) and ↔ 28 photospheric elements (Asplund 2009) with a composition strip in the Sun panel, nearby stars and exoplanets in universal search (lazy-loaded), Sun → HR diagram, stellar scale level; landing unchanged (stars live inside COSMIC, four portals) | **Done** |

## Phase 6 gates

| Gate | Deliverable | Status |
|---|---|---|
| 6.1 | Relativistic module: Schwarzschild radii (horizon, photon sphere, ISCO, critical impact parameter), static and orbital clocks, exact and weak-field gravitational redshift, effective potentials, numerically integrated light paths, weak-field tests (Mercury, solar deflection), Lorentz factor (`#/cosmic/relativity`) | **Done** |
| 6.2 | Compact objects and black holes (`#/cosmic/compact`): 4 white dwarfs of the 10 pc sample with dynamical/lensing masses, 3 neutron stars, 4 black holes (Sgr A*, M87*, Cyg X-1, GW150914), mass–radius diagram, Sirius B redshift and EHT shadow checks, measured presets in the Relativity view | **Done** |
| 6.3 | Gravitational lensing (`#/cosmic/lensing`): point-lens equations (N&B 1996), lens plane by inverse ray shooting, microlensing light curves, Stein 2051 B astrometric deflection (Sahu et al. 2017) linked from the 10 pc sample; Cosmic chips grouped into Stars ▾ and Gravity ▾ menus | **Done** |
| 6.4 | Galaxies and rotation curves (`#/cosmic/galaxies`): SPARC (175 galaxies) vs baryons-only Newtonian and a fitted NFW halo (labelled a model), adjustable Υ; Milky Way parameters (Bland-Hawthorn & Gerhard 2016) and rotation curve (Eilers et al. 2019); Galaxies scale level now interactive | **Done** |
| 6.5 | Nebulae and image gallery (`#/cosmic/nebulae`): 7 CC BY 4.0 images (ESA/Hubble, ESA/Webb, ESO/EHT) with verbatim credits and checksums; 5 nebula records (Menten 2007, OpenStax §20.2/§22.4); Hα, [N II], [O III] links into the Spectral atlas; EHT images in the Black holes panel | **Done** |

## Encyclopedia (cross-cutting)

The goal is learning, so values are explained with cited text: verbatim excerpts with a credit line, link and licence, never text written by Voyager. Open and public-domain sources are preferred, and short attributed quotations from copyrighted sources are allowed (user decision, 2026-11-26).

| Gate | Deliverable | Status |
|---|---|---|
| E.1 | Encyclopedia framework: corner menu (📖, deep link `?enc=`), a collapsible *About* section for the selected item, search; 8 radiation entries from NASA's *Tour of the Electromagnetic Spectrum*, matched to wavelengths through ISO 21348 / ITU-R V.431 | **Done** |
| E.2+ | Elements, molecules, celestial objects (sources to be checked per category) | Planned |

## Phase 7 gates

| Gate | Deliverable | Status |
|---|---|---|
| 7.1 | Expansion and distances (`#/cosmic/universe`): Planck 2018 ΛCDM (Table 2) with radiation from z_eq; comoving, luminosity, angular-diameter and light-travel distances, lookback time and age (Hogg 1999); expansion history (a(t), Ω_i(z), q, acceleration onset); cosmological lensing distances (Hogg eq. 19) linked to the Lensing view; checked against Planck's age and r∗/θ∗; Observable-universe scale level interactive | **Done** |
| 7.2 | Distance ladder (`#/cosmic/ladder`): parallax precision of the 10 pc sample and three geometric anchors (Gaia Cepheid parallaxes, LMC eclipsing binaries, NGC 4258 masers); Cepheid Leavitt law (SH0ES 2022 eq. 1, baseline fit); TRGB zero point (Freedman 2021 Table 3); 42 calibrator SNe Ia (SH0ES Table 6) and H₀ = 10^(0.2 M⁰_B + a_B + 5); local H₀ (SH0ES 2022, CCHP 2021, CCHP 2025) against Planck 2018, with each team’s own statement quoted | **Done** |
| 7.3 | CMB (`#/cosmic/cmb`): FIRAS monopole (Fixsen et al. 1996 Table 4, NASA LAMBDA) against Planck’s law with residuals, χ² and distortion limits; T(z) = T₀(1+z) with CO and molecular measurements at z = 0.89–2.69 (Noterdaeme et al. 2011, Muller et al. 2013); Planck 2018 TT power spectrum and best fit from the Planck Legacy Archive (CC BY-NC 3.0 IGO, credit ESA, Planck Collaboration) | **Done** |
| 7.4 | Dark-matter evidence (`#/cosmic/darkmatter`): every probe shows the observation (gold), the visible matter under Newtonian gravity (green) and a model with dark matter (violet). SPARC g_obs against g_bar and V_obs²/V_bar²; the Milky Way; the Bullet Cluster (Clowe et al. 2006 Table 2, 100 kpc apertures, lensing against visible mass); the Coma cluster (Łokas & Mamon 2003 mass model recomputed, Jeans σ_los for stars + gas against the full model); the cosmic census (BBN deuterium, Cooke et al. 2018, against Planck Ω_b h², Ω_c h²) | **Done** |
| 7.5 | Gravitational waves (`#/cosmic/gw`): the cumulative GWOSC catalog (391 confident events, GWTC-1 to GWTC-5.0; 282 with source-frame masses, distances and redshifts, medians with 90 % intervals; CC BY 4.0), m₁–m₂ and cumulative-detection plots, each event beside derived quantities and z(d_L) in the catalog cosmology (reproduced for all 281 events); GW150914 then (2016 PRL) and now (GWTC-2.1). A leading-order chirp (Newtonian orbit + quadrupole formula, LIGO/Virgo “basic physics of GW150914”) with waveform, f(t), ISCO, separation, strain, luminosity and energy, checked against the paper’s numbers. GW170817: speed-of-gravity bounds recomputed from the GW–GRB delay; standard-siren H₀ beside Planck and SH0ES | **Done** |

## Phase 8 gates

Approved by the user on 2026-11-27 (“proceed as planned”). Encyclopedia pass E.2 follows Gate 8.3.

| Gate | Deliverable | Status |
|---|---|---|
| 8.1 | Universal scale navigator (`#/scale`): a powers-of-ten zoom from 10⁻¹⁶ to 10²⁷·⁵ m; 29 reference objects drawn to one linear scale, each read from a bundled dataset or constant with its interval, provenance class and sources (proton CODATA 2022 → observable universe in Planck 2018 ΛCDM); log ruler of the whole range; *Galaxy clusters* scale level now interactive (Coma) | **Done** |
| 8.2 | Relationship explorer (`#/relations`): neighbourhood map (1–2 steps) of any entity, shortest chain of sourced edges between two entities, a filterable table of all 140 relationships, planned entities with their phase; filters by relationship type; registry statistics (199 entities, 27 connected groups, 45 unlinked); the 10 pc stars on request; “map ↗” on every *Related across modes* list; 🔗 in the top bar | **Done** |
| 8.3 | Integrated spectroscopy (`#/spectral/compare`): NIST atomic lines, nebula lines at NIST rest wavelengths, blackbody models (Sun, class V dwarfs, CMB), the 43 FIRAS points and n(λ) of 9 materials on one wavelength/frequency/energy axis; continuum as λB_λ = νB_ν; each layer labelled observed or model; optional (1 + z) transformation of line and stellar layers; molecular IR listed as not bundled | **Done** |
| 8.4 | Shared instruments (`src/ui/instruments.tsx`): one ruler, probe, time-series recorder (stats, CSV with provenance) and dimension-checked unit converter across Sandbox, Cosmic, Wave lab (movable probe) and Fields (pinned-point ruler); unit choice shared by all views; converter in the Scale navigator | **Done** |
| 8.5 | Unified notebook: snapshots of any view (route, parameters, provenance, sources, version); JSON/CSV/Markdown export with citations; existing experiments migrated | Planned |
| 8.6 | Pathways: curated walks along sourced registry edges and cited encyclopedia excerpts | Planned |

If a gate turns out much larger than planned, it is split into documented sub-gates. Scientific quality is not reduced to make it fit.
