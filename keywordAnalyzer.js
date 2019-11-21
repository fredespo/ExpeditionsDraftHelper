const logger = require('electron-log');

var calcFunctionsByKeyword = {
    "Can't Block": function(card) {return -1 * (card.attack + card.health)/2},
    "Quick Attack": function(card) {return card.attack * 0.5},
    "Barrier": function(card) {return 2},
    "Regeneration": function(card) {return card.health},
    "Overwhelm": function(card) {return card.attack * 0.5},
    "Fearsome": function(card) {return card.health > 3? card.attack*0.8 : 1},
    "Elusive": function(card) {return card.attack * 0.5},
    "Challenger": function(card) {return card.attack * 0.5},
    "Lifesteal": function(card) {return (card.attack*0.4 + card.health*0.6)},
    "Tough": function(card) {return card.health/3},
    "Double Attack": function(card) {return card.attack},
    "Ephemeral": function(card) {return card.cost*0.3}
};

function getKeywordsValue(card){
    logger.log("getting keywords value");
    var keywordsValue = 0;
    var keywords = card.keywords;
    keywords.forEach(keyword => {
        if(calcFunctionsByKeyword[keyword] != null) {
            keywordsValue += parseFloat(calcFunctionsByKeyword[keyword](card));
        }
        else {
            logger.log("Warning: Calc function for keyword '" + keyword + "' is not defined.");
        }
    });
    return keywordsValue; 
}

module.exports = {
    getKeywordsValue
};