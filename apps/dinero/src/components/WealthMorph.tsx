import { SegmentedControl } from '@explorables/ui';
import { colors, space } from '@explorables/ui/tokens.stylex';
import * as stylex from '@stylexjs/stylex';
import { useState } from 'react';

import { formatPercent } from '../format';
import { wealthShares } from '../inequality/position';
import { m } from '../paraglide/messages';
import type { Locale } from '../paraglide/runtime';
import { ramp } from '../theme.stylex';
import { useTween } from '../useTween';

type View = 'people' | 'wealth';

const groupStyles = stylex.create({
  step1: { backgroundColor: ramp.step1, color: ramp.darkLabel },
  step2: { backgroundColor: ramp.step2, color: ramp.darkLabel },
  step3: { backgroundColor: ramp.step3, color: ramp.darkLabel },
  step4: { backgroundColor: ramp.step4, color: ramp.lightLabel },
  step5: { backgroundColor: ramp.step5, color: ramp.lightLabel },
});
const GROUP_STYLES = [
  groupStyles.step1,
  groupStyles.step2,
  groupStyles.step3,
  groupStyles.step4,
  groupStyles.step5,
];

/** The same households split two ways: by how many they are, then by how much they own. */
export function WealthMorph({ locale }: { locale: Locale }) {
  const [view, setView] = useState<View>('people');
  const groups = wealthShares();
  const target = groups.map((group) =>
    view === 'people' ? (group.to - group.from) / 100 : group.share,
  );
  const shares = useTween(target);
  const views = [
    { value: 'people', label: m.wealth_view_people() },
    { value: 'wealth', label: m.wealth_view_wealth() },
  ] as const satisfies readonly { value: View; label: string }[];

  return (
    <figure aria-label={m.wealth_label()} {...stylex.props(styles.root)}>
      <SegmentedControl
        label={m.wealth_view_label()}
        options={views}
        value={view}
        onChange={setView}
      />
      <div aria-hidden {...stylex.props(styles.bar)}>
        {groups.map((group, index) => (
          <span
            key={group.from}
            {...stylex.props(styles.segment, GROUP_STYLES[index], styles.grow(shares[index] ?? 0))}
          >
            {(shares[index] ?? 0) > 0.06 ? formatPercent(shares[index] ?? 0, locale) : null}
          </span>
        ))}
      </div>
      <ul {...stylex.props(styles.legend)}>
        {groups.map((group, index) => (
          <li key={group.from} {...stylex.props(styles.item)}>
            <span aria-hidden {...stylex.props(styles.swatch, GROUP_STYLES[index])} />
            {m.wealth_group({ from: String(group.from), to: String(group.to) })}:{' '}
            {formatPercent(group.share, locale)}
          </li>
        ))}
      </ul>
    </figure>
  );
}

const styles = stylex.create({
  root: { display: 'flex', flexDirection: 'column', gap: space.md, margin: 0 },
  bar: {
    display: 'flex',
    gap: 2,
    height: 56,
    overflow: 'hidden',
    borderRadius: 12,
  },
  segment: {
    display: 'grid',
    placeItems: 'center',
    minWidth: 2,
    overflow: 'hidden',
    fontSize: 13,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
  },
  grow: (share: number) => ({ flexGrow: share, flexBasis: 0 }),
  legend: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: space.sm,
    padding: 0,
    listStyle: 'none',
    fontSize: 14,
    color: colors.textMuted,
  },
  item: { display: 'flex', alignItems: 'center', gap: space.xs },
  swatch: { width: 12, height: 12, borderRadius: 3 },
});
