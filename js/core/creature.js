'use strict'

import './genes.js'
import * as RNG from './rng.js'
import { Gene, ESSENTIAL_GENES, NON_ESSENTIAL_GENES, FEEDING_GENES, requiredGene, GENE_CARNIVORE, OFFENSIVE_GENES } from './genes.js'
import { Damage } from './fight.js'
import * as Fight from './fight.js'
import { createIcon } from '../view/utils.js'

function cloneGenes(genes) {
    let result = {}
    for (let [ geneID, gene ] of Object.entries(genes)) {
        let geneCopy = Object.assign(new Gene({}), gene)
        result[geneID] = geneCopy
    }
    return result
}

function createBasicCreature(feedingGene) {
    let genes = ESSENTIAL_GENES.reduce((acc, gene) => {
        let geneInstance = new Gene(gene)
        acc[gene.id] = geneInstance
        return acc
    }, {})

    if (!feedingGene)
        feedingGene = RNG.randomElement(FEEDING_GENES)
    genes[feedingGene.id] = new Gene(feedingGene)    
    if (feedingGene.id === GENE_CARNIVORE.id) {
        let offensiveGene = RNG.randomElement(OFFENSIVE_GENES)
        genes[offensiveGene.id] = new Gene(offensiveGene)
    }

    let creature = new Creature(genes)
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
        }, 0)
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
        const specializationBonus = 1.0 + ((myFeedingGenes.length === 1) ? (0.05 * (this.genePower(myFeedingGenes[0].id) - 1)) : 0.0)
        console.log("specializationBonus:", specializationBonus)
        return FEEDING_GENES.reduce((result, gene) => {
            result[gene.foodType] = (this.genePower(gene.id) / totalFoodGenesScore) * specializationBonus
            return result
        }, {})
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

    energyDeficit() {
        return this.energyConsumption() - this.energy
    }

    fatDeficit() {
        return this.fatCapacity() - this.fat
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
        const creatures = world.creaturesAt(tile.x, tile.y)
        score /= Math.max(1, creatures.length)
        if (tile.x !== this.x && tile.y !== this.y)
            score++
        if (this.hasGene(GENE_CARNIVORE.id))
            score += creatures.length
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

        let checkExclusiveGenes = (newGene) => {
            if (!newGene.exclusiveFlags)
                return true
            return Object.values(this.genes).every((gene) => {
                if (!gene.exclusiveFlags)
                    return true
                return !gene.exclusiveFlags.some((flag) => {
                    return newGene.exclusiveFlags.includes(flag)
                })
            })
        }

        if (RNG.roll01(NEW_GENE_CHANCE)) {
            let acceptableGenes = NON_ESSENTIAL_GENES
                .filter(gene => !this.hasGene(gene.id))
                .filter(gene => checkExclusiveGenes(gene))
                .filter(gene => !gene.attack || this.hasGene(GENE_CARNIVORE.id)) // only carnivores are allowed to gain offensive mutations
                .map(gene => new Gene(gene))
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

        // if a creature gains a carnivore mutation ensure that it can attack
        if (gainedGenes.includes(GENE_CARNIVORE.id) && this.attack().damageSum() == 0) {
            let offensiveGene = RNG.randomElement(OFFENSIVE_GENES)
            genes[offensiveGene.id] = new Gene(offensiveGene)
            gainedGenes.push(offensiveGene.id)
        }

        // if a creature loses carnivore mutation it also loses all offensive mutations
        if (lostGenes.includes(GENE_CARNIVORE.id)) {
            for (let gene of OFFENSIVE_GENES) {
                if (gene.id in this.genes) {
                    delete this.genes[gene.id]
                    lostGenes.push(gene.id)
                }
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

    deathMeat() {
        return this.basicStats.bioMass * 2
    }
}

export {
    Creature,
    createBasicCreature,
}
