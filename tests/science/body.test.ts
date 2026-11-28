/// <reference types="node" />
/**
 * Gate 12.1 — the human body model: the GLB holds every organ, sizes come from the full-resolution headers, and the
 * quoted facts are checked against what was read; the model's kidney is compared with SEER's quoted size.
 */
import { describe, expect, it } from 'vitest';
import { readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { ORGANS } from '@/modes/biologic/body/BodyView';
import { SOURCES } from '@/shared/sources/sources';
import data from '@datasets/biology/body.json';

const GLB = fileURLToPath(new URL('../../public/models/body-organs.glb', import.meta.url));
function glbNodes(path: string): string[] {
  const buf = readFileSync(path);
  expect(buf.readUInt32LE(0)).toBe(0x46546c67); // 'glTF'
  const jsonLen = buf.readUInt32LE(12);
  const json = JSON.parse(buf.subarray(20, 20 + jsonLen).toString('utf8'));
  return (json.nodes as { name: string }[]).map((n) => n.name);
}

describe('human body model (BodyParts3D 4.0)', () => {
  it('the GLB holds a node for each of the 11 organs and stays under 4 MB', () => {
    const names = glbNodes(GLB);
    for (const o of ORGANS) expect(names, o.id).toContain(o.id);
    expect(statSync(GLB).size).toBeLessThan(4 * 1024 * 1024);
  });
  it('the skeleton stands about 1.7 m tall (full-resolution bounds, z up)', () => {
    const z = ORGANS.find((o) => o.id === 'skeleton')!.model.extentMm[2];
    expect(z).toBeGreaterThan(1650); expect(z).toBeLessThan(1760);
  });
  it('model kidney ≈ 10.4 × 5.7 × 4.7 cm against SEER “approximately 3 cm thick, 6 cm wide, and 12 cm long” (shown side by side)', () => {
    const k = ORGANS.find((o) => o.id === 'right-kidney')!;
    const [a, b, c] = [...k.model.extentMm].sort((x, y) => y - x).map((x) => x / 10);
    expect(a).toBeCloseTo(10.4, 1); expect(b).toBeCloseTo(5.7, 1); expect(c).toBeCloseTo(4.7, 1);
    expect(k.facts[0].text).toBe('In the adult, each kidney is approximately 3 cm thick, 6 cm wide, and 12 cm long.');
  });
  it('organ volumes from the OBJ headers: heart 451, brain 1219, liver 1704, kidneys about 105 cm³', () => {
    const v = (id: string) => ORGANS.find((o) => o.id === id)!.model.volumeCm3;
    expect(v('heart')).toBeCloseTo(450.7, 1); expect(v('brain')).toBeCloseTo(1219.3, 1); expect(v('liver')).toBeCloseTo(1703.5, 1);
    expect(v('right-kidney')).toBeCloseTo(106.1, 1); expect(v('left-kidney')).toBeCloseTo(103.2, 1);
  });
  it('the lungs are marked as airways and vessels only', () => {
    for (const id of ['right-lung', 'left-lung']) expect(ORGANS.find((o) => o.id === id)!.note).toMatch(/bronchial tree/i);
  });
  it('facts: ten organ systems (SEER); every quote cites a Source-index entry', () => {
    const d = data as unknown as { systems: { list: string[] } };
    expect(d.systems.list).toHaveLength(10);
    for (const o of ORGANS) for (const f of o.facts) expect(SOURCES.some((s) => s.id === f.source), `${o.id} ${f.source}`).toBe(true);
    expect(ORGANS.find((o) => o.id === 'skeleton')!.facts[0].text).toContain('206 named bones');
  });
});
