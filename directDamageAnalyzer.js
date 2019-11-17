const logger = require('electron-log');

function getDirectDamageStatValue(card) {
    var damageStatValue = 0;
    if(cardDealsDirectDamage(card)) {
        var dmgStats = getDamageStats(card);
        if(isSingleTarget(dmgStats.target)) {
            damageStatValue = dmgStats.amount;
        }
        else {
            damageStatValue = dmgStats.amount * getNumTargets(dmgStats.target);
        }

        if(isAllyTarget(dmgStats.target)) {
            damageStatValue *= -1;
        }
    }
    else {
        damageStatValue = 0;
    }

    logger.log("Direct damage stat value = " + damageStatValue);
    return damageStatValue;
}

function cardDealsDirectDamage(card) {
    return card.descriptionRaw.search(/Deal \d+/) != -1;
}

function getDamageStats(card) {
    var regex = /Deal (\d+) to (.+?)[\.,]/;
    var matches = regex.exec(card.descriptionRaw);
    return {amount:matches[1], target:matches[2]};
}

function isSingleTarget(damageTarget) {
    var singleTargetWords = ["the", "your", "an", "anything"];
    return startsWithOneOf(damageTarget, singleTargetWords);
}

function isAllyTarget(damageTarget) {
    if(damageTarget.startsWith("your")) {
        return true;
    }
    else {
        var regex = /\w+ (.*)/;
        var matches = regex.exec(damageTarget);
        if(matches == null) return false;
        var allyWords = ["ally", "allied"];
        return startsWithOneOf(matches[1], allyWords);
    }
}

function getNumTargets(damageTarget) {
    if(damageTarget.toLowerCase().includes("nexus") || damageTarget.startsWith("two")) {
        return 2;
    }

    //at this point we are probably targeting all enemy or all ally units
    return 3; //TODO: confirm this number / stratgey
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