const { transform } = require('@babel/core')
const babelTsPlugin = require('@babel/plugin-transform-typescript')
const path = require('path')

const babelOptions = {
    babelrc: false,
    plugins: [babelTsPlugin],
    parserOpts: {
        plugins: [
            ['decorators', { decoratorsBeforeExport: true }],
            ['classProperties', {}]
        ]
    }
}

module.exports = function typescriptConverter() {
    return {
        name: 'lwc-rollup-typescript',
        async transform(src, id) {
            if (path.extname(id) === '.ts') {
                const { code, map } = transform(src, babelOptions)
                return { code, map }
            }
        }
    }
}
