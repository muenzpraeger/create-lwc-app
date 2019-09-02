import { Command, flags } from '@oclif/command'
import merge = require('deepmerge')
import * as fs from 'fs'
import * as path from 'path'

import { jestConfig } from '../../config/jestConfig'
import { messages } from '../../messages/test'
import { log, welcome } from '../../utils/logger'

const spawn = require('child_process').spawn

export default class Test extends Command {
    static description = messages.description

    static examples = messages.help.examples

    static flags = {
        help: flags.help({ char: 'h' }),
        coverage: flags.boolean({
            char: 'c',
            description: messages.flags.coverage
        }),
        debug: flags.boolean({ char: 'd', description: messages.flags.debug }),
        watch: flags.boolean({ char: 'w', description: messages.flags.watch }),
        runInBand: flags.boolean({
            char: 'r',
            description: messages.flags.runInBand
        }),
        passthrough: flags.string({
            char: 'p',
            multiple: true,
            description: messages.flags.passthrough
        })
    }

    async run() {
        const { flags } = this.parse(Test)

        // eslint-disable-next-line no-console
        console.clear()
        welcome()

        // Inspiration of this implementation taken from https://github.com/salesforce/lwc-jest. Thank you, Trevor!
        let jestFinalConfig = jestConfig

        if (
            !fs.existsSync('jest.config.js') &&
            !fs.existsSync('jest.config.json')
        ) {
            log(messages.logs.default_configuration)
        } else {
            log(messages.logs.custom_configuration)
            // Yay, someone uses a custom configuration.
            if (fs.existsSync('jest.config.js')) {
                const jestCustomConfigJs = require(path.resolve(
                    process.cwd(),
                    'jest.config.js'
                ))
                jestFinalConfig = merge(jestFinalConfig, jestCustomConfigJs)
            }
            if (fs.existsSync('jest.config.json')) {
                const jestCustomConfigJson = require(path.resolve(
                    process.cwd(),
                    'jest.config.json'
                ))
                jestFinalConfig = {
                    ...jestFinalConfig,
                    ...jestCustomConfigJson
                }
            }
        }

        log(messages.logs.starting_jest)

        if (flags.debug) {
            // Execute command is different on Windows.
            const jestExecutable =
                process.platform === 'win32'
                    ? '../../node_modules/jest/bin/jest.js'
                    : '../../node_modules/.bin/jest'

            const debugArguments: string[] = [
                '--inspect-brk',
                jestExecutable,
                '--runInBand'
            ]
            const jestSpawn = spawn('node', debugArguments)

            jestSpawn.on('error', (err: string) => {
                log({ message: `${err}`, emoji: 'sos' })
            })

            // It's super weird that the debug message is passed via stderr. But it is what it is.
            jestSpawn.stderr.on('data', (data: string) => {
                log({ message: `${data}`, emoji: 'rainbow' })
            })
        } else {
            let jestArguments: string[] = []
            if (flags.watch) {
                jestArguments.push('--watchAll')
            }
            if (flags.coverage) {
                jestArguments.push('--coverage')
            }
            if (flags.runInBand) {
                jestArguments.push('--runInBand')
            }
            if (flags.passthrough) {
                flags.passthrough.forEach(arg => jestArguments.push(arg))
            }

            const jest = require('jest')
            jest.run(
                ['--config', JSON.stringify(jestFinalConfig)].concat(
                    jestArguments
                )
            )
        }
    }
}
