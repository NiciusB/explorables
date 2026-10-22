import { defineConfig } from 'vite-plus';

import { stylexPlugin } from './vite-plugin';

export default defineConfig({
  plugins: [stylexPlugin()],
  test: {
    environment: 'jsdom',
  },
});
