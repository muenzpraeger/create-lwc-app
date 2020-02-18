/* eslint-env node */

const path = require('path')
const replace = require('@rollup/plugin-replace')
const lwcCompiler = require('@lwc/rollup-plugin')
const { terser } = require('rollup-plugin-terser')
const { transform } = require('@babel/core')
const babelTsPlugin = require('@babel/plugin-transform-typescript')
const { lwcConfig } = require('./lwcConfig')
import serve from 'rollup-plugin-serve'
import livereload from 'rollup-plugin-livereload'

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

function removeTypesPlugin() {
    return {
        name: 'ts-removal',
        transform(src, id) {
            if (path.extname(id) === '.ts') {
                const { code, map } = transform(src, babelOptions)
                return { code, map }
            }
        }
    }
}

const env = process.env.NODE_ENV || lwcConfig.mode

// TODO-RW: make agnostic to clientserver and JS/TS
const input = path.resolve(process.cwd(), lwcConfig.sourceDir, 'index.js')
const outputDir = path.resolve(process.cwd(), lwcConfig.buildDir)
// TODO-RW: Add clean options

module.exports = (format = 'esm') => {
    const isProduction = env === 'production'
    const isWatch = process.env.ROLLUP_WATCH

    return {
        input,
        output: {
            file: path.join(outputDir, 'main.js'),
            format: format
        },
        manualChunks(id) {
            if (id.includes('lwc')) {
                return ['lwc']
            } else if (id.includes('node_modules')) {
                return ['vendor']
            }
            return 'common'
        },
        plugins: [
            removeTypesPlugin(),
            lwcCompiler({
                rootDir: path.join(process.cwd(), lwcConfig.moduleDir)
            }),
            replace({ 'process.env.NODE_ENV': JSON.stringify(env) }),
            isProduction && terser(),
            isWatch &&
                serve({
                    open: process.env.DEV_HOST_OPEN,
                    host: process.env.DEV_HOST || lwcConfig.host,
                    port: process.env.DEV_PORT || lwcConfig.port,
                    contentBase: [lwcConfig.buildDir]
                }),
            isWatch && livereload()
        ].filter(Boolean),
        watch: {
            exclude: ['node_modules/**']
        }
    }
}
