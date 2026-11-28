/**
 * Geometry of macromolecular structures (Phase 11, Gates 11.1 and 11.3).
 *
 * principalExtents: the extent of an atom set along its three principal axes — the eigenvectors of the coordinate
 * covariance matrix (principal component analysis), found with the cyclic Jacobi rotation method for symmetric
 * matrices. It measures how long, wide and thick a structure is, independent of how the file orients it.
 * radiusOfGyration: Rg = √(⟨|r − r̄|²⟩), unweighted (every non-water atom counts once; hydrogens are absent from most
 * crystal structures). These are geometric descriptions of the deposited coordinates, not hydrodynamic sizes.
 */
export type Mat3 = [[number, number, number], [number, number, number], [number, number, number]];

/** Eigen-decomposition of a symmetric 3×3 matrix (cyclic Jacobi). Returns eigenvalues (descending) and unit eigenvectors. */
export function symmetricEigen3(A: Mat3): { values: number[]; vectors: [number, number, number][] } {
  const a = A.map((r) => [...r]) as number[][];
  const v = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
  for (let sweep = 0; sweep < 50; sweep++) {
    const off = Math.abs(a[0][1]) + Math.abs(a[0][2]) + Math.abs(a[1][2]);
    if (off < 1e-14 * (Math.abs(a[0][0]) + Math.abs(a[1][1]) + Math.abs(a[2][2]) + 1e-300)) break;
    for (const [p, q] of [[0, 1], [0, 2], [1, 2]] as const) {
      if (Math.abs(a[p][q]) < 1e-300) continue;
      const theta = (a[q][q] - a[p][p]) / (2 * a[p][q]);
      const t = Math.sign(theta || 1) / (Math.abs(theta) + Math.sqrt(theta * theta + 1));
      const c = 1 / Math.sqrt(t * t + 1), s = t * c;
      for (let k = 0; k < 3; k++) { const akp = a[k][p], akq = a[k][q]; a[k][p] = c * akp - s * akq; a[k][q] = s * akp + c * akq; }
      for (let k = 0; k < 3; k++) { const apk = a[p][k], aqk = a[q][k]; a[p][k] = c * apk - s * aqk; a[q][k] = s * apk + c * aqk; }
      for (let k = 0; k < 3; k++) { const vkp = v[k][p], vkq = v[k][q]; v[k][p] = c * vkp - s * vkq; v[k][q] = s * vkp + c * vkq; }
    }
  }
  const order = [0, 1, 2].sort((i, j) => a[j][j] - a[i][i]);
  return { values: order.map((i) => a[i][i]), vectors: order.map((i) => [v[0][i], v[1][i], v[2][i]] as [number, number, number]) };
}

/** Centroid of a flat [x0,y0,z0,x1,…] coordinate array. */
export function centroid(xyz: ArrayLike<number>): [number, number, number] {
  const n = xyz.length / 3;
  let x = 0, y = 0, z = 0;
  for (let i = 0; i < n; i++) { x += xyz[3 * i]; y += xyz[3 * i + 1]; z += xyz[3 * i + 2]; }
  return [x / n, y / n, z / n];
}

export function radiusOfGyration(xyz: ArrayLike<number>): number {
  const [cx, cy, cz] = centroid(xyz), n = xyz.length / 3;
  let s = 0;
  for (let i = 0; i < n; i++) s += (xyz[3 * i] - cx) ** 2 + (xyz[3 * i + 1] - cy) ** 2 + (xyz[3 * i + 2] - cz) ** 2;
  return Math.sqrt(s / n);
}

/** Extents (max − min of the projections) along the three principal axes, longest first; same unit as the input. */
export function principalExtents(xyz: ArrayLike<number>): { extents: [number, number, number]; axes: [number, number, number][] } {
  const [cx, cy, cz] = centroid(xyz), n = xyz.length / 3;
  const C: Mat3 = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  for (let i = 0; i < n; i++) {
    const d = [xyz[3 * i] - cx, xyz[3 * i + 1] - cy, xyz[3 * i + 2] - cz];
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) C[r][c] += (d[r] * d[c]) / n;
  }
  const { vectors } = symmetricEigen3(C);
  const ext = vectors.map((ax) => {
    let lo = Infinity, hi = -Infinity;
    for (let i = 0; i < n; i++) {
      const p = (xyz[3 * i] - cx) * ax[0] + (xyz[3 * i + 1] - cy) * ax[1] + (xyz[3 * i + 2] - cz) * ax[2];
      if (p < lo) lo = p; if (p > hi) hi = p;
    }
    return hi - lo;
  });
  return { extents: ext as [number, number, number], axes: vectors };
}
