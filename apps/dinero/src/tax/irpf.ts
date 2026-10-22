import { regionalRules, state, type CommonRegion } from './rules2026';
import { quotaAfterMinimum } from './scale';
import { personalMinimum, type Situation } from './situation';
import { socialSecurityContributions } from './socialSecurity';

/** What happens to a gross salary on its way to net pay. All amounts are euros per year. */
export interface SalaryBreakdown {
  gross: number;
  socialSecurity: number;
  irpf: number;
  net: number;
}

/** The intermediate steps of the common-regime IRPF calculation. */
export interface CommonIrpfDetail extends SalaryBreakdown {
  workReduction: number;
  otherExpenses: number;
  taxableBase: number;
  stateMinimum: number;
  regionalMinimum: number;
  stateQuota: number;
  regionalQuota: number;
  minimumWageDeduction: number;
}

/** Reduction for low net work income (art. 20 LIRPF). */
export function workReduction(netWorkIncome: number): number {
  const { full, firstTaper, secondTaper } = state.workReduction;
  if (netWorkIncome <= full.upTo) return full.amount;
  if (netWorkIncome <= firstTaper.upTo) {
    return firstTaper.amount - firstTaper.slope * (netWorkIncome - full.upTo);
  }
  if (netWorkIncome < secondTaper.upTo) {
    return secondTaper.amount - secondTaper.slope * (netWorkIncome - firstTaper.upTo);
  }
  return 0;
}

/** Deduction for earnings around the minimum wage (DA 61.ª LIRPF), before its cap. */
export function minimumWageDeduction(gross: number): number {
  const { full, taper } = state.minimumWageDeduction;
  if (gross <= full.upTo) return full.amount;
  if (gross < taper.upTo) return full.amount - taper.slope * (gross - full.upTo);
  return 0;
}

function otherExpensesFor(situation: Situation): number {
  const { general, disability, disabilitySevere } = state.otherExpenses;
  const extra: Record<Situation['disability'], number> = {
    none: 0,
    moderate: disability,
    severe: disabilitySevere,
  };
  return general + extra[situation.disability];
}

/**
 * IRPF for an employee whose only income is their salary, filing individually, in a
 * common-regime autonomous community. Regional deductions are not modelled.
 */
export function commonIrpf(
  gross: number,
  region: CommonRegion,
  situation: Situation,
): CommonIrpfDetail {
  const socialSecurity = socialSecurityContributions(gross);
  const netWorkIncome = Math.max(0, gross - socialSecurity);
  const otherExpenses = Math.min(otherExpensesFor(situation), netWorkIncome);
  const reduction = workReduction(netWorkIncome);
  const taxableBase = Math.max(0, netWorkIncome - otherExpenses - reduction);

  const regional = regionalRules(region);
  const stateMinimum = personalMinimum(state.minimums, situation);
  const regionalMinimum = personalMinimum(regional.minimums, situation);
  const stateQuota = quotaAfterMinimum(state.scale, taxableBase, stateMinimum);
  const regionalQuota = quotaAfterMinimum(regional.scale, taxableBase, regionalMinimum);

  // All income is work income, so the cap is the whole quota.
  const deduction = Math.min(minimumWageDeduction(gross), stateQuota + regionalQuota);
  const irpf = stateQuota + regionalQuota - deduction;

  return {
    gross,
    socialSecurity,
    irpf,
    net: gross - socialSecurity - irpf,
    workReduction: Math.min(reduction, Math.max(0, netWorkIncome - otherExpenses)),
    otherExpenses,
    taxableBase,
    stateMinimum,
    regionalMinimum,
    stateQuota,
    regionalQuota,
    minimumWageDeduction: deduction,
  };
}
