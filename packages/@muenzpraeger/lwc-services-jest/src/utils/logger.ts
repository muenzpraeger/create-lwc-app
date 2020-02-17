import cli from 'cli-ux'
const emoji = require('node-emoji')

export function log(logMessage: Message, ...args: string[]): void {
    let message = ''
    if (logMessage.emoji) {
        message = `${emoji.get(logMessage.emoji)}  `
    }
    message = message.concat(logMessage.message)
    if (args && args.length) {
        cli.log(message, ...args)
    } else {
        cli.log(message)
    }
}

export function welcome(): void {
    let message = '\n'
    const i = 5
    const zap = emoji.get('zap')
    for (let m = 0; m < i; m++) {
        message = message.concat(zap)
    }
    message = message.concat('  Lightning Web Components ')
    for (let m = 0; m < i; m++) {
        message = message.concat(zap)
    }
    cli.log(message.concat('\n\n'))
}

export interface Message {
    message: string
    emoji?: string
}
