import stylexVite from '@stylexjs/unplugin/vite';
import type { Plugin } from 'vite-plus';

/** The StyleX Vite plugin, configured the same way for every app and package. */
export function stylexPlugin(): Plugin {
  const plugin: Plugin = stylexVite();
  // Its configureServer hook starts a CSS-update poll that is only cleared when an
  // HTTP server closes. Vitest has none, so the poll would keep test runs alive.
  if (process.env['VITEST'] !== undefined) delete plugin.configureServer;
  return plugin;
}
