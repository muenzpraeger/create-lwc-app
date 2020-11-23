const compiler = require('@lwc/compiler')
const babel = require('@babel/core')
const { getInfoFromPath } = require('./module')

module.exports = function (source: any) {
    const { resourcePath } = this

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
                ]
            ],
            presets: [require.resolve('@babel/preset-typescript')]
        })
        codeTransformed = code
    }

    const cb = this.async()

    compiler
        .transform(codeTransformed, resourcePath, {
            name: info.ns,
            namespace: 'my'
        })
        .then((res: any) => {
            cb(null, res.code)
        })
        .catch((err: any) => {
            cb(err)
        })

    return
}
