// This configuration represents the default settings of `lwc-services`.
// Place this file into the root of your LWC app directory, and configure the files as needed.
module.exports = {
    // Default directory for the build output
    buildDir: './dist',
    // Default mode for build command
    mode: 'development',
    // Clears the build directory on every build
    noclear: false,
    // Defines the directory where to find the individual
    // modules. Change only when you know what you do. ;-)
    moduleDir: 'src/client/modules',
    // Array of directories where to look for additional
    // modules that don't live in `moduleDir`
    localModulesDirs: ['node_modules'],
    // Defines the directory layout. Using `namespaced` is easiest. Or so.
    layout: 'namespaced',
    // Default directory for source files
    sourceDir: './src/client',
    // List of resources for copying to the build folder
    resources: [{ from: 'src/resources', to: 'dist/resources' }],
    // Default server options for watch command.  See more options at https://webpack.js.org/configuration/dev-server
    devServer: {
        port: 3001,
        host: '0.0.0.0',
        open: false,
        stats: 'errors-only',
        noInfo: true,
        contentBase: './src/client'
        // run a local backend on another port (ex: nodejs) but still use watch command for lwc live re-loading
        // proxy: { '/': 'http://localhost:8443'},
    },
    // Default server options for serve command
    server: {
        port: 3002,
        host: '0.0.0.0',
        open: false,
        customConfig: './src/server/index.js'
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
