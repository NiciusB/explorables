import { describe, expect, it } from 'vite-plus/test';

import { commonIrpf, minimumWageDeduction, workReduction } from './irpf';
import { COMMON_REGIONS } from './rules2026';
import { DEFAULT_SITUATION } from './situation';

describe('workReduction', () => {
  it('follows art. 20 LIRPF', () => {
    expect(workReduction(10_000)).toBe(7302);
    expect(workReduction(16_000)).toBeCloseTo(7302 - 1.75 * (16_000 - 14_852));
    expect(workReduction(18_000)).toBeCloseTo(2364.34 - 1.14 * (18_000 - 17_673.52));
    expect(workReduction(19_747.5)).toBe(0);
  });
});

describe('minimumWageDeduction', () => {
  it('follows DA 61.ª LIRPF', () => {
    expect(minimumWageDeduction(17_094)).toBe(590.89);
    expect(minimumWageDeduction(18_000)).toBeCloseTo(590.89 - 0.2 * 906);
    expect(minimumWageDeduction(20_048.45)).toBe(0);
  });
});

describe('commonIrpf', () => {
  it('computes a 30,000 € salary in Madrid step by step', () => {
    const result = commonIrpf(30_000, 'madrid', DEFAULT_SITUATION);

    expect(result.socialSecurity).toBeCloseTo(1950);
    expect(result.workReduction).toBe(0);
    expect(result.taxableBase).toBeCloseTo(26_050); // 30,000 − 1,950 − 2,000
    // State: 2,112.75 + 15% × 5,850 − 9.5% × 5,550.
    expect(result.stateQuota).toBeCloseTo(2990.25 - 527.25);
    // Madrid: 1,739.53 + 12.8% × 7,045.37 − 8.5% × 5,956.65.
    expect(result.regionalQuota).toBeCloseTo(1739.53 + 0.128 * 7045.37 - 0.085 * 5956.65, 1);
    expect(result.minimumWageDeduction).toBe(0);
    expect(result.irpf).toBeCloseTo(result.stateQuota + result.regionalQuota);
    expect(result.net).toBeCloseTo(30_000 - 1950 - result.irpf);
  });

  it.each(COMMON_REGIONS)('leaves a 17,000 € salary IRPF-free in %s', (region) => {
    // The 2026 minimum wage deduction was sized so that minimum wage earners pay nothing.
    expect(commonIrpf(17_000, region, DEFAULT_SITUATION).irpf).toBeCloseTo(0);
  });

  it('charges more IRPF in a region with a higher scale', () => {
    const valencia = commonIrpf(100_000, 'valencia', DEFAULT_SITUATION).irpf;
    const madrid = commonIrpf(100_000, 'madrid', DEFAULT_SITUATION).irpf;
    expect(valencia).toBeGreaterThan(madrid);
  });

  it('charges less with children and with a disability', () => {
    const single = commonIrpf(40_000, 'galicia', DEFAULT_SITUATION).irpf;
    const parent = commonIrpf(40_000, 'galicia', { ...DEFAULT_SITUATION, children: 2 }).irpf;
    const disabled = commonIrpf(40_000, 'galicia', {
      ...DEFAULT_SITUATION,
      disability: 'severe',
    }).irpf;
    expect(parent).toBeLessThan(single);
    expect(disabled).toBeLessThan(parent);
  });

  it('never returns negative tax or a negative base', () => {
    const result = commonIrpf(1_000, 'canarias', { ...DEFAULT_SITUATION, disability: 'severe' });
    expect(result.taxableBase).toBe(0);
    expect(result.irpf).toBe(0);
  });
});
