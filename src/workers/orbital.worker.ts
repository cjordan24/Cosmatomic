/// <reference lib="webworker" />
/**
 * Background worker: Monte-Carlo sampling of orbital probability densities so
 * the UI thread stays responsive (tens of thousands of points per request).
 */
import { sampleOrbitals, type SampleRequest } from '@/modes/atomic/orbitals/hydrogenic';
import { mulberry32 } from '@/core/simulation/random';

self.onmessage = (ev: MessageEvent<SampleRequest & { requestId: number }>) => {
  const { requestId, ...req } = ev.data;
  const res = sampleOrbitals(req, mulberry32(req.seed));
  (self as unknown as Worker).postMessage({ requestId, ...res }, [res.positions.buffer, res.phase.buffer, res.source.buffer]);
};
