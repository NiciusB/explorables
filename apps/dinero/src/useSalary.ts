import { useState } from 'react';

import type { Profile } from './profile';
import { commonIrpf, type SalaryBreakdown } from './tax/irpf';
import { marginalSteps, type Step } from './tax/marginal';
import { salaryBreakdown, type Region } from './tax/regions';
import { REFERENCE_REGION } from './tax/savings';
import { grossFromInput, PAYMENTS, type PayBasis } from './tax/salary';
import { DEFAULT_SITUATION, type Situation } from './tax/situation';
import { marginalRate } from './salaryStory';

const DEFAULT_GROSS = 30_000;
const DEFAULT_REGION: Region = 'andalucia';

/** Converts a gross yearly salary to the amount shown for `basis`. */
function amountFor(basis: PayBasis, net: number, gross: number): number {
  return basis === 'grossYear' ? gross : Math.round(net / PAYMENTS[basis]);
}

/** The salary chapter's inputs, everything derived from them, and the profile for the rest. */
export interface SalaryState {
  amount: number;
  basis: PayBasis;
  region: Region;
  situation: Situation;
  gross: number;
  breakdown: SalaryBreakdown;
  steps: Step[];
  profile: Profile;
  setAmount: (amount: number) => void;
  setBasis: (basis: PayBasis) => void;
  setRegion: (region: Region) => void;
  setSituation: (situation: Situation) => void;
  /** Goes back to the example salary and forgets the reader's own. */
  reset: () => void;
}

/** Holds the salary at the top of the page so every chapter can personalise its examples. */
export function useSalary(): SalaryState {
  const [amount, setAmountState] = useState(DEFAULT_GROSS);
  const [basis, setBasisState] = useState<PayBasis>('grossYear');
  const [region, setRegionState] = useState<Region>(DEFAULT_REGION);
  const [situation, setSituationState] = useState<Situation>(DEFAULT_SITUATION);
  const [personal, setPersonal] = useState(false);

  const calculate = (value: number) => salaryBreakdown(value, region, situation);
  const gross = grossFromInput(amount, basis, calculate);
  const breakdown = calculate(gross);
  const steps = marginalSteps(gross, calculate);
  // The common-regime taxable base doesn't depend on the community, only on the salary.
  const { taxableBase } = commonIrpf(gross, REFERENCE_REGION, situation);

  return {
    amount,
    basis,
    region,
    situation,
    gross,
    breakdown,
    steps,
    profile: {
      personal,
      gross,
      net: breakdown.net,
      region,
      situation,
      taxableBase,
      marginalRate: marginalRate(steps),
    },
    setAmount: (next) => {
      setAmountState(next);
      setPersonal(true);
    },
    setBasis: (next) => {
      // Keep the same salary, expressed the new way.
      setAmountState(amountFor(next, breakdown.net, Math.round(gross)));
      setBasisState(next);
    },
    setRegion: (next) => {
      setRegionState(next);
      setPersonal(true);
    },
    setSituation: (next) => {
      setSituationState(next);
      setPersonal(true);
    },
    reset: () => {
      setAmountState(DEFAULT_GROSS);
      setBasisState('grossYear');
      setRegionState(DEFAULT_REGION);
      setSituationState(DEFAULT_SITUATION);
      setPersonal(false);
    },
  };
}
