import { colors, space } from '@explorables/ui/tokens.stylex';
import * as stylex from '@stylexjs/stylex';

import { formatEuros, formatPercent } from '../format';
import { m } from '../paraglide/messages';
import type { Locale } from '../paraglide/runtime';
import type { SalaryBreakdown } from '../tax/irpf';
import { irpfRate, type Step } from '../tax/marginal';
import { seriesStyles } from './Legend';
import { useChartTooltip } from './useChartTooltip';

/** Segments narrower than this share of the bar get no label. */
const MIN_LABEL_SHARE = 0.06;

export interface JourneyBarProps {
  breakdown: SalaryBreakdown;
  steps: readonly Step[];
  locale: Locale;
}

interface Segment {
  key: string;
  share: number;
  series: stylex.StyleXStyles;
  label: string;
  detail: string;
}

/** One bar for the whole gross salary: Social Security, then IRPF slice by slice, then net. */
export function JourneyBar({ breakdown, steps, locale }: JourneyBarProps) {
  const { gross, socialSecurity, net } = breakdown;
  const share = (amount: number) => amount / Math.max(1, gross);

  const segments: Segment[] = [
    {
      key: 'socialSecurity',
      detail: m.legend_social_security(),
      share: share(socialSecurity),
      series: seriesStyles.socialSecurity,
      label: formatPercent(share(socialSecurity), locale),
    },
    ...steps
      .filter((step) => step.irpf > 0)
      .map((step) => ({
        key: `irpf-${String(step.from)}`,
        detail: `${m.legend_irpf()} · ${m.tooltip_range({ from: formatEuros(step.from, locale), to: formatEuros(step.to, locale) })}`,
        share: share(step.irpf),
        series: seriesStyles.irpf,
        label: formatPercent(irpfRate(step), locale),
      })),
    {
      key: 'net',
      detail: m.legend_net(),
      share: share(net),
      series: seriesStyles.net,
      label: formatPercent(share(net), locale),
    },
  ].filter((segment) => segment.share > 0);

  const tip = useChartTooltip(
    segments.map((segment) =>
      m.chart_journey_segment({
        label: segment.detail,
        amount: formatEuros(segment.share * gross, locale),
        share: formatPercent(segment.share, locale),
      }),
    ),
  );
  if (gross <= 0) return null;
  return (
    <div {...stylex.props(styles.root)}>
      <div {...stylex.props(styles.row)}>
        {segments.map((segment, index) => (
          <div
            key={segment.key}
            {...tip.target(index)}
            {...stylex.props(styles.fill, segment.series, styles.width(segment.share))}
          />
        ))}
      </div>
      <div {...stylex.props(styles.row)}>
        {segments.map((segment) => (
          <div key={segment.key} {...stylex.props(styles.label, styles.width(segment.share))}>
            {segment.share >= MIN_LABEL_SHARE ? segment.label : null}
          </div>
        ))}
      </div>
      {tip.tooltip}
    </div>
  );
}

const styles = stylex.create({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: space.xs,
    marginBlock: space.md,
  },
  row: {
    display: 'flex',
    gap: 2,
  },
  fill: {
    height: 40,
    minWidth: 2,
    borderRadius: 4,
  },
  label: {
    minWidth: 2,
    overflow: 'hidden',
    fontSize: 13,
    fontVariantNumeric: 'tabular-nums',
    textAlign: 'center',
    whiteSpace: 'nowrap',
    color: colors.textMuted,
  },
  width: (share: number) => ({
    flexGrow: share,
    flexBasis: 0,
  }),
});
