import { execSync, spawnSync } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'
import semverCompare = require('semver-compare')
import * as Generator from 'yeoman-generator'

import { messages } from '../messages/createGenerator'
import { log } from '../utils/logger'

const sortPjson = require('sort-pjson')
const debug = require('debug')('generator-oclif')

let hasGit = false
let hasYarn = false
try {
    execSync('git --version', { stdio: 'ignore' })
    hasGit = true
} catch {
    // Nothing
}

try {
    execSync('yarn -v', { stdio: 'ignore' })
    hasYarn = true
} catch {
    // Nothing
}

class CreateGenerator extends Generator {
    options: {
        defaults?: boolean
        yarn: boolean
        clientserver: boolean
        typescript: boolean
    }
    name: string
    args!: { [k: string]: string }
    pjson: any
    githubUser: string | undefined
    answers!: {
        name: string
        description: string
        webcomponent: boolean
        clientserver: boolean
        version: string
        github: { repo: string; user: string }
        author: string
        files: string
        license: string
        pkg: string
        typescript: string
    }
    yarn!: boolean
    repository?: string
    clientserver?: boolean
    typescript?: boolean
    targetPathClient = 'src/'

    constructor(args: any, opts: any) {
        super(args, opts)
        this.options = {
            defaults: opts.defaults,
            yarn: opts.options.includes('yarn') || hasYarn,
            clientserver: opts.options.includes('express'),
            typescript: opts.options.includes('typescript')
        }
        this.name = opts.name
    }

    async prompting() {
        const gitName = this.user.git.name()
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
        if (gitName) repository = `${gitName}/${repository.split('/')[1]}`
        const defaults = {
            name: this.determineAppname().replace(/ /g, '-'),
            webcomponent: true,
            clientserver: false,
            typescript: false,
            version: '0.0.0',
            license: 'MIT',
            author: gitName,
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
            const questions: any = [
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
                },
                {
                    type: 'list',
                    name: 'typescript',
                    message: messages.questions.typescript,
                    choices: [
                        { name: 'JavaScript', value: 'js' },
                        { name: 'TypeScript', value: 'ts' }
                    ],
                    default: () => (this.options.typescript ? 1 : 0)
                },
                {
                    type: 'confirm',
                    name: 'webcomponent',
                    message: messages.questions.webcomponent,
                    default: defaults.webcomponent
                },
                {
                    type: 'confirm',
                    name: 'clientserver',
                    message: messages.questions.clientserver,
                    default: defaults.clientserver
                }
            ]
            this.answers = (await this.prompt(questions)) as any
        }
        debug(this.answers)
        if (!this.options.defaults) {
            this.options = {
                yarn: this.answers.pkg === 'yarn',
                clientserver: this.answers.clientserver,
                typescript: this.answers.typescript === 'ts'
            }
        }
        this.yarn = this.options.yarn
        this.clientserver = this.options.clientserver
        this.typescript = this.options.typescript

        if (this.clientserver) {
            this.targetPathClient = 'src/client/'
        }

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
        this.pjson.engines.node = '>=10.0.0 <11.0.0'
        this.pjson.author = this.answers.author || defaults.author
        this.pjson.license = this.answers.license || defaults.license
        this.repository = this.pjson.repository = this.answers.github
            ? `${this.answers.github.user}/${this.answers.github.repo}`
            : defaults.repository
        this.pjson.dependencies = { 'lwc-services': '1.3.0-beta.21' }
        if (this.typescript) {
            this.pjson.scripts.lint = 'eslint ./src/**/*.ts'
        } else {
            this.pjson.scripts.lint = 'eslint ./src/**/*.js'
        }
        this.pjson.scripts.prettier =
            "prettier --write '**/*.{css,html,js,json,md,ts,yaml,yml}'"
        this.pjson.scripts['prettier:verify'] =
            "prettier --list-different '**/*.{css,html,js,json,md,ts,yaml,yml}'"
        if (this.clientserver) {
            if (this.typescript) {
                this.pjson.scripts.build =
                    'lwc-services build -m production && tsc -b ./src/server'
            } else {
                this.pjson.scripts.build = 'lwc-services build -m production'
            }
        } else {
            this.pjson.scripts.build = 'lwc-services build -m production'
        }
        this.pjson.scripts['build:development'] = 'lwc-services build'
        if (this.clientserver) {
            this.pjson.scripts.watch = 'run-p watch:client watch:server'
            this.pjson.scripts['watch:client'] = 'lwc-services watch'
            this.pjson.scripts['watch:server'] = 'nodemon'

            const fileExtension = this.typescript ? 'ts' : 'js'

            this.pjson.nodemonConfig = {}
            this.pjson.nodemonConfig.watch = [
                'src/server/**/*.'.concat(fileExtension),
                'scripts/express-dev.'.concat(fileExtension)
            ]
            this.pjson.nodemonConfig.ext = fileExtension
            this.pjson.nodemonConfig.ignore = [
                'src/**/*.spec.'.concat(fileExtension),
                'src/**/*.test.'.concat(fileExtension)
            ]
            if (this.typescript) {
                this.pjson.nodemonConfig.exec = 'ts-node ./scripts/express-dev.'.concat(
                    fileExtension
                )
            } else {
                this.pjson.nodemonConfig.exec = 'node ./scripts/express-dev.'.concat(
                    fileExtension
                )
            }
        } else {
            this.pjson.scripts.watch = 'lwc-services watch'
        }
        this.pjson.scripts.serve = 'lwc-services serve'
        this.pjson.scripts['test:unit'] = 'lwc-services test:unit'
        this.pjson.scripts['test:unit:watch'] = 'lwc-services test:unit --watch'
        this.pjson.scripts['test:unit:debug'] = 'lwc-services test:unit --debug'
        this.pjson.scripts['test:unit:coverage'] =
            'lwc-services test:unit --coverage'

        this.pjson.husky = { hooks: {} }
        this.pjson['lint-staged'] = {}
        this.pjson.husky.hooks['pre-commit'] = 'lint-staged'

        this.pjson['lint-staged']['**/*.{css,html,js,json,md,ts,yaml,yml}'] = [
            'prettier --write'
        ]

        if (this.typescript) {
            this.pjson['lint-staged']['./src/**/*.ts'] = ['eslint']
        } else {
            this.pjson['lint-staged']['./src/**/*.js'] = ['eslint']
        }

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
        if (hasGit) {
            try {
                execSync('git init', { stdio: 'ignore' })
                hasGit = true
            } catch {
                // Do nothing
            }
        }
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
            this.templatePath('eslintignore'),
            this.destinationPath('.eslintignore'),
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

        // TODO: Verify later
        // if (this.typescript) {
        //     this.fs.copyTpl(
        //         this.templatePath('tsconfig.json'),
        //         this.destinationPath('tsconfig.json'),
        //         this
        //     )
        // }

        this._write()
    }

    install() {
        const dependencies: string[] = []
        const devDependencies: string[] = []
        dependencies.push('lwc-services@1.3.0-beta.21')
        devDependencies.push('husky@^3', 'lint-staged@^9.2')
        if (this.clientserver) {
            devDependencies.push('npm-run-all@^4.1.5')
        }
        if (this.typescript && this.clientserver) {
            devDependencies.push('@types/express@^4.17')
        }
        if (this.typescript) {
            devDependencies.push('@types/jest@^24')
        }

        const yarnOpts = {} as any
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
                ignoreScripts: false
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
            this.targetPathClient.concat('modules/jsconfig.json'),
            this
        )
        this.fs.copyTpl(
            this.templatePath('jest.config.js'),
            this.destinationPath('jest.config.js'),
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
        const fileExtension = this.typescript ? '.ts' : '.js'
        if (!fs.existsSync('src')) {
            this.fs.copyTpl(
                this.templatePath(
                    this.answers.webcomponent
                        ? 'src/client/index.html'
                        : 'src/client/index.non-wc.html'
                ),
                this.destinationPath(
                    this.targetPathClient.concat('index.html')
                ),
                this
            )
            this.fs.copyTpl(
                this.templatePath(
                    this.answers.webcomponent
                        ? 'src/client/index'.concat(fileExtension)
                        : 'src/client/index'.concat(fileExtension)
                ),
                this.destinationPath(
                    this.targetPathClient.concat('index'.concat(fileExtension))
                ),
                this
            )
            this.fs.copyTpl(
                this.templatePath('src/client/modules/my/app/app.css'),
                this.destinationPath(
                    this.targetPathClient.concat('modules/my/app/app.css')
                ),
                this
            )
            this.fs.copyTpl(
                this.templatePath(
                    'src/client/modules/my/app/app'.concat(fileExtension)
                ),
                this.destinationPath(
                    this.targetPathClient.concat(
                        'modules/my/app/app'.concat(fileExtension)
                    )
                ),
                this
            )
            this.fs.copyTpl(
                this.templatePath('src/client/modules/my/app/app.html'),
                this.destinationPath(
                    this.targetPathClient.concat('modules/my/app/app.html')
                ),
                this
            )
            this.fs.copyTpl(
                this.templatePath(
                    'src/client/modules/my/greeting/greeting.css'
                ),
                this.destinationPath(
                    this.targetPathClient.concat(
                        'modules/my/greeting/greeting.css'
                    )
                ),
                this
            )
            this.fs.copyTpl(
                this.templatePath(
                    'src/client/modules/my/greeting/greeting'.concat(
                        fileExtension
                    )
                ),
                this.destinationPath(
                    this.targetPathClient.concat(
                        'modules/my/greeting/greeting'.concat(fileExtension)
                    )
                ),
                this
            )
            this.fs.copyTpl(
                this.templatePath(
                    'src/client/modules/my/greeting/greeting.html'
                ),
                this.destinationPath(
                    this.targetPathClient.concat(
                        'modules/my/greeting/greeting.html'
                    )
                ),
                this
            )
            this.fs.copyTpl(
                this.templatePath(
                    'src/client/modules/my/app/__tests__/app.test'.concat(
                        fileExtension
                    )
                ),
                this.destinationPath(
                    this.targetPathClient.concat(
                        'modules/my/app/__tests__/app.test'.concat(
                            fileExtension
                        )
                    )
                ),
                this
            )
            this.fs.copyTpl(
                this.templatePath(
                    'src/client/modules/my/greeting/__tests__/greeting.test'.concat(
                        fileExtension
                    )
                ),
                this.destinationPath(
                    this.targetPathClient.concat(
                        'modules/my/greeting/__tests__/greeting.test'.concat(
                            fileExtension
                        )
                    )
                ),
                this
            )
            this.fs.copyTpl(
                this.templatePath('src/client/resources/lwc.png'),
                this.destinationPath(
                    this.targetPathClient.concat('resources/lwc.png')
                ),
                this
            )
            this.fs.copyTpl(
                this.templatePath('src/client/resources/favicon.ico'),
                this.destinationPath(
                    this.targetPathClient.concat('resources/favicon.ico')
                ),
                this
            )
        }

        if (this.clientserver) {
            if (!fs.existsSync('src')) {
                this.fs.copyTpl(
                    this.templatePath('src/server/index'.concat(fileExtension)),
                    this.destinationPath(
                        'src/server/index'.concat(fileExtension)
                    ),
                    this
                )
                if (this.typescript) {
                    this.fs.copyTpl(
                        this.templatePath('src/server/tsconfig.json'),
                        this.destinationPath('src/server/tsconfig.json'),
                        this
                    )
                    this.fs.copyTpl(
                        this.templatePath('scripts/express-dev.js'),
                        this.destinationPath('scripts/express-dev.ts'),
                        this
                    )
                } else {
                    this.fs.copyTpl(
                        this.templatePath('scripts/express-dev.js'),
                        this.destinationPath('scripts/express-dev.js'),
                        this
                    )
                }
            }
        }
    }
}

export = CreateGenerator
