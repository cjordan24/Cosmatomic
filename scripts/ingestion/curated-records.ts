/**
 * Historical global temperature (Phase 21, Gate 21.4) → datasets/meteorology/records.json
 *
 *   node --experimental-strip-types scripts/ingestion/curated-records.ts
 *
 * NOAAGlobalTemp annual global land-and-ocean temperature departures, 1850–2025, from NOAA NCEI Climate at a Glance
 * (data.csv, retrieved 2026-11-28; header: Base Period 1901-2000). NASA GISTEMP tables were not used (robots.txt
 * disallows /gistemp/tabledata_v4/). Notes: research/SOURCE_NOTES_PHASE21A.md §3.
 */
import { writeDataset } from './lib/ingest.ts';

const data = {
  version: '1.0.0',
  source: 'noaa-globaltemp', paper: 'yin-2024',
  title: 'Global Land and Ocean January - December Average Temperature Departures',
  units: 'Degrees Celsius', base: '1901-2000',
  productNote: 'Version 6.1.0 uses the current WMO climatological standard normals period 1991–2020 as the reference period for temperature anomalies.',
  baseFinding: 'The Climate at a Glance file says “Base Period: 1901-2000”; the NOAAGlobalTemp v6.1.0 product page says the reference period is 1991–2020 — the downloadable series is re-based to the 20th-century mean.',
  years: [1850, 1851, 1852, 1853, 1854, 1855, 1856, 1857, 1858, 1859, 1860, 1861, 1862, 1863, 1864, 1865, 1866, 1867, 1868, 1869, 1870, 1871, 1872, 1873, 1874, 1875, 1876, 1877, 1878, 1879, 1880, 1881, 1882, 1883, 1884, 1885, 1886, 1887, 1888, 1889, 1890, 1891, 1892, 1893, 1894, 1895, 1896, 1897, 1898, 1899, 1900, 1901, 1902, 1903, 1904, 1905, 1906, 1907, 1908, 1909, 1910, 1911, 1912, 1913, 1914, 1915, 1916, 1917, 1918, 1919, 1920, 1921, 1922, 1923, 1924, 1925, 1926, 1927, 1928, 1929, 1930, 1931, 1932, 1933, 1934, 1935, 1936, 1937, 1938, 1939, 1940, 1941, 1942, 1943, 1944, 1945, 1946, 1947, 1948, 1949, 1950, 1951, 1952, 1953, 1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962, 1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971, 1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980, 1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989, 1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999, 2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025],
  anomaly: [-0.16, -0.06, -0.03, -0.08, -0.05, -0.09, -0.14, -0.2, -0.15, -0.07, -0.21, -0.25, -0.32, -0.26, -0.23, -0.05, -0.12, -0.21, -0.13, -0.08, -0.18, -0.18, -0.16, -0.17, -0.23, -0.21, -0.23, 0.08, 0.11, -0.17, -0.19, -0.09, -0.17, -0.17, -0.27, -0.23, -0.27, -0.35, -0.12, -0.06, -0.31, -0.23, -0.32, -0.32, -0.33, -0.23, -0.13, -0.12, -0.26, -0.16, -0.08, -0.12, -0.21, -0.33, -0.39, -0.27, -0.17, -0.35, -0.39, -0.38, -0.35, -0.37, -0.3, -0.28, -0.12, -0.07, -0.29, -0.42, -0.33, -0.2, -0.18, -0.15, -0.23, -0.22, -0.22, -0.19, -0.07, -0.17, -0.15, -0.3, -0.11, -0.05, -0.11, -0.24, -0.1, -0.13, -0.09, -0.0, 0.01, 0.02, 0.16, 0.21, 0.08, 0.08, 0.21, 0.13, -0.01, -0.0, -0.04, -0.04, -0.13, -0.01, 0.05, 0.1, -0.07, -0.13, -0.17, 0.06, 0.09, 0.08, -0.01, 0.08, 0.04, 0.06, -0.18, -0.08, -0.04, -0.01, -0.05, 0.09, 0.04, -0.08, 0.06, 0.17, -0.05, -0.0, -0.06, 0.2, 0.11, 0.19, 0.29, 0.33, 0.15, 0.32, 0.17, 0.15, 0.22, 0.33, 0.38, 0.26, 0.42, 0.41, 0.23, 0.26, 0.32, 0.46, 0.34, 0.48, 0.61, 0.4, 0.4, 0.53, 0.59, 0.6, 0.54, 0.67, 0.63, 0.62, 0.53, 0.65, 0.71, 0.6, 0.63, 0.66, 0.73, 0.88, 1.0, 0.93, 0.87, 0.99, 1.01, 0.86, 0.89, 1.17, 1.26, 1.12],
};
writeDataset('datasets/meteorology/records.json', data, { dataset: 'records', version: '1.0.0', records: data.years.length,
  sources: [{ institution: 'NOAA NCEI (NOAAGlobalTemp v6.1.0 via Climate at a Glance)', url: 'https://www.ncei.noaa.gov/access/monitoring/climate-at-a-glance/global/time-series', license: 'U.S. government work', notes: 'annual global anomalies 1850–2025, base 1901–2000' }],
  adapter: 'scripts/ingestion/curated-records.ts', warnings: ['Base period 1901–2000 in the file vs 1991–2020 on the product page.', 'GISTEMP not used (robots).'] });
