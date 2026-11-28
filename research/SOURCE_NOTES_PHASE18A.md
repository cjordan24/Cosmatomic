# Source notes — Phase 18A: physics of spacecraft engineering

Research date: 2026-11-28. Raw downloads are in `/tmp/vv-research/p18a/` (HTML, `pdf/`, `img/`).
User-Agent for every request: `VoyagerVentures-Research/0.1 (educational; respects robots.txt)`, with at least 1.2 s between requests to the same host.
Quotes are verbatim. A `[…]` marks an omission. `[sic]` marks a typo in the source.
Equations from HTML pages are copied from the page's LaTeX/MathJax source text, not retyped. Equations from scanned books are read from page images, as noted for each one.

## Robots / access log

| Host | robots.txt result | Used? | Notes |
|---|---|---|---|
| www.grc.nasa.gov | 404, so no robots file (RFC 9309 allows crawling) | Only the legacy redirect stubs | Old `/www/k-12/rocket/*.html` pages are now "has moved" stubs that point to www1.grc.nasa.gov |
| www1.grc.nasa.gov | `User-agent: * / Disallow:` (empty), so everything is allowed | YES | Beginner's Guide to Aeronautics |
| science.nasa.gov | `User-agent: * Allow: /` | YES | Basics of Space Flight, Voyager pages, RPS program, Hubble, glossary, blog |
| www.nasa.gov | `User-agent: * Allow: /` | YES | DSN page, SmallSat SOA thermal PDF |
| earth.gsfc.nasa.gov | Drupal default: only /core, /admin, /search and similar are disallowed | YES | Solar irradiance page |
| ntrs.nasa.gov | `User-agent: * Allow: /` | YES | Yuen 1982 (JPL Pub 82-76) PDF and the search API |
| archive.org | Disallows only /control/ and /report/ | YES | Moulton 1914 page images, djvu OCR (used only to locate text), scandata |
| www.energy.gov | Drupal default: /search, /admin and similar are disallowed; /sites/default/files is not | YES | DOE-STD-1128-2008 PDF |
| assets.science.nasa.gov | robots.txt returns 404, so allowed | YES | Juno fact sheet PDF |
| rps.nasa.gov | No robots file; the whole host redirects to science.nasa.gov/planetary-science/programs/radioisotope-power-systems/ | Through the redirect | |
| sdo.gsfc.nasa.gov | Disallows only /stats | No (not needed) | |
| solarsystem.nasa.gov | No disallow lines | No (not needed) | |
| voyager.jpl.nasa.gov | **robots.txt returned 403 Forbidden** | **NO** | Not used. The search engine pointed to its "thirty-year plan" page, but the same text was found on science.nasa.gov |
| descanso.jpl.nasa.gov | **robots.txt returned 403 Forbidden** (but `/` returns 200) | **NO** | Not used. Yuen 1982 on NTRS replaced the DESCANSO monographs |
| www.jpl.nasa.gov | robots.txt 200 (`Disallow: /*?*`, /edu-legacy and others); **news article returned 403 from CloudFront** | **NO, stopped** | Treated as a bot wall. No workaround was attempted |
| deepspace.jpl.nasa.gov | Redirects to www.nasa.gov/communicating-with-missions/dsn/ (that is the HTML it returned) | Through the redirect | |
| spacemath.gsfc.nasa.gov | robots.txt returned nothing / 404 | No (not needed) | |

Off-limits sites were not touched: no Wikipedia, OpenStax, LibreTexts, ADS, Springer, IOP or arXiv. (One web-search results list included arxiv.org links; none was fetched.)

---

## 1. Rocket equation and specific impulse

### S1a — NASA Glenn, "Ideal Rocket Equation" (Beginner's Guide to Aeronautics)
- URL: https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/ideal-rocket-equation/ (the legacy URL https://www.grc.nasa.gov/www/k-12/rocket/rktpow.html redirects here)
- Institution: NASA Glenn Research Center. Page Editor and NASA Official: Nancy Hall (from the page footer). Bio: not verified.
- Dates: datePublished 2022-07-13, dateModified 2023-11-21 (page JSON-LD).
- Licence: US Government work (NASA), public domain in the US.
- Verbatim (equations are the page's LaTeX):
  - "Substituting for these values we obtain: \(\Delta u=V_{eq}\ln(\frac{m_{f}}{m_{e}})\) This equation is called the ideal rocket equation."
  - "Initially, the full mass of the rocket mf contains the empty mass and all of the propellant at lift off. At the end of the burn, the mass of the rocket contains only the empty mass"
  - "Using the definition of the propellant mass ratio MR \(\mathit{MR}=\frac{m_{f}}{m_{e}}\)"
  - "Veq is related to the specific impulse Isp: \(V_{eq}=\mathit{Isp}\cdot g_{0}\) where g0 is the gravitational constant. So the change in velocity can be written in terms of the specific impulse of the engine: \(\Delta u=\mathit{Isp}\cdot g_{0}\cdot\ln(\mathit{MR})\)"
  - "If we have a desired delta u for a maneuver, we can invert this equation to determine the amount of propellant required: \(\mathit{MR}=e^{(\frac{\Delta u}{\mathit{Isp}\cdot g_{0}})}\)"
  - "a reasonable value for specific impulse for a liquid hydrogen/liquid oxygen rocket (like the Space Shuttle main engine) would be about 350 seconds. The delta u needed to get to a 200 mile high orbit is given by the circular orbit simulator as about 17,000 mph (~25,000 feet/sec). The gravitational constant for Earth is 32.2 feet/second squared."
  - "Putting these values into the ideal rocket equation, the resulting mass flow ratio MR is equal to 10. From the ideal rocket equation, 90% of the weight of a rocket going to orbit is propellant weight. The remaining 10% of the weight includes structure, engines, and payload. So given the current state-of-the-art, the payload accounts for only about 1% of the weight of an ideal rocket at launch."
  - "If you include the effects of gravity in the rocket equation, the equation becomes: \(\Delta u=V_{eq}\ln(\mathit{MR})-g_{0}\cdot\mathit{tb}\) where tb is the time for the burn."
- **Notation warning:** on this page m_f means the *full* (initial) mass and m_e the *empty* (final) mass. This is the opposite of the common m0/mf convention.
- **Checks and discrepancies:**
  - Worked example: exp(25,000 / (350 × 32.2)) = exp(2.218) = **9.2**. The page rounds this to "MR is equal to 10". Record both.
  - The page writes "mass flow ratio MR" while its own definition calls it the "propellant mass ratio". This is an internal wording inconsistency.
  - The page's Veq definition is printed as \(V_{eq}=\frac{v+A(p-p_0)}{\dot{m}}\), which puts the whole numerator over ṁ. The specific-impulse page (S1b) gives Veq = Ve + (pe − p0)·Ae/ṁ, which divides only the pressure term by ṁ. **The rocket-equation page has a typesetting error here; do not quote that line.**
  - The page calls g0 "the gravitational constant" (sic). It is the standard gravitational acceleration, not G.

### S1b — NASA Glenn, "Specific Impulse"
- URL: https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/specific-impulse/ (the legacy https://www.grc.nasa.gov/www/k-12/rocket/specimp.html redirects here; the legacy airplane/specimp.html is "Last Updated: May 13 2021")
- NASA Glenn, Page Editor Nancy Hall. datePublished 2021-08-06, dateModified 2024-06-24. US Government work.
- Verbatim:
  - "We can divide this equation by the weight of the propellants to define the specific impulse. The word “specific” just means “divided by weight”. The specific impulse Isp is given by: \(\mathit{Isp}=\frac{V_{eq}}{g_{0}}\) where g0 is the gravitational acceleration constant (32.2 ft/sec^2 in English units, 9.8 m/sec^2 in metric units)."
  - "\(\mathit{Isp}=\frac{F}{\dot{m}g_{0}}\) Mathematically, the Isp is a ratio of the thrust produced to the weight flow of the propellants."
  - "The engine with the higher specific impulse is more efficient because it produces more thrust for the same amount of propellant."
  - "The units of specific impulse are the same whether we use English units or metric units."

### Tsiolkovsky 1903
- **Not sourced.** See the gaps section.

---

## 2. Orbits: circular velocity, escape velocity, Kepler III, Hohmann

### S2a — NASA Glenn, "Flight To Orbit"
- URL: https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/flight-to-orbit/
- NASA Glenn, Page Editor Nancy Hall. dateModified 2023-11-20. US Government work.
- Verbatim:
  - "The exact speed needed to orbit the earth depends on the altitude, according to a formula that was developed by Johannes Kepler in the early 1600’s: \(V=\sqrt{\frac{g_{0}R_{e}^{2}}{R_{e}+h}}\) where V is the velocity for a circular orbit, g0 is the surface gravitational constant of the Earth (32.2 ft/sec2), Re is the mean Earth radius (3963 miles), and h is the height of the orbit in miles."
  - "For a 100-mile-high orbit around the Earth, the orbital velocity is 17,478 mph."
  - "\(T^{2}=\frac{4\pi^{2}(R_{e}+h)^{3}}{g_{0}R_{e}^{2}}\)"
  - "as the height above the planet increases, the velocity needed to maintain an orbit decreases. A spacecraft flying at a lower orbit must travel faster than a spacecraft flying at a higher orbit."
- Check: using g0 = 32.2/5280 mi/s², Re = 3963 mi and h = 100 mi gives V = 4.855 mi/s = **17,479 mph**. This matches the printed 17,478 within rounding.
- Caveat: attributing the formula to Kepler is historically doubtful. The g0·Re² = GM form is Newtonian. Do not repeat the attribution as fact.

### S2b — Moulton, *An Introduction to Celestial Mechanics*, 2nd rev. ed. (1914)
- Full citation: Forest Ray Moulton, *An Introduction to Celestial Mechanics*, second revised edition, New York: The Macmillan Company, 1914.
- Copy: archive.org `cu31924072676756` (Cornell University Library scan). https://archive.org/details/cu31924072676756
- Licence: published 1914 in the US, so **public domain in the US**.
- Author bio: not verified on an official page.
- Read on page images `https://archive.org/download/cu31924072676756/page/n<N>_w1200.jpg`. Printed page = leaf n − 19. Images are saved in `img/m_n*.jpg`.
- **Velocity from infinity (escape velocity), §35–36, pp. 45–48 (leaves n64, n66, n67):**
  - p. 45, eq. (18): "If the particle falls from an infinite distance, s₀ is infinite and the equation reduces to (18) (ds/dt)² = 2k²/s."
  - p. 47, eq. (19) and after: "Let R represent the radius of the earth, and g the acceleration of gravitation at its surface. Then it follows that (19) g = k²/R². On substituting the value of k² determined from this equation into (18), the expression for the square of the velocity becomes (ds/dt)² = 2gR²/s. Let V = ds/dt when s = R; whence V² = 2gR."
  - p. 48: "Let a second be taken as the unit of time, and a meter as the unit of length. Then R = 6,371,000, and g = 9.8094*. On substituting in the last equation and carrying out the computation, it is found that V = 11,180 meters, or about 6.95 miles, per sec." (Footnote: "* Annuaire du Bureau des Long. g is given for the lat. of Paris, 48° 50′.")
  - p. 48 table, "Velocity of Escape": Earth 11,180 m (6.95 mi) per sec; Moon 2,396 (1.49); Sun 618,200 (384.30); Mercury 3,196 (1.99); Venus 10,475 (6.51); Mars 5,180 (3.2? — the last digit is illegible in the scan; 5,180 m is 3.22 mi); Jupiter 61,120 (38.04); Saturn 37,850 (23.53); Uranus 23,160 (14.40); Neptune 20,830 (12.95).
  - Check: √(2 × 9.8094 × 6,371,000) = 11,180 m/s. This agrees with the printed value.
  - Caveat: these are 1914 planetary data. Modern values differ (for example, Mars is about 5.03 km/s). Use them only as a historical illustration.
- **Speed in orbit (vis-viva), circular and parabolic speeds, §89, pp. 149–150 (leaves n168, n169):**
  - p. 149, eq. (24): "(dx/dt)² + (dy/dt)² = V² = k²M (2/r − 1/a), where V is the speed in the orbit at the distance r from the origin. When the orbit is a circle, r = a and"
  - p. 150: "V_c² = k²M/r. When the orbit is a parabola, a = ∞ and V_p² = 2k²M/r. Therefore, at a given distance from the origin the ratio of the speed in a parabolic orbit to that in a circular orbit is (25) V_p : V_c = √2 : 1."
  - "Thus, in the motion of comets around the sun they cross the planets' orbits with velocities about 1.414 times those with which the respective planets move."
  - (k²M corresponds to the modern GM.)
- **Kepler's third law, §89, p. 152 (leaf n171):**
  - "P²₁,₂ / P²₃,₂ = (a³₁,₂ / a³₃,₂) · (M₃,₂ / M₁,₂)."
  - "If the two systems are composed of the sun and two planets respectively, then M₁,₂ and M₃,₂ are very nearly equal because the masses of the planets are exceedingly small compared to that of the sun. Therefore, this equation becomes very nearly P²₁,₂/P²₃,₂ = a³₁,₂/a³₃,₂; or, *the squares of the periodic times of the planets are proportional to the cubes of their mean distances.* This is Kepler's third law."

### S2c — NASA/JPL, *Basics of Space Flight*, Ch. 3 "Gravity & Mechanics" and Ch. 4 "Trajectories"
- Ch. 3 p. 3: https://science.nasa.gov/learn/basics-of-space-flight/chapter3-3/ (dateModified 2025-01-16)
- Ch. 4 p. 1: https://science.nasa.gov/learn/basics-of-space-flight/chapter4-1/ (dateModified 2024-11-04)
- Author: Dave Doody, JPL. This is **verified** on the official editorial page, https://science.nasa.gov/learn/basics-of-space-flight/editorial/:
  - "This document was first prepared in 1993 by Dave Doody and George Stephan of JPL's Mission Operations Section […] The 21st Century Edition was written by Dave Doody with Diane Fisher's editorial and technical expertise. Dave is the author of the 2017 Edition."
  - "Dave is currently the Realtime Flight Operations Lead engineer for the Cassini/Huygens Mission." This is the page's own (dated) wording; the page says "The latest update was made in March 2022."
  - The science.nasa.gov JSON-LD "author" field (Alicia Cermak) is the web publisher, not the writer.
- Licence: NASA web content (JPL-authored, hosted by NASA). NASA media guidelines generally allow educational use. JPL text is technically Caltech-authored, so attribute "NASA/JPL-Caltech".
- Verbatim (Kepler's laws, ch. 3-3):
  - "The orbit of every planet is an ellipse with the Sun at one of the two foci."
  - "A line joining a planet and the Sun sweeps out equal areas during equal intervals of time."
  - "The square of the orbital period of a planet is directly proportional to the cube of the semi-major axis of its orbit."
  - "Gravity's strength is inversely proportional to the square of the objects' distance from each other."
- Verbatim (Hohmann, ch. 4-1):
  - "The desired orbit's perihelion (closest approach to the Sun) will be at the distance of Earth's orbit, and the aphelion (farthest distance from the Sun) will be at the distance of Mars' orbit. This is called a Hohmann Transfer orbit."
  - "A spacecraft's apoapsis altitude can be raised by increasing the spacecraft's energy at periapsis."
  - "The acceleration is tangential to the existing orbit. How much energy to add? See the Rocket & Space Technology website." The linked site is a private site and was not used.
  - "The opportunity to launch a spacecraft on a minimum-energy transfer orbit to Mars occurs about every 25 months."
  - "Venus launch opportunities occur about every 19 months."
  - "The spacecraft was launched on a Type-II Hohmann transfer orbit to Jupiter. […] Perihelion would have been at 1 au, and aphelion at Jupiter's distance of about 5 au."
- **No Hohmann Δv formula is given** (see the gaps section).

---

## 3. Radioisotope thermoelectric generators, Pu-238 and Voyager power

### S3a — NASA Science, Voyager "Spacecraft" page
- URL: https://science.nasa.gov/mission/voyager/spacecraft/. dateModified 2026-11-16. NASA (web publisher Stephen Carney; bio: not verified). US Government / NASA web content.
- Verbatim:
  - "Electrical power is supplied by three radioisotope thermoelectric generators (RTGs). As the electrical power decreases, power loads on the spacecraft must be turned off in order to avoid having demand exceed supply."
  - "Status: As of 2023, the twin Voyagers' RTGs are in stable operation at 225 We."
  - "Three radioisotope thermoelectric generator units (RTGs), electrically parallel-connected, are the central power sources for the mission module. Each RTG is made up of a radioisotope heat source, a thermoelectric converter, a gas pressure venting system, temperature transducers, connectors, a heat rejecting cylindrical container, and bracketry."
  - "The heat source radioisotopic fuel is Plutonium-238 in the form of the oxide Pu02 [sic: PuO2]. In the isotopic decay process, alpha particles are released which bombard the inner surface of the container. The energy released is converted to heat and is the source of heat to the thermoelectric converter."

### S3b — NASA Science, Voyager 1 mission page (fact box)
- URL: https://science.nasa.gov/mission/voyager/voyager-1/. dateModified 2026-11-24.
- Verbatim: "Spacecraft Power3 [sic: missing space] Multi-Hundred Watt Radioisotope Thermoelectric Generators (MHW-RTGs) stacked in a series on a boom, producing about 158 We each, at launch."
- 3 × 158 = **474 We at launch**. This is the number to use for "~470 W".
- Discrepancy: this page says the RTGs are "stacked in a series", while S3a says they are "electrically parallel-connected". The first wording probably describes the mechanical end-to-end mounting (S3a also says "mounted in tandem (end-to-end)"). Record both.

### S3c — Voyager power decline (about 4 W per year): three NASA statements
1. Voyager FAQ: https://science.nasa.gov/mission/voyager/frequently-asked-questions/ (dateModified 2026-08-04)
   "The radioisotope thermoelectric generator (RTG) on each spacecraft puts out 4 watts less each year. Because of this diminishing electrical power, the Voyager team has had to prioritize which instruments to keep on and which to turn off."
2. Voyager Science / VIM page: https://science.nasa.gov/mission/voyager/science/ (dateModified 2026-01-13)
   "Radioisotope thermoelectric generators (RTGs) provide electrical power to the Voyager spacecraft. Due to the natural radioactive decay of the plutonium oxide heat source, the electrical power provided by the RTGs is continually declining, as expected. The current rate of decay is approximately 4 watts per year."
3. NASA Voyager blog, "NASA Engineers Help Prolong Voyager 2's Science Mission", 2026-08-04: https://science.nasa.gov/blogs/voyager/2026/08/04/nasa-engineers-help-prolong-voyager-2s-science-mission/
   "The Voyagers get their power from radioisotope thermoelectric generators, devices that convert heat from decaying plutonium into electricity. Due to the plutonium supply continually depleting, both probes lose about 4 watts of power each year."
- Other number: the Voyager "Did You Know?" page (https://science.nasa.gov/mission/voyager/did-you-know/, published 2024-04-09, modified 2025-04-07) says "The electronics and heaters aboard each nearly one-ton Voyager spacecraft can operate on only 400 watts of power". This differs from 474 We at launch. Record both.
- Consistency check (my calculation, not a quote): pure Pu-238 decay alone would leave 474 × 2^(−46/87.7) ≈ 330 We in 2023. NASA's "225 We" (2023) is lower because thermocouples also degrade. Averaged, (474 − 225)/46 yr ≈ 5.4 W/yr, against the quoted "~4 W/yr" for the current rate. **Do not present 474 − 4t as exact.**

### S3d — NASA RPS Program pages (science.nasa.gov; rps.nasa.gov redirects here)
- RPS FAQ: https://science.nasa.gov/planetary-science/programs/radioisotope-power-systems/radioisotope-power-systems-faq/ (dateModified 2025-04-03)
  - "A Radioisotope Thermoelectric Generator, or RTG, is a type of power system for space missions that converts heat from the natural radioactive decay of plutonium-238 into electricity using devices called thermocouples, where heat is applied across a circuit that includes dissimilar metals. This produces an electric current via the Seebeck effect. This process involves no moving parts."
  - "The relatively short half-life of Pu-238 (88 years) means it degrades naturally in a manageable manner over the length of a typical space mission, producing a small gradual decline in power output that can be accurately predicted and managed."
  - "It has what engineers call good power density (equal to watts of heat produced per gram of material), which allows for small, lightweight heat sources."
  - "The MMRTG is designed to supply about 110 watts of electrical power at the beginning of a mission."
  - "The longest-operating RPS-powered spacecraft are Voyager 1 and 2 […] Launched in 1977"
- About Plutonium-238: https://science.nasa.gov/planetary-science/programs/radioisotope-power-systems/about-plutonium-238/ (dateModified 2026-08-10)
  - "The only radioisotope that has consistently met the basic criteria is plutonium-238, which has a half-life of 88 years, a high power density, and has proven to be a very dependable and safe heat source on more than two dozen U.S. space missions over the past 50 years."
  - "Have a long enough half-life (at least 15 to 100 years), so that it can generate for many years sufficient heat for transformation into electricity"
- Basics of Space Flight Ch. 11 p. 3 (Electrical Power): https://science.nasa.gov/learn/basics-of-space-flight/chapter11-3/ (dateModified 2025-01-16; Dave Doody, JPL)
  - "RPS, as currently designed for space missions, contain an isotopic mixture of the radioactive element plutonium in the form of an oxide, pressed into a ceramic pellet. The primary constituent of these fuel pellets is the plutonium isotope 238 (Pu238). The pellets are arranged in a converter housing where they function as a heat source due to the natural decay of the plutonium. RTGs convert the heat into electricity through the use of simple thermocouples, which make use of the Seebeck effect and have no moving parts."

### S3e — DOE-STD-1128-2008, *Guide of Good Practices for Occupational Radiological Protection in Plutonium Facilities*
- U.S. Department of Energy, December 2008. "DISTRIBUTION STATEMENT A. Approved for public release; distribution is unlimited." US Government work.
- URL: https://www.energy.gov/sites/default/files/2026-05/DOE-STD-1128-2008.pdf
- Read from the born-digital PDF **text layer** (`swift pdftxt.swift`).
- §2.0 "Manufacture, Properties, and Hazards", p. 2-1 (PDF p. 13): "The 87.7-year half-life of 238Pu makes it an excellent heat source for space applications."
- Table 2.4 "Specific Activity Decay Heats of Selected Isotopes", p. 2-7 (PDF p. 19), row: "238Pu 87.7 α 17.1 α 5.49 0.567". The columns are Half-Life (y), Specific Activity (Ci/g), Average Particle Energy (MeV), and Decay Heat (W/g).
- Table 6.7.1 "Spontaneous Fission Neutron Yields" (PDF p. 152) lists "238Pu 87.74 y".
- **Discrepancy:** DOE gives 87.7 y (also 87.74 y in a later table), while NASA RPS pages round to "88 years". Use 87.7 y and cite DOE.

---

## 4. Solar power, inverse-square law and the solar constant

### S4a — NASA GSFC Earth Sciences, "Solar Irradiance Science"
- URL: https://earth.gsfc.nasa.gov/climate/projects/solar-irradiance/science. Footer reads "Last Updated: 11/09/2026". NASA Goddard; US Government work.
- Verbatim:
  - "The total solar irradiance (TSI), or the so-called solar constant, is the integrated solar energy arriving at Earth. But it is not a constant. It changes by ~0.1% in an 11-year solar cycle. Prior to the measurements obtained by the SORCE, the TSI value was estimated at 1366 Wm-2. One of the major SORCE contributions was to establish a more accurate value at 1361 Wm-2, which leads to 340 W m-2 for the globally averaged solar input to Earth. The current TSI value from the TSIS-1 is 1361.6 ± 0.3 Wm-2 for the 2019 solar minimum."
  - "[SORCE has] determined to be 1,361 watts per square meter (W/m2)."
- Check: 1361/4 = 340.25. This matches "340 W m-2".

### S4b — Inverse-square scaling of sunlight (Juno)
- NASA/JPL "Juno Mission to Jupiter" fact sheet, JPL 400-1442 Rev. 2, 9/15. URL: https://assets.science.nasa.gov/content/dam/science/psd/solar/2023/09/j/JUNO_Fact_Sheet_2016.pdf. Read from the born-digital PDF text layer, p. 1.
  - "Jupiter’s orbit is five times farther from the sun than Earth’s location, so the giant planet receives about 25 times less sunlight than Earth. Juno will be the first solar-powered spacecraft designed to operate at such a great distance from the sun, and its solar panels must be quite large to generate sufficient power there."
  - This is the inverse square in action: 5² = 25.
- NASA Science, "How NASA Uses and Improves Solar Power" (Miles Hatfield, web author; bio: not verified), dateModified 2024-10-22. URL: https://science.nasa.gov/sun/how-nasa-uses-and-improves-solar-power/
  - "But sunlight drops dramatically with distance."
  - "At Jupiter, which receives 25 times less light than Earth, the Juno spacecraft (pictured at right) needs three 30-foot-long panels to generate 500 watts of energy"
  - "Deep space missions like NASA’s Voyager 1 and 2 rely instead on energy from the radioactive decay of plutonium-238 to keep them running well into interstellar space."
- Explicit 1/(4πr²) spreading, in a NASA document: Yuen 1982, eq. (1.1-1), quoted under S5d below ("the power flux density at the receiver ρ would be the transmitted power divided by the area of a sphere of radius r").
- Supporting glossary data: NASA Science Universe glossary, https://science.nasa.gov/universe/glossary/ (dateModified 2026-08-25):
  - "astronomical unit (au or AU) A unit of length approximating the average distance from Earth to the Sun and formally defined as 149,597,870.7 km"
  - "The Sun's bolometric luminosity is 3.83 x 1026 watts." The `1026` is how the page's text extraction renders 10^26.
- Check (my calculation): 3.83×10²⁶ / (4π × (1.495978707×10¹¹ m)²) = **1361.8 W/m²**. This is consistent with S4a's 1361.

---

## 5. Deep-space communications

### S5a — NASA, "Deep Space Network"
- URL: https://www.nasa.gov/communicating-with-missions/dsn/ (deepspace.jpl.nasa.gov redirects here). dateModified 2026-10-15. US Government work.
- "Each Deep Space Network site has one huge, 230-foot (70-meter) diameter antenna, one 85-foot (26-meter) diameter antenna, and multiple 112-foot (34-meter) diameter antennas capable of tracking spacecraft traveling tens of billions of miles from Earth."
- Basics of Space Flight Ch. 18 (https://science.nasa.gov/learn/basics-of-space-flight/chapter18-1/, dateModified 2025-01-16):
  - "It consists of three deep-space communications complexes, DSCCs, placed approximately 120 degrees apart around the world: at Goldstone near Barstow in California's Mojave Desert; at Robledo near Madrid, Spain; and at Tidbinbilla near Canberra, Australia."
- NASA Science, "Two Voyagers Taught Us How to Listen to Space" (published 2017-08-22, modified 2024-11-02): https://science.nasa.gov/uncategorized/two-voyagers-taught-us-how-to-listen-to-space/
  - "the largest is 230 feet (70 meters) in diameter […] Its smaller siblings are 112 feet (34 meters) in diameter […] The dishes had to grow from their original 210 feet (64 meters) and 85 feet (26 meters), respectively."

### S5b — Voyager downlink: frequency and data rate (Voyager Spacecraft page, S3a URL)
- "Uplink communications is via S-band (16-bits/sec command rate) while an X-band transmitter provides downlink telemetry at 160 bits/sec normally and 1.4 kbps for playback of high-rate plasma wave data. All data are transmitted from and received at the spacecraft via the 3.7 meter high-gain antenna (HGA)."
- "One, at about 8.4 gigahertz (8,400 million cycles per second), is the X-band channel and contains science and engineering data. […] The X-band downlink science data rates are as high as 7.2 kilobits per second. The other channel, around 2.3 gigahertz, is in the S-band"

### S5c — Antenna gain and EIRP (Basics of Space Flight Ch. 10, Telecommunications)
- URL: https://science.nasa.gov/learn/basics-of-space-flight/chapter10-1/. dateModified 2024-11-04. Dave Doody, JPL.
- "a spacecraft's transmitter might have no more than 20 W of radiating power, but it can bridge distances measured in tens of billions of kilometers."
- "Voyager's, HGA, for example, provides a gain of 47 dBi at X-band. The reference "i" in dBi means the ratio is referenced to an isotropic radiator. The value of 47 dB (decibels) is 10^(47/10), which is a factor of more than 50,000. A 20-Watt transmitter using a 47-dBi gain HGA would have an effective power of a megawatt along the highly directional beam. This effective power is called ite [sic] Equivalent Isotropically Radiated Power (EIRP)."
  - The superscript was lost in text extraction; the page renders 10^(47/10).
- "the Deep Space Network's large aperture Cassegrain reflectors (the largest of which offer 74 dBi gain at X-band)"
- Checks: 10^4.7 = 50,119; 20 W × 50,119 ≈ 1.0 MW. Both are consistent.

### S5d — Yuen (ed.), *Deep Space Telecommunications Systems Engineering*, JPL Publication 82-76 (July 1982)
- Joseph H. Yuen, Editor; Jet Propulsion Laboratory, California Institute of Technology. Prepared under NASA contract. NTRS 19830013955 (NASA-CR-170137).
- URL: https://ntrs.nasa.gov/citations/19830013955 (PDF: https://ntrs.nasa.gov/api/citations/19830013955/downloads/19830013955.pdf)
- Licence: NTRS copyright determination "GOV_PUBLIC_USE_PERMITTED", distribution PUBLIC.
- Bio: not verified. Chapter-level authorship was not checked.
- This is a **scanned** document with an OCR text layer. The OCR was used only to locate text; **every equation below was read on rendered page images** (`img/yuen/y_p22.jpg`, `y_p24.jpg`, `y_p25.jpg`, `y_p439.jpg`).
- §1.1, p. 3–4 (PDF pp. 21–22). Free-space spreading (inverse square):
  - "If the power were radiated isotropically, the power flux density at the receiver ρ would be the transmitted power divided by the area of a sphere of radius r. The actual flux density is increased by a factor equal to the gain of the transmitting antenna, G_T. Thus, ρ = P_T G_T / 4πr² (1.1-1) where 4πr² is the area of a sphere of radius r. The received signal level P_R is obtained by multiplying the flux density at the receiver by the area of the receiving antenna A_r times the receiving antenna efficiency μ; i.e., P_R = ρμA_r (1.1-2)"
- Voyager-at-Jupiter worked example, p. 4:
  - "Consider the Voyager spacecraft, for the transmitting frequency of 8.4 GHz, where the transmitted power P_T is 21.3 W, the transmitting antenna gain G_T is 6.5 × 10⁴ (unitless), and the distance from Jupiter to Earth is 6.8 × 10¹¹ m. Thus, by using (1.1-1), we find the power flux density at the receiving antenna ρ to be ρ = 2.383 × 10⁻¹⁹ W/m² (1.1-3)"
  - "The largest antenna that NASA has is a 64-m-diameter dish (i.e., A_R = 3.2 × 10³ m²) which has an efficiency of 42%. The received signal power is obtained by using (1.1-2) with (1.1-3), P_R = 3.05 × 10⁻¹⁶ W (1.1-4)"
  - "Even though the spacecraft-transmitted power is typically only 20 watts, which is less than a dim desk lamp"
- Received-power equation, §1.2.1, p. 6 (PDF p. 24):
  - "P_R = P_T L_T G_T L_TP L_S L_A L_P L_RP G_R L_R (1.2-1)"
  - "The space loss, or numerical ratio of received power to transmitted power between two antennas, is given by L_S = (λ/4πr)² (1.2-2) where λ is the wavelength of radio signal and r is the distance between spacecraft and ground antennas."
- Antenna gain, p. 7 (PDF p. 25):
  - "The transmitting antenna gain G_T can be related to the effective antenna aperture A_T as G_T = 4πA_T/λ² (1.2-3) where λ is the wavelength of radio signal. The effective antenna aperture A_T is related to the actual antenna aperture A_t by the relations A_T = μA_t (1.2-4) where μ is the antenna efficiency factor."
- §8.2.2 "Directivity, Gain, and Aperture Efficiency", p. 421 (PDF p. 439):
  - "For aperture-type antennas, the gain can be related to the geometrical area of the aperture by the following well-known expression: G = η_ap (4π/λ²) A_p (8.2-14) where η_ap and A_p are the aperture efficiency and aperture area of the reflector, respectively."
  - For a circular dish, A_p = πD²/4, so G = η_ap (πD/λ)². That rearrangement is my algebra, not a quote.
- Noise, p. 5 (PDF p. 23; from the text layer, not image-checked):
  - "at 8.4 GHz, the DSN station receiving system equivalent noise temperature is 28.5 K" and "N₀ = 3.933 × 10⁻²² W/Hz (1.1-6)"
  - The printed k is "1.38 × 10⁻²⁰ mW/K Hz", which equals 1.38×10⁻²³ W/K/Hz. Re-check this page on its image before quoting it.
- **Checks and discrepancies:**
  - ρ: 21.3 × 6.5e4 / (4π(6.8e11)²) = 2.383e-19. This agrees with the printed value.
  - P_R: 2.383e-19 × 0.42 × 3.2e3 = **3.20e-16 W**. Using exact π·32² = 3217 m² gives 3.22e-16 W. **The printed value is 3.05 × 10⁻¹⁶ W, about 5% lower.** Record both. The book's own next step, P_R·L/N₀ = 3.05e-16 × 0.7 / 3.933e-22 = 5.428e5, is consistent with the printed 3.05e-16.
  - Voyager HGA gain: Yuen gives 6.5×10⁴, which is 48.1 dBi. Basics of Space Flight gives 47 dBi (5.0×10⁴). Record both.
  - With D = 3.7 m and λ = c/8.4 GHz = 0.0357 m, (πD/λ)² = 1.06×10⁵. The implied efficiency is 0.47 for 47 dBi and 0.61 for 6.5×10⁴.

### S5e — Received signal power today: two NASA statements that disagree
1. Voyager "Did You Know?" (S3c URL): "The antennas must capture Voyager information from a signal so weak that the power striking the antenna is only 10 exponent -16 watts (1 part in 10 quadrillion). A modern-day electronic digital watch operates at a power level 20 billion times greater than this feeble level." (No epoch is given; the value is consistent with Yuen's Jupiter-era 3×10⁻¹⁶ W.)
2. "Two Voyagers Taught Us How to Listen to Space" (2017): "The transmitter on each of the Voyagers is just strong enough to power an ordinary refrigerator light bulb. By the time those signals reach Earth, they're one-tenth of a billionth-trillionth of a watt." This is 0.1 × 10⁻⁹ × 10⁻¹² = **10⁻²² W**.
- These differ by about 10⁶. They probably refer to different epochs and distances (Jupiter in 1979 versus more than 100 au in 2017) and possibly to different definitions. Do not merge them; quote each with its context.

---

## 6. Attitude control: reaction wheels and gyroscopes

### S6a — NASA Science, Hubble "Pointing Control"
- URL: https://science.nasa.gov/mission/hubble/observatory/design/pointing-control/. dateModified 2025-01-21. NASA web content (publisher Michelle Belleville; bio: not verified).
- Verbatim:
  - "Hubble relies on its complement of four 100-pound (45 kg) reaction wheel assemblies for attitude control, and four magnetic torque bars for momentum management."
  - "Hubble's gyroscopes spin at 19,200 revolutions per minute."
  - "When Hubble rotates, its gyroscopes measure the direction the telescope is turning and the rate of that rotation."
  - "Typically, three gyroscopes are used at a time to measure Hubble’s rotation rate in all three dimensions"
  - "Two actuator systems physically rotate Hubble: the Reaction Wheel Assemblies and the magnetic torquers. Neither of these systems uses propellants, since the byproducts could contaminate the telescope’s field of view."
  - "Newton’s third law of motion states that for every action, there is an equal and opposite reaction. Hubble utilizes this principle with its four reaction wheels, which are large, massive wheels that spin under the control of Hubble’s computer. If one of the reaction wheels turns clockwise, Hubble will turn counterclockwise. Changing the spin speed of any of the wheels produces a rotational force called torque."
  - "However, at its fastest, Hubble only moves as quickly as the minute hand of a clock (approximately 90 degrees in 15 minutes)."
  - "The magnetic torquers are used to help reduce reaction wheel speeds, which can build up because of drag caused by Earth’s atmosphere"
- Hubble "Design" page, https://science.nasa.gov/mission/hubble/observatory/design/ (dateModified 2024-11-25):
  - "Hubble's precision varies by less than 7 milliarcseconds in a 24-hour period when locked on its target."
  - "The telescope has six gyros, but typical operations only use three of them. […] Today, Hubble has three operational gyros, but operates with one."

### S6b — Basics of Space Flight Ch. 11 p. 2 (angular-momentum framing)
- URL: https://science.nasa.gov/learn/basics-of-space-flight/chapter11-2/. dateModified 2025-01-16. Dave Doody, JPL.
- "Another method for achieving three-axis stabilization is to use electrically-powered reaction wheels, also called momentum wheels. Massive wheels are mounted in three orthogonal axes aboard the spacecraft. They provide a means to trade angular momentum back and forth between spacecraft and wheels. To rotate the vehicle in one direction, you spin up the proper wheel in the opposite direction. To rotate the vehicle back, you slow down the wheel. Excess momentum that builds up in the system due to external torques, caused for example by solar photon pressure or gravity gradient, must be occasionally removed from the system […] This is done during maneuvers called momentum desaturation"
- "Spin: Stabilization can be accomplished by setting the vehicle spinning, like the Pioneer 10 and 11 spacecraft […] The gyroscopic action of the rotating spacecraft mass is the stabilizing mechanism."
- "Gyros provide inertial reference inputs to AACS computers. If they have any moving parts, they are small and lightweight. Reaction wheel are [sic] fairly massive attitude control devices at the output of AACS computers."
- "Mechanical gyros Used on Voyager and Magellan, these rely on the rigidity in space of the axis of a spinning mass to provide attitude reference signals."
- Voyager attitude (S3a page): "The identical Voyager spacecraft are three-axis stabilized systems that use celestial or gyro referenced attitude control to maintain pointing of the high-gain antennas toward Earth."

---

## 7. Thermal regulation

### S7a — NASA Small Spacecraft Systems Virtual Institute, *State-of-the-Art of Small Spacecraft Technology*, Ch. 7 "Thermal Control" (2026 edition)
- URL: https://www.nasa.gov/wp-content/uploads/2026/05/7-soa-thermal-2026-final.pdf
- NASA (Ames Small Spacecraft Systems Virtual Institute). Uploaded 2026-05. US Government work. No individual authors are listed in the chapter PDF. Read from the born-digital text layer.
- §7.1, p. 198 (PDF p. 4):
  - "Spacecraft temperatures are determined by how much heat is absorbed, stored, generated, and dissipated by the spacecraft."
  - "Thermal control of a spacecraft is achieved by balancing the energy flows as shown in Equation 1: qsolar + qalbedo + qplanetshine + Qgen = Qstored + Qout,rad (1)"
  - "The amount of qsolar (solar heating) absorbed by the spacecraft depends on the solar flux, which is determined by the distance to the Sun, the surface area viewing the Sun (view factor), and the solar absorptivity of that surface."
  - "Qout,rad (heat emitted via radiation) includes the surface area designated as radiator space, the IR emissivity of the surface, and the difference in temperature between the spacecraft radiator and the heat sink to which it is dissipating, typically and most effectively to deep space."
- §7.2.7 "Deployable Radiators":
  - "A radiator is a dedicated surface for dissipating excess heat via radiative heat transfer and has a high IR emissivity and low solar absorptivity—an optical property combination typically referred to as “radiator properties.”"
- Oddity: the Fig. 7.1 caption says Q terms are "represented as heat values, Watts per square meter". Watts would be expected. Quote with care.

### S7b — Stefan–Boltzmann law: NASA Science Universe glossary
- URL: https://science.nasa.gov/universe/glossary/. dateModified 2026-08-25.
- "Stefan-Boltzmann law: The total radiation emitted by a blackbody is proportional to the radiating surface area and the fourth power of its absolute temperature. The proportionality constant, σ, equals 5.670374419 x 10-8 watts per square meter x K-4. Named for physicists Josef Stefan (1835-1893) and Ludwig Boltzmann (1844-1906)."
- The glossary has no explicit P = εσAT⁴ formula with emissivity. Combine it with S7a's "IR emissivity" wording; the combination is our synthesis, not a quote.

### S7c — Basics of Space Flight Ch. 11 p. 4 (thermal control hardware)
- URL: https://science.nasa.gov/learn/basics-of-space-flight/chapter11-4/. dateModified 2026-09-24. Dave Doody, JPL.
- "Passive thermal control is obtained with multi-layer insulation, MLI […] Gold is a very efficient IR reflector, and is used to shade critical components."
- "Louvers vary the angle of their blades to provide thermal control by changing the effective emission of a covered surface."
- "The louvers are positioned by bi-metallic strips similar to those in a thermostat. They directly force the louvers open when internal temperatures are high, permitting heat to radiate into space. Cold internal temperatures cause the louvers to drive closed to reflect back and retain heat."
- "Active thermal control components include autonomous, thermostatically controlled resistive electric heaters"
- "Sometimes radioisotope heater units (RHUs) are placed at specific locations on the spacecraft."
- Ch. 11-3: "The shunt regulator converts excess electrical energy into heat, most of which is radiated away into space via a radiating plate."

---

## NOT FOUND / gaps

1. **Tsiolkovsky 1903:** not sourced. No readable scan was searched for in time, and the original is in Russian, which would need translation and verification. Use NASA Glenn S1a for the equation.
2. **Hohmann transfer Δv formula:** no verbatim NASA or public-domain statement of Δv₁ = √(μ/r₁)(√(2r₂/(r₁+r₂)) − 1) and so on was found.
   - Basics of Space Flight describes the Hohmann transfer qualitatively and defers to a private website for the energy.
   - Hohmann 1925 (*Die Erreichbarkeit der Himmelskörper*) and its NASA translation (TT F-44) were not found through the NTRS API search.
   - Moulton's vis-viva (24) is quoted; Δv can be *derived* from it, but that derivation would be ours.
3. **Escape velocity in modern NASA wording/numbers:** not found. Only Moulton 1914 (V² = 2gR, 11,180 m/s) is quoted. Basics of Space Flight mentions escape velocity without a formula.
4. **Explicit "solar intensity ∝ 1/r²" sentence on a NASA page:** not found as a single statement.
   - What is quoted: Juno "five times farther … 25 times less sunlight"; Yuen's flux = P/(4πr²) for radio; and the glossary's inverse square for gravity.
   - The S4 1361 W/m² cross-check from luminosity and AU is our arithmetic.
5. **Stefan–Boltzmann with emissivity (εσT⁴) and a radiator-sizing equation on a NASA page:** not found. Only the glossary definition and the SOA qualitative energy balance are quoted.
6. **Voyager MHW-RTG power trajectory year by year:** not found. Quoted values: 158 We × 3 at launch; 225 We as of 2023; about 4 W per year; and "400 watts" ("Did You Know"). These are not mutually consistent on a linear model (see S3c).
7. **Current Voyager received power and data rate at today's distance:** only the two conflicting NASA statements (10⁻¹⁶ W and 10⁻²² W) were found. The 160 bit/s is the "normal" rate from the spacecraft page.
8. **Not used because of access:** voyager.jpl.nasa.gov and descanso.jpl.nasa.gov (robots.txt returned 403), and www.jpl.nasa.gov (403 from CloudFront on a news page; stopped).
9. **Author bios:** only Dave Doody (Basics of Space Flight) is verified, from the official editorial page. Nancy Hall (Glenn editor), Joseph H. Yuen, F. R. Moulton and the science.nasa.gov web publishers are **bio: not verified**.
