# Scientific relationships

Code: `src/shared/scientific-relationships/registry.ts`. UI: `src/ui/RelatedLinks.tsx`. Tests: `tests/science/fields.test.ts` (relationship section).

## Model

- **Entity:** one record per scientific thing, with a typed id `kind:local-id` (e.g. `element:1`, `spectrum:H-I`, `material:fused-silica`, `body:sun`, `field:heat-diffusion`), a label, and a route when an implemented view can open it. An entity that appears in several modes is registered once.
- **Status:** `available` (has a route) or `planned` (no route; links render as plain text with the phase that will build it). Tests enforce that every available entity has a route and every planned one has none.
- **Relationship:** a typed, directed edge `{ from, to, type, context?, source }`. Types: `participates-in`, `produces`, `consumes`, `emits`, `absorbs`, `has-spectrum`, `has-property`, `observed-with`, `located-in`, `part-of`, `drives`, `explains`. Every edge cites a Source-index id (reaction edges cite the reaction's own citation). A test checks both ends are registered and the source exists.
- **Both directions:** `RelatedLinks` renders outgoing edges ("spectrum → H I atomic line spectrum") and incoming ones ("spectrum of → Hydrogen") from the same edge, so every forward link has its reverse.

## Gate 4.7 relationships

| # | From | Edge | To (route) | Source | Shown in |
|---|---|---|---|---|---|
| 1 | `element:Z` (33 spectra, 25 elements) | has-spectrum | `spectrum:<spec>` → `#/spectral?tab=lines&spec=…` | NIST ASD | Element view ↔ atlas Lines tab |
| 2 | `body:sun` | has-spectrum | `spectrum:blackbody-5772` → `#/spectral?tab=blackbody&T=5772` | IAU 2015 B3 (nominal T_eff = 5772 K) | Sun info panel ↔ atlas Blackbody tab (at 5772 K) |
| 2b | `body:sun` | emits | `context:sunlight` | IAU 2015 B3 | Sun info panel |
| 3 | `material:<id>` (refractive-index records) | has-property (optical) | `spectrum:n-<id>` → `#/spectral?mat=<id>&lambda=5.893e-7` | the dispersion formula's primary paper | Material card ↔ atlas "In a material" |
| 3b | `material:<id>` (water, N₂, He, CO₂, Ar) | has-property (acoustic) | `wave:sound-<id>` → `#/spectral/lab?demo=traveling&medium=<id>…` | NIST WebBook fluids | Material card ↔ Wave lab medium |
| 4 | `field:plane-wave-ex` | explains | `wave:em-visible` | CODATA | Fields explorer |

Field layers are registered as `field:*` entities routed to the Fields explorer. The atlas's material selector is now held in the URL (`mat=`) so relationship 3 can deep-link to it.

The Sun's blackbody is labelled a *model*: the real solar spectrum has absorption lines and departs from a single 5772 K Planck curve.

## Phase 5 relationships

| From | Edge | To (route) | Source | Shown in |
|---|---|---|---|---|
| `stellar-class:O…K` | absorbs | `spectrum:He-II`, `He-I`, `H-I`, `Ca-II`, `Fe-II`, `Ca-I`, `Fe-I` | OpenStax Astronomy 2e §17.3 | Star panel ("typical lines"), class table, atlas Lines tab |
| `star:<seq>` (10 pc) | part-of | `stellar-class:<letter>` → `#/cosmic/stars/hr?d=classes&cls=…` | Reylé et al. 2021 (spectral type) | Star panel, class table |
| `star:<seq>` | has-spectrum | `spectrum:blackbody-<T>` → `#/spectral?tab=blackbody&T=…&star=…` | Pecaut & Mamajek 2013 (class V mean T_eff) | Star panel ↔ atlas Blackbody tab |

| `body:sun` | part-of | `stellar-class:G` (context G2) | OpenStax Astronomy 2e §17.3 | Sun panel ↔ class table |
| `body:sun` | has-property (photospheric abundance) | `element:<Z>` × 28 | Asplund et al. 2009 | Sun panel composition strip (element views keep their own Sun line; the duplicate edge is filtered there) |

Star entities are registered at run time when the 10 pc catalogue loads (`starRegistry.ts`). The atlas loads the catalogue itself when opened with `star=`.

## Phase 6 relationships

| From | Edge | To (route) | Source | Shown in |
|---|---|---|---|---|
| `star:14` (Sirius B) | has-spectrum | `spectrum:H-I` (context: Hα gravitationally redshifted by 80.65 ± 0.77 km/s) | Joyce et al. 2018 | Compact-objects panel, star panel, atlas Lines tab |

| `star:129` (Stein 2051 B) | observed-with | `context:gravitational-lensing` → `#/cosmic/lensing` | Sahu et al. 2017 | Lensing view, star panel |

| `body:sun` | located-in | `galaxy:milky-way` → `#/cosmic/galaxies?tab=mw` (context: R₀ = 8.2 kpc) | Bland-Hawthorn & Gerhard 2016 | Milky Way panel, Sun panel |
| `compact-object:sgr-a-star` | located-in | `galaxy:milky-way` (at the Galactic Centre) | EHT 2022 Paper I | Milky Way panel, compact-objects panel |

| `nebula:orion` | emits | `spectrum:H-I` (Hα, the red glow) | OpenStax Astronomy 2e §20.2 | Nebula panel ↔ atlas Lines tab |
| `nebula:ring` | emits | `spectrum:N-II`, `spectrum:O-III` | OpenStax Astronomy 2e §22.4 | Nebula panel ↔ atlas Lines tab |
| `nebula:*` (5) | located-in | `galaxy:milky-way` | ESA/Hubble, ESA/Webb image pages | Nebula panel, Milky Way panel |

Neutron stars and black holes are registered as `compact-object:<id>` (route `#/cosmic/compact?sel=<id>`). The four white dwarfs with measured masses stay `star:<seq>`, so they are not duplicated.

## Phase 7 relationships

| From | Type | To | Source | Shown in |
|---|---|---|---|---|
| `context:cosmic-expansion` | explains | `context:gravitational-lensing` (angular-diameter distances set the Einstein radius of distant lenses) | Hogg 1999 eq. 19 | Expansion view ↔ Lensing view |

| `context:distance-ladder` | explains | `context:cosmic-expansion` (measures H₀ directly, to compare with Planck’s ΛCDM inference) | Riess et al. 2022 | Distance ladder ↔ Expansion view |
| `galaxy:milky-way` | part-of | `context:distance-ladder` (Gaia EDR3 parallaxes of Milky Way Cepheids are one of the three anchors) | Riess et al. 2022 | Galaxies (Milky Way) ↔ Distance ladder |
| `context:cosmic-expansion` | explains | `context:cmb` (adiabatic expansion cools the CMB as T₀(1 + z), measured at z = 0.89–2.69) | Noterdaeme et al. 2011 | Expansion view ↔ CMB view |
| `context:cmb` | explains | `context:cosmic-expansion` (the Planck power spectrum fixes the base-ΛCDM parameters; θ∗ = r∗/D_M(z∗)) | Planck 2018 VI | CMB view ↔ Expansion view |
| `context:dark-matter` | observed-with | `context:gravitational-lensing` (Bullet Cluster: lensing peaks on the galaxies, ∼8σ from the gas) | Clowe et al. 2006 | Dark-matter view ↔ Lensing view |
| `context:dark-matter` | observed-with | `context:cmb` (Ω_c h² = 0.11933 ± 0.00091 against Ω_b h² = 0.02242 ± 0.00014 in base ΛCDM) | Planck 2018 VI | Dark-matter view ↔ CMB view |
| `context:dark-matter` | explains | `galaxy:milky-way` (M₂₀₀ = (1.1 ± 0.3) × 10¹² M☉ against M⋆ = (5 ± 1) × 10¹⁰ M☉) | Bland-Hawthorn & Gerhard 2016 | Dark-matter view ↔ Milky Way tab |
| `context:dark-matter` | part-of | `context:cosmic-expansion` (cold dark matter ≈ 84 % of Ω_m) | Planck 2018 VI | Dark-matter view ↔ Expansion view |
| `context:cmb` | emits | `wave:em-microwave` (B_ν peak at 160 GHz, 1.87 mm, in the ISO 21348 microwave category) | Fixsen et al. 1996 | CMB view ↔ Spectral atlas |

`context:cosmic-expansion` routes to `#/cosmic/universe`; `context:distance-ladder` routes to `#/cosmic/ladder` (Gate 7.2); `context:cmb` routes to `#/cosmic/cmb` (Gate 7.3); `context:dark-matter` routes to `#/cosmic/darkmatter` (Gate 7.4). The *Observable universe* scale level is now interactive and opens its Expansion history tab.

## Encyclopedia entities (Gate E.1)

`wave:em-spectrum`, `wave:em-radio`, `wave:em-microwave`, `wave:em-infrared` (new) and the existing `wave:em-visible`, `wave:em-ultraviolet`, plus `wave:em-xray` and `wave:em-gamma` (new). Each has an encyclopedia entry and routes to a typical wavelength in the Spectral atlas. No new edges: an entry describes its entity and is not a relationship.

## Earlier relationships (Gate 4.1)

Reaction → process/context (`participates-in`), e.g. net photosynthesis → `process:photosynthesis` (planned, Biologic Mode Phase 11), combustion → `context:energy-production`.

## Rules

1. No edge without a source.
2. Never route to a view that does not exist; register the entity as planned instead.
3. Do not duplicate entities across modes; extend the existing record.
4. Reverse links come from the same edge, not a second hand-written one.
