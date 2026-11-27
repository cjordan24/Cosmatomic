/**
 * Phase 9, Gate 9.2 — RF/wireless atlas. The curated allocations are internally consistent with the documents they
 * quote, and the published Voyager 2 link budgets are reproduced by the Friis path loss of Gate 9.1.
 */
import { describe, expect, it } from 'vitest';
import { GPS, RF_ENTRIES, RF_LINKS, centre, channelFrequency, checkLink, getRfEntry, ituBand, slantRange } from '@/modes/spectral/rf/rf';
import { getSource } from '@/shared/sources/sources';
import { CONSTANTS } from '@/core/constants/constants';

describe('RF allocations dataset', () => {
  it('has unique ids, a resolvable source and a verbatim quote for every entry', () => {
    expect(new Set(RF_ENTRIES.map((e) => e.id)).size).toBe(RF_ENTRIES.length);
    for (const e of RF_ENTRIES) {
      expect(getSource(e.source), e.id).toBeTruthy();
      expect(e.quote.length, e.id).toBeGreaterThan(20);
      if (e.kind === 'carrier') expect(e.f, e.id).toBeGreaterThan(0);
      else { expect(e.fLo!, e.id).toBeLessThan(e.fHi!); }
    }
    for (const id of [...GPS.sources, GPS.source]) expect(getSource(id), id).toBeTruthy();
  });
  it('channel plans match the rules: 100 FM channels 88.1–107.9 MHz, 117 AM carriers 540–1700 kHz', () => {
    for (const id of ['fm-broadcast', 'am-broadcast']) {
      const e = getRfEntry(id)!, ch = e.channels!;
      expect(Math.round((ch.last - ch.first) / ch.step) + 1, id).toBe(ch.count);
      expect(channelFrequency(e, ch.count - 1)).toBeCloseTo(ch.last, 3);
      expect(ch.first).toBeGreaterThanOrEqual(e.fLo!); expect(ch.last).toBeLessThanOrEqual(e.fHi!);
    }
    expect(getRfEntry('fm-broadcast')!.channels!.count).toBe(100);
    expect(getRfEntry('am-broadcast')!.channels!.count).toBe(117);
  });
  it('ISM bands are centre ± tolerance (47 CFR §18.301)', () => {
    const e = getRfEntry('ism-2450')!;
    expect(e.fLo).toBeCloseTo(2400e6, 3); expect(e.fHi).toBeCloseTo(2500e6, 3);
  });
  it('GPS carriers keep the ratios the specifications state: (L1/L2)² = (77/60)², (L1/L5)² = (154/115)²', () => {
    const l1 = getRfEntry('gps-l1')!.f!, l2 = getRfEntry('gps-l2')!.f!, l5 = getRfEntry('gps-l5')!.f!;
    expect(l1 / l2).toBeCloseTo(77 / 60, 12);
    expect(l1 / l5).toBeCloseTo(154 / 115, 12);
    expect(l1 / 10.23e6).toBeCloseTo(154, 9);    // multiples of the 10.23 MHz fundamental
  });
  it('Voyager X-band downlink is the uplink × 880/221 (coherent turnaround)', () => {
    expect((getRfEntry('voyager-uplink')!.f! * 880) / 221).toBeCloseTo(getRfEntry('voyager-x-downlink')!.f!, 0);
  });
  it('ITU-R V.431 bands: AM in MF, FM in VHF, GPS in UHF, Voyager X-band in SHF, 61.25 GHz ISM in EHF', () => {
    expect(ituBand(centre(getRfEntry('am-broadcast')!))?.symbol).toBe('MF');
    expect(ituBand(centre(getRfEntry('fm-broadcast')!))?.symbol).toBe('VHF');
    expect(ituBand(getRfEntry('gps-l1')!.f!)?.symbol).toBe('UHF');
    expect(ituBand(getRfEntry('voyager-x-downlink')!.f!)?.symbol).toBe('SHF');
    expect(ituBand(getRfEntry('ism-61250')!.f!)?.symbol).toBe('EHF');
  });
});

describe('published link budgets (Ludwig & Taylor 2002, Tables 5-2 and 5-3)', () => {
  const down = RF_LINKS.find((l) => l.id === 'voyager2-x-downlink-1996')!, up = RF_LINKS.find((l) => l.id === 'voyager2-s-uplink-1996')!;
  it('Friis space loss at the stated range and frequency reproduces the published space loss to 0.02 dB', () => {
    expect(checkLink(down).spaceLossDb).toBeCloseTo(308.19, 1);
    expect(Math.abs(checkLink(down).spaceLossDb - 308.19)).toBeLessThan(0.02);
    expect(Math.abs(checkLink(up).spaceLossDb - 296.18)).toBeLessThan(0.02);
  });
  it('the design items sum to within 0.2 dB of the published received power (the tables print the mean of toleranced items)', () => {
    expect(Math.abs(checkLink(down).sum - down.receivedDbm)).toBeLessThan(0.05);   // −145.51 vs −145.5
    expect(Math.abs(checkLink(up).sum - up.receivedDbm)).toBeLessThan(0.2);       // −127.22 vs −127.4 (70 m gain 62.10 design, 61.9 mean)
    expect(checkLink(down).ptN0).toBeCloseTo(down.ptN0, 0);
  });
  it('the stated 48.62 au matches 7.273 × 10⁹ km', () => {
    expect(down.rangeKm * 1e3 / CONSTANTS.au.value).toBeCloseTo(48.62, 1);
  });
});

describe('slant range to a satellite', () => {
  const R = CONSTANTS.ReEarth.value, h = GPS.altitudeKm * 1e3;
  it('is the altitude at the zenith and √((R+h)² − R²) at the horizon', () => {
    expect(slantRange(R, h, Math.PI / 2)).toBeCloseTo(h, 3);
    expect(slantRange(R, h, 0)).toBeCloseTo(Math.sqrt((R + h) ** 2 - R * R), 3);
  });
  it('grows monotonically as the satellite sinks', () => {
    expect(slantRange(R, h, 0.1)).toBeGreaterThan(slantRange(R, h, 0.5));
  });
});
