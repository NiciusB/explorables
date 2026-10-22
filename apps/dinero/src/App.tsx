import { Page } from '@explorables/ui';
import { colors } from '@explorables/ui/tokens.stylex';
import * as stylex from '@stylexjs/stylex';

import { SalarySection } from './components/SalarySection';
import { Sources } from './components/Sources';
import { m } from './paraglide/messages';
import { getLocale, locales, setLocale } from './paraglide/runtime';

export function App() {
  const locale = getLocale();
  return (
    <Page
      languageLabel={m.language()}
      locales={locales}
      locale={locale}
      onLocaleChange={(next) => void setLocale(next)}
      home={{ href: '/', label: m.home_link() }}
    >
      <header>
        <h1 {...stylex.props(styles.title)}>{m.title()}</h1>
        <p {...stylex.props(styles.lede)}>{m.lede()}</p>
      </header>
      <SalarySection locale={locale} />
      <Sources locale={locale} />
    </Page>
  );
}

const styles = stylex.create({
  title: {
    fontSize: 'clamp(2rem, 6vw, 3rem)',
    lineHeight: 1.1,
    marginBlock: 0,
  },
  lede: {
    marginTop: 16,
    fontSize: 20,
    lineHeight: 1.5,
    color: colors.textMuted,
  },
});
