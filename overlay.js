const remote = require('electron').remote;
var fs = require('fs');
var windowInfo = require('bindings')('getTopWindowInfo');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const logger = require('electron-log');
var overlayWindow = remote.getCurrentWindow();
var jsonDataDragon = require('./set1-en_us.json');
var cardCache = {};

// When document has loaded, initialise
document.onreadystatechange = () => {
    if (document.readyState == "complete") {
        createCardCache();
        runOverlayWindow();
    }
};

function getTopWindowInfo() {
    return windowInfo.getTopWindowInfo().split(";");
}

function createCardCache() {
    jsonDataDragon.forEach(card => cardCache[card.cardCode] = card);
    logger.log('created card cache');
}

function runOverlayWindow() {
    setInterval(function(){
        var topWindowInfo;
        var  overlayEnabled = localStorage.getItem('overlayEnabled');

        if(overlayEnabled != null && overlayEnabled == 'true') {
            logger.log('overlay is enabled');
            topWindowInfo = getTopWindowInfo();
            if(topWindowInfo[0].includes("Legends of Runeterra")) {
                overlayWindow.setOpacity(1);
                overlayWindow.setPosition(parseInt(topWindowInfo[1]), parseInt(topWindowInfo[2]));
                overlayWindow.setSize(parseInt(topWindowInfo[3]), parseInt(topWindowInfo[4]));
                logger.log('getting expedition state');
                getExpeditionsState(cardCache);
            }
            else {
                overlayWindow.setOpacity(0);
            }
        }
        else {
            logger.log('overlay is not enabled dont show overlay');
            overlayWindow.setOpacity(0);
        }
    }, 1000);
}

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
        eraseCardValues();
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
    var spanTag = document.createElement("span");
    spanTag.innerHTML = cardValue;
    spanTag.className = "cardvalue";
    spanTag.style.position = "absolute";
    spanTag.style.left = x + "px";
    spanTag.style.top = y + "px";
    document.body.appendChild(spanTag);
}

function eraseCardValues() {
    var elements = document.getElementsByClassName("cardvalue");
    while(elements.length > 0){
        elements[0].parentNode.removeChild(elements[0]);
    }
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
    logger.log(call);
    request.open('GET', call, true);
    request.onload = function() {
        logger.log(request.status);
        var res = request.responseText;
        var json = JSON.parse(res);
        var isActive = json.IsActive;
        var state = json.State;
        logger.log(json);
        logger.log('state: ' + state);
        logger.log('isActive: ' + isActive);
        if (isActive == true && state == 'Picking'){
            getPositionalRectangles(cardCache);
        }
        else {
            eraseCardValues();
        }
    }
    request.send();
}