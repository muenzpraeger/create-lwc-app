/* eslint-disable no-prototype-builtins */
import { resolve } from 'path'
import { Compiler } from 'webpack'
import { LwcModuleResolverPlugin } from './module-resolver'
import { readFileSync } from 'fs'
import { existsSync } from 'fs'
import noderesolve from 'resolve'

interface PluginConfig {
    modules: any[]
}

const PACKAGEJSON = 'package.json'

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
            try {
                let resolved = noderesolve.sync(module.npm, {
                    /* Use packageFilter in order to be able to 'resolve' packages
                     * that may incorrectly not-specify the 'main' property, which is
                     * required for a node module to be correctly detected.
                     */
                    packageFilter: (pkg) => {
                        if (!pkg.main) {
                            // If the 'main' property doesn't exist, set it to something
                            // that always exists: the file package.json
                            pkg.main = PACKAGEJSON
                        }
                        return pkg
                    }
                })
                if (resolved.endsWith(PACKAGEJSON)) {
                    // if we notice we're resolving to the package.json file,
                    // strip that off
                    resolved = resolved.slice(0, -PACKAGEJSON.length)
                }
                records.push(resolved)
            } catch (ignore) {
                // log errors
                console.log(ignore)
            }
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
        alias.lwc = require.resolve('@lwc/engine')
        alias['wire-service'] = require.resolve('@lwc/wire-service')
        // the 'main' property for @lwc/synthetic-shadow refers to a file that
        // simply logs an error message. This needs to be fixed up to directly
        // specify the actual implementation, which lives under
        // /dist/synthetic-shadow.js. Note: this depends on the internal file
        // structure of this component, and there is a little fragile, if the
        // module ever changes where this implementation lives.
        alias['@lwc/synthetic-shadow'] = require.resolve(
            '@lwc/synthetic-shadow/dist/synthetic-shadow.js'
        )

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
