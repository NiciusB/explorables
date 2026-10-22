import type { Citation } from '../sources';
import { regionalRules, state, type CommonRegion } from './rules2026';
import { quotaAfterMinimum } from './scale';
import { personalMinimum, type Situation } from './situation';

/** Illustrative amounts per flat, not estimates of market rents or average costs. */
export const RENTAL_EXAMPLE = {
  flats: 3,
  monthlyRent: 1000,
  buildingValue: 100_000,
  expenses: { repairs: 1200, ibi: 600, community: 900, insurance: 300 },
};

export const RENTAL_CITATIONS: readonly Citation[] = [
  { source: 'lirpf', locator: 'arts. 22, 23, 56, 63 y 74' },
  { source: 'rentalExpenses', locator: 'Gastos deducibles' },
  { source: 'rentalReduction', locator: 'Reducción general del 50 %' },
  { source: 'rentalDepreciation', locator: 'Inmuebles: 3 % sin suelo' },
];

/**
 * Identical, fully paid, year-round homes, no other income. New residential
 * contracts qualify for the ordinary 50% reduction (art. 23.2 LIRPF). Repairs restore
 * the property; improvements are capitalised instead. All costs are paid by the owner.
 * The illustrative building basis is the higher of acquisition/cadastral construction
 * values, excludes land, and has sufficient remaining depreciable value (RIRPF art. 14).
 * The example has positive income; loss carry-forwards are outside its scope.
 */
export function rentalBreakdown(flats: number, region: CommonRegion, situation: Situation) {
  const gross = RENTAL_EXAMPLE.monthlyRent * flats * 12;
  const expenses =
    Object.values(RENTAL_EXAMPLE.expenses).reduce((sum, amount) => sum + amount, 0) * flats;
  const cashBeforeTax = gross - expenses;
  const depreciation = RENTAL_EXAMPLE.buildingValue * 0.03 * flats;
  const taxableBase = Math.max(0, cashBeforeTax - depreciation) * 0.5;
  const regional = regionalRules(region);
  const irpf =
    quotaAfterMinimum(state.scale, taxableBase, personalMinimum(state.minimums, situation)) +
    quotaAfterMinimum(regional.scale, taxableBase, personalMinimum(regional.minimums, situation));
  return {
    gross,
    expenses,
    cashBeforeTax,
    depreciation,
    taxableBase,
    irpf,
    net: cashBeforeTax - irpf,
  };
}
