import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import stylistic from '@stylistic/eslint-plugin'

const flatArray = options => {
  return !Array.isArray(options)
    ? [options]
    : options
}

export default tseslint.config(
  {
    ignores: [
      'node_modules/**/*',
      './index.cjs',
    ],
  },
  {
    files: [
      '**/*.mjs',
      '**/*.ts',
      '**/*.js',
      '*.mjs',
      '*.js',
      '*.ts',
    ],
    extends: [
      ...flatArray(eslint.configs.recommended),
      ...flatArray(tseslint.configs.recommended),
      ...flatArray(stylistic.configs['recommended-flat']),
    ],
    languageOptions: {
      parser: tseslint.parser,
      sourceType: 'module',
      globals: {
        Window: 'readonly',
        window: 'readonly',
        console: 'readonly',
        require: 'readonly',
        exports: 'readonly',
        define: 'readonly',
        module: 'readonly',
        JSX: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
    rules: {
      '@stylistic/arrow-parens': ['error', 'as-needed'],
      '@stylistic/brace-style': ['error', '1tbs', {
        allowSingleLine: true,
      }],
      '@stylistic/indent-binary-ops': 'off',
      '@stylistic/max-statements-per-line': ['error', {
        max: 3,
      }],
      '@stylistic/member-delimiter-style': ['error', {
        multiline: {
          delimiter: 'semi',
          requireLast: true,
        },
        singleline: {
          delimiter: 'semi',
          requireLast: true,
        },
        multilineDetection: 'brackets',
      }],
      '@stylistic/multiline-ternary': ['error', 'always-multiline'],
      '@stylistic/no-mixed-operators': 'off',
      '@stylistic/operator-linebreak': 'off',
      '@stylistic/space-before-function-paren': ['error', {
        named: 'never',
        anonymous: 'never',
        asyncArrow: 'never',
      }],
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-namespace': ['error', {
        allowDeclarations: true,
        allowDefinitionFiles: true,
      }],
      '@typescript-eslint/no-unused-vars': ['error', {
        vars: 'all',
        args: 'none',
        caughtErrors: 'all',
        varsIgnorePattern: '^_',
        argsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
        destructuredArrayIgnorePattern: '^_',
        ignoreRestSiblings: true,
      }],
      '@typescript-eslint/no-var-requires': 'off',
      'no-empty': 'off',
      'no-undef': 'off',
    },
  },
)
