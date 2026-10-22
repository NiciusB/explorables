import { describe, expect, it } from 'vite-plus/test';

import { basqueIrpf, navarraIrpf } from './foral';
import { commonIrpf } from './irpf';
import { REGIONS, salaryBreakdown, taxSystem } from './regions';
import { DEFAULT_SITUATION } from './situation';

describe('regions', () => {
  it('covers every community and foral territory once', () => {
    expect(REGIONS).toHaveLength(19);
    expect(new Set(REGIONS).size).toBe(REGIONS.length);
  });

  it('classifies each region by tax system', () => {
    expect(taxSystem('madrid')).toBe('common');
    expect(taxSystem('bizkaia')).toBe('basque');
    expect(taxSystem('navarra')).toBe('navarra');
  });

  it('dispatches to the matching calculation', () => {
    expect(salaryBreakdown(40_000, 'madrid', DEFAULT_SITUATION).irpf).toBe(
      commonIrpf(40_000, 'madrid', DEFAULT_SITUATION).irpf,
    );
    expect(salaryBreakdown(40_000, 'alava', DEFAULT_SITUATION)).toEqual(
      basqueIrpf(40_000, 'alava', DEFAULT_SITUATION),
    );
    expect(salaryBreakdown(40_000, 'navarra', DEFAULT_SITUATION)).toEqual(
      navarraIrpf(40_000, DEFAULT_SITUATION),
    );
  });

  it.each(REGIONS)('keeps net pay rising with gross in %s', (region) => {
    // Bisection from net to gross relies on this.
    let previous = -1;
    for (let gross = 0; gross <= 120_000; gross += 250) {
      const { net } = salaryBreakdown(gross, region, { ...DEFAULT_SITUATION, children: 2 });
      expect(net).toBeGreaterThan(previous);
      previous = net;
    }
  });
});
