import { describe, expect, it } from 'vite-plus/test';

import { findHump, marginalRate, untaxedAmount } from './salaryStory';
import type { Step } from './tax/marginal';

/** Builds steps from [from, to, irpf rate] with no Social Security. */
const steps = (rows: readonly (readonly [number, number, number])[]): Step[] =>
  rows.map(([from, to, rate]) => ({ from, to, socialSecurity: 0, irpf: (to - from) * rate }));

const withHump = steps([
  [0, 17_000, 0],
  [17_000, 19_000, 0.7],
  [19_000, 21_000, 0.45],
  [21_000, 25_000, 0.21],
  [25_000, 30_000, 0.26],
]);

describe('salary story', () => {
  it('measures the untaxed opening stretch', () => {
    expect(untaxedAmount(withHump)).toBe(17_000);
    expect(untaxedAmount(steps([[0, 10_000, 0.1]]))).toBe(0);
    expect(untaxedAmount([])).toBe(0);
  });

  it('reads the marginal rate from the last step', () => {
    expect(marginalRate(withHump)).toBeCloseTo(0.26);
    expect(marginalRate([])).toBe(0);
  });

  it('finds the run of steps well above the marginal rate', () => {
    const hump = findHump(withHump);
    expect(hump?.from).toBe(17_000);
    expect(hump?.to).toBe(21_000);
    expect(hump?.peakRate).toBeCloseTo(0.7);
  });

  it('finds no hump when the last euros pay the most', () => {
    expect(
      findHump(
        steps([
          [0, 10_000, 0],
          [10_000, 18_000, 0.66],
        ]),
      ),
    ).toBeUndefined();
  });
});
