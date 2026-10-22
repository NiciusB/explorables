import { paraglideVitePlugin } from '@inlang/paraglide-js';
import react from '@vitejs/plugin-react';
import { defineConfig, type UserConfig } from 'vite-plus';

import { stylexPlugin } from './stylex.ts';

export { stylexPlugin } from './stylex.ts';

export interface ExplorableOptions {
  /**
   * The URL path the app is served under, e.g. `dinero` for /dinero/. Omit for the site root.
   * The build goes to the matching folder of the repo's single `dist/`.
   */
  path?: string;
}

/** Vite config shared by every app: Paraglide, StyleX, React, and the `dist/` layout. */
export function defineExplorableConfig({ path }: ExplorableOptions = {}): UserConfig {
  return defineConfig({
    base: path === undefined ? '/' : `/${path}/`,
    plugins: [
      paraglideVitePlugin({
        project: './project.inlang',
        outdir: './src/paraglide',
        strategy: ['localStorage', 'preferredLanguage', 'baseLocale'],
        emitTsDeclarations: true,
      }),
      stylexPlugin(),
      react(),
    ],
    build: {
      outDir: path === undefined ? '../../dist' : `../../dist/${path}`,
      // The root app shares `dist/` with every other app, so only sub-path apps clear their folder.
      emptyOutDir: path !== undefined,
    },
    test: {
      environment: 'jsdom',
    },
  });
}
