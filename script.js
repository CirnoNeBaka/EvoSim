'use strict'

import { Game } from './js/game.js'
import { World } from './js/world.js'
import * as Food from './js/food.js'

let world = new World()
world.generateTiles()

let gameEngine = new Game(world)
let currentTile = null

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
    let tileView = document.getElementById("tileView")
    tileView.innerHTML = ""
    if (!tile)
        return;

    let creatures = gameEngine.world.creaturesAt(tile.x, tile.y)
    const creaturesMass = creatures.reduce((sum, c) => { return sum + c.mass() }, 0 )

    tileView.innerText += `x:${tile.x} y:${tile.y} 🐘${creaturesMass}/${tile.creatureMassCapacity}\n`
    tileView.innerText += ` 🌱${tile.food[Food.PLANT]}/${tile.plantFoodCapacity}\t`
    tileView.innerText += ` 🍖${tile.food[Food.MEAT]}\t`
    tileView.innerText += ` 🦴${tile.food[Food.CARRION]}\n`

    for (let creature of creatures)
        tileView.innerText += creature.toString() + "\n"
}

function onSimulateOneTurn() {
    gameEngine.processTurn()
    renderWorld(gameEngine.world)
    renderTile(currentTile)
}

let isSimulationRunning = false
let cancelHandle = null

function onToggleSimulation() {
    isSimulationRunning = !isSimulationRunning
    let runButton = document.getElementById('runSimulationButton')
    runButton.innerText = isSimulationRunning ? 'Pause simulation' : 'Run simulation'

    let stepButton = document.getElementById('stepSimulationButton')
    if (isSimulationRunning)
        stepButton.setAttribute('disabled', isSimulationRunning)
    else
        stepButton.removeAttribute('disabled')

    if (isSimulationRunning) {
        const interval = 250
        let exec = () => {
            onSimulateOneTurn()
            cancelHandle = setTimeout(exec, interval)
        }
        exec()
    } else {
        clearTimeout(cancelHandle)
    }
}

function onClickTile(x, y) {
    let tile = gameEngine.world.tile(x, y)
    renderTile(tile)
    currentTile = tile
}

document.onSimulateOneTurn = onSimulateOneTurn
document.onClickTile = onClickTile
document.onToggleSimulation = onToggleSimulation

document.onkeydown = function(event) {
    event = event || window.event;
    if (event.keyCode === ' '.charCodeAt(0)) {
        if (!isSimulationRunning)
            onSimulateOneTurn()
    }
};