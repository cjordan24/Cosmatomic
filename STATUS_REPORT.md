# Voyager Ventures — status report and index

*Kept up to date by Claude during the autonomous run. Last updated: **2026-11-28, Gate 15.5**.*

Live site: https://voyager-ventures.vercel.app — **production still serves the build from 2026-11-27** (Phase 10 + universe map + interface pass). Nothing from Phases 11–14 is deployed: you asked for no deploys until Phase 14 is finished. The deploy command is at the bottom.

---

## 1. Permissions denied or not answered (for your review)

You said: if a permission prompt gets no answer within 5 minutes, treat it as denied and use another solution. Every such case is listed here.

| When | What was asked | What happened | What I did instead |
|---|---|---|---|
| — | *none so far in this run* | — | — |

**Blocked by websites (not by you)** — sites that refuse automated access, found during research. I respected them and used other sources; nothing for you to approve, listed so you know why some content is missing:

- **PubChem** (robots.txt now disallows ClaudeBot, since 2026-10-29): the molecule data already bundled stays; no new PubChem requests; ChEBI used instead.
- book.bionumbers.org, europepmc.org, biodiversitylibrary.org, jbc.org — robots.txt disallows ClaudeBot.
- cdc.gov, niaid.nih.gov, rupress.org, photochemcad.com, nih.gov — robots.txt answered 403.
- nobelprize.org — terms of use forbid reproduction.
- data.rcsb.org/rest — disallowed; PDB files come from files.rcsb.org instead.
- Earlier phases (still in force): openstax.org (forbids AI ingestion), Wikipedia, and others listed in `KNOWN_LIMITATIONS.md`.

**Known from earlier sessions:** Claude Code's auto-mode classifier blocks `vercel deploy --prod`, so you run the deploy yourself (command below).

---

## 2. Where things stand

| Phase | Scope | Status |
|---|---|---|
| 1–10 | Foundations → Optics, Radiation & Energy (+ universe map, interface pass) | Complete, deployed |
| **11 Biologic Foundations** | Biologic mode with seven views | **Complete** (not deployed) |
| 12 Human Anatomy & Physiology | reference model, skeleton/muscle, heart/lungs, nervous system (Hodgkin–Huxley), other organ systems, organ-to-cell zoom | **Complete** (not deployed) |
| 13 Waves, Life & Imaging | vision, hearing, bioelectricity, EM–tissue, microscopy, medical imaging | **Complete** (not deployed) |
| 14 Advanced Foundations | Standard Model, quantum lab, nuclear physics, plasma, relativity, cosmology models | **Complete** (not deployed) |
| 15–19 Computing & Engineering | your brief (`COMPUTING_ENGINEERING_BRIEF.md`, saved verbatim); gate plan in `DEVELOPMENT_ROADMAP.md` | **In progress** — Phase 15 begun: Engineering mode and Gate 15.1 done |
| 20+ Meteorology & Climate | your brief (`METEOROLOGY_EXPANSION_BRIEF.md`, saved verbatim) | Queued — after Phase 19 |

**Counts (end of Phase 11):** 854 science tests (60 files), 94 browser tests (11 spec files; numbered up to 100), 49 dataset manifests, 208 Source-index entries, 84 commits in this repository.

---

## 3. Index of the program (every view and its address)

Open any address as `https://voyager-ventures.vercel.app/#/…` (Phase 11 addresses work only after the next deploy).

### Landing — `#/`
Four portals: ATOMIC, COSMIC, SPECTRAL, **BIOLOGIC** (new in Phase 11; shows the real atoms of the DNA crystal structure 1BNA).

### ATOMIC (cyan)
- `#/atomic/particles` Standard Model particles (PDG 2025) · `#/atomic/quantum` quantum lab · `#/atomic/nuclei` binding energy, chart of nuclides, U-238 series, fusion — **Phase 14**, under Subatomic ▾ (Molecules/Reactions now under Chemistry ▾, Materials/Phases under Matter ▾)
- `#/atomic` periodic table · `#/atomic/element/<Z>` atoms, orbitals, nuclei
- `#/atomic/molecules` molecule viewer · `#/atomic/reactions` reactions · `#/atomic/materials` crystals and materials · `#/atomic/phases` phase diagrams · `#/atomic/lab` molecular laboratory

### COSMIC (violet)
- `#/cosmic` solar system · `#/cosmic/map` universe map (zoom from planets to the cosmic microwave background)
- Stars: `#/cosmic/stars`, `#/cosmic/stars/hr`, `#/cosmic/stars/planets`
- Gravity: `#/cosmic/relativity`, `#/cosmic/compact` (black holes), `#/cosmic/lensing`, `#/cosmic/sandbox` (N-body)
- `#/cosmic/galaxies` · `#/cosmic/nebulae` (now under Galaxies ▾)
- **Phase 14:** `#/cosmic/plasma` plasma and the solar wind · `#/cosmic/grtests` Mercury, bending light, Gravity Probe B · `#/cosmic/models` dark matter or modified gravity (radial acceleration relation)
- Universe: `#/cosmic/universe` (expansion), `#/cosmic/ladder` (distance ladder), `#/cosmic/cmb`, `#/cosmic/darkmatter`, `#/cosmic/gw` (gravitational waves)

### SPECTRAL (amber)
- `#/spectral` electromagnetic spectrum atlas · `#/spectral/fields`
- Waves: `#/spectral/lab`, `#/spectral/acoustics`, `#/spectral/audio`, `#/spectral/roomacoustics`
- Radio: `#/spectral/antennas`, `#/spectral/rf`, `#/spectral/room` (3D comms room), `#/spectral/modulation`
- Light: `#/spectral/compare`, `#/spectral/optics`, `#/spectral/waveoptics`, `#/spectral/polarisation`, `#/spectral/spectroscopy`, `#/spectral/thermal`, `#/spectral/telescopes`, `#/spectral/atmosphere`

### BIOLOGIC (emerald) — **new in Phase 11**
| Address | What it is | Main sources |
|---|---|---|
| `#/biologic` | **Scale of life** — 24 sizes from a water molecule to an ant on one log axis, each with its quote; disagreeing sources shown side by side; size ratios | NIGMS *Inside the Cell* (page images), NIGMS, nano.gov, U.S. DOE, PDB-101 |
| `#/biologic/molecules` | **Biomolecules** — 20 amino acids (symbols, codons, 3D), nucleic-acid parts, sugars, lipids; the **genetic code** with a translator | NCBI Genetic Codes, IUPAC-IUB, NHGRI, ChEBI |
| `#/biologic/proteins` | **Structures** — 7 Protein Data Bank crystal structures in 3D (DNA, myoglobin, haemoglobin, insulin, GFP, lysozyme) | wwPDB (CC0) + the 7 original papers |
| `#/biologic/cells` | **Cells** — eukaryote vs prokaryote at one scale, clickable parts; size and surface | *Inside the Cell*, NIGMS & NHGRI glossaries |
| `#/biologic/membranes` | **Membranes** — the squid-axon membrane potential (Hodgkin & Katz 1949), reproducing their table within 1 mV; the lipid bilayer | Hodgkin & Katz 1949 (page images), NIGMS |
| `#/biologic/transport` | **Transport** — diffusion (Fick, Einstein, ICT data), osmosis (van ’t Hoff), enzyme kinetics (Michaelis–Menten) | the original papers on page images |
| `#/biologic/body` | **Human body** (Phase 12) — skeleton and ten organs in 3D from BodyParts3D (CC BY 4.0); select, hide, isolate; quoted facts and the model's sizes | BodyParts3D, NCI SEER, NHLBI, NIDDK |
| `#/biologic/movement` | **Movement** — bones (SEER) and Hill's force–velocity curve | NCI SEER, Hill 1938 |
| `#/biologic/circulation` | **Circulation & breathing** — heart, blood-pressure categories, Poiseuille's law, blood, lungs | NHLBI, NCI SEER, Poiseuille 1840 |
| `#/biologic/nerves` | **Nerves** — a live Hodgkin–Huxley action-potential simulator; conduction velocity | Hodgkin & Huxley 1952, Hursh 1939 |
| `#/biologic/systems` | **Organ systems** — kidneys, digestion, hormones, blood & lymph, skin, reproduction | NIDDK, NCI SEER, NIST SP 811 |
| `#/biologic/zoom` | **From body to molecule** — one zoom through ten powers of ten, sizes to scale | BodyParts3D, SEER, Inside the Cell |
| `#/biologic/senses` | **Senses & signals** (Phase 13) — the eye as an optical instrument, colour-sensitivity peaks, hearing and decibels, Einthoven's ECG leads | Helmholtz 1924, CVRL, Fletcher & Munson 1933, Einthoven 1912, NEI, NIDCD |
| `#/biologic/imaging` | **Imaging the body** (Phase 13) — radio waves in tissue (SAR), microscopes (light and electrons), X-rays, ultrasound, MRI, and all their wavelengths on one axis | NIST SRD 126, IFAC-CNR (Gabriel), USAF handbook, FCC, FDA, Abbe 1873, de Broglie 1930, Rayleigh 1896, NBS SP 525, CODATA |
| `#/biologic/plants` | **Plants & microbes** — photosynthesis, chlorophyll absorption maxima over sunlight; viruses to plant cells | NASA, OMLC/PhotochemCAD, NIGMS, NHGRI |

### ENGINEERING (coral) — **new in Phase 15**
| Address | What it is | Main sources |
|---|---|---|
| `#/engineering/information` | **Information** — type text to see its Unicode code points, UTF-8 bytes and Shannon entropy | Shannon 1948, The Unicode Standard |
| `#/engineering/architecture` | **Stored-program computer** — step a tiny computer through 6 × 7 = 42, laid out as von Neumann’s 1945 EDVAC report describes | von Neumann 1945 |
| `#/engineering/chips` | **Chips** — Kilby’s and Noyce’s 1959 integrated-circuit patents with their drawings; the planar process step by step | US patents 3,138,743 and 2,981,877 |
| `#/engineering/semiconductors` | **Semiconductors** — silicon’s band gap; a live p-n junction (Shockley’s 1949 equation) | Shockley 1949, TU Delft OCW |
| `#/engineering` | **Bits & logic** — a byte in binary/hex/two's complement, logic gates with truth tables, NAND universality, a 4-bit adder built from gates | Boole 1854, Shannon 1938 and 1948, NIST |

### Shared tools (all modes)
- `#/scale` universal scale navigator · `#/relations` relationship explorer (now with Biologic) · `#/notebook` scientific notebook · `#/sources` Source index (208 entries)
- Top bar: 📖 Encyclopedia · 🔗 Relationships · 📚 Sources · 📓 Notebook · ⟷ Scale · ⚙ Settings

---

## 4. What was done in this run (newest first)

- **Gate 15.5** — information and encoding: UTF-8 bytes and Shannon entropy of any text.

- **Gate 15.4** — a stored-program computer you can step through, organised as von Neumann's 1945 report describes.

- **Gate 15.3** — integrated circuits: the Kilby and Noyce patents read on the Patent Office's own page images, with their original drawings.

- **Gate 15.2** — semiconductors: silicon and a live p-n junction from Shockley's 1949 equation.

- **Phase 15 begun (your Computing & Engineering brief)** — a fifth mode, ENGINEERING, with its own landing portal (a working adder that adds today's day and month), and Gate 15.1: bits, logic gates and adders. Roadmap for Phases 15–19 written into `DEVELOPMENT_ROADMAP.md`.

- **End-of-Phase-14 browser suite: 109/109** (after updating two stale test expectations).
- **Phase 14 complete** — Gate 14.7: five new pathways linking the new views across modes (Relationships 🔗 → Pathways). Phases 11–14 are all built; **ready for you to deploy** (command in §6).

- **Gates 14.4–14.6** — plasma (NRL formulary, solar wind), tests of relativity (Einstein's 43″ for Mercury reproduced: 42.98″; Gravity Probe B), and a dark-matter vs modified-gravity comparison that reproduces a 2016 paper's sample and fit from the bundled galaxy data.

- **Gates 14.1–14.3** — particles (PDG 2025), a quantum lab that solves Schrödinger's equation live, and nuclei (binding energies of 3,556 nuclides, the U-238 series, fusion in the Sun). Findings: a sign misprint in Condon & Morse's 1929 tunnelling formula; Mott's 1930 worked example is off by nearly a factor of two. End-of-Phase-13 browser suite: **102/102**.
- **Left out:** the Kerr (spinning black hole) orbit formula — the 1972 paper could not be read in an allowed open copy, so it was not used.

- **Phase 13 complete** — Gates 13.4–13.7: imaging the body (radio waves and tissue, microscopes, X-rays, ultrasound, MRI, one wavelength chart). Findings: a 1986 US Air Force handbook's constant assumes c = 3 × 10⁸ m/s; de Broglie's “always small” relativistic term is 0.29 for a modern 300 kV microscope.

- **Gates 13.1–13.3 (senses)** — the eye, colour, hearing and the ECG in one view, from Helmholtz, Einthoven and Fletcher & Munson read on the page images. Finding: Helmholtz prints a reduced-eye radius (5.1248 mm) that his own focal lengths don't give (5.0674 mm); both shown. End-of-Phase-12 browser suite: **100/100 passed**.
- **For you to look at (licensing, no action needed now):** NIST's X-ray attenuation tables (SRD 126) are a copyrighted compilation, not public domain — Gate 13.6 will use only a small selection of values with NIST's required notice, not the full tables. If you would prefer none at all, say so and I'll remove them.

- **Phase 12 complete** — Gates 12.5–12.7: organ systems (NIDDK's two kidney filtration figures turn out 20 % apart) and the body-to-molecule zoom; a recurring µ→“M” display bug fixed at its source.

- **Gate 12.4** — a working simulation of the Nobel-winning Hodgkin–Huxley nerve model, read from the 1952 paper's own pages; it reproduces their 18·8 m/s conduction velocity.

- **Gates 12.2–12.3** — movement (Hill's muscle equation) and circulation (heart, blood pressure, Poiseuille's law). Finding: Poiseuille's printed mean coefficient (2495,224) is not the mean of his own seven values (2495.37).

- **Gate 12.1 (human body)** — a real 3D anatomical model (BodyParts3D, newly CC BY 4.0) decimated in Blender; full browser suite at the end of Phase 11: 91/94 at first → fixed (a phone top-bar overflow with four modes; two stale tests) → 94/94.

- **Phase 11 complete** — 7 gates, one commit each, all pushed: 11.1 `0487514` · 11.2 `4e52562` · 11.3 `b9ef5e5` · 11.4 `d9f0b3b` · 11.5 `081aecf` · 11.6 `f4f7b6c` · 11.7 `d4050c5` · fix `0e3f379`.
- **One mistake, fixed:** the 11.7 commit went in with three failing tests; one exposed a real bug (Biologic items shown as “Spectral” in the relationship explorer). Fixed in `0e3f379`; tests are now checked before every commit.
- **Your two briefs saved verbatim** and placed in the roadmap: `COMPUTING_ENGINEERING_BRIEF.md` (Phases 15–19), `METEOROLOGY_EXPANSION_BRIEF.md` (20+).
- **Notable findings** (all documented in `BUILD_LOG.md`): Hodgkin & Katz's 1949 table reproduced within 1 mV for 14.6–21.5 °C; Einstein's 1905 Brownian-motion example reproduced (0.8 µm in 1 s); van ’t Hoff's printed gas constant (845.05) differs from his own numbers (845.24); the haemoglobin crystal structure's size (6.6 × 5.7 × 5.4 nm) matches NIH's “roughly 5.5 nm”.
- **Left out for lack of an open source** (details in `KNOWN_LIMITATIONS.md`): ATP yield per glucose; glycolysis and respiration views; mammalian ion concentrations; full chlorophyll spectra (no licence stated).

---

## 5. Documents in this folder

| File | What it holds |
|---|---|
| `STATUS_REPORT.md` | this page |
| `HANDOFF_PHASES_11_14.md` | the working handoff for the current run (progress log at the top) |
| `DEVELOPMENT_ROADMAP.md` | every phase and gate with status |
| `BUILD_LOG.md` | one entry per gate: what was built, data, findings, tests |
| `SCIENTIFIC_MODELS.md` | every model and equation with its source and validation (§1–54) |
| `KNOWN_LIMITATIONS.md` | what each view does not do, and what was left out and why |
| `SCIENTIFIC_RELATIONSHIPS.md` | the cross-mode knowledge graph |
| `BIOLOGIC_MODE_SPEC.md`, `SPECTRAL_MODE_SPEC.md`, `FIELDS_ARCHITECTURE.md`, `ARCHITECTURE.md` | design specs |
| `DATA_SOURCES.md` | data services |
| `COMPUTING_ENGINEERING_BRIEF.md`, `METEOROLOGY_EXPANSION_BRIEF.md` | your queued briefs, verbatim |
| `research/SOURCE_NOTES_*.md` | verbatim research notes behind each phase |
| `screenshots/phase-NN/INDEX.md` | screenshots of every view, with captions |

---

## 6. When you are back

1. Review section 1 (denied permissions) — currently empty.
2. Nothing needs deploying until Phase 14 is complete. When it is, the deploy command is:
   `! export PATH=~/.local/node/bin:$PATH && cd "/Users/chrisjordan/Desktop/Voyager Ventures" && npx vercel deploy --prod --yes --project voyager-ventures`
