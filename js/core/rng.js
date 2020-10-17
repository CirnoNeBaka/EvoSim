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

/**
 * Shuffles array in place. ES6 version
 * @param {Array} a items An array containing the items.
 */
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        let temp = array[i]
        array[i] = array[j]
        array[j] = temp
    }
    return array
}

export {
    roll,
    rollInt,
    roll01,
    testDC,
    coinFlip,
    randomElement,
    shuffle
}