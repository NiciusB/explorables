import { describe, expect, it } from 'vite-plus/test';

import {
  basqueBonification,
  basqueIrpf,
  navarraDescendantIncrease,
  navarraIrpf,
  navarraLowIncomeDeduction,
  navarraWorkDeduction,
} from './foral';
import { basqueRules, BASQUE_TERRITORIES, navarraRules } from './foral2026';
import { applyScale } from './scale';
import { DEFAULT_SITUATION } from './situation';

describe('foral scales', () => {
  it.each([
    ['Basque', basqueRules.bizkaia.scale],
    ['Navarra', navarraRules.scale],
  ])('transcribes the %s scale consistently', (_, scale) => {
    const mismatches = scale.filter(
      (bracket) => Math.abs(applyScale(scale, bracket.from) - bracket.quota) >= 0.011,
    );
    expect(mismatches).toEqual([]);
  });
});

describe('basqueBonification', () => {
  const rules = basqueRules.gipuzkoa;

  it('follows art. 23 and joins its taper continuously', () => {
    expect(basqueBonification(10_000, DEFAULT_SITUATION, rules)).toBe(8000);
    expect(basqueBonification(20_000, DEFAULT_SITUATION, rules)).toBeCloseTo(8000 - 0.6098 * 5200);
    // 8,000 − 0.6098 × 8,200 rounds to the 3,000 floor.
    expect(basqueBonification(23_000, DEFAULT_SITUATION, rules)).toBeCloseTo(3000, 0);
    expect(basqueBonification(40_000, DEFAULT_SITUATION, rules)).toBe(3000);
  });

  it('increases for workers with a disability', () => {
    expect(
      basqueBonification(40_000, { ...DEFAULT_SITUATION, disability: 'moderate' }, rules),
    ).toBe(6000);
    expect(basqueBonification(40_000, { ...DEFAULT_SITUATION, disability: 'severe' }, rules)).toBe(
      10_500,
    );
  });
});

describe('basqueIrpf', () => {
  it('computes a 30,000 € salary in Bizkaia step by step', () => {
    // 30,000 − 1,950 SS − 3,000 bonification = 25,050; 4,158.40 + 28% × 6,970; − 1,615.
    const result = basqueIrpf(30_000, 'bizkaia', DEFAULT_SITUATION);
    expect(result.socialSecurity).toBeCloseTo(1950);
    expect(result.irpf).toBeCloseTo(4158.4 + 0.28 * 6970 - 1615);
  });

  it('applies family deductions, halved when shared', () => {
    const single = basqueIrpf(40_000, 'gipuzkoa', DEFAULT_SITUATION).irpf;
    const twoKids = { ...DEFAULT_SITUATION, children: 2, childrenUnder6: 1 };
    expect(single - basqueIrpf(40_000, 'gipuzkoa', twoKids).irpf).toBeCloseTo(
      (682 + 844 + 394) / 2,
    );
    expect(
      single - basqueIrpf(40_000, 'gipuzkoa', { ...twoKids, childrenShared: false }).irpf,
    ).toBeCloseTo(682 + 844 + 394);
  });

  it('uses Álava’s own family amounts', () => {
    const parent = { ...DEFAULT_SITUATION, children: 1, childrenShared: false };
    const gap = (territory: 'alava' | 'bizkaia') =>
      basqueIrpf(40_000, territory, DEFAULT_SITUATION).irpf -
      basqueIrpf(40_000, territory, parent).irpf;
    expect(gap('alava')).toBeCloseTo(734.8);
    expect(gap('bizkaia')).toBeCloseTo(682);
  });

  it('tapers the age deduction between bases of 20,000 € and 30,000 €', () => {
    const over65 = { ...DEFAULT_SITUATION, age: '65to74' as const };
    // Base 25,050 (see above): 393 − 0.0393 × 5,050.
    expect(
      basqueIrpf(30_000, 'bizkaia', DEFAULT_SITUATION).irpf -
        basqueIrpf(30_000, 'bizkaia', over65).irpf,
    ).toBeCloseTo(393 - 0.0393 * 5050);
  });

  it.each(BASQUE_TERRITORIES)('never goes negative in %s', (territory) => {
    expect(basqueIrpf(12_000, territory, DEFAULT_SITUATION).irpf).toBe(0);
  });
});

describe('navarra deductions', () => {
  it('follows the 2026 work deduction (art. 62.5)', () => {
    expect(navarraWorkDeduction(12_000, DEFAULT_SITUATION)).toBe(1400);
    expect(navarraWorkDeduction(15_000, DEFAULT_SITUATION)).toBeCloseTo(1400 - 0.14 * 2500);
    expect(navarraWorkDeduction(17_500, DEFAULT_SITUATION)).toBeCloseTo(700);
    expect(navarraWorkDeduction(30_000, DEFAULT_SITUATION)).toBe(700);
    expect(navarraWorkDeduction(40_000, DEFAULT_SITUATION)).toBeCloseTo(600);
    expect(navarraWorkDeduction(60_000, DEFAULT_SITUATION)).toBe(400);
    expect(navarraWorkDeduction(60_000, { ...DEFAULT_SITUATION, disability: 'severe' })).toBe(800);
  });

  it('joins the low-income personal deduction continuously (art. 62.9.a)', () => {
    expect(navarraLowIncomeDeduction(17_500)).toBe(1280);
    expect(navarraLowIncomeDeduction(30_000)).toBeCloseTo(150);
    expect(navarraLowIncomeDeduction(31_000)).toBeCloseTo(75);
    expect(navarraLowIncomeDeduction(32_000)).toBeCloseTo(0);
    expect(navarraLowIncomeDeduction(40_000)).toBe(0);
  });

  it('raises the descendant deduction for low income (art. 62.9.b)', () => {
    expect(navarraDescendantIncrease(15_000)).toBe(0.4);
    expect(navarraDescendantIncrease(25_000)).toBeCloseTo(0.275);
    expect(navarraDescendantIncrease(30_000)).toBeCloseTo(0.15);
    expect(navarraDescendantIncrease(30_001)).toBe(0);
  });
});

describe('navarraIrpf', () => {
  it('computes a 30,000 € salary step by step', () => {
    // Net work income 28,050: 4,591.63 + 28% × 6,875; minus work (700) and personal deductions.
    const personal = 1084 + 1280 - 0.0904 * (28_050 - 17_500);
    expect(navarraIrpf(30_000, DEFAULT_SITUATION).irpf).toBeCloseTo(
      4591.63 + 0.28 * 6875 - 700 - personal,
    );
  });

  it('applies the unshared low-income increase on top of shared family deductions', () => {
    const single = navarraIrpf(20_000, DEFAULT_SITUATION).irpf;
    const parent = navarraIrpf(20_000, {
      ...DEFAULT_SITUATION,
      children: 1,
      childrenUnder3: 1,
    }).irpf;
    // Net work income 18,700 ≤ 20,000, so the full 40% increase applies to the parent's half.
    expect(single - parent).toBeCloseTo(((483 + 644) / 2) * 1.4);
  });

  it('never goes negative', () => {
    expect(navarraIrpf(14_000, DEFAULT_SITUATION).irpf).toBe(0);
  });
});
