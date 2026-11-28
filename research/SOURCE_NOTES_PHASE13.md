# Source notes — Phase 13 (Waves, Life & Imaging)

Research agents, 2026-11-28. robots.txt checked per host. Verbatim notes follow; equations and numbers used are re-checked by hand on page images.

## A. Vision, hearing, ECG (gates 13.1–13.3)

# Phase 13 (gates 13.1-13.3) research notes — agent A
Date: 2026-11-28

## Robots per host (fetched separately before any page)
- http://www.cvrl.org/robots.txt (https fails; http 200): `User-agent: *` Disallow only /images/ /jpgraph/ /jpgraph_cache/ /php development/ /png images/ /SpryAssets/ /webinator/ -> content + data pages ALLOWED. No ClaudeBot/anthropic entries. No crawl-delay.
- https://www.nei.nih.gov/robots.txt 200: `User-agent: *` standard Drupal disallows (/core/, /admin/, /node/, */search, ...). /eye-health-information/... ALLOWED.
- https://www.nidcd.nih.gov/robots.txt 200: same Drupal template + /cgi-bin/search/. /health/... ALLOWED.
- https://www.nhlbi.nih.gov/robots.txt 200: Drupal template + /node/*, /resources?*, /news?* ... /health/... ALLOWED.
- https://archive.org/robots.txt 200: `User-agent: *` Disallow /control/ /report/ only. ALLOWED.

## A. Vision
### CVRL (Colour & Vision Research Laboratory, UCL; A. Stockman) — http://www.cvrl.org/
Terms (verbatim, http://www.cvrl.org/main.php footer): "The information and data on this website are provided free of charge as a service to the vision science community. They were believed to be correct at the time of posting. Their use and any consequences arising from their use are the sole responsibility of the user." + "Copyright © 1995-2026 Color and Vision Research Labs".
-> No explicit licence/redistribution grant found (checked main.php, databaseintro.htm, background.htm, misc.htm). Redistribution of the tables is NOT explicitly permitted; safest: cite and quote peak values, or link to data rather than bundle; ask a.stockman@ucl.ac.uk if bundling tables.
Values read from CVRL data files (downloaded via the site's own form endpoints, http://www.cvrl.org/offercsvlum.php and conerequest_ss2.php; computed max by me):
- Stockman & Sharpe (2000) 2-deg cone fundamentals (CVRL "2-deg fundamentals based on the Stiles & Burch 10-deg CMFs (adjusted to 2-deg)", info page http://www.cvrl.org/database/text/cones/ss2_10.htm), 1-nm:
  - QUANTAL units (log, peak 0): L peak 566 nm, M peak 541 nm, S peak 441 nm.
  - ENERGY units (linear): L 570 nm, M 543 nm, S 442 nm.  (Note the unit dependence; quote quantal peaks for "photoreceptor sensitivity".)
  - Info page verbatim: "The functions are normalized to peak at unity at the nearest 0.1 nm step." "The 0.1 and 1 nm functions were obtained by the interpolation of the 5 nm functions using the cubic spline method." "Stockman, Sharpe & Fach (1999) were unable to measure S-cone spectral sensitivity data after 615 nm, after which S(λ) is so small that it can reasonably, for most purposes, be set to zero."
  - Ref: Stockman, A., & Sharpe, L. T. (2000). Vision Research 40(13), 1711-1737. DOI 10.1016/S0042-6989(00)00021-3 verified on Crossref (title "The spectral sensitivities of the middle- and long-wavelength-sensitive cones derived from measurements in observers of known genotype"); Crossref lists vor licence https://www.elsevier.com/open-access/userlicense/1.0/ from 2013-07-18 (Elsevier open archive = free to read, not CC). Article itself NOT fetched.
- CIE 1924 photopic V(λ) (CVRL info http://www.cvrl.org/database/text/lum/vl.htm; file vl1924e.csv 5 nm, vl1924e_1.csv 1 nm, 360-830 nm): peak = 1.0 at 555 nm (5-nm: 550 0.99495, 555 1.0, 560 0.995).
  Info page verbatim: "From Wyszecki and Stiles (1982), Table I(3.3.1)." "The function seriously underestimates sensitivity at short wavelengths."
- CIE 1951 scotopic V'(λ) (info http://www.cvrl.org/database/text/lum/scvl.htm; scvle.csv 5 nm, scvle_1.csv 1 nm 380-780): 5-nm table 505 nm 0.998, 510 nm 0.997; 1-nm table max 1.0 at 506 nm. (507 nm is NOT the tabulated 1-nm maximum in CVRL's file; it is 506 in CVRL's interpolated 1-nm file; 5-nm data peak between 505 and 510.)
  Info page verbatim: "From Wyszecki & Stiles (1982), Table I(4.3.2). The standard scotopic luminosity function or V'(λ), which was adopted by the CIE in 1951 (CIE, 1951), is based on measurements by Wald (1945) and by Crawford (1949), and is considered to represent observers under the age of 30."
- CVRL 2006 "physiologically-relevant" 2-deg V(λ) (lumrequest_2.php, energy linear 1 nm): max 0.999993 at 556 nm.
- NIST: not checked (CVRL suffices).

### NEI (National Eye Institute) — public domain
Copyright policy verbatim (https://www.nei.nih.gov/web-policies/copyright-policy, last updated May 27, 2022): "Unless otherwise noted, information on the National Eye Institute website is in the public domain. Public domain information may be freely distributed and copied, but, as a courtesy, we request that the National Eye Institute be given an appropriate acknowledgement: “Courtesy: National Eye Institute, National Institutes of Health (NEI/NIH).”" ... "Most text appearing on NEI web pages was prepared by employees of the United States Government and therefore is not subject to copyright." Graphics: "these graphics should not be reused without permission" (outside NEI Photos and Images catalog).
"How the Eyes Work" (https://www.nei.nih.gov/eye-health-information/healthy-vision/how-eyes-work ; redirected from /learn-about-eye-health/...; Last updated: April 20, 2022) verbatim:
 "First, light passes through the cornea (the clear front layer of the eye). The cornea is shaped like a dome and bends light to help the eye focus."
 "Some of this light enters the eye through an opening called the pupil (PYOO-pul). The iris (the colored part of the eye) controls how much light the pupil lets in."
 "Next, light passes through the lens (a clear inner part of the eye). The lens works together with the cornea to focus light correctly on the retina."
 "When light hits the retina (a light-sensitive layer of tissue at the back of the eye), special cells called photoreceptors turn the light into electrical signals."
 "These electrical signals travel from the retina through the optic nerve to the brain. Then the brain turns the signals into the images you see."
 -> NO rod/cone counts, NO pupil diameter on this page.
NEI research news (https://www.nei.nih.gov/research-and-training/research-news/nih-vision-scientists-test-theory-how-rods-our-retina-originated) verbatim quote of Anand Swaroop: "our retinas are predominantly made up of rods; only 5 percent of the retina’s photoreceptors are cones,"

### Reduced/schematic eye + pupil — Helmholtz's Treatise on Physiological Optics, Vol. 1 (Southall ed./transl., Optical Society of America, 1924)
archive.org id: helmholtzs-treatise-on-physiological-optics-vol-1 (metadata: date 1924, licenseurl https://creativecommons.org/publicdomain/mark/1.0/ , collection "opensource", user upload 2025-06-28, no access-restricted-item). Scan watermark on every page: "Generated at University of California, Berkeley on 2025-06-28 ... https://hdl.handle.net/2027/mdp.39015067341399 / Public Domain, Google-digitized / http://www.hathitrust.org/access_use#pd-google", "Digitized by Google", "Original from UNIVERSITY OF MICHIGAN". => HathiTrust pd-google scan re-uploaded to IA. Text is US public domain (published 1924, US copyright expired). Caveat: HathiTrust's pd-google terms ask for non-commercial use of the Google-digitized files; quoting text/values is fine, avoid redistributing the page images in a commercial context.
Page images READ (not OCR): leaves n127-n129 (pp. 94-96), n211 (p.178), n229 (p.196), n388 (p.355). URLs https://archive.org/download/helmholtzs-treatise-on-physiological-optics-vol-1/page/n128_w1200.jpg etc. Saved /tmp/vv-research/p13a/helm1_n*.jpg.
- p.95 (§10 Optical System of the Eye, leaf n128), Listing's schematic eye, verbatim list: "The data assumed by LISTING are as follows: 1. Index of refraction of air ... 1  2. Index of refraction of aqueous humor ... 103/77  3. Index of refraction of crystalline lens ... 16/11  4. Index of refraction of vitreous humor ... 103/77  5. Radius of curvature of cornea ... 8 mm  6. Radius of curvature of anterior surface of lens ... 10 "  7. Radius of curvature of posterior surface of lens ... 6 "  8. Distance between anterior surfaces of cornea and lens .. 4 "  9. Thickness of lens ... 4 "".
  "4. Accordingly, the first focal length of the eye is 15.0072 mm, and the second focal length is 20.0746 mm."
  "1. The first focal point is located 12.8326 mm in front of the cornea, and the second focal point 14.6470 mm beyond the posterior surface of the lens."
  (Inference, mine: 103/77 = 1.33766.)
- p.95-96 (leaves n128-n129), reduced eye verbatim: "Thus is obtained a still simpler optical model, which LISTING calls the reduced eye. The double principal point of this eye is 2.3448 mm beyond the anterior surface of the cornea, and the nodal point (κ in Fig. 44) is 0.4764 mm in front of the posterior surface of the lens, the focal points being unchanged. The optical behaviour of this reduced eye is equivalent to that of a single spherical refracting surface whose centre and vertex are at the nodal point and principal point, respectively, the first medium being air and the second medium the aqueous or vitreous humor. The radius of curvature of such a surface would be 5.1248 mm."
  Footnote p.96: "LISTING's reduced eye is very similar to the "simplified eye" imagined by HUYGENS in the first part of his Dioptrica (1652). (J. P. C. S.)"
  (Caution: these Listing numbers do not combine into a self-consistent single-surface model by simple arithmetic (e.g. n·r/(n−1) with n=103/77, r=5.1248 gives 20.30 mm, not 20.0746). Quote the stated values; do not derive new ones.)
- p.178 (leaf n211) verbatim: "Taking 4 mm, the mean pupillary diameter in normal eyes, as the length of b1b2, ..." and p.174 (OCR, page image not read): "The radius of the refracting surface of the reduced eye is 5.1248 mm; and hence the second focal lengths will be found to be 20.574 mm (for red light) and 20.140 mm (for violet light.)" [p.178 image confirms fr=20.574 mm, fv=20.140 mm]. Context p.178: "LISTING's reduced eye with water for the refracting medium".
- p.196 (leaf n229) verbatim: "the diameter of the central bright circle is δ = 2.440 lr/d." "If we put l = 0.0005 mm (as representing the average value of a wavelength of light) and r = 20 mm for the eye, the above formula becomes: δ = 0.0244 · 1/d, where the magnitudes are all expressed in millimetres. For the minimum diameter of the pupil (d = 2 mm), δ = 0.0122 mm. A blur circle of this size on the retina corresponds to a visual angle of 2'6","
- p.355 (leaf n388; Gullstrand appendix, "II. 3. The Optical System of the Eye") verbatim: "A reduced eye corresponding to the exact schematic eye and having an index of refraction of 4/3 would have a radius of curvature of 5.7 mm."
- OCR only (p. ~?, line 27725 of djvu txt, image NOT read): "For f=20 mm and n=4/3 (as in DONDERS' reduced eye)".
- Pupil MAXIMUM diameter: NOT FOUND (in Helmholtz vol 1 or NEI). Rod/cone counts (120 M / 6 M): NOT FOUND in allowed sources checked.

## B. Hearing
### NIDCD — public domain
Policy verbatim (https://www.nidcd.nih.gov/policies, "Copyright Policy", Last Updated Date: February 6, 2025): "Unless otherwise stated, the information on this site is not copyrighted and is in the public domain. It is free for the public to use, copy, and distribute. You may encounter documents that were sponsored along with private companies or other organizations. Those documents will have statements that protect them under U.S. and foreign copyright laws."
"How Do We Hear?" (https://www.nidcd.nih.gov/health/how-do-we-hear ; NIDCD; dated "May 2015"; Last Updated Date: March 16, 2022) verbatim:
 "Hearing depends on a series of complex steps that change sound waves in the air into electrical signals. Our auditory nerve then carries these signals to the brain."
 "Sound waves enter the outer ear and travel through a narrow passageway called the ear canal, which leads to the eardrum."
 "The eardrum vibrates from the incoming sound waves and sends these vibrations to three tiny bones in the middle ear. These bones are called the malleus, incus, and stapes."
 "The bones in the middle ear amplify, or increase, the sound vibrations and send them to the cochlea, a snail-shaped structure filled with fluid, in the inner ear. An elastic partition runs from the beginning to the end of the cochlea, splitting it into an upper and lower part. This partition is called the basilar membrane because it serves as the base, or ground floor, on which key hearing structures sit."
 "Once the vibrations cause the fluid inside the cochlea to ripple, a traveling wave forms along the basilar membrane. Hair cells—sensory cells sitting on top of the basilar membrane—ride the wave. Hair cells near the wide end of the snail-shaped cochlea detect higher-pitched sounds, such as an infant crying. Those closer to the center detect lower-pitched sounds, such as a large dog barking."
 "As the hair cells move up and down, microscopic hair-like projections (known as stereocilia) that perch on top of the hair cells bump against an overlying structure and bend. Bending causes pore-like channels, which are at the tips of the stereocilia, to open up. When that happens, chemicals rush into the cells, creating an electrical signal."
 "The auditory nerve carries this electrical signal to the brain, which turns it into a sound that we recognize and understand."
 (Figure on page credited "Source: NIH/NIDCD".)
"Noise-Induced Hearing Loss" (https://www.nidcd.nih.gov/health/noise-induced-hearing-loss) verbatim: "Sound is measured in units called decibels. Sounds at or below 70 A-weighted decibels (dBA), even after long exposure, are unlikely to cause hearing loss. However, long or repeated exposure to sounds at or above 85 dBA can cause hearing loss." Table: "Normal conversation 60-70 dBA; Movie theater 74-104 dBA; Motorcyles and dirt bikes 80-110 dBA; Music through headphones at maximum volume, sporting events, and concerts 94-110 dBA; Sirens 110-129 dBA; Fireworks show 140-160 dBA". Also: "Unlike bird and amphibian hair cells, human hair cells don’t grow back." (Stereocilia photo credited "Source: Yoshiyuki Kawashima" — not NIDCD, do not reuse image.)
NOT FOUND on NIDCD (checked how-do-we-hear, NIHL, age-related, cochlear-implants, tinnitus, policies): 20 Hz–20 kHz range; cochlea length; hair-cell count.

### Fletcher & Munson (1933) — OPENLY READABLE (BSTJ reprint)
DOI 10.1121/1.1915637 verified on Crossref: "Loudness, Its Definition, Measurement and Calculation", J. Acoust. Soc. Am. 5(2), 82-108, 1933-10 (Fletcher, Munson). JASA version not fetched.
Reprint: Bell System Technical Journal 12(4), Oct 1933, pp. 377-430; archive.org id bstj12-4-377 (collection bstj-archives; no licence field; no access restriction). First page footnote (OCR): "* Jour. Acous. Soc. Amer., October, [1933]". Copyright status of BSTJ 1933 NOT verified (no rights statement in metadata) — cite and quote, don't reproduce the figure without checking.
Page images READ (leaf n3 = p.380, n4 = p.381, n17 = p.394; https://archive.org/download/bstj12-4-377/page/n3_w1200.jpg etc.; saved p13a/bstj_n*.jpg):
 p.380: "A plane or spherical sound wave having only a single frequency of 1,000 cycles per second shall be used as the reference for loudness comparisons." / "The loudness level of any sound shall be the intensity level of the equally loud reference tone at the position where the listener's head is to be placed." / reason (4): "its range of auditory intensities (from the threshold of hearing to the threshold of feeling) is as large and usually larger than for any other type of sound, and (5) its frequency is in the mid-range of audible frequencies."
 p.381: "an intensity of the reference tone in air of 10^-16 watts per square centimeter was chosen as the reference intensity" ... "this reference level is 100 db below one microwatt per square centimeter." Eq. (3): "β_r = L = 10 log J_r + 100, where J_r is its sound intensity in microwatts per square centimeter." Eq. (4): "β = 10 log J + 100". "With the reference levels adopted here, all values of loudness level which are positive indicate a sound which can be heard by the reference observer and those which are negative indicate a sound which cannot be heard by such an observer."
 p.394: Fig. 4 "Loudness level contours." (x: FREQUENCY IN CYCLES PER SECOND, axis labelled 20 ... 10 000, plotted to ~20 000; y: INTENSITY LEVEL-DB 0-120; contours 0-120, top marked "FEELING"). Text: "It is interesting to note that through a large part of the practical range for tones of frequencies from 300 c.p.s. to 4000 c.p.s. the loudness level is approximately equal to the intensity level." "On Fig. 4 the 120-db loudness level contour has been marked "Feeling.""
 p.387 (OCR only): "Each voltage level in Table I is the median of 297 observations representing the combined results of eleven observers."

### Greenwood
- 1990 DOI 10.1121/1.399052 verified on Crossref (JASA 87(6) 2592-2605, no licence listed -> paywalled AIP/ASA). Not openly readable; not fetched.
- 1961 DOI 10.1121/1.1908437 verified (JASA 33(10) 1344-1356, "Critical Bandwidth and the Frequency Coordinates of the Basilar Membrane"); no open copy found on archive.org (advancedsearch "greenwood AND cochlear": 0 hits).
- F = A(10^{ax} − k) with A=165.4, a=0.06/2.1, k=0.88: NOT FOUND in an allowed source.

## C. Bioelectricity / ECG
### NHLBI — "Heart Tests" (the separate /health/heart-tests/electrocardiogram URL returns 404)
URL https://www.nhlbi.nih.gov/health/heart-tests (section "Electrocardiogram"; "Last updated on March 24, 2022"). Verbatim:
 "An electrocardiogram, also called an ECG or EKG, is a simple, painless test that detects and records your heart’s electrical activity. An EKG can show how fast your heart is beating, whether the rhythm of your heartbeats is steady or irregular, and the strength and timing of the electrical impulses passing through each part of your heart."
 "For the test, you will lie still on a table. A nurse or technician will attach several electrodes to the skin on your chest, arms, and legs. ... The electrodes are connected by wires to a machine that records your heart’s electrical activity on graph paper or on a computer."
 "An EKG has no serious risks. EKGs don’t give off electrical charges such as shocks."
Reuse: no explicit NHLBI copyright/public-domain statement found (checked /about/contact/website-privacy-and-accessibility; copyright URL guesses 404). INFERENCE: text by federal employees is not copyrightable (17 U.S.C. §105), same as NEI/NIDCD statements; some images are credited to individuals (e.g., cardiac MRI image "courtesy of W. Patricia Bandettini, MD") — don't reuse images.
P–QRS–T description and normal intervals (PR 0.12–0.20 s; QRS < 0.12 s): NOT FOUND on NHLBI page or other allowed sources checked.

### Waller (1887) — first human ECG
"A Demonstration on Man of Electromotive Changes accompanying the Heart's Beat", J. Physiol. 8(5):229-234, Oct 1887; DOI 10.1113/jphysiol.1887.sp000257 (verified on Crossref by bibliographic query). Author: Augustus D. Waller, M.D.
archive.org id sim_journal-of-physiology_the-journal-of-physiology_1887_8 (collections pub_journal-of-physiology, sim_microfilm, periodicals; no access restriction; no licence field; 1887 work = public domain by age). Page image READ: leaf n252 = p.229 (https://archive.org/download/sim_journal-of-physiology_the-journal-of-physiology_1887_8/page/n252_w1200.jpg ; saved p13a/jp8_n252.jpg). Verbatim p.229:
 "IF a pair of electrodes (zinc covered by chamois leather and moistened with brine) are strapped to the front and back of the chest, and connected with a Lippmann's capillary electrometer, the mercury in the latter will be seen to move slightly but sharply at each beat of the heart. If the movements of the column of mercury are photographed on a travelling plate simultaneously with those of an ordinary cardiographic lever a record is obtained as under (fig. 1) in which the upper line h.h. indicates the heart's movements and the lower line e.e. the level of the mercury in the capillary. Each beat of the heart is seen to be accompanied by an electrical variation."
 Fig. 1 caption: "FIG. 1. Man. Heart led off to electrometer from front and back of chest (front to Hg; back to H2SO4). e.e. electrometer. h.h. cardiograph. t.t. time in seconds."
 p.230 (OCR only, image not read): "It shews that the electrical phenomenon begins a little before the cardiographic lever begins to rise. The difference of time is however very small, only about ·025", and this amount must further be diminished by ·01" which represents the "lost time" of the cardiograph. The actual difference is thus no greater than ·015","

### Einthoven (1912) — leads and the lead relation (Einthoven's triangle)
"The different forms of the human electrocardiogram and their signification", The Lancet 179 (1912, March 30), 853-861; DOI 10.1016/s0140-6736(00)50560-1 (verified Crossref). Author: Prof. Wilhelm (Willem) Einthoven, M.D., Leiden.
archive.org id sim_the-lancet_1912-03-30_182_4622 (IA labels it "Vol 182 Iss 4622"; collections pub_the-lancet, sim_microfilm, periodicals; no access restriction; 1912 = public domain by age). Page images READ: leaf n11 = p.854, leaf n16 = p.859 (https://archive.org/download/sim_the-lancet_1912-03-30_182_4622/page/n11_w1200.jpg ; saved p13a/l12_n11.jpg, l12_n16.jpg).
 p.854 verbatim: "It is desirable to apply three leads in electrocardiographic investigations: (1) from the two hands, across the body; (2) from the right hand and left foot, obliquely; (3) from the left hand and left foot, lengthwise."
 p.854: "Especially the auricular peak P is clearly shown and may therefore be best studied with this lead [lead II]." "Lead III is most suited for diagnosing hypertrophy of the right or left ventricle."
 p.854 (section "The Connexion between the Forms Obtained with the Three Leads"), verbatim: "From the nature of the case there must be a connexion between the curves obtained by the three different leads from the same person. If two forms are known, the third may be calculated from them. The difference between the electrical tensions of leads I and II must be equal to the electrical tension of lead III. This may be formulated: lead II − lead I = lead III. The formula holds good only in case the current which is flowing through the galvanometer exercises no influence upon the tensions present at the extremities. As a matter of fact, this influence is so small that we may neglect it without making a perceptible error."  [=> equivalently I + III = II; the rearrangement is my inference]
 p.854: "we wish that a deflection of the image of the string of 1 cm. shall exactly represent 1 millivolt, when the human body is in the galvanometer circuit." / "an EKG. recorded with a galvanometer, of which the deflection time is about 0·01 second, does not differ practically from the same EKG. recorded with a galvanometer whose deflection time is infinitely small."
 p.859 Fig. 26 caption verbatim: "Schema of the equilateral triangle. R corresponds to the right hand, L to the left hand, and F to both feet. The heart, H, is in the centre. The arrow indicates the direction of the potential differences in the heart. α = 76°." Figs 27, 28: "Id. α = 40°", "Id. α = 0°". Figs 29/30 show tracings labelled P, Q, R, S, T (Fig. 29 "Fl Lead I, lying on his left side").
Einthoven 1903 Pflügers Archiv: not located on archive.org (search found only *goog identifiers for Pflügers Archiv 1905/1907 volumes — avoided per rule). NOT FOUND/not needed (1912 Lancet gives the relation).

## NOT FOUND (allowed sources)
- Rod/cone counts (~120 M / ~6 M) — NEI only gives "only 5 percent of the retina’s photoreceptors are cones" (Swaroop quote).
- Pupil diameter range from a government source (NEI). Helmholtz gives 4 mm mean and 2 mm minimum only; no maximum.
- Human hearing range 20 Hz–20 kHz from an open government source (NIDCD pages checked).
- Greenwood function constants (A=165.4, a=0.06/2.1, k=0.88) — Greenwood 1961/1990 paywalled, no open copy.
- Cochlea length (~35 mm) and hair-cell count.
- ECG normal intervals (PR 0.12–0.20 s, QRS < 0.12 s).
- NIST V(λ) not checked (CVRL used instead).

## Blocked / prohibitions
- No AI/LLM-ingestion prohibitions encountered on any fetched host. No bot walls. https://www.cvrl.org fails (TLS/connection); http works.
- NIH pages carry a banner re "Super Intelligence" terminology (EO 14434) — irrelevant to reuse.
- CVRL: copyright notice with no explicit redistribution licence (see above).
- Helmholtz 1924 scan is HathiTrust "Public Domain, Google-digitized" (pd-google terms: non-commercial use of the files requested).
- BSTJ 1933 (Fletcher & Munson reprint): copyright status unverified.


## B. Imaging and tissue (gates 13.4–13.6)

# Phase 13 research B (gates 13.4–13.6) — 2026-11-28

## Robots per host (fetched separately, saved /tmp/vv-research/p13b/robots/)
- physics.nist.gov: robots.txt 404 (no robots file) -> no restriction; proceeded with >=2 s delay.
- www.nist.gov: 200; User-agent * disallows only admin/search/user paths -> allowed.
- www.fda.gov: 200; User-agent * Crawl-Delay: 30; disallows /node/, /file/, /search/ etc. -> allowed with 30 s delay.
- www.nibib.nih.gov: 200; User-agent * ends with "Disallow: /" -> BLOCKED; not fetched.
- www.fcc.gov: robots.txt 403 Access Denied (Akamai) -> BLOCKED; not fetched.
- www.ecfr.gov: 200; User-agent * disallows /search, /api/renderer/v1/content/, /api/versioner/v1/full/, etc. -> /current/title-47/... allowed.
- niremf.ifac.cnr.it: robots.txt 404 -> no restriction.
- archive.org: 200; disallows /control/, /report/ only.
- api.crossref.org: robots 404 -> allowed.

## A. X-ray attenuation — NIST SRD 126 (Hubbell & Seltzer) — DONE
- Landing: https://www.nist.gov/pml/x-ray-mass-attenuation-coefficients — "NIST Standard Reference Database 126 | Last Update to Data Content: July 2004 | NISTIR 5632 | DOI: https://dx.doi.org/10.18434/T4D01F". Authors "J. H. Hubbell+ and S. M. Seltzer, Radiation Physics Division, PML, NIST".
- Page notice verbatim: "© 1989, 1990, 1996 copyright by the U.S. Secretary of Commerce on behalf of the United States of America. All rights reserved. NIST reserves the right to charge for these data in the future."
- Version history (https://www.nist.gov/pml/nist-x-ray-mass-attenuation-coefficients-version-history): Version 1.4, July 12, 2004; original publication May 1995 (NISTIR 5632). Recommended citation verbatim: "Hubbell, J.H. and Seltzer, S.M. (2004), Tables of X-Ray Mass Attenuation Coefficients and Mass Energy-Absorption Coefficients (version 1.4). [Online] Available: http://physics.nist.gov/xaamdi [year, month day]. National Institute of Standards and Technology, Gaithersburg, MD." Optional: "Originally published as NISTIR 5632, National Institute of Standards and Technology, Gaithersburg, MD (1995)."
- SRD copyright policy (https://www.nist.gov/open/copyright-fair-use-and-licensing-statements-srd-data-software-and-technical-series-publications), verbatim: "The Standard Reference Data Act, 15 U.S.C. § 290e, empowers the Secretary of Commerce to secure copyright on behalf of the United States in Standard Reference Data (SRD) prepared by NIST." Required statement: "Copyright protection on this compilation of data has been secured by the Secretary of the U.S. Department of Commerce on behalf of the United States in the United States and all countries that are parties to the Universal Copyright Convention, pursuant to Section 290(e) of Title 15 of the United States Code." => SRD is NOT public domain; citing/quoting individual values with attribution is the practical use; bulk redistribution of the whole table is a judgement call (copyrighted compilation). Flag for owner.
- Database disclaimer (https://www.nist.gov/pml/database-disclaimer): "NIST makes no warranties to that effect, and NIST shall not be liable for any damage that may result from errors or omissions in the Database."
- Equations (read on equation GIF images, https://physics.nist.gov/PhysRefData/XrayMassCoef/Eqs/eq01.gif, eq02.gif; Section 2, chap2.html):
  - eq 1: I/I_o = exp[-(μ/ρ)x]   eq 2: μ/ρ = x^-1 ln(I_o/I)
  - Text verbatim: "A narrow beam of monoenergetic photons with an incident intensity Io, penetrating a layer of material with mass thickness x and density ρ, emerges with intensity I given by the exponential attenuation law" ... "Note that the mass thickness is defined as the mass per unit area, and is obtained by multiplying the thickness t by the density ρ, i.e., x = ρt."
  - Intro.html: "For compounds and mixtures, values for μ/ρ can be obtained by simple additivity, i.e., combining values for the elements according to their proportions by weight."
- URL patterns: compounds https://physics.nist.gov/PhysRefData/XrayMassCoef/ComTab/<name>.html ; elements .../ElemTab/z<Z>.html ; Table 1 (elements constants) tab1.html; Table 2 (compound constants/densities) tab2.html; Table 4 index tab4.html.
- Table 4 caption verbatim: "Values of the mass attenuation coefficient, μ/ρ, and the mass energy-absorption coefficient, μen/ρ, as a function of photon energy, for compounds and mixtures. The compositions of various human tissues were taken from ICRU Report 44 (1989)."
- Densities (from Table 2 / Table 1 HTML data tables, read from table text; caption: "Values are given for the mean ratio of atomic number-to-mass Z/A, the mean excitation energy I, and the density ρ. Some density values are only nominal."):
  | Material (NIST name) | file | <Z/A> | I (eV) | ρ (g/cm3) |
  |---|---|---|---|---|
  | Water, Liquid | ComTab/water.html | 0.55508 | 75.0 | 1.000E+00 |
  | Tissue, Soft (ICRU-44) | ComTab/tissue.html | 0.54996 | 74.7 | 1.060E+00 |
  | Bone, Cortical (ICRU-44) | ComTab/bone.html | 0.51478 | 112.0 | 1.920E+00 |
  | Adipose Tissue (ICRU-44) | ComTab/adipose.html | 0.55579 | 64.8 | 9.500E-01 |
  | Muscle, Skeletal (ICRU-44) | ComTab/muscle.html | 0.55000 | 74.6 | 1.050E+00 |
  | Air, Dry (near sea level) | ComTab/air.html | 0.49919 | 85.7 | 1.205E-03 |
  | Blood, Whole (ICRU-44) | ComTab/blood.html | 0.54999 | 75.2 | 1.060E+00 |
  | Brain, Grey/White Matter (ICRU-44) | ComTab/brain.html | 0.55239 | 73.9 | 1.040E+00 |
  | Lung Tissue (ICRU-44) | ComTab/lung.html | 0.55048 | 75.2 | 1.050E+00 |
  | Lead (Z=82) | ElemTab/z82.html (Table 1) | 0.39575 | 823.0 | 1.135E+01 |
  | Calcium (Z=20) | ElemTab/z20.html (Table 1) | 0.49903 | 191.0 | 1.550E+00 |
  Note: the soft-tissue file "tissue.html" is "Tissue, Soft (ICRU-44)"; "tissue4.html" is the ICRU four-component version (not fetched).
- Sample check values (water, ComTab/water.html): 0.1 MeV μ/ρ 1.707E-01, μen/ρ 2.546E-02; 0.06 MeV 2.059E-01 / 3.190E-02; 1.0 MeV 7.072E-02 / 3.103E-02. Lead z82: edges flagged (K, L1-3, M1-5) with duplicate energies above/below edge.
- Raw files: /tmp/vv-research/p13b/nist/*.html (water, tissue, bone, adipose, muscle, air, blood, brain, lung, z82, z20, tab1, tab2, tab4 (idx_tab4.html.html), intro, chap2, eq01/eq02 gif+png); parsed tables /tmp/vv-research/p13b/xray_tables/<name>.txt (energy MeV, μ/ρ cm2/g, μen/ρ cm2/g; edge labels in col 1 for elements).
- Access note: physics.nist.gov landing /PhysRefData/XrayMassCoef/ returned 403 (Cloudflare) to a browser-like UA; all table/section pages returned 200 to plain curl.

## C. MRI — CODATA 2022 via NIST CUU — DONE (values)
All pages say "Source: 2022 CODATA recommended values".
- https://physics.nist.gov/cgi-bin/cuu/Value?gammapbar — "proton gyromagnetic ratio in MHz/T": 42.577 478 461(18) MHz T-1; rel. std. unc. 4.3 x 10-10
- https://physics.nist.gov/cgi-bin/cuu/Value?gammap — "proton gyromagnetic ratio": 2.675 221 8708(11) x 10^8 s-1 T-1; 4.3 x 10-10
- https://physics.nist.gov/cgi-bin/cuu/Value?gammapp — "shielded proton gyromagnetic ratio": 2.675 153 194(11) x 10^8 s-1 T-1; 4.1 x 10-9
- https://physics.nist.gov/cgi-bin/cuu/Value?gammappbar — "shielded proton gyromagnetic ratio in MHz/T": 42.576 385 43(17) MHz T-1; 4.1 x 10-9
- Defining equation (read on image https://physics.nist.gov/cuu/Constants/Value/gif/eqgammappbar.gif): γ'_p = 2μ'_p/ħ (page shows the symbol; the MHz/T quantity is γ'_p/2π per its name — inference from the page label "in MHz/T").
- The CUU page does NOT define the shielding conditions (H2O sample, temperature) — NOT FOUND on page; do not state.
- Raw: /tmp/vv-research/p13b/nist/cuu_*.html, eqgammappbar.png
- Larmor relation ω = γB: NOT FOUND in an open source yet (NIBIB blocked by robots). See below.

## D. Microscopy — Abbe 1873 — DONE
- archive.org id: archivfrmikros09berl ("Archiv für mikroskopische Anatomie", bd. 9, year 1873; contributor/sponsor MBLWHOI Library; no access-restricted-item; no licence field). 1873 publication = public domain.
- Title page read on image https://archive.org/download/archivfrmikros09berl/page/n422_w1200.jpg (printed p. 413, leaf 423): "Beiträge zur Theorie des Mikroskops und der mikroskopischen Wahrnehmung. I. Die Construction von Mikroskopen auf Grund der Theorie. II. Die dioptrischen Bedingungen der Leistung des Mikroskops. III. Die physikalischen Bedingungen für die Abbildung feiner Structuren. IV. Das optische Vermögen des Mikroskops. Von Dr. E. Abbe, ao. Professor in Jena." Footer: "Schultze, Archiv f. mikrosk. Anatomie. Bd. 9."
- Resolution limit, §19, pp. 455–456, read on page images n464 (p. 455) and n465 (p. 456) (https://archive.org/download/archivfrmikros09berl/page/n464_w1200.jpg, n465_w1200.jpg). Verbatim:
  p. 455: "19. In Anschluss an die vorstehenden, für den wissenschaftlichen Gebrauch des Mikroskops wichtigen Schlussfolgerungen ergeben sich ferner ganz bestimmte Grenzen für das Unterscheidungsvermögen sowohl jedes einzelnen Objectivs, wie auch des Mikroskops überhaupt.
  Durch kein Mikroskop können Theile getrennt (oder die Merkmale einer real vorhandenen Structur wahrgenommen) werden, wenn dieselben einander so nahe stehen, dass auch der erste durch Beugung erzeugte Lichtbüschel nicht mehr gleichzeitig mit dem ungebeugten Lichtkegel in das Objectiv eintreten kann. Daraus entspringt für jede Grösse des Oeffnungswinkels eine bestimmte kleinste Distanz des Unterscheidbaren, deren numerische Angabe nur desshalb un-"
  p. 456: "sicher bleibt, weil sie, der ungleichen Wellenlänge wegen, für Licht der verschiedenen Farben ungleich ist, das relative Gewicht der einzelnen Farben aber bei der Beobachtung sehr wechselt. Irgend eine bestimmte Farbe zu Grunde gelegt, ergiebt sich der betreffende Minimalwerth für rein centrale Beleuchtung durch Division der Wellenlänge mit dem Sinus des halben Oeffnungswinkels, für den höchsten zulässigen Grad schiefer Beleuchtung aber bei jedem Oeffnungswinkel genau halb so gross — sonst gleiche Umstände vorausgesetzt. — Da nun auch beim Immersionssystem der Oeffnungswinkel durch kein Mittel erheblich über diejenige Grösse, die 180° in Luft entsprechen würde, hinausgeführt werden kann, so folgt, dass, wie auch das Mikroskop in Bezug auf die förderliche Vergrösserung noch weiter vervollkommnet werden möchte, die Unterscheidungsgrenze für centrale Beleuchtung doch niemals über den Betrag der ganzen, und für äusserste schiefe Beleuchtung niemals über den der halben Wellenlänge des blauen Lichts um ein Nennenswerthes hinausgehen wird."
  - What is read: Abbe gives NO symbolic formula; in words: d_min = λ / sin(half-aperture angle) for central illumination; half that, λ/(2 sin α), for maximally oblique illumination. Refractive index n is not written explicitly (he refers to the angle "die 180° in Luft entsprechen würde" for immersion systems). Writing d = λ/(2 n sin α) is a later/modern formulation (inference — needs a separate citation if n is shown).
  - Footnote on wavelengths (OCR only, djvu line ~1698, not image-verified): "Die Wellenlänge des Roth ist = 0,76 μ; des dunkeln Blau = 0,43 μ."
- Raw: /tmp/vv-research/p13b/archive/am09_n422.jpg, am09_n464.jpg, am09_n465.jpg, abbe_ocr.txt (djvu OCR extract), am09_pn.json (page map: leaf = n+1; printed p = leaf − 10 in this range).

## E. SAR — 47 CFR § 1.1310 — DONE (via govinfo, not eCFR)
- www.ecfr.gov: page request redirected to https://unblock.federalregister.gov/ ("Your request has been flagged as potentially automated... complete the CAPTCHA") and its robots disallow /api/versioner/v1/full/ and /api/renderer/v1/content/ => eCFR BLOCKED; stopped.
- www.govinfo.gov robots: User-agent * disallows only /app/search/* etc. -> /content/pkg allowed.
- Source: Code of Federal Regulations, Title 47, Vol. 1, revised as of 2024-10-01 (annual edition), XML granule https://www.govinfo.gov/content/pkg/CFR-2024-title47-vol1/xml/CFR-2024-title47-vol1-sec1-1310.xml (2023 edition also saved). US government work (not copyrighted, 17 U.S.C. §105).
- Verbatim § 1.1310 "Radiofrequency radiation exposure limits.":
  (a) "Specific absorption rate (SAR) shall be used to evaluate the environmental impact of human exposure to radiofrequency (RF) radiation as specified in § 1.1307(b) of this part within the frequency range of 100 kHz to 6 GHz (inclusive)."
  (b) "The SAR limits for occupational/controlled exposure are 0.4 W/kg, as averaged over the whole body, and a peak spatial-average SAR of 8 W/kg, averaged over any 1 gram of tissue (defined as a tissue volume in the shape of a cube). Exceptions are the parts of the human body treated as extremities, such as hands, wrists, feet, ankles, and pinnae, where the peak spatial-average SAR limit for occupational/controlled exposure is 20 W/kg, averaged over any 10 grams of tissue (defined as a tissue volume in the shape of a cube). Exposure may be averaged over a time period not to exceed 6 minutes to determine compliance with occupational/controlled SAR limits."
  (c) "The SAR limits for general population/uncontrolled exposure are 0.08 W/kg, as averaged over the whole body, and a peak spatial-average SAR of 1.6 W/kg, averaged over any 1 gram of tissue (defined as a tissue volume in the shape of a cube). Exceptions are the parts of the human body treated as extremities, such as hands, wrists, feet, ankles, and pinnae, where the peak spatial-average SAR limit is 4 W/kg, averaged over any 10 grams of tissue (defined as a tissue volume in the shape of a cube). Exposure may be averaged over a time period not to exceed 30 minutes to determine compliance with general population/uncontrolled SAR limits."
  Note to paragraphs (a)–(d): "SAR is a measure of the rate of energy absorption due to exposure to RF electromagnetic energy."
- Raw: /tmp/vv-research/p13b/ecfr/CFR-2024-title47-vol1-sec1-1310.xml, CFR-2023-...xml

## B. Ultrasound — FDA guidance — partial
- FDA, "Marketing Clearance of Diagnostic Ultrasound Systems and Transducers. Guidance for Industry and Food and Drug Administration Staff. Document issued on February 21, 2023. Document originally issued on June 27, 2019." PDF https://www.fda.gov/media/71100/download (65 PDF pages; landing https://www.fda.gov/regulatory-information/search-fda-guidance-documents/marketing-clearance-diagnostic-ultrasound-systems-and-transducers). Every page header "Contains Nonbinding Recommendations".
- Text extracted with pypdf (page images could NOT be rendered: no poppler) — so symbols are from text layer; "£" in extraction = "≤" (Symbol-font artefact; inference).
- Glossary, printed p. 35 (PDF p. 39), verbatim: "derating (derating factor, derated): A factor applied to acoustic output parameters intended to account for ultrasonic attenuation of tissue between the source and a particular location in the tissue. As referred to in this document, the average ultrasonic attenuation is assumed to be a 0.3 dBcm-1MHz-1 along the beam axis in the body. Derated parameters are denoted with a subscript ".3"." Also: "derated peak rarefactional pressure: The value of pr derated by 0.3 dB cm-1 MHz-1 to account for the acoustic attenuation in soft tissues."
- Printed p. 36 (PDF p. 40): instantaneous intensity "i = p2/ρc where p is the instantaneous acoustic pressure; ρ is the density of the medium; and c is the speed of sound in the medium." (ρ shown as "r" in text layer — Symbol font; inference.)
- Printed p. 14 (PDF p. 18), §5.2.4: "derated ISPTA ≤720 mW/cm2, and either MI ≤1.9 or derated ISPPA ≤190 W/cm2" (preamendments levels, Table 3 of §5.2.7).
- 1540 m/s: NOT stated anywhere in this guidance (searched "1540", "m/s", "speed"; only "21 CFR 892.1540" regulation number). NOT FOUND here.
- Raw: /tmp/vv-research/p13b/fda/ultrasound-guidance.pdf, ultrasound-guidance.txt

## B (cont.). Reflection coefficient — Rayleigh, Theory of Sound vol. II §270 — DONE
- archive.org id theoryofsound02raylrich (Vol. II, "SECOND EDITION REVISED AND ENLARGED", Macmillan, London 1896; "First Edition printed 1878. Second Edition revised and enlarged 1896."; contributor University of California Libraries; possible-copyright-status NOT_IN_COPYRIGHT; not access-restricted).
- Read on page image https://archive.org/download/theoryofsound02raylrich/page/n101_w1200.jpg = printed p. 82 (header "82 FRESNEL'S EXPRESSIONS. [270."):
  "In general, when θ = 0,  φ'' : φ' = (ρ1/ρ − V/V1) : (ρ1/ρ + V/V1) ..........(23); so that there is no reflection, if ρ1 : ρ = V : V1. In the case of gases V² : V1² = ρ1 : ρ, and then φ''/φ' = (√ρ1 − √ρ)/(√ρ1 + √ρ) = (V − V1)/(V + V1) ..........(24)."
  "Suppose, for example, that after perpendicular incidence reflection takes place at a surface separating air and hydrogen. We have ρ = ·001276, ρ1 = ·00008837; whence √ρ : √ρ1 = 3·800, giving φ'' = − ·5833 φ'. The ratio of intensities, which is as the square of the amplitudes, is ·3402 : 1, so that about one-third part is reflected."
  - Symbols (from §270 p. 78, OCR text, not image-checked): ρ, ρ1 densities; V, V1 sound velocities; φ', φ'' incident/reflected velocity-potential amplitudes.
  - INFERENCE (not printed by Rayleigh): multiplying (23) by ρV1 gives φ''/φ' = (ρ1V1 − ρV)/(ρ1V1 + ρV), i.e. (Z2 − Z1)/(Z2 + Z1) with Z = ρc; intensity ratio = its square (Rayleigh states intensities go as square of amplitudes). Sign convention is for velocity potential.
- Raw: /tmp/vv-research/p13b/archive/ray2_n101.jpg, ray2_djvu.txt, ray2_pn.json

## B (cont.). Tissue sound speeds — NBS SP 525 (1979) — DONE (speeds/attenuation; impedances NOT FOUND)
- Linzer M. (ed.), Ultrasonic Tissue Characterization II, NBS Special Publication 525, April 1979. DOI 10.6028/NBS.SP.525 (Crossref verified: title "Ultrasonic tissue characterization II", editor Linzer, 1979). PDF also at https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nbsspecialpublication525.pdf (not fetched; nvlpubs robots not checked).
- archive.org id ultrasonictissue525linz (contributor NIST Research Library). Rights field verbatim: "NBS special publication is a publication of the U.S. Government. The papers are in the public domain and are not subject to copyright in the United States. However, please pay special attention to the individual works to make sure there are no copyright restrictions indicated. Individual works may require securing other permissions from the original copyright holder."
- Paper: R. L. Johnston, S. A. Goss, V. Maynard, J. K. Brady, L. A. Frizzell, W. D. O'Brien, Jr., and F. Dunn (Bioacoustics Research Laboratory, University of Illinois, Urbana), "Elements of Tissue Characterization. Part I. Ultrasonic Propagation Properties", SP 525 Chapter 2 (starts p. 19 per OCR). Table 1 source cited as ref. [59]: O'Brien, W. D., "The Role of Collagen in Determining Ultrasonic Propagation Properties in Tissue", in Acoustical Holography, L. W. Kessler ed., Vol. 7 (Plenum, New York, 1977).
- Table 1, printed p. 24, READ ON PAGE IMAGE https://archive.org/download/ultrasonictissue525linz/page/n43_w1200.jpg. Caption: "Table 1. Ultrasonic attenuation and velocity for tissues of various water, protein and collagen content." Columns: Attenuation at 1 MHz (cm-1) | Velocity (m/s) | Water (%) | Protein (%) | Collagen (%). Selected rows:
  Water (20 °C) 0.0003 | 1483 | 100
  Blood 0.02 | 1571 | 74 - 83
  Plasma 0.01 | 1571 | 90 - 95 | 7
  Fat 0.04 - 0.09 | 1410 - 1479 | 10 - 19 | 5 - 7 | yes
  Liver 0.07 0.13 | 1550 - 1607 | 68 - 78 | 20 - 21 | 0.1 - 1.3
  Kidney 0.09 - 0.13 | 1558 - 1568 | 76-83 | 15 - 17 | 0.5 - 1.5
  Brain 0.09 - 0.13 | 1510 - 1565 | 75 - 79
  Spleen 0.06 | 1520 - 1591
  Striated muscle 0.18 - 0.25 | 1568 - 1603 (against grain 1592 - 1603; with grain 1576 - 1587)
  Heart 0.25 - 0.38 | 1572
  Integument 0.40 | 1498
  Cartilage 0.58 | 1665
  Tendon (against grain) 0.54 | 1750
  Lens 0.10 - 0.20 | 1616
  NOTE: attenuation unit is cm-1 (nepers implied? not stated on the page) — do not convert without a source. No bone row in this table.
- Also in SP 525 (OCR only, not image-verified): skull bone "approximately 3050 m/s ... (Martin and McElhaney [9])", brain "approximately 1540 m/s (Wells [10])" (djvu line ~27787); phantom spec "velocity of propagation at 22 °C (72 °F) = 1540 ± 50 m/s" (line ~40084). Page numbers not yet mapped — verify on image before use.
- 1540 m/s as the scanner-assumed soft-tissue speed: NOT FOUND in an open government source (FDA guidance does not state it).
- Acoustic impedance values (Z, rayl) for fat/bone/blood: NOT FOUND in an open source. (Could be computed ρc from ρ (NIST Table 2 densities) and c (SP 525 Table 1) — that is an INFERENCE/derivation, must be labeled as such.)
- Raw: /tmp/vv-research/p13b/archive/sp525_n43.jpg, sp525_djvu.txt, sp525_pn.json, sp453_djvu.txt

## C (cont.). MRI explanatory text — FDA (NIBIB blocked)
- FDA public-domain statement (https://www.fda.gov/about-fda/about-website/website-policies) verbatim: "Unless otherwise noted, the contents of the FDA website (www.fda.gov) — both text and graphics — are not copyrighted. They are in the public domain and may be republished, reprinted and otherwise used freely by anyone without the need to obtain permission from FDA. Credit to the U.S. Food and Drug Administration as the source is appreciated but not required."
- https://www.fda.gov/radiation-emitting-products/medical-imaging/mri-magnetic-resonance-imaging (Content current as of 08/29/2018), verbatim: "Magnetic Resonance Imaging (MRI) is a medical imaging procedure for making images of the internal structures of the body. MRI scanners use strong magnetic fields and radio waves (radiofrequency energy) to make images. The signal in an MR image comes mainly from the protons in fat and water molecules in the body." / "During an MRI exam, an electric current is passed through coiled wires to create a temporary magnetic field in a patient's body. Radio waves are sent from and received by a transmitter/receiver in the machine, and these signals are used to make digital images of the scanned area of the body. A typical MRI scan last from 20 - 90 minutes, depending on the part of the body being imaged."
- https://www.fda.gov/radiation-emitting-products/mri-magnetic-resonance-imaging/benefits-and-risks: "MR images are made without using any ionizing radiation ... the MR environment involves a strong, static magnetic field, a magnetic field that changes with time (pulsed gradient field), and radiofrequency energy, each of which carry specific safety concerns:" ; "The radiofrequency energy used during the MRI scan could lead to heating of the body."
- FDA guidance "Criteria for Significant Risk Investigations of Magnetic Resonance Diagnostic Devices", Document issued on: June 20, 2014 (supersedes July 14, 2003). PDF https://www.fda.gov/files/medical%20devices/published/Criteria-for-Significant-Risk-Investigations-of-Magnetic-Resonance-Diagnostic-Devices---Guidance-for-Industry-and-Food-and-Drug-Administration-Staff-(PDF).pdf (5 PDF pages; text layer, not page image):
  printed p. 2 (PDF p. 4) "Main Static Magnetic Field — Population / Main static magnetic field greater than (tesla): adults, children, and infants aged > 1 month 8; neonates i.e., infants aged 1 month or less 4"
  printed p. 3 (PDF p. 5) "Specific Absorption Rate (SAR) — Site / Dose / Time (min) equal to or greater than: / SAR (W/kg): whole body averaged over 15 >4; head averaged over 10 >3.2" ; "Peak unweighted sound pressure level greater than 140 dB." ; "A-weighted root mean square (rms) sound pressure level greater than 99 dBA with hearing protection in place."
  Intro: "Generally, FDA deems magnetic resonance diagnostic devices significant risk when used under any of the operating conditions described below."
- Typical clinical field strengths (1.5 T, 3 T): NOT FOUND in an open, robots-permitted source.
- Larmor relation ω = γB / f = γ̄B: NOT FOUND in open text. Bloch 1946 "Nuclear Induction", Phys. Rev. 70, 460–474, DOI 10.1103/PhysRev.70.460 (Crossref verified) carries licence http://link.aps.org/licenses/aps-default-license — NOT open; not fetched. (Inference only: CODATA expresses γ_p/2π in "MHz T-1", i.e. precession frequency per tesla.)
- Raw: /tmp/vv-research/p13b/fda/*.html, *.txt, mr-sr.pdf, mr-sr.txt

## D (cont.). Electron wavelength — de Broglie & Flint 1930 — DONE
- archive.org id introductiontoth032904mbp: "An Introduction To The Study Of Wave Mechanics", Louis de Broglie (tr. H. T. Flint per creator field), Methuen and Co. Ltd., 1930; no access restriction; no rights field. Copyright: 1930 US publication-year works entered US public domain 1 Jan 2026 (95-yr term) — applies if treated as published 1930; NOT PD in EU/UK (de Broglie d. 1987; Flint d. 1971). Flag for owner.
- Read on page image https://archive.org/download/introductiontoth032904mbp/page/n108_w1200.jpg = printed p. 97 (chapter "Principle of Interference and Diffraction of Electrons"):
  (20) λ = h/p = (h/mv)·√(1 − β²)
  "The velocity of the electrons is determined by the potential difference P applied to put them in motion. We have:" (21) mc²/√(1 − β²) − mc² = eP
  "whence finally:" (24) λ = h / √(2meP(1 + eP/(2mc²)))
  "The term eP/2mc² is always small, so that it is sufficient to write:" (25) λ = (h/√(2meP))(1 − eP/(4mc²)), "and in this formula the value of e is − 4·77 × 10^-10 e.s.u." (26, P in volts) λ = h√(150/(meP))(1 − eP/(1200mc²)).
  (Gaussian/e.s.u. units; m = rest mass per eq. 21.) Next page (p. 98, OCR only): "By applying the foregoing relations we find for 25,000 volt electrons the value 0·75 × 10^-9 cms. for the wave-length".
- TEM accelerating voltages — NCI/NIH (ostr.ccr.cancer.gov; robots: only /wp-admin/ disallowed): https://ostr.ccr.cancer.gov/resources/provider_details/nci-cryo-electron-microscopy-facility-affiliated-with-nih-irp-cryoem-consortium-nice "Major Instrumentation — Building 37: Titan Krios 300kV Electron Microscope with Gatan BioQuantum Image Filter and K3 Direct Electron Detector ... Building 33: Glacios 200kV Electron Microscope with Selectris Image Filter and Falcon 4i Direct Electron Detector ... Building 50: Tecnai 12 120kV Electron Microscope with K2 summit". Overview: "NICE provides access to state-of-the-art Titan Krios cryo-electron microscopes for atomic-resolution structure determination ..." No page date / licence statement found on page (NCI = US government; licence statement NOT FOUND on this page).
  https://www.cancer.gov/research/resources/cryoem: "The facility currently houses two Titan Krios microscopes equipped Falcon 3EC direct detectors and K3 Bioquantum detectors." (no kV stated)
- Raw: /tmp/vv-research/p13b/archive/dbf_n108.jpg, dbf_djvu.txt; /tmp/vv-research/p13b/em/*.html,*.txt

## E (cont.). Tissue dielectric properties — IFAC-CNR (now webnir.eu) — DONE
- niremf.ifac.cnr.it robots 404; it redirects to webnir.eu. webnir.eu robots: User-agent * disallows /tmp/ and /service/ only; a ClaudeBot/GPTBot "Disallow: /" block exists but is COMMENTED OUT ("Crawler dei modelli linguistici: togliere i commenti per escluderli") -> allowed now; note the owner contemplates opting out.
- https://webnir.eu/04-Dosimetry/index.php?lang=gb (was http://niremf.ifac.cnr.it/tissprop/). Terms verbatim: "This website and the results of its analysis may be used freely for scientific purposes and for any other use permitted by law. Those who use this website should mention it in their own publications as follows: D. Andreuccetti, R. Fossi and C. Petrucci: An Internet resource for the calculation of the dielectric properties of body tissues in the frequency range 10 Hz - 100 GHz. IFAC-CNR, Florence (Italy), 1997. Based on data published by C. Gabriel et al. in 1996. [Online]. Available: http://niremf.ifac.cnr.it/tissprop/". Footer: "Website content: CC BY 4.0, except where otherwise noted".
- Gabriel report page https://webnir.eu/04-Dosimetry/04-Gabriel.php?lang=gb: "Camelia Gabriel, PhD and Sami Gabriel, MSc — Physics Department, King's College London ... Report AL/OE-TR-1996-0037, June 1996 ... Brooks Air Force Base, TX 78235-5102. Approved for public release, distribution unlimited (DTIC AD-A305826)."
  Model eq. (3) — transcribed from the page's KaTeX source (https://webnir.eu/js/local/gabriel.katex.js, NOT the original report page image): ε̂(ω) = ε∞ + Σ_{n=1..4} Δε_n / (1 + (jωτ_n)^(1−α_n)) + σ_i/(jωε0). Text: "in which ε∞ is the permittivity in the terahertz frequency range, σi is the ionic conductivity and, for each dispersion region, τ is the relaxation time, α the broadening parameter and Δε the drop in permittivity ..." ; "It can be used with confidence for frequencies above 1 MHz. At lower frequencies ... the model should be used with caution".
  Parameter table: "The parameters of equation (3) for each of the 57 tissues known to the server: the summary table of Appendix C, extended over the years with the tissues added by IFAC-CNR." Saved: /tmp/vv-research/p13b/ifac/gabriel_params.tsv (columns ε∞, σi (S/m), Δε1, τ1 (ps), α1, Δε2, τ2 (ns), α2, Δε3, τ3 (µs), α3, Δε4, τ4 (ms), α4). E.g. Muscle 4 | 0.2 | 50 | 7.234 | 0.1 | 7000 | 353.68 | 0.1 | 1.2e+6 | 318.31 | 0.1 | 2.5e+7 | 2.274 | 0 ; Fat 2.5 | 0.01 | 3 | 7.958 | 0.2 | 15 | 15.915 | 0.1 | 33000 | 159.16 | 0.05 | 1.0e+7 | 7.958 | 0.01.
  Crossref verified: Gabriel S, Lau RW, Gabriel C, "The dielectric properties of biological tissues: III. Parametric models for the dielectric spectrum of tissues", Phys. Med. Biol. 41, 2271–2293 (1996), DOI 10.1088/0031-9155/41/11/003 (IOP — off-limits to fetch).
- DTIC (apps.dtic.mil robots 403; www.dtic.mil robots no response) — BLOCKED, not fetched.
- FCC tissue-dielectric page: www.fcc.gov robots 403 — BLOCKED.

## DOI checks
- 10.6028/NBS.SP.525 OK (Crossref); 10.6028/NBS.SP.453 OK; 10.1103/PhysRev.70.460 OK (APS default licence); 10.1088/0031-9155/41/11/003 OK; 10.18434/T4D01F not in Crossref — DataCite (api.datacite.org, robots 404): title "Tables of X-Ray Mass Attenuation Coefficients and Mass Energy-Absorption Coefficients, NIST Standard Reference Database 126", creator Seltzer, Stephen, NIST, 1995, rights "License Information for NIST data".

## Blocked / prohibited
- www.nibib.nih.gov: robots "Disallow: /" for * — not fetched.
- www.fcc.gov: robots 403 — not fetched.
- www.ecfr.gov: bot wall (unblock.federalregister.gov CAPTCHA) and API text endpoints disallowed — stopped; used govinfo.gov annual CFR instead.
- apps.dtic.mil: robots 403.
- physics.nist.gov /PhysRefData/XrayMassCoef/ (index only) 403 Cloudflare to browser-like UA; data pages fine.
- No AI/LLM-ingestion prohibition notices encountered on fetched pages. webnir.eu has a commented-out ClaudeBot block (watch).
