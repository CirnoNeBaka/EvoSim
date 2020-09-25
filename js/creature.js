'use strict'

import './genes.js'
import * as RNG from './rng.js'
import { Gene, ESSENTIAL_GENES, NON_ESSENTIAL_GENES } from './genes.js'

function cloneGenes(genes) {
    let result = {}
    for (let [ geneID, gene ] of Object.entries(genes)) {
        let geneCopy = Object.assign(new Gene({}), gene)
        result[geneID] = geneCopy
    }
    return result
}

function createBasicCreature() {
    const essentialGeneMap = ESSENTIAL_GENES.reduce((acc, gene) => {
        let geneInstance = new Gene(gene)
        acc[gene.id] = geneInstance
        return acc
    }, {})

    let creature = new Creature(essentialGeneMap)
    creature.energy = creature.energyConsumption()
    creature.hp = creature.mass()
    return creature
}

class Creature {
    constructor(genes, x = 0, y = 0) {
        this.x = x
        this.y = y
        this.genes = cloneGenes(genes)
        this.hp = this.mass()
        this.energy = this.energyConsumption()
        this.fat = 0
        this.age = 0
        this.alive = true
    }

    hasGene(geneID) {
        return Object.keys(this.genes).includes(geneID)
    }

    mass() {
        return this.genes.MASS.power * 10
    }

    speed() {
        return Math.max(1, this.genes.SPEED.power * 10 - this.mass() / 2) 
    }

    energyConsumption() {
        return this.mass() + Object.values(this.genes).reduce((acc, gene) => { return acc + gene.power * gene.energyCost }, 0)
    }

    fatCapacity() {
        if (!this.hasGene('FAT'))
            return 0
        return this.genes.FAT.power * 10
    }

    divideChance() {
        if (this.age <= 1)
            return 0 // to prevent exponential zerg rush
        return this.genes.FERTILITY.power / 10.0
    }

    lifespan() {
        return this.genes.LONGEVITY.power * 10
    }

    move(currentTile, availableTiles) {
        if (!availableTiles.length)
            return currentTile;
        // everyone is a lazy herbivore yet
        if (currentTile.food.plant >= this.energyConsumption())
            return currentTile;

        let tiles = availableTiles.concat(currentTile)
        tiles.sort((t1, t2) => {
            const score1 = t1.food.plant
            const score2 = t2.food.plant
            return score1 - score2
        })
        let bestTile = tiles[tiles.length - 1]
        this.x = bestTile.x
        this.y = bestTile.y
        return bestTile
    }

    feed(food) {
        // everyone is a herbivore yet
        const plantFoodConsumed = Math.min(food.plant, this.energyConsumption())
        this.energy += plantFoodConsumed
        food.plant -= plantFoodConsumed

        if (this.genes.FAT) {
            const energyDeficit = this.energyConsumption() - this.energy
            if (energyDeficit > 0) {
                const energyGainedFromFat = Math.min(this.fat, energyDeficit)
                this.fat -= energyGainedFromFat
                this.energy += energyGainedFromFat
            }

            const freeFatCapacity = this.fatCapacity() - this.fat
            const addEnergyToFat = Math.min(food.plant, freeFatCapacity)
            this.fat += addEnergyToFat
            food.plant -= addEnergyToFat
        }
        //console.log(this, "eaten", plantFoodConsumed, "; Left:", food)
    }

    divide() {
        let newGenes = cloneGenes(this.genes)
        const mutations = this.mutateGenes(newGenes)

        let child = new Creature(newGenes, this.x, this.y)
        //console.log("creature", this, "divided!", child)
        if (mutations.mutatedGenes.length)
            console.log("New creature mutated in:", mutations.mutatedGenes.join(", "))
        if (mutations.lostGenes.length)
            console.log("New creature lost genes:", mutations.lostGenes.join(", "))
        if (mutations.gainedGenes.length)
            console.log("New creature gained genes:", mutations.gainedGenes.join(", "))
        return child
    }

    mutateGenes(genes) {
        const MUTATION_CHANCE = 0.1
        const NEW_GENE_CHANCE = 0.1
        
        let mutatedGenes = []
        let gainedGenes = []
        let lostGenes = []
        
        for (let gene of Object.values(genes)) {
            if (gene.mutate(MUTATION_CHANCE)) {
                if (gene.isDead()) {
                    lostGenes.push(gene.id)
                    delete genes[gene.id]
                } else {
                    mutatedGenes.push(gene.id)
                }
            }
        }

        if (RNG.roll01(NEW_GENE_CHANCE)) {
            let acceptableGenes = NON_ESSENTIAL_GENES
                .filter(gene => !this.hasGene(gene.id))
                .map(gene => new Gene(gene));
            if (acceptableGenes.length) {
                let newGene = RNG.randomElement(acceptableGenes)
                genes[newGene.id] = newGene
                gainedGenes.push(newGene.id)
            }
        }

        return {
            mutatedGenes : mutatedGenes,
            gainedGenes: gainedGenes,
            lostGenes : lostGenes
        }
    }

    kill() {
        this.alive = false
    }

    toString() {
        let description = ``
        description += `💚: ${this.energy}/${this.energyConsumption()}`
        description += `💛: ${this.fat}/${this.fatCapacity()}`
        for (let gene of Object.values(this.genes))
            description += `${gene.icon}: ${gene.power}`
        description += `      ⌛: ${this.age}/${this.lifespan()}`
        
        return description
    }
}

export {
    Creature,
    createBasicCreature,
}