import { colors, space } from '@explorables/ui/tokens.stylex';
import * as stylex from '@stylexjs/stylex';
import type { ReactNode } from 'react';

import { CHAPTERS, type ChapterInfo } from '../chapters';
import { m } from '../paraglide/messages';
import { whimsy } from '../theme.stylex';
import { NumberCoin } from './NumberCoin';

export interface ChapterProps {
  chapter: ChapterInfo;
  children: ReactNode;
}

/** One chapter of the story: a playful header, its content, and a hop to the next one. */
export function Chapter({ chapter, children }: ChapterProps) {
  const index = CHAPTERS.indexOf(chapter);
  const next = CHAPTERS[index + 1];
  const { Illustration } = chapter;
  const headingId = `${chapter.id}-title`;
  return (
    <section id={chapter.id} aria-labelledby={headingId} {...stylex.props(styles.section)}>
      <header {...stylex.props(styles.header)}>
        <div {...stylex.props(styles.titles)}>
          <span {...stylex.props(styles.kicker)}>
            <NumberCoin number={index + 1} size={28} />
            {m.chapter_kicker({ number: String(index + 1) })}
          </span>
          <h2 id={headingId} {...stylex.props(styles.title)}>
            {chapter.title()}
          </h2>
        </div>
        <div {...stylex.props(styles.art)}>
          <Illustration size={72} />
        </div>
      </header>
      {children}
      {next === undefined ? null : (
        <a href={`#${next.id}`} {...stylex.props(styles.next)}>
          <span {...stylex.props(styles.nextLabel)}>{m.chapter_next()}</span>
          <span {...stylex.props(styles.nextTitle)}>{next.title()} ↓</span>
        </a>
      )}
    </section>
  );
}

const wobble = stylex.keyframes({
  '0%, 100%': { transform: 'rotate(0deg)' },
  '50%': { transform: 'rotate(-6deg) translateY(-2px)' },
});

const styles = stylex.create({
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: space.md,
    // Leave room for the sticky chapter rail when jumping to a chapter.
    scrollMarginTop: 72,
  },
  header: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: space.md,
    paddingBottom: space.sm,
    borderBottomWidth: 2,
    borderBottomStyle: 'dashed',
    borderBottomColor: whimsy.path,
  },
  titles: {
    display: 'flex',
    flexDirection: 'column',
    gap: space.xs,
  },
  kicker: {
    display: 'flex',
    alignItems: 'center',
    gap: space.sm,
    fontSize: 14,
    fontWeight: 600,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: colors.textMuted,
  },
  title: {
    margin: 0,
    fontFamily: whimsy.display,
    fontSize: 'clamp(1.9rem, 5vw, 2.6rem)',
    fontWeight: 700,
    lineHeight: 1.05,
    fontVariationSettings: '"SOFT" 100, "WONK" 1',
  },
  art: {
    animationName: wobble,
    animationDuration: '4s',
    animationIterationCount: 'infinite',
    animationTimingFunction: 'ease-in-out',
    '@media (prefers-reduced-motion: reduce)': { animationName: 'none' },
  },
  next: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    alignSelf: 'flex-end',
    marginTop: space.lg,
    paddingBlock: space.sm,
    paddingInline: space.md,
    borderRadius: 14,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: whimsy.path,
    color: colors.text,
    textDecoration: 'none',
    transition: 'transform 150ms ease-out, border-color 150ms',
    transform: { default: 'none', ':hover': 'translateY(2px) rotate(-1deg)' },
    backgroundColor: whimsy.paper,
  },
  nextLabel: {
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: colors.textMuted,
  },
  nextTitle: {
    fontFamily: whimsy.display,
    fontSize: 20,
    fontWeight: 600,
  },
});
