'use strict'

import * as RNG from './rng.js'
import './world.js'
import './tile.js'
import './creature.js'
import { createBasicCreature } from './creature.js'

class Game {
    constructor(world) {
        this.world = world
    }

    spawnWorms(count) {
        for (let i = 0; i < count; ++i) {
            const worm = createBasicCreature()
            
            worm.x = RNG.roll(0, this.world.width) 
            worm.y = RNG.roll(0, this.world.height)

            this.world.creatures.push(worm)
        }
    }

    processTurn() {
        this.world.forEachTile((tile, x, y) => { tile.refresh(); })

        let corpses = this.testSurvivalOfEveryone()
        this.cleanupDead(corpses)

        let speedSortedCreatures = this.world.creatures.sort((c1, c2) => { return c1.speed() - c2.speed() })
        for (let i = 0; i < speedSortedCreatures.length; ++i) {
            let creature = speedSortedCreatures[i]
            this.feedCreature(creature)
        }
    }

    feedCreature(creature) {
        if (!creature.alive)
            return;
        let tile = this.world.tile(creature.x, creature.y)
        creature.feed(tile.food)
    }

    testSurvival(creature) {
        if (creature.energy >= creature.energyConsumption())
            return true

        const energyDeficit = creature.energyConsumption() - creature.energy
        const survived = RNG.testDC(0, energyDeficit, creature.energyConsumption())
        return survived
    }

    testSurvivalOfEveryone() {
        let corpses = []
        for (let i = 0; i < this.world.creatures.length; ++i) {
            let creature = this.world.creatures[i]
            const survived = this.testSurvival(creature)
            if (survived)
                continue;

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