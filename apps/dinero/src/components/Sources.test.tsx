import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vite-plus/test';

import { localStorageKey } from '../paraglide/runtime';
import { formatDate } from '../format';
import { sources } from '../sources';
import { Sources } from './Sources';

afterEach(() => {
  cleanup();
  localStorage.clear();
});

describe('Sources', () => {
  it('links every source with when it was accessed', () => {
    localStorage.setItem(localStorageKey, 'es');
    render(<Sources locale="es" />);

    for (const source of Object.values(sources)) {
      const link = screen.getByRole('link', { name: source.title });
      expect(link.getAttribute('href')).toBe(source.url);
      expect(link.closest('li')?.textContent).toContain(
        `Consultado el ${formatDate(source.accessed, 'es')}`,
      );
    }
    expect(screen.getAllByRole('listitem')).toHaveLength(Object.keys(sources).length);
  });
});
