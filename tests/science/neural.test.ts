/**
 * Phase 16 — the trainable network and attention.
 */
import { describe, expect, it } from 'vitest';
import { accuracy, attention, gradients, initNet, loss, makeData, parameterCount, softmaxRows, trainStep, type Net } from '@/core/computing/neural';

describe('backpropagation', () => {
  it('analytic gradients match finite differences to 1e-6', () => {
    const net = initNet([2, 4, 3, 1], 7), data = makeData('xor', 20, 5), g = gradients(net, data), h = 1e-6;
    const bump = (n: Net, l: number, j: number, i: number, d: number): Net => ({ ...n, W: n.W.map((L, a) => L.map((r, c) => r.map((w, e) => (a === l && c === j && e === i ? w + d : w)))) });
    for (const [l, j, i] of [[0, 1, 0], [1, 2, 3], [2, 0, 1]]) {
      const num = (loss(bump(net, l, j, i, h), data) - loss(bump(net, l, j, i, -h), data)) / (2 * h);
      expect(g.dW[l][j][i]).toBeCloseTo(num, 6);
    }
  });
  it('gradient descent lowers the loss and learns XOR (which no single-layer network can)', () => {
    const data = makeData('xor', 120, 3);
    let net = initNet([2, 8, 1], 2); const l0 = loss(net, data);
    for (let k = 0; k < 600; k++) net = trainStep(net, data, 0.5);
    expect(loss(net, data)).toBeLessThan(l0 / 2);
    expect(accuracy(net, data)).toBeGreaterThan(0.9);
  });
  it('parameter count of 2-8-1 is 33 (weights 16 + 8, biases 8 + 1)', () => { expect(parameterCount([2, 8, 1])).toBe(33); });
});

describe('attention', () => {
  it('softmax rows sum to 1', () => { softmaxRows([[1, 2, 3], [0, 0, 0]]).forEach((r) => expect(r.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 12)); });
  it('a query matching one key attends mostly to it, and the output tends to that value', () => {
    const K = [[4, 0], [0, 4], [-4, 0]], V = [[1, 0], [0, 1], [5, 5]];
    const { weights, out } = attention([[4, 0]], K, V);
    expect(weights[0][0]).toBeGreaterThan(0.99);
    expect(out[0][0]).toBeCloseTo(1, 1);
  });
  it('scores are divided by √d_k', () => {
    const { scores } = attention([[1, 1, 1, 1]], [[1, 1, 1, 1]], [[1]]);
    expect(scores[0][0]).toBeCloseTo(4 / 2, 12);
  });
});
