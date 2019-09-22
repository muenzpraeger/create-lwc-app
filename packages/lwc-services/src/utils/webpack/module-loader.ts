const loaderUtils = require('loader-utils')
const compiler = require('@lwc/compiler')
const babel = require('@babel/core')

import { lwcConfig } from '../../config/lwcConfig'
const productionConfig = lwcConfig.lwcCompilerOutput.production
const stylesheetConfig = lwcConfig.lwcCompilerStylesheetConfig

const __PROD__ = process.env.NODE_ENV === 'production'

const { getConfig, getInfoFromPath } = require('./module')

module.exports = function(source: any) {
    // @ts-ignore
    const { resourcePath } = this

    const config = getConfig(loaderUtils.getOptions(this))
    let info
    try {
        info = getInfoFromPath(resourcePath, config)
    } catch (e) {
        info = {
            name: '',
            namespace: ''
        }
    }

    const compilerOutput = config.mode ? productionConfig : {}

    let codeTransformed = source

    if (resourcePath.endsWith('.ts')) {
        let { code } = babel.transform(source, {
            filename: resourcePath,
            plugins: [
                require.resolve('@babel/plugin-syntax-class-properties'),
                [
                    require.resolve('@babel/plugin-syntax-decorators'),
                    {
                        decoratorsBeforeExport: true
                    }
                ]
            ],
            presets: [require.resolve('@babel/preset-typescript')]
        })
        codeTransformed = code
    }

    // @ts-ignore
    const cb = this.async()

    compiler
        .transform(codeTransformed, resourcePath, {
            name: info.name,
            namespace: info.ns,
            outputConfig: compilerOutput,
            stylesheetConfig
        })
        .then((res: any) => {
            cb(null, res.code)
        })
        .catch((err: any) => {
            cb(err)
        })

    return
}
