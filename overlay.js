// API CALLS 

var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const logger = require('electron-log');

function getPositionalRectangles(cardCache){
    var request = new XMLHttpRequest();
    var call = 'http://localhost:' + 21337 + '/positional-rectangles';
    logger.log(call);
    request.open('GET', call, true);
    request.onload = function() {
        logger.log(request.status);
        var res = request.responseText;
        var json = JSON.parse(res);
        var gameState = json.GameState;
        logger.log(gameState);

        var rectangles = json.Rectangles;
        Object.values(rectangles).forEach(rect=>{
            var cardID = rect.CardID;
            var cardCode = rect.CardCode;
            var x = rect.TopLeftX;
            var y = rect.TopLeftY;
            logger.log('cardCode= ' + cardCode);
            logger.log('x= ' + x);
            logger.log('y= ' + y);
            //call function to create overlay at these points
            //use cardcode and x/y coordinates to position
            var cardValue = findCardValue(cardCode, cardCache);
            displayCardValue(cardValue, x, y);
        });
    }
    request.send();
}

function displayCardValue(cardValue, x, y){
    logger.log('attempting to display card value and position');
    var htmlStr = '<h2 class="card" style="top:';
    htmlStr += x;
    htmlStr += ';left:';
    htmlStr += y;
    htmlStr += '">';
    htmlStr += cardValue;
    htmlStr += '</h2>';
    document.body.innerHTML = htmlStr;
}
function findCardValue(cardCode, cardCache){
    logger.log('trying to find card value');
    card = cardCache[cardCode];
    
    logger.log(card.name);
    var atk = card.attack;
    var hp = card.health;
    var manaCost = card.cost;
    var cardValue = atk + hp - manaCost;
    logger.log(card.name + ' value is ' + (cardValue))
    return cardValue;
}



function getExpeditionsState(cardCache){
    var request = new XMLHttpRequest();
    var call = 'http://localhost:' + 21337 + '/expeditions-state';
    console.log(call);
    request.open('GET', call, true);
    request.onload = function() {
        console.log(request.status);
        var res = request.responseText;
        var json = JSON.parse(res);
        var isActive = json.IsActive;
        var state = json.State;
        console.log(json);
        console.log('state: ' + state);
        console.log('isActive: ' + isActive);
        if (isActive == true && state == 'Picking'){
            getPositionalRectangles(cardCache);
        }
    }
    request.send();
}