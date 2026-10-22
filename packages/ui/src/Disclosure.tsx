import { Collapsible } from '@base-ui/react/collapsible';
import * as stylex from '@stylexjs/stylex';
import type { ReactNode } from 'react';

import { colors, fonts, space } from './tokens.stylex';

export interface DisclosureProps {
  title: string;
  children: ReactNode;
}

/** A section that starts collapsed and expands when its title is pressed. */
export function Disclosure({ title, children }: DisclosureProps) {
  return (
    <Collapsible.Root {...stylex.props(styles.root)}>
      <Collapsible.Trigger {...stylex.props(styles.trigger)}>
        <span aria-hidden {...stylex.props(styles.caret)}>
          ▸
        </span>
        {title}
      </Collapsible.Trigger>
      <Collapsible.Panel {...stylex.props(styles.panel)}>{children}</Collapsible.Panel>
    </Collapsible.Root>
  );
}

const styles = stylex.create({
  root: {
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderTopColor: colors.border,
  },
  trigger: {
    display: 'flex',
    alignItems: 'center',
    gap: space.sm,
    width: '100%',
    paddingBlock: space.md,
    paddingInline: 0,
    borderWidth: 0,
    fontFamily: fonts.body,
    fontSize: 16,
    fontWeight: 600,
    textAlign: 'start',
    color: colors.text,
    backgroundColor: 'transparent',
    cursor: 'pointer',
  },
  caret: {
    color: colors.textMuted,
  },
  panel: {
    paddingBottom: space.md,
  },
});
