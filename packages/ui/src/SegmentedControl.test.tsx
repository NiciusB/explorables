import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vite-plus/test';

import { SegmentedControl } from './SegmentedControl';

const options = [
  { value: 'a', label: 'Option A' },
  { value: 'b', label: 'Option B' },
] as const;

afterEach(cleanup);

describe('SegmentedControl', () => {
  it('marks the current value as pressed', () => {
    render(
      <SegmentedControl
        label="Choice"
        options={options}
        value="a"
        onChange={vi.fn<(value: string) => void>()}
      />,
    );

    expect(screen.getByRole('button', { name: 'Option A' }).getAttribute('aria-pressed')).toBe(
      'true',
    );
    expect(screen.getByRole('button', { name: 'Option B' }).getAttribute('aria-pressed')).toBe(
      'false',
    );
  });

  it('reports the newly selected value', () => {
    const onChange = vi.fn<(value: string) => void>();
    render(<SegmentedControl label="Choice" options={options} value="a" onChange={onChange} />);

    fireEvent.click(screen.getByRole('button', { name: 'Option B' }));

    expect(onChange).toHaveBeenCalledWith('b');
  });

  it('keeps the selection when the pressed option is clicked again', () => {
    const onChange = vi.fn<(value: string) => void>();
    render(<SegmentedControl label="Choice" options={options} value="a" onChange={onChange} />);

    fireEvent.click(screen.getByRole('button', { name: 'Option A' }));

    expect(onChange).not.toHaveBeenCalled();
  });
});
