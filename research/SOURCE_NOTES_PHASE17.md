# Phase 17 — Mechanical & Electrical Engineering: source research

Researcher UA: "VoyagerVentures-Research/0.1 (educational; respects robots.txt)"; >=1.1 s between requests per host. Research date 2026-11-28.
Raw files: /tmp/vv-research/p17/ (robots/, kirchhoff/, ohm/, ...).
Page-image convention: archive.org `page/n<N>_w1200.jpg` is 0-indexed; leaf = N+1 (verified against _page_numbers.json for each item where used).

## Robots / terms log
| Host | robots.txt result | Decision |
|---|---|---|
| archive.org | 200; `User-agent: *` disallows only /control/, /report/ ; no ClaudeBot group | OK |
| www.eia.gov | 200; `*` Allow / with disallows (/archive/, /reports/, /survey, /oil_gas/, /global/, /scripts, /rss, ...); no ClaudeBot group | OK for /energyexplained/, /tools/faqs/, /electricity/ |
| www.energy.gov | 200; standard Drupal robots (`*` disallows /admin/, /search/, /user/..., /core/, /profiles/) | OK for content pages |
| afdc.energy.gov | 200; empty (comment only) | OK |
| www.grc.nasa.gov | /robots.txt returns HTML 404 page (HTTrack mirror notice) -> no robots restrictions | OK |
| www.anl.gov | Cloudflare "Just a moment..." JS challenge on robots.txt | BOT WALL — not fetched further, not worked around |
| www.fueleconomy.gov | robots.txt request: connection reset by peer / HTTP2 CANCEL (both http/2 and http/1.1) | BLOCKED to automated client — not fetched further |
| www.nrel.gov | DNS: "Could not resolve host" (also nrel.gov) | unreachable — not used |

## 1. Ohm's law and Kirchhoff's laws

### 1a. Ohm 1827 — Die galvanische Kette, mathematisch bearbeitet
- Citation: Ohm, G. S. (1827). *Die galvanische Kette, mathematisch bearbeitet.* Berlin: T. H. Riemann.
- Copy: Internet Archive `diegalvanischeke00ohmg` (Smithsonian Libraries, Burndy Library donor) — https://archive.org/details/diegalvanischeke00ohmg
- Licence: published 1827 -> US public domain; IA metadata: "Not in copyright. The Library knows of no copyright restrictions on this item."
- Read on PAGE IMAGES (OCR used only to locate):
  - p. 35 = leaf 43 (https://archive.org/download/diegalvanischeke00ohmg/page/n42_w1200.jpg): "stellt also S diese Größe des Stromes vor, so hat man S = κ·ω·IH′/BC, oder wenn man für IH′ seinen Werth A·λ′/L setzt S = (A/L)·(κ·ω·λ′/BC)." Then defines that λ, λ′, λ″ are now to be *equal* to the quotients of the lengths of the parts AB, BC, CD by the products of their conductivities and cross-sections ("reduzirte Länge"), giving S = IH′/λ′.
  - p. 36 = leaf 44 (…/page/n43_w1200.jpg), verbatim (Fraktur long-s rendered "ß"/"fs" as printed "Gröfse"):
    > "durch welche folgende allgemein gültige Regel ausgesprochen wird: *Die Gröfse des Stromes in irgend einem homogenen Theile der Kette wird durch den Quotienten bestimmt, den man aus dem Unterschiede der an den Enden dieses Theils vorhandenen elektrischen Kräfte und aus seiner reduzirten Länge bildet.* … Die zweite der vorigen Gleichungen geht durch die getroffene Abänderung über in
    > **S = A / L ,**
    > welche allgemein gültig ist und die Gleichheit der Gröfse des Stromes an allen Stellen der Kette schon durch ihre Form zu erkennen gibt; sie lautet in Worten so: *Die Gröfse des Stromes in einer galvanischen Kette ist der Summe aller Spannungen direkt, und der ganzen reduzirten Länge der Kette umgekehrt proportional,* wobei man sich erinnern mufs, dafs jetzt unter reduzirter Länge die Summe aller Quotienten verstanden wird, die aus den zu homogenen Theilen gehörigen wirklichen Längen"
  - (sentence continues on p. 37: "und dem Produkte der entsprechenden Leitungsvermögen und Querschnitte gebildet werden" — OCR only, NOT image-verified; end quote at "wirklichen Längen" or paraphrase.)
  - Translation (ours, for the app): S = A/L — "The magnitude of the current in a galvanic circuit is directly proportional to the sum of all the tensions [voltages], and inversely proportional to the total reduced length of the circuit", reduced length = Σ (length ÷ (conductivity × cross-section)) i.e. resistance. Modern form I = V/R.

### 1b. Kirchhoff 1845 — network (junction and loop) laws
- Original: Kirchhoff, G. (1845). "Ueber den Durchgang eines elektrischen Stromes durch eine Ebene, insbesondere durch eine kreisförmige." *Annalen der Physik und Chemie* (Poggendorff) Bd. 64 (1845) [= Ann. Phys. 140], pp. 497–514. The 1845 Annalen volume itself was NOT found on archive.org (no `sim_annalen-der-physik_1845*` items); the statement was read in the author's collected reprint:
- Read in: Kirchhoff, G. (1882). *Gesammelte Abhandlungen.* Leipzig: J. A. Barth. IA `gesammelteabhan00unkngoog` (Google scan) — https://archive.org/details/gesammelteabhan00unkngoog . Licence: 1882 -> US public domain.
- Page images:
  - p. 1 = leaf 19 (…/page/n18_w1200.jpg): title "Ueber den Durchgang eines elektrischen Stromes durch eine Ebene, insbesondere durch eine kreisförmige.¹)" footnote "1) Pogg. Annal. Bd. 64. 1845."
  - p. 15 = leaf 33 (…/page/n32_w1200.jpg), verbatim:
    > "Wird ein System von Drähten, die auf eine ganz beliebige Weise mit einander verbunden sind, von galvanischen Strömen durchflossen, so ist:
    > 1) wenn die Drähte 1, 2, .. μ in einem Punkte zusammenstossen,
    > **I₁ + I₂ + .. + I_μ = 0,**
    > wo I₁, I₂, .. die Intensitäten der Ströme bezeichnen, die jene"
  - p. 16 = leaf 34 (…/page/n33_w1200.jpg):
    > "Drähte durchfliessen, alle nach dem Berührungspunkte zu als positiv gerechnet;
    > 2) wenn die Drähte 1, 2, .. ν eine geschlossene Figur bilden,
    > **I₁·ω₁ + I₂·ω₂ + .. + I_ν·ω_ν**
    > = der Summe aller elektromotorischen Kräfte, die sich auf dem Wege: 1, 2 .. ν befinden; wo ω₁, ω₂, .. die Widerstände der Drähte, I₁, I₂ .. die Intensitäten der Ströme bezeichnen, von denen diese durchflossen werden, alle nach *einer* Richtung als positiv gerechnet.
    > Der erste Theil dieses Satzes ist eine unmittelbare Folge davon, dass dem Berührungspunkte der Drähte 1, 2, .. μ eben so viel Elektricität zugeführt, als entzogen wird; …"
    > "… Dieser Satz liefert uns durch wiederholte Anwendung immer so viel Gleichungen, als zur Bestimmung aller I's nöthig sind."
  - Also on p. 15: the bridge balance condition (AC):(BC) = (AD):(BD) (Wheatstone-bridge form, Fig. 4) — usable as an example.
  - Translation (ours): (1) where wires 1…μ meet at a point, I₁+I₂+…+I_μ = 0 (currents counted positive toward the junction); (2) where wires 1…ν form a closed figure, Σ I·ω = sum of all electromotive forces around the path. First part follows because "as much electricity is brought to the junction as is taken away".

## 2. Faraday's law of induction

### 2a. Faraday 1832 (First Series) — direction law / "cutting magnetic curves"
- Citation: Faraday, M. (1832). "Experimental Researches in Electricity." *Philosophical Transactions of the Royal Society of London* 122: 125–162. DOI 10.1098/rstl.1832.0006 (see Crossref check below).
- Copy: IA `philtrans01461252` — https://archive.org/details/philtrans01461252 ; IA licenseurl = CC Public Domain Mark 1.0; 1832 -> US PD.
- Page image p. 154 = leaf 31 (https://archive.org/download/philtrans01461252/page/n30_w1200.jpg) [n29 verified = p. 153]:
  > "114. The relation which holds between the magnetic pole, the moving wire or metal, and the direction of the current evolved, i. e. the law which governs the evolution of electricity by magneto-electric induction, is very simple, although rather difficult to express. … if it pass the pole in other directions, but so as to cut the magnetic curves* in the same general direction, … —then the current of electricity in the wire is from P to N. If it be carried in the reverse directions, the electric current will be from N to P."
  > Footnote: "* By magnetic curves, I mean the lines of magnetic forces, however modified by the juxtaposition of poles, which would be depicted by iron filings; or those to which a very small magnetic needle would form a tangent."
- Also on p. 153 = leaf 30 (n29), §110: "Upon connecting the ends of a plate of metal with the galvanometer wires, and then carrying it between the poles from end to end, … in either direction, no effect whatever was produced upon the galvanometer. But the moment the motion became transverse, the needle was deflected."

### 2b. Faraday 1852 (Twenty-Eighth Series) — quantitative law (amount ∝ lines cut)
- Citation: Faraday, M. (1852). "Experimental Researches in Electricity. Twenty-Eighth Series [On lines of magnetic force]." *Phil. Trans. R. Soc. Lond.* 142: 25–56. DOI 10.1098/rstl.1852.0004.
- Copy: IA `philtrans00549808`; licenseurl CC PDM 1.0; 1852 -> US PD.
- Page image p. 38 = leaf 14 (https://archive.org/download/philtrans00549808/page/n13_w1200.jpg), verbatim:
  > "3113. That obliquity of intersection causes no difference. …"
  > "3114. It is also evident, by the results of the rotation of the wire and magnet (3097. 3106.), that when a wire is moving amongst equal lines (or in a field of equal magnetic force), and with an uniform motion, then the current of electricity produced is proportionate to the *time*; and also to the *velocity* of motion."
  > "3115. They also prove, generally, that the quantity of electricity thrown into a current is directly as the amount of curves intersected."
  - This is Faraday's own statement of the law (charge ∝ flux cut ⇒ EMF = −dΦ/dt in modern form). Modern equation must be attributed to a modern source or labelled as modern notation; Maxwell not needed.

## 4b. Volta 1800 — the first battery (pile)
- Citation: Volta, A. (1800). "On the Electricity excited by the mere Contact of conducting Substances of different kinds. In a Letter from Mr. Alexander Volta … to the Rt. Hon. Sir Joseph Banks." *Phil. Trans. R. Soc. Lond.* 90: 403–431. DOI 10.1098/rstl.1800.0018. Letter dated "A Côme en Milanois, ce 20me Mars, 1800"; "Read June 26, 1800". NOTE: body of the letter is in FRENCH (title in English).
- Copy: IA `philtrans03035960`; licenseurl CC PDM 1.0; 1800 -> US PD.
- Page images:
  - p. 403 = leaf 1 (https://archive.org/download/philtrans03035960/page/n0_w1200.jpg):
    > "Le principal de ces resultats, et qui comprend à-peu-près tous les autres, est la construction d'un appareil qui ressemble pour les effets, c'est-à-dire, pour les commotions qu'il est capable de faire éprouver dans les bras, &c. aux bouteilles de Leyde, et mieux encore aux batteries électriques foiblement chargées, qui agiroient cependant sans cesse, ou dont la charge, après chaque explosion, se rétabliroit d'elle-même; qui jouiroit, en un mot, d'une charge indéfectible, d'une action sur le fluide électrique, ou impulsion, perpétuelle;"
  - p. 404 = leaf 2 (…/page/n1_w1200.jpg):
    > "Oui, l'appareil dont je vous parle, et qui vous étonnera sans doute, n'est que l'assemblage d'un nombre de bons conducteurs de différente espèce, arrangés d'une certaine manière. 30, 40, 60 pièces, ou d'avantage, de cuivre, ou mieux d'argent, appliquées chacune à une pièce d'étain, ou, ce qui est beaucoup mieux, de zinc, et un nombre égal de couches d'eau, ou de quelque autre humeur qui soit meilleur conducteur que l'eau simple, comme l'eau salée, la lessive, &c. ou des morceaux de carton, de peau, &c. bien imbibés de ces humeurs; … voilà tout ce qui constitue mon nouvel instrument;"
  - Translation (ours — label as such): "Yes, the apparatus I speak of, which will no doubt astonish you, is only an assemblage of a number of good conductors of different kinds arranged in a certain way: 30, 40, 60 or more pieces of copper, or better silver, each applied to a piece of tin, or, much better, zinc, and an equal number of layers of water, or some other liquid that conducts better than plain water, such as salt water, lye, etc., or pieces of card, leather, etc., well soaked in these liquids … that is all that constitutes my new instrument." Also p.403: a charge that "re-establishes itself" after each discharge — "an indefatigable charge, a perpetual action or impulse on the electric fluid".
  - (A contemporary English translation exists in Phil. Mag. 7 (1800) 289ff — NOT fetched/verified.)

## 5. Thermodynamic cycles

### 5a. Carnot 1824 — efficiency fixed by the temperatures
- Citation: Carnot, S. (1824). *Réflexions sur la puissance motrice du feu et sur les machines propres à développer cette puissance.* Paris: Bachelier.
- Copy: IA `bub_gb_QX9iIWF3yOMC` (Google Books scan) — https://archive.org/details/bub_gb_QX9iIWF3yOMC ; IA licenseurl CC PDM 1.0; 1824 -> US PD. (No page_numbers.json; leaves determined from the images.)
- Page images:
  - p. 38 = leaf 50 (https://archive.org/download/bub_gb_QX9iIWF3yOMC/page/n49_w1200.jpg), verbatim (italics in original; 1824 spelling "agens"):
    > "Ainsi nous sommes conduits à établir la proposition générale que voici:
    > *La puissance motrice de la chaleur est indépendante des agens mis en œuvre pour la réaliser; sa quantité est fixée uniquement par les températures des corps entre lesquels se fait en dernier résultat le transport du calorique.*
    > Il faut sous-entendre ici que chacune des méthodes de développer la puissance motrice atteint la perfection dont elle est susceptible. Cette condition se trouvera remplie si, … il ne se fait dans les corps aucun changement de température qui ne soit dû à un changement de volume, ou, ce qui est la même chose autrement exprimée, s'il n'y a jamais de contact entre des corps de températures sensiblement différentes."
  - Translation (ours): "The motive power of heat is independent of the agents employed to realise it; its quantity is fixed solely by the temperatures of the bodies between which, in the end, the transfer of caloric takes place." (Proviso: each method reaches its perfection — no contact between bodies at appreciably different temperatures, i.e. reversibility.)
  - p. 32 = leaf 44 (…/page/n43_w1200.jpg) and p. 33 = leaf 45 (…/page/n44_w1200.jpg): the Carnot cycle itself — air in cylinder abcd with piston cd (fig. 1), two bodies A, B "entretenus chacun à une température constante, celle de A étant plus élevée que celle de B"; steps 1° contact with A; 2° "Le piston s'élève graduellement … l'air, qui se trouve ainsi maintenu à une température constante pendant la raréfaction. Le corps A fournit le calorique nécessaire pour maintenir la constance de température." 3° "Le corps A est éloigné … L'air se raréfie sans recevoir de calorique, et sa température s'abaisse … jusqu'à devenir égale à celle du corps B"; 4° "L'air est mis en contact avec le corps B; il est comprimé par le retour du piston … Cet air reste cependant à une température constante, à cause de son contact avec le corps B auquel il cède son calorique." 5° (continues p. 34, not read).
  - Caveat for the app: Carnot reasoned with caloric theory; the formula η = 1 − T_c/T_h is NOT in Carnot 1824 — needs a modern source (see 5b / NOT FOUND).

### 5b. NASA Glenn Research Center — Beginner's Guide to Aeronautics (Otto, Brayton, Carnot)
- Licence: US federal government work (NASA) -> public domain in the US (NASA media-usage guidelines: NASA material generally not copyrighted; no endorsement implied). Editor/NASA Official: Nancy Hall.
- Robots: legacy host www.grc.nasa.gov has no robots.txt (404 HTML); new host www1.grc.nasa.gov robots = Yoast `User-agent: * Disallow:` (everything allowed). Many legacy k-12 pages redirect ("has moved to a new URL") to www1.grc.nasa.gov/beginners-guide-to-aeronautics/…
- Pages fetched (born-digital HTML, read from text):
  1. "Engine Thermodynamic Analysis" — https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/engine-thermodynamic-analysis/
     > "We call the ratio of the volume at the beginning of compression to the volume at the end of compression the compression ratio, r . Then p3/p2 = r^γ ; T3/T2 = r^(γ−1) where p is the pressure, T is the temperature, and gamma (λ) is the ratio of specific heats." [sic: page writes "gamma (λ)"]
     > "During the combustion process (3-4), the volume is held constant, and heat is released. The change in temperature is given by T4 = T3 + f * Q/cv"
     > "p5/p4 = r^−γ ; T5/T4 = r^(1−γ)"
     > "We can also evaluate the work W by the difference of the heat into the gas minus the heat rejected by the gas. … W = cv * ((T4 – T3) – (T5 – T2))"; "The work times the rate of the cycle (cycles per second cps ) is equal to the power P produced by the engine. P = W * cps"
     > "The brothers' design was based on early automobile engine designs which used the Otto cycle, developed by the German, Dr. N. A. Otto, in 1876."
     - NOTE: the explicit Otto efficiency η = 1 − 1/r^(γ−1) is NOT printed on this page; it follows algebraically from the quoted relations (η = W/[cv(T4−T3)] = 1 − (T5−T2)/(T4−T3) = 1 − r^(1−γ)). If the app shows it, label it "derived from NASA GRC relations".
  2. "Ideal Otto Cycle" (legacy) — https://www.grc.nasa.gov/www/k-12/airplane/otto.html (Last Updated May 13 2021):
     > "Stage 3 is the beginning of the combustion of the fuel/air mixture. The combustion occurs very quickly and the volume remains constant."
     > "The difference between the work done by the gas and the work done on the gas is the area enclosed by the cycle curve and is the work produced by the cycle. The work times the rate of the cycle (cycles per second) is equal to the power produced by the engine."
     > "In reality, the ideal cycle does not occur and there are many losses associated with each process. … For a real cycle, the shape of the p-V diagram is similar to the ideal, but the area (work) is always less than the ideal value."
  3. "Turbine Engine Thermodynamic Cycle - Brayton Cycle" (legacy) — https://www.grc.nasa.gov/www/k-12/airplane/brayton.html (May 13 2021):
     > "On this page we discuss the Brayton Thermodynamic Cycle which is used in all gas turbine engines."
     > "The compressor does work on the gas and increases the pressure and temperature isentropically to station 3 the compressor exit." "The combustion process in the burner occurs at constant pressure from station 3 to station 4." "The hot exhaust is then passed through the power turbine in which work is done by the flow from station 4 to station 5. Because the turbine and compressor are on the same shaft, the work done on the turbine is exactly equal to the work done by the compressor…"
     - No Brayton efficiency formula on page (NOT FOUND).
  4. "Carnot Cycle" (legacy) — https://www.grc.nasa.gov/www/k-12/airplane/carnot.html (May 13 2021): four processes (isothermal expansion, adiabatic expansion, isothermal compression, adiabatic compression), "From the first law of thermodynamics, the amount of work produced is equal to the net heat transferred during the process: W = Q1 - Q2". No η = 1 − Tc/Th on page.

## 6. Levers, gears, torque and power

### 6a. Archimedes — law of the lever (Heath 1897 translation)
- Citation: Heath, T. L. (ed. & trans.) (1897). *The Works of Archimedes.* Cambridge: Cambridge University Press. "On the Equilibrium of Planes, Book I", Propositions 6, 7.
- Copy: IA `worksofarchimede00arch` (Wellesley College Library). Licence: 1897 -> US public domain.
- Page image p. 192 = leaf 384 (https://archive.org/download/worksofarchimede00arch/page/n383_w1200.jpg):
  > "Propositions 6, 7. *Two magnitudes, whether commensurable [Prop. 6] or incommensurable [Prop. 7], balance at distances reciprocally proportional to the magnitudes.*
  > I. Suppose the magnitudes A, B to be commensurable, and the points A, B to be their centres of gravity. Let DE be a straight line so divided at C that A : B = DC : CE. We have then to prove that, if A be placed at E and B at D, C is the centre of gravity of the two taken together."
- (Postulate 1, p. 189, OCR only — not image-verified: "Equal weights at equal distances are in equilibrium, and equal weights at unequal distances are not in equilibrium but incline towards the weight which is at the greater distance.")

### 6b. Rankine 1869 — gear ratio, and power = torque × angular velocity
- Citation: Rankine, W. J. M. (1869). *A Manual of Machinery and Millwork.* London: Charles Griffin. IA `amanualmachiner00rankgoog` (Google scan); IA "possible-copyright-status: NOT_IN_COPYRIGHT"; 1869 -> US PD. NOTE: this item's _page_numbers.json is off by 2 around p. 341; leaves below are from the images.
- p. 23 = leaf 47 (https://archive.org/download/amanualmachiner00rankgoog/page/n46_w1200.jpg), Art. 43:
  > "Further, in the case of a pair of spur wheels gearing into each other, the principles of pure mechanism show that in any given interval of time the numbers of revolutions performed by those wheels respectively are inversely as their numbers of teeth, and that the directions in which they turn are contrary;"
- p. 104 = leaf 128 (…/page/n127_w1200.jpg), Art. 114 "General Principles":
  > "II. In order that a pair of wheels, or a wheel and a rack, may work correctly together, it is in all cases essential *that the pitch should be the same in each.*
  > III. Hence, in any pair of wheels which work together, *the numbers of teeth in a complete circumference are inversely as the numbers of whole revolutions in a given time;* or, in other words, *directly as the times of revolution.*"
  > "V. In circular wheels, everything stated in the preceding principles regarding the ratio of the numbers of revolutions in a given time (in other words, of the *mean angular velocity-ratio*) is true also of the angular velocity-ratio at every instant."
- p. 341 = leaf 363 (…/page/n362_w1200.jpg), Art. 301 (Work):
  > "But the product of the resistance into the leverage is what is called the *moment* of the resistance, and the product 2πT is called the *angular motion* of the rotating body; consequently, *The work performed = the moment of the resistance × the angular motion.*"
  > "The angular motion 2πT of a body during some definite unit of time, as a second or a minute, is called its *angular velocity;* that is to say, *angular velocity is the product of the turns and fractions of a turn made in an unit of time into the ratio (2π = 6·2832) of the circumference of a circle to its radius.* Hence it appears that *The rate of work = the moment of the resistance × the angular velocity.*"
  - => P = τω in Rankine's words (moment = torque; T = number of turns).
  - Same page, Art. 302: "Resistance × distance traversed = intensity of pressure × area × distance traversed; = intensity of pressure × volume traversed." (W = pΔV)

### 6c. NASA GRC Beginner's Guide — torque and power (US-gov PD)
- "Torque (Moment)" — https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/torque-moment/ :
  > "The product of the force and the perpendicular distance to a pivot (or hinge) is called the torque or the moment . Torques produce rotations in the same way that forces produce translations."
  > "In this case, the perpendicular distance is the actual length of the bar and the torque is equal to the product of the length and the force. T = F * L"
  > "As you get closer to the hinge, you must apply a larger force to make the door swing. As you get farther from the hinge, you can apply a smaller force to make the door swing."
  - CAUTION: the page's general case says "T = F * L * cos(a)" with a measured from the arm such that cos 0 = 1 for perpendicular force — angle convention is unusual; avoid quoting the cos form.
- "What is Power?" — https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/power/ :
  > "For scientists, power is the rate at which work is performed by a force acting along a distance." "P = W / t" "The unit of power in the metric system is the watt, which is equal to one joule per second. In the English system the unit of power is the horsepower (hp) which is equal to 550 foot-pounds per second." "The power then becomes the product of the force and the velocity: P = F * V"
- "Power Train" — https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/power-train/ :
  > "The power train converts the linear motion of the pistons into rotational motion of the crankshaft." "The job of the flywheel is to store the energy from the individual firings so that the engine runs more smoothly."

### 5c. Rankine 1859 — the Carnot efficiency formula η = (τ₁ − τ₂)/τ₁ (PD)
- Citation: Rankine, W. J. M. (1859). *A Manual of the Steam Engine and Other Prime Movers.* London & Glasgow: R. Griffin. Art. 265 "Efficiency of the Fluid in an Elementary Heat Engine".
- Copy used: IA `amanualsteameng01rankgoog` (1859; "NOT_IN_COPYRIGHT"; US PD). (Copy `amanualsteameng00rankgoog` has a cropped/unreadable p. 342 — don't use.)
- p. 342 = leaf 372 (https://archive.org/download/amanualsteameng01rankgoog/page/n371_w1200.jpg):
  > "265. Efficiency of the Fluid in an Elementary Heat Engine.—An elementary heat engine is one in which the reception of heat by the fluid takes place wholly at one absolute temperature τ₁, and its rejection wholly at another absolute temperature τ₂. Consequently, in such an engine, the change between those two limiting temperatures must be made entirely by compression and expansion of the fluid."
  > "A B, expansion of the fluid at the higher limit of temperature τ₁; B C, further expansion, without reception or emission of heat, till the temperature falls to τ₂; C D, compression of the fluid, at the lower limit of temperature τ₂;"
- p. 343 = leaf 373 (…/page/n372_w1200.jpg):
  > "D A, further compression, without reception or emission of heat, till the temperature rises again to τ₁."
  > "Consequently the *efficiency of the engine* is
  > **(H₁ − H₂)/H₁ = (τ₁ − τ₂)/τ₁ = (T₁ − T₂)/(T₁ + 461·2)** ……(2.)
  > The last equation expresses the *law of the efficiency of elementary thermodynamic engines,* viz.:—*that the heat transformed into mechanical energy is to the whole heat received by the fluid as the range of temperature is to the absolute temperature at which heat is received.*"
  - Note: τ = absolute temperature; T in °F (hence +461·2, Rankine's 1859 value for absolute zero in °F). Modern: η = 1 − T_c/T_h.
  - Art. 267 (p. 344, OCR only, NOT image-verified): maximum efficiency between given limits is reached "when the whole reception of heat takes place at the higher limit, and the whole rejection of heat at the lower", and the efficiency "is independent of the nature of the fluid employed".

## 8. Control / feedback — Maxwell, "On Governors"
- Citation: Maxwell, J. C. (1868). "On Governors." *Proceedings of the Royal Society of London* 16: 270–283. Received Feb. 20, 1868; read March 5, 1868 (vol. 16 covers 1867–68; IA/Crossref list the volume year as 1867 — see Crossref check). DOI 10.1098/rspl.1867.0055.
- Copy: IA `philtrans07756741` — https://archive.org/details/philtrans07756741 ; licenseurl CC PDM 1.0; US PD.
- p. 270 = leaf 1 (https://archive.org/download/philtrans07756741/page/n0_w1200.jpg):
  > "I. "On Governors." By J. Clerk Maxwell, M.A., F.R.SS.L. & E. Received Feb. 20, 1868.
  > A Governor is a part of a machine by means of which the velocity of the machine is kept nearly uniform, notwithstanding variations in the driving-power or the resistance."
- p. 271 = leaf 2 (…/page/n1_w1200.jpg):
  > "Most governors depend on the centrifugal force of a piece connected with a shaft of the machine. When the velocity increases, this force increases, and either increases the pressure of the piece against a surface or moves the piece, and so acts on a break or a valve."
  > "In Watt's governor for steam-engines the arms open outwards, and so contract the aperture of the steam-valve."
  > "But if the part acted on by centrifugal force, instead of acting directly on the machine, sets in motion a contrivance which continually increases the resistance as long as the velocity is above its normal value, and reverses its action when the velocity is below that value, the governor will bring the velocity to the same normal value whatever variation (within the working limits of the machine) be made in the driving-power or the resistance." [= integral action]
  > "It will be seen that the motion of a machine with its governor consists in general of a uniform motion, combined with a disturbance which may be expressed as the sum of several component motions. These components may be of four different kinds:— 1. The disturbance may continually increase. 2. It may continually diminish. 3. It may be an oscillation of continually increasing amplitude. 4. It may be an oscillation of continually decreasing amplitude.
  > The first and third cases are evidently inconsistent with the stability of the motion; and the second and fourth alone are admissible in a good governor. This condition is mathematically equivalent to the condition that all the possible roots, and all the possible parts of the impossible roots, of a certain equation shall be negative." ["possible/impossible roots" = real/complex roots; i.e. all roots must have negative real parts]
- PID: no US-gov/PD source located (NOT FOUND; see list).

## 3. Generators, transformers, the grid — US EIA (eia.gov)
- Licence/terms: EIA "Copyrights and Reuse" (https://www.eia.gov/about/copyrights_reuse.php): "U.S. government publications are in the public domain and are not subject to copyright protection. You may use and/or distribute any of our data, files, databases, reports, graphs, charts, and other information products … However, if you use or reproduce any of our information products, you should use an acknowledgment, which includes the publication date, such as: "Source: U.S. Energy Information Administration (Oct 2008)."" Also: "When quoting EIA text, the acknowledgment should clearly indicate which text is EIA content and which is not." EXCEPTIONS: photographs are privately licensed ("may not be reproduced"); EIA logo and Energy Ant are trademarks — don't reuse images/logos. No AI/automated-access clause found. robots.txt allows the pages used.
- All pages born-digital HTML, read from the text; accessed 2026-11-28.

### 3a. US electricity generation by source — latest annual (2025)
- "Electricity explained: Electricity in the United States" — https://www.eia.gov/energyexplained/electricity/electricity-in-the-us.php (page shows no "last updated" date; data year 2025; cite as accessed 2026-11-28):
  > "In 2025, total U.S. utility-scale electricity generation was about 4.43 trillion kilowatthours (kWh)."
  > "Fossil fuels accounted for about 58% of U.S. electricity generation in 2025"
  > "Natural gas was the top source—about 41%—of U.S. utility-scale electricity generation in 2025."
  > "Nuclear energy accounted for about 18%—of U.S. utility-scale electricity generation in 2025. Nuclear power plants use steam turbines to produce electricity from nuclear fission."
  > "Coal was the third-highest source and accounted for about 17%—of U.S. electricity generation in 2025. Nearly all coal-fired power plants use steam turbines."
  > "Petroleum was the source of about 0.7% of U.S. electricity generation in 2025." "Other gases and other sources accounted for about 0.2%…"
  > Renewables "were the source of about 24% of total U.S. utility-scale electricity generation in 2025. In 1990, renewable resources provided about 12%…"
  > "Wind energy was the source of about 11% of total U.S. utility-scale electricity generation and accounted for 43% of utility-scale electricity from renewable sources in 2025."
  > "Hydropower ( conventional ) plants produced about 6% … about 23% of utility-scale electricity generation from renewable sources in 2025. Hydropower plants use flowing water to spin a turbine connected to a generator."
  > "Solar photovoltaic and solar thermal power plants provided about 7% … 28% of utility-scale electricity generation from renewable sources in 2025." "We estimate that about 0.09 trillion kWh of electricity were generated with small-scale solar photovoltaic systems."
  > "Biomass was the source of about 1% …"; "Geothermal power plants produced less than 1% …"
  > Definition: "Utility-scale systems include power plants that have at least 1 megawatt (MW) of electricity generation capacity."
  > "Most electricity is generated with steam turbines that use fossil fuels, nuclear, biomass, geothermal, or solar thermal energy."
  - Summary table for app (2025, % of utility-scale, total ≈ 4.43 trillion kWh): natural gas ~41; nuclear ~18; coal ~17; wind ~11; solar ~7; hydro ~6; biomass ~1; geothermal <1; petroleum ~0.7; other ~0.2; (fossil total ~58; renewables total ~24).
- Detailed table (older, 2023, in billion kWh) — EIA FAQ "What is U.S. electricity generation by energy source?" https://www.eia.gov/tools/faqs/faq.php?id=427&t=3 ("Last updated: February 29, 2024"; data source Electric Power Monthly Feb 2024, preliminary): total 4,178 BkWh; natural gas 1,802 (43.1%); coal 675 (16.2%); nuclear 775 (18.6%); wind 425 (10.2%); hydropower 240 (5.7%); solar 165 (3.9%); biomass 47 (1.1%); geothermal 16 (0.4%); petroleum 16 (0.4%); small-scale PV additional 73.62 BkWh. Use only if a by-TWh table is wanted, labelled 2023.

### 3b. Transmission & distribution losses (~5%)
- EIA FAQ "How much electricity is lost in electricity transmission and distribution in the United States?" — https://www.eia.gov/tools/faqs/faq.php?id=105&t=3 — "Last updated: November 7, 2023":
  > "The U.S. Energy Information Administration (EIA) estimates that annual electricity transmission and distribution (T&D) losses averaged about 5% of the electricity transmitted and distributed in the United States in 2018 through 2022."

### 3c. How a generator works
- "How electricity is generated" — https://www.eia.gov/energyexplained/electricity/how-electricity-is-generated.php — "Last updated: October 31, 2023":
  > "An electric generator is a device that converts a form of energy into electricity. … Most electricity generation is from generators that are based on scientist Michael Faraday's discovery in 1831. He found that moving a magnet inside a coil of wire makes (induces) an electric current flow through the wire. He made the first electricity generator, called a Faraday disk , which operates on the relationship between magnetism and electricity and led to the design of the electromagnetic generators we use today."
  > "In a turbine generator, a moving fluid—water, steam, combustion gases, or air—pushes a series of blades mounted on a rotor shaft. The force of the fluid on the blades spins (rotates) the rotor shaft of a generator. The generator, in turn, converts the mechanical (kinetic) energy of the rotor to electrical energy."
  > "Steam turbines are used to generate most of the world's electricity, and they accounted for about 42% of U.S. electricity generation in 2022." "In 2022, combined-cycle power plants supplied about 34% of U.S. net electricity generation ."
  > "Combined-cycle systems use combustion gases from one turbine to generate more electricity in another turbine."
- "Magnets and electricity" — https://www.eia.gov/energyexplained/electricity/magnets-and-electricity.php (undated):
  > "Moving a magnet around a coil of wire, or moving a coil of wire around a magnet, pushes out the electrons in the wire and creates an electrical current. Electricity generators essentially convert kinetic energy (the energy of motion) into electrical energy ."
  - CAUTION: same page says "Magnets are different because their electrons all spin in the same direction" — oversimplified; don't quote.

### 3d. Transformers and the grid
- "Batteries, circuits, and transformers" — https://www.eia.gov/energyexplained/electricity/batteries-circuits-and-transformers.php (undated):
  > "To overcome the challenge of sending electricity over long distances, William Stanley invented the transformer . A transformer adjusts the voltage (electrical pressure) of electricity in power lines."
  > "High-voltage transmission lines (the ones you see hanging between tall metal towers) carry electricity over long distances. Higher voltage electricity is more efficient and less expensive for long distance travel. Lower voltage electricity is safer to use in homes and businesses. Transformers play a crucial role by either increasing (stepping up) or reducing (stepping down) voltages as electricity travels from power plants to homes and businesses."
  > Batteries: "Batteries generate electricity using two different metals submerged in a chemical solution called an electrolyte . … A chemical reaction occurs between the metals and the electrolyte. This reaction causes one metal to release more electrons than the other." "For electricity to flow, it needs a complete path, or electrical circuit ."
  - Note: EIA diagrams there are "Adapted from National Energy Education Development Project (public domain)".
  - No transformer turns-ratio equation (Vs/Vp = Ns/Np) on EIA pages — NOT FOUND in a US-gov source this pass.
- "Delivery to consumers" — https://www.eia.gov/energyexplained/electricity/delivery-to-consumers.php (undated):
  > "Electricity is generated at power plants and then travels through a complex system, often called the grid . The grid includes electricity substations, transformers, and power lines that connect electricity producers and consumers."
  > "In the United States, the electricity grid is made up of thousands of miles of high-voltage power lines and millions of miles of low-voltage power lines."
  > "Transformers at substations play a crucial role. They either increase (step up) or reduce (step down) voltages to adjust to the different stages of the journey—from the power plant on long-distance transmission lines to the distribution lines that deliver electricity to homes and businesses."
  > "At the beginning of the 20th century, more than 4,000 isolated electric utilities operated in the United States." "Over time, three large, interconnected systems evolved in the United States."

## 4a. Batteries — lithium-ion (US DOE)
- Robots: www.energy.gov `*` rules allow these paths; afdc.energy.gov robots empty. ANL (Cloudflare challenge) and NREL (DNS failure) not used. The old energy.gov article "How Does a Lithium-ion Battery Work?" now 404s (redirect to /energysaver/articles/how-lithium-ion-batteries-work also 404).
- Licence: DOE web content and reports by federal employees are US government works (PD in US). The TSA report has national-lab (contractor) authors but is a DOE-issued report (DOE/OE-0031); its Figure 1 is "Adapted from S. Windisch-Kern et al." — do NOT reuse that figure.

### 4a-i. DOE Office of Electricity, *Technology Strategy Assessment: Lithium-ion Batteries* (Storage Innovations 2030), July 2023, DOE/OE-0031
- URL: https://www.energy.gov/sites/default/files/2023-07/Technology%20Strategy%20Assessment%20-%20Lithium-ion.pdf
- Authors: Eric J. Dufek, Venkat Durvasulu, Thomas Mosier, Hill Balliet (Idaho National Laboratory); Mark Willey (PNNL); Noel Bakhtian (LBNL).
- Born-digital PDF; read from the TEXT LAYER (macOS PDFKit extraction), p. 1 (PDF page 5) and p. 2 (PDF page 6):
  > "Lithium-ion batteries are a class of electrochemical batteries encompassing different chemistry variants that all operate using a similar process. They rely on a "rocking chair" design where Li+ ions are transferred from the cathode to the anode during charging and then back to the cathode during discharging. For most applications, the predominant anode material is graphite or some form of carbon, although lithium titanate (LTO) is used in some higher power or high cycle life scenarios. There are multiple classes of cathode materials, including lithium iron phosphate (LFP), lithium cobalt oxide (LCO), lithium nickel manganese cobalt oxide (NMC), lithium manganese oxide (LMO), and lithium nickel cobalt aluminum oxide (NCA). The electrode active materials listed above are cast on current collectors, which are typically copper (anode) and aluminum (cathode)…"
  > "In addition to the active materials at the electrodes, LIBs also contain an electrolyte that consists of organic liquid or polymer compounds and a Li-containing salt. The electrolyte enables ion transport during battery operation. Cells also contain a separator that keeps the anode and cathode from touching or shorting. Separators often are microporous and either polymeric, ceramic, or a mixture of both."
  > "Since their first commercialization in the early 1990s, the use of LIBs has spread from consumer electronics to electric vehicle and stationary energy storage applications."
  > "Depending on the nature of the cycling, LIBs often have a life or warrantied life of 10+ years and 1,000+ cycles." "As of 2022, deployments of batteries for grid-support applications totaled more than 8.5 GW. In 2022 alone, more than 4 GW of batteries were deployed."

### 4a-ii. DOE Office of Science, "DOE Explains…Batteries" — https://www.energy.gov/science/doe-explainsbatteries ("This was last updated December 11, 2023")
  > "Batteries consist of two electrical terminals called the cathode and the anode, separated by a chemical material called an electrolyte. To accept and release energy, a battery is coupled to an external circuit. Electrons move through the circuit, while simultaneously ions (atoms or molecules with an electric charge) move through the electrolyte."
  > "During charging or discharging, the oppositely charged ions move inside the battery through the electrolyte to balance the charge of the electrons moving through the external circuit and produce a sustainable, rechargeable system."
  > "Batteries were invented in 1800, but their complex chemical processes are still being studied."
  > "The 2019 Nobel Prize in Chemistry was awarded jointly to John B. Goodenough, M. Stanley Whittingham, and Akira Yoshino "for the development of lithium-ion batteries.""
  - CAUTION: same page says "When the electrons move from the cathode to the anode, they increase the chemical potential energy, thus charging the battery" — fine, but avoid paraphrasing the anode/cathode sign conventions beyond the quote.

### 4a-iii. Energy density — DOE Vehicle Technologies (Transportation Technologies Office) Fact of the Week #1234, April 18, 2022
- URL: https://www.energy.gov/cmei/vehicles/articles/fotw-1234-april-18-2022-volumetric-energy-density-lithium-ion-batteries
  > "Volumetric energy density refers to the amount of energy that can be contained within a given volume." "In 2008, lithium-ion batteries had a volumetric energy density of 55 watt-hours per liter; by 2020, that had increased to 450 watt-hours per liter."
  - Values: 55 Wh/L (2008) -> 450 Wh/L (2020) [EV battery packs per chart title "Energy Density of Lithium-ion Battery Packs, 2008-2020"]. Underlying source cited by DOE: Muralidharan et al., *Advanced Energy Materials*, Jan 2022 ("Next-Generation Cobalt-Free Cathodes…").
  - Gravimetric (Wh/kg) figure from a US-gov page: NOT FOUND this pass.

## 7. Vehicles — EV vs ICE efficiency, regenerative braking
- fueleconomy.gov: robots.txt request reset by server ("Recv failure: Connection reset by peer"; HTTP/2 CANCEL) for this UA on both www. and bare host — treated as blocking automated access; NOT fetched. The requested wording ("EVs convert over 77% … 12%–30%") appears in web-search snippets of https://www.fueleconomy.gov/feg/evtech.shtml but is UNVERIFIED by us — do not use.
- Use instead (both US-gov, PD; robots OK):
### 7a. DOE Fact of the Week #1360, Sept. 16, 2024 — https://www.energy.gov/cmei/vehicles/articles/fotw-1360-sept-16-2024-typical-ev-87-91-efficient-compared-30-conventional
  > "A typical EV is 87%–91% efficient (after taking regenerative braking into account) compared to about 30% for a conventional gasoline vehicle, depending on the drive cycle. Energy to the wheels, the portion of energy stored on the vehicle that is used to move the vehicle down the road, is 65% – 69% and net regenerative braking recovers about 22% on the EPA combined city/highway drive cycle."
  > Source line: "U.S. Department of Energy and U.S. Environmental Protection Agency, Fuel Economy Website, Where the Energy Goes: Electric Cars . Accessed July 10, 2024."
### 7b. US EPA, "Electric Vehicle Myths" — https://www.epa.gov/greenvehicles/electric-vehicle-myths ("Last updated on June 10, 2026"); epa.gov robots `*` only, path allowed; EPA content US-gov PD.
  > "A significant advantage of EVs compared to conventional gasoline vehicles is their energy efficiency. EVs use approximately 87%–91% of the energy from the battery and regenerative braking to propel the vehicle. Gasoline vehicles only convert about 16–25% of the energy from gasoline into movement (averaging highway and city driving)."
  - NOTE the ICE figure differs between sources (DOE FOTW "about 30%" vs EPA "16–25%"); cite each with its own wording.
### 7c. Regenerative braking & EV components — DOE Alternative Fuels Data Center (afdc.energy.gov)
- "How Do All-Electric Cars Work?" — https://afdc.energy.gov/vehicles/how-do-all-electric-cars-work :
  > "All-electric vehicles, also referred to as battery electric vehicles (BEVs), have an electric motor instead of an internal combustion engine. The vehicle uses a large traction battery pack to power the electric motor and must be plugged in to a wall outlet or charging equipment…"
  > "Electric traction motor: Using power from the traction battery pack, this motor drives the vehicle's wheels. Some vehicles use motor generators that perform both the drive and regeneration functions."
  > "Power electronics controller: This unit manages the flow of electrical energy delivered by the traction battery, controlling the speed of the electric traction motor and the torque it produces."
  > "DC/DC converter: This device converts higher-voltage DC power from the traction battery pack to the lower-voltage DC power needed to run vehicle accessories and recharge the auxiliary battery."
- "How Do Hybrid Electric Cars Work?" — https://afdc.energy.gov/vehicles/how-do-hybrid-electric-cars-work :
  > "Electric generator: Generates electricity from the rotating wheels while braking, transferring that energy back to the traction battery pack. Some vehicles use motor generators that perform both the drive and regeneration functions."
  > "A hybrid electric vehicle cannot be plugged in to charge the battery. Instead, the battery is charged through regenerative braking and by the internal combustion engine."
- (AFDC pages show no update date in the HTML; cite accessed 2026-11-28.)

## Crossref DOI verification (api.crossref.org, 2026-11-28)
| DOI | Crossref title | Author | Journal | Vol | Pages | Issued |
|---|---|---|---|---|---|---|
| 10.1098/rstl.1832.0006 | "V. Experimental researches in electricity" | Faraday | Phil. Trans. R. Soc. Lond. | (not given; 122) | 125–162 | 1832 |
| 10.1098/rstl.1852.0004 | "III. Experimental researches in electricity.―Twenty-eighth series" | Faraday | Phil. Trans. | (not given; 142) | 25–56 | 1852 |
| 10.1098/rstl.1800.0018 | "XVII. On the electricity excited by the mere contact of conducting substances of different kinds. In a letter from Mr. Alexander Volta…" | (none listed) | Phil. Trans. | 90 | 403–431 | 1800 |
| 10.1098/rspl.1867.0055 | "I. On governors" | Maxwell | Proc. R. Soc. Lond. | (not given; 16) | 270–283 | **1868** |
- Use year 1868 for Maxwell (Crossref issued 1868; paper received 20 Feb 1868), despite "1867" in the DOI string and IA metadata.
- Ohm 1827, Kirchhoff 1882 reprint, Carnot 1824, Heath 1897, Rankine 1859/1869: books, no DOIs. Kirchhoff 1845 Annalen article DOI not checked (Annalen volume not available to read; cite as "Pogg. Ann. Bd. 64, 1845", read in 1882 reprint).

## NOT FOUND / gaps
1. Kirchhoff 1845 *Annalen der Physik* vol. 64 page images — not on archive.org (no 1845 sim_annalen item); laws read in the 1882 *Gesammelte Abhandlungen* reprint instead (verbatim from the 1845 paper per the reprint's footnote).
2. English translation of Volta 1800 (Phil. Mag. 7) — not fetched; our translation must be labelled as ours.
3. Ohm p. 37 continuation ("und dem Produkte der entsprechenden Leitungsvermögen und Querschnitte gebildet werden") — OCR only, not image-verified.
4. Carnot efficiency formula η = 1 − Tc/Th in a US-gov source — NOT FOUND (NASA GRC Carnot page gives only W = Q1 − Q2). Covered by Rankine 1859 (PD, image-verified) instead.
5. Otto efficiency η = 1 − 1/r^(γ−1) printed explicitly on a NASA page — NOT FOUND; derivable from GRC's quoted relations (label as derived).
6. Brayton cycle efficiency formula (η = 1 − 1/r_p^((γ−1)/γ)) — NOT FOUND in a PD/US-gov source.
7. Rankine *steam* cycle efficiency formula on a US-gov page — NOT FOUND.
8. Transformer turns-ratio equation (Vs/Vp = Ns/Np) in a US-gov/PD source — NOT FOUND (EIA gives qualitative description only).
9. Li-ion gravimetric energy density (Wh/kg) from a US-gov page — NOT FOUND (only volumetric 55→450 Wh/L, DOE FOTW #1234).
10. fueleconomy.gov "77% vs 12–30%" wording — NOT VERIFIED (site resets automated connections); replaced by DOE FOTW #1360 and EPA.
11. PID controller in a PD/US-gov source — NOT FOUND. (Maxwell's p. 271 describes integral-type action in words.)
12. ANL (Cloudflare challenge) and NREL (DNS unresolved) — no content used.
13. Rankine 1859 Art. 267 (max efficiency independent of fluid) — OCR only, not image-verified.

## Licence summary
- All archive.org items used are pre-1931 -> US public domain (Ohm 1827; Kirchhoff 1882; Faraday 1832, 1852; Volta 1800; Carnot 1824; Heath 1897; Rankine 1859, 1869; Maxwell 1868). Phil Trans/Proc RS items carry IA CC Public Domain Mark 1.0.
- EIA, DOE (energy.gov, afdc.energy.gov), EPA, NASA GRC: US federal works, PD. EIA asks for acknowledgment with publication date and clear marking of quoted EIA text; EIA photographs/logos are NOT reusable. DOE TSA Figure 1 is third-party-adapted — don't reuse.
