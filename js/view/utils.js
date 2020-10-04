'use strict'

export function createIcon(id, width = 25, height = 25) {
    let img = document.createElement('img')
    img.src = `./resources/${id}.png`
    img.width = width
    img.height = height
    return img
}

export class BarView {
    constructor(value, maxValue, cells) {
        this.value = value
        this.maxValue = maxValue
        this.cells = cells
    }

    generateHTML() {
        const fullCells = Math.round((this.value / this.maxValue) * this.cells)
        let container = document.createElement('table')
        let row = document.createElement('tr')
        container.append(row)
        
        for (let i = 0; i < this.cells; ++i) {
            let div = document.createElement('div')
            div.setAttribute('class', (i < fullCells) ? 'barViewCellFull' : 'barViewCellEmpty')

            let td = document.createElement('td')
            td.append(div)
            row.append(td)
        }

        let td = document.createElement('td')
        td.innerText = `${this.value}/${this.maxValue}`
        row.append(td)

        return container
    }
}