'use strict'

import { MovementAlgorithm } from '../core/rules/movement.js'
import * as Genes from '../core/genes.js'
import { Creature } from '../core/creature.js'
import { World } from '../core/world.js'
import { loadMapFromJSON } from '../mapgen/mapParser.js'
import * as Food from '../core/food.js'

let assert = chai.assert

function createFakeCreature(genes, genePower) {
    let genesMap = genes.reduce((acc, gene) => { acc[gene.id] = new Genes.Gene(gene, genePower); return acc }, {})
    return new Creature(genesMap)
}

const OASIS_MAP = {
    tiles: [
        "...",
        "=..",
        "...",
    ]
}

const ISLAND_MAP = {
    tiles: [
        "~~~",
        "~/~",
        "~~~",
    ]
}

const MOUNTAINS_MAP = {
    tiles: [
        "MMM",
        "M.M",
        "MMM",
    ]
}

function generateWorld(mapData) {
    let world = new World(loadMapFromJSON(mapData))
    world.forEachTile(tile => tile.refresh())
    return world
}

describe('Movement', function () {

    it('Movement algorithm expects a creature and a world as input', function() {
        assert.throws(() => new MovementAlgorithm())
    })

    it('Can`t run away from an island', function() {
        let world = generateWorld(ISLAND_MAP)
        let walker = createFakeCreature(Genes.ESSENTIAL_GENES.concat([ Genes.GENE_LEGS ]))
        world.addCreature(walker, 1, 1)
        let movement = new MovementAlgorithm(walker, world)
        movement.execute()

        assert.equal(movement.availableTiles().length, 1)
        assert.isTrue(walker.x === 1 && walker.y === 1)
    })

    it('Can swim away from an island', function() {
        let world = generateWorld(ISLAND_MAP)
        let swimmer = createFakeCreature(Genes.ESSENTIAL_GENES.concat([ Genes.GENE_FINS ]))
        world.addCreature(swimmer, 1, 1)
        let movement = new MovementAlgorithm(swimmer, world)
        movement.execute()

        assert.isAbove(movement.availableTiles().length, 1)
        assert.isFalse(swimmer.x === 1 && swimmer.y === 1)
    })

    it('Can`t run over mountains', function() {
        let world = generateWorld(ISLAND_MAP)
        let walker = createFakeCreature(Genes.ESSENTIAL_GENES.concat([ Genes.GENE_LEGS ]))
        world.addCreature(walker, 1, 1)
        let movement = new MovementAlgorithm(walker, world)
        movement.execute()

        assert.equal(movement.availableTiles().length, 1)
        assert.isTrue(walker.x === 1 && walker.y === 1)
    })

    it('Can climb over mountains', function() {
        let world = generateWorld(MOUNTAINS_MAP)
        let goat = createFakeCreature(Genes.ESSENTIAL_GENES.concat([ Genes.GENE_HOOVES ]))
        world.addCreature(goat, 1, 1)
        let movement = new MovementAlgorithm(goat, world)
        movement.execute()

        assert.isAbove(movement.availableTiles().length, 1)
    })

    it('Can fly over mountains', function() {
        let world = generateWorld(MOUNTAINS_MAP)
        let bird = createFakeCreature(Genes.ESSENTIAL_GENES.concat([ Genes.GENE_WINGS ]))
        world.addCreature(bird, 1, 1)
        let movement = new MovementAlgorithm(bird, world)
        movement.execute()

        assert.isAbove(movement.availableTiles().length, 1)
    })

    it('Camel reaches the oasis', function() {
        let world = generateWorld(OASIS_MAP)
        let oasis = world.tile(1, 0)
        let camel = createFakeCreature(Genes.ESSENTIAL_GENES.concat([ Genes.GENE_LEGS, Genes.GENE_HERBIVORE ]))
        world.addCreature(camel, 1, 1)
        let movement = new MovementAlgorithm(camel, world)
        movement.execute()

        assert.isAbove(movement.availableTiles().length, 1)
        assert.isAbove(movement.tileScore(oasis), 0)
        assert.equal(movement.getScoredTiles()[0], oasis)
        assert.isTrue(camel.x === oasis.x && camel.y === oasis.y)
    })

    it('Buzzard reaches the corpse', function() {
        let world = generateWorld(OASIS_MAP)
        let grave = world.tile(1, 2)
        let buzzard = createFakeCreature(Genes.ESSENTIAL_GENES.concat([ Genes.GENE_WINGS, Genes.GENE_SCAVENGER ]))
        grave.food[Food.CARRION] = 100
        world.addCreature(buzzard, 1, 1)
        let movement = new MovementAlgorithm(buzzard, world)
        movement.execute()

        assert.isAbove(movement.availableTiles().length, 1)
        assert.isAbove(movement.tileScore(grave), 0)
        assert.equal(movement.getScoredTiles()[0], grave)
        assert.isTrue(buzzard.x === grave.x && buzzard.y === grave.y)
    })

    it('Lion reaches the zebra', function() {
        let world = generateWorld(OASIS_MAP)
        let lion  = createFakeCreature(Genes.ESSENTIAL_GENES.concat([ Genes.GENE_LEGS, Genes.GENE_CARNIVORE, Genes.GENE_FANGS ]))
        let zebra = createFakeCreature(Genes.ESSENTIAL_GENES.concat([ Genes.GENE_LEGS, Genes.GENE_HERBIVORE ]))
        world.addCreature(lion, 1, 1)
        world.addCreature(zebra, 1, 0)
        let movement = new MovementAlgorithm(lion, world)
        movement.execute()

        assert.isAbove(movement.availableTiles().length, 1)
        assert.isAbove(movement.tileScore(world.tile(zebra.x, zebra.y)), 0)
        assert.isTrue(lion.x === zebra.x && lion.y === zebra.y)
    })

    it('Lion prefers zebra over rabbit', function() {
        let world = generateWorld(OASIS_MAP)
        let lion  = createFakeCreature(Genes.ESSENTIAL_GENES.concat([ Genes.GENE_LEGS, Genes.GENE_CARNIVORE, Genes.GENE_FANGS ]))
        let zebra = createFakeCreature(Genes.ESSENTIAL_GENES.concat([ Genes.GENE_LEGS, Genes.GENE_HERBIVORE ]), 5)
        let rabbit = createFakeCreature(Genes.ESSENTIAL_GENES.concat([ Genes.GENE_LEGS, Genes.GENE_HERBIVORE ]), 1)
        world.addCreature(lion, 1, 1)
        world.addCreature(zebra, 1, 0)
        world.addCreature(rabbit, 1, 2)
        let movement = new MovementAlgorithm(lion, world)
        movement.execute()

        assert.isAbove(movement.availableTiles().length, 1)
        assert.isTrue(lion.x === zebra.x && lion.y === zebra.y)
    })
})