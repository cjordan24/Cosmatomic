# SOURCE NOTES — Phase 25A: Environmental sandbox (planet builder + regional lab)

Research date: 2026-11-28. Rules: /tmp/vv-research/p24/RULES.md. Raw files: /tmp/vv-research/p25/a/.
User-Agent: `VoyagerVentures-Research/0.1 (educational; respects robots.txt)`; ≥1.2 s between requests per host (15 s for arxiv.org per its Crawl-delay).
Scope: one authoritative open source per simplified model (equation/relation, assumptions, validity), verbatim.

Data-kind labels: **[OBS]** observation / **[MODEL]** model output / **[ASSESS]** expert assessment / **[EDU]** educational simplification / **[THEORY]** analytic theory.

## Robots / terms log

| Host | robots.txt result (fetched first) | Decision |
|---|---|---|
| brian-rose.github.io | HTTP 404 (no robots.txt) | allowed; content CC BY 4.0 |
| atmos.uw.edu | 200; `User-agent: *` → `Disallow: /wp-admin/` only; long bad-bot list (CCBot, GPTBot, ChatGPT-User banned; our UA not listed) | allowed for /academics/ |
| www.gfdl.noaa.gov | `Disallow: /wp-admin/`, `/cms-filesystem-action/`, `/reference/` | allowed |
| science.nasa.gov | `User-agent: *` / `Allow: /` | allowed |
| earthobservatory.nasa.gov | robots 301 → science.nasa.gov/earth/earth-observatory/ | read via science.nasa.gov |
| www.earthdata.nasa.gov / mynasadata.larc.nasa.gov | Drupal default | allowed |
| scied.ucar.edu | Drupal default | allowed |
| www.e-education.psu.edu / courses.ems.psu.edu | Drupal default | allowed (content CC BY-NC-SA 4.0) |
| www.climate.gov | Drupal default | allowed (not needed in the end) |
| www.nps.gov | `Disallow: /ns/`, `/search/`, `loader.cfm` | allowed |
| www.usgs.gov | Drupal default | allowed (not needed) |
| www.weather.gov | robots.txt → 404 (HTML page) | allowed (not needed) |
| sci.esa.int | 200, empty file | allowed |
| arxiv.org | `Crawl-delay: 15`; `Allow: /abs`, `/pdf` | allowed (abs + one pdf, 16 s apart) |
| nssdc.gsfc.nasa.gov | disallows /cgi-bin/, /nmc/t, /nmc/masterCatalog, … ; `/nmc/` for gsfcbot | /planetary/factsheet/ allowed (coordinator-approved) |
| ntrs.nasa.gov | `User-agent: *` / `Allow: /` | allowed |

Off-limits hosts were not touched (no Wikipedia, IPCC, Wiley host, AMS journals, Nature, AOML, JetStream, OpenStax, LibreTexts, Springer, ADS, ncbi). Search results pointing to them were ignored.

---

## 1. Grey-atmosphere greenhouse model

### 1a. Rose, *The Climate Laboratory*, "Elementary greenhouse models" (primary; CC BY 4.0)

- Citation: Rose, Brian E. J., *The Climate Laboratory: A hands-on approach to climate physics and climate modeling*, University at Albany (SUNY). DOI 10.5281/zenodo.4265097 (Zenodo/DataCite DOI as printed on the page; not in Crossref). Chapter "Elementary greenhouse models".
- URL: https://brian-rose.github.io/ClimateLaboratoryBook/courseware/elementary-greenhouse/ (raw: rose_greenhouse.html, rose_greenhouse_tex.txt).
- Licence: "Content License: Creative Commons Attribution 4.0 International (CC-BY-4.0)"; "It is licensed for free and open consumption under the Creative Commons Attribution 4.0 International (CC BY 4.0) license."
- Author: Brian E. J. Rose, University at Albany; bio: not verified (page states "Brian Rose is the principle developer of climlab as well as the author of this book"). Supported by NSF award AGS-1455071 (as stated).
- Kind: **[EDU]/[THEORY]** — analytic radiative-equilibrium model.

Assumptions (Sect. 1 "A single layer atmosphere", verbatim list):
- "Atmosphere is a single layer of air at temperature T_a"
- "Atmosphere is completely transparent to shortwave solar radiation."
- "The surface absorbs shortwave radiation (1−α)Q"
- "Atmosphere is completely opaque to infrared radiation"
- "Both surface and atmosphere emit radiation as blackbodies (σT_s⁴, σT_a⁴)"
- "Atmosphere radiates equally up and down (σT_a⁴)"
- "There are no other heat transfer mechanisms"

Equations (Sect. 1, eqs. 4–7):
- Eq. (4): "½ σ T_s⁴ = (1−α) Q"; Eq. (5): "(1−α) Q = σ T_e⁴"
- "In fact, in this model, T_e is identical to the atmospheric temperature T_a, since all the OLR originates from this layer."
- Eq. (6): "Solve for the surface temperature: T_s = 2^(1/4) T_e"
- Eq. (7): "Putting in observed numbers, T_e = 255 K gives a surface temperature of T_s = 303 K"
- Validity: "Our model now overpredicts the surface temperature by about 15ºC (303 K versus the observed 288 K)." Reasons listed: "Atmosphere absorbs some solar radiation." "Atmosphere is NOT a perfect absorber of longwave radiation" "Absorption and emission varies with wavelength (atmosphere does not behave like a blackbody)." "Emissions are not determined by a single temperature T_a but by the detailed vertical profile of air temperture." "Energy is redistributed in the vertical by a variety of dynamical transport mechanisms (e.g. convection and boundary layer turbulence)."
- Grey gas definition (Sect. 2): "This is called the grey gas model, where grey here means the emission and absorption have no spectral dependence (same at every wavelength). We can think of this model informally as a "leaky greenhouse"." Summary: "The grey gas model assumes that each layer absorbs and emits a fraction ϵ of its blackbody value, independent of wavelength." "For an isothermal atmosphere the radiative forcing is zero and there is no greenhouse effect".

### 1b. N-layer extension — Univ. of Washington ATMS 211 lecture notes (no licence stated)

- Citation: "How to calculate the earth's effective temperature", lecture notes for 10 Jan 2001 (ATMS 211, Winter 2001), Dept. of Atmospheric Sciences, University of Washington. Author not named on page (bio: not verified). No licence stated (default copyright → quote briefly with attribution).
- URL: https://atmos.uw.edu/academics/classes/2001Q1/211/notes_for_011001_lecture.html (raw: uw_211.html / uw_211.txt).
- Kind: **[EDU]**.
- Single layer: "the total radiation emitted from the surface of the planet (E + E/2 + E/4 + E/8 + E/16......) is going to add up to 2E" … "the absolute temperature of the surface (in deg K) will have to be warmer by a factor of 1.19 (the fourth root of 2). The temperature of the atmosphere will be the same as the effective temperature of the planet."
- Multi-layer (verbatim): "Suppose that we pile on another perfectly absorbing layer on top of the one that we've already considered. Using the short cut we infer that the radiation emitted from the top layer of the atmosphere must still be E; the radiation emitted upward from the bottom layer of the atmosphere must be equal to 2E and the radiation emitted from the surface must be 3E. It's not difficult to extend this simple analysis to additional layers."
- → Surface emission (N+1)E, i.e. T_s = (N+1)^(1/4) T_e, is the stated pattern for N = 1, 2 ("2E", "3E"); the general formula itself is NOT printed — app may show "N layers → surface emits (N+1)E" only as an extension of the quoted pattern; label it as such.
- Limitations (verbatim): "1) It's assumed that the atmosphere is isothermal." … "2) It's assumed that the atmosphere absorbs all the outgoing radiation at all wavelengths in the infrared part of the electromagnetic spectrum." … "3) Radiative transfer isn't the only process by which energy escapes from the earth's surface. Conduction of heat and evaporation of water transfer about twice as much energy from the earth's surface to the atmosphere as the net upward flux of infrared radiation from the radiation does. If the temperature distribution on earth were determined only by radiative transfer (as in this example) the earth would be so hot as to be uninhabitable."
- Also: "1368 / 4 = 342 watts per square meter." "342 x 0.7 = 239.4 watts per square meter." "The calculated result is 255. … this is 255 K (-18 C, 0 F)."

### 1c. Optical-depth form T_s⁴ = T_e⁴(1 + 3τ/4) — NOT FOUND in an allowed, appropriate source (only stellar-atmosphere lecture notes surfaced). See gaps.

---

## 2. Daily-mean TOA insolation vs latitude, declination, distance

- Source: Rose, *The Climate Laboratory*, chapter "Insolation", Sect. 1. URL https://brian-rose.github.io/ClimateLaboratoryBook/courseware/insolation/ (raw: rose_insolation.html, rose_insolation_tex.txt). CC BY 4.0 (as 1a). Page credits figure "reproduced from Hartmann (1994)" and spherical geometry "(see Appendix A of Hartmann's book)".
- Kind: **[THEORY]** (exact geometry; point-source Sun, no atmosphere).

Verbatim:
- Eq. (1): "Q = S_0 (d̄/d)² cos θ_s" "where d̄ is the mean distance for which the flux density S_0 (i.e. the solar constant) is measured, and d is the actual distance from the sun."
- Declination: "the latitude of the point on the surface of Earth directly under the sun at noon (denoted by δ). δ currenly varies between +23.45º at northern summer solstice (June 21) to -23.45º at northern winter solstice (Dec. 21)."
- Hour angle: "The hour angle h is defined as the longitude of the subsolar point relative to its position at noon."
- Eq. (2): "cos θ_s = sin φ sin δ + cos φ cos δ cos h"
- Eq. (3): "Sunrise and sunset occur when the solar zenith angle is 90º and thus cos θ_s = 0. The above formula then gives cos h_0 = − tan φ tan δ where h_0 is the hour angle at sunrise and sunset."
- Polar day/night: "Latitudes poleward of 90º- δ are constantly illuminated in summer, when φ and δ are of the same sign." … "In the winter, φ and δ are of opposite sign, and latitudes poleward of 90º- |δ| are in perpetual darkness." (Page then has a typo: "six months of daylight alternate with six months of daylight" — do not quote that sentence.)
- Eq. (4) "valid only during daylight hours, |h| < h_0, and Q=0 otherwise (night)."
- Eq. (7): "Q̄^day = (S_0/π) (d̄/d)² ( h_0 sin φ sin δ + cos φ cos δ sin h_0 )" "where the hour angle at sunrise/sunset h_0 must be in radians."
- Implementation note in page: climlab function `daily_insolation` "implements the above formulas".
- App note: when −tanφ tanδ < −1 (polar day) set h_0 = π; when > +1 (polar night) h_0 = 0 — this is the standard clamp implied by the quoted polar-day/night statements; not printed as a formula.

---

## 3. Surface albedo table

### 3a. Penn State EARTH 103 "Albedo" table (primary table; CC BY-NC-SA 4.0)
- Citation: "Albedo", EARTH 103: Earth in the Future, John A. Dutton e-Education Institute, College of Earth and Mineral Sciences, Pennsylvania State University. URL https://www.e-education.psu.edu/earth103/node/1002 (raw: psu_earth103_1002.html). Course author (figure credit on page): David Bice; bio: not verified. Licence: "Unless otherwise noted, this site is licensed under a Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License". Kind **[EDU]** (representative values; source of table values not stated).
- Table "Albedo of Earth Materials", header "Substance | Albedo (% reflectance)" — NB values are printed as fractions despite "%" header:
  - "Whole Planet 0.31"; "Cumulonimbus Clouds 0.9"; "Stratocumulus Clouds 0.6"; "Cirrus Clouds 0.5"
  - "Water 0.06 - 0.1"; "Ice & Snow 0.7 - 0.9"; "Sand 0.35"; "Grass lands 0.18 - 0.25"
  - "Deciduous forest 0.15 - 0.18"; "Coniferous forest 0.09 - 0.15"; "Rain forest 0.07 - 0.15"
- Validity (verbatim): "Most of these albedos are sensitive to the angle at which the sunlight hits the surface; this is especially true for water. When the Sun is at angles of 40° and higher relative to the horizon, the albedo of the water is fairly constant, but as the angle decreases from 40°, the albedo increases dramatically so that it is about 0.5 at a Sun angle of 10° and 1.0 at a sun angle of 0°."
- Licence caveat: NC-SA — fine for a non-commercial educational app only; flag to coordinator.

### 3b. Cross-checks (US gov / NCAR, public)
- NASA Earthdata "Albedo" topic page, https://www.earthdata.nasa.gov/topics/land-surface/albedo (raw: earthdata_albedo.html): "Fresh snow can have an albedo up to 0.9, meaning that it reflects 90% of the sunlight that hits it. On the other end of the scale, the open ocean tends to have an albedo lower than 0.1, absorbing more than 90% of incoming sunlight and reflecting less than 10%." "Land surfaces with higher albedos include snow, ice, and deserts, while urban areas and forests have lower albedos." [EDU] (A search snippet attributed 0.85 to a different Earthdata cryosphere page — not fetched; record as possible disagreement, unverified.)
- UCAR Center for Science Education, "Albedo and Climate", https://scied.ucar.edu/albedo-and-climate (raw: ucar_albedo.html): "Forests, for example, have an albedo of about 15%, which means that 15% of the sunlight that hit a forest is reflected out to space. Fresh snow, on the other hand, can have an albedo of 90%" … "Earth's planetary albedo is about 31%". [EDU]
- Agreement: forest ~0.15 (UCAR) within PSU deciduous 0.15–0.18; fresh snow 0.9 (NASA, UCAR) = top of PSU "Ice & Snow 0.7 - 0.9"; ocean <0.1 (NASA) vs PSU water 0.06–0.1 vs our NSIDC 0.06 — consistent.

---

## 4. Tropical cyclones and SST

### 4a. SST threshold — NASA Earth Observatory
- Citation: "Hurricanes: The Greatest Storms on Earth", NASA Earth Observatory, Nov 01, 2006 (now at https://science.nasa.gov/earth/natural-disasters/hurricanes-typhoons/hurricanes-the-greatest-storms-on-earth/; raw nasa_hurricanes.html). Author not shown in extracted text (bio: not verified). NASA content, public domain unless noted (images credited separately). Kind [EDU].
- "Hurricanes form over tropical waters (between 8 and 20 degrees latitude) in areas of high humidity, light winds, and warm sea surface temperatures [typically 26.5 degrees Celsius (80 Fahrenheit) or greater]."
- "If the storm is far enough from the equator (generally at least 8 degrees of latitude), the deflection or curvature is great enough that the air starts spinning counterclockwise around the center of the storm."
- Intensity vs SST (dated 2006): "Models based on scientists' current understanding of hurricanes suggest that if ocean temperatures increased by 2-2.5 degrees, the average intensity of hurricanes would increase by 6 to 10 percent. Since 1970, the average ocean temperature has warmed about half a degree, which means that theoretically, storms could be one to three percent stronger."
- Corroboration: NPS "Tropical Storm Development", https://www.nps.gov/articles/tropical-storm-development.htm: "Sea temperatures of at least 80°F (26.5°C) are required to spawn hurricanes."

### 4b. Intensity sensitivity — NOAA GFDL "Global Warming and Hurricanes"
- Citation: Knutson, T., "Global Warming and Hurricanes: An Overview of Current Research Results", NOAA/GFDL. URL https://www.gfdl.noaa.gov/global-warming-and-hurricanes/ ; "Last Revised: Nov. 20, 2024". "This site authored and maintained by: Tom Knutson, Senior Scientist, NOAA/GFDL". Caveat on page: "Any views expressed here are the author's and do not represent official views of NOAA or the U.S. government." US gov work. Kind [ASSESS]/[MODEL].
- Section 6 (early GFDL research): "For hurricane wind speeds, our model shows a sensitivity of about 4% per degree Celsius increase in tropical sea surface temperatures, with a larger percentage increase in near-storm rainfall." (Knutson & Tuleya study; "An increase of intensity of about one-half category on the Saffir-Simpson scale was simulated for an 80 year build-up of atmospheric CO2 at 1%/yr (compounded).")
- Current summary: "Tropical cyclone intensities globally are projected to increase ( medium to high confidence ) on average (by 1 to 10% according to model projections for a 2 degree Celsius global warming)." and "Existing studies suggest a tropical cyclone windspeed increase of about 1-10% and a tropical cyclone precipitation rate increase of about 14% (+6 to +22%) for a 2 degree Celsius global warming scenario." "… the rate at which water vapor increases in the atmospheric with climate warming (7% per degree Celsius SST warming)".
- Potential-intensity theory mentioned only qualitatively: "The average intensity of the storms that do occur increases by a few percent (Figure 6), in general agreement with … hurricane potential intensity theory (Emanuel 1987)."
- NB: 4%/°C is per °C of tropical SST; 1–10% is per 2 °C global warming — different bases; do not merge.
- NCA5 Ch. 2 (local file, PDF page 20): "Tropical cyclones have been intensifying more rapidly since the early 1980s" — no SST threshold or %/°C there.

---

## 5. Rain shadow / orographic lifting

- **NPS, Joshua Tree NP, "Deserts"**, https://www.nps.gov/jotr/learn/nature/deserts.htm, "Last updated: February 28, 2022" (raw nps_jotr_deserts.html). US gov, public domain. [EDU]
  - "The area of southeastern California is a rain shadow desert. The rain shadow effect is produced by the high mountains on the west, which block the movement of wet winter storms. As coastal storms move in from the west they collide with Mount San Jacinto (10,804 ft.) and Mount San Gorgonio (11,502 ft.). The air rises, cools, and precipitation falls on the mountains. By the time the air moves over the mountains to the desert, there is little moisture left."
- **NPS, Olympic NP, "Weather"**, https://www.nps.gov/olym/planyourvisit/weather.htm, "Last updated: November 10, 2026" (raw nps_olym_weather.html) — worked numeric example:
  - "As storms from the Pacific Ocean move across the peninsula, they encounter a very large obstacle: the Olympic Mountains. In order to reach the other side of these towering peaks, moisture must be released. As a result, the western portion of the park experiences much higher levels of precipitation than eastern locations, creating a rain shadow effect. Annual precipitation ranges from 100-170 inches of rain along the coast and western-facing valleys." … "Hurricane Ridge traditionally records 30-35 feet of snow a year."
  - "By the time any storm cells pass the Olympic Mountains, most of the moisture has been released. … Located in Port Angeles, the Olympic National Park Headquarters only averages 25-30 inches a year."
  - (Same page, winter section, contains a garbled phrase "the rain forests and coast average 140-100 inches of rain respectively" — avoid.)
- **NPS, Olympic NP, "Weather Brochure"**, https://www.nps.gov/olym/planyourvisit/weather-brochure.htm, "Last updated: November 9, 2021" (raw nps_olym_brochure.html):
  - "the mountains force clouds upward. As the air gets colder and air pressure decreases, these storm clouds cannot hold as much moisture and the water falls as rain in the lowlands and snow in the high country." "The Hoh Rain Forest records an average of almost 12 feet (3.6 meters) of rain every year. Mount Olympus, the Peninsula's highest point at 7,980 feet (2,432 meters), is estimated to get over 50 feet (18 meters) of snow!" "The northeastern parts of the Olympic Peninsula lie in a dry rain shadow. The town of Sequim gets roughly 16 inches (41 cm) of rain a year." "… less than 35 miles (56 km) from lush temperate rain forests!"
  - Note: "50 feet (18 meters)" — 50 ft ≈ 15 m; printed conversion disagrees; record both, avoid the metric figure.
- Lapse-rate (dry/moist adiabatic, °C/km) worked example for föhn warming: NOT FOUND in an allowed source this pass.

---

## 6. Rotation rate and atmospheric circulation

### 6a. Showman, Wordsworth, Merlis & Kaspi (2013) — review (preprint copy on arXiv)
- Citation: Showman, A. P., Wordsworth, R. D., Merlis, T. M., Kaspi, Y.: "Atmospheric Circulation of Terrestrial Exoplanets", in *Comparative Climatology of Terrestrial Planets* (S. Mackwell, M. Bullock, J. Harder, eds.), Univ. of Arizona Press, 2013. Book DOI 10.2458/azu_uapress_9780816530595-ch12 (verified via Crossref). Read from arXiv:1306.2418v1 (11 Jun 2013), "Invited review, in press" — **preprint/accepted version**; licence: arXiv non-exclusive distribution licence (not CC) → quote briefly with citation. PDF text layer read (born-digital). Raw arxiv_1306.2418.pdf/.txt. Bios: not verified. Kind [THEORY]/[MODEL] (idealized GCMs).
- p. 2: "This can be quantified by the Rossby number, Ro = U/fL, defined as the ratio between advection forces and Coriolis forces in the horizontal momentum equation. Here, U is a characteristic horizontal wind speed, f = 2Ω sin φ is the Coriolis parameter, L is a characteristic horizontal scale of the flow (∼10³ km or more for the global-scale flows considered here), Ω is the planetary rotation rate (2π over the rotation period), and φ is the latitude."
- p. 2: "In Earth's atmosphere, the regime of Ro ≳ 1 approximately coincides with the tropics, occurring equatorward of ∼20–30° latitude, whereas the regime of Ro ≪ 1 approximately coincides with the extratropics, occuring poleward of ∼30° latitude." (≳ symbol lost in text layer; reading from context.)
- p. 3 Fig. 1 caption: "the transition occurs at higher latitudes when the rotation period is longer, and terrestrial planets with rotation periods longer than ∼10 Earth days may represent "all tropics" worlds".
- p. 3: "for Earth-like planetary radii, gravities, and incident stellar fluxes, planets exhibit Ro ≳ 1 everywhere when the rotation period exceeds ∼10 Earth days (e.g., Del Genio and Suozzo 1987)" … "Venus and Titan are examples in our own solar system, exhibiting near-global Hadley cells, minimal equator-pole temperature differences, little role for baroclinic instabilities, and a zonal jet structure that differs significantly from those on Earth and Mars."
- p. 15 (multiple jets): "When a planet is small, like Earth or Mars, only one strip of baroclinic instabilities—and one eddy-driven jet—can fit into the baroclinic zone … When the planet is relatively large relative to the eddy size, however, the baroclinic zone breaks up into multiple bands of baroclinic instability, and hence multiple jet streams. … a case at four times the Earth rotation rate … the deformation radius is four times smaller, and the baroclinic zone breaks up into three jets in each hemisphere."
- p. 17: "At sufficiently low rotation rates …, the Hadley circulation is nearly global, extending from equator to pole in both hemispheres, with the subtropical jets peaking at latitudes of ∼60°." "At faster rotation rates …, the Hadley circulation—and the associated subtropical jets—become confined closer to the equator, and the higher latitudes develop an extratropical zone with baroclinic instabilities." "The resulting equator-to-pole temperature differences are small at slow rotation and increase with increasing rotation rate (Figure 12)."
- p. 18 Fig. 12 caption (Kaspi & Showman 2012 GCMs, rotation 1/16 to 4× Earth): "At slow rotation rates, the Hadley cells are nearly global, the subtropical jets reside at high latitude, and the equator-pole temperature difference is small. … At faster rotation rates, the Hadley cells and subtropical jets contract toward the equator, an extratropical zone, with eddy-driven jets, develops at high latitudes, and the equator-pole temperature difference is large."
- (p. 19 gives Held & Hou (1980) quartic θ profile, eq. 22; no closed-form Hadley width formula extracted cleanly — not used.)

### 6b. Titan (slow rotator) — ESA / NASA
- NASA, "The way the wind blows on Titan", https://science.nasa.gov/solar-system/the-way-the-wind-blows-on-titan/ (raw nasa_titan_wind.html): "This extraordinarily large 'cell' of rotating atmosphere circulates from the south pole to the north pole and back again and is the principal way in which Titan's atmosphere distributes its warmth." "Such a large Hadley cell is only possible on a slowly rotating world, such as Titan where one day equals 16 Earth days."
- ESA, "Cassini reveals Titan's atmosphere in reverse", 28 November 2012 (Last Update 1 Sep 2019), https://sci.esa.int/web/cassini-huygens/-/51176-cassini-reveals-titan-s-atmosphere-in-reverse ; "© European Space Agency. All rights reserved." (short quote only): "On Titan, the circulation is much simpler. In the lower atmosphere there may be three, or even fewer, cells compared to Earth's six, and higher up there is a single, global, Hadley cell in which gas flows directly from one pole to the other."

### 6c. Jupiter (fast rotator) — NASA
- NASA Science, "Jupiter Facts", https://science.nasa.gov/jupiter/jupiter-facts/ (raw nasa_jupiter_facts.html): "Jupiter's fast rotation – spinning once every 10 hours – creates strong jet streams, separating its clouds into dark belts and bright zones across long stretches." "Strong east-west winds moving in opposite directions separate the bands." "Researchers are still trying to solve the mystery of how the jet streams form." [EDU]

---

## 7. Climate sensitivity and forcing

### 7a. Formula — Rose, *The Climate Laboratory*, "Climate sensitivity and feedback" (CC BY 4.0)
- URL https://brian-rose.github.io/ClimateLaboratoryBook/courseware/sensitivity-feedback/ (raw rose_sensitivity-feedback.html). [THEORY/EDU]
- Sect. 4, Eq. (3): "We start with an initial radiative forcing, and get a response ΔT_0 = ΔR/λ_0"
- Eq. (15): "ΔT_2xCO2 = ΔR / (λ_0 − Σ_{i=1}^{N} λ_i)" "where λ_i = λ_0 f_i (16) known as climate feedback parameters, in units of W m⁻² K⁻¹. With this choice of sign conventions, λ_i > 0 for a positive feedback process."
- "Our no-feedback response parameter λ_0 is often called the Planck feedback." "The Planck feedback is about −3.2 W m⁻² K⁻¹ just like our above estimate of λ_0 (but with opposite sign convention -- watch carefully for that in the literature)"

### 7b. Assessed values — NCA5 Ch. 3 (local: /tmp/vv-research/p24/b/NCA5_Ch3_Earth-Systems.txt; US gov, public domain) [ASSESS]
- Key Message 3.2 (p. 3-10): "Recent improvements in the understanding of how climate feedbacks vary across timescales have narrowed the estimated likely range of warming expected from a doubling of atmospheric carbon dioxide by 50% to between 4.5°F and 7.2°F (high confidence)."
- p. 3-10: "This response is commonly characterized by the equilibrium climate sensitivity (ECS), defined as the change in global average surface temperature after the climate system reaches a steady state following a doubling of the atmospheric CO2 concentration." "ECS depends both on the ERF from a doubling of CO2 and the sum of climate feedbacks that can either amplify (a positive feedback) or dampen (a negative feedback) the temperature change." "Cloud feedbacks are the largest source of ECS uncertainty (Figure 3.2)."
- p. 3-11: "Recent assessments place ECS between 4.5°F and 7.2°F (2.5°C and 4.0°C), a 50% uncertainty reduction from previous assessments (Figure 3.3). It is virtually certain that ECS is greater than 2.7°F (1.5°C)".
- p. 3-6: "with increases in CO2 contributing an ERF of 2.16 ± 0.26 W/m2, followed by 0.54 ± 0.11 W/m2 from CH4, 0.41 ± 0.08 W/m2 from halogenated compounds, and 0.21 ± 0.03 W/m2 from N2O." (already used in Phase 24.)
- p. 3-36 (Traceable account) validity caveat: the historical-period estimate "is now thought to be an underestimate of the climate sensitivity for CO2 doubling because climate feedbacks are sensitive to the pattern of sea surface temperature warming".
- NB: NCA5 does not print ΔT = λΔF or F2x; the 2xCO2 forcing value (F2x) is NOT in the local NCA5 files → for ΔT = ECS·ΔF/F2x the app would need an F2x source (gap).

---

## 8. Titan preset

### 8a. NSSDCA Saturnian Satellite Fact Sheet
- Citation: Williams, D. R., "Saturnian Satellite Fact Sheet", NASA Goddard Space Flight Center (NSSDCA). URL https://nssdc.gsfc.nasa.gov/planetary/factsheet/saturniansatfact.html (raw nssdc_saturniansatfact.html/.txt). "Author/Curator: Dr. David R. Williams"; "Last Updated: 22 July 2025, DRW". US gov, public domain. Kind: compiled reference values.
- Bulk parameters table — the 0.22 column header is **"Visual geometric albedo"** (i.e. geometric, NOT Bond). Titan row: "Titan (VI) | 1,345.5 | 2,575 | 1880 | 0.22" under headers "Mass (10²⁰ kg) | Radius (km) | Mean density (kg/m³) | Visual geometric albedo".
- Orbital parameters table: headers "Semi-major axis (10³ km) | Semi-major axis (Saturnian Radii) | Orbital Period* (days) | Rotation Period (days) | Inclination (degrees) | Eccentricity". Titan row: "Titan (SVI) | 1,221.87 | 20.273 | 15.945421 | S | 0.33 | 0.0292".
- Footnote: "S indicates synchronous rotation - the rotation period is the same as the orbital period" → **Titan rotation synchronous; orbital period 15.945421 days.**
- (NASA Titan wind page above says "one day equals 16 Earth days" — consistent, rounded.)

### 8b. Titan Bond albedo — Creecy et al. 2021 (accepted manuscript on NTRS)
- Citation: Creecy, E. C., Li, L., Jiang, X., West, R. A., Fry, P. M., Nixon, C. A., Kenyon, M. E., Seignovert, B.: "Titan's Global Radiant Energy Budget During the Cassini Epoch (2004–2017)", *Geophysical Research Letters*, 48(23), 2021. DOI 10.1029/2021GL095356 (verified via Crossref; Crossref licence links = Wiley terms, i.e. not CC). Read from NTRS 20210024554 author manuscript PDF, https://ntrs.nasa.gov/api/citations/20210024554/downloads/21-96.pdf (NTRS: distribution PUBLIC, "MAY_INCLUDE_COPYRIGHT_MATERIAL"). Wiley host not accessed. Bios: not verified. Kind [OBS] (Cassini ISS/VIMS/CIRS).
- Manuscript p. 7, lines 143–149 (checked on rendered page image ntrs_titan_p_p7.jpg because ± signs drop from the text layer): "Figure 1 shows Titan's Bond albedo during the Cassini epoch. Titan's Bond albedo continuously decreased from 0.264±0.003 in 2004-05 to 0.252±0.002 in 2010 by a percentage change of 4.6±1.4%. After that, it increased from 0.252±0.002 in 2010 to 0.265±0.003 in 2017 by 5.2±1.4%."
- Licence caveat: copyrighted (AGU/Wiley) — cite numbers as facts with attribution; no long quotation.

---

## NOT FOUND / gaps

1. Optical-depth grey formula T_s⁴ = T_e⁴(1 + 3τ/4) — no allowed planetary-climate source found (only stellar-atmosphere lecture notes, which use different τ conventions). General (N+1)^(1/4) formula not printed anywhere fetched; UW notes give the N=1 (2E) and N=2 (3E) pattern "not difficult to extend".
2. Albedo: no single US-gov table with forest/grass/desert numbers; PSU table is CC BY-NC-SA (non-commercial). Desert sand only "Sand 0.35" (PSU). Fresh-snow 0.9 (NASA Earthdata, UCAR); possible 0.85 on another Earthdata page not verified.
3. Maximum potential intensity formula (Emanuel) vs SST — not obtained from an allowed open source (AMS journals off-limits); only GFDL "about 4% per degree Celsius" (model sensitivity) and NASA EO 2006 "6 to 10 percent" for 2–2.5 degrees.
4. Rain shadow: no NWS/USGS page with dry/moist adiabatic lapse rates or a föhn worked example; numbers available are NPS precipitation contrasts only.
5. Rotation: no closed-form Hadley-cell width vs Ω (Held–Hou φ_H) printed cleanly in fetched text; qualitative + "∼10 Earth days" threshold + 4× rotation → 3 jets only.
6. F2x (forcing for CO2 doubling) value not in local NCA5 texts; NOAA AGGI page not fetched.
