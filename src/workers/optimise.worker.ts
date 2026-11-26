/// <reference lib="webworker" />
/**
 * Background geometry optimisation (VGFF-1, L-BFGS). Streams progress so the UI can animate
 * the structure relaxing and plot the energy; posts the final result with convergence data.
 */
import { optimise } from '@/modes/atomic/laboratory/forcefield';
import type { Structure } from '@/modes/atomic/laboratory/builder';

self.onmessage = (ev: MessageEvent<{ id: number; structure: Structure; maxIter?: number }>) => {
  const { id, structure, maxIter } = ev.data;
  let lastPost = 0;
  const result = optimise(structure, {
    maxIter: maxIter ?? 3000,
    onProgress: (it, E, x) => {
      const now = performance.now();
      if (now - lastPost < 60) return; // ~16 updates/s is plenty for animation
      lastPost = now;
      (self as unknown as Worker).postMessage({ id, type: 'progress', it, E, coords: Array.from(x) });
    },
  });
  (self as unknown as Worker).postMessage({ id, type: 'done', result });
};
