import js from '@eslint/js'
import svelte from 'eslint-plugin-svelte'
import globals from 'globals'

export default [
    {
        ignores: [
            'test/app/dist/**',
            'examples/*/dist/**',
            'test/app/**',
            'eslint.config.js',
            '**/*.cjs',
            'test/app/src/routes.js',
            'examples/dynamic-imports/src/routes.js'
        ]
    },

    js.configs.recommended,
    ...svelte.configs.recommended,

    {
        files: ['**/*.{js,mjs,cjs,svelte}'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: {
                ...globals.browser,
                ...globals.node
            }
        },
        rules: {
            indent: [
                'error',
                4,
                {
                    SwitchCase: 1,
                    MemberExpression: 1,
                    ArrayExpression: 1,
                    ObjectExpression: 1
                }
            ],
            'linebreak-style': [
                'error',
                'unix'
            ],
            quotes: [
                'error',
                'single'
            ],
            semi: [
                'error',
                'never'
            ],
            'quote-props': [
                'warn',
                'as-needed'
            ],
            'no-var': [
                'error'
            ],
            'prefer-const': [
                'warn'
            ],
            'no-unused-vars': [
                'error',
                {
                    args: 'none'
                }
            ],
            'brace-style': [
                'error',
                'stroustrup',
                {
                    allowSingleLine: false
                }
            ],
            'eol-last': [
                'error',
                'always'
            ],
            'space-before-function-paren': [
                'error',
                {
                    anonymous: 'never',
                    named: 'never',
                    asyncArrow: 'always'
                }
            ],
            'keyword-spacing': [
                'error',
                {
                    before: true,
                    after: true
                }
            ],
            'key-spacing': [
                'error',
                {
                    beforeColon: false,
                    afterColon: true,
                    mode: 'strict'
                }
            ],
            'comma-spacing': [
                'error'
            ],
            'arrow-spacing': [
                'error'
            ],
            'array-bracket-spacing': [
                'error',
                'never',
                {
                    singleValue: false,
                    objectsInArrays: true,
                    arraysInArrays: true
                }
            ],
            curly: [
                'error'
            ],
            'space-infix-ops': [
                'error',
                {
                    int32Hint: false
                }
            ],
            'space-unary-ops': [
                'error',
                {
                    words: true,
                    nonwords: false
                }
            ],
            'space-before-blocks': [
                'error'
            ],
            'object-curly-spacing': [
                'error',
                'never'
            ],
            'space-in-parens': [
                'error',
                'never'
            ],
            'prefer-arrow-callback': [
                'warn'
            ],
            'no-return-await': [
                'error'
            ],
            'no-console': [
                'warn'
            ],
            'no-nested-ternary': [
                'error'
            ],
            'no-unneeded-ternary': [
                'warn'
            ],
            'no-unexpected-multiline': [
                'error'
            ],
            'lines-around-directive': [
                'error',
                'always'
            ],
            'operator-linebreak': [
                'error',
                'after'
            ],
            // Keep disabled to avoid known issues with Svelte files.
            'no-multiple-empty-lines': 0
        }
    },

    {
        files: ['**/*.svelte'],
        rules: {
            'no-unused-vars': 'off'
        }
    }
]
