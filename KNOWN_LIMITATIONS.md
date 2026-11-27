# Known limitations and bugs (Phase 1)

## Scientific
* **Multi-electron atoms** use hydrogenic orbitals with Slater Z_eff — qualitative only (no Hartree–Fock/DFT, no relativistic effects for heavy elements, principal n instead of Slater n*). Labelled in the UI.
* **Spectra:** measured NIST lines are bundled for 33 spectra only (200–1000 nm, strongest 150 + forbidden lines each); other elements/ions show a NIST link instead. Relative intensities are source-dependent. No line profiles, Doppler/pressure broadening or temperature-dependent populations yet.
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

* **Sandbox:** point-mass Newtonian gravity only (no tides, spin, GR, radiation pressure); fixed-step integrators (very close encounters need a smaller step — the energy plot reveals it); inelastic merging is the only collision model; O(N²) forces on the main thread (fine for tens of bodies).

* **Molecular dynamics:** single molecules in vacuum (no solvent, no periodic boxes, no intermolecular forces yet); qualitative VGFF-1 force constants; Berendsen thermostat; bonds drawn as single cylinders in dynamics mode.

* **Notebook:** stored per browser only (no accounts, sync or sharing yet); laboratory structures are saved to the molecule library rather than as notebook experiments; electric/magnetic field instruments await the electromagnetic module.

## Visual / UX
* **Phones (≤ 900 px):** the left (controls) panel is a bottom sheet at 40 % height and the right (details) panel opens over it from a floating button; both cannot be seen at once. Collapsed panels shrink to their header.
* Planets use flat colours and illustrative banding (no imagery/textures yet). No starfield background — catalog stars arrive with Gaia in Phase 5.
* Saturn's rings are uniform-opacity annuli per ring (no radial optical-depth profile); no Uranian/Neptunian rings.
* With true scale (default) most bodies are sub-pixel in the overview; labels mark them. Moon labels are decluttered by apparent separation.
* Mobile: the element diagrams open via a "Diagrams" button; cosmic scene options are reduced.
* Wireframe molecule mode creates line objects per render (fine for ≤ 100 atoms; to be memoised for large structures).

## Engineering
* Ingestion tools are TypeScript, not Python (no Python interpreter in the build environment); RDKit/Astropy-based tooling is deferred to Phase 2 with an optional backend.
* No git repository was initialised: the machine has no git (Xcode Command Line Tools not installed). Run `xcode-select --install`, then `git init`.
* Settings and timeline bookmarks use localStorage; experiments, molecule library and API cache use IndexedDB.
* Headless screenshots use SwiftShader software WebGL; real-GPU frame rates are not measured in this report.
* Cosmic labels live in a DOM overlay above the canvas; wheel events over labels are forwarded to the canvas so zoom still works.
* drei `<Html>` caused "removeChild" errors on canvas teardown under React 19 and was replaced by `src/rendering/labels.tsx`; avoid reintroducing it.
* Console shows a `THREE.Clock` deprecation warning originating inside @react-three/fiber (harmless).

## Phase 4
* **Reactions:** the library holds 52 curated equations. Balancing proves conservation only. Voyager predicts no products, kinetics or mechanisms. Equations not in the library are shown as *not verified*. The solver ignores the coefficients the user typed for photons and third bodies (always 1). Net biological equations hide their pathways (stated in each record). Surface catalysts (dust grains, Fe, V₂O₅, Pt–Rh) are given as conditions, not as species.
* **Thermochemistry:** standard states only (no activities or concentrations, no non-ideal solutions). ΔrCp° = 0, so values are approximate far from 298.15 K, and phase changes inside a T sweep are not modelled. 167 species are covered. Aqueous transition-metal ions, Ba²⁺/BaSO₄, CaCO₃, Fe₂O₃, H₂SO₄(l), ATP/ADP and interstellar ions have no bundled values, so those reactions show ΔrH° as *unknown*. Ethane and propane lack an S°. Combined uncertainties treat correlated CODATA values as independent. No kinetics or activation energies.
* **Crystals:** 10 hand-transcribed structures (no automated crystallographic database, because COD and AMCSD forbid automated access). There are no graphite, ice, quartz or perovskite cells yet; quartz and graphite have property data but no cell. NBS lattice constants date from the 1950s at 25–26 °C (precision ≈ 10⁻⁴ Å); there is no thermal expansion. Bragg intensities are not modelled, only positions and absences. Packing fractions are computed for single-element structures only.
* **Material properties:** coverage is partial and condition-specific. Refractive indices are room-temperature formulas (no T dependence, ordinary ray only for birefringent crystals, no absorption k). Fluids are at 1 atm only. Solids have no sourced sound speed, thermal conductivity or emissivity yet, so they show as *unknown*. Copper resistivity is the IACS defined value, not a sample measurement.
* **Phase diagrams:** water and CO₂ only. The CO₂ melting curve is not bundled, and its sublimation curve is limited to 154–196 K, leaving a 196–216.6 K gap. Boundaries between ice polymorphs below 251 K are not drawn. Coexistence properties are interpolated from 600-row tables. There are no metastable states (supercooling, superheating) and no mixtures.
* **Lennard-Jones fluid:** 256 atoms, a truncated and shifted potential, a Berendsen thermostat (not canonical), O(N²) forces on the main thread, no long-range corrections. Qualitative states only. Hydrogen bonds and dipoles are not modelled.
* **Spectral atlas:**
  * ISO 20473 band edges are not shown. The standard is sold by ISO, iso.org blocks automated access, and values are not copied from secondary sources.
  * ISO 21348 values come from the summary table published by Space Environment Technologies (2016 archived copy), not the full ISO text. Its microwave letter bands are not bundled.
  * The plane wave is the vacuum solution only: no dispersion, absorption or sources.
  * The blackbody is an ideal model, not the observed solar spectrum. Displayed spectral colours are approximate sRGB.
  * Radio and X-ray examples are limited to verified sources. The 21 cm hydrogen line and Cu Kα were dropped because their primary papers are paywalled.
  * NIST lines cover 200–1000 nm only.
* **Wave laboratory:** linear waves only (no shocks, no nonlinear steepening). Analytic 2D two-source patterns ignore spreading and absorption. The finite-difference solver is 1D only. Attenuation α is illustrative and user-chosen. Fluid sound speeds are at 1 atm. There is no elastic-solid medium (P/S waves) because no cited solid sound speeds are bundled yet. The 3D view exaggerates displacement (stated); the plots show true values. Audio playback is Phase 9 (Gate 9.6).
* **FIELDS:** four layers only, all analytic. The gravity map is softened near each body and Newtonian. Coulomb charges are ideal points in vacuum (no dielectrics, no conductors, no magnetostatics yet). The plane wave is infinite and unbounded. Heat diffusion ignores convection, which dominates quickly in real fluids, and holds k, ρ and cₚ fixed at T₀; only the six NIST fluids at 1 atm have thermal data (solids show no temperature layer). Layers of different frames (lab metres vs au) cannot be drawn together.
* **Cross-mode links:** three relationship families (element ↔ spectrum, Sun ↔ Planck model, material ↔ optical/acoustic). Other stars, absorption spectra of molecules and solids, and real solar irradiance are not linked yet.
* **Landing page:** CELLULAR is a disabled placeholder until Biologic Mode (Phase 11).

## Phase 5
* **Nearby stars (Gate 5.1):**
  * Positions are at each catalogue epoch (J2016.0 for Gaia, J2000.0 or J1991.25 for others). Stellar motion over time is not propagated yet.
  * Within 10 pc the census is the published one: some cool brown dwarfs are certainly still missing (Reylé et al. 2021).
  * CNS5 between 10 and 20 pc is shown as points only (no spectral types). Objects near 20 pc may scatter across the boundary within their errors.
  * Stars too bright for Gaia (α Cen A/B and others) have no measured G in the 10 pc catalogue. Where CNS5 has a resolved Hipparcos-converted G it is shown; unresolved pairs are not split.
  * Spectral-type calibrations assume luminosity class V. Subgiants such as δ Eri or β Hyi get dwarf values (stated in the panel). White dwarfs and subdwarfs are not calibrated.
  * Point colours and sizes are illustrative.
  * Data were fetched from the CDS mirror at Harvard CfA while CDS Strasbourg was offline. The content is the same VizieR catalogue.
* **HR diagrams (Gate 5.2):**
  * T_eff on the theoretical diagram is the class V mean for each spectral type, not a measured temperature. Stars therefore line up in vertical stripes at each subtype.
  * L assumes the mean bolometric correction of the type. Unresolved binaries sit up to 0.75 dex too high (flagged when |ΔM| > 1.5 mag).
  * White dwarfs and most brown dwarfs (no G or V, or no calibration) appear only on the colour–magnitude diagram, or not at all.
  * Hipparcos-converted G in CNS5 can be off for the brightest stars (Sirius A +0.39 mag versus V + G−V); it is flagged, not corrected.
  * No evolutionary tracks or isochrones yet.
* **Exoplanets (Gate 5.3):**
  * Elements are exoplanet.eu's compilation, so the values for one planet can come from different papers. Per-field references are on the linked exoplanet.eu page, not bundled.
  * The NASA Exoplanet Archive was not used: its robots.txt disallows Anthropic agents by name.
  * Orbits are face-on schematics with no sky orientation (Ω is not bundled). Planet positions along their orbits are not computed: periastron times are missing or invalid for about half of the planets.
  * Three catalogued planets have no elements. Planets announced after the catalogue's 2023 update are not included.
  * No habitable-zone model yet.
* **Stellar spectra (Gate 5.4):**
  * Each star's spectrum is a single Planck curve at a class-mean temperature. There are no observed stellar spectra, line strengths or molecular bands.
  * Class → line links are qualitative (where each family of lines peaks), with Ca and Fe standing in for the metals.
  * Star links appear only after the catalogue has loaded in the session, or when the atlas is opened from a star.
* **Cross-links (Gate 5.5):** stars appear in universal search only after the first query has loaded the 10 pc catalogue (about 70 kB gzipped), so the very first keystroke may show them a moment later. The Sun is the only star with a composition. Other stars have no metallicities or abundances bundled.

## Phase 6

* **Relativity (Gate 6.1):**
  * Schwarzschild only: no spin (Kerr), charge, or cosmological constant. Real astrophysical black holes rotate, which moves the ISCO and photon orbits.
  * Light paths are drawn in the equatorial plane of a static hole; no ray-traced image, accretion disc, Doppler beaming or lensed background is rendered.
  * Weak-field checks compare with figures quoted in textbooks (Carroll's 43″ per century; Narayan & Bartelmann's 1.″7). No measurement papers for these tests are bundled. A GPS clock check was planned but not added: the review it would cite (Ashby 2003, Living Reviews in Relativity) is served behind a bot wall.
  * The Earth clock figure ignores Earth's rotation and the Sun's potential.
* **Compact objects (Gate 6.2):**
  * Only 4 of the 21 white dwarfs within 10 pc have a bundled mass (dynamical or lensing). The others show mass "unknown"; spectroscopic masses were not added.
  * All derived quantities assume non-rotating objects. The millisecond pulsars are oblate, and the black holes spin (GW150914 remnant a ≈ 0.67), so their ISCO and horizon differ from the values shown.
  * Neutron-star radii differ between analyses of the same data. Only Miller et al. (2021) is bundled for J0740+6620.
  * The EHT ring is not the shadow: emission, spin and resolution change its size by factors of order unity. The comparison is shown as a check, not as a test of general relativity.
  * Values are transcribed by hand; uncertainties keep each paper's interval type (1σ, 68 % or 90 %), so they are not directly comparable.
* **Lensing (Gate 6.3):**
  * Point lenses only: no binary lenses or caustics, no extended mass distributions (galaxies, clusters) and no finite-source effects in the light curves.
  * The galaxy-scale preset is a point mass at an effective distance, following Narayan & Bartelmann's order-of-magnitude example. It is not a model of a real lens system, and no observed strong-lens system is bundled.
  * The lens-plane brightness and colour are illustrative. Only the image geometry is computed.
* **Navigation:** the Cosmic chips are grouped into *Stars ▾* (Nearby stars, HR diagram, Exoplanets), *Gravity ▾* (Relativity, Black holes, Lensing) and, from Gate 7.1, *Universe ▾*. Below 1500 px the Encyclopedia, Sources, Notebook and Scale buttons show icons only in Cosmic and Atomic, so the top bar fits at 1440 px; the active menu shows its section in a tooltip, not in the chip.
* **Galaxies (Gate 6.4):**
  * The NFW fit holds Υ fixed and uses SPARC's random errors only (no inclination or distance systematics). V₂₀₀, c and Υ are degenerate, so the fitted halo parameters are indicative only. No other halo profiles (Burkert, pseudo-isothermal, Einasto) and no MOND/RAR comparison yet (planned for Phase 14.6).
  * H₀ = 73 km/s/Mpc is used for r₂₀₀ for consistency with the SPARC distances. Other H₀ values shift M₂₀₀.
  * Five rotation-curve reference keys used in SPARC Table 1 (Ba06, Bm05, Fr02, VB99, VdH93) have no entry in the table's own legend. They are shown as keys only.
  * The Milky Way has no baryonic mass model bundled. The stars-only Keplerian curve is an illustrative lower bound, not a fit. Bland-Hawthorn & Gerhard (R₀ = 8.2 kpc) and Eilers et al. (8.122 kpc) assume slightly different R₀.
  * No galaxy images or 3D galaxy models.
* **Nebulae and gallery (Gate 6.5):**
  * Seven images only, at 700 px. There is no zoom into the full-resolution originals (linked on the publisher pages) and no image search. The NASA Image Library and MAST were not used.
  * The distances of the Crab, Eagle and NGC 3324 are the approximate figures printed on the ESA image pages, not peer-reviewed measurements. Published distances for the Ring Nebula differ (≈2000 ly in OpenStax, 2500 ly at ESA/Hubble).
  * Emission-line links exist only where a source names the emission: Orion → Hα, Ring → [N II] and [O III]. The Crab's synchrotron emission and Webb's molecular-hydrogen filters have no bundled spectra. [S II] is not in the NIST bundle.
  * The Crab pulsar is not a compact-object record (no published mass bundled).

## Phase 7
* **Expansion and distances (Gate 7.1):**
  * Homogeneous FLRW background only: no perturbations, structure, peculiar velocities or inhomogeneous lensing distances.
  * Dark energy is a cosmological constant. No w ≠ −1 or evolving dark energy, and no model fits to supernova or BAO data (the distance ladder is Gate 7.2).
  * Radiation is massless at all redshifts, and Planck's 0.06 eV neutrino is treated as matter at all redshifts. Ω_r is inferred from Planck's z_eq, not tabulated by Planck. Effects are at the 0.1 % level for z ≳ 100 and negligible below.
  * Planck parameters are the TT,TE,EE+lowE+lensing+BAO column only. They depend on base ΛCDM and are not a direct measurement of H₀; the H₀ tension with local distance-ladder values is shown in the Distance ladder view (Gate 7.2).
  * The distance modulus is bolometric: no k-corrections or extinction.
  * Hogg's lensing distance (eq. 19) is invalid for closed models, so it is not shown for them. The cosmological lens is a point mass; no observed strong-lens system is bundled.
  * Custom models keep Planck's radiation density whatever H₀ is chosen.
* **Distance ladder (Gate 7.2):**
  * The published relations are applied to user inputs. Nothing is refitted: no extinction, crowding, metallicity-gradient or covariance modelling. The SH0ES global fit (Cepheids, SNe and their covariances together) is not reproduced; the simple weighted mean of the 42 calibrator M⁰_B,i is shown next to the published M⁰_B and differs from it by 0.013 mag.
  * The 277 Hubble-flow SNe Ia (Pantheon+) are not bundled; only the fitted intercept a_B is. The Hubble-flow curves are ΛCDM predictions with Planck’s Ω; SH0ES use q₀ = −0.55 instead. TRGB host distances (CCHP) are not bundled; only the zero-point table is.
  * The papers write “±” without a probability level, so those intervals are read as 1σ and labelled “1σ (implied)”. Planck intervals are 68 % as stated.
  * The tension column (Δ/σ) assumes independent Gaussian errors and ignores shared systematics. It is labelled derived; each team’s own statement is quoted beside it.
  * CCHP 2025 has an erratum (ApJ 993, 252) whose content was not read, because iopscience.iop.org’s robots.txt disallows automated agents. The value is flagged in the view.
  * The Milky Way Cepheid anchor is represented only by its mean parallax (650 µas); the individual Gaia parallaxes are not bundled.
* **Cosmic microwave background (Gate 7.3):**
  * FIRAS: only the diagonal 1σ errors are bundled; correlations between frequencies are not. The errors exclude the absolute temperature scale, so χ² against T₀ = 2.72548 K is large (≈ 4000) although that value agrees with FIRAS within its quoted uncertainty; the view explains this. The intensities are rebuilt from the Table 4 residuals about 2.725 K with CODATA 2018 constants; LAMBDA’s own column (CODATA 1986 constants) differs by up to 7.6 kJy/sr.
  * The μ and y limits are quoted, not refitted, and the Galaxy model is shown but not fitted.
  * T(z) is measured only to z = 2.69 in the bundle (atomic-carbon, S-Z and higher-z measurements are not bundled). Noterdaeme et al. attach no probability level to Table 1, so it is read as 1σ (implied). The full-history curve and the 2973 K at last scattering are extrapolations of T₀(1 + z).
  * The power spectrum is TT only (no TE, EE or lensing), with diagonal errors; the covariance matrix is not bundled. The best-fit curve is Planck’s (TT,TE,EE+lowl+lowE+lensing, without BAO), so its parameters differ slightly from the Table 2 column used elsewhere. No spectrum is computed here (no Boltzmann code), and the peaks are local maxima of the thinned curve (± 2 in ℓ).
  * Planck data are CC BY-NC 3.0 IGO: non-commercial use only without ESA’s authorisation.
  * No CMB sky map image is shown (licence not checked).
* **Dark-matter evidence (Gate 7.4):**
  * Newtonian gravity throughout. The visible-matter column is what stars and gas would do under Newton’s law; modified gravity (MOND, the radial acceleration relation) is not modelled or fitted (planned for Phase 14.6). Nothing here identifies what dark matter is.
  * SPARC accelerations use random errors only (no distance or inclination systematics) and fixed Υ; V²R/G is the spherical approximation.
  * Bullet Cluster: only Table 2 (four 100 kpc apertures) and the quoted peak offsets are bundled; no κ map or X-ray image. The main-cluster κ peak is not drawn (its offset is given from two BCGs and Table 2 does not say which it lists). Stellar masses scale with the assumed M/L_I and are upper limits (no colour selection). The masses assume Clowe et al.’s cosmology (H₀ = 70, Ω_m = 0.3); ratios do not depend on it.
  * Coma: the mass model is Łokas & Mamon’s, recomputed from their equations; the measured velocity-dispersion and kurtosis profiles are published only as figures and are not bundled, so the σ_los curves are model predictions without data points. The model assumes spherical symmetry, equilibrium and constant anisotropy; Coma has substructure. M/L_B recomputes to 361 against the printed ≈ 351 (3 %). Gas parameters (Briel et al. 1992) are as quoted in the paper, not read from the original.
  * Cosmic census: Ω_c h² is a base-ΛCDM parameter fitted to the CMB, not a direct measurement; no visible-matter-only CMB spectrum is computed (no Boltzmann solver). BBN values are Cooke et al.’s, not recomputed; their stated 2σ agreement is with Planck 2015, and against Planck 2018 the same gap is 3.3σ (independent Gaussian errors).
  * Galaxy-cluster gas fractions from X-ray samples, the Zwicky (1937) analysis and weak-lensing masses of other clusters are not bundled.
* **Gravitational waves (Gate 7.5):**
  * Catalog values are the GWOSC medians with 90 % intervals. No posterior samples are bundled, so nothing is refitted and combinations of medians (𝓜 from median m₁ and m₂, M − M_f as radiated energy, detector-frame masses) are approximate. Correlations between parameters (e.g. distance and inclination) are lost.
  * 109 of 391 events have no parameters in the event API and show as unknown. GWOSC’s network SNR is not always the catalog paper’s (GW250114_082203: 78.6 vs 76.9 in GWTC-5.0 Table 3); it is labelled as GWOSC’s. GW240420_175625 lacks χ_eff in the API (the paper prints 0.00 +0.23 −0.25). GW170817 keeps its GWTC-1 values, with the remnant mass only as an upper bound and the host-galaxy redshift.
  * Marginal candidates, sky localisations, strain data, detector noise curves and population (rate) results are not bundled; FAR and p_astro are single values chosen by GWOSC across pipelines.
  * The chirp model is leading order (Newtonian orbit + quadrupole formula): circular, non-spinning point masses, no merger or ringdown, no higher harmonics, no detector response. Near the ISCO (x = 1/6, v/c ≈ 0.41) it is only a rough guide; the ISCO frequency is the test-particle Schwarzschild value. The strain is for an observer on the orbital axis, the largest any orientation gives.
  * GW170817: the speed bound uses the paper’s relation with a user-chosen emission lag; Lorentz-violation and Shapiro-delay tests are not reproduced. The standard-siren H₀ is the published posterior; the simple ratio v_H/d is shown only for comparison. The 2017 comparison values (Planck 2015, SH0ES 2016) are as quoted in that paper; later siren measurements are not bundled.
  * The GWTC-5.0 papers are arXiv preprints (2026); values may change on publication.

## Encyclopedia (Gate E.1)
* Only radiation is covered (8 NASA entries). Elements, molecules and celestial objects are listed as *coming soon*.
* The text is quoted as NASA published it in 2010 and is not edited. Some figures are rounded or differ from the bundled standards. NASA's visible range is "380 to 700 nanometers"; the CIE says the visible range has no precise limits, and ISO 21348 uses 380–760 nm. NASA's solar surface temperature is "5,500°C".
* Conventions differ on where microwaves begin. NASA calls 12 cm oven waves microwaves, but ISO 21348's microwave category is 1–15 mm, so the atlas shows the *Radio waves* entry at 12 cm (with a See also link to Microwaves). Matching uses only the bundled conventions (ISO 21348 categories and ITU-R V.431 bands up to EHF); the excerpts never set band limits.
* Sentences that refer to pictures on the NASA pages are omitted, because the pictures are not reproduced.
* The About section appears in the Spectral atlas only. The element view's spectrum and the stellar classes do not show it yet.
* On phones the top bar folds Encyclopedia, Sources, Notebook, Scale and Settings into a ☰ menu, and search is an icon that expands when tapped.

