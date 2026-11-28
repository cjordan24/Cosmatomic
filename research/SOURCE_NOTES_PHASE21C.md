# Source notes: Phase 21C. Why regions have different climates (Köppen–Geiger, station normals, causes)

Research date: 2026-11-28. Raw files: `/tmp/vv-research/p21/c/` (station CSVs in `/tmp/vv-research/p21/c/normals/`; formatted tables in `/tmp/vv-research/p21/c/normals_tables.md`). User-Agent: "VoyagerVentures-Research/0.1 (educational; respects robots.txt)". I waited at least 1.2 s between requests to each host. I did not fetch www.noaa.gov/jetstream or spc.noaa.gov.

## robots.txt / access log

| Host | robots.txt result | Used? |
|---|---|---|
| www.nature.com | 200. `User-agent: *` allows articles, **but the file has `Disallow: /` for `anthropic-ai`, `ClaudeBot` and `Claude-Web`** (also GPTBot, CCBot and others) | **NOT FETCHED.** These rules name this agent's vendor, so Beck et al. 2018 and 2023 (Scientific Data) were not read. Their metadata came only from Crossref |
| www.gloh2o.org | 200: disallows /wp-admin/ only | Yes (Köppen page only) |
| figshare.com | robots.txt returned **HTTP 202 with `x-amzn-waf-action: challenge`** (AWS WAF bot challenge) | **STOPPED** (bot wall). No Köppen map file was downloaded |
| www.ncei.noaa.gov | 200: **`Disallow: /data*`**, `/orders*`, some /access/crn/ paths | The bulk CSVs under `/data/normals-monthly/1991-2020/access/<ID>.csv` are **disallowed**, so I did not fetch them. Instead I used the official NCEI Access Data Service API (`/access/services/data/v1`), which robots.txt allows, plus product and landing pages. The methodology PDF and readme files under /data/ were not fetched |
| hess.copernicus.org | 200: `User-agent: *` with no disallows | Yes (Peel et al. 2007 PDF) |
| api.crossref.org | robots 404 (none) | Yes (DOI checks) |
| api.datacite.org | robots 404 | Two queries failed (non-JSON or 404). Not used |
| forecast.weather.gov | 404 (none) | Yes (NWS Glossary) |
| www.weather.gov | 404 (none) | Yes (/abq/ and /twc/ pages) |
| pubs.usgs.gov | 200: disallows /archive/ only | Yes (USGS *Deserts: Geology and Resources* online edition) |
| www.usgs.gov | 200: standard Drupal rules | Yes (Water Science School) |
| www.epa.gov | 200: Drupal admin and search paths only | Yes (Heat Islands) |
| science.nasa.gov | 200: `User-agent: * Allow: /` | Yes (Earth Observatory energy-budget feature) |
| oceanexplorer.noaa.gov | 200: disallows /map/* | Yes |
| www.nps.gov | 200: disallows /ns/, /search/, loader.cfm | Yes (Channel Islands NP and Golden Gate NRA weather pages) |

I used one WebSearch to locate NPS pages. The results included Wikipedia, webarchive.library.unt.edu, Britannica and EBSCO, which I ignored and did not fetch.

---

## 1. Köppen–Geiger classification

### 1a. Peel, Finlayson & McMahon (2007): class criteria (Table 1). PRIMARY SOURCE USED
- **Citation:** Peel, M. C., Finlayson, B. L., and McMahon, T. A. (2007). Updated world map of the Köppen-Geiger climate classification. *Hydrology and Earth System Sciences* 11, 1633–1644. DOI **10.5194/hess-11-1633-2007** (verified on Crossref: title, volume 11, pages 1633–1644, issued 2007-10-11, authors Peel, Finlayson, McMahon).
- URL: https://hess.copernicus.org/articles/11/1633/2007/hess-11-1633-2007.pdf (saved as `peel2007.pdf`; text layer in `peel2007.txt`).
- **Licence:** Crossref lists **CC BY-NC-SA 2.5**. The PDF says "This work is licensed under a Creative Commons License." This is non-commercial and share-alike, unlike CC BY, so check it fits the app's licence. Quoting the criteria with a citation should be fine.
- Affiliations (from the paper): Dept. of Civil and Environmental Engineering, and School of Anthropology, Geography and Environmental Studies, The University of Melbourne. Bios: not verified.
- Kind: classification scheme applied to station observations (a long-term climatology interpolated to a 0.1° grid).
- **How read:** born-digital PDF, from the text layer. I also rendered **page 4 as an image** (`peel_p_p4.jpg`, cropped `peel_t1.jpg`) and checked every symbol (≥, ≤, <, –38) against it. They match.
- **Table 1 (p. 1636), verbatim. "Description of Köppen climate symbols and defining criteria."**

| 1st | 2nd | 3rd | Description | Criteria* |
|---|---|---|---|---|
| A | | | Tropical | Tcold≥18 |
| | f | | - Rainforest | Pdry≥60 |
| | m | | - Monsoon | Not (Af) & Pdry≥100–MAP/25 |
| | w | | - Savannah | Not (Af) & Pdry<100–MAP/25 |
| B | | | Arid | MAP<10×Pthreshold |
| | W | | - Desert | MAP<5×Pthreshold |
| | S | | - Steppe | MAP≥5×Pthreshold |
| | | h | - Hot | MAT≥18 |
| | | k | - Cold | MAT<18 |
| C | | | Temperate | Thot>10 & 0<Tcold<18 |
| | s | | - Dry Summer | Psdry<40 & Psdry<Pwwet/3 |
| | w | | - Dry Winter | Pwdry<Pswet/10 |
| | f | | - Without dry season | Not (Cs) or (Cw) |
| | | a | - Hot Summer | Thot≥22 |
| | | b | - Warm Summer | Not (a) & Tmon10≥4 |
| | | c | - Cold Summer | Not (a or b) & 1≤Tmon10<4 |
| D | | | Cold | Thot>10 & Tcold≤0 |
| | s | | - Dry Summer | Psdry<40 & Psdry<Pwwet/3 |
| | w | | - Dry Winter | Pwdry<Pswet/10 |
| | f | | - Without dry season | Not (Ds) or (Dw) |
| | | a | - Hot Summer | Thot≥22 |
| | | b | - Warm Summer | Not (a) & Tmon10≥4 |
| | | c | - Cold Summer | Not (a, b or d) |
| | | d | - Very Cold Winter | Not (a or b) & Tcold<–38 |
| E | | | Polar | Thot<10 |
| | T | | - Tundra | Thot>0 |
| | F | | - Frost | Thot≤0 |

- Footnote (verbatim): "*MAP = mean annual precipitation, MAT = mean annual temperature, Thot = temperature of the hottest month, Tcold = temperature of the coldest month, Tmon10 = number of months where the temperature is above 10, Pdry = precipitation of the driest month, Psdry = precipitation of the driest month in summer, Pwdry = precipitation of the driest month in winter, Pswet = precipitation of the wettest month in summer, Pwwet = precipitation of the wettest month in winter, Pthreshold = varies according to the following rules (if 70% of MAP occurs in winter then Pthreshold = 2 x MAT, if 70% of MAP occurs in summer then Pthreshold = 2 x MAT + 28, otherwise Pthreshold = 2 x MAT + 14). Summer (winter) is defined as the warmer (cooler) six month period of ONDJFM and AMJJAS."
- p. 1637, verbatim: "The 30 possible climate types in Table 1 are divided into 3 tropical (Af, Am and Aw), 4 arid (BWh, BWk, BSh and BSk), 9 temperate (Csa, Csb, Csc, Cfa, Cfb, Cfc, Cwa, Cwb and Cwc), 12 cold (Dsa, Dsb, Dsc, Dsd, Dfa, Dfb, Dfc, Dfd, Dwa, Dwb, Dwc and Dwd) and 2 polar (ET and EF). All precipitation variables are in units of millimetres (mm) and all temperature variables are in units of degrees Celsius (°C)."
- p. 1637: "Since all locations that satisfy the B climate criteria will also satisfy one of the other (A, C, D or E) climate criteria, the B climates must be identified first."
- p. 1637, worked example (Herberton Post Office, Australia): "Since the mean annual precipitation (1146 mm) is larger than the B climate type precipitation threshold of 678 mm (10 * (2 * 19.9 + 28)) (see Table 1) the station is not a B climate."
- Global shares (Sect. 4, pp. 1642–1643), verbatim: "Globally the dominant climate class by land area is arid B (30.2%) followed by cold D (24.6%), tropical A (19.0%), temperate C (13.4%) and polar E (12.8%). The most common individual climate type by land area is BWh (14.2%), followed by Aw (11.5%). Of the 30 possible climate types the Csc climate type never occurs and the Cwc climate type occurs in only 25 pixels (representing 0.002% of total land area)."
- Note: the C/D boundary in this table is Tcold = 0 °C. Some other versions use −3 °C. Peel uses 0, so record 0 and do not mix the two.

### 1b. Beck et al. 2018 and 2023 (metadata only; full text NOT read)
- Beck, H. E., Zimmermann, N. E., McVicar, T. R., Vergopolan, N., Berg, A., Wood, E. F. (2018). Present and future Köppen-Geiger climate classification maps at 1-km resolution. *Scientific Data* 5, 180214. DOI **10.1038/sdata.2018.214** (Crossref verified; issued 2018-10-30; licence CC BY 4.0).
- Beck, H. E., McVicar, T. R., Vergopolan, N., Berg, A., Lutsko, N. J., Dufour, A., Zeng, Z., Jiang, X., van Dijk, A. I. J. M., Miralles, D. G. (2023). High-resolution (1 km) Köppen-Geiger maps for 1901–2099 based on constrained CMIP6 projections. *Scientific Data* 10, 724. DOI **10.1038/s41597-023-02549-6** (Crossref verified; issued 2023-10-23; CC BY 4.0).
- **Table 1 of Beck 2018 was NOT read**, because nature.com's robots.txt disallows Anthropic agents (see the log). I used Peel 2007 instead.

### 1c. GloH2O Köppen-Geiger data page (data host)
- URL: https://www.gloh2o.org/koppen/ (GloH2O LLC, Princeton NJ). Saved as `gloh2o_koppen.html`.
- Verbatim: "This dataset offers high-resolution (1 km) global Köppen-Geiger climate classification maps spanning both historical and future periods (1901–2099). The historical maps (encompassing 1901–1930, 1931–1960, 1961–1990, and 1991–2020) are based on high-resolution, observation-based climatologies. The future maps (encompassing 2041–2070 and 2071–2099) are based on downscaled and bias-corrected climate projections from the Coupled Model Intercomparison Project phase 6 (CMIP6) and cover seven Shared Socio-economic Pathways (SSPs)."
- Verbatim: "we first screened all 67 climate models … From these, we selected the 42 most realistic models to generate the future climate maps."
- Verbatim: "This archive includes GeoTIFFs of Köppen-Geiger maps in varying resolutions … The archive also includes a legend file, legend.txt, which links the numeric values in the maps to the Köppen-Geiger climate symbols".
- Licence, verbatim: "Freely use, adapt, and share these maps under CC BY 4.0, with attribution to Beck et al. (2023)." **Discrepancy:** the hyperlink on the words "CC BY 4.0" points to `https://creativecommons.org/licenses/by-nc/4.0/`, while Crossref lists CC BY 4.0 for the paper. Record both.
- Download links: V3 is `https://figshare.com/ndownloader/files/61012822` (figshare DOI 10.6084/m9.figshare.21789074); V1 (2018) is figshare DOI 10.6084/m9.figshare.6396959. **Not downloaded**, because figshare served a WAF challenge. Kind: the 1991–2020 maps are observation-based; the future maps are model projections.

---

## 2. Station climate normals 1991–2020 (NOAA NCEI)

### Source and method
- **Dataset:** NOAA NCEI U.S. Climate Normals, 1991–2020, version 1.0.1 (product page https://www.ncei.noaa.gov/products/land-based-station/us-climate-normals, saved as `ncei_normals_product.html`). Kind: observation-based 30-year statistics.
- **Access route:** NCEI Access Data Service API. Example request: `https://www.ncei.noaa.gov/access/services/data/v1?dataset=normals-monthly-1991-2020&stations=<ID>&format=csv&dataTypes=MLY-TAVG-NORMAL,MLY-PRCP-NORMAL,MLY-TMAX-NORMAL,MLY-TMIN-NORMAL&includeStationName=true&includeStationLocation=1&includeAttributes=true&units=standard` (and `units=metric`). Annual values came from `dataset=normals-annualseasonal-1991-2020` with `ANN-TAVG-NORMAL, ANN-PRCP-NORMAL, ANN-TMAX-NORMAL, ANN-TMIN-NORMAL`.
- **Files:** `normals/<ID>_standard.csv`, `<ID>_metric.csv`, `<ID>_annual.csv`.
- **Columns used:** `MLY-TAVG-NORMAL` (°F), `MLY-TMAX-NORMAL`, `MLY-TMIN-NORMAL`, `MLY-PRCP-NORMAL` (inches; mm in the metric files), and for each a `meas_flag_*`, `comp_flag_*` and `years_*` (number of years of data).
- **Units bug in the API (record it):** with `units=metric`, `MLY-TMAX`, `MLY-TMIN` and `MLY-PRCP` are converted to °C and mm, but **`MLY-TAVG-NORMAL` stays in °F** (for example Hilo January TAVG = 71.4 in both files, while TMAX shows 78.7 °F vs 25.9 °C). Use the °F TAVG values and convert explicitly: °C = (°F − 32)/1.8.
- **Flags seen:** 764 of 768 monthly values have comp flag "S" and a blank measurement flag. The exceptions are comp flag "R" on Denver Jul TAVG and TMIN and on Spokane Apr TAVG, and measurement flag "X" on LAX Aug PRCP (value 0.00). **The flag definitions were not verified.** They are in the NCEI readme and methodology files under /data/, which robots.txt disallows.
- **Product-page text (verbatim):** "The U.S. Climate Normals are a large suite of data products that provide information about typical climate conditions for thousands of locations across the United States." / "The official normals are calculated for a uniform 30 year period, and consist of annual/seasonal, monthly, daily, and hourly averages and statistics of temperature, precipitation, and other climatological variables from almost 15,000 U.S. weather stations." / "The 1991–2020 U.S. Climate Normals are the latest in a series of decadal normals first produced in the 1950s. They were first released in May 2021 (v1.0.0), and the statistics for 23 of the sites were reissued in 2023 (v1.0.1)."
- **Methods citation:** Arguez, A., Durre, I., Applequist, S., Vose, R. S., Squires, M. F., Yin, X., Heim, R. R. Jr., Owen, T. W. (2012). NOAA's 1981–2010 U.S. Climate Normals: An Overview. *Bulletin of the American Meteorological Society* 93, 1687–1697. DOI **10.1175/BAMS-D-11-00197.1**. Crossref verified pages 1687–1697; **the NCEI page misprints them as "1687-169"**.
- **Dataset DOI for the 1991–2020 monthly normals: NOT FOUND** on any page I could read (see gaps). Do not invent one.
- Note: "years" is often below 30 for temperature (for example Denver TAVG has 22–26 years). NCEI still publishes these as the 1991–2020 normals.

### Stations (lat/lon in degrees; elevation in m, as given in the CSV)

| Role | GHCN ID | Name (as in file) | Lat | Lon | Elev m |
|---|---|---|---|---|---|
| Tropical rainforest (U.S.) | USW00021504 | HILO INTL AP, HI US | 19.7192 | -155.0531 | 11.6 |
| Hot desert | USW00023183 | PHOENIX SKY HARBOR INTL AP, AZ US | 33.4278 | -112.0039 | 337.4 |
| Hot desert | USW00023169 | LAS VEGAS MCCARRAN AP, NV US | 36.0719 | -115.1633 | 649.5 |
| Desert with N. American Monsoon | USW00023160 | TUCSON INTL AP, AZ US | 32.1314 | -110.9553 | 776.9 |
| Mediterranean | USW00023174 | LOS ANGELES INTL AP, CA US | 33.9381 | -118.3889 | 29.6 |
| Mediterranean / maritime | USW00023272 | SAN FRANCISCO DWTN, CA US | 37.7706 | -122.4269 | 45.7 |
| Humid subtropical | USW00013874 | ATLANTA HARTSFIELD INTL AP, GA US | 33.6300 | -84.4417 | 307.8 |
| Marine west coast | USW00024233 | SEATTLE TACOMA INTL AP, WA US | 47.4444 | -122.3139 | 112.8 |
| Windward coast (Olympic Peninsula, near Forks) | USW00094240 | QUILLAYUTE STATE AP, WA US | 47.9375 | -124.5550 | 56.4 |
| Lee of the Cascades | USW00024243 | YAKIMA AIR TERMINAL, WA US | 46.5683 | -120.5428 | 324.3 |
| Inland, lee side | USW00024157 | SPOKANE INTL AP, WA US | 47.6217 | -117.5281 | 717.2 |
| Continental | USW00094846 | CHICAGO OHARE INTL AP, IL US | 41.9950 | -87.9336 | 200.6 |
| Continental | USW00014922 | MINNEAPOLIS/ST PAUL AP, MN US | 44.8831 | -93.2289 | 265.8 |
| Polar / tundra | USW00027502 | BARROW POST ROGERS AP, AK US (Utqiaġvik) | 71.2833 | -156.7814 | 9.4 |
| High plains / mountain-front | USW00003017 | DENVER INTL AP, CO US | 39.8328 | -104.6575 | 1650.2 |
| Mountain summit | USW00014755 | MT WASHINGTON, NH US | 44.2667 | -71.2994 | 1910.2 |

### Monthly normals (verbatim API values; months 01–12; "Annual" from the annual/seasonal dataset)
#### USW00021504: HILO INTL AP, HI US, lat 19.7192, lon -155.0531, elev 11.6 m
| | 01 | 02 | 03 | 04 | 05 | 06 | 07 | 08 | 09 | 10 | 11 | 12 | Annual (ANN-*) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| TAVG °F | 71.4 | 71.2 | 71.9 | 72.5 | 74.0 | 75.2 | 76.3 | 76.6 | 76.5 | 75.7 | 74.0 | 72.2 | 74.0 |
| TMAX °F | 78.7 | 78.4 | 78.5 | 79.0 | 80.7 | 81.8 | 82.8 | 82.9 | 83.3 | 82.4 | 80.3 | 78.8 | 80.6 |
| TMIN °F | 64.1 | 64.1 | 65.2 | 66.1 | 67.3 | 68.7 | 69.9 | 70.4 | 69.8 | 69.0 | 67.6 | 65.7 | 67.3 |
| TMAX °C (API metric) | 25.9 | 25.8 | 25.8 | 26.1 | 27.1 | 27.7 | 28.2 | 28.3 | 28.5 | 28.0 | 26.8 | 26.0 |  |
| TMIN °C (API metric) | 17.8 | 17.8 | 18.4 | 18.9 | 19.6 | 20.4 | 21.1 | 21.3 | 21.0 | 20.6 | 19.8 | 18.7 |  |
| PRCP in | 7.86 | 10.22 | 12.68 | 9.40 | 6.99 | 7.30 | 9.24 | 11.30 | 8.70 | 10.24 | 14.39 | 12.07 | 120.39 |
| PRCP mm (API metric) | 199.6 | 259.6 | 322.1 | 238.8 | 177.5 | 185.4 | 234.7 | 287.0 | 221.0 | 260.1 | 365.5 | 306.6 |  |

Years of data per month: TAVG 25–27, PRCP 29–30. Comp flags: S/S

#### USW00023183: PHOENIX SKY HARBOR INTL AP, AZ US, lat 33.4278, lon -112.0039, elev 337.4 m
| | 01 | 02 | 03 | 04 | 05 | 06 | 07 | 08 | 09 | 10 | 11 | 12 | Annual (ANN-*) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| TAVG °F | 56.8 | 59.9 | 66.3 | 73.2 | 82.0 | 91.4 | 95.5 | 94.4 | 89.2 | 77.4 | 65.1 | 55.8 | 75.6 |
| TMAX °F | 67.6 | 70.8 | 78.1 | 85.5 | 94.5 | 104.2 | 106.5 | 105.1 | 100.4 | 89.2 | 76.5 | 66.2 | 87.1 |
| TMIN °F | 46.0 | 49.0 | 54.5 | 60.8 | 69.5 | 78.6 | 84.5 | 83.6 | 78.1 | 65.6 | 53.7 | 45.3 | 64.1 |
| TMAX °C (API metric) | 19.8 | 21.6 | 25.6 | 29.7 | 34.7 | 40.1 | 41.4 | 40.6 | 38.0 | 31.8 | 24.7 | 19.0 |  |
| TMIN °C (API metric) | 7.8 | 9.4 | 12.5 | 16.0 | 20.8 | 25.9 | 29.2 | 28.7 | 25.6 | 18.7 | 12.1 | 7.4 |  |
| PRCP in | 0.87 | 0.87 | 0.83 | 0.22 | 0.13 | 0.02 | 0.91 | 0.93 | 0.57 | 0.56 | 0.57 | 0.74 | 7.22 |
| PRCP mm (API metric) | 22.1 | 22.1 | 21.1 | 5.6 | 3.3 | 0.5 | 23.1 | 23.6 | 14.5 | 14.2 | 14.5 | 18.8 |  |

Years of data per month: TAVG 27–28, PRCP 30–30. Comp flags: S/S

#### USW00023169: LAS VEGAS MCCARRAN AP, NV US, lat 36.0719, lon -115.1633, elev 649.5 m
| | 01 | 02 | 03 | 04 | 05 | 06 | 07 | 08 | 09 | 10 | 11 | 12 | Annual (ANN-*) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| TAVG °F | 49.5 | 53.5 | 60.8 | 67.7 | 77.3 | 87.6 | 93.2 | 91.7 | 83.6 | 70.4 | 57.2 | 48.2 | 70.1 |
| TMAX °F | 58.5 | 62.9 | 71.1 | 78.5 | 88.5 | 99.4 | 104.5 | 102.8 | 94.9 | 81.2 | 67.1 | 56.9 | 80.5 |
| TMIN °F | 40.5 | 44.1 | 50.5 | 56.9 | 66.1 | 75.8 | 82.0 | 80.6 | 72.4 | 59.6 | 47.3 | 39.6 | 59.6 |
| TMAX °C (API metric) | 14.7 | 17.2 | 21.7 | 25.8 | 31.4 | 37.4 | 40.3 | 39.3 | 34.9 | 27.3 | 19.5 | 13.8 |  |
| TMIN °C (API metric) | 4.7 | 6.7 | 10.3 | 13.8 | 18.9 | 24.3 | 27.8 | 27.0 | 22.4 | 15.3 | 8.5 | 4.2 |  |
| PRCP in | 0.56 | 0.80 | 0.42 | 0.20 | 0.07 | 0.04 | 0.38 | 0.32 | 0.32 | 0.32 | 0.30 | 0.45 | 4.18 |
| PRCP mm (API metric) | 14.2 | 20.3 | 10.7 | 5.1 | 1.8 | 1.0 | 9.7 | 8.1 | 8.1 | 8.1 | 7.6 | 11.4 |  |

Years of data per month: TAVG 27–28, PRCP 30–30. Comp flags: S/S

#### USW00023160: TUCSON INTL AP, AZ US, lat 32.1314, lon -110.9553, elev 776.9 m
| | 01 | 02 | 03 | 04 | 05 | 06 | 07 | 08 | 09 | 10 | 11 | 12 | Annual (ANN-*) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| TAVG °F | 53.6 | 56.2 | 61.9 | 68.1 | 76.8 | 86.1 | 88.2 | 86.9 | 82.8 | 72.6 | 61.5 | 53.0 | 70.6 |
| TMAX °F | 66.5 | 69.2 | 75.8 | 82.9 | 91.8 | 101.2 | 100.2 | 98.6 | 95.1 | 86.3 | 75.1 | 65.5 | 84.0 |
| TMIN °F | 40.8 | 43.2 | 48.0 | 53.3 | 61.8 | 71.1 | 76.3 | 75.2 | 70.4 | 59.0 | 47.9 | 40.5 | 57.3 |
| TMAX °C (API metric) | 19.2 | 20.7 | 24.3 | 28.3 | 33.2 | 38.4 | 37.9 | 37.0 | 35.1 | 30.2 | 23.9 | 18.6 |  |
| TMIN °C (API metric) | 4.9 | 6.2 | 8.9 | 11.8 | 16.6 | 21.7 | 24.6 | 24.0 | 21.3 | 15.0 | 8.8 | 4.7 |  |
| PRCP in | 0.84 | 0.84 | 0.56 | 0.24 | 0.20 | 0.23 | 2.21 | 1.98 | 1.32 | 0.67 | 0.56 | 0.96 | 10.61 |
| PRCP mm (API metric) | 21.3 | 21.3 | 14.2 | 6.1 | 5.1 | 5.8 | 56.1 | 50.3 | 33.5 | 17.0 | 14.2 | 24.4 |  |

Years of data per month: TAVG 28–29, PRCP 30–30. Comp flags: S/S

#### USW00023174: LOS ANGELES INTL AP, CA US, lat 33.9381, lon -118.3889, elev 29.6 m
| | 01 | 02 | 03 | 04 | 05 | 06 | 07 | 08 | 09 | 10 | 11 | 12 | Annual (ANN-*) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| TAVG °F | 57.9 | 57.9 | 59.1 | 61.1 | 63.6 | 66.4 | 69.6 | 70.7 | 70.1 | 67.1 | 62.3 | 57.6 | 63.6 |
| TMAX °F | 66.3 | 65.6 | 66.1 | 68.1 | 69.5 | 72.0 | 75.1 | 76.7 | 76.5 | 74.4 | 70.9 | 66.1 | 70.6 |
| TMIN °F | 49.4 | 50.1 | 52.2 | 54.2 | 57.6 | 60.9 | 64.0 | 64.8 | 63.7 | 59.8 | 53.7 | 49.1 | 56.6 |
| TMAX °C (API metric) | 19.1 | 18.7 | 18.9 | 20.1 | 20.8 | 22.2 | 23.9 | 24.8 | 24.7 | 23.6 | 21.6 | 18.9 |  |
| TMIN °C (API metric) | 9.7 | 10.1 | 11.2 | 12.3 | 14.2 | 16.1 | 17.8 | 18.2 | 17.6 | 15.4 | 12.1 | 9.5 |  |
| PRCP in | 2.86 | 2.99 | 1.73 | 0.60 | 0.28 | 0.08 | 0.04 | 0.00 | 0.11 | 0.49 | 0.82 | 2.23 | 12.23 |
| PRCP mm (API metric) | 72.6 | 75.9 | 43.9 | 15.2 | 7.1 | 2.0 | 1.0 | 0.0 | 2.8 | 12.4 | 20.8 | 56.6 |  |

Years of data per month: TAVG 26–27, PRCP 30–30. Comp flags: S/S

#### USW00023272: SAN FRANCISCO DWTN, CA US, lat 37.7706, lon -122.4269, elev 45.7 m
| | 01 | 02 | 03 | 04 | 05 | 06 | 07 | 08 | 09 | 10 | 11 | 12 | Annual (ANN-*) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| TAVG °F | 52.2 | 54.2 | 55.5 | 56.4 | 57.8 | 59.7 | 60.3 | 61.7 | 62.9 | 62.1 | 57.2 | 52.5 | 57.7 |
| TMAX °F | 57.8 | 60.4 | 62.1 | 63.0 | 64.1 | 66.5 | 66.3 | 67.9 | 70.2 | 69.8 | 63.7 | 57.9 | 64.1 |
| TMIN °F | 46.6 | 47.9 | 48.9 | 49.7 | 51.4 | 53.0 | 54.4 | 55.5 | 55.6 | 54.4 | 50.7 | 47.0 | 51.3 |
| TMAX °C (API metric) | 14.3 | 15.8 | 16.7 | 17.2 | 17.8 | 19.2 | 19.1 | 19.9 | 21.2 | 21.0 | 17.6 | 14.4 |  |
| TMIN °C (API metric) | 8.1 | 8.8 | 9.4 | 9.8 | 10.8 | 11.7 | 12.4 | 13.1 | 13.1 | 12.4 | 10.4 | 8.3 |  |
| PRCP in | 4.40 | 4.37 | 3.15 | 1.60 | 0.70 | 0.20 | 0.01 | 0.06 | 0.10 | 0.94 | 2.60 | 4.76 | 22.89 |
| PRCP mm (API metric) | 111.8 | 111.0 | 80.0 | 40.6 | 17.8 | 5.1 | 0.3 | 1.5 | 2.5 | 23.9 | 66.0 | 120.9 |  |

Years of data per month: TAVG 27–29, PRCP 29–30. Comp flags: S/S

#### USW00013874: ATLANTA HARTSFIELD INTL AP, GA US, lat 33.6300, lon -84.4417, elev 307.8 m
| | 01 | 02 | 03 | 04 | 05 | 06 | 07 | 08 | 09 | 10 | 11 | 12 | Annual (ANN-*) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| TAVG °F | 44.8 | 48.5 | 55.6 | 63.2 | 71.2 | 77.9 | 80.9 | 80.2 | 74.9 | 64.7 | 54.2 | 47.3 | 63.6 |
| TMAX °F | 54.0 | 58.2 | 65.9 | 73.8 | 81.1 | 87.1 | 90.1 | 89.0 | 83.9 | 74.4 | 64.1 | 56.2 | 73.1 |
| TMIN °F | 35.6 | 38.9 | 45.3 | 52.5 | 61.3 | 68.6 | 71.8 | 71.3 | 65.9 | 54.9 | 44.2 | 38.4 | 54.1 |
| TMAX °C (API metric) | 12.2 | 14.6 | 18.8 | 23.2 | 27.3 | 30.6 | 32.3 | 31.7 | 28.8 | 23.6 | 17.8 | 13.4 |  |
| TMIN °C (API metric) | 2.0 | 3.8 | 7.4 | 11.4 | 16.3 | 20.3 | 22.1 | 21.8 | 18.8 | 12.7 | 6.8 | 3.6 |  |
| PRCP in | 4.59 | 4.55 | 4.68 | 3.81 | 3.56 | 4.54 | 4.75 | 4.30 | 3.82 | 3.28 | 3.98 | 4.57 | 50.43 |
| PRCP mm (API metric) | 116.6 | 115.6 | 118.9 | 96.8 | 90.4 | 115.3 | 120.7 | 109.2 | 97.0 | 83.3 | 101.1 | 116.1 |  |

Years of data per month: TAVG 24–26, PRCP 30–30. Comp flags: S/S

#### USW00024233: SEATTLE TACOMA INTL AP, WA US, lat 47.4444, lon -122.3139, elev 112.8 m
| | 01 | 02 | 03 | 04 | 05 | 06 | 07 | 08 | 09 | 10 | 11 | 12 | Annual (ANN-*) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| TAVG °F | 42.8 | 44.0 | 47.1 | 51.3 | 57.5 | 62.0 | 67.1 | 67.4 | 62.6 | 53.8 | 46.5 | 42.0 | 53.7 |
| TMAX °F | 48.0 | 50.3 | 54.2 | 59.3 | 66.3 | 71.1 | 77.4 | 77.6 | 71.6 | 60.5 | 52.1 | 47.0 | 61.3 |
| TMIN °F | 37.7 | 37.7 | 39.9 | 43.3 | 48.7 | 53.0 | 56.8 | 57.2 | 53.6 | 47.0 | 40.9 | 37.1 | 46.1 |
| TMAX °C (API metric) | 8.9 | 10.2 | 12.3 | 15.2 | 19.1 | 21.7 | 25.2 | 25.3 | 22.0 | 15.8 | 11.2 | 8.3 |  |
| TMIN °C (API metric) | 3.2 | 3.2 | 4.4 | 6.3 | 9.3 | 11.7 | 13.8 | 14.0 | 12.0 | 8.3 | 4.9 | 2.8 |  |
| PRCP in | 5.78 | 3.76 | 4.17 | 3.18 | 1.88 | 1.45 | 0.60 | 0.97 | 1.61 | 3.91 | 6.31 | 5.72 | 39.34 |
| PRCP mm (API metric) | 146.8 | 95.5 | 105.9 | 80.8 | 47.8 | 36.8 | 15.2 | 24.6 | 40.9 | 99.3 | 160.3 | 145.3 |  |

Years of data per month: TAVG 25–27, PRCP 29–30. Comp flags: S/S

#### USW00094240: QUILLAYUTE STATE AP, WA US, lat 47.9375, lon -124.5550, elev 56.4 m
| | 01 | 02 | 03 | 04 | 05 | 06 | 07 | 08 | 09 | 10 | 11 | 12 | Annual (ANN-*) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| TAVG °F | 41.7 | 42.1 | 43.9 | 46.9 | 51.7 | 55.5 | 59.3 | 60.0 | 57.1 | 50.6 | 44.7 | 41.0 | 49.5 |
| TMAX °F | 47.5 | 49.1 | 51.2 | 54.8 | 60.0 | 63.3 | 67.6 | 68.9 | 66.7 | 58.7 | 51.2 | 46.7 | 57.1 |
| TMIN °F | 35.9 | 35.2 | 36.7 | 38.9 | 43.4 | 47.7 | 51.0 | 51.1 | 47.5 | 42.4 | 38.1 | 35.3 | 41.9 |
| TMAX °C (API metric) | 8.6 | 9.5 | 10.7 | 12.7 | 15.6 | 17.4 | 19.8 | 20.5 | 19.3 | 14.8 | 10.7 | 8.2 |  |
| TMIN °C (API metric) | 2.2 | 1.8 | 2.6 | 3.8 | 6.3 | 8.7 | 10.6 | 10.6 | 8.6 | 5.8 | 3.4 | 1.8 |  |
| PRCP in | 15.59 | 9.73 | 11.78 | 8.11 | 4.25 | 3.30 | 1.58 | 2.64 | 4.56 | 10.68 | 15.26 | 13.84 | 101.32 |
| PRCP mm (API metric) | 396.0 | 247.1 | 299.2 | 206.0 | 108.0 | 83.8 | 40.1 | 67.1 | 115.8 | 271.3 | 387.6 | 351.5 |  |

Years of data per month: TAVG 26–28, PRCP 29–30. Comp flags: S/S

#### USW00024243: YAKIMA AIR TERMINAL, WA US, lat 46.5683, lon -120.5428, elev 324.3 m
| | 01 | 02 | 03 | 04 | 05 | 06 | 07 | 08 | 09 | 10 | 11 | 12 | Annual (ANN-*) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| TAVG °F | 31.7 | 36.6 | 43.4 | 49.9 | 58.8 | 65.1 | 72.4 | 70.9 | 62.2 | 49.8 | 38.0 | 30.6 | 50.8 |
| TMAX °F | 39.5 | 47.2 | 56.6 | 64.7 | 74.1 | 80.7 | 89.9 | 88.5 | 79.4 | 64.4 | 48.9 | 38.2 | 64.3 |
| TMIN °F | 24.0 | 26.1 | 30.2 | 35.2 | 43.5 | 49.5 | 55.0 | 53.3 | 44.9 | 35.3 | 27.2 | 23.1 | 37.3 |
| TMAX °C (API metric) | 4.2 | 8.4 | 13.7 | 18.2 | 23.4 | 27.1 | 32.2 | 31.4 | 26.3 | 18.0 | 9.4 | 3.4 |  |
| TMIN °C (API metric) | -4.4 | -3.3 | -1.0 | 1.8 | 6.4 | 9.7 | 12.8 | 11.8 | 7.2 | 1.8 | -2.7 | -4.9 |  |
| PRCP in | 1.19 | 0.81 | 0.64 | 0.55 | 0.74 | 0.50 | 0.20 | 0.21 | 0.23 | 0.64 | 0.86 | 1.44 | 8.01 |
| PRCP mm (API metric) | 30.2 | 20.6 | 16.3 | 14.0 | 18.8 | 12.7 | 5.1 | 5.3 | 5.8 | 16.3 | 21.8 | 36.6 |  |

Years of data per month: TAVG 30–30, PRCP 30–30. Comp flags: S/S

#### USW00024157: SPOKANE INTL AP, WA US, lat 47.6217, lon -117.5281, elev 717.2 m
| | 01 | 02 | 03 | 04 | 05 | 06 | 07 | 08 | 09 | 10 | 11 | 12 | Annual (ANN-*) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| TAVG °F | 29.6 | 32.9 | 40.0 | 47.0 | 56.0 | 62.3 | 71.0 | 70.3 | 61.1 | 47.9 | 36.3 | 29.1 | 48.6 |
| TMAX °F | 34.5 | 39.5 | 48.6 | 56.9 | 67.1 | 73.7 | 84.4 | 83.8 | 73.6 | 57.7 | 42.3 | 33.8 | 58.0 |
| TMIN °F | 24.7 | 26.3 | 31.5 | 37.0 | 44.9 | 50.8 | 57.6 | 56.7 | 48.6 | 38.0 | 30.3 | 24.3 | 39.2 |
| TMAX °C (API metric) | 1.4 | 4.2 | 9.2 | 13.8 | 19.5 | 23.2 | 29.1 | 28.8 | 23.1 | 14.3 | 5.7 | 1.0 |  |
| TMIN °C (API metric) | -4.1 | -3.2 | -0.3 | 2.8 | 7.2 | 10.4 | 14.2 | 13.7 | 9.2 | 3.3 | -0.9 | -4.3 |  |
| PRCP in | 1.97 | 1.44 | 1.83 | 1.25 | 1.55 | 1.17 | 0.42 | 0.47 | 0.58 | 1.37 | 2.06 | 2.34 | 16.45 |
| PRCP mm (API metric) | 50.0 | 36.6 | 46.5 | 31.8 | 39.4 | 29.7 | 10.7 | 11.9 | 14.7 | 34.8 | 52.3 | 59.4 |  |

Years of data per month: TAVG 25–27, PRCP 30–30. Comp flags: R/S, S/S

#### USW00094846: CHICAGO OHARE INTL AP, IL US, lat 41.9950, lon -87.9336, elev 200.6 m
| | 01 | 02 | 03 | 04 | 05 | 06 | 07 | 08 | 09 | 10 | 11 | 12 | Annual (ANN-*) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| TAVG °F | 25.2 | 28.8 | 39.0 | 49.7 | 60.6 | 70.6 | 75.4 | 73.8 | 66.3 | 54.0 | 41.3 | 30.5 | 51.2 |
| TMAX °F | 31.6 | 35.7 | 47.0 | 59.0 | 70.5 | 80.4 | 84.5 | 82.5 | 75.5 | 62.7 | 48.4 | 36.6 | 59.5 |
| TMIN °F | 18.8 | 21.8 | 31.0 | 40.3 | 50.6 | 60.8 | 66.4 | 65.1 | 57.1 | 45.4 | 34.1 | 24.4 | 43.0 |
| TMAX °C (API metric) | -0.2 | 2.1 | 8.3 | 15.0 | 21.4 | 26.9 | 29.2 | 28.1 | 24.2 | 17.1 | 9.1 | 2.6 |  |
| TMIN °C (API metric) | -7.3 | -5.7 | -0.6 | 4.6 | 10.3 | 16.0 | 19.1 | 18.4 | 13.9 | 7.4 | 1.2 | -4.2 |  |
| PRCP in | 1.99 | 1.97 | 2.45 | 3.75 | 4.49 | 4.10 | 3.71 | 4.25 | 3.19 | 3.43 | 2.42 | 2.11 | 37.86 |
| PRCP mm (API metric) | 50.5 | 50.0 | 62.2 | 95.3 | 114.0 | 104.1 | 94.2 | 108.0 | 81.0 | 87.1 | 61.5 | 53.6 |  |

Years of data per month: TAVG 27–29, PRCP 29–30. Comp flags: S/S

#### USW00014922: MINNEAPOLIS/ST PAUL AP, MN US, lat 44.8831, lon -93.2289, elev 265.8 m
| | 01 | 02 | 03 | 04 | 05 | 06 | 07 | 08 | 09 | 10 | 11 | 12 | Annual (ANN-*) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| TAVG °F | 16.2 | 20.6 | 33.3 | 47.1 | 59.5 | 69.7 | 74.3 | 71.8 | 63.5 | 49.5 | 34.8 | 22.0 | 46.9 |
| TMAX °F | 23.6 | 28.5 | 41.7 | 56.6 | 69.2 | 79.0 | 83.4 | 80.7 | 72.9 | 58.1 | 41.9 | 28.8 | 55.4 |
| TMIN °F | 8.8 | 12.7 | 24.9 | 37.5 | 49.9 | 60.4 | 65.3 | 62.8 | 54.2 | 40.9 | 27.7 | 15.2 | 38.4 |
| TMAX °C (API metric) | -4.7 | -1.9 | 5.4 | 13.7 | 20.7 | 26.1 | 28.6 | 27.1 | 22.7 | 14.5 | 5.5 | -1.8 |  |
| TMIN °C (API metric) | -12.9 | -10.7 | -3.9 | 3.1 | 9.9 | 15.8 | 18.5 | 17.1 | 12.3 | 4.9 | -2.4 | -9.3 |  |
| PRCP in | 0.89 | 0.87 | 1.68 | 2.91 | 3.91 | 4.58 | 4.06 | 4.34 | 3.02 | 2.58 | 1.61 | 1.17 | 31.62 |
| PRCP mm (API metric) | 22.6 | 22.1 | 42.7 | 73.9 | 99.3 | 116.3 | 103.1 | 110.2 | 76.7 | 65.5 | 40.9 | 29.7 |  |

Years of data per month: TAVG 26–27, PRCP 30–30. Comp flags: S/S

#### USW00027502: BARROW POST ROGERS AP, AK US, lat 71.2833, lon -156.7814, elev 9.4 m
| | 01 | 02 | 03 | 04 | 05 | 06 | 07 | 08 | 09 | 10 | 11 | 12 | Annual (ANN-*) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| TAVG °F | -11.5 | -11.9 | -10.5 | 4.0 | 22.7 | 36.0 | 41.7 | 39.8 | 33.7 | 21.2 | 5.7 | -6.3 | 13.7 |
| TMAX °F | -5.2 | -5.5 | -3.8 | 10.6 | 26.9 | 40.9 | 47.7 | 44.5 | 37.1 | 25.6 | 11.5 | -0.4 | 19.2 |
| TMIN °F | -17.8 | -18.3 | -17.2 | -2.5 | 18.5 | 31.1 | 35.6 | 35.1 | 30.3 | 16.8 | -0.1 | -12.2 | 8.3 |
| TMAX °C (API metric) | -20.7 | -20.8 | -19.9 | -11.9 | -2.8 | 4.9 | 8.7 | 6.9 | 2.8 | -3.6 | -11.4 | -18.0 |  |
| TMIN °C (API metric) | -27.7 | -27.9 | -27.3 | -19.2 | -7.5 | -0.5 | 2.0 | 1.7 | -0.9 | -8.4 | -17.8 | -24.6 |  |
| PRCP in | 0.14 | 0.21 | 0.18 | 0.18 | 0.28 | 0.43 | 0.98 | 1.09 | 0.77 | 0.54 | 0.37 | 0.22 | 5.39 |
| PRCP mm (API metric) | 3.6 | 5.3 | 4.6 | 4.6 | 7.1 | 10.9 | 24.9 | 27.7 | 19.6 | 13.7 | 9.4 | 5.6 |  |

Years of data per month: TAVG 30–30, PRCP 29–30. Comp flags: S/S

#### USW00003017: DENVER INTL AP, CO US, lat 39.8328, lon -104.6575, elev 1650.2 m
| | 01 | 02 | 03 | 04 | 05 | 06 | 07 | 08 | 09 | 10 | 11 | 12 | Annual (ANN-*) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| TAVG °F | 31.7 | 32.7 | 41.6 | 47.8 | 57.4 | 68.2 | 75.1 | 72.9 | 64.8 | 51.1 | 39.4 | 31.2 | 51.2 |
| TMAX °F | 44.6 | 45.7 | 55.7 | 61.7 | 71.2 | 83.4 | 89.9 | 87.5 | 79.6 | 65.3 | 52.9 | 44.0 | 65.1 |
| TMIN °F | 18.7 | 19.7 | 27.5 | 33.9 | 43.6 | 53.0 | 60.2 | 58.3 | 50.0 | 37.0 | 26.0 | 18.4 | 37.2 |
| TMAX °C (API metric) | 7.0 | 7.6 | 13.2 | 16.5 | 21.8 | 28.6 | 32.2 | 30.8 | 26.4 | 18.5 | 11.6 | 6.7 |  |
| TMIN °C (API metric) | -7.4 | -6.8 | -2.5 | 1.1 | 6.4 | 11.7 | 15.7 | 14.6 | 10.0 | 2.8 | -3.3 | -7.6 |  |
| PRCP in | 0.38 | 0.41 | 0.86 | 1.68 | 2.16 | 1.94 | 2.14 | 1.58 | 1.35 | 0.99 | 0.64 | 0.35 | 14.48 |
| PRCP mm (API metric) | 9.7 | 10.4 | 21.8 | 42.7 | 54.9 | 49.3 | 54.4 | 40.1 | 34.3 | 25.1 | 16.3 | 8.9 |  |

Years of data per month: TAVG 22–26, PRCP 25–26. Comp flags: R/S, S/S

#### USW00014755: MT WASHINGTON, NH US, lat 44.2667, lon -71.2994, elev 1910.2 m
| | 01 | 02 | 03 | 04 | 05 | 06 | 07 | 08 | 09 | 10 | 11 | 12 | Annual (ANN-*) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| TAVG °F | 5.8 | 5.9 | 12.9 | 23.7 | 36.3 | 45.5 | 49.9 | 48.7 | 43.1 | 31.3 | 20.8 | 11.8 | 28.0 |
| TMAX °F | 14.9 | 14.8 | 20.8 | 30.7 | 42.5 | 51.4 | 55.3 | 54.2 | 49.1 | 37.7 | 28.4 | 20.1 | 35.0 |
| TMIN °F | -3.2 | -3.0 | 4.9 | 16.7 | 30.2 | 39.6 | 44.5 | 43.2 | 37.1 | 24.9 | 13.1 | 3.5 | 21.0 |
| TMAX °C (API metric) | -9.5 | -9.6 | -6.2 | -0.7 | 5.8 | 10.8 | 12.9 | 12.3 | 9.5 | 3.2 | -2.0 | -6.6 |  |
| TMIN °C (API metric) | -19.6 | -19.4 | -15.1 | -8.5 | -1.0 | 4.2 | 6.9 | 6.2 | 2.8 | -3.9 | -10.5 | -15.8 |  |
| PRCP in | 5.74 | 5.45 | 6.72 | 7.31 | 7.68 | 8.59 | 8.93 | 7.72 | 7.66 | 9.99 | 8.09 | 7.35 | 91.23 |
| PRCP mm (API metric) | 145.8 | 138.4 | 170.7 | 185.7 | 195.1 | 218.2 | 226.8 | 196.1 | 194.6 | 253.7 | 205.5 | 186.7 |  |

Years of data per month: TAVG 27–29, PRCP 29–30. Comp flags: S/S

### Station contrasts (my own arithmetic on the values above; label as derived, not as quotes)
- **Rain shadow across the Olympics and Cascades (annual PRCP):** Quillayute 101.32 in, Seattle–Tacoma 39.34 in, Yakima 8.01 in, Spokane 16.45 in. Yakima gets about 1/12 of Quillayute's precipitation, and about 1/5 of Seattle's.
- **Maritime vs continental (warmest minus coldest month TAVG):** San Francisco 62.9 (Sep) − 52.2 (Jan) = 10.7 °F. Seattle 67.4 (Aug) − 42.0 (Dec) = 25.4 °F. Chicago 75.4 − 25.2 = 50.2 °F. Minneapolis 74.3 − 16.2 = 58.1 °F. Hilo 76.6 − 71.2 = 5.4 °F.
- **Mediterranean dry summer:** at LAX, Jun–Sep PRCP is 0.08 + 0.04 + 0.00 + 0.11 = 0.23 in of 12.23 in a year; Dec–Feb is 2.23 + 2.86 + 2.99 = 8.08 in. San Francisco Jul is 0.01 in and Dec is 4.76 in.
- **Monsoon (Tucson):** Jul–Sep 2.21 + 1.98 + 1.32 = 5.51 in of 10.61 in a year (about 52 %). Compare Phoenix Jul–Aug 0.91 + 0.93 in, and Las Vegas Jul–Aug 0.38 + 0.32 in.
- **Altitude:** Mt Washington (1910.2 m) has an annual TAVG of 28.0 °F and a July TAVG of 49.9 °F. On Peel's criteria that is Thot < 10 °C, so it would class as **ET** (49.9 °F = 9.9 °C). Check this classification before using it.
- **Polar:** Utqiaġvik's warmest month is Jul at 41.7 °F (5.4 °C), which is Thot < 10 °C, so **ET**. Its annual PRCP is 5.39 in.
- **Humid subtropical, no dry season:** Atlanta's monthly PRCP ranges from 3.28 to 4.75 in, with 50.43 in a year.
- **Tropical rainforest:** Hilo's coldest month is Feb at 71.2 °F (21.8 °C), so Tcold ≥ 18. Its driest month is May at 6.99 in (177.5 mm), so Pdry ≥ 60, which gives **Af**.

---

## 3. Plain-language explanations (verbatim)

### 3a. NWS Glossary (NOAA National Weather Service; public domain; definitions)
URLs: `https://forecast.weather.gov/glossary.php?word=<term>`. Saved in `gloss/`.
- **Rain Shadow:** "An area of reduced precipitation on the lee side of a mountain barrier caused by warming of air and dissipation of cloudiness as air descends the barrier."
- **Orographic Lifting:** "Same as Upslope Flow ; occurs when air is forced to rise and cool due to terrain features such as hills or mountains. If the cooling is sufficient, water vapor condenses into clouds. Additional cooling results in rain or snow. It can cause extensive cloudiness and increased amounts of precipitation in higher terrain."
- **Foehn:** "A warm, dry wind on the lee side of a mountain range, the warmth and dryness of the air being due to adiabatic compression as the air descends the mountain slopes. In the United States, the term chinook is used for Foehn winds in the Rocky and Sierra mountains."
- **Chinook:** "This is a region-specific term used for Foehn Winds in the lee of the Rocky Mountains in the United States; Foehn Winds are warm, dry winds that occur in the lee of high mountain ranges. It is a fairly common wintertime phenomena in the mountainous west and in parts of Alaska."
- **Monsoon:** "A thermally driven wind arising from differential heating between a land mass and the adjacent ocean that reverses its direction seasonally."
- **Urban Heat Island:** "The increased air temperatures in urban areas in contrast to cooler surrounding rural areas."
- **Climate:** "The composite or generally prevailing weather conditions of a region, throughout the year, averaged over a series of years." **Microclimate:** "The climate of a small area such as a cave, house, city or valley that may be different from that in the general region."
- **Lapse rates (mountain climates):** "Lapse Rate: The rate of change of an atmospheric variable, usually temperature, with height." / "Environmental Lapse Rate: The rate of decrease of air temperature with height, usually measured with a radiosonde." / "Dry Adiabatic Lapse Rate … The dry adiabatic lapse rate (abbreviated DALR) is 5.5°F per 1000 ft or 9.8°C per km." The page source shows a mis-encoded "Â°", which is meant as "°". / "The moist adiabatic lapse rate (abbreviated MALR) is not a constant like the dry adiabatic lapse rate but is dependent on parcel temperature and pressure."
- **Bermuda High:** "A semi-permanent, subtropical area of high pressure in the North Atlantic Ocean off the East Coast of North America that migrates east and west with varying central pressure. … Also known as Azores High."
- No glossary entries exist for "continental climate", "maritime climate", "Mediterranean climate", "subtropical high" or "continentality".

### 3b. USGS, *Deserts: Geology and Resources* (online edition): deserts, subtropical highs, rain-shadow deserts
- U.S. Geological Survey General Interest Publication, online edition at https://pubs.usgs.gov/gip/deserts/ (pages last modified 1997–2001). Public domain (USGS). The author is not named on the pages I fetched (author: not verified). Kind: educational. Some numbers are dated, for example the 57 °C Sahara figure.
- /what/: "Approximately one-third of the Earth's land surface is desert, arid land with meager rainfall that supports only sparse vegetation and a limited population of people and animals." / "In 1953, Peveril Meigs divided desert regions on Earth into three categories according to the amount of precipitation they received. In this now widely accepted system, extremely arid lands have at least 12 consecutive months without rainfall, arid lands have less than 250 millimeters of annual rainfall, and semiarid lands have a mean annual precipitation of between 250 and 500 millimeters."
- /atmosphere/ (subtropical highs): "Around 30° N. and S., the poleward flowing air begins to descend toward the surface in subtropical high-pressure belts. The sinking air is relatively dry because its moisture has already been released near the Equator above the tropical rain forests." / "Most of the nonpolar deserts lie within the two trade winds belts." / "In the zone between about 30° N. and 30° S., the surface air flows toward the Equator and the flow aloft is poleward."
- /types/: "Deserts are classified by their geographical location and dominant weather pattern as trade wind, midlatitude, rain shadow, coastal, monsoon, or polar deserts."
  - "Trade wind deserts … These dry winds dissipate cloud cover, allowing more sunlight to heat the land. Most of the major deserts of the world lie in areas crossed by the trade winds."
  - "Midlatitude deserts occur between 30° and 50° N. and S., poleward of the subtropical highpressure zones. These deserts are in interior drainage basins far from oceans and have a wide range of annual temperatures."
  - "Rain shadow deserts are formed because tall mountain ranges prevent moisture-rich clouds from reaching areas on the lee, or protected side, of the range. As air rises over the mountain, water is precipitated and the air loses its moisture content. A desert is formed in the leeside "shadow" of the range."
  - "Coastal deserts generally are found on the western edges of continents near the Tropics of Cancer and Capricorn. They are affected by cold ocean currents that parallel the coast." / "In the Atacama, measurable rainfall--1 millimeter or more of rain--may occur as infrequently as once every 5-20 years."
  - "Polar deserts are areas with annual precipitation less than 250 millimeters and a mean temperature during the warmest month of less than 10° C."
  - Caution: the monsoon-desert paragraph says "The southeast trade winds of the Indian Ocean, for example, provide heavy summer rains in India". That is a simplification, so prefer the NWS monsoon text in 3d.

### 3c. Continentality vs maritime climates
- **USGS Water Science School, "Specific Heat Capacity and Water"**, https://www.usgs.gov/water-science-school/science/specific-heat-capacity-and-water (page date "August 24, 2026"; public domain text. The page photo is credited to Wikimedia, so do not use it). Verbatim: "Water has a high specific heat capacity—it absorbs a lot of heat before it begins to get hot." / "The oceans and lakes help regulate the temperature ranges that people experience in their towns and cities. Water surrounding or near cities takes longer to heat up and longer to cool down than do land masses. Cities near the oceans will tend to have less change and less extreme temperatures than inland cities. This property of water is one reason why states on the coast and in the center of the United States can differ so much in temperature patterns. A Great Plains state, such as Nebraska, will have colder winters and hotter summers than Oregon, which has a higher latitude but has the Pacific Ocean nearby."
- **NOAA Ocean Exploration, "How does the ocean affect climate and weather on land?"**, https://oceanexplorer.noaa.gov/ocean-fact/climate/ (Published June 21, 2013; last updated July 6, 2022). Verbatim: "The ocean influences weather and climate by storing solar radiation, distributing heat and moisture around the globe, and driving weather systems." / "Ocean currents act much like a conveyor belt, transporting warm water and precipitation from the equator toward the poles and cold water from the poles back to the tropics. Thus, ocean currents regulate global climate, helping to counteract the uneven distribution of solar radiation reaching Earth's surface." / "The tropics are particularly rainy because heat absorption, and thus ocean evaporation, is highest in this area."

### 3d. Monsoons: NWS Albuquerque, "North American Monsoon Highlights: Introduction"
- https://www.weather.gov/abq/northamericanmonsoon-intro (NOAA NWS WFO Albuquerque; public domain; no date shown; it cites a 1950–2017 average). Kind: educational with observations.
- "The term monsoon generally refers to the seasonal reversal in atmospheric low-level circulations, particularly the surface winds and associated precipitation, resulting in a pattern of wet summers and dry winters."
- "The basic forcing of the monsoons is derived from a seasonal contrast in the heating of the land continent versus the ocean."
- "New Mexico is impacted by the North American Monsoon System (NAMS), which is also referred to as the Southwest Monsoon. While precipitation increases in New Mexico associated with the monsoon are generally noted in July, development of the system takes place over Mexico during May and June."
- "Both upper level and surface circulations associated with the North American Monsoon transport moisture from the Pacific Ocean, the Gulf of California and the Gulf of America into Mexico and the Southwest U.S."
- "The onset of the moist phase of the North American Monsoon in New Mexico varies, but average onset occurs around July 3 for the southwest corner of the state and around July 9 for the central Rio Grande valley, including Albuquerque."
- "While portions of Mexico receive as much as 70% of their annual precipitation in July, August and September, the southwest corner of New Mexico receives about 50 to 60% of their annual precipitation for the same period with a decrease to 40 to 50% across the central and northern portions of the state."
- "Active periods of precipitation are known as monsoon "bursts", and are separated by drier, less active monsoon "breaks"."
- "While the average from 1950 through 2017 is 4.82 inches, nearly double that amount was received in 2006 and the state averaged only 2.30 inches in 2003." This refers to New Mexico July–August precipitation.
- NWS Tucson's monsoon page (https://www.weather.gov/twc/monsoon) was fetched, but its education text loads by script, so I could not extract it as text.

### 3e. Urban heat islands: U.S. EPA, "What Are Heat Islands?"
- https://www.epa.gov/heatislands/what-are-heat-islands (redirected from /learn-about-heat-islands). "Last updated on August 18, 2026". U.S. EPA; public domain text. Kind: review summary.
- "Structures such as buildings, roads, and other infrastructure absorb and re-emit the sun's heat more than natural landscapes such as forests and water bodies. Urban areas, where these structures are highly concentrated and greenery is limited, become "islands" of higher temperatures relative to outlying areas."
- "A review of research studies and data found that in the United States, the heat island effect results in daytime temperatures in urban areas about 1–7°F higher than temperatures in outlying areas and nighttime temperatures about 2–5°F higher. Humid regions (primarily in the eastern United States) and cities with larger and denser populations experience the greatest temperature differences." The footnote [1] is: Hibbard, K.A., F.M. Hoffman, D. Huntzinger, and T.O. West. 2017. Changes in land cover and terrestrial biogeochemistry. In *Climate Science Special Report: Fourth National Climate Assessment, Volume I*. USGCRP, pp. 277–302. doi: 10.7930/J0416V6X (DOI as printed by EPA; not checked on Crossref).
- "Often, heat islands build throughout the day and become more pronounced after sunset due to the slow release of heat from urban materials."
- "Calm and clear weather conditions result in more severe heat islands by maximizing the amount of solar energy reaching urban surfaces and minimizing the amount of heat that can be carried away. Conversely, strong winds and cloud cover suppress heat island formation."
- "On a warm day, conventional roofing materials may reach as much as 66°F warmer than the surrounding air temperatures."
- "Increased electricity demand for air conditioning ranges from 1–9% for each 2°F increase in temperature".

### 3f. Latitude and sunlight (tropical, temperate and polar climates): NASA Earth Observatory
- Lindsey, R. (2009). *Climate and Earth's Energy Budget.* NASA Earth Observatory, now at https://science.nasa.gov/earth/earth-observatory/climate-and-earths-energy-budget/. This is the same page as Phase 20B source 1b; bio not verified. Illustrations are by Robert Simmon. Kind: educational simplification.
- "The Sun doesn't heat the Earth evenly. Because the Earth is a sphere, the Sun heats equatorial regions more than polar regions."
- "Because the Earth is a sphere, only areas near the equator at midday come close to being perpendicular to the path of incoming light. Everywhere else, the light comes in at an angle. The progressive decrease in the angle of solar illumination with increasing latitude reduces the average solar irradiance by an additional one-half."
- Figure caption: "The tropics (from 0 to 23.5° latitude) receive about 90% of the energy compared to the equator, the mid-latitudes (45°) roughly 70%, and the Arctic and Antarctic Circles about 40%."
- "Instead Earth's axis is tilted off vertical by about 23 degrees. As the Earth orbits the Sun, the tilt causes one hemisphere and then the other to receive more direct sunlight and to have longer days."
- "Total energy received ranges from 0 (during polar winter) to about 50 (during polar summer) megajoules per square meter per day."
- "In the tropics there is a net energy surplus because the amount of sunlight absorbed is larger than the amount of heat radiated. In the polar regions, however, there is an annual energy deficit because the amount of heat radiated to space is larger than the amount of absorbed sunlight."
- "Areas around the equator absorbed about 200 watts per square meter more on average (orange and red) than they reflected or radiated. Areas near the poles reflected and/or radiated about 200 more watts per square meter (green and blue) than they absorbed. Mid-latitudes were roughly in balance." (September 2008, CERES; observation.)
- USGS Deserts /atmosphere/ adds: "The Earth's axis is inclined 23.5° from the ecliptic". Note that NASA says "about 23 degrees"; record both.

### 3g. Mediterranean climate (dry summers): U.S. National Park Service
- **Golden Gate NRA "Weather"**, https://www.nps.gov/goga/learn/nature/weather.htm (last updated February 28, 2015; NPS; public domain text): "The coastal areas of central and southern California have a Mediterranean climate . Mediterranean climate regions occur on the west coasts of continents at mid-latitudes throughout the world. Other regions that share our climate include the Mediterranean Basin of Europe, Chile, South Africa, and Western Australia. In these regions, temperate wet winters contrast with warm or hot dry summers. The average annual rainfall in central California ranges from 15 to 55 inches, with almost all rain occurring between November and April and an extended drought during the summer months ." / "Mountains parallel to the coast produce rain shadows and drier interior valleys. During the summer, gaps in the coastal ranges permit ocean fog to penetrate inland, providing some relief from summer heat and drought." / "Mediterranean habitats … harboring one fifth of all known plant species on the planet … although geographically they take up less than 3% of Earth's land surface." The page's wording is informal ("ridiculously diverse"), so quote it selectively.
- **Channel Islands NP "Weather"**, https://www.nps.gov/chis/learn/nature/weather.htm (last updated June 17, 2016): "Channel Islands National Park has a Mediterranean-type climate. This climate type is characterized by cool, wet winters with average annual rainfall of 8-40" and hot, dry summers. These climate regions occur in only five locations throughout the world including parts of California, along the Mediterranean Sea, central Chile, parts of southwestern Western and South Australia, and the southwestern Cape region of South Africa." / "In the Köppen system of climate classification this is a cool Mediterranean climate (Csb) or a Mediterranean Dry Summer Subtropical climate type, with a cool summer regime." / "Both winter and summer temperature extremes are moderated by the moist ocean air".

### 3h. Mountain climates
- Use the NWS lapse-rate definitions (3a) and the Phase 20A U.S. Standard Atmosphere lapse rate (6.5 K/km; see SOURCE_NOTES_PHASE20A.md S1), with Mt Washington and Denver data (Section 2).
- USGS Deserts /form/: "The deserts of our world are not restricted by latitude, longitude, or elevation." / "The People's Republic of China has both the highest desert, the Qaidam Depression that is 2,600 meters above sea level, and one of the lowest deserts, the Turpan Depression that is 150 meters below sea level."

---

## NOT FOUND / gaps
1. **Beck et al. 2018 Table 1 was not read** (nature.com robots.txt disallows ClaudeBot, anthropic-ai and Claude-Web). Peel et al. 2007 Table 1 (CC BY-NC-SA 2.5) is used instead.
2. **No Köppen map file was downloaded.** figshare (the only host for the GloH2O V1 and V3 archives) returned an AWS WAF challenge, so I stopped. The Peel 2007 supplement zip (hydrol-earth-syst-sci.net/…supplement.zip) was not tried.
3. **NCEI bulk CSVs (`/data/normals-monthly/...`) are robots-disallowed.** I used the Access Data Service API, which is allowed. The readme and methodology PDF (also under /data/) were not read, so the **comp-flag "S"/"R" and measurement-flag "X" meanings are unverified**.
4. **No dataset DOI was found for the 1991–2020 monthly normals.** The NCEI product page lists only the papers' DOIs. A DataCite lookup failed.
5. **API bug:** `units=metric` leaves MLY-TAVG-NORMAL in °F.
6. **No tropical-rainforest station outside the U.S.** (Singapore, Manaus) and **no Mumbai monsoon station.** NCEI normals cover U.S. stations only. Hilo (Af) and Tucson (North American Monsoon) stand in for them.
7. **No official verbatim explanation of why Mediterranean summers are dry** (the poleward shift of the subtropical high). NPS pages describe the pattern but not the cause, and USGS describes the subtropical highs in general. Do not invent the link as a quote.
8. **No "continentality" definition** in the NWS glossary. USGS Water Science School is used instead.
9. NWS Tucson monsoon education text is script-loaded and was not extracted. NWS JetStream and spc.noaa.gov were not used (blocked or disallowed per the brief).
10. The USGS *Deserts* author is not named on the fetched pages; bio not verified. No author bios were verified in this round.
