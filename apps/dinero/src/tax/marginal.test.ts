import { describe, expect, it } from 'vite-plus/test';

import type { SalaryBreakdown } from './irpf';
import { irpfRate, marginalSteps, socialSecurityRate } from './marginal';

// 5% contributions; 0% tax up to 10,000, 20% to 30,000, 40% above.
function toy(gross: number): SalaryBreakdown {
  const socialSecurity = gross * 0.05;
  const irpf =
    Math.max(0, Math.min(gross, 30_000) - 10_000) * 0.2 + Math.max(0, gross - 30_000) * 0.4;
  return { gross, socialSecurity, irpf, net: gross - socialSecurity - irpf };
}

describe('marginalSteps', () => {
  it('finds each band of constant rates', () => {
    const steps = marginalSteps(50_000, toy);

    expect(steps.map(irpfRate).map((rate) => Math.round(rate * 100))).toEqual([0, 20, 40]);
    expect(steps.map(socialSecurityRate).every((rate) => Math.abs(rate - 0.05) < 1e-9)).toBe(true);
    expect(steps[1]?.from).toBeCloseTo(10_000, -2);
    expect(steps[2]?.from).toBeCloseTo(30_000, -2);
  });

  it('adds up exactly to the totals', () => {
    const steps = marginalSteps(43_210, toy);
    const total = toy(43_210);

    expect(steps.reduce((sum, step) => sum + step.irpf, 0)).toBeCloseTo(total.irpf, 6);
    expect(steps.reduce((sum, step) => sum + step.socialSecurity, 0)).toBeCloseTo(
      total.socialSecurity,
      6,
    );
    expect(steps[0]?.from).toBe(0);
    expect(steps.at(-1)?.to).toBe(43_210);
  });

  it('is empty for no salary', () => {
    expect(marginalSteps(0, toy)).toEqual([]);
  });
});
