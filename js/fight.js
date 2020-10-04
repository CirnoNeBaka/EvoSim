'use strict'

import * as RNG from './rng'

const DMG_PHYSICAL = Symbol('PHYSICAL')
const DMG_FIRE = Symbol('FIRE')
const DMG_COLD = Symbol('COLD')
const DMG_ACID = Symbol('ACID')

const DAMAGE_TYPES = [
    DMG_PHYSICAL,
    DMG_FIRE,
    DMG_COLD,
    DMG_ACID,
]

class Damage {
    constructor() {
        for (let type of DAMAGE_TYPES)
            this[type] = 0
    }
}

class Defence {
    constructor() {
        for (let type of DAMAGE_TYPES)
            this[type] = 0
    }
}

export {
    Damage,
    Defence,
    DAMAGE_TYPES
}