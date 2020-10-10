'use strict'

export class WorldView {
    constructor(world) {
        this.world = world
    }

    generateHTML() {
        let worldMapTable = document.createElement('table')

        for (let x = 0; x < this.world.width; ++x) {
            let tableRow = document.createElement('tr')
            for (let y = 0; y < this.world.height; ++y) {
                const tile = this.world.tile(x, y)
                
                let tileRect = document.createElement('div')
                tileRect.setAttribute('id', `tile_${x}-${y}`)
                tileRect.setAttribute('class', `worldMapCell`)
                tileRect.setAttribute('tileID', `${tile.id}`)
                tileRect.setAttribute('onclick', `window.onClickTile(${x}, ${y})`)
                
                let creatureCounter = document.createElement('b')
                creatureCounter.setAttribute('class', 'creatureCounter')
                creatureCounter.innerText = String(this.world.creaturesAt(x, y).length)
                tileRect.append(creatureCounter)
        
                let tableCell = document.createElement('td')
                tableCell.append(tileRect)
                
                tableRow.append(tableCell)
            }
            worldMapTable.appendChild(tableRow)
        }
        return worldMapTable
    }
}