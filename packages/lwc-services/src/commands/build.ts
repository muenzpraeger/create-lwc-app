import { Command, flags } from '@oclif/command'
import * as fs from 'fs'
import * as path from 'path'
import * as rimraf from 'rimraf'
import * as webpack from 'webpack'
import * as webpackMerge from 'webpack-merge'

import { lwcConfig } from '../config/lwcConfig'
import { generateWebpackConfig } from '../config/webpack.config'
import { messages } from '../messages/build'
import { log, welcome } from '../utils/logger'
import { analyzeStats } from '../utils/webpack/statsAnalyzer'

export default class Build extends Command {
    static description = messages.description

    static examples = messages.help.examples

    static flags = {
        help: flags.help({ char: 'h' }),
        destination: flags.string({
            char: 'd',
            description: messages.flags.destination,
            default: lwcConfig.buildDir
        }),
        mode: flags.string({
            char: 'm',
            description: messages.flags.mode,
            default: lwcConfig.mode
        }),
        noclear: flags.boolean({
            char: 'n',
            description: messages.flags.noclear,
            default: lwcConfig.noclear
        }),
        webpack: flags.string({
            char: 'w',
            description: messages.flags.webpack
        })
    }

    async run() {
        const { flags } = this.parse(Build)

        // tslint:disable-next-line: no-console
        console.clear()
        welcome()

        // For now we use SOURCE_DIR_DEFAULT, may become a dedicated input parameter at a later point in time
        const SOURCE_DIR = lwcConfig.sourceDir

        // Defining the destination directory
        const BUILD_DIR = lwcConfig.buildDir

        // Check if given source directory exists. If not we're exiting.
        if (!fs.existsSync(SOURCE_DIR)) {
            log(messages.errors.no_source_dir, SOURCE_DIR)
            return
        }

        // Clearing build directory, if the user didn't override.
        if (!lwcConfig.noclear) {
            if (fs.existsSync(BUILD_DIR)) {
                rimraf.sync(BUILD_DIR)
                log(messages.logs.clear)
            }
        }

        // Check if custom webpack config is passed, and if it really exists.
        if (flags.webpack) {
            if (!fs.existsSync(flags.webpack)) {
                log(messages.errors.no_webpack)
                return
            }
        }

        log(messages.logs.creating_build_configuration)
        let webpackConfig = generateWebpackConfig(flags.mode!)

        log(messages.logs.build_start)

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

        if (flags.mode && flags.mode !== lwcConfig.mode) {
            webpackConfig.mode = flags.mode
        }

        if (flags.destination && flags.destination !== lwcConfig.buildDir) {
            webpackConfig.output.path = path.resolve(
                process.cwd(),
                flags.destination
            )
        }

        try {
            await buildWebpack()
            log(messages.logs.build_end)
        } catch (error) {
            log({ message: error, emoji: 'sos' })
        }

        function buildWebpack() {
            return new Promise((resolve, reject) => {
                webpack(webpackConfig, (err: any, stats: any) => {
                    if (err) {
                        reject(err)
                    }
                    if (!stats || !stats.compilation) {
                        log(messages.errors.no_compilation)
                    }
                    // Parsing out error messages during compilation. Makes life MUCH easier.
                    const { errors } = stats.compilation
                    if (errors.length) {
                        let errorMessages = ''
                        errors.forEach((error: any) => {
                            errorMessages = errorMessages
                                .concat(error.message)
                                .concat('\n')
                        })
                        return reject(errorMessages)
                    }
                    analyzeStats(stats)
                    return resolve()
                })
            })
        }
    }
}
