/* eslint-env node */

const path = require('path');
const replace = require('rollup-plugin-replace');
const lwcCompiler = require('@lwc/rollup-plugin');
const compat = require('rollup-plugin-compat');
const { transform } = require('@babel/core');<% if (typescript) { %>    
const babelTsPlugin = require('@babel/plugin-transform-typescript');<% } %>    
const env = process.env.NODE_ENV || 'development';

<% if (typescript) { %>    
const babelOptions = {
    babelrc: false,
    plugins: [babelTsPlugin],
    parserOpts: {
        plugins: [
            ['decorators', { decoratorsBeforeExport: true }],
            ['classProperties', {}]
        ]
    }
};

function removeTypesPlugin() {
    return {
        name: 'ts-removal',
        transform(src, id) {
            if (path.extname(id) === '.ts') {
                const { code, map } = transform(src, babelOptions);
                return { code, map };
            }
        }
    };
}<% } %>

const input = path.resolve(__dirname, '../src/modules/index.'<% } %><% if(typescript) {%>ts<%} else {%>js<%}%>);
const outputDir = path.resolve(__dirname, '../public/js');

function rollupConfig({ target }) {
    const isCompat = target === 'es5';
    const isProduction = env === 'production';

    return {
        input,
        output: {
            file: path.join(outputDir, isCompat ? 'compat.js' : 'main.js'),
            format: 'iife'
        },
        plugins: [
            <%if (typescript) {%>removeTypesPlugin(),<%}%>
            lwcCompiler()
            replace({ 'process.env.NODE_ENV': JSON.stringify(env) }),
            isCompat && compat(),
            isProduction && terser()
        ].filter(Boolean)
    };
}

module.exports = [
    // rollupConfig({ target: 'es5' }),
    rollupConfig({ target: 'es2017' })
];
