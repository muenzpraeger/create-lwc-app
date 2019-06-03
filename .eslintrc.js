module.exports = {
    parser: '@typescript-eslint/parser',
    extends: [
        'plugin:@typescript-eslint/recommended',
        'prettier/@typescript-eslint',
        'plugin:prettier/recommended'
    ],
    parserOptions: {
        ecmaVersion: 2018,
        sourceType: 'module'
    },
    rules: {
        'file-name-casing': [0, 'camel-case'],
        'object-curly-spacing': 0,
        '@typescript-eslint/camelcase': 0,
        '@typescript-eslint/member-delimiter-style': 0,
        '@typescript-eslint/no-var-requires': 0,
        '@typescript-eslint/explicit-member-accessibility': 0,
        '@typescript-eslint/explicit-function-return-type': 0,
        '@typescript-eslint/no-explicit-any': 0,
        '@typescript-eslint/no-non-null-assertion': 0,
        '@typescript-eslint/no-use-before-define': 0
    }
}
