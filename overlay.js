const remote = require('electron').remote;
var windowInfo = require('bindings')('getTopWindowInfo');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const logger = require('electron-log');
var overlayWindow = remote.getCurrentWindow();
var jsonDataDragon = require('./set1-en_us.json');
var cardCache = {};
var lorWindow = {
    xPos:0,
    yPos:0,
    width:0,
    height:0
};

// When document has loaded, initialise
document.onreadystatechange = () => {
    if (document.readyState == "complete") {
        createCardCache();
        runOverlayWindow();
    }
};

function createCardCache() {
    jsonDataDragon.forEach(card => cardCache[card.cardCode] = card);
    logger.log('created card cache');
}

function runOverlayWindow() {
    setInterval(function(){
        if(isOverlayEnabled() && isLorActive()) {
            overlayWindow.setOpacity(1);
            overlayWindow.setPosition(lorWindow.xPos, lorWindow.yPos);
            overlayWindow.setSize(lorWindow.width, lorWindow.height);
            logger.log('getting expedition state');
            getExpeditionsState(cardCache);
        }
        else {
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
            var y = overlayWindow.getBounds().height - rect.TopLeftY;
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

function isOverlayEnabled() {
    var overlayEnabled = localStorage.getItem('overlayEnabled');
    logger.log("overlayEnabled = " + overlayEnabled);
    return overlayEnabled == 'true';
}

function isLorActive() {
    var topWindowInfo = windowInfo.getTopWindowInfo().split(";");
    logger.log("topWindowInfo = " + topWindowInfo);
    if(topWindowInfo[0] == "Legends of Runeterra") {
        logger.log("LoR detected!");
        lorWindow.xPos = parseInt(topWindowInfo[1]);
        lorWindow.yPos = parseInt(topWindowInfo[2]);
        lorWindow.width = parseInt(topWindowInfo[3]);
        lorWindow.height = parseInt(topWindowInfo[4]);
        return true;
    }
    else {
        return false;
    }
}