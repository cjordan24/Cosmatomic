/**
 * Universal scale ladder. Each level has a characteristic length (m) and the
 * Voyager view that currently serves it (or `null` = planned / visualisation only).
 */
export type ScaleSupport = 'interactive' | 'educational' | 'planned';

export interface ScaleLevel {
  id: string;
  label: string;
  /** log10 of the characteristic size in metres */
  log10m: number;
  support: ScaleSupport;
  /** hash route that serves this scale, if any */
  route: string | null;
  example: string;
}

export const SCALE_LEVELS: ScaleLevel[] = [
  { id: 'subatomic', label: 'Subatomic', log10m: -16, support: 'planned', route: null, example: 'Quarks inside a proton (< 10⁻¹⁵ m)' },
  { id: 'nucleus', label: 'Nuclei', log10m: -14.5, support: 'educational', route: '#/atomic/element/26?view=nucleus', example: 'Iron-56 nucleus ≈ 9 fm across' },
  { id: 'atom', label: 'Atoms', log10m: -10, support: 'interactive', route: '#/atomic/element/1?view=orbital', example: 'Hydrogen atom, Bohr radius 52.9 pm' },
  { id: 'molecule', label: 'Molecules', log10m: -9.3, support: 'interactive', route: '#/atomic/molecules', example: 'Glucose ≈ 1 nm' },
  { id: 'nano', label: 'Nanostructures', log10m: -8, support: 'planned', route: null, example: 'Virus capsid ≈ 30 nm' },
  { id: 'micro', label: 'Microscopic', log10m: -5, support: 'planned', route: null, example: 'Red blood cell ≈ 8 µm' },
  { id: 'material', label: 'Materials', log10m: -2, support: 'interactive', route: '#/atomic/materials/nacl', example: 'Salt crystal ≈ 1 mm (unit cell 0.56 nm)' },
  { id: 'human', label: 'Human scale', log10m: 0.2, support: 'planned', route: null, example: 'A person ≈ 1.7 m' },
  { id: 'surface', label: 'Planetary surfaces', log10m: 4, support: 'planned', route: null, example: 'Olympus Mons ≈ 600 km wide' },
  { id: 'planet', label: 'Planets', log10m: 7.1, support: 'interactive', route: '#/cosmic/earth', example: 'Earth diameter 12 756 km' },
  { id: 'solar-system', label: 'Solar system', log10m: 12.7, support: 'interactive', route: '#/cosmic', example: 'Neptune orbit ≈ 60 au across' },
  { id: 'stellar', label: 'Stellar neighbourhood', log10m: 17, support: 'interactive', route: '#/cosmic/stars', example: 'Proxima Centauri at 1.30 pc; 10 pc ≈ 3.1 × 10¹⁷ m' },
  { id: 'galaxy', label: 'Galaxies', log10m: 21, support: 'planned', route: null, example: 'Milky Way disc ≈ 30 kpc' },
  { id: 'cluster', label: 'Galaxy clusters', log10m: 23, support: 'planned', route: null, example: 'Virgo Cluster ≈ 2 Mpc' },
  { id: 'web', label: 'Cosmic web', log10m: 24.7, support: 'planned', route: null, example: 'Laniakea ≈ 160 Mpc' },
  { id: 'observable', label: 'Observable universe', log10m: 26.9, support: 'planned', route: null, example: 'Comoving diameter ≈ 28.5 Gpc' },
];

export const nearestScale = (log10m: number) =>
  SCALE_LEVELS.reduce((best, s) => (Math.abs(s.log10m - log10m) < Math.abs(best.log10m - log10m) ? s : best));
