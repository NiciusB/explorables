import { describe, expect, it } from 'vite-plus/test';

import { formatDate, formatEuros, formatPercent, niceTicks } from './format';

// Intl output uses non-breaking spaces; normalise them for readable assertions.
const plain = (text: string) => text.replaceAll(/\s/g, ' ');

describe('formatting', () => {
  it('formats whole euros per locale', () => {
    expect(plain(formatEuros(30_000.4, 'es'))).toBe('30.000 €');
    expect(formatEuros(30_000.4, 'en')).toBe('€30,000');
    expect(plain(formatEuros(6.5, 'es', { cents: true }))).toBe('6,50 €');
  });

  it('formats percentages with at most one decimal', () => {
    expect(plain(formatPercent(0.2654, 'es'))).toBe('26,5 %');
    expect(formatPercent(0.2, 'en')).toBe('20%');
  });

  it('formats ISO dates as long dates', () => {
    expect(formatDate('2026-10-22', 'es')).toBe('22 de octubre de 2026');
    expect(formatDate('2026-10-22', 'en')).toBe('22 October 2026');
  });
});

describe('niceTicks', () => {
  it('picks round steps', () => {
    expect(niceTicks(30_000)).toEqual([0, 10_000, 20_000, 30_000]);
    expect(niceTicks(47_000)).toEqual([0, 10_000, 20_000, 30_000, 40_000]);
    expect(niceTicks(120_000)).toEqual([0, 50_000, 100_000]);
  });

  it('handles an empty range', () => {
    expect(niceTicks(0)).toEqual([0]);
  });
});
