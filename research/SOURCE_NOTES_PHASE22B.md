# Source notes — Phase 22B: weather phenomena of other worlds (planetary meteorology library)

Research date: 2026-11-28. Researcher: source-research subagent. Rules: /tmp/vv-research/p20/RULES.md.
Raw HTML + extracted text: /tmp/vv-research/p22/b/ (`<name>.html`, `<name>.txt`).
User-Agent: "VoyagerVentures-Research/0.1 (educational; respects robots.txt)"; ≥1.2 s between requests.
Quotes below are copied verbatim from the extracted page text (HTML text layer). Data-kind tags:
**OBS** = direct observation/measurement, **INF** = inference from observations, **MOD** = model, **EDU** = educational summary (NASA explainer page restating results; kind of underlying fact noted where clear).

## Robots / access log

| Host | robots.txt result (fetched first) | Used? |
|---|---|---|
| science.nasa.gov | 200; `User-agent: * Allow: /` (usasearch Crawl-delay 1) | Yes |
| www.nasa.gov | 200; `User-agent: * Allow: /` | Yes |
| www.esa.int | 200; `User-agent: * Disallow:` (empty = all allowed) | Yes (2 pages; old URLs 301 to `/articles/...`) |
| photojournal.jpl.nasa.gov | 301 → robots request lands on https://science.nasa.gov/photojournal/ (Photojournal now hosted on science.nasa.gov) | Used via science.nasa.gov/photojournal/ only |
| webbtelescope.org | 301 → https://science.nasa.gov/mission/webb/ (site now redirects to NASA Science) | Not fetched directly; Webb releases read on science.nasa.gov |
| www.jpl.nasa.gov, webb.nasa.gov, arxiv/ncbi etc. | OFF-LIMITS per rules — not fetched (search results pointing to arxiv.org and ncbi PMC were ignored) | No |

No bot walls/403s encountered. One ESA URL (Venus_Express_overview3) returned 404 — not used.
Licence: NASA web text is generally not copyrighted (U.S. Government work; NASA Media Usage Guidelines). ESA page text is © ESA — quote short excerpts with attribution only; no ESA terms forbidding automated reading were seen on the pages fetched. Author bios: not verified for any named scientist (none checked on official bio pages) — "bio: not verified" throughout.

---

## 1. Mercury

**S1. NASA Science, "Mercury: Facts."** https://science.nasa.gov/mercury/facts/ — published 2017-10-16, modified 2025-04-25. NASA. Raw: mercury-facts.txt.
- (EDU of OBS) "During the day, temperatures on the surface can reach 800 degrees Fahrenheit (430 degrees Celsius). Because the planet has no atmosphere to retain that heat, nighttime temperatures on the surface can drop to minus 290 degrees Fahrenheit (minus 180 degrees Celsius)."
- (EDU of OBS) "Instead of an atmosphere, Mercury possesses a thin exosphere made up of atoms blasted off the surface by the solar wind and striking meteoroids. Mercury's exosphere is composed mostly of oxygen, sodium, hydrogen, helium, and potassium."
- (EDU; OBS + INF) "Though Mercury's magnetic field at the surface has just 1% the strength of Earth's, it interacts with the magnetic field of the solar wind to sometimes create intense magnetic tornadoes that funnel the fast, hot solar wind plasma down to the surface of the planet."
- Seasons: "Mercury's axis of rotation is tilted just 2 degrees … and so does not experience seasons as many other planets do."

**S2. NASA Photojournal, "Modeling the 'Seasons' of Mercury's Tail."** https://science.nasa.gov/photojournal/modeling-the-seasons-of-mercurys-tail/ — 2009-11-05. MESSENGER (MASCS) flybys 2 and 3. Raw: merc-tail.txt.
- (OBS + MOD) "As in previous flybys, the distinct north and south enhancements in the emission that result from material being sputtered from the surface at high latitudes on the dayside are seen. The lower two panels show Monte Carlo models of the sodium abundance in Mercury's exosphere … These models illustrate that the "disappearance" of Mercury's neutral sodium tail is consistent with the change in conditions."
- Gap: numeric "factor of 10–20" fainter tail (flyby 3) seen only in a search snippet of a different Photojournal page (PIA "Mercury Flyby 3 Reveals a Highly Diminished Sodium Tail") — NOT fetched/verified.

## 2. Venus

**S3. NASA Science, "Venus: Facts."** https://science.nasa.gov/venus/venus-facts/ — published 2017-11-09, modified 2026-11-12. Raw: venus-facts.txt.
- (EDU of OBS/INF) "Its thick atmosphere traps heat in a runaway greenhouse effect, making it the hottest planet in our solar system with surface temperatures hot enough to melt lead — about 872 degrees Fahrenheit (467 Celsius). And the atmospheric pressure at the surface is about 93 times what it is at sea level on Earth."
- (EDU) "The atmosphere is mostly carbon dioxide — the same gas drives the greenhouse effect on both Venus and Earth — with dense clouds composed of sulfuric acid. The atmospheric pressure at the surface measures a crushing 93 times what it is at sea level on Earth."
- (OBS) "At the tops of Venus' clouds, whipped around the planet by winds measured as high as 224 mph (360 kph), we find another transformation. Persistent, dark streaks appear."
- Also: "Thirty miles up (about 50 kilometers) from the surface of Venus temperatures range from 86 to 158 Fahrenheit (30 to 70 Celsius)." Seasons: tilt "only three degrees".
- **DISCREPANCY vs brief:** brief says ~465 °C and ~92 bar; NASA page (2026 version) says 467 °C (872 °F) and "about 93 times" sea-level pressure (also "more than 3,000 feet underwater … (930 meters)"). Use NASA's figures or record both.

**S4. ESA, "Tracking alien turbulences with Venus Express."** https://www.esa.int/Science_Exploration/Space_Science/Venus_Express/Tracking_alien_turbulences_with_Venus_Express (301 → https://www.esa.int/articles/about-us/directorates/science/venus-express/tracking-alien-turbulences-with-venus-express). ESA, c. Nov 2006 (text: "One year after its launch on 9 November 2005"). Instrument VIRTIS. © ESA. Raw: esa-vex-turb.txt.
- (OBS) "Winds are so powerful and fast that they circumnavigate the planet in only four Earth days – the atmospheric 'super-rotation' – while the planet itself is very slow in comparison, taking 243 Earth days to perform one full rotation around its axis."
- (OBS) "At mid latitudes they are more regular and streaky, running almost parallel to the direction of the super rotation with speed reaching more than 400 kilometres per hour. Going higher up in latitude, in the polar region, the clouds end up in entering a vortex shape."
- Note: ESA ">400 km/h" vs NASA "measured as high as 224 mph (360 kph)" — record both.

## 3. Mars

**S5. NASA Science, "Mars: Facts."** https://science.nasa.gov/mars/facts/ — published 2017-11-10, modified 2026-07-10. Raw: mars-facts.txt.
- (EDU) "Mars has a thin atmosphere made up mostly of carbon dioxide, nitrogen, and argon gases."
- (EDU of OBS) "The temperature on Mars can be as high as 70 degrees Fahrenheit (20 degrees Celsius) or as low as about -225 degrees Fahrenheit (-153 degrees Celsius)."
- (EDU) "Occasionally, winds on Mars are strong enough to create dust storms that cover much of the planet. After such storms, it can be months before all of the dust settles."
- (INF) "Mars appears to have had a watery past, with ancient river valley networks, deltas, and lakebeds … Some features suggest that Mars experienced huge floods about 3.5 billion years ago."

**S6. NASA Science, "10 Things: Massive Dust Storm on Mars."** https://science.nasa.gov/solar-system/planets/mars/10-things-massive-dust-storm-on-mars/ — 2018-06-13 (update 2018-06-20). Raw: mars-10things.txt.
- (OBS) "UPDATE (June 20, 2018): A storm of tiny dust particles has engulfed much of Mars over the last two weeks and prompted NASA's Opportunity rover to suspend science operations."
- (OBS) "Opportunity is currently hunkered down on Mars near the center of a storm bigger than North America and Russia combined. The dust-induced darkness means the solar-powered rover can't recharge its batteries."
- (OBS, historical) "But we've seen global dust storms in 1971, 1977, 1982, 1994, 2001 and 2007."

**S7. NASA Science, "NASA's Opportunity Rover Mission on Mars Comes to End."** https://science.nasa.gov/missions/mer/nasas-opportunity-rover-mission-on-mars-comes-to-end/ — 2019-02-13. Raw: oppy-end.txt.
- (OBS) "The Opportunity rover stopped communicating with Earth when a severe Mars-wide dust storm blanketed its location in June 2018. … The solar-powered rover's final communication was received June 10."
- "Late on Feb. 12, 2019, mission controllers … sent the last commands …"

**S8. NASA Science, "Pressure Cycles on Mars"** (Curiosity REMS). https://science.nasa.gov/resource/pressure-cycles-on-mars/ — 2012-11-15. Raw: mars-pressure.txt.
- (OBS + INF) "This happens because the south pole receives more and more sunlight, and carbon dioxide vaporizes off of the winter south polar cap. Each year the atmosphere grows and shrinks by about 30 percent due to this effect. The curves also show a strong daily variation in pressure of around 10 percent, with a peak near 7 a.m. on Mars and a minimum near 4 p.m."
- Note: this is a ~30 % seasonal pressure swing, not explicitly "fraction that freezes out". A 12–16 % mass-fraction figure appeared only in an arXiv search snippet (not fetched; not usable).

**S9. NASA news release, "NASA's MAVEN Reveals Most of Mars' Atmosphere Was Lost to Space."** https://www.nasa.gov/news-release/nasas-maven-reveals-most-of-mars-atmosphere-was-lost-to-space/ — Mar 30, 2017. Raw: maven-lost.txt.
- (INF from OBS: argon isotopes, MAVEN NGIMS + Curiosity SAM) "The team made this determination from the latest results, which reveal that about 65 percent of the argon that was ever in the atmosphere has been lost to space."
- (EDU of mechanism) "In sputtering, ions picked up by the solar wind can impact Mars at high speeds and physically knock atmospheric gas into space."

**S10. NASA news release, "NASA Mission Reveals Speed of Solar Wind Stripping Martian Atmosphere."** https://www.nasa.gov/news-release/nasa-mission-reveals-speed-of-solar-wind-stripping-martian-atmosphere/ — Nov 05, 2015. Raw: maven-speed.txt.
- (OBS) "MAVEN measurements indicate that the solar wind strips away gas at a rate of about 100 grams (equivalent to roughly 1/4 pound) every second."
- (OBS) "a series of dramatic solar storms hit Mars' atmosphere in March 2015, and MAVEN found that the loss was accelerated."
- (OBS) "almost 75 percent of the escaping ions come from the tail region, and nearly 25 percent are from the plume region".

## 4. Jupiter

**S11. NASA Science, "Jupiter Facts."** https://science.nasa.gov/jupiter/jupiter-facts/ — published 2017-10-05, modified 2026-10-15. Raw: jupiter-facts.txt.
- (EDU) "The dark orange stripes are called belts, while the lighter bands are called zones, and they flow east and west in opposite directions."
- (EDU of OBS) "Stormy Jupiter is swept by over a dozen prevailing winds, some reaching up to 335 miles per hour (539 kilometers per hour) at the equator. The Great Red Spot, a swirling oval of clouds twice as wide as Earth, has been observed on the giant planet for more than 300 years."
- (OBS, Juno MWR/gravity, Oct 2021) "some extending 60 miles (100 kilometers) below the cloud tops and others, including the Great Red Spot, extending over 200 miles (350 kilometers)." … "the Juno team was able to constrain the extent of the Great Red Spot to a depth of about 300 miles (500 kilometers) below the cloud tops."
- (OBS/INF) "Juno previously discovered that these winds, or jet streams, reach depths of about 2,000 miles (roughly 3,200 kilometers). … the atmosphere's ammonia gas travels up and down in remarkable alignment with the observed jet streams."
- (OBS) "eight arranged in an octagonal pattern in the north and five arranged in a pentagonal pattern in the south."
- Note internal inconsistency: "twice as wide as Earth" (this page) vs "1.3 times as wide as Earth" (S13, 2017) — "twice" is the 1979 value per S13.

**S12. NASA Science (Hubble), "Hubble Shows that Jupiter's Great Red Spot Is Smaller than Ever Seen Before."** https://science.nasa.gov/missions/hubble/hubble-shows-that-jupiters-great-red-spot-is-smaller-than-ever-seen-before/ — 2014-05-15. Raw: grs-2014.txt.
- (OBS) "'Recent Hubble Space Telescope observations confirm that the Great Red Spot (GRS) is now approximately 10,250 miles across, the smallest diameter we've ever measured,' said Amy Simon of NASA's Goddard Space Flight Center"
- (OBS) "Historic observations as far back as the late 1800s gauged the GRS to be as big as 25,500 miles on its long axis. The NASA Voyager 1 and Voyager 2 flybys of Jupiter in 1979 measured the GRS to be 14,500 miles across."
- (OBS) "one Hubble photo was taken in 1995 when the long axis of the GRS was estimated to be 13,020 miles across. In a 2009 photo, the GRS was measured at 11,130 miles across." Also: "'waistline' is getting smaller by 580 miles per year."

**S13. NASA Science (Juno), "NASA's Juno Probes the Depths of Jupiter's Great Red Spot."** https://science.nasa.gov/missions/juno/nasas-juno-probes-the-depths-of-jupiters-great-red-spot/ — 2017-12-11. Raw: grs-juno.txt.
- (OBS) "Measuring 10,000 miles (16,000 kilometers) in width as of April 3, 2017, the Great Red Spot is 1.3 times as wide as Earth."
- (OBS, July 2017 pass) Bolton: "has roots that penetrate about 200 miles (300 kilometers) into the planet's atmosphere." [**note:** 200 miles ≈ 320 km; page prints 300 km. Later page S11 gives 200 mi/350 km and 300 mi/500 km — record as printed.]

**S14. NASA Science (Hubble), "NASA's Hubble Watches Jupiter's Great Red Spot Behave Like a Stress Ball."** https://science.nasa.gov/missions/hubble/nasas-hubble-watches-jupiters-great-red-spot-behave-like-a-stress-ball/ — 2024-10-09. Raw: grs-hubble2024.txt.
- (OBS) "Hubble's new observations of the famous red storm, collected 90 days between December 2023 to March 2024, reveal that the GRS is not as stable as it might look." … "The cause of the 90-day oscillation is unknown."

Internal heat: no quote fetched (gap).

## 5. Saturn

**S15. NASA Science, "Saturn: Facts."** https://science.nasa.gov/saturn/facts/ — published 2017-11-10, modified 2026-10-15. Raw: saturn-facts.txt.
- (OBS) "Winds in the upper atmosphere reach 1,600 feet per second (500 meters per second) in the equatorial region."
- (OBS, Voyager → Cassini) "This hexagon-shaped pattern was first noticed in images taken by the twin Voyager spacecraft in the early 80s. Later, it was more closely observed by the Cassini spacecraft. Spanning about 20,000 miles (30,000 kilometers) across, the hexagon is a wavy jet stream of 200-mile-per-hour winds (about 322 kilometers per hour) with a massive, rotating storm at the center."
- (OBS, Hubble, NEW Sept 2026) "recent observations with NASA's Hubble Space Telescope revealed a giant, evolving, 10-sided — or decagonal — atmospheric wave encircling Saturn's south pole, according to a research study published in September 2026."
- Seasons: "Its axis is tilted by 26.73 degrees … This means that, like Earth, Saturn experiences seasons."

**S16. NASA Science (Cassini), "A Day in the Life."** https://science.nasa.gov/resource/a-day-in-the-life/ — 2011-07-06. Raw: saturn-day.txt.
- (OBS) "This storm is the largest and most intense observed on Saturn by NASA's Voyager or Cassini spacecraft. … the storm encircles the planet - whose circumference at these latitudes is 186,000 miles (300,000 kilometers). From north to south, it covers a distance of about 9,000 miles (15,000 kilometers) … It encompasses an area of 1.5 billion square miles (4 billion square kilometers), or eight times the surface area of Earth."

**S17. NASA Science, "Cassini 10 Years at Saturn Top 10 Discoveries."** https://science.nasa.gov/missions/cassini/cassini-10-years-at-saturn-top-10-discoveries/ — 2014-06-24. Raw: cassini-top10.txt.
- (OBS) "Late in 2010, Saturn's relatively tranquil atmosphere erupted with a storm of gigantic proportions. Typically a 30-year storm, this one arrived 10 years early … The largest temperature increases ever recorded for any planet were measured. … The storm diminished shortly after its head collided with its tail, a little less than a year after it began."
- (OBS) "Saturn's polar regions have surprised scientists with a the presence of a long-lived hexagonal-shaped jet stream in the north and two hurricane-like storms at both poles." [sic "a the"]
- Also Huygens item (see Titan).
- Gap: hexagon rotation period not found on fetched pages.

## 6. Uranus

**S18. NASA Science, "Uranus: Facts."** https://science.nasa.gov/uranus/facts/ — published 2017-11-10, modified 2026-10-15. Raw: uranus-facts.txt.
- (EDU) "Uranus is the only planet whose equator is nearly at a right angle to its orbit, with a tilt of 97.77 degrees. … This unique tilt causes Uranus to have the most extreme seasons in the solar system. For nearly a quarter of each Uranian year, the Sun shines directly over each pole, plunging the other half of the planet into a 21-year-long, dark winter."
- (EDU) "Methane gas absorbs the red portion of the light, resulting in a blue-green color."
- (OBS) "Wind speeds can reach up to 560 miles per hour (900 kilometers per hour) on Uranus. Winds are retrograde at the equator …"; "minimum temperature of 49K (-224.2 degrees Celsius)".
- **CAUTION:** page says "Voyager 2 saw only a few discrete clouds, a Great Dark Spot, and a small dark spot during its flyby in 1986" — the "Great Dark Spot" was a Neptune (1989) feature; this sentence appears erroneous. Do not use.

**S19. NASA Science (Hubble OPAL), "Hubble Reveals Dynamic Atmospheres of Uranus, Neptune."** https://science.nasa.gov/missions/hubble/hubble-reveals-dynamic-atmospheres-of-uranus-neptune/ — 2019-02-07. Raw: uranep-hubble.txt.
- (OBS) "This Hubble Space Telescope Wide Field Camera 3 image of Uranus, taken in November 2018, reveals a vast, bright stormy cloud cap across the planet's north pole."
- (EDU) "Atmospheric methane absorbs red light but allows blue-green light to be scattered back into space, giving each planet a cyan hue."
- Keck observations: not found (gap).

## 7. Neptune

**S20. NASA Science, "Neptune: Facts."** https://science.nasa.gov/neptune/neptune-facts/ — published 2017-11-10, modified 2026-10-15. Raw: neptune-facts.txt.
- (OBS) "Neptune is our solar system's windiest world. … These winds whip clouds of frozen methane across the planet at speeds of more than 1,200 miles per hour (2,000 kilometers per hour)."
- (OBS, Voyager 2) "In 1989 a large, oval-shaped storm in Neptune's southern hemisphere dubbed the "Great Dark Spot" was large enough to contain the entire Earth. That storm has since disappeared, but new ones have appeared on different parts of the planet."
- (EDU) "since its year is so long, each of the four seasons lasts for over 40 years." Colour note: "Researchers in 2024 re-processed the images, showing the planets look much more alike than many thought."

**S21. NASA Science (Hubble), "Hubble Tracks the Lifecycle of Giant Storms on Neptune."** https://science.nasa.gov/missions/hubble/hubble-tracks-the-lifecycle-of-giant-storms-on-neptune/ — 2019-03-25. Raw: neptune-hubble.txt.
- (OBS) "In the Voyager image, a storm known as the Great Dark Spot is seen at the center. It is about 13,000 km by 6,600 km (approximately 8,000 miles by 4,100 miles) in size".
- (OBS) "Just five years later, in 1994, NASA's Hubble Space Telescope … Hubble's photos revealed that both the Earth-sized Great Dark Spot and the smaller Dark Spot 2 had vanished."
- (OBS) "In 2018, a new dark spot emerged, hovering at 23 degrees north latitude."
- S19 adds (OBS/INF): "the fourth and latest mysterious dark vortex captured by Hubble since 1993 … Hubble uncovered the latest storm in September 2018 in Neptune's northern hemisphere. The feature is roughly 6,800 miles across." and "dark spots appear every four to six years at different latitudes and disappear after about two years." (Search snippet of another NASA page gave 4,600 miles — not fetched; record 6,800 as printed here.)
- Internal heat: no quote fetched (gap). Note: brief's "600 m/s" not printed; NASA prints ">2,000 km/h".

## 8. Titan

**S22. NASA Science, "Titan: Facts."** https://science.nasa.gov/saturn/moons/titan/facts/ — published 2018-05-02, modified 2026-10-19. Raw: titan-facts.txt.
- (EDU of OBS) "Like Earth, Titan's atmosphere is primarily nitrogen, plus a small amount of methane. It is the sole other place in the solar system known to have an earthlike cycle of liquids raining from clouds, flowing across its surface, filling lakes and seas, and evaporating back into the sky (akin to Earth's water cycle)."
- (INF) "Because sunlight continuously breaks down methane in Titan's atmosphere, some source must be replenishing it or it would be depleted over time."
- (OBS) "Here it is so cold (-290 degrees Fahrenheit or -179 degrees Celsius) that water ice plays the role of rock."

**S23. ESA, "Highlights of ESA's Huygens mission."** https://www.esa.int/Science_Exploration/Space_Science/Results_from_Mars_Express_and_Huygens/Highlights_of_ESA_s_Huygens_mission (301 → /articles/about-us/directorates/science/highlights-of-esa-s-huygens-mission). ESA, summary of Lebreton et al., Nature, online 30 Nov 2005. © ESA. Raw: esa-huygens.txt.
- (OBS) "It reached the upper layer of Titan's atmosphere on 14 January 2005 and landed on the surface after a parachute descent of 2 hours and 28 minutes."
- (OBS) "Winds were found to blow predominantly in the direction of Titan's rotation, west to east winds, with speeds up to 450 km/h above an altitude of 120 km."
- (OBS) "'Haze' was detected all the way down to the surface, contrary to the predictions of pre-Huygens models."
- **DISCREPANCY:** NASA S17 says "The probe's 2-hour and 27-minute descent"; ESA says 2 h 28 min. Record both.
- NASA S17 (OBS/INF): "revealed Titan to be remarkably like Earth before life evolved, with methane rain, erosion and drainage channels and dry lake beds."
- Surface pressure (~1.5 bar) not found on fetched pages (gap).

## 9. Triton

**S24. NASA Science, "Triton."** https://science.nasa.gov/neptune/moons/triton/ — 2017-11-21, modified 2024-11-03. Raw: triton.txt.
- (OBS + INF) "Triton's thin atmosphere is composed mainly of nitrogen with small amounts of methane. This atmosphere most likely originates from Triton's volcanic activity, which is driven by seasonal heating by the Sun."
- (OBS, Voyager 2 1989) "Voyager 2 … found surface temperatures of -391degrees Fahrenheit (-235 degrees Celsius). During its 1989 flyby, Voyager 2 also found Triton has active geysers".
- S20 adds (OBS): "Voyager 2 discovered geysers spewing icy material upward more than 5 miles (8 kilometers). Triton's thin atmosphere, also discovered by Voyager, has been detected from Earth several times since, and is growing warmer, but scientists do not yet know why."

## 10. Pluto

**S25. NASA Science, "Pluto: Facts."** https://science.nasa.gov/dwarf-planets/pluto/facts/ — 2017-11-09, modified 2025-04-22. Raw: pluto-facts.txt.
- (EDU; INF/MOD) "Pluto has a thin, tenuous atmosphere that expands when it comes closer to the Sun and collapses as it moves farther away – similar to a comet."
- (INF) "During this time, the bulk of the planet's atmosphere may freeze and fall as snow to the surface."

**S26. NASA Science, "Blue Rays: New Horizons' High-Res Farewell to Pluto."** https://science.nasa.gov/resource/blue-rays-new-horizons-high-res-farewell-to-pluto/ — 2017-03-24. LORRI + MVIC. Raw: pluto-bluerays.txt.
- (OBS + INF) "Scientists believe the haze is a photochemical smog resulting from the action of sunlight on methane and other molecules in Pluto's atmosphere … These hydrocarbons accumulate into small haze particles, a fraction of a micrometer in size, which preferentially scatter blue sunlight".
- (OBS) "The haze layers extend to altitudes of over 120 miles (200 kilometers)."

**S27. NASA, "New Horizons Finds Blue Skies and Water Ice on Pluto."** https://www.nasa.gov/missions/new-horizons-finds-blue-skies-and-water-ice-on-pluto/ — 2015-10-08. Raw: pluto-blue.txt.
- (OBS) "The first color images of Pluto's atmospheric hazes, returned by NASA's New Horizons spacecraft last week, reveal that the hazes are blue."
- (INF) Howett: "On Pluto they appear to be larger — but still relatively small — soot-like particles we call tholins."

**S28. NASA Photojournal, "First Stellar Occultations Shed Additional Light on Pluto's Atmosphere."** https://science.nasa.gov/photojournal/first-stellar-occultations-shed-additional-light-on-plutos-atmosphere/ — 2016-05-18. New Horizons Alice. Raw: pluto-occ.txt.
- (OBS) "Both stellar occultations revealed ultraviolet spectral fingerprints of nitrogen, hydrocarbons like methane and acetylene, and even haze".
- (OBS/INF) "the upper atmospheric temperature is as much as 25 percent colder and thus more compact than what scientists predicted … the escape rate of nitrogen is about 1,000 times lower than expected before the flyby."
- Gap: Earth-based occultation pressure history (×3 since 1988) found only on arXiv — off-limits/not fetched.

## 11. Io, Europa, Enceladus

**S29. NASA Science (Hubble), "NASA's Hubble Space Telescope Explores the Volcanic Moon Io."** https://science.nasa.gov/missions/hubble/nasas-hubble-space-telescope-explores-the-volcanic-moon-io/ — 1992-10-02 (archival release). Raw: io-hubble.txt.
- (OBS) "This is the first time astronomers have been able to directly gauge the size of the tenuous atmosphere around Io … The atmosphere may also be patchy with very dense regions lying over volcanoes or above areas of surface frost." "The observations confirm that the surface contains sulfur dioxide frost."
- NASA Io page (https://science.nasa.gov/jupiter/jupiter-moons/io/, raw io.txt) (OBS): "Jupiter's moon Io is the most volcanically active world in the solar system, with hundreds of volcanoes". [Note: same page says "three spacecraft – Ulysses, Cassini, New Horizons, and Juno" — lists four; NASA error.]
- Gap: eclipse collapse of SO₂ atmosphere — only arXiv sources found; not used.

**S30. NASA Science (Hubble), "Hubble Spots Possible Water Plumes Erupting on Jupiter's Moon Europa."** https://science.nasa.gov/missions/hubble/hubble-spots-possible-water-plumes-erupting-on-jupiters-moon-europa/ — 2016-09-26. STIS. Raw: europa-hubble.txt.
- (OBS, tentative) "Astronomers using NASA's Hubble Space Telescope have imaged what may be water vapor plumes erupting off the surface of Jupiter's moon Europa."
- (INF) "The plumes are estimated to rise about 125 miles (200 kilometers) before, presumably, raining material back down onto Europa's surface."

**S31. NASA Science, "Enceladus."** https://science.nasa.gov/saturn/moons/enceladus/ — 2017-11-20, modified 2024-11-04. Raw: enceladus.txt.
- (OBS, Cassini) "In 2005, NASA's Cassini spacecraft discovered that icy water particles and gas gush from the moon's surface at approximately 800 miles per hour (400 meters per second). The eruptions appear to be continuous, generating an enormous halo of fine ice dust around Enceladus, which supplies material to Saturn's E-ring." [**note:** 400 m/s ≈ 895 mph; page prints 800 mph — record as printed / flag.]
- (OBS) "most of it falling like snow back to the moon's surface".

## 12. Exoplanets (JWST)

**S32. NASA Science (Webb), "NASA's Webb Detects Carbon Dioxide in Exoplanet Atmosphere."** https://science.nasa.gov/missions/webb/nasas-webb-detects-carbon-dioxide-in-exoplanet-atmosphere/ — 2022-08-25. NIRSpec, transit 10 July 2022. Raw: wasp39.txt.
- (OBS) "NASA's James Webb Space Telescope has captured the first clear evidence for carbon dioxide in the atmosphere of a planet outside the solar system. This observation of a gas giant planet orbiting a Sun-like star 700 light-years away …"
- (OBS) "a small hill between 4.1 and 4.6 microns presents the first clear, detailed evidence for carbon dioxide ever detected in a planet outside the solar system."
- (EDU) "WASP-39 b is a hot gas giant with a mass roughly one-quarter that of Jupiter … (about 1,600 degrees Fahrenheit or 900 degrees Celsius) … completing one circuit in just over four Earth-days."

**S33. NASA Science (Webb), "NASA's Webb Reveals an Exoplanet Atmosphere as Never Seen Before."** https://science.nasa.gov/missions/webb/nasas-webb-reveals-an-exoplanet-atmosphere-as-never-seen-before/ — 2022-11-22. Raw: wasp39-2.txt. (Papers partly "under review" at the time.)
- (OBS + INF) "Among the unprecedented revelations is the first detection in an exoplanet atmosphere of sulfur dioxide (SO2), a molecule produced from chemical reactions triggered by high-energy light from the planet's parent star."
- (OBS) "carbon monoxide (CO) was detected, but obvious signatures of both methane (CH4) and hydrogen sulfide (H2S) were absent from the Webb data."

## 13. Real images (record only; not downloaded)

| Image | Page | Credit (verbatim) | Date / mission / instrument | File URL |
|---|---|---|---|---|
| PIA14903 "Encircling a Giant" (Saturn 2010–11 storm) | https://science.nasa.gov/photojournal/encircling-a-giant/ | "NASA/JPL-Caltech/Space Science Institute" | added 11/17/2011; Cassini ISS NAC | https://assets.science.nasa.gov/content/dam/science/psd/photojournal/pia/pia14/pia14903/PIA14903.jpg |
| PIA20362 "Pluto's Haze in Bands of Blue" | https://science.nasa.gov/photojournal/plutos-haze-in-bands-of-blue/ | "NASA/Johns Hopkins University Applied Physics Laboratory/Southwest Research Institute" | added 01/14/2016; New Horizons LORRI + MVIC | https://assets.science.nasa.gov/content/dam/science/psd/photojournal/pia/pia20/pia20362/PIA20362.jpg |
| PIA23436 "A Storm of Change" (Great Red Spot) | https://science.nasa.gov/photojournal/a-storm-of-change/ | "Enhanced image by Björn Jónsson (CC-NC-SA) based on images provided courtesy of NASA/JPL-Caltech/SwRI/MSSS" | added 09/12/2019; Juno JunoCam | https://assets.science.nasa.gov/content/dam/science/psd/photojournal/pia/pia23/pia23436/PIA23436.jpg — **licence CC BY-NC-SA (citizen-processed), not public domain; check before use** |

## NOT FOUND / gaps
- Mercury: numeric sodium-tail variation (factor 10–20) not verified on a fetched page.
- Venus: NASA prints 467 °C / 93× pressure (brief's 465 °C / 92 bar not found in NASA text).
- Mars: explicit "fraction of atmosphere that freezes out" (only ~30 % seasonal pressure swing from Curiosity found; 12–16 % figure only on arXiv).
- Jupiter & Neptune internal heat (emitted vs absorbed energy) — no quote fetched.
- Saturn hexagon rotation period — not found.
- Uranus Keck observations — not searched/fetched; only Hubble OPAL 2018.
- Neptune "600 m/s" — NASA prints ">1,200 mph (2,000 km/h)".
- Titan surface pressure/density — not found on fetched pages.
- Pluto Earth-based occultation pressure history — only arXiv (not used).
- Io SO₂ atmosphere eclipse collapse — only arXiv (not used).
- Author bios — none verified.
- NASA page errors flagged: Uranus "Great Dark Spot" 1986 sentence; Io "three spacecraft" list of four; Enceladus 800 mph ≠ 400 m/s; Juno 200 mi ≠ 300 km.
