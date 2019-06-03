const { buildWebpackConfig } = require('../utils/webpack/webpack-builder')
const CopyPlugin = require('copy-webpack-plugin')
const ErrorOverlayPlugin = require('error-overlay-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
// tslint:disable-next-line: no-implicit-dependencies
import merge = require('deepmerge')
import * as path from 'path'

import { lwcConfig } from './lwcConfig'

const ROOT_DIR = process.cwd()
const OUTPUT_DIR = path.resolve(ROOT_DIR, lwcConfig.buildDir)
const MODULE_DIR = path.resolve(ROOT_DIR, lwcConfig.moduleDir)
const TEMPLATES_DIR = path.resolve(ROOT_DIR, lwcConfig.sourceDir)

// Simple mechanism to pass any arbitrary config values from the CLI for webpack
export function generateWebpackConfig(mode?: string, config?: any) {
    let lwcWebpackConfig = buildWebpackConfig({
        entries: [path.resolve(TEMPLATES_DIR, 'index.js')],
        outputDir: OUTPUT_DIR,
        moduleDir: MODULE_DIR,
        mode
    })

    lwcWebpackConfig.plugins = (lwcWebpackConfig.plugins || []).concat([
        new HtmlWebpackPlugin({
            template: path.resolve(TEMPLATES_DIR, 'index.html')
        })
    ])

    if (config) {
        lwcWebpackConfig = merge(lwcWebpackConfig, config)
    }

    if (lwcConfig.resources.length) {
        let resources: any = []
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
    lwcWebpackConfig.plugins = (lwcWebpackConfig.plugins || []).concat([
        new ErrorOverlayPlugin()
    ])
    return lwcWebpackConfig
}
