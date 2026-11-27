/**
 * Encyclopedia (Gate E.1): cited, verbatim excerpts that explain what things are and what they are used
 * for. Nothing here is written by Voyager; each entry is quoted from a source in the Source index, with
 * its own citation, link and licence. Omitted sentences are marked […].
 *
 * Categories: radiation (E.1, NASA), celestial objects (E.2a, NASA), elements (E.2b, Los Alamos National
 * Laboratory) and molecules (E.2c, PubChem descriptions from ChEBI / NCI Thesaurus). Radiation and celestial
 * entries are bundled; the larger element and molecule sets are loaded on first use (`loadEncyclopedia`,
 * `useEncyclopedia`) and appended to ENTRIES, so every lookup sees them once loaded.
 */
import { useEffect, useSyncExternalStore } from 'react';
import radiation from '@datasets/encyclopedia/em-radiation.json';
import celestial from '@datasets/encyclopedia/celestial.json';
import { CONVENTIONS, bandsAt } from '@/modes/spectral/atlas/bands';

export type EncyclopediaCategory = 'radiation' | 'element' | 'molecule' | 'celestial';

export interface EncyclopediaSection { heading: string | null; paragraphs: string[] }
export interface EncyclopediaEntry {
  id: string;
  /** registry entity this entry describes */
  entity: string;
  category: EncyclopediaCategory;
  title: string;
  /** title of the source page */
  pageTitle: string;
  url: string;
  /** Source-index id */
  source: string;
  license: string;
  /** citation in the form the source asks for */
  citation: string;
  /** band ids (datasets/spectral/em-bands.json) whose range this entry describes */
  match: string[];
  seeAlso: string[];
  /** radiation entries: a wavelength inside the matched bands; null for other categories */
  exampleWavelengthM: number | null;
  sections: EncyclopediaSection[];
  omittedSentences: number;
}

export const CATEGORIES: { id: EncyclopediaCategory; label: string; status: 'available' | 'planned' }[] = [
  { id: 'radiation', label: 'Radiation', status: 'available' },
  { id: 'element', label: 'Elements', status: 'available' },
  { id: 'molecule', label: 'Molecules', status: 'available' },
  { id: 'celestial', label: 'Celestial objects', status: 'available' },
];

/** Gate E.1 radiation (NASA Tour of the EM Spectrum) + Gate E.2a celestial objects (NASA Science Facts pages). */
export const ENTRIES: EncyclopediaEntry[] = [...(radiation as unknown as { entries: EncyclopediaEntry[] }).entries, ...(celestial as unknown as { entries: EncyclopediaEntry[] }).entries];

// ---------------------------------------------------------------- lazily loaded categories (E.2b, E.2c)
let loaded = false, version = 0;
let pending: Promise<void> | null = null;
const listeners = new Set<() => void>();
/** Load the element and molecule entries (two lazy chunks) and append them to ENTRIES once. */
export function loadEncyclopedia(): Promise<void> {
  if (loaded) return Promise.resolve();
  pending ??= Promise.all([import('@datasets/encyclopedia/elements.json'), import('@datasets/encyclopedia/molecules.json')]).then(([el, mol]) => {
    for (const d of [el, mol]) ENTRIES.push(...((d.default ?? d) as unknown as { entries: EncyclopediaEntry[] }).entries);
    loaded = true; version++; listeners.forEach((l) => l());
  });
  return pending;
}
export const encyclopediaLoaded = () => loaded;
/** Re-renders the caller once the lazy categories have loaded (and starts loading them). Returns a version number. */
export function useEncyclopedia(): number {
  const v = useSyncExternalStore((cb) => { listeners.add(cb); return () => listeners.delete(cb); }, () => version);
  useEffect(() => { void loadEncyclopedia(); }, []);
  return v;
}
export const getEntry = (id: string) => ENTRIES.find((e) => e.id === id);
export const entryForEntity = (entity: string) => ENTRIES.find((e) => e.entity === entity);
export const entriesIn = (cat: EncyclopediaCategory) => ENTRIES.filter((e) => e.category === cat);

/**
 * Entries whose sourced band ranges contain the vacuum wavelength λ (m). Ranges come from the band
 * conventions already in the atlas (ISO 21348 categories, ITU-R V.431 bands), never from the excerpts.
 * Overlaps are real: ISO 21348 counts microwaves as part of the radio range, so both can match.
 */
export function entriesForWavelength(lambdaM: number): EncyclopediaEntry[] {
  const hit = new Set(CONVENTIONS.flatMap((cv) => bandsAt(cv, lambdaM).map((h) => h.band.id)));
  return ENTRIES.filter((e) => e.match.some((id) => hit.has(id)));
}

/** Case-insensitive search over titles and text. */
export function searchEntries(q: string): EncyclopediaEntry[] {
  const s = q.trim().toLowerCase();
  if (!s) return ENTRIES;
  return ENTRIES.filter((e) => e.title.toLowerCase().includes(s) || e.sections.some((x) => (x.heading ?? '').toLowerCase().includes(s) || x.paragraphs.some((p) => p.toLowerCase().includes(s))));
}
