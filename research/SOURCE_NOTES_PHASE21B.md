# Source notes: Phase 21B. Storm laboratory (storm types, conditions, structure, life cycle, scales, historical cases)

Research date: 2026-11-28. Raw files are in `/tmp/vv-research/p21/b/` (robots files in `/tmp/vv-research/p21/b/robots/`). User-Agent: "VoyagerVentures-Research/0.1 (educational; respects robots.txt)". At least 1.2 s between requests per host. Rules followed: `/tmp/vv-research/p20/RULES.md`.

All U.S. federal sources below (NHC, NWS, NSSL, WPC, NCEI, NASA) are works of the U.S. Government and are public domain unless a figure is credited otherwise. The Penn State METEO 3 pages are CC BY-NC-SA 4.0 (stated on each page). Born-digital PDFs were read from the text layer with `pdftxt.swift`; this is noted for each one. HTML was converted to text with a local script; all quotes are verbatim from that text, with whitespace normalised.

## robots.txt / access log

| Host | robots.txt result | Used? |
|---|---|---|
| www.nhc.noaa.gov | 200: `User-agent: * / Disallow:` (empty, so everything is allowed) | Yes |
| www.nssl.noaa.gov | 200: `User-agent: * / Disallow:` (empty) | Yes |
| www.weather.gov | 404 (no robots file, so no restriction) | Yes (`/oun/`, `/spotterguide/`, `/psr/`, `/media/...` PDFs). **`/source/zhu/ZHU_Training_Page/` returned HTTP 500 today.** JetStream was not used (blocked, as instructed). |
| forecast.weather.gov | 404 (no robots file) | Yes (glossary.php) |
| www.wpc.ncep.noaa.gov | 404 (no robots file) | Yes |
| www.ncei.noaa.gov | 200: `Disallow: /data*`, `Disallow: /orders*` | Product page only. **The IBTrACS CSVs live under `/data/international-best-track-archive-for-climate-stewardship-ibtracs/...`, which robots disallows, so I downloaded no IBTrACS file.** |
| earthobservatory.nasa.gov | 301 to science.nasa.gov/earth/earth-observatory/ | Yes (via science.nasa.gov) |
| science.nasa.gov | 200: `User-agent: * / Allow: /` | Yes |
| oceanservice.noaa.gov | 200: disallows `/cgi-bin/` and `/aaweekly/` only | Fetched one page; it had no threshold numbers, so I did not use it |
| courses.ems.psu.edu | 200: disallows admin, search, user and core paths only; `/meteo3/node/...` is allowed | Yes |
| repository.library.noaa.gov | 200: `Crawl-delay: 10`, disallows system dirs | robots fetched only, not used |
| www.aoml.noaa.gov | **CloudFront 403 "Request blocked" on robots.txt** | **No. Host abandoned. The AOML/HRD Tropical Cyclone FAQ (A15/A16, the usual source for 26.5 °C and "500 km from the equator") could not be used.** |
| scijinks.gov | connection failed (curl 000) | No |
| api.crossref.org, api.datacite.org | DOI verification only | Yes |

---

## 1. TROPICAL CYCLONES / HURRICANES

### S1. NHC Glossary
- **Citation:** NOAA National Hurricane Center, "NHC Glossary". https://www.nhc.noaa.gov/aboutgloss.shtml (accessed 2026-11-28). Raw: `nhc_gloss.html/.txt`. Public domain. Kind: definitions.
- **Tropical Cyclone (definition, verbatim):** "A warm-core non-frontal synoptic-scale cyclone, originating over tropical or subtropical waters, with organized deep convection and a closed surface wind circulation about a well-defined center. Once formed, a tropical cyclone is maintained by the extraction of heat energy from the ocean at high temperature and heat export at the low temperatures of the upper troposphere. In this they differ from extratropical cyclones, which derive their energy from horizontal temperature contrasts in the atmosphere (baroclinic effects)."
- **Life-cycle stage definitions (verbatim):**
  - "Tropical Disturbance: A discrete tropical weather system of apparently organized convection -- generally 100 to 300 nmi in diameter -- originating in the tropics or subtropics, having a nonfrontal migratory character, and maintaining its identity for 24 hours or more. It may or may not be associated with a detectable perturbation of the wind field."
  - "Tropical Wave: A trough or cyclonic curvature maximum in the trade-wind easterlies. The wave may reach maximum amplitude in the lower middle troposphere."
  - "Tropical Depression: A tropical cyclone in which the maximum sustained surface wind speed (using the U.S. 1-minute average) is 33 kt (38 mph or 62 km/hr) or less."
  - "Tropical Storm: A tropical cyclone in which the maximum sustained surface wind speed (using the U.S. 1-minute average) ranges from 34 kt (39 mph or 63 km/hr) to 63 kt (73 mph or 118 km/hr)."
  - "Hurricane / Typhoon: A tropical cyclone in which the maximum sustained surface wind (using the U.S. 1-minute average) is 64 kt (74 mph or 119 km/hr) or more. The term hurricane is used for Northern Hemisphere tropical cyclones east of the International Dateline to the Greenwich Meridian. The term typhoon is used for Pacific tropical cyclones north of the Equator west of the International Dateline."
  - "Major Hurricane: A hurricane that is classified as Category 3 or higher."
  - "Rapid Intensification: An increase in the maximum sustained winds of a tropical cyclone of at least 30 kt in a 24-h period."
- **Dissipation / transition (verbatim):**
  - "Extratropical: A term used in advisories and tropical summaries to indicate that a cyclone has lost its "tropical" characteristics. The term implies both poleward displacement of the cyclone and the conversion of the cyclone's primary energy source from the release of latent heat of condensation to baroclinic (the temperature contrast between warm and cold air masses) processes. It is important to note that cyclones can become extratropical and still retain winds of hurricane or tropical storm force."
  - "Post-tropical Cyclone: A former tropical cyclone. This generic term describes a cyclone that no longer possesses sufficient tropical characteristics to be considered a tropical cyclone. Post-tropical cyclones can continue carrying heavy rains and high winds. Note that former tropical cyclones that have become fully extratropical ...as well as remnant lows ...are two classes of post-tropical cyclones."
- **Structure (verbatim):**
  - "Eye: The roughly circular area of comparatively light winds that encompasses the center of a severe tropical cyclone. The eye is either completely or partially surrounded by the eyewall cloud."
  - "Eyewall / Wall Cloud: An organized band or ring of cumulonimbus clouds that surround the eye, or light-wind center of a tropical cyclone. Eyewall and wall cloud are used synonymously."
  - "Storm Surge: An abnormal rise in sea level accompanying a hurricane or other intense storm, and whose height is the difference between the observed level of the sea surface and the level that would have occurred in the absence of the cyclone. Storm surge is usually estimated by subtracting the normal or astronomic high tide from the observed storm tide."
  - "Maximum Sustained Surface Wind: The standard measure of a tropical cyclone's intensity. When the term is applied to a particular weather system, it refers to the highest one-minute average wind (at an elevation of 10 meters with an unobstructed exposure) associated with that weather system at a particular point in time."
- **Season (verbatim):** "The hurricane season in the Atlantic, Caribbean, and Gulf of America runs from June 1 to November 30. The hurricane season in the Eastern Pacific basin runs from May 15 to November 30. The hurricane season in the Central Pacific basin runs from June 1 to November 30."
- **Also useful:** "Extratropical Cyclone: A cyclone of any intensity for which the primary energy source is baroclinic, that is, results from the temperature contrast between warm and cold air masses." and "Monsoon: A large-scale, seasonally-reversing surface wind circulation in the tropics accompanied by large amplitude seasonal changes in precipitation."

### S2. Saffir-Simpson Hurricane Wind Scale (NHC)
- **Citation:** NOAA NHC, "Saffir-Simpson Hurricane Wind Scale". https://www.nhc.noaa.gov/aboutsshws.php (accessed 2026-11-28). Raw: `nhc_sshws.html/.txt`. Kind: operational classification scale.
- **Verbatim:** "The Saffir-Simpson Hurricane Wind Scale is a 1 to 5 rating based only on a hurricane's maximum sustained wind speed. This scale does not take into account other potentially deadly hazards such as storm surge, rainfall flooding, and tornadoes."
- "*In the western North Pacific, the term "super typhoon" is used for tropical cyclones with sustained winds exceeding 150 mph."
- **Category table (verbatim ranges):**

| Cat | mph | kt | km/h | First damage phrase |
|---|---|---|---|---|
| 1 | 74-95 | 64-82 | 119-153 | "Very dangerous winds will produce some damage" |
| 2 | 96-110 | 83-95 | 154-177 | "Extremely dangerous winds will cause extensive damage" |
| 3 (major) | 111-129 | 96-112 | 178-208 | "Devastating damage will occur" |
| 4 (major) | 130-156 | 113-136 | 209-251 | "Catastrophic damage will occur" |
| 5 (major) | 157 mph or higher | 137 kt or higher | 252 km/h or higher | "Catastrophic damage will occur" |

- **Discrepancy to note:** the NASA Earth Observatory feature (S5, 2006) uses the older pre-2012 ranges (for example "Category 3: Winds 178-209 km/hr (111-130 mph)", "Category 4: Winds 210-249 km/hr (131-155 mph)", "Category 5: Winds greater than 249 km/hr (155 mph)", with storm-surge heights). The app should use the NHC ranges. The NHC page links a "2012 Revision to the Saffir Simpson Hurricane Wind Scale (PDF)", which I did not fetch.

### S3. NHC Tropical Cyclone Climatology
- **Citation:** NOAA NHC, "Tropical Cyclone Climatology". https://www.nhc.noaa.gov/climo/ (accessed 2026-11-28). Raw: `nhc_climo.txt`. Kind: climatology (observations, 1991–2020 normals).
- **Definition (verbatim):** "A tropical cyclone is a rotating, organized system of clouds and thunderstorms that originates over tropical or subtropical waters and has a closed low-level circulation. Tropical cyclones rotate counterclockwise in the Northern Hemisphere."
- "Major Hurricane: A tropical cyclone with maximum sustained winds of 111 mph (96 knots) or higher, corresponding to a Category 3, 4 or 5 on the Saffir-Simpson Hurricane Wind Scale."
- "In the western North Pacific, hurricanes are called typhoons; similar storms in the Indian Ocean and South Pacific Ocean are called cyclones."
- **Motion:** "Tropical cyclones forming between 5 and 30 degrees North latitude typically move toward the west. Sometimes the winds in the middle and upper levels of the atmosphere change and steer the cyclone toward the north and northwest. When tropical cyclones reach latitudes near 30 degrees North, they often move northeast."
- **Normals:** "Based on a 30-year climate period from 1991 to 2020, an average Atlantic hurricane season has 14 named storms, 7 hurricanes, and 3 major hurricanes (Category 3, 4, or 5 on the Saffir-Simpson Hurricane Wind Scale)." Eastern Pacific: "an average eastern Pacific hurricane season has 15 named storms, 8 hurricanes, and 4 major hurricanes."
- **Peak:** "The peak of the Atlantic hurricane season is September 10, with most activity occurring between mid-August and mid-October."
- Table 1 (average Atlantic season, 1991–2020): 1st named storm Jun 20, 1st hurricane Aug 11, 1st major hurricane Sep 1; 14th named storm Nov 19.

### S4. Formation thresholds: SST ≈ 26.5 °C / 80 °F and the ~5° Coriolis rule
**NHC/NOAA verbatim was NOT obtained.** The NHC glossary and climatology pages give neither number. The usual NOAA source (AOML HRD TC-FAQ A15/A16) is blocked by CloudFront 403 and was not fetched; JetStream is blocked. Two usable accredited sources follow. **They disagree on the latitude limit (5° vs 8°).**

**S4a. Penn State METEO 3 (CC BY-NC-SA 4.0)**
- **Citation:** Seman, S. (prepared by); original materials by L. Grenci. "Tropical Cyclone Ingredients: Part I", METEO 3: Introductory Meteorology, John A. Dutton e-Education Institute, College of Earth and Mineral Sciences, The Pennsylvania State University. https://courses.ems.psu.edu/meteo3/node/2056 (accessed 2026-11-28). Raw: `psu_tc1.html`. Kind: educational simplification. Bio: not verified.
- **Ingredient list (verbatim):**
  - "Sea-surface temperatures of at least 26.5 degrees Celsius or 80 degrees Fahrenheit (usually). A deep warm layer of water beneath the ocean surface (of at least 50 meters or so) can be helpful, but is not necessarily required."
  - "A location (usually) at least five degrees of latitude (roughly 300 nautical miles) away from the equator."
  - "Low values of vertical wind shear between roughly 5,000 and 38,000 feet (generally less than 10 meters per second, or 20 knots)."
- **Coriolis (verbatim):** "Recall that the magnitude of the Coriolis Force is zero at the equator and increases with increasing latitude. That means the Coriolis Force is relatively weak throughout the tropics, and less than five degrees from the equator, it's generally too weak to impart a circulation on a developing area of low pressure."
- **Exception (verbatim):** "on December 26, 2001, a tropical cyclone named Vamei ... formed at approximately 1.5 degrees North latitude near Singapore"
- **Global count:** "on average, 80 to 90 tropical cyclones form each year"
- **Cool wake / dissipation:** "a strong tropical cyclone can contribute to its own demise if it stalls or moves very slowly over shallow warm water. The upwelling of cooler water beneath the ocean surface reduces sea-surface temperatures beneath the storm, which reduces evaporation rates, stabilizes the atmosphere somewhat, and weakens th[e storm]" (the extracted text was cut off at "th").

**S4b. NASA Earth Observatory (public domain)**
- **Citation:** Graham, S. and Riebeek, H., "Hurricanes: The Greatest Storms on Earth", NASA Earth Observatory, Nov 01, 2006. Now at https://science.nasa.gov/earth/natural-disasters/hurricanes-typhoons/hurricanes-the-greatest-storms-on-earth/ (redirected from earthobservatory.nasa.gov/features/Hurricanes). Raw: `eo_hurr.html/.txt`. Kind: educational simplification. Byline: "NASA Earth Observatory story by Steve Graham and Holli Riebeek". Bio: not verified.
- **Conditions (verbatim):** "Hurricanes form over tropical waters (between 8 and 20 degrees latitude) in areas of high humidity, light winds, and warm sea surface temperatures [typically 26.5 degrees Celsius (80 Fahrenheit) or greater]. These conditions usually prevail in the summer and early fall months of the tropical North Atlantic and North Pacific Oceans, and for this reason, hurricane "season" in the northern hemisphere runs from June through November."
- **Coriolis (verbatim):** "If the storm is far enough from the equator (generally at least 8 degrees of latitude), the deflection or curvature is great enough that the air starts spinning counterclockwise around the center of the storm." **This conflicts with the "~5°" in S4a and in the brief. Record both.** NHC climatology (S3) only says storms form "between 5 and 30 degrees North latitude" in the context of motion.
- **Structure (verbatim):** "At the center of the hurricane is the eye, a cloud-free area of sinking air and light winds that is usually from 10 to 65 kilometers in diameter." Also: "Bordering the eye of a mature hurricane is the eye wall, a ring of tall thunderstorms that produce heavy rains and very strong winds." Also: "Surrounding the eye wall are curved bands of clouds that trail away in a spiral fashion, suitably called spiraling rain bands. The rain bands are capable of producing heavy bursts of rain and wind, perhaps one-half or two-thirds the strength of those associated with the eye wall."
- **Weakening/dissipation (verbatim):** "At the surface, hurricanes can diminish rather quickly given the right conditions. These conditions include the storm moving over cooler water that can't supply warm, moist tropical air; the storm moving over land, again cutting off the source of warm, moist air; and finally, the storm moving into an area where strong winds high in the atmosphere disperse latent heat, reducing the warm temperatures aloft and raising the surface pressure."
- **Storm surge (verbatim):** "its most destructive weapon is the accompanying storm surge, a rise in the ocean levels of up to 10 meters (about 33 feet)."

### S5-hist-1. Hurricane Katrina (2005): NHC Tropical Cyclone Report
- **Citation:** Knabb, R. D., Rhome, J. R., and Brown, D. P., "Tropical Cyclone Report: Hurricane Katrina, 23-30 August 2005", National Hurricane Center. Original 20 Dec 2005; updated 10 August 2006, 14 September 2011 and **4 January 2023** (the version fetched). https://www.nhc.noaa.gov/data/tcr/AL122005_Katrina.pdf (accessed 2026-11-28). Raw: `katrina.pdf`, `katrina.txt` (**text layer**). Kind: observations and post-storm best-track analysis. No DOI. Bios: not verified.
- **Summary (p. 1, verbatim):** "Katrina was an extraordinarily powerful and deadly hurricane that carved a wide swath of catastrophic damage and inflicted large loss of life. It was the costliest and one of the five deadliest hurricanes to ever strike the United States."
- **Genesis (p. 2):** "the system to develop into a tropical depression by 1800 UTC 23 August over the southeastern Bahamas about 175 n mi southeast of Nassau"; "the cyclone became Katrina, the 11th tropical storm of the 2005 Atlantic hurricane season, at 1200 UTC 24 August".
- **Rapid intensification (p. 3):** "Katrina embarked upon two periods of rapid intensification (defined as a 30 kt or greater increase in the maximum sustained winds during a 24 h period)"; second: "Katrina strengthened from a low-end Category 3 hurricane to a Category 5 in less than 12 h, reaching an intensity of 145 kt by 1200 UTC 28 August."
- **Peak (p. 3):** "Katrina attained its peak intensity of 150 kt at 1800 UTC 28 August about 170 n mi southeast of the mouth of the Mississippi River." Size: "tropical storm-force winds extended out to about 200 n mi from the center, and hurricane-force winds extended out to about 90 n mi from the center".
- **Minimum pressure (p. 6):** "The central pressure in Katrina fell to 902 mb near 1800 UTC 28 August."
- **Landfalls (p. 3):** "made landfall, at the upper end of Category 3 intensity with estimated maximum sustained winds of 110 kt, near Buras, Louisiana at 1110 UTC 29 August. Katrina continued northward and made its final landfall near the mouth of the Pearl River at the Louisiana/Mississippi border, still as a Category 3 hurricane with an estimated intensity of 105 kt." Pressure at Buras: "920 mb" (p. 7). Final landfall: "the pressure had reached 928 mb" (p. 8).
- **Weakening factors (p. 3–4):** "appears to have been primarily due to internal structural changes, specifically the deterioration of the inner eyewall without the complete formation of a new outer eyewall." Also: "entrainment of dry air ... Gradually increasing wind shear, slightly lower ocean temperatures, and (following the first Gulf landfall) interaction with land each could also have played a role."
- **Dissipation (p. 4):** "Katrina weakened rapidly after moving inland over southern and central Mississippi, becoming a Category 1 hurricane by 1800 UTC 29 August. It weakened to a tropical storm about six hours later just northwest of Meridian, Mississippi. ... became a tropical depression at 1200 UTC 30 August. The depression continued northeastward and transformed into an extratropical low pressure system by 0000 UTC 31 August. The low was absorbed within a frontal zone later that day over the eastern Great Lakes." This is a full life cycle, usable as an example.
- **Storm surge (p. 9):** "the storm surge was about 24 to 28 ft along the Mississippi coast across a swath about 20 miles wide"; "The maximum high water mark observation of storm surge was 27.8 ft at Pass Christian".
- **Deaths (p. 11, 2023 update):** "Total number of fatalities: 1392 / Direct deaths: 520 / Indirect deaths: 565 / Indeterminate cause: 307". The text also says "nearly 1400". **Discrepancy:** the original 2005/2006 versions said "over 1800 deaths" (stated in the report itself). Use 1392 and cite the 2023 update (Rappaport 2014; Rappaport and Blanchard 2016).
- **Damage (p. 13):** "$125 billion in damage in the United States in 2005 dollars, with the 90% confidence interval ranging from $97.4 billion to $145.5 billion"; "(2022 dollars) Katrina remains the costliest U.S. hurricane, with an estimated $186.3 billion".

### S5-hist-2. Hurricane Andrew (1992): NHC Preliminary Report plus 2005 addendum
- **Citation:** Rappaport, E., "Preliminary Report: Hurricane Andrew, 16 - 28 August, 1992", National Hurricane Center, updated 10 December 1993. https://www.nhc.noaa.gov/1992andrew.html. Addendum (7 February 2005, Category 5 upgrade): https://www.nhc.noaa.gov/1992andrew_add.html ("Last updated January 5, 2006"). Raw: `andrew.txt`, `andrew_add.txt`. Kind: observations and best track (reanalysed). Bio: not verified.
- **Verbatim:** "Andrew was a small and ferocious Cape Verde hurricane that wrought unprecedented economic devastation along a path through the northwestern Bahamas, the southern Florida peninsula, and south-central Louisiana."
- **Landfall pressure:** "central pressure was 922 mb at landfall near Homestead AFB, Florida at 0905 UTC" on 24 August.
- **Winds:** The original report says "estimated at 125 kt (about 145 mph), with gusts at that elevation to at least 150 kt (about 175 mph)" (Category 4). **Superseded by the addendum:** "In their 2004 paper, Landsea et al. (Bull. Amer. Meteor. Soc., 85 (11), 1699-1712 document a reanalysis ... Hurricane Andrew is now indicated to have made landfall on the lower Florida east coast with Category 5 intensity". Revised best track: landfall at Fender Point, FL, 24/0905 UTC, 922 mb, **145 kt (originally 125)**; minimum pressure 23/1800 UTC 922 mb, 150 kt (originally 135); Louisiana landfall 26/0830 UTC, 956 mb, 100 kt (originally 105). The Landsea et al. 2004 DOI was not verified.
- **Deaths/damage (§c):** "The number of deaths directly attributed to Andrew is 26. The additional indirect loss of life brought the death toll to 65". "Damage is estimated at $25 billion." **Internal inconsistency:** the introduction says "In Dade County alone, the forces of Andrew resulted in 15 deaths ... An additional 25 lives were lost in Dade County from the indirect effects". These are Dade-only figures; 26/65 are totals. A footnote mentions "at least 43 additional (indirect) deaths in Dade County".
- **Dissipation:** "Andrew weakened rapidly after landfall, to tropical storm strength in about 10 hours and to depression status 12 hours later. ... By midday on the 28th, Andrew had begun to merge with a frontal system over the mid-Atlantic states."

### S6. IBTrACS (NOAA NCEI): metadata only, no download
- **Product page:** https://www.ncei.noaa.gov/products/international-best-track-archive (accessed 2026-11-28). Raw: `ibtracs.html`. Current version **v04r01**. NCEI DSI 9637. "IBTrACS v04r01 is updated three times a week (usually on Sunday, Tuesday, and Thursday)". (The same page also says "V04r01 ... is updated weekly", which is inconsistent.) Subsets: "since1980 : The modern era of satellite observations"; "last3years : 3 most recent years of data"; "active : storms active in the last 7 days". Formats: netCDF, CSV, shapefile.
- **Description (verbatim):** "The International Best Track Archive for Climate Stewardship (IBTrACS) project is the most complete global collection of tropical cyclones available. It merges recent and historical tropical cyclone data from multiple agencies to create a unified, publicly available, best-track dataset".
- **Required citations (verbatim from page):**
  - "Knapp, K. R., M. C. Kruk, D. H. Levinson, H. J. Diamond, and C. J. Neumann, 2010: The International Best Track Archive for Climate Stewardship (IBTrACS): Unifying tropical cyclone best track data. Bulletin of the American Meteorological Society, 91, 363-376. doi:10.1175/2009BAMS2755.1". **Crossref confirms:** title, BAMS vol. 91, pp. 363-376, issued 2010-03.
  - "Gahtan, J., K. R. Knapp, C. J. Schreck, H. J. Diamond, J. P. Kossin, M. C. Kruk, 2024: International Best Track Archive for Climate Stewardship (IBTrACS) Project, Version 4r01. [indicate subset used]. NOAA National Centers for Environmental Information. doi:10.25921/82ty-9e16 [access date]." **DataCite resolves** the DOI as "International Best Track Archive for Climate Stewardship (IBTrACS) Project, Version 4", NOAA NCEI, publicationYear 2019. Note the year and version-label difference between the two.
- **Licence:** the page states no explicit licence. It describes the data as "publicly available"; it is a U.S. Government (NOAA) product. The robots rule `Disallow: /data*` covers the data folder, **so no CSV was downloaded.** The page also lists a mirror link `https://ncics.org/ibtracs/`, which I did not check. Alternatively the user could download the file manually.

---

## 2. THUNDERSTORMS

### S7. NSSL Severe Weather 101: Thunderstorm Basics and Types
- **Citation:** NOAA National Severe Storms Laboratory, "Severe Weather 101: Thunderstorm Basics" https://www.nssl.noaa.gov/education/svrwx101/thunderstorms/ and "Thunderstorm Types" .../thunderstorms/types/ (accessed 2026-11-28). Raw: `nssl_thunderstorms*.txt`. Public domain. Kind: educational simplification.
- **Definition:** "A thunderstorm is a rain shower during which you hear thunder. Since thunder comes from lightning, all thunderstorms have lightning."
- **Severe criteria:** "A thunderstorm is classified as "severe" when it contains one or more of the following: hail one inch or greater, winds gusting in excess of 50 knots (57.5 mph), or a tornado."
- **Ingredients:** "Three basic ingredients are required for a thunderstorm to form: moisture, rising unstable air (air that keeps rising when given a nudge), and a lifting mechanism to provide the "nudge.""
- **Life cycle (NSSL wording):** "Thunderstorms have three stages in their life cycle: The developing stage, the mature stage, and the dissipating stage." (Full stage text is the same as S8 below.) Note: NOAA uses "developing stage", not "cumulus stage". The phrase "cumulus stage" was **not found** on any NOAA page fetched.
- **Anvil:** "An anvil forms when the updraft (warm air rising) has reached a point where the surrounding air is about the same temperature or even warmer. The cloud growth abruptly stops and flattens out to take the shape of an anvil."
- **Numbers:** "Worldwide, there are an estimated 16 million thunderstorms each year, and at any given moment, there are roughly 2,000 thunderstorms in progress. There are about 100,000 thunderstorms each year in the U.S. alone. About 10% of these reach severe levels."
- **Seasonality/geography:** "Thunderstorms are most likely in the spring and summer months and during the afternoon and evening hours, but they can occur year-round and at all hours." Also: "The greatest severe weather threat in the U.S. extends from Texas to southern Minnesota."
- **Single-cell:** "Often called "popcorn" convection, single-cell thunderstorms are small, brief, weak storms that grow and die within an hour or so. They are typically driven by heating on a summer afternoon."
- **Multicell:** "A multi-cell storm is a common, garden-variety thunderstorm in which new updrafts form along the leading edge of rain-cooled air (the gust front). Individual cells usually last 30 to 60 minutes, while the system as a whole may last for many hours."
- **Squall line:** "They can be hundreds of miles long but are typically only 10 or 20 miles wide."
- **Supercell:** "A supercell is a long-lived (greater than 1 hour) and highly organized storm feeding off an updraft (a rising current of air) that is tilted and rotating. This rotating updraft - as large as 10 miles in diameter and up to 50,000 feet tall - can be present as much as 20 to 60 minutes before a tornado forms. Scientists call this rotation a mesocyclone when it is detected by Doppler radar."
- **MCS:** "An MCS can spread across an entire state and last more than 12 hours."
- **Derecho:** "if the wind damage swath extends more than 240 miles (about 400 kilometers) and includes wind gusts of at least 58 mph (93 km/h) or greater along most of its length, then the event may be classified as a derecho."

### S8. NWS Weather Spotter's Field Guide: Thunderstorm Life Cycle
- **Citation:** NOAA NWS, "Weather Spotter's Field Guide - Thunderstorm Life Cycle". https://www.weather.gov/spotterguide/life (accessed 2026-11-28). Raw: `wg_life.html`. Public domain. Kind: educational.
- **Verbatim:** "The building block of all thunderstorms is the thunderstorm cell. The life time a single thunderstorm cell ranges from 30 to 60 minutes. Thunderstorm cells have three distinct stages:"
  - Developing: "The developing stage of a thunderstorm is marked by a cumulus cloud that is being pushed upward by a rising column of air (updraft)." / "The cumulus cloud soon looks like a tower (called towering cumulus) as the updraft continues to develop. There is little to no rain during this stage."
  - Mature: "The thunderstorm enters the mature stage when the updraft continues to feed the storm, but precipitation begins to fall out of the storm, creating a downdraft (a column of air pushing downward)." / "The storm has considerable depth, often reaching 40,000 to 60,000 feet (12 to 18 km). The mature stage is the is the most dangerous stage and the most likely time for hail, heavy rain, frequent lightning, strong winds, and tornadoes." (The "is the is the" typo is in the source.)
  - Dissipating: "Eventually, a large amount of precipitation is produced and the updraft is overcome by the downdraft beginning the dissipating stage." / "At the ground, the gust front moves out a long distance from the storm and cuts off the warm moist air that was feeding the thunderstorm." / "Light rain and weak outflow winds may remain for a while during this stage, before leaving behind just a remnant anvil top."

### S9. NWS Glossary: supercell and multicell variables
- **Citation:** NOAA NWS Glossary, https://forecast.weather.gov/glossary.php?word=supercell and ?word=multicell (accessed 2026-11-28). Public domain.
- **Supercell (variables):** "Severe supercell development is most likely in an environment possessing great buoyancy (CAPE) and large vertical wind shear. A Bulk Richardson Number of between 15 and 35 favor supercell development." Also: "defined as a thunderstorm consisting of one quasi-steady to rotating updraft which may exist for several hours." Also: "the supercell will produce severe (hail greater than 3/4 inch in diameter, wind gusts greater than 58 miles an hour, and possibly a tornado)". **Discrepancy:** the glossary's hail threshold is 3/4 inch (the old NWS criterion), but NSSL's (S7) is "one inch". Use NSSL.
- **Multicell:** "These thunderstorms are organized in clusters of at least 2-4 short-lived cells. Each cell generates a cold air outflow and these individual outflows combine to form a large gust front. Convergence along the gust front causes new cells to develop every 5 to 15 minutes."
- **Air-mass thunderstorm:** "they develop during the afternoon in response to insolation, and dissipate rather quickly after sunset."

---

## 3. TORNADOES

### S10. NSSL Severe Weather 101: Tornado Basics, Types, FAQ
- **Citation:** NOAA NSSL, https://www.nssl.noaa.gov/education/svrwx101/tornadoes/ (and /types/, /faq/) (accessed 2026-11-28). Raw: `nssl_tornadoes*.txt`. Public domain. Kind: educational.
- **Definition:** "A tornado is a narrow, violently rotating column of air that extends from a thunderstorm to the ground. Because wind is invisible, it is hard to see a tornado unless it forms a condensation funnel made up of water droplets, dust and debris."
- **Formation (variables: shear):** "One way a column of air can begin to rotate is from wind shear – when winds at two different levels above the ground blow at different speeds or in different directions." Worked example: "winds at ground level ... come from the southwest at 5 mph. But higher up, at 5000 feet above the same location, the winds are blowing from the southeast at 25 mph! An invisible "tube" of air begins to rotate horizontally. Rising air within the thunderstorm tilts the rotating air from horizontal to vertical".
- **Supercell share:** "As few as 20 percent of all supercell thunderstorms actually produce tornadoes." Also "Nearly 20% of all tornadoes are associated with lines of strong thunderstorms called "quasi-linear convective systems" (QLCS)."
- **Formation not fully understood:** "The truth is that we don't fully understand. The most destructive tornadoes occur from supercells, which are rotating thunderstorms with a well-defined radar circulation called a mesocyclone."
- **Structure (spotter features):** "A wall cloud is an isolated cloud lowering attached to the rain-free base of the thunderstorm." / "A wall cloud that may produce a tornado can exist for 10–20 minutes before a tornado appears, but not always." / "The rear flank downdraft (RFD) is a downward rush of air on the back side of the storm that descends along with the tornado. ... The rear flank downdraft is the motion in the storm that causes the hook echo feature on radar." / "There is no "eye" to a tornado like there is in a hurricane. ... Tornadoes are complex and can have multiple small structures called "sub vortices" rotating inside the larger parent circulation."
- **Numbers:** "About 1,200 tornadoes hit the U.S. yearly." "A typical tornado travels at around 10–20 miles per hour." Time on the ground: "This time can range from an instant to several hours. The average is about five minutes." Highest wind: "the strongest was 318 mph measured on May 3, 1999 near Bridge Creek/Moore, Oklahoma" (mobile Doppler, above ground level). "Tornadoes (with winds up to about 300 mph)".
- **Geography/season:** "The U.S. tornado threat shifts from the Southeast in the cooler months of the year, toward the southern and central Plains in May and June, and the northern Plains and Midwest during early summer. Tornadoes can occur and have been reported in all fifty states!" Also: "The peak "tornado season" for the southern Plains (e.g., Texas, Oklahoma, and Kansas) is from May into early June. ... most tornadoes occur between 4–9 p.m." Also: "Two of the highest concentrations of tornadoes outside the U.S. are Argentina and Bangladesh."
- **Rating:** "An "Enhanced Fujita Scale" was implemented by the National Weather Service in 2007 ... incorporating 28 damage indicators such as building type, structures and trees. For each damage indicator, there are 8 degrees of damage".

### S11. Enhanced Fujita Scale (NWS Norman)
- **Citation:** NOAA NWS Norman, OK, "The Enhanced Fujita Scale (EF Scale)". https://www.weather.gov/oun/efscale (accessed 2026-11-28). Raw: `wg_efscale.txt`. Kind: damage-based wind estimate scale.
- **Verbatim:** "The Enhanced Fujita Scale or EF Scale, which became operational on February 1, 2007, is used to assign a tornado a 'rating' based on estimated wind speeds and related damage."
- **EF table (3-second gust, mph):** EF0 65-85; EF1 86-110; EF2 111-135; EF3 136-165; EF4 166-200; EF5 Over 200.
- **Caveat (verbatim):** "The EF scale still is a set of wind estimates (not measurements) based on damage. Its uses three-second gusts estimated at the point of damage based on a judgment of 8 levels of damage to the 28 indicators".
- **Original F scale (same page):** F0 40-72 mph; F1 73-112; F2 113-157; F3 158-206; F4 207-260; F5 260-318 mph. **Note:** the page prints F4 as "207-260" and F5 as "260-318", so 260 appears in both. The NWS Moore page (S12) writes the F5 range as "(261-318 mph)".

### S12. Historical tornado: 3 May 1999 Bridge Creek–Moore F5 (NWS Norman)
- **Citation:** NOAA NWS Norman, "The Great Plains Tornado Outbreak of May 3-4, 1999". https://www.weather.gov/oun/events-19990503 (accessed 2026-11-28). Raw: `wg_moore1999.txt`. Kind: official post-event survey and Storm Data.
- **Tornado A9 table row (verbatim values):** date 05/03/1999; Time (CST) 1726-1848; Length of Path (miles) 38; Width of Path (yards) 1760; F-Scale F5; Killed 36; Injured 583; counties "Grady/ McClain/ Cleveland/ Oklahoma"; path "2 SSW Amber - far N Newcastle - SW Oklahoma City - N Moore-S Del City-W Midwest City".
- **Outbreak:** "A total of 40 people in Oklahoma were killed by the tornadoes on May 3-4, 1999 and another 675 persons were injured. ... the total damage estimate was $1.2 billion." Also: "The final total of 72 tornadoes makes May 3-4, 1999 event the largest outbreak of tornadoes for Oklahoma since official records began in 1950."
- **Parent supercell (life cycle example):** "Storm A ... produced 14 tornadoes over a period of about 3.5 hours and was eventually responsible for the F5 tornado (A9)". "The storm began around 3:30 PM CDT (2:30 PM CST) in Tillman County, OK."
- **DOW wind:** "Doppler on Wheels (DOW) researchers announced that their radar measured 318-mph winds in the tornado while it was near Bridge Creek." Caveat: "Early results of this review process suggest that the maximum speed actually may be less than 318 mph (although it likely will remain above 300 mph)." Also: F5 damage was "less than 1 percent of the approximately 15 square miles of damage that this tornado produced."

---

## 4. MID-LATITUDE (EXTRATROPICAL) CYCLONES AND FRONTS

### S13. NWS Glossary: definitions
- **Citation:** NOAA NWS Glossary, forecast.weather.gov/glossary.php (accessed 2026-11-28). Raw: `gl_*.txt`.
- "Extratropical Cyclone: A cyclone in the middle and high latitudes often being 2000 kilometers in diameter and usually containing a cold front that extends toward the equator for hundreds of kilometers."
- "Cyclogenesis (Abbrev. CYCLGN) - The formation or intensification of a cyclone or low-pressure storm system."
- "Cold Front: A zone separating two air masses, of which the cooler, denser mass is advancing and replacing the warmer."
- "Warm Front: A transition zone between a mass of warm air and the colder air it is replacing."
- "Stationary Front: A front between warm and cold air masses that is moving very slowly or not at all."
- "Occluded Front: A composite of two fronts, formed as a cold front overtakes a warm or quasi-stationary front. Two types of occlusions can form depending on the relative coldness of the air behind the cold front to the air ahead of the warm or stationary front. A cold occlusion results when the coldest air is behind the cold front and a warm occlusion results when the coldest air is ahead of the warm front."
- "Frontogenesis: 1. The initial formation of a front or frontal zone. 2. In general, an increase in the horizontal gradient of an airmass property, principally density, and the development of the accompanying features of the wind field that typify a front."
- "Air Mass: A body of air covering a relatively wide area and exhibiting horizontally uniform properties."
- "Pre-Frontal Squall Line: A line of thunderstorms that precedes an advancing cold front."
- Also see NHC "Extratropical Cyclone" (S1): energy is "baroclinic".

### S14. Penn State METEO 3: "Cooking Up a Mid-Latitude Cyclone" (life cycle)
- **Citation:** Seman, S. (prepared by); original materials by L. Grenci. METEO 3, Penn State. https://courses.ems.psu.edu/meteo3/node/2013 (accessed 2026-11-28). CC BY-NC-SA 4.0. Raw: `psu_midlat.html`. Kind: educational simplification. Bio: not verified.
- **Ingredients/birth:** "The basic ingredients for a mid-latitude cyclone are an upper-level disturbance that causes divergence aloft and a surface front ... More specifically, a mid-latitude cyclone is born when an upper-level disturbance passes over a surface stationary front, creating a weak area of low pressure along it as divergence aloft reduces the weight of local air columns."
- **Development (fronts and warm sector):** "East of the low, a warm front (which marks the retreat of colder air) develops as cold air retreats northward, allowing warm air to advance. Meanwhile, a cold front (which marks the leading edge of advancing cold air) forms west of the low as cold air begins to plunge southward. Gradually, the cold front moves counterclockwise around the low as colder air wraps around its southern side ..., helping to form a well-defined warm sector".
- **Feedback:** "strong temperature gradients are required for mid-latitude cyclone development because the temperature advections play a key role in a positive feedback process that strengthens the cyclone (the cyclone strengthens itself)."
- **Occlusion/dissipation:** "What brings an end to a mid-latitude cyclone's life? First of all, the main source of upper-level divergence eventually moves away. ... Secondly, the low ends up getting somewhat separated from the large temperature gradients associated with the fronts. This separation occurs late in the cyclone's life, called "occlusion" (or "the occluded stage")." Also: "So, removed from strong surface temperature gradients and lacking upper-level divergence, the low weakens and dies".
- **Purpose:** "mid-latitude cyclones help the atmosphere strive for balance by reducing hemispheric temperature gradients."
- **Duration:** "(most mid-latitude cyclones last for a few days to a little more than a week)".
- **Example (Blizzard of 2016):** "a "baby" 1009 millibar low along a stationary front in Texas ... By the time the storm was off the Mid-Atlantic coast, it was a fierce 987-millibar occluding low. This storm went from a "baby" low over Texas to a dying low over the Atlantic in a little less than three days"; "it dumped more than 30 inches of snow ... on parts of West Virginia, Virginia, Maryland, and Pennsylvania."
- **Geography:** "In the winter, there's often a naturally large temperature gradient near the coast. The water of the Atlantic ... tends to be warmer than the chilly land in the Mid-Atlantic and Northeast U.S."

---

## 5. BLIZZARDS / WINTER STORMS

### S15. NWS Glossary: Blizzard
- **Citation:** https://forecast.weather.gov/glossary.php?word=blizzard (accessed 2026-11-28). Raw: `gl_blizzard.txt`.
- **Verbatim:** "Blizzard (abbrev. BLZD)- A blizzard means that the following conditions are expected to prevail for a period of 3 hours or longer: Sustained wind or frequent gusts to 35 miles an hour or greater; and Considerable falling and/or blowing snow (i.e., reducing visibility frequently to less than ¼ mile)". (In the raw HTML the ¼ is mis-encoded as "Â¼".)
- "Blizzard Warning: Issued for winter storms with sustained or frequent winds of 35 mph or higher with considerable falling and/or blowing snow that frequently reduces visibility to 1/4 of a mile or less. These conditions are expected to prevail for a minimum of 3 hours. Ground Blizzard Warning: When blizzard conditions are solely caused by blowing and drifting snow."
- "Winter Storm Warning: ... issued ... when a winter storm is producing or is forecast to produce heavy snow or significant ice accumulations. The criteria for this warning can vary from place to place."
- "Lake Effect Snow: Snow showers that are created when cold, dry air passes over a large warmer lake, such as one of the Great Lakes, and picks up moisture and heat."
- "Wind Chill: ... As a general rule, the threshold for potentially dangerous wind chill conditions is about -20°F and lower."
- **Minor discrepancy:** the glossary says "less than ¼ mile" in one place and "1/4 of a mile or less" in another. NSSL (S16) says "1/4 mile or less".

### S16. NSSL Severe Weather 101: Winter Weather
- **Citation:** NOAA NSSL, https://www.nssl.noaa.gov/education/svrwx101/winter/ and /winter/types/ (accessed 2026-11-28). Raw: `nssl_winter*.txt`.
- **Definition:** "A winter storm is an event in which the main types of precipitation are snow, sleet or freezing rain."
- **Ingredients (verbatim):** "Cold air. Below freezing temperatures in the clouds and near the ground are necessary to make snow and/or ice." / "Lift. Something to raise the moist air to form the clouds and cause precipitation. An example of lift is warm air colliding with cold air and being forced to rise over the cold dome. The boundary between the warm and cold air masses is called a front. Another example of lift is air flowing up a mountainside." / "Moisture. To form clouds and precipitation. Air blowing across a body of water, such as a large lake or the ocean, is an excellent source of moisture."
- **Blizzard:** "Blizzards are dangerous winter storms that are a combination of blowing snow and wind resulting in very low visibilities. While heavy snowfalls and severe cold often accompany blizzards, they are not required. Sometimes strong winds pick up snow that has already fallen, creating a ground blizzard." Also: "Blizzards. Winds over 35mph with snow and blowing snow, reducing visibility to 1/4 mile or less for at least 3 hours."
- **Ice storm:** "An ice storm is a storm which results in the accumulation of at least .25" of ice on exposed surfaces."
- **Precipitation type vs temperature profile (lab variable):** "Precipitation continues to fall as snow when the temperature remains at or below 0 degrees Celsius from the cloud base to the ground." Sleet: "snowflakes only partially melt when they fall through a shallow layer of warm air. These slushy drops refreeze as they next fall through a deep layer of freezing air above the surface". Freezing rain: "snowflakes descend into a warmer layer of air and melt completely. When these liquid water drops fall through another thin layer of freezing air just above the surface, they don't have enough time to refreeze before reaching the ground."
- **Impact:** "Of injuries related to ice and snow, about 70% occur in automobiles."

### S17. NWS Wind Chill formula
- **Citation:** NOAA NWS El Paso, "Wind Chill" calculator note. https://www.weather.gov/media/epz/wxcalc/windChill.pdf (accessed 2026-11-28). Raw: `windchill.pdf`. **The formula was read from the rendered page image `wc_p1.jpg`**, because the text layer is garbled. No date on the page.
- **°F/mph formula:** WindChill = 35.74 + (0.6215 × T) − (35.75 × Wind_sfc^0.16) + (0.4275 × T × Wind_sfc^0.16), with "temperature must be converted to degrees Fahrenheit (°F)" and wind "converted to miles per hour (mph)".
- **W/m² form (°C, m/s):** WindChill = (12.1452 + 11.6222 × √Wind_sfc − 1.16222 × Wind_sfc) × (33 − T).
- Self-check: T = 0 °F, V = 15 mph gives −19.4 °F (my own computation, not from the source).

### S18. Historical: Superstorm / "Storm of the Century", 12–14 March 1993
- **S18a. Citation:** NOAA, "Superstorm of March 1993: March 12-14, 1993", Natural Disaster Survey Report (May 1994). https://www.weather.gov/media/publications/assessments/superstorm.pdf (accessed 2026-11-28). The fetched file holds **only the 9-page Executive Summary and Major Findings (pp. viii–xvi)**. Text layer, with some OCR noise in the original (e.g. "fkom", "NOM"). Raw: `ss93.pdf`. Kind: official assessment.
  - "Despite the strongly worded early warnings, the storm was responsible for some 200 deaths. The primary direct causes for these fatalities were tornadoes and coastal flooding in Florida. In fact, Superstorm surge killed more people [from] drowning than Hurricane Hugo and Hurricane Andrew combined. The primary indirect cause of fatalities was heart attacks brought on by overexertion while shoveling snow." ("fkom" corrected to [from].)
  - "In the northern states, the threat was mainly from the heavy snow and high winds causing blizzard conditions." and "the warning across to the populace of nearly 40 percent of the Nation".
- **S18b. Citation:** NOAA NWS Melbourne, FL, "25th Anniversary: March 12-14, 1993" (newsletter PDF, 2018). https://www.weather.gov/media/mlb/pdfs/Superstorm_1993.pdf. Text layer. Raw: `ss93_mlb.txt`.
  - "One of the strongest mid-latitude cyclones on record". Life cycle: "A slow-moving cold front stalled over Central FL in the early hours of March 12, while a developing low off the southern coast of TX moved east into the Gulf of Mexico. Over the next 6 hours, this low began to rapidly intensify over the central Gulf". Landfall: "the center of low pressure made landfall along the FL Gulf Coast near Panama City, with the lowest pressure reading near 977mb." Northeast: "a peak wind gust of 144 mph was measured at Mt. Washington, NH. Blizzard conditions were seen from N Georgia to Maine, with 43" of snow measured in Syracuse, NY and 56" in Tennessee." Deaths: "In total, 270 people were killed in 10 states along the East Coast". Florida: "44 deaths were attributed to the Superstorm in FL".
  - **Discrepancy:** 1994 NOAA report "some 200 deaths" vs NWS Melbourne 2018 "270". Record both. The storm's absolute minimum central pressure (well below 977 mb, reached later over the Northeast) was **not found** in these sources.

---

## 6. HEAT WAVES

### S19. NWS Glossary: Heat Wave and Heat Index
- https://forecast.weather.gov/glossary.php?word=heat%20wave: "Heat Wave: A period of abnormally and uncomfortably hot and unusually humid weather. Typically a heat wave lasts two or more days."
- ?word=heat%20index: "The Heat Index (HI) or the "Apparent Temperature" is an accurate measure of how hot it really feels when the Relative Humidity (RH) is added to the actual air temperature."

### S20. NWS Heat Index equation (Rothfusz regression): WPC
- **Citation:** NOAA NWS Weather Prediction Center, "The Heat Index Equation". https://www.wpc.ncep.noaa.gov/html/heatindex_equation.shtml. "Page last modified: Thursday, 12-May-2022 19:37:55 UTC" (accessed 2026-11-28). Raw: `wpc_hi.html/.txt`. Kind: empirical regression (fit to Steadman's apparent-temperature model).
- **Verbatim:** "The computation of the heat index is a refinement of a result obtained by multiple regression analysis carried out by Lans P. Rothfusz and described in a 1990 National Weather Service (NWS) Technical Attachment (SR 90-23). The regression equation of Rothfusz is
  HI = -42.379 + 2.04901523*T + 10.14333127*RH - .22475541*T*RH - .00683783*T*T - .05481717*RH*RH + .00122874*T*T*RH + .00085282*T*RH*RH - .00000199*T*T*RH*RH
  where T is temperature in degrees F and RH is relative humidity in percent."
- Low-RH adjustment: "If the RH is less than 13% and the temperature is between 80 and 112 degrees F, then the following adjustment is subtracted from HI: ADJUSTMENT = [(13-RH)/4]*SQRT{[17-ABS(T-95.)]/17}"
- High-RH adjustment: "if the RH is greater than 85% and the temperature is between 80 and 87 degrees F, then the following adjustment is added to HI: ADJUSTMENT = [(RH-85)/10] * [(87-T)/5]"
- Simple formula: "HI = 0.5 * {T + 61.0 + [(T-68.0)*1.2] + (RH*0.094)}" and "In practice, the simple formula is computed first and the result averaged with the temperature. If this heat index value is 80 degrees F or higher, the full regression equation along with any adjustment as described above is applied."
- Validity: "The Rothfusz regression is not valid for extreme temperature and relative humidity conditions beyond the range of data considered by Steadman."
- Self-check: T = 90 °F, RH = 50 % gives 94.6 °F (my computation; consistent with the familiar NWS chart value of 95).

### S21. Historical heat wave: July 1995 (Chicago/Midwest): NWS Natural Disaster Survey Report
- **Citation:** U.S. Dept. of Commerce, NOAA, NWS, "Natural Disaster Survey Report: July 1995 Heat Wave", Silver Spring, MD, December 1995. https://www.weather.gov/media/publications/assessments/heat95.pdf (accessed 2026-11-28). Raw: `heat95.pdf/.txt`. **Text layer.** In the text layer the degree sign renders as "i" (e.g. "100iF" means 100 °F). Kind: official assessment and observations.
- **Deaths (Foreword, verbatim):** "Chicago experienced its worst weather-related disaster, with 465 heat-related deaths recorded during the period from July 11-27, 1995. Milwaukee also was severely affected, with 85 heat-related deaths recorded during the same time period." Preface: "In the disastrous heat wave of 1995, more than 1,000 people died." Also: "In a normal year, about 175 Americans succumb to the demands of summer heat."
  - **Discrepancy:** other figures (e.g. 739 or 750) appear in later non-report sources (search snippets only, not fetched). Use the report's 465 (Chicago, Jul 11–27) and cite it.
- **Cause (Finding, verbatim):** "The principal cause of the July 1995 heat wave was a slow-moving, hot, and humid air mass produced by the chance occurrence at the same time of an unusually strong upper-level ridge of high pressure and unusually moist ground conditions."
- **Observations, Table 1 (°F):** Chicago Midway MAX Jul 12–16: 97, 106, 102, 98, 93; MIN 75, 81, 84, 77, 76. O'Hare MAX 97, 104, 100, 98, 93. Milwaukee MAX 91, 103, 103, 92, 88. Table 3: "Chicago/Midway 106" (July 13). Also: "approximately 70 daily maximum temperature records were set at locations from the central and northern Great Plains to the Atlantic coast" (July 13–15). Forecast context: "temperatures near 100°F, dew points near 80°F, and heat index levels above 110°F". Midway Table 7 min temp (max dew point): "81 (81) 84 (83) 83 (83)".

---

## 7. MONSOON (optional)

### S22. NWS Phoenix: Monsoon Awareness
- **Citation:** NOAA NWS Phoenix, "Monsoon Awareness Week". https://www.weather.gov/psr/monsoonawarenessweek (accessed 2026-11-28). Raw: `wg_psr_monsoon.html`. Kind: educational.
- **Season:** "Our "monsoon season" officially extends from June 15th through September 30th".
- **Etymology:** "The word monsoon is derived from the Arabic word mausim, which means season."
- **Mechanism (verbatim):** "by late spring, strong solar heating causes temperatures to soar over these land areas. This intense heating causes surface air pressure to fall, forming an area of low pressure known as a thermal low. Adjacent large bodies of water are also warmed, but not as quickly. Thus, air pressures remain higher relative to the land." / "Eventually, the pressure difference increases to the point that the cooler and more humid air over the ocean is drawn toward the hot, dry air over land. This moist air moving inland eventually becomes unstable and develops into thunderstorms."
- **End:** "This cycle will continue until land areas begin to cool in the early fall, and water temperatures reach their peak in early fall. This reduces the pressure difference, which in turn causes the moist onshore flow to diminish and the monsoon gradually ends."
- "For some areas, over 50% of annual rain falls during the monsoon." "In North America, the Monsoon impacts Arizona, New Mexico, Nevada, Utah, Colorado, Texas, California, and Mexico."
- **Definitions:** NWS Glossary "Monsoon: A thermally driven wind arising from differential heating between a land mass and the adjacent ocean that reverses its direction seasonally." The NHC Glossary definition is in S1.

## 8. DUST STORMS (optional)
- **NWS Glossary** (?word=dust%20storm): "Dust Storm: A severe weather condition characterized by strong winds and dust-filled air over an extensive area. Dust Storm Warning: This product is issued when a convectively-driven dust storm is reducing visibilities to ¼ mile or less. Winds of 25 mph or greater are usually required." ("haboob" is not in the glossary.)
- **NWS Phoenix (S22):** "The outflow boundaries created by these strong thunderstorms can result in winds 50 mph or greater, and very dense blowing dust generated over open fields and desert. ... The most organized outflow boundaries can create huge walls of dust extending miles across and thousands of feet high. Even smaller and less organized dust events can be extremely hazardous to motorists as highway visibility can drop to only hundreds of feet in seconds." Also: "A downburst is defined as a concentrated, severe downdraft that induces an outward burst of damaging winds at the ground."

---

## NOT FOUND / gaps
1. **NHC/NOAA verbatim SST threshold (26.5 °C / 80 °F) and the ~5° rule:** not obtained from NHC. The AOML HRD FAQ is blocked (CloudFront 403) and JetStream is blocked. The substitutes are NASA Earth Observatory (26.5 °C, but **"generally at least 8 degrees"** latitude) and Penn State METEO 3 (26.5 °C and **"at least five degrees"**). This conflict is unresolved, so the app should show the 5° figure attributed to Penn State, or show both.
2. **IBTrACS data file not downloaded:** robots.txt `Disallow: /data*` on www.ncei.noaa.gov covers every IBTrACS CSV/netCDF path. The metadata and citations were captured (S6). The ncics.org mirror was not checked. A manual download by the user is one option.
3. **"Cumulus stage" wording:** NOAA pages say "developing stage" (defined by a cumulus/towering cumulus cloud). No NOAA page fetched uses "cumulus stage".
4. **Tornado life-cycle stages and dissipation** ("organizing / mature / shrinking / decaying / rope stage"): not found on the allowed hosts. NSSL states formation is not fully understood. The SPC FAQ (spc.noaa.gov) is excluded.
5. **Mid-latitude cyclone life-cycle stages from a NOAA page:** JetStream "Norwegian Cyclone Model" is blocked, so Penn State (CC BY-NC-SA) was used instead. Bjerknes & Solberg (1922) and Schultz & Vaughan (2011, BAMS, a critique of the "catch-up" occlusion model) were not fetched; their DOIs were not verified.
6. **1993 Superstorm minimum central pressure** and full report body: only the executive summary PDF was available at the URL fetched.
7. **Andrew reanalysis paper** (Landsea et al. 2004, BAMS 85(11) 1699-1712): cited by NHC but its DOI was not verified.
8. **Archive.org classics** (Redfield, Ferrel): skipped for time.
9. **Author bios:** none were verified on official pages (Knabb, Rhome, Brown, Rappaport, Graham, Riebeek, Seman, Knapp et al.).
10. **Dust storm historical example and monsoon historical example:** not researched.
