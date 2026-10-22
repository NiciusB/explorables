import { toPresentEuros } from '../prices';
import { isCommon, type Region } from '../tax/regions';
import {
  INCOME_DECILE_LIMITS,
  SALARY_DECILES,
  WEALTH_GROUPS,
  WEALTH_MEAN,
  type Community,
} from './data';

/**
 * Where `value` falls in a distribution known only by its decile limits (P10 … P90), as a
 * percentile from 0 to 100. Linear between limits; below P10 it runs from 0, and above P90
 * it is capped at 90 since the top decile has no upper limit.
 */
export function percentileFromLimits(value: number, limits: readonly number[]): number {
  const first = limits[0];
  if (first === undefined || value <= 0) return 0;
  if (value < first) return (10 * value) / first;
  for (let index = 1; index < limits.length; index += 1) {
    const lower = limits[index - 1] ?? 0;
    const upper = limits[index] ?? 0;
    if (value < upper) return 10 * index + (10 * (value - lower)) / (upper - lower);
  }
  return 90;
}

/** Decile 1 to 10 for a percentile. */
export function decileOf(percentile: number): number {
  return Math.min(10, Math.floor(percentile / 10) + 1);
}

function salaryLimits(year: number): readonly number[] {
  const deciles = SALARY_DECILES[year];
  if (deciles === undefined) throw new RangeError(`No salary deciles for ${String(year)}`);
  return deciles.lower;
}

/** Percentile among all wage earners of `year` for a yearly gross salary of that year. */
export function salaryPercentile(grossYear: number, year: number): number {
  return percentileFromLimits(grossYear / 12, salaryLimits(year));
}

/** Mean gross yearly salary of each decile in `year`, in today's euros. */
export function realDecileSalaries(year: number): number[] {
  const deciles = SALARY_DECILES[year];
  if (deciles === undefined) throw new RangeError(`No salary deciles for ${String(year)}`);
  return deciles.mean.map((monthly) => toPresentEuros(monthly * 12, year));
}

/** Consumption units of a household under the modified OECD scale (children under 14). */
export function consumptionUnits(adults: number, children: number): number {
  return 1 + 0.5 * Math.max(0, adults - 1) + 0.3 * children;
}

/** Percentile of a household's yearly net income per consumption unit (ECV). */
export function householdPercentile(netIncome: number, adults: number, children: number): number {
  return percentileFromLimits(netIncome / consumptionUnits(adults, children), INCOME_DECILE_LIMITS);
}

/** Each wealth group's share of all household net wealth, as a fraction. */
export function wealthShares(): { from: number; to: number; share: number }[] {
  return WEALTH_GROUPS.map(({ from, to, mean }) => ({
    from,
    to,
    share: (mean * (to - from)) / 100 / WEALTH_MEAN,
  }));
}

/** The survey community a tax region belongs to. */
export function communityOf(region: Region): Community {
  return isCommon(region) || region === 'navarra' ? region : 'pais-vasco';
}
