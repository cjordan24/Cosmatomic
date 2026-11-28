# Source notes: Phase 20C. Atmospheric motion, convection, clouds, water cycle

Research date: 2026-11-28. Raw files are in `/tmp/vv-research/p20/c/`. User-Agent: "VoyagerVentures-Research/0.1 (educational; respects robots.txt)". I waited at least 1.2 s between requests to each host.

## robots.txt / access log

| Host | robots.txt result | Used? |
|---|---|---|
| www.weather.gov | 404 (no robots file, so no restriction). **Every `/jetstream/*` URL redirects to www.noaa.gov/jetstream, which returns a CloudFront 403 "Request blocked".** | Yes, for the `/source/zhu/ZHU_Training_Page/` pages only |
| www.noaa.gov | 200, standard Drupal rules (no AI clauses). Requests to /jetstream got a CloudFront 403 bot block. | **STOPPED** (bot wall). NWS JetStream could not be used. |
| forecast.weather.gov | 404 (none) | Yes (NWS Glossary) |
| oceanservice.noaa.gov | 200: Disallow /cgi-bin/, /aaweekly/ | Yes |
| www.usgs.gov | 200: standard Drupal rules (no AI clauses) | Yes |
| earthobservatory.nasa.gov → science.nasa.gov | science.nasa.gov 200: `User-agent: * Allow: /` | Yes |
| gpm.nasa.gov | 200: standard Drupal rules | Allowed, but every page returned **504 Gateway Timeout**. Not used. |
| scijinks.gov | Connection failed (curl status 000) | Not used |
| cloudatlas.wmo.int | 404 (no robots file) | Not fetched; I used NOAA pages instead, as the brief preferred |
| archive.org | 200: Disallow /control/, /report/ | Yes (page images) |
| ntrs.nasa.gov | 200: `Allow: /` | Yes |

---

## 1. Coriolis effect

### S1a. NOAA National Ocean Service, "The Coriolis Effect" (Currents tutorial)
- URL: https://oceanservice.noaa.gov/education/tutorial_currents/04currents1.html
- Author: NOAA National Ocean Service (U.S. Government; public domain). No update date shown on the page. Kind: educational simplification.
- Verbatim: "Because the Earth rotates on its axis, circulating air is deflected toward the right in the Northern Hemisphere and toward the left in the Southern Hemisphere. This deflection is called the Coriolis effect."
- Verbatim: "It is named after the French mathematician Gaspard Gustave de Coriolis (1792-1843), who studied the transfer of energy in rotating systems like waterwheels. (Ross, 1995)."
- Note: https://oceanservice.noaa.gov/facts/coriolis.html returns 404.

### S1b. NWS Glossary: "Coriolis Force" and "Geostrophic Wind"
- URLs: https://forecast.weather.gov/glossary.php?word=coriolis+force and https://forecast.weather.gov/glossary.php?word=geostrophic+wind
- Author: NOAA National Weather Service (public domain). Kind: definition.
- "Coriolis Force: A fictitious force used to account for the apparent deflection of a body in motion with respect to the earth, as seen by an observer on the earth. The deflection (to the right in the Northern Hemisphere) is caused by the rotation of the earth."
- "Geostrophic Wind: A wind that is affected by coriolis force, blows parallel to isobars and whose strength is related to the pressure gradient (i.e., spacing of the isobars)."
- "Pressure Gradient Force: A three-dimensional force vector operating in the atmosphere that accelerates air parcels away from regions of high pressure and toward regions of low pressure in response to an air pressure gradient. Usually resolved into vertical and horizontal components." (?word=pressure+gradient)
- "Isobar: A line connecting points of equal pressure." (?word=isobar)

### S1c. NWS Houston/Galveston (ZHU) training page, "Prevailing Winds / Flight Environment" (upper-level winds: the geostrophic balance)
- URL: https://www.weather.gov/source/zhu/ZHU_Training_Page/winds/Wx_Terms/Flight_Environment.htm
- Author: NOAA NWS (public domain); no named author. HTTP Last-Modified: 17 Feb 2025. Kind: educational simplification (aviation training).
- "There are two main forces which affect the movement of air in the upper levels. The pressure gradient causes the air to move horizontally, forcing the air directly from a region of high pressure to a region of low pressure. The Coriolis force, however, deflects the direction of the flow of the air (to the right in the Northern Hemisphere) and causes the air to flow parallel to the isobars."
- "The speed of the wind is determined by the pressure gradient. The winds are strongest in regions where the isobars are close together."

### S1d. Humphreys, W. J. (1920). *Physics of the Air*. Philadelphia: Franklin Institute / J. B. Lippincott. Gives f = 2Ω sin φ (as a = 2ωv sin φ) and ω.
- archive.org id `physicsofair00hump` (Wellesley College Library copy, 1920, U.S. public domain by date). I read the formulas on the **page images**:
  - n152 = p. 133: https://archive.org/download/physicsofair00hump/page/n152_w1200.jpg
  - n154 = p. 135: https://archive.org/download/physicsofair00hump/page/n154_w1200.jpg
  - Note: the item's `page_numbers.json` leaf numbers are off by 2 for this item (it lists leaf 155 as p. 133, but n154 is p. 135).
- Author: W. J. Humphreys (1862–1949), meteorological physicist, U.S. Weather Bureau. Bio: not verified on an official page.
- p. 133, verbatim: "while at latitude φ, where the angular rotation is ω sin φ, a = 2 ω v sin φ, and f = 2 mωv sin φ, to the right (going forward with the particle) in the northern hemisphere, to the left in the southern."
- p. 134, from the OCR (the start of p. 134 has not been checked on the image; the formulas above were): the deflective force is "a. Directly proportional to its mass. b. Directly proportional to its horizontal velocity. c. Directly proportional to the angular velocity of the earth's rotation. d. Directly proportional to the sine of the latitude of its location. e. Exactly the same whatever its horizontal direction. f. Always at right angles to its instantaneous direction and therefore wholly without influence on the velocity…". **Check this on image n153 before showing it.**
- p. 135, image-verified: "But, as the earth turns completely around during a sidereal day, ω = 2π/86,164 per second = 15° 2′ 26″ per hour, or 15° per hour, roughly."
- **Derived (not printed):** 2π/86 164 s = 7.2921×10⁻⁵ s⁻¹, which matches the brief's Ω = 7.292×10⁻⁵ s⁻¹. The app must label 7.292×10⁻⁵ as computed from Humphreys's printed 2π/86,164. No NOAA or NASA page was found that prints 7.292×10⁻⁵ verbatim.

---

## 2. Convection

### S2a. Rayleigh (1916), "On Convection Currents in a Horizontal Layer of Fluid, when the Higher Temperature is on the Under Side", *Phil. Mag.* XXXII, pp. 529–546. Reprinted as paper 412 in *Scientific Papers* Vol. VI (Cambridge Univ. Press, 1920), pp. 432–446.
- archive.org id `scientificpapers06rayliala` (University of California Libraries; NOT_IN_COPYRIGHT). The other copy, `scientificpapers0006rayl` (1964 Dover), is lending-restricted (401).
- I verified p. 441 on the **page image** n460: https://archive.org/download/scientificpapers06rayliala/page/n460_w1200.jpg
- Eq. (43): "β′γ = 27κνs⁴/4". Then: "The smallest value of s is π/ζ. The condition of instability when l, m, and s are all unrestricted is accordingly β′γ > 27π⁴κν/4ζ⁴ …(44). If β′γ falls below this amount, the equilibrium is altogether stable. I am not aware that the possibility of complete stability under such circumstances has been contemplated."
- Eq. (46): "(ρ₂ − ρ₁)/ρ₁ > 27π⁴κν/4gζ³". For air: "ν = ·14, and κ = 5/2 ν (Maxwell's Theory)." [CORRECTED 2026-11-28 on re-reading image n460: the fraction is 5/2, not 4/3; with 5/2, 27π⁴κν/4g = 0.0329 ≈ the printed ·033] (original transcription: "κ = 4/3 ν (Maxwell's Theory). Also g = 980", which gives (47) "(ρ₂−ρ₁)/ρ₁ > ·033/ζ³". "For example, if ζ = 1 cm., instability requires that the density at the top exceed that at the bottom by one-thirtieth part, corresponding to about 9° C. of temperature."
- **Derived:** 27π⁴/4 = 657.51. Rayleigh does not print "657.5". His boundary condition is that the horizontal *forces* vanish at both boundaries (free–free; see p. 441: "if we were to suppose the horizontal velocities (instead of the horizontal forces) to be annulled at the boundaries").
- p. 432 (from OCR; check image n451 if quoted): "THE present is an attempt to examine how far the interesting results obtained by Bénard in his careful and skilful experiments can be explained theoretically. Bénard worked with very thin layers, only about 1 mm. deep…". The second phase "has for its limit a permanent regime of regular hexagons." Rayleigh's footnote cites Bénard: *Revue générale des Sciences* XII, pp. 1261, 1309 (1900); *Ann. de Chimie et de Physique* t. XXIII, p. 62 (1901). I did not fetch Bénard 1900 itself.

### S2b. Koschmieder, E. L. (1988). *Investigation of Surface Tension Driven Convection as a Feasibility Study for a Micro-Gravity Experiment.* Final Report, NASA Grant NAG 3-393 (NASA Lewis), NASA-CR-182504. Univ. of Texas.
- NTRS 19880009355: https://ntrs.nasa.gov/citations/19880009355 (PDF: /api/citations/19880009355/downloads/19880009355.pdf). Public distribution. No DOI. Kind: experimental report.
- This is a scanned typescript. I verified report p. 18 (PDF page 40) on a rendered page image:
  - "R_c = αgΔT_c d³ / νκ (3), where α is the volume expansion coefficient of the fluid, g the acceleration of gravity, ΔT_c the critical temperature difference, d the depth of the fluid, ν the kinematic viscosity, and κ the thermal diffusivity of the fluid. The value of the critical Rayleigh number of a Boussinesq fluid layer on an infinite plane is R_c = 1708."
  - Caveat: the report does not say "rigid–rigid" in this sentence; the setup is between plates.
- From the text layer only (PDF p. 16, an included paper; check the image before quoting): "The critical Rayleigh number R_c for onset of convection in a fluid layer with a free surface is R_c = 1100.6 … Air on top of the fluid however approximates an insulating top boundary. The critical Rayleigh number in this case is then R_c = 669 (Nield 1964)."
- Bio: Koschmieder, not verified.

### S2c. NWS Glossary: "Convection" and "Updraft" (plain language)
- https://forecast.weather.gov/glossary.php?word=convection: "Convection: Generally, transport of heat and moisture by the movement of a fluid. In meteorology, the term is used specifically to describe vertical transport of heat and moisture in the atmosphere, especially by updrafts and downdrafts in an unstable atmosphere. The terms "convection" and "thunderstorms" often are used interchangeably, although thunderstorms are only one form of convection."
- Same entry: "Convection which occurs without cloud formation is called dry convection, while the visible convection processes referred to above are forms of moist convection."
- "Level of Free Convection (LFC) - The level at which a parcel of saturated air becomes warmer than the surrounding air and begins to rise freely."
- https://forecast.weather.gov/glossary.php?word=updraft: "Updraft: A small-scale current of rising air. If the air is sufficiently moist, then the moisture condenses to become a cumulus cloud or an individual tower of a towering cumulus or Cb."
- ZHU clouds page (S3b): "These thunderstorms arise from cumulonimbus clouds, which can attain heights of 65,000 feet and builds through all the layers. When the cloud reaches the top of the troposphere it is virtually lopped off by the lid which the stratosphere creates, and the cumulonimbus cloud resembles a giant anvil."

---

## 3. Cloud classification

### S3a. NWS Glossary: genus entries and level classes (forecast.weather.gov/glossary.php)
- "High Clouds: These clouds have bases between 16,500 and 45,000 feet in the mid latitudes. At this level they are composed of primarily of ice crystals. Some clouds at this level are cirrus, cirrocumulus, and cirrostratus"
- "Middle Clouds (or Mid-Level Clouds) - A term used to signify clouds with bases between 6,500 and 23,000 feet. … Altocumulus, altostratus, and nimbostratus are the main types of middle clouds. This altitude applies to the temperate zone. In the polar regions, these clouds may be found at lower altitudes. In the tropics, the defining altitudes for cloud types are generally higher."
- "Convective Clouds: The vertically developed family of clouds are cumulus and cumulonimbus. The height of their bases range from as low as 1,000 feet to a bit more than 10,000 feet."
- "Cirrus … High-level clouds (16,000 feet or higher), composed of ice crystals and appearing in the form of white, delicate filaments or white or mostly white patches or narrow bands."
- "Cirrocumulus: A cirriform cloud characterized by thin, white patches, each of which is composed of very small granules or ripples. These clouds are of high altitude (20,000-40,000 ft or 6000 -12,000 m)."
- "Cirrostratus: … composition of ice crystals and often by the production of halo phenomena … These clouds are of high altitude (20,000-40,000 ft or 6000 -12,000 m)."
- "Altocumulus: … globular masses or rolls in layers or patches … These clouds are of medium altitude, about 8000-20,000 ft (2400-6100 m)."
- "Altostratus: … a generally uniform gray sheet or layer … medium altitude, about 8000 to 20,000 ft (2400-6100 m)."
- "Nimbostratus … a formless layer that is almost uniformly dark gray; a rain cloud of the layer type, of low altitude, usually below 8000 ft (2400 m)."
- "Stratocumulus: Low-level clouds, existing in a relatively flat layer but having individual elements."
- "Stratus: A low, generally gray cloud layer with a fairly uniform base. … Fog usually is a surface-based form of stratus."
- "Cumulus … detached clouds, generally dense and with sharp outlines, showing vertical development in the form of domes, mounds, or towers."
- "Cb: Cumulonimbus cloud, characterized by strong vertical development in the form of mountains or huge towers topped at least partially by a smooth, flat, often fibrous anvil."
- "Cloud … A visible aggregate of minute water droplets or ice particles in the atmosphere above the Earth's surface."
- **Inconsistencies between NWS sources:** high-cloud base is 16,500 ft (High Clouds entry), 16,000 ft (Cirrus entry), 20,000 ft (Cirrocumulus and Cirrostratus entries) and 17,000 ft (ZHU page). The middle-cloud range is 6,500–23,000 ft in the glossary but 7,000–17,000 ft on the ZHU page. Record all of these and use per-source labels.

### S3b. NWS ZHU training page, "Cloud Development" (ten genera with base heights)
- URL: https://www.weather.gov/source/zhu/ZHU_Training_Page/clouds/cloud_development/clouds.htm
- Author: NOAA NWS (public domain). HTTP Last-Modified: 28 Oct 2024. Kind: educational simplification. Part of the text appears to be adapted from UK material ("most commonly reported cloud amount" over "the United Kingdom").
- "The cloud types are split into three groups according to the height of their base above mean sea level. … All heights given are approximate above sea level in mid-latitudes."
- "Low clouds Surface - 7,000 ft; Medium clouds 7,000 - 17,000 ft; High clouds 17,000 - 35,000 ft"
- Base heights by genus:

| Genus | Base height |
|---|---|
| Cumulus | 1,200-6,000 ft |
| Cumulonimbus | 1,000-5,000 ft |
| Stratus | surface-1,500 ft |
| Stratocumulus | 1,200-7,000 ft |
| Altocumulus | 7,000-17,000 ft |
| Altostratus | 8,000-17,000 ft |
| Nimbostratus | 1,500-10,000 ft (listed under medium: "Although classed as a medium cloud, its base frequently descends to low cloud levels.") |
| Cirrus, Cirrocumulus, Cirrostratus | 17,000-35,000 ft |

- History: "In 1803 a retail chemist and amateur meteorologist called Luke Howard proposed a system which has subsequently become the basis of the present international classification." "Howard recognised four types of cloud and gave them the following Latin names: Cumulus - heaped or in a pile; Stratus - in a sheet or layer; Cirrus - thread-like, hairy or curled; Nimbus - a rain bearer". "If we include another Latin word altum meaning height, the names of the ten main cloud types are all derived from these five words".

### S3c. Luke Howard, "On the Modifications of Clouds" (first published 1803)
- The publication history comes from Hellmann's introduction to the 1894 reprint (archive.org `onmodifications00howagoog`, Berlin: Asher, 1894, Neudrucke No. 3; I read intro pp. 5–9 on images n2–n6). Howard read the paper to the Askesian Society in winter 1802/3. It was published in Tilloch's *Philosophical Magazine* Vol. XVI (No. 62, July 1803) pp. 97–107; (No. 64, Sept 1803) pp. 344–357; Vol. XVII (No. 65, Oct 1803) pp. 5–11 (the OCR reads "1883", which is an OCR error); plates VI–VIII in Vol. XVII. Hellmann: the 1894 reprint is typeset to resemble the 1803 separate print, not a facsimile. **The 1894 Google scan is missing essay pp. 5–9**, so I did not use it for the definitions.
- Definitions verified on the page images of the **third edition, 1865** (archive.org `essayonmodifica00howagoog`, NOT_IN_COPYRIGHT; London: John Churchill & Sons). Hellmann says this edition differs from 1803 only by stylistic changes and small omissions.
  - p. 3 (n25): "There are three simple and distinct Modifications, in any one of which the aggregate of minute drops called a Cloud may be formed, increase to its greatest extent, and finally decrease and disappear."
  - "1. CIRRUS. Def. Nubes cirrata, tenuissima, quæ undique crescat. Parallel, flexuous, or diverging fibres, extensible by increase in any or in all directions."
  - "2. CUMULUS. Def. Nubes cumulata, densa, sursum crescens. Convex or conical heaps, increasing upward from a horizontal base."
  - p. 4 (n26): "3. STRATUS. Def. Nubes strata, aquæ modo expansa, deorsum crescens. A widely extended, continuous, horizontal sheet, increasing from below upward."
  - "4. CIRRO-CUMULUS. … Small, well defined roundish masses, in close horizontal arrangement or contact."
  - "5. CIRRO-STRATUS. … Horizontal or slightly inclined masses attenuated towards a part or the whole of their circumference, bent downward, or undulated; separate, or in groups consisting of small clouds having these characters."
  - "6. CUMULO-STRATUS. … The Cirro-stratus blended with the Cumulus…"
  - "7. CUMULO-CIRRO-STRATUS vel NIMBUS. … The Rain cloud. A cloud, or system of clouds from which rain is falling."
- Bio (Hellmann, intro p. 6, image n3): Howard was born 28 Nov 1782 in London and died 21 March 1864. This is a historical secondary account, not an official bio page.

---

## 4. Cloud droplets and precipitation

### S4a. NWS ZHU "Cloud Development" (same page as S3b)
- "Water molecules attach to the particles and form cloud droplets which have a radius of about 20 micrometers (0.02 mm) or less. The droplet volume is generally a million times greater than the typical condensation nuclei."
- "The average cloud droplet has a terminal fall velocity of 1.3 cm per second in still air. To put this into perspective, the average cloud droplet falling from a typical low cloud base of 500 meters/1,650 feet would take more than 10 hours to reach the ground."
- "When rain falls, we know from measurements that the drops are larger than one millimeter. A raindrop of diameter 2 mm contains the water equivalent of a million cloud droplets (0.02 mm diameter)."
- **Internal inconsistency:** 0.02 mm is called a *radius* in one sentence and a *diameter* in another. The "million" figure works only if both are diameters: (2/0.02)³ = 10⁶.
- Collision–coalescence: "growth by collision and coalescence of cloud droplets (and then the collision of rain drops with cloud droplets and other drops) is a much quicker process." "A 0.5 mm-radius drop falling at a rate of 4 m/s can quickly overtake a 0.05 mm (50 micrometer) drop falling at 0.27 m/s." "Clouds with strong updraft areas have the best drop growth…"
- Ice-crystal (Bergeron) process: "under optimal conditions, a pure droplet may reach -40 °C before freezing." "When ice crystals and supercooled droplets are near each other, there is a movement of water molecules from the droplet to the crystal. This increases the size of the ice crystal at the expense of the droplet."
- "Most rain falls in the range of 0.2 to 5 mm (0.008 to 0.20 inch)." "Snow crystals are typically 0.5 to 5 millimeters (0.02 to 0.20 inches) in size whereas snowflakes are about 10 mm in size (0.4 inches) and may be as large as 200 to 400 mm (0.79 to 1.57 inches)." **The 200–400 mm figure is an evident error, since 0.79–1.57 in = 20–40 mm. Do not use it.**
- Caution: the page's introduction also says warm-cloud droplets "collide and change their electric charge. Droplets of unlike charge attract one another and merge". This is a non-standard description, so avoid quoting it.

### S4b. NWS Glossary
- "Bergeron Process: The process by which ice crystals in a cloud grow at the expense of supercooled liquid water droplets."
- "Coalescence: The process by which water droplets in a cloud collide and come together to form raindrops."
- "Rain: Precipitation that falls to earth in drops more than 0.5 mm in diameter."
- "Drizzle: Precipitation consisting of numerous minute droplets of water less than 0.5 mm (500 micrometers) in diameter."
- "Cloud Condensation Nuclei: Small particles in the air on which water vapor condenses and forms cloud droplets."
- "Supercooled Liquid Water: In the atmosphere, liquid water can survive at temperatures colder than 0 degrees Celsius…"

### S4c. USGS Water Science School, "Precipitation and the Water Cycle"
- URL: https://www.usgs.gov/special-topics/water-science-school/science/precipitation-and-water-cycle (USGS; public domain). Kind: educational. The table is observational, from Lull 1959.
- "If enough collisions occur to produce a droplet with a fall velocity which exceeds the cloud updraft speed, then it will fall out of the cloud as precipitation. This is not a trivial task since millions of cloud droplets are required to produce a single raindrop."
- "Small raindrops, those with a radius of less than 1 millimeter (mm), are spherical … at about 2-3 mm in diameter the bottom is quite flat … when they reach about 4-5 mm … the large drop breaks up into smaller drops."
- Table "Precipitation size and speed". Source: "Lull, H.W., 1959, Soil Compaction on Forest and Range Lands, U.S. Dept. of Agriculture, Forestry Service, Misc. Publication No.768".

| Intensity | in/h (cm/h) | Median diameter (mm) | Velocity of fall, ft/s (m/s) | Drops per s per ft² (m²) |
|---|---|---|---|---|
| Fog | 0.005 (0.013) | 0.01 | 0.01 (0.003) | 6,264,000 (67,425,000) |
| Mist | .002 (0.005) | .1 | .7 (.21) | 2,510 (27,000) |
| Drizzle | .01 (0.025) | .96 | 13.5 (4.1) | 14 (151) |
| Light rain | .04 (0.10) | 1.24 | 15.7 (4.8) | 26 (280) |
| Moderate rain | .15 (0.38) | 1.60 | 18.7 (5.7) | 46 (495) |
| Heavy rain | .60 (1.52) | 2.05 | 22.0 (6.7) | 46 (495) |
| Excessive rain | 1.60 (4.06) | 2.40 | 24.0 (7.3) | 76 (818) |
| Cloudburst | 4.00 (10.2) | 2.85 | 25.9 (7.9) | 113 (1,220) |

- Notes on the table: "Drizzle" has a median diameter of 0.96 mm, which conflicts with the NWS definition of drizzle as smaller than 0.5 mm. Record both. The unit conversions check out.

---

## 5. Water cycle

### S5a. USGS Water Science School, "How Much Water is There on Earth?"
- URL: https://www.usgs.gov/special-topics/water-science-school/science/how-much-water-there-earth (public domain; the page shows dates as of 2026-09-17). Kind: estimate (compilation).
- "About 71 percent of the Earth's surface is water-covered, and the oceans hold about 96.5 percent of all Earth's water."
- "The volume of all water would be about 332.5 million cubic miles (mi³), or 1,386 million cubic kilometers (km³)." Sphere diameter: "about 860 miles (about 1,385 kilometers)".
- Table "One estimate of global water distribution". Source: "Igor Shiklomanov's chapter "World fresh water resources" in Peter H. Gleick (editor), 1993, Water in Crisis: A Guide to the World's Fresh Water Resources (Oxford University Press, New York)."

| Reservoir | km³ | % of freshwater | % of total |
|---|---|---|---|
| Oceans, Seas, & Bays | 1,338,000,000 | | 96.54 |
| Ice caps, Glaciers, & Permanent Snow | 24,064,000 | 68.7 | 1.74 |
| Groundwater | 23,400,000 | | 1.69 |
| Groundwater, fresh | 10,530,000 | 30.1 | 0.76 |
| Groundwater, saline | 12,870,000 | | 0.93 |
| Soil Moisture | 16,500 | 0.05 | 0.001 |
| Ground Ice & Permafrost | 300,000 | 0.86 | 0.022 |
| Lakes | 176,400 | | 0.013 |
| Lakes, fresh | 91,000 | 0.26 | 0.007 |
| Lakes, saline | 85,400 | | 0.006 |
| Atmosphere | 12,900 | 0.04 | 0.001 |
| Swamp Water | 11,470 | 0.03 | 0.0008 |
| Rivers | 2,120 | 0.006 | 0.0002 |
| Biological Water | 1,120 | 0.003 | 0.0001 |

### S5b. USGS, "Evaporation and the Water Cycle"
- URL: https://www.usgs.gov/special-topics/water-science-school/science/evaporation-and-water-cycle
- "Most of the moisture in the atmosphere (about 90%) came from water evaporating from oceans, seas, lakes, and rivers."
- "Only about 10 percent of the water evaporated from the oceans is transported over land and falls as precipitation. Once evaporated, a water molecule spends about 10 days in the air."

### S5c. NASA Earth Observatory, "The Water Cycle" (Steve Graham, Claire Parkinson, Moustafa Chahine). Published Oct 1, 2010; last updated Nov 14, 2025.
- URL: https://science.nasa.gov/earth/earth-observatory/the-water-cycle/ (redirected from earthobservatory.nasa.gov/features/Water). NASA content (generally not copyrighted; check per-image credits, because some photos are ©). Kind: educational. The table is an estimate.
- "In all, the Earth's water content is about 1.39 billion cubic kilometers (331 million cubic miles), with the bulk of it, about 96.5%, being in the global oceans. … approximately 1.7% is stored in the polar icecaps, glaciers, and permanent snow, and another 1.7% is stored in groundwater, lakes, rivers, streams, and soil. Only a thousandth of 1% of the water on Earth exists as water vapor in the atmosphere."
- Flux: "The amount of water in the atmosphere at any moment in time is only 12,900 cubic kilometers … if it were to completely rain out, atmospheric moisture would cover the Earth's surface to a depth of only 2.5 centimeters. However, far more water—in fact, some 495,000 cubic kilometers of it—are cycled through the atmosphere every year. It is as if the entire amount of water in the air were removed and replenished nearly 40 times a year."
- "on a global basis, evaporation approximately equals precipitation … over the continents, precipitation routinely exceeds evaporation, and conversely, over the oceans, evaporation exceeds precipitation."
- The table's source is "Gleick, P. H., 1996: Water resources. In Encyclopedia of Climate and Weather, ed. by S. H. Schneider, Oxford University Press, New York, vol. 2, pp.817-823." Its total is 1,385,984 thousand km³.
- **Discrepancies:**
  - Saline groundwater: NASA gives 0.94 %, USGS gives 0.93 %.
  - Total water: NASA gives 331 million mi³, USGS gives 332.5 million mi³.
  - Surface coverage: NASA says the surface is "approximately 75%" covered by water, USGS says "About 71 percent".
  - Residence time: 12,900 km³ / 495,000 km³ yr⁻¹ ≈ 9.5 days, which is consistent with the USGS "about 10 days" (my arithmetic).

---

## 6. Global circulation

### S6a. NWS ZHU "Prevailing Winds / Flight Environment" (S1c URL)
- Three cells: "Due to the rotation of the earth, there is a build up of air at about 30° north latitude. … Some of the air sinks, causing a belt of high-pressure at this latitude." "The colliding air is forced upward and an area of low pressure is created near 60° north. The third cell circulation pattern is created between the north pole and 60° north."
- "the movement of air in the polar cell circulation produces the polar easterlies. In the circulation cell that exists between 60° and 30° north, the movement of air produces the prevailing westerlies. In the tropic circulation cell, the northeast trade winds are produced."
- "Hadley cell - Low latitude air movement toward the equator that with heating, rises vertically, with poleward movement in the upper atmosphere. This forms a convection cell that dominates tropical and sub-tropical climates."
- "Ferrel cell - A mid-latitude mean atmospheric circulation cell for weather named by Ferrel in the 19th century. In this cell the air flows poleward and eastward near the surface and equatorward and westward at higher levels."
- "Polar cell - Air rises, diverges, and travels toward the poles. Once over the poles, the air sinks, forming the polar highs. … Surface winds in the polar cell are easterly (polar easterlies)."
- Jet stream: "Narrow bands of exceedingly high speed winds are known to exist in the higher levels of the atmosphere at altitudes ranging from 20,000 to 40,000 feet or more. They are known as jet streams." "They are usually about 300 nautical miles wide and may be 3000 to 7000 feet thick." Segments are "some 1000 to 3000 nautical miles long". "Winds in the central core of the jet stream are the strongest and may reach speeds as great as 250 knots, although they are generally between 100 and 150 knots. Wind speeds decrease toward the outer edges of the jet stream and may be blowing at only 25 knots there." "Wind speeds in the jet stream are, on average, considerably stronger in winter than in summer." "The jet streams flow from west to east".
- Subtropical jet: "forms because of strong solar heating in the equatorial regions. The ascending air turns poleward at very high levels but is deflected by the Coriolis force into a strong westerly jet."

### S6b. NWS Glossary
- "Ferrel Cell: In the general circulation of the atmosphere, the name given to the middle latitude cell marked by sinking motion near 30 degrees and rising motion near 60 degrees latitude."
- "Subtropical Jet (Abbrev. STJ) - this jet stream is usually found between 20° and 30° latitude at altitudes between 12 and 14 km."
- "Trade Winds: Persistent tropical winds that blow from the subtropical high pressure centers towards the equatorial low."
- "Westerlies: The prevailing winds that blow from the west in the mid-latitudes."
- "Jet Stream … Relatively strong winds concentrated in a narrow stream in the atmosphere, normally referring to horizontal, high-altitude winds."
- Polar Jet: "this jet is the boundary between the polar air and the subtropical air. … Its position tends to migrate south in the Northern Hemispheric winter and north in the summer, and its core winds increase during the winter and become less strong in the summer."
- The glossary has no entry for "Hadley cell" or "Polar cell".

### S6c. NOAA Ocean Service, "What are the trade winds?" (last updated 09/23/26; Author: NOAA)
- URL: https://oceanservice.noaa.gov/facts/tradewinds.html
- "The Coriolis Effect, in combination with an area of high pressure, causes the prevailing winds—the trade winds—to move from east to west on both sides of the equator across this 60-degree "belt.""
- "As the wind blows to about five degrees north and south of the equator, both air and ocean currents come to a halt in a band of hot, dry air. This 10-degree belt around Earth's midsection is called the Inter-Tropical Convergence Zone, more commonly known as the doldrums." **Caution:** the page calls the doldrums "hot, dry air", but the next paragraph describes "persistent bands of showers and storms". It also says the Coriolis effect makes air "slant toward the equator in a southwesterly direction in the northern hemisphere", which is wording that is easy to misread. Prefer S6a.

---

## 7. Highs and lows (sea-level pressure systems)

- NWS Glossary: "Cyclone … A large-scale circulation of winds around a central region of low atmospheric pressure, counterclockwise in the Northern Hemisphere, clockwise in the Southern Hemisphere."
- NWS Glossary: "Anticyclone: A large-scale circulation of winds around a central region of high atmospheric pressure, clockwise in the Northern Hemisphere, counterclockwise in the Southern Hemisphere"
- NWS Glossary: "High … In meteorology, a region of high pressure; also known as anticyclone."
- ZHU Flight Environment (S1c): "Winds in the upper levels will blow clockwise around areas of high pressure and counterclockwise around areas of low pressure." [Northern Hemisphere context]
- Same page: "Surface friction plays an important role in the speed and direction of surface winds. As a result of the slowing down of the air as it moves over the ground, wind speeds are less than would be expected from the pressure gradient on the weather map and the direction is changed so that the wind blows across the isobars into a center of low pressure and out of a center of high pressure." "The effect of friction usually does not extend more than a couple of thousand feet into the air."
- ZHU Cloud Development (S3b): under high pressure, "Air would be sinking slowly, rather than rising and cooling. As the air sinks into the lower part of the atmosphere, the pressure rises, it becomes compressed and warms up, so that no condensation takes place."

---

## NOT FOUND / gaps
- **NWS JetStream** ("Ten basic clouds", "Global circulations", "The Jet Stream", "Coriolis") was blocked: weather.gov/jetstream redirects to www.noaa.gov/jetstream, which returned a CloudFront 403. I stopped using that host. NWS ZHU training pages and the NWS Glossary were used instead.
- **NASA GPM** (gpm.nasa.gov) returned 504 on every page; I did not retry. **SciJinks** could not be reached.
- **Ω = 7.292×10⁻⁵ s⁻¹ is not printed verbatim** in any source I found. It can only be derived from Humphreys's 2π/86,164 s⁻¹. No NOAA or NASA statement of "f = 2Ω sin φ" in that notation was found; Humphreys gives a = 2ωv sin φ.
- **Buys Ballot's law** by name: not in the NWS Glossary and not in the Humphreys OCR. The circulation rules are covered by the Cyclone and Anticyclone entries.
- **Critical Rayleigh number 1708** is cited as "a Boussinesq fluid layer on an infinite plane" (Koschmieder/NTRS). I found no openly readable primary source (Jeffreys 1928, Pellew & Southwell 1940) that says rigid–rigid. Rayleigh's 657.5 is derived (27π⁴/4), not printed.
- **Bénard 1900**, **Coriolis 1835** and **Ferrel 1856/1889** were not fetched (Gallica is off-limits; I did not search archive.org for them due to time).
- **Typical cloud droplet "10–20 µm"**: the sources give "radius of about 20 micrometers (0.02 mm) or less" (ZHU, which inconsistently also calls 0.02 mm a diameter) and a fog median diameter of 0.01 mm (USGS/Lull).
- **Global annual evaporation and precipitation split** (ocean vs land, e.g. Trenberth fluxes) was not found. The only global figure is NASA EO's 495,000 km³/yr cycled through the atmosphere.
- The **WMO International Cloud Atlas** terms were not checked (I did not fetch the site).
- Author bios: none verified on official pages.
