import * as webpack from 'webpack'
import { merge } from 'webpack-merge'

function isWebpackEntryFunc(entry: any) {
    return typeof entry === 'function'
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
function buildWebpackConfig({ entries, outputDir, mode, customConfig }: any) {
    let isProduction = false

    if (mode && mode === 'production') {
        isProduction = true
    } else {
        isProduction = process.env.NODE_ENV === 'production'
    }

    const DEFINE_CONFIG = {
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    }

    const devToolOption = isProduction ? undefined : 'source-map'

    let serverConfig: webpack.Configuration = {
        entry: entries,
        mode: isProduction ? 'production' : 'development',
        output: {
            path: outputDir,
            filename: 'app-[contenthash].js',
            publicPath: './'
        },

        plugins: [new webpack.DefinePlugin(DEFINE_CONFIG)],
        devtool: devToolOption
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
                    publicPath: './',
                    historyApiFallback: true
                }
            }
        }
    }

    if (customConfig) {
        serverConfig = merge(serverConfig, customConfig)
    }

    if (!serverConfig.entry || isWebpackEntryFunc(serverConfig.entry)) {
        // Webpack API specifies that entry be a string | string[] | {[entryChunkName: string]: string|Array<string>}
        return serverConfig
    }

    return serverConfig
}

module.exports = {
    buildWebpackConfig
}
