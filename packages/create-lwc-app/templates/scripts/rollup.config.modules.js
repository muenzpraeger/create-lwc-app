/* eslint-env node */

const path = require('path');
const replace = require('rollup-plugin-replace');
const lwcCompiler = require('@lwc/rollup-plugin');
const { terser } = require('rollup-plugin-terser');
const compat = require('rollup-plugin-compat');
import resolve from 'rollup-plugin-node-resolve';
// TODO-RW: const { transform } = require('@babel/core');
const env = process.env.NODE_ENV || 'development';

const input = path.resolve(__dirname, '../src/index.<% if(typescript) { %>ts<% } else { %>js<% } %>');
const outputDir = path.resolve(__dirname, '../dist/js');

function rollupConfig({ format, target }) {
    const isCompat = target === 'es5';
    const isProduction = env === 'production';

    return {
        input,
        output: {
            dir: path.join(outputDir, '/modules'),
            entryFileNames: 'entry-[name]-[hash].js',
            format: format
        },
        manualChunks(id) {
            if (id.includes('lwc')) {
                return ['lwc'];
            } else if (id.includes('node_modules')) {
                return ['vendor'];
            }
            return 'common';
        },
        plugins: [
            lwcCompiler({ rootDir: path.join(__dirname, '../src/modules') }),
            resolve({
                modulesOnly: true
            }),
            replace({ 'process.env.NODE_ENV': JSON.stringify(env) }),
            isCompat && compat(),
            isProduction && terser()
        ].filter(Boolean),
        watch: {
            exclude: ['node_modules/**']
        }
    };
}

module.exports = [rollupConfig({ format: 'es', target: 'es2019' })];
