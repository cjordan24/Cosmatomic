# Handoff — end of Phase 26 (2026-11-28)

## ▶ RESUME HERE

**State:** Phases 11–26 are complete, committed and pushed to `main`. The Meteorology & Climate brief (METEOROLOGY_EXPANSION_BRIEF.md, phases A–G → our Phases 20–26) is finished. **Nothing deployed since Phase 10 / the universe-map pass** — the user runs the deploy:

```
! export PATH=~/.local/node/bin:$PATH && cd "/Users/chrisjordan/Desktop/Voyager Ventures" && npx vercel deploy --prod --yes --project voyager-ventures
```

Last full browser run: 136/136 at the start of Phase 26 (after Phase 25); Phase 26 tests 143–144 and Phases 23–25 re-run after the menu change: all pass. Science: 1,177 tests. After deploying, run the live suite against production as in earlier phases.

**Next:** no queued brief remains. Ask the user what comes next (deployment check, another brief, or the open items below).

## Built in this run
| Gate | Route | Content |
|---|---|---|
| 24.1 | `#/meteorology/human` | GCB 2025 carbon budget, EDGAR 2026 sectors (shares derived), methane, aviation ERF, NREL life-cycle + grid mix, cement calcination, waste heat vs forcing, EPA heat islands, USGS water, WMO 2026 ozone, CDR, SRM |
| 24.2 | `#/meteorology/future` | kinds of statement, NCA5 warming levels, 2 °C timing, Sweet 2022 sea-level scenarios + exceedance, ocean/ice/permafrost, ECS ranges, tipping elements |
| 25.1–25.2 | `#/meteorology/sandbox` | planet builder (NSSDCA/JPL presets, enforced dependencies, gravity override), grey layers, insolation by tilt, rotation regimes, region lab (rain shadow, ground cover, comfort, cyclone checklist), guided experiments, save/compare |
| 26 | `#/meteorology/validation` | 30 live reference checks; citation audit; phone ☰ menu for Meteorology; overflow test; Human view lighter |

## Open items / notes
- Source findings recorded: NSSDCA Pluto black-body 37.5 vs 32.2 K; NSSDCA Titan 0.22 is geometric albedo (Bond 0.265 used, Creecy 2021); NCA5 gives two "likely" ECS ranges; NSSDCA Jupiter gravity includes rotation.
- Gaps (no allowed source): global temperatures by scenario for 2030/2050, CMIP6 ocean pH, DAC energy per tonne, Emanuel potential intensity, optical-depth greenhouse form.
- Penn State albedo table is CC BY-NC-SA (non-commercial).
- `tests/science/sandbox.test.ts` is the Phase 3 N-body suite; the meteorology sandbox tests are `env-sandbox.test.ts`.
- Research rules for this run: `/tmp/vv-research/p24/RULES.md` (may be cleared); notes in `research/SOURCE_NOTES_PHASE24A/B.md`, `25A.md`.

## Conventions (unchanged)
See HANDOFF_PHASE23.md § Conventions. Meteorology menus now come from `src/ui/navItems.ts` (`METEOROLOGY_GROUPS`, `METEOROLOGY_CHIPS`) for both desktop and phone.
