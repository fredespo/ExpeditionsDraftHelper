const logger = require('electron-log');

function getDirectDamageStatValue(card) {
    //logger.log("Calculating direct damage value...");
    var damageStatValue;
    if(cardDealsDirectDamage(card)) {
        damageStatValue = getValueFromStats(getDamageStats(card), card);
    }
    else {
        damageStatValue = 0;
    }

    //logger.log("Direct damage stat value = " + damageStatValue);
    return damageStatValue;
}

function cardDealsDirectDamage(card) {
    return card.descriptionRaw.search(/deal \d+ to/i) != -1;
}

function getDamageStats(card) {
    var regex = /deal (\d+) to (.+?)\./i;
    var matches = regex.exec(card.descriptionRaw);
    var dmgAmount = matches[1];
    var dmgTarget = matches[2];

    var dmgCondition = "";
    regex = /: (.*), deal \d+ to/i;
    matches = regex.exec(card.descriptionRaw);
    if(matches == null) {
        regex = /(.*), deal \d+ to/i;
        matches = regex.exec(card.descriptionRaw);
        if(matches != null) {
            dmgCondition = matches[1];
        }
    }
    else {
        dmgCondition = matches[1];
    }
    

    //logger.log("dmgStats = {amount:" + dmgAmount + ", target: " + dmgTarget + ", condition: " + dmgCondition + "}");
    return {amount: dmgAmount, target: dmgTarget, condition: dmgCondition};
}

function getValueFromStats(dmgStats, card) {
    var damageValue = 0;

    if(isSingleTarget(dmgStats.target)) {
        damageValue = parseInt(dmgStats.amount);
    }
    else {
        damageValue = parseInt(dmgStats.amount * getNumTargets(dmgStats.target));
    }

    damageValue = getAdjustedValForTargetCondition(dmgStats.target, damageValue);

    var targetAlignment = getTargetAlignment(dmgStats);
    if(targetAlignment == "ally") {
        damageValue *= -1;
    }
    else if(targetAlignment == "neutral") {
        damageValue /= 2; //TODO: confirm, neutral cards (deal dmg to both enemies and allies) are half as valuable for their damage than just those that target enemies?
    }

    damageValue += parseInt(getValueOfAdditionalTargets(dmgStats.target, damageValue, card));
    damageValue *= parseFloat(getDmgMultiplier(dmgStats));
    damageValue = getAdjustedValForDmgCondition(dmgStats.condition, damageValue, card);

    return damageValue;
}

function isSingleTarget(damageTarget) {
    var singleTargetWords = ["the", "your", "an", "anything", "it"];
    return startsWithOneOf(damageTarget, singleTargetWords);
}

function getNumTargets(damageTarget) {
    var numTargets;
    if(damageTarget.toLowerCase().includes("nexus") || damageTarget.startsWith("two")) {
        numTargets = 2;
    }
    else {
        //at this point we are probably targeting all enemy or all ally units
        numTargets = 3; //TODO: confirm this number / stratgey
    }

    return numTargets;
}

function getValueOfAdditionalTargets(target, currDmgValue, card) {
    var additionTargetsVal = 0;
    
    if(target.includes("to another")) {
        additionTargetsVal = getValueOfDmgToTargetCopies(target, currDmgValue);
    }
    else {
        var regex = /and (\d+) to (.+)/i
        var matches = regex.exec(target);
        if(matches != null) {
            var subDmgStats = {amount:matches[1], target:matches[2]};
            additionTargetsVal = getValueFromStats(subDmgStats, card);
        }
    }

    return additionTargetsVal;
}

function getValueOfDmgToTargetCopies(target, currDmgValue) {
    var regex = /(\d+) to another/g
    var match;
    var value = 0;
    while(match = regex.exec(target)) {
        value += match[1];
    }
    if(currDmgValue < 0) value *= -1;
    return value;
}

var calcFunctionsByTargetCondition = {
    "if it has 0 power": function(currDmgStatVal) {return currDmgStatVal / 2},
};

function getAdjustedValForTargetCondition(target, currDmgStatVal) {
    var adjustedVal;
    var regex = /if (.*)/i;
    var matches = regex.exec(target);
    if(matches == null) {
        adjustedVal = currDmgStatVal;
    }
    else {
        var targetCondition = matches[1];
        if(calcFunctionsByTargetCondition[matches[1]] == undefined) {
            logger.log("Error: No calc function found for target condition '" + targetCondition + "'");
        }
        else {
            adjustedVal = calcFunctionsByTargetCondition[matches[1]](currDmgStatVal);
        }
    }
    return adjustedVal;
}

var calcFunctionsByDmgCondition = {
    "when i survive damage": function(directDmgStatValue, card) {return directDmgStatValue * (card.health/3.5)},
    "when another ally dies": function(directDmgStatValue, card) {return directDmgStatValue * (card.health/3.5)},
    "if an ally died this round": function(directDmgStatValue, card) {return directDmgStatValue * 0.8},
    "when i'm summoned": function(directDmgStatValue, card) {return directDmgStatValue},
};

function getAdjustedValForDmgCondition(condition, directDmgStatValue, card) {
    var adjustedVal;
    
    if(condition == "" || condition == undefined || calcFunctionsByDmgCondition[condition] == undefined) {
        adjustedVal = directDmgStatValue;
    }
    else {
        adjustedVal = calcFunctionsByDmgCondition[condition](directDmgStatValue, card);
    }
    return adjustedVal;
}

var calcFunctionsByMultiplier = {
    "spell discarded": function() {return 2},
    "attacking ally": function() {return 3.5},
    "other attacking ally": function() {return 2.5},
    "attacking ally other than vladimir": function() {return 2.5}
};

function getDmgMultiplier(dmgStats) {
    var dmgMultiplier = 1;
    
    var regex = /for each (.*)/i;
    var targetMatches = regex.exec(dmgStats.target);
    var conditionMatches = regex.exec(dmgStats.condition);
    var multiplierDesc = null;
    if(targetMatches != null) {
        multiplierDesc = targetMatches[1];
    }
    else if(conditionMatches != null) {
        multiplierDesc = conditionMatches[1];
    }

    if(multiplierDesc != null) {
        if(calcFunctionsByMultiplier[multiplierDesc] == undefined) {
            logger.log("Error: No calc function found for damage multiplier: '" + multiplierDesc + "'");
        }
        else {
            dmgMultiplier = calcFunctionsByMultiplier[multiplierDesc]();
        }
    }
    return dmgMultiplier;
}

function getTargetAlignment(dmgStats) {
    var damageTarget = dmgStats.target;
    if(damageTarget.startsWith("it") && dmgStats.condition != undefined && dmgStats.condition != "") {
        if(dmgStats.condition.includes("ally") || dmgStats.condition.includes("allied")) {
            return "ally";
        }
        else {
            return "enemy";
        }
    }

    if(damageTarget.startsWith("your")) {
        return "ally";
    }
    else if(damageTarget.startsWith("anything")) {
        return "enemy";
    }
    else {
        var regex = /\w+ (.*)/;
        var matches = regex.exec(damageTarget);
        if(matches == null) return "neutral";
        var allyWords = ["ally", "allied"];
        if(startsWithOneOf(matches[1], allyWords)) {
            return "ally";
        }

        var enemyWords = ["enemy", "enemies"];
        if(startsWithOneOf(matches[1], enemyWords)) {
            return "enemy";
        }

        return "neutral";
    }
}

function startsWithOneOf(str, startingWords) {
    var i;
    for (i = 0; i < startingWords.length; i++) {
        if(str.startsWith(startingWords[i])) {
            return true;
        }
    }
    return false;
}

module.exports = {
    getDirectDamageStatValue
};