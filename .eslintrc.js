import path from 'path';

module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  extends: ['@react-native', 'plugin:@typescript-eslint/recommended', 'plugin:import/recommended', 'plugin:import/typescript'],
  plugins: ['@typescript-eslint', 'import', 'unused-imports'],
  settings: {
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: path.resolve(__dirname, './tsconfig.json'),
      },
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.native.js', '.android.js', '.ios.js'],
      },
    },
  },
  rules: {
    // TypeScript
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-empty-interface': 'off',
    '@typescript-eslint/no-unused-vars': 'off', // handled by unused-imports
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-non-null-assertion': 'warn',

    // Unused Imports
    'unused-imports/no-unused-imports': 'error',
    'unused-imports/no-unused-vars': [
      'warn',
      {
        vars: 'all',
        varsIgnorePattern: '^_',
        args: 'after-used',
        argsIgnorePattern: '^_',
      },
    ],

    // Import Ordering
    'import/order': [
      'error',
      {
        groups: ['external', 'internal', 'builtin', ['parent', 'sibling', 'index'], 'type', 'object'],
        pathGroups: [
          {
            pattern: 'react',
            group: 'external',
            position: 'before',
          },
          {
            pattern: 'react-native',
            group: 'external',
            position: 'before',
          },
          {
            pattern: '@/**',
            group: 'internal',
          },
        ],
        pathGroupsExcludedImportTypes: ['react', 'react-native'],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],
    'import/no-duplicates': 'error',
    'import/no-cycle': 'error',

    // General Code Quality
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'prefer-const': 'error',
    'no-var': 'error',
    eqeqeq: ['error', 'always'],
    'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 0 }],

    // React / React Native
    'react-native/no-inline-styles': 'warn',
    'react-native/no-color-literals': 'warn',
    'react/no-unstable-nested-components': 'error',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
  },
};
