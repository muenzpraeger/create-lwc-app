const loaderUtils = require('loader-utils')
const compiler = require('@lwc/compiler')
const babel = require('@babel/core')

import { lwcConfig } from '../../config/lwcConfig'
const stylesheetConfig = lwcConfig.lwcCompilerStylesheetConfig
const experimentalDynamicComponent = lwcConfig.lwcExperimentalDynamicComponent

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

    let compilerOutput: any = {}
    if (
        config.mode === 'development' &&
        lwcConfig.lwcCompilerOutput &&
        lwcConfig.lwcCompilerOutput
    ) {
        compilerOutput = lwcConfig.lwcCompilerOutput.development
    } else if (
        config.mode === 'production' &&
        lwcConfig.lwcCompilerOutput &&
        lwcConfig.lwcCompilerOutput.production
    ) {
        compilerOutput = lwcConfig.lwcCompilerOutput.production
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
            stylesheetConfig,
            experimentalDynamicComponent
        })
        .then((res: any) => {
            cb(null, res.code)
        })
        .catch((err: any) => {
            cb(err)
        })

    return
}
