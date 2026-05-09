import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.tsx'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  minify: true,
  external: ['react', 'react-dom', 'moment', 'moment-timezone', 'react-onclickoutside'],
  sourcemap: true,
  injectStyle: false,
});
