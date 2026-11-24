import { defineConfig } from 'oxfmt'

export default defineConfig({
  arrowParens: 'always',
  printWidth: 120,
  semi: false,
  singleQuote: true,
  sortPackageJson: false,
  quoteProps: 'consistent',
  jsdoc: {
    capitalizeDescriptions: false,
    commentLineStrategy: 'keep',
    lineWrappingStyle: 'balance',
    preferCodeFences: true,
  },
})
