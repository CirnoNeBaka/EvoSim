'use strict'

import * as Food from '../core/food.js'
import { CreaturesView } from './creatureView.js' 

export class TileView {
    constructor(tile, world) {
        this.tile = tile
        this.world = world
    }

    generateHTML() {
        let container = document.createElement('div')
        if (!this.tile)
            return container

        let header = document.createElement('p')
    
        let creatures = this.world.creaturesAt(this.tile.x, this.tile.y)
        const creaturesMass = this.tile.creatureMass

        header.innerText += `${this.tile.id}[${this.tile.x}; ${this.tile.y}] 🐘${creaturesMass}/${this.tile.creatureMassCapacity}\n`
        header.innerText += ` 🌱${this.tile.food[Food.PLANT]}/${this.tile.plantFoodCapacity}\t`
        header.innerText += ` 🍖${this.tile.food[Food.MEAT]}\t`
        header.innerText += ` 🦴${this.tile.food[Food.CARRION]}\n`

        container.append(header)
        container.append(new CreaturesView(creatures).generateHTML())
        return container
    }
}