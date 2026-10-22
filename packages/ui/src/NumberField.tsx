import { NumberField as BaseNumberField } from '@base-ui/react/number-field';
import * as stylex from '@stylexjs/stylex';
import { useId } from 'react';

import { colors, fonts, space } from './tokens.stylex';

export interface NumberFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  /** Accessible names for the stepper buttons. */
  decrementLabel: string;
  incrementLabel: string;
  size?: 'default' | 'large';
  min?: number;
  max?: number;
  step?: number;
  format?: Intl.NumberFormatOptions;
  locale?: string;
}

/** A labelled number input with − and + steppers. Clearing it keeps the last value. */
export function NumberField({
  label,
  value,
  onChange,
  decrementLabel,
  incrementLabel,
  size = 'default',
  min,
  max,
  step = 1,
  format,
  locale,
}: NumberFieldProps) {
  const id = useId();
  return (
    <BaseNumberField.Root
      id={id}
      value={value}
      onValueChange={(next) => {
        if (next !== null) onChange(next);
      }}
      min={min}
      max={max}
      step={step}
      format={format}
      locale={locale}
      {...stylex.props(styles.root)}
    >
      <label htmlFor={id} {...stylex.props(styles.label)}>
        {label}
      </label>
      <BaseNumberField.Group {...stylex.props(styles.group)}>
        <BaseNumberField.Decrement aria-label={decrementLabel} {...stylex.props(styles.stepper)}>
          −
        </BaseNumberField.Decrement>
        <BaseNumberField.Input
          {...stylex.props(styles.input, size === 'large' && styles.largeInput)}
        />
        <BaseNumberField.Increment aria-label={incrementLabel} {...stylex.props(styles.stepper)}>
          +
        </BaseNumberField.Increment>
      </BaseNumberField.Group>
    </BaseNumberField.Root>
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
  group: {
    display: 'flex',
    alignItems: 'stretch',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  input: {
    minWidth: 0,
    flexGrow: 1,
    borderWidth: 0,
    paddingBlock: space.sm,
    paddingInline: space.sm,
    fontFamily: fonts.body,
    fontSize: 20,
    fontVariantNumeric: 'tabular-nums',
    textAlign: 'center',
    color: colors.text,
    backgroundColor: 'transparent',
  },
  largeInput: {
    fontSize: 'clamp(28px, 6vw, 40px)',
    paddingBlock: space.md,
    fontWeight: 600,
  },
  stepper: {
    width: 40,
    flexShrink: 0,
    borderWidth: 0,
    fontSize: 20,
    cursor: 'pointer',
    color: colors.textMuted,
    backgroundColor: 'transparent',
  },
});
