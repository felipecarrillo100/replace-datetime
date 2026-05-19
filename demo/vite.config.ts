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
    ],
    dedupe: ['react', 'react-dom', 'dayjs'],
  },
});
