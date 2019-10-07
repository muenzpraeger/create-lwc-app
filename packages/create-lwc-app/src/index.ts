import { Command, flags } from '@oclif/command'
import { createEnv } from 'yeoman-environment'

import { messages } from './messages/create'
import { welcome } from './utils/logger'

class Create extends Command {
    static description = messages.description

    static examples = messages.help.examples

    static flags = {
        help: flags.help({ char: 'h' }),
        lib: flags.boolean({
            char: 'l',
            description: messages.flags.lib,
            default: false
        }),
        options: flags.string({
            char: 'o',
            description: messages.flags.options
        })
    }

    static args = [{ name: messages.args.name }]

    async run() {
        const { flags, args } = this.parse(Create)

        const options = flags.options ? flags.options.split(',') : []
        const name = args.name ? args.name : ''
        const lib = flags.lib

        const env = createEnv()

        env.register(
            require.resolve('./generators/createGenerator'),
            'CreateGenerator'
        )

        console.clear()
        welcome()

        await new Promise((resolve, reject) => {
            env.run(
                'CreateGenerator',
                { options: options, name: name, lib: lib },
                (err: null | Error) => {
                    if (err) reject(err)
                    else resolve()
                }
            )
        })
    }
}

export = Create
