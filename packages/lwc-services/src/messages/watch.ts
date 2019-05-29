export const messages = {
    description: 'Runs a Lightning Web Components project in watch mode',
    help: {
        examples: [
            'lwc-services serve',
            'lwc-services serve -p 3998 -h 192.168.178.12 -m production'
        ]
    },
    errors: {
        no_compilation: {
            message: 'The webpack build could not be compiled.',
            emoji: 'sos'
        },
        no_webpack: {
            message: 'The custom webpack configuration file does not exist.',
            emoji: 'sos'
        }
    },
    flags: {
        open: 'opens the site in the default browser',
        mode: 'defines the mode for the build (production|development)',
        host: 'sets the hostname',
        port: 'configures the port of the application',
        webpack: 'location of custom webpack configuration file'
    },
    logs: {
        build_start: {
            message: 'Starting build process.',
            emoji: 'package'
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
