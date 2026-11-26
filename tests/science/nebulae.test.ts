/**
 * Phase 6, Gate 6.5 — nebulae and the licensed image gallery: image integrity (files, sizes, SHA-256),
 * licences and credits, nebula records, emission-line links to the bundled NIST spectra, registry edges.
 */
import { describe, expect, it } from 'vitest';
import nist from '@datasets/atomic/spectra-nist.json';
import { GALLERY, NEBULAE, distanceText } from '@/modes/cosmic/nebulae/nebulae';
import { getSource } from '@/shared/sources/sources';
import { getEntity, relationshipsFrom } from '@/shared/scientific-relationships/registry';

// the stored files, inlined by Vite as base64 data URLs (keeps the test free of Node-only modules)
const FILES = import.meta.glob<string>('../../public/images/gallery/*.jpg', { query: '?inline', import: 'default', eager: true });
const bytesOf = (path: string) => { const url = FILES[`../../public${path}`]; const bin = atob(url.slice(url.indexOf(',') + 1)); return Uint8Array.from(bin, (c) => c.charCodeAt(0)); };
const hex = (b: ArrayBuffer) => [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, '0')).join('');
const SPECTRA = (nist as unknown as { spectra: Record<string, { lines: { wl: number; type: string }[] }> }).spectra;

describe('gallery images', () => {
  it('every image is stored, unaltered (size and SHA-256 match the manifest record) and small', async () => {
    expect(GALLERY.length).toBe(7);
    expect(Object.keys(FILES).length).toBe(7);
    for (const g of GALLERY) {
      const buf = bytesOf(g.path);
      expect(buf.length, g.id).toBe(g.bytes);
      expect(hex(await crypto.subtle.digest('SHA-256', buf)), g.id).toBe(g.sha256);
      expect(hex(buf.slice(0, 3).buffer), `${g.id} is a JPEG`).toBe('ffd8ff');
      expect(buf.length).toBeLessThan(300 * 1024);
    }
  });
  it('every image has a CC BY 4.0 licence, a verbatim credit line and a page on its publisher’s site', () => {
    const host = { 'ESA/Hubble': 'https://esahubble.org/', 'ESA/Webb': 'https://esawebb.org/', ESO: 'https://www.eso.org/' };
    for (const g of GALLERY) {
      expect(g.licence.name).toBe('CC BY 4.0');
      expect(g.credit.length).toBeGreaterThan(10);
      expect(g.page.startsWith(host[g.publisher]), g.id).toBe(true);
    }
    expect(GALLERY.filter((g) => g.publisher === 'ESA/Webb').length).toBeGreaterThan(0); // at least one JWST image
  });
});

describe('nebula records', () => {
  it('each nebula has a gallery image and indexed sources', () => {
    for (const n of NEBULAE) {
      expect(GALLERY.find((g) => g.id === n.image), n.id).toBeDefined();
      for (const id of [n.typeSource, n.distance?.source, ...n.lines.map((l) => l.source), ...n.notes.map((x) => x.source)]) if (id) expect(getSource(id), `${n.id} → ${id}`).toBeDefined();
    }
  });
  it('Orion: 414 ± 7 pc (Menten et al.) ≈ 1350 ly; approximate distances are marked', () => {
    expect(distanceText(NEBULAE.find((n) => n.id === 'orion')!)).toBe('414 ± 7 pc (1350 ly)');
    expect(distanceText(NEBULAE.find((n) => n.id === 'ring')!)).toMatch(/^≈ 2,000 ly/);
  });
  it('linked emission lines exist in the bundled NIST spectra: Hα 656.45, [N II] 658.53 and [O III] 500.82 nm (vacuum)', () => {
    const has = (spec: string, wl: number, forbidden: boolean) => SPECTRA[spec].lines.some((l) => Math.abs(l.wl - wl) < 0.01 && (!forbidden || l.type === 'M1'));
    expect(has('H I', 656.4523, false)).toBe(true);
    expect(has('N II', 658.527, true)).toBe(true);
    expect(has('O III', 500.824, true)).toBe(true);
    for (const n of NEBULAE) for (const l of n.lines) expect(SPECTRA[l.spectrum], l.spectrum).toBeDefined();
  });
});

describe('registry', () => {
  it('nebulae emit their spectra and lie in the Milky Way; the atlas sees the reverse links', () => {
    expect(getEntity('nebula:orion')?.route).toBe('#/cosmic/nebulae?sel=orion');
    const out = relationshipsFrom('nebula:ring');
    expect(out.filter((r) => r.type === 'emits').map((r) => r.to).sort()).toEqual(['spectrum:N-II', 'spectrum:O-III']);
    expect(out.some((r) => r.type === 'located-in' && r.to === 'galaxy:milky-way')).toBe(true);
    expect(relationshipsFrom('nebula:orion').some((r) => r.to === 'spectrum:H-I' && r.type === 'emits')).toBe(true);
  });
});
