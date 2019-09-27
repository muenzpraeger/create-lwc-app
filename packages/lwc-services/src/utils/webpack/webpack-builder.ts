import * as webpack from 'webpack'
import * as webpackMerge from 'webpack-merge'
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin'

const { npmmodules, LAYOUT } = require('./module')
import * as path from 'path'
import { readdirSync } from 'fs'
const npms = Object.values(npmmodules).map((f: any) => path.dirname(f.entry))
const ModuleResolver = require('./module-resolver')
const moduleLoader = require.resolve('./module-loader')

const JS_LOADER = {
    test: /\.js$/,
    exclude: /(node_modules|modules|lwc)/,
    use: {
        loader: require.resolve('babel-loader'),
        options: {
            plugins: [
                require.resolve('@babel/plugin-proposal-object-rest-spread')
            ],
            babelrc: false
        }
    }
}

const TS_LOADER = {
    test: /\.ts$/,
    exclude: /(node_modules|modules|lwc|@lwc\/wire-service)/,
    use: {
        loader: require.resolve('babel-loader'),
        options: {
            plugins: [
                require.resolve('@babel/plugin-syntax-class-properties'),
                [
                    require.resolve('@babel/plugin-syntax-decorators'),
                    {
                        decoratorsBeforeExport: true
                    }
                ]
            ],
            presets: [require.resolve('@babel/preset-typescript')]
        }
    }
}

const optimization: webpack.Options.Optimization = {
    splitChunks: {
        cacheGroups: {
            lwc: {
                test: /[\\/]node_modules[\\/]@lwc[\\/]engine/,
                chunks: 'all',
                priority: 1
            },
            node_vendors: {
                test: /[\\/]node_modules[\\/]/,
                chunks: 'all',
                priority: -10
            }
        }
    }
}

function isWebpackEntryFunc(entry: any): entry is webpack.EntryFunc {
    return typeof entry === 'function'
}

function getWebpackEntryPaths(
    entry: string | string[] | webpack.Entry
): string[] {
    if (typeof entry === 'string') {
        return [entry]
    }

    if (entry instanceof Array) {
        return entry
    }

    let paths: string[] = []
    Object.keys(entry).forEach(name => {
        let path = entry[name]
        if (typeof path === 'string') {
            paths.push(path)
        } else {
            paths.concat(path)
        }
    })
    return paths
}

// @ts-ignore
function buildWebpackConfig({
    entries,
    outputDir,
    moduleDir,
    mode,
    customConfig
}: any) {
    let isProduction = false

    if (mode && mode === 'production') {
        isProduction = true
    } else {
        isProduction = process.env.NODE_ENV === 'production'
    }

    const MODULE_CONFIG = {
        path: moduleDir,
        layout: LAYOUT.NAMESPACED
    }

    const DEFINE_CONFIG = {
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    }

    const devToolOption = isProduction ? undefined : 'source-map'

    const srcDir = path.join(moduleDir, '..')
    const allDirs = readdirSync(srcDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => path.join(srcDir, dirent.name))
    let serverConfig: webpack.Configuration = {
        entry: entries,
        mode: isProduction ? 'production' : 'development',
        output: {
            path: outputDir,
            filename: 'app.js',
            publicPath: '/'
        },

        module: {
            rules: [
                {
                    test: /\.(js|ts|html|css)$/,
                    include: [...allDirs, ...npms],
                    use: [
                        {
                            loader: moduleLoader,
                            options: {
                                module: MODULE_CONFIG,
                                mode: isProduction
                            }
                        }
                    ]
                },
                JS_LOADER,
                TS_LOADER
            ]
        },

        plugins: [new webpack.DefinePlugin(DEFINE_CONFIG)],
        devtool: devToolOption,
        optimization
    }
    if (isProduction) {
        serverConfig = {
            ...serverConfig,
            ...{
                devServer: {
                    watchContentBase: false,
                    hot: false,
                    quiet: true,
                    compress: true,
                    publicPath: '/',
                    historyApiFallback: true
                }
            }
        }
    }

    if (customConfig) {
        serverConfig = webpackMerge.smart(serverConfig, customConfig)
    }

    if (!serverConfig.entry || isWebpackEntryFunc(serverConfig.entry)) {
        // Webpack API specifies that entry be a string | string[] | {[entryChunkName: string]: string|Array<string>}
        return serverConfig
    }

    let entryPaths = getWebpackEntryPaths(serverConfig.entry)
    const lwcModuleResolver = {
        resolve: {
            extensions: ['.js', '.ts', '.json'],
            alias: {
                lwc: require.resolve('@lwc/engine'),
                '@lwc/wire-service': require.resolve('@lwc/wire-service')
            },
            plugins: [
                new TsconfigPathsPlugin(),
                new ModuleResolver({
                    module: MODULE_CONFIG,
                    entries: entryPaths
                })
            ]
        }
    }
    serverConfig = webpackMerge.smart(serverConfig, lwcModuleResolver)

    return serverConfig
}

module.exports = {
    buildWebpackConfig,
    JS_LOADER,
    TS_LOADER
}
