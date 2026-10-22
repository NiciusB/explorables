import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vite-plus/test';

import { salaryBreakdown } from './tax/regions';
import { DEFAULT_SITUATION } from './tax/situation';
import { useSalary } from './useSalary';

afterEach(cleanup);

describe('useSalary', () => {
  it('starts at 1,350 euros net in 12 payments in Madrid', () => {
    const { result } = renderHook(useSalary);
    expect(result.current.amount).toBe(1350);
    expect(result.current.basis).toBe('net12');
    expect(result.current.region).toBe('madrid');
    expect(result.current.breakdown.net).toBeCloseTo(16_200, 6);
  });

  it('preserves the salary through repeated mode changes without rounding drift', () => {
    const { result } = renderHook(useSalary);
    const initialGross = result.current.gross;
    for (let round = 0; round < 5; round += 1) {
      for (const basis of ['net14', 'grossYear', 'net12'] as const) {
        act(() => result.current.setBasis(basis));
        expect(result.current.gross).toBeCloseTo(initialGross, 6);
        expect(result.current.profile.personal).toBe(false);
      }
    }
    expect(result.current.amount).toBeCloseTo(1350, 6);
  });

  it('uses an anonymous example until the reader edits it', () => {
    const { result } = renderHook(useSalary);
    expect(result.current.profile.personal).toBe(false);
    const payment = result.current.breakdown.net / 14;
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
    const expected = salaryBreakdown(result.current.gross, 'navarra', situation);
    expect(result.current.profile).toMatchObject({
      personal: true,
      region: 'navarra',
      situation,
      net: expected.net,
    });
    act(() => result.current.reset());
    expect(result.current.profile).toMatchObject({
      personal: false,
      net: 16_200,
      region: 'madrid',
      situation: DEFAULT_SITUATION,
    });
    expect(result.current.basis).toBe('net12');
    expect(result.current.amount).toBe(1350);
  });
});
