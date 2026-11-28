/**
 * Comparative planetary meteorology (Phase 22) → datasets/meteorology/planets.json
 *
 *   node --experimental-strip-types scripts/ingestion/curated-planets-atm.ts
 *
 * NSSDCA Planetary Fact Sheets "Atmosphere" sections (D. R. Williams; transcribed verbatim in
 * research/SOURCE_NOTES_PHASE22A.md), NASA Science planet, mission and Photojournal pages, NASA news releases, ESA
 * (Venus Express, Huygens), Wang et al. (2025, GRL) and Irwin et al. (2025 abstract) for internal heat — notes
 * 22A/22B. Each phenomenon is tagged OBS (observation), INF (inference), MOD (model) or EDU (educational summary).
 * Numeric fields (pBar, tK, H, mmw) are the printed values; for ranges the midpoint is used and the range text kept.
 */
import { writeDataset } from './lib/ingest.ts';

const data = {
 "version": "1.0.0",
 "factsheet": {
  "source": "nssdc-factsheet",
  "definitionsT": "Mean Temperature (C or F) - This is the average temperature over the whole planet's surface (or for the gas giants at the one bar level)",
  "definitionsP": "The surfaces of Jupiter, Saturn, Uranus, and Neptune are deep in the atmosphere and the location and pressures are not known."
 },
 "worlds": [
  {
   "id": "mercury",
   "name": "Mercury",
   "kind": "rocky",
   "ref": "surface",
   "pBar": 5e-15,
   "pText": "<~5 x 10^-15 bar (0.005 picobar)",
   "tK": 440,
   "tText": "440 K (167 C) (590-725 K, sunward side)",
   "H": null,
   "mmw": null,
   "winds": null,
   "major": [],
   "minorText": "Column abundances in 10^6 per cm^2: Sodium 12,000-200,000; Magnesium 100,000; Oxygen <40,000; Hydrogen 5000, Potassium 800-1300, Calcium 300-1000; Iron <300; Aluminum 15",
   "aerosols": null,
   "note": "(The atmosphere of Mercury is a surface bounded exosphere, essentially a vacuum. Values for some species can vary with local time or location, these are given as ranges.)",
   "updated": "11 January 2024",
   "phen": [
    {
     "k": "EDU",
     "s": "nasa-mercury-facts",
     "q": "During the day, temperatures on the surface can reach 800 degrees Fahrenheit (430 degrees Celsius). Because the planet has no atmosphere to retain that heat, nighttime temperatures on the surface can drop to minus 290 degrees Fahrenheit (minus 180 degrees Celsius)."
    },
    {
     "k": "EDU",
     "s": "nasa-mercury-facts",
     "q": "Instead of an atmosphere, Mercury possesses a thin exosphere made up of atoms blasted off the surface by the solar wind and striking meteoroids."
    },
    {
     "k": "OBS+INF",
     "s": "nasa-mercury-facts",
     "q": "Though Mercury's magnetic field at the surface has just 1% the strength of Earth's, it interacts with the magnetic field of the solar wind to sometimes create intense magnetic tornadoes that funnel the fast, hot solar wind plasma down to the surface of the planet."
    },
    {
     "k": "OBS+MOD",
     "s": "nasa-pj-mercury-tail",
     "q": "These models illustrate that the \"disappearance\" of Mercury's neutral sodium tail is consistent with the change in conditions."
    }
   ],
   "finding": "NASA’s Mercury facts page lists the exosphere as “mostly of oxygen, sodium, hydrogen, helium, and potassium”; the NSSDCA column abundances are largest for sodium and magnesium, with oxygen below 40,000 × 10⁶ cm⁻²."
  },
  {
   "id": "venus",
   "name": "Venus",
   "kind": "rocky",
   "ref": "surface",
   "pBar": 92,
   "pText": "92 bars",
   "tK": 737,
   "tText": "737 K (464 C)",
   "rho": 65,
   "H": 15.9,
   "mmw": 43.45,
   "winds": "0.3 to 1.0 m/s (surface)",
   "major": [
    [
     "CO₂",
     96.5
    ],
    [
     "N₂",
     3.5
    ]
   ],
   "minorText": "Sulfur Dioxide (SO_2) - 150; Argon (Ar) - 70; Water (H_2O) - 20; Carbon Monoxide (CO) - 17; Helium (He) - 12; Neon (Ne) - 7 (ppm)",
   "aerosols": "sulfuric acid clouds (NASA)",
   "massKg": 4.8e+20,
   "updated": "11 January 2024",
   "phen": [
    {
     "k": "EDU",
     "s": "nasa-venus-facts",
     "q": "Its thick atmosphere traps heat in a runaway greenhouse effect, making it the hottest planet in our solar system with surface temperatures hot enough to melt lead — about 872 degrees Fahrenheit (467 Celsius). And the atmospheric pressure at the surface is about 93 times what it is at sea level on Earth."
    },
    {
     "k": "EDU",
     "s": "nasa-venus-facts",
     "q": "The atmosphere is mostly carbon dioxide — the same gas drives the greenhouse effect on both Venus and Earth — with dense clouds composed of sulfuric acid."
    },
    {
     "k": "OBS",
     "s": "esa-venus-express-winds",
     "q": "Winds are so powerful and fast that they circumnavigate the planet in only four Earth days – the atmospheric 'super-rotation' – while the planet itself is very slow in comparison, taking 243 Earth days to perform one full rotation around its axis."
    },
    {
     "k": "OBS",
     "s": "nasa-venus-facts",
     "q": "At the tops of Venus' clouds, whipped around the planet by winds measured as high as 224 mph (360 kph), we find another transformation."
    }
   ],
   "finding": "NSSDCA: 92 bars and 737 K (464 °C); NASA’s Venus page: “about 93 times” Earth’s pressure and 467 °C. Cloud-top winds: NASA “as high as … 360 kph”, ESA “more than 400 kilometres per hour”."
  },
  {
   "id": "earth",
   "name": "Earth",
   "kind": "rocky",
   "ref": "surface",
   "pBar": 1.014,
   "pText": "1014 mb",
   "tK": 288,
   "tText": "288 K (15 C)",
   "rho": 1.217,
   "H": 8.5,
   "mmw": 28.97,
   "winds": "0 to 100 m/s",
   "major": [
    [
     "N₂",
     78.08
    ],
    [
     "O₂",
     20.95
    ],
    [
     "Ar",
     0.934
    ]
   ],
   "minorText": "Argon (Ar) - 9340; Carbon Dioxide (CO_2) - 420; Neon (Ne) - 18.18; Helium (He) - 5.24; CH_4 - 1.94; Krypton (Kr) - 1.14; Hydrogen (H_2) - 0.55 (ppm). Water is highly variable, typically makes up about 1%",
   "aerosols": "water vapour “highly variable, typically makes up about 1%” (NSSDCA)",
   "massKg": 5.1e+18,
   "updated": "15 November 2024",
   "phen": [
    {
     "k": "EDU",
     "s": "nasa-earth-energy-budget",
     "q": "The natural greenhouse effect raises the Earth's surface temperature to about 15 degrees Celsius on average—more than 30 degrees warmer than it would be if it didn't have an atmosphere."
    }
   ],
   "link": "/meteorology"
  },
  {
   "id": "mars",
   "name": "Mars",
   "kind": "rocky",
   "ref": "surface",
   "pBar": 0.00636,
   "pText": "6.36 mb at mean radius (variable from 4.0 to 8.7 mb depending on season)",
   "tK": 214,
   "tText": "~214 K (-59 C)",
   "rho": 0.016,
   "H": 11.0,
   "mmw": 43.49,
   "winds": "2-7 m/s (summer), 5-10 m/s (fall), 17-30 m/s (dust storm) (Viking Lander sites)",
   "major": [
    [
     "CO₂",
     95.1
    ],
    [
     "N₂",
     2.59
    ],
    [
     "Ar",
     1.94
    ],
    [
     "O₂",
     0.16
    ],
    [
     "CO",
     0.06
    ]
   ],
   "minorText": "Water (H_2O) - 210; Nitrogen Oxide (NO) - 100; Neon (Ne) - 2.5; HDO - 0.85; Krypton (Kr) - 0.3; Xenon (Xe) - 0.08 (ppm)",
   "aerosols": "dust (global dust storms; NASA)",
   "massKg": 2.5e+16,
   "updated": "19 May 2025",
   "phen": [
    {
     "k": "OBS",
     "s": "nasa-mars-dust-2018",
     "q": "Opportunity is currently hunkered down on Mars near the center of a storm bigger than North America and Russia combined. The dust-induced darkness means the solar-powered rover can't recharge its batteries."
    },
    {
     "k": "OBS",
     "s": "nasa-mars-dust-2018",
     "q": "But we've seen global dust storms in 1971, 1977, 1982, 1994, 2001 and 2007."
    },
    {
     "k": "OBS",
     "s": "nasa-opportunity-end",
     "q": "The solar-powered rover's final communication was received June 10."
    },
    {
     "k": "OBS+INF",
     "s": "nasa-mars-pressure-cycles",
     "q": "This happens because the south pole receives more and more sunlight, and carbon dioxide vaporizes off of the winter south polar cap. Each year the atmosphere grows and shrinks by about 30 percent due to this effect."
    },
    {
     "k": "OBS",
     "s": "nasa-maven-2015",
     "q": "MAVEN measurements indicate that the solar wind strips away gas at a rate of about 100 grams (equivalent to roughly 1/4 pound) every second."
    },
    {
     "k": "INF",
     "s": "nasa-maven-2017",
     "q": "The team made this determination from the latest results, which reveal that about 65 percent of the argon that was ever in the atmosphere has been lost to space."
    },
    {
     "k": "INF",
     "s": "nasa-mars-facts",
     "q": "Mars appears to have had a watery past, with ancient river valley networks, deltas, and lakebeds"
    }
   ],
   "finding": "NSSDCA’s Mars sheet gives ~214 K (−59 °C) average; its planetary comparison table gives −65 °C."
  },
  {
   "id": "jupiter",
   "name": "Jupiter",
   "kind": "giant",
   "ref": "1 bar",
   "pBar": 1,
   "pText": ">>1000 bars (no solid surface); values at 1 bar",
   "tK": 165,
   "t01K": 112,
   "tText": "165 K (-108 C) at 1 bar; 112 K (-161 C) at 0.1 bar",
   "rho": 0.16,
   "H": 27,
   "mmw": 2.22,
   "winds": "Up to 150 m/s (<30 degrees latitude); Up to 40 m/s (>30 degrees latitude)",
   "major": [
    [
     "H₂",
     89.8
    ],
    [
     "He",
     10.2
    ]
   ],
   "minorText": "Methane (CH_4) - 3000 (1000); Ammonia (NH_3) - 260 (40); Hydrogen Deuteride (HD) - 28 (10); Ethane (C_2H_6) - 5.8 (1.5); Water (H_2O) - 4 (ppm)",
   "aerosols": "Ammonia ice, water ice, ammonia hydrosulfide",
   "updated": "2 October 2024",
   "internal": 1.13,
   "phen": [
    {
     "k": "EDU",
     "s": "nasa-jupiter-facts",
     "q": "The dark orange stripes are called belts, while the lighter bands are called zones, and they flow east and west in opposite directions."
    },
    {
     "k": "OBS",
     "s": "nasa-hubble-grs-2014",
     "q": "Historic observations as far back as the late 1800s gauged the GRS to be as big as 25,500 miles on its long axis. The NASA Voyager 1 and Voyager 2 flybys of Jupiter in 1979 measured the GRS to be 14,500 miles across."
    },
    {
     "k": "OBS",
     "s": "nasa-hubble-grs-2014",
     "q": "Recent Hubble Space Telescope observations confirm that the Great Red Spot (GRS) is now approximately 10,250 miles across, the smallest diameter we've ever measured"
    },
    {
     "k": "OBS",
     "s": "nasa-hubble-grs-2024",
     "q": "Hubble's new observations of the famous red storm, collected 90 days between December 2023 to March 2024, reveal that the GRS is not as stable as it might look."
    },
    {
     "k": "OBS+INF",
     "s": "nasa-jupiter-facts",
     "q": "Juno previously discovered that these winds, or jet streams, reach depths of about 2,000 miles (roughly 3,200 kilometers)."
    }
   ],
   "grs": [
    [
     1880,
     25500,
     "late 1800s (historic)"
    ],
    [
     1979,
     14500,
     "Voyager"
    ],
    [
     1995,
     13020,
     "Hubble"
    ],
    [
     2009,
     11130,
     "Hubble"
    ],
    [
     2014,
     10250,
     "Hubble"
    ],
    [
     2017,
     10000,
     "Juno (16,000 km)"
    ]
   ],
   "grsSources": [
    "nasa-hubble-grs-2014",
    "nasa-juno-grs-2017"
   ]
  },
  {
   "id": "saturn",
   "name": "Saturn",
   "kind": "giant",
   "ref": "1 bar",
   "pBar": 1,
   "pText": ">>1000 bars (no solid surface); values at 1 bar",
   "tK": 134,
   "t01K": 84,
   "tText": "134 K (-139 C) at 1 bar; 84 K (-189 C) at 0.1 bar",
   "rho": 0.19,
   "H": 59.5,
   "mmw": 2.07,
   "winds": "Up to 400 m/s (<30 degrees latitude); Up to 150 m/s (>30 degrees latitude)",
   "major": [
    [
     "H₂",
     96.3
    ],
    [
     "He",
     3.25
    ]
   ],
   "minorText": "Methane (CH_4) - 4500 (2000); Ammonia (NH_3) - 125 (75); Hydrogen Deuteride (HD) - 110 (58); Ethane (C_2H_6) - 7 (1.5) (ppm)",
   "aerosols": "Ammonia ice, water ice, ammonia hydrosulfide",
   "updated": "18 March 2025",
   "internal": 1.39,
   "phen": [
    {
     "k": "OBS",
     "s": "nasa-saturn-facts",
     "q": "Spanning about 20,000 miles (30,000 kilometers) across, the hexagon is a wavy jet stream of 200-mile-per-hour winds (about 322 kilometers per hour) with a massive, rotating storm at the center."
    },
    {
     "k": "OBS",
     "s": "nasa-cassini-storm-2011",
     "q": "This storm is the largest and most intense observed on Saturn by NASA's Voyager or Cassini spacecraft."
    },
    {
     "k": "OBS",
     "s": "nasa-cassini-top10",
     "q": "Late in 2010, Saturn's relatively tranquil atmosphere erupted with a storm of gigantic proportions. Typically a 30-year storm, this one arrived 10 years early"
    },
    {
     "k": "OBS",
     "s": "nasa-saturn-facts",
     "q": "recent observations with NASA's Hubble Space Telescope revealed a giant, evolving, 10-sided — or decagonal — atmospheric wave encircling Saturn's south pole, according to a research study published in September 2026."
    }
   ],
   "finding": "NSSDCA gives winds up to 400 m/s; NASA’s Saturn page gives 500 m/s at the equator."
  },
  {
   "id": "uranus",
   "name": "Uranus",
   "kind": "giant",
   "ref": "1 bar",
   "pBar": 1,
   "pText": ">>1000 bars (no solid surface); values at 1 bar",
   "tK": 76,
   "t01K": 53,
   "tText": "76 K (-197 C) at 1 bar; 53 K (-220 C) at 0.1 bar",
   "rho": 0.42,
   "H": 27.7,
   "mmw": 2.64,
   "winds": "0-250 m/s",
   "major": [
    [
     "H₂",
     82.5
    ],
    [
     "He",
     15.2
    ],
    [
     "CH₄",
     2.3
    ]
   ],
   "minorText": "Hydrogen Deuteride (HD) - 148 (ppm)",
   "aerosols": "Ammonia ice, water ice, ammonia hydrosulfide, methane ice(?)",
   "updated": "2 October 2024",
   "internal": 0.1252,
   "phen": [
    {
     "k": "EDU",
     "s": "nasa-uranus-facts",
     "q": "Uranus is the only planet whose equator is nearly at a right angle to its orbit, with a tilt of 97.77 degrees."
    },
    {
     "k": "EDU",
     "s": "nasa-uranus-facts",
     "q": "For nearly a quarter of each Uranian year, the Sun shines directly over each pole, plunging the other half of the planet into a 21-year-long, dark winter."
    },
    {
     "k": "EDU",
     "s": "nasa-hubble-uranus-neptune-2019",
     "q": "Atmospheric methane absorbs red light but allows blue-green light to be scattered back into space, giving each planet a cyan hue."
    },
    {
     "k": "OBS",
     "s": "nasa-hubble-uranus-neptune-2019",
     "q": "This Hubble Space Telescope Wide Field Camera 3 image of Uranus, taken in November 2018, reveals a vast, bright stormy cloud cap across the planet's north pole."
    }
   ],
   "finding": "NSSDCA winds 0–250 m/s; NASA’s Uranus page “up to 560 miles per hour (900 kilometers per hour)”. Emitted ÷ absorbed: 1.06 ± 0.08 (Voyager 2, 1990), 1.13 ± 0.03 (Wang et al. 2025), 1.15 ± 0.06 (Irwin et al., abstract)."
  },
  {
   "id": "neptune",
   "name": "Neptune",
   "kind": "giant",
   "ref": "1 bar",
   "pBar": 1,
   "pText": ">>1000 bars (no solid surface); values at 1 bar",
   "tK": 72,
   "t01K": 55,
   "tText": "72 K (-201 C) at 1 bar; 55 K (-218 C) at 0.1 bar",
   "rho": 0.45,
   "H": 19.7,
   "Htext": "19.1 - 20.3 km",
   "mmw": 2.61,
   "mmwText": "2.53 - 2.69",
   "winds": "0-580 m/s",
   "major": [
    [
     "H₂",
     80.0
    ],
    [
     "He",
     19.0
    ],
    [
     "CH₄",
     1.5
    ]
   ],
   "minorText": "Hydrogen Deuteride (HD) - 192; Ethane (C_2H_6) - 1.5 (ppm)",
   "aerosols": "Ammonia ice, water ice, ammonia hydrosulfide, methane ice(?)",
   "updated": "3 October 2024",
   "internal": 1.62,
   "phen": [
    {
     "k": "OBS",
     "s": "nasa-neptune-facts",
     "q": "Neptune is our solar system's windiest world. … These winds whip clouds of frozen methane across the planet at speeds of more than 1,200 miles per hour (2,000 kilometers per hour)."
    },
    {
     "k": "OBS",
     "s": "nasa-hubble-neptune-2019",
     "q": "In the Voyager image, a storm known as the Great Dark Spot is seen at the center. It is about 13,000 km by 6,600 km (approximately 8,000 miles by 4,100 miles) in size"
    },
    {
     "k": "OBS",
     "s": "nasa-hubble-neptune-2019",
     "q": "Hubble's photos revealed that both the Earth-sized Great Dark Spot and the smaller Dark Spot 2 had vanished."
    },
    {
     "k": "OBS+INF",
     "s": "nasa-hubble-uranus-neptune-2019",
     "q": "dark spots appear every four to six years at different latitudes and disappear after about two years."
    }
   ],
   "finding": "NSSDCA winds up to 580 m/s; NASA: “more than … 2,000 kilometers per hour” (556 m/s). Scale height and molecular weight are given as ranges; midpoints are used for comparison."
  },
  {
   "id": "pluto",
   "name": "Pluto",
   "kind": "dwarf",
   "ref": "surface",
   "pBar": 1.3e-05,
   "pText": "~13 microbar",
   "tK": 31,
   "tText": "24 - 38 K (-247 - -233 C)",
   "H": 18,
   "Htext": "~18 km lower atmosphere, ~50 km above 30 km",
   "mmw": 28,
   "winds": null,
   "major": [
    [
     "N₂",
     99
    ],
    [
     "CH₄",
     0.5
    ],
    [
     "CO",
     0.05
    ]
   ],
   "minorText": "trace HCN, C_2H_x hydrocarbons",
   "aerosols": "blue photochemical hazes (tholins)",
   "updated": "11 January 2024",
   "phen": [
    {
     "k": "EDU",
     "s": "nasa-pluto-facts",
     "q": "Pluto has a thin, tenuous atmosphere that expands when it comes closer to the Sun and collapses as it moves farther away – similar to a comet."
    },
    {
     "k": "OBS+INF",
     "s": "nasa-pluto-blue-rays",
     "q": "The haze layers extend to altitudes of over 120 miles (200 kilometers)."
    },
    {
     "k": "OBS",
     "s": "nasa-new-horizons-pressure",
     "q": "the gas pressure at Pluto's surface was only 1/100-thousandth that of the pressure on the surface of Earth."
    },
    {
     "k": "OBS+INF",
     "s": "nasa-pj-pluto-occultation",
     "q": "the escape rate of nitrogen is about 1,000 times lower than expected before the flyby."
    }
   ],
   "finding": "Surface pressure: ~13 µbar (NSSDCA), about 11 µbar (New Horizons team abstract), 1/100,000 of Earth’s (NASA 2015). The temperature shown is the midpoint of NSSDCA’s 24–38 K."
  },
  {
   "id": "titan",
   "name": "Titan",
   "kind": "moon",
   "ref": "surface",
   "pBar": 1.52,
   "pText": "1.5 atmospheres (NASA Voyager fact sheet)",
   "tK": 94,
   "tText": "94 kelvins (Huygens measured 94 °K)",
   "H": null,
   "mmw": null,
   "winds": "up to 450 km/h above 120 km (Huygens)",
   "major": [
    [
     "N₂",
     95
    ],
    [
     "CH₄",
     5
    ]
   ],
   "minorText": "small amounts of other carbon-rich compounds",
   "aerosols": "methane clouds; haze down to the surface",
   "updated": "",
   "phen": [
    {
     "k": "EDU",
     "s": "nasa-titan-facts",
     "q": "It is the sole other place in the solar system known to have an earthlike cycle of liquids raining from clouds, flowing across its surface, filling lakes and seas, and evaporating back into the sky (akin to Earth's water cycle)."
    },
    {
     "k": "OBS",
     "s": "nasa-huygens-2007",
     "q": "At the surface of Titan, Huygens measured the temperature to be 94 °K (-179 °C) with a humidity of 45 percent."
    },
    {
     "k": "OBS",
     "s": "esa-huygens-highlights",
     "q": "It reached the upper layer of Titan's atmosphere on 14 January 2005 and landed on the surface after a parachute descent of 2 hours and 28 minutes."
    },
    {
     "k": "INF",
     "s": "nasa-titan-facts",
     "q": "Because sunlight continuously breaks down methane in Titan's atmosphere, some source must be replenishing it or it would be depleted over time."
    }
   ],
   "finding": "Pressure: “1.5 atmospheres” (NASA Voyager fact sheet) vs “about 60 percent greater than on Earth” (NASA Titan facts). Huygens descent: 2 h 28 min (ESA) vs 2 h 27 min (NASA). 1.5 atm = 1.52 bar (our conversion).",
   "pSource": "nasa-voyager-factsheet",
   "tSource": "nasa-huygens-2007"
  },
  {
   "id": "triton",
   "name": "Triton",
   "kind": "moon",
   "ref": "surface",
   "pBar": 1.4e-05,
   "pText": "about 14 microbars, 1/70,000th the surface pressure on Earth",
   "tK": 38,
   "tText": "about 38 kelvins",
   "H": null,
   "mmw": null,
   "winds": null,
   "major": [
    [
     "N₂",
     null
    ]
   ],
   "minorText": "mainly nitrogen with small amounts of methane",
   "aerosols": "nitrogen-ice clouds may form a few kilometres up",
   "updated": "",
   "phen": [
    {
     "k": "OBS",
     "s": "nasa-voyager-factsheet",
     "q": "Voyager 2 images showed active geyser-like eruptions spewing invisible nitrogen gas and dark dust particles several kilometers into the tenuous atmosphere."
    },
    {
     "k": "OBS+INF",
     "s": "nasa-triton",
     "q": "Triton's thin atmosphere is composed mainly of nitrogen with small amounts of methane. This atmosphere most likely originates from Triton's volcanic activity, which is driven by seasonal heating by the Sun."
    }
   ],
   "pSource": "nasa-voyager-factsheet",
   "tSource": "nasa-voyager-factsheet"
  }
 ],
 "more": {
  "io": {
   "name": "Io",
   "phen": [
    {
     "k": "OBS",
     "s": "nasa-io",
     "q": "Jupiter's moon Io is the most volcanically active world in the solar system, with hundreds of volcanoes"
    },
    {
     "k": "OBS",
     "s": "nasa-hubble-io-1992",
     "q": "The atmosphere may also be patchy with very dense regions lying over volcanoes or above areas of surface frost."
    }
   ]
  },
  "europa": {
   "name": "Europa",
   "phen": [
    {
     "k": "OBS (tentative)",
     "s": "nasa-hubble-europa-2016",
     "q": "Astronomers using NASA's Hubble Space Telescope have imaged what may be water vapor plumes erupting off the surface of Jupiter's moon Europa."
    }
   ]
  },
  "enceladus": {
   "name": "Enceladus",
   "phen": [
    {
     "k": "OBS",
     "s": "nasa-enceladus",
     "q": "The eruptions appear to be continuous, generating an enormous halo of fine ice dust around Enceladus, which supplies material to Saturn's E-ring."
    }
   ]
  },
  "wasp39b": {
   "name": "WASP-39 b (exoplanet)",
   "phen": [
    {
     "k": "OBS",
     "s": "nasa-webb-wasp39-co2",
     "q": "NASA's James Webb Space Telescope has captured the first clear evidence for carbon dioxide in the atmosphere of a planet outside the solar system."
    },
    {
     "k": "OBS",
     "s": "nasa-webb-wasp39-co2",
     "q": "a small hill between 4.1 and 4.6 microns presents the first clear, detailed evidence for carbon dioxide ever detected in a planet outside the solar system."
    },
    {
     "k": "OBS+INF",
     "s": "nasa-webb-wasp39-so2",
     "q": "Among the unprecedented revelations is the first detection in an exoplanet atmosphere of sulfur dioxide (SO2), a molecule produced from chemical reactions triggered by high-energy light from the planet's parent star."
    }
   ]
  }
 },
 "internal": {
  "source": "wang-2025-uranus",
  "q": "Thus, we conclude that Uranus does have internal heat flux, although the ratio of internal heat flux to absorbed solar power (12.52%) is significantly lower than those of other giant planets (i.e., 113%, 139%, and 162% of absorbed solar power for Jupiter, Saturn, and Neptune, respectively)",
  "q2": "Jupiter, Saturn and Neptune all emit much more power thermally (Pout) than they absorb from the Sun (Pin) with Pout/Pin having values of 1.7 to 2.6.",
  "s2": "irwin-2025-uranus-abstract"
 },
 "escape": {
  "source": "nasa-maven-presskit",
  "q": "In order to escape, gas molecules must attain sufficient energy to break free of the planet's gravity.",
  "q2": "The higher-energy atoms at the top of the atmosphere may have enough kinetic energy to jump right out of the atmosphere. This process, dubbed \"Jeans escape\" after English astronomer James Jeans, may account for the loss of most neutral (non-ionized) hydrogen from Mars."
 }
};
writeDataset('datasets/meteorology/planets.json', data, { dataset: 'planets-atmosphere', version: '1.0.0', records: data.worlds.length * 10,
  sources: [{ institution: 'NASA NSSDCA Planetary Fact Sheets', url: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/', license: 'U.S. government work', notes: 'atmosphere sections, 2024–2025 updates' },
    { institution: 'NASA Science, NASA, ESA; Wang et al. 2025 (GRL, CC BY-NC-ND)', url: 'https://science.nasa.gov/solar-system/', license: 'U.S. government works; ESA content ©ESA (quoted); CC BY-NC-ND (quoted)', notes: 'phenomena, missions, internal heat' }],
  adapter: 'scripts/ingestion/curated-planets-atm.ts', warnings: ['Venus 92 bar/464 °C (NSSDCA) vs 93×/467 °C (NASA page).', 'Mars average −59 °C (Mars sheet) vs −65 °C (comparison table).', 'Pluto 13 vs 11 µbar vs 1/100,000 Earth.', 'Titan 1.5 atm vs “60 percent greater”.', 'Uranus Pout/Pin 1.06 vs 1.13 vs 1.15.', 'Giant-planet Pout/Pin for Jupiter, Saturn derived from Wang et al.’s internal/absorbed percentages.', 'NASA page errors not used: Uranus “Great Dark Spot 1986”, Enceladus 800 mph = 400 m/s, Juno 200 mi = 300 km.'] });
