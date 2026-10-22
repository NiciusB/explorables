import { describe, expect, it } from 'vite-plus/test';

import { allScales, COMMON_REGIONS, regionalRules, state } from './rules2026';
import { applyScale, type Scale } from './scale';

/** Every way a transcribed scale can disagree with itself; empty when consistent. */
function scaleProblems(scale: Scale): string[] {
  const problems: string[] = [];
  if (scale[0]?.from !== 0 || scale[0].quota !== 0) problems.push('does not start at 0');
  for (const [index, bracket] of scale.entries()) {
    // Published quotas are rounded to cents; Canarias' table is 2 cents low from its second
    // row on (13,748 × 9% = 1,237.32, published as 1,237.30), so allow up to 3 cents.
    const computed = applyScale(scale, bracket.from);
    if (Math.abs(computed - bracket.quota) >= 0.03) {
      problems.push(`row ${String(index)}: quota ${String(bracket.quota)} ≠ ${String(computed)}`);
    }
    const next = scale[index + 1];
    if (next !== undefined && (next.from <= bracket.from || next.rate <= bracket.rate)) {
      problems.push(`row ${String(index + 1)} does not increase`);
    }
  }
  return problems;
}

describe('2026 rules', () => {
  it('transcribes the state scale consistently', () => {
    expect(scaleProblems(state.scale)).toEqual([]);
  });

  it.each(COMMON_REGIONS)('transcribes the %s scale consistently', (region) => {
    expect(scaleProblems(allScales[region])).toEqual([]);
  });

  it('cites a table for every region', () => {
    for (const region of COMMON_REGIONS) {
      expect(regionalRules(region).citation.locator).toMatch(/^Tabla \d+$/);
    }
  });

  it('uses the state minimums where a region sets none', () => {
    expect(regionalRules('aragon').minimums).toEqual(state.minimums);
    expect(regionalRules('madrid').minimums.taxpayer).toBe(5956.65);
  });

  it('joins the work reduction tapers continuously', () => {
    const { full, firstTaper, secondTaper } = state.workReduction;
    expect(firstTaper.amount - firstTaper.slope * (firstTaper.upTo - full.upTo)).toBeCloseTo(
      secondTaper.amount,
    );
    expect(
      secondTaper.amount - secondTaper.slope * (secondTaper.upTo - firstTaper.upTo),
    ).toBeCloseTo(0);
  });
});
