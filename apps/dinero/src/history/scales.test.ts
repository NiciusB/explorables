import { describe, expect, it } from 'vite-plus/test';

import { applyScale } from '../tax/scale';
import { HISTORICAL_SCALES, publishedParts, toRealScale } from './scales';
import { marginalAt, rateCurve, scale2026, scaleTax, timeline, topRate } from './timeMachine';

function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error('Missing value');
  return value;
}

describe('historical scales', () => {
  it('match their published cumulative quota at every row', () => {
    for (const scale of publishedParts) {
      for (const bracket of scale) {
        // Published quotas are rounded to the unit (pesetas) or the cent (euros).
        expect(Math.abs(applyScale(scale, bracket.from) - bracket.quota)).toBeLessThan(1);
      }
    }
  });

  it('add up to the well-known top rates', () => {
    const tops = Object.fromEntries(
      HISTORICAL_SCALES.map((historical) => [historical.year, topRate(toRealScale(historical))]),
    );
    expect(tops[1979]).toBeCloseTo(0.6551);
    expect(tops[1992]).toBeCloseTo(0.56);
    expect(tops[1999]).toBeCloseTo(0.48);
    expect(tops[2007]).toBeCloseTo(0.43);
    expect(tops[2012]).toBeCloseTo(0.52);
  });

  it('convert pesetas and inflation into today’s euros', () => {
    const real1979 = toRealScale(required(HISTORICAL_SCALES[0]));
    // 200,000 pesetas of 1979 is about 1,202 € of the day and roughly 9,000 € today.
    const firstEdge = real1979.scale[1]?.from ?? 0;
    expect(firstEdge).toBeGreaterThan(8500);
    expect(firstEdge).toBeLessThan(9500);
  });
});

describe('time machine', () => {
  it('ends in 2026 with the reader’s regional scale', () => {
    const years = timeline('madrid').map((real) => real.year);
    expect(years).toEqual([1979, 1992, 1999, 2007, 2012, 2026]);
    expect(topRate({ year: 2026, scale: scale2026('madrid') })).toBeCloseTo(0.45);
    expect(topRate({ year: 2026, scale: scale2026('navarra') })).toBeCloseTo(0.52);
  });

  it('caps the 1979 average rate at 40% of the base', () => {
    const real1979 = required(timeline('madrid')[0]);
    const huge = 5_000_000;
    expect(scaleTax(real1979, huge)).toBeCloseTo(0.4 * huge);
    expect(marginalAt(real1979, huge)).toBe(0.4);
    // Low bases pay the scale itself, starting at 15%.
    expect(marginalAt(real1979, 1000)).toBeCloseTo(0.15);
  });

  it('samples the marginal rate as a curve', () => {
    const real2026 = required(timeline('andalucia').at(-1));
    const curve = rateCurve(real2026, 100_000, 10);
    expect(curve).toHaveLength(11);
    expect(curve[0]).toBeCloseTo(0.19);
    expect(curve[10]).toBeCloseTo(0.45);
  });
});
