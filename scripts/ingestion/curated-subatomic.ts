/**
 * Particles, quantum mechanics and nuclei (Phase 14, Gates 14.1–14.3) → datasets/atomic/{particles,quantum,nuclear}.json
 *
 *   node --experimental-strip-types scripts/ingestion/curated-subatomic.ts
 *
 * Transcribed 2026-11-28 (raw downloads outside the repository; notes in research/SOURCE_NOTES_PHASE14.md):
 *  - PDG Review of Particle Physics 2025 summary tables (CC BY 4.0) and mass_width_2025.txt.
 *  - DOE Office of Science “DOE Explains” pages (public domain, acknowledgement requested; images not used).
 *  - Schrödinger, Collected Papers on Wave Mechanics (Blackie 1928) pp. 27, 31; Mott, An Outline of Wave Mechanics
 *    (1930) pp. 59, 61; Condon & Morse, Quantum Mechanics (1929) pp. 224–228; Gurney & Condon, Nature 122, 439
 *    (1928) — all read on page images (US public domain).
 *  - Wing, ANL-6814 (1964) Table 1, p. 11 (page image); USGS OFR 2004-1050 U-238 chain (figure read);
 *    PDG neutrino review §14.6.1.1; NASA Marshall “The Solar Interior”.
 */
import { writeDataset } from './lib/ingest.ts';

const PDG = 'pdg-2025', DOE = 'doe-explains';
const particles = {
  version: '1.0.0',
  citation: 'S. Navas et al. (Particle Data Group), Phys. Rev. D 110, 030001 (2024) and 2025 update',
  schemes: 'The u-, d-, and s-quark masses are the MS‾ masses at the scale μ = 2 GeV. The c- and b-quark masses are the MS‾ masses renormalized at the MS‾ mass, i.e. m‾ = m‾(μ = m‾). The t-quark mass is extracted from event kinematics (see the review "The Top Quark").',
  particles: [
    { id: 'u', name: 'up quark', symbol: 'u', group: 'quark', charge: '+2/3', spin: '1/2', massMeV: 2.16, mass: '2.16 ± 0.07 MeV', note: 'MS‾ at 2 GeV' },
    { id: 'd', name: 'down quark', symbol: 'd', group: 'quark', charge: '−1/3', spin: '1/2', massMeV: 4.70, mass: '4.70 ± 0.07 MeV', note: 'MS‾ at 2 GeV' },
    { id: 's', name: 'strange quark', symbol: 's', group: 'quark', charge: '−1/3', spin: '1/2', massMeV: 93.5, mass: '93.5 ± 0.8 MeV', note: 'MS‾ at 2 GeV' },
    { id: 'c', name: 'charm quark', symbol: 'c', group: 'quark', charge: '+2/3', spin: '1/2', massMeV: 1273.0, mass: '1.2730 ± 0.0046 GeV', note: 'm‾(m‾)' },
    { id: 'b', name: 'bottom quark', symbol: 'b', group: 'quark', charge: '−1/3', spin: '1/2', massMeV: 4183, mass: '4.183 ± 0.007 GeV', note: 'm‾(m‾)' },
    { id: 't', name: 'top quark', symbol: 't', group: 'quark', charge: '+2/3', spin: '1/2', massMeV: 172560, mass: '172.56 ± 0.31 GeV', note: 'direct measurements; width 1.42 GeV' },
    { id: 'e', name: 'electron', symbol: 'e⁻', group: 'lepton', charge: '−1', spin: '1/2', massMeV: 0.51099895, mass: '0.51099895000 ± 0.00000000015 MeV', note: 'mean life > 6.6 × 10²⁸ yr' },
    { id: 'mu', name: 'muon', symbol: 'μ⁻', group: 'lepton', charge: '−1', spin: '1/2', massMeV: 105.6583755, mass: '105.6583755 ± 0.0000023 MeV', note: 'mean life 2.1969811 × 10⁻⁶ s' },
    { id: 'tau', name: 'tau', symbol: 'τ⁻', group: 'lepton', charge: '−1', spin: '1/2', massMeV: 1776.93, mass: '1776.93 ± 0.09 MeV', note: 'mean life 290.3 × 10⁻¹⁵ s' },
    { id: 'nue', name: 'electron neutrino', symbol: 'νₑ', group: 'lepton', charge: '0', spin: '1/2', massMeV: null, mass: '< 0.8 eV (tritium decay, 90 % CL)', note: 'an upper limit' },
    { id: 'numu', name: 'muon neutrino', symbol: 'ν_μ', group: 'lepton', charge: '0', spin: '1/2', massMeV: null, mass: 'not measured', note: 'oscillations: Δm²₃₂ = 2.451 × 10⁻³ eV² (normal order)' },
    { id: 'nutau', name: 'tau neutrino', symbol: 'ν_τ', group: 'lepton', charge: '0', spin: '1/2', massMeV: null, mass: 'not measured', note: 'oscillations: Δm²₂₁ = 7.50 × 10⁻⁵ eV²' },
    { id: 'photon', name: 'photon', symbol: 'γ', group: 'gauge', charge: '0', spin: '1', massMeV: null, mass: '< 1 × 10⁻¹⁸ eV', note: 'stable' },
    { id: 'gluon', name: 'gluon', symbol: 'g', group: 'gauge', charge: '0', spin: '1', massMeV: null, mass: '0 (theoretical value)', note: '“A mass as large as a few MeV may not be precluded.”' },
    { id: 'W', name: 'W boson', symbol: 'W±', group: 'gauge', charge: '±1', spin: '1', massMeV: 80369.2, mass: '80.3692 ± 0.0133 GeV', note: 'width 2.14 ± 0.05 GeV' },
    { id: 'Z', name: 'Z boson', symbol: 'Z⁰', group: 'gauge', charge: '0', spin: '1', massMeV: 91188.0, mass: '91.1880 ± 0.0020 GeV', note: 'width 2.4955 ± 0.0023 GeV' },
    { id: 'H', name: 'Higgs boson', symbol: 'H⁰', group: 'scalar', charge: '0', spin: '0', massMeV: 125200, mass: '125.20 ± 0.11 GeV', note: 'width 3.7 +1.9 −1.4 MeV' },
  ],
  neutrinoCount: { value: '2.996 ± 0.007', quote: 'Number N = 2.996 ± 0.007 (Standard Model fits to LEP-SLC data)' },
  doe: [
    { url: 'https://www.energy.gov/science/doe-explainsthe-standard-model-particle-physics', quote: 'The Standard Model of Particle Physics is scientists’ current best theory to describe the most basic building blocks of the universe. It explains how particles called quarks (which make up protons and neutrons) and leptons (which include electrons) make up all known matter.' },
    { url: 'https://www.energy.gov/science/doe-explainsthe-standard-model-particle-physics', quote: 'The Standard Model explains three of the four fundamental forces that govern the universe: electromagnetism, the strong force, and the weak force.' },
    { url: 'https://www.energy.gov/science/doe-explainsthe-standard-model-particle-physics', quote: 'All ordinary matter, including every atom on the periodic table of elements, consists of only three types of matter particles: up and down quarks, which make up the protons and neutrons in the nucleus, and electrons that surround the nucleus.' },
    { url: 'https://www.energy.gov/science/doe-explainsquarks-and-gluons', quote: 'There are six different kinds of quarks with a wide range of masses. They are named up, down, charm, strange, top, and bottom.' },
    { url: 'https://www.energy.gov/science/doe-explainsquarks-and-gluons', quote: 'Quarks are the only elementary particles to experience all the known forces of nature and to have a fractional electric charge.' },
    { url: 'https://www.energy.gov/science/doe-explainsbosons-and-fermions', quote: 'Bosons are the fundamental particles that have spin in integer values (0, 1, 2, etc.). Fermions, on the other hand, have spin in odd half integer values (1/2, 3/2, and 5/2, but not 2/2 or 6/2).' },
    { url: 'https://www.energy.gov/science/doe-explainsbosons-and-fermions', quote: 'A class of bosons known as gauge bosons act as “force carriers” between particles. These include the photon (which carries the electromagnetic force), gluon (which carries the strong nuclear force), and W and Z bosons (which carry the weak nuclear force). The hypothetical graviton, which carries gravity, has not been found.' },
    { url: 'https://www.energy.gov/science/doe-explainsneutrinos', quote: 'Scientists named the three types of neutrinos they have discovered so far for the other matter particle they interact with: the electron neutrino, muon neutrino, and tau neutrino.' },
    { url: 'https://www.energy.gov/science/doe-explainsneutrinos', quote: 'Neutrinos change between types as they travel, something scientists call neutrino oscillation.' },
    { url: 'https://www.energy.gov/science/doe-explainsthe-higgs-boson', quote: 'The Higgs boson is the fundamental particle associated with the Higgs field, a field that gives mass to other fundamental particles such as electrons and quarks.' },
  ],
  sources: { pdg: PDG, doe: DOE },
};

const quantum = {
  version: '1.0.0',
  schrodinger: { source: 'schrodinger-1928', where: 'p. 27, eq. (18″)', quote: 'Schrödinger (1926, in the 1928 English collection) wrote the wave equation for a particle of energy E in a potential V as div grad ψ + (8π²/h²)(E − V)ψ = 0, “the differential operations are to be understood with regard to the line element (3)”. In one dimension, for mass m: d²ψ/dx² + (8π²m/h²)(E − V)ψ = 0 (Condon & Morse 1929, p. 224).' },
  oscillator: { source: 'schrodinger-1928', quote: 'Oscillator levels, Schrödinger eq. (25′), p. 31: “Eₙ = ((2n + 1)/2) hν₀; n = 0, 1, 2, 3, … Thus as quantum levels appear so-called “half-integral” multiples of the “quantum of energy” peculiar to the oscillator.”' },
  box: { source: 'mott-1930', quote: 'Box levels, Mott (1930) p. 59: “ν_n = hn²/8ml²” for an electron between walls a distance l apart, and p. 61: a vibration of frequency ν “describes the behaviour of an electron of energy hν” — so Eₙ = n²h²/8ml².', example: { boxCm: 1, energyV: 20, printedSpacingV: 3.2e-7, quote: '(If the box is 1 cm. long, and the energy of the electron about 20 volts, the interval between successive energy levels is 3·2 × 10⁻⁷ volt.)' } },
  tunnel: { source: 'gurney-condon-1928', quote: 'Gurney & Condon (1928): “If a ball be moving in a valley of potential energy and have not enough energy to get over a mountain on one side of the valley, it must certainly stay in the valley for all time, unless it acquire the deficiency in energy somehow. But this is not so on the quantum mechanics. It will always have a small but finite chance of slipping through the mountain and escaping from the valley.”' },
  condonMorse: { source: 'condon-morse-1929', where: 'pp. 225–226', transmitted: 'The fraction transmitted is therefore 1/CC̄ and the fraction reflected is DD̄/CC̄.', resonance: 'the transmission probability is increased whenever ka = nπ, that is, whenever an integral number of half de Broglie wave lengths is contained in the distance a.', erratum: 'Eq. (68.5), for W < V, is printed with + before (k₀/k − k/k₀)²; substituting ik for k in (68.4), as the text says, gives a minus sign. Only the minus sign makes the transmission 1 for a barrier of zero width.' },
  alpha: { source: 'gurney-condon-1928', quote: '“By varying this height through a small range we can obtain all periods of radioactive decay from a fraction of a second, through the 10⁹ years of uranium, to practical stability.”' },
};

const nuclear = {
  version: '1.0.0',
  semf: {
    source: 'wing-anl-6814', formula: 'M(Z,N) = ZM_p + NM_n − a_vA + a_aI²/A + a_sA^{2/3} + a_cZ²/A^{1/3}', formulaQuote: 'This is the simplified form of Weizsäcker’s description presented by Bethe and Bacher (36BB) and is commonly known as the Bethe-Weizsäcker mass formula.',
    printed: [
      { source: 'wing-anl-6814', label: 'Green (1954–55), as tabulated by Wing (1964)', av: 15.753, aa: 23.69, as: 17.804, ac: 0.710, ap: 12, pairing: '12/A^½', coulomb: 'Z²' },
      { source: 'wing-anl-6814', label: 'Wapstra (1958), as tabulated by Wing (1964)', av: 15.835, aa: 23.20, as: 18.33, ac: 0.714, ap: 11.2, pairing: '11.2/A^½', coulomb: 'Z²' },
      { source: 'wing-anl-6814', label: 'Bethe and Bacher (1936), as tabulated by Wing (1964)', av: 13.860, aa: 19.50, as: 13.20, ac: 0.580, ap: 0, pairing: 'none', coulomb: 'Z²' },
    ],
  },
  chains: [
    { id: 'u238', label: 'Uranium-238 series', source: 'usgs-ofr-2004-1050', quote: 'The radioactive decay series of ²³⁸U is complex and produces alpha, beta, and gamma radiation.', steps: [
      { Z: 92, A: 238, mode: 'α' }, { Z: 90, A: 234, mode: 'β' }, { Z: 91, A: 234, mode: 'β' }, { Z: 92, A: 234, mode: 'α' }, { Z: 90, A: 230, mode: 'α' }, { Z: 88, A: 226, mode: 'α' }, { Z: 86, A: 222, mode: 'α' }, { Z: 84, A: 218, mode: 'α' }, { Z: 82, A: 214, mode: 'β' }, { Z: 83, A: 214, mode: 'β' }, { Z: 84, A: 214, mode: 'α' }, { Z: 82, A: 210, mode: 'β' }, { Z: 83, A: 210, mode: 'β' }, { Z: 84, A: 210, mode: 'α' }, { Z: 82, A: 206, mode: '' },
    ], note: 'Only main decays are shown (USGS figure). Pa-234’s 1.17-minute half-life in the figure is that of its metastable state Pa-234m; NUBASE lists the ground state.' },
  ],
  stars: {
    nasa: { source: 'nasa-msfc-solar-interior', quote: 'In stars like the Sun the nuclear burning takes place through a three step process called the proton-proton or pp chain. In the first step two protons collide to produce deuterium, a positron, and a neutrino. In the second step a proton collides with the deuterium to produce a helium-3 nucleus and a gamma ray. In the third step two helium-3s collide to produce a normal helium-4 nucleus with the release of two protons.' },
    pdg: { source: 'pdg-2025', quote: 'These reactions result in the overall fusion of four protons into a ⁴He nucleus, 4p → ⁴He + 2e⁺ + 2ν_e, where the energy released in the reaction, Q = 4m_p − m_⁴He − 2m_e ∼ 26 MeV, is mostly radiated by photons and only a small fraction is carried by the neutrinos, ⟨E_2νe⟩ = 0.59 MeV.' },
    cnoNeutrinos: 'Neutrinos from the CNO cycle are produced via the ¹³N → ¹³C + e⁺ + ν (¹³N), ¹⁵O → ¹⁵N + e⁺ + ν (¹⁵O), and ¹⁷F → ¹⁷O + e⁺ + ν (¹⁷F) reactions.',
  },
};

writeDataset('datasets/atomic/particles.json', particles, { dataset: 'particles', version: '1.0.0', records: particles.particles.length,
  sources: [{ institution: 'Particle Data Group, Review of Particle Physics 2025 (summary tables)', url: 'https://pdg.lbl.gov/2025/tables/contents_tables.html', license: 'CC BY 4.0', notes: 'masses, widths, charges, spins' },
    { institution: 'U.S. DOE Office of Science, DOE Explains', url: 'https://www.energy.gov/science/doe-explainsthe-standard-model-particle-physics', license: 'public domain (DOE web policy); images not used', notes: 'plain-language sentences' }],
  adapter: 'scripts/ingestion/curated-subatomic.ts', warnings: ['Quark masses are scheme-dependent (MS‾ at 2 GeV or at their own mass; top from kinematics) — not directly comparable to lepton pole masses.'] });
writeDataset('datasets/atomic/quantum.json', quantum, { dataset: 'quantum', version: '1.0.0', records: 6,
  sources: [{ institution: 'Schrödinger (1928); Mott (1930); Condon & Morse (1929); Gurney & Condon (1928)', url: 'https://archive.org/details/in.ernet.dli.2015.220691', license: 'public domain in the United States', notes: 'equations read on page images' }],
  adapter: 'scripts/ingestion/curated-subatomic.ts', warnings: ['Condon & Morse eq. (68.5) carries a sign misprint; the app uses (68.4) continued to W < V.', 'Mott’s 1-cm example prints 3·2 × 10⁻⁷ V; his formula gives 5.5 × 10⁻⁷ V.'] });
writeDataset('datasets/atomic/nuclear.json', nuclear, { dataset: 'nuclear', version: '1.0.0', records: 3 + 15,
  sources: [{ institution: 'Wing, ANL-6814 (1964), Argonne National Laboratory', url: 'https://doi.org/10.2172/4064372', notes: 'Bethe–Weizsäcker formula and Table 1 coefficients (page image)' },
    { institution: 'USGS Open-File Report 2004-1050', url: 'https://pubs.usgs.gov/of/2004/1050/uranium.htm', license: 'USGS public domain', notes: 'U-238 series membership and order' },
    { institution: 'PDG neutrino review (CC BY 4.0); NASA Marshall', url: 'https://solarscience.msfc.nasa.gov/interior.shtml', notes: 'the pp chain' }],
  adapter: 'scripts/ingestion/curated-subatomic.ts', warnings: ['Step energies are computed from NUBASE2020 masses, not quoted.'] });
