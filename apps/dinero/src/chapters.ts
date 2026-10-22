import type { ComponentType } from 'react';

import {
  Balance,
  BallotBox,
  CoinStack,
  Hourglass,
  Parade,
  Trend,
  type IllustrationProps,
} from './components/illustrations';
import { m } from './paraglide/messages';

export const CHAPTER_IDS = [
  'sueldo',
  'historia',
  'desigualdad',
  'evolucion',
  'capital',
  'elecciones',
] as const;
export type ChapterId = (typeof CHAPTER_IDS)[number];

export interface ChapterInfo {
  id: ChapterId;
  title: () => string;
  teaser: () => string;
  Illustration: ComponentType<IllustrationProps>;
}

/** The chapters in reading order; ids double as URL fragments. */
export const CHAPTERS: readonly ChapterInfo[] = [
  {
    id: 'sueldo',
    title: m.chapter_salary_title,
    teaser: m.chapter_salary_teaser,
    Illustration: CoinStack,
  },
  {
    id: 'historia',
    title: m.chapter_history_title,
    teaser: m.chapter_history_teaser,
    Illustration: Hourglass,
  },
  {
    id: 'desigualdad',
    title: m.chapter_inequality_title,
    teaser: m.chapter_inequality_teaser,
    Illustration: Parade,
  },
  {
    id: 'evolucion',
    title: m.chapter_evolution_title,
    teaser: m.chapter_evolution_teaser,
    Illustration: Trend,
  },
  {
    id: 'capital',
    title: m.chapter_capital_title,
    teaser: m.chapter_capital_teaser,
    Illustration: Balance,
  },
  {
    id: 'elecciones',
    title: m.chapter_elections_title,
    teaser: m.chapter_elections_teaser,
    Illustration: BallotBox,
  },
];
