module.exports = {
    parser: '@typescript-eslint/parser',

    extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],

    parserOptions: {
        ecmaVersion: 2018,
        sourceType: 'module'
    },

    env: {
        node: true,
        es6: true
    },

    rules: {
        // TODO
        '@typescript-eslint/no-var-requires': 0,

        // Using snakecase for log messages
        '@typescript-eslint/camelcase': 0,

        // Conflicts with prettier
        '@typescript-eslint/indent': 0,
        '@typescript-eslint/member-delimiter-style': 0,

        // Rules with too much constraints
        '@typescript-eslint/explicit-member-accessibility': 0,
        '@typescript-eslint/explicit-function-return-type': 0,
        '@typescript-eslint/no-explicit-any': 0
    }
}
