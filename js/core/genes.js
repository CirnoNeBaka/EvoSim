'use strict'

import * as Food from './food.js'
import * as Fight from './fight.js'
import { MovementType } from './tile.js'

export const GENE_POWER_MIN = 1
export const GENE_POWER_MAX = 10

class Gene {
    constructor(stats, power) {
        this.isEssential = false
        for (let key of Object.keys(stats)) 
            this[key] = stats[key]

        this.power = power ? power : GENE_POWER_MIN
    }

    mutateUp() {
        this.power = Math.min(this.power + 1, GENE_POWER_MAX)
    }

    mutateDown() {
        if (this.isEssential && this.power === GENE_POWER_MIN)
            return
        this.power--
    }

    isDead() {
        return this.power < GENE_POWER_MIN
    }

    getAttack() {
        return new Fight.Damage(this.attack).multiply(this.power)
    }

    getDefence() {
        return new Fight.Damage(this.defence).multiply(this.power)
    }

    getRetribution() {
        return new Fight.Damage(this.retribution).multiply(this.power)
    }
}

export function createGeneMap(genes) {
    return genes.reduce((acc, gene) => {
        acc[gene.id] = new Gene(gene)
        return acc
    }, {})
}

export function cloneGenes(genes) {
    let result = {}
    for (let [ geneID, gene ] of Object.entries(genes)) {
        let geneCopy = Object.assign(new Gene({}), gene)
        result[geneID] = geneCopy
    }
    return result
}

const GENE_MASS = {
    id: 'MASS',
    isEssential: true,
    energyCost: 0,
}

const GENE_SPEED = {
    id: 'SPEED',
    isEssential: true,
    energyCost: 2,
}

const GENE_LONGEVITY = {
    id: 'LONGEVITY',
    isEssential: true,
    energyCost: 1,
    description: '🕧',
}

const GENE_FERTILITY = {
    id: 'FERTILITY',
    isEssential: true,
    energyCost: 1,
    description: '♈',
}

const GENE_FAT = {
    id: 'FAT',
    energyCost: 5,
    description: '💛',
}

const GENE_REGENERATION = {
    id: 'REGENERATION',
    energyCost: 1,
    description: '💚',
}

const GENE_CARNIVORE = {
    id: 'CARNIVORE',
    energyCost: 0,
    description: '🍖',
    foodType: Food.MEAT
}

const GENE_HERBIVORE = {
    id: 'HERBIVORE',
    energyCost: 0,
    description: '🌿',
    foodType: Food.PLANT,
}

const GENE_SCAVENGER = {
    id: 'SCAVENGER',
    energyCost: 0,
    description: '🦴',
    foodType: Food.CARRION,
}

const GENE_LEGS = {
    id: 'LEGS',
    energyCost: 0,
    description: 'L',
    movementTypes: [ MovementType.WALK ],
    exclusiveFlags: [ 'LEGS' ]
}

const GENE_WINGS = {
    id: 'WINGS',
    energyCost: 5,
    description: 'W',
    movementTypes: [ MovementType.FLY ],
}

const GENE_FINS = {
    id: 'FINS',
    energyCost: 2,
    description: 'F',
    movementTypes: [ MovementType.SWIM ],
}

const GENE_HOOVES = {
    id: 'HOOVES',
    energyCost: 1,
    massCost: 1,
    description: 'H',
    movementTypes: [ MovementType.WALK, MovementType.CLIMB ],
    exclusiveFlags: [ 'LEGS', 'LIMB_END' ]
}

const GENE_CLAWS = {
    id: 'CLAWS',
    energyCost: 1,
    description: '⚔CL',
    attack: {
        [Fight.DMG_PHYSICAL]: 25
    },
    exclusiveFlags: ['LIMB_END'],
    movementTypes: [ MovementType.CLIMB ],
}

const GENE_FANGS = {
    id: 'FANGS',
    energyCost: 1,
    description: '⚔FA',
    attack: {
        [Fight.DMG_PHYSICAL]: 25
    }
}

const GENE_STING = {
    id: 'STING',
    energyCost: 2,
    description: '⚔ST',
    attack: {
        [Fight.DMG_PHYSICAL]: 15
    }
}

const GENE_FIRE_BREATH = {
    id: 'FIRE_BREATH',
    energyCost: 4,
    description: '⚔FIR',
    attack: {
        [Fight.DMG_FIRE]: 25
    },
    exclusiveFlags: ['ELEMENTAL_BREATH']
}

const GENE_ACID_SPIT = {
    id: 'ACID_SPIT',
    energyCost: 4,
    description: '⚔ACD',
    attack: {
        [Fight.DMG_ACID]: 25
    },
    exclusiveFlags: ['ELEMENTAL_BREATH']
}

const GENE_FUR = {
    id: 'FUR',
    energyCost: 1,
    massCost: 0,
    description: '🛡F',
    defence: {
        [Fight.DMG_PHYSICAL]: 2,
        [Fight.DMG_COLD]: 20
    },
    exclusiveFlags: ['SKIN_ARMOR']
}

const GENE_CHITIN = {
    id: 'CHITIN',
    energyCost: 1,
    massCost: 1,
    description: '🛡CH',
    defence: {
        [Fight.DMG_PHYSICAL]: 5,
        [Fight.DMG_FIRE]: 2,
        [Fight.DMG_ACID]: 10,
    },
    exclusiveFlags: ['SKIN_ARMOR']
}

const GENE_SCALES = {
    id: 'SCALES',
    energyCost: 2,
    massCost: 5,
    description: '🛡SC',
    defence: {
        [Fight.DMG_PHYSICAL]: 25,
        [Fight.DMG_FIRE]: 5,
    },
    exclusiveFlags: ['SKIN_ARMOR']
}

const GENE_SHELL = {
    id: 'SHELL',
    energyCost: 4,
    massCost: 25,
    description: '🛡SH',
    defence: {
        [Fight.DMG_PHYSICAL]: 50,
        [Fight.DMG_ACID]: 5,
    },
    exclusiveFlags: ['SKIN_ARMOR']
}

const GENE_NEEDLES = {
    id: 'NEEDLES',
    energyCost: 1,
    massCost: 1,
    description: '🛡⚔ND',
    retribution: {
        [Fight.DMG_PHYSICAL]: 2
    },
    exclusiveFlags: ['SKIN_PROTRUSIONS']
}

const GENE_SPIKES = {
    id: 'SPIKES',
    energyCost: 2,
    massCost: 5,
    description: '🛡⚔SPK',
    retribution: {
        [Fight.DMG_PHYSICAL]: 10
    },
    exclusiveFlags: ['SKIN_PROTRUSIONS']
}

const GENE_HORNS = {
    id: 'HORNS',
    energyCost: 2,
    massCost: 5,
    description: '🛡⚔HOR',
    retribution: {
        [Fight.DMG_PHYSICAL]: 15
    },
    exclusiveFlags: ['HEAD_PROTRUSIONS']
}

const GENE_BURNING_SKIN = {
    id: 'BURNING_SKIN',
    energyCost: 4,
    massCost: 0,
    description: '🛡⚔FIR',
    defence: {
        [Fight.DMG_FIRE]: 25
    },
    retribution: {
        [Fight.DMG_FIRE]: 10
    },
    exclusiveFlags: ['ELEMENTAL_SKIN']
}

const GENE_ACID_SKIN = {
    id: 'ACID_SKIN',
    energyCost: 4,
    massCost: 0,
    description: '🛡⚔ACD',
    defence: {
        [Fight.DMG_ACID]: 25
    },
    retribution: {
        [Fight.DMG_ACID]: 10
    },
    exclusiveFlags: ['ELEMENTAL_SKIN']
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

    // movement genes
    GENE_LEGS,
    GENE_WINGS,
    GENE_FINS,
    GENE_HOOVES,

    // offensive genes
    GENE_CLAWS,
    GENE_FANGS,
    GENE_STING,
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
    GENE_HORNS,
    GENE_BURNING_SKIN,
    GENE_ACID_SKIN,
]

const FEEDING_GENES = NON_ESSENTIAL_GENES.filter(gene => gene.foodType)

const OFFENSIVE_GENES   = NON_ESSENTIAL_GENES.filter(gene => gene.attack)
const DEFENSIVE_GENES   = NON_ESSENTIAL_GENES.filter(gene => gene.defence)
const RETRIBUTION_GENES = NON_ESSENTIAL_GENES.filter(gene => gene.retribution)

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
    OFFENSIVE_GENES,
    DEFENSIVE_GENES,
    RETRIBUTION_GENES,

    GENE_MASS,
    GENE_SPEED,
    GENE_LONGEVITY,
    GENE_FERTILITY,

    GENE_FAT,
    GENE_REGENERATION,

    GENE_HERBIVORE,
    GENE_CARNIVORE,
    GENE_SCAVENGER,

    GENE_LEGS,
    GENE_WINGS,
    GENE_FINS,
    GENE_HOOVES,

    GENE_CLAWS,
    GENE_FANGS,
    GENE_STING,
    GENE_FIRE_BREATH,
    GENE_ACID_SPIT,

    GENE_FUR,
    GENE_CHITIN,
    GENE_SCALES,
    GENE_SHELL,

    GENE_NEEDLES,
    GENE_SPIKES,
    GENE_HORNS,
    GENE_BURNING_SKIN,
    GENE_ACID_SKIN,
}
