export const messages = {
    description: 'Creates a new Lightning Web Components project',
    help: {
        examples: [
            'lwc create',
            'lwc create my-app',
            'lwc create my-app -o prettier,yarn'
        ]
    },
    args: {
        name: 'name',
        required: false
    },
    flags: {
        options: 'set project options (yarn|prettier|eslint)'
    }
}
