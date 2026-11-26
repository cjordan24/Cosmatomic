# Data sources

**Source index.** Every source (data services, papers, books, standards) is registered in `src/shared/sources/sources.ts` and listed on the website at `#/sources`. Each entry has the full citation, a DOI or official link, the institution, the licence, a short note on the authors (verified affiliations only, otherwise "not verified") and what it is used for. Records link to their entries. `tests/science/sources.test.ts` fails if a dataset manifest or a curated record has no indexed source. All DOIs were checked against Crossref (title, authors, year) and all URLs were fetched before publishing.

All datasets are produced by adapters in `scripts/ingestion/` through a shared library providing per-host rate limiting, exponential backoff on 429/5xx, an on-disk cache (`datasets/.cache/`, git-ignored), per-response and per-dataset storage budgets, and a manifest (`datasets/manifests/*.manifest.json`) recording sources, retrieval time, record count, size and SHA-256. `npm run data:validate` re-verifies every file. Adapters send a generic client name only — no personal data. All endpoints used are official documented APIs or public-domain tables; no credentials are required.

| Dataset (`datasets/…`) | Records | Source | Access | Terms |
|---|---|---|---|---|
| `atomic/elements.json` | 118 | PubChem periodic table (`/rest/pug/periodictable/JSON`) + PUG View element records | REST, 300 ms between requests (policy ≤ 5/s) | NCBI/NLM data policies; attribute PubChem |
| `atomic/nuclides.json` | 118 elements, ≈3 300 nuclides | IUPAC CIAAW isotopic composition; IAEA AMDC NUBASE masses, half-lives, decay modes — via PubChem PUG View | REST | Attribute CIAAW and IAEA AMDC; IAEA disclaimer |
| `molecular/molecules.json` | 137 | PubChem PUG REST: name→CID, properties (formula, MW, exact mass, SMILES, InChI/Key, IUPAC, XLogP3, TPSA, H-bond donors/acceptors, rotatable bonds, complexity), 3D conformer records. Interstellar-detection flags curated from McGuire (2022) ApJS 259:30 | REST | NCBI/NLM |
| *runtime* PubChem search | on demand | PubChem PUG REST called from the browser (CORS-enabled), ≤ 4 req/s, honours X-Throttling-Control, cached 30 days in IndexedDB | REST | NCBI/NLM |
| `atomic/spectra-nist.json` | 33 spectra, ≈5 000 lines | NIST Atomic Spectra Database lines (CSV CGI), 200–1000 nm vacuum, observed + Ritz wavelengths, intensities, A_ki, accuracy, level energies, configurations, terms, J | CGI, 1 request / 2 s (no robots restrictions) | US Government work (public domain); cite Kramida, Ralchenko, Reader & NIST ASD Team |
| `astronomical/planet-elements.json` | 8 | JPL SSD *Approximate Positions of the Planets*, Table 1 | HTML `<pre>` table (no API exists) | NASA/JPL public |
| `astronomical/planet-physical.json` | 10 | NASA Goddard NSSDC Planetary Fact Sheet | HTML table, path permitted by robots.txt | US Government work (public domain) |
| `astronomical/moon-physical.json` | 22 | JPL SSD Planetary Satellite Physical Parameters | HTML table | NASA/JPL public |
| `astronomical/dwarf-physical.json` | 4 | JPL Small-Body Database API (`sbdb.api?phys-par=1`) | REST | NASA/JPL public |
| `astronomical/small-body-elements.json` | 27 | JPL Horizons API — osculating elements at 2025-01-01 TDB | REST, 1 request/s | NASA/JPL public |
| `astronomical/horizons-reference-vectors.json` | 9 bodies × 5 epochs | JPL Horizons state vectors — **test ground truth only** | REST | NASA/JPL public |
| `astronomical/spacecraft-voyager.json` | 2 | JPL Horizons `-31`, `-32` vectors + trajectory section metadata parsed from the Horizons header | REST | NASA/JPL public |
| `astronomical/encounter-ephemerides.json` | 6 windows | JPL Horizons planet + major-moon vectors around each Voyager encounter | REST | NASA/JPL public |
| `chemistry/reactions.json` | 52 | **Hand-curated** stoichiometric equations, each cited: OpenStax Chemistry 2e (CC BY 4.0), Greenwood & Earnshaw, Seinfeld & Pandis, Chapman 1930, Molina & Rowland 1974, Tielens 2013, Gould & Salpeter 1963, Berg et al. *Biochemistry*. No numeric values. Written by `scripts/ingestion/curated-reactions.ts` (manifest + sha256) | — | Equations are facts; sources cited per entry |
| `chemistry/thermochemistry.json` | 167 species | **CODATA Key Values for Thermodynamics** (Cox, Wagman & Medvedev 1989; one HTML page, crawl-delay 3 s) + **NIST Chemistry WebBook** SRD 69 for 25 species absent from CODATA (CAS pages, crawl-delay 5 s, per-value literature reference stored; WebBook values often cite NIST-JANAF (Chase 1998) or Manion 2002) | HTML tables | CODATA: cite; NIST SRD: cite per value |
| `materials/crystals.json` | 10 | **Transcribed** from NBS Circular 539 Vols I, II, IV (scanned NIST PDFs, OCR text layer) + CODATA 2018 Si lattice parameter (NIST) + Abrahams & Bernstein 1971 (rutile O); positions from *International Tables* Vol. A. COD (robots.txt disallows) and AMCSD (blocks automated access) were deliberately **not** scraped | PDF text / HTML | U.S. Government works; cite |
| `materials/materials.json` | 21 | NIST-JANAF text tables (10), refractiveindex.info database YAML (9 dispersion formulas, CC0, primary paper per file), NIST WebBook fluid isobars at 101.325 kPa (6 fluids; reference EOS), IEC 60028 (IACS), Malmberg & Maryott 1956 | text / YAML / TSV | NIST SRD; CC0; cite |
| `materials/phase-diagrams.json` | 2 substances | IAPWS SR1-86(1992) + R14-08(2011) coefficients (transcribed from the release PDFs: one read as a page image, one from its text); NIST WebBook saturation tables (IAPWS-95, Span–Wagner; `SatP` query, evenly spaced in T); WebBook CO₂ phase-change page (TRC triple point, Antoine fit to Giauque & Egan 1937); Rahman 1964 LJ argon parameters | PDF / TSV / HTML | IAPWS releases free to use with citation; NIST SRD |
| `spectral/em-bands.json` | 5 conventions + 9 examples | **Transcribed by hand** from the documents: ITU-R V.431-9 Tables 1–3 (official .docx); CIE S 017:2020 e-ILV terms 17-21-002…011 (free online); ISO 21348 category table (Space Environment Technologies summary, Internet Archive copy of 2016-03-04, read as a rendered image); Rogalski & Chrzanowski 2014 Table 1 (CC BY-NC-ND). ISO 20473 **not** transcribed (iso.org blocks automated access). Examples: NIST ASD lines, IAU 2015 B3 T_eff, Fixsen 2009 CMB temperature; Lyman-α and the 511 keV line are computed at run time. Adapter `em-bands.ts` (manifest + sha256) | docx / HTML / PDF image | Cited per convention |
| `curated/curated-reference.json` | — | **Manually transcribed** (flagged in UI): IAU WGCCRE rotation (Archinal 2018/2011), IAU 2015 nominal solar values, Asplund et al. 2009 photospheric abundances (28 elements), NSSDC atmospheric compositions, NSSDC Saturn ring radii, Huber & Herzberg diatomic r_e, Hedberg et al. 1991 C₆₀ bond lengths, Cordero et al. 2008 covalent radii (connectivity inference only) | — | Cited per block |

## Software dependencies with scientific roles
| Package | Role | License |
|---|---|---|
| @rdkit/rdkit 2026.9.2 (MinimalLib WASM) | sanitisation, canonical SMILES, InChI/InChIKey in the Laboratory; vendored to `public/vendor/rdkit` at build time, loaded on demand | BSD-3-Clause |

## 3D assets
| Asset | Origin |
|---|---|
| `public/models/voyager.glb` (183 KiB, 2 281 faces) / `assets/blender/voyager.blend` | Built procedurally in Blender 4.5 by `scripts/blender/build_voyager.py` from published NASA/JPL dimensions. Original work; **illustrative** (not CAD). No third-party models or textures were downloaded. |

## Sources evaluated but not yet integrated
NIST Chemistry WebBook · RCSB PDB (proteins, Phase 2) · NASA Exoplanet Archive & Gaia (Phase 5) · NED, SDSS, DESI, Planck (Phase 7) · NASA Image and Video Library, MAST/JWST/Hubble (Phase 6) · SPICE kernels (higher-fidelity ephemerides). No API keys are used; `.env.example` documents an optional server-side `NASA_API_KEY` for future adapters.
