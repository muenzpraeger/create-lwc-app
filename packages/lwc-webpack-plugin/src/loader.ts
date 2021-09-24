const compiler = require('@lwc/compiler')
const babel = require('@babel/core')
const { getInfoFromPath } = require('./module')
import { getOptions } from 'loader-utils'

module.exports = function (source: any) {
    const { resourcePath } = this
    const { stylesheetConfig, outputConfig, experimentalDynamicComponent } =
        getOptions(this)

    let info
    try {
        info = getInfoFromPath(resourcePath, process.cwd())
    } catch (e) {
        info = {
            name: '',
            namespace: ''
        }
    }

    let codeTransformed = source

    if (resourcePath.endsWith('.ts')) {
        const { code } = babel.transform(source, {
            filename: resourcePath,
            plugins: [
                require.resolve('@babel/plugin-syntax-class-properties'),
                [
                    require.resolve('@babel/plugin-syntax-decorators'),
                    {
                        decoratorsBeforeExport: true
                    }
                ],
                require.resolve('@babel/plugin-proposal-optional-chaining'),
                require.resolve(
                    '@babel/plugin-proposal-nullish-coalescing-operator'
                )
            ],
            presets: [
                [
                    require.resolve('@babel/preset-typescript'),
                    {
                        allowDeclareFields: true
                    }
                ]
            ]
        })
        codeTransformed = code
    }

    const cb = this.async()

    compiler
        .transform(codeTransformed, resourcePath, {
            name: info.name,
            namespace: info.ns,
            stylesheetConfig,
            outputConfig,
            experimentalDynamicComponent,
            scopedStyles: resourcePath.endsWith('.scoped.css')
        })
        .then((res: any) => {
            cb(null, res.code)
        })
        .catch((err: any) => {
            cb(err)
        })

    return
}
