/**
 * Phase 21 — atlas grid decoding.
 */
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { areaMean, colour, decodeMonth, sample } from '@/core/meteorology/grid';
import atlas from '@datasets/meteorology/atlas.json';

/* eslint-disable @typescript-eslint/no-explicit-any */
const A = (atlas as any).layers as any[];
const load = (id: string) => { const m = A.find((l) => l.id === id)!; return { m, b: new Uint8Array(readFileSync(`public${m.file}`)) }; };
describe('atlas grids', () => {
  it('every layer file has months × w × h bytes', () => { for (const m of A) expect(readFileSync(`public${m.file}`).length).toBe(m.months * m.w * m.h); });
  it('SST area mean ≈ 18.8 °C in January and July 2024 (agrees with the source check, within quantisation)', () => {
    const { m, b } = load('sst');
    expect(areaMean(decodeMonth(b, m, 0), m)).toBeCloseTo(18.8, 0);
    expect(areaMean(decodeMonth(b, m, 6), m)).toBeCloseTo(18.8, 0);
  });
  it('the equatorial Pacific is warm and the Southern Ocean cold', () => {
    const { m, b } = load('sst'); const v = decodeMonth(b, m, 0);
    expect(sample(v, m, 0, 160)).toBeGreaterThan(27); expect(sample(v, m, -60, 0)).toBeLessThan(5);
  });
  it('land cells have no SST; the Colombian artefact is masked from land temperature', () => {
    const s = load('sst'); expect(Number.isNaN(sample(decodeMonth(s.b, s.m, 0), s.m, 40, -100))).toBe(true);
    const a = load('airtemp'); expect(Math.max(...Array.from(decodeMonth(a.b, a.m, 0)).filter((x) => !Number.isNaN(x)))).toBeLessThanOrEqual(50);
  });
  it('January 250 hPa jet over Japan is strongly westerly', () => { const { m, b } = load('u250'); expect(sample(decodeMonth(b, m, 0), m, 32, 140)).toBeGreaterThan(50); });
  it('colour scale ends', () => { expect(colour(0)).toEqual([68, 1, 84]); expect(colour(1, 'diverging')).toEqual([103, 0, 31]); });
});
