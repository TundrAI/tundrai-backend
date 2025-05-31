// @ts-check
import eslint from '@eslint/js';
import eslintPluginImport from 'eslint-plugin-import';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import eslintPluginSonarjs from 'eslint-plugin-sonarjs';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  // == IGNORES ==
  {
    ignores: ['dist/**', 'node_modules/**', 'coverage/**', '*.config.mjs'],
  },

  // == BASE CONFIGS ==
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginSonarjs.configs.recommended,
  eslintPluginPrettierRecommended, // Must be last for prettier

  // == GLOBAL SETTINGS ==
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // == PLUGINS ==
  {
    plugins: {
      import: eslintPluginImport,
    },
  },

  // == AIRBNB-STYLE RULES ==
  {
    files: ['**/*.ts'],
    rules: {
      // TypeScript-specific rules
      '@typescript-eslint/explicit-function-return-type': [
        'error',
        {
          allowExpressions: true,
          allowTypedFunctionExpressions: true,
        },
      ],
      '@typescript-eslint/explicit-module-boundary-types': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/naming-convention': [
        'error',
        // Interfaces must start with I
        {
          selector: 'interface',
          format: ['PascalCase'],
          prefix: ['I'],
        },
        // Types should be PascalCase
        {
          selector: 'typeAlias',
          format: ['PascalCase'],
        },
        // Enums should be PascalCase
        {
          selector: 'enum',
          format: ['PascalCase'],
        },
        // Variables should be camelCase or UPPER_CASE (for constants)
        {
          selector: 'variable',
          format: ['camelCase', 'UPPER_CASE'],
          leadingUnderscore: 'allow',
        },
        // Private members can have leading underscore
        {
          selector: 'memberLike',
          modifiers: ['private'],
          format: ['camelCase'],
          leadingUnderscore: 'allow',
        },
      ],

      // Import rules (Airbnb-style)
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            ['parent', 'sibling'],
            'index',
          ],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
      'import/no-duplicates': 'error',
      'import/no-cycle': 'error',
      'import/no-default-export': 'error',

      // General best practices
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
      'no-alert': 'error',
      'prefer-const': 'error',
      'no-var': 'error',
      'object-shorthand': 'error',
      'prefer-template': 'error',
      'prefer-destructuring': [
        'error',
        {
          object: true,
          array: false,
        },
      ],

      // Code quality (SonarJS is already configured)
      'complexity': ['error', 10],
      'max-depth': ['error', 3],
      'max-lines': ['error', 300],
      'max-lines-per-function': ['error', 50],
      'max-params': ['error', 4],
    },
  },

  // == TEST FILES OVERRIDES ==
  {
    files: ['**/*.spec.ts', '**/*.e2e-spec.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'max-lines': 'off',
      'max-lines-per-function': 'off',
    },
  },

  // == MAIN.TS EXCEPTION ==
  {
    files: ['src/main.ts'],
    rules: {
      'import/no-default-export': 'off',
    },
  },
);
