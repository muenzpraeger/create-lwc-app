export const messages = {
    description: 'Creates a new Lightning Web Components project',
    help: {
        examples: [
            'create-lwc-app',
            'npm init lwc-app my-app',
            'npm init lwc-app my-app --type standard --silent',
            'yarn init lwc-app my-app -o yarn,typescript'
        ]
    },
    errors: {
        no_silent_with_options: {
            message: 'You can only set options in silent installation mode.',
            emoji: 'sos'
        },
        noncompliant_app_types: {
            message: 'You used invalid app types: %s',
            emoji: 'sos'
        },
        noncompliant_options: {
            message: 'You used invalid options: %s',
            emoji: 'sos'
        },
        no_mix_app_types: {
            message: "You can't mix different app types: %s",
            emoji: 'sos'
        }
    },
    args: {
        name: 'name',
        required: false
    },
    flags: {
        silent:
            'runs a silent installation (with defaults/with provided options)',
        type: 'specificy the project type (standard|pwa)',
        options:
            'set silent installation options, comma-separated (yarn|typescript|edge|rollup|express)'
    }
}
