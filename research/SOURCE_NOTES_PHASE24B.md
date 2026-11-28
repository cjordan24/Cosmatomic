# SOURCE NOTES — Phase 24B: Future Earth and climate modelling (Gate 24.2)

Research date: 2026-11-28. Rules: /tmp/vv-research/p24/RULES.md. Raw files: /tmp/vv-research/p24/b/.
User-Agent: `VoyagerVentures-Research/0.1 (educational; respects robots.txt)`; ≥1.1 s between requests per host (5.5 s for nsidc.org, which sets Crawl-delay 5).

**App rule for this gate:** a projection is never shown as an outcome. Every projected number must carry (a) its scenario or global warming level (GWL), (b) its range or likelihood word as printed, (c) its baseline period, and (d) one of these labels:
- **[PROJECTION]**: model output driven by a scenario or GWL (CMIP6, LOCA2/STAR downscaling, AR6-based sea level scenarios).
- **[OBSERVATION]**: measured or observation-based extrapolation.
- **[ASSESSMENT]**: an assessed range combining several lines of evidence (e.g. ECS).
- **[EDU]**: educational simplification on an agency outreach page.

NCA5 likelihood words (as the report uses them; quote them with the number): "virtually certain", "very likely", "likely", "more likely than not". Confidence words: "very high / high / medium confidence".

## Robots / terms log

| Host | robots.txt result (fetched first) | Decision |
|---|---|---|
| nca2023.globalchange.gov | **DNS does not resolve** ("Could not resolve host"); www.globalchange.gov also no response | Site is offline (per search results, shut down 1 July 2025). Not used. NCA5 read from the NOAA mirror below |
| toolkit.climate.gov (NOAA U.S. Climate Resilience Toolkit; hosts the official NCA5 PDFs) | `User-agent: *` disallows only /core/, /profiles/, README etc. | **allowed**. PDFs fetched from /sites/default/files/2025-07/ |
| oceanservice.noaa.gov | disallows /cgi-bin/, /aaweekly/ | allowed. The tech-report landing page and the PDF URL both return **404** now; /facts/acidification.html read |
| aambpublicoceanservice.blob.core.windows.net | DNS does not resolve | not used |
| pubs.usgs.gov | `Disallow: /archive/` | allowed; USGS record 70229139 links the Sweet et al. 2022 PDF on earth.gov |
| earth.gov | `User-Agent: *` with no Disallow | **allowed**; Sweet et al. 2022 PDF fetched (22.4 MB, born-digital) |
| www.climate.gov | disallows /search, /maps-data/tools-interactives/, some data-snapshots | allowed (/news-features/). Banner: "This website is an ARCHIVED version of NOAA Climate.gov as of June 25, 2025." |
| www.pmel.noaa.gov | standard Drupal disallows only | allowed, but the OA "story" URL returned 404; nothing used |
| nsidc.org | `Crawl-delay: 5`; faceted-search disallows only | allowed (two /learn/ pages, 5.5 s apart). Content is "© 2026, National Snow and Ice Data Center" → short quotes with credit only |
| www.gfdl.noaa.gov | disallows /wp-admin/, /cms-filesystem-action/, /reference/ | allowed |
| scied.ucar.edu | Drupal standard + /search/ | allowed; read, but **not recommended** for numbers (see §6c) |
| science.nasa.gov | `User-agent: * Allow: /` | allowed |
| arctic.noaa.gov | `Disallow:` (empty) | allowed, but not needed in the end |
| www.giss.nasa.gov | disallows /data/, /pubs/docs/, etc. | allowed but not needed |
| agupubs.onlinelibrary.wiley.com | robots allows /doi/… | **NOT FETCHED — any *.wiley.com is off-limits** (Sherwood et al. 2020 Rev. Geophys. is hosted there) |
| api.crossref.org | — | used only to verify DOIs |

Off-limits hosts were not touched (no IPCC site, no Wikipedia, no Nature/Springer/Wiley, no AOML, no ncbi). A search-result snippet quoting AOML ("pH ... could decrease by 0.3 – 0.4") was **ignored** because aoml.noaa.gov is off-limits.

---

## Common citation data for NCA5 (applies to §§1, 3–8)

- Full report: USGCRP, 2023: *Fifth National Climate Assessment*. Crimmins, A.R., C.W. Avery, D.R. Easterling, K.E. Kunkel, B.C. Stewart, and T.K. Maycock, Eds. U.S. Global Change Research Program, Washington, DC, USA. https://doi.org/10.7930/NCA5.2023. "Published November 14, 2023. Revised June 06, 2024—see errata for details." (Front Matter p. ii)
- **Licence (Front Matter p. ii, verbatim):** "This report is in the public domain. Some materials used herein are copyrighted, and permission was granted for their publication in this report. For subsequent uses that include such copyrighted materials, permission for reproduction must be sought from the copyright holder. In all cases, credit must be given for copyrighted materials. All other materials are free to use with credit to this report." → Text and numbers: public domain with credit. **Figures "Adapted with permission" (e.g. Fig. 2.15, 3.2, 3.3, 3.9) must not be reproduced**; describe them in words.
- Original host (now offline): nca2023.globalchange.gov. Mirror used: NOAA Climate Resilience Toolkit, e.g. https://toolkit.climate.gov/NCA5_Ch2_Climate-Trends → https://toolkit.climate.gov/sites/default/files/2025-07/NCA5_Ch2_Climate-Trends.pdf. All PDFs born-digital; read from the text layer (`pdftxt.swift`). Page numbers below are the printed page labels (e.g. "2-27").
- DOIs verified on api.crossref.org: 10.7930/NCA5.2023.CH2 ("Chapter 2 : Climate Trends"), .CH3 ("Earth Systems Processes"), .CH4 ("Water"), .CH8 ("Ecosystems, Ecosystem Services, and Biodiversity"), .A3 ("Scenarios and Datasets"), .A5 ("Glossary"); all 2023.
- Author bios: not verified (only affiliations as printed in each chapter).

### Chapter citations
- **Ch. 2**: Marvel, K., W. Su, R. Delgado, S. Aarons, A. Chatterjee, M.E. Garcia, Z. Hausfather, K. Hayhoe, D.A. Hence, E.B. Jewett, A. Robel, D. Singh, A. Tripati, and R.S. Vose, 2023: Ch. 2. Climate trends. In: NCA5. https://doi.org/10.7930/NCA5.2023.CH2. (Lead author Kate Marvel, Project Drawdown; federal coordinating lead author Wenying Su, NASA Langley.)
- **Ch. 3**: Leung, L.R., A. Terando, R. Joseph, G. Tselioudis, L.M. Bruhwiler, B. Cook, C. Deser, A. Hall, B.D. Hamlington, A. Hoell, F.M. Hoffman, S. Klein, V. Naik, A.G. Pendergrass, C. Tebaldi, P.A. Ullrich, and M.F. Wehner, 2023: Ch. 3. Earth systems processes. In: NCA5. https://doi.org/10.7930/NCA5.2023.CH3. (Review editor: Gavin Schmidt, NASA.)
- **Ch. 4** (Water): https://doi.org/10.7930/NCA5.2023.CH4. **Ch. 8** (Ecosystems): https://doi.org/10.7930/NCA5.2023.CH8.
- **App. 3**: Scenarios and Datasets, https://doi.org/10.7930/NCA5.2023.A3. **App. 5**: Grade, A.M., A.R. Crimmins, S. Basile, M.R. Essig, L. Goldsmith, T.K. Maycock, A. McCarrick, A. Lustig, and A. Scheetz, 2023: Appendix 5. Glossary. https://doi.org/10.7930/NCA5.2023.A5.
- **Front Matter** (Guide to the Report, Tables 3–4, Box 1): Avery, C.W., A.R. Crimmins, S. Basile, A.M. Grade, and A.A. Scheetz, 2023: Front matter. In: NCA5.

---

## 0. How NCA5 names scenarios and warming levels (needed for every projection label)

Source: NCA5 Front Matter, Guide to the Report, "Use of Scenarios", Table 3 and Box 1 (pp. xxv–xxvii). Kind: framing text.

- p. xxv–xxvi: "Because there are uncertainties inherent in all of these factors—especially human behavior and the choices that determine emissions levels—the resulting range of projections are not predictions but instead reflect multiple potential pathways for our collective future (Ch. 2). The scenarios do not have relative likelihoods assigned and are all plausible futures."
- **Table 3 "Descriptive Terms for Common Climate Scenarios Used in NCA5"** (descriptor – CMIP5 – CMIP6):
  - Very High Scenario – RCP8.5 – SSP5-8.5: "these reflect the highest range of carbon dioxide (CO2) emissions and no mitigation. Total annual global CO2 emissions in 2100 are quadruple emissions in 2000 (RCP8.5 and SSP5-8.5)."
  - High Scenario – RCP6.0 – SSP3-7.0: "high CO2 emissions with limited (RCP6.0) or no (SSP3-7.0) mitigation."
  - Intermediate Scenario – RCP4.5 – SSP2-4.5: "Total annual CO2 emissions in 2100 are 46% (RCP4.5) and 67% (SSP2-4.5) less than the year 2000."
  - Low Scenario – RCP2.6 – SSP1-2.6: "rapidly declining and net-negative CO2 emissions (with CO2 removal from the atmosphere exceeding human-caused emissions) by 2100."
  - Very Low Scenario – n/a – SSP1-1.9: "the greatest reduction in global greenhouse gas emissions and substantial CO2 removal from the atmosphere."
- **Box 1 "Global Warming Levels Measure How Much the Planet Has Warmed"** (p. xxvii): "the term “global warming level” is used to describe the level of global temperature increase relative to preindustrial temperatures conditions (the 1850–1900 average). A given global warming level is reached when global annual warming, defined by the average temperature over multiple decades, exceeds a specified level."
  - "even if a single year occurs in which Earth is 1.5°C (2.7°F) hotter than the preindustrial average, the 1.5°C global warming level has not necessarily been reached."
  - "Global warming levels are not thresholds; they do not represent “safe” levels of warming, nor does exceeding a particular global warming level mean that it is too late to slow or halt many of the impacts of climate change by reducing greenhouse gas emissions."
  - "This means that future projections are conditional: when or if Earth reaches a particular level of warming is largely dependent on human choices."
- Ch. 3 p. 3-15 on SSP naming: "The new scenarios are labeled “SSPX-Y,” where SSPX (with X ranging from 1 to 5) identifies the SSP used to produce the greenhouse gas trajectories and Y indicates the magnitude of the radiative forcing by 2100 in W/m2." … "SSP1-1.9, the lowest emissions trajectory, which is designed to stay below 1.5°C (2.7°F) of warming above preindustrial levels."

---

## 1. NCA5 projected warming, precipitation, extremes, timing, carbon cycle, permafrost

### 1a. Ch. 2 Key Message 2.3 (p. 2-21), verbatim
"**How Much the Climate Changes Depends on the Choices Made Now** — The more the planet warms, the greater the impacts—and the greater the risk of unforeseen consequences (very high confidence). The impacts of climate change increase with warming, and warming is virtually certain to continue if emissions of carbon dioxide do not reach net zero (very high confidence). Rapidly reducing emissions would very likely limit future warming (very high confidence) and the associated increases in many risks (high confidence). While there are still uncertainties about how the planet will react to rapid warming and catastrophic future scenarios that cannot be ruled out, the future is largely in human hands."

### 1b. Current baseline [OBSERVATION]
- p. 2-30: "the current global warming level is already over 1.1°C."
- Ch. 2 Traceable Account (p. 2-35 area): the globe "has warmed between 1.1° and 1.2°C since the beginning of the industrial revolution, based on multiple" datasets.

### 1c. US warming per GWL [PROJECTION] — Ch. 2 p. 2-21, Figure 2.9 (p. 2-22)
- "At a GWL of 2°C (3.6°F), the average temperature across the United States is very likely to increase between 4.4°F and 5.6°F (2.4°C and 3.1°C). For every additional 1°C of global warming, the average US temperature is projected to increase by around 2.5°F (1.4 °C). The northern and western parts of the country are likely to experience proportionally greater warming (Figure 2.9)."
- **Figure 2.9** "Projected US Temperature Changes at 1.5°C, 2°C, 3°C, and 4°C of Global Warming" — caption: "These maps show projected changes in annual average temperature (°F) for various global warming levels (1.5°, 2.0°, 3.0°, and 4.0°C). Changes are relative to the period 1851–1900. Based on CMIP6. … Figure credit: NOAA NCEI and CISESS NC." (public-domain figure credit; maps only, no tabulated values in text).

### 1d. Precipitation per GWL [PROJECTION] — p. 2-22, Figure 2.10 (p. 2-23)
- "Precipitation changes also scale with global warming, but these projections vary by location (Figure 2.10) and are less certain than temperature changes. As global temperatures increase, annual average precipitation is very likely to increase in the northern and eastern regions of CONUS and in Alaska, more likely than not to decrease in the Southwest and Texas, and likely to decrease in the Caribbean. … In a warmer world, it is virtually certain that less precipitation will fall as snow, leading to large reductions in mountain snowpack and decreases in spring runoff in the mountain West".
- Fig. 2.10 caption: "projected changes in average annual precipitation (%) for various global warming levels (1.5°, 2.0°, 3.0°, and 4.0°C). … Changes are relative to the period 1851–1900. Based on CMIP6. … Hatching indicates areas where 80% or more of the models agree on the sign of the change." (credit: Project Drawdown, Stripe Inc., NOAA NCEI, CISESS NC).

### 1e. Extremes per GWL [PROJECTION] — pp. 2-24 to 2-27, Figures 2.11, 2.12
- Heat: "it is very likely that heatwaves will increase in frequency, severity, and duration as warming continues. Figure 2.11a shows projected changes in the number of days at or above 95°F at a global warming level of 2°C. … Nighttime temperatures are very likely to increase faster than daytime temperatures".
- Fig. 2.11 caption: hot days ≥95°F, cold days ≤32°F, warm nights ≥70°F "at a global warming level of 2.0°C. Changes are relative to the period 1991–2020. Based on LOCA2/STAR."
- Heavy precipitation: "Extreme precipitation–producing weather systems ranging from tropical cyclones to atmospheric rivers are very likely to produce heavier precipitation at higher global warming levels." Fig. 2.12 at GWL 2 °C, relative to 1991–2020, LOCA2/STAR.
- Drought (p. 2-25): "the risk of single-year droughts analogous to the driest recent year (2002) depends strongly on the global warming level, increasing by 8% at a GWL of 2°C but by 24% at 4°C." Also: "Drying of surface soils is projected to occur nearly everywhere; drying increases with the GWL due to increases in evaporative demand with warming."
- Storms (p. 2-26): "Projected increases in water temperatures are very likely to result in stronger tropical cyclones globally, with winds 5% faster (3% for the Atlantic basin) at a GWL of 2°C. It is likely that the overall global frequency of tropical cyclones will decrease, while the frequency of Category 4–5 hurricanes is likely to increase."
- Marine heatwaves (p. 2-27): "Projections indicate an increase of between 150 and 300 marine heatwave days per year if the GWL reaches 2.5°C."

### 1f. Timing (when 2 °C might be reached) [PROJECTION] — p. 2-28, Figure 2.14 (p. 2-29)
- "In a very high scenario, the world is very likely to exceed a global warming level of 2°C between 2033 and 2054, depending on the climate sensitivity to greenhouse gas emissions (Ch. 3). In a low scenario, by contrast, the world is very likely not to cross this threshold at all (Figure 2.14)."
- Fig. 2.14 caption: "Shown are the IPCC AR6 assessed warming projections for four future scenarios … under a very high scenario (SSP5-8.5), models project reaching 2°C between 2033 and 2054, with an average estimate of 2042. Under a low scenario (SSP1-2.6), the 5% CI (confidence interval) range begins at 2041, but the average projection shows that warming would actually stay below 2°C." (credit: Project Drawdown, Stripe Inc., NOAA NCEI, CISESS NC).
- **2100 under current policies** (p. 2-29): "a number of analyses have narrowed the plausible range of current emissions outcomes based on policies in place today … putting the world on track for a central warming estimate of around 2.6°C (ranging from 2°–3.7°C) by 2100." And: "current policy projections represent neither a ceiling nor a floor on future climate outcomes."
- Net zero (p. 2-29): "global surface temperatures will continue to rise until CO2 emissions reach net zero, and surface temperatures are not expected to fall for centuries in the absence of net-negative emissions." … "additional warming over the next few centuries is not necessarily “locked in” after net CO2 emissions fall to zero." Traceable account p. 2-40: "ZECMIP broadly found that ZEC was 0ºC ± 0.3ºC across the Earth system models examined."
- 1.5 °C (p. 2-33): "Global temperatures can be limited to 1.5°C above preindustrial levels by 2100 in scenarios where global CO2 emissions reach net zero in the middle of this century alongside deep cuts to methane (KM 32.2) and other short-lived climate pollutants, with modest deployments of net-negative emissions thereafter. Most of these scenarios have at least some midcentury temperature overshoot".
- Detectability (p. 2-33): "we probably will not be able to detect climate benefits from even the most aggressive possible emission reductions before the middle of the century, given the magnitude of internal climate variability".
- **2030 values: none stated** in Ch. 2 (see gaps).

### 1g. Locked-in changes (p. 2-30)
- "the surface ocean will continue to take up heat from the atmosphere, accumulating 2–4 times as much heat as has been taken up since 1970, even under low or very low scenarios." "Even after the world reaches net-zero emissions, oceans will continue to acidify".

### 1h. Carbon-cycle feedbacks and permafrost [PROJECTION / ASSESSMENT] — Ch. 2 pp. 2-31; Ch. 3 pp. 3-23–3-25
- Ch. 2 p. 2-31: "climate models project that the fraction of emissions taken up by land and oceans will decline … land reservoirs, such as tropical forests or the Arctic–boreal ecosystems, could switch from a net sink to a net source of carbon to the atmosphere".
- Permafrost carbon (p. 2-31): "There is estimated to be about 4.8–5.9 trillion tons of carbon frozen down to 20 meters in Arctic permafrost. This is roughly double the amount currently in the atmosphere and more than three times what already has been emitted to the atmosphere from fossil fuel use since preindustrial times." … "More than one hundred billion tons of CO2 are likely to be released by thawing permafrost over the next century, with higher-end estimates of around 400 billion tons." … "Methane emissions are projected to cause 40%–70% of total permafrost-affected radiative forcing in this century."
- Ch. 3 p. 3-24: "ESMs predict a total loss of near-surface permafrost by 2100 for intermediate (RCP4.5) and very high (RCP8.5) emissions scenarios, and permafrost carbon emissions are projected to outpace increased carbon uptake from higher vegetation productivity in a warmer Arctic."
- Ch. 3 p. 3-23 [OBSERVATION]: "From 2011 to 2020, annual emissions averaged 10.6 ± 1.2 PgC, and the emitted carbon was ultimately distributed between the atmosphere (47%), vegetation and soils in terrestrial ecosystems (29%), and the oceans (24%; Figure 3.8). Over the past six decades, the average fraction of anthropogenic CO2 emissions that has accumulated in the atmosphere has remained nearly constant at 41%". (Fig. 3.8 adapted from Friedlingstein et al. 2022 [CC BY 4.0].)
- Ch. 3 p. 3-25: "uncertainties in these processes have remained large and virtually unchanged in recent years" (CO2 fertilization and carbon cycle–climate feedbacks, CMIP5 vs CMIP6).
- Ch. 3 p. 3-25: ocean carbon "changes are expected to contribute to future weakening of the ocean carbon sink under medium to high emissions scenarios".

---

## 2. NOAA 2022 Sea Level Rise Technical Report (Sweet et al. 2022)

- Citation (verbatim from p. ii): Sweet, W.V., B.D. Hamlington, R.E. Kopp, C.P. Weaver, P.L. Barnard, D. Bekaert, W. Brooks, M. Craghan, G. Dusek, T. Frederikse, G. Garner, A.S. Genz, J.P. Krasting, E. Larour, D. Marcy, J.J. Marra, J. Obeysekera, M. Osler, M. Pendleton, D. Roman, L. Schmied, W. Veatch, K.D. White, and C. Zuzak, 2022: *Global and Regional Sea Level Rise Scenarios for the United States: Updated Mean Projections and Extreme Water Level Probabilities Along U.S. Coastlines.* NOAA Technical Report NOS 01. National Oceanic and Atmospheric Administration, National Ocean Service, Silver Spring, MD, 111 pp. February 2022.
- URL printed in the citation (now **404**): https://oceanservice.noaa.gov/hazards/sealevelrise/noaa-nos-techrpt01-global-regional-SLR-scenarios-US.pdf. Copy used: https://earth.gov/sealevel/us/internal_resources/756/noaa-nos-techrpt01-global-regional-SLR-scenarios-US.pdf (linked from the USGS record https://pubs.usgs.gov/publication/70229139). Born-digital; text layer read.
- DOI: **none printed on the report**. (A search result mentions a Rutgers repository DOI 10.7282/00000540; not fetched or verified → do not cite.)
- Licence: NOAA technical report, U.S. Government work (public domain).
- Kind: **[PROJECTION]** scenarios built from IPCC AR6 projections; near-term values also **[OBSERVATION]**-based extrapolation.

### Definition of the five scenarios (via NCA5 App. 3, p. A3-6, verbatim)
"The technical report uses five SLR scenarios covering the time period from 2020 to 2150, constructed using the sea level projections from the Intergovernmental Panel on Climate Change Sixth Assessment Report (IPCC AR6) and defined by global mean SLR target values in 2100 as follows: Low (0.3 m [1 foot]), Intermediate-Low (0.5 m [1.5 feet]), Intermediate (1 m [3 feet]), Intermediate-High (1.5 m [5 feet]), and High (2 m [6.5 feet]). … Near-term SLR estimates are derived from an extrapolation of observed rates and acceleration through 2050." Also: "it is not possible to directly assign probabilities to each of the scenarios".

### Sweet et al. 2022 Table 2.3 (p. 20) — "Global mean sea level and contiguous United States scenarios, in meters, relative to a 2000 baseline." (verbatim values)

| Scenario | GMSL 2050 | GMSL 2100 | GMSL 2150 | CONUS 2050 | CONUS 2100 | CONUS 2150 |
|---|---|---|---|---|---|---|
| Low | 0.15 | 0.3 | 0.4 | 0.31 | 0.6 | 0.8 |
| Intermediate-Low | 0.20 | 0.5 | 0.8 | 0.36 | 0.7 | 1.2 |
| Intermediate | 0.28 | 1.0 | 1.9 | 0.40 | 1.2 | 2.2 |
| Intermediate-High | 0.37 | 1.5 | 2.7 | 0.46 | 1.7 | 2.8 |
| High | 0.43 | 2.0 | 3.7 | 0.52 | 2.2 | 3.9 |

Other verbatim lines:
- Key Message #1 bullet (p. xii): "Relative sea level along the contiguous U.S. (CONUS) coastline is expected to rise on average as much over the next 30 years (0.25–0.30 m over 2020–2050) as it has over the last 100 years (1920–2020)."
- p. xii: "higher RSL rise along the East (0–5 cm higher on average than CONUS) and Gulf Coasts (10–15 cm higher) as compared to the West (10–15 cm lower) and Hawaiian/Caribbean (5–10 cm lower) Coasts." "The projections do not include natural year-to-year sea level variability".
- p. 20–21 (warming link): "The median GMSL projection for 2100 for a world with global mean surface air temperature in 2081–2100 averaging 2.0°C above 1850–1900 levels is about 0.5 m (likely range of 0.4–0.7 m; Table 2.4), consistent with the Intermediate-Low scenario. The median GMSL projection for a world with global mean surface air temperature in 2081–2100 averaging 4.0°C higher is about 0.7 m (likely range of 0.6–0.9 m)". "the current observed acceleration, which, if extrapolated, would yield about 0.24 m of GMSL rise by 2050 and 0.69 m by 2100."
- p. 21: "these projections include only physical processes in which there is at least medium confidence … the largest potential contributions to long-term GMSL rise come from ice-sheet processes in which there is currently low confidence."
- p. 20: "It is thus not possible to tie specific levels of warming in general to amounts of sea level rise, but it is possible to relate specific levels of warming at specific points in time (e.g., at the end of the century) to different levels of sea level rise."

### NCA5 App. 3 Table A3.1 (p. A3-7) — probability of exceeding each scenario in 2100 at a given GWL (2081–2100 vs preindustrial), "Adapted from Sweet et al. 2022"

| Scenario | 1.5°C | 2.0°C | 3.0°C | 4.0°C | 5.0°C | Low-confidence ice-sheet processes, very high emissions |
|---|---|---|---|---|---|---|
| Low (0.3 m) | 92% | 98% | >99% | >99% | >99% | >99% |
| Intermediate-Low (0.5 m) | 37% | 50% | 82% | 97% | >99% | 96% |
| Intermediate (1.0 m) | <1% | 2% | 5% | 10% | 23% | 49% |
| Intermediate-High (1.5 m) | <1% | <1% | <1% | 1% | 2% | 20% |
| High (2.0 m) | <1% | <1% | <1% | <1% | <1% | 8% |

### ⚠ "US" vs "CONUS" — two different tables, record both
NCA5 Front Matter **Table 4** (p. xxvii, "Adapted from Sweet et al. 2022") gives a "United States" column that is "averaged across the US coastal regions, including the contiguous US, Alaska, Hawai‘i and the US-Affiliated Pacific Islands, and the US Caribbean". Its values differ from Sweet Table 2.3's **CONUS** column, e.g. Low 2100: Table 4 "United States" = 0.98 ft (0.3 m) vs Sweet CONUS = 0.6 m; High 2100: 6.56 ft (2.0 m) vs CONUS 2.2 m. Table 4 values (ft (m)): US Low 0.59 (0.18) / 0.98 (0.3) / 1.64 (0.5); Int-Low 0.75 (0.23) / 1.64 (0.5) / 2.95 (0.9); Intermediate 0.89 (0.27) / 3.28 (1.0) / 6.89 (2.1); Int-High 1.12 (0.34) / 4.92 (1.5) / 8.86 (2.7); High 1.38 (0.42) / 6.56 (2.0) / 12.46 (3.8) for 2050/2100/2150. GMSL columns match Sweet Table 2.3. Table 4 note: "In the next 30 years (2020–2050), sea level along the contiguous US coasts is expected to rise 0.92 feet (0.28 m)". **The app must label which region a value is for.**

### NCA5 Ch. 2 sea-level statements per GWL [PROJECTION] (p. 2-27, 2-30, 2-32)
- "A GWL of 2°C would lead to a likely sea level rise in CONUS of 2–3 feet in 2100 and 2.5–5 feet in 2150, relative to 2000 sea levels. Every additional degree Celsius of global warming is likely to cause at least 4 inches of additional sea level rise in CONUS in 2100 and at least 7 inches of additional sea level rise in 2150".
- "Under a range of potential global warming levels, average sea level along US coastlines is likely to be between 12 and 20 inches above 2000 sea levels in 2050 (Figure 9.2)."
- "Increases in sea level along the continental US coast of 3–6 feet by 2100 and 5–12 feet by 2150, depending on human emissions, are distinct possibilities that cannot be ruled out (i.e., they have at least 1% chance of occurrence with global warming levels of 1.5°–4°C)."
- Traceable account p. 2-39: "There is a consensus that past carbon emissions and even relatively moderate future global warming levels commit the planet to at least 3–6 feet of sea level rise over hundreds to thousands of years from the melting of the Greenland and Antarctic ice sheets."

---

## 3. Ocean pH projections by scenario

### 3a. NOAA Climate.gov featured image (PRIMARY for numbers; dated 2010; SRES-era scenarios)
- Citation: Kennedy, Caitlyn, 2010: "Ocean Acidification, Today and in the Future." NOAA Climate.gov, Featured Images, published November 3, 2010. https://www.climate.gov/news-features/featured-images/ocean-acidification-today-and-future. Maps by Hunter Allen "using model data courtesy of Bernie et al, 2010".
- Underlying paper: Bernie, D., J. Lowe, T. Tyrrell, and O. Legge, 2010: Influence of mitigation policy on ocean acidification. *Geophys. Res. Lett.*, 37, L15704. DOI **10.1029/2010GL043181** (verified on Crossref; host is AGU/Wiley → not fetched).
- Licence: NOAA Climate.gov text, U.S. Government work (public domain). Site archived as of June 25, 2025.
- Kind: **[PROJECTION]** (AVOID Programme model output) + **[OBSERVATION]**-derived present value.
- Verbatim:
  - "Since the Industrial Revolution, the pH of the ocean has already decreased from its historical global average of around 8.16 (slightly basic) to about 8.07 today. Because the pH scale is logarithmic, a difference of one pH unit represents a tenfold acidification."
  - 2 °C scenario: "projected ocean pH levels by 2100 for a possible future scenario in which humans commit to taking the necessary actions to limit temperature increase to 2°C during this century … By the end of this century, average ocean surface pH would fall to about 8.01—about 1.5 times more acidic than the waters were before industrialization."
  - High-emissions scenario: "Atmospheric carbon dioxide concentrations would rise to around 1,000 parts per million (ppm) by 2100 … In the high-emissions scenario, global average ocean pH levels would fall to around 7.67 by 2100, roughly five times the amount of acidification that has already occurred. Such large changes in ocean pH have probably not been experienced on the planet for the past 21 million years".
- ⚠ Internal check: in pH units, 8.16→8.07 is a 0.09 drop and 8.07→7.67 is a further 0.40 (≈4.4×); "roughly five times" is the page's own wording — show as printed, do not recompute. "about 1.5 times more acidic" for 8.16→8.01 matches 10^0.15 ≈ 1.41 only roughly — again show as printed.
- ⚠ Dated: 2010, pre-CMIP6 scenarios. Label as "2010 model study".

### 3b. NOAA NOS Ocean Facts (definition only)
- "What is Ocean Acidification?" https://oceanservice.noaa.gov/facts/acidification.html (public domain). Verbatim: "Ocean acidification refers to a reduction in the pH of the ocean over an extended period of time, caused primarily by uptake of carbon dioxide (CO2) from the atmosphere." "The ocean absorbs about 30 percent of the CO2 that is released in the atmosphere".
- ⚠ Compare NCA5 Ch. 3 [OBSERVATION 2011–2020]: oceans took "24%" of emitted carbon. Different period/definition; record both.

### 3c. NCA5 (qualitative only)
- Ch. 2 p. 2-28: "For higher levels of future CO2 emissions, the chemistry of waters in the Gulf of Maine will change in ways damaging to shell-building organisms, with the saturation level of aragonite—a form of calcium carbonate used by shell-building marine life—projected to fall below a crucial shell-building threshold for most of the year." NCA5 Ch. 2, 3 and 10 give **no global pH number by scenario** (searched).

---

## 4. Arctic sea ice, glaciers, ice sheets

- NCA5 Ch. 2 p. 2-27 [PROJECTION]: "The probability that September sea ice completely disappears from the Arctic Ocean, including Alaska coastal waters, rises from 1% in 2100 under a GWL of 1.5°C to 10%–30% at a GWL of 2°C."
- NCA5 Ch. 3 pp. 3-26–3-27 [OBSERVATION + uncertainty]: "there is clear evidence of loss of ice sheet mass from 1993 to 2020, and the rate of loss has increased for both the Greenland and Antarctic ice sheets." "Two specific processes, marine ice cliff instability and marine ice sheet instability, could lead to rapid ice sheet loss over several decades, but the physical processes that would result in these instabilities and how they would progress once triggered remain uncertain."
- NCA5 Ch. 4 p. 4-8: "Reductions in snow cover are also accelerating the retreat of glaciers that are critical for summer streamflow in Alaska and the Pacific Northwest".
- NSIDC "Ice Sheet Quick Facts", https://nsidc.org/learn/parts-cryosphere/ice-sheets/ice-sheet-quick-facts (© 2026 NSIDC; quote briefly with credit; no date on page) [EDU]:
  - "If the Greenland Ice Sheet melted entirely, scientists estimate that sea level would rise about 7.4 meters (23 feet). If the Antarctic Ice Sheet melted, sea level would rise by about 58 meters (190 feet). While this is unlikely to occur in the near future, there is research to suggest that the entire Greenland Ice Sheet could melt by the year 3000 if the world follows a high greenhouse gas emission pathway."
  - ⚠ Same page elsewhere: "If the entire Greenland Ice Sheet melted, sea level would rise about 7.4 meters (24 feet)." The page gives **23 ft and 24 ft** for the same 7.4 m (7.4 m ≈ 24.3 ft). Show the metre value.
  - "The Antarctic Ice Sheet measures nearly 4.9 kilometers (3 miles) at its thickest point and contains about 30 million cubic kilometers (7.2 million cubic miles) of ice." Greenland: "about 2.9 million cubic kilometers (696,000 cubic miles) of ice".
- NSIDC sea-ice quick facts page: no projection numbers found.

---

## 5. Equilibrium climate sensitivity (ECS) [ASSESSMENT]

- **NCA5 Ch. 3 Key Message 3.2 (p. 3-10), verbatim:** "**The Estimated Range of Climate Sensitivity Has Narrowed by 50%** — Recent improvements in the understanding of how climate feedbacks vary across timescales have narrowed the estimated likely range of warming expected from a doubling of atmospheric carbon dioxide by 50% to between 4.5°F and 7.2°F (high confidence)."
- p. 3-10 definition: "equilibrium climate sensitivity (ECS), defined as the change in global average surface temperature after the climate system reaches a steady state following a doubling of the atmospheric CO2 concentration." "Cloud feedbacks are the largest source of ECS uncertainty (Figure 3.2)."
- p. 3-11: "Recent assessments place ECS between 4.5°F and 7.2°F (2.5°C and 4.0°C), a 50% uncertainty reduction from previous assessments (Figure 3.3). It is virtually certain that ECS is greater than 2.7°F (1.5°C)". Fig. 3.3 caption: "NCA adopts the climate sensitivity values assessed by IPCC reports." (Fig. 3.3 adapted with permission — do not reproduce.)
- p. 3-12: three lines of evidence — "1) observed present-day variations on monthly to interannual timescales … 2) observed temperature changes between the preindustrial period and present … and 3) estimated temperature and radiative forcing changes for multiple warm and cold periods in paleoclimate records." "the CMIP6 models with ECS values greater than 9°F (5°C) may simulate an unrealistically early timing of reaching a given global warming level (GWL)."
- Ch. 2 p. 2-31: "the likely range of equilibrium climate sensitivity … between 2.5°C and 4.0°C, higher values are not definitively ruled out".
- ⚠ **Second range in the same report** — Ch. 2 Traceable Account p. 2-40: "It is very likely that the eventual global warming in response to a doubling of atmospheric CO2 is between 2.3° and 4.7°C and likely that the warming would be between 2.6° and 3.9°C." (cites ref. 232; this matches the Sherwood et al. 2020 ranges, but the reference mapping in the PDF text layer could not be confirmed). Ch. 2 p. 2-39: "there are still tail risks of outcomes where equilibrium climate sensitivity exceeds 5°C or is below 2°C per doubling of atmospheric CO2." → **Use KM 3.2's 2.5–4.0 °C likely range as the headline**, and if the 2.6–3.9 °C figure is shown, attribute it to the Ch. 2 traceable account.
- Sherwood et al. 2020 (*Rev. Geophys.*): **not fetched** — hosted on agupubs.onlinelibrary.wiley.com (off-limits *.wiley.com).

---

## 6. Definitions: weather vs climate, forecast vs projection vs scenario, models, ensembles, CMIP

### 6a. NCA5 Appendix 5 Glossary (public domain), verbatim
- **Weather** (p. A5-30): "The state of the atmosphere, mainly with respect to its effects on life and human activities. As distinguished from climate, weather consists of short-term (minutes to days) variations in the atmosphere. Popularly, weather is thought of in terms of temperature, humidity, precipitation, cloudiness, visibility, and wind."
- **Climate**: "Climate, in a narrow sense, is usually defined as the average weather or, more rigorously, as the statistical description in terms of the average and variability of defining factors over a period of time ranging from months to thousands or millions of years. The classical period for averaging these variables is 30 years, as defined by the World Meteorological Organization."
- **Climate model**: "A numerical representation of the climate system based on the physical, chemical, and biological properties of its components, their interactions, and feedback processes and accounting for some of its known properties. … Climate models are applied as a research tool to study and simulate long-term climate projections (decadal or longer) and operationally used to create shorter climate predictions (seasonal, annual, interannual)."
- **Climate projection**: "The simulated response of the climate system to a scenario of future emissions or concentrations of greenhouse gases and aerosols, generally derived using climate models. Climate projections depend on the emissions, concentration, or radiative forcing scenario used, which, in turn, is based on assumptions concerning, for example, future socioeconomic and technological developments that may or may not be realized."
- **Scenario** (p. A5-26): "A plausible description of how the future may develop based on a coherent and internally consistent set of assumptions about key driving forces (e.g., rate of technological change, prices) and relationships. Note that scenarios are neither predictions nor forecasts but are used to provide a view of the implications of developments and actions."
- **Earth system model (ESM)**: "A coupled atmosphere–ocean general circulation model in which a representation of the carbon cycle is included, allowing for interactive calculation of atmospheric carbon dioxide or compatible emissions. Additional components (e.g., atmospheric chemistry, ice sheets, dynamic vegetation, nitrogen cycle, and urban or crop models) may be included."
- **Ensemble (modeling)**: "A collection of comparable datasets that reflect variations within the bounds of one or more sources of uncertainty and that, when averaged, can provide a more robust estimate of underlying model behavior. Ensemble techniques are used by the observational, reanalysis, and modeling communities."
- **Coupled Model Intercomparison Project (CMIP)**: "A climate modeling activity from the World Climate Research Programme, which coordinates and archives climate model simulations based on shared model inputs by modeling groups from around the world. The CMIP Phase 3 (CMIP3) multimodel dataset includes projections using … (SRES). The CMIP Phase 5 (CMIP5) dataset includes projections using the Representative Concentration Pathways (RCPs). The CMIP Phase 6 (CMIP6) involves a suite of common model experiments as well as an ensemble of CMIP-endorsed Model" [Intercomparison Projects — line continues on next page].
- **Downscaling** (statistical vs physics-based/dynamical) (p. A5-11): "A method that derives local- to regional-scale information from larger-scale models or data analyses. Two main methods exist: dynamical downscaling and empirical/statistical downscaling. The dynamical method uses the output of regional climate models, global models with variable spatial resolution, or high-resolution global models. The empirical/statistical methods are based on observations and develop statistical relationships that link the large-scale atmospheric variables with local/regional climate variables. In all cases, the quality of the driving model remains an important limitation on quality of the downscaled information."
- **Climate feedback**: "An interaction in which a perturbation in one climate quantity causes a change in a second, and the change in the second quantity ultimately leads to an additional change in the first. A negative feedback is one in which the initial perturbation is weakened by the changes it causes; a positive feedback is one in which the initial perturbation is enhanced."
- **Tipping point** (p. A5-28): "The point at which a change in the climate triggers a significant environmental event, which may be permanent, such as widespread bleaching of corals or the melting of very large ice sheets."

### 6b. NCA5 Ch. 3 KM 3.3 (pp. 3-13 to 3-17) and App. 3 — how projections are made
- KM 3.3 statement (p. 3-13): "New scenarios of socioeconomic development, and their associated emissions and land-use changes, drive updated climate projections from Earth system models. Large ensemble simulations from multiple models have enabled scientists to better distinguish anthropogenic climate change from natural climate variability. More targeted model evaluation techniques are using observations to narrow the estimated range of future climatic changes."
- Resolution (p. 3-14): "A number of ESMs have been run at significantly higher resolution (about 20–50 km) than the previous standard (about 100–200 km)". p. 3-15: "CMIP6 includes many experiments performed by many ESMs at about 100 km resolution."
- Fig. 3.4 caption (p. 3-15; credit PNNL, NOAA NCEI, CISESS NC): "Five societal development pathways (the SSPs) were produced. Then, assumptions about climate mitigation policies … were developed (the SPAs). Integrated assessment models took these baseline or mitigated pathways and produced alternative plausible trajectories of greenhouse gas emissions and land-use change. Earth system models used those emissions and land-use changes as inputs to produce the new CMIP6 scenarios of climate outcomes."
- **Large ensembles** (p. 3-16): "Many realizations of the past and future climate are generated from climate model simulations started from initial conditions that are slightly perturbed from one another. These small random perturbations, the so-called butterfly effect, can subsequently alter the chaotic sequence of weather and climate events and, hence, the future course of the variability simulated by the model." Fig. 3.5 uses "the CESM2 100-member Large Ensemble" (1972–2021 and SSP3-7.0 2022–2071; credit NCAR).
- **Emergent constraints** (p. 3-17): "strong statistical relationships between highly uncertain future climate parameters and observable trends or variations in the current climate, along with a physical explanation of this relationship."
- **Observations** (p. 3-13), example list: GISTEMP, NOAA GML CO2, Argo, CERES, AIRS; "the now 30-year record of sea level heights from a series of satellite altimeters provides observations of a recent acceleration in sea level rise."
- App. 3 p. A3-4: "16 global CMIP6 models were downscaled using historically trained computer algorithms (statistical downscaling) and model weighting based on equilibrium climate sensitivity … the Localized Constructed Analogs Version 2 (LOCA2) and Seasonal Trends and Analysis of Residuals, Empirical-Statistical Downscaling Model (STAR-ESDM)". "A collection (ensemble) of models is often used to show an uncertainty range." TSU provided "projected climate variable information from 43 CMIP6 models using a set of five SSP-RCP scenarios".
- App. 3 p. A3-3: "some CMIP6 models show a particularly large global temperature response to increasing atmospheric carbon dioxide concentrations—a response that is not considered to be realistic".

### 6c. NOAA GFDL "Climate Modeling" page (public domain, NOAA) — physics basis
- https://www.gfdl.noaa.gov/climate-modeling/ (no date on page).
- "A global climate model (GCM) is a complex mathematical representation of the major climate system components (atmosphere, land surface, ocean, and sea ice), and their interactions."
- "Climate models divide the globe into a three-dimensional grid of cells representing specific geographic locations and elevations."
- "There are two types of processes within climate models that are used today: simulated and parameterized. Simulated processes are larger than grid-scale and based on bedrock scientific principles (conservation of energy, mass, and momentum). … Parameterized processes represent more complex processes that are smaller than grid scale (so, cannot be physically represented) using simpler processes. Their formulations are guided by fundamental physical principles, but also make use of observational data. An example of a parameterized process is one that represents cloud and aerosol composition."
- "Beginning in the 1960s, GFDL scientists developed the first coupled ocean-atmosphere general circulation climate model".
- "Climate models have also produced an accurate hindcast of 20th century climate change".
- "Natural climate variability can be reduced by using an ensemble of simulations with slight changes in each, which produces an average result and reveals the response to forcing."
- "Generally, more confidence is placed in simulations that are at larger scales because of the agreement in global averages and patterns."

### 6d. NASA Science climate FAQ (public domain)
- https://science.nasa.gov/climate-change/faq/ : "“Weather” refers to the more local changes in the climate we see around us, on short timescales from minutes to hours, to days to weeks. Examples are familiar – rain, snow, clouds, winds, thunderstorms, sleet, and hail. “Climate” refers to longer-term averages (which may be regional or global) and can be thought of as the weather averaged over several decades."
- ⚠ Note NASA's "minutes … to weeks" vs NCA5 glossary's "minutes to days". Record both.

### 6e. UCAR SciEd (read, NOT recommended)
- https://scied.ucar.edu/learning-zone/how-climate-works/climate-modeling — useful phrasing on resolution: "As a general rule, increasing the resolution of a model by a factor of two means about ten times as much computing power will be needed". [EDU]
- The "Predictions of Future Global Climate" page restates IPCC numbers and uses "predict"/"worst case" wording for projections, which conflicts with the app rule; its numbers are IPCC-derived (IPCC not used). **Do not use for numbers.** Licence on page not found (© UCAR assumed).

---

## 7. Biome shifts and freshwater availability (NCA5 Chs. 4 and 8)

### 7a. Ch. 4 Water — Key Message 4.1 (p. 4-5), verbatim
"**Climate Change Will Continue to Cause Profound Changes in the Water Cycle** — Changes to the water cycle pose risks to people and nature. Alaska and northern and eastern regions of the US are seeing and expect to see more precipitation on average, while the Caribbean, Hawai‘i, and southwestern regions of the US are seeing and expect to see less precipitation (medium confidence). Heavier rainfall events are expected to increase across the Nation (very likely, very high confidence), and warming will increase evaporation and plant water use where moisture is not a limiting factor (medium confidence). Groundwater supplies are also threatened by warming temperatures that are expected to increase demand (very likely, high confidence). Snow cover will decrease and melt earlier (very likely, high confidence). Increasing aridity, declining groundwater levels, declining snow cover, and drought threaten freshwater supplies (medium confidence)."
- Snow [PROJECTION] (p. 4-8): "In areas of the West where snow is the dominant source of runoff, total seasonal snow water volume is projected to decrease by more than 24% by 2050 under intermediate (RCP4.5; Figure 4.5) and higher scenarios, with persistent low-snow conditions emerging within the next 60 years."
- Fig. 4.5 (p. 4-9; credit Univ. of Colorado Boulder, NOAA NCEI, CISESS NC): "Under an intermediate scenario (RCP 4.5), peak SWE is projected to decline across much of the country except for some high-elevation interior locations in the contiguous United States and parts of Alaska (a). … The wettest (b) and driest (c) projections both show decreases in SWE".
- Fig. 4.7 runoff (midcentury, RCP4.5): "Decreases are projected in Hawai‘i and parts of the Nation supplied by snow (a). … The range between the wettest (b) and driest (c) projections illustrate the uncertainty in runoff projections."
- Traceable account KM 4.1: the hydrologic maps "show mid-21st-century projections … based on an intermediate scenario (RCP4.5). … both scenarios show similar hydrologic responses at midcentury".
- Groundwater (p. 4-10): "Groundwater trends vary regionally and are difficult to project".

### 7b. Ch. 8 Ecosystems — Key Messages 8.1, 8.2 (verbatim)
- KM 8.1 "**Change Is Driving Rapid Ecosystem Transformations** — Climate change, together with other stressors, is driving transformational changes in ecosystems, including loss and conversion to other states, and changes in productivity (very likely, high confidence). … Many types of extreme events are increasing in frequency and/or severity and can trigger abrupt ecosystem changes (medium confidence)."
- KM 8.2 "**Species Changes and Biodiversity Loss Are Accelerating** — … Future responses of species and populations will depend on the magnitude and timing of changes, coupled with the differential sensitivity of organisms; species that cannot easily relocate or are highly temperature sensitive may face heightened extinction risks (very likely, high confidence)."
- Range shifts [OBSERVATION] (p. 8-18): "Elevational and latitudinal range shifts driven by climate change have already occurred for multiple species (Figure 8.11), with range shifts of marine species more responsive and greater in magnitude than terrestrial ones … Mountaintop ranges are shrinking as species shift upslope, with high-elevation ones highly vulnerable."
- Ecosystem tipping points (p. 8-11): "Many ecosystems are at increased risk of ecosystem tipping points (where rapid and unpredictable conversions to new states occur), although it is difficult to predict how, where, and when these changes will occur." Fig. 8.5: "Thawing of permafrost can cause irreversible tipping points in Arctic landscapes".
- Limits of projection (Traceable account, Range Shifts): "The speed and extent of some species range shifts remain uncertain. Climate envelope models use current relationships among species ranges and climatic characteristics to project how ranges may shift in the face of climate change, yet they necessarily assume that climate is the main constraint on ranges and that species rapidly respond. In reality, species responses can be slowed and limited by dispersal ability, natural and human-created barriers, and species interactions." (Good example of a **statistical** model vs physics-based ESM.)
- Overshoot (Ch. 2 p. 2-33): midcentury temperature overshoot "could result in irreversible consequences to global ecosystems (Ch. 8)."

---

## 8. Tipping points — what is well-constrained vs under investigation

- NCA5 Ch. 2 pp. 2-31–2-32 ("Tipping Elements Could Lead to Regional Rapid Changes"), verbatim:
  - "Tipping elements, or tipping points as they are colloquially known, are components of the Earth system that may respond to human-caused climate change by transitioning toward substantially different long-term states upon passing key thresholds. In some cases, such changes could produce additional greenhouse gas emissions that could compound global warming."
  - "Systems that have been identified as possible tipping elements include the slowdown of the Atlantic Meridional Overturning Circulation, Arctic permafrost thaw, loss of the Greenland and West Antarctic ice sheets, Arctic sea ice loss, boreal forest shifts, disruption of tropical seasonal monsoons, Amazon rainforest dieback, tropical coral reef loss, and the disappearance of clouds that currently reflect sunlight cooling the Earth (Figure 2.15)."
  - **Under investigation:** "While some of these tipping elements are represented in modern Earth system models, many are still not, and the precise response of these systems to rapid climate change remains poorly understood. It is not possible to say that exceeding a particular GWL will trigger these tipping elements, nor are scientists certain that staying below a particular GWL will prevent them. However, the risk of these nonlinear changes increases with every increment of global warming."
  - Fig. 2.15 "Possible Regional Tipping Elements" — "Adapted with permission from Figure 1 in Wang et al. 2023, which was adapted from McSweeney 2020." → **copyrighted; do not reproduce**; list the 10 elements in text.
- AMOC (Ch. 3 p. 3-25): "It is hypothesized from some proxy evidence that the AMOC has declined since the Industrial Revolution. It remains uncertain whether observations support the anthropogenically forced weakening of the AMOC during the past four decades predicted by climate models."
- Ice sheets (Ch. 3 pp. 3-26–27): MICI/MISI "could lead to rapid ice sheet loss over several decades, but the physical processes … remain uncertain."
- **Well-constrained (contrast):** Ch. 2 Traceable Account p. 2-39: "The physical process link between higher temperatures and higher moisture availability in the atmosphere is well documented and understood." p. 2-40: "It is an unequivocal fact, backed by over 100 years of theory and observation, that warming increases with GHG emissions, and warming is virtually certain to continue at current levels of emissions." GFDL: models "all show rising global temperatures with amplified warming in the Arctic, enhancement of the hydrologic cycle …, and rising sea level."
- Catastrophic tails (Ch. 2 p. 2-40): "There is high confidence that catastrophic scenarios where warming exceeds 4°C cannot be ruled out due to uncertainties in climate sensitivity, carbon cycle feedbacks, and emissions scenarios."
- "The Biggest Uncertainty Is What We Will Do" (Ch. 2 p. 2-33): "the largest source of uncertainty is the trajectory of our greenhouse gas emissions (KM 3.3)."

---

## NOT FOUND / gaps

1. **nca2023.globalchange.gov is offline** (DNS fails). All NCA5 text was read from the official PDFs mirrored on NOAA's toolkit.climate.gov. Cite the DOIs (10.7930/NCA5.2023.*), not the dead URL. NCA5 chapter web pages and figure metadata (e.g. Fig. 9.2) were not available.
2. **No global-mean temperature value for 2030 or 2050 by scenario** in NCA5 Ch. 2/3. Only the 2 °C crossing window (2033–2054, mean 2042, SSP5-8.5), "around 2.6°C (ranging from 2°–3.7°C) by 2100" under current policies, and per-GWL maps. A by-scenario 2081–2100 warming table exists only in IPCC AR6 (IPCC not used).
3. **Ocean pH by CMIP6 scenario: not found** in an allowed source. Only the 2010 Climate.gov/Bernie et al. figures (8.16 → 8.07 today; ~8.01 under a 2 °C path; ~7.67 under high emissions by 2100). PMEL OA story page returned 404. AOML is off-limits. NCA5 Ch. 10 (Oceans) was downloaded, but only qualitative pH statements were found in it.
4. **Sherwood et al. 2020 not read** (Wiley host is off-limits). The 2.6–3.9 °C likely / 2.3–4.7 °C very likely ranges are quoted from NCA5 Ch. 2's traceable account. Mapping to ref. 232 was not confirmed.
5. **Arctic sea-ice "first ice-free summer" year**: no allowed source gives a year. Only NCA5's probability per GWL (1% at 1.5 °C → 10–30% at 2 °C, in 2100). The NOAA Arctic Report Card was not consulted.
6. **Glacier mass-loss projections (global, %) not found**. Only qualitative NCA5 text and NSIDC's whole-ice-sheet sea-level equivalents.
7. A clean agency definition of **"weather forecast"** and of **"observation"** as glossary entries was not found. Use the NCA5 glossary ("Climate model … climate predictions (seasonal, annual, interannual)"; "Scenario … neither predictions nor forecasts") plus NASA's weather/climate FAQ.
8. The Sweet et al. 2022 **DOI is not printed**. Its original NOAA URL now returns 404. The copy used is the earth.gov PDF linked from USGS.
9. No author bios were verified.
