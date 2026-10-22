import type { SalaryBreakdown } from './irpf';

/** How the reader knows their pay: gross per year, or net per payment in 12 or 14 payments. */
export type PayBasis = 'grossYear' | 'net12' | 'net14';

export const PAYMENTS: Record<Exclude<PayBasis, 'grossYear'>, number> = { net12: 12, net14: 14 };

export type Calculate = (gross: number) => SalaryBreakdown;

/**
 * The gross salary that leaves `netYear` after contributions and IRPF. Net pay rises
 * with gross (every marginal rate is below 100%), so bisection always converges.
 */
export function grossFromNet(netYear: number, calculate: Calculate): number {
  if (netYear <= 0) return 0;
  let low = netYear;
  let high = netYear * 2 + 10_000;
  while (calculate(high).net < netYear) high *= 2;
  for (let iteration = 0; iteration < 60; iteration += 1) {
    const middle = (low + high) / 2;
    if (calculate(middle).net < netYear) low = middle;
    else high = middle;
  }
  return high;
}

/** Gross yearly salary for an amount the reader typed, in the basis they chose. */
export function grossFromInput(amount: number, basis: PayBasis, calculate: Calculate): number {
  if (basis === 'grossYear') return amount;
  return grossFromNet(amount * PAYMENTS[basis], calculate);
}
