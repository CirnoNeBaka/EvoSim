'use strict'

import { Tile } from '../core/tile.js'
import * as Tiles from '../core/tile.js'
import * as Food from '../core/food.js'

let assert = chai.assert

describe('Tiles', function() {

    it('tile must have all required keys', function () {
        let tile = new Tile(Tiles.TILE_GRASSLAND)
        assert.containsAllKeys(tile, [
            'x', 'y',
            'food',
            'plantFoodCapacity',
            'creatureMassCapacity',
        ])
    })

    it('tile regrows plant food', function () {
        let tile = new Tile(Tiles.TILE_GRASSLAND)
        tile.food[Food.PLANT] = 0
        tile.refresh()

        assert.isAbove(tile.food[Food.PLANT], 0)
        assert.isAtMost(tile.food[Food.PLANT], tile.plantFoodCapacity)
    })

    it('meat converts to carrion', function () {
        let tile = new Tile(Tiles.TILE_GRASSLAND)
        const MEAT_AMOUNT = 100
        tile.food[Food.PLANT] = 0
        tile.food[Food.MEAT] = MEAT_AMOUNT
        tile.food[Food.CARRION] = 0 
        tile.refresh()

        assert.equal(tile.food[Food.MEAT], 0)
        assert.isAbove(tile.food[Food.CARRION], 0)
        assert.isAtMost(tile.food[Food.CARRION], MEAT_AMOUNT)
    })

    it('carrion decays over time', function () {
        let tile = new Tile(Tiles.TILE_GRASSLAND)
        const CARRION_AMOUNT = 100
        tile.food[Food.PLANT] = 0
        tile.food[Food.MEAT] = 0
        tile.food[Food.CARRION] = CARRION_AMOUNT
        tile.refresh()

        assert.isAtLeast(tile.food[Food.CARRION], 0)
        assert.isBelow(tile.food[Food.CARRION], CARRION_AMOUNT)
    })

})