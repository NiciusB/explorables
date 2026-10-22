import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vite-plus/test';

import { salaryBreakdown } from './tax/regions';
import { DEFAULT_SITUATION } from './tax/situation';
import { useSalary } from './useSalary';

afterEach(cleanup);

describe('useSalary', () => {
  it('uses an anonymous example until the reader edits it', () => {
    const { result } = renderHook(useSalary);
    expect(result.current.profile.personal).toBe(false);
    const payment = Math.round(result.current.breakdown.net / 14);
    act(() => result.current.setBasis('net14'));
    expect(result.current.profile.personal).toBe(false);
    expect(result.current.amount).toBe(payment);
    expect(result.current.breakdown.net / 14).toBeCloseTo(payment, 2);
    act(() => result.current.setAmount(2500));
    expect(result.current.profile.personal).toBe(true);
    expect(result.current.breakdown.net / 14).toBeCloseTo(2500, 2);
  });

  it('shares changes of region and family situation with every chapter', () => {
    const { result } = renderHook(useSalary);
    const situation = { ...DEFAULT_SITUATION, children: 2, childrenUnder3: 1 };
    act(() => result.current.setRegion('navarra'));
    act(() => result.current.setSituation(situation));
    const expected = salaryBreakdown(30_000, 'navarra', situation);
    expect(result.current.profile).toMatchObject({
      personal: true,
      region: 'navarra',
      situation,
      net: expected.net,
    });
    act(() => result.current.reset());
    expect(result.current.profile).toMatchObject({
      personal: false,
      gross: 30_000,
      region: 'andalucia',
      situation: DEFAULT_SITUATION,
    });
    expect(result.current.basis).toBe('grossYear');
  });
});
