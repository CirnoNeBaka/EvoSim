'use strict'

class Tile {
    constructor(stats) {
        this.x = 0
        this.y = 0

        for (var key in stats)
            this[key] = stats[key]

        this.food = {
            plant: 0,
            meat: 0,
            carrion: 0,
        }
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
    plantFoodCapacity: 8,
    creatureMassCapacity: 100,
    flags: []
}

export {
    Tile,

    TILE_GRASSLAND,
    TILE_DESERT
}