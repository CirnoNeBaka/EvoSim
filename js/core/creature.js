'use strict'

import './genes.js'
import * as RNG from './rng.js'
import { Gene, cloneGenes, ESSENTIAL_GENES, FEEDING_GENES, requiredGene, GENE_CARNIVORE, OFFENSIVE_GENES, GENE_LEGS } from './genes.js'
import * as Fight from './fight.js'
import * as Rules from './rules/mutation.js'
import { Universe } from './universe.js'
import { createIcon } from '../view/utils.js'

function createBasicCreature(feedingGene, movementGene = GENE_LEGS) {
    let genes = ESSENTIAL_GENES.reduce((acc, gene) => {
        let geneInstance = new Gene(gene)
        acc[gene.id] = geneInstance
        return acc
    }, {})

    if (!feedingGene)
        feedingGene = RNG.randomElement(FEEDING_GENES)

    genes[feedingGene.id] = new Gene(feedingGene)
    genes[movementGene.id] = new Gene(movementGene)

    if (feedingGene.id === GENE_CARNIVORE.id) {
        let offensiveGene = RNG.randomElement(OFFENSIVE_GENES)
        genes[offensiveGene.id] = new Gene(offensiveGene)
    }

    let creature = new Creature(genes)
    if (!creature.movementTypes().size)
        throw Error("WTF?!", creature, feedingGene, movementGene)
    return creature
}

let CREATURE_ID_COUNTER = 0
function generateID() {
    if (CREATURE_ID_COUNTER >= Number.MAX_SAFE_INTEGER)
        CREATURE_ID_COUNTER = 0
    return CREATURE_ID_COUNTER++
}

class Creature {
    constructor(genes, x = 0, y = 0) {
        this.id = generateID()
        this.x = x
        this.y = y
        
        this.genes = cloneGenes(genes)
        Object.defineProperty(this, 'genes', { writable: false })
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
        stats.bioMass = this.genePower('MASS') * 10 + this.genePower('FAT') * 5
        stats.mass = stats.bioMass + Object.values(this.genes).reduce((acc, gene) => {
            return acc + gene.power * (gene.massCost || 0)
        }, 0)
        stats.maxHP = this.genePower('MASS') * 25
        stats.speed = Math.floor(Math.max(1, this.genePower('SPEED') * 10 - stats.mass / 2))
        stats.regeneration = 5 + this.genePower('REGENERATION') * 10
        stats.energyConsumption = stats.bioMass + Object.values(this.genes).reduce((acc, gene) => {
            return acc + gene.power * gene.energyCost
        }, 0) + (this.movementTypes().size - 1) * 10
    
        stats.fatCapacity = this.hasGene('FAT') ? this.genePower('FAT') * 25 : 0
        stats.lifespan = this.genePower('LONGEVITY') * 10
        stats.divideChance = this.genePower('FERTILITY') / 10.0

        stats.attack      = Object.values(this.genes).reduce((acc, gene) => { return acc.add(gene.getAttack()) }, new Fight.Damage())
        stats.defence     = Object.values(this.genes).reduce((acc, gene) => { return acc.add(gene.getDefence()) }, new Fight.Damage())
        stats.retribution = Object.values(this.genes).reduce((acc, gene) => { return acc.add(gene.getRetribution()) }, new Fight.Damage())

        this.basicStats = stats
        for (let key of Object.keys(stats))
            Object.defineProperty(this.basicStats, key, { writable: false })
        Object.defineProperty(this, 'basicStats', { writable: false })
    }

    generateFoodEfficiency() {
        const totalFoodGenesScore = FEEDING_GENES.reduce((acc, gene) => { return acc + this.genePower(gene.id) }, 0)
        const myFeedingGenes = FEEDING_GENES.filter(gene => this.hasGene(gene.id))
        const isSpecialized = myFeedingGenes.length === 1
        const specializationBonus = Universe.food.specializtionBonus(isSpecialized ? this.genePower(myFeedingGenes[0].id) : 0)
        return FEEDING_GENES.reduce((result, gene) => {
            result[gene.foodType] = (this.genePower(gene.id) / totalFoodGenesScore)
                * specializationBonus
            return result
        }, {})
    }

    hasGene(gene) {
        const geneID = gene.id ? gene.id : gene
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

    movementTypes() {
        return Object.values(this.genes).reduce((acc, gene) => {
            if (gene.movementTypes)
                for (let type of gene.movementTypes)
                    acc.add(type)
            return acc
        }, new Set())
    }

    canMoveTo(tile) {
        const thisTypes = this.movementTypes()
        return tile.movementTypes.some(type => thisTypes.has(type))
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

    move(tile) {
        this.x = tile.x
        this.y = tile.y
    }

    energyDeficit() {
        return this.energyConsumption() - this.energy
    }

    fatDeficit() {
        return this.fatCapacity() - this.fat
    }

    isHungry() {
        const needEnergy = this.energy < this.energyConsumption()
        const needFat = this.fat < this.fatCapacity()
        return needEnergy || needFat
    }

    canEat(foodType) {
        return this.hasGene(requiredGene(foodType).id)
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
                    this[deposit] += Math.min(energyGained, limit)
                    energyDeficit -= Math.max(0, energyGained)
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
        let mutations = new Rules.MutationAlgorithm(this)
        mutations.execute()
        const newGenes = mutations.genes

        let child = new Creature(newGenes, this.x, this.y)
        child.generation = this.generation + 1
      
        // console.log("creature", this, "divided!", child)
        // if (mutations.mutatedGenes.length)
        //     console.log("New creature mutated in:", mutations.mutatedGenes.join(", "))
        // if (mutations.lostGenes.length)
        //     console.log("New creature lost genes:", mutations.lostGenes.join(", "))
        // if (mutations.gainedGenes.length)
        //     console.log("New creature gained genes:", mutations.gainedGenes.join(", "))
        return child
    }

    kill() {
        this.alive = false
    }

    deathMeat() {
        return this.basicStats.bioMass * 2
    }
}

export {
    Creature,
    createBasicCreature,
}
