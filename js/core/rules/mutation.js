'use strict'

import * as RNG from '../rng.js'
import { Gene, cloneGenes } from '../genes.js'
import * as Genes from '../genes.js'
import { Universe } from '../universe.js'

export class MutationAlgorithm {
    constructor(creature) {
        this.creature = creature
        this.genes = cloneGenes(creature.genes)

        this.mutatedGenes = []
        this.gainedGenes = []
        this.lostGenes = []
    }

    execute() {
        if (RNG.roll01(Universe.genes.mutationChance))
            if (RNG.coinFlip())
                this.mutateCurrentGenesUp()
            else
                this.mutateCurrentGenesDown()

        if (RNG.roll01(Universe.genes.gainGeneChance))
            this.addNewGene()

        this.ensureCreatureHasFoodSource()
        this.ensureCarnivoreHasAttack()
        this.removeOffensiveGenesIfNotCarnivore()
    }

    mutateCurrentGenesUp() {
        let gene = RNG.randomElement(
            Object.values(this.genes)
                .filter(gene => gene.power < Genes.GENE_POWER_MAX)
        )
        if (gene) {
            gene.mutateUp()
            this.mutatedGenes.push(gene.id)
        }
    }

    mutateCurrentGenesDown() {
        let gene = RNG.randomElement(
            Object.values(this.genes)
                .filter(gene => !gene.isEssential || gene.power > Genes.GENE_POWER_MIN)
        )
        if (gene) {
            gene.mutateDown()
            if (gene.isDead()) {
                this.lostGenes.push(gene.id)
                delete this.genes[gene.id]
            } else {
                this.mutatedGenes.push(gene.id)
            }
        }
    }

    creatureHasExclusiveGenes(newGene) {
        if (!newGene.exclusiveFlags)
            return false
        return Object.values(this.genes).some((gene) => {
            if (!gene.exclusiveFlags)
                return false
            return gene.exclusiveFlags.some((flag) => {
                return newGene.exclusiveFlags.includes(flag)
            })
        })
    }

    addNewGene() {
        const acceptableGenes = Genes.NON_ESSENTIAL_GENES
            .filter(gene => !this.creature.hasGene(gene.id))
            .filter(gene => !this.creatureHasExclusiveGenes(gene))
            .filter(gene => !gene.attack || this.creature.hasGene(Genes.GENE_CARNIVORE.id)) // only carnivores are allowed to gain offensive mutations
            .map(gene => new Gene(gene))
        if (acceptableGenes.length) {
            let newGene = RNG.randomElement(acceptableGenes)
            this.genes[newGene.id] = newGene
            this.gainedGenes.push(newGene.id)
        }
    }

    ensureCreatureHasFoodSource() {
        // ensure creature has at least one feeding gene
        if (!Genes.FEEDING_GENES.some(gene => gene.id in this.genes)) {
            const feedingGene = RNG.randomElement(Genes.FEEDING_GENES)
            this.genes[feedingGene.id] = new Gene(feedingGene)
            this.gainedGenes.push(feedingGene.id)
        }
    }

    ensureCarnivoreHasAttack() {
        // if a creature gains a carnivore mutation ensure that it can attack
        if (Genes.GENE_CARNIVORE.id in this.genes && this.creature.attack().damageSum() === 0) {
            const offensiveGene = RNG.randomElement(Genes.OFFENSIVE_GENES)
            this.genes[offensiveGene.id] = new Gene(offensiveGene)
            this.gainedGenes.push(offensiveGene.id)
        }
    }

    removeOffensiveGenesIfNotCarnivore() {
        // if a creature loses carnivore mutation it also loses all offensive mutations
        if (!(Genes.GENE_CARNIVORE.id in this.genes) && this.creature.attack().damageSum() > 0) {
            for (let gene of Genes.OFFENSIVE_GENES) {
                if (gene.id in this.genes) {
                    delete this.genes[gene.id]
                    this.lostGenes.push(gene.id)
                }
            }
        }
    }
}
