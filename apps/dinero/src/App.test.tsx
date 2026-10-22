import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vite-plus/test';

import { App } from './App';
import { localStorageKey, overwriteSetLocale, setLocale, type Locale } from './paraglide/runtime';

function renderIn(locale: Locale) {
  localStorage.setItem(localStorageKey, locale);
  render(<App />);
}

afterEach(() => {
  cleanup();
  localStorage.clear();
  overwriteSetLocale(setLocale);
});

describe('App', () => {
  it('renders in the stored locale', () => {
    renderIn('es');
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(
      'Dinero y desigualdad en España',
    );

    cleanup();
    renderIn('en');
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(
      'Money and inequality in Spain',
    );
  });

  it('switches the locale from the language control', () => {
    const requested: Locale[] = [];
    overwriteSetLocale((locale) => {
      requested.push(locale);
    });
    renderIn('es');

    fireEvent.click(screen.getByRole('button', { name: 'English' }));

    expect(requested).toEqual(['en']);
  });
});
