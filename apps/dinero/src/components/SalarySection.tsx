import { Disclosure } from '@explorables/ui';
import { colors, space } from '@explorables/ui/tokens.stylex';
import * as stylex from '@stylexjs/stylex';
import { formatEuros, formatPercent } from '../format';
import { m } from '../paraglide/messages';
import type { Locale } from '../paraglide/runtime';
import { findHump, marginalRate, untaxedAmount } from '../salaryStory';
import { taxSystem, type TaxSystem } from '../tax/regions';
import type { SalaryState } from '../useSalary';
import { JourneyBar } from './JourneyBar';
import { Legend } from './Legend';
import { SalarySetup } from './SalarySetup';
import { Staircase } from './Staircase';
import { StepsTable } from './StepsTable';

const HUMP_CAUSE: Record<TaxSystem, () => string> = {
  common: m.hump_cause_common,
  basque: m.hump_cause_basque,
  navarra: m.hump_cause_navarra,
};

export interface SalarySectionProps {
  salary: SalaryState;
  locale: Locale;
}

/** Chapter 1: the reader's salary, from gross to net, euro by euro. */
export function SalarySection({ salary, locale }: SalarySectionProps) {
  const { region, gross, breakdown, steps } = salary;
  const system = taxSystem(region);
  const hump = findHump(steps);
  const untaxed = untaxedAmount(steps);
  const euros = (value: number) => formatEuros(value, locale);
  const per100 = (part: number) =>
    formatEuros(gross > 0 ? (part / gross) * 100 : 0, locale, { cents: true });

  return (
    <div {...stylex.props(styles.section)}>
      <SalarySetup salary={salary} locale={locale} />

      <h3 {...stylex.props(styles.subheading)}>{m.journey_title()}</h3>
      <p>
        {m.journey_lede({
          socialSecurity: per100(breakdown.socialSecurity),
          irpf: per100(breakdown.irpf),
          net: per100(breakdown.net),
        })}
      </p>
      <JourneyBar breakdown={breakdown} steps={steps} locale={locale} />
      <Legend />
      <p {...stylex.props(styles.muted)}>
        {m.journey_effective({
          irpf: euros(breakdown.irpf),
          rate: formatPercent(gross > 0 ? breakdown.irpf / gross : 0, locale),
        })}{' '}
        {m.journey_slices_hint()}
      </p>

      <h3 {...stylex.props(styles.subheading)}>{m.staircase_title()}</h3>
      <p>{m.staircase_lede()}</p>
      <Staircase gross={gross} steps={steps} locale={locale} />
      <Legend />
      {untaxed > 0 ? <p>{m.staircase_free({ amount: euros(untaxed) })}</p> : null}
      {gross > untaxed ? (
        <p>{m.staircase_marginal({ rate: formatPercent(marginalRate(steps), locale) })}</p>
      ) : null}
      {hump === undefined ? null : (
        <p>
          {m.staircase_hump({
            from: euros(hump.from),
            to: euros(hump.to),
            rate: formatPercent(hump.peakRate, locale),
          })}{' '}
          {HUMP_CAUSE[system]()}
        </p>
      )}
      <Disclosure title={m.table_toggle()}>
        <StepsTable steps={steps} locale={locale} />
      </Disclosure>

      <h3 {...stylex.props(styles.subheading)}>{m.assumptions_title()}</h3>
      <ul {...stylex.props(styles.muted)}>
        <li>{m.assumption_individual()}</li>
        <li>{m.assumption_contract()}</li>
        <li>{m.assumption_final()}</li>
        <li>{m.assumption_deductions()}</li>
        <li>{m.assumption_children()}</li>
        <li>{m.assumption_year()}</li>
      </ul>
    </div>
  );
}

const styles = stylex.create({
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: space.md,
    fontSize: 18,
    lineHeight: 1.6,
  },
  subheading: {
    fontSize: 22,
    marginTop: space.lg,
    marginBottom: 0,
  },
  muted: {
    fontSize: 15,
    color: colors.textMuted,
  },
});
