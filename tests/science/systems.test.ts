/**
 * Gates 12.5–12.6 — organ-system arithmetic with NIST SP 811 factors, and the transcription.
 */
import { describe, expect, it } from 'vitest';
import { KIDNEY, lpdToMlpm } from '@/modes/biologic/systems/SystemsView';
import data from '@datasets/biology/systems.json';

const D = data as unknown as { units: { quartL: number; cupL: number; poundKg: number }; skin: { organ: { pounds: number } }; reproductive: { oocytesBirth: { count: number }; oocytesPuberty: { count: number } }; urinary: { gfr: { lines: { quote: string }[] } } };

describe('organ systems', () => {
  it('NIST SP 811 factors: quart 0.9463529 L, cup 0.2365882 L (4 cups = 1 quart to 7 digits), pound 0.4535924 kg', () => {
    expect(D.units.quartL).toBe(0.9463529); expect(D.units.cupL).toBe(0.2365882); expect(D.units.poundKg).toBe(0.4535924);
    expect(4 * D.units.cupL).toBeCloseTo(D.units.quartL, 6);
  });
  it('NIDDK: 150 quarts a day = 98.6 mL/min, half a cup a minute = 118.3 mL/min (same order, 20 % apart)', () => {
    expect(KIDNEY.filteredMlPerMin).toBeCloseTo(98.58, 1);
    expect(KIDNEY.halfCupMlPerMin).toBeCloseTo(118.29, 1);
    expect(KIDNEY.halfCupMlPerMin / KIDNEY.filteredMlPerMin).toBeCloseTo(1.2, 1);
    expect(lpdToMlpm(1.44)).toBeCloseTo(1, 12);
  });
  it('1 to 2 of 150 quarts become urine: 0.67–1.3 %', () => {
    expect(KIDNEY.urineFraction[0]).toBeCloseTo(0.00667, 4); expect(KIDNEY.urineFraction[1]).toBeCloseTo(0.01333, 4);
  });
  it('six pounds of skin is 2.72 kg; oocytes fall 43 % from birth to puberty', () => {
    expect(D.skin.organ.pounds * D.units.poundKg).toBeCloseTo(2.722, 3);
    expect(1 - D.reproductive.oocytesPuberty.count / D.reproductive.oocytesBirth.count).toBeCloseTo(0.4286, 4);
  });
  it('GFR lines as NIDDK prints them', () => {
    expect(D.urinary.gfr.lines.map((l) => l.quote)).toEqual(['a GFR of 60 or more is in the normal range.', 'a GFR of less than 60 may mean you have kidney disease.', 'a GFR of 15 or less is called kidney failure.']);
  });
});
