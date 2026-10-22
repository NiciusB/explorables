import { basqueRules, navarraRules, type BasqueRules, type BasqueTerritory } from './foral2026';
import type { SalaryBreakdown } from './irpf';
import { applyScale } from './scale';
import { perChild, type Disability, type Situation } from './situation';
import { socialSecurityContributions } from './socialSecurity';

const DISABILITY_FACTOR = (increase: { moderate: number; severe: number }) =>
  ({ none: 1, moderate: 1 + increase.moderate, severe: 1 + increase.severe }) satisfies Record<
    Disability,
    number
  >;

/** Basque reduction of net work income (art. 23), before the no-negative-income cap. */
export function basqueBonification(
  netWorkIncome: number,
  situation: Situation,
  rules: BasqueRules,
): number {
  const { full, taper, floor, disabilityIncrease } = rules.bonification;
  let amount: number = floor;
  if (netWorkIncome <= full.upTo) amount = full.amount;
  else if (netWorkIncome <= taper.upTo)
    amount = full.amount - taper.slope * (netWorkIncome - full.upTo);
  return amount * DISABILITY_FACTOR(disabilityIncrease)[situation.disability];
}

function basqueAgeDeduction(taxableBase: number, situation: Situation, rules: BasqueRules): number {
  const { over65, over75, fullUpTo, zeroAt } = rules.age;
  if (situation.age === 'under65' || taxableBase >= zeroAt) return 0;
  const amount = situation.age === '75plus' ? over75 : over65;
  if (taxableBase <= fullUpTo) return amount;
  // The taper coefficient is the amount divided by the 10,000 € taper width.
  return amount - (amount / (zeroAt - fullUpTo)) * (taxableBase - fullUpTo);
}

/** IRPF in a Basque territory for an employee with no other income, filing individually. */
export function basqueIrpf(
  gross: number,
  territory: BasqueTerritory,
  situation: Situation,
): SalaryBreakdown {
  const rules = basqueRules[territory];
  const socialSecurity = socialSecurityContributions(gross);
  const netBeforeBonification = Math.max(0, gross - socialSecurity);
  const taxableBase = Math.max(
    0,
    netBeforeBonification - basqueBonification(netBeforeBonification, situation, rules),
  );

  const quota = Math.max(0, applyScale(rules.scale, taxableBase) - rules.quotaReduction);

  const children = Math.max(0, situation.children);
  const descendants =
    perChild(rules.descendants, children) +
    Math.min(situation.childrenUnder6, children) * rules.under6;
  const disability = situation.disability === 'none' ? 0 : rules.disability[situation.disability];
  const deductions =
    (situation.childrenShared ? descendants / 2 : descendants) +
    disability +
    basqueAgeDeduction(taxableBase, situation, rules);

  const irpf = Math.max(0, quota - deductions);
  return { gross, socialSecurity, irpf, net: gross - socialSecurity - irpf };
}

/** Navarra's work deduction (art. 62.5) for a given net work income, before its cap. */
export function navarraWorkDeduction(netWorkIncome: number, situation: Situation): number {
  const { full, firstTaper, plateau, secondTaper, floor, disabilityIncrease } =
    navarraRules.workDeduction;
  let amount: number = floor;
  if (netWorkIncome <= full.upTo) amount = full.amount;
  else if (netWorkIncome <= firstTaper.upTo)
    amount = full.amount - firstTaper.slope * (netWorkIncome - full.upTo);
  else if (netWorkIncome <= plateau.upTo) amount = plateau.amount;
  else if (netWorkIncome <= secondTaper.upTo)
    amount = plateau.amount - secondTaper.slope * (netWorkIncome - plateau.upTo);
  return amount * DISABILITY_FACTOR(disabilityIncrease)[situation.disability];
}

/** Navarra's extra personal deduction for low income (art. 62.9.a, c' to e'). */
export function navarraLowIncomeDeduction(income: number): number {
  const { full, firstTaper, secondTaper } = navarraRules.personal.lowIncome;
  if (income <= full.upTo) return full.amount;
  if (income <= firstTaper.upTo) return full.amount - firstTaper.slope * (income - full.upTo);
  if (income <= secondTaper.upTo)
    return secondTaper.amount - secondTaper.slope * (income - firstTaper.upTo);
  return 0;
}

/** Share by which the descendant deduction grows for low income (art. 62.9.b.b'.2.º). */
export function navarraDescendantIncrease(income: number): number {
  const { fullUpTo, rate, slopePoints, upTo } = navarraRules.descendantIncrease;
  if (income <= fullUpTo) return rate;
  if (income > upTo) return 0;
  // The law rounds the resulting percentage to two decimals.
  const points = rate * 100 - slopePoints * ((income - fullUpTo) / fullUpTo);
  return Math.round(points * 100) / 10_000;
}

function navarraPersonalDeduction(income: number, situation: Situation): number {
  const { general, over65, over75, disability } = navarraRules.personal;
  const age = { under65: 0, '65to74': over65, '75plus': over75 }[situation.age];
  const disabilityAmount = situation.disability === 'none' ? 0 : disability[situation.disability];
  return general + age + disabilityAmount + navarraLowIncomeDeduction(income);
}

function navarraFamilyDeduction(income: number, situation: Situation): number {
  const children = Math.max(0, situation.children);
  const full =
    perChild(navarraRules.descendants, children) +
    Math.min(situation.childrenUnder3, children) * navarraRules.under3;
  const own = situation.childrenShared ? full / 2 : full;
  return own * (1 + navarraDescendantIncrease(income));
}

/** IRPF in Navarra for an employee with no other income, filing individually. */
export function navarraIrpf(gross: number, situation: Situation): SalaryBreakdown {
  const socialSecurity = socialSecurityContributions(gross);
  // Social Security is the only deductible expense here, so this is also the "rentas" used
  // for the income-dependent deductions (art. 64.5).
  const netWorkIncome = Math.max(0, gross - socialSecurity);
  const quota = applyScale(navarraRules.scale, netWorkIncome);

  const workDeduction = Math.min(navarraWorkDeduction(netWorkIncome, situation), quota);
  const deductions =
    workDeduction +
    navarraPersonalDeduction(netWorkIncome, situation) +
    navarraFamilyDeduction(netWorkIncome, situation);

  const irpf = Math.max(0, quota - deductions);
  return { gross, socialSecurity, irpf, net: gross - socialSecurity - irpf };
}
