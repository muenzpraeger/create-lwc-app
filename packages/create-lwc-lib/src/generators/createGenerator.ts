import { execSync, spawnSync } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'
import semverCompare = require('semver-compare')
import * as Generator from 'yeoman-generator'

import { messages } from '../messages/createGenerator'
import { log } from '../utils/logger'

const sortPjson = require('sort-pjson')
const debug = require('debug')('generator-oclif')

const LWC_VERSION = "1.1.0"
const LWC_JEST_PRESET = "2.2.0"

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
        typescript: boolean
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
        typescript: string
    }
    yarn!: boolean
    repository?: string
    typescript?: boolean
    targetPathClient = 'src/'

    constructor(args: any, opts: any) {
        super(args, opts)
        this.options = {
            defaults: opts.defaults,
            yarn: opts.options.includes('yarn') || hasYarn,
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
            description: "LWC Component Library",
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
                // PHIL: disable typescript support for now
                // {
                //     type: 'list',
                //     name: 'typescript',
                //     message: messages.questions.typescript,
                //     choices: [
                //         { name: 'JavaScript', value: 'js' },
                //         { name: 'TypeScript', value: 'ts' }
                //     ],
                //     default: () => (this.options.typescript ? 1 : 0)
                // }
            ]
            this.answers = (await this.prompt(questions)) as any
        }
        debug(this.answers)
        if (!this.options.defaults) {
            this.options = {
                yarn: this.answers.pkg === 'yarn',
                typescript: this.answers.typescript === 'ts'
            }
        }
        this.yarn = this.options.yarn
        this.typescript = this.options.typescript

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
        this.pjson.engines.node = '>=10.13.0'
        this.pjson.engines.npm = '>=6.4.1'
        this.pjson.engines.yarn = '>=1.9.4'
        this.pjson.author = this.answers.author || defaults.author
        this.pjson.license = this.answers.license || defaults.license
        this.repository = this.pjson.repository = this.answers.github
            ? `${this.answers.github.user}/${this.answers.github.repo}`
            : defaults.repository
        this.pjson.dependencies = { 
            "express": "~4.16.3",
            "useragent": "~2.3.0"
        }
        this.pjson.devDependencies = { 
            "@lwc/compiler": LWC_VERSION,
            "@lwc/engine": LWC_VERSION,
            "@lwc/jest-preset": LWC_JEST_PRESET,
            "@lwc/rollup-plugin": LWC_VERSION,
            "@lwc/synthetic-shadow": LWC_VERSION,

            "@salesforce/eslint-config-lwc": "~0.3.0",
            "babel-eslint": "^10.0.1",
            "concurrently": "~4.0.1",
            "cross-env": "^6.0.3",
            "eslint": "^5.10.0",
            "jest": "~24.8.0",
            "rollup": "~0.66.6",
            "rollup-plugin-compat": "0.21.5",
            "rollup-plugin-replace": "~2.1.0",
            "rollup-plugin-terser": "^3.0.0",
            "@wdio/cli": "~5.9.3",
            "@wdio/local-runner": "~5.9.3",
            "@wdio/mocha-framework": "~5.9.3",
            "@wdio/selenium-standalone-service": "~5.9.3",
            "@wdio/spec-reporter": "~5.9.3",
            "@wdio/sync": "~5.9.3"
        }
        this.pjson.scripts = {
            "lint": "eslint src/",
            "build": "cross-env rollup -c ./scripts/rollup.config.js",
            "build:production": "cross-env NODE_ENV=production rollup -c ./scripts/rollup.config.js",
            "serve": "node index.js",
            "start": "concurrently --kill-others \"yarn build --watch\" \"yarn serve\"",
            "test": "yarn test:unit && yarn test:integration",
            "test:unit": "jest",
            "test:integration": "wdio ./scripts/wdio.conf.js"
        }
        
        if (this.typescript) {
            this.pjson.scripts.lint = 'eslint ./src/**/*.ts'
        } else {
            this.pjson.scripts.lint = 'eslint ./src/**/*.js'
        }
        this.pjson.scripts.prettier =
            "prettier --write '**/*.{css,html,js,json,md,ts,yaml,yml}'"
        this.pjson.scripts['prettier:verify'] =
            "prettier --list-different '**/*.{css,html,js,json,md,ts,yaml,yml}'"

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
            this.templatePath('editorconfig'),
            this.destinationPath('.editorconfig'),
            this
        )
        this.fs.copyTpl(
            this.templatePath('eslintrc.json'),
            this.destinationPath('.eslintrc.json'),
            this
        )
        this.fs.copyTpl(
            this.templatePath('gitignore'),
            this.destinationPath('.gitignore'),
            this
        )
        this.fs.copyTpl(
            this.templatePath('index.js'),
            this.destinationPath('index.js'),
            this
        )
        this.fs.copyTpl(
            this.templatePath('jest.config.js'),
            this.destinationPath('jest.config.js'),
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
            this.templatePath('README.md'),
            this.destinationPath('README.md'),
            this
        )
        this.fs.copyTpl(
            this.templatePath('server.js'),
            this.destinationPath('server.js'),
            this
        )
        if (this.typescript) {
            this.fs.copyTpl(
                this.templatePath('tsconfig.json'),
                this.destinationPath('.tsconfig.json'),
                this
            )
        }

        // Public directory (resources)
        this.fs.copyTpl(
            this.templatePath('public/template.html'),
            this.destinationPath('public/template.html'),
            this
        )
        this.fs.copyTpl(
            this.templatePath('public/template-wc.html'),
            this.destinationPath('public/template-wc.html'),
            this
        )
        this.fs.copyTpl(
            this.templatePath('public/js/gitkeep'),
            this.destinationPath('public/js/.gitkeep'),
            this
        )

        // Integration tests
        this.fs.copyTpl(
            this.templatePath('test-integration/specs/greeting/Greeting.spec.js'),
            this.destinationPath('test-integration/specs/greeting/Greeting.spec.js'),
            this
        )
        this.fs.copyTpl(
            this.templatePath('test-integration/specs/greeting/GreetingPage.js'),
            this.destinationPath('test-integration/specs/greeting/GreetingPage.js'),
            this
        )

        // Rollup scripts
        this.fs.copyTpl(
            this.templatePath('scripts/rollup.config.js'),
            this.destinationPath('scripts/rollup.config.js'),
            this
        )
        this.fs.copyTpl(
            this.templatePath('scripts/synthetic-shadow.js'),
            this.destinationPath('scripts/synthetic-shadow.js'),
            this
        )
        this.fs.copyTpl(
            this.templatePath('scripts/wdio.conf.js'),
            this.destinationPath('scripts/wdio.conf.js'),
            this
        )

        this._write()
    }

    install() {
        const dependencies: string[] = []
        const devDependencies: string[] = []
        devDependencies.push('husky@^3.0.7', 'lint-staged@^9.4')
        devDependencies.push('npm-run-all@^4.1.5')
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
        log(messages.logs.project_support)
        log(
            messages.logs.project_created,
            this.pjson.name,
            this.destinationRoot()
        )
    }

    private _write() {
        const fileExtension = this.typescript ? '.ts' : '.js'
        this.fs.copyTpl(
            this.templatePath('src/main'.concat(fileExtension)),
            this.destinationPath('src/main'.concat(fileExtension)),
            this
        )

        // Sample greeting component
        this.fs.copyTpl(
            this.templatePath('src/my/greeting/greeting.css'),
            this.destinationPath('src/my/greeting/greeting.css'),
            this
        )
        this.fs.copyTpl(
            this.templatePath('src/my/greeting/greeting'.concat(fileExtension)),
            this.destinationPath('src/my/greeting/greeting'.concat(fileExtension)),
            this
        )
        this.fs.copyTpl(
            this.templatePath('src/my/greeting/greeting.html'),
            this.destinationPath('src/my/greeting/greeting.html'),
            this
        )
        this.fs.copyTpl(
            this.templatePath('src/my/greeting/__tests__/greeting.test'.concat(fileExtension)),
            this.destinationPath('src/my/greeting/__tests__/greeting.test'.concat(fileExtension)),
            this
        )
    }
}

export = CreateGenerator
