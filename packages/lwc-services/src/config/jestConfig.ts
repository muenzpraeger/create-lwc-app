const jestLwcConfig = require('@lwc/jest-preset')
import merge = require('deepmerge')
import * as path from 'path'

const jestDefaultConfig = {
    rootDir: process.cwd(),
    transformIgnorePatterns: [
        '/node_modules/(?:(?!lightning-mocks.*(js|html|css)))*$'
    ],
    resolver: path.resolve(__dirname, '../utils/resolver.js'),
    testPathIgnorePatterns: [
        '<rootDir>/node_modules/',
        '<rootDir>/test/specs/'
    ],
    collectCoverageFrom: ['src/**/*.js'],
    snapshotSerializers: [require.resolve('@lwc/jest-serializer')]
}

export const jestConfig = merge(jestLwcConfig, jestDefaultConfig)
