const jestLwcConfig = require('@lwc/jest-preset')
import { resolve } from 'path'

export const jestConfig = {
    ...jestLwcConfig,
    resolver: resolve(__dirname, '../utils/resolver.js')
}
