'use strict'

import * as RNG from './rng.js'
import * as Food from './food.js'
import './world.js'
import './tile.js'
import './creature.js'
import { createBasicCreature } from './creature.js'
import { FoodStorage } from './tile.js'
import { Hunt } from './fight.js'
import { MovementAlgorithm } from './rules/movement.js'
import { FEEDING_GENES, GENE_CARNIVORE, GENE_HERBIVORE, GENE_LEGS, GENE_SCAVENGER, NON_ESSENTIAL_GENES } from './genes.js'

const BASE_CREATURE_COUNT = 10

class Game {
    constructor(world) {
        this.world = world
    }

    generateNewCreatures() {
        const creatureCount = this.world.creatures.length
        this.spawnWorms(Math.max(BASE_CREATURE_COUNT - creatureCount, 0))
        if (RNG.roll01(0.1))
            this.spawnWorms(10)
    }

    spawnWorms(count) {
        for (let i = 0; i < count; ++i) {
            const x = RNG.rollInt(0, this.world.width - 1)
            const y = RNG.rollInt(0, this.world.height - 1)
            const tile = this.world.tile(x, y)
            const movementType = tile.movementTypes ? RNG.randomElement(
                NON_ESSENTIAL_GENES.filter(gene =>
                    gene.movementTypes &&
                    gene.movementTypes.some(type => tile.movementTypes.includes(type))
                )
            ) : GENE_LEGS
            const feedingGene = RNG.randomElement(FEEDING_GENES)
            const worm = createBasicCreature(feedingGene, movementType)
            this.world.addCreature(worm, x, y)
            //console.log(`Worm spawned!`, worm)
        }
    }

    processTurn() {
        //console.log("===BEGIN TURN===")
        this.world.forEachTile((tile) => { tile.refresh(); })
        this.generateNewCreatures()

        let corpses = this.testSurvivalOfEveryone()
        this.cleanupDead(corpses)
        this.world.forEachCreature((creature) => { creature.energy = 0; })

        this.moveCreatures()
        this.feedCreatures()
        this.hunt()
        this.procreate()
        this.world.forEachCreature((creature) => { creature.age++ })
        //console.log("===END TURN===")
    }

    testSurvival(creature) {
        creature.hp = Math.min(creature.maxHP(), creature.hp + creature.regeneration())

        if (creature.energy >= creature.energyConsumption())
            return true

        const energyDeficit = Math.max(0, creature.energyConsumption() - creature.energy)
        creature.hp -= energyDeficit
        const survived = creature.hp > 0
        //const hpDeficit = creature.maxHP() - creature.hp
        //const survived = RNG.testDC(0, hpDeficit, creature.maxHP())
        return survived
    }

    testSurvivalOfEveryone() {
        let corpses = []
        for (let creature of this.world.creatures) {
            const survivedHunger = this.testSurvival(creature)
            const survivedOldAge = creature.age < creature.lifespan()
            const survived = survivedHunger && survivedOldAge
            if (!survived) {
                creature.kill()
                let tile = this.world.tile(creature.x, creature.y)
                tile.creatureMass -= creature.mass()
                tile.food[Food.CARRION] += creature.mass()
                corpses.push(creature)
            }
        }
        return corpses
    }

    moveCreatures() {
        let speedSortedCreatures = this.world.creatures.sort((c1, c2) => { return c1.speed() - c2.speed() })
        for (let creature of speedSortedCreatures) {
            let movement = new MovementAlgorithm(creature, this.world)
            movement.execute()
        }
    }

    feedCreatures() {
        let populatedTiles = new Map()
        this.world.forEachTile((tile, x, y) => {
            let creatures = this.world.creaturesAt(x, y)
            if (!creatures.length)
                return
            populatedTiles.set(tile, creatures)
        })

        for (let [ tile, creatures ] of populatedTiles.entries()) {
            //let hungryCreatures = creatures.slice // ЗАГАДКА ДЫРЫ: копирование массива не работает!!! В результирующем массиве length == 0!
            let hungryCreatures = creatures.filter(c => c.hasGene(GENE_HERBIVORE.id) || c.hasGene(GENE_SCAVENGER.id))

            // First, everyone eats excess food.
            // Creatures with lower energy consumption eat first
            hungryCreatures.sort((c1, c2) => { return c1.energyConsumption() - c2.energyConsumption() })
            //console.log("FEEDING STARTS:", hungryCreatures, creatures)
            while (hungryCreatures.length) {
                const oldHungryCreaturesCount = hungryCreatures.length
                const guaranteedFood = new FoodStorage()
                const contestedFood = new FoodStorage()

                for (let type of Food.TYPES) {
                    const totalFood = tile.food[type]
                    const guaranteedAmount = Math.floor(totalFood / hungryCreatures.length)
                    guaranteedFood[type] = guaranteedAmount
                    contestedFood[type] = (guaranteedAmount > 0) ? (totalFood % guaranteedAmount) : totalFood
                }
                //console.log("CYCLE STARTS:", hungryCreatures.length, guaranteedFood, contestedFood)

                tile.food = contestedFood
                let satiatedCreatures = []
                for (let creature of hungryCreatures) {
                    let foodCopy = new FoodStorage(guaranteedFood)
                    let remains = creature.feed(foodCopy)
                    for (let type of tile.food.types())
                        tile.food[type] += remains[type]
                    if (!creature.isHungry())
                        satiatedCreatures.push(creature)
                }

                for (let creature of satiatedCreatures)
                    hungryCreatures.splice(hungryCreatures.indexOf(creature), 1)

                if (oldHungryCreaturesCount === hungryCreatures.length)
                    break;
            }
            // Then, if some creatures are still hungry, they compete for the remaining food.
            if (hungryCreatures.length) {
                //console.log("COMPETITION STARTS:", hungryCreatures)
                hungryCreatures.sort((c1, c2) => { return c2.speed() - c1.speed() })
                for (let creature of hungryCreatures) {
                    creature.feed(tile.food)
                }
            }
        }
    }

    hunt() {
        for (let hunter of this.world.creatures) {
            if (hunter.attack().damageSum() > 0 &&
                hunter.hasGene(GENE_CARNIVORE.id) &&
                hunter.isHungry()) {
                let prey = Hunt.choosePrey(hunter, this.world)
                if (!prey)
                    continue
                const attackDamage = hunter.attack().subtract(prey.defence())
                const retributionDamage = prey.retribution()
                    .add(prey.attack())
                    .subtract(hunter.defence())
                prey.hp -= attackDamage.damageSum()
                hunter.hp -= retributionDamage.damageSum()
                let food = new FoodStorage({ meat: 0 })
                if (prey.hp <= 0) {
                    prey.kill()
                    food.meat += prey.deathMeat()
                    //console.log(prey, "was killed by", hunter, "for", food.meat, "meat")
                    this.world.creatures.splice(this.world.creatures.indexOf(prey), 1)
                }
                if (hunter.hp <= 0) {
                    hunter.kill()
                    //console.log("hunter", hunter, "died attacking")
                    food.meat += hunter.deathMeat()
                    this.world.creatures.splice(this.world.creatures.indexOf(hunter))
                }
                //console.log(hunter, 'attacked', prey, "dealt", attackDamage, 'took', retributionDamage, 'gained meat', food.meat)
                if (hunter.alive) {
                    hunter.feed(food)
                }
                let tile = this.world.tile(hunter.x, hunter.y)
                tile.food.carrion += food.meat
            }
        }
    }

    procreate() {
        let newborns = []
        this.world.forEachCreature((creature) => {
            if (RNG.roll01(creature.divideChance())) {
                let child = creature.divide()
                if (child.canMoveTo(this.world.tile(child.x, child.y)))
                    newborns.push(child)
            }
        })
        for (let c of newborns)
            this.world.addCreature(c, c.x, c.y)
    }

    cleanupDead(corpses) {
        for (let i = 0; i < corpses.length; ++i) {
            let creatures = this.world.creatures
            const index = creatures.indexOf(corpses[i])
            creatures.splice(index, 1)
        }
    }
}

export {
    Game
}