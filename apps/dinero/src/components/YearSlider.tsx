import { colors, fonts, space } from '@explorables/ui/tokens.stylex';
import * as stylex from '@stylexjs/stylex';
import { useEffect, useState } from 'react';

import { m } from '../paraglide/messages';
import { whimsy } from '../theme.stylex';
import { a11y } from './visuallyHidden';

const PLAY_INTERVAL = 700;

export interface YearSliderProps {
  label: string;
  from: number;
  to: number;
  value: number;
  onChange: (year: number) => void;
}

/** A slider over a run of years, with a play button that sweeps through them. */
export function YearSlider({ label, from, to, value, onChange }: YearSliderProps) {
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!playing) return undefined;
    const timer = setInterval(() => {
      if (value >= to) setPlaying(false);
      else onChange(value + 1);
    }, PLAY_INTERVAL);
    return () => {
      clearInterval(timer);
    };
  }, [playing, value, to, onChange]);

  return (
    <div {...stylex.props(styles.row)}>
      <button
        type="button"
        aria-pressed={playing}
        onClick={() => {
          if (!playing && value >= to) onChange(from);
          setPlaying(!playing);
        }}
        {...stylex.props(styles.play)}
      >
        {playing ? `❚❚ ${m.pause()}` : `▶ ${m.play()}`}
      </button>
      <label {...stylex.props(styles.field)}>
        <span {...stylex.props(a11y.hidden)}>{label}</span>
        <input
          type="range"
          min={from}
          max={to}
          step={1}
          value={value}
          onChange={(event) => {
            setPlaying(false);
            onChange(Number(event.target.value));
          }}
          {...stylex.props(styles.range)}
        />
      </label>
      <output {...stylex.props(styles.year)}>{value}</output>
    </div>
  );
}

const styles = stylex.create({
  row: { display: 'flex', alignItems: 'center', gap: space.md },
  play: {
    appearance: 'none',
    flexShrink: 0,
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
  field: { display: 'flex', flexGrow: 1 },
  range: { width: '100%', accentColor: whimsy.coinEdge },
  year: {
    minWidth: '3ch',
    fontFamily: whimsy.display,
    fontSize: 28,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
  },
});
