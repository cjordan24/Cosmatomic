# Phase 3 screenshot index — Physics Sandbox

Captured by `npm run test:e2e` against the production build after real interactions (running simulations, editing masses, adding bodies, toggling instruments, saving/restoring experiments, running molecular dynamics). Every test asserts **no page errors**; several assert physical readouts (energy error, semi-major axis, temperature).

| File | What it demonstrates |
|---|---|
| [`31-sandbox-inner-solar-system.png`](31-sandbox-inner-solar-system.png) | Experiment environment: Sun, Mercury–Mars and Jupiter seeded from today’s validated ephemeris (Derived), integrated with the Yoshida 4th-order symplectic integrator; orbit trails, energy-error plot (bounded, < 10⁻⁶) and angular-momentum conservation. |
| [`32-compare-heavy-jupiter.png`](32-compare-heavy-jupiter.png) | Compare environment: Jupiter’s mass ×10 (now labelled Hypothetical). White wireframes = reference JPL-element positions; the table quantifies how far each planet’s simulated orbit departs from reality. |
| [`33-trojans-lagrange.png`](33-trojans-lagrange.png) | Sun–Jupiter Lagrange points L1–L5 (CR3BP, violet markers) with Trojan bodies held at L4/L5 and a displaced Trojan librating — tadpole stability verified in tests over 20 Jupiter years. Instruments show speed, distance and escape velocities. |
| [`34-figure-eight.png`](34-figure-eight.png) | Chenciner–Montgomery figure-eight: three equal solar masses on one shared orbit (periodicity verified in tests to 10⁻³ au after one period). Hypothetical configuration. |
| [`34b-binary-added-planet.png`](34b-binary-added-planet.png) | Binary star (2 × 1 M☉, 0.5 au) with a circumbinary planet and a user-added world at 5 au (circular velocity computed about the primary, logged in the event list). |
| [`36-md-ethanol-500K.png`](36-md-ethanol-500K.png) | Molecular dynamics (velocity Verlet on VGFF-1) of ethanol, Berendsen thermostat at 500 K: atoms vibrate in real time; instantaneous/mean temperature, kinetic and strain energy, and temperature/energy traces. Labelled Simulated and qualitative. |
| [`36b-md-ethanol-nve.png`](36b-md-ethanol-nve.png) | Same molecule in the NVE ensemble: total energy fluctuates (∝ dt²) around a constant value instead of being thermostatted. |
| [`37-instruments.png`](37-instruments.png) | Virtual instruments reading the live simulation: orbital analyser (osculating a = 1.000 au, e = 0.0167 for Earth), Earth–Mars distance/relative speed/light time, velocity (cyan) and acceleration (gold) vectors, and the gravitational potential map (log Φ with 0.25-dex contours). |
| [`38-notebook.png`](38-notebook.png) | Scientific notebook: saved experiment with screenshot, solver/version, simulated time, energy error, notes, event log and data sources; JSON/CSV export; Restore. |

Every image is a real browser frame of the code in this repository.
