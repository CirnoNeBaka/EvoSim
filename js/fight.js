'use strict'

import * as RNG from './rng.js'

const DMG_PHYSICAL = 'physical' // Symbol('physical')
const DMG_FIRE = 'fire' // Symbol('fire')
const DMG_COLD = 'cold' // Symbol('cold')
const DMG_ELECTRIC = 'electric'
const DMG_ACID = 'acid' // Symbol('acid')


const DAMAGE_TYPES = [
    DMG_PHYSICAL,
    DMG_FIRE,
    DMG_COLD,
    DMG_ELECTRIC,
    DMG_ACID,
]

class Damage {
    constructor(data) {
        for (let type of DAMAGE_TYPES)
            this[type] = 0

        if (data)
            for (let type of DAMAGE_TYPES)
                if (data.hasOwnProperty(type))
                    this[type] = data[type]
    
        //console.log("DAMAGE CREATED", this, data)
    }

    damageSum() {
        let result = 0
        for (let type of DAMAGE_TYPES) {
            result += this[type]
        }
        return result
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