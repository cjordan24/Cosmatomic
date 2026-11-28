# Source notes: Phase 23B (Pleistocene ice ages and Milankovitch cycles)

Research date 2026-11-28. Rules: /tmp/vv-research/p20/RULES.md. User-Agent "VoyagerVentures-Research/0.1 (educational; respects robots.txt)", at least 1.1 s between requests to the same host. Downloads are in `/tmp/vv-research/p23/b/` (data) and `/tmp/vv-research/p23/b/pages/` (saved pages and their text extracts). All files are well under 5 MB; the largest is meghalayan.pdf at 4.66 MB.

## robots.txt log (each fetched first, in a separate command)

| Host | Result | Decision |
|---|---|---|
| www.ncei.noaa.gov | 200. Rules for `User-agent: *` are `Disallow: /data*`, `Disallow: /orders*`, `Allow: /data/oceans/coris/library*`, plus several `/access/crn/...` disallows. There is no rule for `/pub`. | robots.txt rules are prefix matches from the root of the path, so `/data*` covers `/data...` and not `/pub/data/...`. **`/pub/data/paleo/...` is allowed.** None of the requests redirected (checked `redirect_url`, which was empty every time). The `/data/...` paths were not touched. |
| www.pangaea.de | 200. Disallows only /advanced/, /shared/, /user/, /ddi and similar paths | Not needed, because NCEI worked |
| doi.pangaea.de | 200. `User-agent: *` / `Disallow:` (allow all) | Not needed |
| vo.imcce.fr | **403 "Access not granted / Your IP address is blocked."** | **Stopped. IMCCE was not used and La2004 was not obtained** (see gaps) |
| science.nasa.gov | 200. `User-agent: *` / `Allow: /` | Used |
| www.usgs.gov | 200. Only admin, search and user paths are disallowed | Used |
| pubs.usgs.gov | 200. Only `Disallow: /archive/` | Used |
| stratigraphy.org | 200. Contains only a Sitemap line, no disallows | Used (one PDF) |
| www.climate.gov | 200. Only admin, search and asset paths are disallowed | Allowed, but not needed |
| oceanexplorer.noaa.gov | 200. Only `Disallow: /map/*` | Allowed, but the target page returned **404** |
| olympiccoast.noaa.gov | 200. `Disallow:` (allow all) | Used |
| api.crossref.org | (DOI checks only) | Used to verify DOIs |

Off-limits hosts that were **not** fetched: Wiley (Bereiter 2015), Science/AAAS (Jouzel 2007), Elsevier (Berger & Loutre 1991) and Nature (Lüthi 2008). Each is cited by DOI only.

---

## D1. Antarctic ice-core CO₂ composite (Bereiter et al. 2015). Data kind: observation (ice-core air measurements) on a modelled gas-age chronology

- **File:** `/tmp/vv-research/p23/b/antarctica2015co2composite.txt` (50,236 bytes, tab-delimited, comment lines start with `#`).
- **URL:** https://www.ncei.noaa.gov/pub/data/paleo/icecore/antarctica/antarctica2015co2composite.txt
- **Host:** NOAA NCEI / World Data Service for Paleoclimatology. Header text: "World Data Center for Paleoclimatology, Boulder and NOAA Paleoclimatology Program". Online_Resource: http://ncdc.noaa.gov/paleo/study/17975. Contribution_Date: 2015-02-04.
- **Header instruction (verbatim):** "NOTE: Please cite Publication, and Online_Resource and date accessed when using these data."
- **Licence:** the file does not state one. NOAA paleo archive data are distributed openly with a request for citation. The NCEI study JSON endpoint returned 204 (empty), so **no formal licence statement was verified.**
- **Primary citation (Crossref-verified):** Bereiter, B., Eggleston, S., Schmitt, J., Nehrbass-Ahles, C., Stocker, T. F., Fischer, H., Kipfstuhl, S., & Chappellaz, J. (2015). Revision of the EPICA Dome C CO₂ record from 800 to 600 kyr before present. *Geophysical Research Letters*, 42(2), 542–549. https://doi.org/10.1002/2014GL061957 (Wiley; cite by DOI only, not fetched).
- **Also cited in the header (Crossref-verified):** Lüthi, D. et al. (2008). High-resolution carbon dioxide concentration record 650,000–800,000 years before present. *Nature*, 453(7193), 379–382. https://doi.org/10.1038/nature06949
- **Header, verbatim:**
  - "Age unit is in years before present (yr BP) where present refers to 1950 AD."
  - "This new version of CO2 composite replaces the old version of Luthi et al. (2008), which contains the analytical bias described in Bereiter et al. 2015 and lower quality data in other sections."
  - Composite segments: "-51-1800 yr BP: Law Dome (Rubino et al., 2013) / 1.8-2 kyr BP: Law Dome (MacFarling Meure et al., 2006) / 2-11 kyr BP: Dome C (Monnin et al., 2001 + 2004) / 11-22 kyr BP: WAIS (Marcott et al., 2014) minus 4 ppmv (see text) / 22-40 kyr BP: Siple Dome (Ahn et al., 2014) / 40-60 kyr BP: TALDICE (Bereiter et al., 2012) / 60-115 kyr BP: EDML (Bereiter et al., 2012) / 105-155 kyr BP: Dome C Sublimation (Schneider et al., 2013) / 155-393 kyr BP: Vostok (Petit et al., 1999) / 393-611 kyr BP: Dome C (Siegenthaler et al., 2005) / 612-800 kyr BP: Dome C (Bereiter et al., 2014)"
  - Chronology: "Antarctic ice core chronology 2012 (AICC2012, Bazin et al., 2013) except for Law Dome, WAIS and Siple Dome"
  - Site: EPICA Dome C, −75.1011°, 123.3478°. Earliest_Year: 805668. Most_Recent_Year: -51. Time_Unit: "Cal. Year BP".
- **Columns (header line `age_gas_calBP	co2_ppm	co2_1s_ppm`):**
  - `age_gas_calBP`: "age, gas, , calendar years before present, , , , AICC2012 except for Law Dome WAIS and Siple Dome"
  - `co2_ppm`: "CO2 concentration, , , ppmv, , , corrected"
  - `co2_1s_ppm`: "CO2 concentration sigma mean, , , ppmv, , , Where no individual sigma is given we use average for system/record"
- **1,901 data rows**, from −51.03 yr BP (368.02 ppm) to 805,668.87 yr BP (207.29 ppm).
- **Values computed from the file (my arithmetic, not printed in the header):**
  - Minimum over 0–800,000 yr BP: **173.71 ppm at 667,409.86 yr BP** (σ 1.38). This agrees with the Lüthi 2008 abstract quoted in the header: "Carbon dioxide levels are below 180 parts per million by volume (p.p.m.v.) for a period of 3,000 yr during Marine Isotope Stage 16".
  - Maximum before 150 yr BP, i.e. before 1800 CE (pre-industrial): **298.6 ppm at 335,102.31 yr BP**.
  - Between 18 and 24 kyr BP (Last Glacial Maximum window): minimum 183.13 ppm at 23,873.8 yr BP and maximum 197.67 ppm at 23,276.7 yr BP (62 points).
  - Holocene pre-industrial (150–11,700 yr BP): maximum 284.54 ppm at 750.19 yr BP. Lowest value at or below 11,700 yr BP: 247.55 ppm at 11,664.54 yr BP.

## D2. EPICA Dome C deuterium and temperature estimate (Jouzel et al. 2007). Data kind: reconstruction (temperature derived from δD)

- **File:** `/tmp/vv-research/p23/b/edc3deuttemp2007.txt` (357,470 bytes, fixed-width text, Latin-1 characters in the header).
- **URL:** https://www.ncei.noaa.gov/pub/data/paleo/icecore/antarctica/epica_domec/edc3deuttemp2007.txt
- **Header, verbatim:**
  - "LAST UPDATE: 11/26/2007 (Replaced age model. This file now includes EDC3 age model. Previous version of this file dated 10/16/2007 erroneously included the older EDC1-EDC2 age model)"
  - "CONTRIBUTOR: Valérie Masson-Delmotte, LSCE/IPSL"
  - "SUGGESTED DATA CITATION: Jouzel, J., et al. 2007. EPICA Dome C Ice Core 800KYr Deuterium Data and Temperature Estimates. IGBP PAGES/World Data Center for Paleoclimatology Data Contribution Series # 2007-091. NOAA/NCDC Paleoclimatology Program, Boulder CO, USA."
  - "PERIOD OF RECORD: 803 KYrBP - present"
  - "High-resolution (55cm.) deuterium (dDice) profile from the EPICA Dome C Ice Core, Antarctica (75º 06' S, 123º 21' E), with an optimal accuracy of ± 0.5 ‰ (1 sigma), from the surface down to 3259.7 m."
  - "Temperature estimated after correction for sea-water isotopic composition (Bintanja et al, 2005) and for ice sheet elevation (Parrenin et al, 2007) on EDC3 age scale (Parrenin et al, 2007)"
  - Columns: "Column 1: Bag number (55 cm sample) / Column 2: Top depth (m) / Column 3: EDC3 age scale (years before year 1950) / Column 4: dD data (per mille with respect to SMOW) / Column 5: Temperature estimate (temperature difference from the average of the last 1000 years)"
  - Header row: `Bag  ztop  Age  Deuterium  Temperature`. Data start on file line 93. Bags 1–12 (ages −50 to 30.6 yr) have no δD or temperature values.
- **Primary citation (Crossref-verified):** Jouzel, J., Masson-Delmotte, V., Cattani, O., et al. (2007). Orbital and Millennial Antarctic Climate Variability over the Past 800,000 Years. *Science*, 317(5839), 793–796. https://doi.org/10.1126/science.1141038
  - **Discrepancy:** the file header gives "pp.793-797" and Crossref gives 793–796. Both are recorded here; the Science page was not fetched.
- **Header abstract (verbatim excerpt):** "We suggest that the interplay between obliquity and precession accounts for the variable intensity of interglacial periods in ice core records."
- **Values computed from the file (my arithmetic):**
  - 5,785 complete rows; the last is bag 5800, 3189.45 m, 801,662 yr, δD −440.9, ΔT −8.82.
  - Coldest ΔT: **−10.58 °C** (bag 1000, 549.45 m, 24,015.4 yr).
  - Warmest ΔT: **+5.46 °C** (bag 3075, 1690.7 m, 128,662.31 yr; last interglacial).
  - Mean ΔT for 18–24 kyr: −9.35 °C (127 samples).
- **Vostok:** not downloaded, because EPICA Dome C covers the same need. The CO₂ composite already uses Vostok (Petit et al. 1999) for 155–393 kyr BP.

## D3. Orbital parameters and insolation (Berger & Loutre 1991). Data kind: model output (astronomical solution)

- **Directory:** https://www.ncei.noaa.gov/pub/data/paleo/climate_forcing/orbital_variations/insolation/ (allowed under /pub). The listing is saved as `insolation_dir_index.html`.
- **Files downloaded to /tmp/vv-research/p23/b/:**
  - `orbit91` (375,215 bytes): 0 to −5,000 kyr at 1 kyr steps.
  - `insol91.jun` (63,169 bytes): June mid-month insolation at 90N, 60N, 30N, 0, 30S, 60S and 90S, 0–1 Myr.
  - `readme_insolation.txt`, `contents.91`, `citation` (documentation).
- **readme, verbatim:**
  - "NAME OF DATA SET: Orbital Variations and Insolation Database / LAST UPDATE: 5/92 (Addition of 1991 Solution) / CONTRIBUTOR: A. Berger, Catholic University of Louvain"
  - "SUGGESTED DATA CITATION: Berger, A., 1992, Orbital Variations and Insolation Database. IGBP PAGES/World Data Center for Paleoclimatology Data Contribution Series # 92-007. NOAA/NGDC Paleoclimatology Program, Boulder CO, USA."
  - "The 1978 solution is preferred for time 0 (1950 A.D.). The two solutions are equivalent through 800 KYBP, and the 1991 solution is preferred for times greater than 800 KYBP."
  - "Solar constant taken as 1.95 cal/cm2/min for 1978 solution, and 1360 W/m2 for 1991."
- **orbit91 column definitions (readme and contents.91, verbatim):** "first column: time in kyr (negative for the past; origin (0) is 1950 A.D.) / second column: eccentricity, ECC / third col: longitude of perihelion from moving vernal equinox in degrees, OMEGA / fourth column: obliquity in degree and decimals, OBL / fifth column: climatic precession, ECC . SIN(OMEGA) / sixth column: mid-month insolation 65N for July in W/m**2 / seventh column: mid-month insolation 65S for January in W/m**2 / eighth column: mid-month insolation 15N for July in W/m**2 / ninth column: mid-month insolation 15S for January in W/m**2"
  - The file header labels are `ECC OMEGA OBL PREC 65NJul 65SJan 15NJul 15SJan`. The first two lines are header text, and the data are whitespace-separated.
- **Primary citation (Crossref-verified):** Berger, A., & Loutre, M. F. (1991). Insolation values for the climate of the last 10 million years. *Quaternary Science Reviews*, 10(4), 297–317. https://doi.org/10.1016/0277-3791(91)90033-Q (Elsevier; not fetched). The readme writes the journal as "Quaternary Sciences Review"; Crossref has "Quaternary Science Reviews".
- **Sample rows (verbatim):**
  - `0  0.017236 101.37 23.446 0.01690 426.76 455.58 440.60 470.35`
  - `-11 0.020071 277.45 24.207 -0.01990 467.92 ...`
  - `-21 0.019398 113.98 22.989 0.01772 418.62 ...`
  - `-127 0.041531 272.92 24.054 -0.04148 484.15 ...`
  - `-800 0.017023 55.20 23.277 0.01398 432.53 ...`
- **Ranges over 0 to −800 kyr, 801 rows (my arithmetic):**
  - Eccentricity: 0.004595 (−373 kyr) to 0.049305 (−216 kyr).
  - Obliquity: 22.079° (−232) to 24.480° (−213).
  - Climatic precession: −0.04873 (−220) to +0.04879 (−209).
  - 65°N July insolation: 387.98 W/m² (−230) to 496.72 W/m² (−218).
  - These ranges agree with NASA's "between 22.1 and 24.5 degrees" (T1).

---

## T1. NASA Science: "Milankovitch (Orbital) Cycles and Their Role in Earth's Climate". Data kind: educational simplification

- URL: https://science.nasa.gov/science-research/earth-science/milankovitch-orbital-cycles-and-their-role-in-earths-climate/
- Byline "NASA Science Editorial Team". Published Feb 27, 2020 (meta 2020-02-27T08:00:00-05:00). Last Updated Oct 22, 2024. U.S. Government work. The byline is an editorial team, so no individual author bio applies. Saved as pages/nasa_milank.html and .txt.
- Verbatim quotes:
  - "A century ago, Serbian scientist Milutin Milankovitch hypothesized the long-term, collective effects of changes in Earth's position relative to the Sun are a strong driver of Earth's long-term climate, and are responsible for triggering the beginning and end of glaciation periods (Ice Ages)."
  - "These cyclical orbital movements, which became known as the Milankovitch cycles, cause variations of up to 25 percent in the amount of incoming insolation at Earth's mid-latitudes (the areas of our planet located between about 30 and 60 degrees north and south of the equator)."
  - Eccentricity: "Over time, the pull of gravity from our solar system's two largest gas giant planets, Jupiter and Saturn, causes the shape of Earth's orbit to vary from nearly circular to slightly elliptical. Eccentricity measures how much the shape of Earth's orbit departs from a perfect circle."
  - "Currently, Earth's eccentricity is very slowly decreasing and is approaching its least elliptic (most circular), in a cycle that spans about 100,000 years." (The page text is split across HTML elements here and was joined.)
  - "When Earth's orbit is at its most elliptic, about 23 percent more incoming solar radiation reaches Earth at our planet's closest approach to the Sun each year than does at its farthest departure from the Sun."
  - Obliquity: "The angle Earth's axis of rotation is tilted as it travels around the Sun is known as obliquity. Obliquity is why Earth has seasons. Over the last million years, it has varied between 22.1 and 24.5 degrees with respect to Earth's orbital plane."
  - "Earth's axis is currently tilted 23.4 degrees, or about half way between its extremes, and this angle is very slowly decreasing in a cycle that spans about 41,000 years. It was last at its maximum tilt about 10,000 years ago and will reach its minimum tilt about 10,000 years from now."
  - Precession: "As Earth rotates, it wobbles slightly upon its rotational axis, like a slightly off-center spinning toy top." and "The cycle of axial precession spans about 25,771.5 years."
  - "The cycle of apsidal precession spans about 112,000 years."
  - "The combined effects of axial and apsidal precession result in an overall precession cycle spanning about 23,000 years on average."
  - "He calculated that Ice Ages occur approximately every 41,000 years. Subsequent research confirms that they did occur at 41,000-year intervals between one and three million years ago. But about 800,000 years ago, the cycle of Ice Ages lengthened to 100,000 years, matching Earth's eccentricity cycle. While various theories have been proposed to explain this transition, scientists do not yet have a clear answer."
  - "But the theory that they drive the timing of glacial-interglacial cycles is well accepted."

## T2. NASA Science: "Why Milankovitch (Orbital) Cycles Can't Explain Earth's Current Warming" (glacial CO₂ range). Data kind: educational simplification

- URL: https://science.nasa.gov/science-research/earth-science/why-milankovitch-orbital-cycles-cant-explain-earths-current-warming/
- NASA Science Editorial Team. Published Feb 27, 2020. Updated Oct 23, 2024. Saved as pages/nasa_whymilank.*
- Verbatim quotes:
  - "During past glacial cycles, the concentration of carbon dioxide in our atmosphere fluctuated from about 180 parts per million (ppm) to 280 ppm as part of Milankovitch cycle-driven changes to Earth's climate."
  - "Since the beginning of the Industrial Age, the concentration of carbon dioxide in Earth's atmosphere has increased 50 percent, from about 280 ppm to 412 ppm (update: 421 ppm in 2023)."
  - "Climate models indicate any forcing of Earth's climate due to Milankovitch cycles is overwhelmed when human activities cause the concentration of carbon dioxide in Earth's atmosphere to exceed about 350 ppm."
- **Comparison with the data (D1):** the true extremes are 173.71 ppm (MIS 16) and 298.6 ppm (about 335 kyr BP). "About 180 to 280" is a rounded typical range; record both.

## T3. Last Glacial Maximum sea level. Data kind: educational simplification of reconstructions

- **NOAA, Olympic Coast National Marine Sanctuary, "Original Peoples":** https://olympiccoast.noaa.gov/explore/original-peoples.html (no date or author shown; bio not applicable).
  - "The sea level 20,000 years ago was about 120 meters lower than present. Glacial melt caused a rise in sea level to a point approximately 20 meters below present by 8,000 years ago and reached modern levels about 2,000 years ago."
  - Note that this page is written about the Olympic Coast, so it is a regional context page. Use it for the ~120 m figure only with that caveat.
- **USGS Fact Sheet FS-002-00 (2000), "Sea Level and Climate," by Richard Z. Poore, Richard S. Williams, Jr., and Christopher Tracey:** https://pubs.usgs.gov/fs/fs2-00/ (U.S. Government work; bios not verified).
  - "Global sea level was about 125 meters below today's sea level at the last glacial maximum about 20,000 years ago (Fairbanks, 1989)."
  - **Disagreement:** NOAA says ~120 m and USGS says ~125 m. Both are recorded. The same USGS sheet also says the Holocene "started about 10,000 years ago", which is outdated compared with 11,700 (see T4).
- NOAA Ocean Explorer "Paleoclimate and Deep-Sea Corals" (05stepstones), which a search snippet said contains "~120 meters lower", returned **404**, so it was not used.

## T4. Holocene start (11,700 years)

- **Walker, M., Head, M. J., Berkelhammer, M., et al. (2018).** Formal ratification of the subdivision of the Holocene Series/Epoch (Quaternary System/Period): two new Global Boundary Stratotype Sections and Points (GSSPs) and three new stages/subseries. *Episodes*, 41(4), 213–223. https://doi.org/10.18814/epiiugs/2018/018016 (Crossref-verified; licence CC BY-NC 4.0 per Crossref). Fetched from the ICS site: https://stratigraphy.org/gssps/files/meghalayan.pdf, read from the born-digital text layer.
  - Abstract: "...and dated at 11,700 yr b2k (before 2000 CE)."
  - Body: "...is located at 1492.45 m in the NGRIP2 ice core, and was ratified as the base of the Holocene Series/Epoch in 2008" with "an estimated age of 11,700 yr b2k (before 2000 CE; Walker et al., 2008, ...)".
  - **Note:** the date is counted **b2k (before 2000 CE)**, not BP (before 1950). That makes it about 11,650 cal yr BP on the ice-core data's 1950 baseline.
- **USGS, "Marine Climate History"** (Coastal and Marine Hazards and Resources Program): https://www.usgs.gov/programs/coastal-and-marine-hazards-and-resources-program/science/marine-climate-history
  - "A major focus of marine climate history studies in the CMHRP is the Holocene epoch, corresponding to the warming period since the end of the last major glaciation 11,700 years ago."

---

## NOT FOUND / gaps

1. **Laskar et al. (2004) La2004 was not obtained.** vo.imcce.fr returned 403 ("Your IP address is blocked"), so I stopped using that host. Berger & Loutre (1991) from NCEI is used instead. Per the NCEI readme, it is equivalent to the 1978 solution through 800 kyr.
2. **No 65°N June column at 65°N.** orbit91 gives July mid-month insolation at 65°N. insol91.jun gives June mid-month insolation only at 90, 60, 30, 0, −30, −60 and −90°, so 65°N June would require interpolation (not done).
3. **NOAA/NCEI licence statement not verified.** The files only request citation, and the study-page JSON returned 204.
4. **Vostok not downloaded** (not needed).
5. **No NASA or NOAA page found stating ~120 m for the global LGM.** The NOAA page found is regional (Olympic Coast, ~120 m), the USGS page gives ~125 m, and the NOAA Ocean Explorer page is 404.
6. Wiley, Science, Elsevier and Nature articles were cited by DOI only and not read. The Jouzel page range is 793–797 in the file header and 793–796 in Crossref.
7. No individual author bios were verified. The NASA pages are by the "NASA Science Editorial Team".
