import merge = require('deepmerge')
import { resolve } from 'path'

interface ResourceFolder {
    from: string
    to: string
}
interface Config {
    // Default directory for the build output
    buildDir: string
    // Default bundler to use
    bundler: string
    // Default mode for build command
    mode: string
    // Clears the build directory on every build
    noclear: boolean
    // Default directory for source files
    sourceDir: string
    // List of resources for copying to the build folder
    resources: ResourceFolder[]
    // Default server options for watch command
    devServer: {
        port: number
        host: string
        open: boolean
        stats: string
        noInfo: boolean
        contentBase: string
    }
    // LWC Compiler options for production mode.
    // Find the detailed description here: https://www.npmjs.com/package/@lwc/compiler
    lwcCompilerOutput: {
        development?: {
            compat?: boolean
            minify?: boolean
            env?: {
                NODE_ENV: string
            }
            format?: string
        }
        production?: {
            compat?: boolean
            minify?: boolean
            env?: {
                NODE_ENV: string
            }
            format?: string
        }
    }
    lwcCompilerStylesheetConfig: any
    lwcExperimentalDynamicComponent: any
}

export const defaultLwcConfig: Config = {
    // Default directory for the build output
    buildDir: './dist',
    // Default bundler
    bundler: 'webpack',
    // Default mode for build command
    mode: 'development',
    // Clears the build directory on every build
    noclear: false,
    // Default directory for source files
    sourceDir: './src',
    // List of resources for copying to the build folder
    resources: [],
    // Default server options for watch command
    devServer: {
        port: 3001,
        host: 'localhost',
        open: false,
        stats: 'errors-only',
        noInfo: true,
        contentBase: './src'
    },
    // LWC Compiler options for production mode.
    // Find the detailed description here: https://www.npmjs.com/package/@lwc/compiler
    lwcCompilerOutput: {
        development: {
            compat: false,
            minify: true,
            env: {
                NODE_ENV: 'production'
            },
            format: 'amd'
        },
        production: {
            compat: false,
            minify: true,
            env: {
                NODE_ENV: 'production'
            },
            format: 'amd'
        }
    },
    lwcCompilerStylesheetConfig: {},
    lwcExperimentalDynamicComponent: {}
}

function buildConfig(): Config {
    let combinedConfig: Config = defaultLwcConfig
    try {
        const fileName = resolve(process.cwd(), 'lwc-services.config.js')
        const config = require(fileName)
        combinedConfig = merge(defaultLwcConfig, config)
        return combinedConfig
    } catch (error) {
        console.error(
            'Using default configuration! Error loading custom config'
        )
        console.error(error)
    }
    return combinedConfig
}

export const lwcConfig: Config = buildConfig()
