export const messages = {
    description: 'Creates a new Lightning Web Component on project source folder',
    help: {
        examples: [
            'lwc-services create-component -n myComponent',
            'lwc-services create-component -n myComponent -d src/modules',
            'lwc-services create-component -n myComponent -t es6'
        ]
    },
    flags: {
        name: 'defines the component name (camelCase)',
        dir: 'defines the directory where the component source will be created',
        type: 'defines the component type. Valid values are Ligthning Web Component, CSS Module and ES6 module (lwc,css,es6)'
    },
    errors: {
        component_already_exists: {
            message: 'The component %s already exists on this project.',
            emoji: 'sos'
        },
        invalid_name: {
            message: "The  component name '%s' is not valid.",
            emoji: 'sos'
        },
        no_source_dir: {
            message: "The  directory '%s' does not exist.",
            emoji: 'sos'
        }
    },
    logs: {
        build_start: {
            message: 'Creating component %s.',
            emoji: 'zap'
        },
        build_end: {
            message: 'Component successfully created.',
            emoji: 'tada'
        }
    }
}
