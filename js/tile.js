'use strict'

const FOOD_TYPES = [ 'plant', 'meat', 'carrion' ]

class Food {
    constructor(amounts) {
        for (let type of FOOD_TYPES) {
            const amount = (amounts && amounts.hasOwnProperty(type)) ? amounts[type] : 0
            this[type] = amount
        }
    }

    types() {
        return Object.keys(this)
    }
}

class Tile {
    constructor(stats) {
        this.x = 0
        this.y = 0

        for (var key in stats)
            this[key] = stats[key]

        this.food = new Food()
    }

    refresh() {
        this.regrowPlantFood()
        this.food.meat = 0
        this.food.carrion = 0
    }

    regrowPlantFood() {
        this.food.plant = this.plantFoodCapacity
    }
}

const TILE_GRASSLAND = {
    id: 'grassland',
    plantFoodCapacity: 100,
    creatureMassCapacity: 100,
    flags: []
}

const TILE_DESERT = {
    id: 'desert',
    plantFoodCapacity: 5,
    creatureMassCapacity: 100,
    flags: []
}

const TILE_SEA = {
    id: 'sea',
    plantFoodCapacity: 50,
    creatureMassCapacity: 500,
    flags: [ 'WATER' ]
}

export {
    Food,
    Tile,

    TILE_GRASSLAND,
    TILE_DESERT,
    TILE_SEA,
}