'use strict'

import * as Food from './food.js'
import { Universe } from './universe.js'

export const MovementType = {
    WALK: 'WALK',
    FLY: 'FLY',
    SWIM: 'SWIM',
    CLIMB: 'CLIMB',
}

class FoodStorage {
    constructor(amounts) {
        for (let type of Food.TYPES) {
            const amount = (amounts && amounts.hasOwnProperty(type)) ? amounts[type] : 0
            this[type] = amount
        }
    }

    types() {
        return Food.TYPES
    }
}

class Tile {
    constructor(stats) {
        this.x = 0
        this.y = 0

        for (let key of Object.keys(stats))
            this[key] = stats[key]

        this.food = new FoodStorage()
        this.creatureMass = 0
    }

    refresh() {
        this.regrowPlantFood()
        this.food[Food.CARRION] = Math.floor(this.food[Food.CARRION] * Universe.food.carrionDecayRate)
        this.food[Food.CARRION] += this.food[Food.MEAT]
        this.food[Food.MEAT] = 0
    }

    regrowPlantFood() {
        const delta = Math.round(Universe.food.plantRegrowthRate * this.plantFoodCapacity)
        this.food[Food.PLANT] = Math.min(this.plantFoodCapacity, this.food[Food.PLANT] + delta)
    }
}

const TILE_FOREST = {
    id: 'forest',
    plantFoodCapacity: 750,
    creatureMassCapacity: 250,
    movementTypes: [ MovementType.WALK, MovementType.FLY ],
    symbol: 'F',
}

const TILE_GRASSLAND = {
    id: 'grassland',
    plantFoodCapacity: 500,
    creatureMassCapacity: 500,
    movementTypes: [ MovementType.WALK, MovementType.FLY ],
    symbol: '/',
}

const TILE_SAVANNAH = {
    id: 'savannah',
    plantFoodCapacity: 200,
    creatureMassCapacity: 500,
    movementTypes: [ MovementType.WALK, MovementType.FLY ],
    symbol: ':',
}

const TILE_DESERT = {
    id: 'desert',
    plantFoodCapacity: 25,
    creatureMassCapacity: 500,
    movementTypes: [ MovementType.WALK, MovementType.FLY ],
    symbol: '.',
}

const TILE_RIVER = {
    id: 'river',
    plantFoodCapacity: 650,
    creatureMassCapacity: 750,
    movementTypes: [ MovementType.WALK, MovementType.SWIM, MovementType.FLY ],
    symbol: '=',
}

const TILE_SEA = {
    id: 'sea',
    plantFoodCapacity: 350,
    creatureMassCapacity: 2000,
    movementTypes: [ MovementType.SWIM, MovementType.FLY ],
    symbol: '~',
}

const TILE_HIGH_MOUNTAINS = {
    id: 'high_mountains',
    plantFoodCapacity: 100,
    creatureMassCapacity: 250,
    movementTypes: [ MovementType.CLIMB, MovementType.FLY ],
    symbol: 'M',
}

export {
    FoodStorage,
    Tile,

    TILE_GRASSLAND,
    TILE_FOREST,
    TILE_SAVANNAH,
    TILE_DESERT,
    TILE_RIVER,
    TILE_SEA,
    TILE_HIGH_MOUNTAINS,
}