import { describe, expect, it } from 'vite-plus/test';

import { rentalBreakdown } from './rental';
import { COMMON_REGIONS } from './rules2026';
import { DEFAULT_SITUATION } from './situation';

describe('rental example', () => {
  it('separates cash costs from tax depreciation and the residential reduction', () => {
    const result = rentalBreakdown(3, 'madrid', DEFAULT_SITUATION);
    expect(result.gross).toBe(36_000);
    expect(result.expenses).toBe(9000);
    expect(result.cashBeforeTax).toBe(27_000);
    expect(result.depreciation).toBe(9000);
    expect(result.taxableBase).toBe(9000); // (36,000 - 9,000 - 9,000) × 50%.
    // State: (9,000 - 5,550) × 9.5%; Madrid: (9,000 - 5,956.65) × 8.5%.
    expect(result.irpf).toBeCloseTo(586.43475);
    expect(result.net).toBeCloseTo(26_413.56525);
    expect(result.net + result.expenses + result.irpf).toBeCloseTo(result.gross);
  });

  it('scales receipts and fixed costs with the number of flats, but taxes progressively', () => {
    const one = rentalBreakdown(1, 'madrid', DEFAULT_SITUATION);
    const twenty = rentalBreakdown(20, 'madrid', DEFAULT_SITUATION);
    expect(one.gross).toBe(12_000);
    expect(one.expenses).toBe(3000);
    expect(one.depreciation).toBe(3000);
    expect(one.irpf).toBe(0);
    expect(one.net).toBe(9000);
    expect(twenty.gross).toBe(one.gross * 20);
    expect(twenty.expenses).toBe(one.expenses * 20);
    expect(twenty.irpf).toBeGreaterThan(0);
  });

  it('uses regional scales and personal minimums, without salary deductions or contributions', () => {
    const madrid = rentalBreakdown(3, 'madrid', DEFAULT_SITUATION);
    const reference = rentalBreakdown(3, 'castilla-la-mancha', DEFAULT_SITUATION);
    expect(reference.irpf).toBeCloseTo((9000 - 5550) * 0.19);
    expect(reference.irpf).toBeGreaterThan(madrid.irpf);
    const family = rentalBreakdown(3, 'madrid', {
      ...DEFAULT_SITUATION,
      children: 3,
      childrenShared: false,
    });
    expect(family.irpf).toBe(0);
    for (const region of COMMON_REGIONS) {
      const result = rentalBreakdown(3, region, DEFAULT_SITUATION);
      expect(result.irpf).toBeGreaterThanOrEqual(0);
      expect(result.net + result.expenses + result.irpf).toBeCloseTo(36_000);
    }
  });
});
