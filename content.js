chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    const rounds = getRounds()
    analyseRounds(rounds)
})


function getRounds() {
    let rawString = document.querySelector('.game-log').textContent

    const lines = rawString.split('\n')

    let rounds = []
    let currentRound = 0
    let roundActions = []
    for (let line of lines) {
        if (line.includes('Turn ')) {
            const turnRE = /Turn (\d+)/
            const match = line.match(turnRE)
            const roundNum = parseInt(match[1])
            if (roundNum > currentRound) {
                currentRound = roundNum
                rounds.push({
                    round: currentRound - 1,
                    actions: roundActions,
                })
                roundActions = []
            }
        } else {
            roundActions.push(line)
        }
    }
    rounds.push({
        round: currentRound,
        actions: roundActions,
    })
    rounds.shift()
    return rounds
}


function analyseRounds(rounds) {
    let players = []
    for (let round of rounds) {
        for (let action of round.actions) {
            if (isEmpty(action)) continue
            const playerName = getPlayerName(action)
            let player = getPlayer(playerName, players)
            if (!player){
                player = createPlayer(playerName)
                players.push(player)
            }
            // analyse the action taken and update the player's stats accordingly
            const actionType = getActionType(action)
            const numAffected = getNumAffected(action)
            switch(actionType) {
                case 'gains':
                    player.numCards += numAffected
                    break
                case 'trashes':
                    player.numCards -= numAffected
                    break
                default:
            }
            const playerIndex = getPlayerIndex(player, players)
            players[playerIndex].numCards = player.numCards

        }
        generateOutput(round, players)
    }
}

function isEmpty(action) {
    const emptyRE = /^\s*$/
    if (action.match(emptyRE)) return true
    return false
}

function generateOutput(round, players) {
    let output = []
    output.push(round.round.toString())
    for (let player of players) {
        output.push(player.numCards.toString())
    }
    console.log(output.join(','))
}

function getPlayerIndex(updatedPlayer, players) {
    for (let playerIndex in players) {
        const player = players[playerIndex]
        if (player.name === updatedPlayer.name) return playerIndex
    }
    return false
}

function getNumAffected(action) {
    let actionArray = action.split(' ')
    let num = actionArray[actionArray.length - 2]
    if (typeof(num) === 'number') return parseInt(num)
    return 1
}

function getActionType(action) {
    if (action.includes('gains')) return 'gains'
    if (action.includes('trashes')) return 'trashes'
    return 'null'
}

function getPlayer(name, players) {
    for (let player of players) {
        if (player.name === name) return player
    }
    return false
}

function getPlayerName(action) {
    const playerNameRE = /^\s*(\w)\s/
    const match = action.match(playerNameRE)
    return match[1]
}

function playerExists(name, players) {
    for (let player of players) {
        if (player.name === name) return true
    }
    return false
}


function createPlayer(name) {
    return {
        name: name,
        numCards: 10,
    }
}