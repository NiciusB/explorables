import { colors, space } from '@explorables/ui/tokens.stylex';
import * as stylex from '@stylexjs/stylex';

/** Layout shared by every chapter's body: a column of prose and figures. */
export const prose = stylex.create({
  root: { display: 'flex', flexDirection: 'column', gap: space.md },
  subheading: { fontSize: 22, marginTop: space.lg, marginBottom: 0 },
  caption: { fontSize: 14, color: colors.textMuted },
});
