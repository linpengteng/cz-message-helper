const { defineConfig } = require('rollup')
const nodeResolve = require('@rollup/plugin-node-resolve')
const typescript = require('@rollup/plugin-typescript')
const commonjs = require('@rollup/plugin-commonjs')


/**
 * Rollup Configuration
 */
module.exports = defineConfig([
  {
    input: 'src/index.ts',
    output: [
      {
        dir: './',
        format: 'cjs',
        exports: 'auto',
        sourcemap: false,
        entryFileNames: '[name].js',
        chunkFileNames: '[name]-[hash].js'
      }
    ],
    plugins: [
      typescript({ sourceMap: false }),
      nodeResolve(),
      commonjs()
    ],
    external: [
      'node:child_process',
      'node:constants',
      'node:path',
      'node:fs',
      'node:os',
      'inquirer',
      'find-config',
      'word-wrap',
      'rimraf'
    ]
  }
])
