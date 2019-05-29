import { log, Message } from '../logger'
const chalk = require('chalk')

export function analyzeStats(stats: any) {
    log(
        buildStatsMessage(
            `Build duration: ${chalk.green(
                (stats.endTime - stats.startTime) / 1000
            )}`
        )
    )
}

function buildStatsMessage(message: string): Message {
    const msg: Message = {
        message: `       ${message}`
    }
    return msg
}
