import { describe, expect, it } from 'vite-plus/test';

import { defineExplorableConfig } from './index.ts';

describe('defineExplorableConfig', () => {
  it('serves a sub-path app from its own dist folder', () => {
    const config = defineExplorableConfig({ path: 'dinero' });
    expect(config.base).toBe('/dinero/');
    expect(config.build?.outDir).toBe('../../dist/dinero');
    expect(config.build?.emptyOutDir).toBe(true);
  });

  it('serves the root app from dist without clearing the other apps', () => {
    const config = defineExplorableConfig();
    expect(config.base).toBe('/');
    expect(config.build?.outDir).toBe('../../dist');
    expect(config.build?.emptyOutDir).toBe(false);
  });
});
