import { describe, expect, it } from 'vite-plus/test';

import { applyScale } from './scale';
import {
  commonRegionFor,
  compareSameAmount,
  nextEuros,
  REFERENCE_REGION,
  savingsHalfScale,
  savingsTax,
} from './savings';
import { DEFAULT_SITUATION } from './situation';

describe('savings scale', () => {
  it('matches its published quotas and doubles to 19% … 30%', () => {
    for (const bracket of savingsHalfScale) {
      expect(applyScale(savingsHalfScale, bracket.from)).toBeCloseTo(bracket.quota);
    }
    expect(savingsHalfScale.map((bracket) => bracket.rate * 2)).toEqual([19, 21, 23, 27, 30]);
  });
});

describe('savingsTax', () => {
  it('exempts the personal minimum', () => {
    expect(savingsTax(5000, 'castilla-la-mancha', DEFAULT_SITUATION)).toBe(0);
    // 30,000 € minus the 5,550 € minimum: 450 € at 19% and 23,550 € at 21%… roughly.
    const tax = savingsTax(30_000, 'castilla-la-mancha', DEFAULT_SITUATION);
    expect(tax).toBeCloseTo(applyScale(savingsHalfScale, 30_000) * 2 - 5550 * 0.19, 0);
  });
});

describe('compareSameAmount', () => {
  it('taxes 30,000 € of salary harder than 30,000 € of capital gains', () => {
    const same = compareSameAmount(30_000, 'madrid', DEFAULT_SITUATION);
    expect(same.salaryTax).toBeGreaterThan(same.savingsTax);
  });

  it('taxes a low salary less than the same savings income', () => {
    // Work reductions zero the IRPF on 15,000 € of salary; only Social Security remains.
    const same = compareSameAmount(15_000, 'madrid', DEFAULT_SITUATION);
    expect(same.salaryTax).toBeLessThan(same.savingsTax);
  });
});

describe('nextEuros', () => {
  it('starts extra savings at 19% once the salary uses up the minimum', () => {
    const next = nextEuros(40_000, 1000, 'madrid', DEFAULT_SITUATION);
    expect(next.asSavings).toBeCloseTo(190);
    expect(next.asSalary).toBeGreaterThan(next.asSavings);
  });

  it('leaves the unused minimum for savings when the salary is tiny', () => {
    expect(nextEuros(0, 1000, 'madrid', DEFAULT_SITUATION).asSavings).toBe(0);
  });
});

describe('commonRegionFor', () => {
  it('keeps common regions and replaces foral ones', () => {
    expect(commonRegionFor('galicia')).toBe('galicia');
    expect(commonRegionFor('navarra')).toBe(REFERENCE_REGION);
  });
});
