/**
 * Gates 12.2–12.3 — Hill, Poiseuille, the heart and NHLBI's blood-pressure categories.
 */
import { describe, expect, it } from 'vitest';
import { classifyBloodPressure, cycleSeconds, hillInvariant, hillOptimalLoad, hillPower, hillVelocity, poiseuilleRatio, strokeVolumeMl } from '@/core/biology/physiology';
import data from '@datasets/biology/physiology.json';

const D = data as unknown as { muscle: { hill: { aOverP0: number; bOverL: number } }; poiseuille: { tubes: [string, number][]; printedMean: number; water: { k: number } }; blood: { distribution: { share: number }[] }; bones: { divisions: { axial: number; appendicular: number; total: number } } };

describe('Hill (1938)', () => {
  const { aOverP0: k, bOverL: b } = D.muscle.hill;
  it('eq. (2): (P + a)(v + b) is the same constant (P₀ + a)b at every load', () => {
    for (const p of [0, 0.1, 0.3, 0.7, 0.99]) expect(hillInvariant(p, k, b)).toBeCloseTo((1 + k) * b, 12);
  });
  it('v = 0 at P = P₀ (isometric) and v = b/a·P₀ unloaded: 1.32 lengths/s for frog sartorius at 0 °C', () => {
    expect(hillVelocity(1, k, b)).toBe(0);
    expect(hillVelocity(0, k, b)).toBeCloseTo(1.32, 12);
  });
  it('power is greatest at P/P₀ = √(k² + k) − k = 0.309 for a/P₀ = 0.25', () => {
    const pOpt = hillOptimalLoad(k);
    expect(pOpt).toBeCloseTo(0.309, 3);
    for (const d of [-0.05, 0.05]) expect(hillPower(pOpt + d, k, b)).toBeLessThan(hillPower(pOpt, k, b));
  });
});

describe('Poiseuille (1840)', () => {
  it('doubling the diameter passes sixteen times as much liquid', () => {
    expect(poiseuilleRatio(2, 1)).toBe(16);
  });
  it('the mean of his seven printed k″ is 2495.37, not the printed 2495,224 (both kept); mercury/water coefficient ratio 13.58', () => {
    const p = D.poiseuille, mean = p.tubes.reduce((a, [, x]) => a + x, 0) / p.tubes.length;
    expect(mean).toBeCloseTo(2495.366, 3);
    expect(p.printedMean).toBe(2495.224);
    expect(p.printedMean / p.water.k).toBeCloseTo(13.577, 3);
  });
});

describe('heart, blood and bones', () => {
  it('75 beats a minute gives SEER’s 0.8 s cycle; 5 L/min at 75 /min implies a 66.7 mL stroke volume (derived)', () => {
    expect(cycleSeconds(75)).toBeCloseTo(0.8, 12);
    expect(strokeVolumeMl(5, 75)).toBeCloseTo(66.67, 2);
  });
  it('NHLBI categories as printed, most severe first, with their AND/OR rules', () => {
    expect(classifyBloodPressure(118, 76)).toBe('normal');
    expect(classifyBloodPressure(125, 79)).toBe('elevated');
    expect(classifyBloodPressure(125, 80)).toBe('stage1');   // OR: diastolic 80–89
    expect(classifyBloodPressure(135, 70)).toBe('stage1');
    expect(classifyBloodPressure(140, 70)).toBe('stage2');
    expect(classifyBloodPressure(118, 95)).toBe('stage2');
    expect(classifyBloodPressure(180, 100)).toBe('stage2');  // “Higher than 180”
    expect(classifyBloodPressure(181, 100)).toBe('crisis');
    expect(classifyBloodPressure(150, 121)).toBe('crisis');
  });
  it('SEER: 80 + 126 = 206 bones; blood shares sum to 95 % (the rest unassigned)', () => {
    const d = D.bones.divisions;
    expect(d.axial + d.appendicular).toBe(d.total);
    expect(D.blood.distribution.reduce((a, x) => a + x.share, 0)).toBeCloseTo(0.95, 12);
  });
});
