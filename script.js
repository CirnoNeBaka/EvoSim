'use strict'

import './js/world.js'
import { World } from './js/world.js'

let world = new World()
world.generateTiles()

let worldMapTable = document.getElementById('worldMapTable')
for (let x = 0; x < world.width; ++x) {
    let tableRow = document.createElement('tr')
    for (let y = 0; y < world.height; ++y) {
        const tile = world.tile(x, y)
        
        let tileRect = document.createElement('div')
        tileRect.setAttribute('class', tile.id)

        let tableCell = document.createElement('td')
        tableCell.append(tileRect)
        
        tableRow.append(tableCell)
    }
    worldMapTable.appendChild(tableRow)
}

console.log(worldMapTable)