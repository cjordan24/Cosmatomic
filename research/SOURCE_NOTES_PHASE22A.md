# Source notes — Phase 22A: planet-atmosphere comparison numbers

Research date: 2026-11-28. Rules: /tmp/vv-research/p20/RULES.md. Raw files: /tmp/vv-research/p22/a/.
User-Agent: "VoyagerVentures-Research/0.1 (educational; respects robots.txt)"; ≥1.2 s between requests per host.

## robots.txt log (fetched first, separately)

| Host | robots.txt | Result for paths used |
|---|---|---|
| nssdc.gsfc.nasa.gov | 200 | `/planetary/` not disallowed (only /nmc/ subpaths, /cgi-bin/, etc.). /nmc/ NOT fetched. |
| science.nasa.gov | 200 | `User-agent: * Allow: /` |
| www.nasa.gov | 200 | `User-agent: * Allow: /` |
| ntrs.nasa.gov | 200 | `User-agent: * Allow: /` |
| mars.nasa.gov | 404 (no robots) | Only used as a redirect; it sent the MAVEN URL to a generic page, so I used the www.nasa.gov copy instead |
| svs.gsfc.nasa.gov | 404 (no robots) → no restrictions | /12046/ fetched |
| astrobiology.nasa.gov | 404 (no robots) | not used |
| www.esa.int | 200, `Disallow:` (empty) | allowed, but not needed (NASA sources sufficed) |
| arxiv.org | 200, Crawl-delay 15, /abs /pdf allowed | not fetched (not needed) |

No bot walls or 403s were hit. No off-limits host was fetched. The Wang et al. reprint has a Wiley watermark, but it was downloaded from ntrs.nasa.gov, not from wiley.com.

---

## 1. NSSDCA Planetary Fact Sheets — "Atmosphere" sections (verbatim)

Citation: Williams, D. R. (Author/Curator), *Planetary Fact Sheets*, NASA Space Science Data Coordinated Archive (NSSDCA), NASA Goddard Space Flight Center. U.S. Government work (public domain). Data kind: compiled reference values (observation-based compilation).
Author: "Dr. David R. Williams, dave.williams@nasa.gov, NSSDCA, Mail Code 690.1, NASA Goddard Space Flight Center" (this is the curator line printed on each page; no further bio verified).
Transcription: `^` stands for a superscript in the HTML (e.g. `10^20`) and `_` for a subscript (e.g. `CO_2`). Line breaks are as printed.

### Mercury — https://nssdc.gsfc.nasa.gov/planetary/factsheet/mercuryfact.html
"Last Updated: 11 January 2024, DRW" (Author/Curator: Dr. David R. Williams, NSSDCA, NASA GSFC). Raw: /tmp/vv-research/p22/a/nssdc_mercury.html

```
Atmosphere (Exosphere)
Surface pressure: <~5 x 10^-15 bar (0.005 picobar)
Average temperature: 440 K (167 C) (590-725 K, sunward side)
Total mass of atmosphere: <~10000 kg
Atmospheric composition (Column abundances in 10^6 per cm^2):
Sodium 12,000-200,000; Magnesium 100,000; Oxygen <40,000; Hydrogen 5000, Potassium 800-1300,
Calcium 300-1000; Iron <300; Aluminum 15; and
possible trace amounts of Argon (Ar), Carbon Dioxide (CO_2),
Water (H_2O), Nitrogen (N_2), Xenon (Xe), Krypton (Kr),
Neon (Ne), Helium (He)
(The atmosphere of Mercury is a surface bounded exosphere, essentially a vacuum.
Values for some species can vary with local time or location, these are given as ranges.)
```

### Venus — https://nssdc.gsfc.nasa.gov/planetary/factsheet/venusfact.html
"Last Updated: 11 January 2024, DRW" (Author/Curator: Dr. David R. Williams, NSSDCA, NASA GSFC). Raw: /tmp/vv-research/p22/a/nssdc_venus.html

```
Atmosphere
Surface pressure: 92 bars
Surface density: ~65. kg/m^3
Scale height: 15.9 km
Total mass of atmosphere:  ~4.8 x 10^20 kg
Average temperature: 737 K (464 C)
Diurnal temperature range: ~0
Wind speeds: 0.3 to 1.0 m/s (surface)
Mean molecular weight: 43.45
Atmospheric composition (near surface, by volume):
    Major:       96.5% Carbon Dioxide (CO_2), 3.5% Nitrogen (N_2)
    Minor (ppm): Sulfur Dioxide (SO_2) - 150; Argon (Ar) - 70; Water (H_2O) - 20;
                 Carbon Monoxide (CO) - 17; Helium (He) - 12; Neon (Ne) - 7
```

### Earth — https://nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html
"Last Updated: 15 November 2024, DRW" (Author/Curator: Dr. David R. Williams, NSSDCA, NASA GSFC). Raw: /tmp/vv-research/p22/a/nssdc_earth.html

```
Atmosphere
Surface pressure: 1014 mb
Surface density: 1.217 kg/m^3
Scale height: 8.5 km
Total mass of atmosphere:  5.1 x 10^18 kg
Total mass of hydrosphere:  1.4 x 10^21 kg
Average temperature:  288 K (15 C)
Diurnal temperature range: 283 K to 293 K (10 to 20 C)
Wind speeds: 0 to 100 m/s
Mean molecular weight: 28.97
Atmospheric composition (by volume, dry air):
    Major      : 78.08% Nitrogen (N_2), 20.95% Oxygen (O_2),
    Minor (ppm): Argon (Ar) - 9340; Carbon Dioxide (CO_2) - 420
                 Neon (Ne) - 18.18; Helium (He) - 5.24; CH_4 - 1.94
                 Krypton (Kr) - 1.14; Hydrogen (H_2) - 0.55
    Numbers do not add up to exactly 100% due to roundoff and uncertainty
    Water is highly variable, typically makes up about 1%
Note that the acceleration values given are for the equator and pole.
The standard acceleration of gravity for Earth is defined
(CODATA 2018) as 9.80665 m/s^2 (exact).
```

### Mars — https://nssdc.gsfc.nasa.gov/planetary/factsheet/marsfact.html
"Last Updated: 19 May 2025, DRW" (Author/Curator: Dr. David R. Williams, NSSDCA, NASA GSFC). Raw: /tmp/vv-research/p22/a/nssdc_mars.html

```
Atmosphere
Surface pressure:  6.36 mb at mean radius (variable from 4.0 to 8.7 mb depending on season)
                   [6.9 mb to 9 mb (Viking 1 Lander site)]
Surface density: ~0.016 +/- 0.006 kg/m^3
Scale height:  11.0 km
Total mass of atmosphere: ~2.5 x 10^16 kg
Average temperature:  ~214 K (-59 C)
Diurnal temperature range: 184 K to 242 K (-89 to -31 C) (Viking 1 Lander site)
Wind speeds:  2-7 m/s (summer), 5-10 m/s (fall), 17-30 m/s (dust storm) (Viking Lander sites)
Mean molecular weight: 43.49
Atmospheric composition (by volume):
    Major      : Carbon Dioxide (CO_2) - 95.1% ; Nitrogen (N_2) - 2.59%
                 Argon (Ar) - 1.94%; Oxygen (O_2) - 0.16%; Carbon Monoxide (CO) - 0.06%
    Minor (ppm): Water (H_2O) - 210; Nitrogen Oxide (NO) - 100; Neon (Ne) - 2.5;
                 Hydrogen-Deuterium-Oxygen (HDO) - 0.85; Krypton (Kr) - 0.3;
		 Xenon (Xe) - 0.08
```

### Jupiter — https://nssdc.gsfc.nasa.gov/planetary/factsheet/jupiterfact.html
"Last Updated: 2 October 2024, DRW" (Author/Curator: Dr. David R. Williams, NSSDCA, NASA GSFC). Raw: /tmp/vv-research/p22/a/nssdc_jupiter.html

```
Atmosphere
Surface Pressure: >>1000 bars
Temperature at 1 bar: 165 K (-108 C)
Temperature at 0.1 bar: 112 K (-161 C)
Density at 1 bar: 0.16 kg/m^3
Wind speeds
   Up to 150 m/s (<30 degrees latitude)
   Up to  40 m/s (>30 degrees latitude)
Scale height: 27 km
Mean molecular weight: 2.22
Atmospheric composition (by volume, uncertainty in parentheses)
    Major:       Molecular hydrogen (H_2) - 89.8% (2.0%); Helium (He) - 10.2% (2.0%)
    Minor (ppm): Methane (CH_4) - 3000 (1000); Ammonia (NH_3) - 260 (40);
                 Hydrogen Deuteride (HD) - 28 (10); Ethane (C_2H_6) - 5.8 (1.5);
                 Water (H_2O) - 4 (varies with pressure)
    Aerosols:    Ammonia ice, water ice, ammonia hydrosulfide
```

### Saturn — https://nssdc.gsfc.nasa.gov/planetary/factsheet/saturnfact.html
"Last Updated: 18 March 2025, DRW" (Author/Curator: Dr. David R. Williams, NSSDCA, NASA GSFC). Raw: /tmp/vv-research/p22/a/nssdc_saturn.html

```
Atmosphere
Surface Pressure: >>1000 bars
Temperature at 1 bar: 134 K (-139 C)
Temperature at 0.1 bar: 84 K (-189 C)
Density at 1 bar: 0.19 kg/m^3
Wind speeds
   Up to 400 m/s (<30 degrees latitude)
   Up to 150 m/s (>30 degrees latitude)
Scale height: 59.5 km
Mean molecular weight: 2.07
Atmospheric composition (by volume, uncertainty in parentheses)
    Major:       Molecular hydrogen (H_2) - 96.3% (2.4%); Helium (He) - 3.25% (2.4%)
    Minor (ppm): Methane (CH_4) - 4500 (2000); Ammonia
(NH_3) - 125 (75);
                 Hydrogen Deuteride (HD) - 110 (58); Ethane
(C_2H_6) - 7 (1.5)
    Aerosols:    Ammonia ice, water ice, ammonia hydrosulfide
```

### Uranus — https://nssdc.gsfc.nasa.gov/planetary/factsheet/uranusfact.html
"Last Updated: 2 October 2024, DRW" (Author/Curator: Dr. David R. Williams, NSSDCA, NASA GSFC). Raw: /tmp/vv-research/p22/a/nssdc_uranus.html

```
Atmosphere
Surface Pressure: >>1000 bars
Temperature at 1 bar: 76 K (-197 C)
Temperature at 0.1 bar: 53 K (-220 C)
Density at 1 bar: 0.42 kg/m^3
Wind speeds: 0-250 m/s
Scale height: 27.7 km
Mean molecular weight: 2.64
Atmospheric composition (by volume, uncertainty in parentheses)
    Major:       Molecular hydrogen (H_2) - 82.5% (3.3%); Helium (He) - 15.2% (3.3%)
                 Methane (CH_4) - 2.3%
    Minor (ppm): Hydrogen Deuteride (HD) - 148
    Aerosols:    Ammonia ice, water ice, ammonia hydrosulfide, methane ice(?)
```

### Neptune — https://nssdc.gsfc.nasa.gov/planetary/factsheet/neptunefact.html
"Last Updated: 3 October 2024, DRW" (Author/Curator: Dr. David R. Williams, NSSDCA, NASA GSFC). Raw: /tmp/vv-research/p22/a/nssdc_neptune.html

```
Atmosphere
Surface Pressure: >>1000 bars
Temperature at 1 bar: 72 K (-201 C)
Temperature at 0.1 bar: 55 K (-218 C)
Density at 1 bar: 0.45 kg/m^3
Wind speeds: 0-580 m/s
Scale height: 19.1 - 20.3 km
Mean molecular weight: 2.53 - 2.69
Atmospheric composition (by volume, uncertainty in parentheses)
    Major:       Molecular hydrogen (H_2) - 80.0% (3.2%); Helium (He) - 19.0% (3.2%);
                 Methane (CH_4) 1.5% (0.5%)
    Minor (ppm): Hydrogen Deuteride (HD) - 192; Ethane (C_2H_6) - 1.5
    Aerosols:    Ammonia ice, water ice, ammonia hydrosulfide, methane ice(?)
```

### Pluto — https://nssdc.gsfc.nasa.gov/planetary/factsheet/plutofact.html
"Last Updated: 11 January 2024, DRW" (Author/Curator: Dr. David R. Williams, NSSDCA, NASA GSFC). Raw: /tmp/vv-research/p22/a/nssdc_pluto.html

```
Atmosphere
Surface Pressure: ~13 microbar
Surface temperature: 24 - 38 K (-247 - -233 C)
Scale height: ~18 km lower atmosphere, ~50 km above 30 km
Mean molecular weight: ~28
Atmospheric composition:  99% Nitrogen (N_2), 0.5% Methane (CH_4), 0.05% Carbon Monoxide (CO), trace HCN, C_2H_x hydrocarbons
```

**Definitions page** (https://nssdc.gsfc.nasa.gov/planetary/factsheet/planetfact_notes.html, "Last Updated: 20 December 2021, DRW"):
- "Mean Temperature (C or F) - This is the average temperature over the whole planet's surface (or for the gas giants at the one bar level) in degrees C (Celsius or Centigrade) or degrees F (Fahrenheit)."
- "Surface Pressure (bars or atmospheres) - This is the atmospheric pressure (the weight of the atmosphere per unit area) at the surface of the planet in bars or atmospheres. *The surfaces of Jupiter, Saturn, Uranus, and Neptune are deep in the atmosphere and the location and pressures are not known."

**Notes and disagreements to record:**
- Giant-planet sheets give "Surface Pressure: >>1000 bars" and use the 1 bar and 0.1 bar levels for temperature and density. None of them gives a total atmospheric mass or a surface density.
- Pluto: the NSSDCA sheet says "~13 microbar". Other NASA sources give ~11 µbar and "1/100-thousandth" of Earth's (see §5). Record all three.
- Mercury: the composition is given as column abundances (10^6 per cm^2), not volume fractions. No mean molecular weight or scale height is given.
- Earth: the sheet gives CO_2 as 420 ppm. Neptune gives a range for scale height (19.1 - 20.3 km) and for mean molecular weight (2.53 - 2.69).
- Mars: the surface pressure "6.36 mb at mean radius" also carries a seasonal range and a Viking 1 site range. Its wind speeds are Viking Lander site values.

**Titan on NSSDCA:** The Saturnian Satellite Fact Sheet (https://nssdc.gsfc.nasa.gov/planetary/factsheet/saturniansatfact.html, "Last Updated: 22 July 2025, DRW") gives orbital and physical data only, such as "Titan (VI) 1,345.5 [mass 10^20 kg] 2,575 [radius km] 1880 [density] 0.22 [albedo]". **It has no atmosphere section.** The factsheet index has no separate Titan page. Titan's atmosphere values therefore come from NASA Science (§4).

---

## 2. Internal heat (emitted ÷ absorbed) — giant planets

### 2a. Irwin, Wenkert, Simon, Dahl & Hammel, "The bolometric Bond albedo and energy balance of Uranus" — conference abstract on NTRS
- URL: https://ntrs.nasa.gov/citations/20250004339 (PDF: /api/citations/20250004339/downloads/SimonBolometricAbstract.pdf). NTRS record created 2025-04-30; stiType "ABSTRACT".
- Affiliations: Oxford, JPL, NASA GSFC (Amy A. Simon), Caltech, AURA. Copyright on NTRS is "MAY_INCLUDE_COPYRIGHT_MATERIAL", so quote briefly with attribution. **Status: abstract, not peer-reviewed.** A related arXiv preprint exists (arXiv:2502.18971); it was not fetched.
- Data kind: a review statement of observations (Voyager 2) plus model output (NEMESIS).
- Verbatim (p.1): "Jupiter, Saturn and Neptune all emit much more power thermally (Pout) than they absorb from the Sun (Pin) with Pout/Pin having values of 1.7 to 2.6. This shows that they all retain a considerable amount of heat left over from formation, which they are slowly radiating away into space."
- "Measurements made by Voyager-2 determined a radiative heat balance ratio of only Pout/Pin = 1.06 ± 0.08 (Pearl et al. 1990), which is consistent (to within error) with Uranus being in thermal equilibrium with the Sun"
- "Voyager-2 determined a radiative heat balance ratio for Neptune of Pout/Pin = 2.61 ± 0.28 (Pearl and Conrath, 1991), which is the largest ratio determined for the giant planets."
- Their new model result: "a new estimate of Uranus's average heat flux budget of Pout/Pin = 1.15 ± 0.06" and "leads Pout/Pin to vary from 1.03 near perihelion, to 1.24 near aphelion".

### 2b. Wang, X., Li, L., Roman, M., Zhang, X., … Nixon, C. A., … (2025). "Internal Heat Flux and Energy Imbalance of Uranus." *Geophysical Research Letters* 52(14), e2025GL115660.
- DOI: 10.1029/2025GL115660 (verified via api.crossref.org: the title, journal, vol 52, issue 14 and article number all match).
- Licence: CC BY-NC-ND 4.0 (open access). This licence allows verbatim quotation with citation but no adaptation. The copy read is the NTRS reprint: https://ntrs.nasa.gov/citations/20250009573 (PDF: NixonInternalSTI.pdf). It is born-digital, so I read the text layer.
- Data kind: observation (Voyager and later data) combined with model output. Peer-reviewed.
- p.1 Key Points: "A statistically significant internal heat flux of 0.078 ±0.018 Wm−2 is determined from long‐term investigations of Uranus REB"
- §(Discussion, p.~6): "The correspondingannual‐mean absorbedand emitted powersare 0.614±0.012W/m2 and 0.692 ±0.014 W/m2, respectively. The ratio of annual‐mean emitted to absorbed power is 1.13 ±0.03." (The text layer drops some spaces; the wording is unchanged.)
- "Thus, we conclude that Uranus does have internal heat flux, although the ratio of internal heat flux to absorbed solar power (12.52%) is significantly lower than those of other giant planets (i.e., 113%, 139%, and 162% of absorbed solar power for Jupiter, Saturn, and Neptune, respectively) (Li et al., 2018; Pearl & Conrath, 1991; Wang et al., 2024)."
- p.7: "The heat flux, expressed in luminosity per unit mass, is 7.3 ×10−12 W kg−1, slightly exceeding the value of 5.2 ×10−12 W kg−1 for carbonaceous chondrites (Clauser, 2021)."
- **Derived (not printed):** emitted/absorbed = 1 + internal/absorbed, which gives ≈2.13 for Jupiter, 2.39 for Saturn and 2.62 for Neptune. If shown, label it as derived from Wang et al. The Neptune value is consistent with 2.61 ± 0.28 in 2a. Jupiter's ≈2.13 falls inside the 1.7–2.6 range in 2a.
- **Disagreement to record:** Uranus Pout/Pin is 1.06 ± 0.08 (Voyager 2, 1990), 1.13 ± 0.03 (Wang et al. 2025) and 1.15 ± 0.06 (Irwin et al. abstract).

---

## 3. Atmospheric escape

### 3a. Jeans (thermal) escape — NASA, *MAVEN Press Kit*, November 2013
- URL: https://www.nasa.gov/wp-content/uploads/2015/03/maven_presskit_final2.pdf. PDF page 13, section "MAVEN Investigations (continued) — Atmospheric Escape Processes", sub-heading "Kinetic Energy". U.S. Government work. Data kind: educational explanation. Born-digital; read from the text layer.
- "In order to escape, gas molecules must attain sufficient energy to break free of the planet's gravity."
- "Atmospheric atoms and molecules naturally bounce around, colliding with one another in random directions and with random energies. The higher-energy atoms at the top of the atmosphere may have enough kinetic energy to jump right out of the atmosphere. This process, dubbed "Jeans escape" after English astronomer James Jeans, may account for the loss of most neutral (non-ionized) hydrogen from Mars. Because this hydrogen ultimately comes from water, tracking the loss of Mars' hydrogen is equivalent to tracking the loss of water."
- Next sub-heading, "Photochemistry": "Solar ultraviolet (UV) light can eject electrons from atoms and molecules, creating positive ions. When some molecular ions (such as ionized oxygen, carbon and nitrogen) re-combine with electrons, the reaction releases energized atoms at escape speeds."

### 3b. MAVEN loss rate — NASA news release "NASA Mission Reveals Speed of Solar Wind Stripping Martian Atmosphere", Nov 05, 2015
- URL: https://www.nasa.gov/news-release/nasa-mission-reveals-speed-of-solar-wind-stripping-martian-atmosphere/ (the old mars.nasa.gov URL redirects to a generic page). U.S. Government work. Data kind: observation.
- "MAVEN measurements indicate that the solar wind strips away gas at a rate of about 100 grams (equivalent to roughly 1/4 pound) every second."
- "We've seen that the atmospheric erosion increases significantly during solar storms, so we think the loss rate was much higher billions of years ago when the sun was young and more active." (quote attributed to Bruce Jakosky, "MAVEN principal investigator at the University of Colorado, Boulder")
- "the loss is experienced in three different regions of the Red Planet: down the "tail," where the solar wind flows behind Mars, above the Martian poles in a "polar plume," and from an extended cloud of gas surrounding Mars. The science team determined that almost 75 percent of the escaping ions come from the tail region, and nearly 25 percent are from the plume region, with just a minor contribution from the extended cloud."
- Supporting source: NASA SVS 12046, "Solar Wind Strips the Martian Atmosphere", released Tue Nov 10, 2015 (https://svs.gsfc.nasa.gov/12046/): "Measurements by NASA's MAVEN spacecraft indicate that Mars' upper atmosphere currently loses roughly a quarter-pound of gas every second." Also: "Unlike Earth, Mars lacks a global magnetic field that deflects the stream of charged particles continuously blowing off the sun."

### 3c. Mercury exosphere (MESSENGER)
- NASA Science, "Mercury: Facts", https://science.nasa.gov/mercury/facts/ (dateModified 2025-04-25). U.S. Government work. Data kind: educational summary.
  "Instead of an atmosphere, Mercury possesses a thin exosphere made up of atoms blasted off the surface by the solar wind and striking meteoroids. Mercury's exosphere is composed mostly of oxygen, sodium, hydrogen, helium, and potassium."
- NASA Science Photojournal, "Calcium and Magnesium in Mercury's Exosphere", https://science.nasa.gov/photojournal/calcium-and-magnesium-in-mercurys-exosphere/ (Image Addition Date 11/05/2009; MESSENGER MASCS instrument; acquired September 29, 2009). Data kind: observation.
  "These figures show observations of calcium and magnesium in Mercury's neutral tail during the third MESSENGER Mercury flyby. The distribution of neutral calcium in the tail appears to be centered near the equatorial plane … In contrast, the distribution of magnesium in the tail exhibits several strong peaks in emission … the densities were higher during the third flyby, a different "seasonal" variation than for sodium."
- Nittler, L. R. (Carnegie Institution of Washington), "MESSENGER at Mercury: Scientific Highlights and End of Mission", NAC Science Committee, April 6, 2015 (slides). https://science.nasa.gov/wp-content/uploads/2023/04/MESSENGER_at_Mercury_Sci_HighlightsTAGGED.pdf, slide 27 "Mercury's Sodium and Calcium Exospheres Revealed": "Calcium observations point to a persistent dawn source and suggest an origin associated with meteoroid impacts"; "Sodium observations in the tail region are dominated by seasonal variability". Bio: not verified.
- The numeric column abundances are in the NSSDCA Mercury block (§1).
- **Inconsistency to record:** NASA Facts lists oxygen first ("mostly of oxygen, sodium, …"). The NSSDCA column abundances are largest for sodium (12,000–200,000 ×10^6 cm^-2) and magnesium (100,000), with oxygen at "<40,000".

---

## 4. Titan

- NASA Science, "Titan: Facts", https://science.nasa.gov/saturn/moons/titan/facts/ (published 2018-05-02, dateModified 2026-10-19). U.S. Government work. Data kind: educational summary.
  - "At the surface of Titan, the atmospheric pressure is about 60 percent greater than on Earth—roughly the same pressure a person would feel swimming about 50 feet (15 meters) below the surface in the ocean on Earth."
  - "the atmosphere extends to an altitude 10 times higher than Earth's—nearly 370 miles (600 kilometers) into space."
  - "Titan's atmosphere is mostly nitrogen (about 95 percent) and methane (about 5 percent), with small amounts of other carbon-rich compounds."
  - "Here it is so cold (-290 degrees Fahrenheit or -179 degrees Celsius) that water ice plays the role of rock."
  - Methane cycle: "It is the sole other place in the solar system known to have an earthlike cycle of liquids raining from clouds, flowing across its surface, filling lakes and seas, and evaporating back into the sky (akin to Earth's water cycle)." Also: "methane condenses into clouds that occasionally drench the surface in methane storms." And: "Because sunlight continuously breaks down methane in Titan's atmosphere, some source must be replenishing it or it would be depleted over time."
- NASA Science, "Voyager — Fact Sheet", https://science.nasa.gov/mission/voyager/fact-sheet/ (dateModified 2026-04-14): "Titan's surface temperature and pressure are 94 kelvins (-292 Fahrenheit) and 1.5 atmospheres."
- NASA Science, "Huygens's Landing Second Anniversary - The Surprises Continue", Jan 11, 2007, https://science.nasa.gov/solar-system/huygenss-landing-second-anniversary-the-surprises-continue/ (this is ESA-authored content republished by NASA). Data kind: observation (Huygens HASI and GCMS).
  - "Huygens measured the composition profile of the atmosphere to be a mixture of nitrogen, methane and ethane. The methane and ethane provide humidity, as water does in Earth's atmosphere. At the surface of Titan, Huygens measured the temperature to be 94 °K (-179 °C) with a humidity of 45 percent."
  - "It detected methane evaporating from the Huygens landing site. "Methane on Titan plays the role that water plays on Earth," concludes Lunine."
  - Huygens landing: "Huygens parachuted to the surface of Titan on 14 January 2005."
- **Disagreement to record:** Voyager Fact Sheet says "1.5 atmospheres"; Titan Facts says "about 60 percent greater than on Earth" (i.e. ~1.6). The NSSDCA sheet has no Titan atmosphere value. No HASI paper value (e.g. 1467 hPa) was fetched from an allowed source.

---

## 5. Pluto and Triton

- **Pluto (a): NASA, "New Horizons Reveals Pluto's Atmospheric Pressure Has Sharply Decreased"**, Jul 24, 2015. https://www.nasa.gov/solar-system/new-horizons-reveals-plutos-atmospheric-pressure-has-sharply-decreased/. Data kind: observation (REX radio occultation).
  - "the gas pressure at Pluto's surface was only 1/100-thousandth that of the pressure on the surface of Earth. That's about half the amount calculated from previous Earth-based observations."
  - "The pressure measurement is the first ever obtained for the surface of Pluto. It was made by REX, the spacecraft's radio experiment, about one hour after New Horizons' closest approach to Pluto on July 14."
  - "One explanation for the low pressure is that about half of Pluto's atmosphere may have recently frozen onto the planet's surface."
- **Pluto (b): Cruikshank, D. P., Stern, S. A., Weaver, H. A., Young, L. A., Ennico, K., Olkin, C. B., et al., "Pluto and Charon Seen with the New Horizons Spacecraft"** (abstract, NTRS 20160009762, publication date 2016-07-30; copyright "PUBLIC_USE_PERMITTED"). https://ntrs.nasa.gov/citations/20160009762
  - "Pluto's atmosphere was probed with the radio science experiment (REX) and the Alice UV spectrometer, as well as imaging at high phase angles. The surface pressure, due mostly to N2, is approximately 11 microbars."
- **Pluto (c):** NSSDCA (§1): "Surface Pressure: ~13 microbar".
- **The "~10 µbar" in the brief:** this exact NASA wording was not found on an allowed fetched page. (A search snippet points to "Preliminary results indicate that the surface pressure is ~10 µbar" in arXiv:1510.07704, a preprint that was not fetched.) Use ~11 µbar (NTRS) or ~13 µbar (NSSDCA) and state the source.
- **Triton: NASA Science, "Voyager — Fact Sheet"** (https://science.nasa.gov/mission/voyager/fact-sheet/, dateModified 2026-04-14). Data kind: observation (Voyager 2, 1989).
  - "An extremely thin atmosphere extends about 800 kilometer (500 miles) above Triton's surface. Nitrogen ice particles may form thin clouds a few kilometers above the surface. The atmospheric pressure at the surface is about 14 microbars, 1/70,000th the surface pressure on Earth. The surface temperature is about 38 kelvins (-391 degrees Fahrenheit) the coldest temperature of any body known in the solar system."
  - "Voyager 2 images showed active geyser-like eruptions spewing invisible nitrogen gas and dark dust particles several kilometers into the tenuous atmosphere."
- **Triton: NASA Science, "Triton"**, https://science.nasa.gov/neptune/moons/triton/ (dateModified 2024-11-03): "Triton's thin atmosphere is composed mainly of nitrogen with small amounts of methane. This atmosphere most likely originates from Triton's volcanic activity, which is driven by seasonal heating by the Sun."

---

## NOT FOUND / gaps
- NSSDCA has no Titan atmosphere values (the Saturnian satellite sheet is orbital and physical data only).
- No single NASA page gives Pout/Pin for each of Jupiter and Saturn. The only printed per-planet figures are the internal/absorbed percentages in Wang et al. 2025 (113%, 139%, 162%). Pout/Pin for J/S would be derived. Pearl & Conrath 1991 (Wiley) was not fetched.
- NASA's exact "~10 µbar" wording for Pluto was not found. The values available are 11 µbar (NTRS abstract), 13 µbar (NSSDCA) and 1/100,000 Earth (NASA 2015).
- Giant planets: NSSDCA gives no total atmospheric mass or surface density. Mercury has no scale height or molecular weight.
- A quantitative Jeans escape formula or parameter was not sourced from a NASA page; only the qualitative press-kit explanation is available.
- Huygens HASI numerical surface pressure (~1.467 bar) was not fetched from an allowed host. ESA (robots allows) was not fetched.
- Author bios: not verified for any author beyond the NSSDCA curator line.
