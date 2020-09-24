'use strict'

import './genes.js'
import { GENE_SPEED, GENE_MASS } from './genes.js'

function createBasicCreature() {
    let creature = new Creature()

    creature.genes.MASS = GENE_MASS
    creature.genes.SPEED = GENE_SPEED

    for (let i in creature.genes) {
        creature.genes[i].power = 1
    }

    creature.energy = creature.energyConsumption()
    creature.hp = creature.mass()
    return creature
}

class Creature {
    constructor() {
        this.x = 0
        this.y = 0

        this.genes = {}
        this.hp = 100
        this.energy = 100
        this.alive = true
    }

    genes() {
        return this.genes
    }

    mass() {
        return this.genes.MASS.power * 10
    }

    speed() {
        return Math.max(1, this.genes.SPEED.power * 10 - this.mass() / 2) 
    }

    energyConsumption() {
        return this.mass()
    }

    move(currentTile, availableTiles) {
        if (!availableTiles.length)
            return currentTile;
        // everyone is a lazy herbivore yet
        if (currentTile.food.plant >= this.energyConsumption())
            return currentTile;
        availableTiles.sort((t1, t2) => {
            return t2.food.plantFoodCapacity - t1.food.plantFoodCapacity
        })
        let bestTile = availableTiles[0]
        this.x = bestTile.x
        this.y = bestTile.y
        //console.log("move to", bestTile)
        return bestTile
    }

    feed(food) {
        // everyone is a herbivore yet
        const plantFoodConsumed = Math.min(food.plant, this.energyConsumption())
        this.energy += plantFoodConsumed
        food.plant -= plantFoodConsumed
        //console.log(this, "eaten", plantFoodConsumed, "; Left:", food)
    }

    kill() {
        this.alive = false
    }

    toString() {
        return `\ud83d\udd0b: ${this.energy}/${this.energyConsumption()} \ud83d\udc18:${this.mass()}`
    }
}

export {
    Creature,
    createBasicCreature,
}