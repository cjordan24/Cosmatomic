# Biologic Mode specification (planned, Phase 11–12)

Status: **being built (Phase 11, from 2026-11-28).** Gate 11.1 made the mode live: route `#/biologic`, emerald accent (`--accent: #5cf2a6`), a BIOLOGIC button in the mode switch and a Biologic chip row, and the landing portal below. The portal is titled **BIOLOGIC** (not CELLULAR) so it matches the mode switch and the roadmap; the earlier placeholder name is kept in this history.

## Landing portal (Gate 4.7 placeholder, live since Gate 11.1)

Since Gate 11.1 the portal is a live button (“Enter Biologic mode”) showing the 486 atoms of the B-DNA dodecamer 1BNA (Drew et al. 1981; PDB, CC0) coloured by element and turning about the helix axis; tests 01, 18, 50 and 53 were updated. The text below describes the placeholder as it was.

The landing page (`src/modes/landing/Landing.tsx`) has four portals. The fourth, **CELLULAR**, exists from Gate 4.7 as a disabled placeholder:

- same card size and grid position style as ATOMIC, COSMIC and SPECTRAL; placed last (bottom-right on desktop, last in the mobile stack);
- greyed out (`grayscale`, reduced opacity), no hover lift, `cursor: default`;
- title "CELLULAR" with **"Coming soon"** directly beneath it;
- a non-interactive `<div class="portal cellular disabled" role="group" aria-disabled="true" aria-label="Cellular mode, coming soon">`: not a button or link, no route, no "ENTER →", no transition, no scene;
- there is no `#/cellular` route and no TopBar mode yet;
- e2e test 50 checks that it is not a button or link and that clicking it leaves the URL unchanged.

It stays greyed out until Biologic Mode is built (Phase 11). At that point it becomes a live portal like the others: live scene, tagline, ENTER, transition, route, e2e test and screenshot. Every future environment must also get a matching intro portal.

## Already registered (as planned entities)

`process:photosynthesis`, `process:cellular-respiration`, `process:glycolysis` and `structure:mitochondrion` (Phase 11); `process:muscle-contraction` and `process:blood-co2-transport` (Phase 12). Curated reactions already point to them. They render as plain text with "planned" until their views exist (SCIENTIFIC_RELATIONSHIPS.md).

## Scope sketch (to be specified at the start of Phase 11)

- Cell structures at measured scales (organelle sizes with sources), linked to the molecule viewer for their constituent molecules (e.g. glucose, `pubchem-5793`).
- Metabolic pathways as networks of the curated reactions, with stoichiometry from the Phase 4 conservation engine and energetics from Gate 4.2 thermochemistry.
- Same rules as every mode: accredited sources in the Source Index, provenance classes on every value, explicit validity limits, no invented biology. Captions on the portal or in the mode need Source-index entries.
