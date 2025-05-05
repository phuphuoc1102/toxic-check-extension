import js from '@eslint/js';
import ts from '@typescript-eslint/eslint-plugin';
import parser from '@typescript-eslint/parser';
import react from 'eslint-plugin-react';
import globals from 'globals';

/** @type {import("eslint").Linter.FlatConfig[]} */
export default [
  {
    files: ['**/*.{js,ts,jsx,tsx}'],
    languageOptions: {
      parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
      globals: {
        // Lọc globals để loại bỏ khoảng trắng từ các khóa
        ...Object.fromEntries(
          Object.entries({
            ...globals.browser,
            ...globals.node,
            chrome: true, // Thêm chrome vào globals
          }).map(([key, value]) => [key.trim(), value]),
        ),
      },
    },
    plugins: {
      '@typescript-eslint': ts,
      react,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...ts.configs.recommended.rules,
      ...react.configs.recommended.rules,
      '@typescript-eslint/no-explicit-any': 'off',
      'react/prop-types': 'off', // Tắt quy tắc PropTypes vì dùng TypeScript
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  {
    ignores: ['node_modules', 'dist', 'build', 'coverage', 'public'],
  },
];
