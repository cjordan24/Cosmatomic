/** Phase 26 — every reference check on #/meteorology/validation passes (agreements agree; recorded findings still disagree). */
import { describe, expect, it } from 'vitest';
import { CHECKS, run } from '@/modes/meteorology/validation/checks';
import { getSource } from '@/shared/sources/sources';

describe('Meteorology reference checks', () => {
  it('ids are unique and every check cites indexed sources', () => {
    expect(new Set(CHECKS.map((c) => c.id)).size).toBe(CHECKS.length);
    for (const c of CHECKS) for (const s of c.sources) expect(getSource(s), `${c.id} → ${s}`).toBeDefined();
  });
  it.each(CHECKS.map((c) => [c.id, c] as const))('%s', (_id, c) => {
    const r = run(c);
    expect(Number.isFinite(r.value)).toBe(true);
    expect(r.ok, `${c.what}: app ${r.value} vs printed ${c.printed} (${c.expect})`).toBe(true);
  });
});
