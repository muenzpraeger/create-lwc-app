import { Command, flags } from '@oclif/command'
import { existsSync } from 'fs'
import { resolve } from 'path'
import * as rimraf from 'rimraf'
import { merge, mergeWithCustomize, unique } from 'webpack-merge'

import { lwcConfig } from '../config/lwcConfig'
import { generateWebpackConfig } from '../config/webpack.config'
import { messages } from '../messages/build'
import { log, welcome } from '../utils/logger'
import { analyzeStats } from '../utils/webpack/statsAnalyzer'
import { migrateModuleResolution } from '../utils/migration'
const spawn = require('child_process').spawn

const rollupConfig = resolve(__dirname, '../config/rollup.config.js')

function buildWebpack(webpackConfig: any) {
    const webpack = require('webpack')

    return new Promise((resolve, reject): void => {
        webpack(webpackConfig, (err: any, stats: any): void => {
            if (err) {
                return reject(err)
            }
            if (!stats || !stats.compilation) {
                return reject(messages.errors.no_compilation)
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
            return resolve(true)
        })
    })
}

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
        }),
        'webpack-plugin-overrides': flags.string({
            char: 'p',
            description: messages.flags['webpack-plugin-overrides']
        }),
        bundler: flags.string({
            char: 'b',
            description: messages.flags.bundler,
            default: lwcConfig.bundler
        })
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async run() {
        const { flags } = this.parse(Build)

        // eslint-disable-next-line no-console
        console.clear()
        welcome()

        // For now we use SOURCE_DIR_DEFAULT, may become a dedicated input parameter at a later point in time
        const SOURCE_DIR = lwcConfig.sourceDir

        // Defining the destination directory
        const BUILD_DIR = lwcConfig.buildDir

        // Check if given source directory exists. If not we're exiting.
        if (!existsSync(SOURCE_DIR)) {
            log(messages.errors.no_source_dir, SOURCE_DIR)
            return
        }

        // Clearing build directory, if the user didn't override.
        if (!flags.noclear) {
            if (existsSync(BUILD_DIR)) {
                rimraf.sync(BUILD_DIR)
                log(messages.logs.clear)
            }
        }

        await migrateModuleResolution()

        if (flags.bundler === 'webpack') {
            // Check if custom webpack config is passed, and if it really exists.
            if (flags.webpack) {
                if (!existsSync(flags.webpack)) {
                    log(messages.errors.no_webpack)
                    return
                }
            }

            log(messages.logs.creating_build_configuration)

            let webpackConfigCustom: any

            let webpackConfig = generateWebpackConfig(
                flags.mode,
                webpackConfigCustom
            )

            if (flags.webpack) {
                log(messages.logs.custom_configuration)
                webpackConfigCustom = require(resolve(
                    process.cwd(),
                    flags.webpack
                ))

                let mergeFunction;
                if (flags['webpack-plugin-overrides']) {
                    mergeFunction = mergeWithCustomize({
                        customizeArray: unique(
                            "plugins",
                            flags['webpack-plugin-overrides'].split(','),
                            (plugin) => plugin.constructor && plugin.constructor.name
                        ),
                    });
                } else {
                    mergeFunction = merge;
                }

                webpackConfig = mergeFunction(webpackConfig, webpackConfigCustom)
            }

            log(messages.logs.build_start)

            if (flags.mode && flags.mode !== lwcConfig.mode) {
                webpackConfig.mode = flags.mode
            }

            if (flags.destination && flags.destination !== lwcConfig.buildDir) {
                webpackConfig.output.path = resolve(
                    process.cwd(),
                    flags.destination
                )
            }

            try {
                await buildWebpack(webpackConfig)
                log(messages.logs.build_end)
            } catch (error) {
                log({ message: error, emoji: 'sos' })
                process.exit(1)
            }
        } else {
            // This looks super wonky... and it may be super wonky. ;-)
            const args = [
                './node_modules/rollup/dist/bin/rollup',
                '-c',
                rollupConfig,
                '--environment',
                'NODE_ENV:' + flags.mode
            ]
            const rollupSpawn = spawn('node', args)

            rollupSpawn.on('error', (err: string) => {
                log({ message: `${err}`, emoji: 'sos' })
            })

            // It's super weird that the debug message is passed via stderr. But it is what it is.
            rollupSpawn.stderr.on('data', (data: string) => {
                log({ message: `${data}`, emoji: 'rainbow' })
            })
        }
    }
}
