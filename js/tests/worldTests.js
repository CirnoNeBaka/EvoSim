'use strict'

import { createBasicCreature } from '../core/creature.js'
import { World } from '../core/world.js'
import { loadMapFromJSON } from '../mapgen/mapParser.js'

let assert = chai.assert

const TEST_MAP_DATA = {
    "tiles": [
        "//////////",
        "//////////",
        "//////////",
        "//////////",
        "//////////",
        "//////////",
        "//////////",
        "//////////",
        "//////////",
        "//////////",
    ]
}

function testMap() {
    return loadMapFromJSON(TEST_MAP_DATA)
}

describe('World', function() {
    
    it('freshly created world has required properties', function() {
        let world = new World(testMap())
        assert.containsAllKeys(world, [
            'width',
            'height',
            'tiles',
            'creatures',
        ])
        assert.isAbove(world.width, 0)
        assert.isAbove(world.height, 0)
    })

    it('world provides access to tiles', function() {
        let world = new World(testMap())

        assert.isObject(world.tile(0, 0))
        assert.equal(world.tile(0, 0).x, 0)
        assert.equal(world.tile(0, 0).y, 0)
        assert.equal(world.tile(world.width - 1, world.height - 1).x, world.width - 1)
        assert.equal(world.tile(world.width - 1, world.height - 1).y, world.height - 1)
    })

    it('out of bounds tile access should throw errors', function() {
        let world = new World(testMap())

        assert.throws(() => { world.tile(-1, -2) })
        assert.throws(() => { world.tile(world.width, world.height) })
    })

    it('adjacent tiles are ok', function() {
        let world = new World(testMap())
        let tiles = world.adjacentTiles(1, 1)

        assert.equal(tiles.length, 4)
        assert.isTrue(tiles.some(tile => tile.x === 0 && tile.y === 1))
        assert.isTrue(tiles.some(tile => tile.x === 1 && tile.y === 0))
        assert.isTrue(tiles.some(tile => tile.x === 1 && tile.y === 2))
        assert.isTrue(tiles.some(tile => tile.x === 2 && tile.y === 1))
    })

    it('world is a torus', function() {
        let world = new World(testMap())
        
        let topLeftTiles = world.adjacentTiles(0, 0)
        assert.equal(topLeftTiles.length, 4)
        assert.isTrue(topLeftTiles.some(tile => tile.x === 0               && tile.y === world.height - 1))
        assert.isTrue(topLeftTiles.some(tile => tile.x === 0               && tile.y === 1))
        assert.isTrue(topLeftTiles.some(tile => tile.x === world.width - 1 && tile.y === 0))
        assert.isTrue(topLeftTiles.some(tile => tile.x === 1               && tile.y === 0))

        let bottomRightTiles = world.adjacentTiles(world.width - 1, world.height - 1)
        assert.equal(bottomRightTiles.length, 4)
        assert.isTrue(bottomRightTiles.some(tile => tile.x === world.width - 1 && tile.y === world.height - 2))
        assert.isTrue(bottomRightTiles.some(tile => tile.x === world.width - 1 && tile.y === 0))
        assert.isTrue(bottomRightTiles.some(tile => tile.x === world.width - 2 && tile.y === world.height - 1))
        assert.isTrue(bottomRightTiles.some(tile => tile.x === 0               && tile.y === world.height - 1))
    })

    it('adds creatures', function() {
        let creature = createBasicCreature()
        creature.x = 0
        creature.y = 0

        let world = new World(testMap())
        world.addCreature(creature, 2, 3)

        assert.isAbove(world.creatures.length, 0)
        assert.equal(creature.x, 2)
        assert.equal(creature.y, 3)
    })

    it('creaturesAt(x,y) and creatures(tile) getter styles', function() {
        let world = new World(testMap())

        let creature = createBasicCreature()
        let tile = world.tile(0, 0)
        world.addCreature(creature, tile.x, tile.y)

        assert.isAbove(world.creaturesAt(tile.x, tile.y).length, 0)
        assert.isAbove(world.creaturesAt(tile).length, 0)
        assert.deepEqual(world.creaturesAt(tile), world.creaturesAt(tile.x, tile.y))
    })

    it('moves creatures', function() {
        let creature = createBasicCreature()
        creature.x = 0
        creature.y = 0

        let world = new World(testMap())
        world.addCreature(creature, 0, 0)

        let oldTile = world.tile(creature.x, creature.y)
        let newTile = world.tile(1, 1)
        world.moveCreature(creature, oldTile, newTile)

        assert.equal(creature.x, newTile.x)
        assert.equal(creature.y, newTile.y)
        assert.equal(world.creaturesAt(newTile).length, 1)
        assert.equal(world.creaturesAt(oldTile).length, 0)
    })

    it('can`t add more creatures than max mass capacity allows', function() {
        let world = new World(testMap())
        
        let targetTile = world.tile(0, 0)
        let fakeFatCreature = { x: 0, y: 0, mass: function() { return targetTile.creatureMassCapacity } }
        world.addCreature(fakeFatCreature, targetTile)
    
        let creature = createBasicCreature()
        world.addCreature(creature, targetTile)

        assert.equal(world.creatures.length, 1)
        assert.equal(world.creaturesAt(targetTile).length, 1)
        assert.equal(world.creaturesAt(targetTile)[0], fakeFatCreature)

        let anotherTile = world.tile(1, 1)
        world.addCreature(creature, anotherTile)
        world.moveCreature(creature, anotherTile, targetTile)

        assert.equal(world.creatures.length, 2)
        assert.equal(world.creaturesAt(targetTile).length, 1)
        assert.equal(world.creaturesAt(targetTile)[0], fakeFatCreature)
    })
})