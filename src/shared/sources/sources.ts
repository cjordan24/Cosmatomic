/**
 * Source index — every scientific source used anywhere in Voyager Ventures, with a link and a short
 * note on its authors/institution. Rendered at #/sources; records link to entries by id
 * (#/sources/<id>).
 *
 * Accepted source types: peer-reviewed journal articles, university-press and academic textbooks,
 * national metrology/science laboratories (NIST, NASA/JPL, NIH/NCBI), and international scientific
 * or standards bodies (CODATA, IAU, IUPAC, IAEA, ISO/ITU/IAPWS).
 *
 * Author notes are limited to publicly documented roles and affiliations. If an affiliation was not
 * verified, `authorBio` is null and the UI says so — biographies are never guessed.
 * tests/science/sources.test.ts checks that every dataset manifest and every record citation maps to
 * an entry here.
 */
export type SourceKind = 'journal-article' | 'book' | 'database' | 'standard' | 'software' | 'report';

export interface Source {
  id: string;
  kind: SourceKind;
  /** full citation as it should be read */
  citation: string;
  title: string;
  authors: string;
  year: number | string;
  institution: string;
  url: string;
  doi?: string;
  license?: string;
  /** short, verifiable note on who the authors / maintainers are; null = not verified */
  authorBio: string | null;
  /** what Voyager uses it for */
  usedFor: string[];
  /** dataset manifest ids (datasets/manifests/<id>.manifest.json) this source feeds */
  datasets?: string[];
}

export const SOURCES: Source[] = [
  // ---------------- data services & reference databases ----------------
  { id: 'pubchem', kind: 'database', citation: 'Kim, S. et al. (2023) PubChem 2023 update. Nucleic Acids Research 51(D1), D1373–D1380.', title: 'PubChem', authors: 'S. Kim et al.', year: 2023,
    institution: 'National Center for Biotechnology Information (NCBI), U.S. National Library of Medicine, National Institutes of Health', url: 'https://pubchem.ncbi.nlm.nih.gov/', doi: '10.1093/nar/gkac956', license: 'NCBI/NLM data policies (public domain U.S. Government work; attribution requested)',
    authorBio: 'The PubChem team at NCBI, part of the U.S. National Library of Medicine (NIH), which develops and maintains the PubChem chemical database.',
    usedFor: ['element properties', 'molecule identities, formulas, descriptors and 3D conformers', 'live compound search'], datasets: ['elements', 'nuclides', 'molecules'] },
  { id: 'nist-asd', kind: 'database', citation: 'Kramida, A., Ralchenko, Yu., Reader, J. and NIST ASD Team. NIST Atomic Spectra Database (version 5.x). National Institute of Standards and Technology, Gaithersburg, MD.', title: 'NIST Atomic Spectra Database', authors: 'A. Kramida, Yu. Ralchenko, J. Reader & NIST ASD Team', year: 2024,
    institution: 'National Institute of Standards and Technology (NIST), Physical Measurement Laboratory', url: 'https://physics.nist.gov/asd', doi: '10.18434/T4W30F', license: 'U.S. Government work (public domain)',
    authorBio: 'Atomic spectroscopists of the NIST Physical Measurement Laboratory, who critically evaluate and compile atomic energy levels and spectral lines.',
    usedFor: ['measured atomic emission/absorption lines', 'energy levels and transition probabilities'], datasets: ['spectra-nist'] },
  { id: 'codata-2018', kind: 'journal-article', citation: 'Tiesinga, E., Mohr, P. J., Newell, D. B. and Taylor, B. N. (2021) CODATA recommended values of the fundamental physical constants: 2018. Reviews of Modern Physics 93, 025010.', title: 'CODATA 2018 fundamental physical constants', authors: 'E. Tiesinga, P. J. Mohr, D. B. Newell, B. N. Taylor', year: 2021,
    institution: 'CODATA Task Group on Fundamental Constants / NIST', url: 'https://physics.nist.gov/cuu/Constants/', doi: '10.1103/RevModPhys.93.025010',
    authorBio: 'NIST physicists serving on the CODATA Task Group on Fundamental Constants, which publishes the internationally recommended values of the physical constants.',
    usedFor: ['all physical constants (c, h, e, k_B, N_A, G, masses, Rydberg constant …)'] },
  { id: 'iau-2012-b2', kind: 'standard', citation: 'International Astronomical Union (2012) Resolution B2: re-definition of the astronomical unit of length.', title: 'IAU 2012 Resolution B2', authors: 'IAU General Assembly', year: 2012,
    institution: 'International Astronomical Union', url: 'https://www.iau.org/Iau/Publications/List-of-Resolutions',
    authorBio: 'The International Astronomical Union (founded 1919) is the international body of professional astronomers responsible for astronomical constants and nomenclature.', usedFor: ['astronomical unit (exact)'] },
  { id: 'iau-2015-b3', kind: 'journal-article', citation: 'Prša, A. et al. (2016) Nominal values for selected solar and planetary quantities: IAU 2015 Resolution B3. The Astronomical Journal 152, 41.', title: 'IAU 2015 Resolution B3', authors: 'A. Prša et al.', year: 2016,
    institution: 'International Astronomical Union', url: 'https://www.iau.org/Iau/Publications/List-of-Resolutions', doi: '10.3847/0004-6256/152/2/41',
    authorBio: 'Lead author Andrej Prša (Villanova University) with an IAU inter-division working group that defined nominal solar and planetary conversion constants.', usedFor: ['nominal solar radius, luminosity, GM☉, effective temperature 5772 K; GM⊕', 'parsec definition (B2)'] },
  { id: 'jpl-horizons', kind: 'database', citation: 'Giorgini, J. D. et al. (1996) JPL’s On-Line Solar System Data Service. Bulletin of the American Astronomical Society 28, 1158. JPL Horizons System.', title: 'JPL Horizons', authors: 'J. D. Giorgini et al., JPL Solar System Dynamics Group', year: 1996,
    institution: 'NASA Jet Propulsion Laboratory, California Institute of Technology', url: 'https://ssd.jpl.nasa.gov/horizons/', license: 'NASA/JPL public data',
    authorBio: 'Jon Giorgini and the Solar System Dynamics Group at NASA’s Jet Propulsion Laboratory (managed by Caltech), which computes high-precision ephemerides for planets, moons and spacecraft.',
    usedFor: ['moon/dwarf-planet orbital elements', 'Voyager 1 & 2 trajectories', 'encounter ephemerides', 'reference vectors for tests'], datasets: ['small-body-elements', 'horizons-reference-vectors', 'spacecraft-voyager', 'encounter-ephemerides'] },
  { id: 'jpl-approx-planets', kind: 'report', citation: 'Standish, E. M. and Williams, J. G. Keplerian Elements for Approximate Positions of the Major Planets. JPL Solar System Dynamics.', title: 'Approximate Positions of the Planets', authors: 'E. M. Standish, J. G. Williams', year: 1992,
    institution: 'NASA Jet Propulsion Laboratory', url: 'https://ssd.jpl.nasa.gov/planets/approx_pos.html', license: 'NASA/JPL public data',
    authorBio: 'E. Myles Standish led development of JPL’s planetary ephemerides (the DE series); James G. Williams is a JPL scientist known for lunar laser ranging analysis.', usedFor: ['planet positions 1800–2050'], datasets: ['planet-elements'] },
  { id: 'jpl-sbdb', kind: 'database', citation: 'JPL Small-Body Database (SBDB) API. NASA Jet Propulsion Laboratory, Solar System Dynamics.', title: 'JPL Small-Body Database', authors: 'JPL Solar System Dynamics Group', year: 2025,
    institution: 'NASA Jet Propulsion Laboratory', url: 'https://ssd-api.jpl.nasa.gov/doc/sbdb.html', license: 'NASA/JPL public data',
    authorBio: 'Maintained by the Solar System Dynamics Group at NASA JPL.', usedFor: ['dwarf-planet physical parameters'], datasets: ['dwarf-physical'] },
  { id: 'jpl-satellites', kind: 'database', citation: 'Planetary Satellite Physical Parameters. NASA JPL Solar System Dynamics.', title: 'Planetary Satellite Physical Parameters', authors: 'JPL Solar System Dynamics Group', year: 2025,
    institution: 'NASA Jet Propulsion Laboratory', url: 'https://ssd.jpl.nasa.gov/sats/phys_par/', license: 'NASA/JPL public data',
    authorBio: 'Maintained by the Solar System Dynamics Group at NASA JPL.', usedFor: ['moon radii, GM, densities'], datasets: ['moon-physical'] },
  { id: 'nssdc-factsheet', kind: 'database', citation: 'Williams, D. R. Planetary Fact Sheet. NASA Goddard Space Flight Center, NSSDCA.', title: 'NASA Planetary Fact Sheet', authors: 'D. R. Williams', year: 2024,
    institution: 'NASA Goddard Space Flight Center — NSSDCA', url: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/', license: 'U.S. Government work (public domain)',
    authorBio: 'David R. Williams curates the planetary fact sheets of NASA’s Space Science Data Coordinated Archive at Goddard Space Flight Center.', usedFor: ['planetary physical data', 'atmospheric compositions', 'Saturn ring radii'], datasets: ['planet-physical'] },
  { id: 'iupac-ciaaw', kind: 'standard', citation: 'IUPAC Commission on Isotopic Abundances and Atomic Weights (CIAAW). Isotopic compositions of the elements.', title: 'CIAAW isotopic compositions', authors: 'IUPAC CIAAW', year: 2021,
    institution: 'International Union of Pure and Applied Chemistry', url: 'https://www.ciaaw.org/',
    authorBio: 'The IUPAC commission responsible for evaluating and publishing standard atomic weights and isotopic abundances.', usedFor: ['natural isotopic abundances'], datasets: ['nuclides'] },
  { id: 'nubase2020', kind: 'journal-article', citation: 'Kondev, F. G., Wang, M., Huang, W. J., Naimi, S. and Audi, G. (2021) The NUBASE2020 evaluation of nuclear physics properties. Chinese Physics C 45, 030001.', title: 'NUBASE2020', authors: 'F. G. Kondev, M. Wang, W. J. Huang, S. Naimi, G. Audi', year: 2021,
    institution: 'IAEA Atomic Mass Data Center', url: 'https://www-nds.iaea.org/amdc/', doi: '10.1088/1674-1137/abddae',
    authorBio: 'Nuclear data evaluators of the Atomic Mass Data Center (Argonne National Laboratory, Institute of Modern Physics CAS and collaborators), publishing the reference evaluation of nuclear ground- and isomeric-state properties.', usedFor: ['nuclide masses, half-lives, decay modes'], datasets: ['nuclides'] },
  { id: 'archinal-2018', kind: 'journal-article', citation: 'Archinal, B. A. et al. (2018) Report of the IAU Working Group on Cartographic Coordinates and Rotational Elements: 2015. Celestial Mechanics and Dynamical Astronomy 130, 22.', title: 'IAU WGCCRE 2015 report', authors: 'B. A. Archinal et al.', year: 2018,
    institution: 'International Astronomical Union — WGCCRE', url: 'https://doi.org/10.1007/s10569-017-9805-5', doi: '10.1007/s10569-017-9805-5',
    authorBio: 'Brent Archinal (U.S. Geological Survey Astrogeology Science Center) chairs the IAU working group that defines planetary pole orientations and prime meridians.', usedFor: ['planet and moon rotation/orientation'] },
  { id: 'asplund-2009', kind: 'journal-article', citation: 'Asplund, M., Grevesse, N., Sauval, A. J. and Scott, P. (2009) The chemical composition of the Sun. Annual Review of Astronomy and Astrophysics 47, 481–522.', title: 'The chemical composition of the Sun', authors: 'M. Asplund, N. Grevesse, A. J. Sauval, P. Scott', year: 2009,
    institution: 'Annual Reviews', url: 'https://doi.org/10.1146/annurev.astro.46.060407.145222', doi: '10.1146/annurev.astro.46.060407.145222',
    authorBio: 'Solar-abundance specialists; lead author Martin Asplund was at the Max Planck Institute for Astrophysics (Garching) at the time of publication.', usedFor: ['solar photospheric element abundances'] },
  { id: 'huber-herzberg-1979', kind: 'book', citation: 'Huber, K. P. and Herzberg, G. (1979) Molecular Spectra and Molecular Structure IV: Constants of Diatomic Molecules. Van Nostrand Reinhold.', title: 'Constants of Diatomic Molecules', authors: 'K. P. Huber, G. Herzberg', year: 1979,
    institution: 'National Research Council of Canada', url: 'https://doi.org/10.1007/978-1-4757-0961-2', doi: '10.1007/978-1-4757-0961-2',
    authorBio: 'Gerhard Herzberg (1904–1999), molecular spectroscopist at the National Research Council of Canada, received the 1971 Nobel Prize in Chemistry; Klaus Peter Huber was his NRC colleague.', usedFor: ['experimental H₂ and NO bond lengths'] },
  { id: 'hedberg-1991', kind: 'journal-article', citation: 'Hedberg, K. et al. (1991) Bond lengths in free molecules of buckminsterfullerene, C60, from gas-phase electron diffraction. Science 254, 410–412.', title: 'Bond lengths in free C60', authors: 'K. Hedberg et al.', year: 1991,
    institution: 'Science (AAAS)', url: 'https://doi.org/10.1126/science.254.5030.410', doi: '10.1126/science.254.5030.410',
    authorBio: 'Kenneth Hedberg (Oregon State University) was a pioneer of gas-phase electron diffraction for molecular structure.', usedFor: ['C₆₀ bond lengths'] },
  { id: 'cordero-2008', kind: 'journal-article', citation: 'Cordero, B. et al. (2008) Covalent radii revisited. Dalton Transactions, 2832–2838.', title: 'Covalent radii revisited', authors: 'B. Cordero, V. Gómez, A. E. Platero-Prats, M. Revés, J. Echeverría, E. Cremades, F. Barragán, S. Alvarez', year: 2008,
    institution: 'Royal Society of Chemistry', url: 'https://doi.org/10.1039/B801115J', doi: '10.1039/B801115J',
    authorBio: 'Structural chemists of the Universitat de Barcelona led by Santiago Alvarez, who derived covalent radii from > 228 000 crystal-structure distances.', usedFor: ['connectivity inference', 'VGFF-1 reference bond lengths'] },
  { id: 'mcguire-2022', kind: 'journal-article', citation: 'McGuire, B. A. (2022) 2021 Census of Interstellar, Circumstellar, Extragalactic, Protoplanetary Disk, and Exoplanetary Molecules. The Astrophysical Journal Supplement Series 259, 30.', title: '2021 census of interstellar molecules', authors: 'B. A. McGuire', year: 2022,
    institution: 'American Astronomical Society', url: 'https://doi.org/10.3847/1538-4365/ac2a48', doi: '10.3847/1538-4365/ac2a48',
    authorBio: 'Brett A. McGuire is an astrochemist on the chemistry faculty of the Massachusetts Institute of Technology.', usedFor: ['“detected in interstellar medium” flags'] },
  { id: 'rdkit', kind: 'software', citation: 'RDKit: Open-source cheminformatics (MinimalLib 2026.09.2).', title: 'RDKit', authors: 'G. Landrum and RDKit contributors', year: 2026,
    institution: 'RDKit open-source project', url: 'https://www.rdkit.org/', license: 'BSD-3-Clause',
    authorBio: 'Founded by Greg Landrum; developed by an international community of cheminformatics researchers.', usedFor: ['structure sanitisation, canonical SMILES, InChI/InChIKey'] },
  { id: 'slater-1930', kind: 'journal-article', citation: 'Slater, J. C. (1930) Atomic shielding constants. Physical Review 36, 57–64.', title: 'Atomic shielding constants', authors: 'J. C. Slater', year: 1930,
    institution: 'American Physical Society', url: 'https://doi.org/10.1103/PhysRev.36.57', doi: '10.1103/PhysRev.36.57',
    authorBio: 'John C. Slater (1900–1976) was a theoretical physicist and head of the MIT physics department.', usedFor: ['effective nuclear charge (Slater’s rules)'] },
  { id: 'meeus-1998', kind: 'book', citation: 'Meeus, J. (1998) Astronomical Algorithms, 2nd ed. Willmann-Bell.', title: 'Astronomical Algorithms', authors: 'J. Meeus', year: 1998,
    institution: 'Willmann-Bell', url: 'https://openlibrary.org/works/OL2009494W',
    authorBio: 'Jean Meeus is a Belgian astronomer whose algorithms books are standard references for positional astronomy computation.', usedFor: ['truncated ELP-2000/82 lunar theory (ch. 47)'] },
  { id: 'yoshida-1990', kind: 'journal-article', citation: 'Yoshida, H. (1990) Construction of higher order symplectic integrators. Physics Letters A 150, 262–268.', title: 'Higher order symplectic integrators', authors: 'H. Yoshida', year: 1990,
    institution: 'Elsevier', url: 'https://doi.org/10.1016/0375-9601(90)90092-3', doi: '10.1016/0375-9601(90)90092-3',
    authorBio: 'Haruo Yoshida, celestial mechanician at the National Astronomical Observatory of Japan.', usedFor: ['4th-order symplectic N-body integrator'] },
  { id: 'chenciner-montgomery-2000', kind: 'journal-article', citation: 'Chenciner, A. and Montgomery, R. (2000) A remarkable periodic solution of the three-body problem in the case of equal masses. Annals of Mathematics 152, 881–901.', title: 'Figure-eight three-body orbit', authors: 'A. Chenciner, R. Montgomery', year: 2000,
    institution: 'Princeton University / Annals of Mathematics', url: 'https://doi.org/10.2307/2661357', doi: '10.2307/2661357',
    authorBio: 'Alain Chenciner (Université Paris 7 / IMCCE) and Richard Montgomery (University of California, Santa Cruz), mathematicians working on celestial mechanics.', usedFor: ['figure-eight preset'] },

  // ---------------- Phase 4: thermochemistry ----------------
  { id: 'codata-key-values', kind: 'book', citation: 'Cox, J. D., Wagman, D. D. and Medvedev, V. A. (1989) CODATA Key Values for Thermodynamics. Hemisphere Publishing Corp., New York.', title: 'CODATA Key Values for Thermodynamics', authors: 'J. D. Cox, D. D. Wagman, V. A. Medvedev', year: 1989,
    institution: 'Committee on Data of the International Science Council (CODATA)', url: 'https://www.codata.info/resources/databases/key1.html',
    authorBio: 'An international CODATA task group of thermochemists; its recommended values are internally consistent and represent the consensus judgement of the group, with stated uncertainty limits.',
    usedFor: ['standard enthalpies of formation and entropies (priority source)', 'reaction thermochemistry'], datasets: ['thermochemistry'] },
  { id: 'nist-webbook', kind: 'database', citation: 'Linstrom, P. J. and Mallard, W. G. (eds.) NIST Chemistry WebBook, NIST Standard Reference Database Number 69. National Institute of Standards and Technology, Gaithersburg, MD.', title: 'NIST Chemistry WebBook (SRD 69)', authors: 'P. J. Linstrom, W. G. Mallard (eds.)', year: 2025,
    institution: 'National Institute of Standards and Technology (NIST)', url: 'https://webbook.nist.gov/chemistry/', doi: '10.18434/T4D303', license: 'NIST Standard Reference Data (cite per value)',
    authorBio: 'Edited by NIST chemists Peter Linstrom and William Mallard; the WebBook compiles evaluated data with the original literature reference given for every value (stored with each value in Voyager).',
    usedFor: ['enthalpies of formation/combustion and entropies of species absent from CODATA (per-value literature reference retained)'], datasets: ['thermochemistry'] },
  { id: 'nist-janaf', kind: 'standard', citation: 'Chase, M. W., Jr. (1998) NIST-JANAF Thermochemical Tables, 4th ed. Journal of Physical and Chemical Reference Data, Monograph 9.', title: 'NIST-JANAF Thermochemical Tables', authors: 'M. W. Chase, Jr.', year: 1998,
    institution: 'National Institute of Standards and Technology / American Chemical Society & AIP', url: 'https://janaf.nist.gov/', doi: '10.18434/T42S31',
    authorBio: 'Malcolm W. Chase Jr. of NIST compiled the fourth edition of the JANAF tables, the standard reference for high-temperature thermochemistry. Many WebBook values marked “Chase, 1998” come from it.',
    usedFor: ['gas-phase ΔfH° and S° of radicals, NOₓ, SO₃, O₃ (via the WebBook)'], datasets: ['thermochemistry'] },
  { id: 'manion-2002', kind: 'journal-article', citation: 'Manion, J. A. (2002) Evaluated enthalpies of formation of the stable closed shell C1 and C2 chlorinated hydrocarbons. Journal of Physical and Chemical Reference Data 31, 123–172.', title: 'Evaluated enthalpies of formation of C1 and C2 chlorinated hydrocarbons', authors: 'J. A. Manion', year: 2002,
    institution: 'NIST / Journal of Physical and Chemical Reference Data', url: 'https://doi.org/10.1063/1.1420703', doi: '10.1063/1.1420703',
    authorBio: 'Jeffrey A. Manion is a research chemist at NIST working on chemical kinetics and thermochemistry; the paper also re-evaluates key hydrocarbon reference values (CH₄, C₂H₆, C₂H₂).',
    usedFor: ['ΔfH° of methane, ethane and acetylene (via the WebBook)'], datasets: ['thermochemistry'] },

  // ---------------- Phase 4: chemistry ----------------
  { id: 'openstax-chemistry-2e', kind: 'book', citation: 'Flowers, P., Theopold, K., Langley, R. and Robinson, W. R. (2019) Chemistry 2e. OpenStax, Rice University.', title: 'Chemistry 2e', authors: 'P. Flowers, K. Theopold, R. Langley, W. R. Robinson', year: 2019,
    institution: 'OpenStax, Rice University', url: 'https://openstax.org/details/books/chemistry-2e', license: 'CC BY 4.0',
    authorBio: 'Peer-reviewed open textbook from OpenStax, a nonprofit educational initiative of Rice University; senior contributing authors include Paul Flowers (University of North Carolina at Pembroke) and Klaus Theopold (University of Delaware).',
    usedFor: ['stoichiometry, acid–base, precipitation and redox reactions'], datasets: ['reactions'] },
  { id: 'greenwood-earnshaw-1997', kind: 'book', citation: 'Greenwood, N. N. and Earnshaw, A. (1997) Chemistry of the Elements, 2nd ed. Butterworth-Heinemann.', title: 'Chemistry of the Elements', authors: 'N. N. Greenwood, A. Earnshaw', year: 1997,
    institution: 'Butterworth-Heinemann (Elsevier)', url: 'https://doi.org/10.1016/C2009-0-30414-6', doi: '10.1016/C2009-0-30414-6',
    authorBio: 'Norman Greenwood and Alan Earnshaw were inorganic chemists at the University of Leeds; their book is a standard reference for descriptive inorganic chemistry.', usedFor: ['industrial processes (Haber–Bosch, contact, Ostwald, reforming)'], datasets: ['reactions'] },
  { id: 'seinfeld-pandis-2016', kind: 'book', citation: 'Seinfeld, J. H. and Pandis, S. N. (2016) Atmospheric Chemistry and Physics: From Air Pollution to Climate Change, 3rd ed. Wiley.', title: 'Atmospheric Chemistry and Physics', authors: 'J. H. Seinfeld, S. N. Pandis', year: 2016,
    institution: 'Wiley', url: 'https://www.wiley.com/en-us/Atmospheric+Chemistry+and+Physics%3A+From+Air+Pollution+to+Climate+Change%2C+3rd+Edition-p-9781118947401',
    authorBio: 'John H. Seinfeld (California Institute of Technology) and Spyros N. Pandis (Carnegie Mellon University) are atmospheric chemists; their textbook is the standard graduate reference.', usedFor: ['stratospheric and tropospheric reactions'], datasets: ['reactions'] },
  { id: 'chapman-1930', kind: 'journal-article', citation: 'Chapman, S. (1930) A theory of upper-atmospheric ozone. Memoirs of the Royal Meteorological Society 3, 103–125.', title: 'A theory of upper-atmospheric ozone', authors: 'S. Chapman', year: 1930,
    institution: 'Royal Meteorological Society', url: 'https://www.rmets.org/',
    authorBio: 'Sydney Chapman (1888–1970) was a British mathematician and geophysicist who proposed the photochemical theory of the ozone layer.', usedFor: ['Chapman ozone cycle'], datasets: ['reactions'] },
  { id: 'molina-rowland-1974', kind: 'journal-article', citation: 'Molina, M. J. and Rowland, F. S. (1974) Stratospheric sink for chlorofluoromethanes: chlorine atom-catalysed destruction of ozone. Nature 249, 810–812.', title: 'Chlorine-catalysed destruction of ozone', authors: 'M. J. Molina, F. S. Rowland', year: 1974,
    institution: 'University of California, Irvine / Nature', url: 'https://doi.org/10.1038/249810a0', doi: '10.1038/249810a0',
    authorBio: 'Mario Molina and F. Sherwood Rowland (University of California, Irvine) shared the 1995 Nobel Prize in Chemistry with Paul Crutzen for work on ozone depletion.', usedFor: ['chlorine catalytic ozone cycle'], datasets: ['reactions'] },
  { id: 'tielens-2013', kind: 'journal-article', citation: 'Tielens, A. G. G. M. (2013) The molecular universe. Reviews of Modern Physics 85, 1021–1081.', title: 'The molecular universe', authors: 'A. G. G. M. Tielens', year: 2013,
    institution: 'American Physical Society', url: 'https://doi.org/10.1103/RevModPhys.85.1021', doi: '10.1103/RevModPhys.85.1021',
    authorBio: 'Xander Tielens is an astrochemist at Leiden Observatory, Leiden University.', usedFor: ['interstellar ion–molecule chemistry'], datasets: ['reactions'] },
  { id: 'gould-salpeter-1963', kind: 'journal-article', citation: 'Gould, R. J. and Salpeter, E. E. (1963) The interstellar abundance of the hydrogen molecule. I. Basic processes. The Astrophysical Journal 138, 393.', title: 'Interstellar abundance of the hydrogen molecule', authors: 'R. J. Gould, E. E. Salpeter', year: 1963,
    institution: 'The Astrophysical Journal', url: 'https://doi.org/10.1086/147654', doi: '10.1086/147654',
    authorBio: 'Edwin E. Salpeter (1924–2008) was a Cornell University astrophysicist (Salpeter initial mass function; triple-alpha process). Co-author affiliation not verified here.', usedFor: ['H₂ formation on dust grains'], datasets: ['reactions'] },
  { id: 'hollenbach-salpeter-1971', kind: 'journal-article', citation: 'Hollenbach, D. and Salpeter, E. E. (1971) Surface recombination of hydrogen molecules. The Astrophysical Journal 163, 155.', title: 'Surface recombination of hydrogen molecules', authors: 'D. Hollenbach, E. E. Salpeter', year: 1971,
    institution: 'The Astrophysical Journal', url: 'https://doi.org/10.1086/150754', doi: '10.1086/150754',
    authorBio: 'Edwin E. Salpeter (Cornell University) with David Hollenbach, who later worked on interstellar-medium astrophysics at NASA Ames Research Center.', usedFor: ['H₂ formation on dust grains'], datasets: ['reactions'] },
  { id: 'berg-biochemistry-2019', kind: 'book', citation: 'Berg, J. M., Tymoczko, J. L., Gatto, G. J. and Stryer, L. (2019) Biochemistry, 9th ed. W. H. Freeman / Macmillan Learning.', title: 'Biochemistry', authors: 'J. M. Berg, J. L. Tymoczko, G. J. Gatto, L. Stryer', year: 2019,
    institution: 'W. H. Freeman / Macmillan Learning', url: 'https://www.macmillanlearning.com/college/us/product/Biochemistry/p/1319114679',
    authorBio: 'Standard university biochemistry text originated by Lubert Stryer (Stanford University); Jeremy Berg is a former director of the U.S. National Institute of General Medical Sciences and John Tymoczko taught at Carleton College.', usedFor: ['net equations of photosynthesis, respiration, fermentation, ATP hydrolysis'], datasets: ['reactions'] },
  { id: 'zeebe-wolf-gladrow-2001', kind: 'book', citation: 'Zeebe, R. E. and Wolf-Gladrow, D. (2001) CO₂ in Seawater: Equilibrium, Kinetics, Isotopes. Elsevier Oceanography Series 65.', title: 'CO₂ in Seawater', authors: 'R. E. Zeebe, D. Wolf-Gladrow', year: 2001,
    institution: 'Elsevier', url: 'https://www.sciencedirect.com/bookseries/elsevier-oceanography-series/vol/65/suppl/C',
    authorBio: 'Richard Zeebe (University of Hawaiʻi at Mānoa) and Dieter Wolf-Gladrow (Alfred Wegener Institute for Polar and Marine Research) are specialists in marine carbonate chemistry.', usedFor: ['carbonate equilibria'], datasets: ['reactions'] },
];

const BY_ID = new Map(SOURCES.map((s) => [s.id, s]));
export const getSource = (id: string) => BY_ID.get(id);
export const sourcesForDataset = (dataset: string) => SOURCES.filter((s) => s.datasets?.includes(dataset));
