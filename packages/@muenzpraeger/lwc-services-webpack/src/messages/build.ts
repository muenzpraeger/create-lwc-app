export const messages = {
    description: 'Creates a new webpack build',
    help: {
        examples: [
            'lwc-services build',
            'lwc-services build -d ./public --noclear'
        ]
    },
    flags: {
        mode: 'defines the mode for the build (production|development)',
        destination: 'defines the directory where the build is stored',
        noclear: 'setting this will not re-create the build dir',
        webpack: 'location of custom webpack configuration file'
    },
    errors: {
        no_compilation: {
            message: 'The webpack build could not be compiled.',
            emoji: 'sos'
        },
        no_source_dir: {
            message: "The  directory '%s' does not exist.",
            emoji: 'sos'
        },
        no_webpack: {
            message: 'The custom webpack configuration file does not exist.',
            emoji: 'sos'
        }
    },
    logs: {
        creating_build_configuration: {
            message: 'Creating build configuration',
            emoji: 'hourglass'
        },
        build_start: {
            message: 'Starting build process.',
            emoji: 'package'
        },
        build_end: {
            message: 'Build successfully created.',
            emoji: 'tada'
        },
        clear: {
            message: 'Clearing build directory.',
            emoji: 'hammer'
        },
        custom_configuration: {
            message: 'Using custom configuration from webpack.config.js.',
            emoji: 'star2'
        }
    }
}
