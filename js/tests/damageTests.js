'use strict'

import { Damage, DAMAGE_TYPES } from '../core/fight.js'
import * as Fight from '../core/fight.js'

const PHY = Fight.DMG_PHYSICAL
const FIR = Fight.DMG_FIRE
const CLD = Fight.DMG_COLD
const ELE = Fight.DMG_ELECTRIC
const ACD = Fight.DMG_ACID

let assert = chai.assert

describe('Damage', function() {

    it(`default constructed damage is zero`, function() {
        let dmg = new Damage()
        assert.equal(dmg.damageSum(), 0)
    })
  
    it(`default constructed damage has all damage types`, function() {
        let dmg = new Damage()
        for (let type of DAMAGE_TYPES)
            assert(type in dmg)
    })

    it(`all damage types are correctly initialized from data object`, function() {
        const data = {
            [PHY]: 42,
            [FIR]: 666,
            [CLD]: 0,
            [ELE]: 1337,
            [ACD]: 100500,
        }
        let dmg = new Damage(data)
        for (let type of DAMAGE_TYPES) {
            assert(type in dmg)
            assert.equal(dmg[type], data[type])
        }
    })

    it(`damageSum() returns the sum of all damage types`, function() {
        assert.equal(new Damage({ [PHY]: 1, [ACD]: 1, [ELE]: 1 }).damageSum(), 3)
        assert.equal(new Damage({ [FIR]: 100 }).damageSum(), 100)
        assert.equal(new Damage({ [FIR]: 0, [CLD]: 0 }).damageSum(), 0)
    })

    it(`add() sums damages`, function() {
        const dmg1 = new Damage({ [PHY]: 10, [FIR]: 0, [CLD]: 50, [ACD]: 0 })
        const dmg2 = new Damage({ [PHY]: 10, [FIR]: 50, [CLD]: 0, [ACD]: 0 })
        const result = dmg1.add(dmg2)

        assert(result instanceof Damage)
        assert.notEqual(result, dmg1)
        assert.equal(result[PHY], 20)
        assert.equal(result[FIR], 50)
        assert.equal(result[CLD], 50)
        assert.equal(result[ACD], 0)
        assert.equal(result[ELE], 0)
    })

    it(`subtract() subtracts damages`, function() {
        const dmg1 = new Damage({ [PHY]: 25, [FIR]: 0, [CLD]: 50, [ACD]: 10 })
        const dmg2 = new Damage({ [PHY]: 10, [FIR]: 50, [CLD]: 0, [ACD]: 10 })
        const result = dmg1.subtract(dmg2)

        assert(result instanceof Damage)
        assert.notEqual(result, dmg1)
        assert.equal(result[PHY], 15)
        assert.equal(result[FIR], 0, 'Damage can`t be negative')
        assert.equal(result[CLD], 50)
        assert.equal(result[ACD], 0)
        assert.equal(result[ELE], 0)
    })
    
    it(`multiply() multiples damage`, function() {
        const dmg = new Damage({ [PHY]: 25, [FIR]: 1, [CLD]: 50, [ACD]: 0 })
        const multiplier = 2.0
        const result = dmg.multiply(multiplier)

        assert(result instanceof Damage)
        assert.notEqual(result, dmg)
        assert.equal(result[PHY], 50)
        assert.equal(result[FIR], 2)
        assert.equal(result[CLD], 100)
        assert.equal(result[ACD], 0)
        assert.equal(result[ELE], 0)
    })
})
