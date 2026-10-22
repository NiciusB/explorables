import { chart, colors, space } from '@explorables/ui/tokens.stylex';
import * as stylex from '@stylexjs/stylex';

import { m } from '../paraglide/messages';

/** Identifies the three parts every salary is split into; shared by both charts. */
export function Legend() {
  const items = [
    { label: m.legend_social_security(), swatch: seriesStyles.socialSecurity },
    { label: m.legend_irpf(), swatch: seriesStyles.irpf },
    { label: m.legend_net(), swatch: seriesStyles.net },
  ];
  return (
    <ul {...stylex.props(styles.list)}>
      {items.map((item) => (
        <li key={item.label} {...stylex.props(styles.item)}>
          <span aria-hidden {...stylex.props(styles.swatch, item.swatch)} />
          {item.label}
        </li>
      ))}
    </ul>
  );
}

export const seriesStyles = stylex.create({
  socialSecurity: { fill: chart.series3, backgroundColor: chart.series3 },
  irpf: { fill: chart.series2, backgroundColor: chart.series2 },
  net: { fill: chart.series1, backgroundColor: chart.series1 },
});

const styles = stylex.create({
  list: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: space.md,
    margin: 0,
    padding: 0,
    listStyle: 'none',
    fontSize: 14,
    color: colors.textMuted,
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: space.xs,
  },
  swatch: {
    width: 12,
    height: 12,
    borderRadius: 3,
  },
});
