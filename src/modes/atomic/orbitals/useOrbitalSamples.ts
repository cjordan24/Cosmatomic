/**
 * React hook: request orbital samples from the background worker.
 * Stale responses are discarded by request id; the worker is a lazily created singleton.
 */
import { useEffect, useState } from 'react';
import type { SampleRequest, SampleResult } from './hydrogenic';

let worker: Worker | null = null;
let nextId = 1;
const waiters = new Map<number, (r: SampleResult) => void>();

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker(new URL('../../../workers/orbital.worker.ts', import.meta.url), { type: 'module' });
    worker.onmessage = (ev: MessageEvent<SampleResult & { requestId: number }>) => {
      const cb = waiters.get(ev.data.requestId);
      waiters.delete(ev.data.requestId);
      cb?.(ev.data);
    };
  }
  return worker;
}

/**
 * Results are tagged with the request key they answer and only returned while that key is current:
 * a stale sample set (whose indices refer to a previous orbital list) must never be rendered.
 */
export function useOrbitalSamples(req: SampleRequest | null): SampleResult | null {
  const [res, setRes] = useState<{ key: string; r: SampleResult } | null>(null);
  const key = req ? JSON.stringify(req) : '';
  useEffect(() => {
    if (!req) return;
    let alive = true;
    const id = nextId++;
    waiters.set(id, (r) => { if (alive) setRes({ key, r }); });
    getWorker().postMessage({ ...req, requestId: id });
    return () => { alive = false; waiters.delete(id); };
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps
  return res && res.key === key ? res.r : null;
}
