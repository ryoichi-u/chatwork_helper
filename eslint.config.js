import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  {
    ignores: [
      'node_modules/',
      '.output/',
      '.wxt/',
      'playwright-report/',
      'test-results/',
      'chatworkHelper.js',
      'jquery-3.3.1.min.js',
    ],
  },
  ...tseslint.configs.recommended,
  prettier,
);
