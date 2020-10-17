'use strict'

import { FoodStorage } from '../core/tile.js'
import * as Tiles from '../core/tile.js'
import * as Food from '../core/food.js'
import { createBasicCreature, Creature } from '../core/creature.js'
import * as Genes from '../core/genes.js'
import { ESSENTIAL_GENES, FEEDING_GENES, GENE_CARNIVORE, GENE_HERBIVORE, GENE_SCAVENGER } from '../core/genes.js'

let assert = chai.assert
let expect = chai.expect

describe('Creature', function() {

    it('basic creature has all required attributes to live', function() {
        const basicCreature = createBasicCreature(GENE_HERBIVORE)
        assert.isTrue(basicCreature.alive)
        assert.isAbove(basicCreature.hp, 0)
        assert.isAbove(basicCreature.mass(), 0)
        assert.isObject(basicCreature.genes)
        assert.isAbove(Object.keys(basicCreature.genes).length, 0)
        assert.strictEqual(basicCreature.age, 0)
        assert.isTrue(ESSENTIAL_GENES.every(gene => basicCreature.hasGene(gene.id)), 'creature is missing some essential genes')
        assert.isTrue(FEEDING_GENES.some(gene => basicCreature.hasGene(gene.id)), 'creature must have at least 1 feeding gene')
    })

    it('basic carnivore creature should have some means to deal damage', function() {
        const basicCreature = createBasicCreature(GENE_CARNIVORE)
        assert.isAbove(basicCreature.attack().damageSum(), 0)
    })

    it('basic creature should have all basic stats (derived from genes)', function() {
        const basicCreature = createBasicCreature(GENE_CARNIVORE)
        assert.isObject(basicCreature.basicStats)
        assert.hasAllKeys(basicCreature.basicStats, [
            'maxHP',
            'foodEfficiency',
            'bioMass',
            'mass',
            'speed',
            'regeneration',
            'energyConsumption',
            'fatCapacity',
            'lifespan',
            'divideChance',
            'attack',
            'defence',
            'retribution',
        ])
    })

    it('basic stats are constant and can`t be changed', function() {
        const creature = createBasicCreature(GENE_HERBIVORE)
        expect(() => { creature.basicStats = {} }).to.throw()
        expect(() => { creature.basicStats.maxHP = 1 }).to.throw()
    })

    it('creatures without special movement adaptations can only walk on flat terrain', function() {
        let genesMap = Genes.createGeneMap(ESSENTIAL_GENES.concat([ Genes.GENE_LEGS ]))
        const walker = new Creature(genesMap)
        assert.isTrue (walker.canMoveTo(Tiles.TILE_GRASSLAND))
        assert.isFalse(walker.canMoveTo(Tiles.TILE_SEA))
        assert.isTrue (walker.canMoveTo(Tiles.TILE_RIVER))
        assert.isFalse(walker.canMoveTo(Tiles.TILE_HIGH_MOUNTAINS))
    })

    it('creatures with fins can swim but can`t walk', function() {
        let genesMap = Genes.createGeneMap(ESSENTIAL_GENES.concat([ Genes.GENE_FINS ]))
        const swimmer = new Creature(genesMap)
        assert.isFalse(swimmer.canMoveTo(Tiles.TILE_GRASSLAND))
        assert.isTrue (swimmer.canMoveTo(Tiles.TILE_SEA))
        assert.isTrue (swimmer.canMoveTo(Tiles.TILE_RIVER))
        assert.isFalse(swimmer.canMoveTo(Tiles.TILE_HIGH_MOUNTAINS))
    })

    it('creatures with hooves can climb and walk', function() {
        let genesMap = Genes.createGeneMap(ESSENTIAL_GENES.concat([ Genes.GENE_HOOVES ]))
        const goat = new Creature(genesMap)
        assert.isTrue (goat.canMoveTo(Tiles.TILE_GRASSLAND))
        assert.isFalse(goat.canMoveTo(Tiles.TILE_SEA))
        assert.isTrue (goat.canMoveTo(Tiles.TILE_RIVER))
        assert.isTrue (goat.canMoveTo(Tiles.TILE_HIGH_MOUNTAINS))
    })

    it('creatures with wings just don`t give a fuck', function() {
        let genesMap = Genes.createGeneMap(ESSENTIAL_GENES.concat([ Genes.GENE_WINGS ]))
        const flyer = new Creature(genesMap)
        assert.isTrue(flyer.canMoveTo(Tiles.TILE_GRASSLAND))
        assert.isTrue(flyer.canMoveTo(Tiles.TILE_SEA))
        assert.isTrue(flyer.canMoveTo(Tiles.TILE_RIVER))
        assert.isTrue(flyer.canMoveTo(Tiles.TILE_HIGH_MOUNTAINS))
    })

    it('creatures can only eat their food types depenging on genes', function(){
        const herbivore = createBasicCreature(GENE_HERBIVORE)
        const carnivore = createBasicCreature(GENE_CARNIVORE)
        const scavenger = createBasicCreature(GENE_SCAVENGER)
        
        assert.isTrue (herbivore.canEat(Food.PLANT))
        assert.isFalse(herbivore.canEat(Food.MEAT))
        assert.isFalse(herbivore.canEat(Food.CARRION))

        assert.isFalse(carnivore.canEat(Food.PLANT))
        assert.isTrue (carnivore.canEat(Food.MEAT))
        assert.isFalse(carnivore.canEat(Food.CARRION))

        assert.isFalse(scavenger.canEat(Food.PLANT))
        assert.isFalse(scavenger.canEat(Food.MEAT))
        assert.isTrue (scavenger.canEat(Food.CARRION))
    })

    it('creatures gain energy by feeding', function() {
        const herbivore = createBasicCreature(GENE_HERBIVORE)
        let food = new FoodStorage()
        food[Food.PLANT] = 1000
        food[Food.MEAT] = 1000
        food[Food.CARRION] = 1000
        herbivore.energy = 0
        herbivore.feed(food)

        assert.isFalse(herbivore.isHungry())
        assert.isAbove(herbivore.energy, 0)
        assert.isAtMost(herbivore.energy, herbivore.energyConsumption())
        assert.isBelow(food[Food.PLANT], 1000)
    })

    it('creatures get bonus energy efficiency for specializing in a food type', function() {
        let genesMap = Genes.createGeneMap(ESSENTIAL_GENES.concat([ GENE_HERBIVORE ]))
        genesMap[GENE_HERBIVORE.id].power = Genes.GENE_POWER_MAX
        const superHerbivore = new Creature(genesMap)

        assert.isAbove(superHerbivore.basicStats.foodEfficiency[Food.PLANT], 1.0)
        assert.equal(superHerbivore.basicStats.foodEfficiency[Food.MEAT], 0.0)
        assert.equal(superHerbivore.basicStats.foodEfficiency[Food.CARRION], 0.0)
    })

    it('creatures store excess energy to fat', function() {
        let genesMap = Genes.createGeneMap(ESSENTIAL_GENES.concat([ GENE_SCAVENGER, Genes.GENE_FAT ]))
        const fatScavenger = new Creature(genesMap)
        let food = new FoodStorage()
        food[Food.CARRION] = fatScavenger.energyConsumption() + fatScavenger.fatCapacity()
        fatScavenger.energy = 0
        fatScavenger.fat = 0
        fatScavenger.feed(food)

        assert.equal(fatScavenger.energy, fatScavenger.energyConsumption())
        assert.equal(fatScavenger.fat, fatScavenger.fatCapacity())
        assert.equal(food[Food.CARRION], 0)
    })

    it('creatures create a new creature when they divide', function(){
        const parent = createBasicCreature(GENE_HERBIVORE)
        const child = parent.divide()
        assert.isObject(child)
        assert.notEqual(child, parent)
        assert.isAbove(child.generation, parent.generation)
    })

    it('creatures die when they are killed', function(){
        const creature = createBasicCreature(GENE_HERBIVORE)
        creature.kill()
        assert.isFalse(creature.alive)
    })
})