import { defineConfig } from 'vite-plus';

const generated = ['**/dist/**', '**/src/paraglide/**'];

export default defineConfig({
  lint: {
    plugins: [
      'typescript',
      'react',
      'react-perf',
      'jsx-a11y',
      'unicorn',
      'oxc',
      'import',
      'vitest',
    ],
    categories: {
      correctness: 'error',
      suspicious: 'error',
      perf: 'error',
    },
    ignorePatterns: generated,
    options: {
      typeAware: true,
      typeCheck: true,
      denyWarnings: true,
    },
    rules: {
      eqeqeq: 'error',
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'no-param-reassign': 'error',
      'no-var': 'error',
      'prefer-const': 'error',
      'import/no-cycle': 'error',
      'import/no-default-export': 'error',
      'import/no-unassigned-import': ['error', { allow: ['**/*.css'] }],
      // The automatic JSX runtime doesn't need React in scope.
      'react/react-in-jsx-scope': 'off',
      'react/rules-of-hooks': 'error',
      // react-perf rules (enabled by the perf category) flag idiomatic inline props.
      'react-perf/jsx-no-new-array-as-prop': 'off',
      'react-perf/jsx-no-new-function-as-prop': 'off',
      'react-perf/jsx-no-new-object-as-prop': 'off',
      'react-perf/jsx-no-jsx-as-prop': 'off',
      'react/exhaustive-deps': 'error',
      'react/jsx-key': 'error',
      'react/self-closing-comp': 'error',
      'typescript/consistent-type-imports': 'error',
      'typescript/no-explicit-any': 'error',
      'typescript/no-non-null-assertion': 'error',
      'typescript/no-floating-promises': 'error',
      'typescript/no-misused-promises': 'error',
      'typescript/switch-exhaustiveness-check': 'error',
      'typescript/no-unnecessary-condition': 'error',
      'typescript/no-unnecessary-type-assertion': 'error',
      'typescript/prefer-nullish-coalescing': 'error',
      'typescript/restrict-template-expressions': 'error',
      'typescript/strict-boolean-expressions': 'error',
      'vitest/no-focused-tests': 'error',
      'vitest/no-disabled-tests': 'error',
    },
    overrides: [
      {
        // Tooling configs must default-export.
        files: ['**/vite.config.ts'],
        rules: { 'import/no-default-export': 'off' },
      },
    ],
  },
  fmt: {
    singleQuote: true,
    ignorePatterns: generated,
  },
  run: {
    cache: true,
  },
});
