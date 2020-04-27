const fs = require('fs')
const path = require('path')
const lwcResolver = require('@lwc/jest-resolver')
const { isValidModuleName, getInfoFromId } = require('./webpack/module')
import { lwcConfig } from '../config/lwcConfig'

function getProjectInfo(): {
    modulesDir: string
    namespaces: string
} {
    const cwd = fs.realpathSync(process.cwd())
    const modulesDir = path.resolve(cwd, lwcConfig.moduleDir)
    const namespaces = fs.readdirSync(modulesDir)
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

module.exports = function (modulePath: string, options: any): string {
    if (isValidModuleName(modulePath)) {
        const { modulesDir } = getProjectInfo()
        const { ns, name } = getInfoFromId(modulePath)
        const file = resolveAsFile(
            path.join(modulesDir, ns, name, name),
            options.extensions
        )

        if (file) {
            return fs.realpathSync(file)
        }
    }
    // eslint-disable-next-line prefer-rest-params
    return lwcResolver(...arguments)
}
