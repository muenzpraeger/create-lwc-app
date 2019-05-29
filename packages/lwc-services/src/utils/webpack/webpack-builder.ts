const webpack = require('webpack')

const { npmmodules, LAYOUT } = require('./module')
import * as path from 'path'
const npms = Object.values(npmmodules).map((f: any) => path.dirname(f.entry))
const ModuleResolver = require('./module-resolver')
const moduleLoader = require.resolve('./module-loader')

const BABEL_LOADER = {
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

const optimization = {
    splitChunks: {
        cacheGroups: {
            node_vendors: {
                test: /[\\/]node_modules[\\/]/,
                chunks: 'all',
                priority: 1
            }
        }
    }
}

// @ts-ignore
function buildWebpackConfig({ entries, outputDir, moduleDir }, mode: string) {
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

    let serverConfig = {
        entry: entries,
        mode: isProduction ? 'production' : 'development',
        output: {
            path: outputDir,
            filename: 'app.js'
        },
        resolve: {
            alias: {
                lwc: require.resolve('@lwc/engine'),
                '@lwc/wire-service': require.resolve('@lwc/wire-service')
            },
            plugins: [
                new ModuleResolver({
                    module: MODULE_CONFIG,
                    entries
                })
            ]
        },

        module: {
            rules: [
                {
                    test: /\.(js|html|css)$/,
                    include: [moduleDir, ...npms],
                    use: [
                        {
                            loader: moduleLoader,
                            options: {
                                module: MODULE_CONFIG
                            }
                        }
                    ]
                },
                BABEL_LOADER
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
                watchContentBase: false,
                hot: false,
                quiet: true,
                compress: true,
                publicPath: '/'
            }
        }
    }
    return serverConfig
}

module.exports = {
    buildWebpackConfig,
    BABEL_LOADER
}
