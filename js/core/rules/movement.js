'use strict'

import * as RNG from '../rng.js'
import * as Food from '../food.js'
import * as Genes from '../genes.js'
import { Tile, MovementType, TILE_SEA } from '../tile.js'
import { Creature } from '../creature.js'
import { World } from '../world.js'

const TILE_SCORE = '_move_score'

export class MovementAlgorithm {
    constructor(creature, world) {
        if (!creature || !world)
            throw Error('Invalid arguments')
        this.creature = creature
        this.world = world
    }

    canMoveTo(tile) {
        return this.creature.canMoveTo(tile)
    }

    tileScore(tile) {
        const otherCreatures = this.world.creaturesAt(tile).filter(creature => creature !== this.creature)

        const foodScore = Food.TYPES.reduce((acc, type) => {
            return acc + (this.creature.canEat(type) ? this.creature.energyGain(type, tile.food[type]) : 0)
        }, 0) / Math.max(1, otherCreatures.length)

        const preyScore = this.creature.hasGene(Genes.GENE_CARNIVORE) ?
            otherCreatures.reduce((acc, c) => { return acc + c.deathMeat() }, 0) :
            0

        const finalScore = foodScore + preyScore
        return finalScore
    }

    availableTiles() {
        let currentTile = this.world.tile(this.creature.x, this.creature.y)
        let tiles = this.world.adjacentTiles(this.creature.x, this.creature.y)
            .concat([ currentTile ])
            .filter(tile => this.canMoveTo(tile))
        return tiles
    }

    getScoredTiles() {
        let tiles = this.availableTiles()
        tiles.forEach(tile => tile[TILE_SCORE] = this.tileScore(tile))
        tiles.sort((t1, t2) => { return t2[TILE_SCORE] - t1[TILE_SCORE] })
        return tiles
    }

    execute() {
        let tiles = this.getScoredTiles()
        if (tiles.length < 2)
            return // nowhere to move

        const bestScore = tiles[0][TILE_SCORE]
        let bestTiles = [ tiles[0] ]
        for (let i = 1; i < tiles.length && tiles[i][TILE_SCORE] === bestScore; ++i)
            bestTiles.push(tiles[i])

        const bestTile = (bestTiles.length > 1) ? RNG.randomElement(bestTiles) : tiles[0]
        
        let currentTile = this.world.tile(this.creature.x, this.creature.y)
        this.world.moveCreature(this.creature, currentTile, bestTile)
    }
}
