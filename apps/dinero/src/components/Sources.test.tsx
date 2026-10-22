import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vite-plus/test';

import { localStorageKey } from '../paraglide/runtime';
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
      expect(screen.getByRole('link', { name: source.title }).getAttribute('href')).toBe(
        source.url,
      );
    }
    expect(screen.getAllByText(/Consultado el 22 de octubre de 2026/)).toHaveLength(
      Object.keys(sources).length,
    );
  });
});
