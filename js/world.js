'use strict'

import './tile.js';
import './creature.js';
import { Tile, TILE_DESERT, TILE_GRASSLAND } from './tile.js';

const WORLD_WIDTH = 10
const WORLD_HEIGHT = 10

class World {
    constructor() {
        this.width = WORLD_WIDTH
        this.height = WORLD_HEIGHT
        this.tiles = Array(this.width * this.height)
        this.creatures = []
    }

    tile(x, y) {
        return this.tiles[x + y * this.width]
    }

    forEachTile(func) {
        for (let x = 0; x < this.width; ++x)
            for (let y = 0; y < this.height; ++y)
                func(this.tile(x, y), x, y)
    }

    forEachCreature(func) {
        for (let i = 0; i < this.creatures.length; ++i)
            func(this.creatures[i])
    }

    generateTiles() {
        for (let i = 0; i < this.width * this.height; ++i) {
            let tileType = {}
            if (Math.random() < 0.1) {
                tileType = TILE_DESERT
            } else {
                tileType = TILE_GRASSLAND
            }
            this.tiles[i] = new Tile(tileType)
        }
    }
}

export {
    World
}