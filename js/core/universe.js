'use strict'

const UNIVERSAL_CONSTANTS = {
    world: {
    },
    food: {
        // percentage of carrion that carries over to the next turn
        carrionDecayRate: 0.8,
        specializtionBonus: function (genePower) { return 1.0 + Math.max(0.0, 0.05 * (genePower - 1)) }
    },
    genes: {
        mutationChance: 0.25,
        gainGeneChance: 0.1, 
    }
}

function setupGlobalUniverse() {
    globalThis.Universe = UNIVERSAL_CONSTANTS
    Object.defineProperty(globalThis, 'Universe', { writable: false })
}

export {
    UNIVERSAL_CONSTANTS as Universe,
    setupGlobalUniverse
}