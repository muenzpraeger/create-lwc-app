/* eslint-disable no-prototype-builtins */
import { resolve } from 'path'
import { Compiler } from 'webpack'
import { LwcModuleResolverPlugin } from './module-resolver'
import { readFileSync } from 'fs'
import { existsSync } from 'fs'

interface PluginConfig {
    modules: any[]
}

function transformModuleRecordsToIncludes(modulesConfig: any[]): string[] {
    let modules = []

    const pkgJson = JSON.parse(
        readFileSync(resolve(process.cwd(), 'package.json'), 'utf8')
    )
    if (pkgJson.modules && pkgJson.modules.length) {
        modules = pkgJson.modules
    }

    if (existsSync(resolve(process.cwd(), 'lwc.config.json'))) {
        const lwcConfig = JSON.parse(
            readFileSync(resolve(process.cwd(), 'lwc.config.json'), 'utf8')
        )
        if (lwcConfig.modules && lwcConfig.modules.length) {
            modules = lwcConfig.modules
        }
    }

    if (modulesConfig && modulesConfig.length) {
        modules = modulesConfig
    }

    const records = []
    for (const module of modules) {
        if (module.hasOwnProperty('npm')) {
            records.push(resolve(process.cwd(), 'node_modules', module.npm))
        } else if (module.hasOwnProperty('dir')) {
            records.push(resolve(process.cwd(), module.dir))
        } else if (module.hasOwnProperty('alias')) {
            records.push(resolve(process.cwd(), module.path))
        }
    }

    return records
}

const EXTENSIONS = ['.js', '.ts']

module.exports = class Plugin {
    config: PluginConfig
    constructor(config: PluginConfig) {
        this.config = config
    }
    apply(compiler: Compiler) {
        const { modules = [] } = this.config || {}
        compiler.hooks.environment.tap('lwc-webpack-plugin', () => {
            const resolverPlugin = new LwcModuleResolverPlugin(modules)

            compiler.options.resolve.plugins = [resolverPlugin]
            compiler.options.resolveLoader.plugins = [resolverPlugin]

            let rules = compiler.options.module.rules
            if (rules === undefined) {
                rules = compiler.options.module.rules = []
            }
        })

        let { alias } = compiler.options.resolve
        if (alias === undefined) {
            alias = compiler.options.resolve.alias = {}
        }

        // Specify known package aliases
        alias.lwc = resolve('./node_modules/@lwc/engine')
        alias['wire-service'] = resolve('./node_modules/@lwc/wire-service')

        if (compiler.options.resolve.extensions) {
            compiler.options.resolve.extensions.push(...EXTENSIONS)
        } else {
            compiler.options.resolve.extensions = EXTENSIONS
        }

        compiler.options.module.rules.push({
            test: /\.(js|ts|html|css)$/,
            include: transformModuleRecordsToIncludes(modules),
            use: {
                loader: require.resolve('./loader')
            }
        })
    }
}
