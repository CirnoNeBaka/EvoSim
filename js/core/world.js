'use strict'

{
    tiles: [
        {
            name: 'ground',
            symbols: '.',
            passable: true,
            transparent: true,
            coverage: 0,
        },
        {
            name: 'wall',
            symbols: '│ ─ ┐ ┌ ┘ └ ┤ ├ ┬ ┴ ┼',
            passable: false,
            transparent: false,
            coverage: 100,
        },
        {
            name: 'half-wall',
            symbols: '┆ ┄',
            passable: false,
            transparent: true,
            coverage: 50,
        },
    ]
}

'\
┌───┐....\
|...┆....\
|......┆.\
|...┆....\
└───┘....\
'

class Tile {
    constructor() {
        this.passable = true
        this.transparent = true
        this.coverage = 0

        this.symbol = ' '
        this.color = ''
    }
}

class Location {
    constructor(width, height) {
        this.tiles = new Array(height)
        for (let i = 0; i < height; ++i) {
            this.tiles[i] = new Array(width)
        }

        this.characters = []
    }
}