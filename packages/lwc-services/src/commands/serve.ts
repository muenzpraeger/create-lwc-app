import { Command, flags } from '@oclif/command'
import cli from 'cli-ux'
import * as fs from 'fs'
import * as path from 'path'
import * as webpack from 'webpack'
import * as webpackMerge from 'webpack-merge'

import { lwcConfig } from '../config/lwcConfig'
import { generateWebpackConfig } from '../config/webpack.config'
import { messages } from '../messages/serve'
import { log, welcome } from '../utils/logger'

export default class Serve extends Command {
    static description = messages.description

    static examples = messages.help.examples

    static flags = {
        help: flags.help({ char: 'h' }),
        directory: flags.string({
            char: 'd',
            description: messages.flags.directory,
            default: lwcConfig.buildDir
        }),
        host: flags.string({
            char: 'i',
            description: messages.flags.host,
            default: lwcConfig.server.host
        }),
        open: flags.boolean({
            char: 'o',
            description: messages.flags.open,
            default: lwcConfig.server.open
        }),
        port: flags.integer({
            char: 'p',
            description: messages.flags.port,
            default: lwcConfig.server.port
        }),
        webpack: flags.string({
            char: 'w',
            description: messages.flags.webpack
        })
    }

    async run() {
        const { flags } = this.parse(Serve)

        // tslint:disable-next-line: no-console
        console.clear()

        welcome()

        const BUILD_DIR = flags.directory ? flags.directory : lwcConfig.buildDir

        lwcConfig.server.host = flags.host ? flags.host : lwcConfig.server.host
        lwcConfig.server.port = flags.port ? flags.port : lwcConfig.server.port

        // Override for SaaS deployments
        if (process.env.PORT) {
            lwcConfig.server.port = Number(process.env.PORT)
        }

        // Check if given source directory exists. If not we're exiting.
        if (!fs.existsSync(BUILD_DIR)) {
            log(messages.errors.no_build_dir, BUILD_DIR)
            return
        }

        // Check if custom webpack config is passed, and if it really exists.
        if (flags.webpack) {
            if (!fs.existsSync(flags.webpack)) {
                log(messages.errors.no_webpack)
                return
            }
        }

        let webpackConfig = generateWebpackConfig('production')
        lwcConfig.devServer.contentBase = lwcConfig.sourceDir
        webpackConfig.devServer = {
            ...lwcConfig.devServer,
            ...lwcConfig.server
        }

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

        if (flags.host && flags.host !== lwcConfig.server.host) {
            webpackConfig.devServer.host = flags.host
        }

        if (flags.port && flags.port !== lwcConfig.server.port) {
            webpackConfig.devServer.port = flags.port
        }

        // Lazy loading
        const WebpackDevServer = require('webpack-dev-server')

        // tslint:disable-next-line: no-unused
        const compiler = webpack(webpackConfig)

        const app = new WebpackDevServer(compiler, webpackConfig.devServer)

        app.listen(
            webpackConfig.devServer.port,
            webpackConfig.devServer.host,
            () => {
                const protocol = 'http'
                const url = `${protocol}://${webpackConfig.devServer.host}:${
                    webpackConfig.devServer.port
                }`

                log(messages.logs.local_server_listening, url)

                if (flags.open) {
                    // tslint:disable-next-line: no-floating-promises
                    cli.open(url)
                }
            }
        )
    }
}
