# Source notes — Phase 11 (Biologic Foundations)

Research agents, 2026-11-28. robots.txt checked per host before fetching. Verbatim notes follow; items used in the app are re-checked by hand (marked ✔ in BUILD_LOG).

## A. Sizes, cells, membranes, chlorophyll (gates 11.1, 11.4, 11.5, 11.7)

# Phase 11-A research notes (gates 11.1, 11.4, 11.5, 11.7) — 2026-11-28
All quotes verbatim from pages fetched with curl on 2026-11-28. Raw HTML/text in /tmp/vv-research/pages/.

## robots.txt results
- nigms.nih.gov: 200; `User-agent: *` disallows only /core/, /profiles/, /admin/, /search/, user/ paths etc. No AI-specific rules. Content paths (/education/glossary, /biobeat/..., /Pages/Disclaimers) ALLOWED.
- www.genome.gov: 200; same Drupal default; no AI-specific rules; /genetics-glossary/* and /about-nhgri/* ALLOWED.
- www.cdc.gov: robots.txt returned 403 "Access Denied" (Akamai) -> could not read robots -> did NOT fetch any CDC page.
- www.niaid.nih.gov: robots.txt 403 Forbidden -> not fetched.
- rupress.org: robots.txt 403 "Request forbidden by administrative rules." -> not fetched (Goldman 1943 JGP not read there).
- www.photochemcad.com: robots.txt 403 Forbidden -> not fetched.
- book.bionumbers.org: robots.txt explicitly `User-agent: ClaudeBot  Disallow: /` and `User-agent: anthropic-ai  Disallow: /` (also GPTBot, CCBot etc.) -> OFF-LIMITS, not fetched.
- bionumbers.hms.harvard.edu: robots.txt 404 (no robots file; Incapsula-fronted).
- pdb101.rcsb.org: 200; `User-agent: *` disallows /search/, /teach/logout, /motm/test, /internal etc. /motm/<n> ALLOWED.
- omlc.org: `User-agent: *  Disallow:` (everything allowed).
- physoc.onlinelibrary.wiley.com: `User-agent: *` disallows /action, /search, /na101/, /doi/am-pdf/ ...; GPTBot and Google-Extended Disallow /. No ClaudeBot/anthropic rule. Crawl-delay 1.
- earthobservatory.nasa.gov/robots.txt: 301 -> redirected to science.nasa.gov/earth/earth-observatory/ (HTML page, not a robots file).
- archive.org: `User-agent: *` disallows only /control/, /report/.
- www.biology-pages.info: robots.txt 404.
- biobeat.nigms.nih.gov: connection failed (000); Biomedical Beat now served under nigms.nih.gov/biobeat/ (covered by nigms.nih.gov robots).
- cdn.rcsb.org: robots.txt 404 (none). www.rcsb.org: `User-agent: *` Allow / (disallows /search/, /mypdb/ etc.).
- europepmc.org: robots.txt explicitly `User-agent: ClaudeBot Disallow: /`, `User-agent: anthropic-ai Disallow: /`, `Claude-Web Disallow: /`; `*` has Content-Signal ai-train=no -> OFF-LIMITS, not fetched.
- www.ebi.ac.uk: `*` disallows /cgi-bin/webservices etc. (not used; Europe PMC is off-limits in spirit).
- science.nasa.gov: `User-agent: * Allow: /`.
- www.nano.gov: `User-agent: * Disallow:` (all allowed).
- www.nist.gov: Drupal default, `*` content paths allowed (/document/... allowed).
- www.nih.gov robots 403 -> not used. www.cancer.gov, www.nhlbi.nih.gov, www.nlm.nih.gov, www.fda.gov robots 200 with no AI rules (no pages fetched).
- physoc.onlinelibrary.wiley.com article page + /.well-known/tdmrep.json: Cloudflare "Just a moment..." challenge (403) -> BOT WALL, stopped.
- bionumbers.hms.harvard.edu: pages time out (curl rc=28, twice) -> not read; terms of use NOT read.

## Licence / reuse statements (verbatim)
- NIGMS (https://nigms.nih.gov/Pages/Disclaimers): "Most of the information on this website is not copyrighted so you are free to use it with proper attribution. This permission does not extend to the images provided to us by others, with the exception of those images in the Image and Video Gallery."
- NIGMS Inside the Cell (archive.org item ost-biology-inside_the_cell): archive metadata `rights: Public Domain`, `licenseurl: http://www.nigms.nih.gov/FOIA.html`. Booklet itself: "NIH Publication No. 05-1051 / Revised September 2005"; editor "Alisa Zapp Machalek". No explicit public-domain sentence found in the OCR of the booklet.
- NHGRI (https://www.genome.gov/about-nhgri/Policies-Guidance/Copyright): "Text, graphics, videos, illustrations and other information on National Human Genome Research Institute (NHGRI) websites are in the public domain, unless otherwise indicated. You may freely use and distribute this information; however, we request acknowledgement, such as: \"Courtesy: National Human Genome Research Institute\" with a link back to genome.gov."
- RCSB/PDB-101 (https://www.rcsb.org/pages/policies): "Molecule of the Month articles are copyrighted by RCSB PDB and the article authors. Text can be reprinted with permission, with attribution, and without the right to manipulate or change content. Contact info@rcsb.org for permission." / "Molecule of the Month illustrations are available under a CC-BY-4.0 license." / "PDB-101 content is free for use under a CC-BY-4.0 license and should be referenced with the URL PDB101.rcsb.org) and the citation: PDB-101: Educational resources supporting molecular explorations through biology and medicine. (2022) Protein Science 31: 129-140 10.1002/pro.4200"  => MotM TEXT NOT reusable without permission (cite facts only); other PDB-101 content (flyers) CC BY 4.0.
- nano.gov (https://www.nano.gov/copyrightinfo/): "Nano.gov abides by the copyright policy of the White House Office of Science and Technology Policy: Pursuant to federal law, government-produced materials appearing on this site are not copyright protected. The United States Government may receive and hold copyrights transferred to it by assignment, bequest, or otherwise."
- OMLC (omlc.org): no licence statement found; pages say "© 2 June 2017 Scott Prahl"; home page "Copyright 2018 Scott Prahl & Steve Jacques". Data-file header: "Data from PhotochemCAD 2.1a has been munged on 2 June 2017 by Scott Prahl to make the information available to non-Windows users. Although I have tried to be as careful as possible, I may have introduced some error; the cautious user is advised to compare these results with the original sources at www.photochemcad.com". => No explicit reuse licence; cite as data source, do not redistribute files wholesale without permission (my judgement).
- Hodgkin & Katz 1949 via archive.org (sim_journal-of-physiology_the-journal-of-physiology_1949_108; collection sim_microfilm, no rights field, not access-restricted). Crossref licence: Wiley termsAndConditions#vor. Copyright status of the 1949 article: NOT stated on archive.org; treat as short verbatim quotation/citation of a published equation and values only.
- NASA Earth Observatory: page footer links "NASA Brand & Usage Guidelines" (not fetched this session; project already has NASA usage statement from E.2).
- DOE "Scale of Things" chart (hosted by NIST): footer "Office of Basic Energy Sciences / Office of Science, U.S. DOE / Version 05-26-06". No explicit licence on chart; US-government work (contains third-party images — cite values only).

## 11.1 / 11.4 / 11.5 values (verbatim)
### NIGMS Biomedical Beat, "Take a Tour of Your Cells' Organelles!", Alisa Zapp Machalek, March 17, 2021 (archived page)
URL https://nigms.nih.gov/biobeat/2021/03/take-a-tour-of-your-cells-organelles
Table "ACTUAL SIZE (AVERAGE)" (credit: NIGMS):
- "Cell diameter 30 micrometers*"
- "Nucleus diameter 5 micrometers"
- "Mitochondrion length Typically 1-2 micrometers but can be up to 7 micrometers long"
- "Lysosome diameter 50-3,000 nanometers*"
- "Ribosome diameter 20-30 nanometers"
- footnote "*A micrometer is 1 millionth of a meter. A nanometer is 1 billionth of a meter. Credit: NIGMS."
- Text: "The nucleus is the most prominent organelle and can occupy up to 10 percent of the space inside a cell." / "The ER often makes up more than 10 percent of a cell's total volume."
### NIGMS Inside the Cell (NIH Pub. 05-1051, rev. Sept 2005) — archive.org https://archive.org/details/ost-biology-inside_the_cell (OCR: .../inside_the_cell_djvu.txt)
Same organelle table (Chapter 1) plus:
- "Microtubule width 25 nanometers"; "Intermediate filament width 10 nanometers"; "Actin filament width 5-9 nanometers"
- Eukaryote/prokaryote table (Chapter 1): "EUKARYOTIC CELLS The cells of "complex" organisms, including all plants and animals" / "PROKARYOTIC CELLS "Simple" organisms, including bacteria and blue-green algae" / "Contain a nucleus and many other organelles, each surrounded by a membrane (the nucleus and mitochondrion have two membranes)" / "Lack a nucleus and other membrane-encased organelles" / "Usually exist as single, virtually identical cells" / "Most animal cells are 10-30 micrometers across, and most plant cells are 10-100 micrometers across" (eukaryotes) / "Most are 1-10 micrometers across" (prokaryotes) / "Virtually all forms of life fall into one of two categories: eukaryotes or prokaryotes."
- Egg: "The largest human cell (by volume) is the egg. Human eggs are 150 micrometers in diameter and you can just barely see one with a naked eye." (Chapter 2)
- "A typical cell contains about 1 billion molecules of ATP at any given time. In many cells, all of this ATP is used up and replaced every 1 to 2 minutes!"
- "Scientists estimate that each of your cells contains about 10 billion protein molecules of approximately 10,000 different varieties."
- Mitochondria count: "A human heart cell contains several thousand mitochondria — around 25 percent of the cell's volume. Cells that don't need much energy, like skin cells, contain only a few hundred mitochondria." (Chapter 3)
- Squid axon: "squid nerve cells are a thousand times fatter than human nerve cells." (Chapter 3 sidebar)
(Note: OCR text; page numbers within booklet not mapped. Verify against PDF page images before publishing.)
### NIGMS Biomedical Beat, "Science Snippet: Zooming In on Nanoparticles", Abbey Bigler, December 13, 2023
URL https://nigms.nih.gov/biobeat/2023/12/science-snippet-zooming-in-on-nanoparticles
- "For example, DNA is about 2 nanometers wide, and the protein in red blood cells that carries oxygen throughout our bodies is roughly 5.5 nanometers wide. A human hair is massive in comparison, with a width of about 80,000 to 100,000 nanometers."  (haemoglobin ~5.5 nm; DNA ~2 nm; hair 80–100 µm)
### NIGMS Biomedical Beat, "Science Snippet: The Marvels of Membranes", Abbey Bigler, December 15, 2021
URL https://nigms.nih.gov/biobeat/2021/12/science-snippet-the-marvels-of-membranes
- "In membranes, this alignment makes a bilayer barrier that is two lipid molecules deep." / "Scientists estimate that between 20 and 30 percent of the proteins that our cells make are found within membranes." / "The transfer results in ion gradients—more ions on one side of the membrane than the other—which are necessary for energy production and nerve signaling."  (NO thickness value)
### NIGMS glossary https://nigms.nih.gov/education/glossary
- Eukaryotic cell: "A cell with a membrane-bound nucleus and other organelles not found in prokaryotic cells. Eukaryotic cells make up animals, plants, fungi, and some single-celled organisms."
- Prokaryotic cell: "A cell that lacks a nucleus, such as a bacterium."
- Cell: "The basic subunit of any living organism; the simplest form of life. Cells house the biological machinery that makes the proteins, chemicals, and signals responsible for everything that happens inside the body."
- Membrane: "A semi-fluid layer of lipids and proteins. Membranes enclose cells and organelles and control passage of materials into and out of them."
- Mitochondrion: "The cell's power plant; the organelle that converts food and oxygen into energy to fuel the cell. Mitochondria contain their own small genomes and appear to have descended from free-living bacteria."
- Organelle: "A specialized structure that has a defined function in the cell. Organelles include the nucleus, mitochondria, Golgi, endoplasmic reticulum (ER), and lysosomes."
- Ribosome: "A molecular complex in which proteins are made. It's composed of proteins and ribosomal RNA."
- Nucleus: "Biology: The membrane-bound structure within a eukaryotic cell that contains most of the cell's genetic material."
- Bacterium: "A one-celled microorganism without a nucleus."
- Nanoparticle: "A particle that is less than 100 nanometers (one-billionth of a meter) in all dimensions."
### NHGRI Talking Glossary (genome.gov/genetics-glossary/<Term>), page shows "updated: November 28, 2026"
- Cell: "A cell is the basic building block of living things. All cells can be sorted into one of two groups: eukaryotes and prokaryotes. A eukaryote has a nucleus and membrane-bound organelles, while a prokaryote does not. Plants and animals are made of numerous eukaryotic cells, while many microbes, such as bacteria, consist of single cells. An adult human body is estimated to contain between 10 and 100 trillion cells."
- Nucleus: "A nucleus, as related to genomics, is the membrane-enclosed organelle within a cell that contains the chromosomes. An array of holes, or pores, in the nuclear membrane allows for the selective passage of certain molecules (such as proteins and nucleic acids) into and out of the nucleus."
- Mitochondria: "Mitochondria are membrane-bound cell organelles (mitochondrion, singular) that generate most of the chemical energy needed to power the cell's biochemical reactions. Chemical energy produced by the mitochondria is stored in a small molecule called adenosine triphosphate (ATP). Mitochondria contain their own small chromosomes. Generally, mitochondria, and therefore mitochondrial DNA, are inherited only from the mother."
- Ribosome: "A ribosome is an intercellular structure made of both RNA and protein, and it is the site of protein synthesis in the cell. ..."
- Cell Membrane (URL /genetics-glossary/Cell-Membrane-Plasma-Membrane): "The cell membrane, also called the plasma membrane, is found in all cells and separates the interior of the cell from the outside environment. The cell membrane consists of a lipid bilayer that is semipermeable. The cell membrane regulates the transport of materials entering and exiting the cell."
- Organelle: "An organelle is a subcellular structure that has one or more specific jobs to perform in the cell, much like an organ does in the body. Among the more important cell organelles are the nuclei, which store genetic information; mitochondria, which produce chemical energy; and ribosomes, which assemble proteins."
- Double Helix: "...A DNA molecule is made up of two linked strands that wind around each other to resemble a twisted ladder in a helix-like shape..." (no dimension)
- Base Pair narration (Sarah A. Bates): "One copy of the human genome consists of approximately 3 billion base pairs of DNA, which are distributed across 23 chromosomes." (no rise value)
- Virus: "A virus is an infectious microbe consisting of a segment of nucleic acid (either DNA or RNA) surrounded by a protein coat. A virus cannot replicate alone; ..."
- Bacteria: "Bacteria are small single-celled organisms. ..."
- Cytoplasm: "Cytoplasm is the gelatinous liquid that fills the inside of a cell. It is composed of water, salts, and various organic molecules. ..."
- Prokaryote, Eukaryote, Chloroplast: /genetics-glossary/<term> returned 404 (no standalone entry at those slugs).
### nano.gov "Just How Small Is "Nano"?" https://www.nano.gov/about-nanotechnology/just-how-small-is-nano/ (NNCO)
- "A sheet of paper is about 100,000 nanometers thick." / "A strand of human DNA is 2.5 nanometers in diameter." / "A human hair is approximately 80,000–100,000 nanometers wide." / "A single gold atom is about a third of a nanometer in diameter."
### DOE BES "The Scale of Things – Nanometers and More" (Version 05-26-06), PDF at https://www.nist.gov/document/doescaleofthingschartpdf (-> /system/files/documents/2017/05/09/doe_scale_of_things_chart.pdf)
- "Red blood cells (~7-8 µm)"; "Human hair ~ 60-120 µm wide"; "Dust mite 200 µm"; "Ant ~ 5 mm"; "ATP synthase ~10 nm diameter"; "DNA ~2-1/2 nm diameter"; "Atoms of silicon spacing 0.078 nm"; "Fly ash ~ 10-20 µm"; "Pollen grain" (no value read).
### PDB-101 "Virus Structures" flyer (CC BY 4.0) https://pdb101.rcsb.org/learn/flyers-posters-and-calendars/flyer/virus-structures ; PDF https://cdn.rcsb.org/pdb101/learn/resources/flyers/viruses-shapes-sizes.pdf
- "Most viruses are much smaller than cells–the ones shown here are all drawn at approximately 900,000x magnification, ranging from less than 30 nanometers to over 500 nanometers in diameter (1 nanometer = 1 billionth of a meter)."
- Scale bars in figure: Feline distemper (PDB 1c8e) "28.4 nm"; Mimivirus (EMD-5039) "520 nm". Also Bacteriophage T4 (EMD-1414, EMD-1126), TMV (3j06), rhinovirus (1rhv), dengue (1k4r) — no numeric sizes given for these.

## 11.5 Membrane potential (Hodgkin & Katz 1949)
Crossref 10.1113/jphysiol.1949.sp004310: title "The effect of sodium ions on the electrical activity of the giant axon of the squid"; authors A. L. Hodgkin, B. Katz; The Journal of Physiology 108(1):37-77; issued 1949-03; publisher Wiley.
Read from page images: https://archive.org/download/sim_journal-of-physiology_the-journal-of-physiology_1949_108/page/n83_w1200.jpg (journal p.66) and n84 (p.67).
- p.66 eq. (4): E = (RT/F) log_e [ (P_K (K)_i + P_Na (Na)_i + P_Cl (Cl)_o) / (P_K (K)_o + P_Na (Na)_o + P_Cl (Cl)_i) ]
- "where (K)_i, (Na)_i and (Cl)_i are activities inside the axon; (K)_o, (Na)_o and (Cl)_o are activities outside the axon; P_K, P_Na and P_Cl are permeability constants for the individual ions." ... "E is the potential difference across the membrane (outside − inside) in the absence of any net ionic current."  NOTE sign convention: E = outside − inside (opposite of modern V_in − V_out).
- "P_K = (RT/Fa) u_K b_K ... where a is the thickness of the membrane; u_K, u_Na and u_Cl are mobilities of the ions in the membrane; b_K, b_Na and b_Cl are the partition coefficients between the membrane and the aqueous solution."
- "There are many reasons for supposing that this equation is no more than a rough approximation ... it reduces to the thermodynamically correct forms when any one permeability constant is made large compared to the others."
- Internal concentrations (squid axon): "(K)_i = 345 mM. (mean of average values in table 4, in Steinbach & Spiegelman, 1943); (Na)_i = 72 mM. (mean of average values in table 4, in Steinbach & Spiegelman, 1943); (Cl)_i = 61 mM. (mean of tables 1 and 2 in Steinbach, 1941)."
- p.67 Table 7 "Permeability coefficients used in calculation" P_K P_Na P_Cl: Resting "1 0·04 0·45"; Active (peak of spike) "1 20 0·45"; Refractory (maximum of positive phase) "1·8 0 0·45".
- Table 7 footnote: "Solutions A, B and C were tested against an artificial sea-water solution containing 10 mM-K 455 mM-Na, 587 mM-Cl. Solutions D–I were tested against sea water containing approximately 10mM-K, 455 mM-Na, 540 mM-Cl. Calculated potentials were obtained from equation 4 using values of (K)_i=345 mM., (Na)_i=72 mM., (Cl)_i=61 mM. J is the liquid junction potential between the axoplasm and the sea water in the microelectrode."
- Table 7 rows: "Membrane potential at rest in sea water +48+J (observed) +59 (calculated)"; "at height of activity −40+J / −38"; "at maximum of positive phase +62+J / +74"; "Action potential in sea water 88 / 97"; "Positive phase in sea water 14 / 15".
Goldman 1943: Crossref 10.1085/jgp.27.1.37 "POTENTIAL, IMPEDANCE, AND RECTIFICATION IN MEMBRANES", David E. Goldman, Journal of General Physiology 27(1):37-60, issued 1943-09-20, Rockefeller University Press. Full text NOT READ (rupress robots 403; archive.org has only vol 27 index/contents).

## 11.7 Chlorophyll (OMLC, Scott Prahl, from PhotochemCAD 2.1a)
- Chl a in diethyl ether https://omlc.org/spectra/PhotochemCAD/html/123.html ; data https://omlc.org/spectra/PhotochemCAD/data/123-abs.txt (219.81–700 nm). Quote: "This optical absorption measurement of Chlorophyll a were made by J. Li on 12-11-1997 using a Cary 3." / "These measurements were scaled to make the molar extinction coefficient match the value of 111,700cm-1/M at 427.8nm (Strain, 1963)." / fluorescence "The quantum yield of this molecule is 0.32 (Weber, 1957)."
- Chl b in diethyl ether https://omlc.org/spectra/PhotochemCAD/html/125.html ; data .../data/125-abs.txt (300–800 nm). Quote: "made by M. Taniguchi in 2001 using a Cary 3." / "scaled to make the molar extinction coefficient match the value of 159,100cm-1/M at 453.0nm (Vernon, 1966)." / "The quantum yield of this molecule is 0.117 (Weber, 1957)."
- Chl a in methanol: html/122.html, data/122-abs.txt.
- DERIVED BY ME from the data files (not stated on pages): Chl a (ether) blue max 427.75 nm (111700), red max in 600–700 nm at 660.06 nm (85265 M^-1 cm^-1). Chl b (ether) blue max 453.0 nm (159100), red max 643.0 nm (57050). Chl a (methanol) 417.75 nm (111891), red 659.25 nm (32888).
- Primary refs verified on Crossref: Du, Fuh, Li, Corkan, Lindsey "PhotochemCAD‡: A Computer‐Aided Design and Research Tool in Photochemistry", Photochemistry and Photobiology 68:141-142 (1998), DOI 10.1111/j.1751-1097.1998.tb02480.x (also 10.1562/0031-8655(1998)068<0141:pacada>2.3.co;2). Dixon, Taniguchi, Lindsey "PhotochemCAD 2: A Refined Program with Accompanying Spectral Databases for Photochemical Calculations", Photochemistry and Photobiology 81:212-213 (2005), DOI 10.1111/j.1751-1097.2005.tb01544.x (also 10.1562/2004-11-06-tsn-361.1).

## Photosynthesis equation — NASA Earth Observatory "The Carbon Cycle", Holli Riebeek (design Robert Simmon), Jun 16, 2011
URL https://science.nasa.gov/earth/earth-observatory/the-carbon-cycle/ (old URL earthobservatory.nasa.gov/features/CarbonCycle/page3.php redirects here)
- "Using energy from the Sun, both plants and plankton combine carbon dioxide (CO2) and water to form sugar (CH2O) and oxygen. The chemical reaction looks like this: CO2 + H2O + energy = CH2O + O2"
- Respiration/decay: "CH2O + O2 = CO2 + H2O + energy"
- "During photosynthesis, plants absorb carbon dioxide and sunlight to create fuel—glucose and other sugars—for building plant structures."
(No 6CO2 + 6H2O -> C6H12O6 + 6O2 form found.)

## NOT FOUND (from an allowed open source)
- Water molecule size; glucose size; DNA base-pair rise (0.34 nm); lipid bilayer thickness (nm); E. coli length/width/volume; yeast/HeLa volume; influenza / SARS-CoV-2 / poliovirus sizes (CDC/NIAID blocked); red blood cell thickness; neuron length; typical mammalian intra/extracellular Na+/K+/Cl−/Ca2+ concentrations; Goldman 1943 full text; photosynthesis equation in 6CO2/C6H12O6 form; BioNumbers terms of use; PhotochemCAD site terms.

## Blocked / forbidden
- book.bionumbers.org (Cell Biology by the Numbers): robots.txt disallows ClaudeBot and anthropic-ai.
- europepmc.org: robots.txt disallows ClaudeBot, anthropic-ai, Claude-Web; ai-train=no.
- physoc.onlinelibrary.wiley.com: Cloudflare challenge (bot wall).
- www.cdc.gov, www.niaid.nih.gov, rupress.org, www.photochemcad.com, www.nih.gov: robots.txt itself 403 -> not fetched.
- bionumbers.hms.harvard.edu: connections time out.
- No page encountered with an explicit AI/LLM-ingestion prohibition in its body text. (Note: NIH pages carry a banner about "Super Intelligence" terminology — irrelevant.)


## B. Biomolecules, structures, transport (gates 11.2, 11.3, 11.6)

# Phase 11-B raw notes (2026-11-28)
## robots
- www.ncbi.nlm.nih.gov: no ClaudeBot/anthropic group; `*` group Crawl-delay 5; /Taxonomy/Utils/ NOT disallowed (only /Taxonomy/Selector, /Taxonomy/CommonTree); /home/about/policies allowed.
- pubchem.ncbi.nlm.nih.gov (robots "Version: 2026-10-29.1"): `User-agent: GPTBot / ClaudeBot / Amazonbot / CCBot  Disallow: /`; `*` group: Disallow: /rest/pug/ (pug_view not listed). => BLOCKED for ClaudeBot entirely. No PubChem page fetched.
- www.nlm.nih.gov: * allowed for /web_policies.html
- www.rcsb.org: * allows /pages/, /structure/; disallows /search/ etc.
- files.rcsb.org: /robots.txt returns 404 JSON (no restrictions)
- data.rcsb.org: `User-agent: * Disallow: /graphql Disallow: /rest` => REST API NOT used.
- www.wwpdb.org: /robots.txt serves HTML homepage (no robots file) => no restrictions
- www.uniprot.org: * disallows only /blast/ /align/ /peptide-search/ /id-mapping/ /basket/
- rest.uniprot.org: * disallows /docs/, /idmapping/, */stream/ ; /help/ allowed
- www.ebi.ac.uk: * Crawl-Delay 10; /chebi not disallowed for * (only Baiduspider)
- api.crossref.org: /robots.txt route-not-found (no file)
- archive.org: `*` disallows only /control/ /report/; no Claude rules.
- www.biodiversitylibrary.org: `User-agent: * Content-Signal: search=yes,ai-train=no,use=reference`; `User-agent: ClaudeBot Disallow: /`; `anthropic-ai Disallow: /`; `Claude-Web Disallow: /` => BLOCKED, not fetched.
- www.nobelprize.org: * disallows only /wp-admin/; no Claude group.
- pubs.acs.org: * group; GPTBot/meta groups listed; no Claude group.

## Fick (verified from page images)
EN: Phil. Mag. 4th ser. vol 10 (1855) "V. On Liquid Diffusion. By Dr. Adolf Fick, Demonstrator of Anatomy, Zürich" pp.30-39. archive.org id londonedinburghp10maga (contributor Natural History Museum Library, London; rights http://www.biodiversitylibrary.org/permissions/ ; licenseurl CC BY-NC 3.0). p.30 = page/n43, p.31 = page/n44.
 p.30 words: "the transfer of salt and water occurring in a unit of time, between two elements of space filled with differently concentrated solutions of the same salt, must be, ceteris paribus, directly proportional to the difference of concentration, and inversely proportional to the distance of the elements from one another."
 p.30 flux: "a quantity of salt = −Q . k . dy/dx dt, in which Q signifies the surface of the stratum, and k a constant dependent upon the nature of the substances."
 p.31 eq (1): δy/δt = −k(δ²y/δx² + (1/Q)(dQ/dx)·δy/δx); eq (2): δy/δt = −k δ²y/δx²  (sign printed as negative)
 footnote p.30: "From Poggendorff's Annalen, vol. xciv. p. 59; abstracted and communicated by the Author."
DE: Ann. Phys. (Poggendorff) Bd. XCIV (94) 1855, "IV. Ueber Diffusion; von Dr. Adolf Fick" starting p.59; archive id sim_annalen-der-physik_1855_94_1 (no rights metadata). Law statement p.65 (page/n104), flux and eqs (1),(2) p.66 (page/n105).

## Einstein (verified page images)
Einstein, A., "Investigations on the Theory of the Brownian Movement", ed. R. Fürth, transl. A. D. Cowper, Methuen & Co. Ltd, London, 1926 ("This Translation First Published in 1926"). archive.org id investigationson0000albe (collection internetarchivebooks; no access-restricted flag; no rights field). Paper I ("On the movement of small particles suspended in a stationary liquid demanded by the molecular-kinetic theory of heat"), §4, p.17 (page/n28): eq (11) "λx = √(x̄²) = √(2Dt)"; "The mean displacement is therefore proportional to the square root of the time." eq (12) total: λx√3. §5 p.17: D = (RT/N)·1/(6πkP). p.18 (page/n29): λx = √t·√(RT/N · 1/(3πkP)); example "water at 17° C. ... (k = 1·35·10⁻²), ... diameter of the particles ·001 mm. We get λx = 8·10⁻⁵ cm. = 0·8μ. The mean displacement in one minute would be, therefore, about 6μ." "Berne, May, 1905. (Received, 11 May, 1905.)"
Dover 1956 (investigationson00eins): access-restricted-item: true (lending/printdisabled) - NOT usable.

## van 't Hoff (verified page image)
J. H. van't Hoff (Amsterdam), "Die Rolle des osmotischen Druckes in der Analogie zwischen Lösungen und Gasen", Z. physik. Chem. 1 (1887) 481ff. archive.org id sim_zeitschrift_physikalische_chemie_1887_1 (no rights/licence metadata; not access-restricted). p.491 = page/n496, §V "Gesamtausdruck von Boyles, Gay-Lussacs und Avogadros Satz für Lösungen und Gase":
"Die bekannte Formel, welche für Gase die beiden Gesetze von Boyle und Gay-Lussac zum Ausdruck bringt: PV=RT ist nunmehr, wo die genannten Sätze auch auf Flüssigkeiten anwendbar sind, falls es sich da um den osmotischen Druck handelt, auch für Lösungen gültig; sogar mit derselben Beschränkung, die auch bei Gasen zu berücksichtigen ist, dass nämlich die Verdünnung genügend gross sei, um die gegenseitige Wirkung und den eingenommenen Raum der gelösten Partikelchen vernachlässigen zu können."
"P=10333, V=2/0·08956, T=273, R=845·05." ... "PV=845 T und bezieht sich in dieser Form nicht nur auf Gase, sondern auf sämtliche Lösungen, falls dann nur immer P als osmotischer Druck genommen wird."
Nobel lecture 1901 (nobelprize.org/prizes/chemistry/1901/hoff/lecture/ -> PDF uploads/2018/06/hoff-lecture.pdf): robots allows, but Terms of use: "You may not reproduce, distribute, display, transmit, modify, perform, adapt, generate derivative works or otherwise use the Content without prior written permission" (limited not-for-profit classroom exemption). PDF NOT fetched; not recommended.

## Michaelis & Menten 1913 (verified page images)
L. Michaelis und Miß Maud L. Menten, "Die Kinetik der Invertinwirkung", Biochem. Z. 49 (1913) 333ff. archive.org id sim_biochemische-zeitschrift-beitraege-zur-chemischen_1913_49 (no rights/licence metadata). p.343 = page/n346, p.344 = page/n347.
p.343: "Zur Deutung dieser Versuche werden wir mit Henri die Annahme machen, daß das Invertin mit der Saccharose eine Verbindung eingehe, die sehr labil ist und in freies Ferment, Glucose und Lävulose zerfällt." ... "Wenn nun 1 Mol Ferment mit 1 Mol Saccharose eine Verbindung von 1 Mol Zucker-Ferment-Verbindung eingeht, so lehrt das Massenwirkungsgesetz, daß stets [S]·[Φ − φ] = kφ (1)"
p.344: "φ die Konzentration des gebundenen Fermentes oder der Ferment-Zuckerbindung, also [Φ − φ] die Konzentration des freien Fermentes. k ist die Dissoziationskonstante." (2) φ = Φ·[S]/([S]+k); "Dieser Menge muß also die Anfangsgeschwindigkeit, v, der Inversion immer proportional sein, oder (3) v = C·Φ·[S]/([S]+k) wo C den Proportionalitätsfaktor bedeutet." (4) V = [S]/([S]+k) with V = v/(CΦ). Experiments at 25,0 ± 0,05° (p.336).

## Diffusion coefficients
(a) International Critical Tables vol. V (1929), "Coefficients of Diffusion in Liquids", H. R. Bruins, pp.63-75; archive id internationalcri0005vari (collection internetarchivebooks, not access-restricted, no rights field). Published for the National Research Council (USA), McGraw-Hill 1929.
 p.63 (page/n80): "Values of Δ are in cm²/sec." "Δ—Defined by the equation ∂c/∂t = Δ ∂²c/∂x² ..." "c = 0* indicates diffusion in very dilute solution. Δ is then practically identical with Δ∞ (diffusion coefficient for infinite dilution)." Reliability letters: A 2%, B 3%, C 5%, D 7%, E 10%, F (?).
 p.64 (page/n81): O2; cf. (43, 66, 74): row "18.0 | 0* | 1.98*±0.04 | C, NaCl % = 1 | (18, 19)"; "18 | 0* | 1.7*E | 20 | (3)"; "0* | 1.6*E | 30 | (3)"; "0* | 1.1*? | 40 | (3)". (column header 'C, NaCl, %'; no O2 row in pure water.)  N2: "22 | 0* | 2.02*E | 0 | (74)".
 p.71 (page/n88): C6H12O6, Glucose: "15 | 0* | 0.52*C-D | (136)" [×10⁻⁵ cm²/s]. C12H22O11 Saccharose: "15 | 0* | 0.38*D | (136)"; "18 | 0.005* | 0.38*E | (134)"; 20.0 °C c0 0.25: 0.43 (±0.01 to 0.02; (94,102)).
(b) Einstein 1926 transl. p.61 (page/n72): "According to the researches of Graham (calculated out by Stephan), the diffusion-coefficient of sugar in water at 9·5° is 0·384, if the day is taken as unit of time." p.62 (page/n73): "Thovert found (Table, p. 372) for the diffusion-coefficient of sugar in water at 18·5° C. and the concentration 0·005 mol./litre the value 0·33 cm.²/day."
Water self-diffusion: NOT FOUND in an open source.

## ATP yield per glucose
NOT FOUND from an allowed open source. Candidates & why blocked:
- Mookerjee SA, Gerencser AA, Nicholls DG, Brand MD (2017) "Quantifying intracellular rates of glycolytic and oxidative ATP production and consumption using extracellular flux measurements", J Biol Chem 292:7189-7207, doi:10.1074/jbc.m116.774471 (Crossref licence list includes http://creativecommons.org/licenses/by/4.0/). Correction: JBC 293:12649-12652 (2018) doi:10.1074/jbc.aac118.004855. www.jbc.org robots: `User-agent: ClaudeBot Disallow: /` and `anthropic-ai Disallow: /` -> not fetched. Value NOT read.
- europepmc.org robots: `* Content-Signal: search=yes,ai-train=no,use=reference`; `ClaudeBot Disallow: /`, `anthropic-ai Disallow: /`, `Claude-Web Disallow: /` -> blocked.
- NCBI Bookshelf (NBK22448 test fetch): HTTP 200 page containing reCAPTCHA -> stopped.
- Rich PR (2003) Biochem Soc Trans 31:1095-1105 doi:10.1042/bst0311095: no licence in Crossref (not open).

## Michaelis-Menten translation
Johnson KA & Goody RS (2011) "The Original Michaelis Constant: Translation of the 1913 Michaelis–Menten Paper", Biochemistry 50(39):8264-8269, doi:10.1021/bi201284u (Crossref verified; no licence field). pubs.acs.org returned HTTP 403 Cloudflare "Just a moment" challenge -> stopped; OA status/licence NOT verified.

## PDB entries (from files.rcsb.org mmCIF/PDB headers; data.rcsb.org/rest disallowed)
see report.
## UniProt licence (rest.uniprot.org/help/license JSON, lastModified 2024-12-18)
"We have chosen to apply the Creative Commons Attribution 4.0 International (CC BY 4.0) License to all copyrightable parts of our databases."
## ChEBI API (www.ebi.ac.uk/chebi/backend/api/public/compound/...)
CHEBI:16761 ADP C10H15N5O10P2 427.203; CHEBI:15846 NAD+ C21H28N7O14P2 664.438; CHEBI:16908 NADH C21H29N7O14P2 665.446; CHEBI:73001 POPC (1-hexadecanoyl-2-(9Z-octadecenoyl)-sn-glycero-3-phosphocholine) C42H82NO8P 760.091.

## C. Gate 11.2 (read by hand, 2026-11-28)

- **NCBI, The Genetic Codes** (https://www.ncbi.nlm.nih.gov/Taxonomy/Utils/wprintgc.cgi?mode=c; robots allows /Taxonomy/Utils/, crawl-delay 5). “Compiled by Andrzej (Anjay) Elzanowski and Jim Ostell at National Center for Biotechnology Information (NCBI), Bethesda, Maryland, U.S.A. Last update of the Genetic Codes: Sep. 23, 2024”. Standard Code (transl_table=1) and Vertebrate Mitochondrial Code (transl_table=2) strings saved verbatim in `research/ncbi-genetic-codes-2024.json`. Standard code: “Initiation Codon: AUG … The standard code currently allows initiation from UUG and CUG in addition to AUG.” Code 2 differences: AGA, AGG Ter (standard Arg); AUA Met (standard Ile); UGA Trp (standard Ter). Code 2 comment: “at least in humans it has now been shown that AGA and AGG sequences are not recognized as termination codons” (Temperley et al. 2010). NCBI policy (www.ncbi.nlm.nih.gov/home/about/policies/): information created by or for the US government on NLM pages is public domain.
- **IUPAC-IUB JCBN, Nomenclature and Symbolism for Amino Acids and Peptides (Recommendations 1983)**, web version by G. P. Moss (QMUL), https://iupac.qmul.ac.uk/AminoAcid/A2021.html (no robots.txt, 404). Table 5 “The One-Letter Symbols” gives one-letter, three-letter symbol and name for the 20 amino acids (plus B, U/Sec, X, Z). “Copyright IUBMB and IUPAC”: the symbols are cited as facts; prose is not quoted at length. Published: Pure Appl. Chem. 56, 595–624 (1984), doi:10.1351/pac198456050595.
