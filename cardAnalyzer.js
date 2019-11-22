const logger = require('electron-log');

let directDamageAnalyzer = require("./directDamageAnalyzer.js");
let keywordAnalyzer = require("./keywordAnalyzer.js")
let grantAnalyzer = require("./grantAnalyzer.js")

function setBaseValueIfNotSet(card) {
    if(card.baseValue == undefined) {
        card.baseValue = calcBaseValue(card);
    }

    if(card.baseValue == undefined) {
        logger.log("Base value calc error!");
    }
    else {
        //logger.log("base value = " + card.baseValue);
    }
}

function calcBaseValue(card) {
    //logger.log("Calculating base value for " + card.name + ": ");
    //logger.log(card);
    var totalStatValue = 0;
    totalStatValue += card.attack;
    totalStatValue += card.health;
    totalStatValue += parseInt(directDamageAnalyzer.getDirectDamageStatValue(card));
    totalStatValue += parseInt(keywordAnalyzer.getKeywordsValue(card));
    totalStatValue += parseInt(grantAnalyzer.getGrantValue(card));


    var baseValue = totalStatValue / (card.cost + 1);
    baseValue = Math.round(baseValue * 10);
    return baseValue;
}

module.exports = {
    setBaseValueIfNotSet
};