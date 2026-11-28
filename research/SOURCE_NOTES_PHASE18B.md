# SOURCE NOTES — Phase 18B: Spacecraft fact sheet and the instrument signal chain

Research date: 2026-11-28. Researcher: source-research subagent.
Raw downloads (HTML plus extracted text) are in `/tmp/vv-research/p18b/`, and robots files are in `/tmp/vv-research/p18b/robots/`.
User-Agent: `VoyagerVentures-Research/0.1 (educational; respects robots.txt)`. Requests to each host were at least 1.2 s apart.
All quotes are verbatim from the page text as served on 2026-11-28. "Updated" means the page's `article:modified_time` / `og:updated_time` / `dateModified` metadata, unless stated otherwise.
No PDFs were read. No off-limits host was fetched.

## 0. robots.txt and terms log

| Host | robots.txt result (2026-11-28) | Used? |
|---|---|---|
| science.nasa.gov | 200. `User-agent: * / Allow: /` (usasearch Crawl-delay 1) | Yes (main source) |
| www.nasa.gov | 200. `User-agent: * / Allow: /` | Yes (ISS, DSN, media guidelines) |
| www.jpl.nasa.gov | 200. Disallows only `/_redirects.json`, `/edu-legacy*`, `/edubeta*`, `/go/wildfire-recovery*`, `/*?*` | Not needed |
| voyager.jpl.nasa.gov | robots.txt returns a 302 to `webhosting-external.jpl.nasa.gov/missing.html` (403). The site appears retired; Voyager content now lives on science.nasa.gov/mission/voyager | **Not used** (no robots file; site gone) |
| landsat.gsfc.nasa.gov | 301 redirect to science.nasa.gov (the robots request lands on the Landsat page). Treated as science.nasa.gov | Via science.nasa.gov |
| hubblesite.org | 301 redirect to science.nasa.gov/mission/hubble | Via science.nasa.gov |
| www.usgs.gov | 200. `User-agent: *`, disallows only /core/, /profiles/, /admin/, /search/, /user/* and similar. Content pages allowed | Yes (Landsat 9) |
| www.gps.gov | 200. `User-agent: *`, disallows only /core/, /profiles/, /admin/, /search/ and similar | Yes (space segment) |
| www.earthdata.nasa.gov (earthdata.nasa.gov 302s here) | 200. Disallows /core/, /profiles/, /admin/, /search/, /node/, /taxonomy/, /media/ … `/learn/` allowed | Yes |
| jwst-docs.stsci.edu | 404 (no robots.txt, so nothing is disallowed) | Fetched one page; the body is JS-rendered and no usable facts came back |
| pluto.jhuapl.edu | 200. **`User-agent: * / Disallow: /`** | **Not used (disallowed)** |
| eyes.nasa.gov | 301 (not followed further) | Not used |

Terms: none of the pages fetched had a bot wall, CAPTCHA or Cloudflare challenge, and none showed a notice forbidding AI or automated use. The NASA licence statement is in §0.1.

### 0.1 Licence: NASA Images and Media Usage Guidelines
- Citation: "NASA Images and Media Usage Guidelines", NASA Brand Center, www.nasa.gov. URL: https://www.nasa.gov/nasa-brand-center/images-and-media/
- Quote: "NASA content – images, audio, video, and media files used in the rendition of 3-dimensional models, such as texture maps and polygon data in any format – generally are not subject to copyright in the United States. You may use this material for educational or informational purposes, including photo collections, textbooks, public exhibits, computer graphical simulations and Internet Web pages."
- Quote: "NASA content used in a factual manner that does not imply endorsement may be used without needing explicit permission. NASA should be acknowledged as the source of the material. NASA occasionally uses copyright-protected material of third parties with permission on its website. Those images will be marked identified as copyright protected with the name of the copyright holder."
- Caveat quote: "The NASA Insignia, Logotype, identifiers, and imagery are not in the public domain. The use of the Insignia, Logotype and NASA identifiers is protected by law, and imagery is made available for use consistent with Media Usage Guidelines."
- Text licence for the science.nasa.gov and nasa.gov pages: US Government work. NASA text is generally not subject to US copyright; cite NASA as the source.
- USGS (usgs.gov) and GPS.gov are also US Government works and are generally public domain.

---

## A. SPACECRAFT

### A1. Voyager 1
- **Citation:** "Voyager 1", NASA Science (science.nasa.gov), NASA / JPL. Updated 2026-11-24. URL: https://science.nasa.gov/mission/voyager/voyager-1/. Licence: US Gov / NASA. Bio: no author named (bio: not verified).
- Launch: "Launch Date and Time — Sept. 5, 1977 / 12:56:01 UT". Launch vehicle: "Titan IIIE-Centaur (TC-6 / Titan no. 23E-6 / Centaur D-1T)". Site: "Cape Canaveral, Florida / Launch Complex 41"
- Mass: "Spacecraft Mass — 1,592 pounds (721.9 kilograms)"
- Power: "3 Multi-Hundred Watt Radioisotope Thermoelectric Generators (MHW-RTGs) stacked in a series on a boom, producing about 158 We each, at launch."
- Trajectory / key dates: "March 5, 1979: Jupiter flyby - closest approach"; "Nov. 12, 1980: Saturn flyby - closest approach"; "Feb.17, 1998: Became the most distant human-made object after overtaking NASA's Pioneer 10"; "August 2012: Voyager 1 enters interstellar space". Also: "On Aug. 25, 2012, the spacecraft became the first to exit the heliosphere and begin measuring the interstellar environment."
- Distance (dated):
  - "As of Aug. 21, 2024, Voyager 1 was 164.7 AU from Earth — the farthest object created by humans — moving at a velocity of 38,026.79 mph (17.0 km/second) relative to the Sun."
  - "The milestone Voyager 1 reached on Wednesday, Nov. 18, is about distance, not time. And it's very, very far — more than 16 billion miles, during a journey that's taken 49+ years" (this is 2026-11-18, one light-day).
  - "No spacecraft has gone farther than NASA's Voyager 1. Launched in 1977 to fly by Jupiter and Saturn, Voyager 1 crossed into interstellar space in August 2012 and continues to collect data. Now, more than 49 years into its mission, Voyager 1 has reached another unprecedented milestone — a distance one light-day away from Earth."
  - Live distance: the page embeds NASA's Eyes on the Solar System (live). Use dated values only.
- Instruments (list): "1. Imaging Science System (ISS) 2. Ultraviolet Spectrometer (UVS) 3. Infrared Interferometer Spectrometer (IRIS) 4. Planetary Radio Astronomy Experiment (PRA) 5. Photopolarimeter (PPS) 6. Triaxial Fluxgate Magnetometer (MAG) 7. Plasma Spectrometer (PLS) 8. Low-Energy Charged Particles Experiment (LECP) 9. Plasma Waves Experiment (PWS) 10. Cosmic Ray Telescope (CRS) 11. Radio Science System (RSS)"
- Status sentence on this page: "Voyager 1 continues to communicate with NASA's Deep Space Network and send data back from four still-functioning instruments — the cosmic ray telescope, the low-energy charged particles experiment, the magnetometer, and the plasma waves experiment." **This disagrees with the Voyager Spacecraft page (A3):** that page says the V1 CRS was "Off to save power (Feb. 25, 2025)" and the V1 LECP was "Off to save power (April 17, 2026)", which leaves only MAG and PWS "On". Treat the A3 status table (updated 2026-11-16) as the more specific source, and record both.
- Descriptive: "Voyager 1 was the first spacecraft to cross the heliosphere, the boundary where the influences from outside our solar system are stronger than those from our Sun."

### A2. Voyager 2
- **Citation:** "Voyager 2", NASA Science, NASA / JPL. Updated 2026-09-28. URL: https://science.nasa.gov/mission/voyager/voyager-2/. Licence: US Gov / NASA. Bio: not verified.
- Launch: "Aug. 20, 1977 / 14:29:44 UT"; "Titan IIIE-Centaur (TC-7 / Titan no. 23E-7 / Centaur D-1T)"; "Cape Canaveral, Fla. / Launch Complex 41"
- Mass: "1,592 pounds (721.9 kilograms)"
- Power: "Power was provided by three plutonium oxide radioisotope thermoelectric generators (RTGs) mounted at the end of a boom."
- Key dates: "July 9, 1979: Jupiter Flyby / Aug 25, 1981: Saturn Flyby / Jan 24, 1986: Uranus Flyby / Aug 25, 1989: Neptune Flyby / Aug 30, 2007: Crossed Termination Shock / Nov 25, 2018: Entered Interstellar Space". (The date given here for entering interstellar space is the page's own wording.)
- Instruments: the same 11 as Voyager 1.
- Descriptive: "Each of the two spacecraft was equipped with a slow-scan color TV camera to take images of the planets and their moons and each also carried an extensive suite of instruments to record magnetic, atmospheric, lunar, and other data about the planetary systems."
- Distance: **no dated distance figure on this page.** The page embeds a live 3D view ("This 3D visualization is updated with real spacecraft data every five minutes."). See Gaps.

### A3. Voyager spacecraft subsystems (both)
- **Citation:** "Voyager Spacecraft" (spacecraft and instruments page), NASA Science, NASA / JPL. Updated 2026-11-16. URL: https://science.nasa.gov/mission/voyager/spacecraft/. Licence: US Gov / NASA. Bio: not verified.
- "The identical Voyager spacecraft are three-axis stabilized systems that use celestial or gyro referenced attitude control to maintain pointing of the high-gain antennas toward Earth. The prime mission science payload consisted of 10 instruments (11 investigations including radio science)."
- Computer: "The command computer subsystem (CCS) provides sequencing and control functions The CCS contains fixed routines such as command decoding and fault detection and corrective routines, antenna pointing information, and spacecraft sequencing information." The camera "is controlled by an imaging parameter table residing in one of the spacecraft computers, the Flight Data Subsystem (FDS)."
- Comms: "Uplink communications is via S-band (16-bits/sec command rate) while an X-band transmitter provides downlink telemetry at 160 bits/sec normally and 1.4 kbps for playback of high-rate plasma wave data. All data are transmitted from and received at the spacecraft via the 3.7 meter high-gain antenna (HGA)."
- "The HGA transmits data to Earth on two frequency channels (the downlink). One, at about 8.4 gigahertz (8,400 million cycles per second), is the X-band channel and contains science and engineering data. … The X-band downlink science data rates are as high as 7.2 kilobits per second. The other channel, around 2.3 gigahertz, is in the S-band, and contains only engineering data on the health and state of the spacecraft at the low rate of 40 bits per second."
- Power: "Status: As of 2023, the twin Voyagers' RTGs are in stable operation at 225 We." and "Electrical power is supplied by three radioisotope thermoelectric generators (RTGs). As the electrical power decreases, power loads on the spacecraft must be turned off in order to avoid having demand exceed supply."
- Instrument status table (as served 2026-11-28):
  - CRS: "Voyager 1: Off to save power (Feb. 25, 2025) / Voyager 2: On"
  - MAG: "Voyager 1: On / Voyager 2: On"
  - PWS: "Voyager 1: On / Voyager 2: On"
  - LECP: "Voyager 1: Off to save power (April 17, 2026) / Voyager 2: Off to save power (March 24, 2025)"
  - PLS: "Voyager 1: Off because of degraded performance (Feb. 1, 2007) / Voyager 2: Off to save power (Sept. 26, 2024)"
- Camera: "The ISS is a modified version of the slow scan vidicon camera designs that were used in the earlier Mariner flights. The ISS consists of two television-type cameras, each with 8 filters in a commandable Filter Wheel mounted in front of the vidicons."
- **Diagram (real image):** "Voyager diagram", credit "NASA/JPL-Caltech". Image URL: https://science.nasa.gov/wp-content/uploads/2024/03/instruments-3.jpg (640 px). Licence: NASA media guidelines (§0.1).

### A4. Pioneer 10
- **Citation:** "Pioneer 10", NASA Science, NASA / Ames. Updated 2024-11-06. URL: https://science.nasa.gov/mission/pioneer-10/. Bio: not verified.
- Launch: "March 2, 1972 / 01:49:04 UT"; "Atlas Centaur (AC-27 / Atlas 3C no. 5007C / Centaur D-1A)"; "Cape Canaveral, Florida / Launch Complex 36A"
- Mass: "569 pounds (258 kilograms)"
- Power: "…the first to use all-nuclear electrical power (two SNAP-19 radioisotope thermal generators [RTGs] capable of delivering about 140 W during the Jupiter encounter)."
- Trajectory: "Dec. 4, 1973: Pioneer 10's closest approach to Jupiter"; "June 13, 1983: Pioneer 10 crossed the orbit of Neptune"
- Status: "Pioneer 10 sent its last signal to Earth in January 2003 from a distance of 7.6 billion miles (12.23 billion kilometers)." and "A final attempt to contact Pioneer 10 on March 4, 2006, failed."
- Instruments include "Helium Vector Magnetometer (HVM)", "Charged Particle Instrument (CPI)", "Cosmic Ray Telescope (CRT)", "Geiger Tube Telescope (GTT)", "Imaging Photopolarimeter". (The page spells one item "Infrared Adiometer"; the Pioneer 11 page gives "Infrared Radiometer".)
- Descriptive: "First spacecraft placed on a trajectory to escape the solar system into interstellar space"

### A5. Pioneer 11
- **Citation:** "Pioneer 11", NASA Science, NASA / Ames. Updated 2025-05-14. URL: https://science.nasa.gov/mission/pioneer-11/. Bio: not verified.
- Launch: "April 6, 1973 / 02:11 UT"; "Atlas Centaur (AC-30 / Atlas 3D no. 5011D / Centaur D-1A)"; "Launch Complex 36B"
- Mass: "570 pounds (258.5 kilograms)"
- Power: the page says only that RTGs were carried ("…the momentary failure of one of the RTG booms to deploy…"). **No wattage on this page.**
- Trajectory: "Dec. 3, 1974: Jupiter flyby / Sept. 1, 1979: Saturn flyby / Feb. 23, 1990: Crossed the orbit of Neptune"
- Status: "NASA Ames Research Center made last contact with the spacecraft on Sept. 30, 1995, when Pioneer 11 was 44.1 AU from Earth."
- Descriptive: "NASA's Pioneer 11, a sister spacecraft to Pioneer 10, was the first spacecraft to study Saturn up close. The mission ended in 1995 and Pioneer 11 is on a trajectory to take it out of the solar system."

### A6. Cassini
- **Citations:**
  - (a) "Cassini" mission page, NASA Science. Updated 2026-09-17. URL: https://science.nasa.gov/mission/cassini/
  - (b) "Cassini Orbiter", NASA Science. Updated 2024-11-22. URL: https://science.nasa.gov/mission/cassini/spacecraft/cassini-orbiter/
  - (c) "Cassini Quick Facts", NASA Science. Updated 2025-04-03. URL: https://science.nasa.gov/mission/cassini/cassini-quick-facts/
  - (d) "About the Mission", NASA Science. Updated 2025-05-14. URL: https://science.nasa.gov/mission/cassini/about-the-mission/
  - Bio: not verified.
- Launch: "Launch — Oct. 15, 1997"; "grand finale — Sept. 15, 2017" (a)
- Power: "Three radioisotope thermoelectric generators – commonly referred to as RTGs – provided power for the spacecraft, including the instruments, computers, and radio transmitters on board, attitude thrusters, and reaction wheels." (b) **No wattage or mass found on these pages.**
- Orbit: "It became the first spacecraft to orbit Saturn, beginning a mission that yielded troves of new insights over more than a decade." (a)
- End: "On Sept. 15, 2017, the spacecraft made its final approach to the giant planet. This time, Cassini dived into the planet's atmosphere, sending science data for as long as its small thrusters could keep the spacecraft's antenna pointed at Earth." (d)
- Subsystems: "Cassini-Huygens was a three-axis stabilized spacecraft equipped for 27 diverse science investigations. The Cassini orbiter had 12 instruments and the Huygens probe had six. … The spacecraft communicated through one high-gain and two-low gain antennas." (b)
- Instrument groups: "The remote sensing instruments on the Cassini Spacecraft calculated measurements from a great distance. This set included both optical and microwave sensing instruments including cameras, spectrometers, radar and radio." and "The fields and particles instruments took "in situ" (on site) direct sensing measurements of the environment around the spacecraft. These instruments measured magnetic fields, mass, electrical charges and densities of atomic particles." (b)
- Numbers (c): "4.9 billion miles traveled since launch (7.9 billion kilometers)"; "635 GB science data collected"; "294 orbits completed"; "453,048 images taken"; "162 targeted flybys of Saturn's moons"; "27 nations participated".
- Image: Cassini Orbiter og:image https://assets.science.nasa.gov/content/dam/science/psd/solar/2023/07/69_IMG001942_768.jpg (alt "Cassini Orbiter"). The credit was not confirmed on the page; check the asset page before use.

### A7. New Horizons
- **Citation:** "New Horizons", NASA Science; mission design and management by NASA / Johns Hopkins APL. Updated 2026-05-11. URL: https://science.nasa.gov/mission/new-horizons/. Bio: not verified. (pluto.jhuapl.edu is disallowed by robots and was not used.)
- Launch: "Jan. 19, 2006 / 19:00:00 UT"; "Atlas V 551 (AV-010)"; "Cape Canaveral, Fla. / Launch Complex 41"
- Mass: "1,054 pounds (478 kilograms)"
- Power: "…New Horizons carries a cylindrical radioisotope thermoelectric generator (a spare from the Cassini mission) that provided about 250 watts of power at launch (decaying to 200 watts by the time of the Pluto encounter)."
- Trajectory: "Feb. 28, 2007: Jupiter Gravity Assist / July 14, 2015: Pluto Flyby / Jan. 1, 2019: Arrokoth Flyby"; "A second firing of the Star 48B solid rocket accelerated the spacecraft to a velocity of about 36,400 miles per hour (58,536 kilometers per hour), the highest launch velocity attained by a human-made object relative to Earth."
- Distance (dated): "Oct. 1, 2024: New Horizons passed 60 times as far from the Sun as Earth is, meaning the spacecraft is twice as far out as Pluto was when New Horizons flew by on July 14, 2015." Also: "…speeding away from the Earth and Sun at a rate of about 300 million miles per year."
- Instruments: "Ralph-Visible and Infrared Imager/Spectrometer", "Alice-Ultraviolet Imaging Spectrometer", "Radio-Science Experiment (REX)", "Long-Range Reconnaissance Imager (LORRI)", "Solar Wind and Plasma Spectrometer (SWAP)", "Pluto Energetic Particle Spectrometer Science Investigation (PEPSSI)", "Student Dust Counter (SDC)"
- Data-return example (useful for the signal chain): "The download of the entire set of data collected during the encounter with Pluto and Charon – about 6.25 gigabytes – took over 15 months and was officially completed at 21:48 UT on Oct. 25, 2016. Such a lengthy period was necessary because the spacecraft was roughly 4.5 light-hours from Earth and it could only transmit 1-2 kilobits per second."
- Descriptive: "NASA's New Horizons spacecraft was the first spacecraft to explore Pluto up close, flying by the dwarf planet and its moons on July 14, 2015."
- Image: og:image https://science.nasa.gov/wp-content/uploads/2017/12/new-horizons-4q-poster-v4.png (an artist's concept, not a photo; label it as such). The credit was not confirmed on the page.

### A8. International Space Station
- **Citations:**
  - (a) "Space Station Facts and Figures", NASA (www.nasa.gov). Updated 2024-07-16. URL: https://www.nasa.gov/international-space-station/space-station-facts-and-figures/
  - (b) "International Space Station" (hub page), NASA. Updated 2026-10-20. URL: https://www.nasa.gov/international-space-station/
  - Bio: not verified.
- Launch: "Launched in 1998 and involving the U.S., Russia, Canada, Japan, and the participating countries of the European Space Agency — the International Space Station is one of the most complex international collaborations ever attempted." (b) The first element is named in an image caption: "…the 20th anniversary of the launch of the first element Zarya in November 2018." (b)
- Mass: "Mass: 925,335 pounds (419,725 kilograms)" (a)
- Power: "Power Generation: 8 solar arrays provide 75 to 90 kilowatts of power" (a)
- Size: "Pressurized Module Length: 218 feet along the major axis (67 meters)"; "Truss Length: 310 feet (94 meters)"; "Habitable Volume: 13,696 cubic feet (388 cubic meters) not including visiting vehicles" (a)
- Orbit: "An international crew of seven people live and work while traveling at a speed of five miles per second, orbiting Earth about every 90 minutes." and "In 24 hours, the space station makes 16 orbits of Earth, traveling through 16 sunrises and sunsets." (a) **Neither page gives an altitude.**
- Status: "The space station has been continuously occupied since November 2000." (a)
- Subsystems (a): "More than 50 computers control the systems on the space station."; "On-orbit software monitors approximately 350,000 sensors, ensuring station and crew health and safety."; "In the International Space Station's U.S. segment alone, more than 1.5 million lines of flight software code run on 44 computers communicating via 100 data networks transferring 400,000 signals (e.g. pressure or temperature measurements, valve positions, etc.)."; "The 55-foot robotic Canadarm2 has seven different joints and two end-effectors, or hands…"
- Image: https://www.nasa.gov/wp-content/uploads/2023/02/International-Space-Station-in-2021.jpg. The alt text says it is a mosaic "pictured from the SpaceX Crew Dragon Endeavour during a fly around … on Nov. 8, 2021." This is a real photo; credit NASA (the exact credit line was not confirmed).

### A9. Hubble Space Telescope
- **Citations:**
  - (a) "About Hubble" (redirect target of /mission/hubble/overview/), NASA Science. Updated 2026-09-11. URL: https://science.nasa.gov/mission/hubble/overview/about-hubble/
  - (b) "Hubble by the Numbers", NASA Science. Updated 2026-11-16 ("These statistics reflect data as of 3/1/2024 unless otherwise indicated."). URL: https://science.nasa.gov/mission/hubble/overview/hubble-by-the-numbers/
  - (c) "Hubble Mission Operations", NASA Science. Updated 2026-06-18. URL: https://science.nasa.gov/mission/hubble/observatory/mission-operations/
  - Bio: not verified.
- Launch: "…since its launch and deployment by the space shuttle Discovery in 1990." (a) **The exact day is not on these pages.**
- Mass: "Weight (at launch) about 24,000 pounds (10,800 kg)"; "Weight (post-SM4) about 27,000 pounds (12,200 kg)" (a)
- Orbit: "Low-Earth Orbit altitude of about 300 miles (261 nautical miles, or 483 km), inclined 28.5 degrees to the equator"; "Time to Complete One Orbit about 95 minutes"; "Speed about 17,000 mph (27,000 kph)" (a)
  - **DISAGREEMENT:** the Webb fact sheet (A10, updated 2026-11-20) says "(Hubble orbits 560 kilometers above the Earth.)" The Hubble page (a, updated 2026-09-11) says about 483 km. Record both.
- Power: "two 8 x 24.75-foot (2.44 x 7.54-meter) gallium-arsenide solar panels"; "Power Generation (in sunlight) about 5,500 watts"; "six nickel-hydrogen (NiH)" batteries (a).
  - **DISAGREEMENT:** (b) gives "Power generated by Hubble solar arrays > 5,200 watts" and "Power typically used by the spacecraft components ~ 2,100 watts" (data as of 3/1/2024).
- Optics: "Primary Mirror Diameter 94.5 inches (2.4 m)"; "Sensitivity to Light ultraviolet through infrared (115–2500 nanometers)" (a)
- Instruments (a): "Wide Field Camera 3 is the main imager on the telescope. It has a camera that records visible and ultraviolet (UV) wavelengths of light and is 35 times more sensitive in the UV wavelengths than its predecessor…"; "COS focuses exclusively on ultraviolet (UV) light and is the most sensitive ultraviolet spectrograph ever…"; "STIS is a second-generation imager/spectrograph."; "ACS is a third-generation imaging camera."; "The FGS provides pointing information for the spacecraft by locking onto guide stars."
- Detector (b): "The Advanced Camera for Surveys contains a 16-megapixel detector (charged couple device) that provides high-resolution images in ultraviolet and visible light." (The page's own wording is "charged couple"; quote it verbatim.)
- Data (b): "Rate at which science data is transmitted to the ground 1 megabit per second"; "Average amount of science data captured weekly 150 gigabits"; "Rate at which commands are sent to Hubble 32 kilobits per second"; "Amount of data that can be stored on the spacecraft 24 gigabits (or about 3 gigabytes)"
- Descriptive: "Orbiting 300 miles (483 km) above Earth's surface, Hubble avoids the distorting effects of our atmosphere, enabling its clear vision of the cosmos." (a)
- Image: https://science.nasa.gov/wp-content/uploads/2023/04/hubble_cargo_bay-jpg.webp. Alt text: "The space shuttle Atlantis' robotic arm lifts Hubble, with Earth visible in the background." This is a real photo; credit NASA (the exact credit line was not confirmed).

### A10. James Webb Space Telescope
- **Citations:**
  - (a) "Webb Fact Sheet" / Key Facts, NASA Science. Updated 2026-11-20. URL: https://science.nasa.gov/mission/webb/fact-sheet/
  - (b) "Webb" mission page. Updated 2026-11-23. URL: https://science.nasa.gov/mission/webb/
  - (c) "Spacecraft Bus", NASA Science. Updated 2026-03-17. URL: https://science.nasa.gov/mission/webb/spacecraft-bus/
  - Bio: not verified.
- Launch: "Launch Date December 25, 2021 07:20am EST (2021-12-25 12:20 GMT/UTC)"; "Launch Vehicle Ariane 5 ECA"; "Mission Duration 5 - 10 years" (a)
- Mass: "Total Payload Mass Approx 6200 kg, including observatory, on-orbit consumables and launch vehicle adaptor." (a)
- Orbit: "1.5 million km from Earth orbiting the L2 Point" (a); "It does not orbit around the Earth like the Hubble Space Telescope, it orbits the Sun 1.5 million kilometers (1 million miles) away from the Earth at what is called the second Lagrange point or L2." (b)
- Optics: "Diameter of Primary Mirror 6.5 m (21.3 ft) approximately"; "Number of Primary Mirror Segments 18"; "Primary Mirror Material beryllium coated with gold"; "Wavelength Coverage 0.6 - 28.5 microns"; "Operating Temperature under 50 K (-370 °F)"; "Size of Sun Shield 21.197 m x 14.162 m (69.5 ft x 46.5 ft)" (a)
- Power: (c) "The Electrical Power Subsystem converts sunlight shining on the solar array panels into the power needed to operate the other subsystems in the bus as well as the Science Instrument Payload." **No wattage found.** (The JDox page body did not render server-side.)
- Instruments (a): "Near Infrared Camera (NIRCam)", "Near Infrared Spectrograph (NIRSpec)", "Mid Infrared Instrument (MIRI)", "FGS/NIRISS". Cryocooler: "Webb's MIRI instrument carries detectors that need to be at a temperature of less than 7 kelvin to operate properly."
- Data handling (c, for the signal chain): "The Command and Data Handling (C&DH) System is the brain of the spacecraft bus. The system has a computer, the Command Telemetry Processor (CTP) that takes in the commands from the Communications System and directs them to the appropriate recipient. The C&DH also has the memory/data storage device for the Observatory, the Solid State Recorder (SSR). The CTP controls the interaction between the Science Instruments, the SSR and the Communications System". Also: "The Communication Subsystem is the ears and mouth for the Observatory. The system receives instructions (commands) from the Operations Control Center and sends (transmits) the science and status data to the OCC."
- Analog-to-digital step (a): "Cryogenic Data Acquisition ASIC: "A-to-D" conversion is nothing new, but the technical challenge that Webb faced was doing it at the observatory's super-cold cryogenic operating temperatures in an Application-Specific Integrated Circuit (ASIC)."
- Descriptive: "Webb is the largest and most powerful observatory ever sent to space, serving thousands of astronomers worldwide." (b)
- Image: https://science.nasa.gov/wp-content/uploads/2024/05/jwst_artist_concept_0.png. The alt text says "Illustration of NASA's James Webb Space Telescope", so it is an illustration and must be labelled as one.

### A11. Mars rover: Perseverance (Mars 2020)
- **Citations:**
  - (a) "Mars 2020: Perseverance Rover", NASA Science. Updated 2026-10-14. URL: https://science.nasa.gov/mission/mars-2020-perseverance/
  - (b) "Rover Components", NASA Science. Updated 2025-07-22. URL: https://science.nasa.gov/mission/mars-2020-perseverance/rover-components/
  - (c) "Perseverance Science Instruments", NASA Science. Updated 2026-10-27. URL: https://science.nasa.gov/mission/mars-2020-perseverance/science-instruments/
  - Bio: not verified.
- Launch / landing: "Launch / Landing July 30, 2020 / Feb. 18, 2021" (a)
- Mass: "Weight/mass 2,260 pounds / 1,025 kilograms" (b)
- Power (b): "The power source, called a Multi-Mission Radioisotope Thermoelectric Generator (MMRTG), has a 14-year operational lifetime. The MMRTG converts heat from the natural radioactive decay of plutonium into electricity to charge the rover's two primary batteries…"; "About 110 watts at launch, declining a few percent per year"; "Uses 10.6 pounds (4.8 kilograms) of plutonium dioxide as the source of the steady supply of heat"
- Location / status (a): "Since it landed on the Red Planet in 2021 to search for signs of ancient life, NASA's Perseverance Mars rover has driven farther, faster than any vehicle ever has on the surface of another world. On Oct. 11, its odometer reached 28.10 miles (45.22 kilometers), rolling past the record of 28.06 miles (45.16 kilometers) by NASA's Opportunity rover (2004-2018)." (The Oct. 11 is 2026, the page's current year.) Also: "Jezero Crater is 28 miles (45 kilometers) wide…"
- Computer (b): "Radiation-hardened central processor with PowerPC 750 Architecture: a BAE RAD 750"; "Operates at up to 200 megahertz speed…"; "The RCEs directly interface with the rover instruments for command and science data exchange."
- Communications (b, signal chain): "Ultra-High Frequency (UHF) band (about 400 megahertz)"; "Up to 2 megabits per second on the rover-to-orbiter relay link."; X-band high-gain antenna: "Transmitting data directly to and from Earth"; "X band (7 to 8 gigahertz)"; "160/500 bits per second or faster to/from the Deep Space Network's 112-foot-diameter (34-meter-diameter) antennas or at 800/3000 bits per second or faster to/from the Deep Space Network's 230-foot-diameter (70 meter-diameter)"
- Instruments (c): "The SuperCam on the Perseverance rover examines rocks and soils with a camera, laser, and spectrometers to seek chemical materials that could be related to past life on Mars."; "PIXL has a tool called an X-ray spectrometer. It identifies chemical elements at a tiny scale."; "RIMFAX uses radar waves to probe the ground under the rover."; "Mastcam-Z has cameras that can zoom in, focus, and take 3D pictures and video at high speed…"; MEDA "makes weather measurements including wind speed and direction, temperature and humidity…". Mastcam-Z data volume: "Approximately 148 megabits per sol, average".
- Laser-spectroscopy mechanism (b): "When SuperCam fires a laser at a rock, a small amount of the rock vaporizes into a hot gas called "plasma", and heat and vibration creates a shockwave that makes a popping sound. SuperCam's camera and spectrometer can "read" the hot gas to reveal the chemical makeup of the vaporized rock."
- Image: the Rover Components og:image is an animated GIF built from PIA24489 (a real navcam image): https://assets.science.nasa.gov/content/dam/science/psd/mars/internal_resources/details/original/1004_PIA24489-1-ncamFLWheel-800px.gif. Credit is likely NASA/JPL-Caltech, but that was not confirmed on the page.

### A12. GPS satellite (space segment)
- **Citation:** "Space Segment", GPS.gov (National Coordination Office for Space-Based PNT). No modified-date metadata; the page itself says "As of July 3, 2023". URL: https://www.gps.gov/space-segment (already a project source). Licence: US Gov. Bio: not verified.
- Orbit: "GPS satellites fly in medium Earth orbit (MEO) at an altitude of approximately 20,200 km (12,550 miles). Each satellite circles the Earth twice a day."
- Constellation: "The United States is committed to maintaining the availability of at least 24 operational GPS satellites, 95% of the time."; "The satellites in the GPS constellation are arranged into six equally-spaced orbital planes surrounding the Earth. Each plane contains four "slots" occupied by baseline satellites."; "As of July 3, 2023, there were a total of 31 operational satellites in the GPS constellation, not including the decommissioned, on-orbit spares."
- Generations (table): "Block IIF (12 operational) … 3rd civil signal on L5 frequency (L5) / Advanced atomic clocks … 12-year design lifespan / Launched in 2010-2016"; "GPS III/IIIF (6 operational) … 4th civil signal on L1 (L1C) … 15-year design lifespan … First launch in 2018"; "Block IIR (6 operational) … 7.5-year design lifespan / Launched in 1997-2004"
- Descriptive: "The GPS space segment consists of a constellation of satellites transmitting radio signals to users."
- **No individual-satellite mass or power figure on this page.**
- Note: https://www.gps.gov/gps-space is a different page, about GPS *applications in space*, not the space segment.

### A13. Earth-observation satellite: Landsat 9
- **Citations:**
  - (a) "Landsat 9", USGS Landsat Missions. No modified-date metadata. URL: https://www.usgs.gov/landsat-missions/landsat-9. Licence: USGS / US Gov public domain.
  - (b) "Landsat 9", NASA Science (landsat.gsfc.nasa.gov/satellites/landsat-9/ redirects here). Updated 2026-09-17. URL: https://science.nasa.gov/mission/landsat-9/
  - Bio: not verified.
- Launch: "Landsat 9 was launched on September 27, 2021 at 1:12PM CST from Vanden­berg Space Force Base in California onboard a United Launch Alliance Atlas V 401 rocket." (a). The page contains soft hyphens in "Vanden­berg"; strip them when quoting.
- Orbit (a): "Orbits the Earth in a sun-synchronous, near-polar orbit (98.2 degrees inclination)"; "Achieved an altitude of 705 km (438 mi)"; "Completes one Earth orbit every 99 minutes"; "Has a 16-day repeat cycle with an equatorial crossing time of 10:12 a.m. +/- 5 minutes"; "Spacecraft Speed: 16,760 miles/hr (26,972 km/hr)"
- Instruments (a): "The satellite carries two science instruments, the Operational Land Imager (OLI) and the Thermal Infrared Sensor (TIRS). The OLI captures observations of the Earth's surface in visible, near-infrared, and shortwave-infrared bands, and TIRS measures thermal infrared radiation, or heat, emitted from the Earth's surface."
- Digitisation detail (a, useful for "signal to data"): "Landsat 9 improvements include higher radiometric resolution for OLI (14-bit quantization increased from 12-bits for Landsat 8) allowing sensors to detect more subtle differences… With the higher radiometric resolution, Landsat 9 can differentiate 16,384 shades of a given wavelength."
- Spatial resolution (a): OLI "…maximum ground sampling distance (GSD)… of 30-meters(m) (98 feet) for all bands except the panchromatic band, which has a 15-meter (49 feet) GSD." TIRS: "…100 m (328 ft) for both bands."
- Ground segment / archive (a): "After the satellite reached orbit, an official checkout turned responsibility to the USGS, to manage the ground system, flight operations, data processing, data product archive and distribution."
- Scenes per day, **DISAGREEMENT:** (a) "Landsat 9 collects as many as 750 scenes per day…" versus (b) "Landsat 9 collects 740 scenes each day—almost double the minimum daily requirement." Record both.
- Design life (b): "The spacecraft carries enough fuel to extend its design life and operate for at least 10 years."
- **No mass or power figure on either page.**
- Image: the NASA page og:image is an animated flyover GIF, https://assets.science.nasa.gov/content/dam/science/missions/landsat/landsat-9-mission-page/Landsat-9-Flyover-Gif.gif. It is likely a rendering, so label it as an illustration.

---

## B. INSTRUMENTS AND THE SIGNAL CHAIN

### Key sources
- **BSF-12:** "Basics of Space Flight, Chapter 12: Science Instruments", NASA Science (originally JPL). Updated 2024-11-04. URL: https://science.nasa.gov/learn/basics-of-space-flight/chapter12-1/
- **BSF-10:** "Chapter 10: Telecommunications". Updated 2024-11-04. URL: https://science.nasa.gov/learn/basics-of-space-flight/chapter10-1/
- **BSF-11:** "Chapter 11: Onboard Systems". Updated 2025-01-16. URL: https://science.nasa.gov/learn/basics-of-space-flight/chapter11-1/
- **BSF-18:** "Chapter 18: Deep Space Network". Updated 2025-01-16. URL: https://science.nasa.gov/learn/basics-of-space-flight/chapter18-1/
- **Author:** Dave Doody. Bio, *verified on the official NASA editorial page* (https://science.nasa.gov/learn/basics-of-space-flight/editorial/, updated 2025-01-31): "This document was first prepared in 1993 by Dave Doody and George Stephan of JPL's Mission Operations Section… The 21st Century Edition was written by Dave Doody with Diane Fisher's editorial and technical expertise. Dave is the author of the 2017 Edition." The same page says "Dave is currently the Realtime Flight Operations Lead engineer for the Cassini/Huygens Mission." That sentence is dated wording (Cassini ended in 2017), so use the past tense. The page also says "The latest update was made in March 2022."
- robots: science.nasa.gov allows all (§0). The Basics of Space Flight is fully accessible.
- **ED-active:** "Active Instruments", NASA Earthdata. dateModified 2025-12-18. URL: https://www.earthdata.nasa.gov/learn/earth-observation-data-basics/remote-sensing/active-instruments
- **ED-passive:** "Passive Instruments", NASA Earthdata. dateModified 2025-12-18. URL: https://www.earthdata.nasa.gov/learn/earth-observation-data-basics/remote-sensing/passive-instruments
- **ED-proc:** "Data Processing, Interpretation, and Analysis", NASA Earthdata. dateModified 2025-12-21. URL: https://www.earthdata.nasa.gov/learn/earth-observation-data-basics/data-processing-interpretation-analysis
- **EMS-radio:** "Radio Waves", NASA Science Tour of the Electromagnetic Spectrum (project source nasa-tour-ems). Updated 2023-08-03. URL: https://science.nasa.gov/ems/05_radiowaves/
- **NASA-DSN:** "Deep Space Network", NASA (SCaN). Updated 2026-10-15. URL: https://www.nasa.gov/communicating-with-missions/dsn/

### B1. One verbatim "how it works" sentence per instrument type
| Instrument | Quote | Source |
|---|---|---|
| Spectrometer | "Spectroscopic instruments are optical remote-sensing instruments that split the light received from their targets into component wavelengths for measuring and analyzing." Also: "Spectrometers and spectrographs use electronic detectors, such as CCDs, and return data representing the intensity of various parts of the spectrum observed. Instruments on spacecraft typically employ a diffraction grating to disperse the incoming light signal…" | BSF-12 |
| Spectrometer (alt.) | "A device that is designed to detect, measure, and analyze the spectral content of incident electromagnetic radiation. Conventional imaging spectrometers use gratings or prisms to disperse the radiation for spectral discrimination." | ED-passive |
| Imaging / mapping spectrometer | "Cassini's Visible and Infrared Mapping Spectrometer, VIMS, produce images whose every pixel contains spectral data at many different wavelengths. It is as though the instrument returns a whole stack of images with each observation, one image at each wavelength. Such data units are frequently called "cubes."" | BSF-12 |
| Mass spectrometer | "Mass Spectrometers, for example the Cassini Spacecraft's INMS, Ion and Neutral Mass Spectrometer, report the species of atoms or molecules that enter the instrument." | BSF-12 |
| Magnetometer | "Magnetometers are direct-sensing instruments that detect and measure the interplanetary and solar magnetic fields in the vicinity of the spacecraft." and "As a magnetometer sweeps an arc through a magnetic field when the spacecraft rotates, an electrical signature is produced proportional to the strength and structure of the field." Voyager: "The Voyager Magnetometer Experiment (MAG) consists of two low-field magnetometers and two high-field magnetometers that together provide measurement of fields from 0.02 nano-Tesla (nT) to 2,000,000 nT." and "…the instruments populate a 13-meter-long fiberglass boom to keep them away from on-board interference." | BSF-12 |
| CCD sensor | "Light falling on a well is absorbed by a photoconductive substrate such as silicon and releases a quantity of electrons proportional to the intensity of light. The CCD detects and stores accumulated electrical charge representing the light level on each well over time. These charges are read out for conversion to digital data." Also: "It is typical for CCDs to be able to detect single photons." | BSF-12 |
| Imager (general) | "An imaging instrument uses optics such as lenses or mirrors to project an image onto a detector, where it is converted to digital data. Natural color imaging requires taking three exposures of the same target in quick succession through different color filters…" | BSF-12 |
| Line-scan (pushbroom) CCD | "The HIRISE instrument… has detectors made of single lines of CCD sensors. A two-dimensional image is built up as the image of the Martian surface moves across this one-dimensional detector while the spacecraft moves in orbit, much as a page moves across the detector in a fax machine." | BSF-12 |
| CMOS sensor | **NOT FOUND** on the pages fetched (see Gaps). | — |
| Analog-to-digital conversion | Webb: "Cryogenic Data Acquisition ASIC: "A-to-D" conversion is nothing new, but the technical challenge that Webb faced was doing it at the observatory's super-cold cryogenic operating temperatures…". Landsat 9: "14-bit quantization … can differentiate 16,384 shades of a given wavelength." | A10(a), A13(a) |
| Detector cooling | "CCD detectors in imagers and some spectrometry instruments perform best when they are cool. In infrared instruments, cooling essential for maintaining a signal-to-noise ratio that permits useful observations." (The source sentence lacks "is"; quote it verbatim.) | BSF-12 |
| Radiometer | "An instrument that quantitatively measures the intensity of electromagnetic radiation in some bands within the spectrum. A radiometer is usually further identified by the portion of the spectrum it covers; for example, visible, infrared, or microwave bands." | ED-passive |
| Infrared radiometer | "An infrared radiometer is a telescope-based instrument that measures the intensity of infrared (thermal) energy radiated by the targets." | BSF-12 |
| Radar | "A radio detection and ranging instrument that provides its own source of electromagnetic energy. An active radar instrument, whether aboard a space-based platform or aboard an aircraft, emits microwave radiation in a series of pulses from an antenna. When the energy reaches the target, some of the energy is reflected back toward the instrument. This backscattered microwave radiation is detected, measured, and timed." | ED-active |
| Radar (alt.) | "Radar generates pulses of radio waves that it sends to a surface, and then receives their reflections back from the surface, to create images or deduce characteristics of the surface." | BSF-12 |
| SAR | "SAR synthesizes the angular resolving power of an antenna many times the size of the antenna aperture actually used." | BSF-12 |
| Lidar | "A light detection and ranging instrument that uses a laser (light amplification by stimulated emission of radiation) radar to transmit a light pulse and a receiver with sensitive detectors to measure the backscattered or reflected light. Distance to the object is determined by recording the time between transmitted and backscattered pulses and by using the speed of light to calculate the distance traveled." | ED-active |
| Laser altimeter | "An instrument that uses lidar to measure the height of the platform (spacecraft or aircraft) above the surface." | ED-active |
| Active vs passive | "Active instruments emit energy and collect data based on changes in the return signal." / "Passive instruments detect energy emitted from the natural environment." (Earthdata basics index, https://www.earthdata.nasa.gov/learn/earth-observation-data-basics, dateModified 2025-11-25.) Also BSF-12: "Most instruments only receive and process existing light, particles, or other phenomena, and they are said to be passive." | Earthdata / BSF-12 |
| Particle detector (high-energy) | "High-energy particle detector instruments measure the energy spectra of trapped energetic electrons, and the energy and composition of atomic nuclei. They may employ several independent solid-state-detector telescopes." | BSF-12 |
| Particle detector (Voyager CRS) | "The CRS makes no attempt to slow or capture the super-energetic particles. They simply pass completely through the CRS. However, in passing through, the particles leave signs that they were there." | A3 |
| Particle detector (Voyager LECP) | "The Low-Energy Charged Particle experiment uses two solid-state detector systems mounted on a rotating platform." | A3 |
| Plasma detector | "Plasma detectors serve the low-end of particle energies. They measure the density, composition, temperature, velocity and three-dimensional distribution of plasmas, which are soups of positive ions and electrons…" | BSF-12 |
| Plasma wave instrument | "The instrument functions like a radio receiver sensitive to the wavelengths of plasma in the solar wind from about 10 Hz to about 60 kHz." | BSF-12 |
| Dust detector | "Dust detectors measure the number, velocity, mass, charge, and flight direction of dust particles striking the instrument." | BSF-12 |
| Radio telescope | "Radio telescopes look toward the heavens to view planets, comets, giant clouds of gas and dust, stars, and galaxies. By studying the radio waves originating from these sources, astronomers can learn about their composition, structure, and motion." and "In order to make a clearer, or higher resolution, radio image, radio astronomers often combine several smaller telescopes, or receiving dishes, into an array." VLA: "The VLA consists of 27 antennas arranged in a huge "Y" pattern up to 36 km across…" | EMS-radio |
| Planetary radio astronomy | "A planetary radio astronomy instrument measures radio signals emitted by a target such as a Jovian planet." | BSF-12 |
| X-ray spectrometer (APXS / PIXL) | "…to determine their composition by acquiring energy spectra of the backscattered alpha particles and x-rays returned from the sample." (BSF-12, APXS). PIXL: "PIXL has a tool called an X-ray spectrometer. It identifies chemical elements at a tiny scale." (A11c) | BSF-12 / A11 |

### B2. End-to-end path: detector to archive (quotes in order)
1. **Detector to digital:** "An imaging instrument uses optics such as lenses or mirrors to project an image onto a detector, where it is converted to digital data." [BSF-12] / "These charges are read out for conversion to digital data." [BSF-12]
2. **Onboard computer:** "…one computer identified as the "spacecraft central" computer… collects, processes, and formats the telemetry data to be returned to Earth… On some spacecraft, this computer is referred to as the command and data subsystem (CDS)." [BSF-11]
   - "Telemetry data from science instruments and engineering subsystems is picked up by the CDS, where it is assembled into packages appropriate to the telemetry frame or packet scheme in use (for example CCSDS). If the spacecraft is downlinking data in real time, the packet or frame may be sent to the spacecraft's transmitter. Otherwise, telemetry may be written to a mass storage device until transmission is feasible." [BSF-11]
   - "CDS may apply data compression methods to reduce the number of bits to be transmitted, and apply one or more encoding schemes to reduce data loss as described in Chapter 10." [BSF-11]
   - Time-tagging: "In telemetry, SCLK counts that indicate data creation time mark engineering and science data whether it goes to the onboard storage device, or directly onto the downlink." [BSF-11]
3. **Data storage:** "…spacecraft data handling subsystems are usually provided with one or more data storage devices such as tape recorders, or the solid-state equivalent of tape recorders which maintain large quantities of data in banks of memory, for example RAM or FLASH. The storage devices can be commanded to play out their stored data for downlink when DSN resources are available, and then to overwrite the old data with new." [BSF-11]
   - Examples: Webb "Solid State Recorder (SSR)" [A10c]; Hubble "24 gigabits (or about 3 gigabytes)" of onboard storage [A9b].
4. **Transmitter and antenna:** "Telemetry containing science and engineering data may be transmitted to Earth by modulating the downlink carrier." [BSF-10]
   - "Voyager's, HGA, for example, provides a gain of 47 dBi at X-band. … A 20-Watt transmitter using a 47-dBi gain HGA would have an effective power of a megawatt along the highly directional beam." [BSF-10]
   - Voyager: "All data are transmitted from and received at the spacecraft via the 3.7 meter high-gain antenna (HGA)." and "…downlink telemetry at 160 bits/sec normally…" [A3]
   - Relay variant: Perseverance UHF "Up to 2 megabits per second on the rover-to-orbiter relay link." [A11b]
5. **Deep Space Network:** "The Deep Space Network—or DSN—is NASA's international array of giant radio antennas that supports interplanetary spacecraft missions, plus a few that orbit Earth." [NASA-DSN]
   - "The three Deep Space Network complexes are located at Goldstone, near Barstow, California; near Madrid, Spain; and near Canberra, Australia. The strategic placement of these sites permits constant communication with spacecraft as our planet rotates…" [NASA-DSN]
   - "Each Deep Space Network site has one huge, 230-foot (70-meter) diameter antenna, one 85-foot (26-meter) diameter antenna, and multiple 112-foot (34-meter) diameter antennas capable of tracking spacecraft traveling tens of billions of miles from Earth." [NASA-DSN]
   - "…the Deep Space Network's large aperture Cassegrain reflectors (the largest of which offer 74 dBi gain at X-band), cryogenically-cooled low-noise amplifiers, sophisticated receivers, and data coding and error-correction schemes. These systems can collect, detect, lock onto, and amplify a vanishingly small signal that reaches Earth from the spacecraft, and can extract data from the signal virtually without errors." [BSF-10]
6. **Decoding and delivery to the project:** "The spacecraft places symbols on its radio frequency downlink to represent the ones and zeroes that make up this data. The DSN Downlink Tracking & Telemetry subsystem recreates the spacecraft's digital data bit for bit by recognizing the downlinked symbols and decoding them. DSN then delivers the TLM data to the flight project for display, distribution, storage, and analysis, supporting spacecraft engineering management and eventual publication of scientific results." [BSF-18]
   - "The NASA Deep Space Network is an international network of facilities managed and operated by JPL's Interplanetary Network Directorate, IND." [BSF-18]
7. **Processing and archive (two examples):**
   - Hubble (TDRSS, not DSN): "Communications with Hubble are accomplished via a network interface from the STOCC to NASA's White Sands Test Facility complex located in White Sands, New Mexico, near Las Cruces. The large antennas there transmit radio waves to NASA's Tracking and Data Relay Satellite System (TDRSS), which forwards them to Hubble. Science observations and engineering data that the telescope stores on solid-state recorders are returned to Goddard using the reverse path. Once received and quality checked, the science data is forwarded to the Space Telescope Science Institute via dedicated high-speed network links where it is processed, archived, and distributed." [A9c]
   - Earth science: "Most raw NASA Earth observation data (Level 0, see data processing levels) are processed at NASA's Science Investigator-led Processing Systems (SIPS) facilities. All data are processed to at least a Level 1, but most have associated Level 2 (derived geophysical variables) and Level 3 (variables mapped on uniform space-time grid scales) products. … NASA Earth science data are available fully, openly, and without restriction to data users." [ED-proc]
   - Landsat: USGS manages "the ground system, flight operations, data processing, data product archive and distribution." [A13a]
8. **Worked example of the bottleneck (New Horizons):** "…about 6.25 gigabytes – took over 15 months … because the spacecraft was roughly 4.5 light-hours from Earth and it could only transmit 1-2 kilobits per second." [A7]

### B3. Real images for the signal chain
- DSN: https://www.nasa.gov/wp-content/uploads/2023/08/sunsetatgoldstone.jpg. Alt text: "This sunset photo shows Deep Space Station 14 (DSS-14), the 230-foot-wide (70-meter) antenna at the Goldstone Deep Space Communications Complex near Barstow, California…". This is a real photo; credit NASA/JPL-Caltech is likely but was not confirmed on the page.
- Voyager instrument diagram: https://science.nasa.gov/wp-content/uploads/2024/03/instruments-3.jpg, credit "NASA/JPL-Caltech" (shown on the page).
- Licence for both: NASA media guidelines (§0.1). Nothing was downloaded; only URLs were recorded.

---

## C. DISAGREEMENTS LOG
| Item | Value A (page, date) | Value B (page, date) |
|---|---|---|
| Hubble altitude | "about 300 miles (… 483 km)" (About Hubble, 2026-09-11) | "Hubble orbits 560 kilometers above the Earth" (Webb fact sheet, 2026-11-20) |
| Hubble array power | "about 5,500 watts" (About Hubble, 2026-09-11) | "> 5,200 watts" (Hubble by the Numbers, data as of 3/1/2024) |
| Voyager 1 working instruments | four, incl. CRS and LECP (Voyager 1 page, 2026-11-24) | CRS off 2025-02-25 and LECP off 2026-04-17, so only MAG and PWS are on (Voyager Spacecraft page, 2026-11-16) |
| Voyager RTG power | "about 158 We each, at launch" (V1 page) | "As of 2023, the twin Voyagers' RTGs are in stable operation at 225 We" (Spacecraft page). These are different epochs, not a true conflict. |
| Landsat 9 scenes/day | "as many as 750" (USGS, undated) | "740" (NASA Science, 2026-09-17) |
| Pioneer 10 instrument | "Infrared Adiometer" (P10 page; apparently a typo) | "Infrared Radiometer" (P11 page) |

## D. NOT FOUND / gaps
- **Voyager 2 current distance:** no dated figure on the NASA page, only a live 3D widget. voyager.jpl.nasa.gov (which had a live distance counter) is gone (302 to a 403 page).
- **Cassini mass and RTG wattage:** not on the Cassini mission, orbiter, quick-facts or about pages fetched.
- **Pioneer 11 RTG wattage:** not stated (Pioneer 10's is "about 140 W during the Jupiter encounter").
- **Hubble exact launch date:** the pages fetched say only "in 1990" (the timeline page was not fetched).
- **ISS altitude:** not on the Facts and Figures page or the ISS hub page.
- **JWST electrical power (watts) and downlink rate:** not on the NASA fact sheet or spacecraft-bus page. The JDox "JWST Observatory Characteristics" page body is JS-rendered and returned no content via curl.
- **GPS individual satellite mass and power:** not on GPS.gov space segment.
- **Landsat 9 mass and power:** not on the USGS or NASA Landsat 9 pages.
- **CMOS sensor how-it-works sentence:** none found on the NASA pages fetched. The BSF chapter covers CCDs only.
- **Perseverance current distance from Earth:** not given; only the odometer (28.10 mi on Oct. 11).
- **New Horizons:** the official mission site pluto.jhuapl.edu is disallowed by robots.txt (`Disallow: /`) and was not used.
- **Image credits:** several og:image credits (Cassini, New Horizons, ISS, Hubble, Perseverance, DSN) were not confirmed on the page. Verify each asset's caption or credit before display. Images marked "illustration" or "artist's concept" (Webb, New Horizons, Pioneer 10) are not photographs and must be labelled as such.
- No NASA press-kit PDFs were read.
