const fs = require('fs')
const path = require('path')
const lwcResolver = require('@lwc/jest-resolver')
const { LAYOUT, isValidModuleName, getInfoFromId } = require('./webpack/module')
import { lwcConfig } from '../config/lwcConfig'

module.exports = function(modulePath: string, options: any) {
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
    return lwcResolver.apply(null, arguments)
}
function getProjectInfo(layout: string) {
    const cwd = fs.realpathSync(process.cwd())
    const modulesDir = path.join(cwd + '', 'src', 'modules')
    let namespaces = []
    if (layout === LAYOUT.NAMESPACED) {
        namespaces = fs.readdirSync(modulesDir)
    }
    return { modulesDir, namespaces }
}
function isFile(file: string) {
    let result

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
function resolveAsFile(name: string, extensions: string[]) {
    if (isFile(name)) {
        return name
    }

    for (let extension of extensions) {
        const file = name + extension
        if (isFile(file)) {
            return file
        }
    }
    return null
}
