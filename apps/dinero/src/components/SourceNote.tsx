import { colors } from '@explorables/ui/tokens.stylex';
import * as stylex from '@stylexjs/stylex';

import { m } from '../paraglide/messages';
import { sources, type Citation } from '../sources';

/** "Source: …" under a figure, linking each citation to its document. */
export function SourceNote({ citations }: { citations: readonly Citation[] }) {
  return (
    <p {...stylex.props(styles.note)}>
      {m.source_label()}{' '}
      {citations.map((citation, index) => {
        const source = sources[citation.source];
        return (
          <span key={`${citation.source}-${citation.locator}`}>
            {index > 0 ? '; ' : null}
            <a href={source.url} title={source.title} {...stylex.props(styles.link)}>
              {source.publisher}
            </a>
            , {citation.locator}
          </span>
        );
      })}
      .
    </p>
  );
}

const styles = stylex.create({
  note: { fontSize: 13, lineHeight: 1.5, color: colors.textMuted, overflowWrap: 'anywhere' },
  link: { color: 'inherit' },
});
