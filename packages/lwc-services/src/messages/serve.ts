export const messages = {
    description: 'Runs a Lightning Web Components project with a local server',
    help: {
        examples: [
            'lwc-services serve',
            'lwc-services serve -p 3998 -h 192.168.178.12 -m production'
        ]
    },
    flags: {
        directory: 'defines the directory where the build is stored',
        open: 'opens the site in the default browser',
        host: 'sets the hostname',
        port: 'configures the port of the application',
        webpack: 'location of custom webpack configuration file'
    },
    errors: {
        no_build_dir: {
            message: "The build directory '%s' does not exist.",
            emoji: 'sos'
        },
        no_webpack: {
            message: 'The custom webpack configuration file does not exist.',
            emoji: 'sos'
        }
    },
    logs: {
        build_dir_available: {
            message: "Build directory '%s' exists.",
            emoji: 'closed_book'
        },
        custom_configuration: {
            message: 'Using custom configuration from webpack.config.js.',
            emoji: 'star2'
        },
        local_server_listening: {
            message: 'Local server listening: %s',
            emoji: 'earth_americas'
        }
    }
}
