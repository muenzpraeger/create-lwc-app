export const messages = {
    description: 'Creates a new Lightning Web Components project',
    help: {
        examples: [
            'create-lwc-app',
            'npm init lwc-app my-app',
            'npm init lwc-app my-lib --lib',
            'yarn init lwc-app my-app -o prettier,yarn'
        ]
    },
    args: {
        name: 'name',
        required: false
    },
    flags: {
        lib: 'creates a library project',
        options: 'set project options (yarn|prettier|eslint|typescript)'
    }
}
