"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@oclif/command");
const merge = require("deepmerge");
const fs = require("fs");
const path = require("path");
const jestConfig_1 = require("../../config/jestConfig");
const test_1 = require("../../messages/test");
const logger_1 = require("../../utils/logger");
const spawn = require('child_process').spawn;
class Test extends command_1.Command {
    async run() {
        const { flags } = this.parse(Test);
        // eslint-disable-next-line no-console
        console.clear();
        logger_1.welcome();
        // Inspiration of this implementation taken from https://github.com/salesforce/lwc-jest. Thank you, Trevor!
        let jestFinalConfig = jestConfig_1.jestConfig;
        if (!fs.existsSync('jest.config.js') &&
            !fs.existsSync('jest.config.json')) {
            logger_1.log(test_1.messages.logs.default_configuration);
        }
        else {
            logger_1.log(test_1.messages.logs.custom_configuration);
            // Yay, someone uses a custom configuration.
            if (fs.existsSync('jest.config.js')) {
                const jestCustomConfigJs = require(path.resolve(process.cwd(), 'jest.config.js'));
                jestFinalConfig = merge(jestFinalConfig, jestCustomConfigJs);
            }
            if (fs.existsSync('jest.config.json')) {
                const jestCustomConfigJson = require(path.resolve(process.cwd(), 'jest.config.json'));
                jestFinalConfig = Object.assign(Object.assign({}, jestFinalConfig), jestCustomConfigJson);
            }
        }
        logger_1.log(test_1.messages.logs.starting_jest);
        if (flags.debug) {
            // Execute command is different on Windows.
            const jestExecutable = process.platform === 'win32'
                ? './node_modules/jest/bin/jest.js'
                : './node_modules/.bin/jest';
            const debugArguments = [
                '--inspect-brk',
                jestExecutable,
                '--runInBand'
            ];
            if (flags.passthrough) {
                flags.passthrough.forEach(arg => debugArguments.push(arg));
            }
            const jestSpawn = spawn('node', debugArguments);
            jestSpawn.on('error', (err) => {
                logger_1.log({ message: `${err}`, emoji: 'sos' });
            });
            // It's super weird that the debug message is passed via stderr. But it is what it is.
            jestSpawn.stderr.on('data', (data) => {
                logger_1.log({ message: `${data}`, emoji: 'rainbow' });
            });
        }
        else {
            const jestArguments = [];
            if (flags.watch) {
                jestArguments.push('--watchAll');
            }
            if (flags.coverage) {
                jestArguments.push('--coverage');
            }
            if (flags.runInBand) {
                jestArguments.push('--runInBand');
            }
            if (flags.passthrough) {
                flags.passthrough.forEach(arg => jestArguments.push(arg));
            }
            const jest = require('jest');
            jest.run(['--config', JSON.stringify(jestFinalConfig)].concat(jestArguments));
        }
    }
}
exports.default = Test;
Test.description = test_1.messages.description;
Test.examples = test_1.messages.help.examples;
Test.flags = {
    help: command_1.flags.help({ char: 'h' }),
    coverage: command_1.flags.boolean({
        char: 'c',
        description: test_1.messages.flags.coverage
    }),
    debug: command_1.flags.boolean({ char: 'd', description: test_1.messages.flags.debug }),
    watch: command_1.flags.boolean({ char: 'w', description: test_1.messages.flags.watch }),
    runInBand: command_1.flags.boolean({
        char: 'r',
        description: test_1.messages.flags.runInBand
    }),
    passthrough: command_1.flags.string({
        char: 'p',
        multiple: true,
        description: test_1.messages.flags.passthrough
    })
};
