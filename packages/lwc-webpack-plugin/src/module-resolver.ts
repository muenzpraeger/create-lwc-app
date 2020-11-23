import { basename, dirname, extname, resolve } from 'path'

const lwcResolver = require('@lwc/module-resolver')

const EMPTY_STYLE = resolve(__dirname, 'mocks', 'empty-style.js')

/**
 * Webpack plugin to resolve LWC modules.
 */
export class LwcModuleResolverPlugin {
    public fs: any
    modules: any[]

    constructor(modules: any[]) {
        this.modules = modules
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
        let {
            request,
            // eslint-disable-next-line prefer-const
            query,
            context: { issuer }
        } = req

        try {
            if (!issuer) {
                issuer = process.cwd()
            }

            request = request.replace('./', '')

            let mod

            if (this.modules && this.modules.length) {
                mod = lwcResolver.resolveModule(request, issuer, {
                    modules: this.modules
                })
            } else {
                mod = lwcResolver.resolveModule(request, issuer)
            }

            return cb(undefined, {
                path: mod.entry,
                query,
                file: true,
                resolved: true
            })
        } catch (e) {
            // LWC Module Resolver will throw errors for any non lwc modules
            cb()
        }
    }

    isImplicitHTMLImport(importee: string, importer: string) {
        return (
            extname(importer) === '.js' &&
            extname(importee) === '.html' &&
            dirname(importer) === dirname(importee) &&
            basename(importer, '.js') === basename(importee, '.html')
        )
    }

    resolveFile(req: any, ctx: any, cb: any) {
        const { path: resourcePath, query } = req
        const extFilename = extname(resourcePath)

        if (extFilename !== '.css' && extFilename !== '.html') {
            return cb()
        }

        this.fs.stat(resourcePath, (err: { code: string } | null) => {
            if (err !== null && err.code === 'ENOENT') {
                if (
                    extFilename === '.css' ||
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
