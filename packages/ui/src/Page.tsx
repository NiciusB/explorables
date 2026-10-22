import * as stylex from '@stylexjs/stylex';
import type { ReactNode } from 'react';

import { LanguageSwitcher } from './LanguageSwitcher';
import { colors, fonts, space } from './tokens.stylex';

export interface PageProps<Locale extends string> {
  /** Accessible name for the language control. */
  languageLabel: string;
  locales: readonly Locale[];
  locale: NoInfer<Locale>;
  onLocaleChange: (locale: Locale) => void;
  /** A link back to the site's home page; omit on the home page itself. */
  home?: { href: string; label: string };
  children: ReactNode;
}

/** The shell every page shares: background, reading column, home link, and language control. */
export function Page<Locale extends string>({
  languageLabel,
  locales,
  locale,
  onLocaleChange,
  home,
  children,
}: PageProps<Locale>) {
  return (
    <div {...stylex.props(styles.page)}>
      <div {...stylex.props(styles.column)}>
        <nav {...stylex.props(styles.bar)}>
          {home === undefined ? (
            <span />
          ) : (
            <a href={home.href} {...stylex.props(styles.home)}>
              ← {home.label}
            </a>
          )}
          <LanguageSwitcher
            label={languageLabel}
            locales={locales}
            value={locale}
            onChange={onLocaleChange}
          />
        </nav>
        <main {...stylex.props(styles.main)}>{children}</main>
      </div>
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
    paddingBlock: space.lg,
    paddingInline: space.md,
    fontSize: 18,
    lineHeight: 1.6,
  },
  bar: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.sm,
  },
  home: {
    fontSize: 15,
    fontWeight: 600,
    color: colors.textMuted,
    textDecoration: { default: 'none', ':hover': 'underline' },
  },
  main: {
    display: 'flex',
    flexDirection: 'column',
    gap: space.xl,
  },
});
