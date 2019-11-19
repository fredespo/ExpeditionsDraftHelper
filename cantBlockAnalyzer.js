const logger = require('electron-log');

function getCantBlock(card){
    var keywordRefs = card.keywordRefs;
    keywordRefs.forEach(keyword =>{
        var tempWord = keyword.toLowerCase();
        if (keyword.includes('cantblock')) return true;
        else return false;
    });
}



module.exports = {
    getCantBlock
};