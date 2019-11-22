const remote = require('electron').remote;
var fs = require('fs');
var windowInfo = require('bindings')('getTopWindowInfo');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const logger = require('electron-log');
var overlayWindow = remote.getCurrentWindow();
var jsonDataDragon = require('./set1-en_us.json');
var manualScores = require('./res/manualScores.json');
let cardAnalyzer = require("./cardAnalyzer.js");
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
    manualScores.forEach(scoredCard => cardCache[scoredCard.cardCode].baseValue = scoredCard.score);
}

function runOverlayWindow() {
    setInterval(function(){
        if(isOverlayEnabled() && isLorActive()) {
            overlayWindow.setPosition(lorWindow.xPos, lorWindow.yPos);
            overlayWindow.setSize(lorWindow.width, lorWindow.height);
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
    request.open('GET', call, true);
    request.onload = function() {
        var res = request.responseText;
        var json = JSON.parse(res);
        var gameState = json.GameState;

        var rectangles = json.Rectangles;
        eraseCardValues();
        var overlayHeight = overlayWindow.getBounds().height;
        Object.values(rectangles).forEach(rect=>{
            var cardID = rect.CardID;
            var cardCode = rect.CardCode;
            var x = rect.TopLeftX;
            var y = overlayHeight - rect.TopLeftY;

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
    card = cardCache[cardCode];
    
    cardAnalyzer.setBaseValueIfNotSet(card);
    return card.baseValue;
}



function getExpeditionsState(cardCache){
    var request = new XMLHttpRequest();
    var call = 'http://localhost:' + 21337 + '/expeditions-state';
    request.open('GET', call, true);
    request.onload = function() {
        var res = request.responseText;
        var json = JSON.parse(res);
        var isActive = json.IsActive;
        var state = json.State;
        var deck = json.Deck;
        if (isActive == true && (state == 'Picking' || state == 'Swapping')){
            getPositionalRectangles(cardCache);
            overlayWindow.setOpacity(1);
        }
        else {
            overlayWindow.setOpacity(0);
        }
    }
    request.send();
}


function isOverlayEnabled() {
    var overlayEnabled = localStorage.getItem('overlayEnabled');
    return overlayEnabled == 'true';
}

function isLorActive() {
    var topWindowInfo = windowInfo.getTopWindowInfo().split(";");
    if(topWindowInfo[0] == "Legends of Runeterra") {
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