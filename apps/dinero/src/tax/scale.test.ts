import { describe, expect, it } from 'vite-plus/test';

import { applyScale, combineScales, quotaAfterMinimum, rateAt, rescale, type Scale } from './scale';

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

describe('rateAt', () => {
  it('returns the rate of the bracket holding the last euro', () => {
    expect(rateAt(scale, 0)).toBe(10);
    expect(rateAt(scale, 10_000)).toBe(10);
    expect(rateAt(scale, 10_001)).toBe(20);
    expect(rateAt(scale, 1e9)).toBe(30);
  });
});

describe('combineScales', () => {
  it('taxes like the sum of its parts', () => {
    const other: Scale = [
      { from: 0, quota: 0, rate: 5 },
      { from: 15_000, quota: 750, rate: 15 },
    ];
    const combined = combineScales(scale, other);
    expect(combined.map((bracket) => bracket.from)).toEqual([0, 10_000, 15_000, 30_000]);
    expect(combined.map((bracket) => bracket.rate)).toEqual([15, 25, 35, 45]);
    for (const base of [0, 7_000, 12_000, 22_000, 80_000]) {
      expect(applyScale(combined, base)).toBeCloseTo(
        applyScale(scale, base) + applyScale(other, base),
      );
    }
  });
});

describe('rescale', () => {
  it('multiplies amounts and keeps rates', () => {
    const doubled = rescale(scale, 2);
    expect(doubled[1]).toEqual({ from: 20_000, quota: 2_000, rate: 20 });
    expect(applyScale(doubled, 40_000)).toBeCloseTo(2 * applyScale(scale, 20_000));
  });
});
