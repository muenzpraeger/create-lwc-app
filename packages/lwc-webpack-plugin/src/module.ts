import { basename, dirname, relative, resolve, sep } from 'path'

function getConfig(opts: any) {
    if (!opts || !opts.module || typeof opts.module.path !== 'string') {
        throw new TypeError(
            `module.path expects a string value. Received ${opts.module.path}`
        )
    }

    const moduleConfig = {
        ...opts.module
    }

    return { ...opts, module: moduleConfig }
}

function isValidModuleName(id: string) {
    return id.match(/^(\w+\/)(\w+)$/)
}

function getInfoFromPath(file: string, root: string) {
    if (!file.startsWith(root)) {
        let jsFile = file
        if (!file.endsWith('.js')) {
            const split = file.split('.')
            jsFile = split.slice(0, -1).join('.') + '.js'
        }
        const parent = dirname(file).split('/').pop()
        const baseFilename = basename(file).split('.').slice(0, -1).join('.')
        if (parent !== baseFilename) {
            jsFile = resolve(dirname(file), `${parent}.js`)
        }

        throw new Error(`Invalid file  ${file} is not part of ${root}`)
    }

    const rel = relative(root, file)
    const parts = rel.split(sep)
    const end = parts.length - 1;
    return {
        ns: parts[end - 2],
        name: parts[end - 1]
    };
}

module.exports = {
    getConfig,
    isValidModuleName,
    getInfoFromPath
}
