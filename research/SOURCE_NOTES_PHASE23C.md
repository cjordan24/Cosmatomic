# SOURCE NOTES — Phase 23C: oceans, ice and biomes as interconnected systems

Research date: 2026-11-28. Researcher: source/data sub-agent. Rules: /tmp/vv-research/p20/RULES.md.
Raw HTML/text/PDF: `/tmp/vv-research/p23/c/raw/`; robots files: `/tmp/vv-research/p23/c/robots/`; derived CSVs: `/tmp/vv-research/p23/c/*.csv`.
UA "VoyagerVentures-Research/0.1 (educational; respects robots.txt)", ≥1.2 s between requests (≥5 s on nsidc.org per its Crawl-delay).

## Robots / access log

| Host | robots.txt result | Decision |
|---|---|---|
| oceanservice.noaa.gov | 200; disallows only /cgi-bin/, /aaweekly/ | used |
| www.cpc.ncep.noaa.gov | 404 (no robots file → no restriction) | used (ONI v6, RONI, ONI v5, ENSO FAQ) |
| origin.cpc.ncep.noaa.gov | timed out (000) twice | not used; used www.cpc instead |
| www.weather.gov | 404 (no robots file) | used for one PDF (PNS 26-05) |
| www.climate.gov | 200; Drupal defaults only (/search, /admin…) | used (ENSO FAQ). NB site banner: "ARCHIVED version … as of June 25, 2025. Content is not being updated" |
| www.pmel.noaa.gov | 200; Drupal defaults only | used (/co2/story pages) |
| www.aoml.noaa.gov | 403 (CloudFront error) on robots.txt | stopped; not used |
| nsidc.org | 200; Crawl-delay 5; disallows /sites/nsidc.org/files/, facet URLs | used (learn pages, Sea Ice Today); terms page: "You may download and use photographs, imagery, or text from our web site, unless limitations for its use are specifically stated. Please credit the National Snow and Ice Data Center" |
| science.nasa.gov | 200; `User-agent: * Allow: /` | used |
| climate.nasa.gov, earthobservatory.nasa.gov | 301 → science.nasa.gov (robots there = allow) | used via redirect |
| assets.science.nasa.gov | 404 (no robots file) | used for Vital Signs chart JSON + biome CSV links |
| smap.jpl.nasa.gov | 200; no Disallow | used (home + Handbook PDF); several subpages now 404 |
| www.usgs.gov | 200; Drupal defaults | used (evapotranspiration) |
| hahana.soest.hawaii.edu | 200; disallows /lab/dkarl/, /hot/abstracts/ | used (/hot/hotco2/) |
| gml.noaa.gov | 200; disallows /webdata/, /aftp/ | NOT used (Mauna Loa files live under disallowed paths) |
| www.earthdata.nasa.gov | 200; Drupal defaults | checked, not needed |
| www.nps.gov | 200 | checked, not needed |
| www.noaa.gov/jetstream, NCEI /data* | known blocks (brief) | not attempted |

---

## 1. Ocean circulation

### 1a. NOAA National Ocean Service, "Thermohaline Circulation" (Currents tutorial)
- URL: https://oceanservice.noaa.gov/education/tutorial_currents/05conveyor1.html — author: NOAA National Ocean Service (no personal byline); undated page; U.S. Government work (public domain). Data kind: educational simplification.
- "Winds drive ocean currents in the upper 100 meters of the ocean’s surface. However, ocean currents also flow thousands of meters below the surface. These deep-ocean currents are driven by differences in the water’s density, which is controlled by temperature ( thermo ) and salinity ( haline ). This process is known as thermohaline circulation."
- "In the Earth's polar regions ocean water gets very cold, forming sea ice. As a consequence the surrounding seawater gets saltier, because when sea ice forms, the salt is left behind. As the seawater gets saltier, its density increases, and it starts to sink. Surface water is pulled in to replace the sinking water, which in turn eventually becomes cold and salty enough to sink. This initiates the deep-ocean currents driving the global conveyer belt."

### 1b. NOAA NOS, "The Global Conveyor Belt" (Currents tutorial)
- URL: https://oceanservice.noaa.gov/education/tutorial_currents/05conveyor2.html — NOAA NOS; undated; public domain. Educational simplification (cites Ross, 1995).
- "The conveyor belt moves at much slower speeds (a few centimeters per second) than wind-driven or tidal currents (tens to hundreds of centimeters per second). It is estimated that any given cubic meter of water takes about 1,000 years to complete the journey along the global conveyor belt. In addition, the conveyor moves an immense volume of water—more than 100 times the flow of the Amazon River (Ross, 1995)."
- "The conveyor belt is also a vital component of the global ocean nutrient and carbon dioxide cycles. Warm surface waters are depleted of nutrients and carbon dioxide, but they are enriched again as they travel through the conveyor belt as deep or bottom layers."
- Route (animation caption steps): "Cold, salty, dense water sinks at the Earth's northern polar region and heads south along the western Atlantic basin." / "The current is "recharged" as it travels along the coast of Antarctica and picks up more cold, salty, dense water." / "The main current splits into two sections, one traveling northward into the Indian Ocean, while the other heads up into the western Pacific." / "The two branches of the current warm and rise as they travel northward, then loop back around southward and westward." / "The now-warmed surface waters continue circulating around the globe. They eventually return to the North Atlantic where the cycle begins again."

### 1c. NOAA NOS fact page, "What is the global ocean conveyor belt?"
- URL: https://oceanservice.noaa.gov/facts/conveyor.html — "Last updated: 09/23/26 Author: NOAA". Public domain.
- "The global ocean conveyor belt is a constantly moving system of deep-ocean circulation driven by temperature and salinity."
- "The ocean conveyor gets its “start” in the Norwegian Sea, where warm water from the Gulf Stream heats the atmosphere in the cold northern latitudes. This loss of heat to the atmosphere makes the water cooler and denser, causing it to sink to the bottom of the ocean. … Eventually, the cold bottom waters returns to the surface through mixing and wind-driven upwelling, continuing the conveyor belt that encircles the globe."
- NOTE: 1a/1b attribute sinking to brine rejection by sea-ice formation; 1c attributes it to heat loss in the Norwegian Sea. Both are NOAA NOS text; if both shown, present as complementary (cooling + salt).

### 1d. NOAA NOS fact page, "What is the Atlantic Meridional Overturning Circulation (AMOC)?"
- URL: https://oceanservice.noaa.gov/facts/amoc.html — "Last updated: 09/23/26"; NOAA. Public domain. Educational simplification.
- "The AMOC is a system of ocean currents that circulates water within the Atlantic Ocean, bringing warm water north and cold water south."
- "The entire circulation cycle of the AMOC, and the global conveyor belt, is quite slow. It takes an estimated 1,000 years for a parcel (any given cubic meter) of water to complete its journey along the belt. Even though the whole process is slow on its own, there is some evidence that the AMOC is slowing down further."
- "While research shows it is weakening over the past century, whether or not it will continue to slow or stop circulating completely remains uncertain. If the AMOC does continue to slow down, however, it could have far-reaching climate impacts. For example, if the planet continues to warm, freshwater from melting ice at the poles would shift the rain belt in South Africa, causing droughts for millions of people. It would also cause sea level rise across the U.S. East Coast."

### 1e. NOAA NOS, surface currents: Coriolis + Ekman (Currents tutorial)
- https://oceanservice.noaa.gov/education/tutorial_currents/04currents1.html: "Coastal currents are affected by local winds. Surface ocean currents, which occur on the open ocean, are driven by a complex global wind system." … "the air deflects toward the right in the Northern Hemisphere and toward the left in the Southern Hemisphere, resulting in curved paths. This deflection is called the Coriolis effect."
- https://oceanservice.noaa.gov/education/tutorial_currents/04currents4.html: "Each layer of water molecules is moved by friction from the shallower layer, and each deeper layer moves more slowly than the layer above it, until the movement ceases at a depth of about 100 meters (330 feet)."

### 1f. NOAA NOS fact page, "What is a gyre?"
- URL: https://oceanservice.noaa.gov/facts/gyre.html — Last updated 09/23/26; NOAA.
- "There are five major gyres, which are large systems of rotating ocean currents."
- "There are five major gyres: the North and South Pacific Subtropical Gyres, the North and South Atlantic Subtropical Gyres, and the Indian Ocean Subtropical Gyre."
- "In some instances, the term “gyre” is used to refer to the collections of plastic waste … the term traditionally refers simply to large, rotating ocean currents."

### 1g. NOAA NOS fact page, "What is upwelling?"
- URL: https://oceanservice.noaa.gov/facts/upwelling.html — Last updated 09/23/26; NOAA.
- "Winds blowing across the ocean surface push water away. Water then rises up from beneath the surface to replace the water that was pushed away. This process is known as “upwelling.”"
- "Upwelling occurs in the open ocean and along coastlines. The reverse process, called “downwelling,” also occurs when wind causes surface water to build up along a coastline and the surface water eventually sinks toward the bottom."
- "Water that rises to the surface as a result of upwelling is typically colder and is rich in nutrients. … Therefore, good fishing grounds typically are found where upwelling is common."

---

## 2. El Niño / La Niña and the Oceanic Niño Index

**IMPORTANT CHANGE (new since the project's earlier notes):** the legacy URL `…/ensostuff/ONI_v5.php` now says "This page has moved. The Oceanic Niño Index (ONI) table based on ERSST version 6 is available at: https://www.cpc.ncep.noaa.gov/products/analysis_monitoring/enso/oni/v6/" and "Per NWS Public Information Statement 26-05 , the Relative Oceanic Niño index (RONI) is used for official monitoring and prediction of the El Niño-Southern Oscillation (ENSO) phenomenon."

### 2a. NOAA CPC, "Oceanic Niño Index (ONI): Historical El Niño / La Niña episodes (1950–Present)" — Cold & Warm Episodes by Season (ERSSTv6)
- URL: https://www.cpc.ncep.noaa.gov/products/analysis_monitoring/enso/oni/v6/ — NOAA/NWS/NCEP Climate Prediction Center; "Page Author: Climate Prediction Center Internet Team"; "Page last modified:" (blank). Public domain. Data kind: observation-based index (3-month running mean of ERSST.v6 reconstructed SST anomalies).
- Definition/threshold (verbatim): "Warm (red) and cold (blue) periods based on a threshold of +/- 0.5 o C for the Oceanic Niño Index (ONI) [3 month running mean of ERSST.v6 SST anomalies in the Niño 3.4 region (5 o N-5 o S, 120 o -170 o W)], based on centered 30-year base periods updated every 5 years."
- "For historical purposes, periods of below and above normal SSTs are colored in blue and red when the threshold is met for a minimum of 5 consecutive overlapping seasons."
- "Because of the high frequency filter applied to the ERSSTv5 data (Huang et al., 2025, Part 1 and Part 2 , J. Climate ), ONI values may change up to two months after the initial "real time" value is posted. Therefore, the most recent ONI values should be considered an estimate." — DISCREPANCY: the v6 page says "ERSSTv5" here while its title and definition say ERSSTv6 (the RONI page says "ERSSTv6" in the same sentence). Likely a leftover typo; record both.
- "This page will continue to be updated by the 5th of each month".
- **Data saved:** `/tmp/vv-research/p23/c/oni_v6_cpc_2026-11-28.csv` — 77 rows, 1950–2026, 12 overlapping seasons (DJF…NDJ), °C. 1950–2025 complete; 2026 has DJF–ASO (9 values). Parsed from the HTML table text; spot-checks: 1950 DJF −1.3; 1982 NDJ 2.1; 1983 DJF 2.1; 2023 NDJ 2.0; 2024 DJF 1.8; 2025 NDJ −0.6; 2026 ASO 2.5. Red/blue episode colouring was NOT captured (apply the ±0.5 °C / ≥5 consecutive overlapping seasons rule in-app, and say so).
- Values are revisable (base period updated every 5 years; last two months provisional) → show "as retrieved 2026-11-28".

### 2b. NOAA CPC, "Relative Oceanic Niño Index (RONI): Historical El Niño / La Niña episodes (1950–Present)" (ERSSTv6)
- URL: https://www.cpc.ncep.noaa.gov/products/analysis_monitoring/enso/roni/ — CPC; public domain.
- "Warm (red) and cold (blue) periods based on a threshold of +/- 0.5°C for the Relative Oceanic Niño Index (RONI), using the 1991–2020 base period [3 month running mean of ERSST.v6 SST anomalies in the Niño 3.4 region (5°N–5°S, 120°–170°W) with average tropical mean (20°N–20°S) SST anomalies subtracted. The difference is then adjusted so the variance equals the original Niño 3.4 index]."
- "Warm value: The three month running average where the Relative Oceanic Niño Index (RONI) is greater than 0.5 degrees Celsius (El Niño)." / "Cold value: The three month running average where the Relative Oceanic Niño Index (RONI) is less than -0.5 degrees Celsius (La Niña)." / "Data availability: 1950–2026".
- **Data saved:** `/tmp/vv-research/p23/c/roni_v6_cpc_2026-11-28.csv` — 77 rows 1950–2026 (2026 DJF–ASO). Spot-checks: 1950 DJF −1.2; 2026 ASO 2.0 (vs ONI 2.5 — RONI is lower in recent warm years because the tropical-mean warming is removed).
- Raw ONI v5 table also saved (raw/oni5.txt; https://www.cpc.ncep.noaa.gov/products/analysis_monitoring/enso/oni/v5/), not converted.

### 2c. NWS Public Information Statement 26-05 (PDF)
- URL: https://www.weather.gov/media/notification/pdf_2026/pns26-05_Relative_ONI.pdf — "Public Information Statement 26-05 / National Weather Service Headquarters Silver Spring MD / 240 PM EST Tue Jan 13, 2026"; "From: Marina Timofeyeva, Supervisory Physical Scientist." Read from PDF text layer. Public domain.
- "Subject: Public Information Statement Implementing a Relative Oceanic Niño Index effective February 1, 2026"
- "When implemented, NCEP CPC will define El Niño (La Niña) as a relative, positive (negative) mean SST anomaly of 0.5 degrees C or greater over 3 consecutive months in the Niño 3.4 region of the central Pacific Ocean (5 degrees N to 5 degrees S and 120 degrees W to 170 degrees W). This anomaly is computed by subtracting the average SST anomaly of the global tropics (20 degrees N to 20 degrees S) from the Niño 3.4 regional anomaly. After the subtraction, the relative index is rescaled to match the amplitude of the traditional index."
- "Historical El Niño and La Niña events will be categorized based on this index, specifically when there are five or more consecutive, overlapping three-month seasons where the RONI is greater than 0.5C (El Niño) or less than -0.5C (La Niña)."
- "the relative sea surface temperature index better identifies current and past El Niño and La Niña events because it is less sensitive to the chosen base climatology period." … "A relative index is more related to changes in rainfall over the tropical Pacific than the traditional index."
- "Importantly, the legacy Niño 3.4 and Oceanic Niño Index files will continue to be updated for users that require that continuity."
- Text files named in PNS (not fetched — /data/ path on CPC; no robots restriction exists, but HTML table sufficed): https://www.cpc.ncep.noaa.gov/data/indices/RONI.ascii.txt

### 2d. NOAA CPC, "Frequently Asked Questions about El Niño and La Niña"
- URL: https://www.cpc.ncep.noaa.gov/products/analysis_monitoring/ensostuff/ensofaq.shtml — "Page last modified: April 26, 2012". Public domain. Educational.
- "The term El Niño refers to the large-scale ocean-atmosphere climate phenomenon linked to a periodic warming in sea-surface temperatures across the central and east-central equatorial Pacific (between approximately the date line and 120 o W). El Niño represents the warm phase of the El Niño/Southern Oscillation (ENSO) cycle, and is sometimes referred to as a Pacific warm episode."
- "La Niña refers to the periodic cooling of ocean surface temperatures in the central and east-central equatorial Pacific that occurs every 3 to 5 years or so. La Niña represents the cool phase of the El Niño/Southern Oscillation (ENSO) cycle, and is sometimes referred to as a Pacific cold episode."
- "El Niño and La Niña episodes typically occur every 3-5 years. However, in the historical record this interval has varied from 2 to 7 years."
- "El Niño typically lasts 9-12 months, and La Niña typically lasts 1-3 years. They both tend to develop during March-June, reach peak intensity during December-April, and then weaken during May-July."
- NB this 2012 FAQ predates the RONI change (still describes the ONI-style 0.5 °C departure).

### 2e. NOAA Climate.gov, "El Niño & La Niña (El Niño-Southern Oscillation)" FAQ
- URL: https://www.climate.gov/news-features/understanding-climate/el-nino-and-la-nina-frequently-asked-questions — "By Climate.gov Staff"; "Reviewed by Mike Halpert, Anthony Barnston, Michelle L'Heureux, AND Emily Becker"; "Published January 18, 2016". Site banner: "This website is an ARCHIVED version of NOAA Climate.gov as of June 25, 2025. Content is not being updated or maintained". Public domain (NOAA). Bios: not verified.
- "El Niño and La Niña are opposite phases of a natural climate pattern across the tropical Pacific Ocean that swings back and forth every 3-7 years on average."
- "During El Niño, the surface winds across the entire tropical Pacific are weaker than usual. Ocean temperatures in the central and eastern tropical Pacific Ocean are warmer than average, and rainfall is below average over Indonesia and above average over the central or eastern Pacific."
- "During La Niña, it’s the opposite. The surface winds across the entire tropical Pacific are stronger than usual, and most of the tropical Pacific Ocean is cooler than average."
- "For El Niño, the eastern tropical Pacific Ocean has to be 0.5°C or more warmer than average, and winds, surface pressure, and rainfall must have begun to show changes consistent with El Niño. … These changes in average conditions must persist for at least five overlapping three-month periods in order to be count as a full-blown episode in the historical record."
- "The longest El Nino in the modern record lasted 18 months, while the longest la Niña lasted 33 months."
- "In general, the warmest year of any decade will be an El Niño year, the coldest a La Niña one."
- Discrepancy: Climate.gov "every 3-7 years on average" vs CPC FAQ "typically occur every 3-5 years … varied from 2 to 7 years".

---

## 3. Ocean heat uptake and ocean acidification

### 3a. NASA Science, "Ocean Warming – Earth Indicator"
- URL: https://science.nasa.gov/earth/explore/earth-indicators/ocean-warming/ — NASA (no personal byline); datePublished/dateModified 2025-09-25. Public domain (NASA). Data: observation (NOAA OHC 0–2000 m, 5-yr averages) + ECCO model/state estimate (full depth).
- "About 90% of the excess heat from planetary warming over the past century has been absorbed by the ocean, causing ocean temperatures to rise. Modern recordkeeping for ocean temperatures began in 1955."
- "Latest Measurement: December 2024" / "372 (± 2) zettajoules since 1955"
- "The year 2024 was the ocean’s warmest year on record."
- "The graph shows the rise in heat for the top 2,000 meters of the ocean since 1955 … Each data point represents a five-year average. For example, the 2022 value represents the average change in ocean heat content for the years 2020 up to and including 2024 compared to the value in 1955."
- "Most of the added heat is stored near the surface, at depths of 0 to 700 meters."
- "This expansion has led to about one third of the global sea level rise over the past century."

### 3b. NOAA PMEL Carbon Program, "A primer on pH"
- URL: https://www.pmel.noaa.gov/co2/story/A%2Bprimer%2Bon%2BpH — NOAA PMEL Carbon Program; undated. Public domain.
- "Because the pH scale is logarithmic (pH = -log[H + ]), a change of one pH unit corresponds to a ten-fold change in hydrogen ion concentration"
- "Since the Industrial Revolution, the global average pH of the surface ocean has decreased by 0.11, which corresponds to approximately a 30% increase in the hydrogen ion concentration."
- "For example, we said above that pH decrease of 0.11 corresponds to approximately a 30% increase in acidity, which is an exact change in acidity (H + concentration) of 28.8% when calculated in this way." (Check: 10^0.11 = 1.288 ✓.)
- "on geological time scales, this change is more rapid than any change documented over the last 300 million years"

### 3c. NOAA PMEL, "Ocean Acidification" (program page)
- URL: https://www.pmel.noaa.gov/co2/story/Ocean+Acidification
- "The ocean absorbs about a quarter of the CO 2 we release into the atmosphere every year, so as atmospheric CO 2 levels increase, so do the levels in the ocean."
- (The commonly linked "What+is+Ocean+Acidification%3F" URL now 404s.)

### 3d. NOAA NOS, "What is ocean acidification?"
- URL: https://oceanservice.noaa.gov/facts/acidification.html — "Last updated: 09/23/26 Author: NOAA".
- "Ocean acidification refers to a reduction in the pH of the ocean over an extended period of time, caused primarily by uptake of carbon dioxide (CO 2 ) from the atmosphere."
- "The ocean absorbs about 30 percent of the CO 2 that is released in the atmosphere, and as levels of atmospheric CO 2 increase, so do the levels in the ocean."
- DISCREPANCY: NOS "about 30 percent" (cumulative framing) vs PMEL "about a quarter … every year" (annual framing). Record both; the framing differs.

### 3e. PMEL "Ocean Carbon Storage"
- URL: https://www.pmel.noaa.gov/co2/story/Ocean%2BCarbon%2BStorage
- "More than 23% of the inventory can be found in the North Atlantic, a region covering approximately 15% of the global ocean. By contrast, the region south of 50°S represents approximately the same ocean area but only has ~9% of the global inventory."
- PMEL "Ocean Carbon Uptake" (…/Ocean%2BCarbon%2BUptake): "It takes about one year to equilibrate CO 2 in the surface ocean with atmospheric CO 2".

### 3f. DATA — Hawaii Ocean Time-series (HOT), Station ALOHA surface CO2 system product
- File: https://hahana.soest.hawaii.edu/hot/hotco2/HOT_surface_CO2.txt (page https://hahana.soest.hawaii.edu/hot/hotco2/hotco2.html; readme HOT_surface_CO2_readme.pdf). University of Hawai'i at Mānoa SOEST; "Created 5 October 2009 by J.E. Dore / Last updated 1 January 2026 by J.E. Dore". Funding: NSF. Data kind: observation (shipboard bottle samples; pH calculated from DIC + TA).
- Required citation (verbatim in file): "When using this data product please cite as adapted from: Dore, J.E., R. Lukas, D.W. Sadler, M.J. Church, and D.M. Karl.  2009.  Physical and biogeochemical modulation of ocean acidification in the central North Pacific.  Proc Natl Acad Sci USA 106:12235-12240." DOI 10.1073/pnas.0906044106 — verified via api.crossref.org (title, PNAS 106, 12235-12240, authors Dore/Lukas/Sadler/Church/Karl, issued 2009-07-28). No explicit licence statement found; attribution required.
- Column definition (readme): "pHcalc_insitu — The mean seawater pH, calculated from DIC and TA at in situ temperature, on the total scale."
- 355 cruises, 31-Oct-1988 to 20-Dec-2024 (346 with valid pHcalc_insitu).
- **Derived (by me, not a source value — label "computed from HOT data"):** `/tmp/vv-research/p23/c/hot_surface_pH_annual_mean_DERIVED.csv` (annual means of pHcalc_insitu). Examples: 1989 8.1075 (n=10); 2000 8.0868; 2010 8.0779; 2020 8.0528; 2024 8.0409 (n=7). OLS trend over all cruises ≈ −0.019 pH units per decade (my calculation).
- Mauna Loa CO2 comparison: not fetched — gml.noaa.gov robots disallows /webdata/ and /aftp/ where the files sit.

---

## 4. Cryosphere

### 4a. NASA Science, "Arctic Sea Ice Minimum Extent – Earth Indicator" + chart data
- Page: https://science.nasa.gov/earth/explore/earth-indicators/arctic-sea-ice-minimum-extent/ (dateModified 2026-01-15). Chart: https://science.nasa.gov/specials/apps/vital-signs/arctic-sea-ice-chart.html; data JSON https://assets.science.nasa.gov/content/dam/science/microapps/vital-signs/data/charts/arctic-sea-ice.json ("updated_at": "2026-09-28"; subtitle "Data source: Satellite observations. Credit: NSIDC/NASA"; ylabel "Million Square km"). Public domain. Observation (satellite passive microwave, NSIDC).
- "Measurements of summer Arctic sea ice extent each year show a shrinkage of 12.2% per decade due to warmer temperatures."
- "The measurements have shown that September Arctic sea ice is shrinking at a rate of 12.2% per decade, compared to its average extent during the period from 1981 to 2010. This graph shows the area extent of the Arctic sea ice each September since satellite observations started in 1979. The monthly value shown is the average of daily observations across the month of September during each year as measured from satellites."
- Dashboard JSON (…/vital-signs/data/dashboard.json): "In 2012, Arctic summer sea ice shrank to the lowest extent on record"; value "-12.2" "percent per decade since 1979".
- **Data saved:** `/tmp/vv-research/p23/c/nasa_arctic_sea_ice_min_extent_2026-11-28.csv` — 48 values 1979–2026 with year, month, day, extent (million km²). Minimum 2012-09-17 3.387; 2020 3.818; 2026-09-12 4.6.
- DISCREPANCY: page text says values are September monthly averages, but the JSON items carry specific days and the values match NSIDC's daily-minimum figures (e.g. 2012 3.387 on 9/17 ≈ NSIDC 3.39 on Sept 17) → they are annual daily minima, not monthly means. Also NASA 2023 = 4.23 (9/19) and 2024 = 4.28 (9/11) vs NSIDC table 2023 4.26 (Sept 19), 2024 4.25 (Sept 13) — record both.

### 4b. NSIDC Arctic Sea Ice News & Analysis, "Arctic sea ice minimum ties for tenth lowest" (2026)
- URL: https://nsidc.org/sea-ice-today/analyses/arctic-sea-ice-minimum-ties-tenth-lowest-0 — NSIDC (CIRES, University of Colorado Boulder); September 23, 2026 (preliminary announcement). Observation (Sea Ice Index, 5-day average).
- "On September 12, Arctic sea ice likely reached its annual minimum extent of 4.60 million square kilometers (1.78 million square miles). The 2026 minimum shares the tenth lowest spot in the nearly 48-year satellite record with 2008, 2010, and 2025. The last 20 years, from 2007 to 2026, are the lowest 20 sea ice extents in the satellite record."
- "It is 1.21 million square kilometers (467,000 square miles) above the satellite-era record minimum extent of 3.39 million square kilometers (1.31 million square miles), which occurred on September 17, 2012"
- "The overall, downward trend in the minimum extent from 1979 to 2026 is 11.8 percent per decade relative to the 1981 to 2010 average. From the linear trend, the loss of sea ice is about 73,200 square kilometers (28,300 square miles) per year."
- "This overall trend should be viewed with the caveat that there has been no significant decline in September minimum extents over the past two decades. Causes for this flattening trend are a matter of active debate in the Arctic science community."
- Antarctic: "most likely reaching its maximum extent on September 14 at 17.59 million square kilometers (6.79 million square miles). If this maximum date holds, this will be the third lowest Antarctic sea ice maximum on record."
- Table 1 (top 10 lowest minima, million km², date): 1 2012 3.39 Sept. 17; 2 2020 3.82 Sept. 16; 3 2007 4.16 Sept. 18 / 2016 4.17 Sept. 10 / 2019 4.19 Sept. 18; 6 2024 4.25 Sept. 13 / 2023 4.26 Sept. 19; 8 2011 4.34 Sept. 11; 9 2015 4.43 Sept. 9; 10 2008 4.59 Sept. 19 / 2025 4.60 Sept. 10 / 2026 4.60 Sept. 12 / 2010 4.62 Sept. 21. "Values within 40,000 square kilometers (15,000 square miles) are considered tied."
- TREND DISCREPANCIES to show honestly: NSIDC 2026 analysis 11.8 %/decade (1979–2026); NASA indicator 12.2 %/decade; NSIDC learn page "about a 13-percent-per-decade decrease" (older); NSIDC 2022 analysis 12.6 %/decade (1979–2022).

### 4c. NSIDC Learn, "Sea Ice"
- URL: https://nsidc.org/learn/parts-cryosphere/sea-ice — NSIDC; © 2026.
- "Sea ice is frozen seawater that floats on the ocean surface."
- "In late winter, Arctic sea ice covers on average* 15.5 million square kilometers (6 million square miles), and Antarctic sea ice covers about 18.5 million square kilometers (7 million square miles). On average, the seasonal decrease is much larger in the Antarctic, with only about 2.5 million square kilometers (1 million square miles) remaining at summer's end, compared to 6.5 million square kilometers (2.5 million square miles) in the Arctic at its summer’s end."
- "In total, about 34 million square kilometers (13 million square miles) of the world’s oceans (about 9 percent) have sea ice at some point during the year."
- "Antarctic sea ice is typically 1 to 2 meters (3 to 6 feet) thick, while Arctic sea ice is typically 2 to 3 meters (6 to 9 feet) thick."

### 4d. NSIDC Learn, "Science of Sea Ice" — albedo
- URL: https://nsidc.org/learn/parts-cryosphere/sea-ice/science-sea-ice
- "A typical ocean albedo is approximately 0.06, while bare sea ice varies from approximately 0.5 to 0.7. This means that the ocean reflects only 6 percent of the incoming solar radiation and absorbs the rest, while sea ice reflects 50 to 70 percent of the incoming energy."
- "Snow has an even higher albedo than sea ice, so thick sea ice covered with snow reflects as much as 90 percent of the incoming solar radiation."
- (Following sentence reads "the surface albedo drops to about 0.75" after melt begins — internally odd vs. 0.4–0.5 melt ponds; avoid quoting.)

### 4e. NSIDC Learn, "Glaciers"
- URL: https://nsidc.org/learn/parts-cryosphere/glaciers
- "A glacier is an accumulation of ice and snow that slowly flows over land."
- "Together, the Antarctic and Greenland Ice Sheets contain more than 99 percent of the freshwater ice on Earth. The amount of fresh water stored in both the Antarctic and Greenland Ice Sheets total over 68 percent of the fresh water on Earth."
- "If the entire Antarctic Ice Sheet melted, sea level would rise about 60 meters (197 feet) . If the entire Greenland Ice Sheet melted, sea level would rise about 7.4 meters (24.3 feet) ."
- "The world's glaciers have an estimated total area of about 700,000 square kilometers (270,000 square miles). … glaciers exist on all the world’s continents except Australia."

### 4f. NASA Science, "Ice Sheets – Earth Indicator"
- URL: https://science.nasa.gov/earth/explore/earth-indicators/ice-sheets/ — dateModified 2026-11-18. Observation (GRACE 2002–2017, GRACE-FO 2018–).
- "Antarctica is losing ice mass at an average rate of about 135 billion tons per year, and Greenland is losing about 266 billion tons per year." (Key takeaway) — later on the same page: "Greenland is losing about 264 billion tons per year"; readouts: "128 billion metric tons per year since 2002" (Antarctica) and "259 billion metric tons per year since 2002" (Greenland); dashboard JSON −128 and −258.9. INTERNAL INCONSISTENCY — record all; prefer readouts if one value needed and say "about".
- "The ice sheets atop Greenland and Antarctica store about two-thirds of all the fresh water on Earth." (vs NSIDC "over 68 percent" — consistent.)

### 4g. NSIDC Learn, "Frozen Ground & Permafrost" + Quick Facts
- URLs: https://nsidc.org/learn/parts-cryosphere/frozen-ground-permafrost ; https://nsidc.org/learn/parts-cryosphere/frozen-ground-permafrost/quick-facts-frozen-ground
- "Permafrost is soil, sand, sediment, or rock that remains at or below 0 °C (32 °F) for at least two years. While most is on land, there is also some subsea permafrost beneath offshore Arctic continental shelves. Permafrost ranges in thickness from less than 1 meter (3.3 feet) to greater than 1,500 meters (4,900 feet)."
- "Permafrost is not defined by soil moisture content, overlying snow cover, or location; it is defined solely by temperature."
- "The top part of the permafrost thaws and freezes on an annual basis. The maximum seasonal thaw depth in permafrost is called the active layer."
- "In total, permafrost occupies approximately 23 million square kilometers (9 million square miles) or about 25 percent of the exposed land surface in the Northern Hemisphere, with approximately 65 percent in Eurasia and the other 35 percent in North America and Greenland."
- "Approximately 50 percent of the Northern Hemisphere's land surface is covered by seasonally frozen ground"
- Quick facts: "Continuous permafrost exists where 90 to 100 percent of the ground area is frozen … discontinuous (50 to 90 percent frozen ground), sporadic (10 to 50 percent frozen ground), or may form in isolated pockets (10 percent or less frozen ground)"; "Some form of permafrost, either continuous, discontinuous, or sporadic, covers about 85 percent of Alaska."
- Permafrost carbon (NASA EO Carbon Cycle, §5b): "Current research estimates that permafrost in the Northern Hemisphere holds 1,672 billion tons (Petagrams) of organic carbon."

### 4h. NSIDC Learn, "What is the cryosphere?"
- URL: https://nsidc.org/learn/what-cryosphere — "The cryosphere refers to Earth’s ice in all its forms. The term comes from the Greek word for icy cold—krios."

---

## 5. Biomes and vegetation–atmosphere links

### 5a. NASA Earth Observatory "Mission: Biomes" — still online (moved to NASA Science Kids)
- Old URLs earthobservatory.nasa.gov/biome/… redirect to https://science.nasa.gov/kids/earth/mission-biomes/ (pages dateModified 2025-12-05). Credits page: "Mission: Biomes was originally conceived in 2000 and was a collaborative effort between NASA's Earth Observatory and educators and interns from the Washington, D.C. area." "Concept and Content Development: Jacqueline Anderson, Teresita Metzbower, Diane Musick, Melanie Flanagan, Nina Hoffman, Jessica Phelan, and Donald Walker"; "2020 Updates: Andi Thomas, Paul Przyborski"; "Science Consultant: Dr. Jim Collatz, NASA GSFC". Text is NASA (public domain); many photos are third-party CC — do not reuse photos. Example climate tables: "Monthly Temperature and Precipitation from 1970 - 2000" (link "WorldClim") — data kind: gridded climatology (WorldClim), educational simplification.
- **Data saved:** `/tmp/vv-research/p23/c/nasa_mission_biomes_climographs.csv` (7 examples × 12 months; my sums match the printed "Sum Annual Precip." for all 7).

| Biome (page) | Temperature (verbatim) | Precipitation (verbatim) | Vegetation (verbatim) | Example (annual precip., mean of monthly T computed by me) |
|---|---|---|---|---|
| Rainforest …/biorainforest/ | "remains warm all year and must stay frost-free. The average daily temperatures range from 20°C (68°F) to 25°C (77°F)." | "A typical year sees 2,000 to 10,000 millimeters (79 to 394 inches) of rain per year." | "Vines, palm trees, orchids, ferns" | Manaus, Brazil: 2323 mm; ≈27.3 °C (NB monthly T 27–28 °C exceeds the stated 20–25 °C range) |
| Coniferous forest …/bioconiferous/ | "The average temperature in winter ranges from -40°C (-40°F) to 20°C (68°F). The average summer temperatures are usually around 10°C (50°F)." | "300 to 900 millimeters (12 to 35 inches)" | "Coniferous-evergreen trees" | Lahti, Finland: 635 mm; ≈4.2 °C. Description: "the northern boreal forest, is found in 50° to 60°N latitudes" |
| Desert …/biodesert/ | "During the day … rise to an average of 38°C … At night … fall to an average of -3.9°C" | "about 250 millimeters (10 inches) of rain per year—the least amount of rain of all of the biomes" | "Cacti, small bushes, short grasses" | Cairo, Egypt: 28 mm; ≈21.8 °C. Description: "Most deserts receive less than 300 mm a year" |
| Grassland …/biograssland/ | "the annual range can be between -20°C (-4°F) to 30°C (86°F)" | "around 500 to 900 millimeters (20 – 35 inches)" (description says "about 500 to 950 mm") | "Grasses (prairie clover, salvia, oats, wheat, barley, coneflowers)" | Austin, Texas: 828 mm; ≈20.0 °C. "Found on every continent except Antarctica"; "Tropical grasslands have dry and wet seasons that remain warm all the time." |
| Shrubland (incl. savanna) …/bioshrubland/ | "summers … up to 38°C (100°F). In the winter … around -1 °C (30°F)" | "200 to 1,000 millimeters" | "Aromatic herbs (sage, rosemary, thyme, oregano), shrubs, acacia, chamise, grasses" | Johannesburg: 810 mm; ≈15.2 °C. "Shrublands include regions such as chaparral, woodland and savanna." |
| Temperate deciduous forest …/biotemperate/ | "between -30°C (-22°F) and 30°C (86°F) with a yearly average of 10°C (50°F)" | "750 to 1,500 millimeters (30 to 59 inches)" | "Broadleaf trees (oaks, maples, beeches), shrubs, perennial herbs, and mosses" | Madrid, Spain: 430 mm; ≈14.5 °C (NB example is drier than the stated range) |
| Tundra …/biotundra/ | "usually range between -40°C (-40 °F) and 18°C (64°F)" | "150 to 250 millimeters (6 to 10 inches)" | "Almost no trees due to short growing season and permafrost; lichens, mosses, grasses, sedges, shrubs" | Aklavik, Canada: 266 mm; ≈−8.3 °C. "This permafrost is a defining characteristic of the tundra biome." "it is the coldest of the biomes" |

- Example-vs-range mismatches (Manaus T; Madrid, Aklavik precip.) are in NASA's own pages — show the example as "one station" and keep the range text separate.

### 5b. NASA Earth Observatory, "The Carbon Cycle" (Riebeek 2011) — new numbers
- URL: https://earthobservatory.nasa.gov/features/CarbonCycle → https://science.nasa.gov/earth/earth-observatory/the-carbon-cycle/ — datePublished 2011-06-16 (already cited by the project as Riebeek 2011; the migrated page's structured data lists "NASA Earth Observatory"/Kevin Ward as poster; graphics by Robert Simmon). Public domain. Educational; numbers as of ~2009–2011.
- "Most of Earth’s carbon—about 65,500 billion metric tons—is stored in rocks."
- "At present, volcanoes emit between 130 and 380 million metric tons of carbon dioxide per year. For comparison, humans emit about 30 billion tons of carbon dioxide per year—100–300 times more than volcanoes—by burning fossil fuels."
- "About half of these emissions are removed by the fast carbon cycle each year, the rest remain in the atmosphere."
- "So far, land plants and the ocean have taken up about 55 percent of the extra carbon people have put into the atmosphere while about 45 percent has stayed in the atmosphere."
- "About 30 percent of the carbon dioxide that people have put into the atmosphere has diffused into the ocean through the direct chemical exchange. … Since 1750, the pH of the ocean’s surface has dropped by 0.1, a 30 percent change in acidity."
- "Plants on land have taken up approximately 25 percent of the carbon dioxide that humans have put into the atmosphere."
- "Over millennia, the ocean will absorb up to 85 percent of the extra carbon people have put into the atmosphere by burning fossil fuels"
- "Humans are currently emitting just under a billion tons of carbon into the atmosphere per year through land use changes." / "As of 2008, deforestation accounted for about 12 percent of all human carbon dioxide emissions."
- pH: EO "dropped by 0.1, a 30 percent change" vs PMEL "decreased by 0.11 … approximately a 30% increase (exact 28.8%)" — consistent; cite PMEL for precision.

### 5c. NASA Earth Observatory, "Climate and Earth's Energy Budget" (2009) — albedo
- URL: https://earthobservatory.nasa.gov/features/EnergyBalance/page4.php → https://science.nasa.gov/earth/earth-observatory/climate-and-earths-energy-budget/ — datePublished 2009-01-14; illustrations by Robert Simmon (author Rebecca Lindsey per the original EO feature — byline not seen on migrated page; bio: not verified).
- "About 29 percent of the solar energy that arrives at the top of the atmosphere is reflected back to space by clouds, atmospheric particles, or bright ground surfaces like sea ice and snow. … About 23 percent of incoming solar energy is absorbed in the atmosphere by water vapor, dust, and ozone, and 48 percent passes through the atmosphere and is absorbed by the surface. Thus, about 71 percent of the total incoming solar energy is absorbed by the Earth system."

### 5d. USGS Water Science School, "Evapotranspiration and the Water Cycle"
- URL: https://www.usgs.gov/special-topics/water-science-school/science/evapotranspiration-and-water-cycle (→ /water-science-school/science/…). USGS; public domain.
- "Evapotranspiration is the sum of all processes by which water moves from the land surface to the atmosphere via evaporation and transpiration."
- "Transpiration occurs when plants take up liquid water from the soil and release water vapor into the air from their leaves."
- "An acre of corn gives off about 3,000-4,000 gallons (11,400-15,100 liters) of water each day, and a large oak tree can transpire 40,000 gallons (151,000 liters) per year."

### 5e. Wetlands and coasts — NOAA NOS
- "What is a wetland?" https://oceanservice.noaa.gov/facts/wetland.html (Last updated 09/23/2…): "NOAA classifies wetlands into five general types: marine (ocean), estuarine (estuary), riverine (river), lacustrine (lake), and palustrine (marsh)." … "Wetland habitats serve essential functions in an ecosystem, including acting as water filters, providing flood and erosion control, and furnishing food and homes for fish and wildlife."
- "What is an estuary?" https://oceanservice.noaa.gov/facts/estuary.html: "Estuaries and their surrounding wetlands are bodies of water usually found where rivers meet the sea. Estuaries are home to unique plant and animal communities that have adapted to brackish water—a mixture of fresh water draining from the land and salty seawater." "Estuaries are among the most productive ecosystems in the world." (Video transcript: "the nursing grounds for 75% of the fish we catch" — transcript wording; use with care.)

---

## 6. Soil moisture — NASA SMAP

### 6a. NASA Science mission page, "SMAP"
- URL: https://science.nasa.gov/mission/smap/ — dateModified 2026-08-10.
- "A satellite to map soil moisture, detecting whether soils are frozen or thawed, to help scientists understand the links between Earth's water, energy, and carbon cycles, and improve predictions of weather, climate, floods, and droughts."

### 6b. SMAP Handbook (NASA/JPL, July 2014) — PDF, text layer read
- Citation: Entekhabi, D. (SMAP Science Team Lead) et al., *SMAP Handbook — Soil Moisture Active Passive: Mapping Soil Moisture and Freeze/Thaw from Space*, JPL 400-1567, 07/14 (JPL CL#14-2285), Jet Propulsion Laboratory, California Institute of Technology. URL: https://smap.jpl.nasa.gov/files/smap2/SMAP_Handbook_FINAL_1_JULY_2014_Web.pdf. No DOI. Pre-launch document (mission design values, not achieved performance).
- p. 1 (PDF p. 11): "Soil moisture is a primary state variable of hydrology and the water cycle over land."
- "At L-band the microwave emission (brightness temperature) measured by the radiometer mostly emanates from the top ~5 cm and is clearly sensitive to soil moisture in regions having vegetation water contents (VWC) up to ~5 kg m–2 averaged over the radiometer resolution footprint of ~40 km."
- PDF p. 13: "will be placed into a polar sun-synchronous 6 AM/6 PM orbit with a 685 km altitude. The L-band SAR and radiometer share a 6-m mesh deployable offset-fed reflector antenna that rotates at 13 to 14.6 rpm to provide high spatial resolution with a 1000 km measurement swath that enables global coverage every 2–3 days"
- PDF p. 15 (Mission Overview): "Soil moisture controls the partitioning of available energy into sensible and latent heat fluxes across regions where the evaporation regime is, at least intermittently, water-limited (as opposed to energy-limited)." Five goals: "1. Understand processes that link the terrestrial water, energy, and carbon cycles, 2. Estimate global water and energy fluxes at the land surface, 3. Quantify net carbon flux in boreal landscapes, 4. Enhance weather and climate forecast skill, and 5. Develop improved flood prediction and drought-monitoring capability."
- "The baseline science requirement for SMAP is to provide estimates of soil moisture in the top 5 cm of soil with an error of no greater than 0.04 cm3 cm–3 volumetric (1-sigma) at 10 km spatial resolution and 3-day average intervals over the global land area, excluding regions of snow and ice, frozen ground, mountainous topography, open water, urban areas, and vegetation with water content greater than 5 kg m–2"
- Handbook says "The SMAP launch is currently scheduled for November 5, 2014" — superseded; actual launch date not verified from an allowed page this session. SMAP home page (https://smap.jpl.nasa.gov/) news item: "the radar that failed aboard the U.S. space agency’s newly launched Soil Moisture Active Passive (SMAP) satellite in July." and "SMAP’s radiometer … can do more than previously thought, and the spacecraft remains healthy". → In-app: radar no longer operating; radiometer continues.

---

## NOT FOUND / gaps
- Gyre rotation sense (clockwise NH / counter-clockwise SH) not found verbatim on a fetched NOAA page (NOS gyre page lists the five gyres only).
- AMOC transport numbers (Sv) / RAPID array: not sought (AOML 403); NOS gives qualitative weakening only.
- ONI episode colouring (red/blue cells) not captured; derive in-app from the stated rule. CPC RONI.ascii.txt not fetched (HTML table used).
- climate.gov is an archived snapshot (June 25, 2025) — fine to cite but flag "archived".
- Mauna Loa–HOT comparison: Mauna Loa series not fetched (gml.noaa.gov robots disallows /webdata/, /aftp/). HOT pH annual means are my own derived numbers.
- NASA "ocean absorbs ~90 % of excess heat" found; no NOAA PMEL statement of the same fetched.
- Savanna is covered only inside NASA's "Shrubland" page; no separate boreal/taiga page beyond "Coniferous Forest"; no dedicated "coasts" biome page (used NOS wetland/estuary facts).
- SMAP actual launch date (31 Jan 2015 from memory — NOT verified) and present operational status: smap.jpl.nasa.gov mission/observatory subpages return 404.
- Glacier mass-balance numbers (e.g., WGMS) not sought.
- Author bios: none verified this session.
