# Source notes — Phase 20B: radiation, greenhouse effect, atmospheric chemistry

Research date: 2026-11-28. Researcher: source-research subagent. Raw files: `/tmp/vv-research/p20/b/`.
User-Agent: `VoyagerVentures-Research/0.1 (educational; respects robots.txt)`; at least 1.2 s between requests per host.

## robots.txt / terms log

| Host | robots.txt result | Used? | Notes |
|---|---|---|---|
| science.nasa.gov | 200; `User-agent: * Allow: /` (crawl-delay 1 for usasearch) | yes | earthobservatory.nasa.gov and climate.nasa.gov now redirect here, including their /robots.txt. NASA content is generally not copyrighted (photos credited to third parties are excluded) |
| earthobservatory.nasa.gov | /robots.txt redirects to science.nasa.gov HTML (no separate file) | via redirect | final host is science.nasa.gov (allowed) |
| mynasadata.larc.nasa.gov | 200; standard Drupal file, `User-agent: *`, disallows only admin/core paths | yes | |
| ceres.larc.nasa.gov | 200; `Allow: /` | yes (education overview only; it had no flux numbers) | |
| nssdc.gsfc.nasa.gov | 200; disallows /cgi-bin, /nmc/t…, /database etc.; /planetary/ allowed | yes (Earth Fact Sheet only; /nmc/ not touched, per RULES) | |
| ntrs.nasa.gov | 200; `Allow: /` | yes | NTRS record: `GOV_PUBLIC_USE_PERMITTED` |
| gml.noaa.gov | 200; disallows /webdata/, /aftp/, /grad/nuebrew/nuebrewdata/ | yes (HTML pages only) | the annual-mean data files live under /webdata/, so they were **not** fetched |
| csl.noaa.gov | 200; disallows /cgi-bin, /css and several /groups/…/data paths | yes (/assessments/ allowed) | |
| courses.ems.psu.edu (redirect target of www.e-education.psu.edu) | www.e-education.psu.edu: `Crawl-delay: 10`, Drupal defaults; courses.ems.psu.edu: `User-agent: *`, disallows only Drupal admin paths | yes (1 page) | CC BY-NC-SA 4.0. Note: the courses.ems.psu.edu robots file was checked just *after* the single redirected fetch; it allows the path |
| www.ipcc.ch | robots 200 (disallows only /site/wp-admin/); **copyright page https://www.ipcc.ch/copyright/ returned 403** | **NO, stopped** | Per RULES, a 403 means stop using the host. Terms on AI/automated use could not be verified, so no IPCC text was used. archive.ipcc.ch was not touched for the same reason |
| ozonewatch.gsfc.nasa.gov | connection failed (curl rc 35, TLS error; robots.txt unreachable) | **NO** | logged; not worked around |
| atmos.jpl.nasa.gov | connection failed (no response) | **NO** | |
| archive.org | 200; disallows /control/, /report/ | searched only | Advanced search found no scans of Chapman 1930 or Phil. Mag. 1896 (see gaps) |
| www.noaa.gov | 200 (Drupal) | not needed | |

Off-limits hosts (Wikipedia, Wiley, IOP, etc.) were not fetched. Search-engine results that pointed to Wikipedia or webarchive.library.unt.edu were ignored.

---

## 1. Global energy budget: W/m² values

### 1a. NASA My NASA Data, "Earth's Energy Budget" (labelled diagram)
- **Page:** https://mynasadata.larc.nasa.gov/basic-page/earths-energy-budget (NASA Langley Research Center, My NASA Data education project). No page date in the text; the image path is dated `2022-10`.
- **Image (numbers read from the image itself):** https://mynasadata.larc.nasa.gov/sites/default/files/2022-10/earth_energy_budget_storyboard_slide_7_labels_and_numbers.png (raw: `mnd_budget.png`)
- **Image credit line (verbatim, bottom right):** "Loeb et al., J. Clim. 2009 / Trenberth et al., BAMS, 2009". **Caption (verbatim):** "All values are fluxes in Wm-2 and are average values based on ten years of data"
- **Data kind:** observation-based estimate (CERES satellite top-of-atmosphere fluxes combined with reanalysis/model surface terms). Shown here as an educational diagram.
- **Values (W m⁻², verbatim labels):**
  - incoming solar radiation **340.4**
  - reflected by clouds & atmosphere **77.0**; reflected by surface **22.9**; total reflected solar radiation **99.9**
  - absorbed by atmosphere (solar) **77.1**; absorbed by surface **163.3**
  - total outgoing infrared radiation **239.9** = emitted by atmosphere **169.9** + emitted by clouds **29.9** + atmospheric window **40.1**
  - emitted by surface **398.2**; absorbed by atmosphere (IR) **358.2**; back radiation **340.3**
  - thermals (conduction/convection) **18.4**; latent heat (evapotranspiration) **86.4**
  - net absorbed **0.6**
- **Consistency checks (my arithmetic, not a quote):** 77.0 + 22.9 = 99.9 ✓. 169.9 + 29.9 + 40.1 = 239.9 ✓. 340.4 − 99.9 − 239.9 = 0.6 ✓. Surface: 163.3 + 340.3 − 398.2 − 18.4 − 86.4 = 0.6 ✓.
- **Same page, verbatim text:** "Earth strives to maintain a balance between the overall amount of incoming and outgoing energy at the top of the atmosphere. This is called Earth's energy budget or Earth's radiation budget. … For Earth's temperature to be stable over long periods of time (for the energy budget to be in balance), the amount incoming energy and outgoing energy must be equal. If incoming energy is more than outgoing energy, Earth will warm. If outgoing energy is greater than incoming energy, Earth will cool."
- The page also quotes NASA Science (2010) "The Earth's Radiation Budget" (https://science.nasa.gov/ems/13_radiationbudget, which I also fetched; it has the same wording): "The units of energy employed in measuring this incoming and outgoing radiation are watts per square meter (W/m2)."
- The page credits the diagram to NASA SVS "GMS: Earth's Energy Budget" (2017-07-20, https://svs.gsfc.nasa.gov/11937). I did not fetch svs.gsfc.nasa.gov.

### 1b. NASA Earth Observatory, "Climate and Earth's Energy Budget" (percent-based narrative)
- **Citation:** Lindsey, R. (2009, 14 Jan). *Climate and Earth's Energy Budget.* NASA Earth Observatory. Now at https://science.nasa.gov/earth/earth-observatory/climate-and-earths-energy-budget/ (redirected from earthobservatory.nasa.gov/features/EnergyBalance). Page "Last Updated Sep 18, 2025". Byline: "NASA Earth Observatory story by Rebecca Lindsey". Bio: not verified.
- Figure credit (verbatim): "NASA illustration by Robert Simmon, adapted from Trenberth et al. 2009, using CERES flux estimates provided by Norman Loeb."
- **Data kind:** educational simplification based on Trenberth et al. 2009 and CERES.
- **Verbatim quotes:**
  - "the Earth system—land surfaces, oceans, and atmosphere—absorbs an average of about 240 watts of solar power per square meter"
  - "the average intensity of solar energy reaching the top of the atmosphere directly facing the Sun is about 1,360 watts per square meter, according to measurements made by the most recent NASA satellite missions."
  - "Averaged over the entire planet, the amount of sunlight arriving at the top of Earth's atmosphere is only one-fourth of the total solar irradiance, or approximately 340 watts per square meter."
  - "About 29 percent of the solar energy that arrives at the top of the atmosphere is reflected back to space by clouds, atmospheric particles, or bright ground surfaces like sea ice and snow. … About 23 percent of incoming solar energy is absorbed in the atmosphere by water vapor, dust, and ozone, and 48 percent passes through the atmosphere and is absorbed by the surface. Thus, about 71 percent of the total incoming solar energy is absorbed by the Earth system."
  - "About 25 percent of incoming solar energy leaves the surface through evaporation." / "An additional 5 percent of incoming solar energy leaves the surface through convection."
  - "[a net] of about 17 percent of incoming solar energy leaves the surface as thermal infrared energy … This net upward flux results from two large but opposing fluxes: heat flowing upward from the surface to the atmosphere (117%) and heat flowing downward from the atmosphere to the ground (100%)."
  - "The atmosphere radiates heat equivalent to 59 percent of incoming sunlight; the surface radiates only 12 percent."
  - "The natural greenhouse effect raises the Earth's surface temperature to about 15 degrees Celsius on average—more than 30 degrees warmer than it would be if it didn't have an atmosphere. The amount of heat radiated from the atmosphere to the surface (sometimes called "back radiation") is equivalent to 100 percent of the incoming solar energy."
  - "The peak radiation from the surface is at thermal infrared wavelengths around 12.5 micrometers."
  - "The exact amount of the energy imbalance is very hard to measure, but it appears to be a little over 0.8 watts per square meter." (2009 text)

### Differences between sources (record both)
| Quantity | My NASA Data diagram (W m⁻²) | Earth Observatory % × 340 (my arithmetic) | Comment |
|---|---|---|---|
| Incoming | 340.4 | 340 | — |
| Reflected | 99.9 (≈29.3%) | 29% ≈ 98.6 | consistent |
| Absorbed by atmosphere (solar) | 77.1 (22.6%) | 23% ≈ 78 | consistent |
| Absorbed by surface | 163.3 (48.0%) | 48% ≈ 163 | consistent |
| Latent heat | 86.4 (25.4%) | 25% ≈ 85 | consistent |
| Sensible (thermals) | 18.4 (5.4%) | 5% ≈ 17 | consistent |
| Surface emission | 398.2 (117.0%) | 117% ≈ 398 | consistent |
| Back radiation | 340.3 (100.0%) | 100% ≈ 340 | consistent |
| Net imbalance | 0.6 | "a little over 0.8" | **differs**: different estimates and periods |
| TSI | — | ~1,360 | Earth Fact Sheet: 1361.0 |
- The brief's "back radiation ~342" and "latent ~80–88, sensible ~18–20" are not used by these NASA sources; the NASA values are 340.3, 86.4 and 18.4. Trenberth et al. 2009 BAMS (341.3 / 333 / 80 / 17 / 396) and Wild et al. 2013 or Loeb et al. 2018 were **not fetched** (see gaps), so their numbers are not recorded here as verified.

## 2. Planetary albedo and effective temperature: NASA Earth Fact Sheet
- **Citation:** Williams, D. R. *Earth Fact Sheet.* NASA Goddard Space Flight Center (NSSDCA). https://nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html. "Last Updated: 15 November 2024, DRW". Author/Curator line: "Dr. David R. Williams". Bio: not verified. Public domain (US Government).
- **Verbatim table rows:** "Bond albedo 0.294"; "Geometric albedo 0.434"; "Solar irradiance (W/m2) 1361.0"; "Black-body temperature (K) 254.0"
- **Data kind:** compiled reference values.
- **Cross-check:** the NOAA AGGI page (item 5) cites this: "(planetary albedo = 0.294; Williams, 2024)". The Earth Observatory gives "About 29 percent"; the diagram gives 99.9/340.4 = 0.293. **The fact sheet gives 254.0 K, not the brief's 255 K.** The app should show 254.0 K if it cites this source.

## 3. Greenhouse absorption bands
### 3a. NASA Earth Observatory energy-budget page (same citation as 1b), section "Climate Forcings and Global Warming"
- "The most important of these "water vapor windows" is for thermal infrared with wavelengths centered around 10 micrometers. (The maximum transparency occurs at 10 micrometers, but partial transparency occurs for wavelengths between about 8 and about 14 micrometers.)"
- "Carbon dioxide is a very strong absorber of thermal infrared energy with wavelengths longer than 12-13 micrometers, which means that increasing concentrations of carbon dioxide partially "close" the atmospheric window."
- Figure caption: "Carbon dioxide is not as strong a greenhouse gas as water vapor, but it absorbs energy in wavelengths (12-15 micrometers) that water vapor does not, partially closing the "window" through which heat radiated by the surface would normally escape to space." Credit: "Illustration adapted from Robert Rohde."
- "Just as the major atmospheric gases (oxygen and nitrogen) are transparent to incoming sunlight, they are also transparent to outgoing thermal infrared. However, water vapor, carbon dioxide, methane, and other trace gases are opaque to many wavelengths of thermal infrared energy."

### 3b. NASA Technical Note D-1850 (1963), a primary NASA report. Numbers read on the page images.
- **Citation:** Hanel, R. A., Bandeen, W. R., & Conrath, B. J. (1963, September). *The Infrared Horizon of the Planet Earth.* NASA TN D-1850. Goddard Space Flight Center. NTRS 19630010723. https://ntrs.nasa.gov/citations/19630010723 (PDF: https://ntrs.nasa.gov/api/citations/19630010723/downloads/19630010723.pdf). NTRS copyright determination: `GOV_PUBLIC_USE_PERMITTED`. No DOI. Raw: `ntrs1963.pdf`; page images `ntrs_r_p5.jpg` (Summary, p. i) and `ntrs_s_p10.jpg` (p. 2). The PDF is a scan, so its OCR was used only to locate pages; the numbers were confirmed on the images.
- **Data kind:** model calculation (1963 radiative-transfer study).
- **Summary, p. i (verbatim):** "Calculations are carried out for the following five spectral intervals: the water vapor band from 6.33 to 6.85 microns, the ozone band from 8.9 to 10.1 microns, the atmospheric window from 10.75 to 11.75 microns, the carbon dioxide band from 14 to 16 microns, and finally the rotational water vapor band from 21 to 125 microns."
- **p. 2 (verbatim):** "Water vapor, carbon dioxide, and ozone have strong absorption bands in this range, which must be considered."
- **p. 2, Table 1 "Wavelength Intervals Considered":**

  | Wavelength (microns) | Major absorber | Secondary absorbers |
  |---|---|---|
  | 6.33–6.85 | H₂O | None |
  | 8.9–10.1 | O₃ | H₂O continuum |
  | 10.75–11.75 | H₂O continuum | Dust |
  | 14–16 | CO₂ | O₃, H₂O |
  | 21–125 | H₂O | None |
- **p. 2 (verbatim):** "The intervals between the quoted wavelength regions, such as between 12 to 14 microns and 16 to 21 microns, are characterized by overlapping bands and semitransparent gaps."
- Supports: CO₂ band around 15 µm (14–16), O₃ band around 9.6 µm (8.9–10.1), H₂O 6.3 µm band and rotational band, and the 10.75–11.75 µm window. It does **not** cover CO₂ 4.3 µm or CH₄ 7.7 µm.

## 4. CO₂ forcing formula, doubling, concentrations
### 4a. Penn State METEO 469 (open courseware)
- **Citation:** Mann, M. E., & Gaudet, B. *METEO 469: From Meteorology to Mitigation: Understanding Global Warming*, Lesson 6, "Stabilizing CO₂ Concentrations." College of Earth and Mineral Sciences, The Pennsylvania State University. https://www.e-education.psu.edu/meteo469/node/146 (redirects to https://courses.ems.psu.edu/meteo469/node/146). Licence: "Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License". No page date seen. Bio: not verified.
- **Data kind:** educational simplification. The original source is Myhre et al. 1998, which is off-limits (Wiley) and was not fetched.
- **Verbatim (the equation is MathML; reconstructed from its markup):** "the radiative forcing due to a given increase in atmospheric CO2 concentration, ΔF_CO2, can be approximated as: ΔF_CO2 = 5.35 ln([CO2]/[CO2]0) where [CO2]0 is the initial concentration and [CO2] is the final concentration. This gives a forcing for doubling of CO2 from pre-industrial values (i.e., [CO2]0 = 280 ppm and [CO2] = 560 ppm) of just under 4 W m-2."
- My arithmetic (not a quote): 5.35 × ln 2 = 3.708 W m⁻².
- The same page says "current levels of around 410 ppm". That is outdated; use NOAA (4c) instead.

### 4b. IPCC: NOT USED
www.ipcc.ch/copyright/ returned 403, so the host was not used (see log). The IPCC TAR/AR5/AR6 quotations of 5.35 ln(C/C0) and of 3.7–3.9 W m⁻² per doubling are therefore **not verified**.

### 4c. NOAA GML CO₂ trends (Lan, Tans, Thoning; the NOAA page lists the authors, but I did not record the byline)
- Global page: https://gml.noaa.gov/ccgg/trends/global.html. Verbatim: "Global Monthly Mean CO2 / August 2026: 424.68 ppm / August 2025: 422.98 ppm / Last updated: Nov 19, 2026". The page describes these as "monthly mean carbon dioxide globally averaged over marine surface sites" and says "The last year of data are still preliminary".
- Mauna Loa page: https://gml.noaa.gov/ccgg/trends/. Verbatim: "Monthly Average Mauna Loa CO2 / October 2026: 426.69 ppm / October 2025: 424.87 ppm / Last updated: Nov 19, 2026".
- The global page's HTML also contains a commented-out stale block ("March 2019 411.04 ppm", "March 2018 408.52 ppm"). It is not displayed and must not be used.
- Units (verbatim): "Data are reported as a dry air mole fraction … The mole fraction is expressed as parts per million (ppm). Example: 0.000400 is expressed as 400 ppm."
- **Data kind:** observation (2026 values preliminary).
- Annual-mean data files are under /webdata/ (disallowed by robots), so they were not fetched. Use the AGGI annual figure in 5 (425.62 ppm for 2025).

## 5. NOAA Annual Greenhouse Gas Index (AGGI)
- **Citation:** NOAA Global Monitoring Laboratory. *The NOAA Annual Greenhouse Gas Index (AGGI).* "Updated Fall 2026" (2025 results). https://gml.noaa.gov/aggi/aggi.html. Contact listed: Stephen.A.Montzka@noaa.gov. US Government work.
- **Data kind:** observation-derived effective radiative forcing (ERF), using IPCC AR6 expressions.
- **Verbatim:**
  - "For 2025, the AGGI was 1.56, which represents a 56% increase in effective radiative forcing from these gases since 1990."
  - "In absolute terms, this increase equates to an additional 3.59 W m-2 of heat being retained by Earth's climate system relative to preindustrial times."
  - "Carbon dioxide was by far the largest contributor to effective radiative forcing from these gases (2.37 W m-2 or 66% of the total) and methane was the second largest contributor (0.57 W m-2 or 16% of the total)."
  - CO₂ "425.62 ± 0.05 ppm in 2025"; "has increased by an average of 1.94 ppm per year over the past 47 years (1979-2025)"; "it averaged 2.5 ppm per year during the last decade (2016-2025)"; CO₂ "abundance was stable at 270 - 280 ppm between the end of the last ice age and around 1850 at the start of the Industrial Revolution [IPCC, 2021]"
  - CH₄ "1936.03 ± 0.48 ppb in 2025, which is more than 2.5 times higher than its preindustrial value in 1750"
  - N₂O "2025 reached 338.86 ± 0.02 ppb"
  - "The extra 3.59 W m-2 of warming influence supplied in 2025 … represents approximately 1.5% of the heat intercepted by the Earth from the Sun on an ongoing basis (240 W m-2) after accounting for the energy reflected back to space (planetary albedo = 0.294; Williams, 2024)."
- **Table 2 row for 2025 (W m⁻²):** CO₂ 2.372 | CH₄ 0.569 | N₂O 0.229 | CFCs* 0.295 | HCFCs 0.060 | HFCs* 0.062 | Total 3.587 | CO₂-eq 544 ppm | AGGI 1.559 | % change 1.9.
  - 2024 row: 2.333 | 0.567 | 0.226 | 0.298 | 0.060 | 0.059 | 3.543 | 540 | 1.540 | 2.3.
  - **Discrepancy:** the Table 2 caption reads "1979-2024", but the table contains a 2025 row.
- **Table 1 (formula used):** CO₂ "ΔF = (α' + c1*√N) · ln(C/Co) · e1 where α' = d1 + a1(C - Co)^2 + b1(C - Co)", with d1 = 5.2488, a1 = -2.48E-07, b1 = 7.59E-04, c1 = -2.15E-03, e1 = 1.05; "Co = 278.3 ppm, Mo = 729.2 ppb, No = 270.1 ppb". Source given: "[Meinshausen et al. 2020] Forster et al. [2021], and Smith et al. [2021]".
  - **Note:** NOAA no longer uses the simple 5.35 ln form, and its pre-industrial CO₂ is 278.3 ppm (Penn State uses 280).
- The page cites Tyndall (1861) Phil. Trans. 151, 1–37 and Arrhenius (1896). I verified these only as references on this page, not from the originals.

## 6. Ozone: NOAA CSL / WMO *Twenty Questions* (2022 update)
- **Citation:** Salawitch, R. J. (Lead Author), McBride, L. A., Thompson, C. R., Fleming, E. L., McKenzie, R. L., Rosenlof, K. H., Doherty, S. J., Fahey, D. W., *Twenty Questions and Answers About the Ozone Layer: 2022 Update*, Scientific Assessment of Ozone Depletion: 2022, 75 pp., World Meteorological Organization, Geneva, 2023. Hosted by NOAA Chemical Sciences Laboratory: https://csl.noaa.gov/assessments/ozone/2022/twentyquestions/ (citation as given on the page; the author list may be longer, since the page text ends with a trailing comma). Licence not stated on the HTML page; it is a WMO/UNEP publication hosted by NOAA. Bios: not verified.
- **Data kind:** assessment / educational synthesis.
- **Verbatim, Q1:** "In the stratosphere, the process begins with an oxygen molecule (O2) being broken apart by ultraviolet radiation from the Sun." and "In the first step, solar ultraviolet radiation breaks apart one oxygen molecule (O2) to produce two oxygen atoms (2 O) (see Figure Q1-3). In the second step, each of these highly reactive oxygen atoms combines with an oxygen molecule to produce an ozone molecule (O3). These reactions occur continually whenever solar ultraviolet radiation is present in the stratosphere. As a result, the largest ozone production occurs in the tropical stratosphere."
- "About 10% of Earth's ozone is in the troposphere … About 90% of Earth's ozone resides in the stratosphere"
- **Verbatim, Q3:** "Total column ozone values are usually reported in Dobson units denoted as "DU." Typical values vary between 200 and 500 DU over the globe, with a global average abundance of about 300 DU … The ozone molecules required for total ozone to be 300 DU would form a layer of pure ozone gas at Earth's surface having a thickness of only 3 millimeters (0.12 inches)"
- **Glossary (verbatim):** "DU Dobson unit, a measure of total column ozone; 1 DU = 2.687 ×10^16 molecules/cm^2". The brief's 2.69×10^16 is a rounding of this.
- **UV bands (verbatim, Q2):** "UV-C (100 to 280 nanometer (nm) wavelengths); UV-B (280 to 315 nm), and UV-A (315 to 400 nm). … UV-C radiation is entirely absorbed within the ozone layer. Most UV-B radiation emitted by the Sun is absorbed by the ozone layer; the rest reaches Earth's surface."
- Q10: "Minimum values of total ozone inside the ozone hole are close to 150 Dobson units (DU), compared with Antarctic springtime values of about 350 DU observed in the early 1970s"; the ozone-hole area is "the geographical region within the 220-Dobson unit (DU) contour".
- **Not in this source:** the word "Chapman", the "Hartley band", or the explicit O + O2 + M → O3 reaction with its third body M. The narrative two-step description above is what this source gives.

## 7. Aerosols: NASA Earth Observatory
- **Citation:** Voiland, A. (2010, 2 Nov). *Aerosols: Tiny Particles, Big Impact.* NASA Earth Observatory. https://science.nasa.gov/earth/earth-observatory/aerosols/ (redirected from earthobservatory.nasa.gov/features/Aerosols). "Last Updated Oct 02, 2026". Byline: "NASA Earth Observatory story by Adam Voiland; Design by Robert Simmon". Bio: not verified.
- **Data kind:** educational synthesis.
- **Verbatim:**
  - "These ubiquitous specks of matter are known as aerosols … They drift in Earth's atmosphere from the stratosphere to the surface and range in size from a few nanometers—less than the width of the smallest viruses—to several several tens of micrometers—about the diameter of human hair." (The source really does print "several several".)
  - "Key aerosol groups include sulfates, organic carbon, black carbon, nitrates, mineral dust, and sea salt."
  - "The bulk of aerosols—about 90 percent by mass—have natural origins."
  - "most aerosols remain suspended in the atmosphere for short periods—typically between four days and a week"
  - "Different aerosols scatter or absorb sunlight to varying degrees, depending on their physical properties. Climatologists describe these scattering and absorbing properties as the "direct effect" of aerosols on Earth's radiation field."
  - "Pure sulfates and nitrates reflect nearly all radiation they encounter, cooling the atmosphere. Black carbon, in contrast, absorbs radiation readily, warming the atmosphere but also shading the surface."
  - "In 1991, the eruption of Mount Pinatubo in the Philippines ejected more than 20 million tons of sulfur dioxide"
  - "Models estimate that aerosols have had a cooling effect that has counteracted about half of the warming caused by the build-up of greenhouse gases since the 1880s." (model output)
  - "In fact, most clouds owe their existence to aerosols that serve as the tiny "seeds," called cloud condensation nuclei."
  - "pollution-rich clouds tend to have more numerous, but smaller, droplets. The small droplets make polluted clouds look brighter"
  - "Values for most aerosols range from about 0.7 for very absorbing particles to 1 for aerosols that only scatter light." (single scattering albedo)

---

## NOT FOUND / gaps
1. **IPCC (TAR/AR5/AR6) text for 5.35 ln(C/C0) and the 3.7–3.9 W m⁻² doubling forcing:** not used, because the IPCC copyright page returned 403. The only formula source is Penn State METEO 469 (CC BY-NC-SA), which gives "just under 4 W m-2". A government source stating 3.7 W m⁻² was not found.
2. **CO₂ 4.3 µm band and CH₄ 7.7 µm band:** no accredited, accessible source found. Search results pointed to unverifiable secondary documents and Wikipedia, which were not used.
3. **Hartley band (200–300 nm) and the Chapman mechanism by name / Chapman 1930:** not found. archive.org search returned no scan of *Memoirs of the Royal Meteorological Society* vol. 3. NASA Ozone Watch was unreachable (TLS error).
4. **Tyndall 1861 / Arrhenius 1896 page images:** not located on archive.org in the time available. They are cited only as references on the NOAA AGGI page.
5. **Loeb et al. 2018 (J. Climate), Wild et al. 2013, and Trenberth et al. 2009 (BAMS):** not fetched or verified. The NASA diagram credits "Loeb et al., J. Clim. 2009 / Trenberth et al., BAMS, 2009".
6. **255 K:** the NASA fact sheet gives 254.0 K. No NASA source checked here states 255 K.
7. **Annual global-mean CO₂ for 2025 from the GML data file:** the file is under robots-disallowed /webdata/. The AGGI value (425.62 ppm) is used instead.
8. **Author bios:** none verified (Lindsey, Voiland, Williams, Hanel, Mann, Salawitch).
