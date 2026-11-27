/**
 * Curated dark-matter evidence (Phase 7, Gate 7.4) → datasets/astronomical/dark-matter.json
 *
 *   node --experimental-strip-types scripts/ingestion/curated-dark-matter.ts
 *
 * Transcribed by hand from the arXiv PDF text (read with PDFKit) of:
 *  - Clowe, D. et al. (2006) ApJ 648, L109 (arXiv:astro-ph/0608407v1, “ApJ Letters in press”):
 *    Table 2 (masses and mean κ in 100 kpc apertures of the Bullet Cluster 1E0657−558), §1–§3 text.
 *  - Łokas, E. L. & Mamon, G. A. (2003) MNRAS 343, 401 (arXiv:astro-ph/0302461v2): the mass model of
 *    the Coma cluster — eqs. 1–2 (stars), 3–5 (gas, from Briel, Henry & Böhringer 1992), 6–12 (dark
 *    matter), Table 1 (best fits of the velocity dispersion and kurtosis profiles), §5–§6 results.
 *  - Cooke, R. J., Pettini, M. & Steidel, C. C. (2018) ApJ 855, 102 (arXiv:1710.11129v3): primordial
 *    D/H (eqs. 9–10), η₁₀ (eq. 11) and the BBN baryon density (eqs. 12 and 14).
 *
 * Nothing here is fitted or digitised from a figure. Coma's measured velocity-dispersion profile is
 * published only as a figure (Łokas & Mamon Figs. 3 and 6), so it is NOT bundled.
 */
import { writeDataset } from './lib/ingest.ts';

const IMPLIED = '1σ (implied: “±” without a stated probability level)';

// ---------------------------------------------------------------- Bullet Cluster (Clowe et al. 2006)
const bullet = {
  source: 'clowe-2006',
  name: '1E0657−558 (the Bullet Cluster)',
  z: 0.296,
  cosmology: { H0: 70, Om: 0.3, Ode: 0.7, kpcPerArcsec: 4.413, note: 'the cosmology Clowe et al. assume for distances (§1); “None of the results of this paper are dependent on this assumption”' },
  apertureKpc: 100,
  /** Table 2. M_X: plasma mass from the Chandra X-ray image; M∗: stellar mass from the I-band light with M/L_I = 2; κ̄: mean convergence. */
  components: [
    { id: 'main-bcg', label: 'Main cluster BCG', ra: '06:58:35.3', dec: '−55:56:56.3', MX: [5.5, 0.6], Mstar: [0.54, 0.08], kappa: [0.36, 0.06] },
    { id: 'main-plasma', label: 'Main cluster plasma', ra: '06:58:30.2', dec: '−55:56:35.9', MX: [6.6, 0.7], Mstar: [0.23, 0.02], kappa: [0.05, 0.06] },
    { id: 'sub-bcg', label: 'Subcluster BCG', ra: '06:58:16.0', dec: '−55:56:35.1', MX: [2.7, 0.3], Mstar: [0.58, 0.09], kappa: [0.20, 0.05] },
    { id: 'sub-plasma', label: 'Subcluster plasma', ra: '06:58:21.2', dec: '−55:56:30.0', MX: [5.8, 0.6], Mstar: [0.12, 0.01], kappa: [0.02, 0.06] },
  ],
  massUnit: '10¹² M☉',
  interval: IMPLIED,
  tableNote: 'All values are calculated by averaging over an aperture of 100 kpc radius around the given position (marked with blue +s for the centers of the plasma clouds in Fig 1). κ̄ measurements for the plasma clouds are the residual left over after subtraction of circularly symmetric profiles centered on the BCGs.',
  peaks: [
    { id: 'sub', label: 'subcluster κ peak', from: 'sub-bcg', east: 7.1, north: 6.5, significance: '8σ', note: 'centred 7.″1 east and 6.″5 north of the subcluster’s brightest cluster galaxy (BCG)' },
    { id: 'main', label: 'main-cluster κ peak', from: null, east: null, north: null, significance: '12σ', note: 'centred 2.″5 east and 11.″5 south of the northern BCG in the main cluster (21.″2 west and 17.″7 north of the southern BCG); Table 2 does not say which BCG it lists, so this peak is not drawn' },
  ],
  offsetSignificance: '∼8σ',
  plasmaKappaShare: [
    { cluster: 'main', value: 14, plus: 16, minus: 14, unit: '%' },
    { cluster: 'sub', value: 10, plus: 30, minus: 10, unit: '%' },
  ],
  stellarMassToLight: { value: 2, band: 'I', range: [0.5, 3], note: 'M/L_I = 2 (Kauffmann et al. 2003); the paper says it can vary between 0.5 and 3; the quoted M∗ errors exclude it; M∗ is an upper limit (no colour selection)' },
  plasmaMassAccuracy: '10 %',
  merger: { separationMpc: 0.72, tSubKeV: 6, tMainKeV: 14, shockKms: 4700, losKms: 600, passageMyr: 100, note: '§1: two galaxy concentrations 0.72 Mpc apart on the sky; the bow shock shows the subcluster moving away at ∼4700 km/s; line-of-sight velocity difference ∼600 km/s; the cores passed through each other ∼100 Myr ago' },
  quotes: [
    { where: 'abstract', text: 'An 8σ significance spatial offset of the center of the total mass from the center of the baryonic mass peaks cannot be explained with an alteration of the gravitational force law, and thus proves that the majority of the matter in the system is unseen.' },
    { where: '§1', text: 'In the absence of dark matter, the gravitational potential will trace the dominant visible matter component, which is the X-ray plasma. If, on the other hand, the mass is indeed dominated by collisionless dark matter, the potential will trace the distribution of that component, which is expected to be spatially coincident with the collisionless galaxies.' },
    { where: '§3', text: 'Note that both the plasma mass and the stellar mass are determined directly from the X-ray and optical images, respectively, independently of any gravity or dark matter models.' },
    { where: '§2', text: 'In Newtonian gravity, κ is equal to the surface mass density of the lens divided by a scaling constant.' },
    { where: '§2', text: 'This method does, however, systematically underestimate κ in the cores of massive clusters. This results in a slight increase to the centroiding errors of the peaks, and our measurements of κ in the peaks of the components are only lower bounds.' },
    { where: '§3', text: 'The assumed mass-to-light ratio is highly uncertain (can vary between 0.5 and 3) and depends on the history of recent star formation of the galaxies in the apertures; however even in the case of an extreme deviation, the X-ray plasma is still the dominant baryonic component in all of the apertures.' },
    { where: '§1', text: 'We have known since 1937 that the gravitational potentials of galaxy clusters are too deep to be caused by the detected baryonic mass and a Newtonian r⁻² gravitational force law (Zwicky 1937).' },
    { where: '§4', text: 'While the existence of dark matter removes the primary motivation for alternative gravity models, it does not preclude non-standard gravity.' },
  ],
};

// ---------------------------------------------------------------- Coma cluster (Łokas & Mamon 2003)
const coma = {
  source: 'lokas-mamon-2003',
  name: 'Coma cluster (Abell 1656)',
  centre: 'NGC 4874, RA 12h59m35.7s, Dec +27°57′33″ (J2000)',
  H0: 70,
  distanceMpc: 101.3,
  distanceNote: 'Hubble-flow velocity 7093 km/s (heliocentric 6925 km/s, Struble & Rood 1999, corrected for the Local Group motion) with H₀ = 70 km/s/Mpc; distance modulus 35.03',
  /** eq. 1–2: luminosity density l⋆ / [(r/r_S)(1 + r/r_S)²] fitted to all 985 member galaxies (B band). */
  stars: { lstar: 9.05e7, rS: 14.4, unit: 'L☉/arcmin³, arcmin', upsilonE: 8, upsilonS: 3, ratioES: 2.2, upsilon: 6.43, note: 'Υ_G = (2.2 Υ_E + Υ_S)/3.2 = 6.43 M☉/L☉ in the blue band' },
  /** the tracer: 366 E-S0 galaxies */
  tracer: { lstar: 3.55e8, rS: 7.05, unit: 'L☉/arcmin³, arcmin', note: 'luminosity profile of the E-S0 galaxies, the tracer population whose velocities are modelled' },
  /** eq. 3–5: β-model gas, isothermal; parameters from Briel, Henry & Böhringer (1992) ROSAT 0.5–2.4 keV out to 100′ */
  gas: { n0: 3.42e-3, rc: 10.5, b: 0.75, gamma: 1.136, S0: 4.6e-13, unit: 'cm⁻³, arcmin', note: 'n(r) = n₀[1 + (r/r_c)²]^(−3b/2); mass per electron m_e + γm_p with γ = 1.136 (primordial composition, Y_He = 0.23–0.24); n₀ for h = 0.7 from Briel et al. (1992) and Henry & Henriksen (1986)' },
  /** eq. 6–12: ρ = ρ_char / [(r/r_s)^α (1 + r/r_s)^(3−α)], r_v where the mean density is Δ_c ρ_crit,0 */
  dark: {
    deltaC: 102,
    deltaNote: 'Δ_c ≈ 102 for ΛCDM with Ω_M = 0.3, Ω_Λ = 0.7 (spherical collapse; Eke, Cole & Frenk 1996)',
    fits: [
      { alpha: 0, Mv: 1.2, beta: -0.13, c: 19, chi2: 6.1 },
      { alpha: 0.5, Mv: 1.2, beta: -0.14, c: 14, chi2: 6.2 },
      { alpha: 1, Mv: 1.2, beta: -0.16, c: 9.4, chi2: 6.4 },
      { alpha: 1.5, Mv: 1.2, beta: -0.21, c: 4.9, chi2: 6.9 },
    ],
    fitsNote: 'Table 1: best fits of the joint σ_los and κ_los profiles of the E-S0 galaxies (14 data points at R < 80′, 10 degrees of freedom); M_v in 10¹⁵ M☉; β = 1 − σ_θ²/σ_r², constant',
    Mv: { value: 1.2, sigma: 0.4, unit: '10¹⁵ M☉', interval: '1σ (stated)' },
  },
  sample: { members: 967, es0: 355, perBin: 39, innerBins: 7, innerRadiusArcmin: 80, sigmaError: 0.11, note: '355 E-S0 members in bins of 39 galaxies; 1σ error of each velocity dispersion 0.11 s (Appendix A); the profiles are shown in Figs. 3 and 6 only' },
  published: {
    Mtot: { value: 1.4e15, accuracy: '30 %', note: 'within the total-mass virial radius, h₇₀⁻¹ M☉' },
    fractions: { galaxies: 2, gas: 13, dark: 85, at: 'the dark-matter virial radius r_v = 2.7 Mpc' },
    rvDarkMpc: 2.7, rvDarkArcmin: 92,
    rvTotalMpc: 2.9, rvTotalArcmin: 97,
    MtoL: { value: 351, band: 'B', at: 'the total-mass virial radius 2.9 Mpc', unit: 'M☉/L☉ (h₇₀)' },
    M36: { value: 1.6e15, sigma: 0.5e15, at: 3.6, note: 'extrapolated to 3.6 h₇₀⁻¹ Mpc, compared with Hughes (1989) 1.3 ± 0.2, Briel et al. (1992) 1.3 ± 0.4 and Geller, Diaferio & Kurtz (1999) 1.7 ± 0.4 (× 10¹⁵ h₇₀⁻¹ M☉)' },
    omega0: { value: 0.29, sigma: 0.1, note: 'combining the baryon-fraction estimate (Ω₀ = 0.26 ± 0.09 with Ω_b = 0.04) and the mass-to-light estimate (0.32 ± 0.1)' },
  },
  quotes: [
    { where: 'abstract', text: 'The total mass within the virial radius of 2.9 h₇₀⁻¹ Mpc is 1.4 × 10¹⁵ h₇₀⁻¹ M⊙ (with 30% accuracy), 85% of which is dark.' },
    { where: '§5', text: 'The mass in galaxies is only 2% of the total mass, the mass in gas is 13% of the total (the galaxies thus represent less than one-seventh of the baryonic mass), and the dark matter contributes the remaining 85% of the total mass.' },
    { where: '§6', text: 'It is clear from Figure 6 that, while the velocity dispersion profile is well reproduced, there is room for improvement for the kurtosis profile.' },
    { where: '§1', text: 'Note that the Coma cluster is too close for its mass profile to be probed through gravitational lensing.' },
    { where: '§6', text: 'Indeed, the Coma cluster is known to have irregular structure both in projected space (Fitchett & Webster 1987; Mellier et al. 1988; Briel et al. 1992) and velocity space (Colless & Dunn 1996; Biviano et al. 1996).' },
  ],
};

// ---------------------------------------------------------------- BBN (Cooke, Pettini & Steidel 2018)
const bbn = {
  source: 'cooke-2018',
  dh: { value: 2.527, sigma: 0.030, unit: '10⁻⁵', interval: IMPLIED, note: 'primordial D/H, weighted mean of seven quasar absorption systems (eq. 10)' },
  eta10: { value: 5.931, sigma: 0.051, note: 'baryon-to-photon ratio ×10¹⁰ for the Standard Model with the Marcucci et al. (2016) d(p,γ)³He rate (eq. 11)' },
  ombh2: { value: 2.166, measurement: 0.015, theory: 0.011, scale: 100, interval: IMPLIED, note: '100 Ω_b,0 h² (eq. 12): first error from the D/H measurement, second from the BBN calculation; η₁₀ = 273.78 Ω_b h² (Steigman 2006)' },
  ombh2Empirical: { value: 2.235, measurement: 0.016, theory: 0.033, scale: 100, interval: IMPLIED, note: 'eq. 14, with the empirically measured d(p,γ)³He cross-section of Adelberger et al. (2011)' },
  quotes: [
    { where: 'abstract', text: 'Combining our result with a big bang nucleosynthesis (BBN) calculation that uses the latest nuclear physics input, we find that the baryon density derived from BBN agrees to within 2σ of the latest results from the Planck cosmic microwave background data.' },
  ],
};

writeDataset('datasets/astronomical/dark-matter.json', { version: '1.0.0', bullet, coma, bbn }, {
  dataset: 'dark-matter',
  version: '1.0.0',
  records: bullet.components.length + coma.dark.fits.length + 2,
  sources: [
    { institution: 'Clowe et al. (2006), ApJ 648, L109', url: 'https://doi.org/10.1086/508162', notes: 'Bullet Cluster: Table 2 (M_X, M∗, κ̄ in 100 kpc apertures), peak offsets §3 (arXiv:astro-ph/0608407v1)' },
    { institution: 'Łokas & Mamon (2003), MNRAS 343, 401', url: 'https://doi.org/10.1046/j.1365-8711.2003.06684.x', notes: 'Coma mass model: eqs. 1–12, Table 1, results §5–§6 (arXiv:astro-ph/0302461v2)' },
    { institution: 'Cooke, Pettini & Steidel (2018), ApJ 855, 102', url: 'https://doi.org/10.3847/1538-4357/aaab53', notes: 'primordial D/H and the BBN baryon density, eqs. 9–14 (arXiv:1710.11129v3)' },
  ],
  adapter: 'scripts/ingestion/curated-dark-matter.ts',
  warnings: [
    'Hand-transcribed (manually transcribed values from the arXiv PDF text; Clowe et al. from the accepted preprint v1).',
    'Clowe et al. Table 2 and Cooke et al. eq. 12 attach no probability level to “±”: read as 1σ (implied).',
    'Coma’s measured velocity-dispersion and kurtosis profiles are published only as figures and are not bundled; the mass model is.',
  ],
});
