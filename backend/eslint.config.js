/**
 * ESLint flat config (ESLint v9+).
 *
 * Linting catches common bugs and enforces code quality:
 *   - No unused variables
 *   - No undefined variables
 *   - Consistent error handling in async functions
 *
 * Syllabus: Debugging, Logging, and Code Quality (Syllabus I)
 */

import js from '@eslint/js';
import globals from 'globals';

export default [
  js.configs.recommended,

  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },

    rules: {
      /* Errors */
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-empty': ['error', { allowEmptyCatch: false }],

      /* Warnings */
      'no-console': 'off',  // We use pino, but console is fine in migrations/seed
      'no-constant-condition': 'warn',
    },
  },

  /* Tests can use global test/assert */
  {
    files: ['tests/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
];
