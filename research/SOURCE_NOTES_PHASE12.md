# Source notes — Phase 12 (Human Anatomy & Physiology)

Research agents, 2026-11-28. robots.txt checked per host. Verbatim notes follow; items used are re-checked by hand where they are equations.

## B. Nervous system, organ systems (gates 12.4–12.6)

# Phase 12 research B (gates 12.4–12.6) — 2026-11-28

## A. Hodgkin & Huxley (1952) — READ ON PAGE IMAGES
Source: archive.org item sim_journal-of-physiology_the-journal-of-physiology_1952_117 ("The Journal of Physiology 1952: Vol 117"); metadata: access-restricted-item = absent (not lending-only); no rights/licenseurl field. archive.org robots: User-agent * Disallow only /control/ /report/ -> allowed.
Page images: https://archive.org/download/sim_journal-of-physiology_the-journal-of-physiology_1952_117/page/n<LEAF>_w1200.jpg ; LEAF = journal page + 21 (from _page_numbers.json: p500=leaf 521, p544=leaf 565). Local copies /tmp/vv-research/p12b/hh_p5xx.jpg
DOI verified Crossref: 10.1113/jphysiol.1952.sp004764 — title "A quantitative description of membrane current and its application to conduction and excitation in nerve", J. Physiol. 117(4) 500-544, published 1952-08-28, authors Hodgkin, Huxley; Crossref licence URL http://onlinelibrary.wiley.com/termsAndConditions#vor (publisher copyright; cite/quote facts & equations, do not reproduce figures).

- p.505 (leaf 526): "V is the displacement of the membrane potential from its resting value (depolarization negative);" ; "I is the total membrane current density (inward current positive);" ; "C_M is the membrane capacity per unit area (assumed constant);"
  eqn (2) I_i = I_Na + I_K + I_l ; (3) I_Na = g_Na (V − V_Na) ; (4) I_K = g_K (V − V_K) ; (5) I_l = ḡ_l (V − V_l)
- p.506 (leaf 527): "V = E − E_r, V_Na = E_Na − E_r, V_K = E_K − E_r, V_l = E_l − E_r, and E_r is the absolute value of the resting potential."
- p.518 (leaf 539) "Summary of equations and parameters":
  (26) I = C_M dV/dt + ḡ_K n^4 (V − V_K) + ḡ_Na m^3 h (V − V_Na) + ḡ_l (V − V_l)
  (7) dn/dt = α_n(1 − n) − β_n n ; (15) dm/dt = α_m(1 − m) − β_m m ; (16) dh/dt = α_h(1 − h) − β_h h
- p.519 (leaf 540):
  (12) α_n = 0·01 (V+10) / (exp((V+10)/10) − 1)
  (13) β_n = 0·125 exp(V/80)
  (20) α_m = 0·1 (V+25) / (exp((V+25)/10) − 1)
  (21) β_m = 4 exp(V/18)
  (23) α_h = 0·07 exp(V/20)
  (24) β_h = 1 / (exp((V+30)/10) + 1)
  Quote: "Potentials are given in mV, current density in µA/cm², conductances in m.mho/cm², capacity in µF/cm², and time in msec. The expressions for the α's and β's are appropriate to a temperature of 6·3° C; for other temperatures they must be scaled with a Q10 of 3."
  "The constants in eqn. (26) are taken as independent of temperature. The values chosen are given in Table 3, column 2, and may be compared with the experimental values in columns 3 and 4."
  "The four terms on the right-hand side give respectively the capacity current, the current carried by K ions, the current carried by Na ions and the leak current, for 1 cm² of membrane."
- p.520 (leaf 541) TABLE 3 (printed rotated; read on rotated image): Constant | Value chosen | Exp. mean | Range
  C_M (µF/cm²) 1·0 | 0·91 | 0·8 to 1·5
  V_Na (mV) −115 | −109 | −95 to −119
  V_K (mV) +12 | +11 | +9 to +14
  V_l (mV) −10·613* | −11 | −4 to −22
  ḡ_Na (m.mho/cm²) 120 | 80 / 160 | 65 to 90 / 120 to 260
  ḡ_K (m.mho/cm²) 36 | 34 | 26 to 49
  ḡ_l (m.mho/cm²) 0·3 | 0·26 | 0·13 to 0·50
  "* Exact value chosen to make the total ionic current zero at the resting potential (V = 0)."
- p.523 (leaf 544): "To obtain the action potential at some other temperature T′ °C the direct method would be to multiply all α's and β's by a factor φ = 3^((T′−6·3)/10), this being correct for a Q10 of 3." Integration "by the method of Hartree (1932-3)"; step "between about 0·01 msec ... and 1 msec".
- p.528 (leaf 549): "Fig. 15 compares the calculated propagated action potential, at 18·5° C, with experimental records"; "The value of the constant K ... (eqn. 31) was 10·47 msec⁻¹."
  (34) θ = √(K a / 2 R_2 C_M), "where θ = conduction velocity, a = radius of axis cylinder, R_2 = specific resistance of axoplasm, and C_M = capacity per unit area of membrane."
  "with the value of C_M (1·0 µF/cm²) ... The values of a and R_2 were 238 µ and 35·4 Ω.cm respectively. Hence the calculated conduction velocity is (10470 × 0·0238/2 × 35·4 × 10⁻⁶)^½ cm/sec = 18·8 m/sec. The velocity found experimentally in this fibre was 21·2 m/sec."
  (Inferred: modern sign convention V_m = −V_HH; temp 18·5 °C applies to Fig. 15C fibre.)

### A2. Hursh (1939) myelinated fibre velocity — READ ON PAGE IMAGE
archive.org sim_american-journal-of-physiology_1939-08-01_127_1 (access-restricted-item absent). LEAF = page − 1. p.136 = leaf n135 (/tmp/vv-research/p12b/hursh_p136.jpg).
Crossref verified: doi 10.1152/ajplegacy.1939.127.1.131, "CONDUCTION VELOCITY AND DIAMETER OF NERVE FIBERS", J. B. Hursh, Am. J. Physiol. 127(1):131–139, 1939 (no licence in Crossref).
p.136: "The line which has been drawn is the calculated regression line. It has a slope of 6.0, which means that the velocity in meters per second can be obtained by multiplying the diameter in micra by this factor." ; "assuming that a 13.8 mu fiber conducts at a velocity of 78 meters per second." Fig. 2 caption: "The dots are data on adult cats; circles, data on kittens." (cat nerves, not human)

### A3. Neuron count — Azevedo et al. 2009
Crossref verified doi 10.1002/cne.21974, J Comp Neurol 513(5):532–541 (2009); abstract in Crossref metadata (Wiley copyright): "We find that the adult male human brain contains on average 86.1 ± 8.1 billion NeuN‐positive cells (“neurons”) and 84.6 ± 9.8 billion NeuN‐negative (“nonneuronal”) cells. With only 19% of all neurons located in the cerebral cortex, greater cortical size (representing 82% of total brain mass) ..." (pubmed.ncbi.nlm.nih.gov returned a cookie/JS bot wall -> not used.)

## Robots per host (2026-11-28)
- archive.org: * Disallow /control/ /report/ only -> OK
- training.seer.cancer.gov: robots.txt 200, 0 bytes (empty) -> no restrictions -> OK
- www.cancer.gov: "User-agent: *" + sitemap, no Disallow -> OK
- www.nigms.nih.gov: * (Drupal defaults; Disallow /media/oembed etc.) no AI-bot rules -> OK for /biobeat
- www.niddk.nih.gov: * Crawl-delay: 10; Disallow /system /_internal -> OK (10 s delay respected)
- pubmed.ncbi.nlm.nih.gov: * Crawl-delay 1, abstract pages allowed BUT page served cookie/JS bot wall -> stopped
- www.ninds.nih.gov: robots 403 (rechecked twice) -> SKIPPED
- www.nih.gov: robots 403 -> SKIPPED
- www.cdc.gov, www.niaid.nih.gov, medlineplus.gov, www.nhlbi.nih.gov: robots 200, no AI-bot rules (not used further)
- No AI/LLM-ingestion notices encountered.

## Licences (verbatim)
- NCI (covers SEER Training): https://www.cancer.gov/policies/copyright-reuse — "Unless otherwise indicated, all text within National Cancer Institute (NCI) products is free of copyright and may be reused without our permission. Credit the National Cancer Institute as the source." Graphics: "a mix of copyrighted and copyright-free materials". SEER suggested citation format: "SEER Training Modules: <Page title>. U.S. National Institutes of Health, National Cancer Institute. Cited 28 November 2026. Available from: https://training.seer.cancer.gov ."
- NIDDK: https://www.niddk.nih.gov/copyright — "The majority of information on this site is copyright free and can be freely downloaded and reproduced. Content reproduced without changes should acknowledge the National Institute of Diabetes and Digestive and Kidney Diseases (NIDDK) as the source." (Last Reviewed May 2024)
- NIGMS: https://nigms.nih.gov/Pages/Disclaimers — "Most of the information on this website is not copyrighted so you are free to use it with proper attribution. This permission does not extend to the images provided to us by others, with the exception of those images in the Image and Video Gallery."

## B. Nervous system (12.4)
NIGMS Biomedical Beat, "Science Snippet: Get to Know Your Nerve Cells!", Sara Howard, February 23, 2022, https://www.nigms.nih.gov/biobeat/2022/02/science-snippet-get-to-know-your-nerve-cells
- "Nerve cells, also known as neurons, carry information through our bodies using electrical impulses and chemical messengers called neurotransmitters."
- "nearly all nerve cells have three main parts: Dendrites that extend like branches and receive signals / A cell body containing the nucleus ... / An axon, a long structure that transmits messages"
- "The human body contains billions of interconnected nerve cells that carry information to, within, and from the brain."
- "Once the electrical impulse reaches the end of the axon, it triggers the release of neurotransmitters into the small gap, or synapse, between the axon and a neighboring cell’s dendrites. The neurotransmitters cause an electrical response in the neighboring cell, which transmits the signal to the next cell in the chain."
SEER "Nerve Tissue" https://training.seer.cancer.gov/anatomy/nervous/tissue.html
- "there are only two main types of cells in nerve tissue. The actual nerve cell is the neuron. It is the "conducting" cell that transmits impulses and the structural unit of the nervous system. The other type of cell is neuroglia, or glial, cell."
- "Each neuron has three basic parts: cell body (soma), one or more dendrites, and a single axon."
- "Many axons are surrounded by a segmented, white, fatty substance called myelin or the myelin sheath. Myelinated fibers make up the white matter in the CNS, while cell bodies and unmyelinated fibers make the gray matter. The unmyelinated regions between the myelin segments are called the nodes of Ranvier. In the peripheral nervous system, the myelin is produced by Schwann cells." ; "In the CNS, oligodendrocytes produce myelin"
- "Functionally, neurons are classified as afferent, efferent, or interneurons (association neurons)"
- Neuroglia: "They are far more numerous than neurons and, unlike neurons, are capable of mitosis."
SEER "Introduction to the Nervous System" https://training.seer.cancer.gov/anatomy/nervous/ — "The nervous system is the major controlling, regulatory, and communicating system in the body." ; three functions "Sensory Integrative Motor"; "Sensory input is converted into electrical signals called nerve impulses that are transmitted to the brain."
SEER CNS/PNS (https://training.seer.cancer.gov/anatomy/nervous/organization/cns.html, .../pns.html): "The CNS consists of the brain and spinal cord" ; "The spinal cord is divided into 31 segments with each segment giving rise to a pair of spinal nerves." ; "8 cervical nerves, 12 thoracic nerves, 5 lumbar nerves, 5 sacral nerves, and 1 coccygeal nerve."
SEER Endocrine intro (nervous vs endocrine timing): "The effect is of short duration, measured in seconds, and localized." vs "The action of the endocrine system is measured in minutes, hours, or weeks"

## C. Digestive / urinary / endocrine (12.5)
NIDDK "Your Kidneys & How They Work" https://www.niddk.nih.gov/health-information/kidney-disease/kidneys-how-they-work (Last Reviewed June 2018)
- "Healthy kidneys filter about a half cup of blood every minute, removing wastes and extra water to make urine."
- "Each of your kidneys is made up of about a million filtering units called nephrons."
- "In a single day, your kidneys filter about 150 quarts of blood." ; "Only 1 to 2 quarts become urine."
- kidneys "each about the size of a fist"; kidneys make hormones that "help control your blood pressure / make red blood cells / keep your bones strong and healthy"
NIDDK "Chronic Kidney Disease Tests & Diagnosis" https://www.niddk.nih.gov/health-information/kidney-disease/chronic-kidney-disease-ckd/tests-diagnosis (Last Reviewed October 2016)
- "GFR stands for glomerular filtration rate." ; "a GFR of 60 or more is in the normal range." ; "a GFR of less than 60 may mean you have kidney disease." ; "a GFR of 15 or less is called kidney failure."
NIDDK "Your Digestive System & How it Works" https://www.niddk.nih.gov/health-information/digestive-diseases/digestive-system-how-it-works (Last Reviewed December 2017)
- "The digestive system is made up of the gastrointestinal tract—also called the GI tract or digestive tract—and the liver, pancreas, and gallbladder." ; "The hollow organs that make up the GI tract are the mouth, esophagus, stomach, small intestine, large intestine, and anus." ; small intestine parts duodenum/jejunum/ileum; large intestine "appendix, cecum, colon, and rectum".
- Table "The digestive process" (Organ | Movement | Digestive juices | Food broken down): Mouth|Chewing|Saliva|Starches; Esophagus|Peristalsis|None|None; Stomach|(sphincter relax / mixing)|Stomach acid and digestive enzymes|Proteins; Small intestine|Peristalsis|Small intestine digestive juice|Starches, proteins, and carbohydrates; Pancreas|None|Pancreatic juice|Carbohydrates, fats, and proteins; Liver|None|Bile|Fats; Large intestine|Peristalsis|None|"Bacteria in the large intestine can also break down food."
- "Proteins break into amino acids / Fats break into fatty acids and glycerol / Carbohydrates break into simple sugars"
- "Food moves through your GI tract by a process called peristalsis." ; "The small intestine absorbs most of the nutrients in your food"; ENS "nerves within the walls of your GI tract".
- No tract length or transit time on this page.
SEER digestive: https://training.seer.cancer.gov/anatomy/digestive/structure.html — "The long continuous tube that is the digestive tract is about 9 meters in length." ; four tunics "Mucosa Submucosa Muscular layer Serous layer or serosa". Intestine page: "The last 2 to 3 cm of the digestive tract is the anal canal".
SEER urinary: https://training.seer.cancer.gov/anatomy/urinary/components/kidney.html — "In the adult, each kidney is approximately 3 cm thick, 6 cm wide, and 12 cm long." ; "Each kidney contains over a million functional units, called nephrons" (note: NIDDK says "about a million"); intro: urinary system "controls red blood cell production by secreting the hormone erythropoietin" and secretes "the enzyme renin".
SEER endocrine (https://training.seer.cancer.gov/anatomy/endocrine/ and /glands/...):
- "Although there are eight major endocrine glands scattered throughout the body"
- Hormones "may be classified as either proteins or steroids. All of the hormones in the human body, except the sex hormones and those from the adrenal cortex, are proteins or protein derivatives."
- Pituitary "about 1 centimeter in diameter or the size of a pea"; anterior: growth hormone, TSH, ACTH, gonadotropins, prolactin; posterior: ADH, oxytocin; pineal: melatonin.
- Thyroid: "About 95 percent of the active thyroid hormone is thyroxine, and most of the remaining 5 percent is triiodothyronine." ; calcitonin; "Parathyroid hormone is the most important regulator of blood calcium levels."
- Adrenal: cortex aldosterone, cortisol, gonadocorticoids (all steroids); medulla epinephrine & norepinephrine.
- Pancreas: "Alpha cells ... secrete the hormone glucagons in response to a low concentration of glucose" ; "Beta cells ... secrete the hormone insulin in response to a high concentration of glucose".
- Insulin plasma half-life: NOT FOUND in an allowed open source (only on bionumbers.hms.harvard.edu – not used; PubMed bot wall; Crossref has no abstract for Duckworth 1998 Endocr Rev 19:608–624).

## D. Immune / reproductive / integumentary (12.6)
SEER "Anatomy of the Skin" https://training.seer.cancer.gov/melanoma/anatomy/
- "The skin is the body's largest organ; covering the entire outside of the body, it is about 2 mm thick and weighs approximately six pounds."
- "the skin is comprised of two layers that cover a third fatty layer" — epidermis, dermis, subcutis/hypodermis.
SEER "Layers of the Skin" https://training.seer.cancer.gov/melanoma/anatomy/layers.html
- epidermis "only .05 mm thick on the eyelids, and is 1.5 mm thick on the palms and the soles of the feet." ; "made up of five sublayers"
- "Complete cell turnover occurs every 28 to 30 days in young adults, while the same process takes 45 to 50 days in elderly adults."
- dermis "is the thickest of the three layers of the skin (1.5 to 4 mm thick), making up approximately 90 percent of the thickness of the skin."
- "The average person has about 3 million sweat glands." ; eccrine glands "can produce up to two liters of sweat an hour"
- Skin area: NOT FOUND.
SEER "Introduction to Blood" https://training.seer.cancer.gov/hematopoietic1/intro-to-blood.html (Updated December 2, 2025)
- "In an adult human, blood volume measures about five liters and accounts for eight percent (8%) of the body weight."
- "plasma, which makes up about 55% of blood volume" ; buffy coat "contains white blood cells and platelets"
- Erythrocytes "Most numerous of the formed elements"; "Primary function of erythrocytes is to transport oxygen"; neutrophils "Most numerous leukocytes"; leukocyte table (lymphocytes, monocytes, basophils, eosinophils, neutrophils); platelets "small fragments derived from very large cells called megakaryocytes".
- RBC / WBC counts per µL: NOT FOUND on allowed sources.
SEER cardiovascular: blood distribution "About 10 percent ... systemic arterial", "About 5 percent ... systemic capillaries", "Another 10 percent is in the lungs", "Almost 70 percent ... in the veins" (https://training.seer.cancer.gov/anatomy/cardiovascular/blood/classification.html)
SEER lymphatic/immune (https://training.seer.cancer.gov/anatomy/lymphatic/ ...):
- "Of the fluid that leaves the capillary, about 90 percent is returned." ; three functions (return fluid, absorb fats via lacteals, defense)
- Lymph nodes "usually less than 2.5 cm in length"; "The spleen is the largest lymphatic organ in the body."; thymus: "The primary function of the thymus is the processing and maturation of special lymphocytes called T-lymphocytes or T-cells."
SEER reproductive (https://training.seer.cancer.gov/anatomy/reproductive/ ...):
- four functions "To produce egg and sperm cells / To transport and sustain these cells / To nurture the developing offspring / To produce hormones"
- testis "about 5 cm long and 3 cm in diameter"; "about 250 lobules in each testis"; temperature "about 3° C below normal body temperature"; spermatogenesis "takes about 74 days"; sperm "live for about 48 hours in the female reproductive tract".
- ovary "about 3.5 cm in length, 2 cm wide, and 1 cm thick"; "approximately 700,000 oocytes at birth"; "By puberty ... about 400,000"; corpus luteum "functional for about 10 days".

## NOT FOUND
insulin plasma half-life (allowed source); RBC/WBC/platelet counts; skin surface area; digestive transit time; NIDDK nephron-to-GFR numeric (e.g., mL/min normal GFR value beyond "60 or more"); NINDS "Life and Death of a Neuron" (robots 403); mammalian human conduction velocity range from an open gov source (Hursh cat data only).


## A. Reference model, skeleton and muscle, heart and lungs (gates 12.1–12.3)

# Phase 12-A research notes (gates 12.1–12.3) — 2026-11-28

## Robots per host (fetched separately before any page)
- training.seer.cancer.gov/robots.txt: HTTP 200, EMPTY body (0 bytes; last-modified 2018-10-09) → no restrictions → allowed.
- www.cancer.gov/robots.txt: 200, "User-agent: *" with no Disallow → allowed.
- www.nhlbi.nih.gov/robots.txt: 200, Drupal default; User-agent: * disallows only admin/search/user/node/* etc.; health pages allowed. No ClaudeBot/anthropic rule.
- dbarchive.biosciencedbc.jp/robots.txt: 200, only a comment line → allowed.
- lifesciencedb.jp/robots.txt: 200, "User-Agent: *" with no Disallow → allowed.
- 3d.nih.gov/robots.txt: 404 (Next.js 404 page) → no robots file.
- www.nlm.nih.gov/robots.txt: 200; Disallows /archive/, /cgi/ etc.; /research/visible/ allowed (except two vhpconf98 framed dirs).
- archive.org/robots.txt: 200; only /control/ /report/ disallowed.
- gallica.bnf.fr/robots.txt: 403 Cloudflare "Attention Required" → NOT fetched from Gallica.

## B. NCI SEER Training Modules (U.S. NIH/NCI)
Licence (https://www.cancer.gov/policies/copyright-reuse, "Reuse of NCI Information", reviewed March 12, 2025), verbatim:
"Unless otherwise indicated, all text within National Cancer Institute (NCI) products is free of copyright and may be reused without our permission. Credit the National Cancer Institute as the source. In the case of digital reproduction, please link to the original NCI product using the original product's title"
Graphics: "Graphics (photos, illustrations) used in National Cancer Institute (NCI) information products are a mix of copyrighted and copyright-free materials." → use text only.
Suggested citation printed on each page: "SEER Training Modules: <Page title>. U.S. National Institutes of Health, National Cancer Institute. Cited 28 November 2026. Available from: https://training.seer.cancer.gov ."
No AI/LLM prohibition seen on SEER or cancer.gov policy page. (cancer.gov banner notes EO 14434 "Super Intelligence" terminology — not a restriction.)

### SEER verbatim extracts (all fetched 2026-11-28)
- Organ systems — https://training.seer.cancer.gov/anatomy/body/ ("Introduction to the Human Body"):
  "Ten major systems compose the human body: Skeletal Muscular Nervous Endocrine Cardiovascular Lymphatic Respiratory Digestive Urinary Reproductive" (list items).
  "A system is an organization of varying numbers and kinds of organs so arranged that together they can perform complex functions for the body."
  Levels: cells / tissues / organs / systems — "The human body is a single structure but it is made up of billions of smaller structures of four major kinds:"
- Homeostasis — https://training.seer.cancer.gov/anatomy/body/functions.html: "Survival depends on the body's maintaining or restoring homeostasis , a state of relative constancy, of its internal environment." ; Cannon: homeostasis "means a condition that may vary, but which is relatively constant."
- Skeleton intro — https://training.seer.cancer.gov/anatomy/skeletal/ : "The human skeletal system consists of bones, cartilage , ligaments and tendons and accounts for about 20 percent of the body weight." ; "Bones work together with muscles as simple mechanical lever systems to produce body movement." ; "Bones contain more calcium than any other organ ." ; "In adults, red marrow is limited to the spongy bone in the skull, ribs, sternum, clavicles, vertebrae and pelvis ."
- Bone count — https://training.seer.cancer.gov/anatomy/skeletal/divisions/ : "The adult human skeleton usually consists of 206 named bones." ; "The 80 bones of the axial skeleton form the vertical axis of the body." ; "The appendicular skeleton consists of 126 bones and includes the free appendages and their attachments to the axial skeleton."
- Bone shape — https://training.seer.cancer.gov/anatomy/skeletal/classification.html : "The four principal types of bones are long, short, flat and irregular." ; "Bones that are longer than they are wide are called long bones." ; "Short bones are roughly cube shaped with vertical and horizontal dimensions approximately equal." ; "Flat bones are thin, flattened, and usually curved." ; "Bones that are not in any of the above three categories are classified as irregular bones." Examples: long = "bones of the thigh, leg, arm, and forearm"; short = "bones of the wrist and ankle"; flat = "Most of the bones of the cranium"; irregular = "The vertebrae and some of the bones in the skull".
- Bone tissue — https://training.seer.cancer.gov/anatomy/skeletal/tissue.html : "There are two types of bone tissue : compact and spongy." ; "Osteoblasts are bone-forming cell , osteoclasts resorb or break down bone, and osteocytes are mature bone cells."
- Muscular system — https://training.seer.cancer.gov/anatomy/muscular/ : "The muscular system is composed of specialized cells called muscle fibers. Their predominant function is contractibility." ; "Nearly 85 percent of the heat produced in the body is the result of muscle contraction."
  NUMBER OF MUSCLES IN BODY: NOT FOUND on SEER pages fetched.
- Muscle structure — https://training.seer.cancer.gov/anatomy/muscular/structure.html : "Each skeletal muscle fiber is a single cylindrical muscle cell ." ; "An individual skeletal muscle may be made up of hundreds, or even thousands, of muscle fibers bundled together and wrapped in a connective tissue covering." ; epimysium / fasciculus / perimysium / endomysium sentences; "Typically a muscle spans a joint and is attached to bones by tendons at both ends. One of the bones remains relatively fixed or stable while the other end moves as a result of muscle contraction."
- Muscle types — https://training.seer.cancer.gov/anatomy/muscular/types.html : "In the body, there are three types of muscle: skeletal (striated), smooth, and cardiac ."
- Heart output — https://training.seer.cancer.gov/anatomy/cardiovascular/heart/ : "The normal adult heart pumps about 5 liters of blood every minute throughout life."
- Heart structure — https://training.seer.cancer.gov/anatomy/cardiovascular/heart/structure.html : "The human heart is a four-chambered muscular organ , shaped and sized roughly like a man's closed fist with two-thirds of the mass to the left of midline." ; chambers "Right atrium Right ventricle Left atrium Left ventricle" ; "The two atria are thin-walled chambers that receive blood from the veins . The two ventricles are thick-walled chambers that forcefully pump blood out of the heart." ; valves: "The right atrioventricular valve is the tricuspid valve. The left atrioventricular valve is the bicuspid, or mitral, valve. The valve between the right ventricle and pulmonary trunk is the pulmonary semilunar valve. The valve between the left ventricle and the aorta is the aortic semilunar valve." ; "When the ventricles contract, atrioventricular valves close to prevent blood from flowing back into the atria. When the ventricles relax, semilunar valves close to prevent blood from flowing back into the ventricles." ; path: "Blood flows from the right atrium to the right ventricle, and then is pumped to the lungs to receive oxygen . From the lungs, the blood flows to the left atrium, then to the left ventricle. From there it is pumped to the systemic circulation ." ; "The heart works as two pumps, one on the right and one on the left, working simultaneously ."
- Cardiac cycle — https://training.seer.cancer.gov/anatomy/cardiovascular/heart/physiology.html : "Without any neural stimulation , the sinoatrial node rhythmically initiates impulses 70 to 80 times per minute." ; "Systole is the contraction phase of the cardiac cycle, and diastole is the relaxation phase. At a normal heart rate , one cardiac cycle lasts for 0.8 second." ; "The sounds associated with the heartbeat are due to vibrations in the tissues and blood caused by closure of the valves."
- Circulation physics — https://training.seer.cancer.gov/anatomy/cardiovascular/blood/physiology.html : "Like all fluids, blood flows from a high pressure area to a region with lower pressure." ; "The rate , or velocity, of blood flow varies inversely with the total cross-sectional area of the blood vessels ." ; "Blood flow is slowest in the capillaries, which allows time for exchange of gases and nutrients." ; "In blood vessels, most of the resistance is due to vessel diameter . As vessel diameter decreases, the resistance increases and blood flow decreases." ; "Pulse pressure is the difference between systolic pressure and diastolic pressure." ; "Four major factors interact to affect blood pressure: cardiac output , blood volume, peripheral resistance, and viscosity." ; "Oxygen and carbon dioxide move across the capillary wall by diffusion."
- Circuits — https://training.seer.cancer.gov/anatomy/cardiovascular/blood/pathways.html : "The pump for the pulmonary circuit, which circulates blood through the lungs, is the right ventricle. The left ventricle is the pump for the systemic circuit, which provides the blood supply for the tissue cells of the body."
- Blood — https://training.seer.cancer.gov/hematopoietic1/intro-to-blood.html (updated December 2, 2025): "In an adult human, blood volume measures about five liters and accounts for eight percent (8%) of the body weight." ; "The light yellow fluid at the top is plasma, which makes up about 55% of blood volume. The red blood cells form the hematocrit , or packed cell volume (PCV) , at the bottom of the tube. Between these layers is a thin whitish band called the buffy coat , which contains white blood cells and platelets." ; Plasma: "Watery fluid portion of blood (90%) in which the corpuscular elements are suspended" [note: ambiguous — 90% presumably = water content of plasma; page does not say so explicitly] ; "Three classes of formed elements: erythrocytes (red blood cells), leukocytes (white blood cells), and the thrombocytes (platelets)" ; "Primary function of erythrocytes is to transport oxygen" ; Neutrophils "Most numerous leukocytes."
- Respiratory intro — https://training.seer.cancer.gov/anatomy/respiratory/ : "Every 3 to 5 seconds, nerve impulses stimulate the breathing process , or ventilation, which moves air through a series of passages into and out of the lungs. After this, there is an exchange of gases between the lungs and the blood. This is called external respiration ." ; "The exchange of gases between the blood and tissue cells is internal respiration ."
- Ventilation — https://training.seer.cancer.gov/anatomy/respiratory/mechanics.html : "Air, like other gases, flows from a region with higher pressure to a region with lower pressure." ; "During inspiration, the diaphragm contracts and the thoracic cavity increases in volume. This decreases the intraalveolar pressure so that air flows into the lungs." ; "During expiration, the relaxation of the diaphragm and elastic recoil of tissue decreases the thoracic volume and increases the intraalveolar pressure."
- Volumes — https://training.seer.cancer.gov/anatomy/respiratory/capacity.html : "Under normal conditions, the average adult takes 12 to 15 breaths a minute." ; "Respiratory capacity (pulmonary capacity) is the sum of two or more volumes." NUMERICAL LUNG VOLUMES (tidal volume etc.): NOT FOUND on this page (no table in HTML).
- Alveoli/lungs — https://training.seer.cancer.gov/anatomy/respiratory/passages/bronchi.html : "The bronchi branch into smaller and smaller passageways until they terminate in tiny air sacs called alveoli ." ; "The alveolar ducts and alveoli consist primarily of simple squamous epithelium, which permits rapid diffusion of oxygen and carbon dioxide . Exchange of gases between the air in the lungs and the blood in the capillaries occurs across the walls of the alveolar ducts and alveoli." ; right lung "divided into three lobes"; "The left lung has two lobes." Number of alveoli: NOT FOUND.
- Kidney — https://training.seer.cancer.gov/anatomy/urinary/components/kidney.html : "In the adult, each kidney is approximately 3 cm thick, 6 cm wide, and 12 cm long." ; "Each kidney contains over a million functional units, called nephrons".
- Liver — https://training.seer.cancer.gov/anatomy/digestive/regions/accessory.html : "It is the largest gland in the body." Stomach/intestine pages: /anatomy/digestive/regions/stomach.html, /intestine.html (descriptive; e.g. "The small intestine is divided into the duodenum, jejunum, and ileum.").
- Brain — https://training.seer.cancer.gov/anatomy/nervous/organization/cns.html : "The brain is divided into the cerebrum , diencephalons, brain stem , and cerebellum ." ; "The largest and most obvious portion of the brain is the cerebrum".

## D(2–4). NHLBI (U.S. NIH National Heart, Lung, and Blood Institute)
Licence — https://www.nhlbi.nih.gov/about/contact/trademark-branding-and-logo (last updated July 11, 2022), verbatim:
"Unless noted otherwise, information posted on the NHLBI website within the nhlbi.nih.gov domain is in the public domain."
"Most of the information on the NHLBI website is in the public domain and can be used without restriction. The NHLBI asks only that no changes be made to the publications, videos, images, or other formatted multimedia products and that the material, as well any NHLBI webpage links, not be used in any direct or indirect product endorsement or advertising."
Cite as: "Source: National Heart, Lung, and Blood Institute; National Institutes of Health; U.S. Department of Health and Human Services."
"There are a few exceptions. For example, some resources, such as some images on the NHLBI website, have been licensed by a third party and are restricted in their use." → All heart/lung illustrations/animations on these pages are "Copyright © Nucleus Medical Media, All rights reserved." — DO NOT reuse images; text only.
No AI/LLM prohibition found.

- https://www.nhlbi.nih.gov/health/heart (How the Heart Works — The Heart; last updated March 24, 2022): "The heart is an organ about the size of your fist that pumps blood through your body. It is made up of multiple layers of tissue." ; "Inside your heart, valves keep blood flowing in the right direction."
- https://www.nhlbi.nih.gov/health/heart/anatomy (last updated March 24, 2022): "It has four hollow chambers surrounded by muscle and other heart tissue." ; "Blood flows from the body and lungs to the atria and from the atria to the ventricles. The ventricles pump blood out of the heart to the lungs and other parts of the body." ; "This wall is called the septum." ; three tissue layers endocardium/myocardium/pericardium.
- https://www.nhlbi.nih.gov/health/heart/blood-flow (last updated June 25, 2025): "The heart has four valves." tricuspid/mitral/pulmonary/aortic with separations; path: "Oxygen-poor blood from the body enters your heart through two large veins called the superior and inferior vena cava. The blood enters the heart's right atrium and is pumped to your right ventricle, which in turn pumps the blood to your lungs." ; "The pulmonary artery then carries the oxygen-poor blood from your heart to the lungs. Your lungs add oxygen to your blood. The oxygen-rich blood returns to your heart through the pulmonary veins." ; "The oxygen-rich blood from the lungs then enters the left atrium and is pumped to the left ventricle. The left ventricle generates the high pressure needed to pump the blood to your whole body through your blood vessels." ; "When blood leaves the heart to go to the rest of the body, it travels through a large artery called the aorta."
- https://www.nhlbi.nih.gov/health/heart/heart-beats (last updated June 25, 2025): "The contraction of the atria and ventricles makes a heartbeat." ; lub = AV valves closing, dub = "the aortic and pulmonary valves close"; "At rest, a heart rate of 60 to 100 beats per minute is normal." ; SA node → atria → AV node ("Here the signal slows down slightly, allowing the ventricles time to finish filling with blood.") → ventricles; "Systolic pressure is the pressure when the ventricles pump blood out of the heart." ; "Diastolic pressure is the pressure between beats, when the heart is filling with blood." ; "For most adults, healthy blood pressure is usually less than 120 over 80".
- Heart beats per day / litres pumped per day: NOT FOUND on NHLBI pages fetched. (Per-minute value available from SEER: "about 5 liters of blood every minute".)
- https://www.nhlbi.nih.gov/health/lungs (last updated March 24, 2022): "When you inhale (breathe in), air enters your lungs, and oxygen from that air moves to your blood. At the same time, carbon dioxide, a waste gas, moves from your blood to the lungs and is exhaled (breathed out). This process, called gas exchange, is essential to life."
- https://www.nhlbi.nih.gov/health/lungs/respiratory-system (last updated March 24, 2022): "The right lung is divided into three lobes (sections), and the left lung is divided into two lobes." ; "Your lungs have about 150 million alveoli." ; "Alveoli are able to easily expand and contract because their insides are coated with a substance called surfactant." ; "Inside your lungs, the bronchial tubes branch into thousands of thinner tubes called bronchioles. The bronchioles end in clusters of tiny air sacs called alveoli." ; "Carbon dioxide moves from the blood into the air inside the alveoli. At the same time, oxygen moves from the air into the blood in the capillaries."
- BP categories — https://www.nhlbi.nih.gov/health/high-blood-pressure/diagnosis (last updated June 26, 2025), table "Blood Pressure Levels" verbatim:
  Normal: "Less than 120 systolic pressure AND Less than 80 diastolic pressure"
  Elevated: "120 to 129 systolic pressure AND Less than 80 diastolic pressure"
  High Blood Pressure Stage 1: "130 to 139 systolic pressure OR 80 to 89 diastolic pressure"
  High Blood Pressure Stage 2: "140 or higher systolic pressure OR 90 or higher diastolic pressure"
  Hypertensive Crisis: "Higher than 180 systolic pressure OR Higher than 120 diastolic pressure Contact your provider immediately."
  Also: "These numbers measure pressure in mm HG (millimeters of mercury)." ; "For most adults, a healthy blood pressure is less than 120/80 mm Hg."

## D(5). CO2 transport
- medlineplus.gov/robots.txt: 200, User-agent: * disallows only /URLchecker/, /cgi/, /xml/ etc. → lab-tests allowed.
- https://medlineplus.gov/lab-tests/carbon-dioxide-co2-in-blood/ (NLM; last updated November 12, 2024): "Most of the carbon dioxide in your body is in the form of bicarbonate (HCO3), which is a type of electrolyte ." ; "Your blood carries carbon dioxide to your lungs, and then you breathe it out."
- Licence https://medlineplus.gov/about/using/usingcontent/ verbatim: "Works produced by the federal government are not copyrighted under U.S. law. You may reproduce, redistribute, and link freely to non-copyrighted content, including on social media." ; "MedlinePlus information that is in the public domain includes the following areas, in both English and Spanish: MedlinePlus homepage / Summaries on health topic pages / Medical test information ..." (A.D.A.M. encyclopedia content is copyrighted — not used.)
- Quantitative split (bicarbonate / carbamino-Hb / dissolved %): NOT FOUND in an open U.S.-government source (SEER, NHLBI, MedlinePlus checked).
- Stroke volume / resting cardiac output as SV×HR: NOT FOUND (SEER gives "about 5 liters of blood every minute"; NHLBI gives resting HR "60 to 100 beats per minute"; SEER SA node "70 to 80 times per minute"). Stroke volume value: NOT FOUND.

## A. 12.1 3D human reference model
### BodyParts3D (Database Center for Life Science, ROIS, Japan) — USABLE, CC BY 4.0, no registration
- Download page: https://dbarchive.biosciencedbc.jp/en/bodyparts3d/download.html ; licence page https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html ("Last updated : 2025/02/27"). Licence verbatim:
  "The license for this database is specified in the Creative Commons Attribution 4.0 International. If you use data from this database, please be sure attribute this database as follows: "BodyParts3D, © The Database Center for Life Science licensed under CC Attribution 4.0 International"."
  "freely access part or whole of this database, and acquire data; freely redistribute part or whole of the data from this database; and freely create and distribute database and other derivative works based on part or whole of the data from this database,"
  NOTE: licence was CC BY-SA 2.1 JP historically; README update history: "2025/02/27 " License " is updated." Current = CC BY 4.0 (no share-alike).
- Every OBJ file header (checked FJ3147.obj): "# Please refer to the following page for license information: # https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html" ; "# Bounds(mm): ..." → coordinates in millimetres; "Build-up logic : FMA 3.0 part_of". Model: "three-dimensional whole-body model for an adult human male" (README).
- Site terms (NBDC Life Science Database Archive Terms of Service for Viewing and Downloading Users, https://dbarchive.biosciencedbc.jp/files/nbdc_riyou_kiyaku_en.pdf, prepared October 27, 2025), Art. 3.3: "individual data deposited in the Service's databases are subject to Creative Commons license conditions (displayed in the metadata of each data item)." No AI/LLM clause; Art. 4(9) prohibits "acts placing excessive load on the Service".
- Files (directory https://dbarchive.biosciencedbc.jp/data/bodyparts3d/LATEST/): partof_BP3D_4.0_obj_99.zip 62M (64,785,437 bytes; 1,258 OBJ files, 217,266,889 bytes uncompressed), isa_BP3D_4.0_obj_99.zip 136M; partof_parts_list_e.txt; partof_element_parts.txt (maps compound organ → element OBJ IDs: "only atomic organs (ELEMENT) are constructed as polygon meshes. Compound organs (COMPOUND) ... are not provided in the form of the meshes"). Format: "Wavefront OBJ"; "polygon reduction rate of 99%".
- Downloaded partof zip (allowed) and computed per-organ OBJ sizes (uncompressed, sum of element files; my computation):
  | organ | FMA | elements | OBJ bytes |
  | skeletal system | FMA23881 | 138 | 48.85 MB |
  | heart | FMA7088 | 83 | 6.80 MB |
  | right lung | FMA7309 | 156 | 4.72 MB |
  | left lung | FMA7310 | 124 | 2.63 MB |
  | brain | FMA50801 | 59 | 21.65 MB |
  | right kidney | FMA7204 | 1 (FJ3147) | 0.14 MB (1163 verts, 2310 faces) |
  | left kidney | FMA7205 | 1 (FJ3145) | 0.18 MB |
  | liver | FMA7197 | 60 | 12.92 MB |
  | stomach | FMA7148 | 1 (FJ2564) | 0.11 MB |
  | small intestine | FMA7200 | 56 | 0.94 MB |
  | large intestine | FMA7201 | 8 | 5.14 MB |
  Skeleton/brain/liver/heart would need further decimation (e.g. gltf + Draco/meshopt) for browser delivery — a derivative work permitted under CC BY 4.0 with attribution. Local copy: /tmp/vv-research/p12a/bp3d/.
- Literature (README): "Mitsuhashi N, Fujieda K, Tamura T, Kawamoto S, Takagi T, Okubo K. BodyParts3D: 3D structure database for anatomical concepts. Nucleic Acids Res. 2008 Oct 3. PMID: 18835852"
  Crossref verified: doi:10.1093/nar/gkn613 — Nucleic Acids Research 37(Database):D782–D785 (issued 2009); authors Mitsuhashi, Fujieda, Tamura, Kawamoto, Takagi, Okubo; article licence CC BY-NC 2.0 UK.

### Z-Anatomy — usable but CC BY-SA 4.0 (share-alike)
- github.com/robots.txt: ClaudeBot group present (Crawl-delay: 1); disallows /*/tree/, /*/raw/, /*/archive/, zipball/tarball etc.; repo root allowed. api.github.com/robots.txt → 404 JSON (no robots). Used API only.
- https://github.com/LluisV/Z-Anatomy (API metadata: description "Z-Anatomy app Unity project"; licence key "other"/NOASSERTION; size ~806 MB; pushed 2024-12-25). README verbatim: "This repository includes the Unity project for the Z-Anatomy PC application. It was made by Lluís Vinent Juanico, featuring models from the Z-Anatomy project." ; "You can download the models (.blend) [here](https://drive.google.com/drive/folders/18M7IuH2ai2fl21Ud0YH1mSlNEPPmcZzq?usp=drive_link)." ; "You can download the models (FBX) [here](https://github.com/LluisV/Z-Anatomy/tree/PC-Version/Resources/Models/FBX)." ; "This work is licensed under a [Creative Commons Attribution-ShareAlike 4.0 International License]".
- Formats .blend (Google Drive) / FBX (repo /tree/ path is robots-disallowed for ClaudeBot → not fetched). Per-organ sizes: NOT checked. Derived from BodyParts3D per project lore — NOT VERIFIED from a fetched page. Share-alike would bind derived meshes → BodyParts3D (CC BY 4.0) is the simpler choice.
- www.z-anatomy.com/robots.txt returned an HTML page (no robots file) — site not fetched further.

### NIH 3D (3d.nih.gov) — licence per model; no file-level check done
- robots.txt 404. Terms https://3d.nih.gov/terms §4.3 "Licensing of Entries" verbatim: "Users are responsible for selecting and applying the appropriate license to their content. NIH 3D does not enforce license terms on behalf of contributors. ... While many entries in NIH 3D fall under public domain or Creative Commons licenses (e.g., CC-BY), others may have more restrictive terms. Visitors and other Users must review and comply with the licensing terms associated with each file before use." §5.2: "3D models are not intended for medical diagnosis or treatment. They are for illustrative and educational purposes only."
- FAQ https://3d.nih.gov/faqs: "Most models are downloadable in .glb, .stl, .x3d, and .wrl. Licensing varies, so please review the terms of the assigned license." ; ".glb/.x3d : Best for interactive or web use".
- Specific organ models + their licences: NOT FOUND (site search is client-rendered JS; not pursued). Would need per-entry licence verification.

### Visible Human Project (NLM) — open, no registration, but volumetric image data (no meshes)
- https://www.nlm.nih.gov/research/visible/getting_data.html (Last Reviewed: December 26, 2023) verbatim: "As of July 2019, the NLM Data License has been replaced by Terms and Conditions . No registration is required to access data available from NLM's FTP servers. Users will not be required to renew a license agreement at the end of the year." ; data: "axial CT scans of the entire body taken at 1 mm intervals at a resolution of 512 pixels by 512 pixels" ; "There are 1871 cross-sections for each mode, CT and anatomy, obtained from the male cadaver." ; "The female dataset is about 40 gigabytes in size." Data hosted at https://data.lhncbc.nlm.nih.gov/public/Visible-Human/ (not fetched).
- Terms https://www.nlm.nih.gov/databases/download/terms_and_conditions.html (Last Reviewed: May 21, 2019) verbatim: "Users of the data agree to: acknowledge NLM as the source of the data by including the phrase "Courtesy of the U.S. National Library of Medicine" in a clear and conspicuous manner, not indicate or imply that NLM has endorsed its products/services/applications."
- Assessment: usable legally, but it's raw slice imagery (GB scale) — would need segmentation/meshing; not a ready browser model.

## C. Muscle mechanics (12.2)
### A. V. Hill (1938) — equation read on PAGE IMAGES
- Crossref verified doi:10.1098/rspb.1938.0050: "The heat of shortening and the dynamic constants of muscle", Proc. R. Soc. Lond. B 126(843):136–195, issued 1938-10-10, author Hill, publisher The Royal Society. Crossref licence entry: content-version "tdm" → https://royalsociety.org/journals/ethics-policies/data-sharing-mining/ (not fetched). Royal Society site not accessed.
- Open scan: archive.org item dli.ernet.534464 ("Proccedings Of The Royal Society Of London Series B Vol Cxxvi (1939)", Digital Library of India, source IARI Library; publisher Harrison and Sons). Metadata: access-restricted-item = none; rights/licenseurl = none stated. Duplicate: dli.ernet.27066. COPYRIGHT CAVEAT: Hill d. 1977 → text likely still in copyright (UK life+70); DLI item has no rights statement. Cite + quote the equation (short quotation), do not reproduce pages.
- Page mapping: leaf n180 = p.160, n181 = p.161 (page images saved /tmp/vv-research/p12a/hill/p12a_hill_n180.jpg, _n181.jpg, _n190.jpg (=p.170)). URL pattern https://archive.org/download/dli.ernet.534464/page/n181_w1200.jpg ; details page https://archive.org/details/dli.ernet.534464
- p.161, read on image: "(P + a) v = b(P₀ − P),   (1)" "where b is a constant defining the absolute rate of energy liberation This may be written" "(P + a)(v + b) = (P₀ + a) b = const   (2)" "Equation (2) relates speed and load in an isotonic shortening, ... It represents a rectangular hyperbola with asymptotes at P = −a, v = −b".
  Also p.161: "At 0° C in the frog's sartorius the mean value of b/l was about 0·33/sec (Table III below), and the average variation from the mean in eleven experiments was only 9 %"; "Thus a/P₀ may be regarded, at least as a first approximation, as a natural constant for frog's muscle"; "it will liberate heat approximately equal to P₀x/4 g cm".
- p.160, read on image: "In eleven experiments the mean value of a/P₀ was about 0·25, and the average variation from the mean was only 10 %" (NOTE: archive OCR text says "0 26" — the page image reads 0·25; trust the image.) ; "At 0° C in the frog's sartorius the mean value of a/A in a maximal contraction is about 400 g wt./sq. cm". Units: P, a in g weight; v, b in cm/sec.
- p.162 (OCR only, not image-checked): "b was found to be increased about 2·05 times for a rise of 10° C".
### Lever mechanics of forearm/biceps
- Only qualitative: SEER https://training.seer.cancer.gov/anatomy/skeletal/ "Bones work together with muscles as simple mechanical lever systems to produce body movement." Quantitative forearm/biceps lever (moment arms, lever class) from open gov/PD source: NOT FOUND.

## D(1). Poiseuille's law — read on PAGE IMAGES
- Source: Comptes rendus hebdomadaires des séances de l'Académie des sciences, t. XI (1840, 2e semestre), archive.org item comptesrendusheb11acad (contributor Natural History Museum Library, London; possible-copyright-status: "Public domain. The BHL considers that this work is no longer under copyright protection."; access-restricted-item = none). Section header p.1041 (OCR): "PHYSIQUE. — Recherches expérimentales sur le mouvement des liquides dans les tubes de très petits diamètres; par M. le docteur Poiseuille (Suite.) (Extrait par l'auteur.) (Commissaires, MM. Arago, Savart, Savary, Piobert.)" Index: "Poiseuille ... 961 et 1041".
- Leaf n1055 = p.1046, n1056 = p.1047 (images /tmp/vv-research/p12a/pois/n1055.jpg, n1056.jpg; URL https://archive.org/download/comptesrendusheb11acad/page/n1055_w1200.jpg).
- p.1046, image: "nous sommes en droit de conclure que les produits, toutes choses égales d'ailleurs, sont entre eux comme les quatrièmes puissances des diamètres." ; "il viendra pour l'équation du mouvement des liquides dans nos petits tubes, D représentant le diamètre, Q = k″ PD⁴/L, k″ étant un coefficient constant pour la même température et la même intensité de la pesanteur." ; "la moyenne étant 2495,224; l'équation ci-dessus devient Q = 2495,224 PD⁴/L à la température de 10° c." ; with distilled-water head "Q = 183,783 PD⁴/L".
- p.1047, image: "V = (4k″/π)·(P.D²/L)" ; "Ainsi la vitesse, dans les tubes de très petits diamètres, est proportionnelle à la pression, en raison inverse de leurs longueurs, et proportionnelle au carré de leurs diamètres." ; "si les vaisseaux capillaires de l'un sont, par exemple, d'un diamètre 2 fois plus grand que celui des capillaires de l'autre, il passera dans le premier, toutes choses égales d'ailleurs, 16 fois plus de liquide que dans le second."
- Gallica: robots.txt 403 Cloudflare → not used. Herschel 1940 English translation: NOT FOUND on archive.org ("rheological memoirs" 0 hits).

## Robots re-check of previously blocked hosts (2026-11-28)
- www.cdc.gov/robots.txt 200 (now reachable; not used). rupress.org 200 (not used). www.niaid.nih.gov 403, www.nih.gov 403 → skipped.

## NOT FOUND list
- Number of skeletal muscles in the body (SEER).
- Numerical lung volumes/capacities (tidal volume etc.) — SEER capacity page has none.
- Heart beats per day; litres pumped per day (NHLBI).
- Stroke volume value; quantitative CO2-transport split (bicarbonate/carbamino/dissolved).
- Quantitative forearm/biceps lever data from open source.
- Herschel 1940 translation of Poiseuille.
- NIH 3D specific organ models + licences (not checked; per-model licensing).
- Z-Anatomy per-organ file sizes (FBX dir is under robots-disallowed /tree/ path).

## Blocked / prohibitions
- gallica.bnf.fr (robots 403 Cloudflare). niaid.nih.gov, nih.gov (403). github.com /tree/ /raw/ disallowed for ClaudeBot.
- No AI/LLM-ingestion prohibition met on any page used (SEER/cancer.gov, NHLBI, MedlinePlus, NBDC/BodyParts3D, NLM, NIH 3D, archive.org).
- Third-party copyrighted media to avoid: NHLBI Nucleus Medical Media images/animations; MedlinePlus A.D.A.M. content; NCI graphics credited to private designers.
