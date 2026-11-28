/**
 * Machine learning (Phase 16): a small fully connected network trained by gradient descent with backpropagation,
 * and scaled dot-product attention — written out in plain arithmetic so every number can be shown.
 *
 *  - Network: inputs → hidden layers (tanh) → one output (logistic sigmoid); loss: binary cross-entropy averaged over
 *    the batch; gradients by the chain rule (backpropagation), checked against finite differences in the tests.
 *  - Training: full-batch gradient descent, w ← w − η ∂L/∂w.
 *  - Attention: softmax(QKᵀ/√d_k)V, row-wise softmax.
 * Deterministic: weights come from a seeded generator.
 */
import { mulberry32 } from '@/core/simulation/random';

export interface Net { sizes: number[]; W: number[][][]; b: number[][] }
export type Sample = { x: number[]; y: number };

export function initNet(sizes: number[], seed = 1): Net {
  const rnd = mulberry32(seed);
  const W = [], b = [];
  for (let l = 1; l < sizes.length; l++) {
    const scale = 1 / Math.sqrt(sizes[l - 1]);
    W.push(Array.from({ length: sizes[l] }, () => Array.from({ length: sizes[l - 1] }, () => (rnd() * 2 - 1) * scale * 1.5)));
    b.push(Array.from({ length: sizes[l] }, () => 0));
  }
  return { sizes, W, b };
}
const sigmoid = (z: number) => 1 / (1 + Math.exp(-z));

/** Activations of every layer for one input. */
export function forward(net: Net, x: number[]): number[][] {
  const acts = [x];
  for (let l = 0; l < net.W.length; l++) {
    const prev = acts[l], last = l === net.W.length - 1;
    acts.push(net.W[l].map((row, j) => { const z = row.reduce((s, w, i) => s + w * prev[i], net.b[l][j]); return last ? sigmoid(z) : Math.tanh(z); }));
  }
  return acts;
}
export const predict = (net: Net, x: number[]) => forward(net, x)[net.W.length][0];

/** Mean binary cross-entropy. */
export function loss(net: Net, data: Sample[]): number {
  const eps = 1e-12;
  return data.reduce((s, d) => { const p = predict(net, d.x); return s - (d.y * Math.log(p + eps) + (1 - d.y) * Math.log(1 - p + eps)); }, 0) / data.length;
}

/** Gradients of the mean loss by backpropagation. */
export function gradients(net: Net, data: Sample[]): { dW: number[][][]; db: number[][] } {
  const dW = net.W.map((L) => L.map((r) => r.map(() => 0))), db = net.b.map((r) => r.map(() => 0));
  for (const d of data) {
    const acts = forward(net, d.x);
    // output layer: for sigmoid + cross-entropy, dL/dz = p − y
    let delta = [acts[net.W.length][0] - d.y];
    for (let l = net.W.length - 1; l >= 0; l--) {
      const prev = acts[l];
      for (let j = 0; j < delta.length; j++) { db[l][j] += delta[j]; for (let i = 0; i < prev.length; i++) dW[l][j][i] += delta[j] * prev[i]; }
      if (l > 0) delta = prev.map((a, i) => (1 - a * a) * delta.reduce((s, dj, j) => s + dj * net.W[l][j][i], 0));   // tanh′ = 1 − a²
    }
  }
  const n = data.length;
  return { dW: dW.map((L) => L.map((r) => r.map((v) => v / n))), db: db.map((r) => r.map((v) => v / n)) };
}

/** One gradient-descent step with learning rate η; returns a new network. */
export function trainStep(net: Net, data: Sample[], eta: number): Net {
  const g = gradients(net, data);
  return { sizes: net.sizes, W: net.W.map((L, l) => L.map((r, j) => r.map((w, i) => w - eta * g.dW[l][j][i]))), b: net.b.map((r, l) => r.map((v, j) => v - eta * g.db[l][j])) };
}
export const accuracy = (net: Net, data: Sample[]) => data.filter((d) => (predict(net, d.x) > 0.5 ? 1 : 0) === d.y).length / data.length;
export const parameterCount = (sizes: number[]) => sizes.slice(1).reduce((s, n, i) => s + n * sizes[i] + n, 0);

/** Datasets on [−1, 1]²: XOR quadrants, a disc, two moons-like spirals (deterministic). */
export function makeData(kind: 'xor' | 'circle' | 'spiral', n = 120, seed = 3): Sample[] {
  const rnd = mulberry32(seed), out: Sample[] = [];
  for (let k = 0; k < n; k++) {
    if (kind === 'spiral') {
      const cls = k % 2, t = (k / n) * 3 + 0.3, r = t / 3.4, ang = t * 2.2 + cls * Math.PI;
      out.push({ x: [r * Math.cos(ang) + (rnd() - 0.5) * 0.08, r * Math.sin(ang) + (rnd() - 0.5) * 0.08], y: cls });
    } else {
      const x = [rnd() * 2 - 1, rnd() * 2 - 1];
      out.push({ x, y: kind === 'xor' ? (x[0] * x[1] > 0 ? 1 : 0) : (x[0] ** 2 + x[1] ** 2 < 0.45 ? 1 : 0) });
    }
  }
  return out;
}

// ---------------- attention ----------------
export const matmul = (A: number[][], B: number[][]) => A.map((r) => B[0].map((_, j) => r.reduce((s, a, k) => s + a * B[k][j], 0)));
export const transpose = (A: number[][]) => A[0].map((_, j) => A.map((r) => r[j]));
export const softmaxRows = (A: number[][]) => A.map((r) => { const m = Math.max(...r), e = r.map((v) => Math.exp(v - m)), s = e.reduce((a, b) => a + b, 0); return e.map((v) => v / s); });
/** Scaled dot-product attention: returns the weights softmax(QKᵀ/√d_k) and the output weights·V. */
export function attention(Q: number[][], K: number[][], V: number[][]) {
  const dk = K[0].length, scores = matmul(Q, transpose(K)).map((r) => r.map((v) => v / Math.sqrt(dk)));
  const weights = softmaxRows(scores);
  return { scores, weights, out: matmul(weights, V) };
}
