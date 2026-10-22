import { colors, space } from '@explorables/ui/tokens.stylex';
import * as stylex from '@stylexjs/stylex';

import { formatDate } from '../format';
import { m } from '../paraglide/messages';
import type { Locale } from '../paraglide/runtime';
import { sources } from '../sources';

/** Every document the explorable's data comes from. */
export function Sources({ locale }: { locale: Locale }) {
  return (
    <section>
      <h2 {...stylex.props(styles.heading)}>{m.sources_title()}</h2>
      <ol {...stylex.props(styles.list)}>
        {Object.entries(sources).map(([id, source]) => (
          <li key={id} {...stylex.props(styles.item)}>
            <a href={source.url} {...stylex.props(styles.link)}>
              {source.title}
            </a>
            . {source.publisher}.{' '}
            {m.sources_accessed({ date: formatDate(source.accessed, locale) })}
          </li>
        ))}
      </ol>
    </section>
  );
}

const styles = stylex.create({
  heading: {
    fontSize: 20,
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: space.sm,
    paddingInlineStart: space.lg,
    fontSize: 14,
    lineHeight: 1.5,
    color: colors.textMuted,
  },
  item: {
    overflowWrap: 'anywhere',
  },
  link: {
    color: colors.text,
  },
});
