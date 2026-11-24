import { defineConfig } from 'oxlint'

export default defineConfig({
  categories: {
    correctness: 'warn',
    style: 'warn',
  },
  options: {
    typeAware: true,
  },
  plugins: ['eslint', 'import', 'typescript'],
  rules: {
    'arrow-body-style': 'off',
    'capitalized-comments': 'off',
    'curly': 'off',
    'func-style': 'off',
    'id-length': 'off',
    'import/exports-last': 'off',
    'import/group-exports': 'off',
    'import/no-duplicates': 'warn',
    'import/no-named-export': 'off',
    'import/no-nodejs-modules': 'warn',
    'import/prefer-default-export': 'off',
    'import/no-default-export': 'error',

    // Disable the following rule because this is already covered by
    // the import/no-duplicates rule from the imports plugin.
    'no-duplicate-imports': 'off',

    'init-declarations': 'off',
    'max-params': ['error', { max: 5 }],
    'max-statements': ['error', { max: 25 }],
    'new-cap': 'off',
    'no-continue': 'off',
    'no-magic-numbers': 'off',
    'no-ternary': 'off',
    'no-underscore-dangle': 'error',
    'sort-imports': 'off',
    'sort-keys': 'off',
    'typescript/method-signature-style': 'off',
    'typescript/no-inferrable-types': 'off',
    'typescript/restrict-template-expressions': 'off',
    'typescript/unbound-method': [
      'warn',
      {
        ignoreStatic: true,
      },
    ],
    'typescript/parameter-properties': [
      'warn',
      {
        prefer: 'parameter-property',
      },
    ],
  },
  overrides: [
    {
      files: ['*.test.ts', '*.spec.ts'],
      rules: {
        'init-declarations': 'off',
        'max-statements': 'off',
        'prefer-promise-reject-errors': 'off',
        'typescript/no-base-to-string': 'off',
      },
    },
    {
      files: ['*.config.ts', 'src/index.ts'],
      rules: {
        'import/no-default-export': 'off',
      },
    },
  ],
})
