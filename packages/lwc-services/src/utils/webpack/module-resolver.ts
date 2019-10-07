import * as path from 'path'

const {
    LAYOUT,
    getConfig,
    isValidModuleName,
    getInfoFromId,
    npmmodules
} = require('./module')

const EMPTY_STYLE = path.resolve(__dirname, 'mocks', 'empty-style.js')

const EXTENSIONS = ['.js', '.ts']

function getExtension(
    fileSystem: any,
    directoryPath: string,
    fileName: string
) {
    return EXTENSIONS.find(extension => {
        const pathWithExtension = `${directoryPath}/${fileName}${extension}`
        // TODO: Use async version of state instead of try catch?
        try {
            fileSystem.statSync(pathWithExtension)
            return true
        } catch (e) {
            return false
        }
    })
}

/**
 * Webpack plugin to resolve LWC modules.
 */
module.exports = class ModuleResolver {
    public config: any
    public fs: any

    constructor(config: any) {
        this.config = getConfig(config)
    }

    apply(resolver: any) {
        this.fs = resolver.fileSystem
        resolver.hooks.module.tapAsync(
            'LWC module',
            (req: any, ctx: any, cb: any) => this.resolveModule(req, ctx, cb)
        )
        resolver.hooks.file.tapAsync('LWC CSS', (req: any, ctx: any, cb: any) =>
            this.resolveFile(req, ctx, cb)
        )
    }

    resolveModule(req: any, ctx: any, cb: any) {
        const { path: root, layout } = this.config.module
        const { entries } = this.config
        const {
            request,
            query,
            context: { issuer }
        } = req

        if (request === '@lwc/engine') {
            return cb()
        }

        const mod = npmmodules[request]
        if (mod) {
            return cb(undefined, {
                path: mod.entry,
                query,
                file: true,
                resolved: true
            })
        }

        if (!issuer) {
            return cb()
        }

        let properPath = issuer.startsWith(root)
        if (!properPath) {
            properPath = entries.find((e: string) => issuer.startsWith(e))
        }
        if (!properPath) {
            return cb()
        }

        if (!isValidModuleName(request)) {
            return cb()
        }

        let resolved: string
        if (layout === LAYOUT.STANDARD) {
            // TODO Proper resolve
            const directoryPath = path.resolve(root, request)
            const extension = getExtension(this.fs, directoryPath, name)
            resolved = path.resolve(root, request, `${request}${extension}`)
        } else {
            const { ns, name } = getInfoFromId(request)
            const directoryPath = path.resolve(root, ns, name)
            const extension = getExtension(this.fs, directoryPath, name)
            resolved = path.resolve(root, ns, name, `${name}${extension}`)
        }

        this.fs.stat(resolved, (err: { code: string } | null) => {
            if (err !== null && err.code === 'ENOENT') {
                return cb(`Could not resolve ${request} as ${resolved}`)
            }

            return cb(err, {
                path: resolved,
                query,
                file: true,
                resolved: true
            })
        })
    }

    isImplicitHTMLImport(importee: string, importer: string) {
        return (
            path.extname(importer) === '.js' &&
            path.extname(importee) === '.html' &&
            path.dirname(importer) === path.dirname(importee) &&
            path.basename(importer, '.js') === path.basename(importee, '.html')
        )
    }

    resolveFile(req: any, ctx: any, cb: any) {
        const { path: resourcePath, query } = req
        const extname = path.extname(resourcePath)

        if (extname !== '.css' && extname !== '.html') {
            return cb()
        }

        this.fs.stat(resourcePath, (err: { code: string } | null) => {
            if (err !== null && err.code === 'ENOENT') {
                if (
                    extname === '.css' ||
                    this.isImplicitHTMLImport(resourcePath, req.context.issuer)
                ) {
                    return cb(null, {
                        path: EMPTY_STYLE,
                        query,
                        file: true,
                        resolved: false
                    })
                }
            }

            return cb()
        })
    }
}
