import js from '@eslint/js';
import globals from 'globals';

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
        ...globals.browser,
        ...globals.jquery,
      }
    },
    rules: {
      // Possible Errors
      'no-console': 'off', // Allow console for server logs
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],

      // Best Practices
      'eqeqeq': ['error', 'always'],
      'no-var': 'warn',
      'prefer-const': 'warn',
      'prefer-arrow-callback': 'warn',

      // Code Style
      'indent': ['error', 2],
      'quotes': ['error', 'double'],
      'semi': ['error', 'always'],
      'comma-dangle': ['error', 'never'],
      'no-trailing-spaces': 'error',
      'eol-last': ['error', 'always']
    }
  },
  {
    ignores: [
      'node_modules/**',
      'public/js/libs/**',
      'public/js/jquery-*.js',
      'public/js/isotope.*.js',
      'public/uploads/**'
    ]
  }
];
