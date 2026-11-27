/**
 * Encyclopedia (Gate E.1): cited, verbatim excerpts that explain what things are and what they are used
 * for. Nothing here is written by Voyager; each entry is quoted from a source in the Source index, with
 * its own citation, link and licence. Omitted sentences are marked […].
 *
 * Categories are added pass by pass. Radiation is available; elements, molecules and celestial objects
 * are planned (shown as such in the encyclopedia menu).
 */
import radiation from '@datasets/encyclopedia/em-radiation.json';
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
  exampleWavelengthM: number;
  sections: EncyclopediaSection[];
  omittedSentences: number;
}

export const CATEGORIES: { id: EncyclopediaCategory; label: string; status: 'available' | 'planned' }[] = [
  { id: 'radiation', label: 'Radiation', status: 'available' },
  { id: 'element', label: 'Elements', status: 'planned' },
  { id: 'molecule', label: 'Molecules', status: 'planned' },
  { id: 'celestial', label: 'Celestial objects', status: 'planned' },
];

export const ENTRIES = (radiation as unknown as { entries: EncyclopediaEntry[] }).entries;
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
