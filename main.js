// Modules to control application life and create native browser window
const {app, BrowserWindow} = require('electron');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
//import cpp code
const addon = require('./build/Release/addon');

const endpoints = require('./Endpoints.js');
//print top window title 5 seconds
setInterval(function(){ 
    getExpeditionsState();
}, 10000);

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let overlayWindow;

function createWindow () {

    createOverlay();

    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 400,
        height: 300,
        frame: false,
        transparent: true,
        titleBarStyle: 'hidden',
        backgroundColor: '#FFF',
        overlay: overlayWindow,
        webPreferences: {
            nodeIntegration: true
        }
    });

    // and load the index.html of the app.
    mainWindow.loadFile('index.html');

    // Open the DevTools.
    // mainWindow.webContents.openDevTools();

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
        overlayWindow.close();
        overlayWindow = null;
    });
}

function createOverlay() {
    // Create the overlay window.
    overlayWindow = new BrowserWindow({
        width: 800,
        height: 600,
        frame: false,
        fullscreen: true,
        transparent: true,
        alwaysOnTop: true,

        webPreferences: {
            nodeIntegration: true
        }
    });
    
    overlayWindow.setSkipTaskbar(true);
    overlayWindow.setIgnoreMouseEvents(true);
    overlayWindow.loadFile('overlay.html');
    overlayWindow.setOpacity(0);
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

class CardRect {
    constructor(CardID, CardCode, TopLeftX, TopLeftY, Width, Height, LocalPlayer){
        this.CardID = CardID;
        this.CardCode = CardCode;
        this.TopLeftX = TopLeftX;
        this.TopLeftY = TopLeftY;
        this.Width = Width;
        this.Height = Height;
        this.LocalPlayer = LocalPlayer;
    }
}

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
        });
    }
    request.send();
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
