# Phase 15 source research — Computing & Computer Engineering
Compiled 2026-11-28. UA "VoyagerVentures-Research/0.1 (educational; respects robots.txt)", ~1 s between requests per host.
Raw downloads: /tmp/vv-research/p15/ (robots in p15/robots/, page images in p15/img/).
All equations below were read on the page IMAGE (Read tool on downsized JPEG), not from OCR, unless marked "(text layer)".

## Robots.txt results (fetched 2026-11-28 before any other request to the host)
| Host | Result | Notes |
|---|---|---|
| archive.org | 200 | `User-agent: *` disallows only /control/, /report/. No ClaudeBot group. Allowed. |
| dspace.mit.edu | 200 | `*` disallows /search, /admin, /browse/*, /statistics, /server/opensearch etc.; item pages /handle/... allowed. No ClaudeBot group. |
| www.intel.com | 200 | Explicit `User-agent: ClaudeBot  Allow: /` and `anthropic-ai Allow: /`. |
| download.intel.com | 403 (S3 AccessDenied on /robots.txt) | no robots file served; see Moore section |
| patents.google.com | 200 | `*`: `Disallow: /*` but `Allow: /patent/`. Patent pages allowed. |
| physics.nist.gov | 404 | no robots.txt => no restrictions (RFC 9309). US-gov. |
| www.nist.gov | 200 | standard Drupal disallows only. |
| www.rfc-editor.org | 200 | `*` disallows only /rfc/authors/, /rfc/rerendered/, /rfc/v3test/. |
| eta-publications.lbl.gov | 200 | standard Drupal disallows only. |
| escholarship.org | 403 on robots.txt (CloudFront error) | not used |
| www.unicode.org | 200 | `*` disallows /draft/, /Public/16.0.0/ ("obsolete data"), /charts/PDF/Unicode-16.0 ("obsolete version"), older /Public/x.y/, specific old TR versions. **Unicode 16.0 data directory is disallowed** — see §9. |
| api.crossref.org | 404 | no robots => allowed |
| www.ioffe.ru | https: connection failed (curl 000); http://www.ioffe.ru/robots.txt → 404 (no restrictions) | NSM pages fetched over http (§3c) |
| www.osti.gov | 200 | `*` disallows /account, /search/, /pages/search, /opennet/document etc.; /servlets/purl/ and /api/ allowed |
| trustee.ietf.org | 200 | `User-agent: *  Disallow:` (allow all) |
| patentimages.storage.googleapis.com | 403 (no file) | PDFs not downloaded |
No host's robots.txt blocks ClaudeBot by name.

## 1. Boolean logic

### 1a. Boole 1854 — x² = x and x(1 − x) = 0
- **Citation:** Boole, George. *An Investigation of the Laws of Thought, on which are Founded the Mathematical Theories of Logic and Probabilities.* London: Walton and Maberly, 1854.
- **URL:** https://archive.org/details/aninvestigation00boolgoog (Google scan of a Harvard University copy; 460 images)
- **Licence:** Public domain in the US and worldwide (published 1854; author d. 1864). archive.org metadata: `possible-copyright-status: NOT_IN_COPYRIGHT`.
- **Robots:** archive.org allowed.
- **Page images read:** n42 (= printed p. 31), n60 (= printed p. 49). Offset: leaf n = printed page + 11 (checked on n46 = p. 35).
- **p. 31, Chap. II §9 (leaf n42)**, verbatim from image:
  > "As the combination of two literal symbols in the form *xy* expresses the whole of that class of objects to which the names or qualities represented by *x* and *y* are together applicable, it follows that if the two symbols have exactly the same signification, their combination expresses no more than either of the symbols taken alone would do. In such case we should therefore have *xy* = *x*. As *y* is, however, supposed to have the same meaning as *x*, we may replace it in the above equation by *x*, and we thus get *xx* = *x*. Now in common Algebra the combination *xx* is more briefly represented by *x*². Let us adopt the same principle of notation here; … In accordance with this notation, then, the above equation assumes the form
  > **x² = x,  (2)**
  > and is, in fact, the expression of a second general law of those symbols by which names, qualities, or descriptions, are symbolically represented."
  (Same page: "the literal symbols *x*, *y*, *z*, are *commutative, like the symbols of Algebra*" — *xy* = *yx*.)
- **p. 49, Chap. III, Proposition IV (leaf n60)**, verbatim:
  > "*That axiom of metaphysicians which is termed the principle of contradiction, and which affirms that it is impossible for any being to possess a quality, and at the same time not to possess it, is a consequence of the fundamental law of thought, whose expression is x² = x.*
  > Let us write this equation in the form  *x* − *x*² = 0, whence we have
  > **x(1 − x) = 0;  (1)**
  > … Hence *x*(1 − *x*) will represent the class whose members are at once "men," and "not men," and the equation (1) thus express the principle, *that a class whose members are at the same time men and not men does not exist.*"
  (Prop. III, p. 48 per OCR: "If *x* represent any class of objects, then will 1 − *x* represent the contrary or supplementary class of objects" — OCR only, not checked on image.)

### 1b. Shannon 1938 — series/parallel switches and the calculus of propositions
**Two versions exist:**
1. **MIT S.M. thesis** — Shannon, C. E. "A symbolic analysis of relay and switching circuits." Thesis (M.S.), MIT, Dept. of Electrical Engineering, 1940 (DSpace date). http://hdl.handle.net/1721.1/11173 (PDF: https://dspace.mit.edu/bitstreams/0428777a-799c-45b7-a2ed-5207da683e53/download — NOT downloaded).
   - **Licence: NOT open.** DSpace dc.rights verbatim: "MIT theses are protected by copyright. They may be viewed, downloaded, or printed from this source but further reproduction or distribution in any format is prohibited without written permission." → link/cite only; do not reproduce.
2. **AIEE paper (used here)** — Shannon, Claude E. "A Symbolic Analysis of Relay and Switching Circuits." *Transactions of the American Institute of Electrical Engineers* 57 (1938): 713–723. DOI 10.1109/T-AIEE.1938.5057767 (Crossref check below). Paper footnote: "This paper is an abstract of a thesis presented at MIT for the degree of master of science." Paper number 38-80, presented at the AIEE summer convention, Washington, D.C., June 20–24, 1938.
   - **URL:** https://archive.org/details/per_transactions-american-institute-of-electrical_1938_57 (microfilm scan, 810 images; collections ucdavis_microfilm/periodicals)
   - **Licence:** No licence stated on archive.org. US work published 1938 with notice; would be PD only if copyright was not renewed (renewal not checked — Copyright Office renewal records for periodicals not consulted). **Treat as "copyright status undetermined; short quotation for criticism/education"**; do not reproduce figures. (The IEEE Xplore version is paywalled.)
   - **Page images read:** leaf n726 = p. 713, n727 = p. 714, n728 = p. 715 (page_numbers.json confirms leafNum 726 → "713").
   - **p. 713 (n726)**, verbatim:
     > "Let us associate a symbol X_ab or more simply X, with the terminals a and b. This variable, a function of time, will be called the hindrance of the two-terminal circuit a-b. The symbol 0 (zero) will be used to represent the hindrance of a closed circuit, and the symbol 1 (unity) to represent the hindrance of an open circuit. … Now let the symbol + (plus) be defined to mean the series connection of the two-terminal circuits whose hindrances are added together. … Similarly the product of two hindrances X_ab·X_cd or more briefly X_ab X_cd will be defined to mean the hindrance of the circuit formed by connecting the circuits a-b and c-d in parallel."
     Postulates (p. 713): "1. a. 0·0 = 0  A closed circuit in parallel with a closed circuit is a closed circuit. b. 1 + 1 = 1  An open circuit in series with an open circuit is an open circuit. 2. a. 1 + 0 = 0 + 1 = 1  An open circuit in series with a closed circuit in either order … is an open circuit. b. 0·1 = 1·0 = 0  A closed circuit in parallel with an open circuit in either order is a closed circuit. 3. a. 0 + 0 = 0  A closed circuit in series with a closed circuit is a closed circuit. b. 1·1 = 1  An open circuit in parallel with an open circuit is an open circuit. 4. At any given time either X = 0 or X = 1."
   - **p. 714 (n727), Table I "Analogue Between the Calculus of Propositions and the Symbolic Relay Analysis"**, verbatim rows:
     - "X + Y … The series connection of circuits X Y … The proposition which is true if either X or Y is true"
     - "XY … The parallel connection of circuits X and Y … The proposition which is true if both X and Y are true"
     - "X′ … The circuit which is open when X is closed, and closed when X is open … The contradictory of proposition X"
     - "0 … The circuit is closed … The proposition is false"; "1 … The circuit is open … The proposition is true"
     - Text: "The algebra of logic … originated by George Boole, is a symbolic method of investigating logical relationships." De Morgan's theorem (9a) (X + Y + Z …)′ = X′·Y′·Z′ …; (9b) (X·Y·Z …)′ = X′ + Y′ + Z′ + …
     - Footnote **: "This analogy may also be seen from a slightly different viewpoint. Instead of associating X_ab directly with the circuit a-b let X_ab represent the *proposition* that the circuit a-b is open. Then all the symbols are directly interpreted as propositions and the operations of addition and multiplication will be seen to represent series and parallel connections."
   - **IMPORTANT for the app:** Shannon's variable is *hindrance* (1 = open). So in his paper **series ↔ "+" (OR of "open" propositions)** and **parallel ↔ "·" (AND)**. The modern convention (variable = "closed/conducting") gives **series = AND, parallel = OR** — the dual. Any app sentence "series = AND, parallel = OR" must NOT be attributed verbatim to Shannon; explain the duality (his p. 713 duality remark: "if in any of the a postulates the zero's are replaced by one's and the multiplications by additions and vice versa, the corresponding b postulate will result").

## 2. Information theory — Shannon 1948
- **Citation:** Shannon, C. E. "A Mathematical Theory of Communication." *Bell System Technical Journal* 27 (3): 379–423 (July 1948) and 27 (4): 623–656 (October 1948). DOIs 10.1002/j.1538-7305.1948.tb01338.x and 10.1002/j.1538-7305.1948.tb00917.x (Crossref check below).
- **URLs:** https://archive.org/details/bstj27-3-379 ; https://archive.org/details/bstj27-4-623 (collection `bstj-archives`, "The Bell System Technical Journal (1922-1983)").
- **Licence:** No CC licence. © AT&T (now Nokia Bell Labs). The archive.org collection was posted by Bell Labs; collection description signed "Rod Alferness, Chief Scientist, Bell Labs": "With this posting of the *Bell System Technical Journal* from volume 1 issue 1 in July 1922 to the final issue published in December 1983, we are pleased to be able to open the vault of this knowledge to our global technical colleagues." → free-to-read by the rights holder, not openly licensed; quote briefly, link, don't republish.
- **Robots:** archive.org allowed.
- **p. 380 (bstj27-3-379 leaf n1)** — the bit, verbatim from image:
  > "The choice of a logarithmic base corresponds to the choice of a unit for measuring information. If the base 2 is used the resulting units may be called binary digits, or more briefly *bits*, a word suggested by J. W. Tukey. A device with two stable positions, such as a relay or a flip-flop circuit, can store one bit of information. N such devices can store N bits, since the total number of possible states is 2^N and log₂2^N = N. If the base 10 is used the units may be called decimal digits. Since log₂ M = log₁₀ M / log₁₀ 2 = 3.32 log₁₀ M, a decimal digit is about 3⅓ bits. … the base e … The resulting units of information will be called natural units."
- **p. 393 (bstj27-3-379 leaf n14)** — entropy, verbatim:
  > "*Theorem 2:* The only H satisfying the three above assumptions is of the form:
  > **H = −K Σ_{i=1}^{n} p_i log p_i**
  > where K is a positive constant. … Quantities of the form H = −Σ p_i log p_i (the constant K merely amounts to a choice of a unit of measure) play a central role in information theory as measures of information, choice and uncertainty. … We shall call H = −Σ p_i log p_i the entropy of the set of probabilities p₁, …, p_n" (sentence continues on p. 394).
  Same page: the grouping example H(½, ⅓, ⅙) = H(½, ½) + ½ H(⅔, ⅓) (Fig. 6).
  (OCR, p. 394, line ~1042: binary case "H = −(p log p + q log q)" — not checked on image.)
- **pp. 639–640 (bstj27-4-623 leaves n16, n17)** — capacity with average power limitation, §24, verbatim:
  > p. 639: "A simple application of Theorem 16 is the case where the noise is a white thermal noise and the transmitted signals are limited to a certain average power P. Then the received signals have an average power P + N where N is the average noise power. … H(y) = W log 2πe(P + N), and the noise entropy is H(n) = W log 2πeN. The channel capacity is C = H(y) − H(n) = W log (P + N)/N. Summarizing we have the following:
  > *Theorem 17:* The capacity of a channel of band W perturbed by white" (p. 640) "thermal noise of power N when the average transmitter power is P is given by
  > **C = W log (P + N)/N.**
  > This means of course that by sufficiently involved encoding systems we can transmit binary digits at the rate W log₂ (P + N)/N bits per second, with arbitrarily small frequency of errors. It is not possible to transmit at a higher rate by any encoding system without a definite positive frequency of errors."
  - Note: (P+N)/N = 1 + P/N, so C = W log₂(1 + P/N) is an algebraic restatement (app may show both; the "1 + P/N" form is not printed on these pages).
  - p. 640 also: "Formulas similar to C = W log (P+N)/N for the white noise case have been developed independently by several other writers … N. Wiener, W. G. Tuller, and H. Sullivan".
- **Shannon 1949 "Communication in the Presence of Noise", Proc. IRE 37(1):10–21** — not openly available (IEEE); NOT fetched. Use the 1948 Theorem 17 instead.

## 3. Transistors and semiconductors

### 3a. Bardeen & Brattain 1948 — CITE ONLY
- Bardeen, J., and W. H. Brattain. "The Transistor, A Semi-Conductor Triode." *Physical Review* 74 (2): 230–231 (1948). DOI 10.1103/PhysRev.74.230 (Crossref check below). APS — not fetched (journals.aps.org on the never-fetch list). Cite only; no quotes.

### 3b. Shockley 1949 — the p-n junction (diode) equation
- **Citation:** Shockley, W. "The Theory of p-n Junctions in Semiconductors and p-n Junction Transistors." *Bell System Technical Journal* 28 (3): 435–489 (July 1949). DOI 10.1002/j.1538-7305.1949.tb03645.x (Crossref check below).
- **URL:** https://archive.org/details/bstj28-3-435 (56 images; leaf n = printed page − 435).
- **Licence:** same as Shannon 1948 (BSTJ, © AT&T/Nokia Bell Labs; posted free-to-read by Bell Labs; no CC licence).
- **Page image read:** n25 = p. 460 (§4.3 "D-C. Formulae").
- **Verbatim (p. 460):**
  > "The total direct hole current flowing in at x_a is I_p0 plus the current required to recombine with electrons in the p-region. This latter current is, of course, equal to the electron current flowing into the p-region. This electron current, denoted by I_n0 … is obtained by the same procedure as that leading to (4.11) for I_p0 except that bD replaces D and the subscripts of L and τ are now n. Combining the two currents leads to the total direct current:
  > **I₀ = I_p0 + I_n0 = (qD)(p_n/L_p + b n_p/L_n)(e^{q v₀/kT} − 1)   (4.13)**
  > for the direct current per unit area for applied potential v₀. The algebraic signs are such that I > 0 corresponds to current from the p-region to the n-region in the specimen; v₀ > 0 corresponds to a plus potential applied to the p-end."
  Footnote 12 (same page): "q ≡ magnitude of electronic charge; D ≡ diffusion constant for holes; p_n and n_n ≡ thermal equilibrium value of p and n, assumed constant throughout n-region …; n_p and p_p ≡ similar values for x < x_Tp; L_p ≡ diffusion length ≡ √(Dτ_p) for holes in n-region; τ_p ≡ lifetime of hole in n-region before recombination; b = electron mobility/hole mobility; L_n and τ_n similar quantities for electrons in p-region".
  - **Image caveat:** the 1949 print is poor at the prefactor; the glyphs inside the first parentheses and before n_p look like "L" and "t" on the scan. The surrounding text ("bD replaces D") and footnote 12 make the reading (qD) and b n_p unambiguous. Quote as "(qD)(p_n/L_p + b n_p/L_n)" and say so.
  - Also p. 459 (OCR only, eq. 4.11): I_p0 = (q p_n D/L_p)(e^{q v₀/kT} − 1).
  - **App form:** I = I_s(e^{qV/kT} − 1) is the standard compact restatement of (4.13) with I_s = qD(p_n/L_p + b n_p/L_n) (per unit area). The compact "I_s" notation itself is NOT printed in Shockley 1949 — present it as "Shockley's equation (4.13), written compactly".
  - p. 456 (OCR only): "the total current will vary as exp(qδφ/kT) − 1. This is a theoretical rectification formula giving the maximum rectification for carriers of charge q."

### 3c. Silicon properties (300 K)
- **No US-government or openly licensed source found in this session** (see NOT FOUND). Best available accessible source:
- **Ioffe Institute, NSM Archive — "Physical Properties of Semiconductors: Silicon (Si) — Band structure and carrier concentration."** http://www.ioffe.ru/SVA/NSM/Semicond/Si/bandstr.html (fetched over **http**; https failed). Robots: http://www.ioffe.ru/robots.txt → 404 (no restrictions). **Licence: none stated** (no copyright or licence text in the page HTML). Numerical facts are not copyrightable; cite with attribution, do not copy page layout/figures. The NSM archive is the online version of Levinshtein, Rumyantsev & Shur (eds.), *Handbook Series on Semiconductor Parameters* (World Scientific, 1996) (this provenance statement is from background knowledge, not from the fetched page — verify on the NSM front page before citing it).
- Values verbatim ("Basic Parameters"; band-structure caption "Band structure of Si at 300 K"):
  - "Energy gap 1.12 eV"
  - "Intrinsic carrier concentration 1·10¹⁰ cm⁻³"
  - "Intrinsic resistivity 3.2·10⁵ Ω·cm"
  - "Effective conduction band density of states 3.2·10¹⁹ cm⁻³"; "Effective valence band density of states 1.8·10¹⁹ cm⁻³"
  - "Temperature dependence of the energy gap E_g = 1.17 − 4.73·10⁻⁴·T²/(T+636) (eV), where T is temperature in degrees K."
  - "n_i = (N_c·N_v)^{1/2}·exp(−E_g/(2k_B T))"
  - From http://www.ioffe.ru/SVA/NSM/Semicond/Si/basic.html ("Basic Parameters at 300 K"): "Crystal structure Diamond"; "Density 2.329 g cm⁻³"; "Dielectric constant 11.7"; "Electron affinity 4.05 eV"; "Lattice constant 5.431 A"; "Number of atoms in 1 cm³ 5·10²²".
  - Note: the modern accepted n_i(300 K) ≈ 1.0×10¹⁰ cm⁻³ (Sproul & Green 1991, J. Appl. Phys. 70, 846 — AIP, paywalled; cite only if needed). Older textbooks give 1.45×10¹⁰ cm⁻³; don't mix them.

## 4. Integrated circuits and Moore's law

### 4a. Moore 1965 — verbatim quote NOT OBTAINED
- **Citation:** Moore, Gordon E. "Cramming more components onto integrated circuits." *Electronics* 38 (8): 114–117, April 19, 1965. (Reprinted *Proc. IEEE* 86(1):82–85, 1998, DOI 10.1109/JPROC.1998.658762 — IEEE, paywalled; Crossref check below.)
- **Intel-hosted PDF:** https://download.intel.com/sites/channel/museum/Moores_Law/Articles-Press_Releases/Gordon_Moore_1965_Article.pdf (found by web search; landing page https://www.intel.com/content/www/us/en/history/museum-gordon-moore-law.html).
- **Robots:** www.intel.com robots.txt explicitly allows ClaudeBot and anthropic-ai (`Allow: /`). download.intel.com/robots.txt returns HTTP 403 (S3 AccessDenied), i.e. no robots file.
- **Terms — BLOCKING ISSUE:** Intel Terms of Use (https://www.intel.com/content/www/us/en/legal/terms-of-use.html, "Last modified: June 21, 2024") say the website and downloadable materials are "intended for personal and informational use only", and users may not: "4.1.14 Perform automated searches against Intel's systems … including using automated "bots," link checkers, or other scripts or web scraping technologies, without the prior written permission of Intel"; "4.1.16 Text mine, data mine, or harvest metadata from the Websites or the Materials".
  → I fetched the PDF once (single GET) before reading the terms. After reading them I **deleted the file without opening or extracting it**. No quote from it is recorded here. *Electronics* 1965 is not on archive.org (bitsavers has V38 N01–N07 and N09–N26, but **N08, 19 April 1965, is missing**).
- **Recommendation:** a person should read the Intel PDF in a browser (personal/informational use) and copy the doubling sentence with page number by hand, or cite Moore 1965 bibliographically and quote Intel's own museum-page wording instead (that page was not fetched either). Not in the PDF but often confused with it: the "every two years" figure comes from Moore's 1975 IEDM talk, not the 1965 article; the 1965 article projected yearly doubling to 1975 (background knowledge — verify on the page before use).

### 4b. Kilby and Noyce patents
- **Licence:** US patent text and drawings are generally treated as free of copyright (USPTO guidance cites 37 CFR 1.71(d)–(e) and 1.84(s) as the limited exceptions). This is background knowledge: the USPTO page was NOT fetched in this session. Both patents expired long ago.
- **Robots:** patents.google.com `User-agent: *` → `Disallow: /*`, `Allow: /patent/` → patent pages allowed. patentimages.storage.googleapis.com/robots.txt → 403 (no file); PDFs NOT downloaded.
- Text below is Google Patents' **OCR full text** (not image-verified; these are claims, not formulas).
- **US 3,138,743 — Kilby (Texas Instruments), "Miniaturized electronic circuits."** Filed 1959-02-06, issued 1964-06-23. https://patents.google.com/patent/US3138743A/en ; PDF link in page metadata: https://patentimages.storage.googleapis.com/30/d5/b4/ac7134ecd78946/US3138743.pdf
  - Description (OCR): "It is, therefore, a principal object of this invention to provide a novel miniaturized electronic circuit fabricated from a body of semiconductor material containing a diffused p-n junction wherein all components of the electronic circuit are completely integrated into the body of semiconductor material."
  - Claim 1 (OCR): "In an integrated circuit having a plurality of electrical circuit components in a wafer of single-crystal semiconductor material, a plurality of junction transistors defined in the wafer, each transistor including thin layers of semiconductor material of opposite conductivity-types adjacent one major face of the wafer providing a base and an emitter region which overlie a collector region, … a plurality of thin elongated regions of the wafer exhibiting substantial resistance to provide semiconductor resistors, … and conductive means connecting selected ones of the elongated regions to regions of selected ones of the transistors."
  - Claim 12 (OCR) begins "An integrated circuit comprising a wafer of single crystal semiconductor material having a plurality of electrical circuit components therein…".
  - Caution: Google's "Abstract" field on this page is actually the abstract of British spec. GB 945,749 (TI) — do not quote it as the US patent's abstract.
- **US 2,981,877 — Noyce (Fairchild Semiconductor), "Semiconductor device-and-lead structure."** Filed 1959-07-30, issued 1961-04-25. https://patents.google.com/patent/US2981877A/en ; PDF: https://patentimages.storage.googleapis.com/e1/73/1e/7404cd5ad6325c/US2981877.pdf
  - Claim 1 (OCR): "A semiconductor device comprising a body of semiconductor having a surface, said body containing adjacent P-type and N-type regions with a junction therebetween extending to said surface, two closely spaced contacts adherent to said surface upon opposite sides of and adjacent to one portion of said junction, an insulating layer consisting essentially of oxide of said semiconductor on and adherent to said surface, said layer extending across a different portion of said junction, and an electrical connection to one of said contacts comprising a conductor adherent to said layer, said conductor extending from said one contact over said layer across said different portion of the junction…"
  - Claim 9 (OCR): "…an insulating layer consisting essentially of oxide of said semiconductor on said surface … and electrical interconnections between said contacts comprising metal strips adherent to said layer and extending over said layer across a plurality of said junctions."
  - **Summary for app:** Kilby's patent claims transistors and resistors formed together in one single-crystal wafer and connected; Noyce's claims metal leads laid *on top of the semiconductor's own oxide layer*, so connections can cross junctions without shorting them — the planar interconnect.

## 5. Computer architecture — von Neumann, First Draft of a Report on the EDVAC (1945)
- **Citation:** von Neumann, John. *First Draft of a Report on the EDVAC.* Contract No. W-670-ORD-4926 between the United States Army Ordnance Department and the University of Pennsylvania. Moore School of Electrical Engineering, University of Pennsylvania, June 30, 1945. (Title page read on image, leaf n2.)
- **URL used:** https://archive.org/details/20200901-vN_First_Draft_Report_EDVAC_Moore_Sch_1945 — scan of the Moore School Library copy (stamp "MOORE SCHOOL OF ELEC. ENG. LIBRARY"), uploaded via M. D. Godfrey (Stanford). archive.org licenseurl: **http://creativecommons.org/publicdomain/mark/1.0/** (Public Domain Mark).
  - Alternative: https://archive.org/details/firstdraftofrepo00vonn (Smithsonian Libraries copy, formerly NBS/Samuel N. Alexander; "No known copyright restrictions as determined by scanning institution"; "Most pages had badly faded print").
  - Avoid https://archive.org/details/vnedvac (55 pp. — appears to be a retypeset edition, likely Godfrey's 1993 IEEE Annals version; edition copyright unclear).
- **Status:** a contract report to US Army Ordnance written by a consultant — **not** a work of a federal employee, so not automatically PD under 17 U.S.C. §105. It was distributed in 1945 with no copyright notice on the title page (checked on image), which under the 1909 Act placed it in the US public domain if the distribution counted as publication. Use the archive.org PDM label plus "no copyright notice; US Army Ordnance contract report, 1945".
- **Page offset:** leaf n = printed page + 7 (n9 = "-2-", n10 = "-3-", n14 = "-7-", n92 = "-85-").
- **Verbatim, from page images:**
  - p. 3 (n10) §2.2: "First: Since the device is primarily a computor, it will have to perform the elementary operations of arithmetics most frequently. There are addition, subtraction, multiplication and division: +, −, x, ÷. It is therefore reasonable that it should contain specialized organs for just these operations. … At any rate a central arithmetical part of the device will probably have to exist, and this constitutes the first specific part: CA." (spelling "computor" as in original)
  - p. 3–4 (n10–n11) §2.3: "Second: The logical control of the device, that is the proper sequencing of its operations can be most efficiently carried out by a central control organ. If the device is to be elastic, that is as nearly as possible all purpose, then a distinction must be made between the specific instructions given for and defining a particular problem, and the general control organs which see to it that these instructions – no matter what they are – are carried out. The former must be stored in some way – in existing devices this is done as indicated in 1.2 – the latter are represented by definite operating parts of the device. By the central control we mean this latter function only, and the organs which perform it form the second specific part: CC."
  - p. 4 (n11) §2.4: "Third: Any device which is to carry out long and complicated sequences of operations (specifically of calculations) must have a considerable memory." … "(b) The instructions which govern a complicated problem may constitute a considerable material, particularly so, if the code is circumstantial (which it is in most arrangements). This material must be remembered."
  - p. 6 (n13) §2.5: "…it is nevertheless tempting to treat the entire memory as one organ, and to have its parts even as interchangeable as possible for the various functions enumerated above. … At any rate the total memory constitutes the third specific part of the device: M."
  - p. 6 (n13) §2.6: "The three specific parts CA, CC (together C) and M correspond to the associative neurons in the human nervous system. It remains to discuss the equivalents of the sensory or afferent and the motor or efferent neurons. These are the input and the output organs of the device…"
  - p. 7 (n14): "That medium will be called the outside recording medium of the device: R." §2.7: "Fourth: The device must have organs to transfer (numerical or other) information from R into its specific parts C and M. These organs form its input, the fourth specific part: I. It will be seen, that it is best to make all transfers from R (by I) into M, and never directly into C". §2.8: "Fifth: The device must have organs to transfer (presumably only numerical information) from its specific parts C and M into R. These organs form its output, the fifth specific part: O."
  - **Stored program, p. 85 (n92) §14.1:** "The orders which are received by C come from M, i.e. from the same place where the numerical material is stored. (cf. 2.4 and 12.3 in particular (b).) The content of M consists of minor cycles …, hence by the above each minor cycle must contain a distinguishing mark, which indicates whether its is a standard number or an order." Same page: "(c) Orders for CC to transfer its own connection with M to a different point in M, with the purpose of getting its next order from there." [i.e. a jump/branch]
  - (OCR only, §12.2–12.3, ~p. 57–58: "In this way we arrive at 32 = 2⁵ units per number" and standard orders also "occupy precisely one minor cycle, i.e. 32 units" — not image-checked.)

## 6. Binary prefixes — NIST
- **Citation:** NIST Physical Measurement Laboratory, "Definitions of the SI units: The binary prefixes — Prefixes for binary multiples." https://physics.nist.gov/cuu/Units/binary.html (fetched 2026-11-28; HTTP 200).
- **Licence:** US Government work (NIST), public domain in the US, **except** the "Historical context" box, which the page labels: "*Historical context adapted from: Bruce Barrow, "A Lesson in Megabytes," IEEE Standards Bearer, January 1997, page 5. Portions copyright © 1997 by the Institute of Electrical and Electronics Engineers, Inc. … Information is reprinted with the permission of the IEEE.*" → **do not reproduce the Historical context text**; the table and the rest of the page are NIST's.
- **Robots:** physics.nist.gov/robots.txt → 404 (no restrictions).
- **Verbatim:**
  > "In December 1998 the International Electrotechnical Commission (IEC), the leading international organization for worldwide standardization in electrotechnology, approved as an IEC International Standard names and symbols for prefixes for binary multiples for use in the fields of data processing and data transmission."
  - Table "Prefixes for binary multiples" (Factor | Name | Symbol | Origin | Derivation):
    2¹⁰ | kibi | Ki | kilobinary: (2¹⁰)¹ | kilo: (10³)¹
    2²⁰ | mebi | Mi | megabinary: (2¹⁰)² | mega: (10³)²
    2³⁰ | gibi | Gi | gigabinary: (2¹⁰)³ | giga: (10³)³
    2⁴⁰ | tebi | Ti | terabinary: (2¹⁰)⁴ | tera: (10³)⁴
    2⁵⁰ | pebi | Pi | petabinary: (2¹⁰)⁵ | peta: (10³)⁵
    2⁶⁰ | exbi | Ei | exabinary: (2¹⁰)⁶ | exa: (10³)⁶
  - Examples: "one kibibit 1 Kibit = 2¹⁰ bit = 1024 bit"; "one kilobit 1 kbit = 10³ bit = 1000 bit"; "one byte 1 B = 2³ bit = 8 bit"; "one mebibyte 1 MiB = 2²⁰ B = 1 048 576 B"; "one megabyte 1 MB = 10⁶ B = 1 000 000 B"; "one gibibyte 1 GiB = 2³⁰ B = 1 073 741 824 B"; "one gigabyte 1 GB = 10⁹ B = 1 000 000 000 B".
  - "It is important to recognize that the new prefixes for binary multiples are not part of the International System of Units (SI), the modern metric system."
  - "…the name of each new prefix is derived from the name of the corresponding SI prefix by retaining the first two letters of the name of the SI prefix and adding the letters "bi," which recalls the word "binary." Similarly, the symbol of each new prefix is derived from the symbol of the corresponding SI prefix by adding the letter "i" … (For consistency with the other prefixes for binary multiples, the symbol Ki is used for 2¹⁰ rather than ki.)"
  - Official publication: "first adopted by the IEC as Amendment 2 to IEC International Standard IEC 60027-2 … publication date of 1999-01 … second edition of IEC 60027-2, … 2000-11".
  - Note: this NIST page stops at exbi (2⁶⁰). zebi (2⁷⁰) and yobi (2⁸⁰), added later in IEC 80000-13:2008, are **not** on this page; don't cite NIST for them.

## 7. Networking — RFCs (rfc-editor.org)
- **Robots:** www.rfc-editor.org allows everything except /rfc/authors/, /rfc/rerendered/, /rfc/v3test/. Files fetched: /rfc/rfc791.txt, /rfc/rfc9293.txt, /rfc/rfc1122.txt (all 200).
- **Licence, IETF Trust Legal Provisions (TLP 5.0, "Corrected Legal Provisions Relating to IETF Documents", effective March 25, 2015; https://trustee.ietf.org/documents/trust-legal-provisions/tlp-5/; trustee.ietf.org robots: `User-agent: *  Disallow:` (blank = allow all)).** Section 3.c, verbatim:
  > "the IETF Trust hereby grants to each person who wishes to exercise such rights, to the greatest extent that it is permitted to do so, a non-exclusive, royalty-free, worldwide right and license under all copyrights and rights of authors: i. to copy, publish, display and distribute IETF Contributions and IETF Documents in full and without modification, ii. to translate … iii. to copy, publish, display and distribute unmodified portions of IETF Contributions and IETF Documents and translations thereof, provided that: (x) each such portion is clearly attributed to IETF and identifies the RFC or other IETF Document or IETF Contribution from which it is taken, (y) all IETF legends, legal notices and indications of authorship contained in the original IETF RFC must also be included where any substantial portion of the text of an IETF RFC, and in any event where more than one-fifth of such text, is reproduced in a single document or series of related documents."
  > 3.d "Licenses that are not Granted … i. any license to modify IETF Contributions or IETF Documents, or portions thereof … in any context outside the IETF Standards Process".
  - **For the app:** quote unmodified excerpts, attribute "IETF, RFC nnnn", don't paraphrase inside quotation marks.
  - TLP §2.c: documents published before the effective date "remain subject to the licensing provisions of the IETF copyright policy document in effect at the time of their contribution or publication, as applicable, including RFCs 1310, 1602, 2026, 3978 and 4748". RFC 791 (1981) has no copyright notice in its text; RFC 1122 (1989) predates the Trust. RFC 9293 (2022) carries: "Copyright (c) 2022 IETF Trust and the persons identified as the document authors. All rights reserved. This document is subject to BCP 78 and the IETF Trust's Legal Provisions Relating to IETF Documents (https://trustee.ietf.org/license-info) in effect on the date of publication of this document."

### 7a. RFC 791 — Internet Protocol (IPv4)
- Postel, J. (ed.). "Internet Protocol — DARPA Internet Program Protocol Specification." RFC 791, September 1981. DOI 10.17487/RFC0791. https://www.rfc-editor.org/rfc/rfc791.txt
- §3.1 "Internet Header Format", Figure 4 "Example Internet Datagram Header" (text-file pages 11–14). The header diagram rows, verbatim: |Version| IHL |Type of Service| Total Length | / | Identification |Flags| Fragment Offset | / | Time to Live | Protocol | Header Checksum | / | Source Address | / | Destination Address | / | Options | Padding |. "Note that each tick mark represents one bit position." (32-bit rows.)
- Field sizes, verbatim: "Version: 4 bits", "IHL: 4 bits", "Type of Service: 8 bits", "Total Length: 16 bits", "Identification: 16 bits", "Flags: 3 bits", "Fragment Offset: 13 bits", "Time to Live: 8 bits", "Protocol: 8 bits", "Header Checksum: 16 bits", "Source Address: 32 bits", "Destination Address: 32 bits".
- Quotes:
  - p. 11: "The Version field indicates the format of the internet header. This document describes version 4." "Internet Header Length is the length of the internet header in 32 bit words, and thus points to the beginning of the data. Note that the minimum value for a correct header is 5." [5 × 32 bits = 20 octets — derived]
  - p. 12: "Total Length is the length of the datagram, measured in octets, including internet header and data. This field allows the length of a datagram to be up to 65,535 octets. … All hosts must be prepared to accept datagrams of up to 576 octets (whether they arrive whole or in fragments)."
  - p. 14: "Time to Live: … This field indicates the maximum time the datagram is allowed to remain in the internet system. If this field contains the value zero, then the datagram must be destroyed. … The time is measured in units of seconds, but since every module that processes a datagram must decrease the TTL by at least one even if it process the datagram in less than a second, the TTL must be thought of only as an upper bound on the time a datagram may exist."
  - p. 14: "Header Checksum: … The checksum field is the 16 bit one's complement of the one's complement sum of all 16 bit words in the header."
  - p. 14: "Source Address: 32 bits … Destination Address: 32 bits".

### 7b. RFC 9293 — TCP (obsoletes RFC 793)
- Eddy, W. (ed.). "Transmission Control Protocol (TCP)." RFC 9293 / STD 7, August 2022. DOI 10.17487/RFC9293. https://www.rfc-editor.org/rfc/rfc9293.txt. Header: "Obsoletes: 793, 879, 2873, 6093, 6429, 6528, 6691"; "Updates: 1011, 1122, 5961". (The .txt has no page numbers; cite § numbers.)
- §3.5 "Establishing a Connection", verbatim:
  > "The "three-way handshake" is the procedure used to establish a connection. This procedure normally is initiated by one TCP peer and responded to by another TCP peer. The procedure also works if two TCP peers simultaneously initiate the procedure."
  > Figure 6 "Basic Three-Way Handshake for Connection Synchronization":
  > ```
  >     TCP Peer A                                           TCP Peer B
  > 1.  CLOSED                                               LISTEN
  > 2.  SYN-SENT    --> <SEQ=100><CTL=SYN>               --> SYN-RECEIVED
  > 3.  ESTABLISHED <-- <SEQ=300><ACK=101><CTL=SYN,ACK>  <-- SYN-RECEIVED
  > 4.  ESTABLISHED --> <SEQ=101><ACK=301><CTL=ACK>       --> ESTABLISHED
  > 5.  ESTABLISHED --> <SEQ=101><ACK=301><CTL=ACK><DATA> --> ESTABLISHED
  > ```
  > "In line 2 of Figure 6, TCP Peer A begins by sending a SYN segment indicating that it will use sequence numbers starting with sequence number 100. In line 3, TCP Peer B sends a SYN and acknowledges the SYN it received from TCP Peer A. Note that the acknowledgment field indicates TCP Peer B is now expecting to hear sequence 101, acknowledging the SYN that occupied sequence 100. At line 4, TCP Peer A responds with an empty segment containing an ACK for TCP Peer B's SYN; and in line 5, TCP Peer A sends some data. Note that the sequence number of the segment in line 5 is the same as in line 4 because the ACK does not occupy sequence number space (if it did, we would wind up ACKing ACKs!)."
  > "The principal reason for the three-way handshake is to prevent old duplicate connection initiations from causing confusion."
- RFC 793 (1981) is obsoleted; cite 9293 as the current text and 793 only for history.

### 7c. RFC 1122 — host requirements
- Braden, R. (ed.). "Requirements for Internet Hosts — Communication Layers." RFC 1122, October 1989. DOI 10.17487/RFC1122. https://www.rfc-editor.org/rfc/rfc1122.txt
- §1.2.2 "Robustness Principle" (text line ~691): "At every layer of the protocols, there is a general rule whose application can lead to enormous benefits in robustness and interoperability [IP:1]: "Be liberal in what you accept, and conservative in what you send"" — lead-in and maxim checked in the file (text lines 685–692); continuation: "Software should be written to deal with every conceivable error, no matter how unlikely; sooner or later a packet will come in with that particular combination of errors and attributes, and unless the software is prepared, chaos can ensue."
- §3.1: "The Robustness Principle: "Be liberal in what you accept, and conservative in what you send" is particularly important in the Internet layer, where one misbehaving host can deny Internet service to many other hosts."
- Note: RFC 9293 says it "updates … 1122 … and it should be considered as a replacement for the portions of those documents dealing with TCP requirements."

## 8. Data-center energy — LBNL

### 8a. 2024 report (Shehabi et al., LBNL-2001637) — NOT RETRIEVED
- Citation (as given in the 2025 Update's reference list, p. 28 text layer): "Shehabi, A., Smith, S. J., Hubbard, A., Newkirk, A. C., Siddik, M. A. B., Holocek, B., Koomey, J. G., Masanet, E. R., & Sartor, D. (2024). United States Data Center Energy Usage Report. Lawrence Berkeley National Lab."
- Access attempt: https://eta-publications.lbl.gov/sites/default/files/2024-12/lbnl-2024-united-states-data-center-energy-usage-report.pdf **redirects to https://escholarship.org/uc/item/32d6m0d1**, which returned **HTTP 403 "Request blocked" (CloudFront)**. escholarship.org/robots.txt also returned 403. I treated this as a bot wall and did not retry or work around it. OSTI API searches (title; report number LBNL-2001637; author Shehabi, Dec 2024–Jan 2025) found no OSTI record for the 2024 report.
- → 2023 total, 2028 range and PUE definition **from the 2024 report itself: NOT FOUND**. What the 2025 Update says about it is below.

### 8b. 2025 Update (supersedes the 2024 report; recommended instead)
- **Citation (verbatim from p. ii):** "Smith, S.J., Hubbard, A., Newkirk, A., Ganeshalingam, M., Holecek, B., Sartor, D., Mills, M., Shehabi, A. 2026. United States Data Center Energy Usage Report: 2025 Update. Lawrence Berkeley National Laboratory, Berkeley, California. LBNL-2001758. https://doi.org/10.71468/P1RP4F" (published June 2026; OSTI ID 3374245).
- **URL fetched:** https://www.osti.gov/servlets/purl/3374245 (PDF, 37 pp., born-digital; text extracted with macOS PDFKit; text layer is acceptable). Landing page https://www.osti.gov/biblio/3374245.
- **Robots:** www.osti.gov `User-Agent: *` disallows /account, /search/, /pages/search, /opennet/document, etc.; /servlets/purl/ and /api/v1/records allowed.
- **Licence:** eScholarship cover sheet (PDF p. 2): "Copyright Information — This work is made available under the terms of a Creative Commons Attribution License, available at https://creativecommons.org/licenses/by/4.0/". Copyright notice (p. ii): "This manuscript has been authored by an author at Lawrence Berkeley National Laboratory under Contract No. DE-AC02-05CH11231 with the U.S. Department of Energy. The U.S. Government retains … a non-exclusive, paid-up, irrevocable, worldwide license to publish or reproduce the published form of this manuscript…". → **CC BY 4.0** (LBNL is a contractor, so this is not a federal-employee PD work).
- **Values (printed page numbers from the footer "United States Data Center Energy Usage Report: 2025 Update | N"):**
  - p. 4 (Glossary): "PUE (Power Usage Effectiveness) – A measure of how efficiently a data center uses energy, specifically the ratio of total building energy usage to that used by the IT equipment alone."
  - p. 24 (§3.5): "Facility infrastructure energy performance is commonly characterized using power usage effectiveness (PUE), defined as the ratio of total facility energy use (including cooling and power distribution) to IT equipment energy use (excluding facility infrastructure). Using the methodology from the 2024 Report, we estimate an average national PUE of 1.145 in 2024 for facilities serving AI equipment, declining modestly to 1.136 in 2030."
  - p. 24 (§3.6): "Infrastructure consumes 36% of total data center electricity in 2018, declining to 31% in 2024 as the national average PUE improves from 1.55 to 1.45."
  - p. 5 (Executive Summary): "This report updates the 2024 Data Center Energy Usage Report (2024 Report) and estimates that data centers could account for 11.8% of total U.S. electricity by 2030. The estimate also includes a range of scenarios that indicate the energy use could be between 9.5 and 15.3% of total U.S. electricity use by 2030. In comparison, **the 2024 Report estimate range was 6.7% to 12.0% of total U.S. electricity by 2028**." "The Reference Case estimate for electricity use (649 TWh in 2030)…"; "…producing the ultimate estimate bounds of 521-843 TWh of U.S. data center electricity consumption in 2030."
  - p. 8: "Consistent with the 2024 Report, the energy use of cryptocurrency mining is not included in the scope of this report. **The updated estimate of data center electricity use in 2024 is 192 terawatt-hours (TWh), accounting for 4.7% of total U.S. electricity consumption.** This falls at the low end of the estimated range in the 2024 Report, with revised estimates of electricity use in prior years falling slightly below 2024 Report estimates. … our current Reference Case forecast for total electricity use in 2028 is 464 TWh, which falls in the middle of the range presented in the 2024 Report." "The Reference Case estimate for 2030 data center electricity use is 649 TWh, representing 11.8% of forecasted 2030 U.S. electricity use…" Footnote 1: "2024 is considered the last historical year of this analysis…"
  - p. 9: "This yields a Compounded Uncertainty Range of 521–843 TWh, equal to 9.5–15.3% of total U.S. electricity use in 2030."
  - p. 10: "Historical estimates from sources including EPRI, Goldman Sachs, and Boston Consulting Group show broad agreement that U.S. data center electricity use grew from roughly 60–80 TWh around 2017 to approximately 150–200 TWh by 2023."
  - p. 4: "TWh (Terawatt-hour) – A unit of energy equal to one trillion watt-hours".
  - Note: this update **revises the earlier years downward** ("revised estimates of electricity use in prior years falling slightly below 2024 Report estimates"). The 2024 report's 2023 figure is NOT in this file, so do not quote it from memory.

## 9. Character encoding — Unicode
- **Robots (www.unicode.org):** `User-agent: *` disallows /draft/, **/Public/16.0.0/ ("obsolete data")**, **/charts/PDF/Unicode-16.0 ("obsolete version")**, older /Public/x.y/ trees and some old TR revisions. /versions/… pages are allowed. I did **not** touch /Public/16.0.0/ (UCD data files for 16.0) — the 16.0 character count below comes from the allowed /versions/ summary page instead.
- **Terms (https://www.unicode.org/copyright.html, "Unicode Terms of Use"), verbatim key parts:**
  - "All Unicode Data Files and Unicode Software are subject to the terms and conditions of the free and open-source Unicode License v3, unless otherwise indicated…" (Data Files = computer data files under /Public/, /reports/, /ivd/data/, github.com/unicode-org/, "but exclude any materials present in the above directories that are not computer data files, such as PDF code charts and Technical Reports").
  - "You may freely download and make copies of the Unicode® Standard Core Specification, Unicode Technical Reports, Unicode Technical Notes, Unicode Code Charts, and other portions of this website and may annotate and translate such permitted downloads and copies, provided that such downloads, copies, annotations, and translations are solely for personal or internal business purposes and not for public distribution…"
  - "Except where otherwise more broadly permitted or licensed: you may not make copies of or modifications to Unicode Products for public distribution, or incorporate Unicode Products in whole or in part into any product or publication, or otherwise publicly distribute them, without the express written permission of Unicode, and you may not copy or extract fonts or font data from any Unicode Products, including but not limited to Unicode Code Charts."
  - **Consequence:** the Core Specification prose and tables are **NOT** openly licensed (only the data files under Unicode License v3 are). The app may state facts (counts, byte patterns) with citation and link, and quote short definitions under fair use. It must **not** reproduce code-chart glyphs or copy whole tables verbatim; draw the UTF-8 table itself.
  - Unicode License v3 (https://www.unicode.org/license.txt), verbatim grant: "Permission is hereby granted, free of charge, to any person obtaining a copy of data files and any associated documentation (the "Data Files") or software and any associated documentation (the "Software") to deal in the Data Files or Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, and/or sell copies of the Data Files or Software, … provided that either (a) this copyright and permission notice appear with all copies of the Data Files or Software, or (b) this copyright and permission notice appear in associated Documentation." ("Copyright © 1991-2026 Unicode, Inc.")
- **Character counts (verbatim, from the version summary pages):**
  - Unicode 16.0.0 (https://www.unicode.org/versions/Unicode16.0.0/, dated "2024 September 10"): "**Unicode 16.0 adds 5185 characters, for a total of 154,998 characters.** The new additions include seven new scripts: Garay … Gurung Khema, Kirat Rai, Ol Onal and Sunuwar … Todhri … Tulu-Tigalari…"
  - Unicode 17.0.0 (https://www.unicode.org/versions/Unicode17.0.0/, "2025 September 9"): "Unicode 17.0 adds 4803 characters, for a total of 159,801 characters. The new additions include 4 new scripts: Sidetic, Tolong Siki, Beria Erfe, Tai Yo".
  - **Unicode 18.0.0 is the current version** (https://www.unicode.org/versions/latest/ → /versions/Unicode18.0.0/, "2026 September 16"): "Unicode 18.0 adds 13,007 characters, for a total of 172,808 characters." Caveat: that page still shows an active "STATUS: This is a preliminary draft page for an upcoming release…" box although the release date has passed. Robots now calls 16.0 "obsolete", so **the app should present 18.0 (or say "as of Unicode 16.0, 2024")**.
  - Note: these are counts of *assigned characters*, not code points. Codespace, from Core Spec 16.0 Chapter 3 (https://www.unicode.org/versions/Unicode16.0.0/core-spec/chapter-3/), verbatim: "D9 Unicode codespace: A range of integers from 0 to 10FFFF₁₆." "D10 Code point: Any value in the Unicode codespace." (0 to 10FFFF₁₆ = 1,114,112 code points — derived arithmetic, not quoted.)
- **UTF-8 (Core Spec 16.0, Chapter 3, §3.9, D92 and Tables 3-6 and 3-7; HTML, no page numbers — cite by table number):**
  - D92 verbatim: "UTF-8 encoding form: The Unicode encoding form that assigns each Unicode scalar value to an unsigned byte sequence of one to four bytes in length, as specified in Table 3-6 and Table 3-7. In UTF-8, the code point sequence <004D, 0430, 4E8C, 10302> is represented as <4D D0 B0 E4 BA 8C F0 90 8C 82>, where <4D> corresponds to U+004D, <D0 B0> corresponds to U+0430, <E4 BA 8C> corresponds to U+4E8C, and <F0 90 8C 82> corresponds to U+10302."
  - Table 3-6 "UTF-8 Bit Distribution" (Scalar Value → First / Second / Third / Fourth Byte):
    - 00000000 0xxxxxxx → 0xxxxxxx
    - 00000yyy yyxxxxxx → 110yyyyy 10xxxxxx
    - zzzzyyyy yyxxxxxx → 1110zzzz 10yyyyyy 10xxxxxx
    - 000uuuuu zzzzyyyy yyxxxxxx → 11110uuu 10uuzzzz 10yyyyyy 10xxxxxx
  - Table 3-7 "Well-Formed UTF-8 Byte Sequences": U+0000..U+007F: 00..7F | U+0080..U+07FF: C2..DF 80..BF | U+0800..U+0FFF: E0 A0..BF 80..BF | U+1000..U+CFFF: E1..EC 80..BF 80..BF | U+D000..U+D7FF: ED 80..9F 80..BF | U+E000..U+FFFF: EE..EF 80..BF 80..BF | U+10000..U+3FFFF: F0 90..BF 80..BF 80..BF | U+40000..U+FFFFF: F1..F3 80..BF 80..BF 80..BF | U+100000..U+10FFFF: F4 80..8F 80..BF 80..BF.
  - Verbatim: "As a consequence of the well-formedness conditions specified in Table 3-7, the following byte values are disallowed in UTF-8: C0–C1, F5–FF." Example: "The byte sequence <C0 AF> is ill-formed, because C0 is not well-formed in the "First Byte" column."

## DOI verification (api.crossref.org, 2026-11-28)
| DOI | Crossref result |
|---|---|
| 10.1109/T-AIEE.1938.5057767 | ✔ "A symbolic analysis of relay and switching circuits", Trans. AIEE 57(12):713–723, 1938-12, Shannon |
| 10.1002/j.1538-7305.1948.tb01338.x | ✔ "A Mathematical Theory of Communication", BSTJ 27(3):379–423, 1948-07 |
| 10.1002/j.1538-7305.1948.tb00917.x | ✔ same title, BSTJ 27(4):623–656, 1948-10 |
| 10.1002/j.1538-7305.1949.tb03645.x | ✔ Shockley, BSTJ 28(3):435–489, 1949-07 |
| 10.1103/PhysRev.74.230 | ✔ Bardeen & Brattain, "The Transistor, A Semi-Conductor Triode", Phys. Rev. 74(2):230–231, 1948-07-15 |
| 10.1109/JPROC.1998.658762 | ✔ Moore, "Cramming More Components Onto Integrated Circuits", Proc. IEEE 86(1):82–85, 1998-01 (reprint) |
| 10.17487/rfc791 | ✔ in Crossref (lower-case, no leading zero); doi.org handle 10.17487/RFC0791 → https://www.rfc-editor.org/info/rfc791 |
| 10.17487/RFC9293 | ✔ "Transmission Control Protocol (TCP)", 2022-08 |
| 10.17487/RFC1122 | ✔ "Requirements for Internet Hosts - Communication Layers", 1989-10 |
| 10.71468/P1RP4F | not in Crossref (non-Crossref registrant); doi.org handle API resolves to https://escholarship.org/uc/item/33m6w3x0 ✔ (note: doi.org/robots.txt returned 301 and was not followed before the handle-API call) |
| 2024 LBNL report | no DOI found (Crossref bibliographic search returned only the 2016 report, 10.2172/1372902) |

## NOT FOUND / not obtained
1. **Moore 1965 verbatim doubling sentence + page**: Intel's PDF exists, but Intel's Terms of Use forbid bots, scraping and text mining (§4.1.14, §4.1.16). The file was deleted unread. *Electronics* 19 April 1965 (V38 N08) is not on archive.org. → A person should read and copy it by hand.
2. **LBNL 2024 report (LBNL-2001637)**: the PDF redirects to eScholarship, which returns a CloudFront 403 bot block. No OSTI record. Its own 2023 TWh value, 2028 range in TWh, and PDF page numbers were not obtained. Its 2028 range *as a share* (6.7%–12.0%) is quoted in the 2025 Update.
3. **Openly licensed / US-gov source for silicon band gap and n_i**: not found this session. The Ioffe NSM values have no stated licence.
4. **Shannon 1949 "Communication in the Presence of Noise"** (Proc. IRE): not open; not fetched.
5. **Shannon MIT thesis**: available but under restrictive MIT terms (view/print only, no redistribution).
6. **Formal copyright-renewal check** for Trans. AIEE 1938 and BSTJ 1948/1949: not performed.
7. **NIST zebi/yobi**: not on the NIST page (it stops at exbi).
8. **Unicode 16.0 UCD data files**: robots disallows /Public/16.0.0/, so not fetched (not needed).
9. **Boole Prop. III (1 − x) on p. 48**: OCR only; image not checked.
