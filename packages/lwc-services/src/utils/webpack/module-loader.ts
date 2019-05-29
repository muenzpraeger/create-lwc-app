const loaderUtils = require('loader-utils')
const compiler = require('@lwc/compiler')

import { lwcConfig } from '../../config/lwcConfig'
const productionConfig = lwcConfig.lwcCompilerOutput.production

const __PROD__ = process.env.NODE_ENV === 'production'

const { getConfig, getInfoFromPath } = require('./module')

module.exports = function(source: any) {
    // @ts-ignore
    // tslint:disable-next-line: no-this-assignment
    const { resourcePath } = this

    const config = getConfig(loaderUtils.getOptions(this))
    let info
    try {
        info = getInfoFromPath(resourcePath, config)
        // tslint:disable-next-line: no-unused
    } catch (e) {
        info = {
            name: '',
            namespace: ''
        }
    }

    const compilerOutput = __PROD__ ? productionConfig : {}

    // @ts-ignore
    const cb = this.async()

    compiler
        .transform(source, resourcePath, {
            name: info.name,
            namespace: info.ns,
            outputConfig: compilerOutput
        })
        .then((res: any) => {
            cb(null, res.code)
        })
        .catch((err: any) => {
            cb(err)
        })

    return
}
