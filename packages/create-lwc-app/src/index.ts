import { Command, flags } from '@oclif/command'
import { createEnv } from 'yeoman-environment'
import { spawnSync } from 'child_process'
import semverCompare = require('semver-compare')

import { messages } from './messages/create'
import { log, welcome } from './utils/logger'

const APP_TYPES = ['standard', 'pwa', 'electron']

const OPTIONS = ['yarn', 'typescript', 'edge', 'rollup', 'express']

class Create extends Command {
    static description = messages.description

    static examples = messages.help.examples

    static flags = {
        help: flags.help({ char: 'h' }),
        options: flags.string({
            char: 'o',
            description: messages.flags.options
        }),
        yes: flags.boolean({
            char: 'y',
            description: messages.flags.silent
        }),
        type: flags.string({ char: 't', description: messages.flags.type })
    }

    static args = [{ name: messages.args.name }]

    async run() {
        const { flags, args } = this.parse(Create)

        const name = args.name ? args.name : ''
        const options = flags.options ? flags.options.split(',') : []
        const silent = flags.yes
        const types = flags.type ? flags.type.split(',') : ['standard']

        const nonCompliantAppTypes: string[] = []
        const nonCompliantOptions: string[] = []

        const nodeVersionRet = spawnSync('node', ['-v'])
        if (nodeVersionRet.error || nodeVersionRet.status !== 0) {
            log(messages.errors.no_node_installed)
            return
        }

        if (!silent && options.length > 0) {
            log(messages.errors.no_silent_with_options)
            return
        }

        types.forEach((entry) => {
            if (APP_TYPES.indexOf(entry) < 0) {
                nonCompliantAppTypes.push(entry)
            }
        })

        const type = types[0]

        if (nonCompliantAppTypes.length > 0) {
            log(
                messages.errors.noncompliant_app_types,
                nonCompliantAppTypes.join(',')
            )
            return -1
        }

        options.forEach((entry) => {
            if (OPTIONS.indexOf(entry) < 0) nonCompliantOptions.push(entry)
        })

        if (nonCompliantOptions.length > 0) {
            log(
                messages.errors.noncompliant_options,
                nonCompliantOptions.join(',')
            )
            return -1
        }

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
                {
                    options: options,
                    name: name,
                    silent: silent,
                    type: type
                },
                (err: null | Error) => {
                    if (err) reject(err)
                    else resolve(true)
                }
            )
        })
    }
}

export = Create
