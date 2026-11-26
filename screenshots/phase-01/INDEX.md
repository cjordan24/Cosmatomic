# Phase 1 screenshot index

Captured by `npm run test:e2e` (Playwright, Chromium, SwiftShader WebGL) against the **production build**, after real interactions. Each test also asserts there were **no page errors**. Desktop 1440×900; mobile 390×844 @2×. The Blender render was produced headlessly by Blender 4.5.17.

| File | What it demonstrates |
|---|---|
| [`01-landing.png`](01-landing.png) | Landing page: ATOMIC portal (sampled hydrogen 3d_z² density) and COSMIC portal (planets at today’s JPL heliocentric longitudes). |
| [`02-atomic-main.png`](02-atomic-main.png) | Atomic Mode main environment after clicking the ATOMIC portal: periodic table of all 118 elements coloured by family. |
| [`03-periodic-table-electronegativity.png`](03-periodic-table-electronegativity.png) | Full periodic table recoloured by Pauling electronegativity (continuous legend with units; hatched tiles = no data). Hover card on fluorine. |
| [`03b-periodic-table-radioactivity.png`](03b-periodic-table-radioactivity.png) | Periodic table coloured by radioactivity: Tc, Pm and Z ≥ 83 have no stable isotope (NUBASE). |
| [`04-hydrogen.png`](04-hydrogen.png) | Hydrogen: analytic 1s orbital after an excite (1s→2s, absorption) then de-excite (2→1) — Lyman-α photon at 121.57 nm reported; measured NIST H I spectrum with a Rydberg-model-vs-NIST residual table. |
| [`05-carbon.png`](05-carbon.png) | Carbon-12: probability cloud of all six electrons (hydrogenic orbitals + Slater Z_eff, labelled approximate) with Hund’s-rule orbital-box diagram. |
| [`06-iron.png`](06-iron.png) | Iron ionised to Fe²⁺ (4s electrons removed first → [Ar]3d⁶): educational shell model (explicitly labelled non-physical trajectories) and Bohr diagram from the same data. |
| [`06b-iron-nucleus.png`](06b-iron-nucleus.png) | Iron-56 schematic nucleus (26 p, 30 n, R ≈ 1.2 fm·A^⅓ = 4.59 fm) with composition and binding-energy diagram. |
| [`07-uranium.png`](07-uranium.png) | Heavy element: uranium-235 selected from the NUBASE isotope table (natural abundance chart, half-lives, decay modes); 92-electron probability cloud with f-subshell (magenta). |
| [`07b-oganesson.png`](07b-oganesson.png) | Oganesson (Z = 118): no stable isotope — longest-lived nuclide ²⁹⁴Og chosen automatically and flagged; predicted configuration flagged. |
| [`08-orbital-3dz2-cross-section.png`](08-orbital-3dz2-cross-section.png) | Hydrogen 3d_z² orbital (n=3, l=2, m=0), analytic ψ, cross-section through the xz-plane; cyan/pink = wavefunction phase. |
| [`08b-orbital-4f.png`](08b-orbital-4f.png) | Hydrogen 4f_xz² orbital (n=4, l=3, m=1) — f-orbital support. |
| [`09-diagram-energy-levels-oxygen.png`](09-diagram-energy-levels-oxygen.png) | Oxygen energy-level diagram: Slater-estimated subshell energies explicitly labelled approximate; shell model alongside. |
| [`09b-diagram-lewis-oxygen.png`](09b-diagram-lewis-oxygen.png) | Lewis dot structure for the oxide ion O²⁻ (bracketed, 8 valence electrons) derived from the same configuration data. |
| [`10-molecule-caffeine.png`](10-molecule-caffeine.png) | Molecular viewer: caffeine (PubChem CID 2519, MMFF94s computed conformer, labelled), ball-and-stick with Kekulé double bonds; clicked atoms show measured distance. |
| [`10b-molecule-benzene-spacefill.png`](10b-molecule-benzene-spacefill.png) | Benzene in space-filling (van der Waals radii) mode. |
| [`11-cosmic-main.png`](11-cosmic-main.png) | Cosmic Mode main environment after clicking the COSMIC portal: solar-system overview at today’s date, true scale, labels and orbits. |
| [`12-full-solar-system.png`](12-full-solar-system.png) | Full solar system zoomed out to ~94 au (deep link ?dist=1.4e10 km): planets, Pluto, dwarf planets (Ceres, Eris, Haumea, Makemake) and the Voyager 1 & 2 trajectories (gold) from JPL Horizons. |
| [`13-earth-moon.png`](13-earth-moon.png) | Earth and Moon at TRUE scale from 1.1 million km: Moon position from truncated ELP-2000/82 (validated ≤ 48″ vs DE440), orbit path sampled over one sidereal month. |
| [`13b-earth-moon-exaggerated.png`](13b-earth-moon-exaggerated.png) | Earth and Moon with illustrative ×10 radii (Moon distance unchanged — no expansion needed for this system); the on-screen banner discloses the scaling; physics and panel values are unaffected. |
| [`14-saturn-rings.png`](14-saturn-rings.png) | Saturn at true scale: D/C/B/A/F rings (NSSDC radii) in Saturn’s equatorial plane from the IAU pole; illustrative banding; sunlit hemisphere follows the real Sun direction. |
| [`15-info-panel-earth.png`](15-info-panel-earth.png) | Object information panel (Earth): NSSDC physical data, atmospheric composition with clickable species, modelled position, distance and light-time tool, provenance list. |
| [`15b-cross-mode-o2.png`](15b-cross-mode-o2.png) | Cross-mode link: clicking O₂ in Earth’s atmosphere opens the oxygen molecule in Atomic mode (shared PubChem identifier). |
| [`16-timeline.png`](16-timeline.png) | Simulation timeline after playing at 1 month/s then pausing (2026-11-26 07:12 UTC → 2026-12-25 14:09 UTC), stepping one day, with bookmarks open. Range clamped to JPL Table-1 validity 1800–2050. |
| [`17-universal-search.png`](17-universal-search.png) | Universal search across elements, molecules and celestial bodies (“tita” → Titanium, Titan, Titania). |
| [`17b-scale-navigator.png`](17b-scale-navigator.png) | Logarithmic scale navigator (10⁻¹⁶ m → 10²⁷ m): interactive, educational and planned scales labelled honestly. |
| [`18-mobile-landing.png`](18-mobile-landing.png) | Mobile layout (390×844): stacked ATOMIC / COSMIC portals. |
| [`18b-mobile-element.png`](18b-mobile-element.png) | Mobile layout: carbon 2p_z orbital with bottom sheet information panel. |
| [`18c-mobile-cosmic.png`](18c-mobile-cosmic.png) | Mobile layout: Cosmic mode with compact timeline. |
| [`19-blender-voyager-render.png`](19-blender-voyager-render.png) | Blender 4.5 (Eevee) preview render of the procedurally built Voyager model (scripts/blender/build_voyager.py), from published NASA/JPL dimensions. Illustrative. |
| [`20-voyager-1-model.png`](20-voyager-1-model.png) | Voyager 1 (Blender-built model from NASA/JPL dimensions, true scale — 3.66 m antenna) at today’s JPL-predicted position ~170 au from the Sun; high-gain antenna pointed at Earth; distance & light time in the info panel. |
| [`21-voyager-2-neptune-flyby.png`](21-voyager-2-neptune-flyby.png) | Voyager 2 Neptune flyby, 1989-08-25 03:50 UTC (minutes before closest approach): Neptune and Triton positions switch to JPL Horizons encounter ephemerides (badge in panel); gold line = Voyager 2’s Horizons trajectory. |
| [`21b-voyager-2-closeup-at-neptune.png`](21b-voyager-2-closeup-at-neptune.png) | Close-up of Voyager 2 during the Neptune encounter; info panel flags the Horizons patched-conic (rough-accuracy) arc for this date. |

Every image is a real browser frame (or Blender render) of the code in this repository — no mock-ups.
