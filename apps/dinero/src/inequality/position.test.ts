import { describe, expect, it } from 'vite-plus/test';

import { GINI, GINI_FIRST_YEAR, SALARY_DECILES, TOP_SHARES } from './data';
import {
  communityOf,
  consumptionUnits,
  decileOf,
  householdPercentile,
  percentileFromLimits,
  realDecileSalaries,
  salaryPercentile,
  wealthShares,
} from './position';

const limits = [100, 200, 300, 400, 500, 600, 700, 800, 900];

describe('percentileFromLimits', () => {
  it('interpolates between decile limits', () => {
    expect(percentileFromLimits(0, limits)).toBe(0);
    expect(percentileFromLimits(50, limits)).toBe(5);
    expect(percentileFromLimits(100, limits)).toBe(10);
    expect(percentileFromLimits(250, limits)).toBe(25);
    expect(percentileFromLimits(899, limits)).toBeCloseTo(89.9);
  });

  it('caps at 90 inside the open top decile', () => {
    expect(percentileFromLimits(5000, limits)).toBe(90);
  });
});

describe('decileOf', () => {
  it('maps percentiles to deciles 1 to 10', () => {
    expect(decileOf(0)).toBe(1);
    expect(decileOf(9.9)).toBe(1);
    expect(decileOf(10)).toBe(2);
    expect(decileOf(90)).toBe(10);
    expect(decileOf(100)).toBe(10);
  });
});

describe('salaryPercentile', () => {
  it('puts the 2024 median wage at the 50th percentile', () => {
    // Decile 6 starts at 2,001.4 € a month in 2024: half of wage earners are below.
    expect(salaryPercentile(2001.4 * 12, 2024)).toBeCloseTo(50);
  });

  it('places 30,000 € a year in the seventh decile', () => {
    expect(decileOf(salaryPercentile(30_000, 2024))).toBe(7);
  });
});

describe('realDecileSalaries', () => {
  it('lifts older salaries by inflation', () => {
    const real2006 = realDecileSalaries(2006);
    const nominal2006 = (SALARY_DECILES[2006]?.mean[4] ?? 0) * 12;
    expect(real2006).toHaveLength(10);
    expect(real2006[4]).toBeGreaterThan(nominal2006 * 1.4);
  });
});

describe('households', () => {
  it('weights extra adults by 0.5 and children by 0.3', () => {
    expect(consumptionUnits(1, 0)).toBe(1);
    expect(consumptionUnits(2, 2)).toBeCloseTo(2.1);
  });

  it('splits one income across a bigger household', () => {
    const alone = householdPercentile(25_000, 1, 0);
    const family = householdPercentile(25_000, 2, 2);
    expect(alone).toBeGreaterThan(family);
    expect(decileOf(alone)).toBe(7);
  });
});

describe('wealthShares', () => {
  it('gives the richest tenth more than half of all wealth', () => {
    const shares = wealthShares();
    const total = shares.reduce((sum, group) => sum + group.share, 0);
    expect(total).toBeCloseTo(1, 2);
    expect(shares.at(-1)?.share).toBeCloseTo(0.528, 3);
  });
});

describe('data', () => {
  it('has one Gini value per survey year in every series', () => {
    for (const series of Object.values(GINI)) {
      expect(series).toHaveLength(2025 - GINI_FIRST_YEAR + 1);
    }
  });

  it('lists top shares in order with the top 1% inside the top 10%', () => {
    for (const [index, point] of TOP_SHARES.entries()) {
      expect(point.top1).toBeLessThan(point.top10);
      expect(point.year).toBeGreaterThan(TOP_SHARES[index - 1]?.year ?? 0);
    }
  });

  it('maps the Basque territories to one community', () => {
    expect(communityOf('bizkaia')).toBe('pais-vasco');
    expect(communityOf('madrid')).toBe('madrid');
  });
});
