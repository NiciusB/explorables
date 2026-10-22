import { Page } from '@explorables/ui';
import { colors, space } from '@explorables/ui/tokens.stylex';
import * as stylex from '@stylexjs/stylex';
import type { ReactNode } from 'react';

import { CHAPTERS, type ChapterId } from './chapters';
import { CapitalSection } from './components/CapitalSection';
import { Chapter } from './components/Chapter';
import { ChapterMap } from './components/ChapterMap';
import { ChapterNav } from './components/ChapterNav';
import { ElectionsSection } from './components/ElectionsSection';
import { EvolutionSection } from './components/EvolutionSection';
import { HistorySection } from './components/HistorySection';
import { CoinStack } from './components/illustrations';
import { InequalitySection } from './components/InequalitySection';
import { SalaryIntro } from './components/SalaryIntro';
import { SalarySection } from './components/SalarySection';
import { Sources } from './components/Sources';
import { m } from './paraglide/messages';
import { getLocale, locales, setLocale } from './paraglide/runtime';
import { whimsy } from './theme.stylex';
import { useSalary } from './useSalary';

export function App() {
  const locale = getLocale();
  const salary = useSalary();
  const { profile } = salary;
  const content: Record<ChapterId, ReactNode> = {
    sueldo: (
      <>
        <SalaryIntro salary={salary} locale={locale} />
        <SalarySection salary={salary} locale={locale} />
      </>
    ),
    historia: <HistorySection profile={profile} locale={locale} />,
    desigualdad: <InequalitySection profile={profile} locale={locale} />,
    evolucion: <EvolutionSection profile={profile} locale={locale} />,
    capital: <CapitalSection profile={profile} locale={locale} />,
    elecciones: <ElectionsSection profile={profile} locale={locale} />,
  };

  return (
    <Page
      languageLabel={m.language()}
      locales={locales}
      locale={locale}
      onLocaleChange={(next) => void setLocale(next)}
      home={{ href: '/', label: m.home_link() }}
    >
      <header {...stylex.props(styles.cover)}>
        <div {...stylex.props(styles.coins)}>
          <CoinStack size={88} />
        </div>
        <h1 {...stylex.props(styles.title)}>{m.title()}</h1>
        <p {...stylex.props(styles.lede)}>{m.lede()}</p>
        <p>{m.cover_how()}</p>
      </header>
      <ChapterMap />
      <ChapterNav profile={profile} locale={locale} />
      {CHAPTERS.map((chapter) => (
        <Chapter key={chapter.id} chapter={chapter}>
          {content[chapter.id]}
        </Chapter>
      ))}
      <Sources locale={locale} />
    </Page>
  );
}

const bounce = stylex.keyframes({
  '0%': { transform: 'translateY(-24px) rotate(-12deg)', opacity: 0 },
  '60%': { transform: 'translateY(4px) rotate(4deg)', opacity: 1 },
  '100%': { transform: 'none', opacity: 1 },
});

const styles = stylex.create({
  cover: {
    display: 'flex',
    flexDirection: 'column',
    gap: space.md,
  },
  coins: {
    animationName: bounce,
    animationDuration: '900ms',
    animationTimingFunction: 'cubic-bezier(.34,1.56,.64,1)',
    '@media (prefers-reduced-motion: reduce)': { animationName: 'none' },
  },
  title: {
    margin: 0,
    fontFamily: whimsy.display,
    fontSize: 'clamp(2.6rem, 9vw, 4.4rem)',
    fontWeight: 800,
    lineHeight: 0.98,
    letterSpacing: '-0.02em',
    fontVariationSettings: '"SOFT" 100, "WONK" 1',
  },
  lede: {
    fontSize: 21,
    lineHeight: 1.45,
    color: colors.textMuted,
  },
});
