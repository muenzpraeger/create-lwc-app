import { Command, flags } from '@oclif/command'
import cli from 'cli-ux'
import * as fs from 'fs'
import * as path from 'path'
import * as webpack from 'webpack'
import * as webpackMerge from 'webpack-merge'

import { lwcConfig } from '../config/lwcConfig'
import { generateWebpackConfig } from '../config/webpack.config'
import { messages } from '../messages/watch'
import { log, welcome } from '../utils/logger'

export default class Watch extends Command {
    static description = messages.description

    static examples = messages.help.examples

    static flags = {
        help: flags.help({ char: 'h' }),
        mode: flags.string({
            char: 'm',
            description: messages.flags.mode,
            default: lwcConfig.mode
        }),
        host: flags.string({
            char: 'i',
            description: messages.flags.host,
            default: lwcConfig.devServer.host
        }),
        open: flags.boolean({
            char: 'o',
            description: messages.flags.open,
            default: lwcConfig.devServer.open
        }),
        port: flags.integer({
            char: 'p',
            description: messages.flags.port,
            default: lwcConfig.devServer.port
        }),
        webpack: flags.string({
            char: 'w',
            description: messages.flags.webpack
        })
    }

    async run() {
        const { flags } = this.parse(Watch)

        // eslint-disable-next-line no-console
        console.clear()
        welcome()

        // Check if custom webpack config is passed, and if it really exists.
        if (flags.webpack) {
            if (!fs.existsSync(flags.webpack)) {
                log(messages.errors.no_webpack)
                return
            }
        }

        let webpackConfig = generateWebpackConfig(flags.mode)
        lwcConfig.devServer.contentBase = lwcConfig.sourceDir
        webpackConfig.devServer = lwcConfig.devServer

        // Merging custom webpack config file
        if (flags.webpack) {
            log(messages.logs.custom_configuration)
            const webpackConfigCustom = require(path.resolve(
                process.cwd(),
                flags.webpack
            ))
            webpackConfig = webpackMerge.smart(
                webpackConfig,
                webpackConfigCustom
            )
        }

        if (flags.host && flags.host !== lwcConfig.devServer.host) {
            webpackConfig.devServer.host = flags.host
        }

        if (flags.port && flags.port !== lwcConfig.devServer.port) {
            webpackConfig.devServer.port = flags.port
        }

        log(messages.logs.build_start)
        // Lazy loading
        const WebpackDevServer = require('webpack-dev-server')

        const compiler = webpack(webpackConfig)

        const app = new WebpackDevServer(compiler, webpackConfig.devServer)

        app.listen(
            webpackConfig.devServer.port,
            webpackConfig.devServer.host,
            () => {
                const protocol = 'http'
                const url = `${protocol}://${webpackConfig.devServer.host}:${webpackConfig.devServer.port}`

                log(messages.logs.local_server_listening, url)

                if (flags.open) {
                    cli.open(url)
                }
            }
        )
    }
}
