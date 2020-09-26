'use strict'

import * as RNG from './rng.js'

const GENE_POWER_MIN = 1
const GENE_POWER_MAX = 10

function bound(a, x, b) {
    return Math.max(a, Math.min(x, b))
}

class Gene {
    constructor(stats) {
        for (let key of Object.keys(stats)) 
            this[key] = stats[key]

        this.power = GENE_POWER_MIN
    }

    mutate(chance) {
        if (Math.random() < chance) {
            if (RNG.coinFlip()) {
                this.power = Math.min(this.power + 1, GENE_POWER_MAX)
            } else {
                this.power -= 1
                if (this.isEssential)
                    this.power = GENE_POWER_MIN
            }
            return true
        }
        return false
    }

    isDead() {
        return this.power < GENE_POWER_MIN
    }
}

const GENE_MASS = {
    id: 'MASS',
    isEssential: true,
    energyCost: 0,
    icon: '🐘',
}

const GENE_SPEED = {
    id: 'SPEED',
    isEssential: true,
    energyCost: 2,
    icon: '🦶',
}

const GENE_LONGEVITY = {
    id: 'LONGEVITY',
    isEssential: true,
    energyCost: 1,
    icon: '🕧',
}

const GENE_FERTILITY = {
    id: 'FERTILITY',
    isEssential: true,
    energyCost: 1,
    icon: '♈',
}

const GENE_FAT = {
    id: 'FAT',
    isEssential: false,
    energyCost: 5,
    icon: '💛',
}

const GENE_CARNIVORE = {
    id: 'CARNIVORE',
    isEssential: false,
    energyCost: 1,
    icon: '🍖',
}

const GENE_HERBIVORE = {
    id: 'HERBIVORE',
    isEssential: false,
    energyCost: 1,
    icon: '🌿',
}

const GENE_SCAVENGER = {
    id: 'SCAVENGER',
    isEssential: false,
    energyCost: 1,
    icon: '💀',
}

const ESSENTIAL_GENES = [
    GENE_MASS,
    GENE_SPEED,
    GENE_LONGEVITY,
    GENE_FERTILITY,
]

const NON_ESSENTIAL_GENES = [
    GENE_FAT,
]

const FEEDING_GENES = [
    GENE_HERBIVORE,
    GENE_CARNIVORE,
    GENE_SCAVENGER,
]

export function requiredGene(foodType) {
    if (foodType === 'plant') return GENE_HERBIVORE
    else if (foodType === 'meat') return GENE_CARNIVORE
    else if (foodType === 'carrion') return GENE_SCAVENGER
    else return null
}

export {
    Gene,
    ESSENTIAL_GENES,
    NON_ESSENTIAL_GENES,
    FEEDING_GENES,

    GENE_MASS,
    GENE_SPEED,
    GENE_LONGEVITY,
    GENE_FERTILITY,

    GENE_FAT,

    GENE_HERBIVORE,
    GENE_CARNIVORE,
    GENE_SCAVENGER,
}

