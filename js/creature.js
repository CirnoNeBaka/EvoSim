'use strict'

import './genes.js'
import * as RNG from './rng.js'
import { Gene, ESSENTIAL_GENES, NON_ESSENTIAL_GENES, FEEDING_GENES, requiredGene } from './genes.js'

function cloneGenes(genes) {
    let result = {}
    for (let [ geneID, gene ] of Object.entries(genes)) {
        let geneCopy = Object.assign(new Gene({}), gene)
        result[geneID] = geneCopy
    }
    return result
}

function createBasicCreature() {
    let genes = ESSENTIAL_GENES.reduce((acc, gene) => {
        let geneInstance = new Gene(gene)
        acc[gene.id] = geneInstance
        return acc
    }, {})

    const feedingGene = RNG.randomElement(FEEDING_GENES)
    genes[feedingGene.id] = new Gene(feedingGene)

    let creature = new Creature(genes)
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
        this.generation = 0
        this.alive = true
    }

    hasGene(geneID) {
        return Object.keys(this.genes).includes(geneID)
    }

    genePower(geneID) {
        const gene = this.genes[geneID]
        return gene ? gene.power : 0
    }

    mass() {
        return this.genePower('MASS') * 10 + this.genePower('FAT') * 5
    }

    speed() {
        return Math.floor(Math.max(1, this.genes.SPEED.power * 10 - this.mass() / 2))
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

    move(currentTile, availableTiles, world) {
        if (!availableTiles.length)
            return currentTile;

        let tiles = availableTiles.concat(currentTile)
        tiles.sort((t1, t2) => {
            const score1 = this.tileFoodAttractiveness(t1, world)
            const score2 = this.tileFoodAttractiveness(t2, world)
            return score1 - score2
        })
        let bestTile = tiles[tiles.length - 1]
        this.x = bestTile.x
        this.y = bestTile.y
        if (bestTile != currentTile)
            console.log("Creature", this, "moved to", bestTile.x, bestTile.y)
        return bestTile
    }

    isHungry() {
        const needEnergy = this.energy < this.energyConsumption()
        const needFat = this.hasGene('FAT') && this.fat < this.fatCapacity()
        return needEnergy || needFat
    }

    canEat(foodType) {
        return requiredGene(foodType).id in this.genes
    }

    tileFoodAttractiveness(tile, world) {
        let score = tile.food.types().reduce((acc, type) => {
            return acc + (this.canEat(type) ? tile.food[type] : 0)
        }, 0)
        score /= Math.max(1, world.creaturesAt(tile.x, tile.y).length)
        return score
    }

    feed(food) {
        //console.log("feed:", food, `${this.energy}/${this.energyConsumption()}; ${this.fat}/${this.fatCapacity()}`)

        let consume = (deposit, limit) => {
            let energyDeficit = limit - this[deposit]
            for (let type of food.types()) {
                if (this.canEat(type)) {
                    const foodConsumed = Math.min(food[type], energyDeficit)
                    this[deposit] += foodConsumed
                    food[type] -= foodConsumed
                    energyDeficit -= foodConsumed
                }
            }
        }

        if (this.energy < this.energyConsumption())
            consume('energy', this.energyConsumption())

        if (this.hasGene('FAT')) {
            const energyDeficit = this.energyConsumption() - this.energy
            const energyGainedFromFat = Math.min(this.fat, energyDeficit)
            this.energy += energyGainedFromFat
            this.fat -= energyGainedFromFat

            consume('fat', this.fatCapacity())
        }

        //console.log("eaten:", food, `${this.energy}/${this.energyConsumption()}; ${this.fat}/${this.fatCapacity()}`)
        return food
    }

    divide() {
        let newGenes = cloneGenes(this.genes)
        const mutations = this.mutateGenes(newGenes)

        let child = new Creature(newGenes, this.x, this.y)
        child.generation = this.generation + 1
        //console.log("creature", this, "divided!", child)
        // if (mutations.mutatedGenes.length)
        //     console.log("New creature mutated in:", mutations.mutatedGenes.join(", "))
        // if (mutations.lostGenes.length)
        //     console.log("New creature lost genes:", mutations.lostGenes.join(", "))
        // if (mutations.gainedGenes.length)
        //     console.log("New creature gained genes:", mutations.gainedGenes.join(", "))
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

        // ensure creature has at least one feeding gene
        if (!FEEDING_GENES.some(gene => gene.ID in genes)) {
            let feedingGene = RNG.randomElement(FEEDING_GENES)
            genes[feedingGene.id] = new Gene(feedingGene)
            gainedGenes.push(feedingGene.id)
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
        description += ` ⌛${this.age}/${this.lifespan()}`
        description += ` 💚${this.energy}/${this.energyConsumption()}`
        description += ` 💛${this.fat}/${this.fatCapacity()}`
        description += ` 🐘${this.mass()}`
        description += ` 🦶${this.speed()}`

        description += ` GENES:`
        for (let gene of Object.values(this.genes))
            description += ` ${gene.icon}${gene.power}`
        
        description += ` G${this.generation}`

        return description
    }
}

export {
    Creature,
    createBasicCreature,
}