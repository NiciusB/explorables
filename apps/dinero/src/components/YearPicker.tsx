import { colors, fonts, space } from '@explorables/ui/tokens.stylex';
import * as stylex from '@stylexjs/stylex';
import { useEffect, useState } from 'react';

import { m } from '../paraglide/messages';
import { whimsy } from '../theme.stylex';
import { a11y } from './visuallyHidden';

const PLAY_INTERVAL = 1600;

export interface YearPickerProps {
  label: string;
  years: readonly number[];
  value: number;
  onChange: (year: number) => void;
}

/** A row of year tickets plus a play button that tours them in order. */
export function YearPicker({ label, years, value, onChange }: YearPickerProps) {
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!playing) return undefined;
    const timer = setInterval(() => {
      const index = years.indexOf(value);
      const next = years[index + 1];
      if (next === undefined) setPlaying(false);
      else onChange(next);
    }, PLAY_INTERVAL);
    return () => {
      clearInterval(timer);
    };
  }, [playing, years, value, onChange]);

  return (
    <fieldset {...stylex.props(styles.row)}>
      <legend {...stylex.props(a11y.hidden)}>{label}</legend>
      <button
        type="button"
        aria-pressed={playing}
        onClick={() => {
          if (!playing && value === years.at(-1)) onChange(years[0] ?? value);
          setPlaying(!playing);
        }}
        {...stylex.props(styles.play)}
      >
        {playing ? `❚❚ ${m.pause()}` : `▶ ${m.play()}`}
      </button>
      {years.map((year) => (
        <button
          key={year}
          type="button"
          aria-pressed={year === value}
          onClick={() => {
            setPlaying(false);
            onChange(year);
          }}
          {...stylex.props(styles.ticket, year === value && styles.selected)}
        >
          {year}
        </button>
      ))}
    </fieldset>
  );
}

const styles = stylex.create({
  row: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: space.xs,
    margin: 0,
    padding: 0,
    borderWidth: 0,
  },
  play: {
    appearance: 'none',
    paddingBlock: space.xs,
    paddingInline: space.md,
    borderWidth: 0,
    borderRadius: 999,
    fontFamily: fonts.body,
    fontSize: 14,
    fontWeight: 600,
    color: colors.accentText,
    backgroundColor: colors.accent,
    cursor: 'pointer',
  },
  ticket: {
    appearance: 'none',
    paddingBlock: space.xs,
    paddingInline: space.sm,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: whimsy.path,
    borderRadius: 8,
    fontFamily: whimsy.display,
    fontSize: 16,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    color: colors.text,
    backgroundColor: { default: 'transparent', ':hover': whimsy.paper },
    cursor: 'pointer',
    transition: 'transform 150ms ease-out',
  },
  selected: {
    borderStyle: 'solid',
    borderColor: whimsy.coinEdge,
    backgroundColor: whimsy.coin,
    color: whimsy.coinText,
    transform: 'rotate(-3deg)',
  },
});
