import { describe, expect, it } from 'vite-plus/test';

import { commonIrpf } from '../tax/irpf';
import { COMMON_REGIONS } from '../tax/rules2026';
import { DEFAULT_SITUATION } from '../tax/situation';
import {
  currentDesign,
  decileChanges,
  designedIrpf,
  designedMarginal,
  PRESETS,
  toScale,
} from './customScale';

describe('toScale', () => {
  it('sorts rows, starts at zero and derives quotas', () => {
    const scale = toScale([
      { from: 20_000, rate: 30 },
      { from: 10_000, rate: 20 },
    ]);
    expect(scale).toEqual([
      { from: 0, quota: 0, rate: 0 },
      { from: 10_000, quota: 0, rate: 20 },
      { from: 20_000, quota: 2000, rate: 30 },
    ]);
  });

  it('drops duplicate edges and clamps rates', () => {
    const scale = toScale([
      { from: 0, rate: 150 },
      { from: 0, rate: 10 },
      { from: 5000, rate: -5 },
    ]);
    expect(scale.map((row) => row.rate)).toEqual([100, 0]);
  });
});

describe('designedIrpf', () => {
  it('reproduces today’s IRPF with the current design', () => {
    for (const region of COMMON_REGIONS) {
      for (const gross of [12_000, 17_000, 18_000, 25_000, 30_000, 60_000, 200_000]) {
        const design = currentDesign(region, DEFAULT_SITUATION);
        const today = commonIrpf(gross, region, DEFAULT_SITUATION).irpf;
        expect(designedIrpf(gross, design, region, DEFAULT_SITUATION)).toBeCloseTo(today, 2);
      }
    }
  });

  it('applies a flat rate above the exemption', () => {
    const { taxableBase } = commonIrpf(50_000, 'madrid', DEFAULT_SITUATION);
    expect(designedIrpf(50_000, PRESETS.flat, 'madrid', DEFAULT_SITUATION)).toBeCloseTo(
      (taxableBase - PRESETS.flat.exempt) * 0.2,
    );
    expect(designedMarginal(50_000, PRESETS.flat, 'madrid', DEFAULT_SITUATION)).toBeCloseTo(0.2);
  });
});

describe('decileChanges', () => {
  it('is zero for every decile under today’s design', () => {
    const design = currentDesign('castilla-la-mancha', DEFAULT_SITUATION);
    for (const change of decileChanges(design, 'castilla-la-mancha', DEFAULT_SITUATION)) {
      expect(Math.abs(change)).toBeLessThan(0.01);
    }
  });

  it('gives the top decile a bigger cut than the bottom under a flat rate', () => {
    const changes = decileChanges(PRESETS.flat, 'castilla-la-mancha', DEFAULT_SITUATION);
    expect(changes).toHaveLength(10);
    expect(changes[9] ?? 0).toBeGreaterThan(changes[0] ?? 0);
  });
});
