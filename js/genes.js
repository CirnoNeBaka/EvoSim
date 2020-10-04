'use strict'

import * as RNG from './rng.js'
import * as Food from './food.js'
import * as Fight from './fight.js'

const GENE_POWER_MIN = 1
const GENE_POWER_MAX = 10

class Gene {
    constructor(stats) {
        this.isEssential = false
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
                    this.power = Math.max(GENE_POWER_MIN, this.power)
            }
            return true
        }
        return false
    }

    isDead() {
        return this.power < GENE_POWER_MIN
    }

    getAttack() {
        return new Fight.Damage(this.attack)
    }

    getDefence() {
        return new Fight.Damage(this.defence)
    }

    getRetribution() {
        return new Fight.Damage(this.retribution)
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
    energyCost: 5,
    icon: '💛',
}

const GENE_REGENERATION = {
    id: 'REGENERATION',
    energyCost: 1,
    icon: '💚',
}

const GENE_CARNIVORE = {
    id: 'CARNIVORE',
    energyCost: 0,
    icon: '🍖',
    foodType: Food.MEAT
}

const GENE_HERBIVORE = {
    id: 'HERBIVORE',
    energyCost: 0,
    icon: '🌿',
    foodType: Food.PLANT,
}

const GENE_SCAVENGER = {
    id: 'SCAVENGER',
    energyCost: 0,
    icon: '🦴',
    foodType: Food.CARRION,
}

const GENE_CLAWS = {
    id: 'CLAWS',
    energyCost: 1,
    icon: '⚔CL',
    attack: {
        [Fight.DMG_PHYSICAL]: 25
    }
}

const GENE_FANGS = {
    id: 'FANGS',
    energyCost: 1,
    icon: '⚔FA',
    attack: {
        [Fight.DMG_PHYSICAL]: 25
    }
}

const GENE_FIRE_BREATH = {
    id: 'FIRE_BREATH',
    energyCost: 4,
    icon: '⚔FIR',
    attack: {
        [Fight.DMG_FIRE]: 25
    }
}

const GENE_ACID_SPIT = {
    id: 'ACID_SPIT',
    energyCost: 4,
    icon: '⚔ACD',
    attack: {
        [Fight.DMG_ACID]: 25
    }
}

const GENE_FUR = {
    id: 'FUR',
    energyCost: 1,
    massCost: 0,
    icon: '🛡F',
    defence: {
        [Fight.DMG_PHYSICAL]: 2,
        [Fight.DMG_COLD]: 20
    }
}

const GENE_CHITIN = {
    id: 'CHITIN',
    energyCost: 1,
    massCost: 1,
    icon: '🛡CH',
    defence: {
        [Fight.DMG_PHYSICAL]: 5,
        [Fight.DMG_FIRE]: 2,
        [Fight.DMG_ACID]: 10,
    }
}

const GENE_SCALES = {
    id: 'SCALES',
    energyCost: 2,
    massCost: 5,
    icon: '🛡SC',
    defence: {
        [Fight.DMG_PHYSICAL]: 25,
        [Fight.DMG_FIRE]: 5,
    }
}

const GENE_SHELL = {
    id: 'SHELL',
    energyCost: 4,
    massCost: 25,
    icon: '🛡SH',
    defence: {
        [Fight.DMG_PHYSICAL]: 50,
        [Fight.DMG_ACID]: 5,
    }
}

const GENE_NEEDLES = {
    id: 'NEEDLES',
    energyCost: 1,
    massCost: 1,
    icon: '🛡⚔ND',
    retribution: {
        [Fight.DMG_PHYSICAL]: 2
    }
}

const GENE_SPIKES = {
    id: 'SPIKES',
    energyCost: 2,
    massCost: 5,
    icon: '🛡⚔SPK',
    retribution: {
        [Fight.DMG_PHYSICAL]: 10
    }
}

const GENE_BURNING_SKIN = {
    id: 'BURNING_SKIN',
    energyCost: 4,
    massCost: 0,
    icon: '🛡⚔FIR',
    defence: {
        [Fight.DMG_FIRE]: 25
    },
    retribution: {
        [Fight.DMG_FIRE]: 10
    }
}

const GENE_ACID_SKIN = {
    id: 'ACID_SKIN',
    energyCost: 4,
    massCost: 0,
    icon: '🛡⚔ACD',
    defence: {
        [Fight.DMG_ACID]: 25
    },
    retribution: {
        [Fight.DMG_ACID]: 10
    }
}

const ESSENTIAL_GENES = [
    GENE_MASS,
    GENE_SPEED,
    GENE_LONGEVITY,
    GENE_FERTILITY,
]

const NON_ESSENTIAL_GENES = [
    GENE_FAT,
    GENE_REGENERATION,
    
    GENE_HERBIVORE,
    GENE_CARNIVORE,
    GENE_SCAVENGER,

    // offensive genes
    GENE_CLAWS,
    GENE_FANGS,
    GENE_FIRE_BREATH,
    GENE_ACID_SPIT,

    // defensive genes
    GENE_FUR,
    GENE_CHITIN,
    GENE_SCALES,
    GENE_SHELL,

    // retribution genes
    GENE_NEEDLES,
    GENE_SPIKES,
    GENE_BURNING_SKIN,
    GENE_ACID_SKIN,
]

const FEEDING_GENES = [
    GENE_HERBIVORE,
    GENE_CARNIVORE,
    GENE_SCAVENGER,
]

export function requiredGene(foodType) {
    for (let gene of FEEDING_GENES)
        if (gene.foodType === foodType)
            return gene
    return null
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

