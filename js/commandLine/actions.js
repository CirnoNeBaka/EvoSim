'use strict'

import { ActionTake } from '../core/actions/take.js'

const ACTIONS_MAPPING = [
    [['take', 'grab', 'pick'], ActionTake ],
]

console.log(typeof ActionTake)

function parseCommand(command, args) {
    for (let i = 0; i < ACTIONS_MAPPING.length; ++i) {
        const synonims = ACTIONS_MAPPING[i][0]
        const actionClass = ACTIONS_MAPPING[i][1]
        if (synonims.includes(command)) {
            let action = new actionClass()
            action.parseArgs(args)
            return action
        }
    }
    return null
}