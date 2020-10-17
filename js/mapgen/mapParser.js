'use strict'

import { Tile, TILE_DESERT, TILE_FOREST, TILE_GRASSLAND, TILE_HIGH_MOUNTAINS, TILE_RIVER, TILE_SAVANNAH, TILE_SEA } from '../core/tile.js'

export const EXAMPLE_MAP = {
    "legend": [
        "F - forest",
        "/ - grassland",
        ": - savannah",
        ". - desert",
        "= - river",
        "~ - sea",
        "M - high mountains"
    ],
    "tiles": [
        "~~~~~~~~~~",
        "~~..:::M.~",
        "~..:/=MMM.",
        "~:====/M.~",
        "~~~//FFF~~",
        "~~~~====~~",
        "~~~//FF/~~",
        "~///FFF:.~",
        "~~/MMF:..~",
        "~~~~M:.~~~"
    ]
}

export const OASIS_MAP = {
    "tiles": [
        ".........",
        ".........",
        "....=....",
        "...=~=...",
        "..=~~~=..",
        "...=~=...",
        "....=....",
        ".........",
        "........."
    ]
}

const TILES = [
    TILE_FOREST,
    TILE_GRASSLAND,
    TILE_SAVANNAH,
    TILE_DESERT,
    TILE_RIVER,
    TILE_SEA,
    TILE_HIGH_MOUNTAINS,
]

function parseTile(symbol) {
    for (let tile of TILES)
        if (tile.symbol === symbol)
            return new Tile(tile)
    throw Error(`Unknown tile: ${symbol}`)
}

export function loadMapFromJSON(jsonMapData) {
    let tilesData = jsonMapData.tiles
    if (!tilesData || !Array.isArray(tilesData) || !tilesData.length)
        throw Error('Invalid map format')

    const lineSize = tilesData[0].length
    let map = []
    let x = 0
    for (let line of tilesData) {
        if (line.length !== lineSize)
            throw Error(`Invalid map line size: ${line} (${line.length})`)

        let y = 0
        let tilesLine = []
        for (let symbol of line) {
            let tile = parseTile(symbol)
            tile.x = x
            tile.y = y++
            tilesLine.push(tile)
        }

        map.push(tilesLine)
        x++
    }
    return map
}