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
const spawn = require('child_process').spawn

const rollupConfig = path.resolve(__dirname, '../config/rollup.config.js')

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
        }),
        bundler: flags.string({
            char: 'b',
            description: messages.flags.bundler,
            default: lwcConfig.bundler
        })
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async run() {
        const { flags } = this.parse(Watch)

        // eslint-disable-next-line no-console
        console.clear()
        welcome()

        if (flags.bundler === 'webpack') {
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
        } else {
            const HOST =
                flags.host && flags.host !== lwcConfig.devServer.host
                    ? flags.host
                    : lwcConfig.devServer.host
            const PORT =
                flags.port && flags.port !== lwcConfig.devServer.port
                    ? flags.port
                    : lwcConfig.devServer.port
            const MODE = flags.mode || 'development'
            const OPEN = flags.open

            const ENV_PARAMS = [
                `DEV_HOST_OPEN:${OPEN}`,
                `DEV_HOST:${HOST}`,
                `DEV_PORT:${PORT}`,
                `NODE_ENV:${MODE}`
            ].join(',')

            // This looks super wonky... and it may be super wonky. ;-)
            const args = [
                './node_modules/rollup/dist/bin/rollup',
                '-c',
                rollupConfig,
                '--environment',
                ENV_PARAMS,
                '--watch'
            ]
            const rollupSpawn = spawn('node', args)

            rollupSpawn.on('error', (err: string) => {
                log({ message: `${err}`, emoji: 'sos' })
            })

            // It's super weird that the debug message is passed via stderr. But it is what it is.
            rollupSpawn.stderr.on('data', (data: string) => {
                log({ message: `${data}`, emoji: 'rainbow' })
            })

            const protocol = 'http'
            const url = `${protocol}://${HOST}:${PORT}`

            log(messages.logs.local_server_listening, url)
        }
    }
}
