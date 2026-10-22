import { Disclosure, NumberField, Select } from '@explorables/ui';
import { colors, space } from '@explorables/ui/tokens.stylex';
import * as stylex from '@stylexjs/stylex';
import { useId } from 'react';

import { formatEuros, intlLocale } from '../format';
import { m } from '../paraglide/messages';
import type { Locale } from '../paraglide/runtime';
import { REGION_NAMES } from '../regionNames';
import { REGIONS, taxSystem } from '../tax/regions';
import type { PayBasis } from '../tax/salary';
import { whimsy } from '../theme.stylex';
import type { SalaryState } from '../useSalary';
import { CoinStack } from './illustrations';
import { SituationForm } from './SituationForm';

const STEP_BY_BASIS: Record<PayBasis, number> = { grossYear: 1000, net12: 50, net14: 50 };

/** A small payslip: choose the units first, then enter the amount you know. */
export function SalarySetup({ salary, locale }: { salary: SalaryState; locale: Locale }) {
  const id = useId();
  const { amount, basis, region, breakdown, gross, situation } = salary;
  const bases = [
    { value: 'net12', label: m.pay_basis_net12(), mark: '12', hint: m.pay_hint_net12() },
    { value: 'net14', label: m.pay_basis_net14(), mark: '14', hint: m.pay_hint_net14() },
    { value: 'grossYear', label: m.pay_basis_gross_year(), mark: '€', hint: m.pay_hint_gross() },
  ] as const;
  const regions = REGIONS.map((value) => ({ value, label: REGION_NAMES[value]() })).toSorted(
    (a, b) => a.label.localeCompare(b.label, intlLocale(locale)),
  );
  const amountHint = basis === 'grossYear' ? m.pay_amount_gross() : m.pay_amount_net();

  return (
    <div {...stylex.props(styles.sheet)}>
      <div {...stylex.props(styles.header)}>
        <div>
          <h3 {...stylex.props(styles.title)}>{m.salary_setup_title()}</h3>
          <p {...stylex.props(styles.intro)}>{m.salary_prompt()}</p>
        </div>
        <span {...stylex.props(styles.coins)}>
          <CoinStack size={64} />
        </span>
      </div>

      <fieldset {...stylex.props(styles.fieldset)}>
        <legend {...stylex.props(styles.legend)}>{m.pay_basis_label()}</legend>
        <div {...stylex.props(styles.modes)}>
          {bases.map((option) => (
            <label
              key={option.value}
              {...stylex.props(styles.mode, basis === option.value && styles.selected)}
            >
              <span {...stylex.props(styles.modeTop)}>
                <span aria-hidden="true" {...stylex.props(styles.mark)}>
                  {option.mark}
                </span>
                <input
                  type="radio"
                  name={`${id}-basis`}
                  value={option.value}
                  checked={basis === option.value}
                  onChange={() => salary.setBasis(option.value)}
                  aria-labelledby={`${id}-${option.value}`}
                  aria-describedby={`${id}-${option.value}-hint`}
                  {...stylex.props(styles.radio)}
                />
              </span>
              <span id={`${id}-${option.value}`} {...stylex.props(styles.modeLabel)}>
                {option.label}
              </span>
              <span id={`${id}-${option.value}-hint`} {...stylex.props(styles.hint)}>
                {option.hint}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div {...stylex.props(styles.controls)}>
        <div {...stylex.props(styles.amount)}>
          <NumberField
            label={m.salary_amount_label()}
            value={amount}
            onChange={salary.setAmount}
            min={0}
            max={1_000_000}
            step={STEP_BY_BASIS[basis]}
            size="large"
            format={{ style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }}
            locale={intlLocale(locale)}
            decrementLabel={m.decrease()}
            incrementLabel={m.increase()}
          />
          <span {...stylex.props(styles.hint)}>{amountHint}</span>
        </div>
        <Select
          label={m.region_label()}
          options={regions}
          value={region}
          onChange={salary.setRegion}
        />
      </div>

      <p {...stylex.props(styles.equivalents)} aria-live="polite" aria-atomic="true">
        {m.salary_equivalents({
          gross: formatEuros(gross, locale),
          net12: formatEuros(breakdown.net / 12, locale),
          net14: formatEuros(breakdown.net / 14, locale),
        })}
      </p>
      <Disclosure title={m.advanced_title()}>
        <SituationForm
          situation={situation}
          system={taxSystem(region)}
          onChange={salary.setSituation}
        />
      </Disclosure>
    </div>
  );
}

const styles = stylex.create({
  sheet: {
    display: 'flex',
    flexDirection: 'column',
    gap: space.lg,
    padding: { default: space.lg, '@media (max-width: 480px)': space.md },
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: whimsy.path,
    borderRadius: 24,
    backgroundColor: whimsy.paper,
    boxShadow: '3px 5px 0 rgb(120 90 40 / 0.12)',
    minWidth: 0,
  },
  header: { display: 'flex', alignItems: 'start', gap: space.md, justifyContent: 'space-between' },
  title: { fontFamily: whimsy.display, fontSize: 30, lineHeight: 1.15, margin: 0 },
  intro: {
    fontSize: 16,
    lineHeight: 1.5,
    color: colors.textMuted,
    marginTop: space.sm,
    marginBottom: 0,
  },
  coins: {
    flexShrink: 0,
    transform: 'rotate(8deg)',
    '@media (max-width: 480px)': { display: 'none' },
  },
  fieldset: { borderWidth: 0, padding: 0, margin: 0, minWidth: 0 },
  legend: { fontSize: 14, fontWeight: 600, padding: 0, marginBottom: space.sm },
  modes: {
    display: 'grid',
    gridTemplateColumns: {
      default: 'repeat(3, minmax(0, 1fr))',
      '@media (max-width: 480px)': '1fr',
    },
    gap: space.sm,
  },
  mode: {
    display: 'flex',
    flexDirection: 'column',
    gap: space.xs,
    position: 'relative',
    padding: space.md,
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: {
      default: colors.border,
      ':hover': whimsy.coinEdge,
      ':focus-within': colors.accent,
    },
    borderRadius: 14,
    backgroundColor: colors.surface,
    color: colors.text,
    cursor: 'pointer',
    outline: { default: 'none', ':focus-within': `2px solid ${colors.accent}` },
    outlineOffset: 3,
    '@media (max-width: 480px)': { paddingBlock: space.sm, paddingLeft: 66 },
  },
  selected: {
    borderColor: whimsy.coinEdge,
    backgroundColor: whimsy.coin,
    color: whimsy.coinText,
    boxShadow: `0 3px 0 ${whimsy.coinEdge}`,
  },
  modeTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    '@media (max-width: 480px)': {
      position: 'absolute',
      left: 14,
      top: 8,
      bottom: 8,
      gap: space.sm,
    },
  },
  mark: {
    fontFamily: whimsy.display,
    fontSize: 30,
    fontWeight: 700,
    lineHeight: 1.2,
    '@media (max-width: 480px)': { fontSize: 24 },
  },
  radio: {
    width: 18,
    height: 18,
    margin: 0,
    accentColor: whimsy.coinText,
    cursor: 'pointer',
    '@media (max-width: 480px)': { width: 14, height: 14 },
  },
  modeLabel: { fontSize: 15, fontWeight: 650, lineHeight: 1.35 },
  hint: { fontSize: 13, lineHeight: 1.4 },
  controls: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(220px, 100%), 1fr))',
    gap: space.md,
    alignItems: 'center',
  },
  amount: { display: 'flex', flexDirection: 'column', gap: space.xs },
  equivalents: {
    margin: 0,
    paddingTop: space.md,
    borderTopWidth: 2,
    borderTopStyle: 'dashed',
    borderTopColor: whimsy.path,
    fontSize: 15,
    lineHeight: 1.6,
    color: colors.textMuted,
  },
});
