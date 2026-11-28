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
| **8 Unified Scale & Relationships** | 8.1 universal scale navigator · 8.2 relationship explorer · 8.3 integrated spectroscopy · 8.4 shared instruments · 8.5 unified notebook · 8.6 pathways | **Done — awaiting review** (Gates 8.1–8.6 and E.2 done 2026-11-27; not deployed) |
| **9 Applied Waves & Communications** | 9.1 EM fields & antennas · 9.2 RF/wireless atlas · 9.3 3D communications room · 9.4 modulation lab · 9.5 acoustic lab · 9.6 audio synthesis/FFT · 9.7 room acoustics & resonance | **Complete** (deployed 2026-11-27) |
| **10 Optics, Radiation & Energy** | 10.1 geometric optics · 10.2 wave optics · 10.3 polarisation & optical materials · 10.4 atomic/molecular spectroscopy · 10.5 thermal radiation & energy transfer · 10.6 camera/telescope instruments · 10.7 atmospheric radiation & remote sensing | **Done — awaiting review** (Gates 10.1–10.7 done 2026-11-27; not deployed) |
| **11 Biologic Foundations** | 11.1 bio data infrastructure & atlas · 11.2 biomolecular encyclopedia · 11.3 protein structures · 11.4 cells · 11.5 organelles & membranes · 11.6 transport & biochemistry · 11.7 plant cells & microorganisms | **Complete** (Gates 11.1–11.7, 2026-11-28; not deployed — no deploy until Phase 14) |
| **12 Human Anatomy & Physiology** | 12.1 reference model · 12.2 skeletal/muscular · 12.3 cardiovascular/respiratory · 12.4 nervous system & electrophysiology · 12.5 digestive/urinary/endocrine · 12.6 immune/reproductive/integumentary · 12.7 organ-to-cell navigation | **Complete** (Gates 12.1–12.7, 2026-11-28; not deployed — no deploy until Phase 14) |
| 13 Waves, Life & Imaging | 13.1 vision · 13.2 hearing · 13.3 bioelectricity · 13.4 EM–tissue interactions · 13.5 optical & electron microscopy · 13.6 ultrasound/X-ray/MRI · 13.7 integrated visualisations | **In progress** — 13.1–13.3 done (`#/biologic/senses`) |
| 14 Advanced Foundations | 14.1 Standard Model atlas · 14.2 quantum lab · 14.3 nuclear physics & nucleosynthesis · 14.4 plasma/MHD · 14.5 advanced relativity · 14.6 cosmology & dark-matter model comparison · 14.7 unified pathways | Planned |
| Queued: **15–19 Computing & Engineering** | 15 computing & computer engineering · 16 machine learning & AI · 17 mechanical & electrical engineering · 18 aerospace & space systems · 19 integrated systems & engineering simulator (brief: [COMPUTING_ENGINEERING_BRIEF](COMPUTING_ENGINEERING_BRIEF.md), verbatim) | **Queued** — begins once Phase 14 is complete (user, 2026-11-28) |
| Queued: Meteorology & Climate | atmospheric physics · Earth weather atlas · storm laboratory · planetary meteorology · climate through geological time · oceans and biomes · human technology and environmental change · future climate · environmental sandbox (brief: [METEOROLOGY_EXPANSION_BRIEF](METEOROLOGY_EXPANSION_BRIEF.md), its phases A–G) | **Queued** (requested 2026-11-28 “once the computing and engineering section is complete”: after Phases 15–19; phase numbers from 20, assigned when it starts) |

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
| 5.4 | Stellar spectra and thermal radiation: Planck model per star at its class mean T_eff, class ↔ NIST line spectra (IAU OAE Glossary; originally OpenStax, replaced 2026-11-27), star ↔ blackbody links shown in both directions in the Spectral atlas | **Done** |
| 5.5 | Cross-links: Sun ↔ class G (IAU OAE) and ↔ 28 photospheric elements (Asplund 2009) with a composition strip in the Sun panel, nearby stars and exoplanets in universal search (lazy-loaded), Sun → HR diagram, stellar scale level; landing unchanged (stars live inside COSMIC, four portals) | **Done** |

## Phase 6 gates

| Gate | Deliverable | Status |
|---|---|---|
| 6.1 | Relativistic module: Schwarzschild radii (horizon, photon sphere, ISCO, critical impact parameter), static and orbital clocks, exact and weak-field gravitational redshift, effective potentials, numerically integrated light paths, weak-field tests (Mercury, solar deflection), Lorentz factor (`#/cosmic/relativity`) | **Done** |
| 6.2 | Compact objects and black holes (`#/cosmic/compact`): 4 white dwarfs of the 10 pc sample with dynamical/lensing masses, 3 neutron stars, 4 black holes (Sgr A*, M87*, Cyg X-1, GW150914), mass–radius diagram, Sirius B redshift and EHT shadow checks, measured presets in the Relativity view | **Done** |
| 6.3 | Gravitational lensing (`#/cosmic/lensing`): point-lens equations (N&B 1996), lens plane by inverse ray shooting, microlensing light curves, Stein 2051 B astrometric deflection (Sahu et al. 2017) linked from the 10 pc sample; Cosmic chips grouped into Stars ▾ and Gravity ▾ menus | **Done** |
| 6.4 | Galaxies and rotation curves (`#/cosmic/galaxies`): SPARC (175 galaxies) vs baryons-only Newtonian and a fitted NFW halo (labelled a model), adjustable Υ; Milky Way parameters (Bland-Hawthorn & Gerhard 2016) and rotation curve (Eilers et al. 2019); Galaxies scale level now interactive | **Done** |
| 6.5 | Nebulae and image gallery (`#/cosmic/nebulae`): 7 CC BY 4.0 images (ESA/Hubble, ESA/Webb, ESO/EHT) with verbatim credits and checksums; 5 nebula records (Menten 2007; NASA/IAU OAE/Henney/O’Dell since the OpenStax replacement of 2026-11-27); Hα, [N II], [O III] links into the Spectral atlas; EHT images in the Black holes panel | **Done** |

## Encyclopedia (cross-cutting)

The goal is learning, so values are explained with cited text: verbatim excerpts with a credit line, link and licence, never text written by Voyager. Open and public-domain sources are preferred, and short attributed quotations from copyrighted sources are allowed (user decision, 2026-11-26).

| Gate | Deliverable | Status |
|---|---|---|
| E.1 | Encyclopedia framework: corner menu (📖, deep link `?enc=`), a collapsible *About* section for the selected item, search; 8 radiation entries from NASA's *Tour of the Electromagnetic Spectrum*, matched to wavelengths through ISO 21348 / ITU-R V.431 | **Done** |
| E.2a | Celestial objects: 12 entries (Sun, eight planets, Moon, Pluto, Ceres) quoted from NASA Science “Facts” pages; *About* section in the Cosmic object panel | **Done** |
| E.2b | Elements: 118 entries quoted from the Los Alamos National Laboratory periodic table with LANL’s reuse notice; *About* section in every element view (loaded on demand) | **Done** |
| E.2c | Molecules: 129 of 137 molecules with PubChem’s description built from ChEBI data (CC BY 4.0); mis-mapped items rejected; *About* section in the molecule view (loaded on demand) | **Done** |

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
| 8.5 | Unified notebook: “📸 Snapshot this view” (📓 menu, phone ☰) on any view stores route, parameters, readouts, provenance, cited sources, recorder series, screenshot and Voyager version/commit; JSON/CSV/Markdown export with full citations for every entry; sandbox and wave-lab experiments read in the same shape (not rewritten) | **Done** |
| 8.6 | Pathways (`#/relations?tab=pathways`): five curated walks along existing sourced registry edges, each stop with its incoming relationship (context, source) and its encyclopedia excerpt | **Done** |

## Phase 9 gates

Approved by the user on 2026-11-27 (“you have my approval to go ahead with phase nine”). Re-assessed before starting: every model below has an open, citable source that was read; data that could not be sourced openly is listed as *not bundled* instead of being invented. New Spectral views go into two chip menus (Radio ▾, Sound ▾) so the top bar does not overflow.

| Gate | Deliverable | Main sources | Status |
|---|---|---|---|
| 9.1 | EM fields & antennas (`#/spectral/antennas`): exact Hertzian-dipole fields (near and far zones, E from Ampère's law) as a FIELDS layer; far-field patterns of the electrically short and half-wave dipoles and of a thin filament with any current; directivity, radiation resistance and effective aperture by numerical integration, checked against the textbook values (1.5, 1.64, 20π²(L/λ)², ≈ 73 Ω, 0.119λ², 0.131λ²); uniform linear arrays by superposition (steering, grating lobes); polar and 3D patterns; Friis link calculator checked against the textbook example | Ellingson, *Electromagnetics* Vol. 2 (VT Publishing 2020, CC BY-SA 4.0); CODATA | **Done** |
| 9.2 | RF/wireless atlas (`#/spectral/rf`): real allocations and system frequencies from public primary documents (U.S. 47 CFR, GPS interface specifications, NASA DSN) on the ITU band axis, with λ, λ/2 dipole length and free-space path loss; a deep-space link budget (Voyager X-band) through the Friis equation compared with the published received power | eCFR (public domain), gps.gov IS-GPS-200N/705J, NASA JPL DESCANSO (Ludwig & Taylor 2002) | **Done** |
| 9.3 | 3D communications room (`#/spectral/room`): a rectangular room with a dipole transmitter; received power on a plane by the image method (up to N reflections) with Fresnel reflection coefficients of cited building materials; multipath fading against free space; probe and recorder | ITU-R P.2040-4 (Table 3, eqs. 37, 43); Ellingson Vol. 2 (dipoles, eqs. 10.113–10.114) | **Done** |
| 9.4 | Modulation lab (`#/spectral/modulation`): AM, FM (Bessel sidebands J_n(β), 99 % power bandwidth), BPSK and FSK in additive white Gaussian noise with the correlation receiver; measured bit-error rate against theory; Shannon capacity; spectra by FFT. QAM, Carson's rule and Shannon's original paper were dropped: no open source read for them (Johnson covers BPSK/FSK and capacity) | Johnson, *Fundamentals of Electrical Engineering I* (Rice/Connexions, CC BY 1.0); 47 CFR §73.310; NIST DLMF | **Done** |
| 9.5 | Acoustic lab (`#/spectral/acoustics`): intensity and sound level (dB), point-source spreading, acoustic impedance Z = ρc from the NIST fluid data, reflection and transmission between media, Doppler shift and Mach cone | Rayleigh, *Theory of Sound* (1894, 1896); NASA Glenn; NIOSH 98-126; Homick (NASA RP-1045); NIST WebBook (OpenStax replaced 2026-11-27) | **Done** |
| 9.6 | Audio synthesis & FFT (`#/spectral/audio`): Web Audio playback (also in the Wave lab), Fourier-series synthesis of square/sawtooth/triangle waves, FFT with window functions, spectrogram, sampling and aliasing; optional microphone analysis (local only) | Johnson (§4.3 Fourier series, §5.3 sampling, §§5.9–5.10 FFT and spectrograms); Web Audio | **Done** |
| 9.7 | Room acoustics & resonance (`#/spectral/roomacoustics`): rectangular-room modes, Sabine reverberation time with Sabine's measured absorption coefficients, a 2D finite-difference pressure solver checked against the analytic modes; a link carries the room's size to the radio room of Gate 9.3. Eyring's formula (paywalled) and the Helmholtz resonator (equations not yet checked on the scans) were left out | Rayleigh, *Theory of Sound* Vol. II (1896, public domain); Sabine, *Collected Papers on Acoustics* (1922, public domain) | **Done** |

## Phase 10 gates

Approved by the user on 2026-11-27 (“approve phase 10”). Re-assessed before starting: the open textbooks first considered are unusable (OpenStax forbids AI ingestion; Peatross & Ware's *Physics of Light and Optics* is all rights reserved), so the phase rests on public-domain classics read on their page images and on U.S. government sources. New views go into a **Light ▾** chip menu, which also holds Compare spectra, so the top bar keeps its width.

| Gate | Deliverable | Main sources | Status |
|---|---|---|---|
| 10.1 | Geometric optics (`#/spectral/optics`): reflection, refraction and total reflection between dataset materials at any wavelength; exact 2-D ray traces through spherical lenses (spherical and chromatic aberration against the thin-lens formulas), concave mirrors and prisms (deviation, minimum deviation, dispersion) | Drude, *Theory of Optics* (1902); Southall, *Geometrical Optics* (1910); materials n(λ) | **Done** |
| 10.2 | Wave optics (`#/spectral/waveoptics`): two-source interference with the exact path difference, single slit, m-slit grating and its resolving power on the NIST sodium and mercury doublets, thin-film minima with dispersive n(λ) | Drude Pt II Sec I chs. II–IV; Huygens, *Treatise on Light* (tr. 1912); NIST ASD | **Done** |
| 10.3 | Polarisation and optical materials (`#/spectral/polarisation`): Fresnel s and p reflectance of dataset materials from air and from inside, the polarizing angle, cos² α after two reflections at that angle, uniaxial crystals (calcite, quartz, sapphire, rutile) with ordinary and extraordinary dispersion and quarter-wave plates | Drude Pt II (eqs. 24–25, 35, 74; p. 246); refractiveindex.info (Ghosh 1999, Malitson & Dodge 1972, DeVore 1951) | **Done** |
| 10.4 | Spectroscopy (`#/spectral/spectroscopy`): hydrogen-like series (H, D, He⁺) against NIST lines with the isotope shift, Doppler and Lorentzian line widths, diatomic vibrational levels and rotation lines from Huber–Herzberg constants (new dataset of six molecules). P/R branches left out (no open source) | Bohr (1913); NIST Atomic Spectroscopy Compendium (eqs. 1, 2, 10, 30, 40); NIST Diatomic Spectral Database; NIST WebBook | **Done** |
| 10.5 | Thermal radiation and energy balance (`#/spectral/thermal`): Planck curves with Wien and Stefan–Boltzmann (σT⁴ checked by integration), grey bodies and radiative exchange by Kirchhoff's law, radiative equilibrium of ten bodies against the NSSDCA black-body temperatures (new dataset). Conduction and convection left out (no open source read) | Planck, *Theory of Heat Radiation* (tr. 1914); NASA Earth Observatory; NSSDCA fact sheets | **Done** |
| 10.6 | Telescopes (`#/spectral/telescopes`): Airy's pattern computed from his integral against his 1835 table, two stars and Rayleigh's criterion, focal length, plate scale and diffraction limits of Hubble and JWST | Airy (1835); Rayleigh, *Scientific Papers* I (Arts. 62, 67); STScI HST Primer and JWST JDox | **Done** |
| 10.7 | Atmospheric radiation and remote sensing (`#/spectral/atmosphere`): λ⁻⁴ scattering of sunlight, Rayleigh's 1899 molecular extinction reproduced (83 km), air mass and Bouguer's law, Landsat 8–9 bands over reflected and emitted spectra | Rayleigh 1871, 1899; NASA TM-82021; NASA AERONET; USGS | **Done** |
| 10.8 | Universe map (`#/cosmic/map`), requested by the user after Phase 10: one Sun-centred 3D map zooming from the planets through the nearest stars, the Milky Way (disc model), the Local Group and the SPARC galaxies to the last-scattering surface; new dataset of SIMBAD positions and McConnachie's Local Group catalogue | JPL; CNS5; SIMBAD; McConnachie (2012); SPARC; Bland-Hawthorn & Gerhard (2016); Planck 2018 | **Done** |


## Phase 11 gates

Approved by the user on 2026-11-28 together with Phases 12–14 (“continue through the remaining phases … don't stop to publish until phase 14 is completely done”). Re-assessed before starting (research notes: `research/SOURCE_NOTES_PHASE11.md`). Sources found closed to this project: **PubChem now disallows ClaudeBot in robots.txt** (version 2026-10-29; the molecules bundled earlier stay, no new PubChem requests; ChEBI is used instead), BioNumbers' book site, Europe PMC, the Biodiversity Heritage Library and jbc.org (robots.txt), CDC, NIAID and rupress.org (robots.txt answered 403), and nobelprize.org (terms of use).

| Gate | Deliverable | Main sources | Status |
|---|---|---|---|
| 11.1 | Biologic Mode (`#/biologic`, emerald) with a live landing portal (the 1BNA B-DNA dodecamer), and the **scale of life**: 24 sizes from a water molecule to an ant on one log axis with verbatim quotes, disagreeing sources side by side and size ratios; Nanostructures and Microscopic levels of the scale ladder now route here; PDB structures ingested (7 entries) | NIGMS *Inside the Cell* (2005) pp. 7, 11, 20; NIGMS Biomedical Beat; nano.gov; U.S. DOE *Scale of Things*; PDB-101; wwPDB (CC0) | **Done** |
| 11.2 | Biomolecules (`#/biologic/molecules`): the 20 amino acids with IUPAC-IUB symbols, codons and 3D conformers; nucleic-acid parts, sugars and lipids with ChEBI descriptions; the **genetic code** (NCBI standard and vertebrate mitochondrial tables) with a three-frame, two-strand translator | NCBI *The Genetic Codes* (2024); IUPAC-IUB (1984) Table 5; NHGRI Talking Glossary; ChEBI | **Done** |
| 11.3 | Protein and DNA structures (`#/biologic/proteins`): seven PDB crystal structures (B-DNA, two myoglobins, haemoglobin, insulin, GFP, lysozyme) drawn from their coordinates as backbone tubes coloured by the files' helix/strand records or by chain, or as all atoms; ligands always shown; metadata, primary citation, SEQRES sequences, principal-axis size and radius of gyration | wwPDB (CC0); the seven primary papers (DOIs checked on Crossref) | **Done** |
| 11.4 | Cells (`#/biologic/cells`): a eukaryotic and a prokaryotic cell at one scale (diameters limited to the quoted ranges; nucleus, mitochondria, lysosomes to scale; layout schematic) with clickable parts and their definitions, the eukaryote/prokaryote table and volume shares; size and surface of a sphere (A/V = 6/d) with quoted cell sizes | NIGMS *Inside the Cell* pp. 7, 8, 11, 20, 33; NIGMS Glossary; NHGRI Talking Glossary | **Done** |
| 11.5 | Membranes (`#/biologic/membranes`): the squid giant axon after Hodgkin & Katz (1949): equation (4) with their concentrations, permeability presets for resting, active and refractory nerve, single-ion limits, and Table 7 recomputed beside the printed values (all 27 within 1 mV for 14.6–21.5 °C); the lipid bilayer from NIGMS (schematic). No mammalian ion concentrations (none found in an allowed source) | Hodgkin & Katz (1949) pp. 66–67 (page images); NIGMS Biomedical Beat | **Done** |
| 11.6 | Transport and biochemistry (`#/biologic/transport`): diffusion times x²/2D for six sugars of the International Critical Tables, a Fick solver beside random walkers; van 't Hoff's osmotic pressure; Michaelis–Menten kinetics with k from their Fig. 4a. ATP yield per glucose left out (no allowed open source) | Fick (1855); Einstein (1905, tr. 1926); van 't Hoff (1887); Michaelis & Menten (1913); ICT V (1929) — all on page images | **Done** |
| 11.7 | Plants and microorganisms (`#/biologic/plants`): NASA's photosynthesis equation (×6 = the curated net reaction), chlorophyll a and b absorption maxima over a 5772 K model of sunlight with photon energies; viruses, bacteria and plant cells on one log axis with NIGMS and NHGRI definitions. Full chlorophyll spectra not bundled (no licence stated) | NASA Earth Observatory (2011); OMLC/PhotochemCAD; NIGMS and NHGRI glossaries; PDB-101; *Inside the Cell* | **Done** |

## Phase 12 gates

Started 2026-11-28 as part of the approved run through Phase 14. Research notes: `research/SOURCE_NOTES_PHASE12.md`. Found usable: BodyParts3D (CC BY 4.0 since 2025-02-27), NCI SEER Training Modules (text free of copyright), NHLBI (public domain; its images are © Nucleus Medical Media and not used), NIDDK, Hodgkin & Huxley (1952) and Hill (1938) and Poiseuille (1840) on page images. Closed: ninds.nih.gov and nih.gov (robots 403), gallica.bnf.fr (bot wall).

| Gate | Deliverable | Main sources | Status |
|---|---|---|---|
| 12.1 | Human body (`#/biologic/body`): skeleton (202 bone files) and ten organs in 3D from BodyParts3D 4.0, decimated in Blender to ~140 000 triangles (3.2 MB, lazy-loaded); select, hide, isolate (the camera frames the organ); quoted facts and the model's own sizes and volumes from the full-resolution files; the ten organ systems | BodyParts3D 4.0 (DBCLS, CC BY 4.0); NCI SEER; NHLBI; NIDDK | **Done** |
| 12.2 | Movement (`#/biologic/movement`): SEER's bones (206 = 80 axial + 126 appendicular; four bone types) and muscle types; Hill's force–velocity hyperbola and power curve for frog sartorius at 0 °C. No quantitative lever model (no open source for joint geometry) | NCI SEER; Hill (1938) pp. 160–161 (page images) | **Done** |
| 12.3 | Circulation and breathing (`#/biologic/circulation`): NHLBI's path of blood and valves; SEER's cycle (0.8 s) and output (5 L/min) with the implied stroke volume; NHLBI's adult blood-pressure categories as printed; Poiseuille's Q = k″PD⁴/L with his seven tubes; where the blood is; alveoli and breathing rate | NHLBI; NCI SEER; Poiseuille (1840) p. 1046 (page image) | **Done** |
| 12.4 | Nerves (`#/biologic/nerves`): the Hodgkin–Huxley (1952) membrane action potential integrated live (RK4) from their equations and Table 3 — stimulus, temperature (Q10 = 3), ḡ_Na, ḡ_K; gates and currents; threshold; eq. (34) conduction velocity (18·8 calculated vs 21·2 m/s measured) and Hursh's 6.0 m/s per µm (cat); neurons, myelin and neuron count | Hodgkin & Huxley (1952) pp. 505–528 (page images); Hursh (1939) p. 136; Azevedo et al. (2009); NCI SEER; NIGMS | **Done** |
| 12.5–12.6 | Organ systems (`#/biologic/systems`): kidneys (NIDDK's two filtration figures converted with NIST SP 811 and compared; urine share; GFR statements), digestion (links into the biomolecules), hormones, blood and lymph, skin, reproduction — quoted facts with derived arithmetic labelled. No hormone half-lives, blood-cell counts or transit times (none found in an allowed source) | NIDDK; NCI SEER; NIST SP 811 | **Done** |
| 12.7 | From the body to a molecule (`#/biologic/zoom`): one zoom through about ten powers of ten — BodyParts3D body, kidney, cell, nucleus, mitochondrion and ribosome beside it, DNA, water — every stop at its quoted size; the scale ladder's Human level now routes to the body | BodyParts3D; NCI SEER; *Inside the Cell*; NIGMS; PubChem3D | **Done** |

If a gate turns out much larger than planned, it is split into documented sub-gates. Scientific quality is not reduced to make it fit.
