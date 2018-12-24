// https://eslint.org/docs/user-guide/configuring
module.exports = {
  // https://github.com/KagamiChan/eslint-config-poi-plugin
  extends: [
    'poi-plugin',
    'prettier',
    'prettier/react',
    'plugin:react/recommended',
  ],
  plugins: ['import', 'react', 'prettier'],
  env: {
    es6: true,
    node: true,
    browser: true,
  },
  parser: 'babel-eslint',
  rules: {
    semi: ['error', 'never'],
    'react/jsx-filename-extension': 'off',
    'no-underscore-dangle': 'off',
    'import/no-extraneous-dependencies': 'off',
    // 'comma-dangle': ['error', 'always-multiline'],
    'no-confusing-arrow': ['error', { allowParens: true }],
    'no-console': 'off',
    'no-undef': 'error',
    'no-unused-vars': ['error', { args: 'none' }],
    'prefer-const': ['error', { destructuring: 'all' }],
    'prettier/prettier': 'warn',
  },
  settings: {
    'import/resolver': {
      node: {
        // to allow resolving .json
        extensions: ['.json'],
      },
    },
    'import/core-modules': ['electron', '@blueprintjs/core'],
  },
}
