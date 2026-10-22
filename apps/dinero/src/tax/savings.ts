import type { Citation } from '../sources';
import { commonIrpf } from './irpf';
import { regionalRules, state, type CommonRegion } from './rules2026';
import { quotaAfterMinimum, type Scale } from './scale';
import { personalMinimum, type Situation } from './situation';
import { isCommon, type Region } from './regions';

/**
 * 2026 savings scale ("base liquidable del ahorro"): dividends, interest and capital
 * gains. The state half (art. 66) and the regional half (art. 76) are identical, and
 * communities can't change the regional one.
 */
export const savingsHalfScale: Scale = [
  { from: 0, quota: 0, rate: 9.5 },
  { from: 6000, quota: 570, rate: 10.5 },
  { from: 50_000, quota: 5190, rate: 11.5 },
  { from: 200_000, quota: 22_440, rate: 13.5 },
  { from: 300_000, quota: 35_940, rate: 15 },
];
export const SAVINGS_CITATION: Citation = { source: 'lirpf', locator: 'arts. 66 y 76' };

/**
 * The community used when the reader lives under a foral system, whose savings rules
 * differ: Castilla-La Mancha's scale and minimums are the state's own.
 */
export const REFERENCE_REGION: CommonRegion = 'castilla-la-mancha';

/** The common-regime community to compute with for `region`. */
export function commonRegionFor(region: Region): CommonRegion {
  return isCommon(region) ? region : REFERENCE_REGION;
}

/**
 * IRPF on `amount` of savings income for someone with no other income: the personal and
 * family minimum, unused by a general base, comes off the savings base instead (art. 56.2).
 */
export function savingsTax(amount: number, region: CommonRegion, situation: Situation): number {
  const stateMinimum = personalMinimum(state.minimums, situation);
  const regionalMinimum = personalMinimum(regionalRules(region).minimums, situation);
  return (
    quotaAfterMinimum(savingsHalfScale, amount, stateMinimum) +
    quotaAfterMinimum(savingsHalfScale, amount, regionalMinimum)
  );
}

/** What the same yearly amount leaves after tax, earned as salary or as savings income. */
export interface SameAmount {
  amount: number;
  /** Employee Social Security on a salary of `amount`. */
  socialSecurity: number;
  /** IRPF on a salary of `amount`. */
  salaryIrpf: number;
  /** Both together. */
  salaryTax: number;
  /** IRPF on `amount` of dividends, interest or capital gains. */
  savingsTax: number;
}

export function compareSameAmount(
  amount: number,
  region: CommonRegion,
  situation: Situation,
): SameAmount {
  const salary = commonIrpf(amount, region, situation);
  return {
    amount,
    socialSecurity: salary.socialSecurity,
    salaryIrpf: salary.irpf,
    salaryTax: salary.socialSecurity + salary.irpf,
    savingsTax: savingsTax(amount, region, situation),
  };
}

/**
 * Tax on the next `extra` euros for someone already earning `gross` in salary: as a raise,
 * or as savings income. The salary already uses up the personal minimum, so the extra
 * savings start at the bottom of the savings scale.
 */
export function nextEuros(
  gross: number,
  extra: number,
  region: CommonRegion,
  situation: Situation,
): { asSalary: number; asSavings: number } {
  const before = commonIrpf(gross, region, situation);
  const after = commonIrpf(gross + extra, region, situation);
  const minimumLeft = Math.max(0, personalMinimum(state.minimums, situation) - before.taxableBase);
  const regionalMinimumLeft = Math.max(
    0,
    personalMinimum(regionalRules(region).minimums, situation) - before.taxableBase,
  );
  return {
    asSalary: after.socialSecurity + after.irpf - (before.socialSecurity + before.irpf),
    asSavings:
      quotaAfterMinimum(savingsHalfScale, extra, minimumLeft) +
      quotaAfterMinimum(savingsHalfScale, extra, regionalMinimumLeft),
  };
}
