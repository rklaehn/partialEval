module.exports = {
  env: {
    browser: true,
    node: true,
    'jest/globals': true,
    jest: true,
  },
  extends: [
    'airbnb',
    'plugin:jest/recommended',
    'plugin:flowtype/recommended',
    /**
     * next 3 lines should stay always last, they turn off all rules that
     * are unnecessary (formatting) or might conflict with Prettier
     */
    'prettier',
    'prettier/flowtype',
  ],
  parser: 'babel-eslint',
  rules: {
    'no-confusing-arrow': 'off',
    quotes: ['error', 'single'],
    semi: ['error', 'never'],
    strict: ['error', 'never'],
    'comma-dangle': ['error', 'always-multiline'],
    indent: [2, 2, { SwitchCase: 1 }],
    'no-unused-vars': ['warn'],
    'consistent-return': 'off',
    'no-console': 'warn',
    'arrow-parens': 'off',
    'spaced-comment': 'error',
    'no-mixed-operators': 'off',
    'import/prefer-default-export': 'off',
    'class-methods-use-this': 'off',
    'arrow-body-style': ['error', 'as-needed'],
    'react/jsx-uses-react': 'error',
    'react/jsx-uses-vars': 'error',
    'react/react-in-jsx-scope': 'error',
    'react/jsx-filename-extension': 'off',
    'react/require-default-props': 'off',
    'react/prop-types': 'off',
    'prettier/prettier': ['error', {
      printWidth: 100,
      semi: false,
      singleQuote: true,
      trailingComma: 'all',
    }],
  },
  settings: {
    'import/resolver': {
      'babel-module': {}
    },
  },
  plugins: [
    'jest',
    'flowtype',
    'prettier',
  ],
}
