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

function getInfoFromId(id: string) {
    const [ns, ...rest] = id.split('/')
    return {
        ns,
        name: rest.join('/')
    }
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

    const id = `${parts[2]}-${parts[3]}`

    return getInfoFromId(id)
}

module.exports = {
    getConfig,
    isValidModuleName,
    getInfoFromId,
    getInfoFromPath
}
