'use strict'

import * as Fight from '../fight.js'
import { GenesView } from './geneView.js'
import * as Utils from './utils.js'
import { createIcon } from './utils.js'

function shortAttackText(creature) {
    const attackSum = Object.values(creature.attack()).reduce((sum, a) => { return sum + a }, 0)
    return `⚔${attackSum}`
}

function shortDefenceText(creature) {
    const defenceSum = Object.values(creature.defence()).reduce((sum, a) => { return sum + a }, 0)
    return `🛡${defenceSum}`
}

function shortRetributionText(creature) {
    const retributionSum = Object.values(creature.retribution()).reduce((sum, a) => { return sum + a }, 0)
    return `🛡⚔${retributionSum}`
}

export class CreaturesView {
    constructor(creatures) {
        this.creatures = creatures
    }

    addTextCell(text) {
        let td = document.createElement('td')
        td.innerText = text
        return td
    }

    generateHTML() {
        let table = document.createElement('table')
        table.setAttribute('class', 'tileViewCreatureTable')
        for (let creature of this.creatures) {
            let row = document.createElement('tr')
            
            row.append(this.addTextCell(`⌛${creature.age}/${creature.lifespan()}`))
            row.append(this.addTextCell(`💖${creature.hp}/${creature.maxHP()}`))
            row.append(this.addTextCell(`💙${creature.energy}/${creature.energyConsumption()}`))
            row.append(this.addTextCell(`💛${creature.fat}/${creature.fatCapacity()}`))
            row.append(this.addTextCell(shortAttackText(creature)))
            row.append(this.addTextCell(shortDefenceText(creature)))
            row.append(this.addTextCell(shortRetributionText(creature)))
            row.append(this.addTextCell(`🐘${creature.mass()}`))
            row.append(this.addTextCell(`🦶${creature.speed()}`))

            let showDetailsButton = document.createElement('button')
            showDetailsButton.innerText = '👁️‍🗨️'
            showDetailsButton.onclick = () => { window.onClickCreature(creature.id) }
            row.append(showDetailsButton)
            
            table.append(row)
        }
        return table
    }
}

class DamageView {
    constructor(damage, label) {
        this.damage = damage
        this.label = label
    }

    generateHTML() {
        let tr = document.createElement('tr')
        
        if (this.label) {
            let td = document.createElement('td')
            td.innerText = this.label
            tr.append(td)
        }

        let addRow = function(icon, damage, type) {     
            let tdIcon = document.createElement('td')
            if (typeof(icon) === 'string')
                tdIcon.innerText = icon
            else
                tdIcon.append(icon)

            tdIcon.append(damage[type])

            tr.append(tdIcon)
        }

        for (let type of Fight.DAMAGE_TYPES)
            addRow(createIcon(`damage/${type}`), this.damage, type)

        return tr
    }
}

export class FullCreatureView {
    constructor(creature) {
        this.creature = creature
    }

    generateBasicStatsView() {
        let table = document.createElement('table')
        
        let addView = function(name, value, maxValue) {
            let tr = document.createElement('tr')
            
            let label = document.createElement('td')
            label.innerText = name
            tr.append(label)

            if (maxValue) {
                let view = document.createElement('td')
                const BAR_CELLS = 10
                view.append(new Utils.BarView(value, maxValue, BAR_CELLS).generateHTML())
                tr.append(view)
            } else {
                let td = document.createElement('td')
                td.innerText = value
                tr.append(td)
            }

            table.append(tr)
        }

        addView('💖Health:', this.creature.hp, this.creature.maxHP())
        addView('💙Energy:', this.creature.energy, this.creature.energyConsumption())
        if (this.creature.fatCapacity() > 0)
            addView('💛Fat:', this.creature.fat, this.creature.fatCapacity())
        addView('⌛Age:', this.creature.age, this.creature.lifespan())
        addView('Mass:', this.creature.mass())
        addView('Speed:', this.creature.speed())
        addView('Regeneration:', `+${this.creature.regeneration()} HP / turn`)
        addView('Divide chance:', `${this.creature.divideChance() * 100.0}% / turn`)
        addView('Generation:', `${this.creature.generation} ancestors`)

        return table
    }

    generateHTML() {
        let container = document.createElement('div')
        if (!this.creature)
            return container

        if (!this.creature.alive) {
            let button = document.createElement('button')
            button.innerHTML = '<p class="deadLabel">DEAD</p>'
            button.setAttribute('onclick', `window.onClickCreature(-1)`)
            container.append(button)
        }

        container.append(this.generateBasicStatsView())

        let damageTable = document.createElement('table')
        damageTable.setAttribute('class', 'damageTable')
        damageTable.append(new DamageView(this.creature.attack(),      'Attack'     ).generateHTML())
        damageTable.append(new DamageView(this.creature.defence(),     'Defence'    ).generateHTML())
        damageTable.append(new DamageView(this.creature.retribution(), 'Retribution').generateHTML())
        container.append(damageTable)

        container.append(new GenesView(Object.values(this.creature.genes)).generateHTML())

        return container
    }
}
