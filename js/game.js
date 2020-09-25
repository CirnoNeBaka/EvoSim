'use strict'

import * as RNG from './rng.js'
import './world.js'
import './tile.js'
import './creature.js'
import { createBasicCreature } from './creature.js'

const BASE_CREATURE_COUNT = 10

class Game {
    constructor(world) {
        this.world = world
    }

    generateNewCreatures() {
        const creatureCount = this.world.creatures.length
        this.spawnWorms(Math.max(BASE_CREATURE_COUNT - creatureCount, 0))
    }

    spawnWorms(count) {
        for (let i = 0; i < count; ++i) {
            const worm = createBasicCreature()
            
            worm.x = RNG.rollInt(0, this.world.width - 1) 
            worm.y = RNG.rollInt(0, this.world.height - 1)

            this.world.creatures.push(worm)
            console.log(`Worm spawned!`, worm)
        }
    }

    processTurn() {
        console.log("===BEGIN TURN===")
        this.world.forEachTile((tile, x, y) => { tile.refresh(); })
        this.generateNewCreatures()

        let corpses = this.testSurvivalOfEveryone()
        this.cleanupDead(corpses)
        this.world.forEachCreature((creature) => { creature.energy = 0; })

        let speedSortedCreatures = this.world.creatures.sort((c1, c2) => { return c2.speed() - c1.speed() })
        for (let creature of speedSortedCreatures) {
            let currentTile = this.world.tile(creature.x, creature.y)
            let adjacentTiles = this.world.adjacentTiles(creature.x, creature.y)
            let newTile = creature.move(currentTile, adjacentTiles)
            creature.feed(newTile.food)
        }

        this.procreate()
        this.world.forEachCreature((creature) => { creature.age++ })
        console.log("===END TURN===")
    }

    testSurvival(creature) {
        if (creature.energy >= creature.energyConsumption())
            return true

        const energyDeficit = Math.max(0, creature.energyConsumption() - creature.energy)
        const survived = RNG.testDC(0, energyDeficit, creature.energyConsumption())
        return survived
    }

    testSurvivalOfEveryone() {
        let corpses = []
        for (let i = 0; i < this.world.creatures.length; ++i) {
            let creature = this.world.creatures[i]
            const survivedHunger = this.testSurvival(creature)
            const survivedOldAge = creature.age < creature.lifespan()
            const survived = survivedHunger && survivedOldAge
            if (!survived) {
                const reason = !survivedHunger ? "hunger" : "old age"
                console.log(`Creature at (${creature.x}, ${creature.y}) died from ${reason} with ${creature.energy}/${creature.energyConsumption()} energy`)
                creature.kill()
                let tile = this.world.tile(creature.x, creature.y)
                tile.food.carrion += creature.mass()
                corpses.push(creature)
            }
        }
        return corpses
    }

    procreate() {
        let newborns = []
        this.world.forEachCreature((creature) => {
            if (RNG.roll01(creature.divideChance())) {
                let child = creature.divide()
                newborns.push(child)
            }
        })
        for (let c of newborns)
            this.world.creatures.push(c)
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