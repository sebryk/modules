import js from '@eslint/js'
import eslintConfigPrettier from 'eslint-config-prettier'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default tseslint.config(
   {
      ignores: [
         'dist/**',
         'node_modules/**',
         '**/*.d.ts',
         '*.tsbuildinfo',
         'prisma.config.js',
         'prisma.config.js.map',
      ],
   },
   {
      files: ['**/*.ts'],
      extends: [
         js.configs.recommended,
         ...tseslint.configs.recommended,
         ...tseslint.configs.recommendedTypeChecked,
         eslintConfigPrettier,
      ],
      languageOptions: {
         globals: {
            ...globals.node,
         },
         parserOptions: {
            projectService: true,
            tsconfigRootDir: import.meta.dirname,
         },
      },
      rules: {
         '@typescript-eslint/consistent-type-imports': 'error',
         '@typescript-eslint/no-extraneous-class': 'off',
      },
   },
)
