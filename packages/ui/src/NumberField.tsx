import { NumberField as BaseNumberField } from '@base-ui/react/number-field';
import * as stylex from '@stylexjs/stylex';
import { useCallback, useId, useMemo } from 'react';

import { createNumberEditing } from './numberEditing';

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
  const editing = useMemo(() => createNumberEditing(locale, format), [locale, format]);
  const inputRef = useCallback(
    (input: HTMLInputElement | null) => {
      if (input === null) return undefined;
      // Mobile keyboards can delete without firing keydown. Listen to the native
      // beforeinput event because React's beforeinput does not expose inputType reliably.
      const beforeInput = (event: InputEvent) => {
        if (event.inputType === 'deleteContentBackward') {
          editing.prepareDeletion(input, 'Backspace');
        } else if (event.inputType === 'deleteContentForward') {
          editing.prepareDeletion(input, 'Delete');
        }
      };
      input.addEventListener('beforeinput', beforeInput);
      return () => input.removeEventListener('beforeinput', beforeInput);
    },
    [editing],
  );
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
          ref={inputRef}
          onChange={(event) => {
            if (!(event.nativeEvent instanceof InputEvent) || !event.nativeEvent.isComposing) {
              editing.formatInput(event.currentTarget);
            }
          }}
          onKeyDown={(event) => {
            if (!event.ctrlKey && !event.metaKey && !event.altKey && !event.shiftKey) {
              editing.prepareDeletion(event.currentTarget, event.key);
            }
          }}
          onPaste={(event) => {
            // Base UI normally inserts pasted text after its change handler. Route it through
            // the native input event instead, so paste follows the same formatting/caret path.
            event.preventDefault();
            const input = event.currentTarget;
            const start = input.selectionStart ?? 0;
            const end = input.selectionEnd ?? start;
            const text = event.clipboardData.getData('text/plain');
            const next = input.value.slice(0, start) + text + input.value.slice(end);
            const descriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
            descriptor?.set?.call(input, next);
            input.setSelectionRange(start + text.length, start + text.length);
            input.dispatchEvent(new Event('input', { bubbles: true }));
          }}
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
