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

    multiply(factor) {
        let result = Object.assign(new Damage(), this)
        for (let type of DAMAGE_TYPES) {
            result[type] *= factor
        }
        return result
    }
}

const PREY_SCORE = Symbol('prey_score')

class Hunt {
    static choosePrey(hunter, world) {
        const effectiveAttackDamage = (hunter, prey) => {
            return hunter.attack()
                .subtract(prey.defence())
                .damageSum()
        }
        const effectiveRetributionDamage = (hunter, prey) => {
            return prey.retribution()
                .add(prey.attack())
                .subtract(hunter.defence())
                .damageSum()
        }
        const energyDeficit = hunter.energyDeficit() + hunter.fatDeficit()
        const preyScore = (hunter, prey) => {
            return Math.min(prey.deathMeat(), energyDeficit)
                - effectiveRetributionDamage(hunter, prey)
                + Math.min(effectiveAttackDamage(hunter, prey), prey.hp)
        }
        const prey = world.creaturesAt(hunter.x, hunter.y)
            .filter(prey => prey !== hunter)
            //.filter(prey => effectiveAttackDamage(hunter, prey) >= prey.hp)
            //.filter(prey => effectiveRetributionDamage(hunter, prey) < hunter.hp)
        
        prey.forEach(prey => { prey[PREY_SCORE] = preyScore(hunter, prey) })
        prey.sort((c1, c2) => { return c2[PREY_SCORE] - c1[PREY_SCORE] })

        //if (prey.length)
        //   console.log("Hunter at", hunter.x, hunter.y, "with attack", hunter.attack().damageSum(), "consideres prey", prey)
        return prey.length ? prey[0] : null
    }

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
    DMG_ELECTRIC,
    DMG_ACID,

    Hunt
}