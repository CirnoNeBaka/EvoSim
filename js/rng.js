'use strict'

function roll(from, to) {
    return from + Math.random() * (to - from) 
}

function rollInt(from, to) {
    return Math.round(roll(from, to))
}

function testDC(from, dc, to) {
    const r = rollInt(from, to)
    return r > dc
}