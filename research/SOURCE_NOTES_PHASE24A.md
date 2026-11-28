# SOURCE NOTES — Phase 24A: Human activities and environmental change (Gate 24.1)

Research date: 2026-11-28. Rules: /tmp/vv-research/p24/RULES.md. Raw files: /tmp/vv-research/p24/a/.
User-Agent: `VoyagerVentures-Research/0.1 (educational; respects robots.txt)`; ≥1.2 s between requests per host.
Scope: mechanisms, not politics. Separate (a) greenhouse warming, (b) local air pollution, (c) direct waste heat, (d) ecosystem disruption, (e) resource consumption; compare technologies with life-cycle numbers and their stated assumptions.

Data-kind labels: **[OBS]** observation / **[INV]** inventory or bookkeeping estimate built from activity data / **[MODEL]** model output / **[SYN]** multi-method synthesis / **[ASSESS]** expert assessment / **[PROJ]** projection / **[EDU]** agency outreach simplification.

## Robots / terms log

| Host | robots.txt result (fetched first) | Decision |
|---|---|---|
| essd.copernicus.org | `User-agent: *` (no Disallow) | allowed (CC BY 4.0) |
| acp.copernicus.org / esd.copernicus.org | `User-agent: *` (no Disallow) | allowed |
| edgar.jrc.ec.europa.eu | `User-agent: *` / `Disallow:` (empty) | allowed |
| gml.noaa.gov | `Disallow: /webdata/`, `/aftp/`, `/grad/nuebrew/nuebrewdata/` | allowed for html pages; no /webdata/ or /aftp/ |
| www.epa.gov | Drupal default (/core/, /admin/, /search/, /user/…) | allowed |
| pubs.usgs.gov | `Disallow: /archive/` | allowed (no /archive/) |
| www.usgs.gov | Drupal default | allowed |
| csl.noaa.gov | disallows /cgi-bin, data dirs, /img, /js, /nav…; `twiceler` banned | allowed (/assessments/) |
| www.energy.gov / netl.doe.gov | Drupal default | allowed |
| bidenwhitehouse.archives.gov | `User-agent: *` / `Disallow:` (empty) | allowed |
| ozone.unep.org | Drupal default | allowed |
| **unece.org** | **HTTP 403 Cloudflare "Just a moment..." challenge on robots.txt** | **EXCLUDED — not fetched further** |
| **www.sciencedirect.com** | **`User-agent: *` → `Disallow: /`; explicit `User-agent: ClaudeBot` → `Disallow: /`** | **EXCLUDED** (Lee et al. 2021 not read there) |
| **www.faa.gov** | **HTTP 403 Akamai "Access Denied" on robots.txt** | **EXCLUDED** |
| www.nrel.gov / docs.nrel.gov | connection failed (curl 000, no response) | not reachable — see item 11 |

Off-limits hosts were not touched (no Wikipedia, IPCC, Wiley/AGU, Nature, Springer, iea.org, ncbi, etc.).

---

## 1. Global CO2 budget (sources and sinks) — Global Carbon Budget 2025

- Citation: Friedlingstein, P., O'Sullivan, M., Jones, M. W., Andrew, R. M., Bakker, D. C. E., Hauck, J., Landschützer, P., Le Quéré, C., Li, H., Luijkx, I. T., Peters, G. P., Peters, W., Pongratz, J., Schwingshackl, C., Sitch, S., Canadell, J. G., Ciais, P., et al.: Global Carbon Budget 2025, *Earth Syst. Sci. Data*, 18, 3211–3288, 2026. Published 13 May 2026. DOI **10.5194/essd-18-3211-2026** (verified via api.crossref.org). Data: https://doi.org/10.18160/GCP-2025.
- URL: https://essd.copernicus.org/articles/18/3211/2026/ (full text HTML read).
- Corrigendum (26 Oct 2026, https://doi.org/10.5194/essd-18-3211-2026-corrigendum, PDF text layer read): "The only change is on the ocean interior estimate of the ocean carbon sink. These changes do not affect any of the other results from the paper." (Table 6 only.) None of the numbers below are affected.
- Note: a **preprint** "Global Carbon Budget 2026" (essd-2026-895, 10 Nov 2026) exists in ESSD Discussions; it is under review and NOT used here.
- Institution: Global Carbon Project; lead author Univ. of Exeter. Bio: not verified.
- Licence: "© Author(s) 2026. This work is distributed under the Creative Commons Attribution 4.0 License."
- Kind: **[SYN]** — fossil from energy/cement statistics [INV]; land-use from bookkeeping models [INV/MODEL]; atmospheric growth from station measurements [OBS]; ocean sink from models + fCO2 products [MODEL/OBS]; land sink from DGVMs [MODEL]. "All uncertainties are reported as ± 1σ."

Verbatim (Abstract):
- "For the year 2024, E FOS increased by 1.1 % relative to 2023, with fossil emissions at 10.3 ± 0.5 GtC yr−1 (including the cement carbonation sink, 0.2 GtC yr−1), E LUC was 1.3 ± 0.7 GtC yr−1, for total anthropogenic CO2 emissions of 11.6 ± 0.9 GtC yr−1 (42.4 ± 3.2 GtCO2 yr−1)."
- "Also, for 2024, G ATM was 7.9 ± 0.2 GtC yr−1 (3.73 ± 0.1 ppm yr−1), 2.2 GtC above the 2023 growth rate. S OCEAN was 3.4 ± 0.4 GtC yr−1 and S LAND was 1.9 ± 1.1 GtC yr−1, leaving a large negative B IM (−1.7 GtC yr−1), suggesting that the total sink or G ATM is strongly overestimated in 2024."
- "The global atmospheric CO2 concentration averaged over 2024 reached 422.8 ± 0.1 ppm. Preliminary data for 2025 suggest an increase in E FOS relative to 2024 of + 1.0 % (0.2 % to 1.7 %) globally, and atmospheric CO2 concentration increasing by 2.1 ppm reaching 425.6 ppm, 53 % above the pre-industrial level (around 278 ppm in 1750)."
- Definitions: "Fossil CO2 emissions (E FOS) are based on energy and cement production data. Emissions from land-use change (E LUC) are estimated by bookkeeping models based on land-use data. The global atmospheric CO2 growth rate (G ATM) is computed from changes in concentration measured at surface stations." "The sum of all sources and sinks results in the carbon budget imbalance (B IM), a measure of imperfect data and incomplete understanding of the contemporary carbon cycle."

Decadal 2015–2024 means (Key messages / Sect. 3, full-text HTML) — better for teaching than the anomalous El Niño year 2024:
- "an average of 9.8 ± 0.5 GtC yr−1 during 2015–2024" (E FOS incl. cement carbonation; Sect. 3.1).
- "Global net CO2 emissions from land use averaged 1.4 ± 0.7 GtC yr−1 (5.0 ± 2.6 GtCO2 yr−1) for the 2015–2024 period."
- "The atmospheric CO2 growth rate was 5.6 ± 0.02 GtC yr−1 (2.6 ppm) during the decade 2015–2024 (50 % of total CO2 emissions)."
- "The ocean sink ... has taken up 29 % of the total emissions in the past decade" ... "The ocean CO2 sink was 3.2 ± 0.4 GtC yr−1 during the decade 2015–2024".
- "The land sink, which is the global net uptake of CO2 by the land excluding land use, has taken up 21 % of the total emissions in the past decade" ... "The land CO2 sink was 2.4 ± 0.8 GtC yr−1 during the 2015–2024 decade but was reduced to 1.9 GtC ± 0.8 GtC yr−1 in 2024." (Note: abstract gives 2024 S LAND as 1.9 ± 1.1; key-message text says ± 0.8 — record both.)
- "Total anthropogenic emissions more than doubled since the 1960s, from 4.9 ± 0.7 GtC yr−1 for the decade of the 1960s to an average of 11.2 ± 0.9 GtC yr−1 during 2015–2024"
- "Cumulative anthropogenic CO2 emissions (fossil, including cement carbonation, and land-use change) for 1850–2024 totalled 745 ± 65 GtC (2730 ± 240 GtCO2)"
- "During the historical period 1850–2024, 67 % of historical emissions were from fossil emissions and 33 % from land-use change." ... "down to 12 % over the last decade (2015–2024)."
- Climate feedback on sinks: "The effects of climate change and climate variability act to reduce the land and ocean CO2 sinks by 25 % and 7.1 % respectively, on average for the 2015–2024 period." "The ocean sink is negatively affected by altered oceanic circulation and surface warming which decreases CO2 solubility."
- Unit note for app: 1 GtC = 3.664 GtCO2 is implied by the paired values (e.g. 11.6 GtC ↔ 42.4 GtCO2); do not state a conversion factor unless quoted.

---

## 2. Global GHG emissions by sector — EDGAR 2026 report (JRC)

- Citation: Crippa, M., Guizzardi, D., Pagani, F., Banja, M., Ciarlantini, S., Muntean, M., et al., *GHG emissions of all world countries – 2026 Report*, Publications Office of the European Union, Luxembourg, 2026, doi:**10.2760/7717504**, JRC147815. (Citation as printed on the report page and in the xlsx "info" sheet; DOI is a Publications Office DOI — not checked on Crossref [Publications Office DOIs are registered with DataCite/OP]. Do not show the DOI as verified.)
- URLs: https://edgar.jrc.ec.europa.eu/report_2026 (page); booklet PDF https://edgar.jrc.ec.europa.eu/booklet/GHG_emissions_of_all_world_countries_booklet_2026report.pdf (born-digital, text layer read); data https://edgar.jrc.ec.europa.eu/booklet/EDGAR_2026_GHG_booklet_2026.xlsx (sheet GHG_by_sector_and_country).
- Earlier edition also read: 2025 Report, doi:10.2760/9816914, JRC143227 (2024 total 53.2 Gt CO2eq). Use 2026.
- Institution: European Commission Joint Research Centre (with IEA for fossil CO2). Bio: not verified.
- Licence (page "Conditions of use"): "Unless otherwise noted, all material owned by the European Union is licensed under the Creative Commons Attribution 4.0 International (CC BY 4.0) licence." **Caveat:** "IEA-EDGAR CO2 (v5) data are based on data from IEA (2025) Greenhouse Gas Emissions from Energy ... licensed under CC BY-NC-ND 4.0." → The app may quote the report's own sentences (EU-owned, CC BY); treat fossil-CO2-by-sector numbers from the xlsx as CC BY-NC-ND (non-commercial, no derivatives). Prefer quoting report text.
- Kind: **[INV]** emission inventory (activity data × emission factors, IPCC guidelines). GWP-100 from IPCC AR5 ("aggregated using Global Warming Potential values from IPCC AR5 (GWP-100 AR5)").

Verbatim (report page, Main findings):
- "According to the latest data, global GHG emissions in 2025 reached 54.1 Gt CO2eq (without Land Use, land Use Change and Forestry). The 2025 data experienced an increase of 0.7% or 380 Mt CO2eq compared to the levels in 2024."
- "In 2025, the majority of GHG emissions consisted of fossil CO2 accounting for 73.8% of total emissions, while CH4 contributed for 17.6% to the total, N2O for 5.3% and F-gases for 3.3%."
- "Global fossil CO2 emissions increased by 76.3% since 1990. The increases in CH4 and N2O emissions have followed a somewhat slower pace: CH4 increased by nearly 33% and N2O by 48% between 1990 and 2025, while F-gases have seen a five-fold increase (+442%) in the same period."
Verbatim (booklet p. 17, Sect. 2):
- "Compared to 2024, emissions increased across all sectors, with the exception of the power sector which saw a slight decrease of emissions (-51.0 Mt CO2eq or -0.3%), keeping however, the role of dominant sector with a share of nearly 30% in global GHG emissions."
- Footnotes (sector definitions): "(25) Power industry includes power and heat generation plants (public and auto-producers)." "(26) Industrial combustion and processes include combustion for industrial manufacturing and industrial process emissions (e.g. non-metallic minerals, non-ferrous metals, solvents and other product use, chemicals, etc.)." 2025-report footnote for agriculture: "Agriculture includes agriculture livestock (enteric fermentation, manure management), agriculture soils (fertilisers, lime application, rice cultivation, direct soil emissions, indirect N2O emissions from agriculture), field burning of agricultural residues." Fuel exploitation: "fuel extraction, transformation and refineries activities, including venting and flaring."
- LULUCF (booklet): global wildfire emissions "in 2025 reached 2.2 Gt CO2eq, remaining below the long-term average of 2.9 Gt CO2eq since 1990".

Sector values for 2025 — summed by Voyager from the xlsx rows with Country = "GLOBAL TOTAL" (all gases, Mt CO2eq/yr, AR5 GWP-100). These are **data values; the percentage shares are DERIVED by Voyager, not printed in the report** (label them "computed from EDGAR 2026 data"):
| Sector (EDGAR) | 2025, Mt CO2eq | derived share |
|---|---|---|
| Power Industry | 15811.4 | 29.2 % (consistent with printed "nearly 30%") |
| Transport (incl. int'l aviation & shipping) | 8770.7 | 16.2 % |
| Agriculture | 6322.7 | 11.7 % |
| Industrial Combustion | 6253.5 | 11.5 % |
| Fuel Production | 6105.0 | 11.3 % |
| Processes (cement, steel, chemicals…) | 5378.9 | 9.9 % |
| Buildings | 3570.8 | 6.6 % |
| Waste | 1936.2 | 3.6 % |
| Sum | 54149.2 | (matches printed 54.1 Gt) |
Note: EDGAR excludes LULUCF from the 54.1 Gt; land-use CO2 is in item 6 (GCB).

---

## 3. Methane — rise and sources

### 3a. NOAA GML "Trends in Atmospheric Methane" (PRIMARY for the rise; public domain)
- Citation: NOAA Global Monitoring Laboratory, *Trends in Atmospheric Methane (CH4)*, Lan, X., Thoning, K. W. and Dlugokencky, E. J. (page credits not re-checked — cite as NOAA GML). "Last updated: Nov 19, 2026".
- URL: https://gml.noaa.gov/ccgg/trends_ch4/ (html page; no /webdata/ files fetched).
- Licence: U.S. Government work (public domain).
- Kind: **[OBS]** globally averaged marine surface flask data.
- Verbatim: "Global CH4 Monthly Means August 2026: 1936.37 ppb August 2025: 1931.29 ppb"
- Verbatim (method): "The graphs show globally-averaged, monthly mean atmospheric methane abundance determined from marine surface sites." "The Global Monitoring Division of NOAA's Earth System Research Laboratory has measured methane since 1983 at a globally distributed network of air sampling sites". "1 ppb indicates that one out of every billion molecules in an air sample is CH4".
- Annual increase table (ppb, ± uncertainty), selected verbatim rows: 1984 12.91 ±0.91; 1992 2.43; 2000 −1.35; 2004 −4.72; 2006 1.85; 2007 7.85; 2014 12.69; 2019 9.70; **2020 14.77 ±0.51; 2021 17.70 ±0.36**; 2022 13.01 ±0.36; 2023 8.29 ±0.82; 2024 8.07 ±0.43; 2025 4.37 ±0.43.
- Verbatim (meaning): "It represents the sum of all CH4 added to, and removed from, the atmosphere during the year by human activities and natural processes." Caveat: "the initial, April estimate of the annual increase is likely to change significantly as more data are added".

### 3b. Global Methane Budget 2000–2020 (sources and sinks; CC BY 4.0)
- Citation: Saunois, M., Martinez, A., Poulter, B., Zhang, Z., Raymond, P. A., Regnier, P., Canadell, J. G., Jackson, R. B., Patra, P. K., Bousquet, P., Ciais, P., Dlugokencky, E. J., Lan, X., et al.: Global Methane Budget 2000–2020, *Earth Syst. Sci. Data*, 17, 1873–1958, 2025. DOI **10.5194/essd-17-1873-2025** (Crossref verified; published 9 May 2025).
- URL: https://essd.copernicus.org/articles/17/1873/2025/ (full-text HTML read).
- Licence: "© Author(s) 2025. This work is distributed under the Creative Commons Attribution 4.0 License."
- Kind: **[SYN]** top-down = atmospheric inversions [MODEL constrained by OBS]; bottom-up = inventories + process models.
- Verbatim (Abstract): "CH4 is the second most important human-influenced greenhouse gas in terms of climate forcing after carbon dioxide (CO2), and both emissions and atmospheric concentrations of CH4 have continued to increase since 2007 after a temporary pause."
- "For the 2010–2019 decade, global CH4 emissions are estimated by atmospheric inversions (top-down) to be 575 Tg CH4 yr−1 (range 553–586, corresponding to the minimum and maximum estimates of the model ensemble). Of this amount, 369 Tg CH4 yr−1 or ∼ 65 % is attributed to direct anthropogenic sources in the fossil, agriculture, and waste and anthropogenic biomass burning (range 350–391 Tg CH4 yr−1 or 63 %–68 %)."
- "The 2020 emission rate is the highest of the period and reaches 608 Tg CH4 yr−1 (range 581–627), which is 12 % higher than the average emissions in the 2000s."
- "Bottom-up methods suggest 16 % (94 Tg CH4 yr−1) larger global emissions (669 Tg CH4 yr−1, range 512–849) than top-down inversion methods for the 2010–2019 period."
- "Bottom-up approaches show that the combined wetland and inland freshwater emissions average 248 [159–369] Tg CH4 yr−1 for the 2010–2019 decade."
- Sinks: "The tropospheric loss of methane, as the main contributor to methane lifetime, has been estimated at 563 [510–663] Tg CH4 yr−1 based on chemistry–climate models." "The total sink of CH4 is estimated at 633 [507–796] Tg CH4 yr−1 by the bottom-up approaches and at 554 [550–567] Tg CH4 yr−1 by top-down approaches."
- Sectors (Sect. 3/Summary): "For 2010–2019, agriculture and waste contributed an estimated 228 [213–242] Tg CH4 yr−1 in the top-down budget and 211 [195–231] Tg CH4 yr−1 in the bottom-up budget. Fossil fuel emissions contributed 115 [100–124] Tg CH4 yr−1 in the top-down budget and 120 [117–125] Tg CH4 yr−1 in the bottom-up budget. Biomass and biofuel burning contributed 27 [26–27] Tg CH4 yr−1 in the top-down budget and 28 [21–39] Tg CH4 yr−1 in the bottom-up budget."
- Sect. 3.1.4: "Agriculture emissions amount to 144 Tg CH4 yr−1, 40 % of the direct anthropogenic emissions, with the rest coming from the fossil fuel sector (34 %), waste (19 %), and biomass (5 %) and biofuel (3 %) burning." "Of these activities, globally and in most countries, livestock is by far the largest source of CH4, followed by waste handling and rice cultivation."
- Mechanism (enteric fermentation, Sect. 3.1.4): "Enteric domestic ruminants such as cattle, buffalo, sheep, goats, and camels emit CH4 as a by-product of the anaerobic microbial activity in their digestive systems". "There are currently (2020) about 1.5 billion cattle globally, almost 1.3 billion sheep, and nearly as many goats".
- "Global CH4 emissions from enteric fermentation and manure management are estimated in the range of 114–124 Tg CH4 yr−1, for the year 2020, in the GAINS model and CEDS, USEPA, FAO-CH4, and EDGARv7 inventories (Table 3)."

---

## 6. Land-use change / deforestation and the land sink; agriculture/livestock

### 6a. Land use — GCB 2025 (same source as item 1; CC BY 4.0) — Key messages + Sect. 3.2
- "Global net CO2 emissions from land use averaged 1.4 ± 0.7 GtC yr−1 (5.0 ± 2.6 GtCO2 yr−1) for the 2015–2024 period. Emissions from deforestation, the main driver of global gross emissions, remain high at around 1.9 GtC yr−1 over the 2015–2024 period, highlighting the strong potential of halting deforestation for emissions reductions. Sequestration of 1.3 GtC yr−1 through re-/afforestation and forest regrowth in shifting cultivation cycles offsets two third of the deforestation emissions. In addition, smaller net emissions are due to wood harvest and forest management, peat drainage and peat fire."
- Components (2015–2024, mean of three bookkeeping models, [range]): "fluxes from deforestation amount to an emission of 1.9 [1.5 to 2.3] GtC yr−1 (Table 5), of which 1.1 [0.9, 1.2] GtC yr−1 are from permanent deforestation. Fluxes from forest (re-)growth amount to a removal of − 1.3 [ − 1.5, − 1.0] GtC yr−1 (Table 5), of which − 0.6 [ − 0.7, − 0.5] GtC yr−1 is from re/afforestation and the remainder from forest regrowth in shifting cultivation cycles. Wood harvest and other forest management causes net emissions of 0.4 [0.1, 0.7] GtC yr−1 ... Emissions from peat drainage and peat fires (0.2 [0.2, 0.3] GtC yr−1) and the net flux from other transitions (0.1 [0.1, 0.1] GtC yr−1) are of smaller magnitude globally (Table 5)."
- Land sink: see item 1 ("2.4 ± 0.8 GtC yr−1 during the 2015–2024 decade"; "21 % of the total emissions"; climate change reduces it "by 25 %").
- Definitional caution (Sect. 3.2): "The NGHGI data under the land-use, land-use change, and forestry (LULUCF) sector ... and the LULUCF estimates from FAOSTAT ... differ from the global models' definition of E LUC". → The app must not add GCB E_LUC to EDGAR LULUCF numbers.
- Kind: **[INV/MODEL]** bookkeeping models; "a persistent large uncertainty in the estimate of land-use change emissions" (abstract).

### 6b. Agriculture / livestock methane — Global Methane Budget (item 3b) used. EDGAR agriculture sector 2025 = 6322.7 Mt CO2eq (item 2 table; derived share 11.7 %). FAO/EPA agriculture pages not needed.

---

## 4. Aviation: effective radiative forcing incl. contrails — Lee et al. 2021 via NOAA CSL

- Paper: Lee, D. S., Fahey, D. W., Skowron, A., Allen, M. R., Burkhardt, U., Chen, Q., Doherty, S. J., Freeman, S., Forster, P. M., Fuglestvedt, J., Gettelman, A., De León, R. R., Lim, L. L., Lund, M. T., Millar, R. J., Owen, B., Penner, J. E., Pitari, G., Prather, M. J., Sausen, R., and Wilcox, L. J.: The contribution of global aviation to anthropogenic climate forcing for 2000 to 2018, *Atmospheric Environment*, 244, 117834, 2021 (issue Jan 2021; online 2020). DOI **10.1016/j.atmosenv.2020.117834** (Crossref verified: vol 244, article 117834, issued 2021-01; Crossref licence list includes Elsevier open-access user licence). 
- **The publisher site (sciencedirect.com) was NOT fetched: its robots.txt disallows all agents and names ClaudeBot.** The text used here is the abstract as reproduced on a NOAA page.
- Page actually read: NOAA Chemical Sciences Laboratory, "Study finds aviation responsible for 3.5% of climate change", 3 September 2020, "adapted from the story by NOAA Communications". URL: https://csl.noaa.gov/news/2020/287_0903.html. U.S. Government work (public domain); the abstract on it is the authors' text (Elsevier; quote with attribution as a short excerpt). Note: CSL dates the paper "2020" (online date); Crossref gives 2021 vol. 244.
- Co-author David W. Fahey: "Director of the NOAA Chemical Sciences Laboratory" (stated on the CSL page; official NOAA page → bio verified to that extent). Lead author David Lee: "professor of Atmospheric Science at Manchester Metropolitan University" (stated on the NOAA page).
- Kind: **[ASSESS/MODEL]** multi-model assessment of RF/ERF; 5–95 % likelihood ranges.

Verbatim (abstract, as shown on CSL page):
- "Aviation grew strongly over the past decades (1960–2018) in terms of activity, with revenue passenger kilometers increasing from 109 to 8269 billion km yr−1, and in terms of climate change impacts, with CO2 emissions increasing by a factor of 6.8–1034 Tg CO2 yr−1."
- "Contrail cirrus, consisting of linear contrails and the cirrus cloudiness arising from them, yields the largest positive net (warming) ERF term followed by CO2 and NOx emissions. The formation and emission of sulfate aerosol yields a negative (cooling) term. The mean contrail cirrus ERF/RF ratio of 0.42 indicates that contrail cirrus is less effective in surface warming than other terms."
- "For 2018 the net aviation ERF is +100.9 mW (mW) m−2 (5–95% likelihood range of (55, 145)) with major contributions from contrail cirrus (57.4 mW m−2), CO2 (34.3 mW m−2), and NOx (17.5 mW m−2). Non-CO2 terms sum to yield a net positive (warming) ERF that accounts for more than half (66%) of the aviation net ERF in 2018."
- "Using normalization to aviation fuel use, the contribution of global aviation in 2011 was calculated to be 3.5 (4.0, 3.4) % of the net anthropogenic ERF of 2290 (1130, 3330) mW m−2."
- "Uncertainty distributions (5%, 95%) show that non-CO2 forcing terms contribute about 8 times more than CO2 to the uncertainty in the aviation net ERF in 2018."
- "CO2-warming-equivalent emissions based on global warming potentials (GWP* method) indicate that aviation emissions are currently warming the climate at approximately three times the rate of that associated with aviation CO2 emissions alone."
Verbatim (NOAA news text):
- "contrails and contrail cirrus – short-lived clouds created in jet engine exhaust plumes at aircraft cruise altitudes that reflect sunlight during the day and trap heat trying to escape at night."
- "The remainder is due to the cumulative heat-trapping effects of long-lived CO2 emissions – 32.6 billion tonnes between 1940 and 2018, or roughly the total global CO2 emissions for the year 2010."
- "ERF represents the increase or decrease in the balance between the energy coming from the sun and the energy emitted from the Earth since pre-industrial times."
- Odd printed wording: the abstract's "CO2 emissions increasing by a factor of 6.8–1034 Tg CO2 yr−1" is as printed (reads as "by a factor of 6.8, to 1034 Tg"); quote exactly or paraphrase outside quotes.

---

## 10. Ozone layer recovery — WMO/UNEP Scientific Assessment of Ozone Depletion: 2026 (Executive Summary), hosted by NOAA CSL

- Citation (as printed on intro page https://csl.noaa.gov/assessments/ozone/2026/): "World Meteorological Organization (WMO), Executive Summary. Scientific Assessment of Ozone Depletion: 2026, GAW Report No. 327, 55 pp., WMO, Geneva, Switzerland, 2026."
  - **Discrepancy:** the Executive Summary page's own "Recommended Citation" box prints "Scientific Assessment of Ozone Depletion: 2022, GAW Report No. 327, 55 pp., WMO, Geneva, Switzerland, 2022." — evidently a template error (GAW 327 and 55 pp. match the 2026 edition; 2022 edition is GAW Report No. 278, 56 pp.). Record both; use the intro-page citation.
  - Intro page: the core report "will be released at the end of 2026"; Twenty Q&As "expected release early 2027". Final Author Meeting "Geneva, Switzerland on 20–24 July 2026".
- URL read: https://csl.noaa.gov/assessments/ozone/2026/executivesummary/ (HTML).
- Co-chairs (intro page): "Dr. Lucy Carpenter (University of York, UK), Dr. David W. Fahey (NOAA Chemical Sciences Laboratory, USA), Dr. Kenneth W. Jucks (NASA Headquarters, USA), and Dr. Bonfils Safari (University of Rwanda, Rwanda)."
- Licence/terms (verbatim): "This Ozone Assessment may be reproduced or excerpted, without modification, provided the source is duly and conspicuously acknowledged in every instance as:" [citation]. → verbatim excerpts with conspicuous credit only.
- Kind: **[ASSESS]**; return dates are **[PROJ]** ("In a middle-of-the-road greenhouse-gas scenario").

Verbatim (Highlights):
- "The atmospheric abundances of chlorine and bromine contained in controlled ozone-depleting substances (ODSs) continue to decrease because of the actions taken under the Montreal Protocol. As a consequence, clear signs that the stratospheric ozone layer is beginning to recover have emerged."
- "In a middle-of-the-road greenhouse-gas scenario, Antarctic TCO is projected to return to 1980 values during the 2060s. ... Near-global-mean TCO is projected to return to 1980 values around 2040. Altogether, the findings show that the Montreal Protocol is working well and is expected to meet its goals and those of the Vienna Convention provided there is continued compliance."
Verbatim (Sect. 3, ozone):
- "Estimates of the year in which near-global (60°S–60°N) TCO returns to 1980 levels (~2040) are consistent with those in previous Assessments."
- "The Antarctic ozone hole is expected to gradually close because of declining ODSs. Springtime polar cap TCO is expected to return to 1980 values during the 2060s."
- Arctic: "it has become clearer that the concept of the date of return to 1980 levels is not appropriate for this region. In contrast to previous Assessments, a projected Arctic return date is not highlighted in this Executive Summary."
- "Return dates are defined as the return of decadally smoothed TCO time series to a historical benchmark."
- Greenhouse link: "The mid-to-upper stratosphere has cooled globally by about 0.5 °C decade–1 from 1979 to 2024. This cooling is primarily because of continued increases in carbon dioxide (CO2) abundances."
- Emerging tech: "Emerging technologies such as a hydrogen economy, rocket launches/space debris, and supersonic aviation have so far had only minor effects on stratospheric ozone depletion compared to those from ODSs."
Previous assessment for comparison (2022 Exec. Summary, https://csl.noaa.gov/assessments/ozone/2022/executivesummary/; WMO GAW Report No. 278): "TCO is expected to return to 1980 values around 2066 in the Antarctic, around 2045 in the Arctic, and around 2040 for the near-global average (60°N-60°S)." → 2026 replaces "around 2066" with "during the 2060s" and drops the Arctic date.

---

## 5. Cement process CO2 — Andrew 2019 (ESSD)

- Citation: Andrew, R. M.: Global CO2 emissions from cement production, 1928–2018, *Earth Syst. Sci. Data*, 11, 1675–1710, 2019. Published 20 Nov 2019. DOI **10.5194/essd-11-1675-2019** (Crossref verified; single author, ORCID 0000-0001-8590-6431). Data: https://doi.org/10.5281/zenodo.831454.
- URL: https://essd.copernicus.org/articles/11/1675/2019/ (full-text HTML read).
- Author institution: CICERO Center for International Climate Research, Oslo (as given in the article affiliation). Bio: not verified.
- Licence: "This work is distributed under the Creative Commons Attribution 4.0 License."
- Kind: **[INV]** (activity data × emission factors; official data prioritised).

Verbatim (Abstract):
- "Global production of cement has grown very rapidly in recent years, and, after fossil fuels and land-use change, it is the third-largest source of anthropogenic emissions of carbon dioxide."
- "Global process emissions in 2018 were 1.50±0.12 Gt CO2, equivalent to about 4 % of emissions from fossil fuels. Cumulative emissions from 1928 to 2018 were 38.3±2.4 Gt CO2, 71 % of which have occurred since 1990."
- "it has been recognised that some global estimates are significantly inflated."
Verbatim (Sect. 1, mechanism):
- "There are two aspects of cement production that result in emissions of CO2. First is the chemical reaction involved in the production of the main component of cement, clinker, as carbonates (largely CaCO3, found in limestone) are decomposed into oxides (largely lime, CaO) and CO2 by the addition of heat."
- Eq. (1): E = (Mr_CO2 / Mr_CaO) · f^CaO_clink · f^clink_cem · M_cem, "where Mr CO2 is the molecular weight of CO2, Mr CaO the molecular weight of CaO, f clink CaO the fraction of CaO in clinker, f cem clink the fraction of clinker in cement (the "clinker ratio"), and M cem the mass of cement".
- "The second source of emissions is from the combustion of fossil fuels to generate the significant energy required to heat the raw ingredients to well over 1000 °C, and these "energy" emissions, including those from purchased electricity, could add a further 60 % on top of the process emissions (IEA, 2016). Total emissions from the cement industry could therefore contribute as much as 8 % of global CO2 emissions." (second-hand IEA figure — cite as Andrew citing IEA 2016; iea.org itself is off-limits.)
- Older figure in same paragraph: process emissions "contribute about 5 % of total anthropogenic CO2 emissions excluding land-use change (Boden et al., 2017)" — differs from Andrew's own "about 4 % of emissions from fossil fuels" (2018); record both, use the 4 %.
- Related (GCB 2025, item 1): cement carbonation uptake "from an average of 20 MtC yr−1 (0.02 GtC yr−1) in the 1960s to an average of 210 MtC yr−1 (0.21 GtC yr−1) during 2015–2024".

---

## 7. Urban heat island magnitude — U.S. EPA "Learn About Heat Islands"

- Citation: U.S. Environmental Protection Agency, Heat Island Reduction Program, *Learn About Heat Islands* (What Are Heat Islands?). "Last updated on August 18, 2026".
- URL: https://www.epa.gov/heatislands/what-are-heat-islands
- Licence: U.S. Government work (public domain).
- Kind: **[EDU]** agency summary of a literature review (ref. [1] = Hibbard et al. 2017, *Climate Science Special Report: Fourth National Climate Assessment, Vol. I*, USGCRP).
- Verbatim: "A review of research studies and data found that in the United States, the heat island effect results in daytime temperatures in urban areas about 1–7°F higher than temperatures in outlying areas and nighttime temperatures about 2–5°F higher. Humid regions (primarily in the eastern United States) and cities with larger and denser populations experience the greatest temperature differences." [1]
- Verbatim (mechanism): "Structures such as buildings, roads, and other infrastructure absorb and re-emit the sun's heat more than natural landscapes such as forests and water bodies."
- Causes (verbatim list headings + key sentences): "Reduced Natural Landscapes in Urban Areas. Trees, vegetation, and water bodies tend to cool the air by providing shade, transpiring water from plant leaves, and evaporating surface water, respectively." / "Urban Material Properties. ... Often, heat islands build throughout the day and become more pronounced after sunset due to the slow release of heat from urban materials." / "Urban Geometry. ... Cities with many narrow streets and tall buildings become urban canyons, which can block natural wind flow that would bring cooling effects." / "Heat Generated from Human Activities. Vehicles, air-conditioning units, buildings, and industrial facilities all emit heat into the urban environment. These sources of human-generated, or anthropogenic, waste heat can contribute to heat island effects." / "Weather and Geography. Calm and clear weather conditions result in more severe heat islands ... Conversely, strong winds and cloud cover suppress heat island formation."
- "On a warm day, conventional roofing materials may reach as much as 66°F warmer than the surrounding air temperatures. [2]" "Surface heat islands tend to be most intense during the day when the sun is shining." "Atmospheric heat islands vary much less in intensity than surface heat islands."
- Energy feedback: "Increased electricity demand for air conditioning ranges from 1–9% for each 2°F increase in temperature, with the highest increase in countries where most buildings have air conditioning, such as the United States. [3]" (ref. [3] Santamouris 2020, Energy and Buildings 207:109482).
- Air-quality link (local pollution, distinct from greenhouse warming): "Ground-level ozone, in particular, is formed when nitrogen oxides and volatile organic compounds react in the presence of sunlight and hot weather."
- App note: EPA gives °F only; any °C conversion must be labelled as a Voyager conversion. Do not quote EPA's CDC heat-death figure (CDC is off-limits as a source; EPA ref [4] is an MMWR article).

---

## 8. Direct anthropogenic waste heat vs greenhouse forcing (global mean)

- Citation: Kleidon, A., Messori, G., Baidya Roy, S., Didenkulova, I., and Zeng, N.: Editorial: Global warming is due to an enhanced greenhouse effect, and anthropogenic heat emissions currently play a negligible role at the global scale, *Earth Syst. Dynam.*, 14, 241–242, 2023. DOI **10.5194/esd-14-241-2023** (from the article page's "How to cite"; Crossref search returned this DOI). Received 10 Feb 2023 – Published 24 Feb 2023.
- URL: https://esd.copernicus.org/articles/14/241/2023/ (HTML read). Editors of *Earth System Dynamics*; acknowledges "Richard Betts for a constructive review of this editorial". Bios: not verified.
- Licence: Creative Commons Attribution 4.0 License.
- Kind: **[EDU/back-of-envelope]** editorial energy-balance arithmetic citing BP (2022), Jin et al. (2019), Stephens et al. (2012), Forster et al. (2021). It is an *editorial*, not a research article — label it so.
- Verbatim: "human primary energy consumption amounted to 595 EJ in 2021 (BP, 2022), which translates into an average heat release of 18.9 TW. When averaged over land, this yields 18.9 TW / (29 % × 510 × 10^12 m^2) = 0.13 W m−2 (as in Jin et al., 2019), while globally, this yields 0.04 W m−2 when evenly distributed over the Earth's surface. This heat release is minute compared to the downwelling flux of longwave radiation of 346 W m−2 (Stephens et al., 2012) and the observed radiative forcing change at the top of the atmosphere of 2.7 W m−2 that can clearly be attributed to the increase in greenhouse gases (Forster et al., 2021)."
- Verbatim: "it is also well known and established that anthropogenic heat emissions can affect local climate (e.g., Block et al., 2004; Forster et al., 2007), especially in urban and highly populated areas, resulting in the urban heat island effect." "Studies that incorporated this effect in climate models showed little, if any, effect on global climate (Flanner, 2009), consistent with the energy balance estimate described earlier."
- Arithmetic check by Voyager (not for display as a quote): 595 EJ ÷ 3.156×10^7 s ≈ 18.9 TW; 18.9 TW ÷ 5.10×10^14 m² ≈ 0.037 W m−2 (prints as 0.04); ÷ 1.48×10^14 m² ≈ 0.13 W m−2. Consistent.
- Flanner, M. G. (2009), "Integrating anthropogenic heat flux with global climate models", *Geophys. Res. Lett.*, 36, L02801 / article 2008GL036465, DOI 10.1029/2008GL036465 (Crossref verified) — **NOT read**: publisher is AGU/Wiley (off-limits); open copies on deepblue.lib.umich.edu and opensky.ucar.edu are both **blocked for ClaudeBot/anthropic-ai in robots.txt** (Deep Blue also `Content-Signal: ai-train=no, use=reference`). Do not quote Flanner's numbers directly.

---

## 9. U.S. water withdrawals incl. thermoelectric cooling — USGS Circular 1441

- Citation (suggested citation on landing page): "Dieter, C.A., Maupin, M.A., Caldwell, R.R., Harris, M.A., Ivahnenko, T.I., Lovelace, J.K., Barber, N.L., and Linsey, K.S., 2018, Estimated use of water in the United States in 2015: U.S. Geological Survey Circular 1441, 65 p., https://doi.org/10.3133/cir1441. [Supersedes USGS Open-File Report 2017–1131.]" First posted June 19, 2018. DOI **10.3133/cir1441** (resolves on api.crossref.org, HTTP 200).
- URL: https://pubs.usgs.gov/publication/cir1441 (abstract read from landing page).
- Licence: USGS publication, U.S. Government work (public domain).
- Kind: **[INV]** compiled estimates (state water-use data); year 2015 is the latest national compilation in this series.
- Verbatim (Abstract):
  - "Water use in the United States in 2015 was estimated to be about 322 billion gallons per day (Bgal/d), which was 9 percent less than in 2010. The 2015 estimates put total withdrawals at the lowest level since before 1970".
  - "Freshwater withdrawals were 281 Bgal/d, or 87 percent of total withdrawals, and saline-water withdrawals were 41.0 Bgal/d, or 13 percent of total withdrawals."
  - "Thermoelectric power and irrigation remained the two largest uses of water in 2015".
  - "Withdrawals for thermoelectric power were 133 Bgal/d in 2015 and represented the lowest levels since before 1970. Surface-water withdrawals accounted for more than 99 percent of total thermoelectric-power withdrawals, and 72 percent of those surface-water withdrawals were from freshwater sources."
  - "Thermoelectric-power withdrawals accounted for 41 percent of total withdrawals for all uses, and freshwater withdrawals for thermoelectric power accounted for 34 percent of the total freshwater withdrawals for all uses. Total consumptive use for thermoelectric power was 4.31 Bgal/d in 2015 or 3 percent of the total thermoelectric-power withdrawals."  ← key teaching point: withdrawal ≠ consumption (most cooling water is returned, warmer).
  - "Irrigation withdrawals were 118 Bgal/d in 2015 ... Irrigation withdrawals, all freshwater, accounted for 42 percent of total freshwater withdrawals for all uses". "Total consumptive use for irrigation was 73.2 Bgal/d in 2015 or 62 percent of the total use (withdrawals and reclaimed wastewater)."
  - "Public-supply withdrawals in 2015 were 39.0 Bgal/d". "Self-supplied industrial withdrawals were 14.8 Bgal/d in 2015". "Total mining withdrawals in 2015 were 4.00 Bgal/d". "Livestock withdrawals in 2015 were 2.00 Bgal/d".
  - "Thermoelectric power, irrigation, and public-supply withdrawals accounted for 90 percent of total withdrawals in 2015."
- App note: units are U.S. gallons per day; any litre conversion must be labelled as a Voyager conversion.

---

## 11. Life-cycle GHG per kWh by generation technology — NREL (now NLR) LCA Harmonization fact sheet, 2021

- **UNECE 2021 report NOT used:** unece.org served a Cloudflare challenge (HTTP 403) on robots.txt → excluded.
- Citation: National Renewable Energy Laboratory, *Life Cycle Greenhouse Gas Emissions from Electricity Generation: Update*, Fact sheet NREL/FS-6A50-80580, September 2021 (OSTI record date 2021-09-09), 4 p. OSTI ID 1820320. "This fact sheet updates an earlier version (NREL 2013)." (NREL/FS-6A20-57187.)
- URLs: OSTI https://www.osti.gov/servlets/purl/1820320 → redirected to https://docs.nlr.gov/docs/fy21osti/80580.pdf (NREL has been renamed the National Laboratory of the Rockies, nlr.gov). www.nrel.gov/nrel.gov did not respond (connection failure). osti.gov robots.txt has no `*` group and no AI-agent block; www.nlr.gov robots `User-agent: * Allow:`; docs.nlr.gov/robots.txt redirects to an HTML page (no rules). Born-digital PDF; text layer read; Figure 2 checked on rendered page image nrelp_p2.jpg.
- Licence: U.S. DOE national-laboratory work (federally funded; treat as public-domain-like U.S. Government information with attribution; no explicit licence printed). "Funding for this fact sheet was provided by the Joint Institute for Strategic Energy Analysis".
- Kind: **[SYN]** systematic review/meta-analysis of published LCAs (literature medians, not measurements). Data portal (data.nrel.gov/submissions/171 → data.nlr.gov) was "Temporarily Offline" (HTTP 503) on 2026-11-28.

Stated assumptions / method (verbatim):
- "NREL considered approximately 3,000 published life cycle assessment studies on utility-scale electricity generation ... Less than 15% of the original pool of references passed this review process."
- "Life cycle assessments (LCA) can help quantify environmental burdens from "cradle to grave" and facilitate more-consistent comparisons of energy technologies."
- "For fossil-fueled technologies, fuel combustion during operation of the facility emits the vast majority of GHGs. For nuclear and renewable energy technologies, most GHG emissions occur upstream of operation."
- Storage: "we considered only references that enabled the calculation of emissions per unit of electricity delivered over the lifetime of the storage system."
- Median caveat: "the sum of the median estimates of each life cycle phase for a given generation technology might not equal the median of the total life cycle emissions factors (the sum of the medians need not equal the median of the sums)."
- "from cradle to grave, coal-fired electricity releases about 20 times more GHGs per kilowatt-hour than solar, wind, or nuclear electricity (based on median estimates for each technology)."
- Biopower negative values: figure footnote "* Avoided emissions, no removal of GHGs from the atmosphere".

Table 1 (p. 3) "Median Published Life Cycle Emissions Factors for Electricity Generation Technologies, by Life Cycle Phase" — "All values are in grams of carbon dioxide equivalent per kilowatt-hour (g CO2e/kWh)". Columns: one-time upstream / ongoing combustion / ongoing non-combustion / one-time downstream / **Total life cycle** / source:
| Technology | Upstream | Combustion | Non-comb. | Downstream | **Total** | Source cited |
|---|---|---|---|---|---|---|
| Biomass | NR | — | NR | NR | **52** | EPRI 2013; RE Futures 2012 |
| Photovoltaic (thin film & c-Si) | ~28 | — | ~10 | ~5 | **43** | Kim 2012; Hsu 2012; NREL 2012 |
| Concentrating solar (tower & trough) | 20 | — | 10 | 0.53 | **28** | Burkhardt 2012 |
| Geothermal | 15 | — | 6.9 | 0.12 | **37** | Eberle 2017 |
| Hydropower | 6.2 | — | 1.9 | 0.004 | **21** | DOE 2016 |
| Ocean | NR | — | NR | NR | **8** | IPCC 2011 |
| Wind (land & offshore) | 12 | — | 0.74 | 0.34 | **13** | DOE 2015 |
| Pumped-storage hydropower | 3.0 | — | 1.8 | 0.07 | **7.4** | DOE 2016 |
| Lithium-ion battery | 32 | — | NR | 3.4 | **33** | Nicholson 2021 |
| Hydrogen fuel cell | 27 | — | 2.5 | 1.9 | **38** | Khan 2005 |
| Nuclear (LWR only) | 2.0 | — | 12 | 0.7 | **13** | Warner & Heath 2012 |
| Natural gas | 0.8 | 389 | 71 | 0.02 | **486** | O'Donoughue 2013 |
| Oil | NR | NR | NR | NR | **840** | IPCC 2011 |
| Coal | <5 | 1010 | 10 | <5 | **1001** | Whitaker 2012 |
("NR = Not Reported.")
- Ranges: Figure 2 shows min/Q1/median/Q3/max box plots with counts of estimates/references (e.g., coal "164 (+11)" estimates / "53 (+9)" references; wind 186 / 69; PV 46 / 17; nuclear 99 / 27; natural gas "80 (+13)" / "47 (+11)"). **Min/max values are only graphical in the PDF** — not transcribed (would be chart readings). Numerical quartiles are in the NLR data catalog (offline today). Visually: fossil boxes lie roughly 300–1,700 g/kWh, all renewables/nuclear boxes below ~250 g/kWh except biopower and pumped-storage outliers — describe qualitatively only.
- Storage values mean emissions of the storage system itself per kWh delivered, not including the electricity charged into it (implied by the method sentence above; do not overstate).

---

## 12. Carbon capture / direct air capture — what it is, energy, scale

### 12a. U.S. DOE Office of Science, "DOE Explains...Direct Air Capture" (mechanism; public domain)
- URL: https://www.energy.gov/science/doe-explainsdirect-air-capture — "This was last updated March 16, 2026." U.S. Government work. Kind **[EDU]**.
- Verbatim: "Direct air capture technology is a form of carbon dioxide (CO2) removal that takes CO2 from ambient, or still, air. The separated CO2 can then be permanently stored deep underground, or it can be converted into products."
- "Scientists use two broad approaches for direct air capture: liquid solvents and solid sorbents." "Solvent-based direct air capture systems pass air through chemicals that remove the CO2. Existing systems use a combination of heat and vacuum to remove the captured CO2 and return the chemicals to the direct air capture process." "Sorbent-based direct air capture systems use physical filters. These filters chemically bind with CO2 molecules. When the filters are heated and/or placed under a vacuum, they release the CO2, which is now in a concentrated stream."
- Energy (qualitative only): "The downside to direct air capture is its current cost. Removing CO2 from the air takes lots of power because only a tiny percentage of the atmosphere is made up of CO2. The technology also involves costs to store or use the captured CO2."
- Target: "DOE launched the Carbon Negative Shot initiative—a call for innovation in carbon dioxide removal pathways that will capture CO2 from the atmosphere and store it at 1 billion ton scales for less than $100 per net metric ton of CO2-equivalent."

### 12b. U.S. DOE, *Strategy for the Carbon Negative Shot™*, January 2025 (PDF, text layer read)
- URL: https://www.energy.gov/sites/default/files/2025-01/Strategy%20for%20the%20Carbon%20Negative%20Shot.pdf. U.S. Government work. Kind **[policy target/PROJ]** — present as a stated goal, not an achievement.
- Verbatim (DOE goals, p. 5): "1. Enable less than $100/net metric ton CO2e for both capture and storage. 2. Ensure robust accounting of full lifecycle emissions (i.e., ensures emissions created when running and building the removal technology are accounted for). 3. Secure geologic storage or equivalent storage with costs demonstrated for monitoring, reporting and verification. 4. Enable necessary gigaton-scale removal."
- Verbatim (p. 4): "For example, technologies like DAC currently require substantial infrastructure investments and energy inputs but are highly measurable and verifiable. In contrast, approaches such as improved forest management leverage the photosynthetic productivity of natural and working ecosystems but can be challenging to measure at high spatial and temporal resolution and provide less durable storage."
- Interim: "an interim target of 25 million metric tons of CDR demand by 2030".

### 12c. Actual scale today — GCB 2025 (item 1; CC BY 4.0), Sect. 3.3
- Verbatim: "the atmosphere-to-geosphere flux of carbon resulting from carbon dioxide removal (CDR) activities in 2024 is estimated at 0.011 MtC yr−1. This results primarily from 0.0048 MtC yr−1 of biomass direct storage (compressing waste biomass to store underground), 0.003 and 0.002 MtC yr−1 of mineralisation and enhanced weathering projects respectively, and 0.0004 MtC yr−1 of DACCS (Pongratz et al., 2024). ... although it remains roughly a million times smaller than current fossil CO2 emissions."
- "the lower DACCS estimate ... reflect[s] updated CDR tracking methodologies which include drawing on more accurate annual data from registries, indicating that operational projects are currently removing less CO2 than their expected capacities."
- Re/afforestation CDR (land, in E_LUC): "Net carbon dioxide removals (CDR) from re-/afforestation were highest in China, the USA, and the EU27, with combined removals of 0.3 GtC yr−1 during 2015–2024."

### 12d. DAC energy per tonne — NOT FOUND in an allowed source
- Herzog, Morris, Gurgel, Paltsev (MIT) "Getting real about capturing carbon from the air" — fetched from cs3.mit.edu (robots allows) but the PDF is a **draft stamped "DO NOT CITE, COPY OR DISTRIBUTE"** → REJECTED; its numbers are not to be used.
- LLNL *Roads to Removal* (LLNL-TR-852901, Dec 2023, OSTI 2301853) downloaded (102 MB) but the PDF could not be opened by PDFKit → not read. Candidate for a follow-up with a different reader.
- Statista/IEA, nationalacademies.org (nap), arXiv, RSC results from search not used (off-limits or not authoritative/open).

---

## 13. Climate intervention (solar radiation modification) — uncertainties

### 13a. OSTP 2023 congressionally mandated research plan (archived White House site)
- Citation (verbatim "Suggested Citation", p. 4): "OSTP. (2023). Congressionally Mandated Research Plan and an Initial Research Governance Framework Related to Solar Radiation Modification. Office of Science and Technology Policy, Washington, DC, USA." Cover date: June 2023.
- URL: https://bidenwhitehouse.archives.gov/wp-content/uploads/2023/06/Congressionally-Mandated-Report-on-Solar-Radiation-Modification.pdf (robots: `Disallow:` empty → allowed). Born-digital PDF, text layer read.
- Licence: U.S. Government work (public domain). Archived site of a previous administration — label "archived".
- Kind: **[ASSESS]** research plan (no new results). Verbatim disclaimer: "Importantly, the issuance of this report does not signal any Executive Branch policy decision(s) regarding SRM. The report is only a response to Congressional directive."
- Mechanism contrast (Introduction, p. 10): "greenhouse gases warm the climate by blocking a portion of outgoing longwave radiation that would otherwise be emitted into space. By contrast, SRM cools the climate by reflecting a greater amount of incoming solar (shortwave) radiation back into space. Because these are different physical mechanisms, an environment with SRM would be different from any without it."
- "Science tells us that SRM would not simply undo all of the negative consequences of human greenhouse gas emissions. SRM would not ameliorate most of the impacts of ocean acidification, which is primarily driven by rising atmospheric carbon dioxide levels, nor eliminate the tendency for fossil fuel burning to worsen air quality."
- "deployment of SRM would inevitably involve its own risks, almost all of which are poorly understood and some of which are unknown."
- "SRM might halt but would not result in the rapid reversal of some important manifestations of climate warming, such as loss of land ice and greenhouse gas emissions from thawing permafrost."
- "Stratospheric aerosol injection (SAI), for example, can alter stratospheric heating, circulation, and chemistry (including accelerating ozone depletion)".
- Research objective list includes: "assess the risks associated with sudden termination of SRM."
- Exec. Summary: "By their fundamental nature, the current suite of potential SRM methods would not simply negate (explicitly offset) all current or future impacts of climate change induced by increased atmospheric greenhouse gas concentrations." "This "risk vs. risk" framing".
- Scope: "This Research Plan does not consider space-based approaches to SRM".

### 13b. Quantified ozone side-effect of SAI — WMO Ozone Assessment 2026 Exec. Summary (item 10 source; NOAA CSL)
- Kind: **[MODEL]** multi-model projections.
- "Choosing a middle-of-the-road greenhouse-gas scenario and assuming an injected sulfate aerosol mass sufficient to stabilize global warming, global ozone depletion becomes 3–5 DU at mid-century, which delays the recovery of global TCO by around 15-20 years."
- "Models simulate decreases in Antarctic October TCO due to SAI ranging from 17 to 37 DU, corresponding to a delay in recovery of about 10–15 years."
- Scenario assumptions (verbatim): "The simulations use a middle-of-the-road climate scenario (SSP2-4.5) and the WMO (2014) ODS scenario. Sulfate-based SAI is carried out from 2035 onwards with progressively increasing SO2 injection rates in the subtropics of both hemispheres".
- "Climate model simulations show that the magnitude, and in some regions the sign, of the stratospheric ozone response to SAI depends strongly on the strategy, including the latitude of injection and the injected material."
- "Overall confidence in the effects of non-sulfate SAI materials on stratospheric ozone remains low due to limited data on their physicochemical properties under stratospheric conditions."
- Mechanism: "SAI, proposes to intentionally enhance stratospheric aerosol loading to reflect more incoming solar radiation back to space, similar to the natural effects from large volcanic eruptions."

---

## 14. Mining / resource extraction — environmental mechanism (brief)

- Source: U.S. Geological Survey, Water Resources Mission Area, *Mine Drainage* (science page). URL: https://www.usgs.gov/mission-areas/water-resources/science/mine-drainage (no date shown in extracted text). U.S. Government work (public domain). Kind **[EDU]**.
- Verbatim: "Mine drainage refers to any surface water or groundwater that drains from an active or abandoned mining operation. Mine drainage can be high-quality similar to natural waters or contaminated by leftover materials. Polluted mine drainage can be extremely acidic and is often laden with high concentrations of toxic, heavy metals. In general, the more acidic the water, the more likely it is to be harmful to living organisms."
- Verbatim (mechanism): "Mine drainage forms from a chemical reaction between water and rocks containing sulfur-bearing minerals. The resulting waters become rich in sulfuric acid and dissolved iron. As the iron settles out of the water, it can form red, orange, or yellow sediments in the bottom of streams. The acidic runoff further dissolves heavy metals such as copper, lead, mercury into groundwater or surface water. The rate and degree by which acid-mine drainage proceeds can be increased by the action of certain bacteria."
- Legacy: "thousands of new mines were created over the centuries and then abandoned. Now, these long forgotten remnants of a bygone area still haunt us, as their operations left behind materials and rock exposures that can be easily eroded and carried downstream." (sic "bygone area")
- Example event (page teaser): "On August 5, 2015, U.S. EPA was conducting an investigation of the Gold King Mine near Silverton, Colorado. While excavating as part of the investigation, water began leaking from the mine tunnel, and about three million gallons of water and sediment were released into Cement Creek, a tributary of the Animas River."
- Water use by mining: USGS Circular 1441 (item 9): "Total mining withdrawals in 2015 were 4.00 Bgal/d".
- Context reference (not quoted for mechanism): U.S. Geological Survey, 2026, *Mineral commodity summaries 2026* (ver. 1.3, May 2026), 222 p., https://doi.org/10.3133/mcs2026 (landing page https://pubs.usgs.gov/publication/mcs2026 checked; content not extracted — supply statistics, not environmental mechanism).

---

## Mapping to the five mechanism categories (for the page author)
- **Greenhouse warming:** items 1, 2, 3, 4 (CO2 + non-CO2 ERF), 5, 6, 11, 12.
- **Local air pollution:** item 7 (ozone smog formation with heat), item 13a (SRM would not remove fossil-fuel air-quality effects); item 4 NOx/soot/sulfate are forcing terms, not health data.
- **Direct waste heat:** item 8 (0.04 W m−2 global vs 2.7 W m−2 GHG forcing), item 7 (local UHI contribution).
- **Ecosystem disruption:** item 6 (deforestation), item 3b (wetland/freshwater perturbation), item 14 (acid mine drainage), item 7 (heated stormwater), item 10 (ozone/UV).
- **Resource consumption:** item 9 (water), item 14 (mining), item 11 (life-cycle stages: extraction → manufacturing → operation → decommissioning).

---

## NOT FOUND / gaps

1. **UNECE 2021 "Life Cycle Assessment of Electricity Generation Options"** — unece.org Cloudflare challenge (403) → excluded. NREL/NLR fact sheet used instead; it gives **medians only as numbers**; min/max ranges are graphical. NLR data catalog (data.nlr.gov/submissions/171, quartiles) returned HTTP 503 "Temporarily Offline" — retry later for numeric ranges.
2. **DAC energy per tonne CO2** — no allowed, citable, open source found with a verbatim number. MIT draft rejected ("DO NOT CITE, COPY OR DISTRIBUTE"). LLNL *Roads to Removal* (OSTI 2301853, 102 MB) could not be parsed by PDFKit — try page-image rendering in a follow-up. DOE pages give only qualitative "takes lots of power".
3. **Flanner 2009 GRL** — not read (AGU/Wiley off-limits; Deep Blue and OpenSky repositories block ClaudeBot). Global waste-heat number taken from the ESD 2023 editorial (a back-of-envelope editorial, not a research article).
4. **Lee et al. 2021 full text** — sciencedirect.com blocks all bots incl. ClaudeBot; FAA site 403. Only the abstract (as reproduced by NOAA CSL) was used; no table values (e.g., per-term 5–95 % ranges beyond net ERF) available.
5. **EDGAR sector percentages** — only "nearly 30%" (power) is printed; other shares in the item-2 table are **derived** by Voyager from the xlsx. Fossil-CO2 component of the data is IEA-licensed CC BY-NC-ND 4.0.
6. **Ozone 2026 assessment** — Executive Summary only; full report "will be released at the end of 2026". Citation box on the ES page mislabels the year as 2022 (template error) — see item 10.
7. **US water use after 2015** — Circular 1441 (2015 data) is the latest national compilation read; newer USGS model-based water-use products were not checked.
8. **GCB 2026** exists only as an ESSD Discussions preprint (essd-2026-895, 10 Nov 2026) — not used; update the page when final.
9. **FAO open data / EPA agriculture pages** — not needed (Global Methane Budget + EDGAR cover agriculture/livestock); not fetched.
10. Author bios: only D. W. Fahey (NOAA CSL director, per NOAA page) and D. S. Lee (MMU professor, per NOAA page) are stated on official pages; all others "bio: not verified".
