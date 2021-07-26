document.addEventListener('DOMContentLoaded', function () {
    const gameLog = document.querySelector('.game-log')
    gameLog.addEventListener('DOMNodeInserted', getPlayerStatus);
}, false);
    
    
    
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

    let resultsString = ''
    for (let player of players) {
        resultsString += `${player.name}: ${player.vp}\n`;
    }
    alert(resultsString);
}

function clean(inputString) {
    return inputString.trim().replace('&nbsp;', '');
}

function cleanVP(inputString) {
    return parseInt(inputString.replace('VP', ''));
}