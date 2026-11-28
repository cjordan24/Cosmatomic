# Source notes — Phase 20A: structure and thermodynamics of Earth's atmosphere

Research date: 2026-11-28. Rules: /tmp/vv-research/p20/RULES.md. Raw files: /tmp/vv-research/p20/a/ (page images in `img/` and `hum/`).
User-Agent: "VoyagerVentures-Research/0.1 (educational; respects robots.txt)"; at least 1.2 s between requests to each host.

## robots.txt / access log

| Host | robots.txt result | Used? |
|---|---|---|
| ntrs.nasa.gov | 200 — `User-agent: * Allow: /` | Yes (USSA 1976 PDF) |
| www.weather.gov | 404 (no robots.txt, so no restrictions) | Yes (EPZ wxcalc PDF, Weather_Theory.pdf, BTV LCL page) |
| forecast.weather.gov | 404 (no robots.txt) | Yes (NWS glossary) |
| www.noaa.gov | 200; JetStream paths are not disallowed | **No. The request returned HTTP 403 (CloudFront "Request blocked"), so I stopped using the host.** www.weather.gov/jetstream/* redirects here, so NWS JetStream could not be read. |
| www1.grc.nasa.gov | 200 — `Disallow:` (empty) | Not needed. The pages came from www.grc.nasa.gov. |
| www.grc.nasa.gov | 404 (no robots.txt). Note: one page was fetched before this check. It is allowed, but the order breaks the check-first rule. | Yes (Beginner's Guide, Aero2000) |
| archive.org | 200 — only /control/ and /report/ disallowed | Yes (Humphreys 1920) |
| www.ipcc.ch | 200 — only /site/wp-admin/ disallowed | Yes (AR6 WG1 Ch. 8) |
| www.spc.noaa.gov | 200 — `User-agent: * Disallow: /` | **No, disallowed.** Craven LCL paper not fetched. |
| journals.ametsoc.org | 200 (crawl-delay 5; article paths allowed) | **No. The article page returned HTTP 403 (CloudFront block), so I stopped.** Bolton 1980 and Lawrence 2005 were not read. |
| www.meted.ucar.edu | 200 — `Disallow:` (empty) | No. The LCL page redirects to the login-style course player, so it was not used. |
| api.crossref.org | (API) | DOI checks only |

---

## S1. U.S. Standard Atmosphere, 1976 (item 1)

- **Citation:** NOAA, NASA, USAF (1976). *U.S. Standard Atmosphere, 1976.* U.S. Government Printing Office, Washington, D.C. Report numbers NOAA-S/T-76-1562 and **NASA-TM-X-74335** (confirmed in NTRS record 19770009539).
- **URL:** https://ntrs.nasa.gov/citations/19770009539 (PDF: https://ntrs.nasa.gov/api/citations/19770009539/downloads/19770009539.pdf; 243 PDF pages)
- **Publication date (NTRS):** 1976-10-01. **Licence:** U.S. Government work. NTRS copyright determination is "GOV_PUBLIC_USE_PERMITTED", distribution "PUBLIC". No DOI.
- **Reading method:** the PDF is a scan and its text layer is unusable OCR. I read every value below from rendered page images. Printed page = PDF page − 16 in Part 1.
- **Data kind:** an idealised, defined reference model. Below 51 km′ it follows tradition and convention; from 51 to 86 km it rests on averages of observations. It is **not** an observation of any real day.

**Definition (printed p. 1, PDF p. 17, §1.0):**
> "The U.S. Standard Atmosphere,1976 is an idealized, steady-state representation of the earth's atmosphere from the surface to 1000 km, as it is assumed to exist in a period of moderate solar activity."

> "For heights from the surface to 51 geopotential kilometers (km′), the tables of this standard are identical with those of the U.S. Standard Atmosphere, 1962 (COESA 1962) and are based on traditional definitions. These definitions, especially for heights below 20 km′, do not necessarily represent an average of the vast amount of atmospheric data available today from observations within that height region."

**Table 2, "Adopted constants" (printed p. 2, PDF p. 18):**
- k = 1.380622 × 10⁻²³ N·m/K
- N_A = 6.022169 × 10²⁶ kmol⁻¹
- g₀ = 9.80665 m/s²; g₀′ = 9.80665 m²/(s²·m′)
- P₀ = 1.013250 × 10⁵ N/m² (or Pa)
- r₀ = 6.356766 × 10³ km
- T₀ = 288.15 K
- γ = 1.40 (dimensionless)
- **Discrepancy:** Table 2 prints R* as "8.31432 × 10⁻³ N·m/(kmol·K)" (checked on a zoomed image). The text on printed p. 3 gives "R* = 8.31432 × 10³ N·m/(kmol·K)". The 10³ in the text is dimensionally correct, so the table's minus sign is a misprint. Record both and use 8.31432 × 10³.

**Text on constants (printed p. 3, PDF p. 19):**
> "The gas constant, R* = 8.31432 × 10³ N·m/(kmol·K), is consistent with the carbon-12 scale, and is the value used in the 1962 Standard. This value is not exactly consistent with the cited values of k and N_A."

> "The quantity g₀ (= 9.80665 m/s²) represents the sea-level value of the acceleration of gravity adopted for this Standard. This value is the one originally adopted by the International Committee on Weights and Measures in 1901 for 45° latitude, and even though it has since been shown to be too high by about five parts in ten thousand (List 1968), this value has persisted in meteorology …"

**Sea-level temperature (printed p. 4, PDF p. 20):**
> "The standard sea-level temperature T₀ is 288.15 K. This value is based upon two international agreements. The first of these is Resolution 192 of the International Commission for Air Navigation which in 1924 adopted 15°C as the sea-level temperature of The International Standard Atmosphere."

The text also gives "γ = 1.400" for the ratio of specific heats.

**P₀ (printed p. 3 → p. 4):**
> "The standard sea-level atmospheric pressure P₀ equal to 1.013250 × 10⁵ Pa (or N/m²) was adopted in 1947 in Resolution 164 of the International Meteorological Organization, and corresponds to the pressure exerted by a column of mercury 0.760 m high …"

**Table 3, "Molecular weights and assumed fractional-volume composition of sea-level dry air" (printed p. 3, PDF p. 19):**

| Gas | M_i (kg/kmol) | F_i |
|---|---|---|
| N₂ | 28.0134 | 0.78084 |
| O₂ | 31.9988 | .209476 |
| Ar | 39.948 | .00934 |
| CO₂ | 44.00995 | .000314 |
| Ne | 20.183 | .00001818 |
| He | 4.0026 | .00000524 |
| Kr | 83.80 | .00000114 |
| Xe | 131.30 | .000000087 |
| CH₄ | 16.04303 | .000002 |
| H₂ | 2.01594 | .0000005 |

Caveat: the CO₂ value .000314 (314 ppm) reflects 1960s–70s air ("based upon CO₂ measurements by Keeling (1960)"). It is **not** today's concentration. The app must say so.

**Table 4, "The defined reference levels and gradients of the linearly segmented temperature-height profile from the surface to 86 geometric kilometers" (printed p. 3, PDF p. 19):**

| b | H_b (km′, geopotential) | L_M,b (K/km′) |
|---|---|---|
| 0 | 0 | −6.5 |
| 1 | 11 | 0.0 |
| 2 | 20 | +1.0 |
| 3 | 32 | +2.8 |
| 4 | 47 | 0.0 |
| 5 | 51 | −2.8 |
| 6 | 71 | −2.0 |
| 7 | 84.8520 | — |

All functions are "Linear". The table note says: "These values plus T₀, the defined sea-level value of T, equal to T_M,0 completely specify the geopotential-height profile of T_M from the surface to 86 geometric kilometers."

These match the brief's values. Note that the heights are **geopotential** km′ and that 84.8520 km′ = 86 km geometric. The gradients apply to **molecular-scale** temperature T_M, which equals T below 80 km.

**Equations (printed p. 6, PDF p. 22, §1.2.2):**
> "The air is treated as if it were a perfect gas, and the total pressure P, temperature T, and total density ρ at any point in the atmosphere are related by the equation of state, i.e., the perfect gas law, one form of which is P = ρ·R*·T / M (1)"

> "the atmosphere is assumed to be in hydrostatic equilibrium, and to be horizontally stratified so that dP … is related to dZ … by the relationship dP = −g·ρ·dZ (4)"

> "d lnP = dP/P = −(g·M)/(R*·T)·dZ. (5)"

**Mean molar mass (printed p. 9, PDF p. 25, §1.2.4):**
> "When the defined values of F_i and M_i (from table 3) are introduced into eq (21), M₀ is found to be 28.9644 kg/kmol."

The same page also gives "M₀ (=28.9644 kg/kmol) is the sea-level value of M" and T_M = T·M₀/M (eq 22).

**Temperature function (printed p. 10, PDF p. 26):**
> "T_M = T_M,b + L_M,b·(H − H_b) (23)"

**Pressure equations (printed p. 12, PDF p. 28):**
- (33a) P = P_b·[T_M,b / (T_M,b + L_M,b·(H − H_b))]^[g₀′·M₀ / (R*·L_M,b)], used when L_M,b ≠ 0.
- (33b) P = P_b·exp[−g₀′·M₀(H − H_b) / (R*·T_M,b)], used when L_M,b = 0.

> "The reference-level value for P_b for b = 0 is the defined sea-level value, P₀ = 101325.0 N/m² (1013.250 mb)."

**Scale height (printed p. 16, PDF p. 32, §1.3.6):**
> "The quantity H_P = R*·T/(g·M), which has dimensions of length, is a quantity commonly associated with the concept of scale height …"

Eq (44): H_P = R*·T_M/(g·M₀) = R*·T/(g·M).

> "… is frequently but incorrectly associated with the altitude increment over which the pressure decreases by exactly a factor of 1/e."

**Sea-level row of Table I (printed p. 52, PDF p. 67), read on a 3200-px image.** At Z = 0 m: T = 288.150 K, t = 15.000 °C, P = "1.01325 + 3" mb, P/P₀ = 1.00000, **ρ = "1.2250 + 0" kg/m³**, ρ/ρ₀ = 1.0000. Sample rows: 1000 m gives T 281.650 K, P 8.9874 + 2 mb, ρ 1.1116 kg/m³.

**Derived values (my arithmetic from the constants above; not printed quotes):**
- R*/M₀ = 8314.32/28.9644 = **287.053 J/(kg·K)** (specific gas constant for dry air).
- H_P = R*·T/(g₀·M₀) = **8434 m** at 288.15 K and **7995 m** at 273.15 K.

## S2. NWS Glossary (items 2, 4, 5, 6)

- **Citation:** NOAA National Weather Service, *Glossary.* https://forecast.weather.gov/glossary.php?word=<term>. Retrieved 2026-11-28. U.S. Government work (public domain). No date on the entries. Author: NWS (institutional; bio not applicable).
- **Data kind:** educational definitions.

Verbatim entries:
- **Troposphere:** "The layer of the atmosphere from the earth's surface up to the tropopause, characterized by decreasing temperature with height (except, perhaps, in thin layers - see inversion, cap), vertical wind motion, appreciable water vapor content, and sensible weather (clouds, rain, etc.)."
- **Tropopause:** "The upper boundary of the troposphere, usually characterized by an abrupt change in lapse rate from positive (decreasing temperature with height) to neutral or negative (temperature constant or increasing with height)."
- **Stratosphere:** "The region of the atmosphere extending from the top of the troposphere to the base of the mesosphere, an important area for monitoring stratospheric ozone."
- **Stratopause:** "The boundary between the stratosphere and mesosphere."
- **Mesosphere:** "The atmospheric shell between about 20 km and about 70 to 80 km, extending from the top of the stratosphere (the stratopause) to the upper temperature minimum that defines the mesopause (the base of the thermosphere)."
  - **Flag:** "about 20 km" conflicts with the USSA profile (stratopause at 47–51 km′) and with the FAA handbook (stratosphere to about 50 km). It is likely a glossary error. Do not show this number.
- **Mesopause:** "The top of the mesosphere, corresponding to the level of minimum temperature in the atmosphere found at 70 to 80 km."
- **Thermosphere:** "The atmospheric shell extending from the top of the mesosphere to outer space. It is a region of more or less steadily increasing temperature with height, starting at 70 or 80 km."
- **Exosphere:** "The upper most layer of the earth's atmosphere; the only layer where atmospheric gases can escape into outer space."
- **Ozone Layer:** "… It is located between the troposphere and the stratosphere, around 9.5 to 12.5 miles (15 to 20 kilometers) above the earth's surface."
  - **Flag:** this is questionable. Ozone is concentrated *within* the stratosphere. Do not use it.
- **Adiabatic Lapse Rate:** "The rate of decrease of temperature experienced by a parcel of air when it is lifted in the atmosphere under the restriction that it cannot exchange heat with its environment. For parcels that remain unsaturated during lifting, the (dry adiabatic) lapse rate is 9.8°C per kilometer."
- **Dry Adiabatic Lapse Rate:** "The rate at which the temperature of a parcel of dry air decreases as the parcel is lifted in the atmosphere. The dry adiabatic lapse rate (abbreviated DALR) is 5.5°F per 1000 ft or 9.8°C per km."
- **Moist Adiabatic Lapse Rate:** "(abbrev. MALR)- The rate at which the temperature of a parcel of saturated air decreases as the parcel is lifted in the atmosphere. The moist adiabatic lapse rate (abbreviated MALR) is not a constant like the dry adiabatic lapse rate but is dependent on parcel temperature and pressure."
- **Environmental Lapse Rate:** "The rate of decrease of air temperature with height, usually measured with a radiosonde."
- **Adiabatic:** "Changes in temperature caused by the expansion (cooling) or compression (warming) of a body of air as it rises or descends in the atmosphere, with no exchange of heat with the surrounding air."
- **Parcel:** "A volume of air small enough to contain uniform distribution of its meteorological properties and large enough to remain relatively self-contained and respond to all meteorological processes."
- **Stability:** "The degree of resistance of a layer of air to vertical motion."
- **Absolutely Stable Air:** "An atmospheric condition that exists when the environmental lapse rate is less than the moist adiabatic lapse rate."
- **Absolutely Unstable Air:** "An atmospheric condition that exists when the environmental lapse rate is greater than the dry adiabatic lapse rate."
- **Conditionally Unstable Air:** "An atmospheric condition that exists when the environmental lapse rate is less than the dry adiabatic lapse rate but greater than the moist adiabatic lapse rate."
- **Neutral Stability:** "An atmospheric condition that exists in unsaturated air when the environmental lapse rate equals the dry adiabatic rate, or in saturated air when the environmental lapse rate equals the moist adiabatic rate."
- **Instability:** "The tendency for air parcels to accelerate when they are displaced from their original position; especially, the tendency to accelerate upward after being lifted. …"
- **Inversion:** "Generally, a departure from the usual increase or decrease in an atmospheric property with altitude. Specifically it almost always refers to a temperature inversion, i.e., an increase in temperature with height, or to the layer within which such an increase occurs. …"
- **Dew Point:** "A measure of atmospheric moisture. It is the temperature to which air must be cooled in order to reach saturation (assuming air pressure and moisture content are constant). A higher dew point indicates more moisture present in the air. …"
- **Dew Point Depression:** "The difference in degrees between the air temperature and the dew point."
- **Relative Humidity:** "A dimensionless ratio, expressed in percent, of the amount of atmospheric moisture present relative to the amount that would be present if the air were saturated. Since the latter amount is dependent on temperature, relative humidity is a function of both moisture content and temperature. As such, relative humidity by itself does not directly indicate the actual amount of atmospheric moisture present. See dew point."
- **Saturation Vapor Pressure:** "The vapor pressure of a system, at a given temperature, wherein the vapor of a substance is in equilibrium with a plane surface of that substance's pure liquid or solid phase."
- **Vapor Pressure:** "The partial pressure of water vapor in an air-water system."
- **Mixing Ratio:** "The ratio of the weight of water vapor in a specified volume (such as an air parcel) to the weight of dry air in that same volume."
- **Lifting Condensation Level (LCL):** "The level at which a parcel of moist air becomes saturated when it is lifted dry adiabatically."
- **Standard Atmosphere:** "A hypothetical vertical distribution of atmospheric temperature, pressure, and density that, by international agreement, is taken to be representative of the atmosphere for purposes of pressure altimeter calibrations, aircraft performance calculations, aircraft and missile design, ballistic tables, etc."

The glossary has no entries for "Clausius-Clapeyron equation", "scale height", "hydrostatic equilibrium", or "cloud base".

## S3. NWS El Paso (EPZ) Weather Calculator: "Vapor Pressure" formulas (item 5)

- **Citation:** NOAA NWS Weather Forecast Office El Paso, TX. "Vapor Pressure" (formula sheet for the Vapor Pressure Calculator). https://www.weather.gov/media/epz/wxcalc/vaporPressure.pdf. Calculator page: https://www.weather.gov/epz/wxcalc_vaporpressure. Undated; retrieved 2026-11-28. U.S. Government work. Read from a rendered page image of the 1-page PDF.
- **Data kind:** empirical (Magnus/Tetens-type) approximation; educational.

Verbatim:
> "Then, saturated vapor pressure (e_s) and the actual vapor pressure (e) can be calculated using the formula listed below:"

- e = 6.11 × 10^(7.5 × T_d / (237.3 + T_d))
- e_s = 6.11 × 10^(7.5 × T / (237.3 + T))
- rh = e/e_s × 100

> "The vapor pressure answers will be in units of millibars (mb) or hectoPascals (hPa)."

Temperatures must be in °C ("the temperature values must be converted to degrees Celsius (°C)").

**Bolton 1980:** not read, because journals.ametsoc.org blocked the request. The DOI was checked via Crossref: 10.1175/1520-0493(1980)108<1046:TCOEPT>2.0.CO;2 — D. Bolton, "The Computation of Equivalent Potential Temperature", *Mon. Wea. Rev.* 108, 1046–1053 (July 1980). Do **not** quote 6.112/17.67/243.5 from memory. Use the NWS formula above instead.

## S4. FAA "Weather Theory", Chapter 11, hosted by NWS (items 2, 4, 5, 6)

- **Citation:** Federal Aviation Administration, "Weather Theory", Chapter 11 (pages 11-1 to 11-x) of the FAA *Pilot's Handbook of Aeronautical Knowledge*. The edition number does not appear in the extracted text, so do not state it. Hosted by NWS at https://www.weather.gov/media/zhu/ZHU_Training_Page/Met_Tutorials/Weather_Theory.pdf. Retrieved 2026-11-28. U.S. Government work. Born-digital PDF, read from the text layer.
- **Data kind:** educational simplification for pilots.

**p. 11-2:**
> "The first layer, known as the troposphere, extends from sea level up to 20,000 feet (8 kilometers (km)) over the northern and southern poles and up to 48,000 feet (14.5 km) over the equatorial regions. The vast majority of weather, clouds, storms, and temperature variances occur within this first layer of the atmosphere. Inside the troposphere, the temperature decreases at a rate of about 2 °Celsius (C) every 1,000 feet of altitude gain, and the pressure decreases at a rate of about one inch per 1,000 feet of altitude gain."

**p. 11-3:**
> "At the top of the troposphere is a boundary known as the tropopause, which traps moisture and the associated weather in the troposphere. The altitude of the tropopause varies with latitude and with the season of the year …"

> "Above the tropopause are three more atmospheric levels. The first is the stratosphere, which extends from the tropopause to a height of about 160,000 feet (50 km). … Above the stratosphere are the mesosphere and thermosphere which have little influence over weather."

**p. 11-12/11-13, Atmospheric Stability:**
> "The stability of the atmosphere depends on its ability to resist vertical motion. A stable atmosphere makes vertical movement difficult, and small vertical disturbances dampen out and disappear. In an unstable atmosphere, small vertical air movements tend to become larger, resulting in turbulent airflow and convective activity."

> "As air ascends through the atmosphere, the average rate of temperature change is 2 °C (3.5 °F) per 1,000 feet."

> "The dry adiabatic lapse rate (unsaturated air) is 3 °C (5.4 °F) per 1,000 feet. The moist adiabatic lapse rate varies from 1.1 °C to 2.8 °C (2 °F to 5 °F) per 1,000 feet."

My conversion, not a quote: 1.1–2.8 °C per 1,000 ft ≈ 3.6–9.2 K/km. The upper end exceeds the usual 4–7 K/km range, so treat it as a pilot rule.

**p. 11-13:**
> "Every 20 °F increase in temperature doubles the amount of moisture the air can hold. Conversely, a decrease of 20 °F cuts the capacity in half."

> "The dew point, given in degrees, is the temperature at which the air can hold no more moisture."

This uses the "holding capacity" framing, so prefer the NWS glossary definition.

**p. 11-14, cloud base (item 6):**
> "As moist, unstable air rises, clouds often form at the altitude where temperature and dew point reach the same value. When lifted, unsaturated air cools at a rate of 5.4 °F per 1,000 feet and the dew point temperature decreases at a rate of 1 °F per 1,000 feet. This results in a convergence of temperature and dew point at a rate of 4.4 °F."

Worked example: "Temperature (T) = 85 °F … Dew point (DP) = 71 °F … 14 °F ÷ 4.4 °F = 3.18 … 3.18 × 1,000 = 3,180 feet AGL. The height of the cloud base is 3,180 feet AGL."

## S5. NASA Glenn, Aero2000 "Module 1, Part 2, Lesson 2" (item 6, corroboration)

- **URL:** https://www.grc.nasa.gov/www/k-12/Aero2000/studweb/1-2-2i.html. NASA Glenn Research Center, K-12. Undated; curator Tom Benson. U.S. Government work. Educational simplification.

> "To find the base altitude of the clouds, subtract the dew point from the ground temperature, divide by 4.4, and multiply by 1,000. The formula is expressed as: ((Surface Temp - Dew Point)/4.4) x 1,000 = CLOUD BASE"

The temperatures are in °F (implicit; the page uses °F) and the result is in feet. The same page says "For every 1,000 feet you go up, you lose 3.5 °F … or 2 °C".

**Check on the brief's rule:** the brief's "400 ft/°F" is **wrong**. 1000/4.4 ≈ 227 ft per °F. The commonly quoted ≈125 m per °C (≈410 ft per °C) was **not found on an allowed U.S. government page**. Lawrence 2005, *BAMS* 86:225–234, doi:10.1175/BAMS-86-2-225 (verified via Crossref), is the usual citation, but AMS blocked the request and the paper was not read.

## S6. NWS Burlington, VT: "Lifting Condensation Level" (item 6)

- **URL:** https://www.weather.gov/btv/profileLCL. NWS WFO Burlington. Undated; retrieved 2026-11-28.

> "The Lifting Condensation Level is the level at which a parcel becomes saturated. It can be used as a reasonable estimate of cloud base height when parcels experience forced ascent."

## S7. NASA Glenn Beginner's Guide to Aeronautics (item 7)

**(a) "Equation of State"**
- **URL:** https://www.grc.nasa.gov/www/k-12/airplane/eqstat.html. Editor and NASA Official: Nancy Hall. Last updated May 13, 2021. U.S. Government work.

> "The value of the equation of state for air is given on the slide as .286 kilo Joule per kilogram per Kelvin. The equation of state can be written in terms of the specific volume or in terms of the air density as p * v = R * T p = r * R * T"

> "the temperature given in the equation of state must be an absolute temperature that begins at absolute zero. In the metric system of units, we must specify the temperature in Kelvin (not degrees Celsius)."

> "We also define a new gas constant R, which is equal to the universal gas constant divided by the mass per mole of the gas."

**Discrepancy:** this page gives 0.286 kJ/(kg·K). The atmosphere-model page (b) uses .2869, and USSA 1976 implies 287.053 J/(kg·K) (S1, derived). Record all three. For R_d = 287 J/(kg·K) use the USSA derivation, and give .2869 as the closest printed NASA value.

**(b) "Earth Atmosphere Model – Metric Units"**
- **URL:** https://www.grc.nasa.gov/www/k-12/airplane/atmosmet.html. Same editor; last updated May 13, 2021.
- **Data kind:** curve fits to a 1960s standard atmosphere.

> "The troposphere runs from the surface of the Earth to 11,000 meters. In the troposphere, the temperature decreases linearly and the pressure decreases exponentially."

> "T = 15.04 - .00649 * h"; "p = 101.29 * [(T + 273.1)/288.08]^5.256" (°C, kPa, metres)

> "The lower stratosphere runs from 11,000 meters to 25,000 meters. … T = -56.46 p = 22.65 * exp(1.73 - .000157 * h)"

> "upper stratosphere … T = -131.21 + .00299 * h p = 2.488 * [(T + 273.1)/ 216.6]^-11.388"

> "r = p / [.2869 * (T + 273.1)]"

> "The pressure of the air can be related to the weight of the air over a given location."

## S8. Humphreys, *Physics of the Air* (1920), archive.org (items 3, 4)

- **Citation:** Humphreys, W. J. (1920). *Physics of the Air.* Philadelphia: Published for the Franklin Institute of the State of Pennsylvania by J. B. Lippincott Company.
- **URL:** archive.org identifier `cu31924000079552` (Cornell University Library copy): https://archive.org/details/cu31924000079552
- **Licence:** published in 1920, so public domain in the U.S.
- **Reading method:** quotes were read on page images. Leaf = printed page + 15.
- **Author bio:** not verified on an official page.
- **Data kind:** classic textbook theory. Units are CGS, with g = 981.

**p. 31 (leaf n46), dry adiabatic rate and stability:**
- Eq (5): −dT/dh = 981 A / C_p = 1/10293.

> "Clearly, then, when the atmosphere is dry and its temperature decreases with increase of altitude at the above adiabatic rate of 1° C. per 102.93 metres, any portion of it transferred without gain or loss of heat from one level to another has, at every stage, the same temperature and density as the adjacent air, and therefore, if abandoned at rest, will neither rise nor fall."

> "In short, the atmosphere is in neutral, stable, or unstable equilibrium according as the temperature decrease with increase of altitude is the same as, less than, or greater than the adiabatic rate of 1° C. per 102.93 metres (more or less, as g is less or more)."

1° C per 102.93 m = 9.72 K/km (my arithmetic). This differs slightly from the NWS 9.8 °C/km, so record both.

**p. 32 (leaf n47), saturated (moist) adiabatic:**
> "As soon as condensation sets in the latent heat of vaporization, and, if ice is formed, of fusion, is liberated, and thus the rate of temperature decrease with altitude is reduced. The amount of this reduction, often at least half the original value, depends, of course, slightly upon what becomes of the condensed vapor."

> "… then the process becomes that special case of the nonadiabatic which von Bezold, followed by others, has called pseudoadiabatic."

**pp. 62–63 (leaves n77–n78), hydrostatics and the homogeneous atmosphere (the forerunner of scale height):**
> "Further, let H be the height of the "homogeneous" atmosphere, or height it would have if everywhere at the same temperature and pressure, and therefore of constant density."

> "At any given place the pressure, p, clearly is equal to the continuous product of the gas density, local acceleration of gravity, and homogeneous height; that is, p = ρ₀gH …(4)"

> "For 0° C. and normal gravity G (that is, the value of gravity acceleration at sea level at latitude 45° N.), H_G = 7991 metres."

Eq (7): 7991 logₑ(p₀/p) = ∫ (1 − 0.378 w/p)/(1 + at) · (g/G) dh.

This is the integrated hydrostatic (hypsometric) equation.

Cross-check: USSA constants give R*T/(g₀M₀) = 7995 m at 273.15 K (derived). This agrees with 7991 m to within 0.05 %.

## S9. IPCC AR6 WG1, Chapter 8 "Water Cycle Changes" (item 5: Clausius–Clapeyron ≈7 %/K)

- **Citation:** Douville, H., K. Raghavan, J. Renwick, R.P. Allan, P.A. Arias, M. Barlow, R. Cerezo-Mota, A. Cherchi, T.Y. Gan, J. Gergis, D. Jiang, A. Khan, W. Pokam Mba, D. Rosenfeld, J. Tierney, and O. Zolina, 2021: Water Cycle Changes. In *Climate Change 2021: The Physical Science Basis.* Contribution of Working Group I to the Sixth Assessment Report of the IPCC [Masson-Delmotte, V. et al. (eds.)]. Cambridge University Press, pp. 1055–1210.
- **DOI:** 10.1017/9781009157896.010 (verified via Crossref: "Water Cycle Changes", pp. 1055–1210).
- **URL:** https://www.ipcc.ch/report/ar6/wg1/downloads/report/IPCC_AR6_WGI_Chapter08.pdf. Born-digital, read from the text layer.
- **Licence:** IPCC copyright; reproduction is permitted with citation under the IPCC terms. Short quotes only.
- **Data kind:** assessment of theory and observations.

**p. 1057 (Executive Summary):**
> "An increase in near-surface atmospheric water holding capacity of about 7% per 1°C of warming explains a similar magnitude of intensification of heavy precipitation events …"

**p. 1065 (§8.2.1):**
> "The Clausius–Clapeyron equation determines that low-altitude specific humidity increases by about 7% °C–1 of warming, assuming that relative humidity remains constant, which is approximately true at a global scale but not necessarily valid regionally."

**p. 1080:**
> "… global mean precipitable water vapour increases of 6.7 ± 0.3 % °C–1, very close to the Clausius–Clapeyron rate (Allan et al., 2020)."

Consistency check (my arithmetic): the NWS formula (S3) gives e_s(20 °C) ≈ 23.4 hPa and e_s(21 °C) ≈ 24.9 hPa, a rise of about 6.3 %.

---

## NOT FOUND / gaps

1. **NWS JetStream "Layers of the Atmosphere":** blocked. www.noaa.gov returned 403 (CloudFront) and weather.gov/jetstream redirects there. The layer wording is covered by the NWS glossary (S2), FAA Chapter 11 (S4) and USSA (S1). No authoritative exosphere height or thermopause/exobase number was found. USSA only gives T∞ = 1000 K and "about 500 km, where the mean free path exceeds the scale height" (printed p. 5).
2. **Bolton (1980) e_s = 6.112 exp(17.67T/(T+243.5)):** not read (AMS returned 403). Use the NWS EPZ formula 6.11×10^(7.5T/(237.3+T)) instead.
3. **The Clausius–Clapeyron differential equation itself** (d ln e_s/dT = L/(R_v T²)): no allowed source read gives it explicitly. Humphreys 1920 Chapter XII ("Condensation") might, but I did not read it. Only the ≈7 %/°C consequence (IPCC) is sourced.
4. **LCL ≈ 125 m per °C:** not found on an allowed government page. Only the FAA/NASA °F rule (÷4.4 × 1000 ft) is sourced. The brief's "400 ft/°F" is incorrect (≈227 ft/°F; ≈400 ft is per °C). Lawrence 2005 (doi:10.1175/BAMS-86-2-225) was not read. SPC Craven paper: robots-disallowed.
5. **Moist lapse rate "4–7 K/km":** not found as quoted. The sourced options are FAA "1.1 °C to 2.8 °C … per 1,000 feet" (≈3.6–9.2 K/km), Humphreys "often at least half" reduction, and the NWS MALR definition (not a constant).
6. **Dry adiabatic rate as g/c_p:** NWS gives 9.8 °C/km and Humphreys gives eq (5) 981A/C_p = 1° per 102.93 m (9.72 K/km). No modern source quoting "g/c_p" with c_p = 1004 J/(kg·K) was read.
7. **R_d = 287 J/(kg·K) printed exactly:** not found. NASA gives .286 and .2869 kJ/(kg·K); USSA implies 287.053 (derived).
8. **NWS glossary errors flagged:** the mesosphere entry says "about 20 km", and the ozone layer is placed "between the troposphere and the stratosphere". Do not use either.
