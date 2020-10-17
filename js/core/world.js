'use strict'

import './tile.js';
import './creature.js';
import { Tile, TILE_DESERT, TILE_GRASSLAND } from './tile.js';

class World {
    constructor(map) {
        this.initMap(map)
        this.creatures = []
    }

    initMap(map) {
        if (!Array.isArray(map) || !Array.isArray(map[0]))
            throw Error('Invalid map')

        this.width = map[0].length
        this.height = map.length
        this.tiles = map
    }

    tile(x, y) {
        let tile = this.tiles[x][y]
        if (!tile) throw Error(`Invalid tile index: (${x},${y})`)
        return tile
    }

    creaturesAt(x, y) {
        if (x !== undefined && y === undefined)
            return this.creaturesAt(x.x, x.y)
        return this.creatures.filter((creature) => { return creature.x === x && creature.y === y })
    }

    addCreature(creature, x, y) {
        if (x !== undefined && y === undefined)
            return this.addCreature(creature, x.x, x.y)
        
        let tile = this.tile(x, y)
        if (tile.creatureMass + creature.mass() > tile.creatureMassCapacity)
            return false;
        tile.creatureMass += creature.mass()
        this.creatures.push(creature)
        creature.x = x
        creature.y = y
        return true
    }

    moveCreature(creature, fromTile, toTile) {
        if (toTile.creatureMass + creature.mass() > toTile.creatureMassCapacity)
            return false

        if (fromTile)
            fromTile.creatureMass -= creature.mass()
        if (toTile) {
            creature.x = toTile.x
            creature.y = toTile.y
            toTile.creatureMass += creature.mass()
        }
        return true
    }

    adjacentTiles(x, y) {
        if (x !== undefined && y === undefined)
            return this.adjacentTiles(x.x, x.y)

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
}

export {
    World
}