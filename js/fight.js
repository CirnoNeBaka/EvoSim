'use strict'

import * as RNG from './rng.js'

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
    constructor(data) {
        for (let type of DAMAGE_TYPES)
            this[type] = data ? data[type] : 0
    }

    add(dmg) {
        let result = Object.assign(new Damage(), this)
        for (let type of DAMAGE_TYPES) {
            result[type] += dmg[type]
        }
        return result
    }

    subtract(dmg) {
        let result = Object.assign(new Damage(), this)
        for (let type of DAMAGE_TYPES) {
            result[type] = Math.max(0, result[type] - dmg[type])
        }
        return result
    }
}

class Hunt {
    constructor(predators, prey) {
        this.predators = Array.isArray(predators) ? predators : [ predators ]
        this.prey = Array.isArray(prey) ? prey : [ prey ]
    }
}

export {
    Damage,
    DAMAGE_TYPES,

    DMG_PHYSICAL,
    DMG_FIRE,
    DMG_COLD,
    DMG_ACID,

    Hunt
}