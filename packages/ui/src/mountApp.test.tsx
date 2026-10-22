import { act } from 'react';
import { afterEach, describe, expect, it } from 'vite-plus/test';

import { mountApp } from './mountApp';

afterEach(() => {
  document.body.innerHTML = '';
});

describe('mountApp', () => {
  it('renders into #root and sets the language and title', async () => {
    document.body.innerHTML = '<div id="root"></div>';

    await act(async () => {
      mountApp(<p>Hola</p>, { lang: 'es', title: 'Prueba' });
      await Promise.resolve();
    });

    expect(document.documentElement.lang).toBe('es');
    expect(document.title).toBe('Prueba');
    expect(document.getElementById('root')?.textContent).toBe('Hola');
  });

  it('fails loudly without a #root element', () => {
    expect(() => {
      mountApp(<p>Hola</p>, { lang: 'es', title: 'Prueba' });
    }).toThrow('Missing #root element');
  });
});
