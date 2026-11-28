# Phase 14 — gates 14.4–14.6 source research (B)

Researched 2026-11-28. Raw downloads are in `/tmp/vv-research/p14b/`. Every fetch used UA
`VoyagerVentures-Research/0.1 (educational; respects robots.txt)` with ≥1 s between requests (15 s on arxiv.org, per its Crawl-delay).
No forbidden host was contacted.

"Read on image" means the formula was read on a rendered page image (archive.org `page/nN_w1200.jpg` downsized with `sips -Z 1500`, or a page of a born-digital PDF rendered locally with a PDFKit script).

---

## 0. Robots / access log

| Host | robots.txt result | Used? |
|---|---|---|
| www.nrl.navy.mil | **HTTP 403 from Akamai** for robots.txt itself (and the site) with our UA, so it acts as a bot wall. I did NOT retry with another UA. | **No.** I used the DTIC copy on archive.org instead (see 1.1). |
| archive.org | `User-agent: *` disallows only /control/ and /report/ | Yes |
| nssdc.gsfc.nasa.gov | `*` disallows /cgi-bin/, /nmc/… etc.; /planetary/ is allowed; no AI rules | Yes (the Sun fact sheet has no solar-wind data) |
| services.swpc.noaa.gov | no robots.txt (404), so no restrictions | Yes (JSON) |
| www.swpc.noaa.gov | Drupal default; `*` disallows only /admin/, /search/, /user/… | Yes |
| ntrs.nasa.gov | `User-agent: * Allow: /` | Yes |
| spdf.gsfc.nasa.gov | **Blocks `Anthropic` and `Claude` UAs** (AI block list, lines 250/295) | **No** (OMNI data not used) |
| omniweb.gsfc.nasa.gov | `*` disallows /cgi-bin/ etc.; no AI rules | Not needed |
| science.nasa.gov / www.nasa.gov | `User-agent: * Allow: /` | Yes |
| einstein.stanford.edu | robots.txt returns 404 (Stanford "page not found"), so no restrictions | Yes (HTML status page only; I did NOT use the PRL PDF it hosts, because PRL is APS) |
| arxiv.org | `*`: Allow /abs, /pdf, /html; **Crawl-delay: 15** | Yes, at 15 s spacing |
| astroweb.cwru.edu | `*` disallows only /VirgoSurvey/ | Yes |
| articles.adsabs.harvard.edu, ui.adsabs.harvard.edu | Both redirect to `scixplorer.org/scan` with **HTTP 202**, a bot-challenge page, even for robots.txt | **No.** Treated as a bot wall. Nothing fetched. |
| thesis.library.caltech.edu | robots.txt connection failed (HTTP 000) with our UA | **No** |
| api.crossref.org | no robots.txt (404) | Yes (DOI checks) |

---

## 1. Plasma / MHD (gate 14.4)

### 1.1 NRL Plasma Formulary — formulas with coefficients

- **Citation:** Huba, J. D. (2009). *NRL Plasma Formulary* (2009 revision). Beam Physics Branch, Plasma Physics Division, Naval Research Laboratory, Washington DC 20375. Supported by the Office of Naval Research. DTIC accession **ADA499299**.
- **URL used:** https://archive.org/details/DTIC_ADA499299 (DTIC scan; page images `https://archive.org/download/DTIC_ADA499299/page/nN_w1200.jpg`; for this item the leaf number equals the printed page number: n28 = p.28, n29 = p.29, n40 = p.40, n42 = p.42, n43 = p.43).
- **Licence:** US Government work by an NRL employee, so public domain in the US (17 U.S.C. §105). The DTIC Report Documentation Page, block 12, reads verbatim: "**Approved for public release; distribution unlimited**".
- **Official current edition:** the official NRL copy (the current edition is newer than 2009) is on www.nrl.navy.mil, which returned Akamai HTTP 403 (bot wall), so I did not read it. **I could not check whether the coefficients changed in later editions.** These are long-standing values, but the app should cite "NRL Plasma Formulary (2009 rev.), p. N".

**p. 28, "FUNDAMENTAL PLASMA PARAMETERS" (read on image n28).** Verbatim header:
> "All quantities are in Gaussian cgs units except temperature (T, Tₑ, Tᵢ) expressed in eV and ion mass (mᵢ) expressed in units of the proton mass, μ = mᵢ/mₚ; Z is charge state; k is Boltzmann's constant; K is wavenumber; γ is the adiabatic index; ln Λ is the Coulomb logarithm."

So n is in cm⁻³, B in gauss and T in eV.

| Quantity (p.28) | Formula exactly as printed |
|---|---|
| electron gyrofrequency | f_ce = ω_ce/2π = **2.80 × 10⁶ B Hz** |
| | ω_ce = eB/m_e c = **1.76 × 10⁷ B rad/sec** |
| ion gyrofrequency | f_ci = ω_ci/2π = **1.52 × 10³ Z μ⁻¹ B Hz** |
| | ω_ci = ZeB/m_i c = **9.58 × 10³ Z μ⁻¹ B rad/sec** |
| electron plasma frequency | f_pe = ω_pe/2π = **8.98 × 10³ n_e^{1/2} Hz** |
| | ω_pe = (4π n_e e²/m_e)^{1/2} = **5.64 × 10⁴ n_e^{1/2} rad/sec** |
| ion plasma frequency | f_pi = ω_pi/2π = **2.10 × 10² Z μ^{−1/2} n_i^{1/2} Hz** |
| | ω_pi = (4π n_i Z² e²/m_i)^{1/2} = **1.32 × 10³ Z μ^{−1/2} n_i^{1/2} rad/sec** |
| electron gyroradius | r_e = v_Te/ω_ce = **2.38 T_e^{1/2} B⁻¹ cm** |
| ion gyroradius | r_i = v_Ti/ω_ci = **1.02 × 10² μ^{1/2} Z⁻¹ T_i^{1/2} B⁻¹ cm** |
| electron inertial length | c/ω_pe = **5.31 × 10⁵ n_e^{−1/2} cm** |
| ion inertial length | c/ω_pi = **2.28 × 10⁷ Z⁻¹ (μ/n_i)^{1/2} cm** |
| Debye length | λ_D = (kT/4πne²)^{1/2} = **7.43 × 10² T^{1/2} n^{−1/2} cm** |

**p. 29, continued (read on image n29):**

| Quantity (p.29) | Formula exactly as printed |
|---|---|
| electron thermal velocity | v_Te = (kT_e/m_e)^{1/2} = **4.19 × 10⁷ T_e^{1/2} cm/sec** |
| ion thermal velocity | v_Ti = (kT_i/m_i)^{1/2} = **9.79 × 10⁵ μ^{−1/2} T_i^{1/2} cm/sec** |
| ion sound velocity | C_s = (γZkT_e/m_i)^{1/2} = **9.79 × 10⁵ (γZT_e/μ)^{1/2} cm/sec** |
| Alfvén velocity | v_A = B/(4π n_i m_i)^{1/2} = **2.18 × 10¹¹ μ^{−1/2} n_i^{−1/2} B cm/sec** |
| (m_e/m_p)^{1/2} | = 2.33 × 10⁻² = 1/42.9 |
| particles in Debye sphere | (4π/3) n λ_D³ = **1.72 × 10⁹ T^{3/2} n^{−1/2}** |
| Alfvén velocity / speed of light | v_A/c = **7.28 μ^{−1/2} n_i^{−1/2} B** |
| electron plasma/gyrofrequency ratio | ω_pe/ω_ce = **3.21 × 10⁻³ n_e^{1/2} B⁻¹** |
| ion plasma/gyrofrequency ratio | ω_pi/ω_ci = **0.137 μ^{1/2} n_i^{1/2} B⁻¹** |
| thermal/magnetic energy ratio (plasma beta) | **β = 8π nkT/B² = 4.03 × 10⁻¹¹ nTB⁻²** |
| magnetic/ion rest energy ratio | B²/8π n_i m_i c² = 26.5 μ⁻¹ n_i⁻¹ B² |
| Bohm diffusion coefficient | D_B = (ckT/16eB) = 6.25 × 10⁶ TB⁻¹ cm²/sec |
| Magnetic pressure | P_mag = B²/8π = 3.98 × 10⁶ (B/B₀)² dynes/cm² = 3.93 (B/B₀)² atm, "where B₀ = 10 kG = 1 T." |

Notes:
- Thermal speeds are defined as (kT/m)^{1/2}, with **no factor of 2 or 3**. The app must use the same convention when it quotes these coefficients.
- The formulary gives no SI forms. Any SI conversion the app shows is its own arithmetic: say so, or show the cgs form.

**p. 40, "APPROXIMATE MAGNITUDES IN SOME TYPICAL PLASMAS" (read on image n40).** Columns: n cm⁻³ | T eV | ω_pe sec⁻¹ | λ_D cm | nλ_D³ | ν_ei sec⁻¹.

| Plasma | n | T | ω_pe | λ_D | nλ_D³ | ν_ei |
|---|---|---|---|---|---|---|
| Interstellar gas | 1 | 1 | 6×10⁴ | 7×10² | 4×10⁸ | 7×10⁻⁵ |
| Gaseous nebula | 10³ | 1 | 2×10⁶ | 20 | 8×10⁶ | 6×10⁻² |
| Solar Corona | 10⁹ | 10² | 2×10⁹ | 2×10⁻¹ | 8×10⁶ | 60 |
| Diffuse hot plasma | 10¹² | 10² | 6×10¹⁰ | 7×10⁻³ | 4×10⁵ | 40 |
| Solar atmosphere, gas discharge | 10¹⁴ | 1 | 6×10¹¹ | 7×10⁻⁵ | 40 | 2×10⁹ |
| Warm plasma | 10¹⁴ | 10 | 6×10¹¹ | 2×10⁻⁴ | 8×10² | 10⁷ |
| Hot plasma | 10¹⁴ | 10² | 6×10¹¹ | 7×10⁻⁴ | 4×10⁴ | 4×10⁶ |
| Thermonuclear plasma | 10¹⁵ | 10⁴ | 2×10¹² | 2×10⁻³ | 8×10⁶ | 5×10⁴ |
| Theta pinch | 10¹⁶ | 10² | 6×10¹² | 7×10⁻⁵ | 4×10³ | 3×10⁸ |
| Dense hot plasma | 10¹⁸ | 10² | 6×10¹³ | 7×10⁻⁶ | 4×10² | 2×10¹⁰ |
| Laser Plasma | 10²⁰ | 10² | 6×10¹⁴ | 7×10⁻⁷ | 40 | 2×10¹² |

**p. 42, "IONOSPHERIC PARAMETERS²³" (read on image n42).** Verbatim:
> "The following tables give average nighttime values. Where two numbers are entered, the first refers to the lower and the second to the upper portion of the layer."

| Quantity | E Region | F Region |
|---|---|---|
| Altitude (km) | 90–160 | 160–500 |
| Number density (m⁻³) | 1.5×10¹⁰–3.0×10¹⁰ | 5×10¹⁰–2×10¹¹ |
| Height-integrated number density (m⁻²) | 9×10¹⁴ | 4.5×10¹⁵ |
| Ion gyrofrequency (sec⁻¹) | 180–190 | 230–300 |
| Mean molecular weight | 28–26 | 22–16 |

Also verbatim: "The terrestrial magnetic field in the lower ionosphere at equatorial latitudes is approximately B₀ = 0.35×10⁻⁴ tesla. The earth's radius is R_E = 6371 km."

The table also lists collision frequencies, Pedersen/Hall factors and diffusion coefficients; see the image. Its source, ref. 23, is: K. H. Lloyd and G. Haerendel, "Numerical Modeling of the Drift and Deformation of Ionospheric Plasma Clouds and of their Interaction with Other Layers of the Ionosphere," J. Geophys. Res. 78, 7389 (1973).

**p. 43, "SOLAR PHYSICS PARAMETERS²⁴" (read on image n43).** Includes: Solar constant (intensity at 1 AU) f = 1.36×10⁶ erg cm⁻² s⁻¹. "Chromosphere and Corona²⁵" table: coronal temperature at 1.1 R☉ is 1.1–1.6×10⁶ K (quiet Sun), 10⁶ K (coronal hole) and 2.5×10⁶ K (active region); solar-wind mass loss (g cm⁻² s⁻¹) is ≲2×10⁻¹¹, 2×10⁻¹⁰ and <4×10⁻¹¹ respectively. This page gives **no** 1 AU solar-wind density, speed or field.

### 1.2 Typical solar-wind values near 1 AU

**(a) NASA/JPL design-criteria table (best "typical values" source).**
- **Citation:** Divine, T. N. (1973). *Interplanetary Charged Particle Environments*. JPL Technical Memorandum 33-637 (NASA-CR-133600), 1 Aug 1973.
- **URL:** https://ntrs.nasa.gov/citations/19730021133. PDF: https://ntrs.nasa.gov/api/citations/19730021133/downloads/19730021133.pdf
- **Licence:** NTRS records `determinationType: GOV_PUBLIC_USE_PERMITTED`, distribution PUBLIC. This is a NASA contractor report (JPL/Caltech), so it is **not** strictly a §105 federal-employee work, but NASA marks it permitted for public use. Cite it and quote the numbers; do not reproduce the whole table as an image.
- **Table 1, "VALUES NEAR 1 AU AND RADIAL DEPENDENCES FOR SOLAR WIND PARAMETERS"**, printed p. 33 (PDF page 38). Read on the rendered page image; the table is rotated on the page.

| | Average | Range* | Radial dependence |
|---|---|---|---|
| PROTON concentration, cm⁻³ | 5 | 7 to 2.5 | S⁻² |
| proton flow speed, km/s | 425 | 350 to 550 | none |
| proton thermal speed, km/s | 50 | 35 to 70 | S^−0.5 |
| proton temperature, K | 8×10⁴ | (5 to 15)×10⁴ | S^(−1±0.5) |
| proton energy (flow), eV | 900 | 600 to 1500 | none |
| proton flux (flow), m⁻² s⁻¹ | 2×10¹² | (2.5 to 1.4)×10¹² | S⁻² |
| ELECTRON concentration, cm⁻³ | 5 | 7 to 2.5 | S⁻² |
| electron flow speed, km/s | 425 | 350 to 550 | none |
| electron thermal speed, km/s | 2700 | 2100 to 3300 | S^−0.5 |
| electron temperature, K | 1.5×10⁵ | (1 to 2)×10⁵ | S^(−1±0.5) |
| MAGNETIC FIELD strength, nT (gammas) | 5 | 2 to 7 | S⁻¹ |

Verbatim footnotes:
- "\* Typically data fall within this range most (say 60%) of the time."
- "\*\* Stream correlated quantities appear above the dashed line (fast stream values at right, slow at left); below it parameters listed are not strongly correlated in streams."

The text on p. 14 also gives "AVERAGE = 5.2 nT" (field-magnitude histogram). S is heliocentric distance in AU.

**(b) NOAA SWPC "Solar Wind" phenomena page** (US Government, NOAA/NWS, public domain).
- **URL:** https://www.swpc.noaa.gov/phenomena/solar-wind
- Verbatim:
  > "The solar wind continuously flows outward from the Sun and consists mainly of protons and electrons in a state known as a plasma. Solar magnetic field is embedded in the plasma and flows outward with the solar wind."
  >
  > "Coronal holes produce solar wind of high speed, ranging from 500 to 800 kilometers per second."
  >
  > "In the equatorial plane, where the Earth and the other planets orbit, the most common state of the solar wind is the slow speed wind, with speeds of about 400 kilometers per second."

**(c) NOAA SWPC real-time snapshot** (US Government, public domain).
- The `products/solar-wind/plasma-1-day.json` and `mag-1-day.json` endpoints now return **404**.
- The current equivalents are:
  - https://services.swpc.noaa.gov/json/rtsw/rtsw_wind_1m.json
  - https://services.swpc.noaa.gov/json/rtsw/rtsw_mag_1m.json
  - one-line summaries `products/summary/solar-wind-speed.json` and `solar-wind-mag-field.json`
- Snapshot saved: `p14b/rtsw_wind_1m.json` and `p14b/rtsw_mag_1m.json`, retrieved 2026-11-28 ~09:20 UTC. The window is 2026-11-27T09:22 to 2026-11-28T09:18.
- Each record has `source` ∈ {SOLAR1, ACE, IMAP} and an `active` flag. Only SOLAR1 was `active: true`.
- Statistics over active 1-min records (1433 plasma, 1438 mag). These are my own computation from the JSON:

| | median | min | max |
|---|---|---|---|
| proton speed (km/s) | 349.3 | 275.6 | 434.5 |
| proton density (cm⁻³) | 3.99 | 1.71 | 11.14 |
| proton temperature (K) | 126 170 | 21 879 | 576 611 |
| Bt (nT) | 10.66 | 3.42 | 15.44 |

- Summary endpoints at 09:17 UTC: `{"proton_speed": 416}`, `{"bt": 11, "bz_gsm": -7}`.
- This is one day of conditions, not climatology. Use it as "live/example" data and (a) for "typical" values.

### 1.3 Ionosphere electron densities
- The NRL Formulary p. 42 table above is the primary numeric source: E region 1.5–3.0×10¹⁰ m⁻³; F region 5×10¹⁰–2×10¹¹ m⁻³; these are nighttime averages.
- **NOAA SWPC "Total Electron Content"**, https://www.swpc.noaa.gov/phenomena/total-electron-content. Verbatim:
  > "TEC is measured in electrons per square meter. By convention, 1 TEC Unit TECU = 10^16 electrons/m². Vertical TEC values in Earth's ionosphere can range from a few to several hundred TECU."
- **NOAA SWPC "Ionosphere"**, https://www.swpc.noaa.gov/phenomena/ionosphere. Qualitative only: D, E and F layers, and the density changes with solar EUV. It gives no numeric densities.

---

## 2. Advanced relativity (gate 14.5)

### 2(a) Kerr ISCO — Bardeen, Press & Teukolsky (1972)
- **Citation (verified on Crossref):** Bardeen, J. M., Press, W. H., & Teukolsky, S. A. (1972). "Rotating Black Holes: Locally Nonrotating Frames, Energy Extraction, and Scalar Synchrotron Radiation." *ApJ* 178, 347. DOI **10.1086/151796**. Crossref lists no licence.
- **Status: NOT FOUND in a permitted open copy.**
  - Both ADS article hosts (articles.adsabs.harvard.edu, ui.adsabs.harvard.edu, including any link_gateway route) now redirect to a `scixplorer.org/scan` bot challenge (HTTP 202), so I did not fetch from them.
  - iopscience is forbidden.
  - The paper predates arXiv.
  - archive.org has only ApJ index volumes for these years, and 1972 ApJ is in copyright.
  - **The equation number and the exact Z₁/Z₂ form were therefore NOT verified on a page.**
- Partial open substitute (CC BY 4.0): Cen, Y. & Song, Y., "Upper bound on the radius of the innermost stable circular orbit of black holes", arXiv:2505.02107 (Phys. Lett. B 866 (2025) 139545). Licence is http://creativecommons.org/licenses/by/4.0/ (arXiv abs page). Read from the text layer of this born-digital PDF, p. 5:
  > "ISCO radii for rotating Kerr black holes vary with spin parameter a, ranging from r_ISCO = 9M (counter-rotating case) to r_ISCO = M (extremal Kerr) [18]"

  [18] is BPT 1972. It also states r_ISCO = 6M for Schwarzschild (p. 1). **It does not give the Z₁/Z₂ formula.**
- Also checked: Teukolsky, "The Kerr Metric", arXiv:1410.2130 (nonexclusive arXiv licence). It does not contain the ISCO formula.

### 2(b) Gravity Probe B
- **Source 1 (numbers):** Gravity Probe B project (Stanford/NASA), "GP-B STATUS UPDATE — May 4, 2011", https://einstein.stanford.edu/highlights/status1.html (robots: none; Stanford page, no licence stated, so treat as all rights reserved: cite, quote briefly). Verbatim abstract text as shown on the page:
  > "Analysis of the data from all four gyroscopes results in a geodetic drift rate of -6,601.8±18.3 mas/yr and a frame-dragging drift rate of -37:2±7.2 mas/yr, to be compared with the GR predictions of -6,606.1 mas/yr and -39.2 mas/yr, respectively ('mas' is milliarc-second; 1 mas= 4.848 X10 -9 radians or 2.778 X10 -7 degrees)."

  The "37:2" colon is a typo on the page; the same page's results table gives −37.2±7.2.
- Table "Gravity Probe B — Final Experimental Results" on the same page:

| | r N-S (geodetic) | r W-E (frame-dragging) |
|---|---|---|
| Gyroscope #1 | −6,588.6±31.7 mas/yr | −41.3±24.6 mas/yr |
| Gyroscope #2 | −6,707.0±64.1 | −16.1±29.7 |
| Gyroscope #3 | −6,610.5±43.2 | −25.0±12.1 |
| Gyroscope #4 | −6,588.7±33.2 | −49.3±11.4 |
| **All gyroscopes (weighted avg)** | **−6,601.8±18.3** | **−37.2±7.2** |
| **Schiff–Einstein prediction** | **−6,606.1** | **−39.2** |

  The page also says: launched 20 April 2004; data collection 28 August 2004 to 14 August 2005.
- **Source 2 (context, US Government):** NASA Science, "Gravity Probe B", https://science.nasa.gov/mission/gravity-probe-b/ (the old science-at-nasa 2011 URL redirects here). Verbatim:
  > "Launched on April 20, 2004, Gravity Probe B (GP-B) was a collaboration between Stanford University and NASA designed to test two previously untested aspects of Albert Einstein's general theory of relativity (geodetic and frame-dragging effects) by observing the precession of four near perfectly spherical gyroscopes in reference to a distant star as the spacecraft travelled in a polar orbit 400 miles above the Earth."
- **PRL:** Everitt et al., PRL 106, 221101 (2011), DOI 10.1103/PhysRevLett.106.221101 (Crossref: APS default licence). It is cite-only. I did not open the PRL PDF on einstein.stanford.edu.

### 2(c) Einstein 1916 — Mercury perihelion and light deflection
- **Citation (verified on Crossref):** Einstein, A. (1916). "Die Grundlage der allgemeinen Relativitätstheorie." *Annalen der Physik* (4. Folge) 49 [= vol. 354], 769–822. DOI **10.1002/andp.19163540702**.
- **Licence:** published 1916, so **public domain in the US** (pre-1931). Einstein died in 1955, so it is also PD in life+70 countries. Crossref shows a Wiley TDM licence link for the version of record; that does not apply to the PD scan.
- **URL:** https://archive.org/details/sim_annalen-der-physik_1916_49_7 (Annalen der Physik 1916, Vol 49, Iss 7). Page images: `https://archive.org/download/sim_annalen-der-physik_1916_49_7/page/nN_w1200.jpg`, where **n0 = p.769** (title page: "1916. № 7. ANNALEN DER PHYSIK. VIERTE FOLGE. BAND 49. — 1. Die Grundlage der allgemeinen Relativitätstheorie; von A. Einstein."). n52 = p.821 and n53 = p.822. The item is not access-restricted.
- **p. 822 (leaf n53), read on image.** Light deflection, eq. (74):
  > "(74)  B = 2α/Δ = κM/(4πΔ) ."
  >
  > "Ein an der Sonne vorbeigehender Lichtstrahl erfährt demnach eine Biegung von 1,7″, ein am Planeten Jupiter vorbeigehender eine solche von etwa 0,02″."
- **Perihelion, eq. (75), same page:**
  > "Die Bahnellipse eines Planeten erfährt in Richtung der Bahnbewegung eine langsame Drehung vom Betrage
  > (75)  ε = 24π³ a² / (T² c² (1 − e²))
  > pro Umlauf. In dieser Formel bedeutet a die große Halbachse, c die Lichtgeschwindigkeit in üblichem Maße, e die Exzentrizität, T die Umlaufszeit in Sekunden."
  >
  > "Die Rechnung ergibt für den Planeten Merkur eine Drehung der Bahn um 43″ pro Jahrhundert, genau entsprechend der Konstatierung der Astronomen (Leverrier); diese fanden nämlich einen durch Störungen der übrigen Planeten nicht erklärbaren Rest der Perihelbewegung dieses Planeten von der angegebenen Größe."
- The p.822 footnote cites "A. Einstein, Sitzungsber. d. Preuß. Akad. d. Wiss. 47. p. 831. 1915. — K. Schwarzschild, Sitzungsber. d. Preuß. Akad. d. Wiss. 7. p. 189. 1916." The paper is dated "(Eingegangen 20. März 1916.)"
- **p. 821 (leaf n52):** sets up light propagation, ds² = g_μν dx_μ dx_ν = 0 (73), and the bending integral B = ∫₋∞^{+∞} (∂γ/∂x₁) dx₂.
- English glosses (my translation; do not present as a quote): "A light ray passing the Sun accordingly undergoes a deflection of 1.7″; one passing Jupiter about 0.02″." / "The calculation gives for the planet Mercury a rotation of the orbit of 43″ per century, exactly corresponding to the astronomers' finding (Leverrier)…"

---

## 3. Cosmology & dark-matter model comparison (gate 14.6)

### 3(a) MOND — Milgrom 1983 and a₀
- **Citations (verified on Crossref):**
  - Milgrom, M. (1983). "A modification of the Newtonian dynamics as a possible alternative to the hidden mass hypothesis." *ApJ* 270, 365. DOI **10.1086/161130**.
  - Milgrom, M. (1983). "A modification of the Newtonian dynamics — Implications for galaxies." *ApJ* 270, 371. DOI **10.1086/161131**. This is the paper the RAR paper cites as [52].
  - Crossref lists no licence for either.
- **Open copy: NOT FOUND.** The ADS hosts are behind a bot challenge, iopscience is forbidden, the papers are pre-arXiv, and they are not on archive.org.
- **a₀ from an open source:** Famaey, B. & McGaugh, S. S., "Modified Newtonian Dynamics (MOND): Observational Phenomenology and Relativistic Extensions", arXiv:1112.3960 (Living Rev. Relativity 15, 10 (2012)). arXiv licence: **nonexclusive-distrib/1.0**, so quote briefly and do not reuse figures or text at length. I did not fetch the Springer/LRR copy (forbidden host). Read from the text layer of the born-digital PDF:
  - p. 66: "It turns out that using the simple interpolating function (α = n = 1, see Eqs. 46 and 49) yields a value of a0 = 1.2 × 10−10 m s−2, and excellent fits to galaxy rotation curves [167]."
  - p. 19 (Fig. caption, BTFR): "The dotted line has slope 4 corresponding to a constant acceleration parameter, 1.2 × 10−10 m s−2."
  - Elsewhere: "a0 ≃ 10−10 m s−2" and "(or, more precisely, a0 ≈ cH0/2π)".

### 3(b) Radial Acceleration Relation (McGaugh, Lelli & Schombert 2016)
- **Citation (verified on Crossref):** McGaugh, S. S., Lelli, F., & Schombert, J. M. (2016). "Radial Acceleration Relation in Rotationally Supported Galaxies." *Phys. Rev. Lett.* 117, 201101. DOI **10.1103/PhysRevLett.117.201101** (Crossref licence: APS default).
- **Open copy used:** arXiv:1609.05917v1 (submitted 19 Sep 2016), https://arxiv.org/abs/1609.05917. **Licence: arXiv nonexclusive-distrib/1.0**, so the text is not reusable. Quote only the equation and the fitted value with attribution. Do not reproduce Fig. 3.
- **p. 4 (rendered page image of the PDF), eq. (4):**
  > "It is convenient to fit a function that describes the data. The function [40]
  >   g_obs = F(g_bar) = g_bar / (1 − e^{−√(g_bar/g†)})   (4)
  > provides a good fit. The one fit parameter is the acceleration scale, g†, where the mass discrepancy becomes pronounced. For our adopted Υ⋆, we find g† = 1.20 ± 0.02 (random) ± 0.24 (systematic) ×10⁻¹⁰ m s⁻². The random error is a 1σ value, while the systematic uncertainty represents the 20% normalization uncertainty in Υ⋆."
- [40] = S. S. McGaugh, Astrophys. J. 683, 137 (2008).
- **Eq. (5), p. 5:** g_DM = g_obs − g_bar = g_bar / (e^{√(g_bar/g†)} − 1).
- **Other values on p. 4:**
  - 2693 points in 153 galaxies.
  - Fig. 3 caption: g_obs = V²/R and g_bar = |∂Φ_bar/∂R|.
  - Residuals Gaussian width σ = 0.11 dex; rms scatter 0.13 dex.
  - Table I scatter budget: rotation velocity errors 0.03 dex, disk inclination 0.05, galaxy distance 0.08, mass-to-light variation 0.06, HI flux calibration 0.01, **Total 0.12 dex**.
- Adopted mass-to-light ratios (p. 2, text layer):
  > "Here we adopt Υ⋆^[3.6] = 0.50 M⊙/L⊙ [25] as representative of all disks of all morphological types. Independent estimates range from 0.42 M⊙/L⊙ …"

  For bulges: "we adopt Υ⋆^[3.6] = 0.7 M⊙/L⊙ for bulges [25]" (31 of 153 galaxies have bulges).
- p. 5: "In MOND, eq. 4 is related to the MOND interpolation function. However, we should be careful not to confuse data with theory."

**SPARC site terms:** https://astroweb.cwru.edu/SPARC/ (robots OK; "Last update: 29 May 2020"; maintained by Federico Lelli).
- **No licence or terms of use are stated.** The only condition, verbatim:
  > "If you are using data from this website in your scientific publications, please cite the SPARC master paper. References to the original HI+Halpha rotation curves are given in Table1.mrt. Please consider citing the original rotation-curve sources if relevant to your publication."
- The site also offers "Radial Acceleration Relation: Binned Data | All Data (same as in Lelli+2017; McGaugh+2016)".
- Master paper (Crossref): Lelli, McGaugh & Schombert 2016, AJ 152, 157, DOI 10.3847/0004-6256/152/6/157. Crossref licence: iopscience copyright page, which means not open-licensed.

### 3(c) Friedmann 1922 — the Friedmann equations
- **Citation (verified on Crossref):** Friedman, A. (1922). "Über die Krümmung des Raumes." *Zeitschrift für Physik* 10, 377–386. DOI **10.1007/BF01332580**. Received 29 June 1922.
- **Licence:** published 1922, so **public domain in the US** (pre-1931). Friedmann died in 1925, so it is also PD worldwide.
  - **Caveat:** the archive.org uploader tagged the item `licenseurl: https://creativecommons.org/licenses/by-nc-nd/4.0/`. A CC licence cannot attach to a PD 1922 scan's content. Record the uploader's tag, but rely on PD status for the 1922 text.
- **URL:** https://archive.org/details/friedmann-alexander-uber-die-krummung-des-raumes (compilation PDF of the 1922 article, plus Einstein's 1922 and 1923 notes and Friedmann 1924). Page images `…/page/nN_w1200.jpg`, from `_page_numbers.json`: leaf 1 = p.377 … **leaf 5 = p.381**. Not access-restricted.
- **p. 377 (n1):** title "Über die Krümmung des Raumes. Von A. Friedman in Petersburg. Mit einer Abbildung. (Eingegangen am 29. Juni 1922.)"
- **p. 381 (n5), read on image.** Metric (D₃):
  > dτ² = −(R²(x₄)/c²)(dx₁² + sin²x₁ dx₂² + sin²x₁ sin²x₂ dx₃²) + dx₄².
- Field equations (A) for i = k = 1, 2, 3, eq. (4):
  > R′²/R² + 2RR″/R² + c²/R² − λ = 0,   (4)
- For i = k = 4, eq. (5):
  > 3R′²/R² + 3c²/R² − λ = κc²ρ,   (5)
  > "mit R′ = dR/dx₄ und R″ = d²R/dx₄²."
- First integral, eq. (6):
  > (1/c²)(dR/dt)² = (A − R + (λ/3c²) R³) / R   (6)
  > "wo A eine willkürliche Konstante ist."
- Eq. (7):
  > t = (1/c) ∫ₐᴿ √( x / (A − x + (λ/3c²) x³) ) dx + B.
- Same page, de Sitter case: λ = 3c²/R², ρ = 0, M = 0.
- **Notes for the app:**
  - Friedmann's eq. (5) is the original form of the first Friedmann equation for positive curvature (k = +1), with x₄ = ct-type time (c appears explicitly) and κ the Einstein gravitational constant.
  - The modern form H² = (8πG/3)ρ − kc²/a² + Λc²/3 is **not** printed here. If shown, label it as a modern rewriting of eq. (5) (κ = 8πG/c²), not as a quote.

---

## 4. NOT FOUND / not usable

1. **NRL Plasma Formulary, official current edition (nrl.navy.mil):** Akamai 403 bot wall. I used the 2009 DTIC copy instead and could not check whether later editions changed the coefficients.
2. **Bardeen, Press & Teukolsky 1972 (ApJ 178, 347):** no permitted open copy. **The ISCO Z₁/Z₂ formula and its equation number were NOT verified.** The only CC BY substitute gives just the limits r_ISCO = 9M (retrograde), 6M (Schwarzschild), M (extremal prograde), from arXiv:2505.02107.
3. **Milgrom 1983 (ApJ 270, 365 and 371):** no permitted open copy. a₀ = 1.2×10⁻¹⁰ m s⁻² is sourced instead from Famaey & McGaugh arXiv:1112.3960 (nonexclusive licence).
4. **NASA/NSSDC "Sun fact sheet":** contains no solar-wind parameters. The OMNI/SPDF data host blocks Claude by robots, so it was not used.
5. **SWPC `products/solar-wind/plasma-1-day.json` and `mag-1-day.json`:** 404 (retired). I used `json/rtsw/*_1m.json` instead.
6. **Gravity Probe B PRL text:** APS, not openly licensed, so cite only. Numbers come from the Stanford GP-B status page.
7. **No NASA/NOAA page found** with a numeric typical ionospheric electron density. The NRL Formulary table (US Gov) covers it.

## 5. Licence summary

| Source | Licence |
|---|---|
| NRL Formulary 2009 (DTIC ADA499299) | US Gov work, public domain; "Approved for public release; distribution unlimited" |
| NOAA SWPC pages and JSON | US Gov, public domain |
| NASA science.nasa.gov | US Gov |
| Divine 1973 JPL TM 33-637 (NTRS) | NASA "GOV_PUBLIC_USE_PERMITTED" (contractor report) |
| Einstein 1916 | US public domain (pre-1931) |
| Friedmann 1922 | US public domain (pre-1931); the archive.org uploader's CC BY-NC-ND tag is noted but cannot bind PD content |
| arXiv:1609.05917, 1112.3960, 1410.2130 | arXiv non-exclusive licence: quote short equations/values only, with attribution |
| arXiv:2505.02107 | CC BY 4.0 |
| GP-B Stanford page | no licence stated: cite and quote briefly |
| SPARC website | no licence; "please cite the SPARC master paper" |


## A. Particles, quantum, nuclear (gates 14.1–14.3)

# Phase 14 source research — gates 14.1–14.3 (agent A)

Date: 2026-11-28. Raw downloads: `/tmp/vv-research/p14a/`. User agent used: `VoyagerVentures-Research/0.1 (educational; respects robots.txt)`, about 1 s between requests to the same host.
How things were verified: PDG files are born-digital PDFs and text. I extracted their text and checked the quark page against a rendered image. Every formula from a scanned book or report was read on the page image. The leaf numbers are the archive.org `page/nNNN` indices, which start at 0.

---

## 0. Robots / access log

| Host | robots.txt result | Used? |
|---|---|---|
| pdg.lbl.gov | `User-agent: *` Disallow `/tmp/ /files/ /old/ /*/web/viewer.html`. ClaudeBot not named. | YES (I fetched only allowed paths: /2025/, /2025/tables/*.pdf, /2025/reviews/*.pdf, /2025/mcdata/, /2024/mcdata/) |
| pdgapi.lbl.gov | robots.txt returns 404, so there are no restrictions | Not needed |
| www.fnal.gov | **Cloudflare "Just a moment..." challenge (HTTP 403) even for robots.txt. This is a bot wall, so I did not work around it.** | NO |
| www.energy.gov | `*`: Disallow /core/, /profiles/, /admin/, /search/ etc. The /science/ pages are allowed. ClaudeBot not named. | YES |
| archive.org | `*`: Disallow /control/, /report/ only | YES |
| www.osti.gov | `*`: Disallow /search/, /pages/search, /account etc. **/api/v1/ and /servlets/purl/ are allowed**. I did not use /search/. | YES (API + purl) |
| api.crossref.org | robots.txt 404 (API) | YES (DOI checks) |
| www.epa.gov | `*`: Disallow /core/, /profiles/, /admin/, /search/ … | YES |
| pubs.usgs.gov | `*`: Disallow /archive/ only | YES |
| www.usgs.gov | Drupal default disallows only | YES (copyright policy page) |
| solarscience.msfc.nasa.gov | robots.txt 404, so no restrictions | YES |
| www.nasa.gov, science.nasa.gov, ntrs.nasa.gov, imagine.gsfc.nasa.gov, heasarc.gsfc.nasa.gov | All allow `*` (with minor disallows) | ntrs API search returned 0 hits for anything I tried, so it was not used |
| www.nrc.gov | `*`: only search/ads disallowed | Not needed |

I did not fetch from any of the forbidden hosts (openstax, LibreTexts, wikipedia, jlab, ams, iop, arxiv export, springer PDFs, NAP, ADS, CDS, PubChem, Europe PMC, NCBI, nobelprize, APS journals, ACS, Wiley).

---

## 1. Gate 14.1 — Standard Model atlas

### 1A. Particle Data Group, Review of Particle Physics (2024 edition + 2025 update)

- **Citation PDG asks for.** It is printed verbatim in the header of every summary-table page and on the 2025 home page:
  > "S. Navas et al. (Particle Data Group), Phys. Rev. D 110, 030001 (2024) and 2025 update"
- **DOI check (Crossref).** 10.1103/PhysRevD.110.030001 resolves to "Review of Particle Physics", Physical Review D vol. 110, article 030001, issued 2024-08-01, first authors Navas, Amsler, Gutsche. Crossref licence field: `https://creativecommons.org/licenses/by/4.0/` (vor, from 2024-08-01, delay 0 days).
- **Licence, verbatim.** From https://pdg.lbl.gov/2025/copyright.html (loaded into every page):
  > "Except where otherwise noted, content of the 2025 Review of Particle Physics is licensed under a Creative Commons 4.0 International ( CC BY 4.0 ) license. The publication of the Review of Particle Physics is supported by US DOE, MEXT and KEK (Japan), INFN (Italy), and CERN. … © 2025. See LBNL disclaimers."
  → **CC BY 4.0, confirmed.** Attribution must cite PDG as above.
- **Files used**
  - Summary tables (PDF): https://pdg.lbl.gov/2025/tables/rpp2025-sum-quarks.pdf (Created 5/30/2025), https://pdg.lbl.gov/2025/tables/rpp2025-sum-leptons.pdf (Created 12/23/2025), https://pdg.lbl.gov/2025/tables/rpp2025-sum-gauge-higgs-bosons.pdf (Created 5/30/2025)
  - Machine-readable: https://pdg.lbl.gov/2025/mcdata/mass_width_2025.txt. Header: "MASSES, WIDTHS, AND MC ID NUMBERS FROM 2025 EDITION OF RPP … generated on 22-Apr-2025". Units are GeV and the format is fixed-width (FORTRAN `4I8, 2(1X,E18.0,1X,E8.0,1X,E8.0), 1X,A21`). The 2024 file is also saved (`mass_width_2024.txt`).
  - PDG API (REST/Python/SQLite) is listed at https://pdg.lbl.gov/2025/html/computer_read.html. I did not use it because the text file covers the need.

#### Quark masses and schemes
Verbatim box from rpp2025-sum-quarks.pdf, page 1 (checked on a rendered image):
> "The u-, d-, and s-quark masses are the MS‾ masses at the scale μ = 2 GeV. The c- and b-quark masses are the MS‾ masses renormalized at the MS‾ mass, i.e. m‾ = m‾(μ = m‾). The t-quark mass is extracted from event kinematics (see the review "The Top Quark")."

| Quark | Mass (PDG 2025) | Scheme | Charge | J^P (I) |
|---|---|---|---|---|
| u | 2.16 ± 0.07 MeV, CL = 90% | MS‾, μ = 2 GeV | +2/3 e | I(J^P) = ½(½⁺), I_z = +½ |
| d | 4.70 ± 0.07 MeV, CL = 90% | MS‾, μ = 2 GeV | −1/3 e | ½(½⁺), I_z = −½ |
| s | 93.5 ± 0.8 MeV, CL = 90% | MS‾, μ = 2 GeV | −1/3 e | 0(½⁺), Strangeness = −1 |
| c | 1.2730 ± 0.0046 GeV, CL = 90% | m‾(m‾) | +2/3 e | 0(½⁺), Charm = +1 |
| b | 4.183 ± 0.007 GeV, CL = 90% | m‾(m‾) | −1/3 e | 0(½⁺), Bottom = −1 |
| t | 172.56 ± 0.31 GeV (direct measurements) [a,b] (S = 1.6) | event kinematics | +2/3 e | 0(½⁺), Top = +1 |

The same page also gives these values:
- m_u/m_d = 0.462 ± 0.020
- m‾ = (m_u+m_d)/2 = 3.49 ± 0.07 MeV
- m_s/m_d = 17–22
- m_s/((m_u+m_d)/2) = 27.33 +0.18 −0.14
- m_b − m_c = 3.45 ± 0.05 GeV
- t mass from cross-section measurements = 162.5 +2.1 −1.5 GeV; pole mass from cross-section measurements = 172.4 ± 0.7 GeV
- t full width Γ = 1.42 +0.19 −0.15 GeV (S = 1.4) (page 2)

The mass_width_2025.txt file agrees: u 2.16E-03, d 4.70E-03, s 9.35E-02, c 1.273E+00, b 4.183E+00, t 1.7256E+02 GeV (width 1.42 GeV). Note that the MC file rounds the c-quark error to ±5.0E-03.

#### Leptons (rpp2025-sum-leptons.pdf)
| Particle | J | Mass | Lifetime / width |
|---|---|---|---|
| e | ½ | 0.51099895000 ± 0.00000000015 MeV (also (548.579909065 ± 0.000000016)×10⁻⁶ u) | Mean life τ > 6.6×10²⁸ yr, CL = 90% |
| μ | ½ | 105.6583755 ± 0.0000023 MeV | τ = (2.1969811 ± 0.0000022)×10⁻⁶ s; cτ = 658.6384 m |
| τ | ½ | 1776.93 ± 0.09 MeV | τ = (290.3 ± 0.5)×10⁻¹⁵ s; cτ = 87.03 µm |

The MC file gives widths for μ (2.9959836E-19 GeV) and τ (2.267E-12 GeV). Charges in the MC file are e, μ, τ "−" and ν_e, ν_μ, ν_τ "0", with no mass entries for the neutrinos.

**Neutrino limits** (leptons p. 10–11, verbatim lines):
- "Mass m < 0.8 eV, CL = 90% (tritium decay)"
- "Number N = 2.996 ± 0.007 (Standard Model fits to LEP-SLC data)"; "Number N = 2.92 ± 0.05 (S = 1.2) (Direct measurement of invisible Z width)"
- Δm²₂₁ = (7.50 ± 0.19)×10⁻⁵ eV²
- Δm²₃₂ = (2.451 ± 0.026)×10⁻³ eV² (Normal order); (−2.527 ± 0.034)×10⁻³ eV² (S = 1.2) (Inverted order)
- sin²θ₁₂ = 0.307 ± 0.012
- sin²θ₁₃ = (2.16 ± 0.06)×10⁻² (S = 1.2)
- sin²θ₂₃ = 0.534 +0.015 −0.019 (Normal); 0.537 ± 0.020 (Inverted)
- δ_CP = 1.21 +0.19 −0.22 π rad

#### Gauge and Higgs bosons (rpp2025-sum-gauge-higgs-bosons.pdf)
| Particle | Quantum numbers | Mass | Width |
|---|---|---|---|
| γ | I(J^PC) = 0,1(1⁻⁻) | m < 1×10⁻¹⁸ eV; charge q < 1×10⁻⁴⁶ e (mixed charge), < 1×10⁻³⁵ e (single charge) | "Mean life τ = Stable" |
| g | I(J^P) = 0(1⁻), "SU(3) color octet" | "Mass m = 0 [a]". [a] = "Theoretical value. A mass as large as a few MeV may not be precluded." | — |
| W | J = 1, Charge = ±1 e | 80.3692 ± 0.0133 GeV [b]. [b] = "This value does not include the AALTONEN 22 measurement by CDF." | Γ = 2.14 ± 0.05 GeV (S = 1.7) |
| Z | J = 1, Charge = 0 | 91.1880 ± 0.0020 GeV [e] (Breit–Wigner resonance mass, see note [e]) | Γ = 2.4955 ± 0.0023 GeV |
| H | J = 0 | 125.20 ± 0.11 GeV (S = 1.4) | Γ = 3.7 +1.9 −1.4 MeV ("assumes equal on-shell and off-shell effective couplings") |

The same table also gives the W/Z mass ratio = 0.88136 ± 0.00015, m_Z − m_W = 10.818 ± 0.013 GeV, and a graviton (J = 2) limit of m < 1.76×10⁻²³ eV. The MC file rounds W to 8.0369E+01 ± 1.3E-02 GeV.

### 1B. "Three generations" / plain-language statements — US DOE (energy.gov)

**Licence.** https://www.energy.gov/web-policies, verbatim:
> "Government information at DOE websites is in the public domain. Public domain information may be freely distributed and copied, but it is requested that in any subsequent use the Department of Energy be given appropriate acknowledgement. When using DOE websites, you may encounter documents, illustrations, photographs or other information resources contributed or licensed by private individuals, companies or organizations that may be protected by U.S. and foreign copyright laws."

**Caveats**
- The **images** on these pages are third-party: "Image courtesy of Symmetry magazine, a joint Fermilab/SLAC publication. Artwork by Sandbox Studio, Chicago". The neutrino image is also Fermilab/Sandbox. **Do not reuse the images.**
- Some pages list non-federal contributors (Murayama of UC Berkeley/LBNL, Riesselmann and Harris of Fermilab). DOE publishes the text as government information, but it is not strictly a work written by federal employees. Cite it as "U.S. DOE Office of Science, DOE Explains…" with acknowledgement.

**Quotable sentences** (every page says "This was last updated March 11, 2026"):
- https://www.energy.gov/science/doe-explainsthe-standard-model-particle-physics
  - "The Standard Model of Particle Physics is scientists' current best theory to describe the most basic building blocks of the universe. It explains how particles called quarks (which make up protons and neutrons) and leptons (which include electrons) make up all known matter. It also explains how force carrying particles, which belong to a broader group of bosons, influence the quarks and leptons."
  - "The Standard Model explains three of the four fundamental forces that govern the universe: electromagnetism, the strong force, and the weak force. Electromagnetism is carried by photons … The strong force, which is carried by gluons, binds together atomic nuclei to make them stable. The weak force, carried by W and Z bosons, causes nuclear reactions that have powered our Sun and other stars for billions of years. The fourth fundamental force is gravity, which is not adequately explained by the Standard Model."
  - "All ordinary matter, including every atom on the periodic table of elements, consists of only three types of matter particles: up and down quarks, which make up the protons and neutrons in the nucleus, and electrons that surround the nucleus."
  - "Physicist J.J. Thomson discovered the electron in 1897, and scientists at the Large Hadron Collider found the final piece of the puzzle, the Higgs boson, in 2012."
- https://www.energy.gov/science/doe-explainsquarks-and-gluons
  - "There are six different kinds of quarks with a wide range of masses. They are named up, down, charm, strange, top, and bottom."
  - "Quarks are the only elementary particles to experience all the known forces of nature and to have a fractional electric charge."
  - "Gluons have no electric charge."
  - "The heaviest and last discovered quark was first observed at Fermilab in 1995."
- https://www.energy.gov/science/doe-explainsbosons-and-fermions
  - "Bosons are the fundamental particles that have spin in integer values (0, 1, 2, etc.). Fermions, on the other hand, have spin in odd half integer values (1/2, 3/2, and 5/2, but not 2/2 or 6/2)."
  - "Bosons include photons (light), gluons …, the Higgs boson, and the W and Z bosons. Fermions include protons, neutrons, electrons, neutrinos, and quarks."
  - "A class of bosons known as gauge bosons act as "force carriers" between particles. These include the photon (which carries the electromagnetic force), gluon (which carries the strong nuclear force), and W and Z bosons (which carry the weak nuclear force). The hypothetical graviton, which carries gravity, has not been found."
- https://www.energy.gov/science/doe-explainsneutrinos
  - "Scientists named the three types of neutrinos they have discovered so far for the other matter particle they interact with: the electron neutrino, muon neutrino, and tau neutrino."
  - "Neutrinos change between types as they travel, something scientists call neutrino oscillation."
- https://www.energy.gov/science/doe-explainsthe-higgs-boson
  - "The Higgs boson is the fundamental particle associated with the Higgs field, a field that gives mass to other fundamental particles such as electrons and quarks."
  - "The photon, which is the particle of light and carries the electromagnetic force, has no mass at all."
  - "Scientists confirmed its existence in 2012 through the ATLAS and CMS experiments at the Large Hadron Collider (LHC) at CERN in Switzerland."

**Limits of these sources**
- **None of the DOE pages uses the word "generation"**, so no explicit "three generations" sentence was found in a public-domain US government source. The doe-explainsleptons and doe-explainsbosons URLs return 404.
- Fallback: PDG states "Number N = 2.996 ± 0.007" light neutrino types (CC BY 4.0). The DOE neutrino page also names exactly three neutrino types.
- **Fermilab: blocked by a Cloudflare bot challenge, not fetched.** Note also that Fermilab is contractor-operated, so its pages would not automatically be US government works.

---

## 2. Gate 14.2 — Quantum lab (all read on page images)

### 2A. Schrödinger, *Collected Papers on Wave Mechanics* (Blackie, 1928)
- **archive.org id:** `in.ernet.dli.2015.220691` (Digital Library of India scan, Osmania University). Item page: https://archive.org/details/in.ernet.dli.2015.220691
- **Title page** (leaf n9, image checked): "COLLECTED PAPERS ON WAVE MECHANICS BY E. SCHRÖDINGER, PROFESSOR OF THEORETICAL PHYSICS AT THE UNIVERSITY OF BERLIN, TRANSLATED FROM THE SECOND GERMAN EDITION, BLACKIE & SON LIMITED, LONDON AND GLASGOW, 1928". The translators are not named on the title page.
- **Licence:** published in 1928, so **public domain in the US since 1 Jan 2024**. The archive.org metadata says "dc.rights: Not Available", with no licence asserted. This is not PD outside the US; the UK term runs on the author's and translator's life plus 70 years.
- **Printed page = leaf − 20** (p. 20 = n40).

**(a) Wave equation.** "Quantisation as a Problem of Proper Values (Part II)", printed p. 27, leaf **n47**:
- (18) div grad ψ − (1/u²) ψ̈ = 0, "valid for all processes which only depend on the time through a factor e^{2πiνt}."
- (18′) div grad ψ + (8π²/h²)(hν − V)ψ = 0
- **(18″) div grad ψ + (8π²/h²)(E − V)ψ = 0**

On p. 28 (n48): "…it turns out that equation (18) *carries within itself the quantum conditions*."

**Explicit 1-D form.** §3.1 "The Planck Oscillator. The Question of Degeneracy", p. 30, leaf **n50**:
- "Let the co-ordinate q be the displacement multiplied by the square root of the mass."
- (20) T‾ = ½q̇², T = ½p²
- (21) V(q) = 2π²ν₀²q², "where ν₀ is the proper frequency in the mechanical sense. Then equation (18) reads in this case"
- **(22) d²ψ/dq² + (8π²/h²)(E − 2π²ν₀²q²)ψ = 0.**

Because q is mass-weighted, the mass does not appear explicitly.

**(c) Harmonic oscillator energies.** p. 31, leaf **n51**:
- (23) a = 8π²E/h², b = 16π⁴ν₀²/h²
- (22′) d²ψ/dq² + (a − bq²)ψ = 0
- (24) x = q·b^{1/4}
- (25) a/√b = 1, 3, 5 … (2n+1) …
- (26) e^{−x²/2} H_n(x)
- (27) H_n(x) = (−1)ⁿ e^{x²} dⁿe^{−x²}/dxⁿ
- (27″) H₀ = 1, H₁ = 2x, H₂ = 4x² − 2, H₃ = 8x³ − 12x, H₄ = 16x⁴ − 48x² + 12
- **(25′) E_n = ((2n+1)/2) hν₀ ; n = 0, 1, 2, 3, …**

Quote: "Thus as quantum levels appear so-called "half-integral" multiples of the "quantum of energy" peculiar to the oscillator, i.e. the odd multiples of hν₀/2. The intervals between the levels, which alone are important for the radiation, are the same as in the former theory. It is remarkable that our quantum levels are exactly those of Heisenberg's theory."

**German originals.** archive.org also holds microfilm scans of *Annalen der Physik* 1926 (e.g. `sim_annalen-der-physik_1926_79_6`, `sim_annalen-der-physik_annalen-der-physik_1926_79`). These are US PD (1926). I located them but did not read them; the English Blackie edition covers the need.

### 2B. Particle in a box — N. F. Mott, *An Outline of Wave Mechanics* (Cambridge University Press, 1930)
- **archive.org id:** `outlineofwavemec0000nfmo` (University of Arizona Library scan; metadata has no access-restricted flag). Title page per OCR: "AN OUTLINE OF WAVE MECHANICS by N. F. MOTT, Lecturer in Theoretical Physics, The University, Manchester. CAMBRIDGE AT THE UNIVERSITY PRESS 1930". The title page was not viewed as an image.
- **Licence:** published 1930, so **US public domain since 1 Jan 2026**. Not PD in the UK (Mott died 1996).

**p. 59, leaf n70** (image checked), Section III "Normal modes of a de Broglie wave":
> "Let us consider an electron shut up in a box. … If l be the distance between the walls of the box, and λ the wave length of the waves, then λ = 2l/n, where n is an integer. Now, for de Broglie waves just as for any other waves, to every wave length there corresponds a frequency. In the last chapter* we found that this frequency was ν = h/2mλ². … with a definite series of frequencies, ν₁, ν₂, ν₃,…, where **ν_n = hn²/8ml² ……(4)**"

**p. 61, leaf n72** (image checked):
> "We found in the last chapter that a vibration of frequency ν describes the behaviour of an electron of energy hν. Therefore, if an electron in a box has energy equal to one of the particular values, hν_n, then its behaviour will be described by the wave function ψ_n."

and
> "(If the box is 1 cm. long, and the energy of the electron about 20 volts, the interval between successive energy levels is 3·2 × 10⁻⁷ volt.)"

→ **E_n = hν_n = n²h²/(8ml²)** follows directly from eq. (4) together with E = hν on p. 61. Cite both pages.

The 2-D statement "the energy is h²(l² + n²)/8ma²" appears on about p. 105–106. I found it in the OCR only and did not check it on an image.

**Rejected source.** Condon & Morse 1929, p. 44 (leaf n61), gives the 3-D box as W = (h²/8π²μ)[(n₁/a)² + (n₂/b)² + (n₃/c)²] with ψ = sin(2πn₁x/a)…. **This is internally inconsistent**: with that ψ, the energy would be h²n₁²/(2μa²). Do not use it.

### 2C. Barrier transmission / tunnelling

**(i) Gurney & Condon, "Wave Mechanics and Radioactive Disintegration", *Nature* 122, 439 (22 Sept 1928)**
- **DOI** 10.1038/122439a0, verified on Crossref: Nature vol. 122, issue 3073, p. 439–439, issued 1928-09-22, authors Ronald W. Gurney and Edw. U. Condon.
- **archive.org id:** `sim_nature-uk_1928-09-22_122_3073` (periodicals microfilm, not access-restricted). Printed p. 439 = **leaf n12** (image checked; p. 440 = n13).
- **Licence:** 1928, so **US public domain**.
- **Verbatim quotes** (checked on the image):
  - "…it is pointed out that disintegration is a natural consequence of the laws of quantum mechanics without any special hypothesis."
  - "If a ball be moving in a valley of potential energy and have not enough energy to get over a mountain on one side of the valley, it must certainly stay in the valley for all time, unless it acquire the deficiency in energy somehow. But this is not so on the quantum mechanics. It will always have a small but finite chance of slipping through the mountain and escaping from the valley."
  - "The rate of disintegration, that is, the probability of escape, depends on the amount of overlapping of the wave-functions in the regions DB and FH, and this is extremely sensitive to the height to which the potential curve at C rises above BDF. By varying this height through a small range we can obtain all periods of radioactive decay from a fraction of a second, through the 10⁹ years of uranium, to practical stability."
  - "Much has been written of the explosive violence with which the α-particle is hurled from its place in the nucleus. But from the process pictured above, one would rather say that the α-particle slips away almost unnoticed."
- The letter is signed "Palmer Physical Laboratory, Princeton University, July 30."
- The figure shows a nuclear radius scale of 10⁻¹¹ cm.
- **The letter has no formula. It is a qualitative source only.**

**(ii) Condon & Morse, *Quantum Mechanics* (McGraw-Hill, New York, 1929), §68 "Aperiodic phenomena" and §69 "Radioactive Disintegration"**
- **archive.org id:** `quantummechanics00cond` (University of British Columbia Library). **Licence:** 1929, so **US public domain since 1 Jan 2025**. **Printed page = leaf − 17** (p. 43 = n60).
- **p. 224, leaf n241:**
  - The 1-D equation with constant V: **d²ψ/dx² + (8π²μ/h²)(W − V)ψ = 0**
  - Its solution: **(68.1) ψ(W, x) = Ae^{ikx} + Be^{−ikx}, with k = (2π/h)√(2μ(W − V))**
  - Outside the barrier: k₀ = (2π/h)√(2μW)
  - Barrier: V(x) = 0 except V for 0 < x < a (Fig. 24)
- **p. 225, leaf n242:**
  - (68.2) A, B; (68.3) C, D
  - "The fraction transmitted is therefore 1/CC̄ and the fraction reflected is DD̄/CC̄."
  - For W > V: **(68.4) CC̄ = (1/16)[(1 + k/k₀)²(1 + k₀/k)² + (1 − k/k₀)²(1 − k₀/k)² + 2(1 + k/k₀)(1 − k/k₀)(1 + k₀/k)(1 − k₀/k) cos 2ka].**
  - I checked (68.4) numerically: it equals the standard 1/T = 1 + (k₀² − k²)² sin²(ka)/(4k₀²k²).
- **p. 226, leaf n243:**
  - For W < V ("on writing now ik for k"), the book prints: **(68.5) CC̄ = ½ + ⅛[(k₀/k − k/k₀)² + (1 + k₀²/k²)(1 + k²/k₀²) cosh 2ka].**
  - **WARNING: (68.5) as printed has a sign error.** Substituting k → iκ into (68.4) makes the first squared term enter with a **minus** sign. The correct form is ½ + ⅛[−(k₀/κ − κ/k₀)² + (1 + k₀²/κ²)(1 + κ²/k₀²) cosh 2κa], which equals 1 + ((k₀² + κ²)²/(4k₀²κ²)) sinh²(κa).
  - Numerical check (k₀ = 1, κ = 0.7, a = 1.3): exact 1/T = 2.22725; printed (68.5) = 2.35996; sign-corrected = 2.22725.
  - Recommendation: cite (68.4) with k → iκ (analytic continuation), or cite (68.5) with an explicit correction note.
  - Quotes from the same page: "If W < V, there is a finite probability of transmission which approaches zero as ka becomes large, because of the hyperbolic cosine term." "…the transmission probability is increased whenever ka = nπ, that is, whenever an integral number of half de Broglie wave lengths is contained in the distance a."
- **p. 228, leaf n245, §69:**
  - "By far, the most important application of the ideas of the preceding section is to the theory of the ejection of α-particles from the nuclei of the radioactive atoms. This application was worked out independently by Gurney and Condon and by Gamow…"
  - (69.1) R″(r) + (8π²μ/h²)(W − V(r))R = 0
  - Footnote references: Gurney and Condon, Phys. Rev. 33, 127 (1929); Gamow, Z. Phys. 51, 204 (1928).
- **p. 229, leaf n246:** a qualitative description of the inside/outside amplitudes (Figs. 27, 28).

**(iii) Mott 1930, pp. 79–81** (OCR only, not image-checked) gives a qualitative α-decay description and the Geiger–Nuttall law "log k = A + B log v".

---

## 3. Gate 14.3 — Nuclear physics

### 3A. Semi-empirical mass formula: J. Wing, ANL-6814 (1964)
- **Source:** J. Wing, *A Comparison of Nuclidic Mass Equations with Experimental Data*, Argonne National Laboratory report **ANL-6814** (Physics, TID-4500 28th Ed.), AEC Research and Development Report, January 1964. Argonne was "Operated by The University of Chicago under Contract W-31-109-eng-38 with the U.S. Atomic Energy Commission".
- **OSTI ID** 4064372; **DOI 10.2172/4064372**, verified on Crossref (publisher OSTI, type report, 1964-01-01).
- **URLs:** https://www.osti.gov/biblio/4064372; full text at https://www.osti.gov/servlets/purl/4064372 (88-page scanned PDF, saved as `p14a/anl6814.pdf`).
- **Licence:** this is an AEC-sponsored report by a contractor (U. Chicago/ANL) employee. It is released openly by DOE/OSTI with the standard disclaimer "This report was prepared as an account of work sponsored by an agency of the United States Government…". **Strictly, it is not a "work of the US Government" (17 USC 105) because the author was a contractor employee.** It is openly accessible. A 1964 publication would also need copyright notice and renewal to still be protected, and no copyright notice is visible on the title or disclaimer pages. Treat it as openly accessible and probably PD, and flag this nuance.
- **Pages used** (PDF page = printed page + 2; all read on images):
  - Printed p. 8 (PDF p. 10): definitions, including "I Neutron excess = N − Z = A − 2Z", "A … mass number A = N + Z", "B Binding energy of a nuclide." Printed p. 10 (PDF p. 12) says the equations are given "in either MeV or mmu (milli mass unit), in the physical scale of O¹⁶ = 16,000.000 mmu. The values of the parameters and coefficients are all taken from the original references."
  - **Printed p. 11 (PDF p. 13), formula:**
    > M(Z,N) = ZM_p + NM_n + E_v + E_a + E_s + E_c = ZM_p + NM_n − a_vA + a_aI²/A + a_sA^{2/3} + a_cZ²/A^{1/3},
    > "where a_v, a_a, a_s, and a_c are parameters. This is the simplified form of Weizsäcker's description presented by Bethe and Bacher (36BB) and is commonly known as the Bethe-Weizsäcker mass formula."
    Also on this page: "…the volume energy is proportional to A and the surface energy is proportional to A^{2/3}. If the protons are uniformly distributed within the nuclear sphere with a radius r₀A^{1/3}, then the Coulomb energy would be proportional to Z²/A^{1/3}." and "…the symmetry energy is proportional to I²/A."
  - **Table 1 "Values of the parameters in the Bethe-Weizsäcker's mass formula (in MeV)"**, printed p. 11. I read it on a zoomed image. M_n and M_p are given in MeV on the O¹⁶ scale (they are mass-excess-type numbers, not rest masses).

| Author(s) | Ref | M_n | M_p | a_v (Volume) | a_a (Symmetry) | a_s (Surface) | a_c (Coulomb) | P (Pairing) |
|---|---|---|---|---|---|---|---|---|
| Bethe and Bacher | 36BB | 7.868 | 7.514 | 13.860 | 19.50 | 13.20 | 0.580 | — |
| Bohr and Wheeler | 39BW | | | | Table | 14 | 0.59 | Table |
| Mattauch and Flügge | 46MF | 8.329 | 7.571 | 14.66 | 20.54 | 15.4 | 0.602 | |
| Fermi | 46F,50F | 8.315 | 7.564 | 14.00 | 19.3 | 13.0 | 0.583 | 33.5/A^{3/4} |
| Goodman | 47G | | | 13.97 | 19.32 | 13.0 | 0.645 | |
| Feenberg^a | 47F | 8.306 | 7.570 | 14.0 | 18.10 | 13.10 | 0.584 | Graph |
| Albada | 47A | | | 14.2 | 20.75 | 15.0 | 0.63 | |
| Fowler^a | 47FH | 8.315 | 7.572 | 15.30 | 22.55 | 16.75 | 0.690 | |
| Rosenfeld^b | 48R | | | 14.66 | 20.54 | 15.4 | 0.602 | |
| Friedlander and Kennedy^a | 49FK | 8.364 | 7.582 | 14.1 | 18.1 | 13.1 | 0.585 | 132/A |
| Pryce | 50P | 8.315 | 7.564 | 14.05 | 19.6 | 14.0 | 0.61 | |
| Metropolis and Reitwiesner | 50MR | 8.364 | 7.582 | 14.044 | 19.31 | 13.0 | 0.583 | 33.5/A^{3/4} |
| Green and Engler | 53GE | 8.364 | 7.582 | 15.569 | 23.28 | 17.226 | 0.698 | 10/A^{1/2} |
| **Green** | 54G,55G | 8.364 | 7.582 | **15.753** | **23.69** | **17.804** | **0.710** | **12/A^{1/2}** |
| Bussetti^a | 55B | 8.370 | 7.585 | 14.838 | 19.439 | 12.733 | 0.627 | 36/A^{3/4} |
| Evans | 55E | 8.364 | 7.582 | 14.1 ± 0.2 | 19.0 ± 0.9 | 13 ± 1 | 0.595 ± 0.02 | Graph |
| Kumar and Preston | 55KP | | | 15.73 | 23.28 | 18.11 | 0.70 | Table |
| Tsen^c | 57T | 8.366 | 7.585 | 14.672 | 17.177 | 14.629 | 0.484 | |
| Wapstra | 58W | 8.367 | 7.584 | 15.835 | 23.20 | 18.33 | 0.714 | 11.2/A^{1/2} |
| Ayres et al. | 62AH | 8.367 | 7.585 | 14.75 | 15.1–19.3 | 14.8–16.0 | 0.63–0.645 | Graph |
| Dutta et al. | 62DP | | | 15.568 | 22.547 | 17.231 | 0.699 | |

Table footnotes:
- ^a "Coulomb energy proportional to Z(Z − 1) instead of to Z²."
- ^b "Same as Mattauch and Flügge (46MF)."
- ^c "Coulomb energy proportional to Z^{5/3} instead of to Z²/A^{1/3}."

The reference list (OCR) gives 36BB = H. A. Bethe and R. F. Bacher, Revs. Mod. Phys. 8, 82 (1936), and 54G = A. E. S. Green, Phys. Rev. 95, 1006 (1954).

**Suggestion:** use the Green (54G) row. Its coefficients are a_v = 15.753, a_a = 23.69 (with I = N − Z), a_s = 17.804, a_c = 0.710 MeV, and pairing 12/A^{1/2}. The pairing sign convention is not stated in Table 1; it needs the original or another page of the report. Note also that Table 1 is in the M(Z,N) form, so **B = ZM_p + NM_n − M** gives a_vA − a_sA^{2/3} − a_cZ²/A^{1/3} − a_aI²/A.

Not obtained:
- Weizsäcker 1935 (Z. Phys. 96, 431) was not found on archive.org (no 1935 volume in search results). It is not US PD anyway.
- Bethe & Bacher 1936 is APS and not openly licensed, so I did not fetch it.

### 3B. pp chain and CNO cycle

**(i) PDG RPP 2025, Review "14. Neutrino Masses, Mixing, and Oscillations"** (revised Aug 2025 by M.C. Gonzalez-Garcia and R. Wendell), §14.6.1.1 "Solar neutrino flux", p. 15. **CC BY 4.0**. URL: https://pdg.lbl.gov/2025/reviews/rpp2025-rev-neutrino-mixing.pdf (born-digital; text extracted). Verbatim:
> "Electron neutrinos are produced in the Sun in thermonuclear reactions that generate solar energy. These reactions occur via two main chains, the pp chain and the CNO cycle. The pp chain includes the reactions p + p → d + e⁺ + ν (pp), p + e⁻ + p → d + ν (pep), ³He + p → ⁴He + e⁺ + ν (hep), ⁷Be + e⁻ → ⁷Li + ν(+γ) (⁷Be), and ⁸B → ⁸Be* + e⁺ + ν (⁸B). These reactions result in the overall fusion of four protons into a ⁴He nucleus, 4p → ⁴He + 2e⁺ + 2ν_e, where the energy released in the reaction, Q = 4m_p − m_⁴He − 2m_e ∼ 26 MeV, is mostly radiated by photons and only a small fraction is carried by the neutrinos, ⟨E_2νe⟩ = 0.59 MeV. Neutrinos from the CNO cycle are produced via the ¹³N → ¹³C + e⁺ + ν (¹³N), ¹⁵O → ¹⁵N + e⁺ + ν (¹⁵O), and ¹⁷F → ¹⁷O + e⁺ + ν (¹⁷F) reactions. … In the absence of oscillations, the pp solar neutrino flux arriving at Earth is about 6 × 10¹⁰ cm⁻² s⁻¹."

Citation: same as the Review (S. Navas et al. (PDG), Phys. Rev. D 110, 030001 (2024) and 2025 update).

**(ii) NASA Marshall Solar Physics, "The Solar Interior"**, https://solarscience.msfc.nasa.gov/interior.shtml. **US government work (NASA), PD.** Verbatim:
> "In stars like the Sun the nuclear burning takes place through a three step process called the proton-proton or pp chain. In the first step two protons collide to produce deuterium, a positron, and a neutrino. In the second step a proton collides with the deuterium to produce a helium-3 nucleus and a gamma ray. In the third step two helium-3s collide to produce a normal helium-4 nucleus with the release of two protons."

It also says: "The temperature at the very center of the Sun is about 15,000,000° C (27,000,000° F) and the density is about 150 g/cm³ … The nuclear burning is almost completely shut off beyond the outer edge of the core (about 25% of the distance to the surface or 175,000 km from the center)."

**What is still missing**
- **Per-step energy releases (e.g. 1.442 MeV, 5.493 MeV, 12.860 MeV) and the full CNO-cycle reaction list with Q values were NOT found in an open source.**
- Bethe 1939 (Phys. Rev. 55, 434) is APS and not openly licensed. The archive.org item `energy-production-in-stars-hans-bethe-1938` looks like a user upload of the APS paper with no licence, so **I did not use it**.
- Recommendation: compute each step's Q value from the NUBASE2020/AME mass excesses the app already bundles (Q = Σ mass excess in − Σ out, counting e⁺ annihilation explicitly) and cite AME/NUBASE for the numbers. Use PDG for the reaction list (pp chain + CNO neutrino reactions) and the ~26 MeV total.
- The full six-step CNO cycle (¹²C(p,γ)¹³N … ¹⁵N(p,α)¹²C) still needs an open textual source.

### 3C. Uranium-238 decay chain (US government)

**(i) USGS Open-File Report 2004-1050**
- **Source:** J. S. Duval, L. E. Fukumoto, J. M. Fukumoto, S. L. Snyder, *Geology and Indoor Radon in Schools of the Palos Verdes Peninsula Unified School District, Palos Verdes Peninsula, California*, U.S. Geological Survey Open-File Report 2004-1050.
- **Page:** "Uranium", https://pubs.usgs.gov/of/2004/1050/uranium.htm; figure https://pubs.usgs.gov/of/2004/1050/U-238-Decay-Chain.gif (saved as `p14a/usgs_u238.png`).
- **Licence:** USGS policy (https://www.usgs.gov/information-policies-and-instructions/copyrights-and-credits) says verbatim: "USGS-authored or produced data and information are considered to be in the U.S. Public Domain." Caveats:
  - Two co-authors are non-USGS (a high-school teacher and a consultant).
  - The report says "This report is preliminary and has not been reviewed for conformity with the U.S. Geological Survey editorial standards."
- **Text quote:** "The radioactive decay series of ²³⁸U is complex and produces alpha, beta, and gamma radiation. The figure below shows the important isotopes in the decay series, indicates whether the primary decay mode is via alpha or beta emission, and gives the half-life." Also: "The percentage abundance of ²³⁸U is 99.25 percent and the abundance of ²³⁵U is 0.75 percent."
- **Chain in the figure** ("The Uranium-238 Decay Chain"; "Only main decays are shown / Gamma emitters are not indicated"), read on the image:
  - U-238 (4.5×10⁹ a) →α Th-234 (24.1 d)
  - Th-234 →β Pa-234 (1.17 m)
  - Pa-234 →β U-234 (2.4×10⁵ a)
  - U-234 →α Th-230 (7.7×10⁴ a)
  - Th-230 →α Ra-226 (1600 a)
  - Ra-226 →α Rn-222 (3.82 d)
  - Rn-222 →α Po-218 (3.05 m)
  - Po-218 →α Pb-214 (26.8 m)
  - Pb-214 →β Bi-214 (19.9 m)
  - Bi-214 →β Po-214 (1.64×10⁻⁴ s)
  - Po-214 →α Pb-210 (22.3 a)
  - Pb-210 →β Bi-210 (5.0 d)
  - Bi-210 →β Po-210 (138.4 d)
  - Po-210 →α Pb-206 (Stable)
  - **That is 14 decays (8 α, 6 β).**
- Notes:
  - The 1.17 m half-life is that of the metastable Pa-234m, but the figure labels it "Pa-234".
  - Minor branches (At-218, Tl-210, etc.) are omitted.
  - The figure's half-lives are rounded. The app should keep its NUBASE2020 half-lives and use this figure only for membership and order.

**(ii) EPA, "Radioactive Decay"**, https://www.epa.gov/radiation/radioactive-decay
- **Licence:** US government work, PD. The EPA disclaimers page notes that individual documents may differ.
- The same USGS U-238 figure is reproduced, captioned "Source: Uranium - U.S. Geological Survey (USGS)" and linked to the page above.
- Glossary text: "decay chain: The series of decays or transformations that radionuclides go through before reaching a stable form. For example, the decay chain that begins with Uranium-238 culminates in Lead-206, after forming intermediates such as Uranium-234, Thorium-230, Radium-226, and Radon-222. Also called the "decay series.""
- "The majority of radionuclides only decay once before becoming stable. Those that decay in more than one step are called series radionuclides."
- **Use caution with the companion EPA uranium page** (https://www.epa.gov/radiation/radionuclide-basics-uranium). It lists "Uranium-238: 4.47 billion years; Uranium-235: 700 million years; Uranium-234: 244,000 years", which are rounded values.

---

## 4. NOT FOUND / not usable

1. **A public-domain US government sentence that explicitly says "three generations"** of quarks and leptons. The DOE pages never use "generation", and the doe-explainsleptons and doe-explainsbosons URLs are 404. **Fermilab (fnal.gov) is behind a Cloudflare bot challenge**, so I did not fetch it.
2. **Gamow 1928, Z. Phys. 51, 204:** no archive.org copy of Z. Phys. vol. 51 found.
3. **Gurney & Condon, Phys. Rev. 33, 127 (1929):** APS and not openly licensed, so I did not fetch it. The Nature 1928 letter (found, PD) is qualitative only.
4. **Weizsäcker 1935, Z. Phys. 96, 431:** not on archive.org. Bethe & Bacher 1936 (Rev. Mod. Phys.) is APS and was not fetched. The SEMF is covered instead by ANL-6814 (OSTI).
5. **Bethe 1939, "Energy production in stars":** no open/licensed copy. The archive.org upload has an unclear licence and was not used.
6. **Per-reaction Q values for the pp chain and CNO cycle, and the full CNO six-step list**, from an open accredited source. Only the ~26 MeV total (PDG) and the reaction list for the neutrino-producing steps were found. Suggested fix: compute from the bundled AME/NUBASE mass excesses.
7. **A clean textbook 1-D box formula E_n = n²h²/(8mL²) printed as an energy.** Mott 1930 prints ν_n = hn²/8ml² (eq. 4) and states E = hν two pages later. Condon & Morse 1929 p. 44 prints an inconsistent 3-D formula; do not use it.
8. **The ANL-6814 pairing-term sign convention** (Table 1 gives magnitudes only).

## 5. Errata found in primary sources (do not quote blindly)
- **Condon & Morse 1929, eq. (68.5), p. 226 (leaf n243):** the first bracketed term should be subtracted, not added. I confirmed this numerically against the exact rectangular-barrier transmission.
- **Condon & Morse 1929, p. 44 (leaf n61):** the box-energy formula is inconsistent with the eigenfunction printed beside it.
