'use strict'

const MAX_COMMANDS_HISTORY_LENGTH = 10
let commandsHistory = []
let currentCommandFromHistory = 0

function getCommandLine() {
    return document.getElementById("commandLine")
}

function onCommandEntered() {
    let commandLine = getCommandLine()
    const commandText = commandLine.value 
    if (!commandText)
        return

    commandLine.value = ''
    addLogMessage(commandText)
    addCommandToHistory(commandText)
    console.log("Command:" + commandText)
}

function onCommandLineKeyPressed(event) {
    const newLineCode = '\n'.charCodeAt(0)
    const returnCode = '\r'.charCodeAt(0)
    const upCode = 38
    const downCode = 40
    //console.log("code: " + event.which)

    switch (event.which)
    {
    case newLineCode:
    case returnCode:
        onCommandEntered()
        break
    case upCode:
        gotoPreviousHistoryCommand()
        getCommandLine().value = getCurrentHistoryCommand()
        break
    case downCode:
        gotoNextHistoryCommand()
        getCommandLine().value = getCurrentHistoryCommand()
        break
    }
}

function getActionLog() {
    return document.getElementById("actionLog")
}

function addLogMessage(message) {
    getActionLog().innerText += `> ${message}\n`; 
}

function addCommandToHistory(command) {
    if (!command)
        return

    if (commandsHistory.length && commandsHistory[commandsHistory.length - 1] === command)
        return

    if (commandsHistory.length >= MAX_COMMANDS_HISTORY_LENGTH)
        commandsHistory.shift()

    commandsHistory.push(command)
    currentCommandFromHistory = commandsHistory.length
}

function getCurrentHistoryCommand() {
    if (currentCommandFromHistory >= commandsHistory.length)
        return ''
    return commandsHistory[currentCommandFromHistory]
}

function gotoPreviousHistoryCommand() {
    if ( commandsHistory.length && currentCommandFromHistory > 0)
        --currentCommandFromHistory;
}

function gotoNextHistoryCommand() {
    if (commandsHistory.length && currentCommandFromHistory < commandsHistory.length)
        ++currentCommandFromHistory;
}

function onClearLog() {
    getActionLog().innerText = ''
}

window.onCommandEntered = onCommandEntered
window.onCommandLineKeyPressed = onCommandLineKeyPressed
window.onClearLog = onClearLog