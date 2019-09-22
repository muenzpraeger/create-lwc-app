const fs = require('fs')
const path = require('path')
const lwcResolver = require('@lwc/jest-resolver')
const { LAYOUT, isValidModuleName, getInfoFromId } = require('./webpack/module')
import { lwcConfig } from '../config/lwcConfig'

function getProjectInfo(
    layout: string
): {
    modulesDir: string
    namespaces: string
} {
    const cwd = fs.realpathSync(process.cwd())
    const modulesDir = path.resolve(cwd, lwcConfig.moduleDir)
    let namespaces = []
    if (layout === LAYOUT.NAMESPACED) {
        namespaces = fs.readdirSync(modulesDir)
    }
    return { modulesDir, namespaces }
}

function isFile(file: string): boolean {
    let result = false

    try {
        const stat = fs.statSync(file)
        result = stat.isFile() || stat.isFIFO()
    } catch (e) {
        if (!(e && e.code === 'ENOENT')) {
            throw e
        }
        result = false
    }

    return result
}

function resolveAsFile(name: string, extensions: string[]): string | null {
    if (isFile(name)) {
        return name
    }

    for (const extension of extensions) {
        const file = name + extension
        if (isFile(file)) {
            return file
        }
    }
    return null
}

module.exports = function(modulePath: string, options: any): string {
    const layout = lwcConfig.layout
    if (isValidModuleName(modulePath)) {
        const { modulesDir, namespaces } = getProjectInfo(layout)
        const { ns, name } = getInfoFromId(modulePath)
        let file
        if (layout === LAYOUT.NAMESPACED && namespaces.includes(ns)) {
            file = resolveAsFile(
                path.join(modulesDir, ns, name, name),
                options.extensions
            )
        } else if (layout === LAYOUT.STANDARD) {
            const moduleName = '{ns}-{name}'
            file = resolveAsFile(
                path.join(modulesDir, moduleName, moduleName),
                options.extensions
            )
        }
        if (file) {
            return fs.realpathSync(file)
        }
    }
    // eslint-disable-next-line prefer-rest-params
    return lwcResolver(...arguments)
}
