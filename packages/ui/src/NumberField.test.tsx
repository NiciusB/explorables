import { useState } from 'react';
import userEvent from '@testing-library/user-event';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vite-plus/test';

import { NumberField } from './NumberField';

afterEach(cleanup);

function renderField(onChange = vi.fn<(value: number) => void>(), value = 10) {
  render(
    <NumberField
      label="Amount"
      value={value}
      onChange={onChange}
      decrementLabel="Less"
      incrementLabel="More"
      min={0}
      max={12}
      step={5}
    />,
  );
  return onChange;
}

describe('NumberField', () => {
  it('labels the input and shows the value', () => {
    renderField();
    expect(screen.getByLabelText('Amount')).toHaveProperty('value', '10');
  });

  it('steps down by the step size', () => {
    const onChange = renderField();
    fireEvent.click(screen.getByRole('button', { name: 'Less' }));
    expect(onChange).toHaveBeenCalledWith(5);
  });

  it('clamps steps to the maximum', () => {
    const onChange = renderField();
    fireEvent.click(screen.getByRole('button', { name: 'More' }));
    expect(onChange).toHaveBeenCalledWith(12);
  });

  it('reports typed values and ignores a cleared input', () => {
    const onChange = renderField();
    const input = screen.getByLabelText('Amount');
    fireEvent.change(input, { target: { value: '7' } });
    fireEvent.blur(input);
    expect(onChange).toHaveBeenLastCalledWith(7);

    onChange.mockClear();
    fireEvent.change(input, { target: { value: '' } });
    fireEvent.blur(input);
    expect(onChange).not.toHaveBeenCalled();
  });
});

function EditingField({
  locale = 'es-ES',
  initial = 12345,
  currency = true,
}: {
  locale?: string;
  initial?: number;
  currency?: boolean;
}) {
  const [value, setValue] = useState(initial);
  return (
    <NumberField
      label="Editable amount"
      value={value}
      onChange={setValue}
      decrementLabel="Less"
      incrementLabel="More"
      locale={locale}
      format={currency ? { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 } : {}}
    />
  );
}

function editingInput() {
  return screen.getByLabelText<HTMLInputElement>('Editable amount');
}

describe('NumberField editing', () => {
  it('regroups a new digit immediately and keeps the caret before the currency suffix', async () => {
    const user = userEvent.setup();
    render(<EditingField />);
    const input = editingInput();
    await user.click(input);
    input.setSelectionRange(6, 6);
    await user.keyboard('6');
    expect(input.value).toBe('123.456,00\u00a0€');
    expect(input.selectionStart).toBe(7);
    await user.keyboard('7');
    expect(input.value).toBe('1.234.567,00\u00a0€');
    expect(input.selectionStart).toBe(9);
  });

  it('keeps middle insertions and selection replacements at the edited digits', async () => {
    const user = userEvent.setup();
    render(<EditingField currency={false} />);
    const input = editingInput();
    await user.click(input);
    input.setSelectionRange(1, 1);
    await user.keyboard('9');
    expect(input.value).toBe('192.345');
    expect(input.selectionStart).toBe(2);
    input.setSelectionRange(1, 5);
    await user.keyboard('8');
    expect(input.value).toBe('1.845');
    expect(input.selectionStart).toBe(3);
  });

  it('backspaces and deletes digits across a grouping separator', async () => {
    const user = userEvent.setup();
    render(<EditingField initial={1234567} currency={false} />);
    const input = editingInput();
    await user.click(input);
    input.setSelectionRange(6, 6);
    await user.keyboard('{Backspace}');
    expect(input.value).toBe('123.567');
    expect(input.selectionStart).toBe(3);
    input.setSelectionRange(3, 3);
    await user.keyboard('{Delete}');
    expect(input.value).toBe('12.367');
    expect(input.selectionStart).toBe(4);
  });

  it('pastes into a selection and regroups the result', async () => {
    const user = userEvent.setup();
    render(<EditingField currency={false} />);
    const input = editingInput();
    await user.click(input);
    input.setSelectionRange(1, 4);
    await user.paste('9876');
    expect(input.value).toBe('1.987.645');
    expect(input.selectionStart).toBe(7);
    await user.keyboard('0');
    expect(input.value).toBe('19.876.045');
  });

  it('rejects an invalid paste without leaving stale text in the input', async () => {
    const user = userEvent.setup();
    render(<EditingField currency={false} />);
    const input = editingInput();
    await user.click(input);
    input.setSelectionRange(1, 4);
    await user.paste('hello');
    expect(input.value).toBe('12.345');
  });

  it('keeps clearing editable and restores the last number on blur', async () => {
    const user = userEvent.setup();
    render(<EditingField currency={false} />);
    const input = editingInput();
    await user.clear(input);
    expect(input.value).toBe('');
    await user.tab();
    expect(input.value).toBe('12.345');
  });

  it('preserves a partial decimal, trailing zeros, and a negative sign', async () => {
    const user = userEvent.setup();
    render(<EditingField locale="en-US" currency={false} />);
    const input = editingInput();
    await user.clear(input);
    await user.keyboard('-12345.00');
    expect(input.value).toBe('-12,345.00');
    expect(input.selectionStart).toBe(10);
    await user.keyboard('{Backspace}{Backspace}');
    expect(input.value).toBe('-12,345.');
    await user.keyboard('2');
    expect(input.value).toBe('-12,345.2');
  });
});

describe('NumberField mobile editing', () => {
  it('deletes through separators when a software keyboard sends beforeinput without keydown', () => {
    render(<EditingField initial={1234567} currency={false} />);
    const input = editingInput();
    input.setSelectionRange(6, 6);
    fireEvent(input, new InputEvent('beforeinput', { inputType: 'deleteContentBackward' }));
    expect(input.selectionStart).toBe(5);
    input.setRangeText('', 4, 5, 'end');
    fireEvent.input(input);
    expect(input.value).toBe('123.567');
    expect(input.selectionStart).toBe(3);
    input.setSelectionRange(3, 3);
    fireEvent(input, new InputEvent('beforeinput', { inputType: 'deleteContentForward' }));
    expect(input.selectionStart).toBe(4);
  });
});
