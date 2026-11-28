/**
 * Plasma, tests of relativity and the radial acceleration relation (Phase 14, Gates 14.4–14.6)
 * → datasets/astronomical/advanced.json
 *
 *   node --experimental-strip-types scripts/ingestion/curated-advanced.ts
 *
 * Transcribed 2026-11-28 (notes: research/SOURCE_NOTES_PHASE14.md): NRL Plasma Formulary 2009 pp. 28–29, 40, 42
 * (page images); Divine (1973) JPL TM 33-637 Table 1 p. 33; NOAA SWPC “Solar Wind”; Einstein (1916) p. 822 (page
 * image); Gravity Probe B status update (Stanford, 4 May 2011); McGaugh, Lelli & Schombert (2016) arXiv:1609.05917
 * pp. 1, 4; Famaey & McGaugh (2012) arXiv:1112.3960 p. 66; Friedmann (1922) p. 381 (page image).
 */
import { writeDataset } from './lib/ingest.ts';

const data = {
  version: '1.0.0',
  plasma: {
    nrl: { source: 'nrl-formulary-2009', units: 'All quantities are in Gaussian cgs units except temperature (T, Tₑ, Tᵢ) expressed in eV and ion mass (mᵢ) expressed in units of the proton mass, μ = mᵢ/mₚ', formulas: [
      { q: 'electron plasma frequency', f: 'f_pe = 8.98 × 10³ n_e^½ Hz' }, { q: 'Debye length', f: 'λ_D = 7.43 × 10² T^½ n^−½ cm' },
      { q: 'electron gyrofrequency', f: 'f_ce = 2.80 × 10⁶ B Hz' }, { q: 'Alfvén velocity', f: 'v_A = 2.18 × 10¹¹ μ^−½ n_i^−½ B cm/sec' },
      { q: 'electron thermal velocity', f: 'v_Te = (kT_e/m_e)^½ = 4.19 × 10⁷ T_e^½ cm/sec' }, { q: 'plasma beta', f: 'β = 8π nkT/B² = 4.03 × 10⁻¹¹ nTB⁻²' },
      { q: 'particles in Debye sphere', f: '(4π/3) n λ_D³ = 1.72 × 10⁹ T^{3/2} n^−½' }] },
    typical: { source: 'nrl-formulary-2009', where: 'p. 40', rows: [
      { name: 'Interstellar gas', n: 1, T: 1 }, { name: 'Gaseous nebula', n: 1e3, T: 1 }, { name: 'Solar Corona', n: 1e9, T: 1e2 },
      { name: 'Solar atmosphere, gas discharge', n: 1e14, T: 1 }, { name: 'Thermonuclear plasma', n: 1e15, T: 1e4 }, { name: 'Laser Plasma', n: 1e20, T: 1e2 }] },
    ionosphere: { source: 'nrl-formulary-2009', where: 'p. 42', quote: 'The following tables give average nighttime values.', E: { alt: '90–160 km', n: [1.5e10, 3.0e10] }, F: { alt: '160–500 km', n: [5e10, 2e11] }, B0: 0.35e-4 },
    solarWind: { source: 'divine-1973', where: 'Table 1, p. 33', n: 5, nRange: [2.5, 7], v: 425, vRange: [350, 550], Tp: 8e4, Te: 1.5e5, B: 5, BRange: [2, 7], footnote: 'Typically data fall within this range most (say 60%) of the time.' },
    swpc: { source: 'noaa-swpc-solar-wind', quotes: ['The solar wind continuously flows outward from the Sun and consists mainly of protons and electrons in a state known as a plasma. Solar magnetic field is embedded in the plasma and flows outward with the solar wind.', 'Coronal holes produce solar wind of high speed, ranging from 500 to 800 kilometers per second.', 'In the equatorial plane, where the Earth and the other planets orbit, the most common state of the solar wind is the slow speed wind, with speeds of about 400 kilometers per second.'] },
  },
  gr: {
    einstein: { source: 'einstein-1916', where: 'p. 822', eq74: 'B = 2α/Δ = κM/4πΔ', bending: 'Ein an der Sonne vorbeigehender Lichtstrahl erfährt demnach eine Biegung von 1,7″, ein am Planeten Jupiter vorbeigehender eine solche von etwa 0,02″.', bendingEn: 'A light ray passing the Sun accordingly undergoes a bending of 1.7″; one passing the planet Jupiter, about 0.02″.',
      eq75: 'ε = 24π³ a² / (T² c² (1 − e²))', eq75Words: 'pro Umlauf. In dieser Formel bedeutet a die große Halbachse, c die Lichtgeschwindigkeit in üblichem Maße, e die Exzentrizität, T die Umlaufszeit in Sekunden.', mercury: 'Die Rechnung ergibt für den Planeten Merkur eine Drehung der Bahn um 43″ pro Jahrhundert, genau entsprechend der Konstatierung der Astronomen (Leverrier)', mercuryEn: 'The calculation gives for the planet Mercury a rotation of the orbit of 43″ per century, exactly corresponding to the astronomers’ finding (Leverrier).' },
    gpb: { source: 'gpb-stanford-2011', quote: 'Analysis of the data from all four gyroscopes results in a geodetic drift rate of -6,601.8±18.3 mas/yr and a frame-dragging drift rate of -37.2±7.2 mas/yr, to be compared with the GR predictions of -6,606.1 mas/yr and -39.2 mas/yr, respectively.', geodetic: [-6601.8, 18.3, -6606.1], frame: [-37.2, 7.2, -39.2], mission: 'Launched on April 20, 2004, Gravity Probe B (GP-B) was a collaboration between Stanford University and NASA designed to test two previously untested aspects of Albert Einstein’s general theory of relativity (geodetic and frame-dragging effects) by observing the precession of four near perfectly spherical gyroscopes in reference to a distant star as the spacecraft travelled in a polar orbit 400 miles above the Earth.' },
    kerr: { source: 'cen-song-2025', quote: 'ISCO radii for rotating Kerr black holes vary with spin parameter a, ranging from r_ISCO = 9M (counter-rotating case) to r_ISCO = M (extremal Kerr)', schwarzschild: 6 },
  },
  rar: {
    source: 'mcgaugh-2016-rar', eq4: 'g_obs = g_bar / (1 − e^{−√(g_bar/g†)})', gDagger: 'g† = 1.20 ± 0.02 (random) ± 0.24 (systematic) × 10⁻¹⁰ m s⁻²',
    cuts: 'Ten face-on galaxies with i<30° are rejected to minimize sin(i) corrections to the observed velocities. Twelve galaxies with asymmetric rotation curves that manifestly do not trace the equilibrium gravitational potential are rejected. This leaves a sample of 153 galaxies. Of the many resolved points along the rotation curves of these galaxies, we require a minimum precision of 10% in velocity. This retains 2693 data points out of 3149.',
    upsilon: 'we adopt Υ⋆[3.6] = 0.50 M⊙/L⊙ … as representative of all disks; Υ⋆[3.6] = 0.7 M⊙/L⊙ for bulges',
    caution: 'In MOND, eq. 4 is related to the MOND interpolation function. However, we should be careful not to confuse data with theory.',
    mond: { source: 'famaey-mcgaugh-2012', quote: 'It turns out that using the simple interpolating function … yields a value of a0 = 1.2 × 10−10 m s−2, and excellent fits to galaxy rotation curves', note: 'Milgrom’s 1983 papers (ApJ 270, 365 and 371) introduced MOND; no open copy was found.' },
  },
  friedmann: { source: 'friedmann-1922', where: 'p. 381', eq5: '3R′²/R² + 3c²/R² − λ = κc²ρ', eq6: '(1/c²)(dR/dt)² = (A − R + (λ/3c²) R³)/R' },
};

writeDataset('datasets/astronomical/advanced.json', data, {
  dataset: 'advanced', version: '1.0.0', records: 20,
  sources: [
    { institution: 'Huba, NRL Plasma Formulary (2009 revision), DTIC ADA499299', url: 'https://archive.org/details/DTIC_ADA499299', license: 'U.S. government work; approved for public release', notes: 'coefficients and typical plasmas (page images)' },
    { institution: 'Divine (1973) JPL TM 33-637; NOAA SWPC', url: 'https://ntrs.nasa.gov/citations/19730021133', license: 'NTRS: GOV_PUBLIC_USE_PERMITTED; NOAA public domain', notes: 'solar wind near 1 AU' },
    { institution: 'Einstein (1916); Gravity Probe B (Stanford/NASA)', url: 'https://archive.org/details/sim_annalen-der-physik_1916_49_7', notes: 'perihelion and light bending (page image); GP-B results' },
    { institution: 'McGaugh, Lelli & Schombert (2016) arXiv:1609.05917; Famaey & McGaugh (2012) arXiv:1112.3960', url: 'https://arxiv.org/abs/1609.05917', license: 'arXiv non-exclusive licence: short quotations only', notes: 'radial acceleration relation; MOND a0' },
  ],
  adapter: 'scripts/ingestion/curated-advanced.ts',
  warnings: ['NRL formulary: 2009 edition (current edition behind a bot wall).', 'Kerr ISCO: only the three limiting values (Bardeen et al. 1972 not readable in an allowed open copy).'],
});
