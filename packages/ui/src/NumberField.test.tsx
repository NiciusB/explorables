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
