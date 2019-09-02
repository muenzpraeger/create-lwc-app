import { Command, flags } from '@oclif/command'

import { messages } from '../../messages/wdio'
import { log, welcome } from '../../utils/logger'

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

        const wdio = require('@wdio/cli')
        wdio.run('wdio.conf.js')
    }
}
