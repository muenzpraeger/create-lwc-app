import { log, Message } from '../logger'
const chalk = require('chalk')

function buildStatsMessage(message: string): Message {
    const msg: Message = {
        message: `       ${message}`
    }
    return msg
}

export function analyzeStats(stats: any) {
    log(
        buildStatsMessage(
            `Build duration: ${chalk.green(
                (stats.endTime - stats.startTime) / 1000
            )}`
        )
    )
}
