import merge = require('deepmerge')
import * as path from 'path'

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
    // Defines the directory where to find the individual
    // modules. Change only when you know what you do. ;-)
    moduleDir: string
    // Array of directories where to look for additional
    // modules that don't live in `moduleDir`
    localModulesDirs: string[]
    // Defines the directory layout. Using `namespaced` is easiest. Or so.
    layout: string
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
    // Default directory for the build output
    bundler: 'webpack',
    // Default mode for build command
    mode: 'development',
    // Clears the build directory on every build
    noclear: false,
    // Defines the directory where to find the individual
    // modules. Change only when you know what you do. ;-)
    moduleDir: 'src/modules',
    // Array of directories where to look for additional
    // modules that don't live in `moduleDir`
    localModulesDirs: [],
    // Defines the directory layout. Using `namespaced` is easiest. Or so.
    layout: 'namespaced',
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
        const fileName = path.resolve(process.cwd(), 'lwc-services.config.js')
        const config = require(fileName)
        combinedConfig = merge(defaultLwcConfig, config)
        return combinedConfig
    } catch (error) {
        // We don't need error handling atm
    }
    return combinedConfig
}

export const lwcConfig: Config = buildConfig()
