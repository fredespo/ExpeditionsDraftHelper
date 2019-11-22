const logger = require('electron-log');

var calcFunctionsByTarget = {
    "other allies": function(totalStatValue) {return totalStatValue * 2.5},
    "me": function(totalStatValue) {return totalStatValue},
    "it": function(totalStatValue) {return totalStatValue},
    "the top unit in our deck": function(totalStatValue) {return totalStatValue},
    "my supported ally": function(totalStatValue) {return totalStatValue},
    "an ally": function(totalStatValue) {return totalStatValue},
    "an ally and all allied copies of it everywhere": function(totalStatValue) {return totalStatValue * 2},
    "the top 2 allies in your deck": function(totalStatValue) {return totalStatValue * 2},
    "other spider allies": function(totalStatValue) {return totalStatValue * 4},
    "other allied spiders": function(totalStatValue) {return totalStatValue * 4},
    "allies in hand": function(totalStatValue) {return totalStatValue * 4},
    "an ally in hand": function(totalStatValue) {return totalStatValue},
    "two allies": function(totalStatValue) {return totalStatValue * 2},
    "all allies": function(totalStatValue) {return totalStatValue * 4},
    "allied legion marauders everywhere": function(totalStatValue) {return totalStatValue * 10},
    "allies in your deck": function(totalStatValue) {return totalStatValue * 15},
    "poro allies everywhere": function(totalStatValue) {return totalStatValue * 10},
    "allies": function(totalStatValue) {return totalStatValue * 3.5},
    "elite allies": function(totalStatValue) {return totalStatValue * 2},
    "a damaged ally": function(totalStatValue) {return totalStatValue * 0.9},
    "spider allies": function(totalStatValue) {return totalStatValue * 4},
    "other allied mistwraiths everywhere": function(totalStatValue) {return totalStatValue * 4},
    "the top ally in your deck": function(totalStatValue) {return totalStatValue},
    "another ally": function(totalStatValue) {return totalStatValue},
    "other battling allies": function(totalStatValue) {return totalStatValue * 2.5},
    "an ally and all other allies of its group": function(totalStatValue) {return totalStatValue * 8},
    "another ally": function(totalStatValue) {return totalStatValue},
    "an ally +3|+0 or": function(totalStatValue) {return totalStatValue}
};

function getGrantValue(card) {
    var grantValue = 0;
    var regex = /grant (.*) \+(\d+)\|\+(\d+)/i;
    var matches = regex.exec(card.descriptionRaw);

    if(matches == null) {
        regex = /give (.*) \+(\d+)\|\+(\d+)/i;
        matches = regex.exec(card.descriptionRaw);
    }

    if(matches != null) {
        var totalStatValue = parseInt(matches[2]) + parseInt(matches[3]);
        var target = matches[1].toLowerCase();

        if(calcFunctionsByTarget[target] == undefined) {
            logger.log("Error: No calc grant value function found for '" + target + "'");
        }
        else {
            grantValue = calcFunctionsByTarget[target](totalStatValue);
        }
    }

    return grantValue;
}

module.exports = {
    getGrantValue
};