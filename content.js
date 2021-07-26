// Need to figure out how on earth to call this.
// I want it to be called at the end of each turn order. 

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
    console.log(resultsString);
}

function clean(inputString) {
    return inputString.trim().replace('&nbsp;', '');
}

function cleanVP(inputString) {
    return parseInt(inputString.replace('VP', ''));
}