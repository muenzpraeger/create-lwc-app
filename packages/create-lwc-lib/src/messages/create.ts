export const messages = {
    description: 'Creates a new Lightning Web Components library',
    help: {
        examples: [
            'create-lwc-lib',
            'npm init lwc-lib my-lib',
            'yarn init lwc-lib my-lib -o prettier,yarn'
        ]
    },
    args: {
        name: 'name',
        required: false
    },
    flags: {
        options: 'set project options (yarn|prettier|eslint|typescript)'
    }
}
