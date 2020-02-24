import { execSync, spawnSync } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'
import semverCompare = require('semver-compare')
import * as Generator from 'yeoman-generator'

import { messages } from '../messages/createGenerator'
import { log } from '../utils/logger'

const sortPjson = require('sort-pjson')

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

const pkgJson = JSON.parse(
    fs.readFileSync(__dirname + '/../../package.json', 'utf8')
)
const LWC_SERVICES_VERSION = pkgJson.version
const filesDefault = ['lwc-services.config.js', 'jest.config.js', 'README.md']
const filesPwa = [
    'manifest.json',
    'resources/icons/icon-16x16.png',
    'resources/icons/icon-32x32.png',
    'resources/icons/icon-72x72.png',
    'resources/icons/icon-96x96.png',
    'resources/icons/icon-128x128.png',
    'resources/icons/icon-144x144.png',
    'resources/icons/icon-152x152.png',
    'resources/icons/icon-192x192.png',
    'resources/icons/icon-384x384.png',
    'resources/icons/icon-512x512.png'
]
const isWin = process.platform === 'win32'

class CreateGenerator extends Generator {
    answers!: GeneratorAnswers
    appType?: string
    args!: { [k: string]: string }
    bundler?: string
    clientserver?: boolean
    cordova?: string[]
    defaults: any
    edge?: boolean
    githubUser: string | undefined
    name: string
    options: GeneratorOptions
    pjson: any
    repository?: string
    silent?: boolean = false
    targetPathClient = 'src/'
    typescript?: any
    yarn!: boolean

    constructor(args: any, opts: any) {
        super(args, opts)
        this.options = {
            yarn: opts.options.includes('yarn') || hasYarn,
            clientserver: opts.options.includes('express'),
            typescript: opts.options.includes('typescript'),
            edge: opts.options.includes('edge'),
            bundler: opts.options.includes('rollup') ? 'rollup' : 'webpack',
            silent: opts.silent,
            appType: opts.type,
            cordova: opts.cordova
        }
        this.name = opts.name
    }

    async prompting() {
        const gitName = this.user.git.name()
        this.defaults = Object.assign(
            {
                name: this.name.replace(/ /g, '-'),
                clientserver: false,
                typescript: false,
                edge: false,
                version: '0.0.1',
                license: 'MIT',
                author: gitName,
                appType: 'standard',
                cordova: [],
                bundler: 'webpack',
                pkg: this.options.yarn ? 'yarn' : 'npm'
            },
            this.options
        )
        let repository = this.name
        if (gitName) {
            repository = `${gitName}/${this.name}`
        }
        this.pjson = {
            scripts: {},
            devDependencies: {},
            dependencies: {},
            repository,
            license: this.defaults.license,
            version: this.defaults.version,
            author: this.defaults.author,
            engines: {
                node: '>=10.13.0',
                npm: '>=6.4.1',
                yarn: '>=1.9.4'
            }
        }
        this.repository = this.defaults.repository
        if (this.repository && (this.repository as any).url) {
            this.repository = (this.repository as any).url
        }
        if (!this.options.silent) {
            const answersFirst = (await this.prompt([
                {
                    type: 'confirm',
                    name: 'simple',
                    message: 'Do you want to use the simple setup?',
                    default: true
                }
            ])) as any
            let questions: any = []
            if (answersFirst.simple) {
                questions = [
                    {
                        type: 'input',
                        name: 'name',
                        message: messages.questions.name,
                        default:
                            this.name !== '' ? this.name : this.defaults.name
                    },
                    {
                        type: 'list',
                        name: 'appType',
                        message: messages.questions.appType,
                        choices: [
                            { name: 'Standard web app', value: 'standard' },
                            { name: 'Progressive Web App (PWA)', value: 'pwa' }
                            // TODO: Validate for later implementation
                            // {
                            //     name: 'Cordova (Electron, macOS, iOS, Android)',
                            //     value: 'cordova'
                            // }
                        ],
                        default: this.defaults.appType
                    },
                    {
                        type: 'confirm',
                        name: 'clientserver',
                        message: messages.questions.clientserver,
                        default: this.defaults.clientserver
                    }
                ]
            } else {
                questions = [
                    {
                        type: 'input',
                        name: 'name',
                        message: messages.questions.name,
                        default:
                            this.name !== '' ? this.name : this.defaults.name
                    },
                    {
                        type: 'input',
                        name: 'description',
                        message: messages.questions.description,
                        default: this.defaults.description
                    },
                    {
                        type: 'input',
                        name: 'author',
                        message: messages.questions.author,
                        default: this.defaults.author
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
                        name: 'appType',
                        message: messages.questions.appType,
                        choices: [
                            { name: 'Standard web app', value: 'standard' },
                            { name: 'Progressive Web App (PWA)', value: 'pwa' }
                            // {
                            //     name: 'Cordova (Electron, iOS, Android)',
                            //     value: 'cordova'
                            // }
                        ],
                        default: this.defaults.appType
                    },
                    {
                        type: 'list',
                        name: 'bundler',
                        message: messages.questions.bundler,
                        choices: [
                            { name: 'Webpack', value: 'webpack' },
                            { name: 'Rollup', value: 'rollup' }
                        ],
                        default: this.defaults.bundler
                    },
                    {
                        type: 'list',
                        name: 'typescript',
                        message: messages.questions.typescript,
                        choices: [
                            { name: 'JavaScript', value: 'js' },
                            { name: 'TypeScript', value: 'ts' }
                        ],
                        default: () => (this.defaults.typescript ? 1 : 0)
                    },
                    {
                        type: 'confirm',
                        name: 'clientserver',
                        message: messages.questions.clientserver,
                        default: this.defaults.clientserver
                    }
                ]
                if (isWin) {
                    questions.push({
                        type: 'confirm',
                        name: 'edge',
                        message: messages.questions.edge,
                        default: this.defaults.edge
                    })
                }
            }
            this.options = Object.assign(
                this.options,
                (await this.prompt(questions)) as any
            )
        }
        this.yarn = this.options.yarn
        this.clientserver = this.options.clientserver
        this.typescript =
            this.options.typescript === 'ts' || this.options.typescript
        this.edge = this.options.edge
        this.bundler = this.options.bundler
        this.appType = this.options.appType

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

        this.pjson.name = this.defaults.name
        this.pjson.description = this.defaults.description
            ? this.defaults.description
            : 'My amazing LWC app'

        if (this.typescript) {
            this.pjson.scripts.lint = 'eslint ./src/**/*.ts'
        } else {
            this.pjson.scripts.lint = 'eslint ./src/**/*.js'
        }
        this.pjson.scripts.prettier =
            // prettier-ignore
            // eslint-disable-next-line no-useless-escape
            'prettier --write \"**/*.{css,html,js,json,md,ts,yaml,yml}\"'
        this.pjson.scripts['prettier:verify'] =
            // prettier-ignore
            // eslint-disable-next-line no-useless-escape
            'prettier --list-different \"**/*.{css,html,js,json,md,ts,yaml,yml}\"'
        if (this.clientserver) {
            this.pjson.scripts.serve = 'run-p serve:client serve:api'
            this.pjson.scripts['serve:client'] = 'node scripts/server.js'
            if (this.typescript) {
                this.pjson.scripts['serve:api'] = 'node lib/server/api.js'
            } else {
                this.pjson.scripts['serve:api'] = 'node src/server/api.js'
            }
        } else {
            this.pjson.scripts.serve = 'node scripts/server.js'
        }
        if (this.clientserver) {
            if (this.typescript) {
                if (this.bundler === 'webpack') {
                    if (this.appType === 'pwa') {
                        this.pjson.scripts.build =
                            'lwc-services build -m production -w scripts/webpack.config.js && tsc -b ./src/server'
                    } else {
                        this.pjson.scripts.build =
                            'lwc-services build -m production && tsc -b ./src/server'
                    }
                } else if (this.bundler === 'rollup') {
                    this.pjson.scripts.build =
                        'lwc-services build -m production -b rollup && tsc -b ./src/server'
                }
            } else {
                if (this.bundler === 'webpack') {
                    if (this.appType === 'pwa') {
                        this.pjson.scripts.build =
                            'lwc-services build -m production -w scripts/webpack.config.js'
                    } else {
                        this.pjson.scripts.build =
                            'lwc-services build -m production'
                    }
                } else if (this.bundler === 'rollup') {
                    this.pjson.scripts.build =
                        'lwc-services build -m production -b rollup'
                }
            }
        } else {
            if (this.bundler === 'webpack') {
                if (this.appType === 'pwa') {
                    this.pjson.scripts.build =
                        'lwc-services build -m production -w scripts/webpack.config.js'
                } else {
                    this.pjson.scripts.build =
                        'lwc-services build -m production'
                }
            } else if (this.bundler === 'rollup') {
                this.pjson.scripts.build =
                    'lwc-services build -m production -b rollup'
            }
        }
        if (this.bundler === 'webpack') {
            if (this.appType === 'pwa') {
                this.pjson.scripts['build:development'] =
                    'lwc-services build -w scripts/webpack.config.js'
            } else {
                this.pjson.scripts['build:development'] = 'lwc-services build'
            }
        } else if (this.bundler === 'rollup') {
            this.pjson.scripts['build:development'] =
                'lwc-services build -b rollup'
        }
        if (this.clientserver) {
            this.pjson.scripts.watch = 'run-p watch:client watch:server'
            if (this.bundler === 'webpack') {
                this.pjson.scripts['watch:client'] = 'lwc-services watch'
            } else if (this.bundler === 'rollup') {
                this.pjson.scripts['watch:client'] =
                    'lwc-services watch -b rollup'
            }
            this.pjson.scripts['watch:server'] = 'nodemon'

            const fileExtension = this.typescript ? 'ts' : 'js'
            this.pjson.nodemonConfig = {}
            this.pjson.nodemonConfig.watch = [
                'src/server/**/*.'.concat(fileExtension)
            ]
            this.pjson.nodemonConfig.ext = fileExtension
            this.pjson.nodemonConfig.ignore = [
                'src/**/*.spec.'.concat(fileExtension),
                'src/**/*.test.'.concat(fileExtension)
            ]
            if (this.typescript) {
                this.pjson.nodemonConfig.exec = 'ts-node ./src/server/api.'.concat(
                    fileExtension
                )
            } else {
                this.pjson.nodemonConfig.exec = 'node ./src/server/api.'.concat(
                    fileExtension
                )
            }
        } else {
            if (this.bundler === 'webpack') {
                if (this.appType === 'pwa') {
                    this.pjson.scripts['watch'] =
                        'lwc-services watch -w scripts/webpack.config.js'
                } else {
                    this.pjson.scripts['watch'] = 'lwc-services watch'
                }
            } else if (this.bundler === 'rollup') {
                this.pjson.scripts['watch'] = 'lwc-services watch -b rollup'
            }
        }
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

        this.pjson.keywords = this.defaults.keywords || ['lwc']
        this.pjson.homepage =
            this.defaults.homepage ||
            `https://github.com/${this.pjson.repository}`
        this.pjson.bugs =
            this.defaults.bugs ||
            `https://github.com/${this.pjson.repository}/issues`
        const targetPath: string = path.resolve(this.pjson.name)
        if (!fs.existsSync(targetPath)) {
            fs.mkdirSync(targetPath, { recursive: true })
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

        this._write()
    }

    install() {
        const dependencies: string[] = []
        const devDependencies: string[] = []
        devDependencies.push(
            'husky',
            'lint-staged',
            'prettier',
            'eslint',
            `lwc-services@^${LWC_SERVICES_VERSION}`
        )
        dependencies.push('compression', 'express', 'helmet')
        if (this.clientserver) {
            devDependencies.push('npm-run-all')
        }
        if (this.typescript && this.clientserver) {
            devDependencies.push('@types/express')
        }
        if (this.typescript) {
            devDependencies.push('@types/jest')
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
            install(dependencies, { ...yarnOpts, ...save }),
            install(devDependencies, {
                ...yarnOpts,
                ...dev,
                ignoreScripts: false
            })
        ])
    }

    end() {
        const prettierDirectory = `${this.destinationRoot()}/**/*.{css,html,js,json,md,ts,yaml,yml}`

        const spawn = require('child_process').spawn
        const args = [
            './node_modules/.bin/prettier',
            '--write',
            prettierDirectory
        ]

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const prettierSpawn = spawn('node', args, {
            cwd: this.destinationRoot()
        })

        if (hasGit) {
            try {
                execSync('git init', { stdio: 'ignore' })
                hasGit = true
            } catch {
                // Do nothing
            }
        }

        log(messages.logs.project_support)
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
        filesDefault.forEach(file => {
            this.fs.copyTpl(
                this.templatePath(file),
                this.destinationPath(file),
                this
            )
        })
        const fileExtension = this.typescript ? '.ts' : '.js'
        if (!fs.existsSync('src')) {
            this.fs.copyTpl(
                this.templatePath(
                    !this.defaults.edge
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
                    !this.defaults.edge
                        ? 'src/client/index'.concat(fileExtension)
                        : 'src/client/index.non-wc'.concat(fileExtension)
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

        if (this.appType === 'pwa') {
            if (this.bundler === 'webpack') {
                this.fs.copyTpl(
                    this.templatePath('webpack.config.js'),
                    this.destinationPath('scripts/webpack.config.js'),
                    this
                )
            } else {
                this.fs.copyTpl(
                    this.templatePath('workbox.generatesw.js'),
                    this.destinationPath('scripts/workbox.generatesw.js'),
                    this
                )
            }
            filesPwa.forEach(file => {
                this.fs.copyTpl(
                    this.templatePath('src/client/'.concat(file)),
                    this.targetPathClient.concat(file),
                    this
                )
            })
        }
        this.fs.copyTpl(
            this.templatePath('src/server/server.js'),
            this.destinationPath('scripts/server.js'),
            this
        )

        this.fs.copyTpl(
            this.templatePath('src/server/server.js'),
            this.destinationPath('scripts/server.js'),
            this
        )

        if (this.clientserver) {
            if (!fs.existsSync('src')) {
                this.fs.copyTpl(
                    this.templatePath('src/server/api'.concat(fileExtension)),
                    this.destinationPath(
                        'src/server/api'.concat(fileExtension)
                    ),
                    this
                )
                if (this.typescript) {
                    this.fs.copyTpl(
                        this.templatePath('src/server/tsconfig.json'),
                        this.destinationPath('src/server/tsconfig.json'),
                        this
                    )
                }
            }
        }
    }
}

interface GeneratorOptions {
    silent: boolean
    appType: string
    cordova: string[]
    yarn: boolean
    clientserver: boolean
    typescript: any
    edge: boolean
    bundler: string
}

interface GeneratorAnswers {
    name: string
    simple: boolean
    description: string
    clientserver: boolean
    edge: boolean
    version: string
    github: { repo: string; user: string }
    author: string
    license: string
    pkg: string
    typescript: string
    bundler: string
    appType: string
}

export = CreateGenerator
