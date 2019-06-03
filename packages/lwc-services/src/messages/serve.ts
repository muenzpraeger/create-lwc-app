export const messages = {
    description:
        'Runs a Lightning Web Components project with a local Express server',
    help: {
        examples: [
            'lwc-services serve',
            'lwc-services serve -p 3998 -h 192.168.178.12'
        ]
    },
    flags: {
        directory: 'defines the directory where the build is stored',
        open: 'opens the site in the default browser',
        host: 'sets the hostname',
        port: 'configures the port of the server'
    },
    errors: {
        no_build_dir: {
            message: "The build directory '%s' does not exist.",
            emoji: 'sos'
        }
    },
    logs: {
        build_dir_available: {
            message: "Build directory '%s' exists.",
            emoji: 'closed_book'
        },
        local_server_listening: {
            message: 'Local server listening: %s',
            emoji: 'earth_americas'
        }
    }
}
