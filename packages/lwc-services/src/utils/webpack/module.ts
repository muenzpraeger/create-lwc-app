const { resolveModulesInDir, resolveModules } = require('@lwc/module-resolver')
import * as path from 'path'

import { lwcConfig } from '../../config/lwcConfig'

let npmmodules: any

lwcConfig.localModulesDirs.forEach(dir => {
    const lookupDir = path.resolve(dir)
    npmmodules = { ...npmmodules, ...resolveModulesInDir(lookupDir) }
})

npmmodules = { ...npmmodules, ...resolveModules() }

const LAYOUT = {
    /**
     * Modules are stored at the root of the module directory with their full qualified name.
     *      modules
     *      └── x-foo
     *          ├── x-foo.html
     *          └── x-foo.js
     */
    STANDARD: 'standard',

    /**
     * Modules are stored in a subdirectory for each namespace.
     *      modules
     *      └── x
     *          └── foo
     *              ├── foo.html
     *              └── foo.js
     */
    NAMESPACED: 'namespaced'
}

function getConfig(opts: any) {
    if (opts.module === null || typeof opts.module.path !== 'string') {
        throw new TypeError(
            `module.path expects a string value. Received ${opts.module.path}`
        )
    }

    const moduleConfig = {
        layout: LAYOUT.STANDARD,
        ...opts.module
    }

    if (
        moduleConfig.layout !== LAYOUT.STANDARD &&
        moduleConfig.layout !== LAYOUT.NAMESPACED
    ) {
        throw new TypeError(
            `module.layout is invalid. Received ${moduleConfig.layout}`
        )
    }

    return { ...opts, module: moduleConfig }
}

function isValidModuleName(id: string) {
    return id.match(/^(\w+\/)(\w+)$/)
}

function getInfoFromId(id: string) {
    const [ns, ...rest] = id.split('/')
    return {
        ns,
        name: rest.join('/')
    }
}

function getInfoFromPath(file: string, config: any) {
    const { path: root, layout } = config.module

    if (!file.startsWith(root)) {
        let jsFile = file
        if (!file.endsWith('.js')) {
            const split = file.split('.')
            jsFile = split.slice(0, -1).join('.') + '.js'
        }
        const parent = path
            .dirname(file)
            .split('/')
            .pop()
        const basename = path
            .basename(file)
            .split('.')
            .slice(0, -1)
            .join('.')
        if (parent !== basename) {
            jsFile = path.resolve(path.dirname(file), `${parent}.js`)
        }

        const npms = Object.keys(npmmodules).map((k: string) => npmmodules[k])
        const e = npms.find(e => e.entry === jsFile)
        if (e) {
            return {
                ns: e.moduleNamespace,
                name: e.moduleName
            }
        }

        throw new Error(`Invalid file path. ${file} is not part of ${root}`)
    }

    const rel = path.relative(root, file)
    const parts = rel.split(path.sep)

    let id = ''
    if (layout === LAYOUT.STANDARD) {
        id = parts[0]
    } else if (layout === LAYOUT.NAMESPACED) {
        id = `${parts[0]}-${parts[1]}`
    }

    return getInfoFromId(id)
}

module.exports = {
    LAYOUT,
    getConfig,
    isValidModuleName,
    getInfoFromId,
    getInfoFromPath,
    npmmodules
}
