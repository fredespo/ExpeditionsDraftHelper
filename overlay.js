const remote = require('electron').remote;
var windowInfo = require('bindings')('getTopWindowInfo');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const logger = require('electron-log');
var overlayWindow = remote.getCurrentWindow();
var jsonDataDragon = require('./set1-en_us.json');
let cardAnalyzer = require("./cardAnalyzer.js");
var cardCache = {};
var synergyMap;
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
    synergyMap = {};
    synergyMap.deckSize = 0;
    logger.log('created card cache');
}

function runOverlayWindow() {
    setInterval(function(){
        if(isOverlayEnabled() && isLorActive()) {
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

function getPositionalRectangles(cardCache, synergyMap){
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
        var overlayHeight = overlayWindow.getBounds().height;
        Object.values(rectangles).forEach(rect=>{
            var cardID = rect.CardID;
            var cardCode = rect.CardCode;
            var x = rect.TopLeftX;
            var y = overlayHeight - rect.TopLeftY;
            logger.log('cardCode= ' + cardCode);
            logger.log('x= ' + x);
            logger.log('y= ' + y);
            var synergyCount = 0;

            if (synergyMap[cardCode] != null){
                synergyCount = synergyMap[cardCode];
            }

            logger.log('synergyCount=' + synergyCount);
            //call function to create overlay at these points
            //use cardcode and x/y coordinates to position
            //remove if block to also show values on cards in deck
            if (x > 300){
                var cardValue = findCardValue(cardCode, cardCache);
                displayCardValue(cardValue, x, y);
            }
        });
    }
    request.send();
}

function displayCardValue(cardValue, x, y){
    var icon = document.createElement("IMG");
    icon.setAttribute("src","./res/background.png");
    //icon.setAttribute(width, "40");
    //icon.setAttribute(height, "40");
    icon.className = "cardvalue";
    icon.style.position = "absolute";
    icon.style.left = (x - 10) + "px";
    icon.style.top = (y - 5) + "px";
    document.body.appendChild(icon);

    var cardValueDisp = document.createElement("span");
    cardValueDisp.innerHTML = cardValue;
    cardValueDisp.className = "cardvalue";
    cardValueDisp.style.position = "absolute";
    cardValueDisp.style.left = x + "px";
    cardValueDisp.style.top = y + "px";
    document.body.appendChild(cardValueDisp);
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
    cardAnalyzer.setBaseValueIfNotSet(card);
    return card.baseValue;
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
        var deck = json.Deck;
        logger.log(json);
        logger.log('state: ' + state);
        logger.log('isActive: ' + isActive);
        if (isActive == true && (state == 'Picking' || state == 'Swapping')){
            synergyMap = getSynergyMap(cardCache, deck);
            logger.log(synergyMap);
            getPositionalRectangles(cardCache, synergyMap);
            overlayWindow.setOpacity(1);
        }
        else {
            overlayWindow.setOpacity(0);
        }
    }
    request.send();
}

function getSynergyMap(cardCache, deck){
    logger.log('getting synergies for cards in deck');
    if (deck.length == synergyMap.deckSize) return synergyMap;
    deck.forEach(card =>{
        var cardData = cardCache[card];
        var associatedCards = cardData.associatedCardRefs;
        associatedCards.forEach(associatedCard =>{
            if (synergyMap[associatedCard] == null){
                synergyMap[associatedCard] = 1;
            }
            else {
                synergyMap[associatedCard]++;
            }
        });
    });
    return synergyMap;
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