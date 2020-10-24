const lwcJestResolver = require('@lwc/jest-resolver')
const lwcModuleResolver = require('@lwc/module-resolver')

// eslint-disable-next-line @typescript-eslint/no-unused-vars
module.exports = function (modulePath: string, options: any): string {
    try {
        const mod = lwcModuleResolver.resolveModule(modulePath, process.cwd())
        return mod.entry
    } catch (e) {
        // do nothing
    }
    // eslint-disable-next-line prefer-rest-params
    return lwcJestResolver(...arguments)
}
