'use strict'

import * as RNG from './rng.js'
import './world.js'
import './tile.js'
import './creature.js'
import { createBasicCreature } from './creature.js'

const BASE_CREATURE_COUNT = 50

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
        for (let i = 0; i < speedSortedCreatures.length; ++i) {
            let creature = speedSortedCreatures[i]
            let currentTile = this.world.tile(creature.x, creature.y)
            let newTile = creature.move(currentTile, this.world.adjacentTiles(creature.x, creature.y))
            creature.feed(newTile.food)
        }

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
            const survived = this.testSurvival(creature)
            if (survived) {
                //console.log(`Creature at (${creature.x}, ${creature.y}) survived with ${creature.energy}/${creature.energyConsumption()} energy`)
                continue
            }

            console.log(`Creature at (${creature.x}, ${creature.y}) died from hunger with ${creature.energy}/${creature.energyConsumption()} energy`)
            creature.kill()
            let tile = this.world.tile(creature.x, creature.y)
            tile.food.carrion += creature.mass()
            corpses.push(creature)
        }
        return corpses
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