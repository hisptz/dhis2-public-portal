import js from '@eslint/js'
import globals from 'globals'
import typescript from 'typescript-eslint'
import react from 'eslint-plugin-react'
import { defineConfig, globalIgnores } from 'eslint/config'
import prettier from 'eslint-config-prettier/flat'
import { fileURLToPath } from 'url'
import { includeIgnoreFile } from '@eslint/compat'

const gitignorePath = fileURLToPath(new URL('.gitignore', import.meta.url))

export default defineConfig([
    {
        files: ['**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
        plugins: {
            js,
        },
        extends: ['js/recommended'],
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
            },
        },
    },
    // {
    //     plugins: {
    //         'react-hooks': reactHooks.configs.flat.recommended.plugins.react,
    //     },
    //     rules: { ...reactHooks.configs.recommended.rules },
    // },
    typescript.configs.recommended,
    react.configs.flat['jsx-runtime'],
    prettier,
    includeIgnoreFile(gitignorePath, 'Imported .gitignore patterns'),
    globalIgnores([
        '**/node_modules',
        'd2.config.js',
        '**/.d2',
        'routeTree.gen.ts',
        '**/.docusaurus',
    ]),
])
