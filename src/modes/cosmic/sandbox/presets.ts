/**
 * Initial conditions for the sandbox. "Real" presets start from the validated ephemeris at a
 * chosen date (positions from the Explore models; velocities by central differences of the same
 * models), then move to the barycentric frame. Other presets are textbook configurations and are
 * labelled Hypothetical.
 */
import { heliocentric, planetHeliocentric, MOON_EARTH_MASS_RATIO } from '../solar-system/ephemeris';
import { getBody } from '../solar-system/bodies';
import { G_KM, toBarycentric, type SBody, type SimState } from './nbody';

export interface Preset { id: string; name: string; description: string; provenance: 'derived' | 'hypothetical'; build: (jd: number) => SimState }

const SUN_MASS = getBody('sun')!.massKg!;
/**
 * Bodies from the Explore ephemerides. When Earth is requested WITHOUT the Moon, the Earth–Moon
 * barycentre (with the combined mass) is used instead: Earth's own position/velocity contains its
 * monthly wobble about the barycentre (±4 670 km, ±12.5 m/s), which is wrong for a point mass
 * orbiting alone.
 */
function fromEphemeris(ids: string[], jd: number): SBody[] {
  const h = 0.01; // days
  const withMoon = ids.includes('moon');
  return toBarycentric(ids.map((id) => {
    const b = getBody(id)!;
    const emb = id === 'earth' && !withMoon;
    const pos = (t: number) => (emb ? planetHeliocentric('earth-moon-barycenter', t) : heliocentric(id, t));
    const p = pos(jd), pp = pos(jd + h), pm = pos(jd - h);
    return {
      id, name: emb ? 'Earth (Earth–Moon barycentre)' : b.name, mass: (b.massKg ?? 0) * (emb ? 1 + MOON_EARTH_MASS_RATIO : 1), radius: b.radiusKm ?? 100, color: b.color,
      x: [...p], v: [0, 1, 2].map((k) => (pp[k] - pm[k]) / (2 * h * 86400)),
    };
  }));
}
const state = (bodies: SBody[]): SimState => ({ t: 0, bodies, dissipated: 0, events: [] });
const circularV = (M: number, r: number) => Math.sqrt((G_KM * M) / r);
const AU = 149_597_870.7;

export const PRESETS: Preset[] = [
  { id: 'solar-system', name: 'Sun + 8 planets (from today’s ephemeris)', provenance: 'derived', description: 'Real positions and velocities derived from the validated Explore ephemerides at the current date, integrated with Newtonian gravity.',
    build: (jd) => state(fromEphemeris(['sun', 'mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'], jd)) },
  { id: 'inner', name: 'Inner solar system + Jupiter', provenance: 'derived', description: 'Sun, Mercury–Mars and Jupiter from the ephemeris — fast enough to watch Jupiter’s perturbations.',
    build: (jd) => state(fromEphemeris(['sun', 'mercury', 'venus', 'earth', 'mars', 'jupiter'], jd)) },
  { id: 'earth-moon', name: 'Sun–Earth–Moon', provenance: 'derived', description: 'The Moon’s orbit under solar perturbation (from the ELP-based Explore model at the current date).',
    build: (jd) => state(fromEphemeris(['sun', 'earth', 'moon'], jd)) },
  { id: 'binary', name: 'Binary star with a circumbinary planet', provenance: 'hypothetical', description: 'Two 1 M☉ stars on a 0.5 au circular orbit and an Earth-mass planet at 3 au (a stable “Tatooine” configuration). Hypothetical.',
    build: () => {
      const m = SUN_MASS, a = 0.5 * AU, vs = circularV(2 * m, a) / 2;
      const vp = circularV(2 * m, 3 * AU);
      return state(toBarycentric([
        { id: 'a', name: 'Star A', mass: m, radius: 696_000, color: '#ffd27a', x: [-a / 2, 0, 0], v: [0, -vs, 0] },
        { id: 'b', name: 'Star B', mass: m, radius: 696_000, color: '#ffb36b', x: [a / 2, 0, 0], v: [0, vs, 0] },
        { id: 'p', name: 'Planet', mass: 5.97e24, radius: 6371, color: '#4f8fe6', x: [3 * AU, 0, 0], v: [0, vp, 0] },
      ]));
    } },
  { id: 'trojans', name: 'Sun–Jupiter with Trojan test bodies at L4/L5', provenance: 'hypothetical', description: 'Massless-like asteroids placed exactly at Jupiter’s L4 and L5 points stay in tadpole orbits; one slightly displaced body librates.',
    build: () => {
      const MJ = 1.898e27, a = 5.2 * AU, w = Math.sqrt((G_KM * (SUN_MASS + MJ)) / a ** 3);
      const mu = MJ / (SUN_MASS + MJ);
      const bodies: SBody[] = [
        { id: 'sun', name: 'Sun', mass: SUN_MASS, radius: 696_000, color: '#ffd27a', x: [-mu * a, 0, 0], v: [0, -mu * a * w, 0] },
        { id: 'jup', name: 'Jupiter', mass: MJ, radius: 71_492, color: '#d8b48a', x: [(1 - mu) * a, 0, 0], v: [0, (1 - mu) * a * w, 0] },
      ];
      const tro = (name: string, ang: number, scale = 1): SBody => {
        const x = [(0.5 - mu) * a * scale, Math.sin(ang) * a * scale, 0];
        return { id: name, name, mass: 1e15, radius: 50, color: '#a7a29a', x, v: [-w * x[1], w * x[0], 0] };
      };
      bodies.push(tro('L4 Trojan', Math.PI / 3), tro('L5 Trojan', -Math.PI / 3), tro('Librating Trojan', Math.PI / 3, 1.02));
      return state(bodies);
    } },
  { id: 'figure-eight', name: 'Three-body figure-eight choreography', provenance: 'hypothetical', description: 'The Chenciner–Montgomery (2000) periodic solution: three equal masses chasing each other on a figure-eight. Sensitive to perturbation.',
    build: () => {
      // dimensionless ICs (G = m = 1) scaled to 1 M☉ and 1 au
      const L = AU, M = SUN_MASS, V = Math.sqrt((G_KM * M) / L);
      const p1 = [0.97000436, -0.24308753], v3 = [-0.93240737, -0.86473146];
      const mk = (id: string, x: number[], v: number[], color: string): SBody => ({ id, name: id, mass: M, radius: 696_000, color, x: [x[0] * L, x[1] * L, 0], v: [v[0] * V, v[1] * V, 0] });
      return state([mk('Star 1', p1, [-v3[0] / 2, -v3[1] / 2], '#ffd27a'), mk('Star 2', [-p1[0], -p1[1]], [-v3[0] / 2, -v3[1] / 2], '#7df9ff'), mk('Star 3', [0, 0], v3, '#b18cff')]);
    } },
];
