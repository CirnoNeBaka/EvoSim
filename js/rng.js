'use strict'

function roll(from, to) {
    return from + Math.random() * (to - from) 
}

function rollInt(from, to) {
    return Math.floor(roll(from, to + 1))
}

function testDC(from, dc, to) {
    const r = rollInt(from, to)
    return r > dc
}

export {
    roll,
    rollInt,
    testDC
}