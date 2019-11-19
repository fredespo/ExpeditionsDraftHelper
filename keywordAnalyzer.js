const logger = require('electron-log');

var calcFunctionsByKeyword = {
    "Can't Block": getCantBlockValue
};

function getKeywordsValue(card){
    logger.log("getting keywords value");
    var keywordsValue = 0;
    var keywords = card.keywords;
    keywords.forEach(keyword => {
        if(calcFunctionsByKeyword[keyword] != null) {
            keywordsValue += parseInt(calcFunctionsByKeyword[keyword](card));
        }
        else {
            logger.log("Warning: Calc function for keyword '" + keyword + "' is not defined.");
        }
    });
    return keywordsValue; 
}

function getCantBlockValue(card) {
    return (-1 * (card.attack + card.health)/2);
}

module.exports = {
    getKeywordsValue
};