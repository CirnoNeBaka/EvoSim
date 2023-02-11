"use strict"

import { Damage } from "./fight.js"
import * as RNG from "./rng.js"

export const WeatherType = {
    Local: 'local',
    Global: 'global',
}

export class WeatherStats {
    constructor(dmgType, minDmg, maxDmg, minRadius, maxRadius) {
        this.damageType = dmgType
        this.minDamage = minDmg
        this.maxDamage = maxDmg
        this.minRadius = minRadius
        this.maxRadius = maxRadius
    }
}

export class WeatherPattern {
    constructor(type, probabilty, stats, name) {
        this.type = type
        this.stats = stats
        this.probabilty = probabilty
        this.name = name
    }

    processTurn(world) {
        if (!RNG.roll01(this.probabilty)) {
            return
        }

        const dmg = new Damage({ [this.stats.damageType]: RNG.rollInt(this.stats.minDamage, this.stats.maxDamage) })
        if (this.type == WeatherType.Global) {
            console.log(`${this.name} happened all across the world for ${dmg.damageSum()} dmg!`)
            for (let creature of world.creatures) {
                this.processCreature(world, creature, dmg)
            }
        } else if (this.type == WeatherType.Local) {
            const x = RNG.rollInt(0, world.width - 1)
            const y = RNG.rollInt(0, world.height - 1)
            const radius = RNG.rollInt(this.stats.minRadius, this.stats.maxRadius)
            console.log(`${this.name} happened at [${x};${y}] with radius ${radius} for ${dmg.damageSum()} dmg!`)
            world.forEachTile((tile, tx, ty) => {
                const dx = (x - tx)
                const dy = (y - ty)
                if (dx*dx + dy*dy <= radius*radius) {
                    for (let creature of world.creaturesAt(tx, ty)) {
                        this.processCreature(world, creature, dmg)
                    }
                }
            })
        }
    }

    processCreature(world, creature, dmg) {
        const died = !world.damageCreature(creature, dmg, "weather")
        if (died)
        {
            //console.log(`${this.name} damages and kills creature for ${dmg.damageSum()}`)
            let tile = world.tile(creature.x, creature.y)
            tile.food.carrion += creature.deathMeat()
        }
    }
}