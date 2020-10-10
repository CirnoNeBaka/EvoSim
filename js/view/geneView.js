'use strict'

import * as Genes from '../core/genes.js'
import { createIcon } from './utils.js'

export class GeneView {
    constructor(gene) {
        this.gene = gene
    }

    generateText() {
        let label = document.createElement('div')
        label.innerHTML = this.gene.description
        return label
    }

    generateIcon() {
        let icon = document.createElement('img')
        const iconID = this.gene.id.toLowerCase()
        return createIcon(`genes/${iconID}`)
    }

    generateHTML() {
        return this.generateIcon()
        // if (this.gene.description) {
        //     return this.generateText() 
        // }
    }
}

export class GenesView {
    constructor(genes) {
        this.genes = genes
    }

    generateHTML() {
        let table = document.createElement('table')
        for (let gene of this.genes) {
            let row = document.createElement('tr')
            
            let id = document.createElement('td')
            id.append(new GeneView(gene).generateHTML())
            row.append(id)
            
            for (let i = 0; i < Genes.GENE_POWER_MAX; ++i) {
                let td = document.createElement('td')
                let cell = document.createElement('div')
                cell.setAttribute('class', (gene.power > i) ? 'genePowerCellFull' : 'genePowerCellEmpty')
                td.append(cell)
                row.append(td)
            }

            table.append(row)
        }

        return table
    }
}