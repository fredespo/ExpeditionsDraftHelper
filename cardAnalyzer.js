const logger = require('electron-log');

let directDamageAnalyzer = require("./directDamageAnalyzer.js");
let keywordAnalyzer = require("./keywordAnalyzer.js")

function setBaseValueIfNotSet(card) {
    if(card.baseValue == undefined) {
        card.baseValue = calcBaseValue(card);
    }
}

function calcBaseValue(card) {
    logger.log("Calculating base value for " + card.name + ": ");
    logger.log(card);
    var totalStatValue = 0;
    totalStatValue += card.attack;
    totalStatValue += card.health;
    totalStatValue += parseInt(directDamageAnalyzer.getDirectDamageStatValue(card));
    totalStatValue += parseInt(keywordAnalyzer.getKeywordsValue(card));


    var baseValue = totalStatValue / (card.cost + 1);
    baseValue = Math.round(baseValue * 10);
    return baseValue;
}

module.exports = {
    setBaseValueIfNotSet
};