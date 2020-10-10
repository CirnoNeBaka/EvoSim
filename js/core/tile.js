'use strict'

import * as Food from './food.js'

// percentage of carrion that carries over to the next turn
const CARRION_DECAY_RATE = 0.8

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
        this.food[Food.CARRION] = Math.floor(this.food[Food.CARRION] * CARRION_DECAY_RATE)
        this.food[Food.CARRION] += this.food[Food.MEAT]
        this.food[Food.MEAT] = 0
    }

    regrowPlantFood() {
        this.food[Food.PLANT] = this.plantFoodCapacity
    }
}

const TILE_GRASSLAND = {
    id: 'grassland',
    plantFoodCapacity: 200,
    creatureMassCapacity: 200,
    flags: []
}

const TILE_DESERT = {
    id: 'desert',
    plantFoodCapacity: 25,
    creatureMassCapacity: 200,
    flags: []
}

const TILE_SEA = {
    id: 'sea',
    plantFoodCapacity: 100,
    creatureMassCapacity: 500,
    flags: [ 'WATER' ]
}

export {
    FoodStorage,
    Tile,

    TILE_GRASSLAND,
    TILE_DESERT,
    TILE_SEA,
}