'use strict'

function roll(from, to) {
    return from + Math.random() * (to - from) 
}

function rollInt(from, to) {
    return Math.floor(roll(from, to + 1))
}

function roll01(chance) {
    return Math.random() < chance
}

function testDC(from, dc, to) {
    const r = rollInt(from, to)
    return r > dc
}

function coinFlip() {
    return Math.random() < 0.5
}

function randomElement(arr) {
    const index = rollInt(0, arr.length - 1)
    return arr[index]
}

export {
    roll,
    rollInt,
    roll01,
    testDC,
    coinFlip,
    randomElement
}