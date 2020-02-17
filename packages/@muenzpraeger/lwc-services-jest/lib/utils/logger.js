"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cli_ux_1 = require("cli-ux");
const emoji = require('node-emoji');
function log(logMessage, ...args) {
    let message = '';
    if (logMessage.emoji) {
        message = `${emoji.get(logMessage.emoji)}  `;
    }
    message = message.concat(logMessage.message);
    if (args && args.length) {
        cli_ux_1.default.log(message, ...args);
    }
    else {
        cli_ux_1.default.log(message);
    }
}
exports.log = log;
function welcome() {
    let message = '\n';
    const i = 5;
    const zap = emoji.get('zap');
    for (let m = 0; m < i; m++) {
        message = message.concat(zap);
    }
    message = message.concat('  Lightning Web Components ');
    for (let m = 0; m < i; m++) {
        message = message.concat(zap);
    }
    cli_ux_1.default.log(message.concat('\n\n'));
}
exports.welcome = welcome;
