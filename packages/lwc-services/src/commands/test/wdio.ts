import { Command, flags } from '@oclif/command'
import * as path from 'path'

import { messages } from '../../messages/wdio'
import { log, welcome } from '../../utils/logger'

const spawn = require('child_process').spawn

export default class Wdio extends Command {
    static description = messages.description

    static examples = messages.help.examples

    static flags = {
        help: flags.help({ char: 'h' })
    }

    async run() {
        // eslint-disable-next-line no-console
        console.clear()
        welcome()

        log(messages.logs.starting_wdio)

        const wdioExecutable = path.resolve(
            'node_modules/@wdio/cli/bin/wdio.js'
        )
        const wdioSpawn = spawn('node', [wdioExecutable])

        wdioSpawn.on('error', (err: string) => {
            log({ message: `${err}`, emoji: 'sos' })
        })

        // It's super weird that the debug message is passed via stderr. But it is what it is.
        wdioSpawn.stderr.on('data', (data: string) => {
            log({ message: `${data}`, emoji: 'rainbow' })
        })
    }
}
