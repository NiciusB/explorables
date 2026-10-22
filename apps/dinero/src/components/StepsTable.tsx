import { colors, space } from '@explorables/ui/tokens.stylex';
import * as stylex from '@stylexjs/stylex';

import { formatEuros, formatPercent } from '../format';
import { m } from '../paraglide/messages';
import type { Locale } from '../paraglide/runtime';
import { irpfRate, socialSecurityRate, type Step } from '../tax/marginal';

export interface StepsTableProps {
  steps: readonly Step[];
  locale: Locale;
}

/** The staircase as a table: each step's range and how its euros are split. */
export function StepsTable({ steps, locale }: StepsTableProps) {
  return (
    <table {...stylex.props(styles.table)}>
      <thead>
        <tr>
          <th {...stylex.props(styles.cell)}>{m.table_from()}</th>
          <th {...stylex.props(styles.cell)}>{m.table_to()}</th>
          <th {...stylex.props(styles.cell)}>{m.legend_social_security()}</th>
          <th {...stylex.props(styles.cell)}>{m.legend_irpf()}</th>
          <th {...stylex.props(styles.cell)}>{m.legend_net()}</th>
        </tr>
      </thead>
      <tbody>
        {steps.map((step) => {
          const social = socialSecurityRate(step);
          const irpf = irpfRate(step);
          return (
            <tr key={step.from}>
              <td {...stylex.props(styles.cell)}>{formatEuros(step.from, locale)}</td>
              <td {...stylex.props(styles.cell)}>{formatEuros(step.to, locale)}</td>
              <td {...stylex.props(styles.cell)}>{formatPercent(social, locale)}</td>
              <td {...stylex.props(styles.cell)}>{formatPercent(irpf, locale)}</td>
              <td {...stylex.props(styles.cell)}>{formatPercent(1 - social - irpf, locale)}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

const styles = stylex.create({
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: 14,
    fontVariantNumeric: 'tabular-nums',
  },
  cell: {
    paddingBlock: space.xs,
    paddingInline: space.sm,
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: colors.border,
    textAlign: 'end',
  },
});
