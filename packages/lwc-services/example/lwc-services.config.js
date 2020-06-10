// This configuration represents the default settings of `lwc-services`.
// Place this file into the root of your LWC app directory, and configure the files as needed.
module.exports = {
    // Default directory for the build output
    buildDir: './dist',
    // Default bundler
    bundler: 'webpack',
    // Default mode for build command
    mode: 'development',
    // Clears the build directory on every build
    noclear: false,
    // Default directory for source files
    sourceDir: './src/client',
    // List of resources for copying to the build folder
    resources: [{ from: 'src/resources', to: 'dist/resources' }],
    // Default webpack server options for watch command
    devServer: {
        port: 3001,
        host: 'localhost',
        open: false,
        stats: 'errors-only',
        noInfo: true,
        contentBase: './src/client'
    },
    // Default server options for serve command
    server: {
        port: 3002,
        host: 'localhost',
        open: false,
        customConfig: './src/server/api.js'
    },
    // LWC Compiler options for production mode.
    // Find the detailed description here: https://www.npmjs.com/package/@lwc/compiler
    lwcCompilerOutput: {
        production: {
            compat: false,
            minify: true,
            env: {
                NODE_ENV: 'production'
            }
        }
    }
}
