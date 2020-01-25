export const messages = {
    description: 'Exports configuration information as JS files',
    help: { examples: ['lwc-services sniff -d configstore'] },
    flags: {
        directory: 'exports configuration files to the given directory',
        webpack: 'location of custom webpack configuration file'
    },
    errors: {
        nodirectory: {
            message: 'No directory parameter provided.',
            emoji: 'sos'
        }
    },
    logs: {
        calculating_configurations: {
            message: 'Calculating configurations',
            emoji: 'hourglass'
        },
        custom_configuration: {
            message: 'Using custom configuration from webpack.config.js.',
            emoji: 'star2'
        },
        write_jest_config: {
            message: 'Writing jest.config.js file',
            emoji: 'notebook_with_decorative_cover'
        },
        write_webpack_config: {
            message: 'Writing webpack.config.js file',
            emoji: 'notebook_with_decorative_cover'
        },
        write_lwc_config: {
            message: 'Writing lwc-services.config.js file',
            emoji: 'notebook_with_decorative_cover'
        },
        enjoy: {
            message: 'Have fun inspecting the configurations.',
            emoji: 'confetti_ball'
        }
    }
}
