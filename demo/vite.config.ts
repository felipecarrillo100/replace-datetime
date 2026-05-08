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
      // Route the CSS subpath directly to the css/ folder
      {
        find: /^replace-datetime\/css\/(.*)/,
        replacement: path.resolve(__dirname, '../css/$1'),
      },
      // Route everything else to the library source
      {
        find: 'replace-datetime',
        replacement: path.resolve(__dirname, '../src/index.tsx'),
      },
    ],
    dedupe: ['react', 'react-dom'],
  },
});
