'use strict'

import * as Food from './food.js'

const UNIVERSAL_CONSTANTS = {
    world: {
        simulationTickMS: 25,
    },
    food: {
        energyTransferRate: {
            [Food.PLANT]: 0.75,
            [Food.MEAT]: 1.0,
            [Food.CARRION]: 1.0,
            fat: 1.0,
        },

        // percentage of plant food that regrows over a single turn
        plantRegrowthRate: 1.0,
        
        // percentage of carrion that carries over to the next turn
        carrionDecayRate: 0.9,

        specializtionBonus: function (genePower) { return 1.0 }
        //specializtionBonus: function (genePower) { return 1.0 + Math.max(0.0, 0.05 * (genePower - 1)) }
    },
    fight: {
        // additional multiplier for ratio that applies when two creatures of different sizes fight
        sizeFactor: 1.0,
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