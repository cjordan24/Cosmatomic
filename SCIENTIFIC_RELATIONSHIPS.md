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

## Earlier relationships (Gate 4.1)

Reaction → process/context (`participates-in`), e.g. net photosynthesis → `process:photosynthesis` (planned, Biologic Mode Phase 11), combustion → `context:energy-production`.

## Rules

1. No edge without a source.
2. Never route to a view that does not exist; register the entity as planned instead.
3. Do not duplicate entities across modes; extend the existing record.
4. Reverse links come from the same edge, not a second hand-written one.
