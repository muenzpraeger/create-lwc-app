export const messages = {
    logs: {
        project_support: {
            message:
                '---------------------------------------------------------------------\nFor feature requests, bug reports, or your own contributions visit:\nhttps://github.com/muenzpraeger/create-lwc-app\n\nOr follow @muenzpraeger on Twitter.\n---------------------------------------------------------------------\n',
            emoji: ''
        },
        project_created: {
            message:
                'Created %s in %s. Checkout the `scripts` section of your `package.json` to get started.',
            emoji: 'tada'
        }
    },
    questions: {
        name: 'Package name for npm',
        description: 'Description',
        author: 'Author',
        version: 'Version',
        license: 'License',
        githubUser:
            'Who is the GitHub owner of the repository (https://github.com/OWNER/repo)',
        githubRepo:
            'What is the GitHub name of the repository (https://github.com/owner/REPO)',
        pkg: 'Select a package manager',
        eslint: 'Use ESlint',
        prettier: 'Use Prettier (formatting)',
        clientserver: 'Use custom Express server configuration',
        typescript: 'Use TypeScript or JavaScript',
        edge: 'Do you want to use Edge as browser'
    },
    errors: {
        no_node_installed: {
            message: 'Node.js is not installed',
            emoji: 'sos'
        },
        wrong_node_version_installed: {
            message: 'Node.js version 10 and higher needs to be installed.',
            emoji: 'sos'
        }
    }
}
