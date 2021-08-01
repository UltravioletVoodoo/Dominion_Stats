let turnNum = 0;
displayIndicator()
let interval = setInterval(determineAction, 1000);
let myGameID = ''
let gameover = false;
let displaying = false;
const colors = [
    '#ff0000',
    '#00ff00',
    '#0000ff',
    '#ff00ff',
    '#00ffff',
    '#ffff00'
];

function determineAction() {
    if (document.querySelector('.game-log')) {
        // We are on the game screen, run that code
        if (!gameover) {
            gatherData();
        }
    } else if (document.querySelector('.game-log-results')) {
        // We are on the score screen, run that code
        displayData();
    } else {
        // We are somwhere not relevant to this extension, do nothing
    }
}

function convertData(data) {
    let playerData = {};
    const keys = Object.keys(data);
    keys.forEach((key, index) => { 
        for (let playerTurn of data[key]) {
            if (playerData[playerTurn.name] === undefined) {
                // we dont have that player yet
                playerData[playerTurn.name] = [{x: key, y: playerTurn.vp}];
            } else {
                // we already have that player
                playerData[playerTurn.name].push({x: key, y: playerTurn.vp});
            }
        }
    });
    return playerData;
}

function getScale(playerData, players, height, width) {
    let highestScore = 0;
    let lowestScore = 0;
    let numTurns = 0
    players.forEach((player, index) => {
        numTurns = playerData[player].length;
        for (let turn of playerData[player]) {
            if (turn.y > highestScore) highestScore = turn.y;
            if (turn.y < lowestScore) lowestScore = turn.y;
        }
    });
    const heightRange = Math.abs(highestScore - lowestScore);
    const heightScale = height / heightRange;
    const widthScale = width / numTurns;

    return {x: widthScale, y: heightScale, lowest: lowestScore};
}

function displayData() {
    if (displaying) return;
    const playerData = convertData(getData());
    let location = document.querySelector('.active-table-rules-list');
    location.innerHTML = 
`
<canvas id="displayCanvas" style="background-color: white; position: relative; z-index: 1000000; left: 50%; transform: translateX(-50%); margin-top: 50px" width="300px" height="200px"></canvas>
`;
    let canvas = document.getElementById("displayCanvas");
    var ctx = canvas.getContext("2d");
    const players = Object.keys(playerData);
    const scale = getScale(playerData, players, canvas.height, canvas.width);
    let currColor = -1;
    players.forEach((player, index) => {
        currColor = currColor === colors.length ? 0 : currColor + 1;
        ctx.beginPath();
        ctx.strokeStyle = colors[currColor];
        ctx.moveTo(0, canvas.height - scale.lowest * scale.y);
        for (let turn of playerData[player]) {
            ctx.lineTo(turn.x * scale.x, canvas.height - ((turn.y + Math.abs(scale.lowest)) * scale.y));
        }
        ctx.stroke();
        ctx.closePath();

        // make the colors make sense by coloring all of the names :O next level strats
        let playerElements = document.querySelectorAll('.table-person-name');
        for (let playerElement of playerElements) {
            if (playerElement.innerHTML === player) {
                playerElement.style.color = colors[currColor];
            }
        }
    });

    // dislay the zero line
    ctx.beginPath();
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 2;
    ctx.moveTo(0, canvas.height - Math.abs(scale.lowest) * scale.y)
    ctx.lineTo(canvas.width, canvas.height - Math.abs(scale.lowest) * scale.y)
    ctx.stroke();
    ctx.closePath();

    displaying = true;
}

function getGameID() {
    const idRE = /Game\s#(\d+)/;
    return document.querySelector('.game-log').innerHTML.match(idRE)[1]
}

function resetGame() {
    gameover = false;
    displaying = false;
    turn = 0;
    myGameID = getGameID()
    clearData();
}

function displayIndicator() {
    let body = document.querySelector('body');
    let indicator = document.createElement('div');
    indicator.innerHTML = 
    `
    <div 
        style="position: fixed; left: 10px; bottom: 10px; z-index:100; background-color: red; color: black; opacity: 0.7; cursor: default; transition: 0.3s"
        onmouseover="this.style.opacity = 1.0"
        onmouseout="this.style.opacity = 0.7"
        >
        Stats are being recorded
    </div>
    `;
    body.appendChild(indicator);
}

function gatherData() {
    if (getGameID() !== myGameID) {
        resetGame();
    }
    gameEnded()
    if (isNewTurn()) {
        getPlayerStatus();
    }
}

function handleGameEnd() {
    gameover = true;
    let button = document.querySelector('.lobby-button')
    button.disabled = true;
    let color = button.style.backgroundColor;
    button.style.backgroundColor = 'gray';
    const oldValue = button.innerHTML;
    button.innerHTML = 'generating results...'
    setTimeout(() => {
        getPlayerStatus();
        button.innerHTML = oldValue;
        button.disabled = false;
        button.style.backgroundColor = color;
    }, 3000);
}

function gameEnded() {
    let notificationBox = document.querySelector('game-ended-notification');
    if (notificationBox.innerHTML.includes('The game has ended.')) {
        handleGameEnd()
        return true;
    }
    return false
}

function isNewTurn() {
    const gameLog = document.querySelector('.game-log');
    const turnRE = /Turn\s(\d+)/g;
    let turns = gameLog.innerHTML.matchAll(turnRE);
    let currentTurn = turnNum;
    for (let turn of turns) {
        currentTurn = parseInt(turn[1]);
    }
    if (currentTurn > turnNum) {
        turnNum = currentTurn;
        return true;
    }
    return false;
}

function dataExists() {
    return localStorage.getItem('gameStats') !== null;
}

function setData(newData) {
    localStorage.setItem('gameStats', newData)
}

function getData() {
    return JSON.parse(localStorage.getItem('gameStats'));
}

function clearData() {
    localStorage.removeItem('gameStats');
}

function addData(players, turn) {
    let newData;
    if (dataExists()) {
        newData = getData();
    } else {
        newData = {};
    }
    newData[turn] = players;
    setData(JSON.stringify(newData));
}
    
function getPlayerStatus() {
    const players = []
    for (let player of document.querySelectorAll('.opponent-name-vp')) {
        let rawName = player.querySelector('.opponent-name').innerHTML;
        let name = rawName.substr(0, rawName.indexOf('<'));
        let vp = player.querySelector('.opponent-vp-counter').innerHTML;
        players.push({
            name: clean(name),
            vp: cleanVP(clean(vp))
        });
    }

    addData(players, turnNum);
}

function clean(inputString) {
    return inputString.trim().replace('&nbsp;', '');
}

function cleanVP(inputString) {
    return parseInt(inputString.replace('VP', ''));
}