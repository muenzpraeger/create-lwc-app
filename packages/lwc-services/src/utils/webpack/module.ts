import * as path from 'path'

function getConfig(opts: any) {
    if (opts.module === null || typeof opts.module.path !== 'string') {
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

function getInfoFromPath(file: string, config: any) {
    const { path: root } = config.module

    if (!file.startsWith(root)) {
        let jsFile = file
        if (!file.endsWith('.js')) {
            const split = file.split('.')
            jsFile = split.slice(0, -1).join('.') + '.js'
        }
        const parent = path.dirname(file).split('/').pop()
        const basename = path.basename(file).split('.').slice(0, -1).join('.')
        if (parent !== basename) {
            jsFile = path.resolve(path.dirname(file), `${parent}.js`)
        }

        throw new Error(`Invalid file path. ${file} is not part of ${root}`)
    }

    const rel = path.relative(root, file)
    const parts = rel.split(path.sep)

    const id = `${parts[0]}-${parts[1]}`

    return getInfoFromId(id)
}

module.exports = {
    getConfig,
    isValidModuleName,
    getInfoFromId,
    getInfoFromPath
}
