/**
 * Waves and tissue, microscopy and medical imaging (Phase 13, Gates 13.4–13.7) → datasets/biology/imaging.json
 *
 *   node --experimental-strip-types scripts/ingestion/curated-imaging.ts
 *
 * Values transcribed 2026-11-28 (raw downloads kept outside the repository):
 *  - NIST SRD 126 (Hubbell & Seltzer, v1.4): μ/ρ at eight energies for five materials, densities from Tables 1–2.
 *    A copyrighted compilation (15 U.S.C. §290e): only this selection is used, with NIST's required notice.
 *  - IFAC-CNR (Andreuccetti, Fossi & Petrucci) four-Cole–Cole parameters for seven tissues (free for scientific use,
 *    site CC BY 4.0); τ converted from ps/ns/µs/ms to seconds.
 *  - NBS SP 525 (1979) Table 1, p. 24 (Johnston et al.), read on the page image: speed of sound and attenuation.
 *  - USAF Radiofrequency Radiation Dosimetry Handbook (1986) Table 3.4 (IFAC copy): skin depth and SAR (images read).
 *  - 47 CFR §1.1310 (2024, govinfo); FDA ultrasound guidance (2023) and MRI criteria (2014); FDA web pages.
 *  - CODATA 2022 (NIST CUU): proton gyromagnetic ratios.
 *  - Abbe (1873) pp. 455–456; de Broglie & Flint (1930) p. 97; Rayleigh (1896) p. 82 — page images.
 *  - NCI NICE facility page: electron-microscope accelerating voltages.
 */
import { writeDataset } from './lib/ingest.ts';

const data = {
 "version": "1.0.0",
 "xray": {
  "source": "nist-srd126",
  "energiesKeV": [
   20,
   30,
   40,
   50,
   60,
   80,
   100,
   150
  ],
  "notice": "Copyright protection on this compilation of data has been secured by the Secretary of the U.S. Department of Commerce on behalf of the United States in the United States and all countries that are parties to the Universal Copyright Convention, pursuant to Section 290(e) of Title 15 of the United States Code.",
  "materials": [
   {
    "id": "softTissue",
    "label": "Soft tissue (ICRU-44)",
    "rho": 1.06,
    "muRho": [
     0.823,
     0.379,
     0.2688,
     0.2264,
     0.2048,
     0.1823,
     0.1693,
     0.1492
    ]
   },
   {
    "id": "adipose",
    "label": "Adipose tissue (ICRU-44)",
    "rho": 0.95,
    "muRho": [
     0.5677,
     0.3063,
     0.2396,
     0.2123,
     0.1974,
     0.18,
     0.1688,
     0.15
    ]
   },
   {
    "id": "water",
    "label": "Water, liquid",
    "rho": 1.0,
    "muRho": [
     0.8096,
     0.3756,
     0.2683,
     0.2269,
     0.2059,
     0.1837,
     0.1707,
     0.1505
    ]
   },
   {
    "id": "corticalBone",
    "label": "Cortical bone (ICRU-44)",
    "rho": 1.92,
    "muRho": [
     4.001,
     1.331,
     0.6655,
     0.4242,
     0.3148,
     0.2229,
     0.1855,
     0.148
    ]
   },
   {
    "id": "lead",
    "label": "Lead (Z = 82)",
    "kEdge": { "keV": 88.0045, "below": 1.91, "above": 7.683 },
    "rho": 11.35,
    "muRho": [
     86.36,
     30.32,
     14.36,
     8.041,
     5.021,
     2.419,
     5.549,
     2.014
    ]
   }
  ],
  "equation": "I/I₀ = exp[−(μ/ρ)x]",
  "massThickness": "x = ρt"
 },
 "ultrasound": {
  "source": "nbs-sp525",
  "table": "Table 1. Ultrasonic attenuation and velocity for tissues of various water, protein and collagen content.",
  "where": "p. 24",
  "tissues": [
   {
    "id": "water",
    "label": "Water (20 °C)",
    "v": [
     1483,
     1483
    ],
    "att": "0.0003",
    "rho": 1.0
   },
   {
    "id": "blood",
    "label": "Blood",
    "v": [
     1571,
     1571
    ],
    "att": "0.02",
    "rho": 1.06
   },
   {
    "id": "fat",
    "label": "Fat",
    "v": [
     1410,
     1479
    ],
    "att": "0.04 - 0.09",
    "rho": 0.95,
    "rhoNote": "NIST adipose tissue (ICRU-44)"
   },
   {
    "id": "brain",
    "label": "Brain",
    "v": [
     1510,
     1565
    ],
    "att": "0.09 - 0.13",
    "rho": 1.04
   },
   {
    "id": "muscle",
    "label": "Striated muscle",
    "v": [
     1568,
     1603
    ],
    "att": "0.18 - 0.25",
    "rho": 1.05
   },
   {
    "id": "liver",
    "label": "Liver",
    "v": [
     1550,
     1607
    ],
    "att": "0.07 0.13",
    "rho": null
   },
   {
    "id": "kidney",
    "label": "Kidney",
    "v": [
     1558,
     1568
    ],
    "att": "0.09 - 0.13",
    "rho": null
   },
   {
    "id": "heart",
    "label": "Heart",
    "v": [
     1572,
     1572
    ],
    "att": "0.25 - 0.38",
    "rho": null
   },
   {
    "id": "lens",
    "label": "Lens",
    "v": [
     1616,
     1616
    ],
    "att": "0.10 - 0.20",
    "rho": null
   },
   {
    "id": "cartilage",
    "label": "Cartilage",
    "v": [
     1665,
     1665
    ],
    "att": "0.58",
    "rho": null
   },
   {
    "id": "tendon",
    "label": "Tendon",
    "v": [
     1750,
     1750
    ],
    "att": "0.54 (against grain)",
    "rho": null
   }
  ],
  "rayleigh": {
   "source": "rayleigh-1896",
   "eq": "φ″ : φ′ = (ρ₁/ρ − V/V₁) : (ρ₁/ρ + V/V₁)",
   "noReflection": "so that there is no reflection, if ρ₁ : ρ = V : V₁",
   "intensity": "The ratio of intensities, which is as the square of the amplitudes, is ·3402 : 1, so that about one-third part is reflected."
  },
  "fda": {
   "source": "fda-ultrasound-guidance-2023",
   "attenuation": "the average ultrasonic attenuation is assumed to be a 0.3 dBcm-1MHz-1 along the beam axis in the body",
   "limits": "derated ISPTA ≤720 mW/cm2, and either MI ≤1.9 or derated ISPPA ≤190 W/cm2"
  },
  "fdaPage": {
   "source": "fda-ultrasound-imaging",
   "quote": "Ultrasound imaging (sonography) uses high-frequency sound waves to view inside the body.",
   "quote2": "Unlike X-ray imaging, there is no ionizing radiation exposure associated with ultrasound imaging."
  }
 },
 "mri": {
  "source": "codata-2022",
  "gammaShieldedMHzT": 42.57638543,
  "gammaMHzT": 42.577478461,
  "fdaPage": {
   "source": "fda-mri",
   "quote": "MRI scanners use strong magnetic fields and radio waves (radiofrequency energy) to make images. The signal in an MR image comes mainly from the protons in fat and water molecules in the body."
  },
  "fdaLimits": {
   "source": "fda-mri-significant-risk-2014",
   "staticAdultT": 8,
   "staticNeonateT": 4,
   "sarWholeBody": 4,
   "sarWholeBodyMin": 15,
   "sarHead": 3.2,
   "sarHeadMin": 10
  }
 },
 "tissue": {
  "source": "ifac-gabriel",
  "eq": "ε̂(ω) = ε∞ + Σₙ Δεₙ/(1 + (jωτₙ)^(1−αₙ)) + σᵢ/(jωε₀)",
  "caution": "It can be used with confidence for frequencies above 1 MHz.",
  "params": {
   "Blood": {
    "epsInf": 4.0,
    "sigmaI": 0.7,
    "terms": [
     [
      56.0,
      8.377e-12,
      0.1
     ],
     [
      5200.0,
      1.3263e-07,
      0.1
     ],
     [
      0.0,
      0.00015916,
      0.2
     ],
     [
      0.0,
      0.015915,
      0.0
     ]
    ]
   },
   "Bone cortical": {
    "epsInf": 2.5,
    "sigmaI": 0.02,
    "terms": [
     [
      10.0,
      1.3263e-11,
      0.2
     ],
     [
      180.0,
      7.9577e-08,
      0.2
     ],
     [
      5000.0,
      0.00015916,
      0.2
     ],
     [
      100000.0,
      0.015915,
      0.0
     ]
    ]
   },
   "Brain grey matter": {
    "epsInf": 4.0,
    "sigmaI": 0.02,
    "terms": [
     [
      45.0,
      7.958e-12,
      0.1
     ],
     [
      400.0,
      1.5915e-08,
      0.15
     ],
     [
      200000.0,
      0.0001061,
      0.22
     ],
     [
      45000000.0,
      0.005305,
      0.0
     ]
    ]
   },
   "Fat": {
    "epsInf": 2.5,
    "sigmaI": 0.01,
    "terms": [
     [
      3.0,
      7.958e-12,
      0.2
     ],
     [
      15.0,
      1.5915e-08,
      0.1
     ],
     [
      33000.0,
      0.00015916,
      0.05
     ],
     [
      10000000.0,
      0.007958,
      0.01
     ]
    ]
   },
   "Liver": {
    "epsInf": 4.0,
    "sigmaI": 0.02,
    "terms": [
     [
      39.0,
      8.842e-12,
      0.1
     ],
     [
      6000.0,
      5.3052e-07,
      0.2
     ],
     [
      50000.0,
      2.2736e-05,
      0.2
     ],
     [
      30000000.0,
      0.015915,
      0.05
     ]
    ]
   },
   "Muscle": {
    "epsInf": 4.0,
    "sigmaI": 0.2,
    "terms": [
     [
      50.0,
      7.234e-12,
      0.1
     ],
     [
      7000.0,
      3.5368e-07,
      0.1
     ],
     [
      1200000.0,
      0.00031831,
      0.1
     ],
     [
      25000000.0,
      0.002274,
      0.0
     ]
    ]
   },
   "Skin wet": {
    "epsInf": 4.0,
    "sigmaI": 0.0004,
    "terms": [
     [
      39.0,
      7.958e-12,
      0.1
     ],
     [
      280.0,
      7.9577e-08,
      0.0
     ],
     [
      30000.0,
      1.592e-06,
      0.16
     ],
     [
      30000.0,
      0.001592,
      0.2
     ]
    ]
   }
  },
  "handbook": {
   "source": "usaf-rf-dosimetry-1986",
   "skinDepth": "δ = 67.52/f × [√((ε′)² + (ε″)²) − ε′]^(−1/2), f in MHz",
   "sar": "SAR = σ|E|²/ρm",
   "cPrinted": "v = 3 x 10^8 m/s in free space"
  },
  "fcc": {
   "source": "cfr-47-1-1310",
   "definition": "SAR is a measure of the rate of energy absorption due to exposure to RF electromagnetic energy.",
   "general": "The SAR limits for general population/uncontrolled exposure are 0.08 W/kg, as averaged over the whole body, and a peak spatial-average SAR of 1.6 W/kg, averaged over any 1 gram of tissue (defined as a tissue volume in the shape of a cube).",
   "occupational": "The SAR limits for occupational/controlled exposure are 0.4 W/kg, as averaged over the whole body, and a peak spatial-average SAR of 8 W/kg, averaged over any 1 gram of tissue (defined as a tissue volume in the shape of a cube).",
   "generalWB": 0.08,
   "general1g": 1.6,
   "occWB": 0.4,
   "occ1g": 8
  },
  "densities": {
   "Muscle": 1050,
   "Fat": 950,
   "Blood": 1060,
   "Brain grey matter": 1040,
   "Bone cortical": 1920,
   "Skin wet": null,
   "Liver": null
  }
 },
 "microscopy": {
  "abbe": {
   "source": "abbe-1873",
   "where": "pp. 455–456",
   "de": "Irgend eine bestimmte Farbe zu Grunde gelegt, ergiebt sich der betreffende Minimalwerth für rein centrale Beleuchtung durch Division der Wellenlänge mit dem Sinus des halben Oeffnungswinkels, für den höchsten zulässigen Grad schiefer Beleuchtung aber bei jedem Oeffnungswinkel genau halb so gross",
   "en": "Taking any particular colour, the corresponding minimum for purely central illumination is found by dividing the wavelength by the sine of half the aperture angle; for the highest admissible degree of oblique illumination it is, at every aperture angle, exactly half as large."
  },
  "dbf": {
   "source": "debroglie-1930",
   "where": "p. 97",
   "eq24": "λ = h/√(2meP(1 + eP/2mc²))",
   "small": "The term eP/2mc² is always small"
  },
  "nci": {
   "source": "nci-nice-cryoem",
   "instruments": [
    {
     "name": "Titan Krios",
     "kV": 300
    },
    {
     "name": "Glacios",
     "kV": 200
    },
    {
     "name": "Tecnai 12",
     "kV": 120
    }
   ]
  }
 }
};

writeDataset('datasets/biology/imaging.json', data, {
  dataset: 'imaging',
  version: '1.0.0',
  records: 42,
  sources: [
    { institution: 'NIST Standard Reference Database 126 (Hubbell & Seltzer, v1.4, 2004)', url: 'https://doi.org/10.18434/T4D01F', license: 'copyrighted compilation (15 U.S.C. §290e): a selection of 42 values only, with the required notice', notes: 'X-ray mass attenuation coefficients and densities' },
    { institution: 'IFAC-CNR, dielectric properties of body tissues (Andreuccetti, Fossi & Petrucci 1997; Gabriel 1996)', url: 'https://webnir.eu/04-Dosimetry/04-Gabriel.php?lang=gb', license: '“may be used freely for scientific purposes”; site CC BY 4.0', notes: 'four-Cole–Cole parameters for seven tissues' },
    { institution: 'NBS Special Publication 525 (1979), Table 1', url: 'https://doi.org/10.6028/NBS.SP.525', notes: 'ultrasonic velocity and attenuation in tissues (page image)' },
    { institution: 'USAF Radiofrequency Radiation Dosimetry Handbook, 4th ed. (1986)', url: 'https://niremf.ifac.cnr.it/docs/HANDBOOK/tbl-34.htm', notes: 'skin depth and SAR (Table 3.4)' },
    { institution: 'U.S. FDA; 47 CFR §1.1310; CODATA 2022 (NIST)', url: 'https://www.govinfo.gov/app/details/CFR-2024-title47-vol1/CFR-2024-title47-vol1-sec1-1310', license: 'U.S. government works', notes: 'exposure limits and constants' },
  ],
  adapter: 'scripts/ingestion/curated-imaging.ts',
  warnings: ['NIST SRD 126 is not public domain: only selected values.', 'Gabriel equation (3) read in the IFAC page text, not on the 1996 report page image.', 'Ultrasound speeds are printed ranges; the view uses the midpoint (derived) and shows the range.'],
});
