import { socialSecurity } from './rules2026';

const EMPLOYEE_RATE = Object.values(socialSecurity.rates).reduce((sum, rate) => sum + rate, 0);

/**
 * Employee Social Security contributions for a year, assuming the gross is spread evenly
 * across 12 monthly bases (extra payments prorated, as the contribution rules require).
 */
export function socialSecurityContributions(gross: number): number {
  const monthly = gross / 12;
  const base = Math.min(monthly, socialSecurity.maxMonthlyBase);
  let contribution = (base * EMPLOYEE_RATE) / 100;

  const tranches = socialSecurity.solidarity;
  for (const [index, tranche] of tranches.entries()) {
    if (monthly <= tranche.from) break;
    const upper = tranches[index + 1]?.from ?? Number.POSITIVE_INFINITY;
    contribution += ((Math.min(monthly, upper) - tranche.from) * tranche.rate) / 100;
  }
  return contribution * 12;
}
