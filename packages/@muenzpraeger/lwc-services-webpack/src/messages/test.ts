export const messages = {
    description: 'Runs Jest tests for Lightning Web Components',
    help: {
        examples: [
            'lwc-services test',
            'lwc-services test --coverage',
            'lwc-services test -w',
            'lwc-services test -p --updateSnapshot'
        ]
    },
    flags: {
        coverage: 'collects a coverage report',
        watch: 'runs in watch mode and re-runs tests on file changes',
        debug:
            'runs tests in debug mode (https://jestjs.io/docs/en/troubleshooting)',
        runInBand:
            'runs tests serially (slower, but often needed when running on CI systems)',
        passthrough:
            'subsequent command line args are passed through (https://jestjs.io/docs/en/cli)'
    },
    logs: {
        default_configuration: {
            message: 'Using default configuration.',
            emoji: 'santa'
        },
        custom_configuration: {
            message: 'Using custom configuration from jest.config.js.',
            emoji: 'star2'
        },
        starting_jest: {
            message: 'Starting Jest',
            emoji: 'stars'
        }
    }
}
