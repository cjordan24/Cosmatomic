/// <reference lib="webworker" />
/**
 * Background worker (Phase 9, Gate 9.3): received power over a horizontal plane of a room by the image method
 * (src/core/physics/em/room.ts), so the UI stays responsive. Rows are streamed as they are computed.
 */
import { receivedPower, roomContext, traceRays, type Room } from '@/core/physics/em/room';

export interface RoomMapRequest { id: number; room: Room; f: number; PT: number; tx: [number, number, number]; z: number; nx: number; ny: number; order: number }

self.onmessage = (ev: MessageEvent<RoomMapRequest>) => {
  const { id, room, f, PT, tx, z, nx, ny, order } = ev.data;
  const ctx = roomContext(room, f, PT);
  const coherent = new Float32Array(nx * ny), direct = new Float32Array(nx * ny);
  let last = performance.now();
  for (let j = 0; j < ny; j++) {
    for (let i = 0; i < nx; i++) {
      const rx: [number, number, number] = [((i + 0.5) / nx) * room.L, ((j + 0.5) / ny) * room.W, z];
      const p = receivedPower(ctx, traceRays(ctx, tx, rx, order));
      coherent[j * nx + i] = 10 * Math.log10(p.coherent / 1e-3);
      direct[j * nx + i] = 10 * Math.log10(p.direct / 1e-3);
    }
    const now = performance.now();
    if (now - last > 120 || j === ny - 1) {
      last = now;
      (self as unknown as Worker).postMessage({ id, rowsDone: j + 1, coherent: coherent.slice(), direct: direct.slice(), nx, ny });
    }
  }
};
