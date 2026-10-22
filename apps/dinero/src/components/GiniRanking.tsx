import { chart, colors, space } from '@explorables/ui/tokens.stylex';
import * as stylex from '@stylexjs/stylex';

import { formatNumber, intlLocale } from '../format';
import { COMMUNITIES, GINI, type Community } from '../inequality/data';
import { m } from '../paraglide/messages';
import type { Locale } from '../paraglide/runtime';
import { communityName } from '../regionNames';
import { whimsy } from '../theme.stylex';
import { useChartTooltip } from './useChartTooltip';

/** The axis starts here so differences between communities are visible; noted in the caption. */
const AXIS_FROM = 20;
const AXIS_TO = 40;

export interface GiniRankingProps {
  highlight: Community;
  locale: Locale;
}

/** Every community's latest Gini, most unequal first, with the reader's and Spain's marked. */
export function GiniRanking({ highlight, locale }: GiniRankingProps) {
  const rows = COMMUNITIES.map((community) => ({
    community,
    name: communityName(community),
    gini: GINI[community].at(-1) ?? 0,
  })).toSorted((a, b) => b.gini - a.gini || a.name.localeCompare(b.name, intlLocale(locale)));
  const spain = GINI.spain.at(-1) ?? 0;
  const width = (gini: number) => `${String(((gini - AXIS_FROM) / (AXIS_TO - AXIS_FROM)) * 100)}%`;
  const format = (gini: number) => formatNumber(gini, locale);

  const tip = useChartTooltip(
    rows.map((row) =>
      m.chart_gini_comparison({
        region: row.name,
        value: format(row.gini),
        spain: format(spain),
      }),
    ),
  );
  return (
    <figure {...stylex.props(styles.root)}>
      <ol {...stylex.props(styles.list)}>
        {rows.map((row, index) => (
          <li
            key={row.community}
            {...stylex.props(styles.row, row.community === highlight && styles.mine)}
          >
            <span {...stylex.props(styles.name)}>{row.name}</span>
            <span {...tip.target(index)} {...stylex.props(styles.track)}>
              <span
                {...stylex.props(
                  styles.bar,
                  styles.width(width(row.gini)),
                  row.community === highlight && styles.barMine,
                )}
              />
              <span {...stylex.props(styles.spain, styles.left(width(spain)))} />
            </span>
            <span {...stylex.props(styles.value)}>{format(row.gini)}</span>
          </li>
        ))}
      </ol>
      <figcaption {...stylex.props(styles.caption)}>
        {m.gini_caption({ spain: format(spain), from: String(AXIS_FROM) })}
      </figcaption>
      {tip.tooltip}
    </figure>
  );
}

const styles = stylex.create({
  root: { margin: 0 },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
    margin: 0,
    padding: 0,
    listStyle: 'none',
  },
  row: {
    display: 'grid',
    gridTemplateColumns: 'minmax(110px, 38%) 1fr 3em',
    alignItems: 'center',
    gap: space.sm,
    fontSize: 14,
    color: colors.textMuted,
  },
  mine: { fontWeight: 700, color: colors.text },
  name: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  track: { position: 'relative', height: 14 },
  bar: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    borderRadius: 7,
    backgroundColor: chart.series1,
    opacity: 0.55,
  },
  barMine: { backgroundColor: whimsy.you, opacity: 1 },
  width: (width: string) => ({ width }),
  spain: { position: 'absolute', top: -3, bottom: -3, width: 2, backgroundColor: colors.text },
  left: (left: string) => ({ left }),
  value: { fontVariantNumeric: 'tabular-nums', textAlign: 'end' },
  caption: { marginTop: space.sm, fontSize: 13, color: colors.textMuted },
});
