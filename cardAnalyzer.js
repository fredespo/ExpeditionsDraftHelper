function setBaseValueIfNotSet(card) {
    if(card.baseValue == undefined) {
        card.baseValue = calcBaseValue(card);
    }
}

function calcBaseValue(card) {
    var totalStatValue = 0;
    totalStatValue += card.attack;
    totalStatValue += card.health;

    var baseValue = totalStatValue / (card.cost + 1);
    baseValue = Math.round(baseValue * 10);
    return baseValue;
}

module.exports = {
    setBaseValueIfNotSet
};