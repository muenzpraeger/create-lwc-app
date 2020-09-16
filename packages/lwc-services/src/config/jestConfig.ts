// const jestLwcConfig = require('@lwc/jest-preset')
// import merge = require('deepmerge')
import { resolve } from 'path'

const jestDefaultConfig = {
    preset: '@lwc/jest-preset',
    resolver: resolve(__dirname, '../utils/resolver.js')
}

export const jestConfig = jestDefaultConfig
