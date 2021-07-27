let turnNum = 0;
let interval = setInterval(determineAction, 1000);
let myGameID = ''
let gameover = false;
let displaying = false;

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

function displayData() {
    if (displaying) return;
    let body = document.querySelector('body');
    let display = document.createElement('div');
    display.innerHTML = 
    `
<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.9.4/Chart.js"></script>
<canvas id="myChart" style="width:100%;max-width:600px"></canvas>

<script>
var xValues = [50,60,70,80,90,100,110,120,130,140,150];
var yValues = [7,8,8,9,9,9,10,11,14,14,15];

new Chart("myChart", {
    type: "line",
    data: {
        labels: xValues,
        datasets: [{
            fill: false,
            lineTension: 0,
            backgroundColor: "rgba(0,0,255,1.0)",
            borderColor: "rgba(0,0,255,0.1)",
            data: yValues
        }]
    },
    options: {
        legend: {display: false},
        scales: {
            yAxes: [{ticks: {min: 6, max:16}}],
        }
    }
});
</script>
`;
    body.appendChild(display);
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