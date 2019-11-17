function setBaseValueIfNotSet(card) {
    if(card.baseValue == undefined) {
        card.baseValue = calcBaseValue(card);
    }
}

function calcBaseValue(card) {
    var baseValue = (card.attack + card.health) / card.cost;
    baseValue = Math.round(baseValue * 10);
    return baseValue;
}

module.exports = {
    setBaseValueIfNotSet
};