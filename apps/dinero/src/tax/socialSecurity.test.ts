import { describe, expect, it } from 'vite-plus/test';

import { socialSecurityContributions } from './socialSecurity';

describe('socialSecurityContributions', () => {
  it('charges 6.5% below the maximum base', () => {
    expect(socialSecurityContributions(30_000)).toBeCloseTo(1_950);
  });

  it('caps the base and adds the solidarity tranches above it', () => {
    // Monthly 5,833.33: 5,101.20 × 6.5% + 510.12 × 0.19% + 222.01 × 0.21%.
    const monthly = 5101.2 * 0.065 + (5611.32 - 5101.2) * 0.0019 + (70_000 / 12 - 5611.32) * 0.0021;
    expect(socialSecurityContributions(70_000)).toBeCloseTo(monthly * 12);
  });

  it('is zero for no salary', () => {
    expect(socialSecurityContributions(0)).toBe(0);
  });
});
