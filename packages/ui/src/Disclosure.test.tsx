import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vite-plus/test';

import { Disclosure } from './Disclosure';

afterEach(cleanup);

describe('Disclosure', () => {
  it('starts collapsed and expands on press', () => {
    render(
      <Disclosure title="More">
        <p>Hidden detail</p>
      </Disclosure>,
    );
    const trigger = screen.getByRole('button', { name: 'More' });
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(screen.queryByText('Hidden detail')).toBeNull();

    fireEvent.click(trigger);

    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByText('Hidden detail')).toBeTruthy();
  });
});
