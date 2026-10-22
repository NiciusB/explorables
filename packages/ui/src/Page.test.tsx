import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vite-plus/test';

import { Page } from './Page';

afterEach(cleanup);

const onLocaleChange = vi.fn<(locale: 'es' | 'en') => void>();

describe('Page', () => {
  it('renders the content with a language control', () => {
    render(
      <Page
        languageLabel="Idioma"
        locales={['es', 'en']}
        locale="es"
        onLocaleChange={onLocaleChange}
      >
        <h1>Hola</h1>
      </Page>,
    );
    expect(screen.getByRole('heading', { name: 'Hola' })).toBeTruthy();
    expect(screen.getByRole('group', { name: 'Idioma' })).toBeTruthy();
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('links back home when given a home link', () => {
    render(
      <Page
        languageLabel="Idioma"
        locales={['es', 'en']}
        locale="es"
        onLocaleChange={onLocaleChange}
        home={{ href: '/', label: 'Explorables' }}
      >
        <h1>Hola</h1>
      </Page>,
    );
    expect(screen.getByRole('link', { name: '← Explorables' }).getAttribute('href')).toBe('/');
  });
});
