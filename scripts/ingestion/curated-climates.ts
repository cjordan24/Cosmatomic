/**
 * Regional climates (Phase 21, Gate 21.3) → datasets/meteorology/climates.json
 *
 *   node --experimental-strip-types scripts/ingestion/curated-climates.ts
 *
 * Station normals: NOAA NCEI U.S. Climate Normals 1991–2020 (v1.0.1), via the NCEI Access Data Service API
 * (MLY-TAVG/TMAX/TMIN/PRCP-NORMAL; the bulk /data/ files are robots-disallowed), values as recorded in
 * research/SOURCE_NOTES_PHASE21C.md (°F and inches; the API's metric option leaves TAVG in °F). Köppen criteria:
 * Peel et al. (2007) Table 1 (HESS, CC BY-NC-SA 2.5). Explanations: NWS glossary and Albuquerque, USGS, NOAA Ocean
 * Exploration, U.S. EPA, NASA Earth Observatory, U.S. National Park Service. Beck et al. (nature.com robots) and the
 * GloH2O maps (figshare bot challenge) were not used.
 */
import { writeDataset } from './lib/ingest.ts';

const data = {
 "version": "1.0.0",
 "normals": {
  "source": "ncei-normals-1991-2020",
  "method": "arguez-2012",
  "quote": "The U.S. Climate Normals are a large suite of data products that provide information about typical climate conditions for thousands of locations across the United States.",
  "note": "Years of data per month are often below 30 for temperature (e.g. Denver 22–26); NCEI still publishes them as the 1991–2020 normals. Flags S/R/X not verified (the readme is robots-disallowed)."
 },
 "koppen": {
  "source": "peel-2007",
  "where": "Table 1, p. 1636",
  "first": "Since all locations that satisfy the B climate criteria will also satisfy one of the other (A, C, D or E) climate criteria, the B climates must be identified first.",
  "shares": "Globally the dominant climate class by land area is arid B (30.2%) followed by cold D (24.6%), tropical A (19.0%), temperate C (13.4%) and polar E (12.8%). The most common individual climate type by land area is BWh (14.2%), followed by Aw (11.5%).",
  "classes": {
   "A": "Tropical",
   "B": "Arid",
   "C": "Temperate",
   "D": "Cold",
   "E": "Polar"
  },
  "example": "Since the mean annual precipitation (1146 mm) is larger than the B climate type precipitation threshold of 678 mm (10 * (2 * 19.9 + 28)) (see Table 1) the station is not a B climate."
 },
 "stations": [
  {
   "id": "USW00021504",
   "name": "HILO INTL AP, HI US",
   "lat": 19.7192,
   "lon": -155.0531,
   "elevM": 11.6,
   "tavgF": [
    71.4,
    71.2,
    71.9,
    72.5,
    74.0,
    75.2,
    76.3,
    76.6,
    76.5,
    75.7,
    74.0,
    72.2
   ],
   "tmaxF": [
    78.7,
    78.4,
    78.5,
    79.0,
    80.7,
    81.8,
    82.8,
    82.9,
    83.3,
    82.4,
    80.3,
    78.8
   ],
   "tminF": [
    64.1,
    64.1,
    65.2,
    66.1,
    67.3,
    68.7,
    69.9,
    70.4,
    69.8,
    69.0,
    67.6,
    65.7
   ],
   "prcpIn": [
    7.86,
    10.22,
    12.68,
    9.4,
    6.99,
    7.3,
    9.24,
    11.3,
    8.7,
    10.24,
    14.39,
    12.07
   ],
   "annual": {
    "tavgF": 74.0,
    "prcpIn": 120.39
   },
   "role": "Tropical rainforest (U.S.)"
  },
  {
   "id": "USW00023183",
   "name": "PHOENIX SKY HARBOR INTL AP, AZ US",
   "lat": 33.4278,
   "lon": -112.0039,
   "elevM": 337.4,
   "tavgF": [
    56.8,
    59.9,
    66.3,
    73.2,
    82.0,
    91.4,
    95.5,
    94.4,
    89.2,
    77.4,
    65.1,
    55.8
   ],
   "tmaxF": [
    67.6,
    70.8,
    78.1,
    85.5,
    94.5,
    104.2,
    106.5,
    105.1,
    100.4,
    89.2,
    76.5,
    66.2
   ],
   "tminF": [
    46.0,
    49.0,
    54.5,
    60.8,
    69.5,
    78.6,
    84.5,
    83.6,
    78.1,
    65.6,
    53.7,
    45.3
   ],
   "prcpIn": [
    0.87,
    0.87,
    0.83,
    0.22,
    0.13,
    0.02,
    0.91,
    0.93,
    0.57,
    0.56,
    0.57,
    0.74
   ],
   "annual": {
    "tavgF": 75.6,
    "prcpIn": 7.22
   },
   "role": "Hot desert"
  },
  {
   "id": "USW00023169",
   "name": "LAS VEGAS MCCARRAN AP, NV US",
   "lat": 36.0719,
   "lon": -115.1633,
   "elevM": 649.5,
   "tavgF": [
    49.5,
    53.5,
    60.8,
    67.7,
    77.3,
    87.6,
    93.2,
    91.7,
    83.6,
    70.4,
    57.2,
    48.2
   ],
   "tmaxF": [
    58.5,
    62.9,
    71.1,
    78.5,
    88.5,
    99.4,
    104.5,
    102.8,
    94.9,
    81.2,
    67.1,
    56.9
   ],
   "tminF": [
    40.5,
    44.1,
    50.5,
    56.9,
    66.1,
    75.8,
    82.0,
    80.6,
    72.4,
    59.6,
    47.3,
    39.6
   ],
   "prcpIn": [
    0.56,
    0.8,
    0.42,
    0.2,
    0.07,
    0.04,
    0.38,
    0.32,
    0.32,
    0.32,
    0.3,
    0.45
   ],
   "annual": {
    "tavgF": 70.1,
    "prcpIn": 4.18
   },
   "role": "Hot desert"
  },
  {
   "id": "USW00023160",
   "name": "TUCSON INTL AP, AZ US",
   "lat": 32.1314,
   "lon": -110.9553,
   "elevM": 776.9,
   "tavgF": [
    53.6,
    56.2,
    61.9,
    68.1,
    76.8,
    86.1,
    88.2,
    86.9,
    82.8,
    72.6,
    61.5,
    53.0
   ],
   "tmaxF": [
    66.5,
    69.2,
    75.8,
    82.9,
    91.8,
    101.2,
    100.2,
    98.6,
    95.1,
    86.3,
    75.1,
    65.5
   ],
   "tminF": [
    40.8,
    43.2,
    48.0,
    53.3,
    61.8,
    71.1,
    76.3,
    75.2,
    70.4,
    59.0,
    47.9,
    40.5
   ],
   "prcpIn": [
    0.84,
    0.84,
    0.56,
    0.24,
    0.2,
    0.23,
    2.21,
    1.98,
    1.32,
    0.67,
    0.56,
    0.96
   ],
   "annual": {
    "tavgF": 70.6,
    "prcpIn": 10.61
   },
   "role": "Desert with the North American Monsoon"
  },
  {
   "id": "USW00023174",
   "name": "LOS ANGELES INTL AP, CA US",
   "lat": 33.9381,
   "lon": -118.3889,
   "elevM": 29.6,
   "tavgF": [
    57.9,
    57.9,
    59.1,
    61.1,
    63.6,
    66.4,
    69.6,
    70.7,
    70.1,
    67.1,
    62.3,
    57.6
   ],
   "tmaxF": [
    66.3,
    65.6,
    66.1,
    68.1,
    69.5,
    72.0,
    75.1,
    76.7,
    76.5,
    74.4,
    70.9,
    66.1
   ],
   "tminF": [
    49.4,
    50.1,
    52.2,
    54.2,
    57.6,
    60.9,
    64.0,
    64.8,
    63.7,
    59.8,
    53.7,
    49.1
   ],
   "prcpIn": [
    2.86,
    2.99,
    1.73,
    0.6,
    0.28,
    0.08,
    0.04,
    0.0,
    0.11,
    0.49,
    0.82,
    2.23
   ],
   "annual": {
    "tavgF": 63.6,
    "prcpIn": 12.23
   },
   "role": "Coastal southern California"
  },
  {
   "id": "USW00023272",
   "name": "SAN FRANCISCO DWTN, CA US",
   "lat": 37.7706,
   "lon": -122.4269,
   "elevM": 45.7,
   "tavgF": [
    52.2,
    54.2,
    55.5,
    56.4,
    57.8,
    59.7,
    60.3,
    61.7,
    62.9,
    62.1,
    57.2,
    52.5
   ],
   "tmaxF": [
    57.8,
    60.4,
    62.1,
    63.0,
    64.1,
    66.5,
    66.3,
    67.9,
    70.2,
    69.8,
    63.7,
    57.9
   ],
   "tminF": [
    46.6,
    47.9,
    48.9,
    49.7,
    51.4,
    53.0,
    54.4,
    55.5,
    55.6,
    54.4,
    50.7,
    47.0
   ],
   "prcpIn": [
    4.4,
    4.37,
    3.15,
    1.6,
    0.7,
    0.2,
    0.01,
    0.06,
    0.1,
    0.94,
    2.6,
    4.76
   ],
   "annual": {
    "tavgF": 57.7,
    "prcpIn": 22.89
   },
   "role": "Mediterranean, maritime"
  },
  {
   "id": "USW00013874",
   "name": "ATLANTA HARTSFIELD INTL AP, GA US",
   "lat": 33.63,
   "lon": -84.4417,
   "elevM": 307.8,
   "tavgF": [
    44.8,
    48.5,
    55.6,
    63.2,
    71.2,
    77.9,
    80.9,
    80.2,
    74.9,
    64.7,
    54.2,
    47.3
   ],
   "tmaxF": [
    54.0,
    58.2,
    65.9,
    73.8,
    81.1,
    87.1,
    90.1,
    89.0,
    83.9,
    74.4,
    64.1,
    56.2
   ],
   "tminF": [
    35.6,
    38.9,
    45.3,
    52.5,
    61.3,
    68.6,
    71.8,
    71.3,
    65.9,
    54.9,
    44.2,
    38.4
   ],
   "prcpIn": [
    4.59,
    4.55,
    4.68,
    3.81,
    3.56,
    4.54,
    4.75,
    4.3,
    3.82,
    3.28,
    3.98,
    4.57
   ],
   "annual": {
    "tavgF": 63.6,
    "prcpIn": 50.43
   },
   "role": "Humid subtropical"
  },
  {
   "id": "USW00024233",
   "name": "SEATTLE TACOMA INTL AP, WA US",
   "lat": 47.4444,
   "lon": -122.3139,
   "elevM": 112.8,
   "tavgF": [
    42.8,
    44.0,
    47.1,
    51.3,
    57.5,
    62.0,
    67.1,
    67.4,
    62.6,
    53.8,
    46.5,
    42.0
   ],
   "tmaxF": [
    48.0,
    50.3,
    54.2,
    59.3,
    66.3,
    71.1,
    77.4,
    77.6,
    71.6,
    60.5,
    52.1,
    47.0
   ],
   "tminF": [
    37.7,
    37.7,
    39.9,
    43.3,
    48.7,
    53.0,
    56.8,
    57.2,
    53.6,
    47.0,
    40.9,
    37.1
   ],
   "prcpIn": [
    5.78,
    3.76,
    4.17,
    3.18,
    1.88,
    1.45,
    0.6,
    0.97,
    1.61,
    3.91,
    6.31,
    5.72
   ],
   "annual": {
    "tavgF": 53.7,
    "prcpIn": 39.34
   },
   "role": "Marine west coast"
  },
  {
   "id": "USW00094240",
   "name": "QUILLAYUTE STATE AP, WA US",
   "lat": 47.9375,
   "lon": -124.555,
   "elevM": 56.4,
   "tavgF": [
    41.7,
    42.1,
    43.9,
    46.9,
    51.7,
    55.5,
    59.3,
    60.0,
    57.1,
    50.6,
    44.7,
    41.0
   ],
   "tmaxF": [
    47.5,
    49.1,
    51.2,
    54.8,
    60.0,
    63.3,
    67.6,
    68.9,
    66.7,
    58.7,
    51.2,
    46.7
   ],
   "tminF": [
    35.9,
    35.2,
    36.7,
    38.9,
    43.4,
    47.7,
    51.0,
    51.1,
    47.5,
    42.4,
    38.1,
    35.3
   ],
   "prcpIn": [
    15.59,
    9.73,
    11.78,
    8.11,
    4.25,
    3.3,
    1.58,
    2.64,
    4.56,
    10.68,
    15.26,
    13.84
   ],
   "annual": {
    "tavgF": 49.5,
    "prcpIn": 101.32
   },
   "role": "Windward coast (Olympic Peninsula)"
  },
  {
   "id": "USW00024243",
   "name": "YAKIMA AIR TERMINAL, WA US",
   "lat": 46.5683,
   "lon": -120.5428,
   "elevM": 324.3,
   "tavgF": [
    31.7,
    36.6,
    43.4,
    49.9,
    58.8,
    65.1,
    72.4,
    70.9,
    62.2,
    49.8,
    38.0,
    30.6
   ],
   "tmaxF": [
    39.5,
    47.2,
    56.6,
    64.7,
    74.1,
    80.7,
    89.9,
    88.5,
    79.4,
    64.4,
    48.9,
    38.2
   ],
   "tminF": [
    24.0,
    26.1,
    30.2,
    35.2,
    43.5,
    49.5,
    55.0,
    53.3,
    44.9,
    35.3,
    27.2,
    23.1
   ],
   "prcpIn": [
    1.19,
    0.81,
    0.64,
    0.55,
    0.74,
    0.5,
    0.2,
    0.21,
    0.23,
    0.64,
    0.86,
    1.44
   ],
   "annual": {
    "tavgF": 50.8,
    "prcpIn": 8.01
   },
   "role": "Lee of the Cascades"
  },
  {
   "id": "USW00024157",
   "name": "SPOKANE INTL AP, WA US",
   "lat": 47.6217,
   "lon": -117.5281,
   "elevM": 717.2,
   "tavgF": [
    29.6,
    32.9,
    40.0,
    47.0,
    56.0,
    62.3,
    71.0,
    70.3,
    61.1,
    47.9,
    36.3,
    29.1
   ],
   "tmaxF": [
    34.5,
    39.5,
    48.6,
    56.9,
    67.1,
    73.7,
    84.4,
    83.8,
    73.6,
    57.7,
    42.3,
    33.8
   ],
   "tminF": [
    24.7,
    26.3,
    31.5,
    37.0,
    44.9,
    50.8,
    57.6,
    56.7,
    48.6,
    38.0,
    30.3,
    24.3
   ],
   "prcpIn": [
    1.97,
    1.44,
    1.83,
    1.25,
    1.55,
    1.17,
    0.42,
    0.47,
    0.58,
    1.37,
    2.06,
    2.34
   ],
   "annual": {
    "tavgF": 48.6,
    "prcpIn": 16.45
   },
   "role": "Inland, lee side"
  },
  {
   "id": "USW00094846",
   "name": "CHICAGO OHARE INTL AP, IL US",
   "lat": 41.995,
   "lon": -87.9336,
   "elevM": 200.6,
   "tavgF": [
    25.2,
    28.8,
    39.0,
    49.7,
    60.6,
    70.6,
    75.4,
    73.8,
    66.3,
    54.0,
    41.3,
    30.5
   ],
   "tmaxF": [
    31.6,
    35.7,
    47.0,
    59.0,
    70.5,
    80.4,
    84.5,
    82.5,
    75.5,
    62.7,
    48.4,
    36.6
   ],
   "tminF": [
    18.8,
    21.8,
    31.0,
    40.3,
    50.6,
    60.8,
    66.4,
    65.1,
    57.1,
    45.4,
    34.1,
    24.4
   ],
   "prcpIn": [
    1.99,
    1.97,
    2.45,
    3.75,
    4.49,
    4.1,
    3.71,
    4.25,
    3.19,
    3.43,
    2.42,
    2.11
   ],
   "annual": {
    "tavgF": 51.2,
    "prcpIn": 37.86
   },
   "role": "Continental"
  },
  {
   "id": "USW00014922",
   "name": "MINNEAPOLIS/ST PAUL AP, MN US",
   "lat": 44.8831,
   "lon": -93.2289,
   "elevM": 265.8,
   "tavgF": [
    16.2,
    20.6,
    33.3,
    47.1,
    59.5,
    69.7,
    74.3,
    71.8,
    63.5,
    49.5,
    34.8,
    22.0
   ],
   "tmaxF": [
    23.6,
    28.5,
    41.7,
    56.6,
    69.2,
    79.0,
    83.4,
    80.7,
    72.9,
    58.1,
    41.9,
    28.8
   ],
   "tminF": [
    8.8,
    12.7,
    24.9,
    37.5,
    49.9,
    60.4,
    65.3,
    62.8,
    54.2,
    40.9,
    27.7,
    15.2
   ],
   "prcpIn": [
    0.89,
    0.87,
    1.68,
    2.91,
    3.91,
    4.58,
    4.06,
    4.34,
    3.02,
    2.58,
    1.61,
    1.17
   ],
   "annual": {
    "tavgF": 46.9,
    "prcpIn": 31.62
   },
   "role": "Continental"
  },
  {
   "id": "USW00027502",
   "name": "BARROW POST ROGERS AP, AK US",
   "lat": 71.2833,
   "lon": -156.7814,
   "elevM": 9.4,
   "tavgF": [
    -11.5,
    -11.9,
    -10.5,
    4.0,
    22.7,
    36.0,
    41.7,
    39.8,
    33.7,
    21.2,
    5.7,
    -6.3
   ],
   "tmaxF": [
    -5.2,
    -5.5,
    -3.8,
    10.6,
    26.9,
    40.9,
    47.7,
    44.5,
    37.1,
    25.6,
    11.5,
    -0.4
   ],
   "tminF": [
    -17.8,
    -18.3,
    -17.2,
    -2.5,
    18.5,
    31.1,
    35.6,
    35.1,
    30.3,
    16.8,
    -0.1,
    -12.2
   ],
   "prcpIn": [
    0.14,
    0.21,
    0.18,
    0.18,
    0.28,
    0.43,
    0.98,
    1.09,
    0.77,
    0.54,
    0.37,
    0.22
   ],
   "annual": {
    "tavgF": 13.7,
    "prcpIn": 5.39
   },
   "role": "Polar (Utqiaġvik)"
  },
  {
   "id": "USW00003017",
   "name": "DENVER INTL AP, CO US",
   "lat": 39.8328,
   "lon": -104.6575,
   "elevM": 1650.2,
   "tavgF": [
    31.7,
    32.7,
    41.6,
    47.8,
    57.4,
    68.2,
    75.1,
    72.9,
    64.8,
    51.1,
    39.4,
    31.2
   ],
   "tmaxF": [
    44.6,
    45.7,
    55.7,
    61.7,
    71.2,
    83.4,
    89.9,
    87.5,
    79.6,
    65.3,
    52.9,
    44.0
   ],
   "tminF": [
    18.7,
    19.7,
    27.5,
    33.9,
    43.6,
    53.0,
    60.2,
    58.3,
    50.0,
    37.0,
    26.0,
    18.4
   ],
   "prcpIn": [
    0.38,
    0.41,
    0.86,
    1.68,
    2.16,
    1.94,
    2.14,
    1.58,
    1.35,
    0.99,
    0.64,
    0.35
   ],
   "annual": {
    "tavgF": 51.2,
    "prcpIn": 14.48
   },
   "role": "High plains, mountain front"
  },
  {
   "id": "USW00014755",
   "name": "MT WASHINGTON, NH US",
   "lat": 44.2667,
   "lon": -71.2994,
   "elevM": 1910.2,
   "tavgF": [
    5.8,
    5.9,
    12.9,
    23.7,
    36.3,
    45.5,
    49.9,
    48.7,
    43.1,
    31.3,
    20.8,
    11.8
   ],
   "tmaxF": [
    14.9,
    14.8,
    20.8,
    30.7,
    42.5,
    51.4,
    55.3,
    54.2,
    49.1,
    37.7,
    28.4,
    20.1
   ],
   "tminF": [
    -3.2,
    -3.0,
    4.9,
    16.7,
    30.2,
    39.6,
    44.5,
    43.2,
    37.1,
    24.9,
    13.1,
    3.5
   ],
   "prcpIn": [
    5.74,
    5.45,
    6.72,
    7.31,
    7.68,
    8.59,
    8.93,
    7.72,
    7.66,
    9.99,
    8.09,
    7.35
   ],
   "annual": {
    "tavgF": 28.0,
    "prcpIn": 91.23
   },
   "role": "Mountain summit"
  }
 ],
 "causes": [
  {
   "id": "latitude",
   "title": "Latitude and sunlight",
   "s": "nasa-earth-energy-budget",
   "q": [
    "The Sun doesn't heat the Earth evenly. Because the Earth is a sphere, the Sun heats equatorial regions more than polar regions.",
    "The tropics (from 0 to 23.5° latitude) receive about 90% of the energy compared to the equator, the mid-latitudes (45°) roughly 70%, and the Arctic and Antarctic Circles about 40%.",
    "In the tropics there is a net energy surplus because the amount of sunlight absorbed is larger than the amount of heat radiated. In the polar regions, however, there is an annual energy deficit because the amount of heat radiated to space is larger than the amount of absorbed sunlight."
   ],
   "stations": [
    "USW00021504",
    "USW00094846",
    "USW00027502"
   ]
  },
  {
   "id": "ocean",
   "title": "Oceans and continents",
   "s": "usgs-specific-heat",
   "q": [
    "Water has a high specific heat capacity—it absorbs a lot of heat before it begins to get hot.",
    "Cities near the oceans will tend to have less change and less extreme temperatures than inland cities.",
    "A Great Plains state, such as Nebraska, will have colder winters and hotter summers than Oregon, which has a higher latitude but has the Pacific Ocean nearby."
   ],
   "s2": "noaa-oe-ocean-climate",
   "q2": "The ocean influences weather and climate by storing solar radiation, distributing heat and moisture around the globe, and driving weather systems.",
   "stations": [
    "USW00023272",
    "USW00014922"
   ]
  },
  {
   "id": "rainshadow",
   "title": "Mountains and rain shadows",
   "s": "nws-glossary",
   "q": [
    "Rain Shadow: An area of reduced precipitation on the lee side of a mountain barrier caused by warming of air and dissipation of cloudiness as air descends the barrier.",
    "Orographic Lifting: … occurs when air is forced to rise and cool due to terrain features such as hills or mountains. If the cooling is sufficient, water vapor condenses into clouds. Additional cooling results in rain or snow."
   ],
   "s2": "usgs-deserts",
   "q2": "Rain shadow deserts are formed because tall mountain ranges prevent moisture-rich clouds from reaching areas on the lee, or protected side, of the range.",
   "stations": [
    "USW00094240",
    "USW00024233",
    "USW00024157",
    "USW00024243"
   ]
  },
  {
   "id": "deserts",
   "title": "Subtropical highs and deserts",
   "s": "usgs-deserts",
   "q": [
    "Around 30° N. and S., the poleward flowing air begins to descend toward the surface in subtropical high-pressure belts. The sinking air is relatively dry because its moisture has already been released near the Equator above the tropical rain forests.",
    "Most of the nonpolar deserts lie within the two trade winds belts.",
    "arid lands have less than 250 millimeters of annual rainfall, and semiarid lands have a mean annual precipitation of between 250 and 500 millimeters."
   ],
   "stations": [
    "USW00023183",
    "USW00023169"
   ]
  },
  {
   "id": "mediterranean",
   "title": "Mediterranean climates",
   "s": "nps-goga-weather",
   "q": [
    "Mediterranean climate regions occur on the west coasts of continents at mid-latitudes throughout the world.",
    "In these regions, temperate wet winters contrast with warm or hot dry summers."
   ],
   "s2": "nps-chis-weather",
   "q2": "In the Köppen system of climate classification this is a cool Mediterranean climate (Csb) or a Mediterranean Dry Summer Subtropical climate type, with a cool summer regime.",
   "stations": [
    "USW00023174",
    "USW00023272"
   ]
  },
  {
   "id": "monsoon",
   "title": "Monsoons",
   "s": "nws-abq-monsoon",
   "q": [
    "The term monsoon generally refers to the seasonal reversal in atmospheric low-level circulations, particularly the surface winds and associated precipitation, resulting in a pattern of wet summers and dry winters.",
    "The basic forcing of the monsoons is derived from a seasonal contrast in the heating of the land continent versus the ocean."
   ],
   "stations": [
    "USW00023160",
    "USW00023183"
   ]
  },
  {
   "id": "mountains",
   "title": "Height",
   "s": "nws-glossary",
   "q": [
    "Lapse Rate: The rate of change of an atmospheric variable, usually temperature, with height.",
    "The dry adiabatic lapse rate (abbreviated DALR) is 5.5°F per 1000 ft or 9.8°C per km."
   ],
   "stations": [
    "USW00003017",
    "USW00014755"
   ]
  },
  {
   "id": "urban",
   "title": "Cities (urban heat islands)",
   "s": "epa-heat-islands",
   "q": [
    "Structures such as buildings, roads, and other infrastructure absorb and re-emit the sun's heat more than natural landscapes such as forests and water bodies.",
    "A review of research studies and data found that in the United States, the heat island effect results in daytime temperatures in urban areas about 1–7°F higher than temperatures in outlying areas and nighttime temperatures about 2–5°F higher.",
    "Often, heat islands build throughout the day and become more pronounced after sunset due to the slow release of heat from urban materials."
   ],
   "stations": []
  }
 ]
};
writeDataset('datasets/meteorology/climates.json', data, { dataset: 'climates', version: '1.0.0', records: data.stations.length * 48 + data.causes.length,
  sources: [{ institution: 'NOAA NCEI U.S. Climate Normals 1991–2020 (v1.0.1)', url: 'https://www.ncei.noaa.gov/products/land-based-station/us-climate-normals', license: 'U.S. government work', notes: '16 stations, monthly normals via the Access Data Service API' },
    { institution: 'Peel, Finlayson & McMahon (2007), HESS', url: 'https://doi.org/10.5194/hess-11-1633-2007', license: 'CC BY-NC-SA 2.5', notes: 'Köppen–Geiger criteria, Table 1' }],
  adapter: 'scripts/ingestion/curated-climates.ts', warnings: ['NCEI API metric output leaves TAVG in °F; °F values converted.', 'Normals flags S/R/X not verified.', 'No dataset DOI found for the 1991–2020 monthly normals.', 'Stations are U.S. only (no Singapore, Manaus or Mumbai).', 'Peel uses Tcold = 0 °C for the C/D boundary (some versions use −3 °C).', 'Earth axial tilt: NASA “about 23 degrees” vs USGS 23.5°.'] });
