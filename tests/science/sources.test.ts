/**
 * Source-index integrity: every dataset and every cited record maps to an indexed source with a
 * link; ids are unique; author notes are either present or explicitly null (never empty strings).
 */
import { describe, expect, it } from 'vitest';
import { SOURCES, getSource, sourcesForDataset } from '@/shared/sources/sources';
import { REACTIONS } from '@/modes/atomic/reactions/library';

const MANIFESTS = import.meta.glob<{ dataset: string }>('../../datasets/manifests/*.manifest.json', { eager: true, import: 'default' });

describe('source index', () => {
  it('ids are unique and every entry has a citation, an https link and an institution', () => {
    expect(new Set(SOURCES.map((s) => s.id)).size).toBe(SOURCES.length);
    for (const s of SOURCES) {
      expect(s.citation.length, s.id).toBeGreaterThan(20);
      expect(s.url, s.id).toMatch(/^https:\/\//);
      expect(s.institution.length, s.id).toBeGreaterThan(3);
      expect(s.usedFor.length, s.id).toBeGreaterThan(0);
      if (s.authorBio !== null) expect(s.authorBio.length, s.id).toBeGreaterThan(20);
      if (s.doi) expect(s.doi, s.id).toMatch(/^10\.\d{4,}\//);
    }
  });
  it('every dataset manifest is covered by at least one indexed source', () => {
    expect(Object.keys(MANIFESTS).length).toBeGreaterThan(10);
    for (const m of Object.values(MANIFESTS)) {
      expect(sourcesForDataset(m.dataset).length, `no source-index entry for dataset “${m.dataset}”`).toBeGreaterThan(0);
    }
  });
  it('every curated reaction cites at least one indexed source', () => {
    for (const r of REACTIONS) {
      expect(r.sources.length, r.id).toBeGreaterThan(0);
      for (const id of r.sources) expect(getSource(id), `${r.id} → ${id}`).toBeDefined();
    }
  });
});
