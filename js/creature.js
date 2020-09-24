'use strict'

import './genes.js'
import { GENE_SPEED, GENE_MASS } from './genes.js'

function createBasicCreature() {
    let creature = new Creature()

    creature.genes.MASS = GENE_MASS
    creature.genes.SPEED = GENE_SPEED

    creature.energy = creature.energyConsumption()
    creature.hp = creature.mass()
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

    feed(food) {
        // everyone is a herbivore yet
        const plantFoodConsumed = Math.max(food.plant, this.energyConsumption())
        this.energy += plantFoodConsumed
        food.plant -= plantFoodConsumed
    }

    kill() {
        this.alive = false
    }
}

export {
    Creature,
    createBasicCreature,
}