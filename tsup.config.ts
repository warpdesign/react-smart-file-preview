import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
    dts: true,
    sourcemap: true,
    clean: true,
    external: ['react'],
  },
  {
    entry: ['src/pdf.ts'],
    format: ['cjs', 'esm'],
    dts: true,
    sourcemap: true,
    external: ['react'],
  },
  {
    entry: ['src/archive.ts'],
    format: ['cjs', 'esm'],
    dts: true,
    sourcemap: true,
    external: ['react'],
  },
]);
