import { SegmentedControl } from '@explorables/ui';
import { colors, fonts, space } from '@explorables/ui/tokens.stylex';
import * as stylex from '@stylexjs/stylex';

import { SalarySection } from './components/SalarySection';
import { Sources } from './components/Sources';
import { m } from './paraglide/messages';
import { getLocale, setLocale, type Locale } from './paraglide/runtime';

export function App() {
  const locale = getLocale();
  const languages = [
    { value: 'es', label: m.language_es() },
    { value: 'en', label: m.language_en() },
  ] as const satisfies readonly { value: Locale; label: string }[];

  return (
    <div {...stylex.props(styles.page)}>
      <main {...stylex.props(styles.column)}>
        <SegmentedControl
          label={m.language()}
          options={languages}
          value={locale}
          onChange={(next) => {
            void setLocale(next);
          }}
        />
        <h1 {...stylex.props(styles.title)}>{m.title()}</h1>
        <p {...stylex.props(styles.lead)}>{m.lede()}</p>
        <SalarySection locale={locale} />
        <Sources locale={locale} />
      </main>
    </div>
  );
}

const styles = stylex.create({
  page: {
    minHeight: '100vh',
    backgroundColor: colors.background,
    color: colors.text,
    fontFamily: fonts.body,
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
    gap: space.lg,
    maxWidth: 720,
    marginInline: 'auto',
    paddingBlock: space.xl,
    paddingInline: space.md,
  },
  title: {
    fontSize: 'clamp(2rem, 6vw, 3rem)',
    lineHeight: 1.1,
    marginBlock: 0,
  },
  lead: {
    fontSize: 20,
    lineHeight: 1.5,
    color: colors.textMuted,
    marginBlock: 0,
  },
});
