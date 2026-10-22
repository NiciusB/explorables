import { describe, expect, it } from 'vite-plus/test';

import { state } from './rules2026';
import { DEFAULT_SITUATION, perChild, personalMinimum } from './situation';

const minimums = state.minimums;

describe('personalMinimum', () => {
  it('is the taxpayer minimum by default', () => {
    expect(personalMinimum(minimums, DEFAULT_SITUATION)).toBe(5550);
  });

  it('adds the age increments cumulatively', () => {
    expect(personalMinimum(minimums, { ...DEFAULT_SITUATION, age: '65to74' })).toBe(5550 + 1150);
    expect(personalMinimum(minimums, { ...DEFAULT_SITUATION, age: '75plus' })).toBe(
      5550 + 1150 + 1400,
    );
  });

  it('counts children in order, with the fourth amount for every later child', () => {
    const fiveChildren = { ...DEFAULT_SITUATION, children: 5, childrenShared: false };
    expect(personalMinimum(minimums, fiveChildren)).toBe(5550 + 2400 + 2700 + 4000 + 4500 + 4500);
  });

  it('adds the under-3 amount and halves children shared with another parent', () => {
    const shared = { ...DEFAULT_SITUATION, children: 2, childrenUnder3: 1 };
    expect(personalMinimum(minimums, shared)).toBe(5550 + (2400 + 2700 + 2800) / 2);
  });

  it('never counts more under-3s than children', () => {
    const inconsistent = {
      ...DEFAULT_SITUATION,
      children: 1,
      childrenUnder3: 3,
      childrenShared: false,
    };
    expect(personalMinimum(minimums, inconsistent)).toBe(5550 + 2400 + 2800);
  });

  it('adds disability, with assistance for severe disability', () => {
    expect(personalMinimum(minimums, { ...DEFAULT_SITUATION, disability: 'moderate' })).toBe(
      5550 + 3000,
    );
    expect(personalMinimum(minimums, { ...DEFAULT_SITUATION, disability: 'severe' })).toBe(
      5550 + 9000 + 3000,
    );
  });
});

describe('perChild', () => {
  it('repeats the last amount for later children', () => {
    expect(perChild([1, 2, 3], 0)).toBe(0);
    expect(perChild([1, 2, 3], 2)).toBe(3);
    expect(perChild([1, 2, 3], 5)).toBe(1 + 2 + 3 + 3 + 3);
  });
});
