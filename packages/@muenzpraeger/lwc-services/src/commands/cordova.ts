import { Command, flags } from '@oclif/command'
import { messages } from '../../messages/test'
import { log, welcome } from '../../utils/logger'

const spawn = require('child_process').spawn

export default class Cordova extends Command {
    static description = messages.description

    static examples = messages.help.examples

    static flags = {
        help: flags.help({ char: 'h' }),
        passthrough: flags.string({
            char: 'p',
            multiple: true,
            description: messages.flags.passthrough
        })
    }

    async run() {
        const { flags } = this.parse(Cordova)

        // eslint-disable-next-line no-console
        console.clear()
        welcome()

        log(messages.logs.starting_cordova)

        // TODO: Figure out Cordova call

        if (flags.debug) {
            // Execute command is different on Windows.
            const jestExecutable =
                process.platform === 'win32'
                    ? './node_modules/jest/bin/jest.js'
                    : './node_modules/.bin/jest'

            const debugArguments: string[] = [
                '--inspect-brk',
                jestExecutable,
                '--runInBand'
            ]

            if (flags.passthrough) {
                flags.passthrough.forEach(arg => debugArguments.push(arg))
            }

            const jestSpawn = spawn('node', debugArguments)

            jestSpawn.on('error', (err: string) => {
                log({ message: `${err}`, emoji: 'sos' })
            })

            // It's super weird that the debug message is passed via stderr. But it is what it is.
            jestSpawn.stderr.on('data', (data: string) => {
                log({ message: `${data}`, emoji: 'rainbow' })
            })
        } else {
            const jestArguments: string[] = []
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
