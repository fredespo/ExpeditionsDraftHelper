const logger = require('electron-log');

function getBarrierValue(card) {
    var barrierValue = 0;

    var desc = card.descriptionRaw.toLowerCase();
    if(desc.includes("barrier")) {
        barrierValue = 4;
    }
    
    return barrierValue;
}

module.exports = {
    getBarrierValue
};