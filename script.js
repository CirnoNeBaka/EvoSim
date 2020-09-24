'use strict'

import './js/world.js'
import * as rng from './js/rng.js'
import { Game } from './js/game.js'
import { World } from './js/world.js'
import { createBasicCreature } from './js/creature.js'

let world = new World()
world.generateTiles()

let gameEngine = new Game(world)

renderWorld(world)

function renderWorld(world) {
    let worldMapTable = document.getElementById('worldMapTable')
    worldMapTable.innerHTML = ""
    for (let x = 0; x < world.width; ++x) {
        let tableRow = document.createElement('tr')
        for (let y = 0; y < world.height; ++y) {
            const tile = world.tile(x, y)
            
            let tileRect = document.createElement('div')
            tileRect.setAttribute('id', `tile_${x}-${y}`)
            tileRect.setAttribute('class', tile.id)
            tileRect.setAttribute('onclick', `onClickTile(${x}, ${y});`)
            
            let creatureCounter = document.createElement('b')
            creatureCounter.setAttribute('class', 'creatureCounter')
            creatureCounter.innerText = String(world.creaturesAt(x, y).length)
            tileRect.append(creatureCounter)
    
            let tableCell = document.createElement('td')
            tableCell.append(tileRect)
            
            tableRow.append(tableCell)
        }
        worldMapTable.appendChild(tableRow)
    }
}

function renderTile(tile) {
    let creatures = gameEngine.world.creaturesAt(tile.x, tile.y)
    let tileView = document.getElementById("tileView")
    tileView.innerHTML = ""

    tileView.innerText += `\ud83c\udf31: ${tile.food.plant}/${tile.plantFoodCapacity}\n`

    for (let i in creatures) {
        let creature = creatures[i]
        tileView.innerText += creature.toString() + "\n"
    }
}

function onSimulateOneTurn() {
    gameEngine.processTurn()
    renderWorld(gameEngine.world)
}

function onClickTile(x, y) {
    let tile = gameEngine.world.tile(x, y)
    console.log(tile, gameEngine.world.creaturesAt(x, y))
    renderTile(tile)
}

document.onSimulateOneTurn = onSimulateOneTurn
document.onClickTile = onClickTile