# Data sources

All datasets are produced by adapters in `scripts/ingestion/` through a shared library providing per-host rate limiting, exponential backoff on 429/5xx, an on-disk cache (`datasets/.cache/`, git-ignored), per-response and per-dataset storage budgets, and a manifest (`datasets/manifests/*.manifest.json`) recording sources, retrieval time, record count, size and SHA-256. `npm run data:validate` re-verifies every file. Adapters send a generic client name only — no personal data. All endpoints used are official documented APIs or public-domain tables; no credentials are required.

| Dataset (`datasets/…`) | Records | Source | Access | Terms |
|---|---|---|---|---|
| `atomic/elements.json` | 118 | PubChem periodic table (`/rest/pug/periodictable/JSON`) + PUG View element records | REST, 300 ms between requests (policy ≤ 5/s) | NCBI/NLM data policies; attribute PubChem |
| `atomic/nuclides.json` | 118 elements, ≈3 300 nuclides | IUPAC CIAAW isotopic composition; IAEA AMDC NUBASE masses, half-lives, decay modes — via PubChem PUG View | REST | Attribute CIAAW and IAEA AMDC; IAEA disclaimer |
| `molecular/molecules.json` | 137 | PubChem PUG REST: name→CID, properties (formula, MW, exact mass, SMILES, InChI/Key, IUPAC, XLogP3, TPSA, H-bond donors/acceptors, rotatable bonds, complexity), 3D conformer records. Interstellar-detection flags curated from McGuire (2022) ApJS 259:30 | REST | NCBI/NLM |
| *runtime* PubChem search | on demand | PubChem PUG REST called from the browser (CORS-enabled), ≤ 4 req/s, honours X-Throttling-Control, cached 30 days in IndexedDB | REST | NCBI/NLM |
| `astronomical/planet-elements.json` | 8 | JPL SSD *Approximate Positions of the Planets*, Table 1 | HTML `<pre>` table (no API exists) | NASA/JPL public |
| `astronomical/planet-physical.json` | 10 | NASA Goddard NSSDC Planetary Fact Sheet | HTML table, path permitted by robots.txt | US Government work (public domain) |
| `astronomical/moon-physical.json` | 22 | JPL SSD Planetary Satellite Physical Parameters | HTML table | NASA/JPL public |
| `astronomical/dwarf-physical.json` | 4 | JPL Small-Body Database API (`sbdb.api?phys-par=1`) | REST | NASA/JPL public |
| `astronomical/small-body-elements.json` | 27 | JPL Horizons API — osculating elements at 2025-01-01 TDB | REST, 1 request/s | NASA/JPL public |
| `astronomical/horizons-reference-vectors.json` | 9 bodies × 5 epochs | JPL Horizons state vectors — **test ground truth only** | REST | NASA/JPL public |
| `astronomical/spacecraft-voyager.json` | 2 | JPL Horizons `-31`, `-32` vectors + trajectory section metadata parsed from the Horizons header | REST | NASA/JPL public |
| `astronomical/encounter-ephemerides.json` | 6 windows | JPL Horizons planet + major-moon vectors around each Voyager encounter | REST | NASA/JPL public |
| `curated/curated-reference.json` | — | **Manually transcribed** (flagged in UI): IAU WGCCRE rotation (Archinal 2018/2011), IAU 2015 nominal solar values, Asplund et al. 2009 photospheric abundances (28 elements), NSSDC atmospheric compositions, NSSDC Saturn ring radii, Huber & Herzberg diatomic r_e, Hedberg et al. 1991 C₆₀ bond lengths, Cordero et al. 2008 covalent radii (connectivity inference only) | — | Cited per block |

## 3D assets
| Asset | Origin |
|---|---|
| `public/models/voyager.glb` (183 KiB, 2 281 faces) / `assets/blender/voyager.blend` | Built procedurally in Blender 4.5 by `scripts/blender/build_voyager.py` from published NASA/JPL dimensions. Original work; **illustrative** (not CAD). No third-party models or textures were downloaded. |

## Sources evaluated but not yet integrated
NIST Atomic Spectra Database (spectral lines, Phase 2/8) · NIST Chemistry WebBook · RCSB PDB (proteins, Phase 2) · NASA Exoplanet Archive & Gaia (Phase 5) · NED, SDSS, DESI, Planck (Phase 7) · NASA Image and Video Library, MAST/JWST/Hubble (Phase 6) · SPICE kernels (higher-fidelity ephemerides). No API keys are used; `.env.example` documents an optional server-side `NASA_API_KEY` for future adapters.
