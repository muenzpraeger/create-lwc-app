"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jestLwcConfig = require('@lwc/jest-preset');
const merge = require("deepmerge");
const path = require("path");
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
};
exports.jestConfig = merge(jestLwcConfig, jestDefaultConfig);
