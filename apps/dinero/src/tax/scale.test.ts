import { describe, expect, it } from 'vite-plus/test';

import { applyScale, quotaAfterMinimum, type Scale } from './scale';

const scale: Scale = [
  { from: 0, quota: 0, rate: 10 },
  { from: 10_000, quota: 1_000, rate: 20 },
  { from: 30_000, quota: 5_000, rate: 30 },
];

describe('applyScale', () => {
  it('is zero for a zero or negative base', () => {
    expect(applyScale(scale, 0)).toBe(0);
    expect(applyScale(scale, -5)).toBe(0);
  });

  it('taxes each slice of the base at its own rate', () => {
    expect(applyScale(scale, 5_000)).toBeCloseTo(500);
    expect(applyScale(scale, 20_000)).toBeCloseTo(3_000);
    expect(applyScale(scale, 40_000)).toBeCloseTo(8_000);
  });

  it('matches the published cumulative quota at every row', () => {
    for (const bracket of scale) {
      expect(applyScale(scale, bracket.from)).toBeCloseTo(bracket.quota);
    }
  });
});

describe('quotaAfterMinimum', () => {
  it('exempts the minimum at the lowest rates', () => {
    // 20,000 taxed is 3,000; the first 5,000 (at 10%) is exempt.
    expect(quotaAfterMinimum(scale, 20_000, 5_000)).toBeCloseTo(2_500);
  });

  it('is zero when the minimum covers the whole base', () => {
    expect(quotaAfterMinimum(scale, 4_000, 5_000)).toBe(0);
  });
});
