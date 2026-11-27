/**
 * Gate E.1: encyclopedia of radiation. Integrity of the quoted entries (source, licence, citation, NASA
 * URL, omission markers), wavelength matching through the sourced band conventions only, and registry
 * entities for every entry.
 */
import { beforeAll, describe, expect, it } from 'vitest';
import { CATEGORIES, ENTRIES as ALL, entriesForWavelength, entriesIn, entryForEntity, getEntry, loadEncyclopedia, searchEntries } from '@/shared/encyclopedia/encyclopedia';
import { CONVENTIONS } from '@/modes/spectral/atlas/bands';
import { getSource } from '@/shared/sources/sources';
import { getEntity } from '@/shared/scientific-relationships/registry';

const ENTRIES = entriesIn('radiation');
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
  it('all four categories are available', () => {
    expect(CATEGORIES.map((c) => [c.id, c.status])).toEqual([['radiation', 'available'], ['element', 'available'], ['molecule', 'available'], ['celestial', 'available']]);
  });
  it('search finds text inside the bundled entries before the lazy categories load', () => {
    expect(searchEntries('Herschel').map((e) => e.id)).toEqual(['em-infrared', 'celestial-uranus']); // William Herschel: infrared (1800) and Uranus (1781)
    expect(searchEntries('').length).toBe(ALL.length);
    expect(entriesIn('element')).toEqual([]);
  });
  it('each entry describes a registry entity that opens the atlas at a wavelength inside its matched bands', () => {
    for (const e of ENTRIES) {
      const ent = getEntity(e.entity);
      expect(ent, e.entity).toBeTruthy();
      expect(ent!.route).toMatch(/^#\/spectral/);
      if (e.match.length) expect(ids(e.exampleWavelengthM!), e.id).toContain(e.id);
    }
  });
  it('the source entry lists the dataset', () => {
    expect(getSource('nasa-tour-ems')!.datasets).toEqual(['encyclopedia-em-radiation']);
  });
});

describe('celestial objects (Gate E.2a, NASA Science Facts pages)', () => {
  const C = entriesIn('celestial');
  it('12 entries quoted from NASA Facts pages with source, licence, citation and page URL', () => {
    expect(C.map((e) => e.id)).toEqual(['sun', 'mercury', 'venus', 'earth', 'moon', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'ceres'].map((x) => `celestial-${x}`));
    for (const e of C) {
      expect(e.source).toBe('nasa-science-solar-system');
      expect(e.url).toMatch(/^https:\/\/science\.nasa\.gov\/[a-z/-]+\/$/);
      expect(e.citation).toMatch(/^National Aeronautics and Space Administration, Science Mission Directorate\. .+ Retrieved \d{4}-\d\d-\d\d, from https:\/\/science\.nasa\.gov\//);
      expect(e.license).toMatch(/NASA/);
      expect(e.exampleWavelengthM).toBeNull();
      expect(e.sections.length).toBeGreaterThan(5);
      for (const s of e.sections) for (const p of s.paragraphs) expect(p).not.toMatch(/<[a-z]/i);
      const markers = e.sections.flatMap((s) => s.paragraphs).join(' ').match(/\[…\]/g)?.length ?? 0;
      if (markers) expect(e.omittedSentences).toBeGreaterThanOrEqual(markers);
      for (const id of e.seeAlso) expect(getEntry(id), `${e.id} see also ${id}`).toBeTruthy();
    }
  });
  it('each entry describes a registered body that opens in Cosmic mode, and is found from that body', () => {
    for (const e of C) {
      expect(getEntity(e.entity)?.route).toBe(`#/cosmic/${e.entity.split(':')[1]}`);
      expect(entryForEntity(e.entity)).toBe(e);
    }
  });
  it('keeps NASA’s text as published (spot checks) and leaves out the reviewed non-science section', () => {
    const text = (id: string) => getEntry(id)!.sections.flatMap((s) => s.paragraphs).join(' ');
    expect(text('celestial-mars')).toContain('With a radius of 2,106 miles (3,390 kilometers), Mars is about half the size of Earth.');
    expect(text('celestial-pluto')).toContain('Pluto was named by an 11-year-old girl.');
    expect(getEntry('celestial-ceres')!.sections.map((s) => s.heading)).not.toContain('Pop Culture');
    expect(getSource('nasa-science-solar-system')!.datasets).toEqual(['encyclopedia-celestial']);
  });
});

describe('elements (Gate E.2b, Los Alamos periodic table) and molecules (Gate E.2c, PubChem from ChEBI / NCIt)', () => {
  beforeAll(async () => { await loadEncyclopedia(); });
  it('loads 118 element entries, one per Z, each quoted from its LANL page with LANL’s notice', () => {
    const els = entriesIn('element');
    expect(els.map((e) => e.entity)).toEqual(Array.from({ length: 118 }, (_, i) => `element:${i + 1}`));
    for (const e of els) {
      expect(e.source).toBe('lanl-periodic-table');
      expect(e.url).toMatch(/^https:\/\/www\.lanl\.gov\/science-engineering\/periodic-table\/element\/[a-z]+$/);
      expect(e.license).toContain('provided that this Notice and any statement of authorship are reproduced on all copies');
      expect(e.sections.length).toBeGreaterThan(0);
      expect(e.sections.map((s) => s.heading)).not.toContain('Fun Facts');
      expect(getEntity(e.entity)?.route).toBe(`#/atomic/element/${e.entity.split(':')[1]}`);
      for (const s of e.sections) for (const p of s.paragraphs) expect(p).not.toMatch(/<[a-z]/i);
    }
    expect(getEntry('element-26')!.title).toBe('Iron');
    expect(getEntry('element-26')!.sections.flatMap((s) => s.paragraphs).join(' ')).toContain('Pure iron is very chemically reactive and rapidly corrodes, especially in moist air or high temperatures.');
  });
  it('loads molecule entries from openly licensed sources only, credited to the original source', () => {
    const mols = entriesIn('molecule');
    expect(mols.length).toBeGreaterThan(120);
    for (const e of mols) {
      expect(['chebi', 'nci-thesaurus']).toContain(e.source);
      expect(getSource(e.source)).toBeTruthy();
      expect(getEntity(e.entity)?.route).toBe(`#/atomic/molecules/${e.entity.split(':')[1]}`);
      expect(e.pageTitle).not.toMatch(/\batom$/i);           // PubChem mis-mappings to an atom are rejected
      if (e.source === 'chebi') expect(e.license).toContain('CC BY 4.0');
    }
    expect(entryForEntity('molecule:pubchem-962')!.sections[0].paragraphs[0]).toMatch(/^Water is an oxygen hydride/);
    expect(entryForEntity('molecule:pubchem-402')).toBeUndefined();   // hydrogen sulfide: only a “Sulfur atom” item, rejected
    expect(entryForEntity('molecule:pubchem-784')).toBeUndefined();   // hydrogen peroxide: only the class “Peroxides”, rejected
  });
  it('lists the new sources with their datasets', () => {
    expect(getSource('lanl-periodic-table')!.datasets).toEqual(['encyclopedia-elements']);
    expect(getSource('chebi')!.doi).toBe('10.1093/nar/gkaf1271');
  });
});
