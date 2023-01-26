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
        entryFileNames: '[name].cjs',
        chunkFileNames: '[name]-[hash].cjs',
        paths: id => /.+(\/config\.(cn|en)\.(js|ts))/.test(id) ? id.replace(/.+(\/config\.(cn|en)\.(js|ts))/, './src/$1') : undefined
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
      '../config.cn.js',
      '../config.en.js',
      'find-config',
      'word-wrap',
      'inquirer',
      'rimraf'
    ]
  }
])
