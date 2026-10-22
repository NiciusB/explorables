import { Toggle } from '@base-ui/react/toggle';
import { ToggleGroup } from '@base-ui/react/toggle-group';
import * as stylex from '@stylexjs/stylex';

import { colors, fonts, space } from './tokens.stylex';

export interface SegmentedControlOption<Value extends string> {
  value: Value;
  label: string;
}

export interface SegmentedControlProps<Value extends string> {
  /** Accessible name for the group. */
  label: string;
  options: readonly SegmentedControlOption<Value>[];
  value: Value;
  onChange: (value: Value) => void;
}

/** A single-choice row of toggle buttons; one option is always selected. */
export function SegmentedControl<Value extends string>({
  label,
  options,
  value,
  onChange,
}: SegmentedControlProps<Value>) {
  return (
    <ToggleGroup
      aria-label={label}
      value={[value]}
      onValueChange={(groupValue) => {
        // Pressing the selected option would empty the group; keep it selected instead.
        const [next] = groupValue;
        if (next !== undefined) onChange(next);
      }}
      {...stylex.props(styles.group)}
    >
      {options.map((option) => (
        <Toggle
          key={option.value}
          value={option.value}
          className={(state) =>
            stylex.props(styles.item, state.pressed && styles.pressed).className
          }
        >
          {option.label}
        </Toggle>
      ))}
    </ToggleGroup>
  );
}

const styles = stylex.create({
  group: {
    display: 'inline-flex',
    gap: space.xs,
    padding: space.xs,
    borderRadius: 999,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  item: {
    appearance: 'none',
    borderWidth: 0,
    borderRadius: 999,
    paddingBlock: space.xs,
    paddingInline: space.md,
    fontFamily: fonts.body,
    fontSize: 14,
    cursor: 'pointer',
    color: colors.textMuted,
    backgroundColor: 'transparent',
    outlineOffset: 2,
  },
  pressed: {
    color: colors.accentText,
    backgroundColor: colors.accent,
  },
});
