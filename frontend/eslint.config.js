import js from '@eslint/js'
import eslintConfigPrettier from 'eslint-config-prettier'
import perfectionist from 'eslint-plugin-perfectionist'
import prettierPlugin from 'eslint-plugin-prettier'
import eslintReact from 'eslint-plugin-react'
import unusedImports from 'eslint-plugin-unused-imports'
import globals from 'globals'
import tseslint from 'typescript-eslint'

const baseRules = {
   ...eslintConfigPrettier.rules,
   'no-unused-vars': 'off',
   'unused-imports/no-unused-imports': 'error',
   'unused-imports/no-unused-vars': [
      'error',
      {
         vars: 'all',
         varsIgnorePattern: '^_',
         args: 'after-used',
         argsIgnorePattern: '^_',
      },
   ],
   'react/function-component-definition': 'off',
   'no-undef': 'off',
   'no-useless-escape': 'off',
   'no-unsafe-optional-chaining': 'warn',
   'no-control-regex': 'off',
   'no-debugger': 'error',
   'no-dupe-else-if': 'error',
   'no-dupe-keys': 'error',
   'no-duplicate-imports': 'error',
   'no-template-curly-in-string': 'error',
   'default-case': 'error',
   'default-case-last': 'error',
   eqeqeq: ['error', 'always'],
   'func-style': 'off',
   'init-declarations': ['error', 'always'],
   'no-alert': 'error',
   'no-console':
      process.env.NODE_ENV === 'production'
         ? ['error', { allow: ['error'] }]
         : ['warn', { allow: ['error'] }],
   'no-else-return': 'error',
   'no-lonely-if': 'error',
   'no-useless-return': 'error',
   'prefer-destructuring': [
      'error',
      {
         array: false,
         object: true,
      },
   ],
   yoda: 'error',
   'no-inline-styles': 'off',
   'no-inline-comments': 'error',
   'no-empty-function': 'warn',
   'no-unneeded-ternary': 'warn',
   'prefer-const': 'error',
   'arrow-body-style': 'off',
   'prefer-template': 'warn',
   'require-await': 'error',
   'no-const-assign': 'warn',
   'react/display-name': 'warn',
   'react/prop-types': 'off',
   'react/jsx-boolean-value': [2, 'always'],
   'react/jsx-uses-react': 'off',
   'react/react-in-jsx-scope': 'off',
   'perfectionist/sort-array-includes': 'warn',
   'perfectionist/sort-jsx-props': [
      'warn',
      {
         type: 'line-length',
         order: 'asc',
      },
   ],
   'perfectionist/sort-named-exports': [
      'warn',
      {
         type: 'line-length',
      },
   ],
   'perfectionist/sort-sets': 'warn',
   'perfectionist/sort-variable-declarations': [
      'warn',
      {
         type: 'line-length',
         order: 'asc',
      },
   ],
   'perfectionist/sort-imports': [
      'warn',
      {
         type: 'alphabetical',
         order: 'asc',
         ignoreCase: true,
         internalPattern: ['^@/'],
         newlinesBetween: 1,

         customGroups: [
            {
               groupName: 'react',
               elementNamePattern: ['^react$', '^react/'],
            },
         ],

         groups: [
            'type',
            'react',
            ['builtin', 'external'],
            'internal',
            ['parent', 'sibling', 'index'],
            'unknown',
         ],
      },
   ],
}

export default [
   {
      ignores: [
         'build/**',
         '.next/**',
         '.husky/',
         'public/**',
         '.cache/',
         'dist/**',
         'node_modules/',
         'package-lock.json',
         'yarn.lock',
         'gatsby-**.js',
         'out/**',
      ],
   },
   js.configs.recommended,
   eslintReact.configs.flat.recommended,
   ...tseslint.configs.recommended,
   {
      plugins: {
         prettier: prettierPlugin,
         perfectionist,
         'unused-imports': unusedImports,
      },
      languageOptions: {
         globals: {
            ...globals.browser,
            ...globals.node,
            ...globals.es2021,
         },
         parserOptions: {
            ecmaFeatures: {
               jsx: true,
            },
            ecmaVersion: 'latest',
            sourceType: 'module',
         },
      },
      settings: {
         react: {
            version: 'detect',
            runtime: 'automatic',
         },
         linkComponents: [{ name: 'Link', linkAttribute: ['to', 'href'] }],
         'import/parsers': {
            '@typescript-eslint/parser': ['.ts', '.tsx'],
         },
      },
      rules: {
         ...baseRules,
      },
   },
   {
      files: ['**/*.{ts,tsx}'],
      languageOptions: {
         parser: tseslint.parser,
         parserOptions: {
            projectService: true,
            ecmaFeatures: {
               jsx: true,
            },
            jsxPragma: null,
         },
      },
      rules: {
         ...baseRules,
         'no-unused-vars': 'off',
         '@typescript-eslint/no-explicit-any': 'off',
         '@typescript-eslint/no-unused-vars': [
            'error',
            {
               vars: 'all',
               varsIgnorePattern: '^_',
               args: 'after-used',
               argsIgnorePattern: '^_',
            },
         ],
      },
   },
]
