import { describe, expect, it } from 'vite-plus/test';

import { commonIrpf } from './irpf';
import { grossFromInput, grossFromNet } from './salary';
import { DEFAULT_SITUATION } from './situation';

const calculate = (gross: number) => commonIrpf(gross, 'aragon', DEFAULT_SITUATION);

describe('grossFromNet', () => {
  it.each([10_000, 18_000, 25_000, 60_000, 250_000])('round-trips a %d € gross salary', (gross) => {
    expect(grossFromNet(calculate(gross).net, calculate)).toBeCloseTo(gross, 2);
  });

  it('is zero for no net pay', () => {
    expect(grossFromNet(0, calculate)).toBe(0);
  });
});

describe('grossFromInput', () => {
  it('passes a gross yearly amount through', () => {
    expect(grossFromInput(30_000, 'grossYear', calculate)).toBe(30_000);
  });

  it('treats 12 and 14 payments of the same yearly net equally', () => {
    const from12 = grossFromInput(1_750, 'net12', calculate);
    const from14 = grossFromInput(1_500, 'net14', calculate);
    expect(from12).toBeCloseTo(from14, 2);
    expect(calculate(from12).net).toBeCloseTo(21_000, 2);
  });
});
