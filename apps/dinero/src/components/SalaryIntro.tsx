import { colors, space } from '@explorables/ui/tokens.stylex';
import * as stylex from '@stylexjs/stylex';

import { formatEuros } from '../format';
import { m } from '../paraglide/messages';
import type { Locale } from '../paraglide/runtime';
import { whimsy } from '../theme.stylex';
import type { SalaryState } from '../useSalary';

export interface SalaryIntroProps {
  salary: SalaryState;
  locale: Locale;
}

/** Tells the reader their salary is optional, and whether the rest of the page uses it. */
export function SalaryIntro({ salary, locale }: SalaryIntroProps) {
  const { profile } = salary;
  return (
    <output {...stylex.props(styles.note, profile.personal && styles.personal)}>
      {profile.personal ? (
        <>
          <span>{m.salary_personal({ gross: formatEuros(profile.gross, locale) })}</span>
          <button type="button" onClick={salary.reset} {...stylex.props(styles.link)}>
            {m.salary_reset()}
          </button>
        </>
      ) : (
        <>
          <span>{m.salary_optional({ gross: formatEuros(profile.gross, locale) })}</span>
          <a href="#historia" {...stylex.props(styles.link)}>
            {m.salary_skip()} →
          </a>
        </>
      )}
    </output>
  );
}

const styles = stylex.create({
  note: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: space.sm,
    padding: space.md,
    borderRadius: 14,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: whimsy.path,
    fontSize: 16,
    backgroundColor: whimsy.paper,
  },
  personal: {
    borderStyle: 'solid',
    borderColor: whimsy.you,
  },
  link: {
    appearance: 'none',
    padding: 0,
    borderWidth: 0,
    fontFamily: 'inherit',
    fontSize: 15,
    fontWeight: 600,
    color: colors.accent,
    backgroundColor: 'transparent',
    textDecoration: 'underline',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
});
