/**
 * Gate E.1: encyclopedia of radiation. Integrity of the quoted entries (source, licence, citation, NASA
 * URL, omission markers), wavelength matching through the sourced band conventions only, and registry
 * entities for every entry.
 */
import { describe, expect, it } from 'vitest';
import { CATEGORIES, ENTRIES, entriesForWavelength, getEntry, searchEntries } from '@/shared/encyclopedia/encyclopedia';
import { CONVENTIONS } from '@/modes/spectral/atlas/bands';
import { getSource } from '@/shared/sources/sources';
import { getEntity } from '@/shared/scientific-relationships/registry';

const ids = (l: number) => entriesForWavelength(l).map((e) => e.id).sort();

describe('entries', () => {
  it('8 radiation entries, each quoted from NASA with source, licence, citation and page URL', () => {
    expect(ENTRIES.map((e) => e.id)).toEqual(['em-spectrum', 'em-radio', 'em-microwave', 'em-infrared', 'em-visible', 'em-ultraviolet', 'em-xray', 'em-gamma']);
    for (const e of ENTRIES) {
      expect(getSource(e.source), e.id).toBeTruthy();
      expect(e.url).toMatch(/^https:\/\/science\.nasa\.gov\/ems\/\d\d_[a-z]+\/$/);
      expect(e.citation).toMatch(/^National Aeronautics and Space Administration, Science Mission Directorate\. \(2010\)\./);
      expect(e.citation).not.toContain('[insert date');
      expect(e.license).toMatch(/NASA/);
      expect(e.sections.length).toBeGreaterThan(0);
      for (const s of e.sections) for (const p of s.paragraphs) {
        expect(p.length).toBeGreaterThan(40);
        expect(p).not.toMatch(/<[a-z]/i); // no HTML left
        expect(p).not.toMatch(/\b(image|photo|photograph) (below|above)\b/i); // picture references removed
      }
    }
  });
  it('every […] marker corresponds to an omitted sentence, and omissions are counted', () => {
    for (const e of ENTRIES) {
      const markers = e.sections.flatMap((s) => s.paragraphs).join(' ').match(/\[…\]/g)?.length ?? 0;
      if (markers > 0) expect(e.omittedSentences, e.id).toBeGreaterThanOrEqual(markers);
    }
  });
  it('band ids used for matching exist in the bundled conventions', () => {
    const all = new Set(CONVENTIONS.flatMap((c) => (c.bands ?? []).map((b) => b.id)));
    for (const e of ENTRIES) for (const id of e.match) expect(all.has(id), `${e.id} → ${id}`).toBe(true);
    for (const e of ENTRIES) for (const id of e.seeAlso) expect(getEntry(id), `${e.id} see also ${id}`).toBeTruthy();
  });
  it('quoted facts are kept as published (spot checks): visible 380–700 nm, X-rays 0.03–3 nm, oven microwaves 12 cm', () => {
    const text = (id: string) => getEntry(id)!.sections.flatMap((s) => s.paragraphs).join(' ');
    expect(text('em-visible')).toContain('Typically, the human eye can detect wavelengths from 380 to 700 nanometers.');
    expect(text('em-xray')).toContain('between 0.03 and 3 nanometers');
    expect(text('em-microwave')).toContain('about 12 centimeters in length');
  });
});

describe('wavelength → entries (through ISO 21348 / ITU-R V.431 bands only)', () => {
  it('typical wavelengths map to one type each', () => {
    expect(ids(1e-13)).toEqual(['em-gamma']);
    expect(ids(1e-12)).toEqual(['em-xray']); // 1 pm is ISO's gamma/X-ray edge, counted as X-ray ([) edges)
    expect(ids(1e-9)).toEqual(['em-xray']);
    expect(ids(3e-7)).toEqual(['em-ultraviolet']);
    expect(ids(5.5e-7)).toEqual(['em-visible']);
    expect(ids(1e-5)).toEqual(['em-infrared']);
    expect(ids(1)).toEqual(['em-radio']);
    expect(ids(1e4)).toEqual(['em-radio']); // VLF, beyond ISO's 100 m radio limit, via ITU-R
  });
  it('overlaps follow the conventions: 5 mm is both ISO microwave and radio; 390 nm is UV and visible', () => {
    expect(ids(5e-3)).toEqual(['em-microwave', 'em-radio']);
    expect(ids(3.9e-7)).toEqual(['em-ultraviolet', 'em-visible']);
  });
  it('the 12 cm microwave-oven example is radio by ISO 21348 (its microwave category ends at 15 mm)', () => {
    expect(ids(0.12)).toEqual(['em-radio']);
  });
});

describe('menu, search and registry', () => {
  it('radiation is available; elements, molecules and celestial objects are planned', () => {
    expect(CATEGORIES.map((c) => [c.id, c.status])).toEqual([['radiation', 'available'], ['element', 'planned'], ['molecule', 'planned'], ['celestial', 'planned']]);
  });
  it('search finds text inside entries', () => {
    expect(searchEntries('Herschel').map((e) => e.id)).toEqual(['em-infrared']);
    expect(searchEntries('').length).toBe(ENTRIES.length);
  });
  it('each entry describes a registry entity that opens the atlas at a wavelength inside its matched bands', () => {
    for (const e of ENTRIES) {
      const ent = getEntity(e.entity);
      expect(ent, e.entity).toBeTruthy();
      expect(ent!.route).toMatch(/^#\/spectral/);
      if (e.match.length) expect(ids(e.exampleWavelengthM), e.id).toContain(e.id);
    }
  });
  it('the source entry lists the dataset', () => {
    expect(getSource('nasa-tour-ems')!.datasets).toEqual(['encyclopedia-em-radiation']);
  });
});
