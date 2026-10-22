import { colors, space } from '@explorables/ui/tokens.stylex';
import * as stylex from '@stylexjs/stylex';

import { CHAPTER_IDS, CHAPTERS } from '../chapters';
import { formatEuros } from '../format';
import { m } from '../paraglide/messages';
import type { Locale } from '../paraglide/runtime';
import type { Profile } from '../profile';
import { whimsy } from '../theme.stylex';
import { useActiveChapter } from '../useActiveChapter';
import { NumberCoin } from './NumberCoin';
import { a11y } from './visuallyHidden';

export interface ChapterNavProps {
  profile: Profile;
  locale: Locale;
}

/** A sticky rail of chapter coins (the current one shines) and the salary everything uses. */
export function ChapterNav({ profile, locale }: ChapterNavProps) {
  const active = useActiveChapter(CHAPTER_IDS);
  const activeIndex = CHAPTERS.findIndex((chapter) => chapter.id === active);
  return (
    <nav aria-label={m.rail_label()} {...stylex.props(styles.bar)}>
      <ol {...stylex.props(styles.coins)}>
        {CHAPTERS.map((chapter, index) => {
          const current = chapter.id === active;
          return (
            <li key={chapter.id}>
              <a
                href={`#${chapter.id}`}
                aria-current={current ? 'location' : undefined}
                title={chapter.title()}
                {...stylex.props(styles.coinLink, current && styles.current)}
              >
                <NumberCoin number={index + 1} size={28} shiny={index <= activeIndex} />
                <span {...stylex.props(a11y.hidden)}>{chapter.title()}</span>
              </a>
            </li>
          );
        })}
      </ol>
      <a href="#sueldo" {...stylex.props(styles.chip, profile.personal && styles.chipPersonal)}>
        <span {...stylex.props(styles.chipLabel)}>
          {profile.personal ? m.rail_yours() : m.rail_example()}
        </span>
        <span {...stylex.props(styles.chipAmount)}>{formatEuros(profile.gross, locale)}</span>
      </a>
    </nav>
  );
}

const styles = stylex.create({
  bar: {
    position: 'sticky',
    top: 0,
    zIndex: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.sm,
    // Bleed to the edges of the page column, which is padded by space.md (16px).
    marginInline: -16,
    paddingBlock: space.sm,
    paddingInline: space.md,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: colors.border,
  },
  coins: {
    display: 'flex',
    gap: { default: 2, '@media (min-width: 420px)': space.xs },
    margin: 0,
    padding: 0,
    listStyle: 'none',
  },
  coinLink: {
    display: 'block',
    padding: 2,
    borderRadius: '50%',
    transition: 'transform 200ms cubic-bezier(.34,1.56,.64,1)',
    transform: { default: 'none', ':hover': 'translateY(-2px) rotate(-8deg)' },
  },
  current: {
    transform: 'scale(1.18)',
  },
  chip: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    paddingBlock: 2,
    paddingInline: space.sm,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: whimsy.path,
    color: colors.text,
    textDecoration: 'none',
    lineHeight: 1.2,
  },
  chipPersonal: {
    borderStyle: 'solid',
    borderColor: whimsy.you,
  },
  chipLabel: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    color: colors.textMuted,
  },
  chipAmount: {
    fontSize: 15,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
  },
});
