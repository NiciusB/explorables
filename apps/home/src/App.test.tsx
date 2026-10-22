import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vite-plus/test';

import { App } from './App';
import { EXPLORABLES } from './explorables';
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

describe('home page', () => {
  it('links to every explorable under its path', () => {
    renderIn('es');

    for (const explorable of EXPLORABLES) {
      const link = screen.getByRole('link', { name: new RegExp(explorable.title()) });
      expect(link.getAttribute('href')).toBe(`/${explorable.path}/`);
    }
  });

  it('renders in the stored locale', () => {
    renderIn('en');
    expect(screen.getByRole('heading', { level: 3 }).textContent).toBe(
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
