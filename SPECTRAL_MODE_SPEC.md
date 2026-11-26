# Spectral Mode specification

Theme: amber (`.mode-spectral`). Tagline: *waves, frequencies, radiation and energy*. Landing portal: live plane-wave scene (`planeE`/`planeB`), "ENTER →" to `#/spectral`.

## Routes

| Route | View | Gate |
|---|---|---|
| `#/spectral?lambda=<m>&tab=spectrum\|wave\|blackbody\|lines&pol=&T=&spec=&mat=` | Electromagnetic atlas (`src/modes/spectral/atlas`) | 4.6 (+ `mat` in 4.7) |
| `#/spectral/lab?demo=…&medium=…` | Wave laboratory (`src/modes/spectral/laboratory`) | 4.5 |
| `#/spectral/fields?frame=lab\|system&layers=…` | Fields explorer (`src/modes/spectral/fields`) | 4.7 |

TopBar chips: Atlas · Wave lab · Fields.

## Atlas

- The URL holds the state. `lambda` (vacuum wavelength, m) is the single source of truth; f = c/λ and E = hf follow from exact SI constants.
- Input by frequency, wavelength or photon energy, with unit choice; log slider over 1 fm–100 km.
- Band names under each *named* convention, never one "true" definition: ITU-R V.431-9 (radio), CIE S 017:2020 (UV-A/B/C, IR-A/B/C, visible has no precise limits), ISO 21348 (via the SET summary table), detector IR scheme (Rogalski & Chrzanowski 2014). ISO 20473 is shown as *not available* (its text could not be consulted).
- Visible colours are Illustrative.
- Plane-wave tab: 3D E ⊥ B ⊥ k, |B| = |E|/c, linear/circular/elliptical polarisation with CIE handedness, intensity ½cε₀E₀².
- Blackbody tab: Planck B_λ and B_ν, Wien peaks (λ and ν forms differ), σ derived from h, c, k. At 5772 K it links back to the Sun.
- Lines tab: NIST ASD lines for 33 spectra; links back to the element.
- Right panel: photon quantities, band name by convention, and n(λ), λ/n and c/n in a material with a sourced dispersion formula (blank outside its range). Links back to the material card.

## Wave laboratory

Nine demonstrations on the shared wave engine (`src/core/physics/waves`), media with sourced speeds (string, ideal-gas air, NIST fluids at 1 atm, vacuum = no sound). Each medium links back to its material card.

## Fields explorer

See FIELDS_ARCHITECTURE.md.

## Cross-mode links

See SCIENTIFIC_RELATIONSHIPS.md: Element ↔ atomic spectrum, Sun ↔ Planck model, Material ↔ optical/acoustic properties.

## Not yet built (later phases)

Absorption/emission by matter beyond line lists (Phase 10 thermal-radiation lab), the greenhouse effect model, real solar spectral irradiance data, magnetic fields of currents, antennas and radiation patterns, X-ray/gamma interactions with matter.
