/**
 * Gate 15.6 — RFC 791 header and checksum; Shannon's channel capacity.
 */
import { describe, expect, it } from 'vitest';
import { checksum, dbToRatio, forward, ipv4Header, onesSum, shannonCapacity, verifies, type Ipv4 } from '@/core/computing/network';

const H: Ipv4 = { tos: 0, totalLength: 60, id: 0x1c46, flags: 2, fragOffset: 0, ttl: 64, protocol: 6, src: [192, 168, 0, 1], dst: [93, 184, 216, 34] };

describe('IPv4 header (RFC 791)', () => {
  it('is 20 octets with version 4 and IHL 5 in the first octet', () => {
    const b = ipv4Header(H);
    expect(b).toHaveLength(20); expect(b[0] >> 4).toBe(4); expect(b[0] & 0xf).toBe(5);
  });
  it('the checksum makes the one’s-complement sum of all words FFFF; any flipped bit is caught', () => {
    const b = ipv4Header(H);
    expect(verifies(b)).toBe(true);
    const bad = [...b]; bad[15] ^= 0x01;
    expect(verifies(bad)).toBe(false);
  });
  it('checksum of a header with a zero checksum field equals the complement of its folded sum', () => {
    const b = ipv4Header(H); const z = [...b]; z[10] = 0; z[11] = 0;
    expect(checksum(z)).toBe((b[10] << 8) | b[11]);
    expect((onesSum(z) + checksum(z)) & 0xffff).toBe(0xffff);
  });
  it('forwarding: TTL falls by one per hop, the checksum changes and still verifies; at zero the datagram is destroyed', () => {
    const f = forward({ ...H, ttl: 3 }, 10);
    expect(f.map((x) => x.ttl)).toEqual([2, 1, 0]);
    expect(f[f.length - 1].destroyed).toBe(true);
    f.forEach((x) => expect(verifies(x.header)).toBe(true));
    expect(f[0].header[10] * 256 + f[0].header[11]).not.toBe(f[1].header[10] * 256 + f[1].header[11]);
  });
});

describe('Shannon capacity (1948, Theorem 17)', () => {
  it('3 kHz at 30 dB carries 29.9 kbit/s; 20 MHz at 25 dB carries 166.2 Mbit/s', () => {
    expect(shannonCapacity(3000, dbToRatio(30)) / 1000).toBeCloseTo(29.90, 2);
    expect(shannonCapacity(20e6, dbToRatio(25)) / 1e6).toBeCloseTo(166.19, 2);
  });
  it('doubling the bandwidth doubles C; doubling the power adds about W bit/s at high SNR', () => {
    expect(shannonCapacity(2e6, 100) / shannonCapacity(1e6, 100)).toBeCloseTo(2, 12);
    expect((shannonCapacity(1e6, 2000) - shannonCapacity(1e6, 1000)) / 1e6).toBeCloseTo(1, 2);
  });
});
