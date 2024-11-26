import { defineConfig } from 'tsup'

export default defineConfig([
  {
    outDir: './',
    format: 'cjs',
    entry: ['src/index.ts'],
    outExtension: () => ({ js: `.cjs` }),
    sourcemap: false,
    clean: false,
    dts: false,
  },
])
