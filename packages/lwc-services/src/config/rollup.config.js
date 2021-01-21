/* eslint-env node */

const path = require('path')
const replace = require('@rollup/plugin-replace')
const lwcCompiler = require('@lwc/rollup-plugin')
const { terser } = require('rollup-plugin-terser')
const { lwcConfig } = require('./lwcConfig')
const fs = require('fs')
import typescriptPlugin from 'rollup-plugin-lwc-typescript'
const { generateSW, injectManifest } = require('rollup-plugin-workbox')
import copy from 'rollup-plugin-copy-glob'
import serve from 'rollup-plugin-serve'
import livereload from 'rollup-plugin-livereload'

const env = process.env.NODE_ENV || lwcConfig.mode

let input = path.resolve(process.cwd(), lwcConfig.sourceDir, 'index.js')
if (!input || !fs.existsSync(input)) {
    input = path.resolve(process.cwd(), lwcConfig.sourceDir, 'index.ts')
}

const outputDir = path.resolve(process.cwd(), lwcConfig.buildDir)

let workboxConfig
let hasGenerateSw = false
let hasInject = false

const workboxGenerateSw = path.resolve(
    process.cwd(),
    './scripts/workbox.generatesw.js'
)
const workboxInjectManifest = path.resolve(
    process.cwd(),
    './scripts/workbox.inject.js'
)

if (fs.existsSync(workboxGenerateSw)) {
    hasGenerateSw = true
    workboxConfig = require(workboxGenerateSw)
}

if (!hasGenerateSw && fs.existsSync(workboxInjectManifest)) {
    hasInject = true
    workboxConfig = require(workboxGenerateSw)
}

const resources = []

lwcConfig.resources.forEach((resource) => {
    resources.push({ files: resource.from, dest: resource.to })
})

module.exports = (format = 'esm') => {
    const isProduction = env === 'production'
    const isWatch = process.env.ROLLUP_WATCH

    return {
        input,
        output: {
            file: path.join(outputDir, 'main.js'),
            format: 'esm'
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
            typescriptPlugin(),
            lwcCompiler({
                rootDir: path.join(
                    process.cwd(),
                    lwcConfig.sourceDir,
                    'modules'
                ),
                stylesheetConfig: lwcConfig.lwcCompilerStylesheetConfig || {}
            }),
            replace({ 'process.env.NODE_ENV': JSON.stringify(env) }),
            isProduction && terser(),
            hasGenerateSw && generateSW(workboxConfig),
            hasInject && injectManifest(workboxConfig),
            copy(resources, { watch: isWatch }),
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
