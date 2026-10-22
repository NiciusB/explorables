import { colors, space } from '@explorables/ui/tokens.stylex';
import * as stylex from '@stylexjs/stylex';
import type { ReactNode } from 'react';

import { whimsy } from '../theme.stylex';

export interface StatProps {
  label: string;
  value: string;
  /** A short comparison under the value, e.g. "today: 30%". */
  note?: string;
}

/** One headline number with its label, like a ticket stub. */
export function Stat({ label, value, note }: StatProps) {
  return (
    <div {...stylex.props(styles.stat)}>
      <dt {...stylex.props(styles.label)}>{label}</dt>
      <dd {...stylex.props(styles.value)}>{value}</dd>
      {note === undefined ? null : <dd {...stylex.props(styles.note)}>{note}</dd>}
    </div>
  );
}

/** A responsive row of stats. */
export function StatRow({ children }: { children: ReactNode }) {
  return <dl {...stylex.props(styles.row)}>{children}</dl>;
}

const styles = stylex.create({
  row: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
    gap: space.sm,
    margin: 0,
  },
  stat: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    padding: space.md,
    borderRadius: 14,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: whimsy.path,
    backgroundColor: whimsy.paper,
  },
  label: { fontSize: 13, lineHeight: 1.3, color: colors.textMuted },
  value: {
    margin: 0,
    fontFamily: whimsy.display,
    fontSize: 26,
    fontWeight: 700,
    lineHeight: 1.15,
    fontVariantNumeric: 'tabular-nums',
  },
  note: { margin: 0, fontSize: 13, color: colors.textMuted },
});
