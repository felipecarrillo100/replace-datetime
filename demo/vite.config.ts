import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: '../docs/demo',
    emptyOutDir: true,
  },
  resolve: {
    alias: [
      // Route CSS subpath to the css/ folder
      {
        find: /^replace-datetime\/css\/(.*)/,
        replacement: path.resolve(__dirname, '../css/$1'),
      },
      // Route library imports to local source
      {
        find: 'replace-datetime',
        replacement: path.resolve(__dirname, '../src/index.tsx'),
      },
      // Force a single moment singleton so locale registrations reach the library.
      // moment/locale/* must come BEFORE the bare moment alias.
      {
        find: /^moment\/locale\/(.*)/,
        replacement: path.resolve(__dirname, '../node_modules/moment/locale/$1'),
      },
      {
        find: /^moment$/,
        replacement: path.resolve(__dirname, '../node_modules/moment/moment.js'),
      },
    ],
    dedupe: ['react', 'react-dom', 'moment'],
  },
});
