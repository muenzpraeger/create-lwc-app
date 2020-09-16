import { Command, flags } from '@oclif/command'
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from 'fs'
import { join, resolve } from 'path'
import util = require('util')
import * as webpackMerge from 'webpack-merge'

import { jestConfig } from '../config/jestConfig'
import { defaultLwcConfig } from '../config/lwcConfig'
import { generateWebpackConfig } from '../config/webpack.config'
import { messages } from '../messages/sniff'
import { log, welcome } from '../utils/logger'

const rollupConfig = resolve(__dirname, '../config/rollup.config.js')

export default class Sniff extends Command {
    static description = messages.description

    static examples = messages.help.examples

    static flags = {
        help: flags.help({ char: 'h' }),
        directory: flags.string({
            char: 'd',
            description: messages.flags.directory,
            required: true
        }),
        webpack: flags.string({
            char: 'w',
            description: messages.flags.webpack
        })
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async run() {
        const { flags } = this.parse(Sniff)

        // eslint-disable-next-line no-console
        console.clear()
        welcome()

        if (!flags.directory) {
            log(messages.errors.nodirectory)
            return
        }

        if (!existsSync(flags.directory)) {
            mkdirSync(flags.directory)
        }

        log(messages.logs.calculating_configurations)
        let webpackConfig = generateWebpackConfig()

        if (flags.webpack) {
            // Merging custom webpack config file
            log(messages.logs.custom_configuration)
            const webpackConfigCustom = require(resolve(
                process.cwd(),
                flags.webpack
            ))
            webpackConfig = webpackMerge.smart(
                webpackConfig,
                webpackConfigCustom
            )
        }

        log(messages.logs.write_jest_config)

        const inspectOptions = { depth: null }

        writeFileSync(
            join(flags.directory, 'jest.config.js'),
            'module.exports = ' + util.inspect(jestConfig, inspectOptions)
        )
        log(messages.logs.write_webpack_config)
        writeFileSync(
            join(flags.directory, 'webpack.config.js'),
            'module.exports = ' + util.inspect(webpackConfig, inspectOptions)
        )
        log(messages.logs.write_rollup_config)
        copyFileSync(rollupConfig, join(flags.directory, 'rollup.config.js'))
        log(messages.logs.write_lwc_config)
        writeFileSync(
            join(flags.directory, 'lwc-services.config.js'),
            'module.exports = ' + util.inspect(defaultLwcConfig, inspectOptions)
        )
        log(messages.logs.enjoy)
    }
}
