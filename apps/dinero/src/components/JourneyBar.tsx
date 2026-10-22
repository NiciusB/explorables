import { colors, space } from '@explorables/ui/tokens.stylex';
import * as stylex from '@stylexjs/stylex';

import { formatPercent } from '../format';
import type { Locale } from '../paraglide/runtime';
import type { SalaryBreakdown } from '../tax/irpf';
import { irpfRate, type Step } from '../tax/marginal';
import { seriesStyles } from './Legend';

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
}

/** One bar for the whole gross salary: Social Security, then IRPF slice by slice, then net. */
export function JourneyBar({ breakdown, steps, locale }: JourneyBarProps) {
  const { gross, socialSecurity, net } = breakdown;
  if (gross <= 0) return null;
  const share = (amount: number) => amount / gross;

  const segments: Segment[] = [
    {
      key: 'socialSecurity',
      share: share(socialSecurity),
      series: seriesStyles.socialSecurity,
      label: formatPercent(share(socialSecurity), locale),
    },
    ...steps
      .filter((step) => step.irpf > 0)
      .map((step) => ({
        key: `irpf-${String(step.from)}`,
        share: share(step.irpf),
        series: seriesStyles.irpf,
        label: formatPercent(irpfRate(step), locale),
      })),
    {
      key: 'net',
      share: share(net),
      series: seriesStyles.net,
      label: formatPercent(share(net), locale),
    },
  ].filter((segment) => segment.share > 0);

  return (
    <div aria-hidden {...stylex.props(styles.root)}>
      <div {...stylex.props(styles.row)}>
        {segments.map((segment) => (
          <div
            key={segment.key}
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
