'use strict'

import * as RNG from './rng.js'
import './world.js'
import './tile.js'
import './creature.js'
import { createBasicCreature } from './creature.js'
import { Food } from './tile.js'

const BASE_CREATURE_COUNT = 10

class Game {
    constructor(world) {
        this.world = world
    }

    generateNewCreatures() {
        const creatureCount = this.world.creatures.length
        this.spawnWorms(Math.max(BASE_CREATURE_COUNT - creatureCount, 0))
        if (RNG.roll01(0.05))
            this.spawnWorms(1)
    }

    spawnWorms(count) {
        for (let i = 0; i < count; ++i) {
            const worm = createBasicCreature()
            
            const x = RNG.rollInt(0, this.world.width - 1)
            const y = RNG.rollInt(0, this.world.height - 1)
            worm.x = x
            worm.y = y

            this.world.addCreature(worm)
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

        let speedSortedCreatures = this.world.creatures.sort((c1, c2) => { return c2.speed() - c1.speed() })
        for (let creature of speedSortedCreatures) {
            let currentTile = this.world.tile(creature.x, creature.y)
            let adjacentTiles = this.world.adjacentTiles(creature.x, creature.y).filter(tile => {
                return tile.creatureMass + creature.mass() <= tile.creatureMassCapacity
            })

            let newTile = creature.move(currentTile, adjacentTiles, this.world)
            this.world.moveCreature(creature, currentTile, newTile)
        }

        this.feedCreatures()
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
//                const reason = !survivedHunger ? "hunger" : "old age"
//                 console.log(`Creature at (${creature.x}, ${creature.y}) died from ${reason} \
// with ${creature.energy}/${creature.energyConsumption()} energy \
// and ${creature.hp}/${creature.maxHP()} hp`)
                creature.kill()
                let tile = this.world.tile(creature.x, creature.y)
                tile.creatureMass -= creature.mass()
                tile.food.meat += creature.mass()
                corpses.push(creature)
            }
        }
        return corpses
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
            let hungryCreatures = creatures

            // First, everyone eats excess food.
            // Creatures with lower energy consumption eat first
            hungryCreatures.sort((c1, c2) => { return c1.energyConsumption() - c2.energyConsumption() })
            //console.log("FEEDING STARTS:", hungryCreatures, creatures)
            while (hungryCreatures.length) {
                const oldHungryCreaturesCount = hungryCreatures.length
                const guaranteedFood = new Food()
                const contestedFood = new Food()

                for (let type of tile.food.types()) {
                    const totalFood = tile.food[type]
                    const guaranteedAmount = Math.floor(totalFood / hungryCreatures.length)
                    guaranteedFood[type] = guaranteedAmount
                    contestedFood[type] = (guaranteedAmount > 0) ? (totalFood % guaranteedAmount) : totalFood
                }
                //console.log("CYCLE STARTS:", hungryCreatures.length, guaranteedFood, contestedFood)

                tile.food = contestedFood
                let satiatedCreatures = []
                for (let creature of hungryCreatures) {
                    let foodCopy = new Food(guaranteedFood)
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

    procreate() {
        let newborns = []
        this.world.forEachCreature((creature) => {
            let tile = this.world.tile(creature.x, creature.y)
            if (RNG.roll01(creature.divideChance())) {
                let child = creature.divide()
                newborns.push(child)
            }
        })
        for (let c of newborns)
            this.world.addCreature(c)
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