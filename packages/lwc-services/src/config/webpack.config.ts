const { buildWebpackConfig } = require('../utils/webpack/webpack-builder')
const CopyPlugin = require('copy-webpack-plugin')
const ErrorOverlayPlugin = require('error-overlay-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
import { join, resolve } from 'path'
import { existsSync } from 'fs'

import { lwcConfig } from './lwcConfig'

const ROOT_DIR = process.cwd()
const OUTPUT_DIR = resolve(ROOT_DIR, lwcConfig.buildDir)
const MODULE_DIR = resolve(ROOT_DIR, lwcConfig.sourceDir, 'modules')
const TEMPLATES_DIR = resolve(ROOT_DIR, lwcConfig.sourceDir)
let ENTRIES = resolve(TEMPLATES_DIR, 'index.js')
if (!ENTRIES || !existsSync(ENTRIES)) {
    ENTRIES = resolve(TEMPLATES_DIR, 'index.ts')
}

// Simple mechanism to pass any arbitrary config values from the CLI for webpack
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function generateWebpackConfig(mode?: string, customConfig?: any) {
    const lwcWebpackConfig = buildWebpackConfig({
        entries: [ENTRIES],
        outputDir: OUTPUT_DIR,
        moduleDir: MODULE_DIR,
        mode,
        customConfig
    })

    lwcWebpackConfig.plugins = (lwcWebpackConfig.plugins || []).concat([
        new HtmlWebpackPlugin({
            template: resolve(TEMPLATES_DIR, 'index.html')
        })
    ])

    if (lwcConfig.resources.length) {
        const resources: any = []
        lwcConfig.resources.forEach((resource: any) => {
            resources.push({
                from: resolve(process.cwd(), resource.from),
                to: join(process.cwd(), resource.to)
            })
        })
        lwcWebpackConfig.plugins = (lwcWebpackConfig.plugins || []).concat([
            new CopyPlugin({ patterns: resources })
        ])
    }

    // error-overlay-webpack-plugin has a bug that breaks the build when > 1 entry point is specified
    if (Object.keys(lwcWebpackConfig.entry).length == 1) {
        lwcWebpackConfig.plugins = (lwcWebpackConfig.plugins || []).concat([
            // TODO Test potential alternatives for multiple entries
            new ErrorOverlayPlugin()
        ])
    }

    return lwcWebpackConfig
}
