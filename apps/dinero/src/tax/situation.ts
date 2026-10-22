import type { Minimums } from './rules2026';

export type AgeGroup = 'under65' | '65to74' | '75plus';
export type Disability = 'none' | 'moderate' | 'severe';

/** The reader's personal circumstances that change their IRPF. */
export interface Situation {
  age: AgeGroup;
  children: number;
  /** How many of `children` are under 3. */
  childrenUnder3: number;
  /** Whether another parent claims the children too, which halves their minimum. */
  childrenShared: boolean;
  /** Moderate is a 33% to 64% disability; severe is 65% or more. */
  disability: Disability;
}

export const DEFAULT_SITUATION: Situation = {
  age: 'under65',
  children: 0,
  childrenUnder3: 0,
  childrenShared: true,
  disability: 'none',
};

/** Total personal and family minimum for `situation` under a set of minimum amounts. */
export function personalMinimum(minimums: Minimums, situation: Situation): number {
  let total = minimums.taxpayer;
  if (situation.age !== 'under65') total += minimums.over65;
  if (situation.age === '75plus') total += minimums.over75;

  let descendants = 0;
  for (let child = 0; child < situation.children; child += 1) {
    descendants += minimums.descendants[Math.min(child, 3)] ?? 0;
  }
  descendants += Math.min(situation.childrenUnder3, situation.children) * minimums.under3;
  total += situation.childrenShared ? descendants / 2 : descendants;

  switch (situation.disability) {
    case 'none':
      break;
    case 'moderate':
      total += minimums.disability;
      break;
    case 'severe':
      total += minimums.disabilitySevere + minimums.assistance;
      break;
  }
  return total;
}
