import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vite-plus/test';

import { Select } from './Select';

const options = [
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Beta' },
] as const;

afterEach(cleanup);

describe('Select', () => {
  it('shows the label of the current value', () => {
    render(
      <Select
        label="Letter"
        options={options}
        value="b"
        onChange={vi.fn<(value: string) => void>()}
      />,
    );
    expect(screen.getByRole('combobox').textContent).toContain('Beta');
  });

  it('reports the chosen option', async () => {
    const onChange = vi.fn<(value: string) => void>();
    render(<Select label="Letter" options={options} value="b" onChange={onChange} />);

    const user = userEvent.setup();
    await user.click(screen.getByRole('combobox'));
    await user.click(await screen.findByRole('option', { name: 'Alpha' }));

    expect(onChange).toHaveBeenCalledWith('a');
  });
});
