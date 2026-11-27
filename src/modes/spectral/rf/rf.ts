/**
 * RF/wireless atlas (Phase 9, Gate 9.2): real allocations and system frequencies from public primary documents
 * (datasets/spectral/rf-allocations.json), placed on the ITU-R V.431 band axis, and published link budgets
 * re-derived with the Friis equation (src/core/physics/em/antennas.ts).
 */
import data from '@datasets/spectral/rf-allocations.json';
import { CONSTANTS } from '@/core/constants/constants';
import { freeSpacePathLoss, dB } from '@/core/physics/em/antennas';
import { bandsAt, getConvention } from '@/modes/spectral/atlas/bands';

export type RfGroup = 'broadcast' | 'ism' | 'unlicensed' | 'navigation' | 'deep-space';
export interface RfEntry {
  id: string; name: string; group: RfGroup; kind: 'band' | 'carrier' | 'channels';
  fLo?: number; fHi?: number; f?: number; tolerance?: number;
  channels?: { first: number; last: number; step: number; count: number };
  ref: string; quote: string; source: string; note?: string;
}
export interface LinkItem { label: string; value: number; unit: 'dB' | 'dBm' | 'dBi' }
export interface PublishedLink { id: string; name: string; source: string; ref: string; f: number; rangeKm: number; rangeAu: number; items: LinkItem[]; receivedDbm: number; noiseDbmHz: number; systemTempK: number; ptN0: number }
interface RfData { version: string; retrieved: string; entries: RfEntry[]; links: PublishedLink[]; gps: { altitudeKm: number; approximate: boolean; source: string; quote: string; minReceivedDbw: { L1CA: number; L5: number }; receiveAntennaDbi: number; receiveAntennaNote: string; sources: string[] } }

const D = data as unknown as RfData;
export const RF_ENTRIES = D.entries;
export const RF_LINKS = D.links;
export const GPS = D.gps;
export const RF_RETRIEVED = D.retrieved;
export const GROUP_LABEL: Record<RfGroup, string> = { broadcast: 'Broadcasting', ism: 'ISM (industrial, scientific, medical) equipment', unlicensed: 'Unlicensed devices (Part 15)', navigation: 'Satellite navigation (GPS)', 'deep-space': 'Deep-space communication (Voyager)' };
export const GROUP_COLOR: Record<RfGroup, string> = { broadcast: '#f5c76b', ism: '#ff9a7a', unlicensed: '#7df9ff', navigation: '#5cf2a6', 'deep-space': '#b18cff' };

const C = CONSTANTS.c.value;
export const lambdaOf = (f: number) => C / f;
/** Representative frequency of an entry: its carrier, else the band centre. */
export const centre = (e: RfEntry) => e.f ?? ((e.fLo ?? 0) + (e.fHi ?? 0)) / 2;
export const getRfEntry = (id: string) => RF_ENTRIES.find((e) => e.id === id);

/** ITU-R V.431 band (symbol and number) containing frequency f. */
export function ituBand(f: number) {
  const conv = getConvention('itu-r-v431')!;
  const hit = bandsAt(conv, C / f).find((h) => h.band.symbol);
  return hit ? hit.band : null;
}
/** The n-th carrier of a channelised band (n = 0 … count − 1). */
export const channelFrequency = (e: RfEntry, n: number) => e.channels ? e.channels.first + n * e.channels.step : NaN;

/** A published link budget: the sum of its design items, and the space loss recomputed from range and frequency. */
export function checkLink(l: PublishedLink) {
  const sum = l.items.reduce((s, i) => s + i.value, 0);
  const spaceLossDb = dB(freeSpacePathLoss(l.rangeKm * 1e3, lambdaOf(l.f)));
  const publishedSpace = -(l.items.find((i) => i.label === 'Space loss')?.value ?? NaN);
  const recomputed = sum + publishedSpace - spaceLossDb;
  return { sum, spaceLossDb, publishedSpace, recomputed, ptN0: l.receivedDbm - l.noiseDbmHz };
}

/** Line-of-sight distance to a satellite at altitude h above a spherical Earth of radius R, seen at elevation e (rad). */
export function slantRange(R: number, h: number, elevation: number): number {
  const s = Math.sin(elevation), c = Math.cos(elevation);
  return Math.sqrt((R + h) ** 2 - (R * c) ** 2) - R * s;
}
