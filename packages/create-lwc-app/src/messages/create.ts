export const messages = {
    description: 'Creates a new Lightning Web Components project',
    help: {
        examples: [
            'create-lwc-app',
            'npm init lwc-app my-app',
            'npm init lwc-app my-app --type standard',
            'yarn init lwc-app my-app -o prettier,yarn'
        ]
    },
    args: {
        name: 'name',
        required: false
    },
    flags: {
        silent:
            'runs a silent installation (with defaults/with provided options)',
        options: 'set project options (yarn|prettier|eslint|typescript)' // TODO-RW: Re-work
    }
}
