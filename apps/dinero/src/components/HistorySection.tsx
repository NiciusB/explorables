import { chart, colors, space } from '@explorables/ui/tokens.stylex';
import * as stylex from '@stylexjs/stylex';
import { useState } from 'react';

import { timeline, marginalAt, rateCurve, scaleTax, topRate } from '../history/timeMachine';
import { formatEuros, formatPercent, intlLocale } from '../format';
import { m } from '../paraglide/messages';
import type { Locale } from '../paraglide/runtime';
import { CPI_CITATION, fromPresentEuros, PESETAS_PER_EURO } from '../prices';
import { HISTORICAL_SCALES } from '../history/scales';
import type { Profile } from '../profile';
import { useTween } from '../useTween';
import { RateCurveChart } from './RateCurveChart';
import { SourceNote } from './SourceNote';
import { Stat, StatRow } from './Stat';
import { YearPicker } from './YearPicker';
import { prose } from './prose';

const CURVE_POINTS = 240;
const MIN_CHART_BASE = 150_000;

const STORIES: Record<number, () => string> = {
  1979: m.history_story_1979,
  1992: m.history_story_1992,
  1999: m.history_story_1999,
  2007: m.history_story_2007,
  2012: m.history_story_2012,
  2026: m.history_story_2026,
};

export interface HistorySectionProps {
  profile: Profile;
  locale: Locale;
}

/** Chapter 2: the reader's taxable base taken back in time through every IRPF scale. */
export function HistorySection({ profile, locale }: HistorySectionProps) {
  const years = timeline(profile.region);
  const [year, setYear] = useState(1979);
  const real = years.find((entry) => entry.year === year) ?? years[0];
  const today = years.at(-1);
  if (real === undefined || today === undefined) return null;

  const base = profile.taxableBase;
  const maxBase = Math.max(MIN_CHART_BASE, Math.ceil((base * 1.6) / 10_000) * 10_000);
  const euros = (value: number) => formatEuros(value, locale);
  const percent = (value: number) => formatPercent(value, locale);
  const thenMarginal = marginalAt(real, base);

  return (
    <div {...stylex.props(prose.root)}>
      <p>{m.history_intro()}</p>
      <p>
        {profile.personal
          ? m.history_your_base({ base: euros(base) })
          : m.history_example_base({ base: euros(base), gross: euros(profile.gross) })}
      </p>
      <YearPicker
        label={m.history_year_label()}
        years={years.map((entry) => entry.year)}
        value={year}
        onChange={setYear}
      />
      <TweenedCurve
        rates={rateCurve(real, maxBase, CURVE_POINTS)}
        todayRates={rateCurve(today, maxBase, CURVE_POINTS)}
        maxBase={maxBase}
        base={base}
        rate={thenMarginal}
        locale={locale}
      />
      <ul {...stylex.props(styles.legend)}>
        <li>
          <span aria-hidden {...stylex.props(styles.swatch, styles.swatchThen)} />
          {m.history_legend_then({ year: String(year) })}
        </li>
        <li>
          <span aria-hidden {...stylex.props(styles.swatch, styles.swatchToday)} />
          {m.history_legend_today()}
        </li>
      </ul>
      <StatRow>
        <Stat
          label={m.history_stat_money({ year: String(year) })}
          value={nominalBase(base, year, locale)}
        />
        <Stat
          label={m.history_stat_marginal()}
          value={percent(thenMarginal)}
          note={m.history_today({ value: percent(marginalAt(today, base)) })}
        />
        <Stat
          label={m.history_stat_tax()}
          value={euros(scaleTax(real, base))}
          note={m.history_today({ value: euros(scaleTax(today, base)) })}
        />
      </StatRow>
      <p {...stylex.props(styles.story)}>{STORIES[year]?.()}</p>
      <TopRates
        years={years.map((entry) => ({ year: entry.year, top: topRate(entry) }))}
        selected={year}
        locale={locale}
      />
      <p {...stylex.props(prose.caption)}>{m.history_caveat()}</p>
      <SourceNote
        citations={[
          ...HISTORICAL_SCALES.flatMap((historical) => historical.citations),
          { source: 'lirpf', locator: 'art. 63.1' },
          CPI_CITATION,
        ]}
      />
    </div>
  );
}

/** The base in the money of `year`: pesetas before 2002, euros after. */
function nominalBase(base: number, year: number, locale: Locale): string {
  const euros = fromPresentEuros(base, year);
  if (year >= 2002) return formatEuros(euros, locale);
  const pesetas = Math.round((euros * PESETAS_PER_EURO) / 1000) * 1000;
  return m.pesetas({ amount: new Intl.NumberFormat(intlLocale(locale)).format(pesetas) });
}

interface TweenedCurveProps {
  rates: readonly number[];
  todayRates: readonly number[];
  maxBase: number;
  base: number;
  rate: number;
  locale: Locale;
}

/** The rate curve, morphing from one year's scale to the next. */
function TweenedCurve({ rates, todayRates, maxBase, base, rate, locale }: TweenedCurveProps) {
  const [tweenedRate, ...tweened] = useTween([rate, ...rates]);
  return (
    <RateCurveChart
      rates={tweened}
      todayRates={todayRates}
      maxBase={maxBase}
      marker={base}
      markerRate={tweenedRate ?? rate}
      label={m.history_chart_label()}
      locale={locale}
    />
  );
}

interface TopRatesProps {
  years: readonly { year: number; top: number }[];
  selected: number;
  locale: Locale;
}

/** A row of little columns: the top marginal rate of every year visited. */
function TopRates({ years, selected, locale }: TopRatesProps) {
  return (
    <figure {...stylex.props(styles.topRates)}>
      <figcaption {...stylex.props(styles.topCaption)}>{m.history_top_rates()}</figcaption>
      <ol {...stylex.props(styles.topList)}>
        {years.map(({ year, top }) => (
          <li key={year} {...stylex.props(styles.topItem)}>
            <span {...stylex.props(styles.topValue)}>{formatPercent(top, locale)}</span>
            <span
              aria-hidden
              {...stylex.props(
                styles.topBar,
                styles.topHeight(top),
                year === selected && styles.topSelected,
              )}
            />
            <span {...stylex.props(styles.topYear)}>{year}</span>
          </li>
        ))}
      </ol>
    </figure>
  );
}

const styles = stylex.create({
  legend: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: space.md,
    padding: 0,
    listStyle: 'none',
    fontSize: 14,
    color: colors.textMuted,
  },
  swatch: {
    display: 'inline-block',
    width: 18,
    height: 0,
    marginInlineEnd: space.xs,
    verticalAlign: 'middle',
    borderTopWidth: 3,
  },
  swatchThen: { borderTopStyle: 'solid', borderTopColor: chart.series2 },
  swatchToday: { borderTopStyle: 'dashed', borderTopColor: colors.textMuted },
  story: {
    padding: space.md,
    borderRadius: 14,
    borderInlineStartWidth: 4,
    borderInlineStartStyle: 'solid',
    borderInlineStartColor: colors.accent,
    backgroundColor: colors.surface,
  },
  topRates: { margin: 0 },
  topCaption: { fontSize: 15, fontWeight: 600, marginBottom: space.sm },
  topList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    alignItems: 'end',
    gap: space.sm,
    height: 150,
    margin: 0,
    padding: 0,
    listStyle: 'none',
  },
  topItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 2,
    height: '100%',
  },
  topValue: { fontSize: 12, fontVariantNumeric: 'tabular-nums', color: colors.textMuted },
  topBar: {
    width: '70%',
    borderRadius: '6px 6px 0 0',
    backgroundColor: colors.border,
    transition: 'background-color 200ms',
  },
  // The tallest possible rate (70%) fills 100px.
  topHeight: (top: number) => ({ height: Math.round((top / 0.7) * 100) }),
  topSelected: { backgroundColor: colors.accent },
  topYear: { fontSize: 13, fontWeight: 600, fontVariantNumeric: 'tabular-nums' },
});
