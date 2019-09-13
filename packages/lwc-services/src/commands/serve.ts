import { Command, flags } from '@oclif/command'
import cli from 'cli-ux'
import * as fs from 'fs'
import * as path from 'path'

const compression = require('compression')
const helmet = require('helmet')
const express = require('express')

import { lwcConfig } from '../config/lwcConfig'
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
        })
    }

    async run() {
        const { flags } = this.parse(Serve)

        // eslint-disable-next-line no-console
        console.clear()
        welcome()

        const BUILD_DIR = flags.directory ? flags.directory : lwcConfig.buildDir

        lwcConfig.server.host = flags.host ? flags.host : lwcConfig.server.host
        lwcConfig.server.port = flags.port ? flags.port : lwcConfig.server.port

        // Override for SaaS deployments
        if (process.env.PORT) {
            lwcConfig.server.port = Number(process.env.PORT)
        }
        if (process.env.HOST) {
            lwcConfig.server.host = process.env.HOST
        }

        // Check if given source directory exists. If not we're exiting.
        if (!fs.existsSync(BUILD_DIR)) {
            log(messages.errors.no_build_dir, BUILD_DIR)
            return
        }

        const app = express()
        app.use(helmet())
        app.use(compression())
        app.use(express.static(BUILD_DIR))

        if (
            lwcConfig.server.customConfig &&
            fs.existsSync(lwcConfig.server.customConfig)
        ) {
            const isTypeScript = lwcConfig.server.customConfig.endsWith('ts')

            let customExpressConfig

            if (isTypeScript) {
                require(path.resolve(lwcConfig.server.customConfig)).default
            } else {
                customExpressConfig = require(path.resolve(
                    lwcConfig.server.customConfig
                ))
            }

            customExpressConfig(app)
        }

        app.use('*', (req: any, res: any) => {
            res.sendFile(path.resolve(BUILD_DIR, 'index.html'))
        })
        app.listen(lwcConfig.server.port, lwcConfig.server.host, () => {
            const protocol = 'http'
            const url = `${protocol}://${lwcConfig.server.host}:${lwcConfig.server.port}`

            log(messages.logs.local_server_listening, url)

            if (flags.open) {
                cli.open(url)
            }
        })
    }
}
