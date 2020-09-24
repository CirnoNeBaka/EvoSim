'use strict'

const GENE_POWER_MIN = 1
const GENE_POWER_MAX = 10

const ESSENTIAL_GENE_IDS = [ 'MASS', 'SPEED' ]

class Gene {
    constructor(stats) {
        for (let key in stats) 
            this[key] = stats[key]

        this.power = GENE_POWER_MIN
    }
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

export {
    Gene,

    GENE_MASS,
    GENE_SPEED
}

