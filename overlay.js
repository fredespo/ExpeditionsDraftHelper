// API CALLS 

var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

function getPositionalRectangles(){
    var request = new XMLHttpRequest();
    var call = 'http://localhost:' + 21337 + '/positional-rectangles';
    console.log(call);
    request.open('GET', call, true);
    request.onload = function() {
        console.log(request.status);
        var res = request.responseText;
        var json = JSON.parse(res);
        var gameState = json.GameState;
        console.log(gameState);

        var rectangles = json.Rectangles;
        Object.values(rectangles).forEach(rect=>{
            var cardID = rect.CardID;
            var cardCode = rect.CardCode;
            var x = rect.TopLeftX;
            var y = rect.TopLeftY;
            console.log('cardCode= ' + cardCode);
            console.log('x= ' + x);
            console.log('y= ' + y);
            //call function to create overlay at these points
            //use cardcode and x/y coordinates to position
            var cardValue = findCardValue(cardCode);
        });
    }
    request.send();
}

function findCardValue(cardCode){
    return 0;
}




function getExpeditionsState(){
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
            getPositionalRectangles();
        }
    }
    request.send();
}