import * as path from 'path'

export const jestConfig = {
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
