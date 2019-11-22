const logger = require('electron-log');

let directDamageAnalyzer = require("./directDamageAnalyzer.js");
let keywordAnalyzer = require("./keywordAnalyzer.js")
let grantAnalyzer = require("./grantAnalyzer.js")
let killAnalyzer = require("./killAnalyzer.js")
let barrierAnalyzer = require("./barrierAnalyzer.js")

function setBaseValueIfNotSet(card) {
    if(card.baseValue == undefined) {
        card.baseValue = calcBaseValue(card);
    }

    if(card.baseValue == undefined) {
        logger.log("Base value calc error!");
    }
}

function calcBaseValue(card) {
    var totalStatValue = 0;
    totalStatValue += card.attack;
    totalStatValue += card.health;
    totalStatValue += parseInt(directDamageAnalyzer.getDirectDamageStatValue(card));
    totalStatValue += parseInt(keywordAnalyzer.getKeywordsValue(card));
    totalStatValue += parseInt(grantAnalyzer.getGrantValue(card));
    totalStatValue += parseInt(killAnalyzer.getKillValue(card));
    totalStatValue += parseInt(barrierAnalyzer.getBarrierValue(card));

    var baseValue = totalStatValue / (card.cost + 1);
    baseValue = Math.round(baseValue * 10);
    return baseValue;
}

module.exports = {
    setBaseValueIfNotSet
};