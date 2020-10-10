'use strict'

import { MutationAlgorithm } from '../core/rules/mutation.js'
import * as Genes from '../core/genes.js'
import { Creature } from '../core/creature.js'

let assert = chai.assert

function createFakeCreature(genes, genePower) {
    let genesMap = genes.reduce((acc, gene) => { acc[gene.id] = new Genes.Gene(gene, genePower); return acc }, {})
    return new Creature(genesMap)
}

describe('Mutations', function () {

    it('Mutation algorithm doesn`t modify original creature or its genes', function() {
        let creature = createFakeCreature(Genes.ESSENTIAL_GENES)
        const oldGenes = creature.genes
        let mutations = new MutationAlgorithm(creature)
        mutations.execute();

        assert.equal(oldGenes, creature.genes)
        assert.equal(oldGenes.length, creature.genes.length)
        assert.notEqual(mutations.genes, creature.genes)
    })

    it('Mutation algorithm modifies existing genes up', function() {
        const originalGenes = Genes.ESSENTIAL_GENES
        let creature = createFakeCreature(originalGenes, Genes.GENE_POWER_MIN)
        let mutations = new MutationAlgorithm(creature)
        mutations.mutateCurrentGenesUp()

        assert.isAbove(mutations.mutatedGenes.length, 0)
        assert.equal(mutations.gainedGenes.length, 0)
        assert.equal(mutations.lostGenes.length, 0)
        assert.equal(Object.values(mutations.genes).length, originalGenes.length)
        assert.isTrue(Object.values(mutations.genes).some(gene => gene.power > Genes.GENE_POWER_MIN))
    })

    it('Mutation algorithm modifies existing genes down', function() {
        const originalGenes = Genes.ESSENTIAL_GENES.concat([ Genes.GENE_FAT, Genes.GENE_REGENERATION ])
        let creature = createFakeCreature(originalGenes, Genes.GENE_POWER_MAX)
        let mutations = new MutationAlgorithm(creature)
        mutations.mutateCurrentGenesDown()

        assert.isAbove(mutations.mutatedGenes.length, 0)
        assert.equal(mutations.gainedGenes.length, 0)
        assert.equal(mutations.lostGenes.length, 0)
        assert.equal(Object.values(mutations.genes).length, originalGenes.length)
        assert.isTrue(Object.values(mutations.genes).some(gene => gene.power < Genes.GENE_POWER_MAX))
    })

    it('Mutation algorithm removes genes with minimal power', function() {
        const originalGenes = [ Genes.GENE_FAT ]
        let creature = createFakeCreature(originalGenes, Genes.GENE_POWER_MIN)
        let mutations = new MutationAlgorithm(creature)
        mutations.mutateCurrentGenesDown()

        assert.equal(mutations.mutatedGenes.length, 0)
        assert.equal(mutations.gainedGenes.length, 0)
        assert.isAbove(mutations.lostGenes.length, 0)
        assert.isBelow(Object.values(mutations.genes).length, originalGenes.length)
        assert.isFalse(Genes.GENE_FAT.id in mutations.genes)
    })

    it('Mutation algorithm can`t remove essential genes', function() {
        const originalGenes = Genes.ESSENTIAL_GENES
        let creature = createFakeCreature(originalGenes, Genes.GENE_POWER_MIN)
        let mutations = new MutationAlgorithm(creature)
        mutations.mutateCurrentGenesDown()

        assert.equal(mutations.mutatedGenes.length, 0)
        assert.equal(mutations.gainedGenes.length, 0)
        assert.equal(mutations.lostGenes.length, 0)
        assert.equal(Object.values(mutations.genes).length, originalGenes.length)
        assert.isTrue(Object.values(mutations.genes).every(gene => gene.power === Genes.GENE_POWER_MIN))
    })

    it('Mutation algorithm checks for exclusive genes', function() {
        const originalGenes = [ Genes.GENE_SCALES, Genes.GENE_FIRE_BREATH, Genes.GENE_BURNING_SKIN ]
        let creature = createFakeCreature(originalGenes)
        let mutations = new MutationAlgorithm(creature)
        
        assert.isTrue(mutations.creatureHasExclusiveGenes(Genes.GENE_SHELL))
        assert.isTrue(mutations.creatureHasExclusiveGenes(Genes.GENE_ACID_SPIT))
        assert.isTrue(mutations.creatureHasExclusiveGenes(Genes.GENE_ACID_SKIN))
        assert.isFalse(mutations.creatureHasExclusiveGenes(Genes.GENE_SPIKES))
        assert.isFalse(mutations.creatureHasExclusiveGenes(Genes.GENE_FAT))
        assert.isFalse(mutations.creatureHasExclusiveGenes(Genes.GENE_HERBIVORE))
    })

    it('Mutation algorithm adds new genes', function() {
        const originalGenes = Genes.ESSENTIAL_GENES
        let creature = createFakeCreature(originalGenes)
        let mutations = new MutationAlgorithm(creature)
        mutations.addNewGene()

        assert.equal(mutations.mutatedGenes.length, 0)
        assert.isAbove(mutations.gainedGenes.length, 0)
        assert.equal(mutations.lostGenes.length, 0)
        assert.isAbove(Object.values(mutations.genes).length, originalGenes.length)
    })

    it('Mutation algorithm ensures at least one feeding source is present', function() {
        const originalGenes = Genes.ESSENTIAL_GENES
        let creature = createFakeCreature(originalGenes)
        let mutations = new MutationAlgorithm(creature)
        mutations.ensureCreatureHasFoodSource()

        assert.isAbove(mutations.gainedGenes.length, 0)
        assert.isTrue(Genes.FEEDING_GENES.some(gene => gene.id in mutations.genes))
    })

    it('Mutation algorithm ensures that carnivores can attack', function() {
        const originalGenes = Genes.ESSENTIAL_GENES.concat([ Genes.GENE_CARNIVORE ])
        let creature = createFakeCreature(originalGenes)
        let mutations = new MutationAlgorithm(creature)
        mutations.ensureCarnivoreHasAttack()

        assert.isAbove(mutations.gainedGenes.length, 0)
        assert.isTrue(Genes.OFFENSIVE_GENES.some(gene => gene.id in mutations.genes))
        assert.isTrue(Object.values(mutations.genes).some(gene => gene.getAttack().damageSum() > 0))
    })

    it('Mutation algorithm ensures that non-carnivores don`t have offensive mutations', function() {
        const originalGenes = Genes.ESSENTIAL_GENES.concat([
            Genes.GENE_HERBIVORE,
            Genes.GENE_SCAVENGER,
            Genes.GENE_CLAWS,
            Genes.GENE_SCALES,
            Genes.GENE_ACID_SKIN,
        ])
        let creature = createFakeCreature(originalGenes)
        let mutations = new MutationAlgorithm(creature)
        mutations.removeOffensiveGenesIfNotCarnivore()

        assert.isAbove(mutations.lostGenes.length, 0)
        assert.isFalse(Genes.GENE_CLAWS.id in mutations.genes)
        assert.isTrue(Genes.GENE_SCALES.id in mutations.genes)
        assert.isTrue(Genes.GENE_ACID_SKIN.id in mutations.genes)
        assert.isFalse(Genes.OFFENSIVE_GENES.some(gene => gene.id in mutations.genes))
        assert.isFalse(Object.values(mutations.genes).some(gene => gene.getAttack().damageSum() > 0))
    })
})