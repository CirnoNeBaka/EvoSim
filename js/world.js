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

    creaturesAt(x, y) {
        return this.creatures.filter((creature) => { return creature.x === x && creature.y === y })
    }

    addCreature(creature) {
        let tile = this.tile(creature.x, creature.y)
        if (tile.creatureMass + creature.mass() > tile.creatureMassCapacity)
            return false;
        tile.creatureMass += creature.mass()
        this.assertCreatureMass(tile)
        this.creatures.push(creature)
        return true
    }

    moveCreature(creature, fromTile, toTile) {
        if (fromTile)
            fromTile.creatureMass -= creature.mass()
        if (toTile) {
            creature.x = toTile.x
            creature.y = toTile.y
            toTile.creatureMass += creature.mass()
            this.assertCreatureMass(toTile)
        }
    }

    assertCreatureMass(tile) {
        if (tile.creatureMass > tile.creatureMassCapacity)
            console.warn("CHEATER:", tile)
    }

    adjacentTiles(x, y) {
        const left  = (x > 0) ? (x - 1) : (this.width - 1)
        const right = (x < this.width - 1) ? (x + 1) : 0
        const up    = (y > 0) ? (y - 1) : (this.height - 1)
        const down  = (y < this.height - 1) ? (y + 1) : 0
        return [
            this.tile(left, y),
            this.tile(right, y),
            this.tile(x, up),
            this.tile(x, down),
        ]
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
        const GEN_CHANCE_GRASSLAND = 0.08
        for (let i = 0; i < this.width * this.height; ++i) {
            let tileType = {}
            if (Math.random() < GEN_CHANCE_GRASSLAND) {
                tileType = TILE_GRASSLAND
            } else {
                tileType = TILE_DESERT
            }
            let tile = new Tile(tileType)
            tile.x = i % this.width
            tile.y = Math.floor(i / this.width)
            this.tiles[i] = tile
        }
    }
}

export {
    World
}