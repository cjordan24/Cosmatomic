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
* **Navigation:** the Cosmic chips are grouped into *Stars ▾* (Nearby stars, HR diagram, Exoplanets) and *Gravity ▾* (Relativity, Black holes, Lensing) so the top bar fits at 1440 px.
