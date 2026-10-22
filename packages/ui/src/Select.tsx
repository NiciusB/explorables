import { Select as BaseSelect } from '@base-ui/react/select';
import * as stylex from '@stylexjs/stylex';

import { colors, fonts, space } from './tokens.stylex';

export interface SelectOption<Value extends string> {
  value: Value;
  label: string;
}

export interface SelectProps<Value extends string> {
  label: string;
  options: readonly SelectOption<Value>[];
  value: Value;
  onChange: (value: Value) => void;
}

/** A labelled single-choice dropdown. */
export function Select<Value extends string>({
  label,
  options,
  value,
  onChange,
}: SelectProps<Value>) {
  return (
    <BaseSelect.Root
      items={options}
      value={value}
      onValueChange={(next) => {
        if (next !== null) onChange(next);
      }}
    >
      <div {...stylex.props(styles.root)}>
        <BaseSelect.Label {...stylex.props(styles.label)}>{label}</BaseSelect.Label>
        <BaseSelect.Trigger {...stylex.props(styles.trigger)}>
          <BaseSelect.Value />
          <BaseSelect.Icon {...stylex.props(styles.icon)}>▾</BaseSelect.Icon>
        </BaseSelect.Trigger>
      </div>
      <BaseSelect.Portal>
        <BaseSelect.Positioner sideOffset={4} {...stylex.props(styles.positioner)}>
          <BaseSelect.Popup {...stylex.props(styles.popup)}>
            <BaseSelect.List {...stylex.props(styles.list)}>
              {options.map((option) => (
                <BaseSelect.Item
                  key={option.value}
                  value={option.value}
                  className={(state) =>
                    stylex.props(styles.item, state.highlighted && styles.highlighted).className
                  }
                >
                  <BaseSelect.ItemText>{option.label}</BaseSelect.ItemText>
                </BaseSelect.Item>
              ))}
            </BaseSelect.List>
          </BaseSelect.Popup>
        </BaseSelect.Positioner>
      </BaseSelect.Portal>
    </BaseSelect.Root>
  );
}

const styles = stylex.create({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: space.xs,
  },
  label: {
    fontSize: 14,
    color: colors.textMuted,
  },
  trigger: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.sm,
    minHeight: 46,
    paddingInline: space.md,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.border,
    borderRadius: 8,
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.surface,
    cursor: 'pointer',
  },
  icon: {
    color: colors.textMuted,
  },
  positioner: {
    zIndex: 10,
    outline: 'none',
  },
  popup: {
    minWidth: 'var(--anchor-width)',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.surface,
    boxShadow: '0 8px 24px rgb(0 0 0 / 0.12)',
  },
  list: {
    maxHeight: 'min(360px, var(--available-height))',
    overflowY: 'auto',
    paddingBlock: space.xs,
  },
  item: {
    paddingBlock: space.sm,
    paddingInline: space.md,
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.text,
    cursor: 'pointer',
    outline: 'none',
  },
  highlighted: {
    color: colors.accentText,
    backgroundColor: colors.accent,
  },
});
