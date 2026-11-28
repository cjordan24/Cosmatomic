# SOURCE NOTES — Phase 23A: Geological climate timeline (Earth formation → present)

Research date: 2026-11-28. Rules: /tmp/vv-research/p20/RULES.md. Raw files: /tmp/vv-research/p23/a/.
User-Agent: `VoyagerVentures-Research/0.1 (educational; respects robots.txt)`; ≥1.2 s between requests per host.

**App rule for this timeline:** show every ancient value as the source prints it, with its range or "about/~" qualifier, and attach one of these labels:
- **[CONSENSUS]**: a chronostratigraphic boundary or other agreed figure (ICS/USGS chart, USGS age of Earth).
- **[PROXY]**: a proxy reconstruction (isotopes, fossils, sediments, ice cores).
- **[MODEL]**: a model estimate or a data-assimilation/model–data product.
- **[EDU]**: an educational simplification in agency outreach text (rounded "about" figures).

## Robots / terms log

| Host | robots.txt result (fetched first) | Decision |
|---|---|---|
| pubs.usgs.gov | `User-agent: *` / `Disallow: /archive/` | allowed (used /fs/, /gip/, /publication/) |
| www.usgs.gov | disallows /core/, /admin/, /search/, /user/… only | allowed (/news/) |
| www.ncei.noaa.gov | `Disallow: /data*`, `/orders*`, `/access/crn/...` | /news/ and /metadata/ allowed. No /data* paths fetched |
| www.climate.gov | disallows /core/, /modules/, /search, /maps-data/tools-interactives/, some data-snapshots | allowed (/news-features/). The site banner says it is an **ARCHIVED version of NOAA Climate.gov as of June 25, 2025** |
| science.nasa.gov | `User-agent: * Allow: /` | allowed |
| earthobservatory.nasa.gov | robots.txt 301-redirects to science.nasa.gov/earth/earth-observatory/ (HTML, no rules) | no EO pages needed in the end |
| astrobiology.nasa.gov | robots.txt → HTTP 404 (no rules) | allowed. The site banner says it is being migrated to science.nasa.gov/astrobiology |
| www.nps.gov / home.nps.gov | disallows /ns/, /search/, loader.cfm only | allowed |
| stratigraphy.org | only `Sitemap:` plus Cloudflare "content-signal" comment block with no signal values set | allowed. Chart PDF fetched. Licence: see §1 |
| cp.copernicus.org | `User-agent: *` (no Disallow) | allowed (CC BY 4.0 articles) |
| naturalhistory.si.edu (Smithsonian) | **`User-agent: ClaudeBot / anthropic-ai / Claude-Web` → `Disallow: /`**; `Content-Signal: search=yes,ai-train=no,use=reference` | **EXCLUDED, not fetched** |

Off-limits hosts were not touched: no Wikipedia, no Springer/Nature/Wiley, no ncbi/PMC. Search-engine snippets from these sites were ignored.

---

## 1. Geologic time scale boundaries

### 1a. USGS Fact Sheet 2018–3054 (PRIMARY, public domain)
- Citation: U.S. Geological Survey Geologic Names Committee, 2018, *Divisions of geologic time—major chronostratigraphic and geochronologic units*: U.S. Geological Survey Fact Sheet 2018–3054, 2 p. DOI **10.3133/fs20183054** (printed on the sheet). August 2018. Committee: Randall C. Orndorff (chair) and others (USGS + Alabama State Geologist).
- URL: https://pubs.usgs.gov/publication/fs20183054. PDF: https://pubs.usgs.gov/fs/2018/3054/fs20183054.pdf (born-digital; text layer read, and the figure-1 chart on p. 2 was checked on the rendered page image `fsp_p2.jpg`).
- Note: the requested FS 2010–3059 (https://pubs.usgs.gov/fs/2010/3059/) is marked on its landing page: "This USGS Publication has been superseded by https://pubs.usgs.gov/publication/fs20183054". That is why the 2018 sheet is used.
- Licence: USGS publication, U.S. Government work (public domain).
- Kind: **[CONSENSUS]**. The sheet "reflects ratified unit names and boundary estimates from the International Commission on Stratigraphy (2018)".
- Verbatim (p. 1): "the International Union of Geological Sciences formally ratified a new definition of the base of the Quaternary and the corresponding base of the Pleistocene Series/Epoch, changing it from 1.806 Ma to 2.58 Ma"
- Verbatim (Age Terms box): "ka for kilo-annum (10³ years); Ma for mega-annum (10⁶ years); and Ga for giga-annum (10⁹ years)." Also: ages "may be expressed in years before present (before A.D. 1950)."
- Verbatim: "The Anthropocene currently has no formal status in the Divisions of Geologic Time and is not recognized by the GNC."
- Boundary ages (Ma), read from figure 1 (base of each unit):
  - Holocene 0.0117. Pleistocene/Quaternary 2.58. Pliocene 5.33. Miocene/Neogene 23.03. Oligocene 34.09. Eocene 55.9. Paleocene/Paleogene/Cenozoic 66.0.
  - Cretaceous upper/lower 100.5. Cretaceous ~145. Jurassic upper 163.5 ±1.1, middle 174.1 ±1.0, base 201.3 ±0.2. Triassic upper ~237, middle 247.2, base/Mesozoic 251.9.
  - Permian Lopingian 259.1 ±0.5, Guadalupian 272.95 ±0.11, base 298.9 ±0.2. Pennsylvanian 307.0 ±0.1 / 315.2 ±0.2 / base 323.2 ±0.4. Mississippian 330.9 ±0.2 / 346.7 ±0.4 / base 358.9 ±0.4.
  - Devonian 382.7 ±1.6 / 393.3 ±1.2 / base 419.2 ±3.2. Silurian 423.0 ±2.3, 427.4 ±0.5, 433.4 ±0.8, base 443.8 ±1.5. Ordovician 458.4 ±0.9 / 470.0 ±1.4 / base 485.4 ±1.9. Cambrian ~497 / ~521 / base (Phanerozoic, Paleozoic) 541.0 ±1.0.
  - Ediacaran ~635. Cryogenian ~720. Tonian/Neoproterozoic 1,000. Stenian 1,200. Ectasian 1,400. Calymmian/Mesoproterozoic 1,600. Statherian 1,800. Orosirian 2,050. Rhyacian 2,300. Siderian/Proterozoic 2,500.
  - Neoarchean 2,800. Mesoarchean 3,200. Paleoarchean 3,600. Eoarchean/Archean ~4,000. Hadean base ~4,600.

### 1b. ICS International Chronostratigraphic Chart v2024/12 (most current; licence caution)
- Citation (as printed): "Cohen, K.M., Finney, S.C., Gibbard, P.L. & Fan, J.-X. (2013; updated) The ICS International Chronostratigraphic Chart. Episodes 36: 199-204". Chart URL: http://www.stratigraphy.org/ICSchart/ChronostratChart2024-12.pdf. Fetched from https://stratigraphy.org/ICSchart/ChronostratChart2024-12.pdf. Born-digital PDF: text layer read, and the columns were checked on a 5000-px render (`icsbig_p1.jpg`, crops `icscol*.jpg`).
- **Licence: the chart prints "(c) International Commission on Stratigraphy, December 2024". No CC BY statement appears on the chart PDF or the fetched /chart page**, which is a JS shell. Recommendation: cite the numbers as facts with attribution and do not reproduce the chart graphic.
- Kind: **[CONSENSUS]**. Verbatim: "Numerical ages are subject to ongoing revision and do not define units in the Phanerozoic and the Ediacaran; only GSSPs do. For boundaries in the Phanerozoic without ratified GSSPs or without constrained numerical ages, an approximate numerical age (~) is provided." Also: "Most numerical ages are taken from 'A Geologic Time Scale 2020' by Gradstein et al. (2020), but some ages differ … These are approved by the ICS executive as the current consensus."
- Period/epoch bases (Ma):
  - Holocene stages: Meghalayan 0.0042, Northgrippian 0.0082, Greenlandian/Holocene 0.0117. Upper Pleistocene 0.129, Chibanian 0.774, Calabrian 1.80. Quaternary 2.58.
  - Pliocene 5.333. Miocene/Neogene 23.04. Oligocene 33.9. Eocene 56.00. Paleocene/Paleogene 66.00.
  - Cretaceous 143.1 ±0.6. Jurassic 201.4 ±0.2. Triassic 251.902 ±0.024. Permian 298.9 ±0.15. Carboniferous 358.86 ±0.19. Devonian 419.62 ±1.36. Silurian 443.1 ±0.9. Ordovician 486.85 ±1.5. Cambrian 538.8 ±0.6.
  - Ediacaran ~635. Cryogenian ~720. Tonian 1000. Proterozoic 2500. Archean 4031 ± 3. Hadean 4567.
  - Stage bases used for events: Frasnian/Famennian 372.15 ±0.46. Hirnantian 445.2 ±0.9.
- **Discrepancies (record both; ICS 2024/12 is newer):**

  | Boundary | USGS 2018 | ICS 2024/12 | NPS time-scale page 2018 graphic (§1c) |
  |---|---|---|---|
  | Cambrian base | 541.0 ±1.0 | 538.8 ±0.6 | — |
  | Ordovician base | 485.4 ±1.9 | 486.85 ±1.5 | — |
  | Silurian base | 443.8 ±1.5 | 443.1 ±0.9 | — |
  | Devonian base | 419.2 ±3.2 | 419.62 ±1.36 | — |
  | Carboniferous base | 358.9 ±0.4 | 358.86 ±0.19 | — |
  | Triassic base | 251.9 | 251.902 ±0.024 | 252.2 |
  | Jurassic base | 201.3 ±0.2 | 201.4 ±0.2 | — |
  | Cretaceous base | ~145 | 143.1 ±0.6 | — |
  | Oligocene base | 34.09 | 33.9 | — |
  | Eocene base | 55.9 | 56.00 | — |
  | Archean base | ~4,000 | 4031 ± 3 | — |
  | Hadean base | ~4,600 | 4567 | — |

### 1c. NPS Geologic Time Scale page (secondary)
- https://www.nps.gov/subjects/geology/time-scale.htm, last updated October 5, 2021. Graphic credited to "NPS Geologic Resources Inventory, 2018". Public domain (NPS text).
- It prints Hadean "4600-4000 MYA", Archean "4000-2500 MYA", Proterozoic "2500-541 MYA", Paleozoic "541.0-252.2 MYA", Mesozoic "252.2-66.0 MYA", and Cenozoic "66.0 MYA-present".
- Note: NPS 252.2 differs from 251.9 on the NPS fossil pages and in USGS, and from 251.902 in ICS.

---

## 2. Proxies: how scientists reconstruct ancient climates

### NOAA NCEI, "What Are Proxy Data?" (PRIMARY)
- https://www.ncei.noaa.gov/news/what-are-proxy-data. Published April 15, 2016; updated August 24, 2018. NOAA NCEI, no named author. U.S. Gov work, public domain (one header image is "Courtesy of NOAA and Pixabay.com", so do not reuse the image). Kind: [EDU].
- Definition: "In paleoclimatology, or the study of past climates, scientists use what is known as proxy data to reconstruct past climate conditions. These proxy data are preserved physical characteristics of the environment that can stand in for direct measurements."
- **Ice cores:** "These layers contain dust, air bubbles, or isotopes of oxygen, differing from year to year based on the surrounding environment, that can be used to interpret the past climate of an area." Also: "Ice cores can tell scientists about temperature, precipitation, atmospheric composition, volcanic activity, and even wind patterns."
- **Ocean and lake sediment cores:** "Scientists drill cores of the sediments from the basin floors and examine their contents, which include tiny fossils and chemicals, to interpret past climates."
- **Tree rings:** "Because climate conditions influence tree growth, patterns in tree-ring widths, density, and isotopic composition reflect variations in climate."
- **Corals:** "The carbonate also contains isotopes of oxygen as well as trace metals that can be used to determine the temperature of the water in which the coral grew."
- **Pollen (fossil):** "Scientists can then make inferences about the climate of the area based on the types of plants found in each layer."
- **Caves (speleothems):** "Because the amount of water making its way into caves determines the amount speleothems grow, their layers can indicate times of both heavy precipitation and drought."
- **Historical documents:** "For example, scientists used historical grape harvest dates to reconstruct summer temperatures, between April and September, in Paris from 1370 to 1879."

### Isotope ratios (δ18O)
- NOAA NCEI, "Climate Change in the Context of Paleoclimate", published December 5, 2022. https://www.ncei.noaa.gov/news/climate-change-context-paleoclimate. Verbatim: "the relative concentrations of oxygen isotopes in ice cores (at high latitudes, precipitation in colder conditions has a lower O-18/O-16 ratio as compared to warmer conditions)."
- Deep-sea δ18O (CC BY), from Hutchinson et al. 2021 (§3.11): "The change is marked by a global shift in deep-sea δ18O representing a combination of deep-ocean cooling and growth in land ice volume."
- Foraminifera, from NOAA Climate.gov "hottest" (§3.0), in a figure caption: "Temperatures in the distant past are inferred from proxies, in this case, oxygen isotope ratios from fossil foraminifera, single-celled marine organisms."

### Fossils and rocks as climate evidence, plus the overview
- **Fossils:** NOAA Climate.gov "hottest" (§3.0): "By studying indirect clues—the chemical and structural signatures of rocks, fossils, and crystals, ocean sediments, fossilized reefs, tree rings, and ice cores—however, scientists can infer past temperatures."
- **Glacial rock evidence:** NOAA Climate.gov "coldest" (§3.0): "Glaciers, geologists realized, could leave giant scratch marks on bedrock and carry boulders to distant landscapes, often dropping those rocks at sea."
- **Resolution trade-off:** NOAA NCEI, "How Do Scientists Study Ancient Climates?", published March 3, 2016, updated August 3, 2018. https://www.ncei.noaa.gov/news/how-do-scientists-study-ancient-climates. Verbatim: "Typically, records that have large timespans have less detail about short-term climate changes, while shorter records are often more detailed."

---

## 3. Events

### 3.0 Main narrative sources (cited by key below)
- **CG-HOT**: Michon Scott and Rebecca Lindsey, "What's the hottest Earth's ever been?", NOAA Climate.gov.
  - Reviewed by Scott Wing (Smithsonian), Carrie Morrill (NCEI) and Brian Huber (Smithsonian). Published February 26, 2025; "first published in August 2014".
  - https://www.climate.gov/news-features/climate-qa/whats-hottest-earths-ever-been. Archived site as of June 25, 2025.
  - Public domain NOAA text; images and animations have mixed credits, so do not reuse them. Bios: not verified.
- **CG-COLD**: Michon Scott, "What's the coldest the Earth's ever been?", NOAA Climate.gov.
  - Reviewed by Galen Halverson. Published February 18, 2021.
  - https://www.climate.gov/news-features/climate-qa/whats-coldest-earths-ever-been. Bios: not verified.
- **NPS-MASS**: NPS Fossils & Paleontology, "Mass Extinctions Through Geologic Time". https://www.nps.gov/subjects/fossils/mass-extinctions-through-geologic-time.htm, last updated February 28, 2025. Its percentages credit "Our World in Data https://ourworldindata.org/mass-extinctions".
- **NPS-EXT**: NPS, "Extinction Events". https://www.nps.gov/subjects/fossils/extinction-events.htm, last updated February 28, 2025.
- **NPS period pages**: https://www.nps.gov/articles/000/{the-precambrian, proterozoic-eon, cambrian-period, ordovician-period, permian-period, triassic-period, cretaceous-period, paleogene-period, quaternary-period}.htm. Last updated 2023-04-27/28, except Cambrian (January 22, 2025).

### 3.1 Formation of Earth: 4.54 Ga [CONSENSUS]
- USGS, *Geologic Time: Age of the Earth* (online edition of the USGS general-interest publication "Geologic Time"). https://pubs.usgs.gov/gip/geotime/age.html. Public domain.
- "The best age for the Earth (4.54 Ga) is based on old, presumed single-stage leads coupled with the Pb ratios in troilite from iron meteorites, specifically the Canyon Diablo meteorite."
- "These calculations result in an age for the Earth and meteorites, and hence the Solar System, of 4.54 billion years with an uncertainty of less than 1 percent."
- Also: "the meteorites, and therefore the Solar System, formed between 4.53 and 4.58 billion years ago." And: "The oldest rocks on Earth found so far are the Acasta Gneisses in northwestern Canada near Great Slave Lake (4.03 Ga)"; "single zircon crystals … have radiometric ages of as much as 4.3 billion years". The page also has a 4.4 Ga zircon sentence: "mineral grains (zircon) with U-Pb ages of 4.4 Ga have recently been reported".
- Compare: ICS Hadean base "4567" Ma (§1b); USGS chart "~4,600"; NPS Precambrian page "4,540 million years ago".
- Hadean conditions (CG-HOT) [MODEL, astronomical models]: "Following the collision that spawned the Moon, the planet was estimated to have been around 2,300 Kelvin (3,680°F)." And: "Even after collisions stopped, and the planet had tens of millions of years to cool, surface temperatures were likely more than 400° Fahrenheit."
- NPS Precambrian: "The Hadean Eon began with the formation of the first rocks on Earth and ended 4 billion years ago. This eon was a time of massive volcanic activity and frequent collisions with asteroids, leading to rapid changes of the planet's surface."

### 3.2 Early atmosphere and oceans [PROXY/MODEL, wide ranges]
- CG-COLD: "Carbon dioxide was anywhere from 10 to 2,500 times present levels, and methane may have been as much as 10,000 times higher than present levels. Atmospheric oxygen was virtually nonexistent." Context: this is the atmosphere "when microbial life arose on Earth over 3.5 billion years ago".
- Early ocean, CG-HOT: "Zircon crystals from Australia, only about 150 million years younger than the Earth itself, hint that our planet may have cooled faster than scientists previously thought."
- NPS Precambrian (Archean): "The Archean Eon began 4 billion years ago and ended 2.5 billion years ago. During this time, the first areas of continental crust appeared … Life first appeared on Earth during the Archean Eon."

### 3.3 Faint young Sun [MODEL, stellar evolution]
- NASA Science, "Starstruck: NASA Research Shows How Sun's Ancient History Shaped Earth". https://science.nasa.gov/solar-system/starstruck-nasa-research-shows-how-suns-ancient-history-shaped-earth/
  - Author tag Desiree Apodaca. Page editor Miles Hatfield. datePublished / page last updated Aug 24, 2026. Public domain.
- "Three billion years ago, the young Sun was 70% as bright as it is today. Under these dimmer conditions, Earth should have been frozen solid. Yet geological evidence shows stable liquid water already existed long before that. This puzzle — a balmy Earth under a cooler, dimmer Sun — is known as the Faint Young Sun paradox."
- Note: a search snippet attributed to a 2016 NASA Goddard feature (not fetched) dates "about three-quarters" brightness to ~4 billion years ago. Use the fetched NASA wording (70 %, three billion years ago).

### 3.4 Great Oxidation Event: ~2.4 Ga [PROXY]
- NASA Astrobiology, "Clues to Oxygen on Earth before the Great Oxidation Event", Oct. 6, 2021, posted by Aaron Gronstal (source: Arizona State University). https://astrobiology.nasa.gov/news/clues-to-oxygen-on-earth-before-the-great-oxidation-event/
  - "the 'Great Oxidation Event,' when a rise in atmospheric oxygen altered the environment and the biosphere of our planet some 2.4 billion years ago."
  - "The results indicate that oxygen was present in the atmosphere before the Great Oxidation Event, but at very low levels." The molybdenum proxy is model-interpreted.
- NASA Astrobiology, "Whiffs and the Rise of Oxygen", April 20, 2023. https://astrobiology.nasa.gov/news/whiffs-and-the-rise-of-oxygen/
  - "What is known as the Great Oxidation Event (GOE) occurred sometime between 2.4 and 2.1 billion years ago, leaving the atmosphere rich in oxygen."
  - Also: "molecular oxygen appeared in Earth's atmosphere at least 2.5 billion years ago as relatively short-lived 'whiffs'".
- NPS Proterozoic: "Oxygen became an important component of the atmosphere, having been produced by early life as a waste product. Increasing oxygen had profound effects, including the triggering of ice ages, the creation of iron deposits…"
- **No O₂ percentage found** in any accredited source fetched.

### 3.5 Huronian glaciations: 2.4–2.1 Ga [PROXY]
- CG-COLD: "Among the earliest ice ages so far found in the geological record are the Huronian ice ages. At least one of them constituted what geologists call a Snowball Earth event, when the planet's surface was entirely, or almost entirely, frozen. Interspersed with non-glacial periods, the ice ages occurred between 2.4 and 2.1 billion years ago, and probably resulted from changes in microscopic life."
- Same source: "The Huronian ice ages and non-glacial periods separating them likely lasted a total of 300 million years. Evidence suggests these glaciations reached equatorial regions at sea level."
- **Internal note:** 2.4–2.1 Ga is 300 million years, which is consistent.

### 3.6 Cryogenian Snowball Earth: ~720–635 Ma [PROXY; extent debated]
- Period bounds [CONSENSUS]: Cryogenian base ~720 Ma, Ediacaran base ~635 Ma (USGS 2018 and ICS 2024/12).
- CG-COLD: "Geologists have identified two glaciations during the Neoproterozoic: the Sturtian (about 720 to 660 million years ago) and the Marinoan (about 640 to 635 million years ago)." Also: "At least twice between 750 and 600 million years ago, Earth fell into a deep freeze."
- CG-COLD on the extent debate: "But just how complete the Neoproterozoic ice coverage was—whether it was a Snowball Earth or a Slushball Earth—remains an area of active research."
- CG-HOT, post-snowball hothouse: "temperatures rose significantly near the end of the Neoproterozoic, perhaps reaching a global average higher than 90° Fahrenheit. (Today's global average is lower than 60°F.)"
- Evidence: "Some of the best evidence is 'cap carbonates' lying directly over Neoproterozoic-age glacial deposits." A caption dates the Namibian diamictite "to 635 million years ago".
- **Discrepancy:** CG-HOT gives the Neoproterozoic window "between 600 and 800 million years ago". CG-COLD gives "between 750 and 600 million years ago". The chart gives ~720–~635.

### 3.7 Cambrian: base 538.8 ±0.6 Ma (ICS) / 541.0 ±1.0 (USGS)
- NPS Cambrian (updated January 22, 2025): "This locality reveals the presence of creatures originating from the 'Cambrian explosion'—an evolutionary burst of animal origins dating from 545 to 525 million years ago."
- Same page: "During Cambrian time, life was only common in the water. The land was barren".
- Climate: no Cambrian temperature or CO₂ number was found in a fetched accredited text. CG-HOT only lists the reference "Hearling … (2018). An early Cambrian greenhouse climate. Science Advances" (not fetched).

### 3.8 Five mass extinctions (NPS-MASS unless noted) [PROXY; % = fossil-record estimates]
| Event | Date as printed | Loss as printed | Cause as printed |
|---|---|---|---|
| End-Ordovician | "approximately 444 million years ago" | "about 86% of species, 57% of genera, and 27% of taxonomic families" | "related to an episode of rapid glaciation and its abrupt retreat on the supercontinent Gondwana… The glaciation lowered global sea level" |
| Late Devonian | "The most critical event occurred about 372 million years ago" | "75% of species, 35% of genera, and 19% of taxonomic families" | "not very clear… global cooling, volcanic activity, an impact by a comet or other extraterrestrial object, and an overabundance of nutrients" |
| End-Permian | "approximately 251.9 million years ago" | "96% of species, 56% of genera, and 57% of taxonomic families" | "Massive volcanic eruptions of flood basalts in Siberia are thought to be the triggering cause" |
| End-Triassic | "about 200 million years ago" | "an estimated 80% of species, 47% of genera, and 23% taxonomic families" | "The major cause is thought to have been the opening of the Atlantic Ocean as the supercontinent Pangea broke up" |
| End-Cretaceous (K-Pg) | "66 million years ago" | "76% of species, 40% of genera, and 17% of taxonomic families" | "An asteroid impact that formed the Chicxulub crater in the Yucatan caused instantaneous climate change and plunged Earth into darkness." |

- **Siberian Traps LIP:** USGS news release, "Subsurface Magma Triggers Earth's Most Severe Extinction", Office of Communications, July 31, 2017. https://www.usgs.gov/news/national-news-release/subsurface-magma-triggers-earths-most-severe-extinction
  - "The most biologically severe of the extinction events, which occurred at the end of the Permian Period (about 252 million years ago), is thought to have been triggered by greenhouses gases generated from the Siberian Traps LIP, which erupted at the same time." [sic "greenhouses"]
  - Also: "subsurface sill emplacement as the deadly LIP sub-interval". The release names lead author Seth Burgess, USGS geologist; bio not verified.
- **Permian–Triassic and Triassic–Jurassic causes:** NPS-EXT says "The mass extinctions that closed the Permian and Triassic are thought to have occurred due to enormous volcanic eruptions venting gases into the air and causing rapid global warming and changes to the oceans."
- **Chicxulub size discrepancy (both NPS):**
  - NPS-MASS: "The asteroid was an estimated 6–12 miles (10–20 km) in diameter, formed a crater nearly 120 miles (190 km) wide."
  - NPS-EXT: "an asteroid probably 6 to 10 miles across… its structure, more than 90 miles across". NPS-EXT also names the Deccan Traps and sea-level fall as contributing factors.
- **End-Permian discrepancies:**
  - Permian page: "more than half (53%) of all taxonomic families… 95% of all species". NPS-MASS: 96% species, 57% families.
  - USGS: "about 252 million years ago".
- **K-Pg date discrepancy:** the USGS 2017 release says the dinosaur extinction was "about 65 million years ago". NPS and the charts give 66.0.
- **Ordovician evidence (NPS Ordovician page):** "Evidence for this glaciation is provided by glacial deposits in the Saharan Desert."

### 3.9 Cretaceous greenhouse [PROXY + MODEL]
- CG-HOT: "One spike was the Cretaceous Hot Greenhouse roughly 92 million years ago, about 25 million years before Earth's last dinosaurs went extinct."
- Same source: "Temperatures were so high that champsosaurs (crocodile-like reptiles) lived as far north as the Canadian Arctic, and warm-temperature forests thrived near the South Pole."
- Same source: "PhanDA … did not find a similarly strong link [temperature–CO₂] during the age of the dinosaurs. So, the precise cause of the Cretaceous Hot Greenhouse will need continued research". The brackets are mine; quote it without them in the app.
- Phanerozoic overview [MODEL, data assimilation]: "Preliminary results released in 2019 showed warm temperatures dominating most of that time, with global temperatures repeatedly rising above 80°F and even 90°F". PhanDA is Judd et al. 2024, Science, doi 10.1126/science.adk3705. That DOI is cited by NOAA; it was not fetched (Science/AAAS).
- **Discrepancy:** the CG-HOT animation caption says "the Cretaceous Hothouse, 100 million years ago". The text says "roughly 92 million years ago".
- No Cretaceous CO₂ number was found in an accredited fetched source.

### 3.10 Paleocene–Eocene Thermal Maximum: ~56 Ma
- CG-HOT [PROXY]: "the PETM saw average global surface temperature rise about 6°C (11°F) in less than 10 millennia."
- Same source, further down [PROXY]: "During the PETM, the global mean temperature appears to have risen by as much as 5-8°C (9-14°F) to an average temperature as high as 34°C (93°F)."
- Same source on CO₂: "a massive release of carbon dioxide into the atmosphere, at least doubling or possibly even quadrupling the background concentrations."
- **Internal note:** "about 6°C" and "as much as 5-8°C" both appear in the same article. Show the 5–8 °C range with "about 6 °C" as the central figure.
- Inglis et al. 2020 [PROXY + MODEL, multi-method]:
  - Citation: Inglis, G. N., Bragg, F., Burls, N. J., Cramwinckel, M. J., et al. (2020). Global mean surface temperature and climate sensitivity of the early Eocene Climatic Optimum (EECO), Paleocene–Eocene Thermal Maximum (PETM), and latest Paleocene. *Climate of the Past* 16, 1953–1968. DOI **10.5194/cp-16-1953-2020** (Crossref-verified). CC BY 4.0. https://cp.copernicus.org/articles/16/1953/2020/
  - Abstract: "the average GMST estimate (66 % confidence) during the latest Paleocene, PETM, and EECO was 26.3 °C (22.3 to 28.3 °C), 31.6 °C (27.2 to 34.5 °C), and 27.0 °C (23.2 to 29.7 °C), respectively."
  - The same abstract dates the PETM "(PETM; 56 Ma)".
  - Implied PETM warming, latest Paleocene → PETM: 31.6 − 26.3 = 5.3 °C. This is a computed difference, not printed, so do not display it as a quote.
- Early Eocene [PROXY/MODEL], from NOAA NCEI "Climate Change in the Context of Paleoclimate" (2022): "The Early Eocene Period, about 54 to 48 million years ago, stands out as distinctly warmer than today, particularly at high latitudes. The global surface temperature was 9° to 14°C higher than today, and carbon dioxide levels were very high, between 1,000 to 2,000 parts per million (levels in 2021 were 414.27 parts per million)."
  - **Discrepancy:** Inglis et al. 2020 give EECO "∼10 to 16 °C warmer than pre-industrial, higher than the estimate given by the … IPCC 5th Assessment Report (9 to 14 °C higher than pre-industrial)".

### 3.11 Eocene–Oligocene transition / Antarctic glaciation: ~34 Ma [PROXY + MODEL]
- Hutchinson et al. 2021:
  - Citation: Hutchinson, D. K., Coxall, H. K., Lunt, D. J., Steinthorsdottir, M., et al. (2021). The Eocene–Oligocene transition: a review of marine and terrestrial proxy data, models and model–data comparisons. *Climate of the Past* 17, 269–315. DOI **10.5194/cp-17-269-2021** (Crossref-verified). CC BY 4.0. https://cp.copernicus.org/articles/17/269/2021/
  - Abstract: "The Eocene–Oligocene transition (EOT) was a climate shift from a largely ice-free greenhouse world to an icehouse climate, involving the first major glaciation of Antarctica and global cooling occurring ∼34 million years ago (Ma) and lasting ∼790 kyr."
  - CO₂ [MODEL–data]: "We find that CO₂ forcing involving a large decrease in CO₂ of ca. 40 % (∼325 ppm drop) provides the best fit to the available proxy evidence". The authors caveat it: "should be considered an upper estimate and perhaps artificially large".
  - Causes: "The two principal suggested explanations of this transition are a decline in atmospheric CO₂ and changes to ocean gateways, while orbital forcing likely influenced the precise timing of the glaciation."
- CG-COLD: "About 50 million years ago, the planet was too warm for polar ice caps, but Earth has mostly been cooling ever since. Starting about 34 million years ago, the Antarctic Ice Sheet began to form. This might be down to South America separating from Antarctica, opening up the Drake Passage."
- Boundary: Oligocene base is 33.9 Ma (ICS 2024/12) or 34.09 Ma (USGS 2018).
- Isthmus of Panama (CG-COLD): "The Isthmus of Panama, the land bridge between North and South America, formed about 4.5 million years ago."

### 3.12 Pleistocene ice ages: 2.58 Ma–11.7 ka
- Boundary [CONSENSUS]: base of Pleistocene/Quaternary 2.58 Ma (USGS, ICS).
- CG-COLD [EDU, rounded]: "this ice age started about 2.6 million years ago and lasted until roughly 11,000 years ago." Also: "In fact, we are technically still in an ice age. We're just living out our lives during an interglacial."
- Cycles (CG-COLD): "they waxed and waned over timescales of about 20,000 to 100,000 years, due partly to Milankovitch Cycles."
- NPS Quaternary: "The Quaternary Period is famous for the many cycles of glacial growth and retreat, the extinction of many species of large mammals and birds, and the spread of humans."
- Glacial–interglacial CO₂ coupling (NCEI 2022): "when the concentration of carbon dioxide in the atmosphere increases, temperature increases along with it—and vice versa. These values may rise and fall over 100,000 year periods". The figure uses EPICA Dome C, Jouzel et al. 2007 and Lüthi et al. 2008.
- Last Interglacial (NCEI 2022) [PROXY]: "Penultimate Interglacial Period about 125,000 years ago. Based on proxy evidence, the global mean annual surface temperature appeared to be higher than pre-industrial by about 1° to 2°C".

### 3.13 Last Glacial Maximum: ~20 ka
- CG-COLD [PROXY/EDU]: "The latest ice age peaked about 20,000 years ago, when global temperatures were likely about 10°F (5°C) colder than today."
- Same source: "Roughly 20,000 years ago, during the Last Glacial Maximum of the Pleistocene Ice Age, ice spread over much of North America and Eurasia."
- **Sea level:** NPS Quaternary [EDU]: "In some places, ice sheets were two miles (3 km) thick. With so much water locked up in the form of ice, sea level dropped to about 430 feet (130 m) below current levels."
  - This is printed for the Pleistocene glacial maximum generally and does not name the LGM.
  - **The brief's "~120 m" was NOT found verbatim in any accredited, fetchable source.** Use NPS "about 430 feet (130 m)" or leave it out. The NCEI Barbados dataset (Fairbanks 1990, doi 10.25921/r5ts-qc15) is a data record and prints no summary depth.
- Deglaciation (CG-HOT): "when the Earth thawed out of its most recent glacial period between 17,500 and 11,500 years ago."

### 3.14 Holocene: 11.7 ka
- Boundary [CONSENSUS]: USGS 0.0117 Ma. ICS Greenlandian/Holocene base 0.0117 Ma, with stages Northgrippian 0.0082 and Meghalayan 0.0042.
- CG-HOT caption: "the Holocene, which spans the past 11,700 years".
- NPS Quaternary: "Marked climatic warming and the disappearance of the continental glaciers mark the transition between the Pleistocene and Holocene." Also: "the present Holocene Epoch may be another interglacial stage".
- Mid-Holocene (NCEI 2022): "The Mid-Holocene Warm Period, observed about 6,000 years ago, was generally warmer than today during summer in the Northern Hemisphere."
- Anthropocene: no formal status (USGS 2018, quoted in §1a).
- Modern rates (CG-HOT, observation): "Since 1850, global surface temperatures have risen roughly 0.11°F (0.06°C) per decade. Since 1982, they have risen 0.36°F (0.20°C) per decade."

### 3.15 Plate tectonics and Pangaea
- USGS, *This Dynamic Earth: the Story of Plate Tectonics*, "Historical perspective". https://pubs.usgs.gov/gip/dynamic/historical.html, page last modified July 11, 2025. Public domain.
  - "According to the continental drift theory, the supercontinent Pangaea began to break up about 225-200 million years ago, eventually fragmenting into the continents as we know them today."
  - Also: Wegener "contended that, around 200 million years ago, the supercontinent Pangaea began to split apart."
- NPS Permian: "During the Permian Period, Earth's crustal plates formed a single, massive continent called Pangaea." Also: "all the world's landmasses were joined into a single continent that spread from pole to pole."
- NPS Ordovician: "The eventual result was the supercontinent Pangaea ('all land'), stretching from pole to pole by Permian time."
- NPS time-scale page: "supercontinent Pangaea and Tethys Ocean (Pennsylvanian-Permian)". NPS Triassic: "Pangaea began to break apart during the Triassic but dispersed mostly during the Jurassic."
- NPS Proterozoic: "During the Proterozoic Eon, modern plate tectonics became active".
- **The brief's "~335–175 Ma" span was NOT found in any accredited fetched source.** Best sourced framing: assembled by the Pennsylvanian–Permian (base of Pennsylvanian 323.2 ±0.4 Ma USGS / 323.4 ±0.4 ICS); breakup began about 225–200 Ma (USGS).

---

## NOT FOUND / gaps
1. **LGM sea level "~120 m"**: not found verbatim in an accredited source. NPS gives "about 430 feet (130 m)" for the Pleistocene. No NOAA/USGS/NASA summary page with 120 m was fetched.
2. **Pangaea "~335–175 Ma"**: not found. USGS gives breakup "about 225-200 million years ago". NPS says it formed by the Permian (assembly Pennsylvanian–Permian).
3. **O₂ levels** (GOE % PAL), **Cretaceous CO₂**, and **Cambrian temperatures/CO₂**: no accredited openly readable figures were found. NCEI gives Early Eocene CO₂ of 1,000–2,000 ppm only.
4. **Faint young Sun**: the only date-linked figure is NASA's "Three billion years ago … 70% as bright". No luminosity-versus-time series.
5. **ICS chart licence**: the chart prints "(c) International Commission on Stratigraphy"; no CC BY was found. Use the numbers with citation and do not copy the graphic.
6. **Smithsonian** (naturalhistory.si.edu) disallows ClaudeBot and was not used. The PhanDA paper (Science) and the Hoffman Snowball pages were not fetched.
7. **NASA Earth Observatory paleoclimatology series** was not used (EO redirected to science.nasa.gov). NCEI pages cover the proxies.
8. **Author bios**: none verified on official pages ("bio: not verified" for Scott, Lindsey, Gronstal, Burgess, Apodaca, Hutchinson, Inglis).
