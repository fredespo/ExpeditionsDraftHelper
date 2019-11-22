const logger = require('electron-log');

function getKillValue(card) {
    var killValue = 0;

    var desc = card.descriptionRaw.toLowerCase();
    if(desc.includes(" kill") || desc.startsWith("kill")) {
        killValue = 4;
    }
    
    return killValue;
}

module.exports = {
    getKillValue
};