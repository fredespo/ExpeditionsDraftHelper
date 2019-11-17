const logger = require('electron-log');

let directDamageAnalyzer = require("./directDamageAnalyzer.js");

function setBaseValueIfNotSet(card) {
    if(card.baseValue == undefined) {
        card.baseValue = calcBaseValue(card);
    }
}

function calcBaseValue(card) {
    logger.log("Calculating base value for " + card.name + ", description: " + card.descriptionRaw);
    var totalStatValue = 0;
    totalStatValue += card.attack;
    totalStatValue += card.health;
    totalStatValue += directDamageAnalyzer.getDirectDamageStatValue(card);

    var baseValue = totalStatValue / (card.cost + 1);
    baseValue = Math.round(baseValue * 10);
    return baseValue;
}

module.exports = {
    setBaseValueIfNotSet
};