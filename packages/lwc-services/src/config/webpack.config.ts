const { buildWebpackConfig } = require('../utils/webpack/webpack-builder')
const CopyPlugin = require('copy-webpack-plugin')
const ErrorOverlayPlugin = require('error-overlay-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
import * as path from 'path'
const fs = require('fs')

import { lwcConfig } from './lwcConfig'

const ROOT_DIR = process.cwd()
const OUTPUT_DIR = path.resolve(ROOT_DIR, lwcConfig.buildDir)
const MODULE_DIR = path.resolve(ROOT_DIR, lwcConfig.moduleDir)
const TEMPLATES_DIR = path.resolve(ROOT_DIR, lwcConfig.sourceDir)
let ENTRIES = path.resolve(TEMPLATES_DIR, 'index.js')
if (ENTRIES && !fs.existsSync(ENTRIES)) {
    ENTRIES = path.resolve(TEMPLATES_DIR, 'index.ts')
}

// Simple mechanism to pass any arbitrary config values from the CLI for webpack
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
            template: path.resolve(TEMPLATES_DIR, 'index.html')
        })
    ])

    if (lwcConfig.resources.length) {
        const resources: any = []
        lwcConfig.resources.forEach((resource: any) => {
            resources.push({
                from: path.resolve(process.cwd(), resource.from),
                to: path.join(process.cwd(), resource.to)
            })
        })
        lwcWebpackConfig.plugins = (lwcWebpackConfig.plugins || []).concat([
            new CopyPlugin(resources)
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
