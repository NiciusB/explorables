import { stylexPlugin } from '@explorables/vite-config';
import { defineConfig } from 'vite-plus';

export default defineConfig({
  plugins: [stylexPlugin()],
  test: {
    environment: 'jsdom',
  },
});
