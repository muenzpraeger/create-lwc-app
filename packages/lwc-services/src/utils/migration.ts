import fs = require('fs')
import path = require('path')
import util = require('util')
import { log } from './logger'
import { messages } from '../messages/utils'

const PACKAGE_JSON = path.resolve(process.cwd(), 'package.json')
const LWC_SERVICES_JS = path.resolve(process.cwd(), 'lwc-services.config.js')
const LWC_CONFIG_JSON = path.resolve(process.cwd(), 'lwc.config.json')

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export async function migrateModuleResolution() {
    if (fs.existsSync(LWC_CONFIG_JSON)) {
        const lwcConfigJson = JSON.parse(
            fs.readFileSync(LWC_CONFIG_JSON, 'utf8')
        )
        if (
            lwcConfigJson &&
            lwcConfigJson.modules &&
            lwcConfigJson.modules.length > 0
        ) {
            return
        }
    }

    if (fs.existsSync(PACKAGE_JSON)) {
        const pkgJson = JSON.parse(fs.readFileSync(PACKAGE_JSON, 'utf8'))
        if (
            pkgJson.lwc &&
            pkgJson.lwc.modules &&
            pkgJson.lwc.modules.length > 0
        ) {
            return
        }
    }

    const modules = { modules: [{ dir: 'src/modules' }] }

    if (fs.existsSync(LWC_SERVICES_JS)) {
        const lwcServicesJs = require(LWC_SERVICES_JS)
        if (lwcServicesJs.moduleDir) {
            modules.modules[0].dir = lwcServicesJs.moduleDir
        }
        delete lwcServicesJs.moduleDir
        delete lwcServicesJs.layout
        delete lwcServicesJs.localModuleDirs
        fs.writeFileSync(
            LWC_SERVICES_JS,
            'module.exports = ' + util.inspect(lwcServicesJs, { depth: null })
        )
    }

    fs.writeFileSync(LWC_CONFIG_JSON, JSON.stringify(modules))

    log(messages.logs.migrate_module_resolution)
}
