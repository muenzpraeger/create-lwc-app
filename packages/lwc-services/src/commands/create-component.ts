import { Command, flags } from '@oclif/command'
import { existsSync, mkdirSync, writeFileSync } from 'fs'

import { lwcConfig } from '../config/lwcConfig'
import { messages } from '../messages/create-component'
import { log } from '../utils/logger'

class ComponentName {
    private namespace : string = ''
    private nameTokens : string[] = []

    constructor(name : string) {
        let tokens = name.replace( /([A-Z])/, "_$1" ).split('_')
        
        this.namespace = <string> tokens.splice(0, 1)[0];

        tokens[0] = tokens[0].charAt(0).toLowerCase() + tokens[0].slice(1)
        this.nameTokens = tokens
    }

    getNamespace() {
        return this.namespace
    }

    getName() {
        return `${this.nameTokens.join()}`;
    }

    getClassName() {
        let name = this.getName();

        return name.charAt(0).toUpperCase() + name.slice(1)
    }

    getPath() {
        return `${this.namespace}/${this.nameTokens.join()}`
    }
}

export default class CreateComponent extends Command {
    static description = messages.description

    static examples = messages.help.examples

    static flags = {
        help: flags.help({ char: 'h' }),
        name: flags.string({
            description: messages.flags.name,
            required: true
        }),
        dir: flags.string({
            char: 'd',
            description: messages.flags.dir,
            default: lwcConfig.sourceDir
        }),
        type: flags.string({
            char: 't',
            description: messages.flags.type,
            default: 'lwc'
        })
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async run() {
        const { flags } = this.parse(CreateComponent)

        // eslint-disable-next-line no-console
        console.clear()
        
        log(messages.logs.build_start, flags.name)


        // Check if given source directory exists. If not we're exiting.
        if (!existsSync(flags.dir)) {
            log(messages.errors.no_source_dir, flags.dir)
            return
        }

        if(!this.validateName(flags.name)) {
            log(messages.errors.invalid_name, flags.name)
            return
        }

        let componentName = new ComponentName(flags.name)
        let componentDir = `${flags.dir}/${componentName.getPath()}`

        if (existsSync(componentDir)) {
            log(messages.errors.component_already_exists, componentName.getPath())
            return
        }

        mkdirSync(componentDir, { recursive: true })

        switch(flags.type) {
            case 'css':
                writeFileSync(`${componentDir}/${componentName.getName()}.css`, '')
                break;
            case 'es6':
                writeFileSync(`${componentDir}/${componentName.getName()}.js`, `export class ${componentName.getName()} {}`)
                break;
            default:
                writeFileSync(`${componentDir}/${componentName.getName()}.js`, `import { LightningElement } from 'lwc'\n\nexport default class ${componentName.getClassName()} extends LightningElement {}`)
                writeFileSync(`${componentDir}/${componentName.getName()}.css`, '')
                writeFileSync(`${componentDir}/${componentName.getName()}.html`, '<template>\n</template>')
        }

        log(messages.logs.build_end)
    }

    validateName(name : string) {
        return name.length > 4 && name.match(/[A-Za-z0-9]/g) && name.charAt(0).match(/[a-z]/) && name.match(/([A-Z])/g);
    }
}
