// tslint:disable no-floating-promises
// tslint:disable no-console

import { execSync, spawnSync } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'
import semverCompare = require('semver-compare')
import * as Generator from 'yeoman-generator'

import { messages } from '../messages/createGenerator'
import { log } from '../utils/logger'

const sortPjson = require('sort-pjson')
const debug = require('debug')('generator-oclif')

let hasYarn = false
try {
    execSync('yarn -v', { stdio: 'ignore' })
    hasYarn = true
} catch {}

class CreateGenerator extends Generator {
    options: {
        defaults?: boolean
        yarn: boolean
    }
    name: string
    args!: { [k: string]: string }
    pjson: any
    githubUser: string | undefined
    answers!: {
        name: string
        description: string
        version: string
        github: { repo: string; user: string }
        author: string
        files: string
        license: string
        pkg: string
    }
    yarn!: boolean
    repository?: string

    constructor(args: any, opts: any) {
        super(args, opts)
        this.options = {
            defaults: opts.defaults,
            yarn: opts.options.includes('yarn') || hasYarn
        }
        this.name = opts.name
    }

    async prompting() {
        this.githubUser = await this.user.github.username().catch(debug)
        this.pjson = {
            scripts: {},
            engines: {},
            devDependencies: {},
            dependencies: {}
        }
        let repository = process
            .cwd()
            .split(path.sep)
            .slice(-1)
            .join('/')
        if (this.githubUser)
            repository = `${this.githubUser}/${repository.split('/')[1]}`
        const defaults = {
            name: this.determineAppname().replace(/ /g, '-'),
            version: '0.0.0',
            license: 'MIT',
            author: this.githubUser
                ? `${this.user.git.name()} @${this.githubUser}`
                : this.user.git.name(),
            dependencies: {},
            repository,
            ...this.pjson,
            engines: {
                node: '>=10.0.0',
                ...this.pjson.engines
            },
            options: this.options
        }
        this.repository = defaults.repository
        if (this.repository && (this.repository as any).url) {
            this.repository = (this.repository as any).url
        }
        if (this.options.defaults) {
            this.answers = defaults
        } else {
            let questions: any = [
                {
                    type: 'input',
                    name: 'name',
                    message: messages.questions.name,
                    default: this.name !== '' ? this.name : defaults.name
                },
                {
                    type: 'input',
                    name: 'description',
                    message: messages.questions.description,
                    default: defaults.description
                },
                {
                    type: 'input',
                    name: 'author',
                    message: messages.questions.author,
                    default: defaults.author
                },
                {
                    type: 'input',
                    name: 'version',
                    message: messages.questions.version,
                    default: defaults.version
                },
                {
                    type: 'input',
                    name: 'license',
                    message: messages.questions.license,
                    default: defaults.license
                },
                {
                    type: 'input',
                    name: 'github.user',
                    message: messages.questions.githubUser,
                    default: repository
                        .split('/')
                        .slice(0, -1)
                        .pop(),
                    when: !this.pjson.repository
                },
                {
                    type: 'input',
                    name: 'github.repo',
                    message: messages.questions.githubRepo,
                    default: (answers: any) =>
                        (
                            this.pjson.repository ||
                            answers.name ||
                            this.pjson.name
                        )
                            .split('/')
                            .pop(),
                    when: !this.pjson.repository
                },
                {
                    type: 'list',
                    name: 'pkg',
                    message: messages.questions.pkg,
                    choices: [
                        { name: 'npm', value: 'npm' },
                        { name: 'yarn', value: 'yarn' }
                    ],
                    default: () => (this.options.yarn || hasYarn ? 1 : 0)
                }
            ]
            this.answers = (await this.prompt(questions)) as any
        }
        debug(this.answers)
        if (!this.options.defaults) {
            this.options = {
                yarn: this.answers.pkg === 'yarn'
            }
        }
        this.yarn = this.options.yarn

        if (!this.yarn) {
            const nodeVersionRet = spawnSync('node', ['-v'])
            if (nodeVersionRet.error || nodeVersionRet.status !== 0) {
                log(messages.errors.no_node_installed)
                return
            }

            const nodeVersion = nodeVersionRet.stdout.slice(1).toString()
            if (semverCompare(nodeVersion, '10.0.0') < 0) {
                log(messages.errors.wrong_node_version_installed)
                return
            }
        }

        this.pjson.name = this.answers.name || defaults.name
        this.pjson.description =
            this.answers.description || defaults.description
        this.pjson.version = this.answers.version || defaults.version
        this.pjson.engines.node = defaults.engines.node
        this.pjson.author = this.answers.author || defaults.author
        this.pjson.license = this.answers.license || defaults.license
        this.repository = this.pjson.repository = this.answers.github
            ? `${this.answers.github.user}/${this.answers.github.repo}`
            : defaults.repository
        this.pjson.dependencies = { 'lwc-services': '^1' }
        this.pjson.scripts.lint = 'eslint ./src/**/*.js'
        this.pjson.scripts.prettier =
            "prettier --write '**/*.{css,html,js,json,md,yaml,yml}'"
        this.pjson.scripts['prettier:verify'] =
            "prettier --list-different '**/*.{css,html,js,json,md,yaml,yml}'"
        this.pjson.scripts.build = 'lwc-services build'
        this.pjson.scripts.watch = 'lwc-services watch'
        this.pjson.scripts.serve = 'lwc-services build && lwc-services serve'
        this.pjson.scripts['test:unit'] = 'lwc-services test'
        this.pjson.scripts['test:unit:watch'] = 'lwc-services test --watch'
        this.pjson.scripts['test:unit:debug'] = 'lwc-services test --debug'
        this.pjson.scripts['test:unit:coverage'] =
            'lwc-services test --coverage'

        this.pjson.husky = { hooks: {} }
        this.pjson['lint-staged'] = {}
        this.pjson.husky.hooks['pre-push'] = 'lint-staged'

        this.pjson['lint-staged']['**/*.{css,html,js,json,md,yaml,yml}'] = [
            'prettier --write'
        ]

        this.pjson['lint-staged']['**/modules/**'] = ['eslint']

        this.pjson['lint-staged']['*'] = ['git add']

        this.pjson.keywords = defaults.keywords || ['lwc']
        this.pjson.homepage =
            defaults.homepage || `https://github.com/${this.pjson.repository}`
        this.pjson.bugs =
            defaults.bugs ||
            `https://github.com/${this.pjson.repository}/issues`
        const targetPath: string = path.resolve(this.pjson.name)
        if (!fs.existsSync(targetPath)) {
            fs.mkdirSync(targetPath)
        }
        this.destinationRoot(targetPath)
        process.chdir(this.destinationRoot())
    }

    writing() {
        this.sourceRoot(path.join(__dirname, '../../templates'))

        this.fs.writeJSON(
            this.destinationPath('./package.json'),
            sortPjson(this.pjson),
            undefined,
            4
        )

        this.fs.copyTpl(
            this.templatePath('eslintrc.json'),
            this.destinationPath('.eslintrc.json'),
            this
        )

        this.fs.copyTpl(
            this.templatePath('prettierignore'),
            this.destinationPath('.prettierignore'),
            this
        )
        this.fs.copyTpl(
            this.templatePath('prettierrc'),
            this.destinationPath('.prettierrc'),
            this
        )

        this.fs.copyTpl(
            this.templatePath('gitignore'),
            this.destinationPath('.gitignore'),
            this
        )
        this._write()
    }

    install() {
        const dependencies: string[] = []
        const devDependencies: string[] = []
        dependencies.push('lwc-services@^1')
        devDependencies.push('husky@^1.3.1', 'lint-staged@^8.1.5')

        let yarnOpts = {} as any
        if (process.env.YARN_MUTEX) yarnOpts.mutex = process.env.YARN_MUTEX
        const install = (deps: string[], opts: object) =>
            this.yarn
                ? this.yarnInstall(deps, opts)
                : this.npmInstall(deps, opts)
        const dev = this.yarn ? { dev: true } : { 'save-dev': true }
        const save = this.yarn ? {} : { save: true }
        return Promise.all([
            install(devDependencies, {
                ...yarnOpts,
                ...dev,
                ignoreScripts: true
            }),
            install(dependencies, { ...yarnOpts, ...save })
        ]).then(() => {})
    }

    end() {
        log(
            messages.logs.project_created,
            this.pjson.name,
            this.destinationRoot()
        )
    }

    private _write() {
        this.fs.copyTpl(
            this.templatePath('jsconfig.json'),
            this.destinationPath('jsconfig.json'),
            this
        )
        this.fs.copyTpl(
            this.templatePath('lwc-services.config.js'),
            this.destinationPath('lwc-services.config.js'),
            this
        )
        this.fs.copyTpl(
            this.templatePath('README.md'),
            this.destinationPath('README.md'),
            this
        )
        if (!fs.existsSync('src')) {
            this.fs.copyTpl(
                this.templatePath('src/index.html'),
                this.destinationPath('src/index.html'),
                this
            )
            this.fs.copyTpl(
                this.templatePath('src/index.js'),
                this.destinationPath('src/index.js'),
                this
            )
            this.fs.copyTpl(
                this.templatePath('src/modules/my/app/app.css'),
                this.destinationPath('src/modules/my/app/app.css'),
                this
            )
            this.fs.copyTpl(
                this.templatePath('src/modules/my/app/app.js'),
                this.destinationPath('src/modules/my/app/app.js'),
                this
            )
            this.fs.copyTpl(
                this.templatePath('src/modules/my/app/app.html'),
                this.destinationPath('src/modules/my/app/app.html'),
                this
            )
            this.fs.copyTpl(
                this.templatePath('src/modules/my/greeting/greeting.css'),
                this.destinationPath('src/modules/my/greeting/greeting.css'),
                this
            )
            this.fs.copyTpl(
                this.templatePath('src/modules/my/greeting/greeting.js'),
                this.destinationPath('src/modules/my/greeting/greeting.js'),
                this
            )
            this.fs.copyTpl(
                this.templatePath('src/modules/my/greeting/greeting.html'),
                this.destinationPath('src/modules/my/greeting/greeting.html'),
                this
            )
            this.fs.copyTpl(
                this.templatePath('src/modules/my/app/__tests__/app.test.js'),
                this.destinationPath(
                    'src/modules/my/app/__tests__/app.test.js'
                ),
                this
            )
            this.fs.copyTpl(
                this.templatePath(
                    'src/modules/my/greeting/__tests__/greeting.test.js'
                ),
                this.destinationPath(
                    'src/modules/my/greeting/__tests__/greeting.test.js'
                ),
                this
            )
            this.fs.copyTpl(
                this.templatePath('src/resources/lwc.png'),
                this.destinationPath('src/resources/lwc.png'),
                this
            )
            this.fs.copyTpl(
                this.templatePath('src/resources/favicon.ico'),
                this.destinationPath('src/resources/favicon.ico'),
                this
            )
        }
    }
}

export = CreateGenerator
