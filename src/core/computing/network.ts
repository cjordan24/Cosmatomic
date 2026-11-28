/**
 * Networking (Phase 15, Gate 15.6).
 *
 *  - The IPv4 header of RFC 791 §3.1: twenty octets for IHL = 5 (“the minimum value for a correct header is 5”), the
 *    fields at the bit widths the RFC gives, and the header checksum: “the 16 bit one's complement of the one's
 *    complement sum of all 16 bit words in the header. For purposes of computing the checksum, the value of the
 *    checksum field is zero.” Every router decreases the Time to Live by at least one and recomputes the checksum
 *    (“this is recomputed and verified at each point that the internet header is processed”); at zero the
 *    datagram “must be destroyed”.
 *  - Shannon (1948) Theorem 17: C = W log₂ (P + N)/N bits per second for a band W with white noise.
 */
export interface Ipv4 { tos: number; totalLength: number; id: number; flags: number; fragOffset: number; ttl: number; protocol: number; src: [number, number, number, number]; dst: [number, number, number, number] }

/** The 20 header octets with the checksum filled in. */
export function ipv4Header(h: Ipv4): number[] {
  const b = [0x45, h.tos & 0xff, (h.totalLength >> 8) & 0xff, h.totalLength & 0xff, (h.id >> 8) & 0xff, h.id & 0xff,
    ((h.flags & 0x7) << 5) | ((h.fragOffset >> 8) & 0x1f), h.fragOffset & 0xff, h.ttl & 0xff, h.protocol & 0xff, 0, 0, ...h.src, ...h.dst];
  const c = checksum(b);
  b[10] = (c >> 8) & 0xff; b[11] = c & 0xff;
  return b;
}
/** One's-complement sum of 16-bit words, folded. */
export function onesSum(bytes: number[]): number {
  let s = 0;
  for (let i = 0; i < bytes.length; i += 2) { s += (bytes[i] << 8) | (bytes[i + 1] ?? 0); s = (s & 0xffff) + (s >>> 16); }
  return s & 0xffff;
}
/** RFC 791 header checksum (checksum field must be zero in the input). */
export const checksum = (bytes: number[]) => ~onesSum(bytes) & 0xffff;
/** A received header verifies when the one's-complement sum over all words, checksum included, is FFFF. */
export const verifies = (bytes: number[]) => onesSum(bytes) === 0xffff;

/** Forward through routers: each hop decrements TTL and rebuilds the checksum; returns the header after each hop. */
export function forward(h: Ipv4, hops: number) {
  const out: { hop: number; ttl: number; header: number[]; destroyed: boolean }[] = [];
  let ttl = h.ttl;
  for (let i = 1; i <= hops; i++) {
    ttl -= 1;
    const header = ipv4Header({ ...h, ttl: Math.max(0, ttl) });
    out.push({ hop: i, ttl: Math.max(0, ttl), header, destroyed: ttl <= 0 });
    if (ttl <= 0) break;
  }
  return out;
}

/** Shannon's Theorem 17: capacity (bit/s) of band W (Hz) at signal-to-noise power ratio P/N. */
export const shannonCapacity = (W: number, snr: number) => W * Math.log2(1 + snr);
export const dbToRatio = (db: number) => 10 ** (db / 10);
