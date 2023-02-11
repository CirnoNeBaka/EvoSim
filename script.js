'use strict'

import { Game } from './js/core/game.js'
import { World } from './js/core/world.js'
import * as Maps from './js/mapgen/mapParser.js'
import { setupGlobalUniverse, Universe } from './js/core/universe.js'

import { WorldView } from './js/view/worldView.js'
import { TileView } from './js/view/tileView.js'
import { FullCreatureView } from './js/view/creatureView.js'
import { WeatherPattern, WeatherStats, WeatherType } from './js/core/weather.js'
import * as DMG from './js/core/fight.js'

setupGlobalUniverse()

let worldMap = Maps.loadMapFromJSON(Maps.EXAMPLE_MAP)
let world = new World(worldMap)
let weatherAcid = [
    new WeatherPattern(WeatherType.Global, 0.99, new WeatherStats(DMG.DMG_ACID, 1, 5), "acid fog"),
    new WeatherPattern(WeatherType.Global, 0.10, new WeatherStats(DMG.DMG_ACID, 20, 40), "acid rain"),
    new WeatherPattern(WeatherType.Local,  0.05, new WeatherStats(DMG.DMG_ACID, 40, 80, 1, 2), "acid explosion"),
]
let weatherCold = [
    new WeatherPattern(WeatherType.Global, 0.99, new WeatherStats(DMG.DMG_COLD, 1, 5), "snowfall"),
    new WeatherPattern(WeatherType.Global, 0.10, new WeatherStats(DMG.DMG_COLD, 10, 30), "snowstorm"),
    new WeatherPattern(WeatherType.Local,  0.05, new WeatherStats(DMG.DMG_COLD, 30, 60, 1, 2), "blizzard"),
]

let gameEngine = new Game(world, [])
let currentTile = null
let currentCreature = null

let worldView = new WorldView(world)
let tileView = new TileView(currentTile, world)
let creatureView = new FullCreatureView(currentCreature)

renderWorld(world)

function renderWorld() {
    let worldMapItem = document.getElementById('worldMapItem')
    worldMapItem.innerHTML = ''
    worldMapItem.append(worldView.generateHTML())

    let turnCounterItem = document.getElementById('turnCounter')
    turnCounterItem.innerHTML = `Turn: ${gameEngine.turnCounter}`

    let creatureCounterItem = document.getElementById('creatureCounter')
    creatureCounterItem.innerHTML = `Creatures: ${world.creatures.length}`
}

function renderTile() {
    let tileViewItem = document.getElementById('tileViewItem')
    tileViewItem.innerHTML = ''
    tileViewItem.append(tileView.generateHTML())
}

function renderCreature() {
    let creatureViewItem = document.getElementById('creatureViewItem')
    creatureViewItem.innerHTML = ''
    creatureViewItem.append(creatureView.generateHTML())
}

function onSimulateOneTurn() {
    gameEngine.processTurn()
    renderWorld()
    if (currentTile)
        onClickTile(currentTile.x, currentTile.y)
    renderCreature()
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
        let exec = () => {
            onSimulateOneTurn()
            cancelHandle = setTimeout(exec, Universe.world.simulationTickMS)
        }
        exec()
    } else {
        clearTimeout(cancelHandle)
    }
}

function onClickTile(x, y) {
    if (currentTile) {
        let cell = document.getElementById(`tile_${currentTile.x}-${currentTile.y}`)
        if (cell)
            cell.setAttribute('selected', 'false')
    }

    let tile = gameEngine.world.tile(x, y)
    currentTile = tile
    tileView = new TileView(tile, world)
    renderTile()

    let cell = document.getElementById(`tile_${x}-${y}`)
    if (cell)
        cell.setAttribute('selected', 'true')
}

function onClickCreature(id) {
    currentCreature = null
    for (let creature of world.creatures) {
        if (creature.id === id) {
            currentCreature = creature
            break
        }
    }
    creatureView = new FullCreatureView(currentCreature)
    renderCreature()
}

window.onSimulateOneTurn = onSimulateOneTurn
window.onToggleSimulation = onToggleSimulation
window.onClickTile = onClickTile
window.onClickCreature = onClickCreature

document.onkeydown = function(event) {
    event = event || window.event;
    if (event.keyCode === ' '.charCodeAt(0)) {
        if (!isSimulationRunning)
            onSimulateOneTurn()
    }
}