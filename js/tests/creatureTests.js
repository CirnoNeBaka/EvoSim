'use strict'

import * as Food from '../core/food.js'
import { createBasicCreature, Creature } from '../core/creature.js'
import { ESSENTIAL_GENES, FEEDING_GENES, Gene, GENE_CARNIVORE, GENE_HERBIVORE, GENE_SCAVENGER } from '../core/genes.js'

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
