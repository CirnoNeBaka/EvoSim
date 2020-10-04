'use strict'

import './genes.js'
import * as RNG from './rng.js'
import { Gene, ESSENTIAL_GENES, NON_ESSENTIAL_GENES, FEEDING_GENES, requiredGene } from './genes.js'
import { Damage } from './fight.js'
import * as Fight from './fight.js'

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
    return creature
}

class Creature {
    constructor(genes, x = 0, y = 0) {
        this.x = x
        this.y = y
        
        this.genes = cloneGenes(genes)
        this.createBasicStats()

        this.alive = true
        this.hp = this.maxHP()
        this.energy = this.energyConsumption()
        this.fat = 0
        this.age = 0
        this.generation = 0        
    }

    // basic stats depend only on genes and remain constant during a creature's life
    createBasicStats() {
        let stats = {}
        
        stats.foodEfficiency = this.generateFoodEfficiency()
        stats.mass = this.genePower('MASS') * 10 + this.genePower('FAT') * 5
        stats.maxHP = this.genePower('MASS') * 25
        stats.speed = Math.floor(Math.max(1, this.genePower('SPEED') * 10 - stats.mass / 2))
        stats.regeneration = this.genePower('REGENERATION') * 10
        stats.energyConsumption = stats.mass + Object.values(this.genes).reduce((acc, gene) => { return acc + gene.power * gene.energyCost }, 0)
        stats.fatCapacity = this.hasGene('FAT') ? this.genePower('FAT') * 25 : 0
        stats.lifespan = this.genePower('LONGEVITY') * 10
        stats.divideChance = this.genePower('FERTILITY') / 10.0

        try {
        stats.attack      = Object.values(this.genes).reduce((acc, gene) => { acc.add(gene.getAttack());      return acc }, new Fight.Damage())
        stats.defence     = Object.values(this.genes).reduce((acc, gene) => { acc.add(gene.getDefence());     return acc }, new Fight.Damage())
        stats.retribution = Object.values(this.genes).reduce((acc, gene) => { acc.add(gene.getRetribution()); return acc }, new Fight.Damage())
        } catch (e) {
            console.warn(this.genes)
            throw e
        }
        
        this.basicStats = stats
        for (let key of Object.keys(stats))
            Object.defineProperty(this.basicStats, key, { writable: false })
        Object.defineProperty(this, 'basicStats', { writable: false })
    }

    generateFoodEfficiency() {
        const totalFoodGenesScore = FEEDING_GENES.reduce((acc, gene) => { return acc + this.genePower(gene.id) }, 0)
        return FEEDING_GENES.reduce((result, gene) => { result[gene.foodType] = this.genePower(gene.id) / totalFoodGenesScore; return result }, {})
    }

    hasGene(geneID) {
        return Object.keys(this.genes).includes(geneID)
    }

    genePower(geneID) {
        const gene = this.genes[geneID]
        return gene ? gene.power : 0
    }

    mass() {
        return this.basicStats.mass
    }

    maxHP() {
        return this.basicStats.maxHP
    }

    regeneration() {
        const canRegenerate = this.energy >= this.energyConsumption()
        const rate = canRegenerate ? this.basicStats.regeneration : 0
        return rate
    }

    speed() {
        return this.basicStats.speed
    }

    energyConsumption() {
        return this.basicStats.energyConsumption
    }

    fatCapacity() {
        return this.basicStats.fatCapacity
    }

    divideChance() {
        if (this.age <= 1)
            return 0 // to prevent exponential zerg rush
        if (this.energy < this.energyConsumption())
            return 0
        let chance = this.basicStats.divideChance
        const energyDeficit = (this.energyConsumption() - this.energy) / this.energyConsumption()
        chance = chance * Math.pow(1.0 - energyDeficit, 2)
        //console.log("Divide chance:", chance.toFixed(2), "deficit:", energyDeficit.toFixed(2))
        return chance
    }

    lifespan() {
        return this.basicStats.lifespan
    }

    attack() {
        return this.basicStats.attack
    }

    defence() {
        return this.basicStats.defence
    }

    retribution() {
        return this.basicStats.retribution
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
        // if (bestTile != currentTile)
        //     console.log("Creature", this, "moved to", bestTile.x, bestTile.y)
        return bestTile
    }

    isHungry() {
        const needEnergy = this.energy < this.energyConsumption()
        const needFat = this.hasGene('FAT') && this.fat < this.fatCapacity()
        return needEnergy || needFat
    }

    canEat(foodType) {
        return this.hasGene(requiredGene(foodType).id)
    }

    tileFoodAttractiveness(tile, world) {
        let score = tile.food.types().reduce((acc, type) => {
            return acc + (this.canEat(type) ? this.energyGain(type, tile.food[type]) : 0)
        }, 0)
        score /= Math.max(1, world.creaturesAt(tile.x, tile.y).length)
        if (tile.x !== this.x && tile.y !== this.y)
            score++
        return score
    }

    energyGain(foodType, foodAmount) {
        return Math.round(this.basicStats.foodEfficiency[foodType] * foodAmount)
    }

    feed(food) {
        //console.log("feed:", food, `${this.energy}/${this.energyConsumption()}; ${this.fat}/${this.fatCapacity()}`)

        let consume = (deposit, limit) => {
            let energyDeficit = limit - this[deposit]
            for (let type of food.types()) {
                if (this.canEat(type)) {
                    const foodConsumed = Math.min(food[type], energyDeficit)
                    const energyGained = this.energyGain(type, foodConsumed)
                    //console.log(`Consumed ${foodConsumed} ${type.toString()} as ${energyGained} energy`, this.foodEfficiency)
                    food[type] -= foodConsumed
                    this[deposit] += energyGained
                    energyDeficit -= energyGained
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
        if (!FEEDING_GENES.some(gene => gene.id in genes)) {
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
        description += ` 💖${this.hp}/${this.maxHP()}`
        description += ` 💙${this.energy}/${this.energyConsumption()}`
        description += ` 💛${this.fat}/${this.fatCapacity()}`
        description += ` 🐘${this.mass()}`
        description += ` 🦶${this.speed()}`

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