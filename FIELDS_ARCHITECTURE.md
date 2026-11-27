# FIELDS architecture

Gate 4.7 adds one interface for every physical field Voyager draws. Code: `src/core/fields/fields.ts`. Views: the Fields explorer (`#/spectral/fields`) and the Cosmic sandbox's potential map (`src/modes/cosmic/sandbox/instruments.tsx`). Tests: `tests/science/fields.test.ts`.

## The layer interface

```ts
interface FieldLayer<Ctx> {
  id, label            // e.g. 'coulomb-potential'
  quantity, symbol, units   // what is sampled, in SI
  kind: 'scalar' | 'vector'
  frame: Frame         // coordinate frame: id, unit (m | au), metres per unit, description
  resolution: number   // default samples per side
  sources: string[]    // Source-index ids
  transform: 'linear' | 'log10-magnitude' | 'symlog'   // display mapping only
  fidelity: 'exact-analytic' | 'analytic-idealised' | 'numerical' | 'illustrative'
  provenance: ProvenanceClass
  validity: string[]   // shown next to the layer
  sample(ctx, x, y): number          // SI value at a frame point (metres)
  vector?(ctx, x, y): [number, number]
}
```

- A layer is a *pure function* of a context object (`Ctx`). The view owns the context (charges, bodies, time, medium); the layer owns the physics.
- `sampleGrid(layer, ctx, extent, n)` samples cell centres (row 0 = top). `normalise(transform, v, min, max)` maps to [0, 1] for colour. Transforms never change values shown as numbers: readouts always call `sample()` directly.
- Views must not re-implement field formulas. The sandbox used to compute Φ itself; it now calls `GRAVITY_LAYER.sample` (a test checks that the old km-unit formula and the SI layer agree to 1e-12, so the contour levels did not move).

## Layers (Gate 4.7)

| id | quantity | frame | fidelity | provenance | sources |
|---|---|---|---|---|---|
| `gravity-potential` | Φ = −Σ G mᵢ / √(r² + ε²), J/kg (vector: g) | planetary-system plane (au) | exact analytic | Derived | CODATA G |
| `coulomb-potential` | V = Σ qᵢ / (4πε₀ r), V (vector: E = −∇V) | laboratory plane (m) | exact analytic | Derived | CODATA ε₀; Ellingson Vol. 1 §5.1 |
| `plane-wave-ex` | Eₓ of the vacuum plane wave (`em.ts` `planeE`), V/m | laboratory plane (m) | exact analytic | Derived | CODATA c; CIE S 017 |
| `heat-diffusion` | T = T₀ + Q/(ρcₚ(4παt)^{3/2}) · e^{−r²/4αt}, K | laboratory plane (m) | analytic, idealised | Simulated | NIST WebBook fluids; Carslaw & Jaeger (1959) |

User inputs (charges, E₀, λ, Q, t) are hypothetical set-ups. The physics that turns them into fields uses only CODATA constants and, for heat, k, ρ and cₚ interpolated from the NIST WebBook 1 atm isobar at T₀ (α = k/ρcₚ; water at 298.15 K gives 1.455 × 10⁻⁷ m²/s). Materials without a fluid table, or T₀ outside it, return `null`: unknown, never extrapolated.

## Frames

Layers declare their frame; the explorer draws only layers of the selected frame and lists the others as disabled ("switch frame to draw it"). Mixing frames on one slice would put, say, an au-scale potential under a centimetre-scale dipole, which is meaningless.

## UI

- Per-layer toggle (held in the URL as `layers=`), opacity slider, and the layer's own inputs.
- Colour legend per layer with its transform and min/max in SI units.
- Probe/cursor readout of every enabled layer, plus |E| for Coulomb and the medium's thermal properties for heat.
- A metadata block per layer printing every interface field, its validity list, sources, provenance badge and registry links.
- Nothing animates; grids are recomputed only when an input changes (cheap on SwiftShader).

## Verification (tests/science/fields.test.ts)

Interface completeness and source coverage; k = 1/(4πε₀); E = −∇V by central differences; Gauss's law flux = q/ε₀; Φ = −GM/r and |g| = GM/r²; sandbox formula equivalence; plane-wave spatial and temporal period; heat-kernel energy conservation (∫ρcₚΔT dV = Q to 1e-6 at three times) and ∂T/∂t = α∇²T by finite differences; water α within 1.43–1.48 × 10⁻⁷ m²/s.

## Adding a layer

1. Add a `FieldLayer` in `src/core/fields/` with sources registered in the Source Index.
2. Add science tests that check the field against an independent property (a conservation law, a PDE residual or a known value).
3. Register a `field:<id>` entity in the relationship registry and add it to the explorer's `LAYERS` table (or to the view that owns its frame).

Planned layers (later phases): magnetic field of currents (Phase 10), stellar/planetary magnetic dipoles, numerical heat conduction with convection, density/temperature slices of nebulae (Phase 6).
