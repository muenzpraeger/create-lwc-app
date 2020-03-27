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
        appType: 'Select the type of app you want to create',
        clientserver: 'Do you want a basic Express API server?',
        bundler: 'Select a bundler',
        typescript: 'Use TypeScript or JavaScript',
        edge: 'Do you want to use Edge (non-Chromium version) as browser'
    }
}
